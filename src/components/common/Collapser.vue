<script>
export default {
  name: 'Collapser',
  props: {
    title: String,
  },
  data() {
    return {
      closed: true,
    }
  },
}
</script>

<template lang="pug">
  .collapser-main
    .collapser-container(
      :class='closed ? "closed" : ""'
    )
      .header(
        @click='closed = !closed'
      )
        .pro-title {{title}}
        .icon(
          :class='closed ? "closed" : ""'
        )
          i.material-icons expand_more
      slot(
        v-if='!closed'
      )
</template>

<style lang="sass" scoped>
  @import '$styles/transitions'
  .collapser-main
    .collapser-container
      margin-bottom: 2rem
      &:closed
        margin-bottom: 0
      .header
        border-bottom: thin solid grey
        display: grid
        grid-template-columns: auto min-content
        align-items: center
        margin-bottom: 1rem
        cursor: pointer
        .icon
          transform: rotate(180deg)
          transition: .25s
          &.closed
            transform: rotate(0deg)

</style>