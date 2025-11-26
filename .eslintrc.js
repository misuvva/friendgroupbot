module.exports = {
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
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
    indent: 'off',
    '@typescript-eslint/indent': [2, 2, { SwitchCase: 1 }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-unresolved': 0, // TypeScript handles this
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
