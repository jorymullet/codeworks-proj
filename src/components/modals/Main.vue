<script>
import Alert from './Alert'
import CardInput from './CardInput'
import DatePicker from './DatePicker'
import EditOrg from './EditOrg'
import EditUser from './EditUser'
import InviteUser from './InviteUser'
import EditLink from './EditLink'
import EditSprint from './EditSprint'
import EditSprintType from './EditSprintType'
import EditProject from './EditProject'
import EditTag from './EditTag'
import EditLinkGroup from './EditLinkGroup'
import EditResource from './EditResource'
import EditConversation from './EditConversation'
import EditProgress from './EditProgress'
import ViewEntity from './ViewEntity'
import UploadWorkspaces from './UploadWorkspaces'
import JoinSprint from './JoinSprint'
import SprintInvite from './SprintInvite'
import UserChooser from './UserChooser'
import CreateInviteLink from './CreateInviteLink'
export default {
  name: 'ModalsMain',
  components: {
    'alert': Alert,
    'card-input': CardInput,
    'date-picker': DatePicker,
    'edit-org': EditOrg,
    'edit-user': EditUser,
    'invite-user': InviteUser,
    'edit-link': EditLink,
    'edit-sprint': EditSprint,
    'edit-sprint-type': EditSprintType,
    'edit-project': EditProject,
    'edit-tag': EditTag,
    'edit-link-group': EditLinkGroup,
    'edit-resource': EditResource,
    'edit-progress': EditProgress,
    'edit-conversation': EditConversation,
    'view-entity': ViewEntity,
    'upload-workspaces': UploadWorkspaces,
    'join-sprint': JoinSprint,
    'sprint-invite': SprintInvite,
    'user-chooser': UserChooser,
    'create-invite-link': CreateInviteLink,
  },
  data () {
    return {
      modalsOptions: {},
      keys: {},
    }
  },
  computed: {
    seeModals () {
      return Object.keys(this.modalsOptions).length
    },
    componentsList () {
      return Object.keys(this.$options.components).filter(comp => !['ModalsMain',].includes(comp))
    },
  },
  methods: {
    shouldIncludeComp (comp) {
      return Object.keys(this.modalsOptions).includes(comp)
    },
    setUpListeners () {
      this.$proOn('showModal', options => {
        if (options && this.componentsList.includes(options.name)) {
          this.modalsOptions[options.name] = options
          this.$forceUpdate()
        } else {
          alert(`Could not find and show the following modal: ${options && options.name}`)
        }
      })
      this.$proOn('hideModal', modalName => {
        // hides all modals if no modal name is declared
        if (!modalName) {
          this.modalsOptions = {}
        } else {
          delete this.modalsOptions[modalName]
        }
        this.$forceUpdate()
      })
      // document.addEventListener('keydown', this.keyListener, true)
      // document.addEventListener('keyup', this.keyListener, true)
    },
    onContainerClick (comp) {
      if (this.modalsOptions[comp].hardClose) return
      
      this.$modals.hide(comp)
    },
    keyListener (e) {
      if (e.type === 'keydown') {
        this.keys[e.key] = Date.now()
        if (this.keys.Meta < this.keys.s) {
          e.preventDefault()
          this.$modals.show({
            name: 'super-admin',
          })
        }
      } else if (e.type === 'keyup') {
        delete this.keys[e.key]
      }
    },
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.keyListener, true)
    document.removeEventListener('keyup', this.keyListener, true)
  },
  mounted () {
    this.setUpListeners()
  },
}
</script>

<template lang="pug">
  span
    transition(
      name='fade'
    )
      .modals-main(
        v-if='Object.keys(this.modalsOptions).length'
      )
        .modals-container(
          v-for='(comp, idx) in componentsList'
          v-if='shouldIncludeComp(comp)'
          @click='onContainerClick(comp)'
          :style='modalsOptions[comp].zIndex ? {"z-index": modalsOptions[comp].zIndex} : {}'
          )
            span(
              @click.stop=''
            )
              component(
                :is='comp'
                :options='modalsOptions[comp]'
                )
</template>

<style lang="sass">
  @import '$styles/transitions.sass'
  @import '$styles/form.sass'
  .modals-main
    height: 100vh
    width: 100vw
    position: fixed
    z-index: $modals-index
    .modals-container
      height: 100%
      width: 100%
      background-color: transparentize(grey, .5)
      position: absolute
      > span
        > .modal-main
          background-color: white
          position: absolute
          left: 50%
          top: 50%
          transform: translateY(-50%) translateX(-50%)
          height: auto
          max-height: 100vh
          width: 320px
          border-radius: 10px
          box-shadow: 0 0 1rem 0 transparentize(black, .9)
          overflow-y: scroll
          > .modal-container
            > *
              padding: 1rem
            > .title
              @extend .font-1-bold
              font-size: 20px
              color: white
              background-color: $orange
            > .content
              padding: 24px
              max-height: calc(100vh - 232px)
              overflow-y: scroll
              .description
                font-size: 14px
                margin-bottom: 32px
              .content-title
                font-size: 1.6em
              .input-field
                margin-top: 5px
                $input-font-size: .9em
                > input
                  margin-bottom: 8px
                  height: 2.6rem
                label
                  &.active
                    transform: translateY(-8px) scale(0.8)
            > .action
              //background-color: $orange
              //border-top: thin $orange solid
              color: white
              display: flex
              > .button
                @extend .pro-button
                border-sizing: border-box
                padding: 8px 24px
                background-color: $orange
                color: white
                text-align: center
                cursor: pointer
                border: none
                transition: all .25s
                user-select: none
                margin-right: 8px
                align-items: center
                display: grid
                &.minor
                  background-color: transparent
                  border-color: transparent
                  border: grey thin solid
                &.delete
                  border: grey thin solid
                &.cancel
                  background-color: transparent
                  border: grey thin solid
                  color: grey
</style>
