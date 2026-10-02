# review (T22)

**Status** · session_01ULUf6UDdMnHCiVyAGaQLk4 · depth 2 · COMPLETE · handled B3

## Completion

**Entries applied** (B1; B2, B3 merged, `tranche/T22` @ e523fd5788 merged at 0273dd0ece). **R28 met**: the copy's `statement_acknowledgements.act` stays `op=statementack&draft=<draft id>`, naming only the act and the draft. Beside it, `act_requires: ["reason"]` (queue's `requires` form) is answered alike on both doors (`src/review/index.mjs`). (1) `copy.test.mjs`: R15's key set gains `act_requires`. The new R28 test checks the link (only `op` and `draft`) and the key on four copies: two members, a recipient, and a recipient naming the draft. Its negative controls (no key, a reason pre-filled, the reader in the link, another draft or act, empty or extra requires) are each seen. (2) The fixture's `statementAcknowledgements` stub carries each row's `reason` as stored, null before DEC-88. The new R15/R28 test checks that rows pass through byte for byte on both doors: a reason untrimmed, a pre-DEC-88 row's `reason: null` present and unfilled, with a negative control. (3), (4) no change, as B1 says. (5) Re-scan: one note called the op map "the legacy store's"; it is reworded to the plane store's (`plane/store.mjs`). The other legacy mentions are provenance and stay.

**Deferred**: none.

**Other modules**: my change under `bio-plane/src/review/` stales `bio-plane/dist/bio-plane.bundled.mjs` (J1). Nothing regenerated. No flaw found elsewhere.

**Tests** (after merging B3's tranche): `test/m/review/` 35 pass, 0 fail. Users: `case-authoring` 90/0; `publication` 96/0; `plane` 33/0; `control-plane` 100/2 (`doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, accepted until L11). Whole `bio-plane/test/m`: 4896 pass, 11 fail, every fail accepted by name. They are actions `t18.test.mjs`:299; control-plane's two above; scheduler `plane.test.mjs`:85; queue-producers `proposals.test.mjs` (:78, :124, :153, :167, until its L11 merge); and accepted red 4, the `MODULE_ORDER` family (membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58, R39/R45/R46 per K936). This branch's diff from the tranche touches only `src/review/`, `test/m/review/` and this record. No new red.

**Checks**: format: 86 modules, 85 requirements files; 0 failures. architecture: 8 product files, 36 relative imports; 0 failures. coverage: 28 of 28 live requirement ids named by a test; 0 failures. ownership: 4 files changed by review between tranche/T22 and HEAD; 0 failures.

Size (session_01ULUf6UDdMnHCiVyAGaQLk4): test runs 10, module lines 1015

## J1 · REPORT

Work done on my reading, before case-authoring's merge (commit e165db6dfd on job/T22/review). (1) R28: the copy's statement_acknowledgements keeps act `op=statementack&draft=<id>` and gains `act_requires: ["reason"]` beside it (src/review/index.mjs). copy.test.mjs: the R15 key set gains act_requires; a new R28 test checks the link (only op and draft, no reader, no words) and act_requires on both doors (two members, a recipient, a recipient naming the draft), with negative controls (key missing, reason pre-filled, reader in the link, another draft or act, empty or extra requires). (2) The fixture's acknowledgement stub gives each row its reason as stored (null before DEC-88). A new R15/R28 test checks that rows pass through unchanged on both doors, a reason untrimmed and null left null, with a negative control. (3), (4): nothing changed, as B1 says. (5) Re-scan: one note named 'the legacy store's op map' as live; reworded to the plane store's (plane/store.mjs). The other notes are provenance and stay. test/m/review/: 35 pass, 0 fail. Users, before the merge: case-authoring 79/1 (members.test.mjs:98, the accepted :129 red), publication 94/0, plane 33/0, control-plane 100/2 (doorbell.test.mjs:310 and catalogue-end.test.mjs:15, accepted). Each red fails the same with my change stashed. STALE ARTIFACT: this change under bio-plane/src/review/ stales bio-plane/dist/bio-plane.bundled.mjs. I regenerated nothing. Next: waiting for your CHANGE announcing case-authoring's merge. Then I merge tranche/T22, re-run, run the checks and post COMPLETE.
