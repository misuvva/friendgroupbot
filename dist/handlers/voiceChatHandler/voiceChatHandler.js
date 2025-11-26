"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoiceChats = void 0;
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-promise-executor-return */
const lodash_1 = __importDefault(require("lodash"));
const { get } = lodash_1.default;
const utils_1 = require("../../utils/utils");
const errorHandler_1 = require("../errorHandler/errorHandler");
const getVoiceChannelNames = async (guild) => {
    const dataChannel = guild.channels.cache.find((channel) => get(channel, 'name').includes('data'));
    if (!dataChannel)
        return [];
    const voiceChannelNamesMessage = dataChannel.messages.cache.find((message) => message.content.includes('names for voice channels'));
    if (!voiceChannelNamesMessage)
        return [];
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
            .map(c => c)
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
                let newChannelName = (0, utils_1.pick)(voiceChannelNames.filter((name) => existingVoiceChannelNames.indexOf(name) === -1));
                if (!newChannelName)
                    newChannelName = (0, utils_1.pick)(voiceChannelNames);
                const newChannelOptions = {
                    type: 'GUILD_VOICE',
                    parent: audioCategoryId,
                    userLimit: 99,
                };
                guild.channels.create(newChannelName, newChannelOptions);
            }
        }
    }
    catch (error) {
        (0, errorHandler_1.errorHandler)(error);
    }
};
exports.updateVoiceChats = updateVoiceChats;
