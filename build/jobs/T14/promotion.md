# promotion (T14)

**Status** · session_0133sVWEYMsdWzBRbtncwygV · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Progress, and what I wait on. Pushed 8793901944 on job/T14/promotion.

Done:
- N340: `DISPOSITIONS` is a frozen `["deferred", "dismissed"]` in promotion, and `REOPENABLE_FROM` is that same array (R51, R24). Both marks struck. Tests: promotion 70 pass, 0 fail.
- N341: `gate.mjs`'s 1.43.0 note now says C-87.12 retired in T13 (K434), and that 1.44.0 stamps it and C-69.4.

Waiting on: record-core and membership merging into `tranche/T14`. N335 needs membership's `notAParticipant` (its R87). The stamp and the census pin (N350's wording) come last, after both merge. Tell me when each merges.

The census as R50 now words it, on this branch today (layer 1 merged): 819 rows. Against 1.43.0's lines it differs only in C-69.4 arriving, C-87.12 departing, and C-96.1's catalogue copy gone. That matches the list you gave me for layer 1.

Grep hits for the code I changed (none needs a change for this job):
- affordances `src/affordances.mjs`:167–168 re-exports `REOPENABLE_FROM`, and :1353 reads it with `.includes`. Freezing it changes neither.
- reevaluation `src/reevaluation/index.mjs`:267 reads it with `.includes`.
- legacy-checks `checks/bio-checks.mjs`:2168 has a stale comment. It says `REOPENABLE_FROM` is `[...DISPOSITIONS, "published"]`, but `published` left with REC-14's state. Comment only.
- civicos-ui: no hit. (`civicos-ui/test/question-npc.test.mjs`:553 reads `reopenable` from op=affordances; that value is unchanged.)

## Completion

**Entries applied.**
- **N340** (8793901944). `DISPOSITIONS` is the frozen `["deferred", "dismissed"]`, and `REOPENABLE_FROM` is that same array, not a copy (R51, R24). Progressions re-exports it at layer 5, as the plan says. Both marks struck.
- **N341.** `gate.mjs`'s 1.43.0 note now says C-87.12 retired in T13 (K434), and that 1.44.0 stamps it and C-69.4.
- **N335** (872f6d4bd8). `forkProject`'s no-participation answer is membership's `notAParticipant(projectId, by)` (its R87, row C-56.3), byte for byte. Promotion no longer mints `NOT_A_PARTICIPANT`. R43's mark struck. The DEC-49 guard's output no longer names `NOT_A_PARTICIPANT` anywhere.
- **The stamp, N318** (872f6d4bd8). `CATALOG_VERSION` moves 1.43.0 -> 1.44.0. Method: I diffed R50's census lines of this tree against 1.43.0's own (`test/fixtures/row-census-1.43.0.jsonl`), after record-core and membership had merged. Nine rows arrived and two departed; nothing else moved. The note above the constant names each:
  - arrived: C-69.4; C-102.11 to C-102.14; C-56.3, C-56.4, C-56.5; C-96.14;
  - departed: C-87.12, and C-96.1's catalogue copy (C-96.1 is now held once, its line unmoved);
  - changed composition: `checkBundle` no longer runs C-19.1.
- **N350.** `ROW_CENSUS` = `{version: "1.44.0", rows: 827, digest: "5eae043f703a68fcf9ef26dd02bb6e890fff8d7a553f9db31fc0220518bf45b0"}`, computed as R50 now words it:
  - the third sort key (the line itself);
  - every fleet member's `scripts/` and `civicos-ui/deploy-ui.mjs` left out.
  No two lines share a check and code on this tree now, so the third key changes nothing today. The census reads 245 files. No file is blind, and no script left out holds a `check:` key. R50's mark struck.

**Check rows this job added, moved or retired (N318).** None of promotion's own. Its fork now answers on membership's C-56.3 instead of minting a code with no row. Every row change since 1.43.0 is in the stamp. Nothing is awaiting a stamp from this tranche's layers 1–2.

**Found in other modules.**
- **legacy-tests: `test/d470-catalog-census.test.mjs`** needs its 1.44.0 row, `"1.44.0": { count: 358, digest: "0586303ad42e5af722030da5fdbbd2ff0aee5c956017a2d51b63c0cc3f40f98d" }`. It fails A1, A3 and A5 until then; A9 is ok.
- **legacy-tests: `test/row-census.test.mjs`.**
  - It needs `test/fixtures/row-census-1.44.0.jsonl` (827 lines, the stamp's own; I can hand it over).
  - Its tie-break must become "then by the line itself" (N350).
  - Its C-96.1 "held twice" and "open tie" assertions must be retired, since C-96.1 is held once now.
  - Its `AWAITING_STAMP` declarations for 1.43.0 are stamped and can be retired.
  - Today: 5 pass, 3 fail. Its main arm, "the tree holds the pin", passes.
- **legacy-tests: `civicos-ui/check-refusal-codes.mjs`.** The ratchets moved with this tranche's rows: families 110→109, rows 790→797, governedSites 499→504, and others. The re-pin is legacy-tests'.
- **Grep of `civicos-ui/` and affordances.**
  - `DISPOSITIONS`, `REOPENABLE_FROM` and `notAParticipant` appear in civicos-ui only in comments (`app.html`:18583, `test/conclude-act.test.mjs`, `test/intent-write.test.mjs`).
  - affordances re-exports `REOPENABLE_FROM` (:167) and reads it with `.includes` (:1353). Freezing it changes neither.
  - reevaluation :267 reads it with `.includes`.
  - `bio-checks.mjs`:2168's stale comment is legacy-checks' for next tranche (B2).
- **Generated artifacts made stale** by `gate.mjs` and `promotion/index.mjs`: `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs`. Reported, not rebuilt.

**Deferred.** Nothing.

**Tests and checks.**
- `node --test bio-plane/test/m/promotion/`: tests 70, pass 70, fail 0, todo 0.
- Legacy suites that read the stamp:
  - `test/ratify.test.mjs`: 43 pass, 0 fail.
  - `test/conformance.test.mjs`: 59 pass, 0 fail.
  - `test/row-census.test.mjs`: 5 pass, 3 fail (re-pin above).
  - `test/d470-catalog-census.test.mjs`: 11 pass, 3 fail (re-pin above).
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture promotion`: 16 product files, 59 relative imports; 0 failures.
- `coverage promotion`: 51 of 51 live requirement ids named by a test; 0 failures.
- `ownership promotion tranche/T14`: 6 files; legacy-checks and legacy-store 0 lines; 1 failure, `build/requirements/promotion.md`: the four `not yet met` marks, struck as START asked.

Size (session_0133sVWEYMsdWzBRbtncwygV): test runs 12, module lines 79

## J2 · COMPLETE

N335, N340, N341, N350 and the stamp are applied on job/T14/promotion (8793901944, 872f6d4bd8, and the record after them).
- CATALOG_VERSION is 1.44.0: 9 rows arrived and 2 departed since 1.43.0, and C-19.1 left checkBundle.
- ROW_CENSUS is {1.44.0, 827, 5eae043f...}.
- R43 answers through membership.notAParticipant.
- DISPOSITIONS is frozen, and REOPENABLE_FROM is the same array.
- Promotion tests: 70 pass, 0 fail. format, architecture and coverage (51/51): 0 failures. ownership: 1 failure, the four requirement marks struck as START asked.
- Re-pins for legacy-tests (d470 1.44.0: 358/0586303a..., row-census fixture and tie-break) and the two stale bundles are listed in my record's Completion.
