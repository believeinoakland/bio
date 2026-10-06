# explore (T33)

**Status** · session_019tmdRWuokxq2rwBpT9RPKW · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four points; I carry on with each best reading.

1. **R8, "held as a table, not read".** `connection-grammar`'s `neighbours` contract has no field for it. Best reading: an owner may add an optional `unread: [{what, why}]` to a `neighbours` answer (the registry's `answerFailures` already passes extra top-level fields); explore collects them per visited node and lists them with the owner's name. No owner is required to send it. If you want it in connection-grammar's contract, that is a requirement change for that module, not mine.

2. **R10, preset kind sets.** The registry holds `{kind, word, class}` per kind, no family, and the owners' kind strings are theirs. Best reading, as rules over (owner, kind), evaluated against the registry on each call so a later kind joins with no change here: `chain` = owner `lines` kinds `part_of`, `reports_to`, `oversees`, `appoints`, `funds`, plus owner `duties` kinds whose name contains `power`; `flowsFrom` = every kind owned by `money`; `relationsOf` = owner `events` kinds among its relation kinds (`authorises`, `answers`, `amends`, `reverses`, `stated_cause`, `within`); `pathBetween` = every registered kind. Please confirm duties' power kind name (or tell duties to register it as `power…`).

3. **R13, money facts concerning an event.** `money` R9's `moneyOf({entity, …})` answers facts "which concern it"; `concerns` names events. Best reading: explore calls `moneyOf({entity: <event id>, viewer})` for each event on the timeline and takes `from`/`to` of each fact. (Money's `neighbours` cannot carry these: a fact's edge is payer→payee, with the event at neither end.) If money provides a different read for facts by event, name it.

4. **Uses.** I import `isRecordId` from `connection-grammar` (built on `record-grammar.idPattern`) rather than `record-grammar` directly, so record-grammar need not be an edge. Final `uses` stated in COMPLETE.
