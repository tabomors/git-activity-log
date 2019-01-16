const fs = require('fs')
const R = require('ramda')

const utils = require('./utils') 

const files = ['./foo.log', './foo1.log']

utils.readFilesAsync(files)
  .then(utils.fullPipeline)
  .then(x => console.log(JSON.stringify(x, null, '\t')))
 
