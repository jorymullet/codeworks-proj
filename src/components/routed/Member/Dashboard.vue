<script>
import AddButton from '$common/AddButton'
import Links from '$common/Links'
import Progresses from '$common/Progresses'
import ResearchRecap from '$common/ResearchRecap'
import Sprints from '$common/Sprints'
import ProjectsHolder from './ProjectsHolder'
import {sprints} from '@/global/js/entity-manager'
export default {
  name: 'MemberDashboard',
  components: {
    'links': Links,
    'add-button': AddButton,
    'progresses': Progresses,
    'research-recap': ResearchRecap,
    'sprints': Sprints,
    'projects-holder': ProjectsHolder,
  },
  data () {
    return {
      studioLinks: null,
      retrieveProgressesPromise: async () => {
        const progresses = this.$fire.qs.toArray(await this.$firestore
          .collection('progresses')
          .where('org_id', '==', this.user.org_id)
          .where('created_by', '==', this.user.id)
          .orderBy('created_at', 'desc')
          .limit(2)
          .get())

        progresses.forEach((progress, idx) => {
          const projects = (progress.associated_projects || [])
            .map(projectId => this.projects.find(p => p.id === projectId))
            .filter(Boolean)
          progresses[idx].projects = projects
        })
        
        return progresses
      },
      sprints,
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    org () {
      return this.$store.state.org
    },
    projects () {
      return this.$store.state.userProjects
    },
    guildUrl () {
      return `https://${process.env.VUE_APP_AUTH0_DOMAIN}/authorize?client_id=${process.env.VUE_APP_AUTH0_CIRCLE_CLIENT_ID}&redirect_uri=https%3A%2F%2F${this.org.circle_subdomain}.circle.so%2Foauth2%2Fcallback&response_type=code&scope=openid+profile+email+picture`
    },
  },
  methods: {
    async getStudioLinks () {
      const defaultStudioLinks = this.org.links || []
      const userLinkGroups = this.$fire.qs.toArray(
        await this.$firestore.collection('link_groups')
        .where('org_id', '==', this.user.org_id)
        .where('members', 'array-contains', this.user.id)
        .get()
      )

      const flattenedLinks = userLinkGroups.reduce((acc, lg) => [...acc, ...lg.links], [])
      
      this.studioLinks = [...flattenedLinks, ...defaultStudioLinks]
    },
  },
  async mounted () {
    await this.getStudioLinks()
  },
}
</script>

<template lang="pug">
  #member-dashboard-main.member-main
    .member-dashboard-container.member-container
      .header
        .pro-title Dashboard
      .content
        projects-holder(
          v-if='user'
          :dbQuery='$firestore.collection("projects").where("org_id", "==", org.id).where("members", "array-contains", user.id).orderBy("created_at", "desc")'
        )
        .progress-and-research
          progresses(
            :retrievePromise='retrieveProgressesPromise'
            title='Recent Progress'
            :headerButtons='[{name: "View All Progress", to: {name: "MemberProgresses", params: {userId: user.id}}}]'
          )
          research-recap(
            :headerButtons='[{name: "View All Research", to: {name: "MemberResearch", params: {userId: user.id}}}]'
          )
        .links-and-sprints
          .links
            links(
              v-if='user'
              title='My Links'
              :links='user.links'
              :dbRef='`users/${user.id}`'
              refresh='refreshUser'
              :canEdit='true'
            )
            links(
              v-if='org && user && studioLinks'
              title='Studio Links'
              :links='studioLinks'
              :dbRef='`orgs/${org.id}`'
              refresh='refreshOrg'
              :canEdit='false'
            )
          .guild-link-holder
            a.card.guild-link(
              :href='guildUrl'
              target='_blank'
            )
              .pro-title My Guild
              .image-holder
                img(
                  :src='org.logos.square'
                )
          sprints(
            title='Upcoming Sprints'
            :retrievePromise='sprints.getUpcomingSprints'
            :headerButtons='[{name: "View All", to: {name: "MemberSprints", params: {userId: user.id}}}]'
          )
</template>

<style lang="sass" scoped>
  #member-dashboard-main
    .member-dashboard-container
      .header
        padding-bottom: 2rem
        .pro-title
          font-size: 32px
      .content
        //display: grid
        width: 100%
        .founder-workspace-holder
          margin-bottom: 2rem
          max-width: 30rem
          .founder
            .name
              font-size: 32px
        #projects-holder-main
          margin-bottom: 3rem
        .progress-and-research
          display: grid
          grid-template-columns: 1fr 1fr
          column-gap: 2rem
          margin-bottom: 3rem
          .research
            text-align: center
            align-items: center
        .links-and-sprints
          display: grid
          grid-template-columns: 1fr 1fr 1fr
          column-gap: 2rem
          > a
          color: black
          .links
            display: grid
            row-gap: 2rem
          .guild-link-holder
            .guild-link
              display: grid
              grid-template-rows: min-content auto
              .image-holder
                height: 10rem
                width: 10rem
                justify-self: center
                align-self: center
                margin: 2rem 0
                > img
                  height: 100%
                  width: 100%
</style>