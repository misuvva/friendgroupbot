/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-template */
import fs from 'fs/promises';
import _ from 'lodash';
import { Guild } from 'discord.js';
import { getData } from '../dataChannelHandler';
import { getNameAndHeartFromPartial, joinWithAnds, surround } from '../../utils/utils';

const getSolarBirthdays = async (birthdays: Record<string, string>) => {
  const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
  const calendar = JSON.parse(calendarAsJsonString);
  const solarBirthdays: Record<string, { full: string, birthDayOfMonth: number }> = {};
  Object.keys(birthdays).forEach((partial) => {
    const gregorianString = birthdays[partial];
    const calendarKey = gregorianString.split('-').join('/');
    let birthDayOfMonth = Number(calendar[calendarKey].solar.split([' '])[1].slice(0, -1));
    solarBirthdays[partial] = { full: calendar[calendarKey].solar, birthDayOfMonth };
  });
  return solarBirthdays;
};

const getSolarSeason = (month: string, day: number) => {
  let firstPart;
  switch (month) {
    case 'July':
      firstPart = day <= 15 ? '💥🌞Summer Bursting🌞💥' : '🌴🌞Summer in Repose🌞🌴';
      break;
    case 'August':
      firstPart = day <= 15 ? '💤🌞Summer Sleeping🌞💤' : '👂🍁Autumn Calling🍁👂';
      break;
    case 'September':
      firstPart = day <= 15 ? '🍃🍁Autumn in Flight🍁🍃' : '🕸️🍁Autumn in Vain🍁🕸️';
      break;
    case 'October':
      firstPart = day <= 15 ? '⚡️🍁Autumn Falling🍁⚡️' : '🌚🍁Autumn in Mourning🍁🌚';
      break;
    case 'November':
      firstPart = day <= 15 ? '🌈🍁Autumn in Memory🍁🌈' : '👁️❄️Winter Awake❄️👁️';
      break;
    case 'December':
      firstPart = day <= 15 ? '🏔️❄️Winter Alone❄️🏔️' : '🎶❄️Winter Harmonic❄️🎶';
      break;
    case 'January':
      firstPart = day <= 15 ? '🎊❄️Winter in Chorus❄️🎊' : '🥀❄️Winter in Reprise❄️🥀';
      break;
    case 'February':
      firstPart = day <= 15 ? '⭐️❄️Winter All-Aglow❄️⭐️' : '🌱🌼Spring in Quiet🌼🌱';
      break;
    case 'March':
      firstPart = day <= 15 ? '🐝🌼Spring Bittersweet🌼🐝' : '🌿🌼Spring in Bloom🌼🌿';
      break;
    case 'April':
      firstPart = day <= 15 ? '💐🌼Spring Overflowing🌼💐' : '🕊️🌼Spring Coming Home🌼🕊';
      break;
    case 'May':
      firstPart = day <= 15 ? '🚪🌼Spring At-the-door🌼🚪' : '👁️🌞Summer Waking🌞👁️';
      break;
    case 'June':
      firstPart = day <= 15 ? '🎶🌞Summer Singing🌞🎶' : '🎺🌞Summer in Glory🌞🎺';
      break;
    default:
      break;
  }

  return `**${firstPart}**`;
};

const getBirthdaysOnDayOfMonth = (birthdays: Record<string, { full: string, birthDayOfMonth: number }>, dayOfMonth: number) => Object.entries(birthdays)
  .filter(([, { birthDayOfMonth }]) => birthDayOfMonth === dayOfMonth);

export const getSolarString = async (guild: Guild, solar: string, check = false) => {
  const dataChannelData = await getData(guild);
  if (!dataChannelData) return;
  const { birthdays } = dataChannelData;
  const allSolarBirthdays = await getSolarBirthdays(birthdays);
  const solarDayOfMonth = Number(solar.split(' ')[1].slice(0, -1));

  const birthdaysToday = getBirthdaysOnDayOfMonth(allSolarBirthdays, solarDayOfMonth);

  let currentBirthdayString = '';
  let isCurrentBirthday = false;

  if (birthdaysToday.length) {
    isCurrentBirthday = true;
    let names: string[] = [];
    let hearts: string[] = [];
    for (let i = 0; i < birthdaysToday.length; i++) {
      const [partial] = birthdaysToday[i];
      const { heart, mention } = await getNameAndHeartFromPartial(guild, partial);
      names.push(mention.toString()); // mention is Role, toString gives mention string
      hearts.push(heart);
    }
    if (names.length) {
      const namesString = joinWithAnds(_.shuffle(names));
      currentBirthdayString = `${surround(namesString, _.shuffle(hearts))}'s day!`;
    }
  }

  currentBirthdayString += '\n';

  let upcomingBirthaysString = '**';
  const upcomingBirthdaysThreshold = 6;
  let isUpcomingBirthdays = false;
  for (let i = 1; i <= upcomingBirthdaysThreshold; i++) {
    let futureDayOfMonth = solarDayOfMonth + i;
    if (solarDayOfMonth + i > 30) {
      futureDayOfMonth -= 30;
    }
    const birthdaysOnThisDay = getBirthdaysOnDayOfMonth(allSolarBirthdays, futureDayOfMonth);
    for (let j = 0; j < birthdaysOnThisDay.length; j++) { // Changed i to j to avoid shadowing
      if (birthdaysOnThisDay[j]) isUpcomingBirthdays = true;
      const [partial] = birthdaysOnThisDay[j];
      const { heart } = await getNameAndHeartFromPartial(guild, partial);
      upcomingBirthaysString += heart;
    }
    if (!birthdaysOnThisDay.length) upcomingBirthaysString += '-';
    if (i < upcomingBirthdaysThreshold) upcomingBirthaysString += '|';
  }
  upcomingBirthaysString += '** \n';

  const month = solar.split(',')[0].split(' ')[0];
  const solarSeason = getSolarSeason(month, solarDayOfMonth);

  const solarString = (isCurrentBirthday ? currentBirthdayString : '')
    + (isUpcomingBirthdays ? upcomingBirthaysString : '')
    + '☀️ ' + solar
    + '\n'
    + solarSeason;

  if (check) return isCurrentBirthday;

  return solarString;
};
