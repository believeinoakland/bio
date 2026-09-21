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
  from `.env`) — `/version` AND `/api/?op=bootstrap&store=scratch` (no token: bootstrap is `classes: null`). Both,
  every time — but **both print the ROUTING ISOLATE's `env.VERSION`**; bootstrap adds only that the DO ANSWERED
  (corrected 2026-09-21, FLEET #3's stand-up below). No version FIELD reports the DO's own build. Two readings reach
  it: a DO-side wire code absent from the prior signed bundle (DIST's law), and `op=capturerequestdraining`'s `agent`,
  which needs an existing capture-request row.
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

## Stand-up, 2026-09-19 — FLEET #2, the first fleet session in the new account, measured rather than inherited

The account switch (Bob, 2026-09-19, via BOB #16) retired every lane in the old account. This session
re-measured `FLEET-NEXT.md`'s table instead of believing it — that file says to, and each fact below names
its instrument. Self-wake re-armed the day it opened: recurring every 6 h and the one-shot renewal at day 5.

**The fleet is coherent and serving.** Probed live on `biosmoke7`, 2026-09-19, with the admin token from
`.env`: `agent-worker`, `pdf-worker` and `ocr-worker` each answer `{"ok":true,…,"version":"0.65.0"}` at
`/version` (ocr also `engine_loaded: true`, tesseract-wasm 0.11.0), and the plane answers `0.65.0` at BOTH
the isolate (`/version`) and through the DO (`op=bootstrap`). `release/RELEASE.json` on `main` names the
three member hashes; all three committed bundles hash to them, `dist/` and `release/` copies alike.

**NO plane change has staled a fleet artifact** — the question this file's law says to ask first. Every
first-party input hash recorded in the three `dist/*.bundle.json` manifests matches the tree on
`origin/main`: **23 checked, 0 drifted**, INCLUDING the seven `../bio-plane/src/*` couplings (`tokens.mjs`
for agent-worker, `cpu/pdfstructure/subresources.mjs` for pdf-worker and ocr-worker) and ocr-worker's
`../pdf-worker/src/pagepixels.mjs`. **The input-hash arm needs no `npm ci`**: it is pure hashing, so the
staleness question can be answered in a fresh worktree BEFORE spending ~574 MB on three installs — worth
knowing on this machine, where disk sat at 11 GiB free / 95% that morning. Only pdf-worker's two VENDORED
inputs (`node_modules/unpdf/dist/*`) read UNREADABLE, which is the absent install and not drift; the
byte-identity arm is the half that needs the install.

**Two receipts in `FLEET-NEXT.md` of 2026-09-19 were imprecise. The conclusions hold; the evidence did not.**
Carry the corrected form, because a successor who re-runs either one will see something the file denies:

- *"the fleet sources are identical from v0.62.0 to v0.65.0 (`git diff --stat` empty)"* — **that diff is NOT
  empty.** Four files change: `version` in `package.json` and `"vars": { "VERSION": … }` in `wrangler.jsonc`,
  for both agent-worker and pdf-worker. The conclusion is right and now has its MECHANISM: **the version
  label is a wrangler `var`, injected at deploy and never compiled into the bundle** — which is exactly why
  both members hash to `a7e5f590…` / `b26dee19…` unchanged at v0.59.0, v0.62.0, v0.65.0 AND `main` while
  `/version` answers 0.65.0. That is the strongest available form of "a version label is not the code": the
  label and the code are kept in different places by design, so they CANNOT be read off one another.
- *"Members: 7 VF-4 rows remain … The `bio` namespace holds none."* — the seven `vf4*` rows are exactly as
  named, but `op=memberlist&store=scratch` returns **13**: six more predate VF-4 (`d41-sf72-a1/a2/a3`,
  `probe-1785025010`, `probe-ms11t4s2`, `scr-ms11znmp`, all 2026-07-26). **M0-69's clearing job is 13 rows,
  not 7.** And `bio` holds **4** member rows, none of them `vf4*` — true to that sentence's intent, false to
  its words. State the WHOLE roster at a sweep, not the subset this lane happened to mint.

**Scratch, stated at this sweep** (the rule is never to report "scratch clean" off `op=stats` alone): every
derived counter 0, `op=audit` `ok:true checked=0`, and the 13 member rows above.

**`bio`'s audit is not clean, and that is NOT news — look it up before reporting it.** `op=audit&store=bio`
reads `checked=31 clean=21 withErrors=10`, `tallyDetail {"C-18.9/chain-absent": 10}`. `MEASUREMENTS.md`
already carries this population byte-for-byte as **D-200's pre-existing one**, diagnosed: the ten were
captured 2026-07-19..22 and C-18.9's chain arm was written 2026-07-31, so the field did not exist when the
bytes landed, and all ten reconstruct. D-200 reads `open`; none of it is FLEET's. Recorded here only so the
next session to run that op does not re-mint a known row as a discovery — which is what the lookup rule in
`CLAUDE.md` §1 is for, and it paid for itself within an hour of this session opening.

## `discoverMembers` and `planeMember` are CONSUMED ACROSS LANES — check before you change their shape

Recorded 2026-09-19 on BOB #17's ruling, after this lane argued the opposite and was overruled with the
better argument: *"the repo already records it"* is true and is not the question — the question is whether
the session that needs the fact MEETS it. A FLEET session opening `bio-plane/scripts/fleet-bundle.mjs` to
change `discoverMembers` has nothing today that would make it grep for callers first; DIST's acknowledging
comment lives in DIST's file, and the imports live in three other lanes'. None of those is where a FLEET
session looks before editing FLEET's own ground. (The same reasoning closed D-284 and D-306 the same day.)

**Seven consumers on `origin/main`** — `git grep -l discoverMembers` finds them, and the count is the point:
FLEET's own `fleet-bundle.mjs` and `bio-plane/test/fleetbundles.test.mjs`; the three members'
`scripts/build.mjs`; and **DIST's `bio-plane/scripts/resolve-version.mjs` and `tools/release-assemble.mjs`**
(DS-2, 2026-09-19). **A change to either function's shape or behaviour silently moves DIST's version
authority and the release assembler** — the failure would surface in a release, not in a fleet test.

So FLEET routes any change to them through `INTERFACE-CHANGES.md` and it reaches DIST before it lands. That
posture is this lane's own mechanism and needs no ruling; whether the pair earns a REGISTERED I-number is
BOB's, taken 2026-09-19 and to be decided with the consumers' owners rather than between two lanes — until
then the protocol route is the safe posture and costs nothing if the answer is no.

**REGISTERED AS I10, 2026-09-21: the question above is answered.** BOB #19 ruled the pair a registered interface,
owner FLEET, and FLEET #3 wrote `INTERFACES.md` §I10 from the code (PROVISIONAL until BOB reads it against the
code). A change to either function is now an IC against I10, and the protocol route above is that IC's route.
**The count above was one short, and it counted the definer.** By `import`, SEVEN files consume the pair: the six
named above, plus `bio-plane/scripts/build-plane.mjs`, which imports `planeMember` only. `fleet-bundle.mjs` defines
them. `git grep -l discoverMembers` cannot see a consumer of `planeMember` alone, so grep both names. **At 1.1.0
(ruled by BOB #20 by message, 2026-09-21) `writeMember`, `verifyFresh`, `freshBuildRunnable`, `sha256` and `REPO_ROOT`
joined I10.** Every export of `fleet-bundle.mjs` that another lane imports is now registered, so read §I10 before
changing ANY export here. A one-line grep cannot see a multi-line `import { … }`: parse the imports, as §I10 records.

## Stand-up, 2026-09-21 — FLEET #3, after the 23.5 h dark: measured, and one lesson of this file corrected

Self-wake armed at opening (every 6 h, with the day-5 renewal). FLEET #2 archived under D-398, its three conditions
re-read at the moment of acting; as that row measured, the archive alone freed nothing, and `git worktree remove`
freed 650 MiB (9.04 → 9.68 GiB free).

**The fleet serves 0.68.0, and 0.67.0 and 0.68.0 moved LABELS only.** Live, 2026-09-21T14:34:50Z, three samples each,
all agreeing: the three members answer `0.68.0` (ocr `engine_loaded: true`, tesseract-wasm 0.11.0), and the plane
`biosmoke7` answers `0.68.0` at `/version` and at `op=bootstrap`. The staleness check read 33 figures: every hash the
manifests record (19 first-party inputs, 2 vendored, 2 locks, 2 ocr assets), plus each committed artifact, its
`release/` copy and the 2 release parts against the manifest and `RELEASE.json`. **31 match, 0 drift, 2 unreadable**
(the vendored `unpdf`: an absent install). Its control: the same check reading inputs from `f5ed2bfa` exits 1, naming
`agent-worker/src/index.mjs`. All three members EXIST at all ten tags v0.59.0 … v0.68.0 and on `main`, and manifest,
artifact and release agree at every one: `a7e5f590…`, `b26dee19…`, `0d99f5d0…` throughout. **Re-read after DIST's
0.69.0 deploy, 2026-09-21T15:14:06Z:** the members and the plane answer `0.69.0` (three samples each), the check
reads 0 drift at `origin/main` `69397491`, and v0.69.0 carries the same three hashes. Labels only, again.

**CORRECTED: `op=bootstrap` never read the DO's build.** The handler writes `version: env.VERSION` from the isolate that
routed the request, then spreads the DO's reply, which is `bootstrapState` (`claimed`, `rearmed`, `consumedAt`) and
nothing more. `op=selftest` relays the DO's stats, which carry no build either. So the reading this file taught, which
its 2026-09-19 stand-up and FLEET #2's handoff quote, is TWO ISOLATE SAMPLES plus proof that the DO answered. It cannot
see the lagging DO the rollout rule warns of. The DO reads its own `env.VERSION` only to compose a capture request's
user agent, `CivicOS/<version> (…)`, and `op=capturerequestdraining` (admin/probe, a read) returns that as `agent`,
but only for an existing non-member-browser row. Scratch held 0 capture-request rows at 14:47Z (counters witnessed
identical before and after), so the DO's build could not be read today without a write. DIST's discriminator also
reaches the DO when its wire code is DO-side, and 0.67.0's is (`AI_RUN_NO_SUCH_CONTEXT`: `store.mjs` calls
`checkRunContextKind`, and `index.mjs` never names it). Judged at the code
to be D-116's defect seen from the DO side: D-116's premise, that `verifyUpdate` verifies the PLANE, is the same
overclaim. Routed to SCHEDULER and DIST as a narrowing of D-116, not as a new row. `MEASUREMENTS.md`'s 0.57.0 table
now carries a dated line saying what it could and could not see.

**FL-6 is BUILT, and its runtime trace waits on the plane's CALLER, not on DS-3.** Its own accepts-when (fixtures,
29/0, four control arms) was met at `f5ed2bfa`, `status.mjs` reads `11.cascade BUILT`, and `src/cascade.mjs` is a
hashed input of the committed agent-worker bundle at all ten tags (whether the UPLOADED bytes match is DIST's open
question). DS-3's config half landed too, at `2de6f25f` on 2026-09-12 (`instanceClaudeToken` in `tokens.mjs`): DIST
#3 measured that today, and it re-reads here. What does not exist is the call. `instanceClaudeToken` has no caller,
and `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`: D-260's gap, whose fix DIST #3 has sent to
SCHEDULER (DIST #3 also reads no `INSTANCE_CLAUDE_TOKEN` configured on `biosmoke7`). So no account resolves at
runtime, and two FLEET documents each said more than the code: the 2026-09-12 → 14 section's "LANDED AND LIVE", and
FLEET #2's handoff's "BLOCKED on DS-3".
