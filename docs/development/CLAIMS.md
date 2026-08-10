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

## CLAIM 2026-08-09 UI (UI-42 — version review: rotation and diff)
session: ui42-version-review (worktree agent-a8c8ed9c32eb56980)
opened: 2026-08-09T00:00:00Z
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

- `bio-plane/test/hygiene.test.mjs` — the PORT half of the ground check, beside M0-10's `GROUND` regex
- `bio-plane/test/d249-port.probe.mjs` — NEW, the runtime probe (not discovered by the battery)
- `bio-plane/test/d249-port.control.mjs` — NEW, the five negative-control arms (edits real sources; not discovered)
- `docs/development/DEBT.md` — D-249's row (closing), D-281 and D-282 (new)
- `docs/development/MEASUREMENTS.md` — the port figures

Recorded AFTER the first edits rather than before, which is the wrong order and is
stated rather than tidied. No other session held these paths.

---

