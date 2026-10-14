# question-explorer (T48)

**Status** · session_01Vne8TPUKPXS1TYhSQirKWK · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied: T48-35** (N996 §5). question-explorer now reads both values from `ai-accounts` and no longer uses `credentials`:
- the explore switch comes from `accountUsesOf` (its R17), in `#switchedOff`, for R3;
- the material limit comes from `aiKeptAway` (its R22), in `#readable`, for R13.
- The factory takes `aiAccounts` (default `aiAccountsOf(host, {record, membership})`), and the `credentials` import is gone. `uses` can drop `credentials` at the merge, because no import of it is left in the module's paths.

**Flaws fixed in my module (P8):**
1. `#switchedOff` used to ask `credentials.accountUses({owner, viewer: owner})`, which asks as an owner the system is not. `ai-accounts` R17 forbids that ("never `accountUses` as an owner it is not"). It now uses the in-plane `accountUsesOf`. An account that cannot be read is now refused here (fail closed: no switch reads as on). Before, it was passed on to ai-use.
2. `#switchedOff` used to build an `EXPLORE_NOT_ENABLED` object with no row, a copy of ai-use's code (K231). It now answers a boolean; the tick only counted it.
3. When `aiKeptAway` threw, `#readable` built its own `{code: "AI_KEPT_AWAY"}`. It now answers `ai-accounts` R34's `KEPT_AWAY_UNREADABLE`, as given.

Citations in the comments now point to `ai-accounts`.

**Tests:**
- The fixture builds `ai-accounts` over the same storage and passes it to question-explorer. Account set-up (`groupKeySet`, `projectKeySet`, `accountUsesSet`, `subscriptionTokenHold`, `projectSigninSet`, `aiKeepAwaySet`, `projectAiKeepAwaySet`) now goes through `ai-accounts`.
- The other real modules the fixture builds (ai-use, run-productions, capture-requests) still take `credentials` as their own deps, so the fixture keeps building it for them.
- New test, R3: the switch is read through `accountUsesOf` with no viewer and never through `accountUses`; an unreadable account is refused before ai-use is asked; control: a readable account is passed on to ai-use.
- New test, R13: `aiKeptAway` is asked with `{project, use: "explore"}`; a call that throws is answered `EXPLORE_READ_KEPT_AWAY` carrying `KEPT_AWAY_UNREADABLE`'s code, for both read and propose, with no pages counted; control: nothing keeps the document.

**Reading:**
- Read whole: my requirements, my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test file under my tests path (P20). Also `ai-accounts`' public part, read whole, and the T48-35 entry.
- The other used modules' public parts (record-grammar, civil-time, record-core, membership, content, entities, connections, retrieval, leg-earning, inquiry, steps, basis-versions, run-rules, ai-use, ai-runs, run-productions, capture-requests, and credentials) were read in full by a helper in my session. It wrote me a digest citing each requirement this module relies on (K2032, mechanics §17 (3)). Nothing in them conflicts with this entry.

**Found elsewhere (REPORT):**
- (a) My requirements' Uses line cites `accountUses` (`ai-accounts` R14, R15). The read an in-plane caller makes is `accountUsesOf`, R17, which is what the code calls and what ai-use R3 cites. It is BOB's text to re-point; the meaning is unchanged.
- (b) `build/modules.json`: `credentials` is still in question-explorer's `uses`; BOB drops it at the merge.
- (c) ai-use and run-productions take no `aiAccounts` dep. They reach `ai-accounts` through their own `credentials` instance's delegates (`credentials` R72) until their own re-pointing.

**Deferred:** none.

**Tests and checks run:**
- `node --test test/m/question-explorer/`: `tests 34, pass 34, fail 0` (32 before this job).
- No layer tests are named in the manifest.
- `format`: 168 modules, 167 requirements files; 0 failures.
- `architecture question-explorer`: 9 product files, 47 relative imports; 0 failures.
- `coverage question-explorer`: 16 of 16 live ids named by a test; 0 failures.
- `ownership question-explorer tranche/T48`: 6 files changed; 0 failures.
- `run.mjs`: format 0, architecture 0 (3286 files), channels 0. Coverage shows 37 failures, all in other modules (inherited); none is question-explorer's.

Size (session_01Vne8TPUKPXS1TYhSQirKWK): test runs 6, module lines 1074
