const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readline = require("readline");
// TODO: move api to different module
const { google } = require("googleapis");
const dayjs = require("dayjs");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "credentials.json";

const CALENDAR_DATE_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";
const DATE_FORMAT = "YYYY-MM-DD";
const START_HOUR = 11;
const DAY_DURATION = 8;
const INVALID_DATE = "Invalid date";

const readFileAsync = promisify(fs.readFile);

function ask(rl, question) {
  return new Promise(resolve => {
    rl.question(question, input => resolve(input));
  });
}

// TODO: use argv to provide worlogsPath
const worlogsPath = path.join(__dirname, "logs", "worklogs.json");

async function main() {
  // TODO: add logging
  try {
    // debugger;
    // TODO: use stream for reading worklogs
    const worklogs = JSON.parse(fs.readFileSync(worlogsPath, "utf-8"));

    const credentials = JSON.parse(await readFileAsync(CREDENTIALS_PATH));
    const auth = await authorize(credentials);

    await clearEventsOfTheMonth(auth);

    const dates = {};

    for (const workLog of worklogs) {
      const { date } = workLog;
      const eventId = dates[date];
      const eventFormatWorklog = workLogToEventFormat(workLog);
      if (eventId) {
        const event = await getEvent(eventId, auth);
        const { data: updatedEventData } = updateEventDescription(
          event,
          eventFormatWorklog.description
        );
        const updateEventRes = await updateEvent(
          eventId,
          updatedEventData,
          auth
        );
        // console.log(`${eventId} was updated with`, updateEventRes);
      } else {
        const insertEventRes = await insertEvent(eventFormatWorklog, auth);
        // console.log(`${eventFormatWorklog} was added to calendar`);
        const { data: insertEventResData } = insertEventRes;
        // console.log("insertEventResData", insertEventResData);
        dates[date] = insertEventResData.id;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = JSON.parse(await readFileAsync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } catch (e) {
    return getAccessToken(oAuth2Client);
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const code = await ask(rl, "Enter the code from that page here: ");
  rl.close();

  return new Promise((res, rej) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return rej(Error(`Error retrieving access token. ${err.message}`));

      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      return res(oAuth2Client);
    });
  });
}

function insertEvent(eventData, auth) {
  const calendar = google.calendar({ version: "v3", auth });
  return calendar.events.insert({
    calendarId: "primary",
    resource: eventData
  });
}

function getEvent(eventId, auth) {
  const calendar = google.calendar({ version: "v3", auth });
  return calendar.events.get({ calendarId: "primary", eventId });
}

function updateEvent(eventId, eventData, auth) {
  console.log("");
  console.log("updateEvent", eventData);
  console.log();
  const calendar = google.calendar({ version: "v3", auth });
  return calendar.events.update({
    calendarId: "primary",
    eventId,
    resource: eventData
  });
}

function updateEventDescription(event, additions) {
  const data = {
    ...event.data,
    description: `${event.data.description}\n${additions}`
  };
  return { ...event, data };
}

function workLogToEventFormat(workLog) {
  const startDate = dayjs(workLog.date).set("hour", START_HOUR);
  const endDate = dayjs(startDate).add(DAY_DURATION, "hour");

  if (startDate === INVALID_DATE || endDate === INVALID_DATE) {
    throw new Error(`${workLog.date} is invalid date`);
  }

  return {
    summary: "",
    description: workLog.message,
    start: { dateTime: startDate.format(CALENDAR_DATE_FORMAT) },
    end: { dateTime: endDate.format(CALENDAR_DATE_FORMAT) }
  };
}

async function fetchEventsOfTheMonth(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const startOfTheMonth = dayjs()
    .startOf("month")
    .toISOString();
  const endOfTheMonth = dayjs()
    .startOf("month")
    .add(1, "month")
    .toISOString();
  return calendar.events
    .list({
      calendarId: "primary",
      timeMin: startOfTheMonth,
      timeMax: endOfTheMonth
    })
    .then(res => res.data.items);
}

function deleteEvent(auth, eventId) {
  const calendar = google.calendar({ version: "v3", auth });
  return calendar.events.delete({
    calendarId: "primary",
    eventId
  });
}

async function clearEventsOfTheMonth(auth) {
  const events = await fetchEventsOfTheMonth(auth);

  for (const { id: eventId } of events) {
    if (eventId) {
      const res = await deleteEvent(auth, eventId);
      console.log(`event ${eventId} was deleted`, res);
    }
  }
}

// Script starts from here
main();
