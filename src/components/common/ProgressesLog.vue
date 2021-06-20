<script>
export default {
  name: 'ProgressesLog',
  props: {
    retrievePromise: Function,
    preassociatedProjects: Array,
    overwriteProjects: Array,
  },
  watch: {
    retrievePromise (newPromise) {
      this.progresses = null
      this.getProgresses()
    }
  },
  data() {
    return {
      progresses: null,
      tags: null,
      users: null,
    }
  },
  computed: {
    projects () {
      return this.overwriteProjects || this.$store.state.userProjects
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
    org () {
      return this.$store.state.org
    },
  },
  methods: {
    async getProgresses () {
      const progresses = await this.retrievePromise()
      this.progresses = progresses.sort((a,b) => b.created_at - a.created_at)
    },
    showEditProgress (options) {
      const modalOptions = {
        name: 'edit-progress',
        onSuccess: this.getProgresses,
        ...options,
      }
      if (this.preassociatedProjects && this.preassociatedProjects.length) {
        console.log(this.preassociatedProjects)
        modalOptions.preassociatedProjects = this.preassociatedProjects
      }
      this.$modals.show(modalOptions)
    },
    shouldSeeEditProgress (progress) {
      if (progress.type === 'SYSTEM') return false

      if (['ADMIN', 'SUPER_ADMIN'].includes(this.trueUser.role)) return true

      return this.user.id === progress.created_by
    },
    getWorkspacesString (wsIds) {
      const html = wsIds
        .map(wsId => this.workspaces.find(ws => ws.id === wsId))
        .filter(Boolean)
        .map(ws => {
          const project = this.projects.find(p => p.workspaces.find(pws => pws.id === ws.id))
          if (!project) return ''

          return `<a href='/projects/${project.id}/workspaces/${ws.id}'>${ws.type}</a>`
        })
        .filter(Boolean)
        .join(', ')

      return html
    },
    async getTags () {
      this.tags = this.$fire.qs.toArray(await this.$firestore.collection('tags').where('org_id', '==', this.org.id).get())
    },
    async getUsers () {
      const usersToRetrieve = this.progresses
        .filter(p => p.type === 'USER')
        .map(p => p.created_by)
        .filter(uid => uid !== this.user.id)

      const uniqueUIDs = Array.from(new Set(usersToRetrieve))
      const userPromises = uniqueUIDs.map(uid => this.$firestore.doc(`users/${uid}`).get())

      // we don't retrieve the current user but add them to the users to save some time
      const users = (await Promise.all(userPromises)).map(d => d.data())
      users.push(this.user)

      this.users = users.filter(Boolean).reduce((obj, user) => {
        obj[user.id] = user
        return obj
      }, {})
    },
  },
  async mounted () {
    await this.getTags()
    await this.getProgresses()
    await this.getUsers()
    this.$proOn('refresh-progresses', this.getProgresses)
  },
}
</script>

<template lang="pug">
  .progresses-log-main
    .progress-log-cotainer
      .content
        .progresses-holder
          .progress(
            v-if='!progresses || !users'
          )
            img(
              src='@/assets/svg/infiniti.svg'
            )
          .progress.italic(
            v-else-if='!progresses.length'
          ) No progress yet.
          .progress.card(
            v-else
            v-for='progress in progresses'
          )
            .header
              .timestamp {{$buildDate(progress.created_at, '{shortMonth} {date}, {year} {hour}:{minutes} {meridian}')}}
              i.material-icons(
                @click='() => showEditProgress({progress})'
                v-if='shouldSeeEditProgress(progress)'
              ) edit
            .details
              template(
                v-if='progress.type === "USER"'
              )
                .progress-row.creator(
                  v-if='users[progress.created_by] && users[progress.created_by].photo_url'
                )
                  .prompt Created by
                  .answer
                    img(
                      :src='users[progress.created_by].photo_url'
                    )
                    .name {{users[progress.created_by].first_name}} {{users[progress.created_by].last_name}} 
                .progress-row
                  .prompt What progress has been made?
                  .answer(
                    v-html='progress.progress_made'
                  )
                .progress-row(
                  v-if='progress.went_well'
                )
                  .prompt What went well?
                  .answer(
                    v-html='progress.went_well'
                  )
                .progress-row(
                  v-if='progress.went_poorly'
                )
                  .prompt What went poorly?
                  .answer(
                    v-html='progress.went_poorly'
                  )
                .progress-row(
                  v-if='progress.summary'
                )
                  .prompt What's the latest summary of your hunch, problem, concept, and/or pilot?
                  .answer(
                    v-html='progress.summary'
                  ) 
                .progress-row(
                  v-if='progress.tags && progress.tags.length'
                )
                  .prompt Tags
                  .answer {{progress.tags.map(tagId => tags.find(tag => tag.id === tagId)).filter(Boolean).map(tag => tag.name).join(', ')}}
                .progress-row(
                  v-if='progress.associated_projects.length'
                )
                  .prompt Associated Projects
                  .answer {{progress.associated_projects.map(projectId => projects && projects.filter(Boolean).find(p => p.id === projectId)).filter(Boolean).map(p => p.name).join(', ')}}
                .progress-row(
                  v-if='progress.workspaces.length'
                )
                  .prompt Which workspaces have you been working on?
                  .answer(
                    v-html='getWorkspacesString(progress.workspaces)'
                  )
              template(
                v-else-if='progress.type === "SYSTEM"'
              )
                .pro-title {{progress.title}}
</template>

<style lang="sass" scoped>
  .progresses-log-main
    .progress-log-cotainer
      .content
        .progresses-holder
          .progress
            margin-bottom: 2rem
            .header
              display: grid
              grid-template-columns: auto auto
              .timestamp
                color: $orange
                font-size: 12px
                margin-bottom: 1rem
              > i
                justify-self: end
                font-size: 18px
                color: grey
                transition: .25s color
                cursor: pointer
                &:hover
                  color: black
            .details
              padding: 1rem 0
              .pro-title
                font-size: 22px
              .progress-row
                margin-bottom: 1rem
                &.creator
                  .answer
                    display: grid
                    grid-template-columns: min-content auto
                    column-gap: .5rem
                    align-items: center
                    > img
                      height: 2rem
                      width: 2rem
                      border-radius: 100%
                .prompt
                  color: #888
                  margin-bottom: .25rem
                  font-size: 12px

</style>