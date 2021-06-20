<script>
import AddButton from '$common/AddButton'
import ProTable from '$common/ProTable'
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
import ProgressesLog from '$common/ProgressesLog'
import {decideFontColor} from '@/global/js/color.js'
import {isBeingSearched} from '@/global/js/search'

const cookieStr = 'invanti-clicked-project-progress-' // format is `{cookieStr}{projectId}`:{ts}
export default {
  name: 'AdminProjects',
  components: {
    'add-button': AddButton,
    'pro-table': ProTable,
    'pro-input': ProInput,
    'pro-select': ProSelect,
    'progresses-log': ProgressesLog,
  },
  data() {
    return {
      projects: null,
      users: null,
      sprints: null,
      progressesRetrievePromise: null,
      latestProgresses: null,
      overwriteProjects: [],
      decideFontColor,
      search: '',
      selectedSprints: [],
    }
  },
  computed: {
    org () {
      return this.$store.state.org 
    },
    filteredProjects () {
      if (!(this.projects && this.projects.length)) return this.projects

      let projects = this.$clone(this.projects)

      if (this.search) {
        projects = projects.filter(project => isBeingSearched(this.search, project.name))
      }

      if (this.selectedSprints.length) {
        projects = projects
          .filter(project => this.selectedSprints
            .find(sprintMembers => sprintMembers
              .find(member => member.project_id === project.id)))
      }

      return projects
    },
    sprintOptions () {
      if (!this.sprints) return []

      return this.$clone(this.sprints)
        .sort((a, b) => b.start_date.localeCompare(a.start_date))
        .map(sprint => ({name: sprint.name, value: sprint.members, id: sprint.id}))
    },
  },
  methods: {
    async getSprints () {
      const sprintsRef = this.$firestore.collection('sprints')

      const sprints = this.$fire.qs.toJSON(await sprintsRef.where('org_id', '==', this.org.id).get())

      const sprintsWithMembersPromises = Object.keys(sprints).map(async sprintId => {
        const members = this.$fire.qs.toArray(await sprintsRef.doc(sprintId).collection('sprint_members').get())
        sprints[sprintId].members = members
        return sprints[sprintId]
      })

      const sprintsWithMembers = await Promise.all(sprintsWithMembersPromises)
      this.sprints = sprintsWithMembers
    },
    async getProjects () {
      const projects = this.$fire.qs.toArray(
        await this.$firestore.collection('projects')
          .where('org_id', '==', this.org.id)
          .where('is_founder', '==', false).get()
        )
      const usersToRetrieve = Array.from(new Set(projects.reduce((arr, project) => [...project.members, ...arr], [])))
      const promises = usersToRetrieve.map(uid => this.$firestore.doc(`users/${uid}`).get())
      const usersSS = await Promise.all(promises)
      this.users = usersSS.map(ss => ss.data()).filter(Boolean).reduce((acc, user) => {
        acc[user.id] = user
        return acc
      }, {})

      // retrieving latest progress for each project
      const progressesPromises = projects.map(project => 
        this.$firestore.collection('progresses')
          .where('org_id', '==', project.org_id)
          .where('associated_projects', 'array-contains', project.id)
          .orderBy('created_at', 'desc')
          .limit(1)
          .get()
      )

      // retrieve the last progress of every project to use as a way to sort the projects
      const latestProgresses = (await Promise.all(progressesPromises))
        .map(qs => {
          if (qs.docs.length) return qs.docs[0].data()
          return null
        })
        .filter(Boolean)
        .reduce((latest, progress) => {
          const ap = progress.associated_projects || []
          ap.forEach(projectId => {
            if (!latest[projectId]) {
              latest[projectId] = 0
            }
            latest[projectId] = Math.max(latest[projectId], progress.created_at)
          })
          return latest
        }, {})

      this.latestProgresses = latestProgresses

      // this looks into the cookies for the following: IF the last time a project's progress was clicked
      // is a different created_at then it is currently, it is new and should have the new_progress indicator associate with it
      projects.forEach(project => {
        const latest = latestProgresses[project.id]
        if (!latest) return // prevents progress-less projects to not have button
        const lastClicked = (this.$cookies.get(`${cookieStr}${project.id}`) || 0)
        if (lastClicked !== String(latest)){
          project.new_progress = true
        }
      })

      // uses latestProgresses to sort projects by most recent progress
      this.projects = projects.sort((a, b) => {
        const [aMax, bMax] = [a,b].map(project => latestProgresses[project.id] || 0)
        return bMax - aMax
      })

    },
    onEditProject (options) {
      this.$modals.show({
        name: 'edit-project',
        onSuccess: this.getProjects,
        canDelete: true,
        ...options,
      })
    },
    onViewProgress (project) {
      // this part handles the setting of the cookie to relieve the new_progress indicator
      const latestProgress = this.latestProgresses[project.id] || 0
      this.$cookies.set(`${cookieStr}${project.id}`, latestProgress)
      const projectIdx = this.projects.findIndex(p => p.id === project.id)
      if (projectIdx >= 0) {
        this.projects[projectIdx].new_progress = false
      }

      this.progressesRetrievePromise = null
      this.progressesRetrievePromise = async () => this.$fire.qs.toArray(
        await this.$firestore
          .collection('progresses')
          .where('org_id', '==', project.org_id)
          .where('associated_projects', 'array-contains', project.id)
          .orderBy('created_at', 'desc').get()
      )
    },
    checkForFilters () {
      const filterBySprint = this.$route.query.filterBySprint
      if (filterBySprint) {
        const option = this.sprintOptions.find(option => option.id === filterBySprint)
        if (option) {
          this.selectedSprints.push(option.value)
        }
      }
    },
    orderWorkspaces (wss) {
      return (wss || []).sort((a, b) => a.sequence.localeCompare(b.sequence))
    }
  },
  async mounted () {
    await this.getSprints()
    await this.getProjects()
    this.checkForFilters()
  },
}
</script>

