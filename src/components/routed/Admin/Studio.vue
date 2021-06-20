<script>
import Links from '$common/Links'
import AddButton from '$common/AddButton'
import ProTable from '$common/ProTable'
import Resources from '$common/Resources'
import Collapser from '$common/Collapser'
import SprintTypes from '$common/SprintTypes'
export default {
  name: 'AdminStudio',
  components: {
    'links': Links,
    'add-button': AddButton,
    'pro-table': ProTable,
    'collapser': Collapser,
    'studio-resources': Resources,
    'sprint-types': SprintTypes,
  },
  data() {
    return {
      linkGroups: null,
      cells: [{
        name: 'Name',
        getInfo: g => g.name,
        sortFunc: (a,b) => a.name.localeCompare(b.name),
      }, {
        name: '# Members',
        getInfo: g => g.members.length,
        sortFunc: (a,b) => a.members.length - b.members.length,
      }, {
        name: '# Links',
        getInfo: g => g.links.length,
        sortFunc: (a,b) => a.links.length - b.links.length,
      }, {
        name: 'Edit Link Group',
        getInfo: _ => '<i class="material-icons" style="font-size:18px;">edit</i>',
        onClick: linkGroup => this.onEditLinkGroup({linkGroup}),
      }],
      projects: null,
      tags: null,
      defaultSprintTypes: null,
      orgSprintTypes: null,
    }
  },
  computed: {
    org () {
      return this.$store.state.org
    },
    dropdowns () {
      if (!(this.tags && this.projects)) return []

      const dropdowns = []
      if (this.tags.length) {
        const tagsDropdown = {
          title: 'Filter by Tag',
          options: this.tags.map(tag => ({
            name: tag.name,
            value: tag.id,
          })),
          func: (entity, chosen) => entity.tags.find(tag => chosen.includes(tag)),
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
    async getSprintTypes () {
      this.orgSprintTypes = this.org.sprint_types || []
      this.defaultSprintTypes = this.org.default_sprint_types || []
    },
    onEditLinkGroup (options) {
      this.$modals.show({
        name: 'edit-link-group',
        onSuccess: this.getLinkGroups,
        ...options,
      })
    },
    async getLinkGroups () {
      this.linkGroups = this.$fire.qs.toArray(await this.$firestore.collection('link_groups').where('org_id', '==', this.org.id).get())
    },
    async retrieveResourcesPromise () {
      return this.$fire.qs.toArray(
        await this.$firestore.collection('resources')
          .where('org_id', '==', this.org.id)
          .where('is_studio_resource', '==', true)
          .get()
      )
    },
    async getProjectAndTags () {
      const collections = ['projects', 'tags']
      const [projects, tags] = (await Promise.all(
        collections
          .map(coll => this.$firestore.collection(coll).where('org_id', '==', this.org.id).get())))
        .map(qs => this.$fire.qs.toArray(qs).filter(ent => !ent.is_founder))
      
      this.projects = projects
      this.tags = tags
      this.$forceUpdate()
    },
    showEditOrg () {
      this.$modals.show({
        name: 'edit-org',
        org: this.$store.state.org,
        onSuccess: () => this.$store.commit('refreshOrg'),
      })
    }
  },
  async mounted () {
    await this.getSprintTypes()
    this.getProjectAndTags()
    await this.getLinkGroups()
  },
}
</script>

<template lang="pug">
  #admin-manage-links-main.admin-main
    .admin-manage-links-container.admin-container
      .header
        .title-and-button
          .pro-title Manage Resources
          .pro-button.minor(
            @click='showEditOrg'
          ) Edit Organization
        .instruction These links and resources are viewable to all of your members.
      .content.studio
        links(
          v-if='org'
          title='Studio Links'
          :links='org.links'
          :dbRef='`orgs/${org.id}`'
          refresh='refreshOrg'
          :canEdit='true'
        )
        studio-resources(
          :retrievePromise='retrieveResourcesPromise'
          :canEdit='true'
          title='Studio Resources'
          :searchOptions='{field: "title", by: "Title"}'
          :isStudioResources='true'
          :dropdowns='dropdowns'
        )
      collapser(
        title='Sprint Types'
      )
        .content
          .sprint-types-holder
            sprint-types(
              title='Default Sprint Types'
              :canEdit='false'
              :sprintTypes='defaultSprintTypes'
              dbRef='admin/settings'
            )
            sprint-types(
              title='Studio Types'
              :canEdit='true'
              :sprintTypes='orgSprintTypes'
              :dbRef='`orgs/${$route.params.orgId}`'
            )
      collapser(
        title='Link Groups'
      )
        //.header
          .pro-title Link Groups
            add-button(
              :onClick='() => onEditLinkGroup({isNew: true})'
            )
        .content
          add-button.add-link-group(
              :onClick='() => onEditLinkGroup({isNew: true})'
          )
          .links-groups-holder
            .no-interaction.loading.italic(
              v-if='!linkGroups'
            ) Loading...
            .no-interaction.no-groups.intalic(
              v-else-if='!linkGroups.length'
            ) No link groups.
            pro-table(
              v-else
              :cells='cells'
              :entities='linkGroups'
            )


</template>

<style lang="sass" scoped>
  #admin-manage-links-main.admin-main
    .admin-manage-links-container.admin-container
      .header
        .title-and-button
          display: grid
          grid-template-columns: max-content auto
          align-items: center
          > .pro-title
            font-size: 32px
            margin-bottom: 0
          > .pro-button 
            justify-self: right
      .content
        margin: 2rem 0
        &.studio
          display: grid
          grid-template-columns: 1fr 1fr
          column-gap: 2rem
        #links-main
          max-width: 20rem
        .sprint-types-holder
          display: grid
          grid-template-columns: 1fr 1fr
          column-gap: 2rem
        .add-link-group
          margin-bottom: 2rem
</style>