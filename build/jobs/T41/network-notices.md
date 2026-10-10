# network-notices (T41)

**Status** · session_01GXCqPTAxKrSAfPYRLzkwSn · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

D54 and R25. Since T41-3, membership R44/R77 give an administrator (founder included) at a HIDDEN project's EXISTENCE a C-70.1 refusal carrying `owners` (the owners' handles). network-notices relays `existenceAct`'s refusal as it came (R1 for prepareNotice/postNotice, R22 for noticesOf), so an administrator who is neither invited nor joined, calling `op=noticeprepare`, `op=noticepost` or `op=notices` on a hidden project, now gets an answer naming members (handles), while R25 says "No answer of this module names a member". R1 and R22 also say only "a discoverable project `by` sees only at existence" is answered with existenceAct's refusal.

My best reading (built on it, nothing changed in code): the relayed refusal is membership's answer, minted only there (R77), and R25's list (revisions, attestations, keys, leaves, openings) is about this module's own outward material; D54 (Bob's) decides what an administrator learns at EXISTENCE. So I keep relaying it unchanged for both forms of EXISTENCE, as project-stage R1 does. If you agree, R1 and R22 might say "a project `by` sees only at existence (either form, membership R44)" and R25 might except a relayed membership refusal; that text is yours. If instead you want the handles stripped here, say so and I will strip `owners` from the relay.

## J2 · COMPLETE

**T41-44a applied (N822, K2442).** `bio-plane/src/network-notices/index.mjs`:187 `#closed` now reads `projectStage` with the machine viewer `class:daemon` (as `link-sweep` does), which sees every project, hidden ones included; the founder's `"admin"` no longer sees a hidden project it is not in (D54). That one line was the cause of five of the six rule 4 (11) reds: `activity.test.mjs`:129 (R12 closed attestation), `prepare.test.mjs` (R1 R11 NOTICE_PROJECT_CLOSED; listed as :13, its `rowOk` helper), `seals.test.mjs`:26 (R14), :260 (R14 sealWake), :325 (R17 attestWake): all pass unchanged after the fix, so none was re-stated (they assumed only the internal read's sight).

**Re-stated for D54:** `reads.test.mjs`:222 (R24). It assumed the founder's and an administrator's FULL sight of hidden P. Now: the founder (`admin`, `member:admin`) and an active administrator neither invited nor joined are at EXISTENCE of hidden P and get membership's C-70.1 relayed as it came (deep-equal to `existenceAct`), nothing of a notice, nothing written. Negative controls at FULL: an invited administrator on hidden Q, and all three on P made discoverable, are refused only by R1's caller refusals (NOTICE_NOT_THE_OWNER, or MACHINE_CANNOT_POST_NOTICE for the founder, who has no roster row).

**New test (K874):** `activity.test.mjs` "R1 R12 R14 R22 (D54, K2442) a HIDDEN project's close is read as an internal caller…": hidden P closed and hidden Q open (the founder at EXISTENCE of both, project-stage refusing it). P gets the `closed` attestation, is not sealed and refuses a change NOTICE_PROJECT_CLOSED (a stop still taken); Q is still not closed: its notice stays open, it is sealed, its change is accepted. Members' own reads stay fenced: dave on P, alice on Q answer NO_SUCH_PROJECT; the founder's `noticesOf` on P is C-70.1 with nothing of the notices. It fails with `"admin"` restored at :187 and passes with the fix.

**Deferred:** none. **QUESTION J1** (D54 vs R25: C-70.1 relayed to an administrator now carries owners' handles) is open; I built on my reading (relay unchanged). If you answer otherwise, a CHANGE re-opens the job.

**Found in other modules / artifacts:** none in other modules' code. The plane bundle is staled by any change to `src/network-notices/` (rule 4 (14)); I did not regenerate it (mechanics §14).

**Reading set:** measured at about 265 KB (my requirements 24 KB; each used module's Purpose plus the services my Uses names, about 32 KB; my code 89 KB; my tests 120 KB), under 300 KB: read whole myself, no workers. Also read whole: layer 8's row of `build/layers.md`, the plan's T41-44a and rule 4 lines, K874, K2304, K2408, K2442, K2483, membership's R43/R44/R77 code and text, project-stage R1–R4 and its `projectStage`.

**Final uses (unchanged):** record-grammar, signatures, record-core, membership, credentials, promotion, host-governor, provenance, attestation, capture, publication, public-read, project-stage, docket.

**Tests and checks:** `node --test bio-plane/test/m/network-notices/*.test.mjs`: tests 73, pass 73, fail 0 (was 72/66/6 at START). Layer tests: none named in `build/manifest.md`. No provided service changed, so no user's suite was run. `checks/format.mjs`: 145 modules, 144 requirements files; 0 failures. `checks/architecture.mjs`: 12 product files, 65 relative imports; 0 failures. `checks/coverage.mjs`: 30 of 30 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … tranche/T41`: 4 files changed; 0 failures.

Size (session_01GXCqPTAxKrSAfPYRLzkwSn): test runs 11, module lines 1413

## J3 · COMPLETE

**B2 applied (K2529).** Merged `tranche/T41` into my branch; read the re-worded R1, R22 and R25 whole. The code already meets them: `#sightRefusal` relays `membership.existenceAct`'s C-70.1 unchanged for either form of EXISTENCE, and `reads.test.mjs`'s R24 test asserts that relay (deep-equal to `existenceAct`) for the founder and an administrator at hidden P, with controls at FULL. No code or test change. Everything else as J2.

**Tests and checks after the merge:** `node --test bio-plane/test/m/network-notices/*.test.mjs`: tests 73, pass 73, fail 0. `format`: 145 modules, 144 requirements files; 0 failures. `architecture`: 12 product files, 65 relative imports; 0 failures. `coverage`: 30 of 30 live requirement ids named by a test; 0 failures. `ownership … tranche/T41`: 4 files changed; 0 failures.

Size (session_01GXCqPTAxKrSAfPYRLzkwSn): test runs 12, module lines 1413

## J4 · COMPLETE

B3 applied (K2543): merged tranche/T41 (publication T41-36, @ e2f3e4b7f7) into my branch @ 90919f0b16. Nothing I read changed: publication's R37, R40, R41, R53 (the cases, published_cases, caseCitedParts this module reads) are unchanged by the merge. No code or test change; J2 and J3 stand. On the merged tip: network-notices tests 73, pass 73, fail 0; format 0 failures (145 modules, 144 requirements files); architecture 0 failures; coverage 30 of 30 live ids, 0 failures; ownership 4 files, 0 failures. Size (session_01GXCqPTAxKrSAfPYRLzkwSn): test runs 13, module lines 1413
