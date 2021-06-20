<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
export default {
  name: 'EditProject',
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
      members: null,
      form: {
        name: '',
        members: [],
        workspaces: [],
      },
      formOptions: {
        name: {
          title: 'Name',
          errorIf: val => val && (val.length > 0) && (val.length < 50) ? '' : `Name must be between ${val && val.length ? 'shorter' : 'longer'}`,
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
    membersOptions () {
      if (!this.members) return

      return this.members.map(member => ({
        name: `<div style='display:flex;align-items:center;'><img style='height:1rem;width:1rem;margin-right:.5rem;border-radius:1rem;' src='${member.photo_url}'>${member.first_name} ${member.last_name}</div>`,
        value: member.id,
      }))
    },
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast({copy: e}))

      this.$showLoading()

      const projectsRef = this.$firestore.collection('projects')
      const uid = this.$auth.currentUser.uid
      const now = Date.now()

      let project
      if (this.options.isNew) {
        
        // -- First, we must retrieve our workspaces.
        const orgId = this.$store.state.org.id
        let workspaces
        try {
          const result = await this.$HTTP({
            method: 'get',
            uri: `workspaces?orgId=${orgId}`,
          })
          if (result && result.body && result.body.workspaces) {
            workspaces = result.body.workspaces
          } else {
            return this.$toast({
              message: 'Could not get workspaces. Please try again.',
              time: 4000,
            })
          }
        } catch ({body}) {
          console.error(body)
          let message = 'An error has occurred. Please try again.'
          if (body && body.message) {
            message = body.message
          }
          this.$hideLoading()
          return this.$toast({copy: message, time: 5000})
        }

        const newFields = {
          id: projectsRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          is_founder: false,
          org_id: orgId,
          workspaces,
        }

        project = {
          ...this.form,
          ...newFields,
        }
      } else {
        project = {
          ...this.options.project,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      try {
        await this.$firestore.doc(`projects/${project.id}`).set(project)
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-project')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save project.')
      } finally {
        this.$hideLoading()
      }
    },
    prefillFields () {
      if (this.options.isNew) return

      Object.keys(this.form).forEach(key => {
        this.form[key] = this.$clone(this.options.project[key]) // had to use $clone since it was updating members during editing
      })
    },
    async getMembers () {
      this.members = this.$fire.qs
        .toArray(await this.$firestore.collection('users').where('org_id', '==', this.org.id).get())

      // if project is new && user is a MEMBER, auto add them to new project.
      if (this.options.isNew && this.user.role === 'MEMBER') {
        this.form.members.push(this.user.id)
      } else if (!this.options.isNew) { // ensures all members still exist
        this.form.members = await this.$fire.getExistentUsers(this.form.members)
      }
    },
    async onDelete () {
      if (!confirm(`Press OK if you are sure you want to delete the project ${this.options.project.name}. All users will lose access to this project.`)) return

      try {
        await this.$firestore.doc(`projects/${this.options.project.id}`).delete()
        this.$toast('Project deleted.')
        this.$modals.hide('edit-project')
        this.options.onSuccess && this.options.onSuccess()
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete project.')
      }
    },
    showUserChooser () {
      this.$modals.show({
        name: 'user-chooser',
        retrievePromise: async () => {
          const users = this.$fire.qs.toArray(await this.$firestore.collection('users').where('org_id', '==', this.org.id).get())
          return users
        },
        onSuccess: users => this.form.members = users.map(u => u.id),
        multiple: true,
        prompt: 'Add or remove members from this project.',
        title: 'Choose Users',
        searchOptions: {field: u => u.first_name + ' ' + u.last_name, by: 'Name'},
        setExisting: (users, that) => {
          const members = this.form.members
          if (!members) return

          that.chosen = users.filter(u => members.includes(u.id))
        },
      })
    },
  },
  mounted () {
    this.$nextTick(this.prefillFields)
    this.getMembers()
  },
}
</script>

<template lang="pug">
  #edit-project-main.modal-main
    .edit-project-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Project
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
            .member-area
              .amount Members: {{form.members.length}}
              .pro-button.minor.edit(
                @click='showUserChooser'
              ) Click to edit
            //pro-select(
              :disabled='!members'
              title='Members'
              v-model='form.members'
              :options='membersOptions'
              :multiple='true'
              )
            
      .action
        .button.cancel(
          @click='$modals.hide("edit-project")'
        ) Cancel
        .button.delete(
          v-if='!options.isNew && options.canDelete'
          @click='onDelete'
        ) Delete
        .button(
          @click='onSave'
        ) Save
</template>

<style lang="sass" scoped>
  #edit-project-main
    .edit-project-container
      .content
        margin-top: 2rem
        .pro-form
          .form-row
            .member-area
              display: grid
              grid-template-columns: max-content auto
              align-items: center
              font-weight: bold
              .edit
                justify-self: right

</style>