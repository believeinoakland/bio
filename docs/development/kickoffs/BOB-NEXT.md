# BOB — resume here. Written by BOB #31 (session_0124NEAbkH3D4rkivNhZtJ8X), 2026-09-23 ~21:30Z; successor: **BOB #32**

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, then this. Every line is a POINTER, measured ~21:30Z.

## 0. BOB'S STANDING PRIORITY (unchanged from BOB #30's §0, and sharper)
**BIO development productivity is the focus; waiting is waste.** The process must keep working, but when one of OUR rules is what
holds workers idle, work around it at once WITHOUT weakening a check, and fix the rule in parallel. Never wait for the fix to land.
Bob said "stalled again" four times on 2026-09-23; each time the cause was a handoff nobody woke.
- **ONLY BOB KEEPS TIMERS** (Bob ~20:28Z). CONDUCT and SCHEDULER have NONE; they act on messages. BOB arms (a) a ONE-SHOT 20-min
  idle timer (`send_later`, name "BOB #<n> idle timer (20 min)"), reset at the end of any turn a lane's message woke, running the
  stall probe (below) and triggering the lane that can act; (b) ONE hourly recurring dead-man check that re-arms (a). **A successor
  re-creates both on day one and deletes its predecessor's** (BOB #31's: dead-man `trig_01L7SyX4CRWy6y8iKodNmkZd`).
- **Never `fire_trigger` a routine to reach a session**: it starts a NEW stray session (BOB #31 did, 20:10Z; archived).
- **SCHEDULER is the ONLY lane that writes the plan** (Bob 20:57Z). CONDUCT's words are `queued→running`, `running→integrated`.
- **Every done report ends in a spawn** (CONDUCT), and **SCHEDULER keeps ≥4 queued runnable rows** behind 12 working (Bob 20:31Z).
  `integrated` is on main (af1ffa3f). CACHE_ROWS 16 at 48 KiB is on land/scheduler16/integrated @ 6ea0d504, riding c17-batch3.
- Workers run as separate cloud sessions (~10 min each vs 2 h+ local); one FULL gate per train; no releases until Bob asks.
- Refresh at 75% (`get_session`). Recurring routines count against a daily run cap; one-shots do not (routines docs).

## 1. ESTATE (~21:30Z)
CONDUCT #17 `session_01RQQSvvqhRfYC4PH1nBZQob` (~25%); SCHEDULER #16 `session_01UZaSR1KRWmADuxBFYk1wY9` (~55%);
FLEET #4 idle (one-shot wake 2026-09-24 10:00Z, told of 75% and the gate rule); DIST #5 idle, wake paused: when Bob asks for a
release, START A FRESH DIST. BOB #30 and CONDUCT #16 archived (D-398). Last landing: main 02603e88 (21:21Z, 12 rows, GREEN).

## 2. OWED / OPEN
1. **REC-159 BLOCKED on Bob's own act.** Bob approved it (21:08Z: "writing code, not actually adding or changing members"), but
   the permission classifier refuses any session spawning it ([Permission Grant]); do NOT retry or re-frame. Bob was given a paste
   prompt at 21:16Z to start the worker himself. When he has, tell SCHEDULER to flip it `running` into the cache.
   REC-162, REC-155 wait behind it. Ruled: memberset/signeradd/signerset record the stamped actor in a new `by` column.
2. `land/bob/message-driven` @ ca38625a (the rulings above into CONDUCT/SCHEDULER/BOB.md; §4.1; map note) rides c17-batch3.
   Verify on main after it lands.
3. CPDF-22 (one `undetermined` shape) and M0-138 rulings: M0-138 landed; CPDF-22's home-doc note is folded by its worker.
4. Carried from BOB #30: gate ruling KEPT (re-measure after a day: FULL runs per landed row, red unions' re-gate minutes).
   Weekly budget: `allowed_warning`, resets 2026-09-29 18:00Z, recorded, never brought to Bob.
5. The plain-words plan page: https://claude.ai/artifact/M5hUaNBgeM292h4D6odXbX (snapshot 19:40Z; republish on ask).

6. **DEBT.md only shrinks** (BOB #31 22:07Z): new defects go straight into the plan; SCHEDULER runs LED-7 batches (67 open at
   22:05Z, 89 at the day's start). **Bob, 22:09Z: once it reaches 0, REMOVE DEBT.md FROM THE PROCESS**: CLAUDE.md §1/§4, the
   tools that read it (owed.mjs, plancheck's DEBT arms, ledger), and every kickoff. SCHEDULER tells BOB at 0.
7. Rulings still to fold on the next doc landing: SCHEDULER #17's Q1–Q4 (monitor frequency, census stands alone, case
   document /3, no CAP-14 row), and CLAUDE.md §4's defect-minting sentence (new defects go to the plan, not DEBT.md).
8. Estate at 22:10Z: CONDUCT #18 `session_01SGdcPXVjS2wofYoj3tBuKF` starting (archive CONDUCT #17 once #18 is up);
   SCHEDULER #17 `session_014MckoGTYSjDfckPqTKUpAp`; SCHEDULER #16 archived. batch4 was RED on union-only units;
   WORKER c17-unionfix reports to BOB, then train it ALONE.

## 3. STALL PROBE
BOB #31's was a scratch script (lost with its container): fetch coord+main; count cache `queued` untouched ≥10 min (STALL →
CONDUCT), minutes since the last `^train ` commit on main ≥120 (TRAIN → CONDUCT), undrained BOB INBOX entries (→ SCHEDULER).
Rebuild it in your scratchpad in 5 minutes; do not row it.
