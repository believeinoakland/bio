# ai-runs (T46)

**Status** · session_012KrF4pcZDor4ebZmdfWuBk · depth 2 · WORKING · handled B3

## Completion (AI-RUNS #18)

**Entries applied (T46-14).**
- **R78.** `testInstance()` is true exactly when `env.CIVICSMITH_TEST_INSTANCE` is a string equal to `env.INSTANCE_NAME`, both non-empty. It is false otherwise, and when either cannot be read (it never throws). Only `env` is read. `partAdmitted(part)` answers `run-rules.partAdmittedOn(set, part, {verifications, testBars}, {testInstance})` as `{admitted, untested}`. `set` is `deps.testSet` in a module test and `CIVICSMITH_TEST_SET` otherwise. `partAdmitted` replaces `#partDeployable` as the module's one gate in three places: R40 at open (C-109.1 unchanged), R23's `investigateDeployable` handed to `originAllowed`, and `verificationRecord`'s `next.deployable`.
  - A run admitted on the exception records the label at the open, in a new nullable column `ai_runs.untested` (JSON, added by `migrate`; R32).
  - The label is answered as `untested` on R10's open answer (before `projectGate`), on R19's `session` (after `rerun_of`) and on R28's `runFor`. It is `null` for a run the bar admitted and for runs opened before T46.
  - It is read back as recorded and never re-derived: an instance that stops being a test instance keeps the label on its runs.
