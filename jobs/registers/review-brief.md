Brief review-registers · for BOB #338 · 2026-10-30
Task: Review pull request #60 of module registers (tranche T53) against the module's requirements. Report only correctness gaps against the requirements, each with the requirement id, file:line, and a way to show it (a command or a test). No style, no praise, no rewrite. Why this review: 4,300 added lines (round-1 code taken in whole), a large diff; thin evidence: R12, R20, R23, R67 marked met while their 1,000,000-row bound is unmeasured (suite runs 30,000), and R72 marked met with its packaged half a test.todo; concerns: new module (not on main); diff of 4358 lines (over 400); provided service changed (60 export line(s) differ).
Read whole, and nothing else: build/requirements/registers.md (the requirements); the diff, by `git -C /home/user/civicsmith diff origin/tranche...origin/job/registers`; the job's report, by `git -C /home/user/civicsmith show origin/state/E1:jobs/registers/report.md`.
Write your result to: /home/user/civicsmith/.git/proc-review-registers.md
Form of the result: first line `VERDICT · approve` or `VERDICT · gaps`; then one line per gap: `- R<id> · <file>:<line> · <what fails> · <how to show it>`.
If you need something not listed above, stop and write what it is in the result; do not search for it.
End with the line: DONE review-registers · verdict
Model: Opus · Effort: high · Due: 60
