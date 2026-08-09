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

---

# FIRST TASK — READ THIS BEFORE ANYTHING ELSE (appended 2026-08-08, final act)

## `origin/main` IS GREEN. THE LOCAL TREE IS NOT. Do not push the local tree.

`origin/main` = **`86f0e73`**, verified **134/134 · 8,386**, `--strict` exit 0, UI harness
exit 0. That is the good state and every worker branch is intact.

**The local `main` is FOUR MERGE COMMITS AHEAD OF `origin/main` AND IS BROKEN.**
`bio-plane/src/store.mjs` does not parse (`node --check` fails at the `archive-monitor`
scheduler registration, ~line 1806 — a brace lost inside a merged hunk), so the battery
reports `assertions unknown` across the estate. **`git reset --hard origin/main` is the
intended repair and was DENIED to the outgoing session; do it deliberately, or redo the
four merges by hand. Nothing is lost either way.**

## What went wrong, because it is a class and not an accident

**1. FOUR ITEMS WERE MARKED `done` AND LEDGERED WHILE NEVER MERGED: REC-68, REC-74,
REC-69, UI-50.** Caught by UI-38's worker, which went looking for the op it had been told
existed and **found no `airuns` in the tree at all.** Cause: CONDUCT merged branches in a
`for` loop and **checked the wrong signal**. `git merge` refuses to run while a previous
merge is unresolved, so after the first conflict every later merge in the loop no-opped —
and the loop grepped for a `CONFLICT` count, **which was zero precisely BECAUSE git had
errored out entirely.** A failure that reads as success.

**THE RULE: after every merge, assert `git merge-base --is-ancestor <branch> HEAD`.** Never
infer a merge from the absence of the word CONFLICT. And note the audit command itself has
a trap — `git branch --list` prefixes worktree-checked-out branches with `+`, so stripping
whitespace mangles them; use `git for-each-ref --format='%(refname:short)' refs/heads/`.

**2. THE MECHANICAL KEEP-BOTH RESOLVER PRODUCES INVALID JAVASCRIPT ON SOURCE FILES.** It is
safe on append-only prose (`CLAIMS.md`, `DEBT.md`, `MEASUREMENTS.md`) and has never lost
content there. **On `.mjs` it ate a closing `};` from `STANDARD_BASIS` in `airun.mjs`
(repaired, in the local commits) and a brace in `store.mjs` (NOT repaired).** It also
produced two `import` statements from one, because REC-69 and REC-74 each appended to the
same import. **Resolve source conflicts BY HAND. This is the second time in one session.**

## Redo these four merges, in this order, by hand

`worktree-agent-abaf6e0cecf399c36` (REC-68 / D-228) ·
`worktree-agent-a2130ded47307129c` (REC-74) ·
`worktree-agent-a5723f4c87dfd5bd0` (REC-69) ·
`worktree-agent-a773e28c7c7d0fb8b` (UI-50)

Known collisions: REC-69 and REC-74 both append to `store.mjs`'s `airun.mjs` import (**keep
both names in ONE statement** — `STANDARD_BASIS` is REC-74's, `RUN_CONTEXTS` is REC-69's)
and both add a DEC-49 region, so **re-read `regionLines` from a green run afterwards.**

## Then integrate these, which completed and are also unmerged

`worktree-agent-ae7c0334a4057a38f` (D-235a — merged locally, will need redoing after a
reset) · `worktree-agent-ae139b3de556ab2ea` (UI-38) ·
`worktree-agent-ae602f80abcaf9e01` (REC-78 / D-230) ·
`worktree-agent-a14199b914b9086e2` (D-243). Three more were still running at handoff:
CPDF-10, D-240, D-237 — check for their branches.

**UI-38 asks specifically: take its `bio-plane/test/airun.test.mjs` ARM U WHOLE.** A
keep-both there is a `ReferenceError` that ends the module while the tally reads
`assertions unknown` — the same signature as the damage above.

## Bookkeeping owed once they land

