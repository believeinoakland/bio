# local-facts (T50)

**Status** · session_01KFyWTaBKyD4BShE6YnSa4M · depth 2 · WORKING · handled B1

## Completion (T50-40 · local-facts · claude-haiku-5-5)

**Entries applied.** T50-40 (N1132, its "words.json holds none of my words" pins by key). The module's refusal rows now take
each translation from `words.json`'s `refusal.<CODE>` key, verbatim: `LOCAL_FACTS_WORDS` (renamed from `RULE_WORDS`, all
sixteen keys) in `bio-plane/src/local-facts/checks.mjs`, and every row reads it. `words.json` holds a key for every C-126
row (DEC-260, K3374), so the T46 split (nine keyed, eleven kept) no longer holds. Six rows' words change by key with it, the
N1160 "team" wording now in `words.json`: C-126.1, C-126.6, C-126.7, C-126.10, C-126.12, C-126.16. No requirement line
changed (Text: none). Codes, numbers, `where`s and behaviour are unmoved.

**Tests.** `bio-plane/test/m/local-facts/t46.test.mjs`: the R16 pins KEYED and KEPT are replaced. KEPT asserted that
`words.json` held none of eleven rows (the stale negative controls, N1132). The R16 test now checks that all sixteen codes
are held, that each row's translation equals `WORD(key)`, and that `words-reads.json`'s `local-facts` reads name the same
sixteen `refusal.*` keys. Controls: a key the list lacks is not held (`HAS` false) and `WORD` throws on it. The
RULE_NO_REASON control reads its key. No test was skipped, weakened or re-pinned to old English.

**Plan rule 6 (Haiku: items 2 and 3 only).**
- Item 2 ("labeled"): no member-facing "labelled" in this module. The one occurrence is a source comment
  (`bio-plane/src/local-facts/rules.mjs:14`), not a member's words, and is left.
- Item 3 (hand-lists): the module's tests hold no other module's ops, rows or words. Its words come from `words.json`
  (the owner) and its reads from `words-reads.json` (the owner's declaration), both now checked.

**Deferred.** None.

**Found, for BOB.**
- R16's text (`build/requirements/local-facts.md`, R16) says eight rows change and that C-126.1–C-126.5, C-126.11 and
  C-126.16 keep their translations. `words.json` now keys all sixteen (DEC-260), so R16's own rule reads every row by key.
  The text is BOB's. Proposed: "Every row of C-126 takes its translation from its `refusal.<CODE>` key (all sixteen are
  held, DEC-260)". The code follows the rule as written, so this is a wording fix only.
- Six rows' translations changed text (listed above). Their rows wait for T51's stamp (plan rule 5 (2)) if the row census
  flags them. `checks/run.mjs` raised no row-census failure for them.
- Eleven consumer tests fail with this module's change reverted as well (identical failure set on HEAD): affordances,
  answer-envelope (`catalogue-end` R7/R13, accepted red until T50-25, rule 5 (6)), action-clocks, filings, op-declarations
  and plane tests. None names this module's words. Not this module's to fix.
- `checks/run.mjs` exits 1 on 31 coverage failures in other modules (base reds, plan rule 5). None is in local-facts.

**Checks and tests run** (from the process repository, product `/home/user/bio`):
- `node checks/format.mjs /home/user/bio` → format: 171 modules, 169 requirements files; 0 failures
- `node checks/architecture.mjs /home/user/bio local-facts` → architecture: 17 product files, 54 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs /home/user/bio local-facts` → coverage: 1 modules, 17 of 17 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs /home/user/bio local-facts tranche/T50` → ownership: 4 files changed by local-facts between tranche/T50 and HEAD; 0 failures
- `node checks/run.mjs /home/user/bio` → architecture: 3434 product files, 10587 relative imports, 0 failures; coverage: 169 modules, 5641 of 5762 live requirement ids named by a test, 31 failures (none local-facts, all base reds); channels: 2 participants, 824 outbox commits read, 0 failures
- `node --test bio-plane/test/m/local-facts/*.test.mjs` → before the change: 4 failing (R16 x2, R17 x2); after: `ℹ tests 63`, `ℹ pass 63`, `ℹ fail 0`
- consumer tests (affordances, answer-envelope, action-clocks, filings, op-declarations, plane t33/t45/t46, compose) → `ℹ tests 544`, `ℹ pass 533`, `ℹ fail 11` with the change; the same 11 on HEAD

Size (session_01KFyWTaBKyD4BShE6YnSa4M): test runs 6, module lines 1388
