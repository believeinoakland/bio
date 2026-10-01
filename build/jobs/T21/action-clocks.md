# action-clocks (T21)

**Status** · session_01VHoiWTjJjQQgWM9t7qUp3J · depth 2 · COMPLETE · handled B3

ACTION-CLOCKS #3, T21 layer 9. Started from `tranche/T21` @ e6bec46fb1; merged `tranche/T21` @ 8158a9bd53 (local-facts, B3/K989) before aligning.

## Entries applied

- **R10 (K921, K927; K936; K986).** A `business` count (`computeDeadline(d, fm, view, {factOf})`) reads, for each year it reaches, the holiday entries for all offices and those naming the action's ONE office (`actionOffices`: its addressee when `counterparty` is a named office, else its kind's `venue`, K986; `yearEntries`). An office no entry names, with no entry for all offices, leaves the year undetermined, naming the office. Each entry read goes through `local-facts.factStatus` at its `factPath`. The count uses the value that governs (`governs.value`) and answers `calendar: {status, years, says}`: `confirmed`; `unconfirmed` with "counted on an unconfirmed calendar (<basis>, <the lapsed confirmation's date, or 'never confirmed here'>)"; `corrected` with local-facts' "corrected locally by <member>, <date>". It is undetermined, with why, when an entry it reads is `disputed` or `absent` (including a local-facts that cannot answer). A `calendar` count reads no holiday and states none. `clockPropose` passes the reader and answers `proposal.calendar`. A pure caller that passes no reader gets `calendar.status: "not_read"`.
- **R11.** `calendarFactsRead({viewer, now?})` lists, once each and sorted, the `local-facts` paths a live deadline reads, each with the actions that read it. For every visible action not `resolved` or `abandoned` whose kind has a business-day profile deadline, it lists the holiday entries the profiles HOLD for its one office (as R10 reads them), for the UTC years from the instance clock's year to its latest pending entry's year (at least the next year), and that office's `hours`. It reads at most 500 actions (`CALENDAR_FACTS_ACTIONS_MAX`) and states `truncated`. A year the profiles do not list is not a path (J1 (3), adopted).
- **K936.** `computeDeadline` no longer keys `view.holidays` by year only (the last entry won for every office).
- **N465.** `checks.mjs`:3–:5 re-worded: the provenance stays; "`actions`' own job deletes that copy" is now "`actions`' copy is gone (K914)". The same stale note was in `schema.mjs`'s header and in `actionClocksOf`'s comment; both re-worded.
- **N469.** I re-scanned my paths: no note names a file T20 deleted as live, and none names "the battery". The `clocks.test.mjs` header ("moved from `actions`' tests") is provenance and stays.
- **Not yet met: T21 marks this job meets:** R10 and R11. Tests: `test/m/action-clocks/calendar.test.mjs`, five tests named "R10 …" (three) and "R11 …" (two), on the test profile. One R10 test also covers the first profile's office-specific 2026 entries (M-189 court venue, M-190 city offices, M-191 State Controller, and an office no entry names).
- **Catalogue rows:** none added, moved, re-keyed or re-worded (`checks.mjs` changed only in its comment), so none is `awaiting stamp` from this job.

## Deferred

None.

