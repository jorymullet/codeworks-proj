"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const Auth0 = require("../../utils/auth0");
const circle = require("../../utils/circle");
const db = admin.firestore();
/**
 * This endpoint works to both authenticate the user in Auth0 AND can be used
 * to create new users.
 */
exports._delete = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const uid = req.params.userId;
    const user = (await db.doc(`users/${uid}`).get()).data();
    if (!(uid && user))
        return res.status(400).send({ message: 'User does not exist.' });
    const isAdminDeleting = (((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN') && (((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.org_id) === user.org_id);
    const isSuperAdminDeleting = ((_f = (_e = req.user) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.role) === 'SUPER_ADMIN';
    if (!(isAdminDeleting || isSuperAdminDeleting))
        return res.status(403).send({ message: 'User does not have permission or needs to provide uid.' });
    /**
     * TO DELETE
     * - Auth0 User
     * - Circle User
     * - Firebase Auth
     * - Firestore Object -- leave to last so that previous failure will allow us to run this again since we can find the user object
     */
    // -- DELETE Auth0
    try {
        await deleteAuth0(uid);
    }
    catch (err) {
        const message = `Could not delete Auth0 for ${uid}.`;
        console.error(message, err);
        return res.status(500).send({ message, err });
    }
    // -- DELETE Circle User
    try {
        await deleteCirlceUser(user);
    }
    catch (err) {
        const message = `Could not delete Circle User for ${uid}.`;
        console.error(message, err);
        return res.status(500).send({ message, err });
    }
    // -- DELETE Firbase Auth
    try {
        await admin.auth().deleteUser(uid);
    }
    catch (err) {
        if (((_g = err.errorInfo) === null || _g === void 0 ? void 0 : _g.code) !== 'auth/user-not-found') {
            const message = `Could not delete Firebase Auth for ${uid}.`;
            console.error(message, err);
            return res.status(500).send({ message, err });
        }
        else {
            console.log(`Firebase auth for user (${uid}) was already deleted.`);
        }
    }
    // -- DELETE Firbase User
    try {
        await db.doc(`users/${uid}`).delete();
    }
    catch (err) {
        const message = `Could not delete Firbase User for ${uid}.`;
        console.error(message, err);
        return res.status(500).send({ message, err });
    }
    return res.send('OK');
};
// HELPER FUNCTIONS
const deleteCirlceUser = user => new Promise(async (resolve, reject) => {
    var _a, _b;
    try {
        const orgId = (_a = user) === null || _a === void 0 ? void 0 : _a.org_id;
        if (!orgId) {
            console.log(`No org_id associated with user: ${user.id}. Cannot delete circle user.`);
            return resolve('OK');
        }
        const org = (await db.doc(`orgs/${user.org_id}`).get()).data();
        const circleId = (_b = org) === null || _b === void 0 ? void 0 : _b.circle_id;
        if (!circleId) {
            console.log(`No circle_id could be found associated with user: ${user.id}. Cannot delete circle user.`);
            return resolve('OK');
        }
        circle.members.remove({
            community_id: circleId,
            email: user.email,
        }).then(resolve).catch(reject);
    }
    catch (err) {
        reject(err);
    }
});
const deleteAuth0 = id => new Promise(async (resolve, reject) => {
    try {
        const { access_token } = await Auth0.getManagementToken();
        if (!access_token)
            return reject('Could not authenticate deletion of Auth0 user due to inability to obtain access_token.');
        fetch(`https://${Auth0.DOMAIN}/api/v2/users/${id}`, {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${access_token}`
            }
        })
            .then(resolve)
            .catch(reject);
    }
    catch (err) {
        reject(err);
    }
});
//# sourceMappingURL=delete.js.map