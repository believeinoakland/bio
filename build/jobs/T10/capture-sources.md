# capture-sources (T10)

**Status** · session_01M69ZsrZCDXrw2gwihj7LxK · depth 2 · WORKING · handled B1

## J1 · REPORT

Two things this job's change makes stale in files I do not own (mechanics §14). I have written neither.

1. **`bio-plane/dist/bio-plane.bundled.mjs`** and its `.bundle.json` (owner: `not_product`). `node --test bio-plane/test/fleetbundles.test.mjs` fails on it after my change and passes without it. The only change is in `bio-plane/src/capture-sources/credentials.mjs`: the two refusals' regions (N273).
2. **The DEC-49 guard's ratchet floors** in `civicos-ui/check-refusal-codes.mjs` (legacy-tests'). With N273's two regions now resolving, the guard's two capture-sources failures are gone (113 → 111 of its own) and four floors carry slack, each failed by the guard as `FLOOR SLACK`: `regions` 404 → 406, `regionLines` 5121 → 5132, `codesChecked` 864 → 866, `refusalsJudged` 841 → 843. These are the two resolved regions' own figures (one region, one code, one refusal each, and their lines). The floors are re-pinned by legacy-tests on the merged tree (as T9's K320 re-pin was); `regionLines` is a property of the merged source.
