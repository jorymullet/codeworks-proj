<script>
import ProInput from '$common/ProInput'
export default {
  name: 'EditLink',
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
        title: '',
        url: '',
      },
      formOptions: {
        title: {
          title: 'Title',
          errorIf: val => val && (val.length > 0) && (val.length < 50) ? '' : 'Title length must be between 1 and 50 characters',
        },
        url: {
          title: 'URL',
          errorIf: val => this.$regex.is(val).a('fullUrl') ? '' : 'Input valid URL (must start with http or https)',
        },
      },
    }
  },
  methods: {
    async onSave (isDelete) {
      if (!isDelete) {
        const errors = this.$proErrors()
        if (errors.length) return errors.forEach(e => this.$toast({copy: e}))
      }

      const links = this.options.links || []
      const idx = this.options.idx
      if (this.options.isNew) {
        links.unshift(this.$clone(this.form))
      } else {
        const spliceArgs = [idx, 1]
        if (!isDelete) {
          spliceArgs.push(this.$clone(this.form))
        }
        links.splice(...spliceArgs)
      }

      try {
        await this.$firestore.doc(this.options.dbRef).update({links})
        this.$store.commit(this.options.refresh)
        this.$modals.hide('edit-link')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save link.')
      }
    },
    prefillFields () {
      if (this.options.isNew) return

      Object.keys(this.form).forEach(key => {
        this.form[key] = this.options.link[key]
      })
    },
  },
  mounted () {
    this.$nextTick(this.prefillFields)
  },
}
</script>

<template lang="pug">
  #edit-link-main.modal-main
    .edit-link-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Link
      .content
        .pro-form
          .form-row(
            v-for='(options, key) in formOptions'
          )
            pro-input(
              v-model='form[key]'
              :options='options'
            )
      .action
        .button.cancel(
          @click='$modals.hide("edit-link")'
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
  #edit-link-main
    .edit-link-container
      .content
        margin-top: 1rem
</style>