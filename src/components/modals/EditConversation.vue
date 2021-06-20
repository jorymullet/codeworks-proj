<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
import {tags} from '@/global/js/entity-manager.js'
export default {
  name: 'EditConversation',
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
      form: {
        with_whom: '',
        topic: '',
        notes: '',
        tags: [],
        associated_projects: [],
        date: '',
      },
      formOptions: {
        with_whom: {
          title: 'With Whom',
          errorIf: val => val ? '' : `Input with whom you spoke`,
        },
        topic: {
          title: 'Topic',
          errorIf: val => val ? '' : 'Input topic',
        },
        notes: {
          title: 'Notes',
          type: 'textarea'
        },
        date: {
          title: 'Date of conversation',
          type: 'date',
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

      const conversationsRef = this.$firestore.collection('conversations')
      const uid = this.user.id
      const now = Date.now()

      let conversation
      if (this.options.isNew) {
        const newFields = {
          id: conversationsRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          org_id: this.$store.state.org.id,
        }
        conversation = {
          ...this.form,
          ...newFields,
        }
      } else {
        conversation = {
          ...this.options.conversation,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      try {
        await conversationsRef.doc(conversation.id).set(conversation)
        this.$toast('Saved conversation')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-conversation')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save conversation.')
      }
    },
    prefillFields () {
      if (this.options.isNew) {
        if (this.options.preassociatedProjects) {
          this.form.associated_projects = this.options.preassociatedProjects
        }
      } else {
        Object.keys(this.form).forEach(key => {
          this.form[key] = this.$clone(this.options.conversation[key]) // had to use $clone since it was updating members during editing
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
      const conversation = this.options.conversation
      if (!confirm(`Press OK if you are sure you want to delete the conversation ${conversation.title}.`)) return

      try {
        await this.$firestore.doc(`conversations/${conversation.id}`).delete()
        this.$toast('Conversation deleted.')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-conversation')
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete conversation.')
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
  #edit-conversation-main.modal-main
    .edit-conversation-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Conversation
      .content
        .pro-form
          .form-row(
            v-for='(options, key) in formOptions'
          )
            pro-input(
              v-model='form[key]'
              :options='options'
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
          @click='$modals.hide("edit-conversation")'
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
  #edit-conversation-main
    .edit-conversation-container
      .content
        margin-top: 2rem
        .pro-form
          .tag-row
            grid-template-columns: auto min-content
            column-gap: 1rem
            align-items: center
            cursor: pointer
</style>