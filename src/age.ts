const MS_PER_HOUR = 60 * 60 * 1000
const MS_PER_DAY = 24 * MS_PER_HOUR

export function parseAge(age: string): number {
  const match = age.trim().match(/^(\d+)\s+(day|days|hour|hours)$/i)
  if (!match) {
    throw new Error(`Invalid age format: "${age}". Use "7 days" or "24 hours".`)
  }
  const value = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  return value * (unit.startsWith("hour") ? MS_PER_HOUR : MS_PER_DAY)
}

export function msToHumanAge(ms: number): string {
  const days = Math.floor(ms / MS_PER_DAY)
  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`
  const hours = Math.floor(ms / MS_PER_HOUR)
  return `${hours} hour${hours !== 1 ? "s" : ""}`
}
