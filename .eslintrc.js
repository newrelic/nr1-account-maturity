module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['.eslintrc.js'],
      env: {
        node: true,
        browser: false,
      },
    },
  ],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    __nr: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['import', 'promise', 'eslint-comments', 'react', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'import/no-unresolved': 'off',
    'react/prop-types': 0,
    'eslint-comments/no-unused-disable': 0,
    'eslint-comments/no-unlimited-disable': 0,
    'promise/catch-or-return': 0,
    'promise/no-callback-in-promise': 0,
    'promise/always-return': 0,
    'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
  },
};
