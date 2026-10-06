# people (T34)

**Status** · session_01FBkdcqM2R142K6beJtipCh · depth 2 · WORKING · handled B2

## Completion (PEOPLE #3)

**Entries applied** (T34-23, on `job/T34/people`, `tranche/T34` merged @ 74b42968af):
- **N617** (correct forward, no null `by`): every act that writes a row refuses `NO_BY` (lines' code) when the control plane's stamp is absent: `claimIdentity` and `recordPersonFact` after their listed refusals (R1's and R9's order kept), `withdrawIdentityClaim` and `withdrawPersonFact` after `NO_SUCH_*` (a repeat still answers `already`), `defineCheck` before its write. `linkSourceToPerson` and `recordCheckGate` no longer upsert: a later link of the same (source, person), or a gate measured again for the same version, governs, and the row it replaces is kept in `source_person_link_history` (export `never`, expunge `tombstone`, sight owner) or `interest_check_gate_history` (export `admin-only`), with `replaced_by` and `replaced_at`. `expunge` of a source link removes its replaced versions too, under the same ground (two tombstones).
- **N573** (user side): R15's `title` is the `holds` line's `title` (lines' Terms), `null` when the line states none; the `as_written` fallback and any non-`holds` title are gone.
- **N574** (user side): `credentialsOf` answers each `credentialed_by` line's `issuer_identifier` `{scheme, id, valid}` as `entities` holds it on the issuer (R43/R44), under a scheme the active profiles' `identifier_schemes` name for the issuer's kind (profile order first), with `issuer_identifiers` beside it when several are held; else `null` with `issuer_identifier_why` (no scheme named for that kind, or none held). The T33 test's laid-over `identifiersOf` is gone: the test holds `port_ellery_registry` on a real institution.
- **N594**: `member_ties` declared `export: "never"` (R33, K1490).
- **N600**: R34 `sourceLinkSight(person)`: synchronous, not in `peopleOps`, no viewer; `null` when no link to the person (or the id is empty/unregistered), else the sorted intersection of every held link's sight list. A store it cannot read answers `[]` (a link admitting no one), never `null`, so a caller fails closed.
- **N605**: R35 `onChecksChanged(module, fn)` (R19's listener rule); `fn({check, project})` once per `defineCheck` (new or new version; project null when none) and `switchCheck`, through record-core's `afterCommit` (after the outermost transaction; never on rollback); a throwing `fn` is swallowed and the notice writes nothing.

**Deferred.** None.

**Found in other modules** (J1 REPORT):
1. `corpus-export` R7 test (`tables.test.mjs:84`) asserts people's `member_ties` is `admin-only` ("people's declaration today"); now `never` per N594, so it reds until corpus-export's test (and `HELD_NEVER`'s interim note in `src/corpus-export/tables.mjs:26-27`) follow. Its export already treats the table as never (K1632 (6)).
2. `consequences` R16 test "until people answers a link's sight ... (fail closed)" (`person.test.mjs:84`) now reds: consequences already reads `sourceLinkSight` when present, and with no link held it shows the person, as N600 intends. The interim test is T34-49's to retire.
3. R33's wording lists people's tables; the two history tables (N617) are not named there. BOB's wording if it should list them.

**Tests and checks** (on `job/T34/people`):
- `node --test bio-plane/test/m/people/`: tests 37, pass 36, fail 1. The red is R15's `title` assertion (`reads.test.mjs`): `lines` (T34-18, merging before people) does not yet hold `title`; the rest of R15 passes (checked by a scratch copy without the two title assertions: 1/1). Green once lines merges.
- Users' tests against this branch, compared with the tranche baseline: new reds only corpus-export R7 and consequences R16 (above); case-disclosures 56/0, notice-producers 39/0, affordances 192/0, strength 138/0; scheduler, answers, calculations and corpus-export R4 reds are the inherited ones (plan Rules (5)), unchanged.
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture`: 11 product files, 39 relative imports; 0 failures.
- `coverage`: 35 of 35 live requirement ids named by a test; 0 failures.
- `ownership` (against `tranche/T34`): 9 files changed by people; 0 failures.

Size (session_01FBkdcqM2R142K6beJtipCh): test runs 9, module lines 1911

## J1 · REPORT

Found in other modules by T34-23 (details in my record's Completion): (1) corpus-export R7 test (tables.test.mjs:84) asserts member_ties export admin-only; people now declares never (N594), so it reds until corpus-export's test and its HELD_NEVER interim note follow; its export already treats it as never (K1632 (6)). (2) consequences R16 interim test 'until people answers a link's sight ... (fail closed)' (person.test.mjs:84) reds: consequences already uses sourceLinkSight when present, and with no link held it shows the person, as N600 intends; T34-49's to retire. (3) R33 lists people's tables; N617's two history tables (source_person_link_history export never, interest_check_gate_history admin-only) are not named; your wording if wanted.

## J2 · COMPLETE

T34-23 applied (N617, N573, N574, N594, N600 R34, N605 R35); record Completion has the detail. people tests 37: 36 pass, 1 red = R15's title assertion, waiting on lines (T34-18) holding title; the rest of R15 passes. format, architecture, coverage (35/35), ownership (9 files) 0 failures. Deferred: none. Size (session_01FBkdcqM2R142K6beJtipCh): test runs 9, module lines 1911.

## Completion again (B2, K1791)

- Merged `tranche/T34` (R33 now names `source_person_link_history`, export `never`, and `interest_check_gate_history`, export `admin-only`). The declarations in `schema.mjs` match; the R33 test asserts both and now names them in its title. J1 (1), (2) accepted as reds until T34-42 and T34-49.
- `node --test bio-plane/test/m/people/`: tests 37, pass 36, fail 1 (R15's title assertion, unchanged: waits on lines T34-18).
- `format` 0 failures; `architecture` 0 failures; `coverage` 35 of 35, 0 failures; 9 files changed by people between tranche/T34 and HEAD; 0 failures.

Size (session_01FBkdcqM2R142K6beJtipCh): test runs 10, module lines 1911
