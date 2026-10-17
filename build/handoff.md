# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #196 (`session_01GpDjTHdYbmAoPw19EKBmRb`, depth 1, parent ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy`, primary account), 2026-10-17 ~11:10 UTC, at 22% context, before T50's opening (K3612). Read `build/rulings-active.md` whole, then, whole with the Read tool, K3605–K3612 (BOB #196's; Bob's K3607–K3611 are on the assistant running on Claude Code remote and the local runner disabled), and K3592, K3598, K3602 (what T50's draft review carries).

## Read in full at takeover, besides the usual set

- `build/plan/draft-T50-plan.md` whole: the draft, BOB #181's review, BOB #195's review (what R085 and the lanes add), and the paragraphs since: K3602 (N1195, DEC-298), K3607/K3609/K3610/K3611 (N1196, N1197), K3612 (DEC-299, DEC-300).
- `build/plan/next.md` whole (N1148–N1197 are the newest).
If any session must read part of a document it acts on, it stops and tells Bob first (K3586).

## Standing

- **Bob's trust is low** (K3609: "You can't be trusted. I think that you're either using the wrong model or wrong effort levels (or both!)"). Do exactly what he ruled, in his words; no option he has already closed is reopened, and the local runner is never proposed or used again (K3610, K3611).
- **All work stopped until the weekly reset** (K3609); the reset came at 11:00 UTC 2026-10-17 (overage off). T50 opens now. Development otherwise runs until Bob says pause (K2605).
- No approvals asked of Bob (K3600); a safety-check refusal is never worked around.
- Overage and fix-round rulings (K3549, K3551) end with T50's opening: prune their rulings-active lines then (K3559).

## Where things stand

- **R085 closed.** `dist/cut-0.85.0` @ b29f55bb22 on biosmoke8; agent-runner's container at standard-1 (v6). R085's jobs all COMPLETE; its RINGs are to archived sessions (nothing to act on).
- **Lanes:** none running. ASSISTANT-HOSTING #2 and JOURNEYS #3 archived (rows under T49). No ASSISTANT-HOSTING #3: Bob decided the hosting (K3607), the remote work is T50's own jobs (K3609), and he takes inventory after T50. A fresh JOURNEYS walk goes on T50's release (the unwalked screens behind B-1 and B-4, phone width).
- **Channel:** read through U313; posted B261–B263. UX-DESIGN's design merge at T50's opening takes `91dc95c71b` or newer (DEC-298, DEC-299, DEC-300 among it).
- **Bob's report** on remote vs local (https://claude.ai/artifact/BHeW9qRzLwNecSQYArAfHg) is answered by his K3607.

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085`. Archive BOB #196 once idle (BOB-final row under T49). Delete WATCH #196 `trig_012boCmxu2xkxALG1VJKPS5Q` and ROOT's `WAKE BOB #196` routine if still listed.
2. **Open T50** (§5.2): adopt `draft-T50-plan.md` with its reviews and the paragraphs since as `current.md`, folding every review into the entries and settling each "owner at the fold"; the opening act: `tranche/T50` from `main` (T49 closed, PR #40 @ dccb389428), merge `dist/cut-0.85.0`, then the design branch at 91dc95c71b or newer (§13.1 (5); K2273); move R085's plan, `diag-085-*`, `walk-085*`, `starts-R085/` to `build/plan/archive/`; prune K3549, K3551; write the requirements fold (N1196's remote support from its text in `next.md`; N1197's agent-runner R-line; DEC-298/299/300's owed lines). Tell Bob in one line and ask his meter reading (§5.2 (3)); if near 80%, the "meter" rows of BOB #195's review stay out. Start L1.
3. **N1197 lands first in L6** (agent-runner's job, merged first): the first line of `AgentRunner.fetch` (`agent-runner/src/worker.mjs`:87) answers 410 `LOCAL_RUNNER_DISABLED`; tests prove the container never starts. Independent of N1196.
4. **N1196 (initial Claude Code remote support)** in T50's own layers, no out-of-layer job (K3609): the copy itself creates, drives and logs a cloud session on the held sign-in (K3608); every remote proof runs inside biosmoke8, never from a session's own tools.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T50's close PR (§5.7 (3), K2273); the cut reaches `main` only by its merge into `tranche/T50` at the opening.
- Cloudflare acts on biosmoke8 and deploys: Bob's standing permission (K3466, K3600); a safety-check refusal is handled as rulings-active §1 says.
- Stray branches `job/R085/agent-runner-r8`, `job/R085/screens-daily-r7` (deletes refused) and `study/probe-dialogue` (evidence, keep) are left.

## Open with Bob

None.
