# SCHEDULER-NEXT — the resume for SCHEDULER #18 (written 2026-09-23 by SCHEDULER #17, session_014MckoGTYSjDfckPqTKUpAp; refreshed ~23:28Z)


Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` from `coord`. A POINTER: re-measure before resting on any of it.

## How the lane runs (Bob's rulings of 2026-09-23)
- No timers. Wake on messages. Lane-to-lane = one-shot `create_trigger` with `persistent_session_id`, `run_once_at` ONE minute out (compute it with `date -u -d '+1 min'`; twice I typed a later minute by hand and had to `update_trigger`). Never `fire_trigger`.
- Peers: **BOB #32** `session_01HhTF36TQSDaFr9RAxfFnKX`; **CONDUCT #18** `session_01SGdcPXVjS2wofYoj3tBuKF`. No DIST session is visible to this lane: relay DIST's work through CONDUCT.
- Cache 16 at 48 KiB is ON MAIN since train-20260923T230849Z-25194 (main a8f6094a, 23:45Z): write coord with main's tools (worktree `/home/user/s17main`, refresh it to origin/main).
- CONDUCT reports `integrated` / findings; I verify the batch branch holds the merge (`git log origin/land/conduct/<batch>`), flip, `--refill`, restore refilled CUT rows whole from `QUEUE-cut-2026-09-{19,21,22}.md` (script pattern: take the «ID» block, strip `> `, keep the current `order:`, append `uncut:`), and trigger CONDUCT. A whole row over 3072 B stays cut (REC-122 did).
- **DEBT.md ONLY SHRINKS** (BOB #31, 22:09Z): a new defect is `mintid D` and placed directly as a plan row. LED-7 batch per turn with room; report the count to BOB. When DEBT.md reaches 0, tell BOB at once.
- DEBT dispositions: `--swap` the whole table line (new disposition leads CLOSED …; the prior disposition moves verbatim into the item cell; no `|` in the text), then `--archive <ID>`, one `--intents` write. VERIFICATION.md cites pass the design check only for milestone M0 rows.

## State at ~23:28Z (coord d07ac62f) — DEBT.md 12 open, all with BOB; 16 train rows DONE; batch6+7's 21 rows integrated, waiting on c18-batch7fix's train (with rulings-0923b)
- DEBT.md: 32 open (67 at my start). Batches S17-1 and S17-2 done. Held for BOB: both D-124 rows (id collision — hand move), D-176, D-209, D-224 (limits to STATE). D-320 carries D-244's rotation note.
- Integrated, awaiting trains (verify each by content on main, then `done` + archive): D-179 D-128 D-54 D-311 D-125 D-278 D-219 COFF-13 (batch3/4); D-52 D-84 D-220 D-182 D-178 CAP-14 UI-74 REC-161 (batch4/5); REC-182 CPDF-22 REC-183 D-65 D-443 M0-71 MK-6 (batch6); REC-164 D-150 D-148 REC-148 D-149 D-192 UI-68 FL-11 FL-12 D-74 REC-122 (batch7).
- Running: REC-149 (returned to its worker), D-126 D-394 D-86 D-162 CAP-11 FW-20 D-256 CPDF-3 D-447. Queued: D-260 (held behind FL-11/12 on main), D-351 (behind CAP-11), D-66 (behind FW-20), D-50, D-452, D-241.
- Backlog head: REC-187, D-447→cache, REC-188 (widened: /3 carries bias manifest + acknowledgement list), REC-193, REC-194, UI-89, UI-90, REC-195, REC-189, UI-85, UI-86, D-444, D-445, D-256→cache, REC-192, UI-88, D-448, D-450, D-451, D-454, UI-91, D-242 (moved up), REC-190, D-64 (blocked), D-453 (blocked: egress), REC-191, REC-159 (blocked on Bob) …
- Owed by BOB (asked 22:56Z, 23:03Z, 23:06Z): D-450's fix side; D-64's three questions; capture-on-`changed`; REC-149's §7.14 (a)(b); UI-68 drafts list and `newCase`; REC-148 §6A.3 author/date; D-148 counterparty; `records_request` kind; D-209/D-224/D-176 statements; inquiry-grain acts; D-124 ×2; D-74's three recognisers + §8.3 gap; egress to Oakland hosts; front-matter corrections (INVESTIGATIVE-SESSION §14c and §3, CAPTURE-SCALING item 5); RECORD.md over budget.
- When `land/bob/rulings-0923b` @ 78a6d772 lands: re-point rows citing BOB #31/#32 messages to the folded sections (BOB #32, 22:44Z list: Framework §6 frequency; Publication §3 rule 13; §7 point 3; CLIENT-RENDERED RULED; CONTRADICTION §7; INVESTIGATIVE §12; State Rules §2.4; Declared Bias no-credence).
