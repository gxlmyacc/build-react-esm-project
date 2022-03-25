const fs = require('fs');
const { parseOptions } = require('build-esm-project/src/config/utils');

function execCommand(name, options = {}) {
  const esmExecCommand = require('build-esm-project').execCommand;
  const mergeEsmConfig = require('build-esm-project').mergeEsmConfig;

  const {
    esmConfigFile
  } = parseOptions(options);

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
