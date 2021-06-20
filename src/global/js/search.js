export const isBeingSearched = (search, value) => {
  value = (value || '').toLowerCase().split('')
  search = search.toLowerCase().split('')

  return search.reduce((rem, letter) => {
    if (!rem) return rem

    const idx = rem.indexOf(letter)
    if (idx >= 0) {
      return rem.slice(idx + 1)
    } else return false
  }, value)
}