<script>
import AddButton from '$common/AddButton.vue'
export default {
  name: 'SprintTypes',
  props: {
    dbRef: String,
    sprintTypes: Array,
    title: String,
    canEdit: Boolean,
  },
  components: {
    'add-button': AddButton,
  },
  methods: {
    openEditSprintType (options) {
      this.$modals.show({
        name: 'edit-sprint-type',
        ...this.$props,
        ...options,
      })
    },
  },
}
</script>

<template lang="pug">
  #sprint-types-main
    .sprint-types-container.card
      .header
        .pro-title {{title}}
          add-button(
            v-if='canEdit'
            :onClick='() => openEditSprintType({isNew: true})'
          )
      .content
        .sprint-types-holder
          .sprint-type(
            v-if='!(sprintTypes && sprintTypes.length)'
          )
            .title.italic No sprint types
          .sprint-type(
            v-else
            v-for='(type, idx) in sprintTypes'
          )
            .title {{type.name}}
            i.material-icons(
              v-if='canEdit'
              @click.stop='()=> openEditSprintType({idx, sprintType: type})'
            ) edit


</template>

<style lang="sass" scoped>
  #sprint-types-main
    .sprint-types-container
      //max-width: 20rem
      .content
        .sprint-types-holder
          .sprint-type
            display: grid
            grid-template-columns: auto min-content
            padding: .5rem 0
            align-items: center
            width: 100%
            > a
              &:hover
                text-decoration: underline
            > i
              margin-left: .5rem
              font-size: 22px
              color: #555
              cursor: pointer

</style>