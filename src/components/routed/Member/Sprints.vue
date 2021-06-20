<script>
import Sprints from '$common/Sprints'
import {sprints} from '@/global/js/entity-manager'
export default {
  name: 'MemberSprints',
  components: {
    'sprints': Sprints,
  },
  data () {
    return {
      sprintTypes: null,
      userSprints: null,
      orgSprints: null,
    }
  },
  computed: {
    org () {
      return this.$store.state.org
    },
    user () {
      return this.$store.state.user
    },
  },
  methods: {
    getSprintsTypes () {
      const orgCreatedTypes = this.org.sprint_types || []
      const orgDefaultTypes = this.org.default_sprint_types || []
      this.sprintTypes = [...orgCreatedTypes, ...orgDefaultTypes]
    },
    getUserSprints: sprints.getUserSprints,
    getUpcomingSprints: sprints.getUpcomingSprints,
    getCurrentSprints () {
      return new Promise(async resolve => {
        const sprints = await this.getUserSprints()
        const now = Date.now()
        const currentSprints = sprints.filter(Boolean).filter(s => {
          const [startDate, endDate] = this.$getSprintDatesString(s).split('-').map(dateString => new Date(dateString))
          return (now >= startDate) && (now <= Number(endDate) + 1000 * 3600 * 24) // ensures today still works
        })
        resolve(currentSprints)
      })
    },
    async getOrgSprints () {
      // we query start dates newer than 8 months
      // this is hillbilly since the longest a sprint can go is 8 months but
      // we here though

      const ts8MonthsAgo = Date.now() - (8 * 28 * 24 * 60 * 60 * 1000)
      const date8MonthsAgo = this.$buildDate(ts8MonthsAgo, '{year}-{month}-{date}')
      this.orgSprints = this.$fire.qs.toArray(await this.$firestore.collection('sprints')
        .where('org_id', '==', this.user.org_id)
        .where('start_date', '>', date8MonthsAgo)
        .get())
        .sort((a,b) => a.start_date.localeCompare(b.start_date))
    },
    join (options) {
      this.$modals.show({
        name: 'join-sprint',
        onSuccess: () => this.$proEmit('retrieve-sprints'),
        ...options,
      })
    },
    checkQuery () {
      const sprintInviteId = this.$route.query.sprintInvite
      if (!sprintInviteId) return

      const sprint = this.orgSprints.find(os => os.id === sprintInviteId)
      if (!sprint) return

      this.join({sprint, isNew: true})
    },
    seeJoin (sprint) {
      const today = new Date ()
      const todayStr = this.$buildDate(today, '{year}-{month}-{date}', {to2: true})
      return todayStr <= sprint.start_date
      // const startDate = new Date(`${sprint.start_date} `)
      // const today = new Date()
      // const methods = ['getMonth', 'getFullYear']
      // const [[startMonth, startYear], [month, year]] = [startDate, today].map(date => methods.map(method => date[method]()))
      // // can only join if before month it begins is after current month
      // const canJoin = (startYear > year) || ((startMonth > month) && (startYear >= year))
      // // or if user was invited. 
      // const wasInvited = this.$route.query.sprintInvite === sprint.id
      // return canJoin || wasInvited 
    }
  },
  async mounted () {
    this.getSprintsTypes() 
    this.userSprints = await this.getUserSprints()
    await this.getOrgSprints()
    this.$proOn('retrieve-sprints', async () => {
      this.userSprints = await this.getUserSprints()
    })
    this.checkQuery()
  },
}
</script>

<template lang="pug">
  #member-sprints-main.member-main
    .member-sprints-container.member-container
      .header
        .pro-title Sprints
      .content
        .my-sprints
          sprints(
            :retrievePromise='getCurrentSprints'
            title='Current Sprints'
          )
          sprints(
            :retrievePromise='getUpcomingSprints'
            title='Upcoming Sprints'
          )
        .sprints-sign-up
          .pro-title Sprint Sign-up
          .sprint-types-holder
            .sprint-type(
              v-for='type in sprintTypes'
              v-if='orgSprints && orgSprints.filter(s => s.type.name === type.name).length'
            ) 
              .name {{type.name}}
              .sprints-holder
                .sprint.italic(
                  v-if='!orgSprints'
                ) Loading...
                .sprint.italic(
                  v-else-if='!orgSprints.filter(s => s.type.name === type.name).length'
                ) None
                .sprint.card(
                  v-else
                  v-for='sprint in orgSprints.filter(s => s.type.name === type.name)'
                )
                  .details
                    .name {{sprint.name}}
                    .date {{$getSprintDatesString(sprint)}}
                  .action
                    .pro-button.minor(
                      @click='() => join({sprint})'
                      v-if='userSprints.find(us => us.id === sprint.id)'
                    ) Joined!
                    .pro-button.major(
                      @click='() => join({sprint, isNew: true})'
                      v-else-if='seeJoin(sprint)'
                    ) Join

</template>

<style lang="sass" scoped>
  #member-sprints-main
    .member-sprints-container
      > .header
        .pro-title
          font-size: 32px
      .content
        .my-sprints
          display: grid
          grid-template-columns: 2fr 1fr
          column-gap: 2rem
          margin-bottom: 2rem
        .sprints-sign-up
          .sprint-types-holder
            display: grid
            grid-template-columns: repeat(3, 1fr)
            row-gap: 2rem
            column-gap: 2rem
            .sprint-type
              > .name
                font-size: 18px
              .sprints-holder
                margin-top: 1rem
                .sprint.card
                  padding: 1rem
                  display: grid
                  grid-template-columns: auto min-content
                  column-gap: 1rem
                  align-items: center
                  margin-bottom: .5rem
                  .name
                    margin-bottom: .5rem
                  .date
                    color: #888
                    font-size: 12px
</style>