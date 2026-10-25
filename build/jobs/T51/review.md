# review (T51)

**Status** · session_01QnDe6zFwq9Dr5SvYgBwJnE · depth 2 · WORKING · handled B17

## Completion record (fix round 4, B13 START, K4429; REVIEW #22)

COMPLETE for fix round 4, wave 1 (#12). Branch job/T51/review, `tranche/T51` merged at the start and again before COMPLETE (up to date; no wave-1 provider merged before me, so nothing of this round was read from a double).

**C46 (my part, the provider; seam owner screens-publish)**

1. **Root cause (certain, confirmed by reproducing):** `review/index.mjs` `#finding` took a finding's words only from the question's own bytes (`findingWords`: front-matter `conclusion`/`statement`, or the body's `## Conclusion`). A question a *project* concluded keeps the conclusion as that project's record (`conclusions` rows in the project's document, `basis-versions` R22; `op=conclude` with a project answers `inquiry_moved: false` and writes nothing into the question), so its bytes hold no words and the finding read "Not concluded yet" at both doors and in `list`'s `concluded` findings. Fix: `#finding` now asks `#recorded` first, which reads `ratification.caseConclusionFor(project, question, viewer, state)` (the answer the publish gate and the case document use) for the draft's own project and the draft's last editor as viewer (in `list`, the project and the requesting viewer): only while the project's latest act is a conclusion with an adopted claim, the claim is the `statement` and the conclusion's falsifier the `falsifier`, `concluded: true`, `not_concluded: null`. A withdrawn conclusion, another project's, and a no-project conclusion (written in the question's own bytes) are not that project's record and answer the file's words as before. No new sentence; the `Not concluded yet` stand-in key is unchanged.
2. **Why the tests missed it, and the gap fix:** the earlier fixtures put a string `conclusion` in the question's front matter (survivors class d) and `fixture.mjs`'s `ratification` double answered no claim, so no test had a question concluded the way a project concludes. The new `conclusions.test.mjs` builds the questions with case-authoring's real fixture (real record-core, membership, basis-versions, ratification, strength, case-authoring, case-inputs, case-account) and concludes them with the real `conclude` (project adoption; no project) and `withdrawConclusion`; the question's own bytes are asserted to hold no `conclusion:`.
3. **Failing-first test on the walker's row:** `conclusions.test.mjs` "R41, R12: a question the project concluded by adopting a reading reads as concluded in the claim's words at the member door, the outside reader's door and in the concluded list" (the walker's CA16 and CA21 rows): RED before the fix, `actual [true, false, 'Not concluded yet']` against `[true, true, null]` at `findings[0]` (member door, line 50); GREEN after: statement "Federal agencies must disclose requested records unless one of nine exemptions applies." and the falsifier at the member door, the recipient door (grant secret) and `list().concluded[0].findings[0]`; no `## ` heading and no "Not concluded yet". Controls (green before and after): a question concluded by `conclude` with no project answers its conclusion words at both doors; a question nobody concluded, one the project concluded then withdrew, and one only another project concluded answer `concluded: false`, `statement: null`, a plain state sentence, no heading.
4. **Platform check: N** (pure code over the record; no limit, door or worker involved).

**Seam (screens-publish owns the through-the-door test):** the editor's cites list drawing the raw id is `screens-publish/case-editor.mjs`; this module already answers `title` for every present finding (R12), which that screen is to draw. Nothing else of the seam needs a change here.

**Requirement ids met:** R41, R12 (and R36's `concluded` list findings, which read the same way). **Deferred:** none. **Found in other modules:** none. **Generated artifacts made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed `review/index.mjs`; regenerate with the bundle command (manifest section 14).

**Proposed requirement line (BOB writes `build/requirements/`):**
- R41 (amend): "A present finding that is a question the draft's project has concluded (`ratification` R1's `caseConclusionFor` answers `concluded` for the project and the question, its claim adopted) answers that conclusion's claim as `statement` and its falsifier as `falsifier`, first, whether or not the question's own bytes hold words; a conclusion the project withdrew, another project's, and one written in the question's own bytes (no project) answer the file's words, as above. Test: a question concluded by a project's adoption answers the claim at the member and recipient doors and in `list`'s `concluded`; control: the no-project conclusion, a withdrawn conclusion and another project's answer as before."

**Tests and checks**
- `node --test --test-force-exit bio-plane/test/m/review/`: tests 86, pass 86, fail 0 (83 + the 3 new).
- Users (`build/plan/impact.mjs origin/tranche/T51 HEAD`): notice-producers 130/130, queue 206/206, op-declarations 1 red (R34, affordances R48), store-door 1 red (R17 `groupdescriptiondraft`), control-plane 1 red (R81 end to end), plane 5 reds (R18/R5, R24, R5/R9/R45, R5, R9). Each red is identical with `review/index.mjs` reverted to the tranche tip (same failing tests, same counts), none names `review`: named, not fixed.
- `node checks/run.mjs`: format 0 failures; architecture 0 failures; words: no failure in `review` (the 3 inline failures are in `op-grades`); coverage: no `review` failure (the 15 failures are other modules' not-yet-met ids); channels 0 failures. `node checks/ownership.mjs review tranche/T51 job/T51/review`: 3 files changed by review, 0 failures.

Size (session_01BgzvhhpsZ9CfjrbXUVyebx): test runs 9, module lines 1633

## Completion record (fix round 3, B11 START, K4356; REVIEW #21)

COMPLETE for fix round 3. Branch job/T51/review, with `tranche/T51` merged at K4366 (d5cc9f2926).

**Causes met**
- **C46\* (my part, `findingWords`; R41, R12)**: a finding's `statement` is the front matter's `conclusion` or `statement`, else the text of the body's `## Conclusion` section, else (words not laid out in sections: no `## ` heading) the words themselves; a file laid out in sections whose Conclusion holds nothing has `statement: null`, never its headings or the session log. `falsifier` is the front matter's, else the `## What Would Falsify This` section's text, else null. Each present finding also answers `concluded` (boolean) and `not_concluded` (the "Not concluded yet" state when there are no words, else null), and `title` (the bundle's title, else null) so the screen draws the question's title where it drew the id: this is C46's plane half, wholly inside `review`. The two section headings are read from `record-grammar`'s `HEADINGS.inquiry`, not written a second time. Tests (`walk.test.mjs`, seen failing first): concluded finding (front matter words, empty-section body and log) answers its words and no `## `; Conclusion-section words and falsifier from the body; empty conclusion answers the not-concluded state at both doors, never a heading; no `## ` in any statement or falsifier; `title`. Controls: a finding with words has `not_concluded: null`; a file with no headings answers its words unchanged.
- **R19 `editions` (C48, C50)**: each row of `casedrafts` carries `editions {prepared, published}` from `caseAuthoring.draftEditions({caseId: <the draft's case identity>, draft: <row>})`, nulls when it cannot answer (never a throw). **Tested against a scripted double** (`ca.editions` in `fixture.mjs`), because case-authoring's R83 is not yet on `tranche/T51` (BOB's B12 told me to). I read its job branch's `draftEditions({caseId, draft})` (4f7ea76cae): the call and the answer shape agree with my double; to be re-run against the real one when it is merged (CHANGE, if BOB wants it).
- **R43 (new, B12)**: `sharedDraftsByProject({projectIds, viewer}) -> {[project]: {count, newest}}`, one set-based read for many projects (sight in one query per chunk of 200 projects, grants and top editions in one query each, no read per project): drafts with at least one live grant under R8 (a grant not revoked, not lapsed, its draft still at the case identity it was bound to, so a grant whose edition is since published is not counted), counted once per draft, `newest` the newest live grant's issue instant by instant order; a project the viewer may not see, or that does not exist, `{0, null}`; empty list `{}`. Writes nothing. Tests (`lists.test.mjs`): three-plus projects with counts and newest, the fence, the revoked/lapsed/published controls, empty list.
- B10 / CA24 and the rest of the earlier rounds: unchanged and still green.

**Stand-in word (named per B11)**: `review.index.not_concluded_yet`, "Not concluded yet" (a `localize` default), until the design's row lands. No other new sentence.

**Existing tests changed (they pinned the old shape)**: `copy.test.mjs` R12 and `zone-concluded.test.mjs` R36 now include `title`, `concluded` (and `not_concluded`) in the finding's shape; `doors.test.mjs` R19's key list gains `editions`; `walk.test.mjs`'s R41 control (a finding with only a `## Question` section) now answers the not-concluded state instead of the section text.

**Deferred**: none.

**Proposed requirement lines (BOB writes `build/requirements/`)**
- R41 (amend): "...else the text of the body's `## Conclusion` section, else, for words with no `## ` heading, the words; a file laid out in sections whose Conclusion is empty has no statement: `statement: null`, `concluded: false` and `not_concluded` a plain state sentence (stand-in key `review.index.not_concluded_yet`); `falsifier` is the front matter's, else the body's `## What Would Falsify This` section; never a heading, at either door."
- R12 (amend): "a present finding also answers `title`, the bundle's title (null when none), so a screen draws the question's title and never its id."
- R19 and R43 as written; R43's `Uses` side: `project-roster` R42 (control-plane R118) is to call `sharedDraftsByProject` once per list.

**Found in other modules**: none. Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed `review/index.mjs`; regenerate with the bundle command (manifest §14).

**Tests and checks**
- `node --test --test-force-exit bio-plane/test/m/review/`: tests 83, pass 83, fail 0.
- Users (`build/plan/impact.mjs origin/tranche/T51 HEAD`): notice-producers 130/130, queue 206/206, op-declarations 233/233, control-plane 340/340, plane 279/280 (R24 `screen.objective.purpose` held by the words list: a word-table test of screens, not mine), store-door 52/53 (R17 `groupdescriptiondraft` declared as a read: not mine). Both reds name nothing of `review`.
- `node checks/run.mjs`: format 0 failures; architecture 0 failures; words 0 failures (inline 0); coverage: no review failure (the 15 failures are other modules' not-yet-met ids). ownership: 8 files changed by review, 0 failures.

Size (session_01FnocwFJGM3fMnossXJZ36Q): test runs 12, module lines 1610

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

## Completion record (fix round 2: C46, C52)

COMPLETE for fix round 2 · review (BOB's B9). Branch job/T51/review. `tranche/T51` merged in, never rebased. Requirement lines (K4210): R18 and R41 amended by me in `build/requirements/review.md` (marked *(not yet met: T51)*, header updated); ownership lists that one file, as B5/B6 accept.

**Causes met**
- **C46 · R41 (and R11/R12).** `findingWords` takes the front matter's `conclusion` (what `op=conclude` writes there), else `statement`, first, as the finding's `statement`; else the text after the front matter. The team's `## Session Log` section (to the next `## ` heading or the end) is cut from every text answered, `text` and `statement`, at both doors, so record ids, hashes and members' reasons never reach a reader. A finding also answers `falsifier` (the front matter's, else null): the finding's own words include what would change it (CAUSES, C45's wording), and `screens-publish` may draw it; no other field changed. A file with no front matter and no log answers its words unchanged. Tests (`walk.test.mjs`): a finding with front-matter words and a session-log body answers the words only, the falsifier, and a log-free text, at the member and the recipient door; control: a finding with no front-matter words answers its section text without the log, and a file with no front matter or log is unchanged. Seen failing before the change (statement was the whole file with the log).
- **C52 · R18, review's part.** Reproduced first with two drafts and the owner as viewer: the founder's bare `admin` (the spelling `readerOf` gives the founder, membership R43) was answered `NO_REVIEW_COPY` because `comment()` admitted only strings beginning `member:`, and a viewer carrying a project (`member:ann@PROJ…`, membership R149) was admitted but attributed to the whole spelling (`ann@PROJ…`). `comment()` now names the member through the sight predicate (`#commenter`: `member:<id>`, that spelling carrying a project, and the founder's bare `admin`; a machine credential, an unrecognised or absent viewer name none) and attributes the comment to the member's id. Tests: the owner replies on each of two drafts, in each spelling, attributed to the member (`admin` and `ann`), the roster listing both; control: a stranger, a member of another project, the other project's draft, a machine viewer, an empty and an absent viewer are `NO_REVIEW_COPY`, byte-identical to a draft that does not exist, and nothing is written. The door half is `control-plane`'s (wave 2): it passes `reader.viewer` as `readerOf` answers it; with this change that works for the founder and the project-carrying spelling. If the walk's refusal persists after both merge, the remaining candidate is the draft id the screen posts (`review-copy.mjs:179-185` sends `view.ui.draft.draft_id`; the copy answers `draft` as the id string), which is screens-publish's to read.

**Deferred**: none.

**Found in other modules (for BOB)**
- `reviewCommentsLeftOut` (R33, mine, unchanged) still tells only `member:` viewers; the founder's bare `admin` now can comment and is not told if a comment is left out. Not part of C52; say if it should follow `#commenter` (notice-producers' R17 reads it).
- `control-plane` suite: 1 failure, its R24 word test about screen titles ("your group's Civicsmith"), in a file this job did not touch.
- Process-checks failures not in review: format `build/rulings.md:4298` (K4301, BOB's); coverage lines of other modules (agent-harness R17, agent-runner R37 R38 R40, control-plane R116, installer-steps R26 R31, interface-shell R111, journey-check R19, screens-daily R82, screens-inquiry R123–R125, screens-intake R54, screens-publish R70–R72).
- Generated artifacts made stale, not edited: the bundles `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`.
- Two existing tests that pin a finding's exact shape (`copy.test.mjs` R12, `zone-concluded.test.mjs` R36) gain `falsifier: null`.

**Tests and checks**
- `node --test --test-force-exit bio-plane/test/m/review/`: tests 76, pass 76, fail 0 (was 73; three new in `walk.test.mjs`).
- Users: screens-publish 338/338, notice-producers + case-authoring 181 (179 pass, 0 fail), plane + publication 324/324, control-plane 431 tests, 429 pass, 1 fail (the R24 word test above, unrelated), 1 skipped.
- `node checks/run.mjs /home/user/bio`: format 1 failure (rulings.md, BOB's); architecture 0 failures; coverage no review line; words 0 failures. ownership: 1 failure, `build/requirements/review.md`, accepted at the merge (B5/B6).

Size (session_01LZnjV7jBk2LxdqJLqKD4W4): test runs 12, module lines 1513

## J6 · COMPLETE

Fix round 2 review complete on job/T51/review. C46 (R41): a finding's statement is the front-matter conclusion first, falsifier added, the Session Log cut from text and statement at both doors. C52 (R18, review's part): reproduced (founder's bare 'admin' was NO_REVIEW_COPY; a project-carrying viewer was attributed to the spelling); comment() now names the member via the sight predicate, so the owner's reply is accepted in each spelling, a stranger/machine/absent viewer is dead. Requirement lines R18 and R41 amended by me in build/requirements/review.md (ownership lists that one file, B5/B6). Review suite 76/76; users: screens-publish, notice-producers, case-authoring, plane, publication all green; control-plane has 1 unrelated failure (R24 word test). Report: reviewCommentsLeftOut still tells only member: viewers; if C52 persists after control-plane merges, check the draft id screens-publish posts. Stale generated: the two bundles. Details in my record.

## J7 · COMPLETE

B10 (CA24) is already met by my J6: comment()'s member door now admits exactly the viewers copy() admits (member:<id>, that spelling carrying a project, and the founder's bare 'admin'), refuses machine classes, unrecognised and absent viewers as before. A founder's comment is recorded author_kind member, author 'admin', and listed by copy (walk.test.mjs, R18: owner on two drafts in each spelling; control: machine, stranger, empty, absent viewers refused NO_REVIEW_COPY). No requirement line says otherwise; R18 amended accordingly. No new change; branch job/T51/review unchanged since J6.

## J8 · QUESTION

QUESTION (best reading below; I carry on with C46 meanwhile).

R19's new sentence: each draft of `casedrafts` carries `editions {prepared, published}` "as case-authoring R83 states them". case-authoring has not merged R83 (its branch has nothing yet), and R83 names no function I can call; `published.address` (the case's public address) is built nowhere in the code I hold.

Best reading: case-authoring exports one read, `draftEditions({caseId, draft})` -> `{prepared: <edition number>|null, published: {edition, address}|null}`, the same code its pre-flight uses for R83's `editions`; review's `list` calls it once per draft row (stands at the draft's case identity) and adds the result as `editions`; I test against a scripted double of that call until case-authoring merges, then against the real one. If the case-authoring job exports it under another name or shape, tell me the name and I follow it. If you prefer review to derive it itself from `case_documents` (unsigned row with the draft_id = prepared) and `published_cases`, say so, but the address would then need a stated source from you.

Also, C46's plane half (a question's title where the id is drawn): inside my module, each present finding will also answer `title` (the bundle's title, else null) so screens-publish can draw it; no other module needed.

## J9 · COMPLETE

COMPLETE fix round 3 (review), branch job/T51/review pushed; record has the full Completion record.
Met: C46* my part (findingWords: front-matter words, else the Conclusion section, else headingless words; empty conclusion -> statement null, concluded false, not_concluded stand-in key review.index.not_concluded_yet; falsifier from front matter or its section; title on each present finding = the plane half, inside review); R19 editions on casedrafts rows; R43 sharedDraftsByProject (set-based, exact under R8).
NOTE: R19 `editions` was tested against a scripted double of case-authoring.draftEditions({caseId, draft}) (not yet on tranche/T51; its job-branch code agrees with my call). Send CHANGE after case-authoring merges if you want it re-run on the real one.
Suites: review 83/83; users: notice-producers, queue, op-declarations, control-plane all green; plane 279/280 (R24 words) and store-door 52/53 (R17 groupdescriptiondraft) are not review's. format, architecture, words 0 failures; coverage none for review; ownership 0.
Proposed lines for you: R41 and R12 amendments (statement/falsifier/not_concluded/title), wording in my record. Bundles under bio-plane/dist and release are stale until regenerated.
Size (session_01FnocwFJGM3fMnossXJZ36Q): test runs 12, module lines 1610

## J10 · COMPLETE

COMPLETE for fix round 4 (C46, my part). Root cause: #finding read a finding's words only from the question's own bytes; a project's conclusion is its own record (inquiry_moved false), so the finding read 'Not concluded yet'. Fix: the project's recorded claim and falsifier (ratification caseConclusionFor) come first. Failing-first test conclusions.test.mjs through the real conclude (red 'Not concluded yet', then green); platform check N; review suite 86/86; users' reds identical on the tranche tip; checks and ownership clean for review. Proposed R41 amendment and the stale bundles are in my record (build/jobs/T51/review.md). No QUESTION open.

## J11 · REPORT

C48 (B14, R19 `editions.case`): the change is in, committed at 13f39a4c97 on job/T51/review.

- `bio-plane/src/review/index.mjs` `#editions`: `editions` now carries `case` (the case id from case-authoring's `draftEditions`, `null` where it cannot answer), on the answer and on the throw path.
- Failing-first test, `bio-plane/test/m/review/lists.test.mjs`, "R19 (C48): a draft prepared for a new case states that case id as editions.case ..." Red on the old source: `actual: undefined, expected: 'CASE-2026-0003'`. The first R19 test and the throw test now also assert `case`. Green with the change: `node --test --test-force-exit bio-plane/test/m/review/` = 87 pass, 0 fail.
- Checks: ownership 0 failures (1 file changed by review); checks/run.mjs: no finding in review; the tranche-wide coverage and architecture reds are other modules' and are not touched.

Not yet done, so I have not posted COMPLETE: the review tests use the scripted `draftEditions` double (fixture `ca.editions`), because review's fixture has no real case-authoring. B14 asked for the real one. Once case-authoring #37 merges and BOB sends CHANGE, I merge tranche/T51, re-run the R19 tests against the real `draftEditions` (case-authoring's R83 with `case`), and post COMPLETE with the Size line. If you want the real module wired into review's fixture for this test instead, say so and I will do it then.

## J12 · COMPLETE

COMPLETE for C48 (B14, CHANGE B15 / K4469). Branch job/T51/review, tranche/T51 merged (a5415384fc, case-authoring #37 included).

**C48 (review's part; seam owner screens-publish, not this job)**
1. Change: `bio-plane/src/review/index.mjs` `#editions` (about line 979-984) copies `case` from `draftEditions` on the answer and on the throw path (`case: null`). `editions` = `{prepared, published, case}`.
2. Why the test missed it: the earlier fixture had no case-authoring `case` field (scripted double). Test gap closed: the new test wires the real `caseAuthoringOf` over review's own world (`lists.test.mjs`, "R19 (C48) ... from the real draftEditions"). The fixture's `published_cases` stub gained `ratified_at`, which the real read needs (`fixture.mjs`).
3. Failing-first: the test was red on the old source (`case` undefined, before B15 wiring; and on the first attempt red with the real module because the stub lacked `ratified_at`, which made the real read return nulls: `case: null`, `prepared: null`). Green after the fixture fix and the change. Control: a never-prepared draft states `case: null`. Throw path stays on a double (`case: null`).
4. Platform check: N (no platform surface; a data read).

Suite: `node --test --test-force-exit bio-plane/test/m/review/` = 87 pass, 0 fail, 0 skip.
Checks: format 0 failures; ownership 0 failures (3 files: index.mjs, lists.test.mjs, fixture.mjs); checks/run.mjs: no review finding. Impact (`node build/plan/impact.mjs origin/tranche/T51 HEAD`): 0 affected modules at the time of the run.
Requirements met: R19 (the `editions.case` sentence). No open QUESTION. No deferred item.

Size (session_01Mgd8f9TtwZNsFGWYR1ET9V): test runs 10, module lines 1633

## Completion record (fix round 6, B16 START, K4570, K4571; REVIEW #24, session_016SWyQAUyjKySSg7jMkWWY1)

COMPLETE for fix round 6, job 9 (G12c, provider for screens-daily's `casedrafts` and screens-publish's `reviewcopy`). Branch job/T51/review, `tranche/T51` merged at the start (up to date; nothing of this round was read from a double).

**What changed**
1. `bio-plane/src/review/index.mjs`: `listMany` (after `list`) and `copyMany` (after `copy`); `idList` (list or comma text, each id once, in order); `batchTooLarge`; `REVIEW_BATCH_LISTS_MAX` = 50 and `REVIEW_BATCH_COPIES_MAX` = 20; the ops map's `casedrafts` and `reviewcopy` arms take `projects` / `drafts` (a body list, else comma-separated in the query) and answer `{ok, kind: "review-drafts-batch", count, lists: {[project]: <the single answer>}}` / `{ok, kind: "review-copies", count, copies: {[draft]: <the single answer>}}`. Each id is answered by calling the single read itself (`list` / `copy`), so a project or draft the viewer may not see, or that does not exist, answers `NO_REVIEW_COPY`, byte-identical to the single read, and a recipient's batch (`bySecret`) gets her own draft's copy and the dead answer for every other. `limit` passes to each. Writes nothing.
2. A list longer than its bound is refused whole, `REVIEW_BATCH_TOO_LARGE` (C-87.18, `checks.mjs`; `max` named), never answered in part. Its member words are the nearest held row's, `refusal.REVIEW_DRAFT_TOO_LARGE` (stand-in); **row owed: `refusal.REVIEW_BATCH_TOO_LARGE`** (the detail is `review.index.a_batch_names_at_most`). No screen reaches it: the owners send at most 50 projects / 20 drafts.
3. `DECLARED_OPS` (K4208) gains `casedrafts` (classes admin/member/probe, read; accepts `project`, `projects`, `limit`) and `reviewcopy` (classes null, read; accepts `draft`, `drafts`, `limit`, `secret`); both require nothing, because a call with none of the keys is the one dead answer, which names nothing (R10, R19). `casedrafts`'s description is the hand row's (op-grades); `reviewcopy` has no hand description, so its sentence is new.

**Failing-first tests** (`bio-plane/test/m/review/batch.test.mjs`, 8 tests, through `reviewOps` as the door runs it). Red on the unchanged source: the file did not load (`REVIEW_BATCH_COPIES_MAX` not exported), and the unchanged ops map ignores `projects` and `drafts`, answering the single dead answer. Green with the change: 8/8. They check: the batch equals the single answer id by id, with a hidden id and an unknown one (both the dead answer, byte-identical); a body list; a repeated id once; an empty list; no viewer / an outsider; a recipient's own draft and not another's, and a revoked grant; the bounds (at and over); `limit`; a snapshot proving nothing is written; the declarations held by `declaredOpHolds`.
**Why the tests missed it:** no batch read existed, so every test (and the screens) asked per item. **Test-gap fix:** the batch tests compare each id with the single read it replaces.
**Other test edits:** `declared-ops.test.mjs` (R42: all six ops, the list derived from the ops map, K3268; `casedrafts` and `reviewcopy` are reads), `invariants.test.mjs` (C-87.18 in the family table and driven at its interface).

**Platform check: N** (a data read; the dry-run gates of a copy still run once per draft, as the single reads did, so a batch of 20 copies costs what 20 single reads cost in the object, and saves 19 hops at 115-160 ms). No timing is asserted from the object's clock (R-CLOCK). Expected for the walker's rows: Home sends one `casedrafts` for its projects instead of five; the Ceremony one `reviewcopy` instead of two (the owners' jobs change the calls).

**Requirement lines I propose** (BOB writes `build/requirements/review.md`; test titles name R19, R10 R11 and R42 until then)
- **R44** (G12c; amends R19) `casedrafts` also takes `projects`, a list of at most 50 project ids (a body list, else comma-separated in the query), and answers `{ok, kind: "review-drafts-batch", count, lists}`: for each project asked, once, in the order given, exactly the answer the single read gives it (`NO_REVIEW_COPY` for a project the viewer has no standing in and for one that does not exist alike). A longer list is `REVIEW_BATCH_TOO_LARGE` (C-87.18), naming `max`, and nothing is read. Test: the batch equals the single answers id by id, a hidden id and an unknown one included. Control: an empty list answers `lists: {}`; a call with neither key is the dead answer.
- **R45** (G12c; amends R10, R11) `reviewcopy` also takes `drafts`, at most 20 draft ids, and answers `{ok, kind: "review-copies", count, copies}`, one copy per draft exactly as the single read gives it at either door (a recipient gets her grant's own draft and the dead answer for every other); `limit` applies to each; a longer list is `REVIEW_BATCH_TOO_LARGE`.
- Amend **R23** (C-87.18 `REVIEW_BATCH_TOO_LARGE`) and **R42** (`DECLARED_OPS` also declares `casedrafts` and `reviewcopy`, reads, with the accepted keys above and nothing required).

**For the seam owners (not mine):** control-plane's `casedrafts` arm (`index.mjs:3697`, `reviewAnswer`) and its `reviewcopy` stamping must forward `projects` / `drafts` and treat the answer, which is `ok` with the per-id answers inside, as a read answer (not as the dead answer's 404); store-door's `PROJECT_NAMING_READS` names `projects` and `drafts` and fences each id as the single read. Parameters: query `projects=a,b,c` / `drafts=a,b,c`, or a body list `{projects: [...]}`.

**Deferred:** nothing. **Found in another module:** nothing new. **Words owed:** `refusal.REVIEW_BATCH_TOO_LARGE` (stand-in above).

**Tests and checks run**
- `node --test --test-force-exit bio-plane/test/m/review/` = 95 pass, 0 fail (was 87; 8 new).
- The users `impact.mjs origin/tranche/T51 HEAD` names (10 modules, 184 files; 171 run besides review's 13): 1144 tests, 1143 pass, 1 fail: plane `release.test.mjs:74` R24 ("screen.objective.purpose is held by the words list"), a words-list state of the tranche, not touched by this change (the plan accepts `plane` `release` R24 by name).
- `node checks/run.mjs /home/user/bio`: format 1 failure, `build/plan/next.md:38` (N1265), inherited and not mine; architecture 0; coverage 0 (6617 of 6617); channels 0; words 0 failures (handlist 0, testcopy 0, missingkey 0).
- `node checks/ownership.mjs /home/user/bio review tranche/T51 job/T51/review`: 6 files changed by review, 0 failures.

Size (session_016SWyQAUyjKySSg7jMkWWY1): test runs 9, module lines 1703

## J13 · COMPLETE

COMPLETE for fix round 6 (G12c, provider). casedrafts takes projects (at most 50) and reviewcopy takes drafts (at most 20), each answering one single-read answer per id, a hidden or unknown id the same dead answer byte for byte; an over-long list is refused whole, REVIEW_BATCH_TOO_LARGE (C-87.18, stand-in words, row owed refusal.REVIEW_BATCH_TOO_LARGE). Both ops declared (K4208). Failing-first batch.test.mjs 8 tests (red: unchanged source ignores the keys), review suite 95/95, users 1143/1144 (plane release R24, accepted by name), checks and ownership clean for review (format failure next.md:38 inherited). Requirement lines R44, R45 and the R23/R42 amendments are proposed in my record, with the parameters control-plane and store-door must forward. No QUESTION open, nothing deferred.

## Completion record (fix round 10, Wave A batch 5, B18 START; REVIEW #25, session_01MSRpgw82aZM18FqtkcrU26)

`tranche/T51` merged at the start. Causes done:

1. **Own fixture lines (2):** `case-account/reviewCommentsRegistrar` (fixture.mjs:130, 131): the test world's `caseAccount.registerReviewComments` no longer hand-builds MALFORMED or REVIEW_COMMENTS_DECLARED; it takes `malformed`, `declared` and the first registration's `{ok: true}` from case-account's published `reviewCommentsRegistrar()` (`bio-plane/test/m/case-account/fixtures.mjs`, FIX-E, provider earlier in the order). Import added at the top of `fixture.mjs`.
2. **Contracts run (new `bio-plane/test/m/review/fixtures.test.mjs`):** `// fixtures-run: case-account review-copy-read` (R33: the registered reader answers ok false / NO_REVIEW_COPY, the dead answer whole, for no door, no viewer, case not held; writes nothing) and, from the found-before note, `// fixtures-run: case-inputs no-review-copy` (R10: ok false, reason and code NO_REVIEW_COPY, check C-87.1, member's words and detail, stable bytes).

Markers added: no `fixtures-own`, no `fixtures-generic`. The two `fixtures-run` lines wait for their users' markers only if those are not merged yet (case-account `comments.test.mjs:51` and case-inputs `fixtures.mjs:41` carry them already on this branch).

**Found in another module (for BOB):** case-inputs' stand-in `DEAD` (`bio-plane/test/m/case-inputs/fixture.mjs:61`) has `translation: "(the review copy's dead answer)"` and no `detail`; the real `noReviewCopy()` answers the full member's words in `translation` and a `detail` sentence. Same `ok`/`reason`/`code`/`check`. The real one wins; case-inputs changes its stand-in (or takes the shape from this run).

Checks: `fixtures.mjs . review --list` 0 failures (both lines at zero); module tests 97 pass, 0 fail; `format` 0 failures; `architecture` 0; `coverage` 45 of 45; `ownership` 0; `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules (tests only), so no user tests to run.

Size (session_01MSRpgw82aZM18FqtkcrU26): test runs 3, module lines 0

## J14 · COMPLETE

Fix round 10 batch 5 done: 2 own fixture lines at zero (case-account registrar fixture taken), fixtures-run added for case-account review-copy-read and case-inputs no-review-copy; tests 97/97, all checks 0. Found: case-inputs' DEAD stand-in lacks the real translation/detail (see record). Record: build/jobs/T51/review.md.
