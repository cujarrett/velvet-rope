# velvet-rope

![logo](logo.png)

On May 11, 2026, an attacker published 84 malicious versions across 42 `@tanstack/*` packages. The window between "published" and "detected" was 20 minutes. Anyone who ran `npm install` in that window ran credential-harvesting malware on their machine.

Twenty minutes.

npm trusts every package the moment it's published. No cooling-off period. No waiting for the security community to notice. `velvet-rope` adds that wait. Inspired by the [TanStack supply chain compromise postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem).

Renovate has `minimumReleaseAge`, but that only gates automated PRs — it doesn't stop you from running `npm install some-package` manually. This does.

## What it does

Wraps `npm install` and checks the publish date of each package against the npm registry. If any package was published within the configured minimum age, the install fails with a clear error.

```
velvet-rope install @tanstack/react-router

✗ @tanstack/react-router@1.169.5 was published 2 days ago (minimum: 7 days)

Blocked. Use --force or set VELVET_ROPE_BYPASS=1 to override.
```

## Configuration

Add to `package.json`:

```json
{
  "ageGate": {
    "minimumAge": "7 days"
  }
}
```

## Usage

Install as a dev dependency:

```bash
npm install --save-dev velvet-rope
```

Use `velvet-rope install` instead of `npm install` when adding new packages:

```bash
velvet-rope install react@latest
velvet-rope install @angular/core@19.0.0 @angular/common@19.0.0
```

To audit all direct dependencies against the registry:

```bash
velvet-rope check
```

## Escape hatch

```bash
VELVET_ROPE_BYPASS=1 velvet-rope install   # CI override
velvet-rope install --force        # explicit override, logs a warning
```

Bypasses are always logged. There's no silent skip.

## Status

Early development. Feedback welcome.
