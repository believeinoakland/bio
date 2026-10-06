# connection-grammar (T34)

**Status** · session_018zeFM5yr82fH5eXANSqAd8 · depth 2 · WORKING · handled B1

## J1 · QUESTION

R9's answer shape. R9 says `ownerConformance` answers `{ok, failures, inapplicable}`. My best reading, built: `inapplicable` is always present, `[]` without a declaration. Consequence: four owners' battery tests that `deepEqual` the whole answer against `{ok: true, failures: []}` turn red, one test each, in modules outside the plan's accepted red (5)(3): lines `owner.test.mjs:13` (R14), standards `reads.test.mjs:139` (R28), progressions `owner.test.mjs:43` (R40), duties `contract.test.mjs:31` (R18). Each passes the battery; only the exact shape differs (`+ inapplicable: []`). Measured on this branch: before my change lines 29/0, standards 47/0, progressions 61/0, duties 30/0; after, 28/1, 46/1, 60/1, 29/1. Every other user is unchanged: entities 82/0, events 44/0, local-facts 33/0, connections 117/0, money 52/0, money-checks 30/0, people 35/0, explore 25/0, hypotheses 14/0, contradiction 119/0, affordances 192/0, plane 110/0.
Options: (a) as built, and those four reds accepted by name until each owner's T34 job (lines T34-18, standards T34-21, duties T34-22 are in T34; progressions has no T34 entry I can see), each asserting `inapplicable: []`; (b) `inapplicable` left out of the answer when it is empty, a one-line change, which keeps all four green and reads R9's "Without a declaration nothing is inapplicable" as nothing stated. I recommend (a), which matches R9's shape. Everything else is done; I hold COMPLETE for your answer.
