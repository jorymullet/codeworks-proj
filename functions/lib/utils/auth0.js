"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require("node-fetch");
const functions = require("firebase-functions");
const { domain, api_client_secret, api_client_id } = functions.config().auth0;
exports.CLIENT_ID = api_client_id;
exports.CLIENT_SECRET = api_client_secret;
exports.DOMAIN = domain;
exports.getManagementToken = () => new Promise((resolve, reject) => {
    fetch(`https://${exports.DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: exports.CLIENT_ID,
            client_secret: exports.CLIENT_SECRET,
            audience: `https://${exports.DOMAIN}/api/v2/`,
        })
    })
        .catch(reject)
        .then(r => r.json())
        .then(resolve);
});
//# sourceMappingURL=auth0.js.map