# DIST — resume here. Written 2026-09-24 by DIST #6 (`session_01Vi1XTVwxcBBMStifuBasLZ`, cloud), last updated 15:45Z: the quota reset and the account switch is CANCELLED (BOB #32) — DIST #6 continues on this account; standing: NO release until Bob asks, typed in DIST's own session.

Why now: this account's weekly quota ends ~07:00Z 2026-09-24 (Bob, relayed by BOB #32 at 03:00Z); work continues on the
other account. This file is STATE, measured 03:05Z. The process is `kickoffs/DIST.md` (WHEN DIST CUTS, the `latest`
pointer, the gate, the LESSONS) — read it whole. A sentence here is a pointer: re-measure before acting. State lives on
`coord`: `node tools/coord.mjs read <path>`; write with `node tools/coord.mjs write --replace <path> <file> -m "<what>"`.

## RELEASE 0.79.0 — DEPLOYED AND LIVE-VERIFIED 2026-09-24 13:50–13:56Z (asked by Bob in DIST #6's session)

Cut `dd324152` (tree `71af025a`, gate `--full --no-reuse` GREEN BACKSTOP **351/351 · 20004**, 1995 s); signature controls 7/7;
newgroup embed 23/0, wizard 200/0. **POINTER LANDED** — `land/dist/cut-0.79.0` @ `d2ca15b0` trained ALONE into main `5f116f33` (14:2xZ, CONDUCT #20;
verified by DIST #6: `d2ca15b0` an ancestor of origin/main, main's `release/RELEASE.json` and `newgroup/dist` read 0.79.0), so
`/update` offers 0.79.0. The 0.79.0 release is COMPLETE. Tag `v0.79.0` is local only (the 403). **Not run at this cut:**
the migrate-released control arms (the SEQUENCE for lesson 19 was not extended; expected alterafter 465/78 etc.) and the
member byte comparison of lesson 7 (members read 0.79.0 through D-116 only).

## Standing rulings (verify with `node tools/decided.mjs`)

- **NO RELEASE UNTIL BOB ASKS** (Bob, ~17:00Z 2026-09-23): cut nothing, deploy nothing, until Bob asks through BOB.
  CUT NOW and the daily batch are both suspended. The daily wake `trig_014p69w2WQz7jfSkYeg4XHSF` is PAUSED — do not re-arm.
- **No timers in a lane**: only BOB keeps timers; lanes act on messages. Confirm to BOB by one one-shot `create_trigger`
  into BOB's session. Never `fire_trigger`. Measure context with `get_session`; refresh at 75%.
- Deploying stays DIST's by Bob's standing permission, only when asked, under the gate; report to BOB after landing.

## What is LIVE — 0.79.0, measured 13:55Z (deployments API 100%, `/version`, `op=bootstrap&members=1`) — ROLLBACK TARGETS

biosmoke7 `f92ca6a8-2b83-4d2d-8a09-ffd147b25df4` (plane sha256 `09e4e334…`, storeVersion 0.79.0, limits.subrequests 10000 read
back) · agent-worker `508d516e-b7fe-4560-b61c-b65e6065cfa7` · pdf-worker `f7e9c5de-fc58-420e-aa82-fcd4aefeae6a` · ocr-worker
`b7fbd59b-e554-401b-a9bc-5d98b5caf0fd` · civicos `37f4b0ad-b7c3-4864-b85c-7254bfe93f72` (`/build` `5c7ac848…`) · newgroup
`3df99d2e-6d41-44f0-9a2f-28486b6d7e42` (RELEASE_SOURCE → `09e4e334…`, carries DIST-9, bindings `[]`). The 0.78.0 ids:
biosmoke7 `bfc7677f` · agent-worker `187e2e29` · pdf-worker `43702cbb` · ocr-worker `c57606be` · civicos `afd4a640` ·
newgroup `7a47324c`. Live probe 6/6 (NAMESPACE_PINNED and NAMESPACE_UNKNOWN answered; 0 in the 0.78.0 bundle); audit =
the ten-id baseline. M-137: URL preflight 14/14 LIVE; digestcensus 0/0; changedfromaudit 0; homecensus shas 1.
biosmoke7's stores record group `believe-in-oakland` (never seed again). D-461 is live: a public op pinned to `bio` now
REFUSES `store=scratch` (NAMESPACE_PINNED) — probes of public ops must name `store=bio` or nothing.

## What waits for the release Bob asks for (origin/main @ `548eb2c5`; re-read `git log 38b49c50..origin/main` at the cut — never this list)
**UPDATE 12:25Z (BOB #32, verified at the code by DIST #6): main = `13073707`** (c20-batch14 landed 11:39Z; gate GREEN
351/351 · 19,983 per BOB). Now ALSO owed at the next release: **D-461** (SAFETY: `store=scratch` on a public op pinned to
`bio` is refused by name, C-78.2; CLAUDE.md §5 updated — a probe of a public op on scratch is REFUSED), **D-464**
(DISCLOSURE: every count a member session is served goes through its own sight — name it in the landing report),
**D-462** (agent-worker names its namespace exactly; **I8 2.0.0 MAJOR** — agent-worker ships FIRST or with the plane,
member bytes move). **DIST-11** (the `browser` binding class, before any BROWSER binding) is a BACKLOG row, not built
(`ledger.mjs find DIST-11`: queued, after D-64).

**Name in the landing report (security / disclosure):** D-456 (IC-237: unknown `store=` refused), D-447 (IC-238: ranked
search drops `score`, ranks over visible rows only), MK-6 (member id no longer published in observations; IC-226), D-162's
handle correction (a theme reading shows members only the declarer's handle), the `statementack` case-document bound
(C-82, IC-246: refuses over the bound), the `actionlaws` machine refusal (`op=affordances` no longer offers it to machines).
Also REC-179, REC-177, REC-181, REC-180, D-440, D-420, REC-176's snap-key census op, the corrected `livefire.mjs`.
**Post-deploy reads owed (run on `store=bio` under admin, report figures to CONDUCT, SCHEDULER, BOB):**
REC-175 `op=digestcensus` (incl. `bytes_disagree`); D-256's `changedfromaudit` read (NOT on main at writing) (affected / wrong / right / undetermined);
after D-178 lands, `op=audit` on `store=bio` into a `measurements/<id>.md` (M-117 predicts no change vs the ten-id baseline);
REC-190's `homecensus` read with `store=bio` → report `shas`, no repair (REC-190 NOT on main at writing — check).
**Fleet moves:** D-452 / FL-11 / FL-12 rebuilt the agent-worker bundle — MEMBER BYTES MOVE; agent-worker first or with the
plane (IC-130). I8 is **1.0.0 STABLE** (IC-242, D-260): the plane now calls `AGENT_WORKER` for woken runs. D-462 (I8 2.0.0,
agent-worker namespace narrowing) is coming in c19-batch10/11 — read every IC since 0.78.0 in `INTERFACE-CHANGES.md` and
state which members move. Coming next, not on main at writing: D-461 (`store=scratch` refused on the 12 public ops — a
probe that reads a public op on scratch will be refused), D-464, D-462, REC-190.
**civicos** moves with the plane (gate step 12): check `civicos-ui/app.html`'s diff since 0.78.0's tag commit.

## DIST's rows

- **DIST-8 · queued, BACKLOG** (`node tools/ledger.mjs find DIST-8`; not cached at writing). Sweep scratch residue left by
  GONE sessions (BOB #32's ruling 2026-09-23 23:30Z: a session's own scratch is its own; gone sessions' residue is DIST's,
  swept at each cut's live verification). Accepts: scratch empty after, `bio` counters unchanged; NEGATIVE CONTROL: a sweep
  call without `store=scratch` is refused (D-456) or moves `bio`'s counters. **Before building, read `op=purge`'s reach:
  it would take LIVE sessions' residue too.** Known residue: DIST #5's `INQ-2026-9172-dist5-*` (a, b, c; several suffixes)
  and runs `RUN-2026-0923-dist5-*` (all closed), DIST #4's `INFO-2026-9436-dist4-muc6a1x0`, member `dist3-rec156-muboxe9j`,
  livefire canaries, 13 July probe members (not DIST's), CPDF-3's count of 17 bundles and 11 aiRuns. Build only when
  SCHEDULER caches it and CONDUCT writes `running`.
- **DIST-12 · LANDED on main** (`1a0fc88f` an ancestor of `13073707`). Release gate step 7a runs
  `node tools/urlpreflight-entry.mjs --release X.Y.Z --id <M-id> --out docs/development/measurements/<M-id>.md` at the
  next release; first reading M-136 14/14 LIVE. Its accepts-when is that release's entry.
- **newgroup/dist REBUILD OWED, first act.** `newgroup-dist-078` (`cfe2d0cc`) LANDED anyway (train c20-batch17): main's
  bundle reads RELEASE_VERSION 0.78.0 but was built BEFORE DIST-9, so it lacks DIST-9's installer code (measured on
  `13073707`: `instanceAiBinding` 0 times in `newgroup/dist/newgroup.bundled.mjs`, 4 in `newgroup/src/index.mjs`). From
  origin/main: `cd newgroup && npm run build`; check RELEASE_VERSION 0.78.0, evaluated RELEASE_SOURCE sha256 `9dac9e46…`,
  `instanceAiBinding` present; build twice for byte-identity; gate; push a land/dist branch. Rebuild at EVERY cut and
  after any `newgroup/src` change. Freshness guard routed to SCHEDULER by CONDUCT #20.
- **DIST-7 · queued, BACKLOG**: installer uploads carry `limits.subrequests` from the signed release (depends on D-54).
- **DIST-9 · LANDED on main** (in train `135abf3b`, c20-batch15, with IC-261; verified 06:47Z: `41c195d5` is an
  ancestor of origin/main). Install/update CARRY an operator-supplied `INSTANCE_AI_TOKEN`, never generate one;
  `15.instance-ai-secret` BUILT. Reaches groups only with the next release.

## The cloud machine

- SessionStart hook supplies node, full history, the `npm ci` installs, `ssh-keygen`, the keys as env variables.
  Cloudflare reaches through the proxy (`api.cloudflare.com` and `*.believeinoakland.workers.dev` credential-injected);
  `NODE_USE_ENV_PROXY=1 npx wrangler whoami` must name `20b533579290b9b93168345edd3b7f72` (stop if not). The other
  account's environment may differ — re-measure.
- **A tag cannot be pushed from the cloud** (`git-receive-pack` 403 on `refs/tags/*`, 2026-09-23; branches pass).
  `v0.72.0`–`v0.78.0` exist on no remote; use cut commits (`b942d973` … `dfe9858c`). BOB #29 judged it non-blocking.
- A fresh clone holds no gate record: a cut's step 1 is the whole battery, `gates.mjs --full --no-reuse` (~1,100–1,600 s).
- Instruments (`cf.mjs`, `sigctl.mjs`, `call.mjs`/`probe.mjs`, `audit.mjs`, `ngread.mjs`) lived in scratchpads, now
  gone; each ~30 lines, rebuild from DIST.md's lessons. The deployments read: `GET /client/v4/accounts/<id>/workers/
  scripts/<name>/deployments`. `ngread`: the esbuild'd `RELEASE_SOURCE` is a SINGLE-quoted literal — evaluate with
  `vm.runInNewContext`, hash, compare to `RELEASE.json` sha256.
- Push a `land/*` branch only after its local gate is GREEN on that tree; never push a negative control to `land/*` or
  `integrate/*` (Bob: every failed GitHub run emails him).

## The next cut's expected figures (from 0.78.0's cut; measure, compare, record the SEQUENCE — lesson 19)

Next RELEASES row: `["0.78.0", "dfe9858c89810a49422ee071c4f0bf92c0c2f297"]`. Expected migrate-released: baseline 522+21 →
**543/0**, `alterafter` **465/78**, `groupwipe` **527/16** — trains since may change other arms; predict before arming.
Trends: gate 278·16785 (0.72) → 281·16989 → 282·17056 → 284·17175 → 289·17362 → 291·17466 → **296·17690 (0.78.0,
`--full --no-reuse` on `9beb2c57`, 1299 s)**; main at 15b2a4c0 gated 322/322 per CONDUCT #19 (a pointer, not a measurement). `alterafter` pass: 318 →
339 → 360 → 381 → 402 → 423 → **444** (fail fixed at 78). Signature 7/7; newgroup embed 23/0, wizard 184/0 at 0.78.0.
**op=audit baseline (lesson 15), 10 C-18.9 ids:** INFO-2026-0099-auditor-report-feb-2022, -0100-acfr-fy2023-24-fund-
statements, -0100-adopted-budget-fy2026-27, -0103-acfr-fy2023-24-pdf, -0104-adopted-budget-book-pdf, -0105-adopted-budget-
fy13-15-csv, -0106-acfr-fy2021-22-pdf, -0107-revenue-expenditure-reports-page, -0108-zolly-opinion,
INFO-2026-5460-member-release-key-registry. A live probe opens runs over an EXISTING scratch inquiry (REC-171: an admin
cannot promote/create an inquiry outside a run); pair refusals with a positive arm whose wire code is absent from the prior
signed bundle (lesson 18); since D-116 read `storeVersion` and `members=1`.

## Carried, not re-verified

v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline; v0.59.0–v0.63.0 WITHDRAWN (in `migrate-released`'s `WITHDRAWN`).
D-85's live refusals (0.75.0) and D-442's DO build (0.74.0) UNDETERMINED live. Full 0.72.0–0.77.0 figures: this file's
history on `coord` (`git log origin/coord -- docs/development/kickoffs/DIST-NEXT.md`, version at `5e7d2048`).

## Session state

DIST #6 is IDLE, no timers armed, no worktrees, nothing uncommitted. Its predecessor DIST #5 was handed to BOB #32 for
archive. Successor: BOB starts you; confirm to BOB by one one-shot trigger carrying your session id.
