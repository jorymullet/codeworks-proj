<script>
import AdminNav from '$common/AdminNav'
import linkGroups from '@/global/js/super-nav-links.json'
export default {
  name: 'SuperAdmin',
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
  #super-admin-main
    .super-admin-container
      .content
        admin-nav.admin-nav(
          :linkGroups='linkGroups'
        )
        router-view.router-view
</template>

<style lang="sass">
  #super-admin-main
    .super-admin-container
      > .content
        display: grid
        grid-template-columns: max-content auto
        .router-view
          height: calc(100vh - #{$nav-height})
          .admin-container
            padding: 40px 80px
            .header
              .title
                @extend .font-1-bold
                font-size: 40px
</style>