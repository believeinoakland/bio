# queue-producers (T34)

**Status** · session_012tuSfiT13aFdZLyebrLHE1 · depth 2 · WORKING · handled B6

## J1 · QUESTION

Three readings; I carry on with each meanwhile (none blocks the next step).

(1) `modules.json`: queue-producers' `uses` lacks `case-tensions` (layer 8, earlier), which R6 now reads (its R4) and the requirements' Uses names (T34, N612). Reading: BOB adds the edge (as K1675 (1) did for civil-time). I reach it as `caseTensionsOf(host)` after touching `publication` (publication registers case-tensions' provider at start, K1505 (3); case-authoring does the same). Until the edge is added, `architecture.mjs` will report the import.

(2) R39's read, `wizard-scripts.baseUpdates` (its R26), is not on `tranche/T34` yet and R26 names no field names. Reading, which I code to and would ask WIZARD-SCRIPTS #3 to answer (or BOB to rule otherwise): `baseUpdates({after?, limit?, viewer?})` → `{ok, entries: [{copy, copy_version, name, project, base, base_name, based_on, base_version, found_at, recipients: [member ids]}], cursor, truncated}`, where `copy` is the copy's script id, `based_on` the base version the copy records, `base_version` the newer approved version id, `found_at` R26's instant first found (the item's age), and the two step lists under `steps: {copy, base}` (carried on the basis, not in member text). R39's key is `FINDING::wizard-base-updated::<copy>::<base_version>::<member>`; options `wizardread` (see what changed) and `wizardrevise` with `adopt: {base}` (R4). I accept `items` for `entries` too.

(3) R38's registered read, `instance-setup.placeArrivals` (its R62), read as the plane: reading `placeArrivals({viewer: null})` → `{ok, arrivals: [{name, profile, profile_name, covers, found_at}]}` (an array answered bare is accepted too). The item: CONDITION `place-profile-arrived`, keyed `CONDITION::place-profile-arrived::<profile>`, to every active administrator (`membership.activeAdmins`, R86), no project home, offering `{id: "placeset", ...}` (instance-setup R14's act of choosing a place; I name the op `placeset` unless BOB names another), aged from `found_at`. `registerPlaceArrivals` refuses a second call by throwing `PLACE_ARRIVALS_REGISTERED` (a programming error, per Suggestions).

## J2 · REPORT

Progress, and one naming point. Pushed on `job/T34/queue-producers` (tranche/T34 merged through B3).

Done before the split's merge (95/95 module tests; queue 124/124, plane `watch.test.mjs` 3/3; format, architecture, coverage 35/35 and ownership all 0 failures):
- T34-82: R37 (`edition-scheduled`, `edition-published-as-scheduled`, `scheduled-edition-stopped`, over the real `publication.scheduledEditions` entry shape), R38 (`registerPlaceArrivals` and `place-profile-arrived`).
- T34-92: R39 (`wizard-base-updated`, to the shape B2 ruled).
- T34-54's parts outside the moved code: R6 reads `case-tensions` R4; R15 and R18 read the item's own `zone` (now tested for R18 too); R24's "status" checked over every summary, detail and option.
- T34-87: the six DEC-149 rows that stay here (:218, :1623, :3487, :3560, :3612, :3741), each named by a test.

**R38's option (B2 (3)).** instance-setup's code already names R14's act: `op=profilesset` (`op-declarations` declares it; instance-setup R14's `profilesSet`). So the item offers `{id: "profilesset"}`, not `placeset`. Nothing for INSTANCE-SETUP #13 to rename.

Next: once `machinery-producers` merges, I delete the moved copy, delegate to `conditionItems`, and drop the copied tests. I'm at 4,257 lines now and expect about 3,440 after the deletion. I'm waiting for your CHANGE.

## J3 · COMPLETE

T34-54, T34-82, T34-92 and this module's T34-87 rows: all applied. B1–B4 handled; `tranche/T34` merged (machinery-producers included). Head: 2bc91a0283 on `job/T34/queue-producers`.

**Entries applied**
- **T34-54.** The moved copy is deleted (R3, R22, R26, R27 producers; their helpers, statics and getters). `feedItems` now calls `machineryProducersOf(host, <this module's deps>).conditionItems` where `#queueConditions` stood, passing the same `homesOf`/`optionsOf`. It is built lazily, so injected deps reach it. `static SWEEP_CONDITION_KINDS` is kept as an alias of machinery-producers'. R8 and R36 are met as re-worded.
  - R6 reads `case-tensions.caseTensions` (its R4), reaching `publication` first so its provider is registered (K1505 (3)).
  - R15 and R18 read the item's own `zone`, else `zoneOf(actions.place())`.
  - R24: no summary, detail or option says "signal"; the codes are unchanged.
