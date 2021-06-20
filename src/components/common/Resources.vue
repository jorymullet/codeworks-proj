<script>
import resourceTypes from '@/global/js/resource-types.json'
import * as manager from '@/global/js/entity-manager'
import Entities from '$common/Entities'
export default {
  name: 'Resources',
  components: {
    'entities': Entities,
  },
  props: {
    retrievePromise: Function,
    filters: Array,
    dropdowns: Array,
    preassociatedProjects: Array,
    searchOptions: Object,
    headerButtons: Array,
    canEdit: Boolean,
    title: {
      default: 'Resources',
    },
    isStudioResources: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      resourceTypes,
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
  },
  methods: {
    showEditResource () {
      this.$modals.show({
        name: 'edit-resource',
        isNew: true,
        onSuccess: () => this.$proEmit('retrieve-resources'),
        preassociatedProjects: this.preassociatedProjects,
        isStudioResource: this.isStudioResources,
        hardClose: true,
      })
    },
    async showViewResource (resource) {
      const viewOptions = await manager.resources.getViewOptions(resource, {
        canEdit: this.canEdit, 
        addToUser: async () => {

          const resourcesRef = this.$firestore.collection('resources')
          const resourceId = resourcesRef.doc().id
          const uid = this.user.id
          const now = Date.now()
          const copiedResource = {
            ...resource,
            id: resourceId,
            created_at: now,
            created_by: uid,
            updated_at: now,
            updated_by: uid,
            from_studio_link: resource.id,
            is_studio_resource: false,
          }

          try {
            await resourcesRef.doc(resourceId).set(copiedResource)
            this.$toast('Copied to your resources!')
            this.$proEmit('retrieve-resources')
            this.$modals.hide('view-entity')
          } catch (err) {
            console.error(err)
            this.$toast('Could not copy resource.')
          }

          this.$hideLoading()
        }})
      this.$modals.show(viewOptions)
    },
  },
}
</script>

<template lang="pug">
  #resources-main
    .resources-container
      entities(
        :retrievePromise='retrievePromise'
        :filters='filters'
        :dropdowns='dropdowns'
        :showEditEntity='showEditResource'
        :title='title'
        refreshString='retrieve-resources'
        v-slot='{entities}'
        :searchOptions='searchOptions'
        :headerButtons='headerButtons'
      )
        .resource(
          v-for='resource in entities'
          @click='() => showViewResource(resource)'
        )
          .icon
            i.material-icons {{resource.type ? resourceTypes[resource.type].icon : 'person'}}
          .title.dotdotdot {{resource.title}}
          template(
            v-if='!isStudioResources'
          )
            .link(
              v-if='resource.url'
              @click.stop=''
            )
              a(
                :href='resource.url'
                target='_blank'
              ) Link
            .link(
              v-else
            )
            .date {{$buildDate(resource.created_at, '{month}/{date}/{year}', {to2: true})}}
          template(
            v-else
          )
            i.material-icons visibility
</template>

<style lang="sass">
  #resources-main
    .resources-container
      .resource
        display: grid
        grid-template-columns: min-content auto min-content min-content
        align-items: center
        column-gap: 1rem
        cursor: pointer
        padding: .5rem 1rem
        border-radius: .25rem
        transition: background-color .1s
        &.no-interact
          cursor: default
          grid-template-columns: min-content auto
          &:hover
            background-color: transparent
        &:hover
          background-color: $grey
        .icon
          width: 1rem
          height: 2rem
          position: relative
          > img
            height: 100%
          > i
            font-size: 18px
            height: 18px
            align-self: center
            position: absolute
            top: 50%
            transform: translateY(-50%)


</style>