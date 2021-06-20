<script>
import linkGroups from '@/global/js/admin-nav-links.js'
import {decideFontColor} from '@/global/js/color.js'
export default {
  name: 'ProNav',
  data() {
    return {
      seeMobileNav: false,
      seeMiniMenu: false,
      linkGroups,
      links: {
        admin: {
          seeIf: () => ['SUPER_ADMIN', 'ADMIN'].includes(this.trueUser && this.trueUser.role),
          title: 'Dashboard',
          routerOptions: () => {
            const routerOptions = {
              ADMIN: {name: 'Admin', params: {orgId: this.org && this.org.id}},
              SUPER_ADMIN: {name: 'SuperAdmin'},
            }[this.trueUser.role]
            return routerOptions
          },
        },
        myProfile: {
          seeIf: () => ['ADMIN', 'MEMBER'].includes(this.trueUser && this.trueUser.role),
          title: 'Home',
          routerOptions: () => ({name: 'Member', params: {userId: this.trueUser.id}}),
        },
        myResearch: {
          seeIf: () => this.user && this.user.id && (this.user.role !== 'SUPER_ADMIN'),
          title: 'My Research',
          routerOptions: () => ({name: 'MemberResearch', params: {userId: this.user && this.user.id}}),
        },
        sprints: {
          seeIf: () => this.user && (this.user.role !== 'SUPER_ADMIN') && this.org,
          title: 'Sprints',
          routerOptions: () => ({name: 'MemberSprints', params: {userId: this.user.id}}),
        },
        goToGuild: {
          seeIf: () => this.org && this.auth,
          title: 'Guild',
          click: () => window.open(`https://${process.env.VUE_APP_AUTH0_DOMAIN}/authorize?client_id=${process.env.VUE_APP_AUTH0_CIRCLE_CLIENT_ID}&redirect_uri=https%3A%2F%2F${this.org.circle_subdomain}.circle.so%2Foauth2%2Fcallback&response_type=code&scope=openid+profile+email+picture`, '_blank')
        },
        logout: {
          seeIf: () => this.auth && false,
          title: 'Logout',
          click: () => this.$store.commit('logout'),
        },
        login: {
          seeIf: () => !this.auth,
          title: 'Login',
          click: () => this.$router.push({name: 'Login'}),
        },
      }
    }
  },
  computed: {
    auth () {
      return this.$store.state.auth
    },
    user () {
      return this.$store.state.user
    },
    trueUser () {
      return this.$store.state.trueUser
    },
    org () {
      return this.$store.state.org
    },
    pictureUrl () {
      return this.user && this.user.photo_url
    },
    logoUrl () {
      return this.$dig(this, ['org', 'logos', 'rectangle']) || 'https://uploads-ssl.webflow.com/604fd7391ffa426b4e1adc9e/60590a44c18dfa34df2c8e23_yellow-word-mark-01.svg'
    },
    headerText () {
      return this.$dig(this, ['org', 'studio_name',]) || 'STUDIO'
    },
    navBackground () {
      return this.$dig(this, ['org', 'brand_colors', 'primary']) || '#E2E8EC'
    },
    fontColor () {
      return decideFontColor(this.navBackground)
    },
    logoRouterOptions () {
      if (!this.trueUser) return {name: 'Login',}

      const routerOptions = {
        MEMBER: {name: 'Member', params: {userId: this.trueUser.id},},
        ADMIN: {name: 'Admin', params: {orgId: this.trueUser.org_id},},
        SUPER_ADMIN: {name: 'SuperAdmin',}
      }[this.trueUser.role]

      if (!routerOptions) return {name: 'Login',}

      return routerOptions
    },
  },
  methods: {
    logout () {
      this.seeMiniMenu = false
      this.$store.commit('logout')
    },
    onLinkClick (link) {
      this.seeMobileNav = false

      if (link.route === this.$route.name) return
      this.$router.push({name: link.route})
    },
    showEditUser () {
      this.$modals.show({
        name: 'edit-user',
        user: this.user,
        onSuccess: () => this.$store.commit('refreshUser'),
      })
      this.seeMiniMenu = false
    },
    closeMiniMenu () {
      this.seeMiniMenu = false
    },
  },
  mounted () {
    window.addEventListener('click', this.closeMiniMenu, false)
  },
  beforeDestroy () {
    window.removeEventListener('click', this.closeMiniMenu, false)
  },
}
</script>

