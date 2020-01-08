// ESLINT COMMENTS (eslint-plugin-eslint-comments)
// Additional ESLint rules for ESLint directive comments
// https://github.com/mysticatea/eslint-plugin-eslint-comments

module.exports = {
  plugins: ['eslint-comments'],
  rules: {
    // warns eslint-disable directive-comments if the eslint-enable
    // directive-comment for that does not exist.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html
    'eslint-comments/disable-enable-pair': ['error', {
      allowWholeFile: true
    }],

    // warns eslint-enable directive-comments which enable rules for multiple
    // eslint-disable directive-comments.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-aggregating-enable.html
    'eslint-comments/no-aggregating-enable': 'error',

    // warns duplicate eslint-disable directive-comments.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-duplicate-disable.html
    'eslint-comments/no-duplicate-disable': 'error',

    // eslint-disable directive-comments disable all rules by default. This may
    // cause to overlook some ESLint warnings unintentionally. So you should
    // specify the rules to disable accurately.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html
    'eslint-comments/no-unlimited-disable': 'error',

    // warns unnecessary eslint-disable directive-comments.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unused-disable.html
    'eslint-comments/no-unused-disable': 'error',

    // warns eslint-enable directive-comments which have no effect.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unused-enable.html
    'eslint-comments/no-unused-enable': 'error',

    //  warns eslint-disable directive-comments if the comment disable specific
    // rules.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-restricted-disable.html
    'eslint-comments/no-restricted-disable': 'off',

    // disallows a use of directive-comments.
    // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-use.html
    'eslint-comments/no-use': 'off'
  }
};
