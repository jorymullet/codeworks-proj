import * as admin from 'firebase-admin'
// next line is imported for the side effects that populate process.env.FIREBASE_CONFIG
import 'firebase-functions' // tslint:disable-line
import cert from './utils/firebase-cert'

const firebaseConfig = JSON.parse(String(process.env.FIREBASE_CONFIG))
admin.initializeApp({
  ...firebaseConfig,
  credential: admin.credential.cert(cert)
})

export * from './test'
export * from './workspaces'
export * from './sprints'
export * from './invites'
export * from './users'
export * from './counts'