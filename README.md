# build-react-esm-project

a react build command that will transform js/jsx/images/scss/less with gulp-babel/postcss/scss/less plugin, 
this is a good way to release an NPM package. see [demo](https://github.com/gxlmyacc/build-react-esm-project/tree/master/demo)

## Installtion

```bash
  npm install --save-dev build-react-esm-project
  // or 
  yarn add -D build-react-esm-project
```

## Usage

support "build"、"start" command:

"build" command:
```bash
## "build" command options:
##   --root <path>            provide project root directory, default process.cwd()
##   --build-config <path>    provide build esm config file path, default is process.cwd()/esm-project.config.js
##   --babel-config <path>    provide babel config file path, default is process.cwd()/babel.config.js
##   --postcss-config <path>  provide postcss config file path, default is process.cwd()/postcss.config.js
##   --less-config <path>     provide less config file path, default is process.cwd()/less.config.js
##   --scss-config <path>     provide scss config file path, default is process.cwd()/scss.config.js
##   --ignore <path>          provide igonre transfrom files
##   --src <path>             source directory, default is src
##   --out <path>             output directory, default is esm
##   -ts, --typescript,       is typescript project
##    --sourcemap             generate scripts`s sourcemap
##
##   --scope-style            enable scope style for scripts/styles files. 
##   --scope-namespace <namespace> scope namespace, default is "namespace" field in process.cwd()/package.json
##   --alias                  handle alias in scripts/styles file
##   --alias-config <path>    provide alias config file path, default is process.cwd()/alias.config.js
##   --define                 handle define in scripts file
##   --define-config <path>   provide define config file path

react-esm-project build
```
"start" command:
```bash
## "start" command options:
##   --root <path>            provide project root directory, default process.cwd()
##   --build-config <path>    provide build esm config file path, default is process.cwd()/esm-project.config.js
##   --babel-config <path>    provide babel config file path, default is process.cwd()/babel.config.js
##   --postcss-config <path>  provide postcss config file path, default is process.cwd()/postcss.config.js
##   --less-config <path>     provide less config file path, default is process.cwd()/less.config.js
##   --scss-config <path>     provide scss config file path, default is process.cwd()/scss.config.js
##   --ignore <path>          provide igonre transfrom files
##   --src <path>             source directory, default is src
##   --out <path>             output directory, default is esm
##   -ts, --typescript,       is typescript project
##    --sourcemap             generate scripts`s sourcemap
##
##   --scope-style            enable scope style for scripts/styles files. 
##   --scope-namespace <namespace> scope namespace, default is "namespace" field in process.cwd()/package.json
##   --alias                  handle alias in scripts/styles file
##   --alias-config <path>    provide alias config file path, default is process.cwd()/alias.config.js
##   --define                 handle define in scripts file
##   --define-config <path>   provide define config file path

react-esm-project start
```

### scope-style

`--scope-style` will enable `scope style`, see [babel-preset-react-scope-style](https://github.com/gxlmyacc/babel-preset-react-scope-style)

### alias
  
`--alias` will enable `handle aliases in scripts/styles file`, see [babel-plugin-alias-config](https://github.com/gxlmyacc/babel-plugin-alias-config) and [postcss-alias-config](https://github.com/gxlmyacc/postcss-alias-config)

### define

`--alias` will enable ` handle define in scripts file`, see [babel-plugin-define-variables](https://github.com/gxlmyacc/babel-plugin-define-variables)
## configuration

you also can config the `esm-project.config.js` to custom do something:
```js
// esm-project.config.js: 
module.exports = {
  cleanEsm(buildOptions, options) {
    // return false will skip
  },
  buildJs(buildOptions, babelConfig, options) {
    // return false will skip
  },
  buildPostcss(buildOptions, postcssPlugins, options) {
    // return false will skip
  },
  buildLess(buildOptions, lessConfig, options) {
    // return false will skip
  },
  buildScss(buildOptions, scssConfig, options) {
    // return false will skip
  },
  buildCss(buildOptions, cssConfig, options) {
    // return false will skip
  },
  buildOthers(buildOptions, othersConfig, options) {
    // return false will skip
  },
}
```

The following is the type definition of `esm-project.config.js`:
```ts
interface BuildOptions {
  root?: string,
  esmConfig?: string,
  babelConfig?: string,
  postcssConfig?: string,
  lessConfig?: string,
  scssConfig?: string,
  ignore?: string[],
  src?: string,
  out?: string,
  typescript?: boolean,
  sourcemap?: boolean,
  scopeStyle?: boolean,
  scopeNamespace?: boolean,
  alias?: boolean,
  aliasConfig?: string,
  define?: boolean,
  defineConfig?: string,
  [key: string]: any
}

interface BabelConfig {
  presets?: Record<string, any>,
  plugins?: Record<string, any>,
  [key: string]: any
}


interface GulpOptions {
  rootDir: string,
  distDir: string,
  srcDir: string,
  jsMask: string,
  cssMask: string,
  scssMask: string,
  lessMask: string,
  otherMask: string,
  ignore: string[],
  babelConfigFile: string,
  postcssConfigFile: string,
  lessConfigFile: string,
  scssConfigFile: string,
  esmConfigFile: string,
  commandPrefx: string,
  sourcemap?: boolean,

  [key: string]: any
}

interface GulpOptionsWithDone extends GulpOptions {
  done: (result?: any) => void,
  file: any
}

interface EsmConfig {
  cleanEsm?: (buildConfig: BuildOptions, options: GulpOptions) => void|false,
  buildJs?: (buildConfig: buildOptions, babelConfig: BabelConfig, options: GulpOptionsWithDone) => void|false,
  buildPostcss?: (buildConfig: buildOptions, postcssPlugins: Record<string, function>, options: GulpOptions) => void|false,
  buildLess?: (buildConfig: buildOptions, lessConfig: Record<string, any>, options: GulpOptionsWithDone) => void|false,
  buildScss?: (buildConfig: buildOptions, scssConfig: Record<string, any>, options: GulpOptionsWithDone) => void|false,
  buildCss?: (buildConfig: buildOptions, cssConfig: { plugins: Record<string, function> }, options: GulpOptionsWithDone) => void|false,
  buildOthers?: (buildConfig: buildOptions, othersConfig: Record<string, any>, options: GulpOptionsWithDone) => void|false
}

```


