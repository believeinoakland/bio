# control-plane (T29)

**Status** · session_0131YRU3q99y5WXShe5oMaPr · depth 2 · WAITING ON BOB (J2) · handled B1

## J1 · QUESTION

Both entries applied on `job/T29/control-plane` @ 37e4472e7c; module tests 147/147 (the three inherited reds cleared). Before/after comparison of every code's row: the docket move changes no code's family, check or translation; the only difference is C-120's twelve rows, which are reached again from case-disclosures.

One check fails, on a file that is yours: `node checks/architecture.mjs bio control-plane` → `FAIL families.mjs imports src/case-disclosures/checks.mjs of case-disclosures, which control-plane does not declare in uses`. My requirements' Uses already names `case-disclosures` (N529, K1333), but `build/modules.json` control-plane's `uses` does not. My reading: you add `"case-disclosures"` to control-plane's `uses` in `build/modules.json` on `tranche/T29`; I merge the tranche and re-run the checks, then post COMPLETE. format, coverage (33/33) and ownership pass.

For your L11 close: `families.mjs` is an input to `bio-plane/dist/bio-plane.bundled.mjs` (not_product's artifact), now stale; regenerate it at the close.
