# monitoring (T34)

**Status** · session_01VVunakJ19AyEPJNoZhz7Uc · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T34-87 (DEC-149, K1811), monitoring's six rows of `build/plan/draft-T34-dec149.md`:
- `checks.mjs`:55, C-48.8 `DRIVE_TICK_EXPORT_IS_THE_SHELL`'s translation: "… what is known is that your group's Civicsmith could not see the document today."
- `checks.mjs`:67, C-48.9 `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL`'s translation: "Your group's Civicsmith reads the bytes rather than the label, …"
- `index.mjs`:662, `DRIVE_SHAPE_UNRECOGNISED`'s own sentence: "A shape your group's Civicsmith cannot read is a shape it cannot promise to be watching."
- `index.mjs`:1058, the Drive tick's Session Log line, no name needed: "— fetched <export>, the OpenDocument export composed from the Drive <kind> in <document>".
- `index.mjs`:1511, an unscheduled per-meeting address's reason: "cadence is a meeting schedule your group's Civicsmith does not hold".
- `index.mjs`:2258, the landing's failure detail, no name needed: "the landing did not complete, and why was not recorded".
The excluded rows (:263, :544, :987, :1240) and the comments stay, as the START says. C-48.8 and C-48.9's rows are `awaiting stamp` until T35's promotion job (plan Rules (5) 4).

**K1847, `cadence.test.mjs`:298 (R18), cleared.** Cause: docprofile's T34-8 (N549) deleted its seven copied doctypes and their default registration, so in this module's tests no content type is registered and the R18 test's ASP.NET meeting calendar read as docprofile's no-type answer (contract `substance`, weekly) instead of a meeting calendar (`membership`, daily). No module is at fault: the plane registers `doctypes`' types at composition, and `doctypes` is not in monitoring's Uses. The fixture now offers `registerCalendarStub()`, a stand-in meeting-calendar type (contract `membership`) registered through docprofile's `registerDoctype` seam, and the R18 test registers it. Monitoring's code did not change for it.

**Deferred.** Nothing.

**Found in other modules** (reported to BOB):
1. capture-sources (`bio-plane/src/drive.mjs`:216): `readDriveAddress`'s `why` for an unknown Drive shape, "…not a document this instance can promise to have captured.", is member-facing (it leads `DRIVE_SHAPE_UNRECOGNISED`'s detail here and acquisition's refusal) and still says "this instance" (DEC-149). L3 is closed; not in the L8–L11 grep.
2. capture-requests (`index.mjs`:864, :933): "…and this plane did not record why" in a fetch's reason and a promotion's detail; DEC-149 by the same reading if member-facing (not in the L8–L11 grep).
3. following (`test/m/following/fixture.mjs`:156): its stand-in for monitoring still answers the old per-meeting reason, "cadence is a meeting schedule this plane does not hold"; following's own job (T34-70, L10) may want it to match.
4. promotion: two translations changed, so `CATALOG_VERSION` (`gate.mjs`) and the row census move at T35's stamp; `row-census.test.mjs` names C-48.8 and C-48.9 "changed with no record" meanwhile (K1750's pattern).
5. control-plane: `test/m/control-plane/rows-before-r43.json` pins C-48.8 (`b2ef5dc2c81f1964`) and C-48.9 (`a1d3b0bad3383cb2`), now stale: `catalogue-end.test.mjs` is red from this merge until T34-60 re-pins them (accepted red 9, K1836).
6. Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` (and the release and newgroup copies that embed it) hold the old wording, for BOB's regeneration at L10's close.

**Tests and checks.**
- `node --test bio-plane/test/m/monitoring/`: 121 tests, 121 pass, 0 fail (new `voice.test.mjs`, 6 tests: R1, R4 R42, R8, R16 R32, R28 R65, R42). Negative control: with the old wording `voice.test.mjs` fails 6 of 6.
- Users in this layer, on this branch: link-sweep 29 pass, 0 fail; following 20 pass, 1 fail (R2 `body.test.mjs`:71, K1738's named red); scheduler 81 pass, 1 fail (R12 `plane.test.mjs`:150, K1708's named red).
- `checks/format.mjs`: 129 modules, 128 requirements files; 0 failures. `checks/architecture.mjs … monitoring`: 16 product files, 78 relative imports; 0 failures. `checks/coverage.mjs … monitoring`: 56 of 56 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … monitoring tranche/T34`: 8 files changed; 0 failures.
- P6: monitoring is 3,407 lines (under 4,000).

Size (session_01VVunakJ19AyEPJNoZhz7Uc): test runs 10, module lines 3407

## J1 · COMPLETE

T34-87 applied: monitoring's six DEC-149 rows (C-48.8 and C-48.9 translations, DRIVE_SHAPE_UNRECOGNISED's sentence and the per-meeting reason say "your group's Civicsmith"; the Drive tick's Session Log line and the landing's failure detail need no name); C-48.8/C-48.9 awaiting stamp. K1847 cleared: cadence.test.mjs:298 (R18) was red because docprofile's T34-8 removed its default doctype registration, so the ASP.NET calendar read as no type (substance, weekly); the fixture now registers a stand-in calendar type through docprofile's seam. Monitoring 121/121; new voice.test.mjs 6 tests (negative control 6/6 fail on old wording); link-sweep 29/0; following and scheduler 1 fail each, the named reds K1738 and K1708. format, architecture, coverage (56/56), ownership: 0 failures. 3,407 lines. Found elsewhere (record, Completion): capture-sources drive.mjs:216 still says "this instance" in readDriveAddress's why (member-facing, L3 closed); capture-requests index.mjs:864, :933 "this plane did not record why"; following's fixture.mjs:156 stand-in still answers the old per-meeting reason; promotion's catalogue version and row census, and control-plane's rows-before-r43.json pins (accepted red 9), move with C-48.8/C-48.9; the plane bundle is stale for L10's close.
