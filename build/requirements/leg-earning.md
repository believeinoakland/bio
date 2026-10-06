# leg-earning — requirements

**Status** · DRAFT by a requirements-drafting worker for BOB #114, 2026-10-05, on `tranche/T32`, for T33 (§5.9); for BOB's review. Layer 6, directly after `accepted-work` and before `inquiry` (plan Rules (2), Choices 5). Split from `inquiry` by copy with no change of meaning (K617; plan Rule 4 and the layers.md precedent, as `link-sweep` took `monitoring` R53–R64): the earned registry and the resting-on reads. Moved (inquiry → here): R13 → R1 (with `earnedForDoc`), R14 → R2, R15 → R3, R16 → R4, R17 → R5, R11's and R29's cycle walk (`cyclePath`) → R6, R39's reading of the projects drawing on a question (`projectsDrawingOn`) → R7; `inquiry`'s job (T33-45) retires each with a pointer and re-exports the names until its importers re-point (Rules 9 (4)). New (K1447 (i), (iii); plan entry T33-44): R8, R9. Code today: `bio-plane/src/inquiry/index.mjs` (`earned`, `earnedForDoc`, `legCapped`, `earnedBasis`, `basisFor`, `restingOn`, `restsOnLive`, `cyclePath`, `projectsDrawingOn`); the job's START confirms the seam. Not yet met: every requirement (T33-44).

**Size (P6).** About 600–800 lines move (the earned registry, `store.mjs` 26364–26744 at extraction, the reads 31123–31191 and 35552–35759, now in `inquiry/index.mjs`), taking `inquiry` (3,903) well under 4,000.

## Public

### Purpose

What the record can earn for a leg of an inquiry's basis, and which questions rest on a given target: the earned registry (the connection grade, the capture ceiling and testimony a target earns, and the cap a stated grade meets), the inquiry's earned basis as a viewer may read it, the projected legs and the legs resting on a target, the one walk that finds a cycle through inquiry legs, and the projects drawing on a question. It writes no basis and grades no conclusion: those are `inquiry`'s and `strength`'s.

### Provides

Terms. A **leg**, **registry**, **grade**, **axis** and **source** are as `inquiry` defines them (its Provides, Terms). A **viewer** is the control plane's stamp, read through `membership`. Every refusal names a `reason`.

**earned(subjectEntity, targetIds, contentIds?), earnedForDoc(fm, legs), legCapped(stated, earned, targetId)**
- **R1** (was inquiry R13) `earned` answers, per target, the connection grade earned (the strongest A–C resolution of its captures to the subject, by `entities.strongestByCapture`; a D resolution earns nothing), the capture ceiling (`EARNED_CAPTURE_CEILING`, bounded by `text-chain.captureBound` over machine transcriptions, undetermined when every transcription is unmeasured), and for a member's authored observation the testimony grade D with its capture axis stated as not applicable. Each carries a `why`. With content ids it adds each row's standing (`content.standings`, `connections.portionGrades`); without, the answer is unchanged. `earnedForDoc(fm, legs)` answers `earned` for the subject the document's front matter declares (`subject_entity`, else none) over its legs' targets. *(not yet met: T33-44)*
- **R2** (was inquiry R14) `legCapped` answers null when the stated grade is within what the target earns, else the earned grade and why; an undetermined ceiling answers null grade with the reason. *(not yet met: T33-44)*

**earnedBasis({id, targets, viewer})** (`op=earnedbasis`)
- **R3** (was inquiry R15) `NO_ID`; an absent or invisible inquiry is `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`; at most 200 targets; targets and legs the viewer cannot see are left out and the answer says so; a leg on an imported finding (`inquiry-grammar` R11) is part of the inquiry's own document, so it is listed, earns nothing here (its grades are the edition's, `strength` R33) and states its null case as `IMPORTED_TARGET`, never out of view and never `INQUIRY_TARGET` (K1304); each document leg carries its content row (backfilled, at most `LEG_BACKFILL_MAX` per read, the rest `NOT_YET_RESOLVED`) and which capture it rests on: `pinned`, `only_capture`, or `undetermined` with the count held (REC-220). *(not yet met: T33-44)*

