import { describe, it, expect, vi, beforeEach } from "vitest"
import { checkPackage, formatResult } from "../src/gate.js"

vi.mock("../src/registry.js", () => ({
  getPublishDate: vi.fn(),
  resolveVersion: vi.fn(),
}))

import { getPublishDate, resolveVersion } from "../src/registry.js"

const MS_PER_DAY = 24 * 60 * 60 * 1000

describe("checkPackage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("passes a package older than the minimum age", async () => {
    vi.mocked(getPublishDate).mockResolvedValue(
      new Date(Date.now() - 10 * MS_PER_DAY)
    )
    const result = await checkPackage("react@18.0.0", { minimumAge: "7 days" })
    expect(result.passed).toBe(true)
    expect(result.name).toBe("react")
    expect(result.version).toBe("18.0.0")
  })

  it("blocks a package newer than the minimum age", async () => {
    vi.mocked(getPublishDate).mockResolvedValue(
      new Date(Date.now() - 2 * MS_PER_DAY)
    )
    const result = await checkPackage("react@18.0.0", { minimumAge: "7 days" })
    expect(result.passed).toBe(false)
  })

  it("resolves latest version when no version specified", async () => {
    vi.mocked(resolveVersion).mockResolvedValue("18.3.0")
    vi.mocked(getPublishDate).mockResolvedValue(
      new Date(Date.now() - 10 * MS_PER_DAY)
    )
    const result = await checkPackage("react", { minimumAge: "7 days" })
    expect(resolveVersion).toHaveBeenCalledWith("react")
    expect(result.version).toBe("18.3.0")
  })

  it("handles scoped packages", async () => {
    vi.mocked(getPublishDate).mockResolvedValue(
      new Date(Date.now() - 10 * MS_PER_DAY)
    )
    const result = await checkPackage("@angular/core@17.0.0", {
      minimumAge: "7 days",
    })
    expect(result.name).toBe("@angular/core")
    expect(result.version).toBe("17.0.0")
  })
})

describe("formatResult", () => {
  const base = {
    name: "react",
    version: "18.0.0",
    publishedAt: new Date(),
    minimumAgeMs: 7 * MS_PER_DAY,
  }

  it("formats a passing result", () => {
    const result = { ...base, ageMs: 10 * MS_PER_DAY, passed: true }
    expect(formatResult(result)).toMatch(/^✓ react@18\.0\.0/)
  })

  it("formats a failing result", () => {
    const result = { ...base, ageMs: 2 * MS_PER_DAY, passed: false }
    expect(formatResult(result)).toMatch(/^✗ react@18\.0\.0/)
    expect(formatResult(result)).toContain("minimum: 7 days")
  })
})
