# promotion (T53)

**Status** · session_018BhcegYHK2EwFjRJE5A3Md · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-28)

# promotion · T53 · report

**Entries applied**
- T53-89 (K5006) reds: `row-census` settled as real, not stale: eight rows moved after the 1.80.0 stamp (2 arrived, C-2.8 and C-33.65; 6 changed translations: C-115.40, C-120.4, C-124.8, C-137.5, C-140.45, C-53.13) with no `awaiting stamp` record. Stamped as 1.81.0 (`gate.mjs` note, `ROW_CENSUS` 1974 rows, e558e463..., incl. record-core's C-102.40 merged last), fixture `row-census-1.81.0.jsonl` replaces 1.80.0's, suite header re-pinned. The suite is green (10 pass).
- T53-88 (K5471 (6)) R-73 / R62: promotion's side is R53, which already commits a question with the project its document states and, by R9, records the title its `## Question` derives. Added the R62 test (`promote.test.mjs`): a question stating project P is committed with P; its title is the question's words (no `ENT-`, no `->`); a raw-chain envelope title is refused `ENVELOPE_TITLE_DISAGREES`; control: a question with no project is committed with none. No promotion source change was needed.
- T53-90 (K5565) English in tests: all 21 sites in 7 files converted; the words check's baseline loses promotion's 7 files (words check: 0 failures over the tree). B sites got keys in the module (`localize`): promotion.info2.*, promotion.history.*, promotion.release.*, promotion.index.* (mechanical-operation, new-project and fork refusals), promotion.gate.no_case_catalogue_registered. Tests read each through `localize(id, en, vars)`; the sentence text is unchanged. `moved.test.mjs`'s `where` pattern no longer carries a sentence.

**Tests** · `test/m/promotion/` + `d526-refusal-order` + `row-census`: 173 pass, 0 fail.

**Found in other modules**
- screens-investigate `explore.mjs` (~:218-239): "Open a question from this chain" builds the title from raw ids and the relation field name and passes no project; R62's screen half (title in words, project from the explore page, else ask the member) is that job's. promotion accepts and records what the document states.
- setup-words: `rows.mjs` is stale against the tree (`build.mjs --check`), including my new keys; regenerated at merge.
- case-checker `program.mjs` (generated) embeds gate code; regenerated at merge.

**Met** · R62

Tests: 173/173. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegYHK2EwFjRJE5A3Md): test runs 1, module lines 4018
