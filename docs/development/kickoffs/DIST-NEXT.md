# DIST — resume here. Rewritten 2026-09-13 as a STAND-DOWN handoff.

> **STAND-DOWN, 2026-09-13: 0 stopped, 0 alive, listed.**
> This session spawned no tasks and no subagents — all work ran in-session — so
> there were none to stop, and none are alive. No deploy was in flight at
> stand-down: `node tools/waitquiet.mjs --check` read QUIET, and no
> `deploy.mjs` / `deploy-fleet.mjs` / `wrangler deploy` process existed.
> Working tree clean, nothing unpushed, `HEAD == origin/main`.

## READ THIS BEFORE ANYTHING ELSE: THE STAND-DOWN ORDER'S PREMISE WAS OUT OF DATE

The order describes DS-4 as *"half done: 0.57.0 cut and signed at ba05e9c,
deploy+serve-wait+row-landing+VF-4 handoff remaining."* **That was true for about
an hour on 2026-09-13 and is not true now.** The order also said to rewrite this
file *from the actual current state*, and this is that state, measured at
stand-down rather than remembered:

```
origin/main                3607b5c      (ba05e9c is an ancestor — the cut, then the deploy fix)
release/RELEASE.json       0.57.0 · 4 assets · fleetSig present
biosmoke7    /version      0.57.0
pdf-worker   /version      {"ok":true,"version":"0.57.0"}
agent-worker /version      {"ok":true,"version":"0.57.0"}   service PLANE -> biosmoke7
ocr-worker   /version      {"ok":true,"version":"0.57.0","engine":"tesseract-wasm",...}
plancheck                  0 fail, 0 warn
gate                       GREEN class FULL — 180/181 suites, 1 skipped, 11,008 assertions
```

**DS-4's deploy, serve-wait and fleet rollout are DONE.** Do not re-run them
expecting them to be missing. If you want to re-verify rather than trust this
file — and you should, that is the standing rule — the four probes above are the
whole check and take under a minute.

## WHAT IS ACTUALLY LEFT

- **VF-4 — the finale, and the only thing DS-4 was blocking.** Everything it
  needs is live at one coherent version. Its gate is a full CHECK run against a
  concluded inquiry in the instance's own scratch namespace, swept afterwards.
- **D-297 — the installer's half, and the honest caveat on this release.**
  `RELEASE.json` on `main` is what `newgroup` serves to any future install, so a
  group installing today receives 0.57.0 **and a manifest naming three members it
  cannot yet install**: the installer does not fetch, verify or upload member
  bundles or their upload parts. The plane installs correctly; the fleet does
  not. That is D-115's "quietly doing less" and it is stated here rather than
  discovered later. The signed manifest it will need already exists.
- **Five copies of one predicate.** The structural generated-embed recogniser and
  its count live in `bounds.test.mjs`, `case-opened.test.mjs`, `op-claims.mjs`,
  `op-claims.test.mjs` and `publishedcase.test.mjs`. Publishing the fleet moved
  the count in all five and each had to be amended by hand. Consolidating them is
  worth an item.

## WHAT THIS LANE BUILT, so you do not rebuild it

| tool | what it is for |
| --- | --- |
| `tools/deploy-fleet.mjs` | deploys ONE member to ONE instance, every service target templated from the slug. Refuses a non-member, a missing `--instance` (no default, deliberately), and a binding target that does not exist — pre-flight, so the refusal is ours and not Cloudflare's 10143 |
| `tools/release-assemble.mjs` | assembles + signs a release carrying the whole fleet. Eight refusals, all driven |
| `tools/sign-sshsig.mjs` | signs from the `BIOKEY-RAW1` seed. `ssh-keygen -Y sign` CANNOT: it wants an OpenSSH private key file. Stock `ssh-keygen -Y verify` remains the acceptance authority and checks everything |
| `bio-plane/scripts/resolve-version.mjs` | ONE version across plane and every member, both directions. `deploy.mjs` refuses on skew |
| `bio-plane/src/tokens.mjs` | DS-3's cascade third level: `instanceClaudeStatus` / `instanceClaudeToken`, no write path anywhere |
| `tools/jsonc.mjs` | one string-aware JSONC parser, shared |

## THE TRAPS THIS LANE PAID FOR

- **`ssh-keygen -Y sign` does not accept this project's seed.** Use
  `tools/sign-sshsig.mjs`. Verify with stock `ssh-keygen` — always.
- **Re-cut the installer in the same act as the release.** It embedded 0.56.0
  while the release was 0.57.0 until a suite caught it. That is D-106 exactly.
- **`git checkout --` restores to HEAD, not to what you had** — now in CLAUDE.md's
  traps after biting twice.
- **Never suppress stderr on `git add`.** A failed add plus `2>/dev/null` gave a
  no-op commit and a push reporting "Everything up-to-date" over an empty release.
- **Read exit status unpiped.** This session got that wrong six times and caught
  it six times; the mechanical fix is still unbuilt (D-293 names a pre-push hook).

## AUTHORITY, unchanged

The baton is held by **DIST**, `granted_by: bob`, scope `plane`, and its note
records: *"Bob authorised DIST 2026-08-04 to deploy the accumulated work."* This
session held DS-4 back three times asking for a decision that was already
recorded and already its own. **Read the baton before you ask.**
