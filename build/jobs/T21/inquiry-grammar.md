# inquiry-grammar (T21)

**Status** · session_01Cy3dA1Gy1X7veKwXKWiD8g · depth 2 · RUNNING until 2026-10-01T19:14:00Z (node --test test/m) · handled B1

INQUIRY-GRAMMAR #3, module job for `inquiry-grammar` in T21 layer 6 (B1 START). Read whole: the requirements, the public parts of record-grammar, text-chain, record-core, content, connections and observation-log, layer 6's contract, the module's code and tests, the plan entry, `draft-T20-answers.md` A.1, A.3 and A.5, and `jobs/T20/legacy-tests.md` "For BOB".

## Entries applied

- **N452.** Re-scanned first: `INQUIRY_GRAMMAR_ROWS` has no reader in `bio-plane/src`, `bio-plane/test`, `agent-worker/`, `civicos-ui/` (or the worker packages) apart from this module; the only other hit is the generated `bio-plane/dist/bio-plane.bundled.mjs`. Deleted the alias (`checks.mjs`) and its re-export (`index.mjs`), and the same-object test. R7's test (heading `INQUIRY_GRAMMAR_CHECKS`) now also asserts the old name is absent from both faces, and that the module's families are found by the `_CHECKS` suffix alone (kept from the deleted test).
- **N458.** Re-scanned my paths' string literals: exactly the five listed lines held the word. `grammar.mjs` C-6.1 supersedes target, C-6.1 `division_siblings`, C-2.8 `division.into`, C-2.8 `basis[i].target` now say "is not a canonical record id" (as action-grammar's leg grammar already does); C-2.8's unreadable-registry message says "a checker that can only see this one record" ("one record", since "the record" in the same sentence is the whole record). `golden.json` re-keyed by exact substitution of those two phrases only (33 messages; a script checked nothing else changed). The test regex for `division.into` re-keyed. Two comments that quote the message updated; other comments (internal) left.
- **N469.** `grammar.mjs` note "nc-mk2.mjs's `overconn` arm pins it" (driver deleted): no module test proved it and the claim is R4's (the leg grammar judges inquiry R4–R6 as the catalogue did), so I added a requirement-named test, "R4 a connection grade on a leg citing a member's authored observation is graded as any leg's" (no testimony code; findings identical to the same leg on a captured document; an authored one stands, an earned one is still earned; a mutation refusing it turns the test red), and the note points at it. Re-scan found three more notes naming deleted suites as live: the DEC-65 sweep `test/dec65-single-part.test.mjs` (claim dropped, not a requirement of mine), "the source-level walk re-derives reachability" (repair-reachability's walk; dropped), and "conclude.test.mjs's own header records why" (the old suite; put in the past tense). Provenance notes kept (rule 6).
- **Own improvements (step 4).** Two live claims naming the deleted `store.mjs` re-pointed to where the code now is: `allocId("ENT", …)` is record-core's (entities calls it); the one act writing `grounds[]` is `inquiry`'s `#ground`, which refuses a machine first (checked at `inquiry/index.mjs`:1813). Historical notes ("before this item `supersedes` had ZERO occurrences in `store.mjs`", the `schema.mjs` quote) are provenance and stay.

Nothing deferred. No row changed (`INQUIRY_GRAMMAR_CHECKS` and `LEAD_CHECKS` byte-identical), so nothing awaits stamp.

## Found in other modules (REPORT J1)

- **inquiry**: `test/m/inquiry/case-grammar.test.mjs`:223 ("R7 C-21.2 is checked PER FINDING") pins this module's old message `/… is not a canonical bundle id/` and is red with this change (green on `tranche/T21`). It needs re-keying to "canonical record id" in inquiry's own job (INQUIRY #10, same layer, N458); its branch still holds the old words.
- **Generated artifact**: `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) is stale: three files under `bio-plane/src/inquiry-grammar/` changed. Not regenerated (§14).

## Tests and checks

- `node --test test/m/inquiry-grammar/` (from `bio-plane/`): tests 24, pass 24, fail 0 (24 before: one test removed, one added).
- `node --test test/m/` (from `bio-plane/`): tests 4685, pass 4622, fail 43, todo 20. The 43: filings 35, project-stage 5, intent 1 and control-plane `catalogue-end` 1, all accepted by name (K950, K952), and inquiry's `case-grammar` 1, new from this change (above; 11/11 on the tranche baseline).
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … inquiry-grammar`: 8 product files, 20 relative imports; 0 failures.
- `node checks/coverage.mjs … inquiry-grammar`: 10 of 10 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … inquiry-grammar tranche/T21`: 6 files changed; 0 failures.

Size (session_01Cy3dA1Gy1X7veKwXKWiD8g): test runs 7, module lines 1439

## J1 · REPORT

Two findings from my change, both in my record's 'Found in other modules'. (1) inquiry: test/m/inquiry/case-grammar.test.mjs:223 ('R7 C-21.2 is checked PER FINDING') pins my old message /... is not a canonical bundle id/; with N458 it is red (11/11 on tranche/T21, 10/11 on my branch). INQUIRY #10's job needs to re-key it to 'canonical record id'; its branch still holds the old words. (2) Generated artifact: bio-plane/dist/bio-plane.bundled.mjs (.bundle.json) is stale, three files under bio-plane/src/inquiry-grammar/ changed; not regenerated.

## J2 · COMPLETE

N452, N458, N469 applied on job/T21/inquiry-grammar (record has the detail). N452: no reader of INQUIRY_GRAMMAR_ROWS left; alias, re-export and same-object test deleted, R7's test asserts the name is gone. N458: the five messages say 'canonical record id' / 'this one record'; golden.json re-keyed for those two phrases only. N469: the nc-mk2 note re-pointed to a new R4 test (connection grade on an authored observation, with a mutation that turns it red); three more notes naming deleted suites as live fixed; two store.mjs claims re-pointed. No row changed, nothing awaits stamp, nothing deferred. inquiry-grammar 24/24; test/m 4622 pass, 43 fail: 42 accepted by name plus inquiry's case-grammar pin (REPORT J1). format, architecture, coverage (10/10), ownership: 0 failures each.
