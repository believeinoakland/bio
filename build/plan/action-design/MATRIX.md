# The Action layer: completeness matrix

**Status** · DRAFT by ACTION_DESIGN #1, 2026-09-30. Step 3 of the week's Action design work: every purpose an action can serve, walked through every stage of the work, then every kind of actor and every role within a group, each cell traced to canon, an approved requirement, the action-plan design, or a gap. Its last two sections list the requirement changes it implies and Bob's decisions D1–D6, which Bob agreed on 2026-09-30 as recommended; the requirement drafts that follow from them are in `drafts/`. Sources: `INVENTORY.md` and its `sources/`, `ACTION-PLAN.md` (rules A1–A16, Bob's rulings 1–10), and `build/requirements/` at `main` @ `5bb688333c`.

**How to read a cell.** **Built**: an approved requirement covers it and the code has it. **Wiring**: built, but not connected, so it never reaches a member. **Designed**: in the action-plan design, not yet a requirement. **Partly**: some of it is covered; the cell says what is missing. **Gap**: nothing covers it. References: `actions` R15 means requirement R15 of the `actions` module; A7 means rule A7 of the action plan.

## 1. In brief

1. **The legal and breach track is nearly complete.** From seeking evidence through Tier 3, the stages are built. What stops it is wiring: nothing tells a member a deadline passed or a stage is due, and the real profile has no filing templates.
2. **Everything outside the legal track stops at the second column.** Awareness, journalistic, grassroots and recognition options can be planned (the design covers them) but nothing helps prepare them, their addressee has no shape (an action can only be addressed to a government office), nothing tracks them and no outcome fits them.
3. **Actors other than activists appear only as recipients or offices.** Journalists, auditors, administrators and unions have no place as users, and journalists and other groups cannot be addressed at all.
4. **Roles within a group are thin.** Any contributing member may approve, send and speak for the group; nothing records who did so on the group's behalf beyond the author stamp.
5. **Two new gaps surfaced:** a plan has no rule for when it closes, and filing drafts and counsel-packet exports leave without the in-band stamp the canon requires of anything addressed (Publication §3 rule 9), though `publication` already provides it (`inbandQuartet`, its R16).

## 2. Purposes × stages of the work

The stages: **Plan** (an option in a plan), **Prepare** (drafting, with or without the assistant), **Decide** (a member chooses, approves), **Send** (it leaves the group, and the record says so), **Track** (replies, clocks, being told), **Close** (the outcome is recorded; any escalation exits).

