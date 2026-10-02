# ratification (T22)

**Status** · session_01CMHTBkj1pAWW9cB4KrLMHK · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three questions; I carry on with each on the reading given, and none stops the job.

(1) R22, the contested arm: as you foresaw, `contradiction.candidatesFor` withholds from a null viewer what the plane holds. It skips every candidate whose side lives in a bundle the viewer may not see, and membership R43 lets an absent viewer see nothing. My reading: the examination reads as the plane with the viewer `class:daemon`, the plane viewer intent, monitoring and connections already use, which R43 lets see every bundle. The refusal and capture's reason name only the member ids, never a side. Two consequences of that reading, also mine unless you say otherwise. (a) "Of any weight" is `lead`, `duty` or `plurality`. A `not_shown` candidate (labels `precision`, `unrelated`, K5 unmeasured) is skipped by `candidatesFor` for every viewer and is not a contradiction touching the document. (b) A read that answers `undetermined` (the read failed), or that is truncated with none found, counts the document contested (fail closed), with a reason saying the contradiction read was undetermined.

(2) R35 in the act (R2): `op=caseratify`'s Worker half reads only publication's `casedocfacts` before the signature. No hop in R32's map can ask `strength` between C-92.11 and `CASE_RATIFY_STALE`. My reading: R32's map gains one internal arm, `casetestimony` (the body's `caseId` and `edition`). It answers `{ok: true, refusal}`, where `refusal` is null or the very object the pre-flight builds (one builder in `refusals.mjs`), and the Worker relays it as it relays C-92.11 (409, plus `store` and `tokenClass`). This needs R32's wording to name the arm. Nothing outside ratification calls it.

(3) R35, "at its pinned bytes": `strength.testimonyCorroboration` reads an inquiry's live basis or a named reading, never the bytes at a sha. My reading: it asks each roster member's live basis, with `levels` from `publication.attributionFacts(...).current` (only `group` and `project` are answered), and viewer `class:daemon`. The pre-flight runs before anyone signs, so the act and the pre-flight need one viewer to stay byte-identical, and an unseen leg never corroborates. A member whose head has moved past its pin is judged on its head. The alternative is the reading the case document records for the member (`case_conclusions[].version`), passed as `version`. Say if you want that one.

Also noted, no answer needed now: C-41.16 waits for your CHANGE announcing case-grammar's merge (`whatChangedOf` is not on the tranche yet). `case-grammar` is not in my `uses`, so I will read it through publication's re-export if publication carries it. If not, I will ask.

## J2 · REPORT

Progress, and what I wait on. Branch `job/T22/ratification` @ HEAD, pushed.

Done (each with tests at the interface, `test/m/ratification/` 190/0):
- R22 and R34 (START (1), (2)). One examination of a document (`release.mjs` `examineMember`) is shared by the release and capture's `batch-examination` reader, registered at start in `ratificationOf`. The contested arm reads as the plane (`class:daemon`, K1074) and fails closed. `CONTESTED_IN_BATCH` (C-58.4) comes after `CRUCIAL_IN_BATCH` and before `ENTRY_REQUIREMENTS`. The reader's `class` is R22's refusal code and its `reason` is the refusal's detail.
- R35 (START (4)). `ANONYMOUS_TESTIMONY_UNCORROBORATED` (C-58.5) follows C-92.11 in the act (through the store-half `casetestimony`, K1074) and in the pre-flight. One builder makes it, so the two are byte-identical. Each member is judged at its recorded reading.
- R36 (START (5)). `levelMoved` is told inside `ratifyCaseDocument`'s transaction, after the discharge. It is read from the levels the two signed documents state (`observation_attributions`).
- R14 (START (6)). C-58.4 and C-58.5 are new rows of `RATIFY_SCOPE_CHECKS`, with R14's translations word for word, **awaiting stamp**. No other row changed.
- START (7). `ops.mjs` `Store#gateFacts` and `checks.mjs` `Store#publish` are re-worded to this module's own `gateFacts` and `publish`. The `publishCase` and `store.mjs` mentions that read as live are re-pointed to case-authoring and affordances. Provenance notes stay.

Size: 3,922 lines (from 3,770). C-41.16 is all that is left, about 15 lines.

Users' suites, interim (START (8) list plus capture, strength, contradiction, provenance and bundler; 1,246 tests). My branch and `tranche/T22` fail the same 4 tests: promotion `registry.test.mjs`:58 (accepted red 4's kind, `MODULE_ORDER`), control-plane `doorbell.test.mjs`:310, case-authoring `members.test.mjs`:98/129 (K1065), and membership's module-order test. No new red. I will re-run them, with the whole `test/m`, after C-41.16, and name C-41.16's reds before my merge.

