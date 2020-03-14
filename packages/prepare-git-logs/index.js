#!/usr/bin/env node

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const { argv } = require('yargs')
  .string('logsDest')
  .string('projectsConfig');
const generateGitLogs = require.resolve('generate-git-logs');
const mergeGitLogs = require.resolve('merge-git-logs');

const projects = JSON.parse(fs.readFileSync(argv.projectsConfig));

const logsDir = argv.logsDest;

shell.exec(`mkdir -p ${logsDir}`);

const logsToMerge = [];

for (const project of projects) {
  const { authors, pathDir, alias } = project;

  authors.forEach(author => {
    const logPath = path.resolve(logsDir, `${alias}_${author}.json`);
    const shellRes = shell
      .exec(
        `${generateGitLogs} --path ${pathDir} --author ${author} --all true`
      )
      .to(logPath);

    if (shellRes.code !== 0) {
      shell.echo(shellRes.stderr);
      shell.exit(shellRes.code);
    }

    logsToMerge.push(logPath);
  });
}

shell.exec(
  `${mergeGitLogs} --logsInput ${logsToMerge.join(
    ' '
  )} --logsOutput ${path.join(argv.logsDest, 'worklog.json')}`
);
