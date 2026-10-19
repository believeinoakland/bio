# screens-wizards (T51)

**Status** · session_01M31mHwuWGwKStqD3B57zBx · depth 2 · WORKING · handled B1

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
