# local-facts (T33)

**Status** · session_01UrBMVXpBq34KGAWaYpcZ3K · depth 2 · WORKING · handled B1

## J1 · QUESTION

Five points on T33-28; I carry on with my best reading of each and stop for none.

1. **`modules.json` uses (BOB's file).** local-facts' row still lists `record-grammar, jurisdictions, record-core, membership`; the requirements' Uses (and the plan entry) add `civil-time`, `lines` and `connection-grammar`. Importing `civil-time` and `connection-grammar` fails `checks/architecture.mjs` until the row gains them. Best reading: you add all three to the row on `tranche/T33`; I import `civil-time` (`localDay`) and `connection-grammar` (`BOUNDS`) now.
2. **Reaching `lines`.** `lines` has no code yet (its job is running) and its requirements name no host factory. Best reading: `localFactsOf(host, deps)` takes `deps.lines` (any object with `structureAt`, lines R10); the composition root passes lines' instance once it exists. With none given, `governingPath` answers the profile fallback saying `lines` is not reachable on this host (never throws). Please name lines' factory if you want a default import after lines merges.
3. **Entity → profile office (R6 `governingPath`).** R6 says "the fact of the nearest entity it is `part_of` … that the profile holds", but no requirement says how an entity is known to be a profile office `{role, body}` (ladders §5.4's bridge seeds each office as an entity at setup; its identifying mark is not specified). Best reading: `deps.officeOf(entityId, profile)` → `{role, body}` | `{venue}` | null, supplied by the composition root (instance-setup's seeding is its source); without it no parent maps, so the walk ends in the fallback, saying why. If a scheme identifier is the intended mark, name the scheme and I read it through the reader instead.
4. **Which zone, and an undetermined horizon (R3).** Best reading: the zone is the value of the fact's profile's `time_zone` that governs here (a local correction of `<profile>/time_zone`, else the held profile's own); a profile with none gives `horizon: {undetermined: true, why}` and `due: null`; a confirmation whose horizon is undetermined reads `unconfirmed` (it cannot be shown in force; D77), with `why` naming the confirmation and the missing zone, and `factsDue` lists it.
5. **Displayed days.** Best reading: every day R2 shows (in `why`, the correction's "corrected locally by <member>, <date>") is the local day of the act's instant in that zone, the same as R3 counts; the stored `at` stays the UTC instant.
