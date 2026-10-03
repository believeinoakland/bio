# accepted-work — requirements

**Status** · Requirements for T28, folded by a worker for BOB #104 at T28's opening, entry N522 (DEC-96 items 1 and 4; `plan/draft-T28-n522.md`). A new product module with no `from` (its place is BOB's under P17). It sits in layer 6 directly after `inquiry-grammar`, whose imported-finding reference (its R11) it reads, and before `inquiry`. It is the seam through which modules earlier than `case-import` (L8) read another group's accepted work (P4). Its own T28 job writes its code at `bio-plane/src/accepted-work/` and its tests at `bio-plane/test/m/accepted-work/`, then adds both to its `modules.json` entry (K1043's form). Every requirement is not yet met (T28).

**Size (P6).** About 250–400 lines.

## Public

### Purpose

A group's own finding may rest on a finding of another group's case that the group has accepted (DEC-112 (6); DEC-96 item 1). That work is held by `case-import`, late in the order. This module is the one place earlier modules read it. It also refuses a leg on such a finding unless an acceptance of the named edition is in force. It holds nothing itself.

### Provides

Terms.
- An **imported finding reference** (a **ref**) is `inquiry-grammar` R11's spelling.
- An **acceptance in force** is `case-import` R6's, not withdrawn by its R7.

**registerAcceptedWork(module, {finding, openFlags, withdrawals})** (K31's pattern)

- **R1** One registration, filled by `case-import` (its R16) at start. A registration missing any of the three functions is refused `LISTENER_MALFORMED`, and a second registration is refused `LISTENER_DECLARED`. Both come through `membership`'s `listenerRefusal` (its R81). The three functions:
  - `finding({ref, edition, viewer})` answers `{ref, import, group, case, edition, finding, manifest_sha, result, pair, acceptance}`, or null when the finding is not held at that edition or the viewer may not see the import. `pair` is the finding's per-axis pair as the edition publishes it. `acceptance` is `{by, at, reason, checked, gaps}` while one is in force, else null.
  - `openFlags({ref, edition, viewer})` answers `{flags: [{flag, finding, issue, at}], complete}`. It covers the open flags on that edition, both the edition's own and the named finding's.
  - `withdrawals({after, limit})` answers `{withdrawals: [{withdrawal, import, edition, refs, at}], cursor}` in withdrawal order.

  (DEC-96 items 1, 2, 4) *(not yet met: T28)*
- **R2** `acceptedFinding`, `openFlagsOn` and `acceptanceWithdrawals` take the same arguments and answer the registered functions' answers.
  - With none registered, each answers `{absent: true}`, stated as `accepted_work_absent`.
  - When the registered function throws, each answers `{unreadable: true}`.

  None of them writes or throws. They are the one way `strength`, `reevaluation`, `basis-versions` and `publication` read accepted work. (P4; DEC-96) *(not yet met: T28)*

**acceptedLegRefusals({legs, viewer})**

- **R3** For each leg whose target is a ref:
  - when R2 answers absent or unreadable, the leg is refused `ACCEPTED_WORK_UNREADABLE` (C-21.5);
  - when `finding` answers null, or answers `acceptance: null` at the leg's `target_edition`, the leg is refused `IMPORTED_NOT_ACCEPTED` (C-21.4).

  Each refusal is a finding naming the leg's `ord` and ref. Other legs are not asked. It writes nothing and never throws. (DEC-112 (6): "an accepted finding may support the group's own work"; DEC-96 item 1: acceptance names one edition) *(not yet met: T28)*
- **R4** At start, the module registers with `promotion` (`registerStep`, its R39) a check of every promotion of an inquiry that is not a replay. It runs R3 over each leg whose target is a ref and that is new against the held version, or whose target or `target_edition` changed. A refusal is `BASIS_REFUSED` with R3's findings, as `inquiry` R11 answers it, and nothing is written. An unchanged leg is not asked again, so a withdrawal never refuses an unrelated revision (DEC-96 item 1: a withdrawal sends notices, it does not move work). *(not yet met: T28)*

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `normalizeType`, the finding shape.
- `membership`: `listenerRefusal` (its R81).
- `promotion`: `registerStep` (its R39).
- `inquiry-grammar`: `IMPORTED_FINDING_RE`, `parseImportedFindingRef` (its R11).

### Invariants

- **R5** No table. Nothing here regrades, composes a strength or trust score, or states the source's bar as this group's (DEC-96 item 1, DEC-92, DEC-45). *(not yet met: T28)*
- **R6** Rows C-21.4 and C-21.5 are held in this module's own `checks.mjs`. `promotion` stamps them, and a change moves `CATALOG_VERSION`. *(not yet met: T28)*
  - C-21.4 `IMPORTED_NOT_ACCEPTED`: "This finding rests on another group's finding that this group has not accepted at that edition. Accept that edition first, or take the leg out. Nothing was written."
  - C-21.5 `ACCEPTED_WORK_UNREADABLE`: "Another group's work this finding rests on could not be read, so whether it is accepted is not known. Try again. Nothing was written."
- **R7** No place is named in this module's behaviour or outward text. *(not yet met: T28)*

### Satisfies

- DEC-96 items 1 and 4, DEC-112 (6)'s last clause, read through the order (P4). N522.

### Suggestions

- Tests:
  - A leg on an accepted finding is promoted.
  - A leg on an unaccepted finding is refused C-21.4, and so is a leg naming another edition than the one accepted.
  - With nothing registered, the leg is refused C-21.5.
  - After a withdrawal, an unrelated revision of the same inquiry still promotes.
  - A second registration is refused `LISTENER_DECLARED`.
