import * as express from 'express'
import * as functions from 'firebase-functions'

const usersApp = express()

import * as routers from './rest'
usersApp.use('', routers.unsecureRestRouter)
usersApp.use('', routers.whitelistedRestRouter)
usersApp.use('', routers.adminRestRouter)

export const users = functions.https.onRequest(usersApp)