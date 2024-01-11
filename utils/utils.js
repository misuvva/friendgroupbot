/* eslint-disable no-use-before-define */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-template */
/* eslint-disable no-useless-concat */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
// const displayMessage = (message) => console.log(`#${get(message, 'channel.name')} ${get(message, 'author.username')} ${get(message, 'content')}`);
// const displayMessages = (messages) => messages.forEach((message) => displayMessage(message));
// const displayChannel = (channel) => console.log(`${get(channel, 'parent.name')} > ${get(channel, 'rawPosition')} ${get(channel, 'type')}: ${get(channel, 'name')} (${get(channel, 'id')})`);
// const displayChannels = (channels) => channels.forEach((channel) => displayChannel(channel));
const _ = require('lodash');
const { getData } = require('../handlers/dataChannelHandler');

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const voiceChannelNames = [
  'The Roots',
  'The Limbs',
  'The Hollow',
  'The Leaves',
  'The Flowers',
  'The Trunk',
  'The Ground',
  'The Canopy',
  'The Air'
];

module.exports = {
  pick,
  voiceChannelNames,
};