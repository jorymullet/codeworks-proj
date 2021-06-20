<script>
export default {
  name: 'PublicMain',
  watch: {
    '$route' (newRoute, oldRoute) {
      const isHigherRoute = newRoute.meta.transIndex > oldRoute.meta.transIndex
      this.transtionName = isHigherRoute ? 'slide-left' : 'slide-right'
    },
  },
  data () {
    return {
      transtionName: 'slide-left',
    }
  },
}
</script>


<template lang="pug">
  .public-main-main
    .public-main-container
      transition(
        :name='transtionName'
        mode='out-in'
      )
        router-view.router-view(
          :key="$route.name"
        )
</template>

<style lang="sass">
  @import '$vars'
  @import '$styles/transitions.sass'
  .public-main-main
    .public-main-container
      background-color: white
      .router-view
        height: calc(100vh - #{$nav-height})
        .public-container
          padding: 40px 40px 100px 40px
          display: grid
          justify-items: center
      @media (max-width: 600px)
        .router-view
          .public-container
            padding: 24px 40px 100px 40px
            .copy
              justify-items: left
              .title
                font-size: 36px
              .description
                min-width: unset !important
</style>
