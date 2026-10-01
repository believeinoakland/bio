# basis-versions (T21)

**Status** · session_01PhpTLeguue11UqsuKUrqaP · depth 2 · COMPLETE · handled B1

## Completion (BASIS-VERSIONS #8)

**Entries applied.**
- **N458** (K899 (1)): I re-scanned my paths first. The scan found exactly BOB's two lines; every other "bundle" is an identifier, SQL, `bundle.md` or a comment. `grammar.mjs` C-25.10's finding now reads "… is not a canonical record id"; `index.mjs` `NO_CONCLUSION`'s detail now reads "… would produce a record the catalog rejects". No test pinned the old words. Two new assertions now pin the new ones: `grammar.test.mjs` R3 checks the finding's whole message, and `conclude.test.mjs` R16 checks the detail says "record" and never "bundle". Negative control: with the old words restored, exactly those two tests failed (116/2); the files were then restored.
- **N468** (K923): `index.mjs`'s R47 comment no longer names `src/plane/held.mjs`. It says plane registers the source under this module's name through record-core's `registerCounts` (`src/plane/stats.mjs`), and that this module registers nothing itself. `t20-figures.test.mjs`: the header, the helper (`heldCopy` → `stated`) and its comment, the `hid` comment, the two test titles and the five messages now word the pinned count as R47's own statement, not plane's held copy. The pinned values are unchanged.
- **N469** (K931): `checks.mjs`:665 no longer cites `civicos-ui/check-refusal-codes.mjs`; the no-new-family reason now points at control-plane's CHECK_FAMILIES (its R22, `families.test.mjs`). `grammar.mjs`:288 no longer says `hygiene.test.mjs` (D1) reads the guard's shape; it keeps the reason for two independent `if`s and names `sufficiency-state.test.mjs` (R3), which proves both arms. The header of `d216-sharing.test.mjs` is provenance and stays. My re-scan found more stale live claims:
  - `grammar.mjs`:352: "enforced by `versions.test.mjs`" is dropped. The old suite is deleted, and the module suite does not pin source text.
  - `checks.mjs`:83–91: "NOTHING WRITES THIS VALUE AND NO GATE CONSUMES IT … pinned in `test/sufficiency-state.test.mjs`" was false. C-25.6 consumes the value and `versionAsWritten` writes it. The note now says where it is wired and which module tests prove it (`sufficiency-state.test.mjs` R3/R6, `grammar.test.mjs` R5).
  - `checks.mjs`:402–406: "the suite pins the count" is dropped. No module test pins source counts.
  - `index.mjs`:650 no longer cites `test/versionstate.test.mjs` as what pinned one implementation.
  - `versionstate.test.mjs`'s header said three of its tests assert what "the module does not meet". All three pass, so it now says they were reported and have since been met.
  - Notes placing live code in the retired `store.mjs` or the catalogue: `grammar.mjs`:169 (`versionNeedsReason` is now imported by `./index.mjs`), `checks.mjs`:296–301 (the freeze runs in this module's promotion check), :304 and :366 (the "WHAT A `where` MEANS" block was the retired catalogue's, not this file's), :596 (the cycle walk is inquiry's `cyclePath`).
  - No prose names "the battery" as what runs today. `grammar.mjs`'s "went red on this item's first battery" is now "once went red". The "carried from the old battery's …" headers are provenance and stay.
- Paths: 3,506 lines in `src/basis-versions/` (were 3,513).

**Deferred:** none.

**Found in other modules / generated artifacts (REPORT J1):**
- Stale: the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs`, because `bio-plane/src/basis-versions/grammar.mjs`, `index.mjs` and `checks.mjs` changed.
- `build/requirements/basis-versions.md`, Suggestions, "One implementation": it says `test/versionstate.test.mjs` pins one `#moveVersionState`, but that file was deleted in T20 and no module test pins source text. The suggestion binds nothing, but the note is stale (BOB's file).

**Tests and checks.**
- `node --test test/m/basis-versions/`: tests 118, pass 118, fail 0. Baseline before the change: 118/118.
- `node --test test/m/basis-versions/ test/m/inquiry-grammar/ test/m/inquiry/ test/m/plane/`: tests 334, pass 333, fail 0, todo 1 (inquiry R31, MK-5, not mine).
- `node --test test/m/` (bio-plane): tests 4685, pass 4623, fail 42. These are the same failing suites CONNECTIONS #9 measured on the unchanged base: filings, project-stage `stage.test.mjs`, intent `grammar.test.mjs` and control-plane `catalogue-end.test.mjs`. None is in my paths or reads my changed text.
- format: 86 modules, 84 requirements files; 0 failures. architecture: 23 product files, 79 relative imports; 0 failures. coverage: 44 of 44 live requirement ids named by a test; 0 failures. ownership: 8 files changed by basis-versions between tranche/T21 and HEAD; 0 failures.

Size (session_01PhpTLeguue11UqsuKUrqaP): test runs 6, module lines 3506

## J1 · REPORT

Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs (src/basis-versions/grammar.mjs, index.mjs, checks.mjs changed). For BOB's file: build/requirements/basis-versions.md Suggestions 'One implementation' names test/versionstate.test.mjs as pinning one #moveVersionState; that file was deleted in T20 and no module test pins source text (the suggestion binds nothing; the note is stale). Pre-existing red, not mine: test/m 42 fails in filings, project-stage stage, intent grammar, control-plane catalogue-end (the set CONNECTIONS #9 measured on the base).

## J2 · COMPLETE

N458: grammar.mjs C-25.10 'canonical record id', index.mjs NO_CONCLUSION 'would produce a record'; pinned by new assertions in grammar R3 and conclude R16 (negative control: old words fail exactly those two). N468: index.mjs R47 comment names plane's registration via src/plane/stats.mjs, held.mjs gone; t20-figures header, helper, titles and messages worded as R47's own statement. N469: checks.mjs:665 re-pointed to control-plane R22; grammar.mjs:288 hygiene claim dropped, names sufficiency-state R3; also versions.test.mjs claim (grammar.mjs:352), sufficiency note 'nothing writes it' (checks.mjs:83-91, now where it is wired), 'suite pins the count', index.mjs:650, versionstate header's stale not-met claim, and store.mjs/catalogue placements corrected. Nothing deferred. test/m/basis-versions 118/118; test/m no new red (42 = base). format, architecture, coverage (44/44), ownership: 0 failures. Record: build/jobs/T21/basis-versions.md on job/T21/basis-versions.
