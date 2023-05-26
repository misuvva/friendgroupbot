/* eslint-disable no-param-reassign */
const { DateTime } = require('luxon');
const fs = require('fs/promises');

const gourmandOrdinalDates = [
  '1st',
  '2nd',
  '3rd', 
  '4th', 
  '5th', 
  '6th', 
  '7th', 
  '8th', 
  '9th', 
  '10th', 
  '11th', 
  '12th', 
  '13th', 
  '14th', 
  '15th', 
  '16th', 
  '17th', 
  '18th', 
  '19th', 
  '20th',
  '21st',
  '22nd',
  '23rd', 
  '24th', 
  '25th', 
  '26th', 
  '27th', 
  '28th', 
];

const gourmandSeasons = [
  'Falter',
  'Falter',
  'Falter',
  'Falter',
  'Winter',
  'Winter',
  'Winter',
  'Winter',
  'Winter',
  'Wing',
  'Wing',
  'Wing',
  'Wing'
];

const gourmandMonths = [
  // Falter
  'Craving',
  'Creeping',
  'Waiting',
  'Reaping',
  // Winter
  'Taking',
  'Boiling',
  'Feasting',
  'Spoils',
  'Holding',
  // Wing
  'Keeping',
  'Forward',
  'Strength',
  'Horrid',
];

const gourmandDaysOfTheWeek = [
  'SU',
  'MO',
  'TU',
  'WE',
  'TH',
  'FR',
  'SA'
];

const formatGourmandDate = (date) => {
  // Horrid 24th, Y-20, TU
  if (date.feastDayIndex !== null) {
    return `Y${date.year}, ${gourmandOrdinalDates[date.feastDayIndex]} Feast Day`;
  }
  const season = gourmandSeasons[date.monthIndex];
  const month = gourmandMonths[date.monthIndex];
  const ordinalDate = gourmandOrdinalDates[date.dateIndex];
  const dayOfTheWeek = gourmandDaysOfTheWeek[date.dayOfWeekIndex];
  return `${season} ${month} ${ordinalDate}, Y${date.year}, ${dayOfTheWeek}`;
};

const doFeastDaysStartNextDay = (date) => date.dateIndex === 13 && date.monthIndex === 6 && date.year % 4 === 0;

const iterateGourmandDate = (date) => {
  if (doFeastDaysStartNextDay(date) && date.feastDayIndex === null) {
    // console.log('A', date, 'DEVLOG'); // RMBL
    date.feastDayIndex = 0;
    return;
  }

  if (date.feastDayIndex !== null) {
    // console.log('B', date, 'DEVLOG'); // RMBL
    if (date.feastDayIndex === 4) {
      // console.log('C', date, 'DEVLOG'); // RMBL
      date.feastDayIndex = null;
    } else {
      // console.log('D', date, 'DEVLOG'); // RMBL
      date.feastDayIndex += 1;
      return;
    }
  }

  date.dateIndex += 1;
  date.dayOfWeekIndex += 1;
  if (date.dayOfWeekIndex === 7) {
    date.dayOfWeekIndex = 0;
  }
  if (date.dateIndex === 28) {
    date.dateIndex = 0;
    date.monthIndex += 1;
  }
  if (date.monthIndex === 13) {
    date.monthIndex = 0;
    date.year += 1;
  }
};

const generateGourmandCalendar = async () => {
  const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
  const calendar = JSON.parse(calendarAsJsonString);
  const dateCounterGourmand = {
    monthIndex: 12,
    dateIndex: 23,
    dayOfWeekIndex: 2,
    year: -20,
    feastDayIndex: null
  };
  // let dateCounterGregorian = DateTime.fromFormat(Object.keys(calendar)[0], 'MM/dd/yyyy');
  /* the first day in calendar.json is the summer
   * solstice, june 24th 1980, because that's solar july 1 Y-19
   * in gourmand, that's Tuesday, Horrid 24th, Y-20
  */

  Object.keys(calendar).forEach((key) => {
    const gourmandDate = formatGourmandDate(dateCounterGourmand);
    calendar[key]['gourmand'] = gourmandDate;
    iterateGourmandDate(dateCounterGourmand);
    if (dateCounterGourmand.feastDayIndex !== null) console.log({ dateCounterGourmand }, 'DEVLOG'); // RMBL
  });
  fs.writeFile('./calendar.json', JSON.stringify(calendar));
};

generateGourmandCalendar();