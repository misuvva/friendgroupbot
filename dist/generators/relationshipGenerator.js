"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRelationship = void 0;
/* eslint-disable prefer-template */
const generateName_1 = require("./generateName");
const utils_1 = require("../utils/utils");
const relationshipFacets = {
    sexual: {
        modify: (string) => (0, utils_1.pick)([
            `${string} (with benefits)`,
            `${string} who uh... y'know`,
        ]) + (0, utils_1.pick)([
            ' (professionally)',
            ' (as a hobby)',
            ' (~~casually~~ competitively)',
            ' (casually)',
            ' (just like every now and then)',
            ' (in like a gay cowboys way)',
        ]),
        nucleus: () => (0, utils_1.pick)(['sex friends', 'fwb'])
    },
    lifePartners: {
        modify: (string) => (0, utils_1.pick)([
            `life-long ${string}`,
            `committed ${string}`,
        ]),
        nucleus: () => 'life partners'
    },
    business: {
        modify: (string) => string + ' who run a business together',
        nucleus: () => 'business partners'
    },
    cuddling: {
        modify: (string) => `cuddling ${string}`,
        nucleus: () => 'cuddle buddies'
    },
    // childhoodFriends: {
    //   modify: (string) => `${string} who used to be childhood friends`,
    //   nucleus: () => 'childhood friends'
    // },
    loveTriangle: {
        nucleus: () => 'love triangle',
        modify: (string) => string + ' who are in a love triangle'
            + (0, utils_1.pick)(['', '(ironically)', '(toxic)', '(hot)'])
    },
    lovers: {
        nucleus: () => 'lovers',
        modify: (string) => string + ' who are lovers'
    },
    exes: {
        modify: (string) => `${string} who used to date`,
        nucleus: () => 'ex-lovers'
    },
    financial: {
        modify: (string) => (0, utils_1.pick)([
            `${string} who manage their finances jointly 💸 (because that's their kink) 🪢`,
            `${string} who manage their finances jointly 💸 (for tax reasons) 💼`,
            `${string} who manage their finances jointly 💸 (because that's mutual aid babe) ☭`,
        ]),
        nucleus: () => 'money 💸 partners'
    },
    catboys: {
        modify: (string) => (0, utils_1.pick)(['catboy 😼', 'catgirl 😼']) + string,
        nucleus: () => (0, utils_1.pick)(['catboys 😼', 'catgirls 😼'])
    },
    emotional: {
        modify: (string) => 'emotional ❤️ support ' + string,
        nucleus: () => 'emotional support ❤️ partners'
    },
    crime: {
        modify: (string) => string + ' (ille🚫gally)',
        nucleus: () => 'crime partners 🚫'
    },
    scientists: {
        modify: (string) => string
            + ' who are also 🔬 scientists studying '
            + (0, utils_1.pick)(['arctic soils', 'volcanic ash', 'moon dust', 'fungi', 'salamanders']),
        nucleus: () => 'scientists'
    },
    reading: {
        modify: (string) => string + ' who have a 📖 reading group 👓 together',
        nucleus: () => 'reading buddies 📖'
    },
    pirate: {
        modify: (string) => string + ' who run a 🏴‍☠️ pirate ship together',
        nucleus: () => 'shipmates'
    },
    // chairman: {
    //   modify: (string) => string + ' who are co-chairmen of the communist party',
    //   nucleus: () => 'co-chairmen of the communist party'
    // },
    friends: {
        modify: (string) => string,
        nucleus: () => 'friends'
    },
    enemies: {
        modify: (string) => 'arch-enemy ' + string,
        nucleus: () => (0, utils_1.pick)(['sworn arch nemeses', 'arch nemeses'])
    },
    // starCrossed: {
    //   modify: (string) => 'star-crossed ' + string,
    //   nucleus: () => 'star-crossed lovers'
    // },
    fairies: {
        modify: (string) => 'fairy 🧚 ' + string,
        nucleus: () => '️🧚 fairies'
    },
    royalty: {
        modify: (string) => 'royal 👑 ' + string,
        nucleus: () => 'royalty 👑'
    },
    dating: {
        modify: (string) => string + ' (and they are dating) '
            + (0, utils_1.pick)([
                '(because they love each other)',
                '(for appearances)',
                '(in like a celebrity relationship way)',
                '(its very toxic)',
                '',
            ]),
        nucleus: (number) => (new Array(number).fill('')).map(() => (0, utils_1.pick)([
            'girlfriend',
            'boyfriend',
            'partner'
        ])).join(' and '),
    },
    married: {
        nucleus: (number = 1) => (new Array(number).fill('')).map(() => (0, utils_1.pick)([
            'husband',
            'wife',
            'spouse'
        ])).join(' and '),
        modify: (string) => string + ' who are married '
            + (0, utils_1.pick)([
                '(because they are in love)',
                '(theyre about to get divorced)',
                '(for tax benefits)',
                '(ironically)',
                '(unironically)',
                `(for the ${(0, utils_1.pick)(['health', 'dental', 'vision'])} insurance)`,
                '(because they are extremely christian)',
            ]),
    },
    // astronauts: {
    //   modify: (string) => 'astronaut ' + string,
    //   nucleus: () => 'astronauts'
    // },
    kissing: {
        modify: (string) => string + ' who make out ' + (0, utils_1.pick)([
            'sometimes',
            'constantly',
            'all the time',
            'on holidays',
            'in a craaazy straight girls at a party way',
            'in a gay way',
        ]),
        nucleus: () => 'makeout friends'
    },
    coworkers: {
        modify: (string) => string + ' who are coworkers',
        nucleus: () => 'coworkers'
    },
    coparents: {
        modify: (string) => 'coparenting ' + string,
        nucleus: () => 'coparents of '
            + (0, utils_1.pick)([
                (0, utils_1.pick)(['2', '3', '4', '8']) + ' children',
                (0, utils_1.pick)(['2', '3', '4', '8']) + ' dogs',
                (0, utils_1.pick)(['2', '3', '4', '8']) + ' cats',
                (0, utils_1.pick)(['2', '3', '4', '8']) + ' horses',
            ])
    },
    cohabiting: {
        modify: (string) => 'cohabiting ' + string,
        nucleus: () => 'roommates'
    },
    // cohortmates: {
    //   modify: (string) => string + ' who went to codesmith together',
    //   nucleus: () => 'codesmith cohortmates'
    // },
    // colleages: {
    //   modify: (string) => string + ' who go to the same school',
    //   nucleus: () => 'colleagues'
    // },
    // secretkeepers: {
    //   modify: (string) => string + ' who tell each other everything',
    //   nucleus: () => 'secret-keepers'
    // },
    swimTeam: {
        modify: (string) => string + ' who are on a swim team together',
        nucleus: () => 'co-captains of the swim team'
    },
    // shelterForWeasels: {
    //   modify: (string) => string + ' who run a shelter for feral weasels',
    //   nucleus: () => 'co-owners of the california league for the safekeeping of '
    //     + pick(['weasels', 'tarantulas', 'squirrels', 'marmots', 'rats', 'beetles'])
    // },
    drinkingBuddies: {
        modify: (string) => string + ' who are drinking buddies',
        nucleus: () => 'drinking buddies'
    },
    // alterEgos: {
    //   modify: (string) => string + ' who are each other\'s alter ego',
    //   nucleus: () => 'mutual alter-egos'
    // },
    // doublesCurling: {
    //   modify: (string) => string + ' who play doubles on the ' + pick(['american', 'australian', 'canadian', 'alaskan', 'californian']) + ' olympic curling team',
    //   nucleus: () => 'curling doubles'
    // },
    // twins: {
    //   modify: (string) => string + ' who are unrelated twins ' + pick(['(through magic)', '(through marriage)', '(through cloning)']),
    //   nucleus: () => 'twins (unrelated)'
    // },
    // compost: {
    //   modify: (string) => string + ' who share a compost pile',
    //   nucleus: () => 'compost-pile-sharers'
    // },
    proGamers: {
        modify: (string) => string
            + ' who play on the same pro level '
            + (0, utils_1.pick)(['league of legends', 'overwatch', 'rocket league', 'CS:GO', 'Puyo Puyo Tetris'])
            + ' team',
        nucleus: () => 'pro gamers'
    },
    youtubers: {
        modify: (string) => string
            + ' who run a youtube channel together about '
            + (0, utils_1.pick)([
                'gardening',
                'homemade fireworks',
                'travel',
                (0, utils_1.pick)([
                    'oklahoma city',
                    'long beach',
                    'seattle',
                    'portland',
                    'boise',
                    'austin',
                    'atlanta',
                    'kansas city'
                ])
                    + ' local politics'
            ]),
        nucleus: () => 'youtubers'
    },
    crimeFighters: {
        modify: (string) => string
            + ' who fight crime together '
            + (0, utils_1.pick)([
                '(financial)',
                '(drugs)',
                '(but only crimes that poor people do)',
                '(illegal plant trafficking)',
                '(labor violations)',
                '(campaign finance crime)',
                '(metaphorically)'
            ]),
        nucleus: () => 'crime fighters'
    },
    gameDesigners: {
        modify: (string) => string
            + ' who are making a video game about '
            + (0, utils_1.pick)([
                'trains',
                'wizards',
                'seattle city politics',
                'drug trafficking',
                'depression',
                'the 1886 haymarket riots',
            ]),
        nucleus: () => 'game designers'
    },
};
const generateRelationship = (guild) => {
    const numberOfPeople = (0, utils_1.pick)([2, 2, 3]);
    const numberOfFacets = (0, utils_1.pick)([3, 4]);
    const people = Array(numberOfPeople).fill('').map(generateName_1.generateName);
    let possibleFacets = Object.keys(relationshipFacets);
    let facets = [];
    for (let i = 0; i < numberOfFacets; i++) {
        let facet = (0, utils_1.pick)(possibleFacets.filter((facet) => !facets.includes(facet)));
        facets.push(facet);
    }
    let relationshipString = relationshipFacets[facets[0]].nucleus(numberOfPeople);
    for (let i = 1; i < facets.length; i++) {
        const facet = facets[i];
        relationshipString = relationshipFacets[facet].modify(relationshipString);
    }
    if (relationshipString.split('who').length > 2) {
        const temp = relationshipString.split('who').slice(1).join('who');
        const newTemp = temp.split('who').join('and');
        relationshipString = relationshipString.split('who')[0] + 'who' + newTemp;
    }
    let resultString;
    if (people.length === 2) {
        resultString = `${(0, utils_1.wrapNameWithHearts)(people[0], guild)} and ${(0, utils_1.wrapNameWithHearts)(people[1], guild)} are ${relationshipString}`;
    }
    else
        resultString = `${(0, utils_1.wrapNameWithHearts)(people[0], guild)}, ${(0, utils_1.wrapNameWithHearts)(people[1], guild)}, and ${(0, utils_1.wrapNameWithHearts)(people[2], guild)} are ${relationshipString}`;
    return resultString;
};
exports.generateRelationship = generateRelationship;
