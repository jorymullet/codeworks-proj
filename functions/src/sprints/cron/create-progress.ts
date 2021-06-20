import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { to2 } from '../../utils/methods'

const fs = admin.firestore()
const progressesRef = fs.collection('progresses')

export const createProgressFromSprints = functions.pubsub.schedule('30 2 * * *').onRun(async () => {

  const today = new Date()
  const year = today.getFullYear() 
  const month = to2(today.getMonth() + 1)
  const date = to2(today.getDate())

  const todayString = `${year}-${month}-${date}`
  const yearAgoStr = `${year - 1}-${month}-${date}`

  const sprints = (await admin.firestore()
    .collection('sprints')
    .where('start_date', '>=', yearAgoStr)
    .get()).docs.map(doc => doc.data())

  
  const now = Date.now()
  const progressTemplate = {
    created_at: now,
    updated_at: now,
    created_by: 'backend_pubsub',
    updated_by: 'backend_pubsub',
    type: 'SYSTEM',
  }

  const createProgresses = (sprint) => new Promise(async resolve => {
    const sprintMembers = (await fs.collection(`sprints/${sprint.id}/sprint_members`).get()).docs.map(doc => doc.data())

    if (!sprintMembers.length) return resolve([])

    let projectIds = sprintMembers.map(mem => mem.project_id)
    projectIds = Array.from(new Set(projectIds)) // ensures we avoid duplicates for when users join same sprints using same project

    const title = `${sprint.start_date === todayString ? 'Started' : 'Ended'} ${sprint.name}`
    const progresses = projectIds.map(projectId => {
      const template = JSON.parse(JSON.stringify(progressTemplate))

      const id = progressesRef.doc().id

      
      // sprints needs: id, org_id, tags, progress
      const additions = {
        id,
        title,
        org_id: sprint.org_id,
        tags: [projectId],
      }
      return {
        ...template,
        ...additions,
      }
    })
    resolve(progresses)
  })


  const sprintsRequiringProgress = sprints.filter(s => (s.start_date === todayString) || (getSprintEndDate(s) === todayString))
  if (!sprintsRequiringProgress) return null


  const allProgresses : any = (await Promise.all(sprintsRequiringProgress
      .map(s => createProgresses(s))))
      .reduce((all: any, some: any) => [...all, ...some], []) // use reduce to form single array

  const promises = allProgresses.map(progress => progressesRef.doc(progress.id).set(progress))

  try {
    await Promise.all(promises)
  } catch (err) {
    console.error('Could not automatically create progresses: ', err)
  }
  
  return null
})

const getSprintEndDate = sprint => {
  const startDate = new Date(`${sprint.start_date} `)
  const endDate = new Date(Number(startDate) + (8 * sprint.pace * 1000 * 60 * 60 * 24)) // 8 modules * pace * milliseconds in day
  const year = endDate.getFullYear() 
  const month = to2(endDate.getMonth() + 1)
  const date = to2(endDate.getDate())
  return `${year}-${month}-${date}`
}