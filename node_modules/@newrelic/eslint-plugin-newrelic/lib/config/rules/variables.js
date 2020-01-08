// VARIABLES (eslint)
// These rules relate to variable declarations.
// https://eslint.org/docs/rules/#variables

module.exports = {
  rules: {
    // require or disallow initialization in variable declarations
    // https://eslint.org/docs/rules/init-declarations
    'init-declarations': 'off',

    // disallow deleting variables
    // https://eslint.org/docs/rules/no-delete-var
    'no-delete-var': 'error',

    // disallow labels that share a name with a variable
    // https://eslint.org/docs/rules/no-label-var
    'no-label-var': 'error',

    // disallow specified global variables
    // https://eslint.org/docs/rules/no-restricted-globals
    'no-restricted-globals': 'off',

    // disallow variable declarations from shadowing variables declared in the
    // outer scope
    // https://eslint.org/docs/rules/no-shadow
    'no-shadow': 'off',

    // disallow identifiers from shadowing restricted names
    // https://eslint.org/docs/rules/no-shadow-restricted-names
    'no-shadow-restricted-names': 'error',

    // disallow the use of undeclared variables unless mentioned in /*global */
    // comments
    // https://eslint.org/docs/rules/no-undef
    'no-undef': 'error',

    // disallow initializing variables to undefined
    // https://eslint.org/docs/rules/no-undef-init
    'no-undef-init': 'error',

    // disallow the use of undefined as an identifier
    // https://eslint.org/docs/rules/no-undefined
    'no-undefined': 'off',

    // disallow unused variables
    // https://eslint.org/docs/rules/no-unused-vars
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        caughtErrors: 'none'
      }
    ],

    // disallow the use of variables before they are defined
    // https://eslint.org/docs/rules/no-use-before-define
    'no-use-before-define': 'off'
  }
};
