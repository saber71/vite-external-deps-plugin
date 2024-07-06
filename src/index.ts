import * as fs from "node:fs"
import * as path from "node:path"
import { mergeConfig, type Plugin } from "vite"

export interface ExternalOptions {
  exclude?: string[]
  include?: string[]
  root?: string
}

/**
 * Automatically externalize dependencies
 */
export function externalDepsPlugin(options: ExternalOptions = {}): Plugin {
  const { exclude = [], include = [] } = options

  const pkg = loadPackageData(options.root) || {}
  let deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

  if (include.length) {
    deps = deps.concat(include.filter((dep) => dep.trim() !== ""))
  }

  if (exclude.length) {
    deps = deps.filter((dep) => !exclude.includes(dep))
  }

  deps = [...new Set(deps)]

  return {
    name: "vite:external-deps",
    enforce: "pre",
    config(config): void {
      const defaultConfig = {
        build: {
          rollupOptions: {
            external: deps.length > 0 ? [...deps, new RegExp(`^(${deps.join("|")})/.+`)] : []
          }
        }
      }
      config.build = mergeConfig(defaultConfig.build, config.build || {})
    }
  }
}

function loadPackageData(root = process.cwd()): Record<string, string> | null {
  const pkg = path.join(root, "package.json")
  if (fs.existsSync(pkg)) {
    const content = fs.readFileSync(pkg, "utf-8")
    if (content) return JSON.parse(content)
  }
  return null
}
