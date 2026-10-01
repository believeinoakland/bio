# membership (T20)

**Status** · session_01Hm4zb2v2byBSPbjJcCmpoE · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Re-scan (B1's first step) over `bio-plane/src` and `bio-plane/test/m`: one caller is still on a copy, so per B1 (P4) two copies wait.

- `bio-plane/test/m/ratification/preflight.test.mjs` (ratification's tests) calls `w.membership.signerRegisterOwn` (:157, :255, :272) and `w.membership.signerRevokeOwn` (:159, :268), where `w.membership` is `membershipOf` (its `fixture.mjs`:99). Re-pointing them is `s.w.credentials.signerRegisterOwn` / `signerRevokeOwn` (credentials R9, R10), a ratification test edit. Until then `signerRegisterOwn` and `signerRevokeOwn` stay, and with them what they need: `#signerMemberBar`, `#keyShaped`, the `BAD_KEY` answer (C-96.8 in `CUSTODIAL_CHECKS`), rows C-96.15–.17 and the `SIGNER_ENROLMENT_CHECKS` copy (C-63).
- Every other named copy has no caller left and goes in this job: `attestingKeys`, `signerList`, `aiCredentialLook` (with its private `#aiCredentialPublic`, `#aiCredentialWrites`), `SIGNER_ATTESTS`.
- Outside the scan (legacy-tests, K619, not deleted): `bio-plane/test/signer-enrolment.test.mjs` names `signerList`/`attestingKeys` through the old store.

My reading: carry on with the rest (deletions above, `MODULE_ORDER`, R96) and list the two waiting copies as deferred in my COMPLETE; if you would rather re-point ratification's test (a CHANGE for this job cannot, it is ratification's file), the two copies go in a later job or a CHANGE here once it lands.

## J2 · COMPLETE

Job done on `job/T20/membership` (pushed; `tranche/T20` merged in after B2, K875).

**Entries applied** (`build/plan/current.md` L2, B1, B2):
- N445 with K791's list, as B2 (K875) ruled: deleted `attestingKeys`, `signerList`, `aiCredentialLook` with `#aiCredentialPublic` and `#aiCredentialWrites`, and `SIGNER_ATTESTS` (with its D-158 comment block). Re-scan first (J1): no caller of any of these is left in `bio-plane/src` or `bio-plane/test/m`.
- Rule 2 / R83: `MODULE_ORDER` drops `legacy-checks`, `legacy-store`, `legacy-index`; `test/m/membership/module-order.test.mjs` is green. My own `t9-notice-sight-bounds.test.mjs` R79 order test registered `legacy-store` as a known module; it now uses `monitoring` (layer 10), same meaning.
- R96 (K861): `Membership.COUNT_KEYS` (`projectParticipants`, `projectOwnerVotes`, frozen) and `counts(hid)`, plane's held statement as it is: `count(*)` less rows whose `COALESCE(project_id, '')` is in `hid`, whole for a null `hid`. Membership registers nothing itself. Test: `test/m/membership/t20-figures.test.mjs` (3 tests, each named R96): the source alone, held against plane's copy's statement for 8 viewers (never sent, founder, machine, administrator, member outside each project, outside both, refused); a NULL key never dropped; registered through the real record-core R63 under `membership`, read by `op=stats` through each viewer's sight and by purge's proof whole, with `op=purge` of one project removing exactly its 3 participants and 1 vote. R96 is met once plane registers it.
- Improvements in my own module: stale comments fixed (the header no longer says the legacy store delegates here; `notAnAdmin`'s caller list names credentials' R6, R7, R13 in place of retired R25, R26, R62).

**Rows leaving my table, for promotion's stamp:** none. Every deleted copy minted no row. The rows tied to the copies that wait (C-96.8 `BAD_KEY`, C-96.15–.17, C-63.1–.2) stay until N453.

**Deferred:** `signerRegisterOwn`, `signerRevokeOwn`, and what only they need (`#signerMemberBar`, `#keyShaped`, `BAD_KEY` in `CUSTODIAL_CHECKS`, C-96.15–.17 in `MEMBERSHIP_CHECKS`, the `SIGNER_ENROLMENT_CHECKS` copy). This is N453 (membership, T21), after ratification's T20 L8 job re-points `preflight.test.mjs` to credentials (K875). Their comments now say this. legacy-tests' `test/signer-enrolment.test.mjs` is left as it is (K619).

**Found in other modules (REPORT):**
1. R83's change turns two other modules' tests red. Each asserts `legacy-store`'s place in `MODULE_ORDER`, and both pass on the base:
   - bias `test/m/bias/promotion.test.mjs`:134 (R23: `legacy-store` is registered as a listener, and its expected order puts it between `scheduler` and `queue`);
   - ai-runs `test/m/ai-runs/hidden-notices.test.mjs`:149 (R43: `MODULE_ORDER.indexOf("scheduler") < MODULE_ORDER.indexOf("legacy-store")`).

   Each needs a real module in place of `legacy-store` (bias, ai-runs; neither has a T20 job). They need accepting red by name, or a job.
2. Red on the base too, not from this change: capture-sources `test/m/capture-sources/credentials.test.mjs`:557. It runs `civicos-ui/check-refusal-codes.mjs`, which imports `bio-plane/scripts/walkfloor.mjs`, and that file is gone.
3. Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` / `.bundle.json` (owner `not_product`). The manifest hashes `src/membership/index.mjs` and `checks.mjs`, which matched before this change and no longer do. Regenerate at layer close. `fleetbundles.test.mjs` also shows agent-worker input-count and arm-(j) failures that name no file of mine.

**Tests and checks run:**
- `node --test bio-plane/test/m/membership/`: tests 139, pass 139, fail 0 (after the merge).
- Users of `MODULE_ORDER` and of the deleted copies: extraction 162/0, capture-requests 63/0, content 113/0, credentials 33/0, ratification 181/0, publication 94/0, capture 94/0, queue-producers 46/0, admission 19/0, instance-setup 85/0, control-plane 85/0, plane 28/0, promotion 99/0, record-core 90/0; bias 54/1 and ai-runs 55/1 (item 1 above).
- Whole `bio-plane/test/m`: tests 4591, pass 4568, fail 3 (items 1 and 2), skipped 0, todo 20.
- Layer tests: none named in the manifest.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 22 product files, 57 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 79 of 79 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T20`: 5 files changed by membership; 0 failures.

Size (session_01Hm4zb2v2byBSPbjJcCmpoE): test runs 10, module lines 3555
