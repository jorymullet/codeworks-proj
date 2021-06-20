<script>
import resourceTypes from '@/global/js/resource-types.json'
import * as manager from '@/global/js/entity-manager'
import Entities from '$common/Entities'
export default {
  name: 'ResearchRecap',
  components: {
    'entities': Entities,
  },
  props: {
    headerButtons: Array,
  },
  data() {
    return {
      resourceTypes,
      manager,
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
    retrievePromise () {
      return new Promise(async resolve => {
        const baseQuery = coll => this.$firestore
          .collection(coll)
          .where('org_id', '==', this.org.id)
          .where('created_by', '==', this.user.id)
          .limit(1)


        const conversationPromise = baseQuery('conversations')
          .orderBy('created_at', 'desc')
          .get()

        const resourcePromise = baseQuery('resources')
          .where('is_studio_resource', '!=', true)
          .orderBy('is_studio_resource', 'desc')
          .orderBy('created_at', 'desc')
          .get()

        const [conversation, resource] = (await Promise.all([conversationPromise, resourcePromise])).map(ss => {
          return ss.empty ? null : ss.docs[0].data()
        })

        resolve([conversation, resource])
      })
    },
    async onEntityClick (entity, isConvo) {
      const viewOptions = await manager[isConvo ? "conversations" : "resources"].getViewOptions(entity)

      const trueUser = this.$store.state.trueUser
      const shouldShowEditButton = (entity.created_by === this.$auth.currentUser.uid)
        || ((trueUser.role === 'ADMIN') && (trueUser.org_id === this.$store.state.user.org_id))
        || (trueUser.role === 'SUPER_ADMIN')

      const editOptions = {
        name: isConvo ? 'edit-conversation' : 'edit-resource',
        onSuccess: () => this.$proEmit('retrieve-research-recap'),
        hardClose: true,
      }

      if (isConvo) {
        editOptions.conversation = entity
      } else {
        editOptions.resource = entity
      }

      viewOptions.onEdit = shouldShowEditButton ? () => {
        this.$modals.hide('view-entity')
        this.$modals.show(editOptions)
      } : false
      
      this.$modals.show(viewOptions)
    },
  },
}
</script>

<template lang="pug">
  #research-recap-main
    .research-recap-container
      entities(
        :retrievePromise='retrievePromise'
        title='Recent Research'
        refreshString='retrieve-research-recap'
        v-slot='{entities}'
        :noAdd='true'
        :headerButtons='headerButtons'
      )
        .entity.italic.no-interact(
          v-if='!entities.find(Boolean)'
        ) 
          i.material-icons blocked
          .copy None found
        .research-recap-holder(
          v-else
        )
          .entity.card(
            v-for='(entity, idx) in entities'
            v-if='entity'
            @click='() => onEntityClick(entity, !idx)'
          )
            .icon
              i.material-icons {{idx ? (resourceTypes[entity.type] ? resourceTypes[entity.type].icon : 'person') : 'record_voice_over'}}
            .details
              .date {{$buildDate(entity.created_at, '{month}/{date}/{year}')}}
              .summary.dotdotdot {{entity.with_whom || entity.title}}
</template>

<style lang="sass">
  #research-recap-main
    .research-recap-container
      position: relative
      .view-all
        position: absolute
        right: 1rem
        top: 1rem
      .content
        overflow: scroll
      .entities-holder
        height: unset
        .research-recap-holder
          display: grid
          width: 100%
          grid-template-columns: 1fr 1fr
          padding: 1rem
          column-gap: 1rem
          .entity
            display: grid
            grid-template-columns: min-content auto
            column-gap: 1rem
            cursor: pointer
            padding: .5rem 1rem
            border-radius: .25rem
            transition: background-color .1s
            align-items: center
            padding: 1rem
            &.no-ineract
              padding: 0
              width: fit-content
            &:hover
              background-color: $grey
            .icon
              position: relative
              > img
                height: 100%
              > i
                font-size: 28px
            .details
              display: grid
              color: grey
              justify-items: right
              .date
                font-size: 12px
                margin-bottom: .25rem
              .summary
                width: 100%
                text-align: right



</style>