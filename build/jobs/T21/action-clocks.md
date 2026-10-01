# action-clocks (T21)

**Status** · session_01VHoiWTjJjQQgWM9t7qUp3J · depth 2 · WAITING ON BOB (J3) · handled B2

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
