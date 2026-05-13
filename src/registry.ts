const REGISTRY = "https://registry.npmjs.org"

function registryUrl(name: string): string {
  // Scoped packages like @angular/core must encode the slash: /@angular%2Fcore
  return `${REGISTRY}/${name.replace("/", "%2F")}`
}

export async function getPublishDate(
  name: string,
  version: string
): Promise<Date> {
  const url = registryUrl(name)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Registry lookup failed for ${name}: HTTP ${response.status}`
    )
  }
  const data = (await response.json()) as { time: Record<string, string> }
  const published = data.time?.[version]
  if (!published) {
    throw new Error(`Version ${version} of ${name} not found in registry`)
  }
  return new Date(published)
}

export async function resolveVersion(
  name: string,
  tag: string = "latest"
): Promise<string> {
  const url = `${registryUrl(name)}/${tag}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not resolve ${name}@${tag}: HTTP ${response.status}`)
  }
  const data = (await response.json()) as { version: string }
  return data.version
}
