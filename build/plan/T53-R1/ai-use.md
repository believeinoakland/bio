# T53 R1 · ai-use · rows

## plan-T53-draft.md

**run-rules**, **ai-runs**, **observation-log**, **agent-harness**, **agent-model**, **agent-runner**, **agent-steps**, **agent-worker**, **ai-use**, **ai-gate** (AI-DESIGN, K5457) · their entries: `planning/plan-T53-ai.md`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 6 | ai-use | 1 / 0 | 0 / 0 / 1 (1) |  |

## plan-T53-ai.md

**Status** · READY (L56) · Moved whole from `plan-T53-draft.md` at L47 to keep it under its cap (BOB #324); entries unchanged, in the plan's form. Each module's START carries its rows here verbatim (K5564, L37 R1). Detail: AI-DESIGN's drafts in `build/plan/lane-ai-design/` as each entry names; `FOLD-AI.md` for the layer-6 order and the retired ops.
**ai-use**
- T53 · K5457 · the neutral usage record (provider-reported money apart from Civicsmith's estimate; never zero for the unmeasured); provider limits as limits reached; thresholds, alerts, reconciliation · `lane-ai-design/draft-ai-use.md` R1-R26
- T53 · K5459 · a paying team or project sees each member's use over thirty days; a personal subscription never · `lane-ai-design/draft-ai-use.md` R27
- T53 · K5480 · op `airetestset`, an administrator's switch turning re-testing off (R28) · `lane-ai-design/draft-ai-use.md` (A50)
- T53 · K5480, K5481, K5487 · re-testing capped monthly per AI with the switch (R28), administrators reminded while off (R29), lifecycle by Bob's standing rule (R30); opt-in health counts: `countHealth` (R31), `aihealthset` off by default (R32), `healthReport` by day (R33), a personal subscription flagged and kept out (K5491) · `lane-ai-design/draft-ai-use.md`
