# DIST — resume here. Rewritten 2026-09-21 by DIST #3 after cutting, deploying, live-verifying and POINTING 0.69.0 and 0.70.0, two CUT NOWs.

Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL. Its **WHEN DIST CUTS**, the **`latest` pointer mechanism** and the
**LESSONS** are the process; this file is only the state, MEASURED 2026-09-21 ~20:40Z. Re-measure before acting on
any of it — a figure is about the tree and the moment it was taken on, and a deployment is a fact about the ACCOUNT.

## 0.70.0 IS COMPLETE — all twelve gate steps, nothing owed on it (0.69.0 likewise, earlier the same day)

- **0.69.0** (tag `37d56808`), CUT NOW for D-136 / IC-168: the §4.7 vote and §4.9 capability edit an operator token could
  forge. It WIDENED member-session reach to `adminendorse`, `adminremove`, `membercaps` (named to BOB before the cut).
- **0.70.0** (tag `072bb9f3`, object `5c1f13dd`), CUT NOW for **REC-156 / IC-171**: `op=memberadd` wrote the proposer's
  §4.7 endorsement from the caller's own `by`, and bearer tokens reach it; the `by` is now server-stamped. It is
  IC-168's NARROWED residue, so **`memberadd`'s forgery is CLOSED**. Also carried: **D-158 / IC-169** (`signeradd`
  refuses a member who is not active, C-63.1/.2; `signerlist` gains `member_status`/`attests`/`attests_why` — judged
  BATCH at the code, folded in here) and **D-432 / IC-170** (I5 MINOR: a new `minted_ids` table — the schema moved).
- Pointer merge `0a562200`. Members' artifacts byte-identical to 0.68.0's (`a7e5f590` / `b26dee19` / `0d99f5d0`): both
  releases moved their VERSION label only. `civicos` did not move in either — `app.html` unchanged since v0.68.0.
- **For the NEXT cut's upgrade arm: `["0.70.0", "072bb9f3a414af8c4ff05ae9ddc443aa0f88454a"]`** — RELEASES, NOT WITHDRAWN.

## What is LIVE (measured 2026-09-21 ~20:21Z, deployments API at 100%)

| worker | serves | active version id = ROLLBACK TARGET |
| --- | --- | --- |
| `biosmoke7` (plane) | 0.70.0, bytes = signed `407d6b23…` | `44d1826f-6650-4171-8ee6-88f38648e87d` |
| `agent-worker` | 0.70.0 (a LABEL) | `d93512cd-7102-4edc-8a89-463a72d6d802` |
| `pdf-worker` | 0.70.0 (a LABEL) | `31c6ac56-4c1c-419a-9f14-ab8e86bdd616` |
| `ocr-worker` | 0.70.0 (a LABEL) | `9742ceba-fa33-4488-850b-03151d571f77` |
| `civicos` (UI) | build `3916f88ae780` — did NOT move | `f0c23544-6dd9-4011-918c-86e35aa03257` |
| `newgroup` | embeds signed 0.70.0 (evaluated embed MATCH), bindings `[]` | `837d24c8-c589-453c-b168-d67e1ab96e9b` |

**WHICH BUILD ANSWERED.** 0.70.0's DO build IS established: `op=signeradd&store=scratch` for a never-enrolled member
(`d41-sf72-a1`) was refused `SIGNER_MEMBER_NOT_ENROLLED` / C-63.1, raised in `store.mjs` with 0 occurrences in 0.69.0's
bundle, and nothing was written. 0.69.0's DO build was UNDETERMINED (no safe DO-side code); that no longer matters.
`op=bootstrap` never reads the DO's build (DIST.md lesson 18); D-116's DO half is with SCHEDULER.

