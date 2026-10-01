# case-grammar (T19)

**Status** · session_01SFb3VjexGhNKSoudckNBDW · depth 2 · COMPLETE · handled B1

## Completion (CASE-GRAMMAR #2)

**Entries applied.** `build/plan/current.md` layer 8, case-grammar (refresh; rule 1): the three `parseFrontmatter` imports (`index.mjs`:13, `blocks.mjs`:23, `tensions.mjs`:22) now read `../record-grammar/index.mjs` (record-grammar R6–R11, the parser in `frontmatter.mjs`, re-exported by its entry). No case-grammar file imports `bio-checks.mjs`; the module tests import no catalogue name (they import only `src/case-grammar/index.mjs` and their own `helpers.mjs`). No provided service changed; no old suite deleted (K619).

**Deferred.** Nothing.

**For BOB (build state, not another module's code).** case-grammar no longer imports `legacy-checks`: `build/modules.json` `uses` (`record-grammar`, `legacy-checks`) and the requirements' Uses line (`legacy-checks`: `parseFrontmatter` … re-exported from `record-grammar`) can name `record-grammar` alone. No generated artifact made stale (case-grammar is in no bundle's inputs other than the plane's own, regenerated at the layer close).

**Tests.** `node --test bio-plane/test/m/case-grammar/` (from `bio-plane/`): tests 20, pass 20, fail 0. No layer tests are named in `build/manifest.md`.

**Checks** (from civicos-process @ 0d36797):
- `format`: 87 modules, 82 requirements files; 0 failures
- `architecture case-grammar`: 9 product files, 17 relative imports; 0 failures
- `coverage case-grammar`: 7 of 7 live requirement ids named by a test; 0 failures
- `ownership case-grammar tranche/T19`: 4 files changed; 0 failures

Size (session_01SFb3VjexGhNKSoudckNBDW): test runs 1, module lines 446

## J1 · COMPLETE

case-grammar complete: the three parseFrontmatter imports re-pointed to record-grammar (index.mjs); no case-grammar file imports bio-checks.mjs; tests 20/20; format, architecture, coverage, ownership 0 failures. For BOB: modules.json uses and the requirements' Uses line can drop legacy-checks (see record).
