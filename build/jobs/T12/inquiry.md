# inquiry (T12)

**Status** · session_01SF3BCxa5TAs5uVuri45pJU · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

R20 (N285) has `dispose` answer `NOT_A_DISPOSITION` through `progressions.notADisposition`, and the private Uses in `build/requirements/inquiry.md` name `progressions` (`notADisposition` and `DISPOSITIONS`, its R35). But `build/modules.json` does not list `progressions` in inquiry's `uses`. So the import fails `checks/architecture.mjs` ("does not declare in uses"), even though progressions (layer 5) comes before inquiry in the order.

My best reading, which I am building on: you add `"progressions"` to inquiry's `uses` in `build/modules.json` on `tranche/T12`. I will then merge the tranche and re-run the check. My change imports `notADisposition` and `DISPOSITIONS` from `../progressions/index.mjs`. It re-exports progressions' frozen `DISPOSITIONS` as inquiry's own (R35 calls it "the one list"), so inquiry's literal copy goes and `affordances`' re-export still resolves.

## Completion

**Applied** (B1, N285, inquiry's share).
- **R20** `dispose` answers a word that is no disposition through `progressions.notADisposition` (its R35, row C-100.20). The whole answer is progressions': `{ok, reason, code, check, translation, to, dispositions, detail}`. This module mints no `NOT_A_DISPOSITION` literal and holds no row for it. The order is unchanged: `BAD_TARGET_STATE`, then `NOT_A_DISPOSITION`, then `NO_REASON`.
- **DISPOSITIONS** is progressions' one list (frozen), re-exported from `src/inquiry/index.mjs` for `affordances` (K78 (3)). Inquiry's own literal copy is gone, and `affordances` and `store.mjs` (through affordances) read the same array. The stale comment in `#dispose` saying it was imported from affordances is rewritten.
- **R31** now has a `test.todo` naming its cause (MK-5; no module defines an opinion element, K181), in place of a comment. This follows B1's rule for an id that does not hold.

**Strike.** Met by this work: R20's `not yet met: N285`.

**J1 answered** (B2, K389): `progressions` is in inquiry's `uses`; `tranche/T12` merged, and the checks were re-run green.

**Deferred.** R31 (MK-5, K181), as before.

**Found (reported to BOB).**
1. Generated artifact `agent-worker/dist/agent-worker.bundled.mjs` is stale: `bio-plane/src/inquiry/index.mjs` is one of its inputs, and the new import adds `bio-plane/src/progressions/*` to its input set. Not rebuilt (§14). `bio-plane/test/fleetbundles.test.mjs` already failed on the tranche before my change: the agent-worker manifest's recorded inputs lack `capture/checks.mjs` and `capture/ops.mjs`. My change adds the inquiry staleness to that. The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` has inquiry's source as an input too.
2. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs --strict`), my change against its parent: arm G's `NOT_A_DISPOSITION` goes from 3 literal sites to 2 (`store.mjs`, `progressions/checks.mjs`). The last one clears with legacy-store's N285 share. No other line of the guard's output moved. Its floors are for legacy-tests to re-pin on the merged tree.
3. `build/requirements/inquiry.md` text is stale in two places (BOB's to edit). (a) Suggestions: "`DISPOSITIONS` is written here as a copy" is no longer true; it is progressions' list, re-exported. (b) The Status paragraph's "Not yet met: R19 (D-592), R22, R26, R31, R39". R19, R22, R26 and R39 each have a passing interface test (reads, dispose and divide suites) and no inline mark. Only R31 still has a `not yet met` mark.

**Tests and checks.**
- `node --test bio-plane/test/m/inquiry/`: pass 60, fail 0, todo 1 (R31). R20's test now drives every legal state outside `DISPOSITIONS` (at least four) and requires the whole answer to equal `notADisposition(s)`, with C-100.20 and its translation. It also requires `DISPOSITIONS` to be progressions' array itself.
- Users of what changed (`DISPOSITIONS`, the `NOT_A_DISPOSITION` answer): `test/reopen`, `repair-reachability`, `affordances`, `m/affordances/`, `m/progressions/`, `d266scope`, `disposition`, `proposedispose`: 122 pass, 0 fail, 2 todo.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture … inquiry` (after merging `tranche/T12` for B2): 14 product files, 46 relative imports; 0 failures. `coverage … inquiry`: 45 of 45 live ids named; 0 failures. `ownership … inquiry tranche/T12`: 4 files; legacy-store 0/0, legacy-checks 0/0; 0 failures. After the merge, the inquiry suite again passes 60, fails 0, todo 1.

Size (session_01SF3BCxa5TAs5uVuri45pJU): test runs 6, module lines 3089

## J2 · REPORT

Found beyond my module (record, Completion 'Found'): (1) agent-worker bundle now stale. inquiry/index.mjs is an input, and the progressions import adds inputs. fleetbundles.test.mjs already failed on the tranche before my change (manifest lacks capture/checks.mjs, capture/ops.mjs). Plane bundle too. Not rebuilt. (2) DEC-49 guard: NOT_A_DISPOSITION goes from 3 literal sites to 2. store.mjs is the last, legacy-store's N285 share. Nothing else in the guard moved. (3) inquiry requirements text is stale. Suggestions' 'DISPOSITIONS is written here as a copy' no longer holds. The Status line's 'Not yet met: R19, R22, R26, R39' is contradicted by passing tests and no inline marks; only R31 is still unmet. R20 is applied: tests 60 pass, 0 fail, 1 todo (R31). Completion waits only on J1 (progressions in modules.json uses).
