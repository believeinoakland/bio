# case-authoring (T41)

**Status** · session_01RSu6BGSEYVGjuvDfZesRY5 · depth 2 · WORKING · handled B4

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
