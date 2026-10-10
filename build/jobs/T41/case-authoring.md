# case-authoring (T41)

**Status** · session_01RSu6BGSEYVGjuvDfZesRY5 · depth 2 · COMPLETE · handled B13


## Completion (CASE-AUTHORING #23)

**Reading set** (mechanics §17): measured 657 KB for the module's own code (250 KB) and tests (407 KB), over 300 KB, so the over path (K2304).
- **Read whole myself:**
  - `build/requirements/case-authoring.md`;
  - layer 8's row of `build/layers.md`;
  - the plan's T41-43 entry and rule 4;
  - K617, K2438, K2442, K2451, K2471, K2483 and `build/extraction/publication-split-3.md` §6;
  - `src/case-authoring/index.mjs` and `document.mjs`;
  - the tests the entry changed: `fixture`, `waiting`, `converts`, `statement`, `fences`, `whatchanged`, and the changed tests of `document`, `invariants`, `standards`, `identity`, `preflight`, `photos` and `documents`;
  - the used services my Uses names for this entry: publish-schedule R1–R4, R7, R8; case-grammar R23–R26 and its `account.mjs`; case-disclosures R29–R31 and its J1; ratification R18, R49, R50; review R32, R33 and its J1; record-grammar R52 (`acceptance.mjs`, `acts.mjs`, `proposalLabel`); membership R43, R44 (`viewerPredicate`, `existenceAct`); answers R33 (`checkSentences`' `cited` shape); ai-runs `runFor`.
- **Read by two workers, each file whole:** `checks.mjs`, `searched.mjs`, `schema.mjs` and the 17 other test files. Their summaries were about 2,400 and 2,500 words, every statement citing file:line.
- **What the summaries found that mattered:** the exact pre-flight step lists and blocker lists (re-stated), the two R65 test sites (`standards`:79, `invariants`:48), and that case-disclosures R30's "cites nothing" arm would refuse every statement (raised as J2 (10), answered K2533).
- Nothing they left out mattered.

**Entries applied (T41-43):**
- **D54** (K2442): `index.mjs`:974 and :1735 read the manifest as `PLANE_VIEWER` (`class:daemon`). `converts`:174, `statement`:59, `fences`:38, `whatchanged`:154 and `document`:103/:284 are re-stated, each with a negative control: a discoverable project or an invited administrator still at FULL, and a member's or the founder's own read still fenced.
- **R58, R59** (N823): the waiting edition is read through `publish-schedule.waitingEditionOf` (R7). `waiting.test` uses the real module, merged.
- **R63:**
  - the account and `statementCites` are shaped (`BAD_ACCOUNT`, `BAD_STATEMENT_CITES`);
  - case-disclosures R30 (`accountJudged`) is asked after R55 and R38 and before R11, with `{account, statements, cited, lens, conclusions, flags, viewer}` (K2531);
  - `cited` is `{holdings: [{address: "kind:ref[#ord]", quote}], rules, looks}`;
  - R30 failing to answer is `ACCOUNT_CHECK_UNDETERMINED` (fail closed);
  - case-grammar R23's block is always written (the statement rows always), with its section when the account has a sentence.
- **R64** (K2536):
  - `accountPropose` and `accountDrafts` take `case_account` (`ACCOUNT_FRAMINGS`) and `account_check` (flags) drafts, stored append-only in two new purge-declared tables, `account_drafts` and `account_acceptances`;
  - `accountDraft` is taken up `edited` or `own_instead`, and `as_proposed` is refused `ACCEPT_MUST_REAUTHOR` (C-33.54);
  - the `acceptanceRecord` is stored;
  - the label is composed through `lawProposalState`, since record-grammar has no subject for it (N838).
- **R65:** `AUTHORED_FIELDS` and `ACT_FIELDS`; any other field is `CASE_FIELD_NOT_ALLOWED`, asked last of R3's refusals.
- **R66:** `registerReviewComments`; R25's block is always written, `left_out` null when undetermined; refusals `REVIEW_COMMENT_NOT_FOUND`, `REVIEW_COMMENTS_UNREAD`, `BAD_REVIEW_COMMENTS`.
- **R67, R68:** pre-flight steps 6 "the account", 7 "approvals", 8 "sign". R26's block is written at the approval digest (two passes), read through `ratification.approvalsInForce`. `APPROVAL_MISSING` is among `blockers` (once, ratification R18's when it carries it).
- **R8** (K2540): a preparation of this same case edition is replaced. `identity` and `waiting` are re-stated with negative controls.
- **Re-stated for providers:** case-grammar R12's `marked` (`documents`:147, `photos`:60).

