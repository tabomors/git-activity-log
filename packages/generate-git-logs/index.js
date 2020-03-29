#!/usr/bin/env node

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const { argv } = require('yargs')
  .string('logsDest')
  .string('projectsConfig');
const { log, defaultFormatParams } = require('parse-git-logs');

const projects = JSON.parse(fs.readFileSync(argv.projectsConfig));

const logsDir = argv.logsDest;

shell.exec(`mkdir -p ${logsDir}`);

for (const project of projects) {
  const { authors, pathDir, alias } = project;

  authors.forEach(author => {
    const logPath = path.resolve(logsDir, `${alias}_${author}.json`);
    const listOfLogs = log(
      { all: true, path: pathDir, author },
      defaultFormatParams,
      (_, v) => v.trim()
    );

    fs.writeFileSync(logPath, JSON.stringify(listOfLogs, null, '\t'));
  });
}

