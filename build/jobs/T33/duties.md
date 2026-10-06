# duties (T33)

**Status** · session_019JqprcbLJwV4M5Mw1HNwHn · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · QUESTION

Readings I am building on; each is my best reading and I carry on with it unless you answer otherwise.

1. **Check family.** duties' refusals carry catalogue rows (entities' shape). I need a C-family; I take **C-133** (the next free after record-core's C-132) unless you assign another (other new L5 modules may ask the same). The rows are named `awaiting stamp` in my record (row-census is already an accepted red, K1542).
2. **Response-status vocabulary (R1 `UNKNOWN_REPORTED_STATUS`, R4; my Suggestions' open (3)).** jurisdictions T33-2 did not add one (its Suggestions leave it BOB's). Reading: duties reads the active view's `response_statuses` (`[{status, label, citation, basis}]`); with none held, a `reported_status` entry is refused `UNKNOWN_REPORTED_STATUS`, its detail saying the profile holds no response vocabulary (never a default). Tests use a fictional view. Adding the key to jurisdictions (and validate/combine) is a later jurisdictions entry: I will REPORT it.
3. **Level searched (R11; open (4)).** The derivation names the level `meaning` (observation-log's level vocabulary): matches are read from held events and registered evidence. No observation row is written (reads write nothing).
4. **Uses.** `progressions` dropped (open (6)); `promotion` not needed. Final uses (stated again in COMPLETE): record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, entities, events, lines, local-facts, standards, money, observation-log.
5. **Unbuilt upstreams (events, lines, money; entities' and standards' T33 parts).** duties takes each used module as an injected service (`dutiesOf(host, deps)`, K61) and calls only what their requirements state (`events.readEvent/eventsFor`, `lines.linesOf`, `money.readFact/moneyOf`, `standards.standardRead/inForceAt`, `entities.readEntity/noSuchEntity`). Tests run the real record-core, membership, civil-time, connection-grammar and jurisdictions, and fakes of the unbuilt modules that answer as their requirements say. plane wires the real ones (T33-90).
6. **R12.** Matching is a member's act only in T33; no machine match proposals (open (1)).
7. **R13 `recordTransitions`.** Its transitions are stamped `class:scheduler` (DEC-52) unless the caller passes its own stamp.
8. **R5.** A profile deadline proposes a duty of the office the rule's counterparty names: trigger `{kind: "source", source: <module>}` (R16), time `{basis: "rule", rule, applies_to}` evaluated by civil-time from the source item's date.
9. **Op names (T33-88's).** Provisional: `dutypropose`, `dutyadopt`, `dutydeclare`, `dutyrevise`, `dutywithdraw`, `duty`, `dutiesof`, `dutyoccurrences`, `dutymatch`, `dutytransition`, `dutytransitions`, `powersof`, `dutysetagainst`.
10. **Paths.** Code `bio-plane/src/duties/`, tests `bio-plane/test/m/duties/` (beside entities, local-facts).

## J2 · REPORT

B2 applied (K1563): tranche/T33 merged; R20's `arising_in` column added (the duty's arising_in when it is a capture, else null; follows a revision); `neighbours` registered at load takes an optional `host`, else the default registry's one instance, else `OWNER_HOST_AMBIGUOUS`; power kind `holds_power`; C-133 rows.

**State.** Every requirement R1–R23 is built and tested against the upstreams' requirements: `bio-plane/test/m/duties/` 29/29 (real record-core, membership, civil-time, connection-grammar, calc-grammar, observation-log vocabulary; injected entities, standards, events, lines, money, provenance, content). The four checks pass with my paths written into a scratch `modules.json` (format 0, architecture 0 over 9 files, coverage 23/23, ownership 10 files 0). Pushed at the branch head.

**Waiting.** K1563 (1): before COMPLETE I re-point the tests at the real modules once they merge. duties needs, merged on tranche/T33: entities (T33-25: `sector`, `proceeding`), standards (T33-31: `inForceAt`, `portion`, `instrument`), events, lines and money. Please send a CHANGE (or RESUME) when they are merged; I then re-point, re-run steps 5–7 and post COMPLETE.

**For other modules (to go in my record at COMPLETE):**
1. `calc-grammar`: `relate` (its R10's comparison of two figures) is not exported from `calc-grammar/index.mjs`; duties imports it from `decimal.mjs`. Suggest the index export it.
2. `money` and `events`: their requirements mint `NO_SUCH_FACT` / `NO_SUCH_EVENT` with no one-site function (entities' `noSuchEntity` pattern); duties mints its own (C-133.13, C-133.28). Suggest each export one, and duties answers through it.
3. `plane` (T33-90): wire duties' deps: the real services, `view()` (the active combined view), and `factOf` from local-facts (a calendar entry's status, as civil-time R9 takes it).

Final `uses`: record-grammar, jurisdictions, civil-time, calc-grammar, connection-grammar, record-core, membership, provenance, content, entities, events, lines, local-facts, standards, money, observation-log (promotion and progressions dropped; calc-grammar added for R17's comparison).

## J3 · COMPLETE

**Entries applied.** T33-35 whole (K1440, K1442, K1443, K1453, K1466): R1–R23 met, with B2 (K1563: `arising_in` in R20's read contract; `neighbours` with an optional host, else the default registry's one instance, else `OWNER_HOST_AMBIGUOUS`; power kind `holds_power`; family C-133), B3 (K1569) and B4 (K1580: merged tranche/T33; the real entities, standards, events, lines, money, provenance and content are duties' defaults, each reached on first use on its host; the tests are re-pointed at them; `NO_SUCH_FACT` and `NO_SUCH_EVENT` answered through money's `noSuchFact` and events' `noSuchEvent`, C-133.13 and C-133.28 retired, never reused).

**Paths and uses (for modules.json).** `paths` `bio-plane/src/duties/`; `tests` `bio-plane/test/m/duties/`. Final `uses`: record-grammar, jurisdictions, civil-time, calc-grammar, connection-grammar, record-core, membership, provenance, content, entities, events, lines, standards, money, observation-log. Dropped: promotion, progressions, local-facts (a calendar entry's status reaches civil-time through the injected `factOf`, which plane wires from local-facts; duties imports nothing of it). The tests also import standards' own test world (`test/m/standards/fixture.mjs`) to compose the host.

**Rows awaiting stamp** (new family C-133; they enter the row census with the paths above, at the merge), all `awaiting stamp`: C-133.1 UNKNOWN_MODALITY, C-133.2 NO_OBLIGOR, C-133.3 PERSON_OBLIGOR_NEEDS_LAW, C-133.4 NOT_ACTING_FOR_PUBLIC, C-133.5 NO_ENFORCER, C-133.6 UNKNOWN_SOURCE_KIND, C-133.7 NO_PORTION, C-133.8 VERSION_NOT_HELD, C-133.9 UNKNOWN_TRIGGER, C-133.10 BAD_RECURRENCE, C-133.11 UNKNOWN_BASIS_KIND, C-133.12 HOLDS_AMOUNT, C-133.14 UNKNOWN_REPORTED_STATUS, C-133.15 NO_PERFORMANCE, C-133.16 BAD_TIME, C-133.17 ARISING_IN_NOT_HELD, C-133.18 EXTENT_NOT_HELD, C-133.19 MEMBER_ACT_ONLY, C-133.20 NO_CLAUSE, C-133.21 NO_REASON, C-133.22 NO_DUTY, C-133.23 NO_SUCH_DUTY, C-133.24 NO_SUCH_PROPOSAL, C-133.25 ALREADY_ADOPTED, C-133.26 DUTY_WITHDRAWN, C-133.27 NO_AS_OF, C-133.29 NO_SUCH_OCCURRENCE, C-133.30 UNKNOWN_STATE, C-133.31 NO_CAUSE, C-133.32 NOT_A_SET_AGAINST, C-133.33 NOT_AN_OFFICE, C-133.34 HOLDS_HYPOTHESIS, C-133.35 HOLDS_DUE_DATE, C-133.36 APPEND_ONLY.

**Readings beyond the text (BOB accepted, J1/B2).** Codes R1 does not list, each needed by a field R1–R4 names: `NO_PERFORMANCE`, `BAD_TIME`, `ARISING_IN_NOT_HELD`, `EXTENT_NOT_HELD`; R21's gate codes `HOLDS_HYPOTHESIS`, `HOLDS_DUE_DATE`, `APPEND_ONLY`; `NOT_A_SET_AGAINST` (R17), `NOT_AN_OFFICE` (R15). A person obligor needs a `standard` or `court` source with `binds` (the name or role); an organisation counts as public only with sector `government` (undetermined is not), else it needs a live `acts_for`/`contracts_with` line to an office or government organisation. A held exception is applied to an occurrence by a member's `matchEvent({exception})` (discharged). Matches count as known on `asOf` (recorded on or before it). `recordTransitions` reads each tracked duty from 366 days before its adoption to `asOf`; its stamp is `class:scheduler` unless the caller's. Internal reads of other modules carry `class:daemon`; a member's read carries the member's viewer. A profile with no `response_statuses` (N561) refuses every reported status.

**Deferred.** Nothing of this module's requirements. The member-facing words of the op names are T33-88's.

**Found in other modules.** (1) calc-grammar's index does not export `relate` (its R10); duties imports `calc-grammar/decimal.mjs` (N567). (2) plane (T33-90): wire `factOf` from local-facts (as civil-time R9 takes it) and `view()` (the active combined view). (3) jurisdictions: the `response_statuses` key (N561). No other module's artifact is staled.

**Tests and checks.** `node --test bio-plane/test/m/duties/`: tests 30, pass 30, fail 0 (on the real record-core, membership, promotion, provenance, content, entities, events, lines, money, standards, civil-time, connection-grammar, calc-grammar). No other module uses duties' services yet; no layer tests (manifest). With the paths and uses above written into a scratch copy of modules.json (not committed): `format: 126 modules, 125 requirements files; 0 failures`; `architecture: 9 product files, 41 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 23 of 23 live requirement ids named by a test; 0 failures`; `ownership: 10 files changed by duties between tranche/T33 and HEAD; 0 failures`. connection-grammar's owner-conformance battery passes over duties' fixture (R18).

Size (session_019JqprcbLJwV4M5Mw1HNwHn): test runs 31, module lines 1493
