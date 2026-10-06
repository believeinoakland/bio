# actions (T34)

**Status** · session_01MQWGCmPcNPVZhKxVGr8qu1 · depth 2 · COMPLETE · handled B1

## Completion (ACTIONS #13)

**Entries applied.**
- **T34-67 (N611; R68).** `place()` (`index.mjs`, a method) and `zoneOf` (module-level) confirmed against R68: `place()` reads the active profiles at each call (`getSetting` then `jurisdictions.combine`), answers the combined view or null (none active, an empty list, a profile that does not combine, the setting unreadable), writes nothing, never throws; `zoneOf` answers the view's `time_zone` value, a string read as the zone itself, else null. One flaw fixed: `zoneOf` could throw on a hostile object (a getter that throws); it now answers null. Both named as R68's in their doc comments and the module header. Read through them with no zone held, every local day is null (`localToday`, `actionFacts`' `clock_overdue`, retrieval's registered facts), never the UTC day.
- **T34-67 (K1830; R69).** `holdsOn({project})`: R58's answer for one project read as the plane (the earliest `in_place` statement still in place recording it, `{held: true, since, recorded_by}`; else `{held: false}` after reading every hold; `null` when no project is named or the holds cannot be read). Writes nothing, never throws, names no action, entry or reason. Registered once at start with `ratification.registerHoldReader` from `actionsOf`; a refusal (`HOLD_READER_DECLARED`) leaves the reader already held standing.
- **T34-87 (DEC-149).** The three rows BOB listed: `CONTACT_NOT_A_MEMBER_DETAIL` → "contact names a member of your group by member id, …" (needs no name); `ACTION_KIND_UNKNOWN`'s detail → "is not a kind your group's Civicsmith offers"; `ACTION_NO_DETERMINATION`'s detail → "no determination can be read on your group's Civicsmith yet". `:2204` and `:2727` (now shifted) stay, as BOB ruled. These are details, not check translations: no catalogue row changed, so no version moves.

**A technical choice (recorded for BOB's rulings).** How `actionsOf` reaches ratification: the `ratification` dep when given (`null` registers none); otherwise `ratificationOf(host)` **only when started with an `env`** (the composition root: `plane/store.mjs` calls `actionsOf(ctx, { env })` and then `ratificationOf(ctx)` with no deps, so creating it one call earlier is the same instance). Reason: reaching it unconditionally created ratification on every module's test host that calls `actionsOf(host)`, registering ratification's promotion step there, and its check fails on those hosts' missing tables (measured: 11 of this module's own tests went red, e.g. `no such table: inquiry_bundle_facts`). With the gate, every dependent's suite is as it was (below). Without plane changes, `op=publishat` stops answering `SCHEDULE_UNCHECKABLE` for want of a reader once this merges.

**Deferred.** None.

**Found in other modules.**
- `monitoring`: `R18 a document whose substance has not moved …` fails on `tranche/T34` without this change (reproduced with my change stashed); not among the inherited reds the START names.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (the plane's source), regenerated at the layer close.

**Tests** (each `node --test bio-plane/test/m/<m>/`):
- actions: 96 pass, 0 fail (new `t34.test.mjs`: R68 ×3, R69 ×4 including one against the real ratification's `op=publishat` and `publishScheduled`, and the DEC-149 details; the fixture now hands a ratification stand-in, R69).
- users of what changed: retrieval 139/0, queue-producers 85/0, ratification 212/0, action-plans 61/0, action-clocks 51/0, escalation 61/0; filings 63/1 (the inherited `chronology` R33 red, K1795), plane 109/1 (the inherited `store.test.mjs` R2/R10 red, K1832), monitoring 114/1 (the pre-existing R18 red above); the same reds with and without this change.

**Checks:** format: 127 modules, 126 requirements files; 0 failures · architecture: 15 product files, 63 relative imports; 0 failures · coverage: 57 of 57 live requirement ids named by a test; 0 failures · ownership: 4 files changed by actions between tranche/T34 and HEAD; 0 failures.

Size (session_01MQWGCmPcNPVZhKxVGr8qu1): test runs 9, module lines 3364
