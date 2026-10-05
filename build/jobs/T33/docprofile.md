# docprofile (T33)

**Status** · session_01HaSoeitaf5svNuEMw8yMQN · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Started; B1 read. Four points, each with my best reading; I carry on on these readings unless you answer otherwise. Only (1) decides what I build at the CHANGE.

1. **doctypeFor with no type registered** (my requirements' Suggestions leave it to the START; B1 does not name it). Today `makeRegistry().fallbackMember()` is `undefined` on an empty registry, so `doctypeFor` would throw. Best reading: the registry seam holds one frozen NO-TYPE answer (not a content type: no `detect`, `parse` or `assess`; key `unregistered`, `fallback: true`, `contract: SUBSTANCE`), returned at confidence NONE with a `why` saying no content type is registered, so R4 still "always returns a type", R35 says which no, and the callers degrade by their own stated paths: `readText` gives `parse_error` "declares no reader" (R19), `assess` stops at L4/L5 with `verdict: changed, meaningful: null` (R13). It is used only while no registered type carries `fallback: true`; once `doctypes`' `generic` is registered, `generic` answers as today.
2. **The seam.** `docprofile/registry.mjs` exports `registerDoctype(type)` (the `register` that `doctypes.registerDoctypes(register)` is handed, doctypes R2), idempotent by `key` (a second registration of a key registers nothing and returns the one already held), refusing a member with no `key` or no `detect` (stated, never thrown). `plane` (T33-90) calls `registerDoctypes(registerDoctype)` at composition.
3. **The interim, a REPORT more than a question.** No code outside `docprofile/` imports a type (only `doctypes()` in my own tests, and `meetingCalendarType`, which nothing imports, so it goes with no read-through: a re-export of `doctypes` from here would be an import of a later module and fail the architecture check). But from my merge until plane's T33-90 merges, the product registers no type: `acquisition`, `monitoring`, `extraction` and `reading-pipeline` (all through `registry.mjs`) read every document as unrecognised, and their tests that expect a recognised type go red (I will list them by name at COMPLETE: at least `bio-plane/test/m/extraction/read.test.mjs` and `reading-pipeline/read.test.mjs`). Best reading: an accepted red under Rules (9) item 4, cleared by T33-90; the alternative is that each of those tests registers `doctypes`' types itself (a `uses` edge to doctypes for those modules), which is their jobs' and yours.
4. **Shared helpers stay at `docprofile/doctypes/index.mjs`** (doctypes R3/Uses import them there), with `CONTRACT` and `CONFIDENCE`; `docprofile/doctypes/registry.mjs` keeps `doctypeFor`, `alsoFor`, `doctypes()` and the seam. My tests then exercise R4, R5, R11–R20, R29–R36 with stub types registered through the seam, never `doctypes`' (a later module).

## Completion (T33-12, as answered by B2 / K1513)

**Entries applied.** T33-12, as K1513 reshaped it: the registry seam and the no-type answer; the seven types stay registered by default; nothing is deleted.
- `docprofile/doctypes/registry.mjs` (re-exported by `docprofile/registry.mjs`): `registerDoctype(type)` is the `register` that `doctypes.registerDoctypes` is handed. `plane` (T33-90) calls `registerDoctypes(registerDoctype)`. A held key is replaced in its own slot, so the load-bearing order is kept and `doctypes`' copies take over the seeds. A new key is appended. A member with no string key or no `detect` is refused with `{ok:false, why}`, never thrown. The registry is seeded with this module's seven types in their old order.
- `NO_TYPE` (key `unregistered`, frozen, `fallback: true`, `SUBSTANCE`, no detect, parse or assess) is what `doctypeFor` gives, at NONE with its own `why`, when no registered type is a fallback. It also stops the shared engine's last resort, the last member, from standing as a type that recognised nothing. `readText` states `parse_error` "declares no reader". `assess` (`pipeline.mjs`) now stops at L5 with `changed` and `meaningful: null` for a type with no `parse` or `assess`; before, it reached the same answer through a caught TypeError.

**Deferred.** Deleting this module's copies, and so the rest of R36 ("holds no content type"; the static imports gone), is N549 next tranche (K1513; hard reason: order). R29–R31's "not yet met: T33-12" parts are the types' and wait with it. At doctypes' merge a CHANGE merges `tranche/T33` here (B2).

**Found in other modules.** None. No importer outside `docprofile/` uses a type directly, and the meaning of every service they use is unchanged.

**Tests and checks.**
- `node --test docprofile/test/*.test.mjs`: tests 54, pass 54, fail 0. New: `seam.test.mjs`, covering R36 and R4/R13/R19/R35 on the no-type path, with stub types only.
- Importers: `bio-plane/test/m/{extraction,reading-pipeline,monitoring,acquisition}`: tests 370, pass 370, fail 0.
- `format`: 0 failures. `architecture docprofile`: 20 files, 0 failures. `coverage docprofile`: 25 of 25 live ids, 0 failures. `ownership docprofile tranche/T33`: 0 failures.

Size (session_01HaSoeitaf5svNuEMw8yMQN): test runs 4, module lines 5,087

## J2 · COMPLETE

T33-12 done as B2/K1513 shaped it, on job/T33/docprofile: registerDoctype (the seam; replaces by key in place, appends a new key, refuses a malformed member stated) seeded with the seven types in their order; NO_TYPE when no fallback is registered; assess stops at L5 with meaningful null for a type with no reader. Nothing deleted (N549). docprofile 54/54, importers (extraction, reading-pipeline, monitoring, acquisition) 370/370; format, architecture, coverage (25/25), ownership all 0 failures. Final uses unchanged: jurisdictions, site-profiles. Details in my record's Completion section. Ready for the CHANGE at doctypes' merge.

## Completion of B3 (CHANGE, K1520): R37

**Applied.** I merged `tranche/T33`. `readText` now hands the content type's reader `ctx.supplied`: the very object the caller supplied, unchanged. That covers its pages (a page with no text layer included), `undetermined`, `images`, `ocr` and typed `cells`. A bare string carries no structure (R21), so it gives `null`. A caller's own `ctx.supplied` never stands in for it.

**Tests and checks.**
- `node --test docprofile/test/*.test.mjs`: tests 55, pass 55, fail 0. New: R37 in `seam.test.mjs`.
- Importers, with legistar-reader and roster-reader: tests 404, pass 404, fail 0.
- `format`, `architecture`, `coverage` (26 of 26) and `ownership`: 0 failures each.

**Next.** A CHANGE is still to come when jurisdictions and civil-time merge (K1519).

Size (session_01HaSoeitaf5svNuEMw8yMQN): test runs 7, module lines 5,121

## J3 · COMPLETE

B3 done: tranche/T33 merged; R37 met (readText hands ctx.supplied, the caller's object unchanged: pages incl. textless, undetermined, images, ocr, cells; null for a bare string; a caller's ctx.supplied never stands in). docprofile 55/55; importers + legistar-reader + roster-reader 404/404; format, architecture, coverage 26/26, ownership 0 failures. Ready for the K1519 CHANGE.

## J4 · QUESTION

B4: tranche/T33 merged. Two things, then I wait for the CHANGE you named.

1. **Done, a REPORT for DOCTYPES.** The shared helper `practiceValue` (`docprofile/doctypes/index.mjs`, which doctypes imports) dropped the profile's unit, so neither copy of the calendar could see that `minutes_due_days` is `count: "business"`. It now returns `{value, basis, count}`, with `count` the profile's stated unit or null; nothing else changed. It is pushed on `job/T33/docprofile` and tested in `seam.test.mjs` (R36). DOCTYPES' fix reads `due.count` from it once I merge. Please pass this to DOCTYPES #1.
2. **My R6 test does depend on a fix landing first.** It exercises MY seeded copy of `meeting_calendar` (`docprofile/doctypes/meeting-calendar.mjs`), which still counts calendar days: `expected_by` is 2026-03-23 for a meeting on 2026-03-02 under the held profile (21 days). The corrected value is 10 business days, counted through civil-time. Best reading: when DOCTYPES' fix merges, I port the same change into my seed so the two copies stay identical until N549 deletes mine. That needs `docprofile`'s `uses` to gain `civil-time`, which is earlier in the order (your `modules.json` edit). The R6 test then expects civil-time's answer for the profile's own facts. The alternative needs no edge: my seed declines a `business` count (`expected_by: null`, with a why), and the R6 test expects that. It is honest, but the product would lose Oakland's due date until plane wires doctypes. Either way, R6 stays an accepted red (K1527) until then.
docprofile tests: 56 pass, 1 fail (the R6 test).

## Completion of B4–B6 (K1527, K1532, K1533): minutes_due_days through civil-time

**Applied.** I merged `tranche/T33`, now with civil-time and doctypes' fix.
- `practiceValue` carries the profile's `count` unit (R36's shared helper; kept per B5).
- My seeded `meeting_calendar` is now doctypes' `doctypes/meeting-calendar.mjs` line for line, apart from its three import paths. `minutes_due_days` is counted by civil-time's `evaluateRule`: business days on the profile's own weekend and closures, or the list the practice names. A count it cannot make has `expected_by: null` and a stated why. `docprofile` uses civil-time (BOB's edge).
- The R6 test now expects two things. On the held profile (and with no view), `expected_by: null` and "10 business days could not be counted". With the City's closure list named, Monday 2 March 2026 gives 16 March, and 19 November 2026 gives 7 December (Thanksgiving and the day after).

