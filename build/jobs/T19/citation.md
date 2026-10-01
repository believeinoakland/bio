# citation (T19)

**Status** · session_01Jde3QCM77xBQXshNfBhmf8 · depth 2 · WORKING · handled B1

## Completion (CITATION #5)

**Entries applied** (`build/plan/current.md` layer 6, citation, kept; B1 rule 1, K801):
- `src/citation/index.mjs`: `normalizeType`, `OBJECT_TYPES` from `record-grammar/types.mjs`, `parseFrontmatter` from `record-grammar/frontmatter.mjs`, `createSha256` from `record-grammar/sha256.mjs`; the header comment (was :10) re-worded to name `legacy-checks` and record-grammar instead of `bio-checks.mjs`.
- `src/citation/checks.mjs`: header comment (:3) re-worded the same way.
- `test/m/citation/fixture.mjs`:10: `parseFrontmatter` from record-grammar.
- `test/m/citation/invariants.test.mjs`:8: `STATES`, `OBJECT_TYPES` from record-grammar's entry. K801: `CONTENT_EXTENT_CHECKS` is content's own C-45 table (content R48, through content's entry). The `ACT_SHAPE_CHECKS` arms (were :143, :145) now read the homes of the act-shape rows: every `*_CHECKS` row table published by the entries of the modules citation uses (record-grammar, record-core, membership, promotion, content, retrieval, inquiry; `SHARED_ACT_CHECKS` C-33.40/.41 among them), with controls that the tables are really read; none holds a citation code or number. Rows homed in modules citation does not use (basis-versions, ratification, entities, case-authoring) cannot be imported from here and are not asked; uniqueness across every family is control-plane's `CHECK_FAMILIES` totality.
- No citation file imports `bio-checks.mjs` (grep: 0).

**Deferred:** none.

**Found in another module / for BOB:** `build/requirements/citation.md` Private · Uses still lists `legacy-checks` for `normalizeType`, `OBJECT_TYPES`, `parseFrontmatter`, `createSha256` and the rows; after this job these come from `record-grammar` (the rows are already citation's own), and `build/modules.json` still lists `legacy-checks` in citation's `uses`. Both are BOB's to update (citation imports nothing of legacy-checks now; `from` is unaffected).

**Tests and checks** (on `job/T19/citation` after merging `tranche/T19` @ c587e337df):
- `node --test bio-plane/test/m/citation/`: tests 55, pass 55, fail 0. No layer tests (manifest). No service changed, so no user module's tests re-run.
- `checks/format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs citation`: 11 product files, 43 relative imports; 0 failures.
- `checks/coverage.mjs citation`: 11 of 11 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs citation tranche/T19`: 5 files changed; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01Jde3QCM77xBQXshNfBhmf8): test runs 2, module lines 1043
