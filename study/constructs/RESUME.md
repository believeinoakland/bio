# The constructs study: how to resume it

**Started** 2026-10-05 by BOB #110 (`session_01BPKKPrYLqxMefuVNm32WWf`, Bob's secondary account), at Bob's direction. **Lives** on branch `study/constructs` of `believeinoakland/bio`, folder `study/constructs/`. It is never merged into `main`; its conclusions reach the product only as rulings and requirements once Bob rules. **If this account's usage runs out**, Bob starts a BOB on his other account to continue from here. That BOB reads this file whole, then `STATE.md`.

## What Bob asked (his words, 2026-10-05)
> It's my sense that the level of support for constructs like time need to be richer than just being able to track a court deadline. It's also my sense that the level of understanding of relationships, responsibilities, obligations, reporting lines of all types, of organizations - city and otherwise - needs to be rich enough to support the types of work the system will be called upon to do. Law and regulations are at the very heart of much of this work, as are court cases. Of course the system is inevitably going to need to do some level of analysis - some simple enough to do in code, other in spreadsheets for more comprehensive challenges. And of course the system must be able to understand and respond to natural language questions - which I thought it could o through the assistant.
> … we need to throughly consider what levels of support for these constructs the system may need, what the system is current capable of, which modules/AIs are in place for providing that support, and what support is needed to meet the anticipated needs, and the architecture for that support.

> Make sure that this research you'r starting is properly structured so that the workers are able to fully read all documents and not just scan, and come to real world conclusions about how to procede.

> Structure your intermediate results so that a phase that can't complete because the usage is exceeded can be restarted under another BOB that I'll start in the other account.

It began as the design session's question U41 (`mail/UX-DESIGN`, entry U41). Its first quick check is in `prior/u41-area*.md` and `prior/capabilities.html` (the eleven decisions D1–D11 shown to Bob, now superseded by this study).

**Standing constraint:** K1425 (Bob, 2026-10-05): no tranche is opened or planned until Bob says so. This study changes nothing in the product; it ends in a document for Bob.

## The phases
| phase | units | output | protocol |
|---|---|---|---|
| 1 Reading | C1–C10, D1, D2 (canon and design documents); M1–M5 (module requirements, verified against code) | `notes/<id>.md` | `READING-PROTOCOL.md` (+ `READING-PROTOCOL-MODULES.md` for M) |
| 1→2 Digest | script | `digest/<CONSTRUCT>.md`, `DOCTRINE.md`, `CROSS.md` | `python3 build-digests.py` |
| 1→2 Registers | X-REGISTER | `digest/DOCTRINE-REGISTER.md`, `digest/CROSS-REGISTER.md` (the shared doctrine and cross-construct sections, de-duplicated once so six analysts need not each read 400 KB) | `prompts/X-REGISTER.txt` |
| 2 Analysis | A-TIME, A-ORGANISATIONS, A-LAW, A-COURTS, A-ANALYSIS, A-QUESTIONS | `studies/<CONSTRUCT>.md` | `ANALYSIS-PROTOCOL.md` |
| 3 Review | R-* (written when phase 2 starts) | `reviews/R-<id>.md` | `REVIEW-PROTOCOL.md` |
| 4 Synthesis | S-SYNTHESIS drafts; BOB reviews it against the studies, then renders it for Bob | `synthesis/constructs.md`, then a rendered page | `SYNTHESIS-PROTOCOL.md`, and below |

Every unit's exact prompt is `prompts/<id>.txt`. `python3 status.py` reads each unit's state from its output alone (missing, partial, done) and rewrites `STATE.md`.

## To resume, in order
1. Clone `believeinoakland/bio`, check out `study/constructs`, and work in `study/constructs/` (call it the study folder).
2. Rebuild the sources, which are not committed: `sh make-src.sh <a bio checkout> <the study folder>`. They are pinned to fixed commits, so the rebuild is byte-identical to what phase 1 read.
3. `python3 status.py`. Find the earliest phase with a unit not `done`.
4. For each such unit, start a background worker (Agent tool, general-purpose) whose prompt is `prompts/<id>.txt`, with "the study folder (…)" replaced by its absolute path. Units of one phase run in parallel. A `partial` unit resumes itself: the protocols' checkpoint rule tells the worker to keep what its output holds and continue from the first range or step not done.
5. Commit and push the study folder after each unit completes (`sh sync.sh <the study folder> <a git worktree of study/constructs>`, or plain git), so another switch loses nothing.
6. When phase 1 is all `done`: `python3 build-digests.py`, then X-REGISTER, push, then phase 2. When phase 2 is done: phase 3, then phase 4.

