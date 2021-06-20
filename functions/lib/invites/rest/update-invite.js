"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const invitesRef = admin.firestore().collection('invites');
const VALID_STATUSES = ['ACCEPTED', 'DENIED'];
const VALID_ROLES = ['ADMIN', 'MEMBER'];
exports.updateInvite = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const body = req.body;
    const status = body.status;
    const inviteId = req.params.inviteId;
    const isValidStatus = VALID_STATUSES.includes(status);
    const invite = (await invitesRef.doc(inviteId).get()).data();
    const isPendingInvite = invite && (invite.status === 'PENDING');
    const role = (_a = invite) === null || _a === void 0 ? void 0 : _a.role;
    const orgId = (_c = (_b = invite) === null || _b === void 0 ? void 0 : _b.org) === null || _c === void 0 ? void 0 : _c.id;
    const inviterId = (_d = invite) === null || _d === void 0 ? void 0 : _d.created_by;
    const inviteHasValidRole = VALID_ROLES.includes(role);
    if (!(isValidStatus && isPendingInvite && inviteHasValidRole && orgId && inviterId))
        return res.status(400)
            .send({ message: 'Invalid status in request, invite has been responded to previously, and/or invite has invite role.' });
    /**
     * On accepting an invite, we must:
     * - create auth - done
     * - create DB user - done
     * - connect user to Circle
     * - get auto login token back to user - done
     */
    let response = 'OK';
    if (status === 'ACCEPTED') {
        const user = body.user;
        if (!user)
            return res.status(400).send({ message: 'No user data present.' });
        // -- Retrieve org for most updated info
        // We do this first so that we can fail before writing to any databases
        let org;
        try {
            org = (await admin.firestore().doc(`orgs/${orgId}`).get()).data();
            if (!org)
                throw new Error('No org could be found with associated ID.');
        }
        catch (err) {
            return res.status(500).send({ message: 'Could not retrieve org.', err });
        }
        // -- Create Auth
        const authObj = {
            uid: user.id,
            email: user.email,
            password: user.password,
        };
        try {
            await admin.auth().createUser(authObj);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ message: ((_f = (_e = err) === null || _e === void 0 ? void 0 : _e.errorInfo) === null || _f === void 0 ? void 0 : _f.message) || 'Could not create auth.' });
        }
        // -- Create DB User
        const fieldsToDelete = ['password', 'password_repeat'];
        fieldsToDelete.forEach(field => delete user[field]);
        user.role = role;
        user.org_id = orgId;
        user.invited_by = inviterId;
        user.created_at = Date.now();
        user.links = [];
        try {
            await admin.firestore().doc(`users/${user.id}`).set(user);
        }
        catch (err) {
            console.error(err);
            admin.auth().deleteUser(user.id);
            return res.status(500).send({ message: ((_h = (_g = err) === null || _g === void 0 ? void 0 : _g.errorInfo) === null || _h === void 0 ? void 0 : _h.message) || 'Could not store user data.' });
        }
        // -- Create User In Org's Circle Community
        try {
            //
        }
        catch (err) {
            //
        }
        // -- Get Auto Login Token
        try {
            const token = await admin.auth().createCustomToken(user.id);
            response = { token };
        }
        catch (err) {
            console.error(err);
        }
    }
    // -- Update Invite
    try {
        await invitesRef.doc(inviteId).update({
            status,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not update status in database.' });
    }
    return res.send(response);
};
//# sourceMappingURL=update-invite.js.map