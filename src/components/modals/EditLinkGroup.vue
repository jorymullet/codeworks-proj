<script>
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
export default {
  name: 'EditLinkGroup',
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
        links: [],
      },
      formOptions: {
        name: {
          title: 'Name',
          errorIf: val => val && (val.length > 0) && (val.length < 50) ? '' : `Name must be between ${val && val.length ? 'shorter' : 'longer'}`,
        },
        members: {
          errorIf: members => members.length ? '' : 'Choose members to assign links',
        },
        links: {
          errorIf: links => links.length && links.every(link => link.title && this.$regex.is(link.url).a('url')) ? '' : 'Ensure all links have names and valid url (starting with http)',
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

      const linkGroupsRef = this.$firestore.collection('link_groups')
      const uid = this.$auth.currentUser.uid
      const now = Date.now()

      let linkGroup
      if (this.options.isNew) {
         
        const orgId = this.$store.state.org.id

        const newFields = {
          id: linkGroupsRef.doc().id,
          created_at: now,
          created_by: uid,
          updated_at: now,
          updated_by: uid,
          org_id: orgId,
        }

        linkGroup = {
          ...this.form,
          ...newFields,
        }
      } else {
        linkGroup = {
          ...this.options.linkGroup,
          ...this.form,
          updated_at: now,
          updated_by: uid,
        }
      }

      try {
        await linkGroupsRef.doc(linkGroup.id).set(linkGroup)
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-link-group')
      } catch (err) {
        console.error(err)
        this.$toast('Could not save link group.')
      } finally {
        this.$hideLoading()
      }
    },
    prefillFields () {
      if (this.options.isNew) {
        this.form.links.push({
          title: '',
          url: '',
        })
      } else {
        Object.keys(this.form).forEach(key => {
          this.form[key] = this.$clone(this.options.linkGroup[key])
        })
      }
    },
    async getMembers () {
      this.members = this.$fire.qs
        .toArray(await this.$firestore.collection('users').where('org_id', '==', this.org.id).get())

      if (!this.options.isNew) { // ensures all members still exist
        this.form.members = await this.$fire.getExistentUsers(this.form.members)
      }
    },
    async onDelete () {
      if (!confirm(`Press OK if you are sure you want to delete the link group ${this.options.linkGroup.name}. All users will lose access to this link group.`)) return

      try {
        await this.$firestore.doc(`link_groups/${this.options.linkGroup.id}`).delete()
        this.$toast('Link group deleted.')
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('edit-link-group')
      } catch (err) {
        console.error(err)
        this.$toast('Could not delete link group.')
      }
    },
  },
  mounted () {
    this.$nextTick(this.prefillFields)
    this.getMembers()
  },
}
</script>

<template lang="pug">
  #edit-link-group-main.modal-main
    .edit-link-group-container.modal-container
      .title {{options.isNew ? 'Create' : 'Edit'}} Link Group
      .content
        .pro-form
          .form-row
            pro-input(
              v-model='form.name'
              :options='formOptions.name'
            )
          .form-row
            pro-select(
              :disabled='!members'
              title='Members'
              v-model='form.members'
              :options='membersOptions'
              :multiple='true'
            )
          .form-row(
            v-for='(link, idx) in form.links'
          )
            .link.card
              i.material-icons(
                @click='form.links.splice(idx, 1)'
              ) delete_outline
              pro-input.name(
                :options='{title: "Name of link"}'
                v-model='form.links[idx].title'
              )
              pro-input.url(
                :options='{title: "URL"}'
                v-model='form.links[idx].url'
              )
          .form-row
            i.material-icons.add(
              @click='form.links.push({title: "", url: ""})'
            ) add_circle_outline
            
      .action
        .button.cancel(
          @click='$modals.hide("edit-link-group")'
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
  #edit-link-group-main
    .edit-link-group-container
      .content
        margin-top: 2rem
        .pro-form
          .form-row
            .add
              justify-self: end
              cursor: pointer
              color: $orange
            .link
              padding: 2rem 1.5rem
              border-radius: .5rem
              position: relative
              > i
                position: absolute
                right: .5rem
                top: .5rem
                cursor: pointer
                font-size: 18px
              .name
                margin-bottom: 1.75rem
</style>