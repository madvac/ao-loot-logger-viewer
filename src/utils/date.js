import moment from 'moment'

export function strToDate(str) {
  const date = moment.utc(str, [
    'D/M/YYYY k:mm:ss',
    'M/D/YYYY k:mm:ss',
    'D.M.YYYY k:mm:ss',
    'M.D.YYYY k:mm:ss',
    'D.M.YYYY k.mm.ss',
    'M.D.YYYY k.mm.ss',
    'M.D.YYYY k:mm',
    moment.ISO_8601
  ])

  if (date.isValid()) {
    return date
  }

  const fallback = moment.utc(str)

  if (fallback.isValid()) {
    return fallback
  }

  console.error('Date format not recognized', str)

  return moment.utc()
}

export function dateToStr(date) {
  if (Object.isFrozen(date)) {
    return date
      .clone()
      .utc()
      .format('LLLL')
  }

  return date.utc().format('LLLL')
}
