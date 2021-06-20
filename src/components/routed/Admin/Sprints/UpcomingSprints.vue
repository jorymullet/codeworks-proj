<script>
import Entities from '$common/Entities'
export default {
  name: 'UpcomingSprints',
  components: {
    'entities': Entities,
  },
  props: {
    retrievePromise: Function,
    title: String,
    noAdd: Boolean,
  },
  data() {
    return {
      opened: null,
      sprintData: null,
      lastChosen: null,
    }
  },
  computed: {
    org () {
      return this.$store.state.org
    },
  },
  methods: {
    showEditSprint (options) {
      this.$modals.show({
        name: 'edit-sprint',
        ...options,
        onSuccess: () => this.$proEmit('retrieve-sprints')
      })
    },
    async inviteUsers (users, sprint) {
      if (!(users && users.length)) return this.$toast('You did not select any users.')

      this.$showLoading()

      try {
        await this.$HTTP({
          method: 'post',
          uri: `sprints/${sprint.id}/invites`,
          body: {
            users,
            origin: location.origin,
          }
        })
        this.$toast('Users have been invited!')
      } catch (err) {
        console.error(err)
        const message = (err && err.body && err.body.message) || 'Could not invite users'
        this.$toast(message)
      } finally {
        this.$hideLoading()
      }
    },
    showInviteUsers (sprint) {
      this.$modals.show({
        name: 'user-chooser',
        retrievePromise: async () => {
          const users = this.$fire.qs.toArray(await this.$firestore.collection('users').where('org_id', '==', this.org.id).get())
          return users
        },
        onSuccess: (users) => this.inviteUsers(users, sprint),
        multiple: true,
        prompt: 'Choose users you would like to invite to this sprint.',
        title: 'Invite Users',
        searchOptions: {field: u => u.first_name + ' ' + u.last_name, by: 'Name'},
      })
    },
    async getSprintDetails (sprint, force) {
      this.opened[sprint.id] = force || !this.opened[sprint.id]
      if (this.opened[sprint.id]) {
        this.lastChosen = sprint
        if (this.sprintData[sprint.id] && !force) return

        this.sprintData[sprint.id] = null

        const pendingInvites = this.$fire.qs.toArray(await this.$firestore
          .collection('invites')
          .where('sprint_id', '==', sprint.id)
          .where('status', '==', 'PENDING')
          .get()
        )

        // just returns the user ID and project_id
        const sprintMembersIds = this.$fire.qs.toArray(
          await this.$firestore.collection(`sprints/${sprint.id}/sprint_members`).get()
        )

        // we then make arrays with all user and project ids to retrieve
        const [userIds, projectIds] = ['id', 'project_id'].map(field => sprintMembersIds.map(sm => sm[field]).uniquify())

        // consolidate retrieve options to DRY up some code
        const retrieveOptions = [{
          ids: userIds,
          collection: 'users',
        }, {
          ids: projectIds,
          collection: 'projects',
        }]

        // we retrieve entities and create objects to pick from
        const [users, projects] = await Promise.all(retrieveOptions.map(async options => {
          const entities = (await Promise.all(options.ids.map(id => this.$firestore.doc(`${options.collection}/${id}`).get()))).map(ss => ss.data()).filter(Boolean)
          return entities.reduce((obj, entity) => {
            obj[entity.id] = entity
            return obj
          }, {})
        }))

        // finally, we have actual SprintMembers with both user and project attached.
        const sprintMembers = sprintMembersIds
          .filter(sm =>  users[sm.id] && projects[sm.project_id]) // check that the entities exist
          .map(sm => ({user: users[sm.id], project: projects[sm.project_id]}))

        this.sprintData[sprint.id] = {
          pendingInvites,
          sprintMembers,
        }
      }
    },
    onLoaded (data) {
      const {entities} = data
      if (entities) {
        const fields = ['opened', 'sprintData']
        fields.forEach(field => {
          this[field] = this.$clone(entities.reduce((obj, sprint) => {
            obj[sprint.id] = false
            return obj
          }, {}))
        })
      }
    },
  },
}
</script>

