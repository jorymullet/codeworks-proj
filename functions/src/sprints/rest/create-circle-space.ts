import {Request, Response} from 'express'
import * as admin from 'firebase-admin'
import * as circle from '../../utils/circle'
import slugify from 'slugify'

const fs = admin.firestore()

export const createCircleSpace = async (req: Request, res: Response) => {
  // -- Validate
  const sprint = req.body
  const user = req.user.data

  if (!(sprint && sprint.name && user)) return res.status(400).send({message: 'Must include sprint and user.'})

  // -- Authenticate
  const isAuthenticated = (user.role === 'SUPER_ADMIN')
    || (sprint.org_id === user.org_id)

  if (!isAuthenticated) return res.status(400).send({message: 'User is not authenticated.'})

  const org = (await fs.doc(`orgs/${sprint.org_id}`).get()).data()
  if (!(org && org.circle_id)) return res.status(400).send({message: 'Cannot create sprint: Org no longer exists.'})

  // -- Create Space
  const slug = slugify(sprint.name, {
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  })

  const spaceOptions = {
    slug,
    is_private: true,
    is_hidden: true,
    is_hidden_from_non_members: true,
    community_id: org.circle_id,
    name: sprint.name,
  }

  let response
  try {
    response = await circle.spaces.create(spaceOptions)
  } catch (err) {
    console.error(err)
    return res.status(400).send({message: 'Cannot create sprint: Couldn\'t create cirlce commuity space.'})
  }

  if (response.success === false) {
    console.error(response)
    return res.status(400).send({message: response.errors})
  }

  const space = response.space
  const spaceData = {
    space_id: space.id,
    space_url: space.url,
  }

  res.send(spaceData)
}