const path = require('path');
const { resolveAlias } = require('babel-plugin-alias-config');
const pkg = require('./package.json');
const options = require('./options');

const StyleScoped = {};

module.exports = {
  buildJs(babelConfig) {
    if (!options.scopeStyle || !options.alias) return;

    const rootDir = options.root
      ? path.resolve(process.cwd(), options.root)
      : process.cwd();

    let babelEnvIndex = -1;
    let scopeStyleIndex = -1;
    let babelReactIndex = -1;
    let babelAliasIndex = -1;
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
        babelEnvIndex = index;
        return;
      }
      if (presetName.includes(path.join('@babel', 'preset-react'))) {
        babelReactIndex = index;
        return;
      }
      if (presetName.includes(path.join('rainbow-core', 'preset'))) {
        scopeStyleIndex = index;
        return;
      }
      if (presetName.includes('babel-preset-react-scope-style')) {
        scopeStyleIndex = index;
        return;
      }
      if (presetName.includes('babel-plugin-alias-config')) {
        babelAliasIndex = index;
      }
    });

    if (options.scopeStyle) {
      if (babelEnvIndex < 0 || babelReactIndex < 0) {
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
      if (scopeStyleIndex >= 0) {
        const oldOptions = babelConfig.presets[scopeStyleIndex][1] || {};
        const scopeNamespace = oldOptions.scopeNamespace || scopeStyleOptions.scopeNamespace;
        Object.assign(oldOptions, scopeStyleOptions, { scopeNamespace });
      } else {
        scopeStyleIndex = babelEnvIndex >= 0
          ? babelEnvIndex + 1
          : Math.max(babelReactIndex - 1, 0);
        babelConfig.presets.splice(scopeStyleIndex, 0, [scopeStylePresetPath, scopeStyleOptions]);
      }

      babelConfig.presets.splice(1, 0, [
        require.resolve('babel-preset-react-scope-style'),
        {
          scopeNamespace: pkg.namespace || '',
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
          },
        },
      ]);
    }

    if (options.alias) {
      if (babelAliasIndex >= 0) return;
      babelConfig.plugins.push([
        require.resolve('babel-plugin-alias-config'),
        {
          findConfig: true,
          noOutputExtension: true,
          config: options.aliasConfig
        }
      ]);
    }
  },
  buildPostcss(postcssPlugins) {
    if (!options.scopeStyle || !options.alias) return;

    const postcssPkg = require('postcss/package.json');
    const isPostcss8 = Number(postcssPkg.version[0]) >= 8;

    if (options.scopeStyle) {
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

    if (options.alias) {
      postcssPlugins.push(require(`postcss-alias-config/lib${isPostcss8 ? '/postcss8' : ''}`)({
        config: options.aliasConfig
      }));
    }
  },
};
