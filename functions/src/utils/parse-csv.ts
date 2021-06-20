import * as csv from 'csvtojson'

/**
 * This turns a csv into an object where the keys are headers and the values are arrays of their columns
 */
export const headerAndColumn = (filePath: string) => {
  return new Promise(async (resolve) => {
    const json = await csv().fromFile(filePath)
    const output : any = {}
    json.forEach(obj => {
      Object.keys(obj).forEach(key => {
        if (!obj[key]) return
        if (!output[key]) {
          output[key] = []
        }
        output[key].push(obj[key])
      })
    })
    resolve(output)
  })
}