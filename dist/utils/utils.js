"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapNameWithHearts = exports.surround = exports.joinWithAnds = exports.getHeart = exports.getNameAndHeartFromPartial = exports.voiceChannelNames = exports.pick = void 0;
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-template */
/* eslint-disable no-useless-concat */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
const lodash_1 = __importDefault(require("lodash"));
const pick = (items) => items[Math.floor(Math.random() * items.length)];
exports.pick = pick;
exports.voiceChannelNames = [
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
    const member = members.find((member) => member?.nickname?.includes(partial) || member?.user?.username?.includes(partial));
    if (!member) {
        throw new Error(`Member with partial ${partial} not found`);
    }
    const role = member.roles.color;
    const name = role.name;
    const heart = member.nickname.split(' ')[0];
    return { name, heart, mention: role };
};
exports.getNameAndHeartFromPartial = getNameAndHeartFromPartial;
const getHeart = async (guild, member) => {
    return member.nickname?.split(' ')[0] || '💖';
};
exports.getHeart = getHeart;
const joinWithAnds = (items) => {
    if (items.length < 1)
        return '';
    if (items.length === 1)
        return `${items[0]}`;
    if (items.length === 2)
        return `${items[0]} and ${items[1]}`;
    if (items.length > 2) {
        return items
            .slice(0, items.length - 1)
            .join(', ') + ' and ' +
            items[items.length - 1];
    }
    return '';
};
exports.joinWithAnds = joinWithAnds;
const surround = (string, array) => array.join('') + string + lodash_1.default.reverse([...array]).join('');
exports.surround = surround;
const wrapNameWithHearts = (name, _guild) => {
    return `💖 ${name} 💖`;
};
exports.wrapNameWithHearts = wrapNameWithHearts;
