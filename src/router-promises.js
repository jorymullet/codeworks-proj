import Vue from 'vue'
import store from './store'
import {firestore} from './main'
import {BASE_URL, getUserSecurityHeader} from './global/plugins/HTTP'

const that = Vue.prototype


const checkForUser = async () => {
  const u = store.state.user
  if (u && (u.role === 'MEMBER')) return

  const tu = store.state.trueUser
  if ((tu.role === 'ADMIN') && (u.id === tu.id)) return // same user. no need to get another
  
  const asUserId = that.$cookies.get('invanti-as-user')
  if (!asUserId) return

  const asUser = (await firestore.doc(`users/${asUserId}`).get()).data()
  store.commit('update', {user: asUser})
}

const beforeProject = async (to) => {
  try {
    const projectId = to.params.projectId
    const project = (await firestore.doc(`projects/${projectId}`).get()).data()
    const orgId = project.org_id
    const org = (await firestore.doc(`orgs/${orgId}`).get()).data()
    const tags = (await firestore.collection('tags').where('org_id', '==', org.id).get()).docs.map(doc => doc.data())
    await checkForUser(to)
    const updates = {org, project, tags,}
    const user = store.state.user
    let userProjects
    if (user.role === 'SUPER_ADMIN') {
      userProjects = (await firestore.collection('projects').where('org_id', '==', orgId).get()).docs.map(doc => doc.data())
    } else {
      userProjects = (await firestore.collection('projects').where('org_id', '==', orgId).where('members', 'array-contains', store.state.user.id).get()).docs.map(doc => doc.data())
    }
    
    updates.userProjects = userProjects
    store.commit('update', updates)
  } catch (err) {
    console.error('Error in beforeProject: ', err)
  }
}

const beforeProjectWorkspaceView = (to) => new Promise(async resolve => {
  const workspaces = store.state.project.workspaces
  const workspace = workspaces.find(ws => ws.id === to.params.workspaceId)
  store.commit('update', {workspace})
  resolve()
})

const beforeAdmin = async (to) => {
  const orgId = to.params.orgId
  const org = (await firestore.doc(`orgs/${orgId}`).get()).data()
  let user = store.state.user
  if (!user) {
    user = (await firestore.doc(`users/${store.state.auth.uid}`).get()).data()
  }
  store.commit('update', {org, /*trueUser: user,*/ user,})
}

const beforeMember = (to) => new Promise(async resolve => {
  const userId = to.params.userId
  const user = (await firestore.doc(`users/${userId}`).get()).data()
  const orgId = user.org_id
  const userProjects = (await firestore.collection('projects').where('org_id', '==', orgId).where('members', 'array-contains', userId).get()).docs.map(doc => doc.data())
  const org = (await firestore.doc(`orgs/${orgId}`).get()).data()
  const tags = (await firestore.collection('tags').where('org_id', '==', org.id).get()).docs.map(doc => doc.data())
  
  const onSuccess = () => {
    store.commit('update', {org, user, userProjects, tags})
    resolve()
  }
  const onFailure = (err) => {
    console.error(err)
    onSuccess()
    // silenced this notif as a switch for emailing Maria
    // that.$toast({
    //   copy: (err && err.message) || 'Could not retrieve a Founder Workspace for you. Please contact an admin.',
    //   time: 5000,
    // })
  }
  /**
   * This conditional is in charge of retrieving a founder project.
   * The benifit of doing it here is that we can have better error handling
   * in the sense that we can tell the user something is wrong.
   * 
   * We can't use the traditional this.$HTTP due to scoping issues >:(
   */
  const hasFounderProject = userProjects.find(p => p.is_founder)
  if (!hasFounderProject) {
    const securityHeader = await getUserSecurityHeader()
    fetch(`${BASE_URL}workspaces?userId=${userId}`, {
      method: 'GET',
      mode: 'cors',
      headers: securityHeader.headers,
    }).then(async r => {
      if (r.ok) {
        return r.json()
      }
      const error = await r.json()
      onFailure(error)
    })
      .then(async body => {
        if (body && body.workspaces) {
          const projectsRef = firestore.collection('projects')
          const now = Date.now()
          const project = {
            id: projectsRef.doc().id,
            created_at: now,
            updated_at: now,
            created_by: userId,
            updated_by: userId,
            name: 'Founder',
            workspaces: body.workspaces,
            members: [userId,],
            is_founder: true,
            org_id: orgId,
          }
          userProjects.push(project)
          await projectsRef.doc(project.id).set(project)
          onSuccess()
        } else {
          onFailure()
        }
      })
      .catch(onFailure)
  } else {
    onSuccess()
  }
})

const beforeSuper = async () => {
  that.$nextTick(() => { //waits a tick or pages being navigated away from complain about no org
    store.commit('update', {org: null})
  })
}


export default {
  Project: beforeProject,
  ProjectWorkspaceView: [beforeProject, beforeProjectWorkspaceView],
  Admin: beforeAdmin,
  AdminUsers: beforeAdmin,
  AdminStudio: beforeAdmin,
  AdminSprints: beforeAdmin,
  AdminProjects: beforeAdmin,
  Member: beforeMember,
  MemberResearch: beforeMember,
  MemberSprints: beforeMember,
  MemberProgresses: beforeMember,
  SuperAdmin: beforeSuper,
  SuperUsers: beforeSuper,
  SuperSprints: beforeSuper,
  SuperWorkspaces: beforeSuper,
  SuperCodeSnippets: beforeSuper,
}