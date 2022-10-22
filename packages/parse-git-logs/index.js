const { nanoid } = require('nanoid');
const shell = require('shelljs');

const PARAMS_SEPARATOR = `__ps:${nanoid()}__`;
const LINES_SEPARATOR = `__ls:${nanoid()}__`;

const now = new Date();
const currentMonth = `0${now.getMonth() + 1}`.slice(-2);
const currentYear = now.getFullYear();
const startOfTheMonth = `01.${currentMonth}.${currentYear}`;

const mapLogOptionsToGitLog = ({ author, all = true }) =>
  `--date=short --reverse ${
    all ? '--all' : '--branches'
  } --since=${startOfTheMonth} --author=${author}`;

const mapFormatParamsToGitLog = formatParams =>
  formatParams.map(x => x.value).join(PARAMS_SEPARATOR);

const command = (logParams, formatParams) => {
  const { path = '' } = logParams;
  return `cd ${path || '.'}
   git log --pretty=format:"${mapFormatParamsToGitLog(
     formatParams
   )}${LINES_SEPARATOR}" ${mapLogOptionsToGitLog(logParams)}`;
};

/**
 * Executes git log with pretty-format https://git-scm.com/docs/pretty-formats
 * Parses this format to machine readable list of logs
 * @param logParams object which represents log options of "git log" https://git-scm.com/docs/git-log
 * @param formatParams object which represents pretty-formats of "git log" https://git-scm.com/docs/pretty-formats
 * @param processValue function which executes to process a part of a commit. For example it can trim spaces in commit message
 */
const log = (logParams, formatParams, processValue = (k, v) => v) => {
  // NOTE: Add { silent: false } for verbose logging
  const { code, stderr, stdout } = shell.exec(command(logParams, formatParams), { silent: true });

  if (code !== 0) {
    shell.echo(stderr);
    shell.exit(code);
  }

  const listOfLogs = stdout
    .split(LINES_SEPARATOR)
    .filter(line => line.length)
    .map(line =>
      line.split(PARAMS_SEPARATOR).reduce((obj, value, idx) => {
        const { alias } = formatParams[idx];
        return { ...obj, [alias]: processValue(alias, value) };
      }, {})
    );

  return listOfLogs;
};

const DEFAULT_FORMAT_PARAMS = [
  {
    alias: 'date',
    value: '%ad'
  },
  {
    alias: 'message',
    value: '%B'
  },
  {
    alias: 'refs',
    value: '%D'
  },
  {
    alias: 'authorName',
    value: '%an'
  },
  {
    alias: 'authorEmail',
    value: '%ae'
  }
];

module.exports = {
  log,
  defaultFormatParams: DEFAULT_FORMAT_PARAMS
};
