/* eslint-disable quotes */
/* eslint-disable arrow-parens */
/* eslint-disable default-case */
const {
  MessageActionRow, MessageButton, MessageEmbed
} = require('discord.js');
const { DateTime } = require('luxon');
const luxon = require('luxon');
const SunCalc = require('suncalc');

const { errorHandler } = require('../errorHandler/errorHandler');
const { addToStore } = require('../../storeUtils/storeUtils');
const { generateAnonId } = require('../dmHandler/utils');
const { getStore, removeFromStore, } = require('../../storeUtils/storeUtils');

const longBeachCoordinates = {
  lat: 33.7701,
  long: 118.1937
};

const oneHourInMilliseconds = 1000 * 60 * 60;
const buttonsRegistry = {};
const remindersKey = 'reminders';

const createButton = (options) => {
  const { onPress, ...buttonOptions } = options;
  const button = new MessageButton(buttonOptions);
  buttonsRegistry[options.customId] = { onPress, button };
  return button;
};

const createReminder = async (message, user, milliseconds) => {
  const createdAt = luxon.DateTime.now().toMillis();
  const reminder = {
    userId: user.id,
    message: {
      id: message.id,
      url: message.url,
      channel: {
        id: message.channel.id
      }
    },
    id: generateAnonId(),
    targetTime: createdAt + milliseconds,
    createdAt
  };
  addToStore(`${remindersKey}.${reminder.id}`, reminder);
};

const createReminderAtTime = async (messageReaction, user, targetTime) => {
  const createdAt = luxon.DateTime.now().toMillis();
  const reminder = {
    userId: user.id,
    messageUrl: messageReaction.message.url,
    id: generateAnonId(),
    targetTime,
    createdAt
  };
  addToStore(`${remindersKey}.${reminder.id}`, reminder);
};

const sunriseReminder = async (messageReaction, user) => {
  const createdAt = luxon.DateTime
    .now()
    .setZone('UTC-7:00');
  const { sunrise } = SunCalc.getTimes(createdAt, longBeachCoordinates.lat, longBeachCoordinates.long);
  const sunriseTime = DateTime.fromJSDate(sunrise);
  createReminderAtTime(messageReaction, user, sunriseTime.toMillis());
};

const sunsetReminder = async (messageReaction, user) => {
  const createdAt = luxon.DateTime
    .now()
    .setZone('UTC-7:00');
  const { sunset } = SunCalc.getTimes(createdAt, longBeachCoordinates.lat, longBeachCoordinates.long);
  const sunsetTime = DateTime.fromJSDate(sunset);
  createReminderAtTime(messageReaction, user, sunsetTime.toMillis());
};

const remindersMinuteLoop = async (guild) => {
  const store = await getStore();
  const reminders = store[remindersKey];
  const members = await guild.members.fetch();
  if (!reminders) return;
  Object.entries(reminders).forEach(async ([id, reminder]) => {
    const targetTime = luxon.DateTime.fromMillis(reminder.targetTime).toMillis();
    const now = DateTime.now().toMillis();
    if (targetTime < now) {
      const member = members.find(member => member.user.id === reminder.userId);
      const messageChannel = await guild.channels.fetch(reminder.message.channel.id);
      const message = await messageChannel.messages.fetch(reminder.message.id);
      member.user.send({
        content: `You asked me to remind you about this message`,
        embeds: [new MessageEmbed({
          url: message.url,
          title: `${message.member.displayName}: ${message.content}`,
          color: message.member.displayColor
        })],
        components: [new MessageActionRow({
          components: [
            createButton({
              label: 'Snooze (15m)',
              style: 'PRIMARY',
              customId: 'snooze-button-15-minutes',
              onPress: (interaction) => {
                createReminder(message, member.user, 1000 * 60 * 15);
                interaction.reply('Got it! Snoozing for 15 Minutes');
              }
            }),
            createButton({
              label: 'Znooze (1H)',
              style: 'PRIMARY',
              customId: 'snooze-button-1-hour',
              onPress: (interaction) => {
                createReminder(message, member.user, oneHourInMilliseconds);
                interaction.reply('Got it! Znoozing for 1 Hour');
              }
            }),
            createButton({
              label: 'Znuzz (5H)',
              style: 'PRIMARY',
              customId: 'snooze-button-5-hours',
              onPress: (interaction) => {
                createReminder(message, member.user, oneHourInMilliseconds * 5);
                interaction.reply('Got it! Znuzzing for 5 Hours');
              }
            }),
          ],
        })]
      });
      removeFromStore(`${remindersKey}.${id}`);
    }
  });
};

const reminderHandler = async (messageReaction, user) => {
  try {
    switch (messageReaction.emoji.name) {
      case '🌇':
        sunsetReminder(messageReaction, user);
        break;
      case '🌅':
        sunriseReminder(messageReaction, user);
        break;
      case '📌':
        createReminder(messageReaction.message, user, 10);
        break;
      case '⏲️':
        createReminder(messageReaction.message, user, oneHourInMilliseconds);
        break;
      case '☄️':
        createReminder(messageReaction.message, user, oneHourInMilliseconds * 5);
        break;
    }
  } catch (error) {
    errorHandler(error);
  }
};

const reminderInteractionsHandler = (interaction) => {
  if (buttonsRegistry[interaction.customId]) {
    buttonsRegistry[interaction.customId].onPress(interaction);
  }
};

module.exports = {
  reminderHandler,
  remindersKey,
  remindersMinuteLoop,
  reminderInteractionsHandler,
  createButton,
};