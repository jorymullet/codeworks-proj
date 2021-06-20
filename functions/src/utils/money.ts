export default (num, andCents = false) => {
  const [dollars, cents] = Number(num / 100).toFixed(2).split('.')

  // Split word into chars, reverse order, and reduce. Allows counting chars in 3s from right to left, inserting commas where needed.
  return '$' + dollars.split('').reverse().reduce((prev, curr, index, arr) => {
    const isThirdCharFromRight = index % 3 === 2
    const isLastChar = index === arr.length - 1
    return (isThirdCharFromRight && !isLastChar ? ',' : '') + curr + prev
  }, andCents ? '.' + cents : '')
}