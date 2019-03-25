/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { google } = require('googleapis');
const dayjs = require('dayjs');

function initCalendar(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  return calendar;
}

function deleteEvent(calendar, eventId) {
  return calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}

function fetchEventsOfTheMonth(calendar) {
  const startOfTheMonth = dayjs()
    .startOf('month')
    .toISOString();
  const endOfTheMonth = dayjs()
    .startOf('month')
    .add(1, 'month')
    .toISOString();
  return calendar.events
    .list({
      calendarId: 'primary',
      timeMin: startOfTheMonth,
      timeMax: endOfTheMonth,
    })
    .then(res => res.data.items);
}

async function clearEventsOfTheMonth(calendar) {
  const events = await fetchEventsOfTheMonth(calendar);

  for (const { id: eventId } of events) {
    if (eventId) {
      await deleteEvent(calendar, eventId);
      console.log(`event ${eventId} was deleted`);
    }
  }
}

function updateEvent(calendar, eventId, eventData) {
  return calendar.events.update({
    calendarId: 'primary',
    eventId,
    resource: eventData,
  });
}

function insertEvent(calendar, eventData) {
  return calendar.events.insert({
    calendarId: 'primary',
    resource: eventData,
  });
}

function getEvent(calendar, eventId) {
  return calendar.events.get({ calendarId: 'primary', eventId });
}

module.exports = {
  initCalendar,
  getEvent,
  insertEvent,
  updateEvent,
  clearEventsOfTheMonth,
};
