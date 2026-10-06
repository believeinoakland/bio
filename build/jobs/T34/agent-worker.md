# agent-worker (T34)

**Status** · session_01P2xa8iW7ktRdSZGHjGUVvB · depth 2 · WORKING · handled B3

## J1 · QUESTION

The account's wire shape at `POST /run` and `POST /ask` (R6, R10, R29, R32, R33, R54). R6 words it as `credentials.accountFor` answers it, "its R35: `{kind, level, secret}`"; credentials R35 (K1757) answers `{kind, level, key}`, and ai-runs' dispatch today sends `{kind, secret, member, suggestions}` (no `level`). R10 also needs the member whose act the account serves, which neither R35 nor R6's braces name.

My best reading, on which I am carrying on: the body's `account` is exactly as R6 words it plus the two fields the dispatch already carries, `{kind, level, secret, member, suggestions?}`: `kind` `apikey` or `subscription`; `level` required, `member` or `group` (absent or anything else 400 `BAD_ACCOUNT`); `level: group` only with `kind: apikey`; `member` the member whose act it serves (required, as today). The caller (ai-runs' dispatch, the plane's ask) renames R35's `key` to `secret` and adds `level` from R35's answer. `cascadeToken` then hands `agent-model` its own Terms' shape (`apikey` → `{kind, key}`, `subscription` → `{kind, token}`), which also settles AGENT-MODEL #2's J1 from this side without any change there. A `key` field in place of `secret` is read as no secret (`NO_ACCOUNT`, R32 `unset`).

Alternative, if you prefer it: R6's braces say `key` (R35's own name), and I read `key` instead of `secret`; a few lines either way. Tell me which. It touches ai-runs' dispatch (T34-33, after me) whichever way.

## Completion

**Read in full (step 2).** My requirements (both parts); the public parts of all sixteen modules in my Uses; plan T34's Rules at the opening and the L6 entries; K1502, K1503, K1614, K1615, K1621, K1708, K1755–K1757, K1760, K1764, K1795, K1798; my four source files, `ops.mjs`, `harness.mjs`, `subsession.mjs`, the build files; and, of my tests, every file this job changes (`account.mjs`, `ask.test.mjs`, `cascade.test.mjs`, `inprocess.mjs`, the REC100 section and fixture of `harness.test.mjs`, and the R6, R10, R26, R28–R33 sections of `requirements.test.mjs`). The suites this job does not touch (fanout, plan, versions, wire-vocabulary, agent-worker, their controls; about 4,000 lines) I ran but did not read whole: reading them would have taken the window past half before the work (mechanics §6.1). Deferred, by choice, not by need.

**Entries applied.** T34-39 whole, with K1755's fold (K1757) and B2's answer (K1798):
- **R6, R32, R33 (K1755, K1798).** The account arrives as `{kind, level, secret, member, suggestions?}`: `level` required, `member` or `group`; `group` only with `apikey`; anything else 400 `BAD_ACCOUNT`; absent 409 `NO_ACCOUNT`. `cascade.mjs` judges the one account that arrived at its own level (`CASCADE_ORDER` `["member", "group"]`, `LEVEL_KINDS`); an account at no level R32 judges (none, a project's, an instance's) is `unset`. `cascadeToken` answers `{level, reference}`, the level the account's own, the reference in agent-model's own terms. No account is read from the environment.
- **R10, R57.** `RUN_NAMES_A_DIFFERENT_PAYER` compares the run's recorded member with the member whose act the account serves, at either level: the group's key serving Ruth's act on Sam's run is refused like Ruth's own reference; on Sam's own run it drives, still Sam's act. The message names which kind of account it was, never a secret.
- **R29.** `claude_account` is `{available: true, kind, level, member}`.
- **R26, R54 (N588).** Each usage entry is `{mode, model, usage, calls}`, `calls` exactly as agent-model R6 answers it (`null` passed as `null`, never invented); the ask reports the same, no longer counting meter turns itself.
- **R36, R58.** Header, comments, `judgement_note` and `MODEL_TURNS` (the `/version` sentence) now state the account that serves the member's act (their own, or the group's API key); the copy still binds no Claude credential. R56's wording names "the switch that governs the act" (credentials R37: the group key's own switches for its acts); the behaviour is unchanged, the plane sends the switch.
- **R55 (START finding, K1764).** `ASK_OPS` follows the grant's list (`AI_GRANT_OPS`, `rule` included); `ops.mjs`' comment likewise. The copy test asserts equality with no exception.
- **N585's share (K1614, K1621).** The five REC100 arms of `harness.test.mjs` connect Ruth's account through the routed op: the op admits a member *session* only (a deploy token is `CLASS_FORBIDDEN`), so the fixture enrols Ruth with the administrator's token, signs her in, connects under her session (with `ACCOUNT_SEAL_SECRET` bound), and makes her acts under it. 261/0.
- **R45.** Bundle rebuilt (`npm run build`), byte-identical (requirements R45 and `fleetbundles.test.mjs` green).

