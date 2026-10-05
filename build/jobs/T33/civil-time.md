# civil-time (T33)

**Status** · session_01NSP5WdNfdnMBpVCnGYLjPh · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Q1 (testing against profiles before jurisdictions merges). R27 and R29 need the T33 profile fields (R26 widened, R46–R49, R56–R57) that JURISDICTIONS #? is only starting to write. My best reading: I code against jurisdictions' approved field names; my tests take `combine(['oakland-alameda'])` and `combine(['test-port-ellery'])` views from the real profiles for every fact those already hold (time_zone, hours, holidays), and until T33-2 merges I hold, inside my test fixtures only, a supplement of the R26/R46–R49 facts copied from time-law.md §1 with their citations (and TEST values for the test profile), merged into the real view by the test helper. Before my COMPLETE I merge tranche/T33 after jurisdictions merges, delete the supplement, and run the worked examples on the profiles' own facts. If the profiles then name a fact differently, I follow jurisdictions. Carrying on on this reading.

Q2 (field reading, no answer needed unless wrong): `units: "business_hours"` is R11's "business hours"; `count: "business"` with `units: "days"`; a day rule's `closures` names a holidays `list` (R47) and with no selector I use the entries with no `list` for all offices plus those naming `office` (R9). `extension.when` I read as text (the condition), not a computation input; `extension.count` as the extension's own day count (calendar/business).

## J2 · QUESTION

