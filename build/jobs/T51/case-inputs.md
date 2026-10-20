# case-inputs (T51)

**Status** · session_018B8XxZpqqS4khqQXoeQ55b · depth 2 · WORKING · handled B5

## J1 · QUESTION

R17 wording: "your group's Civicsmith" in the requirement and test title, "Your team's Civicsmith" in the words.

`build/requirements/case-inputs.md` R17 says the unread sentence names "your group's Civicsmith" (DEC-198 (7)). The test title at `bio-plane/test/m/case-inputs/openrequests.test.mjs`:150 says the same. The sentence the screen shows is `signing.openrequest.unread` in `docs/development/ux-substrate/screens/words.json`, which reads "Your team's Civicsmith couldn't read whether any request for comment on this case is still open, so none is listed here." The module reads it by key, and the test asserts the words.json text, so the test passes.

Best reading I am taking: the words file governs the sentence, since R10 and R17 say the words are read by key and never copied. The requirement's quoted phrase is a gloss on it.

Options:
(a) Keep "Your team's" in words.json; amend R17's quoted phrase and the test title to match. No behaviour change.
(b) Change words.json to "your group's" to match the requirement. That is a UX word, so it is your call, and it moves the words' stamp.

Recommendation: (a). I change nothing in code or words either way, and I will not touch the test title unless you pick (a) or (b).

## J2 · COMPLETE

T51-82 · case-inputs: complete, verified. No code change was needed.

