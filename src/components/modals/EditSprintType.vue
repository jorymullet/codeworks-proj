<script>
import ProInput from '$common/ProInput'
export default {
  name: 'EditSprintType',
  components: {
    'pro-input': ProInput,
  },
  props: {
    options: {
      type: Object,
    }
  },
  data () {
    return {
      form: {
        name: '',
        filter: '',
        num_modules: 8,
      },
      formOptions: {
        name: {
          title: 'Name of sprint type',
          errorIf: val => val && (val.length > 0) && (val.length < 50) ? '' : 'Name length must be between 1 and 50 characters',
        },
        num_modules: {
          title: 'Number of Modules',
          errorIf: val => val > 0 ? '' : 'Enter value greater than 0',
          type: 'number',
        },
        filter: {
          title: 'Projects Filter (developers only)',
          seeIf: () => this.trueUser && (this.trueUser.role === 'SUPER_ADMIN'),
          type: 'textarea',
        },
      },
    }
  },
  computed: {
    trueUser () {
      return this.$store.state.trueUser
    },
  },
  methods: {
    async onSave (isDelete) {
      if (!isDelete) {
        const errors = this.$proErrors()
        if (errors.length) return errors.forEach(e => this.$toast({copy: e}))
      }

      const sprintTypes = this.options.sprintTypes || []
      const idx = this.options.idx
      if (this.options.isNew) {
        sprintTypes.unshift(this.$clone(this.form))
      } else {
        const spliceArgs = [idx, 1]
        if (!isDelete) {
          spliceArgs.push(this.$clone(this.form))
        }
        sprintTypes.splice(...spliceArgs)
      }

      try {
        const current = (await this.$firestore.doc(this.options.dbRef).get()).data() || {}
        current.sprint_types = sprintTypes
        await this.$firestore.doc(this.options.dbRef).set(current)
        this.$modals.hide('edit-sprint-type')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save sprint type.')
      }
    },
    prefillFields () {
      if (this.options.isNew) return

      Object.keys(this.form).forEach(key => {
        this.form[key] = this.options.sprintType[key]
      })
      if (!this.form.num_modules) {
        this.form.num_modules = 8
      }
    },
  },
  mounted () {
    this.$nextTick(this.prefillFields)
  },
}
</script>

<template lang="pug">
  #edit-sprint-type-main.modal-main
    .edit-sprint-type-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Sprint Type
      .content
        .pro-form
          .form-row(
            v-for='(options, key) in formOptions'
          )
            pro-input(
              v-model='form[key]'
              :options='options'
              v-if='!options.seeIf || options.seeIf()'
            )
      .action
        .button.cancel(
          @click='$modals.hide("edit-sprint-type")'
        ) Cancel
        .button.delete(
          v-if='!options.isNew'
          @click='() => onSave(true)'
        ) Delete
        .button(
          @click='() => onSave(false)'
        ) Save
</template>

<style lang="sass" scoped>
  #edit-sprint-type-main
    .edit-sprint-type-container
      .content
        padding-top: 2rem
</style>