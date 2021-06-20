"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require("node-fetch");
const functions = require("firebase-functions");
const qs = require("qs");
const circleApi = functions.config().circle.api_token;
const request = (options) => new Promise((resolve, reject) => {
    const settings = {
        method: options.method || 'get',
        headers: {
            Authorization: `Token ${circleApi}`,
            'Content-Type': 'application/json',
        },
    };
    if (options.body) {
        settings['body'] = JSON.stringify(options.body);
    }
    fetch(`https://app.circle.so/api/v1/${options.endpoint}`, settings)
        .catch(err => reject(err))
        .then(r => r.json())
        .then((data) => resolve(data));
});
const membersEndpoint = 'community_members';
exports.members = {
    retrieve: (uid) => {
        //
    },
    retrieveAll: () => request({
        endpoint: membersEndpoint,
    }),
    create: (body) => request({
        endpoint: membersEndpoint,
        method: 'post',
        body,
    }),
    remove: (queryObj) => {
        const query = qs.stringify(queryObj);
        return request({
            endpoint: `${membersEndpoint}?${query}`,
            method: 'delete',
        });
    }
};
const communitiesEndpoint = 'communities';
exports.communties = {
    retrieve: () => request({
        endpoint: communitiesEndpoint,
    })
};
const spacesEndpoint = 'spaces';
exports.spaces = {
    create: (body) => request({
        method: 'post',
        endpoint: spacesEndpoint,
        body,
    }),
    delete: (body) => request({
        method: 'delete',
        endpoint: `${spacesEndpoint}/${body.id}?community_id=${body.communityId}`,
    }),
    join: (body) => request({
        method: 'post',
        endpoint: `space_members?${qs.stringify(body)}`,
    }),
    leave: (body) => request({
        method: 'delete',
        endpoint: `space_members?${qs.stringify(body)}`,
    })
};
//# sourceMappingURL=circle.js.map