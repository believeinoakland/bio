# ratification (T21)

**Status** · session_01WPpTMc1dBqF38iqe9fWMdR · depth 2 · WORKING · handled B1

RATIFICATION #13, T21 layer 8. Worked on `job/T21/ratification` as BOB created it from `tranche/T21`; no merge was needed (BOB changed no file I read). Comments only: no behaviour, test assertion or requirement changed.

## Entries applied

- **N469 (B1): notes naming a file T20 deleted as live.** BOB's three live notes re-worded: `checks.mjs` (C-2.8's repair-route note) now says the old `repair-reachability.test.mjs` *was* the instrument that found the line (provenance, "found by"; no requirement of mine states repair reachability, so no test is owed); `ops.mjs` (C-32.13's guard) names the old `hygiene.test.mjs` D1 as the rule's source and R2's and R18's tests as what drives the fence now; `ops.mjs` (the reuse-verdicts silence) re-pointed from `plane-envelope.test.mjs` to R6's test of that silence (`converted-c.test.mjs`, ratify-envelope site 8). The re-scan found five more live notes: `ops.mjs` named `test/case-opened.test.mjs` as asserting the `case` block's pick, re-pointed to R6's tests (`converted-d.test.mjs` REC-58, `ratify-op.test.mjs`), which assert the block's keys are exactly the five named and `opened` absent; `checks.mjs` said "the suite asserts" C-41's rehomed arms by name (twice), re-pointed to R8's tests (`checks.test.mjs`, `converted-c.test.mjs`); `checks.mjs` said the suite asserts the member roles agree by parsing the schema and named `store.mjs`'s `Store.MEMBER_ROLES` (`store.mjs` is gone; the list is case-authoring's `MEMBER_ROLES`): now past tense, with R8's and R9's tests pinning the two terms; `checks.mjs` "see the reopen arm in the suite" now past tense (`op=reopen` is not mine); `index.mjs` "every publishing caller in the battery" now "the old test battery had". The four `converted-*.test.mjs` headers said the old suites "stay in place": now "were not deleted by this job (K619)" (all but `test/mk6-bundle-names-no-author.test.mjs` are gone). Provenance kept as is: `checks.mjs` C-53 and C-58 rows' "measured before" notes (`test/mk1-publish-probe.mjs`, `test/ratify-authority.test.mjs`), the same in `ops.mjs`, `release.test.mjs`'s "converted from the old battery's", `retire.test.mjs`'s "converted at legacy-store's interface", the converted headers' suite lists.
- **K966: `node tools/mintid.mjs`.** `checks.mjs`'s note on `CASE_DOCUMENT_FAMILY` (reason (1)) said the tool reads this file for the `C` floor; it is now past-tense provenance ("the old process's `tools/mintid.mjs`, retired with `tools/` in T19, read…"). Reason (2) stands, re-pointed to R8's tests.
- No requirement of mine carries a `not yet met: T21` mark.

## Deferred

None.

## Found in other modules (REPORT J1)

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) bundle `bio-plane/src/ratification/` (comment text only); regenerate at the layer close.
2. **case-authoring (improvement):** its `MEMBER_ROLES` (`case-authoring/index.mjs`:92) and this module's `CASE_MEMBER_ROLES` are the same vocabulary written twice, and since the old suite went nothing asserts they agree. case-authoring uses ratification, so its test can assert `MEMBER_ROLES` deep-equals `CASE_MEMBER_ROLES` (or import it, Decided 4's pattern for `SUBJECT_POSITIONS`).

## Tests and checks

- `node --test test/m/ratification/` (in `bio-plane/`): **181 pass, 0 fail**. `build/manifest.md` names no layer tests. No provided service changed.
- `format`: 86 modules, 84 requirements files, 0 failures. `architecture ratification`: 22 product files, 97 relative imports, 0 failures. `coverage ratification`: 33 of 33 live ids named by a test, 0 failures. `ownership ratification tranche/T21` (after commit): 8 files changed, 0 failures.

Size (session_01WPpTMc1dBqF38iqe9fWMdR): test runs 1, module lines 3770

## J1 · REPORT

Found in other modules (record, 'Found in other modules'): (1) stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) bundle bio-plane/src/ratification/, whose comment text changed; regenerate at the layer close. (2) case-authoring improvement: its MEMBER_ROLES (case-authoring/index.mjs:92) and ratification's CASE_MEMBER_ROLES are one vocabulary written twice; since the old suite went nothing asserts they agree. case-authoring uses ratification, so its test can assert they are deep-equal (or import CASE_MEMBER_ROLES, Decided 4's SUBJECT_POSITIONS pattern).

## J2 · COMPLETE

B1 applied, comments only. N469: BOB's three live notes re-worded (checks.mjs repair-reachability as 'found by' provenance; ops.mjs hygiene D1 as the rule's source with R2/R18 tests driving the fence; ops.mjs plane-envelope re-pointed to R6's converted-c site-8 test). Re-scan found five more: ops.mjs case-opened.test.mjs re-pointed to R6's converted-d/ratify-op tests; checks.mjs 'the suite asserts' C-41 arms by name (x2) re-pointed to R8's tests; checks.mjs member-roles note (store.mjs gone; now case-authoring's MEMBER_ROLES) past tense; 'reopen arm in the suite' past tense; index.mjs 'the battery' past tense. converted-a..d headers: old suites 'were not deleted by this job (K619)'. K966: CASE_DOCUMENT_FAMILY's tools/mintid.mjs reason now past-tense provenance. Provenance notes kept. Tests 181/181. format, architecture, coverage (33/33), ownership (8 files) 0 failures. Deferred: none. Record: build/jobs/T21/ratification.md.
