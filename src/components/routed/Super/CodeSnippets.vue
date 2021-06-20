<script>
import ProSelect from '$common/ProSelect'
import {decideFontColor} from '@/global/js/color.js'
export default {
  name: 'CodeSnippets',
  components: {
    'pro-select': ProSelect,
  },
  watch: {
    org (org) {
      if (org) this.generateCircleSnippets()
    }
  },
  data () {
    return {
      orgs: null,
      org: null,
      headSnippet: '',
      jsSnippet: '',
    }
  },
  methods: {
    async getOrgs () {
      this.orgs = this.$fire.qs.toArray(await this.$firestore.collection('orgs').get()).map(org => ({name: org.name, value: org}))
    },
    generateCircleSnippets () {
      if (!this.org) return this.$toast('Choose organization')

      const projectId = JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG).projectId

      this.jsSnippet = 
`
const logoutButton =  '<a href="https://${projectId}.web.app/logout/force">Logout</a>'

const createBasicHeader = () => {
  const customInner = document.querySelector('.custom-inner')
  customInner.innerHTML = '<a href="https://${projectId}.web.app/login">Home</a>'
}

const createBlankHeader = () => {
var elements = "<div class='custom-head'><div class='custom-inner'></div>"

var x = document.createElement("div"); // Create a new div
x.innerHTML = elements; // Populate it with header
document.getElementById("panel").prepend(x); // Inject
}

createBlankHeader()

const createAdvancedHeader = user => {
  if (!(user && user.role && user.id)) return createBasicHeader()

  const buttons = []
  if (user.role === 'SUPER_ADMIN') {
     buttons.push('<a href="https://${projectId}.web.app/super">Dashboard</a>')
  } else if (user.role === 'ADMIN') {
    buttons.push(\`<a href="https://${projectId}.web.app/orgs/\${user.org_id}/admin">Dashboard</a>\`)
    buttons.push(\`<a href="https://${projectId}.web.app/members/\${user.id}">Home</a>\`)
    buttons.push(\`<a href="https://${projectId}.web.app/members/\${user.id}/research">My Research</a>\`)
    buttons.push(\`<a href="https://${projectId}.web.app/members/\${user.id}/sprints">Sprints</a>\`)
  } else if (user.role === 'MEMBER') {
    buttons.push(\`<a href="https://${projectId}.web.app/members/\${user.id}">Home</a>\`)
    buttons.push(\`<a href="https://${projectId}.web.app/members/\${user.id}/research">My Research</a>\`)
    buttons.push(\`<a href="https://${projectId}.web.app/members/\${user.id}/sprints">Sprints</a>\`)
  }

  
  const customInner = document.querySelector('.custom-inner')
  customInner.innerHTML = buttons.join(' ')
}

const user = window.circleUser

if (!(user && user.email)) return createBasicHeader()

fetch(\`https://us-central1-${projectId}.cloudfunctions.net/users/byEmail/\${user.email}\`)
.then(r => r.json())
.then(res => {
  if (res.error) return createBasicHeader()

  createAdvancedHeader(res)
})
.catch(e => {
console.error(e)
createBasicHeader()
})

`

      this.headSnippet = 
`<style>
.custom-head{
color:${decideFontColor(this.org.brand_colors.primary)};margin: 0 auto;height: 60px;position: fixed;top: 0;background: ${this.org.brand_colors.primary};width: 100%;font-weight: 400;font-size: 12px;z-index:1000;}
.custom-inner{max-width:1340px;padding:20px 75px;margin:0 auto;text-align:right;}
.custom-head .custom-inner a {color:${decideFontColor(this.org.brand_colors.primary)};text-decoration: none;margin-left: 20px;}
.custom-head .custom-inner a:hover {font-weight: 600}
.header{margin-top:60px;}

@media (min-width: 992px){
.is-standard-layout .community__content {padding-top: 120px;}
}
@media (max-width: 991px){
.custom-head {position:relative;}
.header {margin-top:0;}
.custom-inner {padding:10px 20px;}
}
</style>
`
    },
    copy (snippet) {
      this.$copyToClipboard(snippet)
      this.$toast('Copied!')
    },
  },
  async mounted () {
    await this.getOrgs()
  },
}
</script>

<template lang="pug">
  #code-snippets-main.admin-main
    .code-snippets-container.admin-container
      .header
        .pro-title Code Snippets
      .content
        .code-area.card
          .title Circle Snippets
          .content
            .select-area
              .instruction First, choose organization for which to create code snippets.
              .pro-form
                .form-row
                  pro-select(
                    v-model='org'
                    :options='orgs || []'
                    :disabled='!orgs'
                    title='Organization'
                  )
            .snippet-area
              textarea(
                v-model='headSnippet'
                disabled
              )
              .pro-button.major(
                v-if='headSnippet'
                @click='() => copy(headSnippet)'
              ) Copy Head Snippet
            .snippet-area
              textarea(
                v-model='jsSnippet'
                disabled
              )
              .pro-button.major(
                v-if='jsSnippet'
                @click='() => copy(jsSnippet)'
              ) Copy JavaScript Snippet
</template>

<style lang="sass" scoped>
  #code-snippets-main
    .code-snippets-container
      .content
        .code-area
          margin-bottom: 1rem
          .title
            font-size: 18px
            font-weight: bold
          .content
            display: grid
            grid-template-columns: 1fr 1fr 1fr
            column-gap: 1rem
            .select-area
              .instruction
                margin-bottom: 1rem
            .snippet-area
              display: grid
              grid-template-rows: min-content auto
              row-gap: 1rem
              > textarea
                width: 100%
                height: 10rem
                resize: none
              .pro-button
                align-self: end
</style>