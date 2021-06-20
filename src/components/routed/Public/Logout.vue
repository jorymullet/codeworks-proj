<script>
export default {
  name: 'Logout',
}
</script>

<template lang="pug">
  #logout-main.public-main
    .logout-container.public-container
      .content.card
        i.material-icons.icon lock
        .pro-title You have logged out.
        router-link.pro-button.major(
          :to='{name: "Login"}'
        ) Log back in
          i.material-icons login
</template>

<style lang="sass" scoped>
  @import '$styles/transitions'
  #logout-main
    .logout-container
      .content
        display: grid
        justify-items: center
        border-radius: 1rem
        padding: 4rem 2rem
        .pro-title
          margin-bottom: 3rem
        .icon
          font-size: 72px
          margin-bottom: 2rem
        .pro-button
          display: grid
          grid-template-columns: max-content max-content
          column-gap: .5em
          align-items: center
</style>