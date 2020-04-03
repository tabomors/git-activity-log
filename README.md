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

- `./packages/generate-git-logs/index.js --logsDest ./logs --projectsConfig ./projects.json`

It will generate json files with logs data

Merge logs if it is needed:

- `./packages/group-worklog/group-worklog-cli.js --logsInput ./logs/project_stas.morozevich@gmail.com.json ./logs/project1_stas.morozevich@gmail.com.json --logsOutput ./logs/worklog.json`

It will merge logs in one file

### Grouping:

`./packages/group-worklog/index.js --logsInput ./logs/log.json --logsOutput ./logs/foo.json --taskPattern '^.*(KEK-\d\d?\d?\d?).*' --defaultTaskName 'KEK-106' --taskNameTemplate '{{ticket}} (https://jira.kek.com/browse/{{ticket}})'`


## TODO:

- You have to enable the GoogleCalendar APi. Go to https://developers.google.com/calendar/quickstart/nodejs and press "Enable the Google Calendar API" button. Then put generated `credentials.json` to the root directory

- `./google/googleCalendarWorklogToEventsCli.js`

P.S For now i support only Google Calendar
