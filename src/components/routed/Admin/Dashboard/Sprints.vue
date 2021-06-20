<script>
export default {
  name: 'AdminDashboardSprints',
  data() {
    return {
      sprints: {
        active: null,
        byType: null,
      },
      sprintAreas: [{
        title: 'Currently Active',
        subtitle: 'Click to see assoicated projects.',
        type: 'active',
        noneMessage: 'No active sprints',
      }, {
        title: 'Year to Date',
        subtitle: 'Number of Sprinters by type',
        type: 'byType',
        noneMessage: 'No sprinters',
      }]
    }
  },
  computed: {
    org () {
      return this.$store.state.org
    },
    sprintsRef() {
      return this.$firestore.collection('sprints').where('org_id', '==', this.org.id)
    }
  },
  methods: {
    async getActiveSprints () {
      const today = new Date()
      // today and a year ago
      const dates = [today, new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())]
      const [todayStr, yearAgoStr] = dates.map(date => this.$buildDate(date, '{year}-{month}-{date}', {to2: true}))
      const sprintsInLastYear = this.$fire.qs.toArray(await this.sprintsRef
        .where('start_date', '<=', todayStr)
        .where('start_date', '>', yearAgoStr)
        .get())

      this.sprints.active = sprintsInLastYear
        .filter(sprint => {
          const endDate = this.$getSprintEndDate(sprint, this.org)
          return endDate >= todayStr
        })
        .sort((a,b) => a.start_date.localeCompare(b.start_date))
    },
    async getSprintsByType () {
      const today = new Date()
      // beginning of year and today
      const dates = [new Date(today.getFullYear(), 0, 1), today,]
      const [startOfYearStr, todayStr] = dates.map(date => this.$buildDate(date, '{year}-{month}-{date}', {to2: true}))
      const sprintsYearToDate = this.$fire.qs.toArray(await this.sprintsRef
        .where('start_date', '>=', startOfYearStr)
        .where('start_date', '<=', todayStr)
        .get())

      // retrieve and place all members on sprint
      const membersPromises = sprintsYearToDate.map(async (sprint, idx) => {
        const members = this.$fire.qs
          .toArray(await this.$firestore.collection(`sprints/${sprint.id}/sprint_members`).get())
          .map(member => member.id)
        sprintsYearToDate[idx].members = members
      })
    
      await Promise.all(membersPromises)

      const idsByType = sprintsYearToDate.reduce((obj, sprint) => {
        const type = sprint.type.name
        if (!obj[type]) {
          obj[type] = []
        }

        obj[type] = [...obj[type], ...sprint.members]
        return obj
      }, {})

      const sprintersYearToDate = Object.keys(idsByType)
        .map(type => ({type, count: idsByType[type].length}))
        .filter(data => data.count)
        .sort((a,b) => a.type.localeCompare(b.type))

      this.sprints.byType = sprintersYearToDate
    },
  },
  mounted () {
    this.getActiveSprints()
    this.getSprintsByType()
  },
}
</script>

<template lang="pug">
  #admin-dashboard-sprints-main
    .admin-dashboard-sprints-container
      .pro-title Sprints
      .content
        .sprints-area(
          v-for='area in sprintAreas'
        )
          .title.italic {{area.title}}
          .instruction(
            v-if='area.subtitle'
          ) {{area.subtitle}}
          .sprints-holder
            .sprint(
              v-if='!sprints[area.type]'
            )
              img(
                src='@/assets/svg/infiniti.svg'
              )
            .sprint.italic.card(
              v-else-if='!sprints[area.type].length'
            ) {{area.noneMessage}}
            component.sprint.card(
              v-else
              v-for='sprint in sprints[area.type]'
              :class='area.type'
              :is='area.type === "active" ? "router-link" : "div"'
              :key='sprint.name || sprint.type'
              :to='{name: "AdminProjects", params: {orgId: org.id}, query: {filterBySprint: sprint.id}}'
            )
              template(
                v-if='area.type === "active"'
              )
                .name {{sprint.name}}
                i.material-icons login
              template(
                v-else-if='area.type === "byType"'
              )
                .count {{sprint.count}}
                .type {{sprint.type}}
        
</template>

<style lang="sass" scoped>
  #admin-dashboard-sprints-main
    .admin-dashboard-sprints-container
      .content
        display: grid
        grid-template-columns: max-content max-content
        column-gap: 2rem
        .sprints-area
          max-width: 20rem
          .title
            font-size: 20px
            margin-bottom: .5rem
          .instruction
            margin: .5rem 0
          .sprints-holder
            .sprint
              display: grid
              column-gap: 1rem
              align-items: center
              margin-bottom: .5rem
              font-weight: bold
              font-size: 16px
              &.active
                grid-template-columns: auto min-content
                cursor: pointer
                transition: .1s all
                &:hover
                  background: $lightgrey
                .name
                > i
              &.byType
                grid-template-columns: min-content auto
                .count
                  color: $orange
                  font-size: 20px
</style>