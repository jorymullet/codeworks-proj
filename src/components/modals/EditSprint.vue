<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
export default {
  name: 'EditSprint',
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
      sprintTypes: null,
      paceOptions: [{
        name: 'Weekly',
        value: 7,
      }, {
        name: 'Biweekly (14 days)',
        value: 14,
      }, {
        name: 'Monthly',
        value: 28,
      }],
      form: {
        name: '',
        type: null,
        start_date: '',
        pace: '',
      },
      formOptions: {
        name: {
          title: 'Name of sprint',
          errorIf: val => val ? '' : 'Name this sprint',
        },
        type: {
          errorIf: val => val ? '' : 'Choose sprint type',
        },
        start_date: {
          title: 'Start date',
          errorIf: val => val ? '' : 'Choose start date',
          type: 'date'
        },
        pace: {
          title: 'Pace',
          errorIf: val => val ? '' : 'Choose pace',
        }
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
    sprintTypesOptions () {
      if (!(this.sprintTypes && this.sprintTypes.length)) return []

      return this.sprintTypes.map(type => ({name: type.name, value: type,}))
    },
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast({copy: e}))

      this.$showLoading()

      const sprintsRef = this.$firestore.collection('sprints')
      const uid = this.user.id
      const now = Date.now()

      let sprint
      if (this.options.isNew) {
        const newFields = {
          id: sprintsRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          org_id: this.$store.state.org.id,
        }
        sprint = {
          ...this.form,
          ...newFields,
        }

        // -- We get to create a cirlce space an then return the information back to here.
        try {
          const {body} = await this.$HTTP({
            method: 'post',
            uri: 'sprints/circle-space',
            body: sprint,
          })
          if (!(body && body.space_id && body.space_url)) {
            console.error(body)
            return this.$toast('Did not receive space id or space url after creating cirlce space.')
          }
          sprint = {
            ...body,
            ...sprint,
          }
        } catch (err) {
          console.error(err)
          let message = 'Could not create Circle Space.'
          if (err && err.body && err.body.message) {
            message = err.body.message
          }
          this.$hideLoading()
          return this.$toast(message)
        }
      } else {
        sprint = {
          ...this.options.sprint,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      try {
        await sprintsRef.doc(sprint.id).set(sprint)
        this.$toast('Saved sprint')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-sprint')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save sprint.')
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
          this.form[key] = this.$clone(this.options.sprint[key]) // had to use $clone since it was updating members during editing
        })
      }
    },
    async onDelete () {
      const sprint = this.options.sprint
      if (!confirm(`Press OK if you are sure you want to delete the sprint ${sprint.name}.`)) return
      this.$showLoading()

      try {
        await this.$HTTP({
          method: 'delete',
          uri: `sprints/${sprint.id}/circle-space`,
        })
        await this.$firestore.doc(`sprints/${sprint.id}`).delete()
        this.$toast('Sprint deleted.')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-sprint')
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete sprint.')
      } finally {
        this.$hideLoading()
      }
    },
    getSprintTypes () {
      const orgTypes = this.org.sprint_types || []
      const defaultTypes = this.org.default_sprint_types || []
      this.sprintTypes = [...orgTypes, ...defaultTypes]
    },
    sprintTypeIndexFunc (option, choices) {
      if (!(option && choices && choices.length)) return -1
      return choices.findIndex(choice => choice.name === option.name)
    },
  },
  mounted () {
    this.getSprintTypes()
    this.$nextTick(this.prefillFields)
  },
}
</script>

<template lang="pug">
  #edit-sprint-main.modal-main
    .edit-sprint-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Sprint
      .content
        .pro-form
          .form-row
            pro-input(
              v-model='form.name'
              :options='formOptions.name'
            )
          .form-row
            pro-select(
              :disabled='!sprintTypes'
              title='Sprint Type'
              v-model='form.type'
              :options='sprintTypesOptions'
              :findIndexFunc='sprintTypeIndexFunc'
            )
          .form-row
            pro-input(
              v-model='form.start_date'
              :options='formOptions.start_date'
            )
          .form-row
            pro-select(
              title='Sprint Pace'
              v-model='form.pace'
              :options='paceOptions'
            )
            
      .action
        .button.cancel(
          @click='$modals.hide("edit-sprint")'
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
  #edit-sprint-main
    .edit-sprint-container
      .content
        margin-top: 2rem
</style>