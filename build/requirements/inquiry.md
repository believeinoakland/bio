# inquiry — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Split by N55 (K83 (2)): `cite`, `sever`, `reinstate`, the retired-target predicate and their rows are `build/requirements/citation.md`'s, next in the order; the earned registry stays here (K83 (3)). Code today (measured on `tranche/T3` @ `35ea098`, after promotion's merge, unchanged at `1c205209`; `build/extraction/inquiry.md` has the table): `bio-plane/src/store.mjs` 1872–1907 (the superseded-by index), 4314–4318 (`RELEASE_ACK_MAX`), 4552–4790 (dispose), 5198–5252 (`#restsOnLive`), 12199–13169 (`divide`, `groundInquiry`), 13389–13433 and 15566–15636 (splice helpers), inside `#promoteChecks` 17551–17671, 17844–17899, 18037–18063 and `#promoteProjections` 18154–18351, 18618–18645, 18745–18760, 22686–22745 and 23166–23214 (leg content backfill), 26364–26744 (the earned registry), 31123–31191 (cycle guard, `basisFor`, `restingOn`), 31922–31995 (`#capturedAt`), 35552–35759 (`earnedBasis`), and the dispatch entries `basis`, `restson`, `earnedbasis`, `dispose`, `inquirydivide`, `inquiryground`. `bio-plane/checks/bio-checks.mjs` 55–75, 409–434 (`STATES.inquiry`), 2330–2364, 2406–2448, 2615–2931, 3276–4177 (the leg grammar), 14177–14222 (`leadLegFindings`), and rows C-54.1, C-33.13, C-33.22, C-33.23, C-32.7, C-32.8. `schema.mjs`: `inquiry_basis`, `inquiry_exclusions`, `inquiry_migration_replays`. `from`: `legacy-store` and `legacy-checks` (K64's pattern, K83 (1)); `index.mjs` holds only these ops' routing, gates and stamps, which stay with `control-plane` (K3). Not yet met: R19 (D-592), R22 (found by this reading), R26 (found by this reading), R31 (MK-5). Old-plan rows carried to `inquiry`: MK-5; REC-202, D-572 and D-592 are re-targeted to `queue`, `ai-runs` and `promotion` (K83 (4)), R19 reading the history `promotion`'s `reopen` writes (N56). Ids renumbered by the split (old → new): R1–R28 unchanged; R29, R30, R31 → citation R1, R2 (and R3), R4; R32 → R29, R33 → R30, R34 → R31, R35 → R32, R36 → R33, R37 → R34, R38 → R35, R39 → R36, R40 → R37, R41 → R38 (its C-33.15–C-33.19, C-33.39 and C-45.7–C-45.10 → citation R11).

**Size (P6).** About 4,320 lines move (about 1,940 without comment-only and blank lines): `store.mjs` 2,748 (1,343 code), `bio-checks.mjs` 1,390 (560), `schema.mjs` 185 (37); the check rows are not counted. Still past the 4,000 mark after the split (K83 (2)): `citation` (about 1,480 lines, 680 of code) is its own module next in the order. One session reads the rest with its uses' public parts, as K74 accepted for `extraction`: well under half of it is code. It counts the earned registry here (K83 (3)).

## Public

### Purpose

An inquiry is the one recursive object of case-making: a question, which gathers evidence and other inquiries as the legs of its basis, and may reach a conclusion (`BIO_Case_Making_v0_1.md`, the collapse). This module holds the inquiry's lifecycle and its grammar, the basis legs and how each is graded, the ground partition (DEC-32), the exclusions a completeness statement names, supersession and division, and what the record can earn for a leg. It holds no version of a basis, no conclusion and no strength: those are `basis-versions`' and `strength`'s, which read what this module holds.

### Provides

Terms. An **inquiry** is a bundle of type `inquiry` (a legacy `focus` or `problem` spelling is read through `normalizeType` and judged by the vocabulary it was written under). A **leg** is one `basis[]` entry: `{target, role, grade?, grade_axis?, grade_source?, note?, date?, author?, ground?, target_edition?, extent_*? | content_id?, extent_capture?}`; roles `supports`, `cuts_against`; grades A–D; axes `capture`, `connection`, `testimony`; sources `resolution`, `testimony`, `hunch`, `inherited`, `capture`. A leg with no grade is **undetermined** and inert (DEC-18). A **registry** is the earned registry (R13). A viewer is the control plane's stamp, read through `membership` (R43, R61). Every refusal names a `reason`; one with a catalogue row carries its `check` and `translation`.

