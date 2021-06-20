<script>
import SprintTypes from '$common/SprintTypes'
import Sprints from '$common/Sprints'
import Collapser from '$common/Collapser'
import UpcomingSprints from './UpcomingSprints'
import AddButton from '$common/AddButton'
export default {
  components: {
    'sprint-types': SprintTypes,
    'sprints': Sprints,
    'collapser': Collapser,
    'upcoming-sprints': UpcomingSprints,
    'add-button': AddButton,
  },
  name: 'AdminSprints',
  props: {
    showOrg: Boolean,
  },
  data() {
    return {
      defaultSprintTypes: null,
      orgSprintTypes: null,
      sprints: null,
    }
  },
  computed: {
    trueUser () {
      return this.$store.state.trueUser
    },
    isSuper () {
      return this.trueUser && (this.trueUser.role === 'SUPER_ADMIN')
    },
    org () {
      return this.$store.state.org
    },
    sprintTypes () {
      return [...this.org.default_sprint_types, ...(this.org.sprint_types || [])]
    },
  },
  methods: {
    editSprint (options) {
      this.$modals.show({
        name: 'edit-sprint',
        onSuccess: () => {
          this.$proEmit('retrieve-sprints')
        },
        ...options,
      })
    },
    async getSprintsFrom8MonthsAgo () {
      const today = new Date()
      const eightMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 8, today.getDate())
      const eightMonthsAgoStr = this.$buildDate(eightMonthsAgo, '{year}-{month}-{date}', {to2: true})
      // we get all sprints with start dates before 8 months ago
      const sprints = this.$fire.qs.toArray(await this.$firestore.collection('sprints')
        .where('org_id', '==', this.$route.params.orgId)
        .where('start_date', '>=' , eightMonthsAgoStr)
        .get())
          .sort((a,b) => new Date(b.start_date) - new Date(a.start_date))
      return sprints
    },
    getCurrentSprints () {
      return new Promise(async resolve => {
        const sprints = await this.getSprintsFrom8MonthsAgo()
        // then, we determine which are active
        const today = new Date()
        const todayStr = this.$buildDate(today, '{year}-{month}-{date}', {to2: true})
        const currentSprints = sprints.filter(sprint => {
          const endDate = this.$getSprintEndDate(sprint, this.org)
          return (sprint.start_date <= todayStr) && (endDate >= todayStr)
        })
        
        const addProjectsCountPromises = currentSprints.map(async sprint => {
          const members = this.$fire.qs.toArray(await this.$firestore.doc(`sprints/${sprint.id}`).collection('sprint_members').get())
          const projectIds = members.map(m => m.project_id).uniquify()
          sprint.num_projects = projectIds.length
        })

        await Promise.all(addProjectsCountPromises)
        
        resolve(currentSprints)
      })
    },
    async getUpcomingSprints () {
      const today = new Date()
      const todayStr = this.$buildDate(today, '{year}-{month}-{date}', {to2: true})
      const sprints = this.$fire.qs.toArray(await this.$firestore.collection('sprints')
        .where('org_id', '==', this.$route.params.orgId)
        .where('start_date', '>=' , todayStr)
        .get())
          .sort((a,b) => new Date(b.start_date) - new Date(a.start_date))
      return sprints
    },
  },
}
</script>

<template lang="pug">
  #admin-sprints-main.admin-main
    .admin-sprints-container.admin-container
      .header
        .pro-title Sprints
          add-button(
            :onClick='() => editSprint({isNew: true,})'
          )
      .content(
        v-if='showOrg'
      )
        collapser(
          title='Current Sprints'
        )
          sprints(
            :retrievePromise='getCurrentSprints'
            title=''
            isAdmin=true
            :noAdd='true'
          )
        collapser(
          title='Upcoming Sprints'
        )
          upcoming-sprints(
            :retrievePromise='getUpcomingSprints'
            title=''
            :noAdd='true'
          )
          


</template>

<style lang="sass" scoped>
  #admin-sprints-main
    .admin-sprints-container
      .content
        margin-bottom: 2rem
        .sprints-holder
          margin-bottom: 2rem
          display: flex
          flex-wrap: wrap
          .sprint
            color: #888
            cursor: pointer
            font-size: 12px
            margin: 0 1rem 1rem 0
            .name
              color: #222
              font-weight: bold
              font-size: 18px
              margin-bottom: .5rem
</style>