- **T34-82.**
  - R37: `edition-scheduled` ("Signed · publishes <date, time>", the time as set and never converted, offering `publishatmove`/`publishatcancel`), `edition-published-as-scheduled`, `scheduled-edition-stopped` (each reason in its own translation). These go to the time's setter and the project's owners; a cancelled edition earns none.
  - R38: `registerPlaceArrivals` (a second call `PLACE_ARRIVALS_REGISTERED`, a non-read `PLACE_ARRIVALS_MALFORMED`) and `place-profile-arrived` to active administrators, with no home, offering `profilesset` (K1864 (2)).
- **T34-92.** R39: `wizard-base-updated`, per entry and recipient of `baseUpdates`, in the shape B2 ruled, offering `wizardread` and `wizardrevise`. Its tests use a fake in that shape; wizard-scripts R26's real read is not yet on the tranche.
- **T34-87.** The six rows (:218, :1623, :3487, :3560, :3612, :3741) say "your group's Civicsmith", each named by a test. The rows BOB kept (:1222, :3649, :3675) are unchanged. No check translation changed, so no catalogue version moves.

**Tests** were changed at the interface only:
- removed: `conditions.test.mjs`, `producers.test.mjs` R3 arms, `sweeps.test.mjs` R26/R27 arms (machinery-producers' now);
- added: `scheduled.test.mjs` (R37), `arrivals.test.mjs` (R38, R39), and in `localday.test.mjs` R15/R18 read in each item's own zone;
- in `feeditems.test.mjs`: R8, R12 and R24 widened, a DEC-149 test added, and R24's assertion on the moved items now reads machinery-producers' "status".

**Deferred:** none.

**Found elsewhere**
1. **`uses` edges no remaining code imports:** `host-governor`, `capture`, `link-sweep`, `network-notices` (moved with the split), and `inquiry`. `inquiry` was imported by nothing before this job either; the module reads `inquiry_basis` and `inquiry_basis_version_legs` by SQL (R2's lead, inquiry's read contract), so dropping `inquiry` is BOB's call. `capture-requests`, `monitoring`, `record-core` and `provenance` are still imported.
2. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (this module's and machinery-producers' sources changed). It is regenerated at the layer close.
3. **machinery-producers:** its moved basis details still say "this instance's governor" and "this instance's renderer" (:487/:2013 here before the split). BOB ruled these developer-facing text; noted only.

**Tests and checks**
- queue-producers: 79 pass, 0 fail.
- machinery-producers + queue + plane `watch.test.mjs`: 151 pass, 0 fail.
- format: 0 failures. architecture: 0 failures. coverage: 35 of 35 live ids named, 0 failures. ownership: 8 files, 0 failures.

**Size (session_012tuSfiT13aFdZLyebrLHE1):** test runs 12, module lines 3,429.

## J4 · COMPLETE

B6 applied: `tranche/T34` merged (wizard-scripts included). Head: see the push after this entry on `job/T34/queue-producers`.

- R39 now has a test against wizard-scripts' real `baseUpdates` (`wizard.test.mjs`, "R39 against wizard-scripts itself"). In it a base is approved, bob copies it, and a newer base version is approved. Each of the copy's approvers is told once, named in R26's recipients; the item carries both step lists and ages from R26's `found_at`. Nobody else is told. Once an editor grant exists, only the editor is told.
- The real shape matches B2's ruling field for field; no code change was needed. The fake-based R39 arms stay for the hidden-project and paging cases, labelled as such.
- Everything else is as J3 reported (entries, deferred: none, findings elsewhere).

**Tests and checks**
- queue-producers: 80 pass, 0 fail.
- machinery-producers + queue + plane `watch.test.mjs`: 151 pass, 0 fail.
- format: 0 failures. architecture: 0 failures. coverage: 35 of 35, 0 failures. ownership: 11 files, 0 failures.

**`uses` edges no code imports:** `host-governor`, `capture`, `link-sweep`, `network-notices`. Per B5, `inquiry` stays.

**Size (session_012tuSfiT13aFdZLyebrLHE1):** test runs 15, module lines 3,429.