**The grammar: checkInquiryBasis(fm, findings, publishedRegistry, earnedRegistry), checkInquiryEntry(fm, findings), supersedesEdgeFindings, divisionDisclosureFindings, checkLegExtentGrammar(leg, label, checkId, findings), leadLegFindings(label, leg, findings), deriveInquiryTitle(question), inquiryQuestionOf(markdown), INQUIRY_MACHINE, BASIS_ROLES** Pure; never throw; each finding names its check.
- **R1** The machine: `open` and its alias `surfaced` go to `deferred`, `dismissed`, `concluded` or `divided`; `deferred` and `dismissed` to `open`, `surfaced` or each other; `concluded` to `open`, `surfaced`, `deferred`, `dismissed` or `divided`; `divided` is terminal; `published` is read, never entered (DEC-72). A move to the state a document is already in is not an edge.
- **R2** Entry requirements (C-2.8): `surfaced_by` is `agent` or `human`; `deferred` and `dismissed` carry a non-empty `disposition_reason`; `concluded` carries a conclusion, at least one leg, and a falsifier accounted for: stated, or its absence recorded with both `falsifier_override_by` and `_at`, never both and never half (REC-117); `subject_entity`, when present, is an entity id; a finding's bytes name no case (CASE-5b).
- **R3** `divided` requires a `division` block (a reason, `apportioned_by` a named member and not a machine, an ISO `at`, at least two distinct canonical children) and a `division_apportionment` giving every leg at least one home among those children, each child at least one leg, and each row's target equal to the leg's (C-2.8, R4 of Case Making).
- **R4** A leg's target is a canonical id of an information or inquiry bundle and appears in `references[]` (C-6.3); its role, grade, axis and source are in the vocabularies; a graded leg names its axis and source, a source with no grade is refused; a capture or testimony grade on an inquiry leg is refused (DEC-21); a `hunch` names its author and date (DEC-15); testimony is D and at no other grade. A lead (C-54.1) or a theme (`connections.themeLegFindings`, C-81.1) is refused by name before any other complaint about the leg.
- **R5** A leg's part is judged by `checkLegExtentGrammar`: `content.checkContentExtent` against a document-only context, a `content_id` of 64 lowercase hex, never both a content id and an extent.
- **R6** Earned arms: a testimony grade is refused unless the registry holds the target as a member's authored observation at that grade; an earned `resolution` or `capture` grade is refused above what the registry earns (a resolution needs a `subject_entity` and never sits on an inquiry leg; an undetermined capture ceiling refuses any capture grade); a registry that cannot be read refuses the earned leg, never passes it (C-2.8).
- **R7** An `inherited` leg rests on a published case, names an edition the published registry holds, and states no grade or one no stronger than that edition's frozen strength on its axis (C-21.2).
- **R8** Grounds (DEC-32): either every leg carries a ground label (`GROUND_LABEL_RE`) or none does; each label is declared exactly once in `grounds[]` with a named, non-machine `asserted_by` and an ISO `at`; no declared ground is empty; a `statement` is a string (C-2.8).
- **R9** `supersedesEdgeFindings`: a `supersedes` reference names a canonical target and a reason. `divisionDisclosureFindings`: a document with a `supersedes` edge names its `division_parent`, the parent has that edge, and `division_siblings` lists at least one sibling, never the parent or itself (C-6.1).
- **R10** `deriveInquiryTitle` is the question's first non-empty line, whitespace folded, cut at a word under 120 characters with an ellipsis, null when empty; `inquiryQuestionOf` answers the `## Question` section or `''`.

