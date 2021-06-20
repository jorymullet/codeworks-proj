import Vue from 'vue'
export const eb = new Vue()

export default {
  install: function (Vue) {
    Vue.prototype.$proOn = function (handle, func) {
      eb.$on(handle, func)
    }
    Vue.prototype.$proEmit = function (handle, options) {
      eb.$emit(handle, options)
    }
  },
}