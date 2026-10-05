# civil-time (T33)

**Status** · session_01NSP5WdNfdnMBpVCnGYLjPh · depth 2 · WORKING · handled B3

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
