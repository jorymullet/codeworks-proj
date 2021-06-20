const MONTHS = [
  {
    short: 'Jan',
    long: 'January',
  },
  {
    short: 'Feb',
    long: 'February',
  },
  {
    short: 'Mar',
    long: 'March',
  },
  {
    short: 'Apr',
    long: 'April',
  },
  {
    short: 'May',
    long: 'May',
  },
  {
    short: 'Jun',
    long: 'June',
  },
  {
    short: 'Jul',
    long: 'July',
  },
  {
    short: 'Aug',
    long: 'August',
  },
  {
    short: 'Sep',
    long: 'September',
  },
  {
    short: 'Oct',
    long: 'October',
  },
  {
    short: 'Nov',
    long: 'November',
  },
  {
    short: 'Dec',
    long: 'December',
  },
]

const DAYS = [
  {
    short: 'Sun',
    long: 'Sunday',
  },
  {
    short: 'Mon',
    long: 'Monday',
  },
  {
    short: 'Tue',
    long: 'Tuesday',
  },
  {
    short: 'Wed',
    long: 'Wednesday',
  },
  {
    short: 'Thu',
    long: 'Thursday',
  },
  {
    short: 'Fri',
    long: 'Friday',
  },
  {
    short: 'Sat',
    long: 'Saturday',
  },
]

const getDateEnding = (num) => {
  const stEnding = [1,21,31]
  const ndEnding = [2,22]
  const rdEnding = [3,23]
  if (stEnding.includes(num)) return 'st'
  if (ndEnding.includes(num)) return 'nd'
  if (rdEnding.includes(num)) return 'rd'
  return 'th'
}

const to2 = str => String(str).length === 2 ? str : `0${str}`
const keysToEnsure2Places = ['minutes']
const keysCanHave2Places = ['date', 'month']

export default {
  install: (Vue) => {
    Vue.prototype.$getTimeComponents = (ts) => {
      const date = new Date(ts)
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        shortMonth: MONTHS[date.getMonth()].short,
        longMonth: MONTHS[date.getMonth()].long,
        date: date.getDate(),
        dateEnding: getDateEnding(date.getDate()),
        longDate: date.getDate() + getDateEnding(date.getDate()),
        day: date.getDay(),
        hour: (date.getHours() + 12) % 12,
        meridian: date.getHours() < 12 ? 'am' : 'pm',
        minutes: date.getMinutes(),
        shortDay: DAYS[date.getDay()].short,
        longDay: DAYS[date.getDay()].long,
      }
    }
    Vue.prototype.$getMonthName = (num, long = true) => {
      return MONTHS[num][long ? 'long' : 'short']
    }
    Vue.prototype.$buildDate = function (ts, string, options = {}) {
      try {
        const comps = this.$getTimeComponents(ts)
        Object.keys(comps)
          .forEach(key => {
            let value = comps[key]
            if (keysToEnsure2Places.includes(key) || (options.to2 && keysCanHave2Places.includes(key))) {
              value = to2(value)
            }
            string = string.replace(`{${key}}`, value)
          })
        return string
      } catch (e) {
        console.error(e)
      }
    }
    Vue.prototype.$getSprintDatesString = function (sprint, numModules = 8) {
      const startDate = new Date(`${sprint.start_date} `)
      const endDate = Number(new Date(`${sprint.start_date} `)) + (numModules * sprint.pace * 1000 * 60 * 60 * 24) // 8 modules * pace * milliseconds in day
      return this.$buildDate(startDate, '{month}/{date}/{year}') + ' - ' + this.$buildDate(endDate, '{month}/{date}/{year}')
    }
    Vue.prototype.$getSprintEndDate = function (sprint, org) {
      const sprintTypes = [...(org.default_sprint_types || []), ...(this.org.sprint_types || [])]
      const type = sprintTypes.find(type => type.name === sprint.type.name) || {}
      const numModules = type.num_modules || 8
      const endDate = Number(new Date(`${sprint.start_date} `)) + (numModules * sprint.pace * 1000 * 60 * 60 * 24) // 8 modules * pace * milliseconds in day
      return this.$buildDate(endDate, '{year}-{month}-{date}', {to2: true})
    }
  }
}