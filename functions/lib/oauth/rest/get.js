"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require("node-fetch");
const functions = require("firebase-functions");
const circleApi = functions.config().circle.api_token;
exports.get = async (req, res) => {
    fetch('https://dev-fngw7tn7.us.auth0.com/oauth/token', {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: '{"client_id":"2En2c1MgL7ZuikgK32Q3kyfFG9vVUqsy","client_secret":"CgDkw58VfuA_xqdUdw8Q4Kv4G8VTHGP2CNAvUxMXUivY_Po0L04NTeaytjB1Fchp","audience":"https://xyz-co.circle.so/oauth2/callback","grant_type":"client_credentials"}',
    }).then(r => r.json())
        .then(data => {
        console.log(data);
    });
    // const data = await circle.members.create({
    //   email: 'jorymullet@gmail.com',
    //   password: 'password',
    //   name: 'Joshua Mullet',
    //   community_id: '11501',
    //   space_ids: [],
    //   bio: 'This is definitely a good test. I am very good at testing.',
    //   avatar: 'https://firebasestorage.googleapis.com/v0/b/invanti-test.appspot.com/o/images%2FbyUser%2F7LQDJP8ZY5ZjBH3ASt0Y%2Fprofile.jpg?alt=media&token=61bc4af6-5d7f-4b73-9cb6-8809b1693073',
    // })
    // console.log(data)
    return res.send('OK');
};
//# sourceMappingURL=get.js.map