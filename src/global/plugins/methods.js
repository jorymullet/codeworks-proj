export default {
  install: function (Vue) {
    Vue.prototype.$clone = obj => JSON.parse(JSON.stringify(obj))
    Vue.prototype.$maybeFunc = something => typeof something === 'function' ? something() : something
  },
}