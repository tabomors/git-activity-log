# Git commits -> your worklog report

The goal was to split the logic of extracting commits, merging commits, and making work log from commits then pushing work logs to some different places (for example Google Calendar). I personally use this repo to upload my work logs to Google Calendar.

!!!This repo is under development!!!

## Pre-requirements:

You should create `project.json` file with following structure:

```
[
  {
    "name": "Porject1",
    "alias": "project",
    "pathDir": "/path/to/your/project",
    "authors": [
      "stas.morozevich@gmail.com"
    ]
  },
  {
    "name": "Porject2",
    "alias": "project1",
    "pathDir": "/path/to/your/project",
    "authors": [
      "stas.morozevich@gmail.com"
    ]
  }
]
```

## Example of usage:

- `npm i`
- `./packages/prepare-git-logs/index.js --logsDest ./logs --projectsConfig . /projects.json`

It generates jsons with logs data

## TODO:

- You have to enable the GoogleCalendar APi. Go to https://developers.google.com/calendar/quickstart/nodejs and press "Enable the Google Calendar API" button. Then put generated `credentials.json` to the root directory

- `./google/googleCalendarWorklogToEventsCli.js`

P.S For now i support only Google Calendar
