# inquiry (T50)

**Status** · session_014X2CqwZzjbc37AadwJA32T · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied (T50-11)**
- **R65** `partitionOf({id, viewer})` and `op=inquirypartition` (`inquiryOps`). Answers `{ok, id, grouped, groups, ungrouped, changes, strength_now}` plus R60's `projects`. `groups` and `ungrouped` come from the document (`partition.mjs: partitionOfDoc`). `changes` are the `ground` acts oldest first: an act made now keeps both strength pairs in the new table `inquiry_ground_changes`, written in the same transaction as the promotion (`ground` now runs its promotion inside `record.transact`); an act made before is read from the Session Log (`partition.mjs: loggedChanges`) with only the pair before, `strength_after: null`, `strength_after_recorded: false`, never computed. Where no module answers strength, `strength_now` is null and `strength_absent` says so (by key). An invisible or non-question is answered as an absent one (`NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`); a divided or published question is read.
- **Plan rule 6.** The 33 keys of this module's `reads` in `words-reads.json` now go through `word(key, vars)`: the 11 refusal rows in `checks.mjs` (`refusal.<CODE>`), `question.refused.drawnon`, the person warning's translation, and every sentence in `index.mjs` and `grammar.mjs` that held one (`next`, `set_section`, `undetermined`, `projects_undetermined`, `reevaluation_absent`, `strength_absent`, `stated.recorded_migrated_drive`, `why.time_zone_held`, the lens text, the grammar messages). The wording is the design's, so "team" holds where the old text said "group". Tests that compared English now read the key (`waits`, `bias-applied`, `facts`, `lifecycle-reads`, `projects`, `raise`).
- **Inherited red cleared:** `dispose.test.mjs` R39 ("group" against `words.json`'s "team") passes through the key.

**Deferred.** Nothing in this module. The sentences `words-reads.json` lists as `unkeyed` (refusal `detail`s beside a code) stay as they are: the shell draws `refusal.<CODE>`, never the detail.

**For BOB (REPORT)**
1. R36 lists this module's tables: it needs `inquiry_ground_changes` added (declared to purge on `bundle_id`, sight of the bundle). `promotion.test.mjs` R36 pins the list and now includes it.
2. R65's text says an act made before "answers `strength_after: null`, stated". I state it as the field `strength_after_recorded: false` (no English sentence); a `words.json` key such as "this change was made before the pair after was recorded" would let the question page say it in words (design lane).
3. `INQUIRY_WARNINGS.PERSON_IN_NO_PUBLIC_ROLE.key` is `question.warning.person`, which `words.json` does not hold; the design's key is `refusal.PERSON_IN_NO_PUBLIC_ROLE`, which the translation now reads. I left the `key` field as it is (`person-warning.test.mjs` pins it); BOB or the design lane decides whether it becomes the refusal key.
4. `words-reads.json` lists no key for the new `inquiry_ground_changes` words or for `strength_after_recorded`; it is generated from source, so the next generation picks up what `inquiry` now reads.
5. A legacy act's `groups` (from the Session Log) carry the ground and its legs only; `statement`, `asserted_by` and `at` are null, because the log does not hold them.
6. The new op `inquirypartition` is not yet declared in L11 (T50-24, T50-18). The ops-map and op-declarations tests that would name it are already red at the base (rule 5) and are the same set before and after.

**Found in another module.** None.

**Tests and checks**
- `node --test bio-plane/test/m/inquiry/`: 218 tests, 217 pass, 0 fail (one `todo`, as before); new `partition.test.mjs` names R65 (six tests: grouped then restructured with two pairs each; ungrouped; controls for an invisible, non-question, divided and published question; no strength module; a pre-table act read from the log; no write, no change from a refused act, the op).
- Tests of every module that uses `inquiry` (33 modules' test paths): 3,984 tests, 3,944 pass, 31 fail; the same 31 fail at this branch's base (`HEAD~1`, run in a worktree), none new: `action-plans/t46`, `affordances/t36`, `answer-envelope/catalogue-end`, `families`, `case-account/t46`, `case-disclosures/documents`, `photos`, `conformance/t36`, `t46-words`, `consequences/t46`, `hypotheses/notes`, `op-declarations/t33 t34 t37 t38 t45 t46 t47 t48`, `plane/roster`, `scheduler/plane`, `store-door/routes` (rule 5 / rule 14 reds of other modules).
- `node checks/format.mjs bio`: 171 modules, 170 requirements files; 0 failures.
- `node checks/architecture.mjs bio inquiry`: 37 product files, 128 relative imports; 0 failures.
- `node checks/coverage.mjs bio inquiry`: 1 modules, 56 of 56 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs bio inquiry tranche/T50`: 0 failures (files: `bio-plane/src/inquiry/`, `bio-plane/test/m/inquiry/`, this record).
- `node checks/run.mjs bio`: architecture 0 failures; format 0; coverage's 38 failures are other modules'; none names `inquiry`.

Size (session_014X2CqwZzjbc37AadwJA32T): test runs 12, module lines 3,937

## J1 · COMPLETE

T50-11 inquiry COMPLETE on job/T50/inquiry: R65 partitionOf and op=inquirypartition met (partition.test.mjs names R65); plan rule 6 done for the module's 33 read keys (words by key, 'team'); inherited dispose R39 red cleared. Checks: format, architecture, coverage (56 of 56), ownership 0 failures. Module tests 217 of 218 pass (one todo); users' tests: the same 31 reds as the base, none new. Record has the REPORT items: (1) R36 needs the new table inquiry_ground_changes; (2) R65's 'stated' for a pre-table act is the field strength_after_recorded:false, no English, so a words key would let the page say it; (3) INQUIRY_WARNINGS key question.warning.person is not in words.json; (4) op inquirypartition awaits L11 declarations (T50-24, T50-18), the ops tests already red at base. Module lines 3,937 (under 4,000).
