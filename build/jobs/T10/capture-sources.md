# capture-sources (T10)

**Status** · session_01M69ZsrZCDXrw2gwihj7LxK · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Two things this job's change makes stale in files I do not own (mechanics §14). I have written neither.

1. **`bio-plane/dist/bio-plane.bundled.mjs`** and its `.bundle.json` (owner: `not_product`). `node --test bio-plane/test/fleetbundles.test.mjs` fails on it after my change and passes without it. The only change is in `bio-plane/src/capture-sources/credentials.mjs`: the two refusals' regions (N273).
2. **The DEC-49 guard's ratchet floors** in `civicos-ui/check-refusal-codes.mjs` (legacy-tests'). With N273's two regions now resolving, the guard's two capture-sources failures are gone (113 → 111 of its own) and four floors carry slack, each failed by the guard as `FLOOR SLACK`: `regions` 404 → 406, `regionLines` 5121 → 5132, `codesChecked` 864 → 866, `refusalsJudged` 841 → 843. These are the two resolved regions' own figures (one region, one code, one refusal each, and their lines). The floors are re-pinned by legacy-tests on the merged tree (as T9's K320 re-pin was); `regionLines` is a property of the merged source.

## J2 · COMPLETE

**Entry applied** (the plan's capture-sources bullet, layer 3):
- **N273.** Both C-105 regions now resolve for the DEC-49 guard, each over its whole refusal.
  - **C-105.10 `CAPTURE_CREDENTIAL_SUPPLY_FAILED`** is now minted in `credentialSupply`'s own catch, inside `is-credential-stored`. Before, the region sat in a `#supplyFailed` helper outside the function its `where` names. The helper is removed. The span covers the whole refusal and the comment saying the error's words are never repeated.
  - **C-105.11 `CAPTURE_CREDENTIAL_WITHDRAW_FAILED`**: `is-credential-withdrawn` now spans the whole refusal, 5 lines. It was 3 lines, under the guard's 4-line floor.
  - Behaviour is unchanged: the same codes, conditions, details and translations. No requirement changed and no `where` changed.
  - The guard (`node civicos-ui/check-refusal-codes.mjs`) no longer names either region; before this change it named both.
- **Tests** (`bio-plane/test/m/capture-sources/credentials.test.mjs`), two named R55, R57, R63:
  - An independent resolver over every C-105 `where`. It checks one marker pair, inside the named function's body, at least 4 lines and 120 characters, minting the row's code and no other.
  - The guard's own run, stdout and stderr both read. It asserts that the guard reads this family in `credentials.mjs`, reached arm C, and names no C-105 row, code or this file in a FAIL line.
  - Both tests fail on the old source (the first naming `is-credential-stored` outside `credentialSupply`) and pass on the new.
  - These tests read source text. That is deliberate: a `where` is a claim about source, and N273 asks for a test that each region resolves.

**Deferred:** none. **Other modules:** J1 (the plane bundle; the guard's four ratchet floors, legacy-tests').

**Tests:** `node --test bio-plane/test/m/capture-sources/` gives tests 74, pass 73, fail 0, todo 1. The todo is R37, Memento, unscheduled (K48), carried over. `fleetbundles.test.mjs` fails only on the stale plane bundle in J1. The manifest names no layer tests. No service I provide changed.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 10 product files, 17 relative imports (0 naming no tracked file, not judged); 0 failures
- coverage: 1 modules, 63 of 63 live requirement ids named by a test; 0 failures
- ownership: 3 files changed by capture-sources between tranche/T10 and HEAD; 0 failures

Size (session_01M69ZsrZCDXrw2gwihj7LxK): test runs 4, module lines 3953
