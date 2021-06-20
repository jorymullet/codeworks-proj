<script>
import AddButton from '$common/AddButton'
import ProgressesLog from '$common/ProgressesLog'
export default {
  name: 'MemberProgresses',
  components: {
    'add-button': AddButton,
    'progresses-log': ProgressesLog,
  },
  data() {
    return {
      progresses: null,
    }
  },
  computed: {
    projects () {
      return this.$store.state.userProjects
    },
    workspaces () {
      return this.projects.reduce((acc, project) => [...acc, ...project.workspaces], [])
    },
    user () {
      return this.$store.state.user
    },
    trueUser () {
      return this.$store.state.trueUser
    },
  },
  methods: {
    getProgresses () {
      return new Promise(async resolve => {
        const progresses = await this.$fire.retrieveAllUserAssociatedEntities({
          collection: 'progresses',
          projects: this.projects,
          user: this.user,
        })
        
        const sortedProgresses = progresses.sort((a,b) => b.created_at - a.created_at)
        resolve(sortedProgresses)
      })
    },
    showEditProgress (options) {
      this.$modals.show({
        name: 'edit-progress',
        onSuccess: this.getProgresses,
        ...options,
      })
    },
  },
}
</script>

<template lang="pug">
  #member-progresses-main.member-main
    .member-progresses-container.member-container
      .header
        .pro-title My Progress
          add-button(
            :onClick='() => showEditProgress({isNew: true, onSuccess: () => $proEmit("refresh-progresses")})'
          )
      .content
        progresses-log(
          :retrievePromise='getProgresses'
        )
</template>

<style lang="sass" scoped>
  #member-progresses-main
    .member-progresses-container
      .header
        .pro-title
          font-size: 32px
      .content
        max-width: 50rem
</style>