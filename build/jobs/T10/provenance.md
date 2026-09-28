# provenance (T10)

**Status** · session_01U1hr3TuE7sjb7d1PSfBTtt · depth 2 · WORKING · handled B1

## J1 · QUESTION

N263 / R50: where does C-53.14's catalogue row live, and where is it asked?

1. The row. No `C-53.14` exists anywhere today. R50 says "C-53.14, this module's row"; provenance's Suggestions say "C-53.14 (legacy-checks' row until this module holds its family, as C-53.13)"; N263 names legacy-checks too, but T10's plan gives legacy-checks no job (its rows are `draft-T11.md`) and `bio-checks.mjs` is not my path.
   My best reading (building on it now): the row is this module's own, in a row table under my paths, `REGISTER_ENTRY_CHECKS` in `bio-plane/src/provenance/checks.mjs`, `{REGISTER_BYTES_UNSTATED: {check: 'C-53.14', where: 'src/provenance/index.mjs #registerEntries > is-register-bytes', translation}}`, as capture-sources added C-105.10 to its own table (1.40.0) and publication holds C-44.2 apart from the rest of C-44. The rest of C-53 stays in legacy-checks' TESTIMONY_CHECKS. The arrival moves `CATALOG_VERSION` (promotion R34: rows counted wherever they live), which is promotion's re-stamp, reported, not mine.
2. The order. R50 does not rank itself against R3 and R2. My reading: asked first in the module's registered check, before the testimony fence (R3) and one-home (R2), since an entry that states no size is malformed before anything is judged about it. R3's "asked before R2's" holds unchanged. Every entry of the list is asked (a non-object entry has no `bytes`, so it is refused too, naming `sha256: null, path: null`); a replay is not exempt (R50 says any promotion).
