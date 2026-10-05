# civil-time (T33)

**Status** · session_01NSP5WdNfdnMBpVCnGYLjPh · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1 (testing against profiles before jurisdictions merges). R27 and R29 need the T33 profile fields (R26 widened, R46–R49, R56–R57) that JURISDICTIONS #? is only starting to write. My best reading: I code against jurisdictions' approved field names; my tests take `combine(['oakland-alameda'])` and `combine(['test-port-ellery'])` views from the real profiles for every fact those already hold (time_zone, hours, holidays), and until T33-2 merges I hold, inside my test fixtures only, a supplement of the R26/R46–R49 facts copied from time-law.md §1 with their citations (and TEST values for the test profile), merged into the real view by the test helper. Before my COMPLETE I merge tranche/T33 after jurisdictions merges, delete the supplement, and run the worked examples on the profiles' own facts. If the profiles then name a fact differently, I follow jurisdictions. Carrying on on this reading.

Q2 (field reading, no answer needed unless wrong): `units: "business_hours"` is R11's "business hours"; `count: "business"` with `units: "days"`; a day rule's `closures` names a holidays `list` (R47) and with no selector I use the entries with no `list` for all offices plus those naming `office` (R9). `extension.when` I read as text (the condition), not a computation input; `extension.count` as the extension's own day count (calendar/business).
