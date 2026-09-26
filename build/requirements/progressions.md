# progressions — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d91579`, after membership's early merge; `build/extraction/progressions.md` has the table): `bio-plane/src/store.mjs` 27036–27345 (the requiredness lookup, `defineProgression`, the version readers, the disposition view, `readProgression`), 27744–28490 (`#assembleInstance`, `threadInstance`, `readInstance`, `dischargeStage`, `readExceptions`, the overdue clock, `proposalsFeed`, `captureProgressions`), 31417–31737 (`proposeDispose`), 1325–1330 (a migration), and the dispatch entries `progressiondefine` … `captureprogressions` and `proposedispose` (50034–50074, 50096–50109). `bio-plane/checks/bio-checks.mjs`: three rows of `ACT_SHAPE_CHECKS` (C-33.26 at 10699–10705; C-33.42, C-33.43 at 10943–11001). `schema.mjs` 1028–1187 and 1216–1266: `progression_defs`, `progression_stages`, `progression_def_versions`, `progression_stage_versions`, `progression_instances`, `progression_exceptions`, `proposal_dispositions`. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, gates and stamps, which stay with `control-plane` (K3). Not yet met: R19, R27, R31, R32. Old-plan rows targeted here: D-623 and D-688, neither of which is this module's (map §5: D-623 goes with the project-scoped disposition to `queue`, D-688 is `actions`' lifecycle grammar, C-94).

**Size (P6).** About 1,720 lines move (about 910 without comment-only and blank lines): `store.mjs` 1,439, `schema.mjs` 211, `bio-checks.mjs` 66. If the project-scoped arm of `proposeDispose` (152 lines) goes to `queue` as the map proposes, about 1,560. Well under 4,000.

## Public

### Purpose

A progression is a group's declared flow for one kind of happening: its ordered stages, what each presupposes, how many documents it may hold, how soon it must follow, and whether it is required. An instance threads real captured documents through those stages by following one entity. From the declared flow and the documents threaded, the record derives, on every read and never stored, the instance's grade (its weakest link), each required stage that is missing and not lawfully discharged, and each missing stage that is overdue. The derived questions are aggregated one per (progression, stage), and a member's recorded decision ages a question without hiding it.

### Provides

Terms. A **stage** is `{stage_key, stage_no, label, after_stage, cardinality, within_interval, required}`; `required` is one of `always`, `usually`, `sometimes`, `never`, `unless_exception`. A **version** is one declaration of a definition, numbered from 1. An **instance** is (progression key, entity id). A **grade** is the connection grade A–D; `established` is A or B (both read from `entities`, K76). A viewer is the control plane's stamp, read through `membership`. A decision is `deferred` or `dismissed`.

**defineProgression({progressionKey, label, note?, stages, declaredBy, basis?, citation?}) → definition or refusal** (`op=progressiondefine`)
- **R1** Refusals, in order: `NO_KEY`, `NO_LABEL`, `NO_STAGES`; then for each stage in order `NO_STAGE_KEY`, `DUPLICATE_STAGE`, `NO_CARDINALITY`, `BAD_REQUIRED` (naming the five words); then `UNKNOWN_AFTER` (C-33.26) for an `after` naming no stage of this definition. A refusal writes nothing: a bad stage refuses the whole definition.
- **R2** A first declaration writes version 1, with a basis if one is given (it reads back `stated: false` otherwise). The declarer is the control plane's stamp. Bounds: note 1,000, basis statement 4,000, citation 2,000 characters.
- **R3** A declaration identical to the current version (label, note, and every stage field, in order) writes nothing and answers `unchanged: true` with the current version.
- **R4** A declaration that differs is a revision: refused `NO_BASIS` without a statement, then `NO_CITATION` without a citation (both judged after every stage check); otherwise written as version N+1 with its declarer, instant and basis, `prior_version: N`. Every earlier version stands unchanged. A definition declared before versions were kept is first written as version 1, basis not recorded.

**readProgression({progressionKey, version?}) → definition or refusal** (`op=progression`)
- **R5** `NO_KEY`; a key never declared answers `found: false`, not a refusal. Otherwise the requested version (default the current) with its label, note, declarer, instant, basis and stages in order, `current`, `current_version`, and every version held with its declarer, instant and basis. A version not held is `NOT_FOUND` naming the versions held.

**threadInstance({progressionKey, entityId, placements, threadedBy, viewer}) → instance or refusal** (`op=thread`)
- **R6** Refusals, in order: `NO_KEY`, `NO_ENTITY`, `NO_PLACEMENTS`, `NO_SUCH_PROGRESSION`, `NO_SUCH_ENTITY`; then for each placement `NO_STAGE`, `BAD_STAGE`, `NO_CAPTURE`, `DUPLICATE_PLACEMENT` (one document at one stage twice), `NOT_CONCERNED` (the document does not resolve to the entity). A refusal writes nothing.
- **R7** A placement's grade and bundle are the record's: the document's strongest resolution to the entity, never the caller's. The threading member is the control plane's stamp.
- **R8** A thread replaces the instance's placements *(Open for Bob 2)* and answers R10's read with `threaded`, `threaded_by` and `at`. It asks the scheduler to wake at R17's next deadline.

