<script>
import {isBeingSearched} from '@/global/js/search'
import ProInput from '$common/ProInput'
export default {
  name: 'UserChooser',
  components: {
    'pro-input': ProInput,
  },
  props: {
    options: Object,
  },
  data () {
    return {
      users: null,
      chosen: null,
      search: '',
    }
  },
  computed: {
    isMultiple () {
      return this.options.multiple
    },
    filteredUsers () {
      let users = this.users
      if (!users) return []

      if (this.search) {
        // searchOptions.field can be both a function and a string
        // this bit prepares for both
        const fieldFunc = typeof this.searchOptions.field === 'string' ? u => u[this.searchOptions.field] : this.searchOptions.field
        users = users.filter(user => {
          const value = fieldFunc(user)
          return isBeingSearched(this.search, value || '')
        })
      }

      return users
    },
    searchOptions () {
      return this.options.searchOptions
    },
  },
  methods: {
    async getUsers () {
      this.users = await this.options.retrievePromise()
    },
    submit () {
      if (!this.chosen) return this.$toast('Choose user')

      this.options.onSuccess(this.chosen)
      this.$modals.hide('user-chooser')
    },
    onChoose (user) {
      if (this.isMultiple) {
        const idx = this.chosen.findIndex(u => u.id === user.id)
        if (idx === -1) {
          this.chosen.push(user)
        } else {
          this.chosen.splice(idx, 1)
        }
      } else {
        this.chosen = user
      }
    },
    isChosen (user) {
      if (!this.users) return

      if (this.isMultiple) {
        return this.chosen && this.chosen.find(chosenUser => chosenUser.id === user.id)
      } 
      
      return this.chosen && (this.chosen.id === user.id)
    },
    setExistingUsers () {
      const setExisting = this.options.setExisting
      if (!setExisting) return

      setExisting(this.users, this)
    },
    onTotalSelection () {
      if (this.chosen.length === this.users.length) {
        this.chosen = []
      } else {
        this.chosen = this.$clone(this.users)
      }
    },
  },
  async mounted () {
    await this.getUsers()
    if (this.isMultiple) {
      this.chosen = []
    }
    this.setExistingUsers()
  },
}
</script>

<template lang="pug">
  #user-chooser-main.modal-main
    .user-chooser-container.modal-container
      .title {{options.title || 'Choose User'}}
      .content
        .prompt.instruction(
          v-if='options.prompt'
        ) {{options.prompt}}
        .search-area(
          v-if='options.searchOptions && options.searchOptions.field'
        )
          .input-holder
            pro-input(
              v-model='search'
              :options='{title: `Search by ${options.searchOptions.by}`}'
            )
        .multiple-options(
          v-if='options.multiple'
        )
          .user-count Total: {{(chosen && chosen.length) || 0}}
          .pro-button.minor(
            @click='onTotalSelection'
          ) {{(chosen && chosen.length) === (users && users.length) ? 'Deselect' : 'Select'}} all
        .users-holder
          .user(
            v-if='!users'
          )
            span
            .name.italic Loading...
          .user(
            v-else-if='!users.length'
          )
            span
            .name.italic No users found
          .user.card(
            v-else
            v-for='user in filteredUsers'
            @click='onChoose(user)'
            :class='isChosen(user) ? "chosen" : ""'
          )
            img(
              :src='user.photo_url'
            )
            .name {{user.first_name}} {{user.last_name}}
            .role {{user.role}}
      .action
        .button.cancel(
          @click='$modals.hide("user-chooser")'
        ) Cancel
        .button(
          @click='submit'
          :class='chosen ? "major" : "minor"'
        ) Continue
</template>

<style lang="sass" scoped>
  #user-chooser-main
    .user-chooser-container
      .content
        .prompt
          margin-top: 0
        .search-area
          margin-top: 2rem
        .multiple-options
          display: grid
          grid-template-columns: max-content auto
          margin-top: 1rem
          align-items: center
          .user-count
            font-weight: bold
          .pro-button
            justify-self: right
        .users-holder
          margin: 1rem 0
          height: calc(100vh - 29rem)
          overflow-y: scroll
          padding: 1rem
          box-shadow: 0 0 .25rem 0 #CCC inset
          border-radius: .25rem
          .user
            display: grid
            grid-template-columns: min-content 2fr 1fr
            column-gap: .5rem
            padding: .5rem 1rem
            align-items: center
            transition: background-color .25s
            cursor: pointer
            margin-bottom: .5rem
            &:hover
              background-color: #DDD
            &.chosen
              border: thin grey solid
            > img
              height: 2rem
              width: 2rem
              border-radius: 50%
</style>