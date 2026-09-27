# T5 · query-language — job record

**Session** QUERY-LANGUAGE #1, `session_012jSiJ21iiBkFYdQgY49Gbe`, on `job/T5/query-language` (from `tranche/T5`). Process: civicos-process `main`, `roles/JOB.md`, mechanics §6, §12.2, §13, §14, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · IN PROGRESS. Entry T5-9: N37 (`viewerPredicate`, `GATE_MARK` re-exported from membership); `content:ocr` reads `mixed` as containing machine-read text (content R14, DEC-4); `CONTENT_EXTENT_KINDS` from content with `envelope` (CONTENT #1 REPORT 6); every requirement marked not yet met (R9, R24).

**Read whole:** `roles/JOB.md`, PROCESS-MECHANICS.md §3, §6, §12–§16, `build/manifest.md`, `build/requirements/query-language.md`, `build/layers.md` (layer 5 and the legacy modules), `build/plan/current.md`, the public parts of `membership`, `content`, `text-chain` (legacy-checks has no requirements file), `bio-plane/src/query.mjs` 1–2665, `content/extent.mjs`'s kinds and `unitChainKind`, D-686/D-710/D-723 in the old queue, and `land/worker/D-710`'s `query.mjs` change (kept: `mixed` is a word of `content:chain`). The module has no extraction map (its requirements: nothing of it sits in a legacy file).

## Questions to BOB

- **Q1 · which step kinds does `mixed` join?** Content R14 says every reader that labels machine-read text treats `mixed` as containing it; the plan entry names `content:ocr`. `text-chain` classifies no step kind as a machine reading. Best reading, which I am building: `ocr` and `ai` (an engine read or rewrote the text) are the machine readings, so `content:ocr` and `content:ai` select `chain_kind IN (<kind>, 'mixed')`; `layer`, `typed`, `convert`, `pixels` stay exact. The list is this module's constant `MACHINE_READ_KINDS`, filtered to kinds `STEP_KINDS` declares, and published on `meaningVocabulary().content.fields.chain.selects`. If you would rather `text-chain` own the classification (R22), that is a text-chain entry; say which and I will read it from there.
