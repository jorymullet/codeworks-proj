import * as fetch from 'node-fetch'
import * as functions from 'firebase-functions'
import * as qs from 'qs'

const circleApi = functions.config().circle.api_token

interface RequestOptions {
  endpoint: string
  method?: 'post' | 'get' | 'delete'
  body?: object
}

const request = (options: RequestOptions) => new Promise((resolve, reject) => {
  const settings = {
    method: options.method || 'get',
    headers: {
      Authorization: `Token ${circleApi}`,
      'Content-Type': 'application/json',
    },
  }
  if (options.body) {
    settings['body'] = JSON.stringify(options.body)
  }
  fetch(`https://app.circle.so/api/v1/${options.endpoint}`, settings)
    .catch(err => reject(err))
    .then(r => r.json())
    .then((data) => resolve(data))
}) as any


const membersEndpoint = 'community_members'
export const members = {
  retrieve: (uid: String) => {
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
    const query = qs.stringify(queryObj)
    return request({
      endpoint: `${membersEndpoint}?${query}`,
      method: 'delete',
    })
  }
}



const communitiesEndpoint = 'communities'
export const communties = {
  retrieve: () => request({
    endpoint: communitiesEndpoint,
  })
}

interface SpaceJoinLeaveOptions {
  email: String,
  space_id: String,
  community_id: String,
}

const spacesEndpoint = 'spaces'
export const spaces = {
  create: (body) => request({
    method: 'post',
    endpoint: spacesEndpoint,
    body,
  }),
  delete: (body) => request({
    method: 'delete',
    endpoint: `${spacesEndpoint}/${body.id}?community_id=${body.communityId}`,
  }),
  join: (body: SpaceJoinLeaveOptions) => request({
    method: 'post',
    endpoint: `space_members?${qs.stringify(body)}`,
  }),
  leave: (body: SpaceJoinLeaveOptions) => request({
    method: 'delete',
    endpoint: `space_members?${qs.stringify(body)}`,
  })
}