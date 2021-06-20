<script>
import SprintTypes from '$common/SprintTypes'
export default {
  name: 'SuperSprints',
  components: {
    'sprint-types': SprintTypes,
  },
  data() {
    return {
      defaultSprintTypes: null,
    }
  },
  methods: {
    async getSprintTypes () {
      const adminSettings = (await this.$firestore.doc('admin/settings').get()).data() || {}
      this.defaultSprintTypes = adminSettings.sprint_types || []
    },
  },
  async mounted () {
    await this.getSprintTypes()
  }
}
</script>

<template lang="pug">
  #super-sprints-main.admin-main
    .super-sprints-container.admin-container
      .content
        .sprint-types-area
          sprint-types(
            title='Default Sprint Types'
            :canEdit='true'
            :sprintTypes='defaultSprintTypes'
            dbRef='admin/settings'
          )
</template>

<style lang="sass">
  #super-sprints-main
    .super-sprints-container
      .content
        .sprint-types-area
          .title
            font-size: 18px
</style>