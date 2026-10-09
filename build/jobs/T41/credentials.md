# credentials (T41)

**Status** · session_01NyoLivN8Gk5Yd1QkwvULcW · depth 2 · COMPLETE · handled B4

## Completion (CREDENTIALS #11)

**Reading set** (mechanics §17, K2304): measured over 300 KB (requirements 62 KB, own code 222 KB, own tests 355 KB). Read whole myself: `build/requirements/credentials.md`; layer 2's row and section of `build/layers.md`; the plan's entry T41-5 and its rules at the opening; K2418, K2425, K2435; DEC-188 (that entry); the used services my entry relies on (membership's `HANDLE_WORDS` pattern, record-core R34 `bundleInfo`, R21 `declareTable`/`purge` with `whole`); `checks.mjs`, `schema.mjs`, `index.mjs` lines 1–700 and 1053–2196 and 2541–end (every section my entry changes), and the tests my entry changes (t40, account; group-key, grant, t38, t35-misc, t36, t37, t35-signin, seam, rows-ops at the lines changed). A worker read whole `index.mjs` 700–1052 and 2197–2540 and the 16 other test files (about 300 KB) and wrote a 17 KB summary citing file:line: fixture helpers, each file's ids, and every line touching the retired acts, `USE_KINDS`, sign-in standing, the ops-map key set, the R48 sweeps and the table census. Nothing it left out mattered: every line it listed was changed or passed unchanged, and its code ranges touch none of the tables or names this entry changes. It noted four minor points in `aiCredentialMint`/`aiCredentialRevoke` (R12, R14, R15), none a violation; left as they are.

**Entries applied (T41-5; N820, N796, DEC-188 (1), (7), (8)).**
- R55: `USE_KINDS` gains `enquire`, `read`, `transcribe`, `account` (frozen, after `explore`); each a switch of every account (reference, sign-in, project account, group key), on by default; columns `use_enquire`, `use_read`, `use_transcribe`, `use_account` added (additive, default 1, so an account held before T41 reads them on). Material limits name and bind them (R57's `uses` from `USE_KINDS`); removing the group key turns them off with the rest. C-29.21 `UNKNOWN_SWITCH` re-worded to name the new kinds (a row change for T41-6).
- R25, R37 (DEC-188 (8)): `accountSwitchSet`/`groupSwitchSet` removed as methods and their routes `accountswitchset`/`groupswitchset` removed (B2: K2437); the switches and stored values stand, set through `accountUsesSet`; `groupKeySwitches()` unchanged.
- R32 (N796, K2425): a member served by their sign-in is asked the sign-in's own `standing` switch (off by default, their own act); a sign-in is never refused for being one; a standing grant the sign-in served ends when the sign-in is disconnected (or the member revoked).
- R54, R56, R57, R58 (DEC-188 (7)): `checks.mjs` holds `AI_WORDS`, the seven `words.json` entries verbatim by key (membership's `HANDLE_WORDS` pattern); the six rows' `translation` is the word read by key (row changes for T41-6). R58: `projectKeyNotice`'s text is `ai.disclosure.projectkey` with `{project}` the project's name (record-core `bundleInfo` title, else the id; B2), and `PROJECT_KEY_NOTICE_DUE` carries `project_name` and `disclosure: {key, text}`.
- R60: `accountUses({owner, viewer})` (`op=accountuses`): owners only (R55's refusals); `{owner, held, uses, keptAway}`, for a member also `accounts: {reference, signin}` (B2); `keptAway` each limit that can bind it, `{scope, on, uses, reason, set_by, set_at}`; never a key; writes nothing; never throws.
- R61: one table `account_changes` keyed by `owner` (seq, owner, project_id, at, by, change, detail JSON, origin UNIQUE): `key_set`, `signin_set`, `switched`, `removed`, `use_set`, `limit_set`, written in the same act as each accepted change (R22, R33, R43 incl. R16's clearing, R51, R54, R55, R57); never a refusal or a read. R33's, R51's, R54's and R57's earlier records are carried once at `migrate` in the order made, each naming its origin (no back-fill, no duplicate); those tables are still written, each row with its change beside it. `accountHistory({owner, viewer, limit})` (`op=accounthistory`), owners only, R15's cap with measured `truncated`. R30: declared `purge: "clear"` keyed by `project_id` with `whole: "project_id IS NOT NULL"`, so a project's rows go with it and the group's and members' never; never exported.
- Merged `tranche/T41` (B3, K2442): t40.test.mjs's administrator cases re-stated under D54 (an administrator sees a hidden project at existence, C-70.1).

**BOB's readings (B2, K2437):** `bundleInfo` (record-core R34) added to my Private Uses (BOB's text); R60's member shape; the retired acts removed as methods.

**Tests.** New `t41.test.mjs` (12 tests: every new or changed id R25, R30, R32, R37, R54–R58, R60, R61 with a negative control, K874; R61 also through the real record-core's purge). Existing tests updated where the contract changed: calls to the retired acts re-pointed to `accountUsesSet`; `uses` shapes and table columns gained the four kinds; the ops-map key set; the declared tables gain `account_changes`; T38's sign-in standing refusal rewritten as lifted; the project-key notice text; D54 (above).

**Ran.**
- `node --test test/m/credentials/*.test.mjs` (after the merge): tests 168, pass 168, fail 0.
- No layer tests named in the manifest.
- Users' suites (40 test paths of the modules whose `uses` names credentials, 447 files), on my branch after the merge and on `tranche/T41` @ aaa50a7f0d: every red on mine is red on the tranche too (D54's and earlier accepted reds), except these, all from the retired acts (DEC-188 (8)):
  - answers `standing.test.mjs`:188 (calls `accountSwitchSet`; also :154, :183, :210 call it) — accepted by name until T41-29 (B2). (:122, :273 red on the tranche too.)
  - plane `ask.test.mjs`:69, :182, :234, :264, :287, :301 (call `accountSwitchSet`/`groupSwitchSet`) — accepted by name until T41-63 (B2).
  - ai-runs `scheduler.test.mjs`:123 (calls `accountSwitchSet`) — not in B2's list: its job re-points to `accountUsesSet`.
  - affordances `t33.test.mjs`:151 (credentials' ops map still expected to hold `accountswitchset`) and `t34.test.mjs`:199 (expects credentials to serve `groupswitchset`) — affordances' T41-52 re-states the retired ops.
  - op-declarations `t34.test.mjs`:226 (`groupswitchset` among the group key's acts; :68, :144 red on the tranche too) — T41-58.
- Checks: `format` 0 failures; `architecture` credentials 0 failures; `coverage` 60 of 60; `ownership` 16 files, 0 failures.

**Deferred.** None.

**Found in other modules.** The five users' reds above (ai-runs, affordances, op-declarations, answers, plane) all re-point the retired `accountswitchset`/`groupswitchset` to `accountusesset` in their own jobs. The users still to admit a sign-in's `standing`/`explore` (answers, agent-worker, question-explorer; K2425) are their entries. Generated artifact staled: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), regenerated at layer close.

Size (session_01NyoLivN8Gk5Yd1QkwvULcW): test runs 18, module lines 3826

## J1 · QUESTION

Three readings I am building on; tell me if any is wrong.

1. R58 `{project}` "the project's name": membership offers no project name, so I read it from record-core's `bundleInfo(project).title` (record-core R34), falling back to the project id when no title is held. That adds `bundleInfo` (R34) to my Private Uses under record-core (no new module edge). The refusal's row `translation` stays the words.json template verbatim (as membership's HANDLE_FIXED keeps `{case}`); `projectKeyNotice`'s `text` and the `disclosure` PROJECT_KEY_NOTICE_DUE carries are filled with the name.

2. R60 for `member:<id>`: a member holds up to two accounts (reference, sign-in). I answer `{owner, held, uses, keptAway}` with `uses` the switches of the account `accountUsesSet` sets (the reference when held, else the sign-in; null when neither), plus `accounts: {reference: {held, uses}, signin: {held, uses}}` so the panel shows each. `keptAway` lists every limit that can bind the account, on or off, each `{scope, on, uses, reason, set_by, set_at}` (`scope` `group`, or `project` with its id): the group's for every owner, and for `project:<id>` that project's too.

3. R55/R25/R37 retirement: `accountSwitchSet` and `groupSwitchSet` are removed as methods too, not only their routes (they are acts, and R55 makes `accountUsesSet` the one act). Users' tests that call them go red until their jobs: answers `standing.test.mjs` (:154, :183, :210) and plane `ask.test.mjs` (:71, :196, :236, :266, :293, :316). I will name every red in COMPLETE.
