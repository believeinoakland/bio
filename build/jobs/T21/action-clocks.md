# action-clocks (T21)

**Status** · session_01VHoiWTjJjQQgWM9t7qUp3J · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings for R10/R11; I carry on with each as stated unless you answer otherwise.

(1) An action's offices (R10's "addressed to, or filed at"; K936). I read them as: its addressee when `counterparty` is a named office (`role`), and `{venue: <action_kind>}` when the view's kind carries a `venue`. A year is read through the all-offices entry for it plus every entry naming one of those offices; each of the action's offices must be covered (by the all-offices entry or one naming it), else that year is undetermined, naming the office; the closure days are the union of the entries read, and the status of every entry read is stated. An action with no office (an audience, no venue) reads only the all-offices entry. (If you prefer that only the addressee, or only the venue, decides, say which.)

(2) local-facts' answer, which is being built in parallel: I code against `localFactsOf(host).factStatus({path, viewer})` answering `{ok, path, status, ...}` with the governing value and, when `corrected`, the correcting member and date, and the pure export `factPath({profile, fact: "holidays", year, offices})` / `factPath({profile, fact: "hours", office})`. I will align field names to LOCAL-FACTS' code when it merges into `tranche/T21` (I merge after it, rule 2); if its job has fixed the names already, please pass them on. A corrected holiday year's governing value I read as that entry's `days` (the profile field's shape).

(3) R11 lists the paths of holiday entries and `hours` the active profiles HOLD (each path carrying the view entry's `profile`); a year in the horizon the profiles do not list has no fact to confirm, so it is not a path (R33 already makes a count reaching it undetermined). The horizon's upper year is max(latest pending clock entry's year, instance year + 1).
