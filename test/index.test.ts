import * as path from "node:path"
import { externalDepsPlugin } from "../src"
import type { Plugin } from "vite"
import { describe, it, expect } from "vitest"

describe("externalDepsPlugin", () => {
  it("should return a plugin with the correct name", () => {
    const plugin = externalDepsPlugin()
    expect(plugin.name).toBe("vite:external-deps")
  })

  it("should exclude specified dependencies", () => {
    const options = {
      exclude: ["vitest", "vite"]
    }
    const plugin = externalDepsPlugin(options) as Plugin
    const config: any = {}
    ;(plugin.config as Function)(config)
    const { rollupOptions } = config.build
    expect(rollupOptions?.external).not.toContain("vitest")
    expect(rollupOptions?.external).not.toContain("vite")
  })

  it("should include specified dependencies", () => {
    const options = {
      include: ["vue", "vitest"],
      root: path.resolve(".", "test")
    }
    const plugin = externalDepsPlugin(options) as Plugin
    const config: any = {}
    ;(plugin.config as Function)(config)
    const { rollupOptions } = config.build
    expect(rollupOptions?.external).toContain("vue")
    expect(rollupOptions?.external).toContain("vitest")
    expect(rollupOptions?.external).toContain("vite")
    expect(rollupOptions?.external).toContain("unplugin-swc")
    expect(rollupOptions?.external).toContain("@types/node")
  })
})
