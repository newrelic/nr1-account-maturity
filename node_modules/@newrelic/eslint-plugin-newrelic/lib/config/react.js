// Eslint configuration specific to React development.

module.exports = {
  extends: [
    './core',
    './rules/react'
  ].map(require.resolve),
  env: {
    browser: true,
    es6: true
  },
  globals: {
    __nr: true
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // Allow empty error functions in React use cases, because they are
    // sometimes used as noops or default functions in these use cases.
    'no-empty-function': ['error', { allow: ['arrowFunctions'] }]
  }
};
