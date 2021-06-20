<script>
export default {
  name: 'AddButton',
  props: {
    onClick: Function,
  },
}
</script>

<template lang="pug">
  .add-button-main
    .add-button-container(
      @click='onClick'
    )
      i.material-icons add_box
</template>

<style lang="sass" scoped>
  .add-button-main
    display: inline-grid
    user-select: none
    cursor: pointer
    align-items: center
    .add-button-container
      display: grid
      align-items: center
      margin-left: .5rem
      i
        font-size: 28px
        transform: translateY(20%)
</style>