`QUEUE.md` marks REC-68, REC-74, REC-69 and UI-50 `done` with full ledger entries **that
were written before the merges existed.** The entries are accurate about the WORK; they
were premature about the LANDING. Leave them and add the landing date, or the next reader
cannot tell a described item from a landed one — **which is exactly the confusion that hid
this for hours.** Also unsettled: **IC-40** (D-235a) and **IC-41** (UI-38) are PROPOSED and
need CONDUCT's RESOLUTION and version bump.

## REC-78 / D-230 completed after the handoff was written — branch `worktree-agent-ae602f80abcaf9e01` (`81fbb99`)

**NOT merged, deliberately: the local tree was already broken and merging into it would
have compounded the damage.** It is green on its own branch — 134/134 · 8,366, `--strict`
exit 0, UI harness exit 0, floors moved to printed reproducible figures.

**D-230 is closed and its headline is larger than the row predicted: with its own guard
removed under a complete payload, FIVE OF EIGHT acts went ALL THE WAY THROUGH** — a member
enrolled under another's name; a second member wrote into a correspondence ledger another
was holding; **a REVOKED member became a project owner**; a rescue carried on a project that
never had an owner; **a case re-ratified at edition 2 while edition 3 stood.** The other
three fell to the complaint directly behind. D-230's thesis, demonstrated.

**It generalised REC-73's method rather than copying it, and the generalisation is worth
keeping: REC-73 varied the CALLER because its twelve fences guard *who acts*. Only some of
these eight do. The rule one layer out is FLIP ONLY THE CONDITION THE REFUSAL ITSELF
NAMES** — caller-conditions vary the caller, target/bytes conditions hold it fixed.

**Two findings for the new CONDUCT to route, neither acted on by the worker:**

- **`NO_AUTHOR` IS UNREACHABLE THROUGH ITS OP**, measured at all four machine classes.
  **So the act REC-54 calls *"a named member's judgement"* is one no member can perform.**
  REC-65 left that verb's identity claim OPEN; this is the same question with a measurement
  attached, and it is a doctrine call rather than a worker's.
- **`EDITION_NOT_INCREMENTED` is unreachable through the ceremony** — editions never regress
  or leave a hole, so the only route is an edition authored into the ratified bytes.

**Its sweep figures differ from the brief's: 394/114/68 against the briefed 380/111/66 —
the brief was stale. The eight unpinned codes, which is what the row rests on, are
unchanged.** And its arm (10) came back **`THE SUITE NEVER REACHED ITS FOOT`** — a
`TypeError` ending the module through no assertion, taking all eight pins with it, caught
only because the harness reads the foot line and reports a missing tally as `-1`. **That
convention has now caught this failure four times in one session; it is not optional.**

**Also still running at handoff and not yet reported: CPDF-10, D-240, D-237.** Check for
their branches before assuming they did not finish.

## D-243 completed — branch `worktree-agent-a14199b914b9086e2` (`8603cf6`), and MERGE THIS ONE FIRST

**It is the one branch known to be based on `origin/main` (`86f0e73`) and verified there:
134/134 · 8,431, `--strict` exit 0, UI harness exit 0.** Its worker re-measured its true
baseline at `origin/main` in a scratch worktree after noticing it was one merge behind, and
rebased. **So it is a clean base to rebuild from** — take it before the four redo-merges.
Its `REGISTER_FLOOR.arms` moved 570 → 576; **if that conflicts, collapse to ONE set.**

**THE HEADLINE, AND IT IS FOUND IN `origin/main` AS IT STANDS: SIX IDS ARE ALLOCATED TWICE
AND NOTHING HAD EVER LOOKED** — `D-121`, `D-124`, `IC-30`, `CPDF-9`, `FW-15`, `M0-16`.
**`D-124`'s own row reads "(renumbered from a colliding D-122 by CONDUCT 2026-07-31)" — it
was renumbered ONTO A SECOND COLLISION.** `IC-30` is a third live IC collision beyond the
pair M0-17 recorded. Filed as **D-248**; three of the six are `QUEUE.md` headings, whose
sole writer is CONDUCT, so the renumber is the new CONDUCT's and reaches reports written by
sessions that have ended.

