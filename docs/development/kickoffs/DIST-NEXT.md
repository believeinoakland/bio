# DIST — resume here. Updated 2026-09-24 23:40Z by DIST #7 (`session_01FQcUMZ2f34zhHzBkMEEdQ6`, cloud), successor of DIST #6 (`session_01Vi1XTVwxcBBMStifuBasLZ`, archived at this write). Standing: THE RELEASE IS HELD (Bob, 22:30Z via BOB #34) — cut nothing unless Bob types the ask in DIST's own session.

**DIST #7's measured state, 23:40Z on origin/main `9f8b69e6`:** every DIST branch is an ancestor of main EXCEPT
`land/dist/DIST-7` @ `c1cc9d90` (1 commit ahead, merges clean into `9f8b69e6` by `git merge-tree`). **DIST-7 RIDES THE NEXT
TRAIN** — handed to CONDUCT #20 by DIST #7. DIST-11 (`41322908`), DIST-13 (`82b5bf71`) and cut-0.79.0 (`d2ca15b0`) are ON MAIN
(c20-batch25). **Record defect:** BACKLOG's DIST-7 row reads `integrated` while `c1cc9d90` is on no main — sent to SCHEDULER #20.
The "newgroup/dist REBUILD OWED" item below is SUPERSEDED: main's bundle carries `instanceAiBinding` (4) and DIST-13's guard now enforces freshness.

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

## What the NEXT release owes (re-read `git log 5f116f33..origin/main` at the cut — never this list)

Everything through 0.79.0 SHIPPED (its pointer landed at `5f116f33`). The next cut adds DIST-11 (the BROWSER binding) and
DIST-13 (the installer-bundle freshness guard) once they land, plus whatever the trains carry. **Live checks owed at that deploy:**
- **D-475** (read-only, public): `GET /?store=scratch` shows scratch's slug or the "no group recorded" words; `GET /?store=nonsense`
  returns 400 NAMESPACE_UNKNOWN.
- **D-490, the FIRST live render ever:** deploy WITH BROWSER, run ONE `op=acquire` `render: true` in `store=scratch` with the `bio`
  counters witnessed. D-490 sends `cf-brapi-client: bio-plane`; whether the service validates it is UNDETERMINED (if so:
  RENDER_FAILED naming the status). Report either outcome.
- D-461 is live: a public op pinned to `bio` REFUSES `store=scratch` (NAMESPACE_PINNED); probe public ops with `store=bio` or none.

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
- **DIST-11 · BUILT, `land/dist/DIST-11` @ `41322908`** (GREEN 352/352 · 20119): the derivation carries `browser`, wrangler.jsonc
  declares BROWSER, newgroup binds it (install + every update). **DIST-13 · BUILT, `land/dist/DIST-13` @ `82b5bf71`** (on DIST-11):
  battery guard `newgroup-bundle-fresh.test.mjs` byte-compares the committed installer bundle with a fresh build — it now FAILS
  any gate where `newgroup/src` changed without `cd newgroup && npm run build`. Both handed to CONDUCT #20 (19:34Z) for the train.
- **DIST-7 · BUILT (NARROWED), `land/dist/DIST-7` @ `c1cc9d90`** (GREEN 340/340 · 19329): the installer sends PLANE_LIMITS
  (subrequests 10000) on install and update, pinned to wrangler.jsonc; 15.subrequest-limit BUILT. NOT BUILT: carrying it at
  runtime from the signed release (a release-format decision — a separately signed field, or a /3 fleet statement older
  installers skip); routed to SCHEDULER #20 23:07Z. **Release HELD by Bob (22:30Z, via BOB #34): cut only when he types the ask here.**
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

## The next cut's figures (lesson 19: record the SEQUENCE)

Next RELEASES row: `["0.79.0", "dd324152…"]` (full sha from `git rev-parse dd324152`). **Not run at 0.79.0, so owed at the next cut:**
the migrate-released control arms (predict from 0.78.0's 522/0 · alterafter 444/78 plus two rows) and lesson 7's member byte
compare. Gate trend: 296·17690 (0.78.0) → **351·20004 (0.79.0, `--full --no-reuse` BACKSTOP)**. Signature controls 7/7 at both.
op=audit baseline (lesson 15; unchanged at 0.79.0), 10 C-18.9 ids: INFO-2026-0099-auditor-report-feb-2022,
-0100-acfr-fy2023-24-fund-statements, -0100-adopted-budget-fy2026-27, -0103-acfr-fy2023-24-pdf, -0104-adopted-budget-book-pdf,
-0105-adopted-budget-fy13-15-csv, -0106-acfr-fy2021-22-pdf, -0107-revenue-expenditure-reports-page, -0108-zolly-opinion,
INFO-2026-5460-member-release-key-registry. A live probe pairs refusals with a wire code
absent from the prior signed bundle (lesson 18); since D-116 read `storeVersion` and `members=1`.

## Carried, not re-verified

v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline; v0.59.0–v0.63.0 WITHDRAWN (in `migrate-released`'s `WITHDRAWN`).
D-85's live refusals (0.75.0) and D-442's DO build (0.74.0) UNDETERMINED live. Full 0.72.0–0.77.0 figures: this file's
history on `coord` (`git log origin/coord -- docs/development/kickoffs/DIST-NEXT.md`, version at `5e7d2048`).

## Session state

DIST #7 (`session_01FQcUMZ2f34zhHzBkMEEdQ6`) is the lane's session; no timers armed, no worktrees. DIST #6 archived by DIST #7
2026-09-24 ~23:40Z (idle; its only off-main branch, `land/dist/DIST-7`, is on origin and handed to the train).
