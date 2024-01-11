/* eslint-disable quotes */
/* eslint-disable consistent-return */

const { constants } = require("../../utils/constants");

const getData = async (guild) => {
  const dataChannel = guild.channels.cache.find((channel) => channel.name === constants.DATA_CHANNEL_NAME);
  if (!dataChannel) return;
  const dataChannelMessages = await dataChannel.messages.fetch({ limit: 100 });
  const dailyMessagesSettingsMessage = dataChannelMessages
    .find((message) => message.content.includes('settings for the daily messages'));
  if (!dailyMessagesSettingsMessage) return;
  const dailyMessagesSettingsString = `{${dailyMessagesSettingsMessage.content.split('{')[1].split('}')[0]}}`
    .split('\n').join('');
  const dailyMessagesSettings = JSON.parse(
    dailyMessagesSettingsString
  );
  const birthdaysMessage = dataChannelMessages
    .find((message) => message.content.includes('list of birthdays'));
  const birthdaysString = `{${birthdaysMessage.content.split('{')[1].split('}')[0].split('\n').join('')}}`;
  const birthdays = JSON.parse(birthdaysString);
  return {
    dailyMessagesSettings,
    birthdays
  };
};

module.exports = {
  getData
};