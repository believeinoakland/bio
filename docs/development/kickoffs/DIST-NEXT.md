# DIST — resume here. Written 2026-09-23 by DIST #5 (cloud, Bob's second account), after 0.72.0-0.77.0 went live (2026-09-23 ~13:10Z).

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

## What is OWED

0. **0.77.0 is LIVE on biosmoke7 but its POINTER and the INSTALLER are HELD — DIST's decision, told to BOB #30 (12:30Z),
   overrulable by "advance 0.77.0 now".** REC-171 makes `bio-plane/migrate/migrate.mjs` refuse SURFACE_NO_RUN per inquiry
   until REC-173 (BOB's migration-replay ruling) is built, so a group offered 0.77.0 (by `/update` through `main`'s
   `release/`, or by a fresh install through `newgroup`'s embed) could half-import. So: no `land/dist/release-0.77.0`
   push, and `newgroup` stays deployed at 0.76.0 (`60692a45`). **When REC-173 is on main: cut 0.78.0 (a batch, or a
   CUT NOW if anything closes), which carries REC-171 AND the fix, then advance the pointer and deploy the installer.**
   If BOB overrules first: merge `origin/main` into `dist/cut-0.77.0` (`6b0beb8e`, on the remote), gate, push
   `land/dist/release-0.77.0`, deploy `newgroup` from the tag's tree, read it back.
   0.76.0's pointer LANDED (`288fc128` is an ancestor of origin/main, checked 13:07Z): `/update` offers 0.76.0.
   **The integrator is CONDUCT #16 (`session_01DEAp94ny3PfWr6deFJtTaD`)** — send `land/*` notices there. Its next train
   (M0-126, UI-81/IC-185, D-389/IC-187, UI-82) LANDED at `e62e08e1` (13:32Z) — no closing; the plane changed (store.mjs,
   bio-checks), so it batches into the cut after REC-173. **Since M0-126 a release cut's gate is `node tools/gates.mjs
   --full --no-reuse` (TREE-SHARING §3a condition 3)**, not a bare `gates.mjs`. **BOB #30 (15:05Z): DIST.md step 1 is
   corrected (rides CONDUCT's train): a cut relies ONLY on an `isBackstop()` record for the exact tree, else
   `--full --no-reuse`, and NEVER on `--since`** — which DIST #5 used for its release MERGE trees (0.72-0.76); a landing
   branch's merged tree now gets `--full --no-reuse` too. **Refresh line is 80% (Bob, 2026-09-23)**, not 70%.
   SCHEDULER is #16 (`session_01UZaSR1KRWmADuxBFYk1wY9`).
   UI-81/UI-82 may change `app.html`: compare `/build` to sha256(app.html) at the cut.
1. **The next cut, by WHEN DIST CUTS.** Read `git log 6b0beb8e..origin/main` over the shipped paths. RELEASES row:
   `["0.77.0", "6b0beb8e7d321fe96d64de5e5b3aefa291b41599"]`. Expected: baseline 501 + 21 → **522/0**, `alterafter` → **444/78**, `groupwipe` → **508/14**
   (seven group-recording stores, 0.71.0-0.77.0). Measure.
   A cut base is `origin/main` MERGED with any still-waiting release merge. Before pushing any `land/*` branch: merge
   `origin/main`, gate the MERGED tree GREEN, then push.
   **civicos moves whenever `sha256(app.html)` ≠ the live `/build`** — compare at the cut, never from memory
   (0.72.0-0.74.0 missed UI-77 that way). Build from the TAG's app.html; deploy after the plane.
   **WHICH BUILD ANSWERS is now readable live (D-116, since 0.76.0):** `op=bootstrap&members=1` (no credential) answers
   `version`, `storeVersion` (the DO's own) and each member's `SERVING` version — use it in every landing report.
   **`op=airuntick` answers `ticked`, not `ok`** (the 0.76.0 probe's first run misread it; see the lessons below).
2. **The tags `v0.72.0`-`v0.77.0` are not on the remote** (above) — NOT CARRIED: BOB #29 (02:52Z) judged it non-blocking (nothing
   reads it; `b942d973` is on the remote) and named it to Bob as an optional web-UI act. A future cut's tag meets the
   same 403: push the branch, and let the tag follow when Bob's act or the environment allows.
   **BOB'S RULING, 2026-09-23 (TREE-SHARING §3):** every failed GitHub run emails Bob as an alarm — push a `land/*`
   branch only after its local gate is GREEN on that tree, and never push a negative control to `land/*` or `integrate/*`.
3. **D-260 item 2** (not re-measured): one organisation `ai` credential as a deploy secret, the way `DAEMON_TOKEN` is,
   AFTER the plane's caller lands — `node tools/ledger.mjs find D-260` first.
4. **Carried, not re-verified:** v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline; v0.59.0–v0.63.0 WITHDRAWN.

## What is LIVE (deployments API at 100%, 2026-09-23 ~13:05Z) — each id is the ROLLBACK TARGET for the next cut

biosmoke7 (0.77.0, bytes = signed `44b9f985…`; storeVersion 0.77.0) · agent-worker · pdf-worker · ocr-worker — all 0.77.0;
biosmoke7 `d204a1be-bfa0-424a-8304-fb346b504eb8`.
agent-worker `c55a04b3…` · pdf-worker `5b45f740…` · ocr-worker `714ea24c…` · civicos `f2a2ac27…` (`/build` `c866bb15…`) ·
**newgroup `60692a45…` STILL 0.76.0 (held, above).** The 0.76.0 ids: biosmoke7 `e319f8a1…` · agent-worker `a6f0647f…` ·
pdf-worker `b97fc33d…` · ocr-worker `40a19783…`.

**biosmoke7's stores record their producing group `believe-in-oakland` (seed, `token:admin`, 2026-09-22T04:26:11Z), both
`bio` and `store=scratch` — write-once, never seed again (C-64.3).** Since 0.72.0 a caller with NO credential reads the
slug (IC-174). An admin op with no `store` runs against `bio` (`scopeFor`) — always name `store=scratch`.
Scratch residue, not swept: DIST #5's `INQ-2026-9172-dist5-{a,b}-mudgvfyx` and runs `RUN-2026-0923-dist5-mudgvfyx-1..2`
(both closed), DIST #4's `INFO-2026-9436-dist4-muc6a1x0`, member `dist3-rec156-muboxe9j`, livefire canaries, 13 July
probe members (not DIST's) — so `op=purge` is not used.

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
