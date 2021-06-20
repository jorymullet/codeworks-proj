import {firestore, ThisVue as that} from '../../main'
import resourceTypes from '../js/resource-types.json'

const getUserSprints = () => new Promise(async resolve => {
  const docs = (await firestore.collectionGroup('sprint_members').where('id', '==', that.$store.state.user.id).get()).docs

  if (!(docs && docs.length)) return resolve([])

  const sprintIds = docs.map(doc => doc.ref.parent.parent.id)
  const sprintPromises = sprintIds.map(id => firestore.doc(`sprints/${id}`).get())

  const sprints = (await Promise.all(sprintPromises)).map(doc => doc.data()).filter(Boolean)
  resolve(sprints)
})

const retrieveAllEntityData = (ids, dbCollection, field = 'name') => new Promise(async resolve => {
  try {
    if (!(ids && ids.length)) return resolve('')
    const promises = ids.map(id => firestore.doc(`${dbCollection}/${id}`).get())
    const entities = (await Promise.all(promises)).map(ss => ss.data())
    const entitiesString = entities.filter(Boolean).map(e => e[field]).join(', ')
    resolve(entitiesString)
  } catch (err) {
    console.error(err)
    resolve('')
  }
})

export const sprints = {
  getUserSprints,
  getUpcomingSprints: function () {
    return new Promise(async resolve => {
      const sprints = await getUserSprints()
      const upcomingSprints = sprints.filter(Boolean).filter(s => new Date(s.start_date + ' ') > Date.now())
      resolve(upcomingSprints)
    })
  },
}

export const resources = {
  getViewOptions: (resource, options) => new Promise(async resolve => {

    const creator = (await firestore.doc(`users/${resource.created_by}`).get()).data()
    const sections = [{
      title: 'Title',
      value: r => r.title,
    },]

    if (resource.source_name) {
      sections.push({
        title: 'Source Name',
        value: r => r.source_name,
      })
    }

    if (resource.type) {
      sections.push({
        title: 'Resource Type',
        value: r => `<div style="display:flex;align-items:center;"><i class="material-icons" style="font-size:16px;margin-right:.25rem">${resourceTypes[r.type].icon}</i> ${resourceTypes[r.type].name}</div>`
      })
    }

    if (resource.notes) {
      sections.push({
        title: 'Notes',
        value: r => r.notes,
      })
    }

    if (resource.url) {
      sections.push({
        title: 'Link',
        value: r => `<a href='${r.url}' target='_blank'>Go to site</a>`,
      })
    }

    const projectsString = await retrieveAllEntityData(resource.associated_projects, 'projects')
    if (projectsString) {
      sections.push({
        title: 'Associated Projects',
        value: _ => projectsString,
      })
    }

    const tagsStrings = await retrieveAllEntityData(resource.tags, 'tags')
    if (tagsStrings) {
      sections.push({
        title: 'Tags',
        value: _ => tagsStrings,
      })
    }

    if (creator && (creator.role !== 'SUPER_ADMIN')) {
      sections.push({
        title: 'Creator',
        value: _ => `<div class='pro-member'><div class='image'><img src='${creator.photo_url}'></div><div class='name'>${creator.first_name} ${creator.last_name}</div></div>`
      })
    }

    sections.push({
      title: 'Created',
      value: r => that.$buildDate(r.created_at, '{month}/{date}/{year}')
    })

    const trueUser = that.$store.state.trueUser
    const shouldShowEditButton = (resource.created_by === that.$auth.currentUser.uid)
      || ((trueUser.role === 'ADMIN') && (trueUser.org_id === that.$store.state.user.org_id))
      || (trueUser.role === 'SUPER_ADMIN')

    const entityOptions = {
      name: 'view-entity',
      title: 'Resource',
      entity: resource,
      sections,
      onEdit: shouldShowEditButton ? () => {
        that.$modals.hide('view-entity')
        that.$modals.show({
          name: 'edit-resource',
          resource,
          onSuccess: () => that.$proEmit('retrieve-resources'),
          hardClose: true,
          isStudioResource: resource.is_studio_resource,
        })
      } : false,
    }

    // this allows for a MEMBER to add a resource from studio links instead of editing
    if (resource.is_studio_resource && (options.canEdit === false)) {
      entityOptions.editCopy = 'Copy to your Resources'
      entityOptions.onEdit = options.addToUser
    }

    resolve(entityOptions)
  })
}

