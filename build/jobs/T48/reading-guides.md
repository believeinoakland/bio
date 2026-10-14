# reading-guides (T48)

**Status** · session_018odTxsr93zd9rhZFcRLGLi · depth 2 · WORKING · handled B1

## Completion

**Read, whole:** `build/requirements/reading-guides.md`; the public part of doctypes, record-grammar, civil-time, record-core, membership and jurisdictions; layer 6's contract and the T41 investigation-engine section of `build/layers.md`; my entry T48-33 and rule 5's D, 17 line in `build/plan/current.md`; DEC-221 in `DECISIONS.md`; every file of my code (`index.mjs`, `check.mjs`, `checks.mjs`, `library.mjs`, `schema.mjs`) and tests (`fixture.mjs` and eight test files) (P20).

**Entry applied:** T48-33 (N1053; DEC-221; K3192, K3195).
- `READING_GUIDES_WORDS["refusal.GUIDE_KIND_UNKNOWN"]` (`checks.mjs`:19) re-taken from `words.json` as it stands: "recognize", not "recognise". That clears the 2 reds (`t46-words.test.mjs`: the words-by-key test and the acts test). C-144.4's code, number and `where` are unmoved.
- P8, the same rule applied to this module's own words. DEC-221 makes Civicsmith's own words American English, so:
  - C-144.13 `GUIDE_NO_GROUP_SLUG`'s translation reads "labeled" (was "labelled");
  - its `detail` reads "cannot be labeled";
  - R12's `GUIDE_PROPOSAL_STATES.machine_proposed` reads "labeled as machine work".
  - Comments were re-spelled too ("labeled", "normalized").
  - No requirement names the old wording. No other module holds a copy of C-144.13 or of the proposal label (checked by grep).
  - The row census changes by C-144.4 and C-144.13, accepted until T49's stamp (BOB's note, rule 5 (2)).

**Tests:**
- `t46-words.test.mjs`'s pin of the 17 kept rows moved to the new sha256. The test also proves the change is only the one word: with "labelled" put back into C-144.13, the rows hash to T45's pin.
- New test "R14 R11 R12 DEC-221". It checks that every `READING_GUIDES_WORDS` entry, row translation, proposal label and the procedure label, plus the two refusals' answered `detail`s, holds none of DEC-221's swept British spellings. Its control: the same pattern catches the pre-T48 words.

**Deferred:** none. No flaw found in my code or tests beyond the above.

**Found in another module:**
- `record-grammar`'s `PROPOSAL_STATES` and `labels.mjs` still say "labelled as machine work" in member-facing proposal labels. So do sentences in `action-records`, `actions`, `action-clocks`, `case-checker`, `skilldoctrine.mjs` and `setup-words`' copies. That is against DEC-221 (American English in every member word). The requirement texts (`record-grammar` R42, R49, R50, R54, R60, R61; this module's R2, R6, R12) also spell it "labelled". Reported to BOB.
- The bundles `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` carry this module's source and are now stale (manifest: BOB regenerates at the layer close).

**Tests and checks run:**
- reading-guides `node --test test/m/reading-guides/`: tests 58, pass 58, fail 0. Before the change, 2 failed: the T48-33 reds.
- Users whose tests name C-144 or reading-guides (`stats-disclosure`, skills, affordances t41-backing, plane t41, op-declarations, answer-envelope, plan-work, op-grades t41): pass 371, fail 12, identical with and without this change (run on a stash of it). All 12 are in op-declarations (registry and owed-act tests R19, R21, R27, R51, R52, R54/R60) and answer-envelope `families.test.mjs`, none about this module's words: inherited.
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs … reading-guides`: 14 product files, 46 relative imports; 0 failures.
- `node checks/coverage.mjs … reading-guides`: 14 of 14 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … reading-guides tranche/T48`: 5 files changed; 0 failures.
- `node checks/run.mjs` over the product: architecture 0 failures (3286 files); format and channels 0 failures; coverage 37 failures, all other modules' (none reading-guides').

Size (session_018odTxsr93zd9rhZFcRLGLi): test runs 5, module lines 1160
