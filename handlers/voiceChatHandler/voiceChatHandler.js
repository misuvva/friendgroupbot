/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-promise-executor-return */
const _ = require('lodash');

const { get } = _;
const { pick } = require('../../utils/utils');
const { errorHandler } = require('../errorHandler/errorHandler');

const getVoiceChannelNames = async (guild) => {
  const dataChannel = guild.channels.cache.find((channel) => get(channel, 'name').includes('data'));
  const voiceChannelNamesMessage = dataChannel.messages.cache.find((message) => message.content.includes('names for voice channels'));
  const result = voiceChannelNamesMessage.content.split('[')[1].split(']')[0].split(',');
  return result;
};

const updateVoiceChats = async (oldState, newState, guild) => {
  try {
    const emptyChannels = [];
    const idealNumberOfEmptyChannels = 1;
    const audioCategoryId = guild.channels.cache.find((channel) => get(channel, 'type') === 'GUILD_VOICE')?.parent?.id;
    const voiceChannelNames = await getVoiceChannelNames(guild);
    const voiceChannels = [...newState.guild.channels.cache
      .filter((channel) => get(channel, 'type') === 'GUILD_VOICE')
      .values()]
      .sort((a, b) => (a.rawPosition > b.rawPosition ? 1 : -1));

    voiceChannels.forEach((channel) => {
      const hasPeople = [...channel.members.values()].length >= 1;
      if (!hasPeople) {
        if (get(channel, 'parent.id') === audioCategoryId) {
          emptyChannels.push(channel);
        }
      }
    });

    if (emptyChannels.length > idealNumberOfEmptyChannels) {
      const numberOfChannelsToDelete = emptyChannels.length - idealNumberOfEmptyChannels;
      for (let i = 0; i < numberOfChannelsToDelete; i++) {
        const index = emptyChannels.length - 1 - i;
        const channel = emptyChannels[index];
        channel.delete();
      }
    }

    if (emptyChannels.length < idealNumberOfEmptyChannels) {
      const numberOfChannelsToAdd = idealNumberOfEmptyChannels - emptyChannels.length;
      for (let i = 0; i < numberOfChannelsToAdd; i++) {
        const existingVoiceChannelNames = voiceChannels.map((channel) => channel.name);
        let newChannelName = pick(voiceChannelNames.filter((name) => existingVoiceChannelNames.indexOf(name) === -1));
        if (!newChannelName) newChannelName = pick(voiceChannelNames);
        const newChannelOptions = {
          type: 'GUILD_VOICE',
          parent: audioCategoryId,
          userLimit: 99,
        };

        guild.channels.create(newChannelName, newChannelOptions);
      }
    }
  } catch (error) {
    errorHandler(error);
  }
};

module.exports = {
  updateVoiceChats,
};