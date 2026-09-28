# content (T7)

**Status** · session_014cVKFvJhGvHewaQ6myVSLX · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N119 changes what `cropOf` answers, so R32's text needs your fold (step 5: BOB updates the requirements first). My proposed R32, which I am building to now:

- **R32** The crop of an image cited by page and rectangle, through `pdf-pixels`, served as a derived rendition that says so; its bytes travel as `bytes_base64` (standard base64 of the rendition's file, whose `file_sha256` the answer states), never as raw octets; an absent or invisible row is `NO_SUCH_CONTENT`.

The module encodes it (so every route, not only the plane's, gets one wire form); the answer no longer carries `bytes`. Effect elsewhere: `bio-plane/test/d419-content-crop.test.mjs` (legacy-tests) reads `g.bytes` / `j.bytes`; its `octets` helper already decodes base64, so it needs only `bytes` → `bytes_base64` at its three reads. I will REPORT that at completion.

Also, for your record (not a question): N117's bound on `markStale` is stated in my record at completion; in short, one read (at most 200 rows graded, total counted in the same statement) and one UPDATE per re-read, and ONE notice per listener per re-read carrying the graded rows, never a notice per row.

## J2 · REPORT

Found in other modules (none changed by me):

1. **legacy-tests · `bio-plane/test/d419-content-crop.test.mjs`** (R32 as folded, K179; N119): the crop's answer carries `bytes_base64` and no longer `bytes`. Its `octets` helper already decodes base64; the reads `octets(g.bytes)` and `octets(j.bytes)` (lines 193, 199) become `octets(g.bytes_base64)` / `octets(j.bytes_base64)`. Until then it reads 14/2 (the two arms that hash the crop's bytes); 16/0 on the base.
2. **legacy-tests · `bio-plane/test/derivation-bounds.test.mjs`** (N117, an improvement): `content/index:markStale` leaves the unbounded-derivation class (its read now carries `LIMIT ?`). CLASS 31 → 30 (walk 19 → 18), CENSUS 179 → 178; re-pin the ratchet (its `want [31,33]` arm, red on the base too, now reads `[30,33]`) and drop markStale from T5-12's arrivals note. 66/7 on the base and here, the same seven arms.
3. **legacy-tests (or whoever owns the DEC-49 guard) · `civicos-ui/check-refusal-codes.mjs`** (LEGACY-CHECKS #2 REPORT 8, applied): the store's `versionNotice` passage arm now delegates to `passageNotice`, so the guard's "refusal("VERSION_NOTICE_NO_CONTENT") is NOT a row" failure is cleared. `VERSION_NOTICE_NO_CONTENT` is now minted at one site, so its entry in `MULTI_SITE_CLOSED` is stale (arm G fails it by name): remove it. Also `regionLines` 4682 → 4681 and `codesChecked`/`refusalsJudged` 621/617 → 620/616 for the re-pin print. Failures 102 before, 102 after (one cleared, one stale-closure added).
4. **Unchanged, measured:** versionnotice 41/0, versiongrade 28/0, version-notice-surface 29/0, gate-reads 115/0, machinefences-dec49 89/0; hygiene red identically on the base (`record.registerAuditCheck is not a function` from provenance, line 807).
