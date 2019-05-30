const dayjs = require('dayjs');

const INVALID_DATE = 'Invalid date';
const DAY_DURATION = 8;
const CALENDAR_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const START_HOUR = 11;

function updateEventDescription(event, additions) {
  const data = {
    ...event.data,
    description: `${event.data.description}\n${additions}`
  };
  return { ...event, data };
}

function workLogToEventFormat(workLog) {
  const startDate = dayjs(workLog.date).set('hour', START_HOUR);
  const endDate = dayjs(startDate).add(DAY_DURATION, 'hour');

  if (startDate === INVALID_DATE || endDate === INVALID_DATE) {
    throw new Error(`${workLog.date} is invalid date`);
  }

  return {
    summary: '',
    description: workLog.message,
    start: { dateTime: startDate.format(CALENDAR_DATE_FORMAT) },
    end: { dateTime: endDate.format(CALENDAR_DATE_FORMAT) }
  };
}

module.exports = {
  updateEventDescription,
  workLogToEventFormat
};
