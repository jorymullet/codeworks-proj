"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const circle = require("../../utils/circle");
//const circleApi = functions.config().circle.api_token
const usersRef = admin.firestore().collection('users');
const TOKEN_URL = 'https://dev-fngw7tn7.us.auth0.com/oauth/token';
const PROFILE_REQUEST_URL = 'https://dev-fngw7tn7.us.auth0.com/userinfo';
const CLIENT_SECRET = 'ETixStmCylF2qXvs2gmNK2rwIkuOJB5YFlTUx6WnuElVp6qZnWD6w5efpsomAZ__';
const REQUIRED_AUTHORIZATION_TOKEN_FIELDS = ['grant_type', 'client_id', 'redirect_uri', 'code',];
/**
 * This endpoint works to both authenticate the user in Auth0 AND can be used
 * to create new users.
 */
exports.post = async (req, res) => {
    var _a, _b, _c, _d;
    const authorizationToken = req.body.authorization_token || {};
    const missingFields = REQUIRED_AUTHORIZATION_TOKEN_FIELDS
        .filter(field => !authorizationToken[field]);
    if (missingFields.length)
        return res.status(400).send({ message: `Request must include ${missingFields}` });
    authorizationToken.client_secret = CLIENT_SECRET;
    let accessToken;
    try {
        const tokenRes = await fetch(TOKEN_URL, {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(authorizationToken),
        }).then(r => r.json());
        if (tokenRes.error)
            return res.status(500).send({ message: 'Could not retrieve token.', retry: true });
        accessToken = tokenRes.access_token;
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not retrieve token.' });
    }
    let profile;
    try {
        profile = await fetch(PROFILE_REQUEST_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        }).then(r => r.json());
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not retrieve user profile.' });
    }
    console.log(profile);
    const uid = profile.sub;
    const user = (await usersRef.doc(uid).get()).data();
    /**
     * If there is no user on file, we try and make one.
     */
    if (!user) {
        const pendingUser = req.body.pending_user;
        if (!pendingUser)
            return res.status(400).send({ message: `There is no user associated with this ID ${uid} and no pending user was sent to create another.` });
        const inviteId = pendingUser.invite_id;
        if (!inviteId)
            return res.status(400).send({ message: `There is invite_id associated with this pending user so a user cannot be created.` });
        const inviteRef = admin.firestore().doc(`invites/${inviteId}`);
        const invite = (await inviteRef.get()).data();
        if (!(invite && (invite.status === 'PENDING')))
            return res.status(400).send({ message: `There is either no invite associated with this user OR the invite is not PENDING.` });
        // -- Create Auth
        const newAuth = {
            uid,
            email: profile.email,
        };
        try {
            await admin.auth().createUser(newAuth);
        }
        catch (err) {
            console.error(err);
            return res.status(400).send({ message: ((_b = (_a = err) === null || _a === void 0 ? void 0 : _a.errorInfo) === null || _b === void 0 ? void 0 : _b.message) || `Could not create Firebase Auth.`, error: err, });
        }
        // -- Create DB User
        const newUser = Object.assign(Object.assign({}, pendingUser), { email: profile.email, id: uid, org_id: invite.org.id, created_at: Date.now(), role: invite.role, links: [] });
        try {
            await admin.firestore().doc(`users/${newUser.id}`).set(newUser);
        }
        catch (err) {
            console.error(err);
            admin.auth().deleteUser(newUser.id);
            return res.status(500).send({ message: ((_d = (_c = err) === null || _c === void 0 ? void 0 : _c.errorInfo) === null || _d === void 0 ? void 0 : _d.message) || 'Could not store user data.' });
        }
        // -- Create Circle User
        try {
            const result = await circle.members.create({
                email: profile.email,
                skip_invitation: true,
                name: `${newUser.first_name} ${newUser.last_name}`,
                community_id: invite.org.circle_id,
                space_ids: [],
                picture: newUser.photo_url,
                avatar: newUser.photo_url,
            });
            console.log('Circle Result: ', result);
        }
        catch (err) {
            admin.auth().deleteUser(newUser.id);
            admin.firestore().doc(`users/${newUser.id}`).delete();
            return res.status(500).send({ message: 'Could not create Circle User.', error: err, });
        }
        // -- Update Invite
        try {
            await inviteRef.update({ status: 'ACCEPTED' });
        }
        catch (err) {
            console.error('Couldn\'t update invite:', err);
        }
    }
    let token;
    try {
        token = await admin.auth().createCustomToken(uid);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Could not create custom token.', error: err, });
    }
    return res.send({ token });
};
//# sourceMappingURL=post.js.map