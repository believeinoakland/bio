# notice-producers (T48)

**Status** · session_01Bx6tDwFo78WDNsFNerbpzz · depth 2 · COMPLETE · handled B1

## Record

**Read, whole:** `build/requirements/notice-producers.md`; `bio-plane/src/notice-producers/index.mjs`, `words.mjs`; plan entry T48-59; `duties` R33 and `ai-accounts` R13 (the services touched, with `ai-accounts.projectAccountsSuspended` and `duties/vocab.mjs`' `OCCURRENCE_REASONS`); tests `duties.test.mjs`, `accounts.test.mjs`, `fixture.mjs`, `read.test.mjs`, `security.test.mjs` (the ones naming R5, R16, R20, R22 or reading `credentials`' suspended sign-ins).

**Entries applied (T48-59):**
- N996 §5: R16's project-account-suspended items are read from `ai-accounts.projectAccountsSuspended` (its R13) through a new `aiAccounts` dependency (`aiAccountsOf(host)`; the edge was already in `modules.json`); a non-array answer is `ai-accounts`' failure in `facts.failed`; `credentials` stays for `securityLevel` and `securityMap` (R12). The stand-in `credentials` in the tests no longer carries `projectAccountsSuspended`.
- N1044 / R22: `{reason}` of R5's items is `duties.occurrencesOf`' `reason.says` (trailing full stop left to the sentence), never `why`, which stays in `basis.why` as the record's derivation; `reason: null` fills nothing and drops the dangling clause `, because .` from the filled sentence (a clause that `words.json` carries, so no sentence is written here); the item answers `reason_code` (`reason.code`, else null) beside `summary_key` and `detail_key`.

**Deferred:** none.

**Found in another module:** `duties` R33 says an undetermined occurrence always answers a reason code, and `duties` answers `trigger_undated` only for an occurrence with no candidate dates, which R5 cannot raise as an item (it needs candidate dates); the R22 test for `trigger_undated` therefore uses a stand-in in R33's shape. Not a defect; noted for BOB.

**Tests (R22 and the entries):** `duties.test.mjs`: four new R22 tests (trigger_undated words, no ISO date, zone id or ruling number, its `why` text nowhere in `summary` or `detail`; every code as `reason_code`; `reason: null` and no clause, control with a reason; over the real `duties` a possibly overdue occurrence answers `due_between_days`) and R20's test amended to read `reason.says`; `accounts.test.mjs`: R16's suspended item over the real `ai-accounts`, control that `credentials`' own answer is not read, failure and throw named `ai-accounts`.

**Checks:** `node --test bio-plane/test/m/notice-producers/`: 118 pass, 0 fail. `queue` (a user of `noticeItems`): 146 pass, 0 fail. `checks/run.mjs`: format 0 failures; architecture 0 failures; coverage: no failure for notice-producers (22 other modules' ids owed by their own jobs); channels 0; `ownership.mjs notice-producers tranche/T48`: 7 files, 0 failures.

Size (session_01Bx6tDwFo78WDNsFNerbpzz): test runs 4, module lines 1519

## J1 · COMPLETE

T48-59 applied: R22 ({reason} from duties' reason.says, reason_code; null draws no clause) and R16's suspended items read from ai-accounts. notice-producers tests 118 pass; queue 146 pass; format, architecture, coverage (no failure for this module) and ownership 0 failures. Record: build/jobs/T48/notice-producers.md.
