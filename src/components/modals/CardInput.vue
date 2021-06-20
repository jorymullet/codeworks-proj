<script>
export default {
  name: 'CardInput',
  props: {
    options: {
      required: true,
    },
  },
  watch: {
    'card': {
      deep: true,
      handler (newCard) {
        this.ready = newCard['_complete']
      },
    },
    stage (stage) {
      this.card.update({disabled: stage === 'system'}) // disables on submit
    },
  },
  data() {
    return {
      stripe: null,
      card: null,
      ready: false,
      stage: 'user',
      error: '',
    }
  },
  computed: {
    buttonCopy () {
      return {
        user: 'Submit',
        system: 'Loading...',
      }[this.stage]
    }
  },
  methods: {
    readyStripe () {
      // eslint-disable-next-line
      this.stripe = Stripe(process.env.VUE_APP_STRIPE_KEY)
      this.card = this.stripe.elements().create('card', {
        style: {}
      })
      this.card.mount('#card-element')
    },
    async submit () {
      if (!this.ready) return this.$toast('Fill out card info')
      
      this.error = ''
      this.stage = 'system'

      try {
        const result = (await this.stripe.createToken(this.card))
        if (result.error) {
          this.stage = 'user'
          this.error = result.error
          return console.log(result)
        }
        try {
          await this.options.onSuccess(result.token)
        } catch (err) {
          this.stage = 'user'
          this.options.handleError && this.options.handleError(err)
          this.error = err
          return
        }
      } catch (err) {
        this.stage = 'user'
        this.error = 'Could not use card.'
        return console.error(err)
      }
    },
  },
  mounted () {
    this.readyStripe()
  },
}
</script>

<template lang="pug">
  #card-input-main.modal-main
    .card-input-container.modal-container
      .title Input Card Info
      .content
        .foreword We use a company called 
          a.link.font-1-bold(
            href='https://stripe.com/docs/security/stripe'
            target='_blank'
          ) Stripe
          |  to keep your information secure.
        .image-holder
          i.material-icons lock
        .message.font-1-bold {{options.message}}
        .card-holder
          #card-element
        .error-holder(
          v-if='error'
        )
          .error {{error}}
        .buttons-holder
          .pro-button(
            :class='ready && (stage === "user") ? "major" : ""'
            @click='(stage === "user") && submit()'
          ) {{buttonCopy}}
</template>

<style lang="sass" scoped>
  @import '$styles/form.sass'
  #card-input-main
    .card-input-container
      .content
        .foreword
          font-size: 12px
          text-align: center
          .link
            text-decoration: none
            color: black
        .image-holder
          display: grid
          justify-items: center
          padding: 24px
          > i
            font-size: 84px
        .message
          text-align: center
        .card-holder
          margin: 24px 0 16px
          padding: 12px
          box-shadow: 0 0 5px 0 $darkgrey
          border-radius: 8px
        .error-holder
          margin-bottom: 16px
          .error
            @extend .font-1-bold
            color: red
            text-align: center
        .buttons-holder
          display: grid
          justify-items: center
          .pro-button
            transition: all .1s
            opacity: .5
            &.major
              opacity: 1
</style>