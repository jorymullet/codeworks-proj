export default {
  install: function (Vue) {
    Vue.prototype.$proErrors = function () {
      const fo = this.formOptions || {}
      return Object.keys(fo).map(keyString => {
        const keys = keyString.split('.')
        const value = keys.reduce(function (acc, current) {
          return !(acc === null || acc === undefined) ? acc[current] : null
        }, this.form)
        const error = fo[keyString].errorIf && fo[keyString].errorIf(value)
        return error
      }).filter(val => val)
    }
  },
}