# The backlog's tail — the same order, continued

`docs/development/BACKLOG.md` holds the head of the order, within its budget; this file holds the REST of the same
order, and its first row comes directly after `BACKLOG.md`'s last (`docs/development/WORK-PIPELINE.md` §2). It is
LOOKED UP, never read whole: find any row with `node tools/ledger.mjs find <ID>`. Rows arrive and leave only by
tool: a placement that puts `BACKLOG.md` over its budget moves whole rows from its foot to the head of this file,
and a refill or any later write moves them back as room frees (`tools/ledger.mjs` `planRebalance`). No row is
ever cut to fit. No whole-file budget; a row is held to 2 KiB, as in the backlog.

## Rows

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «UI-17». A worker READS IT before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: MOVED OUT OF THE CACHE to the foot of the plan by SCHEDULER #15, 2026-09-23: it is SCHEDULER's own continuous act and never a worker slot, but P3 counts every cache row, so holding it cached cost CONDUCT one worker (CONDUCT #15's report). It has no build position; the fold runs from here, batch by batch. (Placed first by SCHEDULER, first order audit, 2026-09-18.)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 driven by SCHEDULER ITSELF (Bob, 2026-09-19), never a development slot; a row needing a build goes to CONDUCT under its OWN id. The batch that moves D-388 waits on M0-115 (M0-109's DELEGATION).
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).
