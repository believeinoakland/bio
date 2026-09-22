# DIST — resume here. Rewritten 2026-09-22 by DIST #4 after cutting, deploying, SEEDING, live-verifying and POINTING 0.71.0, a BATCH.

**0.71.0 is complete — every gate step, and D-436's write-once seed of biosmoke7 is DONE. Nothing is owed on it.**

Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL. Its **WHEN DIST CUTS**, the **`latest` pointer mechanism** and the
**LESSONS** are the process; this file is only the state, MEASURED 2026-09-22 ~04:40Z. Re-measure before acting on any
of it — a figure is about the tree and the moment it was taken on, and a deployment is a fact about the ACCOUNT.

## 0.71.0 — what it carried, and the seed

- **BATCH** (no security or disclosure closing): **D-436 / IC-172** (I3 49.0.0 MAJOR, I5 1.24.0 MINOR: the producing
  group is ONE recorded value per store, table `instance_group`, written once) and **D-434** (`app.html`'s recipe step
  cites; `civicos` MOVED). Tag `v0.71.0` = `9439431e` (object `5390d5bd`); LANDED on main at `06832aff` (the first
  landing tree `31febe21` gated RED under two batteries' contention, M0-103; the re-merged `f9350a06` GREEN alone). Members'
  artifacts byte-identical to 0.70.0's (`a7e5f590` / `0d99f5d0` / `b26dee19`): they moved their VERSION label only.
- **THE SEED — irreversible, done, never to be repeated** (a second is refused C-64.3). The deploy's boot recorded
  NOTHING on either store (read BEFORE seeding: the new `op=instancegroup` answered `group: null`). Then scratch, then
  bio: `believe-in-oakland` · source `seed` · recorded_by `token:admin`, at 2026-09-22T04:26:11.493Z (scratch) and
  04:26:11.781Z (bio). biosmoke7 binds `INSTANCE_NAME="biosmoke7"` — its WORKER name, not its group — which is why the
  boot recording nothing mattered.
- **Guarding it, now in the gate:** `migrate-released` binds `INSTANCE_NAME` and asserts every released store records NO
  group at the current plane's first and second boot, beside a positive arm on a fresh store; controls (e)
  `firstbootalways` 321/36 and (f) `firstbootnever` 356/1, AS DECLARED. IC-172 had stated it could not see this.
- **D-436 item 3's route, BUILT and refined:** `newgroup`'s update path TELLS an operator whose copy ran a release before
  0.71.0 the root of trust's `op=instancegroupseed` (record and scratch), what is refused until then, and the installed
  name as a SUGGESTION only (biosmoke7 / believe-in-oakland as the example) — and NEVER seeds. It decides from the
  version read before the upload, because `op=instancegroup` answers admin/member/probe only and an update holds no
  instance credential; an unknown version gets a conditional telling. Construct `15.group-telling`; Distribution §5.
- **For the NEXT cut's upgrade arm: `["0.71.0", "9439431e0462522a52c46932985c3ad2eebcf1c7"]`** — RELEASES, NOT WITHDRAWN.

## What is LIVE (deployments API at 100%, 2026-09-22 ~04:35Z)

| worker | serves | active version id = ROLLBACK TARGET |
| --- | --- | --- |
| `biosmoke7` (plane) | 0.71.0, bytes = signed `d255d1a4…` (3,870,618 B), 13 bindings kept | `70a37b76-b199-418b-aac8-1867fa6df6c4` |
| `agent-worker` | 0.71.0 (a LABEL) — deployed FIRST (IC-130) | `4caffb96-c458-4a2c-8f1f-f8c83974817d` |
| `pdf-worker` | 0.71.0 (a LABEL) | `a99238d0-9099-429b-a4a8-7afe85ad6978` |
| `ocr-worker` | 0.71.0 (a LABEL) | `6ad45487-931f-447f-9e56-a82fb01c3d59` |
| `civicos` (UI) | `/build` `a13485ae…` = the tag's app.html sha | `7fe8fed0-9965-4baf-b558-b194c127e067` |
| `newgroup` | embeds signed 0.71.0 (evaluated embed MATCH), bindings `[]` | `62a59e41-4e27-45c2-87db-c9b7a29bb4ed` |

The previous targets (0.70.0): biosmoke7 `44d1826f`, agent-worker `d93512cd`, pdf-worker `31c6ac56`, ocr-worker
`9742ceba`, civicos `f0c23544`, newgroup `837d24c8`. **Rolling the plane back does NOT unseed**: `instance_group` stays,
and 0.70.0 ignores it.

**WHICH BUILD ANSWERED.** The DO build is established on BOTH stores: scratch answered `GROUP_ALREADY_RECORDED` / C-64.3
and `GROUP_SLUG_MALFORMED` / C-64.2 (0 occurrences in 0.70.0's bundle), and bio answered the new `op=instancegroup`
shape and took the new seed op. `op=bootstrap` never reads the DO's build (DIST.md lesson 18).

**SCRATCH RESIDUE, named and NOT swept:** `INFO-2026-9436-dist4-muc6a1x0` (0.71.0's headline arm); member
`dist3-rec156-muboxe9j` (DIST #3's); op=livefire's canary (it writes one per run). Scratch also holds 13 members of
July probe residue, not DIST's, so `op=purge` is not used.

## What is OWED, in order

1. **A BATCH is owed no earlier than 2026-09-23 04:00Z (a day after 0.71.0's cut): 0.72.0, carrying REC-157 / IC-173**
   (I3 MINOR 49.1.0: `op=publish`'s ALREADY_A_CASE_MEMBER compares the relationship, so a moved project conclusion takes a
   new case edition). It WIDENS what a publisher may do — NAME it in the landing report. Not a CUT NOW: no security,
   disclosure or authority defect (CONDUCT #12 concurs). Main's record: FULL GREEN for tree `0a2b5b64` (`f25d43b3`),
   `--since` GREEN for `9bf659a4` (`9d330478`). Bound `6dbaeb5a` at 2026-09-22 21:07 PDT; a cut that would cross 70% goes
   to DIST #5. **M0-106 is WRITTEN** (`DIST.md` gate step 1): main's newest GREEN FULL record is `f25d43b3` (tree
   `0a2b5b64`), so 0.72.0's step 1 is `gates.mjs --since f25d43b3`, NAMED in the cut commit — never a fresh battery.
2. **NEXT CUT adds 0.71.0 to the upgrade arm** (row above). `alterafter`, read against the SEQUENCE (lesson 19):
   135 → 169 → 186 → 203 → 220 → 237 pass / 66 fail, then **279 / 78** at 0.71.0 — the step is the D-436 assertions
   (+2 per migrated store; the six bricked 0.58.0-written stores fail both), nothing new bricks. Each release row now
   adds **19** (17 + the two D-436 assertions): expect **298 / 78** with the 0.71.0 row; baseline 376 / 0.
3. **RESOLVED: the coverage REGISTER FLOOR** read 1583 against 1579 after 0.71.0 (its declared control arms); CONDUCT
   #12's batch 2 re-read it; MEASURED by DIST #4 on `9d330478`'s tree: EXACT, arms 1622/1622 · classified 263/263.
4. **D-260 item 2** (DIST #3's handoff, not re-measured): DIST's deploy half — one organisation-principal `ai`
   credential carried as a deploy secret the way `DAEMON_TOKEN` is — comes AFTER the plane's caller lands. Look up its
   placement (`ledger.mjs find D-260`) before acting.
5. **Sent to BOB, not DIST's to edit:** `BIO_Distribution_v0_1.md` §4 still says the fleet reaches a sovereign group
   only when Bob deploys the installer — superseded by Bob's standing permission (DIST deployed `newgroup` at every cut
   since 0.66.0). BOB #25 is correcting it: the §4 Incomplete bullet is gone (`032d1ce1`); at `9d330478` §4's body
   sentence and the Status clause still say it.
6. **Carried, NOT re-verified:** tags v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline (`9ed18019`);
   `v0.59.0`–`v0.63.0` signed and WITHDRAWN — history only.

## UNDETERMINED, held open — do not let a neighbouring green line convert it

**Do the bytes wrangler uploaded to the fleet members correspond to a build of the tagged source?** Lesson 7's method
is blocked by the account returning a MULTIPART form. Bounded (not verified): member artifacts byte-identical at every
tag v0.59.0 → v0.71.0, so only the VERSION label can diverge.

## The 0.71.0 gate, for the next cut's comparison

`gates: GREEN · class FULL`, RECORDED for tree `dadd0b5f` (D-293): 269/269 suites · 16413 assertions · EXCLUDES 2
untallied (`bundle`, `livefire` — D-413) · run 33910.d574b9 · tree identical before and after. `coverage --strict`
REGISTER FLOOR 1583/1579 arms · 260/260 classified · 261/261 corpus; every M0-79 ratchet at 0 slack. UI harness green.
`migrate-released` 357. newgroup embed 23/0, wizard 146/0 (+15; its D-436 controls N1 141/5, N2 145/1, N3 143/3, AS
DECLARED). Signature 7/7 (C4 = 0.70.0's sig over the new bytes). Trend: 264·16114 (0.68.0) → 265·16198 (0.69.0) →
267·16264 (0.70.0) → **269·16413 (0.71.0)**.

**Live arms 12/12** (`liveprobe-0.71.0.mjs` and `seed-0.71.0.mjs` in DIST #4's scratchpad, not committed): L2 the DO
discriminator above; L3 a member bearer's seed `CLASS_FORBIDDEN`; L4 a scratch creation naming another group HELD naming
`believe-in-oakland` in one `group:` line; L5 `op=livefire&store=scratch` whole, `op=whoami` both; the real record's
counters identical before and after. **Admin `op=livefire` with no `store` runs against `bio`** (`scopeFor`) — always
name `store=scratch`.

`op=audit`: 31 checked, 21 clean, 10 withErrors, each one C-18.9 — **the ten ids identical to the baseline** (lesson 15):
INFO-2026-0099-auditor-report-feb-2022, -0100-acfr-fy2023-24-fund-statements, -0100-adopted-budget-fy2026-27,
-0103-acfr-fy2023-24-pdf, -0104-adopted-budget-book-pdf, -0105-adopted-budget-fy13-15-csv, -0106-acfr-fy2021-22-pdf,
-0107-revenue-expenditure-reports-page, -0108-zolly-opinion, INFO-2026-5460-member-release-key-registry.

## Session state

- **Self-wake:** recurring `b9dd7809` (`23 */6 * * *`, WHEN DIST CUTS, opening with `get_usage` against 70%) and the
  ONE-SHOT renewal `541fd1f1` at **2026-09-26 20:53 PDT** (lesson 17); armed 2026-09-21 ~20:50 PDT. The 0.72.0 batch
  bound is `6dbaeb5a` (2026-09-22 21:07 PDT). All session-only: a successor arms its own.
- **Context ~57% at this edit**; the refresh line is 70% (CLAUDE.md §4). Bob ruled 2026-09-22 (CLAUDE.md §6): never
  queue a gate behind another lane's — run yours when you need it.
- Machine Sparky-Air; disk ~4 GiB free at the cut — `df -h` before any bump. Worktree `.claude/worktrees/dist-4`
  (made by `git worktree add`, so it has NO `.env`: DIST #4 read the main checkout's `.env` by absolute path through a
  scratchpad `withenv.mjs`, never copying it). Baton reads `holder: DIST`. Account `20b53357…` confirmed by USING it.
- DIST #3 was archived at 03:47Z under D-398's three conditions (its CronList read back empty by message first); its
  worktree removed without force, 6.0 → 6.9 GiB free.
