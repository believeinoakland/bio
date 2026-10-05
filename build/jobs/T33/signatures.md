# signatures (T33)

**Status** · session_01Rj1YY4SJGHnLERzjPXfZoY · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two points on T33-7. Each has my best reading. I am carrying on with the job on both readings.

1. **`modules.json`: signatures' `uses` is still `[]`** on `tranche/T33` @ a5abf18fa6. The requirements (Uses), START and S0-13 all name the new edge to `record-grammar`. `checks/architecture.mjs` will fail on `sshsig.mjs` importing `record-grammar/index.mjs` until the row reads `"uses": ["record-grammar"]`. That file is yours. Best reading: you add the edge on the tranche, and I merge it before my checks.

2. **How the pattern is read from record-grammar.** R38 and R40 accept any `[A-Z]+` prefix, with the counter in record-grammar's sequential form. R46 and R47 give `ID_TABLE` and `idPattern(prefix)` but no prefix-free piece. The page (R42) needs a regex literal. Best reading: `sshsig.mjs` takes the first `sequential` entry of `ID_TABLE` and reads `idPattern(thatPrefix).source`. It requires that source to be `^<PREFIX>…$` and throws at load otherwise, so a test catches any drift. It swaps `^<PREFIX>` for `^[A-Z]+`, appends the optional slug, and exports the result as `OPAQUE_ID_RE`. `embed-signpage` writes that same regex into `sign-release.html`'s copy and then renders `SIGN_HTML`, so the page and the plane hold one derivation. This relies on `idPattern`'s source starting with `^` plus the literal prefix. If you would rather record-grammar export the counter's own source, tell RECORD-GRAMMAR #8 and I will read that instead.

## Completion

**Entries applied.** T33-7 (S0-13, B0.2; K1470, K1513): `sshsig.mjs` no longer holds the counter. It derives `OPAQUE_ID_RE` from `record-grammar` (`ID_TABLE`'s first sequential prefix, `idPattern(prefix).source`, the prefix widened to `[A-Z]+`, the optional slug appended). It throws at load if that source is not `^<PREFIX>…$`. `noticeStatement` (R38) and `docketStatement` (R40) read it, so every `\d{4,}` counter is accepted, the 10,000th included, and every id valid before T33 still is. `embed-signpage.mjs` gains `syncIdPattern`, which writes that same pattern over the page's one `const OPAQUE_ID_RE = /…/;` line. `main` saves the page when the line changed, then renders `signpage.mjs` (R42, R30). The committed page and render are regenerated. Final `uses`: `record-grammar`.

**Tests.** Two R38/R40 controls that are now valid ids (`…-48170`, `…-30910`) moved to the accepted cases, and the 10,000th id and longer counters were added. New tests:
- R38 R40: every id judged against `idPattern` over sequential prefixes × counters × slugs.
- R38 R40: the exported pattern's shape.
- R42: the committed page is a fixed point of `syncIdPattern`, a stale copy is rewritten, and a page with 0 or 2 copies is refused.
- R42: the page's notice and docket buttons sign exactly the ids the plane's statements accept.

`signatures`: 76 pass, 0 fail, 0 skipped. **This was run against a local, uncommitted stand-in for record-grammar's R46/R47** (sequential `^P-\d{4}-\d{4,}$`), because `ID_TABLE` is not yet on `tranche/T33` or `job/T33/record-grammar` @ 9eb53ed549. Until T33-1 merges, the import of `ID_TABLE` fails and this module does not load. It must merge after record-grammar (the START's order), and I re-run on a CHANGE once record-grammar is on the tranche. If record-grammar's sequential pattern differs from `\d{4,}`, the page's copy needs `npm run embed:sign` re-run; the R42 fixed-point test fails until it is.

**Users' tests** (run with the change): network-notices 68/0, docket 43/0, capture 118/0, ratification 204/0, publication 109/0, case-import 75/0, public-read 110/0, credentials 40/0, control-plane 159/0. promotion and plane fail 1 each, the module-order test, the same on the base (accepted red 2).

**Generated artifacts made stale (mechanics §14; reported to BOB, not edited):**
- `bio-plane/dist/bio-plane.bundled.mjs` (fleetbundles D-298 arm).
- `newgroup/dist/newgroup.bundled.mjs` (installer's; DIST-13 (C)).
- `bio-plane/src/case-checker/program.mjs` (case-checker R13, accepted red 3 until T33-73).

Each bundles `sshsig.mjs`, which now imports `record-grammar/index.mjs`.

**Deferred.** None.

**Checks** (after merging `tranche/T33` with K1513):
- format: 126 modules, 125 requirements files; 0 failures
- architecture: 8 product files, 10 relative imports; 0 failures
- coverage: 42 of 42 live requirement ids named by a test; 0 failures
- ownership: 6 files changed by signatures between tranche/T33 and HEAD; 0 failures

Size (session_01Rj1YY4SJGHnLERzjPXfZoY): test runs 8, module lines 1373

## J2 · REPORT

Generated artifacts made stale by T33-7 (sshsig.mjs now imports record-grammar/index.mjs); not edited, per mechanics §14: bio-plane/dist/bio-plane.bundled.mjs (fleetbundles, D-298 arm), newgroup/dist/newgroup.bundled.mjs (DIST-13 (C)), bio-plane/src/case-checker/program.mjs (case-checker R13, accepted red 3). Each regenerates at the layer close.
