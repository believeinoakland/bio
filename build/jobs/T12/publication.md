# publication (T12)

**Status** · session_01GtUyriTrU5JUMCnTqxaFb9 · depth 2 · WORKING · handled B1

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