**Tests and checks.**
- `node --test docprofile/test/*.test.mjs`: 56 pass, 0 fail.
- Importers, legistar-reader, roster-reader and doctypes: tests 430, pass 430, fail 0.
- `format`, `architecture`, `coverage` (26 of 26) and `ownership`: 0 failures each.

Size (session_01HaSoeitaf5svNuEMw8yMQN): test runs 11, module lines 5,180

## J5 · COMPLETE

B4-B6 done: tranche/T33 merged; seeded meeting_calendar = doctypes' line for line (only import paths differ), counting minutes_due_days through civil-time evaluateRule; practiceValue carries count (R36, kept). R6 test: held profile (and no view) expected_by null, '10 business days could not be counted'; with closures 'city', 2026-03-02 -> 2026-03-16 and 2026-11-19 -> 2026-12-07. docprofile 56/56; importers + legistar-reader + roster-reader + doctypes 430/430; format, architecture, coverage 26/26, ownership 0 failures. Record's completion section updated.

## Completion of B7 (CHANGE, K1538): the held profile names `city`

**Applied.** I merged `tranche/T33`. My seed is still identical to `doctypes/meeting-calendar.mjs` apart from its import paths. The R6 test now expects the OMC 2.20.160 dates on the held profile:
- 2026-03-02 gives 2026-03-16, both with no view (K39) and with the held view.
- 2026-11-19 gives 2026-12-07.
- It keeps the undetermined case on a view whose practice names no closure list: `expected_by: null` and "10 business days could not be counted".

**Tests and checks.**
- `node --test docprofile/test/*.test.mjs`: 56 pass, 0 fail.
- Importers, legistar-reader, roster-reader and doctypes: 429 of 430 pass. The one failure is doctypes' own "R3 R8 the minutes-due date…" test, which asserts that the held profile is undetermined. It is red by design under K1538, so it is doctypes' to update, not this module's.
- `format`, `architecture`, `coverage` (26 of 26) and `ownership`: 0 failures each.

Size (session_01HaSoeitaf5svNuEMw8yMQN): test runs 14, module lines 5,184
