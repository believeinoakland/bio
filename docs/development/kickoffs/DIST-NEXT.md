# DIST — resume here. Written 2026-09-23 23:45Z by DIST #5 for DIST #6 (cloud, Bob's second account), at the 75% refresh line.

This file is only STATE, measured 2026-09-23 ~02:15Z. The process is `kickoffs/DIST.md` (WHEN DIST CUTS, the `latest`
pointer, the gate, the LESSONS) — read it whole. Re-measure before acting: a deployment is a fact about the ACCOUNT.
State files live on `coord` (M0-110): read with `node tools/coord.mjs read <path>`, write with
`node tools/coord.mjs write --replace <path> <file> -m "<what>"`.

## The cloud machine (DIST #5, measured)

- The SessionStart hook supplies node 26, full history, the four `npm ci` installs, stock `ssh-keygen`, the id ledger.
  All ten keys are environment variables. **Cloudflare is ADMITTED since 2026-09-23 ~01:24Z** (Bob's environment
  setting, relayed by BOB #29): `NODE_USE_ENV_PROXY=1 npx wrangler whoami` names `20b533579290b9b93168345edd3b7f72`;
  the deployments API and `*.believeinoakland.workers.dev` answer. `workers.cloudflare.com` is still refused (nothing
  of DIST's needs it).
- **A TAG CANNOT BE PUSHED FROM THIS ENVIRONMENT.** `git push origin refs/tags/v0.72.0:refs/tags/v0.72.0` → the session's
  git proxy answers `HTTP 403` on `git-receive-pack` (2026-09-23 ~02:08Z, four retries), while branch pushes to
  `dist/cut-0.72.0` and `main` pass. A policy denial: not routed around. **`v0.72.0` exists only in DIST #5's clone**
  (annotated, on `b942d973`, the cut commit, which IS on the remote). Routed to BOB. Until it is pushed, `git describe`
  and `v0.72.0..` ranges fail in every other clone: use `b942d973`.
- A fresh cloud clone holds no gate record: a cut's step 1 is the WHOLE battery (~1,070 s here).
- Instruments rebuilt this session live in the session scratchpad only (lost at container reclaim): `cf.mjs`
  (deployments API), `sigctl.mjs` (signature 7/7), `call.mjs`/`probe.mjs` (live probe), `audit.mjs`, `ngread.mjs`
  (installer read-back: the esbuild'd `RELEASE_SOURCE` is a SINGLE-quoted literal — scan by escapes, evaluate with
  `vm.runInNewContext`, hash). Each is ~30 lines; rebuild from the lesson.

## BOB'S RULING, ~17:00Z 2026-09-23 (relayed by BOB #30), SUPERSEDING every schedule below

*"there don't need to be ANY releases — for security, daily, or otherwise — until I say we need a release."*
**Cut NOTHING and deploy NOTHING until Bob asks through the BOB lane.** No daily cut; REC-175's digest census waits for
that release too. The daily wake `trig_014p69w2WQz7jfSkYeg4XHSF` is PAUSED by BOB #30 — do not re-arm it. DIST's last act
is DONE: 0.78.0's pointer LANDED at `38b49c50` (17:24Z; `release/` and the embed byte-identical to `183cc7df`, checked by
DIST on origin/main). `main` = live = 0.78.0. Nothing waits. IDLE until a BOB trigger.
**Queued for the release Bob asks for (pointers from CONDUCT #17, 21:25Z — re-read `git log 38b49c50..origin/main` at the
cut, never this list):** closings REC-179, REC-177, REC-181, REC-180, D-440, D-420 (on main @ `02603e88`); REC-175 (its
digest census, including `bytes_disagree`, runs on `store=bio` right after that deploy — report the figure to CONDUCT,
SCHEDULER, BOB), REC-176's snap-key census op, the corrected `livefire.mjs`. **DIST-7 (DIST's row)**: the installer half of
D-54 (wrangler `limits.subrequests` 10000; `deploy.mjs` reads the limits back) — D-54 is unlanded at writing; look DIST-7
up in the plan before building it.
**After the release that first carries D-178** (op=audit's sweep reads the published registry; unlanded at 22:11Z): re-run
`op=audit` on biosmoke7 with `store=bio` and record the read in a measurement file (`measurements/<id>.md`, dated, with the
instrument). M-117 predicts NO tally change (0 basis legs there) — compare against the ten-id C-18.9 baseline.
(CONDUCT #17 for SCHEDULER #17 and BOB #31, 22:11Z.)
**From CONDUCT #18 (`session_01SGdcPXVjS2wofYoj3tBuKF`, 23:50Z) — still NO release asked:** main is at `a8f6094a` and more
trains follow (c18-rulings, c17-batch7, c18-batch8). **For the release that carries c17-batch7:** MK-6 is a DISCLOSURE fix
(a published observation no longer names the member; IC-226) — name it in the landing report; D-256 adds a read op
`changedfromaudit` (NOT on main at writing): on the deploy that carries it, run it with `store=bio` under the admin token
and report affected / wrong / right / undetermined (UNDETERMINED until run); FL-11/FL-12 rebuilt the agent-worker bundle,
so MEMBER BYTES MOVE — the fleet guard and member deploys carry real changes, not a label. **For the release carrying
D-456:** an unknown `store=` value is refused instead of resolving to the real record — every DIST instrument names
`bio` or `scratch` (probe*.mjs already do). **DIST-8** (sweep the scratch residue that gone sessions left; CPDF-3's worker
counted 17 bundles, 11 aiRuns and more) is in the BACKLOG (`node tools/ledger.mjs find DIST-8`), not the cache: build it
when SCHEDULER caches it, and read `op=purge`'s reach first (it would take other lanes' residue).
When one comes, the sections below are the state to resume from (0.78.0 live; next RELEASES row and figures in item 1).

## What is OWED

0. **`land/dist/release-0.78.0` @ `183cc7df` waits on CONDUCT #16's train** (`session_01DEAp94ny3PfWr6deFJtTaD`; tree `9beb2c57`
   = the cut tree, GREEN `--full --no-reuse` 296/296 · 17690). Confirm: `git merge-base --is-ancestor 183cc7df origin/main`.
   **The 0.77.0 hold is OVER:** 0.78.0 carries REC-173, and its pointer and the installer both advance. 0.77.0 was never
   offered to groups.
