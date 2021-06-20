<script>
import * as qs from 'qs'
import ProInput from '$common/ProInput'
import {decideFontColor} from '@/global/js/color.js'

export default {
  name: 'Invite',
  components: {
    'pro-input': ProInput,
  },
  watch: {
    'form.first_name' (name) {
      if (name !== 'wowz') return

      this.form.first_name = 'Joshua'
      this.form.last_name = 'Mullet'
      // this.form.password = 'password'
      // this.form.password_repeat = 'password'

    },
  },
  data () {
    return {
      invite: null,
      mode: 'LOADING', // options: ['LOADING', 'ERROR', 'INPUT', 'PENDING', 'ACCEPTED', 'DENIED']
      photoFile: null,
      form: {
        first_name: '',
        last_name: '',
        photo_url: '',
      },
      formOptions: {
        first_name: {
          title: 'First Name',
          errorIf: val => val ? '' : 'Enter first name',
        },
        last_name: {
          title: 'Last Name',
          errorIf: val => val ? '' : 'Enter last name',
        },
        photo_url: {
          errorIf: _ => this.photoFile ? '' : 'Choose profile picture'
        },
      },
    }
  },
  computed: {
    standardFields () {
      return Object.keys(this.formOptions).filter(field => field !== 'photo_url')
    },
    inviteId () {
      return this.$route.params.inviteId
    },
    rolePhrase () {
      if (!this.invite) return ''

      return {
        ADMIN: 'an admin',
        MEMBER: 'a member',
      }[this.invite.role]
    },
  },
  methods: {
    async retrieveInvite () {
      try {
        this.invite = (await this.$firestore.doc(`invites/${this.inviteId}`).get()).data()
      } catch (err) {
        console.error(err)
        this.mode = 'ERROR'
        return
      }

      console.log(this.invite)

      if (!this.invite) {
        this.mode = 'ERROR'
        return
      }

      if (this.invite.type === 'ORG_INDIVIDUAL') {
        this.mode = this.invite.status
      } else if (this.invite.type === 'ORG_MASS') {
        this.mode = 'PENDING'
      }
      this.form.email = this.invite.email
      this.$store.commit('update', {org: this.invite.org})
    },
    async onDeny () {
      if (!confirm('Press OK if you are sure want to DENY this invite.')) return

      if (this.invite.type === 'ORG_INDIVIDUAL') {
        this.mode = 'LOADING'

        try {
          await this.$firestore.doc(`invites/${this.inviteId}`).update({status: 'DENIED'})
          this.mode = 'DENIED'
        } catch (err) {
          console.error(err)
          this.mode = 'ERROR'
        }
      } else if (this.invite.type === 'ORG_MASS') {
        this.mode = 'DENIED'
      }

    },
    async onAccept () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(err => this.$toast(err))


      this.mode = 'LOADING'

      // need random id to store image in storage
      const randomId = this.$firestore.collection('fake').doc().id

      try {
        const extension = this.$fileTypeToExtension(this.photoFile.type)
        const ref = this.$storage.ref().child(`images/users/${randomId}/profile${extension}`)
        await ref.put(this.photoFile)
        const photoUrl = await ref.getDownloadURL()
        this.form.photo_url = photoUrl
      } catch (err) {
        console.error(err)
        this.mode = 'ERROR'
        return
      }

      this.form.invite_id = this.inviteId

      this.$cookies.set('invanti-pending-user', this.form)
      this.$cookies.remove('invanti-created-user')

      const queryObj = {
        client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
        redirect_uri: `${location.origin}/login`,
        scope: 'openid profile email picture',
        response_type: 'code',
        prompt_type: 'signUp',
        page_background: '#fff',
        primary_color: this.invite.org.brand_colors.primary,
        foreground_color: decideFontColor(this.invite.org.brand_colors.primary),
        sign_up_title: `Complete Sign-up for ${this.invite.org.studio_name}`,
        logo_url: this.invite.org.logos.square,
      }

      const query = qs.stringify(queryObj)
      const url = `https://${process.env.VUE_APP_AUTH0_DOMAIN}/authorize/?${query}`
      window.location = url
    },
    onPhotoSelect () {
      this.$chooseFile({
        accept: 'image/x-png,image/gif,image/jpeg',
      }).then(file => {
        this.photoFile = file
      })
    },
  },
  mounted () {
    this.retrieveInvite()
  },
}
</script>

<template lang="pug">
  #invite-main.public-main
    .invite-container.public-container
      .content.card
        transition(
          mode='out-in'
          name='fade'
        )
          .loading-holder(
            v-if='mode === "LOADING"'
            key='loading'
          )
            img(
              src='@/assets/svg/infiniti.svg'
            )
          .invite.error(
            v-else-if='mode === "ERROR"'
            key='error'
          )
            i.material-icons.error warning
            .prompt An error has a occured.
            .instruction Please go back to the invite email you received and click on the link again.
          .invite.denied(
            v-else-if='mode === "DENIED"'
            key='denied'
          )
            i.material-icons.denied do_not_disturb
            .prompt You have denied this invite.
            .instruction If you feel this is a mistake, please contact support.
          .invite.accepted(
            v-else-if='mode === "ACCEPTED"'
            key='accepted'
          )
            i.material-icons download_done
            .prompt Invite accepted!
            router-link.pro-button.major.login(
              :to='{name: "Login"}'
            ) Go to login
            //.instruction If you feel this is a mistake, please contact support.
          .invite.pending(
            v-else-if='mode === "PENDING"'
            key='pending'
          )
            i.material-icons people
            .prompt Would you like to join {{invite.org.name}} as {{rolePhrase}}?
            .action
              .pro-button.minor(
                @click='onDeny()'
              ) Deny
              .pro-button.major(
                @click='mode = "INPUT"'
              ) Accept
          .invite.input(
            v-else-if='mode === "INPUT"'
            key='input'
          )
            i.material-icons assignment
            .prompt Tell us about yourself
            .pro-form
              .form-row(
                v-for='field in standardFields'
              )
                pro-input(
                  v-model='form[field]'
                  :options='formOptions[field]'
                )
              .form-row.small
                .pro-button.major(
                  @click='onPhotoSelect'
                ) Choose profile picture
              .instruction(
                v-if='!photoFile'
              ) Choose a small, square photo for your profile picture.
              .instruction.dotdotdot(
                v-else
              ) Image: {{photoFile.name}}
            .action
              .pro-button.minor(
                @click='mode = "PENDING"'
              ) Go back
              .pro-button.major(
                @click='onAccept'
              ) Next


</template>

<style lang="sass" scoped>
  @import '$styles/transitions'
  #invite-main
    .invite-container
      .content
        width: 100%
        max-width: 20rem
        display: grid 
        justify-items: center
        .invite
          width: 100%
          padding: 0 1rem
          display: grid
          > i
            font-size: 34px
            text-align: center
            display: block
            margin-bottom: 1rem
            color: $orange
            &.error
          .prompt
            @extend .font-1-bold
            text-align: center
            font-size: 20px
          .instruction
            &.dotdotdot
              max-width: 15rem
          .pro-form
            margin-top: 2rem
          .login
            justify-self: center
            margin-top: 2rem
          .action
            margin-top: 2rem
            display: grid
            grid-template-columns: max-content max-content
            grid-column-gap: 1rem
            justify-self: center

</style>