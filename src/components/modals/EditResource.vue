<script>
import resourceTypes from '@/global/js/resource-types.json'
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
import {tags} from '@/global/js/entity-manager.js'
export default {
  name: 'EditResource',
  components: {
    'pro-input': ProInput,
    'pro-select': ProSelect,
  },
  props: {
    options: {
      type: Object,
    }
  },
  data () {
    return {
      projects: null,
      tags: null,
      resourceTypes: Object.keys(resourceTypes).map(value => ({
        value, 
        name: `<div style="display:flex;align-items:center;"><i class="material-icons" style="font-size:16px;margin-right:.25rem">${resourceTypes[value].icon}</i> ${resourceTypes[value].name}</div>`,
      })),
      form: {
        title: '',
        url: '',
        notes: '',
        source_name: '',
        type: '',
        tags: [],
        associated_projects: [],
      },
      formOptions: {
        title: {
          title: 'Title',
          errorIf: val => val && (val.length > 0) && (val.length < 50) ? '' : `Title must be ${val && val.length ? 'shorter' : 'longer'}`,
        },
        url: {
          title: 'Link',
          errorIf: val => !val || this.$regex.is(val).a('fullUrl') ? '' : 'Input valid URL (must start with http or https)',
        },
        notes: {
          title: 'Notes',
          errorIf: _ => '',
          type: 'textarea'
        },
        source_name: {
          title: 'Source Name',
          errorIf: _ => '',
        },
      },
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    org () {
      return this.$store.state.org
    },
    projectsOptions () {
      if (!this.projects) return

      return this.projects.map(project => ({
        name: project.name,
        value: project.id,
      }))
    },
    tagsOptions () {
      if (!this.tags) return

      return this.tags.map(tag => ({
        name: tag.name,
        value: tag.id,
      }))
    },
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast({copy: e}))

      const resourcesRef = this.$firestore.collection('resources')
      const uid = this.user.id
      const now = Date.now()

      let resource
      if (this.options.isNew) {
        const newFields = {
          id: resourcesRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          org_id: this.$store.state.org.id,
        }
        resource = {
          ...this.form,
          ...newFields,
        }
      } else {
        resource = {
          ...this.options.resource,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      resource.is_studio_resource = Boolean(this.options.isStudioResource)

      try {
        await resourcesRef.doc(resource.id).set(resource)
        this.$toast('Saved resource')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-resource')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save resource.')
      }
    },
    prefillFields () {
      if (this.options.isNew) {
        if (this.options.preassociatedProjects) {
          this.form.associated_projects = this.options.preassociatedProjects
        }
      } else {
        Object.keys(this.form).forEach(key => {
          this.form[key] = this.$clone(this.options.resource[key]) // had to use $clone since it was updating members during editing
        })

        const checksForExistence = [{field: 'tags', array: 'tags'}, {field: 'associated_projects', array: 'projects'}]
        checksForExistence.forEach(check => {
          this.form[check.field] = this.form[check.field].filter(id => id && this[check.array].find(p => p.id === id))
        })
      }
    },
    async getProjects () {
      let query = this.$firestore.collection('projects').where('org_id', '==', this.org.id)
      if (this.user.role === 'MEMBER') {
        query = query.where('members', 'array-contains', this.user.id)
      }
      this.projects = this.$fire.qs.toArray(await query.get())
        .filter(p => !p.is_founder || (p.created_by === this.user.id))
    },
    async getTags () {
      this.tags = await tags.retrieveAllAssociatedWithUser(this.user, this.projects)
    },
    async onDelete () {
      const resource = this.options.resource
      if (!confirm(`Press OK if you are sure you want to delete the resource ${resource.title}.`)) return

      try {
        await this.$firestore.doc(`resources/${resource.id}`).delete()
        this.$toast('Resource deleted.')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-resource')
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete resource.')
      }
    },
    showAddTag () {
      this.$modals.show({
        name: 'edit-tag',
        isNew: true,
        zIndex: 5,
        onSuccess: (tag) => {
          this.form.tags.push(tag.id)
          this.$proEmit('retrieve-tags')
        },
      })
    },
    printId () {
      if (this.options.isNew) return console.log('new')

      console.log(this.options.resource.id)
    },
  },
  async mounted () {
    await this.getProjects()
    await this.getTags()
    this.$nextTick(this.prefillFields)
    this.$proOn('retrieve-tags', this.getTags)
  },
}
</script>

<template lang="pug">
  #edit-resource-main.modal-main
    .edit-resource-container.modal-container
      .title(
        @click='printId'
      ) {{options.isNew ? 'Create' : 'Edit'}} Resource
      .content
        .pro-form
          .form-row(
            v-for='(options, key) in formOptions'
          )
            pro-input(
              v-model='form[key]'
              :options='options'
            )
          .form-row
            pro-select(
              :disabled='!resourceTypes'
              title='Resource Type'
              v-model='form.type'
              :options='resourceTypes'
            )
          .form-row.tag-row
            pro-select(
              :disabled='!tags'
              title='Tags'
              v-model='form.tags'
              :options='tagsOptions'
              :multiple='true'
            )
            i.material-icons(
              @click='showAddTag'
            ) add_box
          .form-row
            pro-select(
              :disabled='!projects'
              title='Associated Projects'
              v-model='form.associated_projects'
              :options='projectsOptions'
              :multiple='true'
            )
            
      .action
        .button.cancel(
          @click='$modals.hide("edit-resource")'
        ) Cancel
        .button.delete(
          v-if='!options.isNew'
          @click='onDelete'
        ) Delete
        .button(
          @click='onSave'
        ) Save
</template>

<style lang="sass" scoped>
  #edit-resource-main
    .edit-resource-container
      .content
        margin-top: 2rem
        .pro-form
          .tag-row
            grid-template-columns: auto min-content
            column-gap: 1rem
            align-items: center
            cursor: pointer
</style>