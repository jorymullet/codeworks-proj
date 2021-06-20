<script>
import AddButton from '$common/AddButton'
import ProInput from '$common/ProInput'
import ProSelect from '$common/ProSelect'
import {isBeingSearched} from '@/global/js/search'
export default {
  name: 'Entities',
  components: {
    'add-button': AddButton,
    'pro-input': ProInput,
    'pro-select': ProSelect,
  },
  props: {
    retrievePromise: Function,
    filters: Array,
    dropdowns: Array,
    title: String,
    refreshString: String,
    showEditEntity: Function,
    noCard: Boolean,
    noAdd: Boolean,
    headerButtons: Array,
    searchOptions: Object,
  },
  watch: {
    dropdowns () {
      this.readyDropdowns()
    },
  },
  data () {
    return {
      entities: null,
      localFilters: [],
      localDropdowns: [],
      search: '',
      isBeingSearched,
    }
  },
  computed: {
    filteredEntities () {
      if (!this.entities) return []

      let entities = this.entities

      // ensure that there are filters and at least one is engaged
      if (this.localFilters && this.localFilters.length && this.localFilters.find(lf => lf.engaged)) {
        entities = this.localFilters.reduce((acc, filter) => filter.engaged ? acc.filter(filter.func) : acc, entities)
      }

      // ensure that there are dropdowns and at least one has chosen values
      if (this.localDropdowns && this.localDropdowns.length && this.localDropdowns.find(ld => ld.chosen.length)) {
        entities = this.localDropdowns.reduce((acc, ld) => {
          if (!ld.chosen.length) return acc

          return acc.filter(entity => ld.func(entity, ld.chosen))
        }, entities)
      }

      if (this.search) {
        entities = entities.filter(entity => isBeingSearched(this.search, (entity[this.searchOptions.field] || '')))
      }

      return entities
    },
  },
  methods: {
    async getEntities () {
      this.entities = await this.retrievePromise()
      this.$emit('loaded', {entities: this.entities})
    },
    readyFilters () {
      if (!(this.filters && this.filters.length)) return

      this.localFilters = this.filters.map(filter => ({engaged: false, ...filter}))
    },
    readyDropdowns () {
      if (!(this.dropdowns && this.dropdowns.length)) return

      this.localDropdowns = this.dropdowns.map(dd => ({...dd, chosen: []}))

      this.checkQuery()
    },
    checkQuery () {
      const query = this.$route.query
      if (!query) return

      const filterByProject = query.filterByProject
      if (!(filterByProject)) return

      const dropdown = this.localDropdowns.find(dd => dd.options && dd.options.find(option => option.value === filterByProject))

      if (!dropdown) return
      
      setTimeout(() => {
        dropdown.chosen.push(filterByProject)
      }, 200)
    },
  },
  async mounted () {
    if (this.refreshString) {
      this.$proOn(this.refreshString, this.getEntities)
    }
    await this.getEntities()
    await this.readyFilters()
    await this.readyDropdowns()
  },
}
</script>

<template lang="pug">
  .entities-main
    .entities-container(
      :class='noCard ? "" : ""'
    )
      .header
        .pro-title.dotdotdot {{title}}
          add-button(
            v-if='!noAdd'
            :onClick='() => showEditEntity({isNew: true})'
          )
        .buttons-holder(
          v-if='headerButtons && headerButtons.length'
        )
          router-link.pro-button.minor(
            v-for='(button, idx) in headerButtons'
            :to='button.to'
            :key='idx'
          ) {{button.name}}
      .search-area(
        v-if='searchOptions && searchOptions.field'
      )
        .input-holder
          pro-input(
            v-model='search'
            :options='{title: `Search by ${searchOptions.by}`}'
          )
      .dropdowns(
        v-if='localDropdowns.length'
      )
        .dropdown-holder(
          v-for='(dd, idx) in localDropdowns'
          :style='dd.helperButtons && dd.helperButtons.length ? {"grid-template-columns": `auto repeat(${dd.helperButtons.length}, max-content)`} : {}'
        )
          pro-select.dropdown(
            :title='dd.title'
            :options='dd.options'
            :multiple='true'
            v-model='localDropdowns[idx].chosen'
            :key='idx'
          )
          .helper-buttons(
            v-if='dd.helperButtons && dd.helperButtons.length'
          )
            .button(
              v-for='button in dd.helperButtons'
              @click='button.click'
            ) {{button.copy}}
      .filters(
        v-if='localFilters && localFilters.length'
      )
        .filter(
          v-for='filter in localFilters'
          @click='filter.engaged = !filter.engaged'
          :class='filter.engaged ? "engaged" : ""'
        ) {{filter.copy(filter.engaged)}}
      .content
        .entities-holder
          .entity.no-interact(
            v-if='!entities'
          )
            .icon
              img(
                src='@/assets/svg/infiniti.svg'
              )
            .title.italic Loading...
          .entity.no-interact(
            v-else-if='!filteredEntities.length'
          )
            .icon
              i.material-icons blocked
            .title.italic None found.
          slot(
            v-else
            :entities='filteredEntities'
            )
</template>

<style lang="sass" scoped>
  .entities-main
    width: 100%
    .entities-container
      width: 100%
      .header
        display: grid
        grid-template-columns: auto auto
        column-gap: 1rem
        .buttons-holder
          justify-self: end
      .filters
        margin-bottom: 1rem
        display: flex
        user-select: none
        flex-wrap: wrap
        .filter
          cursor: pointer
          margin: 0 1rem .5rem 0
          border: thin solid $orange
          padding: .5rem 1rem
          border-radius: 1rem
          width: fit-content
          font-size: 12px
          box-shadow: 0 0 .5rem 0 $darkgrey
          &.engaged
            background-color: $orange
            color: white
          &:active
            box-shadow: 0 0 .5rem 0 rgba(0,0,0,.4) inset
      .search-area
        padding: 1rem 0
      .dropdowns
        position: relative
        display: grid
        grid-template-columns: 1fr 1fr
        column-gap: 1rem
        margin-bottom: 1rem
        .dropdown-holder
          display: grid
          align-items: center
          column-gap: .25rem
          .helper-buttons
            .button
              color: white
              background: $mild-blue
              padding: .25rem .5rem
              border-radius: .25rem
              cursor: pointer
              font-size: 12px

      .content
        width: 100%
        .entities-holder
          height: 14rem
          overflow: scroll
          display: block
          box-shadow: 0 0 .25rem 0 $lightgrey inset
          width: 100%
          .entity.no-interact
            display: grid
            cursor: default
            grid-template-columns: min-content auto
            column-gap: 1rem
            align-items: center
            padding: 1rem
            &:hover
              background-color: transparent


</style>