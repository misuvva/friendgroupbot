/* eslint-disable no-use-before-define */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-template */
/* eslint-disable no-useless-concat */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
import _ from 'lodash';
import { Guild, Role, GuildMember } from 'discord.js';

export const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const voiceChannelNames = [
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

export const getNameAndHeartFromPartial = async (guild: Guild, partial: string): Promise<{ name: string; heart: string; mention: Role }> => {
  const members = await guild.members.fetch();
  const member = members.find((member) => member?.nickname?.includes(partial) || member?.user?.username?.includes(partial));
  if (!member) {
    throw new Error(`Member with partial ${partial} not found`);
  }
  const role = member.roles.color!;
  const name = role.name;
  const heart = member.nickname!.split(' ')[0];
  return { name, heart, mention: role };
};

export const getHeart = async (guild: Guild, member: GuildMember): Promise<string> => {
  return member.nickname?.split(' ')[0] || '💖';
};

export const joinWithAnds = (items: string[]): string => {
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

export const surround = (string: string, array: string[]): string => array.join('') + string + _.reverse([...array]).join('');

export const wrapNameWithHearts = (name: string, _guild?: Guild): string => {
  return `💖 ${name} 💖`;
};