**BOB'S RULING (Bob, 2026-09-23 16:20Z, relayed by BOB #30): CUT NOW IS SUSPENDED.** *"Nobody can access the site except
me. Security updates don't matter at all at this point. Again, the primary focus is BIO development productivity.
Everything else is overhead."* A security, disclosure or authority closing no longer triggers a release. **Cut AT MOST
ONCE A DAY, only when main differs from the live release in a shipped path, or when Bob asks.** Verification is LEAN: the
backstop gate (`isBackstop()` record, else `--full --no-reuse`), the live `/version` + D-116 read, and the probe. Nothing
else in the estate waits on a deploy. (0.78.0 was already in flight at 16:20Z and was finished.) The wake is DAILY at
17:08Z (`trig_014p69w2WQz7jfSkYeg4XHSF`); the next cut is no earlier than 2026-09-24 ~17:00Z unless Bob asks.
1. **REC-175 (IC-192, I3 60.0.0) rides the next DAILY cut.** It makes `op=promote` refuse a sha256 that does not match the
   bytes and adds a read op, `digestcensus` (admin, probe; NOT on main at writing), counting stored rows whose digest
   disagrees; a live bundle already holding a false digest will refuse re-promotion and there is NO repair act. **So the
   deploy that first carries it runs the digest census on `store=bio` (admin) right after the deploy, and reports the
   figure to CONDUCT #16, SCHEDULER #16 (`session_01UZaSR1KRWmADuxBFYk1wY9`) and BOB #30.**
   Next RELEASES row: `["0.78.0", "dfe9858c89810a49422ee071c4f0bf92c0c2f297"]`. Expected: baseline 522 + 21 → **543/0**, `alterafter` → **465/78**,
   `groupwipe` → **527/16** (eight group-recording stores). Measure. Gate: an `isBackstop()` record for the exact tree,
   else `gates.mjs --full --no-reuse`; never `--since` (BOB #30). Refresh past 80%.
2. **The tags `v0.72.0`-`v0.78.0` are not on the remote** (above) — NOT CARRIED: BOB #29 (02:52Z) judged it non-blocking (nothing
   reads it; `b942d973` is on the remote) and named it to Bob as an optional web-UI act. A future cut's tag meets the
   same 403: push the branch, and let the tag follow when Bob's act or the environment allows.
   **BOB'S RULING, 2026-09-23 (TREE-SHARING §3):** every failed GitHub run emails Bob as an alarm — push a `land/*`
   branch only after its local gate is GREEN on that tree, and never push a negative control to `land/*` or `integrate/*`.
