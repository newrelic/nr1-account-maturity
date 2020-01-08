// Eslint configuration specific to Node.js development.
// NOTE: This is very minimalist right now.

module.exports = {
  extends: [
    './core',
    './rules/node-and-commonjs'
  ].map(require.resolve),
  env: {
    node: true
  },
  parserOptions: {},
  settings: {},
  rules: {
    // In node, there are many more reasonable use cases for consoles than there
    // are in web, so we don't error on it here.
    'no-console': 'off'
  }
};
