# BOB — resume here. Written 2026-09-15 by BOB #11, stopped at Bob's direction on token budget, not on saturation.

Read `kickoffs/BOB.md` (the role, the closing protocol with its EIGHT rules, the spawn-chip mechanism), then this.
**Trust `origin/main` over anything here**, and note that this session ends mid-flight: three rows are integrating
and ONE DESIGN SWEEP IS OWED (§1). `CLAUDE.md` gained nine entries today and several of them are this session's own
errors — read its traps section and its "agreement of several documents" rule before trusting any premise below.

## 1. THE ONE ACT OWED, AND IT IS A DESIGN ERROR OF MINE — DO THIS FIRST

**`CONTENT-SEARCH-DESIGN.md` §4.3's per-capture bound is WRONG IN TWO INDEPENDENT WAYS, and REC-91's worker found
both while building it.** The row was integrating when this session stopped; sweep §4.3 and §4.1 against what
actually landed, and **fold what the worker established rather than restating what I wrote** — the document follows
the code here, and the code follows the design decision, in that order (CONDUCT #11's framing, agreed).

1. **MIS-SITED.** The 2 MiB per-capture text bound CANNOT FIRE through the route §4.1 names: `op=promote` refuses an
   oversized inline bundle file first (`INLINE_MAX` = 1,048,576 B, `store.mjs:425`; the refusal at `:8617` is
   deliberate and whole-call, because citing a prefix would silently change what the operator's click meant). A
   2.4 MiB capture had its WHOLE PROMOTION refused, and **unaddressed the item would have refused documents the
   record accepts today.** My error, precisely: the measurement (M0-31) answered *how big is the text*, and the
   question that sites a bound is *what refuses BEFORE me*. I asked only the first.
2. **MEASURING THE WRONG QUANTITY.** §4.3 bounds BYTES; the index costs ROWS and FTS ENTRIES. **Bytes do not bound
   the unit count** — a spreadsheet of one-character cells is small in bytes and enormous in units, a deck is the
   reverse. **STATE THESE AS TWO**, or the next reader closes the siting and believes both closed.

**The direction I had settled but did not land:** express the per-capture bound in UNITS at the writer, state any
bytes bound relative to what promote already refuses upstream, and take the numbers from the worker's evidence.

## 2. STATE AT HANDOFF

`origin/main` **19a46a4**, plancheck **0 fail / 0 warn** with all three notes present (id allocations 709 sites /
20 namespaces; attribution 17 bindings / 661 files / 0 undetermined; design corpus 50 documents / 0 failures).
Worktree `bio-worktrees/BOB` clean on `bob-audit` at the tip, **no claims held, nothing unpushed**. Queue: 3 running
(REC-91, REC-95, REC-105 — all THREE ARE DONE AND AWAITING INTEGRATION, see §5), 25 queued. 24 GiB free.
Decisions: **0 open, 0 awaiting enactment.**

## 3. THE BOARD

| lane | state |
| --- | --- |
| **CONDUCT #11** `local_bd37b1c9-41d1-4c4e-918f-7456f189eb2d` | LIVE and continuing, ~93% budget remaining (measured, twice, and it declined a clean exit both times). Integrating REC-95 → REC-105 → REC-91, each on its own merged-tree FULL gate. `CONDUCT-NEXT.md` is CURRENT on origin/main, written at a clean boundary rather than under replacement pressure. |
| **CONDUCT #10** `local_3d50e0be-…` | stood down twice, silent since instructed; **closing that session is still BOB's only outstanding ask of Bob** — it can still be woken by a late subagent report. |
| **FLEET #1** `local_29026fd5-…` | stood down, handoff `FLEET-NEXT.md` published and verified at `7ecbc90`. **A spawn chip for a VISIBLE FLEET #2 is FILED AND UNCLICKED** (`task_fdd2a847`); it is gated on that handoff's head line, so it works whenever Bob clicks. |
| **BOB #10, BOB #9, DIST #2** | retired / idle, verified zeros. |

## 4. RE-ARM THE THREE WATCHES FIRST — they die with the session

Scripts live in the session scratchpad and are gone with it; re-create in a minute. Signatures that matter:
1. **push-watch** — `git fetch` + `rev-parse origin/main` every 60 s, emit each new commit, then VERIFY the landing
   (rebase, plancheck, read the CORPUS NOTE rather than the zero-fail count). **Use `tail -r`, not `tac`** (macOS).
2. **liveness tick** — every 20 min, EDGE-TRIGGERED, only on WORKER-WAIT shapes with zero battery/workerd/deploy
   alive; **exclude `rev-parse`/`git fetch` pollers**, which are other sessions' watches.
3. **stall alarm** — origin/main unmoved > 3 h → one alert, re-arming when the tip moves. **It fired three times
   today and was right three times, never once about a hang**: twice it surfaced a DECISION nobody had made, once a
   state the old queue clause would have read backwards. Its job is to say *go and ask*.

## 5. WHAT HAPPENED, 2026-09-14/15 — so you do not re-derive it

**PROGRAM A delivered.** Part II §18 pieces 2, 3 and 4 are DESIGNED as three governed level-2 documents —
`CONTENT-SEARCH-DESIGN.md`, `OBSERVATION-LOG-DESIGN.md`, `EXTRACTION-BREADTH-DESIGN.md` — decomposed into
seventeen items, all rowed, most built across three waves. **The three homeless constructs have level-1 homes**:
`BIO_Assistant_and_AI_Roles_v0_1.md`, `BIO_Publication_v0_1.md`, `BIO_Distribution_v0_1.md`, all v0.1 DRAFT
**awaiting Bob's review — that review is the one thing genuinely waiting on him.**

**Decisions I took under Bob's standing delegation** (he handed DEC-33 and DEC-74 back explicitly as "low level
issues you should figure out yourself"): **DEC-74** not funded (tesseract is GO at cap C; only a tier ABOVE C
remained, and 13 image-only pages of 1,458 do not need it); **DEC-33** stays deferred, its second re-entry clause
unmet by measurement, reopening with Program B or the first sovereign group; **DEC-75** a Drive export's conversion
is a derivation step in the chain with cap undetermined, capture grade stays the fetch path's, no third scale;
**D-358** the EXTRACT role runs in DEC-62's RUN, not on the pilot's credential, mints bounded, an uncited
machine-minted row is a PROPOSAL; **the deck's indexed unit is the SLIDE, not the shape.**

**My designs were corrected FIVE times by the work that built them, and that is the system working**: a debt row
38 days stale (REC-89, subject already built); §5.2's per-page rule falsified by measurement (CPDF-20); the deck
fork (M0-31); §2 claiming both log levels empty after one landed (REC-94); and §4.3, above, which is §1.

## 6. HEALTH ACCOUNT — this session's own errors, inherit the lessons

1. **I sited a bound without asking what refuses before it** (§1). The class CONDUCT named: **CORRECT-AND-UNREACHABLE
   is distinct from WRONG and invisible to every test that asks whether the thing is right** — three instances in
   two waves, all correct, all unreached. Its proposal, which is **yours to act on**: a DESIGN'S OWN BOUNDS are
   instruments and belong in M0-41's four-question table (possible · exists · USED at the moment it matters ·
   bypass visible). Nobody has ever asked those questions of a design.
