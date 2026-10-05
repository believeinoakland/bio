### from jurisdictions.txt
- [DESIGN] jurisdictions R7, l.30 — `practice.minutes_due_days`: a local period after a meeting when absent minutes raise a question (the only meeting-cadence fact) — "the days after a meeting at which absent minutes raise a question"
- [GAP] jurisdictions R21, l.88 — the first profile's minutes-due period is held with basis `UNMEASURED` — "`practice`: the minutes-due period, with basis `UNMEASURED`, as its code states"
- [DESIGN] jurisdictions R26, l.37 — `deadlines`: `{rule, applies_to, days, count, starts, extension?, citation, basis}`; `count` calendar|business; `starts` one of received|filed|act|known; `applies_to` an action kind or `claim`; every period names its provision — "`citation` is the provision the period comes from"
- [DESIGN] jurisdictions R33, l.40 — `holidays` per year; a listed year is complete; business day = Mon–Fri not a holiday — "A business-day count that reaches into a year the profile does not list is undetermined (R27), never counted as though that year had no holidays."
- [DESIGN] jurisdictions R41, l.44 (K921) — `time_zone`: `{value, status, basis}`, an IANA name; one value per key
- [DESIGN] jurisdictions R42, l.45 (K921) — office/venue `hours`: weekly `{day, open, close}` HH:MM, split hours allowed, unlisted day closed — "Absent, the office's hours are undetermined (R27)."
- [DESIGN] jurisdictions R43, l.46 (K921, K925 (1)) — holidays may name `offices` (counterparty roles or `{venue: kind}`); a count for an office uses the all-office entries plus those naming it
- [DESIGN] jurisdictions R44, l.47 — every holiday entry, `hours`, `time_zone` carries `status` researched|ruled — "A fact without a source is not written (it stays absent, undetermined, R27); `UNMEASURED` is not a basis for these facts."
- [DESIGN] jurisdictions R29, l.70; R34, l.69 — a deadline's `days`, `count`, `starts` (per `rule`+`applies_to`) and a year's holidays are one value per key; disagreeing profiles have them withheld — "a count reaching into it is undetermined"
- [GAP] jurisdictions status line, l.4 — R40 template, R41 `time_zone`, R42 `hours`, R43 per-office holidays, R44 `status`, R45 test profile/first-profile calendar: "added, not yet met" (T21) — verify in Modules
- [GAP] jurisdictions R45, l.95 — the first (Oakland/Alameda) profile holds time zone, hours, holidays "only as `researched` (each with its measurement, K925) or not at all"
- [DOCTRINE] jurisdictions R17, l.80 — the module has no clock — "Pure: no store, no network, no clock."
- [GAP] (observation, jurisdictions whole) — the profile holds no fiscal year, no meeting schedule/regular-meeting rule, no notice periods (e.g., agenda posting), no effective-date rules for enactments; time facts are limited to action deadlines, holidays, hours, time zone, minutes-due
### from id-spaces.txt
- [DESIGN] id-spaces R2, l.17 — concurrent identifier forms are distinguished by shape — "Forms are told apart by the value's shape, never by a date."
- [DESIGN] id-spaces R6–R9, l.27–30 — `reach`: an enactment number below its kind's coverage floor is `OUTSIDE_REACH` (the source holds nothing that old); no floor or conflicting floors → `UNDETERMINED` — "`says` states that the record's source holds nothing that old"
- [DESIGN] id-spaces R10–R12, l.34–36 — `parcelStanding`: CURRENT / RETIRED with `roll_year` (earliest year recorded) and children / UNDETERMINED, stating how many published vintages were searched (a dated lineage of parcels)
- [DOCTRINE] id-spaces R23, l.66 — "Pure: no store, no network, no clock."
### from docprofile.txt
- [DESIGN] docprofile R15, l.76–79 — `assess` emits `temporal` connections `{connection:"temporal", from, to, relation, at, expected_by, why}`, never collapsed with `referential` ones — "the two are never collapsed into one shape"
- [DESIGN] docprofile R31, l.196–199 — the only clock reading: "the calendar's "minutes not yet published" fact" reads `ctx.now` when given "and the wall clock only when it is not"
- [DESIGN] docprofile `assess` ctx, l.57–59 — takes optional `now`, `before_at`, `after_at`; R11–R14 l.60–75 judge change between two dated captures of one address (identical, unchanged, restyled, routine, changed, undetermined, unwatchable)
- [DESIGN] docprofile Uses, l.174–177 — measured local practice thresholds: "how long a habitually late document of a given kind may go before its lateness is worth RAISING a question (never asserting one)" (lateness patterns as profile data)
- [DESIGN] docprofile R29, l.130–134 — `CONTRACT` per content type for monitoring over time: SUBSTANCE, MEMBERSHIP, UNMONITORABLE ("the absence is stated rather than silently reported "unchanged"")
- [DESIGN] docprofile Suggestions, l.240–241 — content types include `meeting_calendar`, `meeting_agenda`, `meeting_minutes` (the meeting cycle)
### from office-readers.txt
- [DESIGN] office-readers R10, l.100–104 — dates carried as evidence: each tracked change `{author, date}`, each comment `{author, date}`, core properties `created`, `modified`, `revision` — document-internal time stamps, extracted but (Suggestion l.302–305) "not yet indexed as searchable content"
- [DOCTRINE] office-readers R20, l.259 — "Pure: no store, no network, no clock in any output."
### from odf-reader.txt
- [DESIGN] odf-reader R8, R9, R29, l.60–74, l.172–175 — tracked changes and comments carry `author`, `date` (`null` when the file omits them); `meta.xml` core properties carry created/modified, revision
- [DESIGN] odf-reader Purpose, l.13–15; R32–R37 — `odfEvidentiaryDigest`: a substance digest stable across re-fetches of a Google Drive export, so change over time is judged on substance, not the ZIP envelope; `.odp` not yet measured (R33)
- [DOCTRINE] odf-reader R39, l.243 — "Pure: no store, no network, no clock."
### from extraction.txt
- [DESIGN] extraction R19, R23, R27, l.43, l.47, l.56 — record time only: each reading has `at`; "Every distinct reading of a capture is kept in arrival order"; `reading_history` (at most 16, newest first)
- [DESIGN] extraction R34, l.70 — a re-read keeps "`at` kept as the capture instant" and adds `reextracted: {at, by, engine, version, calibration, pages, via}` (capture time vs re-read time kept apart)
- [DESIGN] extraction R51, l.79 — `capturesReadFor(bundleId)`: each capture "with the instant it was first read"
- [DESIGN] extraction R38–R39, l.95–96 — drift obligations carry `reeval: {flag, since, source: "calibration"}` (re-evaluation dated from a calibration's supersession)
- [GAP] (observation) extraction whole — no date-in-text extraction, normalisation or indexing is stated; references are `kind:key` as the content-type reader emits them (R46, R58); dates in text, if any, come only from a content type's own reader (docprofile)
### from content.txt
- [DESIGN] content R11, l.32 — a citation of a document addresses "the bundle's first-held capture by `provenance.capturesOf`, never the newest" (the record pins the as-captured version)
- [DESIGN] content R29–R31, l.66–68 — `passageNotice`: whether a newer capture exists at each address (`provenance.versionChain`, at most 20 addresses) and whether the cited passage is carried into it, graded `A` byte-identical / `B` same text elsewhere / `C` Dice ≥ 0.7 / `NOT_FOUND` (only over a whole index) / `UNDETERMINED`; "`chain_unread` ... never read as none"
- [DESIGN] content R22, R41, l.51–53 — a replaced reading marks rows stale "one way; nothing is deleted or moved"; members citing affected rows are told "as for a newer version of the document"; "nothing moves by itself (R34)"
- [DESIGN] content R13, R43, R44, l.36, l.83, l.86 — mint keeps "the first minter and instant"; attestations carry `at` ("the module's clock when absent"), ordered by instant; `stale` when the chain at attestation differs from the current one
- [DOCTRINE] content R34, l.135 — "the record never moves a reference's target without a member's act, even when the passage is byte-identical (Bob, 2026-09-14; 2026-09-25 rule 1)"
### from entities.txt
- [DESIGN] entities R1, R5, R35, l.20, l.27, l.63 — entities carry `at` (creation instant), ids `ENT-<year>-NNNN`; aliases carry `at`; relations listed "oldest first"
- [DESIGN] entities R8, l.30 (K106) — withdrawal of an alias or relation is dated and kept "with who withdrew it, when and why. Nothing is deleted." (record history, not real-world validity)
- [GAP] (observation) entities whole — no time on what an entity or relation describes: no start/end of a `member_of`, no office holder over time, no date an `ordinance` or `contract` took effect; only record instants
### from connections.txt
- [DESIGN] connections R32, l.68 (K102) — a source's link as an `A` connection carries `timing` "`contemporaneous` only on that verdict and otherwise `undetermined`" — "a link whose timing is undetermined is labelled so"
- [DESIGN] connections R18, l.46 — the dirty-set sweep: `wake(now)` = now + delay (default 60 s); "The scheduler calls both; this module never arms an alarm."
- [DESIGN] connections R49, R57, l.69, l.95 — containment judgements appended "with who, when and why; the latest stands"; R43 theme withdrawals with who, when, why
- [GAP] (observation) connections whole — only referential/entity connections are held; docprofile R15's `temporal` connections (`at`, `expected_by`, e.g. minutes expected after a meeting) have no store or service here
### from progressions.txt
- [DESIGN] progressions Purpose, l.13 — a declared flow states for each stage "how soon it must follow"; the record derives "each missing stage that is overdue" on every read, never stored
- [DESIGN] progressions R16, l.48 — `overdue_successor` when `within` reads "`<n> day|week|month|year` (plural allowed; months and years by the calendar)", the `after` stage is placed, and a placed document has a date ("its reading's date, else its registration"); "In every other case it is not overdue, and no deadline is invented." Now = caller's `now=` ms, else configured clock, else wall clock
- [GAP] progressions R16, l.48 — interval arithmetic is calendar-only: no business days, no holidays, no time zone, no `starts` event kinds; it does not read jurisdictions' `holidays`/`deadlines` (uses list l.79–89 has no `jurisdictions`)
- [DESIGN] progressions R17, R33, l.49, l.34 — `overdueScan(now)` writes nothing; `next_deadline` is "the earliest deadline strictly after now ... so a consumer never re-arms to now"; `onThreaded` hands the scheduler `nextDeadline`
- [DESIGN] progressions R8, R14, R5, R20, l.31, l.44, l.26, l.58 — threads, exceptions and definitions are dated versions; a decision applies by its recorded version, or by instant ("declared strictly before the decision")
- [GAP] progressions Suggestions, l.117 — deferred with trigger: "a stage observed out of order, and a definition scoped to an institution, when a placed document carries its own date"
### from bias.txt
- [DESIGN] bias R33, l.60 — as-of reasoning over the lens: each work product records "the lens recorded when it began"; the sweep compares "the lens it was made under with the lens in force now"; undetermined "raises and clears nothing"
- [DESIGN] bias R12, l.35 — an adoption pins the head revision with the policy source's "retrieval date and lower-cased hash"
- [DESIGN] bias R44, R41, l.74, l.69 — `settled({since})` over an instant ("A `since` that is not an instant answers none, and says so"); sweep wake = now + 1,000 ms (or `BIAS_DEBT_DELAY_MS`)
### from the repository check (Modules)
- [BUILT] jurisdictions/profiles/oakland-alameda.mjs:184, :246–250, :264–290 — the first profile holds `time_zone` America/Los_Angeles (M-187); **one** deadline rule (`records_response`, 10 calendar days from `received`, +14 extension, "Cal. Gov. Code § 7922.535", `UNMEASURED`); holidays for **2026 only**, per office (court venue, city offices, State Controller), so any business-day count into 2027 or for the Civil Grand Jury or records portal is undetermined
- [GAP] progressions/index.mjs:103–115, :861–870 — overdue arithmetic is UTC with fixed 86,400,000 ms days; the anchor date is the reading's `at` = the capture's `retrieved` instant (reading-pipeline/index.mjs:741), else registration: "overdue" runs from when the group captured the predecessor document, not from the meeting or act it records
- [GAP] docprofile meeting-agenda.mjs:84–91, meeting-minutes.mjs:132–139 — dates in text parsed only as English "Month D, YYYY" at UTC midnight; meeting-calendar.mjs:261–303 computes `expected_by` only inside `assess`, and no module stores temporal connections
- [GAP] (outside my modules, quick grep) action-clocks/index.mjs:339 counts holiday years "from the UTC" and no action-clocks file reads the profile's `time_zone` (only local-facts/paths.mjs lists it as a confirmable fact); K936 (3)'s per-office gap is fixed (:366–372)
