# machinery-producers — requirements

**Status** · In force: split from `queue-producers` by copy for size (K617, K1850), meaning unchanged: R1–R5 marked "was" and retired there; R6–R10 copies of its R11, R12, R13, R24 and R36, which stay. Last changed T34 at its split (T34-95); every requirement met (MACHINERY-PRODUCERS #1, K1863).

**Size (P6).** About 1,050 lines. It takes about 840 lines from `queue-producers/index.mjs` (353–802, 1842–1939, 1943–2027, 3031–3237) and copies about 200 lines of helpers. That leaves `queue-producers` at about 3,155.

## Public

### Purpose

The feed's conditions about our own machinery: a host our governor holds, a capture left partial or finished unattended, a render held or expired, an address due a recheck or eligible for the archive fallback, a sweep that needs a member's look, and a working-on notice that needs its owners. Each is derived on read and writes nothing. Each names its subjects and home subjects for `queue-producers` to answer in `feedItems` and for `queue` to home, offer, mint and publish.

### Provides

Terms. An **item**, a **home set**, the **depth bound** and a **case** are `queue-producers`' (its Terms).

**conditionItems({member, viewer, now, homesOf, optionsOf}) → {items}** (`queue-producers`' read, its R8)
- **R1** (was `queue-producers` R8, its share) Answers every item R2–R5 derive for this member and viewer:
  - each homed through `homesOf(subjectIds)` and carrying `options` from `optionsOf(subjectIds)`, both passed in by `queue-producers` R8 (`queue` R7's walk and R12's options);
  - no item carries `disposition` or `catalogue_id`.

  It writes nothing.

**The producers**
- **R2** (was `queue-producers` R3) CONDITIONs, derived on read and writing nothing:
  - **governor-holding-host**, per held host. Its documents are gathered at most 16; past that, the home set states `subject_bound` and is undetermined.
  - **partial-capture-outstanding**, per live capture session.
  - **capture-completed-unattended**, per bundle a machine credential wrote and per completed capture request.
  - **render-deferred**, per render request held under a code or expired. Its reason is the code's own translation.
  - **archive-fallback-eligible**, per address `monitoring.archiveEligible` answers (its R47: what the next tick would find; K406 Q2).
  - **monitoring-recheck-due**, per monitored address that `monitoring({viewer})` (monitoring R32) answers overdue by more than its interval, or unscheduled (monitoring R16, R31) (N229).

 
- **R3** (was `queue-producers` R22; DEC-95 (1); K1019) Each `capture-completed-unattended` item (R2) carries, in its detail, the grade note of each capture it names. These are the same words a member present at the capture would have read (`ACQUIRE_GRADE_NOTE`, exported by `capture`, as its R76 answers them).
  - A capture is named, and held, by its `register` row under the item's bundle (`provenance` R48). At most 8 are named, the option bound (as `queue-producers` R2's).
  - For a capture request, the capture is the request's own `capture_sha`.
  - A capture the viewer may not see carries no note.

  K1105: `gradeNoteOf` is asynchronous and the read is not; reading synchronously is its answer.
- **R4** (was `queue-producers` R26; link-sweep R11, monitoring R63 before N506's split; K1036 (8)) CONDITIONs, one for each condition that `link-sweep.sweepConditions` answers the viewer:
  - the kinds are `sweep-held-backlog`, `sweep-yield-anomaly`, `sweep-seed-unreachable`, `sweep-redirect-out-of-scope` and `sweep-silent`;
  - each is keyed `CONDITION::<kind>::<bundle>#<id>`;
  - each goes to the members of the sweep's project who may see its bundle;
  - its subject is the sweep's bundle, its `age` runs from `since`, and its `detail` comes from the condition;
  - it leaves when the condition leaves.

  The items' words are the UX design stream's (NOTIFICATIONS.md item contract; `docs/development/ux-substrate/ux-experience.json` UC-035).
- **R5** (was `queue-producers` R27; `network-notices` R12, R13; DEC-111, K1031) CONDITIONs for the owners of a project with an open notice (`membership` R65):
  - `notice-attestation-missed`: a `monthly` attestation was missed for want of an instance key (`network-notices` R13). It leaves when one is issued;
  - `notice-lapse-near`: a lapse is due within 7 days. It leaves on a revision, a stop or the lapse;
  - `notice-project-closed`: the project closed while the notice was open. It leaves after 30 days, or on an owner's stop, which may add a handoff.

  Each is keyed `CONDITION::<kind>::<notice>`.

**The words members see** (DEC-107, DEC-131; H15, H19)
- **R9** (copy of `queue-producers` R24, which stays) Every member-facing sentence this module answers calls a CONDITION item a "status", never a "condition" or a "signal".
  - This covers an item's `summary` and `detail`, every sentence under it, and the words of its options.
  - "signal" leaves member text (DEC-131).
  - The internal codes, kinds and item ids are unchanged (`CONDITION`, `CONDITION::…`).

 

## Private

### Uses

- `record-grammar`: `MACHINE_AUTHOR_PREFIX` (R2).
- `record-core`: `manifestByAuthor` (its R53), `stampInstant` (R2).
- `membership`: `viewerPredicate` (the viewer gate), and the projects a member owns (its R65; R5).
- `host-governor`: `governorHolding` (its R14; R2).
- `provenance`: `register` (capture to bundle) and `captured_locators` by host (R2, R3).
- `capture`: `liveCaptureSessions` (its R46; R2); `ACQUIRE_GRADE_NOTE` (its R76; R3).
- `capture-requests`: `completed`, `rendersHeld` (its R26), `renderHoldReason` (R2).
- `actions`: `place`, `zoneOf` (the zone its R12 reads; R5's windows, R10; K1675).
- `monitoring`: `archiveEligible` (its R47), `monitoring()` (its R32) (R2).
- `link-sweep`: `sweepConditions`, `SWEEP_CONDITION_KINDS` (its R11; R4).
- `network-notices`: `noticesOf` (its R22; R5).
- `civil-time`: `localDay`, `dayRange`, `span`, `isCalendarDate` (R10).

### Invariants

- **R6** (copy of `queue-producers` R11) No answer names a bundle the viewer may not see, and no count reveals one (REC-30, DEC-36).
- **R7** (copy of `queue-producers` R12) A CONDITION earns an item only where a member's act can change it (NOTIFICATIONS, the item contract).
- **R8** (copy of `queue-producers` R13) No place is named in this module's behaviour or outward text.
- **R10** (copy of `queue-producers` R36, its R27 share; C-3b; K1444 (iii)) Every day this module derives or compares is the local day in the zone, through `civil-time` (`localDay`, `span`), never the UTC day computed in this module. This covers R5's lapse and closing windows, and an item's `age` counted in days. The zone is `actions.zoneOf(actions.place())`. With no zone held, the day and the `age` are undetermined, stated, and never computed on UTC.

### Satisfies

- `docs/architecture/BIO_Interaction_Constructs_v0_1.md`: Revision 0.2 (QUEUE: the CONDITION class); U (`undetermined` stated: `age`, the `subject_bound` home set).
- `docs/development/NOTIFICATIONS.md`: the CONDITION class, the item contract.
- DEC-36; DEC-95 (1) (R3); DEC-111 (R5); DEC-107, DEC-131 (R9); K1036 (8) (R4).

### Suggestions

- **The copy (K624 (1), K1850).** This module's job copies the following `queue-producers/index.mjs` lines into `bio-plane/src/machinery-producers/index.mjs` as `MachineryProducers`, with the factory `machineryProducersOf(ctx, deps)`:
  - 353–802, 1842–1939, 1943–2027 and 3031–3237 (seam read §2);
  - the helpers they call, which are copied and also kept in `queue-producers`:
    - `#bundleGate`, `#bundleRedactor`, `#rows`, `#one`, `#homesOf`, `#optionsOf`, `#homesAt`, `#ownedProjects`;
    - the zone helpers (`#instanceZone`, `#knownZone`, `#localDayOf`, `#dayEdge`, `#today`, `#daysBetween`, `#localAge`, `#addDays`, `ZONE_UNDETERMINED`, `DAY_MS`);
    - the bounds `QUEUE_OPTION_SUBJECTS_MAX`, `QUEUE_CONDITION_SUBJECTS_MAX`, `QUEUE_MACHINE_AUTHOR_PREFIX` and `QUEUE_UNATTENDED_PAGE`.

  Every key, kind, recipient, bound and `basis` is copied verbatim, except the word changes R9 and DEC-149 name:
  - **R9:** `basis.detail` "a signal is a fact about OUR OWN machinery" (:487, :2013) becomes "a status is …". "a sweep's signal" (:3120) and "the sweep's signal" (:3126) become "status".
  - **DEC-149** (T34-87) rows that land here: `:3197`, `:3226` and the copied `ZONE_UNDETERMINED`.

  It copies these tests into `test/m/machinery-producers/`, re-labelled with these ids and driving `conditionItems` directly, with a copy of `world.mjs`:
  - `test/m/queue-producers/conditions.test.mjs` whole;
  - `producers.test.mjs` 137–209;
  - `sweeps.test.mjs` 40–221.

  It merges right after `tasks` and before `queue-producers` in layer 11. `queue-producers`' job (T34-54) then deletes its copy and calls `conditionItems` where `#queueConditions` stood.
- **Deps.** `queue-producers` builds this module lazily with its own `deps`, so injected deps reach it. `queue`'s `PRODUCER_DEPS` is unchanged.
- **Callers' obligations** (convention 2): `queue-producers` passes `member`, `viewer`, `now`, `homesOf` and `optionsOf` as `queue` passed them.

## Open for Bob

None.
