const path = require('path');
const fs = require('fs');
const { resolveAlias } = require('babel-plugin-alias-config');

const buildOptionsFile = path.resolve(__dirname, '../cache/_build-options.json');

const _toString = Object.prototype.toString;
function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

const StyleScoped = {};

module.exports = {
  buildJs(babelConfig) {
    const buildOptions = fs.existsSync(buildOptionsFile) ? require(buildOptionsFile) : {};
    if (!buildOptions.scopeStyle || !buildOptions.alias || !buildOptions.define) return;

    const rootDir = buildOptions.root
      ? path.resolve(process.cwd(), buildOptions.root)
      : process.cwd();

    let presetEnvIndex = -1;
    let presetScopeStyleIndex = -1;
    let presetReactIndex = -1;
    babelConfig.presets.forEach((preset, index) => {
      let presetOptions;
      if (Array.isArray(preset)) {
        presetOptions = preset[1];
        preset = preset[0];
      } else if (typeof preset === 'string') {
        presetOptions = {};
        babelConfig.presets[index] = [preset, presetOptions];
      } else return;
      let presetName = preset.toLowerCase();
      if (presetName.includes(path.join('@babel', 'preset-env'))) {
        presetEnvIndex = index;
        return;
      }
      if (presetName.includes(path.join('@babel', 'preset-react'))) {
        presetReactIndex = index;
        return;
      }
      if (presetName.includes(path.join('rainbow-core', 'preset'))) {
        presetScopeStyleIndex = index;
        return;
      }
      if (presetName.includes('babel-preset-react-scope-style')) {
        presetScopeStyleIndex = index;
      }
    });
    let pluginAliasIndex = -1;
    let pluginDefineIndex = -1;
    babelConfig.plugins.forEach((plugin, index) => {
      let pluginOptions;
      if (Array.isArray(plugin)) {
        pluginOptions = plugin[1];
        plugin = plugin[0];
      } else if (typeof plugin === 'string') {
        pluginOptions = {};
        babelConfig.plugins[index] = [plugin, pluginOptions];
      } else return;
      let pluginName = plugin.toLowerCase();
      if (pluginName.includes('babel-plugin-alias-config')) {
        pluginAliasIndex = index;
        return;
      }
      if (pluginName.includes('babel-plugin-define-variables')) {
        pluginDefineIndex = index;
      }
    });

    if (buildOptions.scopeStyle) {
      if (presetEnvIndex < 0 || presetReactIndex < 0) {
        throw new Error('[build-react-esm-project] not find [@babel/preset-env] or [@babel/preset-react]!');
      }
      const scopeStylePresetPath = require.resolve('babel-preset-react-scope-style');
      const projectPkg = require(path.resolve(rootDir, 'package.json'));
      let scopeStyleOptions = {
        scopeNamespace: projectPkg.namespace || '',
        scope(p1, p2, scoped) {
          let filename = scoped.filename.replace(/\.(js|jsx)$/, '.css');
          if (scoped.global && scoped.source) {
            let source = scoped.source.split('?')[0];
            if (!source.startsWith('.')) {
              source = resolveAlias(scoped.filename, source, { findConfig: true, noOutputExtension: true });
            }
            if (!source.endsWith('.css')) source = source.replace(/\.(scss|less)$/, '.css');
            filename = path.resolve(path.dirname(filename), source);
          }
          if (!StyleScoped[filename] || !StyleScoped[filename].scopeId) {
            StyleScoped[filename] = { scopeId: scoped.scopeId, global: Boolean(scoped.global) };
          }
          return '.css'/* + p2 */;
        }
      };
      if (presetScopeStyleIndex >= 0) {
        const oldOptions = babelConfig.presets[presetScopeStyleIndex][1] || {};
        const scopeNamespace = oldOptions.scopeNamespace || scopeStyleOptions.scopeNamespace;
        Object.assign(oldOptions, scopeStyleOptions, { scopeNamespace });
      } else {
        presetScopeStyleIndex = presetEnvIndex >= 0
          ? presetEnvIndex + 1
          : Math.max(presetReactIndex - 1, 0);
        babelConfig.presets.splice(presetScopeStyleIndex, 0, [scopeStylePresetPath, scopeStyleOptions]);
      }
    }

    if (buildOptions.alias) {
      if (pluginAliasIndex >= 0) return;
      babelConfig.plugins.push([
        require.resolve('babel-plugin-alias-config'),
        {
          findConfig: true,
          noOutputExtension: true,
          config: buildOptions.aliasConfig
        }
      ]);
    }

    if (buildOptions.define) {
      if (pluginDefineIndex >= 0) return;

      const env = process.env || {};
      let define = {};
      Object.keys(env).forEach(key => {
        if (!/^[A-Z0-9_]+$/.test(key)) return;
        define[`process.env.${key}`] = env[key];
      });

      const defineConfigFile = buildOptions.defineConfig
        ? path.resolve(rootDir, buildOptions.defineConfig)
        : '';
      let customDefineConfig;
      if (defineConfigFile && fs.existsSync(defineConfigFile)) {
        customDefineConfig = require(defineConfigFile);
        if (typeof customDefineConfig === 'function') {
          customDefineConfig = customDefineConfig(define, buildOptions);
        }
        if (customDefineConfig && isPlainObject(customDefineConfig)) define = customDefineConfig;
      }

      if (customDefineConfig !== false) {
        babelConfig.plugins.push([
          require.resolve('babel-plugin-define-variables'),
          { define }
        ]);
      }
    }
  },
  buildPostcss(postcssPlugins) {
    const buildOptions = fs.existsSync(buildOptionsFile) ? require(buildOptionsFile) : {};
    if (!buildOptions.scopeStyle || !buildOptions.alias) return;

    const postcssPkg = require('postcss/package.json');
    const isPostcss8 = Number(postcssPkg.version[0]) >= 8;

    if (buildOptions.scopeStyle) {
      postcssPlugins.push(require(`babel-preset-react-scope-style/postcss${isPostcss8 ? '/postcss8' : ''}`)(root => {
        const filename = root.source.input.file;
        const scoped = StyleScoped[filename];
        if (!scoped) return { scoped: false };
        return {
          scoped: true,
          global: scoped.global,
          id: scoped.scopeId,
        };
      }));
    }

    if (buildOptions.alias) {
      postcssPlugins.push(require(`postcss-alias-config/lib${isPostcss8 ? '/postcss8' : ''}`)({
        config: buildOptions.aliasConfig
      }));
    }
  },
};
