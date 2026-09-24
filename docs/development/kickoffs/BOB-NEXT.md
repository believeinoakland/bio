# BOB — resume here. Written by BOB #33 (session_01BkXH3dLHH2wx8eUA4k5p73), 2026-09-24 ~22:00Z, at REFRESH (75% context, Bob's reading); successor: **BOB #34**

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, then this. Every line is a POINTER, measured at the time it names. BOB #32's
long handoff is in coord's history (this file at 7c232533 and before) — look things up there, do not re-read it.

## 0. BOB'S STANDING DIRECTIONS (2026-09-24) — these govern everything
- **Priorities: BIO development PRODUCTIVITY first, process correctness second.** Report done and decided, in plain words, never tactical state.
- **16 worker sessions WORKING at all times** (DIST excluded). Bob notices every dip; do not explain a shortfall without acting on it in the same turn.
- **Batch everything.** BOB's own doc edits go on ONE branch, gated once, carried by the NEXT ORDINARY train. Never ask for an early train, never a
  branch or a gate per change. Communicate instructions to lanes by message; the kickoff edit rides the next train.
- **Trains** leave on the ~2-hour cadence carrying everything finished; CONDUCT runs them. No release until Bob types the ask in DIST's session.
- **Every process improvement is TRACKED as a plan row**; only ORDER changes: a process row goes ahead of product only if it appreciably helps
  development productivity (gate time, a false/flaky gate, a blocker) or product quality.
- **Worker sessions are archived once their work is on main** (CONDUCT, as part of landing each train).
- **Plan page** https://claude.ai/artifact/M5hUaNBgeM292h4D6odXbX is rebuilt after EVERY train landing, showing ONLY rows not completed-and-merged.
  Builder = the artifact's own files (`Artifact read` path=builder/run.sh.txt, build.py.txt, template.html.txt, prose.json, slots.py.txt): fetch them into a
  scratch dir, fix run.sh's P= path, run `run.sh "<note>"` after SCHEDULER has archived the train's rows; missing.json lists rows needing plain-words
  prose (a subagent drafts; read it whole); merge into prose.json; republish to the same URL WITH builder/prose.json.
- **Every ruling goes into the BOB INBOX on coord in the same act as its message** (21:55Z) — a ruling sent only by message cannot be found.
- **Context gauge:** `get_session`'s used_tokens overstates after compaction; confirm with Bob's figure before calling a refresh.
- The daily routine quota does not allow timers faster than ~20 min.

## 1. HOW THE LANES RUN NOW (changed today — verify the kickoffs once land/bob/batch-0924e lands)
- **DISPATCH IS SCHEDULER's (RULED 21:05Z):** each wake it flips a `running` row to `integrated` ONLY when its worker REPORTED finished or its branch is
  pushed with a recorded GREEN (an idle/REVIEW_READY bucket is NOT finished — gates run in the background), replenishes, and SPAWNS every queued row
  itself (`create_session`, title `WORKER <ID> (SCHEDULER #19)`, model claude-opus-5). CONDUCT keeps verification, integration, trains, archiving and
  answering workers; it may flip a finished row it hears of; never holds a flip or spawn for a train.
- **WHY the count kept dipping below 16** (the answer Bob demanded): CONDUCT did both trains (30-60 min) and dispatch, every refill took 3 handoffs
  between lanes that act only when woken, and finished rows kept reading `running`. Plus: the app shows gating workers as idle, so its "active"
  count under-reads real work by several.
- CACHE_ROWS is 20 on main (the list feeding 16 workers plus spares). DIST works its own rows in its own session.
- **BOB's timers:** a 20-min SLOT PROBE (send_later; its text is self-contained: step 1 UNCONDITIONALLY triggers SCHEDULER to count WORKING sessions and
  spawn to 16; step 2 runs slots.py on a list_sessions listing and sends CONDUCT the BLOCKED/stale ones; step 3 train overdue → CONDUCT, train landed →
  plan page) and an hourly dead-man routine. BOB #33's ids: probe trig_01Btm4715cpr2c13tEwpKXW3 (22:08Z), dead-man trig_01JT1CaEqRBrWPeEnJkHaFDx —
  **the successor deletes both from its own list_triggers and arms its own.**

## 2. STATE AT ~22:00Z
- Lanes: CONDUCT #20 session_011PzZW1FSobMne4cYeAYWfU · SCHEDULER #19 session_01KJoJnoXN6d5CyZsiw8KTKa · DIST #6 session_01Vi1XTVwxcBBMStifuBasLZ ·
  FLEET #4 session_01YB9VgJtjiXwQ5vtx4fLvRB. SCHEDULER #18 and BOB #32 archived.
- Main 1a7f0bcc (train 24c, landed ~20:13Z). The train of c20-batch25 (18 worker rows + DIST-11/13) left 21:20Z and was STILL GATING at 21:54Z — confirm it
  landed, then rebuild the plan page. Batch26 is filling (UI-101, UI-102, M0-181, REC-199, D-514, D-478, UI-99; REC-200 on its green) for ~23:20Z.
- 20 workers working at 21:52Z (SCHEDULER's count, gating included).
- **OWED BY BOB:** land/bob/batch-0924e (kickoffs SCHEDULER.md + CONDUCT.md: the dispatch split and the flip signal) — BOB #33 gated it at ~22:00Z and
  pushed it if green; if it is on origin, tell CONDUCT it rides the next ordinary train; if not, redo the two kickoff edits on your first batch branch.
  **The `tools/slots.mjs` row** (inbox 21:05Z, corrected) must port slots.py WITHOUT treating REVIEW_READY as finished.

## 3. RULED TODAY BY BOB #33 (all recorded in the BOB INBOX on coord; `decided.mjs` finds them once drained)
Doorbell folded into Intake Doctrine §2a (landed); D-505 replay is the server's word (D-511/D-512); pens vs scratch; D-507 six sentences (+ C-82.6/.7
generalised); D-500 watermark stays seconds, band reads undetermined; REC-194 draft= at publish binds readings; REC-212's three determinations (folded);
review copy withholds+counts the writer's ack (REC-213); render throttle (D-520); D-491 hold→undetermined + queue kind (D-523); per-subresource digest,
no puppeteer (D-529); registeraudit parted captures sound when all parts verified (D-533); risk-tier revision act, append-only with reason (REC-214,
UI-104, REC-215); reading provenance (D-536); REC-216 superseded (propose stays NON_ACTS; UI-105 shows only); FW-23 `reading.dialect`.
