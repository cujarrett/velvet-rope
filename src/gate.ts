import { parseAge, msToHumanAge } from "./age.js"
import { getPublishDate, resolveVersion } from "./registry.js"
import type { AgeGateConfig } from "./config.js"

export interface GateResult {
  name: string
  version: string
  publishedAt: Date
  ageMs: number
  minimumAgeMs: number
  passed: boolean
}

function parsePackageSpec(spec: string): { name: string; version?: string } {
  // Handle scoped packages: @angular/core@17.0.0
  const scopedMatch = spec.match(/^(@[^@]+)(?:@(.+))?$/)
  if (scopedMatch) {
    return { name: scopedMatch[1], version: scopedMatch[2] }
  }
  const idx = spec.indexOf("@")
  if (idx > 0) {
    return { name: spec.slice(0, idx), version: spec.slice(idx + 1) }
  }
  return { name: spec }
}

export async function checkPackage(
  spec: string,
  config: AgeGateConfig
): Promise<GateResult> {
  const minimumAgeMs = parseAge(config.minimumAge)
  const { name, version: rawVersion } = parsePackageSpec(spec)

  const version =
    !rawVersion || rawVersion === "latest"
      ? await resolveVersion(name)
      : rawVersion

  const publishedAt = await getPublishDate(name, version)
  const ageMs = Date.now() - publishedAt.getTime()

  return {
    name,
    version,
    publishedAt,
    ageMs,
    minimumAgeMs,
    passed: ageMs >= minimumAgeMs,
  }
}

export function formatResult(result: GateResult): string {
  const pkg = `${result.name}@${result.version}`
  const age = msToHumanAge(result.ageMs)
  if (result.passed) {
    return `✓ ${pkg} (${age} old)`
  }
  const minimum = msToHumanAge(result.minimumAgeMs)
  return `✗ ${pkg} was published ${age} ago (minimum: ${minimum})`
}
