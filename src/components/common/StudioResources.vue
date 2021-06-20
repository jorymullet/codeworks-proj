<script>
import Entities from '$common/Entities'
export default {
  name: 'StudioResources',
  components: {
    'entities': Entities,
  },
  props: {
    isAdmin: Boolean,
    org: Object,
    title: {
      default: 'Studio Resources'
    },
  },
  methods: {
    async retrievePromise () {
      return this.$fire.qs.toArray(
        await this.$firestore.collection('resources')
          .where('org_id', '==', this.org.id)
          .where('is_studio_resource', '==', true)
          .get()
      )
    },
    showEditResource (options) {
      this.$modals.show({
        name: 'edit-resource',
        isStudioResource: true,
        ...options,
      })
    },
  },
}
</script>

<template lang="pug">
  .studio-resources-main
    .studio-resources-container
      entities(
        :retrievePromise='retrievePromise'
        :filters='[]'
        :title='title'
        :showEditEntity='() => showEditResource({isNew: true})'
        refreshString='retrieve-resources'
        v-slot='{entities}'
        :noAdd='!isAdmin'
      )
</template>

<style lang="sass" scoped>
  .studio-resources-main
    .studio-resources-container
</style>