# plan-work (T46)

**Status** · session_01QnyQWJJonW3PETrFRksgee · depth 2 · WORKING · handled B1

## J1 · QUESTION

R14: "`statusReportSave`'s `from` records that the text began as the assistant's draft, labelled machine work (`record-grammar`'s `proposalLabel`)". `proposalLabel(proposedBy, subject)` throws for any subject not in `PROPOSAL_STATES`, and none of its 17 subjects is a status report (the nearest, `filing_draft` and `communication`, say "approve or send", which misleads for a report kept with the plan and never published). record-grammar is not mine to change.

My best reading, which I am building now: `from` takes, besides today's one-line string, `{assistant: true}` (the member's word that the text began as the assistant's draft); the row keeps `{draft: "assistant", label}`, where `label` is `{by: "class:assistant"-style machine identity, state, machine_work: true, says}`, its `state` from record-grammar's `lawProposalState` and its `says` this module's own sentence ("the assistant drafted this report from the items where the plan stands; machine work, labelled as machine work, and the report kept is the member's"), shaped exactly as `proposalLabel` answers, so a later `status_report` subject in `PROPOSAL_STATES` replaces it at one site. If you would rather record-grammar gain `status_report` (a REPORT to its owner), say so and I switch to `proposalLabel(by, "status_report")`.
