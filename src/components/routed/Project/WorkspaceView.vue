<script>
export default {
  name: 'WorkspaceView',
  computed: {
    workspace () {
      return this.$store.state.workspace
    },
    project () {
      return this.$store.state.project
    },
  },
  methods: {
    onShare (event) {
      const shareLink = `https://miro.com/app/board/${this.workspace.id}/`
      this.$copyToClipboard(shareLink)
      this.$toast({
        copy: 'Copied!',
        beneathTarget: event.target,
      })
    },
  },
}
</script>

<template lang="pug">
  #workspace-view-main.project-main.member-main
    .workspace-view-container.project-container.member-container
      .header
        .copy
          .pro-title {{project.name}}
          .workspace {{workspace.type}} Workspace
        .action
          .pro-button.major(
            @click='onShare'
          ) Copy Share Link
          a.pro-button.minor(
            href='https://miro.com/app/board/o9J_lUtvKNc=/'
            target='_blank'
          ) Example Workspace
      .content
        .embed-holder
          iframe(
            :src='`https://miro.com/app/live-embed/${workspace.id}/?moveToViewport=${workspace.start_view_coordinates}`'
            width='100%'
            height='100%'
            frameborder='0'
            scrolling='no'
            :allowfullscreen='true'
          )
</template>

<style lang="sass" scoped>
  #workspace-view-main
    .workspace-view-container
      height: 100%
      display: block !important
      max-width: unset !important
      .header
        display: grid
        grid-template-columns: max-content auto
        align-items: center
        margin-bottom: 2rem
        .copy
          .pro-title
            margin-bottom: .25rem
        .action
          margin-bottom: 1rem
          display: flex
          justify-items: end
          justify-self: end
          .pro-button
            margin-left: 1rem
      .content
        height: 100%
        .embed-holder
          height: 100vh
          border: thin solid $lightgrey

</style>