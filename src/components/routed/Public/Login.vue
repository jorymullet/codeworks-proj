<script>
import ProInput from '$common/ProInput'
import * as qs from 'qs'
export default {
  name: 'PublicLogin',
  components: {
    'pro-input': ProInput,
  },
  data () {
    return {
      error: '',
    }
  },
  methods: {
    goToLogin () {
      const redirect = this.$route.query.redirect
      const queryObj = {
        client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
        redirect_uri: `${location.origin}/login${redirect ? `?redirect=${redirect}` : ''}`,
        scope: 'openid profile email picture',
        response_type: 'code',
      }
      const query = qs.stringify(queryObj)
      const url = `https://${process.env.VUE_APP_AUTH0_DOMAIN}/authorize/?${query}`
      window.location = url
    },
    async exchangeCode (code) {
      const body = {}
      body.authorization_token = {
        grant_type: 'authorization_code',
        client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
        redirect_uri: `${location.origin}/login`,
        code,
      }
      const pendingUser = this.$cookies.get('invanti-pending-user')
      const userHasBeenCreated = this.$cookies.get('invanti-created-user')
      if (pendingUser && !userHasBeenCreated) {
        body.pending_user = pendingUser
      }
      
      try {
        const res = await this.$HTTP({
          method: 'post',
          uri: `users`,
          body,
          secure: false,
        })
        //this.$cookies.set('invanti-created-user', true)
        const token = res.body && res.body.token
        if (!token) return this.$toast({copy: 'Could not log user in. Please contact support'})

        this.$auth.signInWithCustomToken(token)
      } catch (err) {
        console.error(err)
        this.$toast(err.body.message)
        if (err.body.retry) {
          this.$toast('Redirecting to login...')
          setTimeout(this.goToLogin, 1500)
        } else {
          setTimeout(() => this.$store.commit('logout'), 2500)
        }
      }
    },
  },
  mounted () {
    const query = this.$route.query
    const code = query.code
    if (query.error) {
      this.error = query.error_description
    }
    else if (code) {
      this.exchangeCode(code)
    } else {
      setTimeout(this.goToLogin, 500)
    }
  },
}
</script>

<template lang="pug">
  #login-main.public-main
    .login-container.public-container
      .content
        transition(
          name='fade'
          mode='out-in'
        )
          .copy(
            v-if='error'
          )
            .pro-title Error
            p {{error}}
          .copy(
            v-else
          )
            img(
              src='@/assets/svg/infiniti.svg'
            )
            .pro-title 
</template>

<style lang="sass" scoped>
  @import '$styles/form'
  #login-main
    display: grid
    .login-container
      width: fit-content
      display: block
      width: 100%
      max-width: 400px
      justify-self: center
      .content
        .copy
          width: 100%
          margin-bottom: 4rem
          .pro-button
            font-size: 22px
        .form-holder
          margin-top: 1.5rem
</style>