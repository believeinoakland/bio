# N300 draft (worker for BOB #61, 2026-09-29; P18). Not folded: publication runs in T11 layer 8, so this is worded into publication.md only after that layer closes. Two points await Bob (open points 1–2).

**K362:** open point 1 ruled by Bob as recommended (`closed` is the owner's act). Open point 2 (readiness rungs) is with Bob.

# N300 — project stage: placement and requirement draft (for BOB)

Sources read: K356 (`build/rulings.md`), N300 (`build/plan/next.md`), `build/requirements/README.md`, State Rules §4.3–§4.5 and its amendments (`docs/architecture/BIO_State_Rules_Consistency_v1_5.md`), `build/modules.json`, `build/layers.md`, the public parts of `inquiry.md`, `publication.md`, `basis-versions.md`, `review.md`, `membership.md` (R43, R44, R55, R80), `connections.md` (R22, R58), `record-core.md` (R37), `queue.md` (R27), and the Purposes of `ratification`, `case-authoring`, `review`, `monitoring`, `affordances`, `queue`, `control-plane`, `intent`. The UX substrate's research on this question (`docs/development/ux-substrate/ux-experience.json`, the entry "Does a project show a stage …").

## Canon relied on

- State Rules §4.3 (Project): *"Lifecycle (current_state): forming (Focuses aggregating, scope settling) → investigating → matured (analysis supports a defensible position) → closed (with closed_reason: resolved, superseded, abandoned; preserved, reversible)."*
- State Rules §4.3, the ladder: *"workproduct_state: … absent | draft | internally_checked | externally_compliant | distributed"* and *"The Work Product readiness ladder (workproduct_state) advances only on recorded evaluations: internally_checked requires a passing internal-strictness run of both evaluations; externally_compliant requires passing external-strictness runs; distributed requires at least one distribution record."*
- State Rules §4.5: *"workproduct.md lives in its Project or Action bundle"*; a distribution *"freezes workproduct.md, the citation register, and every cited snapshot"*; *"Distributed copies are immutable; corrections happen upstream and produce a new distribution."*
- State Rules, amendment "`published` leaves the INQUIRY state machine": DEC-72, *"a case is a production of a project"*; amendment "`concluded` is a state of a PROJECT'S relationship with an inquiry": *"`concluded` is now read FOR A PROJECT: the project's dated, authored adoption of a version's claim."*
- Membership v2 §7: *"A project in BIO is a record object (BIO_State_Rules_Consistency Section 4.3): a bundle with an objective, an analysis record, a work-product readiness ladder, recorded evaluations, and a lifecycle of forming, investigating, matured, closed."*
- INVESTIGATIVE-SESSION §7: *"linking a bundle to a project creates an EDGE (a `refs` edge — many projects may cite one inquiry)"*; §7.1: a conclusion *"belongs to the project's relationship with the inquiry"*.
- Functional Architecture v3, Function 2 resolution note: *"the Work Product readiness ladder (draft, internally checked, externally compliant, distributed) advances only on recorded passing evaluations."* No canon text maps "work product" onto the post-DEC-72 case; the Compliance and Argument Evaluations are not built (UC-100).
- Legacy today: `STATES.project` (`bio-checks.mjs` 453–460) keeps `current_state` as a stored, hand-moved field with edges (`closed → investigating` included); C-2.9 requires `closed_reason` for `closed` (3640), its arms staying in `legacy-checks` (intent's file, line 120).

---

## 1. Placement

**Host: `publication`** (layer 8, Publication; order index 48, the first module at or after `publication`).

Why it and not another:
- It holds two of the three inputs itself: a project's cases (`cases.project_id`), their ratified editions (`published_cases`) and unsigned case documents (`case_documents`, R21). The readiness half is its own data.
- It is after `inquiry` (36) and `basis-versions` (38), which hold the question half: the questions a project draws on and the project's stance on each (basis-versions R13, R18, R22, R37).
- **It adds no `uses` edge.** `publication` already uses `legacy-checks`, `record-core`, `membership`, `connections`, `inquiry` and `basis-versions` (modules.json). Only new calls on existing edges (section 3).
- Its hidden-project rule already exists (R29: *"Working material (an unsigned document, a hidden project) answers an outsider exactly as something that does not exist"*). The new read inherits it.
- Alternatives considered. `case-authoring` and `review` (also layer 8) would each need a new `inquiry` edge and fit their Purposes no better. `review` would read `case_drafts` as its own table, but its Purpose is the review copy. `intent` (layer 7) is the natural home in meaning (progress computed, never reported) but comes before `publication`, which K356 rules out. `affordances` and `queue` (layer 11) would work, but they are surfaces, and a later extraction would then have to move the stage out of the surface layer.
- Cost: a sentence is added to publication's Purpose, which today reads "This module is the published record". Proposed addition: *"It also answers a project's stage and its cases' readiness, computed from the questions the project draws on and what it has published (State Rules §4.3; K356)."*

`uses` edges added in `modules.json`: **none**. (The optional `case_drafts` read in 3(c) is a stated table contract on K240's precedent, not a module use.)

---

## 2. Requirement text (`publication.md`, a new subsection under Provides, after "Registrations offered"; next free ids R44, R45)

Highest id in `publication.md` today is R43, so the new ids are R44–R46.

#### A project's stage: projectStage({project, viewer}) (`op=projectstage`) Writes nothing.

- **R44** `projectStage({project, viewer})` answers `{project, stage, closed_reason, questions: {read, with_legs, concluded, truncated}, published_editions, work_products, readiness, basis}`. It derives `stage` fresh on every read. Refusals: `NO_ID` for an empty `project`. `NO_SUCH_PROJECT` for a project that is absent, not a project, or at membership R44's `NONE` for the viewer. Those three cases get the same answer, byte-identical, and it is also the answer to an unrecognised viewer (R29). At `EXISTENCE` (discoverable, the viewer not a participant) the answer is membership R44's `PROJECT_SEEN_NOT_A_PARTICIPANT`, carrying only the id and name. Only a viewer at `FULL` gets the answer. It never throws: a part it cannot read is stated as undetermined (R28).
- **R45** The stage is one of State Rules §4.3's four. The first rule that holds decides it:
  1. **`closed`**: the project's own document records `current_state: closed` with a `closed_reason` of `resolved`, `superseded` or `abandoned`, and `closed_reason` carries it. This is the owner's recorded act, shown as recorded (see open point 1). §4.3: *"closed (with closed_reason: resolved, superseded, abandoned; preserved, reversible)"*.
  2. **`matured`** (*"analysis supports a defensible position"*): the project's stance on at least one question it holds is `concluded` (basis-versions R22's `conclusionOf`, the project's own adoption and never a no-project conclusion), or the project owns at least one ratified case edition.
  3. **`investigating`**: at least one question the project holds has at least one leg in its basis.
  4. **`forming`** (*"Focuses aggregating, scope settling"*): otherwise. The project holds no question, or none of the questions it holds has a leg.

  A question the project **holds** is an inquiry its document cites by a `cites` reference not marked `severed`. This is basis-versions R13's and R37's own test, whatever the question's shared state. `basis` names the rule that decided the stage and the question or case edition that met it (for rule 2, the first by id). The project document's recorded `current_state` enters only through rule 1: `forming`, `investigating` or `matured` written there is never read. `questions` counts the held questions read, those with a leg, and those the project's stance has `concluded`.
- **R46** Work products and readiness. Each case the project owns is one work product (`cases.project_id`, in case id order, at most 200, with `truncated`). So is each draft of the project's that names no case (3(c)). Each is `{case, draft?, readiness, editions, latest_edition, rungs}`. `rungs` states each rung of State Rules §4.3's ladder by that rung's own condition:
  - `draft`: an unsigned case document of the case is stored (R21), or a draft names it.
  - `internally_checked` and `externally_compliant`: `{met: false, why: "no evaluation is recorded"}` while no Compliance or Argument Evaluation is recorded for the work product. They are never inferred from a signature or a gate.
  - `distributed`: at least one ratified edition (§4.3: *"distributed requires at least one distribution record"*; a ratified case edition is the distribution record, K356's "what it has published"), with `editions` the count and `latest_edition` the highest.

  `readiness` is the highest rung whose own condition is met. The project-level `readiness` is `absent` when it has no work product; otherwise the answer carries the list. `published_editions` counts the project's ratified case editions. No answer here composes a strength (R26).
  *(not yet met: N300)*

Invariant to add under publication's Invariants (next id after R46, so R47):

- **R47** A project's stage and its work products' readiness are computed at the read from the record and never stored or set. No table or column holds them, no op writes them, and `projectStage` is their only answer. A move of either is a move of its inputs: a question drawn on or severed, a leg, a conclusion or its withdrawal, a case document stored, an edition ratified, the owner's recorded close. *(not yet met: N300)*

Bounds (inside R44–R46):
- Held questions are read in pages from basis-versions' new read (3(a)): 500 per page, at most 2,000 per call. The read stops as soon as rule 2 is met.
- If the cap is reached with rules 1–2 unmet, `stage` is `undetermined`, with `at_least` set to the stage that was established (`investigating` or `forming`) and `questions.truncated: true`. It is never filled in (R28).
- At most 200 work products are read.

Satisfies additions: `BIO_State_Rules_Consistency_v1_5.md` §4.3 (the lifecycle and the readiness ladder) and its two amendments ("`concluded` is a state of a PROJECT'S relationship with an inquiry"; "`published` leaves the INQUIRY state machine"); `BIO_Membership_Architecture_v2.md` §7 (a project is the §4.3 object) and §7.9 (sight); INVESTIGATIVE-SESSION §7, §7.1; Bob's K356.

Suggestions additions:
- **For callers.** The control plane routes `op=projectstage`, stamps `viewer` and keeps the route. The redesign shows the answer on the project's home screen (N300). It states unmet rungs as not met with their `why`, never hidden (the substrate research's recommendation).
- **Tests.** Take one project through the four stages by its inputs alone: cite a question; add a leg; conclude; withdraw; ratify. Add arms for:
  - a `current_state: matured` written in the document with no question held, which still reads `forming` (R47's negative control);
  - the three refusals, byte-identical (R29);
  - the page cap reading `undetermined`.

Status line: add R44–R47 to "Not yet met" as `N300`.

---

## 3. Uses lines and provider-side wording

**(a) `basis-versions`: a new read (next free id R41; the highest today is R40).** The project → questions direction does not exist: R37 is inquiry → projects.

- **R41** `projectQuestions({project, after, limit})` → `{items: [{inquiry, legs, stance}], cursor}`: the inquiries the project draws on, by R13's own test (its document holds a `cites` reference to the inquiry not marked `severed`), in id order after `after`. `legs` is true when the inquiry's basis holds at least one leg (`inquiry` R16's `basisFor(id, {limit: 1})`). `stance` is the project's stance by R22: `concluded`, `withdrawn`, `none` or `undetermined`. `limit` defaults to 500, clamped to 1–500; `cursor` is the last inquiry answered when more follow, else null. It is viewer-free (its caller fences the project) and read by `publication` R44. It writes nothing and never throws. An empty or non-project id answers `items: []`. *(not yet met: N300)*

  It uses only existing edges: basis-versions → connections (`refs` R58, `edgeSevered` R22) and → inquiry (R16).

**(b) `inquiry`: no new read needed.** `basisFor` with `limit` (R16) already answers "has a leg" to basis-versions. The question half is read through basis-versions because the project's stance lives there, which is how N300's "it reads inquiry" is met.

**(c) Drafts (optional; see open point 5).** For a `review` draft to count as a `draft` rung, amend review R26's reader list to *"read by `case-authoring`'s acknowledgements and `publication`'s R46 under `REVIEW_LIST_MAX`"*. This is a stated table contract on K240's precedent (case-authoring, earlier than review, already reads `case_drafts`), with no `uses` edge. Without it, R46's `draft` rung counts unsigned case documents only.

**Lines to add to publication's `### Uses`:**
- `membership`: … add `sight` (R44), for R44's fence.
- `basis-versions`: `testimonyReach` (R17); add `projectQuestions` (its R41) and `conclusionOf` (its R22), for R45.
- `record-core`: add `bundles.current_state` and the project's `bundle.md` text (`files.content`, its R37), read with `parseFrontmatter` for `closed_reason` (R45 rule 1).
- `review`: the `case_drafts` read contract (its R26), for R46, only if 3(c) is taken. *(not declared: a table contract)*

Also amend publication's "Decided by BOB" item 9 (the "not called by this module's code" list is unchanged): add *"`projectStage` is this module's (N300, K356): the earliest module holding both the question half, through its uses, and the published half."*

---

## 4. Open points

1. **`closed` is an authored act.** It changes meaning, so it needs Bob. §4.3 gives `closed` a judged `closed_reason` (resolved, superseded, abandoned) that the record cannot compute, so "never set by hand" cannot hold for it literally. Recommendation (the substrate research's first option): `closed` is the owner's recorded act, which the read shows; the other three stages are derived. Reopening is the owner's act too: the stage is then derived again. The rule would read "no stage but `closed` is set by hand".
2. **Readiness rungs are stated independently.** This probably changes meaning, so Bob should confirm. Read as a strict sequence, §4.3's *"advances only on recorded evaluations"* would hold every published case at `draft` until the unbuilt evaluations exist (UC-100). Recommendation: state each rung by its own condition (R46), so a ratified case reads `distributed`, with `internally_checked` and `externally_compliant` shown as "no evaluation is recorded". The Functional Architecture's "advances only on recorded passing evaluations" is then honoured rung by rung, not as a gate on `distributed`.
3. **"Work product" is the case, and "distribution record" is a ratified edition.** This is wording, grounded in DEC-72 ("a case is a production of a project") and K356 ("computed from … what it has published"). No canon line maps the terms, and §4.5's in-bundle `workproduct.md` and `distributions/dist-NNNN/` were never built on the plane. If Bob reads the work product as something other than the case, that is meaning.
4. **The `matured` test is at least one concluded stance, or any ratified edition.** This is BOB's to word under N300 ("worded … by BOB"), but it is what members see, so report it.
   - The alternative, "every held question concluded or set aside", would leave most projects `investigating` forever: a question kept open beside a published case is normal.
   - `matured` stays after a withdrawal while a ratified edition stands, because publication is one way (R24).
   - A no-project conclusion (basis-versions R23) never counts: §7.1 says the conclusion is the project's.
5. **Review drafts in the `draft` rung.** Wording and placement, BOB's call. Recommendation: take 3(c), so a draft a project's editors are writing reads `draft`. A draft that names no case is its own work product with `case: null`.
6. **Per-project set-asides are not read.** Wording, BOB's call. `queue` R27's project-scoped disposition is in layer 11, after the host, so a question the project set aside still counts as held (it can only make the stage `investigating`, never `matured`). Recommendation: accept this, and state it in R45. If Bob wants set-asides excluded, publication offers a K31 registration slot that `queue` fills (publication R23/R36 pattern).
7. **The stored lifecycle field stays for now.** This is a follow-up entry, not N300, because retiring the field touches checks (never dropped without a ruling). The project document's `current_state` and the legacy `STATES.project` edges and C-2.9 remain, and members (and promotion) can still write `forming`, `investigating` or `matured` there. R45/R47 make the read ignore those values. Whether `promotion` should refuse a hand-written non-`closed` project state, and whether C-2.9's `workproduct_state` and `evaluations` arms and the stored `workproduct_state` retire, is a new plan entry for T12 or later. It needs Bob if it drops or changes a check.
8. **Held questions in any shared state.** Wording. A question that is shared-`dismissed`, `deferred` or `divided` still counts if the project cites it by a live edge. This follows basis-versions R13/R37's test, which ignores state. A divided parent's children count only once the project cites them.
