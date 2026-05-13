import { describe, it, expect } from "vitest"
import { parseAge, msToHumanAge } from "../src/age.js"

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_HOUR = 60 * 60 * 1000

describe("parseAge", () => {
  it("parses days", () => {
    expect(parseAge("7 days")).toBe(7 * MS_PER_DAY)
  })

  it("parses singular day", () => {
    expect(parseAge("1 day")).toBe(MS_PER_DAY)
  })

  it("parses hours", () => {
    expect(parseAge("24 hours")).toBe(24 * MS_PER_HOUR)
  })

  it("parses singular hour", () => {
    expect(parseAge("1 hour")).toBe(MS_PER_HOUR)
  })

  it("is case-insensitive", () => {
    expect(parseAge("7 Days")).toBe(7 * MS_PER_DAY)
  })

  it("throws on invalid format", () => {
    expect(() => parseAge("7d")).toThrow("Invalid age format")
    expect(() => parseAge("seven days")).toThrow("Invalid age format")
    expect(() => parseAge("")).toThrow("Invalid age format")
  })
})

describe("msToHumanAge", () => {
  it("formats days", () => {
    expect(msToHumanAge(7 * MS_PER_DAY)).toBe("7 days")
  })

  it("formats singular day", () => {
    expect(msToHumanAge(MS_PER_DAY)).toBe("1 day")
  })

  it("formats hours when less than a day", () => {
    expect(msToHumanAge(6 * MS_PER_HOUR)).toBe("6 hours")
  })

  it("formats singular hour", () => {
    expect(msToHumanAge(MS_PER_HOUR)).toBe("1 hour")
  })
})
