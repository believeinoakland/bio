# Area claims

The register of who is working where, so no two sessions edit the same paths at
once. Established 2026-07-31 as step 2 of the parallel-development move
(`PARALLELISM.md`, "What to build first"). A text file and a rule; no tooling.

## The rules, in short

- **Claim your area before you edit its paths.** Append a `## CLAIM` block below.
  A claim keeps other sessions out of the paths it names; it is not a courtesy.
- **A session that needs work inside another area's claim DELEGATES.** Append a
  `## DELEGATION` block naming what you need and why, and continue with your own
  work. The owning area picks it up. Do not edit a claimed path quietly.
- **Release a claim explicitly**, by setting `released:` to the date. An
  unreleased claim older than its expected scope is stale, and `ARCH` may
  reassign it; silence does not hold ground forever.
- **Unclaimed paths are nobody's** — a collision risk, not a licence. Claim
  before editing even briefly.
- **Append only.** States are added, never edited in place, so the history of who
  held what is readable the same way the record's own history is. The one field
  that changes on an existing block is `released:`.

The format is the one `PARALLELISM.md` fixes:

```

> **Released claims from 2026-07-31 to 2026-08-09 were rolled to
> `docs/archive/ledgers/CLAIMS-2026-08.md` on 2026-08-10** — 217 of them, 1.69 MB, every
> one released. This file had grown past a context window, so a session opening it to
> check whether a path was claimed could not read it, which is the one thing a claim
> register has to support. Nothing was edited and no held claim moved.

### FINDING 2026-08-10 CONDUCT — **A SECOND SESSION COMMITTED IN CONDUCT'S WORKING TREE AND SWEPT UNCOMMITTED WORK INTO ITS COMMIT. NOTHING WAS LOST; THE RECORD WAS MISATTRIBUTED.**

**What happened, measured rather than inferred.** CONDUCT finished integrating CASE-1 — the queue row closed with its reasoning, IC-63 resolved, `REGISTER_FLOOR` moved to 839/159/160 from the merged green run — and had NOT yet committed. A DIST session working in **the same checkout** then committed with a broad `git add`, and `576dd52` ("dist: rewrite DIST-NEXT") carries four files: its own `DIST-NEXT.md` rewrite **plus CONDUCT's `QUEUE.md`, `INTERFACE-CHANGES.md` and `coverage.mjs` changes.** CONDUCT's next `git commit` reported *nothing to commit, working tree clean*, which is how this was noticed at all.

**Nothing was lost and that is checked, not assumed:** `CASE-1 · done` present, `CASE-2`/`CASE-3` marked running, five `RESOLUTION: ACCEPTED` rows, floor at 839 — all on `origin/main`.

**The cost is real anyway, and it is the record's kind of cost.** The reasoning for CASE-1's integration — why two of three clauses were extended rather than duplicated, why the floor moved to that figure from that run — is now under a commit message about a stale resume prompt. **A reader running `git log` on `coverage.mjs` to ask why the floor moved will find an answer about DIST-NEXT.** The reasoning survives in `QUEUE.md`'s own `landed:` line, which is why the loss is attribution rather than content.

**The rule this crosses is already written: DEC-3, one session per tree** (`main` is CONDUCT's). `PARALLELISM.md`'s claim mechanism reserves paths BETWEEN checkouts and cannot see two sessions inside ONE checkout — the same blind spot this queue records for two areas claiming one file, one level up. **A claim would not have prevented this.** What would: DIST running in its own worktree, or committing by explicit path rather than `add -A`.

**Not repaired by rewriting history.** `CLAUDE.md`: never force-push. The commit stands, this entry names what is inside it, and the next reader of `576dd52` has somewhere to land. Recorded here rather than only in a commit message because a commit message is exactly the surface that failed.

## CLAIM 2026-08-09 UI (UI-42 — version review: rotation and diff)
session: ui42-version-review (worktree agent-a8c8ed9c32eb56980)
opened: 2026-08-09T00:00:00Z
released: 2026-08-10 by CONDUCT as STALE, with evidence rather than by assumption — **UI-42's work is ON `main`** and the holding session is gone (no live worker; the worktree is one of ~120 dead checkouts under `.claude/worktrees/`). Named by Bob's 2026-08-10 inbox entry as one of four held claims that *"look stale — releasing them is yours, not housekeeping"*, and released on that instruction. A claim reserves paths BETWEEN checkouts, so a dead session holding `civicos-ui/app.html` by site blocks every later UI worker for nothing.
paths: **`civicos-ui/app.html` — named by SITE, not by file** (it is shared ground and other UI
  workers may be live): (1) the NEW region between `/*__VERSION_REVIEW_START__*/` and
  `/*__VERSION_REVIEW_END__*/`, appended after `__AI_SESSION_END__` — every renderer in it is new
  and nothing outside it moved into it; (2) ONE key ADDED to `SURFACES` inside
  `__SURFACES_START__`/`__SURFACES_END__` — `"basis-versions"`, no existing key touched; (3) ONE
  line inside `boot()` — the route chain `if(!publishedRouteFromHash() && …)`, which gains
  `&& !versionReviewRouteFromHash()` and nothing else. **NOT** the CSS block (this surface reuses
  existing classes and adds none), **NOT** `__CATALOG__`, **NOT** `__SEMANTICS__`, **NOT**
  `__DOCPROFILE__`, **NOT** `__INQUIRY_PAGE__`, **NOT** `__ELICITATION__`, **NOT** any other
  marked region.
  `civicos-ui/test/version-review.test.mjs` (NEW), `civicos-ui/test/version-review.control.mjs` (NEW).
  `civicos-ui/test/surface-registry.test.mjs` — **the `versionhide` row STRUCK from
  `ACTS_AWAITING_SURFACE` (ARM A4c's DRAIN requires it in the same commit), and FIVE floors moved
  from the figures the arms PRINTED: ARM A3 18→19, A4d 15→16, A4e 15→16, D1 50→64, D5 30→39.**
  No other arm touched.
  `civicos-ui/test/preauth-vocabulary.test.mjs` — WALK 2's router census five → SIX and the new
  router CLASSIFIED as post-authentication, with both halves of the classification pinned. That arm
  exists to stop a new router arriving unclassified and it fired on the first run of this item; it
  is CORRECTED, never exempted. No other arm touched.
  `.gitignore` — one pattern (`.ui*-harness/`) for negative-control pens, in the block that already
  documents transient harness directories under `civicos-ui/`.
  `docs/development/CLAIMS.md` (this entry), `docs/development/kickoffs/UI.md` (APPENDED, not
  rewritten — other UI workers are live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `bio-plane/src/**` (READ ONLY), **NOT** `bio-plane/checks/**` (read only — the suite
  IMPORTS `VERSION_MACHINE` rather than copying it), **NOT** `bio-plane/test/**`, **NOT**
  `bio-plane/scripts/**`, **NOT** `civicos-ui/tokens.css`, **NOT** `civicos-ui/check-*.mjs`,
  **NOT** `docs/development/QUEUE.md`, **NOT** `docs/development/IS-BUILD-PLAN.md`, **NOT**
  `newgroup/**`, **NOT** `agent-worker/**`.
interfaces consumed: I3 — `op=basisversions` (read) and `op=versionhide` (the one act this surface
  hosts). Nothing else is asked of the plane and no shape is changed, so no IC row is owed.
interfaces owned: none.

### DELEGATION 2026-08-09 UI (UI-42) -> UI-43 (the accept ceremony) AND UI-45 (CURRENT): **THE MEMBER-FACING WORDS FOR THIS VOCABULARY NOW EXIST IN ONE PLACE, AND A THIRD SPELLING WOULD BE THE DEFECT**

UI-43's row asks for *"the derived falsifier back in plain words (\"your answer fails only if ALL of
these fail\")"*. That sentence already exists TWICE and must not come to exist three times:

- `elicFalsifier` in `__ELICITATION_START__` (UI-27) composes it for the member AUTHORING a
  structure — *"Your answer fails only if ALL of these fail: …"* / *"Your answer fails if ANY of
  these fails: …"*.
- `VREV_FAILS_ALL` / `VREV_FAILS_ANY` in `__VERSION_REVIEW_START__` (this item) compose it for a
  member READING one back — *"This reading fails …"*, the same two tails, different subject.

`version-review.test.mjs` §0b pins that the elicitation block still carries both tails, so if UI-43
re-words either, that pin fails and the next session re-words BOTH rather than shipping two answers
to one question. **Reuse one of the two constants; do not author a third.** The same applies to
`VREV_STATE_WORD`, the four member-facing sentences for `suggested/considering/accepted/rejected`:
its keys are pinned against `VERSION_MACHINE.legal`, IMPORTED from `bio-plane/checks/bio-checks.mjs`
rather than copied, so a fifth state fails the harness instead of rendering a blank line.

**AND WHAT THIS SURFACE DELIBERATELY DID NOT TAKE.** It hosts `versionhide` and nothing else. The
other five version acts are still on `ACTS_AWAITING_SURFACE` in
`civicos-ui/test/surface-registry.test.mjs` with your item names on them; ARM A4c will require the
row struck in the same commit that surfaces each one, and ARM A4d/A4e's floors move UP by one each
time. For UI-45 specifically: `op=basisversions` publishes `current` ONLY when a `project` is named,
and **this surface names none and therefore renders none** — §7's rule that a stance belongs to the
project and not to the question, honoured by not asking rather than by filtering an answer.

### DELEGATION 2026-08-09 UI (UI-42) -> CONDUCT: **FIVE FLOORS MOVED IN `surface-registry.test.mjs`, AND TWO OF THEM WERE ALREADY SLACK BEFORE THIS ITEM TOUCHED THEM**

Moved from the figures the arms PRINTED, never by adding to the number in the file, and each with
its reason at the site:

| arm | was | now | why it moved |
| --- | --- | --- | --- |
| A3 (act placements) | 18 | 19 | this item hosts `versionhide` |
| A4d (catalogue outside the register) | 15 | 16 | STRIKING the register row moves that act into this floor's corpus |
| A4e (distinct hosted acts) | 15 | 16 | a surface now hosts it |
| D1 (ops called statically from app.html) | 50 | **64** | this item added ONE call; the floor was already **13 low** |
| D5 (declared reads) | 30 | **39** | this item added TWO; the floor was already **seven low** |

**The last two are the reportable half.** D1 and D5 are not floors this item invalidated — they were
carrying 13 and 7 of slack before it arrived, which is REC-71's finding (*a floor with slack is not
a ratchet*) sitting in two arms nobody had re-measured since they were written. D1 at 50 would have
sat green through the deletion of a fifth of app.html's static op calls. They are moved rather than
noted, because noting a stale floor is what left them stale, and moving three of five while leaving
two known-slack ones behind is the inconsistency the next reader would trip on.

### DECISIONS FOR BOB 2026-08-09 (UI-42): **NONE**

Measured against `kickoffs/README.md`'s three tests. The two wording judgements this item made are
ones the record already assigned to the surface: DEC-29(b) states in as many words that *"(b)'s
wording clause is a UI string"*, and DEC-32 clause 1 forbids the analyst's vocabulary while leaving
the member-facing rendering to the surface — which is what UI-27's elicitation already established
one construct over. Nothing here is a consequence Bob has not already ruled on.
## CLAIM 2026-08-09 RECORD (REC-69 · THE REPLAY ONTO `main`)
session: worker-rec69-replay (worktree agent-a7e307e5502e319c0)
opened: 2026-08-09T00:00:00Z
released: 2026-08-10 by CONDUCT as STALE — **and this one is released with its work NOT MERGED, which is stated rather than smoothed.** The branch `worktree-agent-a5723f4c87dfd5bd0` (`2d9c57b`) is green on itself and the replay branch is `agent-a7e307e5502e319c0`; neither is on `main`, and REC-69 stays OPEN and stays the top of RECORD's queue. What is released is the PATH RESERVATION, not the item: the holding session is dead, and a dead session's claim on `run-conditions.test.mjs`, `airuns.test.mjs`, `bounds.test.mjs`, `op-claims.mjs` and `coverage.mjs` blocks every other item that touches the test estate while protecting nothing. **The item's open question is unchanged and is NOT CONDUCT's to answer:** whether `aiRuns` is `PUBLISHES` or something the four roles do not yet name is a judgement about what the record publishes, it is RECORD's call, and guessing it to get a green push is the overclaim this project refuses.
paths: **the REPLAY of the reverted merge** (`git revert` of `80473ea`, which restores `e241672`'s hand-resolution work), plus FOUR files opened to answer the two cross-item ratchets and a third nobody listed: `bio-plane/test/run-conditions.test.mjs` (the `ROLE` table gains ONE entry and a fifth role; ARM W4 and ARM W7's WORDING corrected with dated reasons; ARMs W8 / W8 GUARD / W8b added; a second `NEGATIVE CONTROL:` paragraph — **no runtime block, no fixture and no other arm touched**), `bio-plane/test/airuns.test.mjs` (the SWEEP's ceiling/floor re-measured 11 → 13, both arrivals named, three arms added, a second `NEGATIVE CONTROL:` paragraph — **REC-69's own runtime sections A–R untouched**), `bio-plane/test/bounds.test.mjs` (the capped-op roster pin re-measured to 29 and ONE stale WORD corrected), `bio-plane/scripts/op-claims.mjs` (**ONE `PLANNED_OPS` row removed — `airuns`, whose own expiry rule fired**), `bio-plane/scripts/coverage.mjs` (`REGISTER_FLOOR`, all three keys, ONE key set), `bio-plane/test/nc-rec69-selects.mjs` (new — the replay's control driver, inside this worktree). **NOT** `bio-plane/src/**` beyond what the revert-of-the-revert restores byte-for-byte, **NOT** `docs/development/QUEUE.md`, **NOT** `civicos-ui/**`, **NOT** `newgroup/**`.
interfaces consumed: I3 (IC-42, already filed by REC-69 and already renumbered by CONDUCT; **IC-42 measured FREE on `main`, whose maximum is IC-41**)
interfaces owned: none
expected: REC-69 merged and backed out on 2026-08-08 having failed two ratchets that only fire on the pair with REC-74. The judgement CONDUCT left open — what ROLE `aiRuns` carries — is answered below.

### DECISION 2026-08-09 RECORD (REC-69) — a FIFTH ROLE, `SELECTS`, minted rather than a bad fit forced

**What is running:** `aiRunsInContext` is classified `SELECTS` in `run-conditions.test.mjs`'s ROLE table, and is therefore NOT owed a row in ARM P1's twenty-column disposition matrix. The reasoning is at the site, at length, because a wrong answer here installs a false assertion about what the record publishes.

- **Why not PUBLISHES.** Run facts plainly DO reach a member through `op=airuns` — but every one of them is composed by `aiRunRead`, called per row, and asserted BYTE-IDENTICAL to `op=airun`'s own `session` block. Classifying it PUBLISHES would oblige twenty disposition cells that are each a COPY of `aiRunRead`'s. A copy agrees with its original for free, and worse, a SECOND declaration can DRIFT from the reader it describes while the code cannot. The matrix would then read as two independent judgements agreeing where there is only one.
- **Why not AUTHORISES**, the closest of the four: its second clause fits and its FIRST is its definition — a reader deciding whether a DIFFERENT ACT may proceed. No act is authorised here. Filing it there would weaken AUTHORISES to mean "reads and does not itself publish", which is a much weaker claim than it currently makes about `suggestVersion` and `captureRequest`.
- **The role is EARNED, not granted.** ARM W8 fails if a SELECTS reader projects any stored column beyond the key, or calls no PUBLISHES reader; ARM W8 GUARD fails over an empty SELECTS corpus; ARM W8b proves the reader can see both violations. All three are driven by `test/nc-rec69-selects.mjs`.
- **The alternative, and what reversing costs: LOW.** Reversing means deleting one ROLE entry, three arms and one paragraph, and writing twenty matrix cells that duplicate `aiRunRead`'s. No source, no schema, no refusal and no published shape moves either way — the whole decision lives in one test's classification.
- **Stated and NOT decided:** whether a SELECTS reader that publishes a fact COMPUTED FROM the rows it selected (a count of running jobs, a newest timestamp) is still SELECTS. ARM W8 reads the SQL projection, not arithmetic over the page, and would not catch it. Named at the site.

### DELEGATION 2026-08-09 RECORD (REC-69) -> whoever takes the unread-index roster

`provenance_route_marks(finding)` is a REAL instance of REC-69's class and is the arrival that took the roster 11 → 12. `finding` appears in NO `WHERE` anywhere in the plane: every reader takes the LATEST mark per bundle by `seq` and classifies in JS, and `op=list`'s route tally is computed over the gated PAGE. **The question no op asks: "which documents in this instance carry a standing `LOOKED_INDETERMINATE` marker."** A group asking where its own record's provenance is doubted must page the whole store and count for itself; the index for it was declared the day the table landed. Not fixed here — one op per unread index on one battery is how a diff stops being reviewable — and it joins `links(source_bundle)`, `tasks(assignee)` and `inquiry_basis(grade_source)` on the list REC-69 already delegated.

### DELEGATION 2026-08-09 RECORD (REC-69) -> M0-14 / D-233's area (`scripts/control-register.mjs`)

**The register records the declaration STATING THE MOST ARMS and never the sum, and this item is the shape that rule did not anticipate: TWO DIFFERENT controls, for two different items, in ONE suite.** Measured, not inferred: `airuns.test.mjs` now carries REC-69's original 7-arm block and this replay's 4-arm block, and reports 7 — the new block contributes nothing; `run-conditions.test.mjs` carries REC-74's 5-arm block and this replay's, and moved 5 → 6 because the NEW one became the larger, so REC-74's five stopped being counted. `arms` is therefore a floor on ARMS STATED IN THE LARGEST SINGLE DECLARATION PER SUITE. It is SAFE — the number is reported and never gated, and the floor still cannot fall without a declaration really shrinking — but a reader doing the arithmetic between two `--strict` runs will conclude a declaration shrank when one was ADDED. The "never the sum" rule is right for the case it was written for (M0-2's backfill left most suites stating ONE control twice) and needs a way to tell one control stated twice from two controls stated once.

### FINDING 2026-08-09 RECORD (REC-69) — A THIRD CROSS-ITEM RATCHET, AND NOBODY LISTED IT

The 2026-08-08 backout named two ratchets that fire only on the pair. There are **three**. `test/op-claims.test.mjs` failed with `["airuns"]` on *"no PLANNED op has been BUILT — a registration that outlived its deferral is a document that became true while nobody re-read it"*. M0-12's `PLANNED_OPS` ledger registered `airuns` by name **with QUEUE.md's own sentence as its reason** — *"NO OP CAN ANSWER THAT QUESTION TODAY"* — and `plannedStale()` is self-cleaning by design, so building the op made the row's reason false and the build failed in one run. **M0-12 landed BETWEEN the two merge attempts**, which is why the 2026-08-08 backout could not have seen it. The row is removed with the reason at the site. **The general point is not the row: a backout that lists the ratchets it failed is listing the ones that existed THAT DAY**, and the queue moves underneath it.

### FINDING 2026-08-09 RECORD (REC-69) — **THE 2026-08-08 MERGE SILENTLY DROPPED A WHOLE FILE, AND EVERY INSTRUMENT REPORTED SUCCESS**

MEASURED, not inferred, with two `git diff --stat`s:

- `git diff 722c37b 2d9c57b --stat` — REC-69's branch changed **twelve** files, including **`civicos-ui/check-refusal-codes.mjs`, by 70 lines**, moving every floor that its new C-family invalidated **in the same turn**, exactly as C-22's header requires.
- `git diff 7e5f9b0 e241672 --stat` — the merge commit carried **eleven**. `civicos-ui/check-refusal-codes.mjs` is not among them.

**So the floor moves never landed, and `git revert -m 1` could not remove what was never there.** The replay therefore restored the code with ten stale floors, and **nothing went red** — a dropped floor move does not fail, it goes SLACK. Battery green, `--strict` exit 0, UI harness exit 0, and ten ratchets quietly carrying between 1 and 18 of headroom: families 15/16, rows 163/166, census 424/427, reach 217/220, governedSites 66/67, regions 53/54, regionLines 1407/1425, codesChecked 141/144, refusalsJudged 143/146, vocabularies 9/10, vocabularyTerms 56/58. All moved in one turn from the printed run; each now sits EXACTLY at measured.

**The general point, and it is bigger than this file.** The 2026-08-08 integration was verified by running the battery, `--strict` and the UI harness on the merged tree, and all three passed **over a merge that had lost a file**. Nothing in this repository compares the FILE SET a merge carried against the file set its branches changed. `git merge-base --is-ancestor` proves a merge happened; the queue already records that it does not prove the content survived; **this is the next step down — the content of ELEVEN files survived and a TWELFTH did not, and the difference is invisible to every green light we have.** The cheap check is `git diff <base> <merge> --stat` against `git diff <base> <branch> --stat` per branch, and it is a CONDUCT-loop step rather than a worker one, so it is stated here for `kickoffs/CONDUCT.md` rather than added to a suite.

**And it explains the backout's own shape.** REC-69's `bio-checks.mjs` header says *"The floor in `civicos-ui/check-refusal-codes.mjs` is moved in the same turn, from the figure the guard PRINTED"* — a true sentence about the branch, describing work the merged tree did not contain. A comment that describes a mechanism the tree does not carry is this project's most-repeated defect arriving through the integrator rather than through an author.

## CLAIM 2026-08-09 VERIFY (REC-79 — REC-64's remainder PARTITIONED, and the admission gate proved end to end)
session: rec79-refusal-partition (worktree agent-a0bea725408eb06f8)
opened: 2026-08-09T00:00:00Z
released: 2026-08-10 by CONDUCT as STALE — **REC-79's work is ON `main`** (`4df1cd0`, and the queue's register carries it `done`) and the holding session is gone. Same instruction and same reasoning as the UI-42 release above.
paths: **`civicos-ui/check-refusal-codes.mjs` — named by ARM, never by file**: (1) `outcomeReturns`
  widened to see a return that hands its outcome to a WRAPPER (`return json({ … }, 403)`), which is
  the control plane's universal refusal spelling and which arm C has never been able to see;
  (2) NEW **arm F**, the PARTITION of the untranslated census, with its own floors and its own
  named-not-scored-zero residue; (3) the census NOTE's sentence, which claimed a property of 248
  codes that is TRUE OF ONLY 207; (4) the `FLOOR`/`CEILING` tables — only the keys this item moved,
  each to a figure a green run PRINTED. **NOT** arms A, B, D or E's logic, **NOT** `verdictOf`,
  **NOT** `topLevelProps`, **NOT** `functionBody`, **NOT** `regionSpan`.
  `bio-plane/checks/bio-checks.mjs` — **ONE NEW export, `ADMISSION_CHECKS`, appended; no existing
  family, row, translation or `where` touched.**
  `bio-plane/src/index.mjs` — **the ADMISSION GATE ONLY**, the span between the new
  `DEC-49 REGION is-admission` markers: the four refusals there that carry NO CODE AT ALL gain one,
  and the two that carry a code gain their canned translation on the wire. **The existing `error`
  field of all four is kept BYTE-IDENTICAL** — the change is additive, which is why 28 suites that
  assert on those sentences are undisturbed. **NOT** `NEEDS`, **NOT** `SESSION_OPS`, **NOT**
  `scopeFor`, **NOT** the `OPS` table, **NOT** `aiTaskScope`/`aiScopeDeclaration`/`captureRequestArm`
  (the three index.mjs sites another family already governs), **NOT** any other refusal in the file.
  `civicos-ui/app.html` — **ONE BRANCH: `acquireWhy`'s `NOT_CAPABLE` line (3081) and nothing else in
  that function or that file.** It is shared ground with UI-43/UI-45 and is claimed by SITE.
  `civicos-ui/test/admission-translation.test.mjs` (NEW), `civicos-ui/test/refusal-partition.control.mjs`
  (NEW — the control harness, deliberately not a `.test.mjs`).
  `bio-plane/test/admission-gate.test.mjs` (NEW).
  **TWO PATHS ADDED AFTER THE CLAIM WAS OPENED, BOTH REQUIRED BY THE CHANGE AND NEITHER FORESEEN —
  named here rather than absorbed silently:**
  (1) `civicos-ui/test/refusal-codes.test.mjs` — the guard's OWN fixture harness, two lines: the
  fixture `FLOOR` gains `untranslated: 0` and the fixture `CEILING` gains `inheritedVerdicts: 0`.
  **Required, not optional**: that file's own stated rule is that an ABSENT floor compares
  `n < undefined` → false and therefore silently does not exist, so a new key omitted there is a
  ratchet nobody is enforcing. No arm's logic touched.
  (2) `bio-plane/test/verdict-reader.mjs` — **D-240's DELIBERATE COPY of the guard's verdict reader,
  pinned BYTE-IDENTICAL by an arm in `meaning-bounds.test.mjs` and another in
  `plane-envelope.test.mjs`.** Widening `outcomeReturns` in the guard turned both suites RED, which
  is that pin doing exactly its job. The copy is propagated (not exempted), and `SHARED_FNS` grows
  by the two new functions IN THE SAME TURN — because a mechanism that grows in one home and not in
  the list has stopped being shared while the arm still reports green over what it remembers.
  **NOT** either suite's arms, **NOT** `readerDrift`, **NOT** `DRIFT_MIN_CHARS`.
  (3) `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR` ONLY, the ONE key set, collapsed to one
  and moved 654→659 / 136→137 / 137→138.** Moved from the figures a green `--strict` run PRINTED as
  REPRODUCIBLE **after the commit**, never before: the pre-commit run printed those same three
  numbers as CONTAMINATED and named the untracked new suite inflating them, so moving then would
  have installed a floor no other checkout could reproduce (D-238). Nothing else in that file.
  `docs/development/QUEUE.md` (this item's OWN row only), `docs/development/CLAIMS.md` (this entry),
  `docs/development/MEASUREMENTS.md` (append), `docs/development/DEBT.md` (rows this item RAISES only),
  `docs/development/INTERFACE-CHANGES.md` (this item's IC row only).
  **NOT** `bio-plane/src/store.mjs`, **NOT** `bio-plane/src/airun.mjs`, **NOT** `skillpack.mjs`,
  **NOT** `textchain.mjs`, **NOT** `newgroup/**`, **NOT** any other `.test.mjs`.
scope: REC-64 landed DEC-49's enactment PARTLY and said plainly it could not close the class. This
  item does NOT try to: it makes the remainder TRACTABLE by partitioning it by CAUSE, and proves the
  shape on one family that is in reach of a real surface.
numbers: **baseline MEASURED IN A SEPARATE WORKTREE AT THE BASE COMMIT, never by subtraction and
  never by `git stash`: 142/142 suites green · 9,179 assertions · 134.9s · exit 0** at `1081a6a`.
  Final: **143/143 green · 9,227 · exit 0**. **+48, ATTRIBUTED PER SUITE by diffing the two runs'
  per-suite lines**: `admission-gate.test.mjs` +43 (NEW), `hygiene.test.mjs` +3 (it walks source
  files and there are new ones), `planning-hygiene.test.mjs` +2 (it walks planning rows and there
  are new ones). **EVERY OTHER SUITE AT ZERO DELTA.** `--strict` exit 0 unpiped; UI harness exit 0,
  44 suites. **The brief quoted 428/248/180; this worktree measured 427/248/179** — internally
  consistent, so the brief's census and translated figures were each one high.

### DELEGATION 2026-08-09 VERIFY (REC-79) -> CONDUCT: **`origin/main` MOVED 33 COMMITS DURING THIS ITEM AND TOUCHED EVERY FILE IT DID — TWELVE FLOORS WILL COLLIDE AND NOT ONE CAN BE RESOLVED BY TAKING A SIDE**

Measured at hand-off, not assumed: this worktree is based on `1081a6a`; `origin/main` is now
`fc55b62`, **33 commits ahead**, and `git diff --stat` over the base shows it has changed
`bio-checks.mjs`, `coverage.mjs`, `index.mjs`, `app.html` and **`check-refusal-codes.mjs` (112
lines)** independently of this item.

**EVERY FIGURE BELOW WAS MOVED BY BOTH SIDES FROM THE SAME BASE. A keep-mine resolution installs
SLACK; a keep-theirs resolution goes RED. Both must be RE-READ FROM A GREEN RUN OF THE MERGED
TREE** — which is the `regionLines` instruction this repository has now paid for four times,
arriving on twelve floors at once instead of one.

| floor / ceiling | base `1081a6a` | REC-79 | `origin/main` now |
| --- | --- | --- | --- |
| `families` | 16 | **17** | 16 |
| `rows` | 166 | **172** | 168 |
| `census` | 427 | **431** | 429 |
| `reach` | 220 | **225** | 222 |
| `governedSites` | 67 | **68** | 68 |
| `regions` | 54 | **55** | 54 |
| `regionLines` | 1425 | **1527** | 1454 |
| `codesChecked` | 144 | **151** | 145 |
| `outcomeReturns` | 70 | **79** | 74 |
| `refusalsJudged` | 146 | **154** | 148 |
| `vocabularies` | 10 | *(untouched)* 10 | **11** |
| `vocabularyTerms` | 58 | *(untouched)* 58 | **61** |
| CEILING `reachGap` | 41 | **40** | 41 |
| CEILING `unclassifiedOutcomes` | 3 | **1** | 3 |
| `REGISTER_FLOOR.arms` | 654 | **659** | **714** |
| `REGISTER_FLOOR.classified` | 136 | **137** | **143** |
| `REGISTER_FLOOR.corpus` | 137 | **138** | **144** |

**FOUR OF THESE ARE SHARPER THAN THE REST AND ARE WHY THIS TABLE EXISTS:**

1. **`unclassifiedOutcomes` 3 → 1 IS NOT A FIX AND MUST NOT BE READ AS ONE.** It fell because REC-79
   RECLASSIFIED three outcomes into a new, separately-ceilinged `inheritedVerdicts` category. If
   `main` has added an unclassified outcome, **the merged value is neither 1 nor 3** and taking
   either is wrong in a different direction. `inheritedVerdicts` is a NEW key `main` does not have.
2. **`vocabularies` and `vocabularyTerms` were NOT touched by this item.** `main`'s 11/61 must win.
   A keep-both or keep-mine resolution silently installs 10/58 — **lower is SLACK, and slack is the
   direction that goes green while an instrument has lost sight.**
3. **`REGISTER_FLOOR` is the ONE-KEY-SET hazard the file's own header names**, and `main`'s newest
   commit is literally *"conduct: repair coverage.mjs"*. **COLLAPSE TO ONE SET and re-read the
   printed REPRODUCIBLE figures — after committing, never before**, which is the ordering this item
   nearly got wrong and recorded at the site.
4. **`regionLines` 1425 → 1527 is `is-admission`'s span in `index.mjs`**, one of the three contended
   files. This item PREDICTS it will be wrong at integration and asks for the re-read explicitly.

**AND ONE COUPLING THAT IS NOT A NUMBER.** `bio-plane/test/verdict-reader.mjs` is D-240's deliberate
copy of the guard's verdict reader, pinned BYTE-IDENTICAL by arms in `meaning-bounds.test.mjs` AND
`plane-envelope.test.mjs`. **REC-79 widened `outcomeReturns` and both suites went RED — the pin
working exactly as designed.** If `main` has also touched either copy, they must be reconciled
together and `SHARED_FNS` (which REC-79 grew by two) re-checked; a merge that fixes one home leaves
the arm naming the other.

---

## CLAIM 2026-08-09 M0 (D-249)
released: 2026-08-10 by CONDUCT as STALE — **D-249's work is ON `main`** (`5edc051`, merged at `00090a2` and again in the `5263088` integration) and the holding session is gone. Same instruction and same reasoning as the UI-42 release above. **This block carries no `session:` or `opened:` line** — it opens straight into its path list, which is why the first release pass anchored on `opened:` and landed the line in the NEXT claim instead. Corrected here; the shape is noted so the next reader does not repeat it.

- `bio-plane/test/hygiene.test.mjs` — the PORT half of the ground check, beside M0-10's `GROUND` regex
- `bio-plane/test/d249-port.probe.mjs` — NEW, the runtime probe (not discovered by the battery)
- `bio-plane/test/d249-port.control.mjs` — NEW, the five negative-control arms (edits real sources; not discovered)
- `docs/development/DEBT.md` — D-249's row (closing), D-281 and D-282 (new)
- `docs/development/MEASUREMENTS.md` — the port figures

Recorded AFTER the first edits rather than before, which is the wrong order and is
stated rather than tidied. No other session held these paths.

---


## CLAIM 2026-08-10 BOB (Bob's instruction — remove the retired substrate from the architecture record)
session: bob-drive-removal (worktree `bio-worktrees/BOB`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 (landed as 62e6328 on main; all four gates green)
paths: `docs/architecture/BIO_Technical_Architecture_Decisions_v10.md`,
  `docs/architecture/BIO_Bundle_Skill_Composite_Design_v1_7.md`,
  `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`,
  `docs/architecture/README.md`, `docs/architecture/BIO_Complete_Roadmap_v5.md`,
  `docs/architecture/BIO_Intake_Doctrine_v1_1.md`,
  `docs/development/SOURCE-ACCESS.md`, `docs/development/CONFORMANCE-AND-INTAKE-ARC.md`,
  `docs/development/ARCHIVE-FALLBACK.md`, `docs/development/CIVICOS_UI_STATE.md`,
  `docs/development/MILESTONES.md` (the one localized reference only),
  `docs/SESSION-KICKOFF.md`, `docs/BIO_DATAPLANE_STATE.md`,
  `docs/archive/architecture/**` (NEW — where the retired runtime's own sections land),
  `docs/archive/README.md` (the index row for them),
  `docs/development/kickoffs/BOB-NEXT.md` (this session's own kickoff), `docs/DECIDED.md` (regenerated).
  **NOT** the append-only ledgers — `MEASUREMENTS.md`, `DECISIONS.md` (except an appended
  entry), `DEBT.md` (append only), `INTERFACE-CHANGES.md` — whose retired-runtime rows are
  dated records of what was measured and decided ON that runtime and are not architecture.
  **NOT** `BIO_Communications_Platforms.md` or `BIO_Design_Requirements_v2.md` R9, which
  recommend platforms to ADOPTING GROUPS rather than describing our substrate.
  **NOT** `bio-plane/**`, **NOT** `civicos-ui/**`, **NOT** `newgroup/**`.

## CLAIM 2026-08-10 M0 (VF-6 — DEC-53's accepts-without-reading rate; a VERIFY-track instrument, holds no slot)
session: vf6-accepts-without-reading (worktree `agent-a21bd2b090855f8ad`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main`; battery 157/157 · 9,844, `--strict` exit 0 unpiped, three negative-control arms run and recorded.
paths: `bio-plane/test/accepts-without-reading.measure.mjs` (NEW — the instrument. Named
  `.measure.mjs` on `connections-growth.measure.mjs`'s precedent so `scripts/battery.mjs`,
  which discovers `*.test.mjs`, does NOT run it: it drives two whole stores and it is an
  instrument rather than a suite),
  `bio-plane/test/accepts-without-reading.control.mjs` (NEW — the control driver, which arms
  each negative-control arm ALONE against the instrument and prints the baseline beside it.
  Deliberately NOT a `.test.mjs`, on `d249-port.control.mjs`/`d266.control.mjs`'s precedent,
  so this item adds NO suite and `classified`/`corpus` do not move),
  `docs/development/MEASUREMENTS.md` (APPENDED — one dated entry at the end; nothing edited
  in place, it is an append-only ledger),
  `docs/development/CLAIMS.md` (this entry).
  **NOT** `bio-plane/src/**` (READ ONLY — this item measures the record, it does not change
  what the record records; if the finding is that a signal is missing, BUILDING that signal is
  a separate item for RECORD to own and is NOT folded in here).
  **NOT** `docs/development/QUEUE.md` and **NOT** `docs/development/IS-BUILD-PLAN.md` — CONDUCT's
  ground; the row's status move is CONDUCT's at integration, not this worker's.
  **NOT** `civicos-ui/**`, **NOT** `newgroup/**`, **NOT** `bio-plane/scripts/**` (no floor is
  moved by hand here — the printed figures are reported and the integrator moves what a merged
  green run prints).
---

## CLAIM 2026-08-10 UI (UI-54 — DEC-51: `op=acquire`'s grade note rendered WHOLE at the moment of capture)
session: ui54-capture-note (worktree `agent-afd442fede94e63fe`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by the holding session at its own close, **with the work COMMITTED on the
  branch `worktree-agent-afd442fede94e63fe` and NOT YET ON `main`** — stated rather than
  smoothed, because a released claim says the paths are free and does not say the change has
  landed. All four gates are green on that commit (UI harness 46 suites exit 0; battery 157/157,
  9,844 assertions, exit 0; `coverage.mjs --strict` exit 0 read unpiped; `plancheck` clean but
  for UNPUSHED, which is not this session's to clear). Pushing and merging are CONDUCT's. The
  claim is released rather than left held because the four claims before it were all released by
  CONDUCT as stale, and a dead session holding `civicos-ui/app.html` by site blocks every later
  UI worker for nothing.
paths: **`civicos-ui/app.html` — named by SITE, not by file** (it is shared ground and other UI
  workers may be live). Four sites, all inside the UNMARKED Add-surface region (no `__…_START__`
  marker covers it), and nothing else in the file moves:
  (1) `renderAdd` — ONE line added to the rendered form, `<div id="a-note"></div>`, immediately
      after the existing `<div id="a-prog"></div>`. No existing markup touched;
  (2) `addCaptureNote` — a NEW function declared immediately after `addErr`, together with the
      comment block that carries DEC-51's reasoning;
  (3) `addCapture` — ONE call added, `addCaptureNote(acq.note)`, on the line after the
      `if(!acq.document) return …` guard, so the note is rendered the moment the plane answers
      with a document. Nothing else in the continuation loop moves;
  (4) `addGo` — TWO calls added that CLEAR the holder on the paths where the surface itself says
      nothing was added (the reset beside `HELD_BOUNDED`/`CHANGED_FROM`, and the `!r.ok` branch)
      plus the already-held branch.
  **NOT** `ADD_CAPTURE_TEACH` and **NOT** `addValidate` — UI-32's removal of the surface-computed
  grade LETTER stands and is not reopened; both keep their current wording exactly.
  **NOT** the CSS block (the holder reuses the existing `teach` class), **NOT** `__CATALOG__`,
  **NOT** `__SEMANTICS__`, **NOT** `__SURFACES__` (no new surface and no new router), **NOT**
  `__DOCPROFILE__`, **NOT** `__VERSION_REVIEW__`, **NOT** `__NOTIFICATIONS__`, **NOT**
  `__AI_SESSION__`/`__AI_CONNECTIONS__`, **NOT** `__PUBLISHED_CASE__`, **NOT** any other
  marked region.
  `civicos-ui/test/add-surface.test.mjs` — a NEW section 3a and a THIRD detector in the existing
  sweep block. It is this surface's capture-doctrine suite and already imports
  `ACQUIRE_GRADE_NOTE`, so the assertion is added where the instruments live rather than in a
  second file that would need its own copy of them. No existing arm weakened; the sweep's floors
  are moved only where the arms PRINTED a new figure.
  `civicos-ui/test/add-surface.control.mjs` (NEW) — the three negative-control arms, each armed
  ALONE and restored byte-identically with sha256 compared.
  `docs/development/CLAIMS.md` (this entry), `docs/development/kickoffs/UI.md` (APPENDED, not
  rewritten — other UI workers may be live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `docs/development/QUEUE.md` and **NOT** `docs/development/DECISIONS.md` — CONDUCT is
  sole writer of both (`ORCHESTRATION.md`, "the channels"), so UI-54's `landed:` line and any
  addition to DEC-51's `enacted:` line are CONDUCT's at integration and are reported to it rather
  than written here.
  **NOT** `bio-plane/src/**` (READ ONLY — the note is already published and its shape does not
  move, so no IC is owed), **NOT** `bio-plane/checks/**` (read only — the suite IMPORTS
  `EARNED_CAPTURE_CEILING`/`UNREACHABLE_CAPTURE_GRADE` rather than copying them), **NOT**
  `bio-plane/test/**`, **NOT** `civicos-ui/tokens.css`, **NOT** `civicos-ui/check-*.mjs`,
  **NOT** `newgroup/**`, **NOT** `agent-worker/**`.
interfaces consumed: I3 — `op=acquire` (read only). The `note` field is already published on every
  answer; nothing is asked of the plane that it does not already send and no shape changes, so no
  IC row is owed.
interfaces owned: none.
---

## CLAIM 2026-08-10 M0 (D-282 — a flooding suite loses its tally through a pipe)
session: d282-tally-through-pipe (worktree `agent-a12f0d082be9568ec`)
opened: 2026-08-10T17:10:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
paths:
- `bio-plane/test/stdio.mjs` — NEW, the fix: stdout/stderr made synchronous before a suite writes
- `bio-plane/test/tally-through-pipe.test.mjs` — NEW, the assertion (discovered by the battery)
- `bio-plane/test/tally-through-pipe.control.mjs` — NEW, the three negative-control arms (not discovered)
- `bio-plane/test/*.test.mjs` — ONE added import line at the head of each, and nothing else in any of them
- `bio-plane/test/sandbox.mjs` — one added import so the controls and probes that already take its side effect take this one too
- `bio-plane/test/hygiene.test.mjs` — the new check that a suite without the import fails the battery
- `docs/development/DEBT.md` — D-282's row (closing), append-only
- `docs/development/MEASUREMENTS.md` — the pipe/file byte figures and the bisected threshold

NOT `bio-plane/src/**`, NOT `civicos-ui/**`, NOT `docs/development/QUEUE.md`.
`civicos-ui/test/run.mjs` and the `civicos-ui/test/*.test.mjs` suites carry the same
exposure and are DELEGATED below rather than edited here.

## DELEGATION 2026-08-10 M0 -> UI (D-282's other estate)
`civicos-ui/test/**` has the same defect and this session does not own it. Every
suite there ends `process.exit(...)`, and `civicos-ui/test/run.mjs` spawns its
members with piped stdout, so a UI suite that fails with a large enough dump loses
its own tally exactly as `hygiene.test.mjs` did. The fix is one added import line
per suite — `import "../../bio-plane/test/stdio.mjs";` or a UI-local copy of it —
and the module carries the argument in its header. Measured here, not assumed:
through a pipe a 2,000,000-byte child delivered 65,536 bytes and no tally; with the
import it delivered all of it, every run.
---


## CLAIM 2026-08-10 SKILL (SK-2 — the investigative skill: composition judgement, description standard, search-completeness discipline)
session: sk2-investigative-skill (worktree `agent-ab0c5fdce6f2627dc`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
paths: `bio-plane/src/skilldoctrine.mjs` (NEW — SK-2's judgement layer, a sibling of the
  SK-1 pack rather than an edit inside the plane's own code), `bio-plane/src/skillpack.mjs`
  (SK-1's pack, which this area owns per `kickoffs/SKILL.md` — the ONLY change is that
  `disclosedLayers()` merges SK-2's layers in and the header records it),
  `bio-plane/test/skilldoctrine.test.mjs` (NEW), `bio-plane/test/skilldoctrine.control.mjs`
  (NEW — the negative-control harness, not discovered by the battery),
  `bio-plane/test/skillpack.test.mjs` (SK-1's suite, this area's: ARM G1's byte inequality
  is the one arm re-judged, per the re-assert-when-SK-2-lands note REC-64 left in it),
  `docs/development/CLAIMS.md` (this entry and the delegation below),
  `docs/development/MEASUREMENTS.md` (appended), `docs/development/kickoffs/SKILL.md`
  (appended — the SK-2 row's outcome, so SK-3 starts from what landed).
  **NOT** `bio-plane/src/**` beyond the two files named above — in particular NOT
  `airun.mjs`, NOT `store.mjs`, NOT `index.mjs`. **NOT** `bio-plane/checks/**` (a
  prohibition's CODE half is a C-number and belongs to the plane; SK-2 CITES C-numbers and
  adds none). **NOT** `civicos-ui/**`, **NOT** `agent-worker/**`, **NOT**
  `docs/development/QUEUE.md` (CONDUCT's), **NOT** `docs/development/IS-BUILD-PLAN.md`.


## DELEGATION 2026-08-10 SKILL -> RECORD (the four levels are spelled two ways, and a run has to write both)
raised by: sk2-investigative-skill (worktree `agent-ab0c5fdce6f2627dc`), while wiring SK-2's
four-level absence discipline onto the vocabularies that already exist.

**MEASURED, not suspected.** The plane holds TWO closed vocabularies for the same four
levels and they disagree on one member:

- `src/airun.mjs OBSERVATION_LEVELS` — `meaning`, `content`, **`document`**, `internet`.
  This is what the observation log is written in (§11, D-129).
- `checks/bio-checks.mjs SUGGEST_LEVELS` — `meaning`, `content`, **`documents`**, `internet`.
  This is what `kind=level-empty` is REFUSED against (`store.mjs` ~20015 refuses a
  `level` outside it), so it is what a suggestion must carry.

So one run reporting one absence at one level writes `document` into its log and
`documents` into its suggestion, and nothing anywhere says they are the same level.
**Which of the two is the outlier is also measured rather than guessed:** the design prose
and `CLAUDE.md` both say `documents` — `INVESTIGATIVE-SESSION.md:453` and `:769`,
`STORE-AS-CACHE.md:586`, `CLAUDE.md:84` — so `airun.mjs`'s singular is the one member that
matches no document. `decided.mjs` has no ruling on it either way. §9's
`level-empty` kind exists precisely so that *"a run that honestly found nothing supportable
is distinguishable from a run that emitted nothing"* — an absence that cannot be joined
across the two surfaces weakens exactly that.

**What SK-2 did meanwhile, so this is not a stopped session:** `skilldoctrine.mjs` BRIDGES
them rather than picking one. Each level's entry derives its reporting spelling from
`SUGGEST_LEVELS` (`s === key || s === key + "s"`) instead of typing either, and
`skilldoctrine.test.mjs` ARM C6 asserts the bridge covers every member of BOTH vocabularies
— so if the two are ever unified the arm still passes, and if a fifth level appears in
either it fails naming the level.

**What is needed, and it is RECORD's or the plane's call, not this area's:** decide whether
the two vocabularies converge (one spelling, one export, the other importing it) or stay
deliberately distinct with the mapping held in one named place. Either is fine; what is not
fine is two rosters with no stated relationship. The paths are `bio-plane/src/airun.mjs`
and `bio-plane/checks/bio-checks.mjs`, both outside SKILL's claim, and a convergence is an
INTERFACE change (`agent-worker` builds against the spawn payload) rather than a rename.


## CLAIM 2026-08-10 SKILL (SK-2 — AMENDMENT: the coverage register's floor)
session: sk2-investigative-skill (worktree `agent-ab0c5fdce6f2627dc`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
Appended rather than edited into the claim above, per this file's append-only rule.
paths: `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR`'s three figures ONLY**, moved
  UPWARD to the triple a green `--strict` run PRINTED once SK-2's suite was in a commit
  (792/151/152 -> 801/152/153). Nothing else in that file, and `FLEET_FLOOR` unmoved at
  5 suites / 48 arms. This is the ratchet the file's own comment instructs the item that
  grows the register to move, and it is the reason a path outside the first claim is taken
  at all: leaving it would install slack in a ratchet whose whole purpose is to have none.
---

## CLAIM 2026-08-10 CONTENT-PDF (D-251 — who made this text layer, read from the file's own `/Info`)
session: cpdf-d251 (worktree `agent-a9a385fb87482fe28`, branch `worktree-agent-a9a385fb87482fe28`)
opened: 2026-08-10T00:00:00Z
released:
paths:
- `bio-plane/src/pdfstructure.mjs` — CONTENT-PDF's own path (kickoff `CONTENT-PDF.md`). The
  `/Info` read, the OCR-marker DETECTOR, and `classifyProducer`.
- `bio-plane/src/index.mjs` — **NAMED BY REGION, NOT BY FILE, because a RECORD worker is live
  on this file's op surface and `store.mjs` for a different item, and two claims that read as
  overlapping is exactly what `PARALLELISM.md`'s mechanism exists to prevent.** What is claimed
  here is ONLY: (1) the CPDF-10 constant block that already carries `LAYER_FIDELITY_CAP` /
  `LAYER_FIDELITY_SOURCE`, which gains two siblings and one function beside it; (2) inside
  `op=acquire`'s READING ASSEMBLY, the three lines that BUILD A TEXT CHAIN — the Tier-2
  hand-off's `i2text = t2.text`, the D-252 mixed-document `layerChain({…})` call for
  `layerPages`, and the terminal `if (i2text && !chain) chain = layerChain({…})`. **NOT** the op
  dispatch table, **NOT** any `if (op === …)` arm, **NOT** the capture/governor/subresource path,
  **NOT** the schema, **NOT** `store.mjs` (READ ONLY — measured 25,861 lines, `grep -a` only).
- `bio-plane/test/pdfstructure.test.mjs` — CONTENT-PDF's own battery (parser-level arms).
- `bio-plane/test/producer-provenance.test.mjs` (NEW) — the arm that drives it THROUGH
  `op=acquire`, because a store-level or parser-level pass is not evidence a caller can reach
  the feature (`op=invitelook` shipped with a ReferenceError while 1276 assertions passed).
- `bio-plane/test/producer-provenance.control.mjs` (NEW) — the three negative-control arms.
- `.gitignore` — ONE pattern (`.d251-control-pristine/`), appended to the block that already
  documents negative-control pens. No existing pattern touched.
- `docs/development/INTERFACE-CHANGES.md` (APPENDED — the IC row), `docs/development/DEBT.md`
  (APPENDED / this row's disposition), `docs/development/MEASUREMENTS.md` (APPENDED),
  `docs/development/INTERFACES.md` (the I2 text-extension paragraph only),
  `docs/development/kickoffs/CONTENT-PDF.md` (APPENDED — other content workers may be live),
  `docs/development/CLAIMS.md` (this entry).
- **NOT** `docs/development/QUEUE.md` (CONDUCT is its sole writer), **NOT** `pdf-worker/**`,
  **NOT** `civicos-ui/**`, **NOT** `newgroup/**`, **NOT** `bio-plane/src/textchain.mjs`
  (READ ONLY — the chain rules are IMPORTED and this item adds no rule to them).
interfaces consumed: I1 (bytes), I6 (read only — the Tier-2 hand-off is not changed in shape).
interfaces owned: I2 producer side — **one ADDITIVE field, `text.producer`.** IC row filed with
  measured consumer impact; the version bump and the RESOLUTION are CONDUCT's.

### DELEGATION 2026-08-10 CONTENT-PDF (D-251) -> M0: **A FRESH WORKTREE HAS NO `bio-plane/node_modules`, AND 124 PLANE SUITES FAIL WITH ONE CAUSE**

**CORRECTED IN PLACE BEFORE ANYONE READ IT, and the correction is left visible rather than the
paragraph rewritten, because the mistake is the more useful half.** This block first claimed the
battery *"reports 124 FAILED suites and EXITS 0"* — the same class of defect as REC-49's false
`exit 0`, raised as a delegation. **That claim was WRONG, and it was wrong because of my own
harness rather than the runner's.** The baseline was run as
`npm run test:battery > file; echo "EXIT=$?"`, and the status reported back for a compound
command is the LAST command's — `echo`'s — which is always 0. Measured directly afterwards on
this same branch: a run with ONE failing suite wrote **`EXIT=1`** into its own log while the
harness still announced "exit code 0". **The battery's exit status is fine. My instrument was
the thing that could not see it**, which is precisely the `cmd | tail` failure CLAUDE.md already
records, arriving through `cmd; echo` instead of through a pipe.

**What IS true, and is all that is left of it.** A fresh worktree has no
`bio-plane/node_modules`, and `npm run test:battery` there reports **`28/157 suites green · 5
skipped · 2233 assertions passing`** with **124 plane suites under `FAILED:`**, every one
`Cannot find package 'miniflare'`. The transcript is correct, complete, and names the cause on
every line. The true exit status of THAT run was never measured and is not claimed here.

**What closing it takes, and it is small:** nothing tells a session working in a fresh worktree
to run `npm ci` in `bio-plane/` first — not `CLAUDE.md`'s verification section, not
`VERIFICATION.md`, not `gates.mjs`. One line in the loop the reader actually runs (a
`gates.mjs` pre-flight that says so, or better, that runs it) turns a 124-line wall of identical
failures into a setup step. **A hint would be enough; a mechanism that is not in the loop the
reader runs is not a mechanism.**
---

## CLAIM 2026-08-10 RECORD (D-266 — the WIDENED disposition key for STANCE-SCOPED kinds)
session: d266-scope (worktree `agent-a3479876cd7e9561b`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
paths:
- `bio-plane/src/schema.mjs` — ONE new table, `finding_dispositions`, added BEFORE the
  `host_governor` block. **`proposal_dispositions` IS NOT TOUCHED** — the shared-record
  key stays `(progression_key, stage_key)` and stays instance-wide, which is the
  distinction this item exists to draw.
- `bio-plane/src/store.mjs` — named by FUNCTION, not by file (it is shared ground):
  `#dispositionOf`, `proposeDispose`, the `disposed`/filter region inside `queueFeed`,
  the whole-store arm of `purge` (D-113), and the one counts row that names
  `proposal_dispositions`. **NOT** the link, capture, task or reachability functions
  (CAPTURE's), **NOT** any producer body — the three stance-scoped producers are READ
  and not edited.
- `bio-plane/src/index.mjs` — the ONE `proposedispose` dispatch line, which gains the
  two new arguments and the server-side stamp they need.
- `bio-plane/test/d266scope.test.mjs` (NEW — both behaviours in ONE suite),
  `bio-plane/test/d266scope.control.mjs` (NEW — the three arms; edits real sources, so
  it is deliberately not a `.test.mjs` and the battery must not discover it).
- `docs/development/CLAIMS.md` (this entry), `docs/development/INTERFACE-CHANGES.md`
  (IC-60, appended), `docs/development/DEBT.md` (the D-266 row), 
  `docs/development/MEASUREMENTS.md` (appended), `docs/development/kickoffs/RECORD.md`
  (appended).
- **NOT** `civicos-ui/**` (READ ONLY — measured for the IC and DELEGATED below),
  **NOT** `newgroup/**`, **NOT** `agent-worker/**`, **NOT** `pdf-worker/**`,
  **NOT** `docs/development/QUEUE.md`, **NOT** `docs/development/IS-BUILD-PLAN.md`.
interfaces owned: I3 (the op contracts) and I5 (the store schema). **IC-60 is filed
  before the build**, per the protocol.
interfaces consumed: none.

### DELEGATION 2026-08-10 RECORD (D-266) -> UI: **A STANCE-SCOPED FINDING IS NOW DISPOSITIONABLE, AND THE ACT TAKES A PROJECT THE PAGE DOES NOT YET SEND**

**What changed (IC-60, I3):** `op=queue`'s per-item `disposition` block now answers
`available: true` for the three FINDING kinds that carry no `(progression_key,
stage_key)` pair — `out-of-inquiry-lead`, `stance-changed-here-not-elsewhere`,
`new-version-arrived-from-another-team` — with `scope: "project"`, `key: null`,
`finding: <the item's own id>`, `projects: [<the project homes>]` and
`requires: ["project","finding"]`. `op=proposedispose` accepts that second key shape.

**What this does to the deployed page, MEASURED and not guessed.**
`notifDispositionKeyed` returns `d.available`, so the three controls will now be DRAWN on
those items; `queueFindingKey(it)` composes the key from the item id and
`doProposalDispose` sends `{key, to, reason}` with no `project`. The plane refuses
`NO_PROJECT_SCOPE`, and `doProposalDispose` RENDERS that refusal (`PROP_ACT.refusal =
out`) — so the member gets the record's own words naming what is missing, not a dead
click. That is the honest interim and it is not the end state.

**What is needed, and it is small:** read `it.disposition.requires`; when it names
`project`, send `{ project: <one of it.disposition.projects>, finding:
it.disposition.finding, to, reason }` instead of `{ key }`. **The project must be
CHOSEN, never defaulted when there is more than one** — an act one team performs from a
notification another team is also reading is the single shared stance §7 rejected,
arriving through a button (D-222's grain problem, and the reason
`#findingsStanceDiverged` refuses to offer `op=versioncurrent` across projects). Where
`projects` holds exactly one id there is no choice to make and no invention in using it.

**RECORD did not reach into `civicos-ui/**`** — it is read-only in this claim and was
read only to MEASURE the impact above.

**AMENDED 2026-08-10 (same session), because a claim that does not name what was really
edited is not a claim.** Three paths beyond the list above were touched and each is
licensed by ORCHESTRATION rule 6 — *correct what your change superseded, in the SAME
turn, yourself*:
- `bio-plane/test/current.test.mjs` — FOUR superseded assertions in its §7 disposition
  block, CORRECTED and never exempted, each with a comment saying why the old one was
  right when written and what made it wrong. It required every item's `keyed_on` to be
  the progression pair (true while one key shape existed), asserted that neither
  stance-scoped kind was dispositionable (the ruling turned that over), and required a
  composed `<a>::<b>` key on every dispositionable item (a project-scoped item's key is
  deliberately null). 62 pass → 63 pass, 0 fail.
- `bio-plane/test/d266.control.mjs` — TWO arm anchor strings, corrected in place with the
  arms' meanings untouched. `edit()` REFUSED TO ARM BLIND rather than arming nothing
  quietly, which is what caught them. All six arms re-run and all six as declared.
- `bio-plane/src/index.mjs` — one clause added to the viewer-stamp condition, so
  `op=proposedispose` receives the server-side `viewer` its project-scoped arm gates on.
  Without it the act refused `NO_SUCH_PROJECT` for a real project, fail-closed and
  correct, which is how the omission was found.

## CLAIM 2026-08-10 RECORD (D-280 — a project that WITHDREW still sets the publication bar)
session: record-d280 (worktree `agent-aa5a5b887286869b2`, branch `worktree-agent-aa5a5b887286869b2`)
opened: 2026-08-10T00:00:00Z
released:
paths:
- `bio-plane/src/store.mjs` — **NAMED BY REGION, NOT BY FILE.** Three regions only, and each is
  a handful of lines: (1) `#requiredStrengthFor`'s candidate loop — the `SELECT r.bundle_id FROM
  refs r JOIN bundles b …` and the per-project accumulate, which gains D-267's `#refEdgeSevered`
  confirmation; (2) `#routeTask`'s `cite` arm — the single `SELECT r.bundle_id AS project_id …
  ORDER BY r.bundle_id` and the `if (cite)` block beneath it, same confirmation; (3) `restingOn`'s
  one `SELECT … FROM inquiry_basis WHERE target_id=?` read, which gains an additive `status` field
  the way `backlinks` already carries one. **Nothing else in the file is claimed** — in particular
  `#refEdgeSevered` itself is READ AND CONSUMED UNCHANGED, which is the whole point of the item.
- `bio-plane/test/d280-strengthbar.test.mjs` (new) — the driven suite.
- `bio-plane/test/d280-strengthbar.control.mjs` (new) — the negative-control harness. Deliberately
  NOT a `.test.mjs`: it edits real sources while it runs and the battery must not discover it
  (`severedhomes.control.mjs`'s precedent). It lives INSIDE this worktree and never in the shared
  scratchpad (PL-10).
- `docs/development/DEBT.md` — the D-280 row's disposition only.
- `docs/development/MEASUREMENTS.md` — append only.
- `docs/development/INTERFACE-CHANGES.md` — one IC row, if the measurement owes one.
- `docs/development/kickoffs/RECORD.md` — this area's kickoff, rewritten at the close of the turn.

NOT claimed and NOT touched: `civicos-ui/**`, `newgroup/**`, `docs/development/QUEUE.md`,
`docs/development/IS-BUILD-PLAN.md`, `docs/development/DECISIONS.md` (CONDUCT is its sole writer —
anything ruled here is raised in the report instead).

**AMENDED at the close, because a claim that does not name what was really edited is not a claim.**
Two further paths were touched and both are licensed by `ORCHESTRATION.md` rule 6 — *correct what
your change superseded, in the SAME turn, yourself*:
- `bio-plane/test/severedhomes.test.mjs` — **ONE superseded assertion, D-267's structural caller
  pin, CORRECTED from `[1, 3]` to `[1, 6]` and never exempted**, with a paragraph at the assertion
  saying why the old one was right when written and what made it wrong. It is an EXACT count on
  purpose and was deliberately not relaxed to a floor: it is the only instrument in this estate
  that can see a reader of the severance rule appear or disappear, and three of this item's control
  arms proved it by bringing it down when they deleted a call site. 13 pass → 14 pass, 0 fail.
- `bio-plane/test/derivation-bounds.test.mjs` — **REC-66's class RATCHET moved 30 → 31, both halves
  together and the arrival NAMED**, which is what the pin's own text demands ("a bare count is
  satisfied by ANY ten"). The new member is `#routeTask` and it is MEASURED, not guessed: the walk
  was re-derived over `git show HEAD:bio-plane/src/store.mjs` and over the working tree and `comm`
  reports exactly one arrival and no departure — `restingOn` did not join and `#requiredStrengthFor`
  was already a member. The argument for why it is not a regression is written at the constant. 41
  pass / 1 FAIL → 42 pass, 0 fail. **This ratchet caught the change without anybody looking for it**,
  which is the second time in two RECORD items that a ratchet and not a review found the thing.
- `.gitignore` — one entry, `.d280-harness/`, this item's control pen. Kept inside the worktree
  (PL-10) and ignored so an interrupted driver cannot leave an untracked file that becomes somebody
  else's corpus (M0-15).

**AND `hygiene.test.mjs` CAUGHT THE SECOND ONE**, also without being asked: the new suite did not
`await mf.dispose()`, so it leaked its workerd process. Fixed in the suite, outside its `try` so a
thrown suite still releases it. 623 pass / 1 FAIL → 624 pass, 0 fail. Neither of these two was found
by reading the diff.
---

## CLAIM 2026-08-10 SKILL (SK-3 — the PRACTICE-SURVEY prohibition set, in the skill VERBATIM)
session: sk3-prohibitions (worktree `agent-ab590a192167d2ca3`, branch
  `worktree-agent-ab590a192167d2ca3`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
paths: `bio-plane/src/skilldoctrine.mjs` (SK-2's judgement layer, this area's — SK-3 ADDS
  `PROHIBITIONS`, `PERMITTED_AUTO_COMPOSITION` and one further disclosed layer, and REUSES
  the exported `controlFlowAuthority` rather than writing a second scanner),
  `bio-plane/test/skillprohibitions.test.mjs` (NEW), `bio-plane/test/skillprohibitions.control.mjs`
  (NEW — the negative-control harness, deliberately not a `.test.mjs` so the battery does
  not collect a file that edits real sources while it runs),
  `docs/development/CLAIMS.md` (this entry), `docs/development/MEASUREMENTS.md` (appended),
  `docs/development/kickoffs/SKILL.md` (appended — what SK-4 starts from).
  **NOT** `bio-plane/checks/**` — **and this is the item's whole point rather than a
  boundary observance**: the fifth prohibition's CODE half is `PL-3`'s landed
  `SUGGEST_BOILERPLATE` / `C-27.12`, and SK-3 CITES it by catalogue KEY and adds no second
  check and no second predicate. **NOT** `bio-plane/src/**` beyond the one doctrine module
  — in particular NOT `store.mjs`, NOT `index.mjs`, NOT `airun.mjs`. **NOT**
  `civicos-ui/**`, **NOT** `agent-worker/**`, **NOT** `docs/development/QUEUE.md`
  (CONDUCT's), **NOT** `docs/development/IS-BUILD-PLAN.md`.
  The control harness TRANSIENTLY edits `checks/bio-checks.mjs` and `src/store.mjs` and
  restores both, verified by content AND by sha256 — SK-2's arm (8) is the precedent. A
  transient armed edit inside one worktree is not a claim on the path.


## CLAIM 2026-08-10 SKILL (SK-3 — AMENDMENT: the coverage register's floor)
session: sk3-prohibitions (worktree `agent-ab590a192167d2ca3`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
Appended rather than edited into the claim above, per this file's append-only rule.
paths: `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR`'s three figures ONLY**, moved
  UPWARD to the triple a green `--strict` run PRINTED as REPRODUCIBLE once SK-3's suite was
  in a commit (813/155/156 -> 821/156/157). Nothing else in that file, and `FLEET_FLOOR`
  unmoved at 2 members / 4 ops / 5 suites / 48 arms. This is the ratchet the file's own
  comment instructs the item that grows the register to move, and the reason a path outside
  the first claim is taken at all: leaving it would install slack in a ratchet whose whole
  purpose is to have none. SK-2's amendment one entry up is the precedent and the shape.
---

## DELEGATION 2026-08-10 SKILL -> UI (two landed prohibitions aim at the SURFACE and no plane check can reach them)
raised by: sk3-prohibitions (worktree `agent-ab590a192167d2ca3`), while landing SK-3's
prohibition set. **This is a NOTICE that two rules now exist and are unenforced where they
actually bite — not a request for work in this sprint, and not a blocker for anything.**

**MEASURED, not suspected.** Of SK-3's five prohibitions, two have residues that NO CHECK IN
THE PLANE CAN EVER REACH, because both are facts about a RENDERING and the plane cannot see
one. Both are stated in the landed doctrine's `does_not_reach` field and printed by
`skillprohibitions.test.mjs` every run, so they are published rather than implied:

- **`no-connection-density-ranking`** — *"No connection-density or centrality ranking, and no
  graph view that rewards it"* (PRACTICE-SURVEY "deliberately violate" 4). **`enforced_by` is
  EMPTY and the suite asserts that it is the only one of the five that is.** Nothing in this
  plane computes a degree, a centrality or a density over the record's edges — no op, no
  field, no answer — so there is nothing to refuse yet and the prohibition says exactly that.
  **It becomes breakable the day a surface ranks or draws anything by connectedness**, and on
  that day the fence belongs beside the ranking rather than in a doctrine file. The survey's
  own reason is worth carrying: *"Connectedness is a property of the drawing, not evidence."*
- **`machine-proposed-is-never-a-connection`** — *"Machine-proposed connections are never
  presented as connections"*, whose stated ground is **D-82**, RULED BY BOB 2026-07-30: *"the
  appearance of an assistant-surfaced focus should communicate that it is one."* The plane
  holds the STATE half and SK-3 cites it (`C-27.13`: a suggestion may only ever arrive as
  something put forward; `C-32.2`/`C-32.8`: the acts that would make it the record's own
  answer are unreachable to a machine). **The DRESS half is entirely UI's and is enforced by
  nothing** — whether a `suggested` version renders differently from an accepted one is not a
  fact any plane check can observe.

**What is needed, and it is UI's call rather than this area's:** decide whether either wants a
surface-side assertion (`civicos-ui/test/**` already runs a harness that could hold one), and
if so where. Either answer is fine; what is not fine is a prohibition that reads as enforced
because it sits beside four that are — which is why `does_not_reach` is a REQUIRED field on
every prohibition and why the instruction-only tally is printed rather than implied.

**Nothing is blocked on this.** SK-3 landed with both residues named, and
`connections-sidebar.test.mjs` is already green in UI's harness — this delegation says only
that neither prohibition is holding it there.

---

## CLAIM 2026-08-10 SKILL (SK-4 — CHECK deploys first: the sequencing RECORDED, the gate CITED)
session: sk4-check-first (worktree `agent-a02138ebf5b27a79b`, branch
  `worktree-agent-a02138ebf5b27a79b`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
paths: `bio-plane/src/skilldoctrine.mjs` (SK-2/SK-3's doctrine module, this area's — SK-4
  ADDS `DEPLOYMENT_SEQUENCE` and one further disclosed layer, and REUSES the exported
  `controlFlowAuthority` rather than writing a second scanner),
  `bio-plane/test/skillsequencing.test.mjs` (NEW),
  `bio-plane/test/skillsequencing.control.mjs` (NEW — the negative-control harness,
  deliberately not a `.test.mjs` so the battery does not collect a file that edits real
  sources while it runs), `docs/development/CLAIMS.md` (this entry),
  `docs/development/MEASUREMENTS.md` (appended),
  `docs/development/kickoffs/SKILL.md` (appended — what closes the track).
  **NOT** `agent-worker/**` — **and this is the item's whole point rather than a boundary
  observance**: the investigate-mode gate is FL-3's LANDED `gate-mode` row in
  `agent-worker/src/harness.mjs`, and SK-4 CITES it BY ADDRESS and re-implements nothing.
  The doctrine module holds no mode flag, no gate and no second table, and BLOCK C measures
  that over its code half with the estate's own lexer. **NOT** `bio-plane/checks/**`,
  **NOT** `bio-plane/src/**` beyond the one doctrine module, **NOT** `civicos-ui/**`,
  **NOT** `docs/development/QUEUE.md` (CONDUCT's), **NOT** `docs/development/IS-BUILD-PLAN.md`.
  The control harness TRANSIENTLY edits `src/skilldoctrine.mjs` and
  `agent-worker/src/harness.mjs` and restores both, verified by content AND by sha256 —
  SK-2's arm (8) and SK-3's arm (1) are the precedent. A transient armed edit inside one
  worktree is not a claim on the path.

---

## CLAIM 2026-08-10 SKILL (SK-4 — AMENDMENT: the coverage register's floor)
session: sk4-check-first (worktree `agent-a02138ebf5b27a79b`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
Appended rather than edited into the claim above, per this file's append-only rule.
paths: `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR`'s three figures ONLY**, moved
  UPWARD to the triple a green `--strict` run PRINTED as REPRODUCIBLE once SK-4's suite was in
  a commit (`f4483e6`): 826/157/158 -> 833/158/159. Nothing else in that file, and
  `FLEET_FLOOR` unmoved at 2 members / 4 ops / 5 suites / 48 arms. **The block was checked for
  a duplicate `arms:` key before writing** — the documented hazard that has bitten six times,
  where the LAST key silently wins and once the last was the LOWEST; the two `arms:` keys in
  the file are `REGISTER_FLOOR`'s (line 565) and `FLEET_FLOOR`'s (line 668), and the previous
  value is REPLACED rather than joined. This is the ratchet the file's own comment instructs
  the item that grows the register to move. SK-2's and SK-3's amendments are the precedent and
  the shape.

---

## DELEGATION 2026-08-10 SKILL -> FLEET (the mode gate's refusal is recorded under a word that says a member did it)
raised by: sk4-check-first (worktree `agent-a02138ebf5b27a79b`), while landing SK-4's
deployment record. **This is a NOTICE of a MEASURED misattribution in FL-3's landed gate — not
a request for work in this sprint, and not a blocker for anything. SK-4 changed nothing in
`agent-worker/**` and is not asking to.**

**MEASURED, not suspected, and asserted in `test/skillsequencing.test.mjs` ARM D5 so it cannot
quietly rot.** Driving FL-3's own `nextStep({ step: "gate-mode", mode: "investigate" })`:

- the run closes with **`bound: "cancelled"`**, and the plane's own vocabulary
  (`bio-plane/src/airun.mjs` `RUN_ENDINGS`) defines `cancelled` as **"a member stopped it"**.
  **A member did not.** The gate refused a mode that is not deployed, which is a different fact
  about the record from a member cancelling a run — and `RUN_ENDINGS`' own header is explicit
  about why the two are kept apart: *"'the member asked for it to stop' and 'the budget ran
  out' are different facts, and collapsing them would put this item on the wrong side of its
  own doctrine two lines after stating it."* The same argument reaches this third case.
- **`mode-not-deployed`, which `harness.mjs`'s own header says a refused run "terminates on",
  is in NEITHER `RUN_ENDINGS` NOR `RUN_BOUNDS`.** It appears exactly once in the whole
  repository — in that comment. So the file documents a terminator the record has no word for
  and the code does not produce.

**Why it matters here rather than being a tidy-up.** SK-4's whole subject is that a deployment
gate refusing an investigate-mode launch must be legible AFTERWARDS. A run stopped by the gate
and a run stopped by a member are currently indistinguishable in the field that says why it
stopped — and the first is a fact about our sequencing while the second is a fact about a
person. This repository ranks a record that claims more than it can support as the worst defect
class; a refusal attributed to a member nobody can name is that shape, small.

**What is needed, and it is FLEET's call rather than this area's:** either add an ending to the
plane's `RUN_ENDINGS` vocabulary (which is `bio-plane/src/airun.mjs`, RECORD's path, so it is a
two-area change and probably an IC) and have `gate-mode` return it, or decide that `cancelled`
is right and correct the header comment that promises otherwise. **Either answer is fine; what
is not fine is the current state, where the comment and the code disagree and the code
misattributes.** ARM D5 pins BOTH facts and will go RED on the fix, which is deliberate — the
arm is to be updated in the same commit as the correction, and the finding then closes.
## CLAIM 2026-08-10 UI (UI-55 — DEC-69's enacted audit: the sweep for nagging, second-guessing and forced modes)
session: ui55-member-respect (worktree `agent-a7b57b507f367abe3`)
opened: 2026-08-10T00:00:00Z
released: 2026-08-10 by CONDUCT at integration — merged to `main` and verified on the MERGED tree, not on the branch's own: battery 164/164 · 10,115 assertions, `coverage --strict` exit 0 read unpiped, register floor 833/158/159. The holding session is complete.
paths: `civicos-ui/test/member-respect.test.mjs` (NEW — the sweep),
  `civicos-ui/test/member-respect.control.mjs` (NEW — the three-arm negative-control driver).
  **`civicos-ui/app.html` — named by SITE, not by file** (it is shared ground and other UI
  workers may be live). The sweep READS the whole file and, at the time of claiming, writes
  to NO region of it; if a finding is corrected in place the region is named in an AMENDMENT
  block below rather than by widening this line. **NOT** `__CATALOG__`, **NOT** `__SEMANTICS__`,
  **NOT** `__DOCPROFILE__`, **NOT** `__SURFACES_START__`/`__SURFACES_END__`, **NOT**
  `__VERSION_REVIEW_*__`, **NOT** `__NOTIFICATIONS_*__`, **NOT** `__AI_SESSION_*__`, **NOT**
  `__AI_CONNECTIONS_*__`, **NOT** `__ELICITATION__`, **NOT** the Add region UI-54 landed in
  (`renderAdd`, `addCaptureNote`, `addCapture`, `addGo`) — that region's grade note is one of
  the three things this item's over-strictness arm exists to keep GREEN, so it is read and
  never written.
  `docs/development/CLAIMS.md` (this entry), `docs/development/kickoffs/UI.md` (APPENDED, not
  rewritten — other UI workers are live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `bio-plane/**` (READ ONLY — `RUNGS`, `RUNG_ABSENT` and `RUNG_LADDER` are IMPORTED
  live from `bio-plane/src/affordances.mjs` and the op table is parsed from
  `bio-plane/src/index.mjs`, exactly as `surface-registry.test.mjs` already does; nothing
  under `bio-plane/` is written). **NOT** `docs/development/DECISIONS.md` (CONDUCT is its sole
  writer — DEC-69 is READ, at run time, as this sweep's authority).
  **NOT** any existing suite under `civicos-ui/test/` — no arm, floor or census in another
  worker's file is moved by this item.
## CLAIM 2026-08-10 FLEET (FL-7 — the mode gate's refusal gets a word that names a machine, not a member)
session: fl7-gate-ending (worktree `agent-a0301fcdabdaf43c6`)
opened: 2026-08-10T00:00:00Z
released: 2026-09-10 by CONDUCT at the wave boundary — the item is MERGED ON `main` and the holding session is gone. Verified on the MERGED tree rather than on the branch's own: battery 168/168 · 10,351 assertions, `coverage --strict` exit 0 read unpiped, `plancheck` 0 fail / 0 warn. **Released in a sweep rather than one at a time, because six had accumulated across two calendar months** — a claim reserves paths BETWEEN checkouts, so a dead session's claim blocks live work while protecting nothing, and a register that reads as six live claims when none exist is worse than one that reads empty.
paths: **NAMED BY REGION, NOT BY FILE, because CASE-1 is live on new schema work in
  `schema.mjs`/`store.mjs` and a file-level claim here would collide with it for no reason.**
  - `bio-plane/src/airun.mjs` — **the `RUN_ENDINGS` declaration ONLY** (one added key and its
    text, plus the reasoning comment above it). **NOT** `RUN_BOUNDS`, **NOT** `checkBound`,
    **NOT** `STANDARD_BASIS`, **NOT** `OBSERVATION_*`, **NOT** `stopBecause`'s ordering.
  - `agent-worker/src/harness.mjs` — **the `gate-mode` branch inside `nextStep` ONLY** (the
    `bound:` it closes on) and **the gate paragraph of the file header**. **NOT** the table,
    **NOT** `LEVELS`/`MODES`/`BUDGET_BOUNDS`, **NOT** any other row.
  - `agent-worker/test/harness.test.mjs` — **arm A6 ONLY** (the three assertions naming the
    gate's ending) plus a NEW two-way agreement arm. **NOT** A5's source pin, **NOT** any
    other arm, **NOT** the file's control declaration except to add this item's arms.
  - `agent-worker/test/harness.control.mjs` — **APPENDED arms only**; no existing arm edited.
  - `bio-plane/test/airun.test.mjs` — **ARM V6 ONLY** (the endings-set assertion). **NOT** V1-V5,
    **NOT** V7+.
  - `bio-plane/test/skillsequencing.test.mjs` — **ARMS D4 and D5 and the absent/nonsense-mode
    assertion above them ONLY** (SK-4's tripwire, corrected per its own instruction). **NOT**
    blocks A-C, **NOT** blocks E-G.
  - `bio-plane/test/airunclose-ending.test.mjs` (NEW — the through-the-op arm).
  - `docs/development/INTERFACE-CHANGES.md` (APPENDED — the IC for the added ending),
    `docs/development/CLAIMS.md` (this entry),
    `docs/development/MEASUREMENTS.md` (APPENDED).
  **NOT** `bio-plane/src/store.mjs` (READ ONLY — `#aiRunTerminate` already renders
  `RUN_ENDINGS[bound]` and needs no edit for a key to be added; CASE-1 is live in this file).
  **NOT** `bio-plane/src/schema.mjs` (untouched — this item adds no table and no column).
  **NOT** `bio-plane/src/skillpack.mjs` (READ ONLY — it publishes `endings: RUN_ENDINGS` by
  IMPORT, so the new term reaches the pack with no edit; that is the design working).
  **NOT** `civicos-ui/check-refusal-codes.mjs` (READ ONLY — its arm E harvests vocabularies BY
  SHAPE, so the new term is guarded the moment it lands, again with no edit).
  **NOT** `docs/development/DECISIONS.md` (CONDUCT is its sole writer).
  **NOT** `docs/development/QUEUE.md` (CONDUCT is its sole writer).
### AMENDMENT 2026-08-10 (same session, `fl7-gate-ending`) — one region added, one planned file dropped
`bio-plane/test/airun.test.mjs`: the claim above named **ARM V6 ONLY**. It now also covers
**ARM C/F** (the block headed *"the two endings that are not bounds"*). The reason is that the
block's subject IS this item: FL-7 makes it three endings, and the through-the-op arm the
`accepts-when` requires belongs beside `ARM C1`, which already drives `op=airunclose` with
`bound: "cancelled"` and asserts the plane accepts it. **The planned new suite
`bio-plane/test/airunclose-ending.test.mjs` is NOT created and is dropped from the claim** — it
would have booted a second miniflare to re-stage a fixture this block already has, and split
one subject across two files so that a later reader could correct one and miss the other.
Still **NOT** V1-V5, **NOT** V7+, **NOT** ARM B, R or X.
## DELEGATION 2026-08-10 FLEET -> SKILL (SK-4's finding is CLOSED; its kickoff still describes it as open)
raised by: `fl7-gate-ending` (worktree `agent-a0301fcdabdaf43c6`), landing FL-7.
**This is a NOTICE, not a request for work in this sprint, and nothing is blocked on it.**

`docs/development/kickoffs/SKILL.md` item 2 (around line 302) says the gate closes a refused
run with `bound: "cancelled"`, that `mode-not-deployed` *"exists nowhere but that comment"*, and
that **"ARM D5 will go RED on the fix, which is deliberate: it is to be updated in the same
commit as the correction."** **All three sentences are now historical.** FL-7 landed the
correction: `mode-not-deployed` is the plane's third `RUN_ENDINGS` term (IC-62), `gate-mode`
closes on it, and **ARM D5 was corrected in the same commit with a dated block recording what it
asserted before and why that was right when written** — exactly as SK-4 instructed, and NOT
exempted.

FLEET did not edit `kickoffs/SKILL.md`: it is SKILL's path and this is a two-area change
already. **What SKILL may want to do at its next turn is re-word that item in the past tense**,
because a kickoff that describes a closed defect as open is the class this project keeps
paying for — a reader who trusts it will re-raise a settled finding. The prediction in the
kickoff was CORRECT and is worth keeping as a receipt; only its tense is wrong.

SK-4's judgement is worth recording as vindicated rather than merely superseded: it could not
fix the defect (two areas), so it chose an arm that would go red over a note that would rot, and
the arm is what carried the finding intact to the area that could close it.

## CLAIM 2026-08-10 RECORD (CASE-1 — DEC-72's case OBJECT: identity owned by a project, membership by version and role, editions per case)
session: case1-case-object (worktree `agent-a1af1f1e654822176`)
opened: 2026-08-10T00:00:00Z
released: 2026-09-10 by CONDUCT at the wave boundary — the item is MERGED ON `main` and the holding session is gone. Verified on the MERGED tree rather than on the branch's own: battery 168/168 · 10,351 assertions, `coverage --strict` exit 0 read unpiped, `plancheck` 0 fail / 0 warn. **Released in a sweep rather than one at a time, because six had accumulated across two calendar months** — a claim reserves paths BETWEEN checkouts, so a dead session's claim blocks live work while protecting nothing, and a register that reads as six live claims when none exist is worse than one that reads empty.
paths: **`bio-plane/src/schema.mjs` — named by REGION, not by file.** (1) ONE NEW TABLE,
  `cases`, inserted immediately AFTER the `published_case_members_bundle` index and BEFORE the
  `monitor_fired` comment block — i.e. beside the two tables it is the identity for, and far
  from `host_governor` (the trap `hygiene.test.mjs` enforces). **Placed beside its siblings
  rather than appended at the end of the file deliberately: appending is where every other
  concurrent schema addition also lands, so the tail of this file is the one region two
  workers reliably collide in.** (2) TWO ADDITIVE NULLABLE
  COLUMNS on `published_case_members` — `version_sha` and `role` — plus the comment block
  above that table. **NOT** the `host_governor` block, **NOT** `published_cases`,
  **NOT** `published_bundles`, **NOT** `published_shas`, **NOT** the capture/link/task/
  reachability tables (CAPTURE's), **NOT** any other table.
  **`bio-plane/src/store.mjs` — named by SITE, not by file** (it is 26,201 lines of shared
  ground and other RECORD workers may be live): (1) TWO ROWS APPENDED to the additive
  `ALTER TABLE … ADD COLUMN` ladder inside `#migrate()`, after the
  `["capture_requests", "run_woken_at", "TEXT"]` row and before the closing `]`; (2) the
  `publishedManifest()` `cases:` and `caseMembers:` SELECTs and the `altitudes` sentence
  beside them — the `op=export` answer only; (3) NOTHING in `purge()` (`cases` takes an
  EXEMPTION beside its two published siblings rather than a DELETE, reasoned at the site).
  **NOT** `publishCase()`, **NOT** `publish()`/the ratify committer, **NOT**
  `#caseEditionState()`, **NOT** `publishedCase()`, **NOT** `#requiredStrengthFor` — all of
  those are CASE-2/CASE-3/CASE-5 ground and this item does not touch them. **NOT** `#routeTask`,
  **NOT** the run/ending surfaces (`ai_runs`, `airun.mjs`) — **FL-7 is live on run endings and
  this claim names no file, region or table it can reach.**
  `bio-plane/test/caseobject.test.mjs` (NEW), `bio-plane/test/caseobject.control.mjs` (NEW —
  the negative-control driver, committed so the arms re-run in one step).
  `bio-plane/test/hygiene.test.mjs` — ONE key added to the `EXEMPT` map (`cases`) with its
  one-line reason, and the comment block above it. **No other arm, floor or census moved.**
  `docs/development/INTERFACE-CHANGES.md` (IC-63, APPENDED — the file is append-only),
  `docs/development/CLAIMS.md` (this entry),
  `docs/development/kickoffs/RECORD.md` (APPENDED, never rewritten — other RECORD workers
  may be live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `docs/development/QUEUE.md` (CONDUCT is sole writer), **NOT**
  `docs/development/DECISIONS.md` (CONDUCT is sole writer), **NOT**
  `docs/development/CASE-AS-PRODUCTION.md` (the authority, READ ONLY), **NOT** `civicos-ui/**`,
  **NOT** `newgroup/**` (`newgroup/src/release.mjs` carries a BUILT COPY of the plane source
  and is regenerated by DIST, never edited here), **NOT** `bio-plane/checks/**`, **NOT**
  `release/**`, **NOT** `bio-plane/dist/**`.

## CLAIM 2026-08-10 RECORD (CASE-3 — DEC-72 clause 3: version pinning; the member frozen by hash, and an edit to a published finding MINTING rather than mutating)
session: case3-version-pinning (worktree `agent-a36b6782b06f5a651`)
opened: 2026-08-10T00:00:00Z
released: 2026-09-10 by CONDUCT at the wave boundary — the item is MERGED ON `main` and the holding session is gone. Verified on the MERGED tree rather than on the branch's own: battery 168/168 · 10,351 assertions, `coverage --strict` exit 0 read unpiped, `plancheck` 0 fail / 0 warn. **Released in a sweep rather than one at a time, because six had accumulated across two calendar months** — a claim reserves paths BETWEEN checkouts, so a dead session's claim blocks live work while protecting nothing, and a register that reads as six live claims when none exist is worse than one that reads empty.
paths: **NAMED BY REGION, NOT BY FILE — CASE-2 IS LIVE ON `publishCase` AND THE BAR, AND THE
  QUEUE'S CASE HEADER SAYS IN TERMS THAT TWO WORKERS ON RECORD'S GROUND ARE PROTECTED ONLY BY
  PRECISION.** The split this claim runs on is not my construction: CASE-1 wrote it into the
  code it landed — `op=export`'s `caseMembers` comment says the two columns are *"null until
  CASE-2 authors a role and CASE-3 pins a version"*. **So `role` IS CASE-2's AND `version_sha`
  IS MINE, and this claim touches no statement that writes, reads or refuses on `role`.**
  **`bio-plane/src/store.mjs` — named by SITE:**
  (1) `publish()` (the ratify committer), INSIDE the existing `if (caseId) { … }` block and
  AFTER the roster insert/divergence branch: ONE read and ONE conditional `UPDATE … SET
  version_sha`, plus the comment above them. **NOT** the `published_cases` insert, **NOT**
  `CASE_ASSERTION_DIVERGED`, **NOT** `CASE_MEMBERSHIP_DIVERGED`, **NOT**
  `CASE_ROSTER_EXCLUDES_SELF`, **NOT** the `published_bundles` / `published_shas` inserts,
  **NOT** the `EDITION_EXISTS` / `EDITION_NOT_INCREMENTED` refusals, **NOT** `role`.
  (2) `#moveVersionState()`: ONE refusal arm (`PUBLISHED_CANNOT_MOVE_VERSION`) placed after the
  bundle row is read and before the reason guard, plus its comment. **NOT** `suggestVersion()`,
  **NOT** `versionStrength()`, **NOT** `basisVersions()`, **NOT** the affirmation block, **NOT**
  the cycle check, **NOT** the make-current project write.
  (3) `#caseEditionState()`: ONE field (`version_sha`) added to each entry the member loop
  pushes, and the SELECT it comes from. **NOT** the resolution predicate itself — resolving a
  member BY THE PIN instead of by the CASE'S edition number is the conflation CASE-1's schema
  comment hands to **the artifact flip, which is CASE-5**, and this item deliberately leaves it
  where the authority put it.
  **NOT** `publishCase()` — CASE-2's, whole. **NOT** `publishedCase()` — CASE-5's.
  **NOT** `#requiredStrengthFor` (CASE-2 removes DEC-17's composition there). **NOT** `purge()`
  (no new table). **NOT** `promote()`. **NOT** the run/task/capture/link surfaces.
  **`bio-plane/src/schema.mjs` — NOTHING. NO EDIT AT ALL**, and it is worth naming as a
  deliberate outcome rather than an omission: CASE-1 already added `version_sha`, so this item
  needs no column, no table and no `#migrate` row — which also means it cannot collide with
  CASE-2 in the file two concurrent schema changes would otherwise both land in.
  `bio-plane/checks/bio-checks.mjs` — ONE ROW appended to the EXISTING `VERSION_ACT_CHECKS`
  object (`PUBLISHED_CANNOT_MOVE_VERSION`, C-25.34) and its comment. **NO NEW `*_CHECKS`
  FAMILY** — C-22's header charges a new family as a floor that buys slack for everybody else's
  walk, and this row deliberately avoids that tax. **NOT** any other family, **NOT** the
  C-number allocation prose elsewhere in the file.
  `civicos-ui/check-refusal-codes.mjs` — the `FLOOR` figures ONLY, moved to what this file's
  OWN GREEN RUN PRINTS (never by adding one), per the C-25.32 precedent recorded on the `rows`
  key. **NOT** the walk, **NOT** the arms.
  `bio-plane/test/casepin.test.mjs` (NEW), `bio-plane/test/casepin.control.mjs` (NEW — the
  negative-control driver, committed so the arms re-run in one step).
  `docs/development/INTERFACE-CHANGES.md` (APPEND-ONLY — the IC),
  `docs/development/CLAIMS.md` (this entry),
  `docs/development/kickoffs/RECORD.md` (APPENDED, never rewritten — other RECORD workers are
  live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `docs/development/QUEUE.md` and **NOT** `docs/development/DECISIONS.md` (CONDUCT is
  sole writer of both), **NOT** `docs/development/CASE-AS-PRODUCTION.md` (the authority, READ
  ONLY), **NOT** `civicos-ui/**`
  beyond the FLOOR figures, **NOT** `newgroup/**` (carries a BUILT COPY DIST regenerates),
  **NOT** `release/**`, **NOT** `bio-plane/dist/**`.

**AMENDED 2026-08-10, MID-ITEM, AND THE AMENDMENT IS THE HONEST PART: THIS CLAIM ORIGINALLY
SAID "NOT `bio-plane/test/caseobject.*`" AND THE ITEM HAD TO EDIT IT.** The full battery came
back 164/166 exit 2, and both failures were SUPERSEDED ASSERTIONS in suites this claim had
excluded — the standing rule is *correct superseded tests, never exempt them*, so the fix was
to correct them and widen the claim rather than to route around them. **Neither suite has a
live worker: CASE-1 is `done` and merged on `main`, and `versionstate` is PL-2's, landed.** Two
files, each by REGION:
  `bio-plane/test/caseobject.test.mjs` — ONE assertion split into two (the `role` half keeps its
  original wording because that half has NOT moved; the `version_sha` half now asserts the PIN,
  against the sha fed to `ssh-keygen` rather than the column), plus one hoisted `SIGNED_SHA`
  binding and one line capturing it at the existing ratification. **NOT** its blocks 1 or 3,
  **NOT** `caseobject.control.mjs` (re-run unchanged; all five arms still red, baseline 18/0).
  `bio-plane/test/versionstate.test.mjs` — the DEC-49 block only: one fixture that takes a
  finding through `op=conclude` and `op=publish` so C-25.34 is DRIVEN rather than typed, and one
  entry added to the pinned C-number map IN ITS SORTED POSITION. **NOT** any other block.
  **That suite's registry-equality arm is what caught the omission** — it is a FLOOR as well as
  a ceiling, so adding a row to `VERSION_ACT_CHECKS` turned it red immediately, which is the arm
  working rather than an obstacle.
## CLAIM 2026-08-10 RECORD (CASE-2 — DEC-72's publication as the PROJECT'S PRODUCTION: the owner fence, the project's bar at act time, the authored load-bearing partition)
session: case2-publication-production (worktree `agent-a819c7ac95b78cff1`, branch
  `worktree-agent-a819c7ac95b78cff1`)
opened: 2026-08-10T00:00:00Z
released: 2026-09-10 by CONDUCT at the wave boundary — the item is MERGED ON `main` and the holding session is gone. Verified on the MERGED tree rather than on the branch's own: battery 168/168 · 10,351 assertions, `coverage --strict` exit 0 read unpiped, `plancheck` 0 fail / 0 warn. **Released in a sweep rather than one at a time, because six had accumulated across two calendar months** — a claim reserves paths BETWEEN checkouts, so a dead session's claim blocks live work while protecting nothing, and a register that reads as six live claims when none exist is worse than one that reads empty.
paths: **NAMED BY REGION AND BY SITE, NEVER BY FILE — and the precision is the point rather
  than a courtesy. A CASE-3 worker is LIVE on version pinning and lands on the same
  neighbourhood; one line below is genuinely shared and is NAMED AS SHARED rather than
  claimed, so CONDUCT can see the collision before the merge does.**

  **`bio-plane/src/store.mjs` — by SITE** (26,254 lines of shared ground):
  - `publishCase()` — **the whole method, and it is this item's subject.** New authority
    fences (`NO_PUBLISHING_PROJECT`, `NO_SUCH_PROJECT`, `NOT_A_PROJECT`,
    `NOT_THE_PROJECT_OWNER`), the authored role partition (`NO_MEMBER_ROLE`,
    `BAD_MEMBER_ROLE`, `NO_LOAD_BEARING_MEMBER`), the case↔project binding refusal
    (`CASE_BELONGS_TO_ANOTHER_PROJECT`), the bar read ONCE from the publishing project and
    compared per LOAD-BEARING member (`BELOW_PROJECT_STRENGTH`), and two new frontmatter
    writes (`case_project`, `case_roles`).
  - `#requiredStrengthFor()` — **REMOVED IN FULL** (DEC-72 supersession table, verbatim:
    *"DEC-17's strictest-across-citers composition (`#requiredStrengthFor` …) — Removed"*).
    A new `#projectBar()` takes its place at the same site.
  - `strengthBarOf()` — the whole method. The `target=` arm is REPLACED by a named refusal;
    a `project=` arm is added; the `group=` arm is UNCHANGED (DEC-17's surviving half).
  - `publish()` — **the ratify committer, and ONLY the `if (caseId) { … }` block inside it**:
    the new `cases` INSERT, the new `CASE_ROLES_DIVERGED` / `CASE_PRODUCTION_DIVERGED`
    refusals, and **the `published_case_members` INSERT's COLUMN LIST — WHICH IS SHARED
    GROUND WITH CASE-3 AND IS DECLARED AS SUCH.** CASE-2 adds `role`; CASE-3 adds
    `version_sha`; they are the same statement and the same `roster.forEach` line. Neither
    item can avoid it — the two columns were added by CASE-1 in one commit precisely so both
    would be written. **NOT** the edition arithmetic above that block, **NOT** the
    `published_bundles` INSERT, **NOT** `published_shas`, **NOT** `#publishEdges`, **NOT**
    the case-completeness state read below it.
  - the DO dispatch map — **the `publishcase:` and `strengthbarof:` lines ONLY** (two search
    params added). **NOT** `strengthbar:`, **NOT** any other row of that map.
  **NOT** `#migrate()`, **NOT** `purge()` (**and the reason is load-bearing rather than
  incidental: this item deliberately writes NO row to `cases` at publish time. The `cases`
  row is written by the RATIFY committer out of the SIGNED bytes, which is `published_cases`'
  own doctrine — so CASE-1's stated purge exemption, whose reversal condition was *"if a
  later item lets a case exist as a DRAFT before publication, revisit"*, is NOT triggered by
  this item and is left exactly as CASE-1 wrote it**), **NOT** `publishedManifest()`,
  **NOT** `#caseEditionState()`, **NOT** `publishedCase()`, **NOT** `strengthOf()` (READ
  ONLY — the derived pair is consumed, never re-derived), **NOT** `strengthBarSet()`,
  **NOT** `#routeTask()`, **NOT** `restingOn()`, **NOT** `#refEdgeSevered()` (READ ONLY —
  D-280's OTHER two sites keep it and are untouched), **NOT** `#bundleRedactor()`, **NOT**
  the run/ending surfaces, **NOT** `allocId`.

  **`bio-plane/src/schema.mjs` — NOT TOUCHED AT ALL.** This item adds no table and no column:
  CASE-1 already built `cases`, `published_case_members.role` and `published_case_members.version_sha`.
  **That is deliberate and it is what keeps this claim disjoint from CASE-3's on the file the
  sequencing note warned about.**

  **`bio-plane/src/index.mjs` — by REGION:** the ratify block's read of the RATIFIED BYTES
  (the `caseId` / `caseFindings` / `caseScope` / `caseBiasAck` paragraph) gains `caseRoles`
  and `caseProject`, and the `http://do/publish` argument object gains the same two keys, plus
  the two new 409 refusal names in the status map beside `CASE_MEMBERSHIP_DIVERGED`.
  **NOT** the op table, **NOT** `DO_PATH`, **NOT** the viewer/author stamps, **NOT** the
  container assembly, **NOT** `pubBarHtml`'s producer fields beyond the added `project`.

  **`bio-plane/checks/bio-checks.mjs` — by REGION:** `checkInquiryPublished`'s C-2.8 block
  ONLY — the `case_findings` / `required_strength` paragraph gains `case_roles` (required on
  `published`, a partition covering exactly the roster, values from the schema's own two-term
  vocabulary). **NOT** `STATES`, **NOT** `checkCompletenessFreshness`, **NOT**
  `checkInquiryBasis`, **NOT** the bias-kind sweep, **NOT** any other C-number.

  **Tests — CORRECTED, NEVER EXEMPTED, and each named by ARM:**
  - `bio-plane/test/caseproduction.test.mjs` (NEW — the item's own suite),
    `bio-plane/test/caseproduction.control.mjs` (NEW — the negative-control driver, committed
    so the arms re-run in one step).
  - `bio-plane/test/publish.test.mjs` — the ceremony fixtures gain a publishing project, an
    owner and a role partition; **section 4 (DEC-17's declared bar) is CORRECTED to the
    project-alone read** with a dated block saying what it asserted before and why that was
    right when written. No other section's subject moved.
  - `bio-plane/test/d280-strengthbar.test.mjs` — **the suite whose SUBJECT DEC-72 dissolved.**
    Corrected in place with the supersession stated at the head: the composed read is gone, so
    the arms that measured it now measure that it is gone. **Not deleted and not exempted** —
    D-280's measurements are the record of what the old model did.
  - `bio-plane/test/gate-reads.test.mjs` — **the `op=strengthbarof` arms ONLY** (REC-30's
    `projects[]` leak sweep, whose exposure DISSOLVES with the cross-citer walk). **NOT** the
    `op=dangling` arms, **NOT** the impostor arms, **NOT** any other op's block.
  - `bio-plane/test/d216-sharing.probe.mjs` — **the two `op=strengthbarof&target=` calls ONLY.**
  - `bio-plane/test/publishedcase.test.mjs`, `bio-plane/test/hygiene.test.mjs` — touched only
    if this item's change makes an existing assertion false, each with a dated reason at the
    assertion. **No floor, census or ratchet moved without naming the arrival.**
  `docs/development/INTERFACE-CHANGES.md` (IC-64, APPENDED — the file is append-only),
  `docs/development/CLAIMS.md` (this entry),
  `docs/development/kickoffs/RECORD.md` (APPENDED, never rewritten — other RECORD workers are
  live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `docs/development/QUEUE.md` (CONDUCT is sole writer), **NOT**
  `docs/development/DECISIONS.md` (CONDUCT is sole writer), **NOT**
  `docs/development/CASE-AS-PRODUCTION.md` (the authority, READ ONLY — CASE-6 archives it),
  **NOT** `docs/BIO_DATAPLANE_STATE.md` (the arc's definition of done binds it to CASE-6),
  **NOT** `civicos-ui/**` (READ ONLY — measured for the IC and found to consume none of the
  moving fields), **NOT** `newgroup/**`, **NOT** `release/**`, **NOT** `bio-plane/dist/**`,
  **NOT** `bio-plane/scripts/coverage.mjs` (**if `REGISTER_FLOOR` has to move, it goes in an
  AMENDMENT block below and is reported to CONDUCT by name** — CONDUCT re-derives it from the
  merged run).
## CLAIM 2026-09-10 FLEET (FL-8 — a launch the gate refused did not FINISH; the STATUS gets a word for a run that never started)
session: fl8-run-status (worktree `agent-a50bd4cc90737bcaf`)
opened: 2026-09-10T00:00:00Z
released: 2026-09-10 by CONDUCT at the wave boundary — the item is MERGED ON `main` and the holding session is gone. Verified on the MERGED tree rather than on the branch's own: battery 168/168 · 10,351 assertions, `coverage --strict` exit 0 read unpiped, `plancheck` 0 fail / 0 warn. **Released in a sweep rather than one at a time, because six had accumulated across two calendar months** — a claim reserves paths BETWEEN checkouts, so a dead session's claim blocks live work while protecting nothing, and a register that reads as six live claims when none exist is worse than one that reads empty.
paths: **NAMED BY REGION, NOT BY FILE. A CASE-5 worker is live on the PUBLISHED-ARTIFACT path
  (`published_cases`, the manifest/ratify surfaces) in `store.mjs` and `index.mjs`; this item's
  neighbourhood in that file is the AI-RUN family — `#aiRunTerminate` and nothing else — and the
  two do not touch. Named precisely rather than by file so the disjointness is checkable.**
  - `bio-plane/src/airun.mjs` — **the `RUN_STATUS` declaration and the keying function beside it
    ONLY** (one added status term, one added classification set, one added exported function, and
    the reasoning comment above them). **NOT** `RUN_BOUNDS`, **NOT** `RUN_ENDINGS` (READ ONLY —
    FL-7's three terms are unchanged and this item adds none), **NOT** `checkBound`, **NOT**
    `checkCondition`, **NOT** `checkObservation`, **NOT** `finishedBound`, **NOT**
    `STANDARD_BASIS`, **NOT** `OBSERVATION_*`, **NOT** `projectGate`.
  - `bio-plane/src/store.mjs` — **the TWO status expressions inside `#aiRunTerminate` ONLY**
    (`stoppedByBound ? "stopped" : "finished"`, at the `UPDATE` and at the returned object), plus
    the reasoning comment above them. **NOT** the terminal-entry append, **NOT**
    `#aiRunSearchState`, **NOT** `aiRunOpen`/`aiRunTick`/`#aiRunReap`/`aiRunClose`, **NOT**
    `aiRunRead`, **NOT** `aiRunsInContext`, **NOT** the wake/reap SQL, **NOT** `#bundleGate`,
    **NOT** anything in the published-case, manifest or ratify families (CASE-5's neighbourhood),
    **NOT** any other region of the file.
  - `bio-plane/test/airun.test.mjs` — **ARM V (one added assertion), the ARM C/F/G block (added
    status arms) and the file's NEGATIVE CONTROL header ONLY.** **NOT** ARM B, D, K, L, R, S, U or X.
  - `agent-worker/test/harness.test.mjs` — **the PLANE MOCK's `airunclose` branch ONLY** (the
    hand-written copy of the plane's status keying, which is measurably WRONG today) and its
    interpolated declaration at the top of the mock, plus ONE added assertion in B7. **NOT** the
    mock's other op branches, **NOT** arms A1-A6b, **NOT** B1-B6, B8+, **NOT** the source pins.
  - `agent-worker/test/harness.control.mjs` — **APPENDED arms only**; no existing arm edited.
  - `docs/development/INTERFACE-CHANGES.md` (IC-67, APPENDED — the file is append-only, and the id
    is **PRE-ALLOCATED BY CONDUCT**, not minted here: two parallel workers each minted `IC-64` on
    2026-08-10 because `mintid` derives its floor from ids mentioned in prose and neither branch
    could see the other's file),
    `docs/development/CLAIMS.md` (this entry),
    `docs/development/MEASUREMENTS.md` (APPENDED).
  **NOT** `bio-plane/src/schema.mjs` (untouched — `ai_runs.status` is a TEXT column with no CHECK
  constraint and no enum; this item adds no table, no column and no migration).
  **NOT** `bio-plane/src/index.mjs` (READ ONLY — the op table is unchanged and no op is added).
  **NOT** `bio-plane/src/skillpack.mjs` (READ ONLY — the pack publishes `bounds` and `endings` and
  has never published `RUN_STATUS`; measured, not assumed).
  **NOT** `bio-plane/checks/bio-checks.mjs` (READ ONLY — no C-number moves; the status is DERIVED
  from a bound C-22.5 has already admitted, so there is nothing new to refuse).
  **NOT** `civicos-ui/**` (READ ONLY — measured for the IC: three files read `RUN_STATUS` and all
  three DERIVE from `Object.keys`, and the one CSS selector pins `running`, which does not move).
  **NOT** `agent-worker/src/harness.mjs` (READ ONLY — the gate already closes on the right ENDING;
  a fleet member does not decide a status and this item gives it nothing to emit).
  **NOT** `bio-plane/test/skillsequencing.test.mjs` (READ ONLY — ARMS D4/D5 assert the ENDING and
  no status; measured before claiming).
  **NOT** `bio-plane/test/scheduler.test.mjs` (READ ONLY — its `stopped` assertion is a LEASE
  lapse, which stays `stopped`).
  **NOT** `docs/development/QUEUE.md` (CONDUCT is its sole writer).
  **NOT** `docs/development/DECISIONS.md` (CONDUCT is its sole writer).
  **NOT** `newgroup/**`, **NOT** `release/**` (built artifacts DIST regenerates).
  **NOT** `bio-plane/scripts/coverage.mjs` (**if `REGISTER_FLOOR` has to move it goes in an
  AMENDMENT block below and is reported to CONDUCT by name**).

## CLAIM 2026-09-10 RECORD (CASE-5 — DEC-72's ARTIFACT FLIP: case-side freezing, a member resolved BY ITS PIN, and the stranger-verification property preserved case-side)
session: case5-artifact-flip (worktree `agent-a279f7840e26862b0`, branch
  `worktree-agent-a279f7840e26862b0`)
opened: 2026-09-10T00:00:00Z
released: 2026-09-10 by CONDUCT at the wave boundary — the item is MERGED ON `main` and the holding session is gone. Verified on the MERGED tree rather than on the branch's own: battery 168/168 · 10,351 assertions, `coverage --strict` exit 0 read unpiped, `plancheck` 0 fail / 0 warn. **Released in a sweep rather than one at a time, because six had accumulated across two calendar months** — a claim reserves paths BETWEEN checkouts, so a dead session's claim blocks live work while protecting nothing, and a register that reads as six live claims when none exist is worse than one that reads empty.
paths: **NAMED BY REGION, AND AN FL-8 WORKER IS LIVE ON `airun.mjs` / `RUN_STATUS`** — a
  different neighbourhood entirely, but the CASE header's rule is that precision is the only
  protection two workers on RECORD's ground get, so the regions are named anyway.
  **`bio-plane/src/store.mjs` — named by SITE:**
  (1) `publishCase()`: the EDITION allocation only — the member's `edition:` stamp becomes the
  MEMBER'S OWN next edition and a new `case_edition:` scalar carries the CASE's. **NOT** the
  project fence, **NOT** the owner fence, **NOT** the bar computation, **NOT** the roles
  partition, **NOT** the C-21.1 freshness comparison, **NOT** the case-identity resolution.
  (2) `publish()` (the ratify committer): the `caseEdition` parameter and the split between the
  MEMBER's `ed` (published_bundles, EDITION_EXISTS, EDITION_NOT_INCREMENTED) and the CASE's
  `cEd` (published_cases, published_case_members, the pin UPDATE, #caseEditionState); plus ONE
  new refusal `CASE_NAMES_NO_EDITION` and the case-level `bar` commit beside the existing
  `CASE_ASSERTION_DIVERGED` arm. **NOT** the roles divergence arms, **NOT** `#publishEdges`,
  **NOT** `published_shas`.
  (3) `#caseEditionState()`: the member RESOLUTION PREDICATE — by `version_sha` rather than by
  the CASE's edition number. This is the statement CASE-3's claim deliberately left here for
  CASE-5, in those words.
  (4) `#caseOf()` and a new `#caseOfSha()`: pin-based membership resolution, and its callers in
  `publishedList()`, `publishedEditions()`, `publishedCase()`, `publishedRegistryFor()`.
  (5) `publishedCase()` and `publishedManifest()`: the case artifact's fields.
  **NOT** `purge()` (no new table — a COLUMN on an existing published table), **NOT**
  `promote()`, **NOT** `#moveVersionState()` (CASE-3's, landed), **NOT** the run / task /
  capture / link / proposal surfaces.
  **`bio-plane/src/schema.mjs`** — ONE COLUMN (`bar TEXT`) on the EXISTING `published_cases`
  table and its comment. No new table, so **`purge` is untouched** and D-113 does not bite.
  New text goes nowhere near the `host_governor` block and carries **no semicolon inside any
  `--` comment**.
  **`bio-plane/src/index.mjs`** — `op=ratify`'s ratified-frontmatter reader ONLY: `caseEdition`
  and `caseBar` read out of the signed bytes beside the fields already there, and the CASE
  CONTAINER manifest assembly (`bio-case-container/3` -> `/4`). **NOT** the R2 copy, **NOT** the
  reuse re-check, **NOT** the gate, **NOT** any other op.
  **`bio-plane/checks/bio-checks.mjs`** — `checkInquiryPublished`'s C-2.8 block ONLY: the
  `case_edition` requirement added beside `case_scope`/`case_project`/`case_roles`. **NOT**
  `STATES`, **NOT** `checkCompletenessFreshness`, **NOT** `checkInquiryBasis`, **NOT**
  `VERSION_ACT_CHECKS`, **NOT** any other C-number.
  **Tests — CORRECTED, NEVER EXEMPTED:**
  - `bio-plane/test/caseflip.test.mjs` (NEW — the item's own suite),
    `bio-plane/test/caseflip.control.mjs` (NEW — the negative-control driver, committed so the
    arms re-run in one step).
  - `bio-plane/test/publishedcase.test.mjs`, `bio-plane/test/casepin.test.mjs`,
    `bio-plane/test/caseobject.test.mjs`, `bio-plane/test/caseproduction.test.mjs`,
    `bio-plane/test/publish.test.mjs`, `bio-plane/test/doorbell.test.mjs`,
    `bio-plane/test/hygiene.test.mjs` — touched ONLY where this item's change makes an existing
    assertion false, each with a dated reason at the assertion saying what it asserted before
    and why that was right when written. **No floor, census or ratchet moved without naming the
    arrival.**
  `docs/development/INTERFACE-CHANGES.md` (IC-66, APPENDED — the file is append-only),
  `docs/development/CLAIMS.md` (this entry),
  `docs/development/kickoffs/RECORD.md` (APPENDED, never rewritten — other RECORD workers are
  live), `docs/development/MEASUREMENTS.md` (appended).
  **NOT** `docs/development/QUEUE.md` (CONDUCT is sole writer), **NOT**
  `docs/development/DECISIONS.md` (CONDUCT is sole writer), **NOT**
  `docs/development/CASE-AS-PRODUCTION.md` (the authority, READ ONLY — CASE-6 archives it),
  **NOT** `docs/BIO_DATAPLANE_STATE.md` (**the arc binds it to CASE-6's `accepts-when`**),
  **NOT** `bio-plane/src/airun.mjs` and **NOT** `RUN_STATUS` (FL-8 is live there),
  **NOT** `civicos-ui/**`, **NOT** `newgroup/**`, **NOT** `release/**`, **NOT**
  `bio-plane/dist/**`, **NOT** `bio-plane/scripts/coverage.mjs` (**if `REGISTER_FLOOR` has to
  move it goes in an AMENDMENT block below and is reported to CONDUCT by name**).

### DELEGATION 2026-09-10 RECORD (CASE-5) -> UI: **THE PUBLIC INDEX JOINS A CASE MEMBER TO ITS RATIFIED ROW ON AN EQUALITY THAT IS NO LONGER TRUE, AND IT LOSES ROWS SILENTLY**

**What changed, and it is not a field moving.** No key is removed from any op and no key
changes type. What moved is a GUARANTEE: `caseMembers[].edition` is the CASE's edition and
`published[].edition` is the FINDING's own, and since DEC-72's artifact flip those are no
longer forced to be the same number. A finding joining a case at that case's edition 2,
having published once before, sits at its OWN edition 1 inside the case's edition 2.

**Where it bites, measured 2026-09-10 by grep over `civicos-ui/`, `newgroup/`, `docprofile/`,
`pdf-worker/`, `tools/`, `agent-worker/` and `release/`, built copies excluded. ONE file, ONE
function, THREE lines** — `civicos-ui/app.html`, `pubIndex`, around 15673 / 15680 / 15701:

    inCase  = new Set(members.map((m) => m.bundle_id + "@" + m.edition))
    waiting = roster.filter((m) => !byId.has(m.bundle_id + "@" + cs.edition))
    row     = byId.get(m.bundle_id + "@" + cs.edition)

`byId` is keyed on the FINDING's own edition; all three look it up under the CASE's. For a
member whose editions differ the lookup misses, and **it misses silently**: the member renders
as AWAITING RATIFICATION forever, its frozen pair and its bar render blank, and its ratified
row also appears a second time in the not-in-any-case list below. Nothing errors.

**The fix is one line each and needs no new data.** IC-63 already publishes
`caseMembers[].version_sha` and `published[].bundle_sha`, so the join is PIN TO SHA:

    byShaKey = new Map(pub.map((p) => [p.bundle_sha, p]))   // instead of id@edition
    row      = byShaKey.get(m.version_sha)

`op=publishedmanifest`'s `production` sentence now states this rule in the answer itself, so
the page can be written against the contract rather than against this note. A roster row with
a NULL `version_sha` is a pre-CASE-3 row and keeps the old join honestly — for those rows the
two numbers ARE equal, which is the model they were written under.

**Also newly available on surfaces UI already reads, and CASE-6 will want all of them:**
`op=publishedcase`'s `findings[]` gain `edition` (the member's own) and `role`
(`load_bearing` | `supporting`), and the answer gains `project`, `bar` and `bar_detail` — the
case's producing project and the standard of evidence it was held to, as CASE properties
rather than as one member's stamped copy. `bar: null` is the design's absent-bar posture and
must never render as a bar of zero; `bar_detail` carries that sentence in the answer.

**Not urgent in the shipped record and that is stated rather than implied:** no case in any
live store can have diverged yet, because nothing before this commit could produce one. The
first diverged case will be the first one a member adds a new finding to at a later edition.

### AMENDMENT 2026-09-10, MID-ITEM (CASE-5, `case5-artifact-flip`) — one file added to the claim, and the honest reason is that a UI RATCHET CAUGHT THIS ITEM

This claim said **NOT `civicos-ui/**`** and the item had to edit one file inside it.
`civicos-ui/test/publishedcase.test.mjs`'s UI-35 arm asserts that **every top-level key
`op=publishedcase` publishes is either READ by the surface or NAMED as unread with a
reason** — and it went red naming `bar` and `bar_detail`, the two keys this item adds.

**That is the ratchet working, not an obstacle**, and it is the same shape CASE-3 recorded
when it had to widen into `caseobject.test.mjs`: the standing rule is *correct superseded
tests, never exempt them*, so the fix is to name the two fields with the reason they are
unread and widen the claim, never to route around the arm. **The register GREW by two,
which is exactly the movement UI-35's arm (d) was built to detect.**

  `civicos-ui/test/publishedcase.test.mjs` — the `UNREAD` map in block 16 ONLY: two entries
  added, each stating that it is a SURFACE GAP rather than an unconsumed publication and
  naming CASE-6 as the row that owns the reader. **NOT** the arm, **NOT** the walk, **NOT**
  any other block, **NOT** `civicos-ui/app.html` (CASE-6's, and the DELEGATION above is how
  it is told). No floor moved.

**No live worker holds `civicos-ui/test/publishedcase.test.mjs`:** UI-55 is the newest UI
claim on this register and names DEC-69's nagging audit, not this file.

### DELEGATION 2026-09-10 DIST (DS-1) -> FLEET: **AN INSTALLABLE FLEET NEEDS THE BUILD STEP YOU DELIBERATELY DEFERRED, AND I AM NOT REVERSING YOUR RULING INSIDE A DIST COMMIT**

**MEASURED 2026-09-10, and the deploy half is already closed so this is the only thing left in DS-1.**
`tools/deploy-fleet.mjs` now templates every service target from the instance slug, and `agent-worker`
IS DEPLOYED: the account reads back `service PLANE -> biosmoke7` and it serves
`{"ok":true,"name":"agent-worker","version":"0.1.0"}`. The fleet is fully up for the first time —
agent-worker, biosmoke7, civicos, newgroup, pdf-worker. D-292's deploy half is closed. **The INSTALLER
half is not, and it cannot be closed by DIST alone.**

- **YOUR RULING, WHICH I READ ONLY AFTER I HAD BROKEN IT.** `agent-worker/wrangler.jsonc` at `main`
  says *"The SOURCE deploys, not a bundle"*, because a committed bundle is *"a second place its version
  lives and a committed artifact that can drift from its source (D-106's class)"*, and it names its own
  reversal condition: *"FL-3 adds the build step in the turn it adds the first dependency."* I had
  already copied `pdf-worker/scripts/build.mjs` into `agent-worker` and had it working — 48,392 bytes,
  `node --check` clean, your 113 assertions green — before reading six lines up. **I reverted it; the
  member is byte-identical to your committed shape**, and the deployer routes through `wrangler`
  precisely so your ruling survives, because wrangler bundles from source at deploy.
- **WHY THE INSTALLER CANNOT INHERIT THAT.** `newgroup` is a Worker. It cannot run `wrangler`, it cannot
  bundle, and `agent-worker` is THREE modules (`index.mjs` imports `./harness.mjs` and
  `./subsession.mjs`), so a one-part script upload cannot resolve them. Your reasoning holds exactly
  where wrangler is in the loop and fails exactly where it is not.
- **WHAT AN INSTALLABLE FLEET THEREFORE REQUIRES**: one bundled, hashed, signed artifact per member.
  `release/RELEASE.json` carries ONE asset today (`bio-plane.bundled.mjs`, one `sha256`, one signature)
  and `newgroup/src/` mentions the members zero times, so there is nothing for an install to fetch or
  verify. That is a release-format change — DIST's to make — **but it forces the per-member build step,
  which is yours.**
- **THE WIRING IS NOT THE PROBLEM AND IS ALREADY PROVED**, so this is genuinely the only blocker:
  `newgroup` has templated a service value from the instance slug since 2026-08-05 —
  `selfBinding = (slug) => ({ type: "service", name: "SELF", service: slug })`, bound on install AND on
  update. The fleet bindings follow a shape that already works in production.
- **RECOMMENDATION, and DIST will implement whichever you rule.** Each member commits a bundle the way
  `pdf-worker` already does, built by its own `scripts/build.mjs`, and the drift you named is answered
  by a check rather than by not building: the gate asserts the committed bundle is byte-identical to a
  fresh build of its source, so a stale artifact FAILS instead of shipping. That converts your objection
  from a reason not to build into a test — which is this project's usual move, and it is what
  `pdf-worker` is missing today too.
- **WHAT I DID NOT DO.** I did not add the build step, did not touch `agent-worker/**`, and did not
  decide this. Filed as **D-297**. If you would rather the installer carry members as multi-part module
  uploads instead, say so and DIST will build that — it costs a manifest with a hash per part and makes
  the signature cover a set rather than a file, which is why it is not the recommendation.

---

## CLAIM 2026-09-10 FLEET (FL-9 — the per-member build step on the GUARD pattern: a committed bundle whose gate refuses to ship stale)
session: fl9-fleet-bundle-guard (worktree `agent-abe10acbf93247266`, branch
  `worktree-agent-abe10acbf93247266`)
opened: 2026-09-10T00:00:00Z
released: 2026-09-10 by CONDUCT at integration — merged on `main` and verified on the MERGED tree, not the branch's own: battery **170/170 · 10,475**, `coverage --strict` exit 0 read unpiped, register floor 879/164/165 re-derived from that same run, UI harness exit 0, `plancheck` 0 fail / 0 warn.
paths: **NAMED BY REGION, AND A CASE-4 WORKER IS LIVE ON THE INQUIRY STATE MACHINE.** The two
  grounds are disjoint by construction and the disjointness is checkable rather than asserted:
  this item touches **no file under `bio-plane/src/`, `bio-plane/checks/` or `bio-plane/schema.mjs`
  at all**, adds no op, no check and no table. Its ground is BUILD TOOLING and the two fleet
  members' committed artifacts.
  - `bio-plane/scripts/fleet-bundle.mjs` — **NEW.** The one implementation of the build recipe
    and of the verification. It lives here and not in `tools/` for a measured reason recorded at
    the site: `esbuild` is installed in `bio-plane/node_modules` and the repository root has no
    `node_modules` at all, so a library in `tools/` could not import it. Precedent:
    `newgroup/scripts/embed-release.mjs` already expects "the sibling ../bio-plane tree with its
    devDependencies installed".
  - `bio-plane/test/fleetbundles.test.mjs` — **NEW.** The gate. It lives in the PLANE's test
    directory, not in a member's, because a member's suite is SKIPPED when that member has no
    `node_modules` (`battery.mjs`'s own fleet walk says so) and a guard that skips is not a guard.
  - `bio-plane/test/fleetbundles.control.mjs` — **NEW.** The negative-control driver. Deliberately
    NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs and neither the battery nor the fleet
    walk must discover it (PL-3/PL-4/PL-11's precedent). It lives INSIDE THIS WORKTREE and never
    in the shared scratchpad, which a concurrent worker overwrote between ARM and RESTORE once
    already.
  - `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR` ONLY** (one key set, plus the dated
    reasoning comment above it). **NOT** `FLEET_FLOOR` (this item adds no fleet member and no
    fleet SUITE — the gate is a PLANE suite), **NOT** `REGISTER_UNCLASSIFIED`, **NOT**
    `NOT_A_FLEET_MEMBER`, **NOT** `discoverFleet`, **NOT** any other region. **Reported to CONDUCT
    by name so it is re-derived from the merged run.**
  - `agent-worker/scripts/build.mjs` — **NEW.**
  - `agent-worker/dist/agent-worker.bundled.mjs`, `agent-worker/dist/agent-worker.bundle.json` —
    **NEW, COMMITTED ARTIFACTS.**
  - `agent-worker/fleet-member.json` — **the added `bundle` block and the sentence naming it ONLY.**
    **NOT** `name`, `entry`, `surface` or `testDir` (READ ONLY — `battery.mjs` and `coverage.mjs`
    both read this file and neither reads the new key; additive, measured before writing).
  - `agent-worker/package.json` — **the added `build` script ONLY.** No dependency added: the
    member still imports nothing from npm and the build resolves `esbuild` from the plane's install.
  - `agent-worker/wrangler.jsonc` — **the `main` key and the comment block that owns it ONLY**
    (the FLEET ruling's own named reversal condition, now reversed BY BOB, 2026-09-10, and the
    reversal recorded at the site with its authority). **NOT** `account_id`, **NOT** `services`,
    **NOT** `vars`, **NOT** the binding-narrowness block, **NOT** `observability`.
  - `pdf-worker/scripts/build.mjs` — **rewritten onto the shared library**, its header's reasoning
    kept.
  - `pdf-worker/dist/pdf-worker.bundle.json` — **NEW, COMMITTED ARTIFACT.**
    `pdf-worker/dist/pdf-worker.bundled.mjs` — **claimed, and MEASURED BYTE-IDENTICAL to a fresh
    build already** (2,427,807 B, sha256 `642a9b78…`), so it is expected to be rewritten with the
    same bytes and no deploy is owed. If that stops being true it is reported, never smoothed.
  - `pdf-worker/fleet-member.json` — **the added `bundle` block ONLY.**
  - `docs/development/INTERFACE-CHANGES.md` (**IC-68**, APPENDED — the file is append-only and the
    id is **PRE-ALLOCATED BY CONDUCT**, not minted here: two parallel workers each minted `IC-64`
    on 2026-08-10 because `mintid` derives its floor from ids mentioned in prose and neither branch
    could see the other's file).
  - `docs/development/CLAIMS.md` (this entry, and the DELEGATIONS below it).
  - `docs/development/MEASUREMENTS.md` (APPENDED).
  **NOT** `bio-plane/src/**` — untouched, entirely (CASE-4's ground, and this item has no business
  in it).
  **NOT** `bio-plane/scripts/battery.mjs` (READ ONLY — the gate is an ordinary plane suite and the
  runner needs no change to run it; measured, not assumed).
  **NOT** `bio-plane/package.json` (READ ONLY — no script added; the gate is discovered).
  **NOT** any existing `.test.mjs` or `.control.mjs` (no assertion of another item is edited).
  **NOT** `agent-worker/src/**`, **NOT** `pdf-worker/src/**` — **the sources are READ and HASHED
  and never written.** A build step that edits its own input is the defect wearing the costume of
  a build.
  **NOT** `agent-worker/test/**`, **NOT** `pdf-worker/test/**` (FL-8 is live in
  `agent-worker/test/harness.test.mjs`).
  **NOT** `tools/deploy-fleet.mjs` (DIST's — its header cites the ruling Bob has now reversed, so
  that prose is now STALE; raised as a DELEGATION below rather than edited).
  **NOT** `newgroup/**`, **NOT** `release/**` (the release-format half is DIST's, D-297; IC-68
  states the shape it will need and builds nothing against it).
  **NOT** `docs/development/QUEUE.md`, **NOT** `docs/development/DECISIONS.md` (CONDUCT is the
  sole writer of both).
  **NOT** `civicos-ui/**`, **NOT** `docprofile/**`.

### DELEGATION 2026-09-10 FLEET (FL-9) -> DIST: **THREE THINGS, AND THE FIRST IS THAT YOUR DEPLOYER'S HEADER NOW ARGUES FOR A RULING THAT NO LONGER STANDS**

1. **`tools/deploy-fleet.mjs`'s header is STALE as of Bob's 2026-09-10 answer.** Its section "WHY
   IT SHELLS OUT TO WRANGLER INSTEAD OF PUTTING BYTES LIKE deploy.mjs DOES" rests on
   `agent-worker/wrangler.jsonc` saying *"THE SOURCE DEPLOYS, NOT A BUNDLE"* and on the member
   being three modules a one-part REST upload cannot resolve. **Both facts have changed**: the
   member's `main` now points at a committed, guarded bundle, and that bundle is ONE part with no
   unresolved specifier (asserted). The tool still WORKS unchanged — wrangler is happy to deploy a
   pre-bundled entry — so nothing is broken and nothing is urgent; the PROSE is what is now wrong,
   and a load-bearing comment that argues from a reversed ruling is exactly the stale document
   this project keeps paying for. It is yours, so it is not edited here.
2. **The per-member release assets now EXIST and are hash-stable.** `agent-worker/dist/agent-worker.bundled.mjs`
   (48,392 B) and `pdf-worker/dist/pdf-worker.bundled.mjs` (2,427,807 B) each ship beside a
   committed `dist/<name>.bundle.json` carrying the artifact's `sha256`, its byte length, the exact
   build recipe, and the sha256 of every input. **IC-68 states the shape `RELEASE.json` will need**
   and deliberately builds nothing against it — the release format is yours (D-297).
3. **The multi-part alternative was REFUSED and the refusal COST NOTHING, measured.**
   `agent-worker` is three modules; bundled it is ONE file of 48,392 bytes with **zero** remaining
   import specifiers of any kind. `pdf-worker` bundled is one file whose only remaining specifiers
   are the platform's own (`node:*`). So "one asset, one hash, one signature" is available for both
   members and a signature over a SET buys nothing here. Stated either way, as the item required.

### DELEGATION 2026-09-10 FLEET (FL-9) -> whoever owns `bio-plane/test/action-loop.test.mjs`: **A SUITE WITH AN EXPIRING FIXTURE WENT RED BETWEEN CONDUCT'S BASELINE AND MINE, AND THE CAUSE IS THE CALENDAR**

**MEASURED, not suspected, and it is NOT this item's damage** — it reproduces on a tree this item
has not touched, at `3b340d8`, standalone. `node test/action-loop.test.mjs` reports **73 pass, 6
FAIL**, every failure the same shape:

    want []
    got  ["C-11.1: clock[0] 'City response due' is silently past-due (2026-09-10 < today, status still pending)"]

The fixture's clock entry is dated **2026-09-10**, and the machine's clock has rolled past it. CONDUCT's
brief for this item records the true baseline as **168/168 · 10,351 assertions**, measured on `main`
earlier the same day; this worktree measures **167/168 · 10,345** — a difference of exactly **6
assertions**, which is exactly this suite's six. **The brief was right when it was written and the
calendar falsified it**, which is a failure mode no re-measurement discipline catches, because both
numbers are honest measurements of the same tree.

**Not fixed here, for two reasons and neither is reluctance:** the file is an assertion estate this
item does not own, and the right fix is a decision rather than an edit — a fixture date must either
be RELATIVE to the run (`today + N days`) or the suite must pin a clock, and choosing between those
is the owner's call. **A hardcoded future date in a fixture is a time bomb with a fuse measured in
days**, and this is the class, not the instance: the same pattern should be swept for wherever a
suite writes a literal date into a document it then conformance-checks.

### AMENDMENT 2026-09-10, MID-ITEM (FL-9, `fl9-fleet-bundle-guard`) — TWO FILES ADDED TO THE CLAIM, AND ONE OF THEM IS A FLOOR THIS ITEM DID NOT INVALIDATE

Named here rather than left for the merge to discover, because a claim that is silently
wider than it says is worse than a claim that is wide.

1. **`.gitignore` — ONE APPENDED BLOCK, the negative-control pen `.nc-fleetbundles/`.** The
   file already names a pen per item (`.ui*-harness/`, `.pl13-harness/`, `.d251-control-pristine/`,
   `.d266-harness/`, `.d267-harness/`, `.d280-harness/`, `.case2-harness/`) and states the rule
   at the site: an interrupted driver must not leave an untracked file where the next walk can
   enrol it as somebody else's corpus. This driver arms sources in THREE trees and renames
   `pdf-worker/node_modules` away for one arm, so it needs its own line. **NOTHING ELSE IN THAT
   FILE IS TOUCHED.**

2. **`bio-plane/scripts/coverage.mjs` — `FLEET_FLOOR.arms` MOVED AS WELL AS `REGISTER_FLOOR`,
   and the honest reason is that IT WAS ALREADY STALE BY TEN ARMS BEFORE THIS ITEM EXISTED.**
   The claim above said NOT `FLEET_FLOOR`, on the correct reasoning that this item adds no fleet
   member, no fleet suite and no fleet arm — its guard is a PLANE suite. That reasoning still
   holds and the floor moved anyway: the fleet's five suites state **17 + 8 + 19 + 7 + 7 = 58**
   arms on a tree this item did not change there, against a floor of 48. **A floor with slack is
   not a ratchet**, and this is the seventh consecutive item here to find a hand-carried floor
   stale by measuring it — VF-5 faced exactly this and moved a figure it had not invalidated
   rather than leaving it. `members` / `surfaceOps` / `suites` are UNMOVED at 2 / 4 / 5.

**BOTH FLOOR MOVES ARE REPORTED TO CONDUCT BY NAME and are taken from a run made AFTER the
commit** — `REGISTER FLOOR arms 868/858 · classified 163/162 · corpus 164/163 · GREW by 10
arm(s)`, provenance `175 of 175 discovered item(s) are in the commit at HEAD (d83695b)`. A
pre-commit run prints the same numerals as CONTAMINATED beside the in-commit values, so moving
from it would have installed the OLD number as the new one and read as a no-op (D-238).
**CONDUCT RE-DERIVES BOTH ON THE MERGED TREE** — this branch cannot see CASE-4's arms.
## CLAIM 2026-09-10 FLEET (area stand-up — a status addendum in the area's own kickoff; NO fleet code ground)
session: FLEET area session (worktree `bio-worktrees/FLEET`, branch `fleet-session`)
opened: 2026-09-10
paths: `docs/development/kickoffs/FLEET.md` ONLY — a stand-up addendum recording verified state.
  **NOT** `agent-worker/**`, **NOT** `pdf-worker/**`, **NOT** `tools/**`, **NOT**
  `docs/development/QUEUE.md` (CONDUCT's sole ground). **FL-9's worker holds the fleet build
  ground and was measured ALIVE at claim time** — untracked `fl9probe.mjs`/`fl9diff.mjs` and
  file activity at 17:10 local in worktree `agent-abe10acbf93247266` — so per the kickoff's own
  rule this session claims none of it and coordinates through CONDUCT. The kickoff is the one
  path FL-9's brief does not name and the area session is its writer of record.
released: 2026-09-10, same turn — the addendum lands in the same commit as this entry.

## CLAIM 2026-09-10 FLEET (takeover note in the area's own kickoff after FL-9 landed; NO code ground)
session: FLEET area session (worktree `bio-worktrees/FLEET`, branch `fleet-session`)
opened: 2026-09-10
paths: `docs/development/kickoffs/FLEET.md` ONLY — the takeover addendum. **NOT** `agent-worker/**`,
  **NOT** `pdf-worker/**`, **NOT** `bio-plane/**`, **NOT** `docs/development/QUEUE.md`. FL-9 is
  `done` and merged (`7429166`, integrated `626fad7`); no worker holds fleet ground.
released: 2026-09-10, same turn — the addendum lands in the same commit as this entry.
## CLAIM 2026-09-10 RECORD (CASE-4 — DEC-72's LIFECYCLE CHANGE: `published` leaves the inquiry state machine, the precondition survives as the case relation, and a revised member FLAGS its containing cases)
session: case4-lifecycle-flag (worktree `agent-a2cabbd5225deffd5`, branch
  `worktree-agent-a2cabbd5225deffd5`)
opened: 2026-09-10T00:00:00Z
released: 2026-09-10 by CONDUCT at integration — merged on `main` and verified on the MERGED tree, not the branch's own: battery **170/170 · 10,475**, `coverage --strict` exit 0 read unpiped, register floor 879/164/165 re-derived from that same run, UI harness exit 0, `plancheck` 0 fail / 0 warn.
paths: **NAMED BY REGION. AN FL-9 WORKER IS LIVE ON THE BUILD TOOLING AND THE FLEET BUNDLES**
  (`newgroup/`, `pdf-worker/`, the committed per-member bundles and their gate) — disjoint from
  every path below, but the CASE header's rule is that precision is the only protection two
  workers get, so the regions are named anyway.
  **`bio-plane/checks/bio-checks.mjs` — named by SITE:**
  (1) `STATES.inquiry` ONLY: `published` removed from `legal` and from every `edges` list, and
  the REC-14/DEC-12 commentary block amended in place with the reason. **NOT** `STATES.focus`,
  **NOT** `STATES.project`, **NOT** `STATES.action`, **NOT** `STATES.bias`, **NOT**
  `STATES.information`.
  (2) `checkInquiryPublished` / `checkPublishedExtension`'s KEYING only — the C-2.8 entry
  requirements re-keyed off `fm.current_state === 'published'` onto the case relation the bytes
  carry. The REQUIREMENTS THEMSELVES ARE UNTOUCHED. **NOT** `checkCompletenessFreshness`,
  **NOT** `checkInquiryBasis`, **NOT** `VERSION_ACT_CHECKS`, **NOT** any other C-number.
  (3) `HEADINGS.inquiry`'s `states: ['published']` entry, which names the same vanished word.
  **`bio-plane/src/store.mjs` — named by SITE:**
  (1) `publishCase()`: the ENTRY GUARD only — `ILLEGAL_TRANSITION`-to-`published` replaced by
  the explicit `NOT_CONCLUDED` precondition; and the state-write block (`#appendStateHistory`,
  `prior_state`, `current_state`, the `promote` meta). **NOT** the project fence, **NOT** the
  owner fence, **NOT** the bar computation, **NOT** the roles partition, **NOT** C-21.1's
  freshness comparison, **NOT** the case-identity resolution, **NOT** the edition allocation.
  (2) `reopen()`: the `REOPENABLE_FROM` test only, which becomes the case relation.
  (3) `divide()`, `inquiryGround()` (restructure) and `#moveVersionState()`: the ONE
  `current_state === "published"` predicate in each, which becomes the case relation. The
  refusal NAMES and DETAILS are unchanged.
  (4) `#basisLegs()`'s frozen/confirmed split (the one `r.current_state === "published"`).
  (5) NEW private helpers `#caseMemberVersion()` / `#caseRelationOf()` and NEW `#flagCases()`,
  plus the ONE call to it inside `promote()` and the discharge inside the ratify committer
  (`publish()`), and `caseFlags()` as the read. **NOT** `#publishEdges`, **NOT** `#caseOf`,
  **NOT** `#caseEditionState`'s pin predicate (CASE-5's, landed — READ and reused, not edited
  beyond serving the flags beside the roster), **NOT** the run / task / capture / link /
  proposal / queue surfaces.
  (6) `purge()`: the whole-store arm gains the ONE new table (D-113).
  **`bio-plane/src/schema.mjs`** — ONE new table, `case_revision_flags`, placed BEFORE the
  `host_governor` block, with **no semicolon inside any `--` comment** and no backtick.
  **`bio-plane/src/affordances.mjs`** — `REOPENABLE_FROM` and the two `applies:` predicates
  (`publish`, `inquiryground`) that name the vanished state. **NOT** the intent vocabularies,
  **NOT** any other affordance row.
  **`bio-plane/src/index.mjs`** — `op=ratify`'s `isCase` derivation (the one
  `ratifiedFm.current_state === "published"`), the `state: "published"` label in the published
  body reader, and ONE new dispatch line for the flags read. **NOT** the R2 copy, **NOT** the
  gate, **NOT** the container manifest, **NOT** any other op.
  **Tests — CORRECTED, NEVER EXEMPTED:**
  - `bio-plane/test/caselifecycle.test.mjs` (NEW — the item's own suite),
    `bio-plane/test/caselifecycle.control.mjs` (NEW — the negative-control driver, committed so
    the arms re-run in one step; it edits real sources, so it is deliberately NOT a
    `.test.mjs` and the battery must not discover it).
  - `bio-plane/test/*.test.mjs` — touched ONLY where this item's change makes an existing
    assertion false, each with a dated reason at the assertion saying what it asserted before
    and why that was right when written. **No floor, census or ratchet moved without naming
    the arrival.**
  `docs/development/INTERFACE-CHANGES.md` (**IC-69, PRE-ALLOCATED BY CONDUCT AT SPAWN**;
  APPENDED — the file is append-only), `docs/development/CLAIMS.md` (this entry),
  `docs/development/kickoffs/RECORD.md` (APPENDED, never rewritten),
  `docs/development/MEASUREMENTS.md` (appended),
  `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` (**the State Rules amendment**, as a
  DATED AMENDMENT NOTE appended to the section that owns the per-type machine — never a
  rewrite of the spec's own text).
  **NOT** `docs/development/QUEUE.md` (CONDUCT is sole writer), **NOT**
  `docs/development/DECISIONS.md` (CONDUCT is sole writer), **NOT**
  `docs/development/CASE-AS-PRODUCTION.md` (the authority, READ ONLY — CASE-6 archives it),
  **NOT** `docs/BIO_DATAPLANE_STATE.md` (**the arc binds it to CASE-6's `accepts-when`**),
  **NOT** `civicos-ui/**`, **NOT** `newgroup/**`, **NOT** `pdf-worker/**`, **NOT**
  `agent-worker/**`, **NOT** `release/**`, **NOT** `bio-plane/dist/**`, **NOT** `tools/**`,
  **NOT** `bio-plane/scripts/coverage.mjs` (**if `REGISTER_FLOOR` has to move it goes in an
  AMENDMENT block below and is reported to CONDUCT by name**).
interfaces owned: I3 (op contracts) and I5 (the store schema). **IC-69 is filed before the
  build**, per the protocol.
interfaces consumed: none.

### DELEGATION 2026-09-10 RECORD (CASE-4 / IC-69) -> UI: **THE PAGE HOLDS A HAND COPY OF THE INQUIRY STATE MACHINE, AND THE STATE IT USES TO RECOGNISE A CASE NO LONGER EXISTS**

**What changed.** DEC-72 ends `published` as an inquiry lifecycle state. A finding's lifecycle now
ends at `concluded`, and publication is THE CASE RELATION — a roster row pinning that finding's
current version. `op=affordances` gains a `case_member` boolean for exactly this, and the new
`op=caseflags` serves the revision flags a case carries.

**Where it bites, measured 2026-09-10 by grep over seven trees, built copies excluded. ONE file,
FOUR sites, and only the first is a mechanical fix.**

1. **`civicos-ui/app.html` ~1636-1646, `STATE_EDGES.inquiry` — A MIRROR OF THE MACHINE THIS ITEM
   CHANGED.** It carries `concluded:[...,"published",...]` and `published:["open","surfaced"]`. The
   comment above it says it exists so *"the disposition pre-flight reads this so it refuses exactly
   what the store would refuse"* — which is now false in both directions: it offers a publish move
   the store refuses `NOT_CONCLUDED`, and it will refuse a reopen from `concluded` that the store
   now permits for a case member.
2. **~1670, `PHASE`** maps `published:"case"`. A member of a published case sits at `concluded`, so
   **the page now labels a CASE a "Finding"** — a wrong word in the column a reader uses to tell
   the two apart.
3. **~1794-1797, the state seal vocabulary.** The `published` row (chip, mark `P`, `next:["open"]`,
   two `forbids`) is now unreachable, so a case renders with no seal. **The two `forbids` are still
   TRUE** — an edition already published keeps answering, and a signed edition cannot be declared
   malformed — and they now hang off the case relation rather than off a state.
4. **~1767, the SPACE vocabulary's `published` row is CORRECT and must NOT be touched.** That is
   the published-record SPACE ("across the fence"), not the inquiry state. Named here so a
   find-and-replace does not take it.

**This is not a rename and that is why it is a delegation.** There is no longer a state word that
says "this is a case", so the page has to read the relation: `op=affordances` answers
`case_member`, and `op=publishedcase` already answers the roster. **UI-56 (already queued) touches
the same neighbourhood** — `pubIndex`'s join — and a session doing both at once will do less work
than two.

**What is NOT owed:** nothing in `newgroup`, `pdf-worker`, `agent-worker`, `docprofile`, `tools` or
`release` reads a state vocabulary at all. Measured, zero.

### AMENDMENT 2026-09-10 RECORD (CASE-4) — **I EDITED THREE `civicos-ui/` PATHS MY OWN CLAIM SAID `NOT`, AND THIS BLOCK IS WHY, WHAT, AND WHAT I DID NOT TOUCH**

**The claim above says `NOT civicos-ui/**`, and that was the right posture when it was
written.** What changed it is a measurement rather than a convenience: with the plane's change
in place, `node civicos-ui/test/run.mjs` went from exit 0 to **exit 1 with three failures**, and
every one of them is a DRIFT DETECTOR firing on the catalog change — which is the mechanism
working, not a UI defect. Landing the plane and leaving the harness red would put a red gate on
`main` and hand the next worker a failure that looks like theirs. **A delegation cannot carry a
red gate.**

**WHAT I CHANGED — three edits, and two of them are in the INSTRUMENT rather than in the page:**

1. `civicos-ui/app.html`, `STATE_EDGES.inquiry` — **ONE ARRAY ENTRY.** `concluded`'s list drops
   `published`, because the catalog's does. This block is declared a MIRROR of
   `STATES[type].edges` by its own comment, and the disposition pre-flight reads it *"so it
   refuses exactly what the store would refuse"* — an entry the store now refuses
   `NOT_CONCLUDED` is DEC-8's disagreement sitting in the page. `published -> open|surfaced` is
   KEPT, because the catalog keeps it.
2. `civicos-ui/check-semantics.mjs` — the PHASE domain and the semantics-row check now read
   **`legal ∪ legacy`**. The catalog gained a `legacy` key when `published` left the machine: a
   word it no longer PRODUCES and must still READ, because ratified bytes are immutable. The
   PHASE union already unioned `STATES.focus.legal` for exactly this reason, in its own words —
   *"every state an inquiry can legally stand in, under the canonical machine AND under the
   legacy one it is read through, must have a phase."* `legacy` is that sentence's new half.
3. `civicos-ui/test/bias-vocabulary.test.mjs` — the same widening in its `R2` sourcing verdict.
   The pin is unchanged in force: still a two-way set comparison, so a row for a state the
   catalog knows nothing about still fails.

**THE FIRST DRAFT OF THIS AMENDMENT WAS WRONG AND IS RECORDED BECAUSE THE CORRECTION IS THE
POINT.** I first DELETED `PHASE.published` and the `published` row from `SEMANTICS.types.inquiry`
— reading them as stale. **Three more UI suites went red**, and they were right: a document
already at `published` still exists, the catalog keeps the word READABLE for exactly that, and
**the UI is a reader of those bytes.** Deleting the entries would have made the page unable to
explain a published case to a member — the opposite of what those tables are for. Reverted whole
(`git checkout civicos-ui/app.html`) and replaced with the `legacy` widening above.

**WHAT I DID NOT TOUCH, AND IT IS STILL DELEGATED:** the page cannot tell a CASE from a FINDING
for anything published from now on, because a case member sits at `concluded` and wears no word
that says otherwise. That is authored rendering — it needs `op=affordances`' new `case_member`
or `op=publishedcase`'s roster — and it is the DELEGATION filed above, alongside **UI-56**,
which touches the same neighbourhood. **No UI behaviour was authored here; three mirrors were
made to agree with the catalog again.**

### AMENDMENT 2026-09-10 RECORD (CASE-4) — **`REGISTER_FLOOR` MOVED, AND IT IS REPORTED HERE BY NAME BECAUSE THE CLAIM ABOVE SAID IT WOULD BE**

`bio-plane/scripts/coverage.mjs`'s `REGISTER_FLOOR` moves **858 -> 865 arms / 162 -> 163
classified / 163 -> 164 corpus**, all three in one edit, every figure read off what a green
`--strict` run PRINTED — `arms 865/858 · classified 163/162 · corpus (suites read) 164/163 ·
GREW by 7 arm(s)` — and never by adding to the numbers that were there.

**The rise is ONE new suite**, `bio-plane/test/caselifecycle.test.mjs`, whose declaration states
seven armed arms — (a), (b), (b2), (c), (d), (d2), (e) — plus an unnumbered baseline. So
`classified` and `corpus` each move by one and `arms` by seven, which is exactly what the
register printed rather than what the declaration claims: the two agree here, and where they
have not agreed in the past (D-266's nine-declared-seven-counted) the figure the floor takes is
the instrument's.

**MEASURED AFTER THE COMMIT, NOT BEFORE.** On the working tree the run reported `contaminated:
1 suite(s) no other checkout has` and held all three figures at the in-commit values, because
`provenance.mjs` refuses to let this register count work no other checkout can see (D-238). A
floor moved while a phantom is present is permanently too high. The move is taken from the run
made after `git commit`.

**CONDUCT RE-DERIVES THESE ON THE MERGED TREE and should:** this branch cannot see FL-9's arms,
and every figure here is true of this branch alone.
## CLAIM 2026-09-10 M0 (M0-22 — the test estate's wall-clock dependency: a fixture date the calendar overtook)
session: M0-22 worker (worktree `agent-afbe0c8c012724e68`, branch `worktree-agent-afbe0c8c012724e68`)
opened: 2026-09-10
paths: `bio-plane/test/action-loop.test.mjs` — the FIXTURE/CLOCK region only: the
  `NOW`/`LATER`/`DUE`/`BEFORE_MS`/`AFTER_MS` block and its header comment (~lines 110-120), the
  `Miniflare` construction's `bindings` object (~line 60), the `errorsOf` helper (~line 102),
  and ONE new assertion block for C-11.1's past-due arm. No op under test changes and no
  existing assertion is deleted.
  `bio-plane/test/clockadvance.control.mjs` (NEW) — this item's negative-control harness and the
  re-runnable clock-advanced arm, written INSIDE this worktree per PL-10/UI-38 rather than to the
  shared scratchpad.
  `bio-plane/test/clockshift.preload.mjs` (NEW) — the clock-advance instrument the control drives.
  `docs/development/DEBT.md` — APPEND only, for the census residue (D-300).
  **NO LASTING EDIT** to `bio-plane/checks/bio-checks.mjs`: the over-strictness arm ARMS and
  restores it in-process, exactly as this suite's existing control (b) already does, with the
  restore verified by CONTENT and by sha256 and the harness ABORTING rather than warning if it
  does not match. Measured clean before and after: `676259987f70da2b…`.
  **NOT** `bio-plane/src/**`, and no PERSISTENT change to `bio-plane/checks/**` (the `ctx.nowMs`
  and `BIO_NOW_MS` seams this item uses ALREADY EXIST; nothing in the plane moves), **NOT**
  `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground), **NOT** any other suite.
  **CASE-4's worker holds the inquiry state machine** — this claim names no inquiry ground; the
  `inquiryMd()` fixture here is read-only scaffolding for an action's basis and is not edited.
released: 2026-09-10 — the work is committed on this worktree's branch and the paths are free.
  The over-strictness arm's temporary edit to `checks/bio-checks.mjs` was restored and verified
  by content AND sha256 in the same process (`676259987f70da2b3784284272e19c90fcfe255880990a38d0c3456da4c3ba4a`,
  identical before the first arm and after the last).

## CLAIM 2026-09-10 FLEET (FL-10 — the plane's committed bundle gets FL-9's guard; a stale plane artifact FAILS instead of shipping)
session: FLEET area session (worktree `bio-worktrees/FLEET`, branch `fleet-session`)
opened: 2026-09-10
paths:
  - `bio-plane/scripts/fleet-bundle.mjs` — the plane's descriptor and any shared-check growth ONLY; every existing export keeps its shape (two build scripts and the gate consume them).
  - `bio-plane/scripts/embed-signpage.mjs` — an EXPORT + main-guard refactor only; the npm `embed:sign` behaviour is unchanged.
  - `bio-plane/scripts/build-plane.mjs` — NEW, the plane's thin build caller on the agent-worker pattern.
  - `bio-plane/package.json` — the `"build"` script line ONLY.
  - `bio-plane/test/fleetbundles.test.mjs` and `bio-plane/test/fleetbundles.control.mjs` — plane sections and APPENDED arms; no existing arm edited.
  - `bio-plane/dist/bio-plane.bundled.mjs` (REBUILT to today's src — closing D-298's 114-commit staleness is the item) and `bio-plane/dist/bio-plane.bundle.json` (NEW manifest; zero readers today, measured).
  **NOT** `bio-plane/src/store.mjs`, **NOT** `bio-plane/src/schema.mjs` (FL-10's own claim rule — if the work seems to need them, that is a finding to report), **NOT** `bio-plane/src/**` at all (`signpage.mjs` regenerates deterministically from `tools/sign-release.html`; a diff there would be a FINDING, not a change of mine), **NOT** `newgroup/**`, **NOT** `release/**` (D-298's release half is DIST's), **NOT** `docs/development/QUEUE.md`.

### RELEASED 2026-09-10: the FL-10 claim above — landed as `3607b3b` (the guard) + the floor-move commit beside it
All acceptance clauses measured, none believed: fresh build byte-identical to the committed
bundle asserted (2,556,614 B, sha256 d95d280d…, 43 first-party inputs, ZERO vendored so the
byte arm can never skip); a deliberately stale bundle FAILS naming the file (arms 6/6b: 54/2
and 52/4, exit 1); the tree-shake arm reproduced ON THE PLANE (a non-entry edit left the
bundle byte-identical and the input-hash arm failed anyway — FL-10's NC(2) by measurement);
the generated-input loop closed and proven (arm 7: 55/1, exactly the render assertion);
over-strictness green post-commit (arm 8: rebuild leaves the tree UNCHANGED, 56/0). Battery
168/169 · 10,405 — the one red is `action-loop.test.mjs` 73/6, the PRE-EXISTING pinned-clock
failure FL-9 measured identical on the untouched baseline and already delegated; not this
item's. UI harnesses green. `--strict` exit 0 READ UNPIPED, post-commit, provenance 175/175
at HEAD; REGISTER_FLOOR 868→872 moved to the printed figure. `src/signpage.mjs` untouched,
as the claim promised — the render regenerates byte-identically. **For CONDUCT:** the FL-10
QUEUE row and IC-70's RESOLUTION are yours; D-298's clause (1) is closed by this, clause (2)
(the assembler refusal) and the coherent cut remain DIST's.

## CLAIM 2026-09-10 UI (UI-56 — IC-66's delegation: the published index joins a roster row to its ratified row on the CASE's edition, and a diverged member misses SILENTLY)
session: UI worker (worktree `.claude/worktrees/agent-a7734fd4d9baf1c20`, branch `worktree-agent-a7734fd4d9baf1c20`)
opened: 2026-09-10
paths:
  - `civicos-ui/app.html` — **THE `pubList()` FUNCTION ONLY**, and inside it only the roster-to-ratified
    JOIN: the `byId` map construction, the `inCase` set, the `waiting` filter, the per-member `row`
    lookup, and the not-in-any-case loop's membership test. No other function, no markup, no CSS.
  - `civicos-ui/test/publishedcase.test.mjs` — the index block (block 1) and the `publishedmanifest`
    fixture rows (`CASE_MEMBERS`, `PUB_ROWS`, `CASE_ROWS`): the roster fixture is CORRECTED to the wire
    shape the plane actually selects (`version_sha`, `role`) and gains a DIVERGED member. Existing
    assertions are corrected at their site with a dated reason where the fixture's row count moves;
    none is exempted.
  **NOT** `bio-plane/src/**` — the plane already answers `version_sha` on `caseMembers[]` and states the
  join rule in `publishedManifest().production`; this item is pure I3 CONSUMPTION and nothing on the wire
  moves. **NOT** `docs/development/QUEUE.md` (CONDUCT's sole ground). **NOT** any other UI suite.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `b834f26` and verified on the MERGED tree: battery 170/170 · 10,488, `coverage --strict` exit 0 read unpiped, UI harness exit 0 (47/47, publishedcase 234/234), `mintid --audit` 0 breaks.

## CLAIM 2026-09-10 M0 (D-265 — the walk census's SECOND question, answered by INVERSION: the classification travels with the VALUE)
session: D-265 worker (worktree `agent-a0f4d228852d41a80`, branch `worktree-agent-a0f4d228852d41a80`)
opened: 2026-09-10
paths:
  - `bio-plane/scripts/walkfigure.mjs` (NEW) — the primitive. A walk's scalar figure and a walk's
    working-tree collection carry their classification AT RUNTIME, so a floor on an unguarded
    corpus throws where it is written instead of being detected afterwards.
  - `bio-plane/scripts/op-claims.mjs` — the EXPORT BOUNDARY ONLY: the object `sweep()` returns and
    the object `corpus()` returns. The walk, the matcher, `LEDGER`, `PLANNED_OPS`, `readDispatch`,
    `routeOf`, `opReaching`, `mentionsIn` and `generatedReason` are NOT touched. `rung-ladder.test.mjs`
    imports `readDispatch`/`routeOf`/`PLANE` only (measured) and is unaffected.
  - `bio-plane/scripts/walkfloor.mjs` — the RETURNED OBJECT ONLY (its own counts, self-application).
    The stripper, the derivation, the flow analysis, `WALK_PRIMITIVES` and `CENSUS_ROOTS` are untouched.
  - `bio-plane/test/op-claims.test.mjs` — the five floors and the two subset comparisons only, moved
    onto the named unwrap. No assertion deleted; no floor figure changed.
  - `bio-plane/test/hygiene.test.mjs` — the CROSS-FILE block at the foot of the class census ONLY:
    the census's second question, the reach DELTA, and the BRANDED-or-NAMED ratchet appended after
    the existing walkfloor arms. No existing arm edited except the three that floor on
    `sweepWalkFloors()`'s own counts, which move onto the named unwrap.
  - `bio-plane/test/walkfigure.test.mjs` (NEW) and `bio-plane/test/walkfigure.control.mjs` (NEW —
    the negative-control driver, deliberately NOT a `.test.mjs`, `register.control.mjs`'s precedent).
  - `bio-plane/scripts/coverage.mjs` — the `REGISTER_FLOOR` NUMERALS only, from PRINTED figures
    (a new suite invalidates `corpus`/`classified`). **If this conflicts at merge, COLLAPSE TO ONE
    SET and re-read the printed figures. Do not keep both.**
  - `docs/development/DEBT.md` — the D-265 row's disposition, and any residual raised.
  - `docs/development/MEASUREMENTS.md` — APPEND, one dated section.
  **NOT** `bio-plane/src/**` (no plane behaviour changes), **NOT** `bio-plane/checks/bio-checks.mjs`,
  **NOT** `civicos-ui/**`, **NOT** `newgroup/**`, **NOT** `docs/development/QUEUE.md` (CONDUCT's sole
  ground), **NOT** `scripts/fleet-bundle.mjs` / `migrate/migrate.mjs` / `scripts/residue.mjs` — those
  three are NAMED in the census with a measured reason and are not edited.
concurrency: checked over the whole register. **No live claim names any path above.** A CASE-5b
  worker holds the publish path in `store.mjs`/`index.mjs`/`bio-checks.mjs` and the case suites —
  this claim names none of them. FLEET's FL-10 claim named `scripts/fleet-bundle.mjs` and is
  RELEASED; this item only NAMES that file in a census list and does not edit it.

### AMENDMENT 2026-09-10 to the D-265 claim above — THREE PATHS ADDED, AND THE REASON IS A DELEGATION THIS ITEM TRIPPED AND THEN DISCHARGED
  - `bio-plane/test/instrument-deps.mjs` (NEW) — the derived copy list.
  - `bio-plane/test/coverage-provenance.test.mjs` — the `REAL` array ONLY (now derived), its
    import line, and ONE appended assertion. No existing arm edited.
  - `bio-plane/test/owed-controls.test.mjs` — the `REAL` array ONLY (now derived), its import
    line, and ONE appended assertion (`A0`). No existing arm edited.
  **WHY, and it is measured rather than opportunistic.** Both suites copy the REAL
  `scripts/coverage.mjs` into a scratch repository and kept the list of modules it imports
  **BY HAND, in two places**. D-265 added exactly ONE import — `walkfloor.mjs` gained
  `./walkfigure.mjs` — and the full battery came back with `coverage-provenance` at **9 pass,
  19 fail** and `owed-controls` at **29 pass, 11 fail**. Both suites' own headers name those
  two figures, to the assertion, as the signature of this exact staleness, and
  `owed-controls.test.mjs` DELEGATES the fix in `CLAIMS.md` in those words: *"two hand-kept
  copies of one instrument's dependency list is a thing that will go stale."* The warning was
  written twice, was exactly right, and was honoured anyway — because a hand-kept copy of
  another file's imports cannot be kept by the person who does not know it exists. The list is
  now DERIVED from the instrument's own import graph in ONE shared module, so the second copy
  is GONE rather than corrected, and each suite asserts the derived set still contains every
  name its array carried by hand. `WORKER.md`'s *invert, do not lengthen a list*, applied to
  the list that asked for it in prose.
  **Restored to green and measured:** `coverage-provenance` 28 → 29, `owed-controls` 40 → 41,
  the +1 in each being the new assertion on the derived list.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `33e0b5e` and verified on the MERGED tree: battery 171/171 · 10,537 (pre-merge main 10,488 + the attributed +49, closing exactly), `coverage --strict` exit 0 read unpiped with `REGISTER_FLOOR` 888/165/166, UI harness exit 0, `mintid --audit` 0 breaks. The CLAIMS.md merge conflict was the claim's own predicted one and was resolved keep-both (two appended blocks, no shared row).
## CLAIM 2026-09-10 M0 (M0-23 — UI-56's delegation: a `publishedmanifest` fixture that cannot represent the wire shape, and the CLASS question behind it)
session: M0 worker (worktree `.claude/worktrees/agent-ae817651c6d08b3b1`, branch `worktree-agent-ae817651c6d08b3b1`)
opened: 2026-09-10
paths:
  - `civicos-ui/test/preauth-vocabulary.test.mjs` — the `MANIFEST_ANSWER` fixture ONLY (its
    `caseMembers[]` rows corrected to the wire shape the plane selects, and the rows a DIVERGED
    member needs to be representable), plus any assertion the enlarged fixture moves, corrected at
    its site with a dated reason and never exempted. No other block.
    **AMENDED MID-ITEM, and the amendment is the item's own finding.** The claim as written covered
    correcting the fixture and moving what it moved. NC arm (t) — the pin deleted from the corrected
    fixture — came back **GREEN, not as declared**: the corrected fixture can REPRESENT the wire
    shape, and no assertion in this suite READ it, so by the item's own criterion the correction was
    decoration. Closing that needs an assertion this file did not have, so the claim now also covers
    **TWO APPENDED ASSERTIONS in the `public-record` REACH block** (the diverged member joined through
    its pin on the uncredentialed index, and its undiverged sibling unmoved) and the file's own
    summary line, where this suite records every movement of its measurement basis. No existing
    assertion is edited or exempted.
  - `civicos-ui/check-mock-envelope.mjs` — a NEW reporting arm (the fixture-shape census) APPENDED;
    arms A and B are not edited.
  - `civicos-ui/test/envelope-probe.mjs` — the recorder gains the per-row key sets the census reads.
    It still records and never judges; nothing existing is removed.
  - `docs/development/CLAIMS.md` (this entry).
  **NOT** `civicos-ui/app.html` (the join is UI-56's and landed; this item changes no surface),
  **NOT** `bio-plane/src/**` (the plane already answers the six columns — this is a MOCK correction
  and nothing on the wire moves), **NOT** `civicos-ui/test/publishedcase.test.mjs` (UI-56 just landed
  in it; it is the census's subject and is READ ONLY here), **NOT** any other suite under
  `civicos-ui/test/` — the census REPORTS on them and edits none, **NOT**
  `docs/development/QUEUE.md` (CONDUCT's sole ground).
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 171/171 · 10,537 (delta ZERO against pre-merge main, the worker's predicted shape), `coverage --strict` exit 0 read unpiped, UI harness exit 0, `mintid --audit` 0 breaks.

### DELEGATION 2026-09-10 (M0-23 → UI / whoever next holds these suites) — what the fixture-shape census found OUTSIDE my claim
The census arm M0-23 added to `civicos-ui/check-mock-envelope.mjs` (arm C) reports, on every
harness run, every UI fixture whose rows are narrower than the plane's own `SELECT`. **It is
REPORT-ONLY by design and nothing below is failing anything.** Three findings are in suites this
claim says `NOT`, so they are handed over rather than fixed:

1. **`civicos-ui/test/auth-surface.test.mjs` · `publishedmanifest.published[]` carries 7 of 9
   columns, MISSING `strength` and `required`** — and it answers **NO `cases[]` and NO
   `caseMembers[]` at all**. Its four published rows therefore render as bundles in no case with
   no frozen pair, and **the fixture cannot represent a loose ratified finding that HAS a pair** —
   which is exactly the state REC-49 corrected `pubList` to render. Same class as M0-23's own:
   not a live defect, and not assertable either.
2. **`cases[]` is 6 of 9 in BOTH `publishedcase.test.mjs` and `preauth-vocabulary.test.mjs`,
   MISSING `bias_acknowledgement`, `bar` and `project_id`** — the three columns CASE-1 and CASE-5
   put on the public index. **MEASURED AND LEGITIMATELY NARROW, not a gap to close on my say-so:
   `grep` over `civicos-ui/app.html` finds ZERO reads of `bias_acknowledgement`, of `project_id`,
   and of a case-level `bar`.** No surface reads them, so this is the over-strictness case the
   census exists to NAME rather than fail. It becomes real work the day a surface renders the
   bar or the publishing project — and on that day arm C already says which fixtures cannot
   represent it.
3. **`auth-surface.test.mjs · published[]` also answers `manifest` and `manifest_sha`, two keys
   the plane's `published` SELECT does not carry** (they belong to `cases[]`). Named as WIDER
   THAN THE WIRE; a fixture inventing a column is the same class pointing the other way.

I did not touch any of these files. `preauth-vocabulary.test.mjs`'s `cases[]` row is mine and I
left it narrow DELIBERATELY for the reason in (2) — correcting it would have been the fence
tighter than its rule that `WORKER.md` warns about, and would have moved this file's measurement
basis a second time for no measured reader.


## CLAIM 2026-09-10 CONTENT-PDF (CPDF-13 — the CALIBRATION construct, its chain reference, and the scheduled re-probe; D-183 / D-253)
session: CPDF-13 worker (worktree `.claude/worktrees/agent-ab1e3df0de5e3b8ec`, branch `worktree-agent-ab1e3df0de5e3b8ec`)
opened: 2026-09-10
paths:
  - `bio-plane/src/calibration.mjs` — **NEW**. The construct: what a calibration IS, the
    BETTER/WORSE/SAME comparison, the asymmetric drift verdict, the declared cadence constant,
    and the announcement-signal rule (may only SHORTEN). Holds no engine, exactly as
    `textchain.mjs` holds none.
  - `bio-plane/src/textchain.mjs` — the CALIBRATION REFERENCE on a derivation step and the
    `calibrationsOf(chain)` reader ONLY. No existing rule, refusal or export changes shape.
  - `bio-plane/src/schema.mjs` — **APPEND ONLY**, immediately BEFORE the `host_governor` block:
    `calibrations`, `calibration_signals`, `calibration_subjects`. Plus ONE additive column on
    the DERIVED `reading_text_source` projection (`calibrations`) and its index.
  - `bio-plane/src/store.mjs` — **THE CALIBRATION REGION ONLY**: the four calibration store
    methods, ONE APPENDED `#schedConsumers` entry (`calibration-reprobe`), the
    `#writeTextSource` projection's new column, the four `#dispatch` rows, and the three new
    table names in `purge`'s derived list (D-113). **NOT** `publish()`, **NOT** any case
    surface, **NOT** `#aiRun*`, **NOT** `taskDrain` — CASE-5b is live on the publish path.
  - `bio-plane/src/index.mjs` — the four rows in the op-class registry, the two reading-read
    set memberships, and `layerChainFor`/`ocrTextFromMember` gaining the calibration reference.
    **NOT** the case/publish dispatch.
  - `bio-plane/checks/bio-checks.mjs` — **APPEND ONLY**: the `CALIBRATION_CHECKS` family (C-42)
    and `CALIBRATION_DRIFT_CHECKS` (C-43). No existing family edited. (The suffix `_CHECKS` is
    reserved and harvested by the DEC-49 guard — that is intended here: these ARE refusal
    families.)
  - `bio-plane/test/calibration.test.mjs` and `bio-plane/test/calibration.control.mjs` — **NEW**,
    this item's suite and its negative-control harness.
  - `bio-plane/scripts/coverage.mjs` — the `REGISTER_FLOOR` figure ONLY, moved to the figure the
    instrument PRINTED. ONE key set, collapsed if it conflicts.
  - `docs/development/INTERFACE-CHANGES.md` — APPEND: IC-72 (I5) and IC-73 (I2).
  - `docs/development/SCHEDULER.md` — APPEND: the calibration consumer and THE CADENCE'S COST,
    stated so no group discovers it as a surprise.
  - `docs/development/DEBT.md` — the D-183 and D-253 disposition cells ONLY.
  - `docs/development/MEASUREMENTS.md` — APPEND: this item's figures.
  **NOT** `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground). **NOT**
  `newgroup/**`. **NOT** `civicos-ui/**` (nothing on I3 moves; measured, and stated in IC-72).
  **NOT** `bio-plane/src/pdfstructure.mjs`.

  **PATHS ADDED AFTER THE FIRST BATTERY, each because a TOTALITY GUARD OR A RATCHET DEMANDED
  IT — listed here rather than absorbed, because a claim that grows silently is not a claim:**
  - `bio-plane/src/affordances.mjs` — the `RUNG_ABSENT` table ONLY, three appended rows.
    `test/rung-ladder.test.mjs` refuses a mutating op that carries neither a rung nor a STATED
    absence, and named all three of mine.
  - `bio-plane/test/gate-reads.test.mjs` — the `GATED` and `UNGATED` tables ONLY, one row each.
    Same shape: its sweep refuses an unclassified read and named both of mine.
  - `bio-plane/test/airun.test.mjs` — ARM S1's pinned consumer-count delta ONLY (10→11),
    CORRECTED at its site with a dated reason, never loosened to a floor.
  - `bio-plane/test/hygiene.test.mjs` — the `EXEMPT` map only (D-113's purge-or-exempt census).
  - `bio-plane/test/bounds.test.mjs` — a fixture (two calibrations, so a cap of 1 provably bites),
    one `DRIVEN` row, and the capped-op roster pin 30 → 31, MEASURED from what the walk PRINTED.
    `op=calibrations` joined the roster as a new capped read and the suite refuses a roster op
    nobody drives.
  - `bio-plane/test/versionchain.test.mjs` — **NOT EDITED.** Its total version-edge sweep named a
    `calibrations.superseded_by` column; the guard was left alone and MY COLUMN WAS RENAMED to
    `replaced_by`, with the reasoning at the column. Loosening a total sweep to admit a lookalike
    is how a guard stops being total.
  - `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane/dist/bio-plane.bundle.json` —
    **REBUILT, because FL-10's guard (landed in the two commits this worktree fast-forwarded
    onto) FAILS a plane artifact that is stale against its sources.** `npm run build` in
    `bio-plane/`; `src/signpage.mjs` regenerated BYTE-IDENTICALLY and is not in the diff,
    exactly as FL-10's release note said it would be. No version bumped, nothing signed,
    nothing deployed — that is DIST's.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `4a0c248` and verified on the MERGED tree: battery 172/172 · 10,669 (pre-merge 10,537 + the attributed +132, closing exactly), `coverage --strict` exit 0 read unpiped with `REGISTER_FLOOR` collapsed to ONE SET and re-read from the merged run's print (892/166/167 — both branches had moved it blind to each other, the claim's own predicted conflict), UI harness exit 0, `mintid --audit` 0 breaks.

## CLAIM 2026-09-10 M0 (D-302 — the fifth walk-derived floor gets a REPRODUCIBLE figure, and the GUARDED/NAMED column stops answering about the wrong file)
scope: `DEBT.md`'s D-302 row is the authority. Two clauses. **(1)** `sweep()` in
  `scripts/op-claims.mjs` publishes no `attributionsRepro`, so `test/op-claims.test.mjs`'s
  FIFTH walk-derived floor (`attributions.length >= 4`) stands over the WORKING TREE, where an
  uncommitted arrival can only push it UP (D-238's payload). Compute the figure beside the
  existing four, move the floor onto it from a PRINTED run, and remove the working-tree
  chokepoint passage at that site. **(2)** `scripts/walkfloor.mjs` decides `guarded` with a
  regex for an import of `provenance.mjs` — a predicate answering about the WRONG FILE, which
  is why four genuinely-guarded floors grade UNGUARDED and eleven working-tree floors grade
  GUARDED. Decide GUARDED/NAMED from the classification D-265 put ON THE VALUE (the
  `reproducible` bucket of the walk's own `walkResult()` declaration), and re-measure every
  census figure the change moves from PRINTED output.
paths:
  - `bio-plane/scripts/op-claims.mjs` — the `sweep()` repro figures ONLY (one new
    `attributionsRepro`, and the attribution resolution lifted into ONE helper so the two
    populations cannot drift). No existing key renamed, removed or re-populated.
  - `bio-plane/scripts/walkfloor.mjs` — the `guarded` predicate, the bucket reader it is
    replaced by, the key-carrying flow, and the CLI report's column.
  - `bio-plane/test/op-claims.test.mjs` — the fifth floor's site and its reason constant.
  - `bio-plane/test/hygiene.test.mjs` — the D-268 cross-file block ONLY: `CROSS_FILE_NAMED`,
    the self-application arm (5), and the D-265 chokepoint block's `PASSAGES_NAMED` reason for
    `op-claims.test.mjs`. **WIDER THAN THE BRIEF'S "the passage ratchet's figure only", and
    deliberately**: clause (2) moves which files grade GUARDED, so the GUARDED-or-NAMED ratchet
    and its named list MUST move with it or the ratchet goes red for a correct estate. Every
    other arm in the file is untouched.
  - `bio-plane/test/walkfloor.test.mjs` — the estate arms whose grades move, appended arms for
    the bucket reader. No existing arm deleted.
  - `bio-plane/test/walkfloor.control.mjs` — the `overstrict` arm's FIXTURE, corrected (not
    exempted): under the new rule, correct work is a floor on a REPRODUCIBLE figure, not a file
    that happens to import `provenance.mjs`. Plus the three D-302 arms appended.
  - `docs/development/DEBT.md` — the D-302 row's disposition.
  - `docs/development/MEASUREMENTS.md` — APPEND, one dated section.
  **NOT** `bio-plane/src/**`, **NOT** `bio-plane/checks/bio-checks.mjs`, **NOT**
  `bio-plane/scripts/walkfigure.mjs` (D-265's chokepoint is CONSUMED, not reshaped), **NOT**
  `civicos-ui/**`, **NOT** `newgroup/**`, **NOT** `docs/development/QUEUE.md`.
concurrency: checked over the whole register. The only LIVE claim is FLEET's FL-10
  (`scripts/fleet-bundle.mjs`, `embed-signpage.mjs`, `build-plane.mjs`, `package.json`,
  `fleetbundles.*`, `dist/**`) — this claim names none of them, and only READS
  `fleet-bundle.mjs` through the census. A CASE-5b worker holds `store.mjs`/`index.mjs`/
  `bio-checks.mjs` and the case suites, and an M0-23 worker holds
  `civicos-ui/test/preauth-vocabulary.test.mjs`; neither path is here.

### AMENDMENT 2026-09-10 to the D-302 claim above — ONE PATH ADDED: `bio-plane/scripts/coverage.mjs`, the `REGISTER_FLOOR` `arms:` FIGURE ONLY
  Not foreseen when the claim was written, and owed rather than opportunistic: D-302's three new
  negative-control arms took `test/walkfloor.test.mjs`'s declaration from EIGHT to ELEVEN, and
  `node scripts/coverage.mjs --strict` printed `arms 891/888 · GREW by 3 arm(s)`. A floor with
  slack is not a ratchet, so the figure is MOVED IN THE SAME TURN to the one the run PRINTED —
  891 — never incremented by hand. **`REGISTER_FLOOR` has ONE key set on purpose** and this edit
  keeps it that way: verified 1 `arms:` inside the object (the second `arms:` in the file at line
  724 is the FLEET floor, a different object, UNTOUCHED at 58). `classified` 165 and `corpus` 166
  are UNMOVED — no suite gained or lost a declaration. Nothing else in the file is edited, and the
  reason the figure moved is written at the site so a merge conflict here resolves by re-reading a
  printed run rather than by keeping both.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `7a16642` and verified on the MERGED tree: battery 172/172 · 10,680 (10,669 + the attributed +11, closing exactly), `coverage --strict` exit 0 read unpiped with `REGISTER_FLOOR` collapsed to ONE SET a third time and re-read from the merged print (895/166/167), UI harness exit 0, `mintid --audit` 0 breaks.

## CLAIM 2026-09-10 RECORD (CASE-5b — DEC-72's CASE-LEVEL SIGNING CEREMONY, and then the deletion the ceremony is the precondition for)
session: case5b-case-signing (worktree `agent-a20204cf60f725b5b`, branch
  `worktree-agent-a20204cf60f725b5b`)
opened: 2026-09-10
paths: **NAMED BY REGION. Every live claim on RECORD's ground was released before this one
  opened (CASE-1/3/4/5, M0-22, FL-10 — checked in this file, not assumed), but the CASE
  header's rule is that precision is the only protection two workers on `store.mjs` get, so
  the regions are named anyway.**
  **`bio-plane/src/schema.mjs`** — ONE NEW TABLE, `case_documents`, placed BESIDE its `cases` /
  `published_cases` siblings and **BEFORE the `host_governor` block**; **no backticks and no
  semicolon inside any inline `--` comment** (PL-1). Plus the `purge` TABLES list gaining that
  one name (D-113 — a derived table missing from `purge` reports scope ALL and leaves rows).
  **NOT** `published_cases`, **NOT** `published_case_members`, **NOT** `cases` (CASE-1's, landed).
  **`bio-plane/src/store.mjs` — named by SITE:**
  (1) `publishCase()`: the FRONTMATTER STAMPING REGION ONLY — the six scalars/blocks this item
  deletes from every member (`case_id`, `case_edition`, `case_project`, `case_scope`,
  `bias_acknowledgement`, `case_findings`, `case_roles`, `required_strength`) and the ONE new
  call that authors the CASE DOCUMENT instead. **NOT** the owner fence, **NOT** the bar
  computation, **NOT** `BELOW_PROJECT_STRENGTH`, **NOT** the case-identity resolution, **NOT**
  the C-21.1 freshness comparison, **NOT** the member-edition allocation (CASE-5's, landed).
  (2) `publish()` (the ratify committer): the CASE BLOCK ONLY — it stops committing `cases`,
  `published_cases` and the roster from a MEMBER's bytes and keeps only the member's own
  published row, its edges and its PIN CONFIRMATION. **NOT** `EDITION_EXISTS`, **NOT**
  `EDITION_NOT_INCREMENTED`, **NOT** `#publishEdges`, **NOT** `published_shas`.
  (3) NEW methods `caseDocument()` / `ratifyCaseDocument()` and a new `#caseDocText()` author —
  appended beside the case surfaces, not spliced into an existing one.
  (4) `#caseRelationOf` / `#caseEditionState` / `#caseOfSha` callers ONLY where the removed keys
  were their input. **NOT** the run / task / capture / link / proposal / queue surfaces.
  **`bio-plane/src/index.mjs`** — (a) ONE NEW OP `caseratify` and its OP_TABLE / class / verb
  rows; (b) `op=ratify`'s ratified-frontmatter reader, which stops reading the six keys and
  takes the case relation from the PINNED ROSTER instead; (c) the CASE CONTAINER manifest, which
  gains the case document and its signature (`bio-case-container/4` -> `/5`). **NOT** the R2
  copy, **NOT** the reuse re-check, **NOT** `op=publish`, **NOT** any other op.
  **`bio-plane/src/sshsig.mjs`** — ONE new exported statement builder beside `ratifyStatement`.
  **NOT** `verifySshsig`, **NOT** the namespaces already published.
  **`bio-plane/checks/bio-checks.mjs`** — (a) `isCaseMemberBytes` / `caseEditionClaimed`, whose
  input this item deletes, CORRECTED (never exempted) with the dated reason at the site; (b)
  `checkInquiryPublished`'s C-2.8 case block, same; (c) ONE NEW FAMILY `CASE_DOC_CHECKS` — the
  case document's gate — with its own C-number taken from the catalog's own allocation. **NOT**
  `STATES`, **NOT** `checkInquiryBasis`, **NOT** `VERSION_ACT_CHECKS`, **NOT** `checkGrounds`.
  **`bio-plane/test/caseflip.test.mjs`** — the STILL-THERE block only, CORRECTED to the
  opposite assertion with the reason the old one was right before and is wrong now. No other
  arm edited.
  **`bio-plane/test/casesign.test.mjs` and `bio-plane/test/casesign.control.mjs`** (NEW) — this
  item's suite and its negative-control driver, written INSIDE this worktree (PL-10/UI-38).
  **`bio-plane/scripts/coverage.mjs`** — `REGISTER_FLOOR` ONLY, and **COLLAPSED TO ONE `arms:`
  KEY** if a merge leaves two (the six-times defect this file records).
  **`bio-plane/dist/bio-plane.bundled.mjs` + `bio-plane/dist/bio-plane.bundle.json`** —
  REBUILT, not hand-edited. **FL-10 landed three hours before this claim opened and its guard
  asserts the committed bundle is byte-identical to a fresh build of `src`, so a `src` change
  that does not rebuild turns the battery RED.** Named here because it is a consequence of
  another item's landing that this claim would otherwise look like it was trespassing on.
  **`docs/development/INTERFACE-CHANGES.md`** — APPEND of the IC-71 row only. **IC-71 is
  PRE-MINTED by CONDUCT**; no id is minted in this worktree.
  **NOT** `docs/development/QUEUE.md`, **NOT** `DECISIONS.md` (CONDUCT's sole ground).
  **NOT** `civicos-ui/**` — IC-71 measures its impact and DELEGATES; if the UI harness goes red
  a delegation cannot carry a red gate and this claim will be AMENDED in place, as CASE-4's was.
  **NOT** `newgroup/**`, **NOT** `release/**`.

### AMENDMENT 2026-09-10, MID-ITEM (CASE-5b, `case5b-case-signing`) — **SIXTEEN FILES ADDED TO THE CLAIM, AND THE HONEST REASON IS THAT A CEREMONY INSERTED BETWEEN TWO ACTS REACHES EVERY SUITE THAT DRIVES BOTH**

The claim above named the plane's five sources, this item's own two suites, `caseflip.test.mjs`,
`coverage.mjs`'s floor, `dist/**` and the IC row. It was right about the SHAPE of the change and
wrong about its REACH, in one specific way that is worth writing down rather than quietly widening:
**`op=caseratify` is a new act BETWEEN `op=publish` and `op=ratify`, so every suite that drove those
two in sequence now drives three.** That is not a consequence the claim could have measured without
building the thing first, and it is recorded here rather than in the report so the next worker on
RECORD's ground sees it in the register where a claim is actually checked.

**TWO PLANE SOURCES, both registration surfaces rather than logic:**

- `bio-plane/src/affordances.mjs` — TWO ROWS. `RUNG_ABSENT.caseratify` (its subject is a case
  edition keyed `(case_id, edition)`, not a bundle in a state) and `RUNGS.caseratify = "attested"`
  (its authority is a registered signer's key, which is `ratify`'s own rung and not a new one).
  Both are TOTALITY tables — `affordances.test.mjs` and `rung-ladder.test.mjs` fail BY NAME on a
  mutating op classified nowhere — so this is a file the item had to touch the moment it minted an
  op. **NOT** `ACTS`, **NOT** the affordance derivation, **NOT** any other row.
- `bio-plane/src/gate.mjs` — ONE new export, `runCaseGate`, beside `runGate` and reporting the same
  `GATE_VERSION`. **NOT** `runGate`, **NOT** `CATALOG_VERSION`.

**ONE NEW SHARED TEST FIXTURE:** `bio-plane/test/caseceremony.mjs` (NEW), on
`publishingproject.mjs`'s precedent and for its stated reason — nine suites needing one ceremony is
nine implementations of it otherwise. `casesign.test.mjs` deliberately does not use it.

**NINE SUITES WHOSE PUBLISH→RATIFY SEQUENCE GAINED THE CEREMONY**, each edited at its own publish
helper and at the assertions the flip superseded, every superseded assertion CORRECTED with a dated
reason at the site and none exempted: `publish`, `multifinding`, `publishedcase`, `caseflip`,
`casepin`, `caseproduction`, `caselifecycle`, `reevaluation`, `caseobject`.

**FOUR FLOOR/REGISTRY SUITES**, each because this item moved a figure it is the ratchet for, and
each figure moved from what a green run PRINTED:
`gate-reads.test.mjs` (one UNGATED classification for `op=casedocument`),
`rung-ladder.test.mjs` (`attested` is three acts, not two),
`derivation-bounds.test.mjs` (31 → 32, the arrival is `#caseClaimInBytes`, its bound measured and
stated), `meaning-bounds.test.mjs` (BARE 38 → 39, the arrival is `op=caseratify`; OPAQUE 10 → 9,
the departure is `publish->publish` and **a figure FALLING carries its reason at the site**).

**ONE SUITE WHOSE FIXTURE THIS ITEM INVALIDATED:** `repair-reachability.test.mjs` — its
published-ceremony probe made a document read as a case member by handing in `case_id` +
`case_edition`, which this item REFUSES, so the probe was arming this item's own refusal instead of
the ceremony and would have gone hollow in exactly the way its own comment warns about.

**AND ONE CHECK DELETED RATHER THAN REHOMED**, named here because a deleted check and a check
nobody noticed are the same diff: `checkCompletenessFreshness` in `checks/bio-checks.mjs`. All
three of its inputs left a member's bytes with this item, so it would have returned early on every
document forever. C-21.1 at case altitude runs in `checkCaseDocument`; `publishCase()`'s own
CARRIED_FORWARD refusals are untouched, so the two-sided pairing REC-14 built survives one altitude
up.

**STILL NOT TOUCHED, as the claim promised:** `civicos-ui/**` (IC-71 measures the impact as ZERO
code — the UI's reads are WIRE fields that do not move — and DELEGATES the two stale prose comments
to CASE-6, which owns that page), `newgroup/**`, `release/**`, `docs/development/QUEUE.md`,
`DECISIONS.md`, `purge`'s existing exemptions, and `published_cases` / `published_case_members` /
`cases` as tables.

### DELEGATION 2026-09-10 RECORD (CASE-5b) -> CASE-6 / UI: **TWO COMMENTS IN `civicos-ui/app.html` NOW DESCRIBE A RULE DEC-72 DELETED, AND THE CODE UNDER THEM IS CORRECT**

**MEASURED IMPACT OF CASE-5b ON `civicos-ui/`: ZERO CODE.** The UI's reads of `case_id`,
`required_strength` and the per-member bar are all **WIRE FIELDS**, not frontmatter keys:
`cases[].case_id` and `caseMembers[].case_id` come from `published_cases` / `published_case_members`
(still written, now from the case document's signature instead of a member's), and `row.required`
comes from `published_bundles.required` (still written, now sourced from `published_cases.bar`).
Nothing the UI reads moved, and `node civicos-ui/test/run.mjs` is green on this branch.

**WHAT IS STALE IS PROSE, AND IT WAS ALREADY HALF-STALE BEFORE THIS ITEM.** Two comments —
`civicos-ui/app.html` ~15086 (`pubBarHtml`) and ~15708 (`pubIndex`) — justify rendering the bar PER
FINDING with the sentence *"`required_strength` is frozen into the finding's own bytes and two
findings of one case may have been held to different standards."* **DEC-72 clause 2 removed that
possibility** (the bar is the CASE's property, read from the publishing project at act time), CASE-5
moved the authority to `published_cases.bar`, and CASE-5b removed the per-member stamp those
sentences point at. The rendering still reads correctly because the column is still populated; what
is wrong is the REASON given for it.

**WHY THIS IS A DELEGATION AND NOT A FIX TAKEN HERE.** Correcting the comments alone would leave
the surface still choosing the per-finding bar for a reason that no longer exists, which is half a
change. The real move is for the published case page to render the CASE's bar as the case's — which
`op=publishedmanifest` has served as `cases[].bar` since CASE-5 (IC-66 named it unread, with
reasons, and pointed here). **That is CASE-6's ground**: it owns the published case page and its
`accepts-when` already requires the bar shown as the case's property. This claim says `NOT
civicos-ui/**` and the harness is green, so there is no red gate forcing the issue — which is the
condition under which a delegation is the right instrument rather than an excuse.

**WHAT CASE-6 INHERITS, PRECISELY:** two comments to correct, one field to switch to
(`cases[].bar`, already on the wire), and the per-finding bar to keep or retire as a DESIGN call —
DEC-72 says the bar is one fact about the case, and the design doc separately says each claim's own
derived strength is displayed beside the case's standard, so the pair is `strength` per finding and
`bar` per case.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `ac2941e` and verified on the MERGED tree: battery 173/173 · 10,753 (10,680 + the attributed +73, closing exactly suite for suite), `coverage --strict` exit 0 read unpiped (OPS 171/171, CHECKS 249/249, `REGISTER_FLOOR` collapsed a fourth time and verified by print at 901/167/168), UI harness exit 0, `mintid --audit` 0 breaks, `dist/**` rebuilt on the merged tree. IC-71 RESOLVED in the same act: I3 11.0.0, I5 1.10.0.


## CLAIM 2026-09-10 M0 (M0-24 — M0-23's census delegation, the fixable half: a `publishedmanifest` fixture that cannot represent the record's own published shape)
session: M0 worker (worktree `.claude/worktrees/agent-a48e1c6d709be1620`, branch `worktree-agent-a48e1c6d709be1620`)
opened: 2026-09-10
paths:
  - `civicos-ui/test/auth-surface.test.mjs` — the `MANIFEST` fixture (its `published[]` rows
    corrected to the nine columns the plane's own `SELECT` carries, the two PHANTOM keys
    `manifest`/`manifest_sha` DELETED from those rows, and the `cases[]`/`caseMembers[]` arrays the
    plane always sends added so a loose ratified finding WITH a pair is representable), plus any
    assertion the corrected fixture moves — corrected at its site with a dated reason, never
    exempted — plus the assertions that READ the corrected shape, without which the correction is
    decoration (M0-23's own measured finding), and the file's summary line.
  - `docs/development/CLAIMS.md` (this entry).
  **NOT** `civicos-ui/check-mock-envelope.mjs` — it is the INSTRUMENT that measured this item and a
  subject may not edit its own instrument; if it needs a change it is DELEGATED with the reason.
  **NOT** `civicos-ui/test/preauth-vocabulary.test.mjs`, **NOT** `civicos-ui/test/publishedcase.test.mjs`
  (M0-23 and UI-56 just landed in them; they are READ ONLY here, as the peers whose wire shape this
  fixture is corrected against), **NOT** `civicos-ui/app.html` (this item changes no surface — the
  record's shape did not move, only a mock's ability to represent it), **NOT** `bio-plane/src/**`
  (the plane already answers all nine columns; CASE-5b holds the publish path), **NOT**
  `bio-plane/test/op-claims.test.mjs` or `bio-plane/scripts/walkfloor.mjs` (D-302 is live in them),
  **NOT** `docs/development/QUEUE.md` (CONDUCT's sole ground).
  **`cases[]` IS LEFT AT 6/9 DELIBERATELY**, matching both peer suites: M0-23's census measured ZERO
  readers in `app.html` of `bias_acknowledgement`, of `project_id` and of a case-level `bar`, and a
  fence tighter than its rule is the over-strictness this estate refuses. The census NAMES it every
  run, which is the correct disposition and is this item's second control arm.

### DELEGATION 2026-09-10 (M0-24 → whoever next holds `civicos-ui/check-mock-envelope.mjs`) — the census's REACH, measured from its own headline
I did not touch the instrument that measured me, deliberately: a subject may not edit its own
instrument. Two things its own printed figures say, neither of them a defect and neither closeable
from inside my claim:

1. **THE CENSUS'S SUBJECT IS EFFECTIVELY ONE OP.** Its headline reads `37 resolved through the DO's
   OWN dispatch table to a store method … and **1 of those** build at least one row array from a
   readable SELECT (36 build their answer some other way and are outside this census by
   construction)`. That one op is `publishedmanifest`. So "the fixture-shape class is closed in
   reach" means closed on four arrays of one op — the arm says so every run, in its own
   CANNOT-SEE sentence, and it is repeated here because a reader meeting `3 NARROWER THAN THE
   WIRE` beside `108 answers across 44 ops` will read a far wider estate than was measured. Whether
   the other 36 are genuinely un-SELECTable or merely unreadable BY THIS READER is UNDETERMINED and
   I did not establish it; it is the difference between a census whose corpus is one op by the
   plane's construction and one whose corpus is one op by its own reader's limits.
2. **MY OWN ITEM'S FIRST ARM MEASURED THE REPORT/FAIL BOUNDARY WORKING AS DESIGNED.** With a phantom
   key restored, arm C re-reported the row as WIDER THAN THE WIRE naming the key — and exited 0.
   That is correct and is why this estate needed an ASSERTION in the suite rather than a louder
   census. It is recorded so nobody later "fixes" the census by making it fail: the report-only
   rule is what keeps a legitimately narrow fixture legal, and M0-24's arm (h) measured both
   spellings of that.

After this item the census reports ZERO rows WIDER THAN THE WIRE and ZERO fields ABSENT FROM A
FIXTURE across the whole package, and the three NARROWER rows that remain are ONE deliberate
closure in three suites — `cases[].bias_acknowledgement`, `.bar` and `.project_id`, which no
surface in `app.html` reads.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `db1df93` and verified on the MERGED tree: battery 173/173 · 10,753 (delta ZERO, predicted), `coverage --strict` exit 0 read unpiped, UI harness exit 0 (`auth-surface` 94), `mintid --audit` 0 breaks.

## CLAIM 2026-09-10 CONTENT-PDF (CPDF-14 — the COMPOSED-SHAPE measurement: detect → crop → transcribe the crop, at n>1, against the enforced-comparable CPDF-9 floor)
session: cpdf14-composed-shape (worktree agent-a6d473988f1f33530)
opened: 2026-09-10T00:00:00Z
paths:
  - `bio-plane/test/ocr-composed-probe.mjs` — **NEW**, and the only file this item adds. A PROBE,
    deliberately NOT named `*.test.mjs` so the battery's discovery rule (`scripts/battery.mjs`:
    readdir + `endsWith(".test.mjs")`) never picks it up and it needs no skip marker. It commits
    no product code and changes nothing the plane runs — verified by the suite count being
    IDENTICAL with the file present.
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  - `docs/development/DEBT.md` — **APPEND ONLY**: D-305 and D-306, both RAISED by this item,
    both minted with `tools/mintid.mjs`. No existing row edited.
  **READ, NEVER EDITED** (named so the next reader knows the coupling is deliberate and one-way):
  `bio-plane/test/ocr-measure-probe.mjs` (CPDF-9's floor — its ground truth and its four metric
  expressions are READ AT RUN TIME, never copied), `bio-plane/test/ocr-moondream-probe.mjs`
  (CPDF-11's ladder recipe and its one prompt, likewise read not copied), and
  `bio-plane/test/ocr-moondream-worker.mjs` (the scratch Worker source, uploaded VERBATIM under
  this item's own scratch slug `bio-ocrcomposed`, then deleted and verified gone).
  **NOT** `bio-plane/src/**` — this item writes no product code at all. **NOT** the case suites
  (a CASE-5b worker was live there; its work is now on `main` and this worktree fast-forwarded
  onto it). **NOT** `op-claims`/walkfloor ground (a D-302 worker held it; likewise landed).
  **NOT** `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground). **NOT**
  `bio-plane/scripts/coverage.mjs` — no floor here can move, because a probe declares no checks.
  **NOT** `newgroup/**`. **NOT** `civicos-ui/**`. **NOT** `bio-plane/dist/**` — nothing this item
  writes is a plane source, so FL-10's staleness guard has nothing to catch.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 173/173 · 10,755 (+2 fully attributed to planning-hygiene on the two new DEBT rows), `coverage --strict` exit 0 read unpiped, UI harness exit 0 from the repo root, `mintid --audit` 0 breaks. The verdict is enacted: CPDF-10 re-routed to blocked-on-DEC-74; DEC-73 and DEC-74 raised.

## CLAIM 2026-09-10 M0 (D-301 — the class census is comment-blind and NOT string-blind: a walking FIXTURE counts as a walk)
session: d301-census-stringblind (worktree `agent-a3a3f27c44675daff`, branch
  `worktree-agent-a3a3f27c44675daff`)
opened: 2026-09-10
scope: `DEBT.md`'s D-301 row is the authority. The class census in `hygiene.test.mjs` runs its
  discovery matcher over a LOCAL comment-stripper, so a discovery primitive inside a fixture
  template literal is counted as a walk — `bio-plane/test/walkfigure.test.mjs` was enumerated as
  a NEW UNGUARDED WALK while containing no walk at all. Run the matcher over the estate's ONE
  lexer (`strip`, exported by `scripts/walkfloor.mjs`), never a second one, then RE-MEASURE the
  census count, the REACH floor and `CLASS_NAMED_UNGUARDED`'s membership FROM PRINTED OUTPUT,
  every drop NAMED with its reason. A measurement, not an edit.
paths:
  - `bio-plane/test/hygiene.test.mjs` — the CLASS CENSUS block ONLY (the local `codeOnly`
    reader it deletes, the `walks` line, the block's own comment, the REACH floor's figure,
    `CLASS_NAMED_UNGUARDED`'s membership) and the suite's `NEGATIVE CONTROL:` declaration at
    line 1, appended. **NOT** the D-268 cross-file block below it, **NOT** the D-265 chokepoint
    block, **NOT** any other arm in the file.
  - `bio-plane/scripts/walkfloor.mjs` — `strip`'s TEMPLATE-LITERAL BRANCH ONLY, gaining one
    option (`keepInterpolations`, DEFAULT OFF so no existing caller's behaviour moves) and one
    named export (`stripToCode`) that spells the census's question once. **CONSUMED, NOT
    FORKED** — the estate keeps exactly one lexer. **NOT** the `guarded` predicate, **NOT** the
    buckets, **NOT** the flow stage, **NOT** the CLI report.
  - `bio-plane/test/walkfloor.test.mjs` — §1 (the stripper's own arms) APPENDED for the new
    mode. No existing arm deleted or altered.
  - `bio-plane/test/d301-census.control.mjs` — NEW, this item's negative-control driver.
    Deliberately not a `.test.mjs`: it edits real sources while it runs, the precedent being
    `walkfloor.control.mjs` and `d249-port.control.mjs`.
  - `bio-plane/scripts/coverage.mjs` — the `REGISTER_FLOOR` `arms:` FIGURE ONLY, and only if a
    printed `--strict` run says it GREW. ONE key set, re-read from the print, never incremented.
  - `docs/development/DEBT.md` — the D-301 row's disposition.
  - `docs/development/MEASUREMENTS.md` — APPEND, one dated section.
  - `docs/development/CLAIMS.md` — this entry.
  **NOT** `bio-plane/src/**` (this item changes no plane behaviour), **NOT** `civicos-ui/**` at
  all — a CASE-6 worker is live on `app.html` and the UI suites, and the census only READS those
  files, **NOT** `newgroup/**`, **NOT** `docs/development/QUEUE.md` (CONDUCT's sole ground),
  **NOT** `bio-plane/scripts/walkfigure.mjs`, **NOT** `bio-plane/scripts/op-claims.mjs`.
concurrency: checked over the whole register rather than assumed — every claim above this one
  carries a `released:` line, including D-265, D-302 and M0-24, the three items whose ground this
  is. The only worker named as live in this session's brief is CASE-6 on `civicos-ui/app.html`
  and the UI suites; no path here is under `civicos-ui/`.

### AMENDMENT 2026-09-10 to the D-301 claim above — ONE PATH ADDED: `bio-plane/test/walkfloor.control.mjs`, ARM (6)'s ANCHOR ONLY
  Not foreseen when the claim was written, and OWED rather than opportunistic. Re-running that
  driver whole — which this item owes, because it moves the driver's subject — returned arm (6)
  `stripper` as **DID NOT ARM**: its patch anchored on `strip`'s full SIGNATURE, D-301 added one
  option to that signature, so the patch matched ZERO TIMES and the arm neutered nothing while both
  suites read a comfortable green. **An arm that did not arm is a finding, and only the driver's own
  zero-match check made it visible.** The anchor now names the first two lines of the function BODY,
  which no signature change can reach; the arm's `expect` text is corrected in the same edit (§1 of
  `walkfloor.test.mjs` is eight arms now, not three, and hygiene falls with the lexer since D-301).
  Nothing else in the driver is touched. The eleven arms' FIGURES in `walkfloor.test.mjs`'s own
  `NEGATIVE CONTROL:` declaration went stale as well and are RE-MEASURED from that run's print,
  never adjusted by hand. **The two halves have different causes and were attributed by re-running
  rather than by subtracting**: walkfloor 39 -> 44 is this item's five new section-1 arms, while
  hygiene 665 -> 678 is CPDF-13, CASE-5b and M0-24 merging between D-302's run and this one —
  **D-301 adds NOTHING to hygiene's tally**, it replaces a reader and moves a floor, and the census
  still makes the same three ASSERTIONS. The first draft of that header said the thirteen were mine;
  the baseline run said otherwise, which is why the rule is to diff the runs.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `990181a` and verified on the MERGED tree: battery 173/173 · 10,760 (+5 closing exactly on walkfloor's new arms), `coverage --strict` exit 0 read unpiped (floor 906/167/168 by print), UI harness exit 0, `mintid --audit` 0 breaks.
## CLAIM 2026-09-10 RECORD (CASE-6 — DEC-72's SURFACES, and the arc's closing item)

worktree: `agent-ab379f634ce9616c1` · branch `worktree-agent-ab379f634ce9616c1` · from `a4c983a`.

**PATHS CLAIMED, and they are named as REGIONS rather than as files because
`civicos-ui/app.html` is 18,268 lines and a whole-file claim would fence off four
other live items for no reason:**

- `civicos-ui/app.html` — the `__PUBLICATION_ENTRY__` region (5727–5798) and the
  `__PUBLISHED_CASE__` region (14786–16348). **NOT** the inquiry page, **NOT**
  `openBundle`, **NOT** the act source, **NOT** the project workspace.
- `civicos-ui/test/publishedcase.test.mjs` and
  `civicos-ui/test/publication-entry.test.mjs` — the two suites that own those
  regions. **EXPLICITLY NOT `civicos-ui/test/auth-surface.test.mjs`**, which M0-24
  holds.
- `bio-plane/test/caseflip.test.mjs` — the MULTI-CASE MEMBERSHIP pin only (the
  arm at ~874 and its header note at ~90). CASE-5b drove that refusal so its state
  would be pinned rather than ambiguous and named CASE-6 as the item that decides
  it; correcting the pin's REASON is the discharge of that pin, not a second
  author on the suite.
- `docs/BIO_DATAPLANE_STATE.md` — the publication/case sections (the arc's
  definition of done, condition 1).
- `docs/development/CASE-AS-PRODUCTION.md` → `docs/archive/` and
  `docs/archive/README.md`'s index row (condition 2).
- `docs/development/DEBT.md` — one appended row.
- `docs/development/MEASUREMENTS.md` — appended rows only (CPDF-14 also appends
  there; appends conflict harmlessly).
- `docs/decided.index.json` / whatever `node tools/decided.mjs` regenerates
  (condition 3).

**NOT CLAIMED AND DELIBERATELY SO: `bio-plane/src/**`.** See the two determinations
below — neither the multi-case fence nor the affordance owner-gate is taken here,
and both have their reasoning recorded rather than a half-build.

concurrency: checked over the whole register. CPDF-14 holds scratch paths +
`MEASUREMENTS.md`; M0-24 holds `civicos-ui/test/auth-surface.test.mjs`. No live
claim names any path above.

### AMENDMENT 2026-09-10, MID-ITEM (CASE-6) — **TWO COMMENT-ONLY SPANS IN `bio-plane/src/store.mjs`, WHICH THE ORIGINAL CLAIM EXPLICITLY EXCLUDED**

The claim above says `NOT bio-plane/src/**` and that stands for every line of
CODE: this item changes no plane behaviour, adds no refusal, moves no wire shape.
What it adds is PROSE at two sites, and the reason it must be added rather than
recorded elsewhere is CASE-6's own brief: the fence decision is to be enacted or
kept **with the reasoning at the site**, and a decision recorded anywhere else is
a decision the next reader of that refusal will not find.

- `bio-plane/src/store.mjs`, the `FINDING_IN_ANOTHER_CASE` refusal (~5336) —
  comment only, immediately above the refusal, recording the KEEP decision and
  the census it rests on.
- `bio-plane/src/store.mjs`, `#caseOfSha` (~20614) — comment only. That helper's
  existing sentence ("Nothing writes that shape today") is the single clearest
  statement of why the fence is load-bearing, and it is pointed at the decision
  so the two cannot drift apart.

Both are inside spans no live claim names, and neither is a DEC-49 governed
region. A worker that needs to CHANGE code at either site should take it: this
amendment claims the prose, not the function.

### AMENDMENT 2026-09-10, MID-ITEM (CASE-6) — **ONE-TOKEN PATH CORRECTIONS IN NAVIGATION POINTERS TO THE DOCUMENT THIS ITEM MOVED**

Archiving `CASE-AS-PRODUCTION.md` leaves every pointer at the old path broken.
That is a defect this item CREATED, so it is this item's to sweep rather than to
delegate. **CORPUS: 27 references across 13 files**, measured by grep over
`docs/` and `bio-plane/`, `docs/DECIDED.md` (generated) excluded.

**THE FOUR SUITES THAT READ THE FILE FROM DISK NEED NO CHANGE AT ALL, and that is
worth recording as a finding rather than as a relief:** `caseflip`, `caselifecycle`,
`casepin` and `caseproduction` each already try `docs/development/` and then
`docs/archive/`, every one with a comment saying CASE-6 would move it. Four
separate workers took the same precaution unprompted. The archive move goes
through green because they did.

**WHAT IS CORRECTED — live NAVIGATION pointers only, the ones that tell a reader
where to go now:** `docs/development/MILESTONES.md` (1), `docs/development/DECISIONS.md`
(2), `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` (1),
`docs/architecture/BIO_Case_Making_v0_1.md` (1), and the header comment of each of
the 5 `bio-plane/test/case*.test.mjs` suites (prose only — no assertion, no
behaviour).

**WHAT IS DELIBERATELY NOT TOUCHED, and this is the distinction the sweep turns
on: a DATED HISTORICAL ENTRY IS A LOG, AND REWRITING A LOG TO MATCH TODAY IS
FALSIFYING IT.** Left exactly as written: `INTERFACE-CHANGES.md` (5 — each inside
a dated IC entry saying which bullet that change enacted, true when written and
still true), `CLAIMS.md` (5 — released claims from CASE-1…CASE-5, which correctly
record the path those workers were pointed at), and `docs/DECIDED.md` (generated;
regenerated in this turn). **`QUEUE.md` (2) is CONDUCT's sole writer** and is
reported rather than edited — one is a notification entry, one is CASE-6's own
`accepts-when`, and both are historical in the same sense.

### AMENDMENT 2026-09-10, MID-ITEM (CASE-6) — **ONE NUMBER IN `civicos-ui/check-refusal-codes.mjs`**

`CEILING.reachGap` lowered 41 → 40, with the reasoning at the site. **Not a fall this
item caused: CASE-6 added no code to the reach and removed none.** REC-79's own comment
in that block already reads "FELL 41 -> 40" and the NUMBER was never moved with the
sentence, so the ceiling has carried one code of slack since — the state the file's own
header calls not-a-ratchet. Measured twice on two different trees (this item's baseline at
`a4c983a` and its final), both 40 of 237. One line changed plus its comment; no matcher, no
arm, no other figure touched.

### AMENDMENT 2026-09-10, MID-ITEM (CASE-6) — **TWO SUITE FILES ADDED, BOTH THIS ITEM'S OWN**

- `civicos-ui/test/case6.control.mjs` — NEW FILE, this item's negative-control driver.
  Named `.control.mjs` deliberately: `check-refusal-codes.mjs` harvests `*.test.mjs` under
  `civicos-ui/test/` into its reach set, and a control driver that spells refusal codes in
  order to neuter them would inflate that set with codes no surface can receive.
- `civicos-ui/test/publication-entry.test.mjs` — a `NEGATIVE CONTROL:` declaration added at
  the head. The suite had none and `coverage.mjs` had been printing it in the civicos-ui
  NO CONTROL list (reported, not gated); the figure moves 25/47 → 26/47.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `9e738ae` (+ ratchet fix `715ab23`) and verified on the MERGED tree: battery 173/173 · 10,764 (+4 closing exactly), `coverage --strict` exit 0 read unpiped (floor 906/167/168 unmoved), UI harness exit 0 after the M0-24 cross-item ratchet was corrected at the cause and D-286's D0b flake passed its one re-run, `mintid --audit` 0 breaks. THE CASE ARC IS DONE; the plane residue is D-309, an item.

## CLAIM 2026-09-10 RECORD (D-310 — the DEC-8 disagreement on the heaviest act: `op=affordances` offers `publish` to a caller `publishCase()` refuses BY NAME)
session: d310-publish-position (worktree agent-adfe47f738e1ba61b, branch `worktree-agent-adfe47f738e1ba61b`, from `main` at `20bb1cf`)
opened: 2026-09-10T00:00:00Z
paths:
- `bio-plane/src/store.mjs` — **ONLY the `affordanceFacts()` method body**, which is the one
  `#affordanceFacts` region: ONE new FACT (`project_owner`) beside `case_member`, derived by
  consuming the EXISTING `#isProjectOwner` predicate (the owner rule is never restated), plus
  the comment that states it. **NOT** `publishCase()`, **NOT** `#caseRelationOf`, **NOT**
  `#caseOfSha`, **NOT** any reader of `published_case_members`, **NOT** the publish/ratify
  path, **NOT** `#queueOptions`, **NOT** `#isProjectOwner` itself, **NOT** the DO dispatch
  map. **D-309 IS LIVE ON `store.mjs`'s `published_case_members` READERS AND THE PUBLISH
  PATH** (QUEUE D-309, spawned the same day): none of those sites is in this claim, and if a
  merge puts this item's fact inside a span D-309 also moved, **this claim yields and the
  conflict is a DELEGATION naming D-309**, not a keep-both.
- `bio-plane/src/affordances.mjs` — **ONLY** (1) the `publish` ACT entry's `applies` predicate,
  which gains ONE clause consuming the new fact, and its comment; (2) the facts-shape note in
  the header if the fact list is spelled there; (3) **COMMENT ONLY** above the seven
  `project*` rows of `NON_ACTS` — the roster-act DECISION argued at its own table, no key
  added, no key removed, no reason string's classification changed. **NOT** `ACTS`'
  membership, **NOT** any other act's predicate, **NOT** `RUNGS`/`RUNG_ABSENT`,
  **NOT** `VOCABULARIES`, **NOT** `DISPOSITIONS`/`REOPENABLE_FROM`, **NOT** `deriveActs`.
- `bio-plane/src/query.mjs` — **ONLY `viewerPredicate`'s return sites**, which gain the
  member id the function ALREADY computes (`member: memberId`) so the store consumes the ONE
  viewer parser instead of writing a second one. **NOT** the regex, **NOT** the gate SQL,
  **NOT** any `scope` value, **NOT** `GATE_MARK`, **NOT** `compile`/`FIELDS`/`FTS_COLUMNS`.
- `bio-plane/test/affordances.test.mjs` — this item's assertions (the ONE agreement property,
  and the over-strictness pair). **DEC-39's byte-read pin in this file reads
  `docs/development/DECISIONS.md`, which this item does not touch**; if this change moves
  pinned bytes anywhere, the pin is CORRECTED at the site with a dated reason, never exempted.
- `bio-plane/test/d310.control.mjs` — **NEW**, this item's negative-control driver. Named
  `.control.mjs` deliberately: it EDITS REAL SOURCES while it runs and the battery must not
  discover it (`caseproduction.control.mjs`'s precedent).
- **Superseded act-list pins in OTHER suites, CORRECTED with dated reasons and never
  exempted** — the set is MEASURED from the battery delta rather than guessed, and every one
  is named in an amendment to this claim before it is edited.
- `docs/development/INTERFACE-CHANGES.md` — the appended **IC-75** row (I3), filed BEFORE the
  code is written. The version bump and the RESOLUTION are CONDUCT's.
- `docs/development/DEBT.md` — **ONLY** the D-310 row's disposition and ONE appended row
  (**D-311**, minted, the seven roster acts' decision made into an item).
- `docs/development/CLAIMS.md` — this entry.
**NOT** `docs/development/QUEUE.md` (CONDUCT's, sole writer). **NOT** `civicos-ui/app.html` —
the publication surface's act-gated render is affected and is a DELEGATION below, not an edit.

### AMENDMENT 2026-09-10, MID-ITEM (D-310) — **FIVE PATHS ADDED, AND ONE PREDICTION IN THE ORIGINAL CLAIM MEASURED WRONG**

- `bio-plane/test/caseproduction.test.mjs` — **ADDED, and it is where the item's
  headline assertion actually belongs.** The claim above expected the behavioural half in
  `affordances.test.mjs`; that suite drives every affordance call with a MACHINE token
  (`mem-rec19`), so it cannot express "an owner is offered the act and a non-owner is not"
  at all. CASE-2's suite already builds the roster the question needs — an owner, a joined
  non-owner holding the `publish` capability, an administrator who owns nothing — and its
  §3 IS the owner fence. New section **§3a** (the ONE agreement property, a probe guard, a
  fixture-uniformity guard, the machine over-strictness arm, the DEC-69 arm, a
  nothing-moved arm) plus **one line changed**: `omar`'s session token is kept instead of
  discarded. Nothing else in that file moved.
- `bio-plane/test/d310.control.mjs` — NEW, this item's control driver (as claimed).
- `.gitignore` — **TWO lines**: `.d310-harness/` (the driver's pen, beside `.case2-harness/`
  and for the reason written at every pen above it) and `.d310-runs/` (this session's run
  logs, kept inside the worktree — the battery's residue check MEASURED this session
  writing a baseline into `/private/tmp` and NAMED it as an unfenced shared path, D-237).
- `bio-plane/src/query.mjs` — as claimed, and the shape is confirmed narrow: three return
  sites gain `member`, nothing else. `meaningread.test.mjs` pins this function's SOURCE
  span (it locates the end by searching forward from `scope: "participant"`) and
  `hygiene.test.mjs` pins that it holds no literal machine prefix — both re-run green.
- `docs/development/DEBT.md` — as claimed: the D-310 row's disposition and the appended
  **D-311** row.

**WHAT THE CLAIM PREDICTED AND THE MEASUREMENT DENIED, stated because a wrong prediction
that goes unrecorded reads as a thing nobody checked: NO act-list pin in any other suite
moved.** The claim above reserved "superseded act-list pins in OTHER suites, corrected with
dated reasons". None was owed. Measured rather than assumed — the twelve suites that pin an
inquiry's published acts (`conclude`, `reopen`, `caselifecycle`, `divide`, `inquiryground`,
`citeinquiry`, `queue` and the rest) all drive `op=affordances` with a **machine-class
token**, whose positional fact is `null`, so the narrowing cannot reach them. That is the
same property the over-strictness arm exists to protect, arriving as the reason the blast
radius was zero.

### DELEGATION 2026-09-10 RECORD (D-310 / IC-75) -> UI: **THE PUBLICATION STATEMENT IS GATED ON AN ACT THAT IS NOW PER-CREDENTIAL, SO THE ONE PARAGRAPH THAT STATES THE OWNER RULE DISAPPEARS FOR EXACTLY THE READERS IT WAS WRITTEN FOR**

**Not edited here.** `civicos-ui/app.html` is UI's ground and this is a design decision
about a statement, not a mechanical follow-on.

**The site, measured:** `publicationEntryHtml()` (~:5873) opens
`const act = (r && r.ok) ? actNamed(r.acts, "publish") : null; if(!act) return "";`. Until
today the presence of `publish` in `op=affordances`' answer was a fact about the OBJECT —
concluded, not already in a case — which is exactly what that gate wanted to ask. D-310
makes it a fact about the OBJECT **and the reader's position**. So for a member who owns no
project the whole "Publishing this case" section stops rendering, including the
`data-pubwho` paragraph CASE-6 wrote for precisely that member: *"A case is published BY A
PROJECT, and only by an owner of it."* CASE-6's own header says why it is there — *"finding
that out from an operator after assembling a case is the worst possible moment to learn
it"* — and the fence would go back to being learned by silence. The act bar's "It has a
section of its own further up this page" line (~:6223, `elsewhere:["publish"]`) goes with
it. **No control is lost, because DEC-33 defers the ceremony and the page wires none.**

**The constraint this has to be solved inside, and it is that header's own:** *"NO
PER-CREDENTIAL VARIANT. A version of this that checked whether the reader is an owner and
shortened itself for everyone else would be forcing a mode, and it would also be the
surface composing a position rule out of facts, which is what `affordances.mjs` exists to
stop anyone doing."* So the fix is to gate the STATEMENT on the OBJECT again — it is a
statement about the record, not a control — and not to branch it on the reader.

**Measured as NOT breaking the UI harness:** `civicos-ui/test/publication-entry.test.mjs`
and `case6.control.mjs` drive a MOCK plane with hand-built `acts` arrays, so nothing there
moves; `SURFACES.inquiry.acts` still names `publish` correctly, because the plane still
publishes it. `node civicos-ui/test/run.mjs` from the repo root is green on this branch.
The cost is to a real reader, not to a suite, which is why it is delegated rather than left.

### AMENDMENT 2026-09-10, MID-ITEM (D-310) — **TWO BUILD ARTIFACTS ADDED, BECAUSE FL-10's GUARD MADE THEM PART OF ANY PLANE-SOURCE CHANGE**

`bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane/dist/bio-plane.bundle.json`, rebuilt
with `npm run build` in `bio-plane/` and committed with the change. **Not a judgement call
and not a version bump:** FL-10's arm in `fleetbundles.test.mjs` went red on this branch
naming all three changed sources by sha256 and printing the instruction — *"Run `npm run
build` in bio-plane/ and commit the artifact with the change"* — which is the guard doing
exactly what it was built for (a stale plane artifact FAILS instead of shipping). Baseline
had this suite at 50 pass / 0 fail; the change took it to 46/4; the rebuild returns it.
**Nothing was signed, no version was bumped, nothing was deployed** — that is DIST's, and
`package.json` still reads 0.56.0. `src/signpage.mjs` was re-embedded by the build script
and came out byte-identical, so it carries no diff.

### AMENDMENT 2026-09-10, MID-ITEM (D-310) — **ONE PATH ADDED: `docs/DECIDED.md`, REGENERATED AND NOT HAND-EDITED**

`node tools/decided.mjs` re-run because this item RULES on something — the seven roster
acts STAY `NON_ACTS`, argued at their table and carried as D-311 — and `plancheck` fails on
the drift. 682 rulings, 190.8 KB. No line was written by hand.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 173/173 · 10,779 (+15 attributed per suite, the worker's mintid +1 reconciled to 20bb1cf's own prose), `coverage --strict` exit 0 read unpiped (floor 906/167/168 unmoved), UI harness exit 0, `mintid --audit` 0 breaks. IC-75's delegation is UI-57, an item; the 16 orphaned workerd processes were verified idle and killed.

## CLAIM 2026-09-10 UI (UI-57 — IC-75's delegation: the publishing statement goes back on the OBJECT, and only the act-shaped affordance inside it stays on the act)
session: UI worker (worktree `.claude/worktrees/agent-ad3cc6110399bc6c6`, branch `worktree-agent-ad3cc6110399bc6c6`)
opened: 2026-09-10
paths:
  - `civicos-ui/app.html` — **THE `publicationEntryHtml` REGION ONLY** (between the
    `__PUBLICATION_ENTRY_START__` / `__PUBLICATION_ENTRY_END__` markers): the function's gate, the
    act-shaped leading clause, and the region header's WHEN-IT-RENDERS paragraph. Plus the FIVE-LINE
    `pubEntry` comment immediately above `const pubEntry = publicationEntryHtml(actsR);` in
    `openInquiry` (~:6191), which states the old gate as a fact and would otherwise describe a
    constraint nothing enforces. No other function, no markup, no CSS, and the `elsewhere` call
    itself is UNCHANGED.
  - `civicos-ui/test/publication-entry.test.mjs` — the fixture gains a NON-OWNER's concluded
    inquiry (the class D-310 narrowed for) and the block-6 assertions that read "absent where the
    act is absent" are CORRECTED at their site with a dated reason, never exempted.
  - `civicos-ui/test/case6.control.mjs` — three arms appended (`f`, `g`, `h`) for this item; arms
    `a`, `b`, `c` and `e` untouched and re-run on the merged tree; arm `d` RETIRED at its site
    with its reason and its replacement named, because the origin/main merge (D-309) DELETED the
    fence it broke — `FINDING_IN_ANOTHER_CASE`, enacting DEC-72 clause 6 — so the anchor matched
    zero times. **The retirement is a correction, not an exemption**: the row stays, it says who
    closed the subject, and it points at `bio-plane/test/multicase.control.mjs`, which D-309
    shipped to drive the refusal that replaced it. Nothing under `bio-plane/**` is touched. The
    runner also stops ENDING THE RUN on an arm that fails to arm (that throw had left arms `e`
    through `h` silently unmeasured) and prints the failing-assertion COUNT with 20 lines instead
    of 8, so an arm's MUST-NOT-FAIL half is readable.
  - `docs/development/INTERFACE-CHANGES.md` — **IC-75's `Status` block ONLY**: the CONSUMER
    ANSWER this row asks `UI` for by name, and the one word in the standing sentence that
    stops saying `UI` is still awaited. **The RESOLUTION and the version bump are NOT touched
    and remain CONDUCT's**, exactly as the row's last line says.
  **NOT** `bio-plane/src/**` — nothing on the wire moves; `op=affordances` already publishes
  `object_type` and `current_state` and `actsFor()` already returns both. **NOT**
  `bio-plane/test/check-mock-envelope.mjs`. **NOT** `docs/development/QUEUE.md` (CONDUCT's sole
  ground). **NOT** any other UI suite.

---
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 174/174 · 10,804 (delta zero, predicted), `coverage --strict` exit 0 read unpiped (floor 909/168/169 unmoved), UI harness exit 0 (`publication-entry` 146), `mintid --audit` 0 breaks. IC-75 RESOLVED in the same act: I3 14.0.0.

## D-309 · claimed 2026-09-10 · worktree `agent-a26bce57cd13e5ea5`, branch `worktree-agent-a26bce57cd13e5ea5`

**M10 — the CASE arc's plane residue.** DEC-72 clause 6 in the plane: the nine
scalar which-case readers corrected to answer set-valued, a NAMED refusal for the
ambiguous REC-44 derivation, and `FINDING_IN_ANOTHER_CASE` removed LAST.
Interface: **IC-74**, filed before any code.

PATHS CLAIMED, precisely:

- `bio-plane/src/store.mjs` — the nine scalar sites of CASE-6's class and their
  callers, named as methods rather than as line numbers, because line numbers in
  this file have gone stale four times:
  - `publishCase()` — the `belongs` derivation, the `FINDINGS_IN_DIFFERENT_CASES`
    refusal, the REC-44 identity resolution, and the `FINDING_IN_ANOTHER_CASE`
    fence. One new `DEC-49 REGION case-identity-derivation` inside it.
  - `ratifyBundle()` — the container's `rel` lookup and everything that keys off
    it in that block (`CASE_ASSERTION_DIVERGED`, `#dischargeCaseFlags`,
    `published_bundles.required`, `#caseEditionState`, the return shape).
  - `publishedCase()` — the finding-id resolution arm (both the `AND edition=?`
    and the `ORDER BY edition DESC LIMIT 1` spellings).
  - `#caseClaimOf`, `#caseOf`, `#caseOfSha` — three helpers, five of the nine
    sites between them, plus their callers `gateFacts`, `publishedList`,
    `publishedEditions`, `publishedRegistryFor` and `publishedCase`'s loose arm.
  - The two PLURAL sites (`#caseRelationOf`, `#flagCasesOnRevision`) are read but
    **not changed**: CASE-6 measured them already correct for any n and they are.
- `bio-plane/checks/bio-checks.mjs` — ONE new DEC-49 family for the new refusal
  (C-44, minted). No existing family's rows touched.
- `bio-plane/test/caseflip.test.mjs` — the driven pin CORRECTED, never exempted.
- `bio-plane/test/derivation-bounds.test.mjs` — two bound arguments that cite the
  fence BY NAME as the reason their scan is bounded at 1. The fence moves, so the
  argument is wrong the moment it lands; corrected at the site, not exempted.
- `bio-plane/test/caselifecycle.test.mjs` — one comment citing the fence as the
  reason "several owning projects" must be several cases. The ASSERTIONS do not
  move (a case with several owning projects stays unrepresentable — `cases` keys
  on `case_id` alone, and that is NOT this item and is not widened).
- `bio-plane/test/multicase.test.mjs` — NEW, this item's own suite.
- `bio-plane/test/multicase.control.mjs` — NEW, this item's negative-control driver.
- `civicos-ui/check-refusal-codes.mjs` — FLOOR figures only, moved from what a
  green run PRINTED, for the family and rows this item adds.
- `docs/development/INTERFACE-CHANGES.md` (IC-74), `DEBT.md` (the D-309 row's
  disposition), `docs/BIO_DATAPLANE_STATE.md` and `docs/development/kickoffs/RECORD.md`
  (each carries a sentence saying multi-case membership is REFUSED, which this
  item makes false), `docs/DECIDED.md` (regenerated).

**SCHEMA IS NOT EXPECTED TO MOVE** and did not: `published_case_members` already
keys (case_id, edition, ord) with a `published_case_members_bundle` index on
`bundle_id` — CASE-1 built the table for exactly the many-cases-per-finding shape
and CASE-3 added the pin. Nothing here needs a column. If that changes it will be
reported, with D-113's purge rule and the `host_governor` / inline-`--`-semicolon
rules honoured.

**NOT CLAIMED, and deliberately: `bio-plane/src/affordances.mjs`.** D-310 is LIVE
on that file. Nothing here touches it.

DELEGATION — D-310 (`affordances.mjs`): none needed, measured rather than assumed.
`op=affordances` offers acts; it does not ask which case a finding is in, and
`affordances.mjs` contains no reference to `published_case_members`, `#caseOf`,
`#caseOfSha` or `#caseClaimOf` (grepped, zero hits). The new refusal fires inside
`publishCase()` at act time and is not an affordance condition. Recorded here so
the absence of a delegation is a measurement and not an oversight.

concurrency: checked over the register. D-310 holds `bio-plane/src/affordances.mjs`;
CPDF-15 holds scratch/probe paths only. No live claim names any path above.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `dad57cd` and verified on the MERGED tree: battery 174/174 · 10,804 (10,779 + the attributed +25, closing exactly), `coverage --strict` exit 0 read unpiped (floor 909/168/169 by print), UI harness exit 0, `mintid --audit` 0 breaks, `dist/**` rebuilt. The DEBT conflict was two same-row edits resolved by keeping each row's CLOSING copy (D-309 from the branch, D-310 from main), the split-the-resolution rule applied.

## CLAIM 2026-09-10 CONTENT-PDF (CPDF-15 — the TESSERACT RUNTIME measurement: wasm tesseract on the DEPLOYED Workers runtime, DEC-42's CPU question, D-245)
session: cpdf15-tesseract-runtime (worktree `agent-a871d94f8580cb2a6`, branch `worktree-agent-a871d94f8580cb2a6`)
opened: 2026-09-10T00:00:00Z
paths:
  - `bio-plane/test/cpdf15-tesseract-runtime.probe.mjs` — **NEW**. A PROBE, deliberately NOT named
    `*.test.mjs` so the battery's discovery rule (`scripts/battery.mjs`: readdir +
    `endsWith(".test.mjs")`) never picks it up and it needs no skip marker. It commits no product
    code and changes nothing the plane runs.
  - `bio-plane/test/cpdf15-tesseract-worker.mjs` — **NEW**. The scratch Worker source uploaded
    under this item's own scratch slug `bio-ocrtess`, used, DELETED and verified gone. Not a
    plane source, not in `dist/`, reachable from nothing.
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  - `docs/development/DEBT.md` — **APPEND ONLY**, if this item raises any row; ids from
    `tools/mintid.mjs`, no existing row edited.
  **READ, NEVER EDITED** (the coupling is deliberate and one-way — it is what makes the figures
  comparable with the floor): `bio-plane/test/ocr-measure-probe.mjs` (CPDF-9's floor — its
  `GT_PAGE2` ground truth, its `norm`/`levenshteinPairs` and its four metric expressions are READ
  AT RUN TIME and pinned by digest, never copied; **D-305's fifth expression is NOT added here** —
  the digit-substitution column this item reports is computed in this item's own file, so every
  prior figure stays comparable), and `bio-plane/test/ocr-moondream-probe.mjs` (CPDF-11's six-rung
  ladder recipe, likewise read and pinned, never copied).
  **NOT** `bio-plane/src/**` — this item writes no product code at all; in particular **NOT**
  `store.mjs` (D-309 is live there) and **NOT** `affordances.mjs` (D-310). **NOT**
  `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground). **NOT**
  `bio-plane/scripts/coverage.mjs` — a probe declares no checks, so no floor here can move.
  **NOT** `newgroup/**`, **NOT** `civicos-ui/**`, **NOT** `bio-plane/dist/**`.
released: 2026-09-10 by CONDUCT #9 at integration — merged on `main` at `f0c3de5` and verified on the MERGED tree: battery 174/174 · 10,807 (+3, the worker's own attribution reproduced), `coverage --strict` exit 0 read unpiped, UI harness exit 0, `mintid --audit` 0 breaks. The verdict is enacted: CPDF-10 re-scoped to the measured in-account default and QUEUED; DEC-74 stays open with Bob, better-informed.

## CLAIM 2026-09-11 CONTENT-PDF (CPDF-16 — two floor-instrument defects closed together: D-305's fifth expression, D-314's blank/noise gate; comparability is the constraint)
session: cpdf16-floor-instrument (worktree `agent-ac13e0cfc839cfcd7`, branch `worktree-agent-ac13e0cfc839cfcd7`)
opened: 2026-09-11T00:00:00Z
paths:
  - `bio-plane/test/ocr-measure-probe.mjs` — the floor instrument (CPDF-9's file), **ADDITIVE
    REGIONS ONLY**: the digit-position DISAGREEMENT count as a FIFTH expression with its own
    reported column (D-305), and the blank/noise control gate so a floor reference is only ever
    taken from a run that passed it, with agreement-over-a-noise-failing-floor answering
    `undetermined` naming the gate (D-314). The four existing metric expressions, `GT_PAGE2`,
    `norm` and `levenshteinPairs` stay BYTE-UNCHANGED — the two landed probes pin them by digest
    and literal presence, and those guards exiting 0 against the edited file is this item's
    hard constraint.
  - `bio-plane/test/cpdf16-floor-controls.mjs` — **NEW**, this item's negative-control driver.
    A PROBE-side driver, deliberately NOT named `*.test.mjs` so the battery's discovery rule
    (`scripts/battery.mjs`: readdir + `endsWith(".test.mjs")`) never picks it up.
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  - `docs/development/DEBT.md` — disposition updates on rows **D-305 and D-314 ONLY** (the two
    rows this item exists to close), plus **APPEND ONLY** for any row this item raises; ids
    from `tools/mintid.mjs`.
  **READ, NEVER EDITED**: `bio-plane/test/ocr-composed-probe.mjs` (CPDF-14) and
  `bio-plane/test/cpdf15-tesseract-runtime.probe.mjs` (CPDF-15) — their comparability guards
  are this item's READERS and its free negative control; if a guard needed a new digest the
  additive constraint was violated, which is a finding to report, never an edit to make. Also
  read, never edited: `bio-plane/test/ocr-moondream-probe.mjs` (CPDF-11's noise-control recipe,
  replicated additively into the floor at the same seed and dimensions, never moved).
  **NOT** `bio-plane/src/**` (no plane behaviour changes — the item's own constraint), **NOT**
  `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's), **NOT** `bio-plane/scripts/coverage.mjs`,
  **NOT** `newgroup/**`, **NOT** `civicos-ui/**`, **NOT** `bio-plane/dist/**`, and none of
  CPDF-10's ground (the third fleet member — `agent-worker/**`, `pdf-worker/**`, fleet paths).
concurrency: checked over the register. CPDF-10 is live on the fleet-member ground, disjoint
from every path above. No live claim names `ocr-measure-probe.mjs`.
released: 2026-09-11 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 174/174 · 10,808 (+1 attributed to planning-hygiene on D-315), `coverage --strict` exit 0 read unpiped (floor 909/168/169 unmoved), UI harness exit 0, `mintid --audit` 0 breaks. D-305 and D-314 closed; D-315 stands as the probes-side residue.

## CLAIM 2026-09-12 FLEET (FL-6 — the Claude-account cascade at runtime: member → project → instance, resolved in the fleet member, absence STATED per level)
session: FLEET area session (worktree `bio-worktrees/FLEET`, branch `fleet-session`)
opened: 2026-09-12
paths:
  - `agent-worker/src/cascade.mjs` — NEW, the resolver: ONE expression of the order and of the
    per-level judgement (absent/empty is UNSET, a published value is REVOKED — consuming the ONE
    denylist, `PUBLISHED_TOKEN_HASHES`/`sha256hex` imported from `bio-plane/src/tokens.mjs` as a
    cross-tree build input the FL-9 guard hashes like `pdf-worker`'s three).
  - `agent-worker/src/index.mjs` — the `/run` cascade wiring and the honesty notes it supersedes
    ONLY (`judgement_note` says the account "is FL-6's cascade and is not resolved here" — after
    this it IS, and the note must say what remains instead). **NOT** `src/harness.mjs`,
    **NOT** `src/subsession.mjs`.
  - `agent-worker/test/cascade.test.mjs` + `agent-worker/test/cascade.control.mjs` — NEW, the
    suite `battery.mjs cascade` selects and its NC driver.
  - `agent-worker/test/agent-worker.test.mjs` — ONLY assertions the cascade supersedes (module
    roster, /run response shape), corrected with dated reasons, never exempted.
  - `agent-worker/dist/*` — REBUILT (the FL-9 guard demands it the moment `src` moves) and the
    manifest with it.
  - `bio-plane/test/fleetbundles.test.mjs` — section 2a's agent-worker input-roster assertions
    ONLY (three modules become four plus a cross-tree input; the assertion is a pin and moves
    with dated reasons).
  - `docs/development/IS-BUILD-PLAN.md` — FL-6's OWN row only, the landed note (FL-4's precedent).
  **NOT** `bio-plane/src/**` (tokens.mjs is READ as a build input, never edited — the instance
  rule and its suite are DS-3's pins), **NOT** `pdf-worker/**`, **NOT** any third-member path
  (CPDF-10 is live on that ground), **NOT** `docs/development/QUEUE.md`.
concurrency: checked over the register 2026-09-12. CPDF-10 (live, third fleet member) — no
  overlap: its ground is a NEW member directory and CPDF paths; no live claim names
  `agent-worker/**`. RECORD's live claims (CASE-6, D-310) name `store.mjs`/UI ground — disjoint.
DEC-43: read and NOT triggered — FL-6 deploys nothing and configures no fallback instance; the
  ruling binds a deployment step this item does not contain.

## CLAIM 2026-09-12 CONTENT-PDF (D-315 — the comparability guards' expression pin moves from SUBSTRING PRESENCE to BYTE IDENTITY, in both probes)
session: d315-guard-pins (worktree `agent-a853636fda19082d6`, branch `worktree-agent-a853636fda19082d6`)
opened: 2026-09-12
paths:
  - `bio-plane/test/ocr-composed-probe.mjs` — **THE COMPARABILITY GUARD REGION ONLY** (the
    `METRIC_EXPRS` pin, the `--digests` bootstrap that prints the pins, and the header comment
    that describes them). CPDF-14's `--controls` arm table and the probe's exit-code contract
    (4 = comparability, and it refuses BEFORE any upload) are UNCHANGED — D-315 is a change of
    DETECTION, not of interface. No measurement code, no upload code, no account code touched.
  - `bio-plane/test/cpdf15-tesseract-runtime.probe.mjs` — **THE SAME GUARD REGION ONLY**, the
    same change. The engine pins (`checkEnginePins`, exit 5) and CPDF-15's `--controls` arm
    table are UNCHANGED.
  - `bio-plane/test/d315-guard-controls.mjs` — **NEW**, this item's negative-control driver.
    Deliberately NOT named `*.test.mjs` so the battery's discovery rule (`scripts/battery.mjs`:
    readdir + `endsWith(".test.mjs")`) never picks it up: it mutates a committed file in place
    and needs a quiet tree.
  - `docs/development/DEBT.md` — the **D-315 row's disposition ONLY**, plus APPEND ONLY for any
    row this item raises; ids from `tools/mintid.mjs`.
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  **READ, NEVER EDITED**: `bio-plane/test/ocr-measure-probe.mjs` — CPDF-9's floor instrument,
  carrying CPDF-16's landed additive regions. Its digests must not move, and this item's whole
  subject is guarding them. **If the exact-match extraction had required a change THERE, that
  is a finding to report and argue, not an edit to make** — it did not: the four pinned
  expressions each already occur EXACTLY ONCE and each already sits alone on its own statement
  line, measured before a byte was written. Also read, never edited:
  `bio-plane/test/ocr-moondream-probe.mjs` (CPDF-11's ladder recipe) and
  `bio-plane/test/cpdf16-floor-controls.mjs` (CPDF-16's driver, whose `nc3-expr` arm carries the
  comment that raised this row).
  **NOT** `bio-plane/src/**` — this item writes no product code and changes no plane behaviour.
  **NOT** `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground). **NOT**
  `bio-plane/scripts/coverage.mjs` — a probe declares no checks, so no floor here can move.
  **NOT** `newgroup/**`, **NOT** `civicos-ui/**`, **NOT** `bio-plane/dist/**`, and none of
  CPDF-10's ground (`agent-worker/**`, `pdf-worker/**`, the fleet-member paths).
concurrency: checked over the register 2026-09-12. One unreleased block (FLEET FL-10, whose own
body records it released) names `bio-plane/scripts/**`, `bio-plane/dist/**` and
`fleetbundles.*` — disjoint from every path above. CPDF-10 is live on the fleet-member ground,
also disjoint. No live claim names either probe file or `ocr-measure-probe.mjs`.
released: 2026-09-12 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 176/176 · 10,833, `coverage --strict` exit 0 read unpiped with `REGISTER_FLOOR` moved to the merged print (920/170/171 — 11 slack, mostly FL-6/DS-2/DS-3 accumulation, noted for FLEET and DIST), UI harness exit 0, `mintid --audit` 0 breaks. D-315 closed; D-318 stands.
### RELEASED 2026-09-12: the FL-6 claim above — landed as `56ed70b` (the cascade) + the floor-move commit beside it
Acceptance measured, not believed: `battery.mjs cascade` green **29/0** — the three fixtures
resolve to the right level with the run object naming it (and the record's payer REFUSING to
disagree with the runtime's, `RUN_NAMES_A_DIFFERENT_PAYER` naming both facts); the no-token
fixture answers the NAMED unavailable (`NO_ACCOUNT_RESOLVED`, 409, per-level absences stated
— unset and revoked-by-publication are different facts and both are named); no secret on the
wire in either direction, and no Claude token value in any plane call, asserted. NC four arms
armed ALONE with measured tallies (26/3 · 20/9 · 26/3 · baseline 29/0), restores verified
content+sha256. Full gates GREEN class FULL: battery 177/177 · 10,861, UI green, plancheck
0/0. `--strict` exit 0 unpiped post-commit, provenance 183/183 at HEAD; REGISTER_FLOOR
909→920/168→170/169→171 to the printed figures. The FL-9 guard caught the superseded
module-roster pin on the first rebuild — corrected with the dated reason, never exempted.
**For CONDUCT:** FL-6's build-plan row carries its landed note; the QUEUE build-plan table's
FL-6 line is yours. **The IS build plan's FLEET share is now COMPLETE** — what remains behind
DS-4 is VF-4 (VERIFY's), and model TURNS are D-218's sizing, deliberately not FL-6's.
## CLAIM 2026-09-12 CONTENT-PDF (CPDF-10 — the THIRD FLEET MEMBER: `ocr-worker`, wasm tesseract behind the provenance chain the plane already refuses with)
session: cpdf10-ocr-member (worktree `agent-accf1711f80abb70c`, branch `worktree-agent-accf1711f80abb70c`)
opened: 2026-09-12T00:00:00Z
paths:
  - `ocr-worker/**` — **NEW DIRECTORY, the whole of it.** The third fleet member: `fleet-member.json`,
    `package.json`, `wrangler.jsonc` (`account_id` PINNED, the rule `CLAUDE.md` sets for every new
    Worker config), `.gitignore`, `scripts/build.mjs`, `scripts/embed-tesslib.mjs`, `src/index.mjs`,
    `src/transcribe.mjs`, `src/tessengine.mjs`, `src/pngsamples.mjs`, `src/tesslib.mjs` (GENERATED and
    committed, the `src/signpage.mjs` precedent), `assets/tesseract-core.wasm`,
    `assets/eng.traineddata`, `dist/**` (the committed bundle + its manifest), `test/**`.
  - `bio-plane/scripts/fleet-bundle.mjs` — **ONE ADDITIVE ARM**: a member's `bundle.assets` (the
    upload parts a wasm member has and neither existing member does) are hashed into the committed
    manifest and checked for staleness by `verifyStatic`. The `assets` key is EMITTED ONLY for a
    member that declares them, so `pdf-worker`'s and `agent-worker`'s committed manifests stay
    BYTE-UNCHANGED — asserted, not assumed. No existing function's behaviour moves.
  - `bio-plane/test/fleetbundles.test.mjs` — the FL-9/FL-10 guard's roster: the discovered-members
    assertion gains `ocr-worker`, `GUARDED_FLOOR` 2 -> 3, section 7's boot table gains the member
    WITH its wasm/data parts, and one new arm drives the asset staleness arm on the synthetic
    member. No FL-9 or FL-10 arm is edited.
  - `bio-plane/test/resolveversion.test.mjs` — **ONE ASSERTION CORRECTED, NEVER EXEMPTED**: DS-2's
    live ARM 7b pins `versionSites().length === 6` (the plane + two members, 2 sites each). A third
    member makes the true figure 8; the assertion moves with the reason stated at the site.
  - `bio-plane/scripts/coverage.mjs` — **`FLEET_FLOOR` and `REGISTER_FLOOR` ONLY**, moved to figures a
    green `--strict` run PRINTED. ONE `arms:` key per table (the six keep-both merges this file
    records). Nothing else in it.
  - `bio-plane/wrangler.jsonc` — **ONE LINE**: the `OCR_WORKER` service binding beside `PDF_WORKER`
    and `AGENT_WORKER`, INERT until DIST deploys the member — exactly how both of those shipped.
  - `bio-plane/test/ocr-member-e2e.test.mjs` and `bio-plane/test/ocr-member-e2e.control.mjs` —
    **NEW**: the acceptance arm (the REAL member answering the plane's `OCR_WORKER` binding over a
    REAL image-only Oakland page) and its negative-control driver.
  - `docs/development/INTERFACES.md` — **APPEND ONLY**: the `I9` entry (plane -> ocr-worker),
    PROVISIONAL on I8's precedent.
  - `docs/development/INTERFACE-CHANGES.md` — **APPEND ONLY**: IC-78 and IC-79 (minted).
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  - `docs/development/DEBT.md` — **APPEND ONLY** for rows this item raises; ids from `tools/mintid.mjs`.
  **READ, NEVER EDITED**: `pdf-worker/src/pagepixels.mjs` (CPDF-12's renderer — the member IMPORTS it
  across trees, which is `pdf-worker`'s own `../bio-plane/src/*` precedent and is why FL-9's
  cross-tree arm already covers it); `pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf` (the real
  Oakland page, used as a fixture and not moved); `bio-plane/src/textchain.mjs` and
  `bio-plane/src/index.mjs`'s Tier-3 wire (D-251/D-252/CPDF-13 built the consumer completely and
  stated the producer contract — this item CONSUMES that contract and reshapes nothing);
  `bio-plane/test/cpdf15-tesseract-runtime.probe.mjs` (its three engine digests are this member's
  comparability check and are reproduced, never edited — a D-315 worker is live on this file).
  **NOT** `bio-plane/src/**` (the chain, the wire, the merge and the refusals all already exist —
  a source edit there would mean the contract was reshaped, which is a finding to report rather
  than an edit to make), **NOT** `bio-plane/src/affordances.mjs`, **NOT** the case or publish
  paths, **NOT** `bio-plane/test/textchain.test.mjs` (the stub-driven consumer suite stands as the
  over-strictness arm: it must pass UNCHANGED), **NOT** `pdf-worker/**` beyond reading, **NOT**
  `agent-worker/**`, **NOT** `newgroup/**`, **NOT** `civicos-ui/**`, **NOT**
  `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's), **NOT** `release/**`, **NOT** any
  version bump (`0.56.0` is the authority DS-2 set and every site this item writes ANSWERS to it).
concurrency: checked over the register. D-315 is live on `ocr-composed-probe.mjs` and
`cpdf15-tesseract-runtime.probe.mjs` — both READ ONLY here and neither touched. No live claim names
`ocr-worker/`, `fleet-bundle.mjs`, `fleetbundles.test.mjs`, `resolveversion.test.mjs` or
`bio-plane/wrangler.jsonc`. FL-9/FL-10's FLEET claims are released.
released: 2026-09-12 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 179/179 · 11,032 (the record figure reproduced exactly after `npm ci` in `ocr-worker/` — the loud skip read correctly), `coverage --strict` exit 0 read unpiped (REGISTER_FLOOR 923/171/172, FLEET_FLOOR 3/6/7/68, both by print), UI harness exit 0, `mintid --audit` 0 breaks. The live-verify is DIST's next cut per IC-78.

## CLAIM 2026-09-12 CONTENT-PDF (D-318 — D-315's fix gets a witness the battery RUNS: a discovered suite that drives both guards over a temp-dir copy)
session: d318-guard-witness (worktree `agent-a1918ff7b25266f17`, branch `worktree-agent-a1918ff7b25266f17`)
opened: 2026-09-12
paths:
  - `bio-plane/test/d315-guard-witness.test.mjs` — **NEW**, and it is this item's whole
    deliverable: a BATTERY-DISCOVERED suite that copies the floor and both probes into a temp
    dir (the shape both probes' own `--controls` arms already use), mutates the COPY, and drives
    both guards with `--guard-only`. It carries the D-282 stdio flush import, the D-186 sandbox
    import, and its own `NEGATIVE CONTROL:` declaration.
  - `bio-plane/test/d315-guard-controls.mjs` — **HEADER COMMENT ONLY**, one paragraph pointing at
    the new discovered suite and saying what each of the two instruments can see that the other
    cannot. No arm, no assertion, no behaviour touched.
  - `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR` ONLY**, moved from the figures a green
    `--strict` run PRINTED, with the reason at the site. **ONE `arms:` KEY**, grepped before and
    after writing (this file records six keep-both merges that left duplicates).
  - `docs/development/DEBT.md` — the **D-318 row's disposition ONLY**.
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/test/ocr-composed-probe.mjs` and
  `bio-plane/test/cpdf15-tesseract-runtime.probe.mjs` — the two guard regions are this item's
  SUBJECT and must not move: an item that closes "the fix has no witness" by editing the fix
  would be measuring its own hand. **`bio-plane/test/ocr-measure-probe.mjs`** — CPDF-9's floor;
  the new suite mutates only a COPY of it, never the committed file, and asserts as much by
  sha256 at its foot. Also read, never edited: `bio-plane/test/ocr-moondream-probe.mjs`,
  `bio-plane/test/cpdf16-floor-controls.mjs`, `bio-plane/scripts/battery.mjs`,
  `bio-plane/scripts/control-register.mjs`, `bio-plane/test/hygiene.test.mjs`.
  **NOT** `bio-plane/test/ocr-measure-probe.mjs` (see above — the floor stays byte-identical and
  the suite proves it). **NOT** `bio-plane/src/**` — this item writes no product code and changes
  no plane behaviour. **NOT** `ocr-worker/**` (just landed with CPDF-10). **NOT**
  `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground). **NOT** `newgroup/**`,
  **NOT** `civicos-ui/**`, **NOT** `bio-plane/dist/**`, **NOT** `pdf-worker/**`, **NOT**
  `agent-worker/**`, **NOT** any version bump.
concurrency: checked over the register 2026-09-12. Every CONTENT-PDF block above this one
(CPDF-10, D-315, CPDF-16, CPDF-15) is RELEASED. No live claim names either probe,
`ocr-measure-probe.mjs`, `d315-guard-controls.mjs`, or `bio-plane/scripts/coverage.mjs`.
DIST and FLEET push frequently — the `REGISTER_FLOOR` key is the one collision risk and the
resolution rule is written at its site: COLLAPSE TO ONE SET and re-read the printed figures.
released: 2026-09-12 by CONDUCT #9 at integration — merged on `main` and verified on the FULLY MERGED tree (including DIST's f5872c7): battery 180/180 · 11,060, `coverage --strict` exit 0 read unpiped (floor 928/172/173 by print, zero pre-move slack), UI harness exit 0, `mintid --audit` 0 breaks. D-318 closed; D-322 stands as the sweep's residue.

## CLAIM 2026-09-12 CONTENT-PDF (D-322 — D-314's blank/noise GATE in the floor gets a witness the battery RUNS: a discovered suite that drives the gate over a per-arm temp-dir copy)
session: d322-floor-gate-witness (worktree `agent-a2699815d6147db52`, branch `worktree-agent-a2699815d6147db52`)
opened: 2026-09-12
paths:
  - `bio-plane/test/d322-floor-gate-witness.test.mjs` — **NEW**, and it is this item's whole
    deliverable: a BATTERY-DISCOVERED suite that copies `ocr-measure-probe.mjs` into a PER-ARM
    temp dir (D-318's template, which is the shape both probes' own `--controls` arms already
    use), NEUTERS the blank/noise gate IN THE COPY, and requires the refusal to collapse and be
    NAMED. It carries the D-282 stdio flush import, the D-186 sandbox import, and its own
    `NEGATIVE CONTROL:` declaration.
  - `bio-plane/test/cpdf16-floor-controls.mjs` — **HEADER COMMENT ONLY**, one paragraph pointing
    at the new discovered suite and saying what each of the two instruments can see that the
    other cannot. No arm, no assertion, no behaviour touched — the same disposition D-318 gave
    `d315-guard-controls.mjs`.
  - `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR` ONLY**, moved from the figures a green
    `--strict` run PRINTED, with the reason at the site. **ONE `arms:` KEY**, grepped before and
    after writing (this file records six keep-both merges that left duplicates).
  - `docs/development/DEBT.md` — the **D-322 row's disposition ONLY**.
  - `docs/development/MEASUREMENTS.md` — **APPEND ONLY**: this item's row.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/test/ocr-measure-probe.mjs` — CPDF-9's floor and this item's
  SUBJECT. The new suite mutates only per-arm COPIES of it and proves the committed file
  byte-identical at its foot by sha256 AND `cmp`; the one hand-armed control that mutates the
  real file restores from a uniquely-named pristine copy verified both ways. An item closing
  *the gate has no witness* by editing the gate would be measuring its own hand. Also read,
  never edited: `bio-plane/test/ocr-composed-probe.mjs`,
  `bio-plane/test/cpdf15-tesseract-runtime.probe.mjs` (both landed guards — run as free
  over-strictness arms), `bio-plane/test/d315-guard-witness.test.mjs` (D-318's template),
  `bio-plane/scripts/battery.mjs`, `bio-plane/scripts/control-register.mjs`,
  `bio-plane/test/hygiene.test.mjs`.
  **NOT** `bio-plane/test/ocr-measure-probe.mjs` bytes (see above). **NOT** the two landed
  probes. **NOT** `bio-plane/src/**` — this item writes no product code and changes no plane
  behaviour. **NOT** `ocr-worker/**`, **NOT** `pdf-worker/**`, **NOT** `agent-worker/**`,
  **NOT** `docs/development/QUEUE.md` or `DECISIONS.md` (CONDUCT's sole ground), **NOT**
  `newgroup/**`, **NOT** `civicos-ui/**`, **NOT** `bio-plane/dist/**`, **NOT** `release/**`,
  **NOT** any version bump.
concurrency: checked over the register 2026-09-12. Every CONTENT-PDF block above this one
(CPDF-10, D-315, CPDF-16, CPDF-15, D-318) is RELEASED. No live claim names
`ocr-measure-probe.mjs`, `cpdf16-floor-controls.mjs` or `bio-plane/scripts/coverage.mjs`.
DIST and FLEET push frequently — the `REGISTER_FLOOR` key is the one collision risk and the
resolution rule is written at its site: COLLAPSE TO ONE SET and re-read the printed figures.
released: 2026-09-12 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 181/181 · 11,078 (+18 attributed), `coverage --strict` exit 0 read unpiped (floor 936/173/174 by print), UI harness exit 0, `mintid --audit` 0 breaks. D-322 closed; the class swept to zero across six test dirs.

## CLAIM 2026-09-13 DIST (DS-4 deploy half — release 0.57.0 CUT at `ba05e9c` goes to the account, serves, and is read back; then the row lands and VF-4 is handed)
session: DIST #2 (worktree `.claude/worktrees/dist-ds2`, branch `dist-ds2`) — the VISIBLE
successor to the headless DIST session, spawned at Bob's direction 2026-09-13 after the
predecessor wedged twice on the critical path. Gate context: the stand-down gate could not
clear by the outgoing session's own act (headless, no operator interrupt — the rule-6 lesson
at `a7ffe90`); the leading BOB session ruled PROCEED on the measured evidence (no
deploy/wrangler process in flight; outgoing landed nothing since `ba05e9c`; its queued first
instruction is DO NOT DEPLOY) with this claim pushed BEFORE any account-touching act as the
condition. The process check re-runs immediately before each deploy invocation.
opened: 2026-09-13
paths:
  - `docs/development/CLAIMS.md` — this block.
  - `docs/development/QUEUE.md` — **the DS-4 row of `## IS BUILD PLAN — STATUS` ONLY**, marked
    done in SK-4's done-row shape (never `| DS-4 |` in the first cell — mintid's allocation
    shape). QUEUE.md is CONDUCT's sole ground and this one row is the kickoff's explicit
    instruction from Bob, stated here so the exception is a record and not a habit.
  - **THE ACCOUNT, not a path**: release 0.57.0's four artifacts deployed to
    `20b533579290b9b93168345edd3b7f72` — plane `bio-plane.bundled.mjs` → `biosmoke7` via
    `scripts/deploy.mjs` (baton read from the remote; waits for serve), members
    `agent-worker`, `ocr-worker` (+2 upload parts per IC-78), `pdf-worker` via
    `tools/deploy-fleet.mjs --instance biosmoke7`. Bytes verified by reading back; the serve
    answer must name 0.57.0 before anything is believed.
  **READ, NEVER EDITED**: `release/**` (the signed manifest and artifacts are `ba05e9c`'s and
  deploy AS THEY ARE — a byte changed here is a different release), `bio-plane/scripts/deploy.mjs`,
  `tools/deploy-fleet.mjs`, `docs/development/DECISIONS.md` (DEC-43 re-read; the read is
  recorded in the deploy commit message, which is this release's note surface — `release/`
  carries no note file). **NOT** any version bump, **NOT** `bio-plane/src/**`, **NOT**
  `newgroup/**` (no installer act here; installer releases are gated to Bob), **NOT** any tag
  the cut did not already make.
concurrency: checked over the register 2026-09-13 — no live DIST claim; every block above is
released. The outgoing DIST session holds no claim here and its queued stand-down forbids it
deploying; the one collision that matters (two deploys, one account) is guarded by the
process check re-run at the moment of each invocation, and both sessions' bytes are in any
case the SAME signed release.
released: 2026-09-13 by DIST #2 — no new deploy was needed: the outgoing DIST completed the
deploy, serve-wait and fleet rollout before standing down (`14c5470`, measured there and
INDEPENDENTLY re-verified here from the account: all four `/version` answer 0.57.0; plane
bytes read back byte-identical to the signed manifest, 2,715,828 B; ocr-worker's two upload
parts byte-identical; member main modules are wrangler builds from source per their own
ruling). The account was never touched twice — the process check read quiet at every point
and the only account acts this session performed were READS. DS-4 row landed in QUEUE.md;
DEC-43 read recorded at `39730b1`. Gate GREEN class DOCS; VF-4 handed to the leading BOB.

## CLAIM 2026-09-13 VERIFY (VF-4 — LIVE VERIFICATION IN SCRATCH; the IS build plan's closing row)

VF-4 is a MEASUREMENT ITEM, so this claim names NO source path at all. Nothing in
`bio-plane/src/**`, `agent-worker/src/**`, `civicos-ui/**` or `newgroup/**` is edited; nothing
is deployed, bumped, signed, tagged or configured; no account setting is touched. The account
is READ (worker script list, binding NAMES, secret NAMES — never a secret value, which the
Cloudflare API does not return) and the deployed instance is DRIVEN, in its own `scratch`
namespace only.
opened: 2026-09-13
paths:
  - `docs/development/CLAIMS.md` — this block.
  - `docs/development/MEASUREMENTS.md` — ONE appended section (M-8) carrying the live figures
    and the build that answered each of them.
  - `docs/development/DEBT.md` — TWO appended rows, D-323 and D-324, for the two live
    findings. ADDED TO THIS CLAIM MID-ITEM, after the findings existed: a measurement item
    does not expect to raise debt, and raising it is the honest disposition when the live run
    finds a mechanism that cannot do what the record says it does. Ids minted with
    `node tools/mintid.mjs D` (D-323, D-324; floor 322, no collisions).
  - `bio-plane/test/vf4-live-scratch.mjs` (the probe), `bio-plane/test/vf4-fixture.mjs` (the
    catalogue gate over its seed), `bio-plane/test/vf4-call.mjs`,
    `bio-plane/test/vf4-bindings.mjs`, `bio-plane/test/vf4-secretnames.mjs`,
    `bio-plane/test/vf4-suggestprobe.mjs` (its helpers) —
    **NON-DISCOVERED NAMES BY DESIGN.** `scripts/battery.mjs` discovers `test/*.test.mjs`;
    these talk to a deployed instance over the network and write rows into it, so a suite
    that carried them would make the battery depend on an account, a token and a live
    rollout. They are run by hand, by VERIFY, and their figures go to MEASUREMENTS.md.
  - **THE LIVE INSTANCE'S `scratch` NAMESPACE**, not a path: `biosmoke7`'s scratch Durable
    Object (a different DO from the real record, with its own member table and its own
    PUBLISHED prefix) is seeded, run against, and swept. `store=bio` is READ ONLY — twice, as
    the before/after witness that no counter in the real record moved — and is POINTED AT by
    the row's own negative control 1, which is a refusal this item DRIVES and RECORDS.
  **READ, NEVER EDITED**: `docs/development/IS-BUILD-PLAN.md` (the VF-4 row's cell is the
  plan's and is not editable from here — reported to CONDUCT instead), `docs/development/QUEUE.md`
  (CONDUCT's sole ground — the VF-4 row is REPORTED, never touched), `agent-worker/src/**`,
  `bio-plane/src/**`, `bio-plane/checks/**`.
concurrency: checked over the register 2026-09-13 — the DIST #2 block immediately above is
RELEASED and held no test path; no live claim names `bio-plane/test/**` or MEASUREMENTS.md.
The one collision that would matter is a second session sharing the scratch namespace
(`.env`'s own warning: "do NOT share a scratch namespace between concurrent sessions, they
will purge each other"), and the probe measures scratch's starting state and prints it, so a
foreign occupant is visible rather than assumed absent.
released: 2026-09-13 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 181/181 · 11,080, `coverage --strict` exit 0 read unpiped, UI harness exit 0, `mintid --audit` 0 breaks. VF-4 done — the IS build plan is COMPLETE; D-323+D-324 enqueued as one item, D-325 filed on the confinement finding.

## CLAIM 2026-09-13 FLEET (D-323 + D-324 — ONE VOCABULARY, ONE GROUND: the empty-run instrument's own object made writable through the plane's REAL grammar, and the mocks stop answering a wire that does not exist)

The fix is taken AT THE HARNESS, not at the grammar — so this claim names **NO path under
`bio-plane/src/**` or `bio-plane/checks/**`.** Those are READ (imported by the new suite and by
the shared mock instrument, which is the whole point: the expectation is DERIVED from the
plane and never re-typed) and are not edited. **No IC is filed and none is owed**: no wire
string another area builds against moves. The member's minted `name`/`level` values move, and
they move from a spelling the deployed plane has ALWAYS REFUSED — so no record anywhere holds
the old spelling and there is nothing to migrate (VF-4 measured `wrote: false`, M-8).
opened: 2026-09-13
paths:
  - `agent-worker/src/harness.mjs` — **ONE function, `emptyLevelCandidates`**, plus the
    `SUGGEST_LEVEL_OF` map it reads. Nothing else in the file; `CONTROL_FLOW`, `nextStep`,
    `stepLog`, `canonical`, `adjustedFrom` and the budget helpers are untouched.
  - `agent-worker/dist/agent-worker.bundled.mjs` and `agent-worker/dist/agent-worker.bundle.json`
    — **REGENERATED, never hand-edited**, by `npm run build` in `agent-worker/`. Claimed
    because FL-9's gate (`bio-plane/test/fleetbundles.test.mjs`) asserts the committed artifact
    is byte-identical to a fresh build of its source, so a source edit that does not rebuild
    FAILS the battery. `release/**` is NOT claimed and is NOT touched — that is DIST's.
  - `agent-worker/test/plane-suggest.mjs` (NEW) — the plane mock's `op=suggest` branch,
    DERIVED from `VERSION_NAME_RE`, `SUGGEST_KINDS`, `SUGGEST_LEVELS`, `BOILERPLATE_FORMS`
    and `SUGGEST_CHECKS` in the plane's own catalog. `plane-meaning.mjs` (D-276) is the
    precedent and the shape is deliberately the same. NOT a `.test.mjs`: a shared instrument.
  - `agent-worker/test/wire-vocabulary.test.mjs` (NEW) — the suite that drives
    `emptyLevelCandidates`' composed candidate through the plane's REAL validation
    expressions, imported, with no mock anywhere in it.
  - `agent-worker/test/harness.test.mjs` — the suggest branch of its plane mock replaced by
    the shared instrument; B4/B5's `new-version` fixtures CORRECTED to `basis-version` with
    the reason at the site; B6's colon-form assertion CORRECTED; A7 gains the level-spelling
    and description arms.
  - `agent-worker/test/fanout.test.mjs` — the same, at its two colon-form sites and its
    `new-version` fixture.
  - `agent-worker/test/harness.control.mjs`, `agent-worker/test/fanout.control.mjs` — ONLY if
    an arm's patch anchor moved under the corrections above. An arm that stops arming is a
    finding and is reported, never quietly re-anchored.
  - `docs/development/DEBT.md` — the D-323 and D-324 dispositions.
  - `docs/development/MEASUREMENTS.md` — ONE appended section.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/src/**`, `bio-plane/checks/**`, `bio-plane/test/vf4-*.mjs`
  (VF-4's six files are the measurement of record — a pinned live answer this fix makes stale
  earns a DATED note in the file's header and never a rewritten measurement),
  `docs/development/QUEUE.md` (CONDUCT's sole ground), `release/**`, `newgroup/**`.
concurrency: checked over the register 2026-09-13 — the two blocks above (DIST #2, VERIFY) are
both RELEASED, and no live claim names `agent-worker/**`.
  - ADDED MID-ITEM, 2026-09-13: `bio-plane/test/vf4-live-scratch.mjs` and
    `bio-plane/test/vf4-suggestprobe.mjs` — **HEADER NOTES ONLY, DATED, and not one byte of
    either measurement touched.** VF-4's six files are the measurement of record; this fix makes
    two of their pinned live answers stale as PREDICTIONS while leaving them exact as HISTORY,
    and the standing rule for that is a dated note in the header, never a rewritten measurement.
    The notes name the moved spelling, say which arm will now read differently and why that is
    the fix working rather than a regression, and hand the re-pin/retire choice to whoever
    re-runs them. MEASUREMENTS.md M-8's figures are untouched.
  - ADDED MID-ITEM, 2026-09-13: `bio-plane/scripts/coverage.mjs` — **the two `FLEET_FLOOR` keys
    this item invalidated and nothing else**, `suites: 7 -> 8` and `arms: 68 -> 73`, each with
    its reason at the site and each read from the figure a green `--strict` run PRINTED AFTER
    the commit (the pre-commit print refused the figures as contaminated, D-238 working).
    `REGISTER_FLOOR` untouched — the new suite is a FLEET suite and that table reads plane
    suites. ONE `arms:` key per table, grepped after writing (2 matches in the file, the
    documented state). `docs/DECIDED.md` — REGENERATED by `node tools/decided.mjs`, which
    `plancheck` requires of any turn that rules on anything; the diff is this item's own three
    lines and the count.
released: 2026-09-13 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 182/182 · 11,172 (the worker's figure exact), `coverage --strict` exit 0 read unpiped (FLEET_FLOOR 3/6/8/73 and REGISTER_FLOOR 936/173/174 by print), UI harness exit 0, `mintid --audit` 0 breaks. D-323 and D-324 closed; the D-276-staled-arms residue is M0-25, an item.

## CLAIM 2026-09-13 M0-25 (the arm-liveness census — every control driver run whole)
session: m025-arm-liveness (worktree agent-af1219fd05eadf256, branch worktree-agent-af1219fd05eadf256)
opened: 2026-09-13T00:00:00Z
paths:
  - `bio-plane/test/m025-arm-census.mjs` (NEW) — the census instrument. Deliberately NOT a
    `.test.mjs`: it RUNS the control drivers, and the drivers edit real sources, so a file the
    battery discovered would mutate `src/` underneath every suite running beside it. The
    precedent is every driver it runs.
  - **The control drivers it re-anchors, NAMED INDIVIDUALLY as the census finds them and added
    to this block mid-item** — a re-anchoring quotes a subject, it never edits one. No driver is
    claimed speculatively.
  - `docs/development/DEBT.md` — this item's dispositions, if any.
  - `docs/development/MEASUREMENTS.md` — ONE appended section (the census figures).
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: every driver's SUBJECT (`bio-plane/src/**`, `agent-worker/src/**`,
  `civicos-ui/app.html`, `ocr-worker/**`, `pdf-worker/**`, `bio-plane/checks/**`) — the census
  re-anchors the QUOTE, never the quoted line; `docs/development/QUEUE.md` (CONDUCT's sole
  ground); `release/**`; `newgroup/**` (DIST's, and its two suites are outside the
  `*.control.mjs` convention anyway — stated in the census's reach).
concurrency: checked over the register 2026-09-13 — the D-323/D-324 block above is RELEASED and
  no live claim names any `*.control.mjs`.
  - ADDED MID-ITEM, 2026-09-13, as the census found them — **each is a re-anchoring that
    QUOTES its subject and edits no subject**:
    `agent-worker/test/agent-worker.control.mjs` (arm V2's anchor into `bio-plane/scripts/coverage.mjs`)
    and `bio-plane/test/sufficiency-state.control.mjs` (arm 7's anchor into `bio-plane/checks/bio-checks.mjs`).
  - ADDED MID-ITEM, 2026-09-13: `bio-plane/test/m025-arm-anchor-witness.test.mjs` (NEW) — the
    battery-side half of the decision, and the only NEW `.test.mjs` this item lands.
  - ADDED MID-ITEM, 2026-09-13: `bio-plane/test/hygiene.test.mjs` — **the D-268 class-census
    NAMED list (one entry, for `m025-arm-census.mjs`) and the reach floor that entry invalidates
    (32 -> 34, from the figure the run PRINTED), and nothing else in the file.** Not foreseen at
    claim time: the census instrument's own directory walk is caught by the walk->floor ratchet,
    which fired on the first driver run and CONTAMINATED it — every driver that runs hygiene as
    part of an arm read `688 pass, 1 fail` and refused to arm. The run was discarded and re-taken.
  - ADDED MID-ITEM, 2026-09-13, as the census's SECOND (clean) run found them — every one a
    re-anchoring that QUOTES its subject and edits no subject, each new anchor COUNTED against
    the committed blob before it was written, each staling commit named at the site:
    `bio-plane/test/casepin.control.mjs` (FOUR arms — a, b, c, d — plus e; `808342f` case-5b and
    `7e10ca9` CASE-4), `bio-plane/test/casesign.control.mjs` (arm d, two spaces of indentation,
    `d720333` D-309), `bio-plane/test/caseproduction.control.mjs` (arm H, which changed MODULE:
    `808342f`), `bio-plane/test/current.control.mjs` (arm 5 — an anchor that NEVER EXISTED),
    `bio-plane/test/d280-strengthbar.control.mjs` (arms A and C, `ce2fe34` CASE-2),
    `bio-plane/test/run-conditions.control.mjs` (arm 3, `bb7b026` REC-69),
    `bio-plane/test/aicredential.control.mjs` (a stale EXPECTATION rather than a stale anchor —
    two sites quoting a suite label composed as `${beyond.length}`, 26 -> 28),
    `bio-plane/test/d301-census.control.mjs` (THREE figure-pins, and this one is THIS ITEM'S OWN
    DELTA rather than a pre-existing staleness: the class census reads 34 and its reach floor
    moved 32 -> 34 because M0-25 lands two walking instruments).
  - ADDED MID-ITEM, 2026-09-13: `bio-plane/test/m025-anchor-witness.control.mjs` (NEW) — the
    negative-control driver the battery-side witness declares. NOT a `.test.mjs`: it edits real
    sources.
  - ADDED MID-ITEM, 2026-09-13: `bio-plane/scripts/coverage.mjs` — **the three `REGISTER_FLOOR`
    keys this item invalidated and nothing else**, `arms 936 -> 942`, `classified 173 -> 174`,
    `corpus 174 -> 175`, each read off the figure a green `--strict` run PRINTED **after** the
    commit (the pre-commit print reported 942 counted against 936 reproducible, because the new
    suite was untracked — D-238 refusing a contaminated figure, exactly as written). ONE `arms:`
    key per table, grepped after writing (2 matches in the file, the documented state).
    `FLEET_FLOOR` untouched and none owed: this item's suite is a PLANE suite.
  - ADDED MID-ITEM, 2026-09-13: `.gitignore` — ONE block, for the census's per-driver logs and
    the witness driver's pen. Earned in the run it describes: a control driver's leftover
    pristine copies were read by `check-firing.test.mjs` as a second producer of a retired check.
  - ADDED MID-ITEM, 2026-09-13: `docs/DECIDED.md` — REGENERATED by `node tools/decided.mjs`,
    which `plancheck` requires of any turn that rules on anything.
released: 2026-09-13 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 183/183 · 11,188 (+16 attributed), `coverage --strict` exit 0 read unpiped (floor 942/174/175 by print), UI harness exit 0, `mintid --audit` 0 breaks. M0-25 done; D-329/D-330/D-331 stand as rows.

## CLAIM 2026-09-13 M0 (D-330 — the attribution of two red hand-run instruments)

item: D-330 (`docs/development/QUEUE.md`), authority `DEBT.md`'s D-330 row. Background lane,
  holds no slot. Worktree `agent-adbc8324f27ca8a2a`, branch `worktree-agent-adbc8324f27ca8a2a`,
  off `main` at `a2a0718`.
paths:
  - `bio-plane/test/d216-sharing.control.mjs` — its BASELINE declaration and arm declarations.
  - `bio-plane/test/d216-sharing.probe.mjs` — **an INSTRUMENT, not plane source**: its own
    assertion expectations are the declarations whose decay D-330 is about. The probe is the
    control driver's subject and is itself a declaration region; correcting a declaration here
    is the item, never exempting one.
  - `bio-plane/test/dec65-strength-reach.control.mjs` — its MEASURED RESULTS header and every
    arm's declared pass/fail pair.
  - `bio-plane/test/dec65-strength-reach.test.mjs` — **only if the attribution lands on a
    declaration inside it**; it is a battery suite, so any edit here is attributed in the
    battery delta by re-running the true baseline.
  - `docs/development/DEBT.md` — the D-330 row's disposition and nothing else.
  - `docs/development/MEASUREMENTS.md` — this item's figures, dated and instrumented.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/src/**` (the subjects — **attribution reads, it does not
  fix**: a real defect found here is FILED as its own row, and the fix is its own item),
  `bio-plane/checks/**`, `docs/development/QUEUE.md` (CONDUCT's sole ground), `release/**`,
  `newgroup/**`.
concurrency: checked over the register 2026-09-13 — M0-25's block above is RELEASED, and no live
  claim names `d216-sharing.*` or `dec65-strength-reach.*`.
  - AMENDED MID-ITEM, 2026-09-13: `docs/development/DEBT.md` gains a SECOND row beyond D-330's
    disposition — **D-333**, the class this item's measurement establishes and its repair does not
    close: a driver's declared TALLY decays while every one of its anchors stays live, and no
    static check can see the difference because a tally is a claim about a RUN. Minted with
    `node tools/mintid.mjs D`. **D-332 was burned by the same allocator in the call before it** —
    the first invocation allocated without `--json` so its id was never read back, and the second
    reported `collided:[332]`. Recorded rather than quietly re-used: the tool's own note is that
    gaps are expected and cost nothing, and an id silently re-used would cost more.
  - ADDED MID-ITEM, 2026-09-13: `docs/development/MEASUREMENTS.md` — **M-12**, this item's figures,
    the 36-revision bisect table, and the three NC arms including the one that came back wrong.
  - ADDED MID-ITEM, 2026-09-13: `docs/DECIDED.md` — REGENERATED by `node tools/decided.mjs`, which
    `plancheck` requires of any turn that rules on anything (this one retires an arm and rules that
    a re-aimed assertion beats a re-anchored one where the replacement quotes what it replaced).
  - NOT EDITED, AND THE RESTRAINT IS THE ITEM: **`bio-plane/src/**` is byte-unchanged** — proved,
    not asserted: `src/store.mjs` carries sha256 `514bb504…` before the first driver run and after
    the last NC arm. Attribution READS its subjects. No plane defect was found; had one been, the
    row would have been filed and the fix left as its own item.
released: 2026-09-13 by CONDUCT #9 at integration — merged on `main` and verified on the MERGED tree: battery 183/183 · 11,189 (+1 predicted and measured), `coverage --strict` exit 0 read unpiped (no floor owed), UI harness exit 0, `mintid --audit` 0 breaks. D-330 closed; D-333 stands; D-332 recorded burned.

## CLAIM 2026-09-14 DIST (DIST-2 — the installer binds DAEMON_TOKEN in BOTH upload paths; REC-33's follow-on, and the first gate on DEC-43's fallback retirement)
session: DIST #2 (worktree `.claude/worktrees/dist-ds2`, branch `dist-ds2`)
opened: 2026-09-14
paths:
  - `newgroup/src/index.mjs` — the secrets object gains `daemon`; `uploadInstall` binds
    `DAEMON_TOKEN` beside the three existing secrets; `uploadUpdate` binds a fresh
    `DAEMON_TOKEN` explicitly (keep_bindings inherits, and an instance installed before the
    class existed has nothing to inherit — the SELF-binding precedent exactly). The success
    panel does NOT display it: no human ever spends this credential, the plane spends it
    over SELF.
  - `newgroup/test/wizard.test.mjs` — the install block's three-secrets assertions become
    four; the retry block's secret count moves 3 → 4; the update block's "no new secrets
    generated" is CORRECTED (not exempted) — its true core (passwords travel only by
    keep_bindings, never restated) survives as a narrower assertion beside the new
    DAEMON_TOKEN-on-update one, whose failure names the already-installed instance;
    header's load-bearing list and NEGATIVE CONTROL lines updated with run results.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/src/index.mjs` (classify's daemon arm :1970),
  `bio-plane/src/store.mjs` (`#monitorToken()` :27514 — DAEMON_TOKEN || ADMIN_TOKEN, the
  fallback DEC-43 keeps until DIST-4's count), `newgroup/src/release.mjs`.
  **NOT** `bio-plane/**`, **NOT** `release/**`, **NOT** any version bump, **NOT**
  `docs/development/QUEUE.md` (CONDUCT's; the DIST-2 row flip is CONDUCT's at integration),
  **NOT** any deploy — the row says NO DEPLOY, the install/update run is gated to Bob.
concurrency: checked over the register 2026-09-14 — no live claim names `newgroup/**`.
released: 2026-09-14 by DIST #2 — landed with the full gate GREEN on the merged tree: battery
182/183 (1 skipped, 11,113 assertions), coverage --strict exit 0, UI harnesses green, newgroup
embed 15/15 + wizard 105/105 with `npm test` exit 0 read unpiped. Both NC arms run and recorded
in the suite header (update arm: 2 failures, the first NAMING oak-watch — the accepts-when arm;
install arm: 4 failures including the panel assertion failing by name instead of throwing),
`index.mjs` restored byte-identically after each, verified by hash. `docs/DECIDED.md`
regenerated (701 rulings). The DIST-2 QUEUE row flip is CONDUCT's at integration. NO DEPLOY
performed; the next real install/update run is gated to Bob and is where the explicit-binding-
replaces-kept-secret API contract gets read back rather than trusted.

## CLAIM 2026-09-14 DIST (DIST-4 — the fleet-visibility report: which instances monitor on the ADMIN_TOKEN fallback, a NUMBER rather than a hope; DEC-43's (b))
session: DIST #2 (worktree `.claude/worktrees/dist-ds2`, branch `dist-ds2`)
opened: 2026-09-14
design, decided here per the row's I4 clause: **DIST-side read, NO plane op, NO IC.** The
instance-side surface already exists and answers to the WEAKEST credential: `op=selftest`
(classes admin/member/probe) reports `bindings.DAEMON_TOKEN` as true / false / "not
configured", liveToken-checked — the instance's OWN statement, not installer intent — and
carries `version`, so one call answers both of D-116's hats (the row asked that this be said:
it is said here and in the tool header). An OPEN surface (op=bootstrap) was considered and
refused: publishing "I monitor on the root of trust" to strangers advertises a weakness;
probe-gated is the right floor.
paths:
  - `tools/fleet-posture.mjs` — NEW, the report tool. Input: a fleet file of {name, base,
    token(probe)}. Postures: `daemon` / `admin-fallback` (DEC-43's population, NAMED) /
    `daemon-revoked` (bound-but-dead — loudest, see delegation below) / `unreachable` /
    `refused` (stated absences, never counted clean). The COUNT is stated; exit is nonzero
    while any instance is unanswered, because a count with holes presented as a count is the
    overclaim class. STRUCTURAL credential fence: the tool knows the token values it sent and
    scrubs/flags any that an instance echoes back — no token value in output, enforced, not
    promised.
  - `bio-plane/test/fleetposture.test.mjs` — NEW, battery-discovered (the DS-2
    `resolveversion.test.mjs` precedent for DIST tool suites). Fixture instances via injected
    fetch; hostile-echo and intent-field fixtures drive the three NC shapes the row names.
  - `bio-plane/scripts/coverage.mjs` — `REGISTER_FLOOR` ONLY, if the strict print moves under
    the new suite; reason at site (the standing stale-floor pattern).
  - `docs/development/CLAIMS.md` — this block, and one DELEGATION to RECORD below.
  **READ, NEVER EDITED**: `bio-plane/src/index.mjs` (selftest :3810, classify :1970),
  `bio-plane/src/store.mjs` (`#monitorToken()` :27514), `bio-plane/test/resolveversion.test.mjs`
  (the convention), `tools/deploy-fleet.mjs`. **NOT** `bio-plane/src/**`, **NOT**
  `newgroup/**`, **NOT** `release/**`, **NOT** any version bump, **NOT**
  `docs/development/QUEUE.md`. NO DEPLOY.
concurrency: checked over the register 2026-09-14 — no live claim names `tools/` or the new
test path; the DIST-2 claim above is released.

### DELEGATION 2026-09-14 DIST (DIST-4) -> RECORD: **A BOUND-BUT-REVOKED DAEMON_TOKEN BRICKS MONITORING INSTEAD OF FALLING BACK — the armed-alarm-firing-401s shape DIST-1 refused, reachable through the denylist door**
Found while designing DIST-4's posture categories, from reading, not from a live failure:
`#monitorToken()` (store.mjs :27514) is `env.DAEMON_TOKEN || env.ADMIN_TOKEN` — presence-only.
`classify()` (index.mjs :1970) accepts daemon only when `liveToken()` passes. So an instance
whose DAEMON_TOKEN value is denylisted (published in the repo — `tokens.mjs`'s
publication-revokes rule) SELECTS the dead token on every tick, is refused on every tick, and
never reaches the ADMIN_TOKEN fallback: monitoring armed, firing 401s forever — DIST-1 refused
exactly this shape for MONITOR_TOKEN and the denylist reintroduces it for DAEMON_TOKEN.
Selftest already distinguishes the state (`false` vs "not configured"), and DIST-4's report
names it `daemon-revoked` and counts it as BROKEN, never as fallback and never as clean. The
FIX is plane ground and therefore not DIST's: `#monitorToken()` should skip a non-live
DAEMON_TOKEN (one liveToken call at selection), or the refusal should be surfaced. Low
likelihood (requires a committed token value), stated rather than sat on.

### AMENDMENT 2026-09-14, MID-ITEM (DIST-4) — **THE FIRST REAL RUN PRODUCED A NUMBER AND A FINDING, AND TWO THINGS JOIN THE CLAIM**
paths added: `docs/development/MEASUREMENTS.md` — APPEND ONLY, this item's rows. Live acts
added, under the STANDING smoke-instance authority (Bob 2026-08-10): read-only `op=selftest`
probes of `biosmoke7` through the report tool, and ONE reversible credential act — minting and
binding a DAEMON_TOKEN secret on `biosmoke7` via the API (the installer's own DIST-2 act,
performed the deploy.mjs-managed way), value held nowhere and never printed, reversal = delete
the secret. THE FINDING THE FIRST RUN PRODUCED: the real fleet's DEC-43 population is exactly
`biosmoke7`, and it is OUTSIDE DIST-2's healing path — the smoke instance is deploy.mjs-managed,
and deploy.mjs sends a hardcoded binding list (D-202's still-open half), so no installer update
will ever deliver its daemon credential. Deploy-managed instances need the credential bound the
way their other secrets are bound: by the operator's tooling. Recorded here and in MEASUREMENTS.
released: 2026-09-14 by DIST #2 — landed with the gate GREEN class FULL: battery 184/184 ·
11,213 assertions with ALL THREE fleet members run (ocr-worker was DARK in the first two runs
for want of its own `npm ci` — the fresh-worktree trap, third-member edition, hit and read
correctly), coverage --strict exit 0, UI green, plancheck 0/0, every exit read unpiped. Two
instrument corrections mid-item, reported in the suite header rather than smoothed: the hand
arms' first firing CRASHED the suite instead of failing it (four null-unsafe assertions — D-93
inside a control), and the header's first draft carried PREDICTED arm counts written before
the arms ran (5/25 vs the measured 4/23). One hygiene rule learned: a suite must END on an
unconditional process.exit. THE ITEM'S REAL PRODUCT IS TWO NUMBERS IN MEASUREMENTS.md: the
fleet's first-ever posture reading (1 of 1 on the fallback — biosmoke7 itself, which
deploy.mjs manages and DIST-2's installer path can therefore never heal), and the reading
after the reversible smoke-authority remediation (DAEMON_TOKEN minted and bound via the API,
value held nowhere): DEC-43's measured count is ZERO, live, from the instance's own
liveToken-checked answer. The DIST-4 QUEUE row flip is CONDUCT's at integration.

## CLAIM 2026-09-14 DIST (DIST-3 — the installer REQUIRES Workers Paid, established by PROVOKING the platform, and REFUSES rather than half-installing; DEC-42's item 1)
session: DIST #2 (worktree `.claude/worktrees/dist-ds2`, branch `dist-ds2`)
opened: 2026-09-14
paths:
  - `newgroup/src/index.mjs` — `establishPlan()`: PUT a throwaway probe script
    (`bio-plan-probe`) with `limits.cpu_ms` set and READ THE ANSWER — code 100328 is Free,
    success is Paid (the exact provocation the BOB session measured 2026-07-31 and
    `free-tier-fleet-probe.mjs` reproduces; a plan FIELD is a claim, the refusal is a
    measurement) — then delete the probe. A new `plan` step in `runInstall` between the
    name-freshness check and bucket creation, so the refusal lands BEFORE anything of the
    instance exists. Three outcomes, all stated: paid → proceed; free → the named refusal
    (what is missing, what it costs — $0+card → $5+card, R2 already bills past free — and
    what to do); unverifiable → an honest refusal that names the verification failure and
    that nothing was created. The UPDATE path gets NO probe: an update must never grow a new
    refusal against an already-installed instance (the R2 arm's own doctrine).
  - `newgroup/test/wizard.test.mjs` — probe routes added to every install-path block; a new
    Free-plan block (refusal by name before any creation, with bucket/upload routes present
    so the NC arm can half-install and be caught); order + provocation + deletion assertions
    on the paid path; a no-probe-on-update assertion; header NC lines updated with run
    results.
  - `docs/development/CLAIMS.md` — this block.
  **NOT** `bio-plane/**`, **NOT** `release/**`, **NOT** any version bump, **NOT**
  `docs/development/QUEUE.md`. NO DEPLOY; no real install/update run (gated to Bob).
concurrency: checked over the register 2026-09-14 — the DIST-2 and DIST-4 claims above are
released; no other live claim names `newgroup/**`.
released: 2026-09-14 by DIST #2 — landed with gate GREEN class FULL (battery 184/184 · 11,213,
all three members run, coverage --strict exit 0, UI green) and newgroup `npm test` exit 0
unpiped (embed 15/15, wizard 117/117). The row's NC run in BOTH strengths and recorded in the
suite header: ACCEPTING the Free answer half-installs free-town and the suite names it with
the damage counted (want [0,0] got [2,1]); merely DELETING the check fails SAFE — the
unverifiable-plan refusal catches it, which is the guard's fail-closed geometry working. One
assertion corrected, not exempted ("nothing was uploaded" → "the instance itself was never
uploaded", since the probe legitimately PUTs its throwaway). The update path carries NO probe —
an update never grows a new refusal. NO real install run (gated to Bob); the probe's live
behaviour against a real Free account is verified at the next gated install, stated not
assumed. DIST-3 row flip is CONDUCT's at integration.

## CLAIM 2026-09-14 DIST (D-297 — DS-1's installer half: the installer installs the FLEET; IC-82 filed; D-202's deploy.mjs half folded in as the same drift class)
session: DIST #2 (worktree `.claude/worktrees/dist-ds2`, branch `dist-ds2`)
opened: 2026-09-14
paths:
  - `docs/development/INTERFACE-CHANGES.md` — IC-82 PROPOSED (append-only entry above).
  - `tools/release-assemble.mjs` — emits `compat` per member and `type` per part, statement `/2`
    (BUILT ONLY AFTER IC-82 RESOLVES; listed so the claim is honest about where this goes).
  - `bio-plane/src/sshsig.mjs` — `fleetStatement` `/2` (same condition; the one shared statement
    function, per its own header).
  - `newgroup/src/index.mjs`, `newgroup/test/wizard.test.mjs` — the fleet install/update half
    (same condition).
  - `bio-plane/scripts/deploy.mjs` — **D-202's open half, DIST's own ground, no IC needed**:
    the hardcoded binding list becomes a derivation from `bio-plane/wrangler.jsonc` WITH the
    instance slug substituted (D-292's rule — the deploy half of the same never-guess-config
    principle IC-82 applies to the release). Arming SELF/PDF_WORKER/AGENT_WORKER on the smoke
    instance happens at the NEXT deploy, deliberately, with RECORD and CAPTURE told (their
    monitoring consumers arm) — delegations below at landing.
  - `docs/development/CLAIMS.md` — this block.
  - `release/**` — RELEASE.json enrichment + fleetSig re-sign, ONLY per IC-82's resolution.
  **NOT** `agent-worker/**`, `ocr-worker/**`, `pdf-worker/**` (FLEET/CONTENT-PDF ground — the
  manifest COPIES their configs, never edits them), **NOT** `bio-plane/src/**` beyond
  `sshsig.mjs`'s statement function, **NOT** any member version bump.
concurrency: checked over the register 2026-09-14 — DIST-2/DIST-4/DIST-3 claims above are
released; no live claim names these paths. FLEET has a watcher armed and answers IC-82 as owner.