**readInstance({progressionKey, entityId, viewer}) → instance or refusal** (`op=instance`)
- **R9** `NO_KEY`, `NO_ENTITY`. No such definition answers `found: false, defined: false`; nothing threaded answers `found: false, defined: true` with no grade and no findings.
- **R10** Derived on read against the current definition: the stages in order, each with its documents and grade (its strongest document); a `chain` of consecutive placed stages, each link graded the weaker end; the instance `grade`, the weakest link, and `established`; with fewer than two placed stages the grade is null and `grade_determined: false`, never invented. The instance, each finding and each discharge name `definition_version`.
- **R11** A stage with no document whose `required` is `always`, `usually` or `unless_exception` is a `missing_predecessor` finding carrying the instance grade (or `undetermined`), `dischargeable: true`, unless an exception names that stage, when it is a `discharged_skip` carrying the exceptions. A missing `sometimes` or `never` stage is neither. An exception naming a present stage discharges nothing and is shown on its stage. *(Open for Bob 1)*
- **R12** Each finding carries `disposition`: the decision recorded for its (progression, stage) with state, reason, decider, instant, the version it judged (or `not recorded`) and whether it applies (R20), or null. `open_finding_count` counts the findings no applying decision governs; `finding_count` counts all of them.
- **R13** A document's bundle id is null for a viewer who may not see that bundle; capture shas, grades and findings are the same for every reader.

**dischargeStage({progressionKey, entityId, stageKey, captureSha, reason, citation, declaredBy, viewer})** (`op=discharge`); **readExceptions({progressionKey, entityId, viewer})** (`op=exceptions`)
- **R14** Refusals, in order: `NO_KEY`, `NO_ENTITY`, `NO_STAGE`, `NO_CAPTURE`, `NO_REASON`, `NO_CITATION` (C-33.41), `NO_SUCH_PROGRESSION`, `NO_SUCH_ENTITY`, `BAD_STAGE`, `NOT_CONCERNED`. Success records the exception document against that stage (reason at most 4,000, citation at most 2,000 characters, declarer stamped); recording the same document at the same stage again replaces its reason and citation *(Open for Bob 2)*. It answers R10's read with the discharge's fields.
- **R15** `readExceptions`: `NO_KEY`, `NO_ENTITY`; every exception recorded for the instance, applied or not, ordered by stage then capture, bundle ids withheld as in R13.

