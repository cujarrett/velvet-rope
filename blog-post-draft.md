# The 20-Minute Window

On May 11, 2026, an attacker published 84 malicious versions across 42 `@tanstack/*` packages. The malware ran on `npm install`. It harvested AWS credentials, Kubernetes tokens, SSH keys, GitHub tokens — and exfiltrated them before anyone noticed.

Detection took 20 minutes. The attacker needed about six.

I read the [postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) and immediately thought about the gap it exposed: `npm audit` catches known vulnerabilities. It has no opinion about a package published four minutes ago.

Nobody does. That's the problem.

## npm Trusts Everyone Immediately

The registry has no cooling-off period. Publish a package, and every developer who runs `npm install` in the next thirty seconds will get it — no review, no delay, no signal that this version has never been seen by anyone outside the attacker's machine.

Renovate has `minimumReleaseAge`. If you use it, automated PRs will wait before proposing an update. But that does nothing when you run `npm install some-package` by hand. Which is exactly what TanStack users were doing.

There's no equivalent for manual installs. There wasn't, anyway.

## Velvet Rope

A velvet rope doesn't care how popular you are. Too new? You're not getting in.

`velvet-rope` is that check for your packages. Use `velvet-rope install` instead of your package manager's install command and it queries the registry publish timestamp before running the install. A package published within your minimum age gets blocked.

```
✗ @tanstack/router@1.161.9 was published 4 minutes ago (minimum: 7 days)
  Blocked. Use --force or set VELVET_ROPE_BYPASS=1 to override.
```

Configure it once:

```json
{
  "ageGate": {
    "minimumAge": "7 days"
  }
}
```

No service. No SaaS. One registry API call per package, one timestamp comparison, one decision.

## What 7 Days Actually Buys You

Not everything. A patient attacker waits eight days. A long-dormant malicious package passes the check without issue.

But the TanStack attack exploited a 20-minute window. The supply chain attacks that move fast — compromised CI, stolen OIDC tokens, a fresh publish of a poisoned version — are exactly what a minimum age gate catches. The attack has to be quiet _and_ patient to get past it. That's a harder problem to solve.

`npm audit` catches vulnerabilities the community already knows about. `velvet-rope` catches the ones nobody has seen yet.

## The Escape Hatch

Bypasses exist for CI or when you actually need a new package immediately:

```bash
VELVET_ROPE_BYPASS=1 npm install   # logged, never silent
velvet-rope install react@latest --force
```

Every bypass is logged. There's no silent skip.

---

Source is on [GitHub](https://github.com/cujarrett/velvet-rope). If the TanStack postmortem made you rethink how quickly you pull new packages, this is the tooling to act on that instinct.
