# queue-producers (T34)

**Status** · session_012tuSfiT13aFdZLyebrLHE1 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings; I carry on with each meanwhile (none blocks the next step).

(1) `modules.json`: queue-producers' `uses` lacks `case-tensions` (layer 8, earlier), which R6 now reads (its R4) and the requirements' Uses names (T34, N612). Reading: BOB adds the edge (as K1675 (1) did for civil-time). I reach it as `caseTensionsOf(host)` after touching `publication` (publication registers case-tensions' provider at start, K1505 (3); case-authoring does the same). Until the edge is added, `architecture.mjs` will report the import.

(2) R39's read, `wizard-scripts.baseUpdates` (its R26), is not on `tranche/T34` yet and R26 names no field names. Reading, which I code to and would ask WIZARD-SCRIPTS #3 to answer (or BOB to rule otherwise): `baseUpdates({after?, limit?, viewer?})` → `{ok, entries: [{copy, copy_version, name, project, base, base_name, based_on, base_version, found_at, recipients: [member ids]}], cursor, truncated}`, where `copy` is the copy's script id, `based_on` the base version the copy records, `base_version` the newer approved version id, `found_at` R26's instant first found (the item's age), and the two step lists under `steps: {copy, base}` (carried on the basis, not in member text). R39's key is `FINDING::wizard-base-updated::<copy>::<base_version>::<member>`; options `wizardread` (see what changed) and `wizardrevise` with `adopt: {base}` (R4). I accept `items` for `entries` too.

(3) R38's registered read, `instance-setup.placeArrivals` (its R62), read as the plane: reading `placeArrivals({viewer: null})` → `{ok, arrivals: [{name, profile, profile_name, covers, found_at}]}` (an array answered bare is accepted too). The item: CONDITION `place-profile-arrived`, keyed `CONDITION::place-profile-arrived::<profile>`, to every active administrator (`membership.activeAdmins`, R86), no project home, offering `{id: "placeset", ...}` (instance-setup R14's act of choosing a place; I name the op `placeset` unless BOB names another), aged from `found_at`. `registerPlaceArrivals` refuses a second call by throwing `PLACE_ARRIVALS_REGISTERED` (a programming error, per Suggestions).
