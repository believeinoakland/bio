# credentials (T41)

**Status** · session_01NyoLivN8Gk5Yd1QkwvULcW · depth 2 · RUNNING until 2026-10-09T19:58:17Z (users' test suites (40 paths), mine and tranche baseline) · handled B2

## J1 · QUESTION

Three readings I am building on; tell me if any is wrong.

1. R58 `{project}` "the project's name": membership offers no project name, so I read it from record-core's `bundleInfo(project).title` (record-core R34), falling back to the project id when no title is held. That adds `bundleInfo` (R34) to my Private Uses under record-core (no new module edge). The refusal's row `translation` stays the words.json template verbatim (as membership's HANDLE_FIXED keeps `{case}`); `projectKeyNotice`'s `text` and the `disclosure` PROJECT_KEY_NOTICE_DUE carries are filled with the name.

2. R60 for `member:<id>`: a member holds up to two accounts (reference, sign-in). I answer `{owner, held, uses, keptAway}` with `uses` the switches of the account `accountUsesSet` sets (the reference when held, else the sign-in; null when neither), plus `accounts: {reference: {held, uses}, signin: {held, uses}}` so the panel shows each. `keptAway` lists every limit that can bind the account, on or off, each `{scope, on, uses, reason, set_by, set_at}` (`scope` `group`, or `project` with its id): the group's for every owner, and for `project:<id>` that project's too.

3. R55/R25/R37 retirement: `accountSwitchSet` and `groupSwitchSet` are removed as methods too, not only their routes (they are acts, and R55 makes `accountUsesSet` the one act). Users' tests that call them go red until their jobs: answers `standing.test.mjs` (:154, :183, :210) and plane `ask.test.mjs` (:71, :196, :236, :266, :293, :316). I will name every red in COMPLETE.
