<script>
import AddButton from '$common/AddButton'
import ProTable from '$common/ProTable'
export default {
  name: 'SuperAdminWorkspace',
  components: {
    'add-button': AddButton,
    'pro-table': ProTable,
  },
  data () {
    return {
      stats: [],
      cells: [{
        name: 'Type',
        sortFunc: (a,b) => a.type.localeCompare(b.type),
        getInfo: stat => stat.type,
      },{
        name: 'Count',
        sortFunc: (a,b) => a.count - b.count,
        getInfo: stat => stat.count,
      }]
    }
  },
  methods: {
    async getWorkspaceStats () {
      const stats = (await this.$firestore.doc('stats/workspaces').get()).data() || {}
      this.stats = Object.keys(stats).map(type => ({type, count: stats[type]}))
    },
    openUploadWorkspaces () {
      this.$modals.show({
        name: 'upload-workspaces',
        hardClose: true,
        onSuccess: this.getWorkspaceStats,
      })
    },
    async refreshCounts () {
      if (!confirm('Are you sure? This is potentially a heavy lift if there are 1000\'s of workspaces.')) return
      this.$showLoading()
      try {
        const workspaces = this.$fire.qs.toArray(await this.$firestore.collection('workspaces').get())
        const stats = workspaces.reduce((acc, ws) => {
          if (!(acc[ws.type])) {
            acc[ws.type] = 0
          }
          acc[ws.type]++
          return acc
        }, {})

        await this.$firestore.doc('stats/workspaces').set(stats)
        this.getWorkspaceStats()
      } catch (err) {
        console.error(err)
      } finally {
        this.$hideLoading()
      }
    },
  },
  mounted () {
    this.getWorkspaceStats()
  },
}
</script>

<template lang="pug">
  #super-admin-workspaces-main.admin-main
    .super-admin-workspaces-container.admin-container
      .header
        .pro-title Available Workspaces
          add-button(
            :onClick='openUploadWorkspaces'
          )
        .instruction The counts are only accurate if no duplicate workspaces have been uploaded. If you would like a recount of the workspace types, click 
          span.refresh(
            @click='refreshCounts'
          ) here
          | .
      .content(
        v-if='stats'
      )
        pro-table(
          :entities='stats'
          :cells='cells'
        )

</template>

<style lang="sass" scoped>
  #super-admin-workspaces-main.admin-main
    .super-admin-workspaces-container.admin-container
      .header
        .instruction
          .refresh
            color: $mild-blue
            cursor: pointer
      .content
        margin-top: 2rem
</style>