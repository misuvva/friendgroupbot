const fs = require('fs/promises');
const { getData } = require('../dataChannelHandler');

const getSolarBirthdays = async (birthdays) => {
  const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
  const calendar = JSON.parse(calendarAsJsonString);
  const solarBirthdays = {};
  Object.keys(birthdays).forEach((partial) => {
    const gregorianString = birthdays[partial];
    const calendarKey = gregorianString.split('-').join('/');
    let birthDayOfMonth = Number(calendar[calendarKey].solar.split([' '])[1].slice(0, -1));
    solarBirthdays[partial] = { full: calendar[calendarKey].solar, birthDayOfMonth };
  });
  return solarBirthdays;
};

const getSolarString = async (guild, solar) => {
  const dataChannelData = await getData(guild);
  if (!dataChannelData) return;
  const { birthdays } = dataChannelData;
  const solarBirthdays = await getSolarBirthdays(birthdays);
  console.log({ solar }, 'DEVLOG'); // RMBL
  const solarDayOfMonth = Number(solar.split([' '])[1].slice(0, -1));
  console.log({ solarDayOfMonth }, 'DEVLOG'); // RMBL

};

module.exports = {
  getSolarString
};