# strength — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`, after promotion's merge; `build/extraction/strength.md` has the table): `bio-plane/src/store.mjs` 13170–13388 (the bar: `#barAxisWords`, `#projectBar`, `strengthBarSet`, `strengthBarOf`), 31558–31921 (the axes, `#weakestOf`, `#groundResult`, `#axisResult`), 31996–32453 (`#captureBoundsFor`, `#strengthWalk`, `strengthOf`, `inquiryStrength`, `#redactAxis`, `#writeStrengthProjection`), 37464–37532 (`#independenceOf`), 37732–38457 (`#refusePairComposed`, `#versionLegsAsMembers`, `versionStrength`, `partitionIndependence`), inside `#promoteProjections` 18646–18660, and the dispatch entries `strength`, `inquirystrength`, `versionstrength`, `partitionindependence`, `strengthbar`, `strengthbarof`. `bio-plane/checks/bio-checks.mjs` 2932–2945 (`STRENGTH_STATES`), 8780–9017 (C-30, C-71, `VERSION_STRENGTH_DEFAULT_STATES`, `VERSION_STRENGTH_INERT_SOURCES`), and row C-32.9. `schema.mjs`: `group_strength_bar`. `from`: `legacy-store` and `legacy-checks`; `index.mjs` keeps only routing, gates and stamps (K3). Not yet met: R26–R27 (N60, K86: the candidate pair run-productions reads; `store.mjs` `#strengthWalk` with `legsOverride`, `#independenceOf`), R5 and R15 (K102). No old-plan row is carried to `strength`. DEC-102 folded by a worker for BOB #90 on `tranche/T22`, 2026-10-01, as Bob ruled it (K1019): R29 (testimony at the group or project level counts as an anonymous tip, only beside an independent corroborating leg; cover and name keep today's grade) and R30 (the corroboration read `ratification` R35 asks); not yet met (T22 layer 6). DEC-88's reason, by a worker for BOB #90 on `tranche/T22`, 2026-10-01 (`build/plan/t22-dec88-audit.md`; K1025): R15, the bar's reason (`BAR_NO_REASON`, C-107.3); not yet met (T22). BOB's shares of DEC-104 and DEC-105, by a worker for BOB #90 on `tranche/T22`, 2026-10-02 (K1038): R5's count of the hunch legs an answer left out (H10) and R15's honest note (H12); not yet met (T22 layer 6). Folded by a worker for BOB #104 at T28's opening, 2026-10-03, from `plan/draft-T28-dec112.md` (N519, N520's DEC-112 share; K1268, K1275, K1277) and `plan/draft-T28-n522.md` (N522; K1273): R31 (the grading method's version and its plain words), R32 (`recomputePair`), R33 (a leg on another group's accepted work, N522) and R34 (an off-the-record capture attested at `group` or `project`, N523); Uses gain `accepted-work`; not yet met (T28). AMENDED by a fold worker for BOB #106 on `prep/T29-folds`, 2026-10-03, entry N529, ruling K1333 (`case-authoring`'s disclosures moved to `case-disclosures`): hunch debt's reference re-pointed to `case-disclosures` R16; wording only, no meaning changed.

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
- **R5** A leg whose grade source is `hunch` is inert in every pair, whatever grade it states: it contributes nothing, as R3's ungraded member, and is always named as a hunch (INVESTIGATIVE-SESSION §12; DEC-15), so the live pair and the pair over a version (R9) agree. HUNCH DEBT still refuses publication (`case-disclosures` R16). Every strength answer (`strengthOf`, `inquiryStrength`, `versionStrength`, `candidatePair` and the pair R17 registers) states how many hunch legs it left out, zero when none; a hunch the viewer may not see is withheld as R6 says and not counted. (DEC-104; H10; K1038)

**inquiryStrength({id, viewer})** (`op=inquirystrength`)
- **R6** `NO_ID`; an absent or invisible id is `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`. Otherwise R1–R5's answer, with every member the viewer may not see withheld whole, in the members and the prose alike (no id, no title, no state, no placeholder and no count), and `out_of_view: true` stating only that something was withheld (DEC-36). It is computed on read, never from the cache (R13).

