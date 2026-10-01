# inquiry (T20)

**Status** · session_01Ay9rNAXKhf7SAcWnuRr9tY · depth 2 · WORKING · handled B1

## J1 · REPORT

Entries (1) and (2) applied and pushed on `job/T20/inquiry`, ready to merge early (B1); (3) waits on inquiry-grammar's L6 merge (its rename is not on `tranche/T20` yet), then I re-point and post COMPLETE.

(1) `Inquiry.COUNT_KEYS` = `["inquiryMigrationReplays"]` (frozen) and `inquiryOf(ctx).counts(hid)`: `inquiry_migration_replays` less `hid` on `COALESCE(bundle_id, '')`, whole for a null `hid`; an unreadable table leaves the key out (R63 answers null, never zero). Plane registers it as `recordOf(ctx).registerCounts("inquiry", [...Inquiry.COUNT_KEYS], (hid) => inquiryOf(ctx).counts(hid))`.
(2) `inquiryLegGrades(host)` → `(legs) => inquiryOf(host).legGrades(legs)`: one `earned(null, distinct targets)` per list, each leg `legCapped(grade, ceiling, target)` in order (null for a target with no ceiling), `[]` for an empty list without asking. Plane registers it as `retrieval.registerLegGrades("inquiry", inquiryLegGrades(ctx))`.
Tests: `test/m/inquiry/exports.test.mjs`, 7 tests naming R52 (registered through R63: whole, through sight for admin/alice/bob/denied/machine, the NULL key, via a stats source and purge's proof before/after a purge; the resolver pinned against `legCapped` as `held.test.mjs`:129–:135 does, `earned` asked once, and registered through the real retrieval's `registerLegGrades`, read through `meaningRows` leg rows). inquiry 163 pass 0 fail (1 todo, pre-existing); plane + retrieval 150/150. format, architecture, coverage (48/48), ownership: 0 failures.
Stale artifact: `bio-plane/dist/bio-plane.bundled.mjs` (its manifest lists `src/inquiry/index.mjs`).
