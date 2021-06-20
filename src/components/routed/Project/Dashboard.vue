<script>
import MembersHolder from '$common/MembersHolder'
import WorkspacesHolder from '$common/WorkspacesHolder'
import Resources from '$common/Resources'
import Conversations from '$common/Conversations'
import ProgressesLog from '$common/ProgressesLog'
import AddButton from '$common/AddButton'
export default {
  name: 'ProjectDashboard',
  components: {
    'members-holder': MembersHolder,
    'workspaces-holder': WorkspacesHolder,
    'resources': Resources,
    'conversations': Conversations,
    'progresses-log': ProgressesLog,
    'add-button': AddButton,
  },
  data() {
    return {
      promises: {},
      filters: [{
        func: entity => entity.created_by === this.$store.state.user.id,
        copy: engaged => engaged ? 'View All' : 'View Only Yours',
      }]
    }
  },
  computed: {
    project () {
      return this.$store.state.project
    },
    user () {
      return this.$store.state.user
    },
    headerButtons () {
      const viewAllButton = {name: 'View All', to: {name: 'MemberResearch', params: {userId: this.user.id}}}
      if (!this.project.is_founder) {
        viewAllButton.to.query = {filterByProject: this.project.id}
      }
      return [viewAllButton]
    },
  },
  methods: {
    openEditProject () {
      this.$modals.show({
        name: 'edit-project',
        project: this.project,
        canDelete: false,
        onSuccess: () => this.$store.commit('refreshProject')
      })
    },
    onNewProgress () {
      this.$modals.show({
        name: 'edit-progress',
        isNew: true,
        onSuccess: () => this.$proEmit('refresh-progresses'),
        preassociatedProjects: [this.$route.params.projectId],
      })
    },
    async createEntityPromises () {
      const entities = ['progresses', 'resources', 'conversations']
      if (this.project.is_founder) {
        const projects = this.$fire.qs.toArray(await this.$firestore.collection('projects')
          .where('org_id', '==', this.project.org_id)
          .where('members', 'array-contains', this.user.id)
          .orderBy('created_at', 'desc')
          .get())

        entities.forEach(entity => {
          this.promises[entity] = () => this.$fire.retrieveAllUserAssociatedEntities({
            collection: entity,
            projects,
            user: this.user,
          })
          this.$forceUpdate()
        })
      } else {
        entities.forEach(entity => {
          this.promises[entity] = () => new Promise(async resolve => {
            resolve(this.$fire.qs.toArray(await this.$firestore.collection(entity)
              .where('org_id', '==', this.project.org_id)
              .where('associated_projects', 'array-contains', this.project.id)
              .orderBy('created_at', 'desc')
              .get()))
          })
          this.$forceUpdate()
        })
      }
    }
  },
  mounted () {
    this.createEntityPromises()
  },
}
</script>

<template lang="pug">
  #project-dashboard-main.project-main
    .project-dashboard-container.project-container
      .header
        .pro-title {{project.name}}
        i.material-icons(
          v-if='!project.is_founder'
          @click='openEditProject'
        ) mode_edit
      .content
        members-holder(
          :membersIds='project.members'
        )
        workspaces-holder(
          :project='project'
        )
        .research-area
          component(
            v-for='type in ["resources", "conversations"]'
            v-if='promises[type]'
            :is='type'
            :retrievePromise='promises[type]'
            :filters='filters'
            :preassociatedProjects='[$route.params.projectId]'
            :key='type'
            :headerButtons='headerButtons'
          )
          .progresses-area
            .pro-title Project Progress
              add-button(
                :onClick='onNewProgress'
              )
            .log-holder
              progresses-log(
                v-if='promises.progresses'
                :retrievePromise='promises.progresses'
              )


</template>

<style lang="sass" scoped>
  #project-dashboard-main
    .project-dashboard-container
      max-width: 90rem
      padding: 3rem
      margin: 0 auto
      .header
        display: grid
        align-items: cetner
        grid-template-columns: auto min-content
        .pro-title
          font-size: 32px
        > i
          font-size: 32px
          cursor: pointer
          color: $darkgrey
          transition: color .25s
          &:hover
            color: black
      .content
        .research-area
          margin: 2rem 0
          display: grid
          grid-template-columns: 1fr 1fr
          column-gap: 2rem
          row-gap: 2rem
          #progresses-main
            grid-column: 1 / 3
            margin-bottom: 2rem
        .progresses-area
          .log-holder
            padding: 1rem
            max-height: 50rem
            overflow-y: scroll
</style>