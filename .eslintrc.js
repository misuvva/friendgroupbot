module.exports = {
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 6,
    requireConfigFile: false,
  },
  parser: '@babel/eslint-parser',
  rules: {
    'react/jsx-quotes': 0,
    'block-scoped-var': 0,
    'padded-blocks': 0,
    quotes: [1, 'single'],
    'comma-style': [2, 'last'],
    'eol-last': 0,
    'no-console': 0,
    'func-names': 0,
    'prefer-const': 0,
    'no-plusplus': 'off',
    'no-shadow': 'off',
    'max-len': 'off',
    'comma-dangle': 0,
    'spaced-comment': 0,
    'dot-notation': 0,
    'id-length': 0,
    'no-var': 0,
    'new-cap': 0,
    indent: [2, 2, { SwitchCase: 1 }]
  },
};
