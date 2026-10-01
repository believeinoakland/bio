# inquiry (T20)

**Status** · session_01Ay9rNAXKhf7SAcWnuRr9tY · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Entries (1) and (2) applied and pushed on `job/T20/inquiry`, ready to merge early (B1); (3) waits on inquiry-grammar's L6 merge (its rename is not on `tranche/T20` yet), then I re-point and post COMPLETE.

(1) `Inquiry.COUNT_KEYS` = `["inquiryMigrationReplays"]` (frozen) and `inquiryOf(ctx).counts(hid)`: `inquiry_migration_replays` less `hid` on `COALESCE(bundle_id, '')`, whole for a null `hid`; an unreadable table leaves the key out (R63 answers null, never zero). Plane registers it as `recordOf(ctx).registerCounts("inquiry", [...Inquiry.COUNT_KEYS], (hid) => inquiryOf(ctx).counts(hid))`.
(2) `inquiryLegGrades(host)` → `(legs) => inquiryOf(host).legGrades(legs)`: one `earned(null, distinct targets)` per list, each leg `legCapped(grade, ceiling, target)` in order (null for a target with no ceiling), `[]` for an empty list without asking. Plane registers it as `retrieval.registerLegGrades("inquiry", inquiryLegGrades(ctx))`.
Tests: `test/m/inquiry/exports.test.mjs`, 7 tests naming R52 (registered through R63: whole, through sight for admin/alice/bob/denied/machine, the NULL key, via a stats source and purge's proof before/after a purge; the resolver pinned against `legCapped` as `held.test.mjs`:129–:135 does, `earned` asked once, and registered through the real retrieval's `registerLegGrades`, read through `meaningRows` leg rows). inquiry 163 pass 0 fail (1 todo, pre-existing); plane + retrieval 150/150. format, architecture, coverage (48/48), ownership: 0 failures.
Stale artifact: `bio-plane/dist/bio-plane.bundled.mjs` (its manifest lists `src/inquiry/index.mjs`).

## J2 · COMPLETE

Completion (B1 with B2's CHANGE).

**Entries applied.** (1) R52 (1): `Inquiry.COUNT_KEYS` (`["inquiryMigrationReplays"]`) and `counts(hid)`, for plane to register through record-core R63 under `inquiry`. (2) R52 (2): `inquiryLegGrades(host)` (over the instance's `legGrades(legs)`), for plane to register as `inquiry` through `retrieval.registerLegGrades`. Neither is registered by this module. (3) K850: `src/inquiry/grammar.mjs` (:9, :20) and `test/m/inquiry/grammar.test.mjs` (:198) read `INQUIRY_GRAMMAR_CHECKS`, values unchanged (tranche/T20 @ K897 merged in).

**R52 and its tests** (not yet met in the requirements; met by this job, for BOB to strike): `test/m/inquiry/exports.test.mjs`: (1) "R52 (1) the figure source…", "R52 (1) R63: the registered figure counts as plane's held copy…", "R52 (1) R63: a figure whose table cannot be read…", "R52 (1) R63: through op=stats' source… purge's proof…"; (2) "R52 (2) R14: the resolver caps each leg's capture letter…" (the `held.test.mjs`:129–:135 pin, re-stated), "R52 (2) R14: the resolver asks R13's earned once…", "R52 (2) retrieval R55, R12: registered through registerLegGrades as `inquiry`…".

**Deferred.** None.

**Found in other modules / for BOB.** (a) Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; its manifest lists `src/inquiry/index.mjs`). (b) This module's requirements, Uses, still name `INQUIRY_GRAMMAR_ROWS`; the code now reads `INQUIRY_GRAMMAR_CHECKS` (wording only, BOB's file).

**Tests and checks.** `node --test test/m/inquiry/`: tests 164, pass 163, fail 0, todo 1 (pre-existing). `test/m/plane/ test/m/retrieval/ test/m/inquiry-grammar/`: 174 pass, 0 fail. format: 0 failures; architecture: 0 failures; coverage: 48 of 48 live ids named, 0 failures; ownership vs tranche/T20: 0 failures.

Size (session_01Ay9rNAXKhf7SAcWnuRr9tY): test runs 9, module lines 3813
