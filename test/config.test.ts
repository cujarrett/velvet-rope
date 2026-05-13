import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { loadConfig } from "../src/config.js"

describe("loadConfig", () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = join(tmpdir(), `age-gate-test-${Date.now()}`)
    mkdirSync(tmpDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it("returns defaults when no package.json exists", () => {
    const config = loadConfig(tmpDir)
    expect(config.minimumAge).toBe("7 days")
  })

  it("loads minimumAge from package.json ageGate field", () => {
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({ ageGate: { minimumAge: "14 days" } })
    )
    const config = loadConfig(tmpDir)
    expect(config.minimumAge).toBe("14 days")
  })

  it("uses defaults when ageGate key is absent", () => {
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({ name: "test" })
    )
    const config = loadConfig(tmpDir)
    expect(config.minimumAge).toBe("7 days")
  })
})
