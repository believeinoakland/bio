# basis-versions (T23)

**Status** · session_01PQnpH2DD633o3ucuWJ5BzY · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 layer 6: N497; K1087, K1099; N469's rule; tests only).
- **N497.** `bio-plane/test/m/basis-versions/fixture.mjs`:60–:61 registered promotion's facts under the retired `"legacy-store"`. They now name the modules that provide them: `instance-setup` for `producingGroup` (`src/setup.mjs`:1940) and `publication` for `caseMember` (`src/publication/index.mjs`:2650), as content's and provenance's fixtures do. No assertion changes its meaning.
- **The re-scan** (N469, N471, N480): every file under `bio-plane/src/basis-versions/` and `bio-plane/test/m/basis-versions/` read whole. There is no other `"legacy-store"` registrant. Notes that named a retired file or module as live are re-worded, no behaviour changed:
  - `index.mjs` `basisVersionsOps`: "entries of the legacy store's op map (its dispatcher spreads them in)" now names the plane's op map, spread in by `plane`'s store (`src/plane/store.mjs`), as action-plans' note does.
  - `index.mjs` `projectQuestions` (R41): its caller is named `project-stage` R2 (was publication R45), as R41 says.
  - `checks.mjs` header: "the catalogue keeps its copies" now says it kept them and was deleted with `legacy-checks`; the sixth-machine note names record-grammar's `STATES` rather than "`STATES` above … in the file that defines the other five"; the NO_REASON/BAD_REASON note says "the old `store.mjs`".
  - `grammar.mjs` `basisVersionFindings` header: the accept-time cycle walk "is not built" is kept as said then, and corrected: built since, through `inquiry`'s `cyclePath` (C-25.27, R12).
  - Test headers: `versions.test.mjs` (`checkBundle` and the frontmatter grammar are record-grammar's, not `legacy-checks`'), `versionstate.test.mjs` (`STATES` is record-grammar's), `conclude-project-arm.test.mjs` (the inquiry machine `conclude` reads is record-grammar's table).
  - Kept as provenance: `checks.mjs`:866 ("retired with `tools/`"), the "moved from `store.mjs`"/"carried from `test/…`" origins, `scripts/coverage.mjs` "gone since T18".
- No requirement of mine carries a `not yet met: T23` mark, and none is added.

**Deferred:** none.

**Other modules:** none found. No provided service changed and no generated artifact is staled (tests and comments only), so nothing is regenerated. A note, not a defect report: `grammar.test.mjs` R36 checks three place names in the refusal translations, a sample of R36 ("no place is named in this module's behaviour or outward text"); a full check would need a stated roster of places, which no requirement gives.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/basis-versions/`: tests 118, pass 118, fail 0.
- `node --test test/m/affordances/` (builds on this fixture): tests 146, pass 146, fail 0. Green.
- `node --test test/m/`: tests 5039, pass 5024, fail 3, todo 12. The three reds are all accepted by name: control-plane `inbox-door.test.mjs` R36 (a reasoned `pulled` resolve; red 9, until control-plane's L11 merge, K1117, K1131) and queue `catalogue.test.mjs` R1 and R5 (red 13, until queue's L11 merge, K1119). No other red; test-support R2 passed in this run.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures
- `node checks/architecture.mjs … basis-versions`: 23 product files, 79 relative imports; 0 failures
- `node checks/coverage.mjs … basis-versions`: 44 of 44 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … basis-versions tranche/T23`: 8 files changed; 0 failures

Size (session_01PQnpH2DD633o3ucuWJ5BzY): test runs 5, module lines 6873

## J1 · COMPLETE

Done on job/T23/basis-versions (record 586c48f9ca). N497: fixture.mjs:60-61 now register producingGroup and caseMember as instance-setup and publication; no assertion changed. Re-scan, every file read whole: no other legacy-store registrant; notes naming retired files as live re-worded (index.mjs op-map note -> plane's store; R41 caller -> project-stage R2; checks.mjs catalogue/STATES/store.mjs notes; grammar.mjs cycle-walk note; three test headers legacy-checks -> record-grammar); checks.mjs:866 provenance kept. basis-versions 118/118; affordances 146/146 green. test/m 5039 tests, 3 fail, all accepted by name: control-plane inbox-door R36 (red 9), queue catalogue R1, R5. format, architecture, coverage (44/44), ownership (8 files): 0 failures. Nothing regenerated; no other module touched. Record: build/jobs/T23/basis-versions.md.

**B2 (CHANGE, K1138).** Already applied: the source comments re-worded above are of N469's and N502's kind (a retired file, op map or owner named as live). They are comment-only edits in `src/basis-versions/`, so the plane bundle is stale until L6's close (accepted red 12); I regenerated nothing. No code changed after B2, so the tests and checks above stand as run.
