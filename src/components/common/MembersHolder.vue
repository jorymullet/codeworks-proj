<script>
export default {
  name: 'MembersHolder',
  watch: {
    membersIds () {
      this.getMembers()
    },
  },
  props: {
    membersIds: Array,
  },
  data() {
    return {
      members: null,
    }
  },
  methods: {
    async getMembers () {
      const usersRef = this.$firestore.collection('users')
      const promises = this.membersIds.map(id => usersRef.doc(id).get())
      const members = (await Promise.all(promises)).map(ss => ss.data()).filter(Boolean)
      this.members = members
    },
  },
  mounted () {
    this.getMembers()
  },
}
</script>

<template lang="pug">
  #members-holder-main
    .members-holder-container
      .members
        .loading(
          v-if='!members'
        )
        .pro-member.card(
          v-for='member in members'
        )
          .image
            img(
              :src='member.photo_url'
            )
          .name {{member.first_name}} {{member.last_name}}
</template>

<style lang="sass" scoped>
  #members-holder-main
    .members-holder-container
      margin: 1rem 0
      .members
        display: flex
        max-width: 100%
        overflow-x: scroll
        padding: 1rem .25rem
        .loading
          height: 3.5rem
</style>