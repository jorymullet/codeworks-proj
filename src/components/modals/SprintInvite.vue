<script>
import ProSelect from '$common/ProSelect'
export default {
  name: 'SprintInvite',
  components: {
    'pro-select': ProSelect,
  },
  props: {
    options: Object,
  },
  data() {
    return {
      users: null,
      form: {
        user_ids: [],
      },
      formOptions: {
        user_ids: {
          errorIf: ids => ids && ids.length ? '' : 'Select at least one user'
        },
      },
    }
  },
  computed: {
    userOptions () {
      if (!(this.users && this.users.length)) return []

      return this.$clone(this.users)
        .sort((a, b) => a.first_name.localeCompare(b.first_name))
        .filter(u => u.id !== this.user.id)
        .map(u => ({
          name: `<div style='display:flex;align-items:center;'><img style='height:1rem;width:1rem;margin-right:.5rem;border-radius:1rem;' src='${u.photo_url}'>${u.first_name} ${u.last_name}</div>`,
          value: u.id,
        }))
    },
    user () {
      return this.$store.state.user
    },
    org () {
      return this.$store.state.org
    },
    sprint () {
      return this.options.sprint
    },
  },
  methods: {
    async getUsers () {
      this.users = this.$fire.qs
        .toArray(await this.$firestore.collection('users').where('org_id', '==', this.org.id).get())
    },
    async invite () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast(e))

      this.$showLoading()

      try {
        await this.$HTTP({
          method: 'post',
          uri: `sprints/${this.sprint.id}/invites`,
          body: {
            users: this.form.user_ids.map(uid => this.users.find(u => u.id === uid)),
            origin: location.origin,
          }
        })
        this.$toast('Users have been invited!')
        this.$modals.hide('sprint-invite')
        this.options.onSuccess && this.options.onSuccess()
      } catch (err) {
        console.error(err)
        const message = (err && err.body && err.body.message) || 'Could not invite users'
        this.$toast(message)
      } finally {
        this.$hideLoading()
      }
    },
  },
  mounted () {
    this.getUsers()
  },
}
</script>

<template lang="pug">
  #sprint-invite-main.modal-main
    .sprint-invite-container.modal-container
      .title Invite Users to Sprint
      .content
        .pro-form
          .form-row
            pro-select(
              :multiple='true'
              v-model='form.user_ids'
              :options='userOptions'
              title='Users to invite'
              :disabled='!users'
            )
      .action
        .button.cancel(
          @click='$modals.hide("sprint-invite")'
        ) Cancel
        .button.major(
          @click='invite'
        ) Invite

</template>

<style lang="sass" scoped>
  #sprint-invite-main
    width: calc(100% - 4rem)
    max-width: 22rem
    .sprint-invite-container
      .content
        height: 80vh
</style>