# interface-assets (T51)

**Status** · session_01R7mgwF3p8Gdc1KqYeCZURA · depth 2 · WORKING · handled B1

## Completion (T51-112)

**Entries applied.**
- `ASSETS_COMMIT` re-taken at `20c8001300`, the design's last merge into `tranche/T51` (DEC-353, DEC-354), in `generate.mjs`; `index.mjs` regenerated. This clears the 4 inherited reds (`assets.test.mjs`:142, :294, :406, :436: `civicsmith.css` differed from git).
- The three icons `i-document`, `i-due`, `i-sever` arrive with it (`icons.svg`, DEC-335 (4)); `.mk-sort` is 32 px; `.st-j` to `.st-l` are switched; no screen carries its own style (every class the five drawings write in a `class` attribute is defined, except R10's marker list).
- R11: the team name wraps (`.mk-grp { overflow-wrap: anywhere }` in the design's page at the commit); no rule of either stylesheet cuts the name in `.cs-mast`/`.cs-pubhead`. Checked once in Chromium at 390 px with a 60-character name: the masthead wraps to two lines, the public header to its own lines, both fully inside the viewport.
- Tests: R10 and R11 each a test and a control (`assets.test.mjs`); the commit constants moved to `20c8001300`.

**Deferred.** None.

**Found against the requirements (REPORT to BOB; BOB owns the requirement text).**
1. R10's text is stale against the commit the entry names. At `20c8001300`: (a) `icons.svg` is NOT byte-identical to R9's: it holds the three icons (the entry and DEC-335 (4) say take them; R10's "holds no `i-document`…" paragraph and "No screen … draws one" read the other way); (b) `shell.css` differs from R9's in more than R10's "two places": `.mk-grp` wraps (R11), a new `.mk-screenonly` rule with an `@media print` block hiding it (DEC-338 (5), the print note on screen only: so R10's "`ASSET_FILES` carries no print rule" no longer holds; the rule is the design's own, carried by R7's transform, none is written by hand), and ten 44 px phone-width rules in the 760 px query (DEC-340). My tests assert what the commit holds. R10 should be amended to that.
2. `site`'s `SITE_COMMIT` (`7be06eb4cb`) and wizard-scripts' pin should move to the same commit (site R16, R10).

**Words.** `node checks/words.mjs` lists one finding, `generate.mjs`:114: the header comment `/* GENERATED … Never edited by hand. */` written at the top of the generated `shell.css`; a comment inside a stylesheet, read by no member, not hidden: BOB to settle with the design stream (K3944). The check over all 35 L11 modules together names no other line of this module.

**Checks and tests.** `node --test bio-plane/test/m/interface-assets/`: 22 pass, 0 fail. format: 176 modules, 175 requirements files; 0 failures. architecture: 3 product files, 4 relative imports (1 naming no tracked file, not judged); 0 failures. coverage: 11 of 11 live requirement ids named by a test; 0 failures. ownership: 0 failures. `setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match words.json and the source. No module uses a service this module provides changed.

Size (session_01R7mgwF3p8Gdc1KqYeCZURA): test runs 6, module lines 170
