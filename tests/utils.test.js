const R = require('ramda')
const utils = require('../utils')

const fileContent = `
2018-12-12:John Doe: (origin/foo, foo):Lorem Ipsum is simply dummy text

2018-12-14:John Doe: (origin/bar, bar):Lorem Ipsum has been the industry's standard dummy text ever since the 1500s

2018-12-18:John Doe: (origin/baz, baz):Contrary to popular belief

2018-12-28:John Doe::It is a long established fact

The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here'

2018-12-28:John Doe::There are many variations of passages of Lorem Ipsum available

2018-12-28:John Doe::Lorem ipsum dolor sit amet

Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua

2018-12-28:John Doe: (HEAD -> qux, origin/qux):Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium
`

const arrOfLogs = ['2018-12-12:John Doe: (origin/foo, foo):Lorem Ipsum is simply dummy text',
                   '2018-12-14:John Doe: (origin/bar, bar):Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
                   '2018-12-18:John Doe: (origin/baz, baz):Contrary to popular belief',
                   '2018-12-28:John Doe::It is a long established fact\nThe point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\'',
                   '2018-12-28:John Doe::There are many variations of passages of Lorem Ipsum available',
                   '2018-12-28:John Doe::Lorem ipsum dolor sit amet\nConsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
                   '2018-12-28:John Doe: (HEAD -> qux, origin/qux):Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium']

test('transforms file to array of logs', () => {
  const expected = arrOfLogs
  const actual = utils.processLogFile(fileContent)
  expect(actual).toEqual(expected);
})

test('transforms array of log strings to object with date, author, refs, message', () => {
  const expected = [{
    date: '2018-12-12',
    author: 'John Doe',
    refs: '(origin/foo, foo)',
    message: 'Lorem Ipsum is simply dummy text'
  },
  {
    date: '2018-12-14',
    author: 'John Doe',
    refs: '(origin/bar, bar)',
    message:
      'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s'
  },
  {
    date: '2018-12-18',
    author: 'John Doe',
    refs: '(origin/baz, baz)',
    message: 'Contrary to popular belief'
  },
  {
    date: '2018-12-28',
    author: 'John Doe',
    refs: '',
    message:
      'It is a long established fact\nThe point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\''
  },
  {
    date: '2018-12-28',
    author: 'John Doe',
    refs: '',
    message:
      'There are many variations of passages of Lorem Ipsum available'
  },
  {
    date: '2018-12-28',
    author: 'John Doe',
    refs: '',
    message:
      'Lorem ipsum dolor sit amet\nConsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
  },
  {
    date: '2018-12-28',
    author: 'John Doe',
    refs: '(HEAD -> qux, origin/qux)',
    message:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium'
  }]
  const actual = utils.processLogList(arrOfLogs)

  expect(actual).toEqual(expected)
})
// TODO: add more test cases

test('sorts logs by dates', () => {
  const shuffledArrOfLogsData = [{ date: '2018-12-12' },
                                 { date: '2018-12-28' },
                                 { date: '2018-12-14' }, 
                                 { date: '2018-12-28' },
                                 { date: '2018-12-18' },
                                 { date: '2018-12-28' },
                                 { date: '2018-12-28' }]
  
  // TODO: add prettier
  const expected = [{
    date: '2018-12-12',
  },
  {
    date: '2018-12-14',
  },
  {
    date: '2018-12-18',
  },
  {
    date: '2018-12-28',
  },
  {
    date: '2018-12-28',
  },
  {
    date: '2018-12-28',
  },
  {
    date: '2018-12-28',
  }]

  const actual = utils.sortLogsDataByDate(shuffledArrOfLogsData)

  expect(actual).toEqual(expected)
})

test('File content -> array of objects { date, messages } full pipline', () => {
  const fileContent = `
    2018-12-12:John Doe: (origin/foo, foo):Lorem Ipsum is simply dummy text

    2018-12-14:John Doe: (origin/bar, bar):Lorem Ipsum has been the industry's standard dummy text ever since the 1500s

    2018-12-18:John Doe: (origin/baz, baz):Contrary to popular belief
  `

  const fileContent1 = `
    2018-12-12:John Doe: (origin/foo, foo):[1] Lorem Ipsum is simply dummy text

    2018-12-14:John Doe: (origin/bar, bar):[1] Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
  `

  const expected = [{
      date: '2018-12-12',
      messages: ['Lorem Ipsum is simply dummy text',
                 '[1] Lorem Ipsum is simply dummy text']
    },
    {
      date: '2018-12-14',
      messages: ['Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
        '[1] Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s']
    },
    {
      date: '2018-12-18',
      messages: ['Contrary to popular belief']
    }]

  const actual = utils.fullPipeline([fileContent, fileContent1])
  expect(actual).toEqual(expected)

})