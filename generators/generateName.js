const pick = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const generateName = () => {
  const firstParts = [
    'Ash',
    'Bee',
    'Bla',
    'Cor',
    'Du',
    'E',
    'Hay',
    'Hu',
    'Ja',
    'Jo',
    'Ju',
    'Ka',
    'Ke',
    'Li',
    'Ma',
    'Ri',
    'Ta',
    'Tri',
    'Zo',
    'Bla',
    'Tri',
    'Par',
    'Qui',
  ];
  const middleParts = [
    'sh',
    'shl',
    'lois',
    'tl',
    'lak',
    'rb',
    'nc',
    'll',
    'd',
    'nt',
    'cks',
    'sh',
    'st',
    'ther',
    'v',
    'rl',
    'tth',
    'l',
    'st',
    'st',
    'rk',
    'ch',
    // 'll', 'dd', 'tit', 'bip', 'kk', 'ck', 'x', 'zid', 'do', 'ngot', 'ngel',
    // 'fish', 'dish', 'gu', 'sked', 'ch', '-', '', 'nd', 'nt', 'ld', 'lg', 'lb',
    // 'nan', 'lel', 'shiz', 'tat'
  ];
  const endParts = [
    'er',
    'ey',
    'ise',
    'e',
    'in',
    'an',
    'a',
    'en',
    'on',
    'ua',
    'ummer',
    'evin',
    'iam',
    'ena',
    'ew',
    'ee',
    'is',
    'oe',
    'aze',
    'inn',
    'ard',
    // 'ian', 'an', 'ock', 'ell', 'ed',
    // 'athan', 'iel', 'ua', 'oise', 'er', 'en', 'in', 'a',
    // 'ia', 'e', 'y', 'is', 'ett', 'ette', 'ude', 'ina', 'elia', 'ela',
    // 'alana', 'ana', 'sa', 'ley', 'am', 'aham', 'iah', 'ah', 'eph', 'uel', 'eth', 'arus',
    // 'ai', 'ias', 'son', 'ahn', 'orf', 'ez', 'atsa'
  ];
  return pick([
    'Asher',
    'Ashley',
    'Beetle',
    // 'Duncan',
    'Hunter',
    'Mars',
    'Justin',
    'Liam',
    'Rilee',
    'Bennett',
    // 'Blake',
    'Blaze',
    'Corbin',
    'Basil',
    'Eloisa',
    'Hayden',
    'Jackson',
    'Katherine Summer',
    'Kevin',
    'Marlena',
    'Matthew',
    'Parker',
    'Quinn',
    'Serina',
    'Niq',
    'Tallis',
    'Tristan',
    'Darwin',
    'Bee'
  ]);
  return `${pick(firstParts)}${pick(middleParts)}${pick(endParts)}`;
};

module.exports = { generateName, pick };