# The backlog's tail — the same order, continued

`docs/development/BACKLOG.md` holds the head of the order, within its budget; this file holds the REST of the same
order, and its first row comes directly after `BACKLOG.md`'s last (`docs/development/WORK-PIPELINE.md` §2). It is
LOOKED UP, never read whole: find any row with `node tools/ledger.mjs find <ID>`. Rows arrive and leave only by
tool: a placement that puts `BACKLOG.md` over its budget moves whole rows from its foot to the head of this file,
and a refill or any later write moves them back as room frees (`tools/ledger.mjs` `planRebalance`). No row is
ever cut to fit. No whole-file budget; a row is held to 2 KiB, as in the backlog.

## Rows

### REC-15 · blocked
order: blocked: DEC-33's deferral stands (the live publishing route is a human's own session); BOB #14's item 11 also places it after items 2, 5 and 6 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «REC-15». A worker READS IT before building.

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «UI-17». A worker READS IT before building.
