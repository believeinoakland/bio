# CRITIQUE — an adversarial read of the ten storyboards and the two design passes

Written 2026-08-01. **This document's job is to break things**, not to summarise them.
It attacks `SB-CORE.md`, `SB-EVIDENCE.md`, `SB-OUTPUT.md`,
`architecture/BIO_Case_Making_v0_1.md` and `architecture/BIO_Interaction_Constructs_v0_1.md`
against the doctrine in `CLAUDE.md` and `docs/development/NOTIFICATIONS.md`, and against
the plane's actual code where the code decides the answer.

It changes nothing else and proposes no build order. Every hit names the passage it
breaks. Where I attacked something and it held, §4 says so and says how I tried — that
section is not a courtesy, it is the part that makes the rest credible.

**Severity, as the brief defines it.** DOCTRINE = *the record could claim more than it
can support*. I have applied that definition strictly: a visibility leak and a lost
obligation are serious, and they are CORRECTNESS, because neither makes the record
overclaim. Two findings sit right on the line and say so.

| severity | count |
| --- | --- |
| **DOCTRINE** | **10** |
| **CORRECTNESS** | **13** |
| **USABILITY** | **3** |

The three most serious are **D-1** (a published case is editable in one file and
immutable in another), **D-2** (`undetermined` has three answers across the three files
and the code prescribed for it gives a fourth, ranking *we do not know* below testimony),
and **D-3/D-4** (grade A is displayed for a capture this system has measured it cannot
produce, and two incommensurable A–D scales are composed into one strength number).

---

## 1 · DOCTRINE — the record could claim more than it can support

### D-1 · A published case is immutable in SB-CORE and revisable in SB-OUTPUT, and the CASE page asserts a frozen strength over content that has moved

`SB-CORE.md:1309`, on the published inquiry page:

> This cannot be edited, divided or withdrawn. It can be superseded by
> a later inquiry that cites it.

`SB-OUTPUT.md:709-720`, on the same object:

> published   2026-08-01 · sha256:9d0e77b31af4c2…
> **since then  3 revisions in the working record**
> …
> [ Publish the new revision… ]  [ Open a superseding inquiry… ]

Both cannot be true. `DATA-MODEL.md:433` sides with SB-CORE — `published: [], // terminal,
by R5.3 and the publication fence` — and the plane's `publish()` sides with SB-OUTPUT: it
UPSERTS `published_bundles` (`store.mjs:5930-5940`), which only makes sense if a bundle is
re-ratified after further revision.

**Why this is a DOCTRINE hit and not a state-machine disagreement.** Under the collapse
there is no separate `case` object; `case` is a phase name on the same bundle
(`BIO_Case_Making_v0_1.md:407-420`). So if the working bundle keeps changing after
publication, the inquiry page at `SB-CORE.md:1284-1312` renders live working content under
the heading `⟨CASE⟩ · published`, beside `STRENGTH ⟨B⟩ — frozen at publication` and the
published sha. A member reading that page is reading a claim whose displayed strength was
computed over bytes that are no longer the bytes on the page. That is the record claiming
more than it can support, produced by the collapse itself: one object cannot be
simultaneously the frozen thing the world relies on and the live thing the group is still
editing, and neither file resolves which the page shows.

`SB-CORE.md:630-634` compounds it by refusing dismissal on a published inquiry
(`ILLEGAL_TRANSITION`, "A published case cannot be dismissed, divided or withdrawn") while
SB-OUTPUT permits unlimited revision of the same bundle — so the design forbids the
reversible acts and permits the irreversible-in-effect one.

### D-2 · `undetermined` floors, suspends, and is unresolved — three answers in three files, and the code prescribed for it gives a fourth

`SB-CORE.md:1087-1099` decides it:

> If one leg's grade is `undetermined`, the whole strength reads `undetermined` and says
> which leg did it. … **This is not a failure and it is not a low score. It is what we do
> not know.**

`SB-OUTPUT.md:457-462` refuses to decide it, on a frame that already shows a published
strength:

> It is **not** rendered as a failure and it is **not** silently treated as the weakest
> link — I do not know whether `undetermined` should floor the composition or suspend it

and its wireframe answers by construction: `SB-OUTPUT.md:425` publishes at `▪ C ▪` with
leg D at `strength undetermined` present in the same basis list. That is SUSPEND. Its own
§5 item 1 then records the question as open and Bob's.

The fourth answer is in the code SB-CORE prescribes. `SB-CORE.md:1490` (GAP-I3):

> a walk of `inquiry_basis` reusing `#weakerGrade` **unchanged**

`store.mjs:3444-3445` is:

    static #weakerGrade(g1, g2) {
      return (Store.#GRADE_RANK[g1] || 0) <= (Store.#GRADE_RANK[g2] || 0) ? g1 : g2;
    }

with `#GRADE_RANK = { A: 4, B: 3, C: 2, D: 1 }` (`:3210`). A null grade — which
`SB-CORE.md:1471` specifies as the storage for undetermined (`grade NULL` = undetermined
and STATED) — ranks **0**. Reusing `#weakerGrade` unchanged therefore floors the chain,
and floors it **below grade D**, i.e. below a member's signed testimony. So the mechanism
SB-CORE names to enforce its own sentence *"it is not a low score"* implements exactly a
low score, the lowest available, and does it silently.