<template lang="pug">
  .upcoming-sprints-main
    .upcoming-sprints-container
      entities(
        :retrievePromise='retrievePromise'
        :filters='[]'
        :title='title'
        refreshString='retrieve-sprints'
        v-slot='{entities}'
        :noAdd='noAdd'
        @loaded='onLoaded'
      )
        .sprint(
          v-for='sprint in entities'
          v-if='opened'
        )
          .details
            .name-date 
              .name {{sprint.name}}
              .date {{$getSprintDatesString(sprint)}}
            .view-more.pro-button.minor(
              @click='getSprintDetails(sprint)'
            ) {{opened[sprint.id] ? 'Hide' : 'View'}} Members
            .icon
              i.material-icons(
                @click='() => showEditSprint({sprint})'
              ) edit
            .icon
              i.material-icons(
                @click='() => showInviteUsers(sprint)'
              ) person_add
          .members-area(
            :class='opened[sprint.id] ? "opened" : ""'
          )
            .loading(
              v-if='!sprintData[sprint.id]'
            )
              img(
                src='@/assets/svg/infiniti.svg'
              )
            .content(
              v-else
            )
              .users-area
                .title Pending Invites ({{sprintData[sprint.id].pendingInvites.length}})
                .users-holder.card
                  .user(
                    v-for='({invitee}) in sprintData[sprint.id].pendingInvites'
                  )
                    .pro-member.small.card
                      .image
                        img(
                          :src='invitee.photo_url'
                        )
                      .name {{invitee.first_name}} {{invitee.last_name}}
              .users-area
                .title Sprint Members ({{sprintData[sprint.id].sprintMembers.length}})
                .users-holder.card
                  .user(
                    v-for='sm in sprintData[sprint.id].sprintMembers'
                  )
                    .pro-member.small.card
                      .image
                        img(
                          :src='sm.user.photo_url'
                        )
                      .name {{sm.user.first_name}} {{sm.user.last_name}}
                    .with with 
                      router-link(
                        :to='{name: "Project", params: {projectId: sm.project.id}}'
                      ) {{sm.project.name}}
                  

</template>


<style lang="sass">

  .upcoming-sprints-main .entities-main .entities-container .content .entities-holder
    min-height: 50vh !important
    max-height: 60vh !important
  // do not used scoped or it messes up first entity styling
    
  .upcoming-sprints-main
    .upcoming-sprints-container
      .sprint
        border-bottom: thin solid lightgrey
        .members-area
          display: none
          background: $grey
          padding: 1rem 2rem
          //box-shadow: 0 0 .25rem 0 white inset
          border: thin #aaa solid
          max-height: 20rem
          .content
            display: grid
            grid-template-columns: max-content max-content
            column-gap: 2rem
          &.opened
            display: grid
          .title
            font-weight: bold
            margin-bottom: 1rem
          .users-holder
            //box-shadow: 0 0 .25rem 0 black inset
            padding: 1rem
            background: white
            .user
              display: grid
              grid-template-columns: min-content auto
              margin-bottom: .5rem
              align-items: center
              .pro-member
                background: white
        .details
          display: grid
          grid-template-columns: 5fr max-content min-content min-content
          align-items: center
          column-gap: 1rem
          padding: 1rem 1.5rem
          border-radius: .25rem
          transition: background-color .1s
          user-select: none
          .name-date
            .date
              font-size: 12px
              margin-top: .5rem
              color: #888
          .icon
            width: 1rem
            height: 2rem
            position: relative
            cursor: pointer
            > img
              height: 100%
            > i
              font-size: 20px
              height: 20px
              align-self: center
              position: absolute
              top: 50%
              transform: translateY(-50%)

</style>