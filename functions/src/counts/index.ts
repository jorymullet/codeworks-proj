


export const countCollections = ['users', 'projects', 'conversations','resources', 'progresses', 'sprints',]

import * as express from 'express'
import * as functions from 'firebase-functions'

const countsApp = express()

import restRouter from './rest'
countsApp.use('', restRouter)

export const counts = functions.https.onRequest(countsApp)
export * from './triggers'