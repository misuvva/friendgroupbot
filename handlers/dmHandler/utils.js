/* eslint-disable arrow-body-style */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
const randomChance = (number) => Math.random() < number;
const luxon = require('luxon');
const { shuffle } = require('shuffle-seed');

const pick = (arr) => arr[Math.floor(Math.random() * (arr.length))];

const secondComponents = [
  'coyote',
  'saguaro',
  'tumbleweed',
  'diamondhead',
  'hare',
  'fox',
  'cottontail',
  'bighorn',
  'quail',
  'panther',
  'tortoise',
  'eagle',
  'falcon',
  'kestrel',
  'gila',
  'cholla',
  'yucca',
  'juniper',
  'sage'
];

const firstComponents = ['red-', 'black-', 'white-', 'golden-', 'silver-', ''];

const publicPseudonymComponents = {
  first: ['giant-', 'tiny-', 'slippery-', 'blue-ringed-', 'jittery-', 'arctic-', 'tropical-', ''],
  second: [
    'dolphin 🐬',
    'salmon 🐟',
    'trout 🍎',
    'guppy 🎏',
    'starfish ⭐',
    'seal 🦭',
    'whale 🐳',
    'swordfish ⚔️',
    'tuna 🍣',
    'octopus 🐙',
    'cormorant 🦅',
    'stingray 🦂',
    'shark 🦈',
    'squid 🦑',
    'jellyfish 🎀',
    'crab 🦀',
    'sea-snake 🐍',
    'lobster 🦞',
    'shrimp 🦐'
  ]
};

const anonNames = firstComponents.map((firstComponent) => secondComponents.map((secondComponent) => `${firstComponent}${secondComponent}`)).reduce((a, b) => [...a, ...b]);
const pseudonyms = publicPseudonymComponents.first
  .map((firstComponent) => publicPseudonymComponents.second.map((secondComponent) => `${firstComponent}${secondComponent}`))
  .reduce((a, b) => [...a, ...b]);

const stringNumber = (str) => {
  str = str.split('');
  const arr = [];
  const alpha = /^[A-Za-z]+$/;
  for (let i = 0; i < str.length; i++) {
    if (str[i].match(alpha)) {
      const num = str[i].charCodeAt(0) - 96;
      arr.push(num);
    } else {
      arr.push(4);
    }
  }

  const exponent = 5;
  const constantSalt = 142;
  // change either the exponent or the salt to reset all of the pseudonyms
  return (Number(arr.toString().split(',').join('')) + constantSalt) ** exponent;
};

// Returns an object of the psudonyms for each user from a given user's perspective
const namesToHandles = (names, yourName) => {
  const handles = {};
  const anonNamesCopy = JSON.parse(JSON.stringify(anonNames));
  names.forEach((name) => {
    let index = (stringNumber(name) + stringNumber(yourName)) % (anonNamesCopy.length - 1);
    handles[name] = anonNamesCopy[index];
    anonNamesCopy.splice(index, 1);
  });
  return handles;
};

// These pseudonyms are for public "/say" anonymous messages, unrelated to namesToHandles
const getPseudonym = (guild, userId, extraSeedData = 0) => {
  const members = guild.members.cache;
  const userIds = members.map((member) => member.user.id);
  const now = luxon.DateTime.now();
  const { month } = now;
  const seedConstant = 10;
  const seed = month + extraSeedData + seedConstant;
  const shuffledPseudonyms = shuffle(pseudonyms, seed);
  const index = userIds.indexOf(userId);
  const pseudonym = shuffledPseudonyms[index];
  return pseudonym;
};

const generateAnonId = () => {
  return Math.floor(Math.random() * 10000000000000000000000000).toString(36).toUpperCase().slice(0, 6);
};

module.exports = {
  stringNumber,
  namesToHandles,
  randomChance,
  pick,
  generateAnonId,
  getPseudonym
};