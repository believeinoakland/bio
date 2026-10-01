# conformance (T19)

**Status** · session_01CaezPCPqZa9SnQsXoxH3V1 · depth 2 · COMPLETE · handled B1

## Completion (CONFORMANCE #7, 2026-10-01)

**Entries applied** (`build/plan/current.md` layer 9; BOB's B1):
- **N433 (K766, K768), R23.** `checks.mjs`: `BAD_REASON` → `CONFORMANCE_BAD_REASON` (C-113.17) and `NO_REASON` → `CONFORMANCE_NO_REASON` (C-113.22), each row's number, `where` and translation unchanged; `index.mjs` `#supersession` answers them (R7). The module holds no row named `NO_REASON` or `BAD_REASON`. **Changed rows, `awaiting stamp`:** C-113.17 and C-113.22 (code renamed; number, `where`, translation unchanged).
- **Rule 1.** `src/conformance/index.mjs`:50 (`isMachineIdentity`, `proposalLabel`, `normalizeType`, `deriveInquiryTitle`), `test/m/conformance/fixture.mjs`:23 (`parseFrontmatter`) and `record.test.mjs`:8 (`proposalLabel`) import `src/record-grammar/index.mjs` (the same functions the catalogue re-exported). No conformance file imports `bio-checks.mjs`.
- Kept (catalogue re-points, code and tests): nothing else in the entry left to do; ⚑L9 and the K680 arm were already met (B1).

**Requirements met, and their tests** (for BOB to strike the marks, K775 (6)):
- **R23**: `determine.test.mjs` "R23: a supersession with no reason is CONFORMANCE_NO_REASON (C-113.22), one over 500 characters or not text CONFORMANCE_BAD_REASON (C-113.17) …" (rows and translations as before, no `NO_REASON`/`BAD_REASON` row, every absent and malformed reason, through the op, the control at the bound).
- **R7** (its "not yet met: T19 layer 9" mark): `determine.test.mjs` "R7 R19 R20: a determination is never edited; … with a reason, and both reads name the link" (now asserts the two codes).

**Deferred:** none.

**Found in other modules (REPORT J1):**
1. **affordances** (`src/affordances.mjs`:486 `JUSTIFICATION_REFUSALS`; comment :807–809): lacks `CONFORMANCE_NO_REASON`, so `test/m/affordances` "R19: determine, graded `reasoned` (N310) …" turns red with this change (it expects the supersession's no-reason refusal to be in that list). The fix is affordances' (L11): add `CONFORMANCE_NO_REASON` and re-word the comment's `NO_REASON` (conformance R7). `INTENT_NO_REASON` (intent R30, T19 L7) is not in that list either.
2. **Requirements text (BOB's):** `conformance.md` Private Uses still names `legacy-checks` for `isMachineIdentity`, `proposalLabel`; they are read from `record-grammar` now (modules.json `uses` lists both). R12 also cites "`legacy-checks`' `proposalLabel`".
3. Pre-existing reds, unchanged by this job (same set before and after, `git stash` comparison): consequences 7 tests (R5, R8, R9), affordances 4 others (R19 ×3, R8 R18 contradictionresolve), control-plane 1 (R22 CHECK_FAMILIES totality).
4. Old suites naming the shared codes (`civicos-ui/check-refusal-codes.mjs`, `bio-plane/src/gate.mjs`:287–292 comments) are legacy-tests'/release's (K619); not touched.

**Tests and checks run:**
- `node --test bio-plane/test/m/conformance/`: tests 49, pass 49, fail 0 (baseline before the change: 48/48).
- Modules that use conformance (`uses`): consequences 17 pass / 7 fail (pre-existing), actions 61/0, action-clocks 20/0, filings 45/0, escalation 32/0, action-plans 38/0, affordances 118/5 (1 new, REPORT J1; 4 pre-existing), control-plane 84/1 (pre-existing); plane has no tests directory. Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … conformance`: 9 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs … conformance`: 23 of 23 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … conformance tranche/T19`: 6 files changed; 0 failures.

Size (session_01CaezPCPqZa9SnQsXoxH3V1): test runs 22, module lines 1481

## J1 · REPORT

Another module: affordances (src/affordances.mjs:486 JUSTIFICATION_REFUSALS, comment :807-809) lacks CONFORMANCE_NO_REASON, so test/m/affordances 'R19: determine, graded reasoned (N310) ...' goes red with R23 (the supersession's no-reason refusal is not in the list). Fix is affordances' L11 job: add CONFORMANCE_NO_REASON, re-word the comment's NO_REASON. INTENT_NO_REASON (intent R30) is missing from that list too. Requirements text (BOB's): conformance.md Private Uses and R12 still name legacy-checks for isMachineIdentity/proposalLabel; they come from record-grammar now. Details in my record.

## J2 · COMPLETE

Applied: N433/R23 (CONFORMANCE_NO_REASON C-113.22, CONFORMANCE_BAD_REASON C-113.17, rows and translations unchanged; awaiting stamp) and rule 1 (index.mjs:50, fixture.mjs:23, record.test.mjs:8 import record-grammar; no conformance file imports bio-checks.mjs). Met: R23 (determine.test 'R23: a supersession with no reason is CONFORMANCE_NO_REASON ...'), R7 (determine.test 'R7 R19 R20: ...'). Deferred: none. Tests 49/49; format, architecture, coverage (23/23), ownership: 0 failures. One new red in affordances (REPORT J2). Size (session_01CaezPCPqZa9SnQsXoxH3V1): test runs 22, module lines 1481.
