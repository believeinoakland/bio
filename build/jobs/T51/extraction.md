# extraction (T51)

**Status** · session_01AMS17zW7T6NQQhJwzerr6u · depth 2 · WORKING · handled B1

## J1 · REPORT

Findings in other modules (not mine; for their jobs or BOB):
- `observation-log` `bio-plane/src/observation-log/index.mjs:313` [plain] "document is text and no extraction step stands between them"
- `observation-log` `bio-plane/src/observation-log/vocabulary.mjs:1367` [plain] "the archive fallback became eligible: three failures or fourteen da..."
- The whole `checks/run.mjs` run reports 3905 words failures across the repository. None is in extraction or extractrun.

For BOB (a wording decision, not taken by me):
- The two sentences I localized that say "your team's Civicsmith" keep "team" exactly as they read. K3803 (3) says "group" for "team" in every text a person reads; `words.test.mjs` (DEC-149) asserts "group's Civicsmith" is never in a refusal translation. I left the wording unchanged. Please rule: keep "team" (the DEC-149 form) or change it to "group" through the design stream.

Rows the design stream may want (setup-words `--check` reports rows.mjs stale on these; expected, BOB regenerates at the layer close):
- extraction.index.no_text_provenance_recorded
- extraction.index.no_evidence_store_set_up
- extraction.index.reread_candidates_frontier
- extraction.extractrun.undetermined_ceiling
- extraction.extractrun.position_unreadable