Three storyboards, three answers, and the prescribed implementation contradicts the file
that prescribes it. This is the single most consequential unresolved thing in the corpus,
because strength is the whole defence against the project's self-directed threat model
(`CLAUDE.md:70-73`).

### D-3 · SB-OUTPUT displays `grade A` for a directly captured document, which this system has measured it cannot produce

`SB-OUTPUT.md:429-435` and `:1019`:

> ├── A · INFO-2026-0031-acfr-fy2024
> │     Annual Comprehensive Financial Report FY2024, p.112
> │     verified · captured from the city's own address
> │     **grade A — the document says it itself**

`SB-EVIDENCE.md:908-910` states the opposite for the same class of object:

> It will be captured at collected, **Grade B** … Grade B is what a direct capture by this
> instance is worth; **it is not Grade A and this surface will not say it is.**

The repository agrees with SB-EVIDENCE and has agreed for some time:
`docs/development/CAPTURE-FIDELITY.md:40` — *"WACZ/Grade A remains out of a Worker's reach
and is not claimed"*; `BIO_Intake_Doctrine_v1_1.md:222-226` reserves Grade A for a
chain-of-custody WACZ capture; the plane's own note at `index.mjs:2348` says *"Grade A
needs a chain-of-custody web archive, which this surface cannot produce"*; and there is a live
negative control for precisely this string — `CLAIMS.md:410`: *"make the surface claim
Grade A from co-attestation … and the honesty assertion fails"*.

A published case whose top leg reads `grade A` is the record claiming a standing the
instance cannot reach. The published page (`SB-OUTPUT.md:1019`) shows it to a reader with
no credential and no way to know better.

### D-4 · Two incommensurable A–D scales are composed into one "strength", and the doctrine that forbids exactly that substitution is quoted nowhere

There are two graded axes in this system and both run A–D:

- **capture grade** — how the bytes reached us. `BIO_Intake_Doctrine_v1_1.md:222-238`: A =
  WACZ, B = fetched by a capable surface, C = reference/archive. This is what
  `SB-EVIDENCE.md:602-607` renders: *"Grade C · recovered through a public archive … Grade
  tracks how the bytes reached us, never how credible the document is."*
- **connection / resolution grade** — how a link between two things was established.
  `BIO_Content_Framework_v0_10.md:550-585`: A = the source links them itself, B = the same
  identifier in both, C = the same name in both, D = testimony. This is what
  `SB-OUTPUT.md:432-435` renders: *"grade A — the document says it itself"*, *"grade B —
  one document names the other."*

`BIO_Intake_Doctrine_v1_1.md:215-220` rules on combining them:

> a Grade B capture of an auditor's report is strong source on a moderate chain; a Grade A
> capture of a blog post is weak source on an airtight chain; **neither axis substitutes
> for the other.**

Weakest-link composition over `inquiry_basis.grade` substitutes one for the other by
construction: `#weakerGrade` cannot tell the two scales apart, so a case can be floored to
C by an archive CAPTURE and read by a member as a weak CONNECTION, or the reverse. And
`SB-CORE.md:1490` admits the input is undefined — *"**Open: where a document leg's grade
comes from**"* — while `SB-CORE.md:1063-1067` already ships the composed answer to the
member as a serif sentence: *"⟨C⟩ — no stronger than the weakest leg."*

A number composed from two scales that doctrine says do not substitute is not a defence
against overclaiming; it is a number that looks like one. This has to be settled before
any frame that shows a strength is built.

### D-5 · A cited inquiry can be reopened, deferred or dismissed with no downstream refusal, while retiring a cited DOCUMENT is refused

`SB-CORE.md:1149-1150` gives a concluded finding this act bar:

> [ Publish as a case… ]  [ Plan an action ]  [ Reopen… ]  [ Divide… ]
> [ Defer… ]  [ Dismiss… ]

and `:1145-1148` shows, on the same frame, that another inquiry rests on it:

> WHAT RELIES ON THIS
>   ⟨INQ-2026-0007⟩ … — cites this as basis

Nothing in `SB-CORE.md` §3.3's GAP list, §3.4's capability table, or A2/A3's pre-flight
refuses a disposition on a cited inquiry. The document path refuses exactly this:
`op=retire` returns `CITED` (`store.mjs:1770`, quoted at `SB-CORE.md:886`), and
`SB-CORE.md:944-949` even models the refusal wording — *"2 live citations rely on this
document … Withdraw those citations first."*

So the walk-back edges of the collapsed lifecycle are weaker than the equivalent edge on
`information`. The consequence is an overclaim: a published case's frozen strength names
leg 2 at grade B; leg 2 is an inquiry; a member dismisses leg 2 with a reason; the case
still reads B and its basis panel still names a leg that is now an abandoned question.
`SB-CORE.md:1328-1342` (I11) raises a re-evaluation obligation for a **superseded** leg
only, and states it is a query over `inquiry_basis WHERE target_id = <superseded>` — a
dismissed or reopened leg raises nothing.

