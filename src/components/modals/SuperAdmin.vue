<script>
export default {
  name: 'SuperAdmin',
  props: {
    options: {},
  },
  methods: {
    async testGet () {
      try {
        await this.$HTTP({
          method: 'get',
          uri: 'test',
        })
        this.$toast('NAILED')
      } catch (err){
        this.$toast('FAILED')
      }
    },
  },
}
</script>

<template lang="pug">
  #super-admin.modal-main
    .modal-container
      .title Super Admin
      .content 
        .description Exit this modal now unless you absolutely know what you are doing
        .buttons-holder
          .pro-button.major(
            @click='testGet'
          ) get test
    .action
      .button.major(
        @click='$modals.hide("super-admin")'
      ) Close
</template>

<style lang="sass">
  #super-admin
    .modal-container
      .title
        @extend .font-1-bold
</style>