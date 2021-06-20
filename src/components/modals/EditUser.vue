<script>
import ProInput from '$common/ProInput'
export default {
  name: 'EditUser',
  components: {
    'pro-input': ProInput,
  },
  props: {
    options: Object,
  },
  data () {
    return {
      form: {
        first_name: '',
        last_name: '',
        email: '',
      },
      formOptions: {
        first_name: {
          title: 'First Name',
          errorIf: val => val ? '' : 'Input first name',
        },
        last_name: {
          title: 'Last Name',
          errorIf: val => val ? '' : 'Input last name',
        },
        email: {
          title: 'Email',
          disabled: true,
        },
      },
    }
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(err => this.$toast(err))

      this.$showLoading()

      try {
        await this.$firestore.doc(`users/${this.form.id}`).update(this.form)
        const success = this.options.onSuccess
        success && success()
        this.$modals.hide('edit-user')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save user.')
      } finally {
        this.$hideLoading()
      }
    },
    setExistingData () {
      this.$nextTick(() => {
        this.form = this.$clone(this.options.user)
      })
    },
  },
  mounted () {
    this.setExistingData()
  },
}
</script>

<template lang="pug">
  #edit-user-main.modal-main
    .edit-user-container.modal-container
      .title Edit User
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
          @click='$modals.hide("edit-user")'
        ) Cancel
        .button(
          @click='onSave'
        ) Save
</template>

<style lang="sass" scoped>
  #edit-user-main.modal-main
    .edit-user-container.modal-container
      .content
        .pro-form
          margin-top: 1rem
          .form-row
            &.color
              display: flex
              align-items: center
              > input
                margin-right: 1rem
            .image-name
              margin: .5rem 0

</style>