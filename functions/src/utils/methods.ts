import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

export const isLocal = () => os.hostname() === 'Joshuas-MacBook-Pro.local'
export const getLocalFile = (pathName) => fs.readFileSync(path.resolve(__dirname, pathName)).toString('base64')
export const to2 = str => String(str).length === 2 ? str : `0${str}`