<template lang="pug">
  .pro-nav-main(
    :style='{backgroundColor: navBackground,}'
  )
    .pro-nav-container
      .title-holder
        router-link.title(
          :to='logoRouterOptions'
        )
          .logo(
            :style='{color: fontColor}'
          ) {{headerText}}
      .actions
        component.pro-button(
            v-for='(link, idx) in links'
            v-if='link.seeIf()'
            :is='link.routerOptions ? "router-link" : "div"'
            :to='link.routerOptions && link.routerOptions()'
            @click='() => link.click ? link.click() : null'
            v-html='link.title'
            :key='idx'
            :style='{color: fontColor}'
          )
        .profile-image(
          v-if='pictureUrl'
          @click.stop='seeMiniMenu = true'
        )
          img(
            :src='pictureUrl'
          )
          .mini-menu.card(
            v-if='seeMiniMenu'
          )
            .pro-button.major(
              @click='showEditUser'
            ) Edit Profile
            .pro-button.minor(
              @click='logout'
            ) Logout
      i.mobile-nav-button.material-icons(
        @click='seeMobileNav = true'
        v-if='$store.state.auth'
      ) menu
    transition(
      name='fade'
    )
      .mobile-nav(
        v-if='seeMobileNav'
      )
        .mobile-nav-container(
          @click='seeMobileNav = false'
        )
          .content(
            @click.stop=''
          )
            .header
            .link-groups-holder
              .link-group(
                v-for='linkGroup in linkGroups'
              )
                component(
                  v-for='(link, idx) in linkGroup.links'
                  :is='link.routerOptions ? "router-link" : "div"'
                  :to='link.routerOptions && link.routerOptions()'
                  :class='link.route === $route.name ? "chosen" : ""'
                  @click='() => link.click ? link.click() : null'
                  :key='idx'
                )
                  .link.font-1-bold(
                    v-for='link in linkGroup.links'
                    :class='link.route === $route.name ? "chosen" : ""'
                    @click='onLinkClick(link)'
                    ) {{link.name}}
            .footer
              .link.font-1-bold(
                v-if='$auth.currentUser'
                @click='() => $store.commit("logout")'
              ) Log out

</template>

<style lang="sass" scoped>
  .pro-nav-main
    position: relative
    z-index: $nav-index
    background-color: $grey
    .mobile-nav
      display: none
    .pro-nav-container
      height: $nav-height
      display: grid
      grid-template-columns: auto auto
      align-items: center
      padding: 0 3rem
      box-sizing: border-box
      .title-holder
        width: fit-content
        cursor: pointer
        .title
          > img
            height: 1.5rem
          .logo
            text-transform: uppercase
            font-size: 20px
            border: 2px solid
            padding: .25rem .5rem
      .actions
        justify-self: end
        display: flex
        align-items: center
        > .pro-button
          cursor: pointer
          text-decoration: none
          color: #222
          font-size: 12px
        .profile-image
          width: 2rem
          height: 2rem
          align-self: center
          margin-left: 1rem
          cursor: pointer
          position: relative
          > img
            width: 100%
            height: 100%
            border-radius: 4rem
          .mini-menu
            position: absolute
            background: white
            right: 0
            display: block
            > .pro-button
              width: max-content
              margin: 0 auto 1rem auto
              &:last-child
                margin-bottom: 0
              
      .mobile-nav-button
        display: none
  @media (max-width: #{$side-nav-min})
    .pro-nav-main
      .mobile-nav
        display: block
        width: 100vw
        height: 100vh
        z-index: $mobile-nav-index
        position: absolute
        background-color: transparentize(black, .4)
        top: 0
        .mobile-nav-container
          height: 100%
          .content
            height: 100%
            background-color: white
            width: 300px
            position: absolute
            right: 0
            grid-template-rows: 48px auto
            padding: 32px
            box-sizing: border-box
            .link-groups-holder
              .link-group
                .link
                  color: $orange
            .footer
              position: absolute
              padding: 32px
              bottom: 0
              .link
                cursor: pointer
                color: #777
      .pro-nav-container
        .title-holder
          .title
            > img
              height: 48px
        .actions
          display: none
        .mobile-nav-button
          display: block
          color: white
          text-align: right
          cursor: pointer
</style>
