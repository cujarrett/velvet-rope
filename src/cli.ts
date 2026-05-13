#!/usr/bin/env node
import { spawnSync } from "child_process"
import { loadConfig } from "./config.js"
import { checkPackage, formatResult } from "./gate.js"
import { auditDirectDeps } from "./audit.js"

const args = process.argv.slice(2)
const command = args[0]
const force = args.includes("--force")
const bypass = process.env["VELVET_ROPE_BYPASS"] === "1"

function exit(code: number): never {
  process.exit(code)
}

async function main(): Promise<void> {
  if (command !== "install" && command !== "check") {
    console.error(
      "Usage: velvet-rope install <packages...> | velvet-rope check [packages...]"
    )
    exit(1)
  }

  if (bypass || force) {
    const reason = bypass ? "VELVET_ROPE_BYPASS=1" : "--force"
    console.warn(`⚠  velvet-rope bypassed (${reason})`)
    if (command === "install") {
      const packages = args.slice(1).filter((a) => !a.startsWith("--"))
      runNpmInstall(packages)
    }
    return
  }

  const config = loadConfig()
  const packages = args.slice(1).filter((a) => !a.startsWith("--"))

  let results
  if (packages.length === 0 && command === "check") {
    console.log(
      `Auditing direct dependencies (minimum age: ${config.minimumAge})\n`
    )
    results = await auditDirectDeps(config)
  } else if (packages.length > 0) {
    console.log(
      `Checking ${packages.length} package${packages.length !== 1 ? "s" : ""} (minimum age: ${config.minimumAge})\n`
    )
    results = await Promise.all(
      packages.map((pkg) => checkPackage(pkg, config))
    )
  } else {
    console.error(
      "No packages specified. Run `velvet-rope check` to audit direct dependencies."
    )
    exit(1)
  }

  let allPassed = true
  for (const result of results) {
    const line = formatResult(result)
    if (result.passed) {
      console.log(line)
    } else {
      console.error(line)
      allPassed = false
    }
  }

  if (!allPassed) {
    console.error(
      "\nBlocked. Use --force or set VELVET_ROPE_BYPASS=1 to override."
    )
    exit(1)
  }

  if (command === "install") {
    console.log("\nAll packages passed. Running npm install...\n")
    runNpmInstall(packages)
  }
}

function runNpmInstall(packages: string[]): void {
  const result = spawnSync("npm", ["install", ...packages], {
    stdio: "inherit",
  })
  exit(result.status ?? 0)
}

main().catch((err: unknown) => {
  console.error(
    "velvet-rope:",
    err instanceof Error ? err.message : String(err)
  )
  exit(1)
})
