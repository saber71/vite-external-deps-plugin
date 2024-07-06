import * as fs from "node:fs"
import * as path from "node:path"
import { mergeConfig, type Plugin } from "vite"

/**
 * 外部依赖插件选项接口。
 *
 * 提供配置外部依赖的选项，包括排除、包含和根目录设置。
 */
export interface ExternalOptions {
  exclude?: string[]
  include?: string[]
  root?: string
}

/**
 * 创建一个处理外部依赖的Vite插件。
 *
 * 该插件自动识别并外部化包的dependencies和peerDependencies，
 * 并允许通过配置包含或排除特定的依赖。
 *
 * @param options 外部依赖的配置选项。
 * @returns 返回一个Vite插件实例。
 */
export function externalDepsPlugin(options: ExternalOptions = {}): Plugin {
  // 解构配置选项中的排除和包含列表，并设置默认值。
  const { exclude = [], include = [] } = options

  // 加载并获取package.json数据，或返回空对象。
  const pkg = loadPackageData(options.root) || {}
  // 初始化依赖列表，包括dependencies和peerDependencies中的所有项，以及node模块。
  let deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {}), /^node:.+/]

  // 如果有包含列表，将其合并到依赖列表中。
  if (include.length) {
    deps = deps.concat(include.filter((dep) => dep.trim() !== ""))
  }

  // 如果有排除列表，从依赖列表中移除被排除的项。
  if (exclude.length) {
    deps = deps.filter((dep: any) => !exclude.includes(dep))
  }

  // 去除重复的依赖项。
  deps = [...new Set(deps)]

  // 返回插件配置，包括外部依赖的处理。
  return {
    name: "vite:external-deps",
    enforce: "pre",
    config(config): void {
      // 构建默认配置，包括rollupOptions中的外部依赖设置。
      const defaultConfig = {
        build: {
          rollupOptions: {
            external: deps.length > 0 ? [...deps, new RegExp(`^(${deps.join("|")})/.+`)] : []
          }
        }
      }
      // 合并默认配置和用户配置。
      config.build = mergeConfig(defaultConfig.build, config.build || {})
    }
  }
}

/**
 * 加载指定根目录下的package.json数据。
 *
 * @param root 包含package.json的目录路径，默认为当前工作目录。
 * @returns 返回package.json的数据，如果不存在则返回null。
 */
function loadPackageData(root = process.cwd()): Record<string, string> | null {
  // 构建package.json的完整路径。
  const pkg = path.join(root, "package.json")
  // 检查package.json文件是否存在。
  if (fs.existsSync(pkg)) {
    // 读取并返回package.json的内容。
    const content = fs.readFileSync(pkg, "utf-8")
    if (content) return JSON.parse(content)
  }
  // 如果package.json不存在，返回null。
  return null
}
