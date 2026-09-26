# citation — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18, N55, K83), split from inquiry's draft; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `1c205209`, `store.mjs` unchanged since `35ea098`; `build/extraction/citation.md` has the table): `bio-plane/src/store.mjs` 3354–3370 (`CITE_EDGE_BYTES`, `CITE_PIN_BYTES`, `CITE_LOG_SAMPLE`), 4288–4313, 4319 and 4327–4551 (the severing header, `EDGE_REASON_MAX`, `EDGE_NOTE_MAX`, `#edgeTransition`, `sever`, `reinstate`), 5268–5301 (`#retiredNotCitable`), 13434–14300 (`#spliceEdgeStatus`, `cite`), 15753–15902 (`#spliceReferences`, `#legExtentLines`, `#spliceBasis`), and the dispatch entries `cite`, `sever`, `reinstate` (49473–49530). `bio-plane/checks/bio-checks.mjs`: rows C-33.15–C-33.19 and C-33.39 (in `ACT_SHAPE_CHECKS`, 9675–9722) and C-45.7–C-45.10 (in `CONTENT_EXTENT_CHECKS`, 12272–12329). No table: every citation is written into the citing document, and its projections (`refs`, `inquiry_basis`) are `connections`' and `inquiry`'s. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, classes and stamps, which stay with `control-plane` (K3). Not yet met: none known. Old-plan rows carried here: none. Ids from inquiry's draft (old → new): R29 → R1; R30 → R2 (its answer and Session Log sentence → R3); R31 → R4; R32's second clause → R6; R35 → R8 (as cite applies it); R36 → R9 (its project arm); R40 → R10 (copied); R41's C-33.15–C-33.19, C-33.39 and C-45.7–C-45.10 → R11. R3, R5 and R7 are new: R3 states what `cite` answers and records, R5 the retired-target predicate later modules reach (it was listed under inquiry's R29), R7 the fixed weights.

**Size (P6).** About 1,480 lines move (about 680 without comment-only and blank lines): `store.mjs` 1,378 (603 code), `bio-checks.mjs` 106 (78). Well under 4,000. That counts three pieces inquiry's measure left out: the three `CITE_*` constants, `#retiredNotCitable` (counted under inquiry's R17 range) and the check rows.

## Public

### Purpose

Citing is one act in the record's own terms, "this is why I think that": material, or a question, becomes part of what a case or a question rests on. On a case (a `project`) a citation is a `cites` edge in the case's `references[]`; on a question (an `inquiry`) it is a leg of the question's `basis[]`, with the target in its references too. This module holds that act, its withdrawal and restoration on a case (sever, reinstate: status changes, never deletions), and the one rule of what may be cited now: nothing the group has retired. It judges nothing about a leg's grammar, its grade or the basis graph: it composes legs, and `inquiry` judges them at the write, as it judges every other leg.

### Provides

Terms. The **citing object** is the bundle a citation is written into, named by the parameter `project` whether it is a case or a question (legacy `focus` and `problem` spellings are read through `normalizeType` as a question). A **selection** is `retrieval`'s (its R19–R20), named by `handle`. An **edge** is a `references[]` entry `{rel: "cites", target, status, note, extent_capture?}` with status `proposed`, `confirmed` or `severed`. A **leg** and its **role** are `inquiry`'s terms (its `BASIS_ROLES`: `supports`, `cuts_against`). A **part** is a leg's extent fields (`extent_*`) or `content_id`, in `content`'s extent grammar. A viewer and an identity are the control plane's stamps, read through `membership`. Every refusal names a `reason`; one with a catalogue row carries its `check` and `translation`, and one about members names every offender (`offenders`, sorted) and never narrows the call to the rest.

