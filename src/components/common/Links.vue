<script>
import AddButton from '$common/AddButton.vue'
export default {
  name: 'Links',
  props: {
    dbRef: String,
    links: Array,
    title: String,
    refresh: String,
    canEdit: Boolean,
  },
  components: {
    'add-button': AddButton,
  },
  methods: {
    openEditLink (options) {
      this.$modals.show({
        name: 'edit-link',
        ...this.$props,
        ...options,
      })
    },
  },
}
</script>

<template lang="pug">
  #links-main
    .links-container
      .header
        .pro-title {{title}}
          add-button(
            v-if='canEdit'
            :onClick='() => openEditLink({isNew: true})'
          )
      .content
        .links-holder
          .link(
            v-if='!(links && links.length)'
          )
            .title.italic No links
          .link(
            v-else
            v-for='(link, idx) in links'
          )
            a.title(
              :href='link.url'
              target='_blank'
            ) {{link.title}}
            i.material-icons(
              v-if='canEdit'
              @click.stop='()=> openEditLink({idx, link})'
            ) edit


</template>

<style lang="sass" scoped>
  #links-main
    .links-container
      //max-width: 20rem
      .content
        .links-holder
          .link
            display: grid
            grid-template-columns: auto min-content
            padding: .5rem 0
            align-items: center
            width: 100%
            > a
              &:hover
                text-decoration: underline
            > i
              font-size: 22px
              color: #555
              cursor: pointer

</style>