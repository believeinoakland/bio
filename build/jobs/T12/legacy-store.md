# legacy-store (T12)

**Status** · session_01SwuSDSpNYMTago2yMckx82 · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** (plan layer 10, legacy-store; START B1): **N285, my share.**
- The project-scoped arm of `proposeDispose` (`op=proposedispose` with `{project, finding}`) now answers a word that is no disposition through `progressions.notADisposition` (its R35, C-100.20, K275). It passes the word trimmed by its own rule, as R35 asks.
- My own copy of the condition and its sentence are gone, together with the now-unused `DISPOSITIONS` import from `affordances.mjs` and the two comments that described it.
- `store.mjs`: 8 lines added, 17 removed (net −9). The only new name is `notADisposition` on the existing `progressions` import (a declared `*earlier` use).
- The instance-wide arm was already progressions' own `disposeProposal` (R21). Both key shapes of the op now answer one identical `NOT_A_DISPOSITION`.

**Deferred.** Nothing.

**Found in other modules (REPORT).**
1. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest (`not_product`), from `store.mjs`. `fleetbundles` goes 95/1 → 91/5; the 1 is agent-worker's input census and is red on the tranche too. For your layer close (§14).
2. **legacy-tests, `civicos-ui/check-refusal-codes.mjs`:** this change clears one of its failures. Arm G's "`NOT_A_DISPOSITION` is now minted at 2 literal sites (store.mjs, progressions/checks.mjs)" is gone, and its multi-site count drops from 57 to 56 (ceiling 54). The guard's other 17 failures are unchanged from the tranche (floor slack on `regions`, `regionLines`, `codesChecked`, `outcomeReturns`, `untranslated`, and the rest), so re-anchoring its figures is legacy-tests' work.
3. **`civicos-ui/` hits for the code:**
   - `app.html` 13974–13982 and 18545–18559 are comments naming the refusal ladder. They are still true.
   - `test/act-proposal.test.mjs:53` mocks the store's retired sentence as `PROP_WORDS.NOT_A_DISPOSITION` ("a proposal is deferred (parked) or dismissed (declined); adopting one authors a focus…"). The plane now answers progressions' R35 sentence and row. The suite is green (75/75) because it drives its own mock, so it pins wording the plane no longer sends. That is legacy-tests' / legacy-ui's to re-word.
   - `test/act-dispose.test.mjs` mocks inquiry's dispose, which is not this act.
   - Affordances' lists hold no hit for the code.
4. **Pre-existing reds, not this job's** (identical FAIL sets on `tranche/T12`'s `store.mjs`):
   - `d470-catalog-census` 11/2: the census pin, and the stamp still reading bio-checks 1.41.0.
   - `machinefences-dec49` 88/1: arm A4, the doctrine pack.

**Tests and checks.** I own no tests (legacy module, `tests` empty).
- **Old-battery suites that drive `op=proposedispose`, on this branch:**
  - d266scope 38/0, proposedispose 58/0, disposition 64/0, current 65/0, d552-instance-disposition 19/0, identity-claims 33/0, peritem 51/0, pipeline-e2e 53/0, project-authority 63/0, project-discoverable 157/0, project-sight 253/0, queue-state 66/0.
  - d470-catalog-census 11/2 and machinefences-dec49 88/1, the same as on the tranche (item 4).
- **UI checks:**
  - act-proposal 75 green, act-dispose 77 green.
  - check-refusal-codes: 17 failures here against 18 on the tranche (item 2).
- **Scratch driver at the op's interface, not committed.** It is d266scope's own fixture plus 9 arms, run through the real control plane in Miniflare.
  - The scoped arm's answer is `JSON.stringify`-identical to `notADisposition(trimmed)` for `to` = "adopted", "  elevated  ", "", "   ", null and "Deferred", and for the same word sent as `state`.
  - Both key shapes answer one identical refusal.
  - The refusals wrote nothing.
  - Result: 47/0 on this branch. Negative control on `tranche/T12`'s `store.mjs`: 39/8, with all 8 byte-for-byte arms failing. The file was restored and checked by sha256.
- **Checks** (civicos-process):
  - format: 69 modules, 64 requirements files; 0 failures.
  - architecture: 4 failures, the same 4 as T11 recorded (store.mjs imports `affordances.mjs` twice, `queuestate.mjs` and `queue/proposals.mjs`). One name less now comes from affordances; the import line stays for its other names.
  - coverage: 0 of 0 live ids; 0 failures.
  - ownership: 1 file changed; 0 failures.

Size (session_01SwuSDSpNYMTago2yMckx82): test runs 30 (15 old-battery suites, 2 tranche comparisons, 3 UI checks plus 1 tranche comparison, 4 scratch-driver runs including the control, 2 fleetbundles runs, 3 others), module lines 7,604

## J1 · COMPLETE

N285 (my share) is applied. The full detail is in my record's § Completion.
- **Change:** the project-scoped proposal dispose answers `NOT_A_DISPOSITION` through `progressions.notADisposition` (R35, C-100.20), byte for byte. My own copy of the condition and its sentence are gone, and so is the unused `DISPOSITIONS` import. `store.mjs` net −9 lines. Both key shapes of `op=proposedispose` now answer one identical refusal.
- **At the op, a scratch Miniflare driver (not committed):** 47/0 on this branch. On the tranche's store, 8 byte-for-byte arms fail. The file was restored and checked by sha256.
- **Battery:** the 15 old-battery suites that drive the op are green, except d470-catalog-census 11/2 and machinefences-dec49 88/1. Both are identical on the tranche.
- **Checks:** format, coverage and ownership 0 failures; architecture shows only the 4 pre-existing failures.

For routing:
1. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest, from `store.mjs`. `fleetbundles` goes 95/1 → 91/5. For the layer close.
2. **legacy-tests, `check-refusal-codes`:** this change clears arm G's two-site `NOT_A_DISPOSITION` failure, and the multi-site count drops from 57 to 56. Its other 17 failures are pre-existing floor slack.
3. **legacy-tests / legacy-ui, `civicos-ui/test/act-proposal.test.mjs:53`:** it mocks the store's retired sentence for this code. The suite stays green because it drives its own mock.
