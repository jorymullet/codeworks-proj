import {Request, Response} from 'express'
import * as admin from 'firebase-admin'
import {countCollections} from '..'

const fs = admin.firestore()

export const countOrgEntities = async (req: Request, res: Response) => {
  // -- Validate
  const {orgId} = req.params

  if (!(orgId)) return res.status(400).send({message: 'Must include orgId.'})

  const [org,] = (await Promise.all([
    fs.doc(`orgs/${orgId}`).get(),
  ])).map(doc => doc.data())

  if (!org) return res.status(400).send({message: 'Could not find org.'})

  // -- Authenticate

  const authUser = req.user.data

  const isAuthenticated = (authUser.role === 'SUPER_ADMIN')
    || (orgId === authUser.org_id)

  if (!isAuthenticated) return res.status(400).send({message: 'User is not authenticated.'})
  
  const orgCounts = countCollections.reduce((obj, coll) => {
    obj[coll] = -1
    return obj
  }, {})

  const isComplete = () => Object.values(orgCounts).every((num: any) => num > -1)

  const checkIfDone = () => {
    if (!isComplete()) return

    fs.doc(`stats/orgs/byOrg/${orgId}`).set(orgCounts)
  }

  countCollections.forEach(async coll => {
    const amount = (await fs.collection(coll).where('org_id', '==', orgId).get()).docs.length
    orgCounts[coll] = amount
    checkIfDone()
  })

  return res.status(200).send()
}