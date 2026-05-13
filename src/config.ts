import { readFileSync } from "fs"
import { join } from "path"

export interface AgeGateConfig {
  minimumAge: string
}

const DEFAULTS: AgeGateConfig = {
  minimumAge: "7 days",
}

export function loadConfig(cwd: string = process.cwd()): AgeGateConfig {
  try {
    const pkgPath = join(cwd, "package.json")
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      ageGate?: Partial<AgeGateConfig>
    }
    if (pkg.ageGate) {
      return { ...DEFAULTS, ...pkg.ageGate }
    }
  } catch {
    // no package.json or unreadable — use defaults
  }
  return { ...DEFAULTS }
}
