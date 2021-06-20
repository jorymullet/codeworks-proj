<script>
import Entities from '$common/Entities'
import * as manager from '@/global/js/entity-manager'
export default {
  name: 'Progresses',
  components: {
    'entities': Entities,
  },
  props: {
    retrievePromise: Function,
    filters: Array,
    dropdowns: Array,
    preassociatedProjects: Array,
    title: String,
    headerButtons: Array,
  },
  computed: {
    user () {
      return this.$store.state.user
    },
  },
  methods: {
    showEditProgress () {
      this.$modals.show({
        name: 'edit-progress',
        isNew: true,
        onSuccess: () => this.$proEmit('retrieve-progresses'),
        preassociatedProjects: this.preassociatedProjects,
      })
    },
    async showViewProgress (progress) {
      const viewOptions = await manager.progresses.getViewOptions(progress)
      this.$modals.show(viewOptions)
    },
  },
}
</script>

<template lang="pug">
  #progresses-main
    .progresses-container
      entities(
        :retrievePromise='retrievePromise'
        :filters='filters'
        :dropdowns='dropdowns'
        :showEditEntity='showEditProgress'
        :title='title || "Progress"'
        refreshString='retrieve-progresses'
        v-slot='{entities}'
        :noCard='false'
        :noAdd='true'
        :headerButtons='headerButtons'
      )
        .progresses-holder
          .progress.card(
            v-for='progress in entities'
            @click='() => showViewProgress(progress)'
          )
            .icon
              i.material-icons {{progress.type === 'USER' ? 'date_range' : 'donut_large'}}
            .details
              .date {{$buildDate(progress.created_at, '{month}/{date}/{year}')}}
              .projects-holder(
                @click.stop=''
              )
                router-link.project(
                  v-for='(project, idx) in progress.projects'
                  :to='{name: "Project", params: {projectId: project.id}}'
                  :key='idx'
                )
                  .name {{project.name}}
                .no-projects.italic(
                  v-if='!(progress.projects && progress.projects.length)'
                ) No projects
</template>

<style lang="sass">
  #progresses-main
    .progresses-container
      position: relative
      .view-all
        position: absolute
        right: 1rem
        top: 1rem
      .content
        overflow: scroll
      .entities-holder
        height: unset
        //width: fit-content
        .progresses-holder
          display: grid
          grid-template-columns: 1fr 1fr
          column-gap: 1rem
          padding: 1rem
          .progress, .entity
            display: grid
            grid-template-columns: min-content auto
            column-gap: 1rem
            cursor: pointer
            padding: .5rem 1rem
            border-radius: .25rem
            transition: background-color .1s
            align-items: center
            padding: 1rem
            &:hover
              background-color: $grey
            .icon
              position: relative
              > img
                height: 100%
              > i
                font-size: 28px
            .details
              display: grid
              color: grey
              justify-items: right
              max-width: 10rem
              .date
                font-size: 12px
                margin-bottom: .25rem
              .projects-holder
                display: flex
                width: 100%
                overflow-x: scroll
                box-shadow: 0 0 .1rem 0 lightgrey inset
                padding: .25rem
                .project
                  background-color: $mild-blue
                  color: white
                  padding: .25rem .5rem
                  margin-right: .5rem
                  font-size: 12px
                  border-radius: .25rem
                  .name
                    width: max-content
              .summary
                width: 100%
                > *
                  margin: 0



</style>