| purpose | Plan | Prepare | Decide | Send | Track | Close |
| --- | --- | --- | --- | --- | --- | --- |
| **Seek evidence** (records request, request for comment) | **Designed** A12: may start while the matter is only suspected | **Partly**: a machine may propose governing laws and a clock (`actions` R19, R32); no skill drives it; the real profile has no template | **Built**: a member creates it (through the generic promote op, no dedicated op), states tier and laws (`actions` R18, R23); a request for comment names its inquiries and window (R1, DEC-13) | **Built**: the member sends by the venue's own means and records `sent` (`actions` R15–R16) | **Wiring**: replies captured (R15, R17), the records-request lifecycle and due dates derived (R21, R25); an overdue date is never pushed (`monitoring` R34 unscheduled, no queue kind) | **Built**: resolution (R7) and the action's own outcome (R26, DEC-14) |
| **Mitigation** (a demand to, or negotiation with, the office) | **Designed** A4, A8–A9: a checkpoint such as "earnest commitment by week 8" | **Gap**: no drafting help; no kind beyond `other` | **Built**: a breach action at escalation stage 2 (`escalation` R5, R9), or kind `other` | **Built**: recorded `sent` (`actions` R15) | **Wiring**: a member evaluates the response (complied, partial, denied, none; `escalation` R10); triggers are derived when read (R16), never pushed (`monitoring` R35 unwired) | **Built**: escalation ends only on compliance restored and consequences addressed (`escalation` R14, K172) |
| **Legal, Tier 1–2** (complaint, referral, court petition) | **Designed** A4: tier on each legal option | **Partly**: drafts fill the profile's template, each blank naming its source (`filings` R1–R5); the real profile has no templates, so every draft is refused there | **Built**: a member approves; the stricter tier governs (`filings` R6) | **Partly**: filed by the venue's own means and recorded (`filings` R7); the draft carries no in-band stamp (**Gap**, Publication §3 rule 9) | **Wiring**: clock entries proposed from profile deadlines (`actions` R32, `filings` R7); never pushed | **Built** (`actions` R7, R26; `escalation` R14) |
| **Legal, Tier 3** (counsel) | **Designed** A4 | **Built**: the counsel packet and candidate theories (`filings` R8–R12, R14); needs a determination | **Built**: a member names counsel and exports (`filings` R11) | **Partly**: the export leaves by the member's hand (DEC-31, provisional); never published (R11); no in-band stamp (**Gap**) | **Partly**: counsel files; only a member's recorded correspondence brings it back | **Built** (`actions` R26; `escalation` R14) |
| **Oversight and political accountability** (asking officials to act, oversight or audit requests, testimony, enforcing legislation) | **Designed**, with ruling 6: lobbying only to enforce an existing requirement | **Gap**: no drafting help | **Built**: attached at stage 7 with its purpose; offices marked elected or oversight (`escalation` R12, `jurisdictions` R24) | **Built**: recorded `sent` | **Wiring**: as mitigation | **Built** (`escalation` R14) |
| **Awareness** (public campaign, public comment, testimony at a meeting) | **Designed** A4: addressed to a described audience | **Gap**: nothing composes a message (UX use case 124) | **Partly**: public comment to a body fits (the office is the addressee); a campaign to the public has no addressee shape (`actions` R9) | **Partly**: as for Decide | **Gap**: no reply, reach or response beyond an office's | **Gap**: no resolution fits (R7: complied, denied, escalated, withdrawn) |
| **Journalistic** (briefing reporters, a story, a feature) | **Designed** | **Gap**: no rendering for an audience (Publication §6: "a new action_kind and a rendering") | **Gap**: `media` exists as a profile kind, but a reporter or outlet cannot be the addressee (`actions` R9) | **Partly**: the published case is public; an embargoed copy is a review copy that never leaves the instance (DEC-31) | **Gap** | **Partly**: "a story ran" can be recorded as the action's own outcome (R26, DEC-14); no resolution fits |
| **Grassroots** (organizing residents, working with other groups) | **Designed** | **Gap** | **Gap**: no addressee but an office; no joint action with another group (UX open questions 12, 29) | **Gap** | **Gap** | **Gap** |
| **Recognition** (a success story, commending compliance) | **Designed**, ruling 5: a plan may start from a compliant determination | **Gap** | **Partly**: kind `other` with a leg to the determination (the breach rule does not bind it, `actions` R8); a letter to the office fits | **Partly**: as correspondence | **Gap** | **Gap**: no outcome value |
| **The plan itself** | **Designed** A1–A3 | **Designed** A5–A6: the assistant suggests; no skill exists yet | **Designed** A7 | not applicable (A15: never published) | **Designed** A9, A13: needs monitoring and the queue | **Gap**: no rule says when a plan closes |

## 3. Actors

Canon places actor differences in three places: the **project** (its bar, DEC-17; its repertoire, proposed by the assistant from a self-identification, DEC-27), the **audience** of a publication (Publication §6), and the **addressee** of an action (an office). Nothing is indexed on who a person is (DEC-54).

| actor | as a user (runs a project) | as an addressee or recipient | as an audience | status |
| --- | --- | --- | --- | --- |
| **Community activists** | **Built**: the default model | not applicable | yes | **Built** |
| **Journalists** | **Partly**: a project's own bar (DEC-17); a repertoire proposed from "I'm a journalist" (DEC-27, not built) | **Gap**: not an office, so cannot be addressed | yes (Publication §6) | **Gap** as addressee |
| **Lawyers** | **Partly**: a project's bar ("beyond a reasonable doubt") | **Built**: named counsel receives the packet (`filings` R8–R11) | yes | **Partly** |
| **City auditors, oversight bodies** | **Gap** | **Built**: an office marked `oversight`; stage 7 audit and oversight requests (`jurisdictions` R24, `escalation` R12) | only in reference research | **Partly** |
| **Independent auditors, CPAs** | **Partly**: declared expertise, which "gates nothing" (Membership §1.3) | **Gap** | not named | **Gap** |
| **Labor unions, special interests** | **Gap**: a doctrine question (Operational Principle 1; disclosure, Requirement 6; declared bias) | **Gap** | not named | **Gap**, Bob's |
| **Government administrators** (responding to the community) | **Gap**: named as stakeholders (Case Making §4), no path as users | **Built**: as an office | yes | **Partly** |
| **Other civic groups** | not applicable | **Gap**: no joint action; no act records accepting another group's work (UX open question 12) | yes (peer instances) | **Gap** |
| **Affected residents** | not applicable | **Gap** as addressees | yes | **Partly**: counted as a class in consequences (`consequences` R10) |