## Found in other modules (REPORT J4)

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`), from my change under `bio-plane/src/action-clocks/`.
2. **filings** (`bio-plane/src/filings/dates.mjs`:34, `deadlineDate`). It still calls `computeDeadline` with only `{holidays}` and no action. Under R10 it now reads only the entries for all offices, so on a profile whose years list only office-specific entries (the first profile's 2026) its business count is undetermined. It passes no `factOf`, so its `calendar.status` is `not_read`. Filings R31 (calendar status from action-clocks R10) needs it to pass the action's `counterparty` and `action_kind` (or call `clockPropose`'s path) and a `factOf`. That is filings' own job.
3. **filings' tests** fail 35 of 48 on `tranche/T21` itself (`KIND_NO_TEMPLATE` and similar), before and after my merge; not this module's.

## Tests and checks

- `node --test test/m/action-clocks/` (in `bio-plane/`): **26 pass, 0 fail** (21 before; R2's computeDeadline test now compares `{date, start}`, since R10 adds `calendar`).
- Modules that use action-clocks: escalation 38/0, action-plans 43/0, monitoring 72/0, queue-producers 47/0, affordances 133/0; filings 13/35, identical on `tranche/T21` without my change. local-facts 22/0. `build/manifest.md` names no layer tests.
- `format`: 86 modules, 84 requirements files, 0 failures. `architecture action-clocks`: 8 product files, 36 relative imports, 0 failures. `coverage action-clocks`: 11 of 11 live ids named by a test, 0 failures. `ownership action-clocks tranche/T21`: 7 files changed, 0 failures.

Size (session_01VHoiWTjJjQQgWM9t7qUp3J): test runs 14, module lines 859

## J1 · QUESTION

Three readings for R10/R11; I carry on with each as stated unless you answer otherwise.

(1) An action's offices (R10's "addressed to, or filed at"; K936). I read them as: its addressee when `counterparty` is a named office (`role`), and `{venue: <action_kind>}` when the view's kind carries a `venue`. A year is read through the all-offices entry for it plus every entry naming one of those offices; each of the action's offices must be covered (by the all-offices entry or one naming it), else that year is undetermined, naming the office; the closure days are the union of the entries read, and the status of every entry read is stated. An action with no office (an audience, no venue) reads only the all-offices entry. (If you prefer that only the addressee, or only the venue, decides, say which.)

(2) local-facts' answer, which is being built in parallel: I code against `localFactsOf(host).factStatus({path, viewer})` answering `{ok, path, status, ...}` with the governing value and, when `corrected`, the correcting member and date, and the pure export `factPath({profile, fact: "holidays", year, offices})` / `factPath({profile, fact: "hours", office})`. I will align field names to LOCAL-FACTS' code when it merges into `tranche/T21` (I merge after it, rule 2); if its job has fixed the names already, please pass them on. A corrected holiday year's governing value I read as that entry's `days` (the profile field's shape).

(3) R11 lists the paths of holiday entries and `hours` the active profiles HOLD (each path carrying the view entry's `profile`); a year in the horizon the profiles do not list has no fact to confirm, so it is not a path (R33 already makes a count reaching it undetermined). The horizon's upper year is max(latest pending clock entry's year, instance year + 1).

## J2 · QUESTION

Replaces J1 (its (2) and (3) unchanged; (1) restated with a consequence you should see).

(1) An action's offices (R10's "addressed to, or filed at"; K936). I read them as: its addressee when `counterparty` is a named office (`role`), and `{venue: <action_kind>}` when the view's kind carries a `venue`. A year is read through the all-offices entry for it plus every entry naming one of those offices; each of the action's offices must be covered (by the all-offices entry or one naming it), else that year is undetermined, naming the office; the closure days are the union of the entries read, and the status of every entry read is stated. An action with no office (an audience, no venue) reads only the all-offices entry. (If you prefer that only the addressee, or only the venue, decides, say which.)

Consequence on the first profile: its `records_request` kind has a venue (the portal) that no 2026 holiday entry names and there is no all-offices entry, so under this reading every business count for a records request there is undetermined, whatever its addressee (no live effect today: its only deadline, `records_response`, is calendar). The alternative I would take if you prefer it: the count is for ONE office, the addressee when it is a named office, else the kind's venue; then a request to the City Auditor counts on M-190's entry. I build the first reading now; switching is a few lines and its tests.

(2) local-facts' answer, which is being built in parallel: I code against `localFactsOf(host).factStatus({path, viewer})` answering `{ok, path, status, ...}` with the governing value and, when `corrected`, the correcting member and date, and the pure export `factPath({profile, fact: "holidays", year, offices})` / `factPath({profile, fact: "hours", office})`. I will align field names to LOCAL-FACTS' code when it merges into `tranche/T21` (I merge after it, rule 2); if its job has fixed the names already, please pass them on. A corrected holiday year's governing value I read as that entry's `days` (the profile field's shape).

(3) R11 lists the paths of holiday entries and `hours` the active profiles HOLD (each path carrying the view entry's `profile`); a year in the horizon the profiles do not list has no fact to confirm, so it is not a path (R33 already makes a count reaching it undetermined). The horizon's upper year is max(latest pending clock entry's year, instance year + 1).

## J3 · REPORT

B2 (K986) applied. R10/R11 are built and pushed against local-facts' factStatus/factPath as its requirements name them, with K986's one office; my tests (26/26) and format, architecture, coverage and ownership pass, using a local stand-in for local-facts that is not committed. Left to do: merge tranche/T21 once LOCAL-FACTS #1 has merged, align to its code (the field names of factStatus's answer, and its factory localFactsOf(host, deps)), re-run, then COMPLETE. Please send a CHANGE (merge tranche/T21) when local-facts is on the tranche; until then I wait. Already seen: filings' tests fail 35 of 48 on tranche/T21 with and without my change (KIND_NO_TEMPLATE and similar), so that is not mine.

## J4 · REPORT

Found in other modules (record, 'Found in other modules'): (1) Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs (not_product), from my change under bio-plane/src/action-clocks/; regenerate at the layer close. (2) For filings' job: src/filings/dates.mjs:34 (deadlineDate) still calls computeDeadline with only {holidays} and no action. Under R10 it now reads only the all-offices entries, so on a profile whose year lists only office-specific entries (the first profile's 2026) its business count is undetermined. It passes no factOf, so calendar.status is 'not_read'. For filings R31 it should pass the action's counterparty and action_kind and a factOf over local-facts.factStatus (as clockPropose does). (3) filings' tests fail 35/48 on tranche/T21 itself, with or without my merge (KIND_NO_TEMPLATE and similar).

## J5 · COMPLETE

B1-B3 applied. R10 (K921, K936, K986): a business count reads the all-offices entries plus those naming the action's ONE office (the addressee when it is a named office, else the kind's venue). It counts on local-facts' governing value and answers calendar {status confirmed|unconfirmed|corrected, years, says}, with 'counted on an unconfirmed calendar (<basis>, <date>)' or local-facts' 'corrected locally by <member>, <date>'. It is undetermined with why when an entry is disputed or absent, or when the office is named by no entry and there is none for all offices. R11: calendarFactsRead({viewer, now?}) gives the held holiday-entry and hours paths, once each with their actions, for the horizon this year to max(latest pending entry's year, next year); at most 500 actions, truncated stated. N465 re-worded (and the same stale note in schema.mjs and actionClocksOf). N469: nothing live in my paths. Not-yet-met marks met: R10, R11 (calendar.test.mjs: 3 'R10' tests on the test profile, one of them on the first profile's M-189-M-191; 2 'R11'). No catalogue rows added, moved or re-worded, so none is awaiting stamp. Tests 26/26; escalation, action-plans, monitoring, queue-producers, affordances and local-facts green; filings 13/35, the same on tranche/T21. format, architecture, coverage and ownership: 0 failures. Deferred: none. Record: build/jobs/T21/action-clocks.md.