**TWO OF THE SIX — `FW-15` AND `M0-16` — ARE THE OUTGOING CONDUCT'S OWN, hand-numbered by
reading the file and adding one AFTER `tools/mintid.mjs` had landed and while briefing
every worker to use it.** Recorded here rather than buried: the convention is the defect,
and the session that said so was still practising it.

**It tested M0-17's reasoning instead of inheriting it and found it HALF RIGHT.** The
structural argument stands — *was this id minted?* needs a ledger that is in no commit. **But
the HARM is not the question: what an un-minted id COSTS is a collision, and a collision is
entirely in the text of the commit.** So the class split into two instruments: the EFFECT as
a FAILURE (a duplicate now fails `plancheck` and the battery, over 593 allocation sites in
18 namespaces), and the CAUSE as a QUESTION (`mintid --audit --base <ref>`, which never
fails a run). `kickoffs/CONDUCT.md` step 2 names the command and **the suite asserts that it
does**, so the step cannot silently leave the loop.

**D-242 narrowed by measurement rather than argued with:** its own *"there is no cheap local
test"* was true of the two-clone half (**still open, and nothing on this machine can close
it**) and false of the non-atomic-filesystem half — `mint` now probes the real ledger and
**REFUSES** rather than minting. The posture is recorded: **REFUSE when exclusivity is
demonstrably absent, WARN and still mint when the scope is wider than what was tested, STATE
always — because the happy path is where a false belief is formed.**

**The registration gap is closed and had already cost one of the six:** `FW`, `COFF`, `CAP`
and `DS` were allocating with no register row. M0-17 left it because a wide census returns
noise; **over ALLOCATION SITES the same scan returns fifteen prefixes and zero noise** — it
had asked the wrong question.

**Four instrument findings, two of which generalise a rule this session kept re-learning:**
a control read `-1 pass, -1 fail` **without the suite dying**, because `process.exit()`
truncates a large PIPED stdout — the `-1` convention is the only reason that was
distinguishable from a clean zero. **A REFUSAL IS NOT A THROW**, and M0-17's own hardening
covered only the throw. And the documentation-poisons-a-corpus class appeared for the
**third and fourth** time, in a third instrument and in this item's own release note — so
**the rule generalises: it is not "don't write a next-free-number example", it is AN
ID-SHAPED TOKEN IN A FILE THAT IS A CORPUS IS AN ALLOCATION AS FAR AS ANY MATCHER CAN TELL.**

**One practice finding worth adopting: a scratch worktree for a baseline belongs OUTSIDE the
tree the estate walks.** This one was created inside, and `op-claims.test.mjs` found it and
reported 15,007 op mentions off a nested second copy of the repository.

## D-240 completed — branch `worktree-agent-a22579e283b0f5ab1` (`7911a60`), ALSO rebased onto `origin/main`

**Green there: 134/134 · 8,400, `--strict` exit 0, UI harness exit 0, plancheck clean bar
UNPUSHED.** So **two branches are now clean off `86f0e73` — this and D-243** — and between
them they are the rebuild path. Its rebase conflicts were append-only prose only, and it
**minted D-254 and deliberately stepped over 244–253 so it could not collide with CPDF-12's
D-244…D-247.**

**IT DECLINED TO COPY A LANDED CONVENTION BECAUSE IT MEASURED THE CONSEQUENCE, and this is
the most important thing in the item.** REC-76's *a computed boolean is a refusal* rule is
**right in its own guard and wrong here** — applying it took the suite **85/0 → 82/3 and
BOUNDED 20 → 16**, four correctly-bounded reads losing their clean bill, **because a
comparison is how this plane spells a CURSOR and a TRUNCATION FLAG.** Shipped policy is
`false` only, and those six fixtures are now standing arms. **Likewise REC-76's ordering
rule (*no outcome leads with a datum*), true over its 60 governed sites, DOES NOT HOLD over
843 returns** — two SUCCESS returns lead with a boolean datum and are pinned by name.
**A convention proved on one corpus is a hypothesis on the next.**

