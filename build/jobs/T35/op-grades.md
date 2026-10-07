# op-grades (T35)

**Status** · session_013gccXT7dmwA6HqYDk4k5uR · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings I am building on; tell me if either is wrong.

(1) R21's `IRREVERSIBLE_WEIGHT`: a frozen array (it is served inside `VOCABULARIES`, and a `Set` serializes to `{}`). It holds every op `RUNGS` grades `irreversible` (publish, publishat, publishatmove) and `personexpunge`. The alias `expunge` (op-declarations R21; `OP_ALIASES.expunge` is `personexpunge`) is left out, because R21 says "and no other op", although R17 says an alias takes its op's grade. For the same reason `CONSEQUENCE_STATEMENTS` gains `personexpunge` only. The other reading is to add `expunge` to both.

(2) R22 gives `credit` ("read: public, no credential") and `recover` a `NON_ACTS` reason. op-declarations R30 declares `credit` with no `NEEDS` row and `recover` as public, like `login`, which has none either. `affordances` R12's `unaccounted` reads a `NON_ACTS` key with no gated row as `stale`, so those two would read stale once T35-66 and T35-70 merge, unless op-declarations gives them `NEEDS` rows. I follow R22 as written and include both. The other reading is to leave both out, as T34 left out `websiteinvite` and `courtnotice`.

## Completion

**Entries applied (T35-79).**
- A-1's copy, with no change of meaning: `bio-plane/src/op-grades/index.mjs` takes `affordances.mjs` 378–622 (the FW-14 block: `RUNG_LADDER`, `IRREVERSIBLE_CORRECTION_PATH`, `JUSTIFICATION_REFUSALS`, `RUNG_ABSENCE_GROUNDS`, `CONSEQUENCE_STATEMENTS`, `LARGER_SCREEN_ACTS`), 817–1305 (`RUNGS`, `RUNG_ABSENT`), 2157–2841 (`MACHINE_REFUSALS`, `NON_ACTS` and the three `aliased` assignments) and 2894–2902 (`NOT_ON_PHONE_RUNGS`, `phoneOf`). `affordances/t33.mjs` and `t34.mjs` are copied whole to `src/op-grades/`. The draft's 378–625 and 815–1304 end inside `VOCABULARIES`' comment and start before `RUNGS`' header; I took the table boundaries instead. A script checked the copy against `affordances`: `RUNGS`, `RUNG_ABSENT`, `NON_ACTS`, `MACHINE_REFUSALS`, the ladder, the path, the family, the grounds, `LARGER_SCREEN_ACTS`, the six-plus-one statements and `phoneOf` over every graded op are deep-equal, apart from T35's 17 additions.
- Comments: the moved ids are re-pointed to this module's (`affordances` R27 → R3, and so on per the map). Ids that stay in affordances are named "`affordances` Rn". The headers of `t33.mjs` and `t34.mjs` are rewritten for this module. Served strings are unchanged.
- Exports: the tables above, `phoneOf`, `IRREVERSIBLE_WEIGHT`, and `OP_ALIASES` and `aliased` (re-exported from `./t34.mjs`). The module imports nothing outside itself (`uses: []`).
- T35's grading share (R21, R22), in `src/op-grades/t35.mjs`: `coarchiveset` `reversible`; `unpack` `undetermined`; `noterevise`, `notedelete`, `signout` and `signouteverywhere` `caller-owned`; `recoverycodesissue` and `recover` `credential` (K1943). Each has R22's `NON_ACTS` sentence. The reads are `archivelist`, `coarchivestate`, `findin`, `entitieskind`, `securitymap`, `recoverycodesstate`, `adminrecoverystep` and `agentpack`, and `credit` is "read: public, no credential". `subscriptionsignin` is ungraded. `personexpunge`'s dialog (DEC-142) is `T35_CONSEQUENCE_STATEMENTS`, spread into the frozen `CONSEQUENCE_STATEMENTS`. `IRREVERSIBLE_WEIGHT` (DEC-143) is a frozen array derived from `RUNGS`' `irreversible` ops plus `personexpunge`, before the aliases are applied (J1, answered B2 / K2038).
- Files, for `modules.json`: paths `bio-plane/src/op-grades/` (`index.mjs`, `t33.mjs`, `t34.mjs`, `t35.mjs`); tests `bio-plane/test/m/op-grades/` (`ladder.test.mjs`, `owners.test.mjs`, `t35.test.mjs`).

