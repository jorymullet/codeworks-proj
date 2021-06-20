<script>
import ProToast from '$common/ProToast'
import Loading from '$common/Loading'
import ModalsMain from '$modals/Main'
import ProNav from '$common/ProNav'
import UserIndicator from '$common/UserIndicator'
export default {
  name: 'App',
  components: {
    'pro-toast': ProToast,
    'loading': Loading,
    'modals-main': ModalsMain,
    'pro-nav': ProNav,
    'user-indicator': UserIndicator,
  },
  methods: {
    getEntity (type, uid) {
      return new Promise(async resolve => {
        resolve((await this.$firestore.collection(type).doc(uid).get()).data())
      })
    }, 
    async listenForUser () {
      this.$auth.onAuthStateChanged(async (auth) => {
        this.$store.commit('update', {auth})
        if (auth) {
          const user = await this.getEntity('users', auth.uid)
          this.$store.commit('update', {trueUser: user, user})


          const defaultRoute = {
            MEMBER: 'Member',
            ADMIN: 'Admin',
            SUPER_ADMIN: 'SuperAdmin',
          }[user.role]

          const defaultParams = {
            MEMBER: {orgId: user.org_id, userId: user.id},
            ADMIN: {orgId: user.org_id},
            SUPER_ADMIN: {},
          }[user.role]

          if (this.$route.name === defaultRoute) return //don't duplicate

          if (!['Login'].includes(this.$route.name)) return //don't navigate if the page has a plan

          let routeOptions = {name: defaultRoute, params: defaultParams}
          const redirect = this.$cookies.get('invanti-redirect')
          if (redirect) {
            routeOptions = redirect
            setTimeout(() => {
              this.$cookies.remove('invanti-redirect') // in case we redirect here from invite
            }, 10000)
          }
          
          this.$router.push(routeOptions)
        }
      })
    },
  },
  mounted () {
    this.listenForUser()
  },
}
</script>


<template lang='pug'>
  #app
    modals-main
    pro-nav
    user-indicator
    router-view
    pro-toast
    loading
</template>

<style lang="sass">
  @import '$vars'
  body
    margin: 0
    font-family: $font-1
    color: #222
    font-size: 14px
  #app
    position: relative
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button
    -webkit-appearance: none
    margin: 0
  *
    box-sizing: border-box
  a
    text-decoration: none
    color: $mild-blue

  #fr-logo
    display: none
</style>
