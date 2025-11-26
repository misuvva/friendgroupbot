/* eslint-disable quotes */
/* eslint-disable arrow-parens */
/* eslint-disable default-case */
import {
  MessageActionRow, MessageButton, MessageEmbed, Message, User, MessageReaction, Guild, TextChannel, ButtonInteraction
} from 'discord.js';
import { DateTime } from 'luxon';
// @ts-ignore
import SunCalc from 'suncalc';

import { errorHandler } from '../errorHandler/errorHandler';
import { addToStore, getStore, removeFromStore } from '../../storeUtils/storeUtils';
import { generateAnonId } from '../dmHandler/utils';

const longBeachCoordinates = {
  lat: 33.7701,
  long: 118.1937
};

const oneHourInMilliseconds = 1000 * 60 * 60;
export const buttonsRegistry: Record<string, { onPress: (interaction: ButtonInteraction) => void, button: MessageButton }> = {};
export const remindersKey = 'reminders';

export const createButton = (options: any) => {
  const { onPress, ...buttonOptions } = options;
  const button = new MessageButton(buttonOptions);
  buttonsRegistry[options.customId] = { onPress, button };
  return button;
};

const createReminder = async (message: Message, user: User, milliseconds: number) => {
  const createdAt = DateTime.now().toMillis();
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

const createReminderAtTime = async (messageReaction: MessageReaction, user: User, targetTime: number) => {
  const createdAt = DateTime.now().toMillis();
  const reminder = {
    userId: user.id,
    messageUrl: messageReaction.message.url,
    id: generateAnonId(),
    targetTime,
    createdAt
  };
  addToStore(`${remindersKey}.${reminder.id}`, reminder);
};

const sunriseReminder = async (messageReaction: MessageReaction, user: User) => {
  const createdAt = DateTime
    .now()
    .setZone('UTC-7:00');
  const { sunrise } = SunCalc.getTimes(createdAt.toJSDate(), longBeachCoordinates.lat, longBeachCoordinates.long);
  const sunriseTime = DateTime.fromJSDate(sunrise);
  createReminderAtTime(messageReaction, user, sunriseTime.toMillis());
};

const sunsetReminder = async (messageReaction: MessageReaction, user: User) => {
  const createdAt = DateTime
    .now()
    .setZone('UTC-7:00');
  const { sunset } = SunCalc.getTimes(createdAt.toJSDate(), longBeachCoordinates.lat, longBeachCoordinates.long);
  const sunsetTime = DateTime.fromJSDate(sunset);
  createReminderAtTime(messageReaction, user, sunsetTime.toMillis());
};

export const remindersMinuteLoop = async (guild: Guild) => {
  const store = await getStore();
  const reminders = store[remindersKey];
  const members = await guild.members.fetch();
  if (!reminders) return;
  Object.entries(reminders).forEach(async ([id, reminder]: [string, any]) => {
    const targetTime = DateTime.fromMillis(reminder.targetTime).toMillis();
    const now = DateTime.now().toMillis();
    if (targetTime < now) {
      const member = members.find(member => member.user.id === reminder.userId);
      if (!member) return;
      const messageChannel = await guild.channels.fetch(reminder.message.channel.id) as TextChannel;
      const message = await messageChannel.messages.fetch(reminder.message.id);
      member.user.send({
        content: `You asked me to remind you about this message`,
        embeds: [new MessageEmbed({
          url: message.url,
          title: `${message.member?.displayName}: ${message.content}`,
          color: message.member?.displayColor
        })],
        components: [new MessageActionRow({
          components: [
            createButton({
              label: 'Snooze (15m)',
              style: 'PRIMARY',
              customId: 'snooze-button-15-minutes',
              onPress: (interaction: ButtonInteraction) => {
                createReminder(message, member.user, 1000 * 60 * 15);
                interaction.reply('Got it! Snoozing for 15 Minutes');
              }
            }),
            createButton({
              label: 'Znooze (1H)',
              style: 'PRIMARY',
              customId: 'snooze-button-1-hour',
              onPress: (interaction: ButtonInteraction) => {
                createReminder(message, member.user, oneHourInMilliseconds);
                interaction.reply('Got it! Znoozing for 1 Hour');
              }
            }),
            createButton({
              label: 'Znuzz (5H)',
              style: 'PRIMARY',
              customId: 'snooze-button-5-hours',
              onPress: (interaction: ButtonInteraction) => {
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

export const reminderHandler = async (messageReaction: MessageReaction, user: User) => {
  try {
    if (!messageReaction.emoji.name) return;
    switch (messageReaction.emoji.name) {
      case '🌇':
        sunsetReminder(messageReaction, user);
        break;
      case '🌅':
        sunriseReminder(messageReaction, user);
        break;
      case '📌':
        createReminder(messageReaction.message as Message, user, 10);
        break;
      case '⏲️':
        createReminder(messageReaction.message as Message, user, oneHourInMilliseconds);
        break;
      case '☄️':
        createReminder(messageReaction.message as Message, user, oneHourInMilliseconds * 5);
        break;
    }
  } catch (error) {
    errorHandler(error);
  }
};

export const buttonInteractionHandler = (interaction: ButtonInteraction) => {
  if (buttonsRegistry[interaction.customId]) {
    buttonsRegistry[interaction.customId].onPress(interaction);
  }
};
