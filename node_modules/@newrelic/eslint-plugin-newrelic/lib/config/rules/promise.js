// PROMISE (eslint-plugin-promise)
// These rules relate to possible syntax or logic errors in JavaScript code.
// https://github.com/xjamundx/eslint-plugin-promise

module.exports = {
  plugins: ['promise'],
  rules: {
    // Enforces the use of catch() on un-returned promises.
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/catch-or-return.md
    'promise/catch-or-return': 'off',

    // Avoid wrapping values in Promise.resolve or Promise.reject when not needed.
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-return-wrap.md
    'promise/no-return-wrap': 'off',

    // Enforce consistent param names and ordering when creating new promises.
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/param-names.md
    'promise/param-names': 'error',

    // Return inside each then() to create readable and reusable Promise chains.
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/always-return.md
    'promise/always-return': 'off',

    // In an ES5 environment, make sure to create a Promise constructor before using.
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-native.md
    'promise/no-native': 'off',

    // Avoid nested then() or catch() statements
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-nesting.md
    'promise/no-nesting': 'off',

    // Avoid using promises inside of callbacks
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-promise-in-callback.md
    'promise/no-promise-in-callback': 'off',

    // Avoid calling cb() inside of a then() (use nodeify instead)
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-callback-in-promise.md
    'promise/no-callback-in-promise': 'off',

    // Avoid creating new promises outside of utility libs (use pify instead)
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/avoid-new.md
    'promise/avoid-new': 'off',

    // Avoid calling new on a Promise static method
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-new-statics.md
    'promise/no-new-statics': 'error',

    // Disallow return statements in finally()
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-return-in-finally.md
    'promise/no-return-in-finally': 'off',

    // Ensures the proper number of arguments are passed to Promise functions
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/valid-params.md
    'promise/valid-params': 'error',

    // Prefer await to then() for reading Promise values
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/prefer-await-to-then.md
    'promise/prefer-await-to-then': 'off',

    // Prefer async/await to the callback pattern
    // https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/prefer-await-to-callbacks.md
    'promise/prefer-await-to-callbacks': 'off'
  }
};
