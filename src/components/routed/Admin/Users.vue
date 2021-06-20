<script>
import AddButton from '$common/AddButton'
import ProgressesLog from '$common/ProgressesLog'
import ProInput from '$common/ProInput'
import {isBeingSearched} from '@/global/js/search'
export default {
  name: 'AdminUsers',
  components: {
    'add-button': AddButton,
    'progresses-log': ProgressesLog,
    'pro-input': ProInput,
  },
  props: {
    usersRef: {
      required: true,
      type: Function,
    },
  },
  data () {
    return {
      users: null,
      projectsByUser: {},
      progressesRetrievePromise: null,
      overwriteProjects: [],
      search: '',
    }
  },
  computed: {
    isAdmin () {
      const user = this.$store.state.user || {}
      return ['SUPER_ADMIN', 'ADMIN'].includes(user.role)
    },
    filteredUsers () {
      if (!(this.users && this.users.length)) return []

      if (!this.search) return this.users

      return this.users.filter(u => isBeingSearched(this.search, `${u.first_name} ${u.last_name}`))
    },
  },
  methods: {
    async getUsers () {
      const users = this.$fire.qs.toArray(await this.usersRef().get())
        .filter(user => user.role !== 'SUPER_ADMIN')

      // starts search for all projects associated with user
      users.forEach(async user => {
        const projects = this.$fire.qs.toArray(await this.$firestore
          .collection('projects')
          .where('org_id', '==', user.org_id)
          .where('members', 'array-contains', user.id)
          .get())
        this.projectsByUser[user.id] = projects
        this.$forceUpdate()
      })

      this.users = users
    },
    openInviteUser () {
      this.$modals.show({
        name: 'invite-user',
        org: this.$store.state.org,
      })
    },
    onViewProgress (user) {
      this.progressesRetrievePromise = null
      this.overwriteProjects = this.projectsByUser[user.id]
      this.progressesRetrievePromise = async () => this.$fire.qs.toArray(
        await this.$firestore
          .collection('progresses')
          .where('org_id', '==', user.org_id)
          .where('created_by', '==', user.id)
          .orderBy('created_at', 'desc').get()
      )
    },
    showCreateInviteLink () {
      this.$modals.show({
        name: 'create-invite-link',
        org: this.$store.state.org,
      })
    },
    editUser (user) {
      this.$modals.show({
        name: 'edit-user',
        user,
        onSuccess: this.getUsers,
      })
    },
    async deleteUser (user) {
      if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This cannot be undone.`)) return

      this.$showLoading()
      try {
        await this.$HTTP({
          method: 'delete',
          uri: `users/${user.id}`,
        })
        this.getUsers()
        this.$toast('Deleted!')
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete user')
      } finally {
        this.$hideLoading()
      }
    },
  },
  mounted () {
    this.getUsers()
  },
}
</script>

<template lang="pug">
  #super-admin-users-main.admin-main
    .super-admin-users-container.admin-container
      .header
        .pro-title Studio Members
          add-button(
            :onClick='openInviteUser'
            v-if='isAdmin'
          )
        .pro-button.major(
          @click='showCreateInviteLink'
        ) Create Invite Link
      .content
        .users-area
          .search-area
            pro-input(
              v-model='search'
              :options='{title: "Search by name"}'
            )
          .users-holder
            .user(
              v-if='!users'
            )
              img(
                src='@/assets/svg/infiniti.svg'
              )
            .user.italic(
              v-else-if='!filteredUsers.length'
            ) No users
            .user(
              v-for='user in filteredUsers'
            )
              .image-area
                router-link.pro-member.card.small(
                  :to='{name: "Member", params: {"userId": user.id}}'
                )
                  .image
                    img(
                      :src='user.photo_url'
                    )
                  .name {{user.first_name}} {{user.last_name}}
                .icons-holder
                  i.material-icons(
                    @click='editUser(user)'
                  ) edit
                  i.material-icons.red(
                    @click='deleteUser(user)'
                  ) delete
              .projects-holder
                .loading(
                  v-if='!projectsByUser[user.id]'
                )
                  img(
                    src='@/assets/svg/infiniti.svg'
                  )
                .italic(
                  v-else-if='!projectsByUser[user.id].length'
                ) No projects
                router-link.project-pill(
                  v-for='project in projectsByUser[user.id]'
                  :to='{name: "Project", params: {projectId: project.id}}'
                  :key='project.id'
                ) 
                  .name {{project.name}}
                  i.material-icons chevron_right
              .show-progress.pro-button.minor(
                @click='() => onViewProgress(user)'
              ) View Progress
        .progress-log-area
          progresses-log(
            v-if='progressesRetrievePromise'
            :retrievePromise='progressesRetrievePromise'
            :overwriteProjects='overwriteProjects'
          )
          .pro-title(
            v-else
          ) Click 'View Progress' to view a member's progress

</template>

<style lang="sass" scoped>
  #super-admin-users-main.admin-main
    .super-admin-users-container.admin-container
      height: calc(100vh - #{$nav-height})
      .header
        display: grid
        grid-template-columns: max-content max-content
        column-gap: 2rem
        .pro-button
          height: fit-content
      .content
        margin-top: 2rem
        display: grid
        grid-template-columns: 1fr 1fr
        column-gap: 2rem
        height: calc(100vh - #{$nav-height} - 8rem)
        .progress-log-area
          padding: 1rem
          height: 100%
          overflow-y: scroll
          > .pro-title
            text-align: center
            color: grey
            font-size: 22px
        .users-area
          .users-holder
            .user
              display: grid
              padding: 1rem 0
              grid-template-columns: min-content auto max-content
              align-items: center
              border-bottom: thin solid lightgrey
              column-gap: 1rem
              .image-area
                display: grid
                row-gap: 1rem
                .pro-member
                  margin-right: 0
                .icons-holder
                  display: grid
                  grid-template-columns: min-content min-content
                  column-gap: 2rem
                  justify-items: center
                  justify-self: center
                  > i
                    font-size: 18px
                    cursor: pointer
                    &.red
                      color: darkred
              .projects-holder
                display: flex
                flex-wrap: wrap
                height: fit-content
                .loading
                  > img
                    height: 1rem
                .project-pill
                  background-color: $orange
                  color: white
                  border-radius: 1rem
                  padding: .5rem 1rem
                  margin: 0 .5rem .5rem 0
                  display: grid
                  grid-template-columns: auto auto
                  column-gap: .25rem
                  align-items: center
                  cursor: pointer
                  transition: all .25s
                  font-size: 12px
                  &:hover
                    transform: scale(1.05)
                  > i
                    height: 1rem
                    line-height: 1rem
                    width: .5rem



            
</style>