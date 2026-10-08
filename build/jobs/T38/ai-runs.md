# ai-runs (T38)

**Status** · session_01A8UNAiBU2W2MMZQtcUvj1x · depth 2 · WORKING · handled B2

## J1 · QUESTION

A `src/` change proves needed for T38-28; I ask before making it, as the START says.

**What I found.** With the test written as B1 asks (ann connected through `credentials.subscriptionConnected`, R43, no reference), the run never opens: `open` refuses it `AI_NO_ACCOUNT`. Cause: `#accountFor` (`bio-plane/src/ai-runs/index.mjs`:2760–2770) accepts only an answer with `typeof a.key === "string"`; credentials R35's sign-in answer `{ok, kind: "signin", level: "member", member}` has no `key`, so it falls through to `#noAccount`. The same helper serves the dispatch (`:1716`), whose body (`:1731–1733`) always writes `secret: ref.key`.

**My best reading (proposed change, ~8 lines, `index.mjs` only).**
1. `#accountFor`: also accept `a.ok === true && a.kind === "signin" && a.level === "member"`, returning `{level: "member", kind: "signin", key: null}`. Every other shape still refused as today.
2. `#aiRunDispatch`: build `account` as `{kind, level, member, suggestions}` and add `secret: ref.key` only when `kind !== "signin"`, so a sign-in carries no `secret` key (agent-worker R6; K2290). `suggestions` stays as computed (credentials' sign-in serves with the switch off; `accountReferenceState` with no reference answers no `suggestions: true`, so it is `false`).
3. Comments at `:961`, `:1012`, `:1709` name the sign-in arm.

This meets R52 as written ("the account `credentials.accountFor` answers for the act of the member who started it"); no requirement wording changes. The test is already written to the B1 shape; it goes green with this change. Until you answer I hold the job here (the answer decides what I build next).

## J2 · REPORT

For `answers` (not mine, nothing for it to change unless you judge so): applying K2299 needed a third site in `index.mjs` besides the two J1 named. `#accountServing` (the synchronous read behind the wake's decision, `:1684`, and `aiUseCheck`, `:2842`) answered only a held reference or the group key, so a sign-in member's woken run was withheld `NO_ACCOUNT`. It now also answers `member` when `accountReferenceState` shows `subscription.connected` (credentials R43, R35's order). Effect outside ai-runs: `aiUseCheck` (the ceiling check `answers` calls before an ask or draft) no longer refuses a sign-in-only member `AI_NO_ACCOUNT`; whether `answers` then carries the `signin` account to agent-worker is `answers`' own, under its requirements. The tests of every module listed as using ai-runs give identical results before and after (1252 pass, 35 fail, the same 35, all on the base already); `answers` is not listed as using ai-runs in `modules.json`, though it calls `aiUseCheck` and `countAskUsage` (R48, R50, R52); you may want that edge recorded.

## J3 · COMPLETE

**Entries applied.** T38-28 (N708's remainder; K2283, K2290, K2299): `scheduler.test.mjs`'s `subscription` case replaced, not dropped. A member connected through their subscription (credentials R43) with no reference is dispatched with `{kind: "signin", level: "member", member: "member:ann", suggestions: false}` and no `secret` key; the test title names R52. `src/` change as answered in B2 (K2299), `index.mjs` only: `#accountFor` accepts R35's sign-in answer (`key` null); `#aiRunDispatch` adds `secret` only for a kind other than `signin`; and (a third site, J2 REPORT) `#accountServing` answers `member` for a member connected through their subscription, so the wake's decision does not withhold the run `NO_ACCOUNT`. Comments name the sign-in arm. No requirement text changes. Rule 6 item 11's ai-runs share is cleared.

**Deferred.** Nothing.

**Reading set (mechanics §17).** Measured at START: 640 KB (`index.mjs` alone 211 KB), so over 300 KB. I read these whole: `build/requirements/ai-runs.md` and `scheduler.test.mjs`. I read these in part: credentials R22, R35 and R43, agent-worker R6, and the code paths the entry changes (`index.mjs` `open`'s account arm at :955–1025, the resume decision and dispatch at :1665–1760, and `#accountServing`/`#accountFor` at :2740–2790), plus `world.mjs`'s helpers that the test uses. I did not read layer 6's row of `build/layers.md` and had no worker summarise the rest of the code and tests. Instead, the module's full suite (74/74) and its users' suites, identical before and after, stand in for that. Nothing found later depended on what I left unread.

**Found in another module.** `answers` (J2 REPORT): `aiUseCheck` now admits a sign-in-only member. `modules.json` lists no `answers` → `ai-runs` edge, though `answers` calls `aiUseCheck`/`countAskUsage`.

**Tests and checks.**
- ai-runs `node --test test/m/ai-runs/*.test.mjs`: tests 74, pass 74, fail 0.
- Users of ai-runs (every `tests` path of modules whose `uses` names ai-runs): pass 1252, fail 35 both before (base `index.mjs`) and after, the same 35 tests. They are inherited reds: affordances `plane.test.mjs`/`t36.test.mjs`, op-declarations `t34`/`t37`, plane `stats.test.mjs`, scheduler `files.test.mjs`:288 and `migrate-released.test.mjs`.
- `format`: 137 modules, 136 requirements files; 0 failures. `architecture`: 17 product files, 63 relative imports; 0 failures. `coverage`: 45 of 45 live requirement ids named by a test; 0 failures. `ownership`: 3 files changed by ai-runs between tranche/T38 and HEAD; 0 failures.

Size (session_01A8UNAiBU2W2MMZQtcUvj1x): test runs 6, module lines 3295
