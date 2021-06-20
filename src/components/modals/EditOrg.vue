<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
export default {
  name: 'EditOrg',
  components: {
    'pro-input': ProInput,
    'pro-select': ProSelect,
  },
  props: {
    options: Object,
  },
  watch: {
    'form.name' (newName) {
      this.form.studio_name = `${newName} Studio`
    }
  },
  data () {
    return {
      workspaceTypes: null,
      sprintTypes: null,
      logos: { // store the files to upload temporarily here
        square: null,
        rectangle: null,
      },
      form: {
        name: '',
        studio_name: '',
        circle_id: '',
        circle_subdomain: '',
        default_sprint_types: [],
        workspace_types: [],
        logos: {
          square: '',
          rectangle: '',
        },
        brand_colors: {
          primary: '',
          secondary: '',
        },
      },
      formOptions: {
        name: {
          title: 'Organization Name',
          errorIf: val => val && (val.length < 50) ? '' : 'Organization name must have between 1 and 50 characters',
        },
        studio_name: {
          title: 'Studio Name',
          errorIf: val => val && (val.length < 50) ? '' : 'Studio name must have between 1 and 50 characters',
        },
        circle_id: {
          title: 'Circle ID',
          errorIf: val => val ? '' : 'Studio must have associated Circle ID',
        },
        circle_subdomain: {
          title: 'Circle Subdomain',
          errorIf: val => val ? '' : 'Studio must have associated Circle Subdomain',
        },
        default_sprint_types: {
          errorIf: val => val && val.length ? '' : 'Select at least one sprint type.',
          findIndexFunc: (option, choices) => choices.findIndex(choice => choice.name === option.name),
        },
        workspace_types: {
          errorIf: val => val && val.length ? '' : 'Select at least one workspace type.',
        },
        'logos.square': {
          errorIf: _ => !this.options.isNew || this.logos.square ? '' : 'Please choose square logo.',
        },
        'logos.rectangle': {
          errorIf: _ => !this.options.isNew || this.logos.rectangle ? '' : 'Please choose rectangular logo.',
        },
        'brand_colors.primary': {
          title: 'Primary Color',
          type: 'color',
        },
        'brand_colors.secondary': {
          title: 'Secondary Color',
          type: 'color',
        }
      },
      orgCollection: this.$firestore.collection('orgs'),
    }
  },
  computed: {
    org () {
      return this.options.org
    },
    user () {
      return this.$store.state.user
    },
    isSuperAdmin () {
      return this.user.role === 'SUPER_ADMIN'
    },
  },
  methods: {
    async onSave () {
      const errors = this.$proErrors()
      if (errors.length) return errors.forEach(err => this.$toast(err))
      
      this.$showLoading()

      let orgId = this.form.id
      if (this.options.isNew) {
        orgId = this.orgCollection.doc().id
      }

      // we only want to upload the images if this is a new org OR if a new photo was chosen
      const imageTypes = ['square', 'rectangle']
      const imageTypesToUpdate = imageTypes.filter(type => this.options.isNew || this.logos[type])

      // these promises do the work of storing the image, retrieving the image url, and placing it on 
      const imagePromises = imageTypesToUpdate.map(type => new Promise(async (resolve, reject) => {
        const file = this.logos[type]
        const extension = this.$fileTypeToExtension(file.type)
        const ref = `/images/byOrg/${orgId}/${type}${extension}`
        const storageRef = this.$storage.ref(ref)
        try {
          await storageRef.put(file)
        } catch (err) {
          reject(err)
        }

        try {
          const downloadURL = await storageRef.getDownloadURL()
          this.form.logos[type] = downloadURL
        } catch (err) {
          reject(err)
        }

        resolve()
      }))

      // first saves images and gets their downloadURLs
      try {
        await Promise.all(imagePromises)
      } catch (err) {
        console.error(err)
        this.$hideLoading()
        return this.$toast({
          copy: 'An error has occurred. Please reload the page and try again.',
          time: 4000,
        })
      }

      // ready the form for saving
      this.form.id = orgId

      // then we save the whole org
      try {
        await this.orgCollection.doc(orgId).set(this.form)
      } catch (err) {
        console.error(err)
        this.$hideLoading()
        return this.$toast({
          copy: 'An error has occurred. Please reload the page and try again.',
          time: 4000,
        })
      }

      this.$hideLoading()
      this.$modals.hide('edit-org')
      this.options.onSuccess && this.options.onSuccess()
      this.$toast('Organization has been saved.')
    },
    async onDeleteOrg () {
      if(!confirm(`Are you sure you want to delete ${this.org.name}?`)) return

      await this.orgCollection.doc(this.org.id).delete()

      this.options.onSuccess && this.options.onSuccess()
    },
    onPhotoUpload (type) {
      this.$chooseFile({
        accept: 'image/x-png,image/gif,image/jpeg',
      }).then(file => {
        this.logos[type] = file
      })
    },
    setExistingData () {
      if (this.options.isNew) return

      this.$nextTick(() => {
        this.form = this.$clone(this.org)
      })
    },
    async getSprintTypes () {
      const settings = (await this.$firestore.doc(`admin/settings`).get()).data() || {}
      const sprintTypes = settings.sprint_types || []
      this.sprintTypes = sprintTypes.map((type, idx) => ({name: type.name, value: type}))
    },
    async getWorkspaceTypes () {
      const workspaceTypes = (await this.$firestore.doc('stats/workspaces').get()).data() || {}
      this.workspaceTypes = Object.keys(workspaceTypes)
        .filter(type => type !== 'Founder') // This is a default for new users and should be an option for project sets
        .map(type => ({name: type, value: type,}))
    },
  },
  async mounted () {
    await this.getSprintTypes()
    await this.getWorkspaceTypes()
    // must be done after for pro-select to show existing options
    this.setExistingData()
  },
}
</script>

