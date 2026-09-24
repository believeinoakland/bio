# BOB — resume here. Written by BOB #32 (session_01HhTF36TQSDaFr9RAxfFnKX), 2026-09-24 ~03:05Z, interim (refreshed again at wind-down); successor: **BOB #33, on Bob's OTHER account**

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, then this. Every line is a POINTER, measured ~03:05Z.

## 0. BOB'S STANDING PRIORITY, AND TONIGHT'S ACCOUNT SWITCH
**Productivity is the focus; waiting is waste; the process must keep working** (Bob, 2026-09-23). **2026-09-24 03:00Z (Bob):** this
account's weekly quota was at 80% at 8pm PT and runs out tonight. The plan: at **05:00Z (90%)** CONDUCT caps workers at 6; at **06:00Z (95%)**
nothing new is spawned, running workers finish, commit and push, every lane writes its `<LANE>-NEXT.md` for the OTHER account, and workers
that need Bob stay OPEN with their questions listed to him. The work continues on Bob's second Max 20x account (it resets early Saturday;
this one early Tuesday). **BOB #33's first act on the other account: stand up CONDUCT, SCHEDULER, DIST and FLEET from their `-NEXT.md`
(create_session, titled `<LANE> #<n>`), then carry the open questions below to Bob.** Sessions on this account cannot be messaged from
the other one; read their state from `coord` and `origin`.
- **ONLY BOB KEEPS TIMERS:** a one-shot 20-min idle timer (send_later, reset at the end of every message-woken turn) and one hourly
  dead-man check. Never `fire_trigger`. Lanes act on messages.
- **Starting build-plan entries is BOB's act, never Bob's** (Bob, 2026-09-23 ~23:20Z). BOB #32 started REC-159 on that instruction.
- **Bob asks for plain words** when you explain; the plain-words plan page is https://claude.ai/artifact/M5hUaNBgeM292h4D6odXbX
  (republished 23:27Z; its builder is `extract.mjs` + `build.mjs`, rebuild them: rows from coord QUEUE+BACKLOG, prose drafted by 4 subagents).

## 1. ESTATE (~03:05Z, this account)
CONDUCT #19 `session_01Kqy1X9xDKa4PAWtmqTaiRx`; SCHEDULER #18 `session_01MgL7YDGuxH1F7e3zxx6GSp`; DIST #6 `session_01Vi1XTVwxcBBMStifuBasLZ`
(idle, no release until Bob asks); FLEET #4 `session_01YB9VgJtjiXwQ5vtx4fLvRB`. Archived tonight: BOB #31, CONDUCT #18, SCHEDULER #17
(by #18), DIST #5, workers c17-unionfix. main `548eb2c5` (02:43Z train: c19-batch9 + my folds fb24040e/bde7644d + the map-budget stopgap).

## 2. OWED BY BOB (open at 03:05Z)
1. **land/bob/status-cellcap** (worktree /home/user/wt-bob2 on this account; rebuild if lost): `tools/status.mjs` caps a map cell's first
   sentence at CELL_CAP=240 chars at a word boundary outside backticks, marked ` …`; status.test +2 arms, status.control A11 (59/0). Map
   44,934 → 41,335 B on main. THEN lower the map budget back from the 51,200 B stopgap to 49,152 B (readbudget.mjs, status.test, plancheck).
2. **land/bob/folds-0924e** (NOT built yet): rebuild onto current main the content of folds-0924d MINUS its CORPUS-STANDARD revert —
   MEMBER-KNOWLEDGE §5 (hidden project undisclosed, D-464/D-486), EXTRACTION-BREADTH §2 row 5 (FINANCIAL REPORT type, FW-22), OFFICE-FORMATS
   "CSV" (FW-23) — plus Intake Doctrine §8 (REC-190: a home is fixed by the first REGISTRATION; only rows PROVEN moved are repaired).
   **Do NOT merge folds-0924c/0924d**: each reverts CORPUS-STANDARD §6, which main now carries.
3. **land/bob/d461-claude @ f1787108**: D-461 + CLAUDE.md §5's scratch rule corrected (full gate 195/195). CONDUCT integrates it in place
   of land/worker/D-461.
4. DEBT.md: 3 → 0 as main now carries D-313/D-391 folds and D-388; M0-140 removes DEBT.md from the process (SCHEDULER placed it).

## 3. RULED TONIGHT (folded or rowed; `node tools/decided.mjs` finds the folded ones)
§18.1 (Bob: option D — a published case's OWNERS alone are told once); D-388 (MILESTONES/CIVICOS_UI_STATE ledgers, SESSION-KICKOFF-UI a
kickoff redirect); REC-189 F2 (no machine changes a member-set risk tier); D-450, D-64 ×4, D-65 changed-tick capture, REC-149 §7.14 (a)/(b),
D-86 settling acts, D-50 NFC names, D-246 pixel hash, D-291 enumerated set (§S), REC-187 F1 (adopting a proposal replaces), D-162 (handle,
not cover), D-464 (hidden project's run output is its thinking), D-66 (financial report ≠ budget), CSV design, REC-190 §8, REC-198 fence,
REC-159 (founder refusal on scratch stands), map budget (a) stopgap 51,200 B then (b) render cap.

## 4. WITH BOB
- **Network access:** Bob to switch the BIO environment to **Full** (claude.ai/code → environment selector → hover BIO → settings icon →
  Network access → Full → Save). Then unblock D-453 (Oakland identifier measurement) and REC-203. On the other account, check that
  account's environment too.

## 5. STALL PROBE (rebuild in your scratchpad; do not row it)
Fetch coord + main. STALL → CONDUCT only when queued ≥ running AND running < the worker budget, for 5+ min. TRAIN → CONDUCT: no `^train `
commit on main for 120+ min. INBOX → SCHEDULER: undrained BOB INBOX entries.
