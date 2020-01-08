// Eslint configuration specific to Jest testing.
// Should be used alongside other base configs (e.g. core, react, node) when
// you use jest for testing.

module.exports = {
  extends: [
    './rules/jest'
  ].map(require.resolve)
};
