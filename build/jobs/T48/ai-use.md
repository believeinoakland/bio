# ai-use (T48)

**Status** · session_01DzrGZm2nuzLBz5wLwMQe5d · depth 2 · WORKING · handled B0

## Completion

**Read whole** (P20, mechanics §6 step 2): `build/requirements/ai-use.md`; `ai-accounts`' public part (Purpose, Provides R1–R34), its exports and factory; `draft-T48-L6-carry.md`; DEC-215; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and tests (`fixture.mjs` and all seven test files), and ai-accounts' test fixture for its credentials-free world. No flaw found in the module beyond the one fixed below.

**Entries applied (T48-29)**
- (N996 §5) `USE_KINDS`, `accountUses`, `accountUsesOf`, `aiKeptAway` and `projectsKeptAway` are read from `ai-accounts` (`aiAccountsOf`, dep `accounts`); no file of the module or its tests imports `credentials` any more, so BOB can drop it from `uses`. Comments and test titles re-pointed (R10, R11, R14, R15, R17, R19 of ai-accounts). The test world no longer builds credentials: the founder's claim is a test fact (membership R94) and enrolment's password setter a test setter, as ai-accounts' own fixture does.
- (N1026; DEC-215 (1); K3198) R14 `accountUseOverTime({owner, viewer, at})`, op `aiuseovertime`: thirty local days of `{day, calls, dollars}`, oldest first, zeros where none; `periods` per limit with `used` up to the day of `at` and `limit` in its unit, or one no-limit month entry; summed, naming no member; R12's owners and refusals; `unreadable: true` when the counter cannot be read. Built on J1's three readings (per-member `used` the most one member used, as R12; the no-limit entry in `usd`; up to and including the local day of `at`).
- Fixed in my module (P8): R6 now answers ai-accounts' `KEPT_AWAY_UNREADABLE` as given when `aiKeptAway` or `projectsKeptAway` throws (ai-accounts R34), where it answered `EXPLORE_NOT_ENABLED`, which misstated the cause. Tested.

**Deferred:** none.

**Other modules (REPORT J2):**
- `plane`: `test/m/plane/t41.test.mjs`:124 (R31) pins ai-use's ops to four; R14's `aiuseovertime` makes five, so it is red on this branch (green on `tranche/T48`). The test's list needs `aiuseovertime`; the op's spec is T48-63's (op-declarations).
- `notice-producers`' tests build on ai-use's test world and read the accounts as `w.c`; the world keeps `c` as the ai-accounts instance, so they stay green (114 pass). Their `credentials: w.c` now hands notice-producers the ai-accounts instance, which serves `projectAccountsSuspended` itself.
- No generated artifact staled beyond the plane bundle (rule 5 (5)).

**Tests and checks**
- `node --test bio-plane/test/m/ai-use/`: tests 78, pass 78, fail 0 (68 before; 10 new in `t48.test.mjs`).
- Users' tests: ai-runs 102/0, question-explorer 32/0, answers 64/0, notice-producers 114/0, store-door 47/0, `test/system/migrate-released.test.mjs` 1/0; op-declarations 10 fail, answer-envelope 2, control-plane 2, each the same set on `tranche/T48` (inherited); plane 1 fail, R31 above (mine, reported).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio ai-use`: 12 product files, 38 relative imports; 0 failures. `checks/coverage.mjs bio ai-use`: 14 of 14 live ids named; 0 failures. `checks/ownership.mjs bio ai-use tranche/T48`: 0 failures. `checks/run.mjs bio`: format 0, architecture 0 (3287 files), channels 0; coverage 36 failures, all other modules' T48 ids not yet met (rule 5 (1)), none ai-use's.

Size (session_01DzrGZm2nuzLBz5wLwMQe5d): test runs 7, module lines 1260

## J1 · QUESTION

R14 (`accountUseOverTime`), three points the text leaves open. I am building on these readings; answer only if one is wrong.

1. **`per_member` limit's `used`.** "Every figure is summed over every member" would make a per-member limit's `used` the account's total, which is not what is counted against that limit (R3 counts one member's use). My reading: for `per_member`, `used` is the most any one member used in the period, naming none, exactly as R12's `aiLimits` answers it; every other figure (days, the use and overall limits, the no-limit month) is summed over all members.
2. **The no-limit entry's unit.** With no limit set, the one month entry needs a `unit`. My reading: `{scope: "overall", unit: "usd", period: "month", period_start, used, limit: null}`, `used` the month's summed estimated dollars, since DEC-215 (1) draws the bars and meter in dollars ("calls follow the dollars"); the overall limit's `used` excludes exclusive uses as R3 does (none exist when no limit is set, so it is the month's whole total).
3. **"up to `at`".** The counter is kept per local day, so `used` counts the period's days up to and including the local day of `at` (a row on a later day, which only a clock skew could write, is not counted). `limit` is in the limit's unit (`usd` in dollars, as R12 answers `amount`).
