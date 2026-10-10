# store-door (T41)

**Status** · session_01PuHeVd3DfFWWwcgeAkRtmj · depth 2 · RUNNING until 2026-10-10T20:57:52Z (control-plane and plane tests (users of store-door)) · handled B4

## J1 · QUESTION

Two readings I am building on; neither stops me.

(1) R11's grant `use`. R11 records each read under a grant "with the grant's `use`: `draft` for a grant minted for a draft (`plane` R33), else `ask`". Nothing the door can read today says which a grant is: the plane's draft path mints through `credentials.aiGrantMint` (kind `ask` in `ai_grants`), and `aiGrantAdmit`/`aiGrantHeld` answer `{member, viewer, expires}` only. My reading: the door takes the use from the composed store, `store.grantUse(grant)`, handed by `plane` beside `logRead` (plane R33's share: `draft` for a grant its draft path minted, else `ask`), and passes it to `logRead({..., use})`; a store that hands no `grantUse`, or one that throws or answers anything but `draft`, reads `ask`. So the door owns only the passing; who knows a grant's use is the plane's (or credentials', if you prefer `aiGrantHeld` to answer `use` — say so and I read that instead). Please word it into plane R33 / store-door R11 as you rule.

(2) R11's `askceiling` and `askusage` still name `ai-runs` R50's `aiUseCheck` and R48, retired (K2400, K2514). My reading, as your START says ("re-point to ai-use"): `askceiling` answers `answers.askAccount({member: viewer, kind: "ask"})`'s refusal as given, else `{ok: true}` (the account and its limit together, since `ai-use.useCheck` needs the paying `owner` only `accountFor` knows); `askusage` counts through `ai-use.countAskUsage({member: viewer, mode, usage, calls, owner})`, `mode` the body's (`ask` when absent), `owner` the paying account as `credentials.accountFor({member, act: {kind: mode, member}})` answers it (`answers`' `ownerOf`), "not recorded" when no account answers (ai-use R1). R11's text then reads `askceiling` (`answers` R30's `askAccount`, kind `ask`) and `askusage` (`ai-use` R1's `countAskUsage`, the owner as `accountFor` answers it). `ai-runs` drops from my `uses`.

## J2 · QUESTION

In addition to J1 (it replaces nothing there).

(3) R10's no-account code. R10 lists `answers.askAccount`'s refusals as "`AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`, … answered as given", and its earlier sentence "then `AI_NO_ACCOUNT` or `AI_USE_SWITCHED_OFF` (`credentials` R56)". But `askAccount` (answers R30, `index.mjs`:256) answers credentials' own `NO_ACCOUNT` (its row, `credentials/index.mjs`:1113) when no account serves; `AI_NO_ACCOUNT` was ai-runs' translation of it (`ai-runs/index.mjs`:2962, run-rules' row C-22), which the door no longer calls. My reading: "answered as given" wins, so the door relays `NO_ACCOUNT` with credentials' row and mints no code of its own; R10's two mentions of `AI_NO_ACCOUNT` read `NO_ACCOUNT` (credentials R35). If you want the run-rules row instead, the door would translate `NO_ACCOUNT` to `AI_NO_ACCOUNT` (C-22's row) at that one place; say so and I change it. Users that match the code: control-plane's draft relay and `wizard-scripts`' `writing-help.mjs`:56 (its own `AI_NO_ACCOUNT` when `assistant.account` is absent, unaffected: the door never hands a handler a refused assistant).