**NO FLOOR MOVED, AND THAT IS THE MEASUREMENT.** BARE 38, OPAQUE 10, every roster
identical, verified by restoring both suites to HEAD and re-running. **The correction's
value is entirely PROSPECTIVE, and the controls are the receipt:** the same planted
`found: false` refusal leaves the ratchet green under the new rule and **breaks it at 39 of
38 over a NON-DEFECT** under the old one.

**Sweep: 2 IS the number**, from 33 regex literals hand-verified down. **Of the other 31,
thirteen are the `mutating:` declaration-table family — same shape, CLOSED BY CONSTRUCTION**
(159/159 `OPS` rows write the literal, nothing computes it). Briefed figures were stale
again: 179 ops dispatched against comments saying 156; 117 `json()` sites not 152, which
predates REC-67's anchor fix.

**One structural finding for VERIFY (D-254), and it is a real hazard:
`civicos-ui/check-refusal-codes.mjs` HAS NO EXPORTS and does its work at the top level
ending in `process.exit` — so importing it runs the WHOLE DEC-49 guard as a side effect of
loading a test.** That is why the shared verdict reader could only reach two of the three
classifiers. One line in VERIFY's file closes it.

## CPDF-10 completed — branch `worktree-agent-abf7fa164b4016146`. THE SET IS DRAINED; all eight reported.

Green on its branch: **134/134 · 8,474**, `--strict` exit 0 with **162/162 ops and 219/219
checks**, UI harness exit 0. **Tier-3 is reachable end to end AS A PATH and stops at
PIXELS** — every stage driven and refusing correctly; the missing producer is CPDF-12's, and
it did not build a second renderer.

**THE FINDING THAT CHANGED THE DESIGN, and it was found by DRIVING rather than reading: the
image-only class — the entire reason OCR exists — reached NO ESCALATION AT ALL.**
`needsTier2` fires when undetermined regions outnumber decoded characters, and a scanned
page produces **zero of each** (no font ever reaches the decode path, so nothing fails), so
the test was `0 > 0`. **A Tier-3 trigger reading Tier 2's marker would have fired on
nothing, for ever, while looking entirely correct.** Fixed at Tier 1 on CPDF-9's own
structural signal — no font resource AND draws an image — with a blank page deliberately not
a scan, and the test *is EVERY marker a scan marker*, never *is ANY*.

**Its thesis is that `text_source` was the string `"layer"` and is now an ordered chain**
where **every derivation step may only WEAKEN** (the cap is computed as a min and a stronger
claim is refused), confidence is fenced on its BASIS rather than its value, and a below-floor
region reads `undetermined` **with its text discarded and its anchor kept.** The subtle part
is right: **`attested` is a VERIFICATION step, not a derivation** — the derivation cap is
never raised by anything, and a covering attestation supersedes at the grade ceiling. Two
functions, which is what *"supersedes as grade determinant, never as record"* actually means.
`extentCovers` **defaults to not covering.**

**A text layer's fidelity is recorded as `null` — undetermined, STATED — and the reasoning is
the record's own rule applied honestly:** CPDF-9 measured ABBYY in 3 of 14 recent Legistar
attachments, so a layer is authored text and third-party OCR mixed together, and **one letter
for both would be the record overclaiming one field wide on EVERY document in the store.**

**IT CLASSIFIED ITS OWN ACT'S RUNG WRONG AND FW-14's SUITE REFUSED IT — hours after FW-14
landed, and it was right.** `attesttext` was declared `attested`; that rung's stated property
is requiring an authority the group does not hold alone, which this act does not. Corrected
to a stated absence. **A rung tighter than its rule is an undeclared change to what the rung
means** — IC-33's lesson, in a different vocabulary, caught by an instrument rather than a
reviewer.

**It did NOT move the bare-collection ratchet**: it read 38→40 on landing and it **bounded
the two new reads instead**, back to 38 exactly. Twelve other floors moved, every one from a
printed figure.

**D-252 is the sharpest thing it hands forward: Tier-3 routing is per DOCUMENT and the thing
it routes is per PAGE.** A mixed document routes whole to OCR and the wire assigns the built
text wholesale, so **a good text layer would be REPLACED by an OCR pass at cap C.** Harmless
today because the branch is untaken; **a live defect the moment the member exists.** I2's
`text.pages[]` already has the right grain, so it is a merge rule — and it wants writing in
the turn that lands the member, not guessed at now.

