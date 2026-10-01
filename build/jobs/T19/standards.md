# standards (T19)

**Status** · session_012Sj9LjeX3usEuvfF2Fjxjy · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1; `build/plan/current.md` layer 9, standards: catalogue re-points, rule 1):
- `src/standards/index.mjs`:27 → `isMachineIdentity` from `record-grammar/actors.mjs`, `normalizeType` from `types.mjs`, `proposalLabel` from `labels.mjs`; the header now names `record-grammar` (not `legacy-checks`) for the label and the `standard` type.
- `test/m/standards/fixture.mjs`:15 → `parseFrontmatter` from `record-grammar/frontmatter.mjs`; `proposals.test.mjs`:6 → `proposalLabel` from `labels.mjs`.
- No standards file imports `bio-checks.mjs` (grep clean). The names are the same functions the catalogue re-exported, so no behaviour changed. No old suite deleted (K619).

**Deferred:** none.

**Found in another module / for BOB:** `standards` no longer imports `legacy-checks` at all, so `modules.json` `uses` can drop `legacy-checks` (record-grammar is already listed), and `build/requirements/standards.md` still names `legacy-checks` for `isMachineIdentity`, `proposalLabel` and the `STD-` registration (Uses; R9 text) — now `record-grammar`'s. Both are BOB's files.

**Tests and checks:**
- `node --test bio-plane/test/m/standards/`: tests 18, pass 18, fail 0. No layer tests are named in `build/manifest.md`.
- `format`: 87 modules, 82 requirements files; 0 failures.
- `architecture standards`: 8 product files, 29 relative imports; 0 failures.
- `coverage standards`: 17 of 17 live requirement ids named by a test; 0 failures.
- `ownership standards tranche/T19`: 4 files changed; 0 failures.

Size (session_012Sj9LjeX3usEuvfF2Fjxjy): test runs 2, module lines 5
