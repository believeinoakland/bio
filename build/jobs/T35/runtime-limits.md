# runtime-limits (T35)

**Status** · session_01ENYzMG4jn6hUTZ6bBR8iNB · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T35-4 (N704, and the DEC-149 sweep's one row, `tokens.mjs`:62):
- R13: `instanceClaudeStatus`'s `detail` now reads "Your group's Civicsmith binds no Claude account to its own settings, and none can be set there. The assistant is reached through a member's own Claude account or API key, or through the group's API key that an administrator sets; each is held sealed in Civicsmith's credentials, never as a setting." It names the group's API key and `credentials` (K1755), says "Your group's Civicsmith" (DEC-149, K1847), and claims no limit of Anthropic's plans, so it cites none (K1761, K1763). The retired "a Claude subscription serves only its own holder" is gone.
- The sweep row's target text ("Your group's Civicsmith holds no Claude account, and none can be set for it") is not used verbatim: since K1755 the group's API key may be held (in `credentials`), so "holds no Claude account" would be false against R13. My reading (BOB's START: "bring it to R13/R23 and the sweep row"): R13 governs the content, the row the name. Reworded to "binds no Claude account to its own settings".
- R23: the code already read no Claude credential from `env`; the module's DS-3 comment, which still said "There is no group-wide or project-wide Claude account" and "the terms Anthropic publishes let a subscription serve only its own holder", is corrected to K1755: a member's own account or the group's one API key, both `credentials`', both Bob's choices (register "Bob's choices"; the group key permitted by AT-9).
- Tests: R13's test asserts each clause of the new detail and the absence of any subscription/limit claim; a new test "R13 (DEC-149 sweep, tokens.mjs:62)" names the string and asserts no "the plane", "the instance", "copy" or "This group's"; R23's comment cites K1755. R16, R17, R21–R23 unchanged and green.

**Deferred.** None.

**Found in other modules / generated artifacts (REPORT J1).** The old detail string is embedded in generated bundles that include `tokens.mjs`, now stale: the plane bundle (`bio-plane/dist/`, and `release/bio-plane.bundled.mjs`), `newgroup/src/release.mjs` (a generated bundle string), and `agent-worker`'s bundle (inputs include `tokens.mjs`). Not written by this job (§14); regenerated at the layer close. No caller pins the detail text (grep over `bio-plane/src`, `bio-plane/test`, `agent-worker/src`). The requirement marks `*(not yet met: T35)*` on R13 and R23 are BOB's to strike at merge.

**Tests and checks.**
- `node --test bio-plane/test/m/runtime-limits/`: tests 25, pass 25, fail 0. No layer tests named in `build/manifest.md`. No provided service's interface changed (text of `detail` only), so no user's tests are owed.
- `format.mjs`: 129 modules, 128 requirements files; 1 failure (accepted red 13, test-support's `make-zip.mjs`).
- `architecture.mjs runtime-limits`: 3 product files, 3 relative imports; 0 failures.
- `coverage.mjs runtime-limits`: 24 of 24 live requirement ids named by a test; 0 failures.
- `ownership.mjs runtime-limits tranche/T35`: 3 files; 0 failures.

Size (session_01ENYzMG4jn6hUTZ6bBR8iNB): test runs 3, module lines 281

## J1 · REPORT

Stale generated artifacts (§14), not written by me: tokens.mjs's R13 detail string changed, so the plane bundle (bio-plane/dist and release/bio-plane.bundled.mjs), newgroup/src/release.mjs and agent-worker's bundle carry the old text until L1's regeneration. No caller pins the detail text. Also: the sweep row's target 'Your group's Civicsmith holds no Claude account' contradicts R13 since K1755 (the group's API key may be held); I kept the name and followed R13: 'binds no Claude account to its own settings'. Details in my record.

## J2 · COMPLETE

T35-4 applied: R13 detail and R23 to K1755/K1761 with the DEC-149 sweep string; 25/25 tests; format 1 failure (accepted red 13), architecture/coverage (24/24)/ownership 0 failures. Record: build/jobs/T35/runtime-limits.md on job/T35/runtime-limits.
