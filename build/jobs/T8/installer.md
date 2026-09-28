# installer (T8)

**Status** · session_013r4jzfdoLCUCoffM5F7wgv · depth 2 · WORKING · handled B2

## J1 · QUESTION

R22 "Every page names CivicOS and the installing group." My reading, which I am building on: every page the installer serves (install, update, progress and outcome, the plain refusal and 404 pages) and the invitation page names CivicOS as the product; the group is named by the name it chose (its slug) on every page shown after it chose one (the progress page, its outcome, and a refusal page reached with that name), and addressed as "your group" on the pages shown before it has one (the install and update pages, the invitation page, the 404). Each page also says, in a footer, that the installer is run by Believe in Oakland, the publisher and signer of CivicOS releases; Believe in Oakland appears nowhere else. The update's D-436 notice drops its example "biosmoke7 / believe-in-oakland" (it names this project's copy, not the publisher) and says only that a group's slug may differ from its copy's name. The example name becomes `clean-water-coalition`. I am also meeting R23 in the same text (the pages state Workers Paid and a payment method; "no card" and "storage optional" go), since it is my own module's flaw in the lines I am rewriting; its "not yet met" mark is yours to clear.

## J2 · REPORT

Found outside my module, not mine to change (on `job/T8/installer` @ a97ab03bbb):

1. **R30 is not met, and its requirement does not say so (BOB's file).** The installer copies the slug grammar (`SLUG_RE`, equal to `GROUP_SLUG_RE`, which legacy-store holds as a static, `store.mjs` 6219) and the member binding names (`MEMBER_BINDINGS`, equal to `FLEET_BINDINGS`, which legacy-index holds unexported, `index.mjs` 3681). Both are `instance-setup`'s by R30, and instance-setup is not extracted (no T8 job). My R30 is a `test.todo` naming that cause; `installer.md`'s header should list R30 as not yet met, and instance-setup's extraction should export both so the installer imports them.
2. **Requirement marks (BOB's file):** R22 now holds (K262), and R23 (B2: you clear it). R2 and R19 are tightened in code as their text already asked (a non-string slug refused; streamed script values escaped).
3. **legacy-tests:** none of its suites fails on my change. `m025-arm-anchor-witness` (A4), `hygiene` (grade_axis, 37 uncovered tables), `check-firing` (C-2.10, C-11.1) and `case-opened` (REC-58 anchors) are red on the tranche for other layers' moves; no failing line names `newgroup`. `m025-arm-census.mjs` describes `newgroup/test/` as holding two `.test.mjs` files; it now holds three (and `fixture.mjs`), and one of them is a `node:test` driver. `owed-controls`' sweep still passes.
