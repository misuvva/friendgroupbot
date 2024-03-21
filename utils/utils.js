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

const getNameAndHeartFromPartial = async (guild, partial) => {
  const members = await guild.members.fetch();
  const member = members.find((member) => member.nickname.includes(partial) || member.user.username.includes(partial));
  const name = member.roles.color.name;
  const heart = member.nickname.split(' ')[0];
  return { name, heart };
};

const joinWithAnds = (items) => {
  if (items.length < 1) return '';
  if (items.length === 1) return `${items[0]}`;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  if (items.length > 2) {
    return items
      .slice(0, items.length - 1)
      .join(', ') + ' and ' +
    items[items.length - 1];
  }
  return '';
};

const surround = (string, array) => array.join('') + string + _.reverse(array).join('');

module.exports = {
  pick,
  voiceChannelNames,
  getNameAndHeartFromPartial,
  joinWithAnds,
  surround,
};