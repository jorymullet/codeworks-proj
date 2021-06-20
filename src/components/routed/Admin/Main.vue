<script>
import AdminNav from '$common/AdminNav'
import linkGroups from '@/global/js/admin-nav-links.js'
export default {
  name: 'AdminMain',
  components: {
    'admin-nav': AdminNav,
  },
  data () {
    return {
      linkGroups,
    }
  },
}
</script>


<template lang="pug">
  .admin-main-main
    .admin-main-container
      .content
        admin-nav.admin-nav(
          :linkGroups='linkGroups'
        )
        router-view.router-view
</template>

<style lang="sass">
  @import '$vars'
  .admin-main-main
    .admin-main-container
      height: calc(100vh - $nav-height)
      overflow-y: scroll
      background-color: white
      > .content
        display: grid
        grid-template-columns: max-content auto
        .router-view
          height: calc(100vh - #{$nav-height})
          .admin-container
            padding: 40px 80px
            > .header
              > .pro-title
                font-size: 32px
            > .content
              margin-top: 2rem
  @media (max-width: #{$side-nav-min})
    .admin-main-main
      .admin-main-container
        > .content
          grid-template-columns: auto
          .admin-nav
            display: none
          .router-view
            .admin-container
              padding: 32px
</style>
