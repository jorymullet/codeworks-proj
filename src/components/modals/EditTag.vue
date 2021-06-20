<script>
import ProInput from '$common/ProInput'
export default {
  name: 'EditTag',
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
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(e => this.$toast({copy: e}))

      this.$showLoading()

      const tagsRef = this.$firestore.collection('tags')
      const uid = this.user.id
      const now = Date.now()

      let tag
      if (this.options.isNew) {

        const newFields = {
          id: tagsRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          org_id: this.org.id,
        }

        tag = {
          ...this.form,
          ...newFields,
        }
      } else {
        tag = {
          ...this.options.tag,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      try {
        await tagsRef.doc(tag.id).set(tag)
        this.options.onSuccess && this.options.onSuccess(tag)
        this.$modals.hide('edit-tag')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save tag.')
      } finally {
        this.$hideLoading()
      }
    },
    prefillFields () {
      if (this.options.isNew) return

      Object.keys(this.form).forEach(key => {
        this.form[key] = this.$clone(this.options.tag[key]) // had to use $clone since it was updating members during editing
      })
    },
    async onDelete () {
      if (!confirm(`Press OK if you are sure you want to delete the tag ${this.options.tag.name}. All users will lose access to this tag.`)) return

      try {
        await this.$firestore.doc(`tags/${this.options.tag.id}`).delete()
        this.$toast('Tag deleted.')
        this.$modals.hide('edit-tag')
        this.options.onSuccess && this.options.onSuccess()
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete tag.')
      }
    },
  },
  mounted () {
    this.$nextTick(this.prefillFields)
  },
}
</script>

<template lang="pug">
  #edit-tag-main.modal-main
    .edit-tag-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Tag
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
          @click='$modals.hide("edit-tag")'
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
  #edit-tag-main
    .edit-tag-container
      .content
        margin-top: 2rem
</style>