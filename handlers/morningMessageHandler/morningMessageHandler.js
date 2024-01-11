const { DateTime } = require('luxon');

const fs = require('fs/promises');
const { sendConversationUpdate } = require('../conversationHandler/conversationHandler');
const { getSolarString } = require('./getSolarString');
const { createCommand } = require('../../commands');
const { getData } = require('../dataChannelHandler');

const hourInMs = 1000 * 60 * 60;

async function morningMessageHandler(now, guild, channel) {
  const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
  const calendar = JSON.parse(calendarAsJsonString);
  const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
  const { solar, gregorian } = calendar[dateKeyGregorian];
  const gregorianString = DateTime.fromFormat(gregorian, 'cccc, MMM dd, yyyy').toFormat('cccc, MMMM d, yyyy');
  let solarString;
  solarString = await getSolarString(guild, solar);
  console.log({ solarString }, 'DEVLOG'); // RMBL
  return;

  const activeThreads = guild.channels.cache
    .filter((channel) => channel.isThread())
    .filter((thread) => !thread.archived);
  const threadsForThreadsMessage = [];
  const forumPostsForThreadsMessage = [];

  await Promise.all(activeThreads.map(async (thread) => {
    const lastMessage = (await thread.messages.fetch({ limit: 1 })).first();
    const numberOfMillisecondsInADay = 60 * 60 * 24 * 1000;
    const millisecondsSinceLastMessage = Date.now() - lastMessage.createdTimestamp;
    if ((millisecondsSinceLastMessage) <= numberOfMillisecondsInADay) {
      if (thread.parent === null) {
        forumPostsForThreadsMessage.push(thread);
      } else if (thread.name !== 'Edit history') {
        threadsForThreadsMessage.push(thread);
      }
    }
  }));

  const makeThreadLine = (separator = '🧵') => (thread, index) => {
    if (index % 1 === 0) {
      return `\n    ${thread}`;
    }
    return ` ${separator} ${thread}`;
  };

  forumPostsForThreadsMessage.sort((a, b) => {
    if (!b.name.includes('[')) return -1;
    if (!a.name.includes('[')) { return 1; }
    const aDateString = a.name.split(' ')[0].slice(1, a.name.split(' ')[0].length - 1);
    const bDateString = b.name.split(' ')[0].slice(1, b.name.split(' ')[0].length - 1);
    if (aDateString === bDateString) { return 1; }
    if (aDateString.includes('?')) { return 1; }
    if (bDateString.includes('?')) { return -1; }
    const aDate = DateTime.fromFormat(aDateString, 'M-d');
    const bDate = DateTime.fromFormat(bDateString, 'M-d');
    if (aDate.toMillis() < bDate.toMillis()) { return -1; }
    return 1;
  });

  const threadsMessage = `\n\n**Active Threads:**${threadsForThreadsMessage.map(makeThreadLine()).join('')}`;
  const eventsMessage = `\n\n**Active Events:**${forumPostsForThreadsMessage.map(makeThreadLine('🎉')).join('')}`;
  const calendarString = 'Good morning! Today is'
    + `\n${solarString}`
    + `\n🇻🇦 *(${gregorianString})*`;
  await channel.send({ content: calendarString });
  await channel.send({ content: threadsMessage });
  await channel.send({ content: eventsMessage });
  await sendConversationUpdate(guild, channel);
}

const setupMorningMessageCommands = async (guild) => {
  await createCommand(guild, {
    name: 'send-daily-message',
    description: 'Send the daily morning message in the current channel',
    execute: (interaction) => {
      const now = DateTime.now().setZone('UTC-7');
      morningMessageHandler(now, guild, interaction.channel);
      interaction.reply({ content: 'Morning message sent!', ephemeral: true });
    }
  });
  await createCommand(guild, {
    name: 'send-solar-string',
    description: 'Test command to send the morning message solar calendar text',
    execute: async (interaction) => {
      try {
        // eslint-disable-next-line no-underscore-dangle
        const offset = interaction.options.getInteger('offset');
        const now = DateTime.now().plus({ days: offset });
        const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
        const calendar = JSON.parse(calendarAsJsonString);
        const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
        const { solar } = calendar[dateKeyGregorian];
        let solarString = getSolarString(solar, guild);
        interaction.reply({ content: solarString, ephemeral: true });
      } catch (error) {
        console.error(error);
      }
    },
    options: [
      {
        name: 'offset',
        description: 'number to add to the day',
        type: 4,
        required: false
      }
    ]
  });
};

const runMorningMessageLoop = async (guild) => {
  const dataChannelData = await getData(guild);
  if (!dataChannelData) return;
  const { dailyMessagesSettings: settings } = dataChannelData;
  console.log({ settings }, 'DEVLOG'); // RMBL
  const inner = () => {
    const channel = guild.channels.cache.find((channel) => channel.name.includes(settings.channelPartial));
    if (channel) {
      const now = DateTime.now().setZone('America/Los_Angeles');
      morningMessageHandler(now, guild, channel);
      // if (now.hour === 2) {
      //   morningMessageHandler(now, guild, channel);
      // }
      // check if now is anywhere between 3am and 3:59am
    }
  };
  if (settings.isEnabled) {
    inner();
    setInterval(inner, hourInMs);
  }
};

module.exports = {
  morningMessageHandler,
  setupMorningMessageCommands,
  runMorningMessageLoop
};