3. **D-260 item 2** (not re-measured): one organisation `ai` credential as a deploy secret, the way `DAEMON_TOKEN` is,
   AFTER the plane's caller lands — `node tools/ledger.mjs find D-260` first.
4. **Carried, not re-verified:** v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline; v0.59.0–v0.63.0 WITHDRAWN.

## What is LIVE (deployments API at 100%, 2026-09-23 ~16:52Z) — each id is the ROLLBACK TARGET for the next cut

biosmoke7 `bfc7677f-205b-416d-ab07-74936b2bd921` (0.78.0, signed `9dac9e46…`; storeVersion 0.78.0) · agent-worker
`187e2e29-8918-42d1-8be0-0bd326fa9e59` · pdf-worker `43702cbb-6e22-4d16-8fab-b04dae05c5cc` · ocr-worker
`c57606be-0067-4c4c-8801-ace1daba9647` · civicos `afd4a640-a300-43a5-9aee-71fa86d24241` (`/build` `a2599046…`) · newgroup
`7a47324c-5c28-4f82-8659-018dd1c71107` (embeds 0.78.0, `RELEASE_SOURCE` → `9dac9e46…`, bindings `[]`).
The 0.77.0 ids: biosmoke7 `d204a1be…` · agent-worker `c55a04b3…` · pdf-worker `5b45f740…` · ocr-worker `714ea24c…` ·
civicos `f2a2ac27…` · newgroup `60692a45…` (0.76.0).

