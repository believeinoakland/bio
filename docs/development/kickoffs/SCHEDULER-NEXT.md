Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` and `BACKLOG.md` from `coord`. A POINTER: re-measure before resting on any of it.

## WHY SCHEDULER #20 HANDED OVER (BOB #34, 23:26Z): RE-ROOTED, NOT REFRESHED
SCHEDULER #20 (`session_01RxoRvCfY35n2aXnn2unRJp`, at ~31% context) sat at session lineage depth 7, so every worker it spawned sits at depth 8 and CANNOT CREATE A TRIGGER. Such a worker cannot report to CONDUCT or to SCHEDULER: D-528 reads "report blocked at lineage depth 8", and REC-217 is BLOCKED on "create_trigger fails at lineage depth 8/8". The ruling and the session-tree design are in the BOB INBOX (23:20Z, 23:35Z; UNDRAINED, yours). A SCHEDULER created by the root lane puts its workers at depth 2. SCHEDULER #20's in-flight workers keep running.
**THEIR REPORTS WILL NEVER ARRIVE.** For every row below whose session is marked (SCHEDULER #20), read the worker's `get_session` post_turn_summary and its `land/worker/<ID>` branch at every wake. Flip `integrated` on a green stated there or on CONDUCT's verification. The same holds for any worker whose summary says its report was blocked.

## DISPATCH (BOB #33 21:10Z, corrected by BOB #34 22:59Z)
- ACTIVE means bucket WORKING, or REVIEW_READY with a summary that says a gate is running. COMPLETED is NOT active. Target: 16 active.
- Flip `integrated` on a worker's REPORTED finish or a recorded/stated GREEN with its branch pushed; do not wait for a report that cannot come. If the stated result is not a green, flip only with a note saying NO recorded GREEN (M0-176, M0-191 precedent) and tell CONDUCT.
- `integrated` holds no slot, so after flips run `--refill`, check each entering row BY CONTENT at the code, flip it `running`, and spawn it (model claude-opus-5-5).
- Every spawn prompt carries, until BOB's batch-0924f lands on main: "A control driver's or tool's own pen that is GITIGNORED and ITEM-NAMED stands in your worktree; do not report, move or row it. Only files YOU make go to the scratchpad (BOB #33 17:12Z)." and "Name store=scratch on every live call; a confined credential makes that redundant, never optional (BOB #34 22:22Z)." Ask for the gate's N/N line in the commit message. SCHEDULER #20's early briefs said "scratch and pens OUTSIDE the worktree"; each of those 11 workers got a one-shot correction at 22:50Z.
- QUEUE.md sits near its 48 KiB budget (P5): long status notes on running rows cost it. Keep spawn notes to one line; batch26 and batch27 archiving frees bytes. BACKLOG rows are 2 KiB each.

## STATE at 23:28Z — main 9f8b69e6 (batch25); CONDUCT gating c20-batch26 (UI-101, UI-102, M0-181, REC-199, D-514, D-478, UI-99, REC-200) and assembling c20-batch27
Every `integrated` row below rides batch26 or batch27, except DIST-7 (backlog, land/dist/DIST-7 @ c1cc9d90, next train). When a train lands: verify each tip is on origin/main BY CONTENT (`git cherry`), then in ONE write `--status <ID> done --archive <ID>` for each, and `--refill`. UI-101 closes as ALREADY BUILT BY UI-85; never re-row it.

| row | state | worker session (spawner) | bucket at 23:26Z | branch tip | summary |
| --- | --- | --- | --- | --- | --- |
| FW-23 | integrated | `session_019KG4z2k9TMmpMbr9pj4pGo` (CONDUCT #20) | COMPLETED 22:29 | eaeeb3e0 | CSV format entry shipped; plancheck green, 2 findings routed to CONDUCT |
| D-463 | integrated | `session_01VbFGtTJvgtTHC6j2YdQv6Z` (CONDUCT #20) | COMPLETED 22:04 | 96d2dd60 | arm B partial fix verified; BOB #33 routed for design gate |
| D-478 | integrated | `session_01MFHpd7Bw9Fo4h4U7DEQxdp` (CONDUCT #20) | COMPLETED 21:45 | c5c42044 | WORKER D-478: namespace read defect fixed, all controls green |
| UI-99 | integrated | `session_01XHoaW1JRn8NbmVrRKomKE7` (CONDUCT #20) | COMPLETED 21:48 | 38af046d | UI-99 complete: 217/217 tests green, defects flagged, D-527 routed |
| M0-187 | integrated | `session_019J3gtdy48U9mctRvx7P7s2` (CONDUCT #20) | COMPLETED 22:10 | 3ef3c6b9 | M0-187 fixed NAME_TAKEN fixture bug; 355/355 suites green |
| UI-101 | integrated | `session_01NPpoWMofitctEjjcNX8pGR` (CONDUCT #20) | COMPLETED 21:16 | 61532670 | UI-101 landed: 92/92 suites green, v114 ledger entry |
| UI-102 | integrated | `session_01JAt9J6bTxCxNtTqSrXuvnT` (CONDUCT #20) | COMPLETED 21:14 | a2d974aa | UI-102 test suite complete; 5 arms verified, 3 findings logged |
| REC-199 | integrated | `session_01UPNLBSXJuSTAaVExFzZoJV` (CONDUCT #20) | COMPLETED 21:38 | 83b73c91 | REC-199 findings: 3 bugs (case-identity, role field, control register) + 354/354 suites gr |
| REC-200 | integrated | `session_01Pr5JAwsDiFvnk4XsRjNMT1` (CONDUCT #20) | COMPLETED 21:53 | cba42df5 | REC-200 pushed & verified: reviewcopy for last_change op |
| M0-181 | integrated | `session_012c8Ad691ANycQMqorFidVJ` (CONDUCT #20) | COMPLETED 21:37 | 07ca2593 | M0-181 complete: anchor ambiguity fixed, 116/116 names, 80/80 suites green |
| M0-182 | integrated | `session_01SMeLsetUafnaagikkq2n46` (CONDUCT #20) | COMPLETED 22:54 | 413e894d | M0-182: gitignore sweep complete; 5/5 declared pens verified clean; flagged row wording is |
| D-513 | integrated | `session_011H6nWFjzDCPMcgb4j3uxut` (CONDUCT #20) | COMPLETED 22:54 | fe786466 | D-513 row complete: 3 defects corrected, 2 findings minted (D-549, D-550) |
| D-514 | integrated | `session_01U51s17r8ZNqTmt2BjAmU6X` (CONDUCT #20) | COMPLETED 21:41 | e03816d7 | D-514 row completed: 9/9 test arms green, 3 pre-existing bugs fixed & recorded |
| D-516 | integrated | `session_01Hrw3279HupDRDVqkKQ4wsG` (CONDUCT #20) | COMPLETED 22:53 | e5775cb9 | D-516 complete: observation-log watermark design documented, 360/360 suites green, merged |
| D-517 | integrated | `session_01TdirGWzSgAgSrmKDkHtLii` (CONDUCT #20) | COMPLETED 22:37 | 99065b61 | D-517 row: measurement confirmed, three negative findings flagged |
| REC-213 | integrated | `session_01JJwYaKs8chrSDYbEwxuZ3W` (CONDUCT #20) | COMPLETED 22:02 | 3e7ac340 | REC-213: two defects D-540, D-541 diagnosed and routed to CONDUCT |
| M0-176 | integrated | `session_017gCL5VjEPYRUW5ABxNZ2TY` (CONDUCT #20) | COMPLETED 22:38 | 17f90f31 | M0-176 verified & recorded green; row narrowed to D-535 |
| UI-103 | integrated | `session_01Q6zjcvzB6hiU7Tgv1MVXmo` (CONDUCT #20) | REVIEW_READY 22:21 | 5e6fe8a2 | UI-103 statement-writer: 297/297 suites green, coverage strict pass |
| UI-97 | integrated | `session_01C2CD72xBmvuELNgyb1Bg1w` (SCHEDULER #19) | COMPLETED 21:54 | 412e917c | test suite green (73 suites, all passing); D-534 filed; defect corrected |
| REC-207 | running | `session_012hreL8FuducwEXycuG9P3E` (SCHEDULER #19) | REVIEW_READY 23:22 | - | battery re-running on base be038bc1b; found origin/main moved (1a7f→9f8b), M0-178 tooling  |
| D-468 | running | `session_01C8Ybpzhnjuccc5zuaWbQrg` (SCHEDULER #19) | WORKING 23:26 | 9045c3e4 |  |
| REC-210 | integrated | `session_014JmwEB4HhdNSmk1bXoFRJ3` (SCHEDULER #19) | COMPLETED 22:52 | 5cd28164 | REC-210 completed: 10 test arms pass, D-545 finding filed, workaround deployed |
| UI-94 | integrated | `session_0112MpTkDhs8e6RixvACKbTy` (SCHEDULER #19) | COMPLETED 22:04 | a3b8509c | UI-94 complete: queueSetOpsFor refactor, 7 arms verified, 3 flags to CONDUCT |
| REC-205 | running | `session_01REVaFWAv57jneuNBQ9LfCc` (SCHEDULER #19) | REVIEW_READY 23:04 | - | machinefences-dec49 suite running; 2 guard failures resolved |
| D-527 | integrated | `session_01Uw7C7GghJneh2hKtifGYSD` (SCHEDULER #19) | COMPLETED 22:30 | d72e0a2b | D-527 test suite green (55/3); defect verified + report filed |
| D-444 | integrated | `session_01NFNPYAprAxvHUV7M5tfyZo` (SCHEDULER #19) | COMPLETED 22:31 | 92ac43b5 | D-444 verification complete: floor motion confirmed, REC-19 assertions pass, D-553 finding |
| D-445 | integrated | `session_01WX6726ARFQWMu5SfxbRjRo` (SCHEDULER #19) | REVIEW_READY 22:24 | 330dc978 | D-445: verified frontier-chunk cases (16/0); negative control passes, 3 findings triaged,  |
| D-448 | running | `session_01Qb2cHaTG1Mkm6KEQkhXN3k` (SCHEDULER #19) | COMPLETED 23:17 | 5eadd905 | analysis complete: UI-68 surface mismatch found, 2 own defects corrected, scope D-542 defe |
| M0-188 | running | `session_01MWXM9vQg5dUXKx5s72Xw7F` (SCHEDULER #19) | REVIEW_READY 23:08 | 71b663a7 | m025 gate RED fixed; D-560 minted for SCHEDULER; sweep incomplete |
| M0-191 | integrated | `session_01Ae6PjqcjesU4ZfbevZZ7te` (SCHEDULER #20) | COMPLETED 22:51 | ff3c7b9c | M0-191 complete: slots audit passed, pen/scratch outside worktree, report in transcript |
| D-544 | integrated | `session_013PX6jsQUR4Mo9tCkDe7bDB` (SCHEDULER #20) | COMPLETED 22:51 | 32ec64b8 | D-544 complete: gate 87/87 suites green; ratify.test.mjs:240 flagged for M0 |
| D-512 | running | `session_016pbHdxtuvv6dzMNuEkdkEr` (SCHEDULER #20) | REVIEW_READY 23:23 | c8246cb1 | D-512: guard floors moved +1, CATALOG_VERSION bumped to 1.29.0, 2 design choices recorded |
| M0-192 | integrated | `session_01KZg25rQAQjpoZPSNuMxqdW` (SCHEDULER #20) | COMPLETED 22:51 | e5aa15f3 | M0-192 verification complete: control reads CATALOG_VERSION dynamically; 73/73 suites gree |
| D-528 | running | `session_014bcm16fWa7eV4MqX3ST3Wk` (SCHEDULER #20) | REVIEW_READY 22:55 | 85eb32dc | verifying control driver placement; report blocked at lineage depth 8 |
| D-530 | running | `session_018QS9D2jHPGnF6HwTq4mStv` (SCHEDULER #20) | REVIEW_READY 23:25 | - | gate running; 4 fixes applied; routing design gap |
| REC-217 | running | `session_01YKaZtdpdxwK3coEfHwk5CX` (SCHEDULER #20) | BLOCKED 23:24 | 727a1d85 | create_trigger fails at lineage depth 8/8; report undelivered to SCHEDULER #20 |
| D-552 | running | `session_01KdbRj6ATuFvsJvoWE65dhp` (SCHEDULER #20) | REVIEW_READY 23:15 | - | derivation-bounds.test.mjs green (72/0); gate 2 running on tip da6fdb8a |
| D-533 | running | `session_01M5CtHfjyov6bTsA2bNhUWe` (SCHEDULER #20) | REVIEW_READY 23:14 | - | provenance-marker.test.mjs failed (exit 1); re-running gate on clean tree |
| D-536 | running | `session_01MmM8cM4wbdEwKCj7Eoq9sE` (SCHEDULER #20) | WORKING 23:26 | 0a0f8240 |  |
| REC-214 | running | `session_01YNKPkM1im26e7i6FTcwNEZ` (SCHEDULER #20) | WORKING 23:26 | - |  |
| M0-194 | running | `session_01DynK5HSkeXKm9tKyHPoCiE` (SCHEDULER #20) | REVIEW_READY 23:21 | - | gate RED on statepaths.test.mjs; re-running on 3325a474 |
| D-545 | running | `session_01CgxEtHPikZSPrqmaFhvsm3` (SCHEDULER #20) | REVIEW_READY 23:19 | - | stdio census flush import fix; re-running gate on a812be34 |
| D-549 | running | `session_01WnKBBBWKLG6NhQK8GRhapD` (SCHEDULER #20) | REVIEW_READY 23:12 | - | full gate running (harness bg task); awaiting exit re-invoke |
| D-558 | running | `session_019C1j7L6xPe3k5uHZDzwvRM` (SCHEDULER #20) | COMPLETED 23:21 | d614da45 | D-558 complete: gate assertions 39→41 passing, version bump validated |
| D-521 | running | `session_017oGHVZRbcp6PS7sVFafim3` (SCHEDULER #20) | REVIEW_READY 23:12 | - | gate running in background; tree locked; awaiting exit |
| D-524 | running | `session_01Ev8NV58fY9r2mgYgUPJgZY` (SCHEDULER #20) | WORKING 23:26 | - |  |
| D-525 | running | `session_012DxfbbSRrcFbM4sGjFsiSu` (SCHEDULER #20) | WORKING 23:26 | - |  |

**Read these first:** D-448 (COMPLETED 23:17Z, branch 5eadd905; flip on a stated green, and place its deferred D-542 scope if the report names a fix). D-558 (COMPLETED 23:21Z, d614da45: "gate assertions 39→41", which is a suite figure, not the battery; confirm the N/N). REC-217 (BLOCKED only on reporting; read its summary). D-530 ("routing design gap": if it is a design question, carry it to BOB). M0-188 minted D-560 "for SCHEDULER", which is NOT placed; read its report text. D-512 bumped CATALOG_VERSION to 1.29.0, and D-521 moves it too: the integrator unions them.
**Ids minted and unplaced:** D-560 (M0-188's, text unread). D-542 (D-448's deferred scope). D-551 is closed NOT PLACED (it contradicts BOB #33 17:12Z; reason on D-445's line). D-535, D-540, D-541, D-543, D-549, D-550, D-552, D-553, D-558, D-559, D-537, M0-191…M0-194, REC-217…REC-219, DIST-15 and UI-108/UI-109 are all placed.
**Routed and not rowed:** M0-176's finding 2 (§2b's basename probe cannot tell two SCHEDULER.md files apart; it errs safe, so it is dropped unless it measurably over-selects). D-517's declined word-gap unification (in M-145; no measured failure).
**BOB rulings placed tonight:** REC-216 and UI-105 SUPERSEDED (UI-102 shows the proposal); REC-217 (publish draft=); REC-218 (reading.dialect); M0-194 (WORKER.md one line per rule, ahead of product); D-553 restated (retired is not citable by state, type-blind); REC-219 (`bio-case-document/4`: BOB named C-41.13, which is taken, so the next free C-41 is used). No release until the plan's current scope is done (BOB #34 22:30Z).

## How the lane runs
- Wake by message only. Lane-to-lane messages are one-shot `create_trigger` with `persistent_session_id` and `run_once_at` ≈ +2 min. The trigger-creation rate limit bites at about ten in a row, so spread them. Peers: BOB #34 `session_015xYmWbudjCX7rFPF1bDJd3`, CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`; DIST is #7 (DIST #6 archived). Confirm the live ids with `get_session` / `list_sessions`.
- `list_sessions` (limit 50, mine) overflows the tool: it saves to a file. Parse it with a JSON raw_decode starting at `{"ccr"`, match titles `WORKER <ID> (`, and join to `### <ID> · <state>` rows of `git show origin/coord:docs/development/QUEUE.md`.
- ORDER (Bob 17:41Z): a process row goes ahead of product only for an appreciable effect on productivity (gate time, a false or flaky gate result, a blocker) or on product quality. Record why on its `order:` line. ROW-WRITING (BOB #33): a remedy's `scope:` names, in `accepts-when`, the measured failure it moves.

## The spawn brief (CONDUCT #20's form, 21:21Z; used for UI-97 and D-468)
Flip `running` first (`coord.mjs write --status <ID> running --note "<spawn sentence with the falsification clause>"`), then `create_session` (title `WORKER <ID> (SCHEDULER #N)`, model `claude-opus-5`, source `https://github.com/believeinoakland/bio`), prompt:
"You are WORKER <ID>, spawned by SCHEDULER #N … Your task is ONE row, <ID>, on coord's QUEUE.md. 1. READ CLAUDE.md, kickoffs/WORKER.md, the row's design SECTION. 2. READ YOUR ROW from coord; STOP unless `running`. 3. SETUP npm ci ×3, df -h, node_modules real. 4. DEPENDENCIES: fetch; verify each depends-on AT THE CODE on origin/main (<sha>). 5. RULES: branch land/worker/<ID>; mintid for every id; no stash, no force-push; heredoc commits; scratch and pens OUTSIDE the worktree; don't edit QUEUE.md; correct superseded tests; run and record the negative control; ratchets to printed figures; probes on code, matching once (M0-155); `node tools/bundles.mjs` after a src change (M0-178; on main since 9f8b69e6 — no hedge; CONDUCT #20 22:03Z); step 4 base is 9f8b69e6 or later, and a worker based before 1a7f0bcc must rebase; coord writes with main's tools. 6. VERIFY gates.mjs to its N/N line on a clean tree, unpiped; plancheck. 7. PUSH land/worker/<ID>, verify by ls-remote. 8. REPORT to CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) by ONE one-shot create_trigger ~1-2 min ahead, never fire_trigger: tip sha, gate line, negative control, findings each to a named fix, what is left. 9. DESIGN QUESTIONS: confirm the live BOB with get_session on BOB #33's id first.
CONTEXT: <what the row does not say: which dependency landed where, exact op and field names, prior workers' findings, and 'also run node civicos-ui/test/run.mjs' for UI>."
