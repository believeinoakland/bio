# review (T51)

**Status** · session_012TPvP8gm8qT2VjtUB8E9Dk · depth 2 · COMPLETE · handled B2

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
