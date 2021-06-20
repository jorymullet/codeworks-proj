<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
export default {
  name: 'InviteUser',
  components: {
    'pro-input': ProInput,
    'pro-select': ProSelect,
  },
  props: {
    options: {
      required: true,
    },
  },
  data () {
    return {
      form: {
        email: '',
        role: '',
      },
      formOptions: {
        email: {
          title: 'Email of invitee',
          errorIf: val => this.$regex.is(val).an('email') ? '' : 'Please input valid email',
          type: 'email',
        },
        role: {
          errorIf: val => val ? '' : 'Please select role',
        },
      },
      loading: false,
    }
  },
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  methods: {
    async onInvite () {
      if (this.loading) return this.$toast('Already sending...')

      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(err => this.$toast(err))

      this.loading = true
      try {
        await this.$HTTP({
          method: 'post',
          uri: 'invites',
          body: {
            ...this.form,
            inviter: this.user,
            origin: location.origin,
            org: this.options.org,
          },
        })
        this.$toast('Invite sent!')
        this.$modals.hide('invite-user')
        this.options.onSuccess && this.options.onSuccess()
      } catch (err) {
        console.error(err)
        this.$toast('Could not send invite.')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template lang="pug">
  #invite-user-main.modal-main
    .invite-user-container.modal-container
      .title Invite User to {{options.org.name}}
      .content
        .pro-form
          .form-row
            pro-input(
              v-model='form.email'
              :options='formOptions.email'
            )
          .form-select
            pro-select(
              v-model='form.role'
              :options='["ADMIN", "MEMBER"].map(type => ({value: type, name: type}))'
              title='Role'
            )
      .action
        .button.cancel(
          @click='$modals.hide("invite-user")'
        ) Cancel
        .button(
          @click='onInvite'
        ) {{loading ? 'Loading...' : 'Invite'}}
</template>

<style lang="sass" scoped>
  #invite-user-main
    .invite-user-container
      .content
        .pro-form
          margin-top: 1rem
</style>