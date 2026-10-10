# publication (T41)

**Status** · session_01BKNMquTmjnJkVp4dFUpPPJ · depth 2 · RUNNING until 2026-10-10T18:15:46Z (users' suites after the delete, HEAD vs tranche/T41) · handled B2

## J1 · QUESTION

**R76 and a waiting edition's signer.** R76 counts a waiting edition (asked through R77's `isWaiting`) whose signer, deliverer or preparer is the member, or whose document names the member's handle. A waiting edition's signer and deliverer are held only in `publish-schedule`'s `scheduled_editions` (`signer`, `delivered_by`); its `case_documents` row stays unsigned. R77 gives publication only `isWaiting` and `signedAtOf`, and R77 says no SQL of this module names that table, so publication cannot read who signed a waiting edition.

**My best reading (building on it now):** for a waiting edition, R76 matches the preparer (`case_documents.authored_by`) and the handle rows, but not the signer or deliverer. For a ratified edition it matches all of them. In practice the gap is small: the signer of a scheduled edition is almost always its preparer or a member its document names.

**Alternative, if you want the signer covered:** R77 gains a third door, `signerOf(caseId, edition)` → `{signer, delivered_by}` or null, which `publish-schedule` R8 fills. That changes R77 and publish-schedule R8, so it needs your wording and a CHANGE to T41-37.

**Also, FYI (no answer needed unless you disagree):** K2483 moves `#criteriaOf`'s founder read off `"admin"`. I read through `class:daemon`, the machine viewer that `investigation`, `monitoring` and `duties` use. For a standard outside every project it answers exactly as `"admin"` did: the passages of a reading-room or paywalled standard stay withheld from both, since neither is a member viewer. R72's and R75's text still say "`admin` for the founder". I take K2483 as governing and suggest R72 and R75 read "a machine viewer (`class:daemon`) when no member signs".
