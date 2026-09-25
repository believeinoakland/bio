# Notifications: the catalogue, the classes, and the item contract

**Status** · The notification catalogue, the three classes and the item contract, written 2026-08-01 (session BOB) at Bob's direction and carrying four of his rulings of that day verbatim (FINDING as the substrate of case-making, OBLIGATION as the civic system's own flows, CONDITION as the signal layer with three dispositions, and one queue with three homes); one line was corrected in place on 2026-08-05 (the bias-debt entry, per DEC-20 / D-188). PARTIALLY COMPLETE: the doctrine is settled and BUILT, the catalogue is a real registry, and MOST OF THE GENERATORS IT INVENTORIES DO NOT EXIST — which is the correct direction and is stated here so it is not inferred. **What of the queue content is built, measured 2026-09-14.** The QUEUE SURFACE is **[BUILT]** and was built FIRST, as `MILESTONES.md` M8's build order requires (*"the queue first — attention layer, sharpest gap, plane half ships"*): `op=queue`, `op=tasks` and `op=queuemute` on the plane (REC-20, REC-21) and `SURFACES["queue"]` in `civicos-ui/app.html` (UI-1, UI-14, UI-45, UI-55). The CATALOGUE is **[BUILT]** as machine-readable state rather than as prose — `bio-plane/src/queuestate.mjs` carries **37 kinds** (12 CONDITION, 6 OBLIGATION, 19 FINDING — measured 2026-09-25 by D-523 by importing the file; this line read 35 with 18 FINDING, one FINDING stale before D-523 added its CONDITION) under the catalogue's own SLUGS, `classOfKind` is the one class lookup, and `store.mjs` refuses at the MINT any CONDITION kind the file does not name. **The GENERATORS are 11 of those 35**: eight are annotated `LIVE:` at their entry (`authority-undetermined`; `bias-debt`, D-86's alarm sweep, 2026-09-23; `missing_predecessor` and `overdue_successor`; `out-of-inquiry-lead`; `stance-changed-here-not-elsewhere`; `new-version-arrived-from-another-team`; `export-performed`, D-52's, raised to every administrator and to nobody else) and three CONDITION kinds are derived on read by `op=queue` (`governor-holding-host`, `partial-capture-outstanding`, `capture-completed-unattended`), the file's own header stating that the other EIGHT conditions have none; **a fourth derived CONDITION, `render-deferred`, is LIVE since D-523 (2026-09-25, BOB #33's ruling of 2026-09-24 19:54Z): a render request held under its reason, or released UNDETERMINED at its `expires` (`store.mjs #conditionsRenderDeferred`; CLIENT-RENDERED.md, its RULED section)** — so **24 of the 35 entries below are [DESIGNED-not-built]**, and D-126's per-item weight is now BUILT (below). The THREE CLASSES are **[BUILT]** and enforced, not remembered: the mute fence refuses an OBLIGATION by class rather than by list, in both of the mute's forms, driven in `bio-plane/test/d125-findingmute.test.mjs`. **A member's PERSONAL mute of a FINDING — DEC-10's (b) per item and (c) per case over the kinds named — RULED 2026-09-22 by BOB #26, is [BUILT] by D-125's landing (2026-09-23), and so is D-170's widening (the ITEM form reaches an ungrouped CONDITION):** `op=queuemute` takes `{ case, kinds }` with CONDITION and FINDING kinds, or `{ item }` keyed on the item's published id in the derived table `queue_item_mutes` (cleared by the whole-store `purge`); neither writes a disposition, and `op=queue`'s `mute` block states each suppression with its `scope`. The member SURFACE offers both since UI-86 (2026-09-24): the queue's case group names FINDING kinds beside CONDITION kinds, every CONDITION and FINDING item — an ungrouped condition included — carries a per-item mute sending `{ item }`, and the feed's report reads `mute.items`; `civicos-ui/test/notifications.test.mjs` §2 and `queue.test.mjs` (7b) drive it. **UNMUTE is OFFERED since UI-97 (2026-09-24) and is [BUILT] in both forms**: `queueMuteReportHtml` — the report block, which is the only place a member's own mutes are named, a muted item not being in the feed to carry a control — draws a per-item "Let this reach me again" sending `{ item, unmute:true }` and a per-case "Let these reach me again" sending `{ case, kinds, unmute:true }`; `civicos-ui/test/queue-unmute.test.mjs` drives both round trips against a real plane under miniflare and `notifications.test.mjs` §2 drives the bodies. **The per-case control is NARROWED, stated rather than hidden: it names only the kinds on `suppressed[]`, because `op=queue` publishes `mute.cases` as case IDS and the muted KINDS nowhere, so a case whose mute is holding nothing back today gets no control and a sentence saying why** (D-534, the plane's). **The PLANE half of that is CLOSED by D-534 (2026-09-25, I3 additive):** `op=queue`'s mute block publishes `case_kinds` — case id to the kinds that case mutes — BESIDE `cases`, which is unchanged because every reader holds it as a list of ids; `bio-plane/test/d125-findingmute.test.mjs` names and undoes a case mute that is suppressing nothing, from the feed alone. The surface still draws only from `suppressed[]` until UI-107 reads it. **D-86's bias-debt OBLIGATION NAMES ITS RUN on that surface since UI-93 (2026-09-24):** `queueSubjectHtml` carried branches for a bundle, a progression stage, a host and a capture and NONE for a subject of kind `run`, so it fell through to `""` and the item told a member a re-run was owed without saying on WHICH run — the item's only identifying half, missing. The branch now renders the run and its context from the item's own `subject` (the context's kind in the record's own spelling, because `aiRunOpen` stores `String(contextType)` unfenced), points at nothing because no address in the application opens a run by id, and renders the producer's `recipients_stated` sentence verbatim where it could name nobody inside the run's read gate; `civicos-ui/test/notifications.test.mjs` §7 drives both phases and `notifications.control.mjs` arms 15/15b/16 are its control. **And it names the members it is ADDRESSED to since D-528 (2026-09-24):** `queueAssigneeHtml` read `assignee` alone, so every member the producer named in `recipients` — the only members `#obligationsBiasDebt` shows a named item to — was told *"This is not addressed to anybody"*; it now renders `recipients` as the record spells them, the viewer marked, and keeps that sentence only where `assignee` and `recipients` are both empty (`civicos-ui/test/queue-recipients.test.mjs`, against the real plane, with its control). The ITEM CONTRACT is **[BUILT]** but for its id: rule 1 (options come from the producer) is asserted structurally — UI-45 §1 pins that the surface holds NO per-kind wording table and names no kind slug at all — rules 2, 3 and 4 hold, and the `kind` field carries a SLUG: the first `N-<n>`, N-1, was allocated by D-52 (2026-09-23) to `export-performed` and is published BESIDE the slug as `catalogue_id`, because every reader of `kind` is keyed on the slug and moving the id into it is an interface change, not a numbering. The HANDLED SCOPES are all three **[BUILT]**: obligation resolved through `op=taskresolve`/`taskforward` (record state), finding adopted/deferred/dismissed through `op=proposedispose` (authored, with author and reason), condition acknowledged or muted through `op=queuemute` (personal, and per-KIND rather than all-or-nothing since UI-55). The **per-item weight is [BUILT]** (D-126, 2026-09-23, IC-235): `affordances.mjs` publishes `per-item` for `op=proposedispose`, `op=taskresolve` and `op=taskforward` (served as `op=affordances`' `set_acts`), each takes a SET as `items` through `store.mjs #perItem`, every item applied or RETAINED with its own act's refusal (C-75), and the queue applies a handler to a selection and keeps each retained item listed with that reason; UI-55's ARM 4d was CORRECTED to measure the set form. **The queue's BULK FORWARD is [BUILT]** (UI-94, 2026-09-24, I3 consumer of IC-235 and no plane change): the selection bar offers `op=taskforward` beside `op=taskresolve`, the member is chosen ONCE and rides as the act's shared key, and each obligation is forwarded or kept in the list with that act's own refusal — the picker withholds a member the WHOLE selection already belongs to, and nobody else. The per-item picker is untouched, so neither mode is forced; `civicos-ui/test/queue-peritem.test.mjs` §4 drives three in one act against the real plane. **A PROJECT-SCOPED FINDING MAY JOIN THAT SELECTION** (REC-205, 2026-09-24): the act already carried a per-item `project` — measured, not assumed, and the row that asked for it was wrong about the plane — but nothing asserted it, and driving it found two defects now closed. A project named ONCE for the set reached every other item, so a progression finding beside it was refused NO_FINDING; `#perItem` now narrows the shared body by the act's own published `item_keys`, which is why a selection may mix the two identity shapes. And a CONDITION or an OBLIGATION in the selection was told to define a progression; it is refused CLASS_NOT_DISPOSED (C-33.44, carrying a canned translation, so the count of untranslated codes did not move) naming the act that does reach it (`op=queuemute`, `op=taskresolve`), the same true-and-useless refusal IC-60's bridge exists to have replaced. `definitionVersion` joins the published `shared_keys`. **AND THE SURFACE TAKES ONE since UI-110 (2026-09-25):** `queueSetOpsFor` (UI-94's name for `queueSetOpFor`) answered no set act for an item whose `disposition.scope` is `project`; it now offers one wherever the record publishes a home for it, and the set act sends each such item as `{ project, finding }` — its OWN project where `disposition.projects` names one, and where it names SEVERAL, the case the member picks on the item, which is ASKED and never defaulted (D-266): until the member names one the item stays selected, is counted in the selection bar as held back, and is NOT SENT. `civicos-ui/test/queue-projectscope.test.mjs` drives both against the real plane and reads each decision back under its case. **What reaches the member when the plane refuses such an item is the plane's own `detail`, verbatim — NOT a DEC-49 canned translation, because the plane mints `NO_PROJECT_SCOPE` with no `code`/`translation`** (the plane's defect, D-623, minted by UI-110's worker and sent to SCHEDULER). Of the three HOMES beyond the queue, the case is **[BUILT]** (D-127 designed and built through the IS plan, `BIO_System_Design.md` §3 construct 8), the institution's flow model is **[DESIGNED-not-built]** (D-128, M4, open) and the signal history is **[ABSENT]**. **WHAT SETTLES A BIAS-DEBT OBLIGATION is [BUILT]** (REC-207, 2026-09-24, from BOB #32's ruling of 2026-09-23 23:42Z): three acts, each RECORDED and append-only — the lens moving back, a re-run under the lens now in force (`op=airunopen`'s authored `rerun_of`, discharged at its own close), and a member's resolve with a required stated reason (`op=biasdebtresolve`) — read back by `op=biasdebt`; and an OBLIGATION's resolving act is now a property of its KIND, published on the item as `disposition.instead`, because `op=taskresolve` addresses `tasks` and a bias debt is keyed on the RUN. This Status carries every landing it names, REC-205's and REC-207's of 2026-09-24 among them, and is current as of 2026-09-25 (UI-86, UI-93, UI-94, UI-97, REC-205, REC-207, D-528, D-534, D-523, UI-110).

