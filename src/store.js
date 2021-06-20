import Vue from 'vue'
import Vuex from 'vuex'
import { firestore } from './main'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: null,
    user: null,
    trueUser: null,
    org: null,
    project: null,
    workspace: null,
    userProjects: null,
    tags: null,
    routerPromiseRunning: false, // trying to use this to avoid multiple promises from ruining my life in the router-promises
  },
  mutations: {
    update (state, update) {
      Object.keys(update).forEach(key => state[key] = update[key])

      if (Object.keys(update).includes('org')) {
        document.title = update.org ? update.org.studio_name : 'STUDIO'
      }
    },
    async refreshUser (state) {
      state.user = (await firestore.doc(`users/${state.user.id}`).get()).data()
    },
    async refreshOrg (state) {
      state.org = (await firestore.doc(`orgs/${state.org.id}`).get()).data()
    },
    async refreshProject (state) {
      state.project = (await firestore.doc(`projects/${state.project.id}`).get()).data()
    },
    logout (state) {
      /**
       * Should unsubscribe to listeners in here if any were instantiated
       */
      const that = require('../src/main').ThisVue
      that.$proEmit('setLoading', true)

      setTimeout(() => { // delay to hide transition to log out screen
        that.$router.push({name: 'Logout'}, () => {
          that.$proEmit('setLoading', true)
          // eslint-disable-next-line
          const webAuth = new auth0.WebAuth({
            domain: process.env.VUE_APP_AUTH0_DOMAIN,
            clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
          })
  
          webAuth.logout({
            returnTo: location.href,
            clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
          })
  
          state.auth = null
          state.org = null
          state.trueUser = null
          that.$auth.signOut()
        })
      }, 200)
    },
  },
})
