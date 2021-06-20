import * as express from 'express'
import * as functions from 'firebase-functions'

const invitesApp = express()

import * as routers from './rest'
// the ordering of these routers is vital to the only-whitelisted one to work
invitesApp.use('', routers.restWhitelistedRouter)
invitesApp.use('', routers.restAdminRouter)

export const invites = functions.https.onRequest(invitesApp)