**Entries applied.** T51-82 (reds #14 and #15). The code on `tranche/T51` already reads `signing.openrequest.unread` by key (`OPEN_REQUESTS_UNREAD_SENTENCE = fillWords(OPEN_REQUEST_KEYS.unread)`, `src/case-inputs/index.mjs`), and every C-136.3–.8 row reads `refusal.<CODE>` from `CASE_INPUTS_WORDS` (`src/case-inputs/checks.mjs`). My branch differs from `tranche/T51` only by the start commit, so there is nothing to diff. The two named reds pass on the branch: `openrequests.test.mjs` R17 (line 150) and `t46-words.test.mjs` R10/R12 (line 45).

**Deferred.** None.

**Found in another module.** None in the module's own code. The whole-repo `checks/run.mjs` run reports coverage failures in other modules, not mine: 23 modules have live requirement ids named by no test, for example `installer-steps` (36 of 36), `interface-shell` (12 of 98), `screens-inquiry` (14 of 79), `queue` (3 of 51), `installer` (6 of 70). These are other modules' to fix; I changed none of them.

**Open question (J1).** The R17 requirement and the test title say "your group's Civicsmith", while `words.json` says "Your team's Civicsmith". I read the words file as governing, since it is read by key. Your call on which to change; I have not changed either.

**Checks run on this branch.**
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio case-inputs`: 12 product files, 44 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio case-inputs`: 18 of 18 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio case-inputs tranche/T51 job/T51/case-inputs`: 1 file changed by case-inputs; 0 failures.
- `checks/run.mjs /home/user/bio`: architecture 0 failures; channels 0 failures; coverage 23 failures, all in other modules (above).
- `node --test test/m/case-inputs/*.test.mjs`: 48 pass, 0 fail.

**Size (session_01NHLtFixbMhA4qCMEieYzDT):** test runs 3, module lines 1337

## J3 · COMPLETE

COMPLETE again after B2 (ANSWER to J1, option (a)).

Merged `tranche/T51` into the job branch (d2a28ea55c). Restated the R17 test title at `openrequests.test.mjs`:150 from "your group's Civicsmith" to "your team's Civicsmith", so it matches the words. No other change.

Checks after the change:
- `node --test test/m/case-inputs/*.test.mjs`: 48 pass, 0 fail.
- format: 0 failures. architecture (case-inputs): 0 failures. coverage (case-inputs): 18 of 18 ids named by a test. ownership: 0 failures.

Deferred and other-module findings: unchanged from J2.

Size (session_01NHLtFixbMhA4qCMEieYzDT): test runs 4, module lines 1337

## J4 · QUESTION

R19 reading: the shape of `minutesLine(row)`.

R19 says `minutesLine(row)` "answers `{key, says}`: `signing.minutes.line` with `{meeting}` and `{date}`, beside `signing.minutes.left`, `.right` and, by `same`, `.same` or `.differs`". It does not say how the other four sentences are carried beside the line.

Best reading, built: `{key, says, left: {key, says}, right: {key, says}, comparison: {key, says}}`. The top-level `{key, says}` is `signing.minutes.line` filled with the row's meeting and date; `comparison` is `signing.minutes.same` or `.differs` by `same`. This is `openRequestLine`'s form (a line with a sibling object, as `quoting`), and `case-authoring` R77 can spread it into each row unchanged, as it does R34's.

If you want another shape (a flat list of four, or the labels left out), tell me with a CHANGE; it is a few lines and one test. `case-authoring` T51-161 reads the shape, so the answer should reach that job before it merges.

## J5 · COMPLETE

T51-160 · case-inputs: complete (restart #5, after B3).

**Entries applied.**
- R19 (Text: fold): `registerMinutesComparisons`, `minutesComparisonsSource`, `minutesComparisonsOn`, `minutesLine`, `MINUTES_KEYS`, in `index.mjs` beside R8's. The shape of `minutesLine` is my reading, asked in J4. A row whose `same` contradicts the whitespace-folded comparison of `minutes` and `filed` is malformed, so the source reads `undetermined` (a row saying "the two read the same" of texts that differ would tell a member something false). Tests: new `minutes.test.mjs` (3 tests, R19).
- Words (W): all 30 findings by the words rule, ids `case-inputs.<file stem>.<slug>`. `checks.mjs`: the eight `CASE_INPUTS_WORDS` copies are now `word(key)` with their placeholders kept for the caller (`keep`), the table equal to words.json verbatim as before. `document.mjs`: the recipient row, the participant row, the draft suffix and the truncation line are `localize` calls, byte-identical to the old output (they are in signed documents, K1333). `index.mjs`: the cites message, the draft-length reasons, the draft's `next` sentence, and every remaining acknowledge-statement detail (C-82.2, .3's suffix, .4, .5, .6, .7, .8), the `listed` sentences and the `why`, each one `localize` call with the same bytes. Plain findings (K3957): all three are sentences a member can read (they ride in a refusal's `detail`, the draft's `next` and a result's `why`), so all three are keyed, none listed as unread.
- Test copies: `t46-words.test.mjs` no longer holds C-82.8's sentence (reads `refusal.STATEMENT_ACK_NO_REASON` from words.json), the "is missing or isn't in that form" substring, or the retired T46 sentence (its "answered no longer" control is removed with it; the row equalling the key's sentence is still asserted).

**Deferred.** None.

**For BOB (another module's or the design's).**
1. words.json carries design rows under other ids for several of these sentences, spelled "acknowledgment" (for example `case-inputs.acks.rows.map.participant`, `.given_draft` without the dash, `.document.list_stops_acknowledgments`, `case-inputs.listed.*`, `case-inputs.why.case_document_authored`). I used module ids with the code's own text, so the signed document's bytes do not move (K1333). If the design means those rows to govern, it is a signed-text change to be ruled on, not a job's.
2. `signing.minutes.unread` exists in words.json (DEC-341) but R19 does not read it; `case-authoring` R77 draws `undetermined` with no sentence. A reader of R42 may expect a `MINUTES_UNREAD_SENTENCE` beside `OPEN_REQUESTS_UNREAD_SENTENCE`; say so and I add it (one line, a test).
3. `rows.mjs` is stale for my new ids, as expected (`build.mjs --check` names `case-inputs.document.given_on_draft`); BOB regenerates it.

**Checks.**
- `node --test test/m/case-inputs/*.test.mjs`: 51 pass, 0 fail.
- format: 176 modules, 175 requirements files; 0 failures.
- architecture (case-inputs): 12 product files, 47 relative imports; 0 failures.
- coverage (case-inputs): 19 of 19 live requirement ids named by a test; 0 failures.
- words (case-inputs): inline 0, plain 0, testcopy 0, missingkey 0, marker 0; 0 failures.
- ownership: 6 files changed by case-inputs; 0 failures.
- `checks/run.mjs`: the words and coverage failures it lists are other modules' (for example wizard-scripts); none names case-inputs.

Size (session_01XQkjrJ84xQvzqWSREkCCoB): test runs 3, module lines 1467

## J6 · COMPLETE

COMPLETE again after B5 (CHANGE).

Merged `tranche/T51` into the job branch. In `fixture.mjs` the two sentences the words check counted as test copies are now opaque tokens no assertion reads: the fixture's `caseIdentitySentence` answers `NEWCASE-IDENTITY` / `DERIVEDCASE-IDENTITY` for the two states that had sentences, and the writer line is `WRITER-LINE <stated>`. No test reads either.

Checks: the full-repo `checks/words.mjs` shows no finding in case-inputs; `node --test test/m/case-inputs/*.test.mjs`: 51 pass, 0 fail; format, architecture, coverage (19 of 19) and ownership: 0 failures.

Size (session_01XQkjrJ84xQvzqWSREkCCoB): test runs 5, module lines 1293

## J7 · QUESTION

QUESTION (not blocking; best reading below).

1. **`uses` edges.** My entries need three modules my `uses` does not list, all earlier in the order than me (index 119): `public-read` (110; R24 registers `casedetailspublic` with its R18 `registerPublicReads`, the way `case-checker` does), `entities` (55; R21's `area.entity` must be an entity the group holds: `entities.has`) and `promotion` (R24's `group` slug is `promotion.fact("producingGroup")`, as `network-notices` reads it). `modules.json` is yours, not mine. Best reading: please add `public-read`, `entities`, `promotion` to `case-inputs`' `uses`. I write the code on that reading; `checks/architecture.mjs` fails on my files until the edges are there.
2. **`needs` for `casedetailsset`.** A mutating op declared by its owner names its capability (op-declarations R80). Best reading: `needs: "contribute"` (the hand kind `member`: classes admin+member, `machineClasses: []`, as the draft's table says). `casedetails` is a session read (no `needs`).
3. **Hand rows I leave for BOB.** `statementack` (op-declarations `classes: null`, mutating, op-grades `reasoned`) and `whatchangedpropose` (classes admin/member/probe, `RUNG_ABSENT` ground `undetermined`): my `DECLARED_OPS` rows agree with them; both hand rows can go once the owner rows are registered.
