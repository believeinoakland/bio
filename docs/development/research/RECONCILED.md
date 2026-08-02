# RECONCILED — the single statement of the case-making design

Written 2026-08-01. **This file resolves the research corpus; it does not summarise it.**

Fourteen files in `docs/development/research/` plus `docs/development/PROCESS-INVENTORY.md`
and `docs/development/PRACTICE-SURVEY.md` were produced by thirteen passes. Three of them —
`SB-CORE.md`, `SB-EVIDENCE.md`, `SB-OUTPUT.md` — were written in PARALLEL by sessions that
could not read each other, and they contradict each other. `BUILD-ORDER.md` was written
before `architecture/BIO_Case_Making_v0_1.md` §"Resolutions forced by the adversarial pass"
existed, so it plans against a design that has since been ruled on in four places.

**Standing of this file.** Where this file and any of `SB-CORE.md`, `SB-EVIDENCE.md`,
`SB-OUTPUT.md`, `BUILD-ORDER.md` disagree, THIS FILE IS THE DESIGN and those files are
history. It does not edit them — a reader who opens one of them directly will still read the
superseded text, and the single smallest action that closes that is a one-line pointer at the
top of each of the four, which is CONDUCT's to make.

**Discipline applied.** Every decision below quotes BOTH sides and gives a reason. Where two
files disagree and both are wrong, it says so. Where deciding would have required inventing
design, it does not decide — it records what would settle it and names who it belongs to.
Fourteen such places are in §4; three of them block build items and are called out.

| | count |
| --- | --- |
| contradictions resolved or recorded | **38** — 30 from `CRITIQUE.md`, 8 found in this pass |
| passages contradicting R1–R4 | **27** across four files |
| build items CHANGED | **17 of 35** (11 by R1–R4, 6 by inter-file contradictions) |
| build items UNCHANGED | **18 of 35** |
| new build items | **0** — every correction lands inside an existing item |
| open questions, de-duplicated | **14** (from ~40 raw mentions across 16 files) |

---

## §0 · THE DESIGN, AS IT NOW STANDS

One page. Everything below §0 is the evidence for it.

**The object.** `information` · `inquiry` · `action` · `project` — evidence, claim,
engagement, workspace. `focus`, `finding` and `case` collapse into ONE recursive type
`inquiry` with states `open → concluded → published` (plus `deferred`, `dismissed`,
`divided`); `inquiry` / `finding` / `case` are the MEMBER-FACING names for those phases and
are never stored.

**The basis.** An inquiry rests on a `basis[]` of legs. A leg targets an `INFO-` bundle or
another `INQ-`. That self-reference is the recursion and it is the point. Each leg carries
`role ∈ supports|cuts_against` — invariant 7's storage — and a grade.

**Strength is a PAIR, never a scalar** (R2). A chain carries the weakest CAPTURE grade among
its evidentiary legs and the weakest CONNECTION grade among its inferential legs. Nothing
averages, mixes or collapses them. Because a leg's axis is NOT derivable from its target type
— an `INFO-` leg can carry a connection grade — the axis must be recorded on the leg.

**An undetermined leg SUSPENDS the chain** (R1). The chain then has no computed strength on
the affected axis and names the leg that is why. It does not floor, it does not average, it
is never ignored, and it is never ranked below grade D. A case may publish with a strength
stated as suspended pending that leg.

**The basis graph is a DAG, enforced at write** (R3). An inquiry may not cite itself
transitively; the refusal names the cycle it found; derivation carries a depth bound whose
exhaustion is reported as `undetermined`, not as a failure.

**Publication asserts a material set.** `published` requires an authored completeness
statement naming what was excluded and why, never prefilled, byte-checked against the
previous revision so the gate is not a checkbox. The exclusion is in the bytes AND in an
indexed table, and the table's `target_id` is populated by a picker over the member's own
material — otherwise the audit query that justifies the table has no source.

**Division costs at least what severance costs** (R4). It requires an authored reason; the
divided parent records where every leg went including legs that cut against; and **a published
child names its parent and its siblings**, as references the published surface can NAME even
though it cannot SERVE them.

**A published case is an INPUT, not a terminus.** It cannot be divided. It can be cited,
and a case built on a case cannot be stronger than the case beneath it — per axis.

**Whether a published bundle may be REVISED is not decided by this file.** See §4 Q1. What IS
decided: the published case page renders the PUBLISHED PROJECTION and never the live working
bundle, so the frozen-strength-over-moved-bytes overclaim cannot occur either way.

---

## §1 · THE FOUR RESOLUTIONS, APPLIED PASSAGE BY PASSAGE

Source: `docs/architecture/BIO_Case_Making_v0_1.md:476-551`.

Each row quotes the offending passage, states the correction, and marks whether the passage
CONTRADICTS a resolution, is SILENT where the resolution requires something, or already
CONFORMS (recorded so a reader knows it was checked, not missed).

### 1.1 · R1 — an undetermined leg SUSPENDS the chain; `#weakerGrade` must not be reused

> **R1:** *"Ignoring it launders… Flooring it below D punishes honesty… SUSPENDING states the
> truth. The chain has no computed strength, and says which leg is why… **Consequence for the
> build: `#weakerGrade` MUST NOT be reused unchanged.** A null grade is not a weak grade; it
> is the absence of one, and the two must not share a rank."*

| # | passage | verdict | corrected statement |
| --- | --- | --- | --- |
| R1-a | `SB-CORE.md:1091-1099` — *"STRENGTH ⟨undetermined⟩ — one leg has no established grade, so the chain has none. This is not a failure and it is not a low score. It is what we do not know."* | **CONFORMS** | No change. This is R1's behaviour, drawn correctly, and it is the only frame in three files that got it right. |
| R1-b | `SB-CORE.md:1490` (GAP-I3) — *"a walk of `inquiry_basis` reusing `#weakerGrade` **unchanged**"* | **CONTRADICTS** | *"a walk of `inquiry_basis` with a comparator that treats a null grade as the ABSENCE of a grade and never as a rank. `#weakerGrade` (`store.mjs:3444-3446`) ranks an unknown with `\|\| 0`, i.e. below grade D, and must not be reused unchanged."* The file prescribes the mechanism that defeats its own sentence at `:1091`. |
| R1-c | `SB-OUTPUT.md:457-462` — *"I do not know whether `undetermined` should floor the composition or suspend it"* | **SUPERSEDED** | R1 decides it. The passage stands as history. |
| R1-d | `SB-OUTPUT.md:425` — the S7 wireframe publishing at `▪ C ▪` with leg D at `strength undetermined` in the same basis list | **CONTRADICTS** | *"This case has NO computed strength. Leg D (`INFO-2026-0058-controller-memo`) has no established grade, so the chain is suspended pending that leg. It may still be published, and it will publish as suspended, naming leg D."* |
| R1-e | `SB-OUTPUT.md:1150-1156` (S4) — *"whether an `undetermined` leg should FLOOR the weakest-link composition… or SUSPEND it… **I don't know**"* | **SUPERSEDED** | R1 decides it — and see R1-h, because SB-OUTPUT's definition of the word "suspend" is the OPPOSITE of R1's. |
| R1-f | `SB-OUTPUT.md:1925-1934` §5 item 1 — recorded as Bob's open question | **SUPERSEDED** | Answered. Remove from the open list. |
| R1-g | `SB-OUTPUT.md:978` — public index row *"published 2 June 2026 · strength undetermined"* | **CONFORMS** in value, **AMBIGUOUS** in wording | The value is right. R3's own text calls R1's outcome `undetermined`, so `undetermined` is the rendered value and SUSPEND is the name of the behaviour. The row must also name the leg, which no index row currently does. |
| R1-h | **NEW (N-2).** `SB-OUTPUT.md:1150-1156` defines FLOOR as *"making the whole case undetermined"* and SUSPEND as *"the case is graded on its determined legs"*. R1 uses SUSPEND for the FIRST of those. `BUILD-ORDER.md:419` (REC-12) then instructs *"ship SUSPEND"* citing `SB-OUTPUT` §5.1 | **CONTRADICTS by vocabulary** | **The word SUSPEND means opposite things in the ruling and in the item that implements it.** Canonical from here: **SUSPEND = the chain has no computed strength and names the leg.** The behaviour SB-OUTPUT called "suspend" (grade on the determined legs, note the ungraded one) is **REFUSED** — it is exactly the laundering R1's first bullet forbids. This is the single most dangerous collision in the corpus, because a worker reading REC-12 in good faith would build the refused behaviour. |
| R1-i | `BUILD-ORDER.md:419` (REC-12) — *"the result is `min` by `#GRADE_RANK` — **reuse `#weakerGrade` unchanged, do not write a second comparator**"* | **CONTRADICTS** | *"a comparator that short-circuits on a null grade before any rank comparison occurs, and that compares only within one axis (R2). `#weakerGrade` is not reusable for either reason."* |
| R1-j | **NEW (N-3).** `BUILD-ORDER.md:419` (REC-12) also says *"ANY leg with `grade IS NULL`, yields `null` + `determined: false`"* | **INTERNALLY INCONSISTENT** | The item states R1's correct mechanism and, in the same sentence, forbids the change that mechanism requires. Both halves cannot ship. The null-check half is right; the reuse half is deleted. |
| R1-k | `BUILD-ORDER.md:207-212` (HOLE-5) — *"**I don't know** — it is doctrine and Bob's"* | **SUPERSEDED** | HOLE-5 is CLOSED by R1. Six holes remain. |
| R1-l | `BUILD-ORDER.md:127` — the O2 row citing HOLE-5 as an outstanding dependency | **SUPERSEDED** | Dependency discharged. |
| R1-m | **NEW.** `store.mjs:3441-3443`, the comment on `#weakerGrade` itself: *"Reuses the resolution grade rank so the two axes cannot drift."* | **CONTRADICTS R1 AND R2 at the source** | The code does not merely happen to compose across two axes — **its comment names the two axes and treats their shared rank as a FEATURE**. R2 rules the opposite. Any item touching this function must correct the comment and say why the old one was wrong, per `CLAUDE.md`'s correct-superseded-tests rule applied to a claim in a comment. Not previously noticed by any pass, including `CRITIQUE.md`, which quoted the function body and not the comment above it. |

### 1.2 · R2 — capture grade and connection grade are TWO scales

> **R2:** *"strength is a PAIR, never a scalar. A chain carries the weakest CAPTURE grade among
> its evidentiary legs and the weakest CONNECTION grade among its inferential legs, and nothing
> averages, mixes or collapses them. A rendering may show both; no rendering may reduce them to
> one letter."* Plus: *"no surface may display Grade A for a direct capture."*

