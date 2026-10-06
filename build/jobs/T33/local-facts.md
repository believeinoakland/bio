# local-facts (T33)

**Status** · session_01UrBMVXpBq34KGAWaYpcZ3K · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Five points on T33-28; I carry on with my best reading of each and stop for none.

1. **`modules.json` uses (BOB's file).** local-facts' row still lists `record-grammar, jurisdictions, record-core, membership`; the requirements' Uses (and the plan entry) add `civil-time`, `lines` and `connection-grammar`. Importing `civil-time` and `connection-grammar` fails `checks/architecture.mjs` until the row gains them. Best reading: you add all three to the row on `tranche/T33`; I import `civil-time` (`localDay`) and `connection-grammar` (`BOUNDS`) now.
2. **Reaching `lines`.** `lines` has no code yet (its job is running) and its requirements name no host factory. Best reading: `localFactsOf(host, deps)` takes `deps.lines` (any object with `structureAt`, lines R10); the composition root passes lines' instance once it exists. With none given, `governingPath` answers the profile fallback saying `lines` is not reachable on this host (never throws). Please name lines' factory if you want a default import after lines merges.
3. **Entity → profile office (R6 `governingPath`).** R6 says "the fact of the nearest entity it is `part_of` … that the profile holds", but no requirement says how an entity is known to be a profile office `{role, body}` (ladders §5.4's bridge seeds each office as an entity at setup; its identifying mark is not specified). Best reading: `deps.officeOf(entityId, profile)` → `{role, body}` | `{venue}` | null, supplied by the composition root (instance-setup's seeding is its source); without it no parent maps, so the walk ends in the fallback, saying why. If a scheme identifier is the intended mark, name the scheme and I read it through the reader instead.
4. **Which zone, and an undetermined horizon (R3).** Best reading: the zone is the value of the fact's profile's `time_zone` that governs here (a local correction of `<profile>/time_zone`, else the held profile's own); a profile with none gives `horizon: {undetermined: true, why}` and `due: null`; a confirmation whose horizon is undetermined reads `unconfirmed` (it cannot be shown in force; D77), with `why` naming the confirmation and the missing zone, and `factsDue` lists it.
5. **Displayed days.** Best reading: every day R2 shows (in `why`, the correction's "corrected locally by <member>, <date>") is the local day of the act's instant in that zone, the same as R3 counts; the stored `at` stays the UTC instant.

## J2 · QUESTION

**Replaces J1** (its five points unchanged, a sixth added). Code for all six readings is pushed (74392e1c4b); module tests 32 pass, 0 fail.

1. **`modules.json` uses (BOB's file).** local-facts' row still lists `record-grammar, jurisdictions, record-core, membership`; the requirements' Uses (and the plan entry) add `civil-time`, `lines` and `connection-grammar`. Importing `civil-time` and `connection-grammar` fails `checks/architecture.mjs` until the row gains them. Best reading: you add all three to the row on `tranche/T33`; I import `civil-time` (`localDay`) and `connection-grammar` (`BOUNDS`) now.
2. **Reaching `lines`.** `lines` has no code yet (its job is running) and its requirements name no host factory. Best reading: `localFactsOf(host, deps)` takes `deps.lines` (any object with `structureAt`, lines R10); the composition root passes lines' instance once it exists. With none given, `governingPath` answers the profile fallback saying `lines` is not reachable on this host (never throws). Please name lines' factory if you want a default import after lines merges.
3. **Entity → profile office (R6 `governingPath`).** R6 says "the fact of the nearest entity it is `part_of` … that the profile holds", but no requirement says how an entity is known to be a profile office `{role, body}` (ladders §5.4's bridge seeds each office as an entity at setup; its identifying mark is not specified). Best reading: `deps.officeOf(entityId, profile)` → `{role, body}` | `{venue}` | null, supplied by the composition root (instance-setup's seeding is its source); without it no parent maps, so the walk ends in the fallback, saying why. If a scheme identifier is the intended mark, name the scheme and I read it through the reader instead.
4. **Which zone, and an undetermined horizon (R3).** Best reading: the zone is the value of the fact's profile's `time_zone` that governs here (a local correction of `<profile>/time_zone`, else the held profile's own); a profile with none gives `horizon: {undetermined: true, why}` and `due: null`; a confirmation whose horizon is undetermined reads `unconfirmed` (it cannot be shown in force; D77), with `why` naming the confirmation and the missing zone, and `factsDue` lists it.
5. **Displayed days.** Best reading: every day R2 shows (in `why`, the correction's "corrected locally by <member>, <date>") is the local day of the act's instant in that zone, the same as R3 counts; the stored `at` stays the UTC instant.
6. **Holiday entries of a named closure list (`jurisdictions` R47).** R6's paths name a year and its `offices` only, but a profile may now hold several entries for one year and offices, one per `list` (the test profile: 2026 for all offices, `list: court` and `list: town`). Before this job `<profile>/holidays/2026` silently named whichever entry came first. Done (a fix in my module): a path names only the office-calendar entry (no `list`), so a list entry is never a local fact here. Question: should R6 name list entries too (for example a `list=<name>` part, absent for the office calendar), so members can confirm a court's judicial holidays? Best reading: not in T33-28; a requirement for a later entry, which `action-clocks` (its `factOf` per calendar entry) would then use.

## J3 · REPORT

Applied B2: merged tranche/T33 @ e07becea (aa4a17fb25). Architecture now 0 failures; module tests 32 pass, 0 fail; format, coverage (9 of 9), ownership clean. Next step, per K1563 (1): once LINES merges into tranche/T33, I merge it, default deps.lines to linesOf(host), re-point R6's governingPath tests at the real lines (beside the injected reader), re-run steps 5-7 and post COMPLETE. Until then nothing else is left. Please ring me when lines is on tranche/T33.

## J4 · COMPLETE

T33-28 done on `job/T33/local-facts` (tranche/T33 merged after LINES #1, K1577).

**Entries applied (T33-28; K1438, K1444, K1563):**
- **R3** Horizons on local days of the fact's profile's zone through `civil-time.localDay`: a year's end, 1 November and the 183rd day each fall at the zone's local midnight, the confirmation's own day taken locally too; the zone is the profile's `time_zone` as it governs here (a member's correction, else the profile's). No zone: `horizon: {undetermined, why}`, `due: null`, a confirmation not shown in force (J2 (4)). The UTC-day site (`index.mjs:53`) is gone; days shown in `why`/`says` are local (J2 (5)).
- **R6** `governingPath({profile, fact, office, entity?, at, year?, viewer})`: the office's own fact; else upward along `part_of` through `lines.structureAt` (one line at a time, at most `BOUNDS.depth_default`, naming each line) to the nearest entity `officeOf` maps to an office the profile holds a fact for; else the `offices` grouping (a year's entry for every office), saying why. An undetermined line, two parents, a truncated read, a refusal, a loop or the depth stop the walk with why. Writes nothing, never throws. `deps.lines` defaults to `linesOf(host)` (K1563 (1)); `deps.officeOf` comes from the composition root (J2 (3), recorded for plane's START). `factPath` stays pure.
- **R9** `local_fact_acts` declared through `record-core.declareTable`: purge clear, expunge none, export admin-only, sight group, derive stored, version_chain true, no bundle key (R5's purge kept).
- **R7** unchanged; `LOCAL_FACT_HORIZONS`' comment now says local days.

**A flaw fixed in my module:** with `jurisdictions` R47 a profile holds several entries per year and offices, one per closure `list`; a holiday path silently named whichever came first. Paths now name the office calendar's entry (no `list`) only; list entries are not local facts here (J2 (6); naming them is N562).

**Deferred:** none.

**Found in other modules / artifacts:**
- `bio-plane/dist/bio-plane.bundled.mjs` (bundler's generated artifact) is stale: it inlines local-facts' old `declarePurge` call and `LOCAL_FACTS_TABLES` shape. For BOB's regeneration at layer close (mechanics §14).
- Consumers: `action-clocks`, `filings` and the UI read `why`/`says` text from `factStatus`; its days are now local days of the profile's zone (the test profile's Halifax: 01:00Z shows the previous day). Their R10 and R9/R30 tests are already named reds (K1519); when their jobs green them, expect local days there.
- `plane`: should pass `officeOf` (entity → profile office, the ladders §5.4 bridge) to `localFactsOf`; without it the `part_of` walk always falls back, saying so.

**Tests (step 5):** `node --test bio-plane/test/m/local-facts/`: 33 tests, 33 pass, 0 fail; every live id R1–R9 named; R6 run over the real `lines` (linesOf(host)) as well as an exact reader. Users of local-facts and lines (`action-clocks`, `filings`, `queue-producers`, `affordances`, `control-plane`, `plane`, `lines`): 609 tests, 599 pass, 10 fail, the identical 10 with identical assertion output on plain `tranche/T33` @ the merged head: the 7 named reds of B1 (action-clocks R10 ×3, filings R9 and R30, affordances N364's ops, control-plane R26) and three red on the tranche already (affordances "R3 R7 R12: layer 9's 41 mutating ops", control-plane "R22 CHECK_FAMILIES is total" and "R43, R22: every code decorated"), none local-facts'.

**Checks (step 6):** format: 126 modules, 125 requirements files; 0 failures · architecture: 11 product files, 32 relative imports; 0 failures · coverage: 1 modules, 9 of 9 live requirement ids named by a test; 0 failures · ownership: 8 files changed by local-facts between tranche/T33 and HEAD; 0 failures.

**Final uses:** record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, lines (as modules.json now has them).

Size (session_01UrBMVXpBq34KGAWaYpcZ3K): test runs 16, module lines 752
