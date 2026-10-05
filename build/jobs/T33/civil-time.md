# civil-time (T33)

**Status** · session_01NSP5WdNfdnMBpVCnGYLjPh · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1 (testing against profiles before jurisdictions merges). R27 and R29 need the T33 profile fields (R26 widened, R46–R49, R56–R57) that JURISDICTIONS #? is only starting to write. My best reading: I code against jurisdictions' approved field names; my tests take `combine(['oakland-alameda'])` and `combine(['test-port-ellery'])` views from the real profiles for every fact those already hold (time_zone, hours, holidays), and until T33-2 merges I hold, inside my test fixtures only, a supplement of the R26/R46–R49 facts copied from time-law.md §1 with their citations (and TEST values for the test profile), merged into the real view by the test helper. Before my COMPLETE I merge tranche/T33 after jurisdictions merges, delete the supplement, and run the worked examples on the profiles' own facts. If the profiles then name a fact differently, I follow jurisdictions. Carrying on on this reading.

Q2 (field reading, no answer needed unless wrong): `units: "business_hours"` is R11's "business hours"; `count: "business"` with `units: "days"`; a day rule's `closures` names a holidays `list` (R47) and with no selector I use the entries with no `list` for all offices plus those naming `office` (R9). `extension.when` I read as text (the condition), not a computation input; `extension.count` as the extension's own day count (calendar/business).

## J2 · QUESTION

Q3 (rule fields R26 does not name; replaces nothing, adds to J1). Three things my requirements count need a field for that jurisdictions R26/R48 leave unnamed. My best reading, which I build now and will rename to whatever JURISDICTIONS fixes:
(a) R14 "due by close of business": a deadline entry's `due_at`: `"close_of_business"` (the governing office's `hours` close on the due day) or `"HH:MM"` (a stated time on the due day).
(b) C1, OMC 2.20.070(C) (Monday special meeting: timely if made by noon on the preceding Friday): a second deadline entry with `applies_on: ["mon"]` (the anchor's local weekday it applies to; on any other weekday evaluateRule refuses RULE_INVALID naming `applies_on`... no: answers undetermined, why "the rule applies only to a meeting on mon"), `units: "days"`, `amount: 3`, `count: "calendar"`, `direction: "backward"`, `due_at: "12:00"`. A caller answers both entries; the later of the two is the safe harbour.
(c) R15 cutoff/receipt: read from the `venue` of the `action_kinds` entry the rule's `applies_to` names (R48), so evaluateRule needs no new argument.
If BOB or JURISDICTIONS prefer other names or shapes, one ANSWER and I follow.
