#!/usr/bin/env node

const start = require('build-esm-project/src/start');
const execCommand = require('../src/index').execCommand;

start(execCommand, {
  command(commandName, command, commandOptions) {
    command.option('--scope-style', 'whether apply scope style');
    command.option('--alias', 'handle alias in scripts/styles file');
    command.option('--alias-config <path>', 'provide alias config file path, default is process.cwd()/alias.config.js');
    command.option('--define', 'handle define in scripts file');
  }
});
