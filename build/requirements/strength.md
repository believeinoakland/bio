# strength — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`, after promotion's merge; `build/extraction/strength.md` has the table): `bio-plane/src/store.mjs` 13170–13388 (the bar: `#barAxisWords`, `#projectBar`, `strengthBarSet`, `strengthBarOf`), 31558–31921 (the axes, `#weakestOf`, `#groundResult`, `#axisResult`), 31996–32453 (`#captureBoundsFor`, `#strengthWalk`, `strengthOf`, `inquiryStrength`, `#redactAxis`, `#writeStrengthProjection`), 37464–37532 (`#independenceOf`), 37732–38457 (`#refusePairComposed`, `#versionLegsAsMembers`, `versionStrength`, `partitionIndependence`), inside `#promoteProjections` 18646–18660, and the dispatch entries `strength`, `inquirystrength`, `versionstrength`, `partitionindependence`, `strengthbar`, `strengthbarof`. `bio-plane/checks/bio-checks.mjs` 2932–2945 (`STRENGTH_STATES`), 8780–9017 (C-30, C-71, `VERSION_STRENGTH_DEFAULT_STATES`, `VERSION_STRENGTH_INERT_SOURCES`), and row C-32.9. `schema.mjs`: `group_strength_bar`. `from`: `legacy-store` and `legacy-checks`; `index.mjs` keeps only routing, gates and stamps (K3). Not yet met: none (two disagreements are Open for Bob). No old-plan row is carried to `strength`.

**Size (P6).** About 2,175 lines move (about 890 without comment-only and blank lines): `store.mjs` 1,904, `bio-checks.mjs` 252, `schema.mjs` 19. Well under 4,000. It assumes the earned registry (`earnedBasisRegistry`, `op=earnedbasis`, `#capturedAt`, about 670 lines) goes to `inquiry`, the earliest module that needs it (map §5.1); here it would make about 2,850.

## Public

### Purpose

Strength is what a claim is worth, derived and never stated: a **pair** of independent measurements, the weakest capture among the documents a conclusion reaches and the weakest connection among the edges it rests on (DEC-21), with testimony beside them, never composed into one value (DEC-44). This module derives the pair over an inquiry's live basis and over one version of it (INVESTIGATIVE-SESSION §12), with DEC-32's arithmetic over grounds; says whether the grounds of a reading share an upstream origin; caches the pair for search; and holds the bar, the standard of evidence a project declares and a group's default for new projects (DEC-17, DEC-72).

### Provides

Terms. An **axis** is `capture`, `connection` or `testimony`. An axis answer is `{axis, state, grade, determined, weakest, load_bearing, population, not_load_bearing, depth_bound, detail, grounds?, undetermined_at?}`, `state` one of `graded`, `unrated`, `undetermined`. A **member** of an axis is a leg on it, or an inquiry leg's inherited answer. The **depth bound** is 6.

**strengthOf(id) → `{ok, bundleId, depth_bound, capture, connection, testimony}`** (`op=strength`, in-process)
- **R1** Each axis ranges over its own population. A leg counts on the axis its grade names; a document leg's stated capture grade is bounded by what its target earns (`inquiry.legCapped`); a testimony leg is D whatever it states; a capture or testimony grade on an inquiry leg has no referent and is named, not counted.
- **R2** An inquiry leg contributes the target inquiry's own answer on each axis, recursively, to the depth bound; past it, or where the target's axis is undetermined, the leg is `undetermined` on that axis and named with why (Case Making R3).
- **R3** An ungraded member is inert: it contributes nothing, is never floored and is always named in `not_load_bearing` (DEC-18). No graded member on an axis is `unrated`; an empty basis is `unrated` and says it rests on nothing.
- **R4** A ground is the weakest of its graded members (AND); the labelled grounds compose by the strongest (OR); unlabelled legs form one necessary part; the axis is the weaker of the necessary part and the OR part (DEC-32). The axis is `undetermined` only when a necessary part is: the unlabelled part, or every ground. The member that sets the grade is named, and so is each ground's.
- **R5** A leg whose grade source is `hunch` counts at its stated grade and is reported as such (DEC-15). *(disagrees with R9: Open for Bob 1)*

**inquiryStrength({id, viewer})** (`op=inquirystrength`)
- **R6** `NO_ID`; an absent or invisible id is `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`. Otherwise R1–R5's answer, with every bundle id the viewer may not see replaced by null in the members and by "an object you may not see" in the prose, and `out_of_view` when anything was withheld. It is computed on read, never from the cache (R13).

