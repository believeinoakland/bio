# review (T41)

**Status** · session_01DoW3RXN1QKQ4zf62pWZg41 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Readings for R30–R33 (T41-44). I am building on these now; tell me which to change.

1. **R30 `approvalRuleSet({approvers, by})`.** `approvers` is `null` (off) or an array of 1–50 member ids, each an `active` member (`membership.memberFacts`), de-duplicated in order. A non-administrator `by` (R64, a machine `by` included) is refused through `membership.notAnAdmin` (C-96.1). A bad list is refused `APPROVAL_RULE_BAD_APPROVERS` (new row **C-87.13**). Each set is appended to a new table `approval_rules` (`seq`, `approvers` JSON or NULL, `set_by`, `set_at`). The latest row is in force; with no row there is no rule.
2. **R31 `caseApprove({case, edition, docSha, reason?, by})`.** A case nobody may see, a `by` without sight of the case's project (`publication`'s `cases`, R40; `viewerPredicate("member:"+by)`), no rule in force, or a `by` not in it: all one answer, `NOT_AN_APPROVER` (**C-87.14**), so it is no oracle. Then `APPROVAL_NO_SUCH_DOCUMENT` (**C-87.15**) when no `case_documents` row (R40) of that case and edition is at `docSha` (malformed sha or edition included). Then a `reason` over 4,000 characters after trimming gets `APPROVAL_REASON_TOO_LONG` (**C-87.16**). An approval is appended to `case_approvals` (`case_id`, `edition`, `doc_sha`, `by`, `reason`, `at`); a repeat of the same case, edition, doc_sha and approver answers `existed: true`. Both tables are declared to purge whole-store, as R24's are.
3. **R32.** At start: `ratification.registerApprovalReader({rule(), approvals({case, edition, docSha})})`. `rule()` answers `{approvers, set_by, set_at}` or `null`. `approvals` answers `[{by, at, reason}]` at exactly that `doc_sha`, in order.
4. **R33 "the case's review copies".** Each comment now records the case identity its draft stood at when the comment was made (new nullable columns `case_id`, `edition` on `review_comments`, never back-filled), as a grant does. `reviewCommentsFor({case, edition, viewer, draft?})` lists the comments recorded at (case, edition) on drafts of that case's project. When `draft` is given (the draft `publishCase` names, case-authoring R9), it also lists that draft's comments recorded at its present identity, which is how a new case's copies are reached. Each row is `{comment_id, draft_id, reviewer, reviewer_kind, text, at}`: `reviewer` is the member id, or for a recipient the grant's recipient label. The list is capped at 500, `truncated` said. A viewer without standing in the project (R9) gets the dead answer. **`draft?` is an addition to the stated interface:** without it, a new case's comments cannot be reached.
5. **R33's "told once" read for `notice-producers` R17.** A new read, `reviewCommentsLeftOut({viewer, limit})`, writes nothing. For each published edition (a `published_cases` row whose `case_documents` row is signed), it takes the candidates as in 4 (that edition, plus the document's `draft_id`). It removes the comments the signed document carries in its `review_comments:` block (`case-grammar` R25's `reviewCommentsOf`, matched on `{reviewer, text, at}`). It answers the viewer's own member comments that were left out, one item per case edition: `{key: "FINDING::review-comment-left-out::<case>::<edition>::<member>", case, edition, project, left_out}`. "Once" is the item key (`queue` keeps no items). This adds two `modules.json` uses edges, `case-grammar` and `ratification`; the full list is in my record.
6. **No ops** for R30/R31 here: adding entries to `reviewOps` would turn op-declarations and affordances red, so I take them to be owed in L11 like other new acts. Tell me if you want `approvalruleset` and `caseapprove` in `reviewOps` now.

## Completion (REVIEW #11)

**Reading set** (mechanics §17): measured as §3 asks: my requirements (17 KB), the module's code and tests (170 KB at START), layer 8's row of `build/layers.md`, and the Purpose of each used module plus the services my Uses names (membership R43, R54, R64–R66, R68, R77, R80, R84; ratification R49, R50; case-authoring R9, R13, R18–R21, R66, R68; publication R1, R21, R23, R40; case-grammar R25, R26; notice-producers R17). About 230 KB, under 300 KB: read whole myself, no worker summary.

**Entries applied (T41-44).**
- **R9 (D54).** The code already reads standing through `membership.viewerPredicate`, which since MEMBERSHIP #32 drops an administrator from a hidden project's drafts. No code change. Re-stated the four reds K2442 listed, each with a negative control (a discoverable project, or an invited administrator, still seen): `doors.test.mjs` R9 (:57), R19 (:151) and R19 zero (:184), and `copy.test.mjs` R12 (:71).
- **R30.** `approvalRuleSet({approvers, by})`, readings J1 (1) as BOB confirmed (K2529). Table `approval_rules`, append-only.
- **R31.** `caseApprove({case, edition, docSha, reason?, by})`, J1 (2), with B2's change (K2528): `docSha` is case-grammar R26's `approvalSubjectSha` of the case edition's document, so an approval holds once the approvals block is written. Table `case_approvals`. The refusal code is **`CASE_NOT_AN_APPROVER`** (C-87.14), not R31's `NOT_AN_APPROVER`: filing-templates already holds `NOT_AN_APPROVER` (C-125.24), and answer-envelope decorates by code, so the shared name turned its `families.test.mjs` K921 test red. R31's text needs the code re-worded (REPORT in J2). New rows: C-87.13 `APPROVAL_RULE_BAD_APPROVERS`, C-87.14 `CASE_NOT_AN_APPROVER`, C-87.15 `APPROVAL_NO_SUCH_DOCUMENT`, C-87.16 `APPROVAL_REASON_TOO_LONG` (C-87.12 stays retired). Their translations are my drafts, for BOB and the UX stream to revise.
- **R32.** At start, `ratification.registerApprovalReader({rule(), approvals({case, edition, docSha})})`.
- **R33.** `review_comments` gains `case_id` and `edition`, the identity the draft stood at (never back-filled). `reviewCommentsFor({case, edition, viewer, draft?, limit?})` is registered at start with `case-authoring.registerReviewComments`. Its draft arm is that draft's comments made while it named no case, so the left-out read finds the same set again from the document's `draft_id`. `reviewCommentsLeftOut({viewer, limit})` is for notice-producers R17: per published edition with a signed document, the viewer's own member comments that the document's R25 block (case-grammar's `reviewCommentsOf` over `parseFrontmatter`) does not carry. Each item is keyed `FINDING::review-comment-left-out::<case>::<edition>::<member>`. A document without a readable block is counted `undetermined`, and nobody is told.
- Both new tables are declared to purge whole-store, as R24's are. R23's and R24's text lists only the T13 rows and tables (a wording point, in J2).

**Final `uses`** (for BOB at merge): record-grammar, record-core, membership, strength, basis-versions, publication, case-tensions, case-authoring, **ratification**, **case-grammar**. The architecture check fails only on these two undeclared edges (4 lines: `index.mjs`, `fixture.mjs`, `approvals.test.mjs`).

**Deferred.** No ops for R30, R31 or the reads (J1 (6); BOB: owed at L11).

**Found in other modules.**
- **plane, control-plane, answer-envelope.** Until ratification R50 (`registerApprovalReader`) and case-authoring R66 (`registerReviewComments`) are on the tranche, `reviewOf` throws at start: 125 users' tests are red with `r.ratification.registerApprovalReader is not a function`. Both modules merge before review in L8. I ran the users' suites with local no-op stubs of the two functions (never committed). Every remaining red is red on the tranche without my change: `plane/t39.test.mjs` R18 doccopy, and answer-envelope `families.test.mjs`' K585, C-120 and C-141 tests.
- **case-grammar.** `reviewCommentsOf` and `approvalSubjectSha` take front matter and text respectively. Both are as their requirements state; no defect.

**Tests and checks** (on `job/T41/review` with `tranche/T41` merged @ 3d90245f30):
- `node --test bio-plane/test/m/review/*.test.mjs`: tests 45, pass 45, fail 0. New `approvals.test.mjs` names R30, R31, R32 and R33 (three tests), each with negative controls. No layer tests in the manifest.
- Users (answer-envelope, control-plane, plane, `migrate-released`): as above.
- `checks/format.mjs`: 0 failures. `checks/coverage.mjs review`: 33 of 33, 0 failures. `checks/ownership.mjs review tranche/T41`: 0 failures. `checks/architecture.mjs review`: 4 failures, all the two new uses edges above.

Size (session_01DoW3RXN1QKQ4zf62pWZg41): test runs 20, module lines 1305

## J2 · REPORT

Two wording points for review's requirements. (1) R31's refusal code is CASE_NOT_AN_APPROVER (C-87.14) as built: filing-templates already holds NOT_AN_APPROVER (C-125.24), and answer-envelope decorates by code, so the shared name turned its families.test.mjs K921 test red. Please re-word R31 (and any START or op text that names the code). (2) R23 lists C-87.1–C-87.11 and C-32.16, and R24 lists three tables. T41 adds C-87.13–C-87.16 (R30, R31) and the tables approval_rules and case_approvals (whole-store, as R24's). Fold them into R23/R24, or name them in R30/R31.

## J3 · COMPLETE

T41-44 complete: R9 (D54; 4 reds re-stated with controls), R30–R33 with B2 (K2528). review 45/45. format, coverage and ownership 0 failures; architecture fails only on the uses edges ratification and case-grammar (final uses in my record). Users' suites stay red, 125 tests, until ratification R50 and case-authoring R66 merge (registerApprovalReader is not a function). With those stubbed locally, their reds are only the tranche's own. Details and Size line in my record's Completion. REPORT J2: R31's code is CASE_NOT_AN_APPROVER (a collision with filing-templates).
