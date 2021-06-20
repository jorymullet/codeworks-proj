<script>
import ProSelect from '$common/ProSelect'
export default {
  name: 'JoinSprint',
  components: {
    'pro-select': ProSelect,
  },
  props: {
    options: Object,
  },
  data() {
    return {
      form: {
        project_id: null,
      },
      formOptions: {
        project_id: {
          errorIf: val => val ? '' : 'Select a project',
        },
      },
    }
  },
  computed: {
    projects () {
      return this.$store.state.userProjects
    },
    projectOptions () {
      if (!(this.projects && this.projects.length)) return []

      let projects = this.$clone(this.projects)
      const filter = this.sprint.type.filter
      if (filter) {
        try {
          projects = projects.filter(eval(filter))
        } catch (err) {console.log('Invalid filter', err)}
      }
      return projects.map(p => ({name: p.name, value: p.id,}))
    },
    sprint () {
      return this.options.sprint
    },
    user () {
      return this.$store.state.user
    },
    sprintMemberRef () {
      return this.$firestore.doc(`sprints/${this.sprint.id}/sprint_members/${this.user.id}`)
    },
  },
  methods: {
    async save () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast(e))

      this.$showLoading()

      if (this.options.isNew) {
        try {
          await this.$HTTP({
            method: 'put',
            uri: `sprints/${this.sprint.id}/users/${this.user.id}`,
          })
        } catch (err) {
          console.error(err)
          let message = 'Could not join sprint.'
          if (err && err.body && err.body.message) {
            message = err.body.message
          }
          this.$hideLoading()
          return this.$toast(message)
        }
      }

      const sprintMember = {
        id: this.user.id,
        ...this.form,
      }
    
      try {
        await this.sprintMemberRef.set(sprintMember)
        this.$toast(this.options.isNew ? 'Joined!' : 'Saved!')
        this.$modals.hide('join-sprint')
        this.options.onSuccess && this.options.onSuccess()
      } catch (err) {
        console.error(err)
        this.$toast('Added to circle space but could not add to database.')
      } finally {
        this.$hideLoading()
      }
    },
    async leave () {
      if (!confirm('Press OK if you are sure you want to leave this sprint.')) return

      this.$showLoading()

      try {
        await this.$HTTP({
          method: 'delete',
          uri: `sprints/${this.sprint.id}/users/${this.user.id}`,
        })
      } catch (err) {
        console.error(err)
        let message = 'Could not leave sprint in Cirlce.'
        if (err && err.body && err.body.message) {
          message = err.body.message
        }
        this.$hideLoading()
        return this.$toast(message)
      }
    
      try {
        await this.sprintMemberRef.delete()
        this.$toast('Left sprint.')
        this.$modals.hide('join-sprint')
        this.options.onSuccess && this.options.onSuccess()
      } catch (err) {
        console.error(err)
        this.$toast('Added to circle space but could not add to database.')
      } finally {
        this.$hideLoading()
      }
    },
    async prefillForm () {
      if (this.options.isNew) return

      const sprintMember = (await this.sprintMemberRef.get()).data()
      if (!sprintMember) return this.$toast('Could not retrieve sprint member.')

      this.form.project_id = sprintMember.project_id
    },
  },
  mounted () {
    this.prefillForm()
  },
}
</script>

<template lang="pug">
  #join-sprint-main.modal-main
    .join-sprint-container.modal-container
      .title Join Sprint
      .content
        .sprint.card
          .name {{sprint.name}}
          .date {{$getSprintDatesString(sprint)}}
        .instruction Choose a project with which to join this sprint.
        .pro-form
          .form-row
            pro-select(
              title='Projects'
              :options='projectOptions'
              v-model='form.project_id'
            )
      .action
        .button.cancel(
          @click='$modals.hide("join-sprint")'
        ) Cancel
        .button.delete(
          @click='leave'
          v-if='!options.isNew'
        ) Leave sprint
        .button.major(
          @click='save'
        ) {{options.isNew ? 'Join' : 'Save'}}
</template>

<style lang="sass" scoped>
  #join-sprint-main
    .join-sprint-container
      .content
        .sprint
          padding: 1rem
          .date
            margin-top: .5rem
            color: #888
            font-size: 12px
        .pro-form
          margin-top: 2rem
</style>