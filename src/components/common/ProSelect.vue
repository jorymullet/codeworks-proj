<script>
export default {
  name: 'ProSelect',
  props: ['value',
    'options', // options must have the format [{name: <display_name>: value: <important_value>}]
    'title','id','disabled',
    'multiple', // if you would like users to select several options
    'findIndexFunc'], // custom function to determine index of option. good for determining inclusion and for removal
  watch: {
    value (newValue) {
      if (this.multiple) {
        this.choices = newValue || []
      } else {
        const isChoice = this.options.find(option => option.value === newValue)
        this.choice = isChoice ? isChoice.value : null
      }
    },
    isOpen (isOpen) {
      if (isOpen) {
        if (this.disabled) {
          this.isOpen = false
        } else {
          this.lastOpened = Date.now()
          this.$nextTick(() => {
            const oh = this.$refs.optionHolder
            oh && oh.scrollIntoView({block: 'nearest'})
          })
        }
      }
    },
  },
  data () {
    return {
      isOpen: false,
      ref: null,
      choice: null,
      choices: [],
      lastOpened: 0,
      focusIdx: null,
    }
  },
  computed: {
    choiceName () {
      const isChoice = this.options.find(option => option.value === this.choice)
      return isChoice && isChoice.name
    },
    contentClasses () {
      const classes = []
      if (this.isOpen) classes.push('is-open')
      if (this.choice) classes.push('chosen')
      if (this.disabled) classes.push('disabled')
      return classes.join(' ')
    },
  },
  methods: {
    onClick () {
      this.isOpen = true
    },
    listenForEvents () {
      document.addEventListener('click', (e) => {
        if (this.disabled) {
          this.isOpen = false
          return
        }
        this.isOpen = e.path.find(ele => ele.classList && ele.classList.contains(this.ref))
        this.$forceUpdate()
      })
    },
    listenForChoice () {
      this.$proOn('set-pro-select-choice', (options) => {
        if (options.id && (options.id === this.id)) {
          this.onSelect({value: options.choice})
        }
      })
    },
    onSelect (option) {
      const fif = this.findIndexFunc
      if (this.multiple) {
        const alreadyChosen = this.isOptionChosen(option)

        if (fif) { // custom chosen func
          if (alreadyChosen) {
            const idx = this.findIndexFunc(option, this.choices)
            this.choices.splice(idx, 1,)
          } else {
            this.choices.push(option.value)
          }
        } else {
          this.choices[alreadyChosen ? 'remove' : 'push'](option.value)
        }


        setTimeout(() => {
          this.$emit('input', this.choices)
        }, 1)
      } else {
        const alreadyChosen = this.isOptionChosen(option)
        if (alreadyChosen) return

        this.choice = null
        setTimeout(() => {
          this.choice = option.value
          this.$emit('input', option.value)
          this.isOpen = false
        }, 1)
      }
    },
    onFocus () {
      this.isOpen = true
    },
    isOptionChosen (option) {
      const fif = this.findIndexFunc
      if (fif) return fif(option, this.choices) !== -1

      return this.choices.includes(option.value)
    },
    placeValue () {
      setTimeout(() => {
        const fif = this.findIndexFunc
        if (!fif) return

        const idx = fif(this.value, this.options)

        if (idx === -1) return

        this.onSelect(this.options[idx])
      }, 1)
    },
  },
  mounted () {
    this.listenForEvents()
    this.listenForChoice()
    this.placeValue()
    this.ref = String(Math.random())
  },
}
</script>

<template lang="pug">
  .pro-select-main(
    :class='ref'
    tabindex='0'
    @focus='onFocus'
    @click='onClick'
    @blur='isOpen = false'
  )
    .pro-select-container
      .content(
        :class='contentClasses'
      )
        .title {{title}} 
          span(
            v-if='choices && choices.length'
          ) ({{choices.length}})
        .value-holder
          transition(
            name='from-bottom'
          )
            .name(
              v-if='choice'
              v-html='choiceName'
            )
          .arrow
            i.material-icons expand_more
        .dropdown
          transition(
            name='fade'
          )
            .option-holder(
              v-if='isOpen'
              ref='optionHolder'
            )
              .option.italic(
                v-if='!(options && options.length)'
              ) No options
              .option(
                v-for='(option, idx) in options'
                @click='onSelect(option)'
                v-html='option.name'
                :class='multiple && isOptionChosen(option) ? "chosen" : ""'
              )
</template>

<style lang="sass" scoped>
  @import '$vars'
  @import '$styles/transitions.sass'
  $select-grey: #AAA
  .pro-select-main
    &:focus
      outline: none
    .pro-select-container
      .content
        position: relative
        cursor: pointer
        &.disabled
          opacity: .4
          cursor: not-allowed
        &.is-open
          .value-holder
            .arrow
              transform: rotate(180deg)
        &.chosen
          .title
            top: -12px
            font-size: 12px
            color: #AAA
            .value-holder
              .arrow
                transform: rotate(180deg)
        &
        .title
          font-family: $font-2
          position: absolute
          top: .5rem
          transition: .25s all
        .value-holder
          border-bottom: 1px $select-grey solid
          height: 37px
          .name
            position: absolute
            font-size: 16px
            top: .5rem
          .arrow
            position: absolute
            right: 0
            top: 5px
            transition: .25s all
        .dropdown
          .option-holder
            border: thin solid $select-grey
            border-radius: .5rem
            position: absolute
            margin-top: .5rem
            width: 100%
            background-color: white
            z-index: 2
            max-height: 308px
            overflow: scroll
            box-shadow: 0 2px .25rem $select-grey
            .option
              padding: .5rem 1rem .5rem .5rem
              cursor: pointer
              font-size: 1.1em
              position: relative
              &.chosen
                //background-color: #F4F4F4
                &:after
                  font-family: 'Material Icons'
                  content: 'check_circle'
                  transition: all .2s
                  font-size: 18px
                  position: absolute
                  top: .5rem
                  right: 8px
                  color: #444
              &:hover
                background-color: #F4F4F4
</style>
