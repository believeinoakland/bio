# store-door (T41)

**Status** · session_01PuHeVd3DfFWWwcgeAkRtmj · depth 2 · WORKING · handled B4

## J1 · QUESTION

Two readings I am building on; neither stops me.

(1) R11's grant `use`. R11 records each read under a grant "with the grant's `use`: `draft` for a grant minted for a draft (`plane` R33), else `ask`". Nothing the door can read today says which a grant is: the plane's draft path mints through `credentials.aiGrantMint` (kind `ask` in `ai_grants`), and `aiGrantAdmit`/`aiGrantHeld` answer `{member, viewer, expires}` only. My reading: the door takes the use from the composed store, `store.grantUse(grant)`, handed by `plane` beside `logRead` (plane R33's share: `draft` for a grant its draft path minted, else `ask`), and passes it to `logRead({..., use})`; a store that hands no `grantUse`, or one that throws or answers anything but `draft`, reads `ask`. So the door owns only the passing; who knows a grant's use is the plane's (or credentials', if you prefer `aiGrantHeld` to answer `use` — say so and I read that instead). Please word it into plane R33 / store-door R11 as you rule.

(2) R11's `askceiling` and `askusage` still name `ai-runs` R50's `aiUseCheck` and R48, retired (K2400, K2514). My reading, as your START says ("re-point to ai-use"): `askceiling` answers `answers.askAccount({member: viewer, kind: "ask"})`'s refusal as given, else `{ok: true}` (the account and its limit together, since `ai-use.useCheck` needs the paying `owner` only `accountFor` knows); `askusage` counts through `ai-use.countAskUsage({member: viewer, mode, usage, calls, owner})`, `mode` the body's (`ask` when absent), `owner` the paying account as `credentials.accountFor({member, act: {kind: mode, member}})` answers it (`answers`' `ownerOf`), "not recorded" when no account answers (ai-use R1). R11's text then reads `askceiling` (`answers` R30's `askAccount`, kind `ask`) and `askusage` (`ai-use` R1's `countAskUsage`, the owner as `accountFor` answers it). `ai-runs` drops from my `uses`.

## J2 · QUESTION

In addition to J1 (it replaces nothing there).

(3) R10's no-account code. R10 lists `answers.askAccount`'s refusals as "`AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`, … answered as given", and its earlier sentence "then `AI_NO_ACCOUNT` or `AI_USE_SWITCHED_OFF` (`credentials` R56)". But `askAccount` (answers R30, `index.mjs`:256) answers credentials' own `NO_ACCOUNT` (its row, `credentials/index.mjs`:1113) when no account serves; `AI_NO_ACCOUNT` was ai-runs' translation of it (`ai-runs/index.mjs`:2962, run-rules' row C-22), which the door no longer calls. My reading: "answered as given" wins, so the door relays `NO_ACCOUNT` with credentials' row and mints no code of its own; R10's two mentions of `AI_NO_ACCOUNT` read `NO_ACCOUNT` (credentials R35). If you want the run-rules row instead, the door would translate `NO_ACCOUNT` to `AI_NO_ACCOUNT` (C-22's row) at that one place; say so and I change it. Users that match the code: control-plane's draft relay and `wizard-scripts`' `writing-help.mjs`:56 (its own `AI_NO_ACCOUNT` when `assistant.account` is absent, unaffected: the door never hands a handler a refused assistant).

## Completion

**Entry applied:** T41-61 (was T40-24; K2373, K2500; answers B2 K2574, B3 K2577, CHANGE B4 K2585): R10, R11, as re-worded on `tranche/T41`.
- R10 (`dispatch.mjs` `assistantFor`): after each draft's own first refusal, keep-away first as `credentials.aiKeptAway({use: "draft"})` answers it (no account read, no limit judged); then `answers.askAccount({member, kind: "draft"})` (account and limit together, its refusal as given: `NO_ACCOUNT` with credentials' row, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`, `LIMITS_UNREADABLE`, `ACCOUNT_UNREADABLE`, a key's notice due); the handler gets `{on, account: {kind, level}}`, never the key. `writinghelp` alone gets the account's or limit's refusal handed on as `assistant.refusal` (`{on, account: null, refusal}`), with keep-away still answered first at the door (K2574).
- R11: `askceiling` returns `answers.askAccount({member: viewer, kind: "ask"})`'s refusal as given, else `{ok: true}`. `askusage` counts through `ai-use.countAskUsage({member, mode, usage, calls, owner})`, where `owner` is the paying account as `credentials.accountFor` answers it for that mode (answers' `ownerOf`), "not recorded" when no account serves. The door adds no `use` to a read's log entry (the plane's `logRead` owns it, K2574). `captureupload`'s POST body goes to the map unread, as the request's stream: never parsed, never `BAD_JSON` (`STREAMED_BODY_OPS`, K2585). No `ai-runs` service is called.

**Tests:** `routes.test.mjs`. The R10 tests are rewritten against ai-use and answers, replacing the retired ceiling ops. They cover order and negative controls: a keep-away covering only `ask` keeps no draft away; one covering only `draft` refuses; switched off is answered before the limit, with the limit not judged; fail-closed limits refuse; what `writinghelp` was handed. In `dispatch.test.mjs`, the R11 ask routes are re-tested over a real record (owner recorded, limit reached after counted use, keep-away, switch). There are new R11 tests: the door adds no `use` to the entry, and `captureupload` gets the stream. The fixture `record.mjs` builds `answers` with credentials as the plane does (plane R21). The inherited reds named at START (`dispatch.test.mjs`:352; `routes.test.mjs`:132, :174, :226, :248, and the ceiling-code uses at :154–159, :208–210) are cleared.

**Reading set (K2304):** I measured it as mechanics §3 asks: my requirements (16 KB), my code and tests (154 KB), used modules' Purposes (22 KB, measured), and the named services (answers R1, R2, R30 and its `askAccount`/`logRead`/`answersOf` code; ai-use's Public part and `countUsage`/`countAskUsage`/`useCheck` code; credentials R24, R27, R28, R31, R35, R56 and the grant/keep-away/uses code; wizard-scripts R27 and `writingHelp`; control-plane R72 and its `captureupload` arm; plane R33). Together these are well under 300 KB. I read it all whole myself, so no worker was used.

**Deferred:** none.

**Found in other modules (REPORT J3):**
- `wizard-scripts`: `writingHelp`'s own keep-away (`#keptAway`, `index.mjs`:376–381) asks `credentials.aiKeptAway()` with no `use`. So a keep-away covering only `ask` (credentials R57) still refuses a writing-help draft, which store-door R10 (`aiKeptAway({use: "draft"})`) admits. It should ask `{use: "draft"}`. `groupdescriptiondraft` and `translationdraft` are unaffected. My test points its negative control at `groupdescriptiondraft` for that reason.
- Generated artifacts: this change stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), which bundles `store-door/dispatch.mjs`.

