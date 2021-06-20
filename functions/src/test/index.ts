import * as express from 'express'
import * as functions from 'firebase-functions'

const testApp = express()

import restRouter from './rest'
testApp.use('', restRouter)

export const test = functions.https.onRequest(testApp)