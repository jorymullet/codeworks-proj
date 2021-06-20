<script>
import Entities from '$common/Entities'
export default {
  name: 'Sprints',
  components: {
    'entities': Entities,
  },
  props: {
    retrievePromise: Function,
    title: String,
    isAdmin: Boolean,
    headerButtons: Array,
    noAdd: Boolean,
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    org () {
      return this.$store.state.org
    },
  },
  methods: {
    showEditSprint (options) {
      this.$modals.show({
        name: this.isAdmin ? 'edit-sprint' : 'join-sprint',
        ...options,
        onSuccess: () => this.$proEmit('retrieve-sprints'),
      })
    },
    showInviteUser (sprint) {
      this.$modals.show({
        name: 'sprint-invite',
        sprint,
      })
    },
  },
}
</script>

<template lang="pug">
  #sprints-main
    .sprints-container
      entities(
        :retrievePromise='retrievePromise'
        :filters='[]'
        :showEditEntity='showEditSprint'
        :title='title'
        refreshString='retrieve-sprints'
        v-slot='{entities}'
        :noAdd='!isAdmin || noAdd'
        :headerButtons='headerButtons'
      )
        .sprint(
          v-for='sprint in entities'
        )
          .name-date 
            .name {{sprint.name}}
            .date {{$getSprintDatesString(sprint)}}
          .project-count {{Number.isSafeInteger(sprint.num_projects) ? `${sprint.num_projects} project(s)` : ''}}
          router-link.view-sprints(
            :to='{name: "AdminProjects", params: {orgId: org.id}, query: {filterBySprint: sprint.id}}'
            v-if='isAdmin'
          ) View Sprinters
          a(
            :href='sprint.space_url'
            target='_blank'
          ) Go To Space
          .icon
            i.material-icons(
              @click='() => showEditSprint({sprint})'
            ) edit
            
</template>

<style lang="sass">
  #sprints-main
    .sprints-container
      position: relative
      > .pro-button
        position: absolute
        right: 1rem
        top: 1rem
        z-index: 2
      .sprint
        display: grid
        grid-template-columns: 5fr max-content max-content max-content min-content min-content
        align-items: center
        column-gap: 1rem
        padding: 1rem 1.5rem
        border-radius: .25rem
        transition: background-color .1s
        user-select: none
        &:hover
          background-color: $grey
        .name-date
          .date
            font-size: 12px
            margin-top: .5rem
            color: #888
        > a
          display: grid
          align-items: center
          grid-template-columns: max-content min-content
          column-gap: .5rem
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