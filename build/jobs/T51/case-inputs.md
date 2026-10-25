# case-inputs (T51)

**Status** · session_01HuoienLKeDjonTgFdKvMxF · depth 2 · COMPLETE · handled B10

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

## J8 · COMPLETE

COMPLETE for B6 (FR-17), after merging `tranche/T51` (6c78a2be15 on the job branch).

**Entries applied**
1. **C12 (K4169, K4171, K4185).** A case's details sit beside the case and never enter its signed document: four fields (area of government, point of contact, related work, relationship disclosure; no classification). `caseDetailsSet`, `caseDetails` (ops `casedetailsset`, `casedetails`, arms in `caseInputsOps`) and the public read `caseDetailsPublic` (`casedetailspublic`, registered with `public-read` R18 by the new `registerCaseInputsPublicReads(host, {publicRead?})`). New table `case_details` (append-only, declared whole to purge). New file `bio-plane/src/case-inputs/details.mjs` (shapes and words). Requirement lines R20–R28 are written by me in `build/requirements/case-inputs.md`, marked *(not yet met: T51)*, with Purpose, Terms, R11, R16, Uses and Satisfies amended (B7: not in this record).
2. **K4168.** `DECLARED_OPS` beside the ops map, with `casedetailsset` (classes admin, member; `machineClasses: []`; mutating; `reversible`; stamps `by`, `viewer`; needs `contribute`), `casedetails` and `casedetailspublic` (reads). R27.
3. **K4202.** `statementack` and `whatchangedpropose` declared from their hand rows; both register with `op-declarations` (R80/R81) and `op-grades` (R49/R50) with no disagreement (checked in a scratch process: 3 registered, 2 agreed). The requirement line for BOB is R29, written in the requirements file. Hand rows that can go in the round's second pass: `statementack` (`op-declarations` OPS row, `op-grades` RUNGS row and its description line in `t47.mjs`, `op-capabilities`) and `whatchangedpropose` (`op-declarations` OPS row, `op-grades` RUNG_ABSENT row and its description line, `op-capabilities` needs row).

**Judgments (best reading taken; CHANGE me if wrong)**
- `statementack` declares `secret`, not `secretSha` and `bySecret`: the door hashes and strips the caller's `secret` (control-plane N761), so `secretSha`/`bySecret` are door-set stamps and `secret` is what the screens send (without it three `screens-publish` R23 tests fail the guard as `FieldMismatch: statementack sent secret`; with it the module's counts are as at the tranche). `requires` is `[["draft","case","secret"],"reason"]`; `edition` (needed with `case`) is accepted and not required, since a conditional requirement cannot be stated.
- No catalogue rows (no new C-ids) for the new refusals: `MACHINE_CANNOT_SET_DETAILS`, `DETAILS_FIELD_UNKNOWN`, `DETAILS_MALFORMED` answer `reason` and a `detail` written once with `localize('case-inputs.details.*')`, as `BAD_WHAT_CHANGED` and `NOT_THE_PROJECT_OWNER` (case-authoring) do; `NO_SUCH_CASE` reads `refusal.NO_SUCH_CASE`; `NOT_PUBLISHED` is `public-read`'s own row C-98.8 (`rowOf`). If BOB wants rows, they take C-ids and move `CATALOG_VERSION`. The design stream could give `refusal.*` rows for the three.
- An empty list (`area`, `related`, `relationships.items`) is malformed; a clear is `value: null`. `relationships` `{none: true}` is stated, differing from not stated.
- The history is the latest 500 entries (`CASE_DETAILS_HISTORY_MAX`, `truncated`), oldest first; the standing values never come from it. A member's `set_by` and `by` are handles; no public answer carries either.
- Creating the instance (R16) registers nothing with `public-read`: registering there reached `publicReadOf(host)` and so other modules' instances at creation, which broke `action-replies` and `review` fixtures. Hence the exported function (the `case-checker` form).

