# DIST — resume here. Written 2026-09-22 by DIST #4 for DIST #5, who may run in the CLOUD on Bob's second account with NO memory and NO .env.

**Bob ordered a move to cloud-based Claude Code and his second Max 20x account (relayed by BOB #27, 2026-09-22).
This file assumes you inherit NOTHING: no memory, no `.env`, no scratchpad, no session wakes.** 0.71.0 is complete
and live; **a BATCH, 0.72.0, is owed** (below). Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL — its WHEN DIST
CUTS, the `latest` pointer mechanism and its LESSONS are the process. This file is only state, MEASURED 2026-09-22
~15:30Z. Re-measure before acting: a deployment is a fact about the ACCOUNT.

## FIRST: what you cannot do without secrets — Bob's decision, not yours

A cut needs these, by step (NAMES only; values never enter the repo or a message):
- **SIGN** (`tools/release-assemble.mjs --sign`): `BIO_RELEASE_SEED` — the supply-chain key; every installer trusts it.
- **DEPLOY / READ WHAT IS LIVE** (`bio-plane/scripts/deploy.mjs`, `tools/deploy-fleet.mjs`, `civicos-ui/deploy-ui.mjs`,
  wrangler for `newgroup`, the deployments API): `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (aliases `CF_TOKEN`,
  `CF_ACCT`; the account MUST be `20b533579290b9b93168345edd3b7f72` — if anything reports another, STOP and say so).
- **LIVE-VERIFY** biosmoke7 and `op=audit`: `BIO_ADMIN_TOKEN`, `BIO_MEMBER_TOKEN`.
**Which of these may live in a cloud environment is a risk decision carrying Bob's name; BOB #27 carries it to him
(DIST #4 sent the names).** Until he rules, do NOT improvise a secret's home. Without the seed, `release-assemble`
refuses `[NO_SEED]` — correct. You can still prepare a cut branch (bump, RELEASES row, gate) and stop before signing.
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

- DIST #4 (Mac, first account) holds session-only wakes: recurring `b9dd7809`, renewal `541fd1f1`, the 0.72.0 bound
  `5f9ed52f` (2026-09-22 21:07 PDT). They die with it; **arm your own** (every 6 h, opening with `get_usage` against
  70%; a 5-day renewal; a one-shot bound at the batch). DIST #4 was at ~63% context at this edit.
- Every DIST branch is on the remote. Worktree `.claude/worktrees/dist-4` (Mac) holds nothing unpushed.
- Bob, 2026-09-22 (CLAUDE.md §6): never queue a gate behind another lane's. Two batteries at once thrash this Mac (a
  630 s battery took 2784 s, and a subprocess timeout read as a RED — M0-103/M0-107).
- A compound command wrapping `git push origin HEAD:main` was refused once without a reason; the BARE push, alone in
  its own call, passed. A non-fast-forward is a race: fetch, merge, re-check `--since`, push.
