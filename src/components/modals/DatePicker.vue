<script>
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
export default {
  name: 'DatePicker',
  props: {
    options: {
      required: true,
    },
  },
  components: {
    'vue-cal': VueCal,
  },
  data() {
    return {
      selectedDate: new Date(),
    }
  },
}
</script>

<template lang="pug">
  #date-picker-main.modal-main
    .date-picker-container.modal-container
      .title Select Date
      .content
        .calendar-holder
          vue-cal#date-picker(
            default-view='month'
            :disable-views=`['day', 'year', 'years', 'week', 'month']`
            :selected-date='selectedDate'
            xsmall
            @cell-click='date => selectedDate = date'
          )
      .action
        .button.cancel(
          @click='$modals.hide("date-picker")'
        ) Cancel
        .button.right(
          @click='options.onSelect(selectedDate)'
        ) Select
</template>

<style lang="sass">
  #date-picker
    .vuecal__cell--selected
      background-color: black
      color: white
</style>

<style lang="sass" scoped>
  #date-picker-main
    .date-picker-container
      .action
        grid-template-columns: 150px auto
        .button
          &.right
            justify-self: end
</style>