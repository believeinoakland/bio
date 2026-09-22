# DIST — resume here. Written 2026-09-22 by DIST #4 for DIST #5, who may run in the CLOUD on Bob's second account with NO memory and NO .env.

**Bob ordered a move to cloud-based Claude Code and his second Max 20x account (relayed by BOB #27, 2026-09-22).
This file assumes you inherit NOTHING: no memory, no `.env`, no scratchpad, no session wakes.** 0.71.0 is complete
and live; **a BATCH, 0.72.0, is owed** (below). Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL — its WHEN DIST
CUTS, the `latest` pointer mechanism and its LESSONS are the process. This file is only state, MEASURED 2026-09-22
~15:30Z. Re-measure before acting: a deployment is a fact about the ACCOUNT.

## DIST #5, 2026-09-22 20:06Z — MEASURED in the cloud: everything but the network is in; the cut stops at the network

- **In, measured:** node v26.10.0; full history (not shallow); `node_modules` a real directory in `bio-plane`,
  `pdf-worker`, `ocr-worker`, `newgroup`; `/usr/bin/ssh-keygen`; `.git/bio-idalloc`; 29 GB free; all ten key NAMES set
  (values unprinted). `plancheck`: 0 fail, 4 warn (none DIST's). **No `.git/bio-gates` in this clone**: no GREEN FULL
  record here, so the cut's step 1 is the whole battery (M-99: ~1,100 s in a cloud container).
- **REFUSED, 2026-09-22T20:06Z:** `NODE_USE_ENV_PROXY=1 npx wrangler whoami` (in `bio-plane/`) → `fetch failed`;
  `curl https://api.cloudflare.com/client/v4/` and `https://biosmoke7.workers.dev/` → the proxy's CONNECT answered 403.
  So the Cloudflare keys stay UNCONFIRMED, and a deploy, a rollback-target read and every live verification cannot run.
  **Only Bob's environment network setting changes this** (admit `api.cloudflare.com` and `*.workers.dev`); DIST does
  not route around the proxy. A signed cut is NOT made ahead of it: a tagged branch nobody can deploy offers nothing and
  goes stale as `main` moves (lesson 11).
- **The batch grew since DIST #4 wrote below:** `66eab6a1` **REC-163 / IC-174** (I3 49.1.0 → 49.2.0): `op=instancegroup`
  admits the PUBLIC class — a caller with no credential is answered the recorded group slug or that none is recorded, and
  the setup page at `/` shows the slug. It **WIDENS** what a stranger may read: NAME it in the landing report beside
  IC-173. Not a CUT NOW (it closes no defect). Shipped paths since `v0.71.0`: 3 commits in `bio-plane/src`; none in
  `civicos-ui/app.html` or the members' source, so `civicos` stays and the members move their VERSION label only.
- **Self-wake:** routine `trig_014p69w2WQz7jfSkYeg4XHSF`, cron `0 4,10,16,22 * * *` UTC (the server anchors it to minute
  :08), firing into this session. A routine does not carry `CronCreate`'s 7-day expiry (vendor's description, unmeasured);
  re-read `list_triggers` at each wake. It fires first at 22:08Z; the first wake past the batch bound is 04:08Z.

## FIRST: the secrets a cut needs — RULED by Bob: they are in your environment

A cut needs these, by step (NAMES only; values never enter the repo or a message):
- **SIGN** (`tools/release-assemble.mjs --sign`): `BIO_RELEASE_SEED` — the supply-chain key; every installer trusts it.
- **DEPLOY / READ WHAT IS LIVE** (`bio-plane/scripts/deploy.mjs`, `tools/deploy-fleet.mjs`, `civicos-ui/deploy-ui.mjs`,
  wrangler for `newgroup`, the deployments API): `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (aliases `CF_TOKEN`,
  `CF_ACCT`; the account MUST be `20b533579290b9b93168345edd3b7f72` — if anything reports another, STOP and say so).
- **LIVE-VERIFY** biosmoke7 and `op=audit`: `BIO_ADMIN_TOKEN`, `BIO_MEMBER_TOKEN`.
**RULED by Bob, 2026-09-22 ~15:48Z (option C, relayed by BOB #27; recorded in `NEW-MACHINE.md` §0): all ten `.env`
keys live in the ONE cloud environment every session uses, placed there by Bob himself.** So find them as environment
variables and confirm each by USING it — `wrangler whoami` must report `20b533579290b9b93168345edd3b7f72` — and never
print a value. A key that is absent is absent: `release-assemble` refuses `[NO_SEED]`, correctly; say which, and stop.
Also needed: STOCK `ssh-keygen` (the acceptance authority for every signature) and `npm ci` in `bio-plane/`,
`pdf-worker/`, `ocr-worker/`, `newgroup/` (each `node_modules` a real directory).

## What is OWED

1. **0.72.0, a BATCH, no earlier than 2026-09-23 04:00Z** (a day after 0.71.0's cut). `git log v0.71.0..origin/main`
   over shipped paths reads REC-157 (`1e56c1c8`, `224dce98`): **IC-173** (I3 MINOR 49.1.0) — `op=publish`'s
   ALREADY_A_CASE_MEMBER compares the publishing project's RELATIONSHIP, so a moved conclusion takes a new case edition.
   It **WIDENS** what a publisher may do: NAME it in the landing report to BOB. Not a CUT NOW (no security, disclosure
   or authority defect; CONDUCT #12 concurs). Re-read the log for anything newer.
   - **Step 1 per M0-106** (`DIST.md`): NAME main's newest GREEN FULL record — at writing `f25d43b3` (tree `0a2b5b64`,
     file `.git/bio-gates/<tree>.*.json` in the clone that ran it: a cloud clone may hold NO record, and then step 1 is
     the whole battery) — or `gates.mjs --since` it. Then **send SCHEDULER the cut commit and that step-1 line**: it
     closes M0-106 on that witness.
   - RELEASES row: `["0.71.0", "9439431e0462522a52c46932985c3ad2eebcf1c7"]`. `migrate-released` expected: baseline
     **376/0**; `alterafter` **298/78** (sequence 135→169→186→203→220→237/66, 279/78 at 0.71.0; +19 per release row).
   - `civicos` moves only if `civicos-ui/app.html` changed since `v0.71.0` (not at writing). Members' bytes unchanged
     since v0.59.0 (`a7e5f590` / `0d99f5d0` / `b26dee19`): they move their VERSION label only, agent-worker FIRST.
   - Live probe (lesson 18): refusals + a positive arm only the NEW build can pass — IC-173's refusal gains `project`,
     `relationship`, `recorded_by`, absent from 0.71.0's answer — + a not-broken arm; every write `store=scratch`;
     witness the real record's `op=stats`.
2. **D-260 item 2** (not re-measured): carrying one organisation `ai` credential as a deploy secret, the way
   `DAEMON_TOKEN` is, AFTER the plane's caller lands — `node tools/ledger.mjs find D-260` first.
3. **Carried, not re-verified:** v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline; v0.59.0–v0.63.0 WITHDRAWN.

## What is LIVE (deployments API at 100%, 2026-09-22 ~15:30Z) — each id is the ROLLBACK TARGET

biosmoke7 `70a37b76-b199-418b-aac8-1867fa6df6c4` (0.71.0, bytes = signed `d255d1a4…`, 13 bindings) · agent-worker
`4caffb96-c458-4a2c-8f1f-f8c83974817d` · pdf-worker `a99238d0-9099-429b-a4a8-7afe85ad6978` · ocr-worker
`6ad45487-931f-447f-9e56-a82fb01c3d59` · civicos `7fe8fed0-9965-4baf-b558-b194c127e067` (`/build` `a13485ae…`) ·
newgroup `62a59e41-4e27-45c2-87db-c9b7a29bb4ed` (embeds 0.71.0, bindings `[]`). Main's `release/` = 0.71.0 (landed
`06832aff`); tag `v0.71.0` = `9439431e`.

**biosmoke7's stores record their producing group: `believe-in-oakland`, source `seed`, recorded_by `token:admin`
(2026-09-22T04:26:11Z), both `bio` and `store=scratch`. Write-once — never seed again (C-64.3).** Rolling the plane
back does not unseed. biosmoke7 binds `INSTANCE_NAME="biosmoke7"`, its WORKER name, not its group.
**An admin `op=livefire` with no `store` runs against `bio`** (`scopeFor`) — always name `store=scratch`.
Scratch residue, not swept: `INFO-2026-9436-dist4-muc6a1x0`, member `dist3-rec156-muboxe9j`, livefire canaries, and 13
July probe members (not DIST's), so `op=purge` is not used.

## The instruments — DIST #4's copies were Mac-only scratch; rebuild each from its lesson

- live state: deployments API per worker (`/workers/scripts/<w>/deployments`, the `(100%)` version) + each version's
  bindings (`/versions/<id>`) + `/version` / `/build` (lessons 3, 4).
- signature controls: stock `ssh-keygen -Y verify` — 2 POSITIVE (plane sig in `bio-release`, `fleetSig` in
  `bio-release-fleet`) beside 5 REFUSED (altered bytes, wrong namespace, wrong key, the previous release's sig, a
  member dropped from the fleet payload `--emit-payload` writes) (gate step 5).
- installer read-back: parse `RELEASE_SOURCE` out of the served script, EVALUATE the literal, hash it = `RELEASE.json`'s
  sha256; `bindings: []` from `/settings`; the active version = the one just deployed (lesson 8).
- civicos build: `worker.template.mjs` with `__APP_HTML_BASE64__` = base64(app.html) and `__BUILD_ID__` = sha256(app.html);
  deploy with `civicos-ui/deploy-ui.mjs`; `/build` must answer that sha (gate step 12).

## The 0.71.0 figures, for the next cut's comparison

Gate GREEN FULL on the cut tree `dadd0b5f`: 269/269 suites · 16413 assertions (EXCLUDES 2 untallied) · signature 7/7 ·
newgroup embed 23/0, wizard 146/0 · migrate-released 357. Trend 264·16114 → 265·16198 → 267·16264 → **269·16413**.
Live 12/12. `op=audit`: 31 checked, 21 clean, 10 C-18.9 — the baseline ids (lesson 15): INFO-2026-0099-auditor-report-
feb-2022, -0100-acfr-fy2023-24-fund-statements, -0100-adopted-budget-fy2026-27, -0103-acfr-fy2023-24-pdf,
-0104-adopted-budget-book-pdf, -0105-adopted-budget-fy13-15-csv, -0106-acfr-fy2021-22-pdf,
-0107-revenue-expenditure-reports-page, -0108-zolly-opinion, INFO-2026-5460-member-release-key-registry.
**UNDETERMINED, held open:** whether wrangler's uploaded member bytes equal a build of the tagged source (lesson 7 is
blocked by a MULTIPART answer); bounded only: member artifacts byte-identical at every tag v0.59.0 → v0.71.0.

## Session state and rules met this session

- **DIST #4 WOUND DOWN on Bob's order (BOB #27, 2026-09-22 16:49Z): development moves to his second account in cloud
  Claude Code, and the 0.72.0 cut is DIST #5's there.** DIST #4 deleted every wake in its own CronList (the recurring
  self-wake, the 5-day renewal and the 0.72.0 bound), so none fires. **Arm your own**: every 6 h, opening with
  `get_usage` against 70%; a 5-day renewal; a one-shot bound at the batch.
- Every DIST branch is on the remote. Worktree `.claude/worktrees/dist-4` (Mac) holds nothing unpushed.
- Bob, 2026-09-22 (CLAUDE.md §6): never queue a gate behind another lane's. Two batteries at once thrash this Mac (a
  630 s battery took 2784 s, and a subprocess timeout read as a RED — M0-103/M0-107).
- A compound command wrapping `git push origin HEAD:main` was refused once without a reason; the BARE push, alone in
  its own call, passed. A non-fast-forward is a race: fetch, merge, re-check `--since`, push.
