# case-authoring (T19)

**Status** · session_01X5kyuW5oGu2eZcsVqkHj8k · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

CASE-AUTHORING #9 applied B1 in one pushed commit on `job/T19/case-authoring`, with `tranche/T19` (3c731d90b5) merged first.

**Entries applied (layer 8, case-authoring):**
- **Rule 1, the catalogue re-points.**
  - `src/case-authoring/document.mjs` now reads `createSha256` and `EARNED_CAPTURE_CEILING` from record-grammar.
  - `src/case-authoring/index.mjs` now reads `parseFrontmatter`, `normalizeType`, `isMachineIdentity`, `OBJECT_TYPES`, `BASIS_GRADES` and `EARNED_CAPTURE_CEILING` from record-grammar. `createSha256` was imported there but never used, so it is dropped.
  - In the tests, `fixture.mjs` (`parseFrontmatter`) and `preflight.test.mjs` (`EARNED_CAPTURE_CEILING`) now read record-grammar.
  - `fences.test.mjs` now reads membership's `PROJECT_VISIBILITY_CHECKS` (K637's wait ends).
  - `invariants.test.mjs`: I dropped the catalogue walk. In its place it asserts that each code and each check id is held once across this module's four families.
  - No case-authoring file imports `bio-checks.mjs` now. The header comment in `index.mjs` (:13) is re-worded to say "the check catalogue".
  - `checks.mjs`' comments now say the C-32.6 and C-33.14 copies were stamped by promotion (1.49.0) and that the module reads no catalogue.
- **N424.**
  - `#reauthorAcknowledgements` finds its two runs with case-grammar's `SECTIONS.acknowledgements`. This is the same locator `reauthorSection` splices with, and it replaces the hand-written copy.
  - `document.mjs` imports case-grammar's `fmSafe` and re-exports it, so the module's export list is unchanged.
- **N435 (R34 as folded).**
  - `op=publishpreflight` reads the door's `aiCred` stamp: `viewer: q("aiCred") ? {stamp: q("viewer"), aiCred: JSON.parse(q("aiCred"))} : q("viewer")`.
  - An `aiCred` that does not parse becomes `{}`. It still marks the caller as an agent, so the fences fail closed.
  - `publishPreflight` runs the act and its other reads with the stamp alone. It hands the whole `{stamp, aiCred}` to `ratification.caseRatifyPreflight`.
- **K789.** The fixture now builds the real `credentials` module (`credentialsOf(host, {record, membership}).migrate()`) after membership. The one accepted red (preflight.test.mjs:406, "against the real ratification R18") is green again. No fixture claims through membership, so no claim needed re-pointing.
- **Old suites:** none deleted (K619).

**Each R met and its test (BOB strikes the marks, K775 (6)):**
- **R34 (N435):** `preflight.test.mjs`, test "R34 (N435): an agent credential's stamp …".
  - A member-scoped agent credential is minted through credentials. Its stamp `{stamp: member:alice, aiCred}` yields `MACHINE_CANNOT_RATIFY_CASE` (C-32.13) and `OPERATOR_TOKEN_CANNOT_RATIFY_CASE` (C-32.15) in step 5 and in `blockers`.
  - The member's own stamp yields neither (the negative control). Every other refusal is the same for both, and the act and R32's read are asked as the stamp.
  - The list equals what ratification answers over the stored text for that viewer.
  - Through the route, the door's `aiCred` gives the same answer, no `aiCred` gives the member's, and `aiCred=not-json` is still fenced.
  - With the fix reverted, this test fails.
- **Uses `case-grammar` (N424):** `statement.test.mjs` R20 tests, which re-author an unsigned document through the locator (the hash moves, and only the list's two runs change), plus every test that renders a document through `fmSafe`.
- Every other R was already met and still passes.

**Deferred:** none.

**Found in other modules (not mine to change):**
- `test/system/hygiene.test.mjs` fails 4 checks and `test/caseproduction.test.mjs` fails 6 (`store.mjs` locators, and `record.registerAuditFinding is not a function` in its promote fixture). Both counts are the same on `tranche/T19` without my change, so they are not this job's. They belong to legacy-store or legacy-tests (old suites, K619).
- `credentials` is imported only by the fixture, as the module's `uses` already lists it.

**Tests and checks:**
- `node --test bio-plane/test/m/case-authoring/`: tests 80, pass 80, fail 0.
- Users of this module: `test/m/review/`, `test/m/affordances/catalogue.test.mjs` and `test/system/hygiene.test.mjs` together: 72 tests, 71 pass. The one failure is hygiene's, the same on the baseline (above). `civicos-ui/test/statement-ack.test.mjs` (reads this module's source): 28 pass, 0 fail.
- format: 87 modules, 82 requirements files; 0 failures.
- architecture: 15 product files, 76 relative imports; 0 failures.
- coverage: 37 of 37 live requirement ids named by a test; 0 failures.
- ownership: 8 files changed; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01X5kyuW5oGu2eZcsVqkHj8k): test runs 7, module lines 152 (98 added, 54 removed)