**Place in the system** · A level-2 design with TWO homes, and the split is real rather than bookkeeping. Its primary level-1 home is `docs/architecture/BIO_Interaction_Constructs_v0_1.md` — construct 12 of `BIO_System_Design.md` §3, member surfaces — which defines the QUEUE construct and, in its own Place, *"hands queue content to `docs/development/NOTIFICATIONS.md`"*: that document says what a member LEARNS, this one says what the system may PUT there. It also serves construct 10 (standing intent and monitoring), where `BIO_System_Design.md` §3 lists it beside `SCHEDULER.md`, because most of its generators are clock- and monitoring-driven and the alarm that fires them is construct 14's. Its catalogue is enacted in `bio-plane/src/queuestate.mjs` and rendered by `civicos-ui/app.html`'s `__NOTIFICATIONS_START__` block; `SCHEDULER.md` is the alarm model it shares ground with, and the two must not grow separate kind vocabularies. It closes the ad-hoc-event-strings half of D-68 and is the design of record for D-126.

**Incomplete sections** ·
- §The catalogue — of the 37 kinds `queuestate.mjs` now carries, all but the live ones named in the Status above have NO PRODUCER, and this list does not say which (this read *24 of the 35* with *the live eleven*; D-523 added a kind WITH its producer, `render-deferred`, and found the FINDING roster already one larger than the count, so the unproduced figure is not re-derived here); the file that knows is `bio-plane/src/queuestate.mjs`, whose header states the split.
- §The catalogue — the ids it says will be allocated *"when a generator is built"* have begun and are behind: N-1 (`export-performed`, D-52) is the only one, held in `queuestate.mjs` `QUEUE_KIND_IDS` and allocated with `node tools/mintid.mjs N`; the nine generators built before it took none. `kind` still carries the slug and the id rides beside it as `catalogue_id`, which is not the item contract's sketch (`kind: "N-14"`).
- §Applying a handler to a selection — BUILT 2026-09-23 by D-126 (IC-235); the section's body and its weight table still read `per-item` as [DESIGNED-not-built] and are not rewritten here. The project-scoped half was CLOSED 2026-09-25 by UI-110 (the Status above states it); it read *"What stays open: a project-scoped finding is not selectable (its act names a project per item)"*. **The bulk-forward half was CLOSED 2026-09-24 by UI-94** — it read *"`op=taskforward` takes a set on the plane but the queue has no bulk forward (its member picker is per item)"*, which was true on D-126's landing and is the gap UI-94 built; the Status above states it. (REC-205 had CORRECTED its reason on 2026-09-24 — the plane takes a per-item project — and left the surface's exclusion as a UI row, which is UI-110.)
- §What the three classes actually ARE — records that case-making (D-127) and the declared-versus-observed delta (D-128) were NOT DESIGNED ANYWHERE when this was written. D-127 has since been designed and built; D-128 is still open at M4. Neither correction is in the body.
- §Presented and treated differently — the three homes beyond the queue: the case exists, the institution's flow model does not, and the signal history has no surface and no item.
- §MARKED AS HANDLED — a member's PERSONAL mute of a FINDING (DEC-10's (b) per item, keyed on the finding's stable identity, and (c) per case over the kinds named) and the item form's reach to an UNGROUPED CONDITION (D-170) are BUILT on the plane (D-125, 2026-09-23) and OFFERED on the queue surface (UI-86, 2026-09-24). UNMUTE is offered too since UI-97 (2026-09-24), in BOTH forms, from the mute report. WHAT IS STILL OPEN is now the SURFACE's: the per-case unmute names only the kinds on `suppressed[]`, so a case mute suppressing nothing today gets no control — the plane has published those kinds as `mute.case_kinds` since D-534 (2026-09-25) and UI-107 is the row that reads them. The section's BODY does not carry the unmute half at all.
- §What this does not settle — still unsettled: transport is in-app only and email would re-raise the F5 threat; which CONDITIONs earn an item is per-generator and answered for three of eleven. The N-number allocation has begun (N-1) and whether `kind` moves to it is open.

**Contents**
- [The first finding is the size of it](#the-first-finding-is-the-size-of-it)
- [What the three classes actually ARE — Bob, 2026-08-01](#what-the-three-classes-actually-are-bob-2026-08-01)
- [Presented and treated differently — decided](#presented-and-treated-differently-decided)
- [The classes: three, not four severities](#the-classes-three-not-four-severities)
- [The catalogue](#the-catalogue)
- [The item contract](#the-item-contract)
- [Applying a handler to a selection: per-item outcome](#applying-a-handler-to-a-selection-per-item-outcome)
  - ["MARKED AS HANDLED" — and handling has a SCOPE, which differs by class](#marked-as-handled-and-handling-has-a-scope-which-differs-by-class)
- [What this does not settle](#what-this-does-not-settle)

---

Written 2026-08-01 (session BOB) at Bob's direction, after three consecutive rulings
landed on the queue construct: *"we're dealing with several notification-ish constructs
that are generated by the system due to ongoing data flows and the clock just moving
forward… it's important that we appreciate the complete set of, groups of, and general
types of these notifications."*

Companion to `architecture/BIO_Interaction_Constructs_v0_1.md`, which defines the QUEUE
construct. That says what a member LEARNS; this says what the system may PUT there.

## The first finding is the size of it

Counted below: **about thirty distinct generators**, across capture, monitoring,
governance, analysis and our own machinery. That number is the argument for a
catalogue. Thirty ad-hoc notification sites means thirty places that each invent a
wording, a severity and a set of buttons, and the drift is guaranteed rather than
likely.

**This is a lesson the project has already learned once and written down.**
`CONSTRUCTS.md`'s overlap list, item 5: *event types are ad hoc strings with no
registry… which is the same lesson the check catalogue already taught the plane.* So
notification kinds get **stable ids the way checks do** — `N-<n>` beside `C-<n>` — and
this catalogue closes the ad-hoc-event-strings half of D-68.

## What the three classes actually ARE — Bob, 2026-08-01

The classes were derived here as a notification taxonomy. Bob's response reframes them
as three **domains of the CivicOS workflow**, of which notifications are only one entry
point. Recorded before the taxonomy below, because it changes what the taxonomy is FOR.

**FINDING is the substrate of case-making.** *"The system is about developing grounded,
justified, and meaningful analysis and conclusions. These are built upon evidence and
findings from that evidence. We haven't dove into that process of case making yet. But
it will certainly involve organizing and building upon this substrate and their
derivatives."* So a finding is not a message — it is a unit the analysis layer composes
with. The case-making process itself is **NOT DESIGNED ANYWHERE** and is now recorded
as D-127. A notification carrying a finding is one way a finding arrives; it is not
what a finding is.

**OBLIGATION is the civic system's own flows, and this corrects the class as written
below.** *"Obligations are the flows (edges) that go on in a living civic system.
Understanding those flows, evolving that understanding, and differentiating between how
things are supposed to flow and how they really flow (and the implications of those
differences)."*

The catalogue below defines OBLIGATION as "a named person must act for the record to
proceed" — that is a MEMBER task, and it conflated two different things:

- the **civic obligation**: the body's own duty, declared — minutes follow a meeting
  within N days, an award follows a solicitation. This is a model of how the
  institution is SUPPOSED to work.
- the **member task**: our workflow routing a piece of work to a person.

They are related in one direction only: **a member task frequently arises BECAUSE a
civic obligation was observed unmet.** The civic obligation is the primary object; the
task is downstream plumbing. Naming them one thing would have modelled our inbox and
called it the institution.

**And the analytic product is the DELTA.** Declared flow versus observed flow, and what
the difference implies. That is not a by-product of progressions — it is the reason to
have them. A progression definition is the declared flow; its instances are the
observed flow; a missing predecessor, an overdue successor and an out-of-order stage
are the three shapes of divergence. Recorded as D-128.

**CONDITION is the signal layer of a working civic system**, and this too is broader
than written below. *"Conditions are the signals and side-effects of a working civic
system. We need to notice what's happening. Sometimes these happenings are just a part
of the record, sometimes they just need to be noticed though not acted on, and some
need to be acted on."*

The class below scopes CONDITION to "a fact about our own machinery". That is a SUBSET.
The class is signals generally — the civic system's included — and Bob's three
dispositions are the useful axis:

| disposition | what it means | example |
| --- | --- | --- |
| **recorded** | part of the record; no surface at all | a monitor tick that found nothing changed |
| **noticed** | worth seeing, not worth acting on | the governor is pacing a capture |
| **actionable** | a member's action can change it | a capture stopped at the ceiling with work outstanding |

That replaces the cruder rule below ("a CONDITION earns a queue item only when a
member's action can change it") with a three-way one: *recorded* never surfaces,
*noticed* surfaces as status where the thing lives, *actionable* earns a queue item.
The middle disposition is the one a naive implementation loses, and losing it means
either drowning the member or hiding what is happening.

## Presented and treated differently — decided

Bob: *"Perhaps each of these deserve to be presented and treated differently, given the
very different roles they play in the workflow journey."*

**Yes, and it does not reopen the construct count.** The resolution is the same shape as
TASK-is-the-attention-layer:

- **The QUEUE stays ONE surface** — things that want me, grouped by case. A member does
  not learn three inboxes, and anything can reach them through one door.
- **Each class has its own HOME beyond the queue**, because the work each supports is
  genuinely different: findings compose into a **case** (D-127 — *undesigned* there is the **2026-08-01** framing; the design landed in `BIO_Case_Making_v0_1.md` and construct 8 reads built); obligations
  populate a **flow model** of the institution, declared against observed (D-128);
  conditions accumulate into a **signal history** that is mostly read as status on the
  thing it concerns rather than as a list.
- **The queue is the attention layer INTO those homes**, exactly as a task points at an
  act rather than becoming a second application.

So: one thing to learn, three places the work actually lives. The v0.2 collapse holds;
what this adds is that the three classes are not three item types in one list but three
DOMAINS the one list reaches into.

## The classes: three, not four severities

Bob's starting hypothesis was informational / requires-a-response / warning / error.
Adopting it as-is would import a **severity ladder**, and severity ladders encode how
LOUD a thing is rather than what it MEANS. They rot in one predictable direction:
everything becomes a warning. This project has a better axis available, because it
already sorts things by what the record may claim and by who must act.

| class | what it is | who acts | leaves the list when |
| --- | --- | --- | --- |
| **FINDING** | something true about the world or the record that may become evidence | anyone who can judge it | adopted, deferred or dismissed — an authored RECORD act, with its author and reason. A member may also stop being NOTIFIED of it, PERSONALLY (DEC-10; ruled for findings 2026-09-22), which leaves only that member's own feed |
| **OBLIGATION** | something a named person must do for the record to proceed | its assignee, or whoever it is forwarded to | resolved — record state, so it leaves EVERYONE's list |
| **CONDITION** | a fact about our own machinery, not about the world | usually nobody | acknowledged or muted — PERSONAL only; the condition persists |

Bob's four map onto this without loss: *requires a response* is OBLIGATION;
*informational* splits into FINDING and CONDITION depending on whether it is about the
world or about us; *warning* and *error* are **severity**, which is orthogonal and
mostly derivable — an unhandled obligation past its deadline is what "warning" means
here, and an "error" is a CONDITION that stopped something.

**Why FINDING and CONDITION must not be merged**, which is the load-bearing part: an
overdue minutes finding is evidence about a public body; a subrequest ceiling is a
limitation of our own run. Merging them lets our plumbing dilute the record's findings,
and it violates the standing UX rule that a technical complication the system can
classify is never surfaced to a member as a choice. **Most CONDITIONs should never
become queue items at all** — they are status on the thing they concern. A CONDITION
earns a queue item only when a member's action can change it.

## The catalogue

Ids are allocated when a generator is built, not now; this is the inventory that says
what exists to be numbered. Class in brackets.

**Clock-driven** — the generator is time passing, with no new evidence:

- overdue required successor in a progression `[FINDING]` (DEC-10)
- temporal expectation coming due `[FINDING]` (framework §8.2, D-73)
- a re-run owed after a lens change `[OBLIGATION]` (D-86 — **DISCLOSED, never
  blocking**; corrected 2026-08-05 per DEC-20 / D-188, where it read "blocks a
  transition" — the pre-DEC-20 blanket rule. Only an uncleared HUNCH
  disqualifies. `bio-plane/src/queuestate.mjs`'s copy of this line was corrected
  in the same change, and the two agreeing on the wrong thing is why a copy that
  agrees today agrees at zero cost). **LIVE from 2026-09-23 (D-86)**: the `bias-debt`
  consumer on the one alarm raises ONE item per run whose lens `moved`, as
  `op=airun` computes it and never recomputed, its basis naming the lens then and
  now, to the run's member principal and a project run's owners, each inside the
  run's read gate (`bio-plane/src/store.mjs` `#biasDebtSweep`, IC-234). **AND SETTLED, three ways, each
  RECORDED — REC-207, 2026-09-24, from BOB #32's ruling of 2026-09-23 23:42Z** (the ruling is in
  `architecture/BIO_Declared_Bias_v0_1.md` §"Bias debt, and HUNCH DEBT"; the scope half is stated in
  §"MARKED AS HANDLED" below): the lens moving back, a RE-RUN under the lens now in force
  (`op=airunopen`'s authored `rerun_of`, discharged at that run's own `op=airunclose`), and a MEMBER'S
  RESOLVE with a required stated reason (`op=biasdebtresolve`). Every settlement is an append-only row in
  `bias_debt_settlements` and is read back by `op=biasdebt` — **`op=taskresolve` is not the door and never
  was: it addresses `tasks` by id and a bias debt is keyed by the RUN**, which is why the item's own
  `disposition.instead` now names `op=biasdebtresolve`
- monitoring recheck due / deadline sweep `[CONDITION]` (S-7)
- archive-fallback eligibility reached — three failures or fourteen days `[CONDITION]` (D-104)
- capture session TTL expiring with work outstanding `[CONDITION]` (CAPTURE-SCALING)

**Data-flow driven** — ongoing capture and monitoring:

- authority undetermined at capture `[OBLIGATION]` (D-98, RULED: created automatically)
- monitor tick: source modified `[FINDING]` · source removed (404/410) `[FINDING]`
- source unreachable, and distinguishably: governed by our own pacing `[CONDITION]` (D-104)
- duplicate document detected `[FINDING]` (D-60)
- link verdict established or changed when a target lands `[FINDING]` (LINK-FIDELITY 8)
- a reused asset later found changed, post-hoc `[FINDING]` (CAP-4)
- a capture the member walked away from has completed `[CONDITION]` (D-61)
- partial capture: platform ceiling reached, subresources outstanding `[CONDITION]`
- text undetermined — no text layer, CID fonts, over the envelope `[CONDITION]` (CPDF, D-121)
- client-rendered shell captured and not citable `[CONDITION]` (D-64)
- a render deferred — held under its reason (C-83, or the drain's rate rule for a tick), and at its request's `expires` recorded UNDETERMINED and released `[CONDITION]` (D-491, D-523; BOB #33 ruled 2026-09-24 19:54Z) — **LIVE**: `store.mjs #conditionsRenderDeferred`, slug `render-deferred`, derived on read from `capture_requests`; the reason is the code's own DEC-49 translation, never re-typed

**Governance and membership:**

- endorsement owed on a pending administrator or owner vote `[OBLIGATION]`
- expertise declaration awaiting an administrator's confirmation `[OBLIGATION]`
- membership request at the doorbell `[OBLIGATION]`
- an export was performed — every administrator is notified `[FINDING]` (D-52 §8.1) — **N-1, LIVE**: `store.mjs #findingsExportPerformed`, one item per `export_log` row in every administrator's queue and nobody else's
- every owner of a project is inactive; rescue is available `[OBLIGATION]` (D-47)
- an invitation was spent, or expired unused `[CONDITION]`

**Analysis (M4), each of which is a PROPOSAL in queue terms:**

- assistant-surfaced focus `[FINDING]` (D-78, D-82 — must LOOK derived)
- missing predecessor in a progression `[FINDING]` (D-73 — the sharper of the two)
- a connection whose grade is improvable `[FINDING]` (D-72)
- gap list derived from an objective's satisfaction condition `[FINDING]` (D-76)
- measure decay on a bias statement `[FINDING]` (D-87, D-90 — reports, never blocks)
- **the out-of-inquiry lead** — evidence for ANOTHER question, met while working this one
  `[FINDING]` (D-213, answered 2026-08-06 by Bob as DEC-60's remaining hole; **LIVE** from
  PL-15: `store.mjs #findingsOutOfInquiryLead`, slug `out-of-inquiry-lead`).
  Three things about it are the whole entry and none of them is optional:
  **(1)** it is a FINDING and not a CONDITION — it may become evidence and leaves the TEAM's
  list only by an authored act, where a condition is only acknowledged; a member's PERSONAL
  mute (DEC-10, ruled for findings 2026-09-22) hides it from that member alone and is stated
  in their feed, so no member can silently take a lead from the team (this read *a condition
  is personally mutable, and one member could otherwise silently mute a lead the team must
  see*, which a per-member mute never could, corrected by BOB #26);
  **(2)** its `case` set derives from the ancestors of the inquiry the evidence BEARS ON,
  never from the ancestors of the inquiry the run was working — filing it under the run's
  own question is precisely the mistake that made it homeless;
  **(3)** the document is CAPTURED and **no basis entry is made**, and the item's `basis`
  says so as a MEASUREMENT rather than leaving a reader to infer it from an empty field
  (`CLAUDE.md`: absence at one level is not evidence of absence at the next, and saying
  which is a first-class obligation).

**Integrity and operations:**

- `op=audit` finding on the record `[FINDING]`
- register entry whose bytes are unbacked `[FINDING]` (D-9, D-45)
- governor is holding a host — the capture is PACED, not broken `[CONDITION]` (D-103)
- CPU or subrequest ceiling reached `[CONDITION]` (D-54, D-56)

## The item contract

Bob's requirement: a concise description, a fuller explanation with greater context,
and a set of options with handlers behind them.

```
{ kind:    "<slug>",                  // stable slug; RULED BOB #31 2026-09-23 (D-52): kind stays the slug
  catalogue_id: "N-14",               // the catalogue id rides BESIDE it
  class:   "finding" | "obligation" | "condition",
  subject: { bundle?, progression?, member?, host?, … },
  case:    <focus/project id> | null,  // the grouping key (DEC-10)
  summary: "Minutes for the 4 August meeting are 21 days overdue.",
  detail:  { …why the system believes this, in the record's own voice… },
  basis:   "…the derivation, or how it is undetermined…",
  options: [ { id, label, weight, needs: […] }, … ],
  raised:  <instant>,  deadline: <instant> | null }
```

Four rules, each earned by a defect this project already has:

**1. The OPTIONS come from the producer, never from the surface.** *Precedent, recorded
2026-08-01 so a later session arguing for a convenience kind-to-actions map has to answer it:
GitHub's Checks API lets a check run declare its own `{label, description, identifier}` actions
which GitHub renders and dispatches back as `check_run.requested_action`. Producer-declared
options rendered by a surface, in production, at scale (`PRACTICE-SURVEY.md`).* A UI that keeps its
own map of which actions apply to which kind is a drifting copy — precisely the defect
measured in the UI today, which hand-composes query syntax while `op=searchfields`
exists to prevent exactly that. The producer publishes the options; the surface renders
them.

**2. `summary` is in the record's voice and invents nothing.** The member-facing
vocabulary guard in the UI suite applies to every string here.

**3. `detail` carries the BASIS, and an undetermined basis says so.** D-57 is the
cautionary case: `resolveLinks` reported a self-reference as "the target changed", the
UI printed the plane's basis verbatim, and a member read a fabricated claim about a
source. A notification asserting something about a public body must be able to show
its derivation or state that it cannot.

**4. A CONDITION is status until a member can change it.** Never a queue item merely
because the system noticed something about itself.

## Applying a handler to a selection: per-item outcome

Bob's requirement, and it is the sharpest part: *"select some (or all) to apply the
action to. When the handler is applied to a notice, it would then indicate whether that
notice can be deleted from the list. If that action didn't work for one or more, they'd
stay in the list so that the user can take a different action."*

That is **a weight the plane does not have**.

**CORRECTED 2026-09-14 (M0-27): this read "a third weight, beside the two the plane
already implements", and both halves of that have moved.** The plane's act catalogue
publishes **THREE** weights today — `refuse`, `report` and `single` — and **`per-item`
is [DESIGNED-not-built]: it exists nowhere in `bio-plane/src/`.** Read the weights from
the catalogue rather than from this table:

    grep -aoE 'weight: *"[a-z-]+"' bio-plane/src/affordances.mjs | sort -u

`single` is the weight added since, for an act that takes one key and has no set to
apply; it is not `per-item` and does not stand in for it. The alarm on this row is
UI-55's ARM 4d, which re-measures `op=proposedispose`, `op=taskresolve` and
`op=taskforward` every run and goes RED the day one of them accepts a set — so the gap
below is watched rather than merely recorded.

| weight | state | behaviour | where it is used |
| --- | --- | --- | --- |
| `refuse` | **[BUILT]** | all-or-nothing; on drift it stops and hands over nothing, so it cannot half-run | state-changing bulk acts (`dispose`, `retire`, `sever`) |
| `report` | **[BUILT]** | proceeds and says what moved | citing, reads |
| `single` | **[BUILT]** | one subject at a time; there is no set to apply | `conclude`, `reopen`, `publish`, the reading acts |
| **`per-item`** | **[DESIGNED-not-built]** | **each item independently succeeds or is RETAINED WITH A REASON** | what applying a handler to a notification selection WOULD use; no op accepts a set today |

**Retention must carry the reason**, or the member re-applies the same action and it
fails the same way in silence. The reasons are already named refusals in the plane and
render in its own words: the member lacks the capability for that item; the item moved
under them (drift — already detected exactly and classified from the manifest's
`writer` and `operation`); doctrine refuses it (`SEVERED_EDGE`, retire-refuses-cited,
dispose-refuses-`elevated`); or a precondition is absent (a reason is required and was
not given).

### "MARKED AS HANDLED" — and handling has a SCOPE, which differs by class

Bob accepted the correction and named the replacement: an item is **marked as
handled**, never deleted. The word matters because nothing here is ever removed from
the record — but handling has a SCOPE, and the scope differs by class. Getting that
wrong would let one member's inbox hygiene erase a finding for the group:

- **OBLIGATION resolved** → record state. It leaves EVERYONE's list. **And the ACT is the kind's own
  (REC-207, 2026-09-24):** `op=taskresolve` addresses `tasks` by id, so a kind whose obligation is keyed
  on something else has its own door — a bias debt is keyed on the RUN and is settled through
  `op=biasdebtresolve`. The item says which door it has, in `disposition.instead`, rather than leaving a
  surface to guess from the class.
- **FINDING adopted / deferred / dismissed** → an authored record act, carrying its
  author and reason. It leaves the list and stays in the record. **And PERSONALLY, a member
  may stop being NOTIFIED of it** (DEC-10's (b) and (c), ruled for findings 2026-09-22, BUILT on
  the plane by D-125 on 2026-09-23 — `op=queuemute`'s case and item forms — and offered on the
  queue by UI-86 on 2026-09-24): that leaves only that member's own feed, which states the suppression; it writes no
  disposition, moves no other member's list and leaves `op=proposals` untouched.
- **CONDITION acknowledged or muted** → PERSONAL only. It leaves that member's list;
  the condition persists and another member still sees it.

**Nothing is deleted from the record in any of the three cases — the word is HANDLED, and its scope is stated.** This is the
muting-is-personal / dismissing-is-a-record-act rule stated per class, and it is the
rule most likely to be lost when someone implements a delete button.

**RULED 2026-09-22 by BOB #26 (D-125, SCHEDULER #11's Q3): a member's PERSONAL mute admits FINDING
kinds.** DEC-10 is Bob's ruling on exactly this subject: the overdue notice must offer (a) remind me
again at a further increment, (b) stop notifying me about this one, (c) stop notifying me about that
group — *"muting is per member"* — and the finding stands. The fence that refused a FINDING
(`queuestate.mjs` `MUTE_REFUSAL_DETAIL`: *muting it would let one member's inbox hygiene erase the
group's question*) guarded the right hazard with the wrong key: a mute keyed on the MEMBER removes
nothing from anyone else's list, and a finding leaves the team's list only by the authored
disposition, which a mute never writes. So a FINDING is muted personally — (b) per item, keyed on
the finding's stable identity (the key its disposition already uses), and (c) per case over the
kinds present when the mute is made, so a new kind surfaces again — and the member's own feed states
what it suppresses. An OBLIGATION stays unmutable (a named person must act, and `tasks` carries no
per-member mute); a CONDITION is unchanged. DEC-10's session note keyed the group on the
connection's axes; Bob's amendment of the same day made the CASE the aggregation key, so (c) is per
case. The build is the BOB INBOX's entry of 2026-09-22.

**RULED 2026-09-23 by BOB #29 (D-170, SCHEDULER #14's LED-7 question): D-125's ITEM mute reaches an
UNGROUPED CONDITION.** `queue_state` is keyed `(member, case)`, so a condition with no case — the
first is `governor-holding-host`, whose documents nothing rests on yet — could not be silenced, and
REC-32 left it so because the two ways out were an invented pseudo-case (REC-20 refuses one) and a
case-less per-KIND mute (one step from mute-the-kind-everywhere). D-125's item form is neither: it is
keyed on the ITEM's stable identity, not on a case, and it is personal. So the item form admits a
CONDITION item exactly as it admits a FINDING, keyed on the item's published `id` (for a held host,
`CONDITION::governor-holding-host::<host>`, `store.mjs` `#conditionsGovernorHolding`); it removes the
item from that member's feed only, which states the suppression, and writes nothing — the condition
persists for every other member and still resolves for everyone when the hold ends. Because the key
names the host, a later hold of the same host stays suppressed for her until she unmutes it, and her
feed says so. **Still refused:** a case-less per-KIND mute of a condition (REC-32's hazard stands), and
any mute of an OBLIGATION.

**RULED 2026-09-23 23:42Z by BOB #32 (REC-207): what SETTLES a bias-debt obligation, and each act is
RECORDED.** The ruling itself is in `architecture/BIO_Declared_Bias_v0_1.md` §"Bias debt, and HUNCH DEBT"
and is not restated here; what belongs in THIS section is its consequence for handling. *"Three acts settle
a bias-debt obligation, and each is RECORDED; none clears it silently."* So the OBLIGATION bullet above is
true of this kind in all three cases — the item leaves everyone's list — and the scope question this
section exists to answer has a second half for it: **which ACT.** A bias debt is keyed on the RUN whose
lens moved, and `op=taskresolve` takes a task id, so before REC-207 every bias-debt item in the queue named
a door it could not go through. Three now settle it: the lens moving back (derived, no member behind it,
and the sweep records that it was the sweep), a RE-RUN under the lens now in force (an act by a run, closed
with that run's id and its lens pins so a reader sees WHICH run settled it), and a MEMBER'S RESOLVE with a
REQUIRED stated reason (an authored act, attributed, dated, append-only — DEC-24's authored-binds side, and
DEC-69, because a member who judges that the lens change does not bear on the finding is never forced to
re-run). **A settlement is APPENDED, never replaced**, so a debt raised again when the lens moves ONWARDS is
new debt with the old settlement still on record. The general rule this leaves for the next kind: *an
OBLIGATION's resolving act is a property of the KIND, and the item publishes it* — a surface must not infer
the act from the class.

## What this does not settle

- **Transport.** D-98 records Bob's flag that the inbox's transport might one day BE
  email. Everything above is transport-agnostic by construction, and the in-app channel
  already exists (`tasks`). An email rendering re-raises the F5 threat the inbox grammar
  was bounded for, and is a separate decision when somebody wants it.
- **Which CONDITIONs earn an item.** The rule is "when a member's action can change
  it"; applying it to each of the eleven above is per-generator work, not a decision to
  take in the abstract.
- **The N-number allocation.** Ids are assigned when generators are built, in the
  catalogue, the way C-numbers are.
