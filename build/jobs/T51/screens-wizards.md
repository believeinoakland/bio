# screens-wizards (T51)

**Status** · session_01E5NuDNnu6Tf6sHWb5YMV1j · depth 2 · WORKING · handled B5

## Completion (T51-115)

**Entries applied**
- R18: `plan` is again among the screens that work in a project (`kinds()` in `guide.mjs`); a run's step on `plan` with no project held asks `wizard.subject.project` as a choice of `projectlist` (record data, `cs.choice`) and opens `plan` on the chosen project's id; none draws `wizard.subject.none.project` in its fold and offers Next; the project is kept for the run in page memory. A plan's id is never taken for the project: neither the subject last held on `plan` nor the one the member is on when the screen is `plan` (`open`'s `held` and `here`). The step rings again on `entered` (unchanged) once a plan is opened. The guide draws none of the plan list or none state.
- R19: a step's `draft: {template: <handle>}` reads `templatebyhandle` (`{name: <handle>}`, added to `GUIDE_OPS`) once the step's control is found, places `text` in the act's field by `cs.fill` labelled `screen.guide.draft.template` ("Draft · from your team's template"), blanks untouched; a refusal places nothing, sends no act, and the step keeps its words and label.
- Audit C122 / usability-gaps B-36: the recording list (`recording.pair`, "{i}. {screen}: {act}") rendered at 1280 and 390 px in Chromium with `shell.css`: a `<ul class="mk-list">` drew a bullet before "1." (doubled marker). It is now `<div class="mk-list" role="list">` of `<div role="listitem">`, no marker, the key unchanged. `library.mjs`:73's `role="group"` is an attribute: recorded, nothing to change.
- Words (K3949): the 7 findings were all test copies and one hand-list: `fixtures.mjs`, `guide.test.mjs`, `library.test.mjs`, `page.test.mjs`, `t48.test.mjs` now read each script's name by `said("wizard.<id>.name")` or the fixture's own name; `kit.mjs` assembles its shell-op list from interface-shell's `SHELL_OPS` (K3268). Words check over the module: 0 failures. The module's source held none.
- Tests: `t51.test.mjs` (R18 ×3, R19 ×3, the list marker); `t50.test.mjs`'s R17 "plan is not asked" test removed (R18 replaces it); `t50.test.mjs` R15 and `page.test.mjs` R3 read the list by role.

**Dependency (REPORT to BOB)**: `templatebyhandle` is not in `op-declarations`' `OPS` yet (T51-107's job, which merges before this module, `modules.json` order). The page's `checkGuide` refuses a guide naming an op `OPS` lacks, so 8 of this module's 59 tests (every test that boots the page, and the R19 ones) are red on this branch until T51-107's declaration lands. Verified green (59 pass, 0 fail) with a local, uncommitted, one-line declaration of `templatebyhandle` as a member/admin read, then reverted. I changed nothing in `op-declarations`.

**Label key**: R19 names `wizard.draft.template`; no such key exists in `words.json`. The key whose English is that label is `screen.guide.draft.template` (DEC-252, adopted from this module's rows), used already for the held-label and now for the placed draft. Per R13 the quotation identifies the key by its English, so I used it; BOB confirms.

**Deferred**: none. **Found in other modules**: none besides the dependency above.

**Checks** (process repo): `words.mjs screens-wizards` 0 failures; `format.mjs` 0 failures; `architecture.mjs` over screens-wizards 0 failures (the repo-wide run's one failure is answer-envelope's `page-policy.test.mjs`, not this module); `coverage.mjs screens-wizards` 19 of 19 ids named, 0 failures; `setup-words/build.mjs --check` rows match; `ownership.mjs` 0 failures. Module tests: 59 pass with `templatebyhandle` in `OPS`, 51 pass and 8 fail without it.

Size (session_01M31mHwuWGwKStqD3B57zBx): test runs 10, module lines 888

## J1 · COMPLETE

T51-115 done on job/T51/screens-wizards (record: build/jobs/T51/screens-wizards.md). R18 (plan asks which project, a plan's id never taken for the project), R19 (template draft placed from templatebyhandle), the recording list's doubled bullet+number fixed (rendered at 1280/390), 7 words findings fixed (0 left in the module). Checks green: words, format, architecture, coverage 19/19, ownership, setup-words --check.
TWO THINGS FOR BOB: (1) DEPENDENCY: templatebyhandle is not in op-declarations' OPS yet (T51-107, merges before me). Until it lands, 8 of my 59 tests are red (the page's checkGuide refuses a guide naming an op OPS lacks). With a local uncommitted declaration: 59 pass, 0 fail. I changed nothing in op-declarations; after T51-107 merges into tranche/T51, merge it into my branch and my suite is green. (2) R19 names the label key wizard.draft.template; it does not exist; the key with that English is screen.guide.draft.template (DEC-252) and I used it. Confirm or have the design add the key.

## After B3 (CHANGE, K4093)

Merged `tranche/T51` (op-declarations now declares `templatebyhandle`; no local stand-in was ever committed). Module suite against the real providers: 59 pass, 0 fail. Checks: words (module and whole-repo grep for this module) 0 findings; format, architecture, coverage 19/19, ownership 0 failures; `setup-words/build.mjs --check` reports only the expected stale-rows note, naming an op-declarations row. R19 names `screen.guide.draft.template` (K4069), as used.

Size (session_01M31mHwuWGwKStqD3B57zBx): test runs 13, module lines 888

## J2 · COMPLETE · re B3

CHANGE B3 processed: tranche/T51 merged, suite against the real providers 59 pass, 0 fail (templatebyhandle is now declared). words 0 in the module, format, architecture, coverage 19/19, ownership 0 failures; setup-words --check shows only the expected stale-rows note (an op-declarations row). Pushed. Nothing still fails.

## J3 · QUESTION

Best reading, recorded as screens-wizards R20/R21 (not yet met), carrying on with it:
1. Question and document steps with none held open the MOST RECENT (list `last_updated`) at once, no choice asked (the entry says "with two questions it opens the most recent"). That amends R17's choice for those two kinds (project still asks). Tell me if a choice should stay for several.
2. With none: the step's own `wizard.<id>.step<n>.none.what/.why/.door` where the library has them (only the welcome's step 4 has). Every other question/document step has no `none` words and the design has no generic `wizard.subject.none.question/.document`: those steps draw their own words with Next and navigate nowhere. Design gap to report to the design stream, not mine to fill.
3. The door "Open a question": project choice, then `project` on the chosen project with `promote` rung (act.promote.label.project is "Open a question"); the guide presses nothing.
