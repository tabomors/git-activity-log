const R = require('ramda')
const dayjs = require('dayjs')

function processLogFile(logFile, /* TODO: format separator? */) {
  return R.pipe(
    R.split('\n'),
    R.filter(R.identity),
    R.groupWith((_, b) => !isDate(R.split(':', b)[0])),
    R.map(x => R.join('\n', x))
  )(logFile)
}

function processLogList(logList) {
  const processFn = R.compose(
                      ([date, author, refs, message]) => ({ date, author, refs, message }), 
                      str => R.map(R.trim, R.split(':', str)))
  return R.map(processFn, logList)
}

function isDate(date) {
  if (!date) return false
  return dayjs(date).isValid()
}

module.exports = { processLogFile, processLogList, isDate }