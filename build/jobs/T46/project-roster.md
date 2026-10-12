# project-roster (T46)

**Status** · session_01QUJPgnjkqLzkfXN1KCUCmG · depth 2 · WORKING · handled B0

## Completion (PROJECT-ROSTER #4)

**Reading set** (mechanics §17): measured at START at 377 KB, under 600 KB; read whole myself: `build/requirements/project-roster.md` (public and private); the public part (Purpose, Provides) of each of my Uses, `membership`, `record-core`, `record-grammar`, `jurisdictions`, `test-support`; layer 2's row and contract in `build/layers.md` (with its membership-split section); the plan's entry T46-5, its L2 merge order and its rules at the opening (rule 5 as at my START); every file of `bio-plane/src/project-roster/` (`index.mjs`, `checks.mjs`, `schema.mjs`) and of `bio-plane/test/m/project-roster/` (all eight test files and `fixture.mjs`), not only what I changed (P20). The words: `docs/development/ux-substrate/screens/words.json` at main @ 3f40899950 (identical on the tranche), its eight `refusal.*` entries for C-147, and `membership`'s `HANDLE_WORDS` for the form.

**Entries applied** (T46-5; commit ec58012bd2).
- R25 (N913; DEC-194; `checks.mjs`): a new frozen `PROJECT_SCOPE_WORDS`, keyed `refusal.<CODE>`, holds `words.json`'s `en` for the eight C-147 codes verbatim; each `PROJECT_SCOPE_CHECKS` row's `translation` is `PROJECT_SCOPE_WORDS['refusal.<CODE>']`, read by key, as membership's `HANDLE_WORDS` are. Six translations change (C-147.3 `PROJECT_SCOPE_OWN_NOT_SOLE`, .4 `_UNCHANGED`, .5 `_OWN`, .6 `_KEEPS_HIDDEN`, .7 `APPROVAL_RULE_INVALID`, .8 `APPROVAL_KIND_UNKNOWN`); .1 and .2 already read as their keys. Codes, numbers and `where`s unmoved. The table is exported from the entry beside the families. `words.json` keys no other row of this module (C-56.5, C-33.28, C-70.4, C-95 checked: none keyed).
- R20 holds for the new words: none names the group's Civicsmith, and none says copy, instance, plane or server (the R20 tests run over them).

**Flaws found and fixed in this module (P8).** The entry's header named R1–R24 (now R1–R25) and held two lines past the width; `ops.test.mjs` said "ten ops" of twelve. Nothing else found: the code and tests read whole meet R1–R24 as they stand.

**Tests.** New `t46-words.test.mjs`: "R25 every C-147 row's translation is words.json's refusal.<CODE> …" (the codes, numbers and `where`s pinned; the table's keys exactly the family's; each value `words.json`'s verbatim, each row reading it by key; the six re-worded rows no longer answering T45's words) and "R25 each of the eight refusals, as its act answers it, carries words.json's refusal.<CODE> and writes nothing; each control lands with no translation" (all eight reached through `projectScopeSet`, membership's `projectInvite` and `projectVisibilitySet` through R22's guard, and `projectApprovalSet`, each beside its landing control; the rescue's relayed `PROJECT_SCOPE_OWN` the same words). Mutation check: one word altered in `checks.mjs`, both tests fail; restored, both pass.

**Ran.**
- `node --test bio-plane/test/m/project-roster/`: tests 40, pass 40, fail 0. No layer tests named in the manifest.
- Users: every test file outside my module naming `project-roster` or `PROJECT_SCOPE` (membership, case-authoring, bias, action-holds, case-account, filings and others), with answer-envelope's and promotion's suites: tests 470, pass 465, fail 5. The same five are red with my change stashed (in place): membership `module-order.test.mjs` ×3 and promotion's modules.json-order test (rule 5 (6)), and `test/system/row-census.test.mjs` (rule 5 (2)), to which my change adds six "changed with no record" rows, C-147.3–.8, for T46-6's stamp.
- Generated artifact staled (§14; not mine to write): the plane bundle, `dist/bio-plane.bundled.mjs`, from `src/project-roster/checks.mjs` and `index.mjs` (`fleetbundles.test.mjs`' bio-plane arm, green on the tranche without me); rule 5 (4), regenerated at the layer's close. `newgroup-bundle-fresh` and case-checker's `program.test.mjs` unchanged by me.
- Checks: `format` 0 failures (159 modules, 152 requirements files); `architecture project-roster` 0 failures; `coverage project-roster` 25 of 25, 0 failures; `ownership project-roster tranche/T46` 5 files, 0 failures.

**Deferred.** None.

**Found in other modules.**
- `promotion` (T46-6): the six C-147 rows C-147.3–.8 changed, to stamp.
- The plane bundle staled (rule 5 (4)).

Size (session_01QUJPgnjkqLzkfXN1KCUCmG): test runs 10, module lines 1195