**versionStrength({id, version, project, states, viewer})** (`op=versionstrength`)
- **R7** Refusals in order: `VERSION_STRENGTH_NO_INQUIRY` (C-30.1), `VERSION_STRENGTH_NOT_AN_INQUIRY` (C-30.2; absent and invisible alike), `VERSION_STRENGTH_TOO_MANY_STATES` (C-30.9), `VERSION_STRENGTH_UNKNOWN_STATE` (C-30.5), `VERSION_STRENGTH_NO_VERSION` (C-30.3: no version named and the project has no CURRENT), `VERSION_STRENGTH_NO_SUCH_VERSION` (C-30.4, saying when a project's pointer outlived its reading), `VERSION_STRENGTH_STATE_EXCLUDED` (C-30.6).
- **R8** `states` defaults to `accepted` only; any other set is a what-if, and `filter` says in words which readings were counted and whether it is a what-if, beside `state_set` (DEC-40). The version named, or else the project's CURRENT, is measured, at most 500 legs, `legs_complete` saying whether all were read.
- **R9** Each leg's grade comes from the record, never the authored letter alone: a connection leg carries what `inquiry.earned` earns for it (or a member's signed testimony about the connection); a testimony leg the authored-observation grade; a capture leg its authored grade bounded by the capture ceiling. A leg with no axis, nothing earned, an undetermined ceiling or a hunch source is inert and named in `ungraded` or `hunches`; each counted leg is in `graded` with its authored letter and why.
- **R10** The answer carries `pair` with exactly the three axes, R4's arithmetic over the version's legs and grounds, and `independence` (R12). An answer carrying a single composed figure (`strength`, `grade`, `score`, `overall`, `composed`, `letter`, `rating`, `value`), a pair of other keys, no filter sentence or no state set is refused `VERSION_STRENGTH_COMPOSED` (C-30.7) or `VERSION_STRENGTH_UNFILTERED` (C-30.8) instead of being sent.

**partitionIndependence({id, version | partition, viewer})** (`op=partitionindependence`)
- **R11** Refusals: `PARTITION_INDEPENDENCE_NO_INQUIRY` (C-71.1), `…_NOT_AN_INQUIRY` (C-71.2; absent and invisible alike), `…_TWO_SUBJECTS` (C-71.8, both named), `…_NO_SUCH_VERSION` (C-71.9); for a proposed partition `…_UNREADABLE` (C-71.3: not a non-empty list, an unnamed or over-long or repeated group name, an empty group, a non-ordinal), `…_TOO_MANY_LEGS` (C-71.7, over 500), `…_UNKNOWN_LEG` (C-71.4), `…_LEG_TWICE` (C-71.5), `…_NOT_TOTAL` (C-71.6). It writes nothing and carries no strength key.
- **R12** `independence` is `{checked, parts, shared, complete, limit}`: checked only with two or more parts; for each pair of parts, the origins they share (the same document, the same capture, or the same captured address, from `provenance`), at most five named; `complete: false` when any origin list was cut at 200. The same legs give the same answer here, in R10 and in R27 (one implementation).

