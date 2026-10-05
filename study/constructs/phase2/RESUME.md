# The second constructs study: how to resume it

**Started** 2026-10-05 by BOB #112 (`session_01XqHWUury8tr5g7P4ydCUGx`, Bob's primary account) on Bob's direction (K1459). **Lives** on branch `study/constructs`, folder `study/constructs/phase2/` (the first study is the parent folder, `../`). Never merged into `main`; its conclusions reach the product only as rulings and requirements once Bob rules. Read `constructs-brief.md` for the question and Bob's words.

## The phases
| phase | units | output | protocol |
|---|---|---|---|
| 1 Reading | C1–C14, D1, D2 (canon and design documents); M1–M7 (module requirements, verified against code) | `notes/<id>.md` | `READING-PROTOCOL.md` (+ `READING-PROTOCOL-MODULES.md`) |
| 1→2 Digest | script | `digest/PEOPLE.md`, `EVENTS.md`, `MONEY.md`, `SIX.md`, `DOCTRINE.md`, `CROSS.md` | `python3 build-digests.py` |
| 1→2 Registers | X-REGISTER | `digest/DOCTRINE-REGISTER.md`, `digest/CROSS-REGISTER.md` | `prompts/X-REGISTER.txt` |
| 2a Analysis | A-PEOPLE, A-EVENTS, A-MONEY | `studies/<CONSTRUCT>.md` | `ANALYSIS-PROTOCOL.md` |
| 2b Integration | A-INTEGRATION (after 2a) | `studies/INTEGRATION.md` | `ANALYSIS-PROTOCOL.md` |
| 3 Review | R-1 (PEOPLE, EVENTS), R-2 (MONEY, INTEGRATION), R-3 (the architecture as one system, K1460) | `reviews/R-<n>.md` | `REVIEW-PROTOCOL.md`; R-3: `ARCH-REVIEW-PROTOCOL.md` |
| 4 Synthesis | S-SYNTHESIS; then BOB reviews it, applies the ladder amendments, renders it for Bob | `synthesis/constructs-2.md` | `SYNTHESIS-PROTOCOL.md` |

Every unit's prompt is `prompts/<id>.txt`. `python3 status.py` reads each unit's state from its output and rewrites `STATE.md`.

## To resume, in order
1. Check out `study/constructs` and copy `study/constructs/` to a scratch folder (the workers write there; `phase2/` inside it is the study folder).
2. Rebuild the sources, which are not committed: `sh make-src.sh <a full bio clone> <the phase2 folder>` (pinned: product @ 597f20e11c, design branch @ e4a98364f5, `coord` @ 5393f63ea5).
3. `python3 status.py`; find the earliest phase with a unit not `done`.
4. For each such unit, start a background worker (Agent tool, general-purpose) whose prompt is `prompts/<id>.txt` with "the study folder (this folder…)" made its absolute path. Units of one phase run in parallel. A `partial` unit resumes itself (the protocols' checkpoint rules).
5. Copy the folder back to the worktree and push after each unit completes, so a switch loses nothing.
6. Phase 1 done → `python3 build-digests.py` → X-REGISTER → 2a → 2b → 3 → 4.
7. **If usage runs out**, Bob starts a BOB on his other account (as for the first study, `../RESUME.md` "Between the two accounts"); that BOB reads this file and `STATE.md`.

## State
- 2026-10-05 ~15:35 UTC: protocols written; phase 1 started: C1–C14, D1, D2, M1–M4 running (20, the session's limit); M5, M6, M7 start as readers finish. K1460: protocols extended (system requirements; design for the whole; R-3 architecture review); running readers told.
- 2026-10-05 ~15:45 UTC: phase 1 done (23 notes); digests built; the register step split in two workers (doctrine, cross), running.
- 2026-10-05 ~16:10 UTC: registers done (doctrine 213 entries, 27 conflicts; cross 118 entries, 13 conflicts); phase 2a started: A-PEOPLE, A-EVENTS, A-MONEY.
- 2026-10-05 ~16:25 UTC: phase 2a done (PEOPLE, EVENTS, MONEY); A-INTEGRATION and R-1 (PEOPLE, EVENTS) running; R-2 and R-3 wait on INTEGRATION.
- 2026-10-05 ~16:45 UTC: INTEGRATION done (written from checkpoint notes after a context cut: reviewers verify its citations); R-1 done; R-2 and R-3 running.
- 2026-10-05 ~17:00 UTC: R-2 done; R-3 running; Bob's rulings K1462–K1469 in the brief.
