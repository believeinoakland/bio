# ratification (T12)

**Status** · session_01WpDgkzKHXhpC2PuizXicGz · depth 2 · COMPLETE · handled B1

### Completion (RATIFICATION #4)

**Entry applied.** N308: R5's scope arm (`publish`, D-431 (b)) reads `publication.ratifiedFindingsRestingOn(id, {after})` (publication R38 as worded on `tranche/T12`, K380) from the start through each `cursor` to null, asking `caseAuthority` once per resting project as it first appears, and reads no further once one admits the act. With none admitting it pages to the end and answers what the whole list answered: the refusal of the first project in id order, naming every finding of that project that rests on the bundle; with no resting finding at all, C-58.2 / C-58.3 as before.

**Built against a local stub** of R38's cursor answer (`test/m/ratification/fixture.mjs`, `restingPage`: pages of at most 1,000 pins, `cursor` `<case>#<member>#<sha>` or null; a bundle with no steered list falls through to the real read, an array answer wrapped as one page). Publication's R38 is not yet changed on `tranche/T12` or `job/T12/publication` (still returns an array), so against the real read the arm throws (`page.findings` undefined). Awaiting BOB's CHANGE to merge the tranche and run against the real read.

**Tests** (`test/m/ratification/finding-commit.test.mjs`, three new, R5): 2,500 pins with the admitting project on the third page (three reads: null, then each cursor), and every pin empty over 2,001 / 1,001 pins answering C-58.3 / C-58.2; stops after the first page when a first-page project admits, after the second when the first-page project refuses; the paged refusal (3,000 pins, 4 findings over 3 pages) deep-equals the refusal of the same findings in one page.

**Runs.** `node --test test/m/ratification/`: 70 pass, 0 fail. Checks: format 0 failures; architecture 0 failures; coverage 16 of 16 live ids named, 0 failures; ownership 0 failures (after reverting my strike of R5's `not yet met: N308` in `build/requirements/ratification.md`, which is outside my paths: BOB strikes it).

**Legacy suites** (legacy-tests', reported): `test/ratify-authority.test.mjs` 35 pass, 18 fail on this branch (53/0 on `tranche/T12`): every evidence arm answers `STORE_DID_NOT_ANSWER` because the real R38 still returns an array; expected green once publication's R38 lands, to be re-run on the CHANGE. Its control `ratify-authority.control.mjs` anchors `RESTING` (`const resting = this.publication.ratifiedFindingsRestingOn(bundleId);` + `if (!resting.length) {`) for arm `readmit-unpinned-finding`; that text is gone and the arm needs re-anchoring on `if (!byProject.size) {`. `test/derivation-bounds.test.mjs` red on both (same FAIL lines as the tranche; N315's). `test/caseobject.test.mjs` 19/0.

**Grep.** No name added or retired: `civicos-ui/` and affordances have no hit for `ratifiedFindingsRestingOn`. No catalogue row changed (nothing for promotion R34). No generated artifact made stale beyond the plane bundle (`not_product`, rebuilt by BOB at layer close).

**Deferred.** None. **Found elsewhere.** None beyond the re-anchoring above.

Size (session_01WpDgkzKHXhpC2PuizXicGz): test runs 6, module lines 3051

## J1 · COMPLETE

N308 applied against a local stub of R38's cursor answer: R5's scope arm pages ratifiedFindingsRestingOn(id, {after}) from the start through each cursor to null, stopping once a resting project admits; outcome unchanged (tested: 2,500 pins over 3 pages; stop at the first admitting page; paged refusal deep-equals the one-page refusal). Module tests 70/0; format, architecture, coverage (16/16), ownership 0 failures. Pending your CHANGE: publication's real R38 still returns an array, so legacy ratify-authority is 35/18 on this branch (53/0 on the tranche) until it lands; I re-run then. Reported: ratify-authority.control's RESTING anchor (arm readmit-unpinned-finding) needs re-anchoring (legacy-tests'); R5's 'not yet met: N308' mark is yours to strike (outside my paths). Record: build/jobs/T12/ratification.md.
