#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const through = require('through2');
const CombinedStream = require('combined-stream');
const StreamArray = require('stream-json/streamers/StreamArray');
const { argv } = require('yargs')
  .array('logsInput')
  .string('logsOutput');

// TODO: add error handling

console.log(
  '\x1b[36m%s\x1b[0m',
  `These logs will be merged: ${argv.logsInput.join(', ')}\n`
);

// Read log files as a streams
const readStreams = argv.logsInput.map(fileName => fs.createReadStream(path.resolve(__dirname, fileName)));
// Combine them to one stream
const combinedStream = CombinedStream.create();
readStreams.forEach((readStream) => {
  combinedStream.append(toJsonStream(readStream));
});

const writeStream = fs.createWriteStream(argv.logsOutput, { encoding: 'utf-8' });

combinedStream.pipe(toJSON())
  .pipe(writeStream);

function toJSON() {
  const objs = [];
  return through.obj(
    (data, _, cb) => {
      objs.push(data);
      cb(null, null);
    },
    function (cb) {
      this.push(JSON.stringify(objs));
      cb();
    },
  );
}

function toJsonStream(x) {
  return x.pipe(StreamArray.withParser()).pipe(
    through.obj((data, _, next) => next(null, data.value)),
  );
}