**Overdue; overdueScan(now) → {overdue_count, next_deadline, next_deadline_at}**
- **R16** A `missing_predecessor` stage is also an `overdue_successor` finding, with its deadline, predecessor instant and `overdue_by_ms`, when its `within` reads `<n> day|week|month|year` (plural allowed; months and years by the calendar), its `after` stage is placed, a placed document of that stage has a date (its reading's date, else its registration), and now is past the latest such date plus the interval. In every other case it is not overdue, and no deadline is invented. Now is the caller's instant (`now=`, milliseconds), else the instance's configured clock, else the wall clock.
- **R17** `overdueScan` writes nothing; `next_deadline` is the earliest deadline strictly after now, or null, so a consumer never re-arms to now.

**proposalsFeed(now) → {instances, proposals, dispositions, counts}** (`op=proposals`)
- **R18** One walk over every threaded instance. `instances[]`: each instance with an open finding, missing findings then overdue. `proposals[]`: one per (progression, stage) carrying its instances; the weakest grade across them, null with `grade_determined: false` if any is undetermined; `overdue`, `overdue_count`, `kinds`, `surfaced_by: machine`, `definition_version` and `prior_disposition` (a decision about an earlier version); ordered by instance count, most first, then key. `dispositions[]`: every decision recorded, with its version view. A finding governed by an applying decision leaves `instances` and `proposals` and stays in `dispositions`.

**captureProgressions({captureSha, now}) → {capture_sha, count, instances}** (`op=captureprogressions`)
- **R19** `NO_SHA`; every (progression, entity, stage) at which the capture is placed, each instance assembled once, with its missing and overdue findings, each carrying `established`, `needs_confirmation` (grade C) and its disposition; a capture placed nowhere answers an empty list. Each instance carries `open_finding_count`. *(not yet met: no row; the count is not published, Framework §8.2's Incomplete entry)*

**disposeProposal({key | progressionKey + stageKey, to, reason, definitionVersion, decidedBy, items?})** (`op=proposedispose`, its progression arm)
- **R20** A decision applies when its recorded version is the current version. A decision with no recorded version applies only when the definition was declared strictly before the decision; the same or a missing instant does not apply. `applies_because` names which of the five cases holds.
- **R21** Refusals, in order: `NO_KEY`, `NO_STAGE`, `NOT_A_DISPOSITION`, `NO_REASON`, `BAD_REASON` (over 160 characters, or a quotation mark, backslash or line break), `NO_DECIDER` (empty stamp), `NO_SUCH_PROGRESSION`, `BAD_STAGE`, `NO_DEFINITION_VERSION` (C-33.42: absent, or not a positive integer; a boolean is no version), `DEFINITION_MOVED` (C-33.43: not the current version, earlier or never held). A refusal writes nothing.
- **R22** Success keeps one decision per (progression, stage), replaced on re-decision, with state, reason, decider (stamped), instant and the current version; no bundle, history or manifest is written. With `items`, each item is decided on its own under the per-item weight, the decider, viewer and identity forced onto every item and a shared `definitionVersion` overridable per item.

## Private

### Uses

- `legacy-checks`: the rows of R1, R14 and R21 until they move here (R28).
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`.
- `membership`: the bundle redactor and the viewer's sight (R13, R15). *(not declared in `modules.json`)*
- `entities`: whether an entity is registered; its resolutions (R6, R7, R14); the grade order and `established` (K76; R10, R19).
- `connections`: the weaker of two grades (R10, R18).
- `extraction`: a reading's date; `provenance`: a capture's registration (R16). *(neither declared; `provenance`'s `register` is a stated read contract, K72 (6))*
- `capture`, `content`: nothing in this module calls them (map §5).

### Invariants

- **R23** A definition's versions are append-only; nothing deletes one but a whole-store purge.
- **R24** Grades, findings, deadlines and aggregates are derived on every read and never stored.
- **R25** A finding reports and never decides: no finding changes a bundle, an instance or a definition. Only a member's recorded decision ages it, and an aged finding is still published (D-79).
- **R26** Every author, threader, declarer and decider is the control plane's stamp, never a body's.
- **R27** Every refusal carries its code, catalogue row and translation (DEC-49). *(not yet met: no row; only C-33.26, C-33.41–C-33.43 have rows today)*
- **R28** Each check moves here as an invariant with its test (K6): C-33.26, C-33.42, C-33.43. C-33.41 (`NO_CITATION`) and `NO_BASIS` are shared act rows and stay where the other acts reach them.
- **R29** `progression_instances` and `progression_exceptions` carry `bundle_id` and are declared to record-core's purge (K23); the definitions and decisions carry none and clear only with the whole store.
- **R30** No place is named in this module's behaviour or outward text.
- **R31** A stage declared `1` or `0..1` holding more than one document is a finding. *(not yet met: no row; Open for Bob 3)*
- **R32** A junction check (Framework §8.2: one response, a signed amount differing from the award, amendments past a threshold, payments past the term) is data over an instance and yields a finding. *(not yet met: no row; Open for Bob 3)*

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` Part I §8.2 (the progression table, the missing predecessor, legitimate skips, junction checks, threading by entities, the declared flow and its revisions, REC-184, REC-211, D-552), §12 (age rather than vanish, D-79).
- `docs/architecture/BIO_System_Design.md` §3, the progression construct.
- `docs/development/NOTIFICATIONS.md`: the FINDING class `op=queue` builds from R18.
- `docs/architecture/BIO_Design_Requirements_v2.md`: derived findings inform, never decide; undetermined is stated.

### Suggestions

- **Factory.** `progressionsOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership`, `entities` and `connections` through theirs (K61). The op handlers move here (K3). `scheduler` calls `overdueScan` through its consumer registration.
- **What stays out.** `proposeDispose`'s project-scoped arm (`{project, finding}` → `finding_dispositions`, D-266), its class bridge (`CLASS_NOT_DISPOSED`, C-33.44; a FINDING key refused `NO_PROJECT_SCOPE`) and D-623 are `queue`'s: they read `queuestate.mjs` (layer 11), which this module may not. `op=proposedispose` then routes the progression shape here.
- **Vocabulary.** `STAGE_REQUIREDNESS` and `DISPOSITIONS` live in `affordances.mjs` (layer 11) today; they move here and `affordances` re-exports them.
- **Deferred, with its trigger (Framework §8.2):** a stage observed out of order, and a definition scoped to an institution, when a placed document carries its own date.
- Tests: each refusal gets a negative control; R3, R11 (a `sometimes` stage missing), R13 and R16 (an unparsable `within`) get over-strictness arms. Built work for D-623 and D-688 is on `land/worker/*`, judged by the modules the map names.

## Open for Bob

1. **Does a required `unless_exception` stage with no exception document count as a finding?** The code fires it, marked as a provisional pending your ruling on DEC-9, and Framework §8.2 already says "a skipped stage with no exception document is [a finding]". *Recommendation:* yes, as built and as the framework says; the provisional marker goes.
2. **Should an instance's placements and its exception documents keep their history, as definitions now do?** Threading again replaces every placement, and re-recording an exception overwrites its reason and citation, so a finding read yesterday can lose the documents it rested on with no trace. D-128 made definitions append-only for the same reason. *Recommendation:* yes: each thread and each exception becomes a new dated version, the current one is what instances are read against, and every earlier one reads back.
3. **Are cardinality and the junction checks part of this module now?** The framework calls junctions "the point at which this framework stops describing documents and starts supporting a case", but only the missing predecessor and the overdue successor are built. *Recommendation:* build the cardinality finding (R31) with the module, since it is mechanical. Defer the amount-based junction checks (R32) until the record holds amounts and funds as values (`EXTRACTION-BREADTH-DESIGN.md` §2 row 5), with that as their stated trigger.
