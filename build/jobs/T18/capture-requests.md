# capture-requests (T18)

**Status** · session_01Ff7skf5DLANXvvLjjJWTYg · depth 2 · WORKING · handled B1

## J1 · QUESTION

The ✱ deletion of `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES` and `userAgentIsLegible` from `bio-checks.mjs` needs `legacy-checks` in capture-requests' `from`: `modules.json` (here and on `tranche/T18`) gives only `from: "legacy-store"`, so `checks/ownership.mjs` would refuse every removed catalogue line as "outside capture-requests' paths" (capture, entities, strength and ai-runs carry `legacy-checks` in their `from` for the same kind of move).

My best reading: BOB adds `legacy-checks` to capture-requests' `from` (`["legacy-store", "legacy-checks"]`) on `tranche/T18`, and I merge it with run-rules' merge. Until the answer comes I do the work as planned (the three names moved into `src/capture-requests/checks.mjs` and deleted from the catalogue, C-28 less C-28.13 copied) and hold the ownership check for after the merge. If BOB would rather the move be a copy (no ✱), say so and I keep the catalogue's three names.