Q3 (rule fields R26 does not name; replaces nothing, adds to J1). Three things my requirements count need a field for that jurisdictions R26/R48 leave unnamed. My best reading, which I build now and will rename to whatever JURISDICTIONS fixes:
(a) R14 "due by close of business": a deadline entry's `due_at`: `"close_of_business"` (the governing office's `hours` close on the due day) or `"HH:MM"` (a stated time on the due day).
(b) C1, OMC 2.20.070(C) (Monday special meeting: timely if made by noon on the preceding Friday): a second deadline entry with `applies_on: ["mon"]` (the anchor's local weekday it applies to; on any other weekday evaluateRule refuses RULE_INVALID naming `applies_on`... no: answers undetermined, why "the rule applies only to a meeting on mon"), `units: "days"`, `amount: 3`, `count: "calendar"`, `direction: "backward"`, `due_at: "12:00"`. A caller answers both entries; the later of the two is the safe harbour.
(c) R15 cutoff/receipt: read from the `venue` of the `action_kinds` entry the rule's `applies_to` names (R48), so evaluateRule needs no new argument.
If BOB or JURISDICTIONS prefer other names or shapes, one ANSWER and I follow.

## J3 · REPORT

For jurisdictions (T33-2), its R57 fixture (K1505 (16)): time-law.md §3's derived OMC row ("meeting Wed 2026-10-14 18:00 → Fri 2026-10-09 18:00; negative Mon 10-12 18:00") is inverted on the code's plain text. 48 hours "excluding Saturdays, Sundays and holidays" back from Wed 18:00 is Wed 0–18 (18 h) + Tue (24 h) + Mon 10-12 18:00–24:00 (6 h) = Mon 2026-10-12 18:00 when 10-12 is not a City holiday (it is not on M-190's list). Fri 10-09 18:00 would be the answer only if 10-12 were a holiday (or for 72 business hours). civil-time tests the derived row as Mon 2026-10-12 18:00, negative Fri 10-09 18:00, labelled derived; the jurisdictions job's re-derivation should agree or tell me.

## J4 · REPORT

Built and green, short of COMPLETE by one step (K1513's reading): every id R1–R29 is met and tested (62 tests, 0 fail); checks architecture, coverage (29/29) and ownership 0 failures. format has 2 failures that are the tranche's, not mine: modules.json gives legistar-reader `paths` legistar-reader/ and `tests` legistar-reader/test/, which name no file on tranche/T33 yet (53b31a1b46).
Code bio-plane/src/civil-time/ (index, days, zone, edtf, values, calendar, rules, recurrence; 1,339 lines); tests bio-plane/test/m/civil-time/ (1,106 lines). Final uses: record-grammar (ISO_TS_RE), jurisdictions (tests only: combine; the code reads only the view's shape).
Waiting on: T33-2's merge. Then I merge tranche/T33, delete the test-only supplement in test/m/civil-time/helpers.mjs, run the worked examples on the profiles' own facts, and post COMPLETE. One thing to settle then: the worked examples P1, P2, P5, P6, E1, E2 and R1 count through judicial-holiday years 2018, 2020 and 2024. If jurisdictions' first profile holds only 2026 (R56 names the CCP §135 list, no years), I keep those historical years as fixture data in my tests, each cited, beside the profile's view; say if you want otherwise.

## J5 · COMPLETE

COMPLETE: T33-3 civil-time, on tranche/T33 @ 172512c288 merged (jurisdictions included).

Paths for modules.json: `paths` ["bio-plane/src/civil-time/"], `tests` ["bio-plane/test/m/civil-time/"]. Final `uses`: record-grammar (ISO_TS_RE, in code), jurisdictions (tests only: `combine`; the code reads only the view's shape, R26 as K1514 widened it).

Entries applied (T33-3, whole): local day; precision and zone; EDTF level 1, level 2 refused by name; three-valued compare; isCalendarDate; inclusive dayRange; the zone-less EventDate+time join (M-V2); time rules: days calendar/business, hours, business hours, months, years, forward and backward, roll, closures selector, CCP §12 computation, extension computed (both readings where its start is open, K1504 (2)), tolling, due_at (close of business or HH:MM), applies_on (K1514), cutoff and receipt from the applies_to kind's venue, practice beside the rule (rule's `observed` or the caller's `practice`), factOf statuses; the four basis kinds with law_set; direction-aware uncertain dates and overdueOn by side; bounded RRULE subset; fiscal periods; validAt with event bounds; span; traces with tz/ICU versions. No clock is read.

Requirements: R1–R29 all met, each named by tests that check it at the interface. R29: P1–P6, R1, C1, O1–O6, N6 reach their dues with negatives not reached; E1/E2 published answers not matched; F1–F3 and the two derived timed checks (Brown Act 72 h; OMC 48 business hours → Mon 2026-10-12 18:00, K1513) as labelled derived rows. All on the first profile's own facts; the only fixture added is the 2024 CCP §135 year R1's roll needs (K1523), cited. The test profile's answers are re-derived from its own facts (Sunday weekend, town/court lists, 16:30 cutoff, receipt rule, fiscal years, recurrences).

Deferred: none. Readings recorded (not requirement changes): EDTF qualifiers (? ~ %) do not widen a band; seasons 21–24 read at their widest (winter Y = Y-01-01 to (Y+1)-02 end); a wall time in a spring gap is refused DATE_INVALID by bounds and undetermined by joinLocal; a recurrence instance in a gap moves past it (RFC 5545); an EDTF year beyond the runtime's date range takes offset 0. Undetermined answers from evaluateRule/due/span carry a `code` (CALENDAR_UNCOVERED, FACT_ABSENT, FACT_WITHHELD, FACT_DISPUTED, UNMEASURED, ANCHOR_UNDETERMINED, RULE_INVALID with `field`, RULE_NOT_APPLICABLE, POSSIBLY_OVERDUE); overdueOn refuses an unknown side SIDE_UNKNOWN, span an unknown unit UNIT_UNKNOWN.

Other modules: none found wanting. (Earlier: the derived OMC row, J3, settled K1513.) No generated artifact touched.

Tests and checks: `node --test bio-plane/test/m/civil-time/` 63 tests, 63 pass, 0 fail. `node --test jurisdictions/test/` 81 pass, 0 fail. No layer tests named in manifest. format: 126 modules, 125 requirements files; 0 failures. architecture civil-time: 14 product files, 31 relative imports; 0 failures. coverage civil-time: 29 of 29 live ids named; 0 failures. ownership civil-time tranche/T33: 15 files; 0 failures. (architecture/coverage/ownership run with civil-time's paths filled in a local, uncommitted modules.json; the committed file is untouched.)

Size (session_01NSP5WdNfdnMBpVCnGYLjPh): test runs 16, module lines 1334
