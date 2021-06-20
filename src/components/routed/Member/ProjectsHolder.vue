<script>
import AddButton from '$common/AddButton'
export default {
  name: 'ProjectsHolder',
  components: {
    'add-button': AddButton,
  },
  props: {
    dbQuery: Object,
  },
  data() {
    return {
      projects: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    founder () {
      if (!this.projects.length) return

      return this.projects.find(p => p.is_founder)
    },
  },
  methods: {
    showEditProject () {
      this.$modals.show({
        name: 'edit-project',
        isNew: true,
        onSuccess: this.getProjects,
        canDelete: false,
      })
    },
    async getProjects () {
      const projects = this.$fire.qs.toArray(await this.dbQuery.get())
        .sort((a,b) => a.is_founder ? -1 : 1)

      this.projects = projects

      const usersByProjectPromises = this.projects
        .map(project => Promise.all(project.members.map(uid => this.$firestore.doc(`users/${uid}`).get())))
      const usersByProject = (await Promise.all(usersByProjectPromises)).map(projectUsersSS => projectUsersSS.map(ss => ss.data()).filter(Boolean))
      usersByProject.forEach((users, idx) => {
        this.projects[idx].users = users
        this.$forceUpdate()
      })
    },
  },
  mounted () {
    this.getProjects()
  },
}
</script>

<template lang="pug">
  #projects-holder-main
    .projects-holder-container
      .pro-title Projects
        add-button(
          :onClick='showEditProject'
        )
      .projects-area
        .founder(
          v-if='founder'
        )
          router-link.pro-project.card.founder(
            :to='{name: "Project", params: {projectId: founder.id}}'
          )
            img.logo(
              src='@/assets/img/common/logo_orange.jpeg'
            )
            .pro-title.name {{founder.name}}
        .projects-holder
          .card(
            v-if='!(projects && projects.length)'
          ) No projects yet.
          router-link.pro-project.card(
            v-for='(project, idx) in projects.filter(p => !p.is_founder)'
            :to='{name: "Project", params: {projectId: project.id}}'
            :key='idx'
          )
            img.logo(
              src='@/assets/img/common/logo_orange.jpeg'
            )
            .pro-title.name {{project.name}}
            .users-holder(
              v-if='project.users && project.users.length'
            )
              img.user(
                v-for='user in project.users.slice(0,4)'
                :src='user.photo_url'
              )
              .user.extra(
                v-if='project.users.length > 4'
              ) +{{project.users.length - 4}}
</template>

<style lang="sass" scoped>
  #projects-holder-main
    .projects-holder-container
      .projects-area
        display: grid
        grid-template-columns: min-content auto
        column-gap: 2rem
        .founder
          width: min-content
          margin-bottom: 1.5rem
          .pro-project
            &.founder
              height: 18rem
              width: 18rem
              .name
                font-size: 32px
        .projects-holder
          display: flex
          align-items: flex-start
          justify-items: flex-start
          flex-wrap: wrap
          .pro-project
            margin: 0 1rem 1rem 0
            .users-holder
              padding: .5rem
              display: flex
              column-gap: .25rem
              position: absolute
              bottom: 0
              .user
                width: 2rem
                height: 2rem
                border-radius: 100%
                &.extra
                  display: grid
                  background-color: #666
                  color: white
                  align-items: center
                  justify-items: center


</style>