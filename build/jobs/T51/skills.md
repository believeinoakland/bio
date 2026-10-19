# skills (T51)

**Status** · session_0134uPdGVVH9yPojtvVd8szX · depth 2 · COMPLETE · handled B4

## Completion (T51-135)

- **Entry applied as far as the canon allows: no code change.** `skilldoctrine.mjs`' clauses are spans of `BIO_Action_v0_2.md` §4, `BIO_Publication_v0_1.md` §5A, `BIO_Interaction_Constructs_v0_1.md` §L and P, `BIO_Assistant_and_AI_Roles_v0_1.md`, `ASSISTANT-PILOT.md`. I merged `tranche/T51` (DEC-281, c2b8b5802b) and searched each source: none of those sentences says "team" for the people of a Civicsmith. DEC-281 (Interaction Constructs §L, line 838) rules that words people read say "team", keeps "group" in identifiers, and states "Where this document says 'group', members read 'team'": the canon sentences were left saying "group". Each clause whose canon still says "group" for the team stays as it is (BOB's note 1). The remaining "team" hits in canon are Anthropic's Team plan (Roles line 103), not the group.
- **Pack's own words** (task descriptions, `load_when` and `absent_because` of R39, R49 and others, not clauses; R21 binds clauses only) still say "group" for the team. They are text a run reads, not words people read; left as they are, noted for BOB.
- **Digest and pin tests (BOB's note 2):** nothing moved; the pack's version is unchanged. `node --test bio-plane/test/m/skills/`: tests 130, pass 130, fail 0.
- **Deferred:** none.
- **Found in other modules:** none. REPORT to BOB (canon wording belongs to the design stream): the clause sources above still read "group" for the team; once the canon sentences are re-worded to "team", this job (or a successor) re-spans the clauses, the pack's version then moves.
- **Checks:** format 174 modules, 0 failures; architecture (skills) 19 product files, 0 failures; coverage (skills) 51 of 51 live ids named, 0 failures (full-product coverage shows 24 failures in other modules, none skills); ownership: 1 file changed by skills, 0 failures; channels 0 failures.

Size (session_01K9Zb4DmgqUt5XwdxVRzjzu): test runs 3, module lines 0

## J1 · REPORT

T51-135: no clause re-spanned. Canon sources (Action v0.2 §4, Publication §5A, Constructs §L/P, Roles, PILOT) still say 'group' for the team; DEC-281 rules members read 'team' where canon says 'group'. Per your note 1 the clauses stay; canon wording is the design stream's. Pack version unchanged; skills tests 130/130.

## J2 · COMPLETE

T51-135 complete, no code change; details in my record. Checks: format, architecture, coverage (skills 51/51), ownership 0 failures. Tests 130/130.

## Completion (T51-219)

- **Entry applied: the words pass.** The live words check (`checks/words.mjs` at civicos-process 4ec1c4c) reads 23 failures for `skills`: 6 inline, 2 plain, 15 test copies. The job's words-pass file lists 38; each site it lists that is still a literal is converted too. Every one is fixed, and the words check now reports 0 failures for `skills` in every arm.
  - **Inline and plain sentences** (`bio-plane/src/skilldoctrine.mjs`): each sentence written as a `+`-joined chain of literals is one `localize("skills.skilldoctrine.<slug>", "<en>")` call, where the slug is the sentence's first five words, as the module's existing ids are. 29 chains converted; each `en` is byte-identical to the text it replaces. A section label such as `"§5"` is not a sentence and is left alone. The one sentence with a literal `{name}` (the word-list placeholder rule) passes `{ name: "{name}" }`, so the placeholder comes back as written.
  - **Test copies** (`bio-plane/test/m/skills/`, 15 sites): no test holds a product sentence now. Each refers to the product's value instead:
    - `action`: the status-report load-when is imported as `STATUS_REPORT_LOAD_WHEN` (now exported); R45's stated absence is checked for the three act ids it names (see deferred).
    - `ask`: `DEC27` is `DEC27_LIMIT.text`, the product's own clause (now exported).
    - `boundary`: the gloss is checked against `RESEARCH_BOUNDARY_NOTE`; the changed-word control is a regex.
    - `edition`: the test's own copy of R31's two clauses is removed; the count, the order and the §5A lookup use `EDITION_STATEMENT_CLAUSES`.
    - `filing`: the v0.1 rule 7 control checks `ruleText(7)` for the phrase `transmits nothing`, not the sentence.
    - `pack`: the assertion message no longer copies the en of a `localize` call.
    - `readtranslation`: the relabelled test act carries a sentinel label, not the product's label.
    - `version`: R25's C-22.7 translation is checked as verbatim text in run-rules' own source (`foundIn` on `bio-plane/src/run-rules/checks.mjs`), not as a copy in the test.
- **Exports** (`skilldoctrine.mjs`): `STATUS_REPORT_LOAD_WHEN` and `DEC27_LIMIT` are exported; nothing else changed in the export surface. Before and after the edit, both modules' exports were dumped as JSON: every existing export is identical, and the two additions are the only difference.
- **Deferred, and why** (for BOB):
  1. R45's stated absence (`action_drafting`'s `absent_because`) is no longer compared verbatim with a copy of the sentence. Its wording is a `localize` en with no `words.json` row, so no key can name it; a verbatim check would copy it. A keyed row for this sentence would let the test assert the key.
  2. R25's C-22.7 translation has no `words.json` row either (run-rules' `localize`). The test checks it verbatim in run-rules' source instead; the same keyed row would replace that check.
  3. `STATUS_REPORT_LOAD_WHEN` is an instruction read by AI runs, not by a member, and was not flagged; it stays a plain constant, now exported. Listed for BOB to settle with the design stream (K3944).
