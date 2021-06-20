<script>
import * as Papa from 'papaparse'
export default {
  name: 'UploadWorkspaces',
  props: {
    options: Object,
  },
  data () {
    return {
      file: null,
      state: 'user',
    }
  },
  computed: {
    uploadButtonCopy () {
      return {
        user: 'Upload',
        system: 'Loading...',
      }[this.state]
    },
  },
  methods: {
    async complete (results) {
      try {
        const data = results.data
        const header = data.shift()
        const headerStr = ['Board ID', 'Start View Coordinates','Workspace Type','Sequence']
        const headerIdxs = headerStr.map(str => header.indexOf(str))
        const missingHeaders = headerStr.filter((str, idx) => headerIdxs[idx] < 0)

        if (missingHeaders.length) return this.$toast({
          copy: `Header must include the following: ${missingHeaders.join(', ')}`,
          time: 4000,
        })

        const [boardIdIdx, startViewCoordinatesIdx, typeIdx, sequenceIdx] = headerIdxs

        // prevents duplicates
        const workspacesObj = data.reduce((acc, row) => {
          const id = row[boardIdIdx]
          if (acc[id]) return acc

          const newWorkspace = {
            id,
            start_view_coordinates: row[startViewCoordinatesIdx],
            type: row[typeIdx],
            sequence: row[sequenceIdx],
          }
          acc[id] = newWorkspace
          return acc
        }, {})

        const previousWorkspacesRef = this.$firestore.collection('previous_workspaces')
        const duplicatesCheckPromises = Object.values(workspacesObj).map(ws => new Promise(async resolve => {
          const isOld = (await previousWorkspacesRef.doc(ws.id).get()).data()
          if (isOld) {
            delete workspacesObj[ws.id]
          }
          resolve()
        }))

        await Promise.all(duplicatesCheckPromises)

        const workspaces = Object.values(workspacesObj)

        const batchMax = 500
        const batchCount = Math.ceil(workspaces.length / batchMax)
        const batchedWorkspaces = Array(batchCount).fill().reduce((arr, _, idx) => {
          arr.push(workspaces.slice(idx * batchMax, (idx + 1) * batchMax))
          return arr
        }, [])

        const workspacesRef = this.$firestore.collection('workspaces')
        const batches = batchedWorkspaces.map(workspaces => {
          return workspaces.reduce((batch, ws) => batch.set(workspacesRef.doc(ws.id), ws), this.$firestore.batch())
        })

        const previousBatches = batchedWorkspaces.map(workspaces => {
          return workspaces.reduce((batch, ws) => batch.set(previousWorkspacesRef.doc(ws.id), {id: ws.id}), this.$firestore.batch())
        })

        /**
         * The following is responsible to calculating and updating stats
         */

        const newStats = workspaces.reduce((acc, ws) => {
          if (!acc[ws.type]) {
            acc[ws.type] = 0
          }
          acc[ws.type]++
          return acc
        }, {})

        const statsRef = this.$firestore.doc('stats/workspaces')
        const currentStats = (await statsRef.get()).data() || {}

        const stats = Object.keys(newStats).reduce((acc, type) => {
          if (!acc[type]) {
            acc[type] = 0
          }
          acc[type] += newStats[type]
          return acc
        }, currentStats)

        const statsPromise = statsRef.set(stats)

        const commit = batch => batch.commit()
        const promises = [...batches.map(commit), ...previousBatches.map(commit), statsPromise]

        await Promise.all(promises)

        const statsStr = Object.keys(newStats).map(type => `${type}: ${newStats[type]}`).join('\n')
        const newStatsMessage = `The following workspace types were added:\n${statsStr || 'None'}`
        alert(newStatsMessage)
        
        this.options.onSuccess && this.options.onSuccess()
        this.$modals.hide('upload-workspaces')
      } catch (err) {
        console.log(err)
        this.state = 'user'
        this.$toast({
          copy: 'Could not upload file. Make sure file has header and well formed data.'
        })
      }
    },
    error (error) {
      console.error(error)
      this.state = 'user'
      this.$toast({
        copy: 'Could not upload file. Please check to see if file is malformed and then try to upload again.',
        time: 4000,
      })
    },
    upload () {
      if (this.state === 'system') return this.$toast('Already uploadin...')
      if (!this.file) return this.$toast('Choose file to upload.')

      this.state = 'system'

      Papa.parse(this.file, {
        complete: this.complete,
        error: this.error,
      })
    },
    async onFileChoose () {
      this.file = await this.$chooseFile({accept: '.csv'})
    },
  },
}
</script>

<template lang="pug">
  #upload-workspaces-main.modal-main
    .upload-workspaces-container.modal-container
      .title Upload Workspaces
      .content
        .pro-button.major(
          @click='onFileChoose'
        ) Choose File
        .name(
          v-if='file'
        ) {{file.name}}
      .action
        .button.cancel(
          @click='$modals.hide("upload-workspaces")'
          v-if='state !== "system"'
        ) Cancel
        .button.major(
          @click='upload'
        ) {{uploadButtonCopy}}
</template>

<style lang="sass" scoped>
  #upload-workspaces-main
    .upload-workspaces-container
      .content
        .name
          margin: 1rem 0
</style>