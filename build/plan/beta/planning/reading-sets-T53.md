# T53's job reading sets, measured against 600 KB (PLANNING L37)

**Status** · DECIDED: R1-R7 as recommended and DEC-475's wait lengths confirmed (BOB #324, P17, P20; its K line to follow); applied to the plan and re-measured at L40 (§5) · PLANNING #4, 2026-10-27. Section 0 step 3 of `HANDOFF.md`: each job's reading set measured against the 600 KB budget (K2700) before the plan is READY, with a relief proposal where a set is over. Every point here is BOB's (P17: reading sets, splits for size and STARTs are BOB's, K617, K2700, mechanics §17); nothing is Bob's. Measured on `lane/planning` at a78921bd (tranche/T53 merged in), by a scratch script over `plan-T53-draft.md`, `plan-T53-capabilities.md` and `plan-T53-journeys.md`.

## 1. What was counted

A job reads whole its requirements, its entries, its layer's contract, its own code, the used services its entries touch, and the tests naming a requirement its entries change (K3269, K3271; mechanics §6 step 2, §17). The figures below are upper bounds of the part the plan decides:

- **req**: `build/requirements/<module>.md` today (the new lines add roughly what the drafts' lines for this module hold, already counted in "drafts").
- **drafts**: every lane draft or PLANNING `lines-*` file the plan or its two detail files name for the module, counted whole. Keys of `plan-T53-capabilities.md` (N1259-a, N824 …) resolved to their files. A draft naming several modules counts whole for each.
- **shared**: the three plan detail files, `plan-T53-capabilities.md` (46 KB), `plan-T53-journeys.md` (38 KB), `carried-T52-R1.md` (24 KB), counted whole where a module has a row there (K5434 (4): "read whole at START").
- **code**: the module's `paths` in `modules.json`, `.mjs/.js/.ts/.css/.sql/.rs/.html`, without test files and test or fixture folders, without files over 1 MB (generated: `newgroup/release.mjs` 9.4 MB, `case-checker/program.mjs` 6.8 MB, `setup-words/rows.mjs` 5.1 MB; K2053). `reading-sets.py` counts these and the tests inside `paths`, so its figures for installer (11.7 MB), case-checker (7.6 MB), setup-words (5.1 MB), court-doctypes (HTML fixtures) and agent-worker (tests in `paths`) are not reading sets.
- **Not counted**: the used services (`reading-sets.py`'s used-public is the whole public part of every used module, an upper bound K2700 itself sets aside: a set over budget on it gets a task digest by the job's workers, K2032); the tests to read (only those naming a changed requirement: known at START); the START itself.

## 2. The jobs at or over 450 KB

"whole" = req + drafts + shared + code; "rows in START" = the same without the three shared files (proposal R1). Code lines are own source lines (K617's measure).

| module | layer | req | drafts | shared | code KB (lines) | whole | rows in START |
|---|---|---|---|---|---|---|---|
| screens-inquiry | 11 | 156 | 122 | 108 | 656 (7,236) | 1,045 | **935** |
| acquisition | 3 | 101 | 285 | 46 | 326 (4,485) | 760 | **713** |
| op-declarations | 11 | 110 | 229 | 24 | 306 (3,469) | 670 | **646** |
| op-grades | 11 | 89 | 210 | 46 | 340 (3,689) | 687 | **640** |
| jurisdictions | 1 | 75 | 239 | 84 | 297 (3,853) | 698 | **613** |
| capture | 3 | 100 | 148 | 84 | 363 (5,027) | 698 | **613** |
| screens-settings | 11 | 99 | 127 | 108 | 365 (5,483) | 701 | 592 |
| screens-action | 11 | 75 | 118 | 84 | 382 (5,289) | 661 | 576 |
| screens-daily | 11 | 98 | 107 | 108 | 353 (4,375) | 668 | 559 |
| extraction | 4 | 92 | 105 | 46 | 359 (4,989) | 603 | 556 |
| installer | 11 | 77 | 116 | 70 | 351 (5,453) | 617 | 545 |
| store-assembly | 11 | 89 | 171 | 46 | 283 (3,780) | 591 | 544 |
| screens-investigate | 11 | 76 | 138 | 108 | 319 (3,618) | 644 | 534 |
| interface-shell | 11 | 125 | 107 | 62 | 250 | 547 | 484 |
| control-plane | 11 | 130 | 96 | 70 | 230 | 528 | 457 |
| public-read, screens-intake, publication | 8, 11, 8 | 55, 79, 66 | 78, 52, 33 | 108, 108, 38 | 307, 284, 348 | 551, 525, 486 | 441, 415, 448 |

Every other job with T53 entries is under 450 KB on both counts (the new modules: registers 176 whole, mail-reader 104, mail-door 95, register-readers 94, ai-gate 48, ai-catalogue 48, ai-issuer 28, the rest under 10, before their own code is written; registers is drafted at 2,500-3,500 lines, `plan-T53-capabilities.md` §B).

## 3. Findings

1. **The shared detail files cost each job up to 108 KB for a few rows.** A layer-11 screens job reads all three (46 + 38 + 24) for between three and fifteen of their rows. They are the plan's entries, not the capability detail: K5434 (4)'s "each capability's detail in its own file, read whole at START" is met by the lane drafts the rows point to.
2. **A lane draft holding many modules' lines is counted whole by each.** `N824-email-capture.md` (44 KB) is named for eight modules, `N1259-c-watching-alerts-queue.md` (39 KB) for seven, `N1269-N1272-requirements.md` (44 KB) for eight, `N858-templates-and-guides-texts.md` (41 KB) for five. acquisition's 285 KB of drafts is twelve files, of which its own lines are a fraction.
3. **One pointer names a 1.2 MB log.** The plan's DEC-454 entry (file-safety) cites `docs/development/DECISIONS.md` whole; the START should carry DEC-454's row (and every DEC row an entry names) instead. Likewise `build/layers.md` is read for the layer's contract only.
4. **screens-inquiry is over on its own code.** 156 KB of requirements and 656 KB (7,236 lines) of code exceed the budget before any draft: `document.mjs` 2,088 lines, `question.mjs` 1,842, `project.mjs` 1,235. No trim brings it under. At T51 its START already named the seam: "past ~4,000, REPORT to BOB at once (a per-screen split by copy, M-T51-1)".
5. **K617 (Bob's standing rule, BOB's to apply): a module past about 4,000 lines is split before its next job.** Of the modules with T53 entries, sixteen are past it today, before T53 adds lines: screens-inquiry 7,236; screens-settings 5,483 (`keys.mjs` 2,050); installer 5,453; screens-action 5,289; capture 5,027 (`index.mjs` 3,937); extraction 4,989; publication 4,804; office-readers 4,730; reading-pipeline 4,546; bundler 4,525; acquisition 4,485; screens-daily 4,375; calculations 4,281; monitoring 4,262; public-read 4,220; ratification 4,102; promotion at 4,000. T53 adds the most to screens-inquiry, screens-settings (the seven AI screens, DEC-420), acquisition (N1259's streaming and probes, N824, N1269), capture (N824, held-and-named) and jurisdictions (3,853 now; the layer model, registers, N858).
6. **The parser's coverage.** Pointers the plan writes in prose ("the named `planning/lines-*` files", a module named without bold) were resolved by hand for screens-inquiry only; the plan should name each job's drafts by file, which proposal R5 makes the rule.

## 4. Proposals (BOB's; each with a recommendation)

- **R1 · The detail files' rows go into the START, not the reading set.** Each START copies its module's rows from `plan-T53-capabilities.md`, `plan-T53-journeys.md` and `carried-T52-R1.md` verbatim (as T52's STARTs carried "your row of the plan"); the job reads the drafts those rows name. **Recommend.** Saves 24-108 KB per job; no binding word is lost (the rows are copied whole).
- **R2 · A many-module draft is read as its head plus the module's sections.** The START names, for each such draft, the sections the module's lines sit in plus the draft's status, keys and decisions sections, each read whole (a set defined in advance, mechanics §17; never a search in place). **Recommend** for drafts over 30 KB named by three or more modules (the four of finding 2, `N1257-requirements-layer-names.md`, `N1259-a`, `N1259-d`). Where a draft has no per-module sections, a task digest by the job's workers (§17 step 3).
- **R3 · DEC rows by id.** Plan pointers name DEC rows, never `docs/development/DECISIONS.md`; the START carries the rows. **Recommend.**
- **R4 · Split screens-inquiry before R1 (K617), by screen.** Seam as M-T51-1 named it: `screens-document` (the Document page: `document.mjs` and its states; A3's source line, A4's picture and "the file says", A8's typed words and Cite, DEC-454, DEC-467, N1272's Interpreted marks) and `screens-inquiry` (question, project, objective: A1, A7, N1260 "Follow from here", the carried T52-66 to T52-73 as they fall). Requirement lines move by screen, meaning unchanged; layer 11, placed after screens-inquiry in the order. A packaging split carrying no new capability: BOB's (K617, layers.md ruling 5 as amended). **Recommend.** With R1, and the requirements divided by screen, the parts come to roughly 510 KB (Document: `document.mjs` with the shared files about 336 KB of code) and 580 KB (the rest, about 454 KB of code); the second is near the budget, so its START is re-measured and a task digest of used services is ready.
- **R5 · The AI screens as their own module, not in screens-settings.** STRUCTURE §5 row 2 left it open: the seven DEC-420 screens (`aiproviders`, `aiconnect`, `aimine`, `aiproject`, `aimoments`, `aitest`, `airesults`) as `screens-ai` (layer 11, after screens-settings) rather than in screens-settings (already 5,483 lines). Their requirement lines are new, so nothing moves but the retired `connect`, `teamai`, `projectai` (retired in screens-settings' job). BOB's (packaging; the capability is ruled, K5457). **Recommend.**
- **R6 · The other modules past 4,000 lines.** For each module of finding 5 other than screens-inquiry and screens-settings: its T53 job reports its size in its completion and BOB plans the split for the next tranche (K617's second clause), except where the job's set is still over 600 KB after R1-R3 (acquisition, op-declarations, op-grades, jurisdictions, capture by this count): those get, in order, R2's sections, then a split before R1 along a seam BOB names (candidates: acquisition's `unpack.mjs` to reader-container's client, CONSISTENCY §2.4; capture's N824 member job apart; op-grades' tranche tables `t33.mjs`, `t41.mjs`), else a task digest. **Recommend**, re-measured at each START.
- **R7 · Each plan entry names its drafts by file**, so the reading set is drawn from the plan alone. **Recommend**; PLANNING applies it to `plan-T53-draft.md` on BOB's word.

## 5. Re-measure after R1-R5 (L40)

Same count as §1 with the three shared files out (R1), and each lane draft over 30 KB named by three or more modules counted as its general sections plus the sections whose heading names the module (R2). screens-inquiry's requirements divided 60/40 (the split map moves them by screen), its code by file (`document.mjs` to screens-document). KB: req + drafts + code.

| module | req | drafts | code | total |
|---|---|---|---|---|
| screens-settings | 99 | 133 | 365 | 598 (counts the AI-screen drafts now in screens-ai: about 550 without) |
| screens-inquiry (question, project, objective) | 93 | 47 | 454 | 595 |
| capture | 100 | 96 | 363 | 561 |
| jurisdictions | 75 | 176 | 297 | 549 |
| screens-daily, acquisition | 98, 101 | 83, 107 | 353, 326 | 535, 535 |
| screens-action, installer, op-declarations, op-grades | 75, 77, 110, 89 | 74, 100, 111, 94 | 382, 351, 306, 340 | 532, 529, 528, 524 |
| screens-investigate, screens-document, extraction, interface-shell | 76, 62, 92, 125 | 113, 91, 37, 107 | 319, 334, 359, 250 | 510, 488, 488, 484 |

Every other job is under 455 KB. No job is over 600 KB, so R6's condition for a further split is met by none: the other modules past 4,000 lines stay whole this tranche, each job reporting its size at completion (K617). Near the budget: screens-inquiry and screens-settings; their STARTs re-measure with the tests named, and a task digest of used services is ready. The tests to read are counted at each START.
