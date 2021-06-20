<script>
import Resources from '$common/Resources'
import Conversations from '$common/Conversations'
import Tags from '$common/Tags'
import {tags} from '@/global/js/entity-manager.js'

export default {
  name: 'MemberResearch',
  components: {
    'resources': Resources,
    'studio-resources': Resources,
    'conversations': Conversations,
    'tags': Tags,
  },
  data() {
    return {
      retrieveResourcesPromise: async () => {
        const resources = await this.$fire.retrieveAllUserAssociatedEntities({
          user: this.user,
          projects: this.projects,
          collection: 'resources'
        })
        return resources.filter(r => !r.is_studio_resource)
      },
      retrieveConversationsPromise: () => this.$fire.retrieveAllUserAssociatedEntities({
        user: this.user,
        projects: this.projects,
        collection: 'conversations',
      }),
      retrieveTagsPromise: async () => {
        return tags.retrieveAllAssociatedWithUser(this.user, this.projects)
      },
      retrieveStudioResources: async () => this.$fire.qs.toArray(
        await this.$firestore.collection('resources')
          .where('org_id', '==', this.org.id)
          .where('is_studio_resource', '==', true)
          .get()
        ),
      tags: [],
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    org () {
      return this.$store.state.org
    },
    projects () {
      return this.$store.state.userProjects
    },
    filters () {
      const userFilter = {
        func: entity => entity.created_by === this.user.id,
        copy: engaged => engaged ? 'View All' : 'View Only Yours',
      }
      return [userFilter,]
    },
    dropdowns () {
      const dropdowns = []
      if (this.tags.length) {
        const tagsDropdown = {
          title: 'Filter by Tag',
          options: this.tags.map(tag => ({
            name: tag.name,
            value: tag.id,
          })),
          func: (entity, chosen) => entity.tags.find(tag => chosen.includes(tag)),
          helperButtons: [{
            copy: 'Edit Tags',
            click: () => {
              const tagsEle = document.getElementById('tags-main')
              if (!tagsEle) return

              tagsEle.scrollIntoView({behavior: 'smooth'})
              tagsEle.style.transition = 'background .5s'
              tagsEle.style.background = '#4083a9'
              // eslint-disable-next-line
              setTimeout(() => {
                tagsEle.style.background = 'inherit'
              }, 500)
            }
          }]
        }
        dropdowns.push(tagsDropdown)
      }
      if (this.projects.length) {
        const projectsDropdown = {
          title: 'Filter by Project',
          options: this.projects.map(project => ({
            name: project.name,
            value: project.id,
          })),
          func: (entity, chosen) => entity.associated_projects.find(projectId => chosen.includes(projectId)),
        }
        dropdowns.push(projectsDropdown)
      }

      return dropdowns
    },
  },
  methods: {
    async getTags () {
      this.tags = await tags.retrieveAllAssociatedWithUser(this.user, this.projects)
    }
  },
  mounted () {
    this.getTags()
    this.$proOn('retrieve-tags', this.getTags)
  },
}
</script>

<template lang="pug">
  #member-research-main.member-main
    .member-research-container.member-container
      .header
        .pro-title My Research
      .content
        resources(
          :retrievePromise='retrieveResourcesPromise'
          :filters='filters'
          :searchOptions='{field: "title", by: "Title"}'
          :dropdowns='dropdowns'
        )
        conversations(
          :retrievePromise='retrieveConversationsPromise'
          :filters='filters'
          :searchOptions='{field: "with_whom", by: "Person"}'
          :dropdowns='dropdowns'
        )
        studio-resources(
          :retrievePromise='retrieveStudioResources'
          :canEdit='false'
          title='Studio Resources'
          :isStudioResources='true'
          :dropdowns='dropdowns'
          :filters='filters'
          :searchOptions='{field: "title", by: "Title"}'
        )
        tags(
          :retrievePromise='retrieveTagsPromise'
          title='Tags'
        )
</template>

<style lang="sass" scoped>
  #member-research-main
    .member-research-container
      .content
        margin-top: 2rem
        display: grid
        grid-template-columns: 1fr 1fr
        row-gap: 4rem
        column-gap: 4rem
</style>