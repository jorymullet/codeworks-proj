import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import uninitializedFirebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import './registerServiceWorker'

export const firebase = uninitializedFirebase.initializeApp(JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG))
export const auth = firebase.auth()
export const firestore = firebase.firestore()

Vue.use({
  install: Vue => {
    Vue.prototype.$firestore = firestore
    Vue.prototype.$auth = auth
    Vue.prototype.$storage = firebase.storage()
  }
})


import VueResource from 'vue-resource'
Vue.use(VueResource)

import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

import ProCookies from './global/plugins/pro-cookies'
Vue.use(ProCookies)


import ProEmissions from './global/plugins/pro-emissions'
Vue.use(ProEmissions)

import FormHelpers from './global/plugins/form-helpers'
Vue.use(FormHelpers)

import HTTP from './global/plugins/HTTP'
Vue.use(HTTP)

import toast from './global/plugins/toast'
Vue.use(toast)

import time from './global/plugins/time'
Vue.use(time)

import regex from './global/plugins/regex'
Vue.use(regex)

import loading from './global/plugins/loading'
Vue.use(loading)

import copy from './global/plugins/copy'
Vue.use(copy)

import currency from './global/plugins/currency'
Vue.use(currency)

import dig from './global/plugins/dig'
Vue.use(dig)

import TinyMethods from './global/plugins/methods'
Vue.use(TinyMethods)

import keyWatcher from './global/plugins/key-watcher'
Vue.use(keyWatcher)

import chooseFile from './global/plugins/choose-file'
Vue.use(chooseFile)

import proFire from './global/plugins/pro-fire'
Vue.use(proFire)


Vue.config.productionTip = false

export const ThisVue = new Vue({
  el: '#app',
  router,
  store,
  render: function (h) { return h(App) }
})//.$mount('#app')

import modals from './global/plugins/modals'
Vue.use(modals, ThisVue)