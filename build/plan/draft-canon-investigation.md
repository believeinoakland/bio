# BIO Investigation v0.1: steps, the question explorer, milestones and reports

**Status** · Draft for Bob's approval; ruled by D13, D14, D27–D30, D32–D54 (lane) and K2405; it amends Membership Architecture §4, §7.3, §7.9 and §7.14 and Capability Ladders §9.4 and §9.5 (L4), as §9 gives, approved with this text. Drafted by a worker for BOB on `tranche/T40` as `build/plan/draft-canon-investigation.md`; on Bob's approval BOB places it at `docs/architecture/BIO_Investigation_v0_1.md`, lists it in `requirements/README.md` as canon (whole) and in `docs/architecture/README.md`. It states doctrine and design, in Bob's words where they exist (quoted from the investigation lane's register, `docs/development/investigation-design/DECISIONS.md` on `design/investigation`, by D-number); it is not requirement text. The requirements that cite it are T41's `steps`, `question-explorer` and `investigation` (`build/plan/draft-T41-investigation.md`, adopted by K2405). Where a sentence is BOB's detail rather than Bob's ruling it says so. Complete for the ruled model; §8 lists what is open. as of 2026-10-09.

**Place in the system** · Level 1, under construct 8 of `BIO_System_Design.md` §3 (intent and inquiry): the investigation's own working layer between a project's questions and the evidence members add to them. It depends on `BIO_Case_Making_v0_1.md` (the inquiry, the leg, the conclusion, the case as a production), `BIO_Membership_Architecture_v2.md` §7 (projects, owners, participants, discoverable or hidden), `BIO_Capability_Ladders_v0_1.md` §2 and §10 (AI accounts, exploring, machine signals, hypotheses) and `BIO_Declared_Bias_v0_1.md` (hunches). `BIO_Action_v0_1.md` begins where this ends: what a group does about what it found.

