<script>
export default {
  name: 'ProTable',
  props: {
    entities: {
      
    },
    cells: {
      required: true,
    },
    initialSorting: {
      type: Object,
    },
    customColumnWidths: {
      type: String,
    },
    tableStyle: {
      default: _ => ({}),
    },
  },
  data () {
    return {
      sorting: {
        ascending: true,
        name: '',
      },
    }
  },
  computed: {
    sortedEntities () {
      if (!this.entities) return []
      const sortFunc = this.cells.find(cell => cell.name === this.sorting.by).sortFunc
      const sorted = [...this.entities].sort(sortFunc)
      return this.sorting.ascending ? sorted : sorted.reverse()
    },
    columnWidths () {
      return this.customColumnWidths || `repeat(${Object.keys(this.cells).length}, 1fr)`
    },
  },
  methods: {
    onHeaderCellClick (cellName) {
      this.sorting = {
        by: cellName,
        ascending: this.sorting.by === cellName ? !this.sorting.ascending : true,
      }
      this.$emit('onSortingChange', this.sorting)
    },
  },
  beforeMount () {
    this.sorting = this.initialSorting || {
      by: this.cells[0].name,
      ascending: true,
    }
  },
}
</script>

<template lang="pug">
  .pro-table(
    :style='tableStyle'
  )
    .entities-holder
      .header.entity(
        :style='{"grid-template-columns": columnWidths}'
      )
        .cell(
          v-for='cell in cells'
          :class='cell.sortFunc && (cell.name === sorting.by) ? `sorted-by ` + (sorting.ascending ? `ascending` : `descending`) : ``'
          @click='cell.sortFunc && onHeaderCellClick(cell.name)'
        ) {{cell.name}}
          .action-icon(
            v-if='cell.actionIcon'
            @click.stop='cell.actionIcon.action()'
            )
            i.material-icons {{cell.actionIcon.icon}}
      .entity.no-entities(
        v-if='!entities'
      )
        .cell Loading...
      .entity.no-entities(
        v-else-if='!entities.length'
      )
        .cell None found
      .regular.entity(
        v-for='entity in sortedEntities'
        @click='$emit("onEntityClick", entity)'
        :style='{"grid-template-columns": columnWidths}'
      )
        .cell(
          v-for='cell in cells'
          :class='cell.classFunc && cell.classFunc(entity)'
          :style='cell.style'
          @click.stop='cell.onClick ? cell.onClick(entity) : $emit("onEntityClick", entity)'
          v-html='cell.getInfo(entity)'
        )
      
</template>

<style lang="sass" scoped>
@import '$styles/form.sass'
.pro-table
  width: fit-content
  min-width: calc(100vw - 600px)
  .entities-holder
    border: $lightgrey solid thin
    overflow: scroll
    .entity
      display: grid
      border-radius: 4px
      align-items: center
      .cell
        padding: 8px 12px
        &.red-font
          color: red
        &.green-font
          color: $orange
      &.regular
        border-bottom: thin solid #EAEAEA
        padding: 4px 8px 4px 0
        &:hover
          cursor: pointer
        .cell
          overflow-wrap: break-word
          font-size: 14px
          > i
            font-size: 14px
          &.clickable
            font-weight: 600 
            &:hover
              text-decoration: underline
      &.header
        @extend .font-1-bold
        cursor: pointer
        background-color: $orange
        color: white
        .cell
          background-color: $orange
          user-select: none
          padding: 12px 22px 12px 12px
          display: flex
          .action-icon
            margin-left: 8px
            > i
              font-size: 14px
              position: relative
              top: 2px
          &.can-cover
            > i
              color: white
          &:hover
            box-sizing: border-box
          &.sorted-by
            font-weight: bold
            position: relative
            &:after
              font-family: 'Material Icons'
              content: 'expand_more'
              transition: all .2s
              font-size: 18px
              position: absolute
              top: 11px
              right: 8px
          &.ascending:after
            transform: rotate(0deg)
          &.descending:after
            transform: rotate(180deg)
      &.no-entities
        font-style: italic
        opacity: .6
</style>