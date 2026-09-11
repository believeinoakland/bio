# Session FLEET — the fleet members beside the plane

Created 2026-09-10 by session BOB at Bob's direction: distributed responsibilities run
in their own sessions, as designed — an area Bob can talk to, not a lane absorbed into
CONDUCT or BOB. Read `CLAUDE.md` first, then this, then `WORKER.md` if you spawn
sub-work. The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE".

## What this area owns

The fleet members — Workers that live BESIDE the plane in the group's account and are
installed with it: `agent-worker/` (the investigative AI's runtime) and `pdf-worker/`
(Tier-2 text extraction). Their pattern is fixed and is this area's law:

- **A fleet member holds no store binding and no member-facing surface.** It is called
  only by the plane and calls only the plane's op surface under its own credential
  class. Every Worker holding a PUBLISHED binding is one more thing that can leak; a
  fleet member holds none.
- **`wrangler.jsonc` pins `account_id`** — the repository decides where a Worker goes.
  Service-binding TARGETS are templated from the instance slug at deploy/install time
  (`tools/deploy-fleet.mjs`; D-292) and NEVER hardcoded — a group's instance is named
  by that group.
- **The build discipline is the GUARD pattern** (BOB, 2026-09-10, answering DIST's
  delegation on the embedded-gate precedent): a committed, hashed, signed per-member
  bundle whose gate asserts BYTE-IDENTITY with a fresh build of its source — a stale
  artifact fails instead of shipping. FL-9 builds this, for `agent-worker` AND
  `pdf-worker`.
- **Fleet suites run in the battery** (`agent-worker/test/`, `pdf-worker/test/` are
  discovered); `coverage.mjs --strict` reads the fleet manifests. Gate with
  `node tools/gates.mjs` like every session.

## State at creation, verify rather than believe

Both members are DEPLOYED and serving on the dev account for the first time
(2026-09-10; D-292's deploy half closed). **FL-9 (the build guard) is RUNNING as a
CONDUCT-spawned worker at this file's creation — your first act is `git log --oneline
origin/main | grep -i FL-9` and the QUEUE row:** if it has landed, take the area over
from there (FL-6, the Claude-account cascade, waits on DIST's DS-3); if it is still
running, coordinate through CONDUCT rather than claiming its ground — one writer per
area, and the worker was there first.

## The rules that bind every area session

Claim before editing (`CLAIMS.md`); delegate rather than edit another area's paths;
interfaces change only through `INTERFACE-CHANGES.md`; run in your own worktree
(`claude --worktree FLEET`); publish and verify from the remote — the repository is
the channel; `node tools/plancheck.mjs` before any handoff. Decisions that are
genuinely Bob's go through `DECISIONS.md` via CONDUCT; tactical calls are yours —
never block on him.

## Stand-up, 2026-09-10 — the area session's first turn, measured rather than believed

The session performed the first act this file orders and records what it found, so the
next FLEET session starts from evidence:

- **FL-9 was still RUNNING.** The only commit on `main` naming it was `3b340d8` (CONDUCT's
  spawn); its worker was ALIVE — untracked `fl9probe.mjs`/`fl9diff.mjs` and files touched
  minutes earlier in worktree `agent-abe10acbf93247266`. **No fleet ground was claimed**;
  the session's only claim was this file (CLAIMS.md, 2026-09-10, released same turn).
- **Both members verified serving LIVE**, not believed from this file: `agent-worker` and
  `pdf-worker` each answered `{"ok":true,...,"version":"0.1.0"}` at `/version` on the
  pinned account's workers.dev subdomain, probed 2026-09-10 with the account's own token
  read from `.env`.
- **FL-6 confirmed blocked on DIST's DS-3** (the build-plan table in `QUEUE.md`), and
  FL-7/FL-8 are `done` — so with FL-9's ground held there was NOTHING schedulable in this
  area, and standing by was the correct disposition rather than a stall.

**Take the area over from FL-9's `landed:` row when it appears** — its scope (the guard
pattern, both members) and its negative controls are the area's law going forward, and
DIST's release-format half plus D-297 unblock behind it. FL-6 remains the next runnable
item once DS-3 lands.

## Takeover, 2026-09-10 — FL-9 landed and the area session verified it before believing it

FL-9 is `done` (`d83695b`/`debee98`, merged `7429166`, integrated `626fad7`). The area
session RE-RAN the guard in its own tree the same day rather than trusting the row:
`node --test bio-plane/test/fleetbundles.test.mjs` — **43 pass, 0 fail, exit 0 read
unpiped**, with `pdf-worker/node_modules` installed first so the byte-identity arm ran
UNSKIPPED for both members, and section 4's prove-it-can-fail arms green. Both committed
bundles boot under workerd and answer `/version`.

The area's law gained two measured facts from FL-9 — carry them, do not rediscover them:
- **The INPUT-HASH arm is the load-bearing one**; byte-identity alone passes a real
  committed-source change (esbuild tree-shakes unused exports; comment-only changes are
  invisible to it).
- **A PLANE change can stale a FLEET member's artifact** — three of `pdf-worker`'s six
  build inputs live in `bio-plane/src/`, hashed in its manifest. When plane source moves,
  expect the fleet gate to demand a rebuild; that is the guard working.

Open in this area after FL-9: **FL-6** (Claude-account cascade) still waits on DIST's
DS-3; DIST's release-format half (D-297) consumes FL-9's artifacts and is DIST's ground.
The stale `tools/deploy-fleet.mjs` header is delegated to DIST in FL-9's landed row.
