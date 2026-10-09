# agent-worker (T41)

**Status** · session_01CuxSKppmd8ZmgSfSPhpxXR · depth 2 · COMPLETE · handled B5


## Completion (AGENT-WORKER #15, session_01CuxSKppmd8ZmgSfSPhpxXR)

**Entry applied: T41-31.** R71 (D34, K2373): R6, R10, R29, R32, R33 and R57 accept `level` `project`.
- `src/cascade.mjs`: `CASCADE_ORDER` is `["project", "member", "group"]` (credentials R56's order). `LEVEL_KINDS.project` is `apikey` or `signin`. A project's account naming no project is `unset`. `resolveClaudeCascade` answers `project` beside an available project account, and its `detail` names a project's account. `cascadeToken` is unchanged in shape: a project's sign-in becomes exactly `{kind: "signin", member}` (agent-runner R2), and no reference names the project.
- `src/index.mjs`: `accountOf` (R6) requires `project` (a non-empty string of at most 200 characters) at `level` `project` and refuses it at any other level (`BAD_ACCOUNT`). A project sign-in is held to the member-level sign-in's rules: no secret, and `suggestions` false. R10's refusal names a project's account; R29's `claude_account` carries `project` at that level; the `/run` note, the `GET /version` statement (R58) and the header name a project's account.
- R57's N796 sentence: no source change was needed, because the module never refused a sign-in for a standing question. It is now tested both ways: the use on (an ask under the standing grant on the author's own sign-in is answered, its turns in the author's own runner); the use off (no grant gives `NO_GRANT`; a grant the plane refuses `STANDING_SWITCH_OFF` is relayed unchanged; neither takes a turn or names a runner).
- Built on my reading in J1, which is still open (R6's "`group` or `project` with a `kind` other than `apikey`" against R71's project sign-in). If BOB rules otherwise, a project sign-in's acceptance is the one place to change (`LEVEL_KINDS.project`).

**Tests.**
- New suite `test/t41.test.mjs`: 41 checks naming R6, R10, R29, R32, R33, R57 and R71, each admitting arm beside its refusing control (K874).
- New negative-control driver `test/t41.control.mjs` (run by hand, like `cascade.control.mjs`): 7 arms. Each breaks the source in one place and requires the suite to fail on lines naming that arm's ids.
- Updated tests that pinned "no project level": `requirements.test.mjs` (R6 case :381 retitled as "naming no project", still refused; R32's order; the project state is `project:unset`; R58's sentence), `cascade.test.mjs` (the order; the unknown-level arm uses `instance`; the R6 case retitled), `ask.test.mjs` (R58's sentence). t35 :308/:316 and t37 :340 still hold unchanged (a project account with no project id is refused). Nothing was weakened: each refusal still refuses.

**Checks and runs.**
- `npm test` (agent-worker): 13 files, 13 pass, 0 fail. Tallies: agent-worker 140/0, ask 62/0, cascade 71/0, fanout 185/0, harness 261/0, plan 55/0, requirements 305/0, t35 206/0, t36 20/0, t37 165/0, t41 41/0, versions 20/0, wire-vocabulary 83/0.
- `node test/t41.control.mjs`: 7 pass, 0 fail; every source restored and verified by sha256.
- The bundle was regenerated (`npm run build`, my own artifact). `node --test bio-plane/test/system/fleetbundles.test.mjs`: 1 pass, 0 fail. Its SKIP lines are agent-runner's and file-scanner's uninstalled vendored inputs, not this member's.
- Layer tests: none named in `build/manifest.md`. No service I provide to another module changed in shape for its existing callers (R6 only admits more), so no users' suites were run.
- Process checks: format 0 failures (145 modules); architecture 0 failures; coverage 63 of 63 live ids named, 0 failures; ownership 0 failures.

**Reading (mechanics §17; the START's step 3).** The set is over 300 KB (1,321 KB by `reading-sets.py`; this module's own code and tests alone are ~940 KB).
- Read whole myself: `build/requirements/agent-worker.md`; layer 6's row of `build/layers.md`; the used services named (credentials R32, R35, R54, R55, R56; agent-runner R2; answers R19 for the standing path); `src/cascade.mjs`, `src/index.mjs`, `src/ask.mjs`, `src/draft.mjs`; `test/cascade.test.mjs`. Read in part: `requirements.test.mjs`, `ask.test.mjs`, `t35.test.mjs` and `t37.test.mjs`, only the lines this change touches.
- Two workers read the rest in full: `src/ops.mjs`, `reads.mjs`, `signin.mjs` and every other test, control and helper file. Their summaries were ~11 KB and ~9 KB, every statement citing file:line. They covered every account assertion, the reusable stubs, the bundle check and each test naming my ids.
- Nothing they left out mattered. They found the only lines that broke (listed above), and confirmed that no other suite asserts on levels.

**Found in this module, deferred.** `test/cascade.control.mjs` is stale: its arms anchor on source lines T33-57 removed (its arm 3 on `recordedPayer !== cascade.level`), as `cascade.test.mjs`' header already records. Re-arming it is outside this small change (P6, doubt 7); `t41.control.mjs` covers the T41 rules. Deferred to the module's split (T42's map).

**Found in other modules.** None.


**After B2 (ANSWER to J1, K2479).** I merged `tranche/T41` @ 15ec91ff1f; R6 now reads as J1 proposed, so no code change was needed. The merge brought agent-model's T41 change (its R13: `estimated_cost_usd` beside the five figures on the API-key path), which staled two things of mine:
- The committed bundle: regenerated.
- `ask.test.mjs`' R54 usage check: it now expects agent-model's answer exactly, `USAGE_FIGURES` plus its `ESTIMATE`. This tracks agent-model R13; nothing is weakened.
Re-run results:
- `npm test`: 13 files, 0 fail (ask 62/0, requirements 305/0, t41 41/0).
- fleetbundles: agent-worker passes. The only fails are the plane bundle's staleness, which is inherited red 14 (regenerated at the layer's close), not mine.
- format, architecture, coverage (63/63) and ownership: 0 failures.

**After B3 (CHANGE, K2485).** I merged `tranche/T41` (now at 8e954b4bfa).
- (1) Was already done after B2: `ask.test.mjs`' R54 check expects R13's sixth figure.
- (2) I had regenerated my own bundle (`agent-worker/dist`; the manifest lists agent-worker as its owner) after B2, before B3 arrived. It is byte-identical to a fresh build at this head, so R45 reads green and there is no accepted red to name. BOB's regeneration at L6's close will produce the same bytes, or replace them.
- `npm test`: 13 files, 0 fail.

**After B4 (CHANGE, from AI-RUNS #14 J3, K2489) and B5.** I merged `tranche/T41` (8ebe11131c).
- **R10 now compares against `principal.ref`.** It compares `account.member` against the run's `session.principal.ref` (`principal_claude_ref`, the member whose act it is), never `principal.claude`. Once ai-runs merges, `claude` names the paying owner (`member:<id>`, `project:<id>` or `group`). `recorded` now carries `principal.ref`.
- **Test mocks:** every plane mock in this module's tests (11 files) now publishes `ref` as the member whose act it is; `requirements.test.mjs` and `t41.test.mjs` can set the paying owner apart (`owner`).
- **`account.level` `project` and `suggestions` false:** these were already taken (R71, above). A project's account with `suggestions` false is accepted at both kinds, and nothing refuses a project's key for its switch.
- **`estimated_cost_usd` in usage (R26):** passed through exactly as agent-model answers it. It is tested on the tick: a number on a project's key, null on a project's sign-in.
- **New in `t41.test.mjs`** (48/0, was 41): runs paid by the group's or a project's key drive on that key serving the member's act, and the controls refuse a mismatch, naming `principal.ref`; plus R26's estimate on the key and on the sign-in.
- **New control arm 8** (R10 reading `principal.claude` again) fails the suite: `t41.control.mjs` 8/0.
- **`npm test`:** 13 files; every suite 0 fail except `requirements.test.mjs` 303/2. The 2 are R45 (the committed bundle is stale: run-rules' merge and this change's `src/index.mjs`). That red is accepted by name, as B4 says: BOB regenerates at L6's close, and I did not regenerate.
- No other suite drives this member's `/run` with a real plane: `d260-resume` and `fence-e2e` no longer exist; `git grep` finds only `fleetbundles` and `newgroup`'s wizard reading its files.
- **For BOB (wording):** R10's text still names `session.principal.claude`. It wants `session.principal.ref` (ai-runs R52, K2489).
Size (session_01CuxSKppmd8ZmgSfSPhpxXR): test runs 16, module lines 2,760 (source; 13,923 all files outside `dist/`)

## J1 · QUESTION

R6 still says "of `level` `group` or `project` with a `kind` other than `apikey`, 400 `BAD_ACCOUNT`", while R71 says a project's sign-in account (credentials R54, and credentials R56's cascade step 1: `{kind: "signin", level: "project", project, member}`) runs as `agent-runner` R2's `{kind: "signin", member}`, exactly as the member's own. The two disagree on `{kind: "signin", level: "project"}`.

My best reading, which I am building: R71 governs a project's account (R6 says "A project's account (`level` `project`) is R71's"), so R6's clause stands for `group` only. On the wire a project account is `{kind: "apikey", level: "project", project, secret, member}` or `{kind: "signin", level: "project", project, member, suggestions: false}` (no `secret`, as the member-level sign-in); `project` a non-empty string, required at `level` `project` and refused `BAD_ACCOUNT` at any other level; R10's payer is `member` at every level; R29's `claude_account` adds `project` (an id, never a secret) when the level is `project`; R33 hands `agent-model` `{kind: "apikey", key}` or `{kind: "signin", member}`, never the project. If you agree, R6's sentence wants "`group` with a `kind` other than `apikey`" (BOB's wording).

## J2 · COMPLETE

T41-31 complete (record's Completion, commits 9b4203a311 and ea0aa083df): R71 through R6, R10, R29, R32, R33, R57, and R57's standing sign-in tested on and off. New t41.test.mjs 41/0 and t41.control.mjs 7/0; npm test 13/13 files green; bundle regenerated, fleetbundles 1/0; format, architecture, coverage (63/63) and ownership 0 failures. Built on J1's reading, still open: a project's sign-in accepted (R6's sentence wants BOB's wording). Deferred: the stale cascade.control.mjs, to the split.

## J3 · COMPLETE

B2 applied: tranche/T41 merged (R6 as K2479; no code change needed). The merge's agent-model R13 (estimated_cost_usd) staled my bundle (regenerated) and ask.test.mjs' R54 usage check (now expects USAGE_FIGURES plus ESTIMATE, agent-model's answer exactly). npm test 13 files 0 fail; t41 41/0; checks 0 failures; fleetbundles: only the plane bundle stale (inherited red 14). Record's Completion has the addendum.

## J4 · COMPLETE

B3 applied: tranche/T41 merged (8e954b4bfa). (1) Done already after B2: ask.test.mjs R54 expects R13's sixth figure. (2) I had regenerated my own bundle after B2, before B3 arrived; it is byte-identical to a fresh build at this head, so R45 is green and no red needs naming. Your L6-close regeneration will give the same bytes. npm test 13 files 0 fail; ownership and coverage 0 failures.

## J5 · COMPLETE

B4/B5 applied (record's Completion, 'After B4'): tranche merged 8ebe11131c. R10 now compares account.member with session.principal.ref (ai-runs R52), never principal.claude; mocks give ref; t41 48/0 adds group- and project-paid runs (drive) with mismatch controls, and R26's estimated_cost_usd on the tick (number on a key, null on a sign-in); t41.control 8/0 (new arm 8: R10 reading principal.claude). npm test: all 0 fail but requirements 303/2 = R45, stale bundle accepted by name, not regenerated. Checks: format, architecture, coverage 63/63, ownership 0 failures. Wording for you: R10's text still says session.principal.claude; it wants session.principal.ref.
