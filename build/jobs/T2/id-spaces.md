# T2 · id-spaces — job record

Session: `session_01JxBcyrvDmhXth7LevtRM2H` (ID-SPACES #1)

**Status** · COMPLETE, 2026-09-26, re-run after BOB's CHANGE (jurisdictions merged): `origin/tranche/T2` @ 1d8f9c8e0e merged into `job/T2/id-spaces`, the untracked copy of `jurisdictions/` dropped, steps 5–7 repeated against the real `oakland-alameda` profile. Job for module `id-spaces`, tranche T2. No open question; K35 and K45 applied (K45: `CMS_FLOOR` in R26; R21's `referent.by` exactly "the caller's reading", as built).

## Entries applied

- **N2** · `bio-plane/src/idspaces.mjs` takes every space's forms, the enactment kinds and their floors, the systems, the mixed hosts and the crosswalks from `view` (the combined view, with its `conflicts`; a whole `combine` result is accepted too). Spaces renamed `enactment`, `project`, `fund`, `parcel`. Services: `spaces`, `recognise`, `reach`, `parcelStanding`, `systemOf`, `judgePair` (R1–R25). No place is named (R24): every Oakland fact now lives in the `oakland-alameda` profile.
- **K35 / R26** · the legacy adapter at the foot of the module: `ID_SPACES`, `recognise(space, raw)`, `apnStanding`, `systemOfAddresses`, `judgePair(space, a, b, reading?)` over the view `combine` makes of every non-test held profile, `cms`↔`enactment`, `apn`↔`parcel` mapped in and out. The old call shape of `recognise`/`judgePair` is told by a string first argument. Also `CMS_FLOOR` (each kind's floor in that view), which the old battery imports; K45 added it to R26.
- **T2-6** · `bio-plane/test/m/id-spaces/`: `idspaces.test.mjs` (26 tests, R1–R25), `legacy.test.mjs` (6 tests, R26), `fixtures.mjs` (four made-up test profiles: two jurisdictions with different forms, systems and a crosswalk; one disagreeing on a floor; one with a kind and no floor). Every view is made by the real `jurisdictions.combine`, which validates each profile.

## Decisions made in the job (for BOB to record if he wishes)

- A form's pattern is matched against the whole cleaned value (`^(?:re)$`); a kind prefix and a `clean.strip` pattern at the start (`^(?:re)`); a system's `path` anywhere in path+query. An uncompilable pattern matches nothing.
- R9's conflict is found in `conflicts` by an `at` naming the kind and the word `floor` (combine writes `spaces.enactment.kinds[<kind>].floor`).
- With no kind (R7), a kind whose floor is absent or withheld makes the answer `UNDETERMINED`, naming why.
- R17 with a crosswalk: a pair joining the two values continues to the system checks (`says` names the crosswalk's source); a crosswalk that maps the value to another partner gives `VALUES_DIFFER` (never a near miss); one that lists no partner leaves the forms `FORMS_UNJOINED`.
- R18's near miss compares the normals with the leading zeros of every digit run removed.
- R21: `referent.by` is `"the caller's reading"` and `says` adds that this module did not make it and cannot check it. The old battery asserts `by` exactly, so the longer `by` I first wrote failed `rec203`; I read R21 as met by the two fields together.
- R8: `says` keeps the words `never "not found"`, which `rec203` asserts; the module's own test checks that "not found" appears only in that phrase.

## Deferred

None.

## Found in other modules (REPORT)

- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`; BOB regenerates at the layer close). `idspaces.mjs` changed and now imports `jurisdictions/index.mjs` and its profiles, which become new bundle inputs.
- **legacy-tests:** `bio-plane/test/nc-rec203.mjs`, REC-203's negative-control driver, arms by editing anchors in the old `idspaces.mjs` text. Those anchors are gone, so every arm now stops with "THE ARM DID NOT ARM". It is not run by the battery; it needs new anchors, or retiring with the adapter (N6).
- **Requirements (R26):** `CMS_FLOOR` was exported beyond R26's list because `rec203-idspaces.test.mjs` imports it. Resolved by K45.
- **legacy-store (for N6):** `op=idmatch` still speaks the old space names and reads `ID_SPACES`. The new interface is `spaces(view)` and the view-first services.

## Tests and checks run

Re-run on the merged branch (`tranche/T2` @ 1d8f9c8e0e, the real `jurisdictions`):
- `node --test bio-plane/test/m/id-spaces/` — `tests 32, pass 32, fail 0`. About 14 runs in the job. Failures on the way were the wording of my tests, three module wordings brought in line with the old battery, and fixture profiles made valid for the real `validate`.
- `node --test jurisdictions/test/` (the module this one uses): `tests 35, pass 35, fail 0`.
- Callers (legacy-tests, through legacy-store's `op=idmatch`; each loads the whole plane under Miniflare, so the plane loads): `node test/rec203-idspaces.test.mjs` — `rec203-idspaces: 45 pass, 0 fail`; `node test/bounds.test.mjs` — `206 pass, 0 fail`.
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs .` — `format: 61 modules, 23 requirements files; 0 failures`
- `node checks/architecture.mjs . id-spaces` — `architecture: 4 product files, 6 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs . id-spaces` — `coverage: 1 modules, 26 of 26 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs . id-spaces tranche/T2` — `ownership: 5 files changed by id-spaces between tranche/T2 and HEAD; 0 failures`

## Questions


### Q1 · the legacy caller (ANSWERED by BOB: the alternative, ruling K35, R26) of the old interface (`store.mjs`, `op=idmatch`)

`bio-plane/src/store.mjs` (legacy-store) imports `ID_SPACES`, `recognise(space, raw)`, `apnStanding`, `systemOfAddresses` and `judgePair(space, a, b, reading)` from `idspaces.mjs`, with Oakland's spaces, systems and floors held in this module. The requirements replace that interface: every service takes `view` first, the spaces are renamed (`cms` → `enactment`, `apn` → `parcel`), `apnStanding` → `parcelStanding`, `systemOfAddresses` → `systemOf`, and R24 forbids naming a place here. Applying N2 therefore breaks `op=idmatch` and its legacy test `bio-plane/test/rec203-idspaces.test.mjs` (legacy-tests), which I may not edit.

**Best reading, on which I carry on:** this module exports only the interface its requirements state and holds no local fact (N2, R24). `op=idmatch` in legacy-store is then out of step until a change there (for BOB to route): build the view with `jurisdictions.combine(<the instance's active profiles>)`, call `recognise(view, …)`, `systemOf(view, …)`, `judgePair(view, …)`, `parcelStanding`, and list spaces with `spaces(view)`; `rec203-idspaces.test.mjs` moves to the new space names. I keep no compatibility shim, because any shim must either hold Oakland's facts here (against R24) or pick a profile itself (which the requirements leave to the record's instance setting).

**The alternative, if BOB prefers the tranche green in the meantime:** keep a clearly marked, temporary legacy adapter in this module under the old export names, detecting the old call shape (a string first argument), that builds its view by combining every held non-test profile from `jurisdictions` (naming no place). It would be removed when legacy-store moves to the new interface.

**Addendum (measured after the module was rewritten, commit on this branch):** the break is not confined to `op=idmatch`. `store.mjs` imports `ID_SPACES` statically, so with the new module the whole plane fails to load (`bio-plane/test/rec203-idspaces.test.mjs`: workerd `SyntaxError: The requested module './idspaces.mjs' does not provide an export named 'ID_SPACES'`). Every Miniflare test of the old battery that loads `index.mjs` fails the same way until legacy-store changes or this module keeps the old names. This makes the alternative (a temporary adapter under the old names) the safer choice unless the legacy-store change lands in this tranche. Until BOB answers, the module on this branch exports only the required interface.


## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01JxBcyrvDmhXth7LevtRM2H,job,id-spaces,10552881,170821,136,73047,64,14,463
```