**Deferred, with why:**
- B8's re-pins (`invariants.test`:76 to C-120.23–.29, `preflight.test`:67) and B10's (`photos.test`:76, `PUBLISHED_LABEL`): each waits on case-disclosures' merge, so I take them by its CHANGE.
- The split of R63–R68 to `case-account`: N839 (K2542).

**Found in other modules:**
- case-disclosures' `photo.refused.unchecked` words (routed, K2533).
- record-grammar R43 has no account-draft subject (N838).
- R8's conflict with re-preparation (K2540, mine, built).

**Final `uses`, for BOB to apply:** the current list plus `ai-runs` (R64's `runFor`; the architecture check's one failure until it is applied).

**Tests:**
- With local, uncommitted stand-ins for case-disclosures' `accountJudged` and ratification's `approvalsInForce` (neither module merged yet): `case-authoring` 178/180. The 2 reds are case-disclosures' wording (`photos`:101, `preflight`:67), red before this job.
- On the committed tree alone: 29/180, because R63 fails closed (`ACCOUNT_CHECK_UNDETERMINED`) until case-disclosures provides `accountJudged`. Both providers merge before this module (L8 order), and I re-run at their CHANGE.
- Users' suites (review, affordances, answer-envelope, control-plane, plane): the tranche's own reds exactly, none new.

**Checks:**
- format: 0 failures;
- architecture: 1 failure (`ai-runs` not yet in `uses`);
- coverage: 52 of 52;
- ownership: 0 failures.

Size (session_01RSu6BGSEYVGjuvDfZesRY5): test runs 28, module lines 4,137

## J1 · QUESTION

Readings I am building on now (T41-43). Answer only where you read otherwise; items 3, 6 and 8 touch other modules' interfaces.

**Found before START (your B1):** the two case-authoring paths red before D54 are `photos.test.mjs`:108 (R34) and `preflight.test.mjs`:67 (R29). Both read `photo.refused.unchecked` from `docs/development/ux-substrate/screens/words.json` ("Signing waits until every photo in the case is checked, including one that only supports a finding: {photo}."), while `case-disclosures/checks.mjs`:29 still holds the older words ("…every photo the case relies on is checked: {photo}."). The fix is case-disclosures' (its R22: read the key); nothing in mine changes. The D54 reds are `converts`:190, `statement`:25, `whatchanged`:174, as listed; `fences` passes today, and I am re-reading it for D54.

**Size:** 3,473 lines now; R58–R68 add about 300, so about 3,800, under 4,000. I am building it all here.

1. **R58, R59.** I import `publishScheduleOf` from `../publish-schedule/index.mjs`, reached lazily (`deps.publishSchedule`, else `publishScheduleOf(host)`), and call `waitingEditionOf(case)` for both R58 and `#waits`. Until T41-37 merges, I run against an uncommitted local stub; full runs wait on your CHANGE. `waiting.test.mjs` uses the real `publishSchedule.scheduleEdition` once it merges.
2. **R65.** The known inputs are:
   - the authored fields, exactly: `statement`, `subjectJustification`, `excluded`, `whatChanged`, `scope`, `biasAcknowledgement`, `account`;
   - the act's other arguments, unchanged: `target(s)`, `project`, `roles`, `caseId`, `newCase`, `draft`, `subjectPosition`, `tensionsDisclosed`, `selfAttested`, `flagsDisclosed`, `calculationsDisclosed`, `peopleBases`, `tieAttested`, `accountDraft`, `reviewComments`, `viewer`, `author`.

   Any other key with a value that is not undefined is refused `CASE_FIELD_NOT_ALLOWED`, naming the keys. It is asked last in R3's order (after `BAD_COMPLETENESS`), so no existing caller's diagnosis changes. It has no catalogue row (R29 names none, like `NO_WHAT_CHANGED`). review's `REVIEW_DRAFT_FIELDS` all fall in the known set.
