export const decideFontColor = (bgColor) => {
  const {r,g,b} = hexToRgb(bgColor)
  return (r*.299 + g*0.587 + b*0.114) > 186 ? '#222' : '#FFF'
}

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}