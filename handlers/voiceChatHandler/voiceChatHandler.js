/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-promise-executor-return */
const audioCategoryId = '832327947318591491';
const { join } = require('node:path');
const _ = require('lodash');

const { get } = _;
const { joinVoiceChannel, createAudioResource, createAudioPlayer } = require('@discordjs/voice');
const { createCommand } = require('../../commands');
const { pick, voiceChannelNames } = require('../../utils/utils');
const { errorHandler } = require('../errorHandler/errorHandler');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const updateVoiceChats = (oldState, newState, guild) => {
  try {
    const emptyChannels = [];
    const idealNumberOfEmptyChannels = 2;

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
          bitrate: 128000
        };

        guild.channels.create(newChannelName, newChannelOptions);
      }
    }
  } catch (error) {
    errorHandler(error);
  }
};

const setupVoiceChannelCommands = async (guild) => {
  await createCommand(guild, {
    name: 'test-voice',
    description: 'Test command for various voice channel functions',
    execute: async (interaction) => {
      const voiceChannel = guild.channels.cache.find((channel) => channel.type === 'GUILD_VOICE');
      const voiceConnection = await joinVoiceChannel({
        guildId: guild.id,
        channelId: voiceChannel.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });
      const sounds = [];
      for (let i = 0; i < 9; i++) {
        const path = join(__dirname, `./SFX/sound-${i}.mp3`);
        const audioResource = createAudioResource(path);
        sounds.push(audioResource);
      }
      const soundsToPlay = _.shuffle(sounds);
      const audioPlayer = await createAudioPlayer();
      await voiceConnection.subscribe(audioPlayer);
      for (let soundIndex = 0; soundIndex < soundsToPlay.length; soundIndex++) {
        const sound = soundsToPlay[soundIndex];
        audioPlayer.play(sound);
        await sleep(300);
      }
      voiceConnection.disconnect();
      interaction.reply({ content: 'test voice command executed', ephemeral: true });
    }
  });
};

module.exports = {
  updateVoiceChats,
  setupVoiceChannelCommands
};