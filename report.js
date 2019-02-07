#!/usr/bin/env node

const { exec } = require("child_process");
const crypto = require("crypto");
const { argv } = require("yargs").boolean("all");

const PARAMS_SEPARATOR = `__ps${crypto.randomBytes(36).toString("hex")}__`;
const LINES_SEPARATOR = `__ls${crypto.randomBytes(36).toString("hex")}__`;

const now = new Date();
const currentMonth = `0${now.getMonth() + 1}`.slice(-2);
const currentYear = now.getFullYear();
const startOfTheMonth = `01.${currentMonth}.${currentYear}`;

const logOptions = `--date=short --reverse ${
  argv.all ? "--all" : "--branches"
} --since=${startOfTheMonth} --author=${argv.author || ""}`;

const command = formatParams =>
  `cd ${argv.path || "."}
   git log --pretty=format:"${formatParams.join(
     PARAMS_SEPARATOR
   )}${LINES_SEPARATOR}" ${logOptions}`;

const log = (schema, proccessValue = (k, v) => v) =>
  new Promise((resolve, reject) => {
    const keys = Object.keys(schema);
    const formatParams = keys.map(key => schema[key]);

    exec(command(formatParams), (err, stdout) => {
      if (err) reject(err);
      else {
        const listOfLogs = stdout
          .split(LINES_SEPARATOR)
          .filter(line => line.length)
          .map(line =>
            line.split(PARAMS_SEPARATOR).reduce((obj, value, idx) => {
              const key = keys[idx];
              return { ...obj, [key]: proccessValue(key, value) };
            }, {})
          );
        resolve(JSON.stringify(listOfLogs, null, "\t"));
      }
    });
  });

const SCHEMA = { date: "%ad", message: "%B", refs: "%d", author: "%an" };

log(SCHEMA, (k, v) => v.trim())
  .then(console.log)
  .catch(console.error);
