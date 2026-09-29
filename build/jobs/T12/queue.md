# queue (T12)

**Status** · session_01AA2FMtVLuYJEyYEy7Hivyi · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four readings I am building on now; each is carried on unless you answer otherwise.

**Q1 · C-19.1 (`checkInboxGrammar`) stays in legacy-checks this job.** The catalogue's `checkBundle` runs it over every bundle's `data/inbox.json` (bio-checks 4770), so moving it here means a promotion check and an audit check registered by queue in place of that call, a change to the gate's own composition. **Best reading:** the other R35 rows (C-31.1–.3, C-32.10, C-32.11, C-33.27, C-33.44, C-76.1) move to `src/queue/checks.mjs` with their tests; C-19.1 stays where it is, called by queue's drain as today, and is recorded as deferred with this reason.

**Q2 · `archive-fallback-eligible` (R10, N229) has no stored "latest archive tick".** `archiveTick` records nothing about the source (monitoring R20) and keeps no list of what it found eligible. **Best reading:** the producer derives on read what the next tick would find: the addresses at monitoring's floor (capture R59's `source_reachability` read contract, oldest failing run first, at most 50 as the tick reads), each asked `capture.sourceReachability`, one CONDITION per `fallback_eligible` address, homed under the documents captured there.

**Q3 · `source-modified` / `source-removed` (R9, N229).** Monitoring R8 writes `reeval_pending` and `source_status` into the checked document's own front matter. **Best reading:** for each address `monitoring.subjects()` names (the version it checks), at most 200, the producer reads that bundle's `bundle.md` (record-core `readFile`) and mints one FINDING when `reeval_pending.flag` is true with `source: source_status`: `source-removed` when `source_status` is `removed`, else `source-modified`; gated by the viewer's sight of the document (membership `inSight`), homed under its ancestors (R7).

**Q4 · R39's "settled bias debts".** `bias` offers `uncleared` only; nothing answers settlements to a later module. **Best reading:** R39's block carries the resolved tasks now (their `history`'s `resolved` event: who, when), within the last 30 days, at most 64 (as `disposed`), with the bias half stated as not read (`bias_debts: {read: false, why}`) and a `test.todo` naming it; a REPORT asks bias for a `settled({gate, since, limit})` service. R39 stays marked not yet met for that half.
