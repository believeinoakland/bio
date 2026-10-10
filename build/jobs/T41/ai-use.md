# ai-use (T41)

**Status** · session_011xdFFLsupbqxVmjj8ymA9A · depth 2 · COMPLETE · handled B5

## Completion (AI-USE #1)

**Paths and tests, for `modules.json`** (BOB writes them, `build/rulings-active.md` §5): paths `bio-plane/src/ai-use/` (`index.mjs`, `schema.mjs`, `checks.mjs`); tests `bio-plane/test/m/ai-use/` (`fixture.mjs`, `counting.test.mjs`, `limits.test.mjs`, `reads.test.mjs`, `explore.test.mjs`). **Final `uses`:** record-grammar, civil-time, record-core, membership, credentials, connections, **retrieval** (K2480, the group's zone), run-rules.

**Reading set** (mechanics §17): measured at the START as about 270 KB, under 300 KB: my requirements (12.5 KB), the public parts of the seven used modules (about 238 KB, an over-estimate) and the code I copy (`ai-runs/index.mjs`:2588–2932, about 16 KB). I read the set as mechanics §3 asks, myself, with no worker. Read whole: `build/requirements/ai-use.md`; layer 6's row and its "Layers 3 and 6" section of `build/layers.md`; the plan's entry T41-22; K624, K1043, K2350, K2373, K2376, K2400, K2448, K2472, K2480 and K2486; `draft-T40-N812.md` B4–B11; `ai-runs/index.mjs`:2588–2932 and its constructor's table declaration (:114–160) and schema (`ai_usage`, `ai_ceilings`); `words.json`'s `ai.*` entries. Read as each used module's Purpose and the services my Uses names: record-grammar (`isMachineIdentity`, `normalizeType`); civil-time (`localDay`); record-core (`declareTable` R21/R80, `purge` R46, `transact`, `bundleInfo`); membership (`isAdministrator` R64, `notAnAdmin` R84, `isProjectOwner`, `projectOwners`, `activeAdmins` R86, `notTheOwner`); credentials (R33–R37, R43, R54–R61: `USE_KINDS`, `accountUses`, `aiKeptAway`, `projectsKeptAway`, `accountUsesSet`); connections (R22 `citesInto`); run-rules (R3, R11, R20 and `AI_RUNS_CHECKS`); retrieval (`zone`, R69). The module had no code or tests before this job.

**Entries applied (T41-22).** The module is new, built by copy (K624) of `ai-runs/index.mjs`:2588–2932. From that block I copied the use-figure checks, the calls rule, the counter's upsert and the reads, and re-keyed them by owner and use (B8). The member ceilings are replaced by account limits. R1–R13 are all met:
- R1 `countUsage` (in the caller's transaction; optional `act`, K2480) and `countAskUsage` (optional `owner`, else "not recorded"; K2480). Cost is `estimated_cost_usd`, else `total_cost_usd`, else unstated. A pre-T40 `ai_usage` is rebuilt in the new shape at the first `migrate`, its rows kept as "not recorded".
- R2 `aiLimitSet`. The project and group refusals come from credentials or membership. `usd` is refused on a sign-in, read through `accountUses` as `by`. Every change is appended to `ai_limit_history`. The pre-T40 ceilings migrate once: a member's to `overall` day limits, the copy's to the group's `per_member` (B4).
- R3 `useCheck`. Inclusive and exclusive follow B5; a use is exclusive when any of its limits is held exclusive (K2486). `per_member` counts every one of the member's uses on that account. An unreadable counter fails closed.
- R4 `aiUsage` and `aiUsageMine`; a cost only to the paying account's owners. R5 `limitsReached`, from `ai_limit_reached`, written when a count or a set first finds a limit reached in its period.
- R6 `exploreAllowed` answers `{ok, ask, label}` (K2480), with `EXPLORE_OUT_OF_SCOPE` C-143.5.
- R9 `exploreAsk`, `exploreAsksPending` (`ai.queue.exploreask` with `{what}` filled; R10's estimate) and `exploreApprove`. A malformed ask is refused `EXPLORE_ASK_INVALID` C-143.6 (K2486).
- R10 `estimate` (5 acts over the latest 20; K2480) and R11 `actualOf`, both over `ai_use_acts`.
- R12 `aiLimits`: its refusals are credentials R60's own, relayed.
- R7: seven tables, each declared `admin-only`, sight `group`, purge `clear`; a project's limits, history, reached rows and asks are keyed by `project_id`.
- R8: family C-143.1–.6 (K2480).
- R13: words read by key, `{whose}` filled.
- The owner's `explore` value is read through `accountUses` as the account's own owner, failing closed, until N831 (K2480).
- `aiUseOps`: `ailimitset`, `ailimits`, `aiusage` (with or without `owner`) and `exploreapprove` (op-declarations R41), each identity taken from the query stamp.

**Tests.** 48 tests in four files. Every id R1–R13 is named, each tested for full compliance with a negative control (K874), including the Suggestions' arms: inclusive and exclusive; `null` calls counted as one; `explore` at `no`, and at `yes` judged on `overall` alone with an under-limit control; a pre-T40 row counting toward no limit; a second ask minting nothing.

**Ran.**
- `node --test bio-plane/test/m/ai-use/`: tests 48, pass 48, fail 0.
- No layer tests are named in the manifest. No service of an existing module changed, and no module's code imports ai-use yet, so there are no users' suites to run.
- Checks, run with `modules.json` holding my paths, tests and `retrieval` as a local, uncommitted edit (BOB's to apply): `format` 0 failures; `architecture` ai-use 0 failures (8 files, 26 imports); `coverage` 13 of 13; `ownership` 9 files, 0 failures (after the commit).

**Deferred.** None.

**Found in other modules (REPORT J3).**
- `ai-runs` (T41-23):
  - Delete its R48–R51 copy (`#usageRefusal` … `aiUsageMine`, `AI_CEILING_DEFAULT`, `USAGE_*`).
  - Remove `ai_usage` and `ai_ceilings` from its `declareTable` and its schema. record-core refuses a table declared by two modules (R80). ai-use's `migrate` rebuilds `ai_usage` keyed by owner, so ai-runs' old `ON CONFLICT(member, day, mode)` write would fail once both are made on one store. ai-use carries the ceilings once and leaves `ai_ceilings` in place; ai-runs drops it.
  - Re-point: count through `countUsage({owner: <accountFor's level as owner>, …, act: <run id>})`; judge through `useCheck`; route its `aiusage`, `aiceilingset` and `aicopyceilingset` ops to `aiUseOps`.
- `answers`: call `countAskUsage` with `owner` and `act`, and `useCheck` in place of `aiUseCheck`.
- `membership` R83: `MODULE_ORDER` gains ai-use (B10's accepted red).
- `answer-envelope`'s `families.mjs` gains C-143 (`AI_USE_CHECKS`) in its place.
- `plane` and `control-plane` route `aiUseOps`.
- `notice-producers` R16 reads `limitsReached` and `exploreAsksPending`.
- `credentials`: N831, the in-plane read of an account's uses.
- The design stream: `ai.refused.explorenotenabled` (J2 (6); BOB's NOTICE, K2486).
- No generated artifact is staled: nothing bundled imports ai-use yet.

Size (session_01DYz6SJ2uB7j5P98MvAwUne): test runs 10, module lines 1093

## Completion (AI-USE #2, B5 CHANGE; K2514)

Merged `tranche/T41` (ai-runs merged @ 9741f67aad). Read whole: `build/requirements/ai-use.md`; my code (`index.mjs`, `checks.mjs`) and the tests the change touches (`fixture.mjs`, `limits.test.mjs`, `reads.test.mjs`); `words.json`'s `ai.*` entries; ai-runs' call sites (`open` :1145–1165, `tick` :1462–1490, `#useCheck` and `#shed` :2874–2895) and its `usage.test.mjs` limit tests.

**Applied (B5).** `useCheck`'s `AI_LIMIT_REACHED` now answers its sentence whole. ai-runs' open and tick relay the refusal unchanged (`#shed` drops only `ok`), so every caller now gets a filled sentence. The fills:
- `{whose}` from `ai.whose.*`, as before.
- `{use}` from `words.json`'s `ai.use.<use>.name`, lower-cased in the sentence. The five keys are added to `AI_USE_WORDS`, verbatim.
- `{period}` is `daily` or `monthly`, as the words file's own note on `ai.refused.limit` says.
- `{when}` is `tomorrow` for a day's limit, or `on <next month> 1` for a month's (December's is January).
- R3's fail-closed answer, which names no limit, drops `{period}`, and `{when}` reads "once its use can be checked".

`words.json` gives no key for `{period}`, `{when}` or `{field}`, so their fills are this module's own (`LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL`, `MONTH_NAMES`, `LIMIT_FIELD_FILL` in `checks.mjs`). The rows' own `translation` stays the words file's sentence, verbatim (R8).

**A flaw of my own, fixed:** `AI_LIMIT_INVALID` reached its caller with `{field}` unfilled ("That limit can't be set: {field}."). It is now filled for every field it names (owner, scope, unit, period, amount, inclusive, and the estimate's use and count). The Ask item (`ai.queue.exploreask`) still leaves `{scope}` and `{account}`: it is a queue item that `notice-producers` renders, not a refusal relayed to a member.

**Tests.** The three assertions that expected only `{whose}` filled now expect the whole sentence. One new R13 test checks all of the following:
- every owner (group, project, own), every scope (the five uses, `overall`, `per_member`) and both periods, for every use each limit judges: 160 refusals, each compared to the exact expected sentence, none with a placeholder left;
- October to November and December to January;
- both fail-closed paths;
- `AI_LIMIT_INVALID` for all eight fields, each with its own words;
- negative control: the words file's raw sentences are seen to carry placeholders.

**Through ai-runs' path.** My tests may not import ai-runs (later in the order: the architecture check), so I drove it from a scratch script over ai-runs' own `world.mjs`. Its open and tick refused with "The assistant stopped here: your own daily limit is reached. It works again tomorrow. Everything else works as usual.", and with a month's limit "… your own monthly limit is reached. It works again on August 1. …"; no placeholder was left. ai-runs' `usage.test.mjs` `limitReached` checks only that the translation is a string. A test asserting no placeholder there is ai-runs' to add (REPORT J6).

**Ran.**
- `node --test bio-plane/test/m/ai-use/`: tests 49, pass 49, fail 0.
- Users of ai-use:
  - ai-runs: 80 pass, 0 fail.
  - answers: 58 pass, 0 fail.
  - notice-producers: 74 pass, 0 fail.
  - run-rules and reading-pipeline `transcribe` (they name these codes): 47 pass, 0 fail.
  - op-declarations: 109 pass, 8 fail, the same 8 with my change stashed. They are layer-11 op and registry tests that predate this change and are not mine.
- Checks: `format` 0 failures; `architecture` ai-use 0 (8 files, 26 imports); `coverage` 13 of 13; `ownership` 0 (after the commit).

**Deferred.** None. **Generated artifacts:** none staled (nothing bundled imports ai-use).

**Found in other modules (REPORT J6).**
- `ai-runs`: its `limitReached` test helper could assert that no `{…}` placeholder is left in a relayed refusal.
- The design stream: `words.json` has no keys for `{period}` (daily/monthly), `{when}` (tomorrow / on <month> 1) or `{field}`. ai-use fills them with its own words until keys exist.

Size (session_011xdFFLsupbqxVmjj8ymA9A): test runs 9, module lines 1134

## J1 · QUESTION

Seven points; I am building on each best reading now, and only (3) and (5) could change what I build next.

1. **The group's zone.** R1–R5 count per local day/month of the group's calendar, but no module in my Uses answers the group's zone; ai-runs reads it from `retrieval` (its R69, `retrievalOf(ctx).zone()`). Best reading: add `retrieval` (L5, earlier in the order) to ai-use's `uses`, read exactly as ai-runs does, UTC when unreadable. Alternative: the zone injected by the caller.
2. **R8's family.** ai-use has no family of its own. Best reading: a new family **C-142**: `AI_LIMIT_REACHED` C-142.1, `AI_LIMIT_INVALID` .2, `LIMIT_UNIT_UNAVAILABLE` .3, `EXPLORE_NOT_ENABLED` .4 (the retired C-109.8, .9, .12 never reused). Alternative: continue C-109 at .13–.16. Please also confirm no other T41 job takes C-142.
3. **The owner's `explore` value (R3, R6, R9).** credentials offers it only through `accountUses({owner, viewer})`, gated to the account's owners; there is no in-plane read that takes no viewer (K2442: an internal read takes no viewer). Best reading: credentials gains an in-plane `accountUsesOf({owner})` (no route, no viewer; answers `uses` or fails closed) by a CHANGE to its job; until it does, ai-use reads through one helper that asks `accountUses` as the account's own owner (the member; the project's first owner, `membership.projectOwners`; the first `activeAdmins`), failing closed, replaced when the read exists. Same need for R2's `usd` test (is the account a sign-in?): there `by` is the owner, so `accountUses({owner, viewer: by})` is legitimate.
4. **R10, R11: measuring per act.** The day counter cannot give a per-run range or a run's actual cost. Best reading: a third table `ai_use_acts` (owner, use, mode, act, figures; no content), declared as R7's tables are; `countUsage` takes an optional `act` (a run id or the act's own id) and adds to it; R10's "enough measured" is **5** acts, the range the least and greatest per-act figure over that owner's latest 20 measured acts of that use and mode (times `count`); unit `usd` when every act in the sample stated a cost, else `tokens` and `calls`. R11 `actualOf({run|act, viewer})` answers that act's sums to the paying account's owners. Callers (ai-runs, answers) pass `act` once re-pointed.
5. **R6: a question outside the owner's scope.** R6 lists it as a refusal but names no code, and R8's four codes do not fit it. Best reading: a fifth code `EXPLORE_OUT_OF_SCOPE` (C-142.5), `{whose}`-free, its translation this module's own until the design stream gives a key (R13 lists no key for it). Scope: the group, any question the record holds; a project, a question whose `connections.citesInto(question).confirmed` holds the project; a member, none yet (D36 open, B6). Every project it is drawn on keeping it away answers `credentials.aiKeptAway({project, use: "explore"})`'s refusal as given.
6. **R1 `countAskUsage`'s owner.** It takes no `owner` but must count to "its owner as accountFor answered it"; `accountFor` is async and unseals a key, so it cannot run inside the caller's transaction. Best reading: `countAskUsage` takes an optional `owner`, the one the caller's `accountFor` already answered; when absent, the use is counted with owner "not recorded" (toward no limit), as pre-T40 rows are.
7. **R1's cost figure.** `estimated_cost_usd` is agent-model R13's, not yet met. Best reading: an entry's cost is its `estimated_cost_usd` when stated, else its `total_cost_usd`, else unstated (never 0); an entry without `estimated_cost_usd` is read as it being `null`, not malformed, so today's callers count.

## J2 · QUESTION

Adds to J1 (which stands whole). These are readings I took while building; none blocks me.

1. **R9's malformed ask or approval.** `exploreAsk` with no statement of what is worth exploring, or `exploreApprove` with no `YYYY-MM-DD` day, needs a refusal, and R8 names none. Best reading: a sixth code, `EXPLORE_ASK_INVALID` (C-142.6), with this module's own sentence (no `words.json` key exists). Alternative: refuse it as `AI_LIMIT_INVALID` naming the field, but `ai.refused.limitinvalid`'s words are about limits.
2. **B5, exclusive.** I read a use as exclusive when any limit held on it has `inclusive: false`. Its use then counts toward no overall limit, in any unit or period.
3. **R3, per_member.** I count a member's per-member use over every use of theirs on that account, exclusive uses included.
4. **R6's answer.** R6 says "`null`, and with `null` also `label`". Built as `{ok: true, ask: false, label: {kind: "machine", enabled_by: owner}}`, with `{ok: true, ask: true}` and the refusals beside it.
5. **R10, R11's viewer.** "Only to the account's owners" needs a viewer, so both take `viewer`. R9's Ask item reads R10 internally, from its owner's own read.
6. **For the design stream, through BOB (not mine to change).** `ai.refused.explorenotenabled` reads "Exploring is off on {whose} account, **or has no limit of its own yet**: it runs only within an exploring limit its owners set." R3, as BOB corrected it to Bob's A5 (K2400), never refuses `yes` with no explore limit: the overall limit judges it. So the sentence states a condition the code never refuses on. I read the key as R13 asks and change nothing.

## J3 · REPORT

Found in other modules, at ai-use's completion (also in my record's Completion):
1. **ai-runs (T41-23)**:
   - Delete the R48–R51 copy (`#usageRefusal` through `aiUsageMine`, `AI_CEILING_DEFAULT`, `USAGE_*`).
   - Remove `ai_usage` and `ai_ceilings` from its `declareTable` and its schema. record-core refuses a table declared by two modules (R80). ai-use's first `migrate` rebuilds `ai_usage` keyed by owner, so ai-runs' old `ON CONFLICT(member, day, mode)` write fails once both are made on one store. ai-use carries `ai_ceilings` once and leaves the table; ai-runs drops it.
   - Re-point: count by `countUsage({owner, member, use, mode, usage, calls, at, act: <run id>})`, the owner spelled from `accountFor`'s level (`group`, `project:<id>`, `member:<id>`); judge by `useCheck`; send `aiusage`, `aiceilingset` and `aicopyceilingset` to `aiUseOps` (`ailimitset`, `ailimits`, `aiusage`, `exploreapprove`).
2. **answers**: `countAskUsage({…, owner, act})` and `useCheck` in place of ai-runs' `countAskUsage` and `aiUseCheck`.
3. **membership R83**: `MODULE_ORDER` gains ai-use (B10's accepted red).
4. **answer-envelope `families.mjs`**: C-143 (`AI_USE_CHECKS`) joins in its place in the order.
5. **plane and control-plane**: route `aiUseOps`. `aiUseOf(ctx)` reads the zone from retrieval by default.
6. **notice-producers R16**: reads `limitsReached` and `exploreAsksPending` (each with a stable `key`).
7. **credentials**: N831, an in-plane read of an account's uses, replaces ai-use's `#exploreOf` helper.
8. **The design stream**: `ai.refused.explorenotenabled` (J2 (6); your NOTICE, K2486).

## J4 · COMPLETE

AI-USE #1 complete on job/T41/ai-use: R1–R13 met. Tests 48/48. format 0, architecture 0, coverage 13/13, ownership 0, with my paths, tests and `retrieval` in `modules.json` as a local edit; those three are yours to apply (record: Completion). Report J3.

## J5 · REPORT

Found at AI-USE #2's completion of B5 (also in my record): (1) ai-runs: its usage.test.mjs limitReached helper checks only that the relayed translation is a string; it could assert no {…} placeholder is left (I verified the open and tick by a scratch script over ai-runs' world.mjs: filled, daily and monthly). (2) The design stream: words.json has no keys for {period} (daily/monthly), {when} (tomorrow / on <month> 1) or {field}; ai-use fills them with its own words (checks.mjs LIMIT_*_FILL) until keys exist.

## J6 · COMPLETE

AI-USE #2: B5 applied on job/T41/ai-use @ 791163d8c7. useCheck's AI_LIMIT_REACHED answers its sentence whole ({whose}, {use}, {period}, {when} filled; fail-closed too), so ai-runs' open and tick relay a filled sentence (verified through ai-runs' path); AI_LIMIT_INVALID's {field} filled as well. Tests: ai-use 49/49; ai-runs 80/80, answers 58/58, notice-producers 74/74, run-rules+transcribe 47/47; op-declarations 8 fail, identical without my change (L11's, not mine). format 0, architecture 0, coverage 13/13, ownership 0. Report J6.
