const DECIMAL_PLACES = 2
const COMMA_SPACING = 3
const COMMA_SPACING_INDEX = 2

export default {
  install: function (Vue) {
    Vue.prototype.$toCurrency = (num) => {
      const [dollars, cents] = Number(num / 100).toFixed(DECIMAL_PLACES).split('.')

      // Split word into chars, reverse order, and reduce. Allows counting chars in 3s from right to left, inserting commas where needed.
      return '$' + dollars.split('').reverse().reduce((prev, curr, index, arr) => {
        const isThirdCharFromRight = index % COMMA_SPACING === COMMA_SPACING_INDEX
        const isLastChar = index === arr.length - 1
        return (isThirdCharFromRight && !isLastChar ? ',' : '') + curr + prev
      }, '.' + cents)
    }
  },
}