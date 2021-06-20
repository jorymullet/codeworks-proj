<script>
export default {
  name: 'ProjectMain',
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
  #project-main-main
    .project-main-container
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
  #project-main-main
    .project-main-container
      background-color: white
      .router-view
        height: calc(100vh - #{$nav-height})
        .project-container
          padding: 3rem 3rem 8rem 3rem
          display: grid
          max-width: 90rem
          margin: 0 auto
      @media (max-width: 600px)
        .router-view
          .project-container
            padding: 24px 40px 100px 40px
            .copy
              justify-items: left
              .title
                font-size: 36px
              .description
                min-width: unset !important
</style>
