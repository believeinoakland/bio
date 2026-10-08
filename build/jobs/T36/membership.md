# membership (T36)

**Status** · session_01Kozvc5CabUVjWrHpUnjz1Z · depth 2 · WORKING · handled B0

## J1 · REPORT

Red 14 traced (K2084; T36-6): the sentence is **credentials'**, not membership's. No re-pin made.

`bio-plane/test/members.test.mjs`:124–126 (the D-57 arm) reads `.detail` of two `op=login` refusals (`member:ruth` with a wrong password, and `member:nobody`). Both come from `credentials`' `Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED`, `bio-plane/src/credentials/index.mjs`:318–324, which reads (opening):

> "no session was issued and nothing was written. Either your group's Civicsmith holds no active credential under that role — a role that was never registered and one whose membership is no longer active are the same answer here — or a credential is stored and the password supplied does not derive its stored hash. …"

T35-15 (`a767b78ddd`, credentials' DEC-149 sweep) changed "Either this instance holds" to "Either your group's Civicsmith holds"; the arm's `/\byou\b|\byour\b|\byours\b/i` now matches "your" in both refusals: run on `job/T36/membership`, `members: 95 pass, 1 fail`, want `[false,false]`, got `[true,true]`. No membership string is read by the arm.

Against credentials' requirements: DEC-149 allows the name or a rewording "so it needs no name" (membership R112 states the same rule). A rewording that needs no name, e.g. "Either no active credential is held under that role …", meets DEC-149 and D-57 and clears red 14 with the test unchanged. Proposed for CREDENTIALS #7 (next in L2's merge order). Membership changes nothing for it; the arm stays as it is.

## J2 · REPORT

T36-6's re-pin stales one test outside membership: **progressions** `bio-plane/test/m/progressions/order.test.mjs`:15 (R41). It pins a hand copy of T33's layer 5, `between("entities", "workbooks")` deep-equal to a literal list without `law-relations`. MODULE_ORDER now holds `law-relations` between `observation-log` and `standards` (modules.json's place since K1961), so the copy fails: `+ 'law-relations'` after `observation-log`. It passes on `tranche/T36` without my change (1/0) and fails with it (0/1). Nothing in progressions' code is affected: the rest of the test orders by MODULE_ORDER itself.

Against progressions' requirements: R41 asks that listeners are told in MODULE_ORDER. The pinned literal restates the order instead of reading it, so it goes stale with every module added to layer 5. Fix for progressions' next job: add `"law-relations"` after `"observation-log"` in the literal, or compare with `modules.json`'s layer 5 as membership's own R83 test does. Proposed as an accepted red (as red 3 was for promotion and standards) until progressions' job. Membership re-pins nothing for it.

Checked green with the re-pin: membership `test/m/membership/` 172/0 (module-order 6/0, t9 10/0); promotion `registry.test.mjs` 18/0; standards `reads.test.mjs` 7/0; every other test naming MODULE_ORDER 207/1 (this one); store-door 36/0 and control-plane 167/0 (their `record.mjs` reads MODULE_ORDER).
