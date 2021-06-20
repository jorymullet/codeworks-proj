<script>
import Entities from '$common/Entities'
import * as manager from '@/global/js/entity-manager'
export default {
  name: 'Conversations',
  components: {
    'entities': Entities,
  },
  props: {
    retrievePromise: Function,
    filters: Array,
    preassociatedProjects: Array,
    searchOptions: Object,
    dropdowns: Array,
    headerButtons: Array,
  },
  methods: {
    showEditConversation () {
      this.$modals.show({
        name: 'edit-conversation',
        isNew: true,
        onSuccess: () => this.$proEmit('retrieve-conversations'),
        preassociatedProjects: this.preassociatedProjects,
        hardClose: true,
      })
    },
    async showViewConversation (conversation) {
      const viewOptions = await manager.conversations.getViewOptions(conversation)
      this.$modals.show(viewOptions)
    },
  },
}
</script>

<template lang="pug">
  #conversations-main
    .conversations-container
      entities(
        :retrievePromise='retrievePromise'
        :filters='filters'
        :dropdowns='dropdowns'
        :showEditEntity='showEditConversation'
        title='Conversations'
        refreshString='retrieve-conversations'
        v-slot='{entities}'
        :searchOptions='searchOptions'
        :headerButtons='headerButtons'
      )
        .conversation(
          v-for='conversation in entities'
          @click='() => showViewConversation(conversation)'
        )
          .name.dotdotdot {{conversation.with_whom}}
          .topic.dotdotdot {{conversation.topic}}
          .date {{$buildDate(conversation.created_at, '{month}/{date}/{year}', {to2: true})}}
      
</template>

<style lang="sass" >
  #conversations-main
    .conversations-container
      .conversation
        display: grid
        grid-template-columns: 1fr 2fr min-content
        align-items: center
        column-gap: 1rem
        cursor: pointer
        padding: 1rem
        border-radius: .25rem
        transition: background-color .1s
        &.no-interact
          cursor: default
          grid-template-columns: min-content auto
          &:hover
            background-color: transparent
        &:hover
          background-color: $grey
        .icon
          width: 1rem
          height: 2rem
          position: relative
          > img
            height: 100%
          > i
            font-size: 18px
            height: 18px
            align-self: center
            position: absolute
            top: 50%
            transform: translateY(-50%)


</style>