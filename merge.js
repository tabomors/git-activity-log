#!/usr/bin/env node

const fs = require("fs");
const path = require('path');
const through = require("through2");
const CombinedStream = require("combined-stream");
const StreamArray = require("stream-json/streamers/StreamArray");
const concat = require("concat-stream");
const { argv } = require("yargs").array("logs");

// TODO: add error handling

// Read log files as a streams
const readStreams = argv.logs.map(fileName => fs.createReadStream(path.join(__dirname, fileName)))
// Combine them to one stream
const combinedStream = CombinedStream.create();
readStreams.forEach(readStream => {
  combinedStream.append(toJsonStream(readStream));
})

combinedStream.pipe(toJSON())
  .pipe(process.stdout)

function toJSON () {
  const objs = [];
  return through.obj(
    function(data, _, cb) {
      objs.push(data);
      cb(null, null);
    },
    function(cb) {
      this.push(JSON.stringify(objs));
      cb();
    }
  );
};


// const concatStream = concat(baz);

// function baz(data) {
//   console.log(JSON.parse(data, null, "\t"));
// }

function toJsonStream(x) {
  return x.pipe(StreamArray.withParser()).pipe(
    through.obj((data, _, next) => next(null, data.value))
  );
}
