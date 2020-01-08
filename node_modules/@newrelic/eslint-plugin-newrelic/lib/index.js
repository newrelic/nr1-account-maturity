module.exports = {
  rules: {},
  configs: {
    // Core configs - When extending, one of these should go first
    core: require('./config/core'),
    node: require('./config/node'),
    react: require('./config/react'),

    // Additional configs. Add these as you need them.
    jest: require('./config/jest'),
    prettier: require('./config/prettier'),
    typescript: require('./config/typescript')
  }
};
