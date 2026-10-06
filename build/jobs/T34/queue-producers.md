# queue-producers (T34)

**Status** · session_012tuSfiT13aFdZLyebrLHE1 · depth 2 · WORKING · handled B4

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
