# contradiction (T21)

**Status** · session_016pynE6RnAHz677Ff5aA48x · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- N458: `bio-plane/src/contradiction/index.mjs` `candidatesFor`, `CANDIDATES_NO_SUBJECT`'s `detail` now reads "name exactly one of inquiry, content, entity, a record (bundle), project or candidate" (the argument keeps its name, N71). A re-scan of every string literal in my paths found no other member-read "bundle": the rest are SQL, `bundle_id`, `bundle.md`, the subject kind `"bundle"` and the developer assertion "the D-15 bundle gate needs a QUALIFIED column", all kept. C-60.2's translation already says "a record". No test pinned the old words; the R25 test in `present.test.mjs` now asserts the new one.
- N469: no note in my paths names a T20-deleted file. The re-scan found three live notes naming old suites or "the battery" (none T20's list): `gate-recorded.mjs`:6–7 ("reachable from the battery"; "contradiction-overstrict.test.mjs drives this recording") re-worded to "a test" and `gate.test.mjs` (with `gate-measure.mjs`); `gate-baseline.mjs`:12 (`contradiction-gate.mjs`'s `measure`) re-pointed to `gate-measure.mjs`. Both headers now say these notes changed since T21. Provenance notes ("Copied … from", `gate.test.mjs`'s "Converted from", `gate-corpus.mjs`:24 "WRITTEN AFTER …") stay.

**Deferred.** None. The 7 `todo` tests are the K5 and R41 arms that wait on a measured model run (K488), as before.

**Found in other modules / generated artifacts.** `bio-plane/src/contradiction/index.mjs` changed, so the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) is stale (`not_product`; BOB regenerates at layer close). Nothing else.

**Tests and checks.**
- `node --test test/m/contradiction/` (in `bio-plane/`): tests 108, pass 101, fail 0, todo 7. No layer tests (`build/manifest.md`).
- `checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `checks/architecture.mjs contradiction`: 22 product files, 56 relative imports; 0 failures.
- `checks/coverage.mjs contradiction`: 57 of 57 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs contradiction tranche/T21`: 0 failures (re-run after commit below).

Size (session_016pynE6RnAHz677Ff5aA48x): test runs 2, module lines 12
