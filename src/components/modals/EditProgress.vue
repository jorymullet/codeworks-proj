<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
import { VueEditor } from "vue2-editor"
export default {
  name: 'EditResource',
  components: {
    'pro-input': ProInput,
    'pro-select': ProSelect,
    'vue-editor': VueEditor,
  },
  props: {
    options: {
      type: Object,
    }
  },
  watch: {
    'form.associated_projects': {
      handler (ap) {
        // makes sure you don't have a workspace chosen if the associated project is not
        const projects = ap.map(id => this.projects.find(p => p.id === id))

        this.form.workspaces = this.form.workspaces.filter(wsId => {
          if (!wsId) return false

          const projectIsChosen = projects.find(p => (p.workspaces || []).find(pWs => pWs.id === wsId))
          return projectIsChosen
        })
      },
    }
  },
  data () {
    return {
      projects: null,
      form: {
        progress_made: '',
        went_well: '',
        went_poorly: '',
        summary: '',
        associated_projects: [],
        workspaces: [],
      },
      formOptions: {
        progress_made: {
          title: 'What progress have you made?',
          errorIf: val => val && (val.length > 0) && (val.length < 5000) ? '' : `Progress made must be ${val && val.length ? 'shorter' : 'longer'}`,
          type: 'textarea',
        },
        went_well: {
          title: 'What went well?',
          type: 'textarea',
        },
        went_poorly: {
          title: 'What went poorly?',
          type: 'textarea',
        },
        summary: {
          title: 'What\'s the latest summary of your hunch, problem, concept, and/or pilot?',
          type: 'textarea'
        },
      },
      editorToolbar: [['bold', 'italic', 'underline', 'strike',], [{ list: 'ordered' }, { list: 'bullet' }], ['image', 'clean']],
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
    workspacesOptions () {
      const ap = this.form.associated_projects
      if (!(ap && ap.length && this.projects)) return []

      const workspacesOptions = ap.reduce((acc, id) => {
        const project = this.projects.find(p => p.id === id) || {workspaces: []}
        const options = project.workspaces.map(ws => ({
          name: `${ws.type} (${project.name})`,
          value: ws.id,
        }))
        return acc.concat(options)
      }, []).sort()

      return workspacesOptions
    },
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast({copy: e}))

      this.$showLoading()

      const progressesRef = this.$firestore.collection('progresses')
      const uid = this.user.id
      const now = Date.now()

      let progress
      if (this.options.isNew) {
        const newFields = {
          id: progressesRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          org_id: this.$store.state.org.id,
          type: 'USER',
        }
        progress = {
          ...this.form,
          ...newFields,
        }
      } else {
        progress = {
          ...this.options.progress,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      try {
        await progressesRef.doc(progress.id).set(progress)
        this.$toast('Saved progress')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-progress')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save progress.')
      } finally {
        this.$hideLoading()
      }
    },
    prefillFields () {
      if (this.options.isNew) {
        if (this.options.preassociatedProjects) {
          this.form.associated_projects = this.options.preassociatedProjects
        }
      } else {
        Object.keys(this.form).forEach(key => {
          this.form[key] = this.$clone(this.options.progress[key]) // had to use $clone since it was updating members during editing
        })

        const checksForExistence = [/*{field: 'tags', array: 'tags'},*/ {field: 'associated_projects', array: 'projects'}]
        checksForExistence.forEach(check => {
          this.form[check.field] = this.form[check.field].filter(id => id && this[check.array].find(p => p.id === id))
        })

        this.form.workspaces = this.form.workspaces
          .filter(wsId => wsId && this.projects.find(p => (p.workspaces || []).find(pWs => pWs.id === wsId)))
      }
    },
    async getProjects () {
      this.projects = this.$fire.qs
        .toArray(await this.$firestore.collection('projects')
          .where('org_id', '==', this.user.org_id)
          .where('members', 'array-contains', this.user.id)
          .get()
        )
        .filter(p => !p.is_founder || (p.created_by === this.user.id))
    },
    async onDelete () {
      if (!confirm(`Press OK if you are sure you want to delete this progress.`)) return
      const progress = this.options.progress

      try {
        await this.$firestore.doc(`progresses/${progress.id}`).delete()
        this.$toast('Progress deleted.')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-progress')
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete progress.')
      }
    },
  },
  async mounted () {
    await this.getProjects()
    //await this.getTags()
    this.$nextTick(this.prefillFields)
  },
}
</script>

<template lang="pug">
  #edit-progress-main.modal-main
    .edit-progress-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Progress
      .content
        .pro-form
          .form-row.big(
            v-for='(options, key) in formOptions'
          )
            .title {{options.title}}
            vue-editor(
              v-model='form[key]'
              :editorToolbar='editorToolbar'
              :placeholder='options.title'
            )
          .form-row
            pro-select(
              :disabled='!projects'
              title='Associated Projects'
              v-model='form.associated_projects'
              :options='projectsOptions'
              :multiple='true'
            )
          .form-row
            pro-select(
              title='Workspaces'
              :disabled='!(form.associated_projects && form.associated_projects.length)'
              v-model='form.workspaces'
              :options='workspacesOptions'
              :multiple='true'
            )
            
      .action
        .button.cancel(
          @click='$modals.hide("edit-progress")'
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
  #edit-progress-main
    width: calc(100% - 4rem)
    max-width: 40rem
    .edit-progress-container
      .content
        .pro-form
          .form-row
            &.big
              margin-bottom: 4rem
            .title
              font-size: 12px
              color: grey
              margin-bottom: 1rem
</style>