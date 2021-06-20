export default {
  install: function (Vue) {
    Vue.prototype.$chooseFile = function (options = {}) {
      return new Promise(resolve => {
        const fileInput = document.createElement('input')
        
        if (options.accept) {
          fileInput.accept = options.accept
        }

        const fileInputId = `file-input-${Date.now()}`
        fileInput.id = fileInputId
        fileInput.onchange = event => {
          const file = event.target.files[0]
          resolve(file)
          //removes the input previously placed
          document.getElementById(fileInputId).remove()
        }
        fileInput.type = 'file'
        fileInput.style.display = 'none'
        this.$el.appendChild(fileInput)
        fileInput.click()
      })
    }
    Vue.prototype.$fileTypeToExtension = function(type) {
      return {
        'image/png': '.png',
        'image/x-png': '.png',
        'image/gif': '.gif',
        'image/jpg': '.jpg',
        'image/jpeg': '.jpg',
      }[type]
    }
  },
}