**Its share of a promotion** (a check and a projection registered with `promotion`, its R39; K31)
- **R11** Check, for an inquiry that is not a replay: R2–R9 over the document (`BASIS_REFUSED` with each finding, its code and translation), `content.citationRefusals` over the legs (content R27), an unknown `subject_entity` (`SUBJECT_REFUSED`, C-2.8, through `entities.has`), a supersedes target that is the bundle itself or unknown (`SUPERSESSION_REFUSED`), a child whose parent does not list it or whose siblings differ from the parent's list (`NO_SIBLING_DISCLOSURE`), a leg resting on the bundle itself (`SELF_BASIS`, C-33.22) or closing a cycle through inquiry legs (`BASIS_CYCLE`, C-33.23, naming the whole path).
- **R12** Projection, in the promotion's transaction: `inquiry_basis` re-derived whole from `basis[]` (never from a payload field); each document leg's content row is the one it names, else the row it held before at the same extent (and capture, when it names one), else `content.resolveCitation`'s, the answer listing what was named, carried or minted; `inquiry_exclusions` re-derived from `completeness_excluded[]`; the superseded-by index rewritten for every target the revision added or dropped; the subject entity and leg count recorded; a creation admitted as a migration replay records its capture and promotion key (REC-173).

**The earned registry: earned(subjectEntity, targetIds, contentIds?), earnedForDoc(fm, legs), legCapped(stated, earned, targetId), earnedBasis({id, targets, viewer})** (`op=earnedbasis`)
- **R13** `earned` answers, per target, the connection grade earned (the strongest A–C resolution of its captures to the subject, by `entities.strongestByCapture`; a D resolution earns nothing), the capture ceiling (`EARNED_CAPTURE_CEILING`, bounded by `text-chain.captureBound` over machine transcriptions, undetermined when every transcription is unmeasured), and for a member's authored observation the testimony grade D with its capture axis stated as not applicable. Each carries a `why`. With content ids it adds each row's standing (`content.standings`, `connections.portionGrades`); without, the answer is unchanged.
- **R14** `legCapped` answers null when the stated grade is within what the target earns, else the earned grade and why; an undetermined ceiling answers null grade with the reason.
- **R15** `earnedBasis`: `NO_ID`; an absent or invisible inquiry is `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`; at most 200 targets; targets and legs the viewer cannot see are left out and the answer says so; each document leg carries its content row (backfilled, at most `LEG_BACKFILL_MAX` per read, the rest `NOT_YET_RESOLVED`) and which capture it rests on: `pinned`, `only_capture`, or `undetermined` with the count held (REC-220).

**Reads: basisFor(id), restingOn(targetId), restsOnLive(id), supersededBy(id), exclusionsNaming(targetId, viewer), cyclePath(id, targets), stateHistory(id)**
- **R16** `basisFor` answers the projected legs in order; `restingOn` every leg naming the target, each `confirmed` or `severed` by the citer's own record (`connections.edgeSevered`). Neither is gated; both are for in-process callers only (Suggestions).
- **R17** `restsOnLive` answers the live legs resting on an id: a divided citer is skipped, a severed one is `severed`, a case member's (the registered fact `caseMember`) is `frozen`, the rest `confirmed`.
- **R18** `exclusionsNaming` answers the exclusions naming a target that the viewer may see, each with its inquiry, edition, description, reason, author and date.
- **R19** `stateHistory(id)` answers the inquiry's state transitions, each with who took it and when, so a reopened finding can say who reopened it. *(not yet met: D-592)*

**Acts on an inquiry**

`dispose({handle, to, reason, viewer, owner, author})` (`op=dispose`)
- **R20** Refusals in order: `BAD_TARGET_STATE`; `NOT_A_DISPOSITION` for anything but `deferred` and `dismissed`; `NO_REASON`; `BAD_REASON` (over 160 characters, or a quote, backslash or newline); the selection at weight `refuse` (`retrieval` R19–R20); `EMPTY_SELECTION`; `NOT_INQUIRIES` (C-33.13) for any member not an inquiry; `PUBLISHED_CANNOT_BE_SET_DOWN` for a case member; `ILLEGAL_TRANSITION` by R1; `CITED` for a dismissal while `restsOnLive` holds any leg. Each refusal names every offender and moves nothing.
- **R21** Each member gains a state-history entry (timestamp, from, to, the reason, author), `prior_state`, `current_state`, `disposition_reason` and a Session Log entry. A deferral answers the re-evaluation it raised (registered by `reevaluation`).
- **R22** The whole set moves or none of it does. *(not yet met: members are promoted one at a time, and a refusal after the first leaves earlier members moved, answered as `disposedSoFar`; found by this reading)*

