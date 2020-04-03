const R = require('ramda');

// TODO: add tests!

const groupLogsByTicketPattern = (
  logs,
  taskPattern,
  defaultTicketName = '',
  taskNameTemplate = '{{ticket}}'
) => {
  return R.groupBy((message) => {
    const [, ticketName] = message.match(taskPattern) || [];

    return taskNameTemplate.replace(
      /{{[a-zA-Z0-9]+}}/g,
      ticketName || defaultTicketName
    );
  }, logs);
};

const groupLogsWithSameDate = (logs) =>
  R.groupWith((a, b) => a.date === b.date, logs);

const groupLogs = (
  logs,
  taskPattern,
  defaultTicketName = '',
  taskNameTemplate = '{{ticket}}'
) => {
  const logsGroupedByDate = groupLogsWithSameDate(logs);
  const res = logsGroupedByDate.reduce((acc, group) => {
    const date = group[0].date;

    return acc.concat({
      date,
      description: groupLogsByTicketPattern(
        group.map((x) => x.message),
        new RegExp(taskPattern),
        defaultTicketName,
        taskNameTemplate
      ),
    });
  }, []);
  return res;
};

module.exports = groupLogs;
