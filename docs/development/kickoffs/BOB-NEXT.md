# BOB — resume here. Written 2026-09-11 by the outgoing BOB, replaced at Bob's direction on context budget (66%), not on saturation.

Read `kickoffs/BOB.md` (the role, the closing protocol, and the SPAWN-CHIP mechanism),
then this. Every figure below is named to a sha and was measured, not carried. Trust
`origin/main` over anything here.

## State at handoff — GREEN, PUBLISHED, and SUPERVISED

`origin/main` = **`dd3057b`** at writing. `node tools/plancheck.mjs` **0 fail / 0 warn**.
This worktree (`bio-worktrees/BOB`) left clean on branch `bob-audit` at the tip. No
claims held. The decisions register: **0 open, 16 total** — nothing anywhere waits on Bob.

**You are the LEADING session** (Bob, 2026-09-10: "continue leading development/testing/
trying as defined on the build list"), and ORCHESTRATION.md's LIVENESS section (rule 5,
2026-09-10) makes the lead's reconciliation tick a DUTY: at every wake, compare the
session list, the process table, and the record's declared states, and RE-DRIVE any
session whose awaited state has landed. Three re-drives were needed in one evening;
expect that rate while both arcs converge.

## THE BOARD — two arcs, both at full throttle, one finale

| lane | remaining | owner · state at writing |
| --- | --- | --- |
| Publication arc (DEC-72, M10) | CASE-5b (running) → CASE-6 (queued; its `accepts-when` IS the arc's definition of done — dataplane doc amended, `CASE-AS-PRODUCTION.md` archived, DECIDED regenerated, same turn) | CONDUCT #9, plus UI-56 and background D-265 |
| Investigation AI | D-297 → DS-2 → DS-3 → DS-4 (gated deploy) | DIST, running |
| | FL-6 (unblocks on DS-3 — FLEET's own watcher is armed on it) | FLEET #1, standing by correctly |
| | **VF-4 — the finale: first LIVE end-to-end CHECK run against a concluded inquiry, in scratch** | fires when DS-4 hands to it |

**When VF-4 lands, PUSH BOB LOUDLY (PushNotification): that is the moment "trying" begins
and he asked to be brought in for it.** REC-15's ceremony stays deferred on DEC-33's own
trigger (Bob reopens case-making) — do not wake it.

## THE LEADERSHIP MECHANICS — what the role file cannot carry, measured 2026-09-11

- **Session ids** (`mcp__ccd_session_mgmt__send_message`; re-list before trusting —
  they outlive their titles): CONDUCT #9 `local_27d4b56c-77f8-40d6-943f-f6ac0d2d1cd4` ·
  DIST `local_8675a228-8117-4df7-9a49-81bc2f3fa4aa` · FLEET #1
  `local_29026fd5-dc77-4bfc-b9c4-476b558e24b8` · CONDUCT #8 (dormant)
  `local_1ada2c0c-f95c-470f-870f-1bb9d7262b2e` — **#8 still OWES one verified
  stand-down line** ("N stopped, 0 alive, listed"); if it never answered, its zombie
  worker may still show in Bob's UI — chase it once, then let Bob close the session.
- **RE-ARM BOTH WATCHES FIRST — they died with the outgoing session** (monitors are
  session-local): (1) a push-watch polling `git fetch` + `rev-parse origin/main` each
  60s, emitting the new commits — every landing gets VERIFIED from the remote
  (plancheck + the item's row) before you call it done; (2) a liveness tick each ~20min
  emitting only on the dead-wait signature (wait-shaped processes while zero
  battery/workerd/miniflare run). The outgoing session's exact commands are in its
  transcript; the shapes are what matters.
- **Spawning a missing/replacement session**: `kickoffs/BOB.md` carries the chip
  mechanism (kickoff first, `spawn_task` chip second, guard on the state — and per
  LIVENESS rule 2, a guard STOPS SAYING WHAT STATE IT AWAITS, and YOU re-drive it when
  the state lands; a chip clicked early is not a failure, it is a guard doing its job).
- **Credentials**: all verified working 2026-09-10 — Cloudflare API + admin token, and
  the GitHub push token (classic, authenticates as `believeinoakland`, minted
  2026-09-10, **~90-day expiry: expect "Bad credentials" around early December**; the
  fix is the clipboard route, and stranded local commits are the symptom to look for
  FIRST when any session's pushes go quiet).

## THE HEALTH ACCOUNT — the outgoing session's errors, so you inherit the lessons not the habits

1. **I authored the hang class I later had to legislate against**: CONDUCT #9's spawn
   chip guarded on a state with a one-shot check and no re-drive path, and the session
   correctly stopped — forever. It became LIVENESS rule 2. When you write a guard,
   write its re-drive in the same breath.
2. **My fleet report let Bob believe DIST wanted to deploy a "real" worker named
   `bio-plane`** — the truth (a phantom NAME in configs that nothing ever substituted)
   took a full extra round to land. State a config-reference defect as what it is on
   first contact; a wrong mental model in Bob's head costs more than a long paragraph.
3. **On DEC-70 I recommended Reading A and Bob's argument reversed me** — recorded
   faithfully, and the reversal was on the merits (relative contributions shift). Not a
   defect, but carry it: his structural instincts about the record's lifetime value
   have beaten this desk's local-consistency instincts twice now (DEC-69's FORCED
   amendment is the other).

## Standing authorizations, unchanged and binding

Tactical calls, sequencing, activation, mechanism, spawning and routing are YOURS —
never block on Bob, never report tactical state (fix it or route it). Bring him only
doctrine, his-name risk, outside effects. `node tools/decided.mjs "<subject>"` before
raising anything. Gate with `node tools/gates.mjs`; publish and VERIFY FROM THE REMOTE;
the repository is the channel. Report what was DONE and what was DECIDED.
