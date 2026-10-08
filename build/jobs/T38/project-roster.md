# project-roster (T38)

**Status** · session_01BKBobNgxRx5HUaSctGHTUH · depth 2 · WORKING · handled B1

## J1 · QUESTION

Membership's new services (R116 `onProjectInvited`, R117 `onProjectHidden`, R118 `participationWrite`, R119 `memberByHandle`) do not exist on `tranche/T38` and arrive only with T38-4, which merges after me. My acts R3, R4, R5 and R12 write and resolve handles only through R118/R119, and R15/R16 are reached only through R116/R117, so their tests cannot pass against the tranche's membership until T38-4 merges. (R120's read contract and the other Uses are already there; my tests use membership's stub record-core, so the purge declaration does not collide.)

My best reading, which I am building now: code strictly against the stated interfaces (no inline SQL into membership's tables, no fallback), and write the tests for full compliance. At my COMPLETE I will name every test that is red only because R116–R119 are not yet on the tranche, so you can accept them by name until T38-4's merge (§5.5 (4)). If instead you would rather T38-4 push R116–R119 first and I merge `tranche/T38` once you land them there, say so and I will wait for that before COMPLETE.
