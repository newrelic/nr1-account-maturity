# `@newrelic/eslint-plugin-newrelic`

> This package provides New Relic's [Eslint](https://eslint.org/) configuration as an extensible shared config.

## About this project

This eslint configuration is in early development for use in new open source projects.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Getting started](#getting-started)
- [Available configs](#available-configs)
  - [Base](#base)
  - [Addons](#addons)
- [Directory structure](#directory-structure)
- [FAQ](#faq)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

* Install the plugin `npm install --save-dev @newrelic/eslint-plugin-newrelic`
* Install required peer dependencies:
  * In all cases, you need [eslint](https://eslint.org/).
  * If you prefer to enforce styles with [prettier](https://prettier.io), you will also need to install it.
* Create a file named `.eslintrc.js` in the root of your project and configure it to extend from the base eslint config and addons that are right for your project. For example, if your project uses react, jest, and prettier, the file should look something like this. See [eslint's configuration documentation](https://eslint.org/docs/user-guide/configuring) for more details.

```
module.exports = {
  extends: [
    'plugin:@newrelic/eslint-plugin-newrelic/react',
    'plugin:@newrelic/eslint-plugin-newrelic/jest',
    'plugin:@newrelic/eslint-plugin-newrelic/prettier'
  ]
}
```

* Run eslint against your files. The exact arguments will vary based on the configuration of your project. For example, to process all files with the extension `.js` in the current directory: `npx eslint . --ext .js`. See [eslint's cli documentation](https://eslint.org/docs/user-guide/command-line-interface) for more details.
* To automate fixing issues (where possible -- these are mostly style issues), use the `--fix` flag. For example: `npx eslint . --ext .js --fix`
* Consider adding linting-related items to `scripts` in your `package.json`. A simple example in your package.json might look something like this.

```
"scripts": {
  "lint": "eslint . --ext .js",
  "lint:fix": "npm run lint -- --fix"
}
```
* Consider configuring your text editor to use eslint plugins to highlight issues and fix on saving a file. This helps catch issues as you go instead of trying to fix them all at the end.

## Available configs

### Base

Base eslint configurations cover the majority of linting configuration for common JavaScript development use cases. You **SHOULD** pick one of these.

* [**core**](lib/config/core.js) - Generic base linting configuration. The other base configurations extend from this one. Use this if none of the other base configs make sense for your use case.
* [**react**](lib/config/react.js) - Base linting configuration for [react](https://reactjs.org) projects.
* [**node**](lib/config/node.js) - Base linting configuration for [node](https://nodejs.org) projects. *This config is currently very minimalist and needs work.*

### Addons

Addon eslint configurations provide additional linting configuration for optional tools/libraries/etc. that you may use on top of a base use case (e.g. a specific testing library). You may use as many of these as is appropriate for your project.

* [**jest**](lib/config/jest.js) - Linting for projects using [jest](https://github.com/facebook/jest) for testing. This is commonly used with the `react` base config.
* [**prettier**](lib/config/prettier.js) - For projects that would like to use [prettier](https://prettier.io/) to manage style considerations instead of eslint. **Make sure you include this config last to ensure it disables all conflicting eslint rules.** It is configured to run prettier through eslint and output problems as eslint errors. Likewise, it will fix using prettier when you use the `--fix` option with eslint.
* [**typescript**](lib/config/typescript.js) - For projects that would like to use TypeScript instead of ES6.


## Directory structure

```
.
├── /lib/                           # Plugin source code
│   ├── /config/                    # Shared configs go here
│   │   ├── /rules/                 # Rules for shared configs
│   │   │   └── *.js                # Config specific to chunk of related eslint rules.
│   │   ├── core.js                 # Core shared eslint config.
│   │   └── *.js                    # Shared eslint config.
│   └── /index.js                   # Main file - exports plugin configuration
├── /node_modules/                  # 3rd-party libraries and utilities
├── package.json                    # The list of 3rd party libraries and utilities
└── README.md                       # Info about the project
```
