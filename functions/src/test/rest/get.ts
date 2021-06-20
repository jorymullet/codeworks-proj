import {Request, Response} from 'express'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { createSuperAdmin } from '../../users/rest/utils'
import { to2 } from '../../utils/methods'
import * as circle from '../../utils/circle'

const fs = admin.firestore()
const progressesRef = fs.collection('progresses')

export const get = async (req: Request, res: Response) => {

  //createSuperAdmin('auth0|60a6b5b101db420071aaff89', 'kerrie@invanti.co')

  return res.send('hi')
}