# publication (T12)

**Status** · session_01GtUyriTrU5JUMCnTqxaFb9 · depth 2 · WORKING · handled B3

## J1 · REPORT

R38 (N308) is built and pushed on `job/T12/publication` @ c940f21c91, ready to merge early for ratification. `ratifiedFindingsRestingOn(id, {after, limit})` → `{findings: [{case_id, finding, project}], limit, cursor}`; `RESTING_PINS_MAX` = 1,000 exported; cursor `<case>#<member>#<sha>` (a bare case id as `after` starts after that case). Tests in `test/m/publication/relation.test.mjs` (the limit, pages of 1 and 2, a page with no finding while `cursor` is set, 1,001 pins at the ceiling, writes nothing). Module suite 64 pass / 0 fail / 2 todo (R44–R47 not yet in).

The return changes from an array to an object, so until ratification applies its R5: `src/ratification/index.mjs`:782 reads `resting.length` (now undefined, so every evidence bundle would be refused `RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE`), and its test fixture `test/m/ratification/fixture.mjs`:123 falls back to the real read with the old one-argument call. Ratification's suite is 67/0 today because its evidence arms use the stub. The legacy suites `test/ratify-authority.test.mjs` and `test/caseobject.test.mjs` drive op=ratify on the plane and are likely red until then (legacy-tests' if they need re-anchoring).

R38's `*(not yet met: N308)*` is struck. I left `*(not yet met: K240)*`: `pinnedCaseEditionsOf` and `caseClaimsOf` have no LIMIT (each is bounded only by the case editions that pin or prepare one finding). My reading is that this is the bound R38 means, and a cut list would change who may sign. If you agree, strike the mark; otherwise word the bound you want. I'm carrying on with N315 and then N300.

## J2 · QUESTION

N300 (R44–R46): four points where the wording leaves a choice. I am building on the readings below. Answer only where you want a different one.

1. **A case never signed.** R46 draws work products from `cases.project_id`. That row is written only when a case edition's document is signed (R22's `commitCaseEdition`), so a case prepared and never signed would never be a work product, and its `draft` rung could never show. My reading: a work product is a case whose `cases` row names the project, or, for a case with no `cases` row, one whose stored unsigned document names the project as `case_project`. The document is the same R21 row, found with `instr`; there is no LIKE.
2. **The project's `readiness`.** It is `absent` with no work product. Otherwise it is the highest rung any work product has reached. A work product with no rung met reads `none`, and so does the project if all of its work products read `none`. An example: a signed case edition whose members are not all ratified yet, so `published_cases.ratified_at` is null and no unsigned document remains. "Ratified edition" is read as `published_cases.ratified_at` set, as R37, R41 and R43 read it.
3. **Rule 2's order and `basis`.** Held questions are read page by page (500 each, 2,000 at most). Reading stops at the first question the project has `concluded`, and `basis` names that question. If no held question is concluded, a ratified case edition the project owns meets rule 2: `basis` names the first such case by id, at its first ratified edition. `questions` counts only the questions read. `undetermined` (with `at_least`, `questions.truncated: true`) holds only when the 2,000 cap is reached with more questions left, none of them concluded, and no ratified edition. The concluded stance is taken from R41's `stance` (R22's reading), with no second call per question. `basis` is `{rule, question, case, edition}`.
4. **Placing R46's `truncated`.** R44 names no key for it, so I answer `work_products` as the list and add `work_products_limit` (200) and `work_products_truncated` beside it. The store op is `projectstage` with `project` and the stamped `viewer` in its query. The Worker route stays legacy-index's (N321).

## J3 · COMPLETE

**Entries applied** (on `job/T12/publication` @ 6773870ede, tranche/T12 merged in, K395/K396 included):
- **N308 · R38.** `ratifiedFindingsRestingOn(id, {after, limit})` → `{findings, limit, cursor}`. It reads by the pin cursor `<case>#<member>#<sha>`: at most `limit` pins (default and ceiling `RESTING_PINS_MAX` 1,000). Merged early (K395).
- **N315 · R42.** At most 200 findings per capture (`RESTING_FINDINGS_PER_CAPTURE`) in finding id order, with `findings_truncated` on every capture. At most 10,000 per page (`RESTING_FINDINGS_PER_PAGE`), ending at the last capture answered whole. The per-capture counts are read to 201 in SQL, so findings are read only for the captures that are answered.
- **N300 · R44–R47.** `projectStage({project, viewer})` and store op `projectstage` (query `project`, stamped `viewer`), as K396 words them. The fence is membership `sight` / `existenceAct` / `noSuchProject`. Held questions come from basis-versions R41 in pages of 500, 2,000 at most, stopping at the first concluded question. Work products come from `cases.project_id` or an unsigned document's `case_project`, at most 200. Each rung is stated by its own condition. Nothing is stored. New exports: `STAGE_QUESTIONS_MAX`, `WORK_PRODUCTS_MAX`, `PROJECT_STAGES`, `CLOSED_REASONS`, `READINESS_RUNGS`. New uses of existing edges: membership `noSuchProject`, basis-versions `PROJECT_QUESTIONS_MAX`.

**Deferred:** none. R30 and R32 stay `test.todo` with their causes (D-246, K102), unchanged.

**Found in other modules and artifacts:**
- **Ratification.** `src/ratification/index.mjs`:782 still calls `ratifiedFindingsRestingOn(bundleId)` and reads `resting.length` on the tranche. Until ratification's own R5 code merges, `test/ratify-authority.test.mjs` is red on the merged tree (10 FAIL lines, all evidence arms). It was green on tranche/T12 before R38. `test/m/ratification/fixture.mjs`:123's fallback uses the same old call.
- **Stale bundle (not rebuilt).** `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` are stale: `fleetbundles.test.mjs` shows 4 bio-plane FAIL lines. Its agent-worker 143-input pin was already red and is legacy-tests' (CAPTURE #6).
- **derivation-bounds.** Its census ceiling was red on tranche/T12 and is green here, 1/0 (N315 and the bounded work-product reads). legacy-tests should re-measure it on the merged tree.
- **UI and affordances.** grep of `civicos-ui/` and affordances for `projectstage`, `findings_truncated`, `ratifiedFindingsRestingOn`, `restingCapturesOf`: no hits. No check row was added or changed (nothing for N318).

**Tests and checks** (on the merged tree):
- publication 75 pass / 0 fail / 2 todo (77).
- Suites of the modules that use publication: ratification 67/0, case-authoring 39/0, review 29/0, conformance 30/0, filings 34/0, monitoring 51/0/6 todo, reevaluation 49/0, affordances 74/0/1 todo, queue 10/0.
- caseobject 1/0.
- format 0 failures; architecture 0 failures; coverage 47 of 47 live ids, 0 failures; ownership 0 failures (after K395's accepted mark edit was restored to the tranche's).

Size (session_01GtUyriTrU5JUMCnTqxaFb9): test runs 34, module lines 5525
