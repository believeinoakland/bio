# filing-templates (T34)

**Status** · session_01ArRabMRmWtTqbg1miUXqa9 · depth 2 · WORKING · handled B1

## Completion (FILING-TEMPLATES #4)

**Entries applied.** T34-87 (DEC-149's share; K1784, K1811), the two M rows of `plan/draft-T34-dec149.md`, each now saying "your group's Civicsmith":
- `checks.mjs` C-125.3 `TEMPLATE_PROFILE_UNKNOWN`: "A template is written for jurisdiction profiles your group's Civicsmith holds, or for none in particular (general), and a profile named is not held."
- `checks.mjs` C-125.15 `GRANT_NO_SECRET`: "A review grant opens by a secret link your group's Civicsmith makes, and none was made for this request. Nothing was granted."

**Improvement in this module.** The same refusal's `detail` (`index.mjs`, `templateReviewGrant`) said "the control plane makes the secret", a component name a member reads beside the translation; it now says "your group's Civicsmith makes the secret". The grep's pattern did not reach it ("control" between "the" and "plane"). No other member-facing string of the module names an instance, copy or plane; the header comment's "the instance clock" is a comment and stays.

**Tests.** New test in `invariants.test.mjs`, `R23 (DEC-149) …`: both translations exact; no row's translation says this/the/your/our (control) instance, copy or plane; each changed refusal as a member receives it through the interface (`templateDraft` naming an unheld profile, `templateReviewGrant` with no secret digest) carries its new translation, and the grant refusal's new detail exactly. Negative control: with the module's source reverted and the new test kept, the test fails (1 fail).

**Deferred.** None.

**Found in other modules / stale artifacts (REPORT J1).**
- promotion: `CATALOG_VERSION` (`gate.mjs`) and the row census are promotion's. C-125.3 and C-125.15 now read "changed with no record" in `bio-plane/test/system/row-census.test.mjs` (already red on `tranche/T34` from other modules' DEC-149 rewordings; these two join it) until T35's promotion stamp moves the version and re-pins `row-census-1.61.0.jsonl` (plan Rules (5) item 4). No control-plane catalogue-end pin names a C-125 row.
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale from this change, for BOB's regeneration at the layer's close.

**Tests and checks run.**
- `node --test bio-plane/test/m/filing-templates/`: tests 48, pass 48, fail 0.
- Users (wording only, run anyway): skills 67/0, wizard-scripts 39/0, queue 124/0; filings 63 pass 1 fail (`chronology.test.mjs`:63, K1795's named red); affordances 189 pass 3 fail (`t33-backing.test.mjs`:122 and :212, `t33.test.mjs`:135, K1805/K1807's named reds). None names filing-templates.
- `node --test bio-plane/test/system/row-census.test.mjs`: red before and after (the accepted red above), now also naming C-125.3 and C-125.15.
- `format`: 127 modules, 126 requirements files; 0 failures.
- `architecture filing-templates`: 10 product files, 32 relative imports (0 naming no tracked file, not judged); 0 failures.
- `coverage filing-templates`: 25 of 25 live requirement ids named by a test; 0 failures.
- `ownership filing-templates tranche/T34`: 4 files changed by filing-templates between tranche/T34 and HEAD; 0 failures.

Size (session_01ArRabMRmWtTqbg1miUXqa9): test runs 10, module lines 1719

## J1 · REPORT

Outside filing-templates, from T34-87 (detail in my record's Completion). (1) promotion: C-125.3 and C-125.15 translations changed, so row-census.test.mjs names them 'changed with no record'; that test was already red on tranche/T34 from other modules' DEC-149 rewordings, and these two join it until T35's promotion stamp moves CATALOG_VERSION (gate.mjs) and re-pins (plan Rules (5) item 4). No control-plane catalogue-end pin names a C-125 row. (2) bio-plane/dist/bio-plane.bundled.mjs is stale from this change, for your regeneration at the layer's close.