<template lang="pug">
  #edit-org-main.modal-main
    .edit-org-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Organization
      .content
        .pro-form
          .form-row
            pro-input(
              v-model='form.name'
              :options='formOptions.name'
            )
          .form-row
            pro-input(
              v-model='form.studio_name'
              :options='formOptions.studio_name'
            )
          .form-row(
            v-if='isSuperAdmin'
          )
            pro-input(
              v-model='form.circle_id'
              :options='formOptions.circle_id'
            )
          .form-row(
            v-if='isSuperAdmin'
          )
            pro-input(
              v-model='form.circle_subdomain'
              :options='formOptions.circle_subdomain'
            )
          .form-row(
            v-if='sprintTypes && isSuperAdmin'
          )
            pro-select(
              v-model='form.default_sprint_types'
              :options='sprintTypes'
              title='Default Sprint Types'
              :multiple='true'
              :findIndexFunc='formOptions.default_sprint_types.findIndexFunc'
            )
          .form-row(
            v-if='workspaceTypes && isSuperAdmin'
          )
            pro-select(
              v-model='form.workspace_types'
              :options='workspaceTypes'
              title='Workspace Types'
              :multiple='true'
            )
          .form-row.small(
            v-if='isSuperAdmin'
          )
            .pro-button.major(
              @click='onPhotoUpload("square")'
            ) Choose Square Logo
            .image-name(
              v-if='logos.square'
            ) Selected: {{logos.square.name}}
          .form-row.small(
            v-if='isSuperAdmin'
          )
            .pro-button.major(
              @click='onPhotoUpload("rectangle")'
            ) Choose Rectangular Logo (3 x 1)
            .image-name(
              v-if='logos.rectangle'
            ) Selected: {{logos.rectangle.name}}
          .title(
            v-if='isSuperAdmin'
          ) Organization Colors (optional)
          .form-row.small.color(
            v-if='isSuperAdmin'
          )
            input(
              type='color'
              v-model='form.brand_colors.primary'
            )
            .title Primary Color
          .form-row.small.color(
            v-if='isSuperAdmin'
          )
            input(
              type='color'
              v-model='form.brand_colors.secondary'
            )
            .title Secondary Color
            
      .action
        .button.cancel(
          @click='$modals.hide("edit-org")'
        ) Cancel
        .button.delete(
          v-if='!options.isNew'
          @click='onDeleteOrg'
        ) Delete
        .button(
          @click='onSave'
        ) Save
</template>

<style lang="sass" scoped>
  #edit-org-main.modal-main
    .edit-org-container.modal-container
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