# case-authoring (T45)

**Status** · session_01GDnDMjDLXJXoDemp1UPqER · depth 2 · RUNNING until 2026-10-11T21:57:05Z (users' tests) · handled B3

## J1 · QUESTION

Two readings, carrying on with both; neither stops the job.

(1) R72's row. I answer COUNSEL_MATTER_NOT_PUBLISHED with publication R78's row read through publication's existing export `CASE_SOURCES_CHECKS` (from `publication/index.mjs`; its C-122 family), key `COUNSEL_MATTER_NOT_PUBLISHED`, holding no copy. My R72 test asserts check and translation equal that row, so it is red until PUBLICATION #29 merges the row under that export. Best reading: that is the export name; please confirm with publication's job, or tell me the name it uses. Behaviour otherwise passes (publishing project and a member's committing project, `record.bundleInfo().project`, each asked of `project-roster.projectScope`; R2 and R4 first; pre-flight `first`; scope-none and `own` controls).

(2) R57's withheld count. case-grammar R20's `timeline:` block has no field for the we_did lane's `withheld` count, and the block is case-grammar's. My reading: the count is written in the body's timeline section (my renderer: "N of the group's own act(s) were not marked public … and are left out of this published record of what we did."), and answered by publishCase as `timeline: {we_did, withheld}`; no front-matter field. If BOB wants it in the signed front matter, that is a case-grammar R20 field (owed to that module), and I would write it through case-grammar's renderer once it exists.

## J2 · REPORT

Progress, pushed on job/T45/case-authoring: R70 (registerOpenRequests, openRequestsOn) and R34's sign-step open_requests, R57 (audience "public", public:true only, withheld counted; K2830's reading), R72 (red only for publication R78's row until PUBLICATION merges), R65's T45 tail tested, and R71's service: carryOutcome, withdrawCarriedOutcome, carriedOutcomesOf, two append-only tables declared to purge, six new rows C-136.3–C-136.8 in PUBLISH_ACT_CHECKS (the module's existing family; translations my drafts, BOB's to re-word), pending read from ratified signed documents, and the pending outcomes listed in the pre-flight's step 1. Module checks: format, architecture, coverage (54/54), ownership all 0 failures.

Left: writing the pending outcomes into the document (case-grammar R29's outcomesLines/outcomesOf, and its body section) and judging them (case-account R6's `outcomes`), which need CASE-GRAMMAR #14 and CASE-ACCOUNT #2 merged. Until then a local reader of the `outcomes:` rows stands in for outcomesOf, replaced by the import at the merge. I wait for your CHANGE announcing those merges; meanwhile I fix flaws in my own tests.
