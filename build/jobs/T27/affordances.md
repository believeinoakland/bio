# affordances (T27)

**Status** · session_01RzGjMiL9jvaJHwknSRAGV6 · depth 2 · WORKING · handled B1

## Completion (T27 L11)

**Entries applied** (B1 START)
- N518, R33 (DEC-113; K1134 (3), K1252): `RUNGS.actionholdrelease` is `terminal`, a named exception to R27 stated beside it (`actionhold` stays `reasoned`, K918; HOLD_REFUSED backs the release's reason as it backs the hold's). `CONSEQUENCE_STATEMENTS.actionholdrelease` is `{friction: "dialog", statement}`, the statement DEC-113's sentence with K1252's purge: releasing restarts deletion for the projects shown beside it (actions R57's answer, which the surface reads), their material may be purged again and assistant transcripts past the time limit deleted on each member's device when next opened; this cannot be undone. Published as `VOCABULARIES.rung_consequences` (the same object). `NON_ACTS` names `actionholdrelease` entry-directed (R33's words) and `actionholdpreview`, `projectholds` `read:`. Not in `MACHINE_REFUSALS` (R7, R20).
- N520, R34 (DEC-116, DEC-100): `RUNGS` grades `docketfile` and `docketdecline` `reasoned` (DOCKET_NO_REASON, now in `JUSTIFICATION_REFUSALS`) and `docketpost` `attested`; `RUNG_ABSENT` holds `docketpressure`, `undetermined` on R27's rule, as `actionpressure`. `NON_ACTS` gives the four acts R34's case-directed reason, `docket`, `docketprepare`, `docketinvitation` `read:` and `docketpublic`, `docketfeed` `read: public, no credential`. `VOCABULARIES` gains `docket_shelves`, `docket_entry_kinds`, `docket_proposals`, `docket_pressure_kinds`, docket's own arrays by reference. The module now imports `docket` (its new use).
- Accepted red 5: `backing.test.mjs`'s R19 `actionhold` case now drives only `in_place` through `actionhold` (refused HOLD_REFUSED without a reason, nothing written; a later statement corrects forward) and the release through `actionHoldRelease`.
- Re-scan for the N502/N508 kind: nothing stale found in the module's code or tests beyond what this entry changed (the `RUNG_ABSENT` header now names R34's addition beside R32's).
- Requirements R33 and R34, marked `not yet met: T27`, are met; their marks are BOB's to strike at the merge.

**Tests changed** (`bio-plane/test/m/affordances/`)
- `catalogue.test.mjs`: R2's bands gain `docketpost` (attested), `actionholdrelease` (terminal), `docketfile`, `docketdecline` (reasoned); R4's keys and by-reference list gain docket's four; R19's terminal rule names R33's exception; R27's count sets R34's `docketpressure` beside R32's; R31's set gains R33's statement. New: "R33 R2 R7 R12 R20" (actions' op map, grade, family, statement, NON_ACTS, the reads, totality with the rows and negative controls) and "R34 R2 R3 R4 R7 R12 R19" (docket's op map exactly, grades with negative controls, DOCKET_NO_REASON a row of docket's checks, NON_ACTS, vocabularies, totality).
- `backing.test.mjs`: the `actionhold` case re-pointed (above); new R33 backing at actions' interface over a real project: release refused HOLD_REFUSED without a reason, nothing written; it records `restarted` equal to R57's preview (the action's project); a second release HOLD_ALREADY_RELEASED; the release stays under a later hold. New R34 backing at docket's interface: filing, take-back and decline each refused DOCKET_NO_REASON without a reason, nothing written, accepted with one; `docketpost` refused DOCKET_SIGNATURE_REFUSED for another member's key or other bytes, nothing written, posted with the manager's signature.
- `plane.test.mjs`: R19's "every reasoned op is driven" list gains `docketfile`, `docketdecline` (driven in backing.test.mjs).

**Catalogue rows added**: none (this module owns no DEC-49 rows), so none reads `awaiting stamp`.

**Deferred**: none.

**Found in other modules** (REPORT J2)
- `control-plane` test `totality.test.mjs` R2, R41 (`unaccounted` over the door's op table) was green before this merge and reads `stale` for the 12 ops R33 and R34 name (`actionholdrelease`, `actionholdpreview`, `projectholds`, the nine docket ops) until op-declarations' L11 merge carries their rows (its R12, R13). Not on the accepted-reds list by name; it is the merge order's own consequence (affordances first).
- `control-plane` R22 (CHECK_FAMILIES, docket's DOCKET_CHECKS): accepted red 4, unchanged.
- No generated artifact staled: `affordances` feeds no bundle in `build/manifest.md`'s table.

**Tests and checks** (on `job/T27/affordances` with `tranche/T27` @ `4d283665f9` merged in)
- `node --test test/m/affordances/*.test.mjs`: tests 153, pass 153, fail 0, skipped 0 (147/1 before, the one red accepted red 5).
- The users of affordances: tasks 71/0, queue (with `conclude-project.test.mjs`) 98/0, op-declarations 35/0, plane (with `migrate-released.test.mjs`) 56/0, control-plane 126 pass, 2 fail: R22 (accepted red 4) and R2/R41's totality (the 12 ops R33, R34 name read `stale` until op-declarations' merge; green before this change; REPORT J2).
- No layer tests are named in `build/manifest.md`.
- `format`: 92 modules, 0 failures. `architecture`: 13 product files, 140 relative imports, 0 failures. `coverage`: 34 of 34 live ids named, 0 failures. `ownership` against `tranche/T27`: 0 failures.

Size (session_01RzGjMiL9jvaJHwknSRAGV6): test runs 9, module lines 3231
