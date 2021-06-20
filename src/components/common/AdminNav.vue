<script>
export default {
  name: 'AdminNav',
  props: {
    linkGroups: Array,
  },
}
</script>

<template lang="pug">
  .admin-nav-main
    .admin-nav-container.card
      .link-group(
        v-for='group in linkGroups'
      )
        .links
          template(
            v-for='link in group.links'
          )
            router-link.link(
              v-if='link.route'
              :class='$route.name === link.route ? "chosen" : ""'
              :to='{name: link.route}'
              :key='link.name'
            ) {{link.name}}
            .link(
              v-else
              @click='link.action'
            ) {{link.name}}
      .footer
        .link(
          @click='() => $store.commit("logout")'
        ) Log out
</template>

<style lang="sass" scoped>
  @import '$vars'
  .admin-nav-main
    width: 15.5rem
    .admin-nav-container
      padding: 6.5rem 4rem 2.5rem 2.5rem
      height: 100%
      min-height: 100vh
      top: 0
      position: fixed
      .link-group
        margin-bottom: 16px
        .title
          font-weight: 400
          cursor: default
        .links
          margin: 4px 0
          cursor: pointer
          .link
            font-size: 16px
            margin-bottom: .5rem
            display: block
            color: #777
            &.chosen
              color: #222
              font-weight: bold
      .footer
        position: absolute
        bottom: 2rem
        left: 2rem
        .link
          cursor: pointer
          color: #777

</style>