## Phase 4, the synthesis (BOB's own work)
A synthesis worker (S-SYNTHESIS) reads every `studies/*.md` and `reviews/*.md` whole and drafts `synthesis/constructs.md` (P13 and mechanics §5.9: bulk reading goes to a short-lived worker whose output BOB reviews). BOB then reviews the draft against the studies, corrects it, and renders it. The draft covers:
- per construct, the levels of support, where the system stands (built, and reachable by a member), the target and the architecture, and how to proceed in stages;
- the architecture across constructs: obligations (who owes what to whom, by when, under which authority) as the thread joining organisations, law, time and courts; where `standards`, `consequences`, `action-clocks` and `local-facts` sit in the total order (today layer 9, after Publication, so neither inquiry nor the assistant can use them); where the assistant's question-answering sits;
- the decisions that are Bob's (P17: policy and doctrine, requirements' meaning, layers and product modules, UX), each with options and a recommendation; everything lower-level stated as decided.
Show it to Bob rendered (an Artifact page), never as Markdown. Then answer the design session's U41 on `mail/BOB` with what Bob rules.

## Between the two accounts
Sessions on one account cannot see, message, archive or wake sessions on the other: the repository is the only meeting place. Don't touch ROOT #4 or BOB #110 (both secondary). Only one BOB works the study at a time: if `git log origin/study/constructs` shows pushes from BOB #110 within the last 15 minutes, it is still working; ask Bob before starting.

## Coverage: what phase 1 reads, and what it leaves out and why
**Read whole** (20 units, `units.json`): the canon's mission and product requirements, all construct designs and level-2 details that bear on the six constructs; all of Bob's rulings (DEC-1–67 from the archived ledger on `coord`, DEC-68–127 from the design branch); the practice survey and CONSTRUCTS; the Action design papers on both sides (`docs/development/action-design/`, `build/plan/action-design/`), the planning-skill and filing-template drafts and the meeting-calendar research; the design session's journeys, use cases, audiences, experience steps, surface rules, principles, brand and voice, measures and views; and the requirements of the 49 modules that touch the constructs, checked against code.
**Left out, with the reason:**
- Capture and storage mechanics (LINK-FIDELITY, ARCHIVE-FALLBACK, CAPTURE-FIDELITY, CAPTURE-SCALING, CLIENT-RENDERED, GRADE-A-CAPTURE, INBOX-GRAMMAR, MULTI-INSTANCE-ISOLATION, CONTENT-EXTENT-DESIGN-SPACE, STORE-AS-CACHE, TREE-SHARING) and the bundle format: they govern how bytes enter and are stored, not the six constructs.
- Process history (TRANSITION, VERIFICATION, ORCHESTRATION, PARALLELISM, WORK-PIPELINE, UI-PLAN, CORPUS-STANDARD, the old placement table on `coord`), tranche plan drafts `build/plan/draft-T*.md`, `t*-*.md` notes, `approvals-study/`, `action-fold/`: their substance is folded into the requirements the M readers read.
- Raw logs and inventories (MEASUREMENTS 1.4 MB, INTERFACES, INTERFACE-CHANGES, CIVICOS_UI_STATE; the design branch's `ux-substrate-v2.json` and `openQuestions`): derived from sources read whole; open questions' rulings are in the DEC ledgers.
- Requirements of the ~50 modules outside the constructs (capture, signatures, record core, publication internals, distribution).

**If a worker's file write is refused** (one analyst's Write was refused as "subagents should return findings as text"), it returns the full text instead: save it to the unit's output path yourself (BOB #110 did this for `studies/ANALYSIS.md`, keeping the worker's summary as `studies/ANALYSIS.summary.md`).