This is the sharpest answer to *"find a case where one lifecycle cannot carry both"*: the
same object is a question a member may walk back at will and a load-bearing leg others
depend on, and the design gave the walk-back the question's rules.

### D-6 · Nothing in the publication gate is a function of strength, so an unsupported case is exactly as easy to state as a supported one

`BIO_Case_Making_v0_1.md:159-164` is the constraint:

> **The tool should make a supported case easy to build and an unsupported one hard to
> state.** That is an inversion of how storytelling and case-building tools normally work

The ceremony's pre-flight (`SB-OUTPUT.md:313-331`) checks: you may publish · a key is
registered · a falsifier is stated · a basis is stated · the bytes are held · every
provenance hop names who took it. Plus `published` requires a non-empty exclusion
statement (P4, `:806`) that is not byte-identical to the previous revision (C-21.1,
`:807`). **No check is a function of strength.**

`SB-OUTPUT.md:978` shows the result in the public index, and it is drawn by the design
itself, not by me:

> published 2 June 2026 · **strength undetermined**

An inquiry with one ungraded leg — a claim about which the record can say nothing at all
about how it was established — publishes with the same keystrokes as one at B. The design
discharges C3 by DISPLAY (`SB-CORE.md:1400`: *"the weakest leg is named from the first
citation"*), and display is not cost. Every friction in the ceremony is identical for a
strong case and a worthless one.

I am not arguing for a strength floor at ratification — `AUDIENCES.md` §5 forbids a
per-audience gate and a global floor would be its own doctrine problem. I am arguing that
C3 is currently discharged by a claim the frames do not support, and that the three files
should stop asserting C3 is met until something in the act costs more when the material is
thinner.

### D-7 · Division is a cheaper and less attributable route to shed a leg that cuts against the case than severance is

`SB-CORE.md:1215-1226` (I7 pane 3) apportions every leg between the children, with `Both
is allowed. Neither is not`, and `:1233-1236` asks for **one** authored reason for the
whole division. Severing a single leg requires its own reason and is refused without one
(`NO_REASON`, `store.mjs:1407`, cited at `SB-CORE.md:887`).

So the member who wants an inconvenient leg out of a claim has two routes: sever it, which
records a reason against that leg; or divide, which moves it to a sibling under one global
reason and leaves the parent terminal. `inquiry_basis.role ∈ supports|cuts_against` is
described as *"invariant 7's storage"* (`SB-CORE.md:1471`), and `SB-CORE.md:1113-1117`
promises *"A rendering that leaves it out must say it did"* — but division is not a
rendering. After the split the `cuts_against` leg is not in the published child at all,
and invariant 7 has nothing to route.

The pre-flight (`SB-CORE.md:1228-1231`) checks *not published · every leg apportioned · two
or more questions written*. It does not check that the children's questions are together
no broader than the parent's, and nothing requires the sibling to be pursued. Then
`SB-OUTPUT.md:1358` (U3) restricts the published graph to *"targets that are themselves
published"* — so a reader of the published child cannot see the parent it was carved from
or the sibling holding the contrary leg. The only trace is the authored exclusion
statement, which no gate can check.

`BIO_Case_Making_v0_1.md:453-460` argues division is a doctrine REQUIREMENT because
weakest-link otherwise forces overclaim-or-silence. That argument is right. What is missing
is the other half: division is also the cleanest laundering path in the design, and the
storyboards add no counterweight.

**Adjacent, and worth naming here rather than as its own hit:** `SB-CORE.md:1070-1073`
offers `[ Divide this… ]` precisely when the member's claim is being held down by one leg
— *"If these are really two questions, you can separate them and state the stronger one at
its own strength."* The file defends this at `:1083-1085` as naming a structural
consequence rather than a framing, and I accept that defence for the wording. I do not
accept it for the TIMING: the system proposes the manoeuvre at the exact moment it raises
the member's publishable strength, which is a compellingness prompt whatever its wording.

### D-8 · A threshold rendering drops the weakest claims, and under weakest-link the weakest claim IS the qualifier

`SB-OUTPUT.md:1119-1121` states the rule it obeys:

> **H5 · drop CLAIMS, never QUALIFIERS.** The strength block, the completeness statement,
> and every "what the hash does not claim" sentence are present in every rendering

and `:1105-1112` shows what it drops:

> One claim here is at strength D and is not shown in this rendering …
> One claim here cuts against this case and is at strength D, so this rendering drops it

Under the collapse a "claim" in a case is a basis leg — a sub-inquiry. The case's strength
IS its weakest leg. So a threshold that drops the weakest legs drops the thing that
determined the qualifier it preserves: the rendering shows `Strength C` and no C-grade leg,
and the reader cannot check the number against anything visible. The in-place notice
(`:1105`) mitigates but does not repair this — it tells the reader a claim is missing, not
that the strength they are being shown was computed from the missing one.

The distinction H5 rests on — claims are droppable, qualifiers are not — is coherent for a
flat document and incoherent for a weakest-link chain. That is a real finding about the
composition rule, not about the rendering feature, and it is the one place where two
separately-correct designs (audience renderings; weakest-link strength) are jointly
unsound.

### D-9 · `published_bundles` upserts, so the public index carries exactly one strength per case and the reader cannot find the weaker one that still answers

`store.mjs:5934-5940` upserts `published_bundles` on `bundle_id`; `published_shas` appends
(*"a hash once published stays answerable forever"*). `publishedList()` (`:5965`) selects
one row per bundle.

`SB-OUTPUT.md:710-713` tells the PUBLISHER the truth:

> Publishing again publishes the new revision. It does NOT withdraw the one already
> published: that hash keeps answering, because somebody may have relied on it.

`SB-OUTPUT.md:955-981` (O2 S1, the reader's index) shows one row per case with one
strength. A case published at `undetermined`, later revised and republished at B, appears
to every anonymous reader as a B case; the earlier hash still answers but is reachable only
by someone who already holds it. The surface whose whole guarantee is *"anyone can check
those bytes without our cooperation"* cannot enumerate what it published.

SB-OUTPUT itself names this failure shape in another context (`:770-772`): *"A rebuilt
corpus would carry the claim and drop the qualifier, which is H5's forbidden compression
performed by the architecture."* Re-ratification performs the same compression on the
index.

### D-10 · The exclusion panel enumerates the answer to the question it is asking, and C-21.1 cannot see the difference

`SB-OUTPUT.md:495-516` puts, beside the empty completeness field, a panel of the member's
own prior deferral, dismissal and severance reasons — *"14 Jun · deferred FOCUS-2026-0019
'The 2019 transfer predates the ordinance and I could not find the authorising
resolution.'"*

The permitted boundary is `BIO_Interaction_Constructs_v0_1.md:258-268`:

> **assembling what a member already wrote is not a fabricated attribution; drafting a
> justification for them is.** A surface may gather a member's own authored notes, excerpts
> and prior reasons into one place for them to work from. It may not draft, suggest,
> template, or complete.

The Zotero precedent it cites assembles a member's own annotations *on the document they
are writing about*. This panel assembles, specifically and only, the reasons the member
gave for **setting things aside on this case** — i.e. it is a list of the exclusions,
presented at the moment the member is asked to name the exclusions. The generation rule is
not broken; the SELECTION does the work generation would have done. What the member types
becomes a transcription of a system-assembled list, and a reader of
`## What This Excludes` cannot tell an authored material-set claim from a dictated one.

C-21.1 (`SB-OUTPUT.md:807`, `SB-CORE.md:1493`) refuses only a field carried forward
byte-identical from the previous revision. A paraphrase of the panel defeats it on every
publication. The completeness claim is the *"single surviving reason the case object
exists"* (`BIO_Case_Making_v0_1.md:266-268`) and this is the one control that shapes it.

The narrow fix is available and costs nothing doctrinally: show the panel, and show it
**after** the field has content, or show it without the case filter. The current design is
the only place in three files where the assembly rule is doing work it was not argued for.

---

## 2 · CORRECTNESS

### C-1 · The collapse deletes the system's only cycle guard and proposes no replacement, while making strength an unbounded recursive walk

Today the only acyclicity protection in the record is a side effect of `op=cite` refusing
non-`information` targets. `store.mjs:2094-2098`:

    /* … This also catches a Project citing itself, which
       is a cycle with nothing to mean. */

Basis recursion removes that guard by design: an inquiry must now cite another inquiry
(`SB-CORE.md:1572` — *"S3 itself · a concluded finding cited as basis | an `INQ-` id"*).
No storyboard proposes a replacement. GAP-I2's only stated refusal is that `refs` and
`inquiry_basis` may not disagree (`SB-CORE.md:1489`); GAP-I4's are
`PUBLISHED_CANNOT_DIVIDE`, `NO_APPORTIONMENT`, `TOO_FEW_CHILDREN`; GAP-I5's are
`NO_CONCLUSION`, `NO_FALSIFIER`. There is no `CYCLE`, no `SELF_BASIS`, no depth ceiling.

And strength is *"a walk of `inquiry_basis` reusing `#weakerGrade` unchanged, **derived on
read**"* (`SB-CORE.md:1490`). Two inquiries citing each other make every read of either
non-terminating inside a Durable Object — which arrives as the CPU-ceiling CONDITION
already in the catalogue (`NOTIFICATIONS.md:187`), i.e. the failure surfaces as our own
machinery breaking rather than as a refusal naming the offender.

This is the answer to *"does the recursion admit something absurd"*: yes, and the thing
that prevented it was load-bearing in a place nobody was looking.

### C-2 · The queue and the inquiry page read through the exact ungated ops SB-EVIDENCE deletes

`SB-CORE.md:431` reads case titles for the group headers through `op=list` and
`op=projection`; `SB-CORE.md:1459` builds "what relies on this" from *"the reverse walk …
(client-side today, `app.html:752-768`)"*.

`SB-EVIDENCE.md:428-430`:

> **Ops deliberately NOT called, with the reason.** `op=list` — it bypasses the viewer gate
> (F-8) … `op=projection` and `op=image` — same class

`SB-EVIDENCE.md:478` deletes the client-side reverse walk as *"§7.9's named leak, rebuilt
in the browser"*, and `:439`/`:1172` state the requirement it protects — an uninvited
member must not see a project's *"existence, … name, … references, … participants"*, while
*"Today `op=list` returns its id, title and state to any signed-in member (F-8)"*.

A queue grouped by case, whose group headers are project and inquiry titles read through
`op=list`, leaks exactly the names D-15 §7.9 forbids — and it leaks them in the one surface
every member opens by habit. This is a hard blocker on GAP-Q3's `case` key: the grouping
read must be gated before the grouping exists.

### C-3 · A group mute is a personal act applied to OBLIGATIONs and FINDINGs

`SB-CORE.md:142` puts `[ Mute this case ]` on a group containing an OBLIGATION, a FINDING
and a CONDITION; `:335-340` draws the muted group with *"This is yours only. Other members
still see these items."* No class restriction appears anywhere in §1.

`NOTIFICATIONS.md:260-266` scopes the affordance:

> - **OBLIGATION resolved** → record state. It leaves EVERYONE's list.
> - **FINDING adopted / deferred / dismissed** → an authored record act …
> - **CONDITION acknowledged or muted** → PERSONAL only.
> **… This is the muting-is-personal / dismissing-is-a-record-act rule stated per class,
> and it is the rule most likely to be lost when someone implements a delete button.**

Mute and acknowledge are the CONDITION row. Extending them to a group makes them reach the
other two classes. The concrete failure: an OBLIGATION is *"something a named person must do
for the record to proceed"*; a muted case silently removes it from the only surface that
routes it, and `tasks` carries no per-member mute (`SB-CORE.md:460`, GAP-Q4), so the record
goes on believing the question reached a person.

This is the finding closest to the DOCTRINE line — the record's routing asserts something
that is no longer true — and I have ranked it CORRECTNESS only because no published claim
is strengthened by it.

### C-4 · SB-CORE gives `NO_SIGNERS` a per-member basis it does not have — the D-57 shape

`SB-CORE.md:1555-1559`:

> reason ⟨NO_SIGNERS⟩
> detail ⟨no active signing key is registered **for you**⟩

The plane's refusal is instance-wide. `index.mjs:2631-2634` fires when
`facts.signers.length` is zero, and `store.mjs:5920-5922` builds that list as *every* active
signer of every active member. A member holding `publish` with no key of their own passes
this check whenever anyone else has a key, and fails later at `SIG_UNKNOWN_KEY`.

So `SB-CORE.md:1526-1533`'s design — *"The act renders and its pre-flight refuses at A3
with `NO_SIGNERS` and names the remedy"* — cannot detect the case it is written for, and
the wording attaches a fabricated per-member meaning to a plane refusal. That is D-57
exactly: *"the UI printed the plane's basis verbatim and a member read a fabricated
claim"* (`SB-CORE.md:163-165`, quoting the cautionary case at the top of its own §1.1).
`SB-OUTPUT.md:284-294` gets the instance-wide wording right and does not cover the
member-without-a-key case at all, so between the two files the case is designed wrongly
once and not designed once.

### C-5 · SB-OUTPUT prescribes the second copy of the state machine that SB-OUTPUT forbids

`SB-OUTPUT.md:1839` (A8, `op=actionmove`):

> It must read the legal-edge table from the catalogue, **not** hold a second copy —
> `op=dispose` holds a second copy of the focus state machine (`store.mjs:1571-1579`) and
> that is the hazard not to repeat

`SB-OUTPUT.md:1764-1766` (S13, twenty-five lines later):

> an illegal transition (`active → planned` is not in the catalogue's edge list) — refused
> in the surface by a **pre-flight mirroring the catalogue**, before the plane is reached,
> the same way `disposePreflight` does

That is a third copy, in the surface, of the table the same section calls the hazard.
`SB-CORE.md:604-608` already counts the existing copies — *"Three copies of one rule"* —
and GAP-A4 names the fix (export `STATES`/`LEGAL` and guard it in `check-semantics.mjs`).
S13 should be written against that export or the pre-flight should be a plane read.

### C-6 · Two of the three files label the RUNG ladder "weight", the collision the constructs doc corrected the same day

`BIO_Interaction_Constructs_v0_1.md:77-83`:

> **NAMING COLLISION, corrected 2026-08-01.** This document called the ladder WEIGHT. The
> plane already uses `weight` for something orthogonal and older … Two different ideas
> under one word in a codebase that has already paid for exactly that (D-8's vocabulary
> drift…). So: the LADDER is **rungs** … and **weight** stays the plane's set-application
> mode. An act has a rung; applying it to a set has a weight.

`SB-CORE.md:596`, `:744`, `:1186`, `:1238` all render the ladder to the member as
`weight   reversible · reasoned · terminal · attested`. `SB-EVIDENCE.md:354` and `:1265`
render it as `WEIGHT   reversible · [reasoned] · terminal · attested`. `SB-CORE.md:744-746`
then prints both meanings four lines apart — `weight … TERMINAL` above `applies refuse —
all or nothing`.

Only `SB-OUTPUT.md:10-14` uses "ladder rung". Two files reintroduce the collision **in
member-facing UI strings**, which is where it is most expensive to undo.

### C-7 · `cite` carries two different rungs inside one file

`SB-EVIDENCE.md:354` (E11, the cite act): `WEIGHT   reversible · [reasoned] · terminal ·
attested`, with a required authored field at `:356-359` (*"Why these support the work
0/280 — you write this"*).

`SB-EVIDENCE.md:710` (D10, the document page act bar): `[ Cite into an inquiry ]
reversible`.

An act whose rung is `reasoned` requires a justification that becomes part of the record;
an act at `reversible` does not. The same op cannot be both, and `SB-CORE.md:1507` assigns
it a capability without a rung. This is exactly the kind of drift GAP-A2 predicts from the
rung not existing in the plane — and here it has already happened, inside one document.

### C-8 · `report` weight is described with `per-item` semantics

`SB-EVIDENCE.md:350-353`:

> This act proceeds and reports what moved. It is weight `report`, not all-or-nothing: 10
> will be cited, **1 will be retained with the reason above.**

`NOTIFICATIONS.md:238-244` defines the two as different modes: `report` *"proceeds and says
what moved"*; `per-item` *"each item independently succeeds or is RETAINED WITH A REASON"*.
`SB-CORE.md:461` (GAP-Q5) records that `per-item` **does not exist in the plane**. So E11
draws a behaviour under a name that does not provide it, on the one act SB-EVIDENCE
proposes to build first.

### C-9 · `inquiry_exclusions.target_id` cannot be populated by the control that is supposed to populate it

`SB-OUTPUT.md:809-810` (P8) justifies the indexed table by an audit question:

> only the indexed projection makes it **auditable**, and without the index *"which
> published cases excluded this document"* cannot be asked at all

and `SB-CORE.md:1472` specifies `inquiry_exclusions — (bundle_id, ord), target_id,
description, reason, author, at` with *"`description` and `reason` NOT NULL"*.

The ceremony's control (`SB-OUTPUT.md:495-516`) is a single free-prose textarea, `0 / 2000`.
It never asks the member to name a document, an inquiry or an id. So the table's
justifying query — *which published cases excluded this document* — has no source of
`target_id`, and `inquiry_exclusions` degrades to one prose row per case, i.e. exactly the
side table P8 argued against. Either S8 gains a "name what you left out" picker over the
member's own material (which is permitted assembly, and would also blunt D-10), or P8's
auditability argument should be withdrawn.

### C-10 · The queue names the platform ceiling to the member; the capture surfaces forbid the word

`SB-CORE.md:137`:

> A capture stopped at this **platform's ceiling** with 14 parts outstanding.

`SB-EVIDENCE.md:657-659` forbids it on the same event:

> No count of subrequests, **no ceiling**, no runtime — the `capture-honesty` vocabulary
> guard forbids all of those words on this exact banner (`UI-B §6.1`)

and `:957-959` states the rule: *"the subrequest ceiling is classified and never named …
What the member decides is a RECORD question."* SB-CORE's own C4 check (`:387`) claims
discharge on this row.

Two files, one event, opposite vocabulary — and one of them would fail an existing suite
guard if built. The NOTIFICATIONS class is right (an *actionable* CONDITION earns an item);
the wording is not.

### C-11 · Action creation is deleted by one file and assumed by another

`SB-EVIDENCE.md:841` and `:1105` remove the ability to create an action until a producer
publishes its vocabularies:

> rather than keep a surface-side copy of the seven `action_kind` values that live in
> `bio-checks.mjs:1288`, **the type does not appear until an op publishes them**

`SB-OUTPUT.md`'s whole O3 presumes actions exist and are created, and its change list
(`:1832-1842`) fixes the placeholder (A3) and the check (A2) without ever proposing the op
that publishes `action_kind` / `risk_tier`. Its own act bars, radio pairs and S13
pre-flight are surface-side maps.

Both files are answering D-130/JG-9 and they answer it differently. Worth noting that
SB-OUTPUT's §0.2 constraint list (`:70-89`) **omits the producer-published-options rule
altogether**, which is why nothing in O3 trips over it — see C-13.

### C-12 · DEC-10's grouping argument does not survive the collapse

`BIO_Interaction_Constructs_v0_1.md:96-102` justifies grouping by case:

> **It needs no second axis.** The relevance filter that decides an event is worth
> notifying at all is "does this instance connect to a Focus or Project", and the
> aggregation key is that SAME connection.

That holds when a focus is a leaf. Under the collapse an inquiry's basis may be other
inquiries, so "connects to" is transitive and one event legitimately belongs to every
ancestor of the node it lands on. `SB-CORE.md:459` (GAP-Q3) specifies only `case TEXT` (a
bundle id) and defers the population rule to P-88, MISSING — so the file that inherits the
ruling does not notice the ruling's premise has changed. Either the key is "nearest
ancestor" (and a member working the root question never hears about its legs), or it is
"every ancestor" (and one event appears in N groups, breaking *"one standing entry per
(member, case)"*). This needs deciding before P-88 is written.

### C-13 · The three files do not share a constraint list, and each omits one the others treat as binding

- `SB-CORE.md:29-35` — five: no prefill · undetermined stated · **supported easy /
  unsupported hard** · no classifiable complication as a choice · producer options.
- `SB-EVIDENCE.md:31-37` — five: no prefill · undetermined identical · no classifiable
  complication · producer options · **absent not greyed**. **C3 is absent** — from the file
  designing the surfaces where evidence is gathered and graded.
- `SB-OUTPUT.md:70-89` — seven: no prefill · supported-easy · undetermined · no
  per-audience gate · in-band · drop claims not qualifiers · no invent-to-pass-a-gate.
  **The producer-options rule and the classifiable-complication rule are both absent.**

Only *never prefill* and *undetermined is stated* appear in all three. The omissions are
not random: each file drops the constraint that would most have complicated its own
surfaces. Any later session reading one file will believe it is reading the constraint set.

### C-14 · The UNDETERMINED primitive has three different shapes, and one file invents the distinction another refuses to invent

`BIO_Interaction_Constructs_v0_1.md:314-324` — *"a shape the interface must render
**identically everywhere** … One visual treatment, one voice."*

- `SB-EVIDENCE.md:40-48`: **three lines, always** — the word, a dated `basis`, and a
  `retry` line.
- `SB-CORE.md:186-196`, `:1091-1099`: two lines — *"What we do not know … Why we do not
  know it."* **No retry line anywhere.**
- `SB-OUTPUT.md:1141-1148`: one `ⓘ` paragraph — *"What we do not know, and why."*

Worse, the third line is where the D-129 split lives. `SB-EVIDENCE.md:530-534` vs `:545-553`
render *"looking again will not change this"* against *"there IS text in this file and we
did not get it"* — a real, member-visible distinction between *positively none* and *could
not determine*. `SB-CORE.md:1495` explicitly refuses to build it:

> **I don't know** how the second should render, and I will not invent a second treatment
> for a primitive whose value is uniformity

One file solved the open question by inventing exactly what the other declined to invent,
and neither knows the other did. The primitive whose entire value is that it looks the same
everywhere currently looks different in every file that draws it.

### C-15 · Threshold comparison is undefined for `undetermined`

`SB-OUTPUT.md:1073-1076` offers thresholds (*"claims strong enough to report"*, *"…to
plead"*) and `:1089` implements one as *"only claims at strength C or better"*.
`undetermined` is not a grade and has no position in that order — and `:1150-1156` says so
in the same file. So a rendering at a threshold either drops undetermined claims (dropping
the value doctrine says must never be smoothed away, with no sentence available to explain
why it was dropped) or keeps them (and "C or better" is false). The design does not say
which, and cannot until D-2 is settled.

### C-16 · Two entry points mint one object with different required fields

`SB-CORE.md:360-374` (Q15, Ask): *"it takes a question and nothing else — no type choice,
no counterparty, no risk tier"*, one authored field, `reversible`.
`SB-EVIDENCE.md:876-891` (Add): a type radio (*"A question worth pursuing"*), a **Title**,
and *"What do you know? 0/2000"* which gates the submit button (`:912` — *"disabled: tell
us what you know about it first"*).

Same object, two forms, one of which requires content the other forbids asking for. Under
the collapse these both mint an `inquiry`, so `## Question` would be populated from a title
in one path and from a question in the other.

### C-17 · The two files draw different applications

`SB-CORE.md:78-90` draws a rail of Queue · Record · Search · Subjects · Inquiries ·
Projects · Review · Monitoring · Actions · + Ask. `SB-EVIDENCE.md:152` (E-g) **deletes** the
Focuses, Projects and Monitoring list screens — *"one finder with saved scopes. DELETE
`renderFiltered`"* — and `:852-862` draws a rail of Home · The record · Tasks · Search ·
Subjects · Review. Neither file references the other's navigation. A reader cannot tell
which application these ten surfaces belong to.

---

## 3 · USABILITY

**U-1 · Absence is explained, deleted, and forbidden — one rule, three behaviours.**
`SB-CORE.md:350-351` prints one sentence per surface (*"This credential can read the queue
and cannot act on it"*). `SB-EVIDENCE.md:840` deletes the equivalent sentence as F-7 and
then records at `:1494-1497` that it does not know whether the deletion helps.
`SB-OUTPUT.md:231-236` forbids it outright — *"no greyed control and no explanation"* — and
repeats it for O3 at `:1751-1755`. Membership v2 §5 settles only that the capability is
absent, not whether its absence is narrated. Three files should not each guess.

**U-2 · `S1` means two different surfaces.** In `SB-CORE.md` and `SB-EVIDENCE.md`, `S1` is
the QUEUE (journey step). In `SB-OUTPUT.md:231`, `S1` is the *absent* state of the
publication ceremony, and `S7` is a ceremony step while `SB-EVIDENCE.md` uses `S7` for the
PROJECT WORKSPACE. Cross-file references are already ambiguous inside the corpus.

**U-3 · The attention layer's ordering is undrawn.** `SB-CORE.md:1671-1674` records that
ordering within a class is unresolved and that *"every frame in §1 is drawn in an arbitrary
order for that reason."* The queue's entire justification is that it is the attention
layer; no frame shows what a member sees first when the seven items are seventy.

---

## 4 · What I attacked and could NOT break

Stated at length, because the brief is right that this is worth more than a padded list.

**The prefill rule held, everywhere, and it is the strongest thing in the corpus.** I
looked for a template, a placeholder, a "suggested reason", a carried-forward default, a
pre-selected radio on an authored field, and an LLM draft. Every authored field in all ten
storyboards ships empty and says so: `SB-CORE.md:654-663`, `:1179-1184`, `:1233-1236`;
`SB-EVIDENCE.md:356-359`, `:1267-1270`; `SB-OUTPUT.md:495-516`, `:1517-1531`. The single
prefill that exists in the live system — `counterparty: to be named` — is independently
DELETED by two files (`SB-EVIDENCE.md:841`, `SB-OUTPUT.md:1834`) that did not coordinate.
D-10 above is a hit on the SELECTION performed by an assembly panel; it is not a hit on
generation, and I want that distinction recorded rather than blurred to inflate a count.

**"Absent, not greyed" held.** I looked for a disabled control and found none in ten
storyboards. Each file removes the ENTRY POINT, not the button (`SB-CORE.md:354`,
`SB-EVIDENCE.md:387`, `SB-OUTPUT.md:239-249`), and each names the same reference
implementation (`setup.mjs:624` / `:463`). The disagreement is only about narration (U-1).

**I could not find a hidden `undetermined`.** I checked every error, partial and
degraded state in three files: `SB-CORE.md` Q4/Q7/Q12/I3/I12, `SB-EVIDENCE.md`
E4/D2/D3/D4/D9/W8, `SB-OUTPUT.md` S4/S7/S9. In every one it is stated, and
`SB-EVIDENCE.md:479` and `:688-699` go further by DELETING an invented seal — a surface
asserting a standing the record never gave — and replacing it with the primitive. The
failure in this area is inconsistency of shape (C-14) and of composition (D-2), never
suppression.

**The collapse held on its forward edges.** I tried to find a stage requirement that
contradicts another and could not: `open` requires nothing, `concluded` requires a
conclusion and a falsifier, `published` requires the exclusion statement and its
non-carry-forward, and each is a per-state entry requirement on the C-2.7 precedent
(`BIO_Case_Making_v0_1.md:331-337`, `SB-OUTPUT.md:806-808`). The mechanism genuinely
carries a question and a conclusion in one lifecycle. D-5 is a failure of the WALK-BACK
edges only, and that is a fixable refusal, not a reason to un-collapse.

**I tried to re-separate `case` from `finding` and failed.** The completeness claim
survives the collapse as a required heading whose bytes are inside `bundle_sha`, and
`SB-OUTPUT.md:180-193` and `:766-772` give the reason I could not answer: a side table is
not covered by the hash, so a corpus rebuilt by a stranger would carry the conclusion and
drop the caveat — *"H5's forbidden compression performed by the architecture."* That
argument is correct and it is the best single decision in the three files. It also produces
the ceremony's ordering constraint (the exclusion changes the sha, so the signature must
follow it, `SB-OUTPUT.md:539-554`), which I also could not break.

**I tried to break the pull-not-push supersession model and could not.**
`SB-OUTPUT.md:1207-1216` argues from §8.2 that a subscriber list requires identity and the
published bucket is deliberately readable without one. The cost is stated honestly (a
journalist who quoted the case is not notified and cannot be). I looked for a way to notify
without identity and did not find one that does not reintroduce a channel.

**Producer-published options held as a constraint in two of three files.** SB-CORE marks
its own C5 as not honourable today (`:388`, `:1402`), SB-EVIDENCE draws `[ options
published by the producer ]` rather than inventing a map and REMOVES a feature rather than
keep a surface-side vocabulary (`:1105`). That is the constraint being obeyed at a cost,
which is the only evidence that a constraint is real. Only SB-OUTPUT's O3 quietly violates
it, and only because its constraint list omits it (C-13).

**The per-item retention frame held.** `NOTIFICATIONS.md:246-252` requires retention to
carry its reason, and `SB-CORE.md:293-313` draws it with the plane's own named refusals and
routes the member somewhere. I tried to find a state where a retained item strands the
member and could not; A14 (`SB-CORE.md:803-810`) even handles the case where the op does
not exist, preserving and offering to copy the authored text.

---

## 5 · What should be settled first

Not a build order — the three things below block the others from being answerable.

1. **D-2 / D-4 — what a leg's grade IS, and what `undetermined` does to a chain.** Every
   frame that shows a strength, every threshold rendering, and C-21.2's inheritance rule
   are undefined until this is answered, and one plausible implementation (`#weakerGrade`
   unchanged) answers it wrongly and silently.
2. **D-1 — whether a published bundle may be revised.** It decides what the CASE page
   shows, whether `published` is terminal, and whether the public index is a projection of
   one claim or of several.
3. **C-1 / D-5 — the refusals the collapsed lifecycle owes its own recursion.** A cycle
   guard, and a `CITED`-shaped refusal on the walk-back edges. Both are small; both are
   currently absent from every GAP list.
