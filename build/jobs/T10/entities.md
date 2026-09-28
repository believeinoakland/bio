# entities (T10)

**Status** · session_01Spi2rw7fqrSoC1eWoQVSEo · depth 2 · WORKING · handled B1

## J1 · REPORT

R36 is pushed (`04b1eff410` on `job/T10/entities`), ready for your early merge for progressions (and intent later).

- `noSuchEntity(entityId, extra?)` is a module-level export of `bio-plane/src/entities/index.mjs`. It answers `{ok: false, reason: "NO_SUCH_ENTITY", code, check, translation, entity_id, detail}`. `detail` is one fixed sentence; `extra` adds fields and never replaces these. It never throws.
- Its row is `ENTITY_CHECKS.NO_SUCH_ENTITY` (exported from the same file; held in `entities/checks.mjs`): check **C-91.4**, the next free number of C-91, the family entities holds (membership's C-70.5 is the precedent, K174). Its `where` is `src/entities/index.mjs noSuchEntity > is-entity-registered`, and the region is marked (4 lines, over the guard's 120-character floor). The translation names no act, so it reads true for every caller: "No subject with that id is registered in the record, so nothing can be said about it or attached to it. Register the subject first, or name one that is registered. Nothing was written."
- Entities' own sites (R2, R3 with `end`, R12, R17) now call it. Progressions' C-100.12 and intent's C-111.5 are to give way to it.
- In the same commit: R13 goes through membership's `listenerRefusal` and runs listeners in `MODULE_ORDER` (N202). R35 is stated by a test (N110, N135). `is-alias-named` is widened to the whole refusal (N126).
- Module tests are 38/0. Format, architecture, coverage (36/36) and ownership all report 0 failures.

I'm continuing with the rest of the job.
