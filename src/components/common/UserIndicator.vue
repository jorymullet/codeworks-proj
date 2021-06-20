<script>
import adminNavLinks from '@/global/js/admin-nav-links.js'
export default {
  name: 'UserIndicator',
  data() {
    return {
      nav:  document.querySelector('.pro-nav-main'),
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    trueUser () {
      return this.$store.state.trueUser
    },
    org () {
      return this.$store.state.org
    },
    project () {
      return this.$store.state.project
    },
    message () {
      const tu = this.trueUser
      if (!tu || (tu.role === 'MEMBER')) return ''

      const u = this.user

      const rn = this.$route.name

      if (tu.role === 'ADMIN') {
        if (tu.id === u.id) return ''
      }

      if (['ADMIN', 'SUPER_ADMIN'].includes(tu.role)) {
        const memberRoutes = ['Member', 'MemberResearch', 'MemberSprints', 'MemberProgresses']
        if (memberRoutes.includes(rn)) return `You are viewing the account of ${u.first_name} ${u.last_name}.`
        const projectRoutes = ['Project', 'ProjectWorkspaceView']
        if (projectRoutes.includes(rn)) {
          if (u.id === tu.id) { // potentially not view as a different user but instead, themselves
            return `You are viewing the project ${this.project.name} as a ${u.role}.`
          } else {
            return `You are viewing the project ${this.project.name} as ${u.first_name} ${u.last_name} (${u.role}).`
          }
        }
      }

      if (tu.role === 'SUPER_ADMIN') {
        const adminRoutes = adminNavLinks.reduce((acc, group) => [...acc, ...group.links], []).map(link => link.route)
        if (adminRoutes.includes(rn) && this.org) return `You are viewing ${this.org.studio_name} as ${u.first_name} ${u.last_name} (${u.role}).`
      }
      return ''
    },
  },
  methods: {
    onScroll () {
      const indicator = this.$refs.indicator
      if (!indicator) return
      const top = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
      const navHeight = document.querySelector('.pro-nav-main').offsetHeight
      indicator.style.position = top < navHeight ? 'relative' : 'fixed'
    },
    startListener () {
      window.removeEventListener('scroll', this.onScroll, false)
      this.$nextTick(() => {
        window.addEventListener('scroll', this.onScroll, false)
      })
    },
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll, false)
  },
  mounted () {
    this.startListener()
  },
}
</script>

<template lang="pug">
  #user-indicator-main(
    ref='indicator'
  )
    .user-indicator-container(
      v-if='message'
    )
      .message-holder
        .message {{message}}
</template>

<style lang="sass" scoped>
  #user-indicator-main
    top: 0
    z-index: 2
    height: 0
    position: relative
    .user-indicator-container
      .message-holder
        .message
          width: 100vw
          text-align: center
          padding: .5rem
          background-color: $orange
          color: white
          font-weight: bold
          box-shadow: 0 0 .25rem 0 black inset
</style>