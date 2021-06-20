import * as express from 'express'
import * as functions from 'firebase-functions'

const workspacesApp = express()

import restRouter from './rest'
workspacesApp.use('', restRouter)

export * from './triggers'
export const workspaces = functions.https.onRequest(workspacesApp)