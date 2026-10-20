# review (T51)

**Status** · session_01Wc89tQnWkGtjX4yq27KxLR · depth 2 · WORKING · handled B7

## Completion record (T51-84)

COMPLETE for T51-84 · review. Branch job/T51/review.

**Entries applied**
- R35 (N1229, K3765): the member door's `copy` answer now carries `zone` at its top level (`index.mjs`), the same value as the grant part and roster rows (read once per copy), answered with or without a grant, `null` when none is held. The recipient door's copy is unchanged (its grant part carries `zone`).
- Explicit tests for R35's top level, with controls, in `zone-concluded.test.mjs`: a draft with no grant answers the zone; the profiles' fallback; no zone held is `null`, not UTC, at the top level; a draft with a grant answers the roster rows' zone; the recipient door has no top-level `zone`; the copy writes nothing. `copy.test.mjs` R11's key list gains `zone`.
- Stale comment `checks.mjs`:23–25 (the deleted `check-refusal-codes.mjs` guard and `civicos-ui/app.html`) restated for the code as it is; the same file's closing sentences on D-542 restated as past (the guard went with its walk). BOB's note named :25 and :23; both sit in one paragraph.
- A81 (DEC-330), confirmed: no new read. `reviewcopy` carries `last_change.at` (date), `updated_by` (author), `required_strength` (floors) and, with the control plane's in-band stamp (`control-plane` R20), the hash. The browser can assemble the stamped file from that answer. Note the in-band `hash` now covers the top-level `zone` for the member door.

**Deferred**: none.

**Found in other modules**: requirements text only, BOB's: `review.md` line 3 still marks R35 `*(not yet met: T51)*`; it is met now.
Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed `review/index.mjs` and `checks.mjs`; regenerate with the bundle command (manifest §14).

**Tests and checks**
- `node --test bio-plane/test/m/review/`: tests 61, pass 61, fail 0.
- Users of `reviewcopy` (publication, control-plane, screens-publish, case-authoring): 29 failing lines before and after my change, identical lists (diffed), so inherited reds, none caused by this job.
- format: 174 modules, 173 requirements files; 0 failures. architecture: 11 product files, 57 relative imports; 0 failures. coverage: 36 of 36 live requirement ids named by a test; 0 failures. ownership: 0 failures.

Size (session_01DDca1CLodht7Fy36DU9DUp): test runs 6, module lines 1430

## J1 · COMPLETE

T51-84 review complete on job/T51/review. R35 top-level zone on the member door met, with own tests and controls; stale checks.mjs comment restated; A81 needs no new read (reviewcopy carries date, author, floors; hash in-band). Details in my record's Completion record. Dependent-module test failures (29) are identical with and without my change. Bundles under bio-plane/dist and release are stale until regenerated. review.md line 3 still marks R35 not yet met: BOB's.

## Completion record (T51-237)

