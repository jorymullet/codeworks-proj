import {Request, Response} from 'express'
import * as admin from 'firebase-admin'
import * as fetch from 'node-fetch'
import * as circle from '../../utils/circle'


const usersRef = admin.firestore().collection('users')
/**
 * This endpoint works to reveal the uid of a user based on email.
 * This is only used by circle's header on load
 */

export const getByEmail = async (req: Request, res: Response) => {
  const email = req.params.email
  if (!email) res.status(404).send({error: true, message: 'Could not create full nav since we could not find your uid based on your email.'})

  let userAuth
  try {
    userAuth = await admin.auth().getUserByEmail(email)
  } catch (err) {
    console.error(err)
    return res.status(404).send({error: true, message: 'Could not create full nav since we could not find a user based on this email.'})
  }

  let user
  try {
    user = (await usersRef.doc(userAuth.uid).get()).data()
  } catch (err) {
    console.error(err)
    return res.status(404).send({error: true, message: 'Could not create full nav since we could not find a user based on this email.'})
  }

  if (!(user && user.role)) return res.status(404).send({error: true, message: 'Could not create full nav since we could not find a user role based on this email.'})


  return res.send(user)
}