`divide({target, reason, children, viewer, author})` (`op=inquirydivide`)
- **R23** Refusals in order: `MACHINE_CANNOT_DIVIDE` (C-32.7, an empty or machine author); `NO_REASON`, `BAD_REASON` (500); `NO_TARGET`; `NO_SUCH_BUNDLE` (absent or invisible, one answer); `NOT_AN_INQUIRY`; `NO_DOCUMENT`; `PUBLISHED_CANNOT_DIVIDE`; `ILLEGAL_TRANSITION`; `CITED` while a confirmed live leg rests on it; `TOO_FEW_CHILDREN` (under two); `BAD_CHILD_ID` (not a canonical inquiry id, repeated, or the parent); `CHILD_EXISTS`; `NO_CHILD_QUESTION`, `BAD_CHILD_QUESTION`; `NO_APPORTIONMENT` (no legs, a child given none, or an orphan leg, counting orphans that cut against); `BAD_APPORTIONMENT` (an ordinal outside the basis); the producing group undetermined; `CHILD_REFUSED` when a child's document fails R2–R9.
- **R24** The parent moves to `divided` with its reason, apportioner, date, children and where every leg went, including every leg that cuts against (Case Making R4). Each child is created `open`, titled from its question (R10), carrying the legs apportioned to it verbatim, a `supersedes` edge to the parent with the reason, `cites` edges to its legs' targets, `division_parent` and every sibling, and no conclusion or disposition.
- **R25** The answer lists the children, the apportionment, the count of legs that cut against, and the re-evaluation raised (`reevaluation`).
- **R26** The parent and every child land together or none does. *(not yet met: the parent is promoted first and a child refused after it is answered with the children written so far; found by this reading)*

`ground({target, grounds, reason, viewer, author})` (`op=inquiryground`)
- **R27** Refusals in order: `MACHINE_CANNOT_GROUND` (C-32.8); `NO_TARGET`; `NO_PARTITION`; `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`; `PUBLISHED_CANNOT_RESTRUCTURE`; `DIVIDED_CANNOT_RESTRUCTURE`; `NO_DOCUMENT`; `NO_BASIS` (C-33.40) for no legs; `UNSPLICEABLE_BASIS`; `NO_REASON` when the document already carries any partition (a restructure, decided from the record, never a parameter); `BAD_REASON`; `BAD_PARTITION` (not an array, a row not an object, legs not an array of ordinals in range, an ordinal in two groups); `BAD_STATEMENT` (160); `PARTITION_UNCHANGED`; `BASIS_REFUSED` when the candidate fails R4–R8.
- **R28** A group whose legs and statement are unchanged keeps its `asserted_by` and `at`; any other is stamped with this member and now; a caller's `asserted_by` or `at` is never read. Removing the partition is a restructure. The state does not move; the Session Log records the partition, the reason and the strength pair before the act; the answer carries the pair before and after (registered by `strength`, its R17).

## Private

### Uses

