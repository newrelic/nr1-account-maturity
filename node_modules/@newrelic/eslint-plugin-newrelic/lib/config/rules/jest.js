// JEST (eslint-plugin-JEST)
// ESLint plugin for Jest
// https://github.com/jest-community/eslint-plugin-jest

module.exports = {
  plugins: ['jest'],
  env: {
    jest: true
  },
  rules: {
    // Enforce consistent test or it keyword
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/consistent-test-it.md
    'jest/consistent-test-it': 'off',

    // Enforce assertion to be made in a test body
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/expect-expect.md
    'jest/expect-expect': 'off',

    // Disallow capitalized test names
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/lowercase-name.md
    'jest/lowercase-name': 'off',

    // Disallow alias methods
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-alias-methods.md
    'jest/no-alias-methods': 'error',

    // Disallow commented out tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-commented-out-tests.md
    'jest/no-commented-out-tests': 'off',

    // Disallow disabled tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-disabled-tests.md
    'jest/no-disabled-tests': 'error',

    // Disallow duplicate hooks within a describe block
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-duplicate-hooks.md
    'jest/no-duplicate-hooks': 'error',

    // Disallow empty titles
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-empty-title.md
    'jest/no-empty-title': 'error',

    // Disallow using expect().resolves
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-expect-resolves.md
    'jest/no-expect-resolves': 'off',

    // Disallow export from test files
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-export.md
    'jest/no-export': 'off',

    // Disallow focused tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-focused-tests.md
    'jest/no-focused-tests': 'error',

    // Disallow setup and teardown hooks
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-hooks.md
    'jest/no-hooks': 'off',

    // Disallow identical titles
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-identical-title.md
    'jest/no-identical-title': 'error',

    // Disallow conditional logic
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-if.md
    'jest/no-if': 'off',

    // Disallow Jasmine globals
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-jasmine-globals.md
    'jest/no-jasmine-globals': 'error',

    // Disallow importing jest
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-jest-import.md
    'jest/no-jest-import': 'error',

    // Disallow large snapshots
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-large-snapshots.md
    'jest/no-large-snapshots': 'off',

    // Disallow manually importing from __mocks__
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-mocks-import.md
    'jest/no-mocks-import': 'off',

    // Prevents expect statements outside of a test or it block
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-standalone-expect.md
    'jest/no-standalone-expect': 'off',

    // Using a callback in asynchronous tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-test-callback.md
    'jest/no-test-callback': 'off',

    // Disallow using f & x prefixes to define focused/skipped tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-test-prefixes.md
    'jest/no-test-prefixes': 'off',

    // Disallow explicitly returning from tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-test-return-statement.md
    'jest/no-test-return-statement': 'off',

    // Disallow using toBeTruthy() & toBeFalsy()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-truthy-falsy.md
    'jest/no-truthy-falsy': 'off',

    // Prevent catch assertions in tests
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-try-expect.md
    'jest/no-try-expect': 'off',

    // Suggest using toBeCalledWith() OR toHaveBeenCalledWith()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-called-with.md
    'jest/prefer-called-with': 'off',

    // Suggest using expect.assertions() OR expect.hasAssertions()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-expect-assertions.md
    'jest/prefer-expect-assertions': 'off',

    // Suggest using toMatchInlineSnapshot()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-inline-snapshots.md
    'jest/prefer-inline-snapshots': 'off',

    // Suggest using jest.spyOn()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-spy-on.md
    'jest/prefer-spy-on': 'off',

    // Suggest using toStrictEqual()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-strict-equal.md
    'jest/prefer-strict-equal': 'off',

    // Suggest using toBeNull()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-to-be-null.md
    'jest/prefer-to-be-null': 'off',

    // Suggest using toBeUndefined()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-to-be-undefined.md
    'jest/prefer-to-be-undefined': 'off',

    // Suggest using toContain()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-to-contain.md
    'jest/prefer-to-contain': 'off',

    // Suggest using toHaveLength()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-to-have-length.md
    'jest/prefer-to-have-length': 'off',

    // Suggest using test.todo()
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/prefer-todo.md
    'jest/prefer-todo': 'off',

    // Require a top-level describe block
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/require-top-level-describe.md
    'jest/require-top-level-describe': 'off',

    // Require that toThrow() and toThrowError includes a message
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/require-tothrow-message.md
    'jest/require-tothrow-message': 'off',

    // Enforce valid describe() callback
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/valid-describe.md
    'jest/valid-describe': 'error',

    // Enforce having return statement when testing with promises
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/valid-expect-in-promise.md
    'jest/valid-expect-in-promise': 'error',

    // Enforce valid expect() usage
    // https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/valid-expect.md
    'jest/valid-expect': 'error'
  }
};
