# capture-requests (T21)

**Status** · session_01JL9Lx4gBJnTxwqg28ioRKt · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 layer 6, capture-requests):
- **(1) N463.** `test/m/capture-requests/plane.test.mjs`:17–18 stand the plane up from `join(SRC, "plane", "index.mjs")` (plane R6's entry), no longer the one-line re-export `src/index.mjs` that plane deletes in L11 (plane R8). The suite is green against it (4 of 4 plane tests).
- **(2) N458.** `index.mjs`:266, C-28.14's `detail`: "… a document, a project or a **record** id nothing answers to …". Re-scan of my paths: every other "bundle" is a comment, an interface name (N71: `bundle_id`, `bundleId`, `bundle.md`, `bundlesOf`) or SQL; no translation in `checks.mjs` holds the word. No test pinned the old words (only the generated `release/` and `newgroup/src/release.mjs` bundles carry them).
- **(3) N469.** None listed. Re-scan of my paths found two notes naming the old battery as live: `checks.mjs`:52–53 ("The suite drives a document under a `Disallow` path and asserts it CAPTURES") and :74 ("used by … the suite"). Both re-worded to the module test that proves the claim: `drain.test.mjs`' R14 tests (the `Disallow` path captured, no `robots.txt` fetched; the legibility predicate). `checks.mjs`:5's "COPIED from the check catalogue" is provenance and stays.

**Own-module flaws fixed beside them (comments only):** `checks.mjs` C-28.17's note named `#renderHoldReason` (now the exported `renderHoldReason`); C-28.18's note said the code "is minted nowhere yet" (`captureRequestRetry` mints it); `schema.mjs`'s table comment said `index.mjs` omits `taskenqueue` from the OPS table (that table is `op-declarations`' now, and `src/index.mjs` goes in L11).

**Observed, not changed:** `captureRequestsOps`' `capturerequestdrain` reads `now` from the body (`index.mjs`:1125). No requirement forbids it (R6's no-body-`at` rule is the door's), and the op is admin, probe and daemon only (R30); left as it stands.

**`not yet met: T21` marks met:** none (none carried).

**Deferred:** none.

**Other modules (REPORT J1):** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) stale: `src/capture-requests/index.mjs`, `checks.mjs` and `schema.mjs` changed (one sentence and comments); not regenerated. `test/m` reds not mine: 42 fail on this branch, the 41 ACQUISITION #4 recorded (filings 35, project-stage 5, intent 1) and `control-plane/catalogue-end.test.mjs` R43/R22 (C-53.13's pinned digest `93c064a948ae1a7f`, actual `6611137f11985943`), which fails identically with this change stashed.

**Tests and checks:**
- `node --test bio-plane/test/m/capture-requests/`: tests 63, pass 63, fail 0 (the plane suite against `src/plane/index.mjs`)
- `node --test bio-plane/test/m/`: tests 4685, pass 4623, fail 42; none in `capture-requests/`; `catalogue-end.test.mjs` the same 1 fail with this change stashed
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … capture-requests`: 9 product files, 34 relative imports; 0 failures
- `node checks/coverage.mjs … capture-requests`: 44 of 44 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … capture-requests tranche/T21`: 0 failures

Size (session_01JL9Lx4gBJnTxwqg28ioRKt): test runs 3, module lines 1601
