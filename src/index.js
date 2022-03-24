const fs = require('fs');
const path = require('path');

function execCommand(name, options = {}) {
  const esmExecCommand = require('build-esm-project').execCommand;
  const mergeEsmConfig = require('build-esm-project').mergeEsmConfig;

  Object.assign(require('./options'), options);

  const rootDir = options.root
    ? path.resolve(process.cwd(), options.root)
    : process.cwd();
  const esmConfigFile = options.esmConfig
    ? path.resolve(rootDir, options.esmConfig)
    : path.resolve(rootDir, './esm-project.config.js');

  const reactEsmConfigFile = require.resolve('./esm-project.config');
  const reactEsmConfig = require(reactEsmConfigFile);
  if (fs.existsSync(esmConfigFile)) {
    let esmConfig = require(esmConfigFile);
    let newEsmConfig = mergeEsmConfig(esmConfig, reactEsmConfig);
    Object.assign(reactEsmConfig, newEsmConfig);
  }

  options.esmConfig = reactEsmConfigFile;
  options.commandPrefx = '[build-react-esm-project]';

  return esmExecCommand(name, options);
}

module.exports = {
  execCommand
};
