# escalation (T22)

**Status** · session_01DPqgrTRDCCiUz5SFfBNgBo · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R27's refusal code. R27 and B1 (3) name `MACHINE_CANNOT_DECLINE` for a machine's decline to escalate, "its own new row, the next number of C-116 after C-116.44". But `MACHINE_CANNOT_DECLINE` is already held, by C-116.26 (`bio-plane/src/escalation/checks.mjs`:130, R13's edge decline, minted at `#edgeArgs`, translation "Choosing not to move an escalation now is a member's act..."), and C-116.45 is already taken (`ACTION_PREMISE_OVERRIDDEN`, R23). A new row under the same code would hold one code with two rows (DEC-49, as R24 itself guards).

My best reading, which I am building now: a new code `MACHINE_CANNOT_DECLINE_TO_ESCALATE`, row C-116.46, minted in `declineToEscalate` (region `is-decline-member`), with its own translation ("Recording that the group is not pursuing a breach is a member's act, in the member's own words. An assistant may point out a breach; it may not decline it. Nothing was written."); R27 then reads `MACHINE_CANNOT_DECLINE_TO_ESCALATE` in place of `MACHINE_CANNOT_DECLINE` (a fold in R27's wording, yours). C-116.26 is untouched. The row census goes red on C-116.46 until T23's stamp (accepted red 3).

The alternative: R27 answers C-116.26's `MACHINE_CANNOT_DECLINE` itself, with no new row, its translation widened to cover both declines and its `where` naming two sites. I think that worse (one code, two acts, two sites; K231). Tell me which; changing the code later is a few lines.

## J2 · REPORT

Two things outside my own code.

1. **The plane's bundle is stale.** My change under `bio-plane/src/escalation/` (`index.mjs`, `checks.mjs`, `schema.mjs`, `ops.mjs`) makes `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` stale (`build/manifest.md`, "Generated artifacts"). I regenerated nothing; it is yours at the layer close.

2. **Coverage of escalation R29 was hidden.** Before this job the coverage check counted escalation R29 as named. It was not tested: a comment in `test/m/escalation/fixture.mjs`:5 named *actions'* R29 (`actionRead`). The comment now names no id, so the check answers what is true: `FAIL escalation: 1 of 29 live ids named by no test: R29`. B1 says R29's coverage red is T23's, but your list of the 11 accepted coverage failures (B1's update) does not include it. Please add `escalation R29 (until T23)` to that list. R27 and R28 are now named, so they leave it.

No requirement of another module is unmet by what I found. Two notes for the L11 jobs B1 named, not mine to edit: affordances' `escalationopen` row (`bio-plane/src/affordances.mjs`:1206) and `escalationattach` row (:1207) still say ground `undetermined`, and their `is` text does not mention the reason each act now requires. Both are affordances' L11 work (`reasoned`), together with op-declarations' `ESCALATION_ACTIONS` and `ESCALATION_READS` for `declinetoescalate` and `escalationstatus`.

## J3 · COMPLETE

Complete on `job/T22/escalation` @ f6dcb3e119, with `tranche/T22` @ 9419fe5ef2 merged (B2's re-worded R27).

**Requirements now met: R1, R9, R17, R18, R24, R25, R27 and R28.** R29 and its `escalationreasondraft` arm are T23's, as B1 says. I built neither, and the map has no such key.

**Entries applied.**
- **R1 (DEC-88, DEC-89 (1)).** `escalationOpen` requires the author's `reason`; a bad one is refused `ESCALATION_NO_REASON` (C-116.24, row unchanged).
  - Order: after `MACHINE_CANNOT_OPEN`, and after R19's judged-input refusal, which keeps its place. Before the determination is read.
  - The reason goes on the `open` log entry, with who and when. It is projected to a new `escalations.opened_reason` column and read back three ways: the open answer's `reason`, the read's `opened_reason`, and the history entry.
- **R9 (DEC-88).** `escalationAttach` requires the attacher's `reason`.
  - Order: after `MACHINE_CANNOT_ATTACH` and the judged-input refusal, before `NO_SUCH_ESCALATION`.
  - The reason goes on the `attach` entry and in a new `escalation_attachments.reason` column. It is read back in the escalation's `actions` (`reason`, `attached_by`, `at`) and in the history.
  - Both new columns are added to an older store by `migrateEscalation` (guarded, nullable; an earlier row reads none).
- **R27 (DEC-89 (2), K1084).** `declineToEscalate({determination, reason, author, viewer})`.
  - R1's conditions are now one private gate, `#pursuable`, which both acts ask; each act mints its own machine refusal. The decline's is `MACHINE_CANNOT_DECLINE_TO_ESCALATE`, a new row C-116.46. While an escalation is open or suspended, a decline is refused `ALREADY_OPEN`.
  - Each decline is inserted, never updated, into a new table `escalation_declines_to_open` (declared to purge, keyed by `determination_id`), with its reason, who and when.
  - Its id is `<determination>/decline-to-escalate#<n>`.
  - Each row also stores `escalations_before`, the number of the determination's escalations opened before it. That places a decline exactly among the openings, even within the same second.
- **R28.** `escalationStatus({determination, viewer})` answers `escalated`, `declined` or `neither` by the latest of the openings and declines.
  - It also answers `escalations`, the same items as R22's `escalationsFor`, each now with its opening `reason`.
  - And `declines`: id, reason, author, at, and `superseded_by` (the next decline or opening, or null), oldest first.
  - An absent, unseen or unnamed determination gets `conformance.noSuchDetermination`. The read writes nothing.
  - It answers `PROVIDER_UNAVAILABLE` when conformance is absent, as every service does.
- **R25.** `escalationOps` gains `declinetoescalate` (the body's fields, then the query's `author` and `viewer`) and `escalationstatus` (the query's `determination` and `viewer`). That makes 12 arms, with no `escalationreasondraft`.
- **R17, R18.** No machine opens, declines to escalate or attaches. The opening reason, the attachment reason and each decline to escalate are kept append-only with who, when and why. The invariants tests carry the new acts.
- **R24.** Its list (R1, R9, R27) is met; the code and row are unchanged.
- **(6) Callers.** I re-ran the grep over `bio-plane/`, `agent-worker/` and `civicos-ui/`. No caller of `escalationOpen`, `escalationAttach` or their ops lies outside my paths; only op-declarations' and affordances' op tables name the ops. My fixture's `opened` and `toStage` send reasons, and `test/m/affordances/` is green.
- **(7) Re-scan.** No note in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the deleted plane `index.mjs` as live. The `LEGACY-TESTS #6 J2` notes and `ops.mjs`' past-tense `store.mjs` are provenance and stay. I updated the module's header, `REASON_MAX`'s and `refuseReason`'s notes, and the `checks.mjs` header.

**Rows awaiting stamp** (accepted red 3, `bio-plane/test/system/row-census.test.mjs`): C-116.46 `MACHINE_CANNOT_DECLINE_TO_ESCALATE` (arrived); C-116.5 `NOT_NONCOMPLIANT`, C-116.6 `ESCALATION_NOT_A_PARTICIPANT`, C-116.7 `ALREADY_OPEN` (changed: each row's `where` now names `#pursuable`, the one site both acts ask; translations unchanged) — awaiting stamp.

**Deferred:** nothing. **Other modules:** my REPORT (J2): the stale plane bundle; R29's coverage red, which a comment had hidden; notes for the L11 jobs. Accepted red 5: the door answers `unknown op` for `declinetoescalate` and `escalationstatus` until op-declarations', affordances' and control-plane's L11 merges. None of my tests drives the door, so no test of mine turns red on it.

**Tests and checks** (on f6dcb3e119):
- `node --test test/m/escalation/` passes 44 of 44, `real.test.mjs` included. That count includes the new `decline.test.mjs`, which covers R1, R9, the migration forward, R27, R28 and C-116.46.
- Negative control: with the reason checks removed and the status pinned to `neither`, 6 tests fail (R1, R9, R24, R25, R27, R28). Restored, 44 pass.
- The users' suites (escalation, action-plans, monitoring, queue-producers, affordances, control-plane, plane): 488 tests, 476 pass, 6 fail, all accepted:
  - control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310 (L11);
  - queue-producers `proposals.test.mjs`, its 4 tests. These fail the same with the tranche's escalation code in place, so they are not mine.
- Whole `bio-plane/test/m`: 4,932 tests, 4,903 pass, 11 fail, 18 todo. Every failure is accepted by name, and none is new:
  - actions `t18.test.mjs`:299;
  - control-plane :15 and :310;
  - accepted red 4 (membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58);
  - queue-producers ×4;
  - scheduler `plane.test.mjs`:85.
- `row-census.test.mjs` is red: accepted red 3, my four rows above among the others.
- Checks (civicos-process):
  - format: 86 modules, 0 failures;
  - architecture: 0 failures;
  - coverage: 28 of 29, 1 failure, R29 (T23's; J2);
  - ownership: 0 failures.

Size (session_01DPqgrTRDCCiUz5SFfBNgBo): test runs 16, module lines 1688
