# run-rules (T50)

**Status** · session_0151Wr6ivcGYVcAcYyX8hkjn · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**Entries applied (T50-70).** R35 met: `levelEmptyHolds({scope})` (rules.mjs): `true` when `scope.documents` is a whole number of 1 or more; otherwise `{holds: false, code: "LEVEL_EMPTY_NO_DOCUMENT_IN_SCOPE", check: "C-22.31", translation}`; fail closed for an absent scope, a non-object, no own `documents`, a string, fraction, negative, NaN or infinity, an inherited `documents`, and a throwing getter. The row C-22.31 is in `AI_RUN_OWN_CHECKS` (`where` names `rules.mjs levelEmptyHolds`), its translation `word("refusal.LEVEL_EMPTY_NO_DOCUMENT_IN_SCOPE")` through setup-words, held in `RUN_RULES_WORDS`. `agent-harness` R18 can call `levelEmptyHolds` (exported from `run-rules/index.mjs`); the plane's `suggest` is untouched. New `t50.test.mjs` (5 tests, R35, controls beside each refusal); `table.test.mjs` and `t46.test.mjs` updated for the new row and C-22.31.

**Flaw fixed in my module (P8).** `RUN_RULES_WORDS` held verbatim copies of three words.json sentences, and one had drifted: `refusal.MEMBER_RUN_MODE_NOT_ADMITTED` said "the group's account" where the list (DEC-260/D29) says "the team's". That left t46's R31 and R32 tests red at my START. All four keys are now read through `word(key)`, so no copy remains and they cannot drift again. C-22.30's translation changes to "team's" (ai-runs reads it by key; its text follows).

**Deferred / for BOB.**
- Requirement wording: R20/DEC-149 and the rows C-33.29 and C-109.1 say "your group's Civicsmith" (translations in `checks.mjs`, held as English, not words.json keys), and test `R11, R20 (DEC-149)` pins that. D29 says "team", never "group". Those rows are not in my entry; re-wording them needs a requirement change and a key for each in words.json (design lane). Left unchanged.
- Row census: C-22.30's changed translation and the new C-22.31 row wait, accepted red, for T51's stamp (plan rule 5 (2)).

**Found in another module (REPORT).** Generated artifact stale, which I made so: `agent-worker/dist/agent-worker.bundled.mjs` (and `.bundle.json`) now fail `fleetbundles.test.mjs` and agent-worker's R45 test ("STALE BUNDLE" for run-rules `checks.mjs`, `index.mjs`, `rules.mjs`); they pass on the base. BOB regenerates it at layer close (manifest §14). `bio-plane/dist` is the plane's (not_product) for the same reason.

**Ran.**
- `node --test bio-plane/test/m/run-rules/`: 73 pass, 0 fail (base: 2 fail, the drift above).
- Users of run-rules, with my change and on the base (stash), identical: ai-runs 117/0, run-productions 59/0, capture-requests 123/0, skills 126/0, question-explorer 34/0, agent-harness 48/0, wizard-scripts 97/0, machinery-producers 31/0 pass; inherited reds unchanged by me: ai-use 68/10, case-disclosures 97/2, action-plans 86/2, answer-envelope 37/3, plane 250/1. agent-worker/test: 24 pass, 1 fail (R45, the stale bundle above); on the base requirements.test.mjs passes.
- `checks/format`: 0 failures. `checks/architecture run-rules`: 19 files, 0 failures. `checks/coverage run-rules`: 35 of 35 ids, 0 failures. `checks/ownership run-rules tranche/T50`: 0 failures (run on the committed branch).

Size (session_0151Wr6ivcGYVcAcYyX8hkjn): test runs 7, module lines 2,575
