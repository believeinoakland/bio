# query-language (T19)

**Status** · session_01P2p1ii3vyq4yoTizW7hkpH · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.**
- `build/plan/current.md` layer 5, query-language (kept; `draft-T19.md` layer 5), rule 1: the catalogue imports re-pointed to record-grammar. `src/query.mjs` imports `parseFrontmatter` from `record-grammar/frontmatter.mjs`, `normalizeType` from `types.mjs`, `MACHINE_CLASS_PREFIX` from `actors.mjs`, `BASIS_ROLES`, `GRADE_AXES`, `GRADE_SOURCES` from `grades.mjs`; `converts.test.mjs` (`normalizeType`, `MACHINE_CLASS_PREFIX`), `grammar.test.mjs` (`normalizeType`) and `vocabulary.test.mjs` (`GRADE_SOURCES`, `BASIS_ROLES`, `GRADE_AXES`) likewise. No query-language file imports `bio-checks.mjs`. The comments that named the catalogue as these vocabularies' owner now name record-grammar. No old suite deleted (K619).
- K776: `test/m/query-language/fixture.mjs` builds `bundles` with record-core R37's `project` column (N426; membership R43's gate fences by it). The five tests red on the tranche for `no such column: b.project` pass.

**Deferred.** None.

**Found in another module's documents (for BOB).** `build/requirements/query-language.md` Uses still names `legacy-checks` for the six names, and `build/modules.json` lists `legacy-checks` in query-language's `uses`; after this job the module uses record-grammar for them and no longer imports the catalogue at all (`content` holds the three content names already). Both are BOB's to update.

**Tests and checks.**
- `node --test bio-plane/test/m/query-language/`: before, 5 fail (`no such column: b.project`); after, `tests 38, pass 38, fail 0`. No layer tests are named in `build/manifest.md`. No provided service changed, so no user's tests are owed.
- `node checks/format.mjs`: `87 modules, 82 requirements files; 0 failures`.
- `node checks/architecture.mjs … query-language`: `8 product files, 31 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs … query-language`: `26 of 26 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs … query-language tranche/T19`: `6 files changed by query-language between tranche/T19 and HEAD; 0 failures`.

Size (session_01P2p1ii3vyq4yoTizW7hkpH): test runs 2, module lines 2732