**versionStrength({id, version, project, states, viewer})** (`op=versionstrength`)
- **R7** Refusals in order: `VERSION_STRENGTH_NO_INQUIRY` (C-30.1), `VERSION_STRENGTH_NOT_AN_INQUIRY` (C-30.2; absent and invisible alike), `VERSION_STRENGTH_TOO_MANY_STATES` (C-30.9), `VERSION_STRENGTH_UNKNOWN_STATE` (C-30.5), `VERSION_STRENGTH_NO_VERSION` (C-30.3: no version named and the project has no CURRENT), `VERSION_STRENGTH_NO_SUCH_VERSION` (C-30.4, saying when a project's pointer outlived its reading), `VERSION_STRENGTH_STATE_EXCLUDED` (C-30.6).
- **R8** `states` defaults to `accepted` only; any other set is a what-if, and `filter` says in words which readings were counted and whether it is a what-if, beside `state_set` (DEC-40). The version named, or else the project's CURRENT, is measured, at most 500 legs, `legs_complete` saying whether all were read.
- **R9** Each leg's grade comes from the record, never the authored letter alone: a connection leg carries what `inquiry.earned` earns for it (or a member's signed testimony about the connection); a testimony leg the authored-observation grade; a capture leg its authored grade bounded by the capture ceiling. A leg with no axis, nothing earned, an undetermined ceiling or a hunch source is inert and named in `ungraded` or `hunches`; each counted leg is in `graded` with its authored letter and why.
- **R10** The answer carries `pair` with exactly the three axes, R4's arithmetic over the version's legs and grounds, and `independence` (R12). An answer carrying a single composed figure (`strength`, `grade`, `score`, `overall`, `composed`, `letter`, `rating`, `value`), a pair of other keys, no filter sentence or no state set is refused `VERSION_STRENGTH_COMPOSED` (C-30.7) or `VERSION_STRENGTH_UNFILTERED` (C-30.8) instead of being sent.

**partitionIndependence({id, version | partition, viewer})** (`op=partitionindependence`)
- **R11** Refusals: `PARTITION_INDEPENDENCE_NO_INQUIRY` (C-71.1), `…_NOT_AN_INQUIRY` (C-71.2; absent and invisible alike), `…_TWO_SUBJECTS` (C-71.8, both named), `…_NO_SUCH_VERSION` (C-71.9); for a proposed partition `…_UNREADABLE` (C-71.3: not a non-empty list, an unnamed or over-long or repeated group name, an empty group, a non-ordinal), `…_TOO_MANY_LEGS` (C-71.7, over 500), `…_UNKNOWN_LEG` (C-71.4), `…_LEG_TWICE` (C-71.5), `…_NOT_TOTAL` (C-71.6). It writes nothing and carries no strength key.
- **R12** `independence` is `{checked, parts, shared, complete, limit}`: checked only with two or more parts; for each pair of parts, the origins they share (the same document, the same capture, or the same captured address, from `provenance`), at most five named; `complete: false` when any origin list was cut at 200. The same legs give the same answer here, in R10 and in `ai-runs`' suggestion check (one implementation).

**The cache: writeProjection(bundleId, isInquiry, subjectEntity)** (a projection registered with `promotion`, its R39)
- **R13** In each inquiry's promotion, the capture and connection grade and state of R1–R5 are written for search (`retrieval`'s fields `capture:` and `connection:`), in the same transaction as the legs they summarise; they are a cache, marked so, and no read of strength answers from them.

**The bar: projectBar(projectId), strengthBarSet({group, capture, connection, author}), strengthBarOf({group, target, project, viewer})** (`op=strengthbar`, `op=strengthbarof`)
- **R14** `projectBar` reads the project's own `required_strength`: a declared axis carries its letter, an axis not declared is null and stated in words ("no bar set on the … axis"), never a default; a project declaring neither has no bar, stated as absent and not as a bar of zero (DEC-72). Nothing composes bars across projects.
- **R15** `strengthBarSet`: `MACHINE_CANNOT_DECLARE` (C-32.9); the group is the one named or the producing group, else undetermined; `BAD_GRADE`; `NO_BAR` when neither axis is given. It records the group's default with its author and time, answering that it seeds new projects and gates nothing.
- **R16** `strengthBarOf`: a `target` is refused `BAR_IS_A_PROJECT_PROPERTY`; a project the viewer may not see is `NO_SUCH_PROJECT`, one not a project `NOT_A_PROJECT`, otherwise R14; with no project, the group default or its stated absence, `seeds_new_projects: true`.

