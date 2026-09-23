# DIST — resume here. Written 2026-09-23 by DIST #5 (cloud, Bob's second account), after 0.72.0 went live.

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

1. **The next cut, by WHEN DIST CUTS.** Read `git log b942d973..origin/main` over the shipped paths. Its RELEASES row:
   `["0.72.0", "b942d97308195a644f5c2ecb3ba79967ce7548ef"]` in `migrate-released.test.mjs`. Expected, by arithmetic:
   baseline 396 + 21 → **417/0** (19 per row as before, + 1 ARMED op=file, + 1 ARMED group) — MEASURE it, and record the
   `alterafter` sequence: … 279/78 → **318/78** (0.72.0's cut).
2. **The tag `v0.72.0` is not on the remote** (above) — NOT CARRIED: BOB #29 (02:52Z) judged it non-blocking (nothing
   reads it; `b942d973` is on the remote) and named it to Bob as an optional web-UI act. A future cut's tag meets the
   same 403: push the branch, and let the tag follow when Bob's act or the environment allows.
   **BOB'S RULING, 2026-09-23 (TREE-SHARING §3):** every failed GitHub run emails Bob as an alarm — push a `land/*`
   branch only after its local gate is GREEN on that tree, and never push a negative control to `land/*` or `integrate/*`.
3. **D-260 item 2** (not re-measured): one organisation `ai` credential as a deploy secret, the way `DAEMON_TOKEN` is,
   AFTER the plane's caller lands — `node tools/ledger.mjs find D-260` first.
4. **Carried, not re-verified:** v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline; v0.59.0–v0.63.0 WITHDRAWN.

## What is LIVE (deployments API at 100%, 2026-09-23 ~02:13Z) — each id is the ROLLBACK TARGET for the next cut

biosmoke7 `b7d623f4-45cc-4c0b-b67c-687cc2b22ace` (0.72.0, bytes = signed `cc68d981…`) · agent-worker
`dccd78e8-7d4b-40c8-877a-7bc46923abf6` · pdf-worker `44272240-164e-4e2f-9a6b-a82d263cfca4` · ocr-worker
`cd7c7c1e-70b7-45a4-8168-007948fd03a7` · civicos `7fe8fed0-9965-4baf-b558-b194c127e067` (unchanged since 0.71.0) ·
newgroup `07924f5d-69e7-4774-a05e-8f26588c2e01` (embeds 0.72.0, `RELEASE_SOURCE` hashes to `cc68d981…`, bindings `[]`).
The 0.71.0 ids, if 0.72.0 must be rolled back: biosmoke7 `70a37b76…` · agent-worker `4caffb96…` · pdf-worker
`a99238d0…` · ocr-worker `6ad45487…` · newgroup `62a59e41…`.

**biosmoke7's stores record their producing group `believe-in-oakland` (seed, `token:admin`, 2026-09-22T04:26:11Z), both
`bio` and `store=scratch` — write-once, never seed again (C-64.3).** Since 0.72.0 a caller with NO credential reads the
slug (IC-174). An admin op with no `store` runs against `bio` (`scopeFor`) — always name `store=scratch`.
Scratch residue, not swept: DIST #5's `INQ-2026-9172-dist5-{a,b}-mudgvfyx` and runs `RUN-2026-0923-dist5-mudgvfyx-1..2`
(both closed), DIST #4's `INFO-2026-9436-dist4-muc6a1x0`, member `dist3-rec156-muboxe9j`, livefire canaries, 13 July
probe members (not DIST's) — so `op=purge` is not used.

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
