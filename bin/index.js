#!/usr/bin/env node

const start = require('build-esm-project/src/start');
const execCommand = require('../src/index').execCommand;

start(execCommand, {
  command(commandName, command, commandOptions) {
    command.option('--scope-style', 'whether apply scope style');
    command.option('--scope-style-version', 'whether apply scope style with version');
    command.option('--scope-namespace <namespace>', 'scope namespace, default is process.cwd()/package.json:namespace');
    command.option('--alias', 'handle alias in scripts/styles file');
    command.option('--alias-config <path>', 'provide alias config file path, default is process.cwd()/alias.config.js');
    command.option('--define', 'handle define in scripts file');
    command.option('--define-config <path>', 'provide define config file path');
    command.option('--rainbow', 'is rainbow component');
    command.option('--vuelike', 'is vuelike component');
  }
});
