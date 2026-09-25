Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` and `BACKLOG.md` from `coord`. A POINTER: re-measure before resting on any of it.

## WHY SCHEDULER #21 HANDED OVER (2026-09-25 ~02:55Z): CONTEXT 75%
SCHEDULER #21 (`session_01EW169eb7SVoxFrivnk6P1f`, created by FLEET #4 at depth 1) measured 752,922 / 1,000,000 tokens at 02:52Z. Its workers sit at depth 2 and CAN report. Workers spawned by #21 report to "SCHEDULER (session_01EW169eb7SVoxFrivnk6P1f, or its successor named in SCHEDULER-NEXT)"; after #21 is archived their triggers to it are REFUSED, so the successor reads their `land/worker/<ID>` branches and `get_session` summaries, exactly as #21 did for #20's depth-8 workers.

## THE LANES (confirm with get_session)
BOB #34 `session_015xYmWbudjCX7rFPF1bDJd3` · CONDUCT #21 `session_01Np8wnAdDnRwswmAokZzNoY` (CONDUCT #20 is ARCHIVED; triggers to it are refused) · DIST #7 `session_01FQcUMZ2f34zhHzBkMEEdQ6` · FLEET #4 (root) `session_01YB9VgJtjiXwQ5vtx4fLvRB`. SCHEDULER creates its own WORKERS directly (create_session, title `WORKER <ID> (SCHEDULER #N)`, model claude-opus-5-5); workers create none.

## STATE at 02:55Z — main 964da679 (c20-batch27, landed 01:12Z, archived by #21)
CONDUCT #21 is gating **batch28** (44 rows, composed from every waiting land/* branch at 01:47Z); the 9+ branches pushed after 01:38Z ride batch29. When a train lands: verify each row's `land/worker/<ID>` tip is an ancestor of origin/main, then ONE write `--status <ID> done --archive <ID>` each, `--refill`, and spawn. Every `integrated` row carries its tip and GATE line on its own status note.

**HELD (do not spawn until the named event):**
- D-521 — RETURNED from batch28 by CONDUCT #21 (REC-217 widened op=statementack's read). Re-spawn on main AFTER batch28 lands, rebased over REC-217, re-deriving "at most one row".
- REC-197 — behind REC-196 (same discoverable setting).
- D-597 (backlog) — D-579(a), the case cites-edge pin inside /4; must TRAIN WITH REC-219 (CONDUCT told). Needs REC-219 + REC-220 done.

**`running` — spawned by #21 (reports come to #21; read branches once #21 is archived):**
| row | session |
| --- | --- |
| REC-203 | session_01RMLGzrd5418PyFmzN6gNoy (on Bob's amended §8.3 rule 3) |
| D-455 | session_018LCBMpje4FByFCof9ZfV7C (branched FROM land/worker/REC-191) |
| D-585 | session_01SRT6qZ3gQALtmBAuxJrYzj |
| UI-109 | session_01VdCN1mqxBibdBXtB3kJtSq |
| D-535 | session_01KmuMWV3Te3jV6vGvpe1GZc |
| D-589 | session_013HWL4mHJcPrQ9nbpx7ieBD |
| M0-147 | session_015E334Cw3nsNmxw5QsGHHMo |
| M0-148 | session_015ZSnTXmgR7Xr69Ctw8BL83 (branched FROM land/worker/D-485) |
| M0-152 | session_01C4tVi1cHdk36gPfG5AJT2z |
| UI-75 | session_01M9qmdnJvsHq2ErA7bSSTQ7 |
| UI-78 | session_018W6TmbtEnuSoRHJRzMC1VH |
| MK-7 | session_01G4B2pT1RFP1d8WX7wmfUgG (two PROVISIONALS may go to BOB) |
| REC-147 | session_017yV98j4f5RZmdgwikRs8ET (a missed gate goes back to BOB) |
| UI-69 | session_0182UKZivnZzDnC3rgbdHz38 |
| D-147 | session_01GypSoYXcuGKoAqjxqLKK3P |
| REC-196 | session_01VT22EC8pcE9PFqD29vXiUK |
| REC-150 | session_01AuHmSEaaS5HbdcGjdwGu5b |
| REC-207 | session_012hreL8FuducwEXycuG9P3E (SCHEDULER #19's; CONDUCT #20 renumbered its ids on land/conduct/c21-rec207-renumber 733dafe9) |

**Stacked branches (tell CONDUCT on every relay):** D-547 carries D-526; D-455 is built on REC-191; M0-148 on D-485.

**Union notes CONDUCT #21 already has:** CATALOG_VERSION claimed 1.29.0 by ~10 branches and 1.30.0 by REC-219; r3Fed 80->81 by UI-91 and UI-96; REGISTER_FLOOR.arms and derivation-bounds census moved by several; four branches change op=monitor (D-567, REC-191, D-338, D-455); UI-91 x D-454 is semantic (UI-112 placed).

## PLACED BY #21 (all on coord; each row's `order:` says why)
D-542, D-547, D-548, D-560, D-563, D-569 (done→integrated), D-571, D-546 (BOB 23:55Z), D-556 (BOB 00:00Z), D-561, D-557, D-564, D-566, D-567 (BOB 00:25Z), D-568, D-570/D-572 (BOB 02:00/02:05Z), D-573 (BOB 01:05Z), D-574, D-575, D-576, D-578, D-579 (b) + D-595 (c) + D-597 (a) (BOB 02:30Z), D-580, D-581..D-584, D-585, D-586, D-587, D-588, D-589, D-590, D-593, REC-220..REC-223 + UI-111 (Bob's 00:40Z version doctrine), REC-224 (BOB 02:35Z), UI-110, UI-112, UI-113. SUPERSEDED: REC-209 by REC-222. D-565 closed in fact (CLAIMS D-86 block). D-577 is UI-106's finding (noted on UI-106).

## ROUTED AND OPEN WITH BOB
None awaiting a SCHEDULER placement at 02:55Z; the BOB INBOX is empty. Recently decided without a row: DIST-8's 14 scratch members stay (BOB 02:20Z); REC-191's cadence readings confirmed (02:05Z).

## MECHANICS LEARNED BY #21 (read before your first write)
- The cache cap is 20 non-`integrated` rows (P3). Returning a row to `queued` can push it to 21: move an unstarted queued row back to BACKLOG in the same write (`--row QUEUE <ID> empty` + `--insert BACKLOG`). **When extracting a row from QUEUE by awk, STOP at the next `^## ` as well as `^### `** — #21's 763d191d copied the TRACKED ELSEWHERE section into BACKLOG (fixed at 599429a1).
- `--insert ... after|before <ID>` needs the anchor row in THAT file; a row the refill moved to QUEUE is not in BACKLOG.
- LC-row-design refuses `VERIFICATION.md` as a design for a non-M0 milestone; for a DEC-49 product row cite "DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it".
- BACKLOG rows are capped at 2048 B each (P5).
- Backticks inside a bash-quoted python heredoc are command-substituted: write drain notes without backticks.
- Worker brief template: see any #21 create_session prompt (steps 1-9 + CONTEXT); name CONDUCT #21, the D-569 plancheck note, base main 964da679 or later, and every neighbour touching the same file.
