Array.prototype.remove = function (ele) {
  const idx = this.indexOf(ele)
  if (idx !== -1) this.splice(idx, 1)
  return this
}

Array.prototype.uniquify = function () {
  return Array.from(new Set(this))
}