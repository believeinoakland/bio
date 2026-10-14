# answers (T48)

**Status** · session_01949saWF2vA4uRTaJnEYzqR · depth 2 · WORKING · handled B1

## Completion (ANSWERS #11)

**How the reading set was read (mechanics §17 (3), K2032).** I read whole: `build/requirements/answers.md` (public and private), all ten files of `bio-plane/src/answers/`, my entry T48-36 in `build/plan/current.md`, and `build/extraction/credentials-split.md` §5. For the services my Uses name I read Purpose and Provides directly: `ai-accounts` R3, R7, R11, R14, R22, R25, R34 (and R33); `credentials` R27, R28, R32, R72. A helper in this session read all eleven files under `bio-plane/test/m/answers/` in full and wrote me a digest citing file:line. I then read each test section I changed. Layer contract: L6 adds no layer tests (`build/manifest.md`).

**Entries applied.** T48-36 (N996 §5):
- `accountFor`, `aiKeptAway`, `projectsKeptAway` and `NOT_YOUR_ACCOUNT`'s row are now read from `ai-accounts`. The three services come through `dep("accounts")`, which defaults to `aiAccountsOf(host)`, the one instance credentials' factory creates with the seal secret, reached lazily. The row comes from `AI_ACCOUNT_CHECKS`.
- `credentials` is kept only for `aiGrantMintStanding` (dep), and for `AI_GRANT_TTL_SECONDS` and `AI_GRANT_OPS` (imports).
- Code: `index.mjs` (`hidden`, `askAccount`, `answersOf`, header) and `standing.mjs` (`keptAway`, `heldBack`). No requirement's meaning changed.

**Flaws fixed in this module.**
1. *Unreadable keep-away (R19 with ai-accounts R34).* Before, a keep-away that could not be read (dep unreachable, read throws, or an answer that is neither null nor a refusal with its code) gave `kept_away` with `code: null, translation: null`. Now it carries `KEPT_AWAY_UNREADABLE`'s row as given, so R19's "carrying that refusal's code and translation" also holds when failing closed. No code is minted here (K231).
2. *Kept-away projects, fail closed (R30's widening of R2).* Before, `hidden()` with no reachable kept-away source answered `[]`: nothing dropped, fail open. Now it drops every project's rows, as it already did when the read failed.

**Tests.**
- `fixture.mjs` hands `accounts`. A fixture guard checks it is credentials' own instance.
- Every watch or stub that stood for the four reads now sits on `accounts`. The watches record `accounts.<op>` or `credentials.<op>`, so the R19, R30 and R34 tests assert which dep each read went to:
  - keep-away and the account come from ai-accounts;
  - the grant alone comes from credentials;
  - a credentials stub holding keep-away on is never read for it.
- R30: added an arm where ai-accounts is unreachable (drops every project's rows), and one where credentials is unreachable (the limits are unchanged).
- R19: the fail-closed set expects `KEPT_AWAY_UNREADABLE`'s row, with two more shapes added.
- R21 watches `accounts` too.
- Calls to moved services in the tests now go to `w.accounts`, not the credentials R72 delegates (which are deleted in T49).

**Found in another module (REPORT J1).** `affordances` `test/m/affordances/t33.test.mjs`:151 R12 is red, on `tranche/T48` as well as here. Explore's op map now also serves `exploregraph`, which that test's T33/T35–T47 list does not grant. It is not caused by this job.

**Deferred.** None.

**Runs and checks.**
- `node --test test/m/answers/`: 64 pass, 0 fail.
- Users of answers through the plane (14 files that build answers or call its ops): 162 pass, 1 fail (the affordances red above).
- `checks/format`: 0 failures. `checks/architecture answers`: 0 failures. `checks/coverage answers`: 35 of 35 ids, 0 failures. `checks/ownership answers tranche/T48`: 8 files, 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (none for my files), channels 0. Coverage has 37 failures, none in answers.

Size (session_01949saWF2vA4uRTaJnEYzqR): test runs 7, module lines 1910

## J1 · REPORT

affordances: test/m/affordances/t33.test.mjs:151 (R12, the op-map list) is red on tranche/T48 itself and here: explore's op map now also serves 'exploregraph', which the test's list of ops T33 and T35–T47 grant does not hold. Not caused by T48-36; for affordances' job or the plan's accepted reds.
