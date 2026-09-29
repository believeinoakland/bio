# publication (T12)

**Status** · session_01GtUyriTrU5JUMCnTqxaFb9 · depth 2 · WORKING · handled B1

## J1 · REPORT

R38 (N308) is built and pushed on `job/T12/publication` @ c940f21c91, ready to merge early for ratification. `ratifiedFindingsRestingOn(id, {after, limit})` → `{findings: [{case_id, finding, project}], limit, cursor}`; `RESTING_PINS_MAX` = 1,000 exported; cursor `<case>#<member>#<sha>` (a bare case id as `after` starts after that case). Tests in `test/m/publication/relation.test.mjs` (the limit, pages of 1 and 2, a page with no finding while `cursor` is set, 1,001 pins at the ceiling, writes nothing). Module suite 64 pass / 0 fail / 2 todo (R44–R47 not yet in).

The return changes from an array to an object, so until ratification applies its R5: `src/ratification/index.mjs`:782 reads `resting.length` (now undefined, so every evidence bundle would be refused `RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE`), and its test fixture `test/m/ratification/fixture.mjs`:123 falls back to the real read with the old one-argument call. Ratification's suite is 67/0 today because its evidence arms use the stub. The legacy suites `test/ratify-authority.test.mjs` and `test/caseobject.test.mjs` drive op=ratify on the plane and are likely red until then (legacy-tests' if they need re-anchoring).

R38's `*(not yet met: N308)*` is struck. I left `*(not yet met: K240)*`: `pinnedCaseEditionsOf` and `caseClaimsOf` have no LIMIT (each is bounded only by the case editions that pin or prepare one finding). My reading is that this is the bound R38 means, and a cut list would change who may sign. If you agree, strike the mark; otherwise word the bound you want. I'm carrying on with N315 and then N300.
