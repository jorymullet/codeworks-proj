const pressedKeys = []

const cbsTree = {}

const stringMe = ele => JSON.stringify(ele)

const onKeyPress = (e) => {
  const isKeyDown = e.type === 'keydown'
  if (isKeyDown) {
    if (pressedKeys.includes(e.key)) return

    pressedKeys.push(e.key)
    const cbs = cbsTree[stringMe(pressedKeys)]
    if (!(cbs && cbs.length)) return

    e.preventDefault()
    cbs.forEach(cb => cb())
  } else {
    pressedKeys.remove(e.key)
  }
}

let eventListenersSet = false

export default {
  install: function (Vue) {
    Vue.prototype.$onCombo = (combo) => ({
      do: (cb) => {
        const stringCombo = stringMe(combo)
        const existingCbs = cbsTree[stringCombo] || []
        cbsTree[stringCombo] = [...existingCbs, cb]
      },
    })
    Vue.mixin({
      beforeMount () {
        if (!eventListenersSet) {
          document.addEventListener('keydown', onKeyPress, true)
          document.addEventListener('keyup', onKeyPress, true)
          eventListenersSet = true
        }
      },
      beforeDestroy () {
        document.removeEventListener('keydown', onKeyPress, true)
        document.removeEventListener('keyup', onKeyPress, true)
      }
    })
  },
}