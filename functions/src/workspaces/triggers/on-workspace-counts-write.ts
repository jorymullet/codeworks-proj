import * as functions from 'firebase-functions'
import { send } from '../../utils/email'

// This trigger is in charge of monitoring any changes to the workspaces counts
// and to email Maria if any are low (< 10)
export const onWorkspaceCountWrite = functions.firestore
  .document('stats/workspaces').onUpdate(async (change) => {
    const oldWss = change.before.data() || {}
    const newWss = change.after.data() || {}

    const lowWsTypes = Object.keys(newWss)
      // first, get types that were updated
      .filter(type => oldWss[type] !== newWss[type])
      // then, determine if they were low
      .filter(type => newWss[type] < 10)

    if (lowWsTypes.length) {
      const message = `Hi there,<br/><br/>
      Consider uploading the following workspaces:<br/>
      ${lowWsTypes.map(type => `${type}: ${newWss[type]} remaining`).join('<br/>')}
      `
      await send({
        to: 'maria@invanti.co',
        html: message,
        subject: 'Studio: Low Workspace Count',
      })
    }

    return null
  })