#!/usr/bin/env node

// TODO: remove these eslint-disable rules
/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const googleApiAuth = require('./google/googleApiAuth');
const googleCalendarEventsApi = require('./google/googleCalendarEventsApi');
const googleCalendarEventsUtils = require('./google/googleCalendarEventsUtils');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// TODO: use argv to provide these variables
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json'; // it is optional
const worlogsPath = path.join(__dirname, 'logs', 'worklogs.json');

async function main() {
  try {
    // TODO: use stream for reading worklogs
    const worklogs = JSON.parse(fs.readFileSync(worlogsPath, 'utf-8'));

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const auth = await authorize(credentials);
    const calendar = googleCalendarEventsApi.initCalendar(auth);

    await googleCalendarEventsApi.clearEventsOfTheMonth(calendar);

    const dates = {};

    for (const workLog of worklogs) {
      const { date } = workLog;
      const eventId = dates[date];
      const eventFormatWorklog = googleCalendarEventsUtils.workLogToEventFormat(workLog);
      if (eventId) {
        console.log(`Updating existing event: ${eventId}`);
        const event = await googleCalendarEventsApi.getEvent(calendar, eventId);
        const { data: updatedEventData } = googleCalendarEventsUtils.updateEventDescription(
          event,
          eventFormatWorklog.description,
        );
        await googleCalendarEventsApi.updateEvent(
          calendar,
          eventId,
          updatedEventData,
        );
      } else {
        console.log('Inserting new event');
        const insertEventRes = await googleCalendarEventsApi
          .insertEvent(calendar, eventFormatWorklog);
        const { data: insertEventResData } = insertEventRes;
        dates[date] = insertEventResData.id;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = googleApiAuth.makeOAuth2Client(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  try {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } catch (e) {
    const authUrl = googleApiAuth.generateAuthUrl(oAuth2Client, SCOPES);
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((res, rej) => {
      rl.question('Enter the code from that page here: ', async (code) => {
        try {
          const { tokens } = await googleApiAuth.getClientsToken(oAuth2Client, code);
          oAuth2Client.setCredentials(tokens);
          fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), (err) => {
            if (err) console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
          return res(oAuth2Client);
        } catch (err) {
          return rej(Error(`Error retrieving access token. ${err.message}`));
        } finally {
          rl.close();
        }
      });
    });
  }
}

// Script starts from here
main();