- **Found in other modules:** none.
- **Checks:**
  - `checks/format.mjs` (full run): 0 failures.
  - `checks/architecture.mjs bio skills`: 19 product files, 0 failures.
  - `checks/coverage.mjs bio skills`: 51 of 51 live ids named by a test, 0 failures. The full run shows coverage failures in other modules only, none in `skills`.
  - `checks/ownership.mjs bio skills tranche/T51 job/T51/skills`: 0 failures.
  - `checks/run.mjs bio` (full run): architecture 0 failures; channels 0 failures; words 3,346 failures across the tree, none in `skills`.
  - `bio-plane/src/setup-words/build.mjs --check`: `rows.mjs` is stale, as expected; the stale-row note names a `skills` row, which is not a refusal. BOB regenerates it at the layer close.
- **Tests:** `node --test bio-plane/test/m/skills/*.test.mjs`: 130 pass, 0 fail (130 pass before the change).

Size (session_0134uPdGVVH9yPojtvVd8szX): test runs 3, module lines 2919

## J3 · COMPLETE

T51-219 · skills complete (commit c092cbc8c8, pushed to job/T51/skills).

Words pass, as the live check reads it (23 failures at start: 6 inline, 2 plain, 15 test copies): all fixed; words check for skills 0 failures.
- skilldoctrine.mjs: 29 literal chains converted to localize(id, en); en byte-identical; exports unchanged except two added (STATUS_REPORT_LOAD_WHEN, DEC27_LIMIT), checked by dump before/after.
- 15 test copies in bio-plane/test/m/skills/ now refer to product values or key-level checks.

Deferred for you (BOB), in the record:
1. R45's absent_because and R25's C-22.7 translation have no words.json row, so their tests cannot assert a key; they are checked by named acts and by verbatim presence in run-rules' source. A keyed row for each would let the tests assert the key.
2. STATUS_REPORT_LOAD_WHEN: AI-instruction constant, not flagged, left plain (now exported).

Found in other modules: none.
Checks: format 0; architecture (skills) 0; coverage (skills) 51/51; ownership 0 (10 files, all skills' own paths and record); channels 0; setup-words --check: rows.mjs stale as expected (you regenerate at layer close). Full words check: 3346 failures in other modules, none in skills. Full coverage: failures in other modules only.
Tests: 130/130 skills tests pass (130 before).
Size (session_0134uPdGVVH9yPojtvVd8szX): test runs 3, module lines 2919.

Note for the record of this job: I started on a stale local job branch by mistake and fast-forwarded it to tranche/T51 (no commits lost; origin/job/T51/skills is an ancestor of the result).

## Completion again (B3, K4010)

- **Settled (B3):** R25's translation check no longer reads run-rules' source; the test keeps its equality with `runRules.translationOf`. R45's stated absence is now compared by equality with `draftsAbsentSentence(DRAFTS)`, the product's own sentence builder, exported from `skilldoctrine.mjs` (the layer calls it with the catalogue's acts; the sentence is unchanged). Item 2 (`STATUS_REPORT_LOAD_WHEN`, an AI-instruction constant) accepted as B3 says.
- **Checks:** `node --test bio-plane/test/m/skills/*.test.mjs`: 130 pass, 0 fail. Words check for `skills`: 0 failures. Exports: no existing export changed; three added (`DEC27_LIMIT`, `STATUS_REPORT_LOAD_WHEN`, `draftsAbsentSentence`). Architecture 0 failures; coverage 51 of 51; ownership 0 failures.

Size (session_0134uPdGVVH9yPojtvVd8szX): test runs 4, module lines 2923

## J4 · COMPLETE

B3 settled and COMPLETE again (commit HEAD on job/T51/skills, pushed).
- R45 absent_because: now equal to draftsAbsentSentence(DRAFTS), the product's own sentence builder, exported from skilldoctrine.mjs.
- R25 translation: run-rules source read dropped; equality with translationOf kept.
- Item 2 accepted.
Checks: skills tests 130/130; words skills 0; exports unchanged (three added); architecture 0; coverage 51/51; ownership 0.
Size (session_0134uPdGVVH9yPojtvVd8szX): test runs 4, module lines (see record).

## Completion again (B4, K4015)

- **Merged** `tranche/T51` into `job/T51/skills` (merge commit, no rebase).
- **Words check, folded chains (K4015):** on civicos-process `d424c32` the check reads three more sentences, each a multi-line `+` chain in `skilldoctrine.mjs`: the SWEEP §1.3 reason (`sweep_1_3_a_grade`), the instruction note of the suggestions layer (`this_layer_is_instruction_and_5`) and the ungraded-leg text (`inert_and_named_it_contributes`). Each is one `localize` call with its `en` unchanged. Words check for `skills`: 0 failures.
- **Unkeyed (7):** the check reports seven inline strings of this module on the design's unkeyed list; they are not failures and I judge no change to them here.
- **Checks:** `node --test bio-plane/test/m/skills/*.test.mjs`: 130 pass, 0 fail. Exports: no existing export changed; the three added in the earlier change are the only differences. Format 0 failures; architecture 0 failures; coverage 51 of 51; ownership 0 failures.

Size (session_0134uPdGVVH9yPojtvVd8szX): test runs 5, module lines 2913
