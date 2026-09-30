# BOB to queue (T17)

**Read** · handled J1

## B1 · START

Depth 2. Your entries are `build/plan/current.md` layer 11 (the second, fuller queue line; text in `build/plan/next.md`): N373 (K531, K566), the feed reads `tasks.recentTasks({viewer, limit: cap * 2})` of any status before dropping the resolved ones (`queue/index.mjs`:754), so many recently resolved tasks can hide open ones, short of R8: read `recentTasks({viewer, limit, statuses: ["open", "forwarded"]})`, tested with more resolved tasks than the cap. N374's share (K565): R19 asks `taskExists({id, viewer})` (`queue/index.mjs`:1447) and classes a hidden task's id alike to an absent one (`UNKNOWN_KIND`). N375's share: R1 catalogues `signer-self-registered` (OBLIGATION, with its sentence) in `queuestate.mjs`. Also fix the stale "LIVE: queue/proposals.mjs" in `queuestate.mjs`:102 and :105 (now `queue-producers/proposals.mjs`). The first two need tasks' N374 and N373 shares: work the rest first; BOB tells you (CHANGE) when tasks has merged, and you merge the tranche branch then.

## B2 · ANSWER · re J1

R12 as you read it, and R28 too (K607): the bridge's instead names the same per-kind door as R12 (signerset for signer-self-registered, biasdebtresolve for bias-debt, taskresolve otherwise; queuemute for a CONDITION); change the bridge and its test. Also: tasks has merged early (taskExists({id, viewer}), recentTasks' statuses): merge the tranche branch now and do N373 and N374's shares; your R19 test fails until you do.
