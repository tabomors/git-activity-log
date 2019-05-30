#!/usr/bin/env node

const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const projects = JSON.parse(fs.readFileSync("./projects.json"));

const logsDir = path.join(__dirname, "logs");

shell.exec(`mkdir -p ${logsDir}`);

const logsToMerge = [];

for (const project of projects) {
  const { authors, pathDir, alias } = project;
  shell.cd(pathDir).exec("git fetch");
  shell.cd(__dirname);

  authors.forEach((author, i) => {
    const logPath = path.join(logsDir, `${alias}${i}.json`);
    const shellRes = shell
      .exec(`./report.js --path ${pathDir} --author ${author} --all true`)
      .to(logPath);

    if (shellRes.code !== 0) {
      shell.echo(shellRes.stderr);
      shell.exit(1);
    }

    logsToMerge.push(logPath);
  });
}

shell.exec(`./merge.js --logs ${logsToMerge.join(" ")}`);
