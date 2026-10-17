# retrieval (T50)

**Status** · session_012ENiSBrCB2vHnYDrzpCCfT · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two points, neither blocks me; I carry on on my best reading of each.

1. **`uses` lacks `setup-words`.** Your START says K3632 added `setup-words` to retrieval's `uses`, but `build/modules.json` on `tranche/T50` (@ 163bf1a821, merged into my branch) does not list it for retrieval (the K3632 ruling names acquisition, capture, doorbell, file-safety, extraction and reading-pipeline). Plan rule 6 needs it: `retrieval/words.mjs` reads every keyed sentence through `setup-words`' `word`. `node checks/architecture.mjs bio retrieval` therefore reports "imports setup-words, which retrieval does not declare in uses" until you add the edge (it is outside my paths).

2. **`aliasesOf` (entities R55) answer shape.** The text says it answers `[{entity_id, kind, label, alias}]` "in entity id then alias order", with `limit` published, `truncated` and `next`, which can only be an object. I read it as `{ok, aliases: [...], limit, truncated, next}` and accept a bare array or an `items` key too; it pages by `next` (up to 4 pages of 5,000). If ENTITIES answers differently, tell me with the merge CHANGE. My R84 tests stand `aliasesOf` in over the real alias table until entities merges.