## 4. Roles within a group

| role in acting | who may today | canon | status |
| --- | --- | --- | --- |
| **Prepare** a draft or option | any credential, the machine included, labelled (`filings` R5); a member adds plan options (A6) | the machine may do the looking (DEC-24) | **Built** / **Designed** |
| **Choose** an option; **approve** a filing | any member with `contribute` (`filings` R6); a joined participant for plans (A1, A7) | no approver role named | **Partly** |
| **Send**, file, or **speak for the group** | any member with `contribute`; the sending is recorded, never signed | "No group speaks for Believe in Oakland" (Operational Principle 7); attribution levels (Publication §3 rule 7) | **Gap**: no spokesperson or contact, no attested sending |
| **Record** replies and outcomes | any member, never a machine (`actions` R15) | a reply is captured, not summarised (DEC-13) | **Built** |
| **Bring resources** (expertise, standing, time) | declared expertise; a free-form note on a plan step (A15) | resources are "an attached list, not a model" (Case Making) | **Partly** |
| **Judge a checkpoint** | a joined participant (A9) | the member does the concluding (DEC-24) | **Designed** |

## 5. The changes this implies

**For the action-plan requirements (a new module; adding it is BOB's, Bob 2026-09-30):** A1–A16, plus the closing rule it lacked, approved by Bob 2026-09-30: a member closes a plan with a reason; it never closes itself; a closed plan stays readable and a subject it held may join another plan.

**For requirements, needing Bob's decision first (§6):**
- `actions`: an addressee that is not a government office (§6 D1); the plan and option an action came from (A12); an outcome for actions that are not requests (§6 D3).
- A way to prepare communications: messages, briefings and renderings for an audience (§6 D2).

**For BOB, no decision of Bob's needed:**
- `filings`: carry `publication`'s in-band stamp (its R16) on every draft and counsel-packet export, as Publication §3 rule 9 requires.
- `monitoring`, `scheduler`, `queue`: schedule the deadline recheck; queue kinds for an overdue clock, a due escalation stage and a plan checkpoint.
- `actions`: an op to create an action, and read ops for an action and its lists.
- `skills`: an action-planning skill that suggests options (A5) and proposes standards and theories, driving the proposal ops that exist.
- `jurisdictions`: the real profile's templates, holidays, measured offices and deadlines.

## 6. Bob's decisions (agreed 2026-09-30, as recommended)

- **D1 · Addressees beyond government offices.** Recommended: an action may be addressed to a reporter or outlet, another civic group, or an organisation, each named by role and organisation, never as a private individual (Requirement 6); an awareness option may address a described audience ("residents of the district"). Without this, four of the ten purposes cannot be sent.
- **D2 · Preparing communications.** Recommended: the assistant drafts a message or briefing for an option as a proposal, stored apart and labelled, from the published case and the plan; a member edits and adopts it; it leaves by the member's hand and carries the in-band stamp. This is Publication §6's "new action_kind and a rendering", placed in the Action layer.
- **D3 · Outcomes for actions that are not requests.** Recommended: add `completed` to the resolutions, with the action's own outcome (DEC-14) saying what happened ("the story ran on 2026-10-14"), and keep impact claims needing outside evidence.
- **D4 · Actor kinds.** Recommended: a project may declare the kind of work it does (reporting, fixing, legal, oversight), which shapes what the assistant suggests and nothing else (DEC-27, DEC-54); no attribute on a person.
- **D5 · Roles for outward acts.** Recommended: no new capability. A started option may name the member who is the group's contact for it, shown with the action; sending stays recorded and unsigned until a group needs more.
- **D6 · Unions and special interests** (carried from the inventory, §6 item 4). Recommended: any group may use CivicOS; one with a stake in the matter discloses it (Requirement 6) and its lobbying is limited by ruling 6.

## 7. After the rulings (re-run 2026-09-30)

Every cell of §2–§4 re-checked against Bob's rulings of 2026-09-29 and 2026-09-30 and the drafts (`drafts/action-plans.md` as AP, `drafts/deltas.md`). **Drafted**: a requirement draft now covers it. **Resolved**: Bob ruled that nothing more is needed. **Deferred**: Bob deferred it, with a trigger.

| purpose | Plan | Prepare | Decide | Send | Track | Close |
| --- | --- | --- | --- | --- | --- | --- |
| **Seek evidence** | **Drafted** AP R1, R18 | **Drafted**: skill (deltas §5), communication drafts (`filings` R23), profile templates (§6) | **Built**, with a create op **Drafted** (`actions` R46) | **Built**; in-band stamp **Drafted** (`filings` R22) | **Drafted**: deadline recheck and queue kinds (§4) | **Built** |
| **Mitigation** | **Drafted** AP R9, R14–R16 | **Drafted** (`filings` R23) | **Built** | **Built**; stamp **Drafted** | **Drafted** (§4) | **Built** |
| **Legal, Tier 1–2** | **Drafted** AP R9 | **Drafted**: templates (§6), skill (§5) | **Built** | **Drafted**: stamp (R22); grades beside the venue's standard (`actions` R48, `jurisdictions` R39) | **Drafted** (§4) | **Built** |
| **Legal, Tier 3** | **Drafted** | **Built**; grades **Drafted** (R48) | **Built** | **Drafted** (R22); override disclosure (`filings` R24) | **Resolved**: counsel files; a member records what returns | **Built** |
| **Oversight, political accountability** | **Drafted**, lobbying AP R12 | **Drafted** (R23) | **Built** | **Built**; stamp **Drafted** | **Drafted** (§4) | **Built** |
| **Awareness** | **Drafted** | **Drafted** (R23) | **Drafted**: audience addressee (`actions` R9) | **Drafted** (R9, R22, R23) | **Drafted**: replies recorded as correspondence with any addressee; reach is not measured, by design (no metrics) | **Drafted**: `completed` and the action's own outcome (`actions` R7, R26) |
| **Journalistic** | **Drafted** | **Drafted** (R23) | **Drafted**: press addressee (R9) | **Drafted** | **Drafted** | **Drafted** (R7) |
| **Grassroots** | **Drafted** | **Drafted** (R23) | **Drafted**: group, organisation or audience addressee (R9); joint action **Deferred** | **Drafted** | **Drafted** | **Drafted** (R7) |
| **Recognition** | **Drafted**: a compliant subject (AP R1) | **Drafted** (R23) | **Built** | **Drafted** | **Drafted** | **Drafted** (R7) |
| **The plan itself** | **Drafted** AP R1–R3 | **Drafted** AP R11, R21; skill (§5) | **Drafted** AP R13 | not applicable | **Drafted** AP R15–R17; queue (§4) | **Drafted** AP R20 |

| actor or role | after the rulings |
| --- | --- |
| Journalists, lawyers, auditors, CPAs, administrators as users | **Drafted**: a project declares its kind of work (AP R21, D4); nothing on a person |
| Journalists, outlets, organisations, other groups, residents as addressees | **Drafted** (`actions` R9, D1) |
| Unions and special interests | **Resolved** (D6: any group, disclosing a stake; lobbying AP R12) |
| Joint action with another group | **Deferred** (trigger: a coalition asks) |
| Approve, send, speak for the group | **Resolved**: any contributing member; a started option may name the group's contact (`actions` R44, D5); sending stays unsigned |
| Bring resources | **Resolved**: a note on a step, no budgets (ruling 3) |
| Opposition: pressure against the group | **Drafted** (`actions` R47); a legal threat prompts a litigation-hold reminder (§4, DEC-61) |
| Certification by a licensed professional | **Deferred** (trigger: a group needs a licensed name on an output) |

**The result.** No cell is a gap. Everything is built, drafted, resolved by a ruling, or deferred by Bob with a trigger.
