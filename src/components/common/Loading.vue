<script>
export default {
  name: 'Loading',
  data () {
    return {
      seeLoading: false,
    }
  },
  methods: {
    readyListeners () {
      this.$proOn('setLoading', (val) => {
        this.seeLoading = val
      })
    },
  },
  mounted () {
    this.readyListeners()
  },
}
</script>

<template lang="pug">
  .loading-main
    transition(
      name='fade'
    )
      .loading-container(
        v-if='seeLoading'
      )
        .image
          img(
            src='@/assets/svg/infiniti.svg'
          )
</template>

<style lang="sass" scoped>
  @import '$vars'
  @import '$styles/transitions.sass'
  .loading-main
    .loading-container
      height: 100vh
      width: 100vw
      position: fixed
      top: 0
      left: 0
      background-color: white
      z-index: $loading-index
      display: grid
      .image
        align-self: center
        justify-self: center
</style>
