# BOB — resume here. Written by BOB #31 (session_0124NEAbkH3D4rkivNhZtJ8X) at 70% context, 2026-09-23 ~22:22Z; successor: **BOB #32**

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, then this. Every line is a POINTER, measured ~22:20Z.

## 0. BOB'S STANDING PRIORITY
**BIO development productivity is the focus; waiting is waste. The process must keep working** (Bob, 2026-09-23, many times). When one
of OUR rules holds workers idle, work around it at once WITHOUT weakening a check, and fix the rule in parallel. Bob pushes back
hard on any stall and on unexamined tradeoffs; reason from measured figures (he caught a wrong train-size ruling at 22:14Z).
- **ONLY BOB KEEPS TIMERS** (Bob ~20:28Z): (a) a ONE-SHOT 20-min idle timer (`send_later`, "BOB #<n> idle timer (20 min)"), RESET
  at the end of any turn a lane's message woke; it runs a stall probe and triggers the lane that can act; (b) ONE hourly recurring
  dead-man check re-arming (a). **ON DAY ONE: create both for yourself, then DELETE BOB #31's: dead-man `trig_01L7SyX4CRWy6y8iKodNmkZd`
  and any pending "BOB #31 idle timer" (list_triggers).** CONDUCT and SCHEDULER have NO timers; they act on messages.
- **Never `fire_trigger`** a routine to reach a session (it starts a NEW stray session).
- **SCHEDULER alone writes the plan** (Bob 20:57Z). CONDUCT's words: `queued→running`, `running→integrated`. `integrated` rows hold
  no slot. Cache 16 = 12 working + ≥4 queued (16-at-48-KiB rides land/scheduler16/integrated @ 6ea0d504; until on main, main's
  tools REFUSE coord writes: write coord from a worktree of that branch).
- **Trains run BACK TO BACK with everything integrated** (22:14Z, corrected after Bob's challenge); ratchet fixes at integration;
  CONDUCT reports per-train figures after 3 trains — relay them to Bob.
- **Archive a predecessor as soon as its successor confirms up and its work is pushed** (Bob 21:59Z: "why is SCHEDULER #16 still around?").
- Workers are cloud sessions; one FULL gate per train; no releases until Bob asks; refresh at 75%.
- **DEBT.md only shrinks** (22:07Z): new defects go straight into the plan. **Bob 22:09Z: at 0 open rows, REMOVE DEBT.md FROM THE
  PROCESS** (CLAUDE.md §1/§4, owed.mjs, plancheck's DEBT arms, ledger, kickoffs). 50 open at 22:18Z (89 at the day's start).

## 1. ESTATE (~22:20Z)
CONDUCT #18 `session_01SGdcPXVjS2wofYoj3tBuKF`; SCHEDULER #17 `session_014MckoGTYSjDfckPqTKUpAp`; FLEET #4 (one-shot 2026-09-24
10:00Z); DIST #5 idle (a release: START A FRESH DIST). Archived today: BOB #30, CONDUCT #16, #17, SCHEDULER #16. main 02603e88 (21:21Z).
Workers spawned by CONDUCT #17 report to BOB (it is archived): RELAY each to CONDUCT #18, rule any design gap in it.
In flight: WORKER c17-unionfix (batch4's 5 union-only ratchets) reports to BOB → CONDUCT #18 trains it ALONE first.

## 2. OWED
1. **REC-159 BLOCKED on Bob's own act** (approved 21:08Z; the permission classifier refuses any session spawning it — never retry
   or re-frame). Paste prompt given to Bob 21:16Z. When he starts it, tell SCHEDULER to flip it `running`.
2. **Doc landing owed** (land/bob/message-driven @ 58f6d4ed rides the next train; its ca38625a part was in batch4, which went RED):
   fold these rulings into their homes, then push one more commit on a fresh `land/bob/*`:
   - SCHEDULER #17 set 1 (22:00Z): monitor frequency = the address's setting, else the current version's (Framework §6 / monitoring);
     the D-179 census stands alone; bio-case-document/3 for the required bias manifest (Publication §3); no CAP-14 report row.
   - D-65 (22:10Z): the default contract intervals, membership daily and substance weekly; an address's own setting overrides.
   - REC-164 (22:16Z): Publication §7 point 3, a fourth verdict `undetermined` (domain not shown); /.well-known/civicos-group.json.
   - S17-1 (22:18Z): D-53 NO credence ledger (tell Bob; his to overrule); D-64 third-party scripts ALLOWED AND RECORDED in the
     capture sandbox (CLIENT-RENDERED.md); D-256 bodies stay, the read corrects; `independence` readable alone.
   - M0-71 (22:16Z): the contradiction gate's THRESHOLD = 0, PROVISIONAL (CONTRADICTION-IDENTIFY-DESIGN §7).
   - CLAUDE.md §4: "a defect is still minted there" → new defects go straight into the plan.
3. Gate ruling KEPT (BOB #30); weekly budget `allowed_warning`, resets 2026-09-29 18:00Z — recorded, never brought to Bob.
4. Plain-words plan page: https://claude.ai/artifact/M5hUaNBgeM292h4D6odXbX (snapshot 19:40Z; republish on ask, same file path is lost
   with BOB #31's container — pass its URL to update).

## 3. STALL PROBE (rebuild in your scratchpad; do not row it)
Fetch coord + main. STALL → CONDUCT: cache `queued` ≥ `running` for 5+ min, or queued untouched 10+ min. TRAIN → CONDUCT: no
`^train ` commit on main for 120+ min. INBOX → SCHEDULER: undrained BOB INBOX entries. Also count land/worker branches not on main.
