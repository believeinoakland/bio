# membership (T20)

**Status** · session_01Hm4zb2v2byBSPbjJcCmpoE · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Re-scan (B1's first step) over `bio-plane/src` and `bio-plane/test/m`: one caller is still on a copy, so per B1 (P4) two copies wait.

- `bio-plane/test/m/ratification/preflight.test.mjs` (ratification's tests) calls `w.membership.signerRegisterOwn` (:157, :255, :272) and `w.membership.signerRevokeOwn` (:159, :268), where `w.membership` is `membershipOf` (its `fixture.mjs`:99). Re-pointing them is `s.w.credentials.signerRegisterOwn` / `signerRevokeOwn` (credentials R9, R10), a ratification test edit. Until then `signerRegisterOwn` and `signerRevokeOwn` stay, and with them what they need: `#signerMemberBar`, `#keyShaped`, the `BAD_KEY` answer (C-96.8 in `CUSTODIAL_CHECKS`), rows C-96.15–.17 and the `SIGNER_ENROLMENT_CHECKS` copy (C-63).
- Every other named copy has no caller left and goes in this job: `attestingKeys`, `signerList`, `aiCredentialLook` (with its private `#aiCredentialPublic`, `#aiCredentialWrites`), `SIGNER_ATTESTS`.
- Outside the scan (legacy-tests, K619, not deleted): `bio-plane/test/signer-enrolment.test.mjs` names `signerList`/`attestingKeys` through the old store.

My reading: carry on with the rest (deletions above, `MODULE_ORDER`, R96) and list the two waiting copies as deferred in my COMPLETE; if you would rather re-point ratification's test (a CHANGE for this job cannot, it is ratification's file), the two copies go in a later job or a CHANGE here once it lands.