**basisFor(id, {limit?}), restingOn(targetId), restsOnLive(id), cyclePath(id, targets), projectsDrawingOn(id)**
- **R4** (was inquiry R16) `basisFor(id, {limit?})` answers the projected legs in order; with a positive integer `limit`, at most that many, the first by ord, bounded in the read, with `limit` and `truncated`; without it, the whole basis. `restingOn` answers every leg naming the target, each `confirmed` or `severed` by the citer's own record (`connections.edgeSevered`). Neither is gated; both are for in-process callers only. *(not yet met: T33-44)*
- **R5** (was inquiry R17) `restsOnLive` answers the live legs resting on an id: a divided citer is skipped, a severed one is `severed`, a case member's (the registered fact `caseMember`) is `frozen`, the rest `confirmed`. *(not yet met: T33-44)*
- **R6** (was the walk of inquiry R11's `BASIS_CYCLE` and R29) `cyclePath(id, targets)` answers whether legs from `id` to each of `targets` would close a cycle through inquiry legs of the projected basis: the whole cycle path `[id, target, …, id]` for the first that would, else null. It is the one cycle walk; `inquiry` and `basis-versions` call it. *(not yet met: T33-44)*
- **R7** (was inquiry R39's reading) `projectsDrawingOn(id)` answers the projects whose document holds a `cites` reference to `id` not marked severed (`connections.edgeSevered`), counted over every project whatever any viewer sees, at most 32, the first by id, with `truncated` when more exist; a severed citer takes no slot, so the bound never decides whether more than one project draws on it. *(not yet met: T33-44)*

**Earning for the new leg targets** (K1447)
- **R8** For a target that is a held standard (`STD-`, K1447 (iii)), `earned` answers the capture ceiling of the capture holding that standard's text at the version the leg cites (`standards`), with no connection grade and its axis stated; a standard holding no captured text at that version answers undetermined with `STANDARD_NO_TEXT`'s reason, and R2 caps any stated capture grade to it. *(not yet met: T33-44)*
- **R9** For a target that is a duty occurrence (K1447 (i)), `earned` answers its derivation as `duties.occurrencesOf` states it (the source in force, the trigger date, the due date and the level searched) and no grade of its own: the occurrence leg's grade is derived by `strength` (T33-47), and R2 answers null against it. An occurrence `duties` answers undetermined is earned as undetermined with the reason. *(not yet met: T33-44)*

**The basis table** (K1505 (2); K1601)
- **R12** `leg-earning` holds `inquiry_basis` with its columns, indexes, names, types and meanings unchanged from `inquiry` (R12, R29, R40 there), as a read contract later modules may join. Its one write, `writeBasis(bundleId, legs)`, replaces an inquiry's legs whole (`target_type` derived from the target's prefix), and R3's backfill sets a leg's `content_id`; nothing else writes it. It is declared explicitly to `record-core` (`declareTable`) with the classes it has today (purge clear, keyed by `bundle_id`; expunge none; export admin-only; sight bundle; stored). *(not yet met: T33-44)*

## Private

### Uses

- `inquiry-grammar`: the leg vocabulary and the imported-finding reference (R3).
- `accepted-work`: whether an imported finding's edition is accepted (R3).
- `record-core`: the `bundles` read contract (R3, R7).
- `membership`: `viewerPredicate`, `inSight` (R3).
- `promotion`: the fact `caseMember` (R5).
- `content`: `standings`, the citation rows (R1, R3).
- `connections`: `portionGrades`, `edgeSevered`, the `refs` read contract (R1, R4, R5, R7).
- `entities`: `strongestByCapture` (R1).
- `text-chain`: `captureBound`, `isTranscribed` (R1).
- `standards`: a standard's version and its captured text (R8).
- `duties`: `occurrencesOf` (R9).
- The projected basis `inquiry_basis`: see Suggestions (the seam).

### Invariants

- **R10** (copied from inquiry R32) Nothing here gives a leg a grade the record did not earn or a member did not author; an ungraded leg is inert and always named (DEC-18, DEC-24). *(not yet met: T33-44)*
- **R11** (copied from inquiry R33) Every read naming an inquiry or project the viewer may not see answers exactly as an absent one. *(not yet met: T33-44)*

### Satisfies

- As `inquiry` for R13–R17 and R39: `docs/architecture/BIO_Case_Making_v0_1.md` R1–R3; `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §3; `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.4 (REC-220); DEC-18, DEC-21, DEC-112 (6).
- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 LAW ("`standards` moves whole to layer 5 now", the inquiry legs) and §3 (the occurrence as a leg); BOB's K1447 (i), (iii).
- K617 (split for size, no change of meaning).

### Suggestions

- **The seam (for the START).** Every read here reads the projected basis, `inquiry_basis`, which `inquiry` (after this module) writes in its projection (inquiry R12, R29) and states as a read contract (R40) for later modules. An earlier module cannot use a later one (P4). Proposed: the table, its declaration, its read contract and its one write move here with no change of meaning, and `inquiry`'s projection calls that write; `inquiry` R12, R29, R36 and R40 are re-pointed by its job (T33-45). R3's backfill of a leg's content row is the same write.
- `inquiry` R52 (2), the leg-grade resolver for `retrieval`, is built over R1–R2 and may stay in `inquiry` calling them; it is not moved here.
- **Tests.** The moved tests move with their requirements unchanged; R8 a standard with and without captured text; R9 an undetermined occurrence.

## Open for Bob

None: a split for size changes no meaning (K617); R8–R9 are BOB's K1447. Open technical points for BOB are in the drafting report.
