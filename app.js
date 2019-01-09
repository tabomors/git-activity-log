const fs = require('fs')
const R = require('ramda')

fs.readFile('./barista.lib.log', {encoding: "utf-8"}, (err, data) => {
  if (err) {
    console.error(err)
  } else {
    // TODO: process text
  }
})
