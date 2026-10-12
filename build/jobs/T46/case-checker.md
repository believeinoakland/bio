# case-checker (T46)

**Status** · session_018KyvpjWpStPQKywDPCaAeL · depth 2 · COMPLETE · handled B3

## Completion

**Entry applied.** T46-23 (N916), R24's T46 clause. The behaviour was already as the clause states and is kept; no behaviour changed. `account.mjs`' header now states it: a sentence not bias-marked that states nothing these arms can check (no figure, date, name or quotation) and whose cites were all read reads as supported, "supported" meaning only that it states nothing the cited record lacks, never that the cited record shows what it says. Arm 1's line there was corrected from "cites only what was not read" to "cites anything that was not read", which is what the code does. New test `R24 (T46; N916): …` in `account.test.mjs`. It covers four such sentences, each citing a held finding, a passage, a leg, or a finding with a passage, and none of them saying what is cited: each answers no departure. The control is the same sentence citing only what was not read, `ACCOUNT_SENTENCE_UNSUPPORTED` naming the cite. The mixed case, an unread cite beside a read one, is also `ACCOUNT_SENTENCE_UNSUPPORTED` naming only the unread cite (J1, my reading). Arm 3 still judges such a sentence against the record, so `CONTRADICTED` is not hidden by "supported" (filings R34's gate, case-account R13's control).

**My reading, open as J1.** "Cites anything that was read" is read as every cite read, at least one, because "behaviour kept" governs. If BOB answers with the literal reading, a CHANGE re-opens the job.

**Reading.** I read whole myself: my requirements, START B1, my plan entry, all my code (`account.mjs`, `check.mjs`, `index.mjs`, `lens.mjs`, `main.mjs`, `build-program.mjs`, `zip.mjs`, `standards.mjs`, `spec.mjs`; `program.mjs` is generated and was not read), and `account.test.mjs` and `program.test.mjs`. Two helpers in my session read the rest of the set in full and each wrote me a digest citing each section (K2032, mechanics §17 (3)). One covered my other test files (`check`, `fixture`, `lens`, `spec`, `standards`, `standards-offline`). The other covered the used modules' public parts, plus case-disclosures R22/R30, filings R34 and case-account R6/R13.

**Flaws found in my own module, fixed.**
- `check.test.mjs` R19: the "unlisted entry" control never carried the entry. The fixture writes only listed files, so the control asserted nothing. `fixture.mjs` gains `unlisted` (entries added to part 1 outside the manifest). The test now proves `readCaseFile` names `extra.txt` as unlisted and still reads every listed file intact.
- `lens.test.mjs` "R23 R12 … under every lens" ran only `removed`, and its last assertion checked the fixture, not the checker. It now runs `as_published`, the default, `removed` and two reader lenses. It checks that no case-level key appears and that every finding's pair, and its `as_published` pair, is per axis.

**Deferred, with why.** The readable specification (`spec.mjs`, R14) does not describe the `account:` check or the lens. R14 asks for what is written from `case-grammar` R11–R13, and `account:` is its R23, so this is not a requirement failure. Adding it would change the specification's text, which is BOB's call; I note it for a later entry.

**Found in other modules / for BOB** (also in my REPORT):
- `checkAccount` does not look at a row's `kind`. A statement or outcome row that is not bias-marked and cites nothing answers `ACCOUNT_SENTENCE_UNSUPPORTED`. case-disclosures R30 says such a statement's sentence "when it cites nothing the arms below still judge it" (K2533). The fix is either case-disclosures not passing arm 1's code for statement and outcome rows, or my R24 stating arm 1 is for `kind: account` only. That is a requirement call (P5) for BOB; I changed nothing.
- filings R34 and case-account R6/R13 carry no T46 text recording the narrowed meaning of "supported". The START said they are told at their own STARTs; I note it so it is not missed.

**Generated artifacts.** `program.mjs` is unchanged: the comment-only source change leaves the build byte-identical, and the R13 staleness test passes. The plane bundle includes `account.mjs`' source and may read as stale from the comment; regenerate it at layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/case-checker/`: 78 pass, 0 fail, 0 skipped.
- Users of R24: case-disclosures 95/0, case-account 32/0, case-import 96/0, filings 92/0.
- `checks/format.mjs`: 0 failures. `architecture.mjs case-checker`: 19 files, 0 failures. `coverage.mjs case-checker`: 24 of 24, 0 failures. `ownership.mjs case-checker tranche/T46`: 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0 (2949 files), channels 0. Coverage has 33 failures, all in other modules (interface-shell, screens-*, monitoring, etc.); none are case-checker's, and they are inherited.

Size (session_018KyvpjWpStPQKywDPCaAeL): test runs 9, module lines 2078