**A flaw fixed in this module.** `phoneOf` answered an alias by its own id. So `filingrecordsent`, the alias of `filingsent`, read `phone: true` while `filingsent` reads `false` (it is in `LARGER_SCREEN_ACTS`). That breaks R17's rule that an alias never differs from its op. `phoneOf` now resolves an alias through `OP_ALIASES` first, and R18's and R17's tests hold it. `affordances`' own copy still has the flaw until T35-66 imports this one.

**Tests moved.** The table cases of `affordances`' `t33.test.mjs` (R40's writes, reads, take-backs and reason codes) and `t34.test.mjs` (R45's writes and reads, and the alias table) are re-stated here as R13 and R17 at this module's exports, without the owners' maps (this module uses nothing). The owner-map and totality halves of those tests stay in `affordances` for T35-66 to re-point.

**Deferred.** None.

**Found in other modules (REPORT).** `affordances`' `phoneOf` has the alias flaw above, which T35-66's import clears. op-declarations needs `NEEDS` rows for `credit` and `recover` (K2038, already sent).

**Tests and checks.**
- `node --test bio-plane/test/m/op-grades/`: tests 25, pass 25, fail 0. No layer tests are named in `build/manifest.md`.
- `node checks/format.mjs`: 133 modules, 132 requirements files; 0 failures.
- `architecture` and `coverage`, with the row as committed (empty `paths` and `tests`): architecture shows 0 product files, and coverage shows 0 of 22 ids named, as B1 expects.
- With the row filled in a temporary, uncommitted copy of `modules.json`: architecture shows 7 product files, 10 relative imports and 0 failures; coverage shows 22 of 22 live ids named by a test and 0 failures.
- `ownership op-grades tranche/T35`: 0 failures.

Size (session_013gccXT7dmwA6HqYDk4k5uR): test runs 6, module lines 2015

## J2 · COMPLETE

T35-79 is complete and pushed on `job/T35/op-grades`. The details are in my record's Completion section.

Please fill the `modules.json` row with paths `bio-plane/src/op-grades/` (`index.mjs`, `t33.mjs`, `t34.mjs`, `t35.mjs`) and tests `bio-plane/test/m/op-grades/` (`ladder.test.mjs`, `owners.test.mjs`, `t35.test.mjs`). With the row filled in a temporary copy: architecture 0 failures, coverage 22 of 22, format 0. Ownership against the committed empty row lists the 7 files, as B1 expects.

Results:
- Tests: 25 of 25 pass.
- The copy is deep-equal to `affordances`' tables, apart from T35's 17 ops.
- T35's grades follow R21 and R22 as worded, with K2038's readings.

One flaw fixed here and reported for `affordances`: `phoneOf` answered an alias by its own id, so `filingrecordsent` read `phone: true` while `filingsent` reads `false`. `phoneOf` now resolves an alias first (R17). `affordances`' copy keeps the flaw until T35-66 imports this one.

Size: test runs 6, module lines 2015.

## Completion (CHANGE B3, K2043)

**Applied.** First merged `tranche/T35` into this branch (dbdcf06d4f). Then graded, in `t35.mjs` under R22's rule (ops op-declarations declares in T35) and R3's rule, each op B3 names, read from its owner's requirements:
- `reasoned`, each on a code already in `JUSTIFICATION_REFUSALS`:
  - `STANDARD_NO_REASON`: standards' `standardforce`, `standardforcewithdraw`, `standardrelease`, `standardadoption`, `standardimpose`, `standardbenchmark` (standards R35, R37, R40, R43).
  - `NO_REASON`: `usewithdraw` (events R45).
  - `DUTY_NO_REASON`: `uselink` and `useunlink` (duties R27).
- `undetermined`:
  - `discretionrecord` and `assessmentrecord`, as `eventcreate`. The stated reason is the record's words, not the member's account (events R43, R44).
  - `standardforcepropose` and `reviewpropose`, as `lawpropose` and `dutypropose`.
  - `recordsrequestopen` and `recordsrequestanswer`: no reason is asked, and the answer is never replaced (capture-requests R51, R52).
- `observational`: `usesfreeze`, as `recordset` (calculations R32).
- `credential`: `subscriptiondisconnect`, as `accountreferenceremove` (credentials R43).
- Reads, each a `read:` reason in `NON_ACTS`: `bindsat`, `editioninforce`, `forcesof`, `overridesof`, `usesof`, `applicationrecipes`, `poweruses`, `recordsrequests`.
- Every write above also has its `NON_ACTS` reason.
- None of these ops is in `MACHINE_REFUSALS`.
- OP-DECLARATIONS #12's record on `origin/job/T35/op-declarations` posts no REPORT yet, and its J1 names no op beyond B3's list.

**Found.**
- `standardrelease` is never undone (standards R37) but is graded `reasoned`, by R3's rule. Whether it should be a named `terminal` exception, as `actionholdrelease` is, is a ruling for BOB.
- R22's text names only op-declarations R30's ops. These 25 ops sit under its rule; BOB may want to word them into R22.
- Red 29 (affordances `t33.test.mjs`:137) and red 36 (`catalogue.test.mjs`:579) still fail on `origin/job/T35/affordances` with these tables in place. Each test pins its owners' op maps to an exact list that lacks the new ops. The grades they need are now here; the lists are `affordances`' to extend.
- Checked through the six owners' op maps: every op they serve is now graded or reasoned, apart from older ungated reads and session ops that are named nowhere by `affordances` R12's rule.

**Tests and checks.**
- `node --test bio-plane/test/m/op-grades/`: tests 26, pass 26, fail 0 (a new R22 R3 R13 case for B3's ops).
- format: 0 failures.
- architecture: 7 product files, 0 failures.
- coverage: 22 of 22.
- ownership: run after the commit.

Size (session_013gccXT7dmwA6HqYDk4k5uR): test runs 10, module lines 2079

## J3 · COMPLETE

B3 (K2043) is done and pushed after merging `tranche/T35`. All 25 ops are graded in `t35.mjs` from their owners' requirements, with a reason in `NON_ACTS`. Details are in my record's second Completion section.
- `reasoned`: standards' six acts on `STANDARD_NO_REASON`, `usewithdraw` on `NO_REASON`, `uselink` and `useunlink` on `DUTY_NO_REASON`.
- `undetermined`: `discretionrecord` and `assessmentrecord` (as `eventcreate`), the two proposals (as `lawpropose` and `dutypropose`), and the two records-request acts.
- `observational`: `usesfreeze`, as `recordset`.
- `credential`: `subscriptiondisconnect`.
- Eight reads, each `read:`.

Results:
- Tests: 26 of 26 pass.
- Checks: format, architecture and ownership show 0 failures; coverage is 22 of 22.
- No ops are added beyond your list; op-declarations has no REPORT yet.

For you:
1. Red 29 and red 36 still fail on `origin/job/T35/affordances` with these tables in place. `t33.test.mjs`:137 and `catalogue.test.mjs`:579 pin each owner's op map to an exact list that lacks the new ops. The grades are here; extending those lists is `affordances`' work.
2. `standardrelease` is never undone but is graded `reasoned`, by R3's rule. Whether it is a named `terminal` exception is your ruling.
3. R22's wording names only op-declarations R30's ops. You may want to word these 25 into it.

Size: test runs 10, module lines 2079.
