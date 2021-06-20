<script>
export default {
  name: 'ViewEntity',
  props: {
    options: Object,
  },
  methods: {
    printId () {
      const id = this.$dig(this, ['options', 'entity', 'id'])
      if (id) console.log(id)
    },
  },
}
</script>

<template lang="pug">
  #view-entity-main.modal-main
    .view-entity-container.modal-container
      .title(
        @click='printId'
      ) {{options.title}}
      .content
        .sections-holder
          .section(
            v-for='section in options.sections'
          )
            .title {{section.title}}
            .value(
              v-html='section.value(options.entity)'
            )
      .action
        .button.cancel(
          @click='$modals.hide("view-entity")'
        ) Close
        .button.major(
          v-if='options.onEdit'
          @click='options.onEdit'
        ) {{options.editCopy || "Edit"}}
</template>

<style lang="sass" scoped>
  #view-entity-main
    .view-entity-container
      .content
        .sections-holder
          .section
            margin-bottom: 2rem
            .title
              color: #888
              margin-bottom: 1rem
              font-size: 12px
              text-decoration: underline
            .value
              
</style>