**B2 (K2964), B3 (K2965), applied after merging `tranche/T46`.**
- B2: BOB adopted my J1 reading and its wording. R24 now says "every thing it cites was read (at least one)", and the control covers a cite that is only, or also, unread. My test already pins this; no code changed.
- B3: arm 1's cites-nothing departure now judges only `kind: account` rows. A row with no `kind` is read as an account row, so existing callers are unchanged. A statement's or an outcome's sentence that cites nothing gets no arm-1 departure. Arms 3 to 5 still judge it, and a bias-marked one answers arms 4 and 5 (tested).
  - Arm 2 is judged against what a sentence cites, so it has nothing to judge a sentence that cites nothing against. My reading, open as J4: arm 2 does not judge such a sentence, exactly as before. Judging it would mean that every figure, date or name in a statement citing nothing is `ACCOUNT_FACT_NOT_IN_CITED`.
  - I tried that literal reading first. It broke 16 case-authoring tests (for example, a statement saying "edition 2" is refused at publishing), all of which pass on `tranche/T46` without it. So it would change the users' behaviour, and I did not keep it.
  - New tests: `R24 (K2965; …)`, covering five statement and outcome kinds with the account-row and no-kind controls, and `R24 R1 (K2965)`, offline: a statement row citing nothing recreates every finding, and an account row citing nothing differs.
- `program.mjs` was regenerated (`build-program.mjs`; the R13 test passes). The plane bundle is stale from `account.mjs` until the layer close regenerates it.
- Tests: case-checker 80/0. Users pass with 0 fail: case-disclosures 95, case-account 32, case-import 96, filings 92, case-authoring 204.
- Checks: format, architecture, coverage (24/24) and ownership all show 0 failures. `run.mjs` shows architecture 0; its 33 coverage failures are other modules', inherited.

Size (session_018KyvpjWpStPQKywDPCaAeL, after B3): test runs 17, module lines 2088

## J1 · QUESTION

R24's T46 clause: "reads as supported ... whenever it cites anything that was read". Read literally, a sentence with nothing checkable that cites one held finding AND one thing not read is supported. Today's behaviour (which the entry says is kept) answers that sentence `ACCOUNT_SENTENCE_UNSUPPORTED`, naming the unread cite ("cites F9, which is not among what it may cite"): any cite not read is arm 1's departure, whatever else the sentence cites.

My best reading, which I am building on: "behaviour kept" governs, and "cites anything that was read" means its cites are all read (at least one). So: such a sentence citing only held things answers no departure; citing only what was not read, or anything not read beside what was, answers `ACCOUNT_SENTENCE_UNSUPPORTED` naming the unread cites. My test pins all three. If you mean the literal reading instead (a read cite excuses an unread one), say so and I change the code and the test; it would be a behaviour change for `filings` R34 and `case-account`, since a cite to something not read would no longer be refused.

Suggested re-wording, if you agree: "... whenever every thing it cites was read: ..." with the control extended "... citing only, or also, what was not read answers ACCOUNT_SENTENCE_UNSUPPORTED".

## J2 · REPORT

For BOB (details in my record's Completion): (1) checkAccount does not read a row's kind, so a statement or outcome row that is not bias-marked and cites nothing answers ACCOUNT_SENTENCE_UNSUPPORTED, while case-disclosures R30 (K2533) says such a statement sentence is still judged by the other arms. This is a requirement call (P5): either case-disclosures drops arm 1 for those rows, or my R24 limits arm 1 to kind: account. Nothing changed. (2) filings R34 and case-account R6/R13 carry no T46 text of the narrowed 'supported'; this is for their STARTs, as B1 says. (3) My spec (R14) does not describe the account: check or the lens. That is not a failure under R14's wording, so it is deferred to a later entry if wanted. (4) The plane bundle may read as stale from a comment-only change to account.mjs. program.mjs is unchanged and verified.

## J3 · COMPLETE

T46-23 applied: R24's T46 clause holds as already built, behaviour kept, and is now stated in account.mjs and tested by 'R24 (T46; N916)'. That test covers held cites passing, the unread-only control giving UNSUPPORTED, mixed cites giving UNSUPPORTED (my reading in J1, still open), and arm 3 still judging. Two weak tests in my own module were fixed: R19's unlisted-entry control now really carries the entry, and R23 R12 now runs every lens. case-checker tests 78/0; users case-disclosures, case-account, case-import and filings pass with 0 fail. format, architecture, coverage (24/24) and ownership: 0 failures. run.mjs: architecture 0; the coverage reds are other modules'.

## J4 · QUESTION

K2965 (B3): 'a statement's or outcome's sentence that cites nothing is judged by the other arms alone'. Arm 2 (ACCOUNT_FACT_NOT_IN_CITED) is judged against what a sentence cites. My best reading, now built: a sentence citing nothing gives arm 2 nothing to judge against, so it does not judge it, exactly as before; arms 3-5 do (a bias-marked one answers 4 and 5). I tried the literal reading first, where every figure, date or name in a statement citing nothing is FACT_NOT_IN_CITED. It broke 16 case-authoring tests that pass on tranche/T46 (e.g. a statement saying 'edition 2' refused at publishing), a behaviour change for case-disclosures R30's callers. If you want the literal reading, it is a requirement change for case-authoring/case-disclosures too; say so and I switch it.

## J5 · COMPLETE

B2 and B3 applied after merging tranche/T46. B2 (K2964): already tested, no code change. B3 (K2965): arm 1's cites-nothing judges kind: account rows only, and a row with no kind is read as account. Statement and outcome rows citing nothing get no arm-1 departure; arm 2 does not judge them (my reading, J4); arms 3-5 do. Tested directly and offline (R1). program.mjs rebuilt; the plane bundle is stale until layer close. case-checker 80/0; users case-disclosures 95, case-account 32, case-import 96, filings 92, case-authoring 204, all 0 fail. format, architecture, coverage 24/24 and ownership: 0 failures. Record updated.
