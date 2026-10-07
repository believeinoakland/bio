# membership (T35)

**Status** · session_015yQnLVheaZfu3qaM43gQjp · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T35-14:
- (N664, the DEC-149 sweep, 11 rows) each row reads as `plan/draft-T35-dec149-l1-l7.md` words it: `checks.mjs` C-102.11 and C-102.12 ("A part of your group's Civicsmith …", "a fault in how your group's Civicsmith was built", rows :72, :73, :78, :80), C-55.1 ("`admin` is the name your group's Civicsmith gives its founding administrator", :236), C-96.11 ("the hosting account your group's Civicsmith runs in", :318); `index.mjs` `notAnAdmin`'s detail ("your group's Civicsmith takes who is asking from the signed-in session rather than from the caller", :139), `caseAuthority`'s C-57.1 detail ("a registered signer in your group's Civicsmith", :801), `adminRemove`'s ROOT_OF_TRUST detail ("because your group's Civicsmith runs in somebody's hosting account", :2246), `memberAdd`'s MEMBER_ID_RESERVED detail ("names the founding administrator of your group's Civicsmith", :2323), and R108's `COURT_STATEMENT` exactly as amended ("Your group's Civicsmith keeps this …", :2963). No other member-facing string of the module named a copy, instance, plane or server (grep of every non-comment line). Comments, codes and field names stay.
- (N697) R83: `MODULE_ORDER` gains `case-catalogue` (layer 8, after `network-notices`), `machinery-producers` (layer 11, after `tasks`) and `setup-page` (layer 11, after `queue`), so it equals `build/modules.json` again: accepted red 5 clears here (`module-order.test.mjs` ×2, `members.test.mjs` R79 order) and its sisters, promotion `registry.test.mjs` R39/R45/R46 and standards `reads.test.mjs` R29, are green.
- DEC-149's glossary term entry is the design stream's (K1934 (7)); not touched.

**P6.** 3,966 → 3,970 lines (+4), inside BOB's +0 to +5.

**Tests.** New `test/m/membership/t35-words.test.mjs` (9 tests): each of the 11 sweep strings named and reached at the interface (exact text); R112 over every row of all seven exported check tables; and a battery of 80 answers (over 70 refusals, every detail, message, remedy, translation, warning and the statement) held to the rule. Amended: `t34-settings.test.mjs`'s R108 constant to the amended sentence.

**Deferred.** Nothing.

**Found in other modules (REPORT J1).**
- control-plane `catalogue-end.test.mjs`:21 (R43, R22) pins a digest of each row's translation from `rows-before-r43.json`; the four rows DEC-149 moves here (C-102.11, C-102.12, C-55.1, C-96.11) change it: red from this change, 0 before. The snapshot's re-pin is control-plane's (its job T35-72); record-core's re-worded rows (T35-13) will meet the same pin.
- hypotheses `notes.test.mjs`:43 (R11) pins the court sentence's old wording ("Your group's copy …") and checks it equals `Membership.COURT_STATEMENT`: red from this change, as R108 requires. Its re-pin is hypotheses' (T35-41).
- Generated artifact staled (§14): `bio-plane/dist/bio-plane.bundled.mjs` (embeds `src/membership/`); `fleetbundles.test.mjs` names STALE BUNDLE for both files until BOB regenerates at L2's close (rule 7). `case-checker/program.mjs` does not embed membership. `release/` and `newgroup/src/release.mjs` carry the old strings as release copies.

**Tests and checks run.**
- membership (`test/m/membership/`, `test/members.test.mjs`): before 160 pass, 3 fail (red 5); after tests 172, pass 172, fail 0.
- Every module that uses membership (79 modules, 810 test files), on the change and on `tranche/T35`'s head side by side: tests 5865 each; before pass 5840 fail 14, after pass 5840 fail 14. New: the two above. Cleared: promotion R39/R45/R46 and standards R29 (red 5's sisters). The other 12 are the same on both sides.
- `node checks/format.mjs`: 129 modules, 128 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 25 product files, 66 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 95 of 95 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T35`: 5 files changed; 0 failures.

Size (session_015yQnLVheaZfu3qaM43gQjp): test runs 12, module lines 3970

## J1 · REPORT

Two reds in other modules from T35-14's wording, both re-pins in their owners' T35 jobs: control-plane catalogue-end.test.mjs:21 (R43, R22) pins translation digests of C-102.11, C-102.12, C-55.1, C-96.11 (T35-72; record-core's T35-13 rows meet the same pin); hypotheses notes.test.mjs:43 (R11) pins the court sentence's old 'Your group's copy' wording (T35-41). Staled (§14): bio-plane/dist/bio-plane.bundled.mjs (fleetbundles STALE BUNDLE on src/membership/*) until L2's close regenerates. Detail in the record's Completion.