<template lang="pug">
  #projects-main.admin-main
    .projects-container.admin-container
      .header
        .pro-title Projects
          add-button(
            :onClick='() => onEditProject({isNew: true,})'
          )
      .content
        .projects-area
          .filters-area
            pro-input(
              v-model='search'
              :options='{title: "Search by name"}'
            )
            pro-select(
              v-model='selectedSprints'
              :disabled='!sprints'
              title='Filter by sprint'
              :options='sprintOptions'
              :multiple='true'
            )
          .projects-holder
            .project-summary(
              v-if='!projects'
            )
              img(
                src='@/assets/svg/infiniti.svg'
              )
            .project-summary.italic(
              v-else-if='!filteredProjects.length'
            ) No projects
            .project-summary.card(
              v-for='project in filteredProjects'
            )
              .title(
                @click='$router.push({name: "Project", params: {projectId: project.id}})'
              ) {{project.name}}
                i.material-icons(
                  @click.stop='() => onEditProject({project})'
                ) edit
              .amount-count {{(project.members || []).filter(id => users[id]).length}} member(s)
              .holder(
                :style='{"grid-template-columns": `repeat(${(project.members || []).filter(id => users[id]).length || 1}, max-content)`}'
              )
                .italic(
                  v-if='!(project.members || []).length'
                ) No members
                .pro-member.card.small(
                  v-for='memberId in (project.members || []).filter(id => users[id])'
                )
                  .image
                    img(
                      :src='users[memberId].photo_url'
                    )
                  .name {{users[memberId].first_name}} {{users[memberId].last_name}}
              .amount-count {{(project.workspaces || []).length}} workspace(s)
              .holder.workspaces
                router-link.workspace.card(
                  v-for='(ws, idx) in orderWorkspaces(project.workspaces)'
                  :to='{name: "ProjectWorkspaceView", params: {projectId: project.id, workspaceId: ws.id}}'
                  :style='{background: org.brand_colors.primary, color: decideFontColor(org.brand_colors.primary)}'
                  :key='idx'
                )
                  .type {{ws.type}}
              .show-progress.pro-button.minor(
                @click='() => onViewProgress(project)'
                :class='project.new_progress ? "new-progress" : ""'
              ) View Progress
        .progress-log-area
          progresses-log(
            v-if='progressesRetrievePromise'
            :retrievePromise='progressesRetrievePromise'
            :overwriteProjects='projects'
          )
          .pro-title(
            v-else
          ) Click 'View Progress' to view a project's progress
</template>

<style lang="sass" scoped>
  #projects-main
    .projects-container
      .content
        box-shadow: 0rem 0 .75rem 0rem lightgrey inset
        margin-top: 1rem
        display: grid
        grid-template-columns: 1fr 1fr
        height: calc(100vh - #{$nav-height} - 8.5rem)
        .progress-log-area
          padding: 1rem
          height: 100%
          overflow-y: scroll
          border-left: thin solid black
          > .pro-title
            text-align: center
            padding: 2rem
            color: grey
            font-size: 22px
        .projects-area
          height: 100%
          overflow-y: scroll
          padding: 1rem
          .filters-area
            margin: 1rem 0
            display: grid
            column-gap: 1rem
            grid-template-columns: 1fr 1fr
            align-items: end
          .projects-holder
            display: grid
            grid-template-columns: 1fr 1fr
            column-gap: 1rem
            row-gap: 1rem
            .project-summary
              border-radius: 1rem
              .amount-count
                color: grey
                font-size: 12px
              .title
                font-size: 18px
                margin-bottom: 1rem
                text-align: center
                font-weight: bold
                cursor: pointer
                > i
                  font-size: 16px
                  color: grey
                  margin-left: .5rem
                  transition: all .25s
                  &:hover
                    color: #222
              .holder
                display: grid
                max-width: 20rem
                overflow-x: scroll
                padding: .5rem
                box-shadow: 0 0 .25rem 0 lightgrey inset
                margin: .5rem 0
                &.workspaces
                  display: flex
                  flex-wrap: wrap
                  padding-bottom: 0
                .pro-member
                  margin-right: .5rem
                .workspace
                  margin: 0 .5rem .5rem 0
                  font-size: 12px
                  padding: .5rem
                  cursor: pointer
              .show-progress
                height: fit-content
                align-self: end
                position: relative
                &.new-progress
                  &::after
                    content: ' '
                    height: .75rem
                    width: .75rem
                    background: $mild-blue
                    top: -.25rem
                    right: -.25rem
                    border-radius: 1rem
                    position: absolute
                  
</style>