export const progresses = {
  getViewOptions: (progress) => new Promise(async resolve => {
    const sections = []

    if (progress.type === 'USER') {
      sections.push({
        title: 'What progess was made?',
        value: r => r.progress_made,
      })
    } else if (progress.type === 'SYSTEM') {
      sections.push({
        title: 'Event',
        value: r => r.title,
      })
    }
    
    if (progress.went_well) {
      sections.push({
        title: 'What went well?',
        value: r => r.went_well,
      })
    }

    if (progress.went_poorly) {
      sections.push({
        title: 'What went poorly?',
        value: r => r.went_poorly,
      })
    }
    
    if (progress.summary) {
      sections.push({
        title: 'What\'s the latest summary of your hunch, problem, concept, and/or pilot?',
        value: r => r.summary,
      })
    }

    const ap = progress.associated_projects
    if (ap && ap.length) {
      const promises = ap.map(projectId => firestore.doc(`projects/${projectId}`).get())
      const projects = (await Promise.all(promises)).map(ss => ss.data()).filter(Boolean)
      const projectsString = projects.map(p => p.name).filter(Boolean).join(', ')
      if (projectsString) {
        sections.push({
          title: 'Associated Projects',
          value: _ => projectsString,
        })
        // now that we know there are tags, we look into workspaces
        const workspaces = progress.workspaces
        if (workspaces && workspaces.length) {
          const workspacesValue = workspaces
            .reduce((acc, wsId) => {
              const associatedProject = projects.find(p => (p.workspaces || []).find(ws => ws.id === wsId))
              if (!associatedProject) return acc
              
              const workspace = associatedProject.workspaces.find(ws => ws.id === wsId)
              return acc + `<a target='_blank' style='display:block;margin-bottom:.25rem;' href='/projects/${associatedProject.id}/workspaces/${wsId}'>${workspace.type} (${associatedProject.name})</a>`
            }, '')

          if (workspacesValue) {
            sections.push({
              title: 'Workspaces',
              value: _ => workspacesValue,
            })
          }
        }
      }
    }

    if (progress.type === 'USER') {
      const creator = (await firestore.doc(`users/${progress.created_by}`).get()).data()
      if (creator && (creator.role !== 'SUPER_ADMIN')) {
        sections.push({
          title: 'Creator',
          value: _ => `<div class='pro-member'><div class='image'><img src='${creator.photo_url}'></div><div class='name'>${creator.first_name} ${creator.last_name}</div></div>`
        })
      }
    }

    sections.push({
      title: 'Created',
      value: r => that.$buildDate(r.created_at, '{month}/{date}/{year}')
    })

    const trueUser = that.$store.state.trueUser
    const shouldShowEditButton = (progress.type === 'USER')
      && ((progress.created_by === that.$auth.currentUser.uid)
      || ((trueUser.role === 'ADMIN') && (trueUser.org_id === that.$store.state.user.org_id))
      || (trueUser.role === 'SUPER_ADMIN'))

    resolve({
      name: 'view-entity',
      title: 'Progress',
      entity: progress,
      sections,
      onEdit: shouldShowEditButton ? () => {
        that.$modals.hide('view-entity')
        that.$modals.show({
          name: 'edit-progress',
          progress,
          onSuccess: () => that.$proEmit('retrieve-progresses'),
          hardClose: true,
        })
      } : false,
    })

  })
}

export const conversations = {
  getViewOptions: (conversation) => new Promise(async resolve => {
    const creator = (await firestore.doc(`users/${conversation.created_by}`).get()).data()
    const sections = [{
      title: 'With Whom',
      value: c => c.with_whom,
    },]

    if (conversation.topic) {
      sections.push({
        title: 'Topic',
        value: c => c.topic,
      })
    }

    if (conversation.notes) {
      sections.push({
        title: 'Notes',
        value: c => c.notes,
      })
    }

    const ap = conversation.associated_projects
    const projectsString = await retrieveAllEntityData(conversation.associated_projects, 'projects')
    if (projectsString) {
      sections.push({
        title: 'Associated Projects',
        value: _ => projectsString,
      })
    }

    const tagsStrings = await retrieveAllEntityData(conversation.tags, 'tags')
    if (tagsStrings) {
      sections.push({
        title: 'Tags',
        value: _ => tagsStrings,
      })
    }

    if (conversation.date) {
      const date = that.$buildDate(conversation.date, '{month}/{date}/{year}')
      if (date) {
        sections.push({
          title: 'Date of Conversation',
          value: c => date,
        })
      }
    }

    if (creator && (creator.role !== 'SUPER_ADMIN')) {
      sections.push({
        title: 'Creator',
        value: _ => `<div class='pro-member'><div class='image'><img src='${creator.photo_url}'></div><div class='name'>${creator.first_name} ${creator.last_name}</div></div>`
      })
    }

    sections.push({
      title: 'Created',
      value: c => that.$buildDate(c.created_at, '{month}/{date}/{year}')
    })

    const trueUser = that.$store.state.trueUser
    const shouldShowEditButton = (conversation.created_by === that.$auth.currentUser.uid)
      || ((trueUser.role === 'ADMIN') && (trueUser.org_id === that.$store.state.user.org_id))
      || (trueUser.role === 'SUPER_ADMIN')
    
    resolve({
      name: 'view-entity',
      title: 'Conversation',
      entity: conversation,
      sections,
      onEdit: shouldShowEditButton ? () => {
        that.$modals.hide('view-entity')
        that.$modals.show({
          name: 'edit-conversation',
          conversation,
          onSuccess: () => that.$proEmit('retrieve-conversations'),
          hardClose: true,
        })
      } : false,
    })
  })
}

export const tags = {
  retrieveAllAssociatedWithUser: async (user, projects) => {
    const userTags = that.$fire.qs.toArray(await that.$firestore.collection('tags')
      .where('org_id', '==', user.org_id)
      .where('created_by', '==', user.id).get())
      .sort((a, b) => b.created_at - a.created_at)

    const retrieveConversationsPromise = that.$fire.retrieveAllUserAssociatedEntities({
      user,
      projects,
      collection: 'conversations',
    })

    const retrieveResourcesPromise = that.$fire.retrieveAllUserAssociatedEntities({
      user,
      projects,
      collection: 'resources',
    })

    // retrieves all research (convos && resources)
    const associatedProjectTagIds = (await Promise.all([retrieveConversationsPromise, retrieveResourcesPromise]))
      // puts convos and resources in the same array
      .reduce((acc, research) => [...acc, ...research], [])
      // batches associated_project ids
      .reduce((ids, entity) => [...ids, ...(entity.tags || [])], [])
      .filter(tagId => !userTags.find(tag => tag.id === tagId))
      .uniquify()

    const projectTagPromises = associatedProjectTagIds.map(id => that.$firestore.doc(`tags/${id}`).get())

    const projectTags = (await Promise.all(projectTagPromises))
      .filter(ss => ss.exists)
      .map(ss => ss.data())
      .sort((a, b) => b.created_at - a.created_at)

    return [...userTags, ...projectTags]
  }
}