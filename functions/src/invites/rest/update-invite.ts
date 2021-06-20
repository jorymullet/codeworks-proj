import {Request, Response} from 'express'
import * as admin from 'firebase-admin'

const invitesRef = admin.firestore().collection('invites')
const VALID_STATUSES = ['ACCEPTED', 'DENIED']
const VALID_ROLES = ['ADMIN', 'MEMBER']
export const updateInvite = async (req: Request, res: Response) => {

  const body = req.body
  const status = body.status
  const inviteId = req.params.inviteId

  const isValidStatus = VALID_STATUSES.includes(status)

  const invite = (await invitesRef.doc(inviteId).get()).data()
  const isPendingInvite = invite && (invite.status === 'PENDING')
  const role = invite?.role
  const orgId = invite?.org?.id
  const inviterId = invite?.created_by
  const inviteHasValidRole = VALID_ROLES.includes(role)

  if (!(isValidStatus && isPendingInvite && inviteHasValidRole && orgId && inviterId)) return res.status(400)
    .send({message: 'Invalid status in request, invite has been responded to previously, and/or invite has invite role.'})

  /**
   * On accepting an invite, we must:
   * - create auth - done
   * - create DB user - done
   * - connect user to Circle
   * - get auto login token back to user - done
   */

  let response : any = 'OK'

  if (status === 'ACCEPTED') {
    const user = body.user
    if (!user) return res.status(400).send({message: 'No user data present.'})
    
    // -- Retrieve org for most updated info
    // We do this first so that we can fail before writing to any databases
    let org
    try {
      org = (await admin.firestore().doc(`orgs/${orgId}`).get()).data()
      if (!org) throw new Error('No org could be found with associated ID.')
    } catch (err) {
      return res.status(500).send({message: 'Could not retrieve org.', err})
    }


    // -- Create Auth
    const authObj = {
      uid: user.id,
      email: user.email,
      password: user.password,
    }

    try {
      await admin.auth().createUser(authObj)
    } catch (err) {
      console.error(err)
      return res.status(500).send({message: err?.errorInfo?.message || 'Could not create auth.'})
    }

    // -- Create DB User
    const fieldsToDelete = ['password', 'password_repeat']
    fieldsToDelete.forEach(field => delete user[field])
    user.role = role
    user.org_id = orgId
    user.invited_by = inviterId
    user.created_at = Date.now()
    user.links = []

    try {
      await admin.firestore().doc(`users/${user.id}`).set(user)
    } catch (err) {
      console.error(err)
      admin.auth().deleteUser(user.id)
      return res.status(500).send({message: err?.errorInfo?.message || 'Could not store user data.'})
    }

    // -- Create User In Org's Circle Community
    try {
      //
    } catch (err) {
      //
    }


    // -- Get Auto Login Token
    try {
      const token = await admin.auth().createCustomToken(user.id)
      response = {token}
    } catch (err) {
      console.error(err)
    }

  }

  // -- Update Invite
  try {
    await invitesRef.doc(inviteId).update({
      status,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).send({message: 'Could not update status in database.'})
  }

  return res.send(response)
}