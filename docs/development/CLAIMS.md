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
released: 2026-09-14 — RELEASED AS STALE by CONDUCT #10 (`PARALLELISM.md`: an unreleased claim older than its expected scope is stale and CONDUCT may release it). The work landed on 2026-08-10: `classifyProducer` is in `bio-plane/src/pdfstructure.mjs` on `origin/main`; the worktree is gone. No path is held.
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
released: 2026-09-14 — RELEASED AS STALE by CONDUCT #10 (`PARALLELISM.md`: an unreleased claim older than its expected scope is stale and CONDUCT may release it). The item is `done` in `QUEUE.md` (landed 2026-08-10, later marked MOOT by DEC-72); the worktree is gone. No path is held.
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

### AMENDMENT 2026-09-14, MID-ITEM (D-297 claim) — TWO FILES ADDED, and D-202's half LANDS AHEAD of the IC-gated remainder
paths added: `bio-plane/scripts/derive-bindings.mjs` (NEW — the derivation is a pure module
because deploy.mjs acts on import and an untestable derivation is a hand-carried list wearing
a function's name) and `bio-plane/test/deploybindings.test.mjs` (NEW, battery-discovered).
D-202's half is complete and lands NOW — it never depended on IC-82; the D-297 remainder
(assembler `/2`, manifest enrichment, newgroup fleet install) stays open behind the IC's
resolution, and carries FLEET's stated condition: **COPY, NEVER DEFAULT** — the assembler
copies `compat`/`type` from each member's own config and REFUSES a member whose config does
not state them (ocr-worker's deliberate `[]` is a stated fact, not the refusal case).

### DELEGATION 2026-09-14 DIST (D-202) -> RECORD: **THE NEXT PLANE DEPLOY ARMS YOUR MONITORING CONSUMER — deliberately, and this is the telling**
`deploy.mjs` now derives its bindings from `wrangler.jsonc` (slug substituted, D-292), so the
next deploy of any plane instance through it SENDS the config's service bindings — including
`SELF`, which makes `#monitorConfigured()` true and arms REC-26's monitor cadence on that
instance for the first time outside a harness. On biosmoke7 the daemon credential is already
bound and live (DIST-4's remediation), so the first armed tick spends the SCOPED class, not
the root of trust. Nothing deploys today; the arming happens at the next release's deploy and
this delegation is the advance telling DIST-NEXT.md said the change must carry.

### DELEGATION 2026-09-14 DIST (D-202) -> CAPTURE: **THE SAME DEPLOY ARMS CAP-3's ARCHIVE FALLBACK** — same mechanism, same timing, same advance telling as the RECORD delegation above; recorded separately because the consumer is yours and a shared notice is how one owner misses it.

### AMENDMENT 2026-09-14, MID-ITEM (D-297 claim) — ONE PATH ADDED: `docs/development/DEBT.md`, the D-202 row's disposition ONLY, closed by the landing above.


## CLAIM 2026-09-14 RECORD (D-334 — a bound-but-revoked DAEMON_TOKEN must not brick monitoring: selection asks the gate's own question, and the dead binding is still NAMED)
session: RECORD worker (worktree `.claude/worktrees/agent-a9fbda2ff149b121c`, branch `worktree-agent-a9fbda2ff149b121c`)
opened: 2026-09-14
authority: **the DELEGATION 2026-09-14 DIST (DIST-4) -> RECORD above**, and QUEUE.md's `### D-334`.
paths:
  - `bio-plane/src/store.mjs` — **the `#monitorToken()` REGION ONLY**, the contiguous span from
    its REC-33/DEC-37 comment block through `#monitorConfigured()` and
    `#captureRequestConfigured()`'s one-line predicate (:24285) — selection becomes
    liveness-checked through `liveToken`, presence keeps the sync "is monitoring WIRED"
    question, and the three async fire sites (`#fireMonitorTick`, `#fireArchiveFallback`,
    `#fireCaptureRequest`) await the selection and REFUSE BY NAME when nothing live remains
    instead of spending a credential the gate will refuse. Plus the one `import { liveToken }`
    line. **NOT** the scheduler registry, **NOT** `recordSourceOutcome`, **NOT** schema,
    **NOT** the publish/case paths, **NOT** any other span of this file.
  - `bio-plane/test/d334-monitor-credential.test.mjs` (NEW) — the suite: a denylisted
    DAEMON_TOKEN beside a live ADMIN_TOKEN drives monitoring END TO END through the real ops
    (the archive-monitoring suite's miniflare shape), the three NC arms, and the honesty arm
    driving `fleetPosture` over the same instance's own `op=selftest` answer.
  - `docs/development/DEBT.md` — the **D-334 row's disposition only**, nothing else.
  - `docs/development/MEASUREMENTS.md` — APPEND ONLY, this item's figures and arm results.
  - `docs/development/CLAIMS.md` — this block.
  - **`tools/fleet-posture.mjs` — TWO STRINGS ONLY, AND COHERENCE IS WHY.** The header's
    `daemon-revoked` posture paragraph (:29-33) and the row `detail` at :108 both assert the
    MECHANISM *"#monitorToken() still SELECTS it, classify() refuses it, and monitoring 401s
    forever instead of falling back"*. After this item that sentence is FALSE, and a report
    that describes a mechanism which no longer exists is the record overclaiming — the one
    defect class CLAUDE.md ranks worst. **The posture NAME, its BROKEN counting, the
    `brokenCount` field and the word "BROKEN" in the detail are UNCHANGED**: the operator's
    daemon credential is still dead and the report must still say so (silent healing is the
    D-106 class). Only the sentence describing what the dead credential now COSTS moves.
    **NOT** `postureOf`, **NOT** the counts, **NOT** the exit rule, **NOT** the scrub.
  **READ, NEVER EDITED**: `bio-plane/src/index.mjs` (`classify()` :1970, selftest :3810 — the
  published shape does NOT move, so no IC is owed), `bio-plane/src/tokens.mjs`,
  `bio-plane/src/livefire.mjs`, `bio-plane/test/fleetposture.test.mjs`,
  `bio-plane/test/daemon-token.test.mjs`, `bio-plane/test/archive-monitoring.test.mjs`.
  **NOT** `bio-plane/src/schema.mjs`, **NOT** `newgroup/**`, **NOT** `release/**`, **NOT** any
  version bump, **NOT** `docs/development/QUEUE.md` (CONDUCT's sole ground). NO DEPLOY, NO
  LIVE CALL.
concurrency: checked over the register 2026-09-14 — DIST-4's claim above is RELEASED; the live
  DIST-3 claim names `newgroup/**` and `newgroup/test/wizard.test.mjs` only, disjoint from every
  path here. No live claim names `bio-plane/src/store.mjs`, `tools/fleet-posture.mjs` or the new
  test path.
  - AMENDED MID-ITEM, 2026-09-14: `bio-plane/test/daemon-token.test.mjs` — **ONE assertion
    CORRECTED, never exempted** (:165), and the amendment is owed because the correction was
    not foreseeable from the brief. REC-33's pin matched the LITERAL expression
    `return (this.env && (this.env.DAEMON_TOKEN || this.env.ADMIN_TOKEN)) || null;` — a pin on
    the SPELLING of the selection, and that spelling was the D-334 defect, so the pin was
    holding the defect in place by name. The sentence it claims (DAEMON first, ADMIN retained)
    is UNCHANGED and still REC-33's ruling; it now asserts the ORDER and the RETENTION
    structurally, with the dated reason at the site. This is the SECOND time this file has
    taken this correction — REC-46 made the same one fifteen lines above, for the same reason.
    **NOT** its other 55 assertions, **NOT** its NEGATIVE CONTROL header (a record of past runs).
  - AMENDED MID-ITEM, 2026-09-14: `bio-plane/dist/bio-plane.bundled.mjs` and
    `bio-plane/dist/bio-plane.bundle.json` — **REGENERATED, not authored**, by
    `node bio-plane/scripts/build-plane.mjs`. Owed and not foreseen from the brief: the FL-10 /
    D-298 gate in `fleetbundles.test.mjs` requires the committed plane artifact to be a
    byte-identical fresh build of `src/`, so ANY `bio-plane/src/**` change carries this rebuild
    in the same turn (4 assertions went red without it on the final battery, caught and fixed
    before the run that is quoted). It is a build artifact, NOT a deploy, NOT a version bump
    and NOT a tag — `build-plane.mjs` writes only these two files and re-runs no signing step.
    **NOT** `bio-plane/dist/SECRETS.txt`, **NOT** `release/**`.
  - AMENDED MID-ITEM, 2026-09-14: `bio-plane/test/d334-monitor-credential.control.sh` (NEW) —
    the three-arm negative-control runner, committed BESIDE its suite on the
    `battery-provenance.control.sh` / `coverage-provenance.control.sh` precedent, so the next
    session re-runs every arm in one step instead of re-deriving how to break the subject
    (VERIFICATION.md step 2's own reason). It is not a battery suite and the runner does not
    discover it.
  - AMENDED MID-ITEM, 2026-09-14: `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR` ONLY**,
    the standing stale-floor pattern with the reason at the site. Moved 942/174/175 ->
    947/176/177 from the figures a green `--strict` run PRINTED on the COMMITTED tree at
    `3607dda`, ONE KEY SET (grepped: `^  arms:` matches twice, here and in `FLEET_FLOOR`, the
    documented state). **THE FLOOR ARRIVED ALREADY STALE BY 2/1/1 AND THAT IS MEASURED, NOT
    INFERRED**: the same script run on the PRISTINE baseline worktree at `02c5eb6` — before a
    byte of this item existed — printed `arms 944/942 · classified 175/174 · corpus 176/175 ·
    GREW by 2`. This item's own share is the remaining 3/1/1, one new suite declaring three
    arms. `FLEET_FLOOR` UNMOVED and none owed. **NOT** any other part of this file.
released: 2026-09-14 by CONDUCT #9 at integration — merged on `main` at `2f562d0` and verified on the MERGED tree after FL-10's guard fired at the merge and the bundle was rebuilt at the cause: battery 186/186 · 11,283, `coverage --strict` exit 0 read unpiped (floor 949/177/178 by print), UI harness exit 0, `mintid --audit` 0 breaks. D-334 closed with the class, not the instance.
released: 2026-09-14 by DIST #2 — D-297 and the IC-82 enactment are LANDED AND SERVING:
statement /2 (shared, refusing the unstated on both sides), assembler copy-never-default,
newgroup installs the fleet on install AND update (wizard 131/131, both NC arms in the
header), release 0.58.0 cut+signed (four signature NCs run; the one vacuous arm STATED with
its reason — plane bytes identical across versions), deployed and byte-verified with all four
/version answering 0.58.0, biosmoke7's four service bindings ARMED and read back with SELF
slug-substituted, daemon posture retained (DEC-43 count still zero), audit at D-200's
pre-existing 10 and nothing new. One live-found deploy defect fixed in the act (the
byte-identical skip vs metadata deploys — MEASUREMENTS row). The newgroup WORKER deploy is
NOT performed: installer releases are gated to Bob, and the live 0.57.0-embedded installer
reads only the plane keys of the new manifest (additive-in-fact, IC-82's measurement), so
nothing breaks while he decides. QUEUE row flips and IC-82's SETTLED are CONDUCT's.

## CLAIM 2026-09-14 RECORD (REC-80 — RECORD's two designs get front matter: the FTS5-in-the-DO specification and the alarm model, read against the plane rather than against themselves)
session: corpus-retrofit worker, one worktree for REC-80 + FW-16 + COFF-8 (CONDUCT #10's
  three-in-one spawn; disjoint files, one integration). Worktree
  `.claude/worktrees/agent-a2c3750caa0d50a39`, branch `worktree-agent-a2c3750caa0d50a39`.
opened: 2026-09-14
paths:
  - `docs/development/RETRIEVAL-SUBSTRATE.md` — FRONT MATTER ONLY (Status, Place in the
    system, Incomplete sections, generated Contents), inserted between the title heading
    and the body. **NOT one word of the body**, and no line of the probe's measured
    tables is touched — the actuals stay exactly as measured on 2026-07-25 and the
    front matter says what they are actuals OF.
  - `docs/development/SCHEDULER.md` — the same four fields, body untouched.
  - `docs/architecture/CORPUS-STANDARD.md` — §5's governed table gains the two rows, at
    the END of the table where a parallel retrofit merges mechanically; §5's "Not yet
    governed" table loses `RETRIEVAL-SUBSTRATE.md` and loses `SCHEDULER.md` from the
    shared `SCHEDULER.md, NOTIFICATIONS.md` row (`NOTIFICATIONS.md` STAYS — it is UI's
    and is not retrofitted here). Shared with FW-16 and COFF-8 below and with every
    other retrofit worker running now.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/src/store.mjs` (29,465 lines, measured with
  `wc -l` on 2026-09-14, `grep -a` throughout — the SCHEDULER block's
  `#schedConsumers` registry at :1980 and `bundles_fts` at :744), `bio-plane/src/query.mjs`
  (1,450 lines), `bio-plane/src/index.mjs`, `bio-plane/src/calibration.mjs`,
  `bio-plane/test/scheduler.test.mjs`, `docs/architecture/BIO_System_Design.md`,
  `docs/development/DEBT.md`, `docs/development/QUEUE.md`.
  **NOT** any `bio-plane/**` source, **NOT** `docs/development/QUEUE.md` (CONDUCT's sole
  ground — the REC-80 row flip is CONDUCT's), **NOT** `DECISIONS.md`, **NOT** `DEBT.md`,
  **NOT** `CLAUDE.md`. No id minted (`mintid` not called: the item allocates none).
  NO DEPLOY, NO LIVE CALL, NO PUSH, NO MERGE.
concurrency: checked over the register 2026-09-14 — three live claims (FL-10, FL-6,
  D-297), none naming any path above. `docs/architecture/CORPUS-STANDARD.md` is the one
  contended file: other retrofit workers hold their own worktrees and append their own
  §5 rows, which is why the rows go at the END of the governed table.
released: 2026-09-14 by the corpus-retrofit worker. Both documents carry front matter per
`CORPUS-STANDARD.md` §3 and both are in §5's governed table; the governed set is 24
documents and `node tools/corpuscheck.mjs` reports 0 fail, exit 0 read unpiped.
`RETRIEVAL-SUBSTRATE.md` declares 6 incomplete sections, `SCHEDULER.md` 4. The three
negative-control arms were run on `SCHEDULER.md`, each ALONE, each failing exactly once and
naming the file, with the file restored by `cp`-back and verified by sha256 AND `cmp`
(b957f650…, 12,717 B) after every arm; the over-strictness arm is the final tree at 0 fail.
`node tools/gates.mjs` GREEN, class DOCS: 19/19 doc-facing suites, 1,118 assertions, UI
harnesses green, `plancheck --local` 0 fail 0 warn. `docs/DECIDED.md` regenerated (734
rulings). Nothing in `bio-plane/**` was touched and no id was minted.

## CLAIM 2026-09-14 FRAMEWORK (FW-16 — `DOCUMENT-PROFILES.md` gets front matter; the area is DORMANT and CONDUCT answers-for, so this worker writes the Status/Place/Incomplete judgment)
session: corpus-retrofit worker, one worktree for REC-80 + FW-16 + COFF-8. Worktree
  `.claude/worktrees/agent-a2c3750caa0d50a39`, branch `worktree-agent-a2c3750caa0d50a39`.
opened: 2026-09-14
paths:
  - `docs/development/DOCUMENT-PROFILES.md` — FRONT MATTER ONLY, body untouched. The
    Incomplete list carries the correction D-60's own disposition column says this file
    owes: its `§Known gaps` first bullet ("the plane has not adopted it… still compare
    raw hashes") is STALE, and D-60 names this document by line as repeating it. The
    stale sentence itself is NOT rewritten — the body is not mine to edit under a
    front-matter item, and §3 of the standard puts the honest frontier in the front
    matter, where a reader looks first.
  - `docs/architecture/CORPUS-STANDARD.md` — one §5 governed row; the `DOCUMENT-PROFILES.md`
    row leaves the "Not yet governed" table. Shared with REC-80 and COFF-8.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `docprofile/**` in full (four stack handlers, three registered
  doctypes, `pipeline.mjs`, `recogniser.mjs`, `events.mjs`),
  `bio-plane/src/index.mjs` (the plane's own docprofile import and the `op=acquire`
  profile stamp), `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §15–§16,
  `docs/development/DEBT.md` (D-60).
  **NOT** `docprofile/doctypes/registry.mjs` — its stale "Only ONE real type" comment is
  **CPDF-17's**, a worker running now, and this item does not touch it in any way.
  **NOT** any other `docprofile/**` file, **NOT** `civicos-ui/**`, **NOT** `QUEUE.md`.
concurrency: checked over the register 2026-09-14 — no live claim names
  `docs/development/DOCUMENT-PROFILES.md`. CPDF-17 holds `docprofile/doctypes/registry.mjs`,
  which is disjoint from every path here.
released: 2026-09-14 by the corpus-retrofit worker. `DOCUMENT-PROFILES.md` carries front
matter and is in §5's governed table, home `BIO_Content_Framework_v0_10.md` Part I; 5
incomplete sections declared. The correction D-60's disposition column says this file owed
is made: the plane HAS adopted docprofile, `op=audit`'s duplicate sweep is discharged
(intra-bundle only), and monitoring plus `resolveLinks`' contemporaneity bracket are what
remain — each verified against the tree on 2026-09-14 rather than copied from the row.
`docprofile/doctypes/registry.mjs` was not opened for edit at any point. corpuscheck 0 fail
over 24 documents, exit 0 unpiped; gates GREEN class DOCS.

## CLAIM 2026-09-14 CONTENT-OFFICE (COFF-8 — `OFFICE-FORMATS.md` gets front matter; the axis is built end to end, so the honesty is in the document's own "Nothing here is built" line and in what the axis still does not extract)
session: corpus-retrofit worker, one worktree for REC-80 + FW-16 + COFF-8. Worktree
  `.claude/worktrees/agent-a2c3750caa0d50a39`, branch `worktree-agent-a2c3750caa0d50a39`.
opened: 2026-09-14
paths:
  - `docs/development/OFFICE-FORMATS.md` — FRONT MATTER ONLY, body untouched. The
    document's own preamble says "**Nothing here is built**", which was true on
    2026-07-31 and is false today (COFF-1..7); the Status says so and the Incomplete
    list names the line, rather than the body being rewritten under a front-matter item.
  - `docs/architecture/CORPUS-STANDARD.md` — one §5 governed row; the `OFFICE-FORMATS.md`
    row leaves the "Not yet governed" table. Shared with REC-80 and FW-16.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `bio-plane/src/formats.mjs`, `ooxml.mjs`, `docx.mjs`,
  `formats-xlsx.mjs`, `pptx.mjs`, `pdfstructure.mjs`; `docs/development/DEBT.md` (D-124's
  two rows, D-70), `docs/development/INTERFACE-CHANGES.md` and `INTERFACES.md` (IC-1),
  `docs/archive/ledgers/QUEUE-2026-08.md` (COFF-1..7 as landed).
  **NOT** any `bio-plane/**` source, **NOT** `MEASUREMENTS.md`, **NOT** `QUEUE.md`.
concurrency: checked over the register 2026-09-14 — no live claim names
  `docs/development/OFFICE-FORMATS.md`.
  - AMENDED MID-ITEM, 2026-09-14 (applies to all three claims above, recorded once):
    `docs/DECIDED.md` — **REGENERATED, not authored**, by `node tools/decided.mjs`. Owed and
    not foreseen from the brief: front matter carries uppercase ruling markers (`SUPERSEDED`
    in `OFFICE-FORMATS.md`'s Status) and shifts the line numbers the index cites in
    `DOCUMENT-PROFILES.md`, so `plancheck` went RED on the stale index until it was
    regenerated — measured, 1 fail, and the only fail in the whole gate. The diff is 6
    insertions / 4 deletions, every one attributable to this item: two line-number
    corrections, one new DEC-5 POINTER entry from a Status line (the same shape the index
    already carries for `BIO_Declared_Bias_v0_1.md:3`, and it points rather than rules), and
    the trailing-quote entry the generator takes from the last line of `CLAIMS.md`. 731
    rulings, 204.5 KB. **NOT** hand-edited in any part.
released: 2026-09-14 by the corpus-retrofit worker. `OFFICE-FORMATS.md` carries front
matter and is in §5's governed table, home `BIO_Content_Framework_v0_10.md` Part I; 8
incomplete sections declared, the first of them the document's own "Nothing here is built"
preamble. The other seven record what the built axis does not extract and what four
sections have been superseded by since 2026-07-31 (DEC-5, IC-1, and COFF-6's two
measurements). corpuscheck 0 fail over 24 documents, exit 0 unpiped; gates GREEN class DOCS.
## CLAIM 2026-09-14 UI (UI-58 — UI's three designs get front matter, and each joins CORPUS-STANDARD.md §5's governed table; prose only)
session: UI worker (worktree `.claude/worktrees/agent-aa9d6654d50d38861`, branch `worktree-agent-aa9d6654d50d38861`)
opened: 2026-09-14
authority: `QUEUE.md` `### UI-58 · running` (CONDUCT #10, 2026-09-14, draining the BOB #10 corpus inbox entry act 1), under `docs/architecture/CORPUS-STANDARD.md` §3-§6.
paths:
  - `docs/development/UI-PLAN.md` — **FRONT MATTER ONLY**: the four fields (Status, Place in
    the system, Incomplete sections, Contents) inserted between the title heading and the
    body, plus the closing `---`. Contents generated by `node tools/corpuscheck.mjs --write`.
    **NOT** the ladder, **NOT** the 2026-07-31 inventory table, **NOT** any body sentence —
    the body is a dated plan of record and the front matter says what has since happened to it.
  - `docs/development/UI-KICKOFF.md` — **FRONT MATTER ONLY**, same four fields. **NOT** Bob's
    verbatim UX principles and **NOT** the 2026-07-28 refinements; both are quoted record.
  - `docs/development/NOTIFICATIONS.md` — **FRONT MATTER ONLY**, same four fields. **NOT** the
    catalogue, **NOT** the item contract, **NOT** the class table.
  - `docs/architecture/CORPUS-STANDARD.md` — **§5's governed table (THREE ROWS APPENDED AT THE
    END), the three matching rows struck from §5's "Not yet governed" table, the §5 bullet in
    its own Incomplete sections, and its Status `as of` date.** Appending at the END is
    deliberate: other retrofit workers append in parallel and a tail append is what merges
    mechanically. **NOT** §1-§4, **NOT** §6, **NOT** §7, **NOT** any other owner's row.
  - `docs/development/CLAIMS.md` — this block.
NOT MINE, reported for CONDUCT instead: `docs/development/QUEUE.md` (the UI-58 row's status and
`landed:` line), `CLAUDE.md`, `DECISIONS.md`, `DEBT.md`, `MEASUREMENTS.md`,
`docs/development/SCHEDULER.md` (RECORD's, retrofitted in parallel by REC-80), and
`civicos-ui/**`, which does not move on this item.
released: 2026-09-14 by UI-58 at the close — all four paths landed on `worktree-agent-aa9d6654d50d38861` at `f4f9733` and the release at the sha below. `UI-PLAN.md`, `UI-KICKOFF.md` and `NOTIFICATIONS.md` carry front matter per `CORPUS-STANDARD.md` §3 with no body sentence edited; all three stand in §5's governed table, appended at the END, and are struck from "Not yet governed" (`SCHEDULER.md` LEFT IN PLACE as RECORD's, its row narrowed to name only that file). `corpuscheck` 23 governed documents / 0 fail, exit 0 unpiped; `gates.mjs` GREEN class DOCS — 19/19 doc-facing plane suites at 1,118 assertions, four UI suites green, `plancheck --local` 0 fail 0 warn (baseline measured at HEAD in a scratch worktree: 0 fail, 20 governed documents, decided index current — so the `docs/DECIDED.md` staleness this item hit was ITS OWN and is regenerated in the same commit, four rows moved by the one-time line offset §4.6 predicts). Negative controls RUN on `NOTIFICATIONS.md`, each arm ALONE, restored by `cp`-back and verified by sha256 AND `cmp` against per-arm pristines (24,553 B): baseline exit 0 / 0 fail; (1) `as of` pushed to 2026-09-13 against a last-commit day of 2026-09-14 → exit 1, 1 fail naming the file and both dates; (2) `## The catalogue` renamed without `--write` → exit 1, 1 fail printing the first divergent entry and the fixing command — and it fired ONLY on Contents, because the Incomplete bullet `§The catalogue` still resolves as a substring of the new heading, which is the checker's documented resolution rule and is reported rather than smoothed; (3) a bullet naming `§Severity ladders and their rot` → exit 1, 2 fails, one per comma-split ref; over-strictness — the final tree unarmed, exit 0 / 0 fail, and every file byte-identical to the commit. NO OWED ACT for a future actor is carried by this release; what CONDUCT must RECORD is in the report and in the QUEUE row, not here.
## CLAIM 2026-09-14 CAPTURE (CAP-6 — front matter for CAPTURE's seven design documents)
session: worker for CAP-6, Opus 5, worktree-isolated, spawned by CONDUCT #10
worktree: `/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a97ef16d17d0c26e2`
branch: `worktree-agent-a97ef16d17d0c26e2` (base `3cac8c6`)
paths:
  - `docs/development/AUTHORITY-AND-TRUST.md` — front matter only (the four fields + `---`); body untouched
  - `docs/development/LINK-FIDELITY.md` — front matter only; body untouched
  - `docs/development/ARCHIVE-FALLBACK.md` — front matter only; body untouched
  - `docs/development/SOURCE-ACCESS.md` — front matter only; body untouched
  - `docs/development/CAPTURE-SCALING.md` — front matter only; body untouched
  - `docs/development/CAPTURE-FIDELITY.md` — front matter only; body untouched
  - `docs/development/CLIENT-RENDERED.md` — front matter only; body untouched
  - `docs/architecture/CORPUS-STANDARD.md` — **§5's governed table ROWS ONLY** (seven rows appended at the END of the table, where a parallel merge resolves mechanically), the matching seven rows struck from §5's "Not yet governed" table, and its own Status `as of` bumped to 2026-09-14 with Contents regenerated if a heading moves. **NOT** §1–§4, **NOT** §6–§7.
  - `docs/DECIDED.md` — REGENERATED, not authored, by `node tools/decided.mjs`. Owed and not foreseen from the brief: the front matter quotes the ruling-marker words `decided.mjs` indexes (spelled here in lower case on purpose, so this claim does not itself enter the index) and shifts every line number in eight governed files, so `plancheck`'s staleness arm goes red without it (measured: 730 -> 748 rulings, and every changed row but the count line names one of the eight files, so the drift is entirely this item's).
  - AMENDED MID-ITEM, 2026-09-14: TWO MULTI-LINE HEADINGS COLLAPSED ONTO ONE LINE, the only body bytes this item moves. `CAPTURE-FIDELITY.md`'s title was TWO `# ` lines, which ends the front-matter block before it begins — corpuscheck cannot parse the file at all until they are one line, so this is required rather than tidy; the dropped parenthetical ("design, 2026-07-28; implementation is the next plane release") is carried into the Status and was stale in its second half. `SOURCE-ACCESS.md`'s `## RULED, 2026-07-31: the allowlist ...` was two `## ` lines, which the generated Contents would have carried as two half-entries; collapsing it is not required and is done because a Contents that indexes half a heading fails the purpose §3 gives it.
  - `docs/development/CLAIMS.md` — this claim and its release
NOT MINE: `bio-plane/**` (nothing in `src` moves), `docs/development/QUEUE.md`, `CLAUDE.md`,
`docs/development/DECISIONS.md`, `DEBT.md`, every other governed document.
released: 2026-09-14 by the CAP-6 worker on branch `worktree-agent-a97ef16d17d0c26e2`.
All seven CAPTURE designs carry front matter to `CORPUS-STANDARD.md` §3's grammar and sit in
§5's governed table, appended at its END; the two CAPTURE rows are gone from "Not yet governed".
`corpuscheck` 27 governed document(s), 0 fail, exit 0 read unpiped. `gates.mjs` GREEN, class DOCS:
19/19 plane suites, 1,118 assertions, four UI suites green, `plancheck --local` 0 fail 0 warn.
Three negative-control arms run and recorded, each ALONE on `CAPTURE-FIDELITY.md`, restored by
`cp`-back verified by sha256 AND `cmp` (never a checkout), the subject byte-identical at
9f60ed29... after every arm and the final tree passing. Arm 1 HAD TO BE RE-ARMED and that is the
item's own finding: the first attempt pushed the Status date to 2026-09-01 against a file whose
OWN last commit day is 2026-07-28, so it was never behind anything and corpuscheck correctly
passed; re-armed at 2026-07-27 it fails naming the file. NOTHING IS OWED TO A FUTURE ACTOR BY
THIS RELEASE. Two matters for CONDUCT are stated as ACTS in the worker's report, not here, and
neither is a precondition for merging this: re-counting `CORPUS-STANDARD.md`'s own front-matter
bullet for §5 once the parallel retrofit acts have all merged, and three ledger rows this item
measured as stale (D-109, D-60's remaining arms, and the ruling count carried in `CLAUDE.md`).
## CLAIM 2026-09-14 M0 (M0-26 — CONDUCT's group of the not-yet-governed designs: retrofit the live ones, ARCHIVE the closed ones, every pointer in the same commit)
session: worker (worktree `.claude/worktrees/agent-a64d514be75dea71a`, branch `worktree-agent-a64d514be75dea71a`)
opened: 2026-09-14
verdicts, by `QUEUE.md` `### M0-26`'s criterion, each with its evidence in the report:
**ARCHIVED** `IS-BUILD-PLAN.md` (43/43, QUEUE's `## IS BUILD PLAN — STATUS` header says COMPLETE
2026-09-13), `CONFORMANCE-AND-INTAKE-ARC.md` (`planning-hygiene.test.mjs`'s own exemption
reads *"closed migration architecture; all eight steps executed and superseded by the live
plane"*), `PROCESS-INVENTORY.md` (a 2026-08-01 research snapshot; its six findings are landed
or absorbed, two dated mentions only). **RETROFITTED** `INBOX-GRAMMAR.md` (live contract,
C-19.1), `PRACTICE-SURVEY.md` (SK-3's `SURVEY_SOURCE` in shipped plane code), `RETRIEVAL-PROBE.md`
(`RETRIEVAL-SUBSTRATE.md`'s companion and the actuals `architecture/README.md` points at),
`FINDINGS-WORKPLAN.md` (**F9 is still open** — `INVESTIGATIVE-SESSION.md:1211` and
`connections-sidebar.test.mjs` both say so, so not every item it plans has landed).
paths:
  - `docs/development/{INBOX-GRAMMAR,PRACTICE-SURVEY,FINDINGS-WORKPLAN,RETRIEVAL-PROBE}.md` — front matter.
  - `docs/development/{IS-BUILD-PLAN,CONFORMANCE-AND-INTAKE-ARC,PROCESS-INVENTORY}.md` → `docs/archive/` (`git mv`).
  - `docs/archive/README.md` — the three index rows, and the do-not-move list amended.
  - `docs/architecture/CORPUS-STANDARD.md` — §5's governed table (four rows) and the two CONDUCT
    rows removed from "Not yet governed"; Status `as of`.
  - `docs/architecture/BIO_System_Design.md` — construct 8's home bracket only, the `IS-BUILD-PLAN.md` locator.
  - POINTER MOVES ONLY, nothing else in these files: `tools/mintid.mjs` (`QUEUE_CORPUS`),
    `bio-plane/scripts/coverage.mjs` (`OWED_ANCHOR`), `bio-plane/test/owed-controls.test.mjs`,
    `bio-plane/test/mintid.test.mjs`, `bio-plane/test/planning-hygiene.test.mjs`
    (`EXEMPT_ORDER_OF_WORK`), `civicos-ui/test/connections-sidebar.test.mjs`,
    `docs/development/kickoffs/{SKILL,README,UI}.md`, `docs/development/VERIFICATION.md`.
  - `docs/DECIDED.md` — regenerated (`node tools/decided.mjs`), never hand-edited.
  - `docs/development/MEASUREMENTS.md` — the mintid floor before/after row.
  - `docs/development/CLAIMS.md` — this block.
  **READ, NEVER EDITED**: `docs/development/QUEUE.md`, `CLAUDE.md`, `docs/development/DECISIONS.md`
  (the row says any pointer that must move in those three is CONDUCT's at integration, reported
  with exact old and new text), `docs/development/INVESTIGATIVE-SESSION.md`,
  `docs/development/research/**`. **NOT** `bio-plane/src/**`, **NOT** any bundle or `release/**`,
  **NOT** `civicos-ui/app.html`, **NOT** `newgroup/**`. No deploy, no version bump, no push, no merge.
concurrency: checked over the register 2026-09-14 — no live claim names `docs/architecture/CORPUS-STANDARD.md`,
the seven documents, or the pointer files above.

### AMENDMENT 2026-09-14 to the M0-26 claim above — ONE PATH ADDED, and the reason is the control's own finding
`bio-plane/test/corpuscheck.test.mjs` — its `NEGATIVE CONTROL:` block ONLY, one added
paragraph, no assertion touched. The three declared arms ran as declared against
`docs/development/INBOX-GRAMMAR.md` at `ad9fdae`; the BASELINE arm came back RED and the
defect was in this item's own `PRACTICE-SURVEY.md` Status, which said *"the vendor claims
are as of 2026-08-01"* ahead of its trailing `as of 2026-09-14` — `corpuscheck` reads the
FIRST `as of`. **It had passed minutes earlier only because the file was uncommitted**, so
the date was being compared against its 2026-08-01 commit. That bound on the instrument
belongs in the suite that drives it rather than in a report nobody re-reads, which is the
only reason a path outside the claim is touched at all.
released: 2026-09-14 by the M0-26 worker. Landed on branch `worktree-agent-a64d514be75dea71a`
across four commits (`ad9fdae`, `f3b63c4`, `821ebf9`, `bb1a2ca`); NOT pushed and NOT merged —
CONDUCT integrates. All seven documents are dispositioned: four retrofitted and rowed into
`CORPUS-STANDARD.md` §5's governed table, three archived and indexed in `docs/archive/README.md`
with every reader repointed in the archiving commit. Gates on the final tree: `node tools/gates.mjs`
**GREEN, class FULL** — battery 187/187 · 11,323 assertions · 224.3s, `coverage --strict` exit 0
read unpiped, UI harness exit 0, `plancheck --local` 0 fail 0 warn with *"design corpus: 24
governed document(s), 0 front-matter failure(s)"*; bare `plancheck` fails on UNPUSHED alone.
`corpuscheck` 0 fail over the whole governed set. `mintid --list` floors identical in all 21
namespaces before and after the moves. Seven negative-control arms run and recorded at their
sites, and two of them found real defects — one in this item's own front matter, two in
instruments the archive move narrowed. Nothing is owed to a future actor by this release; the
handoff acts that belong to CONDUCT (the `landed:` line, and the `QUEUE.md` locator lines for a
plan that is now in the archive) are named in the worker's report with their exact text, because
a note in a released claim is not an item.


## CLAIM 2026-09-14 CONTENT-PDF (CPDF-17 — four stale self-descriptions corrected in place; comments and prose only, and the boundary is MEASURED rather than promised)
session: CONTENT-PDF worker (worktree `.claude/worktrees/agent-a0fd74b23da98f6e5`, branch `worktree-agent-a0fd74b23da98f6e5`)
opened: 2026-09-14
authority: QUEUE.md's `### CPDF-17` row. Part II §16.4 of
  `docs/architecture/BIO_Content_Framework_v0_10.md` carries the evidence for what is true now.
paths:
  - `bio-plane/src/index.mjs` — **TWO COMMENT BLOCKS ONLY, BY REGION.** (a) the `/* CPDF-10 —
    TIER 3 … */` block immediately above `if (i2text && needsTier3(i2text))` (:5055-5063), whose
    sentence *"the binding does not exist yet — so the branch that would call it is present,
    narrow and UNTAKEN"* has been false since CPDF-10 (`698a07b`) and release 0.58.0
    (`e67e275`). (b) the CPDF-13/D-253 calibration block's cost paragraph inside the `r.ok`
    arm (:5100-5107), whose clause *"an instance with no OCR member — which is every instance
    today"* is false for the same reason. **NOT one executable line of this file**, **NOT** the
    tier-1 or tier-2 spans, **NOT** `needsTier3`/`tier3Pages`/`ocrTextFromMember`, **NOT** the
    `else` at :5178-5181, **NOT** any other span.
  - `bio-plane/src/schema.mjs` — **TWO WHOLE-LINE `--` COMMENT BLOCKS ONLY, BY REGION**, each
    gaining a pointer to Part II and nothing else. (a) the `NO extent COLUMN` paragraph above
    `CREATE TABLE … inquiry_basis_versions` (:1989-1993). (b) the `CPDF-10: the TRANSCRIPTION
    PROVENANCE PROJECTION` paragraph above `CREATE TABLE … reading_text_source` (:2446-2461).
    **NOT** a single DDL line, **NOT** an INLINE `-- …` column comment anywhere (the
    comment-stripped-diff instrument deliberately does not strip those, so an inline edit would
    read as an executable change — this item makes none), **NOT** the `host_governor` block,
    **NOT** any other span. NO SEMICOLON is introduced inside any `--` comment (PL-1).
  - `docprofile/doctypes/registry.mjs` — **THE FILE HEADER COMMENT ONLY** (:1-16): *"Only ONE
    real type is registered today"* against three registered (`meeting_calendar`,
    `meeting_agenda`, `generic`). **NOT** the imports, **NOT** the `types.register(…)` calls,
    **NOT** `doctypeFor`, **NOT** the `meeting_agenda` comment below it.
  - `bio-plane/src/airun.mjs` — **THE `THE FOUR LEVELS` COMMENT BLOCK ONLY** (:94-98), which
    cites `CLAUDE.md` alone; it gains the Part II §14.3 pointer. **NOT** `OBSERVATION_LEVELS`'
    keys, values or ORDER (`skilldoctrine.test.mjs` ARM E3 and `agent-worker`'s LEVELS pin both
    turn on that order), **NOT** `OBSERVATION_STATES`, **NOT** `DEFINITIVE_STATES`, **NOT** any
    other span.
  - `docs/development/ASSISTANT-PILOT.md` — **THE "An ANSWER names its level" BULLET ONLY**
    (:67-72), same pointer. **NOT** the pilot's scope, fences or build steps.
  - `docs/development/CLAIMS.md` — this block.
  - **FORESEEN GENERATED ARTIFACTS, regenerated and never authored:**
    `bio-plane/dist/bio-plane.bundled.mjs` + `bio-plane/dist/bio-plane.bundle.json` via
    `node bio-plane/scripts/build-plane.mjs` — FL-10 / D-298's guard requires the committed
    plane artifact to be a byte-identical fresh build of `src/`, and it fires on a COMMENT
    change like any other. `civicos-ui/app.html` — **the flattened docprofile block between
    `/*__DOCPROFILE_START__*/` and `/*__DOCPROFILE_END__*/` ONLY**, re-flattened by
    `tools/bundle-docprofile.mjs`, because `check-semantics.mjs` (run by
    `civicos-ui/test/run.mjs`) refuses ANY difference between app.html's copy and the package —
    and app.html:4636 carries the identical stale sentence today. Neither is a deploy, a
    version bump or a tag. **NOT** `bio-plane/dist/SECRETS.txt`, **NOT** `release/**`, **NOT**
    any other span of `app.html`.
  **READ, NEVER EDITED**: `docs/architecture/BIO_Content_Framework_v0_10.md`,
  `docs/development/QUEUE.md`, `docs/development/DECISIONS.md`, `CLAUDE.md`,
  `bio-plane/wrangler.jsonc`, `release/RELEASE.json`, `ocr-worker/**`, `pdf-worker/**`,
  `agent-worker/**`, `bio-plane/test/**`, `civicos-ui/test/**`.
  **NOT** `newgroup/**`, **NOT** any version bump, **NOT** `docs/development/QUEUE.md`,
  `DECISIONS.md` or `CLAUDE.md` (not this worker's to edit). NO DEPLOY, NO LIVE CALL.
concurrency: checked over the register 2026-09-14 — the three blocks with no top-level
  `released:` line (FL-10, FL-6, D-297) are all in fact RELEASED, two of them by an inline
  `### RELEASED …` heading (`3607b3b`, `56ed70b`) and D-297 by a `released:` line that sits
  at the FILE END rather than inside its own block. No live claim names any path here. That
  three of 59 blocks defeat a mechanical "has a `released:` line" scan is reported to CONDUCT
  as a record-hygiene finding, not worked around.
note on the THREE BLANK LINES above this block -- keep them, and the reason is measured:
  the corpus indexer joins a matched line under 200 characters with the next three lines
  before extracting. The preceding block's last line was the final line of this file, so
  appending a claim right after it made the generated index attach THIS CLAIM'S HEADER to
  the entry above -- one area's claim glued onto another area's record. Three blanks stop
  the join, and the index then regenerates byte-identically. A WORKAROUND at this site
  only: any append after a short final line does the same, so the next claim hits it too.
  Reported to CONDUCT as an item. (This paragraph names no id and quotes no marker word on
  purpose -- an earlier draft of it was itself harvested into the index it describes.)
released: 2026-09-14 by the CONTENT-PDF worker at the close of CPDF-17. The four sites read
  true against the tree and each carries its dated reason in place. THE COMMENTS-ONLY
  BOUNDARY IS MEASURED, NOT PROMISED: all four touched sources AND the 2.7 MB generated plane
  bundle are byte-identical to `origin/main` once comments are stripped, and the instrument
  proving it was itself armed against one-token executable changes in all five files (6 arms
  FAIL as declared) plus an over-strictness arm (comment-only lines in all five, PASS). Two
  instrument defects were found by running it rather than trusting it and are recorded in its
  own header: a misplaced `--no-index` made the first draft report EMPTY over anything at all,
  and running the whole-line `--` pass BEFORE esbuild deleted a JS block-comment terminator in
  the bundle whose prose began with `--`, binary-searched to the one line. FL-10's guard FIRED
  on all four sources and `dist/` was rebuilt exactly as it instructs (nothing bumped, nothing
  deployed); `civicos-ui/app.html`'s flattened docprofile block was re-flattened for the same
  reason, its diff 21 added / 8 removed lines and every one a comment. Gates on the REBASED
  tree: battery 187/187 · 11,324 against a TRUE BASELINE of 187/187 · 11,324 re-measured in a
  pristine worktree at `b0eddbf` — zero delta, as a comments-only item should have, measured
  rather than subtracted; `coverage --strict` exit 0 read unpiped; UI harness exit 0;
  `plancheck` clean but for UNPUSHED. The citation drive resolves all four Part II sections;
  its Part I arm FAILS on four line citations, which is the truthful result and REC-81's
  ground — it is not left implied and appears as an item in this worker's report.



## CLAIM 2026-09-14 SKILL (SK-6 — `ASSISTANT-PILOT.md` gets front matter; the LAST document owing it)

session: worker for queue item SK-6, worktree-isolated, spawned by CONDUCT #10.
worktree: `.claude/worktrees/agent-a25f97e7cabc42e53`, branch
  `worktree-agent-a25f97e7cabc42e53`, fast-forwarded to `main` at `8017dac` (the tree with
  CPDF-17 merged) before anything was measured.
paths:
- `docs/development/ASSISTANT-PILOT.md` — front matter per `CORPUS-STANDARD.md` §3.
- `docs/architecture/CORPUS-STANDARD.md` — §5's governed table gains the row at its END;
  the "Not yet governed" table's last row is struck, which empties that table; Status
  `as of` and, if a heading moved, a `--write` regeneration.
- `docs/development/CLAIMS.md` — this entry.
not claimed and not touched: `QUEUE.md`, `CLAUDE.md`, `DECISIONS.md`,
  `bio-plane/src/airun.mjs`, and everything the SKILL kickoff lists as another area's.
released: 2026-09-14 by the SKILL worker at the close of SK-6. `ASSISTANT-PILOT.md` carries
  front matter per `CORPUS-STANDARD.md` §3 — 8 incomplete sections declared, each with the
  evidence that produced it, and the sharpest one is the document's own title: it is not the
  first AI integration that was BUILT, the investigative session is, and `BIO_System_Design.md`
  §3 row 11 already said so. Place names the construct's missing level-1 home rather than
  inventing one, quoting §3's own bold cell. §5's governed table gains the row at its END and
  the "Not yet governed" table loses its last one; the sub-heading and the header row are KEPT,
  `bio-plane/test/corpuscheck.test.mjs` reads that sub-heading, and both of its not-yet arms
  PASS honestly over the empty table (38 pass, 0 fail). No stale row was left behind to keep an
  arm alive. GATES on the committed tree: `corpuscheck` **44 governed document(s), 0 fail**,
  exit 0 read UNPIPED and re-run AFTER the commits so the staleness arm could actually bite
  (M0-26's bound); `gates.mjs` **GREEN, class DOCS**, exit 0 — 19/19 doc-facing plane suites,
  1,124 assertions, 28.6s, plus analyst-vocabulary 57/57, member-respect 428/428,
  connections-sidebar 47/47, preauth-vocabulary 70/70; `plancheck --local` 0 fail 0 warn, its
  own corpus note reading 44 governed / 0 front-matter failures. NEGATIVE CONTROLS: four arms,
  each armed ALONE on the retrofitted file with every other defence open, restored by cp-back
  (never `git checkout --`) verified by sha256 AND `cmp` with the byte count printed against a
  21,358-byte floor of 10,000 — (0) baseline, nothing armed: 0 fail, exit 0; (1) Status `as of`
  pushed to 2026-09-13, one day behind the file's last commit day: FAILS naming the file; (2)
  `## 3 · The wizard` renamed without `--write`: FAILS on the Contents divergence at entry 3;
  (3) an Incomplete bullet naming `§The nonexistent section this arm invents`: FAILS naming that
  section; (4) over-strictness, the final file unarmed: 0 fail, exit 0. All restores
  byte-identical, sha256 `35ea1eeb…`. **ARM 1 CAME BACK GREEN THE FIRST TIME AND THE FINDING IS
  RECORDED RATHER THAN SMOOTHED:** the arm had armed (the file differed), but the checker `exec`s
  the FIRST `as of` in a Status and this Status carried two — the arm patched the trailing one.
  Both read the same date so nothing was wrong on the day, yet the file was being judged on a
  date an editor would not think to bump. The mid-sentence date was removed (`c562993`), the arm
  re-armed, and it FAILS as declared. Swept for the class over all 44 governed documents, reading
  the Status segment exactly as the checker parses it: 3 carry more than one `as of` and all 3 are
  benign (both dates equal, each judged on its latest). What the sweep cannot see: a date written
  in any form other than the literal `as of YYYY-MM-DD`. Commits `dd9a78d` and `c562993` on
  `worktree-agent-a25f97e7cabc42e53`; not pushed, not merged.



## DELEGATION 2026-09-14 SKILL (SK-6) -> CONDUCT: **A STATUS MAY CARRY TWO `as of` DATES AND ONLY THE FIRST IS JUDGED — THREE GOVERNED DOCUMENTS DO, ALL BENIGN TODAY**

**ACT, with its actor named: CONDUCT decides whether `corpuscheck` should refuse a Status
carrying more than one `as of YYYY-MM-DD`, and routes it if so.** `tools/corpuscheck.mjs` is
not this area's path, so the change is not made here.

**The measurement, taken while running SK-6's own ARM 1 and the reason that arm first came back
green.** `checkFile` does `/as of (\d{4}-\d{2}-\d{2})/.exec(fm.status)` — the FIRST match in the
Status wins, and the closing date the §3 grammar asks for is usually the LAST thing in that
field. So a Status with two dates is judged on the one a reader is least likely to think of as
the date, and bumping the visible trailing one changes nothing the checker reads. Swept over the
whole governed set, parsing the Status segment exactly as the checker does: **3 of 44 carry more
than one — `docs/development/UI-PLAN.md`, `docs/development/UI-KICKOFF.md`,
`docs/development/NOTIFICATIONS.md` — and all 3 are BENIGN**, both dates equal, each judged on
its latest. **There is no live defect to fix; there is a trap that fires the next time one of
those three is edited by somebody who bumps the date they can see.** The blind spot is stated:
the sweep sees only the literal `as of YYYY-MM-DD` form.

- **This is PRACTICE-SURVEY's own defect wearing equal dates.** `corpuscheck.test.mjs`'s header
  records it as a baseline arm that came back RED over an honest tree, where the two dates
  DIFFERED and the earlier one won. Here they agree, so nothing fails and nothing is visible.
- **Recommendation, and the reason it is a recommendation rather than a landing:** one arm in
  `checkFile` refusing a second `as of` in the Status would close it structurally and cost every
  owner one sentence. The alternative is to leave it, since it is latent rather than live.
  Either is defensible and the tool is CONDUCT's.
- **Reversal cost:** none today. It rises by one document each time a retrofitted Status is
  edited without the trap being known.

_(ROUTED by CONDUCT #10 2026-09-14 at SK-6's integration: decided YES — one `as of`, the latest, at the end of the Status; enacted as **M0-28** in `QUEUE.md` (the arm, the grammar line in `CORPUS-STANDARD.md` §3, the three doubles corrected, a suite arm). The delegation is answered; nothing further is owed here.)_
## CLAIM 2026-09-14 RECORD (REC-81 — every `framework:NNN` LINE citation in the plane's sources and in `INTERFACES.md` becomes a SECTION citation, per `CORPUS-STANDARD.md` §4.6)
session: REC-81 worker, worktree-isolated, Opus 5. Worktree
  `.claude/worktrees/agent-aac911da029714405`, branch `worktree-agent-aac911da029714405`,
  fast-forwarded to `origin/main` at `9d530ab` (CPDF-17 landed mid-item at `76ae1da`, four
  commits after the tree this worker started on — the earlier measurements were discarded
  and everything below was re-measured on `9d530ab`).
opened: 2026-09-14
paths: COMMENT LINES ONLY in every `.mjs` — the comment-stripped diff against `origin/main`
  is asserted EMPTY for all four sources and for the generated plane bundle. Named BY
  REGION, since three of these files are too large to name by line and a line number in a
  claim goes stale the way the citations this item is fixing did (`store.mjs` measured
  29,465 lines, 2026-09-14, `grep -a` only — a stray byte makes plain `grep` call it binary
  and match nothing):
  - `bio-plane/src/schema.mjs` — inside the `SCHEMA` template literal: the `--` comment
    blocks heading the `readings` table (`CONSTRUCTS Step 3 (FW-5): READINGS ARE
    PERSISTED`), the SUBJECT REGISTRY (`CONSTRUCTS Step 4, SLICE A (FW-6)`) and the
    `connections` table (`asserted_by is THREE-VALUED`) — five citations plus this file's
    one dated reason; AND the two paragraphs CPDF-17 landed at `76ae1da` (the no-extent
    block and the `reading_text_source` header), whose PROSE describes the citations this
    item has just converted and whose offset figure was wrong. Their Part II section
    pointers are NOT re-pointed — those are CPDF-17's — but the sentences this landing
    makes false are corrected in the same commit, and `84 lines early` becomes the
    measured 89 with the measurement named. Every line written into the literal is a
    whole-line `--` comment with no backtick, and the semicolon rule is honoured as
    CLAUDE.md words it (inline `--` comments), which is also what `#migrate` actually
    does: it drops whole-line `--` comments before splitting on the semicolon.
  - `bio-plane/src/index.mjs` — the block comments in `op=acquire`'s reading path
    (`CONSTRUCTS Step 3 (FW-5): the plane READS the document`) and in the acquire
    document's `reading` field. Three citations, plus the dated reason.
  - `bio-plane/src/store.mjs` — the `ENTITY_KINDS` vocabulary comment in the subject
    registry and the `#connectionView` comment. Two citations, plus the dated reason.
  - `bio-plane/src/affordances.mjs` — the `ENTITY_KINDS` vocabulary comment. One citation,
    plus the dated reason.
  - `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane/dist/bio-plane.bundle.json` —
    REBUILT by `npm run build`, never hand-edited, because FL-10's freshness guard names
    the plane's own bundle when a plane source moves. No bump, no deploy.
  - `docs/development/INTERFACES.md` — ONE line in the I2 connections paragraph. The
    paragraph is FRAMEWORK's, an area that is DORMANT and for which CONDUCT answers-for on
    the row; only the citation is touched and no prose around it.
  - `docs/development/CLAIMS.md` — this block.
  - `docs/DECIDED.md` — GENERATED, never authored: regenerated by `node tools/decided.mjs`
    because this block's own release line adds a ruling to the corpus it indexes and
    `plancheck` fails on the drift (767 -> 768 rulings, a one-line change).
  **READ, NEVER EDITED**: `docs/architecture/BIO_Content_Framework_v0_10.md` (current, and
  at `3f5e833` — the pre-front-matter text the old line numbers were written against),
  `docs/architecture/CORPUS-STANDARD.md`, `docs/development/QUEUE.md`, CPDF-17's landed
  diff at `76ae1da`.
  **NOT** `docs/development/QUEUE.md`, **NOT** `DECISIONS.md`, **NOT** `CLAUDE.md`, **NOT**
  the framework document itself, **NOT** `newgroup/**` (its `src/release.mjs` carries the
  same citations inside an embedded copy of the plane bundle — DIST's, regenerated at a
  release, named in the report rather than touched), **NOT** `release/bio-plane.bundled.mjs`
  (the signed artifact), **NOT** `bio-plane/test/**` (two of its four `framework:NNN`
  occurrences are in executable strings — suite titles — so converting them would break
  this item's own comment-only constraint, named in the report as class sites deliberately
  left), **NOT** `civicos-ui/app.html` (measured: it embeds none of these comments).
concurrency: checked over the register 2026-09-14 at `9d530ab` — no live claim block names
  any path here. CPDF-17 is `done` and merged, so the two blocks this item was told to
  leave alone now exist and their Part II pointers are untouched.
released: 2026-09-14 by the REC-81 worker. TWELVE sites converted, not the row's eleven —
the twelfth is `schema.mjs`'s `BIO_Content_Framework_v0_10.md:480`, the same defect in a
spelling `grep framework:[0-9]` cannot see. **THE ROW'S THREE HEADING MAPPINGS WERE WRONG
AND ARE CORRECTED HERE**: 247/248/251 resolve to §3 "The core objects" (not "Two
directions, and where they must meet"), 480/489 to §7 "Content types" (not §5), 554 to §8.1
"Connection GRADE" (not §6). The row's mapping is what those numbers point at in the
CURRENT file — the stale pointer read rather than the citation resolved — and the pre-shift
prose matches the citing comments word for word. **THE OFFSET IS 89, NOT 84**: every Part I
heading moved by exactly 89 against `3f5e833` (§1 98→187, §3 230→319, §7 476→565, §8.1
535→624) and an alignment sweep over the first 300 body lines matched 283 at +89 against 11
at +84. The wrong figure was in CPDF-17's two schema paragraphs, which are corrected in
place with the old number named rather than swapped, and in `QUEUE.md` twice, which is
CONDUCT's and is named in the report instead. Comment-stripped diff EMPTY on all four
sources and on the rebuilt 2.7 MB plane bundle. Battery 187/187 · 11,329 against a TRUE
BASELINE of 187/187 · 11,329 re-measured on this same tree at `9d530ab` — zero delta, and
zero suites moved by per-suite comparison rather than by subtraction; `coverage.mjs
--strict` exit 0 unpiped with REGISTER FLOOR 954/949 · 178/177 · 179/178 identical before
and after; `civicos-ui/test/run.mjs` exit 0 from the repo root, its only output delta being
printed SOURCE LINE NUMBERS that my inserted comment lines moved; `plancheck --local` 0
fail, 0 warn. Four control arms run, each alone, each restore verified by sha256 AND `cmp`;
two INSTRUMENT defects found and fixed at their sites (a diff parser that ate removed
whole-line `--` comments because they arrive as `---`, caught by the corpus floor; and an
esbuild comment-stripper that kept leading comments until it was made to minify). Nothing
is owed to a future actor by this release. `bio-plane/test/**`'s four `framework:NNN`
occurrences are deliberately left — two are executable suite titles — and `newgroup/src/
release.mjs` and `release/bio-plane.bundled.mjs` carry embedded copies that regenerate at a
release; all three are named in the worker's report as class sites, not as owed acts.
## CLAIM 2026-09-14 M0 (D-329+D-331+D-333 — the three driver-estate decay shapes M0-25's census cannot see: composed labels, the throw's blast radius, and tally decay)
session: M0 background-lane worker (worktree `.claude/worktrees/agent-ad7860e15dfeb0a6d`, branch `worktree-agent-ad7860e15dfeb0a6d`)
opened: 2026-09-14
authority: QUEUE.md's `### D-329+D-331+D-333` row, and the three DEBT rows it names as the authorities (D-329, D-331, D-333).
paths:
  - `bio-plane/test/m025-arm-anchor-witness.test.mjs` — EXTENDED, not rewritten. The existing
    A1-A6 / S1-S6 arms and the header's reach statement stay; what is added is the LABEL-QUOTE
    half (D-329: a driver's `must*:`/`expect*:` fragment evaluated against the way the SUITE
    COMPOSES the label, so a fragment that quotes a rendered count is caught by name) and the
    tally half (D-333: a driver's DECLARED arm tally read through the estate's own
    `control-register.mjs` grammar and compared with what its arm table actually holds).
  - `bio-plane/test/m025-arm-census.mjs` — EXTENDED: declared-vs-measured arm tallies on the
    runs it already makes (D-333), and the preflight report the throwing drivers now print
    read into the census's classification (D-331). Its existing verdicts, matcher unions,
    dirty-tree stop and exit rule are UNCHANGED.
  - `bio-plane/test/casepin.control.mjs`, `bio-plane/test/casesign.control.mjs`,
    `bio-plane/test/caseproduction.control.mjs` — D-331's three named throwing drivers: the
    ANCHOR PREFLIGHT the row recommends (validate every arm's anchor and report the WHOLE set
    before arming anything), so one dead anchor can no longer blind the arms behind it. The
    throw is KEPT — a half-armed tree is still never measured; what changes is that the whole
    anchor set is reported first. No arm's meaning, edit, subject or declaration moves.
  - `bio-plane/test/m025-anchor-witness.control.mjs` — APPENDED arms only (the new halves'
    negative controls); no existing arm edited.
  - `docs/development/DEBT.md` — **the D-329, D-331 and D-333 rows' dispositions only**,
    nothing else, no new row unless a residue is found (id via `tools/mintid.mjs D`).
  - `docs/development/MEASUREMENTS.md` — APPEND ONLY, this item's figures and arm results.
  - `docs/development/CLAIMS.md` — this block.
  - `docs/development/VERIFICATION.md` — ONLY if the driver law changes (the D-331 ruling), and
    then only the sentence that states it.
  **NOT** `bio-plane/src/**`, **NOT** `bio-plane/dist/**`, **NOT** `docs/development/QUEUE.md`
  (CONDUCT's sole ground), **NOT** `DECISIONS.md`, **NOT** `CLAUDE.md`, **NOT** `newgroup/**`,
  **NOT** any version bump, tag or deploy. NO LIVE CALL.
concurrency: checked over the register 2026-09-14 — the three claims still open are FL-10
  (`bio-plane/test/fleetbundles.control.mjs`, `bio-plane/dist/**`, build scripts), FL-6
  (`agent-worker/**`, `bio-plane/test/fleetbundles.test.mjs`) and D-297 (`newgroup/**`,
  `release/**`, `bio-plane/scripts/deploy.mjs`, `sshsig.mjs`). **Every path above is disjoint
  from all three**: no live claim names `m025-*`, `casepin/casesign/caseproduction.control.mjs`,
  or the three DEBT rows.

### AMENDMENT 2026-09-14, MID-ITEM (D-329+D-331+D-333 claim) — FOUR PATHS, each owed and none foreseeable from the brief
paths added:
  - **`bio-plane/scripts/armdecay.mjs` (NEW)** — the three shapes' shared instrument, in a module
    of its own **on `control-register.mjs`'s own stated precedent**: *"so the battery can test
    the instrument instead of trusting it"*. The witness and the census both consume it, and the
    witness drives its predicates over fixtures with known answers (S7-S10, T2, T3). Putting the
    logic in either instrument would have made the other one trust a copy.
  - **`docs/development/VERIFICATION.md`** — ONE new subsection only, *"A THROWING CONTROL DRIVER
    VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING"*, inserted above the M0-12 section. The
    original claim reserved this "only if the driver law changes"; **it changed** — D-331 asked
    for a ruling on one shape for the estate and the ruling is made, so it belongs in the file
    that states what tested means here rather than only in the DEBT row. **NOT** any other
    section, **NOT** the floor, **NOT** the register's figures.
  - **`bio-plane/test/m025-anchor-witness.control.mjs`** — the original claim said APPENDED ARMS
    ONLY, and **one existing arm's DECLARATION is corrected**, which is the amendment. A5 read
    `mustNot: A4` and returns [A4, A6] — measured identically on a PRISTINE `origin/main`
    worktree at `b0eddbf` with none of this item's changes, so it is a pre-existing red. Its
    patch must mutate the very line its own `find` quotes, so A4 firing is IRREDUCIBLE and
    correct; the declaration was right against the arm's ORIGINAL one-line spelling and nobody
    revisited it when the arm was re-anchored onto the two-line span. Corrected with the dated
    reason and TIGHTENED rather than loosened — A4 must now fail with EXACTLY this driver's own
    anchor in its finding list, so a real death arriving beside it still fails. **NOT** its
    edits, **NOT** any other arm.
  - **`docs/DECIDED.md`** — REGENERATED, not authored, by `node tools/decided.mjs`. Owed by
    CLAUDE.md's standing rule (*"Regenerate it in any turn that rules on anything — plancheck
    fails on the drift"*) and by `plancheck`, which reported STALE the moment the three
    dispositions landed. It is a generated index; no line is hand-written.
also recorded here rather than only in the report: **D-336 is BURNED** — `tools/mintid.mjs D` was
called twice in one turn and the first id was never read back off the tool's output. Recorded,
not reused (D-332's precedent). The id in use is **D-337**.
released: 2026-09-14 by the M0 background-lane worker — landed on branch `worktree-agent-ad7860e15dfeb0a6d`,
NOT pushed and NOT merged; CONDUCT integrates. All three shapes CLOSED at their sites with the
declined option priced in each row: D-329 by a static predicate that overturns the row's own
"no static instrument can see it", D-331 by the anchor preflight the row itself recommended with
record-and-continue declined and priced, D-333 by the census holding every readable declaration
against its own run. Gates on the final tree: battery **187/187 · 11,337** (own baseline
**187/187 · 11,324** on a pristine `origin/main` worktree at `b0eddbf`; the +13 attributed per
suite by diffing two full runs — witness +12, planning-hygiene +1), `coverage --strict` exit 0
read UNPIPED with `REGISTER_FLOOR` moved to the printed **957/178/179** (it arrived stale by
4/1/1, measured on the pristine worktree), UI harness exit 0 from the repo root, `plancheck` clean
but for UNPUSHED. Thirteen control arms run, thirteen as declared. **NOTHING IS OWED TO A FUTURE
ACTOR BY THIS NOTE**: the two findings this item stopped at are ROWS — **D-337** (caseproduction
arm C, attributed against a pristine worktree before filing) and **D-343** (three declared
tallies the new instrument found, deliberately unfixed because they sit in other claims) — and
both are in `DEBT.md` with what closing them takes. **D-336 is BURNED** and recorded as such.



## CLAIM 2026-09-14 CONTENT-OFFICE (COFF-9 — the OpenDocument flavour row in `ooxml.mjs`'s container discriminator; act (1) of Bob's 2026-09-14 Google Drive ruling)
session: coff9-odf-flavour-row (worktree `/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-ade6a3d78be9417fd`, branch `worktree-agent-ade6a3d78be9417fd`, from `2f16a94`)
opened: 2026-09-14T00:00:00Z
paths:
  - `bio-plane/src/ooxml.mjs` — **by REGION, not the whole file**: (1) the module header's
    ODF paragraph (the line that says ODF is DESIGNED FOR, not built — CORRECTED in place
    rather than left to contradict the code); (2) the "Flavour discrimination" section — the
    comment above `OOXML_FLAVOURS`, a `partMap` key ADDED to each of its three existing rows
    (no row removed, renamed or reordered), and the NEW `ODF_FLAVOURS` / `CONTAINER_FLAVOURS`
    tables and ODF part-name constants beside it; (3) `discriminate()` — its default
    `flavours` argument, the partition of the table by part-map, and the ODF branch reached
    only where the function already decided there is no `[Content_Types].xml`; (4) the new
    module-private `discriminateOdf()` helper. **NOT** the container walk, `readPart`,
    the XML helpers, `parseContentTypes`, the `_rels` walker, `docProps/core.xml` or the
    size guard — none of them moves.
  - `bio-plane/test/ooxml.test.mjs` — the module header's accepts-when list and its
    `NEGATIVE CONTROL:` line (EXTENDED with this item's arms, the COFF-2 arm kept verbatim),
    the "ODF is DESIGNED FOR" section heading and comment (CORRECTED, not exempted — its two
    assertions stand unmoved because they are still true), and a NEW OpenDocument section
    with its fixtures at the end of the fixture block. No existing assertion is edited or
    removed.
  - `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane/dist/bio-plane.bundle.json` —
    REBUILT by `npm run build` from `bio-plane/`, never hand-edited, because FL-10's
    freshness guard names the plane's own bundle whenever a plane source moves. No version
    bumped, nothing signed, nothing deployed.
  - `docs/development/MEASUREMENTS.md` — ONE appended section, because this item measured
    something worth keeping and its brief's premise was FALSE: an office suite IS on this
    machine (LibreOffice 26.8.0.3), so the real producer's ODF package layout is measured
    rather than assumed, and the pre-item `discriminate()` answer on all three real files is
    recorded. Appended at the end; no existing measurement edited.
  - `docs/development/CLAIMS.md` — this block.
  - `docs/DECIDED.md` — GENERATED, never authored: regenerated by `node tools/decided.mjs`
    only if `plancheck` reports drift from this block's own release line.
  **READ, NEVER EDITED**: `CLAUDE.md`, `docs/development/kickoffs/WORKER.md`,
  `docs/development/kickoffs/CONTENT-OFFICE.md`, `docs/development/OFFICE-FORMATS.md`,
  `docs/development/INTERFACES.md` (I7 is UNCHANGED by this act — a flavour is not an entry),
  `docs/development/QUEUE.md`.
  **NOT** `bio-plane/src/formats.mjs`, **NOT** `bio-plane/src/docx.mjs`, **NOT**
  `bio-plane/src/formats-xlsx.mjs`, **NOT** `bio-plane/src/pptx.mjs`, **NOT**
  `bio-plane/src/index.mjs` — the three format entries and the registry are COFF-10's and
  this act adds NO `registerFormat` call and NO I2 emission. **NOT**
  `docs/development/QUEUE.md`, **NOT** `DECISIONS.md`, **NOT** `INTERFACE-CHANGES.md`
  (no interface shape moves), **NOT** `docs/development/DEBT.md` (no debt filed), **NOT**
  `release/**`, **NOT** `newgroup/**`, **NOT** `civicos-ui/**`.
concurrency: checked over this register 2026-09-14 at `2f16a94` — no unreleased claim block
  names `bio-plane/src/ooxml.mjs`, `bio-plane/test/ooxml.test.mjs` or `bio-plane/dist/**`.
  CONTENT-OFFICE was dormant with its axis built end to end and was re-activated for this row.

### AMENDMENT 2026-09-14, MID-ITEM — ONE PATH ADDED: `docs/development/OFFICE-FORMATS.md`
The claim above listed this document as READ, NEVER EDITED. It is amended because ONE
sentence in it became FALSE the moment the code landed, and leaving a false line in a design
document for the window between COFF-9 and COFF-10 is the failure class this project records
most often. The bullet `§The finding that shapes everything` ended *"ODF is
[DESIGNED-not-built] deliberately, not pending."* — the flavour is now BUILT, and what
remains is PENDING as COFF-10. Exactly that one bullet is rewritten; no other line, no front
matter field, no heading and no other section moves, and `node tools/corpuscheck.mjs` reads
44 governed documents 0 fail before and after. The document is CONTENT-OFFICE's own design
source (named first in the area kickoff's authority order) and no other live claim names it.



## DELEGATION 2026-09-14 CONTENT-OFFICE → FRAMEWORK (answered-for by CONDUCT while FRAMEWORK is dormant) — **THREE SENTENCES IN `BIO_Content_Framework_v0_10.md` §16 ARE FALSIFIED BY COFF-9's LANDING AND ARE NOT MINE TO EDIT**
from: COFF-9 (worktree `agent-ade6a3d78be9417fd`, branch `worktree-agent-ade6a3d78be9417fd`)
what is needed, stated as an ACT with its actor: **CONDUCT (or FRAMEWORK) edits
`docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16** at the landing of COFF-9,
and updates the document's front matter in the same commit per `CLAUDE.md`'s rule. Three
statements there are now FALSE, measured against the merged code rather than predicted:
  1. `…the axis reads OOXML today and reads OpenDocument once one flavour row is added to the
     container reader, designed for and not built.` — the flavour row IS added. `ODF_FLAVOURS`
     is in `bio-plane/src/ooxml.mjs` and `discriminate()` answers `odt`/`ods`/`odp`.
  2. `Building it is two acts on the format axis: the OpenDocument flavour row in the container
     reader, and the three OpenDocument readers …` — the FIRST of the two acts is DONE; only
     the three readers remain, as COFF-10.
  3. `OpenDocument (.odt, .ods, .odp) is designed for and deliberately not built: zero were
     found among 43,282 city assets.` — the second clause still stands as COFF-6's census, but
     "deliberately not built" no longer describes the state and the reason it once gave was
     overturned by Bob's own 2026-09-14 ruling three sentences earlier in the same paragraph.
why it is a delegation and not an edit: the framework document is FRAMEWORK's ground and this
  claim does not name it. CONTENT-OFFICE corrected the one sentence in its OWN design source
  (`OFFICE-FORMATS.md`, see the amendment above) and stops at the area boundary.
timing: this is TRUE ONLY ONCE COFF-9's branch merges. Do not edit §16 before the merge —
  doing so would make the design document claim something `main` does not yet carry, which is
  the overclaim direction. **COFF-10's landing rewrites the same paragraph again**, so folding
  both at COFF-10 is a legitimate disposition — but then §16 is knowingly stale for that
  window and CONDUCT should say so rather than let it read as current.

### RELEASED 2026-09-14: the COFF-9 claim above, with its amendment and its delegation — landed on branch `worktree-agent-ade6a3d78be9417fd`, NOT pushed and NOT merged (CONDUCT integrates)
released: 2026-09-14 by the COFF-9 worker. **`discriminate()` answers `odt`/`ods`/`odp` on a
real OpenDocument package and a STATED `undetermined` on a container that only looks like
one, with every pre-existing OOXML outcome byte-for-byte unchanged.** The table now carries
`partMap` — `"opc"` on the three OOXML rows (otherwise untouched) and `"odf"` on the three new
`ODF_FLAVOURS` rows; a row with NO `partMap` is read as `"opc"`, so a caller-supplied table
written against the pre-COFF-9 shape keeps working (the suite's `vsdx` table is exactly that
case and still passes). `OOXML_FLAVOURS` is still EXACTLY the three OOXML rows;
`CONTAINER_FLAVOURS` is the union `discriminate()` defaults to. **PINNED with its reason at
`discriminateOdf`: a `mimetype` present but NOT FIRST or COMPRESSED is REFUSED into a stated
`undetermined` (`odf_mimetype_not_first` / `odf_mimetype_not_stored`)** — the rule is
OpenDocument 1.2 part 3 §3.3's own so the fence is not tighter than its rule, first-and-stored
is what makes the signal worth more than a filename appearing somewhere in an archive, and it
was MEASURED to cost nothing because all three real producer packages conform. **THE BRIEF'S
PREMISE WAS FALSE AND WAS REPLACED BY MEASUREMENT:** it said no office suite exists on this
machine; LibreOffice 26.8.0.3 does, so a real `.odt`/`.ods`/`.odp` were produced and read back
through this module's own central-directory walk (MEASUREMENTS.md 2026-09-14) — and PRE-ITEM
all three answered `format:"zip"`. COFF-6's census (ODF is ZERO in 43,282 assets) is
UNREVISED; the source changed, not the census.
**GATES, every exit status read UNPIPED.** Battery **187/187 suites green · 11,395 assertions
· exit 0**, against a TRUE BASELINE of **187/187 · 11,329 · exit 0** measured on this
worktree before any edit; the delta was attributed PER SUITE by diffing two full runs and
**exactly one suite moved — `ooxml.test.mjs` 101 → 167 pass, 0 fail — and no other suite
moved by a single assertion.** `node scripts/coverage.mjs --strict` run DIRECTLY from
`bio-plane/`, `$?` unpiped, **exit 0**, REGISTER FLOOR `arms 955/949 · classified 178/177 ·
corpus 179/178` against a pristine `origin/main` worktree's `954/949 · 178/177 · 179/178` —
**the 5/1/1 slack is PRE-EXISTING and was not moved**; the one arm added is this suite's own.
`node civicos-ui/test/run.mjs` from the repo root, **exit 0**. `node tools/plancheck.mjs
--local` **0 fail 0 warn**. `node tools/corpuscheck.mjs` 44 governed documents 0 fail.
**FL-10's guard FIRED exactly as promised** — `fleetbundles.test.mjs` went red naming the
stale bundle and the byte counts — and `npm run build` in `bio-plane/` rebuilt
`dist/bio-plane.bundled.mjs` (2,727,447 B, sha256 `1ea4e7d6…`) and `dist/bio-plane.bundle.json`.
`src/signpage.mjs` regenerated BYTE-IDENTICALLY and is not in the diff. **No version bumped,
nothing signed, nothing deployed.**
**CONTROLS, each armed ALONE.** (1) wrong mimetype value and (2) mimetype not-first /
compressed are DRIVEN in the suite rather than armed, because each pins a BEHAVIOUR and not
an absence; (3) the arm's own arm NEUTERED `ODF_FLAVOURS` to `[]` — **37 of 167 failed, ALL 37
inside the five OpenDocument sections (5 + 12 + 5 + 7 + 8) and NONE outside them**, re-armed
and re-measured AFTER the vacuous-`every` correction below, which is why it reads 37 and not
the 36 the first arming saw, restore verified by sha256
`4c24d145…` AND `cmp` AND 41,121 bytes. Over-strictness was measured against a tree this
session never touched: the FULL `discriminate()` result objects for **15 pre-existing cases**
captured from a pristine `git worktree add` of `origin/main` and from this tree are
**byte-identical, sha256 `fdeb3b97…` on both sides**.
**TWO FINDINGS ABOUT INSTRUMENTS, recorded rather than smoothed.** (a) **The control
register's marker grammar is punctuation-sensitive and cost a red gate.** Writing
`NEGATIVE CONTROL (COFF-2, …):` — the qualifier BEFORE the colon — made BOTH declarations in
`ooxml.test.mjs` invisible to `scripts/control-register.mjs`, which requires the phrase to be
followed immediately by `:` `—` `–` or `-`. The register then read the suite as declaring NO
control, `coverage.mjs --strict` exited 1 and `owed-controls.test.mjs` went red, with nothing
naming punctuation as the cause. Same class as the D-233 receipt in the register's own header,
and a SECOND instance of it; the fix is one character of ordering and a warning comment now
sits at the marker. (b) **A bare `ODF_FLAVOURS.every(...)` stayed GREEN over the emptied
table** — `[].every()` is true — found by arm (3) and closed by asserting the row COUNT beside
the predicate.
**WHAT IS OWED TO A FUTURE ACTOR: nothing by this release** — the one thing this landing
obliges is stated as an ACT with its actor in the DELEGATION block above (CONDUCT or FRAMEWORK
edits `BIO_Content_Framework_v0_10.md` §16 at merge, or folds it into COFF-10 and says §16 is
knowingly stale for that window). `OFFICE-FORMATS.md`'s one falsified sentence was corrected
here, in this area's own design source, per the amendment above.

_(ROUTED by CONDUCT #10 2026-09-14 at COFF-9's integration, answering for dormant FRAMEWORK: the three §16 sentences are corrected by COFF-10 at its landing (in its brief and on its row); until then §16 is knowingly stale for that window, stated here. BOB #10, who is editing Part II today, is told so the merge stays trivial. Nothing further is owed here.)_



## CLAIM 2026-09-14 RECORD (REC-82 — the `content` row on the `pdf-page` and `document` arms: table, writer, backfill, `stale`, purge, hygiene, catalogue)

Session: RECORD worker for REC-82, spawned by CONDUCT #10, Opus 5.
Worktree: `.claude/worktrees/agent-a3157d0e1e806990f` · branch `worktree-agent-a3157d0e1e806990f`.
Contract: IC-83 (ACCEPTED 2026-09-14, I5 1.10.0 -> 1.11.0, CHANGING until REC-82 + REC-83 land).

Paths claimed BY REGION, never whole files:

- **`bio-plane/src/schema.mjs`** — the NEW `content` table and its two indexes, placed
  immediately BEFORE the `host_governor` block; the two new nullable columns
  `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id` (each one line
  plus its comment inside the existing CREATE TABLE literal). Nothing else in the file.
- **`bio-plane/src/store.mjs`** — (a) the content writer and its helpers (a new region
  near the transcription reads); (b) the `inquiry_basis` projection inside `promote`'s
  transaction (the INSERT gains `content_id`); (c) the basis refusal arm in `promote`
  that runs the content checks before anything lands; (d) `purge`'s `TABLES` array (one
  name added, which covers BOTH arms); (e) the migration ADD COLUMN registry (two rows);
  (f) `#stats` if the purge report names the new table. NOT `earnedBasisRegistry` (REC-83),
  NOT the capture/link/task/reachability functions (CAPTURE's).
- **`bio-plane/src/index.mjs`** — ONLY if the op layer must route a new refusal shape.
  (Measured at the close: it did not; the refusal rides `op=promote`'s existing
  `BASIS_REFUSED` envelope. No edit made.)
- **`bio-plane/checks/bio-checks.mjs`** — the NEW `CONTENT_EXTENT_CHECKS` family
  (C-45.x, minted `node tools/mintid.mjs C` -> C-45), the canonical-extent reader and
  the synchronous SHA-256 the content address needs. `checkInquiryBasis` is NOT reshaped:
  the content arm is a separate exported function the same two gates call.
- **`bio-plane/test/content-extent.test.mjs`** (new), `bio-plane/test/nc-rec82.mjs` (new,
  the negative-control driver), and the `NEGATIVE CONTROL:` declaration in the new suite.
  `bio-plane/test/hygiene.test.mjs` only if its D-113 census needs the new table named.
- **`bio-plane/scripts/coverage.mjs`** — `REGISTER_FLOOR` only, ONE key set, moved to the
  figures this item's own green `--strict` run PRINTED.
- **`docs/development/DEBT.md`**, **`docs/development/MEASUREMENTS.md`**,
  **`docs/development/CLAIMS.md`** (this block), **`docs/development/INTERFACES.md`** and
  **`docs/development/INTERFACE-CHANGES.md`** only if the landing moves what IC-83 says.

Concurrency: COFF-9 is live on `src/ooxml.mjs` only — disjoint from every path above.

released: 2026-09-14 by the REC-82 worker — landed on branch
`worktree-agent-a3157d0e1e806990f`, NOT pushed and NOT merged; CONDUCT integrates.
IC-83's landing half is built on the `pdf-page` and `document` arms: the `content`
table (before `host_governor`, two indexes, in `op=purge`'s `TABLES` so it clears in
BOTH arms), the two NULLABLE `content_id` columns with their migration rows, the
writer on `checkInquiryBasis`/promote, the C-45 refusal family (C-45.1 out of the
page set · C-45.2 no extraction chain · C-45.3 unknown or unlanded kind · C-45.4
`dom` by name), the `stale` sweep on re-extraction, and the deterministic backfill.
**ONE COLUMN BEYOND IC-83's LISTED COLUMNS** — `page_count`, which IC-83's own Rules
paragraph requires ("the page count … stored on mint") and its column list omits;
named here and in the report so CONDUCT can decide whether the IC's text is amended
or the column is read as already required by it. **NOTHING ELSE MOVED BEYOND THE IC.**
`index.mjs` was claimed conditionally and NOT edited: the refusals ride `op=promote`'s
existing `BASIS_REFUSED` envelope.

Gates on the final tree, every exit read UNPIPED: battery **188/188 · 11,474 · 0
skipped** (own baseline **187/187 · 11,410** on a pristine `origin/main` worktree at
`d791aa7` with all three member installs — the first baseline read 186/187 · 11,334
with `ocr-worker` SKIPPED for a missing install and was re-measured rather than
reported); the +64 attributed PER SUITE by diffing two full runs, not by subtraction —
`content-extent.test.mjs` +59, `hygiene.test.mjs` +3 (the new table joins its schema
and D-113 censuses), `caselifecycle.test.mjs` +1, `planning-hygiene.test.mjs` +1
(D-345's own named row). `coverage.mjs --strict` **exit 0** with `REGISTER_FLOOR`
moved to the printed reproducible **967/179/180** (ONE key set; the pre-commit run
read `959/959 … contaminated: 1 suite` and was refused as a source). UI harness from
the repo root **exit 0**. `plancheck --local` **0 fail, 0 warn**. `corpuscheck` exit 0.
FL-10 fired on all three bundled sources and `dist/` was rebuilt exactly as its
message instructs; nothing bumped, nothing deployed, no live instance touched.

Eight control arms declared in `content-extent.test.mjs`'s `NEGATIVE CONTROL:` line
and run by `test/nc-rec82.mjs`; **all eight AS DECLARED on the final tree**, each armed
ALONE and every restore verified byte-identically by sha256 AND `cmp`. Two came back
wrong first and both are recorded at their sites rather than smoothed: `overstrict`
read `-1 pass / -1 fail` because the suite used `mustPromote`, which THROWS instead of
failing the named assertion; and `stale` reported `ARMED NO (patch matched 0×)` after
the derivation-bounds work moved its anchor, reading 59/0 — indistinguishable from a
subject that cannot be broken, and caught only by the printed match count.

**NOTHING IS OWED TO A FUTURE ACTOR BY THIS NOTE.** The one act this landing obliges is
stated as an ACT with its actor in the **DELEGATION block below** (CAPTURE persists I2's
page count at acquire) and priced in **`DEBT.md` D-345**. The three follow-on items are
already rows in `QUEUE.md` (REC-83 the reads, REC-84 the grammar, REC-85 the other three
arms) and nothing here adds to them. **C-45** was minted with `tools/mintid.mjs` (floor
C-44) and **D-345** likewise (floor D-344); neither was measured free by hand. Two
regions CONDUCT should re-read on the merged tree: `REGISTER_FLOOR` in
`bio-plane/scripts/coverage.mjs` (one key set, collapse any conflict and re-read the
print) and the DEC-49 region `is-content-extent` in `bio-plane/checks/bio-checks.mjs`,
whose `regionLines` is a property of the MERGED source. The front matter of
`BIO_Content_Framework_v0_10.md` was corrected in the landing commit as CLAUDE.md
requires — two bullets only, saying the content object is no longer absent and naming
what of §18's first piece is still unbuilt — and BOB #10 is editing that file today, so
the merge may want his eye on those two lines.


## DELEGATION 2026-09-14 RECORD (REC-82) → CAPTURE: persist I2's page count at acquire, so the content row's out-of-range refusal reaches every PDF

**The act, with its actor:** CAPTURE (or whoever next opens `op=acquire`'s path in
`bio-plane/src/index.mjs`) carries I2's page count onto the `reading` object that
`#writeReadings` persists — one field beside `text_source` / `text_tier` /
`text_container`, from the `i2text.pages` array the acquire path already holds in a
local (`pdfstructure.mjs` also returns `pages: doc.pageCount` from `structure()`).

**Why REC-82 did not do it.** `op=acquire` is CAPTURE's op and the acquire path is
CAPTURE's ground (`kickoffs/RECORD.md`: "CAPTURE owns the capture, link, task and
reachability functions"). REC-82 claimed `store.mjs`'s writer and `schema.mjs`'s new
table and did not reach into it.

**What REC-82 did instead, so nothing is blocked.** `content.page_count` stores the
page set the record ACTUALLY holds at mint — the union of the pages D-252's scoped
derivation steps name and the pages any attestation covers — and NULL where it holds
none, which is UNDETERMINED AND STATED on the row. C-45.1 (an extent outside the
capture's page set) therefore fires on a MIXED document today and not on a document
with one unscoped chain. The full reasoning, the cost and what closing it takes are
in **`DEBT.md` D-345**, which is the row this delegation points at; this entry exists
because a debt row is not an assignment and a note is not an item.

**What changes when it lands:** `Store#pageSetForCapture` prefers the stored figure
over the derived one, and the arm already in `test/content-extent.test.mjs` §4 —
already driven, already armed by `nc-rec82.mjs oob` — starts covering every captured
PDF instead of only the mixed ones. No interface moves: `content.page_count` is
already the column, and IC-83 already names the rule.
## CLAIM 2026-09-14 CONTENT-OFFICE (COFF-10 — the three OpenDocument registry entries, `.ods` / `.odt` / `.odp`)

Session: CONTENT-OFFICE worker, Opus 5, spawned by CONDUCT #10 after COFF-9 reached
`origin/main` at `d791aa7`.
Worktree: `/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a3ef28cc916b7cee7`
Branch: `worktree-agent-a3ef28cc916b7cee7`
Pristine baseline worktree (measurement only, never edited):
`/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a3ef28cc916b7cee7-baseline` at `d791aa7`.

EXACT PATHS CLAIMED:

- `bio-plane/src/formats.mjs` — THREE `registerFormat(...)` calls and their comments, appended
  after the existing `pptxEntry` registration. Nothing else in the file moves.
- `bio-plane/src/odf.mjs` — NEW. The three OpenDocument entry modules in one file (one
  container grammar, three part-maps), exporting `odtEntry` / `odsEntry` / `odpEntry` and the
  three media-type constants. The OOXML siblings' envelope builders are REUSED by importing
  their reference constructors (`docParaRef` from `docx.mjs`, `slideShapeRef` from `pptx.mjs`)
  and the ONE `linkWrapper` from `subresources.mjs`.
- `bio-plane/src/formats-xlsx.mjs` — **AMENDED at the build, and the amendment is stated rather
  than quietly taken.** This claim first said the file would NOT be touched, on the theory that
  the `.ods` entry could construct the `sheet-cell` reference to the same shape. That is
  DUPLICATION, which is exactly what the item's brief says not to do and how two producers of one
  IC-1 arm drift apart. The change is ONE `export` keyword on the existing `sheetCellRef`, no
  behaviour, and over-strictness arm (4) measures the three OOXML entries' outputs byte-identical
  across it rather than asserting that it is harmless.
- `bio-plane/src/ooxml.mjs` — NOT claimed for behaviour. Read-only except for its header
  paragraph's one falsified sentence ("What is built is the FLAVOUR only: there is still no ODF
  registry entry, no `registerFormat` call and no I2 emission (COFF-10's)"), corrected in place
  with the dated reason. No function, constant or branch in that file changes.
- `bio-plane/test/formats-odf.test.mjs` — NEW suite, its `NEGATIVE CONTROL:` line (D-344: the
  marker followed IMMEDIATELY by a colon), and its `test:` script in `bio-plane/package.json`.
- `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane/dist/bio-plane.bundle.json` — rebuilt
  because the sources above are bundled and FL-10's guard fails a stale artifact. Nothing
  bumped, signed or deployed.
- `docs/architecture/BIO_Content_Framework_v0_10.md` — Part II §16, THREE SENTENCES ONLY,
  quoted here so the diff is verifiable and BOB #10's concurrent edits merge trivially:
  (1) "the axis reads OOXML today and reads OpenDocument once one flavour row is added to the
  container reader, designed for and not built."
  (2) "Building it is two acts on the format axis: the OpenDocument flavour row in the
  container reader, and the three OpenDocument readers (`.ods`, `.odt`, `.odp` — one
  `content.xml` part each, smaller than their OOXML counterparts) producing the same I2 shape
  and evidentiary envelope; and one on the capture side: ..."
  (3) "OpenDocument (`.odt`, `.ods`, `.odp`) is designed for and deliberately not built: zero
  were found among 43,282 city assets."
  Plus the Status line's `as of` date if it reads lower than 2026-09-14. A FRAMEWORK delegation
  routed to this item by CONDUCT #10; NOTHING else in that document is touched.
- `docs/development/OFFICE-FORMATS.md` — the ODF bullet's `[DESIGNED-not-built]` clause only,
  which that bullet's own last sentence says is COFF-10's to finish.
- `docs/development/CLAIMS.md` (this block), `docs/development/MEASUREMENTS.md` (one appended
  COFF-10 section), `docs/development/DEBT.md` (only if this item opens a row).
- `docs/DECIDED.md` — REGENERATED, not hand-edited (`node tools/decided.mjs`), because the §16
  and OFFICE-FORMATS corrections carry marker words and `plancheck` fails on the drift. Added to
  this claim at the build; it is a generated artifact, so a merge conflict here is resolved by
  re-running the tool and never by picking a side.

NOT TOUCHED, stated because REC-82 is live on them: `bio-plane/src/schema.mjs`,
`bio-plane/src/store.mjs`, `bio-plane/src/index.mjs`. The item's own acceptance asserts
`index.mjs` never learns the three format names, so that disjointness is driven, not promised.

ADDED AT THE CLOSE, because a claim that does not name a path it edited is worse than no claim:
`bio-plane/scripts/coverage.mjs` — `REGISTER_FLOOR` ONLY (959/178/179 → 964/179/180), moved from
the figure this item's own green run PRINTED AFTER THE COMMIT, one key set, `^  arms:` grepped to
2 matches afterwards. `FLEET_FLOOR` is UNMOVED and none is owed.

released: 2026-09-14 CONTENT-OFFICE (COFF-10) — landed on branch
`worktree-agent-a3ef28cc916b7cee7`, NOT pushed and NOT merged; CONDUCT integrates.
**`.odt`, `.ods` and `.odp` are registry entries.** `bio-plane/src/odf.mjs`, three
`registerFormat` calls in `formats.mjs` and NOTHING anywhere else — the D-70 property DRIVEN by
grepping `index.mjs` for the three names and finding none. Each dispatches on COFF-9's
`partMap:"odf"` result and reads ONE `content.xml` into the SAME I2 shape and DEC-5 envelope its
OOXML sibling produces, with IC-1's `doc-para` / `sheet-cell` / `slide-shape` references built by
IMPORTING the siblings' own constructors. **NO new union member was needed, so NO IC was filed and
I7 is CONFIRMED by three more entries rather than changed.**
**The detect ladder is one step stronger than the OOXML entries' and the reason is measured**: ODF's
`mimetype` is required first and STORED, so a synchronous `detect` reads the VALUE (CRC-verified,
compared exactly) and answers `certain`. A names-only ladder would have been WRONG, not merely
weak — all three flavours have identical part names.
**THE TWO DEC-5 EXTRAS ONE `content.xml` CANNOT SUPPLY ARE NAMED ON EVERY SUCCESSFUL READ**, which
is this item's sharpest line: core properties live in `meta.xml` and embedded objects in
`META-INF/manifest.xml`, so no `core-properties` item and no `intra` link is emitted and both
absences are carried as `{part, why:"outside_content_xml_not_read", detail}` — an absent item
would otherwise read as "this document names no author" and `intra: 0` as "this document embeds
nothing". The fixture's `meta.xml` deliberately carries a creator the entries do not surface.
**MEASURED against LibreOffice 26.8.0.3, and two constructs were NOT where a spec reading would
have put them**: a hidden SHEET is `table:display="false"` on the table's STYLE and a hidden SLIDE
is `presentation:visibility="hidden"` on the page's DRAWING-PAGE STYLE, both in content.xml's own
automatic styles — which is what makes them readable from one part at all. Pre-item, against a
pristine `origin/main` worktree at `d791aa7`, the REGISTRY answered `undetermined`/`none` on all
three real files while the container tier already answered the flavour; that gap is what closed.
**Google Drive's own export is NOT reachable here and is NOT measured** — CAP-8 meets it first.
GATES: battery **188/188 · 11,542** against this session's own pristine baseline **187/187 ·
11,410**, the delta attributed by diffing two full runs per suite and closing exactly (+130 the new
suite, +2 hygiene's own per-suite census; no other suite moved by one assertion).
`node scripts/coverage.mjs --strict` run DIRECTLY from `bio-plane/`, `$?` unpiped, **exit 0**,
REGISTER FLOOR `arms 964/964 · classified 179/179 · corpus 180/180` after the move.
`node civicos-ui/test/run.mjs` from the repo root **exit 0**. `node tools/plancheck.mjs --local`
**0 fail 0 warn**. `node tools/corpuscheck.mjs` 44 governed documents **0 fail**. FL-10's guard
FIRED as briefed and `npm run build` rebuilt `dist/bio-plane.bundled.mjs` (2,760,995 B, sha256
`817e0a8f…`); `src/signpage.mjs` regenerated BYTE-IDENTICALLY and is not in the diff. Nothing
bumped, signed or deployed.
CONTROLS, five arms plus a baseline row: (1) content.xml removed → the absence named BY PART on
all three, structure and text `ok:false` and never an empty structure; (2) wrong flavour → refused
by name on all six cross pairs, plus a DOCX package and a plain ZIP; (3) the arm's own arm —
`unregisterFormat("ods")` → its two detect assertions fail by name and the other two entries are
UNMOVED, restored and the restore MEASURED; (4) over-strictness on the OOXML entries → outputs
byte-identical to the pristine tree, **sha256 `050ae28e36ca4be2b8bf5cb3e221a617e765c8841daad88831beba6cc2e5edeb`
on both sides**, corpus printed and FLOORED at 2,000 bytes because a digest over an empty object
agrees for free; (5) over-strictness on spellings this item did not anticipate → hiddenness on the
ELEMENT rather than the style, `text:s`/`tab`/`line-break`, and `number-columns-repeated` advancing
the cell address, all READ.
TWO FINDINGS ABOUT THIS ITEM'S OWN WORK, recorded rather than smoothed. (a) **A shared module-level
`/g` regex HUNG the first run.** `docx.mjs` and `pptx.mjs` each hold one and reset `lastIndex` at
the top of their single walk, which is safe because neither walk calls anything that walks. Every
walk here NESTS, so the inner call's reset rewound the outer loop and it never terminated. Closed
by a factory, with the reason at the site. (b) **`hygiene.test.mjs` caught the new suite ending on
`process.exitCode` instead of `process.exit`** on its first battery run — the rule working, and
the +2 hygiene delta is that same per-suite census counting the new file.
**WHAT IS OWED TO A FUTURE ACTOR: nothing by this landing.** The §16 delegation CONDUCT routed
here is DISCHARGED — all three sentences corrected in place with the dated reason, and nothing else
in that document touched. Everything CONDUCT should record is in this worker's report, stated as
acts with their actors.



## CLAIM 2026-09-14 CAPTURE (CAP-7 — the Google Drive link count over COFF-6's census corpus; a measurement, nothing built)

session: measurement worker for queue item CAP-7, worktree-isolated, spawned by CONDUCT #10.
worktree: `.claude/worktrees/agent-a455f510b4ade59b9`, branch
  `worktree-agent-a455f510b4ade59b9`, at `main` `30f2edf` (`git log HEAD..origin/main`
  empty — already current, nothing to fast-forward) before anything was measured.
paths:
- `docs/development/MEASUREMENTS.md` — one new dated entry, appended at the END.
- `docs/architecture/BIO_Content_Framework_v0_10.md` — Part II §16's "Google Drive
  formats" paragraph only: "not yet measured" replaced by the dated figure; the Status
  `as of` bumped to 2026-09-14. No heading moves, so no `--write` regeneration is
  expected; if one is needed it is taken with `tools/corpuscheck.mjs --write`.
- `tools/measure-office-corpus.py` — the COFF-6 instrument gains two modes,
  `drivelinks` and `drivecontrol`. Existing modes are not touched.
- `.gitignore` — one entry for this item's pen, `.cap7-pen/`, the same shape every pen
  above it has.
- `docs/development/CLAIMS.md` — this entry.
- `docs/DECIDED.md` — REGENERATED, never hand-edited (`node tools/decided.mjs`), because
  this landing moves it twice: this block's own closing line about whose call materiality
  is gets indexed as a CAP-7 entry, and Part II §16's Drive paragraph growing shifts D-194's cited
  line by +4. `plancheck` fails on the drift and CLAUDE.md requires the regeneration in the
  same turn; it is a generated index rather than another area's prose.
not claimed and not touched: `QUEUE.md`, `DECISIONS.md`, `CLAUDE.md`, `MILESTONES.md`,
  `bio-plane/src/**`, `bio-plane/checks/**`, `newgroup/**`. **Materiality is CONDUCT's
  ruling and is not stated here.** Nothing is built: no handler, no host-stack entry,
  no schema.
released: 2026-09-14 by the CAPTURE measurement worker at the close of CAP-7. **The count
  is 50 Drive links — 22 distinct targets in 16 documents — over a re-listed census of
  43,283 `oaklandca.gov` asset keys plus 793 Legistar attachments: 16 Docs, 16 `/file/d/`,
  12 Sheets, 6 other, ZERO Slides, ZERO folders, ZERO `/open?id=`. By WHERE, every one of
  the 50 is inside a document's BODY and not one is an asset or a Legistar attachment in
  its own right** (0 of 43,283 keys; 0 of 793 attachments, and 0 of the 793 are of the
  hyperlink kind at all). Four are in OOXML office bodies (3 of them real `.rels`
  hyperlinks, census of 762 files / 1.29 GB) and 46 in PDF bodies (12 of 1,000 sampled
  PDFs — a SAMPLE, 3.6 % of 27,783, because the PDF half is 133.6 GB); html/htm (62) and
  csv (166) censuses found zero. Recorded as **M-13** in `MEASUREMENTS.md` with the
  instrument, both commands and the blind spots; Part II §16's Drive paragraph carries the
  dated figure and no longer says the census has not been run. Population re-listed from
  the PUBLIC source, not read from any instance's register, and no credential was used or
  needed — `s3://cao-94612` and `webapi.legistar.com` are both anonymous reads; `npx
  wrangler whoami` reported `20b533579290b9b93168345edd3b7f72` as the standing guard. The
  live record's write path was never touched and no scratch namespace was entered. GATES on
  the committed tree: `corpuscheck` **44 governed document(s), 0 fail**, exit 0 unpiped and
  byte-identical to the pre-edit baseline (no heading moved, so no `--write`);
  `node tools/gates.mjs` **GREEN, class FULL** — battery **187/187 · 11,329 assertions**,
  `coverage.mjs --strict` exit 0 run directly (171/171 ops reached, 0 unreached), UI harness
  exit 0 from the repo root, `plancheck --local` 0 fail 0 warn. NEGATIVE CONTROL
  `drivecontrol`, 45 assertions, exit 0, six arms including over-strictness (197 non-Drive
  google links seen and refused on the REAL corpus, not only on fixtures). **The control
  found a real defect in the instrument on its first run and it is recorded rather than
  smoothed:** a `.rels` part that would not parse read as ZERO links while every other arm
  was green — the structural OOXML row would have said 0 instead of 3 — fixed with a
  raw-bytes fallback and kept as permanent arm 6. **MATERIALITY IS NOT RULED HERE and is
  CONDUCT's on the CAP-7 row.** Nothing was built: no handler, no host-stack entry, no
  schema. Nothing is owed to a future actor by this claim.
## CLAIM 2026-09-14 M0 (M0-30 — the `plancheck` arm behind `CORPUS-STANDARD.md` §4.7, and the sweep that brings every open queue row to it)
session: M0 background-lane worker (worktree `.claude/worktrees/agent-a12296b3767e15401`, branch `worktree-agent-a12296b3767e15401`)
opened: 2026-09-14
authority: QUEUE.md's `### M0-30` row; `docs/architecture/CORPUS-STANDARD.md` §4.7 (the rule), §5 (the governed table the arm READS) and §6 (what is ungoverned — the ledgers and the process documents); `kickoffs/CONDUCT.md` "A ROW NAMES THE DESIGN IT BUILDS FROM".
paths:
  - `tools/rowdesign.mjs` — NEW. The predicate: open rows out of `QUEUE.md`, the governed set
    read through `corpuscheck.mjs`'s own `governed()` (never a hand list), and the judgement.
    It is a module rather than inline in `plancheck.mjs` for the reason `plancheck` already
    states at sections 2b and 2c: `plancheck.mjs` self-executes and cannot be imported, so an
    inline predicate would have to be COPIED into the suite that drives it, and two readers of
    one question is how two answers were allowed to differ (D-302's receipt). `mintid.mjs` and
    `mergecarry.mjs` are the shape.
  - `tools/plancheck.mjs` — the new ARM only (a new section importing `rowdesign.mjs`, one
    FAIL per unpointed open row plus a corpus note). No existing check is edited.
  - `bio-plane/test/planning-hygiene.test.mjs` — the suite arm and its `NEGATIVE CONTROL:`
    line. This suite, not a new one: it is the file that already pins `plancheck`'s row
    grammar (`QUEUE_IDS` is read out of `### <ID> ·` headings there) and already carries the
    cheap-and-early copy of a `plancheck` gate.
  - `bio-plane/test/rowdesign.control.mjs` — NEW, the committed control driver (five arms plus
    a baseline), so the next session re-runs the controls in one step rather than re-deriving
    how to break the subject. Not a `.test.mjs`, so the battery does not run it.
  - `bio-plane/scripts/coverage.mjs` — **`REGISTER_FLOOR.arms` ONLY, 959 -> 961**, from this
    branch's own printed figure on a green `--strict` run. Nothing else in the file; ONE key
    set, grepped after writing. Added to this claim when the print moved, not before.
  - `.gitignore` — one entry, `.m030-harness/`, the control driver's pen. Same rule and same
    reason as every pen entry above it.
  - `bio-plane/test/m025-arm-anchor-witness.test.mjs` — **AMENDED INTO THIS CLAIM MID-ITEM,
    two lines of CORPUS ONLY** (`tools/` and `docs/architecture/**.md` added to the candidate
    subject set) with the reason at the site. Not planned: this item's own driver made the
    battery RED. Its anchors quote `tools/plancheck.mjs` and `CORPUS-STANDARD.md`, neither
    directory was in the witness's corpus, and A4 reported two LIVE anchors as gone to zero.
    That file's own comment records the identical false finding for `docs/development/` and
    the identical repair, so this follows its precedent rather than inventing one. **The
    alternative — re-spelling the driver's anchors so the extractor stops seeing them — was
    refused: it dodges the detector and leaves the arm exactly as fragile.** No arm, floor or
    assertion of that suite moves (24 pass before and after; corpus 391 -> 458 against a floor
    of 300). The D-329+D-331+D-333 claim that owns the file is RELEASED and M0-29, which names
    it, is `queued` and unspawned — CONDUCT should expect a trivial merge there.
  - `docs/development/QUEUE.md` — **`design:` POINTER LINES ONLY, one per open row that the
    arm fails, placed immediately after that row's `interface:` line.** Nothing else in this
    file: no status flip, no scope edit, no new row, no other line. `QUEUE.md` is CONDUCT's
    sole ground (ORCHESTRATION) and this claim is licensed for exactly those lines.
  - `docs/development/CLAIMS.md` — this block, and any `## DELEGATION … -> BOB` a routed
    design gap needs.
  - `docs/DECIDED.md` — **GENERATED, never hand-edited, and added to this claim after the
    fact rather than silently**: the seven `design:` lines shift QUEUE.md's line numbers, the
    index cites rulings BY LINE, and `plancheck` failed STALE on the drift (CLAUDE.md:
    regenerate it in any turn that moves the corpus). `node tools/decided.mjs`, 807 rulings /
    226.4 KB; the whole diff is 26 QUEUE.md line numbers and no ruling text.
not mine, stated: `CLAUDE.md`, `DECISIONS.md`, `docs/architecture/**` (the standard is READ,
never edited — an arm that edits the rule it enforces is not an arm), `MILESTONES.md`,
`DEBT.md`, and every row's own scope/status text in `QUEUE.md`.
concurrency: REC-82 (`schema.mjs`/`store.mjs`), COFF-10 (`formats.mjs`) and CAP-7
(`MEASUREMENTS.md`, Part II §16) are live and disjoint. `QUEUE.md` rows may be flipped by
CONDUCT while this runs, which is why the pointer lines are one line each and additive.
released: 2026-09-14, at the close of M0-30, on branch `worktree-agent-a12296b3767e15401`.
**What landed.** `tools/rowdesign.mjs` (the §4.7 predicate, governed set via `corpuscheck`'s
own `governed()`), its arm as `plancheck` section 7, the suite arm and 22 new assertions in
`planning-hygiene.test.mjs`, the committed driver `bio-plane/test/rowdesign.control.mjs`, and
the SWEEP: **seven `design:` pointer lines, one per open row the arm failed — M0-29, REC-87,
VF-7, CAP-7, CAP-8, SK-5, UI-59 — and nothing else in `QUEUE.md`.** Every pointer names a
section that EXISTS and was read before it was written; **ZERO gaps were routed to BOB, because
every failing row turned out to have a real authority** — the routed-gap path is built, driven
over fixtures and driven live by control arm A2, and is UNEXERCISED on today's queue, which is
stated here rather than left to look like coverage.
**Figures.** Battery **187/187 · 11,432** against this session's own pristine baseline worktree
at `952c7d7` (**187/187 · 11,410**); the +22 is `planning-hygiene.test.mjs` 252 -> 274 and no
other suite moved. `coverage.mjs --strict` DIRECTLY from `bio-plane/`, `$?` unpiped, **exit 0**,
REGISTER FLOOR **961/961 · 178/178 · 179/179** exact (floor moved 959 -> 961 from this branch's
own print, ONE key set). `node civicos-ui/test/run.mjs` from the repo root, **exit 0**.
`node tools/gates.mjs` **GREEN · class FULL**. `plancheck --local` **0 fail 0 warn**.
**Controls 25/25 as declared, FIRST RUN**, five arms plus a baseline, restores by sha256 AND
`cmp` AND a floored byte count — declared in the suite's own `NEGATIVE CONTROL:` line.
**THREE INSTRUMENT FINDINGS, each recorded rather than smoothed, and all three are about MY
instruments rather than the subject.** (1) The driver's first cleanup removed the PEN DIRECTORY
and took this session's baseline worktree and saved gate logs with it, on a clean run at exit 0;
`git worktree prune` cleared the stale registration and the driver now removes only the copies it
wrote. (2) The control register counted THREE arms in a declaration that states five, because two
of them stated their outcome in prose where three used the arrow grammar; re-spelled, and the
floor moved to the new print. (3) **The committed driver turned the battery RED, and the finding
was the WITNESS rather than the driver**: `m025-arm-anchor-witness.test.mjs`'s A4 reported two
live anchors as gone to zero because its candidate corpus reached neither `tools/` nor
`docs/architecture/`; corpus widened on that file's own recorded precedent, 0 dead anchors, 0
unnamed multiplicities, and the suite's own assertions unmoved at 24.
**WHAT IS OWED TO A FUTURE ACTOR: nothing by this landing.** The two items CONDUCT may want are
NOTICES, not debts, and both are in the report as acts with their actor: (1) `CORPUS-STANDARD.md`
§4's numbered list is written 1,2,3,4,5,7,6 — the row-design rule is labelled 7 but sits SIXTH,
so a Markdown renderer shows it as §4.6 and shows the line-citation rule as §4.7, exactly
swapping two numbers that are both in live use (`kickoffs/CONDUCT.md` and `kickoffs/WORKER.md`
cite §4.7; REC-81's claim cites §4.6). The fix is to swap the two list items so source order
matches their numbers; `docs/architecture/**` is not this claim's, so it is reported, not
edited. (2) UI-59's scope names the surface ledger as `docs/CIVICOS_UI_STATE.md`; the file is
`docs/development/CIVICOS_UI_STATE.md`. This claim is licensed for `design:` lines only, so the
row's own text was left alone.



## CLAIM 2026-09-14 M0 (M0-28 — corpuscheck refuses a Status carrying more than one `as of YYYY-MM-DD`)
session: worker for queue item M0-28, worktree-isolated, background lane (holds no slot), Opus 5.
Worktree `.claude/worktrees/agent-a835afee6c274d911`, branch `worktree-agent-a835afee6c274d911`.

paths, and NOTHING ELSE:
- `tools/corpuscheck.mjs` — ONE new arm in `checkFile` (more than one `as of YYYY-MM-DD` in a
  Status FAILS, naming the file and every date) plus the header grammar comment that states it.
  No other behaviour in the checker moves.
- `bio-plane/test/corpuscheck.test.mjs` — the suite arm driving it and the fifth entry in the
  suite's own `NEGATIVE CONTROL:` block.
- `docs/architecture/CORPUS-STANDARD.md` §3 — the grammar line: one date, the latest, at the END
  of the Status. §3 only; no heading moves, so no `--write`.
- `docs/development/UI-PLAN.md`, `docs/development/UI-KICKOFF.md`,
  `docs/development/NOTIFICATIONS.md` — **their Status lines ONLY**, one phrase each. M0-27 is
  live in the BODIES of these same three documents; this claim touches no body sentence.
- `bio-plane/scripts/coverage.mjs` — `REGISTER_FLOOR.arms` only, if this item's own green print
  moves it (one key set, re-read from the print, never incremented by hand).

not this claim's: `QUEUE.md`, `CLAUDE.md`, `DECISIONS.md`, every body sentence in the three
documents above, and every other field of every governed document.

released: 2026-09-14 by the M0 worker at the close of M0-28, commits `bdfcb86` + the floor
move, on branch `worktree-agent-a835afee6c274d911`, unpushed and unmerged as a worker's are.
`checkFile` carries the one arm; `CORPUS-STANDARD.md` §3 carries the rule; the three Status
lines carry one `as of` each; `corpuscheck.test.mjs` carries the eleven assertions and the
fifth NEGATIVE CONTROL entry; `REGISTER_FLOOR.arms` moved 974 -> 975 from this item's own
printed figure, one key set. **NO ACT IS OWED TO ANY FUTURE ACTOR BY THIS LANDING** — the
paths above are released, nothing is half-done, and the two observations for CONDUCT are in
the report as findings rather than as debts.
amended 2026-09-14, same session, with the reason: the claim above licensed the suite but not
a driver file, and the suite's own convention is that a control is re-runnable in ONE STEP —
so the negative-control driver landed as `bio-plane/test/nc-m028.mjs`, the estate's existing
`test/nc-*.mjs` shape (`nc-rec82.mjs`, `nc-cpdf10.mjs`), not discovered by the battery and
naming no path outside the six already claimed. `bio-plane/scripts/coverage.mjs` was claimed
for `REGISTER_FLOOR.arms` only and that is all it carries.



## CLAIM 2026-09-14 RECORD (REC-83 — the reads: `earnedBasisRegistry` keyed by content row, `op=earnedbasis` per extent, the fixed-key `content` read, `ensureLegContent` wired)

Session: RECORD worker for REC-83, spawned by CONDUCT #10, Opus 5.
Worktree: `.claude/worktrees/agent-ab4376cc9dd8e78b9` · branch `worktree-agent-ab4376cc9dd8e78b9`.
Contract: IC-84 (ACCEPTED 2026-09-14, I3 14.0.0 -> 14.1.0, CHANGING until REC-83 + REC-84 land),
its (3) and (4); IC-83's "What a leg may now claim (5.1, portion-scoped)" and its AMENDMENT.

Paths claimed BY REGION, never whole files:

- **`bio-plane/src/store.mjs`** — (a) the EARNED-BASIS READ region: `earnedBasisRegistry`
  gains a content-grain block and `earnedBasis` (the `op=earnedbasis` body) answers per
  extent; (b) a NEW read `contentRead(contentId, …)` placed in the REC-82 content region,
  beside `contentRow`; (c) the `ensureLegContent` CALL SITE, inside `earnedBasis`'s own leg
  pass and nowhere else; (d) the DO dispatch entry for `content` in the `url.pathname`
  route table. **NOT** `checkInquiryBasis`, **NOT** the version-leg writer, **NOT** the
  frontmatter grammar — REC-84 is live on all three. NOT the content WRITER
  (`mintContent`, `#contentPlanFor`, `#markContentStale`, the promote projection) — REC-82's,
  landed, read-only to me.
- **`bio-plane/src/index.mjs`** — ONE new line in the OPS table (`content`), its comment, and
  its `viewer`-stamping entry if the read-stamp list is explicit. Nothing else.
- **`bio-plane/src/affordances.mjs`** — ONE `NON_ACTS` row for `content` and its comment.
  NOT foreseen when this claim was written and added to it at the close rather than taken
  silently: `affordances.test.mjs` asserts a TOTALITY — every op in `NEEDS` is an ACT or is
  named in `NON_ACTS` with a reason — so a new read op is not addable without this row. It
  is the mechanism doing its job (REC-25's six ungated reads accumulated because nobody was
  asked the question), and it is one line plus prose.
- **`bio-plane/checks/bio-checks.mjs`** — ONLY if a check is owed (C via
  `node tools/mintid.mjs C`). MEASURED AT THE CLOSE: **no check is owed and this file is
  NOT touched.** The three refusals this item adds (`FIXED_KEY_ONLY`, `NO_SUCH_CONTENT`,
  `NO_ID`) are READ refusals on `reason`, which is `op=earnedbasis`' own shape
  (`NO_ID` / `NO_SUCH_BUNDLE` / `NOT_AN_INQUIRY`) and not the DEC-49 catalogue family —
  the guard harvests `/_CHECKS$/` exports, and a read's `reason` has never been one. REC-84
  is live on C-2.8 / C-25.10 in this file; nothing here goes near it.
- **`bio-plane/scripts/op-claims.mjs`** — the `PLANNED_OPS` line for `content` ONLY (removed
  in the same commit that builds the op; the arm fails on a PLANNED op that got built).
- **`bio-plane/scripts/coverage.mjs`** — `REGISTER_FLOOR` only, ONE key set, moved to the
  figures this item's own green `--strict` run PRINTED.
- **`bio-plane/test/content-reads.test.mjs`** (new), **`bio-plane/test/nc-rec83.mjs`** (new,
  the control driver) and **`bio-plane/test/rec83-baseline-probe.mjs`** (new, the instrument
  that MEASURES the over-strictness pin against a pristine tree), with the
  `NEGATIVE CONTROL:` declaration in the new suite.
  `bio-plane/test/content-extent.test.mjs` ONLY to correct its stated "`ensureLegContent`
  has no caller yet" paragraph, which this item makes false (corrected, never exempted).
  `bio-plane/test/gate-reads.test.mjs` — ONE entry in its `GATED` map, for the same reason
  as the `NON_ACTS` row above: its read-op sweep is a TOTALITY and a new read op must be
  classified by the item that adds it. Also not foreseen, also added here rather than taken
  silently.
- **`bio-plane/dist/bio-plane.bundled.mjs`** and **`bio-plane/dist/bio-plane.bundle.json`** —
  REBUILT, not authored (FL-10 fired on `src/`; `npm run build` in `bio-plane/`). Nothing
  bumped, nothing deployed.
- **`.gitignore`** — one line for `.rec83-control-pristine/`, the control harness's pen,
  on `.rec82-control-pristine/`'s precedent one line above it.
- **`docs/architecture/BIO_Content_Framework_v0_10.md`** — TWO SENTENCES of FRONT MATTER
  only (the §14.5 and §18 "Incomplete sections" bullets), which CLAUDE.md requires in the
  same commit as a landing that changes a construct: they named "the READS keyed by content
  row (REC-83)" as still absent, and this landing makes that false. **BOB #10 is editing
  this file today** — the edit is deliberately two sentences inside the front-matter block
  and touches no body line, and CONDUCT should put his eye on it at the merge (REC-82's
  landing flagged the same hazard on the same block).
- **`docs/development/CLAIMS.md`** (this block), **`docs/development/DEBT.md`** and
  **`docs/development/MEASUREMENTS.md`** only if this landing owes a row, and
  **`docs/development/INTERFACE-CHANGES.md`** only if the landing moves what IC-84 says.
  **`docs/development/QUEUE.md` IS NOT CLAIMED** — it was in this block's first draft and
  is withdrawn: CLAUDE.md names CONDUCT its SOLE writer, so REC-83's row flip and its
  `landed:` line are CONDUCT's act and are named as such in this worker's report rather
  than taken here.

Concurrency, measured at claim time: REC-84 live on `store.mjs`'s `checkInquiryBasis` /
C-2.8 / C-25.10 grammar and the version-leg writer, and on `bio-checks.mjs` — disjoint from
every region above, which is why the regions are named by function and not by file. COFF-10
on `formats.mjs`, M0-30 on `tools/plancheck.mjs`, CAP-7 on a script — all disjoint.

released: 2026-09-14 by the REC-83 worker — landed on branch
`worktree-agent-ab4376cc9dd8e78b9` (`02da952` + the floor commit), NOT pushed and NOT
merged; CONDUCT integrates. IC-84's read half is built: `earnedBasisRegistry` answers
at content grain behind an optional third argument, `gradeCeiling(chain, extent)` per
extent (a document attestation covers a `document` row, a PAGE attestation does NOT —
driven both ways), the connection axis of a non-`document` row UNDETERMINED and STATED
with the empty level NAMED, the new fixed-key `op=content`, `ensureLegContent` WIRED to
the first read and driven, and the two legitimate NULL `content_id` cases carried as
codes (`INQUIRY_TARGET`, `NO_BYTES_HELD`) decided where the distinction is made.
`content` removed from `PLANNED_OPS` in the same commit that built it.

**NOTHING MOVED BEYOND IC-84.** The capture axis is untouched and is not copied onto a
content row — it is document-grain, one field away, and its own gap is **D-349** rather
than a widening taken here. Two files beyond the claim's first draft were added to the
claim before they were edited and are named in it: `src/affordances.mjs`'s `NON_ACTS`
row and `test/gate-reads.test.mjs`'s `GATED` entry, both forced by TOTALITY guards that
refuse a new read op until somebody classifies it.

Gates on the final tree, every exit read UNPIPED: battery **189/189 · 11547 assertions ·
0 skipped** (own baseline **188/188 · 11474** on a pristine `origin/main` worktree at
`8f2023f` with all three member installs); the +73 attributed PER SUITE by diffing two
full runs, not by subtraction — `content-reads.test.mjs` **+69** (new),
`hygiene.test.mjs` **+3** (its three per-suite arms applied to the new suite: disposes
its Miniflare, exits deterministically, imports `sandbox.mjs`), `planning-hygiene.test.mjs`
**+1** (D-349's own disposition row). `coverage.mjs --strict` run DIRECTLY from
`bio-plane/`, `$?` read with nothing piped after it, **exit 0**, OPS **172 declared · 172
reached through the control plane · 0 unreached** (`content` carries its control-plane
assertion in the same turn), `REGISTER_FLOOR` moved to the printed REPRODUCIBLE
**973/180/181** (ONE key set, grepped after writing; the pre-commit run read
`967/967 … contaminated: 1 suite` with `arms 973` beneath it and was refused as a
source, exactly as REC-82's was). UI harness from the REPO ROOT **exit 0**.
`plancheck --local` **0 fail, 0 warn**. `corpuscheck` **exit 0, 44 governed documents**.
FL-10 fired on `src/` and `dist/` was rebuilt twice — once mid-item and once after the
final source change — exactly as its message instructs; nothing bumped, nothing
deployed, no live instance touched.

Six control arms declared in `content-reads.test.mjs`'s `NEGATIVE CONTROL:` line and run
by `test/nc-rec83.mjs`; **all six AS DECLARED on the final tree**, each armed ALONE and
every restore verified byte-identically by sha256 AND `cmp` (1,947,657 bytes, sha256
`ffd7b2553f99…` each time). **TWO CAME BACK WRONG ON THE FIRST RUN and both are recorded
at their sites rather than smoothed**: `docattest`'s declared held-open half was an
assertion that arm ALSO breaks, so the arm could not be held open by it and the
"other direction" claim was re-cut; and `unwired` read `-1 pass / -1 fail` because the
suite indexed `earned.content` directly and THREW when the arm left it absent — REC-82's
`overstrict` arm found the identical throw-instead-of-fail shape one item earlier.
**A THIRD THING WENT WRONG AND IT WAS THE DESIGN, NOT THE ARM**: the leg read was first
written with a `LIMIT`, and `bounds.test.mjs`'s walk found a thirty-second capped op and
named `earnedbasis` as capped-but-undriven. The cap came off rather than the roster
moving — it would have published two populations in one answer — and both rosters were
re-measured UNMOVED (`bounds` 162/0, `derivation-bounds` 42/0).

**NOTHING IS OWED TO A FUTURE ACTOR BY THIS NOTE.** Three acts this landing obliges are
stated as ACTS with their actors in the worker's REPORT, not here and not only here:
CONDUCT flips REC-83's row and writes its `landed:` line (`QUEUE.md` is CONDUCT's, sole
writer, so this claim deliberately does NOT claim it); CONDUCT resolves IC-84's CHANGING
status when REC-84 lands and UI-61 confirms; and D-349 needs a DOCTRINE decision that is
Bob's or CONDUCT's, priced in `DEBT.md` and measured in `MEASUREMENTS.md`. **D-349** was
minted with `tools/mintid.mjs` (floor D-345); **D-348 was allocated by a first invocation
of the same tool and is UNUSED** — held in the ledger, so nobody will collide on it, but
CONDUCT should know the gap is a burned id and not a missing row. No C-number was minted:
measured at the close, no check is owed (the three new refusals are READ refusals on
`reason`, `op=earnedbasis`' own shape, not the DEC-49 `_CHECKS` family). Two regions
CONDUCT should re-read on the merged tree: `REGISTER_FLOOR` in
`bio-plane/scripts/coverage.mjs` (ONE key set — collapse any conflict and re-read the
print) and the two FRONT-MATTER sentences in
`docs/architecture/BIO_Content_Framework_v0_10.md`, which **BOB #10 is editing today** and
which REC-82's landing flagged on the same block one item ago. One thing this worker
found and did NOT touch, because it is in nobody's claimed path: the LAST LINE of
`docs/development/DEBT.md` at `8f2023f` is a MALFORMED DUPLICATE of D-344 — id `344`
without its `D-` prefix and with every backticked span stripped out — which is
`printf`/`-m` damage in the shape CLAUDE.md's own trap section describes. `plancheck`
passes over it. It is named here so it is not lost.
## CLAIM 2026-09-14 M0 (M0-27 — the stale BODY sentences the four retrofits marked in front matter but could not correct, the D-106 class, prose only)

Branch `worktree-agent-aa79a87a6668b92b0`, worktree-isolated, background lane. Eleven
governed design documents under `docs/development/`, BODY prose and — where a front-matter
claim is measured wrong — the front matter of the same file:

- `docs/development/OFFICE-FORMATS.md`
- `docs/development/SCHEDULER.md`
- `docs/development/DOCUMENT-PROFILES.md`
- `docs/development/RETRIEVAL-SUBSTRATE.md`
- `docs/development/UI-PLAN.md`
- `docs/development/UI-KICKOFF.md`
- `docs/development/NOTIFICATIONS.md`
- `docs/development/AUTHORITY-AND-TRUST.md`
- `docs/development/ARCHIVE-FALLBACK.md`
- `docs/development/SOURCE-ACCESS.md`
- `docs/development/CAPTURE-FIDELITY.md`
- `docs/DECIDED.md` — the GENERATED ruling index, regenerated with `node tools/decided.mjs`
  because eleven ruling-bearing documents moved and `plancheck` fails on the drift
  (`CLAIMS.md` is not a list of what was hand-written, it is a list of what was touched).

Prose only, docs only. `docs/architecture/**` is NOT claimed and is not touched;
`QUEUE.md`, `CLAUDE.md` and `DECISIONS.md` are not this claim's. **M0-28 is live on
`tools/corpuscheck.mjs` and on the Status lines of `UI-PLAN.md`, `UI-KICKOFF.md` and
`NOTIFICATIONS.md` (it reduces two `as of` dates to one); this claim touches those three
files' BODY sentences and leaves their Status lines alone except to bump a trailing date
that is lower than 2026-09-14, so the overlap is a trivial merge and is expected.**
released: 2026-09-14, at the close of M0-27, on branch `worktree-agent-aa79a87a6668b92b0`.
**WHAT LANDED.** Eleven stale BODY sentences corrected in place with the dated reason
(2026-09-14, M0-27) in the framework's vocabulary, plus two the class sweep found in the
same documents (`DOCUMENT-PROFILES.md` §Where this runs, and `SOURCE-ACCESS.md`'s own
Incomplete bullet quoting the sentence it marked). **TEN Incomplete bullets removed**
where the section was thereby complete — `OFFICE-FORMATS.md` §preamble,
`DOCUMENT-PROFILES.md` §Where this runs, `RETRIEVAL-SUBSTRATE.md` §Serialization,
`UI-PLAN.md` §Development is PAUSED, `UI-KICKOFF.md` §The first arc's deliverable,
`AUTHORITY-AND-TRUST.md` §preamble, `ARCHIVE-FALLBACK.md` §preamble,
`CAPTURE-FIDELITY.md` §Sizing, and BOTH of `SCHEDULER.md`'s count bullets (§The mechanism
and §The test seam, its list going 4 -> 2) — and **THREE kept, deliberately**, because
the section still describes an unbuilt mechanism: `DOCUMENT-PROFILES.md` §Known gaps
(monitoring and `resolveLinks`' bracket still raw), `NOTIFICATIONS.md` §Applying a handler
(`per-item` is [DESIGNED-not-built]) and `SOURCE-ACCESS.md` §the allowlist (egress
diversity [ABSENT], D-120). The two `SCHEDULER.md` bullets are the only ones removed
WITHOUT the section becoming complete in the ordinary sense: what they marked was a
COUNT, and the count now lives in the corrected body as the COMMAND that reads it rather
than as a figure a front-matter bullet has to chase.
**TWO FRONT-MATTER CLAIMS MEASURED WRONG AND CORRECTED.** (1) `SCHEDULER.md` said the
always-due claim was "true of two entries out of eleven"; measured from `#schedConsumers`
on 2026-09-14 it is true of **FIVE** (`selection-sweep`, `task-drain`, `archive-monitor`,
`connection-derive`, `overdue-scan`), and the corrected body now carries the two awk/grep
commands rather than either figure. (2) `UI-PLAN.md`'s removed bullet said "fifty-seven UI
items added capability"; measured, **53** UI rows read `done` of **56** distinct rows
(UI-17 blocked — and its `### UI-17` heading occurs TWICE in `QUEUE.md`; UI-59 and UI-61
queued). The wrong figure left with the bullet; the same figure still stands in the Status
lines of `UI-PLAN.md` and `UI-KICKOFF.md`, WHICH THIS CLAIM DELIBERATELY DID NOT EDIT
because M0-28 is live on exactly those lines — it is named as an act for CONDUCT in the
report instead.
**FIGURES.** `node tools/corpuscheck.mjs` **44 governed documents, 0 fail, exit 0**
(unpiped), the same 44/0 as this branch's own baseline before any edit. `node
tools/gates.mjs` from the repo root **GREEN · class DOCS**, 13 paths all prose under
`docs/`, **exit 0** — doc-facing battery **19/19 suites green · 1,164 assertions · 53.1s**,
four UI suites green, `plancheck --local` **0 fail 0 warn**. `bio-plane/npm ci` run first.
**CONTROLS, run and recorded, 13 matchers + 2 arms + over-strictness.** A before/after
harness proves each matcher ARMS against the pre-edit file from HEAD before it is believed
against the tree (11 negative matchers 1->0, 2 positive 0->1 where the original text is
kept as history under an appended correction): **13/13**. (1) One corrected sentence
DELIBERATELY REVERTED — `CAPTURE-FIDELITY.md`'s "~40" cap — and the harness failed naming
that file and no other, 1 of 13; restored by `cp`-back, sha256 `fda2d0e5…` and `cmp`
identical at 5,626 B, harness back to 13/13. (2) corpuscheck's DATE ARM driven once on
`ARCHIVE-FALLBACK.md`: Status `as of` set to 2026-09-13 behind the file's 2026-09-14
commit day -> **exit 1, FAIL naming the file** ("the body moved and the front matter did
not"); restored by `cp`-back, sha256 `627ce814…` and `cmp` identical at 16,337 B,
corpuscheck back to 0 fail. **OVER-STRICTNESS: the 33 governed documents whose bodies
already agreed with their front matter are UNTOUCHED and all pass** — `git status
--porcelain` shows exactly the 11 claimed documents plus `CLAIMS.md` and `DECIDED.md`.
**ONE INSTRUMENT FINDING, recorded rather than smoothed:** the `SOURCE-ACCESS.md` matcher
armed **TWICE** on HEAD where 1 was declared, because the stale sentence sat in the body
item AND was quoted verbatim in that file's own Incomplete bullet. The subject was right
(both were corrected, tree=0); the DECLARATION was wrong, and it was only visible because
the harness prints the armed count instead of asserting "non-zero".
**NOTHING IS OWED TO A FUTURE ACTOR BY THIS LANDING.** The two items for CONDUCT are
NOTICES stated as acts with their actor in the report: the two Status-line figures above,
left to M0-28's pass, and `QUEUE.md`'s duplicated `### UI-17` heading.

## CLAIM 2026-09-14 BOB (Part II §18 pieces 2–4 designed as three level-2 documents; the three homeless level-1 documents)
session: BOB #11 (worktree `bio-worktrees/BOB`, branch `bob-audit`)
opened: 2026-09-14
authority: `kickoffs/BOB.md` ("What this session may write"); `BIO_Content_Framework_v0_10.md` Part II §18 (pieces 2, 3, 4 are the architect's); `BIO_System_Design.md` §3 (rows 11, 13, 15 carry no level-1 home); `CORPUS-STANDARD.md` §4.3 and §5
paths:
  - `docs/development/CONTENT-SEARCH-DESIGN.md` — NEW (piece 2)
  - `docs/development/OBSERVATION-LOG-DESIGN.md` — NEW (piece 3)
  - `docs/development/EXTRACTION-BREADTH-DESIGN.md` — NEW (piece 4)
  - `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` — NEW (construct 11's home)
  - `docs/architecture/BIO_Publication_v0_1.md` — NEW (construct 13's home)
  - `docs/architecture/BIO_Distribution_v0_1.md` — NEW (construct 15's home)
  - `docs/architecture/BIO_Content_Framework_v0_10.md` — Part II §18's table and front matter only (pointers to the designs)
  - `docs/architecture/BIO_System_Design.md` — §3 rows 5, 9, 11, 13, 15 and the closing paragraph; front matter
  - `docs/architecture/CORPUS-STANDARD.md` — §5's governed table, three rows
  - `docs/architecture/README.md` — the catalogue entries for the three new level-1 documents
  - `docs/development/DEBT.md` — appended design pointers on D-222, D-196, D-319, D-283 (text cells only; dispositions are CONDUCT's)
  - `docs/development/MILESTONES.md` — one pointer sentence under M5
  - `docs/development/QUEUE.md` — the BOB INBOX only (append)
released:






## CLAIM 2026-09-14 RECORD (REC-84 — the basis leg's `extent` in frontmatter, the C-2.8 / C-25.10 grammar arms, the version-leg `content_id` writer, and the suggested legs' `document` default)

Session: RECORD worker for REC-84, spawned by CONDUCT #10, Opus 5.
Worktree: `.claude/worktrees/agent-ae95c3be71f5bd167` · branch `worktree-agent-ae95c3be71f5bd167`.
Contract: IC-84 (ACCEPTED 2026-09-14, I3 14.0.0 -> 14.1.0, CHANGING until REC-83 + REC-84 land),
its (1) and (2); IC-83 as AMENDED at REC-82's landing.

Paths claimed BY REGION, never whole files:

- **`bio-plane/checks/bio-checks.mjs`** — (a) the C-45 family's header and
  `CONTENT_EXTENT_CHECKS`, which gains three rows for the content-ROW refusals
  (no new family: SK-1's rule that a family is a floor which buys slack for
  everybody else's walk — `node tools/mintid.mjs C` was run and returned C-47,
  which is therefore MINTED AND UNUSED, a gap that costs nothing); (b) the
  grammar half of `checkContentExtent`, split out as `checkContentExtentGrammar`
  so ONE implementation serves the pure catalogue and the store — the checker is
  not duplicated; (c) `checkInquiryBasis`'s extent arm (C-2.8) and the
  `content_id` shape arm; (d) `basisVersionFindings`' per-leg extent arm
  (C-25.10). NOT `checkEarnedLeg` / `checkInheritedLeg`, NOT the earned-basis
  reads (REC-83's).
- **`bio-plane/src/store.mjs`** — (a) `checkInquiryBasis`'s grammar half as it is
  consumed at `promote`'s content-extent refusal arm (REC-82's `cerrs` loop),
  extended with the content-ROW arms; (b) the NEW private `#contentRowFor`
  helper and its DEC-49 region `is-content-row`; (c) the VERSION-LEG WRITER —
  `Store.basisVersionsOf`'s leg shape and `promote`'s
  `INSERT INTO inquiry_basis_version_legs`, which gains `content_id`; (d) the
  version-leg content refusal arm inside `promote`'s existing
  `basis-version-resolve` neighbourhood; (e) `#suggestionPersisted` and the
  suggest endpoint's `lRows` emitter (the investigative run's suggested legs).
  **NOT** `earnedBasisRegistry`, **NOT** `ensureLegContent`'s call site, **NOT**
  any new `content` read op, **NOT** the PLANNED ledger — all four are REC-83's,
  live in parallel. **NOT** the capture/link/task/reachability functions
  (CAPTURE's), **NOT** `formats.mjs` (COFF-10's), **NOT** `tools/plancheck.mjs`
  (M0-30's).
- **`bio-plane/src/index.mjs`** — ONLY if the op layer must route a new refusal
  shape. Expected NOT to be needed (the refusals ride `op=promote`'s existing
  `BASIS_REFUSED` / `BASIS_VERSION_REFUSED` envelopes); recorded at the close.
- **`bio-plane/test/content-extent-leg.test.mjs`** (new) and
  **`bio-plane/test/nc-rec84.mjs`** (new, the negative-control driver), with the
  `NEGATIVE CONTROL:` declaration in the new suite. Existing suites only where an
  assertion is SUPERSEDED, corrected with a dated reason and never exempted.
- **`bio-plane/scripts/coverage.mjs`** — `REGISTER_FLOOR` only, ONE key set, moved
  to the figures this item's own green `--strict` run PRINTED.
- **`civicos-ui/check-refusal-codes.mjs`** — the `FLOOR` table only, and only the
  keys this item's own green run reports as GROWN, each attributed between
  pre-existing slack and this item.
- **`bio-plane/dist/`** — rebuilt as FL-10 instructs (sources are bundled); nothing
  bumped, nothing deployed.
- **`docs/development/CLAIMS.md`** (this block), **`docs/development/DEBT.md`**,
  **`docs/development/MEASUREMENTS.md`**, and **`docs/development/INTERFACE-CHANGES.md`**
  only if the landing moves what IC-84 says.

Concurrency, checked at the claim: REC-83 is live on `store.mjs`'s earned-basis
reads, `ensureLegContent`'s call site and a new `content` read in `index.mjs`;
COFF-10 on `formats.mjs`; M0-30 on `tools/plancheck.mjs`; CAP-7 on a script.
Every one is disjoint from the regions above.

released: 2026-09-14 by the REC-84 worker — landed on branch
`worktree-agent-ae95c3be71f5bd167`, NOT pushed and NOT merged; CONDUCT
integrates. IC-84's (1) and (2) are built. **The grammar:** a basis leg and a
version leg may carry IC-1's union flattened onto the leg as `extent_kind`,
`extent_page`, `extent_rect`, `extent_ref` (plus the three unlanded arms' fields,
carried unread) — the restricted frontmatter grammar needed NO change and that is
MEASURED through the real parser, not assumed — or may name an already-minted
part outright as `content_id` (64 lowercase hex, the minter's own shape). ABSENT
means the whole document and never `unstated` (Bob's 5.3), which is what keeps
every leg already in the record promoting byte-identically. `checkLegExtentGrammar`
is the ONE grammar function and it runs `checkContentExtent` — the ONE checker,
one `covers` per arm — so nothing is re-implemented; `checkInquiryBasis` calls it
at **C-2.8** and `basisVersionFindings` at **C-25.10**, the C-number read out of
the map and never typed. The two arms only the record can answer (the page set,
the chain) are SKIPPED for the pure catalogue through an explicit
`CONTENT_EXTENT_DOCUMENT_ONLY` value, so the two gates cannot come to hold two
answers. **Two new rows in the EXISTING C-45 family, no new family** (SK-1's rule
that a family is a floor which buys slack for everybody else's walk): **C-45.5**
a named content id whose row does not exist, **C-45.6** a row that addresses a
different document — both refused BY NAME from the new DEC-49 region
`src/store.mjs #contentRowFor > is-content-row`. A leg naming a PART of an inquiry
is refused, by extent or by id. **The version-leg writer** fills
`inquiry_basis_version_legs.content_id` through the SAME `#contentPlanFor` plan
and the SAME `mintContent` address the live basis uses — mint-or-find, no second
allocator, one row for one passage across both leg grains; the leg's referent
joins the composition the freeze compares as a `leg_referent` line emitted ONLY
when it is not the default, so every version already in the record composes
byte-identically (PL-3's `kind` precedent, and the reason). **The suggested legs**
state `extent_kind: "document"` in the emitted bytes, written as a LITERAL with no
path for a caller to name a portion — that is SK-7's act, not this one's.
**ONE SHAPE BEYOND IC-84's LISTED TEXT, named here rather than widened:** a basis
leg's optional `content_id`. IC-84 (1) says "a content id whose row does not exist
is refused", which presupposes a leg that can name one, and the row's own negative
control requires it — but the FIELD is not in the IC's column of the grammar, so
CONDUCT decides whether the IC's text is amended or read as already requiring it.
`op=basisversions` was NOT widened to serve the column (see **D-350**), for the
same reason: IC-84's text names `op=promote`, `op=earnedbasis`, the `content` read
and `op=attesttext`, and a surface it does not name is not this item's to move.
`op=promote`'s response gained an additive `version_content[]`, SELECTED BACK OUT
OF THE TABLE — never assembled from the value the INSERT was handed, which is what
lets the `vwriter` control arm see a dropped column at all.

Gates on the final tree, every exit read UNPIPED: battery **189/189 · 11,532 · 0
skipped, exit 0** (own baseline **188/188 · 11,474, exit 0** on a pristine
`git worktree add` of `origin/main` at `9a713f1` with all three member installs —
the brief's ~188/188 · ~11,474 was RIGHT and is reported as measured, not
assumed); the +58 attributed PER SUITE by diffing two full runs —
`content-extent-leg.test.mjs` +53 (new), `content-extent.test.mjs` +1,
`hygiene.test.mjs` +3, `planning-hygiene.test.mjs` +1 (D-350's own row), summing
exactly. `coverage.mjs --strict` **exit 0**, `REGISTER_FLOOR` moved to the
REPRODUCIBLE figures this item's own green run printed (the CONTAMINATED figures
were refused as a source — D-238). UI harness from the repo root **exit 0**, with
**ELEVEN floors moved** in `civicos-ui/check-refusal-codes.mjs` from that run's
print, each attributed between PRE-EXISTING SLACK and this item by re-running the
guard on the pristine `9a713f1` worktree — ten of the eleven were already stale
(REC-82 landed a whole DEC-49 family the same day and moved none), and the table
is in `MEASUREMENTS.md`. `plancheck --local` 0 fail. `corpuscheck` 0 fail. FL-10
fired on three sources and `dist/` was rebuilt exactly as its message instructs;
nothing bumped, nothing deployed, no live instance touched.

Eight control arms declared in `content-extent-leg.test.mjs`'s `NEGATIVE CONTROL:`
line and run by `test/nc-rec84.mjs`; **all eight AS DECLARED on the final tree**,
each armed ALONE, every patch matching exactly 1×, every restore verified
byte-identically by sha256 AND `cmp` with the byte count printed. **Three findings
recorded rather than smoothed.** (1) The `grammar` arm's first run read `-1/-1`
because an assertion spelled `a[0].message` threw when the neutered function
pushed nothing — REC-82's own shape one item later; the assertion is now null-safe
and the arm reaches the foot, which is what proved the STORE's arms still stand
behind the catalogue's. (2) `composeOf` first asked `op=basisversions` with
`target=` instead of `id=`, so two over-strictness arms passed OVER AN EMPTY
ANSWER — blind by construction, caught only because a sibling arm asked for the
version by name; the helper now throws on an answer it did not get. (3) The
`overstrict` arm necessarily refuses the fixtures and cannot reach the tally; that
is DECLARED up front and graded separately rather than as a clean count.
**Four suites went red on the first battery and every one was a real finding**,
not flake: `content-extent` (REC-82's four assertions, SUPERSEDED by IC-84 moving
the gate — CORRECTED with a dated reason and never exempted, and they now assert
BOTH the rule that refused and the code it was refused by); `hygiene` (the new
suite owed `stdio.mjs` and `sandbox.mjs`); `mintid` (a comment naming a freshly
minted C id drove the live C floor off PROSE — the number was removed and the
lesson written at the site); `versions` (a typed `C-25.10` literal in a call
argument, where the map's own `.check` belongs).

**NOTHING IS OWED TO A FUTURE ACTOR BY THIS NOTE.** The two acts this landing
obliges are stated as ACTS with their actors in the report's "for CONDUCT" list
and priced in **`DEBT.md` D-350** (RECORD: serve the version leg's referent on a
read). **D-350** was minted with `tools/mintid.mjs` (floor D-345) and a C id was
minted and deliberately left UNUSED — the number is not written into
`bio-checks.mjs`, because that file IS the C namespace's corpus and naming an
unallocated id there raises the floor off prose, measured red on this item's own
first battery. Three regions CONDUCT should re-read on the merged tree:
`REGISTER_FLOOR` in `bio-plane/scripts/coverage.mjs` (ONE key set — collapse any
conflict and re-read the print), the eleven `FLOOR` keys in
`civicos-ui/check-refusal-codes.mjs`, and the new DEC-49 region `is-content-row`
in `src/store.mjs`, whose `regionLines` is a property of the MERGED source. The
front matter of `BIO_Content_Framework_v0_10.md` was corrected in the landing
commit as CLAUDE.md requires — the §14.5 and §18 bullets, which named REC-84 as
still absent.


## CLAIM ADDENDUM 2026-09-14 RECORD (REC-84 — the merge with `origin/main`, and the figures RE-READ on the merged tree)

Appended rather than rewriting the release above, because that block's figures
were TRUE OF THE BRANCH and the branch is no longer the tree anybody will merge.
**`origin/main` moved onto this item's own ground while it ran** — REC-83 landed
the content-grain READS (`cc8187d`), with M0-28, COFF-10 and M0-30 beside it —
and both items had edited `src/store.mjs`, `test/content-extent.test.mjs`,
`scripts/coverage.mjs`'s `REGISTER_FLOOR`, three planning documents and the
content framework's front matter. The merge was therefore done HERE (`40f34e1`)
rather than handed to CONDUCT blind, by a session that understands both halves of
the content work. `src/store.mjs` and `test/content-extent.test.mjs` AUTO-MERGED
and were verified by RUNNING the suites rather than by reading the diff.

**THE CONFLICT WORTH READING IS `REGISTER_FLOOR`, and it is the six-times hazard
in its most dangerous form: both sides carried the SAME three numbers
(975/180/181) for entirely different reasons.** Taking either side unchanged
would have looked right and been wrong, because on a merged tree the two items'
arms ADD. Collapsed to ONE key set with both sides' notes kept, and the values
re-read from the merged tree's own green run: **arms 989, classified 182, corpus
183** (`GREW by 14`), the +14 being REC-84's `content-extent-leg` (8) and REC-83's
`content-reads` (6), each a suite the other branch did not have. Two DEC-49 guard
floors also moved again on the merged tree — `census` 472 -> 474 and
`untranslated` 268 -> 270, both REC-83's codes; `reachGap` read 40, its ceiling,
on every tree measured.

Gates ON THE MERGED TREE, every exit read UNPIPED: battery **190/191 · 11,770**,
`coverage.mjs --strict` **exit 0**, UI harness **exit 0**, the eight control arms
re-run and **all eight AS DECLARED** with every restore byte-identical,
`plancheck --local` clean.

**THE ONE RED IS NOT THIS ITEM'S AND IS PROVEN SO RATHER THAN ASSERTED.**
`mergecarry.test.mjs` fails naming ONE unregistered drop in main's own history —
`cc8187d:bio-plane/scripts/coverage.mjs`, CONDUCT's merge of REC-83 taking one
side of that same `REGISTER_FLOOR` whole. It was reproduced on a PRISTINE
`git worktree add` of `origin/main` holding none of this item's work, where it
fails identically (57 pass / 1 fail). It is **D-335's class exactly** — the row
that says this instrument goes red only AFTER publication, on everyone's gate —
and it fails for every checkout of main until the register row is written.
**CONDUCT's act, named in the report's "for CONDUCT" list.**
## CLAIM 2026-09-14 CAPTURE (CAP-8 — the Google Drive host-stack handler: the link is KEPT, the OpenDocument export is the capture)

Session: CAPTURE worker, Opus 5, worktree-isolated, spawned by CONDUCT #10 after
COFF-9 and COFF-10 reached `origin/main` at `87f263a`.
Worktree: `/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-ac12c46e7df4b4d96`
Branch: `worktree-agent-ac12c46e7df4b4d96`
Baseline: THIS worktree measured at `87f263a` BEFORE any edit (the tree was
byte-identical to `origin/main`, verified by `git status --porcelain` empty), and
re-measured per suite at the close by diffing two full battery runs.

EXACT PATHS CLAIMED, BY REGION:

- `bio-plane/src/drive.mjs` — **NEW**. The Drive address recogniser and the export-address
  composer, pure and dependency-free (no fetch, no store, no registry), so the suite and the
  plane read ONE definition of what a Drive address is. Whole file.
- `bio-plane/src/index.mjs` — **TWO REGIONS ONLY**, both inside `op=acquire`:
  (a) the DEC-49 region `is-drive-capture` — the caller-supplied-hop-fact refusal and the
  shape refusals, sited immediately after the `capture-request` arm and before the
  `const locator = body?.locator` line; (b) the export seam — the lines that derive
  `driveHopRecorded` / `documentAddress` / `locator` from the recogniser, the `text/html`
  shell refusal after the fetch returns, and the one `...(driveHopRecorded ? [driveHopRecorded] : [])`
  spread on the existing `provenance_chain` literal. **REC-83's new read op's dispatch entry
  and REC-84's basis-leg grammar are NOT in either region and are not touched.**
- `bio-plane/checks/bio-checks.mjs` — ONE new export appended, `DRIVE_CAPTURE_CHECKS`
  (C-48.1 … C-48.6), placed with the other DEC-49 families. `C-48` minted with
  `node tools/mintid.mjs C` (floor C-45; 46 and 47 already held and stepped over).
  Nothing existing in the file moves.
- `bio-plane/test/drive.test.mjs` — **NEW**. The suite, driven THROUGH `op=acquire`
  against a miniflare fixture serving both the shell and the export.
- `bio-plane/test/drive.control.mjs` — **NEW**. The negative-control harness: six arms,
  each armed ALONE, every restore verified by sha256 AND `cmp`.
- `bio-plane/scripts/coverage.mjs` — the ONE `REGISTER_FLOOR` key set only, moved to the
  figures this item's own green post-commit run PRINTED. **M0-30 holds `tools/plancheck.mjs`
  and is not touched.**
- `docs/development/INTERFACE-CHANGES.md` — IC-85 appended, PROPOSED. Id minted with
  `node tools/mintid.mjs IC` (floor IC-84).
- `docs/development/MEASUREMENTS.md` — one appended section, the Drive-export measurement.
- `docs/development/CLAIMS.md` — this block.

NOT CLAIMED, stated because a reader would reasonably expect them: `store.mjs`
(no transport-record field is needed — the three hop facts ride the provenance
chain and the existing `retrieval_locator` column, both already written by
`recordcapturedlocator`), `subresources.mjs`, `formats.mjs`, `odf.mjs`,
`ooxml.mjs`, `civicos-ui/**`, `newgroup/**`, `tools/plancheck.mjs` (M0-30's),
`docs/development/QUEUE.md` (CONDUCT's sole writer), and
`docs/architecture/BIO_Content_Framework_v0_10.md` (CONTENT's — the three
sentences this landing falsifies are a DELEGATION at the foot of this file, not
an edit).

**AMENDED AT THE BUILD, three additions, each stated rather than quietly taken:**

- `bio-plane/src/schema.mjs` — **ONE `--` COMMENT BLOCK ONLY**, above
  `CREATE TABLE captured_locators`. This claim first said the file would not be
  touched. It has to be: the comment asserts *"For a direct capture they are the
  same string"* about `address` and `retrieval_locator`, and a Drive capture is
  `via: 'direct'` with the two differing. **Leaving a false sentence at the column
  it describes is not a smaller change than correcting it**, and it is the same
  invariant IC-85 files. The old sentence is corrected in place with its dated
  reason, never deleted. No table, no column, no index, no behaviour; every line
  begins `--` (so `#migrate`'s `split(";")` never sees it) and carries no backtick.
- `bio-plane/src/index.mjs` — **ONE MORE LINE**, the `taskenqueue` call's
  `subject:`, inside the same acquire seam. Without it this item would have made
  the record WORSE at the one place a person reads it: a member asked "who issued
  this?" about an undetermined Drive capture would have been shown
  `…/export?format=odt` rather than the document. The expression is
  `driveCapture ? documentAddress : locator`, which IS `locator` for every
  non-Drive capture, so no existing task moves by a byte. The ARCHIVE arm is
  deliberately left as it was.
- `bio-plane/dist/bio-plane.bundled.mjs` + `dist/bio-plane.bundle.json` — FL-10's
  guard fires on any `src/` change and the bundle is rebuilt with `npm run build`.
  Nothing bumped, signed or deployed. `src/signpage.mjs` regenerated BYTE-IDENTICALLY
  and is therefore not in the diff.
- `docs/development/DEBT.md` — one row, `D-351`, minted with `node tools/mintid.mjs D`
  (floor D-346; 347-350 already held and stepped over). This claim did not anticipate a
  debt row because the finding that produced it was not anticipated: the Drive export
  turns out not to be byte-stable.

released: 2026-09-14 CAPTURE (CAP-8) — landed on `worktree-agent-ac12c46e7df4b4d96`, NOT pushed and
NOT merged; CONDUCT integrates. **THIS RELEASE CARRIES NO OWED ACT** (D-342's grammar, and WORKER.md's
rule that an owed act never lives in prose alone). Everything this landing obliges a future actor to
do is an ITEM or a DELEGATION with its actor named, and none of it is implied:
`IC-85` is PROPOSED in `INTERFACE-CHANGES.md` with its consumers named and CONDUCT takes the version
bump and the RESOLUTION; `D-351` is a DEBT row with its disposition token; the three falsified
sentences in `BIO_Content_Framework_v0_10.md` §16 are the DELEGATION at the foot of this file; the
`### CAP-8 · running` row in `QUEUE.md` is CONDUCT's to flip and this worker did not touch that file.
GATES on this branch, every exit status read UNPIPED: battery **190/190 suites · 11,771 assertions ·
exit 0** against this worktree's own pristine baseline **189/189 · 11,607** measured at `87f263a`
BEFORE any edit with `git status --porcelain` empty (+1 suite, +164 assertions, attributed by diffing
two full runs); `node scripts/coverage.mjs --strict` run DIRECTLY from `bio-plane/`, `$?` unpiped,
**exit 0**, checks named 261/261 (100.0%, was 255/261 before the C-48 pins were written);
`node civicos-ui/test/run.mjs` from the REPO ROOT **exit 0**; `node tools/plancheck.mjs --local`
**0 fail 0 warn**; `node tools/corpuscheck.mjs` 44 governed documents **0 fail**; `op=audit` clean on
`biosmoke7` scratch before and after the live probe, and the namespace SWEPT (`scope=ALL`) after every
run. FL-10 fired and `npm run build` rebuilt `dist/bio-plane.bundled.mjs` (2,831,348 B, sha256
`745ccc55…`); `src/signpage.mjs` regenerated byte-identically. Nothing bumped, signed or deployed.
CONTROLS: seven rows — six arms plus a baseline — in `test/drive.control.mjs`, re-runnable in one
step, every restore verified by sha256 AND by `cmp` (7 of 7 MATCH/IDENTICAL/ok, 0 mismatch); baseline
154/0, arms 149/5 · 150/4 · 145/9 · 151/3 · 146/8 · 150/4 · **55/99** (the arm's own arm). TWO
FINDINGS ABOUT THIS ITEM'S OWN WORK, recorded rather than smoothed: the arm's own arm first produced
NO TALLY (reported as -1, never 0) because the suite dereferenced a null recogniser result, and the
suite was corrected rather than the arm reinterpreted; and the D-112 arm showed that a SILENT drop
would be behaviourally invisible here, because the capture succeeds either way with the plane's own
derived hop — which is the argument for the refusal being loud.


## DELEGATION 2026-09-14 CAPTURE (CAP-8) → CONDUCT (answering-for FRAMEWORK / CONTENT, both dormant): **THREE SENTENCES IN `BIO_Content_Framework_v0_10.md` Part II §16 ARE FALSIFIED BY THIS LANDING, AND THE DESIGN DOCUMENT IS NOT MINE TO EDIT**

CAP-8's row names Part II §16's Google Drive paragraphs as its design authority. The
handler landing makes three of their sentences false. They are CONTENT's ground and
this worker holds no claim or delegation on the file, so they are named here as ACTS
WITH THEIR ACTOR rather than edited — and named even though the first one is obviously
implied, because a note is not an item (WORKER.md, 2026-09-14).

**THE ACTS, for CONDUCT at integration:**

1. §16, *"**One act remains, and it is on the capture side**: the Drive host-stack
   handler that recognises the address and acquires the export instead of the shell
   (CAP-8)."* — **NO ACT REMAINS.** The handler is in `bio-plane/src/drive.mjs` and in
   `op=acquire`'s two DEC-49 regions as of this commit. Correct in place with the dated
   reason, the way COFF-9 and COFF-10 corrected the sentences before it, rather than
   deleting: what that sentence recorded was the gap, and the gap closing is the news.

2. §16, *"Supporting them is therefore a CAPTURE-side act — a host-stack handler that
   recognises a Drive address and acquires the export, **recording the Drive file id and
   the export format as the hop's facts**"* — the hop's facts as BUILT and as the QUEUE
   row specifies are **three**: the export ADDRESS, the export FORMAT and the PRODUCER.
   The file id and the kind are carried beside them so the three are re-derivable, but
   they are not the facts. The design sentence is narrower than the row it produced.

3. §16 is **SILENT ON THE ONE THING THAT TURNED OUT TO MATTER MOST**, and this is a
   DESIGN GAP rather than a correction. The section says every export is Google's
   conversion at fetch time — it does not say that **the conversion is not
   reproducible**. CAP-8 measured three consecutive exports of one unchanged document
   producing three distinct `capture_sha` (MEASUREMENTS.md 2026-09-14 §4, DEBT `D-351`),
   which puts C-18.3's corroboration fold and `resolveLinks`' identity bracket
   permanently out of reach for Drive material. A design that makes the export the
   harvest owes a sentence about what that costs the record. **For §Incomplete sections.**

**Why CAP-8 did not do it.** `docs/architecture/BIO_Content_Framework_v0_10.md` is a
governed design document on CONTENT's ground; this worker claimed the capture path and
did not reach outside it. `corpuscheck` reports 44 governed documents, 0 front-matter
failures, on this branch as it stands — the edits above will move §16 and therefore the
document's Status `as of`, which is CONDUCT's act to take together.

**Also for CONDUCT, and NOT a design edit:** `docs/development/QUEUE.md`'s `### CAP-8 ·
running` row is CONDUCT's to flip. This worker did not touch `QUEUE.md`.
## CLAIM 2026-09-14 M0-29 (D-343 — four control drivers' declared arm tallies reconciled to their own runs; the four unverified candidates RUN and confirmed or struck; D-333 mode (c) measured once across the estate)
session: M0-29 worker spawned by CONDUCT #11 (worktree `.claude/worktrees/agent-a0346165c5786ceeb`, branch `worktree-agent-a0346165c5786ceeb`), background lane, holds no slot.
opened: 2026-09-14
paths:
  - `bio-plane/test/caseflip.control.mjs` — **THE HEAD DECLARATION ONLY** (D-343's `5+b` against 7
    measured). No arm's meaning, edit, subject or anchor moves.
  - `bio-plane/test/caselifecycle.control.mjs` — **THE HEAD DECLARATION ONLY** (`5+b` against 8).
  - `bio-plane/test/fleetbundles.control.mjs` — **THE HEAD DECLARATION ONLY** (`6+b` against 13).
    FL-9/FL-10 ground; both claims are RELEASED on the register (FL-10 by the inline
    `### RELEASED` heading `3607b3b`).
  - `agent-worker/test/harness.control.mjs` — **THE HEAD DECLARATION ONLY** (10 against 19).
    FL-6 ground; FL-6's block has no top-level `released:` line but IS released
    (`### RELEASED 2026-09-12 … landed as 56ed70b`), which the 2026-09-14 corpus-retrofit claim
    already recorded as a record-hygiene finding. Checked before claiming, per this item's brief.
  - `bio-plane/test/owed-controls.control.mjs`, `bio-plane/test/provenance-floor.control.mjs`,
    `civicos-ui/test/provenance-floor.control.mjs`, `civicos-ui/test/refusal-partition.control.mjs`,
    `civicos-ui/test/version-predecessor.control.mjs` — D-343's four unverified candidates
    (`provenance-floor` is ambiguous between two files, so BOTH are read and run).
    **HEAD DECLARATION ONLY, and only where the candidate is CONFIRMED**; a struck candidate is
    left untouched and the reason recorded.
  - `docs/development/DEBT.md` — **D-343's disposition only**, plus ONE new row if D-333 mode (c)
    has instances (id via `node tools/mintid.mjs D`).
  - `docs/development/MEASUREMENTS.md` — APPEND ONLY, this item's figures and arm results.
  - `docs/development/CLAIMS.md` — this block.
  - `bio-plane/test/m025-arm-anchor-witness.test.mjs`, `bio-plane/scripts/armdecay.mjs` — **ONLY
    if the census itself needs a correction**, and then said so explicitly in the release line.
  **READ, NEVER EDITED**: `bio-plane/test/m025-arm-census.mjs` (unless a census correction is
  owed, above), `docs/development/VERIFICATION.md`, `docs/development/QUEUE.md`, `CLAUDE.md`.
  **NOT** `bio-plane/src/**`, **NOT** `bio-plane/dist/**`, **NOT** `agent-worker/src/**`,
  **NOT** `civicos-ui/app.html` or any UI source, **NOT** `docs/development/QUEUE.md`
  (CONDUCT's sole ground), **NOT** `DECISIONS.md`, **NOT** `CLAUDE.md`, **NOT** `newgroup/**`,
  **NOT** any version bump, tag or deploy. NO DEPLOY, NO LIVE CALL, NO PUSH, NO MERGE.
concurrency: checked over the register on `origin/main` at `e9ba393` 2026-09-14 — the only blocks
  without a top-level `released:` line are FL-6 and D-297, and both are in fact RELEASED (FL-6 by
  an inline `### RELEASED` heading, D-297 by a `released:` line at the file end). No released
  claim holds any path above. Six other workers are live on this machine in their own worktrees;
  their claims are not on `origin/main` yet and are therefore invisible to this check, which is
  stated rather than assumed away — every path above is a control DRIVER's head comment or a
  ledger row, and the three `bio-plane/test/*.control.mjs` drivers are named by D-343 as the
  item's own ground.

### AMENDMENT 2026-09-14, MID-ITEM (M0-29) — FOUR PATHS, each owed and none foreseeable from the brief
paths added:
  - **The BASELINE ARM'S LABEL STRING** in `caseflip.control.mjs`, `caselifecycle.control.mjs` and
    `fleetbundles.control.mjs` (`"nothing armed — what distinguishes five-arms-working from
    five-arms-broken"`). The original claim said HEAD DECLARATION ONLY. **Each of these labels is
    the SAME CLAIM as the head's tally, in the same stale number**, and it is PRINTED ON EVERY RUN
    — so correcting the head and leaving the label is the half-fix that leaves the next reader
    believing the wrong half. No arm's meaning, edit, subject or anchor moves; only the printed
    text of the baseline row.
  - **`bio-plane/test/owed-controls.control.mjs`** — D-343's first unverified candidate, CONFIRMED
    by running it (9 announcing arms against a `six` written in two places). The correction is to
    a METHOD sentence, which the census's reader deliberately does not read, so this driver was
    never scored and is not gated — it is corrected anyway, because the sentence is about THIS
    driver's own arms and its number was stale in exactly D-333's shape.
  - **`bio-plane/test/m025-anchor-witness.control.mjs`** — ONE PROSE STRING in arm A2's `what:`,
    which names `agent-worker/src/fanout.mjs`. **That file has never existed in this repository.**
    The arm's real subject is `FANOUT_SRC` = `agent-worker/src/subsession.mjs`, which exists and
    is live; only the description was false. Found by this item's mode-(c) sweep, and corrected
    rather than adjudicated away because a wrong path in an arm's own description is the record
    claiming more than it can support. **NOT** the arm's edits, expectation, id or subject, and
    **NOT** any other arm. No live claim holds this file (the D-329+D-331+D-333 claim that last
    touched it is released).
  - **`tools/modec-sweep.mjs` (NEW)** — D-333 decay mode (c)'s measurement, which the row asks for
    as a one-off and which is committed rather than thrown away: a sweep that is not in the tree is
    not a mechanism, and the next actor would rebuild it. Read-only, run by hand, wired into NO
    gate and NO battery (so no floor moves), carrying its own `--self-test` both-directions arm and
    a DATED ADJUDICATION TABLE so the judgement D-333 says mode (c) requires is recorded rather
    than re-derived. **It adds a file under `tools/`, which `m025-arm-anchor-witness.test.mjs`
    reads as candidate-corpus** — that consequence is MEASURED by the full battery in this item
    rather than assumed away, and reported either way.
released: 2026-09-14 by the M0-29 worker — **D-343 CLOSED: the census reads 0 tally findings on the
named drivers, DRIVEN, and it read 3 before.** `m025-arm-census.mjs` over the SAME ten drivers,
before and after: BEFORE exit **1**, `tally NOT AS DECLARED : 3`; AFTER exit **0**,
`tally NOT AS DECLARED : 0`, `declared tallies read 4 of 10`, 108 arms announced, 0 unreadable,
0 drivers with a stale arm. **EVERY CONTROL ARM, DECLARED AGAINST ACTUAL** — the four named
drivers, each run WHOLE before and after, announcement count against declaration:
`caseflip.control.mjs` declared 5+b / announced **7** -> corrected 6+b, own run ALL-ARMED exit 0;
`caselifecycle.control.mjs` 5+b / **8** -> 7+b, ALL-ARMED exit 0;
`fleetbundles.control.mjs` 6+b / **13** -> 12+b, ALL-ARMED exit 0;
`agent-worker/test/harness.control.mjs` ten (in a DATED results block) / **19** -> 19 declared at
the head, ALL-ARMED exit 0. Plus `owed-controls.control.mjs` 9 announced (candidate CONFIRMED,
`six` corrected in two sites) ALL-ARMED exit 0, and `m025-anchor-witness.control.mjs` 13 announced
ALL-ARMED exit 0 after its arm-A2 path correction. **IN EVERY CASE THE ARMS WERE REAL AND THE
DECLARATION WAS CORRECTED — nothing restored, nothing removed**, each old number kept at its site
as right when it was written, dated (`casepin.control.mjs`'s precedent).
**WHICH COMMIT MOVED EACH, and the answer is not the expected one: THREE OF THE FOUR WERE FALSE IN
THEIR OWN LANDING COMMIT.** `caseflip` (`c6b9b51`) and `caselifecycle` (`7e10ca9`) have exactly ONE
commit each — the extra arms were written after the head sentence, within the item.
`fleetbundles` decayed twice: already false at `d83695b` (FL-9 landed EIGHT under a head saying
six), widened by `3607b3b` (FL-10 APPENDED 6, 6b, 7, 8). Only `harness.control.mjs` decayed by
appending, and its ten is KEPT rather than corrected because it is a true statement about a past
run (2026-08-08); a NEW head declaration states the current nineteen in three named families,
which also takes the shipped reader's reach up by one driver.
**THE FOUR UNVERIFIED CANDIDATES, EACH RUN: ONE CONFIRMED, THREE STRUCK.** CONFIRMED —
`owed-controls` 9 announced against a `six` written in two places about its OWN arms (a METHOD
sentence the census correctly never scored; corrected anyway). STRUCK — `bio-plane`'s
`provenance-floor` 14 announced against a declaration block enumerating (0)-(8) that is TRUE,
because three of those arms declare their own sub-stages; **a driver that declares a multi-stage
arm honestly breaks the one-announcement-per-declared-arm assumption**, which is the reusable
finding here. STRUCK — `civicos-ui/refusal-partition`, which declares no tally at all and whose
`six arms` recounts ANOTHER harness's incident. STRUCK — `civicos-ui/version-predecessor`, whose
real declaration (*"Eight arms … FINAL: 8 arms, 8 as declared"*) AGREES with its 8 announcements.
**D-333 MODE (c) MEASURED ONCE ACROSS THE ESTATE, FILED AS ITS OWN ROW D-353** (`mintid.mjs D`):
89 drivers, 408 path literals, 683 tracked paths at HEAD -> **6 candidates, 0 UNADJUDICATED**,
each hand-checked and recorded in a dated adjudication table inside `tools/modec-sweep.mjs` (NEW,
read-only, wired into no gate, carrying a both-directions `--self-test`). **Three real mode-(c)
instances exist and all three are already RETIRED with the loss stated** (`dec65` arm (5),
`d280-strengthbar` (A)/(C)/(E), `case6`'s `FINDING_IN_ANOTHER_CASE`) — so the answer is zero OPEN
instances, and D-353 is the GAP that nothing re-takes the measurement.
**NEGATIVE CONTROL — two arms plus a baseline, FIRST RUN, 7 checks, 0 not as declared.** BASELINE
both subjects unpatched: census exit 0, 0 findings. **N1** one reconciled declaration decayed by
exactly one (`caseflip` six -> five), armed ALONE: census **exit 1**, 1 finding, NAMING the driver,
printing BOTH numbers (`decl=5+b` vs `arms=7`), and the driver itself still ALL-ARMED exit 0.
**N2 over-strictness** `accepts-without-reading.control.mjs` (3/3, never touched) reads 0 findings
BEFORE and STILL 0 beside the armed neighbour. Restore by `cp`-back verified by sha256 AND full
byte compare AND `cmp(1)`: 15,460 bytes (floor 4,000), `48a073365af7…`, MATCH / IDENTICAL / exit 0.
**GATE FIGURES.** Battery **188/189 · 11,629 assertions · 270.5 s**; `coverage.mjs --strict`
DIRECTLY from `bio-plane/`, `$?` UNPIPED, **exit 0**, REGISTER FLOOR **974/974 · 180/180 · 181/181**
exact — no slack, no floor owed; `node civicos-ui/test/run.mjs` from the REPO ROOT, unpiped
**exit 0**; `node tools/plancheck.mjs --local` **0 fail, 0 warn**; `m025-arm-anchor-witness.test.mjs`
unmoved at **24 pass** (the new `tools/` file did not move its candidate corpus — measured, not
assumed).
**THE ONE RED IS `origin/main`'s, NOT THIS ITEM'S, AND IT IS ATTRIBUTED BY RE-RUNNING THE BASELINE
RATHER THAN BY ARGUMENT.** `mergecarry.test.mjs` 57 pass / 1 fail: `no UNREGISTERED drop sits in
main's history` got `["cc8187d:bio-plane/scripts/coverage.mjs"]`. `cc8187d` (the REC-83 merge) is
NOT an ancestor of this HEAD and IS an ancestor of `origin/main`, which moved `e9ba393` ->
`718e5e4` while this item ran; the suite reads the REF out of the SHARED `.git`. A pristine
detached worktree at `e9ba393` with NONE of this item's changes gives the identical 57/1.
**FOR CONDUCT, as ACTS with their actor** — (1) **CONDUCT** registers `cc8187d`'s drop of
`bio-plane/scripts/coverage.mjs` in `tools/mergecarry.mjs`'s `KNOWN_HISTORICAL_DROPS` (or restores
the file) and moves the pinned count 4 -> 5 with its why: `main` is RED on this gate right now.
(2) **CONDUCT** flips M0-29's QUEUE row to `done` — `QUEUE.md` is CONDUCT's sole ground and was not
touched here. (3) **CONDUCT or VERIFY** rules D-353: whether `tools/modec-sweep.mjs` joins the
periodic census as a third shape, or mode (c) stays a judgement taken at attribution time — which
is a defensible answer that must then be WRITTEN DOWN. (4) **Whoever owns REC-79** —
`civicos-ui/test/refusal-partition.control.mjs` leaves `.rec79-control-pristine/` behind when its
run exits non-zero (measured twice here, 4 MB of copies of `app.html`, `index.mjs` and
`bio-checks.mjs`), and its arms 2/2b have been NOT AS DECLARED (declared 1, actual 0) on a green
`main` since before this item; `bio-plane/test/provenance-floor.control.mjs` is likewise exit 1 at
55 of 58 as declared (arms 2a, 3, 6-stage-1). Both were red on pristine `e9ba393` — mode (b), not
tally, and outside D-343.
amendment to the release above, 2026-09-14 (M0-29): **`docs/DECIDED.md` REGENERATED, not authored**,
by `node tools/decided.mjs` — 823 rulings, 230.6 KB. Owed by CLAUDE.md's standing rule and by
`plancheck`, which read STALE the moment D-343's disposition and the D-353 row landed. `plancheck
--local` 1 fail -> **0 fail, 0 warn** after it; `corpuscheck` 44 governed documents, 0 fail.
## CLAIM 2026-09-14 UI (UI-59 — the surface ledger brought current from the landed UI items, and `kickoffs/UI.md` restored to the shape `kickoffs/README.md` rules; prose only)
session: UI worker (worktree `.claude/worktrees/agent-a4ad9b33f45a32657`, branch `worktree-agent-a4ad9b33f45a32657`)
opened: 2026-09-14
authority: `QUEUE.md` `### UI-59 · running` (CONDUCT #11, 2026-09-14, enacting UI-58's first finding — the surface ledger 45 days behind), under `docs/development/kickoffs/README.md` ("Shared files, and the rule for them": `CIVICOS_UI_STATE.md` is **prepend a new entry, never edit an existing one**; a kickoff is **rewritten each session, not appended**) and `docs/development/UI-PLAN.md` §"The ladder", whose Place in the system names this ledger as what the plan is *"logged against by"*.
paths:
  - `docs/development/CIVICOS_UI_STATE.md` — **PREPEND ONLY**, between the title heading and
    the existing 2026-08-04 CONDUCT amendment blockquote: one backfill banner plus 56 new
    dated entries, `v34` through `v89`, newest first. **NOT** the amendment blockquote — it
    reads *"the v33 entry below"* and that stays literally true with the backfill above it;
    moving it would be an edit, and this file is prepend-never-edit. **NOT** `v33` or any
    entry beneath it; not one byte of the file's existing 1,553 lines changes.
  - `docs/development/kickoffs/UI.md` — **REWRITTEN**, which is this file's own shape rule
    (`kickoffs/README.md`, "One kickoff per THREAD": a session *"at the close rewrites only
    that thread's file"*). The seven appended per-item log blocks — UI-50's decisions block
    and the UI-42, UI-45, UI-44, UI-53, UI-54, UI-55 blocks, 380 of its 531 lines — are
    MOVED into the ledger entries they belong in, not deleted.
  - `docs/development/CLAIMS.md` — this block.
  - `tools/.ui59/**` (NEW, this session's harness, dot-prefixed so no walk that
    enumerates `tools/*.mjs` picks it up): `completeness.mjs`, the item's own
    completeness check, and `control.mjs`, its five-arm negative control; plus three
    read-only inventory instruments. **This is the one place this prose-only item puts
    a non-prose byte in the tree, and it is the reason `gates.mjs` classifies the
    change FULL rather than the DOCS the row predicted** — stated rather than worked
    around, because the classifier is right: the diff does carry a non-docs path.
  - `docs/DECIDED.md` — **ADDED TO THIS CLAIM MID-ITEM, and the honest note is that the
    edit preceded the claim line by minutes.** Not foreseen: this item RULES on nothing,
    so it looked exempt from the regenerate-the-index rule. It is not. Moving seven
    rulings out of `kickoffs/UI.md` and into `CIVICOS_UI_STATE.md` MOVES THEIR HOME, and
    the index records the file and line that owns each ruling — so relocating a ruling
    drifts the index exactly as minting one does. `plancheck --local` caught it (1 fail,
    STALE); the baseline was MEASURED at HEAD's content in this same worktree before
    concluding it was mine (0 fail, so it was); `node tools/decided.mjs` regenerated it
    to 823 rulings / 230.5 KB, +10 rows / −8, seven of the additions sourced from the
    two files this item moved prose between. Generated artifact, no area's ground.
NOT MINE, reported for CONDUCT instead: `civicos-ui/**`, which does not move on this item;
`docs/development/QUEUE.md` (the UI-59 row's status and `landed:` line); `docs/development/UI-PLAN.md`
— READ, not edited: its Place in the system already names this ledger by its correct path, so the
restoration needed no pointer correction there and none was made; `docs/development/MILESTONES.md`,
`DEBT.md`, `DECISIONS.md`, `MEASUREMENTS.md`.
released: 2026-09-14 by the UI-59 worker — **the ledger is current and the kickoff is a kickoff again.** `CIVICOS_UI_STATE.md` gains **56 entries, `v34`–`v89`, newest first, prepended between the title and the 2026-08-04 amendment** (which was NOT moved: it reads *"the v33 entry below"* and that stays true). 52 record a member-surface landing; **4 record a landing that changed no surface and say so in their own first line** (`v85` UI-53, `v78` UI-52, `v67` UI-36, `v63` UI-31). Each is dated to its LANDING COMMIT, not to today. **126 shas are cited and all 126 resolve to real commits** (`shacheck.mjs`, 0 unresolvable, refuses an empty set). **PREPEND-NEVER-EDIT PROVED RATHER THAN TRUSTED:** the splice refuses to write unless the original bytes survive as a contiguous tail, and the 92,485 B tail was then verified INDEPENDENTLY by sha256 AND `cmp`. `kickoffs/UI.md` 531 → 265 lines: all seven appended per-item log blocks (UI-50's decision item, UI-42, UI-45, UI-44, UI-53, UI-54, UI-55 — 380 lines) MOVED into the ledger entries they belong in, not deleted; one stale body sentence corrected (*"U1–U8 are DONE"*, against UI-58's eleven-of-fourteen).
**FIGURES.** `gates.mjs` **class FULL — 187 suites ok, 1 FAIL**, and the one is **NOT THIS ITEM'S** (below). `node civicos-ui/test/run.mjs` from the REPO ROOT, exit read UNPIPED, **0, all harnesses green**. `plancheck --local` **0 fail 0 warn**, exit 0 unpiped. `corpuscheck` **44 governed documents / 0 fail**, exit 0 unpiped — **neither file this item writes is governed**, so no Status `as of` moved and no Contents was regenerated. Completeness check: **corpus 57 UI ids from QUEUE.md's own headings — 49 require an entry, 4 EXEMPT as harness-only measurements, 4 EXEMPT as never-landed; 56 entries present.**
**CONTROLS 5/5 AS DECLARED, FIRST RUN, and again on a second independent run after the driver was corrected.** Baseline unarmed → exit 0 PASS, 0 missing. **ARM 1** (UI-56's entry removed, a SURFACE item) → exit 1, MISSING == exactly `[UI-56]` — declared and actual agree. **ARM 2, OVER-STRICTNESS** (UI-53's entry removed, HARNESS-ONLY) → **exit 0, PASS, nothing demanded** — a measurement item owes no surface entry and the check does not ask for one. **ARM 3** (the `### UI-<n>` heading grammar broken) → exit 2, refusing to sweep an empty corpus rather than reporting clean over nothing. FINAL unarmed → exit 0 PASS. Every restore by `cp`-back from a UNIQUELY NAMED per-arm pristine, verified by **sha256 AND `cmp`** with a floored byte count, never `git checkout --`.
**WHAT THE CHECK COULD NOT SEE, AND THE INVERSION THAT FOUND IT.** The row names QUEUE.md's UI section + CLOSED register as *"the list"*. **It is not complete: 3 landed UI items — UI-42, UI-44, UI-45 — have NO `### UI-<n>` heading anywhere in QUEUE.md**, because they were rowed in `IS-BUILD-PLAN.md` and that ledger was archived. A register-keyed check scores them zero IN SILENCE. They are in the ledger anyway, found from git, and the check now PRINTS them as a REGISTER BLIND SPOT. Separately and larger: **the ledger is keyed on UI ITEM IDS, and 143 commits touched `civicos-ui/` since v33 while only 79 name a UI item — the other 64 are REC/PL/CASE/CPDF/SK/M0/VF/D items and DIST deploys moving the member surface.** So *"every UI item has an entry"* is a weaker claim than *"every surface change has an entry"*, and only the first is true; both figures are stated in the ledger's own banner rather than left to be discovered.
**THREE THINGS THE BRIEF DID NOT PREDICT, all recorded rather than smoothed.** (1) **`gates.mjs` classifies this change FULL, not the DOCS the row predicted** — correctly: this item's own harness under `tools/.ui59/` is a non-docs path. The classifier is right and the row's prediction assumed a tree with no harness in it. (2) **`docs/DECIDED.md` WENT STALE AND THIS ITEM RULES ON NOTHING** — moving seven rulings from the kickoff into the ledger MOVES THEIR HOME, and the index records the file that owns each ruling, so a RELOCATION drifts it exactly as a new ruling does. Baseline MEASURED at HEAD's content in this worktree before concluding it was mine (0 fail, so it was); regenerated to 823 rulings / 230.5 KB. **It drifted a SECOND time from this very claim block**, which is why the regeneration is the last act before the commit. (3) **MY OWN CONTROL DRIVER TURNED THE BATTERY RED, and the finding is the driver rather than the subject:** its leftover `pristine-arm3-queue.md` is a whole untracked copy of QUEUE.md, and `check-firing.test.mjs` walks the untracked estate for producers of the retired paths behind C-7.1/C-8.1 — the copy quotes both, so it read as two new producers (98 pass, 2 fail). The driver now removes only the copies it wrote, BY NAME (never a directory sweep — that is how M0-30's driver took a sibling worktree with it at exit 0). **And the first version of that fix's own comment spelled the two paths out, so the check then flagged `control.mjs` itself — the same 2 fails, a different producer: the documented class where a correction is caught because it quotes the token it corrects.** Reworded to cite the check numbers; `check-firing` re-run ALONE afterwards reads **100 pass / 0 fail, exit 0**.
**THE ONE RED IS NOT MINE, AND IT IS A REAL FINDING ON `main` — see the DELEGATION below.** `mergecarry.test.mjs` fails its historical register with an UNREGISTERED drop, `cc8187d:bio-plane/scripts/coverage.mjs`. `cc8187d` is REC-83's merge, landed 2026-09-14, and it **is not an ancestor of this worktree's HEAD at all**; this branch carries 0 commits and 0 merges. **`refs/remotes/origin/main` is REPOSITORY-WIDE across worktrees, so another worker's fetch moved it 15 commits ahead of my base (`e9ba393` → `718e5e4`) mid-item** — which is how a suite reading `origin/main` went red under a worktree that never changed.
**WHAT IS OWED TO A FUTURE ACTOR** is in the report and in the DELEGATION below as ACTS with their actor, never only here: CONDUCT re-regenerates `docs/DECIDED.md` at integration (this branch's copy is generated against `e9ba393`, 15 commits behind the current `origin/main`), flips the `UI-59` row and writes its `landed:` line.

## DELEGATION 2026-09-14 UI (UI-59) → CONDUCT: **AN UNREGISTERED MERGE DROP SITS IN `origin/main` ON `bio-plane/scripts/coverage.mjs`, AND IT IS THE FLOOR FILE**

**THE ACT, with its actor: CONDUCT audits `cc8187d` against `bio-plane/scripts/coverage.mjs`, and either restores what the merge dropped or registers the drop with its reason in `mergecarry.test.mjs`'s historical register.** Filed as a DELEGATION rather than left in a report because a note in a region nothing drains is not even a note (the FL-10 rule, 2026-09-14).

**What was measured, and by what.** `bio-plane/test/mergecarry.test.mjs`'s historical register, run from this worktree: corpus **287 merges in `origin/main` · 5 dropped · 1 goneOnMain · 0 moved · 0 sameEnd**, and the arm *"no UNREGISTERED drop sits in main's history"* returns `["cc8187d:bio-plane/scripts/coverage.mjs"]` against a want of `[]`. `cc8187d` is **`Merge branch 'worktree-agent-ab4376cc9dd8e78b9' (REC-83)`, 2026-09-14**.

**Why it is not this item's, stated as a measurement rather than a claim.** `cc8187d` **is not an ancestor of this worktree's HEAD**; this branch carries **0 commits and 0 merges** (`git rev-list origin/main..HEAD` = 0 at spawn). The suite reads the `origin/main` REF, and **`refs/remotes/origin/main` is repository-wide across all worktrees** — another worker's fetch advanced it from this item's base `e9ba393` to `718e5e4`, **15 commits**, while this item was running. That is the whole mechanism by which a suite went red under a tree that never changed, and it is worth carrying: **a worker measuring anything that reads `origin/main` is measuring a moving target it does not control.**

**Why it matters more than an ordinary drop, which is the reason this is a DELEGATION and not a note.** The dropped path is `bio-plane/scripts/coverage.mjs` — **the file that carries `REGISTER_FLOOR`**, which `kickoffs/WORKER.md` records as having lost a keep-both merge **six times**, once to the LOWEST of two duplicate `arms:` keys silently winning. A merge that dropped a branch's edit to that file is exactly the shape where **a floor silently falls and a control flips from RED to GREEN with nothing reporting it.** The register's own comment already records this arm doing this job once before, on `95e401b`, and says the pin exists so the list cannot become an exemption list — so the correct close is a decision on the evidence, not an entry.

**Not fixed here, and the boundary is the reason.** `bio-plane/**` is not this claim's ground, this item is prose-only, and REC-83's merge is CONDUCT's integration to judge. **This item did not rebase onto the moved `origin/main`**: every figure in the release above is keyed to `e9ba393`, the base CONDUCT spawned against, and re-basing mid-verification would have invalidated all of them while fixing nothing that is mine.

## CLAIM 2026-09-14 UI (UI-61 — IC-84's CONSUMER half: the leg display shows the row's `ref`, `stale` renders as UNDETERMINED-stated, the viewer jumps to the cited page, and the extent vocabulary joins the drift guard)

Session: UI worker for UI-61, spawned by CONDUCT #11, Opus 5.
Worktree: `.claude/worktrees/agent-a0b18e5a56bf0c7de` · branch `worktree-agent-a0b18e5a56bf0c7de`.
Contract: IC-84 (ACCEPTED 2026-09-14, I3 14.0.0 -> 14.1.0, CHANGING; twice AMENDED by CONDUCT #11
at REC-83's and REC-84's landings), its consumer half; the act shape governed by
`BIO_Interaction_Constructs_v0_1.md` (nothing prefilled, DEC-69); framework Part II §14.4.

Paths claimed BY REGION, never whole files:

- **`civicos-ui/app.html`** — (a) the vocabulary block beside `BASIS_ROLES` /
  `GRADE_SOURCES`, which gains `CONTENT_EXTENT_KINDS` and its member-facing
  words; (b) `basisLegRow` and a new `legReferentHtml` helper — the `ref`
  verbatim, the `stale` pane, the page jump; (c) `openArtifact`'s optional page
  argument and the `#page=` fragment; (d) the cite flow's extent region
  (`citePaint`), in `intentChooser`'s ABSENT-AND-SAYS-SO shape. NOT the
  strength panels, NOT `axisPanel`, NOT `mdFor`, NOT the publication surfaces.
- **`civicos-ui/check-semantics.mjs`** — ONE new arm: the extent vocabulary
  compared against `CONTENT_EXTENT_KINDS` in the catalogue, in BOTH directions,
  plus the member-facing-word totality check (the `GRADE_SOURCE_WORD` precedent).
- **`civicos-ui/test/content-extent.test.mjs`** (NEW) — the suite, driving the
  REAL plane through miniflare (`intent-write.test.mjs`'s instrument).
- **`civicos-ui/test/content-extent.control.mjs`** (NEW) — the negative-control driver.

**NOT** `bio-plane/**` — not one byte. Where the plane must move, this item files a
DELEGATION to RECORD and does not edit. **NOT** `newgroup/**`, **NOT** `docs/development/QUEUE.md`.

Harness floors: any figure this item moves in `civicos-ui/check-refusal-codes.mjs`'s
print is moved FROM THE PRINT and named in the release line.

released: 2026-09-14 by the UI-61 worker — IC-84's CONSUMER HALF IS BUILT AND DRIVEN AGAINST THE REAL PLANE; THE COMPOSER'S EMIT HALF IS A DELEGATION TO RECORD, MEASURED AND NOT INFERRED.

**GATES, every one run in this worktree and read unpiped.** `node civicos-ui/test/run.mjs` from
the repo root: **48 suites, 0 FAIL, exit 0** (own baseline on the pristine tree at ce6e7cf: 47
suites, 0 FAIL, exit 0 — the +1 is this item's own suite). `cd bio-plane && npm run test:battery`:
**191/191 suites green · 11,771 assertions · 228.3s, exit 0** — IDENTICAL to the figure the brief
quotes for ce6e7cf, which is expected and is the point: **not one byte under `bio-plane/` was
edited.** `node scripts/coverage.mjs --strict` run DIRECTLY with nothing piped after it: **exit 0**.
`node tools/plancheck.mjs --local`: **0 fail, 0 warn** (`docs/DECIDED.md` regenerated — this
claim's own Contract line added one ruling row, 860 → 861).

**WHAT LANDED.** `civicos-ui/app.html`: `CONTENT_EXTENT_KINDS` + `EXTENT_KIND_WORD` beside the
basis vocabulary; `legReferent` (the leg → content-row join, **BY `ord` and never by target** —
D4: one document cited for two legs); `legReferentHtml` (the row's `ref` VERBATIM, DEC-49);
`legJumpHtml`; the stale pane in C-14's own shape carrying the plane's `says` whole;
`openBundleAtPage` + `openArtifact`'s optional 1-based `atPage` reaching the blob URL as
`#page=N`; one `op=earnedbasis` read on the question page, asked SEPARATELY so its failure is
its own. `civicos-ui/check-semantics.mjs`: one arm, the extent vocabulary against the catalog
**in both directions** plus word-totality. `civicos-ui/test/content-extent.test.mjs` (NEW, **48
assertions**) drives the REAL plane through miniflare and mocks NOTHING — the `ref`, `stale` and
`says` strings under assertion are minted by `describeExtent` and `#contentStanding` and reached
through the surface's own bridged `fetch`.

**ARMS DRIVEN, and which were not.** DROVE `document` and `pdf-page` — the two arms
`CONTENT_EXTENT_KINDS[k].landed` marks as landed, including a `pdf-page` leg carrying a real
`extent_rect` (the rect round-trips and the record mints its row, so the DATA path for a region
is proven even though no surface can draw one). Did NOT drive `sheet-cell`, `slide-shape`,
`doc-para` — REC-85's, refused by this plane today; section 6 asserts them over the VOCABULARY
and over `legReferentHtml`'s behaviour on a kind it has no noun for, and **names them as undriven
rather than pretending**. An arm the surface has no noun for still renders the plane's `ref`, so
REC-85's landing needs **no edit here**.

**NEGATIVE CONTROL: eight arms, ALL DECLARED BEFORE ARMING AND ALL RUN**, driver
`civicos-ui/test/content-extent.control.mjs` (in this worktree, re-runnable in one step). Every
arm armed ALONE and restored from a uniquely-named per-arm copy, **verified by sha256 AND by
`cmp`, byte count printed, minimum guarded — never `git checkout --`**; every restore read
`sha256 EQUAL · cmp identical` (app.html 1,220,514 bytes; check-semantics.mjs 23,415 bytes).
Declared vs actual, and every one matched:
`baseline` declared GREEN → **48 pass / 0 FAIL, exit 0** (the arm that proves the other seven are real).
`stalehidden` (the item's own named control — the `stale` flag hidden by a ONE-LINE change) declared FAIL naming the pane, the sentence, the retry line and the mark, on the leg AND the page → **43 pass / 5 FAIL**, naming exactly those five; the row still renders and its `ref` is still right, and the only thing wrong with it is what it no longer says.
`prefilled` (DEC-69 — a page control prefilled with a 1) declared FAIL on the prefill assertion → **47 pass / 1 FAIL**, that one.
`reworded` (DEC-49 — the surface describing the citation in its OWN words) declared FAIL on both verbatim assertions and the page-level one → **44 pass / 4 FAIL**.
`offbyone` (the record's 0-based page rendered unconverted) declared FAIL on the 1-based assertion → **47 pass / 1 FAIL**.
`vocabdrift` (an arm dropped from the surface's grammar copy) declared FAIL in BOTH instruments → **47 pass / 1 FAIL** *and* check-semantics exit 1 naming `CONTENT_EXTENT_KINDS has drifted from the catalog`.
`unconditional` (**THE OVER-STRICTNESS DIRECTION** — the referent line drawn for every leg) declared FAIL on the digest pin while every content-grain assertion stays GREEN → **46 pass / 2 FAIL**, exactly the two halves of the pin, **and that held-open half is the whole value of a separate instrument**.
`citemoved` (a no-op edit to the guard's import — the CONTROL ON THE CONTROLS) declared GREEN → **48 pass / 0 FAIL**, proving the restore machinery and the check-semantics arm both actually run.

**THE OVER-STRICTNESS PIN.** A leg that names no part renders **BYTE-IDENTICALLY** to the
pristine tree: sha256 `6d636a7040da089dafac8b585b9f5b108f94008fccb67a6e0676a79742dcbe9f` over three
legs (graded-with-a-note, ungraded, hunch), MEASURED ON `origin/main` AT ce6e7cf BEFORE ONE BYTE
OF THIS ITEM WAS WRITTEN. It caught a real defect while this item was being built: the first draft
put `${legReferentHtml(referent)}` on its own template line, which injected `\n    ` into EVERY
leg in the record even when empty — green on every other assertion, and only the pin saw it.

**HARNESS FLOORS: NONE MOVED.** `civicos-ui/check-refusal-codes.mjs` prints the same floors as
the pristine baseline, compared line by line (474 census · 20/191 families · 244 reach · 270
partition · 86 corpus / 180 refusals · 75 sites). Two REPORT figures moved and neither is a floor:
the fixture-shape census reads **108 → 112 answers across 44 → 45 ops, 37 → 38 resolved** (this
item's suite drives `op=earnedbasis` through the surface, which is a new op in that census), while
its own floors — `12 judged / 1 classified` — are UNCHANGED. The runner's provenance report names
the two new files as UNTRACKED until this commit, which is that report working.

**FOR CONDUCT — IC-84's SETTLED IS NOT YET WRITABLE ON THIS ITEM'S CONFIRMATION.** The IC's
condition is *"UI-61 confirms the composer emits `extent`"*. **It does not, and it cannot**: see
the DELEGATION below — `op=cite` destructures seven parameters, none of them an extent, and
silently drops anything else. Saying it in so many words, as asked: **THE COMPOSER DOES NOT EMIT
`extent`, AND THE OBSTACLE IS THE PLANE'S ACT AND NOT THE SURFACE.** What UI-61 DOES confirm is
the other half of the consumer contract, driven end to end: the leg display renders the row's
`ref` verbatim, a `stale` row renders as UNDETERMINED-stated and is never hidden, the viewer
jumps to the cited page, and the `document` default is STATED in the composer rather than silent.
SETTLED is CONDUCT's to write when the cite widening lands.

### DELEGATION 2026-09-14 UI (UI-61) -> RECORD: **`op=cite` IS THE ONLY ACT THAT WRITES A BASIS LEG AND IT CARRIES NO EXTENT, SO THE COMPOSER CANNOT EMIT ONE — MEASURED, NOT INFERRED**

IC-84's RESOLUTION records UI as answering *"the composer emits `extent` per leg"*. **It cannot,
and the reason is one function's parameter list rather than a UI gap.**

**The measurement**, taken in source on `origin/main` at ce6e7cf and re-taken by
`civicos-ui/test/content-extent.test.mjs` section 5 on every run:

- `Store#cite` (`bio-plane/src/store.mjs`) destructures exactly
  `{ project, handle, viewer, owner, note, author, role }`. There is no extent parameter.
- Its op routing reads exactly those seven `url.searchParams`. An `extent_kind` sent beside
  them is **DROPPED IN SILENCE** — no refusal, no `FIXED_KEY_ONLY`, nothing.
- `cite()` composes the leg itself — `{ target, role, grade, grade_axis, grade_source, note, why }` —
  and splices it with `#spliceBasis`. The extent fields never reach the frontmatter the
  C-2.8 grammar REC-84 landed would judge.
- No UI surface authors a `basis:` block directly: `mdFor` writes no basis, and `op=cite`
  is the only producer. So there is no second route for the surface to take.

**Why UI-61 did not build the picker anyway.** A control whose value is silently discarded is
worse than an absent one: the member chooses page 2, the leg lands on the whole document, and
nothing anywhere says the choice went nowhere. That is present-and-refused with the refusal
removed — the shape UI-15 took out of the action form and UI-19 declined to reintroduce one
field down. So the composer states the `document` default **explicitly** (Bob's 5.3: an absent
extent IS `document`, and this item's clause says STATED, never silently) and says why no page
is offered. The suite asserts the absence AND re-measures `cite`'s routing, so the day the
plane moves this assertion FAILS and the region is revisited rather than going quietly stale.

**What RECORD is asked for**, and it is small: `op=cite` accepts the flattened extent
scalars already in REC-84's grammar — `extent_kind`, `extent_page`, `extent_rect`,
`extent_ref`, or `content_id` — passes them onto the leg it splices, and refuses a leg
naming both (the catalogue's `checkLegExtentGrammar` already does that at the gate, so the
act need only carry them). It is an I3 change and wants its own IC on REC-86/REC-87's
terms, because a widened act is a widened contract.

**What lands with no further UI work when it does.** The READ half is built and driven:
the leg display already renders every arm of IC-1's union from the plane's own `ref`, the
`stale` pane, and the page jump. The picker is the only missing piece, and
`civicos-ui/test/content-extent.control.mjs` arm `prefilled` already pins the rule it must
be built to (DEC-69: nothing forced).

### DECISIONS FOR BOB 2026-09-14 (UI-61): **NONE**

### FINDING 2026-09-14 UI (UI-61) — **THE BRIEF NAMED `checkLegExtentGrammar` IN `store.mjs`; IT LIVES IN `bio-checks.mjs`, AND THE VERIFY-OR-STOP INSTRUCTION WOULD HAVE STOPPED THIS ITEM**

The spawn brief's verification step was `grep -n checkLegExtentGrammar bio-plane/src/store.mjs`
with an instruction to STOP and report if absent. It IS absent there — REC-84 landed it in
`bio-plane/checks/bio-checks.mjs`, which is where the catalogue's own header says the grammar
belongs (*"putting it in `store.mjs` would put it where the CHECKER cannot reach it"*). The
store imports it. Taken literally the instruction halts a correctly-landed item; taken as
"verify the symbol exists" it passes. **Recorded because the next consumer brief will be
written the same way**: a verification step should name the symbol and let the worker find
it, not pin it to a file the owner was free to choose.

### FINDING 2026-09-14 UI (UI-61) — **THE ITEM'S `pdf-page` RECTANGLE HAS NO SURFACE TO BE DRAWN ON, AND SAYING SO IS CHEAPER THAN THE ALTERNATIVE**

The row's scope says *"page + rectangle in the viewer for `pdf-page`"*. **There is no in-app PDF
page renderer.** `openArtifact` hands a verified blob URL to `window.open`, and the browser's
own PDF viewer renders it in a separate tab: app.html has no page canvas, no page navigation it
controls, and no coordinate space a rectangle could be expressed in. Building one means a PDF
rasteriser inside a single self-contained HTML file that may not fetch a library.

**What UI-61 built instead, and why it is the honest half.** A page JUMP needs no renderer —
`#page=N` is the viewer instruction PDF itself defines — so the leg display offers it, at the
reader's 1-based page, degrading to page one where a viewer ignores the fragment. The rectangle
is not stubbed and not faked: `extent_rect` round-trips through the plane today (the suite
drives a leg carrying one and renders the `ref` the record minted for it), so the DATA path is
proven and only the drawing surface is absent. That surface is NARROW's and TRANSCRIBE's
requirement (IC-84 names both as decomposed behind it) and it is a real item, not a line.
## CLAIM 2026-09-14 FRAMEWORK (FW-17 — reading position on I2, and the determining reference pair on `connections`)

Worker, worktree-isolated, branch `worktree-agent-a531b903306a7ed5d`, from `origin/main`
`6a093bf` (REC-82 landed). Area FRAMEWORK, re-activated by CONDUCT #10 as a third dev area
for the content track; the item is two halves that are ONE worker (the row's own words).

**Paths, BY REGION.** Four workers are on `store.mjs` today, so the regions are named
rather than the file.

- `docprofile/**` — THE EMITTERS. `readtext.mjs` (`flattenText`'s segment map and
  `readText`'s locator), `doctypes/index.mjs` (`entity()` gains an optional `source`),
  `doctypes/meeting-agenda.mjs` and `doctypes/meeting-calendar.mjs` (`parse()` emits
  position where the container's own text gives it), `doctypes/generic.mjs` (says in its
  own header that it cannot). **`doctypes/registry.mjs` is NOT touched** — its header is
  CPDF-17's.
- `bio-plane/src/index.mjs` — the acquire path's `readEntities` only: the reading's
  entities carry `source` through to `op=promote`. NOT the capture path (CAP-8's, live).
- `bio-plane/src/store.mjs` — TWO REGIONS ONLY: (1) `#writeReadings`' `reading_refs`
  INSERT (the position columns), (2) `deriveConnections` / `#connectionView` (the
  determining pair) plus ONE new method for the portion-leg connection grade.
  **NOT the earned-basis reads (REC-83's, live). NOT `checkInquiryBasis`'s grammar
  (REC-84's, live). NOT the capture path (CAP-8's, live). NOT `#markContentStale` or
  any other REC-82 content writer.**
- `bio-plane/src/schema.mjs` — the new nullable columns on `reading_refs` and
  `connections`, and their migration. Nothing else.
- `bio-plane/checks/bio-checks.mjs` — the new refusals for this item only.
- `bio-plane/src/affordances.mjs` — read only unless a connection kind moves; if none
  moves this path is released untouched and the claim says so at the close.
- `bio-plane/test/**` — this item's suite(s) and the suites whose counts this item moves.
- `docs/development/INTERFACE-CHANGES.md` — IC-86 only (pre-minted at spawn).
- `docs/development/CLAIMS.md`, `DEBT.md`, `MEASUREMENTS.md` — append-only.
- `docs/development/INTERFACES.md` — I2's registry entry, if CONDUCT's resolution bumps it.
- `.gitignore` — one line, this item's control pen, by the convention the file's own
  head sets (a pen per item, never a widened glob).
- **ADDED once building established it was owed: `civicos-ui/app.html` — the FLATTENED
  DOCPROFILE EMBED ONLY, between its `__DOCPROFILE_START__`/`__DOCPROFILE_END__` markers,
  regenerated with `tools/bundle-docprofile.mjs` and pasted, not hand-edited.** This is
  UI's file and none of UI's surface is touched: the embed is a GENERATED copy of
  `docprofile/**`, which is this area's, and `check-semantics.mjs` refuses any difference
  between the two — so changing the package without regenerating the copy turns the UI
  harness red for everyone. FL-10's shape one directory over. If UI would rather own the
  regeneration, that is a DELEGATION to raise; leaving it stale was not an option.
- **ADDED once building established it was owed, and it is GOVERNED:
  `docs/architecture/BIO_Content_Framework_v0_10.md` — PART II ONLY** (§14.4, §14.5, §17's
  capability table, §18's closing paragraph, and the front matter's Status and Incomplete
  sections). This area owns `docs/architecture/BIO_Content_Framework_*`, and
  CORPUS-STANDARD §4.1 obliges the home document to move in the same commit as the
  construct: §17 said in so many words that *nothing records WHERE a reference was read*
  and that a connection *throws the reference away*, and §18 closed on content-grain
  connections being *impossible* until readings carry position. All three are false as of
  this landing, and a governed document left saying them is the record overclaiming in the
  one direction this project treats as worst. **PART I IS NOT TOUCHED**: it is
  ARCHITECTURE APPROVED at v0.10 and frozen by design, which its own front matter states —
  §3's READING and §8.1's connection GRADE are read as the authority here, not edited.

Expect append-only merge noise on CLAIMS/DEBT; nothing here is a whole-file rewrite.

released: 2026-09-14, at the close of FW-17, on branch `worktree-agent-a531b903306a7ed5d`
(`5b46c43` the item, plus the floor-move commit beside it). **No path in this claim carries
an owed act.** `affordances.mjs` was named conditionally and is RELEASED UNTOUCHED — no
connection kind moved, which is stated here rather than left to be inferred from its absence
from the diff.

**What landed.** IC-86 (I2, PROPOSED, ADDITIVE → MINOR) written before any code and built
against as proposed, with no amendment forced. FRAMEWORK: the segment map at
`docprofile/readtext.mjs`'s flatten and the total `ctx.locate` it hands a reader; `entity()`'s
optional IC-1 `source`; `meeting-agenda` placing every file number it reads (page, `rect` null);
`meeting-calendar` and `generic` DECLARING in their own headers that they cannot and why;
`readingSource`/`readingSourceJson`/`readingSourceFromColumns`/`readingPositionInExtent` beside
the extent vocabulary in `textchain.mjs`; `reading_refs.pos_kind`/`pos`/`pos_ref` and their
writer; `op=readingref` publishing the position so the columns have a reader a caller can
reach. RECORD: `connections`' eight pair columns and their writer in `deriveConnections`;
`#connectionView`'s `determining_pair`; `connectionGradeForContent`, reachable as
`op=connections&content=`; C-49.1/.2/.3.

**Figures.** Battery **189/190 · 11,695** against this branch's own pristine baseline worktree
at `6a093bf` (**189/189 · 11,629**, its own `npm ci`), attributed per suite by diffing two full
runs: `reading-position` +63, `hygiene` +3, `planning-hygiene` +1, `mergecarry` −1.
`coverage.mjs --strict` DIRECTLY from `bio-plane/`, `$?` unpiped, **exit 0**, REGISTER FLOOR
moved **974→980 · 180→181 · 181→182** from the print AFTER the commit, ONE key set.
`node civicos-ui/test/run.mjs` from the repo root, **exit 0**. `plancheck --local` **0 fail
0 warn**; `corpuscheck` **44 governed, 0 fail**. FL-10 fired; `dist/` rebuilt and
`signpage.mjs` regenerated byte-identically.

**Controls 6/6 AS DECLARED**, each armed alone, every restore verified by sha256 AND `cmp`
with a floored byte count — and **THREE FINDINGS from the first pass, recorded rather than
smoothed and all three about the ARMS or the SUITE rather than the subject**: (1) `nopair`
nulled one end of the pair and the grade assertion still passed, because a pair reads as
present when EITHER end carries a reference and the canonical order is decided by a capture
hash — the arm was measuring a coin flip; (2) `overstrict` armed 1× and changed NOTHING,
because the `document` arm is enforced independently in the checker AND at the call site, a
real property of the subject and one that makes an arm that cannot bite look exactly like a
subject that cannot break; (3) the SUITE was not null-robust and three arms ended in a
TypeError with the tally reading −1, which is the missing-tally-is-minus-one rule earning its
place.

**FOR CONDUCT, and these are ACTS with their actor rather than notes.** (1) **Resolve IC-86**,
answering in writing for the three dormant producers (CONTENT-PDF, CONTENT-OFFICE,
CONTENT-HTML) per protocol step 3, and take the I2 version bump. (2) **Take the I5 bump the
`reading_refs` and `connections` columns imply** — IC-86 describes them because the column
arrives with its writer, and the registry entry is CONDUCT's, not this worker's. (3)
**`mergecarry.test.mjs` is RED on `origin/main` and it is not this item's**: it names
`cc8187d`, REC-83's own integration merge, as an UNREGISTERED drop of
`bio-plane/scripts/coverage.mjs`. Proven rather than argued — it reproduces byte-for-byte in a
pristine `6a093bf` worktree with none of this item's changes present, and `cc8187d` is not an
ancestor of this branch. Either the drop was intended and belongs in the register, or
`coverage.mjs`'s lost hunk needs restoring; a worker cannot tell which and this one did not
guess. (4) **`civicos-ui/app.html`'s flattened docprofile embed was regenerated here** with
`tools/bundle-docprofile.mjs`; if UI would rather own that regeneration, that is a boundary to
rule on.

## CLAIM 2026-09-14 RECORD (REC-85 — the other three `covers` arms: `sheet-cell`, `doc-para`, `slide-shape`)

Session: RECORD worker for REC-85, spawned by CONDUCT #11, Opus 5.
Worktree: `.claude/worktrees/agent-ab9b57847595f1ea2` · branch `worktree-agent-ab9b57847595f1ea2`.
Contract: IC-83 (I5 1.11.0, CHANGING) and IC-84 (I3 14.1.0, CHANGING) — **no new IC**: the
three arms are IC-1's union, already in `CONTENT_EXTENT_KINDS` and named `landed: false`
there by REC-82 so that this landing is a WRITER rather than a migration.
Design read first: `BIO_Content_Framework_v0_10.md` Part II §15 (the forms) and §16 (the
extraction path), front matter first; IC-83's "Rules the writer enforces" (the page-count
refusal these mirror) and IC-84's leg grammar.

Paths claimed BY REGION, never whole files:

- **`bio-plane/checks/bio-checks.mjs`** — the **C-45 content-extent family ONLY**:
  `CONTENT_EXTENT_KINDS` (the three `landed` flags), `legExtent`'s three unlanded arms,
  `canonicalExtent`'s and `describeExtent`'s three arms, and the three new arms inside
  `checkContentExtent`'s `DEC-49 REGION is-content-extent`. **NOT** `checkInquiryBasis`,
  **NOT** `basisVersionFindings`, **NOT** `checkLegExtentGrammar` / `legHasAuthoredExtent` /
  `CONTENT_ID_RE` / `CONTENT_EXTENT_DOCUMENT_ONLY` — those are REC-84's, committed on
  `worktree-agent-ae95c3be71f5bd167` (`40f34e1`) and integrating ahead of this item.
- **`bio-plane/src/store.mjs`** — the **REC-82 content-writer region ONLY**: `contentContextFor`
  gains one resolved field, and one new private resolver beside `#pageSetForCapture`.
  **NOT** `checkInquiryBasis`, **NOT** `basisVersionFindings`, **NOT** `earnedBasisRegistry`,
  **NOT** `#contentStanding` / `#contentTarget` (REC-83's read region), **NOT** the
  version-leg writer (REC-84's).
- **`bio-plane/test/content-extent-arms.test.mjs`** — NEW, this item's suite.
- **`bio-plane/test/nc-rec85.mjs`** — NEW, this item's negative-control driver.
- **`bio-plane/test/content-extent.test.mjs`** — REC-82's suite: the TWO assertions at
  (4b) that assert `sheet-cell` is refused as UNLANDED. They are **CORRECTED, never
  exempted**, with the reason at the site: they were right when REC-82 landed and this
  item is what makes them wrong.
- **`bio-plane/scripts/coverage.mjs`** — `REGISTER_FLOOR` ONLY, ONE key set, from this
  item's own post-commit printed REPRODUCIBLE figures.
- **`docs/development/DEBT.md`** and **`docs/development/MEASUREMENTS.md`** — appends only.
- **`docs/development/CLAIMS.md`** — this block and one `## DELEGATION` to CAPTURE.

NOT claimed and deliberately not written: `docs/development/QUEUE.md` (CONDUCT's, sole
writer) and `docs/development/INTERFACE-CHANGES.md` (the version bump and the RESOLUTION
are CONDUCT's — IC-83/IC-84 both say so in their own text).

THREE PATHS ADDED TO THIS CLAIM AT THE CLOSE rather than taken silently, each forced by a
mechanism rather than chosen: **`.gitignore`** — one line for this item's negative-control
pen (`.rec85-control-pristine/`), the `.rec82-` / `.rec83-` pattern exactly, because an
interrupted control run must not leave a 631 KB copy of `bio-checks.mjs` where the next walk
enrols it as a source; **`bio-plane/test/rec85-arm-digest.mjs`** — the over-strictness
instrument, a NON-suite (no `.test.mjs` suffix, so the battery does not collect it) holding
the `pdf-page`/`document` sweep the suite pins by digest, which could not live in the suite
itself because it has to be runnable against a PRISTINE worktree to produce the figure the
suite then asserts; and **`docs/DECIDED.md`** — regenerated with `node tools/decided.mjs`,
which `plancheck` requires of any turn whose corpus edits move the ruling index.

released: 2026-09-14 by the REC-85 worker — **all three arms landed and the item's real
finding is that the figure the third of each arm compares against is persisted NOWHERE.**

**WHAT LANDED.** `sheet-cell`, `doc-para` and `slide-shape` are `landed: true` in
`CONTENT_EXTENT_KINDS`; `legExtent` reads each arm's OWN fields (the six-key `fields` bag
REC-82 carried through UNREAD is gone — its own prediction was "a reader rather than a
shape", and it held, because no row of these kinds could exist to migrate and the suite
asserts that count is zero against a real store); `canonicalExtent` takes the address over
fixed per-arm fields with `$B$14`/`b14`/`B14` normalised to ONE cell (`normRect`'s rule in
A1 notation); `describeExtent` derives exactly the producer's own `ref`, PINNED in the suite
against `sheetCellRef` / `docParaRef` / `slideShapeRef` themselves because `bio-checks.mjs`
imports nothing and the parity had to be a measurement rather than a call. The SHAPE half of
each arm refuses by name as C-45.3 through `op=promote`; the CONTAINER half refuses by name
as C-45.1 — the SAME code as the page set because it is the same fact, so C-45.1's canned
translation was WIDENED to every container rather than a fifth code minted.

**THE FINDING, MEASURED FOUR WAYS AND FILED AS D-354 + a DELEGATION to CAPTURE above.**
Nothing in this plane persists a container's extent: the reading carries no structure,
`docprofile/readtext.mjs` says so in its own words, none of the 77 tables in `schema.mjs`
holds a sheet/paragraph/shape, and Part II §15 already said the I2 structure is "not stored".
So the three container arms are BUILT, CORRECT AND UNFED. `#containerExtentForCapture`
answers all three levels NULL and NAMES THE EMPTY LEVEL; the arms are skipped, never guessed;
and an impossible-but-well-formed address MINTS today — driven and asserted THROUGH THE OP,
because refusing for a bound nobody measured pushes a member toward citing the whole
document, which claims MORE. Per arm, the answer to "persisted or absent" is **ABSENT, all
three**. The CAPTURE act has its shape fixed in the delegation; nothing on the RECORD side
moves when it arrives.

**GATES on the final tree, every exit read UNPIPED.** Battery **191/191 suites green ·
11,780 assertions · 0 skipped · 200.8s**; own baseline **190/190 · 11,713** on this worktree
at `3f92e5c` with all three member installs, which is EXACTLY the briefed figure — measured,
and right. The +67 attributed PER SUITE by diffing two full runs rather than by subtraction:
`content-extent-arms.test.mjs` **+63** (new), `hygiene.test.mjs` **+3** (its three per-suite
arms applied to the new suite), `planning-hygiene.test.mjs` **+1** (D-354's disposition row);
`content-extent.test.mjs` UNCHANGED at 59, which is the corrected (4b) pair costing nothing.
`coverage.mjs --strict` run DIRECTLY from `bio-plane/`, `$?` read with nothing piped after
it, **exit 0**, OPS **172 declared · 172 reached · 0 unreached**; **no new check and no new
op, measured at the close** — the three arms reuse C-45.1 and C-45.3, so no control-plane
assertion is owed. `REGISTER_FLOOR` moved to the printed REPRODUCIBLE **989/182/183** (ONE
key set, grepped after writing; the PRE-COMMIT run printed the same numerals under
`contaminated: 1 suite(s)` and was refused as a source, exactly as REC-82's and REC-83's
were). UI harness from the REPO ROOT **exit 0**. `plancheck --local` **0 fail, 0 warn**.
`corpuscheck` **0 fail, 44 governed documents**. FL-10 fired on `src/` and `checks/` and
`dist/` was rebuilt (2,848,036 B, sha256 `7344b2440cafe2…`) — caught by
`fleetbundles.test.mjs` going red at 83/4 mid-item rather than by remembering; nothing
bumped, nothing deployed, no live instance touched, `op=audit` not run because no live
instance was reached.

**EIGHT CONTROL ARMS, all AS DECLARED on the final tree**, each armed ALONE with the others
held open, every restore verified byte-identically by sha256 AND `cmp` (631,437 bytes,
sha256 `cff3ac7f3928…` each time): `baseline` 63/0 GREEN (the row that tells eight-broken
from eight-working) · `sheetcell` 59/4 (4/4) · `docpara` 61/2 (2/2) · `slideshape` 61/2 (2/2)
· `a1` 61/2 (1/1) · `onebased` 61/2 (1/1) · `canon` 50/13 (7/7) · `overstrict` DID NOT REACH
ITS FOOT, exit 1, 3/3 crash markers. **TWO CAME BACK WRONG ON THE FIRST RUN AND BOTH ARE
RECORDED AT THEIR SITES RATHER THAN SMOOTHED.** `canon` read `3/7 declared, 6 failing`
because it patched ONE canonical branch while the declaration named three — THE DECLARATION
WAS THE DEFECT, and a mis-declared arm reads exactly like a partially-working subject; it now
patches all three and reads 7/7. `overstrict` read `-1 pass, -1 fail`: it refuses the suite's
own FIXTURES, `mustPromote` THROWS, and a throw goes through no assertion at all — **the
third sighting of that shape in three consecutive items** (REC-82's `overstrict`, REC-83's
`unwired`), so it is named as a class and the arm is now verified on what the crash SAYS
(`mustThrow`), which is stronger than the four assertion failures first declared.

**OVER-STRICTNESS, both directions.** `pdf-page` and `document` are BYTE-IDENTICAL to
REC-82's landing across a **130-row sweep** (`test/rec85-arm-digest.mjs`, sha256
`28875841782289e9…`) computed on a PRISTINE detached worktree at `3f92e5c` and recomputed on
this tree — and the sweep deliberately includes two contexts carrying the `container` key
this item ADDED, so it says specifically that adding it moved nothing there. Second
direction: a well-formed cell, paragraph and shape are NOT refused by the pure catalogue,
which holds no container and must not answer a question only the store can.

**TWO DECISIONS TAKEN AS MECHANISM, both reversible, both recorded at their sites.** (1) NO
COLUMN on `content` records the container extent — `page_count`'s reasoning inverted (a
figure NULL on every row that can ever be minted until CAP-9 is not information, and
`schema.mjs`'s rule is that the column arrives WITH ITS WRITER); reversal costs one additive
column and an IC-83 amendment, which is exactly what `page_count` itself cost. (2) The three
container predicates answer a SENTENCE and `checkContentExtent` answers WHICH CODE THAT IS,
so all four C-45.1 sites stay inside the one `is-content-extent` region the row's `where`
names — the first draft minted the code in the helpers, which passed the UI guard and would
have joined the MULTI-SITE-CODE condition `check-refusal-codes.mjs` documents and cannot
close, for no gain.

**WHAT THIS WORKER DID NOT DO, stated plainly.** The transcription-axis `covers` — whether an
ATTESTATION covers one of these addresses — is untouched and stays NULL for all three arms,
because an attestation's extent vocabulary is `document|page|region` and has no cell,
paragraph or shape in it; `#contentTarget`'s comment predicts REC-85 changes that and it does
not, which is named for CONDUCT in the report. No live instance was reached, so `op=audit`
was not run. And one adjacent fact found and deliberately NOT built on:
`reading.text_container` IS persisted and could feed a COARSE container check, but it is not
what this row names and it is NULL on every capture that never reached the format axis, so a
fence on it would refuse correct work — named in the delegation as a candidate row, not as a
gap D-354 covers.

**RE-MEASURED ON THE MERGED TREE — `origin/main` MOVED TO `ce6e7cf` AND REC-84 LANDED ON IT
WHILE THIS ITEM RAN**, so the brief's instruction applied and the item fast-forwarded and
re-measured rather than reporting figures true of a tree that no longer exists. Ten
conflicts, every one resolved by reading both sides. **The four REC-84 assertions this
landing invalidates were CORRECTED HERE, by this worker, rather than left as an act for
CONDUCT** — the fixtures unchanged, the legs still refused, only the expected REASON moved,
with the negative half asserted so the old sentence cannot quietly come back; plus REC-84's
`unlanded` CONTROL ARM, whose patch anchor this item deleted and which would have read
`ARMED NO (matched 0x)` and green (re-cut to flip `sheet-cell` back to unlanded, the
direction that now breaks correct work, so the `landed` gate stays under a control for the
day `dom` needs it); plus one stale sentence in the plane itself — `checkLegExtentGrammar`'s
guidance named a CLOSED LIST of two landed kinds and is now COMPOSED FROM THE MAP.

**MERGED-TREE GATES, every exit read UNPIPED.** Battery **192/192 suites green · 11,839
assertions · 0 skipped · 210.1s**. **The baseline is `origin/main` `ce6e7cf`'s OWN measured
run — 191/191 · 11,771** — taken on a pristine detached worktree with all three member
installs, so the +68 is attributed PER SUITE by diffing two full runs and never by
subtraction: `content-extent-arms.test.mjs` **+64** (new), `hygiene.test.mjs` **+3**,
`planning-hygiene.test.mjs` **+1**. `content-extent.test.mjs` and REC-84's
`content-extent-leg.test.mjs` are UNCHANGED IN COUNT — the corrections moved values inside
existing assertions, which is what correcting rather than deleting looks like in the tally.
`coverage.mjs --strict` **exit 0**, and **CHECKS 256/256 named (0 never named)**.
`REGISTER_FLOOR` moved to the MERGED tree's printed **997/183/184** — and this is the
measurement worth keeping: **both sides of the conflict said 989**, REC-84 reaching it from
981 with `content-extent-leg` (8 arms) and REC-85 reaching the same 989 from the same 981
with `content-extent-arms` (8 arms), two DIFFERENT suites with identical arithmetic, so a
keep-either resolution would have installed a floor eight arms and one suite low. That is
the third occurrence of the hazard that block records. UI harness from the REPO ROOT **exit
0**. `plancheck --local` **0 fail, 0 warn**. `dist/` rebuilt from the merged sources rather
than merged as text.

**BOTH CONTROL DRIVERS RE-RUN IN FULL ON THE MERGED TREE — ALL SIXTEEN ARMS AS DECLARED**
(`nc-rec85` eight, `nc-rec84` eight), every restore verified byte-identically by sha256 AND
`cmp`. **AND THE MERGE SURFACED TWO MORE FINDINGS, both recorded rather than smoothed.**
(1) `overstrict` came back **2/3**: its third marker was `C-45.1`, and under REC-84's new
CATALOGUE gate the armed refusal fires there and RELAYS at C-2.8 while carrying the content
family's CODE through unchanged — **the C-NUMBER IS THE GATE AND THE CODE IS THE FACT**, the
distinction REC-84 paid four red assertions for, so the markers now assert both. (2)
`coverage.mjs --strict` went **red** with `1 never named: C-45.3` — the only thing in the
whole battery naming that number was the TEXT of an assertion LABEL, and this item's own
correction of that label removed it. It is now pinned as BEHAVIOUR (the checker's own verdict
is C-45.3, the relay is C-2.8), because a label can be reworded by the next item without
anyone noticing and a value cannot. **That is the C-20.1 class the check-naming gate exists
to catch, catching this worker.**

**NOTHING IS OWED TO A FUTURE ACTOR BY THIS NOTE.** The REC-84 collisions are DONE, not
delegated. What remains for CONDUCT is stated as ACTS with actors in the worker's REPORT:
flipping this row and IC-83/IC-84's status, and re-reading `REGISTER_FLOOR` if another item
merges beside this one.


## DELEGATION 2026-09-14 RECORD (REC-85) -> CAPTURE: **THE THREE CONTAINER-EXTENT ARMS ARE BUILT, DRIVEN AND UNFED — NOTHING PERSISTS A SHEET LIST, A PARAGRAPH COUNT OR A SHAPE LIST, AND WITHOUT ONE THE OUT-OF-RANGE REFUSAL CANNOT FIRE IN PRODUCTION**

**What was measured, 2026-09-14, on `origin/main` at `3f92e5c`.** REC-85 landed the
`sheet-cell`, `doc-para` and `slide-shape` arms of the content-extent primitive. Each has
two halves: a SHAPE half (is this an address at all) which is fed by the leg and is live,
and a CONTAINER half (does THIS document hold that address) which needs the container's own
extent. **The record holds no container extent for any of the three, and this was measured
four ways rather than assumed:**

- the reading persisted at promote carries `content_type`, `reader_version`,
  `read_from_text`, `found`, `entities`, `facts`, `at`, `text_source`, `text_tier`,
  `text_container`, `basis` — **and nothing structural** (`index.mjs`, the acquire path);
- `docprofile/readtext.mjs` says it in its own words: it *"returns what the recognisers
  said — never a persisted shape"*;
- **none of the 77 tables in `schema.mjs`** holds a sheet, a paragraph or a shape;
- the design already said so and it is now marked load-bearing rather than descriptive:
  Part II §15's structure-shape row reads *"not stored — recoverable only by re-running the
  structure op, which stops at tier 2"*.

**What this costs today, stated rather than left to be discovered.** A leg may cite
`NoSuchSheet!ZZ9999999` of a real workbook and it MINTS — the suite drives exactly that and
asserts it, because the alternative is worse: refusing a citation for a bound nobody
measured pushes a member toward citing the WHOLE DOCUMENT, which claims MORE and not less
(IC-83's own reasoning, and the page-set arm's rule verbatim). The absence is UNDETERMINED
and STATED with the empty level NAMED — `#containerExtentForCapture` in `store.mjs` returns
the statement rather than a bare null — so nothing here overclaims. **But the refusal has no
production feed, and a mechanism believed on the strength of its existence rather than its
behaviour is the defect this project meets most, so it is named here rather than left green.**

**THE ACT, and it is CAPTURE's because it is on the acquire path.** `op=acquire` persists an
I2 STRUCTURE SUMMARY beside the page count D-345 already names — the same shape, the same
item, and CAP-9 is the row that closes the page-count half. The target shape is fixed by
`checkContentExtent`'s own contract and needs no negotiation:

    container = { sheets:     [{ name, rows, cols }] | null,
                  paragraphs: <count> | null,
                  slides:     [{ shapes: <count> }]  | null }

**Every level is independently nullable and every null means the same thing: the record does
not hold it.** A sheet list with no `rows`/`cols` is legitimate and useful on its own — it
refuses an unknown SHEET and says nothing about the cell, which is exactly right, and the
suite asserts that partial case. The producers already compute all of it:
`formats-xlsx.mjs` walks every sheet's rows and cells, `docx.mjs` emits `paragraphs[]`,
`pptx.mjs` tracks the shape sequence per slide, and COFF-10's three ODF entries produce the
same shape. **Nothing on the RECORD side has to change when it arrives**: read it in
`#containerExtentForCapture`, and all three arms begin firing with no other edit.

**WHAT REC-85 DELIBERATELY DID NOT BUILD, and the reason, so CAPTURE is not surprised by a
narrower gap than this note describes.** `reading.text_container` IS persisted — the record
knows a capture was read as `xlsx` / `docx` / `pptx` / `pdf`. That is the ONE record-held
fact that could feed a COARSE container check today (a `sheet-cell` address on a capture read
as `docx` has no sheets at all). It was not built here for two reasons, both stated so the
next actor can overturn them on evidence: it is not what REC-85's row names (a cell outside
the sheet's DIMENSIONS), and `text_container` is null on captures that never reached the
format axis, so a fence on it would refuse correct work on every such document — over-strict
in exactly the direction this family refuses. **It is a real candidate for its own row and is
named as one, not as a gap this delegation covers.**


## CLAIM 2026-09-14 CAPTURE (CAP-9 — the page count I2 already carries, persisted onto the reading at `op=acquire`)

Session: CAPTURE worker, Opus 5, worktree-isolated, spawned by CONDUCT #11 after
CAP-8 reached `origin/main` at `980a9e5`.
Worktree: `/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-aaa4d22253c340546`
Branch: `worktree-agent-aaa4d22253c340546`
Baseline: THIS worktree measured at `980a9e5` BEFORE any edit, `git status --porcelain`
empty (0 lines, printed) — **192/192 suites green · 11,936 assertions · exit 0**. The
brief's figure was RIGHT and is recorded as measured rather than inherited.

**THE INTERFACE ANSWER, GIVEN BEFORE BUILDING as the row requires.** An IC **IS owed, on
I1**, and it is ADDITIVE. The acquire document gains one key inside `document.reading`
(`page_count`), and I1's own version history is four consecutive ADDITIVE MINOR bumps for
exactly this act — 1.1.0 `document.profile` (FW-3), 1.2.0 `document.profile.digests`
(FW-4), 1.3.0 `document.profile.format` (COFF-1), 1.4.0 the Drive hop (IC-85). I1's
"what freezing this costs you" names the frontmatter field names and value domains in §4
as protocol-bound, and the acquire document IS `bundle.md`'s frontmatter. `IC-87` is filed
PROPOSED; CONDUCT takes the version bump and the RESOLUTION.
**I2 does NOT move**, and that is a decision with a reason: `pdfstructure.mjs` has emitted
`pages: <int>` since I2 1.0.0 and this item carries that existing field onto CAPTURE's own
document — a new producer obligation would be a widening, and there is none.
**I5 does NOT move either**, and that is the reason there is no schema edit below.

EXACT PATHS CLAIMED, BY REGION:

- `bio-plane/src/index.mjs` — **THREE SITES ONLY**, all inside `op=acquire`'s READING
  ASSEMBLY (the FW-15 wire), and **NOT** CAP-8's two `op=acquire` regions (`is-drive-capture`
  and the export seam), which are untouched: (a) the `let wired = null, wiredTier = null;`
  declaration, which gains `pageCount`; (b) the two lines inside the PDF branch that read
  `st.pages` off the structure object the format entry already produced; (c) ONE new line
  after the three reading branches close, carrying the count onto `reading`. No fetch, no
  governor, no hop, no transport record.
- `bio-plane/src/store.mjs` — **NAMED BY REGION, NOT BY FILE** (30,924 lines of shared
  ground; `grep -a` only): (1) `#chainForCapture` becomes `#persistedReading` +
  `#chainOfReading` — ONE read of the `readings` row instead of two, because
  `contentContextFor` wants two facts off it; (2) `#pageSetForCapture`'s doc comment and
  its first three lines — the stored count is preferred and the derived union is the
  fallback; (3) `contentContextFor`'s three-line body. **NOT `mintContent`, NOT
  `#markContentStale`, NOT `#contentPlanFor`, NOT `#captureForContent`, NOT the `covers`
  arms** — REC-85 and SK-7 are live on the content region.
- `bio-plane/test/capture-pagecount.test.mjs` — **NEW**. The suite, driven THROUGH
  `op=acquire` → `op=promote` → `op=reading` / `op=content` against a miniflare fixture
  serving a three-page PDF, a PDF with no orderable pages, and an HTML page.
- `bio-plane/test/nc-cap9.mjs` — **NEW**. The negative-control harness: five arms plus a
  baseline, each armed ALONE, every restore verified by sha256 AND by content.
- `bio-plane/scripts/coverage.mjs` — the ONE `REGISTER_FLOOR` key set only, moved to the
  figures this item's own green post-commit run PRINTED.
- `docs/development/INTERFACE-CHANGES.md` — `IC-87` appended, PROPOSED. Id minted with
  `node tools/mintid.mjs IC`.
- `docs/development/DEBT.md` — `D-345`'s disposition, and one new row for the backfill
  this item deliberately does not take.
- `docs/development/MEASUREMENTS.md` — one appended section.
- `docs/development/CLAIMS.md` — this block.

NOT CLAIMED, stated because a reader would reasonably expect them:

- **`bio-plane/src/schema.mjs` — NOT TOUCHED AT ALL. NO TABLE, NO COLUMN**, and this is the
  decision the brief anticipated the other way. `readings.reading` already holds the whole
  reading as JSON, `readings` is keyed by `capture_sha`, and the ONE reader
  (`contentContextFor`) looks up by exactly that key — so a column would be a projection
  nothing filters, counts or asks for. `#writeTextSource`'s columns exist because the chain
  had to be *filterable*; this number does not. It also keeps this item off a table I5
  assigns to `FRAMEWORK` (ACTIVE, FW-17), and off I5 entirely.
- **`bio-plane/src/store.mjs`'s `#writeReadings` — READ, NOT EDITED.** The brief named it as
  a region to claim; it needs no change, because it persists `JSON.stringify(reading)`
  wholesale and the new key rides it. Named here so the next reader knows it was looked at
  rather than missed.
- **`bio-plane/checks/bio-checks.mjs` — NOT TOUCHED.** C-45.1 exists and its guard is
  already right; this item makes it REACH, and re-minting or widening it was never owed.
- `bio-plane/src/pdfstructure.mjs` (it already returns `pages`), `civicos-ui/**`,
  `newgroup/**`, `docs/development/QUEUE.md` (CONDUCT's sole writer),
  `docs/architecture/BIO_Content_Framework_v0_10.md` (CONTENT's).
- `bio-plane/dist/**` is rebuilt by `npm run build` under FL-10's guard, not authored.

**AMENDED AT THE BUILD, two additions, each stated rather than quietly taken:**

- `.gitignore` — **ONE PEN, `.cap9-control-pristine/`**, with its reason at the line.
  This claim did not anticipate it. The control harness keeps per-arm pristine copies
  of `src/index.mjs` and `src/store.mjs` there while it arms them, and the file's own
  note at `.rec84-control-pristine/` rules that a glob over `.*-control-pristine/`
  would silently cover a pen nobody declared — so each one is named. An interrupted
  run would otherwise leave an untracked copy of a plane source where another item's
  producer sweep has already enrolled one as a second author.
- `bio-plane/dist/bio-plane.bundled.mjs` + `dist/bio-plane.bundle.json` — FL-10's guard
  fires on any `src/` change and the bundle is rebuilt with `npm run build`. Nothing
  bumped, signed or deployed.

**ONE FINDING ABOUT THIS ITEM'S OWN WORK, recorded rather than smoothed.** Two id
numbers were written into source comments and into this claim BEFORE they were minted
— `D-352` and `IC-86`, both arrived at by reading the corpus floor and both wrong
(`mintid` answered `D-356`, stepping over four held ids, and `IC-87`, stepping over
one). Corrected in every site before any gate ran. **This is the exact failure
`WORKER.md`'s id rule names — "seven items collided on an id in one day, every one
having measured the number free and every one right when it looked" — reproduced here
by a worker who had read the rule an hour earlier.** It is recorded because the rule's
own receipt says vigilance was already tried; what caught it was running the tool.

released: 2026-09-14 CAPTURE (CAP-9) — landed on `worktree-agent-aaa4d22253c340546`, NOT pushed and
NOT merged; CONDUCT integrates. **THIS RELEASE CARRIES NO OWED ACT IN PROSE** (D-342's grammar, and
WORKER.md's rule that an owed act never lives in a note): everything this landing obliges a future
actor to do is an ITEM or a DELEGATION with its actor named — `IC-87` is PROPOSED in
`INTERFACE-CHANGES.md` with every consumer named and CONDUCT takes the version bump and the
RESOLUTION (and the registry gap the IC names: I1 §4's document table has never listed `reading`);
`D-356` is a DEBT row with its disposition token and is the DELEGATION at the foot of this file;
`D-345` is CLOSED in the same file; the `### CAP-9 · running` row in `QUEUE.md` is CONDUCT's to
flip and this worker did not touch that file.

**THE INTERFACE ANSWER, GIVEN BEFORE BUILDING as the row required** (it is at the head of this
claim, written before the first edit): an IC **IS** owed, on **I1**, ADDITIVE, on the precedent of
I1's own four ADDITIVE MINOR bumps for a new acquire-document field. **I2 does not move** (it has
emitted `pages: <int>` since 1.0.0 — this item consumes it), and **I5 does not move**, which is why
there is no schema edit in the diff.

GATES on this branch, every exit status read UNPIPED: battery **193/193 suites · 11,962 assertions ·
exit 0** against this worktree's own pristine baseline **192/192 · 11,936** measured at `980a9e5`
BEFORE any edit with `git status --porcelain` empty (0 lines, printed) — the brief's figure was
RIGHT and is recorded as measured, not inherited. **The +26 is attributed PER SUITE by DIFFING the
two full runs and never by subtraction**: `+22` `capture-pagecount.test.mjs` (new), `+3`
`hygiene.test.mjs` (712→715 — its per-suite scans gaining a suite), `+1`
`planning-hygiene.test.mjs` (279→280 — the IC row and the debt row); **188 suites unchanged, none
FELL, and no existing suite was edited**. `node scripts/coverage.mjs --strict` run DIRECTLY from
`bio-plane/`, `$?` unpiped, **exit 0**; checks **263/263 named (100.0%)**; `node
civicos-ui/test/run.mjs` from the REPO ROOT **exit 0**; `node tools/plancheck.mjs --local` **0 fail
0 warn**; `node tools/corpuscheck.mjs` **50 governed documents, 0 fail**. Nothing was deployed,
bumped, signed or tagged, and NO live write was made: the only live traffic was three READ-ONLY ops
(`op=list`, `op=export`, `op=reading`, plus `op=textprovenance` and `op=registeraudit`) taken for
D-356's population count, with no token printed.

**REGISTER_FLOOR MOVED 996 → 1001 · 183 → 184 · 184 → 185**, ONE key set, all three in the same turn
and every figure taken from the **POST-COMMIT** green `--strict` run's own REPRODUCIBLE print
(`arms 1001/996 · classified 184/183 · corpus 185/184 · GREW by 5 arm(s)`), re-verified by a second
green run reading `1001/1001 · 184/184 · 185/185`. **The PRE-commit run printed the floor's existing
figures with `contaminated: 1 suite(s) no other checkout has` beside the higher ones** — D-238's
rule working as written, and the reason the floor is moved after the commit and not before.
`FLEET_FLOOR` unmoved (no fleet member, no fleet suite). `coverage-provenance.test.mjs` re-run
after the move: 29 pass, 0 fail. FL-10's guard fired on the `src/` change and `npm run build`
rebuilt `dist/bio-plane.bundled.mjs` (2,880,072 B, sha256 `2dc5dddabd6e…`); `src/signpage.mjs`
regenerated byte-identically; a second build after the `scripts/coverage.mjs` edit produced the
**same bytes**, which is the check that the floor move is not a source change wearing a script's
clothes.

**CONTROLS: six rows — five arms plus a baseline — in `test/nc-cap9.mjs`, re-runnable in one step
(`node test/nc-cap9.mjs [arm]`), each armed ALONE with the others held open, every restore verified
by sha256 AND by content against a UNIQUELY-NAMED per-arm pristine copy with a byte count printed
and a 20,000-byte minimum guarded (6 of 6 `byte-identically: YES`, 0 mismatch). EVERY ARM AS
DECLARED, declared before arming:**

| arm | declared MUST FAIL | actual |
| --- | --- | --- |
| `baseline` | nothing | **22 pass, 0 fail** — green, the row that distinguishes five-arms-broken from five-arms-working |
| `drop` (index.mjs: the count never reaches the reading) | the acquire arm, the persisted arm, the C-45.1 refusal | **17/5**, 3/3 declared present — **THE ARM THAT PROVES THE GAP WAS REAL**: it reproduces exactly what the record held before this item, and C-45.1 then cannot fire on a freshly acquired PDF |
| `prefer` (store.mjs: the count is there and the reader ignores it) | the refusal, the row's stored count, the precedence arm | **17/5**, 3/3 — and the acquire/persist arms STAYED GREEN, which is what separates a reader failure from `drop`'s writer failure |
| `overstrict` (store.mjs: answer 1 instead of null for an unknown page set) | the unknown-page-set mint, the stated-NULL row | **19/3**, 2/2 — every refusal arm stayed green, so the arm broke correct work and nothing else |
| `derived` (store.mjs: neuter the D-252 scoped-chain union) | the mixed-document refusal and its detail | **20/2**, 2/2 — and every stored-count arm stayed green, because the stored figure is preferred and never reaches that code |

**TWO FINDINGS ABOUT THIS ITEM'S OWN WORK, recorded rather than smoothed.** (1) The new suite did
not dispose its Miniflare instance, and `hygiene.test.mjs` caught it on the FIRST full battery run
(714 pass, **1 FAIL**, naming the file) — the run was void, this worker killed its own battery after
confirming by `lsof` which of the two running batteries was its own, fixed it, and re-ran the whole
set; hygiene then read 715 pass, 0 fail. A new suite is a new leak until the scan says otherwise, and
the fix carries that sentence at the site. (2) Two ids were written into source comments and into
this claim BEFORE being minted (`D-352`, `IC-86`, both read off the corpus floor and both wrong —
`mintid` answered `D-356` and `IC-87`, stepping over five held ids between them), corrected in
every site before any gate ran. That is WORKER.md's id rule reproduced by a worker who had read it
an hour earlier, which is the argument for the tool over the vigilance.

## DELEGATION 2026-09-14 CAPTURE (CAP-9) → RECORD: **THE PAGE-COUNT BACKFILL FOR CAPTURES ACQUIRED BEFORE THIS LANDING — POPULATION MEASURED AT ZERO ON THE PROJECT INSTANCE, AND THE ROW IS `D-356`**

CAP-9 closes D-345 forward: `op=acquire` persists I2's page count onto the reading, so
every capture from this landing on carries one and C-45.1 reaches it. **It closes
nothing behind it.** A reading written before this commit has no `page_count` key,
`#pageSetForCapture` falls back to the derived union, and for a wholly text-layer or
wholly scanned document that union is empty — so a page leg on such a capture still
mints with `page_count` NULL, deliberately not refused.

**THE ACT, with its actor:** `RECORD` builds the backfill when the population stops
being zero. It is not CAPTURE's: `readings` is FRAMEWORK's table by I5's ownership
list, the write sits in RECORD's promote transaction, and this worker's claim says it
touches neither.

**THE COUNT, measured rather than estimated** (`MEASUREMENTS.md`, CAP-9's section,
2026-09-14, three read-only ops against the project's own instance):

- 31 bundles · **88** distinct `capture_sha` across every bundle's register
- of those 88, captures with a persisted reading: **0**
- readings carrying a transcription chain, whole store (`op=textprovenance`,
  `truncated: false`): **0**
- **captures a backfill would move today: 0**

So this is filed as a row with a measured priority rather than a task with an assumed
one. **The second finding in that measurement is the larger one and belongs to whoever
picks this up: the live record holds 88 captured documents and has read none of them.**

**WHAT THE BACKFILL COSTS WHEN THE POPULATION IS NOT ZERO**, so the next session does
not have to re-derive it: the count cannot be recovered from the record — it is a fact
about the BYTES — so each capture must be re-read from R2 and put back through
`structure()`. That is a bounded, resumable batch pass in the shape
`reindexNames`/`#backfillRefTerms` already has (a `limit`, a cursor, idempotent), NOT
a migration and NOT a re-acquire. **It must write ONLY the count**: a reading is a
projection of its acquire document, so a backfill that also rewrote the chain, the
entities or `at` would become a second author of it.

**Interim law, unchanged from D-345 and restated because it is what protects the record
until this runs:** a NULL `page_count` on a pre-CAP-9 capture means the page set was
undetermined at mint and is STATED — never defaulted to a number, never a zero, and
never a refusal.

## CLAIM 2026-09-14 RECORD (REC-89 — SEARCH §7 row 1, D-225's caps: VERIFY-AND-DISPOSE, because the caps LANDED at REC-60 on 2026-08-07 and the debt row was never moved)
session: REC-89 worker, spawned by CONDUCT #11. Worktree
  `.claude/worktrees/agent-aeb40c8345753a176`, branch `worktree-agent-aeb40c8345753a176`.
opened: 2026-09-14
authority: `QUEUE.md` `### REC-89 · running` (verified on `origin/main` at `f38af22`
  before any edit), under `CONTENT-SEARCH-DESIGN.md` §7 row 1 and §2.
**THE ITEM'S SUBJECT IS ALREADY BUILT, and that is the finding rather than an excuse.**
  `resolutionsForCapture`, `documentsConcerning` and `connectionsFor` each clamp to
  default 500 / ceiling 5000 and publish `limit` after clamping beside `truncated`;
  all three are driven through their ops on `bounds.test.mjs`'s roster; `IC-25` on I3
  is SETTLED (8.1.0 → 9.0.0 → 10.0.0, recorded by CONDUCT 2026-08-07). So this item
  builds nothing, MINTS NO IC (see the release line), and its work is the VERIFICATION
  the row's accepts-when asks for, the NEGATIVE CONTROL it declares, and the disposition
  the record is missing.
paths:
  - `docs/development/DEBT.md` — **THE D-225 ROW ONLY** (its Status column). Shared file;
    D-297 (DIST) and COFF-9 (CONTENT-OFFICE) hold other rows in it and neither names D-225.
    No other row on this file is read-modified-written by this item.
  - `docs/development/CONTENT-SEARCH-DESIGN.md` — §2's D-225 constraint row, §7 row 1, and
    the front matter that its stated completeness change obliges (the row's accepts-when:
    "the home design's front matter moved in the same commit if its stated completeness
    changes"). No other section.
  - `docs/development/MEASUREMENTS.md` — this item's driven figures only, appended.
  - `docs/development/CLAIMS.md` — this block.
  **READ AND DRIVEN, NEVER EDITED**: `bio-plane/src/store.mjs` (`resolutionsForCapture`
  :14113, `documentsConcerning` :14141, `connectionsFor` :14454, `connectionGradeForContent`
  :14538, the REC-60/D-225 region header :13875, the op dispatch :30615-30621),
  `bio-plane/src/index.mjs`, `bio-plane/test/bounds.test.mjs`,
  `bio-plane/test/meaning-bounds.test.mjs`, `bio-plane/test/derivation-bounds.test.mjs`,
  `bio-plane/scripts/coverage.mjs` (`REGISTER_FLOOR` — READ, and NOT moved: this item adds
  no op, no check and no control, so no floor of its is invalidated).
  **NOT EDITED, and each is a DELEGATION instead**: `docs/architecture/BIO_Content_Framework_v0_10.md`
  (Part II's table still calls these three "fixed-key reads, uncapped (D-225)" at line numbers
  three thousand lines stale — CAP-8's precedent on the same document, same day: the design
  document is not a worker's to edit), `docs/development/INVESTIGATIVE-SESSION.md` §14c
  (its "Related finding" says in the present tense that the three reads "are uncapped"),
  `docs/development/QUEUE.md` (CONDUCT's, sole writer — REC-90's "waits on REC-89" and the
  row's own disposition are CONDUCT's to move).
  **NOT** `bio-plane/**` source of any kind, **NOT** `INTERFACE-CHANGES.md` (no IC is owed;
  filing one would record a change that does not exist), **NOT** `civicos-ui/**`.
concurrency: checked over the register 2026-09-14 against every claim with no `released:`
  line — FL-10 and FL-6 (FLEET) name `store.mjs`, D-297 (DIST) and COFF-9 (CONTENT-OFFICE)
  name `DEBT.md`, REC-84's addendum (RECORD) names `store.mjs` and `scripts/coverage.mjs`.
  **This item writes NO `.mjs` file at all**, so the `store.mjs` overlap is read-only, and
  the `DEBT.md` overlap is disjoint BY ROW. Of the four live siblings named in the brief —
  REC-93 (`observations`), REC-97 (`op=cite`), CAP-12 (`op=acquire`), SK-7 (the mint path) —
  none touches D-225's three reads or their op sites.
  - **AMENDED MID-ITEM, 2026-09-14:** `docs/development/DEBT.md` gains **a SECOND row, `D-365`**,
    beside the D-225 disposition this claim opened with. It was not foreseen from the brief: the
    row's declared NEGATIVE CONTROL was run as declared, and one arm set came back GREEN where it
    should have gone red, which is a finding about the SUITE rather than the plane. It is filed as
    its own row rather than folded into D-225 because it is not D-225's defect — D-225 was
    unboundedness in the PLANE and is closed; this is an unmeasured property in the SUITE. Still
    no `.mjs` file is written.
  - **AMENDED MID-ITEM, 2026-09-14:** `docs/DECIDED.md` — **REGENERATED, never authored**, by
    `node tools/decided.mjs`, because this turn's edits move the line numbers the generated index
    cites and `plancheck` fails on the drift. Not hand-edited in any part.
released: 2026-09-14 by the REC-89 worker — **THE ITEM BUILT NOTHING BECAUSE ITS SUBJECT WAS ALREADY
BUILT, AND THE WORK IS THE PROOF OF THAT PLUS THE DISPOSITION THE RECORD WAS MISSING.** D-225's three
reads took REC-57's envelope at **REC-60 on 2026-08-07** under **IC-25** (SETTLED, I3 8.1.0 → 9.0.0 →
10.0.0): `resolutionsForCapture` (`store.mjs:14113`), `documentsConcerning` (`:14141`) and
`connectionsFor` (`:14454`) clamp to `#MEANING_LIMIT_DEFAULT` 500 / `_MAX` 5000 and publish `limit`
AFTER clamping beside `truncated`, all three driven through `op=resolutions` / `op=concerns` /
`op=connections` with `&limit=` on `bounds.test.mjs`'s roster. FW-17's `content=` arm
(`connectionGradeForContent`, `:14538`) takes the same bound at its own site. **NO IC WAS MINTED AND
THAT IS THE DECISION, NOT AN OMISSION:** the brief instructed one on I3 at spawn under IC-3's rule
that an addition is recorded too, but there is no addition — filing an IC for a change that does not
exist teaches the registry to lie in the other direction, which is IC-3's own reasoning. `IC-25` is
the entry; `INTERFACE-CHANGES.md` was read and NOT written.

GATE FIGURES, all against a baseline measured on a pristine scratch checkout of `origin/main`
`f38af22` taken with `worktree add` (never the stash, which is repository-wide): **battery 195/195
suites · 12,101 assertions**, baseline **195/195 · 12,100 · 261.8 s**, final 247.3 s. **THE +1 IS
ATTRIBUTED PER SUITE BY RE-RUNNING THE BASELINE AND DIFFING THE PER-SUITE LINES, NEVER BY
SUBTRACTION: `planning-hygiene.test.mjs` 285 → 286**, the one suite with a per-DEBT-row assertion,
and it is the new `D-365` row passing that suite's hygiene rules. Every other one of the 193
reporting suites is unmoved. `node scripts/coverage.mjs --strict` run DIRECTLY from `bio-plane/`,
`$?` read with nothing piped after it: **exit 0** (provenance: 203 of 203 discovered items in the
commit at HEAD). `node civicos-ui/test/run.mjs` from the REPO ROOT, unpiped: **exit 0**, all
harnesses green. `node tools/plancheck.mjs --local`: **0 fail, 0 warn** — design corpus 50 governed
documents, 0 front-matter failures; decided index current (895 rulings, 251.8 KB, regenerated not
authored). **NO FLOOR MOVED, and none was owed:** this item adds no op, no check and no control, so
`REGISTER_FLOOR` in `bio-plane/scripts/coverage.mjs` was READ and left byte-unchanged; no `.mjs`
file in this repository is touched by this commit.

**BASELINE CORRECTION WORTH CARRYING.** The first baseline run read **194/195 · 12,024** and named its
own cause: `ocr-worker/ocr-worker.test.mjs` SKIPPED, *"cannot resolve 'miniflare' — run `npm ci` in
ocr-worker/"*. That is CLAUDE.md's fresh-checkout trap **in a new costume** — the rule names
`bio-plane/`, and the scratch baseline had `bio-plane/` installed and `ocr-worker/` not. It cost one
re-run rather than a wrong number ONLY because the runner NAMES its skip in the foot region instead
of scoring it zero. After installing `ocr-worker/` and `pdf-worker/` the baseline read **195/195 ·
12,100 — exactly the brief's figure, confirmed by measurement rather than inherited.** The
76-assertion gap is `ocr-worker`'s suite.

CONTROL ARMS — **NINE, every one armed ALONE with the others held open, declared before arming, and
ALL NINE BEHAVED AS DECLARED.** Each patch applied inside ONE method's segment with its anchor
asserted to match exactly once (an arm that did not arm is a finding), bytes asserted CHANGED, and
`src/store.mjs` restored from a **uniquely-named per-arm** pristine copy verified by sha256 **AND**
`cmp`, byte count printed and floored at 1,000,000 against the real **1,997,832** — **restored
byte-identically: YES, 9 of 9.** A missing foot line would report **-1**, never 0. Clean-tree
baseline `bounds` **162/0** · `meaning-bounds` **92/0** · `derivation-bounds` **42/0**, asserted
green before any arm ran.

| arm | declared | actual |
| --- | --- | --- |
| 1a `resolutionsForCapture` fully uncapped | 17 fail (bounds 4, mb 13) — REC-60's own 2026-08-07 figure | **17 — bounds 4, mb 13, db 0. EXACT** |
| 1b `documentsConcerning` fully uncapped | 16 fail (bounds 4, mb 12) | **17 — bounds 4, mb 12, db 1.** +1, and the extra is `derivation-bounds`, **a suite that did not exist when the figure was declared** (REC-66, 2026-08-08) |
| 1c `connectionsFor` fully uncapped, BOTH arms | 15 fail (bounds 4, mb 11) | **16 — bounds 4, mb 11, db 1.** Same cause |
| 2a `documentsConcerning` `truncated = false` beside a real slice | 4 fail (bounds 2, mb 2) | **4 — bounds 2, mb 2, db 0. EXACT** |
| 2b `resolutionsForCapture` same | 5 fail (bounds 2, mb 3) | **5 — bounds 2, mb 3, db 0. EXACT** |
| 3a/3b/3c the D-227 variant: ONLY the SQL `LIMIT ?` and `cap + 1` removed, envelope left honest, on each of the three | **DECLARED GREEN** — D-227's row predicts it | **FULLY GREEN on all three: 162/0, 92/0, 42/0, zero failing assertions.** AS DECLARED, and it is the finding |
| 4 OVER-STRICTNESS: a COMMENT added inside the governed region | green, and the envelopes unmoved | **162/0, 92/0, 42/0.** Its 6 differing output lines are **all corpus-census lines and nothing else** — `store.mjs 31350 → 31351 lines`, `18,814,670 → 18,814,782` chars, exactly the comment's own bytes. **No assertion moved** |

**THE FAILURES NAME THEIR OP**, which is what makes these pins and not counts: 1a's four `bounds`
failures all read `op=resolutions: …`, 1b's `op=concerns: …`, 1c's `op=connections: …`, and
`meaning-bounds` prints the read back on its BARE roster and fails the RATCHET by name. **That is
also the over-strictness reading the row asked for, taken per assertion rather than per byte:** under
each arm the OTHER two reads' pins stayed green and their envelopes unmoved.

**THE SURPRISING RESULT, RECORDED AND NOT SMOOTHED — rowed as `D-365`.** Arms 3a–3c are the whole
value this item added beyond a disposition. Removing only the SQL bound leaves every walk green, so
**D-225's memory half can regress silently on all three of its own reads**; its honesty half is well
defended (arms 2a/2b fail 4 and 5 assertions by name). **And the sharper half is new:**
`derivation-bounds.test.mjs` PRINTS `… 102 scanning UNBOUNDED …` at baseline and printed **103**
under every arm 3 — **the walk COUNTED the newly-unbounded method and nothing failed**, because that
census carries no ratchet. The instrument is not blind here, it is **ungraded**, which is a cheaper
fix than the live row-source assertion D-227 asked for; both are costed on D-365. D-227 itself was
archived as PARTLY CLOSED **with that residue inside it**, in a ledger nothing drains — that pattern
is delegated to CONDUCT as a candidate rule, not just this instance.

**WHAT THE SWEEP COULD NOT SEE, stated plainly.** The arms drive the three ops through the control
plane and measure the PUBLISHED envelope and the suites' failure to defend the SQL bound. They do NOT
measure memory or latency inside the Durable Object under an unbounded scan, and they do NOT reach
`connectionGradeForContent` (FW-17's `content=` arm), which has no roster entry of its own — that arm
was READ, not DRIVEN, and is named here rather than scored. `REGISTER_FLOOR` was read and not moved,
so no floor figure in this release line is a re-measurement of one.

**RE-RUNNING THIS IN ONE STEP.** No new `NEGATIVE CONTROL:` line was added because no suite changed:
the recipe is already at `bio-plane/test/bounds.test.mjs:14` and `test/meaning-bounds.test.mjs:89-105`,
and **it still reproduces to the assertion 38 days later** — which is itself the finding that a
recorded control is worth writing. The D-227 variant (arms 3a–3c) is the one shape those lines do not
carry; `MEASUREMENTS.md` 2026-09-14 · REC-89 carries it, with the segment-scoped patch method in full.

**FOUR DELEGATIONS FOLLOW THIS BLOCK**, each an ACT with an actor rather than a note: the framework
document's "uncapped" row, `INVESTIGATIVE-SESSION.md` §14c's present tense, the four QUEUE acts
(including that **REC-90 is unblocked now**), and D-365 wanting a row.

## DELEGATION 2026-09-14 RECORD (REC-89) → CONDUCT (answering-for FRAMEWORK, dormant): **`BIO_Content_Framework_v0_10.md` Part II STILL CALLS D-225's THREE READS "UNCAPPED", AT LINE NUMBERS ~3,000 LINES STALE — AND THAT SENTENCE IS PART OF WHY THIS ITEM EXISTED**
The row, verbatim, in the Part II "where" table (the row after `the MEANING arm (D-222 option A)`):

    | fixed-key reads, uncapped (D-225) | `documentsConcerning` `store.mjs:12712`; `resolutionsForCapture` `:12685`; `connectionsFor` `:12944` |

**Both halves are false, measured in this worktree on `origin/main` at `f38af22`.** (a) The three
are not uncapped: they clamp to 500/5000 and publish `limit` after clamping beside `truncated`, and
have since **REC-60 on 2026-08-07** under `IC-25` (SETTLED, I3 → 10.0.0). (b) The line numbers are
stale by about three thousand lines — the real sites are `resolutionsForCapture` **:14113**,
`documentsConcerning` **:14141**, `connectionsFor` **:14454** (`store.mjs` is 31,349 lines). The
row beneath it, `D-222's staging and D-225's caps → DEBT.md:176, :179`, still resolves, but `:179`
now points at a row this item CLOSED.

**THE ACT, and its actor.** CONDUCT (or FRAMEWORK if it wakes) corrects that row to say the caps
LANDED, names `IC-25` rather than `D-225` as the authority, and — per CLAUDE.md's own rule that *a
citation into a design document names the SECTION, not a line* — replaces the three line numbers
with method names, which do not go stale. **This is CAP-8's precedent on the same document, the
same day, and it is followed deliberately rather than reasoned afresh: the design document is not
a worker's to edit.**

**WHY IT MATTERS BEYOND TIDINESS.** This is the second document (with `DEBT.md` D-225, now closed)
whose staleness fed `CONTENT-SEARCH-DESIGN.md` §7 row 1, which became this queue item. A worker
slot was spent confirming that already-shipped work had shipped. Leaving the framework row as it
stands re-arms exactly that.

## DELEGATION 2026-09-14 RECORD (REC-89) → CONDUCT: **`INVESTIGATIVE-SESSION.md` §14c's "Related finding" SAYS IN THE PRESENT TENSE THAT THE THREE READS "ARE UNCAPPED"**
`docs/development/INVESTIGATIVE-SESSION.md`, §14c, the paragraph beginning **"Related finding, now a
debt row (D-225)"**: *"the existing meaning-layer reads — `concerns`, `resolutions`, `connections` —
are **uncapped**"*. Present tense, and false since 2026-08-07. It is one of the two sources
`CONTENT-SEARCH-DESIGN.md` §2 and §7 row 1 cite for this precondition, so it is the other half of
the same stale citation chain.

**THE ACT, and its actor.** CONDUCT moves that sentence to the past tense and names REC-60/IC-25,
the way a superseded claim is CORRECTED rather than deleted (CLAUDE.md). Not taken here because
§14c is the investigative-session design's own analysis and this item's claim does not name it.

## DELEGATION 2026-09-14 RECORD (REC-89) → CONDUCT: **THE QUEUE ACTS THIS ITEM OWES, STATED AS ACTS WITH ACTORS RATHER THAN LEFT IMPLIED**
`QUEUE.md` is CONDUCT's, sole writer, so none of these is taken here. Each is an ACT, not a note.

1. **Flip `### REC-89`** from `running`. Its scope was discharged by REC-60 five weeks before the
   row was written; the landing is a VERIFICATION plus a disposition, and the row should say that
   rather than reading as a build.
2. **`### REC-90` says "waits on REC-89, REC-83 and REC-84 (both landed)".** REC-89's dependency is
   satisfied and was satisfied before REC-89 was spawned. REC-90 is unblocked NOW.
3. **`CONTENT-SEARCH-DESIGN.md` §7 rows 2–6 were rowed from the same table.** Row 1 arrived already
   built. **Nothing checked the other five against the tree**, and this item did not check them
   either — it is out of its scope and saying so is the honest boundary. Recommended act: before
   spawning any of REC-90 / the §7 item-3..6 rows, grep the tree for the symbols each names. Row 3
   is a measurement item, rows 4–6 are genuinely unbuilt as far as this worker could see from
   `capture_text` having no occurrence in `bio-plane/src/`, but that is one grep and not a sweep.
4. **`D-365` is new and OPEN** (`DEBT.md`), with two costed remedies and RECORD as owner. It wants a
   queue row. It is D-227's residue, measured on all three of D-225's reads, and D-227 itself was
   archived as PARTLY CLOSED **with that residue inside it** — in `docs/archive/ledgers/DEBT-closed-2026-08.md`,
   which nothing drains. **That archiving pattern is the finding, not just this instance:** a row
   closed with a "WHAT REMAINS" clause moves to the archive and the remainder leaves the working
   set silently. Worth a rule in `kickoffs/CONDUCT.md` — a row with live residue does not archive
   until the residue is its own row.
5. **Two minted D ids were burned and are unused: the two allocations before `D-365`** (the tool
   reported stepping over 358–364, of which two were this session's own). Gaps cost nothing by the
   tool's own statement; recorded because an unexplained gap is otherwise a puzzle for the next
   reader of the ledger.