**Incomplete sections** ·
- §4 — the question explorer is designed and ruled (D13, D14); it is not offered to any member until it passes its test bar (D11).
- §7 — the study of both audiences (D42) is done (the lane's working document §5) and its questions D52 and D53 are ruled; the intake interview (D19) is not yet here.
- §8 — the open decisions, and the points where this draft meets existing canon without resolving it.
- §9 — amendments to existing canon, approved with this text.

**Contents**
- [1. Purpose and scope](#1-purpose-and-scope)
- [2. An investigation is a project](#2-an-investigation-is-a-project)
- [3. Steps](#3-steps)
- [4. The system's part](#4-the-systems-part)
- [5. Milestones and reports](#5-milestones-and-reports)
- [6. Why a document is held: provenance](#6-why-a-document-is-held-provenance)
- [7. Two audiences](#7-two-audiences)
- [8. What stays open](#8-what-stays-open)
- [9. Amendments to existing canon (approved with this text)](#9-amendments-to-existing-canon-approved-with-this-text)

---

## 1. Purpose and scope

Bob asked for "a member-visible construct that is an investigation. This construct is the project, right?" (K2075, 2026-10-07; K1627 had made the project the investigation's home). This document is that construct: how members, and the system working for them, pursue a project's objective through questions, the work done on them, and the dates and reports that keep the work in view.

Bob's model of the record, which places steps (2026-10-08): "Documents, content, graphs and maps are data. Investigations and actions are processes that operate on the data. Steps are more granular operations that are a part of investigations and actions. They're like "mini-investigations" themselves. Their purpose is to find answers."

**In scope:** the project as an investigation (§2); steps (§3); the system's part, including the question explorer (§4); milestones and reports (§5); why a document is held (§6); the two audiences (§7).

**Out of scope:** the inquiry's evidence machinery (legs, basis versions, conclusions, strength, contradictions: Case Making and the built requirements); AI accounts and limits (Capability Ladders §2, as ruled in D34, D37–D39, built in T40); what a group does about its findings (`BIO_Action_v0_1.md`; Bob's D43 makes the action plan's fuller support "a future design effort").

**Withdrawn, and not part of this construct.** Bob, 2026-10-08: "It was inaccurate of me to talk about members being assigned roles and for there to be subgoals within a project." So there are no teams, subgoals, leaders or assignments (D25, D26 withdrawn); K2075's plan construct stands only as narrowed by the rulings below.

**Rules that bind every part** (each from canon already in force):
1. **Members decide; the machine proposes.** Nothing becomes evidence, a conclusion or a member's hypothesis except by a member's act (D33; Action §4 rule 1; DEC-24).
2. **Nothing measures a member.** Who did what is recorded by handle; no count, score, ranking or comparison of members, and no record of who opened what (DEC-68; K1892).
3. **Working material is never published.** Steps, learned lines, costs, cost messages, milestones and reports stay inside the group; no case or edition carries them (D15, settled K2064).
4. **No nagging.** A reminder is one the member asked for; a nearing date changes only how it looks; an overdue one is told once; nothing goes by email or push (DEC-69, DEC-94).
5. **The group's own dates are never findings about government** (Capability Ladders §10, "A due threshold raises a question, never a violation").

**Member-facing words.** What members see calls stored material "the record", never "bundle"; where this document says "the system", a member reads "your group's Civicsmith". The names members see for a step, a milestone, a report and the investigation's plan (kept apart from the action plan) are the UX stream's (D23, open).

## 2. An investigation is a project

**The objective and its questions.** Bob, D32 (2026-10-08): "A project has an objective it's trying to establish. It does so by posing questions that could be answered (or not)". The project keeps what canon already gives it: its objective, its bar (the strength of evidence it requires), its computed stage, and its owners' authority (Membership §7; State Rules §4.3).

**A question can serve several projects.** Bob, D32: "the same question may be of interest to more than one objective." And earlier (2026-09-18, Membership §7.9): "A project doesn't own an area of enquiry to the exclusion of others."

**Each project has its own relationship to a question.** A project draws on a question; it may hold its own conclusion on it (State Rules, amendment of 2026-09-18: `concluded` is a state of a project's relationship with an inquiry); and it may defer or dismiss it for itself alone. Bob, 2026-10-08 (H10, K2371): "When a question is deferred, it's deferred for that project. But that won't result in it being deferred in another project. Same with dismissed." No act of one project on a shared question moves another's, and no refusal depends on what other projects do.

**A question never reveals which projects draw on it.** Bob, D41 (2026-10-08): "The question that 2 projects both have an interest in can only see the question - they can't see that some other project is also asking the same question. What it can see is when a question gets answered. But what does that tell them - that somebody answered the question. But it still doesn't say anything beyond that. It could be a question in a hidden project - or it may not." So a member sees a question, the work on it and whether it has been answered, never who else is asking; no answer about a question names, counts or implies a project she cannot see.

**Who sees a project.** As Membership §7.9 and §7.14 say: a project's contents are seen by its participants; a discoverable project's existence and name are seen group-wide, so others can ask to join; a hidden project's are not (D40, withdrawn by Bob as already ruled).

**What administrators see of a hidden project** (Bob, "D54: B", 2026-10-09). Administrators see that a hidden project exists, its name and its owners, so the custodial role can place a legal hold or act on a complaint; they see its contents only if its owners add them. This amends Membership §7.3 and §7.9 (§9 below). Of a hidden project's work, an administrator not added sees what any member outside it sees: its steps on shared questions (§3), naming no project.

**Where a first message leads** (Bob, "D52: B", 2026-10-09). What a member brings, by hand or to the assistant, leads to one of six places:
- a new project;
- an existing question or project;
- a lead, optionally watched;
- a step for understanding (§3);
- an action (`BIO_Action_v0_1.md`);
- "not Civicsmith's", with a pointer to where it belongs.

The member decides which; the assistant only proposes (§4). A lead may become a project later. Not every message becomes a project. The front door's screens and words are the UX stream's.

**A member's own matter with a public body** (Bob, "D53: A", 2026-10-09). A member's own matter, such as her dispute with an agency, is helped, in a hidden project of hers (Membership §7.9). Nothing about the private person concerned is published. A public pattern the matter shows may become a group question, carrying none of her private material unless she chooses to add it. No new construct serves this: it is a hidden project.

## 3. Steps

**What a step is.** Bob, D32: "a step is the work done in pursuit of an answer to a question. Some steps might contribute to answering the question, others may be dead-ends - though we should recognize that even some dead-ends may still contribute to our overall understanding of the world. This understanding is recorded in the form of documents, content, connections, and constructs created while pursuing that step." And D35: "A step is work done in pursuit of an answer to a question - and to provide context for members, in the development of a question, to understand how to respond to findings, and so on." A step is done by a member or by the system: "A step may be defined to indicate that a member or AI are doing specific work (a step)" (D32).

A step is the investigation's own work. It is not an action (an outward engagement, Action §3) and not a step of an action plan (Case Making §THE ACTION PLAN); a records request a step needs is started as an action, and what comes back to it (a production, a refusal, silence) is the step's product. A step is never evidence and never a leg: what it produces may become evidence by a member's act (§4).

**Where a step is taken, and who sees it.** Bob, D35: "No, a member recording a step doesn't choose which of these it serves. A step taken anywhere is seen wherever it is." Its place is fixed by where it is taken:
- **On one or more questions:** seen wherever any of those questions is seen, its doer named by handle, naming no project.
- **In a project:** project-specific work, seen as the project's contents are seen. Bob, D35: "Of course, steps that are project-specific - like the interview - aren't shared."
- **For the group:** general context outside any one project, seen group-wide. Bob, D32 (a): "Yes, work is done (steps are taken) that don't relate to a specific question. This work may be done to provide context for members, in the development of a question, to understand how to respond to findings, and so on."

**A step taken inside a hidden project on a shared question is on the question** (Bob, "D41: A"): seen wherever the question is seen, attributed by handle, naming no project. By the principle in §2, a step on a question reveals no project.

**A step contains no steps** (Bob, "D44: no"). Larger work is several steps.

**A step has no purpose or method of its own.** Bob, 2026-10-08: "A step doesn't remember it's purpose. Indeed, a step may have had multiple purposes, like in the case that it was shared across multiple questions. The method a step used to find data is irrelevant history. A step is saved as a record associated with the questions that referred to the step." Its purposes are the questions that refer to it. What it keeps: the questions or the project or group that hold it; its state (open, ended or set aside) and dates; who is doing it, by handle or as the system; what it produced, through the provenance of that data (§6); and, optionally, what was learned, in a member's words (D32 (b): "agreed").

**Steps are shared and searchable.** Bob, D45: "I suggest that steps be searchable so that the system avoids duplication steps. The advantage of avoiding dups is that if a step is shared, then when an answer is found that answer is available to all who share it." Before a step is created, the member or the system looks for an existing one doing the same work; if there is one, the question refers to it. What a shared step finds serves every question that refers to it, in whichever projects draw on them, without any project seeing the others. The system is held to this (it uses the existing step); a member is shown the matches and is never refused for them (BOB's detail, K2405). "Doing a step again" is withdrawn: change tracking on the data covers staleness (D45).

**What is saved, searched and used later is the question.** Bob agreed (2026-10-08) that the reasons given for saving steps describe how questions are saved and used: a question carries the work done on it, its steps and their outcomes, its evidence and its answer, so a member starting or joining later sees what has been done and when. Misses are data too: a look that found nothing is in the observation log, and a refusal or silence is in a records request's correspondence.

**Outcomes, per question** (Bob, "D47: B"). A step ends once, ended or set aside, and records what it produced and, optionally, what was learned. Each question it serves records its own outcome: it helped that question, or it was a dead end for it; a step may help one and be a dead end for another. A member working on the question records the outcome; the system never records "helped" or "dead end", and leaves it not yet judged. Dead ends are kept (D32). What a step produced stays in the record whatever the outcome.

**A chance find needs no step.** Bob, D32: "sometimes the information that contributes to an answer may be found through happenstance." A member may later tie a chance find to the step it helped (D32 (c): "Yes").

**Removing a step** (Bob, "D28: A"). A step nobody started can be deleted outright; one that was worked on keeps its record, and is set aside instead. Where other questions also refer to an untouched step, deleting it removes only this question's reference (the lane's detail, adopted by K2405).

**Waits and dates** (the lane's details, BOB's, from canon's notification rules). A step may wait on another step, on a document arriving, or on a date; it shows what it waits on and opens when that is done; a loop is refused. A step may carry a "by when" with its basis (a law's clock, a meeting, or the member's own choice). A nearing date changes only how it looks; an overdue one is told once, to the member who set it; a reminder is one she asked for (rule 4). A step's date is the group's own and never a finding about government (rule 5).

**What a step costs, and the shared-cost notice.** A step may carry what it costs in money: a fee, a purchase (D29). AI use is not such a cost; it follows the AI settings (the lane's detail). When several projects share a costed step, Bob, D29: "How do multiple projects share a cost only if none are hidden, in which case the system notifies project owners of the total cost and the number of projects who are similarly interested in the paying to get the answer. Each interested party can compose a message which is then sent to the others as they figure out for themselves how and how much to pay." So:
- the owners of each sharing project are told the total and how many projects share the interest, and nothing more;
- if any sharing project is hidden, no notice is sent to anyone;
- each owner may write a message, relayed to the owners of the others; it carries its writer's handle and names no project unless she writes it in (Bob, "D49: A");
- they settle among themselves how, and how much, each pays; your group's Civicsmith splits nothing and records no split.

## 4. The system's part

**Members decide.** Bob, D33 (2026-10-08): "It's important to clarify that actions that affect the answering of a question rests with members - with the support and guidance of the system. Members can have hunches, hypotheses, and follow leads - as can the system. The system (including AIs) can proactively explore a question (that is, look for answers). They have the capabilities to gauge to what extent the results that they find might contribute to the question - both in support and as contradicting other gathered information. The system can present potentially useful information to members working on a question. But it's the act of members that decide whether information is dismissed or added to the body of evidence (based on its grade and the rules of evidence that apply."

So the system takes steps (searching, capturing, reading), explores questions, gauges its finds and offers them. A member, and only a member, dismisses a find, adds it to the evidence as a leg she draws, holds a hypothesis, or starts a step from it.

**Exploring happens only where an account owner enabled it.** Each account owner (the group, a project, a member) sets exploring to No, Ask every day or Yes, within an overall limit and an exploring limit marked inclusive or exclusive of it (Bob, D39; K2350; Capability Ladders §10, which K2350 amended). Bob, D39: "if the group admin says no AI at all, then no AI at the project or member levels either. But if the admin's just saying "not on my dime", then that's something different." A project may bar AI on its own material for everyone, whoever pays (D38: "agreed, a project can also say no AI for the kinds of reasons you mention"). An exploring run is a step of the system's on the question, labelled as the system's work with who enabled it; which account paid is shown only to that account's owners, so a find never reveals which project asked (the lane's detail).

**The gauge is a labelled signal.** The system's judgement of how a find bears on a question (supporting it, cutting against what is gathered, or unclear) is a signal in the sense of K1473: shown with how it was worked out and its measured false-alarm rate, never a grade, never a stored score, never used to hide, rank or order what members see, and never cited by a claim.

**The system's hunches and hypotheses are kept apart** (Bob, "D46: A"). They sit under a heading of their own on the question, seen by everyone who sees the question and offered alongside its finds; they are never facts. A member who takes one up holds it as her own, noted as having come from the system. The members' own list holds only what members hold (K1467: only a member holds a hypothesis), and a system hunch carries no hunch grade (that grade is a member's declared bias, `BIO_Declared_Bias_v0_1.md`).

**Finds reach the people working on the question** (Bob, "D36: C"). The joined members of every project that draws on the question receive each find once, in their queue; each may stop following a question, or follow one; nobody receives anything she may not already see.

**People, through their part in a public matter** (Bob, "D13: B", 2026-10-09, restating D13 after his B8, that tracking people is essential). An investigation looks at people through their part in a public matter; no investigation has a private person's private life as its subject. So:
- when an objective or a question names a person in no public role, the member is warned at that act, and she decides whether to go on;
- the system never explores a person on its own: it gathers about a person only when a member has tied that person to the question, and then only up to a cap of persons per exploring run (the cap is BOB's detail);
- the rules on what is published are unchanged.

**Test investigations gate the AI** (Bob, "D14: C", 2026-10-09). Civicsmith keeps a set of test investigations: frozen real matters, with answers written by people. Every AI part, the question explorer among them, is released only once it passes its bar on that set (D11). A group may add test investigations of its own; the AI is measured on them and the result is shown to that group. The transcripts of test runs are for grading only and are never published.

**When exploring is offered.** With D13 and D14 ruled, the system's exploring is offered once the explorer passes its test bar: like every AI mode, a live check and a test-investigation bar (D11, settled K2064). Until then no member is offered it. Steps, milestones and reports work fully without it (§7).

## 5. Milestones and reports

**Milestones belong to a project** (Bob, "D27: A"). Its members set named, dated milestones, each listing the questions or steps it waits on, such as "contract and change orders in hand before the 14 November board meeting". Another project sharing a question sets its own; a milestone never reaches outside its project.

**When a milestone is met** (Bob, "D48: as recommended"). An item is done when:
- a question: this project has concluded on it (another project's conclusion does not count);
- a step: it has ended, whatever its outcome.

A question this project deferred or dismissed, or a step set aside, is not done: the milestone shows it as stuck, and a member may take the item off, which is recorded. So a milestone never reads "met" when the work was dropped. A nearing milestone changes only how it looks; an overdue one is told once; reminders only as asked (rule 4). A milestone is the group's own date, never a duty, clock or finding about a public body (rule 5).

**Reports** (Bob, "D30: B"). Any member may write a report on a project or on a question. The system drafts it from the record since the last report: steps taken and ended, what was found, what is waiting. She edits it and adds her own words, and it is kept with the project, dated. It is never published, carries no figures about individual members, and is never required on a schedule. The draft is composed from the record without AI, so every member can have one (D42; BOB's detail, K2405).

## 6. Why a document is held: provenance

**Read from the record, never written separately** (Bob, "D50: as recommended"). Why the group holds a document is answered by its provenance: the step that produced it and the questions that step serves. This follows Bob's "A step doesn't remember it's purpose" (§3) and K2064's D5 (the reason at the door is provenance). No separate per-document purpose is stored, and `holdings` leaves D1's module list.

- A document that came without a step (a chance find, something forwarded, a doorbell drop) shows who brought it and from where; once a member ties it to a step, it shows that step's questions.
- A member who wants to say why she grabbed something writes it in the step's learned line or in a lead.
- From any document, passage or connection, provenance leads to the step that produced it, and so to its questions; when the data changes, change tracking brings it to the questions that rest on it.
- Linking a held document to a question as evidence is still a member's act, never the system's (D5, K2064; §4).

## 7. Two audiences

Bob, D42 (2026-10-08): "I think that it's important that the design of the investigation be both fully capable to supporting the diversity of complaints and questions a member might throw at the assistant, and also be fully capable to supporting a highly efficient non-assistant-enabled workflow. Both audiences must be optimally served."

So:
- **One front door for both paths**: a first message, typed into a form or told to the assistant, leads to the same six places (§2, D52), the member choosing; a member's own matter goes to a hidden project of hers (D53). The front door's screens are the UX stream's.
- **Every act here has a by-hand path that needs no AI**: creating, finding and referring to steps, ending them with their outcomes, waits and dates, costs and messages, following a question, milestones, and report drafts. No service requires AI.
- **The assistant's path adds, never replaces**: the assistant may interview a member about a new or messy concern, turn her words into proposed questions, steps and possible explanations, and explore where enabled, each proposal labelled and taken up only by her act (D33, D34).
- **AI use follows each account owner's settings** (D34: "the system should recognize and support this diversity of AI usage"); a member with no account and no group key uses all of the above without AI.

Bob's model of the craft (2026-10-08, offered by him for confirmation and mapped by the lane, not yet confirmed as canon): "An investigator starts with a story idea that's based on something that's come in. They conduct interviews (of possibly themselves and others) to gather information to develop a fully understanding of the specifics of the case. As they do so, they inventory what they know and what they need to know. They identify questions that need to be answered, then go find evidence that answers the questions. The case evolves as it unfolds. Sometimes even the objectives expand or change. IN the end, the investigator writes of the case then optionally puts together an action plan for properly responding to what they found." Steps are the "go find evidence" stage and the interviews; milestones and reports are the inventory kept current.

## 8. What stays open

**Open with Bob, each to come with its background and options:**
- **D1** — what remains of the module list after D50 and D51: a library of reading guides, an AI planner (mode `enquire`), an AI reading flow (`READ_FLOW`).
- **D2** — whether a run may read bounded text spans of one held document, returning only proposals (loosens IS §14b.1).
- **D3** — one accepting act for every proposal, recording as proposed, edited or unaided.
- **D4** — the grade of an AI-located fact: the quote's cap from the text, value by code, meaning by adoption.
- **D7** — what authorises targeted AI work; mostly answered by D34/D39, clause (c) (one act starting several steps' runs) remains.
- **D8** — reading guides for recurring documents, Civicsmith's and each group's; machine drafts, never approves.
- **D12** — a rough cost shown before AI work, including an Ask item's estimate; tracking after is answered.
- **D16** — watch or close when nothing left could change the picture; dormancy a display.
- **D17** — waits seen by every member working on a question; dependent set-asides, narrowed by H10 and §3's step waits.
- **D18** — sharing a private note with a project, never as evidence.
- **D19** — the intake interview, a project step: about six questions on one page, each with why, all skippable.
- **D20** — the answer's vocabulary: baselines side by side, no "late" verdict, "cause not established" unless a member authored one.
- **D21** — AI transcription of image-only pages, labelled undetermined until measured.
- **D22** — the bearing note: a short note beside a source, every sentence tied to a quote.
- **D23** — member-facing names, including one for steps not confused with the action plan's (with the UX stream).
- **D24** — the canon text of the instructions the AI follows when reading, planning and interviewing; Bob rules it first.
- **D43** — supporting members throughout the action plan; a future design effort, BOB's to schedule.

**Ruled 2026-10-09 and folded:** D13 and D14 (§4), D52 and D53 (§2, §7): Bob, "D52: B, D53: A, D13: B, D14: C". D54 (§2, §9): Bob, "D54: B".

**Existing canon this draft meets but does not resolve (for BOB):**
- Capability Ladders §10 forbids "drift into ... case management"; the lane read that as excluding timesheets, Gantt charts and member scores, not a plan serving the investigation, and offered the reading to Bob, and whose rulings D27 and D30, made on the page that offered it, settle it for this construct.
- Action §4 rule 8 ("the plan holds no costs, assignees or hours") and Case Making §6b (a free resources list on an action-plan step) govern the action plan; D29 gives investigation steps a money cost. Not a contradiction of the text, but the "no budgets" line of 2026-09-29 is reversed for this plan only, per the lane's D29 framing.
- K1463 makes the group's payments ordinary money facts with no "ours" mark; a step's stated cost is the group's working figure, not a money fact. Whether an actual payment is then recorded per K1463 and tied to the step is not ruled.
- Case Making's and the queue's uses of "step" and "finding" (an action-plan step; a machine "finding" as a queue item) collide with this document's; D23 owes one member-facing meaning each.

## 9. Amendments to existing canon (approved with this text)

Approving this document approves these replacements. BOB applies each when the document is placed, recording it once in `rulings.md`.

**A. `BIO_Membership_Architecture_v2.md` §7.3** (D54). Replace the whole paragraph with:

> **7.3 Visibility.** A member sees only the projects they have been invited to, whether or not they have accepted, and the existence and name of a discoverable project (7.14). Administrators see every discoverable project and its participant lists. Of a hidden project, an administrator who has not been invited sees only that it exists, its name and its owners, so the custodial role can place a legal hold or act on a complaint; its contents and its other participants are seen only if its owners add that administrator (Bob, 2026-10-09, "D54: B"). Administrator sight survives the reversal in 7.7 deliberately: the custodial role can audit without being able to act in any project.

**B. `BIO_Membership_Architecture_v2.md` §7.9** (D54). Under "Three positions, not two", replace the line "Administrators see all projects and all participant lists." with:

> Administrators see projects as 7.3 says: every discoverable project and its participant lists; of a hidden project they were not invited to, its existence, name and owners only, and its contents only if its owners add them (D54). An act an administrator holds that must reach a hidden project without its contents (a legal hold, DEC-113; 7.13's rescue) reaches it at that level.

In the same section's bullet "ONE resolution of a session to what it may SEE", replace "(the founder's is the administrator viewer, so every project and every participant list, as this section says)" with "(the founder's is the administrator viewer, so what 7.3 gives administrators)".

**C. `BIO_Membership_Architecture_v2.md` §7.14** (D54), under "Sight, now three levels, still ONE predicate". Replace "administrators and the founder are unchanged (they already see everything)." with "administrators and the founder see every discoverable project in full and every hidden project they were not invited to at EXISTENCE, with its owners (7.3, D54)."

**D. `BIO_Membership_Architecture_v2.md` §4**, the paragraph "And administrators do not touch project participation" (D54). Replace "Administrators do continue to SEE every project and every participant list, per 7.3 and 7.8." with "Administrators do continue to SEE every project as 7.3 says: a hidden project's existence, name and owners, and its contents only if its owners add them (D54)." The sentence after it, the doctrine that sight and authority are separated, stands.

**E. `BIO_Capability_Ladders_v0_1.md` §9.5, L4, "Ruled"** (K2352, K2353). Replace "a run is carried only by the account that serves the starting member's act, their own or, while it is on, the group's API key (K1755), within that member's use ceiling (K1450); there is no project account and the subscription token is each member's own by Bob's choice (K1547, K1755) on every plan;" with "a run is carried only by the account that serves the starting member's act: the project's account if it has one, else the member's own, else, while it is on, the group's API key, each within the limits its owner sets (K1755, K2352); a project's account is an API key, or its sole member's own subscription while it has one member (K2353), and otherwise the subscription token is each member's own by Bob's choice (K1547, K1755);".

**F. `BIO_Capability_Ladders_v0_1.md` §9.4, Stage 0, "Design"** (the same stale words, K2353). Replace "it serves only that member's asks, runs and standing questions, and there is no project account and the subscription token is each member's own by Bob's choice (K1547, K1755);" with "it serves only that member's asks, runs and standing questions; a project may hold an API key, or its sole member's own subscription while it has one member (K2353), and otherwise the subscription token is each member's own by Bob's choice (K1547, K1755);".
