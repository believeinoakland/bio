# public-read (T48)

**Status** · session_01EUHjhURjxtZgVYaLZuARnQ · depth 2 · WORKING · handled B1

## Completion (PUBLIC-READ #22)

**Entry T48-40 applied.** The code already met both clauses (`labelKeyOf` / `photoKeyOf` in `bio-plane/src/public-read/index.mjs`: a stated `marked` decides a photo's key, a label that is not null reads marked only where the row states no mark; a `kind` written null reads as none and falls to the frozen-words rule). What was missing was the confirming tests, now added:
- `label-key.test.mjs`: "R3 (T48; N1021; K3114) …": `marked: false` under any non-null label keys `photo.published.label`; `marked: true` under a null label keys `photo.obscured.label`; control: the same label with no stated mark reads marked.
- `cleaned-key.test.mjs`: "R35 (T48; N1021; K3114) …": a row whose `kind` was written null keys as a row stating none (frozen words → `document.cleaned.label` whatever the mark; any other label by R3's rule); control: a stated `photo` kind under the frozen words keys by the photo rule.
- The requirement text (R3's "by `case-grammar` R12's `marked`", the removed "(proposed, `case-carriage` R15)") is BOB's and was already in the requirements file; nothing in the code cites the stale phrase.

**K3261:** the member-facing sentence `GROUP_FIELDS_CURRENT_SENTENCE` now reads "labeled current" (was "labelled"); comments and test titles in the module re-spelled alike. No test asserts the old word.

**Read in full:** `build/requirements/public-read.md`, `bio-plane/src/public-read/index.mjs` lines 1–700 (every part touching R3/R35 and the whole label-key path), and the two test files above. The rest of the module (index.mjs 700 on, door, casefile, checks, courtorders, credit, reads, Worker, container, inband and their tests) was NOT re-read whole in this job: the entry changes no behaviour there, and the 198-test module run covers it. Deferred: nothing found needing a change. Reading set: no helpers used; requirements and the code on the entry's path read whole, the remainder over the 600 KB limit left to the module tests.

**Found in another module:** generated `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed the old "labelled current" sentence; stale until `bundler` regenerates them (mechanics §14).

**Tests and checks:** `node --test bio-plane/test/m/public-read/` → tests 198, pass 198, fail 0. `node checks/format.mjs` 0 failures; `architecture.mjs public-read`: 53 product files, 0 failures; `coverage.mjs public-read`: 35 of 35 live ids named, 0 failures; `ownership.mjs public-read tranche/T48`: 0 failures. `checks/run.mjs`: format 0, architecture 0 (3293 files), channels 0; coverage 33 failures in other modules only (none in public-read).

Size (session_01EUHjhURjxtZgVYaLZuARnQ): test runs 4, module lines 2559
