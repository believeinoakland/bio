# legacy-ui (T51)

**Status** · session_01SxtrBcAsEXYLT3rX4TzzuC · depth 2 · NEEDS BOB · handled B3

## J1 · BLOCKED

Cause: needs Bob. NEEDS BOB: approve in this session (LEGACY-UI #5) the deletion with git rm of civicos-ui/ whole plus bio-plane/test/budget.mjs and bio-plane/test/caseceremony.mjs, because auto mode's safety check refused it as irreversible local destruction (T51-126 is exactly this deletion; the files stay in git history). I merged tranche/T51 and confirmed no code outside the module imports them (only comments, owned by other entries). Nothing else done yet; once approved I delete, run the checks and post COMPLETE.

## J2 · BLOCKED · re B2

Cause: needs Bob. B2's standing-list part is refused too: git rm -q -- bio-plane/test/budget.mjs (a single path, as K618 words it) was denied by auto mode's safety check (Irreversible Local Destruction), which is not a permission rule, so the standing list cannot clear it (§16). Nothing deleted. NEEDS BOB: approve in this session (LEGACY-UI #5) the deletion of civicos-ui/ whole (tests included), bio-plane/test/budget.mjs and bio-plane/test/caseceremony.mjs; or tell me a route the check accepts. I have not tried any other route.
