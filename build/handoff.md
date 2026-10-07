# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #132, 2026-10-07, for its successor. History is not kept here: past handoffs are in git, rulings in `build/rulings.md`.

**Open with Bob:** whether to correct the role file's and `CLAUDE.md`'s paraphrase of P17 and to adopt one fixed paragraph on working with him (BOB #132 proposed both, 2026-10-07; drafts shown to him before any change). Nothing else.

**Working with Bob.** Bob decides what the product does for people and must never do, and how it looks and feels. Modules, their boundaries, splits and order, requirement wording and every technical detail are BOB's, without asking (P17; K1257). A question an existing ruling or requirement answers is BOB's to apply.

## Where things stand

- T35 is open on `tranche/T35`. L1–L9 are closed (L9: K2024). **L10 runs:** FOLLOWING #3 (`session_01Ns8nGmvGwjcv67gEvqEcfv`, T35-65) and SCHEDULER #29 (`session_013E5dGLgQtrrBK6U5UXXWAA`, T35-83); either merges when complete.
- L11 (14 jobs) is next: first apply the split state in `plan/draft-T35-split-reqs/` (its README), then post the STARTs in `plan/starts-T35/`.
- ROOT #6 is `session_01FXbdTJZyPp3Bhcv7pfVSR1`. The channel: BOB read through U120; PR #13 waits for T35's close.
- Open accepted reds (plan rule 9): 1, 2, 3, 7, 9, 10, 11, 12, 14, 19, 21, 22, 23, 25, 26, 29 (until T35-66, T35-70), 31 (until T35-83, T35-73), 32 (until N733), 33 (until T35-72).

## Next steps, in order

1. Watch L10, merge each job, close L10 (§5.6).
2. L11: the split state, then the STARTs; watch, merge, close.
3. Close T35 (§5.7): merge PR #13 on UX-DESIGN's MERGE (K1177). The fast-forward of `main` was refused before and approved by Bob in that session (K1906, K1909; standing list not added): ask Bob in your session at the close.
4. Release 0.81.0, held until T35 completes (K1922): re-cut from T35's tip; each deploy approved by Bob (K1716).
5. Bob's environment clean-ups N711–N713 (K1936), each walked through when its work lands.
6. Open T36 from `plan/draft-T36.md`: settle its "Questions for BOB" first (all BOB's), then §5.2.
7. History clean-up (Bob agreed, 2026-10-07): split `rulings.md` into a short active file read at takeover and an archive searched on need; trim requirements Status lines to approval and current state.

## Process notes

- A push GitHub answers 500: retry with `git -c http.version=HTTP/1.1 push`.
- Merge a job with a merge commit; pull with `--rebase=merges`.
- After a container restart: `npm ci` in `agent-runner` and `sheet-worker` before regenerating.
- Never stop a test run midway (agent-worker's suite mutates its own source; `git restore` if it happens).
