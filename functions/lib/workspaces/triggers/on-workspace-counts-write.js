"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const email_1 = require("../../utils/email");
// This trigger is in charge of monitoring any changes to the workspaces counts
// and to email Maria if any are low (< 10)
exports.onWorkspaceCountWrite = functions.firestore
    .document('stats/workspaces').onUpdate(async (change) => {
    const oldWss = change.before.data() || {};
    const newWss = change.after.data() || {};
    const lowWsTypes = Object.keys(newWss)
        // first, get types that were updated
        .filter(type => oldWss[type] !== newWss[type])
        // then, determine if they were low
        .filter(type => newWss[type] < 10);
    if (lowWsTypes.length) {
        const message = `Hi there,<br/><br/>
      Consider uploading the following workspaces:<br/>
      ${lowWsTypes.map(type => `${type}: ${newWss[type]} remaining`).join('<br/>')}
      `;
        await email_1.send({
            to: 'maria@invanti.co',
            html: message,
            subject: 'Studio: Low Workspace Count',
        });
    }
    return null;
});
//# sourceMappingURL=on-workspace-counts-write.js.map