import * as express from 'express'
import * as functions from 'firebase-functions'

const sprintsApp = express()

import restRouter from './rest'
sprintsApp.use('', restRouter)

export const sprints = functions.https.onRequest(sprintsApp)
export * from './cron'