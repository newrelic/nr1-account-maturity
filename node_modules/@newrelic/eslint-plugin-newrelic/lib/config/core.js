// Base eslint configuration.

module.exports = {
  extends: [
    './rules/best-practices',
    './rules/es6',
    './rules/eslint-comments',
    './rules/import',
    './rules/possible-errors',
    './rules/promise',
    './rules/strict-mode',
    './rules/stylistic-issues',
    './rules/variables'
  ].map(require.resolve),
  plugins: ['@newrelic/newrelic'],
  env: {
    browser: true,
    node: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
};