Bundle: `src/ratification/` changed, so `bio-plane/dist/bio-plane.bundled.mjs` is stale. I regenerated nothing.

Waiting on: your CHANGE announcing case-grammar's merge (START (3)).

## J3 · COMPLETE

Branch `job/T22/ratification`, pushed. `tranche/T22` merged in at B4 (case-grammar's merge, K1075).

**Entries applied** (`build/plan/current.md` T22 L8, ratification). Each mark below is met; the module's tests name each.
- **R22** (START (1); DEC-97 (3)): the contested arm. One examination (`release.mjs` `examineMember`) counts each member under the first class it fails: absent or not `information`, not `collected`, `crucial`, contested, then the entry requirements.
  - Contested: a `contradiction.candidatesFor({on: {bundle}, state, viewer: "class:daemon"})` candidate is in state `open`, `explained_not_shown` or `taken_up`.
  - The read is the plane's (K1074), so a side no member may see still bars the batch, and no side is answered.
  - It fails closed: a read that fails, throws, answers `undetermined` or `ok: false`, or is truncated with none found, counts the document contested.
  - The batch is refused whole with `CONTESTED_IN_BATCH` (C-58.4), offenders as sorted ids. It comes after `CRUCIAL_IN_BATCH` and before `ENTRY_REQUIREMENTS`.
  - `release` reaches `contradiction` lazily, so a refusal before the examination never constructs it.
- **R34** (START (2)): the same function is registered once, at start, in `ratificationOf` as capture's `batch-examination` reader (`d.capture`, else `captureOf(host)`).
  - It answers `{eligible: true}`, or `{eligible: false, class, reason}`.
  - `class` is R22's refusal code (`CONTESTED_IN_BATCH`, `CRUCIAL_IN_BATCH`, …) and `reason` is the refusal's own `detail` (`CLASS_REASONS`, exported). So the list and the release give one class.
- **R8** (START (3); DEC-101 (2)): C-41.16 (`CASE_DOCUMENT_FAMILY.WHAT_CHANGED`) finds an edition above 1 whose statement, read through case-grammar's `whatChangedOf`, is absent or blank.
  - Its message is R8's translation, word for word.
  - It is asked only when the caller supplies the body, as C-3.1 is. `caseGate` and the pre-flight both supply it, so `op=caseratify` (R2's `GATE_REFUSED`) and R18 refuse it alike.
  - **Note for you:** `whatChangedOf` answers null for any format but `/5`, so an unsigned `/4` (or older) edition 2 is refused C-41.16 too. That is the literal reading of R8; re-publishing authors a `/5` document. Say if older formats should be exempt.
- **R35** (START (4); DEC-102): `ANONYMOUS_TESTIMONY_UNCORROBORATED` (C-58.5) is built by one builder (`refusals.mjs` `anonymousTestimonyRefusal`) and placed after C-92.11 in R18's pre-flight and in the act.
  - The act reaches it through the store-half arm `casetestimony` (R32, K1074), which the Worker relays as it relays C-92.11 (409, with `store` and `tokenClass`).
  - Levels come from `publication.attributionFacts(...).current`. Only `group` and `project` are asked; with none, strength is not asked.
  - Strength's `testimonyCorroboration` is asked per roster member at the reading the document records (`case_conclusions[].version`; the live basis only where it records none, K1074), with viewer `class:daemon`.
  - The refusal names `{member, observation}`, never an author, and gives the three ways forward.
- **R36** (START (5); DEC-102): inside `ratifyCaseDocument`'s transaction, after `dischargeCaseFlags`, `reevaluation.levelMoved({observation, from, to, case, edition, at})` is called once per observation.
  - It is called for an observation whose level in this edition's signed `observation_attributions` differs from the level in the previous ratified edition's.
  - A first edition, an observation the previous edition did not reach, an unchanged level, a retry (`existed`) and a refused or failed commit tell nothing.
- **R14** (START (6)): C-58.4 and C-58.5 are new rows of `RATIFY_SCOPE_CHECKS` with R14's translations word for word. C-41.16 is a catalogue arm. **All three are awaiting stamp.** No other row changed.
- **START (7)** (PROMOTION #23's J1 (3)): the live-sounding legacy names are re-worded:
  - `ops.mjs` `Store#gateFacts` becomes this module's `gateFacts` (R7).
  - `checks.mjs` `Store#publish` becomes this module's `publish` (R5).
  - `checks.mjs` "publishCase()… at store.mjs" becomes case-authoring's `publishCase`.
  - The `index.mjs` comparison header now names case-authoring's `publishCase` and affordances' `#editionWarrantedForJoinedProjectOf`.
  - Provenance notes ("extracted from", "measured before") stay.

**Deferred:** none.

**Found in other modules:** none beyond what you already carry.
- Contradiction's tables exist only after its `migrate()`, so a fixture world without them reads every document contested, by design. My own fixtures migrate them.
- No other module's suite went red from that.

**Users' suites and the whole `test/m`** (START (8)). My branch and `tranche/T22` @ d78da34634 ran on the same machine:
- My branch: 4,908 tests, 4,877 pass, 12 fail.
- Tranche: 4,886 tests, 4,852 pass, 15 fail.
- **No new red.** C-41.16 turned none of the named callers' tests red: public-read, promotion, admission, affordances, review, reevaluation, filings, conformance, plane, control-plane, `caseceremony.mjs` and `conclude-project.test.mjs` all pass, apart from the reds already accepted.
- My 12 failing tests, each already accepted by name:
  - actions `t18.test.mjs`:299
  - case-authoring `members.test.mjs`:98 (K1065)
  - control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310
  - membership `module-order.test.mjs`:12 and `t9-notice-sight-bounds.test.mjs`:185 (accepted red 4)
  - promotion `registry.test.mjs`:58 (accepted red 4's `MODULE_ORDER`)
  - queue-producers `proposals.test.mjs` :78, :124, :153, :167
  - scheduler `plane.test.mjs`:85
- The tranche's 3 extra failures are environment-only (extraction `convert-tiers`, `staffdirectory`, test-support R2:249).
- `test/system/row-census.test.mjs` is red on both (accepted red 3). Mine adds C-41.16, C-58.4 and C-58.5 to its rows awaiting stamp.
- capture's held list now answers real eligibility where both modules boot (`test/m/capture/` 0 new red).

**Tests and checks:**
- `bio-plane/test/m/ratification/`: 192 tests, 192 pass, 0 fail.
- `node checks/format.mjs`: 86 modules, 0 failures.
- `architecture.mjs bio ratification`: 0 failures.
- `coverage.mjs bio ratification`: 36 of 36 live requirement ids named by a test, 0 failures. R34, R35, R36 and R8's C-41.16 arm are each named in real tests.
- `ownership.mjs bio ratification tranche/T22`: 15 files, 0 failures.

**Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (`src/ratification/` and the new imports). I regenerated nothing.

**Size:** ratification is **3,936 lines** (from 3,770; under 4,000).

Size (session_01CMHTBkj1pAWW9cB4KrLMHK): test runs 24, module lines 3936
