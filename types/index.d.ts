import { BuildOptions } from "build-esm-project"

export type ReactBuildOptions = BuildOptions<{
  scopeStyle?: boolean,
  scopeNamespace?: string,
  alias?: boolean,
  aliasConfig?: string,
  define?: boolean
  defineConfig?: string
}>