**Deferred.** None of the entry. `cascade.control.mjs` stays stale (N586's part, T35, plan Left out), unchanged.

**Found in other modules (REPORT J2).** Two callers build the account without `level` and must send K1798's shape, else a live run or ask is now refused `BAD_ACCOUNT`: ai-runs' dispatch (`bio-plane/src/ai-runs/index.mjs:1713`, its T34-33 job, K1798 names it) and the plane's ask (`bio-plane/src/plane/ask.mjs:48–54`, module `plane`, L11), which also reads `accountReferenceFor` rather than `accountFor`, so a member served by the group's key gets no ask. No test of theirs is red today (none drives a live dispatch).

**Reds that wait on an upstream merge (L6 order, both before me).** `ask.test.mjs` 53/4: R54's and R26's `calls` arms (3) need agent-model's `calls` (T34-38; today `converse` returns none, so `null` is carried); R55's `ASK_SCOPE` arm (1) needs answers' list (T34-36). Each passes once its upstream is merged and I merge the tranche.

**Tests and checks** (on `73af4d8f0f`, tranche merged):
- agent-worker 140/0; ask 53/4 (above); cascade 56/0; fanout 184/0; harness 261/0 (was 256/5); plan 55/0; requirements 293/0; versions 20/0; wire-vocabulary 83/0.
- Users of my service: answers `standing` 7/0, skills `doctrine` 11/0, plane `ask` 7/0 and `worker` 5/0, run-rules `deployment` 2/0, ai-runs `scheduler` 5/0, control-plane `members-pin` 3/0 and `r53-routes` 8/0, membership `module-order` 5/0, bundler 25/0, `system/fleetbundles` 0 fail.
- format: 126 modules, 125 requirements files; 0 failures. architecture: 34 product files, 110 relative imports; 0 failures. coverage: 50 of 50 live ids named; 0 failures. ownership: 13 files changed by agent-worker; 0 failures.

Size (session_01P2xa8iW7ktRdSZGHjGUVvB): test runs 22, module lines 2141

## J2 · REPORT

Two callers build the `/run` and `/ask` account without `level`, so under R6 as folded (K1798) a live dispatch or ask is now refused 400 `BAD_ACCOUNT`:
1. **ai-runs** (`bio-plane/src/ai-runs/index.mjs:1713`, its T34-33 job): sends `{kind, secret, member, suggestions}` from `accountReferenceFor`; it owes K1798's `{kind, level, secret, member, suggestions?}` from `credentials.accountFor` (R35's `key` as `secret`), with the switch that governs that account (the group key's own, credentials R37, for a group-key act). K1798 already names it.
2. **plane** (`bio-plane/src/plane/ask.mjs:48–54`, module `plane`, L11): the same shape gap, and it reads `accountReferenceFor`, not `accountFor`, so a member served only by the group's API key gets no ask (`NO_ACCOUNT`), against agent-worker R54 and answers R19's reading of K1755. Not in any T34 entry I can see.
No test of either module is red today: none drives a live dispatch to this member.

## J3 · COMPLETE

T34-39 applied whole (K1755/K1757, K1798, N588, N585's share, the R55 START finding); record's Completion section on `job/T34/agent-worker`. Checks: format, architecture, coverage (50/50), ownership (13 files) all 0 failures. Suites: harness 261/0 (REC100 ×5 cleared), requirements 293/0, cascade 56/0, the rest green, except `ask.test.mjs` 53/4, which wait on upstream merges in L6's order: 3 arms on agent-model's `calls` (T34-38), 1 on answers' `ASK_SCOPE` (T34-36). Bundle rebuilt and fresh. REPORT J2: ai-runs' dispatch and the plane's ask must send K1798's account shape.

## Completion after B3 (CHANGE)

**Applied.** Merged `tranche/T34` (run-rules T34-32, agent-model T34-38, answers T34-36 and the regenerated bundles among it). R44's N53 pin in `requirements.test.mjs` now expects `GATE_ADDRESS.file` `agent-harness/src/harness.mjs`, where the gate's code lives; the exports it checks were already read from agent-harness.

**Tests** (on `738e493817`): agent-worker 140/0; ask 57/0 (the four upstream-dependent arms now green: agent-model's `calls`, answers' list); cascade 56/0; fanout 184/0; harness 261/0; plan 55/0; requirements 293/0 (R45 bundle fresh); versions 20/0; wire-vocabulary 83/0.

**Checks.** format 0 failures; architecture 0 failures; coverage 50 of 50, 0 failures; ownership 2 files changed since the tranche, 0 failures.

**Still open in other modules.** REPORT J2 stands (ai-runs' dispatch and the plane's ask send the account without `level`).

Size (session_01P2xa8iW7ktRdSZGHjGUVvB): test runs 31, module lines 2141
