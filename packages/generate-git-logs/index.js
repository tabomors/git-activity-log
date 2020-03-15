#!/usr/bin/env node

const { argv } = require('yargs')
  .boolean('all')
  .string('author')
  .string('path');
const nanoid = require('nanoid');
const shell = require('shelljs');

const PARAMS_SEPARATOR = nanoid();
const LINES_SEPARATOR = nanoid();

const now = new Date();
const currentMonth = `0${now.getMonth() + 1}`.slice(-2);
const currentYear = now.getFullYear();
const startOfTheMonth = `01.${currentMonth}.${currentYear}`;

const logOptions = `--date=short --reverse ${
  argv.all ? '--all' : '--branches'
} --since=${startOfTheMonth} --author=${argv.author || ''}`;

const command = formatParams => `cd ${argv.path || '.'}
   git log --pretty=format:"${formatParams.join(
     PARAMS_SEPARATOR
   )}${LINES_SEPARATOR}" ${logOptions}`;

const log = (schema, processValue = (k, v) => v) => {
  const keys = Object.keys(schema);
  const formatParams = keys.map(key => schema[key]);

  const { code, stderr, stdout } = shell.exec(command(formatParams), { silent: true });

  if (code !== 0) {
    shell.echo(stderr);
    shell.exit(code);
  }

  const listOfLogs = stdout
    .split(LINES_SEPARATOR)
    .filter(line => line.length)
    .map(line =>
      line.split(PARAMS_SEPARATOR).reduce((obj, value, idx) => {
        const key = keys[idx];
        return { ...obj, [key]: processValue(key, value) };
      }, {})
    );

  return listOfLogs;
};

const SCHEMA = {
  date: '%ad',
  message: '%B',
  refs: '%D',
  authorName: '%an',
  authorEmail: '%ae'
};

const listOfLogs = log(SCHEMA, (k, v) => v.trim());

// TODO: add streams here
// Put logs to std output
console.log(JSON.stringify(listOfLogs, null, '\t'));
