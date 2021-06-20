import Vue from 'vue'
import Router from 'vue-router'
import {firestore} from './main'
import store from './store'

const that = Vue.prototype

Vue.use(Router)

const project = {
  main: () => import('$routed/Project/Main.vue'),
  dashboard: () => import('$routed/Project/Dashboard.vue'),
  workspace: () => import('$routed/Project/WorkspaceView.vue'),
}

const _super = {
  main: () => import('$routed/Super/Main.vue'),
  orgs: () => import('$routed/Super/Orgs.vue'),
  workspaces: () => import('$routed/Super/Workspaces.vue'),
  sprints: () => import('$routed/Super/Sprints.vue'),
  codeSnippets: () => import('$routed/Super/CodeSnippets.vue'),
}

const admin = {
  main: () => import('$routed/Admin/Main.vue'),
  dashboard: () => import('$routed/Admin/Dashboard/Main.vue'),
  users: () => import('$routed/Admin/Users.vue'),
  studio: () => import('$routed/Admin/Studio.vue'),
  sprints: () => import('$routed/Admin/Sprints/Main.vue'),
  projects: () => import('$routed/Admin/Projects.vue'),
}

const member = {
  main: () => import('$routed/Member/Main.vue'),
  dashboard: () => import('$routed/Member/Dashboard.vue'),
  research: () => import('$routed/Member/Research.vue'),
  sprints: () => import('$routed/Member/Sprints.vue'),
  progresses: () => import('$routed/Member/Progresses.vue'),
}

const _public = {
  main: () => import('$routed/Public/Main.vue'),
  login: () => import('$routed/Public/Login.vue'),
  logout: () => import('$routed/Public/Logout.vue'),
  invite: () => import('$routed/Public/Invite.vue'),
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: _public.main,
      children: [
        {
          path: '/logout',
          name: 'Logout',
          component: _public.logout,
          meta: {
            transIndex: -10,
          }
        },
        {
          path: '/logout/force',
          name: 'LogoutForce',
          beforeEnter (to, from, next) {
            setTimeout(() => {
              store.commit('logout')
            }, 10)
          },
        },
        {
          path: '/login',
          name: 'Login',
          component: _public.login,
          meta: {
            transIndex: 0,
          },
        },
        {
          path: '/invites/:inviteId',
          name: 'Invite',
          component: _public.invite,
          meta: {
            transIndex: 50,
          },
        },
        {
          path: '/',
          beforeEnter (to, from, next) {
            next({name: 'Login'})
          },
        },
      ],
    },
    {
      path: '/members/:userId',
      component: member.main,
      meta: {
        roles: ['MEMBER', 'ADMIN', 'SUPER_ADMIN'],
      },
      children: [{
        path: '',
        component: member.dashboard,
        name: 'Member',
        meta: {
          transIndex: 50,
          roles: ['MEMBER', 'ADMIN', 'SUPER_ADMIN'],
        },
      },{
        path: 'research',
        component: member.research,
        name: 'MemberResearch',
        meta: {
          transIndex: 60,
        },
      }, {
        path: 'sprints',
        name: 'MemberSprints',
        component: member.sprints,
        meta: {
          transIndex: 70,
          roles: ['MEMBER', 'ADMIN', 'SUPER_ADMIN'],
        },
      }, {
        path: 'progress',
        name: 'MemberProgresses',
        component: member.progresses,
        meta: {
          transIndex: 80,
          roles: ['MEMBER', 'ADMIN', 'SUPER_ADMIN'],
        },
      },],
    },
    {
      path: '/projects/:projectId',
      component: project.main,
      meta: {
        transIndex: 30,
      },
      children: [{
        path: '',
        name: 'Project',
        component: project.dashboard,
        meta: {
          transIndex: 60,
        },
      }, {
        path: 'workspaces/:workspaceId',
        name: 'ProjectWorkspaceView',
        component: project.workspace,
        meta: {
          transIndex: 80,
        },
      }]
    },
    {
      path: '/orgs/:orgId/admin',
      component: admin.main,
      meta: {
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      children: [{
        path: '',
        component: admin.dashboard,
        name: 'Admin',
      },{
        path: 'users',
        component: admin.users,
        name: 'AdminUsers',
        props: {
          usersRef: () => {
            const orgId = router.currentRoute.params.orgId
            return firestore.collection('users').where('org_id', '==', orgId)
          },
        },
      },{
        path: 'projects',
        component: admin.projects,
        name: 'AdminProjects',
      },{
        path: 'studio',
        component: admin.studio,
        name: 'AdminStudio',
      }, {
        path: 'sprints',
        component: admin.sprints,
        name: 'AdminSprints',
        props: {
          showOrg: true,
        },
      }],
    },
    {
      path: '/super',
      component: _super.main,
      meta: {
        roles: ['SUPER_ADMIN']
      },
      beforeEnter (to, from, next) {
        store.commit('update', {user: store.state.trueUser})
        if (to.name === 'SuperAdmin') return next()
        next({name: 'SuperAdmin'})
      },
      children: [{
        path: 'orgs',
        component: _super.orgs,
        name: 'SuperAdmin',
      }, {
        path: 'users',
        component: admin.users,
        name: 'SuperUsers',
        props: {
          usersRef: () => {
            return firestore.collection('users')
          },
        },
      }, {
        path: 'workspaces',
        component: _super.workspaces,
        name: 'SuperWorkspaces'
      }, {
        path: 'sprints',
        component: _super.sprints,
        name: 'SuperSprints',
        props: {
          showOrg: false,
        },
      }, {
        path: 'code-snippets',
        component: _super.codeSnippets,
        name: 'SuperCodeSnippets',
      }]
    },
  ]
})

import routerPromises from './router-promises'

router.beforeEach(async (to, from, next) => {
  // /* eslint-disable */
  // return next()

  that.$showLoading()

  const store = require('./store.js').default

  const roles = to.meta.roles
  if (roles) {
    const user = store.state.user
    if (!(user && roles.includes(user.role))) {
      that.$cookies.set('invanti-redirect', to.fullPath)
      that.$hideLoading()
      return next({name: 'Login',})
    }
  }

  const beforePromise = routerPromises[to.name]
  if (beforePromise) {
    if (store.state.routerPromiseRunning) return console.log('Prevented additional promises from being run.')

    store.commit('update', {routerPromiseRunning: true,})

    if (typeof beforePromise === 'function') {//
      await beforePromise(to)
    } else if (typeof beforePromise === 'object') { //it is an array
      const reduced = beforePromise.reduce((acc, prom) => {
        return acc.then(() => prom(to))
      }, Promise.resolve())
      await reduced
    }
    
    store.commit('update', {routerPromiseRunning: false,})
  }
  
  that.$hideLoading()
  next()
})

export default router