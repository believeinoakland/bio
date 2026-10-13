# case-carriage (T47)

**Status** · session_011eGTRVSA7J71sihm3rkt2U · depth 2 · RUNNING until 2026-10-13T21:19:59Z (the baseline of five users' tests and migrate-released) · handled B2

## Completion

**Entry applied.** T47-26 (`bio-plane/src/case-carriage/index.mjs`):
- **R19 (N947; accepted-work R9)** `acceptedWorkLapsedSince` asks `accepted-work.flagHistoryOn({ref, edition, since, viewer: member:<signer>})` once per distinct `(ref, edition)` still in force. Each flag it answers open at any instant of the interval, cleared since or not, that the flags block does not state is answered undisclosed, `{ref, edition, flag, issue}`. A flag open now (R4) and also in the history is named once, R4's first. An answer that is absent, unreadable, not an object, has `complete` not `true`, or has `flags` not a list withdraws that row, and its flags are not named. A disclosed flag is never undisclosed. With nothing changed, it answers exactly R4.
- **R21 (N947; sources R20)** For a row that holds at both `since` and the read, `sourcesLapsedSince` reads, for each source behind the row's capture, `sources.sourceChangesSince` (pages of 1,000, through `next` until not `truncated`, at most 1,000 pages). It judges the row at each changed instant as R5 does, so a consent withdrawn and given again inside the interval answers the row lapsed. Changes that cannot be read whole lapse that source's rows (fail closed): `NO_SUCH_SOURCE`, an answer not `ok`, `changes: null`, `since_invalid`, a change whose `at` is not an instant, a cursor that does not move, a truncated page with no cursor, or a read that throws or is not offered.
- **R22 (N953; case-grammar R31)** `photoMarks` answers `obscured: {copy, label, marked, kind: "photo"}` whenever it answers a copy, and so do `obscureMark` and `obscureMarkWithdraw`, which answer as R10 does after the act. The label is `OBSCURED_LABEL` when marked, else `PUBLISHED_LABEL`. `documentCopy` in state `copy` answers `obscured: {copy, label: COPY_CLEANED_LABEL, kind: "document"}`. An answer with no copy carries no `obscured`. Every other field is unchanged.
- **B2 (CHANGE)** I merged `tranche/T47` (case-grammar T47-25). `obscured.test.mjs`'s R1 read now expects `kind: null` on a row that states none. A new R22 test hands each answer's `obscured` whole to a `materials:` row and reads it back through case-grammar, with its marker.

**Read.** I read these whole myself: my requirements; my code (`index.mjs`, `checks.mjs`; `schema.mjs` is unchanged); `fixture.mjs` and `since.test.mjs`; the plan's entry and opening rules; accepted-work R2 and R9 and the code behind them; sources R8 and R20 and `sourceChangesSince`; and case-grammar R12, R28 and R31. The reading set is over the limit (710 KB), so a helper in my session read my other eight test files whole and wrote me a digest citing each test (K2032, §17 (3)). The used modules' Purposes and the services my Uses names I read from their requirements. The sources stay binding.

**Flaws fixed in my module (P8), from the digest.**
- The R7 test ("no place is named") exercised only some answers. It now serialises every service's answers: marks and their refusals, withdrawals, document copies, `copyBatch`, `copyWake`, `faults`, `marksLapsed`, the three interval reads, the C-141 rows, the words and the three labels.
- The R12 test's `d.module ?? "case-carriage"` could hide a missing module. That fallback is removed.

**Deferred, mine (none changes behaviour):**
- some tests pin wording constants to literals;
- loose `why.length` and `detail.length` checks (`documents.test.mjs:353`, `hold.test.mjs:112`, `marks.test.mjs:126`, `withdraw.test.mjs:116`);
- `archive.test.mjs:180`'s token check is circular when `openssl` is absent;
- R17's "a listener that throws changes nothing" checks only the queue length (`documents.test.mjs:221`).

These are left for my next job, given this job's size.

**Found in other modules (REPORT).**
- `case-disclosures` R6 and R7 still build their own `obscured` object (`index.mjs:463`, `materials.mjs:69`). R22's answers carry the whole object, `kind` included, for them to hand on. That is their T47 work under N953.
- Red on `tranche/T47` with and without my change, so none is mine. case-disclosures R7 (2) and public-read R3 and R23 (2) come from case-grammar's merge (BOB's CHANGEs B3 and B2). case-authoring has 3 reds, the same 3 at base. affordances (3), op-declarations (12), answer-envelope (1) and plane (2) are rule 5's 7a and 7c reds.

**Tests and checks.**
- `node --test bio-plane/test/m/case-carriage/`: tests 88, pass 88, fail 0, todo 0.
- Users' tests on my branch. Before the B2 merge: publication 141/0, public-read 186/0, case-disclosures 97/0, case-check 34/0, scheduler 129/0, control-plane 242/0. After it: publication 141/0, case-check 34/0, case-disclosures 95/2, public-read 184/2, case-authoring 207/3. Before it: affordances 242/3, op-declarations 144/12, answer-envelope 32/1, plane 221/2. Every red is the same set at `origin/tranche/T47` without my change (above).
- `test/system/migrate-released.test.mjs`: 1 pass, 0 fail.
- `format.mjs` 0 failures. `architecture.mjs bio case-carriage`: 14 files, 0 failures. `coverage.mjs bio case-carriage`: 22 of 22 live ids, 0 failures. `ownership.mjs bio case-carriage tranche/T47`: 0 failures.
- `run.mjs bio` (K2950): format 0, architecture 0, channels 0; coverage 43 failures, none case-carriage's (rule 5 (1)).

Size (session_011eGTRVSA7J71sihm3rkt2U): test runs 16, module lines 1651
