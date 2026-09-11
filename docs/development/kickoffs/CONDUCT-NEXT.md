# CONDUCT-NEXT — the resume prompt for CONDUCT #9

**Written 2026-09-10 by CONDUCT #8 at a clean wave boundary. Nothing was in flight when
this was written and nothing is owed to a worker.** Read `CLAUDE.md`, then
`kickoffs/CONDUCT.md` (your loop), then this.

**A resume prompt that describes a solved problem is a wrong instruction to the one
session that must act on it** — that is this file's own recorded history, rewritten on
2026-08-10 after it sat five days stale. So every figure below is dated, named to a sha,
and was measured rather than carried.

---

## 1. THE MEASURED STATE, at `e5eedad` on `origin/main`, 2026-09-10

| gate | figure | how |
| --- | --- | --- |
| battery | **170/170 suites green · 10,488 assertions** | `cd bio-plane && npm run test:battery` |
| coverage | **`--strict` exit 0**, ops 163/163, checks 229/229 | run DIRECTLY, `$?` read UNPIPED |
| register floor | **arms 883 / classified 164 / corpus 165**, exact | same run |
| fleet floor | 2 members · 4/4 surface ops · 5 suites · 58 arms | same run |
| UI harness | **exit 0**, read unpiped | `node civicos-ui/test/run.mjs` from the REPO ROOT |
| plancheck | **0 fail, 0 warn**, publication half included | `node tools/plancheck.mjs` bare |
| decisions | **0 open, 0 awaiting enactment**, 16 total | plancheck |
| claims | **0 held** | every block carries a `released:` |
| workers | **none live**; 0 rows marked `running` | verified at the process table |

**MEASURE THIS AGAIN BEFORE YOU TRUST IT, AND THE REASON IS NOT RITUAL.** On 2026-09-10 I
published `168/168 · 10,351` and a worker measured `167/168` hours later **on the same
tree**. Both were honest. `action-loop.test.mjs` pinned a fixture clock at `2026-09-10`
and the wall clock crossed it. **The calendar falsified a published figure, and no
re-measurement discipline catches that** — "trust your own baseline over the brief" points
the WRONG way when the drift is time rather than change. M0-22 fixed that suite by pinning
the clock at the harness; **D-300 records that the class is only a FLOOR across the
estate**, not cleared.

**And before you measure anything in a fresh worktree: `npm ci` in `bio-plane/`.** Without
it the battery reads ~28/170 with `ERR_MODULE_NOT_FOUND: miniflare` — which looks exactly
like damage your own change did. Six workers hit it in one day.

---

## 2. THE WAVE POSITION — the CASE arc, and what is left of it

DEC-72 (`CASE-AS-PRODUCTION.md` is the ONE authority for scope). **CASE-1, CASE-2, CASE-3,
CASE-4 and CASE-5 are landed.** What remains:

### CASE-5b — the next item, and it is not a small one
**Finding bytes still name a case.** CASE-5 removed the half that was load-bearing on the
FORMAT (the edition conflation) and stopped at a **doctrinal wall it measured rather than
judged**: every case fact this plane commits is committed FROM THE SIGNED BYTES and from
nothing else, **and there is no signature over a case for those facts to move to.**
Removing them first would leave the plane committing a group's case assertions **from an
unsigned request** — the attribution class this record refuses everywhere.

So CASE-5b is **a case-level signing ceremony first and a deletion second**, and the
container manifest already states the constraint that governs its design: *a case-level
signature would be a signature over something nobody reviewed.* `caseflip.test.mjs`
**asserts the six keys are still there**, so "still there" is distinguishable from "nobody
checked" — when you close it, those assertions are CORRECTED, never exempted.

### CASE-6 — the closing item, and its `accepts-when` is a CONDITION not a memory
It carries the arc's definition of done: **in the SAME TURN it lands**, (1)
`docs/BIO_DATAPLANE_STATE.md` amended to the case-as-production model, (2)
`CASE-AS-PRODUCTION.md` ARCHIVED to `docs/archive/` (which `decided.mjs` and `mintid` both
still scan, so archiving is not lossy), (3) `decided.mjs` regenerated and committed.

**CASE-6 DEPENDS ON CASE-5b, AND THAT DEPENDENCY IS MINE — DO NOT SILENTLY DROP IT.**
The rest of CASE-6 does not need CASE-5b; **the ARCHIVE step does.** Archiving a design
whose CASE-5 bullet is half-implemented files an unfinished design as finished, which is
the stale-document shape this project keeps paying for.

**Also still open inside the arc:** multi-case membership stays REFUSED
(`FINDING_IN_ANOTHER_CASE`) and the refusal is DRIVEN so its state is pinned. The flip
made it *representable*; lifting the fence is a surface question CASE-5 left to CASE-6.
And **a case with several owning projects is not representable at all** — `cases` is keyed
on `case_id` alone — so CASE-4 proved D-266's scoping on the shape the store CAN build and
said so in the suite rather than claiming the shape it could not.

---

## 3. WHAT IS OWED, AND TO WHOM

