import { readFileSync } from "fs"
import { join } from "path"
import { checkPackage, type GateResult } from "./gate.js"
import type { AgeGateConfig } from "./config.js"

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface PackageLock {
  packages?: Record<string, { version: string }>
}

export async function auditDirectDeps(
  config: AgeGateConfig,
  cwd: string = process.cwd()
): Promise<GateResult[]> {
  const pkg = JSON.parse(
    readFileSync(join(cwd, "package.json"), "utf-8")
  ) as PackageJson
  const lock = JSON.parse(
    readFileSync(join(cwd, "package-lock.json"), "utf-8")
  ) as PackageLock

  const directDeps = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ])

  const specs: string[] = []
  for (const name of directDeps) {
    const locked = lock.packages?.[`node_modules/${name}`]
    if (locked?.version) {
      specs.push(`${name}@${locked.version}`)
    }
  }

  return Promise.all(specs.map((spec) => checkPackage(spec, config)))
}
