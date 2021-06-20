import * as admin from 'firebase-admin'

export const createSuperAdmin = (uid, email) => new Promise(async (resolve, reject) => {
  const auth = {uid,email}
  const user = {
    role: 'SUPER_ADMIN',
    id: uid,
    created_at: Date.now(),
    email,
  }
  try {
    await admin.auth().createUser(auth)
    await admin.firestore().doc(`users/${uid}`).set(user)
    resolve('OK')
  } catch (err) {
    console.error(err)
    reject(err)
  }
})