| # | passage | verdict | corrected statement |
| --- | --- | --- | --- |
| R2-a | `SB-CORE.md:1063-1067` — *"STRENGTH ⟨C⟩ — no stronger than the weakest leg, which is ⟨INFO-2026-0116-ordinance-13035-cms⟩"* | **CONTRADICTS** | Two lines, never one: *"CAPTURE ⟨C⟩ — the weakest capture among the evidentiary legs is ⟨INFO-2026-0116-…⟩. CONNECTION ⟨…⟩ — the weakest connection among the inferential legs is ⟨…⟩. These are two scales and neither substitutes for the other."* |
| R2-b | `SB-CORE.md:1471` — `inquiry_basis … role, grade, grade_source` | **SILENT, and the silence is the defect** | The leg must record WHICH AXIS its grade is on. **It is not derivable from `target_type`**: `SB-OUTPUT.md:432-435` puts connection grades (*"the document says it itself"*) on `INFO-` legs. The shape of that field (a column, or a second grade column) is a build decision flagged in REC-11, not one this file mints. |
| R2-c | `SB-CORE.md:1229` (I7 pane 3) — the live preview *"A would read ⟨B⟩ · B would read ⟨C⟩"* | **CONTRADICTS** (NEW, N-5) | Each child reads a PAIR. A single letter per child is the same category error inside the division dialog, where it is doing persuasive work on the member's apportionment choice. |
| R2-d | `SB-OUTPUT.md:425` — *"This case will be published at strength ▪ C ▪ / A case is worth its weakest leg"* over a basis mixing both axes | **CONTRADICTS** | *"This case will be published at CAPTURE ▪ B ▪ and CONNECTION ▪ C ▪. Each is the weakest leg on its own scale. Neither substitutes for the other."* |
| R2-e | `SB-OUTPUT.md:429-435` and `:1019` — *"A · INFO-2026-0031-acfr-fy2024 / verified · captured from the city's own address / **grade A — the document says it itself**"* | **CONTRADICTS**, and this is D-3's real fix | The two lines state a CAPTURE fact (*captured from the city's own address*) and a CONNECTION grade (*the document says it itself*) under one unlabelled letter A. Corrected: *"`INFO-2026-0031-acfr-fy2024` · capture ⟨B⟩ — a direct capture by this instance · connection ⟨A⟩ — the document links them itself."* **Grade A for the CAPTURE is forbidden** (`CAPTURE-FIDELITY.md:40`, `index.mjs:2348`, the live negative control at `CLAIMS.md:410`). Grade A for the CONNECTION is legitimate (`BIO_Content_Framework_v0_10.md:550-585`). |
| R2-f | `SB-OUTPUT.md:1089` — *"It shows only claims at strength C or better"* | **CONTRADICTS** | A threshold over a pair must name its axis or state both: *"claims whose capture is C or better AND whose connection is C or better."* Which of those two forms a threshold takes is §4 Q6. |
| R2-g | `SB-EVIDENCE.md:908-910` — *"Grade B is what a direct capture by this instance is worth; **it is not Grade A and this surface will not say it is**"* | **CONFORMS**, on the capture axis | No change. This is the correct half of D-3. |
| R2-h | `SB-EVIDENCE.md:602-607` — *"Grade tracks how the bytes reached us, never how credible the document is"* | **CONFORMS** | No change, and it is the sentence the other two files should have carried. |
| R2-i | `BUILD-ORDER.md:419` (REC-12) — *"the result is `min` by `#GRADE_RANK`"* | **CONTRADICTS** | Two minima, computed over two disjoint leg sets, never combined. |
| R2-j | `BUILD-ORDER.md:96` (REC-14, C-21.2) — *"a grade equal to that case's FROZEN strength, refused if stronger"* | **CONTRADICTS** | *"a grade equal to that case's frozen strength ON THE SAME AXIS, refused if stronger on either axis."* A single-scalar inheritance check would let a case inherit an A connection grade from a case whose A was a capture grade. |
| R2-k | `BUILD-ORDER.md:27-29` (M9 acceptance) — *"the page states the derived strength as the weakest leg, by name — never as a score, never as an average"* | **CONTRADICTS** | *"the page states BOTH derived strengths — capture and connection — each as its own weakest leg, by name; never as a score, never as an average, never composed into one letter; and `undetermined` on an axis suspends that axis and names the leg."* |
| R2-l | `BUILD-ORDER.md:128` (REC-18) — D1(b), *"a document leg's grade is the STRONGEST resolution of that document's captures to the inquiry's subject entity"* | **CONTRADICTS by omission** | That describes a CONNECTION grade only. A document leg also has a CAPTURE grade, which the record already holds and which needs no ruling. **R2 splits D1 into two questions and answers half of it**: the capture half is already earned from the capture record; only the connection half needs Bob. REC-18's blocker narrows accordingly. |

### 1.3 · R3 — the basis graph is a DAG, enforced at write, with a depth bound

> **R3:** *"the basis graph is a DAG, enforced at write. An inquiry may not cite itself
> transitively, the refusal names the cycle it found, and derivation carries a depth bound
> whose exhaustion is reported as `undetermined` (R1) rather than as a failure."*

| # | passage | verdict | corrected statement |
| --- | --- | --- | --- |
| R3-a | `SB-CORE.md:1489` (GAP-I2) — the only stated refusal is that `refs` and `inquiry_basis` may not disagree | **SILENT** | GAP-I2 gains: a write that would make the basis graph cyclic is REFUSED, naming the path it found. |
| R3-b | `SB-CORE.md:1490` — *"derived on read"*, unbounded | **CONTRADICTS** | *"derived on read to a bounded depth; exhausting the bound reports `undetermined` for that chain and names the depth, which is R1's shape and not an error."* Without the bound, two mutually-citing inquiries make every read non-terminating inside the Durable Object and the failure arrives as the CPU-ceiling CONDITION (`NOTIFICATIONS.md:187`) — our machinery breaking rather than a refusal naming the offender. |
| R3-c | `SB-CORE.md:1484-1499` GAP-I4's refusals — `PUBLISHED_CANNOT_DIVIDE`, `NO_APPORTIONMENT`, `TOO_FEW_CHILDREN`; GAP-I5's — `NO_CONCLUSION`, `NO_FALSIFIER` | **SILENT** | No cycle refusal appears in any GAP list in any file. |
| R3-d | **NEW (N-1).** `SB-EVIDENCE.md:335-360` (E11), the cite pre-flight — *"✓ all 11 are information (NOT_INFORMATION)"* | **CONTRADICTS the collapse and R3** | The plane's `store.mjs:2098-2104` refuses any selection member that is not `information`, and its comment names the side effect: *"This also catches a Project citing itself, which is a cycle with nothing to mean."* **Under the collapse an `INQ-` member is the point**, so this pre-flight line describes a refusal that must go — and going takes the record's only cycle protection with it. Corrected: the pre-flight checks that every member is CITABLE (`information` or `inquiry`) and that no member would close a cycle. The refusal names are a build decision, not this file's to mint. `CRITIQUE.md` C-1 identified the guard's removal but did not connect it to the surface that draws the guard. |
| R3-e | `BUILD-ORDER.md:72` (REC-11) — scope and `accepts-when` name no cycle refusal | **SILENT** | REC-11 gains the write-time DAG check and its negative control. |
| R3-f | `BUILD-ORDER.md:419` (REC-12) — *"a leg to another inquiry contributes that inquiry's derived strength (recursion)"* | **CONTRADICTS** | Recursion with no bound. Gains the depth bound and the `undetermined`-on-exhaustion report. |

### 1.4 · R4 — division must cost at least what severance costs

> **R4:** *"division carries severance's friction and then some. It requires an authored reason;
> the divided parent RECORDS where every leg went, including legs that cut against; and **a
> published child names its parent and its siblings.** A reader who can see one half of a
> divided inquiry can see that the other half exists."*

| # | passage | verdict | corrected statement |
| --- | --- | --- | --- |
| R4-a | `SB-CORE.md:1215-1226` (I7 pane 3) — the apportionment table, *"Both is allowed. Neither is not — every leg gets a home, and nothing is moved for you"* | **CONFORMS** | This satisfies R4's second clause. It is the strongest thing in the division design and it survives intact. |
| R4-b | `SB-CORE.md:1233-1236` (I7 pane 5) — ONE authored reason for the whole division | **CONFORMS to R4 as written**, and leaves D-7's asymmetry live | R4 requires *"an authored reason"*, singular. It does NOT impose severance's per-leg reason. So `CRITIQUE.md` D-7's cost argument — sever costs a reason per leg, divide costs one reason total — **is answered by DISCLOSURE rather than by symmetric friction**. That is a real choice with a residual, recorded as §4 Q7. |
| R4-c | `SB-CORE.md:1228-1231` (I7 pane 4) — the pre-flight checks *not published · every leg apportioned · two or more questions written* | **SILENT** | Gains: every child records its parent and its siblings, and that record is part of what publishing a child discloses. |
| R4-d | `SB-CORE.md:1070-1073` — *"ⓘ One leg is weaker than the rest… If these are really two questions, you can separate them and state the stronger one at its own strength. [ Divide this… ]"* | **NOT ADDRESSED by R4** | R4 governs the ACT's cost, not the moment the system proposes it. `CRITIQUE.md` D-7's timing hit — *"the system proposes the manoeuvre at the exact moment it raises the member's publishable strength"* — is untouched by R4 and stays open (§4 Q7). I will not invent a timing rule. |
| R4-e | `SB-OUTPUT.md:1358` (U3) — `published_edges` *"restricted to targets that are themselves published"* | **CONTRADICTS** | A divided parent is TERMINAL and never published; a sibling may not be published. So the restriction as written makes R4's disclosure impossible on the exact surface R4 was written for. Corrected: *"restricted to published targets for edges the surface may SERVE, and admitting the parent and sibling ids of a division as edges the surface may only NAME."* The name-but-cannot-serve distinction is already the corpus's own (`BUILD-ORDER.md:180`, `:320`), so this reuses an existing mechanism rather than adding one. |
| R4-f | `BUILD-ORDER.md:112` (REC-16) — refusals `PUBLISHED_CANNOT_DIVIDE`, `NO_APPORTIONMENT`, `TOO_FEW_CHILDREN`, `NO_REASON` | **SILENT** | Gains: each child carries its parent id AND its sibling ids; C-6.1's new `supersedes` requirements include the sibling set; and the negative control is that a child publishes without naming a sibling and the suite fails. |
| R4-g | `BUILD-ORDER.md:180` (REC-22) — `published_edges` written *"restricted to targets that are themselves published"* | **CONTRADICTS** | Same correction as R4-e, in the item that builds it. |
| R4-h | `BUILD-ORDER.md:817-822` §3.3 — *"**REC-16 (division) does not block REC-14 (publish).**… Publishing an unmixed inquiry works without it"* | **STILL TRUE for REC-14; NO LONGER TRUE for the published surface** | REC-14 is unaffected: an inquiry that was never divided has no parent and no siblings to name. But R4 makes the disclosure a property of PUBLISHING A DIVIDED CHILD, so **REC-22 and UI-18 gain a dependency on REC-16** to render it. The ordering claim narrows; it does not fall. |
| R4-i | `SB-CORE.md:1236` — the division dialog's rung line *"weight  reversible · reasoned · TERMINAL · attested"* | **CONTRADICTS C-6, not R4** | See §2 C-6. The ladder is `rung`; `weight` is the plane's set-application mode. |

---

## §2 · THE CONTRADICTION REGISTER

Thirty from `CRITIQUE.md`, eight found in this pass. Each: both sides quoted, a decision, a
reason. **Where two files disagree and BOTH are wrong, it says so.**

### 2.1 · DOCTRINE

---

**D-1 · A published case is immutable in one file and revisable in another.**

> `SB-CORE.md:1309`: *"This cannot be edited, divided or withdrawn. It can be superseded by a
> later inquiry that cites it."*
>
> `SB-OUTPUT.md:709-720`: *"published 2026-08-01 · sha256:9d0e77b31af4c2… **since then 3
> revisions in the working record** … [ Publish the new revision… ]"*
>
> `DATA-MODEL.md:433`: *"`published: [], // terminal, by R5.3 and the publication fence"*.
> `store.mjs:5934-5940`: `publish()` UPSERTS `published_bundles`.

**DECIDED IN PART. NOT RESOLVED IN WHOLE — this is unresolved #1 (§4 Q1).**

Decided, and it holds whichever way Q1 goes: **the published case page renders the PUBLISHED
PROJECTION and never the live working bundle.** Reason: `BUILD-ORDER.md:180` (REC-22) already
requires exactly that — *"returns from the PUBLISHED PROJECTION ONLY"* — and states why:
*"Reading the published projection only is what makes all three safe to expose without a
credential."* `SB-CORE.md:1284-1312` renders `⟨CASE⟩ · published` inside the WORKING inquiry
page with a live act bar and a frozen strength beside it. That frame is the overclaim, and it
is refused regardless of the revision question, because the frozen strength and the rendered
body must come from the same bytes.