**cite({project, handle, viewer, owner, note, author, role, extent, identity})** (`op=cite`)
- **R1** Refusals in order: the selection at weight `report` (`retrieval` R19); an absent or invisible citing object is `NO_SUCH_PROJECT` (after `membership`'s existence answer); `NOT_A_PROJECT` for one neither a project nor an inquiry; a project needs the actor joined (`membership.projectAuthority`); `BAD_NOTE` (C-33.15: over 200 characters, or a quote, backslash or newline); on an inquiry `NO_ROLE` (C-33.16) and `BAD_ROLE` (C-33.17), each carrying the role vocabulary, on a project `ROLE_NOT_APPLICABLE` (C-33.18); `NOT_CITABLE` (inquiry) or `NOT_INFORMATION` (project) when any member is neither information nor an inquiry, with `citable`; `RETIRED_NOT_CITABLE` (C-33.39, by R5); an unreadable citing document `NO_BUNDLE_MD` or `UNPARSEABLE_FRONTMATTER`; `SEVERED_EDGE` (C-33.19) for a member the citing object holds a `severed` edge to; the part: an unknown field `UNKNOWN_EXTENT_FIELD` (C-45.7, listing the fields taken), a part on a project `EXTENT_NOT_APPLICABLE` (C-45.8), a part with more than one new member `EXTENT_ON_MANY` (C-45.9), an unwritable value `BAD_EXTENT_VALUE` (C-45.10: over 200 characters, or a quote, backslash, newline or `#`), then the part judged by `inquiry.checkLegExtentGrammar` (`BASIS_REFUSED`, with each finding); `EMPTY_SELECTION`; a document block that cannot be extended in place `UNSPLICEABLE_REFERENCES` or `UNSPLICEABLE_BASIS`; past 1 MiB `CITATION_TOO_LARGE` with how many would fit. A refusal from the write (`inquiry` R11: `BASIS_REFUSED`, `SELF_BASIS`, `BASIS_CYCLE`) is answered unchanged, with the handle and drift.
- **R2** On an inquiry each new member becomes a leg with the member's role; its connection grade is filled from `inquiry.earned` (its R13) when earned (A–C, axis `connection`, source `resolution`), else it carries none; a document leg naming no content row is pinned to `content.captureFor`'s capture (REC-220); its target joins `references[]` unless already there under any relation. On a project each becomes a `confirmed` `cites` edge, a document's pinned to its capture (REC-219). The note is written on each. A member is already cited when the inquiry already holds a leg on it, or the project already holds an edge to it: such members are reported, not rewritten; with nothing new the answer is `ok`, `cited` empty, nothing is written, and when a part was named it says the part was written nowhere.
- **R3** Anything written moves `last_updated` and appends one Session Log entry naming the author, the selection, at most 20 ids and a count of the rest, the note, whether the set had moved since it was made, and on an inquiry the role and how many legs were graded and how many left undetermined. The answer carries `cited`, `alreadyCited`, `drift`, `moved`, `bundleSha`, `rowVersion`, the gate and its expiry; on a project `pinned_captures` (each target's pin or null); on an inquiry `citingObjectType`, `role`, `gradesFilled`, `gradesUndetermined` and per leg its target, role, grade, axis, source, `why`, `pinned_capture` and, when a part was named, its extent (and content id) as written.

**sever({project, handle, viewer, owner, reason, author, identity}), reinstate({…same})** (`op=sever`, `op=reinstate`)
- **R4** Both act on a project's `cites` edges at weight `refuse` (`retrieval` R20). Refusals in order: the selection; `NO_SUCH_PROJECT` as R1; `NOT_A_PROJECT` (an inquiry included); the actor joined; `NO_REASON`, `BAD_REASON` (over 160 characters, or a quote, backslash or newline); `EMPTY_SELECTION`; `NOT_INFORMATION` for a member neither information nor an inquiry; reinstating a member R5 answers true `RETIRED_NOT_CITABLE` (C-33.39); `NO_BUNDLE_MD`, `UNPARSEABLE_FRONTMATTER`; every member's edge must be in the source state, `confirmed` or `proposed` to sever and `severed` to reinstate (`NOT_CITED`, `NOT_SEVERED`), whole call; `UNSPLICEABLE_REFERENCES`; `CITATION_TOO_LARGE`. The edge's target and relation stay; only its status moves, and the reason is appended to its note with the act and time (at most 480 characters, oldest dropped). One Session Log entry records the act, count, ids (as R3) and reason. The answer carries `severed` or `reinstated` (the ids), the reason as `why` (never `reason`), `from`, `to`, `drift`, `moved`, `bundleSha`, `rowVersion` and the gate.

**retiredNotCitable(id) → boolean**
- **R5** True exactly when the bundle's current state is `retired`, whatever its type; an id with no row is false. Never viewer-gated; never throws. It is the one predicate for "may this be cited now": R1, R4, and the later modules that offer or suggest a citation (`affordances`' reinstatable count, `run-productions`' suggestion check) ask it.

## Private

### Uses

- `legacy-checks`: rows C-33.15–C-33.19, C-33.39 and C-45.7–C-45.10 until they move (R11), `normalizeType`, `OBJECT_TYPES`, `parseFrontmatter`, `createSha256`.
- `record-core`: `recordOf(ctx)`, the `bundles` read contract and a bundle's live files (R37, R41–R43).
- `membership`: the existence answer and sight (`existenceAct`, `inSight`; R44, R61), the one no-such-project answer, `projectAuthority` (R55).
- `promotion`: `promote`, `INLINE_MAX`.
- `content`: `captureFor`, `citationExtent` (`legExtent` today, R5).
- `retrieval`: `selectionResolve` and the answer-changed rule (R19–R20).
- `inquiry`: `earned` (R13), `checkLegExtentGrammar` (R5), `BASIS_ROLES` (R4's vocabulary); its check and projection (R11, R12) judge and project every leg this module writes.

### Invariants

- **R6** A citation exists only in the citing document's bytes: this module writes no `refs` row and no `inquiry_basis` row, and promote re-derives both from the document (D-21).
- **R7** Weight is not a parameter: `cite` is `report`, `sever` and `reinstate` are `refuse`, whatever the caller sends.
- **R8** No leg is given a grade the record did not earn, and no role is assumed: an unearned leg is written with no grade, axis or source (inert and stated, DEC-18); a role is the member's, never a default (Invariant 7).
- **R9** Every act naming a project the viewer may not see answers exactly as an absent one.
- **R10** No place is named in this module's behaviour or outward text.
- **R11** Each check moves here as an invariant with its test (K6): C-33.15–C-33.19, C-33.39, C-45.7–C-45.10, each row's `where` re-pointed to this module's regions.

### Satisfies

- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is not citable), §5.1 (sever with reason; a human confirms or severs), §5.2 (citations live on the citing object).
- `docs/architecture/BIO_Case_Making_v0_1.md`: the collapse, R1 (DEC-18), R2 (DEC-21), Invariant 7.
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.4 (the leg and its part), §18.1 (the pin, REC-219, REC-220).
- `docs/development/INVESTIGATIVE-SESSION.md` §7 (the inquiry stays shared; work inside a project is its participants').
- DEC-8, DEC-18, DEC-19, DEC-21, DEC-23.

### Suggestions

- **Factory.** `citationOf(ctx)` answers the one instance per Durable Object storage, reaching `record-core`, `membership`, `promotion`, `content`, `retrieval` and `inquiry` through theirs (K61). The op handlers move here (K3).
- **Shared helpers are copied** (K57): the frontmatter scalar setter and the Session Log splice; `EDGE_REASON_MAX` (160) is also `inquiry`'s for `dispose` and a ground's statement, so each holds its copy.
- Tests: every refusal gets a negative control; R2 gets an over-strictness arm (a cite naming no part is byte-identical to the document without the extent code), R4 one that a reinstate of a non-retired target passes, and R5 one per type that carries a `retired` state.
