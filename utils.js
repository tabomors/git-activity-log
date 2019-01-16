const fs = require('fs')
const R = require('ramda')
const { promisify } = require('util')
const dayjs = require('dayjs')

// fs

const readFileAsync = promisify(fs.readFile)

function readFilesAsync(fileNames, opts = { encoding: "utf-8" }) {
  return promiseSerial(R.map(fileName => readFileAsync(fileName, opts).catch(R.identity), fileNames))
}

// data

// TODO: think about better names for these functions

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

function fullPipeline(files) {
  return R.pipe(R.map(R.compose(processLogList, processLogFile)),
                R.flatten,
                sortLogsDataByDate,
                R.groupWith((a, b) => a.date === b.date),
                R.map(R.reduce((acc, logObj) => ({ date: logObj.date, messages: [...acc.messages || [], logObj.message] }), {})),
                )(files)
}

function sortLogsDataByDate(logsData) {
  return R.sort((a, b) => dayjs(a.date) - dayjs(b.date), logsData)
}

// other

function isDate(date) {
  if (!date) return false
  return dayjs(date).isValid()
}

function promiseSerial(promises) {
  return R.reduce((promiseAcc, promise) => promiseAcc
    .then(accData => promise
                      .then(data => [...accData, data])), Promise.resolve([]), promises)
}

// Taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

module.exports = { processLogFile, processLogList, isDate, readFilesAsync, promiseSerial, shuffle, sortLogsDataByDate, fullPipeline }