**IC-39 filed, PROPOSED; the I2 bump is CONDUCT's.** The consequence a consumer must take:
`transcribed` is now TRUE for text-layer documents too, and **`cap: null` means undetermined,
not fine.** **Merge hazard it names explicitly: `store.mjs`'s purge `TABLES` array — if it
conflicts, keep BOTH sides' names in ONE array; it has been hand-merged once already and
either side alone silently drops derived tables (D-113).**

## D-237 completed — branch `worktree-agent-ad415bce6d85ec969`. NOW the set is drained; all eight reported.

(The outgoing CONDUCT wrote "all eight" one item early, at CPDF-10. Corrected here.)

Green on its branch: **134/134 · 8,369**, `--strict` exit 0, UI harness exit 0, provenance
136/136. `REGISTER_FLOOR` 570/129/130 → **581/130/131** from printed **reproducible**
figures, one key set grep-verified.

**LIVE FINDINGS ON ITS FIRST REAL RUN: `/tmp/mfp` at 10.9 MB — D-237's own subject, still
standing — and `/tmp/mfp-m0-10-arm` at 2.7 MB, RESIDUE OF M0-10's OWN CONTROL ARM, which no
instrument had ever mentioned.** The item that diagnosed the class left residue of the same
class, and nothing saw it until this landed.

**THE DESIGN IS THREE STRENGTHS OF EVIDENCE NEVER COLLAPSED: HELD** (a pid-chain closure
from the battery to a process holding the path — **the only state allowed to claim
ownership**), **APPEARED/CHANGED** (a candidate, stated to be reproducible by any concurrent
checkout), **PRE-EXISTING** (not this run's, named because accumulation IS the finding). It
prints its roots, its entry count and its sampling coverage, **so `0 HELD` can never read as
"we looked".**

**THE FULL BATTERY FOUND A REAL DEFECT IN ITS OWN FIX THAT NINE SCRATCH ARMS COULD NOT:**
the run's fence is built from `os.tmpdir()` (`/var/folders/…`) while its roots are realpaths
(`/private/var/folders/…`), **so the run's own fence escaped its own exclusion** and every
sandbox a suite legitimately held came back as residue *outside* the fence —
over-attribution, **through the same `/private` aliasing that hid the original defect.**

**Three controls came back wrong and the sequence is instructive:** the `held` arm came back
GREEN because **it could never have been honoured** (no process in the scratch estate was
not our descendant), so a sibling-process arm was written to make it capable of failing;
that arm then **caught a harness defect** (its matcher also matched the paragraph
*explaining* the phrase); and it then **passed VACUOUSLY**, the suite exiting before its
200 ms sampling timer — caught only because the first arm stayed green. Cadence re-measured,
coverage now printed.

**`orphans()`/`sweep()` IS THE SAME SHAPE AND IS DELIBERATELY NOT WIDENED**, named at its
site instead: it was exactly as blind as the fenced count, **but it DELETES, and widening a
deleting sweep to roots and names it does not own is worse than the defect it would close.**
Visible, not swept. That judgement is right and should not be "fixed" later.

**THE PORT QUESTION IS DECIDED AND ROUTED (D-249), NOT FOLDED IN:** a port leaves nothing
behind, and this instrument is an after-the-fact filesystem walk with **no "after" to look
at** — structurally incapable. Measured: **exactly one site in the estate, and ZERO suites
pin a port**, so it is a `gap`, not a `defect`.

**ONE ACTION IS OWED THAT ONLY SOMEONE OUTSIDE A WORKTREE CAN TAKE: 13.6 MB of dead residue
is still on the machine** (`/tmp/mfp`, `/tmp/mfp-m0-10-arm`), held by nothing, both from
closed defects. The worker attempted removal and **the environment refused it as outside the
worktree.** It is now named with size and dates on every battery run, which is the item's
real deliverable; the deletion is one command for whoever can reach outside.
