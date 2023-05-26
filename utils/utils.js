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

const heartNamesSortedByColor = [
  'asher_heart', 'parker_heart', 'blaze_heart',
  'hunter_heart', 'basil_heart', 'tallis_heart',
  'bee_heart', 'justin_heart', 'niq_heart',
  'bennett_heart', 'rilee_heart', 'tristan_heart',
  'ella_heart', 'marlena_heart', 'mars_heart',
  'jon_heart', 'tobi_heart', 'beetle_heart',
  'corbin_heart', 'kevin_heart', 'emily_heart',
  'ashley_heart', 'hayden_heart', 'rebecca_heart',
  'quinn_heart', 'blake_heart', 'duncan_heart',
  'darwin_heart', 'kajsa_heart', 'liam_heart',
  'jackson_heart', 'eloisa_heart', 'matt_heart',
  'ksum_heart', 'serina_heart'
];

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const letterEmojis = [
  '🅰️', '🅱️', '󠁃󠁃󠁃󠁃🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯',
  '🇰', '🇱', 'Ⓜ️', '🇳', '🅾', '🅿', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'
];

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

const solarMonths = [
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June'
];

const ordinals = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
];

const cap = _.capitalize;

const defaultShorts = [
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫'
];

const rainbowShorts = ['❤️', '🧡', '💛', '💚', '💙', '💜', '💖', '🤍', '9️⃣', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫'];

const partitions = {
  twin: {
    size: 2,
    ordinals: {
      of: { ...ordinals, 14: 'last' },
      in: ['odd', 'even']
    },
    shorts: {
      of: { ...defaultShorts },
      in: ['🌅', '🌄']
    }
  },
  chord: {
    size: 3,
    ordinals: {
      of: { ...ordinals, 9: 'last' },
      in: { 0: 'upper', 1: 'center', 2: 'lower' },
    },
    shorts: {
      of: { ...defaultShorts },
      in: ['⚖️', '💀', '🍎'],
    }
  },
  hand: {
    size: 5,
    ordinals: {
      of: { ...ordinals, 5: 'last' },
      in: {
        0: 'thumb', 1: 'index', 2: 'middle', 3: 'ring', 4: 'little'
      }
    },
    shorts: {
      of: ['👁️', '✋', '👂', '👄', '👃', '⏳'],
      in: ['❤️', '🧡', '💛', '💚', '🤍']
    }
  },
  side: {
    size: 10,
    ordinals: {
      of: { 0: 'first', 1: 'center', 2: 'last' },
      in: { ...ordinals, 9: 'last' }
    },
    shorts: {
      of: ['🌎', '🌞', '⭐'],
      in: ['♈', '♉', '♏', '♐', '♑', '♒', '♓', '♊', '♋', '♌'],
    }
  },
};

const getHearts = (guild) => [...guild.emojis.cache.filter((emoji) => emoji.name.includes('_heart')).values()];

const getHeartFromName = (name, guild) => {
  if (!guild) return name;
  const hearts = getHearts(guild);
  let heartName;
  let heart;
  if (name === 'Katherine Summer') {
    heartName = 'ksum_heart';
  } else {
    heartName = `${name.toLowerCase()}_heart`;
  }
  heart = `${hearts.find((emoji) => emoji.name === heartName)}`;
  return heart;
};

const wrapNameWithHearts = (name, guild) => {
  if (!guild) return name;
  const hearts = getHearts(guild);
  let heartName;
  let heart;
  if (name === 'Katherine Summer') {
    heartName = 'ksum_heart';
  } else {
    heartName = `${name.toLowerCase()}_heart`;
  }
  heart = `${hearts.find((emoji) => emoji.name === heartName)}`;
  return `${heart}${name}${heart}`;
};

const getSolarDayAnalysis = (solarDateOfTheMonthIndex) => {
  let shortResult = '';
  let longResult = '';

  Object.entries(partitions).forEach(
    ([
      title,
      {
        size,
        ordinals: { of: ordinalsOf, in: ordinalsIn },
        shorts: { of: shortsOf, in: shortsIn }
      }
    ], index) => {
      const indexIn = solarDateOfTheMonthIndex % size;
      const indexOf = Math.floor(solarDateOfTheMonthIndex / size);
      const ordinalIn = ordinalsIn[indexIn];
      const ordinalOf = ordinalsOf[indexOf];
      if (shortResult.length !== 0) shortResult += '  ';
      shortResult += `${rainbowShorts[indexIn]}${rainbowShorts[indexOf]}`;
      if (longResult) {
        longResult += index % 2 !== 0 ? ', ' : '\n';
      }
      longResult += `*${cap(ordinalIn)} day of the **${ordinalOf} ${title}***`;
    }
  );
  const result = `${shortResult}`;
  return result;
};

const getSolarAbbreviation = ({
  solarMonth,
  solarDateOfTheMonth,
}) => `${solarMonths.indexOf(solarMonth) + 1}/${solarDateOfTheMonth}`;

const getSolarSeason = (month, day) => {
  let firstPart;
  switch (month) {
    case 'July':
      firstPart = day <= 15 ? 'Summer Bursting' : 'Summer in Repose';
      break;
    case 'August':
      firstPart = day <= 15 ? 'Summer Sleeping' : 'Autumn Calling';
      break;
    case 'September':
      firstPart = day <= 15 ? 'Autumn in Flight' : 'Autumn in Vain';
      break;
    case 'October':
      firstPart = day <= 15 ? 'Autumn Falling' : 'Autumn in Mourning';
      break;
    case 'November':
      firstPart = day <= 15 ? 'Autumn in Memory' : 'Winter Awake';
      break;
    case 'December':
      firstPart = day <= 15 ? 'Winter Alone' : 'Winter Harmonic';
      break;
    case 'January':
      firstPart = day <= 15 ? 'Winter in Chorus' : 'Winter in Reprise';
      break;
    case 'February':
      firstPart = day <= 15 ? 'Winter All-Aglow' : 'Spring in Quiet';
      break;
    case 'March':
      firstPart = day <= 15 ? 'Spring Bittersweet' : 'Spring in Bloom';
      break;
    case 'April':
      firstPart = day <= 15 ? 'Spring Overflowing' : 'Spring Coming Home';
      break;
    case 'May':
      firstPart = day <= 15 ? 'Spring At-the-door' : 'Summer Waking';
      break;
    case 'June':
      firstPart = day <= 15 ? 'Summer Singing' : 'Summer in Glory';
      break;
    default:
      break;
  }

  return `**${firstPart}**`;
};



const solarMonthlyBirthdays = {
  jackson: 1,
  basil: 1,
  tobi: 1,
  liam: 2,
  mary: 2,
  justin: 3,
  beetle: 6,
  ksum: 6,
  ashley: 7,
  niq: 8,
  duncan: 10,
  kevin: 10,
  bennett: 10,
  quinn: 11,
  parker: 11,
  rilee: 11,
  tallis: 12,
  marlena: 12,
  eloisa: 14,
  kajsa: 18,
  serina: 20,
  bee: 20,
  hayden: 21,
  hunter: 22,
  darwin: 23,
  tristan: 24,
  mars: 25,
  matt: 26,
  blaze: 26,
  asher: 27,
  blake: 28,
  emily: 30,
  jon: '', // unknown
  roach: '', // unknown
};

const combineNames = (names) => `${names.slice(0, names.length - 1).join(', ')} and ${names[names.length - 1]}`;

const combineNamesWithoutDays = (arr) => {
  switch (arr.length) {
    case 0:
      return '';
    case 1:
      return `${arr[0]}`;
    case 2:
      return `${arr[1]} and ${arr[0]}`;
    default:
      return `${combineNames(arr)}`;
  }
};

const getMonthlyBirthdayHearts = (dayOfMonth, guild) => {
  const hearts = _.shuffle(Object.keys(solarMonthlyBirthdays).filter(
    (name) => solarMonthlyBirthdays[name] === Number(dayOfMonth)
  )).map(cap).map((name) => getHeartFromName(name, guild));
  return hearts;
};

const getMonthlyBirthdays = (dayOfMonth, guild) => {
  const people = _.shuffle(Object.keys(solarMonthlyBirthdays).filter(
    (name) => solarMonthlyBirthdays[name] === Number(dayOfMonth)
  )).map(cap).map((name) => wrapNameWithHearts(name, guild));
  switch (people.length) {
    case 0:
      return '';
    case 1:
      return `${people[0]}'s day`;
    case 2:
      return `${people[1]} and ${cap(people[0])}'s day`;
    default:
      return `${combineNames(people)}'s day`;
  }
};

const addToArray = (object, path, item) => {
  if (object[path]) object[path].push(item);
  else object[path] = [item];
};

const generateAlignments = () => {
  const alignments = {};
  Object.entries(partitions).forEach(([name]) => {
    alignments[name] = {
      of: {},
      in: {}
    };
  });
  let counters = Object.entries(partitions).map(([name, partition]) => ({
    name,
    size: partition.size,
    of: 1,
    in: 1
  }));
  for (let i = 1; i <= 30; i++) {
    const peopleForThisDay = Object.entries(solarMonthlyBirthdays)
      .filter(([, day]) => day === i)
      .map(([name]) => name);
    counters.forEach((counter) => {
      if (peopleForThisDay) {
        peopleForThisDay.forEach((person) => {
          addToArray(alignments[counter.name].in, counter.in, person);
          addToArray(alignments[counter.name].of, counter.of, person);
        });
      }
      counter.in += 1;
      if (counter.in > counter.size) {
        counter.in = 1;
        counter.of += 1;
      }
    });
  }
  return alignments;
};

const alignments = generateAlignments();

const getDayAlignments = (solarDateOfTheMonthIndex, hearts) => {
  let result = '';
  const dayAlignments = {};
  Object.entries(partitions).forEach(([name, { size }]) => {
    const indexIn = solarDateOfTheMonthIndex % size;
    const indexOf = Math.floor(solarDateOfTheMonthIndex / size);
    const alignmentsIn = alignments[name].in[indexIn + 1];
    const alignmentsOf = alignments[name].of[indexOf + 1];
    dayAlignments[name] = {
      in: alignmentsIn,
      of: alignmentsOf,
      indexIn,
      indexOf
    };
  });

  const significanceOrder = [
    // ['twin', 'of'],
    // ['chord', 'of'],
    ['side', 'in'],
    // ['hand', 'of'],
    ['hand', 'in'],
    // ['side', 'of'],
    ['chord', 'in'],
    ['twin', 'in'],
  ];

  // const peopleMentioned = {};

  significanceOrder.forEach(([name, orientation], index) => {
    const peopleAligned = dayAlignments[name][orientation].sort();
    if (peopleAligned.length) {
      const heartsToAdd = peopleAligned.map((person) => hearts.find((emoji) => emoji.name === `${person}_heart`));
      result += heartsToAdd.join('');
      if (orientation === 'in') {
        const dayIndex = dayAlignments[name].indexIn;
        const ordinal = partitions[name].ordinals[orientation][dayIndex];
        result += `\n aligned w/ *The **${cap(ordinal)} day of the ${cap(name)}***`;
      } else if (orientation === 'of') {
        const dayIndex = dayAlignments[name].indexOf;
        const ordinal = partitions[name].ordinals[orientation][dayIndex];
        result += `\n aligned w/ *The **${cap(ordinal)} ${cap(name)}***`;
      }
      if (index + 1 !== significanceOrder.length) {
        result += '\n';
      }
    }
  });
  return result;
};

const getSolarString = (solarDateString, guild) => {
  let result;
  if (solarDateString.includes('Solstice')) {
    result = solarDateString;
  } else {
    const solarMonth = solarDateString.split(',')[0].split(' ')[0];
    const solarDateOfTheMonth = solarDateString.split(',')[0].split(' ')[1];
    const solarDayOfTheWeek = solarDateString.split(', ')[2];
    const solarYear = solarDateString.split(', ')[1].split(' ')[1];
    const solarSeason = getSolarSeason(solarMonth, solarDateOfTheMonth);
    const solarAbbreviation = getSolarAbbreviation({ solarMonth, solarDateOfTheMonth });
    const analysis = getSolarDayAnalysis(solarDateOfTheMonth - 1);
    const monthlyBirthdays = getMonthlyBirthdays(solarDateOfTheMonth, guild);
    const birthdayString = monthlyBirthdays !== '' ? `\n${monthlyBirthdays}!` : '';
    // const hearts = guild.emojis.cache.filter((emoji) => emoji.name.includes('_heart'));
    // const alignmentsString = getDayAlignments(solarDateOfTheMonth - 1, hearts);
    result = '';
    if (birthdayString !== '') result += birthdayString;
    result += `\n🌞 ${solarDayOfTheWeek}, ${solarMonth} ${solarDateOfTheMonth}, ${solarSeason}`;
    result += '\n**';
    for (let i = 0; i < 5; i++) {
      let dayNum = (Number(solarDateOfTheMonth) + i);
      if (dayNum > 30) dayNum %= 30;
      const hearts = getMonthlyBirthdayHearts(dayNum, guild);
      if (i !== 0) result += '|';
      if (hearts.length) {
        result += `${hearts.join('')}`;
        if (hearts.length === 2) result += '●';
        if (hearts.length === 1) result += '●●';
      } else {
        result += '●●●';
      }
    }
    result += '**';
  }
  return result;
};

const joinWithAnds = (arr) => {
  if (arr.length === 0) return '';
  if (arr.length === 1) return `${arr[0]}`;
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return arr.slice(0, -1).join(', ') + ` and ${arr[arr.length - 1]}`;
};

const getHeart = async (guild, member, heartsParam) => {
  let hearts;
  if (heartsParam) hearts = heartsParam;
  else hearts = await getHearts(guild);
  if (!_.get(member, 'nickname')) return '';
  const nameWithoutDots = member.nickname.slice(2, -2);
  let heartName;
  if (nameWithoutDots === 'BASIL / ELLA') {
    heartName = 'basil_heart';
  } else if (nameWithoutDots === 'KATHERINE SUMMER') {
    heartName = 'ksum_heart';
  } else if (nameWithoutDots === 'DARWIN/PERCY') {
    heartName = 'darwin_heart';
  } else if (nameWithoutDots === 'MATTHEW') {
    heartName = 'matt_heart';
  } else {
    heartName = nameWithoutDots.toLowerCase() + '_heart';
  }
  const heart = hearts.find((heart) => heart.name === heartName);
  if (!heart) return member.user.username;
  return heart;
};

const getMemberFromHeart = async (guild, heart) => {
  const members = guild.members.cache;
  const heartName = heart.split(':')[1];
  let memberName;
  if (heartName === 'ksum_heart') {
    memberName = 'summer';
  } else {
    memberName = heartName.split('_')[0];
  }
  const getNickname = (member) => _.get(member, 'nickname') || '';
  const member = members.find((member) => getNickname(member).toLowerCase().includes(memberName));
  return member;
};

module.exports = {
  // displayChannel,
  // displayMessages,
  // displayMessage,
  // displayChannels,
  getMemberFromHeart,
  joinWithAnds,
  wrapNameWithHearts,
  getHearts,
  getHeart,
  pick,
  letterEmojis,
  voiceChannelNames,
  getSolarSeason,
  getSolarAbbreviation,
  getSolarDayAnalysis,
  getMonthlyBirthdays,
  getSolarString,
};