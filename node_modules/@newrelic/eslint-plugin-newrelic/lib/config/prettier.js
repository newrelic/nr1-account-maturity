// Eslint configuration specific to using prettier for styling.
// Should be used alongside other base configs (e.g. core, react, node) when
// you want to use prettier.
// Make sure you include this as your last config.
// Runs prettier through eslint.

module.exports = {
  plugins: ['prettier'],
  extends: [
    'plugin:prettier/recommended',
    'prettier/react',
    'prettier/@typescript-eslint'
  ],
  rules: {
    'prettier/prettier': ['error', {
      singleQuote: true
    }, {
      usePrettierrc: false
    }]
  }
};