**candidatePair({inquiry, legs}) → `{pair, error}`; candidateIndependence({legs, parts}) → independence** (N60, K86; for `run-productions`' suggestion check, in-process)
- **R26** `candidatePair` answers R1–R5's three axes over `legs` given in place of the inquiry's live basis (each `{target, role, grade, grade_axis, grade_source, ground}`), walking inquiry legs to the depth bound exactly as `strengthOf` does; it writes nothing. A leg whose target cannot be read makes that axis `undetermined`, never an error; a failure of the arithmetic itself is answered as `{pair: null, error}` (the message, at most 200 characters), never thrown.
- **R27** `candidateIndependence` answers R12's `independence` over `legs` grouped by their `ground` into `parts` declared parts, with the same origin limit (200) and the same `complete: false` when it is reached.

**Testimony credited anonymously** (DEC-102; K1019)
- **R29** `strengthOf`, `versionStrength` and `candidatePair` take an optional `levels`, a map from an observation id to the credit level in force for it (`group`, `project`, `cover` or `name`). A testimony leg on an observation stated at `group` or `project` counts as an anonymous tip: it is counted on the testimony axis, at the testimony grade (R1, R9), only when an independent corroborating leg stands beside it in the same basis (R30); otherwise it is inert, as R3's ungraded member, and named as uncorroborated anonymous testimony. A leg stated at `cover` or `name`, and every leg when `levels` is absent or does not name its observation, is graded as R1 and R9 say, today's grade. The answer states which levels it was given, and never names an observation's author. (DEC-102 items 1, 2; K1019)

**testimonyCorroboration({inquiry, version?, levels, viewer}) → `{legs}` or refusal** (in-process; for `ratification` R35)
- **R30** For each testimony leg of the inquiry's live basis, or of the named version, whose observation `levels` states at `group` or `project`, answers `corroborated` with the corroborating legs, or `uncorroborated`. A corroborating leg is a counted leg of the same basis on a document (not an observation and not an inquiry), or a testimony leg on an observation stated at `cover` or `name` that another member authored (the register's author, read and never answered), in either case sharing no origin with it (R12's same document, same capture or same captured address). Refusals as R6 (`NO_ID`, `NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`) and, for a named version, R7's `VERSION_STRENGTH_NO_SUCH_VERSION`. A leg the viewer may not see is withheld as R6 withholds it and never corroborates. Writes nothing; never names an author. (DEC-102 items 1, 2; K1019)

**The grading method and its recomputation: GRADING_METHOD_VERSION, gradingMethodText(version), recomputePair({legs, levels?, version})** (DEC-112; K1268)
- **R31** `GRADING_METHOD_VERSION` names the grading arithmetic of R1–R5, R29 and R30, and changes whenever any of them changes. `gradingMethodText(version)` answers that version's method in plain words, complete enough to recompute a grade by hand. An unknown version answers null. Pure; never throws. (DEC-112 (2)(3))
- **R32** `recomputePair({legs, levels?, version})` answers the pair (R1–R5, R29, R30) from the facts a case file states for one finding, and reads nothing else. Each leg gives its target's recorded grade or answer, its axis, its grade source and its ground. It answers for every version this module has published. Any other version is `UNKNOWN_METHOD_VERSION`. Pure; writes nothing; never throws. (DEC-112 (3)(6); Publication §5C "each grade recomputes the same by the stated method version")
- **R35** (K1305) `gradingFacts({inquiry, version?, levels, viewer})` (in-process) answers, for one finding, the legs exactly as R32 reads them: per leg `{target, kind (document | observation | inquiry | imported), role, grade, grade_axis, grade_source, ground, target_edition?, answer?, origins, origins_complete, captures, author_key?}`, `author_key` an opaque token equal for the same member within one case and never an account. A case file states what this answers, so `recomputePair` over it answers the pair `strengthOf` answers. Writes nothing.

**A leg on another group's accepted work** (DEC-96 item 1; N522)
- **R33** A leg on an imported finding reference contributes, on each axis, the grade that the accepted edition publishes for that finding (`accepted-work.acceptedFinding`'s `pair`). It is read as an inquiry leg's target answer (R2), with no recursion past it, and is never stronger than that edition's frozen grade (DEC-96 item 1, the inherited-trust rule).
  - The member is named as another group's, with its group, case and edition (DEC-92). The words are the UX stream's.
  - When the read answers absent, unreadable or null, the leg is `undetermined` on every axis and named with why.
  - An acceptance withdrawn since the leg was written changes nothing here. Nothing regrades (DEC-96 item 1); the notice is `reevaluation` R31's.
  - It holds for `strengthOf`, `versionStrength`, `candidatePair` and R32's `recomputePair`. For `recomputePair`, the case file's `accepted_work:` row (`case-grammar` R16) gives the pair.

  (DEC-96 item 1; DEC-112 (6); K1273)

**Evidence from an off-the-record source, attested anonymously** (DEC-119 (3); N523)
- **R34** `levels` (R29) may also name a capture by its SHA-256, giving the level in force for the member attesting that off-the-record capture (`publication` R60). A leg on a document whose capture `levels` states at `group` or `project` is treated as R29 treats a testimony leg at those levels: it counts, at its own grade, only when an independent corroborating leg stands beside it in the same basis, and is otherwise inert and named as uncorroborated anonymous evidence. R30 answers it `corroborated`, with the corroborating legs, or `uncorroborated`, by R30's rule: a corroborating leg shares no origin with it (R12). A leg on that capture at `cover` or `name`, or not named in `levels`, keeps today's grade (`provenance` R51: a doorbell capture's letter is the member's, stated as authored). No answer names the member. (DEC-119 (2)(3); DEC-102 item 1; K1275, K1277)

**The cache: writeProjection(bundleId, isInquiry)** (a projection registered with `promotion`, its R39)
- **R13** In each inquiry's promotion, the capture and connection grade and state of R1–R5 are written for search (`retrieval`'s fields `capture:` and `connection:`), in the same transaction as the legs they summarise; they are a cache, marked so, and no read of strength answers from them.

**The bar: projectBar(projectId), strengthBarSet({group, capture, connection, reason, author}), strengthBarOf({group, target, project, viewer})** (`op=strengthbar`, `op=strengthbarof`)
- **R14** `projectBar` reads the project's own `required_strength`: a declared axis carries its letter, an axis not declared is null and stated in words ("no bar set on the … axis"), never a default; a project declaring neither has no bar, stated as absent and not as a bar of zero (DEC-72). Nothing composes bars across projects.
- **R15** `strengthBarSet`: `MACHINE_CANNOT_DECLARE` (C-32.9); an author who is not an active administrator (the founder included) is refused by a new code, as an organisation-wide AI key is (membership R62); the group is the one named or the producing group, else undetermined; `BAD_GRADE` (a code of strength's own, not intent's `CONDITION_BAD_GRADE`, with its own row in C-107, K275); `NO_BAR` when neither axis is given; then `BAR_NO_REASON` (its own row in C-107, C-107.3, stamped by 1.53.0: the `reason`, the administrator's words on why the group sets this bar, absent, not a string, blank or over 2,000 characters). It records the group's default with its author, time and reason, answering that it seeds new projects and gates nothing; `strengthBarOf` (R16) answers the reason with the default. (DEC-88; K1025) Its answer's `note` carries the bar's honest note in DEC-105's words: "CivicOS has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (DEC-105; H12; K1038)
- **R16** `strengthBarOf`: a `target` is refused `BAR_IS_A_PROJECT_PROPERTY`; a project the viewer may not see is `membership.noSuchProject`'s answer (its R78), one not a project `NOT_A_PROJECT`, otherwise R14; with no project, the group default or its stated absence, `seeds_new_projects: true`.

**The registration it fills** (K31's pattern, offered by `inquiry`)
- **R17** `inquiry`'s grouping act receives the pair before and after (inquiry R28), from R1–R5. Strength makes the registration itself when its factory first builds (`inquiry.onGrounded("strength", …)`), in place of `legacy-store`'s (N152).

## Private

### Uses

- `record-grammar`: the shared grammar names this module once read from the check catalogue (frontmatter, types, ids, actors, labels, grades, `SHARED_ACT_CHECKS`), re-pointed in T19 (rule 1); the catalogue rows it owned are in its own code (K808, K820).
- `record-core`: `recordOf(ctx)`, the `bundles` read contract.
- `membership`: `viewerPredicate`, `inSight` (R80), `noSuchProject` (R78), and whether an author is an active administrator (R15). *(not declared)*
- `promotion`: `registerStep` (R13); the fact `producingGroup`. *(not declared)*
- `retrieval`: `registerField` (its R62), for R23's cache (K675).
- `provenance`: the `register` and `captured_locators` read contract (R12).
- `inquiry`: `basisFor`, `earned`, `legCapped`, `subjectEntityOf`, the registration R17 fills.
- `inquiry-grammar`: `IMPORTED_FINDING_RE`, `parseImportedFindingRef` (its R11), to know a leg on an imported finding (R33; K1305).
- `basis-versions`: the version rows and legs, `currentOf` (R7, R8); `BASIS_VERSION_LEGS_MAX` (its R9), R8's bound (N184).
- `accepted-work`: `acceptedFinding` (its R2; R33). Index 44 is before 48 (N522).
- `content`, `connections`, `bias`: nothing here calls them once the earned registry is `inquiry`'s (map §5.2).

### Invariants

- **R18** Strength is never stated by a member and never a single value: every answer is per axis, with the member that sets it named (DEC-21, DEC-44).
- **R19** No leg is counted above what the record earns for it, and no rendering is given Grade A on the capture axis (Case Making R2; Intake Doctrine §3).
- **R20** A what-if is exploration, never a record value, and says so in the answer (§6 rule 6, DEC-40).
- **R21** The bar is a declaration beside the strength reached, never a gate on the pair (Case Making, what a CLAIM is; DEC-17).
- **R22** Every read answers an inquiry the viewer may not see as an absent one.
- **R23** `group_strength_bar` is keyed by group, not by bundle, and is exempt from purge as an instance setting (K23); the cache columns move to a table of this module's keyed by `bundle_id`, declared to purge (K75 (3)), and are registered with `retrieval` as the columns of the `capture` and `connection` fields (retrieval R62; N137, K649 (6)), so `query-language` reads them there.
- **R24** Each check moves here as an invariant with its test (K6): C-30.1–C-30.9, C-71.1–C-71.9, C-32.9.
- **R25** No place is named in this module's behaviour or outward text.
- **R28** (D-269, DEC-32 clause 1; N395, K595) Every sentence this module answers for a member uses none of the analyst's vocabulary DEC-32 clause 1 forbids: not AND or OR as a word for the relationship, no spelling of disjunction or grounds, nor the terms DEC-32's entry uses for the same construct (partition, conjunct, branch, "independently sufficient"); it names a set of reasons in the elicitation's words. The sentences are each axis's and ground's `detail` and each named member's `why` on every read that answers a pair (`strengthOf`, `inquiryStrength`, `versionStrength`, `candidatePair`, the pair R17 registers); a version answer's `filter` and the `why` of its `graded`, `ungraded` and `hunches` entries; the bar's `detail` and `note` (R14–R16); and every refusal row's `translation` (C-30, C-71, C-32.9, C-107). A value the record holds (an id, a ground label a member wrote) is rendered as written (DEC-8). A refusal's `detail` is the caller's sentence and not in scope (PL-14).

### Satisfies

- `docs/architecture/BIO_Case_Making_v0_1.md` R1 (DEC-18), R2 (DEC-21), R3, division 4 (weakest link).
- `docs/development/INVESTIGATIVE-SESSION.md` §6 rules 5–6, §12 (the pair over a version, the state set, D-195's independence, the hunch).
- `docs/architecture/BIO_Declared_Bias_v0_1.md`, HUNCH DEBT (DEC-15, DEC-20, DEC-46).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §3 (testimony, a third axis), as amended by DEC-102 (identity sets testimony's weight: R29, R30; K1019).
- DEC-112 (R31, R32); DEC-119 (3) (R34; K1275); DEC-96 item 1 (R33; N522).
- `docs/archive/CASE-AS-PRODUCTION.md` by way of DEC-72 (the bar is a project's property), DEC-17, DEC-32, DEC-40, DEC-44.

### Suggestions

- **Factory.** `strengthOf(ctx)` answers the one instance per Durable Object storage, reaching `inquiry`, `basis-versions` and `promotion` through theirs (K61).
- **The depth bound** is `queue`'s constant today (`QUEUE_ANCESTOR_DEPTH`); this module keeps its own, equal to it.
- **Callers.** `op=strength` stays in-process (the control plane does not route it); `publication` calls `projectBar` and freezes it into the bytes a member signs; `retrieval` reads the cache through its registration (K75 (2)).
- **DEC-102 (R29, R30).** The level is per case edition (`publication` R17), a later module, so the caller passes `levels`; a live read with none answers as today. Tests: an anonymous leg alone is inert and named; beside a document leg sharing no origin it counts at D; beside one sharing its capture it does not; beside a `cover` leg by the same member it does not; a `cover` or `name` leg is unchanged; no answer carries an author.
- Tests: each C-30 and C-71 refusal gets a negative control; R10's composed-figure refusal gets an arm that adds each forbidden key.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).
