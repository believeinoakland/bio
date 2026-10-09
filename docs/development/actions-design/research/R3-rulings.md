# R3 · Rulings on actions (K, DEC) · research for ACTIONS-DESIGN #1

**Scope and method.** `build/rulings.md` (K1–K2422, 2,424 lines) was searched, not read whole. These terms were used, case-insensitive: action(s), action plan, action-grammar, action-clocks, filing(s), filing-templates, escalat*, consequence, conformance, monitoring, complaint, public comment, records request, PRA, petition, campaign, remed*, response option, outlet, reporter, lobbying, deadline, clock(s), notice-producers, queue-producers, N817 and D43. A second pass looked for counsel, addressee, counterparty, remind*, litigation, BIO_Action, DEC-26, DEC-61, DEC-94 and nag. The searches matched 574 lines, and every one was read in full. About three quarters of them are tranche mechanics: merges, ownership checks, accepted reds, code renames and row stamps. Those lines are summarised by group in §J and are not listed one by one. Every ruling that sets meaning, doctrine, scope, packaging or priority for the Action layer is listed below.

`build/rulings-active.md` was read whole. Its action-relevant lines are in §K. In `docs/development/DECISIONS.md` (the design stream's DEC register), every DEC entry that mentions actions, filings, escalation, deadlines, reminders or holds was read in full. The "Settled by Bob" sections of `ux-substrate/ux-substrate.html` on the same subjects were also read in full (sections 8, 9, 14, 15, 25, 31, 34 and 35, plus the unnumbered Action-layer sections). `journeys.html`, `layouts.html` and `views/` were grepped. They only cite these rulings and add none of their own, apart from DEC-116 (J3).

**Columns.**
- **Who** is one of four values:
  - **Bob (words)**: the ruling quotes Bob verbatim.
  - **Bob**: Bob ruled, recorded as "as recommended" or paraphrased.
  - **BOB**: BOB's detail under P17.
  - **Design**: the UX design session decided under P17.
- **Status** is "in force" unless a later line was found that replaces or amends the ruling. "Amended by" means the ruling still stands in part.

---

## A. The layer, its modules, priority and process

| id | date | gist | who | status |
|---|---|---|---|---|
| K11 | 09-26 | The Action layer (standards, conformance, consequences, actions, filings, escalation) is layer 9, between Publication and Operations. | Bob | In force for the layer. Its module list is changed by K1438 (standards and local-facts move to L5) and by later splits (action-grammar, action-clocks, action-plans, filing-templates). K11 itself is not re-worded (see §M). |
| K15 | 09-26 | The jurisdiction profile carries the action sections (jurisdictions R23–R30), built with the module. Bob: "no reason to defer". | Bob | In force |
| K88 | 09-26 | Drafts of standards, conformance and consequences: records are append-only, corrected by one superseding successor. An act's actor and an affected party are named by office or class, never as a person. The DEC-14 outcome of the group's own act is never read as a breach consequence. | BOB | In force. "Never as a person" is widened for harmed parties by K1484 row 7. |
| K92 | 09-26 | Actions R1–R39, filings R1–R20 and escalation R1–R20 drafted. (2) `records_request`, `request_for_comment` and `other` are product kinds; the rest come from the profile. (3) One escalation per determination. Stage table 1→2→3→4, 4→5, 4→7, 5→6, 5→7, back to 4 from 6 and 7. Stage acts are actions marked `breach: true`. Stage 7's purposes are a closed set of five. (4) A sent filing is one `sent` correspondence entry. (5) "The clock rule is actions' alone". | BOB | (1)–(4) in force. (5) is overtaken by K617/K624 (the clock moves to `action-clocks`). |
| K102 | 09-26 | Bob approved every layer 4–11 module's requirements "as recommended, 'for now'". The profile gains legal organisations' contacts, the Tier 2 advisory note, a holiday calendar, the oversight-body marker and a `federal` level. | Bob | In force. "For now" was lifted only for ratification, publication and strength (K1015), never for the layer-9 modules (§M). |
| K108 | 09-26 | (1) One vocabulary for a law's level: federal, state, county, city. (3) An escalation is a record object. (5) Filings R9: claim deadlines use the holiday calendar. | BOB (as recommended to Bob) | In force |
| K171 | 09-27 | Layer-9 extraction maps: `ESC-` records with states `open`, `suspended`, `ended`. An act's first determination mints an `ACT-` id (later made a kind of event, K1462). Filings R21 `availableActions`. Stage 7's purpose and standards sit on the attachment. | BOB | In force (`ACT-` reread through `events`, K1462, K1649) |
| K248 | 09-28 | Layer-9 merge order follows the module order. Factories `actionsOf`, `filingsOf`, `escalationOf`. Refusal families C-112–C-117. | BOB | In force, with later families (C-123 reminders, C-124 action-plans, C-125 filing-templates, C-126 local-facts) |
| K590 | 09-30 | The action plan and D1–D6 (detail in §B and §G). "Adding the `action-plans` module he left to BOB." | Bob | In force |
| K591 | 09-30 | The Action drafts are staged in `build/plan/action-design/` and folded at T17's close. `action-plans` is added to layer 9 after actions. Found: monitoring's `deadlineRecheck` has no caller, so overdue never reaches a member. | BOB | Applied |
| K592 | 09-30 | Bob: "make sure that this session only does design; you manage action development as you do all other development, in tranches with layers". A design session writes only its own folder. It hands drafts to BOB and never writes `build/`, code, canon or `main`. | Bob (words) | In force. It binds this lane. |
| K608 | 09-30 | (1) `BIO_Action_v0_1.md` is canon, whole. (2) Action development is prioritised so it "catches up … and keeps up". (3) The requirement drafts are complete enough to fold. (4) The plan-page view and `UX-ANSWERS.md` are approved (OQ-8, OQ-9, OQ-25). | Bob | (1), (3) and (4) in force. (2) is corrected by K629 and K649. |
| K611 | 09-30 | Fold basis: action-plans R1–R28, actions R45–R50, filings R22–R25, escalation R22–R23, monitoring R50, queue-producers R15–R17. Confirmed defects: `deadlineRecheck` uncalled, no Tier 1–2 templates or holidays. The overdue reminder stays a CONDITION, and the litigation-hold reminder stays in (both sent back to Bob). | BOB | Applied. The reminder points were answered by K613–K615. |
| K617 | 09-30 | Bob: splitting a module for size "is low level technical decision … it MUST be split". `actions` splits into `actions` (the record: kinds, basis, correspondence, lifecycle, override) and `action-clocks` (clock entries, member-set reminders, overdue, holidays, business days). | Bob (words) + BOB | In force |
| K624 | 09-30 | Splits are copy-then-delete. (3) A member's reminders are rows in action-clocks' own table, never a revision of the action document. (4) Overdue is a CONDITION. | BOB | In force |
| K629 / K630 | 09-30 | Bob: "We spoke 2 hours ago about how T18's top priority was going to be removing legacy elements." Then: "Yes, re-cut T18 now with legacy removal first." Action work goes beside it. | Bob (words) | Corrects K608 (2). The Action layer was itself pulled back into T18 by K649. |
| K648 | 09-30 | Bob: "make sure that the priorities we stated for T18 are the same priorities for T19. This includes transitioning away from legacy aspects of the development process, and adding action related support." | Bob (words) | Historical (T19 closed) |
| K649 | 09-30 | The T18 sweep moves action-clocks, actions, filings, escalation and action-plans back into T18 layer 9. | BOB | Applied |
| K653 / K768 | 10-01 | New helper module `action-grammar` (L9, before actions) takes the pure grammar and vocabularies (`RISK_TIERS`, kinds, C-117 rows). Actions keeps refusals at its own write. | BOB | In force |
| K921 / K927 | 10-01 | New layer-9 modules `filing-templates` and `local-facts`. Bob approved them (details in §C). | Bob (modules) + BOB (placement) | In force. local-facts moved to L5 (K1438). |
| K1438 | 10-05 | `standards` and `local-facts` move to layer 5. Conformance, consequences and action-clocks stay in 9. "K11's module list … amended when the move is planned." | BOB (Bob delegated, K1437) | Applied (standards built in L5 from T33) |
| K2382 | 10-08 | Investigation lane H12: D43, Bob: support members through the action plan, "Not today". It becomes a future design lane, N817, which BOB starts after the investigation lane hands off. | Bob (words, via D43) | Overtaken in practice: the lane started 2026-10-09 (RESUME). No K line records the start (§M). |
| K2389 | 10-08 | T40 opens. N817 is "Left out" (Bob's "Not today"). | BOB | Overtaken, as K2382 |
| K2420 | 10-09 | Investigation canon placed. Its amendments A–S edit, among others, `BIO_Action_v0_1.md` (amendment M is K2421). H42: "keep Action §4 rule 2's openly-stated-reason pass". | Bob | In force. Read the amended Action canon, not the 09-30 text. |

---

## B. The action plan

| id | date | gist | who | status |
|---|---|---|---|---|
| DEC-25 | 08-03 | What part of an action plan is published? Deferred. Provisional: **the plan is working material and is never published**, made structural. If this is ever answered the other way, it applies only to plans written after the change, "with the group told before they write". Bob: *"I also need to defer DEC-25 for now."* | Bob (words) | Deferred, with its constraint. Trigger: a group asks to include any part of a plan in a published case. |
| DEC-93 | 09-29 | The action-plan surface (S11). Bob: *"I've started a separate session that will be used for work related to Actions."* Moved to that session (ACTION_DESIGN #1). | Bob (words) | Closed. The plan page was approved there (K608 (4)). |
| K590 (1)–(10) | 09-29 | (1) The Action layer gets an action plan: "a member creates it, the system suggests options, the member chooses and lays them out; not project management". (2) No catalogue of response options. (3) No budgets. (4) One plan may address several related matters, and one option may serve several. (5) A plan may start from a compliant or unclear determination. (6) Lobbying only to enforce or restore an existing requirement (Operational Principle 1). (7) An unticked option is undecided; declining an optional act takes a reason. (8) Up to three scenarios. (9) Categories: mitigation, legal, awareness, journalistic, grassroots, other. (10) A plan may open when an inquiry begins. | Bob (paraphrased; full words in old `action-design/ACTION-PLAN.md`, see R4) | In force |
| K590 (closing rule) | 09-30 | "A member closes a plan with a reason, a plan never closes itself." | Bob | In force (action-plans R20) |
| K590 D4, D5 | 09-30 | D4: a project may declare its kind of work, which shapes suggestions only. D5: a started option may name the group's contact, which grants nothing. | Bob | In force |
| K608 (4) | 09-30 | Plan-page view approved: an outline, not a graph. Matters with their support; options collapsed with category and dates, sortable; declined options visible with reasons; up to three scenarios of phases with checkpoints and branches a member judges; what each started option became; a checks strip; a separate tray for the assistant's suggestions. No costs, budgets, assignees or scores; never published. | Bob | In force (UX §9; `views/plan-page.html`) |
| K660 | 09-30 | The planning skill. (1) Only a joined member starts it, one plan at a time, never automatic. (2) Bob: *"Rather than a hard limit of 5 suggestions, the feature should present the best first 5. But also provide a means for the member to ask to see the next 'tranche' of 5 options, and so on"*. No score shown. (3) No letter drafting in this skill. (4) Earlier plans from the same project only. (5) Bob: *"No legit reason I can think of not to switch it on as soon as development can properly support it"*. (6) The disclosure stops at adoption ("6: agreed"). (7) Suspected matters are allowed, with action-plans R19's flag. | Bob (words) | In force (action-plans R30–R34; run-rules R13–R15) |
| K662 | 09-30 | Planning-skill fold: `op=planproposals` gives pages of five with `next` and no score. Action-plans uses ai-runs and run-rules. | BOB | In force |
| K710 / K711 | 10-01 | (1) An inquiry is the project's when the project cites it. (2) "Short" is derived on read against `strength.projectBar`. (4) A plan is a record object `PLN-`. The module is built whole: R1–R34, 15 ops, family C-124. | BOB | In force |
| K905 / K914 | 10-01 | DEC-36 applies to plans: a hidden item is withheld whole, `out_of_view` only (action-plans R35). A determination flagged `out_of_view` reads "short". | BOB (under Bob's K903 (4)) | In force |
| DEC-114 | 10-01 | Bob: *"Q#34: matters"*. Members see "Matters" for what a plan addresses, everywhere. The internal term stays `subject`. | Bob (words) | In force (action-plans R36, K1180) |
| K1134 (7), K1180 | 10-02 | action-plans R37 `optionStartPreview` (DEC-115's start preview) and R36 ("matter"). | BOB | In force |
| K1463 | 10-05 | Money is followed whoever's it is, the group's own included. The Action layer's ban on cost and budget keys (action-plans R26) is unchanged, "since a plan holds no resources". | Bob (words in part) | In force |
| K1466 | 10-05 | Bob: *"A due date (like a CPRA response obligation) may be recorded as having been met or not. If the response isn't received by the due date, then [it may] cause other actions in an action plan to activate."* A duty's occurrence state is recorded, and a plan step may be conditioned on it. The group's own missed checkpoint is never a finding about the government (action-plans R23). | Bob (words) | In force. How it is built is open (§M). |
| K1661 | 10-06 | action-plans reads `projectsDrawingOn` from `leg-earning` directly. | BOB | In force |
| DEC-116 (J3) | 10-06 | The older "acting on a finding" journey is folded into the plan journey (journey 22): "one path from suspicion to outcome". | Design | In force |
| UX §8 | 09-29 | "In an action plan, not pursuing a matter is an option declined with a short reason." | Bob (via DEC-89) | In force |

---

## C. Actions, filings and templates

### C1. Actions: kinds, premise, evidence and records

| id | date | gist | who | status |
|---|---|---|---|---|
| K597 (3) | 09-30 | "The venue sets the standard of evidence: no action is refused for its grade." Filings and counsel packets show each exhibit's grade and, where the profile states it, the venue's standard. DEC-81's Grade A is a ceiling, not a minimum. | Bob | In force |
| K597 (5) | 09-30 | A confidential referral is an action addressed to the oversight office, sent by the member's own hand. Nothing non-public leaves by a system path (DEC-31). | Bob | In force |
| K600 (a) | 09-30 | DEC-26 with Requirement 12, option (c). An action asserting a breach without a live noncompliant determination is refused by default. A member may override by an attributed act with a stated reason, disclosed on the action and on every filing, packet and communication made from it. Evidence-seeking actions are never gated. An overridden action never joins an escalation. | Bob | In force (actions R8, filings R24, action-plans R18, escalation R23) |
| K600 (b) | 09-30 | Nothing is refused for its grade. Grades a venue may contest are flagged (actions R48; `GRADE-A-CAPTURE.md`). | Bob | In force (filings R25) |
| K603 | 09-30 | Actions R44: DEC-13's request for comment names an inquiry by an `advances` leg plus a clock entry. The response window's length is never enforced. | BOB | In force |
| K700 | 10-01 | R8's override is stored as `{reason, by, at}`. R9 refuses only a stated non-office counterparty. R46 `PLAN_LINK_REFUSED`. R48 pressure is a row of `action_pressure`. `completed` joins RESOLUTIONS. | BOB | In force |
| K702 | 10-01 | "The action's project" is the project of the first determination among its `rests_on` legs (null if none). Actions carry no project of their own. | BOB | In force. Note that the hold reader and purge in K1262 use the bundle's current project. |
| K707 / K709 | 10-01 | Actions R9's `entity_id` naming a person is checked through `entities` (actions uses entities). | BOB | In force |
| K1025 (DEC-88 audit) | 10-01 | `actioncorrespond` and `filingsent` take no further reason: their grounds are the captured bytes or the member's own account. | BOB | In force |
| K1447 | 10-05 | "An action is never a basis leg (D113)." | BOB (K1437) | In force |
| K1649 / K1657 | 10-06 | Actions R9 bridges to the office entity (alias and `post_in` line). R12, R25 and R33 run on the office's local day. New R61–R67: proceeding, `addresseesuggest`, sources fail closed without a viewer. | BOB | In force |
| K1724 | 10-06 | Bob: "D4: as recommended". A policy "cited, not seen" is held as a fact, and "it can drive a records request". "Not found" records the search made (portals, the records request and its answer). | Bob | In force |

### C2. Filings, counsel packets and templates

| id | date | gist | who | status |
|---|---|---|---|---|
| K13 | 09-26 | Tier 3 gets a counsel packet for named counsel, never published or fileable as it stands (amends Design Requirement 8). | Bob | In force, widened by K921, K924 and K927 (a brief at every tier; counsel needed only at Tier 3) |
| K316 / K319 | 09-28 | Filings packet reads and `filingsFor` leaked a hidden project's determination. Now sight is required of every drawn-on determination's project, per version, failing closed. "Read as keeping approved doctrine, reported to Bob." | BOB | In force (filings R11, R13) |
| K613 (3) | 09-30 | Filing templates: every filing has case-specific parts. A group builds a library of boilerplate templates over time. Where none fits, members use the assistant to draft one (a proposal a member adopts, D2), and a derivative may be kept as a template. "No job invents legal text." | Bob | In force, refined by K903 (6), K921 and K924 |
| K701 | 10-01 | Filings R22's floors are the project's bar (`strength.projectBar`). `templatesFor` (`op=templates`) completes R26's library. | BOB | In force. R26 later moved to filing-templates (K992). |
| K903 (6) | 10-01 | Bob: a filing's wording must be "optimally accurate, appropriate and compelling". Templates need **"a formalized authoring, approval and attribution process"**: who generated it, when, and its notes and comments travel with every template ("groups may one day share templates"). BOB may research a jurisdiction's holidays and office hours, **"with a process for confirming them"**. Until then the profile prepares no filing (`KIND_NO_TEMPLATE`). | Bob (words in part) | In force, except the interim `KIND_NO_TEMPLATE`, retired by K921 and K992 |
| K911 | 10-01 | Under DEC-36, when a determination is withheld, a filing's findings and standards lists stay `[UNFILLED: …]` with one why. They are never filled with the visible part. | BOB | In force (filings R27) |
| K921 | 10-01 | Bob answered the ten filing-template questions as recommended, with amendments. A template is the basis of a group's own filing (Tiers 1–2) or of a briefing to counsel (all tiers). It may be general across jurisdictions. Every approved version is offered with its metadata, the latest by default. A filing may be written without a template. Submitting a template is gated by the defined process. Holidays and hours are per jurisdiction, not per template. | Bob | In force |
| K924 | 10-01 | Bob refined K921. An earlier version is `updated` (naming its successor) and stays offered, never "retired". `retired` is only a whole template's withdrawal. A briefing may be prepared at every tier and needs counsel only at Tier 3. A filing may be written without a template. | Bob | In force. Replaces BOB's K921 reading that a retired version is not offered. |
| K925 | 10-01 | First-profile research: a holiday entry may name a venue. An employer's paid holidays are recorded as closure days, status `researched`, settled by a member's confirmation (local-facts). Ambiguous days are left undetermined. | BOB | In force |
| K927 | 10-01 | Fold: filing-templates R1–R25, local-facts R1–R8. `counselPacket` at every tier, counsel only at Tier 3. A Tier 3 or undetermined-tier brief template needs the Tier 2 review. Local-facts stores no machine proposals. | BOB | In force |
| K988 | 10-01 | Tier 1 needs one member review; a professional review does not stand in. A template's proposer `run`, `model` and `skill_pack` are kept as stated. | BOB | In force |
| K992 | 10-01 | Filings: R26 retired (now filing-templates'). A template or the member's own text; the template recorded on every draft and packet; deadlines through action-clocks with local-facts. `KIND_NO_TEMPLATE` and `NOT_TIER3` retired. | BOB | In force |
| K1739 | 10-06 | Bob: "D6: as recommended". Copyrighted standards: text only by a member's own capture; publications quote only relied-on passages. | Bob | In force (applied to filings R8, K2019) |
| K2019 / K2023 | 10-07 | Filings R8: public law (any kind but `standard`) keeps free text. Only a `standard` that is not free is carried with its relied-on passages only. | BOB | In force |
| DEC-115 | 10-01 | Bob: *"Q#35: as recommended"*. `start-and-send.html` binds the redesign's content, step order and wording: the refusal shown before anything runs, the reason asked in place, approving kept separate from recording the sending. The Tier 2 filing-draft and Tier 3 counsel-packet panels in `surfaces.html` bind likewise. The matter page, standards list and queue items stay examples. | Bob (words) | In force |
| DEC-31 | 08-03, 09-17 | Addressed non-public delivery. Provisional: modelled as an ACTION the member performs outside the system and records. Bound now: any rendering that leaves addressed to someone carries hash, date, author and both floors in-band. 09-17, Bob: *"a member will sometimes want to hand a case to one person or internal group … that action should stand beside the publish act … it's important that the product of that act clearly indicate that it's a pre-publish version."* | Bob (words) | In force (the review copy; filings R22's in-band stamp) |

### C3. The litigation hold (on an action's `legal` pressure mark)

| id | date | gist | who | status |
|---|---|---|---|---|
| K613 (2) | 09-30 | A litigation-hold reminder is not repeated unless asked. It may be cleared when responding. If not cleared, it stays open until cleared. | Bob | Refined by K899 (7) |
| K899 (7) | 10-01 | "Yes" (N-A19, DEC-61): a hold reminder is cleared by an attributed member act on the action's `legal` pressure mark ("hold in place" or "hold released", with a reason). That act is the reminder's door. | Bob | In force for placing. Release moved to its own op by K1134 (3). |
| K901 / K902 / K918 | 10-01 | Any member who can see the action may act. The reminder goes to administrators and the marker. Actions R52 `op=actionhold`, R54 `holdsDue`, queue-producers R19 (an OBLIGATION). Graded `reasoned`. | BOB | In force |
| DEC-113 | 10-01 | Bob: *"Q#31: as recommended"* (A). "Hold in place" stops both scheduled deletions of assistant transcripts for the threatened action's project plus named projects. A device deletes nothing if it cannot check. "Hold released" is heavier: its form states what will be deleted, and administrators and the placer are told once. A held-project strip is shown. While any hold stands, the operator's wipe of the real record is refused. "Counsel's review of these defaults before a group relies on them is advised." | Bob (words) | In force. It supersedes actions R52's "Nothing here suspends a purge". |
| K1019 (DEC-108) | 10-01 | While any hold is in place, the doorbell archive's one-week clearing pauses. | Bob | In force (capture R32; actions R55, K1030) |
| K1134 (3) | 10-02 | Release is its own op `actionholdrelease`, rung `terminal`. The release form lists only projects the releaser can see. | BOB | In force |
| K1252 | 10-02 | Bob: while a hold stands, no material in a held project may be purged, whole or a single item: *"we HAVE to [block] purging of all material named in the hold"*. | Bob (words) | In force (actions R56–R60, K1262) |
| K1262 | 10-02 | A purge is judged by the bundle's current project. An unknown bundle or undeterminable project refuses while any hold stands. A purge of an action carrying a standing hold is refused. | BOB | In force |
| K1830 / K1847 | 10-06 | Actions R69 `holdsOn` is registered with ratification. A hold placed since signing stops a publish-at-a-set-time. | BOB | In force |

---

## D. Clocks, deadlines and reminders

| id | date | gist | who | status |
|---|---|---|---|---|
| K253 | 09-28 | `clockPropose` counts from the day after the start event, as filings does. `CLOCK_STATUS_NOT_MECHANICAL`. | BOB | In force (now in action-clocks) |
| DEC-94 | 09-29 | Ruled by Bob, refining the recommendation. (1) A deadline reminder is the member's own request, set when the action is chosen in the plan, "perhaps by a default the member sees and can change at that moment (nothing preselected unseen, DEC-77)". A further reminder is one the member accepts. (2) As a deadline nears, position, colour or wording may change: display, not a notification. (3) No email, push or outside channel. (4) Overdue is new and re-notifies once. "Due within N days" is not new unless requested. | Bob | In force |
| K613 (1) | 09-30 | Choosing an action includes setting its notification schedule, "defaults preselected". A deadline notice offers another reminder or none. Not repeated unless the member asks. | Bob | Citations replaced by K614. "Preselected" is read under DEC-94 (1) and DEC-77 as seen and changeable (§M). |
| K614 | 09-30 | The governing ruling is DEC-94 (points 1–4 restated). K613 (2) and (3) stand. | BOB (records Bob) | In force |
| K615 | 09-30 | Correction: DEC-70 ("tells ONCE, is dispositionable, and ages … never a recurring nag") is a valid citation. The ACTION-DESIGN #1 discussion of reminders and nagging is not in its committed files, and that session records Bob's words in its HANDOFF, which "govern with K613 at the fold". | BOB | In force. Bob's words are in old `action-design/HANDOFF.md` (see R4). |
| UX §25, DEC-107 | 10-01 | A plan's checkpoints are the group's own intentions. A missed one is never a finding, a condition of the record or a fact about the government. The other side's missed deadline is a signal on the action, raised once. Members see "To do". "Obligation" on screens means only a public body's duty. Bob: "As recommended … A". | Bob | In force |
| K986 / K990 | 10-01 | Action-clocks R10: "an office" is one office: the addressee when the counterparty is a named office, else the kind's venue. Years are read through local-facts. | BOB | In force |
| K941 | 10-01 | Ambiguous City holidays left out: counts err early, "the safe side for a group's deadline". A member's confirmation through local-facts settles each. | BOB | In force. Sharpened by K1444 (i). |
| K1000 | 10-01 | Action-clocks R11 answers `{action, project, created_by}`, so queue-producers R21 reaches the creator. Raised once per fact and status. | BOB | In force |
| K1431 | 10-05 | Bob: many things are due by a date for reasons other than regulation (a budget before its period, a report before the meeting). A due date's basis may be a law or order, a commitment, a dependency (the event it must precede, and why), or the group's own window. A dependency date is never presented as a legal deadline, and missing it is a dated fact about sequence, "never a violation". The layer-9 contract reads "names its basis". | Bob (paraphrase of his words) | In force (layers.md contract amended, K1500) |
| K1440 | 10-05 | One held obligation object. An obligor is a public body, or a body acting for one under public law, contract, franchise or grant. Never a private individual. A contractor's breach is addressed to its enforcing office (actions R9). A computed or machine-proposed duty stays a proposal until a member adopts it in one act. After that it is tracked and told once. | BOB (K1437) | Amended by K1453 (a person may be bound by name or role where a law does) and K1505 (12) |
| K1444 | 10-05 | (i) The group's own deadlines take the earliest candidate date. A body is overdue only after the latest; in between, "possibly overdue: undetermined, because …". (ii) A body's overdue runs from the event's own date, never the capture date. (iii) Actions R12's governing day is the office's local day, not UTC; "close of business" in the office's hours. | BOB (K1437) | In force (K1522, K1657, K1658, K1688) |
| K1445 | 10-05 | Profiles hold sourced rules as data, each with a citation, status and confirmation horizon, adopted by a member. A rule ships only with a primary source. First rule set: CPRA, Brown Act, OMC, Government Claims Act, FOIA. | BOB (K1437) | In force |
| K1451 | 10-05 | A one-off `.ics` download of a member's own deadlines is built. A subscription feed stays rejected under DEC-94 (3). | BOB (K1437) | In force (action-clocks R14 `clocksIcs`) |
| K1504 | 10-05 | Time conventions as profile data: statutory day periods roll on named closures. The CPRA extension start and month-end become an uncertain date with both candidates. Receipt on a non-business day follows a sourced local rule. Oakland's minutes 10 business days; the Immediate Disclosure Request is 3 business days. | BOB | In force |
| K1658 | 10-06 | Action-clocks: `computeDeadline` through civil-time. R7 basis kinds. R13 `clockAdopt`. R14 `clocksIcs`. R15 `lateness`. | BOB | In force |
| K1676 | 10-06 | Notice-producers R5 is raised once per occurrence and state: "possibly overdue" then "overdue" tells again. | BOB | In force |

---

## E. Escalation, consequences, conformance and standards

| id | date | gist | who | status |
|---|---|---|---|---|
| K12 | 09-26 | Consequences are computed from the record where possible, otherwise undetermined and settled by members. "Significance is the members' judgment". | Bob | In force (amended for signals by K1473) |
| K14 | 09-26 | Escalation stage 7 is political accountability. "Policy advocacy and candidate support stay out". Operational Principle 1 stands (amends Design Requirement 7). | Bob | In force |
| K172 | 09-27 | A determination with no live consequence part is `undetermined`, so `escalationEnd` answers `CONSEQUENCES_UNDETERMINED`. A group that judges a breach had no consequence records an assessed part saying so, then addresses it. | Bob (as recommended) | In force. K249 (3)'s flaw is resolved by K283 (4) (`not_applicable` causation). |
| K256 | 09-28 | Actions' revising acts must pass the viewer to promotion. The bug had refused every correspondence on `breach: true` actions. | BOB | Fixed |
| DEC-88 | 09-29 | Rungs: `escalationend` and `filingapprove` are terminal. `actionriskpropose`, `actionlawspropose` and `filingprepare` are reversible. `escalationopen` is reasoned. Friction follows consequence in the world. | Bob | In force (affordances) |
| DEC-89 | 09-29 | As recommended, Bob. (1) Opening an escalation requires a written reason: why this breach is worth pursuing. (2) New act DECLINE TO ESCALATE on a live noncompliant determination: reasoned, attributed, corrected forward only. Both are prose only. No field for significance, severity, priority, urgency or rank. Any joined member who may open one may decline one. | Bob | In force. Amended 10-05 (K1471, K1473): significance only as a labelled machine signal in the hypothesis layer. |
| K1019 (DEC-89 fold) | 10-01 | Bob approved: a later decline replaces an earlier one, both kept; no decline while an escalation is open. **Addition: "the system helps the member document why the breach is worth escalating"**. Escalation offers the opening reason pre-assembled (the standard and its basis, the action, its clocks and missed dates, the consequences), edited by the member and recorded as theirs, labelled as a machine draft like DEC-101's. | Bob (words in part) | In force (escalation R25 `escalationreasondraft`, K1158). Tension with K1841 (§M). |
| K1025 | 10-01 | Folds for escalation R1, R17, R18, R24, R25, R27–R29. | BOB | In force |
| K1084 | 10-02 | `MACHINE_CANNOT_DECLINE_TO_ESCALATE` (C-116.46). | BOB | In force |
| K933 / K988 | 10-01 | An evaluation's trigger id is `<id>/evaluation#<n>`. A withheld action meets no trigger for that viewer. | BOB | In force |
| K903 (4), K913 | 10-01 | DEC-36 ("no id, no title, no state, no count") for escalation, conformance, consequences and filings. No `seq` gap may reveal a withheld item. | Bob (agreed) + BOB | In force |
| K1438 | 10-05 | Standards (and local-facts) move to L5. Conformance and consequences stay in L9. | BOB | Applied |
| K1471 | 10-05 | Bob: facts versus analysis. A ranking by a stated, measured quantity is analysis and allowed. A score standing for a judgment (importance, suspicion, significance, severity) is forbidden. | Bob (words) | In force |
| K1473 | 10-05 | Bob: *"It's important not to judge facts or analysis, but it's equally important that they not be ignored or devalued as signals on which hunches and hypotheses might be founded."* A judgment score is a signal only: with its method and false-alarm rate, never cited, never moving a finding. Amends DEC-89. | Bob (words) | In force |
| K1722 | 10-06 | Bob: "D2: as recommended". The force of each provision (requirement, recommendation, permission; mandatory or discretionary) comes only from the text. A finding names the force it rests on. | Bob | In force |
| K1723 | 10-06 | Bob: "D3: as recommended". A **benchmark** (a standard that does not bind the body) may be compared and published, always labelled as not binding. The finding may say "slower than" but never "violated" or "nonconforming". | Bob | In force. It bounds what an action may assert. |
| K2021 | 10-07 | An open-ended standard never binds (a null end is "not stated"), so `noncompliant` against it is refused. That is canon, "not Bob's". | BOB | In force (N736 open) |

---

## F. Monitoring and following

| id | date | gist | who | status |
|---|---|---|---|---|
| K90 / K259 / K261 | 09-26–09-28 | Monitoring and scheduler drafts and build: the overdue mark only from `pending` (R44); ticks in process. | BOB | In force |
| K268 / K269 | 09-28 | `op=monitoring` leaked a hidden project's ids. Every field naming another bundle is now withheld unless seen. | BOB | Fixed |
| K591 / K611 | 09-30 | Defect: monitoring's `deadlineRecheck` has no caller, so overdue reached no member. Carried into T18. | BOB | Fixed in T18 (monitoring R50, K717) |
| K1036 / K1094 | 10-02 | Link sweeps (now `link-sweep`). Bob: a project owner ratifies, any member drafts. Members are told of every condition. A ratified sweep is named standing intent. It stops when its project closes. | Bob | In force. Relevant where an action watches for an answer or a document. |
| K1505 (15) | 10-05 | `following` holds a `per_meeting` watch's body link. A dated wait is an OBLIGATION item, a machine check's result a FINDING ("Noticed"). | BOB | In force |
| K1665 / K1668 | 10-06 | `following` module built: a per-meeting watch names a backward, sourced `deadlines` rule as its notice, due through civil-time, else `unscheduled`. | BOB | In force |
| K1366 / K1369 | 10-03 | Bob: "N534 approved as drafted". A watched docket is read daily. Only a verified edition or withdrawal raises re-evaluation; other entries reach the watch's setter. | Bob | In force |

---

## G. Addressees and doctrine fences

| id | date | gist | who | status |
|---|---|---|---|---|
| K14 | 09-26 | Policy advocacy and candidate support stay out; Operational Principle 1 stands. | Bob | In force |
| K590 (6) | 09-29 | Lobbying is an option only to enforce or restore an existing requirement. | Bob | In force |
| K590 D1 | 09-30 | Addressees go beyond government offices: a government office by role and body, a reporter or outlet, an organisation or another civic group by role and organisation, or a described audience. **Never a private individual.** A breach action is addressed to an office. | Bob | In force (Action §4 rule 6, kept by K1500; K1484 row 5) |
| K590 D3 | 09-30 | `completed` joins the resolutions (when no counterparty's answer decides it). | Bob | In force |
| K590 D6 | 09-30 | Any group may use CivicOS, disclosing a stake. | Bob | In force |
| K597 (1) | 09-30 | The system hopes for good faith and is fully prepared for opposition. Every plan is checked for a branch answering a hostile response. Pressure against the group or its supporters is recorded as evidence and may open an inquiry. | Bob | In force (action-plans R19, actions R48) |
| K597 (4) | 09-30 | Certification by a licensed professional is deferred until a group needs it. | Bob | Deferred |
| K600 (c) | 09-30 | Joint action with another group is recorded and deferred until a coalition asks. | Bob | Deferred (K1266 relabels it as not waiting on Bob) |
| K1440 / K1453 / K1505 (12) | 10-05 | An obligor is never a private individual, except that a duty may bind a person by name or role where a law does (a filer's statement of economic interests, a lobbyist's registration). A person obligor needs a cited standard naming them. A private obligor needs a cited `acts_for` line to a public body. | BOB | In force |
| K1474 | 10-05 | Bob: "B12: as recommended". The line on practising law. (i) Closed book. (ii) A labelled, cited reading of held statute text, "legal information, not legal advice", never "the law is", a member's rights, a likely outcome **or what to file**. (iii) Procedural facts from the profile (which form, venue, deadline) are shown as facts, never as recommendations. (iv) Procedural reasoning is offered condition by condition, marked met, unmet or undetermined. Never "you have standing" or what to file; it points to counsel. An attorney-supervised mode waits until a group asks. | Bob | In force. It bounds drafting and suggestion (§M). |
| K1483 | 10-05 | Design Requirement 6 amended. Bob: *"I don't see the need for (in fact see down sides of) not naming individuals involved"*. A person materially involved is named as the finding needs. | Bob (words) | In force |
| K1484 rows 5, 7 | 10-05 | Row 5 agreed: "the action addressed to an office, showing its holder on the day". Row 7, Bob: *"but a harmed party may be an individual"*. Published text names them with consent or where DR6 allows. A whistleblower source stays protected. | Bob (words) | In force |
| K1492 | 10-05 | Bob: *"what do law firms, auditor offices, newsrooms, and your average community activist do? We should do that"*. Public registers by default (including lobbying and campaign finance); paid people-search only by a member's own act; never deception. | Bob (words) | In force |
| K1457 / K1462 | 10-05 | Bob: *"When I use the word 'action' here, I'm not referring to the actions a group might take in response to a finding. I'm referring to the series of things that happen in the world…"*. That construct is named **events**, because "action" is the group's own act. The government act (`ACT-`) becomes a kind of event. Bob: "Use events as recommended." | Bob (words) | In force. Terminology fence for this lane. |
| K1467 | 10-05 | Bob: *"Hunches and hypothesis have a place in the system. But they're not treated as facts nor in any way influence findings."* | Bob (words) | In force (a plan may rest on hunch debt, Action §8) |
| K1500 | 10-05 | Canon audit kept Action rule 6's "never a private individual" (K1484 row 5 agrees). D-165, the backward question, stays deferred by Bob with its own trigger (Case Making §THE ACTION PLAN). | BOB | In force |

---

## H. AI and the assistant drafting

| id | date | gist | who | status |
|---|---|---|---|---|
| K590 D2 | 09-30 | The assistant drafts communications as proposals a member adopts. | Bob | In force |
| K613 (3) | 09-30 | Where no template fits, members use the assistant to draft one; a derivative may be kept. "No job invents legal text." | Bob | In force |
| K660 (3), (5), (6) | 09-30 | The planning skill does no letter drafting. It is on as soon as agent-worker runs model turns. Its disclosure stops at adoption. | Bob (words) | In force |
| K1019 | 10-01 | The escalation opening reason is pre-assembled by the system as a labelled machine draft the member edits. | Bob | In force (see §M) |
| K1364 | 10-03 | Bob: *"the words a script fills in are always the member's"*. A script never says or submits anything for a member. A placed text is a labelled draft until kept. "No step submits, signs or files." B4: the system "supports and may guide or remind", every informed choice, stopping included, is the member's. | Bob (words) | In force (wizard-scripts) |
| DEC-153 | 10-06 | Bob: *"Yes, offer it wherever members write in their own words"*. "Help me write this" (e.g. a records request) is offered, never where the assistant is refused (concluding, signing, publishing). Words arrive labelled "Draft · the assistant's". | Bob (words) + Design | In force, amended by K1841 |
| K1841 | 10-06 | Bob: "1. Agreed 2. agreed". Writing help is **never offered in a field that states a member's reason for an act** (Roles canon rule 1). With the suggestions switch off, help works only from what the member typed. | Bob | In force |
| K1755 | 10-06 | AI accounts: a group API key held by an administrator, a member's own subscription token, a member's own API key, or no AI. | Bob (words quoted) | In force |
| K2421 | 10-09 | Exploring (enabled per account, Ask every day or Yes) is a second exception to "every AI run starts at a member's act". | Bob | In force |

---

## I. UX

| id | date | gist | who | status |
|---|---|---|---|---|
| DEC-87 | 09-29 | Friction rises with the rung; every button shows its rung's name and weight. An act with no rung is treated as reasoned. | Bob | In force |
| DEC-88 | 09-29 | Rung assignments (filings and escalation, §E). Any act that is a step toward something leaving the group opens the full dialog (start a chosen option: the ACT preview). | Bob | In force |
| K608 (4) | 09-30 | Plan page approved (§B). | Bob | In force |
| K633 | 09-30 | Bob: "You can leave the old interface, as it's not currently being worked on or tested, and will be replaced by the new interface once its design has evolved sufficiently". The old app's action form is untouched. | Bob (words) | In force |
| K899 (2) | 10-01 | Surfaces and recipes: "needed, but wait" for the new interface. | Bob | Lifted for wizard-scripts' server half (K1364 B1) |
| DEC-113 / UX §31 | 10-01 | Held-project strip wording; a heavier release form. | Bob | In force |
| DEC-114 / §34 | 10-01 | "Matters". | Bob | In force |
| DEC-115 / §35 | 10-01 | Start-and-send and the Tier 2/3 filing panels bind content, order and wording. | Bob | In force |
| DEC-107, DEC-110 / §25, §28 | 10-01 | Queue classes are "To do", "Noticed", "Status". "Obligation" is used only for a public body's duty. Each item names whose step it is ("our plan", "the city's deadline"). | Bob | In force |
| UX §15 (DEC-98) | 10-01 | Every wait carries one line naming what is awaited, from whom, and the expected or legal date ("Waiting on the City Clerk's reply, due 14 October"). | Bob | In force |
| DEC-122 / DEC-181 | 10-03, 10-08 | Sending, signing and every irreversible act are done on a larger screen; a phone reads them. | Bob / Design | In force |
| DEC-160 | 10-06 | Anything the record holds that a screen names, "an action and what it sent, a filing" included, is a link. | Design | In force |

---

## J. Mechanics: build, packaging and code (summarised)

About 400 matched lines record the build of the action modules. They change no meaning a member sees. In brief:

- **Extraction and first build.** T8 and T9 layer 9: K247–K258, K263, K264, K267, K312, K316–K320.
- **Codes, cursors and bounds.**
  - Codes K368–K380: `ACTION_MOVE_NO_REASON`, `PENDING_CLOCKS_BAD_BEFORE`, `noSuchAction` R43.
  - Bounds and cursors: actions R3 caps a document at 500 `action_basis` and 500 `correspondence` entries; R31's entry cursor.
- **Fold and splits.** K591, K611, K624, K625, K700–K712 (T18 L9: action-clocks, actions, filings, escalation, action-plans); K835–K839 (T19 L9: action-grammar).
- **DEC-36 withholding.** K905, K906, K911–K916.
- **Filing templates and local facts.** T21 L9: K985–K992, K1000–K1004.
- **DEC-88 reasons.** K1030, K1049, K1051, K1083–K1092.
- **Litigation hold.** K1262 and K1281–K1293 (T27).
- **Local days and offices.** T33 L9: K1648–K1663, K1675–K1689.
- **Publish at a set time.** T34: K1830, K1843–K1848 (hold reader).
- **Later wording.** T35 to T37: K2018–K2023, K2212, K2230–K2234.

The later tranche lines are all BOB's and are all in force as code. They matter to this lane only as evidence of what is built, which R5 covers.

---

## K. `build/rulings-active.md`: the lines relevant to actions

- §1: Bob decides capability, doctrine, policy, UX, high-level architecture and principles. Packaging is BOB's (K569, K2007, K2008). Bob's test applies before any question is put to him (K1437, K2009). Record Bob in his own words (K1762).
- §1: a protective limit that changes what a member or group may do is Bob's (K1881).
- §3: Bob's construct rulings live in canon (Capability Ladders, Intake Doctrine §3, Roles §3 rule 11). Apply them from there and do not re-ask (K1432…K1944).
- §3: substrate first; no member screen is a precondition of a substrate stage (K1430).
- §3: the assistant may read public sites to plan research, but nothing it reads enters the record (K1880).
- §3: no credential travels in a URL (K1874). AI accounts (K1755).
- §3: members' words are "record", never "bundle" (K899 (1)); "your group's Civicsmith" (K1821).
- §3: `legacy-ui` is frozen (K633).
- §1: "Hold after T40's L2" (K2411). Not updated for K2422 (§M).
- **Absent:** no line names the actions design lane or N817. The investigation lane has its own line (K2076).

---

## L. Bob's standing directions on actions, in his words

1. **Scope of this lane** (RESUME, 2026-10-09): "we need to dive every bit as deeply into the requirements, current capabilities, additional capabilities needed, design, and use cases of Actions".
2. **D43** (2026-10-08): "Civicsmith should support members throughout the action plan to the greatest and most appropriate extents possible. Not today, but, like we're doing as we design Civicsmith's investigation support, we need to research explore, and design the requirements, capabilities, use cases, and UX of actions."
3. **Design only** (K592): "make sure that this session only does design; you manage action development as you do all other development, in tranches with layers".
4. **Priority** (K648): "make sure that the priorities we stated for T18 are the same priorities for T19. This includes transitioning away from legacy aspects of the development process, and adding action related support."
5. **Size** (K617): splitting a module for size "is low level technical decision … it MUST be split".
6. **Suggestions** (K660 (2)): "Rather than a hard limit of 5 suggestions, the feature should present the best first 5. But also provide a means for the member to ask to see the next 'tranche' of 5 options, and so on". And K660 (5): "No legit reason I can think of not to switch it on as soon as development can properly support it".
7. **Due dates drive plans** (K1466): "A due date (like a CPRA response obligation) may be recorded as having been met or not. If the response isn't received by the due date, then [it may] cause other actions in an action plan to activate."
8. **Litigation hold** (K1252): "we HAVE to [block] purging of all material named in the hold". DEC-113: "Q#31: as recommended".
9. **Filing wording and templates** (K903 (6)): a filing's wording "optimally accurate, appropriate and compelling". Templates need "a formalized authoring, approval and attribution process". Holidays and hours researched "with a process for confirming them".
10. **Escalation** (K1019): "the system helps the member document why the breach is worth escalating".
11. **Words the member keeps** (K1364): "the words a script fills in are always the member's". Writing help (DEC-153): "Yes, offer it wherever members write in their own words".
12. **"Action" means the group's act** (K1457): "When I use the word 'action' here, I'm not referring to the actions a group might take in response to a finding. I'm referring to the series of things that happen in the world…" (that construct is now "events", K1462).
13. **Signals** (K1473): "It's important not to judge facts or analysis, but it's equally important that they not be ignored or devalued as signals on which hunches and hypotheses might be founded." Hunches (K1467): "Hunches and hypothesis have a place in the system. But they're not treated as facts nor in any way influence findings."
14. **People** (K1483): "I don't see the need for (in fact see down sides of) not naming individuals involved". K1484 row 7: "but a harmed party may be an individual".
15. **Conduct** (K1492): "what do law firms, auditor offices, newsrooms, and your average community activist do? We should do that".
16. **Plan privacy** (DEC-25): "I also need to defer DEC-25 for now", with the binding constraint that a plan is never published, and any change applies only to later plans.
17. **Handing a case to one recipient** (DEC-31): "a member will sometimes want to hand a case to one person or internal group. It seems to me that that action should stand beside the publish act … it's important that the product of that act clearly indicate that it's a pre-publish version."
18. **The Actions session** (DEC-93): "I've started a separate session that will be used for work related to Actions." DEC-114: "Q#34: matters". DEC-115: "Q#35: as recommended".
19. **The old interface** (K633): "You can leave the old interface, as it's not currently being worked on or tested, and will be replaced by the new interface once its design has evolved sufficiently".

Bob's 2026-09-29/30 rulings (K590, K597, K600, K608, K613) are recorded in K lines as paraphrase. His verbatim words are in the old lane's `docs/development/action-design/ACTION-PLAN.md`, `MATRIX.md` §6 and `HANDOFF.md` ("Bob, 2026-09-30, later"), covered by R4. K615 says his words on reminders and nagging "govern with K613".

---

## M. Rulings that conflict or appear superseded without being marked

1. **K1019 against K1841 (machine help in a reason field).**
   - K1019: Bob's addition has escalation pre-assemble the opening *reason* as a labelled machine draft (built as escalation R25 `escalationreasondraft`).
   - K1841: Bob agreed that writing help is "never offered in a field that states a member's reason for an act" (Roles rule 1). Escalation opening is a reasoned act (DEC-88, DEC-89).
   - No line reconciles the two. One possible reading: K1019's draft is a deterministic assembly of record facts, not assistant help. That reading is not recorded. **Needs a BOB ruling, or Bob's if it is doctrine.**
2. **K92 (5)** ("the clock rule is actions' alone") is overtaken by K617/K624's `action-clocks` split. No line names K92 (5) as replaced.
3. **K11's module list** is changed by K1438 (standards and local-facts to L5) and by later splits. K1438 says K11 "is amended when the move is planned", and no amending line was found.
4. **K13** (counsel packet "for named counsel" at Tier 3) is widened by K921, K924 and K927 (a brief or `counselPacket` at every tier, counsel needed only at Tier 3). K13 is not cited as amended. The two are consistent, but the record does not link them.
5. **K613 (1)** ("defaults preselected") versus DEC-94 (1) and DEC-77 ("nothing preselected unseen"). K614 replaces only K613 (1)'s *citations*; the word "preselected" stands unqualified in K613. Read it as "a default the member sees and can change".
6. **K899 (7)** ("hold released" as a statement on the same act) is superseded by K1134 (3) and DEC-113 (a separate, heavier `actionholdrelease`, terminal). K1283 records `actionhold` now refusing a release. K899 is not named as replaced. Actions R52's "Nothing here suspends a purge" is marked superseded only inside DEC-113's "owed" line.
7. **K102's "for now"** approval of every layer-9 module's requirements was never lifted for actions, filings or escalation (K1015 lifted it only for ratification, publication and strength). K608 (3) ("correct and complete enough to fold") is the nearest later approval.
8. **The lane's start is unrecorded.** K2382, K2389 and next.md N817 still say "Not today" (hard reason: Bob's). RESUME quotes Bob's 2026-10-09 direction starting the lane, but no K line records the start or his words. `rulings-active.md` has no actions-lane line, unlike the investigation lane's (K2076).
9. **The hold in `rulings-active.md` §1 is stale.** It still says "Hold after T40's L2 (K2411)", but K2422 closed T40 early and opened T41 with "layer 1, then holds". This is process, not action doctrine, but it is unmarked.
10. **Addressee versus obligor.**
    - Action rule 6 (K590 D1, kept by K1500) says an action is "never [addressed to] a private individual".
    - K1453 and K1505 (12) let a *duty* bind a person by name or role where a law does (a lobbyist's registration, a filer's statement of economic interests).
    - K1484 row 7 lets a harmed individual be named.
    - These are consistent if addressee and obligor stay distinct (an action about a person's missed statutory filing goes to the enforcing office). No ruling says so for actions. **A design point for this lane.**
11. **K1466 against the member-choice rulings.**
    - K1466 says a missed due date "may … cause other actions in an action plan to activate".
    - K590 (1) and (7), K1364 B4 and DEC-69 say the member chooses, unticked means undecided, no step submits, and the workflow never second-guesses.
    - These are not reconciled. "Activate" probably means *offer or surface* the next step, not start it. **Needs a reading before design.**
12. **K1474 against K590 D2 and K613 (3).**
    - K1474: the machine never says "what to file".
    - K590 D2 and K613 (3): the assistant drafts communications and filing templates as proposals a member adopts.
    - These are compatible only if drafting follows the member's choice of what to file and never proposes it. The planning skill already excludes letter drafting (K660 (3)). The boundary is unstated for filings.
13. **Tension in the old records.** K615 says Bob's words on reminders from ACTION-DESIGN #1 "govern with K613 at the fold", but they were "not in its committed files". Whether that HANDOFF entry was ever written is for R4 to confirm.
14. **"Action's project".** K702 defines it as the project of the first determination among the action's `rests_on` legs, null when none. K1262 judges purges by a bundle's *current* project. An evidence-seeking action (never gated, K600 (a)) with no determination therefore has no project, which affects the hold strip and reminder recipients (K1000). This is unflagged.

*Sources:* `build/rulings.md` (lines cited by K id), `build/rulings-active.md`, `docs/development/DECISIONS.md` (DEC-25, -31, -87, -88, -89, -93, -94, -107, -113, -114, -115, -116, -153), `docs/development/ux-substrate/ux-substrate.html` §8, §9, §14, §15, §25, §31, §34, §35 and the Action-layer sections, and `origin/design/investigation:docs/development/investigation-design/DECISIONS.md` (D42, D43).
