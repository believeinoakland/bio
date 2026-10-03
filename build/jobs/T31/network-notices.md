# network-notices (T31)

**Status** · session_016Qoe57tyy7EQDdaxDtEBXa · depth 2 · WAITING ON BOB (J1) · handled B3

## Completion

**Entries applied** (B1; `plan/current.md` T31 L8, N538; K1365, K1367):
- R3: new revisions carry `civicsmith-working-on/1` (`NOTICE_FORMAT`); `NOTICE_FORMATS` lists both labels, current first. A revision published before T31 keeps its bytes; a change to that notice chains to it by `previous` over its stored bytes.
- R10: `ACTIVITY_METHOD_VERSION` is `civicsmith-working-on-activity/1`. `ACTIVITY_METHOD` gains `earlier_labels` (`civicos-working-on-activity/1`) and `same_method` (the sentence saying an earlier label names this same method). `activityMethod()` also answers `earlier_labels` at top level. The method text is otherwise unchanged.
- R12, R13: new attestations carry `civicsmith-working-on-attestation/1` (`ATTESTATION_FORMAT`; `ATTESTATION_FORMATS` lists both) and are signed over `attestation.instanceStatement` under that label. Attestations issued before T31 keep their bytes and verify over their own label.
- R17: openings carry `civicsmith-working-on-opening/1` (`OPENING_FORMAT`, now defined in `seals.mjs` beside `verifyOpening`; `OPENING_FORMATS` lists both). `verifyOpening` reads no label, so it accepts either. `method` stays `civicos-working-on-seal/1`.
- R14 (K1365 (2)): the four seal hash tags and `civicos-working-on-seal/1` are unchanged; comments now say they are permanent.
- The TSA user agent: `Civicsmith/<VERSION> (working-on seal)` (was `CivicOS/…`), in `#timestamp`. It still does not go through acquisition's composer and carries no contact URL, as the draft noted (acquisition is not in this module's Uses).

**Tests** · new `bio-plane/test/m/network-notices/labels.test.mjs`, five tests. A notice published before T31 is written into this module's own tables as the earlier code's post left them: revision signed by the owner, attestation signed by the instance key under the old label. Everything after that runs through the interface.
- R3 R20: an old-label revision still verifies over `noticeStatement`. A change and a stop carry the new label, chained by `previous`. The notice is served whole and in order with both labels. Control: the old revision relabelled fails `BAD_SIGNATURE`.
- R12 R13: the old attestation verifies over the old label and not the new one. New `posted` and `monthly` attestations carry the new label and verify over it, not over the old one.
- R10: the earlier label is listed as the same method. Every attestation's `activity.method` is found in the answer. The method text is unchanged.
- R17 R14: a new opening has the new format and the old method. An old-label opening, stored and served as stored, verifies. A tampered leaf still fails under either label. The seal hash tags are checked as literals.
- R15: the user agent is checked on every authority tried, with and without `VERSION`.

**Deferred** · none.

**Found in other modules** · none. Nothing else imports the labels. `attestation`'s tests use `"civicos-working-on-attestation/1"` only as a sample statement kind, which stays valid.

**Generated artifacts** · `bio-plane/dist/bio-plane.bundled.mjs` goes stale from this module's source (not_product; BOB at the layer close).

**Ran**
- `node --test test/m/network-notices/`: tests 68, pass 68, fail 0.
- Users of this module (case-authoring `notices`, ratification `seals`, scheduler, plane `notices`, queue-producers `sweeps`, public-read `public-reads`, control-plane `families`, op-declarations `t23`, queue `signals`): tests 116, pass 116, fail 0. No layer tests are named in `build/manifest.md`.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio network-notices`: 0 failures. `checks/coverage.mjs bio network-notices`: 30 of 30 live ids named; 0 failures. `checks/ownership.mjs bio network-notices tranche/T31`: 0 failures.

Size (session_016Qoe57tyy7EQDdaxDtEBXa): test runs 6, module lines 1408

## J1 · COMPLETE

N538 applied: R3, R10, R12, R13, R17 new civicsmith labels with the old ones accepted (old-label verification tests in labels.test.mjs); seal tags and civicos-working-on-seal/1 kept; TSA user agent Civicsmith/<VERSION>. Module tests 68/68, users' tests 116/116; format, architecture, coverage (30/30), ownership 0 failures. Nothing deferred, nothing found in other modules; bio-plane dist stale (BOB at layer close). Record: build/jobs/T31/network-notices.md.

## B2, B3 · after the providers merged

Merged `tranche/T31` after case-grammar (B2), then after publication, docket and public-read (B3); no conflicts. Re-ran on the merged branch: `node --test test/m/network-notices/` 68 pass, 0 fail; the users' tests 116 pass, 0 fail; format, architecture, coverage (30 of 30), ownership: 0 failures each.

Size (session_016Qoe57tyy7EQDdaxDtEBXa): test runs 10, module lines 1408
