# filings (T46)

**Status** · session_01NcPWBYKgvduyuc1wKo7quz · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two readings I am building on; neither blocks the job. Please confirm or correct.

1. R52 voice keys. Today the module answers a voice sentence only for `voice: "self"` (`voice_says`, key `filings.voice.self`). R52 lists `voice.group`, `voice.group.means`, `voice.self` and `voice.self.means`, and says "where each sentence is answered is unmoved". My reading: `voice_says` is answered for any text whose voice the member stated. It is `{key: "voice.<v>.means", text, voice: {key: "voice.<v>", text}}`, so a `group` text now carries `voice.group.means` and `voice.group` in the same place. A text that states no voice answers none.
   Likewise, `filings.secondapproval.given` had no site before. I answer it on `filingSecondApprove` (`given`) and on `filingsFor`'s `second_approval.given`. `filings.secondapproval.waiting` is not taken and has no site, so nothing is added for it.

2. R50 `second_needed`. It is true when R42's rule answers `needed` and no second approval is recorded. It is false for a draft already sent, and false for a `voice: "self"` text. In both cases `filingRecordSent` refuses (`ALREADY_SENT`, `NOT_THE_GROUPS_ACT`) before R42 would ask. An unapproved draft can still answer true.

## J2 · COMPLETE

**T46-37 applied on `job/T46/filings`** at 508352b864. I built on J1's two readings; BOB's answer is still pending. A different answer re-opens the job as a CHANGE.

**How the reading set was read (mechanics §17).**
- I read these whole myself (P20): `build/requirements/filings.md`; all of `bio-plane/src/filings/` (index, checks, outward, schema, dates; 3,444 lines after the change); T46-37 and rules 1–5 in `build/plan/current.md`; and B1.
- Two helper agents in this session were given my entry. Each read its part in full and wrote a digest citing each section:
  - All 14 files of the module's tests and the fixture (3,335 lines). That digest also records the baseline run: 92 pass, 0 fail.
  - The public parts of project-roster (R23, R24), action-holds, case-checker (R24), case-account (R13), action-grammar (R18, R19), actions, filing-templates and affordances (R51/R52), the words-by-key pattern, and layers.md's layer 9.
- The sources stay binding. Separately, I read in full the parts I changed or added to in `t45.test.mjs` (R34, R35, R39–R48, R8–R10).

**Entries applied**
- **R50 (N930)**
  - `filingsFor` answers `second_needed` per draft. It is true while R42's rule (`project-roster.secondApprovalNeeded`, read as `#secondNeeded` reads it) answers `needed` and no second approval is recorded.
  - It is false for a draft already sent, and false for a `voice: self` text (J1 (2)).
  - The action is read once per `filingsFor`, not once per draft.
- **R51 (N913)**
  - `FILINGS_WORDS` (`checks.mjs`, exported) holds `words.json`'s `refusal.<CODE>` words for C-115.45–.49 and .51–.53, verbatim. Each row's translation reads them by key. Codes, numbers and `where`s are unmoved.
  - `SECOND_APPROVAL_NEEDED` keeps its present sentence, as R51 says.
  - `HOLD_NOT_IN_PLACE` and `HOLD_PLACE_REFUSED` are still relayed from action-holds (`holdNotInPlace`, and `holdsOf`'s refusal passed through). Filings mints neither, so nothing changes when T46-33 merges.
- **R52 (N913)**: `KEYED` (`outward.mjs`) holds `words.json`'s words for the 18 keys R52 names.
  - `prepared.rests.accepted` now fills `{group}`, `{date}` and `{date_accepted}`.
  - `filings.election.notice` fills `{fact}` (the legal fact's statement, else its key) and `{citation}`. With no such fact, it says so in words.
  - Pointers are now answered:
    - each judged sentence of the record check carries `pointer.record.supported` (its `{findings}` named), `.unsupported` or `.contradicted`;
    - own-benefit, position and staff-named pointed sentences carry `pointer.selfbenefit`, `pointer.position` and `pointer.staff`;
    - `pointer.staff.notrun` replaces `filings.staff.not_run`.
  - `voice_says` is answered for a stated voice: `voice.<v>.means` plus `voice.<v>` (J1 (1)). `voice.self.means` replaces `filings.voice.self`.
  - `filings.secondapproval.given` (`{member}`, `{date}` = the day of its instant) is answered on `filingSecondApprove` and on `filingsFor`'s `second_approval`.
  - `phrasing.no_list`, `rfc.quoting` and `filings.review_copy.*` are kept, and `filings.secondapproval.waiting` is not taken, as R52 says.
- **case-checker R24 (T46-23, P5).** My R34 agrees. A sentence with nothing checkable that cites anything reads `supported`, naming its cites. A new test pins this beside the unsupported figure the T45 test already pins.
- **Own code read whole (P20, P8):** I found no flaw needing a fix beyond the change. I did one efficiency fix: `#secondNeeded` takes a pre-read action, so `filingsFor` does not read the action once per draft.

**Tests.** New `t46.test.mjs`: R50 (with controls), R51, R52 (the words, plus a control that fills each keyed sentence's placeholders from a draft, packet or communication), and R34 against case-checker R24. `t45.test.mjs` R44 and R48 are re-pointed to R52's replacement keys.
- `node --test bio-plane/test/m/filings/*.test.mjs`: tests 97, pass 97, fail 0.
- Users of filings (escalation, affordances, action-plans, plan-work, answer-envelope): tests 454, pass 450, fail 3. The same three fail on the tranche without this change, so none is mine:
  - affordances R48 ACT_HELP (rule 5 (7));
  - affordances R1/R12/R24 op maps (local-facts' map, T46-9);
  - escalation R21 (the record object; T46-1/T46-38).

**Checks** (process repository):
- `format`: 159 modules, 0 failures.
- `architecture filings`: 19 product files, 0 failures.
- `coverage filings`: 51 of 51 live ids named, 0 failures.
- `ownership filings tranche/T46`: 6 files changed, 0 failures.
- `run.mjs`: format 0 failures; architecture 2,957 product files, 0 failures; coverage 29 failures, all other modules' not-yet-met ids (rule 5 (1)), none of filings; channels 0 failures.

**Found elsewhere / stale artifacts**
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) carries filings' source, so this merge stales it (rule 5 (4), regenerated at layer close).
- The eight re-worded rows wait on T47's promotion stamp (rule 5 (2)).
- `affordances` can now read `second_needed` (its R51/R52).
- answer-envelope's tests pass with the new translations.
- The plan entry says "9 rows re-worded". R51 re-words 8, keeps `SECOND_APPROVAL_NEEDED`, and relays the two hold rows. I followed R51.
- action-holds R15 keeps `HOLD_NOT_IN_PLACE` and `HOLD_PLACE_REFUSED` in T46, while T46-33's entry says they are re-worded. That is action-holds' to settle. Filings relays whichever words they carry.

**Deferred:** none.

Size (session_01NcPWBYKgvduyuc1wKo7quz): test runs 7, module lines 3444