## State at handoff (BOB #110, 2026-10-05 ~02:30 UTC, usage at 99%)
Phase 1 (20 readers), the registers and phase 2 (six studies) are done. Phase 3 had started: R-1, R-2 and R-3 were stopped mid-review to save usage; resume each from its `reviews/R-<n>.md` if present (checkpoint rule), else start it fresh. Then S-SYNTHESIS, then BOB's review and the rendered page. `NEXT-BOB-PROMPT.md` is the prompt Bob uses to start the successor. Findings BOB #110 had already told Bob: the assistant takes no plain-language question today; law, deadlines and calculation sit after Publication; the deadline calculator rolls nothing past weekends or holidays and counts in UTC (a correction to make, not a decision); the setup page asks for a "Claude subscription" while the code needs an API key (R-3 was to verify the terms and the cost estimate before it goes to Bob).

**The channel on the other account.** Channel to the UX design session: `build/channels.md` on main lists BOB on the secondary account, and `tools/mail.mjs xwriter` refuses any other account (mail.mjs:393). So first change the BOB row's account to `primary` in build/channels.md on tranche/T32, record it as K1428, and fast-forward main to tranche/T32 (a plain push, as at every close; no tranche is open, so this changes no running work). Then run `node tools/mail.mjs xwriter --as BOB --session <your session id> --account primary --product <bio checkout>`, read UX-DESIGN's outbox past BOB's cursor (U42; U41 is the open QUESTION this study answers, U40's MERGE of PR #10 stays held under K1425), and post a NOTICE that BOB now runs on the primary account. When a later BOB returns to the secondary account, it changes the cell back the same way.

## Taken over (BOB #111, `session_011hHu2q95wRxsT1o7P9BR46`, Bob's primary account, 2026-10-05 ~02:20 UTC)
Started directly by Bob (depth 0, not through ROOT; ROOT #4 and BOB #110 are on the secondary account and untouched). `reviews/` held nothing on the branch, so R-1 to R-3 restarted fresh. `SYNTHESIS-PROTOCOL.md` (S-SYNTHESIS's protocol, missing at handoff) and `U41.md` (the question quoted) are added. Step 2's `make-src.sh` needs a full clone (`git fetch --unshallow` in a shallow one) to reach the pinned commits. The workers write into a scratch copy of the study folder and BOB copies it to a worktree of `study/constructs` with `sync.sh`; product code is read at `tranche/T32`.
**Channel moved (K1428, done ~02:23 UTC):** `build/channels.md` lists BOB as `primary`; `main` fast-forwarded to `tranche/T32` @ 8fa5ab4e3d; `mail/BOB` Writer line is BOB #111's; B21 NOTICE posted. `BOB-NOTES.md` holds BOB #111's cross-study notes: the conflicts the synthesis must settle, checked in BOB's review of it.

## State (BOB #111, 2026-10-05 ~02:50 UTC)
Phases 3 and 4 are done: R-1 to R-3; S-SYNTHESIS (`synthesis/constructs.md`); BOB's review and corrections (`synthesis/BOB-REVIEW.md`). The page shown to Bob is `synthesis/page-for-bob.html`, published at https://claude.ai/artifact/1nBMAS75JzdMaCFpM9Jb7N. **Next:** Bob rules on B1–B20. Record his rulings as K rulings on `tranche/T32` (after K1428), reading the channel first (§13.1 (3c)), each with any entry it owes in `next.md` (§9). K1425 still holds: owed work is queued, not planned into a tranche. Then answer U41 on `mail/BOB` (ANSWER re U41) with the rulings, and post a NOTICE for any ruling that is UX.
**Bob's corrections (K1429–K1431, on `tranche/T32` @ 84e7cd321d) are folded into the synthesis, `BOB-REVIEW.md` and the page (version 3):** a Claude subscription can run the assistant (DEC-55); the substrate is built first; due dates may follow from dependencies. Still waiting on Bob's rulings on B1–B20.
**B1 ruled (c) (K1432, on `tranche/T32` @ e7cf6868c9 and `main`):** every construct to L5. The capability ladders are canon at `docs/architecture/BIO_Capability_Ladders_v0_1.md` (draft in `ladders/`). The synthesis gains §5A (revised B8, B12 (iv), B15, B18, B19; new B21, B22). The tag push was refused (HTTP 403); K1433 pins the evidence at commit 892fca16c4 instead, and this branch is never deleted. Waiting on Bob for B2–B22.

**Refresh (K1434):** BOB #111 handed off to BOB #112 through ROOT #2 (primary account). The handoff is `docs/development/TRANSITION.md` §6 on `tranche/T32` @ bdbed41901; its first task is why the tag push was refused.
