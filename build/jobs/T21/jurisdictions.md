# jurisdictions (T21)

**Status** · session_014nagcRH9hTKVppmJyfbM18 · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 layer 1, K921, K924, K925, K931, K934):
- **R40** a kind's `template` is `{id, version, use, text, notes, authored_by, contributors, reviews, approved_by, approved_at, basis}`: bare text or a missing field `TEMPLATE_UNATTRIBUTED` naming it (a review's `reviewer`, `kind`, `scope`, `outcome`, `at` likewise); wrong forms `VALUE_INVALID` (an id twice in the profile, the approver the author); basis a ruling (`K<n>`), or `TEST` in a test profile. **R28** `TEMPLATE_TIER3` only for `use: file` on a Tier 3 kind.
- **R41** `time_zone` `{value, status, basis}`, an IANA name the runtime's zone database knows, shaped `Area/Location` or `UTC` (`PST`, `GMT`, `EST` refused); a known section; one value in `combine`.
- **R42** `hours` on a counterparty or a venue: `HOURS_INVALID` for a day, a time, open not before close, overlapping spans on one day.
- **R43** a holiday entry's `offices` (roles or `{venue: <kind>}` of a kind with a venue); a year once for all offices and once per distinct list (order-free); **R34** `combine` keys each entry by (year, offices).
- **R44** `status` on every holiday entry, hours and time zone; `researched` needs every basis part a measurement, `ruled` a ruling; `UNMEASURED` refused; `TEST` for either in a test profile only (K934, as J1 read it).
- **R29** a template (whole attribution), an office's hours and a venue's hours each one value per key; a venue's hours withheld alone, the venue standing.
- **R45** the test profile: `file` templates on its Tier 2 and Tier 1 kinds, a `brief` on its Tier 3 kind (all blanks in `FILING_BLANKS`), a time zone, hours on the Town Clerk and on the records-request venue, 2026 for all offices plus 2026 entries for the Town Clerk and for a venue, both statuses. The first profile: `time_zone` (M-187), the City Auditor's hours (M-192), the court venue's hours (M-193), 2026 holidays for the court venue (M-189), the City's three offices (M-190, without 09-09 and 11-11) and the State Controller (M-191), all `researched`; no 2027; no hours for the Controller, the Council, the Civil Grand Jury or the State Controller; no template. M-188 left out (K934 (1)).
- **N469**: re-scanned my paths; no note names a file T20 deleted. The notes naming `idspaces.mjs`, `meeting-calendar.mjs`, `store.mjs`, `bio-checks.mjs` and REC-206's `membership.mjs` are provenance (the snapshot's code the profile was read from) and stay.
- **`not yet met: T21` marks met:** R40, R41, R42, R43, R44, R45 (K775 (6)).

**Also in this module:** the R25, R28, R29, R30, R33, R34 and R36 tests that asserted the old rules (no template on a Tier 3 kind, a bare-text template, a year once, no first-profile calendar) brought to the amended requirements; `walkFacts` now walks the time zone, hours and templates.

**A note on K925 (3), for BOB:** R33 makes a listed year complete, so the City's 2026 entry, written without 09-09 and 11-11, counts those days as business days for the Controller, the Council and the Auditor. That is K925's ruling as stated; a count across them comes out one day earlier than if the days stood, the cautious side for a filer's own deadline and the hasty side for flagging an office's response as late.

**Deferred:** none.

**Found in other modules** (J2): `filings` reads a profile template as bare text (35 of its tests fail on this branch, 0 on the tranche; its L9 move to `filing-templates` R15); `action-clocks`' `computeDeadline` and `filings/dates.mjs` key holidays by year only, against R43 (its tests still pass; the first profile's office-specific 2026 entries would be miscounted).

