import {firestore} from './../../main'

export default {
  install: function (Vue) {
    Vue.prototype.$fire = {
      getExistentUsers: async (userIds) => {
        const promises = userIds.map(uid => firestore.doc(`users/${uid}`).get())
        const remainingMemberIds = (await Promise.all(promises)).map(ss => ss.data()).filter(Boolean).map(user => user.id)
        return remainingMemberIds
      },
      retrieveAllUserAssociatedEntities: (options) => new Promise(async (resolve, reject) => {
        try {
          const projectEntitiesPromises = (options.projects || [])
          .map(project => firestore
            .collection(options.collection)
            .where('org_id', '==', options.user.org_id)
            .where('associated_projects', 'array-contains', project.id).get()
          )

        const projectEntities = (await Promise.all(projectEntitiesPromises))
          .map(qs => qs.docs.map(doc => doc.data()))
          .reduce((acc, arr) => acc.concat(arr), [])
        
        const userEntities = (await firestore
          .collection(options.collection)
          .where('org_id', '==', options.user.org_id)
          .where('created_by', '==', options.user.id).get()
        ).docs.map(doc => doc.data())

        const allEntities = projectEntities.concat(userEntities)
        const entitiesObj = allEntities
          .reduce((acc, entity) => {
            acc[entity.id] = entity
            return acc
          }, {})
        const uniqueEntities = Object.values(entitiesObj)

        const entities = uniqueEntities
          // literally just filters our resources that are just studio resources
          .filter(e => !e.is_studio_resource)
          .sort((a,b) => b.created_at - a.created_at)

        resolve(entities)
        } catch (err) {
          reject(err)
        }
      }),
      qs: {
        toJSON (qs) {
          return qs.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data()
            acc[doc.id].id = doc.id
            return acc
          }, {})
        },
        toArray (qs) {
          return qs.docs.map(doc => {
            const data = doc.data()
            data.id = doc.id
            return data
          })
        },
      },
    }
  },
}