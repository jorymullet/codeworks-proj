export default {
  install: function (Vue) {
    Vue.prototype.$dig = function (orig, fields) {
      let output = orig
      fields.forEach((field) => {
        if (output) {
          output = output[field]
        } else {
          return output
        }
      })
      return output
    }
  },
}