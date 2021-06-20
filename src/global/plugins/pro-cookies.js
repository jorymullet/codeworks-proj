export default {
  install: function (Vue) {
    Vue.prototype.$cookies.updateJSON = function (name, updates) {
      let current = this.get(name)
      if (!current) {
        this.set(name, {})
        current = this.get(name)
      }
      const newValue = {
        ...current,
        ...updates,
      }
      this.set(name, newValue)
    }
  },
}