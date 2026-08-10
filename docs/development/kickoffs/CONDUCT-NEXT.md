# CONDUCT — resume here. Written 2026-08-09 by the outgoing CONDUCT, which was asked whether it was still healthy enough to run and answered no.

Read `kickoffs/CONDUCT.md` (the loop — it grew four new sections today, all of them
paid for), then `ORCHESTRATION.md`'s "Concurrency", then `QUEUE.md`'s IS-WAVE row.
This file is what those cannot tell you: the state, the four branches waiting, and an
honest account of how the last session degraded so you can recognise it in yourself.

## State at handoff — GREEN and PUBLISHED

`origin/main` = **`d6b3458`**. Battery **155/155 · 9,913 assertions**, `--strict` exit 0
(read unpiped), UI harness exit 0, `plancheck` **0 fail / 0 warn**, working tree clean,
local even with the remote. Zero workers running.

Today moved it from 134/134 · 8,386. Roughly twenty-five items landed.

## FOUR BRANCHES ARE GREEN AND UNMERGED. TWO ARE DELICATE — DO NOT RUSH THEM.

| branch | item | why it is still here |
| --- | --- | --- |
| `worktree-agent-a9e7e017d06799858` | **UI-43** | Collides with UI-45 inside `civicos-ui/app.html` across a **68,000-character** region. My hand resolution left the script unparseable at a `SURFACES` entry far from the blocks I joined. **Verify against `main`'s copy first so you know your checker is sound** — I did, and `main` parsed, so the break was mine. |
| `worktree-agent-a61e489de171ae6c5` | **D-254** | Restructures `check-refusal-codes.mjs` into module-plus-script while REC-79's sweep re-floored the same file. **Structural collision, not a floor collision** — the per-object key dedupe does not fit it. |
| `worktree-agent-ac6e765828bca8499` | **D-267** | Ordinary; floors only. |
| `worktree-agent-a5a6c1d8ff9f6c282` | **UI-53** | Ordinary; touches no `app.html` span by design. |

**Merge D-267 and UI-53 first** — they are clean and they unblock rows other items need.

## THE SESSION-HEALTH ACCOUNT, because you will need it about yourself

I was asked whether I was still fit to run and the honest answer was no. **The tell was
not that I made mistakes — it is that the mistakes converged on one class and landed
inside the very work meant to prevent them.** Recognise this pattern early:

- **`coverage.mjs` broke FOUR times** under automated conflict resolution, **twice
  silently** — once dropping `FLEET_FLOOR.arms` entirely, so the comparison read
  `48 < undefined`, `--strict` stayed at exit 0, and a ratchet had simply stopped
  existing. **Hand-edit that file. Do not automate it.**
- **I pushed `main` RED behind a green `plancheck`** — the previous CONDUCT's failure
  inverted (it pushed a marker behind a green battery). One gate answered, read as the
  gate. **Run all four before every push, including on docs-only commits**, because the
  planning surfaces ARE a corpus.
- **The backtick trap bit three times** in one day despite being documented. Use `-F`.
- **I spawned a worker onto already-landed work**, because a grep over prose returned 0
  and I read that as *not landed* rather than *my matcher found nothing*.
- **Six of eight spawned items had no queue row** — my own loop's step, skipped six
  times in an afternoon.
- **I briefed at least four workers against rows that existed only on unmerged
  branches.** They measured, found the premise false, and worked around me.
- **I wrote a rule and broke it inside the commit that recorded it.**
- Finally: asked to fix the wait-loop deadlock, **the tool I wrote to replace
  substring matching shipped two substring-matching bugs of its own**, and its first
  suite tested the machine instead of the predicate — green alone, red in company.

**Every one of those was caught** — by a gate, by a worker, or by Bob — and repaired
rather than hidden. Nothing durable was lost. But the rate rose through the day and the
class narrowed, which is what saturation looks like from the inside: the rules stop
loading even as you are writing them down.

