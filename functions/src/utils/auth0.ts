import * as fetch from 'node-fetch'
import * as functions from 'firebase-functions'

const {domain, api_client_secret, api_client_id} = functions.config().auth0

export const CLIENT_ID = api_client_id
export const CLIENT_SECRET = api_client_secret
export const DOMAIN = domain

export const getManagementToken = () => new Promise((resolve, reject) => {
  fetch(`https://${DOMAIN}/oauth/token` ,{
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: `https://${DOMAIN}/api/v2/`,
      //audience: `https://xyz-co.circle.so/oauth2/callback`,
    })
  })
  .catch(reject)
  .then(r => r.json())
  .then(resolve)
})