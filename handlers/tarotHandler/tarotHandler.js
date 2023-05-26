/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-case-declarations */
/* eslint-disable prefer-template */
/* eslint-disable quote-props */
const _ = require('lodash');
const { createCommand } = require('../../commands');

const startCommand = '-t';
const { addToStore, getStore, updateStore } = require('../../storeUtils/storeUtils');
const { pick, getHeart } = require('../../utils/utils');
const { generateAnonId } = require('../dmHandler/utils');

// const storeKey = 'tarot';

const romanNumerals = [
  '0', 'I', 'II',
  'III', 'IV', 'V',
  'VI', 'VII', 'VIII',
  'IX', 'X', 'XI', 'XII',
  'XIII', 'XIV', 'XV', 'XVI',
  'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII'
];

const generateDeck = () => {
  const majorArcana = Object.entries({
    'The Fool': { symbol: '🤡' },
    'The Magician': { symbol: '🙌' },
    'The High Priestess': { symbol: '🔮' },
    'The Empress': { symbol: '🐉' },
    'The Emperor': { symbol: '🐻' },
    'The Hierophant': { symbol: '🦉' },
    'The Lovers': { symbol: '🤝' },
    'The Chariot': { symbol: '🎠' },
    'Strength': { symbol: '🐜' },
    'The Hermit': { symbol: '🦀' },
    'Wheel of Fortune': { symbol: '🎱' },
    'Justice': { symbol: '⚖️' },
    'The Hanged Man': { symbol: '🪢' },
    'Death': { symbol: '🥀' },
    'Temperance': { symbol: '🌊' },
    'The Devil': { symbol: '🐍' },
    'The Tower': { symbol: '🧨' },
    'The Star': { symbol: '⭐️' },
    'The Moon': { symbol: '🌛' },
    'The Sun': { symbol: '👁' },
    'Judgement': { symbol: '🪶' },
    'The World': { symbol: '🐢' },
  }).map(([name, value], index) => ({
    number: index,
    numeral: romanNumerals[index],
    name,
    symbol: value.symbol,
    owner: null,
    history: [],
    isMajor: true,
  }));

  const suits = ['Swords', 'Wands', 'Pentacles', 'Cups'];
  const suitSymbols = ['🗡', '⚡', '🍓', '🧁'];
  const minorArcana = suits
    .map((suit, suitIndex) => {
      const suitSymbol = suitSymbols[suitIndex];
      const numberCards = new Array(9)
        .fill('')
        .map((value, index) => {
          const number = index + 2;
          const numeral = romanNumerals[number];
          return {
            number,
            name: numeral + ` of ${suit}`,
            numeral,
            symbol: `${numeral}${suitSymbol}`,
            isMajor: false,
            owner: null,
            history: [],
          };
        });
      const faceCards = [
        {
          number: 11,
          name: `Page of ${suit}`,
          numeral: romanNumerals[11],
          symbol: `📓${suitSymbol}`,
          isMajor: false,
          owner: null,
          history: [],
        },
        {
          number: 12,
          name: `Knight of ${suit}`,
          numeral: romanNumerals[12],
          symbol: `🐴${suitSymbol}`,
          isMajor: false,
          owner: null,
          history: [],
        },
        {
          number: 13,
          name: `Queen of ${suit}`,
          numeral: romanNumerals[13],
          symbol: `🐘${suitSymbol}`,
          isMajor: false,
          owner: null,
          history: [],
        },
        {
          number: 14,
          name: `King of ${suit}`,
          numeral: romanNumerals[14],
          symbol: `🦧${suitSymbol}`,
          isMajor: false,
          owner: null,
          history: [],
        },
      ];
      const ace = {
        number: 1,
        name: `Ace of ${suit}`,
        numeral: 'I',
        symbol: `A${suitSymbol}`,
        isMajor: false,
        owner: null,
        history: [],
      };
      return [ace, ...numberCards, ...faceCards];
    }).reduce((a, b) => ([...a, ...b]));

  const unidentifiedDeck = [...majorArcana, ...minorArcana];
  const deck = {};
  unidentifiedDeck.forEach((card) => {
    const id = generateAnonId();
    deck[id] = { ...card, id };
  });
  return deck;
};

const setup = async (force = false) => {
  const store = await getStore();
  const deck = _.get(store, 'tarot.deck');
  if (!deck) {
    const deck = generateDeck();
    addToStore('tarot.deck', deck);
  }
  if (force) {
    const deck = generateDeck();
    addToStore('tarot.deck', deck);
  }
};

