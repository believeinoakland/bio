# CONDUCT-NEXT — the resume prompt for CONDUCT #5

> **WRITTEN AT A CLEAN BOUNDARY BY CONDUCT #4, 2026-09-18, on Bob's direction that BOTH lanes be refreshed.**
> Verify all of it yourself before believing this file. If anything disagrees, the tree is right.
>
> ```
> git fetch origin && git show origin/main:docs/development/QUEUE.md | grep -E '^### [A-Za-z0-9-]+ · running'   # expect exactly ONE: REC-128 (done-awaiting-integration)
> node tools/plancheck.mjs                  # expect 0 fail
> node tools/status.mjs --check             # expect 0 drift
> cd bio-plane && npm run test:battery      # read the COMPLETION LINE, not the exit status
> ```
>
> **THE ONE THING TO DO FIRST: ARCHIVE ME** (D-401). I am session `CONDUCT #4`. Re-check D-398's three conditions
> **at the moment you act**: `isRunning` false, my worktree `competent-poincare-e3093a` porcelain EMPTY, its tip an
> ANCESTOR of `origin/main`. **Closing me releases FOUR LOCKED agent worktrees (~2.5 GiB), each MEASURED clean and
> MERGED** (`agent-a1f71e7a9d1c91962` FW-21, `agent-a3fbd59a3fef1a961` REC-86, `agent-a69fd9c430281b583` M0-62,
> `agent-a8dafc3592e03bc2a` M0-61) plus my own tree (639M). Archiving does NOT remove the directories — a SEPARATE
> `git worktree remove` per tree after re-verifying each. **Three MORE agent worktrees are UNLOCKED but NOT merged —
> do NOT remove them until their work lands** (`agent-a01d041e19ab1ad65` REC-128, `agent-a17c98e0548c9fd2d` MK-2,
> `agent-af99c832f7860f664` REC-129); their branches are PUSHED, so the work is safe either way.
> **My Remote Control: left alone** (the RC stand-down step is withdrawn). Read the error if the archive is refused.
> **My self-wake cron job (`7d4f4b89`) is deleted at stand-down; create your OWN** — the heartbeat's pokes cannot reach
> a bypass session (BOB #14's measurement), so the wake lives in your session: `CronCreate` `7,27,47 * * * *`,
> recurring, with the prompt in `kickoffs/CONDUCT.md`. It expires after 7 days; recreate it at every session start.

**Written 2026-09-18 by CONDUCT #4.** Read `CLAUDE.md`, then `kickoffs/CONDUCT.md`, then this.

---

## 1. THE MEASURED STATE (verify it)

| gate | figure |
| --- | --- |
| battery | **239/239 suites green · 14,764 assertions** — full gate GREEN at `4e206366` (coverage --strict, UI harness, plancheck). **One unexplained movement, stated rather than smoothed:** the prior gate (REC-130, same suite count) read 14,769; the −5 appeared when 27 closed rows were archived, so a suite counting LIVE ledger rows is the likely cause — NOT VERIFIED. |
| queue | **1 running (REC-128, done-awaiting-integration) · 19 queued · 4 blocked** |
| interfaces | I1 1.5.0 · I2 2.6.0 · **I3 27.0.0** · I5 1.20.0 — I3 took FOUR MAJORs this session (IC-130, IC-132, IC-137, IC-141) |
| construct-status | 85 claims, 0 drift |
| disk | ~6 GiB free at 97%; +~3.1 GiB once you archive me and remove my four locked trees and my own |

## 2. WHAT IS OWED FIRST — IN THIS ORDER

1. **REC-128 — done-awaiting-integration: `worktree-agent-a01d041e19ab1ad65`@`40a19351`.** It CHANGES A PUBLISHED FORMAT
   (`bio-case-container/6`, `delivered_by` beside every attestor, labelled as this instance's record outside any signature).
   The worker verified existing published cases verify unchanged. Merge, rebuild, re-read floors on the COMMITTED merge,
   resolve IC-139 (I3) and IC-140 (I5) at the bases THEN current, full gate.
2. **REC-129 WIP — `worktree-agent-af99c832f7860f664`@`eda53bc2`. RESPAWN FROM THE BRANCH.** It raised TWO POSSIBLE
   COUNT-LEVEL LEAKS it did not verify — **check these first, they are the trust-of-the-record class:** `op=stats`
   publishes a `leads` count and a whole-log `observations` count (an existence signal BOB #14's lead-visibility ruling
   forbids, if a member can call it); the MEANING level's frontier passes non-capture, non-reference rows unfiltered.
3. **MK-2 WIP — `worktree-agent-a17c98e0548c9fd2d`@`05a2deb8`. RESPAWN FROM THE BRANCH.** Plane half built; UI vocabulary
   mirror, IC-142 entry and design front matter not; battery NOT known green. It found and fixed a real defect
   (`isCaseMemberBytes` required exactly two strength rows — a testimony case member would silently stop being checked).
4. **REC-126 — the review copy — RUNNABLE NOW.** Its dependency REC-130 is merged; BOB's §6A text is on `main`.
5. **LED-3 — the ledger migration — CONDUCT performs it BY HAND** (a deterministic `tools/ledger.mjs` run over CONDUCT's
   own file; a worker branch would conflict with every integration). **First fix the wording of the rows the one
   CLOSED definition refuses:** D-186, D-408, D-283 (already discharged — its disposition leads with `M2 · MEASURED`),
   D-319 (leads with `M2 · **CLOSED` — bold markup ahead of the word), D-366 (carries something read as residue). Never
   override the archiver; fix the row. Then LED-4 (CONDUCT's own reorder; BOB checks the order against `status.mjs`).

## 3. THE ORDER RULES — BOB #14's, all written on `QUEUE.md` rows or its inbox; follow them, do not re-derive them

- **Corrections to LANDED items outrank new items**, and go first among equals. A defect in a just-landed item IS a
  defect in the substrate.
- **Refills are ONE-FOR-ONE, PRODUCT rows only (M1–M10), each depends-on CHECKED AGAINST THE CODE at spawn and the check
  NAMED in the spawn sentence.** If none passes, the slot stays EMPTY and you say so in one line.
- **Every M0 row is HELD** until the plan is rebuilt, **except LED-1..LED-5**, exempt by name.
- **BOB's BUILD ORDER** (the BOB INBOX, 8008cde3 and its correction) says what may be rowed and what fills a slot. **A
  "verified" design pointer is a CLAIM — read the section at the artifact before rowing** (#3 and #6 were marked
  verified and had no design; REC-126's §6A was real).

## 4. THE DUTIES THIS SESSION ADDED TO EVERY INTEGRATION

- **`node tools/status.mjs --check` before the gate.** When an item lands something a claim calls ABSENT (or removes
  something BUILT), edit the claim WITH PROBES — an ABSENT claim needs an empty-search probe under MORE THAN ONE NAME —
  then `--write` (it moves §3's date itself). **When a CENSUS claim moves (ops, tables, step kinds, extent kinds),
  review every non-BUILT claim BY MEANING against the new names before updating the number.** Edit
  `construct-status.json` as TEXT, never re-serialise it (a re-serialise produced a 1,600-line diff once).
- **The push guard now refuses:** a stale `DECIDED.md`, a governed document whose body moved past its Status `as of`
  date, construct drift, and a committed merge marker. Its success line names all four.
- **Re-read `REGISTER_FLOOR` on the COMMITTED merge, never the uncommitted one** — the register counts only files in the
  commit at HEAD, so an uncommitted merge reads as controls SHRINKING (measured: 1274 vs a true 1286).
- **A `done` flip archives its row in the SAME commit** (`node tools/ledger.mjs archive <ID>`, LED-5, now in
  `kickoffs/CONDUCT.md`). **In zsh, split an id list with `${=IDS}`** — `$IDS` passes one argument and the tool refuses it.
- **Resolve every IC against the base READ AT RESOLUTION.** Nearly every IC this session proposed against a stale base.
- **`Dropped-from-branch:` trailers must be in the merge message's FINAL paragraph** or git does not read them.

## 5. FOUR DEPLOYED EXPOSURES AND ONE DEPLOY CONSTRAINT — closed on `main`, OPEN on deployed instances until the next DIST cut

REC-123 (an `ai` credential could RATIFY and publish, the record naming the member) · REC-125 (operator bearer tokens
ratified) · MK-1 (an observation was publishable WITH the observer's handle) · REC-130 (unsigned case documents readable
and enumerable by strangers; a second leak via `op=caseratify`) · **plus REC-100's DEPLOY CONSTRAINT: the plane at I3
≥ 24.0.0 and `agent-worker` MUST DEPLOY TOGETHER**, or model-judged PRESENT steps silently vanish. BOB has told Bob;
the deploy is Bob's gate.

## 6. RECEIPTS AGAINST MYSELF

- **A FLIP WITHOUT A SPAWN.** REC-121 read `running` on `origin/main` for ~40 minutes with NO worker — BOB's build order
  landed between my flip and my spawn and I skipped *confirm the act took*. **Verify every spawn by its worktree in the
  same turn.**
- **A GREP READ AS A FACT.** I wrote in IC-132 that `civicos-ui/app.html` ratifies through a member session; it submits
  neither op. The grep matched the string and I never read the match — the exact error CONDUCT #3's handoff recorded
  against itself. REC-125's worker caught it.
- **A PLANNING SENTENCE NAMING AN OP THAT DID NOT EXIST** (`op=leadlook` after I withdrew MK-4) — `op-claims` turned a
  gate red on it.
- **A CUT THAT DELETED HISTORY** — rewriting REC-100's heading I sliced away its spawn sentence and BOB's re-scope;
  caught by diffing the removed line before committing.
- **TWO zsh WORD-SPLITTING SLIPS** (a suite loop that ran nothing, an archive call with one argument) — both caught by
  reading the output, not the exit status.
- **What held, and is worth keeping:** holding MK-1 off `main` on BOB's concern found a REAL publication leak; holding
  REC-100 until its consumer migrated kept `main` from ever shipping a silent step-drop; reading the `4.transcribe`
  claim instead of trusting "0 drift" found a probe blind to a rename. **An absence that cost nothing is not evidence —
  including an absence reported by the instrument built to catch absences.**

## 7. LOCK HYPOTHESIS (D-398), for whoever spawns next

**Registered, not settled:** a finished agent's worktree stays LOCKED iff it ever ended a turn with live background
children. 8 of 8 consistent at last count, no intervention. The "activity" reading is FALSIFIED (a resumed agent that
made one tool call stayed unlocked; `MEASUREMENTS.md`). The test that settles it is written there.
