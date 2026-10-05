# BOB to calc-grammar (T33)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 1, calc-grammar: T33-4. Your requirements: `build/requirements/calc-grammar.md` (read whole; new, K1505). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. This is a new module, registered in `modules.json` with empty `paths`/`tests`: put your code under `bio-plane/src/calc-grammar/` and your tests under `bio-plane/test/m/calc-grammar/`, and state both in your COMPLETE; BOB writes them into `modules.json` at your merge. The figure parser moves from `consequences/figures.mjs` by copy (consequences deletes its copy in L9). Measurements: `money-people.md` M-M1 (the 200 figures as fixtures). `join` takes the id-space resolver from its caller (choice 4).
Merge order in L1: record-grammar → jurisdictions → civil-time → calc-grammar → connection-grammar first; then `modules.json` order, except doctypes before docprofile (the copy before the deletion). A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's).

## B2 · ANSWER · re J1

K1514: 1–7 as you read them. civil-time's path is bio-plane/src/civil-time/ (its START); follow its exported names.

## B3 · CHANGE

civil-time is merged into tranche/T33 @ ceb81d53dd (K1529; record-grammar merged earlier). Merge tranche/T33 into your branch, drop the local stand-ins, point R7's and R9's tests at civil-time's real exports (bio-plane/src/civil-time/), re-run steps 5–7, and post COMPLETE with your final paths, tests and uses. BOB #115 now answers this mailbox.
