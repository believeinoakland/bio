# inquiry (T34)

**Status** · session_01Wskzz89u9YtWxzo9XZyHmv · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two points; I carry on with my best reading of each.

1. **Uses.** `build/requirements/inquiry.md` (T34's fold) says Uses gain `capture` (R58) and `calculations` (R11; T33-45, T34-29), but `build/modules.json`'s `inquiry.uses` lists neither, so `checks/architecture.mjs` will refuse my imports of `../calculations/index.mjs` and `../capture/index.mjs`. Best reading: you add both to `inquiry.uses` on `tranche/T34` (both are earlier in the order: capture L3, calculations L5). I code the imports now and merge `tranche/T34` when you have.

2. **R58's bound "at most 200".** Best reading: a call naming more than 200 ids is refused whole (`ok: false`, reason `TOO_MANY_QUESTIONS`, naming the bound), never narrowed to the first 200, since a project's list that reads silently cut would hide a wait. Duplicate ids are answered once. Answer only if you read it otherwise.
