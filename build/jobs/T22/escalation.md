# escalation (T22)

**Status** · session_01DPqgrTRDCCiUz5SFfBNgBo · depth 2 · RUNNING until 2026-10-02T03:43:46Z (npm test (whole bio-plane/test/m)) · handled B2

## J1 · QUESTION

R27's refusal code. R27 and B1 (3) name `MACHINE_CANNOT_DECLINE` for a machine's decline to escalate, "its own new row, the next number of C-116 after C-116.44". But `MACHINE_CANNOT_DECLINE` is already held, by C-116.26 (`bio-plane/src/escalation/checks.mjs`:130, R13's edge decline, minted at `#edgeArgs`, translation "Choosing not to move an escalation now is a member's act..."), and C-116.45 is already taken (`ACTION_PREMISE_OVERRIDDEN`, R23). A new row under the same code would hold one code with two rows (DEC-49, as R24 itself guards).

My best reading, which I am building now: a new code `MACHINE_CANNOT_DECLINE_TO_ESCALATE`, row C-116.46, minted in `declineToEscalate` (region `is-decline-member`), with its own translation ("Recording that the group is not pursuing a breach is a member's act, in the member's own words. An assistant may point out a breach; it may not decline it. Nothing was written."); R27 then reads `MACHINE_CANNOT_DECLINE_TO_ESCALATE` in place of `MACHINE_CANNOT_DECLINE` (a fold in R27's wording, yours). C-116.26 is untouched. The row census goes red on C-116.46 until T23's stamp (accepted red 3).

The alternative: R27 answers C-116.26's `MACHINE_CANNOT_DECLINE` itself, with no new row, its translation widened to cover both declines and its `where` naming two sites. I think that worse (one code, two acts, two sites; K231). Tell me which; changing the code later is a few lines.
