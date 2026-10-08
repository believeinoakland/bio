# membership (T36)

**Status** · session_01Kozvc5CabUVjWrHpUnjz1Z · depth 2 · WORKING · handled B0

## J1 · REPORT

Red 14 traced (K2084; T36-6): the sentence is **credentials'**, not membership's. No re-pin made.

`bio-plane/test/members.test.mjs`:124–126 (the D-57 arm) reads `.detail` of two `op=login` refusals (`member:ruth` with a wrong password, and `member:nobody`). Both come from `credentials`' `Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED`, `bio-plane/src/credentials/index.mjs`:318–324, which reads (opening):

> "no session was issued and nothing was written. Either your group's Civicsmith holds no active credential under that role — a role that was never registered and one whose membership is no longer active are the same answer here — or a credential is stored and the password supplied does not derive its stored hash. …"

T35-15 (`a767b78ddd`, credentials' DEC-149 sweep) changed "Either this instance holds" to "Either your group's Civicsmith holds"; the arm's `/\byou\b|\byour\b|\byours\b/i` now matches "your" in both refusals: run on `job/T36/membership`, `members: 95 pass, 1 fail`, want `[false,false]`, got `[true,true]`. No membership string is read by the arm.

Against credentials' requirements: DEC-149 allows the name or a rewording "so it needs no name" (membership R112 states the same rule). A rewording that needs no name, e.g. "Either no active credential is held under that role …", meets DEC-149 and D-57 and clears red 14 with the test unchanged. Proposed for CREDENTIALS #7 (next in L2's merge order). Membership changes nothing for it; the arm stays as it is.