**For BOB (other modules)**
- `plane`: call `registerCaseInputsPublicReads(ctx, {publicRead})` at start, beside `registerCaseCheckerPublicReads` (`plane/store.mjs`:332), and let `control-plane`/`op-declarations` route the public op `casedetailspublic` through `public-read`'s door as `casechecker` is. Until then the public read exists but is not registered in the running plane.
- `screens-publish` (the sheet reads `casedetails`, acts `casedetailsset`, per the declaration; the first case has an id only after its first save).
- `op-grades` tests hold two sentences that are now this module's `localize` words, so the words check counts them as test copies: `owners.test.mjs`:43 (`whatchangedpropose`) and `t47.test.mjs`:248 (`statementack`); they go with the hand rows in the second pass. The other words findings (`strength` inline, `op-grades` t36, t41, t46, t47:36, t48, t49) are not mine.
- Reds at the tranche base, unchanged: `op-declarations` R73 R21, `op-grades` R42 and R46 (`expertisewithdraw`, member-roster's), `review` 5, `screens-publish` 10, `interface-shell` 18.

**Deferred.** Nothing in this module.

**Tests and checks**
- `node --test bio-plane/test/m/case-inputs/*.test.mjs`: 71 pass, 0 fail (new: `details.test.mjs` 14, `declared-ops.test.mjs` 6; `invariants.test.mjs` updated for the fifth table and the five ops). The new tests fail against the tranche's code (not importable) and pass with the change.
- `checks/format.mjs`: 0 failures; `checks/architecture.mjs case-inputs`: 16 files, 0 failures; `checks/coverage.mjs case-inputs`: 29 of 29 live ids; `checks/ownership.mjs`: 1 failure, the requirements file, accepted per B7.
- `checks/words.mjs`: no finding in a case-inputs file (the two test copies above are in `op-grades`). `setup-words/build.mjs --check`: stale rows only (a `capture-sources` word), none naming this module.
- Neighbours: `public-read` 228/0, `test-support` 61/0, `case-authoring` 192/0, `consequences` 69/0, `filings` 140/0, `action-replies` 31/0 (now as at the base).

Size (session_018B8XxZpqqS4khqQXoeQ55b): test runs 32, module lines 1597

## J9 · COMPLETE

COMPLETE for B8 (G47, fix round 6).

**What changed.** `bio-plane/src/case-inputs/index.mjs` `#reauthorAcknowledgements` (about :884-890): when publication's splice leaves the hash unmoved, the answer now also carries the splice's `too_large` and `why` when it gave them, so a refused splice is never presented as done. Nothing else; nothing stored changes (R-OLD). Census ops: none changes its accepted keys (K4208).

**Failing-first tests** (`bio-plane/test/m/case-inputs/g47-splice.test.mjs`, titles name R2):
1. Pass-through, the publication's refusal shape stood in: red before (`too_large` and `why` undefined), green after; control: a working splice states neither key.
2. Seam, the real publication, a document sitting at `CASE_DOCUMENT_BYTES_MAX`: red now **by name** ("publication exports CASE_DOCUMENT_BYTES_MAX (PUBLICATION #36 has not merged)"); it waits for PUBLICATION #36 and goes green when it merges (control: a small document still re-authors).

**Providers' state.** CASE-GRAMMAR #20, PUBLICATION #36, CASE-CHECKER #16, CASE-DISCLOSURES #17 not merged when I ran. Please post a CHANGE when PUBLICATION lands so I re-run the seam test.

**Suite counts.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/case-inputs/*.test.mjs`: 72 pass, 1 fail (the seam test only). `build/plan/impact.mjs origin/tranche/T51 HEAD`: 45 modules affected; files failing outside my module: pdf-worker, scheduler, affordances, queue, screens-wizards, control-plane, plane, journey-check. I ran scheduler (151/0), queue (210/0) and affordances (274 pass, 4 fail: strengthbar/ACT_HELP/op-help tables, nothing about acknowledgements or the splice) directly; the rest are on the accepted-reds list or missing `src/journey-check/node_modules`; none touches this change.

**Checks** (`checks/run.mjs`): format, architecture, coverage (6685 of 6685), channels, words 0 failures, testcopy 0, inline 0. Ownership: 1 file changed by case-inputs (the pushed tests are in the commit after this run's snapshot; re-run at your merge), 0 failures.

**Requirement lines proposed (BOB writes them):** R2: "A re-author that publication refuses (`reauthored: false`, with `why` and, when the new text would pass the case-document byte bound, `too_large`) is answered by `acknowledgeStatement`'s `case_documents` entry as refused, with that `why` and `too_large`, the hash unmoved."

**Protective bound:** none set by this module (publication's `CASE_DOCUMENT_BYTES_MAX`, 1,572,864 B, is read, not owned).

**Deferred:** none. **Flaws in other modules:** none found.

Size (session_01QBHmyVdK3F9mLRdReuQNVZ): test runs 6, module lines 1604

## J10 · COMPLETE

COMPLETE again after B9 (CHANGE).

Merged `tranche/T51` (PUBLICATION #36 in). `g47-splice.test.mjs` seam test was red for a test reason, not the product's: my document was 276 B over the bound because I sized it from a bare text. It is now sized from a real small document's bytes (`probe`), and the stale "waits for PUBLICATION" wording is gone from its title and message. The code change is unchanged (`case-inputs/index.mjs` `#reauthorAcknowledgements`).

- Suite under the preload: 73 pass, 0 fail (the seam test is green: through the real publication, the splice at the bound is answered `reauthored: false` with `too_large` {bytes, bound} and `why`, stored text unchanged; control: a small document re-authors).
- `checks/run.mjs`: format, architecture, coverage (6685 of 6685), channels, words: 0 failures. Ownership: 3 files changed by case-inputs (code, test, record), 0 failures.
- Affordances' 4 reds (ACT_HELP, R62 R65 keys, R61 R62 B14, B12 strengthbarset) are red on `tranche/T51` without my change: I ran the suite on a clean worktree of `origin/tranche/T51`: 282 pass, 4 fail, the same four.

Seam reds remaining: none. Proposed R2 line: as in J9.

Size (session_01QBHmyVdK3F9mLRdReuQNVZ): test runs 9, module lines 1604

## J11 · COMPLETE

COMPLETE for B10 (fix round 10, Wave A batch 3: publish 2 fixtures).

**Done.** Pushed `ba75a5a180` on `job/T51/case-inputs`.
- `bio-plane/test/m/case-inputs/fixtures.mjs` (new): `carryOutcome()` and `statementAck()`. Each builds a fresh real world (fixture.mjs) when called and returns the real answers, never stored.
  - `carryOutcome()` (R9): `noSuchCase` (unpublished case, NO_SUCH_CASE), `badCarriedOutcome` (blank text, BAD_CARRIED_OUTCOME naming `text`), `ok` (`{ok:true, outcome}` for a joined participant).
  - `statementAck()` (R1, R12): `noReviewCopy` (viewer with no door; the real NO_REVIEW_COPY from review's `noReviewCopy()`), `noReason` (STATEMENT_ACK_NO_REASON), `ok` (the reasoned acknowledgement by joined `bo`).
- `bio-plane/test/m/case-inputs/fixtures.test.mjs` (new): 4 tests, each calling the fixtures and checking the answers against this module's refusal tables and review's real code.
- `bio-plane/test/m/case-inputs/fixture.mjs`: `reviewProvider` is now exported (one word). Only case-inputs' own tests import this harness.

**Lines done.** Nothing of mine is listed as a user: case-inputs is a provider in this batch. `checks/fixtures.mjs /home/user/bio case-inputs --list` (absolute root) reports 0 failures. The relative root `.` reports 0 without reading any file (K5066), so I used the absolute path.

**Lines left.** Users re-point in their own jobs: consequences (carryOutcome, 2 lines) and control-plane (statementack, 1 line).

**Markers added.** None (no `fixtures-own`, no `fixtures-generic`).

**Deferred.** None.

**Found in another module (for BOB; nothing changed by this job):**
1. control-plane's stand-in for statementack (`bio-plane/test/m/control-plane/statementack.test.mjs`, the stand-in at lines 14-27) answers `{ok:true, acknowledged:true, reason}`. The product's real success answer is `{ok:true, existed, acknowledgement:{kind, by, recipient, grant_id, at, reason, project, case_id, edition}, ...}`, so `acknowledged` is not a product field. The part-4 spec's `{acknowledged:true, reason}` follows the stand-in, not the product. control-plane's re-point should take the real shape from `statementAck().ok`.
2. The harness's `DEAD` constant (fixture.mjs) is a stand-in with a placeholder translation, not review's real `noReviewCopy()` answer. It is used by many of this module's tests, so I left it as it is and the fixture takes the real answer from review directly.
3. `checks/fixtures.mjs` with a relative root reports 0 failures without reading files (K5066). The START's `node checks/fixtures.mjs . case-inputs --list` gives a false zero; it needs the absolute root.

**Checks run** (on the committed tree, root `/home/user/bio`):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/case-inputs/*.test.mjs`: 77 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 178 modules, 178 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio case-inputs`: 17 product files, 66 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio case-inputs`: 29 of 29 live requirement ids named by a test; 0 failures.
- `checks/words.mjs /home/user/bio case-inputs`: 0 failures.
- `checks/fixtures.mjs /home/user/bio case-inputs`: 0 failures (see above).
- `checks/ownership.mjs /home/user/bio case-inputs tranche/T51 job/T51/case-inputs`: 4 files changed by case-inputs (the record, the three fixture files); 0 failures.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD` lists the affected modules. Its pass/total lines for other modules (for example control-plane 93/108, plane 74/89, pdf-worker 7/16, acquisition 52/53) are not caused by this job: my diff touches no product source and only this module's test folder, and nothing outside case-inputs imports the changed harness. I did not re-run those modules on a clean worktree of `origin/tranche/T51`, so that attribution rests on the diff, not on a clean run.

Size (session_01HuoienLKeDjonTgFdKvMxF): test runs 4, module lines 1602
