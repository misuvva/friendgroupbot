const { DateTime } = require('luxon');

const fs = require('fs/promises');
const { getSolarString } = require('../../utils/utils');
const { sendConversationUpdate } = require('../conversationHandler/conversationHandler');
const { createCommand } = require('../../commands');
const { generateRelationship } = require('../../generators/relationshipGenerator');

async function morningMessageHandler(now, guild, channel) {
  const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
  const calendar = JSON.parse(calendarAsJsonString);
  const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
  const { solar, gregorian, gourmand } = calendar[dateKeyGregorian];
  const gregorianString = DateTime.fromFormat(gregorian, 'cccc, MMM dd, yyyy').toFormat('cccc, MMMM d, yyyy');
  let solarString;
  solarString = getSolarString(solar, guild);

  const makeGourmandString = (gourmand) => {
    const components = gourmand.split(',');
    return `${components[0]},${components[1]}`;
  };

  const gourmandString = makeGourmandString(gourmand);
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
  const relationshipMessage = generateRelationship(guild);
  const calendarString = 'Good morning! Today is'
    + `\n${solarString}`
    + `\n🍽️ ${gourmandString}`
    + `\n🇻🇦 *(${gregorianString})*`;
  await channel.send({ content: calendarString });
  await channel.send({ content: threadsMessage });
  await channel.send({ content: eventsMessage });
  await channel.send({ content: relationshipMessage });
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

module.exports = {
  morningMessageHandler,
  setupMorningMessageCommands
};