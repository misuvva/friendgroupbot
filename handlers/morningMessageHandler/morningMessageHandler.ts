/* eslint-disable prefer-template */
import { DateTime } from 'luxon';
import fs from 'fs/promises';
import { Guild, TextChannel, ThreadChannel, CommandInteraction } from 'discord.js';
import { getSolarString } from './getSolarString';
import { getData } from '../dataChannelHandler';

const hourInMs = 1000 * 60 * 60;

export async function morningMessageHandler(now: DateTime, guild: Guild, channel: TextChannel, dataChannelData: any) {
  const { dailyMessagesSettings: settings } = dataChannelData;

  const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
  const calendar = JSON.parse(calendarAsJsonString);
  const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
  const { solar, gregorian } = calendar[dateKeyGregorian];
  const gregorianString = DateTime.fromFormat(gregorian, 'cccc, MMM dd, yyyy').toFormat('cccc, MMMM d, yyyy');

  if (settings.onlyOnBirthdays) {
    const isCurrentOrUpcomingBirthday = await getSolarString(guild, solar, true);
    if (!isCurrentOrUpcomingBirthday) return;
  }

  let solarString;
  solarString = await getSolarString(guild, solar);

  const activeThreads = guild.channels.cache
    .filter((channel) => channel.isThread())
    .filter((thread) => !(thread as ThreadChannel).archived) as unknown as ThreadChannel[]; // Force type

  const threadsForThreadsMessage: ThreadChannel[] = [];
  const forumPostsForThreadsMessage: ThreadChannel[] = [];

  await Promise.all(activeThreads.map(async (thread) => {
    const lastMessage = (await thread.messages.fetch({ limit: 1 })).first();
    if (!lastMessage) return;
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

  const makeThreadLine = (separator = '🧵') => (thread: ThreadChannel, index: number) => {
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
  if (threadsForThreadsMessage.length) {
    await channel.send({ content: threadsMessage });
  }
  if (forumPostsForThreadsMessage.length) {
    await channel.send({ content: eventsMessage });
  }
}

export const setupMorningMessageCommands = async (guild: Guild, createCommand: any) => {
  await createCommand(guild, {
    name: 'send-daily-message',
    description: 'Send the daily morning message in the current channel',
    execute: async (interaction: CommandInteraction) => {
      const { guild } = interaction;
      if (!guild) return;
      const offset = interaction.options.getInteger('offset') || 0;
      const now = DateTime.now().setZone('UTC-7').plus({ days: offset });
      const dataChannelData = await getData(guild);
      if (interaction.channel instanceof TextChannel) {
        morningMessageHandler(now, guild, interaction.channel, dataChannelData);
      }
      interaction.reply({ content: 'Morning message sent!', ephemeral: true });
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
  await createCommand(guild, {
    name: 'send-solar-string',
    description: 'Test command to send the morning message solar calendar text',
    execute: async (interaction: CommandInteraction) => {
      try {
        const { guild } = interaction;
        if (!guild) return;
        const offset = interaction.options.getInteger('offset') || 0;
        const now = DateTime.now().plus({ days: offset });
        const calendarAsJsonString = await fs.readFile('./calendar.json', { encoding: 'utf8' });
        const calendar = JSON.parse(calendarAsJsonString);
        const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
        const { solar } = calendar[dateKeyGregorian];
        let solarString = await getSolarString(guild, solar);
        if (typeof solarString === 'string') {
          interaction.reply({ content: solarString, ephemeral: true });
        } else {
          interaction.reply({ content: 'Could not get solar string', ephemeral: true });
        }
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

export const runMorningMessageLoop = async (guild: Guild) => {
  const dataChannelData = await getData(guild);
  if (!dataChannelData) return;
  const { dailyMessagesSettings: settings } = dataChannelData;
  const inner = () => {
    const channel = guild.channels.cache.find((channel) => channel.name.includes(settings.channelPartial)) as TextChannel;
    if (channel) {
      const now = DateTime.now().setZone('America/Los_Angeles');
      if (now.hour === 2) {
        morningMessageHandler(now, guild, channel, dataChannelData);
      }
    }
  };
  if (settings.isEnabled) {
    inner();
    setInterval(inner, hourInMs);
  }
};
