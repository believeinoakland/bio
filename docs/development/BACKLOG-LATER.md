# The backlog's tail — the same order, continued

`docs/development/BACKLOG.md` holds the head of the order, within its budget; this file holds the REST of the same
order, and its first row comes directly after `BACKLOG.md`'s last (`docs/development/WORK-PIPELINE.md` §2). It is
LOOKED UP, never read whole: find any row with `node tools/ledger.mjs find <ID>`. Rows arrive and leave only by
tool: a placement that puts `BACKLOG.md` over its budget moves whole rows from its foot to the head of this file,
and a refill or any later write moves them back as room frees (`tools/ledger.mjs` `planRebalance`). No row is
ever cut to fit. No whole-file budget; a row is held to 2 KiB, as in the backlog.

## Rows

### UI-60 · blocked — RESTORED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: waits on Bob's re-prioritisation of UI (SCHEDULER, first order audit, 2026-09-18)
milestone: M8
interface: none
depends-on: Bob's re-prioritisation of UI (DEC-33's deferral and the 2026-09-15 content direction stand)
accepts-when: the decomposition exists as rows and this pointer is marked superseded naming them.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «UI-60». A worker READS IT before building.
narrowed: 2026-09-23 by SCHEDULER #17 (CONDUCT #17's 22:00Z finding (2), verified at c17-batch5 @ 7c4f6b5f): UI-43's version acts are DRAINED — versionaccept/reject/consider/revert by UI-74's accept ceremony, versionhide by UI-42, versioncurrent by UI-45. Residue still owed: `attesttext` (in `ACTS_AWAITING_SURFACE`, 0 hits in `app.html`), the doorbell ops `inboxget`/`inboxresolve` (0 hits), and U13, U14, expertise/licences and verified export (unchecked: no op to grep).

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

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: MOVED OUT OF THE CACHE to the foot of the plan by SCHEDULER #15, 2026-09-23: it is SCHEDULER's own continuous act and never a worker slot, but P3 counts every cache row, so holding it cached cost CONDUCT one worker (CONDUCT #15's report). It has no build position; the fold runs from here, batch by batch. (Placed first by SCHEDULER, first order audit, 2026-09-18.)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 driven by SCHEDULER ITSELF (Bob, 2026-09-19), never a development slot; a row needing a build goes to CONDUCT under its OWN id. The batch that moves D-388 waits on M0-115 (M0-109's DELEGATION).
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).
