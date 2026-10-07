# affordances (T35)

**Status** · session_01JWst2i7Y31gjWS15iiZoqL · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Q1 (re B1, "no re-export"). Three files outside affordances import the moved tables from `src/affordances.mjs`: `src/plane/wizards.mjs`:5 (`MACHINE_REFUSALS`, `RUNGS`), `test/m/plane/wizards.test.mjs`:17 (the same), and `test/m/control-plane/totality.test.mjs`:9 (`RUNGS`, `RUNG_ABSENT`). A-1 re-points them in T35-73 and T35-72, which merge after me. `plane/wizards.mjs` is imported by `plane/store.mjs`, so if affordances stops exporting `RUNGS` and `MACHINE_REFUSALS` at my merge, the ESM link fails and the whole plane is unloadable from my merge until T35-73: every suite that builds the plane goes red (affordances' own `plane.test.mjs` included, and 18+ test files that import `src/plane/index.mjs`).

My best reading, which I carry on with: affordances re-exports nothing (as B1 says), and the three one-line re-points (`plane/wizards.mjs`:5, `plane/wizards.test.mjs`:17 to `../op-grades/index.mjs`; `control-plane/totality.test.mjs`:9 to import `RUNGS`, `RUNG_ABSENT` from op-grades and `unaccounted` from affordances) land on the tranche branch before or with my merge: by BOB, or by the plane and control-plane jobs as an early share. If you rule instead that I keep a temporary re-export of `RUNGS`, `RUNG_ABSENT` and `MACHINE_REFUSALS` until T35-73 (marked for removal there), say so and I will.

Also, for when op-grades merges: I read op-grades' path as `src/op-grades/index.mjs` exporting every moved name (the tables, `phoneOf`, `IRREVERSIBLE_WEIGHT`), per A-1. Nothing else is waiting on this: N597 (`facts.mjs` reads `caseTensions().caseRelation`) and N695 (`connection_kinds` as `{values: kind names, words}`) are committed on my branch, with tests. legacy-ui does not read `connection_kinds` anywhere (no hit in `civicos-ui/`), so T35-74 needs nothing for N695. The committed plane bundle `bio-plane/dist/bio-plane.bundled.mjs` embeds the old `words.mjs`/`facts.mjs` and is stale from my merge (§14; not mine).

## J2 · REPORT

The removal side is ready, built and tested on a local branch that merges `job/T35/op-grades` (not pushed). It waits for op-grades to merge into `tranche/T35`; then I merge the tranche branch and push. Shape: `affordances.mjs` imports the tables and `phoneOf` from `./op-grades/index.mjs` and keeps no copy; `affordances/t33.mjs` and `t34.mjs` are deleted; `VOCABULARIES` gains `irreversible_weight` (op-grades' `IRREVERSIBLE_WEIGHT`, R4); K2038's temporary re-export of `RUNGS`, `RUNG_ABSENT`, `MACHINE_REFUSALS` is in place, marked. The module is about 2,055 lines after the split (A-1 estimated ~2,050). Tests re-pointed to op-grades; T35's grades set aside where a test counts a closed set, as T33's and T34's are; the R36 oracle takes op-grades' alias fix (`filingrecordsent` answers as `filingsent`). affordances: 202 of 204 tests pass.

Three findings for you, none mine to fix:

1. Two affordances tests are red on `tranche/T35` already (I checked them in a clean worktree of the tranche branch), because ops added in T35's L5 have no grade anywhere: `catalogue.test.mjs`:579 (R3 R7 R12, layer 9's set: standards' `bindsat`, `editioninforce`, `forcesof`), which is not on the accepted list; and `t33.test.mjs`:137 (red 29: events' `discretionrecord`, `assessmentrecord`, `usesof`, `usewithdraw`; calculations' `usesfreeze`, `applicationrecipes`). Red 29 says "until T35-66 grades them", but since K1974 the grades are op-grades', and T35-79 graded only its 17 (R22). duties' `poweruses`, `uselink`, `useunlink` and `reviewpropose` have no grade either. They need rows in op-grades (`RUNGS` or `RUNG_ABSENT`, and `NON_ACTS`), a CHANGE to op-grades, or wording of red 29 to name op-grades.

2. From my merge until op-declarations (T35-70) declares T35's ops: control-plane `totality.test.mjs` (R2, R41) answers `stale` for op-grades' 17 T35 grades (`unpack`, `archivelist`, `coarchiveset`, `coarchivestate`, `noterevise`, `notedelete`, `findin`, `entitieskind`, `securitymap`, `recoverycodesissue`, `recoverycodesstate`, `recover`, `adminrecoverystep`, `signout`, `signouteverywhere`, `agentpack`, `credit`). It is green until my merge only because affordances reads its own copy until then. Please accept it as a red until T35-70 (and `credit` and `recover` until they have `NEEDS` rows, K2038).

3. The committed plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from my merge (§14; not mine).

## Completion

**Entries applied (T35-66, re-cut by K1907; K1974).**
- A-1's removal side: `affordances.mjs` imports `RUNG_LADDER`, `IRREVERSIBLE_CORRECTION_PATH`, `RUNG_ABSENCE_GROUNDS`, `CONSEQUENCE_STATEMENTS`, `LARGER_SCREEN_ACTS`, `IRREVERSIBLE_WEIGHT`, `RUNGS`, `RUNG_ABSENT`, `MACHINE_REFUSALS`, `NON_ACTS` and `phoneOf` from `./op-grades/index.mjs` and holds no copy (its 378–622, 816–1305, 2157–2841 and 2894–2903 deleted); `affordances/t33.mjs` and `t34.mjs` deleted. `VOCABULARIES` publishes op-grades' objects by reference and gains `irreversible_weight` (R4). `deriveActs`, `decorate` and `unaccounted` read the imported tables (R11, R12, R20, R36), so `phoneOf`'s alias fix (op-grades R17, R18) now reaches every decorated act.
- K2038: a temporary re-export of `RUNGS`, `RUNG_ABSENT` and `MACHINE_REFUSALS`, marked for removal by the CHANGE after T35-72 and T35-73 re-point.
- (N597, K1643) `facts.mjs` asks `case-tensions.caseRelation` (its R1) for `case_member` and for `edition_warranted_for_project`'s case relation, never publication's delegate (R14).
- (N695, K1864) R39's `connection_kinds` is `{values, words}`: `values` the kind names in `owners()`' order, `words` each kind's `{word, class, owner}`; the registry entries are not carried. legacy-ui reads no `connection_kinds` (nothing for T35-74).
- Tests: every import of a moved name re-pointed to `op-grades` (index, `t33.mjs`, `t34.mjs`); T35's grades (`op-grades/t35.mjs`) set aside where a test counts a closed set, as T33's and T34's are; R4's tests gain `irreversible_weight`; the consequence test gains `personexpunge` (op-grades R21); R36's oracle answers an alias as its op. New: R14's test that the case relation is case-tensions' (`ops.test.mjs`), and R39's `connection_kinds` shape (`t33.test.mjs`). The table-only cases op-grades restated (its R13, R17) are left here too, since they also hold the owners' maps and R12's totality.

**Deferred.** Test titles that predate the split still name retired ids (R2, R3, R7, R27, R31–R33, R35, R38, R40, R42, R43, R45) beside the live ones they test (R12, R19, R20); coverage is unaffected. Re-wording them to name op-grades' ids is left for the CHANGE that drops the re-export, so the titles move once.

**Found in other modules (J2, answered K2043).** The T35 L5 ops with no grade (standards `bindsat`, `editioninforce`, `forcesof`; events `discretionrecord`, `assessmentrecord`, `usesof`, `usewithdraw`; calculations `usesfreeze`, `applicationrecipes`; duties `poweruses`, `uselink`, `useunlink`, `reviewpropose`) are op-grades' (reds 29, 36). control-plane `totality.test.mjs` `stale` from my merge until T35-70 (red 37). The plane bundle is stale from my merge (§14).

**Tests and checks.**
- `node --test bio-plane/test/m/affordances/`: tests 204, pass 202, fail 2 (red 36: `catalogue.test.mjs`:579; red 29: `t33.test.mjs`:137; both red on `tranche/T35` before this job).
- Users: control-plane `totality`, plane `wizards`, queue, op-declarations, op-grades, tasks: tests 336, pass 332, fail 4 (red 37 totality; op-declarations reds 9 ×2 and 23/29).
- No layer tests are named in `build/manifest.md`.
- `format`: 133 modules, 132 requirements files; 0 failures. `architecture affordances`: 18 product files, 227 relative imports; 0 failures. `coverage affordances`: 32 of 32 live ids named; 0 failures. `ownership affordances tranche/T35`: 19 files changed; 0 failures.

Size (session_01JWst2i7Y31gjWS15iiZoqL): test runs 12, module lines 2055

## J3 · COMPLETE

T35-66 is complete and pushed on `job/T35/affordances` (merged with `tranche/T35` after op-grades). Details in my record's Completion section: A-1's removal side (tables read from op-grades, no copy; `irreversible_weight` in VOCABULARIES; K2038's marked re-export), N597, N695. affordances 202 of 204 (reds 29, 36); users 332 of 336 (reds 37, 9, 23/29); format, architecture, coverage (32 of 32), ownership: 0 failures. Size: test runs 12, module lines 2055.

## Completion (B4, K2049)

**CHANGE applied.** Merged `tranche/T35` (op-grades' re-merge grading the 25 T35 ops). The closed lists the tests pin now hold each owner's map as merged:
- `t33.test.mjs` (R40 R12; red 29): `T35_ADDS` names the ops T33's new modules add in T35 (events `discretionrecord`, `assessmentrecord`, `usewithdraw`, `usesof`; duties `poweruses`, `uselink`, `useunlink`, `reviewpropose`; hypotheses `noterevise`, `notedelete`; calculations `usesfreeze`, `applicationrecipes`), each map held to exactly T33's ops and these, and each add held to op-grades' `T35_NON_ACTS` (a write with a T35 rung or absence, a read with neither).
- `catalogue.test.mjs` (R3 R7 R12; red 36): standards' eleven T35 ops (`standardforce`, `standardforcepropose`, `standardforcewithdraw`, `standardrelease`, `standardadoption`, `standardimpose`, `standardbenchmark`, `forcesof`, `overridesof`, `editioninforce`, `bindsat`) set aside from layer 9's closed set as T33's are, pinned to standards' map and to op-grades' T35 table.
- R19's backing for op-grades' nine new `reasoned` ops (the six standards writes, events `usewithdraw`, duties `uselink`, `useunlink`), each driven at its owner's interface over its fixture (new `t35-backing.test.mjs`), and `plane.test.mjs`'s reach list counts them. Without these R19's reach test was red once op-grades graded them.
- K2038's re-export stays until plane and control-plane merge.

**Tests and checks.**
- `node --test bio-plane/test/m/affordances/`: tests 208, pass 208, fail 0 (reds 29 and 36 cleared).
- Users: control-plane `totality`, plane `wizards`, queue, op-declarations, op-grades, tasks: tests 340, pass 336, fail 4 (red 37 totality; op-declarations' accepted reds).
- `format`: 0 failures. `architecture affordances`: 18 product files, 229 relative imports; 0 failures. `coverage affordances`: 32 of 32; 0 failures. `ownership affordances tranche/T35`: 0 failures.

Size (session_01JWst2i7Y31gjWS15iiZoqL): test runs 20, module lines 2055

## J4 · COMPLETE

B4 (K2049) done and pushed on `job/T35/affordances` (tranche/T35 merged first). The closed lists hold each owner's map as merged: `t33.test.mjs` (red 29) and `catalogue.test.mjs`:579 (red 36) both clear. Also new: R19's drives for op-grades' nine T35 `reasoned` ops (`t35-backing.test.mjs`), which R19's reach test needed once they were graded. K2038's re-export stays. affordances 208 of 208; users 336 of 340 (red 37, op-declarations' reds); format, architecture, coverage (32 of 32), ownership: 0 failures. Size: test runs 20, module lines 2055.

## Completion (B5, K2052)

Merged `tranche/T35` (op-grades' J4: `standardrelease` in `CONSEQUENCE_STATEMENTS`). `catalogue.test.mjs`'s consequence-statement pin gains `["standardrelease", "reasoned"]` (op-grades R4, R21), clearing red 39. K2038's re-export stays.

Tests: affordances 208 of 208. Users (control-plane `totality`, plane `wizards`, queue, op-declarations, op-grades, tasks): 336 of 340, the four being red 37 and op-declarations' accepted reds. `format`, `architecture` (19 product files, 234 relative imports), `coverage` (32 of 32), `ownership`: 0 failures.

Size (session_01JWst2i7Y31gjWS15iiZoqL): test runs 23, module lines 2055

## J5 · COMPLETE

B5 (K2052) done and pushed: tranche/T35 merged; the consequence-statement pin gains ["standardrelease", "reasoned"], clearing red 39. affordances 208 of 208; users 336 of 340 (red 37, op-declarations' reds); format, architecture, coverage, ownership: 0 failures. K2038's re-export stays.

## J6 · REPORT

Re B6 (K2054): affordances holds no alias copy any more. `src/affordances/t34.mjs` was deleted in T35-66 (A-1's removal side); affordances reads `OP_ALIASES` and `aliased` only through op-grades, and no file of mine names an `expunge` alias. So nothing to drop here, and tranche/T35 is merged into my branch with no change. One consequence: my `t34.test.mjs` (R45 R12) pins op-grades' table at 29 aliases. Once op-grades' B5 drops `expunge` (not yet pushed on `job/T35/op-grades`), it reads 28 and that test goes red. Send me a CHANGE when op-grades' drop merges and I re-pin it to 28, with a check that no alias is `expunge`, in one push. Until then my branch stays green.
