#!/usr/bin/env node

const fs = require('fs');
const groupWorklog = require('./group-worklog');
const { argv } = require('yargs')
  .string('logsInput')
  .string('logsOutput')
  .string('taskPattern')
  .string('defaultTaskName')
  .string('taskNameTemplate');

const logs = JSON.parse(fs.readFileSync(argv.logsInput, 'utf-8'));

const res = groupWorklog(logs, argv.taskPattern, argv.defaultTaskName, argv.taskNameTemplate);

fs.writeFileSync(argv.logsOutput, JSON.stringify(res, null, '\t'));
