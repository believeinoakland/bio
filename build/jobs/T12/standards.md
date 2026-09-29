# standards (T12)

**Status** · session_019zNnkRaQpGsSxLbJo61aEK · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.**
- N309 (R17): `noSuchStandard(standardId, extra?)`, a module-level export of `bio-plane/src/standards/index.mjs` (membership `noSuchProject`'s pattern, K231, K275): `{ok: false, reason/code NO_SUCH_STANDARD, check C-112.10, translation, standard (as asked, or null), detail (one fixed sentence)}`; `extra` adds a caller's fields and never replaces these; writes nothing, never throws. Its region `is-standard-held` is the code's one mint site, and C-112.10's `where` names it (`noSuchStandard > is-standard-held`). R5 (`standardRead`) and R7 (`inForce`) answer through it, passing `{id}` as their own extra field, so filings R14's pass-through (its tests key on `.id`) is unchanged. Pushed first (e76f2cd880) and reported (J1) for conformance.

**Deferred.** None.

**Not yet met mark.** R17's `*(not yet met: N309)*` is met; the ownership check refuses my edit of `build/requirements/standards.md` (outside my paths), so it is BOB's to strike.

**Found in other modules (for BOB).**
- conformance: `conformance/index.mjs` 324 still mints `NO_SUCH_STANDARD` from its own row C-113.9; arm G of the DEC-49 guard names the code at 2 sites until conformance answers through `standards.noSuchStandard` (its R1, N309) and C-113.9 retires (a row change for promotion R34 to stamp next tranche, N318; C-113.9 already listed there).
- legacy-tests: `civicos-ui/check-refusal-codes.mjs`' floors move by +1 each (`regionLines` 5477, `codesChecked` 890, `outcomeReturns` 263); the failure set is otherwise the same as on `tranche/T12` (40 FAIL lines before and after). Re-anchoring is legacy-tests'.
- `civicos-ui/` and affordances: no hit for `noSuchStandard`; `NO_SUCH_STANDARD` appears only in the guard. No code added or retired (the code and its row are unchanged; only the row's `where` moved).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale by this src change; not rebuilt (regenerated at layer close). `fleetbundles` workers unaffected.
- promotion R34 / N318: no row added or renumbered; C-112.10's `where` changed only.

**Tests and checks.**
- `node --test bio-plane/test/m/standards/`: tests 18, pass 18, fail 0 (R17 test added; R5's test compares the `standard` field too).
- Users of standards: `node --test bio-plane/test/m/conformance/ bio-plane/test/m/filings/`: pass 64, fail 0. `bio-plane/test/gate-reads.test.mjs`: pass 1, fail 0.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture standards`: 8 product files, 27 relative imports; 0 failures. `coverage standards`: 17 of 17 live requirement ids named by a test; 0 failures. `ownership standards tranche/T12`: 0 failures.

Size (session_019zNnkRaQpGsSxLbJo61aEK): test runs 5, module lines 25

## J1 · REPORT

R17 is pushed: `job/T12/standards` @ e76f2cd880, ready to merge early for conformance. `noSuchStandard(standardId, extra?)` is exported from `bio-plane/src/standards/index.mjs` (module-level, K231 pattern as membership `noSuchProject`): `{ok:false, reason/code NO_SUCH_STANDARD, check C-112.10, translation, standard: id as asked or null, detail: one fixed sentence}`; `extra` adds fields and never replaces these; never throws, writes nothing. C-112.10 `where` is now `noSuchStandard > is-standard-held`. R5 and R7 answer through it, passing `{id}` as extra so filings R14 (its tests key on `.id`) is unchanged; filings and conformance suites green (64/0). DEC-49 guard: same failure set as before; arm G on NO_SUCH_STANDARD clears once conformance calls the helper; floors regionLines/codesChecked/outcomeReturns each +1 (legacy-tests re-anchor). Carrying on with the rest of the job.
