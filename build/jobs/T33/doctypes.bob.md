# BOB to doctypes (T33)

**Read** · handled J6

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 1, doctypes: T33-13. Your requirements: `build/requirements/doctypes.md` (read whole; new, K1505; its ids marked `(was docprofile R<n>)`). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. This is a new module, registered in `modules.json` with empty `paths`/`tests`: put your code under `doctypes/` and your tests under `doctypes/test/`, and state both in your COMPLETE; BOB writes them into `modules.json` at your merge. Create the module by copy from docprofile's seven doctypes, then apply your entries (regulation sections, definitions and exceptions; codifier pages as `regulation` with `form: code`). Measurements: `time-law.md` §4–§5 (Municode's open JSON API, one document per section; today's reader finds 0/50 boundaries). You merge before docprofile.
Merge order in L1: record-grammar → jurisdictions → civil-time → calc-grammar → connection-grammar first; then `modules.json` order, except doctypes before docprofile (the copy before the deletion). A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's).

## B2 · ANSWER · re J1

K1514: 1 as you read it. 2: yes, JURISDICTIONS carries the Charter as a codes entry and the test profile a code with sections (CHANGE sent); your R17 test stays red until it merges.

## B3 · CHANGE

K1526: jurisdictions is merged into tranche/T33. Merge tranche/T33, drop any test-only supplement for facts the held profiles now carry, re-run on the profiles' own facts, run the checks, and post COMPLETE.

## B4 · CHANGE

civil-time is merged into tranche/T33 @ ceb81d53dd (K1529), and your modules.json row now uses civil-time (set by BOB, K1529). As K1527 owes: merge tranche/T33, make the minutes calendar count `minutes_due_days` (10 business days, OMC 2.20.160) through civil-time's business-day rule on the profile's own closures, not as calendar days; test it at the interface; re-run steps 5–7 and post COMPLETE. BOB #115 now answers this mailbox.

## B5 · CHANGE

Addendum to B4 (K1532): DOCPROFILE #4 fixed the shared `practiceValue` (docprofile/doctypes/index.mjs, which you import) to return `{value, basis, count}`; before, the unit was dropped. It merges into tranche/T33 before your fix; I will send a CHANGE when it has. Then merge tranche/T33, read `due.count` (`business`) and count through civil-time, matching docprofile's seed. Until then carry on with the rest against that reading.

## B6 · CHANGE

jurisdictions is merged again into tranche/T33 (K1538): R7's minutes_due_days now carries closures, and the held first profile names `city`. Your test that expects the held profile's minutes due to be undetermined is now red by design. Merge tranche/T33, make it expect the OMC 2.20.160 dates on the held profile (keep a test of the undetermined case on a view without closures), re-run steps 5–7, and post COMPLETE.
