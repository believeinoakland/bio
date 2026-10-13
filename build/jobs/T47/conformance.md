# conformance (T47)

**Status** · session_01NR4xupHUaVCnuPH6iymd1X · depth 2 · WORKING · handled B1

## J1 · QUESTION

Entry T47-34, second part (N995, K3038): `edition_date`.

`case-import` R4 (and its code as T46 built it) answers no date of the source edition: per edition only `imported_at`/`imported_by` (this copy's import instant, not the edition's date), `group_fields` (no date but `read_at` and `domain_verified_at`) and R19's publisher facts. So nothing in R4 names the edition's date.

My best reading, which I am building on: **the read is removed**. `conformance` no longer reads `edition_date` from `importedCase` (from the edition or from `group_fields`). The key stays in R32's `basis` shape and always answers `edition_date: null`, because R32 names it and `actions` R75 and `filings` read it (`b.edition_date ?? null`, printing "a date not stated"). `imported_at` is not used in its place. A test asserts it is null even when `importedCase` answers a field named `edition_date`.

The requirement text that would match is BOB's: R32's "`edition_date`, ... read from `case-import.importedCase` ... where it records them" would say that `edition_date` is null because no source records it. If you would rather the key were dropped from the shape, say so and I will drop it.

Also, for R39, not a question: the read of `importedCase` now passes the reading viewer. The old code passed `viewer: null`, which case-import R4 answers as a non-member ("no such edition"), so identity and stake were always unrecorded in the composed plane. The stand-in now follows R4's viewer rule.
