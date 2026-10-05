# roster-reader (T33)

**Status** · session_01Qp9gyE9dgpPJuAa5rXEJrc · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**Q1 — the shape of `roster_headers` (jurisdictions R6, read by my R6).** jurisdictions R6 lists `roster_words`, `roster_headers` and `staff_titles` as plain `{pattern, basis}` lists. My R6 must name each column's ROLE (`name`, `title`, `unit`, `start`, `end`, `as_of`, `employee_id`, and `contact`) "from the header words the view supplies", which a bare pattern cannot say.
My best reading, on which I am building now: each `roster_headers` entry is `{role, pattern, basis}`, `role` one of those eight (the way `meeting_markers` carries `marker`); an entry without a known `role` is skipped. If you agree, the jurisdictions job (T33-2) needs the same shape in its R6 text and in the test and first profiles; tell me if you rule otherwise.
**Q2 — what counts as a name-and-title line (my R1 floor).** The measured board roster (WDB, the fw20 fixture `neg_wdb`) prints `n  Name  Organization  Terms`: a name beside an organisation, not a title. Best reading: a line counts toward the floor when it starts (after an optional row number) with a name-shaped span followed by more text on the same line, and a `staff_titles` match on the line is recorded as a signal but is not required; a contact point on the line (e-mail, phone) never makes it count. I carry on on these readings.

## J2 · QUESTION

**Replaces J1** (its Q1 and Q2 unchanged; Q3 is new). I am building on these readings now.
**Q1 — `roster_headers` shape (jurisdictions R6, read by my R6).** A bare `{pattern, basis}` cannot say which ROLE a header word names. Reading: each entry is `{role, pattern, basis}`, `role` one of `name`, `title`, `unit`, `start`, `end`, `as_of`, `employee_id`, `contact`; an entry with no known role is skipped and said so.
**Q2 — a "name-and-title line" (my R1 floor).** The measured board roster prints `n Name Organization Terms`. Reading: a line counts when it opens (after a row number) with a name-shaped span and carries more on the same line, or is `<post>: <name>`; a `staff_titles` match divides it, and without one the row is kept whole as `line` (R2).
**Q3 — `roster_words` names two kinds (new).** One key self-names both a roster and an org chart, and the real City Administrator charts print names with posts, so a chart that names itself "Organizational Chart" read as a roster and the committee roster ("ROSTER AND ASSIGNED STAFF") read as a chart. Reading: a `roster_words` entry may carry `kind`: `roster` or `chart`; an entry without `kind` names both; a document that names itself only as the other kind is not matched. With this, the 15 documents I captured and the 14 docprofile fixtures all separate correctly.
**For the jurisdictions job (T33-2), if you agree:** the shapes above in its R6, and in the first profile at least: `roster_words` `roster(s)` (kind roster), `organi[sz]ational chart|org chart` (kind chart); `staff_titles` the titles the City prints (Chair, Co-Chair, Vice Chair, City Administrator with Assistant/Deputy, City Attorney, City Clerk, Director, Manager, Chief, Supervisor, Coordinator, Analyst, Inspector, Engineer, Custodian, Leader, Officer, Parliamentarian(s), Accountant, Intern), each with its basis in my fixtures (`roster-reader/test/fixtures/roster-documents.json`); `roster_headers` at least `Name`/`Full Name` (name), `Title`/`Position`/`Job Title` (title), `Department`/`Division`/`Organization` (unit), `Term(s)` (start/end is not dividable; I'd leave it unnamed), `Employee ID` (employee_id), `Phone`/`Email`/`Address` (contact). Until those land my tests use views built in the combined-view shape by hand; the R8 test against the two held profiles needs them.

## Completion

**Entries applied.** T33-15 whole, a new module under `roster-reader/` (808 lines of code): two MEMBERSHIP content types registered by `registerRosterTypes(register)` through `docprofile`'s seam (`registerDoctype`, tested end to end in `test/seam.test.mjs`): `staff_roster` (R1, R2, R4, R5) and `org_chart` (R3, R4, R5); `rosterColumns(header, view)` (R6); `directoryPersonRefs(entities, view)` (R7, every name graded C). Pure: no store, no network, every local word from the view (R8, R10); every no states its why (R11).

**Readings applied (all answered).** J2 (replacing J1), answered by B2 (K1513) and B3 (K1517): `roster_headers` entries `{role, pattern, basis}`; a name-and-title line opens with a name and carries more, or is `<post>: <name>`, and is divided only by a view staff title, else kept whole as `line`; `roster_words` entries carry an optional `kind` (`roster`/`chart`, absent: both), and a document naming itself only as the other kind is not matched.

**Fixtures (R9).** Fifteen real documents fetched 2026-10-05 from `cao-94612.s3.amazonaws.com` (the bucket staff_directory was measured on) and read through the plane (`test/fixtures/capture.mjs`: the plane's source with the committed pdf-worker bundle bound, under miniflare, `op=pdfstructure`): four rosters (the committee roster and its May revision, an advisory board roster, the board roster), five charts, and six look-alikes or unreadable charts. docprofile's two real corpora (fw20, fw18) are copied whole beside them. Measured: every roster and chart reads as its type; every look-alike, directory and FW-18 document reads as neither; the real roster revision gives the departures, arrivals and moved chairs it shows (R5).

**Paths for `modules.json`.** `paths: ["roster-reader/"]`, `tests: ["roster-reader/test/"]`, `uses: ["docprofile"]` (final: every import is `docprofile/registry.mjs`; `jurisdictions` only through the view).

**Deferred.** (1) R8 is tested on the first profile's PROPOSED roster words (J2) and a made-up profile, both as hand-built combined views (`test/fixtures.mjs`), because the held profiles cannot carry `roster_words`, `roster_headers` or `staff_titles` until the jurisdictions job (T33-2) lands them (K1517's CHANGE). Once it merges, a test over `jurisdictions.combine` of the held test and first profiles is a few lines; it needs a CHANGE to this job or the next one. (2) Without the view's staff titles (an empty view), a staffing chart that prints holders under titles reads as a LIKELY roster as much as a chart; stated in `org-chart.mjs`'s header.

**Found in other modules (REPORT).**
- `docprofile` (T33-12, its seam): `registerDoctype` appends a new key after `generic`, so roster-reader's types sit after the fallback, not "after doctypes' types and before generic" as my Provides puts it. Harmless today (`generic` never detects, so order after it changes no verdict), but `doctypes()` lists the fallback before them; whether the seam should insert before the fallback is docprofile's.
- `jurisdictions` (T33-2): the first profile's roster words, staff titles and header words proposed in J2; my tests' `FIRST` view (`test/fixtures.mjs`) is that proposal, measured on these fixtures.

**Tests and checks.**
- `node --test roster-reader/test/`: tests 16, pass 16, fail 0. Negative control: the dated-rows rule removed, three R1 tests fail by name; restored, 16/16.
- `node checks/format.mjs <bio>`: 126 modules, 125 requirements files; 0 failures.
- With `paths`/`tests` set in a scratch copy of `modules.json` (empty until BOB's merge): `architecture.mjs`: 12 product files, 19 relative imports; 0 failures. `coverage.mjs`: 11 of 11 live ids named by a test; 0 failures. `ownership.mjs … tranche/T33`: 13 files; 0 failures. With the registered empty paths, coverage sees 0 of 11 (the accepted red until the merge).

Size (session_01Qp9gyE9dgpPJuAa5rXEJrc): test runs 12, module lines 808
