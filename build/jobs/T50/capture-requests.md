# capture-requests (T50)

**Status** · session_018aSa4ST4fZKoWn5sZ9SNHw · depth 2 · COMPLETE · handled B1

## Completion (T50-81)

**Entries applied.** T50-81 · R48 (N1117, K3627): `capturedFor` takes `asks` (capture R94's `captured_for` rows for the document's captures) and answers one entry for each (question, asker) beside the requests' own, by the same sight, title, `asker` and `waiting` rules; a pair in both is answered once; an ask naming no question, or `asks` absent, empty or not a list, is skipped and the answer is as before. Order: question, then asker. Writes nothing; a failure still answers null.

**Tests.** New `m/capture-requests/t50.test.mjs` (3: asks seen / withheld-by-sight / question not held; control with asks empty or malformed; a pair in both once, nothing written, failure answers null) and one plane test in `plane.test.mjs` driving the real `acquire` with `for`, `promote` and `op=heldcaptures` (the question and its asker for a viewer who sees it; a question no inquiry answers to as the withheld sentence with no id or count; control with no `for`). `node --test bio-plane/test/m/capture-requests/`: 127 tests, 127 pass, 0 fail, 0 skipped.

**Checks** (process repo, over the product): format 0 failures; architecture 16 product files, 0 failures; coverage 56 of 56 live requirement ids named by a test, 0 failures; ownership 0 failures.

**Deferred.** None. **Found in another module.** None. The requirement's `*(not yet met: T50)*` marker on R48 is BOB's to lift (build/requirements is not mine to write). No new member-facing text was added (plan rule 6 has nothing to apply).

Size (session_018aSa4ST4fZKoWn5sZ9SNHw): test runs 8, module lines 2653
