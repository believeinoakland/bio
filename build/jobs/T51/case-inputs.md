# case-inputs (T51)

**Status** · session_01NHLtFixbMhA4qCMEieYzDT · depth 2 · COMPLETE · handled B1

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
