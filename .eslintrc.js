module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:@newrelic/eslint-plugin-newrelic/react',
    'plugin:@newrelic/eslint-plugin-newrelic/jest',
    'plugin:@newrelic/eslint-plugin-newrelic/prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
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
