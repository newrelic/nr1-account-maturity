// ECMASCRIPT 6 (eslint)
// These rules relate to ES6, also known as ES2015.
// https://eslint.org/docs/rules/#ecmascript-6

module.exports = {
  rules: {
    // require braces around arrow function bodies
    // https://eslint.org/docs/rules/arrow-body-style
    'arrow-body-style': 'off',

    // require parentheses around arrow function arguments
    // https://eslint.org/docs/rules/arrow-parens
    'arrow-parens': ['error', 'as-needed', {
      requireForBlockBody: true
    }],

    // enforce consistent spacing before and after the arrow in arrow functions
    // https://eslint.org/docs/rules/arrow-spacing
    'arrow-spacing': 'error',

    // require super() calls in constructors
    // https://eslint.org/docs/rules/constructor-super
    'constructor-super': 'error',

    // enforce consistent spacing around * operators in generator functions
    // https://eslint.org/docs/rules/generator-star-spacing
    'generator-star-spacing': 'off',

    // disallow reassigning class members
    // https://eslint.org/docs/rules/no-class-assign
    'no-class-assign': 'error',

    // disallow arrow functions where they could be confused with comparisons
    // https://eslint.org/docs/rules/no-confusing-arrow
    'no-confusing-arrow': 'error',

    // disallow reassigning const variables
    // https://eslint.org/docs/rules/no-const-assign
    'no-const-assign': 'error',

    // disallow duplicate class members
    // https://eslint.org/docs/rules/no-dupe-class-members
    'no-dupe-class-members': 'error',

    // disallow duplicate module imports
    // https://eslint.org/docs/rules/no-duplicate-imports
    'no-duplicate-imports': 'off',

    // disallow new operators with the Symbol object
    // https://eslint.org/docs/rules/no-new-symbol
    'no-new-symbol': 'error',

    // disallow specified modules when loaded by import
    // https://eslint.org/docs/rules/no-restricted-imports
    'no-restricted-imports': 'off',

    // disallow this/super before calling super() in constructors
    // https://eslint.org/docs/rules/no-this-before-super
    'no-this-before-super': 'error',

    // disallow unnecessary computed property keys in object literals
    // https://eslint.org/docs/rules/no-useless-computed-key
    'no-useless-computed-key': 'error',

    // disallow unnecessary constructors
    // https://eslint.org/docs/rules/no-useless-constructor
    // NOTE: Not including this because of issues with typescript. Should
    // investigate workarounds when time allows.
    'no-useless-constructor': 'off',

    // disallow renaming import, export, and destructured assignments to the
    // same name
    // https://eslint.org/docs/rules/no-useless-rename
    'no-useless-rename': 'error',

    // require let or const instead of var
    // https://eslint.org/docs/rules/no-var
    'no-var': 'error',

    // require or disallow method and property shorthand syntax for object
    // literals
    // https://eslint.org/docs/rules/object-shorthand
    'object-shorthand': 'off',

    // require using arrow functions for callbacks
    // https://eslint.org/docs/rules/prefer-arrow-callback
    'prefer-arrow-callback': 'off',

    // require const declarations for variables that are never reassigned after
    // declared
    // https://eslint.org/docs/rules/prefer-const
    'prefer-const': ['error', { destructuring: 'all' }],

    // require destructuring from arrays and/or objects
    // https://eslint.org/docs/rules/prefer-destructuring
    'prefer-destructuring': 'off',

    // disallow parseInt() and Number.parseInt() in favor of binary, octal, and
    // hexadecimal literals
    // https://eslint.org/docs/rules/prefer-numeric-literals
    'prefer-numeric-literals': 'error',

    // require rest parameters instead of arguments
    // https://eslint.org/docs/rules/prefer-rest-params
    'prefer-rest-params': 'off',

    // require spread operators instead of .apply()
    // https://eslint.org/docs/rules/prefer-spread
    'prefer-spread': 'error',

    // require template literals instead of string concatenation
    // https://eslint.org/docs/rules/prefer-template
    'prefer-template': 'error',

    // require generator functions to contain yield
    // https://eslint.org/docs/rules/require-yield
    'require-yield': 'error',

    // enforce spacing between rest and spread operators and their expressions
    // https://eslint.org/docs/rules/rest-spread-spacing
    'rest-spread-spacing': 'error',

    // enforce sorted import declarations within modules
    // https://eslint.org/docs/rules/sort-imports
    'sort-imports': 'off',

    // require symbol descriptions
    // https://eslint.org/docs/rules/symbol-description
    'symbol-description': 'error',

    // require or disallow spacing around embedded expressions of template
    // strings
    // https://eslint.org/docs/rules/template-curly-spacing
    'template-curly-spacing': 'error',

    // require or disallow spacing around the * in yield* expressions
    // https://eslint.org/docs/rules/yield-star-spacing
    'yield-star-spacing': 'error'
  }
};
