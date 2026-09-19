# Session FLEET — the fleet members beside the plane

Created 2026-09-10 by session BOB at Bob's direction: distributed responsibilities run
in their own sessions, as designed — an area Bob can talk to, not a lane absorbed into
CONDUCT or BOB. Read `CLAUDE.md` first, then this, then `WORKER.md` if you spawn
sub-work. The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE".

## A STANDING LANE — never idle-archived, and never ends a turn on a question nobody will read

**RULED BY BOB, 2026-09-18:** *"Don't archive DIST or FLEET sessions just because they've been idle for some
period of time. They should stay alive because they will always eventually be needed again. Only refresh them
if/when their context windows are too full."* `tools/retirable.mjs` enforces it: this lane's NEWEST session is
PROTECTED however long it idles (`STANDING_LANES`, negative-control arm A6b). **Idle is this lane's normal state.**

**The receipt, and the half the tool cannot fix.** The only DIST and FLEET sessions (2026-09-16) oriented, then
ended their turns on a question — *"Standing by for your sequencing"*, *"may I push it?"* — addressed to a human
who was not in the session. Nobody read either; both were archived idle four hours later; no release was cut for
four days while four disclosure fixes sat on `main`. **So: never end a turn on a question.** Pushing is not gated
(`CLAUDE.md`); decide what is yours; route what is genuinely another lane's by `SendMessage` — the build plan's order to SCHEDULER, running
work to CONDUCT, design and doctrine to BOB (`CLAUDE.md` §3) — and continue with the rest. A question only Bob can answer goes to BOB, which carries it.

**Refresh, when context is too full:** write `<LANE>-NEXT.md` from the measured state, push it, verify it on the
remote, and tell BOB — whose successor protocol retires a predecessor only after D-398's three conditions hold.

**WHAT WAKES FLEET.** Its work arrives as rows CONDUCT routes to it and as DIST's release (a fleet member ships with
the plane when it consumes a changed interface — DIST names which). Both reach it by `SendMessage`. At session start it
arms a recurring self-wake with `CronCreate` (every 6 hours) to read `node tools/owed.mjs FLEET` and its rows; if
nothing is owed, it ends the turn with one line saying so.

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
genuinely Bob's go to BOB, which carries them into his conversation (`CLAUDE.md` §3); tactical calls are yours —
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

## State, 2026-09-12 → 2026-09-14 — read this before believing any status row

**FL-10 and FL-6 are both LANDED AND LIVE, whatever `QUEUE.md` says.** FL-10 (the plane's
bundle guard): `3607b3b` + the floor move, released in CLAIMS with the full acceptance
evidence 2026-09-10; the guard has since caught DS-3's manifest refresh and correctly
passed DIST's tree-shaken `sshsig` change — it is WORKING IN PRODUCTION. FL-6 (the
cascade): `f5ed2bf` + `ca1b0ee`, 2026-09-12. **The FL-10 QUEUE row still read `queued` on
2026-09-14 because flipping it is CONDUCT's and the handoff note in the CLAIMS release
was a NOTE, which nothing drains** — it cost a reconciliation re-drive from BOB #9, and
the correction was to answer with the commits rather than re-run landed work. IC-70 and
IC-79 both await CONDUCT's RESOLUTION. The fleet is THREE members (ocr-worker joined,
CPDF-10), all guarded, serving 0.57.0 account-wide; FLEET's IS-build-plan share is
complete; nothing is schedulable in this area until a new delegation or FL item arrives.

## Process lessons — recorded at stand-down, 2026-09-19 (FLEET, standing lane)

Learned in the field and not written anywhere before. Each has a receipt in `FLEET-NEXT.md` of 2026-09-19.

- **Test a mixed-version claim before it leaves the lane.** When DIST must know whether member N in front of plane M
  is safe: `git worktree add --detach <scratch>/mix v<M>`, then `git checkout v<N> -- agent-worker` inside it, symlink
  `bio-plane/node_modules` from a real install (an experiment only, never a gate), run
  `node agent-worker/test/harness.test.mjs` — section R drives the REAL plane of that tree under miniflare. Remove the
  worktree after. A diff reading is labelled a reading until this has run.
- **Live mixed-version end to end:** copy `bio-plane/test/vf4-live-scratch.mjs` to an untracked name beside it, move its
  version expectations (the `t(...)` lines at the rollout gate and at EXIT) to the pair under test, and set the plan
  judgement to `observed: "PRESENT"` so IC-130's path runs; tally each `H.stepLog` entry's `state`. It works in
  `store=scratch` and sweeps itself; delete the copy. It drives the TABLE against the live plane, not the deployed
  isolate: scratch cannot mint an `ai` credential (M-8's wall, C-29.1), so `/run` is only drivable to its refusals.
- **Reading which build answers:** members at `https://<member>.believeinoakland.workers.dev/version`. The plane's
  workers.dev route answers `error code: 1042`; use `ORIGIN` from `bio-plane/test/vf4-call.mjs` (it reads the instance
  from `.env`) — `/version` for the isolate AND `/api/?op=bootstrap` for the DO. Both, every time.
- **A version label is not the code.** Compare `release/RELEASE.json` `fleet[].sha256` across tags
  (`git show "v0.64.0:release/RELEASE.json"`) and the committed bundle's own hash before reasoning about a rollout.
- **Stalled deploys:** a peer lane shown `waiting` by `ListAgents` is holding a permission prompt. Route it to BOB as
  the one act only Bob can take; a partial rollout is reported with whether it is SAFE, from the bytes.
- **`purge` does not clear scratch members** (M0-69/M0-70 carry it); state member residue at every sweep rather than
  reporting "scratch clean" off `op=stats` alone.
- **Self-wake:** `CronCreate` jobs are session-only and expire after 7 days. Record the arm date, and arm a one-shot
  reminder 5 days out that deletes and re-arms it (BOB #15's rule).
- **zsh traps in this estate's shell:** `echo ======` fails (`=` expansion); `"$v:r..."` applies the `:r` modifier and
  eats the path — write `"${v}:release/..."`; quote `"v0.65.0^{commit}"`. A chained command then dies at the first
  such error and the later halves never run — read every half's output.
- **Carried from FLEET #1 (2026-09-14):** the QUEUE row is not the record, the commit is — answer a re-drive with
  commits; a plane change stales a fleet artifact and the guard is right — rebuild on the merged tree, never hand-edit a
  manifest hash; `npm ci` in `bio-plane/`, `pdf-worker/`, `ocr-worker/` before measuring; claim precisely (FLEET's
  ground is `agent-worker/**`, `pdf-worker/**`, `fleet-bundle.mjs` + `fleetbundles.*`; `tools/deploy-fleet.mjs` is
  DIST's; `ocr-worker` is CONTENT-PDF's ground on FLEET's pattern); report to the CURRENT lead BOB.
