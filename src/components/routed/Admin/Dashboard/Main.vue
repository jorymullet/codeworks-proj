<script>
import DashboardSprints from './Sprints'
const today = new Date()
export default {
  name: 'AdminDashboard',
  components: {
    'dashboard-sprints': DashboardSprints,
  },
  data() {
    return {
      stats: null,
      workspaces: null,
      sprints: {
        month: null,
        year: null,
      },
      sprintTypes: [{
        title: 'This month',
        type: 'month',
        fromDate: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()), // from one month ago
      }, {
        title: 'Year to Date',
        type: 'year',
        fromDate: new Date(today.getFullYear(), 0, 1), // from beginning of this year
      }],
    }
  },
  computed: {
    orgId () {
      return this.$route.params.orgId
    }
  },
  methods: {
    async getStats () {
      this.stats = (await this.$firestore.doc(`stats/orgs/byOrg/${this.orgId}`).get()).data() || {}
    },
    async getProgresses () {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      const progresses = this.$fire.qs.toArray(
        await this.$firestore.collection('progresses')
          .where('org_id', '==', this.orgId)
          .where('created_at', '>', sevenDaysAgo)
          .get()
      )
      const projectIdsToRetrieve = Array.from(new Set(
        progresses.reduce((acc, progress) => [...acc, ...(progress.associated_projects || [])], [])
      ))

      const projects = (await Promise.all(projectIdsToRetrieve.map(id => this.$firestore.doc(`projects/${id}`).get())))
        .map(ss => ss.data()).filter(Boolean)
        .reduce((obj, project) => {
          obj[project.id] = project
          return obj
        }, {})

      

      const workspaces = progresses.reduce((obj, prog) => {
        // checks if has workspaces and if so, we are going to find projects
        // and get their workspace names (since workspaces guarantees project existence)
        if (!(prog.workspaces && prog.workspaces.length)) return obj

        // gets all possible project that could be associated with these workspaces
        const potentialProjects = prog.associated_projects.map(id => projects[id])
        
        // creates list of the types of workspaces found in the progresses
        const wsTypes = prog.workspaces.map(wsId => {
          const projectWithWS = potentialProjects.find(proj => (proj.workspaces || []).find(ws => ws.id === wsId))
          if (!projectWithWS) return null

          const ws = projectWithWS.workspaces.find(ws => ws.id === wsId)
          return ws.type
        }).filter(Boolean)

        // boils down to counting obj
        wsTypes.forEach(type => {
          if (!obj[type]) {
            obj[type] = 0
          }
          obj[type] += 1
        })

        return obj
      }, {})

      this.workspaces = workspaces
    },
    getSprints () {
      const sprintsRef = this.$firestore.collection('sprints').where('org_id', '==', this.orgId)

      this.sprintTypes.forEach(type => {
        const stringDate = this.$buildDate(type.fromDate, '{year}-{month}-{date}', {to2: true})
        sprintsRef.where('start_date', '>=', stringDate).get().then(qs => {
          const sprints = this.$fire.qs.toArray(qs).sort((a,b) => a.type.name.localeCompare(b.type.name))
          this.sprints[type.type] = sprints.reduce((obj, sprint) => {
            if (!obj[sprint.type.name]) {
              obj[sprint.type.name] = 0
            }
            obj[sprint.type.name] += 1
            return obj
          }, {})
        })
      })
    },
  },
  async mounted () {
    this.getStats()
    this.getProgresses()
    this.getSprints()
  },
}
</script>

<template lang="pug">
  #admin-dashboard-main.admin-main
    .admin-dashboard-container.admin-container
      .header
        .pro-title Activity Dashboard
      .content
        .stats-square(
          v-if='!stats'
        )
          img(
            src='@/assets/svg/infiniti.svg'
          )
        .stats-square(
          v-else
        )
          .row.major
            router-link.stat(
              :to='{name: "AdminUsers", params: {orgId,}}'
            )
              .pro-title Total Studio Members
              .value {{stats.users || 0}}
            router-link.stat(
              :to='{name: "AdminProjects", params: {orgId,}}'
            )
              .pro-title Total Projects
              .value {{stats.projects || 0}}
          .row.minor
            .stat
              .pro-title Conversations Logged
              .value {{stats.conversations || 0}}
            .stat
              .pro-title Resources Added
              .value {{stats.resources || 0}}
        .workspace-area
          .pro-title Workspace Progress
          .instruction All progress is from last 7 days.
          .workspace-holder
            .workspace(
              v-if='!workspaces'
            )
              img(
                src='@/assets/svg/infiniti.svg'
              )
            .workspace(
              v-else-if='!Object.keys(workspaces).length'
            ) None found
            .workspace.pro-project.card(
              v-for='(value, type) in workspaces'
            )
              .value {{value}}
              .type {{type}}
        dashboard-sprints


</template>

<style lang="sass" scoped>
  #admin-dashboard-main
    .admin-dashboard-container
      max-height: calc(100vh - #{$nav-height})
      overflow-y: scroll
      .content
        display: grid
        .sprints-area
          justify-self: start
          .sprint-type-holder
            display: grid
            grid-template-columns: 1fr 1fr
            column-gap: 2rem
            .sprint-type
              > .title
                margin-bottom: 1rem
              .sprints-holder
                .sprint
                  margin-bottom: 1rem
                  display: grid
                  grid-template-columns: min-content auto
                  column-gap: 1rem
                  font-size: 16px
                  align-items: center
                  padding: 1rem
                  .name
                    color: #222
                  .value
                    color: $orange
                    font-weight: bold
                    font-size: 22px
        .workspace-area
          display: grid
          margin-bottom: 2rem
          .pro-title
            margin-bottom: 0rem
          .instruction
            margin: 1rem 0
          .workspace-holder
            display: flex
            flex-wrap: wrap
            .workspace
              margin: 0 1rem 1rem 0
              font-weight: bold
              justify-items: center
              .value
                font-size: 28px
                align-self: start
                padding-top: 3rem
              .type
                font-size: 18px
                text-align: center
                color: $orange
        .stats-square
          justify-self: start
          margin-bottom: 2rem
          .row
            display: grid
            grid-template-columns: 1fr 1fr
            column-gap: 1rem
            margin-bottom: 1rem
            .stat
              @extend .card
              display: grid
              justify-items: center
              .pro-title
                font-size: 16px
              .value
                font-size: 72px
                color: $mild-blue
                font-weight: bold
            &.minor
              .stat
                .pro-title
                  font-size: 16px
                .value
                  font-size: 32px


</style>