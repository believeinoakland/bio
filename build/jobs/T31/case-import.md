# case-import (T31)

**Status** · session_01MtNWSCDRK9AGiEKUk2dMFY · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

My readings of R18–R20 where the text leaves a detail open. I am building on them now; none blocks me. Answer only where you read otherwise.

1. R18 "an entry whose `seq` this import does not yet hold": an entry is skipped when this import has already recorded one with the same `seq` and the same `digest` (verified or refused, so a refused entry is not re-recorded every day). A `seq` held by a *verified* entry with another digest makes the new one `refused`, `differs: true`, both digests. A `seq` held only by refused entries is checked afresh.
2. R18's answer: `new_entries` counts every entry this read newly recorded (verified and refused); `new_moves` and `new_refused` are parts of it. `entries_seen` is the length of `answer.entries`; `last_entry` is `answer.last_entry`.
3. R18, `outcome: "read"` with an `answer` that is not an object with an `entries` list is recorded `unreadable`, reason `not_a_docket`; an `outcome` other than `read` or `unreadable` is recorded `unreadable` with reason `outcome_unknown`. A missing or unreadable `at` is recorded as this copy's instant.
4. R19's per-edition `publisher.edition`: the newest `edition` move naming an edition *later than this one* (R33 (a)'s rule), not the newest edition move of any number. `publisher` is `{edition, withdrawal}`, each null when none; `publisher` itself null when neither, with `publisher_note` saying no move has been seen (not that none was made) beside `last_read`.
5. R20: `entries` and `refused` cover every entry seen for each import, also under a watch since ended or replaced, each naming the `set_by` of the watch whose read saw it; `unreadable` covers only watches in force.
6. R16's `moves`: a move's id is `IMM-<n>`; `after` null or "" starts from the first (reevaluation asks with "").

## J2 · QUESTION

Replaces J1 for item 1 only (items 2–6 stand as J1 states them). Item 1, revised after a test found a flaw in my first reading: an entry is skipped only when this import has already recorded one with the same bytes served (`seq`, `digest`, `json` and `signature`). Keyed on `seq` and `digest` alone, a tampered copy carrying the genuine digest, once refused, would hide the genuine entry served later. A `seq` held by a verified entry with another digest is refused `differs: true` with both digests, as before.

REPORT, other modules (my change makes their tests red until their own T31 L11 jobs land, as the plan expects): `case-import`'s ops map (`caseImportOps`, the map `control-plane` R26 routes through) now holds `importwatch` and `importunwatch` (R17). Three tests that pin the map at eight ops fail on exactly those two names:
- `op-declarations` `test/m/op-declarations/t28.test.mjs` #6 (its R16 declares them);
- `control-plane` `test/m/control-plane/r49-routes.test.mjs` #1 (its R52 routes them);
- `plane` `test/m/plane/accepted.test.mjs` #7 (its R20 composes them).
No generated artifact is made stale.

Status: the job is built and tested (case-import 75 pass, 0 fail; format, architecture, coverage 20/20 and ownership 0 failures). I wait for docket's merge, as your START asks, then merge `tranche/T31`, re-run and post COMPLETE. Send a CHANGE (or RESUME) when docket has merged.

## Completion (T31)

**Entries applied** (`build/plan/current.md` L8, N534): R12–R14, R16, R17–R20, with C-130.15 and C-130.16, on the settled readings of R16, R18–R20 (K1381, K1383).
- R17 `watchImport` and `unwatchImport` (ops `importwatch`, `importunwatch` in `caseImportOps`); the docket address `docketAddressOf(publisher, case)`.
- R18 `watchedImports` and `recordDocketRead`: each new entry checked for digest and form (both labels, read from `docket`'s `ENTRY_FORMATS`), signature (`verifySshsig` in `NS_DOCKET` over `docketStatement`, then against the key it embeds for `key_listed: false`) and chain; `differs` for a re-served seq; take-backs beside moves; `reevaluation.citedCaseMoved` after the commit, a throw named under `listeners_failed`. The keys each edition's manifest lists are kept at import (`case_import_edition_keys`); an edition imported before T31 is read from its parts.
- R16 `moves` (accepted-work R8), registered with the other three.
- R19 `watch`, `docket_unreadable`, per-edition `publisher` (or null with `publisher_note` and `last_read`), `docket_entries` in both reads; R20 `watchItems`.
- R12, R13: five new append-only tables, declared to the purge. R14: the two rows, BOB's translations.

**Improvements in my own module:** R8's test no longer reads the source text; it calls every op without a stamped member and finds no flag. A flaw found in my first reading of R18 (keyed on seq and digest, a refused tampered copy would hide the genuine entry) was fixed before merge (J2, K1383).

**Deferred:** nothing.

**Other modules** (REPORT in J2, accepted by name in B4, K1383): `caseImportOps` gains the two watch ops, so `op-declarations` `t28.test.mjs` #6, `control-plane` `r49-routes.test.mjs` #1 and `plane` `accepted.test.mjs` #7 are red until their L11 jobs (op-declarations R16, control-plane R52, plane R20). `case-authoring`'s two `/6` format tests (#1, #115) are red on `tranche/T31` with or without this change: its own T31 entry (R14 writes `/7`). No generated artifact made stale.

**Tests and checks** (on `job/T31/case-import` after merging `tranche/T31` with case-grammar, docket and case-checker in):
- `node --test bio-plane/test/m/case-import/*.test.mjs`: 75 pass, 0 fail (new `watch.test.mjs`: 23, R12–R14, R16–R20, R19 a real test).
- Users and providers: accepted-work 23/0, reevaluation 121/0, case-disclosures 48/0, case-authoring 120/2 (the two above, not this job's), strength factory 6/0.
- `format`: 0 failures; `architecture case-import`: 0 failures; `coverage case-import`: 20 of 20 ids named, 0 failures; `ownership case-import tranche/T31`: 0 failures.

Size (session_01MtNWSCDRK9AGiEKUk2dMFY): test runs 16, module lines 1649

## J3 · COMPLETE

Complete on job/T31/case-import after merging tranche/T31 (case-grammar, docket, case-checker in): N534 R12–R14, R16–R20, C-130.15/.16 applied; case-import 75 pass 0 fail; format, architecture, coverage (20/20), ownership 0 failures. Record's Completion section has the detail. Reds outside this module: the three L11 ones accepted in B4, and case-authoring's two /6 format tests (#1, #115), red on tranche/T31 without this change (its own /7 entry).