- **R18 as amended (K2892; wire per K2947, B2).** `dispatchMemberRun({run, by, viewer, credential, at})`. The door (control-plane T46-59) hands in, in process, the member's own `ai` credential it was presented with.
  - Refusals, in order, nothing sent on any:
    - absent or invisible run: `{found: false}`;
    - `by` not the member the run's principal names, or a run whose principal is no member: `AI_RUN_NOT_PRINCIPAL` (run-rules R5, relayed);
    - run not running: `{dispatched: false, status}`;
    - mode other than `check` or `plan`: `MEMBER_RUN_MODE_NOT_ADMITTED`, minted at the new region `is-airun-member-dispatch`, its row read by key (run-rules R32, C-22.30, per B3; null until run-rules merges);
    - `AGENT_WORKER_UNBOUND`, `NAMESPACE_UNDETERMINED`, `CREDENTIAL_RECORD_SILENT`;
    - no credential presented, or a run opened without one: withheld `MEMBER_PRINCIPAL_RUN`;
    - a credential not on record, revoked, or whose `<principal>/<tokenId>` is not the run's `principal_plane`: `AI_RUN_NOT_PRINCIPAL`;
    - an account other than her own sign-in (her API-key reference, the group key, a project's): withheld `MEMBER_PRINCIPAL_RUN`.
  - Then the wake's own call, `#aiRunDispatch`: the 30 s wait, `RUNNING` past it, one log entry for a refused or incomplete call. The body is agent-worker R6's `{kind: "signin", level: "member", member, suggestions}` with her credential as `credential`. The value is used for that one call and enters no record and no answer.
  - The wake still withholds every member's run (`MEMBER_PRINCIPAL_RUN`).
  - `#aiRunDispatch` gained `signinOnly`.

**Own code and tests read whole (P20).** I read `index.mjs` and `schema.mjs` whole. Improvement made: the credential look-up the resumer made inline is now one helper, `#credentialLook`, shared with the member dispatch. One effect: a look-up that throws in the `bio` object is now withheld as `CREDENTIAL_RECORD_SILENT` instead of failing the wake. No other flaw found; nothing deferred.

**How the reading set was read (mechanics §17).** Read whole by this session:
- `build/requirements/ai-runs.md`;
- `src/ai-runs/index.mjs` and `schema.mjs`;
- `world.mjs`, `scheduler.test.mjs`, the R73 test of `t41.test.mjs` and `plan.test.mjs`'s setup;
- my plan entry and the opening's rules;
- trial §1.1–§1.3 and study §1;
- agent-worker R1–R6, R10, R80, and run-rules R14, R16, R19, R21, R29–R31.

The remaining tests and the used modules' public parts (run-rules, credentials, membership, ai-use, steps, observation-log, record-core), with the later users of the new services, were read in full by a helper in this session. It wrote a digest citing each file:line and requirement id (K2032); the sources stay binding.

**Found in other modules (for BOB).**
- **control-plane (T46-59).** ai-runs declares no `airundispatch` entry in `aiRunsOps`. Every op there reads its arguments from the query and body, and K2947 keeps the credential out of both. The door calls `aiRunsOf(ctx, env).dispatchMemberRun({run, by, viewer, credential})` in process, inside the store's object. If the door must instead reach the object over its internal fetch, how the credential crosses (for example a header the door alone sets) is control-plane's to define, and I would add the op entry in a CHANGE.
- **question-explorer (T46-17).** Its code still calls `partDeployableOn` directly (helper's digest). Its R16 is to read `ai-runs.partAdmitted("investigate" | "explore")` and carry `.untested`.
- **ai-runs R18's text (BOB's wording).** It lists the withheld codes but not `NO_INSTANCE_AI_CREDENTIAL` (`instanceAiCredential`'s reason, held by `scheduler.test.mjs` since earlier tranches) or the dispatch's `NO_ACCOUNT`. The code is unchanged here; the list is incomplete.
- **Generated artifacts.** The plane bundle, `release/` and `newgroup`'s bundle hold ai-runs' source and are stale by this change (accepted red rule 5 (4)). None was touched.
- **Inherited reds.** `test/m/op-declarations/` fails 6 tests on the clean tranche and identically with this change (not mine).

**Dependency.** `index.mjs` imports `partAdmittedOn` from run-rules (R29, T46-13), which is not yet on `tranche/T46`. The module loads once run-rules merges, and run-rules merges first. The tests below ran against an uncommitted local stand-in of run-rules R29, written from its requirement text and reverted before the commit. I re-run them on the tranche when the CHANGE announcing run-rules' merge arrives.

**Tests and checks.**
- `node --test test/m/ai-runs/*.test.mjs` (with the R29 stand-in): tests 98, pass 98, fail 0.
  - New: `t46.test.mjs`, 11 tests naming R78 and R18. Covered: env truth table, the label, nothing written on the controls, body/query ignored, the explore input; the member dispatch with its account and credential and call counted, the plan run, every control with no call counted, the mode refusal, and the wake still withholding.
  - Amended for the new key: `open.test.mjs` (R10 keys), `reads.test.mjs` (R19 keys), `producers.test.mjs` (R28 answers). Each now also asserts `untested: null`.
- Users' tests, with the stand-in:
  - run-rules, run-productions, plane t41–t43, affordances t33: 0 failures;
  - op-declarations: the 6 inherited failures only.
- No layer tests are named in `build/manifest.md`.
- `format`: 0 failures. `architecture ai-runs`: 0 failures. `coverage ai-runs`: 48 of 48 live ids named; 0 failures. `ownership ai-runs tranche/T46`: 7 files changed; 0 failures.

Size (session_012KrF4pcZDor4ebZmdfWuBk): test runs 8, module lines 3618

## J1 · QUESTION

R18's member dispatch: the wire to agent-worker `/run` (M-T46-4; your START asks me to agree it with AGENT-WORKER through you before I fix it). My best reading, which I am building on meanwhile:

1. **The credential.** `/run` requires `credential`, an `aik-` + 64-hex `ai` token (agent-worker R5, shape only), and every call the segment makes to the plane is admitted as that token's principal. For the organisation run the plane reads the token from the Worker secret. For a member's run the plane holds only her credential's hash, never its value, so it cannot send one it was not given. Reading R18 ("a run a member opened on her own credential, `principal_plane` `member:<id>/<tokenId>`"): the door is called with that same `ai` credential, and control-plane hands the presented token to `dispatchMemberRun({run, by, at, credential})` as an in-process argument, never in a query, body field or record. ai-runs hashes it and looks it up as the resumer does (`aiCredentialLook`, through the `bio` object). It must be on record, unrevoked, and `<principal>/<tokenId>` must equal the run's `principal_plane` exactly; then it is sent as `credential`, used for that one call, and dropped. The value never enters the record or the answer.
2. **The account.** `credentials.accountFor` for her act with the run's project must answer `{kind: "signin", level: "member"}` and her as the member. It is sent as agent-worker R6's `{kind: "signin", level: "member", member: "member:<id>", suggestions}`, with no `secret`, and `suggestions` is the sign-in's own switch (agent-worker R6 as T46 amends it). Any other account (an API-key reference, the group key, a project account) is withheld `MEMBER_PRINCIPAL_RUN`, nothing sent. The account must also be the one the run recorded as paying (`principal_claude` `member:<id>`), as at the wake.
3. **Refusals** (answers of `dispatchMemberRun`). An absent or invisible run gives `{found: false}`. A `by` that is not the run's principal gives `AI_RUN_NOT_PRINCIPAL` (run-rules R5, relayed). A run that is not running gives `{dispatched: false, status}`. A mode other than `check`/`plan` gives `MEMBER_RUN_MODE_NOT_ADMITTED`. A non-sign-in account gives `MEMBER_PRINCIPAL_RUN`. A presented credential that is absent, not on record, revoked or not the run's own is withheld under the existing dispatch codes. Proposed: `MEMBER_PRINCIPAL_RUN` when none was presented (e.g. a session caller, or a run opened by her session as `member:<id>` with no tokenId, which has no credential the segment could act under), and `AI_RUN_NOT_PRINCIPAL` when one was presented that is not the run's. No new row. `AGENT_WORKER_UNBOUND` and `NAMESPACE_UNDETERMINED` stand, and the 30 s wait, the RUNNING/SILENT/REFUSED outcomes and the log entry for a refused or incomplete call are the wake's own.
4. **Consequence for AGENT-WORKER (R80).** With (1), `/run` needs no new admission. R5 is a shape test and the member's token has the shape. Every plane call is admitted as `member:<id>/<tokenId>`, so the run's own principal gate (run-rules R5) passes on her ticks. R10 compares `session.principal.ref` (`member:<id>`, R52) with the account's `member`: the same member. So R80 should be met by its tests alone. AGENT-WORKER should confirm that its R10 reads `principal.ref` and that a `signin` account at `level` `member` passes R6 with `suggestions` a boolean.

Question: is (1) the intended wire, with the door forwarding the member's presented `ai` credential? Or should the plane mint or hold something for her (which is credentials' work, not in T46)? And are the two reused codes in (3) right, or do you want a new row?

## J2 · QUESTION

Separate from J1. R18 names `MEMBER_RUN_MODE_NOT_ADMITTED` as "a row of this module's family" (K2920). This module's rows are held in `run-rules`' table (`bio-plane/src/run-rules/checks.mjs`, `AI_RUNS_CHECKS`) and read by key (R35, run-rules R11). The row does not exist there, and T46-13 (run-rules) does not list it. I cannot write `checks.mjs`, because it is run-rules' file.

My best reading: RUN-RULES adds the row in T46-13. It would be C-22.30 (C-22.29 is R30's `AI_PART_NOT_DEPLOYED`), in DEC-83's form. `where`: `src/ai-runs/index.mjs dispatchMemberRun > is-airun-member-dispatch, reached from op=airundispatch`. Interim translation, until the design stream's `refusal.MEMBER_RUN_MODE_NOT_ADMITTED` lands on main (K2929): "Nothing was started, because on your own Claude sign-in the assistant only checks and plans for you; this kind of work needs your group's Civicsmith to run it." I mint it at that region and read the row by key. Until the row merges, my code reads it with `check`/`translation` null, as `#refuse` already does for a missing row, and my test asserts the code and that nothing was sent. Once the row is on the tranche, it asserts the row too.

Question: should RUN-RULES add it in T46-13, in a CHANGE to that job, or do you want another arrangement?