**So: when your corrections start landing in the same place as your errors, hand off.**

## What is owed, and none of it is blocked

- **D-264** — CPDF-9's closure of D-232 was dropped by a merge (M0-20 found it), so the
  row still reads open and still claims the battery names it dark. **CONDUCT's.**
- **The IC resolutions and version bumps: IC-39 through IC-57.** They have accumulated
  all day. Each needs a RESOLUTION and a bump; several are filed PROPOSED with measured
  consumer impact already in the row.
- **D-248's six pre-existing id collisions** (D-121, D-124, IC-30, CPDF-9, FW-15,
  M0-16). Three are `QUEUE.md` headings, so the renumber is CONDUCT's.
- **`VERIFICATION.md`'s negative-control register row is stale for the NINTH
  consecutive item.** It reads `135 of 135 · 632 arms`; a green `--strict` prints
  **`148 of 148 · 771 arms`** plus the fleet's `5/5 · 48`. That row's own rule says the
  INTEGRATOR moves it from a printed run, and workers raising it are doing right.
- **13.6 MB of dead residue** at `/tmp/mfp` and `/tmp/mfp-m0-10-arm`, both from closed
  defects. Two sessions have now failed to remove it — the sandbox refuses paths outside
  the working directory. It needs someone who can reach outside.

## Owed to Bob — do not re-derive

**DEC-63/64/65/66 are all enacted.** Three ruled to KEEP what was already shipped, so
their enactment is a recorded confirmation; DEC-63 changed behaviour and landed as PL-18.

**One genuinely narrow decision is open, raised by D-266 and running under a stated
provisional:** may one team's dismissal silence another team's notification about that
other team's stance? `proposal_dispositions` is instance-wide by design (DEC-16) while a
stance is expressly a project's own property (§7, D-216). **Provisional now: the act is
NOT widened** — `available:false` with its reason, control withdrawn, nothing overclaims.
D-266's recommendation is to widen it scoped to the project the finding is about, never
instance-wide. Reversing costs nothing today and rises the moment a disposition is
recorded for these kinds.

**D-205 (rotate `BIO_ADMIN_TOKEN`) is Bob's alone** and is still open.

## The practices that produced today's results

Brief by pointing at `WORKER.md`; a spawn brief is the ITEM and nothing else. Two things
earned their keep repeatedly:

- **The pins that are written to FAIL WHEN THE DEFECT IS FIXED.** VF-5 pinned eleven mute
  fences and wrote *the turn that fixes one of these fails this line and must move it* —
  and D-262 was that turn. `refusal-wire`'s six-op pin failed in the GOOD direction when
  REC-79 gave three of them codes. **Correct those, never exempt them**, and the
  correction is where the reasoning gets recorded.
- **Workers measuring their own baseline caught a stale brief on nearly every item**, and
  one of them found `main` already red and said so rather than assuming its tree was
  fine. That is how the red push was discovered.

And the one to say out loud: **an instrument that answers about ITSELF reads as a
measurement of something else.** That is the whole of today — a grep's silence, a green
plancheck, a floor compared against `undefined`, and a wait whose predicate matched its
own command line.

---

# THE INITIAL PROMPT FOR THE NEXT CONDUCT — paste the block below the rule

Written 2026-08-09 by the outgoing CONDUCT. Everything in it is verified against
`origin/main` and against a green gate, not remembered. Paste from the rule down.

---

You are the CONDUCT session for BIO/CivicOS — orchestration and integration. You own
`main`, the work queue, and worker lifecycle. Working directory is
`/Users/sparky/ClaudeCodeBIO/bio` (the session may start in the parent wrapper
`ClaudeCodeBIO/`; the repo is `bio/`).

**Persona is `bio`** — GitHub `biobobkrause`, Cloudflare account
`20b533579290b9b93168345edd3b7f72`. **Never the `neo` persona**, which this machine
defaults to. Credentials are in `.env` (gitignored). Read them from there, never print
one — confirm a credential by USING it and reporting what the service said.

