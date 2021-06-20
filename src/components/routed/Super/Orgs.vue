<script>
import AddButton from '$common/AddButton'
import ProTable from '$common/ProTable'
export default {
  name: 'SuperAdminOrgs',
  components: {
    'add-button': AddButton,
    'pro-table': ProTable,
  },
  data () {
    return {
      orgs: [],
      cells: [{
        name: 'Name',
        sortFunc: (a,b) => a.name.localeCompare(b.name),
        getInfo: org => org.name,
      },{
        name: 'Studio Name',
        sortFunc: (a,b) => a.studio_name.localeCompare(b.studio_name),
        getInfo: org => org.studio_name,
      },{
        name: 'Refresh Counts',
        getInfo: org => '<i class="material-icons" style="font-size:18px">refresh</i>',
        onClick: async org => {
          this.$toast('Refreshing...')
          try {
            await this.$HTTP({
              method: 'get',
              uri: `counts/${org.id}/refresh`
            })
            this.$toast('Done!')
          } catch (err) {
            console.error(err)
            this.$toast('Could not refresh')
          }
        }
      },{
        name: 'Edit Org',
        getInfo: org => '<i class="material-icons" style="font-size:18px">edit</i>',
        onClick: org => this.$modals.show({
          name: 'edit-org',
          org,
          isNew: false,
          onSuccess: () => {
            this.$modals.hide('edit-org')
            this.getOrgs()
          }
        })
      },{
        name: 'Invite User',
        getInfo: org => '<i class="material-icons" style="font-size:18px">person_add_alt</i>',
        onClick: org => this.$modals.show({
          name: 'invite-user',
          org,
        })
      },{
        name: 'Go to org',
        getInfo: org => '<i class="material-icons" style="font-size:18px">login</i>',
        onClick: org => {
          this.$modals.show({
            name: 'user-chooser',
            retrievePromise: async () => this.$fire.qs
              .toArray(await this.$firestore.collection('users').where('org_id', '==', org.id).get())
              .sort((a, b) => a.role === 'ADMIN' ? -1 : 1),
            prompt: `Choose a user from ${org.name} to continue as. 
              If you choose an ADMIN, you will be directed to the 
              org page while choosing a MEMBER will direct you to that
              user's dashboard.`,
            onSuccess: user => {
              this.$cookies.set('invanti-as-user', user.id)
              this.$store.commit('update', {user})
              if (user.role === 'ADMIN') {
                this.$router.push({name: 'Admin', params: {orgId: org.id}})
              } else if (user.role === 'MEMBER') {
                this.$router.push({name: 'Member', params: {userId: user.id}})
              }
            },
          })
        },
      }]
    }
  },
  methods: {
    async getOrgs () {
      this.orgs = this.$fire.qs.toArray(await this.$firestore.collection('orgs').get())
    },
    openEditOrg () {
      this.$modals.show({
        name: 'edit-org',
        isNew: true,
        hardClose: true,
        onSuccess: this.getOrgs,
      })
    },
  },
  mounted () {
    this.getOrgs()
  },
}
</script>

<template lang="pug">
  #super-admin-orgs-main.admin-main
    .super-admin-orgs-container.admin-container
      .header
        .pro-title Organizations
          add-button(
            :onClick='openEditOrg'
          )
      .content
        pro-table(
          :entities='orgs'
          :cells='cells'
        )

</template>

<style lang="sass" scoped>
  #super-admin-orgs-main.admin-main
    .super-admin-orgs-container.admin-container
      .content
        margin-top: 2rem
</style>