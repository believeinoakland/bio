# case-disclosures (T34)

**Status** · session_01NBfHVg4mxbtcP9g9RHbMDt · depth 2 · WORKING · handled B2

## J1 · REPORT

T34-87 (DEC-149) applied on `job/T34/case-disclosures` @ a0c05b3440, ahead of T34-89 (which waits on case-grammar's merge):
- `checks.mjs:74` C-120.8 translation: "rests on material your group's Civicsmith does not hold whole, and everything a case relies on travels with it in full. …" (rest unchanged).
- `index.mjs:405` RELIED_ON_NOT_PRESENTABLE detail: "… are not held whole by your group's Civicsmith (…".
- `document.mjs:108` the case document's sentence needs no name: "One that only a supporting finding reaches, and that is not held whole, is listed with its fingerprint, origin and archived copy." (`carriesBodyLines` re-pinned with a one-sentence-only arm, as N535 did.)
- `document.mjs:23` (SELF_ATTESTED_SENTENCE, a capture's copy) stays.

Outside my module, for you:
1. `build/requirements/case-disclosures.md` R22's table still holds C-120.8's old translation; my seam test asserts the new one. Please re-word that row to match (BOB's).
2. `bio-plane/test/m/case-authoring/preflight.test.mjs` R29 (line ~75) asserts C-120.8's old translation word for word: red from my merge until case-authoring's job (T34-48, later in L8) updates it. Its other 136 tests pass.
3. The changed translation moves `CATALOG_VERSION` (promotion's, `gate.mjs`) and the row census (`test/fixtures/row-census-1.61.0.jsonl`); `test/system/row-census.test.mjs` was already red before my change (plan Rules (5) 4).
4. `bio-plane/dist/bio-plane.bundled.mjs` is stale (layer close).