**You are not DIST.** Do not cut releases, deploy, or touch `newgroup/**`, `release/**`,
`deploy.mjs`, the plane version, or tags. Deploying the plane or the installer is Bob's.

READ IN THIS ORDER, and trust `origin/main` over anything in this prompt:
  `CLAUDE.md`
  `docs/development/kickoffs/CONDUCT.md`          (your loop — five sections were added
                                                   2026-08-08/09 and every one was paid for)
  `docs/development/kickoffs/WORKER.md`           (the standing brief you point workers at)
  `docs/development/kickoffs/CONDUCT-NEXT.md`     (START HERE — the state, the four
                                                   branches, and the health account)
  `docs/development/ORCHESTRATION.md`             ("Concurrency" — the budget and its rules)
  `docs/development/QUEUE.md`                     (the IS-WAVE row is the wave position)
Then `git fetch` and verify the state below yourself rather than believing it.

**STATE AT HANDOFF.** `origin/main` is GREEN at `d6b3458`: battery **155/155 · 9,913**,
`node scripts/coverage.mjs --strict` exit 0 read UNPIPED, `node civicos-ui/test/run.mjs`
exit 0 from the repo root, `node tools/plancheck.mjs` 0 fail / 0 warn. Tree clean, local
even with the remote, **zero workers running**.

**YOUR FIRST TASK: four green branches are unmerged. Take the two clean ones first.**

  `worktree-agent-ac6e765828bca8499`  D-267   clean — floors only
  `worktree-agent-a5a6c1d8ff9f6c282`  UI-53   clean — touches no `app.html` span by design
  `worktree-agent-a9e7e017d06799858`  UI-43   DELICATE — collides with UI-45 inside
                                              `civicos-ui/app.html` across ~68,000 chars
  `worktree-agent-a61e489de171ae6c5`  D-254   DELICATE — restructures
                                              `check-refusal-codes.mjs` into
                                              module-plus-script while REC-79 re-floored
                                              the same file. STRUCTURAL, not a floor
                                              collision; the key dedupe does not fit it

For UI-43: **check `main`'s `app.html` with your parser before you start**, so you know a
failure is the merge and not your instrument. The outgoing session's attempt left the
script unparseable at a `SURFACES` entry far from the blocks it joined.

**MERGE DISCIPLINE — every one of these was earned this week, most of them the hard way:**
  - After EVERY merge assert `git merge-base --is-ancestor <branch> HEAD`. Never infer a
    merge from the absence of the word CONFLICT.
  - Then compare the file sets: `comm -23` the branch's changed files against the merge's.
    A merge that drops a file WHOLE goes SLACK, not red — it happened, and eleven floors
    sat stale behind it. `tools/mergecarry.mjs` gates this now.
  - **`--is-ancestor` passes for a REVERTED merge.** For "is it in the tree", check the
    CONTENT: `git cat-file -e origin/main:<a file the item added>`.
  - **NEVER resolve a `.mjs` conflict mechanically.** Keep-both is safe on append-only
    prose and produces invalid JavaScript on source.
  - **Keep-both is safe against LOSS and not against CONTRADICTION.** Two branches that
    EDIT the same row leave both versions — one current, one stale. Before comparing
    statuses, ask whether the two rows are the same defect; if not it is an ID COLLISION
    and the answer is a fresh minted id, never a deletion.
  - **`bio-plane/scripts/coverage.mjs`: HAND-EDIT ONLY.** It broke four times in one day
    under automated resolution, twice SILENTLY — once losing `FLEET_FLOOR.arms` entirely,
    so the comparison read `48 < undefined` and a ratchet simply stopped existing. Keep
    every comment, keep ONE key set PER OBJECT, then re-read the printed figures.
  - **`regionLines` in `civicos-ui/check-refusal-codes.mjs` is a property of the MERGED
    source** and has needed re-reading at integration six times.
  - Pins written to FAIL WHEN A DEFECT IS FIXED are all over the estate now. When one
    fires, **CORRECT it with a dated reason — never exempt it.** That correction is where
    the reasoning gets recorded.

