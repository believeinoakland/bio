# bias (T53)

**Status** · session_018Bhceenr6bqqxmUZKHmLrE · depth 2 · COMPLETE
**Sessions** · 2

## Completion (2026-10-28)

# T53 · bias · report

**Entries applied:** T53-166 (K5565, English in tests): converted the module's 15 regex sites in 5 files to `wordRx(key)`. Each assertion now reads the key the product reads.

**What changed**
- `bio-plane/test/m/bias/*.test.mjs`: 15 prose assertions → `wordRx("<key>")` (adopt-manifest, debt, description-draft, inhale, migrate).
- `bio-plane/src/bias/index.mjs` (one line, outside the test folder): the pinned-proposal note in `biasAdopt` read inline English that the word table already holds as `bias.note.pins_proposed_revision`. It now reads that key. The wording becomes the table's (spelling only: "authorizing" for "authorising"; otherwise the same text).

**Test result:** `node --test bio-plane/test/m/bias/*.test.mjs`: 80 tests, 79 pass, 0 fail, 1 todo (the existing todo).

**Not done / for others**
- `bio-plane/dist/bio-plane.bundled.mjs` contains the old bias note text. It is a generated bundle; the change makes it stale. Not mine to rebuild here.
- `bio-plane/src/case-checker/program.mjs` also contains the phrase "PINS A PROPOSED" (not bias-owned; not touched).
- Choice for BOB: the note's wording now comes from the word table. If the earlier spelling ("authorising") is wanted, the table row changes, not the job.

**Met** · none

Tests: 79/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhceenr6bqqxmUZKHmLrE): test runs 1, module lines 1921