**The registration it fills** (K31's pattern, offered by `inquiry`)
- **R17** `inquiry`'s grouping act receives the pair before and after (inquiry R28), from R1–R5.

## Private

### Uses

- `legacy-checks`: the C-30, C-71 and C-32.9 rows until they move (R24), `BASIS_GRADES`, `TESTIMONY_GRADE`, `normalizeType`, `OBJECT_TYPES`, `BUNDLE_ID_RE`.
- `record-core`: `recordOf(ctx)`, the `bundles` read contract.
- `membership`: `bundleGate`, `bundleRedactor`, `viewerPredicate`. *(not declared)*
- `promotion`: `registerStep` (R13); the fact `producingGroup`. *(not declared)*
- `provenance`: the `register` and `captured_locators` read contract (R12).
- `inquiry`: `basisFor`, `earned`, `legCapped`, `subjectEntityOf`, the registration R17 fills.
- `basis-versions`: the version rows and legs, `currentOf` (R7, R8).
- `content`, `connections`, `bias`: nothing here calls them once the earned registry is `inquiry`'s (map §5.2).

### Invariants

- **R18** Strength is never stated by a member and never a single value: every answer is per axis, with the member that sets it named (DEC-21, DEC-44).
- **R19** No leg is counted above what the record earns for it, and no rendering is given Grade A on the capture axis (Case Making R2; Intake Doctrine §3).
- **R20** A what-if is exploration, never a record value, and says so in the answer (§6 rule 6, DEC-40).
- **R21** The bar is a declaration beside the strength reached, never a gate on the pair (Case Making, what a CLAIM is; DEC-17).
- **R22** Every read answers an inquiry the viewer may not see as an absent one.
- **R23** `group_strength_bar` is keyed by group, not by bundle, and is exempt from purge as an instance setting (K23); the cache columns move to a table of this module's keyed by `bundle_id`, declared to purge (K75 (3)).
- **R24** Each check moves here as an invariant with its test (K6): C-30.1–C-30.9, C-71.1–C-71.9, C-32.9.
- **R25** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Case_Making_v0_1.md` R1 (DEC-18), R2 (DEC-21), R3, division 4 (weakest link).
- `docs/development/INVESTIGATIVE-SESSION.md` §6 rules 5–6, §12 (the pair over a version, the state set, D-195's independence, the hunch).
- `docs/architecture/BIO_Declared_Bias_v0_1.md`, HUNCH DEBT (DEC-15, DEC-20, DEC-46).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §3 (testimony, a third axis).
- `docs/archive/CASE-AS-PRODUCTION.md` by way of DEC-72 (the bar is a project's property), DEC-17, DEC-32, DEC-40, DEC-44.

### Suggestions

- **Factory.** `strengthOf(ctx)` answers the one instance per Durable Object storage, reaching `inquiry`, `basis-versions` and `promotion` through theirs (K61).
- **The depth bound** is `queue`'s constant today (`QUEUE_ANCESTOR_DEPTH`); this module keeps its own, equal to it.
- **Callers.** `op=strength` stays in-process (the control plane does not route it); `publication` calls `projectBar` and freezes it into the bytes a member signs; `retrieval` reads the cache through its registration (K75 (2)).
- Tests: each C-30 and C-71 refusal gets a negative control; R10's composed-figure refusal gets an arm that adds each forbidden key.

## Open for Bob

1. **Does a hunch count toward strength?** DEC-15 permits a hunch graded above D; the live pair counts it at that grade and publication refuses a case over it until cleared (HUNCH DEBT). §12 says a leg marked as a hunch "does not count as evidence", and the pair over a version leaves it out. So one reading of one question can show two different strengths depending on which read is asked. *Recommendation:* one rule: a hunch is named and inert in every pair, as §12 says, and HUNCH DEBT still refuses publication, so nothing reads stronger than the evidence while a member's declared hunch stays visible.
2. **Who may set the group's default bar?** Any signed-in member may set or replace it today; only a machine is refused. It seeds every new project's standard of evidence. *Recommendation:* administrators only, as for organisation-wide AI keys (membership R62), with the change dated and attributed as now.