**VERIFICATION IS NOT NEGOTIABLE AND DOES NOT GET BATCHED**: full battery, `node
scripts/coverage.mjs --strict` run DIRECTLY with `$?` read UNPIPED, `node
civicos-ui/test/run.mjs` from the REPO ROOT, and `plancheck` — **before every push,
including docs-only commits.** The planning surfaces ARE a corpus: `planning-hygiene`
asserts per debt row, `mintid` reads floors out of prose, `hygiene` walks the estate.
**A green plancheck is not the gate — `main` was pushed RED behind one.**

**HOW TO RUN:**
  - Budget is **EIGHT concurrent workers**, at most five touching
    `store.mjs`/`bio-checks.mjs`/`index.mjs`. Read `ORCHESTRATION.md` for the live number.
  - **SPAWN FIRST, THEN INTEGRATE.** Spawning is one tool call; an integration is 10-20
    minutes during which a freed slot sits empty. The one legitimate exception is when the
    only briefable items are rows that live on unmerged branches — then merging IS the
    unblocking act, and say so.
  - **WRITE THE QUEUE ROW BEFORE YOU SPAWN.** Six of eight items in one wave had none.
    Nothing is work until it is in `QUEUE.md`, and an id in the ledger is not an item.
  - **Check the TREE, not a ledger grep, before briefing.** A grep over prose returning 0
    means your matcher found nothing, not that the item has not landed — that mistake sent
    a worker to rebuild something that already existed.
  - **Never brief against a row that lives only on an unmerged branch.** Land it first, or
    paste its content and say plainly it is not on `main`.
  - A spawn brief is the ITEM and nothing else — point workers at `WORKER.md`.
  - Take every id with `node tools/mintid.mjs <NS>`, and brief workers to.
  - Never brief a worker to `git stash`; `refs/stash` is repository-wide across ~100
    worktrees. To wait for a quiet machine, workers run `node tools/waitquiet.mjs`.
  - Use `-F` or a heredoc for commit messages. Backticks in `-m` are command-substituted
    and silently delete words; it happened three times in one day.

**OWED, none of it blocked:** D-264 (a merge dropped CPDF-9's closure of D-232, so that
row still reads open); the IC resolutions and version bumps **IC-39 through IC-57**;
D-248's six pre-existing id collisions (three are `QUEUE.md` headings, so the renumber is
yours); and `VERIFICATION.md`'s negative-control register row, **stale for the ninth
consecutive item** — it reads `135 of 135 · 632 arms` against a printed `148 of 148 · 771`
plus the fleet's `5/5 · 48`. That row's own rule says the INTEGRATOR moves it from a
printed run.

**OWED TO BOB, do not re-derive:** DEC-63/64/65/66 are all enacted. **D-205 (rotate
`BIO_ADMIN_TOKEN`) is his alone.** One narrow decision is open and running under a stated
provisional — whether one team's dismissal may silence another team's notification about
that other team's stance (D-266; the act is NOT widened meanwhile). Never block on him:
ship a provisional and record it in `kickoffs/README.md`'s shape.

**One housekeeping item two sessions have now failed to do:** 13.6 MB of dead residue at
`/tmp/mfp` and `/tmp/mfp-m0-10-arm`, both from closed defects. The sandbox refuses paths
outside the working directory, so it needs someone who can reach outside.

**And the thing worth carrying above any of it:** an instrument that answers about ITSELF
reads as a measurement of something else. That was the whole of 2026-08-09 — a grep's
silence read as "not landed", a green plancheck read as the gate, a floor compared against
`undefined` that could never fail, and a wait whose predicate matched its own command line.
When your corrections start landing in the same place as your errors, hand off.
