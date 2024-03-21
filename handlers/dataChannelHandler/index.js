/* eslint-disable quotes */
/* eslint-disable consistent-return */

const { constants } = require("../../utils/constants");

const getData = async (guild) => {
  const channels = await guild.channels.fetch();
  const dataChannel = channels.find((channel) => channel.name === constants.DATA_CHANNEL_NAME);
  console.log('getData', guild.name, dataChannel.name, 'DEVLOG'); // RMBL
  if (guild.name.includes('Bakery')) {
    console.log({ dataChannel }, 'DEVLOG'); // RMBL
  }
  if (!dataChannel) return;
  const dataChannelMessages = await dataChannel.messages.fetch({ limit: 100 });
  console.log('messages:', dataChannelMessages.length, 'DEVLOG'); // RMBL
  const dailyMessagesSettingsMessage = dataChannelMessages
    .find((message) => message.content.includes('settings for the daily messages'));
  console.log('dailyMessageSettingsMessage', !!dailyMessagesSettingsMessage, 'DEVLOG'); // RMBL
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