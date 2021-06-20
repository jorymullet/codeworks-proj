export default {
  install: function (Vue) {
    Vue.prototype.$showLoading = function () {
      this.$proEmit('setLoading', true)
    }
    Vue.prototype.$hideLoading = function () {
      this.$proEmit('setLoading', false)
    }
    Vue.prototype.$flashLoading = function (func) {
      this.$showLoading()
      setTimeout(func, 250)
      setTimeout(() => this.$hideLoading(), 500)
    }
  },
}