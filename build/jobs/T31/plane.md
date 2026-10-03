# plane (T31)

**Status** · session_01LnpxMYtH7V2Q35ERcJveMR · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R19 (N528), my readings; I carry on with R20 meanwhile and compose R19 once wizard-scripts merges.
1. **The Civicsmith library** "carried in the bundle" (wizard-scripts' Suggestions: "its path BOB's at the job's opening"; none given in any START): I read it as wizard-scripts' own data file under its paths, exported (e.g. `CIVICSMITH_LIBRARY`, empty of scripts), which plane imports. Please name the path/export, or tell WIZARD-SCRIPTS #1.
2. **The screen registry** "carried in the plane's bundle, empty until the new interface ships one": I read it as a plane-owned file, `bio-plane/src/plane/screens.mjs` exporting `SCREENS = Object.freeze([])` (in my paths), replaced when the UX stream ships one.
3. **The member op table** (`op-declarations`): I read it as op-declarations' `OPS` (its R15 declares the wizard ops there), passed as `ops`; `machineRefused` = `Object.keys(MACHINE_REFUSALS)`; `machineDrafts` = `["whatchangedpropose", "escalationreasondraft"]` held as a constant in plane (case-authoring R39 exports no list) unless a provider exports one.
4. **The release suite**: `bio-plane/test/m/plane/release.test.mjs`, titled R19, asserting `requiredFailures({...the registration})` is `[]`; the `regression` workflow's `npm test` in `bio-plane/` runs it, so a release requires it. A negative control with a test library whose required script fails.
5. Factory names as wizard-scripts' Suggestions: `wizardScriptsOf(ctx, deps)`, `.migrate()`, `.wizardRegister(...)`, `wizardScriptsOps(m, url, body)`, `requiredFailures` exported; ops spread directly after ... I place the map at wizard-scripts' place in R5's order (layer 11, before instance-setup's and control-plane's). Its tables declared to purge by its own factory (as filing-templates).
Found (R20): `queue`'s `Queue.PRODUCER_DEPS` (queue's file; queue has no T31 job) lacks `caseImport` (and `wizardScripts`), so a `caseImport` handed to `queueOf` is filtered out before `queue-producers`. Behaviour still holds on the plane, since queue-producers falls back to `caseImportOf(host)`, the one per-host instance, but R20's "hands queue the dep" cannot be shown through queue without queue's change. I hand it anyway and test that queue-producers' reader is the plane's instance; please decide whether queue needs an entry.

## J2 · QUESTION

Replaces nothing; R19 and R20 are built and tested (plane 86/86 incl. migrate-released; format 0, coverage 0, ownership 0). One architecture failure and one finding.
1. QUESTION (architecture): R20's queue clause is shown by `test/m/plane/watch.test.mjs` reading `queueProducersOf(ctx).feedItems` (the one per-storage producers instance the plane's queue builds): the watch's `followed-case-entry` items reach the setter and not another member. `architecture.mjs` fails: plane does not declare `queue-producers` in `uses`. My reading: add `queue-producers` to plane's `uses` as a test-only read (as R13's `subresources`/`bundler`), Uses line "`queue-producers`: `queueProducersOf` and `feedItems`, read by R20's test only". The door's `op=queue` cannot show it today (finding 2).
2. REPORT (queue, no T31 job): queue's kind vocabulary (`bio-plane/src/queuestate.mjs`, `classOfKind`) lacks T31's new item kinds: `followed-case-entry`, `cited-docket-entry-refused`, `cited-docket-unreadable` (queue-producers R35) and `wizard-approval-requested` (and any `wizard-*` kind of R32). On the composed plane, once a watch reads one entry, the setter's whole `op=queue` answers `NO_SUCH_KIND` (C-31.2): reproduced on the plane object (import, `importwatch`, monitoring tick, `queue?member=alice`). Against queue's requirement that every produced item is minted with its class, and it blanks the member's whole queue. Suggest it ride N545 (T32) with the PRODUCER_DEPS change.
3. Stale: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) from my plane source changes (regenerated at L11's close).

## J3 · COMPLETE

Merged `tranche/T31` @ queue's merge (K1407); head bd590949bb.

**Entries applied**
- N528, R19: `wizard-scripts` built in `src/plane/store.mjs` first in layer 11 (after link-sweep, before control-plane's step and queue), migrated in R3's pass after filing-templates, tables declared to purge by its factory, ops map routed after review's and before instance-setup's. Registered once before the first request through `src/plane/wizards.mjs`' `wizardRegistration()`: `SCREENS` (`src/plane/screens.mjs`, empty; K1396), op-declarations' `OPS`, `Object.keys(MACHINE_REFUSALS)`, `MACHINE_DRAFTS` (`whatchangedpropose`, `escalationreasondraft`) and `CIVICSMITH_LIBRARY`. Release suite: `test/m/plane/release.test.mjs` (`requiredFailures` empty, with a negative control), run by `regression`'s `npm test`.
- N534, R20: the plane's `case-import` instance handed to `monitoring` (`{env, caseImport}`) and to `queue` (`caseImport` in its deps); `case-import`'s `moves` registration filled at start (R16/R17's order). `test/m/plane/watch.test.mjs` drives it end to end: a real signed case file imported, `importwatch` through the door, monitoring's cadence tick reading a signed docket, the read recorded on the plane's instance, the edition read back through `accepted-work.publisherMoves`, and the watch's items reaching the setter only, at queue-producers and through the door's `op=queue`.
- B1's red: `accepted.test.mjs` R17/R5 pins case-import's ten ops; B3: `door.test.mjs` N13 follows affordances R37 (`affordancescreens`). `maps.mjs` gains wizard-scripts' map.

**Deferred** none.

**Found in other modules** (reported J1, J2; dispositions K1396, K1405, K1407): queue's `PRODUCER_DEPS` lacked `caseImport`/`wizardScripts`, and queue's kind vocabulary lacked T31's new item kinds (a setter's whole queue answered NO_SUCH_KIND); both carried by queue's T31 job. Stale: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (plane source changed; L11 close regenerates).

**Tests and checks**
- `node --test test/m/plane/ test/system/migrate-released.test.mjs`: tests 86, pass 86, fail 0, skipped 0.
- format: 98 modules, 97 requirements files; 0 failures. architecture: 0 failures. coverage: 20 of 20 live ids; 0 failures. ownership: 10 files changed by plane; 0 failures.

Size (session_01LnpxMYtH7V2Q35ERcJveMR): test runs 16, module lines 586
