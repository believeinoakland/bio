# promotion (T51)

**Status** · session_01QXX7F37mcmzDGf3WCEqdPU · depth 2 · WORKING · handled B0

## J1 · QUESTION

Item 2 (K3807, remove the `deploy-ui.mjs` and `check-*.mjs` patterns from `row-census.mjs`) cannot be met yet. I made the edit and ran `system/row-census`: with the patterns gone the census imports `civicos-ui/check-mock-envelope.mjs` (legacy-ui's `paths` still hold `civicos-ui/`, tracked until L11), which runs its check when imported and exits with "check-mock-envelope: 2 failures"; the census suite dies before it reads a row, so the stamp could never go green. Best reading: the patterns stay until T51-126 deletes `civicos-ui/`; then the patterns and the stale comment `gate.mjs`:342 go in that same act (BOB's, after legacy-ui merges, or my CHANGE then). I reverted my edit; nothing of item 2 is in my branch. If you want it done another way (for example the census skipping the whole `civicos-ui/` prefix until L11), say which and I will apply it. R58 (`bundleHistory`, `op=bundlehistory`, R54's fourth arm) is done with its tests; the stamp waits for your CHANGE.