3. **R63 → case-disclosures R30.** After R55's judgments and before R11, I call `accountJudged({account, statements, cited, lens, conclusions, viewer})`:
   - `account`: the rows as given, each `{ord, text, cites, bias_statement}`;
   - `statements`: `{statement, subject_justification, excluded, what_changed}`;
   - `lens`: R40's `#lensStatements` read;
   - `conclusions`: each member's R4 conclusion;
   - `cited`: what this act already read, `{findings: [{id, bundleSha, conclusion, claim}], materials: R6's materials, passages: null}`. Passages are read after R11 (`findingFacts`), so case-disclosures reads a cited passage itself.

   Each cite is `{kind, ref, ord}`, as case-grammar's J1 item 2 reads R23. I write `accountLines(rows)`:
   - the account rows, `kind: "account"`;
   - the four statements as rows (`kind` `statement`, `subject_justification`, `excluded`, `what_changed`) with `cites: []`.

   Pre-flight `blockers` take every R30 refusal. With `account` absent or empty, no account rows are written, R30 is still asked over the four statements, and no `account:` block is written when there are no rows at all. If case-disclosures settles another shape, please carry it to me by CHANGE.
4. **R64 drafts.** A new table `account_drafts`, append-only and declared to purge whole.
   - `accountPropose({case, framing, text, run, proposedBy, viewer})` (`op=accountpropose`) is labelled `proposalLabel(proposedBy, "case_account")`.
   - `case` is a case the viewer sees through its project, published or with an unsigned preparation (a first edition's account is drafted before anything is published).
   - `framing` is one of `["time_order", "by_question", "by_rule"]` (run-rules R25's three).
   - `run` must answer `ai-runs.runFor(run, viewer)` (a new `uses` edge to `ai-runs`, index 82, earlier).
   - Refusals: `NO_SUCH_CASE`, `NO_SUCH_RUN`, `BAD_ACCOUNT_FRAMING`, `BAD_ACCOUNT_DRAFT` (text blank or over 8,000), with no rows.
   - `accountDrafts({case, viewer})` lists oldest first, up to 500 with `truncated`.
   - `accountDraft` at `op=publish` is a draft id or `{draft, form}`:
     - the form is derived when absent (identical sentences = `as_proposed`, else `edited`) or given as `edited` or `own_instead`;
     - `as_proposed`, given or derived, is refused `ACCEPT_MUST_REAUTHOR` (record-grammar's C-33.54 row);
     - a draft not of this case is `NO_SUCH_ACCOUNT_DRAFT`;
     - the `acceptanceRecord` (kind `case_account`) goes in the answer and a table `account_acceptances`, purge-declared;
     - every account row carries `began_as: machine_draft` and `draft`; with no draft, `member`.
5. **R66.**
   - `registerReviewComments(fn)` takes one function; a second is refused `REVIEW_COMMENTS_DECLARED` and a non-function `MALFORMED`.
   - publishCase calls `fn({case, edition, viewer, draft})` once the edition is known (review J1 item 4's shape, rows `{comment_id, reviewer, text, at}`).
   - A chosen id not in the answer is `REVIEW_COMMENT_NOT_FOUND`. A reader that throws or gives no list is `REVIEW_COMMENTS_UNREAD` when comments were chosen, and leaves the count undetermined when none were chosen.
   - With nothing registered, no comment travels and the count is undetermined (no refusal).
   - I write `reviewCommentsLines({comments, left_out})` with `left_out` a number, or null for undetermined. **case-grammar's J1 item 4 reads it as always a number**, so please tell case-grammar that null means undetermined.
6. **R68.** The reader is ratification R50's, but no read of it reaches me. Reading: ratification exports `approvalsInForce({case, edition, docSha})` → `{rule: {approvers}|null, approvals: [{by, at}], missing: [ids]}`, or `{ok: false}` when it cannot read them. The pre-flight's step "approvals" states it; `APPROVAL_MISSING` reaches `blockers` through R18's list (ratification R49 puts it there), and through my own read when R18 is not reached. Please carry this to ratification, or name the read it gives.
7. **Steps (R67, R68).** The pre-flight gains "the account" and "approvals", inserted before "sign": steps 1–5 are unchanged, then 6 "the account", 7 "approvals", 8 "sign". `photos.test`'s exact list is re-stated.
8. **ratification R49's last sentence** ("the rule and approvals in force are written into R26's block by case-authoring") is not in my R-text. As case-grammar's J1 noted, a document cannot carry approvals of its own `doc_sha`. I am not writing R26's block in this job. If you want the rule alone written at authoring (`approval_rule`, with `approvals: []`), say so and I will add it.
9. **D54.** `index.mjs`:974 and :1735 read the manifest as `class:daemon`, the machine viewer (sees every bundle; bias's `#lens` asks `membership.inSight`). The tests use a hidden project with the founder neither invited nor joined, with a negative control: a member's own read of another hidden project's manifest is still fenced.

## J2 · QUESTION

Adds to J1 (replaces nothing in it).

10. **case-disclosures R30 over the four statements.** R30 judges every sentence of the four statements against what it cites, and its first arm is `ACCOUNT_SENTENCE_UNSUPPORTED` for a sentence citing nothing. But `publishCase`'s statements carry no citations today (`statement`, `subjectJustification`, `excluded[].reason` and `whatChanged.text` are plain strings). Read literally, every publish refuses, including every existing caller (review's dry run, every test fixture).

    My reading: `publishCase` hands R30 the statements uncited (`cites: []`), and case-disclosures decides how an uncited statement is judged. Its other arms still run on them: a fact not in what is cited, a contradiction of the record, a bias claim. That leaves "cites nothing" refusing only an `account` sentence. If instead the statements must cite, R63/R65 need an input for their citations (for example `statementCites: {statement: [...], subject_justification: [...], excluded: [[...]], what_changed: [...]}`), and that is a requirement change for you to word. Please carry the answer to case-disclosures (T41-42) too.
11. **R65 re-states two tests.** `standards.test.mjs`:79 (R60) passes `subject_entity`, `subjects` and `subjectEntity` to show a caller cannot set the subject, and `invariants.test.mjs`:48 (R25) sends `statement_by` and `statementBy` in the body. Under R65 both are refused `CASE_FIELD_NOT_ALLOWED`, naming the keys. I re-state both to expect that refusal: it is stronger than ignoring the keys. Each keeps a negative control, the same act without the extra keys publishing with the subject or writer read from the record.

## J3 · QUESTION

One open point from B3 (K2531); building on my reading meanwhile.

**Where the `account_check` flags are held.** B3 asks me to pass R30 the flags `[{kind: "account_check", ord, text, cites}]` "from what you already read", but nothing I read holds them. They are an AI run's draft of kind `account_check` (run-rules R25, skills R44), and no requirement names who stores them; my R64 stores only `case_account` drafts.

My reading: `accountPropose` also takes `kind: "account_check"` (default `case_account`) with `flags: [{ord, text, cites}]` in place of `text`. It is stored in the same append-only table, labelled machine work, and listed by `accountDrafts`. `publishCase` passes R30 the flags of every `account_check` draft of this case proposed after the account draft it names (or all of them with none named), in proposal order. That is one more argument shape on R64; please word it, or name the owner of the flags.

Until you answer, `publishCase` passes the flags this table holds (none, unless proposed so), and every other part of R63–R68 stands.

## J4 · QUESTION

A conflict in my own requirements, found building R64 and R68. It decides one test; everything else is built.

**R8 versus "preparing again".**
- R8 refuses `ALREADY_A_CASE_MEMBER` when "any unsigned preparation" pins a member's current bytes and records the same conclusion. That includes this case's own unsigned preparation of the same edition: `waiting.test` pins it (after a cancel, publishing again answers `ALREADY_A_CASE_MEMBER` with `state: "prepared"`).
- But R68 (K2533) says "approvals that arrive later are carried by preparing the document again (its digest unchanged)".
- R64's drafts of a first edition's account can only be proposed once a preparation exists (a case id is minted only by `op=publish`). Taking such a draft up therefore also means preparing again.
- R14 already expects it: `storeCaseDocument` replaces an unsigned document of the same case edition.

So as worded, neither R68's re-preparation nor a first edition's account from a draft can happen.

**My reading (needs your wording of R8):** R8's unsigned-preparation arm refuses only a preparation of *another* case, or of another edition of this one. A preparation of this case edition is replaced by the new one (R14, publication R21). `waiting.test`'s assertion after a cancel becomes "the act goes on and replaces the preparation", with a negative control: another case's preparation still refuses.

I have **not** built this. I am testing R64 and R68 on editions above 1 of a published case, which work today. Say yes and I build it, or word it otherwise.

**REPORT (another module):** record-grammar's `PROPOSAL_STATES` has no subject for an account draft, so `proposalLabel(…, "case_account")` throws. R64 labels its drafts through record-grammar's `lawProposalState` with this module's own sentence. A `case_account` (and `account_check`) subject in record-grammar R43 would let it use the one composer.

## J5 · REPORT

**Size (P6, K617): case-authoring now measures 4,131 lines over its paths, past about 4,000.** At START I estimated about 3,800 and so did not report before building. That estimate was wrong: R63–R68 took 658 lines, not the ~300 I counted (`index.mjs` 3,039, `document.mjs` 676, `schema.mjs` 98, `checks.mjs` 169, `searched.mjs` 149).

Built and green, every R58–R68 id named by a test (coverage 52/52).

**Where the seam is**, if you move the account out as your START allowed ("the account's R63–R68 then move to a module after you"):
- separable whole, about 430 lines: R64's drafts (`accountPropose`, `accountDrafts`, `#caseForDrafts`, the label, the two tables), R66's reader (`registerReviewComments`, `#reviewCommentsChosen`), and the account's helpers (`accountShaped`, `#accountDraftJudged`, `#accountJudged`, `#citedFor`, `#accountFlags`);
- staying in `publishCase` and the pre-flight: the calls into them, about 120 lines.

That would leave case-authoring at about 3,700.

**Options:**
1. Merge as is and split at its next job (K617's standing rule).
2. Split now into a module directly after case-authoring (`case-account`), with requirements R63–R68 moved; I move the code in this job.
3. I trim comments and duplication in this job, to about 4,000.

Recommendation: 1, because nothing in T41 needs the seam. If you prefer 2, send a CHANGE naming the module and I do the move.

**Other state:**
- Uses to apply at merge: `ai-runs` (R64's `runFor`; architecture check fails until applied), and `publish-schedule` already in `modules.json`.
- My suite: 177/179. The 2 reds are case-disclosures' `photo.refused.unchecked` wording (routed to it, K2533).
- The five users' suites (review, affordances, answer-envelope, control-plane, plane) carry exactly the tranche's own reds, none new.
- Waiting on: J4 (R8 against re-preparation), and the CHANGEs for ratification (`approvalsInForce`) and case-disclosures (`accountJudged`), each run here meanwhile against an uncommitted local stand-in.

## J6 · COMPLETE

T41-43 built; my record's Completion has the detail.

- **Built:** D54 re-stated; R58, R59 through publish-schedule (real); R63–R68; R8 per K2540.
- **Size:** 4,137 lines, merged as is per K2542 (split N839).
- **Uses:** add `ai-runs`. It is the architecture check's one failure until applied.
- **Checks:** format 0, coverage 52/52, ownership 0.
- **Tests:** 178/180 with local stand-ins for case-disclosures' `accountJudged` and ratification's `approvalsInForce`. The 2 reds are case-disclosures' wording, red before this job.
- **Read this before merging:** on the committed tree alone it is 29/180, because R63 fails closed (`ACCOUNT_CHECK_UNDETERMINED`) until case-disclosures provides `accountJudged`. Both providers merge before me in L8's order. Their CHANGEs re-open me for B8/B10's re-pins and a full re-run.
- **Users' suites:** no new reds.

## J7 · COMPLETE

Re B12 (K2543): merged tranche/T41 at e2f3e4b7f7 (publication). Nothing changed. case-authoring is 178/180 with the local stand-ins for accountJudged and approvalsInForce; the 2 reds are case-disclosures' wording. On the committed tree alone it is 29/180, because R63 fails closed until case-disclosures merges. Checks: format 0, coverage 52/52, ownership 0, architecture 1 (ai-runs to add to uses). J6 stands.
