# CONDUCT — resume here. Written 2026-08-08 by the outgoing CONDUCT, whose context ran out.

Read `kickoffs/CONDUCT.md` (the loop), then `docs/development/ORCHESTRATION.md`'s
"Concurrency" section, then `QUEUE.md`'s IS-WAVE row. This file is what those cannot tell
you: what just happened, what is in flight, and the four things your predecessor got wrong.

## State at handoff

`origin/main` green: **133/133 suites · 8,319 assertions**, `--strict` exit 0, UI harness
exit 0, `plancheck` clean. Local and remote identical. Nothing uncommitted.

**EIGHT WORKERS ARE RUNNING** — at the ceiling. Do not spawn a ninth; do not spawn a
duplicate. When one reports, **spawn its replacement BEFORE you merge anything.**

| running | item |
| --- | --- |
| CPDF-12 | the page-to-pixels renderer (blocks CPDF-10) |
| CPDF-10 | the Tier-3 OCR path; told to build everything not needing pixels and name the seam |
| D-240 | two instruments still grading a return by one literal — one is REC-70's own file |
| D-235 | `op=suggest`'s answer mixes record bytes and candidate bytes, unlabelled |
| D-230 | eight identity refusals no suite pins at all |
| D-237 | residue outside `$TMPDIR` is unreported, not under-reported |
| D-243 | nothing detects an id taken without the mint tool |
| UI-38 | the running-session surface; three plane conditions published, one rendered |

## The four things your predecessor got wrong. Do not repeat them.

**1. IT LET SLOTS DRAIN, FOUR TIMES, AND BOB CAUGHT IT EVERY TIME.** The fourth was one
worker against a budget of eight. Each time it "fixed" this with a rule and regressed.
**The cause was arithmetic, not discipline:** it hand-carried ~2,000 words of practices
into every brief, which made spawning expensive and integration look cheap, so context
went to ledger prose while slots sat empty. **`kickoffs/WORKER.md` now holds the standing
brief. A spawn brief is the ITEM and nothing else — a paragraph, not an essay.** If you
find yourself writing a long brief, you are re-creating the defect.

**2. IT PUSHED A CONFLICT MARKER TO `origin/main`.** Integrating seven items at once it ran
`git add -A && git commit` without re-reading the tree. **The battery was green and proved
nothing — the battery does not read `scripts/coverage.mjs`.** `--strict` does, and it was
skipped to save time in a batch. `plancheck` now refuses an unresolved marker anywhere in
the tree, but **the real lesson is that a batch is where verification gets dropped.**

**3. IT WROTE A QUEUE ROW WHOSE PREMISE WAS FALSE**, and FW-15 caught it by going to the
running code. The row asserted *nothing collides with a deletion ledger*; it had looked for
a rival FILE when the rival was a MECHANISM. **A worker taking that row at its word would
have BOUND a check that validates the shape of a claim nobody can check.** Your scopes are
read as authority — mark what you have measured and what you are inferring.

**4. IT REPEATEDLY BELIEVED THE TIMER WOULD COVER THE GAP.** A one-minute cron exists; it
**only fires while the REPL is idle**, so it cannot run during exactly the work that empties
slots. It is a backstop for an idle CONDUCT and nothing more.

## Integration hazards you WILL meet, all measured

- **`REGISTER_FLOOR` in `bio-plane/scripts/coverage.mjs`: keep-both merges left duplicate
  `arms:` keys SIX times.** Valid JavaScript; the last key silently wins; once it was the
  lowest. On 2026-08-08 it finally bit — `coverage-provenance` red with 19 failures. **On
  any conflict there: COLLAPSE TO ONE SET and re-read the printed figures.**
- **`regionLines` in `civicos-ui/check-refusal-codes.mjs` is a property of the MERGED
  source** and has moved at integration five times. Re-read it from a green run after every
  multi-item merge; workers cannot see it and should not be asked to.
- **`CLAIMS.md`, `DEBT.md` and `MEASUREMENTS.md` conflict on essentially every parallel
  merge.** Keep both entries; it is append-only prose and has never lost content. **Do not
  let it argue for fewer workers.**
- **Ids: use `node tools/mintid.mjs <NS>` and brief workers to.** Seven collided in one day.
- **A phantom untracked suite can enter a worktree via `git stash`** (repository-wide across
  all sixty checkouts). Workers are now told never to stash; the battery names any suite it
  ran that is not in a commit.

## What is owed to Bob

`DECISIONS.md` carries open rows for him: **DEC-56/57/58 are ruled and partly enacted;
DEC-63, DEC-64, DEC-65, DEC-66 are open**, and **D-205 (rotate `BIO_ADMIN_TOKEN`) is his
alone.** FW-14 raised the `terminal` rung question and CONDUCT ruled to RETAIN it on
measurement — if Bob reads DEC-19's amendment as deleting the name, that is the one ruling
to revisit.

## The practices that produced this week's results

Brief them by pointing at `WORKER.md`, not by retyping them. The two that produced the most
value, both worth defending when a worker seems slow:

- **SWEEP FOR THE CLASS, never fix what was reported.** Every large finding this week came
  from an item that went looking for the kind: a suite that had run nowhere for eight days,
  27 hidden ops, 135 sites naming a non-existent op, two orphan checks, sixteen id
  namespaces where the row said four.
- **A mechanism believed on the strength of its EXISTENCE rather than its behaviour is this
  project's most-repeated defect.** Eleven fences that did not fire; ten of twelve acts
  going through; a documented branch that could not be reached; a comment describing a
  constraint nothing enforced. **Make workers DRIVE it.**

And the one to say out loud when a report reads too smoothly: **a surprising green is a
finding about the arm.** Three headline totality assertions passed over an empty corpus
this week, each caught only by a printed and floored corpus size.