Not decided: whether re-ratification is permitted at all. Both readings are defensible from
the repository and the repository is internally split — `published_shas` appends (*"a hash
once published stays answerable forever"*) which presumes many, `published_bundles` upserts
which presumes one current. Deciding it would be inventing doctrine about what the record owes
a reader who relied on an earlier hash. What settles it, and the consequence of each branch, is
in §4 Q1.

---

**D-2 · `undetermined` floors, suspends, and is unresolved — four answers.**

> `SB-CORE.md:1087-1099` decides SUSPEND (in R1's sense). `SB-OUTPUT.md:457-462` refuses to
> decide and its wireframe answers by construction the other way. `SB-CORE.md:1490` prescribes
> `#weakerGrade` unchanged, which floors below D.

**RESOLVED by R1.** See §1.1 rows a–m. Note especially R1-h: the WORD "suspend" carried
opposite meanings in the ruling and in the item that implements it, and that collision is
itself a defect this file closes.

---

**D-3 · Grade A displayed for a direct capture.**

> `SB-OUTPUT.md:429-435`: *"A · INFO-2026-0031-acfr-fy2024 … verified · captured from the
> city's own address … **grade A — the document says it itself**"*
>
> `SB-EVIDENCE.md:908-910`: *"Grade B is what a direct capture by this instance is worth; **it
> is not Grade A and this surface will not say it is.**"*

**RESOLVED — and BOTH files are partly wrong.** SB-EVIDENCE is right that the CAPTURE grade of
a direct capture is B and can never be A. SB-OUTPUT's sentence *"the document says it itself"*
is a correct description of a CONNECTION grade A (`BIO_Content_Framework_v0_10.md:550-585`),
which legitimately reaches A. The defect is that SB-OUTPUT prints one unlabelled letter over
two different facts, and SB-EVIDENCE's flat sentence, applied to a basis leg, would forbid a
connection grade the framework allows. Corrected rendering at §1.2 R2-e. **The fix is not
"change A to B"; it is "name the axis" — which is R2.**

---

**D-4 · Two incommensurable A–D scales composed into one strength.**

**RESOLVED by R2.** And strengthened by a source fact no pass had quoted: `store.mjs:3441-3443`
comments that `#weakerGrade` *"Reuses the resolution grade rank so the two axes cannot drift"*
— the substitution R2 forbids is stated as a design intent in the code, not merely permitted
by it. Any change here must correct that comment and say why the old one was wrong.

---

**D-5 · A cited inquiry can be reopened, deferred or dismissed with no downstream refusal,
while retiring a cited DOCUMENT is refused.**

> `SB-CORE.md:1149-1150` gives a concluded finding `[ Reopen… ] [ Defer… ] [ Dismiss… ]` while
> `:1145-1148` shows another inquiry resting on it.
>
> `store.mjs:1770` returns `CITED` for `op=retire`; `SB-CORE.md:944-949` models the wording —
> *"2 live citations rely on this document … Withdraw those citations first."*

**RESOLVED, by the corpus's own stated criterion rather than by preference.**

Two mechanisms exist in the design for a leg that moves under a claim: a REFUSAL (`CITED`,
used by the terminal act `op=retire`) and an OBLIGATION (the re-evaluation query, used when a
case is superseded — `BIO_Case_Making_v0_1.md:470-474`). The criterion for which applies is
already written down: `SB-CORE.md:1507` says division copies *"`retire` — the existing TERMINAL
transition, which already refuses on a downstream consequence (`CITED`) rather than on the
actor."*

So: **terminal acts on a cited inquiry REFUSE with `CITED`; reversible acts raise the
re-evaluation OBLIGATION.**

- `dismiss` and `divide` are terminal → **refused** while a live basis leg names the inquiry,
  with the offenders listed and the same remedy wording as the document path.
- `defer` and `reopen` are reversible → **permitted**, and each raises the R7 obligation on
  every inquiry whose basis names them, exactly as supersession does.

This mints no new mechanism and no new refusal name. It changes REC-17.

---

**D-6 · Nothing in the publication gate is a function of strength.**

> `BIO_Case_Making_v0_1.md:159-164`: *"**The tool should make a supported case easy to build and
> an unsupported one hard to state.**"*
>
> `SB-OUTPUT.md:313-331` + `:806-807`: the pre-flight checks capability, key, falsifier, basis,
> bytes, provenance, a non-empty exclusion, and non-byte-identity. **No check is a function of
> strength.**

**NOT RESOLVED — unresolved #2 (§4 Q2).** What IS decided, because it is forced:

**The C3 discharge claims in all three files are WITHDRAWN as unmet.** `SB-CORE.md:1400` claims
C3 is discharged because *"the weakest leg is named from the first citation"*, and
`SB-OUTPUT.md` §0.2 item 2 lists C3 as a constraint its states are checked against. Display is
not cost. C3 stays on the canonical constraint list (§2.4 C-13) marked **UNMET**, and no file
may assert it is met until something in the act costs more when the material is thinner.

R1 supplies a partial and honest answer that should be recorded rather than oversold: after R1
an ungraded leg suspends the chain, so a thin case can no longer publish wearing a letter it
did not earn. That reduces what an unsupported case can CLAIM. It does not make stating one
harder, which is what C3 asks for. Designing the cost is doctrine and Bob's; `CRITIQUE.md`
itself declines to propose a strength floor and gives the reason (`AUDIENCES.md` §5 forbids a
per-audience gate, and a global floor is its own doctrine problem). I decline for the same
reason.

---

**D-7 · Division is a cheaper route to shed an inconvenient leg than severance.**

**RESOLVED IN PART by R4**, with two residuals named rather than papered over.

R4 answers the DISCLOSURE half completely: a published child names its parent and its siblings,
so the reader who sees one half sees that the other exists, and `SB-OUTPUT.md:1358`'s
published-graph restriction is corrected to permit it (§1.4 R4-e).

R4 does NOT answer two things, and I will not invent them:
1. **The friction asymmetry.** Severing one leg costs one reason for that leg; dividing costs
   one reason for the whole act. R4 requires *"an authored reason"* and no more.
2. **The timing.** `SB-CORE.md:1070-1073` offers `[ Divide this… ]` at the exact moment the
   member's strength is being held down by one leg. The file defends the WORDING at `:1083-1085`
   and `CRITIQUE.md` accepts that defence for the wording and not for the timing. R4 is silent.

Both are §4 Q7.

---

**D-8 · A threshold rendering drops the weakest claims, and the weakest claim IS the qualifier.**

> `SB-OUTPUT.md:1119-1121`: *"**H5 · drop CLAIMS, never QUALIFIERS.**"*
>
> `SB-OUTPUT.md:1105-1112`: *"One claim here is at strength D and is not shown in this rendering
> … One claim here cuts against this case and is at strength D, so this rendering drops it"*

**RESOLVED, by derivation from H5 rather than by new rule.**

Under the collapse a claim in a case is a basis leg, and the case's strength IS its weakest leg.
So the leg that DETERMINED a published strength is not a claim in H5's sense — it is the thing
the qualifier is about. **A rendering may not drop a leg that determined either axis's published
strength.** Under R1 a SUSPENDED axis has no determining leg; the suspending leg is then the
reason there is no strength, so it may not be dropped either.

This resolves `CRITIQUE.md` C-15 as a side effect: `undetermined` never needs a position in the
threshold order, because a leg that suspends an axis is a qualifier and is never compared
against a threshold at all.

What remains open is the FORM of a threshold over a pair (§4 Q6) — that is R2's consequence, not
H5's.

---

**D-9 · `published_bundles` upserts, so the index carries one strength per case.**

> `store.mjs:5934-5940` upserts on `bundle_id`; `published_shas` appends; `publishedList()`
> (`:5965`) selects one row per bundle.
>
> `SB-OUTPUT.md:710-713` tells the publisher the truth: *"Publishing again publishes the new
> revision. It does NOT withdraw the one already published: that hash keeps answering."*
> `SB-OUTPUT.md:955-981` shows the reader one row per case.

**BLOCKED ON D-1/Q1, and conditionally decided both ways so the branch costs nothing to take
later.** If revision is permitted, `publishedList()` must enumerate `published_shas` and the
index must show every published hash with its own date and its own strength — otherwise the
surface whose whole guarantee is *"anyone can check those bytes without our cooperation"* cannot
enumerate what it published, which is `SB-OUTPUT`'s own named failure shape (`:770-772`) performed
by the index. If revision is NOT permitted, the current one-row projection is correct and
`SB-OUTPUT.md` S16 is deleted.

---

**D-10 · The exclusion panel enumerates the answer to the question it is asking.**

> `SB-OUTPUT.md:495-516` places beside the empty completeness field a panel of the member's own
> prior **deferral, dismissal and severance** reasons for THIS case.
>
> `BIO_Interaction_Constructs_v0_1.md:258-268`: *"**assembling what a member already wrote is not
> a fabricated attribution; drafting a justification for them is.** … It may not draft, suggest,
> template, or complete."*

**RESOLVED against the panel as drawn. The replacement is NOT decided.**

Decided: **the panel as drawn is refused.** Reason: the generation rule is intact but the
SELECTION does generation's work — the panel's filter (*acts of setting aside, on this case*) is
identical to the question being asked (*what did you set aside on this case*), so what the member
types is a transcription of a system-assembled answer. And C-21.1 cannot see it: it refuses only
a field carried forward byte-identical, so a paraphrase defeats it on every publication. The
control that shapes the *"single surviving reason the case object exists"* cannot rest on a check
a paraphrase defeats.

Also decided, because it is forced by C-9 below: **the exclusion control must let the member NAME
what was left out**, which supplies `inquiry_exclusions.target_id` and simultaneously moves the
member's act from transcribing prose to pointing at material.

Not decided: which permitted assembly panel, if any, sits beside the field. `CRITIQUE.md` offers
two (show it after the field has content; show it without the case filter) and both are weak — the
first is defeated by typing one word, the second produces a panel too broad to be the Zotero
precedent it cites. Choosing a third would be inventing. §4 Q8; blocks UI-17 only.

### 2.2 · CORRECTNESS

---

**C-1 · The collapse deletes the only cycle guard.** **RESOLVED by R3.** See §1.3, and note
R3-d: the guard is drawn on a surface (`SB-EVIDENCE.md` E11) as a pre-flight the member reads,
so removing it is a member-visible change and not only a store change.

---

**C-2 · The queue reads through the exact ungated ops SB-EVIDENCE deletes.**

> `SB-CORE.md:431` reads case titles for group headers through `op=list` and `op=projection`;
> `:1459` builds "what relies on this" from *"the reverse walk … (client-side today,
> `app.html:752-768`)"*.
>
> `SB-EVIDENCE.md:428-430`: *"**Ops deliberately NOT called, with the reason.** `op=list` — it
> bypasses the viewer gate (F-8) … `op=projection` and `op=image` — same class"*.

**RESOLVED for SB-EVIDENCE.** Reason: F-8 is a measured leak against a written requirement
(`Membership v2:471-474`, D-15 §7.9 — an uninvited member must not see a project's existence,
name, references or participants), and SB-CORE's use of the ungated ops is convenience with no
argument attached. A constraint that one file obeys at a cost and another ignores silently is
settled by the one that paid.

**Build consequence, and it is not cosmetic:** the queue is *"the one surface every member opens
by habit"*, and its group headers are project and inquiry titles. **REC-20 and UI-14 gain a
dependency on REC-25.** Neither had one.

---

**C-3 · A group mute is a personal act applied to OBLIGATIONs and FINDINGs.**

> `SB-CORE.md:142` puts `[ Mute this case ]` on a group containing an OBLIGATION, a FINDING and
> a CONDITION.
>
> `NOTIFICATIONS.md:260-266`: *"**CONDITION acknowledged or muted** → PERSONAL only… This is the
> muting-is-personal / dismissing-is-a-record-act rule stated per class, and it is the rule most
> likely to be lost when someone implements a delete button."*

**RESOLVED for NOTIFICATIONS.md.** It is the doctrine source, it scopes the affordance per class,
and it says in the same breath that this is the rule most likely to be lost. SB-CORE lost it.

Corrected: the control is `[ Mute conditions on this case ]` and mute/acknowledge reach the
CONDITION class only. Build consequence: **REC-21**'s `muted_kinds` is restricted to condition
kinds, and its negative control gains a case where muting must NOT remove an OBLIGATION from the
member's queue. The concrete failure it prevents is stated by `CRITIQUE.md` and worth keeping:
a muted case removes an OBLIGATION from the only surface that routes it while `tasks` carries no
per-member mute, so the record goes on believing the question reached a person.

---

**C-4 · `NO_SIGNERS` given a per-member basis it does not have.**

> `SB-CORE.md:1555-1559`: *"reason ⟨NO_SIGNERS⟩ / detail ⟨no active signing key is registered
> **for you**⟩"*
>
> `index.mjs:2631-2634` fires when `facts.signers.length` is zero; `store.mjs:5920-5922` builds
> that list as every active signer of every active member.

**RESOLVED for SB-OUTPUT's wording, and BOTH files are incomplete.** SB-CORE attaches a
fabricated per-member meaning to an instance-wide refusal — D-57 exactly, quoted in SB-CORE's own
§1.1 as the cautionary case. `SB-OUTPUT.md:284-294` gets the instance-wide wording right and does
not cover the member-without-a-key case at all. So the case is designed wrongly once and not
designed once.

Decided: **`NO_SIGNERS` renders instance-wide wording, verbatim in meaning from the plane.** Not
decided: whether a surface can detect the member-without-a-key case before the act. `SB-CORE.md`
§5 already flags it — *"`op=signerlist` is member-class so it probably can, but `whoami` publishes
no relation between a member and their keys, and I did not verify what `signerlist` returns to a
non-admin session."* That is a measurement, not a design question, and it is §4 Q11. **REC-15**
gains the wording correction; it does not gain a second refusal.

---

**C-5 · A third copy of the state machine.**

> `SB-OUTPUT.md:1839` (A8): *"It must read the legal-edge table from the catalogue, **not** hold a
> second copy — `op=dispose` holds a second copy of the focus state machine and that is the hazard
> not to repeat"*
>
> `SB-OUTPUT.md:1764-1766` (S13), twenty-five lines earlier: *"refused in the surface by a
> **pre-flight mirroring the catalogue**"*.

**RESOLVED for A8 — the file contradicts itself and its own rule wins.** No build change: `REC-24`
already says *"reading the legal-edge table from the catalogue and NOT holding a second copy"*,
`REC-19` already exports `STATES` rather than copying it, and `UI-19`'s `accepts-when` already
requires the pre-flight to refuse *"from the CATALOGUE's edge table."* The build order got this
right and only the storyboard is inconsistent.

---

**C-6 · Two of three files label the rung ladder "weight".**

> `BIO_Interaction_Constructs_v0_1.md:77-83`: *"**NAMING COLLISION, corrected 2026-08-01.** …the
> LADDER is **rungs** … and **weight** stays the plane's set-application mode. An act has a rung;
> applying it to a set has a weight."*
>
> `SB-CORE.md:596, :744, :1186, :1238` and `SB-EVIDENCE.md:354, :1265` render `weight  reversible ·
> reasoned · terminal · attested` to the member.

**RESOLVED for the constructs doc.** It is the doctrine source, it corrected the collision the same
day, and the correction cites the precedent (D-8's vocabulary drift) for why one word for two ideas
is expensive here specifically. Two files reintroduced it **in member-facing UI strings**, which is
where undoing it costs most.

Corrected: every member-facing ladder line reads `rung`. `SB-CORE.md:744-746`, which prints both
meanings four lines apart, is the clearest single instance. No build change — `REC-19` publishes
`weight` and `rung` as separate fields already, and `FW-14` assigns rungs.

---

**C-7 · `cite` carries two different rungs inside one file.**

> `SB-EVIDENCE.md:354` (E11): `WEIGHT   reversible · [reasoned] · terminal · attested`, with a
> required authored field at `:356-359` — *"Why these support the work 0/280 — you write this"*.
>
> `SB-EVIDENCE.md:710` (D10): `[ Cite into an inquiry ] reversible`.

**RESOLVED to `reversible`, from the plane, and BOTH the rung and the field are wrong at `:354`.**

`FW-14`'s stated method is to *"derive the rung from what the code already does rather than from
taste"*, and its rule is *"every op whose store refuses `NO_REASON` is already `reasoned`."*
Verified in source this pass: `store.mjs`'s `cite()` (`:2068`) has no `NO_REASON` arm. What it has
is an OPTIONAL `note`, refused as `BAD_NOTE` at over 200 characters or containing a quote,
backslash or newline (`:2085-2090`). `op=sever` refuses `NO_REASON` (`:1407`); `op=cite` does not.

So: **rung `reversible`; the justification field is the plane's optional `note`; and its budget is
200 characters, not the 280 E11 draws.** The asymmetry is coherent doctrine rather than an
oversight — adding a leg is disclosed by its presence, removing one hides it, so removal costs a
reason and addition does not.

Build consequence: **UI-20**'s `accepts-when` gains an assertion that the note is optional and
capped at 200.

---

**C-8 · `report` weight described with `per-item` semantics.**

> `SB-EVIDENCE.md:350-353`: *"It is weight `report`, not all-or-nothing: 10 will be cited, **1 will
> be retained with the reason above.**"*
>
> `NOTIFICATIONS.md:238-244`: `report` *"proceeds and says what moved"*; `per-item` *"each item
> independently succeeds or is RETAINED WITH A REASON"*. `SB-CORE.md:461` (GAP-Q5): `per-item`
> does not exist in the plane.

**RESOLVED, and DOWNGRADED — the mechanism is right and the sentence invokes a weight that does not
exist.** E11's own pre-flight has already excluded the severed edge before the act runs (its commit
button reads `[ Cite 10 documents ]`), so nothing is being retained BY THE ACT. The wording
describes a `per-item` outcome for something the pre-flight handled.

Corrected wording: *"This act proceeds and reports what moved. The 11th was excluded by the
pre-flight above and is not part of this call."* No build change; `HOLE-2` (per-item does not exist)
stays deferred and named, correctly.

---

**C-9 · `inquiry_exclusions.target_id` cannot be populated by the control meant to populate it.**

> `SB-OUTPUT.md:809-810` (P8): *"only the indexed projection makes it **auditable**, and without the
> index *'which published cases excluded this document'* cannot be asked at all"*
>
> The control (`SB-OUTPUT.md:495-516`) is a single free-prose textarea, `0 / 2000`. It never asks the
> member to name a document, an inquiry or an id.

**RESOLVED: the control gains a picker; P8's argument stands.** Reason: P8's auditability query is
**invariant 7's only mechanical enforcement point** — `BUILD-ORDER.md:96` (REC-14) says so in the
item itself. Withdrawing it leaves invariant 7 with nothing checkable at the case level, and the
alternative on offer is a table that degrades to one prose row per case, which is exactly what P8
argued against. The picker is over the member's OWN material, which is permitted assembly under
`Constructs:250-260`, and it partly answers D-10 by moving the act from transcription to selection.

`target_id` stays NULLABLE: an exclusion may legitimately name something not in the record (*"a
records request to the City Clerk is still outstanding"* — `SB-CORE.md:1296`). Per-row it is
`target_id` OR prose, never neither, mirroring the capture-or-testify structure `REC-24` already
uses for `correspondence`.

Build consequence: **REC-14** (the row shape and its refusal) and **UI-17** (the control).

---

**C-10 · The queue names the platform ceiling; the capture surfaces forbid the word.**

> `SB-CORE.md:137`: *"A capture stopped at this **platform's ceiling** with 14 parts outstanding."*
>
> `SB-EVIDENCE.md:657-659`: *"No count of subrequests, **no ceiling**, no runtime — the
> `capture-honesty` vocabulary guard forbids all of those words on this exact banner (`UI-B §6.1`)"*.

**RESOLVED for SB-EVIDENCE.** Decisive reason: a guard exists in the suite, so SB-CORE's row would
FAIL a live check if built, and SB-CORE claims C4 discharge on that exact row (`:387`). The
NOTIFICATIONS class is right — an actionable CONDITION earns an item — and only the wording is
wrong. Corrected: *"A capture of this document did not finish. 14 parts are outstanding and your
action can complete it."* Build consequence: **UI-14**'s `accepts-when` gains the vocabulary guard.

---

**C-11 · Action creation deleted by one file, assumed by another.**

> `SB-EVIDENCE.md:841`, `:1105`: *"rather than keep a surface-side copy of the seven `action_kind`
> values that live in `bio-checks.mjs:1288`, **the type does not appear until an op publishes them**"*
>
> `SB-OUTPUT.md` O3 presumes actions exist and are created; its constraint list (`:70-89`) **omits
> the producer-published-options rule** (which is why nothing in O3 trips over it — C-13).

**RESOLVED: both are right, in sequence, and the disagreement dissolves once REC-19 exists.** Before
`op=affordances`, the Add entry for an action is ABSENT (SB-EVIDENCE's rule, obeyed at a cost, which
`CRITIQUE.md` §4 correctly identifies as the only evidence a constraint is real). After REC-19
publishes `action_kind` and `risk_tier`, it is present and its options come from the producer.

No build change: `UI-15` ships the entry absent (as `SB-EVIDENCE` A2 draws it) and `REC-19` +
`UI-19` restore it. The correction is to SB-OUTPUT's constraint list, not to any item.

---

**C-12 · DEC-10's grouping argument does not survive the collapse.**

> `BIO_Interaction_Constructs_v0_1.md:96-102`: *"**It needs no second axis.** The relevance filter
> that decides an event is worth notifying at all is 'does this instance connect to a Focus or
> Project', and the aggregation key is that SAME connection."*
>
> `SB-CORE.md:459` (GAP-Q3) specifies only `case TEXT` and defers the population rule to P-88,
> MISSING.

**NOT RESOLVED — unresolved #3 (§4 Q3).** The ruling's premise was that a focus is a LEAF. Under the
collapse an inquiry's basis may be other inquiries, so "connects to" is transitive and one event
legitimately belongs to every ancestor of the node it lands on. The two candidate keys have
symmetric, real costs: *nearest ancestor* means a member working the root question never hears about
its legs; *every ancestor* means one event appears in N groups, breaking DEC-10's own *"one standing
entry per (member, case)"*.

Choosing between them is designing the attention layer's semantics, and it is Bob's — DEC-10 is his
ruling and its premise changed. Blocks **REC-20** (the `case` key's population rule, P-88) and
therefore **UI-14** and **REC-21**. What would settle it is in §4 Q3.

---

**C-13 · The three files do not share a constraint list.**

> `SB-CORE.md:29-35` — five. `SB-EVIDENCE.md:31-37` — five, **C3 absent**. `SB-OUTPUT.md:70-89` —
> seven, **producer-options and classifiable-complication both absent**.
>
> *"The omissions are not random: each file drops the constraint that would most have complicated
> its own surfaces."*

**RESOLVED: the union is the constraint set.** Reason: none of the three files argues for dropping
anything; each simply did not carry it. An omission with no argument does not defeat a constraint
another file states and obeys.

**THE CANONICAL LIST. Ten. Any surface designed after this date is answerable against all ten.**

| # | constraint | source | status |
| --- | --- | --- | --- |
| 1 | Never prefill, draft, template, suggest or complete. Assembling a member's OWN prior words is permitted; the assembly is visually OUTSIDE the field | `Constructs:250-268` | held everywhere (`CRITIQUE` §4); the one hit is D-10's SELECTION |
| 2 | `undetermined` is STATED and rendered IDENTICALLY everywhere | `Constructs:306-324` | shape settled at C-14 below |
| 3 | A SUPPORTED case is easy to state; an UNSUPPORTED one is hard | `Case_Making:159-164` | **UNMET** — D-6 / §4 Q2 |
| 4 | A classifiable technical complication is never surfaced as a member's choice | `UI-PLAN` | held; C-10 is the wording breach |
| 5 | Options come from the PRODUCER, never a surface-side map | `NOTIFICATIONS.md` rule 1 | held in two files; REC-19 makes it enforceable |
| 6 | A capability a member lacks is ABSENT, not greyed | `Membership v2 §5` | held everywhere; narration open (U-1) |
| 7 | No per-audience relaxation of the RATIFICATION gate; a threshold is on a RENDERING | `AUDIENCES.md` §5 | held |
| 8 | A rendering's threshold and exclusions travel IN-BAND, in every rendering | `AUDIENCES.md` H4 | held |
| 9 | A rendering may drop CLAIMS and may never drop QUALIFIERS — **including the leg that determined a published strength** | `AUDIENCES.md` H5 + D-8 above | corrected here |
| 10 | A control that lets a member pass a gate by inventing a value is the defect class | D-130, D-97 | held; REC-23 closes the live instance |

---

**C-14 · The UNDETERMINED primitive has three shapes.**

> `SB-EVIDENCE.md:40-48`: three lines always — the word, a dated `basis`, a `retry` line.
> `SB-CORE.md:186-196`: two lines, no retry. `SB-OUTPUT.md:1141-1148`: one `ⓘ` paragraph.
>
> `SB-CORE.md:1495`: *"**I don't know** how the second should render, and I will not invent a second
> treatment for a primitive whose value is uniformity"*.

**RESOLVED for SB-EVIDENCE's three-line primitive, and SB-CORE's objection does not bite.**

SB-CORE refuses to invent a SECOND TREATMENT for the D-129 split. SB-EVIDENCE does not invent one:
it renders **the same three lines always**, with the third line driven by the plane's own reason
where the reason is one of the named ones and reading `retry · undetermined` where it is not
(`:44-48`). One shape, uniformly. That satisfies the constraint SB-CORE was protecting while
carrying the information SB-CORE's two-line version drops. SB-EVIDENCE itself calls it *"honest and
ugly, and the ugliness is the argument for closing D-129"* — an accurate description of a stopgap,
which is what the corpus needs until D-129 lands.

Build consequence: **UI-11, UI-14, UI-17, UI-18, UI-19** all render it, and they render it from ONE
shared component. Five surfaces each drawing the primitive is how three shapes became three shapes.

---

**C-15 · Threshold comparison undefined for `undetermined`.** **RESOLVED as a side effect of R1 +
D-8**: a leg that suspends an axis is a QUALIFIER under H5 and is never compared against a
threshold. It is always shown. See D-8.

---

**C-16 · Two entry points mint one object with different required fields.**

> `SB-CORE.md:360-374` (Q15, Ask): *"it takes a question and nothing else — no type choice, no
> counterparty, no risk tier"*, one authored field, `reversible`.
>
> `SB-EVIDENCE.md:876-912` (Add): a type radio, a **Title**, and *"What do you know? 0/2000"* which
> gates the submit — *"disabled: tell us what you know about it first"*.

**RESOLVED for SB-CORE.** Two independent reasons, and both are doctrine rather than taste:

1. **The collapse's own stage table says `open` requires nothing** (`Case_Making:331-337`,
   `CRITIQUE` §4: *"`open` requires nothing"*). SB-EVIDENCE's gate is a per-state entry requirement
   on `open` that no stage table carries.
2. **`CLAUDE.md`: *"A gate that pressures someone into inventing one is a bug in the gate."*** A
   submit button disabled until the member writes what they know pressures a member with a real
   question and no answer into writing something. That is D-97's pressure at the intake gate and
   D-114's at the publication gate, arriving a third time at the ask gate — exactly the reasoning R1
   uses to refuse flooring.

Consequence, flagged rather than designed: the object has one authored field, the question, and
`## Question` is its canonical heading. Where a title is needed (`bundles.title`,
`published_bundles.title`), it is DERIVED from the question and never separately authored. The
derivation rule (truncation? first sentence?) is a small build decision inside **REC-10**, named
there so it is not invented at the keyboard.

---

**C-17 · The two files draw different applications.**

> `SB-CORE.md:78-90`: a rail of Queue · Record · Search · Subjects · Inquiries · Projects · Review ·
> Monitoring · Actions · + Ask.
>
> `SB-EVIDENCE.md:152` (E-g) **deletes** the Focuses, Projects and Monitoring list screens — *"one
> finder with saved scopes. DELETE `renderFiltered`"* — and `:852-862` draws Home · The record ·
> Tasks · Search · Subjects · Review.

**RESOLVED, and NEITHER rail is right.** SB-EVIDENCE's deletions carry arguments and are already
enacted in build items (`UI-21`: `renderFiltered` deleted, `SEARCH_SCOPES` → 0; `UI-16`: a project
ROW opens a workspace, the Projects arm deleted), so SB-CORE's Inquiries/Projects/Monitoring entries
go. But SB-EVIDENCE's rail predates JG-10 and `UI-14`, which collapse Home + Tasks + Proposals into
ONE surface, and it has no Actions entry, which `UI-19` adds (P-52).

The reconciled rail, every entry forced by a build item:

    Queue · The record · Search · Subjects · Review · Actions · + Ask
    ─────────────────────────────────────────────────────────────────
    View the public record ↗   (a real address, per UI-18)

Queue from `UI-14` (three screens become one). Search from `UI-21` (one finder). Subjects and Review
retained because `UI-13` and `UI-4` need them. Actions from `UI-19`. `+ Ask` from `SB-CORE` Q15,
which C-16 just upheld. No list screens.

### 2.3 · USABILITY

**U-1 · Absence is explained, deleted, and forbidden.**

> `SB-CORE.md:350-351` prints a sentence per surface. `SB-EVIDENCE.md:840` deletes it as F-7 and at
> `:1494-1497` records that it does not know whether the deletion helps. `SB-OUTPUT.md:231-236`
> forbids it — *"no greyed control and no explanation"*.

**PARTLY RESOLVED.** Settled and not in dispute: **the CONTROL is absent in all three files** — no
disabled control appears in ten storyboards, and each removes the ENTRY POINT rather than the button,
naming the same reference implementation (`setup.mjs:624`/`:463`). Not settled: whether the absence
is NARRATED. `Membership v2` §5 settles only that the capability is absent. Three files each guessed;
SB-EVIDENCE says so honestly. §4 Q12, blocking nothing.

**U-2 · `S1` means two different surfaces.** **RESOLVED — already fixed by BUILD-ORDER and needing
only propagation.** `SB-CORE`/`SB-EVIDENCE` use `S1` for the QUEUE; `SB-OUTPUT.md:231` uses `S1` for
a ceremony state, and `S7` collides likewise. `BUILD-ORDER.md` already namespaces every reference by
surface (`S3-I2`, `O1-S7`, `O2-S2`). That convention is canonical. No build change.

**U-3 · The attention layer's ordering is undrawn.** `SB-CORE.md:1671-1674`: *"every frame in §1 is
drawn in an arbitrary order for that reason."* **NOT RESOLVED, and it blocks nothing**: `UI-14` can
ship with longest-waiting as an explicit, labelled proxy, which is what today's Home already does and
says (`app.html:4975`). §4 Q13.

### 2.4 · Found in this pass, beyond CRITIQUE.md

| # | contradiction | resolution |
| --- | --- | --- |
| **N-1** | `SB-EVIDENCE.md` E11's cite pre-flight shows the member `NOT_INFORMATION` — the refusal the collapse must remove, and the record's only cycle guard (`store.mjs:2098-2104`) | §1.3 R3-d. The pre-flight becomes a citability check plus a cycle check. |
| **N-2** | SUSPEND means opposite things in R1 and in `SB-OUTPUT` §5.1 / `BUILD-ORDER` HOLE-5 / REC-12 | §1.1 R1-h. R1's sense is canonical. The most dangerous collision in the corpus, because REC-12 implements it. |
| **N-3** | REC-12 is internally inconsistent: *"reuse `#weakerGrade` unchanged"* vs *"ANY leg with `grade IS NULL` yields `null`"* | §1.1 R1-j. The null-check half is right. |
| **N-4** | `store.mjs:3441-3443`'s comment states the two-axis substitution as a DESIGN INTENT: *"Reuses the resolution grade rank so the two axes cannot drift"* | §1.1 R1-m. Correct the comment and say why the old one was wrong. |
| **N-5** | `SB-CORE.md:1229`'s division preview computes one scalar per child | §1.2 R2-c. A pair per child. |
| **N-6** | `SB-EVIDENCE.md:354` prints a `0/280` budget for a field the plane caps at 200 (`store.mjs:2085-2087`) | §2.2 C-7. 200, and optional. |
| **N-7** | `REC-16` decides silently that `divided` is a STATE, while `SB-CORE` §5 records *"whether `divided` should be a state or a disposition"* as unresolved | Recorded as §4 Q10. REC-16's choice is defensible (the parent was malformed, not declined) and it should be raised as a DEC rather than shipped as settled. |
| **N-8** | `SB-EVIDENCE`'s primitive line 3 is `retry`; R1's suspended chain has no retry semantics — looking again will not settle it, only grading the leg will | Recorded, NOT decided. For a suspended axis the third line must say what would settle it, and phrasing it is §4 Q9's territory. Flagged so no session invents it in passing. |

---

## §3 · THE BUILD ORDER, RE-DERIVED

Same queue format, same six fields (`milestone` · `scope` · `behind-interface` · `depends-on` ·
`accepts-when` · `added`). **35 items — no item added, none removed.** Every correction landed
inside an existing item, which is itself a finding: R1–R4 change what the items DO and not what
work exists.

**17 CHANGED · 18 UNCHANGED.** Changed items are given in full below. Unchanged items carry
forward from `BUILD-ORDER.md` §2 verbatim and are listed at §3.3 so a reader can confirm they were
checked rather than skipped.

The M9 and M10 rung drafts at `BUILD-ORDER.md:21-49` also change — M9's acceptance clause must
read *"states BOTH derived strengths — capture and connection — each as its own weakest leg by
name; never composed into one letter; and `undetermined` on an axis suspends that axis and names
the leg"* (§1.2 R2-k). M10's is unchanged.

### 3.1 · CHANGED BY R1–R4 — eleven items

---

**REC-11 · queued** — CHANGED by **R2** (axis on the leg) and **R3** (DAG at write)

- **milestone:** M9
- **scope:** as `BUILD-ORDER.md:72`, plus two additions and one correction. **(1) R2 — the leg
  records its AXIS.** `inquiry_basis` gains the axis of the grade it carries, because the axis is
  NOT derivable from `target_type`: `SB-OUTPUT.md:432-435` places connection grades on `INFO-`
  legs. Whether that is a `grade_axis ∈ capture|connection` column or two nullable grade columns
  is a shape decision — **RAISE A DEC and ship the single-column form**, on the ground that a leg
  asserts one grade for one reason and two columns would create a place to state two grades where
  the doctrine says a leg has one. **(2) R3 — the basis graph is a DAG, enforced at WRITE.** A
  `basis` write whose target would close a cycle is refused, and the refusal names the path it
  found. This is not optional and it is not deferrable: `store.mjs:2098-2104`'s comment records
  that the record's ONLY acyclicity protection is a side effect of `op=cite` refusing
  non-`information` members, and this item is what removes that refusal's reach. **(3)** `grade`
  stays NULLABLE and NULL still means undetermined and STATED — unchanged, and now load-bearing
  for R1.
- **behind-interface:** I5
- **depends-on:** REC-10
- **accepts-when:** as before, plus — a suite in which an inquiry citing itself is refused by name;
  a three-node cycle A→B→C→A is refused at the write that would close it, with the path named; and
  a leg carrying a connection grade on an `INFO-` target reads back with its axis intact. Negative
  control — remove the cycle check and `op=promote` accepts A→B→A, and the strength derivation
  does not terminate.
- **added:** 2026-08-01 · BOB

---

**REC-12 · queued** — CHANGED by **R1**, **R2** and **R3**. *The most changed item in the file.*

- **milestone:** M9
- **scope:** **STRENGTH at inquiry altitude, as a PAIR, suspended by an ungraded leg, over a
  bounded DAG.** Derive on read by walking `inquiry_basis`. **(1) R2 — two results, never one.**
  Compute the weakest CAPTURE grade over the evidentiary legs and the weakest CONNECTION grade
  over the inferential legs, by the leg's recorded axis. **Nothing averages, mixes or collapses
  them, and no caller may reduce them to one letter.** A leg to another inquiry contributes that
  inquiry's derived PAIR, per axis. **(2) R1 — `#weakerGrade` MUST NOT be reused unchanged.**
  `store.mjs:3444-3446` ranks an unknown with `|| 0`, i.e. **below grade D — below a member's
  signed testimony**. An axis with any NULL-graded leg yields `null` + `determined: false` for
  that axis and NAMES the leg; the null is short-circuited before any rank comparison happens. In
  the same turn, correct the comment at `store.mjs:3441-3443` — *"Reuses the resolution grade rank
  so the two axes cannot drift"* — which states the substitution R2 forbids as a design intent,
  and say in the comment why the old one was wrong. **(3) R3 — the walk carries a DEPTH BOUND**
  whose exhaustion reports `undetermined` for that chain and names the depth, which is R1's shape
  and not an error. **(4) VOCABULARY, and a worker will get this wrong without it: SUSPEND means
  the chain has NO computed strength on the affected axis.** The behaviour `SB-OUTPUT.md:1150-1156`
  calls "suspend" — grading on the determined legs and noting the ungraded one — is **REFUSED**;
  it is the laundering R1's first bullet forbids. The former instruction *"FLAG AND DO NOT DECIDE
  … ship SUSPEND"* is deleted: R1 decided it. Projection as a CACHE and never the authority is
  unchanged, but the columns become per-axis.
- **behind-interface:** I5
- **depends-on:** REC-11
- **accepts-when:** `cd bio-plane && npm run test:battery` green with a suite showing (a) a mixed
  basis reading TWO strengths, each naming its own weakest leg, and no code path producing a
  single composed letter; (b) an inquiry whose leg is another inquiry inheriting that inquiry's
  pair per axis; (c) one NULL-graded leg suspending ITS axis and naming the leg, while the other
  axis still reads; (d) a chain deeper than the bound reporting `undetermined` and naming the
  depth, not throwing. `npm run test:coverage` --strict exit 0. Negative controls, all four
  required — force the composition to take the strongest leg and the weak-link assertions fail;
  **pass a null grade into the rank comparison and assert the suite fails because the chain reads
  a grade below D**; compose across the two axes and the suite fails naming the axes it mixed; and
  remove the depth bound and a cyclic basis (which REC-11 now refuses at write, so construct it
  directly in the store) does not terminate.
- **added:** 2026-08-01 · BOB

---

**REC-14 · queued** — CHANGED by **R2** (per-axis inheritance), **C-9** (the exclusion picker),
**R4** (reserve the disclosure)

- **milestone:** M10
- **scope:** as `BUILD-ORDER.md:96`, with three changes. **(1) R2 — C-21.2 becomes per-axis:** a
  basis leg whose target is a `published` inquiry carries `grade_source: 'inherited'` and a grade
  equal to that case's frozen strength **on the same axis**, refused if stronger **on either
  axis**. A scalar check would let a case inherit an A connection grade from a case whose A was a
  capture grade. **(2) C-9 — `inquiry_exclusions` rows are NAMEABLE.** `target_id` stays NULLABLE
  and each row carries `target_id` OR prose and never neither — the same capture-or-testify
  structure REC-24 uses for `correspondence`. Without this, P8's justifying query *"which
  published cases excluded this document"* has no source and `inquiry_exclusions` degrades to the
  one-prose-row-per-case table P8 argued against, taking invariant 7's only mechanical enforcement
  point with it. **(3) R4 — the published frontmatter reserves the division disclosure** (a
  child's parent id and sibling ids) even though no producer exists until REC-16, so the published
  shape does not change under readers after cases exist. At `op=publish` BOTH derived strengths
  are stamped into the bytes. `published` stays reachable only from `concluded`; whether it is
  TERMINAL is **§4 Q1 and is NOT settled by this item** — ship terminal, which is
  `DATA-MODEL.md:433`'s position and the more conservative branch, and raise the DEC.
- **behind-interface:** I5
- **depends-on:** REC-12, REC-13
- **accepts-when:** as before, plus — an exclusion row naming a document is readable by
  `SELECT … WHERE target_id = ?` as one indexed lookup; a row with neither a target nor prose is
  refused by name. Negative control, both required — a basis leg citing a grade-B-capture published
  case at capture grade A fails C-21.2, **and** a leg citing a case whose CONNECTION is C at
  connection grade B fails C-21.2 independently. If a single scalar comparison passes both, the
  inheritance rule has composed the axes R2 forbids composing.
- **added:** 2026-08-01 · BOB

---

**REC-16 · queued** — CHANGED by **R4** (the child names its parent and its siblings)

- **milestone:** M10
- **scope:** as `BUILD-ORDER.md:112`, plus R4's disclosure, which is the item's point and not a
  detail. **Each child records its PARENT id AND its SIBLING ids**, authored in `bundle.md` and
  projected through the ordinary promote path; C-6.1's new `supersedes` requirements include the
  sibling set, not only the reason and a resolvable target. The reasoning is R4's and it inverts
  the argument the design makes for division: division was justified as the mechanism that stops
  weakest-link forcing overclaim-or-silence, and **the abuse is the same mechanism — dividing is a
  cheaper way to shed a finding that cuts against you than severing it**, and a published child
  that discloses neither parent nor siblings defeats invariant 7 with a housekeeping operation.
  Note what R4 does NOT require, so no session adds it by inference: **there is no per-leg reason.**
  One authored reason for the division, as `SB-CORE.md:1233-1236` draws it. The friction asymmetry
  with severance is answered by disclosure, and the residual is §4 Q7. Refusals unchanged plus
  `NO_SIBLING_DISCLOSURE` on a child that omits it. Author-scoped with the act attributed, DEC
  raised — unchanged.
- **behind-interface:** I3
- **depends-on:** REC-13
- **accepts-when:** as before, plus — each child names its parent and every sibling, and the
  parent records where every leg went including every `cuts_against` leg. Negative control —
  publish a child that omits a sibling and the suite fails, because a reader who can see one half
  of a divided inquiry must be able to see that the other half exists.
- **added:** 2026-08-01 · BOB

---

**REC-18 · blocked** — CHANGED by **R2**: the blocker is now HALF the size it was

- **milestone:** M9
- **scope:** as `BUILD-ORDER.md:128`, with the blocker narrowed. **R2 splits D1 into two questions
  and answers one of them.** A document leg has a CAPTURE grade, which the record already holds
  from the capture itself and which needs no ruling — `SB-EVIDENCE.md:602-607` and `:908-910` state
  it. It also has a CONNECTION grade, which is what D1(b) was actually describing (*"the STRONGEST
  resolution of that document's captures to the inquiry's subject entity"*) and which is the half
  that needs Bob. So: **the capture half ships with REC-11/REC-12 and is not blocked at all**; only
  the connection half waits on the ruling and on UI-13's registry write surface.
- **behind-interface:** I5
- **depends-on:** REC-11, UI-13
- **accepts-when:** as before, restricted to the connection axis; plus a suite asserting that a
  leg's capture grade comes from the capture record and is never authored by a caller.
- **added:** 2026-08-01 · BOB

---

**REC-22 · queued** — CHANGED by **R4** (name-not-serve for division edges) and **D-1** (projection
only)

- **milestone:** M10
- **scope:** as `BUILD-ORDER.md:180`, with `published_edges` corrected. The restriction *"restricted
  to targets that are themselves published"* is **too strong for R4**: a divided parent is TERMINAL
  and never published, and a sibling may not be published, so as written the restriction makes R4's
  disclosure impossible on the exact surface R4 was written for. Corrected: **published targets for
  edges the surface may SERVE; parent and sibling ids of a division admitted as edges the surface
  may only NAME.** That distinction is already this item's own (*"A basis leg that is NOT itself
  published must be distinguishable as a leg the page can only NAME, never one it can serve"*), so
  it reuses a mechanism rather than adding one. `op=publishedcase` returns BOTH frozen strengths
  (R2) and the suspension with its named leg where an axis is suspended (R1).
- **behind-interface:** I3
- **depends-on:** REC-14, **REC-16** *(new — R4's disclosure has no producer without it)*
- **accepts-when:** as before, plus — a published child's page names its parent and its siblings by
  id while serving neither, and an unpublished sibling's bytes are NOT reachable from
  `op=publishedbytes`. Negative control — admit a name-only edge to the served set and a working
  bundle becomes fetchable by an anonymous caller.
- **added:** 2026-08-01 · BOB

---

**UI-11 · queued** — CHANGED by **R1**, **R2**, **C-14**

- **milestone:** M9
- **scope:** as `BUILD-ORDER.md:264`, with the strength panel redrawn. **TWO strengths, never one**
  — capture and connection, each naming its own weakest leg with its own sentence, no score, no
  percentage, no average, no bar, and **no rendering that reduces them to one letter**. An
  ungraded leg SUSPENDS ITS AXIS and names the leg; the other axis still reads. The word
  `undetermined` is the rendered value and SUSPEND is the name of the behaviour. The UNDETERMINED
  primitive is the **three-line shape** (`SB-EVIDENCE.md:40-48`) rendered from ONE shared component
  — five surfaces each drawing it is how three shapes became three shapes. Grade renders as HOW a
  leg was established and never how credible it is, per axis. Still NO ACT BAR this turn.
- **behind-interface:** I3
- **depends-on:** REC-12, UI-10
- **accepts-when:** `node civicos-ui/test/run.mjs` green with a harness showing a mixed basis
  reading two strengths with two named legs; a `cuts_against` leg present and counted on its own
  axis; one ungraded leg suspending its axis while the other still reads; and a read-only
  credential seeing the whole page. Negative controls — render the two strengths as one letter and
  the harness fails; average the legs and it fails; render a suspended axis as a grade and it
  fails.
- **added:** 2026-08-01 · BOB

---

**UI-12 · queued** — CHANGED by **R2** (the live preview is a pair)

- **milestone:** M9
- **scope:** as `BUILD-ORDER.md:272`. The one change is in HARD 2's largest reduction: *"the
  strength consequence renders LIVE as the member selects"* now renders **the PAIR** live — a
  Grade C capture drops the capture axis to C, visibly, and leaves the connection axis alone.
  Watching the two axes move independently is the only mechanism in the design that teaches R2 to
  a non-technical member without prose, and a single-letter preview would teach the substitution
  R2 forbids. Everything else — options from `op=affordances`, the empty conclusion, the falsifier
  as a selection first, deleting `DISPOSITIONS` — unchanged.
- **behind-interface:** I3
- **depends-on:** REC-13, REC-19, UI-11
- **accepts-when:** as before, plus — selecting a Grade C capture leg moves the capture axis and
  not the connection axis. Negative control — render one composed letter in the live preview and
  the harness fails.
- **added:** 2026-08-01 · BOB

---

**UI-17 · queued** — CHANGED by **R1**, **R2**, **C-4**, **C-9**, **D-10**

- **milestone:** M10
- **scope:** as `BUILD-ORDER.md:312`, with four changes. **(1) R1/R2 — step 2 (WHAT THIS RESTS ON)
  shows the PAIR and shows a suspended axis as suspended.** `SB-OUTPUT.md:425`'s frame — publishing
  at `▪ C ▪` with an ungraded leg in the same list — is REFUSED; the corrected frame is at §1.1
  R1-d and §1.2 R2-d. Every leg's grade is labelled by axis; **no leg displays grade A for a direct
  CAPTURE**, and the suite has a live negative control on that exact string (`CLAIMS.md:410`).
  **(2) C-9 — step 3's control gains a picker over the member's own material**, so an exclusion can
  NAME what was left out and `inquiry_exclusions.target_id` has a source. **(3) D-10 — the assembly
  panel as drawn is REFUSED**: filtered to this case's deferrals, dismissals and severances, its
  SELECTION does generation's work, and C-21.1 cannot see a paraphrase. **This item ships step 3
  WITHOUT the panel** — the field, empty, plus the picker — and the panel's permitted replacement
  is §4 Q8. Shipping no panel is the conservative branch: it removes an assembly the rule may not
  permit and removes nothing the member authored. **(4) C-4 — `NO_SIGNERS` renders instance-wide
  wording**, never *"for you"*. Op order, the sha-changes-so-signature-follows argument, `/sign` in
  a new tab, and Surface B's demotion are unchanged.
- **behind-interface:** I3
- **depends-on:** REC-15, UI-11
- **accepts-when:** as before, plus — step 2 shows two strengths and a suspended axis by name; an
  exclusion naming a document is retrievable by `target_id`. Negative controls — publish with an
  ungraded leg and a composed letter appears, and the harness fails; render `grade A` beside a
  direct capture and it fails; render `NO_SIGNERS` with per-member wording and it fails.
- **added:** 2026-08-01 · BOB

---

**UI-18 · queued** — CHANGED by **R1**, **R2**, **R4**, **D-8**, **C-15**

- **milestone:** M10
- **scope:** as `BUILD-ORDER.md:320`, with three changes. **(1) R1/R2 — the index and the case show
  BOTH strengths**, and a suspended axis is shown as suspended with its leg named, in the index row
  as well as on the case. **(2) R4 — a published child NAMES its parent and its siblings**, as
  references the page can name and cannot serve, so a reader who can see one half of a divided
  inquiry can see the other exists. **(3) D-8/C-15 — a threshold may not drop a leg that DETERMINED
  either axis's published strength, nor a leg that SUSPENDED an axis.** Under the collapse a claim
  is a basis leg and the case's strength IS its weakest leg, so a threshold that drops the
  determining leg drops the thing that produced the qualifier it preserves — the reader sees a
  strength and no leg that could have produced it. That leg is a QUALIFIER under H5 and is always
  present. `undetermined` therefore never needs a position in the threshold order. Everything else
  — in-band block, print-first, four forbidden affordances, the Verify wire — unchanged.
- **behind-interface:** I3
- **depends-on:** REC-22, UI-17, **REC-16** *(new — nothing produces the parent/sibling disclosure
  without it)*
- **accepts-when:** as before, plus — a threshold rendering that would drop a determining leg keeps
  it and says why; a published child names its parent and siblings; both strengths survive the print
  stylesheet and the copied selection. Negative controls — drop the determining leg at a threshold
  and the harness fails; publish a child with no parent named and it fails; compose the two
  strengths into one letter anywhere on the page, including in print, and it fails.
- **added:** 2026-08-01 · BOB

---

**UI-20 · queued** — CHANGED by **R3** (the pre-flight's citability and cycle checks) and **C-7**
(the rung and the field)

- **milestone:** M9
- **scope:** as `BUILD-ORDER.md:336`, with the cite pre-flight corrected. **(1) R3 — `NOT_INFORMATION`
  is the wrong check on this surface now.** `SB-EVIDENCE.md:335-360` draws it as a member-visible
  pre-flight line, and `store.mjs:2098-2104` records that this refusal is also the record's only
  cycle guard. Under the collapse an `INQ-` member is the POINT, so the pre-flight checks that every
  member is CITABLE (`information` or `inquiry`) **and that no member would close a cycle**, naming
  the path. **(2) C-7 — the rung is `reversible`, from the plane, not `reasoned`.** Verified this
  pass: `store.mjs`'s `cite()` has no `NO_REASON` arm; what it has is an OPTIONAL `note` refused as
  `BAD_NOTE` over 200 characters (`:2085-2090`). `op=sever` refuses `NO_REASON` (`:1407`) and
  `op=cite` does not, so FW-14's derivation rule gives `reversible`. `SB-EVIDENCE.md:354`'s
  `[reasoned]` rung with a REQUIRED `0/280` field is wrong twice — the rung and the budget.
  `SB-EVIDENCE.md:710`'s `reversible` is right. The `report` semantics sentence is corrected per
  C-8.
- **behind-interface:** I3
- **depends-on:** REC-11, REC-19, UI-11
- **accepts-when:** as before, plus — citing an `INQ-` onto an inquiry succeeds; a cite that would
  close a cycle is refused before it runs, naming the path; the note is optional and refused over
  200 characters. Negative controls — as before, plus remove the cycle check from the pre-flight and
  the harness reaches the plane with a cyclic cite.
- **added:** 2026-08-01 · BOB

### 3.2 · CHANGED BY INTER-FILE CONTRADICTIONS, not by R1–R4 — six items

---

**REC-10 · queued** — CHANGED by **C-16** (one authored field; the title is derived)

- All of `BUILD-ORDER.md:64` stands. Added: **the inquiry has ONE authored field, the question.**
  `SB-EVIDENCE.md:876-912`'s separate Title and its submit-gating *"What do you know?"* are refused
  (§2.2 C-16): the collapse's stage table says `open` requires nothing, and a gate that pressures a
  member into writing what they do not know is `CLAUDE.md`'s named bug-in-the-gate arriving a third
  time. `bundles.title` is DERIVED from `## Question` and never separately authored; **name the
  derivation rule explicitly in the item's commit** rather than choosing it at the keyboard.
  `accepts-when` gains: a member creating a question through either entry point gets an object with
  the same required fields, and no path asks for a title.

---

**REC-15 · queued** — CHANGED by **C-4** (instance-wide `NO_SIGNERS`)

- All of `BUILD-ORDER.md:104` stands. Added: `NO_SIGNERS` is INSTANCE-WIDE — `index.mjs:2631-2634`
  fires on `facts.signers.length === 0` and `store.mjs:5920-5922` builds that from every active
  signer of every active member. **The refusal detail must not say "for you"** (D-57: the UI printed
  the plane's basis verbatim and a member read a fabricated claim). Whether the member-without-a-key
  case can be detected before the act is §4 Q11 and this item does not invent a second refusal for
  it. `accepts-when` gains a negative control: attach per-member wording to the instance-wide
  refusal and the suite fails.

---

**REC-17 · queued** — CHANGED by **D-5** (the walk-back edges owe a refusal, not only an obligation)

- All of `BUILD-ORDER.md:120` stands, and the item widens. Today it covers SUPERSESSION only. Per
  §2.1 D-5 the collapsed lifecycle owes its recursion two different things, and the corpus already
  states the criterion (`SB-CORE.md:1507`: `retire` is *"the existing TERMINAL transition, which
  already refuses on a downstream consequence (`CITED`) rather than on the actor"*):
  **terminal acts on a cited inquiry REFUSE with `CITED`** (dismiss, divide), listing the offenders
  and using the document path's remedy wording (`SB-CORE.md:944-949`); **reversible acts RAISE the
  obligation** (defer, reopen), exactly as supersession does. This mints no new mechanism and no new
  refusal name; the reverse index REC-11 builds is what makes both one lookup. `accepts-when` gains:
  dismissing an inquiry that a live basis leg names is refused by name; deferring it succeeds and
  raises the obligation on every dependent. Negative control — permit a dismiss on a cited inquiry
  and a published case's basis panel names a leg that is now an abandoned question while its frozen
  strength still reads.

---

**REC-20 · queued** — CHANGED by **C-2** (the grouping read must be gated) and **C-12** (P-88 is
BLOCKED)

- All of `BUILD-ORDER.md:162` stands, with one dependency added and one scope restriction.
  **depends-on: REC-10, REC-19, REC-25** — `SB-CORE.md:431` reads case titles for the group headers
  through `op=list` and `op=projection`, the ops `SB-EVIDENCE.md:428-430` refuses because they bypass
  the viewer gate. A queue grouped by case leaks exactly the names D-15 §7.9 forbids, **in the one
  surface every member opens by habit**. The grouping read must be gated before the grouping exists.
  Scope restriction: **the `case` column ships; P-88's population rule does NOT**, because C-12 shows
  DEC-10's premise (a focus is a leaf) does not survive the collapse and the choice between
  *nearest ancestor* and *every ancestor* is Bob's (§4 Q3). Until then every item's `case` is null
  and every item sits UNGROUPED, which is the behaviour the item already specifies for an item with
  no connection and is honest rather than invented.

---

**REC-21 · queued** — CHANGED by **C-3** (mute reaches CONDITION only)

- All of `BUILD-ORDER.md:170` stands. Added: **`muted_kinds` may contain CONDITION kinds only.**
  `NOTIFICATIONS.md:260-266` scopes mute and acknowledge to the CONDITION row and says in the same
  breath that this is *"the rule most likely to be lost when someone implements a delete button."*
  `SB-CORE.md:142`'s `[ Mute this case ]` over a group holding an OBLIGATION, a FINDING and a
  CONDITION loses it. The concrete failure it prevents: an OBLIGATION is something a named person
  must do for the record to proceed, a muted case removes it from the only surface that routes it,
  and `tasks` carries no per-member mute — so the record goes on believing the question reached a
  person. `accepts-when` gains a negative control: mute a case and assert an OBLIGATION on it still
  appears in that member's queue.

---

**UI-14 · queued** — CHANGED by **C-2** (dependency), **C-3** (wording), **C-10** (vocabulary),
**C-14** (the primitive)

- All of `BUILD-ORDER.md:288` stands, with one dependency and three corrections.
  **depends-on: REC-20, UI-10, REC-25.** **(1)** The mute control reads `[ Mute conditions on this
  case ]` and reaches CONDITION items only. **(2)** `SB-CORE.md:137`'s *"A capture stopped at this
  **platform's ceiling** with 14 parts outstanding"* is REFUSED — the `capture-honesty` vocabulary
  guard forbids ceiling, subrequest and runtime on this exact banner (`UI-B §6.1`), so the row as
  drawn would fail an existing suite guard, and SB-CORE claims C4 discharge on it. Corrected: *"A
  capture of this document did not finish. 14 parts are outstanding and your action can complete
  it."* **(3)** The UNDETERMINED primitive is the shared three-line component (C-14), not a
  surface-local shape. Ungrouped items and per-feed degradation are unchanged.

### 3.3 · UNCHANGED — eighteen items, checked and carried forward verbatim

`REC-13` (concluded + `op=conclude`) · `REC-19` (`op=affordances` — already publishes `rung` and
`weight` distinctly, C-6) · `FW-13` (`citations.json`) · `FW-14` (assign the rungs — its derivation
method already yields C-7's answer) · `REC-23` (D-130 counterparty) · `REC-24` (the action loop —
already reads the edge table from the catalogue, C-5) · `REC-25` (the D-15 viewer gate — unchanged
in scope, and now depended on by two more items) · `REC-26` (`env.SELF` + `op=monitor`) · `REC-27`
(the eight invisible tables) · `FW-15` (the L2→L3 wire) · `CPDF-8` (the FORMAT registry) · `CAP-5`
(the OOXML container) · `UI-10` (the type in the UI) · `UI-13` (the L4 write surface) · `UI-15`
(the Add defects — C-11 resolves to "ships absent", which is what it already does) · `UI-16` (the
project workspace) · `UI-19` (O3 the action page — already refuses from the catalogue's edge table)
· `UI-21` (the evidence finder).

**Why so many are untouched, stated because it is the useful half of the finding.** R1–R4 are all
about what a CLAIM is worth and what shedding part of one costs. Nine of the eighteen unchanged
items are honesty, capture, format and access-control work that sits beneath claims and does not
express them. That is the collapse paying out in the build order the same way it paid out in the
model: the recursive object concentrated the design's risk into a small number of items, and it
concentrated the corrections there too.

### 3.4 · THE CRITICAL PATH, RE-CHECKED

**The longest chain is unchanged — six deep, and it is still the publication chain:**

    REC-10 → REC-11 → REC-13 → REC-14 → REC-22 → UI-18
    the type   basis    conclude  publish   public ops  the public case

The new edges do not lengthen it. `REC-25 → REC-20` adds nothing because REC-25 is a seed.
`REC-16 → REC-22` and `REC-16 → UI-18` create a second path to UI-18 of depth 5
(REC-10→11→13→16→22→UI-18 is six, tying rather than exceeding). **REC-12 and REC-13 are still
parallel**; UI-17 is still off the longest chain.

**Eight items still depend on nothing** — REC-10, REC-19, REC-25, REC-26, REC-27, REC-23, FW-15,
CPDF-8 — so **the constraint is still worker slots, not dependencies.**

**REC-10 is still the single highest-leverage first item**, and R1–R4 strengthen rather than weaken
that: every one of the eleven items they changed sits downstream of it, so the corrections cost
nothing if the type lands first and cost rework in eleven places if it does not.

**One ordering claim in `BUILD-ORDER.md` §3.3 narrows.** *"REC-16 (division) does not block REC-14
(publish)"* is still true — an inquiry that was never divided has no parent and no siblings to name.
But R4 makes the disclosure a property of publishing a divided CHILD, so REC-16 now blocks the
published SURFACE's ability to render it. The single-worker order at `BUILD-ORDER.md:874-876`
(REC-10 → REC-19 → REC-11 → REC-13 → REC-12 → REC-14) is unaffected.

**REC-25 rises in practical priority without moving in the graph.** It was a seed with one dependent
(UI-16 and UI-21); it now has four (REC-20, UI-14, UI-16, UI-21) and it gates the surface every
member opens by habit.

---

## §4 · OPEN QUESTIONS — ONE LIST, DE-DUPLICATED, RANKED BY WHAT EACH BLOCKS

Fourteen. Compiled from ~40 raw mentions across `SB-CORE` §5, `SB-EVIDENCE` §6, `SB-OUTPUT` §5,
`BUILD-ORDER` §1.4, `CRITIQUE` §5, `DATA-MODEL` §2.9, `CAPABILITIES` §4, `AUDIENCES` rows 13–14,
`LAYERS`, `JOURNEY-PRIMARY` and `COMPLETENESS-AUDIT`. Ranked by what each blocks, not by how
interesting it is.

**CLOSED BY R1–R4 and removed from every list — do not re-raise:** whether `undetermined` floors or
suspends (was `SB-OUTPUT` §5.1, `BUILD-ORDER` HOLE-5, `CRITIQUE` D-2 — closed by R1); whether the
two grade axes compose (was implicit everywhere — closed by R2); what replaces the cycle guard (was
`CRITIQUE` C-1 — closed by R3); whether division needs a counterweight (was `CRITIQUE` D-7's main
half — closed by R4).

### Tier 1 — blocks a build item that is otherwise ready

**Q1 · May a published bundle be REVISED, or is `published` terminal?** *(= `CRITIQUE` D-1, D-9;
`SB-CORE.md:1309` vs `SB-OUTPUT.md:709-720`; `DATA-MODEL.md:433` vs `store.mjs:5934-5940`.)*
**Blocks:** REC-14's terminality, REC-22's index shape, UI-18's index, and whether `SB-OUTPUT` S16
exists at all. **Settled by:** Bob, and only Bob — it is a statement about what the record owes a
reader who relied on an earlier hash. **Consequence of each branch:** if TERMINAL, D-9 disappears,
REC-14 is right as written, S16 is deleted, and a corrected case is always a new inquiry that
supersedes. If REVISABLE, `publishedList()` must enumerate `published_shas` rather than one row per
bundle, or the surface whose guarantee is *"anyone can check those bytes without our cooperation"*
cannot enumerate what it published. **Running provisionally:** terminal, which is the conservative
branch and `DATA-MODEL`'s position.

**Q2 · What makes an unsupported case HARDER to state?** *(= constraint C3; `CRITIQUE` D-6;
`Case_Making:159-164`.)* **Blocks:** nothing mechanically, and it blocks the three files' right to
claim C3 is discharged — which this file has withdrawn (§2.2 C-13 row 3). **Settled by:** Bob.
`AUDIENCES.md` §5 forbids a per-audience gate and a global strength floor is its own doctrine
problem, so the answer is probably not a floor. R1 supplies a partial: a thin case can no longer
publish wearing a letter it did not earn. **Why no session should decide it:** every candidate
answer is new doctrine about the cost of an act, which is exactly what `CLAUDE.md` reserves.

**Q3 · Under the collapse, is the queue's `case` key the NEAREST ancestor or EVERY ancestor?**
*(= `CRITIQUE` C-12; DEC-10 vs `SB-CORE.md:459`.)* **Blocks:** P-88, therefore REC-20's population
rule, therefore UI-14's grouping and REC-21's mute scope. **Settled by:** Bob, because DEC-10 is his
ruling and its premise — a focus is a leaf — is what the collapse removed. **Symmetric costs, both
real:** nearest-ancestor means a member working the root question never hears about its legs;
every-ancestor means one event appears in N groups and breaks DEC-10's own *"one standing entry per
(member, case)"*. **Running provisionally:** REC-20 ships the column, every item ungrouped, nothing
invented.

**Q4 · Where does a document leg's CONNECTION grade come from?** *(= `DATA-MODEL` D1(b),
`SB-CORE` §5, `BUILD-ORDER` §1.4; narrowed by R2 — the CAPTURE half no longer needs a ruling.)*
**Blocks:** REC-18, and therefore any strength above grade D on the connection axis, and therefore
every audience threshold that is not "everything". **Settled by:** Bob. `DATA-MODEL.md:864-871`
flags its own recommendation as *"my determination from the only grade vocabulary that exists, not
a citation."* **Second-order cost of D1(b), which is why it is not free:** it requires an inquiry to
name a registry entity, and the registry has no write surface until UI-13.

**Q5 · Which permitted assembly panel, if any, sits beside the completeness field?** *(=
`CRITIQUE` D-10.)* **Blocks:** UI-17's step 3 only. **Settled by:** a further design pass, not by
Bob and not by a build session. Both fixes on offer are weak — showing the panel after the field has
content is defeated by typing one word; showing it without the case filter produces a panel too
broad to be the Zotero precedent it cites. **Running provisionally:** UI-17 ships the field and the
C-9 picker and NO panel, which removes an assembly the rule may not permit and removes nothing the
member authored.

### Tier 2 — blocks a design decision, not an item

**Q6 · What form does a THRESHOLD take over a PAIR of strengths?** *(New, forced by R2.)* Both
axes at or above the threshold, or one named axis, or two independent selectors? **Blocks:** the
threshold selector's design in UI-18; not its data path. **Settled by:** whoever designs the
rendering, against `AUDIENCES.md`'s labelled-by-what-the-reader-is-DOING rule. Recorded here because
R2 created it and no file has seen it.

**Q7 · Division's residuals after R4: the friction asymmetry, and the timing.** *(= `CRITIQUE`
D-7's two halves R4 does not reach.)* (a) Severing one leg costs one reason for that leg; dividing
costs one reason for the whole act — R4 answers by disclosure and does not equalise the cost.
(b) `SB-CORE.md:1070-1073` offers `[ Divide this… ]` at the exact moment the member's strength is
held down, which is a compellingness prompt whatever its wording. **Blocks:** nothing; both are
live once REC-16 ships. **Settled by:** Bob, since R4 is his and these are what R4 chose not to
cover.

**Q8 · Is `divided` a STATE or a DISPOSITION?** *(= `SB-CORE` §5; N-7 — REC-16 decides it silently.)*
`deferred` and `dismissed` are terminal-ish and are called dispositions. **Blocks:** nothing.
**Settled by:** a DEC that REC-16 should raise rather than ship as settled.

**Q9 · How does `undetermined` state the D-129 split — *could not determine* versus *positively
none*?** *(= GAP-I8, `SB-EVIDENCE` §6.4, HOLE-7; touches all ten surfaces.)* **Blocks:** nothing;
C-14's three-line shape is a working stopgap that invents no second treatment. **Settled by:** a
field beside the reason in the plane, which is D-129's own recommendation. **New sub-question from
R1 (N-8):** a SUSPENDED axis has no retry semantics — looking again will not settle it, only
grading the leg will — so the third line needs a form for that case, and no session should invent
it in passing.

**Q10 · Is division owner-scoped or author-scoped, and does concluding need a ballot when a project
has multiple owners?** *(= `SB-CORE` §5, `CAPABILITIES` §4, `SB-OUTPUT` §5.8, `BUILD-ORDER` §1.4 —
four files, one question.)* **Blocks:** nothing; REC-16 ships author-scoped and raises a DEC, which
is the right shape. **Settled by:** Bob. The material difference is stated and is worth repeating:
owner-only would let an owner block an honest de-escalation.

**Q11 · Can a surface know, before the act, that a MEMBER holds no active signing key?** *(=
`SB-CORE` §5; `CRITIQUE` C-4's undesigned half.)* **Blocks:** nothing; REC-15 ships the instance-wide
refusal. **Settled by a MEASUREMENT, not a ruling** — what `op=signerlist` returns to a non-admin
session. `CLAUDE.md`'s measure-do-not-assume rule applies: run it and put the answer in
`MEASUREMENTS.md` with its date and instrument.

### Tier 3 — recorded, blocking nothing now

**Q12 · Is an absent capability NARRATED or silent?** *(= `CRITIQUE` U-1; three files each guessed;
`SB-EVIDENCE.md:1494-1497` says so honestly.)* The CONTROL's absence is settled and undisputed.
**Settled by:** whoever owns the member's reading experience; `Membership v2` §5 does not reach it.

**Q13 · The queue's ordering rule within a class.** *(= `SB-CORE` §5, `CRITIQUE` U-3 — *"every frame
in §1 is drawn in an arbitrary order for that reason."*)* **Blocks:** nothing; UI-14 ships
longest-waiting as an explicit, labelled proxy, which today's Home already does and says.

**Q14 · Three structural questions with no consumer yet**, kept together because each is real and
none is reachable:
- **Contradiction held INSIDE one inquiry** (HOLE-3, GAP-I9, design open question 5): `role:
  cuts_against` is one leg's polarity, not a structure for two legs contradicting EACH OTHER. D-80
  rules contradiction is a thing to FIND rather than prevent. **I don't know** what shape it takes
  and no item pretends to.
- **Whether the intent axis can be projected onto a bundle row at all** (HOLE-4, `SB-EVIDENCE` §6.1):
  `resolutions` is keyed `(capture_sha, ref, entity_id)`, so `bundles.entity` is multi-valued or a
  join table, and the choice changes what `op=searchfields` can honestly publish. A RECORD-area call.
- **Addressed non-public delivery, and the persistent rendering** (HOLE-6, `AUDIENCES` rows 13 and
  14): a case sent to one recipient and not published is on neither side of the two-bucket fence, and
  a rendering someone acted on has become a record needing a hash, a date and an author. Both are
  Bob's; both are designed-as-an-`action` provisionally; `AUDIENCES.md` says the second is
  *"settled by the first lawyer, not by argument."*
- The **`surfaced → open` mapping** for existing focus bundles (`DATA-MODEL` §2.7) is NOT on this
  list: REC-10 already carries the recommended answer (keep `surfaced` as a legal alias) with its
  reason, and that is a decision taken, not a question open.

---

## §5 · WHERE I STOPPED, AND WHY

Recorded because the brief is right that inventing is the failure mode here, and a reconciliation
that quietly closed everything would be less useful than one that says where it stopped.

Five places where I could have written a plausible answer and did not, and what each would have
cost:

1. **The revision question (Q1).** I could have argued either branch. Both are supported by
   something in the repository and the repository is split against itself — `published_shas` appends,
   `published_bundles` upserts. Choosing would have been writing doctrine about what the record owes
   a reader who already relied on a hash.
2. **A cost that makes an unsupported case harder to state (Q2).** Every candidate I generated was
   a new gate, and `AUDIENCES.md` §5 plus `CRITIQUE` D-6 both explain why the obvious gate is worse
   than the problem.
3. **The queue's grouping key (Q3).** Both answers have symmetric, real, member-visible costs. I
   could not find a tiebreaker in any of the sixteen files, and DEC-10's premise is what changed, so
   the ruling's author should see it again.
4. **The replacement exclusion panel (Q5).** I generated a third option, noticed I was designing,
   and stopped. That is the signal the brief names.
5. **The shape of the axis field on a basis leg (§3.1 REC-11).** I stated the requirement — the
   axis must be recorded, because it is not derivable from `target_type` — and left the column shape
   to a DEC rather than deciding it here, because it is a build decision with a reversal cost, which
   is the shape `kickoffs/README.md` defines for a DEC.

And one thing worth saying plainly about the corpus rather than about the design: **the three
parallel storyboards did not fail randomly.** `CRITIQUE` C-13 measured it and this pass confirms it
at every turn — each file dropped the constraint that would most have complicated its own surfaces,
and each invented in exactly the gap its own omission opened. The canonical constraint list at §2.2
C-13 exists so the next parallel pass starts from ten shared constraints instead of five, five and
seven.
