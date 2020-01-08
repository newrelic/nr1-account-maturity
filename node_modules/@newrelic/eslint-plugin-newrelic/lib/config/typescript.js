// Eslint configuration specific to using typescript.
// Should be used alongside other base configs (e.g. core, react, node) when
// you want to use typescript.

module.exports = {
  overrides: [{
    files: ['**/*.ts', '**/*.tsx'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [],
    rules: {}
  }]
};
