# ai-use (T47)

**Status** · session_01Um9FEN6s8PabTD7bZrJfA9 · depth 2 · WORKING · handled B0

## Completion

**Read whole** (P20, mechanics §6 step 2): `build/requirements/ai-use.md`; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and tests (`fixture.mjs`, the seven test files, reading the parts each change touched and running all); `credentials` R70 and its `subscriptionTokenHold`. No flaw found in the module's code beyond the two below.

**Entries applied**
- **T47-70 (N992; DEC-198, DEC-199).** `AI_USE_WORDS['ai.refused.limit.unjudged']` re-taken from `main`'s `words.json` (identical on this branch): "… stopped here: your group's Civicsmith couldn't check the use of {whose} account …". Every other entry already equal. Clears the five R3/R13 reds; tests unchanged, as the Suggestions note says.
- **K3084 (credentials R70).** `limits.test.mjs` "R2 usd on a sign-in …" connected cy's sign-in by the fact alone (`subscriptionConnected`), which now answers not connected; it now holds a token (`subscriptionTokenHold`), clearing its red. The test's assertions are unchanged.
- **Own flaw fixed (P8).** `explore.test.mjs` "R6 … EXPLORE_OUT_OF_SCOPE …" carried a vestigial `subscriptionConnected({member: "cy"})` that bore on nothing it asserts (and since R70 sets up nothing); removed.

**Deferred:** none. **Other modules:** none found; no provided service changed (one word's text only), no generated artifact staled.

**Tests and checks**
- `node --test bio-plane/test/m/ai-use/*.test.mjs`: tests 68, pass 68, fail 0 (before: 6 fail).
- `checks/format.mjs`: 166 modules, 164 requirements files; 0 failures.
- `checks/architecture.mjs bio ai-use`: 11 product files, 35 relative imports; 0 failures.
- `checks/coverage.mjs bio ai-use`: 13 of 13 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio ai-use tranche/T47`: 0 failures.
- `checks/run.mjs` over the product: architecture 3071 product files; 0 failures. Coverage's 44 failures are other modules' inherited ones (screens-*, setup-words, wizard-scripts …), none ai-use's.

Size (session_01Um9FEN6s8PabTD7bZrJfA9): test runs 4, module lines 1203
