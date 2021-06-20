export default {
  install: function (Vue) {
    Vue.prototype.$toast = function (toast) {
      this.$proEmit('toast', toast)
    }
  },
}