**Not yours — do not spawn these:**
- **FL-10** (the plane bundle's freshness guard) is **ASSIGNED TO FLEET**, which is a
  standing area session now. FLEET already landed it; if a successor row appears, it is
  still FLEET's ground. `IC-70` was pre-minted for it.
- **DS-1..DS-4, D-297, D-298's release half** are DIST's lane. DIST is active and pushes
  frequently — expect to merge `origin/main` mid-integration, repeatedly.
- **PL-16** is reshaped by DEC-72 and waits on Bob's DEC-33 ceremony deferral.

**Yours, queued and unblocked:** `UI-56` (IC-66's delegation — `pubIndex` joins a roster
row on the CASE's edition while `byId` keys on the finding's own, so **a diverged member
misses SILENTLY**: awaiting ratification forever, blank pair, blank bar, and listed twice.
One file, one function, three lines. **A fixture where the two editions AGREE cannot see
it** — the arm must use a diverged member). Also `D-265`, `CPDF-10`, `CPDF-13`, `D-300`.

**Interface changes: 30 rows still say "the RESOLUTION is CONDUCT's."** I resolved
IC-58/60/61/62/63/64/65/66/67/68/69 as I integrated them. The rest predate me. They are not
urgent and they are not nothing.

---

## 4. THE HEALTH ACCOUNT — the tells, measured, not apologised for

**These are recurrences with counts, because a class with a count is a property of the
system and a class without one is an anecdote.**

- **STALE STATUS — 4 instances** (PL-18 `queued`, PL-19 `running`, UI-53 `running`,
  REC-69 `NOT MERGED`), every one with its work already on `main`. REC-69 held RECORD's
  slot for two days, and **it was believed because its row argued its case at length and
  persuasively.** A row that explains WHY it is not done is not evidence that it is not
  done. Every `running` row now carries the command that falsifies it — **run it.**
- **BLIND BY CONSTRUCTION — 7 instances**, including workers who had read all three prior
  reports before shipping the eighth. An expectation derived from the thing under test
  moves with it and proves nothing. **The one-line version, from the worker who put it
  best: *knowing the defect class did not prevent it; running the control did.*** The
  defences that worked: parse the expectation out of a DOCUMENT at run time, take a hash
  from BEFORE the act, or verify with an external binary that shares no code path.
- **ID-FLOOR COLLISIONS — structural, not careless.** `mintid` derives its floor from ids
  MENTIONED IN PROSE, so two parallel workers each minted `IC-64` and **each was RIGHT
  about the corpus it could read.** Only `mintid --audit` caught it. Separately, `CASE-2026-0001`
  — the record's own case IDENTIFIER — read as queue item 2026 and burned six ids. **THE
  FIX IS IN THE LOOP NOW: mint shared-namespace ids AT SPAWN, where the parallel workers
  are visible to each other.** I did that for IC-66..IC-70 and no collision recurred.
- **REGISTER-FLOOR MERGE CONFLICTS — 2 in one turn, and structural.** Every parallel item
  adding a suite must move that block and no branch can see another's arms. **GREP THE
  KEYS, DO NOT READ THE BLOCK:** a duplicate object key cannot be seen by reading the value
  you expect to find. I left duplicates once whose LAST pair was LOWER than measured —
  seventh instance of a hazard the block's own comment describes.

**MY OWN TWO FAILURES THIS SESSION, recorded because a defect quietly repaired is
indistinguishable from one that never happened:**
1. **I pushed conflict markers to `origin/main`** (`ffbc237`). I chained `add -A` → commit
   → push at a boundary. **A chain that cannot stop cannot check**, and the battery stays
   green either way because it does not read `CLAIMS.md`. `plancheck` is what catches this
   — run it BEFORE the push, not after.
2. **I created duplicate floor keys while writing the comment warning about them.**

**AND ONE THING THE SYSTEM GOT RIGHT, which is worth as much as the tells:** FL-10's guard
caught **my own integration edit** staling the plane's bundle, hours after landing. The
plane's committed bundle had been **114 commits stale with every suite green**, because
*the battery proves the artifact WORKS, never that it MATCHES its source.*

---

## 5. HOW TO WORK HERE

**Spawning is cheap now and integration is where the cost is.** `kickoffs/WORKER.md`
(2026-09-10, `e5eedad`) is the standing brief every worker reads FIRST — do not hand-carry
practices into briefs; point at it and spend your words on **what is specific to the item**:
what the authority says, what was already decided and must not be re-litigated, what the
previous item measured, and which wall not to walk into.

**Integration is not merging.** Expect cross-item ratchets — items green on themselves and
red on the pair. Three landed in one integration because a census suite fails any suite
written without a module three items predated. **Fix at the cause, never by relaxing the
ratchet: it is doing what it was built to do.**

**Before every commit, run the two sweeps I learned the hard way:** whole-tree marker sweep
(`grep -rln "^<<<<<<< HEAD"`), and the floor KEY census. Then `node tools/gates.mjs` — it
measures the diff and picks the profile; do not judge it by eye.

**Push is gated and the credential is persona-specific.** `gh` on this machine may sit on
the NEO persona, which this project must not use; a push then fails with *"Invalid username
or token"*. It is not yours to fix — name it and say the one action only Bob can take.

**Drain the inbox as ITEMS.** A note is not an item. This queue had to learn that **four
times in one session**, and the 2026-08-05 drain had already written the rule down.