const getDeck = async () => {
  const store = await getStore();
  const { deck } = store.tarot;
  return deck;
};

// const updateCard = async (card, updates) => {
//   addToStore(`tarot.deck.${card.id}`, { ...card, ...updates });
// };

const updateCards = async (cards, updates) => {
  updateStore(
    cards.map(
      (card) => [`tarot.deck.${card.id}`, { ...card, ...updates }]
    )
  );
};

const displayCard = (card) => (_.get(card, 'isMajor', false)
  ? `**${card.numeral}**: **${card.name}** **(${card.symbol})**`
  : `**The ${card.name}** **(${card.symbol})**`);

async function handleDraw(interaction) {
  const deck = await getDeck();
  const numberOfCards = pick([2, 2, 2, 2, 3, 4]);
  const unclaimedCards = Object.values(deck).filter((card) => card.owner === null);
  if (unclaimedCards.length === 0) {
    interaction.reply('All out of cards! Resetting');
    setup(true);
    return;
  }
  let cardDrawMessageText = `.\n  ${interaction.member} has drawn: (${numberOfCards})`;
  const cards = _.shuffle(unclaimedCards).slice(0, numberOfCards);
  const ownership = { type: 'user', id: interaction.user.id, style: 'abusus' };
  updateCards(cards, {
    owner: ownership,
    history: { previous: null, current: ownership, event: 'draw' }
  });
  cards.forEach((card) => {
    cardDrawMessageText += `\n    ${displayCard(card)}`;
  });

  interaction.reply({
    content: cardDrawMessageText
  });
}

const viewInventory = async (interaction, short = false) => {
  const deck = await getDeck();
  const userId = interaction.user.id;
  const ownedCards = Object.values(deck).filter((card) => {
    if (card.owner && !Array.isArray(card.owner)) {
      if (
        card.owner.type === 'user'
        && card.owner.style === 'abusus'
        && card.owner.id === userId
      ) {
        return true;
      }
    }
    return false;
  });
  if (short) {
    interaction.reply({
      content: '.'
      + '\n You own:'
      + ownedCards.map((card, index) => (
        `${index % 4 === 0 ? '\n    ' : ''}**(${card.symbol})**`
      )).join(' '),
    });
  } else {
    interaction.reply({
      content: '.'
      + '\n You own:'
      + ownedCards.map((card) => (
        `\n   - ${displayCard(card)}`
      )).join(' '),
    });
  }
};

const drawSpread = async (interaction, guild) => {
  const deck = await getDeck();
  const cards = _.shuffle(Object.values(deck)).slice(0, 3);
  let response = '.';
  await Promise.all(cards.map(async (card, index) => {
    let ownershipString = '';
    let inReverseString = pick([' *in obverse*', ' *in reverse*']);
    if (card.owner !== null) {
      const ownerMember = guild.members.cache.find((member) => member.user.id === card.owner.id);
      const heart = await getHeart(guild, ownerMember);
      ownershipString = ` (${heart})`;
    }
    response += `\n  ${index + 1}: ||${displayCard(card)}${ownershipString}${inReverseString}||`;
  }));
  interaction.reply({
    content: response
  });
};

const tarotHandler = async (message) => {
  // const store = await getStore();
  // const { deck } = store.tarot;

  if (message.content.split(' ')[0] === startCommand) {
    const command = message.content.split(' ')[1];

    if (command) {
      switch (command) {
        case 'draw':
          return handleDraw();
        case 'inv':
          return viewInventory();
        case 'i':
          return viewInventory(true);
        case 'spread':
          return drawSpread();
        case 'reset':
          return setup(true);
        default:
          break;
      }
    }
  }
};

const setupTarotHandlerCommands = async (guild) => {
  createCommand(guild, {
    name: 'tarot-draw',
    description: 'Draw 2-4 tarot cards',
    execute: handleDraw
  });
  createCommand(guild, {
    name: 'tarot-inventory',
    description: 'Show your inventory of tarot cards',
    execute: viewInventory
  });
  createCommand(guild, {
    name: 'tarot-inventory-short',
    description: 'Show your inventory of tarot cards, shortened',
    execute: (interaction) => viewInventory(interaction, true)
  });
  createCommand(guild, {
    name: 'tarot-spread',
    description: 'Draw a spread of 3 tarot cards, for readings',
    execute: (interaction) => drawSpread(interaction, guild)
  });
};

module.exports = {
  tarotHandler,
  setupTarotHandlerCommands
};