COMPLETE for T51-237 · review (BOB's B2: the words findings). Branch job/T51/review. `tranche/T51` (c541c23ab9) merged in, not rebased; no review path changed on the tranche.

**Entries applied**
- The three inline findings, the two plain findings and the two test copies of `build/plan/words-pass/review.md`, each fixed by the words rule (a sentence people read is `localize('review.index.<slug>', en, vars)`; a test holds the sentence once, through `localize`, never as a bare copy):
  - inline `index.mjs:231` ("{} was recorded to the second") and its `[copy]` twin ("both were recorded to the second"): `review.index.who_was_recorded_to_the_second` and `review.index.both_were_recorded_to_the_second`, each the `v1` of `review.index.which_of_who_at_and`.
  - inline `index.mjs:563` ("It also ends at {}."): `review.index.it_also_ends_at`.
  - plain `index.mjs:735` ("is not evidence of who wrote the statement"): the whole UNDETERMINED sentence is one `localize` literal, `review.index.undetermined_statement_by` (the old `+` join is removed; the joined text is unchanged).
  - plain `index.mjs:858` ("set the team's approval rule"): `review.index.set_the_teams_approval_rule`, passed to `notAnAdmin` as before.
  - testcopy `copy.test.mjs:66` and `:68`: one constant, `NO_FINDING = localize('review.index.this_draft_names_a_finding', en)`, used for both `detail`s.
- Four further inline sentences in this module, not in the list at START, which the process checks now report (civicos-process e8ac153): `index.mjs:141` (`review.index.authoring_a_draft_is_editing`), `:173` (the derived case identity, `review.index.derived_case_identity`), `:549` (`REVIEW_BAD_UNTIL`'s detail, `review.index.a_readers_end_date_is`) and `:892` (`CASE_NOT_AN_APPROVER`'s detail, `review.index.an_approval_is_given_by`). Each `+` join is now one literal; each joined text was compared with the original by hand, character for character.
- Every new id is unique in the repository. No requirement changed; no new requirement id; no test removed or weakened.

**Deferred**: none.

**Found in other modules, for BOB**
- The stitched arm of the words check (current civicos-process) counts multi-line `+` sentences as inline. Four in `review` were not in the list at START. Whether other modules' findings moved the same way is for BOB to check: the tree's words total is 2254 failures (2258 before this job's four fixes), none in `review`.
- Generated artifacts made stale, not edited (manifest §14): `bio-plane/src/setup-words/rows.mjs` (`build.mjs --check` reports it stale at the new ids, the stale-rows note, not a refusal), `bio-plane/src/setup-words/words-unreviewed.json` (BOB regenerates it at the layer close), and the bundles `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` (they embed `review/index.mjs`; carried from J1).
- No REPORT of an unread string: every sentence converted is a refusal's detail or a sentence a member or recipient reads in the copy, the grant, the approval or the comment answers.

**Tests and checks**
- `node --test bio-plane/test/m/review/`: before the edits 61 pass, 0 fail; after the edits 61 pass, 0 fail.
- `node checks/run.mjs /home/user/bio` (civicos-process e8ac153): format 176 modules, 0 failures; architecture 3638 product files, 0 failures; coverage: all 36 live `review` ids named by a test (25 failures, all in other modules); words: no finding in `review`; the run exits 1 on other modules' findings.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note (`rows.mjs` at `review.index.a_readers_end_date_is`), expected; no refusal naming `review`.
- `node checks/ownership.mjs /home/user/bio review tranche/T51 job/T51/review`: run after this commit (see the post).

Size (session_012TPvP8gm8qT2VjtUB8E9Dk): test runs 3, module lines 1367

## J2 · COMPLETE

T51-237 · review (BOB's B2: the words findings) is complete on job/T51/review @ c8c833dedb. The three inline, two plain and two test-copy findings in build/plan/words-pass/review.md are fixed through localize; four further inline sentences that the process checks now report in this module (index.mjs:141, :173, :549, :892) are converted too. Tests: 61 pass before and after. Checks: format and architecture 0 failures; coverage has no review line; words has no review finding; ownership 0 failures; setup-words --check gives the stale-rows note only (rows.mjs and words-unreviewed.json for you to regenerate at the layer close). For you: the stitched arm now counts multi-line + sentences, so other modules may have new findings; the tree's words total is 2254, none in review. Stale and not edited: the bundles under bio-plane/dist and release (carried from J1). Details in the completion record.

## J3 · QUESTION

Entry 1 (C3, R37): `case-authoring` exports no list named `DRAFT_FIELDS` (checked on tranche/T51 after FR-18: its exports are `AUTHORED_FIELDS`, R65's eight authored fields incl. `account`, `whatChanged`, `statementCites`, and `ACT_FIELDS`, R65's other arguments: target, targets, project, roles, caseId, newCase, draft, subjectPosition, tensionsDisclosed, selfAttested, flagsDisclosed, calculationsDisclosed, peopleBases, tieAttested, accountDraft, reviewComments, viewer, author). Together they are exactly what `op=publish` accepts.

My best reading, and what I build unless you answer otherwise: `REVIEW_DRAFT_FIELDS` is derived, not hand-listed, as `AUTHORED_FIELDS` plus `ACT_FIELDS` minus the four that are not a draft's arguments (`project` and `draft`, which name the draft's own project and id in this module's act, and the stamps `viewer` and `author`). That includes `account` and also widens what a draft keeps (whatChanged, statementCites, the disclosures, accountDraft, reviewComments), which are all things `publishCase` accepts and the dry run (R13) then passes on. The equality test is `REVIEW_DRAFT_FIELDS` equals that derivation of the two exports.
If you would rather `case-authoring` export the one list itself (a CHANGE for FR-18, which is not mine), say so and I will import it.

## J4 · REPORT

Two things that are not mine to change; I carry on meanwhile.

1. **`build/modules.json`: `review` needs `test-support` in `uses`.** `declared-ops.test.mjs` (R42, entries 4 and 7) imports `bio-plane/test/declared-ops.mjs`, and `checks/architecture.mjs review` fails with "imports bio-plane/test/declared-ops.mjs of test-support, which review does not declare in uses" (`lines`, `money`, `duties` and the other declaring modules carry it). Please add the edge on `tranche/T51`; I merge it when you CHANGE me. Until then that one architecture finding stands, in my file.
2. **op-grades' test copies a sentence my declaration now makes a word.** `bio-plane/test/m/op-grades/t47.test.mjs:250` asserts `NON_ACTS.reviewcomment` equals the literal "review-directed: keyed by a review copy; a reader's comment for the case's owner". The description in my `DECLARED_OPS.reviewcomment` must equal that hand row (`op-grades` R50), so it is now a `localize` word and the words check reports `testcopy op-grades t47.test.mjs:250`. The fix is op-grades': read the expected text through `word("review.declared.reviewcomment")` or compare to the declaration. I did not touch it.

## Completion record (FR-19)

COMPLETE for FR-19 · review (BOB's B3, with B4–B7). Branch job/T51/review. `tranche/T51` merged in, never rebased. Requirement lines (K4210): written by me in `build/requirements/review.md` (R37–R42 new, each marked *(not yet met: T51)*; R4, R11, R12 and the Terms amended), not in this record; BOB's listing of that one file is expected at the merge.

**Entries applied**
1. **C3 · R37.** An edit keeps what it does not send: `#draft` rebuilds the arguments from the stored ones, replaces each sent field, and clears a field sent as `null` or blank; `caseId: null` clears the case, and the stored `case_id` follows the arguments (an edit with no `caseId` no longer NULLs it). `REVIEW_DRAFT_FIELDS` is derived (K4209): case-authoring's `AUTHORED_FIELDS` + `ACT_FIELDS` less `project`, `draft`, `viewer`, `author`; it now holds `account`.
2. **C2 · R38.** `copy` answers `choices: {subject_positions, roles}` (fresh copies of `ratification`'s `SUBJECT_POSITIONS` and `case-authoring`'s `MEMBER_ROLES`) and `authored.account`, `authored.whatChanged`, at both doors.
3. **C9 · R39** (R4/R37 did not say it, so a new line). A new draft naming a published case begins from its highest edition: `targets` and `roles` from `published_case_members`, `scope` from `published_cases`, each only where the act did not send it. The statements, position, bias acknowledgement and account are not carried (DEC-12: authored afresh each edition). Nothing of the case is written (snapshot of `cases`, `published_cases`, `published_case_members`, `case_documents` equal before and after).
4. **K4168 and K4202 · R42.** `DECLARED_OPS` for `casedraft`, `reviewgrant`, `reviewrevoke`, `reviewcomment`, beside the ops map, held by `declared-ops.test.mjs` with test-support's `declaredOpHolds` (control seen failing: a required field the op does not refuse without). `op-grades`' `registerDeclaredOps` reports all four `agreed` (no refusal), and `op-declarations`' accepts them. Hand rows that can now go: `casedraft`, `reviewgrant`, `reviewrevoke`, `reviewcomment` in `op-declarations` (OPS, lines 1016–1020) and in `op-grades` (RUNGS/RUNG_ABSENT/NON_ACTS, t47.mjs:82); BOB decides when.
5. **L14 · R40.** `copy` answers `title`: "Case X, edition N" for a named case (`review.index.case_edition_title`, my own id, no design row existed); else `review.title.draft` with the scope or, failing that, the subject; else `review.title.untitled`. `case.identity` stays beside it. `review.body.nocase` is not answered by this module: screens-publish reads it by key for the body (BOB: say if it should come in the answer).
6. **L15 · R41.** A present finding answers `statement` and its `text` without the file's front matter; a file with no front matter answers its words unchanged; a file of front matter alone answers its `conclusion`/`statement` string; no file answers null.
7. **K4205.** The five red tests now assert the identity sentences by key (`word` / `localize`), keeping the distinct-sentences, no-code and not-NEW controls; every other test of the module that copied an identity sentence is converted too (`invariants`, `doors`); `index.mjs:172`'s stale `localize` fallback restated as the row's current sentence.

**Rulings I made (details, for `build/rulings.md`)**
- An empty list is a value, not a clearing (`excluded: []` is a claim, case-authoring R3); a list is cleared with `null`. A blank string clears.
- The "subject" of R40 is the title of the first finding the draft names that its editor can read (the editor's gate, as R12), so no title names a finding the editor could not see.
- `reviewcomment` accepts `secret` (a recipient's link, in the body, turned by the control plane into `secretSha`) and `draft` (query, not required: its absence is the dead answer, which names nothing). interface-shell's guard found `secret` in screens-publish's real call; it is the op's true field as a screen reaches it, so I declared it rather than reporting a screen mismatch.
- `secretSha` is the control plane's stamp (R29) and is in no declaration; `reviewgrant`'s base call in the test adds it as the door does.
- Statement's writer, size bound and case checks (R3, R4) run over the arguments after the merge.

**Deferred**: none.

**Found in other modules (for BOB)**
- `op-grades` t47.test.mjs:250 still copies the `reviewcomment` sentence (the `testcopy op-grades` finding of the words check): op-grades' to fix (B7); mine reads the same text through `localize("review.declared.reviewcomment", …)`. The t36/t48 copies listed beside it are op-grades' too.
- `casedrafts` (R19) rows still carry only `case.identity` for a heading: no `title` there (not in my entries). screens-publish's drafts list may want it; say if it should be added.
- Generated artifacts made stale, not edited (manifest §14): `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` (my new ids `review.declared.*`, `review.index.case_edition_title`), and the bundles `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`. `build.mjs --check` reports rows stale at another module's id first (`capture-sources.declared.capturecredentiallist`), a stale-rows note.
- The screens-publish suite has the same 11 failures with and without my change (run on `origin/tranche/T51` in a worktree, the lists identical); three more appeared while `secret` was undeclared and went with the declaration above. Other users of the copy (case-authoring, control-plane, publication, admission, plane's review tests, case-inputs, test-support) pass.

**Tests and checks**
- `node --test bio-plane/test/m/review/`: tests 73, pass 73, fail 0 (was 61). New tests `edition.test.mjs` (R37–R41, 7) and `declared-ops.test.mjs` (R42, 5); each of the 7 R37–R41 tests fails against the tranche's `index.mjs` (seen failing), and passes now.
- `node checks/run.mjs /home/user/bio` (civicos-process): format 175 modules, 0 failures; architecture 3780 product files, 0 failures; coverage: all 42 live `review` ids named (failures only in other modules); words: no finding in `review` (8 `testcopy op-grades`, op-grades').
- `node checks/ownership.mjs /home/user/bio review tranche/T51 job/T51/review`: 1 failure, `build/requirements/review.md` listed as outside paths, tests and record: the file B5/B6 accept at the merge.

Size (session_01Wc89tQnWkGtjX4yq27KxLR): test runs 16, module lines 1482

## J5 · COMPLETE

FR-19 review complete on job/T51/review. R37 (edit keeps unsent fields; REVIEW_DRAFT_FIELDS derived), R38 (choices, account, whatChanged), R39 (draft begins from a published case's findings, roles, scope; nothing of the case written), R40 (title), R41 (statement, no front matter), R42 (DECLARED_OPS for casedraft, reviewgrant, reviewrevoke, reviewcomment), and K4205's five reds by key. Requirement lines R37-R42 are written by me in build/requirements/review.md (marked not yet met: T51); ownership lists that one file, as B5/B6 accept. Tests: review 73 pass (was 61); the 7 new R37-R41 tests fail against the tranche's code. Checks: format 0, architecture 0, coverage none in review, words none in review (8 op-grades testcopies are op-grades', B7). For you: reviewcomment's declaration includes 'secret' (the link, relayed by the control plane); screens-publish suite has the same 11 reds with and without my change; casedrafts rows have no title; review.body.nocase is not answered by review. Stale generated: rows.mjs, words-unreviewed.json, the two bundles. Details in my record's Completion record (FR-19).
