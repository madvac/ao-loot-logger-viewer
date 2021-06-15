import moment from 'moment'

export function strToDate(str) {
  if (str.match(/\d+\/\d+\/\d+ \d+:\d+:\d+/)) {
    return moment.utc(str, 'M/D/YYYY k:mm:ss')
  }

  if (str.match(/\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z/)) {
    return moment.utc(str, moment.ISO_8601)
  }

  const date = moment(str)

  if (date.format() !== 'Invalid date') {
    return date
  }

  console.error('Date format not recognized', str)

  return moment.utc('')
}

export function dateToStr(date) {
  window.date = date

  if (Object.isFrozen(date)) {
    return date
      .clone()
      .utc()
      .format('LLLL')
  }

  return date.utc().format('LLLL')
}