**SCRATCH RESIDUE, named and NOT swept:** member `dist3-rec156-muboxe9j` (admin, `proposed`) — REC-156's live arm. Scratch
already held 13 members of July probe residue (`d41-sf72-*` and others, not DIST's), so `op=purge` was not used.

## What is OWED, in order

1. **A BATCH IS OWED ON 2026-09-22: 0.71.0, carrying D-436 / IC-172** (I3 49.0.0 MAJOR, I5 1.24.0 MINOR: the producing
   group becomes ONE recorded value per store, table `instance_group`, written once). ON `main` since 2026-09-21 (merge
   `38850da4`, pushed `86523052`, CONDUCT #11). **BATCH, not CUT NOW, judged at the code by DIST #3:** the released plane
   writes the LITERAL `believe-in-oakland` into every instance's signed bytes (23 occurrences in v0.70.0's `store.mjs`), a
   record-integrity defect, not something a stranger, credential or wrong member could read or do. BOB #19 placed it
   *"ahead of any release a new group installs"*. **THE ORDER, from the DELEGATION to DIST in `CLAIMS.md` (D-436, items
   1–4) — irreversible, so read it there first:** deploy; then IMMEDIATELY, before any live verification, seed
   biosmoke7's TWO stores with `op=instancegroupseed` (ADMIN_TOKEN as `token=`, POST `{"slug":"believe-in-oakland"}`),
   `bio` AND `store=scratch`, verifying each with `op=instancegroup` (source `seed`, recorded_by `token:admin`). It is
   WRITE-ONCE on the real record, and biosmoke7's group is NOT its worker name. Until seeded, `testify`, setup saves and
   livefire's canary answer C-64.1 by design. Then live-verify; then state item 3's route for sovereign instances
   installed earlier, unless BOB rules auto-seed. **Bound (lesson 12):** one-shot wake `2dd2743d`, 2026-09-22 00:07 PDT.
2. **NEXT CUT adds 0.70.0 to the upgrade arm** (row above). `alterafter`, read against the SEQUENCE (lesson 19):
   **135 → 169 → 186 → 203 → 220 → 237 pass / 66 fail**; expect ~254/66 with the 0.70.0 row.
3. **DS-3 — JUDGED 2026-09-21, NARROWED into D-260.** Config half LANDED at `2de6f25f`; nothing hands agent-worker
   `claude_accounts` (`AGENT_WORKER`, `claude_accounts` and a non-test `instanceClaudeToken` caller are absent from
   `bio-plane/src`). biosmoke7 has NO `INSTANCE_CLAUDE_TOKEN` and `.env` has none. **D-260 is RULED** (BOB #22,
   2026-09-21; the assistant's §6, `QUEUE.md`'s BOB INBOX entry): its item 2 is DIST's, AFTER item 1 (the plane's caller,
   RECORD with FLEET) — install and update carry ONE organisation-principal `ai` credential as a deploy secret the way
   `DAEMON_TOKEN` is carried, never in the record, denylisted by `tokens.mjs`. Look up its placement
   (`ledger.mjs find D-260`). The member/project token surfaces are with Bob (BOB #19's recommendation).
4. **Carried, NOT re-verified:** tags v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline (`9ed18019`);
   `v0.59.0`–`v0.63.0` signed and WITHDRAWN — history only.

## UNDETERMINED, held open — do not let a neighbouring green line convert it

**Do the bytes wrangler uploaded to the fleet members correspond to a build of the tagged source?** Lesson 7's method
is blocked by the account returning a MULTIPART form. Bounded (not verified): member artifacts byte-identical at every
tag v0.59.0 → v0.70.0, so only the VERSION label can diverge.

## The 0.70.0 gate, for the next cut's comparison

267/267 suites · 16264 assertions · EXCLUDES 2 untallied (`bundle`, `livefire` — D-413) · run 85156.26be8a · tree
fingerprint identical before and after, and equal to the committed diff. `migrate-released` 303 pass. `coverage --strict`
REGISTER FLOOR exact 1552/1552 arms · 258/258 classified · 259/259 corpus. UI harness green. newgroup wizard 131/0.
Signature 7/7. Trend: 264·16114 (0.68.0) → 265·16198 (0.69.0) → **267·16264 (0.70.0)**.

**Live arms 13/13** (`liveprobe-0.70.0` in DIST #3's scratchpad, not committed): L2 the six bearer refusals of the
governance ops (C-32.17); L3 the DO discriminator above; L4 REC-156 through `op=memberadd` — a bearer proposing a third
scratch administrator while naming the active `scr-ms11znmp` as `by` got `CONSENSUS_REQUIRED` with `have=[]`; L5
`op=whoami` answers both credentials; the real record's (`bio`) counters identical before and after.

`op=audit`: 31 checked, 21 clean, 10 withErrors, each one C-18.9 — **the ten bundle ids are identical to the baseline**
recorded at 0.69.0: INFO-2026-0099-auditor-report-feb-2022, -0100-acfr-fy2023-24-fund-statements,
-0100-adopted-budget-fy2026-27, -0103-acfr-fy2023-24-pdf, -0104-adopted-budget-book-pdf, -0105-adopted-budget-fy13-15-csv,
-0106-acfr-fy2021-22-pdf, -0107-revenue-expenditure-reports-page, -0108-zolly-opinion, INFO-2026-5460-member-release-key-registry.

## The harness refusals — one actor, one form, one moment each (M-75)

2026-09-21, DIST #3, AUTO mode, each passed on its narrowest retry: the compound signing command (~14:39Z);
`git -C <path> push` of the cut branch [Out-of-Place Publication] (~15:01Z); `git push origin v0.69.0` [same] (~15:02Z;
`refs/tags/…` passed); the first agent-worker deploy [Production Deploy] (~15:06Z; the identical retry passed). The
session then ran in BYPASS and the 0.70.0 cut met no refusal. **Bob's rule, via BOB #20:** never put a shell variable in
the path of `rm`, or the target of `mv`/`cp` — bypass still halts on it. Write the literal absolute path.

## Session state

- **Self-wake:** recurring `44f1ca7f` (`41 */6 * * *`, *"DIST: apply WHEN DIST CUTS in kickoffs/DIST.md"*) and the
  ONE-SHOT renewal `2400b776` at **2026-09-26 09:11 PDT** (lesson 17). The BATCH-bound one-shot `3e2ff52f` was DELETED —
  0.70.0 carried D-158. All session-only, so a successor arms its own.
- **Context ~59% at this edit** — the refresh line is now **70%** (CLAUDE.md §4, Bob 2026-09-21, raising his 60%).
  Plus the BATCH-bound one-shot `2dd2743d` above (session-only, like every wake here).
- Machine Sparky-Air; disk 4.6 GiB free (98%) at the 0.70.0 gate's end — `df -h` before any bump.
  This worktree is `jovial-mclaren-9af3b6`, ~800 MB of it `node_modules` (real dirs).
- `.env`: ten keys including `BIO_RELEASE_SEED`; account `20b533579290b9b93168345edd3b7f72` confirmed by USING it.
  Baton reads `holder: DIST`. Git identity pinned in the shared `.git/config`.
