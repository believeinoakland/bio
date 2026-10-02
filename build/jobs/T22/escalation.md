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
