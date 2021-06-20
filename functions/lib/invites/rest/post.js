"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
const invitesRef = admin.firestore().collection('invites');
exports.postInvite = async (req, res) => {
    const authUser = req.user.data;
    const role = authUser.role;
    const body = req.body;
    const org = body.org;
    // if ADMIN (not SUPER_ADMIN), must check they are inviting into their own org
    if (role === 'ADMIN') {
        if (authUser.org_id !== org.id)
            return res.status(403).send({ message: 'You can only send invites to people to your own org.' });
    }
    // -- Create Invite
    const inviteId = invitesRef.doc().id;
    const invite = {
        id: inviteId,
        created_at: Date.now(),
        created_by: authUser.id,
        status: 'PENDING',
        type: 'ORG_INDIVIDUAL',
        email: body.email,
        role: body.role,
        org: body.org,
    };
    const dbPromise = invitesRef.doc(inviteId).set(invite);
    // -- Create Email
    const inviter = body.inviter;
    const inviterName = `${inviter.first_name} ${inviter.last_name}`;
    const rolePhrase = {
        MEMBER: 'a member',
        ADMIN: 'an admin',
    }[body.role];
    const message = `Hi there,<br/><br/>
    ${inviterName} has invited you to join ${org.studio_name} as a member. Click the link to respond to this invite:<br/><br/>
    ${body.origin}/invites/${inviteId}<br/><br/>
    Questions: Contact ${inviterName} at ${inviter.email}
    `;
    const emailPromise = email_1.send({
        to: body.email,
        html: message,
        subject: `${inviterName} is inviting you to join ${org.studio_name}`,
    });
    try {
        await Promise.all([dbPromise, emailPromise]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not save invite and/or send email to invitee.' });
    }
    return res.send('OK');
};
//# sourceMappingURL=post.js.map