**biosmoke7's stores record their producing group `believe-in-oakland` (seed, `token:admin`, 2026-09-22T04:26:11Z), both
`bio` and `store=scratch` — write-once, never seed again (C-64.3).** Since 0.72.0 a caller with NO credential reads the
slug (IC-174). An admin op with no `store` runs against `bio` (`scopeFor`) — always name `store=scratch`.
Scratch residue, not swept: DIST #5's `INQ-2026-9172-dist5-{a,b}-mudgvfyx` and runs `RUN-2026-0923-dist5-mudgvfyx-1..2`
(both closed), DIST #4's `INFO-2026-9436-dist4-muc6a1x0`, member `dist3-rec156-muboxe9j`, livefire canaries, 13 July
probe members (not DIST's) — so `op=purge` is not used.

## The 0.78.0 figures (a CUT NOW for REC-172 / IC-188; carries REC-171, REC-173, REC-174, REC-160, UI-81, UI-82, D-389)

Cut `dfe9858c`. Gate `--full --no-reuse` GREEN on `9beb2c57`: **296/296 · 17690**, 1299 s. Signature 7/7; newgroup 23/0,
184/0; migrate-released 522/0 · 444/78 · 468/54 · 522/0 · 486/36 · 521/1 · 508/14, each as predicted (0.76.0 + 0.77.0
rows added together). civicos moved (a2599046…). Live: D-116 all 0.78.0; probe 9/9 (`fetchs` bound and an array consume →
AI_RUN_BOUND_UNKNOWN; a map consume ticks; REC-171 and REC-163 hold); audit = baseline. probe78 opens its runs over
`INQ-2026-9172-dist5-a-mue0uvwj` (an admin can no longer create an inquiry outside a run).

## The 0.77.0 figures (a CUT NOW for REC-171 / IC-186; I3 58.0.0; pointer and installer HELD)

Cut `6b0beb8e` (carries 0.76.0's pointer merge). Gate GREEN FULL on `60f8f720`: **291/291 · 17466**, 1574 s. Signature 7/7;
newgroup 23/0, 184/0; migrate-released 501/0 · 423/78 · 449/52 · 501/0 · 465/36 · 500/1 · 489/12, each as predicted.
Live: D-116 reads version, storeVersion and every member 0.77.0; probe 8/8 — a deploy token's inquiry naming no run
→ SURFACE_NO_RUN (0.76.0 accepted exactly that at 11:30Z), the `surfaced_by: human` liar refused alike, one naming its
running run accepted and spending one `surfaces`; `bio` witness unchanged; audit = baseline. **REC-171 changes what a
DIST probe may set up:** an admin can no longer promote an inquiry without a run — open the run over an EXISTING scratch
question (probe77 used `INQ-2026-9172-dist5-a-mue0uvwj`). Scratch residue added: `INQ-2026-9172-dist5-c-mue45ibs`, run
`RUN-2026-0923-dist5-mue45ibs-1` (closed).

## The 0.76.0 figures (a CUT NOW for REC-169 / IC-184; carries D-116, REC-170, DIST-6; I3 57.0.0)

Cut `4494f725` (carries 0.75.0's pointer merge). Gate GREEN FULL on `2f424ed1`: **289/289 · 17362**, 1538 s. Signature 7/7;
newgroup embed 23/0, **wizard 184/0 after correcting three superseded arms** (the first D-116 embed made a post-update
plane without `storeVersion` read as stale — installer right, fixtures old; now `midUpdateBuilt`; `midUpdate` kept for
D-116's own stale-store arm; control storeVersion "x" → exactly those three fail). migrate-released: 480/0 · 402/78 ·
430/50 · 480/0 · 444/36 · 479/1 · 470/10, each as predicted. Live 11/11 (REC-169's two codes, `ticked:false`; a positive
tick accepted); D-116 live: storeVersion and all members 0.76.0; audit = baseline. DIST-6's new-install bindings are
fake-API only (no install runs on biosmoke7).

## The 0.75.0 figures (a CUT NOW for D-85 / IC-181; I3 55.0.0; civicos moved)

Cut `90bd6451`. Gate GREEN FULL on `88afc5a6`: **284/284 · 17175**, 1447 s. Signature 7/7; newgroup 23/0, 146/0;
migrate-released controls: 459/0 · alterafter 381/78 · nosecondpass 411/48 · percolumn 459/0 · firstbootalways 423/36 ·
firstbootnever 458/1 · groupwipe 451/8 (the handoff's 453/6 was an arithmetic slip). Live 11/11 (not-broken arms);
civicos `/build` and served page = sha256 of the tag's app.html; audit = baseline. **UNDETERMINED live:** D-85's
refusals need an `ai` credential; none is held here and DIST does not mint one for a probe.
Scratch residue added: `INQ-2026-9172-dist5-{a,b}-*` from each probe run (suffixes mudms9h0 and the 0.75.0 run's), and one
closed run each.

## The 0.74.0 figures (a CUT NOW for D-442 / IC-179 — DIST's reading: another project's publish moved a pinned finding)

Cut `cacebb12` (carries 0.73.0's pointer merge). Gate GREEN FULL on `87cf824f`: **282/282 · 17056**, 1591 s (this
container ran slower than the 0.73.0 cut's 1064 s). Trend … 278·16785 → 281·16989 → **282·17056**. Signature 7/7;
newgroup 23/0, 146/0; migrate-released controls each at the figure predicted before arming: 438/0 · alterafter 360/78 ·
nosecondpass 392/46 · percolumn 438/0 · firstbootalways 402/36 · firstbootnever 437/1 · groupwipe 432/6. Live 11/11
(the REC-163 and REC-168 arms as not-broken); audit = baseline. **UNDETERMINED live:** which DO build answers — D-442
is reachable only through a ratified case, and no write-free arm discriminates it (lesson 18).
Scratch residue added: `INQ-2026-9172-dist5-{a,b}-mudms9h0`, run `RUN-2026-0923-dist5-mudms9h0-1` (closed).

## The 0.73.0 figures (a CUT NOW for REC-168 / IC-178; I3 53.0.0)

Cut `d2568491` on `dist/cut-0.73.0`. Gate GREEN FULL on tree `ac4b3020`: **281/281 · 16989** (EXCLUDES 2), 1064 s. Trend
… 269·16413 → 278·16785 → **281·16989**. Signature 7/7. newgroup 23/0, 146/0. migrate-released controls: baseline 417/0 ·
alterafter 339/78 · nosecondpass 373/44 · percolumn 417/0 · firstbootalways 381/36 · firstbootnever 416/1 · groupwipe
413/4. Live 11/11: C1 member under the admin's running run → `AI_RUN_NOT_PRINCIPAL` on `op=capturerequest` (v0.72.0's
`captureRequest` has no `runPrincipalGate`); C2 admin's own run reaches `CAPTURE_REQUEST_NOT_PUBLIC`; C3 ended run
`CAPTURE_REQUEST_NO_RUN`; C4 capture queue unchanged; `bio` witness unchanged. Audit: the ten baseline ids only.
Scratch residue added: `INQ-2026-9172-dist5-{a,b}-mudktsa9`, run `RUN-2026-0923-dist5-mudktsa9-1` (closed).

## The 0.72.0 figures, for the next cut's comparison

A CUT NOW (REC-165 / IC-176, an authority closing) carrying REC-157, REC-163, REC-166, REC-167; I3 at 52.0.0. Cut
`b942d973` on `dist/cut-0.72.0`; its merge `2049195c` (on `origin/main` at `c5c83dc4`) is GREEN FULL on tree `8747a4d6`
(279/279 · 16827, `--since b942d973`), pushed as **`land/dist/release-0.72.0`** for CONDUCT's train (M0-111: a direct push
to `main` is refused). **Until the train lands it, `main`'s `release/` still reads 0.71.0 and `/update` offers 0.71.0** —
the fix is live on biosmoke7 regardless. Confirm it landed: `git merge-base --is-ancestor 2049195c origin/main`. Gate GREEN FULL on the cut
tree `a766042a`: **278/278 suites · 16785 assertions** (EXCLUDES 2 untallied), 1067 s. Trend 264·16114 → 265·16198 →
267·16264 → 269·16413 → **278·16785**. Signature 7/7. newgroup embed 23/0, wizard 146/0. migrate-released 396; controls
baseline 396/0 · alterafter 318/78 · nosecondpass 354/42 · percolumn 396/0 · firstbootalways 360/36 · firstbootnever
395/1 · groupwipe (new) 394/2. **The 0.71.0 row falsified two premises of that suite, corrected in the cut:** 0.71.0
stamps its recorded group into a document at promote, so op=file is compared with the OLD plane's own answer; and a
0.71.0-born store records a group at its own first boot, so the current plane must KEEP it. Every later release does
both, so its row takes the same path — nothing to change but the row.
Live 12/12 (public `op=instancegroup` → slug only; `SUGGEST_RUN_NOT_RUNNING` and `SUGGEST_OUTSIDE_RUN_CONTEXT` from the
DO, absent from v0.71.0's source; `SUGGEST_NO_RUN`; an in-context suggestion ACCEPTED; `bio` witness unchanged).
`op=audit`: 31 checked, 21 clean, 10 C-18.9 — exactly the baseline ids (lesson 15): INFO-2026-0099-auditor-report-
feb-2022, -0100-acfr-fy2023-24-fund-statements, -0100-adopted-budget-fy2026-27, -0103-acfr-fy2023-24-pdf,
-0104-adopted-budget-book-pdf, -0105-adopted-budget-fy13-15-csv, -0106-acfr-fy2021-22-pdf,
-0107-revenue-expenditure-reports-page, -0108-zolly-opinion, INFO-2026-5460-member-release-key-registry.
**UNDETERMINED, held open:** REC-167's `CASE_CONCLUSION_MOVED` was not live-probed (it needs a ratifiable case in
scratch); the battery covers it. Whether wrangler's uploaded member bytes equal a build of the tagged source (lesson 7;
the content API answers MULTIPART); bounded: member artifacts byte-identical at every tag v0.59.0 → v0.72.0.
agent-worker's one suggest site: a model-written target outside its run's context is now refused and routed to ADJUST
(CONDUCT #14; SCHEDULER holds it) — a narrowing the unchanged member meets, not a break.

## Session state

- **DIST #5 is live**, session `session_01DUyQVnz7x2hK5EajCdhEfC`. Self-wake: routine `trig_014p69w2WQz7jfSkYeg4XHSF`,
  cron `0 4,10,16,22 * * *` UTC (fires at :08), into this session; re-read `list_triggers` at each wake. Context is
  measured with `get_session`.
- Every DIST branch is on the remote (`dist/cut-0.72.0`); the deploy worktree `/home/user/bio-deploy-0720` is removed
  after the landing.
