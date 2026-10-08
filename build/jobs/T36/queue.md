# queue (T36)

**Status** · session_019AZwL2DAm7ic4sUi9n3hkC · depth 2 · COMPLETE · handled B1

## Reading (mechanics §17, N739)

The set measured over 300 KB (own code 204 KB, own tests 284 KB, requirements 35 KB, before the users' public parts), so read under B1's option (3). Read whole myself: `build/requirements/queue.md`; layer 11's row of `build/layers.md`; `notice-producers` R12–R15 (the services my entry catalogues; its Purpose and Provides otherwise as R1, R51 cite them); the plan's entry T36-46 and K2130 with the draft's queue section, "Choices made" and "BOB's review"; the code the entry changes, `bio-plane/src/queuestate.mjs` (449 lines); and the tests it changes, `test/m/queue/catalogue.test.mjs` and `noticed.test.mjs`. A worker read in full the rest (416 KB: `queue/index.mjs`, `checks.mjs`, `door.mjs`, `schema.mjs`, the other 17 files under `test/m/queue/` with `world.mjs`, `conclude-project.test.mjs`, `docdates.mjs`) and wrote a summary of about 8 KB, every statement citing file and line: how the mint (index.mjs:1080–1100), mute (:1646, :1679), bridge (:1993–2024) and `#dispositionOf` (:703–830, R12's default at :805–829) read the catalogue; that no per-kind FINDING list must grow (`FINDING_ACTS` :660–667 is optional and pinned by docket.test.mjs:219); how `noticeItems` flows in (:893–901, :1008–1011, :1428–1431); and the one whole-catalogue test a new sentence could break (words.test.mjs:329–339, no "obligation", "condition" or "signal"). Nothing it left out mattered: the change is four catalogue rows.

## Completion

**Entries applied.** T36-46 (R1; K2130, K2038, N742): `QUEUE_FINDING_KINDS` (`queuestate.mjs`) gains `security-level-high`, `policy-changed-noticed`, `scan-found` and `security-tool-off`, each with R1's sentence, so `classOfKind` answers `FINDING` for them and notice-producers R12–R15's items pass R11's mint. They take R12's default FINDING disposition with no code change (project-scoped with a project home, else `no_project_scope`; quieted by the item mute), as the draft's Suggestion and "Choices made" 10 say. No catalogue id (R2 unchanged). The R1 mark *(not yet met: T36)* is BOB's to strike.

**Also fixed in my module.** A stale comment, `queue/index.mjs`:209 ("names all eleven" kinds).

**Deferred.** None.

**Found in other modules (no REPORT needed beyond this).** None new. Note for BOB's merge order: R11 refuses the whole feed on an uncatalogued kind, so this catalogue must reach `main` with or before notice-producers' R12–R15 producers (it does: merge order notice-producers → queue in one layer). The R14/R15 kinds were tested against the fake in R1's shape; after notice-producers merges I can re-run against its real producer if BOB asks.

**Tests** (R1 named in `catalogue.test.mjs`' R1 test, extended, and a new `noticed.test.mjs` test "R1, R51, R11, R12: T36's four kinds …" driving `queueFeed` with each kind minted, disposed, muted, and the negative controls `NO_SUCH_KIND`, `KIND_MISCLASSED`):
- `node --test bio-plane/test/m/queue/`: tests 128, pass 128, fail 0.
- `conclude-project.test.mjs`, `docdates.mjs`: pass 2, fail 0.
- Users of queue (classOfKind's answer grew): `store-door` 36/36; `plane` 128/130 and `answer-envelope` 24/26, the four failures identical with and without my change (plane's R6 body-secret pair, red 27; answer-envelope's R7/R2 totality pair, red 11; inherited, rule 5); `system/migrate-released` 1/1.
- No layer tests are named in the manifest.

**Checks.** `format`: 135 modules, 134 requirements files; 0 failures. `architecture queue`: 28 product files, 81 relative imports; 0 failures. `coverage queue`: 41 of 41 live requirement ids named by a test; 0 failures. `ownership queue tranche/T36`: 5 files changed; 0 failures.

**P6.** 2,920 lines (own paths, code only), +11.

Size (session_019AZwL2DAm7ic4sUi9n3hkC): test runs 9, module lines 2920
