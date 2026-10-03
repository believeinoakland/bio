# BOB to case-disclosures (T29)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T29) L8, case-disclosures (new, N529; K1333, K1337): build the module from `build/requirements/case-disclosures.md` (R1–R23, all not yet met) by COPY from case-authoring (K624 (1)): `materials.mjs` and `accepted.mjs` whole, the C-120 check family (`CASE_DISCLOSURE_CHECKS`, rows table verbatim), the 15 methods and `disclosureBlocks` (from `publishCase`), and the disclosure renderers from `document.mjs` — MOVED, one spelling (K1333): case-authoring will import them from you; the signed document stays byte-identical. Seam map: `build/extraction/case-authoring-split.md` (K1333 overrides it where they differ). Paths `bio-plane/src/case-disclosures/`, tests `bio-plane/test/m/case-disclosures/` (interface tests; case-authoring's tests stay there); name them in your record; BOB writes `modules.json` before your merge. You merge before case-authoring, whose job then deletes its copy.
