# skills (T12)

**Status** · session_017ADskrBCe842675giyNPhU · depth 2 · COMPLETE · handled B1

## Completion (SKILLS #4)

**Entry applied** (layer 6; K381, N299's consequence). `test/m/skills/doctrine.test.mjs` R15's `keyedNumbers()` now also reads ai-runs' own `AI_RUN_CHECKS` (through `airun.mjs`, already imported there), where C-22.7 is held since layer 1 removed the catalogue's copy. The clause `the-run-says-what-it-ran-under` cites C-22.7 by key (`SKILL_CHECKS`, ai-runs' row), and that number is again found among keyed rows. Skills is back to 31/0.

**`version.test.mjs`, checked as B1 asked.** Its header (line 9) said the catalogue keeps a distinct copy of C-22.7 until T12, and the second R25 test compared ai-runs' row with the catalogue's `AI_RUN_CHECKS` copy only `if` one existed. After N299 that branch never ran, so the test asserted nothing about the copy. It now says the copy left (N299, K381) and holds R25's "held with its one minting site" in full: no catalogue family carries the code `AI_RUN_SKILL_VERSION_UNNAMED` or a row numbered C-22.7. The first R25 test is unchanged: `SKILL_CHECKS`' row is ai-runs' row, and it is the one `checkSkillVersion` mints.

**Module source:** unchanged (`skillpack.mjs`, `skilldoctrine.mjs`). So no generated artifact is stale: the agent-worker bundle's inputs are the same.

**Deferred:** one flaw in this module's own comment. `skilldoctrine.mjs` (the note above `CLAUSES`) says "the suite asserts the catalogue's source still pushes this number [C-2.8] on a hunch with no author". The suite does not do this, and it cannot do it at the interface (P7 forbids source-text tests). What the suite does hold is that C-2.8 has no keyed row (R15). The fix is a comment edit. I left it for a job that changes this file's code anyway: on its own, the edit would stale `agent-worker/dist/agent-worker.bundled.mjs`, whose inputs include this file (mechanics §14).

**Other modules:** nothing found. **`not yet met` marks:** none met by this work; R10 (SK-5) is still unmet in the product.

**Tests and checks** (on `job/T12/skills`, the working tree of this commit):
- `node --test bio-plane/test/m/skills/`: tests 31, pass 31, fail 0, todo 0.
- Layer tests: none named in `build/manifest.md`. No provided service changed.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture skills`: 6 product files, 29 relative imports; 0 failures.
- `coverage skills`: 26 of 26 live requirement ids named by a test; 0 failures.
- `ownership skills tranche/T12`: 3 files changed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_017ADskrBCe842675giyNPhU): test runs 3, module lines 2190