2. **I cited a debt id in prose before its row existed** — `mintid.test` caught it as a live floor driven by prose.
3. **My first control for plancheck's degrade-to-green was CONFOUNDED**: renaming the predicate dirties the tree and
   trips UNPUBLISHED, so the run exits 1 and reads as *cannot reproduce*. `chmod 000` dirties it too. **Only
   `--local` isolates it**; the defect then reproduces exactly at `0 fail, 2 warn`, exit 0.
4. **A search I ran to establish ABSENCE returned the tool's own error text as five matches**, because the shell
   `grep` could not compile my regex. Re-ran in python for a clean zero. **A search is an instrument; check it
   COMPILED before believing what it found.**
5. **Everything right today came from going to the ARTIFACT** — but not everything: two of the best corrections
   (the queue's inference clause, the attribution hazard) came from reading a sentence against a rule, with nothing
   to measure. **A world-claim is corrected by the artifact; a rule-claim by reading it** (rule 8).

## 7. WHAT IS NEXT, AFTER §1

Program A's frontier: §18 piece 5 (the member's LEAD and firsthand observation, D-194 + D-184) and piece 6 (the
claim object) are **doctrine and Program B's**, not yours to design. The live design work is whatever the three
integrating rows surface, and the standing instruction to fold what lands into Part II. **PROGRAM B — the member
surfaces — resumes when Bob turns to it**; the surface ledger is current through v89 (UI-59), the canvas is
`https://claude.com/artifact/113318ef-4539-49c0-9250-0c2c90ba1a32` (favicon 🔁, republish with `url:`).

## 8. STANDING AUTHORIZATIONS, unchanged

Tactical calls, sequencing, activation, mechanism, spawning and routing are YOURS — never block on Bob, never report
tactical state (fix it or route it). Bring him only doctrine, his-name risk, outside effects. `node tools/decided.mjs`
and a grep BEFORE raising anything. **Gate, then `grep -q '^gates: GREEN'`, then push, chained with `&&` and never
`;`.** Anything outside `docs/` is FULL-class (~5 min at present size). **Verify by the POSITIVE artifact** — the
completion line `N/N suites green · M assertions`, the corpus note — **never by the absence of an error.**
