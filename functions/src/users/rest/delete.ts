import {Request, Response} from 'express'
import * as admin from 'firebase-admin'
import * as fetch from 'node-fetch'
import * as Auth0 from '../../utils/auth0'
import * as circle from '../../utils/circle'


const db = admin.firestore()
/**
 * This endpoint works to both authenticate the user in Auth0 AND can be used 
 * to create new users.
 */

export const _delete = async (req: Request, res: Response) => {

  const uid = req.params.userId
  const user = (await db.doc(`users/${uid}`).get()).data()

  if (!(uid && user)) return res.status(400).send({message: 'User does not exist.'})

  const isAdminDeleting = (req.user?.data?.role === 'ADMIN') && (req.user?.data?.org_id === user.org_id)
  const isSuperAdminDeleting = req.user?.data?.role === 'SUPER_ADMIN'

  if (!(isAdminDeleting || isSuperAdminDeleting)) return res.status(403).send({message: 'User does not have permission or needs to provide uid.'})

  /**
   * TO DELETE
   * - Auth0 User
   * - Circle User
   * - Firebase Auth
   * - Firestore Object -- leave to last so that previous failure will allow us to run this again since we can find the user object
   */

  // -- DELETE Auth0
  
  try {
    await deleteAuth0(uid)
  } catch (err) {
    const message = `Could not delete Auth0 for ${uid}.`
    console.error(message, err)
    return res.status(500).send({message, err})
  }

  // -- DELETE Circle User

  try {
    await deleteCirlceUser(user)
  } catch (err) {
    const message = `Could not delete Circle User for ${uid}.`
    console.error(message, err)
    return res.status(500).send({message, err})
  }

  
  // -- DELETE Firbase Auth

  try {
    await admin.auth().deleteUser(uid)
  } catch (err) {
    if (err.errorInfo?.code !== 'auth/user-not-found') {
      const message = `Could not delete Firebase Auth for ${uid}.`
      console.error(message, err)
      return res.status(500).send({message, err})
    } else {
      console.log(`Firebase auth for user (${uid}) was already deleted.`)
    }
  }

  // -- DELETE Firbase User

  try {
    await db.doc(`users/${uid}`).delete()
  } catch (err) {
    const message = `Could not delete Firbase User for ${uid}.`
    console.error(message, err)
    return res.status(500).send({message, err})
  }

  
  return res.send('OK')
}

// HELPER FUNCTIONS

const deleteCirlceUser = user => new Promise(async (resolve, reject) => {
  try {
    const orgId = user?.org_id
    if (!orgId) {
      console.log(`No org_id associated with user: ${user.id}. Cannot delete circle user.`)
      return resolve('OK')
    }

    const org = (await db.doc(`orgs/${user.org_id}`).get()).data()
    const circleId = org?.circle_id
    if (!circleId) {
      console.log(`No circle_id could be found associated with user: ${user.id}. Cannot delete circle user.`)
      return resolve('OK')
    }

    circle.members.remove({
      community_id: circleId,
      email: user.email,
    }).then(resolve).catch(reject)
  } catch (err) {
    reject(err)
  }
})

const deleteAuth0 = id => new Promise(async (resolve, reject) => {
  try {
    const {access_token} = await Auth0.getManagementToken() as any
    if (!access_token) return reject('Could not authenticate deletion of Auth0 user due to inability to obtain access_token.')

    fetch(`https://${Auth0.DOMAIN}/api/v2/users/${id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${access_token}`
      }
    })
    .then(resolve)
    .catch(reject)
  } catch (err) {
    reject(err)
  }
})