<script>
import Entities from '$common/Entities'
export default {
  name: 'Tags',
  components: {
    'entities': Entities,
  },
  props: {
    retrievePromise: Function,
    title: String,
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    trueUser () {
      return this.$store.state.trueUser
    },
  },
  methods: {
    showEditTag (options) {
      this.$modals.show({
        name: 'edit-tag',
        ...options,
        onSuccess: () => this.$proEmit('retrieve-tags'),
      })
    },
  },
}
</script>

<template lang="pug">
  #tags-main
    .tags-container
      entities(
        :retrievePromise='retrievePromise'
        :showEditEntity='showEditTag'
        :title='title || "My Tags"'
        refreshString='retrieve-tags'
        v-slot='{entities}'
      )
        .tag(
          v-for='tag in entities'
        )
          .name {{tag.name}}
          .icon(
            v-if='["SUPER_ADMIN",].includes(trueUser.role) || (trueUser.id === tag.created_by)'
          )
            i.material-icons(
              @click='() => showEditTag({tag})'
            ) edit
            
</template>

<style lang="sass">
  #tags-main
    .tags-container
      position: relative
      .tag
        display: grid
        grid-template-columns: 1fr 1fr
        align-items: center
        column-gap: 1rem
        padding: 1rem 1.5rem
        border-radius: .25rem
        transition: background-color .1s
        user-select: none
        .name-date
          .date
            font-size: 12px
            margin-top: .5rem
            color: #888
        .icon
          width: 1rem
          height: 1rem
          position: relative
          cursor: pointer
          justify-self: end
          > img
            height: 100%
          > i
            font-size: 20px
            height: 20px
            align-self: center
            position: absolute
            top: 50%
            transform: translateY(-50%)


</style>