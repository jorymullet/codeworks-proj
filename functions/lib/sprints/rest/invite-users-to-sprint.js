"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
const fs = admin.firestore();
exports.inviteUsersToSprint = async (req, res) => {
    const { users, origin } = req.body;
    const sprintId = req.params.sprintId;
    if (!(users && users.length && origin && sprintId))
        return res.status(400).send({ message: 'Invalid request. Must includes userIds and origin.' });
    const user = req.user.data;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
    if (!isAdmin)
        return res.status(403).send({ message: 'Must be an admin.' });
    const sprint = (await fs.doc(`sprints/${sprintId}`).get()).data() || {};
    const authenticatedOrgId = user.role === 'ADMIN' ? user.org_id : sprint.org_id;
    const userNotFromOrg = users.find(u => u.org_id !== authenticatedOrgId);
    if (userNotFromOrg)
        return res.status(403).send({ message: 'You cannot send invites to users of different orgs' });
    // -- Save Invites
    const now = Date.now();
    const invitesPromises = users.map(async (u) => {
        const invite = {
            id: `${u.id}_${sprintId}`,
            created_at: now,
            created_by: user.id,
            updated_at: now,
            updated_by: user.id,
            invitee_id: u.id,
            invitee: u,
            sprint_id: sprintId,
            status: 'PENDING',
            type: 'SPRINT',
            org_id: sprint.org_id,
        };
        return fs.doc(`invites/${invite.id}`).set(invite);
    });
    try {
        await Promise.all(invitesPromises);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not save invites.', error: err, });
    }
    // -- Create Email
    const emailsPromises = users.map(u => {
        const url = `${origin}/members/${encodeURIComponent(u.id)}/sprints?sprintInvite=${encodeURIComponent(sprint.id)}`;
        const message = `Hey there!<br/><br/>
      You have been invited to join following sprint: ${sprint.name}. Please click the following link if you would like to view this sprint:<br/><br/>
      <a href='${url}'>${url}</a>
      `;
        return email_1.send({
            to: u.email,
            html: message,
            subject: `Join ${sprint.name}`,
        });
    });
    try {
        await Promise.all(emailsPromises);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not invite users to sprint.', error: err, });
    }
    return res.send('OK');
};
//# sourceMappingURL=invite-users-to-sprint.js.map