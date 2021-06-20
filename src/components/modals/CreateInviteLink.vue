<script>
export default {
  name: 'CreateInviteLink',
  props: {
    options: Object,
  },
  data() {
    return {
      inviteLink: null,
      invite: null,
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    invitesRef () {
      return this.$firestore.collection('invites')
    },
  },
  methods: {
    createInvite () {
      const inviteId = this.invitesRef.doc().id
      this.invite = {
        id: inviteId,
        created_at: Date.now(),
        created_by: this.user.id,
        org: this.options.org,
        type: 'ORG_MASS',
        role: 'MEMBER',
      }
      this.inviteLink = `${location.origin}/invites/${inviteId}`

    },
    async saveInvite () {
      try {
        await this.invitesRef.doc(this.invite.id).set(this.invite)
      } catch (err) {
        console.error(err)
        this.$modals.hide('create-invite-link')
        this.$toast('Could not create invite link.')
      }
    },
    copy (e) {
      this.$copyToClipboard(this.inviteLink)
      this.$toast({
        copy: 'Link copied',
        beneathTarget: e.target,
        time: 1000,
      })
      this.$modals.hide('create-invite-link')
      this.saveInvite()
    },
  },
  mounted () {
    this.createInvite()
  },
}
</script>

<template lang="pug">
  #create-invite-link-main.modal-main
    .create-invite-link-container.modal-container
      .title Invite Link
      .content
        .link-area
          .info Anyone with this link will be able to sign up as a member into your studio.
          .card(
            @click='copy'
          )
            .icon
              i.material-icons copy_all
            span Click to copy link
      //.action
        .button.cancel(
          @click='$modals.hide("create-invite-link")'
        ) Cancel
</template>

<style lang="sass" scoped>
  #create-invite-link-main
    .create-invite-link-container
      .content
        .link-area
          .info
            margin-bottom: 1rem
          .card
            cursor: pointer
            display: grid
            grid-template-columns: min-content auto
            column-gap: 1rem
            align-items: center
            font-weight: bold
            border-radius: 1rem
            width: fit-content
            margin: 0 auto
            padding: 1rem



</style>