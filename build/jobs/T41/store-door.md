# store-door (T41)

**Status** · session_01PuHeVd3DfFWWwcgeAkRtmj · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings I am building on; neither stops me.

(1) R11's grant `use`. R11 records each read under a grant "with the grant's `use`: `draft` for a grant minted for a draft (`plane` R33), else `ask`". Nothing the door can read today says which a grant is: the plane's draft path mints through `credentials.aiGrantMint` (kind `ask` in `ai_grants`), and `aiGrantAdmit`/`aiGrantHeld` answer `{member, viewer, expires}` only. My reading: the door takes the use from the composed store, `store.grantUse(grant)`, handed by `plane` beside `logRead` (plane R33's share: `draft` for a grant its draft path minted, else `ask`), and passes it to `logRead({..., use})`; a store that hands no `grantUse`, or one that throws or answers anything but `draft`, reads `ask`. So the door owns only the passing; who knows a grant's use is the plane's (or credentials', if you prefer `aiGrantHeld` to answer `use` — say so and I read that instead). Please word it into plane R33 / store-door R11 as you rule.

(2) R11's `askceiling` and `askusage` still name `ai-runs` R50's `aiUseCheck` and R48, retired (K2400, K2514). My reading, as your START says ("re-point to ai-use"): `askceiling` answers `answers.askAccount({member: viewer, kind: "ask"})`'s refusal as given, else `{ok: true}` (the account and its limit together, since `ai-use.useCheck` needs the paying `owner` only `accountFor` knows); `askusage` counts through `ai-use.countAskUsage({member: viewer, mode, usage, calls, owner})`, `mode` the body's (`ask` when absent), `owner` the paying account as `credentials.accountFor({member, act: {kind: mode, member}})` answers it (`answers`' `ownerOf`), "not recorded" when no account answers (ai-use R1). R11's text then reads `askceiling` (`answers` R30's `askAccount`, kind `ask`) and `askusage` (`ai-use` R1's `countAskUsage`, the owner as `accountFor` answers it). `ai-runs` drops from my `uses`.