- `legacy-checks`: the C-2, C-6.1, C-21.2 and C-33 rows until they move (R38), `normalizeType`, `OBJECT_TYPES`, `parseFrontmatter`, `isMachineIdentity`, `BASIS_GRADES`, `EARNED_CAPTURE_CEILING`, `TESTIMONY_GRADE`, `createSha256`.
- `record-core`: `recordOf(ctx)`, `declarePurge`, the `bundles` read contract (R37).
- `membership`: `viewerPredicate`, `bundleGate` (R43, R61). (`inSight`, `existenceAct` and `projectAuthority` were cite's and sever's, now `citation`'s.)
- `promotion`: `promote`, `registerStep`; the facts `caseMember`, `publishedRegistry` and `producingGroup` read through its `fact(name)` (K83 (5), N56).
- `content`: `citationRefusals`, `resolveCitation`, `captureFor`, `checkContentExtent`, `citationExtent`, `citationContentId`, `standings`.
- `connections`: `themeLegFindings` (R46), `citesInto`, `edgeSevered` (R22), `portionGrades` (R13), the `refs` edges (R19).
- `retrieval`: `selectionResolve` (R19–R20).
- `entities`: `has` (R7), `strongestByCapture` (R16).
- `provenance`: the `register` read contract (R48).
- `extraction`: the `readings` and `reading_text_source` read contract.
- `text-chain`: `captureBound`, `isTranscribed`.
- `observation-log`: `LEAD_ID_RE` for C-54.1.

### Invariants

- **R29** The basis is a directed acyclic graph at every write (Case Making R3); `inquiry_basis` is a projection of the document and never written otherwise (D-21).
- **R30** A machine credential authors no division, no grouping and no leg role; it may surface a question (`ai-runs`).
- **R31** A leg naming an opinion case element is refused by name: an opinion is a view about evidence, never a leg (MEMBER-KNOWLEDGE §6). *(not yet met: MK-5)*
- **R32** An ungraded leg is inert and always named; nothing here gives a leg a grade the record did not earn or a member did not author (DEC-18, DEC-24).
- **R33** Every act and read naming an inquiry or project the viewer may not see answers exactly as an absent one.
- **R34** A leg that cuts against travels every path a supporting leg does: apportionment, projection, grounds (Invariant 7).
- **R35** A published case member cannot be divided, re-grouped or set down; the route is reopen (DEC-12, DEC-72).
- **R36** `inquiry_basis`, `inquiry_exclusions` and `inquiry_migration_replays` carry `bundle_id` and are declared to record-core's purge (K23); the columns this module writes on `bundles` today (`inquiry_basis_count`, `inquiry_subject_entity`, `inquiry_superseded_by`) move to a table of its own keyed by `bundle_id` (K75 (3)).
- **R37** No place is named in this module's behaviour or outward text.
- **R38** Each check moves here as an invariant with its test (K6): C-2.8 and C-21.2 as the grammar uses them, C-6.1's supersession and division arms, C-6.3, C-54.1, C-33.13, C-33.22, C-33.23, C-32.7, C-32.8 (cite's rows are `citation`'s, its R11).

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 8.
- `docs/architecture/BIO_Case_Making_v0_1.md`: the collapse, naming (DEC-72 amendment), division 1–5, R1 (DEC-18), R2 (DEC-21), R3, R4.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 and its amendments (`published` leaves the machine; `concluded`), §3.4 state history, §5.1.
- `docs/development/INVESTIGATIVE-SESSION.md` §8 (the question), §11 item 5 (migration replay).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §3 (testimony grade), §5 (a lead is not evidence), §6.
- `docs/architecture/BIO_Declared_Bias_v0_1.md`, "a HUNCH is temporary declared bias" (DEC-15).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.4 (the leg and its part; REC-220's pin).
- DEC-12, DEC-18, DEC-21, DEC-28, DEC-29, DEC-30, DEC-32, DEC-72.

### Suggestions

- **Factory.** `inquiryOf(ctx)` answers the one instance per Durable Object storage, reaching `record-core`, `membership`, `promotion`, `content`, `connections`, `retrieval` and `entities` through theirs (K61). The op handlers move here (K3).
- **Registrations it offers (K31's pattern).** `onGrounded` for `strength`'s pair (R28) and `onRaised` for `reevaluation`'s obligation (R21, R25); `legacy-store` registers both until those modules are extracted. With none registered the act answers without the field and says so.
- **What `citation` reaches (next in the order).** `earned` (R13) to fill a leg's grade, `checkLegExtentGrammar` (R5) to judge a named part before the write, `BASIS_ROLES` (R4) for the role; the legs it writes are judged and projected by R11 and R12 like any other. `EDGE_REASON_MAX` (160) is held by both, each its own copy (K57).
- **Callers' obligations.** `op=basis` and `op=restson` stay in-process: the control plane routes neither (R16). `DISPOSITIONS` is written here as a copy; `affordances` re-exports it (K78 (3)).
- Tests: every refusal gets a negative control; R12's carry-forward and R28's carry rule get over-strictness arms (a re-promotion keeps each leg's content row and each unchanged group's stamp byte for byte).

## Open for Bob

1. **Is deferring or dismissing a question several projects draw on one team's act?** You ruled that one team's decision never silently moves another team's stance, and concluding became the project's act (INVESTIGATIVE-SESSION §7, §7.1). `op=dispose` still moves the shared question's own state: a member of any project that can see it can defer or dismiss it for everyone (R20), and dividing and re-grouping move the shared question too. *Recommendation:* when more than one project draws on the question, a disposition is taken per project (the project-scoped set-aside that already exists); the shared state moves only for a question no project, or one project, draws on. Dividing and re-grouping stay shared acts, because they change what the question is.