**Generated artifacts staled:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`; `newgroup/dist/newgroup.bundled.mjs`. Not regenerated (B1).

**Tests and checks:**
- `node --test jurisdictions/test/`: tests 56, pass 56, fail 0 (negative control: disabling the overlap and `TEMPLATE_TIER3` checks fails R42 and both R28 tests).
- Consumers (`bio-plane/test/m/` acquisition, extraction, monitoring, actions, instance-setup, membership, standards, filings, entities, action-grammar, action-clocks, escalation, affordances, id-spaces): tests 964, pass 921, fail 37; on the tranche without my change 956 pass, 2 fail (R79, R83 `MODULE_ORDER`, both runs); the 35 new are all `filings` (J2).
- `fleetbundles.test.mjs`: bio-plane arms fail (staled); `newgroup-bundle-fresh.test.mjs`: arm (C) fails (staled). Both pass without my change.
- `format`: 86 modules, 84 requirements files; 0 failures. `architecture jurisdictions`: 5 product files, 6 relative imports; 0 failures. `coverage jurisdictions`: 45 of 45 live requirement ids named by a test; 0 failures. `ownership jurisdictions tranche/T21`: 6 files changed; 0 failures.

Size (session_014nagcRH9hTKVppmJyfbM18): test runs 14, module lines 3170

## J1 · QUESTION

Three readings I am building on; each answer only if you read it otherwise.

1. **M-188 (the county's 2026 list) is not written into the first profile.** K925 assigns it to no profile office, and R43 gives an entry either `offices` (a role or `{venue: <kind>}` of the profile) or none, and none means every office. With no office to name, the only way to write it would close every office on the county's days, which no source says. So the profile holds the court (M-189, `offices: [{venue: "records_petition"}]`), the City (M-190, `offices: ["Controller", "City Council", "City Auditor"]`, 09-09 and 11-11 left out) and the State (M-191, `offices: ["State Controller"]`); the Civil Grand Jury and the NextRequest venue have no 2026 entry, so a business count for them is undetermined. M-188 stays filed as a measurement.
2. **R44's `ruled` in the test profile takes the basis `TEST`.** R44 says "in a test profile, TEST" under `researched` only, but R22 makes every test-profile basis `TEST` and R45 asks for both statuses there; the only reading meeting all three is that `TEST` stands for either status in a test profile (and only there). Outside a test profile, `researched` needs every part of its basis to be `M-<n>` or a dated entry, `ruled` every part `D-`, `DEC-` or `K<n>`; `UNMEASURED` and a mixed basis are `BASIS_INVALID`.
3. **The court's `offices` is `{venue: "records_petition"}`, per R43**, not the venue's name string `"Alameda County Superior Court"` that M-189's ruling note writes. The requirement is the contract; M-189's wording may want aligning.

## J2 · REPORT

What my change does to other modules and to generated artifacts (all expected from R40–R44; none in my paths).

1. **Generated artifacts staled** (`build/manifest.md`): `bio-plane/dist/bio-plane.bundled.mjs` with `.bundle.json` (it bundles `jurisdictions/index.mjs` and both profiles; `fleetbundles.test.mjs` fails its bio-plane arms), and `newgroup/dist/newgroup.bundled.mjs` (`newgroup-bundle-fresh.test.mjs` arm (C) fails). Not regenerated, as you asked.
2. **`filings` (L9): 35 of its tests fail on my branch, 0 on the tranche.** It reads a profile template as bare text (`bio-plane/src/filings/index.mjs`:499, `typeof entry.template === "string"`), and its fixtures write one (`bio-plane/test/m/filings/prepare.test.mjs`:22, `template: "Please send {{records}}."`), which `validate` now refuses as `TEMPLATE_UNATTRIBUTED` (R40), so `combine` answers `INVALID_PROFILE`. This is the move K921 makes to `filing-templates` (its R15) and `filings` R28–R31; their L9 jobs read `view.action_kinds[k].template` as `{id, version, use, text, …, basis, profile, bases}`. The test profile's three templates use only `FILING_BLANKS` names, so filing-templates R15 can offer them.
3. **`action-clocks` (L9, R10) and `filings/dates.mjs` ignore a holiday entry's `offices`**: `computeDeadline` (`bio-plane/src/action-clocks/index.mjs`:525–527) keys `view.holidays` by year only, so with several entries for one year the last wins for every office. Its tests still pass (I ordered the test profile's one-office and one-venue 2026 entries before the all-offices entry, so the year it keeps is unchanged), but on the first profile, whose 2026 entries are all office-specific (court venue, City offices, State Controller), every office would count on the State Controller's list, and offices with no entry (the Civil Grand Jury, the records portal) would count as though 2026 were listed. R43: a count for an office uses the all-offices entries and those naming it; an office named by none has the year undetermined.
4. Consumers' tests otherwise unchanged: acquisition, extraction, monitoring, actions, instance-setup, membership, standards, entities, action-grammar, action-clocks, escalation, affordances, id-spaces: 964 tests, the only failures besides filings' are R79 and R83 (`MODULE_ORDER`), which fail on the tranche too.

## J3 · COMPLETE

R40–R45 applied and tested (56/56); every `not yet met: T21` mark met: R40, R41, R42, R43, R44, R45. First profile holds the researched calendar (M-187, M-189–M-193) per K925/K934; no template. Checks: format, architecture, coverage (45/45), ownership all 0. Staled: plane and newgroup bundles; filings' tests (J2). Record: ## Completion.
