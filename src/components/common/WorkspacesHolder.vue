<script>
import {decideFontColor} from '@/global/js/color'
export default {
  name: 'WorkspacesHolder',
  props: {
    project: Object,
  },
  data () {
    return {
      decideFontColor,
    }
  },
  computed: {
    org () {
      return this.$store.state.org
    },
    orderedWorkspaces () {
      if (!this.$dig(this.project, ['workspaces', 'length'])) return []

      return this.$clone(this.project.workspaces).sort((a,b) => {
        const [aSeq, bSeq] = [a,b].map(num => Number.isNaN(Number(num.sequence)) ? 100 : Number(num.sequence))
        return aSeq - bSeq
      })
    },
  },
}
</script>

<template lang="pug">
  #workspaces-holder-main
    .pro-title Workspaces
    .workspaces-holder-container
      router-link.pro-project.card(
        v-for='(ws, idx) in orderedWorkspaces'
        :to='{name: "ProjectWorkspaceView", params: {projectId: project.id, workspaceId: ws.id}}'
        :key='idx'
        :style='{backgroundColor: org.brand_colors.primary, color: decideFontColor(org.brand_colors.primary)}'
      )
        i.material-icons.logo exit_to_app
        .name.pro-title(
          :style='{color: decideFontColor(org.brand_colors.primary)}'
        ) {{ws.type || ws.name}}
</template>

<style lang="sass" scoped>
  #workspaces-holder-main
    .workspaces-holder-container
      display: flex
      flex-wrap: wrap
      grid-template-columns: repeat(4, 1fr)
      column-gap: 2rem
      row-gap: 2rem
      .project
        > i
</style>