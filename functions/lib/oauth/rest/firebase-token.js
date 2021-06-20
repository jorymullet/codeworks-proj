"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const CLIENT_ID = 'NyXkTsrfPt0y8uVNKjVaK5sIhls7blFg';
const CLIENT_SECRET = 'ETixStmCylF2qXvs2gmNK2rwIkuOJB5YFlTUx6WnuElVp6qZnWD6w5efpsomAZ__';
const DOMAIN = 'dev-fngw7tn7.us.auth0.com';
const TOKEN_URL = 'https://dev-fngw7tn7.us.auth0.com/oauth/token';
const PROFILE_REQUEST_URL = 'https://dev-fngw7tn7.us.auth0.com/userinfo';
const REQUIRED_AUTHORIZATION_TOKEN_FIELDS = ['grant_type', 'client_id', 'redirect_uri', 'code',];
exports.swapFirebaseToken = async (req, res) => {
    const authorizationToken = req.body || {};
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
            return res.status(500).send({ message: 'Could not retrieve token.' });
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
        return res.status(500).send({ message: 'Could not retrieve token.' });
    }
    const uid = profile.sub;
    const user = admin.firestore().collection('');
    console.log(profile);
    return res.send('OK');
};
//# sourceMappingURL=firebase-token.js.map