**Final `uses`:** drop `ai-runs` (nothing reads it; B2 confirmed). `ai-use` (`countAskUsage`) and `answers` (`askAccount`, `ownerOf`, `check`) stay; the rest are unchanged.

**Tests and checks run:**
- `node --test bio-plane/test/m/store-door/*.test.mjs`: `tests 43, pass 43, fail 0`.
- Users of store-door (control-plane, plane, `test/system/migrate-released.test.mjs`), compared by failing test name against `origin/tranche/T41` in a worktree: base 337 pass / 14 fail, this branch 338 / 13. Every failure here also fails on the base (inherited). One base red now passes: control-plane's "R53 (K1798; ai-runs R48)" `calls` test, which rides on store-door's `askusage`.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs store-door`: 0 failures. `checks/coverage.mjs store-door`: 13 of 13 live ids named, 0 failures. `checks/ownership.mjs store-door tranche/T41`: 0 failures.

Size (session_01PuHeVd3DfFWWwcgeAkRtmj): test runs 12, module lines 613

## J3 · REPORT

Two findings (record, Completion): (1) wizard-scripts: writingHelp's own keep-away (#keptAway, index.mjs:376-381) asks credentials.aiKeptAway() with no use, so a keep-away covering only ask (credentials R57) still refuses a writing-help draft that store-door R10 (aiKeptAway({use: "draft"})) admits; it should ask {use: "draft"}. (2) The plane bundle (bio-plane/dist/bio-plane.bundled.mjs) is staled by this change (dispatch.mjs).

## J4 · COMPLETE

T41-61 done: R10, R11 as re-worded (B2-B4 applied). store-door 43/43; users control-plane+plane+migrate-released 338 pass/13 fail vs base 337/14, every failure inherited, one base red cleared; format, architecture, coverage 13/13, ownership: 0 failures. Final uses: drop ai-runs. Record: build/jobs/T41/store-door.md on job/T41/store-door.

## Re-run after B5 (K2593)

Merged `tranche/T41` (affordances, tasks, queue and the layer's earlier merges) at `cf3fd85ce8`; no conflict, no change to the module. `node --test bio-plane/test/m/store-door/*.test.mjs`: `tests 43, pass 43, fail 0`. Checks: format 0, architecture 0, coverage 13/13 0, ownership 0 failures.

Size (session_01PuHeVd3DfFWWwcgeAkRtmj): test runs 13, module lines 613
