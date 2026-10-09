# Canon draft: investigations (BIO_Investigation_v0_1.md and its amendments)

Worker draft for BOB on `tranche/T40`, refolded from the design of record (`docs/development/investigation-design/investigation-design.html` on `design/investigation`; https://claude.ai/artifact/QjSSFHE78G9PtwKhpW5ZEo) by the placement plan of its HANDOFF H40, which Bob confirmed (H41). Three parts:
- **Part 1** is the whole text of `docs/architecture/BIO_Investigation_v0_1.md`, between the BEGIN and END markers. It states only what is new to investigations and cites canon for everything already ruled.
- **Part 2** lists the amendments to existing canon approved with that text, each with its document, section, exact old text and exact new text.
- **Part 3** lists what could not be placed, and where the design conflicts with canon as read.

On Bob's approval BOB places Part 1, lists it in `docs/architecture/README.md` and `requirements/README.md`, applies Part 2 (updating each amended document's Status date), and records the result once in `build/rulings.md`.

---

## Part 1 · the text of `docs/architecture/BIO_Investigation_v0_1.md`

<!-- BEGIN BIO_Investigation_v0_1.md -->

# BIO Investigation v0.1: the project as an investigation

**Status** · Draft for Bob's approval; the design of record approved by Bob 2026-10-09 (K2417). This is the design of record, `investigation-design.html` on branch `design/investigation`, put into canon by the placement Bob confirmed (H40, H41): this document states in full only what is new to investigations, and cites the canon document that already rules everything else. It is approved together with amendments to other canon documents (System Design §1; Membership §4, §7.3, §7.9, §7.14; Case Making §4a; AI Roles rule 9; Action §3; Content Framework invariant 7; Capability Ladders §9.4, §9.5 L4; Declared Bias, regrade), and K1481 is amended by a ruling. Each amendment lives in its own document. Complete for the design of record, apart from the sections listed below. Text marked *[detail]* is a detail the design lane settled within Bob's rulings. Bob's history of rulings is in the lane's `DECISIONS.md` and `HANDOFF.md`, which are not canon. as of 2026-10-09

**Place in the system** · Level 1, under construct 8 of `BIO_System_Design.md` §3 (intent and inquiry). It sits between a project's questions and the evidence members add to them. It depends on these documents and does not restate them: `BIO_System_Design.md` §1 (why Civicsmith exists); `BIO_Case_Making_v0_1.md` (the inquiry, the leg, the basis, the conclusion, the case as a production); `BIO_Content_Framework_v0_10.md` §8.1 and §14.4 (grades, testimony) and §12 (an objective's condition); `BIO_Membership_Architecture_v2.md` §7 (projects, owners, participants, discoverable or hidden); `BIO_Capability_Ladders_v0_1.md` §2 and §10 (AI accounts, limits, exploring, machine signals, hypotheses); `BIO_Assistant_and_AI_Roles_v0_1.md` §3 (the AI's rules); `BIO_Declared_Bias_v0_1.md` (bias, hunches, regrade); and `BIO_Publication_v0_1.md` (publication, editions, the docket, import). `BIO_Action_v0_1.md` begins where this ends. The requirements that cite it are T41's `steps`, `question-explorer` and `investigation` (`build/plan/draft-T41-investigation.md`).

**Incomplete sections** ·
- §3 — the names members see for a step, a milestone and a status report, and a name that keeps the investigation's work apart from the action plan, are not ruled (D23, owed with the UX stream).
- §11 — readers' re-check under a lens and the importing group's lens depend on regrade, which is ruled to be built (Declared Bias, as amended) and is not built.

**Contents**
- [1. Purpose, and what this document cites](#1-purpose-and-what-this-document-cites)
- [2. An investigation is a project](#2-an-investigation-is-a-project)
- [3. Steps](#3-steps)
- [4. Saving steps and questions](#4-saving-steps-and-questions)
- [5. The system's part](#5-the-systems-part)
- [6. AI use in an investigation](#6-ai-use-in-an-investigation)
- [7. Where a first message leads](#7-where-a-first-message-leads)
- [8. Narrative and evidence](#8-narrative-and-evidence)
- [9. People](#9-people)
- [10. The parts to be built](#10-the-parts-to-be-built)
- [11. Publishing a case: what is new](#11-publishing-a-case-what-is-new)

---

## 1. Purpose, and what this document cites

This document says how a group investigates a public body in Civicsmith, from what comes in to a published case that another group can check and accept. Why Civicsmith exists, and what everything here is held to, is `BIO_System_Design.md` §1 (as amended 2026-10-09), Roadmap §4–§5, Case Making §4a and Functional Architecture Layer 2. A member's act commits the group, but what it rests on is graded evidence held to the project's bar. Judgement applies to what a finding signifies and whether to act on it, never to what the facts are.

**Ruled elsewhere, cited here and not restated:**

| matter | where it is ruled |
| --- | --- |
| questions, legs, basis versions, conclusions, strength beside the bar, contradictions and conflicts between projects' conclusions | Case Making (the inquiry; R1–R4; CONTRADICTION, DEC-76); Design Requirements 5 |
| grades, capture and connection kept apart, testimony, "undetermined", absence at four levels | Content Framework §8.1, §14.3, §14.4; Capability Ladders §10 |
| hunches, hypotheses and machine signals | Declared Bias (HUNCH DEBT); Capability Ladders §10 (K1467, K1473) |
| determination, action plan, actions, the breach gate | Action §3, §4 (rules 1, 2, 4) |
| who sees a project; administrators' sight of a hidden project | Membership §7.3, §7.9, §7.14 (as amended 2026-10-09) |
| AI accounts, limits, exploring settings, "no AI at all" and "not on my dime" | Capability Ladders §2 (cross-cutting rulings) and §10 (K2350, K2352, K2353) |
| the AI's rules of conduct | AI Roles §3 (as amended 2026-10-09) |
| publication's checks, the five screens, signing, editions, the docket, withdrawal, the review copy, the second person's check of what was left out | Publication §3, §5, §5A, §5D, §6A |
| bias printed into the case; the acknowledgement; regrade and rerun | Declared Bias (DEC-103; differential traversal, as amended 2026-10-09) |
| importing and recreating another group's case | Publication §5C |
| working material never published; no nagging; nothing measures a member; the group's own dates never findings | DEC-25, DEC-31 (K2064, D15); DEC-69, DEC-94; DEC-68, K1892; Capability Ladders §10 |

The machine proposes. A member accepts on the evidence, and the record shows the grade. The machine never concludes, determines or attests (AI Roles §3 rules 1 and 4; Capability Ladders §10).

## 2. An investigation is a project

- An investigation is a project. A project has an objective: what it is trying to establish. It pursues the objective by posing questions, which may or may not be answered.
- **The objective is the measure throughout, and the evidence decides it.** An investigation gathers information to make a determination: whether a contract award was made properly, whether there is a legal justification for a transfer, whether the city is meeting its stated standards. At every point the question is whether the objective has been met, whether or not every question has been answered. That is decided by rigorous assessment of the evidence, never by anyone's say-so.
- **The objective's condition** states what the record must hold for the matter to be decided, not which answer is hoped for. For example: for every contract award in the period, the solicitation and the public vote, or a records request answered that none exists, each at the project's required grade. Progress toward the condition is computed from the record, never reported by a member. What falls short is listed as gaps, and the gaps are the work list. An objective with no such condition is shown as one whose progress cannot be computed, never as met. No member act declares an objective met.
- When the record holds what the objective needs, the matter can be determined: award by award, against the rule that binds it, as complied, did not comply, or unclear (Action §3). An investigation that shows a rule was followed or broken has met its objective either way. Compliance is recorded with the same care (Action §4 rule 4).
- Members draw legs on what the record holds, each with its grade, and conclude questions. A conclusion always shows its strength beside the project's bar. The bar gates publication and claims that a rule was broken (Publication §3; Action §4 rule 2). It never gates drawing a leg or concluding.
- Members write the objective and its condition, and may revise them with a reason as the case develops. Finds that cut against what members expect are shown as prominently as those that support it (Content Framework invariant 7, as amended).
- The project's page always shows the objective, its condition, and where the evidence stands: for it, against it, and the gaps.
- **A question can serve several projects and objectives.** Each project has its own relationship with a question: it draws on it, it may hold its own conclusion on it, and it may defer or dismiss it. One project's deferral or dismissal never affects another project.
- **A question shows which non-hidden projects draw on it.** A hidden project that draws on it is never shown, named or counted. So a member sees the question, the work on it, whether it has been answered and the non-hidden projects asking it, and can never tell whether a hidden project is asking too. (This replaces the earlier principle that a question never shows which projects draw on it; Membership §7.14 carries the exception.)
- Who sees a project, and what administrators see of a hidden one, is Membership §7.3, §7.9 and §7.14 as amended. Of a hidden project's work, an administrator who was not added sees what any member outside it sees.

## 3. Steps

- **A step is work done in pursuit of an answer to a question.** It is also work done to give members context, to develop a question, or to understand how to respond to findings. A member or the system (the AI included) does it. A step is not an action (Action §3), and it is never evidence or a leg. What it produces may become evidence by a member's act (§5). A records request a step needs is started as an action, and what comes back is the step's product.
- **Where a step is, and who sees it.** A step is seen wherever it is taken; nobody chooses.
  - *On one or more questions:* seen wherever any of those questions is seen, with the member's handle and the project it was taken in, if that project is not hidden. A step taken in a hidden project names no project.
  - *In a project:* project-specific work, such as the intake interview, seen by that project's participants.
  - *For the group:* general context outside any one project, seen across the group.
- **Ending a step.** A step is ended or set aside, and records what it produced and, optionally, what was learned, in the member's words. Each question it serves records its own outcome: the step helped that question, or it was a dead end for it. A step that helped one question may be a dead end for another. Someone working on the question records the outcome. The system never does, and leaves it "not yet judged". Dead ends are kept, because they can still add to understanding.
- **What a step produces stays in the record whatever the outcome:** documents, content, connections and other records, and looks, including "looked, absent".
- **Removing a step.** A step nobody started can be deleted outright. One that was worked on keeps its record. Where other questions also refer to an untouched step, deleting it removes only this question's reference. *[detail, for shared steps]*
- **What a step costs.** A step may carry a cost in money, such as a records-request copying fee or a video to buy. AI use is not counted here; it follows the AI settings (§6). A step's cost is the group's working figure. It is not a money fact (K1463).
- **Sharing a cost.** When several projects share a costed step and none of them is hidden, the owners of each are told the total cost and which projects share the interest. Each owner may write a message, which is passed to the others. It carries its writer's handle and names no project unless she writes one in. They work out among themselves how, and how much, each pays. Civicsmith splits nothing. If any project sharing the step is hidden, no notice is sent.
- **A chance find needs no step.** A member may later tie it to the step it helped.
- **Dependencies.** A step may wait on another step, on a document arriving, or on a date. It shows what it is waiting on and opens when that is done. A loop is refused. *[detail]*
- **By when.** A step may carry a date with its basis: a law's clock, a meeting, or the member's own choice. A nearing date changes only how the step looks; an overdue one is reported once. *[detail, from the notification rules]*
- **When the work goes quiet** (every step ended, nothing awaited), the system shows once where the evidence stands against the objective's condition. If the condition is satisfied, the members turn to writing up and acting. If it is not, and nothing is left to try, they choose to watch (keep watching the sources and reopen the work when something arrives) or to close, with the gaps recorded as what remains unknown. Or they revise the objective, with a reason. Nothing more is asked after that. A quiet project shows as quiet on its page. That is a display, not a stage.
- **Waits on a question** ("the district's reply, due 1 November") are seen wherever the question is seen, by handle, naming the project they were set in only if it is not hidden, as steps are. A reminder a member asked for stays hers alone.
- **Milestones belong to a project.** Its members set named, dated milestones, such as "contract and change orders in hand before the 14 November board meeting". Each lists the questions or steps it waits on, and is met when they are done. A question is done when this project has concluded on it; another project's conclusion does not count. A step is done when it has ended, whatever its outcome. A question this project deferred or dismissed, or a step set aside, is not done: the milestone shows it as stuck, and a member may take it off, which is recorded. So a milestone never reads "met" when the work was dropped. Another project sharing a question sets its own milestones. A milestone, like every date of the group's own, is never a finding about government.
- **Status reports.** Any member may write a status report on a project or a question. The system drafts it from the record since the last status report: steps taken and ended, what was found, what is waiting. She edits it and adds her own words, and it is kept with the project, dated. It is never published, carries no figures about individual members, and is never required on a schedule.

## 4. Saving steps and questions

- **The record is the data:** documents in a read-through cache with change tracking, their content, their connections, and the maps (money, organisations, people's ties, regulations, court decisions, policies, standards). Investigations and actions are processes on that data. Steps are smaller operations within them, mini-investigations whose purpose is to find answers. Everything a step finds is already in the record as data, with its provenance. That includes what it did not find: a look that found nothing is kept in the record's observation log, and a refusal or a silence is kept in the records request's correspondence.
- **Later-found data reaches dead ends.** When data a step looked for and did not find is found later, change tracking brings it to the step and to the questions it serves. The earlier look stays in the record with its date, and a member working on a question may revise the step's outcome for it.
- **What is saved for a step.** A step is saved as a record associated with the questions that refer to it, and several questions may refer to one step. It keeps no purpose of its own, since it may serve several; its purposes are the questions that refer to it. How it found its data is history the record does not need. It keeps: the questions, or the project, that refer to it; whether it is open, ended or set aside, with its dates, and its outcome for each question it serves; who is doing it, a member by handle or the system; what it produced, through the provenance of that data; and, optionally, what was learned.
- **Steps are searchable, so work is not duplicated.** Before a step is created, the member or the system looks for an existing one that does the same work. If one exists, the question refers to it instead. What a shared step finds is available to every question that refers to it, in whichever projects draw on them, without any project seeing the others' contents. Each project concludes for itself.
- **What is saved, searched and used later is the question.** The question carries the work done on it (its steps and their outcomes), its evidence and its answer. So:
  - before starting, a member or the system finds the question and sees what has been done on it and when;
  - from any document, passage or connection, provenance leads to the step that produced it, and so to the questions it serves;
  - across questions, the data shows what has been asked of a public body and what came back, including refusals and silence;
  - when the data changes, change tracking brings it to the questions that rest on it;
  - a published case states what was searched and with what outcome, computed from the record's looks;
  - a member joining later reads the question, its work, its evidence and its answer.
- **Why a document is held** is read from the record, never written separately: the step that produced it and the questions that step serves. A document that came without a step (a chance find, something forwarded, a doorbell drop) shows who brought it and from where, and, once a member ties it to a step, that step's questions. A member who wants to say why she grabbed something writes it in the step's "what was learned" or in a lead.

## 5. The system's part

- **Members** pose questions and take steps; hold hunches and hypotheses and follow leads; close steps with their outcome; decide what becomes evidence, by its grade and the rules of evidence; conclude on the evidence; publish what meets the bar; determine, against the rule that binds, whether a body complied; and act on a determination.
- **The system, the AI included,**
  - takes steps: searching, reading, and asking to capture pages the record already points to. A page it finds anywhere else it names to a member, who captures it (AI Roles rule 12);
  - explores questions where an account owner has turned exploring on (Capability Ladders §2, §10);
  - has its own hunches and leads (below);
  - judges how a find bears on a question, supporting it or contradicting what has been gathered;
  - offers finds to the members working on the question.
- **A member's act decides:** she dismisses the information, or adds it to the evidence on the question by its grade and the rules of evidence.
- **One accepting act for every kind of proposal:** a find, a hunch, a proposed question or step, or the reading of a passage. The member takes it up as proposed, takes it up edited, or writes her own instead, and the record keeps which. Any joined member of a project drawing on the question may act on it. Where accepting would make her vouch for a legal or authored statement, she writes it in her own words. How often each kind is accepted unchanged is measured across the group only, never per member.
- **A fact the AI found loses no strength for that.** When the publisher's own words are in the document, checked there by code, and any number or date in them is read there by code and checked by the member, the passage keeps the document's own capture grade. How it bears on the question, and any connection it makes, is graded by how that link is established, as for any leg. The machine only pointed. What the passage means is read by the member when she accepts it, and recorded as proposed or edited. Only text the AI read from a picture of a page, where the words themselves may be misread, is weaker until measured (§6).
- **The system's judgement of a find is a labelled signal** (Capability Ladders §10, K1473): shown with how it was worked out and its measured false-alarm rate. It is never a grade, never a stored score, and never used to hide or rank what members see.
- **The system's hunches and hypotheses are kept apart from members'**, under their own heading on the question. They are seen by everyone who sees the question and offered alongside its finds. They are never facts. A member who takes one up holds it as her own, noted as having come from the system. The members' own list holds only what members hold (K1467).
- **Who receives a find:** the joined members of every project that draws on the question. Each receives it once, in her queue, never by email. Each may stop following a question, or start following one. Nobody receives anything she may not already see.
- The system's finds are labelled as the system's work. Which account paid for them is shown only to that account's owners: what a project spends is its own business.

## 6. AI use in an investigation

Groups vary from no AI at all to wanting all it can offer, and a group and its members may differ. Accounts, limits, the exploring setting (No, Ask every day, Yes) and the two kinds of "no" are Capability Ladders §2 and §10 (K2350, K2352, K2353). The types of use switched on or off include conversation, member support, the intake interview, turning members' words into questions, reading documents and exploring questions. What is new for investigations:

- **A project's "no AI" covers what is its own:** its project steps, notes and interview, and any question or document that only it draws on. Material it shares with other projects follows the group's setting, since a project cannot tell what others are doing with it. *[detail: it keeps one project from blocking, and so revealing itself to, another]*
- **The intake interview** asks the same questions on both paths: what happened; which public body, and where; since when; what was promised or expected, and by whom; what you already have; what you want to come of it. By hand, it is one page to fill in quickly. With the assistant, it is a conversation that skips what she has already said and follows up. The member checks the answers before they are kept. The answers are narrative (§8).
- **How answers are worded.** In Civicsmith's own voice, an answer shows each baseline side by side with what it rests on and the measured difference ("900 days since the notice to proceed; contract time 540 days"). It gives no verdict, likelihood or rating words, and says "cause not established" unless a concluded finding establishes the cause. A cause a member suspects stays a labelled hypothesis. A cause the district or contractor gave is shown as their stated cause, quoted (Capability Ladders §10, "Cause is stated, never inferred"). Members' conclusions may say "late" where a finding at the bar shows that the contract's date has passed.
- **Pages that are only pictures.** The AI may transcribe scans that Civicsmith's own text recognition cannot read, on the paying account and within its limits. The text is labelled as the AI's reading and graded "undetermined" until its accuracy is measured. A member who checks a passage against the page may confirm it, and it then carries the document's grade.
- **A note beside a source:** a short note on what a document says about the question, and what it does not. Every sentence is tied to a quote, and any sentence that cannot be tied is left out. It is never shown in place of the source, never stored as the document's content, and never cited as evidence.
- **Reading guides** say what to look for in one kind of document (in a construction contract: the contract time, damages and the change-order clause). By hand, a guide is a checklist; for the AI, it is what to read for. Civicsmith keeps a library shipped to every group, approved by Bob or someone he names, each guide only after measured use shows it works. Each group keeps its own: a member's guide is usable by her at once, and becomes the group's after another member reviews it. Guides are shared across groups: a group may offer one to others, and a group that takes it up reviews its copy before it becomes its own. A guide many groups use may be proposed for Civicsmith's library. The AI may draft a guide but never approves one. When the AI reads a kind of document, it loads that kind's guide as its skill, so the AI's reading and the by-hand checklist are the same thing. A guide says what to look for, never how the AI may behave: the AI's rules of conduct come only from the rules Bob approves, no guide can loosen them, and code checks that none does.
- **Test investigations.** Before members get an AI part, it must pass Civicsmith's own set of test investigations: real public matters, frozen with their documents, with answers written by people (D11, K2064). A group may add its own; the AI part is then also measured against them, and the results are shown to that group. Test transcripts are kept for grading only and never published.
- **Several steps at once.** One act may start several AI steps. The estimate made beforehand covers them all. Each runs within the limits, and one that reaches a limit stops and says so while the others go on.
- **The rules the AI follows** are approved by Bob in plain language, as part of this design (for example, "the assistant never writes a member's reason"). The AI's working instructions may only quote those rules, and code checks that they do.
- **Cost before and after.** Before an AI act or an exploring run, an estimate is shown as a range ("about $0.50 to $2"), or "not known yet" until enough runs are measured. After it, the actual cost is shown. Both are shown to the paying account's owners only. On a subscription, runs and tokens are shown instead of money. Nobody sees another member's spending.
- **Reading inside a document.** The AI may read a document the group holds a few pages at a time, within a reading limit, and never one under a "no AI" limit. As it reads, it builds the record: it proposes the passages worth citing that bear on the investigation (figures, policies, decisions, statements and the like) and the connections they make (to bodies, to people in their public roles, to other documents and to the questions). Each proposal is tied to its exact quote, labelled as the system's work, and taken up by a member's act (§5). A passage keeps the document's capture grade. A connection is graded by how the link is established, never by the machine's say-so, and the machine never grades one D (AI Roles rule 3).
- **Tracking.** Use is tracked per account, per type of use, over time. A member sees her own use. A project's owners see the project account's use. Administrators see the group key's totals by type of use, naming no member.

## 7. Where a first message leads

- Both kinds of member come in through one door: "What happened?". With the assistant, the member writes freely and the assistant proposes where the message should go. By hand, the same door offers plain-language choices (the guided starts), shows existing work that matches, and allows a blank start. *[detail]*
- A first message leads to one of six places: start a project; add to an existing question or project; keep it as a lead, with a watch if wanted; a step for understanding; an action; or "not something Civicsmith does", saying where to go instead. The member always decides, and can move a lead into a project later.
- **A member's own matter with a public body** (a suspension, a refused permit) is helped: getting her own records, checking the body's own policy, writing to it. It lives in a hidden project of hers, seen by her alone unless she adds others. Nothing about the private person concerned is ever published. If a public pattern appears, she may start a group question about it, carrying none of her private material unless she chooses to.
- Tangled messages become one project with several questions when they share a subject, and separate projects otherwise. Rumours become leads, never questions aimed at a person. *[detail]*

## 8. Narrative and evidence

- **What a member recalls of what others said or did is narrative.** The intake interview and a member's story are kept in her own words. They are valuable because they say where to look. But memory is not always exact, and a member's recollection of what a public body said is not the body's statement. What she saw or heard herself, and a source's own account, can be recorded as testimony: evidence, labelled with whose word it is (Content Framework §8.1, §14.4). Everything else must be found in the record.
- **A claim in the narrative becomes something to find.** When a member says "the district said the campus would be closed for one school year", the system (or the member, by hand) turns it into a step: find where the district said it (a newsletter, a board item, the bond materials). Until it is found, the claim is shown as the member recalls it, never as what the district said.
- **A member who was there** (she heard it said at a board meeting) may record it as her own firsthand account. That is evidence, graded as testimony and labelled as her account. The grade says it rests on her word and is harder for others to check, not that it is less true. Corroboration strengthens it. An anonymous account is corroborated before a finding rests on it (Publication §5C).
- **A private note may be shared with a project the member is in.** Its participants see it, in her words and labelled as hers. It is narrative, never evidence, and never published. She may withdraw it, and the record says it was shared and withdrawn. If it names a person in no public role, she is warned at the act (§9).
- **In an answer, each baseline names what it rests on:** a document, a member's firsthand account, or "as recalled", with whether anyone has looked ("not yet looked for", or "looked for and not found", saying where).

## 9. People

- An investigation may concern anyone whose acts bear on a public body's act: a contractor's owner, a donor, a landlord whose building the city inspects. Officials are investigated in their official acts.
- No investigation has as its subject a private person's private life. When an objective or a question names a person in no public role, the member is warned at the act, and decides.
- The system never explores a person on its own. It gathers about a person only when a member has tied that person to the question, and only up to a fixed amount per run.
- Publication names a person outside a public role only where their act bears on a finding (Capability Ladders §2, K1483; Design Requirement 6).

## 10. The parts to be built

- **Steps** (`steps`): steps, where each is seen, outcomes per question, what a step produced, waits and dates, costs and the cost notice, the search that prevents duplicates, later-found data reaching dead ends, and following a question.
- **Question explorer** (`question-explorer`): the system exploring a question unasked, judging its finds and offering them. It is built separately so that steps, milestones and status reports work fully without AI. It is not offered to members until it passes its test investigations (§6).
- **Investigation** (`investigation`): a project's milestones and its members' status reports.
- **Reading guides:** the library of reading guides, Civicsmith's and each group's, shared across groups. Its placement and name are BOB's.
- **Planning**, a new kind of AI work inside the existing AI parts: the assistant's interview, turning a member's words into proposed questions and steps, and turning remembered claims into "find the record" steps. It has its own test bar.
- Everything else extends parts that already exist: the guided starts and the front door, reading inside documents, proposals and AI use, notes, waits and watching.

## 11. Publishing a case: what is new

Publication's checks, the five screens, signing in the owner's browser, scheduled publishing, editions, the docket and withdrawal are Publication §3, §5, §5A and §5D. The review copy, and the second member's disclosed check of what was left out, are Publication §3 rule 11 and §6A. The printed bias and the owner's acknowledgement are Declared Bias (DEC-103). Importing and recreating a case is Publication §5C. What follows is new.

- **The case's account, and nothing but evidence.** The system drafts the case's written account from the evidence, and may offer more than one framing (in time order, by question, by rule), each labelled as the system's. The member writes the account, from a draft or from nothing, and it is published as hers. Before publication, every sentence is checked against the evidence it cites. A sentence the evidence does not support is flagged: she ties it to evidence or removes it. A sentence the record contradicts is refused outright. Only framing that follows a documented bias statement may stay, marked as such in the text. An unsupported claim cannot be relabelled as bias. Lying is not bias.
- **The case's statements about itself** (what it says; why this subject; what was left out, and why; and, for a correction, what changed) are held to the same check.
- **No stories.** A case carries no stories, context or human-interest accounts, however relevant. In Bob's words: "There are other publications where those stories belong - in a Civicsmith published case is not one of those places."
- **Bias in the case.** Printing the bias in force stays required (Declared Bias, DEC-103). Framing carried under it is optional, and is allowed only when marked in the text and tied to a bias statement printed in the case.
- **Readers' re-check under another lens.** When a bias statement is applied (more scrutiny on a source, an inference blocked), the leg or conclusion it touches records that statement, and the case file carries those records. The standalone checker takes a lens: as published, bias removed, or the reader's own. For each finding it reports whether the finding still meets the bar, and which statements made the difference. Every report states the honest limit: a re-check re-weighs the analysis that exists, but cannot write what another lens would have written. This is Declared Bias's regrade, ruled to be built.
- **Approval.** A group may set its own rule requiring the approval of one or more named members before any of its cases is signed. The rule is off by default, so a group of one is never blocked.
- **Reviewers.** A body of evidence may hold more than a case needs. The publisher decides which evidence to cite and which to leave out, and states what was left out. A reviewer may disagree. The publisher decides whether to include a reviewer's comments in the case. A reviewer whose comments were not included may add them to the published case afterwards, as anyone outside may (Publication §5D). A reviewer's objection does not travel with the case automatically.
- **Accepting another group's case.** After import and recreation (Publication §5C), a group may accept finding by finding, or accept the whole case in one act: every finding that recreated, with one reason, and those that did not listed. Once readers can re-check under a lens, the importing group's own lens is applied in its assessment. An accepted finding becomes read-only evidence in the importer's record, marked as another group's, and is never stronger than the edition it came from. If the source withdraws or revises, the acceptance is raised for re-evaluation.

<!-- END BIO_Investigation_v0_1.md -->

---

## Part 2 · Amendments to existing canon (approved with this text)

Approving `BIO_Investigation_v0_1.md` approves each of these. Old text is quoted exactly from the file on `tranche/T40`, with its line wraps joined.

### A. `BIO_System_Design.md` §1 (H36, Bob's wording)

Old:
> the objective is BETTER GOVERNMENT through greater understanding, less narrative, and accountability; all stakeholders are presumed to want better outcomes; bad actors are identified by EVIDENCE, never assumed by role; and *less narrative* binds us before it binds anyone else.

New:
> the objective is BETTER GOVERNMENT through greater understanding, increased accountability, and the separation of narrative from evidence; all stakeholders are presumed to want better outcomes; bad actors are identified by EVIDENCE, never assumed by role; less narrative allows the full realm of possibilities to be seen and considered.

### B. `BIO_Membership_Architecture_v2.md` §4 (D54), paragraph "And administrators do not touch project participation"

Old:
> Administrators do continue to SEE every project and every participant list, per 7.3 and 7.8.

New:
> Administrators do continue to SEE projects as 7.3 says: every discoverable project and its participant lists, and of a hidden project they were not added to, its existence, name and owners, with its contents only if its owners add them (D54, 2026-10-09).

### C. `BIO_Membership_Architecture_v2.md` §7.3 (D54)

Old:
> **7.3 Visibility.** A member sees only the projects they have been invited to, whether or not they have accepted. Administrators see all projects and all participant lists. Administrator sight survives the reversal in 7.7 deliberately: the custodial role can audit every project without being able to act in any of them.

New:
> **7.3 Visibility.** A member sees the projects they have been invited to, whether or not they have accepted, and the existence and name of a discoverable project (7.14). Administrators see every discoverable project and its participant lists. Of a hidden project, an administrator who has not been added sees only that it exists, its name and its owners, so that the custodial role can place a legal hold or act on a complaint; its contents and its other participants are seen only if its owners add that administrator (D54, 2026-10-09). Administrator sight survives the reversal in 7.7 deliberately: the custodial role can audit without being able to act in any project.

### D. `BIO_Membership_Architecture_v2.md` §7.9 (D54)

Under "Three positions, not two", old:
> Administrators see all projects and all participant lists.

New:
> Administrators see projects as 7.3 says: every discoverable project and its participant lists; of a hidden project they were not added to, its existence, name and owners only, and its contents only if its owners add them (D54). An act an administrator holds that must reach a hidden project without its contents (a legal hold, DEC-113; 7.13's rescue) reaches it at that level.

In the bullet "ONE resolution of a session to what it may SEE", old:
> (the founder's is the administrator viewer, so every project and every participant list, as this section says)

New:
> (the founder's is the administrator viewer, so what 7.3 gives administrators)

### E. `BIO_Membership_Architecture_v2.md` §7.14 (D54), under "Sight, now three levels, still ONE predicate"

Old:
> administrators and the founder are unchanged (they already see everything).

New:
> administrators and the founder see every discoverable project in full, and every hidden project they were not added to at EXISTENCE, with its owners (7.3, D54).

### F. D41's principle replaced: a question shows its non-hidden projects (H38, D64)

No canon document states the old principle ("a question never shows which projects draw on it"; `grep -rn "which projects draw" docs/architecture` finds nothing). It stood only in this draft's earlier text and in `build/plan/draft-T41-investigation.md`. Part 1 §2 states the new principle. The canon text it contradicts is Membership §7.14, which keeps a discoverable project out of every reverse edge. Two additions are made there.

In the bullet "**DISCOVERABLE adds ONE thing for the uninvited**", after the anchor sentence:
> Its contents stay private exactly as for a hidden project: not its references, not its Focuses, its Information or its Actions, not its participants or owners, not its lifecycle state, and not its presence in any derived reverse edge (the interest-graph rule above is unchanged).

add:
> **One exception, for questions (Bob, 2026-10-09, H38, D64; `BIO_Investigation_v0_1.md` §2).** A question shows the name of every discoverable project that draws on it. A step or a wait on a question names the discoverable project it was taken or set in, a shared-cost notice names the sharing projects, and a conflict between conclusions names the other project, when that project is discoverable. A hidden project is never shown, named or counted in any of these.

In "**Record reads do not widen.**", after the anchor sentence:
> `viewerPredicate` is NOT changed: a discoverable project stays out of every record read, search, citation list, reverse edge and run report of the uninvited, because those reads return CONTENTS.

add:
> The one exception is the question exception above.

### G. `BIO_Case_Making_v0_1.md` §4a (D56, D57)

Old:
> and nothing that drafts framing FOR a member — the same rule as never prefilling a justification, extended from a field to a whole argument.

New:
> and nothing that drafts framing FOR a member — the same rule as never prefilling a justification, extended from a field to a whole argument. **One exception, ruled by Bob on 2026-10-09 (D56; `BIO_Investigation_v0_1.md` §11):** the system may draft a case's written account from the evidence, in one or more framings, each labelled as the system's. The member writes the account, from a draft or from nothing, and it is published as hers. Before publication every sentence is checked against the evidence it cites: an unsupported sentence is tied to evidence or removed, a sentence the record contradicts is refused, and only framing that follows a printed bias statement may stay, marked in the text. An unsupported claim is never relabelled as bias: lying is not bias. **And a case carries no stories, context or human-interest accounts (D57).** The *story* above is the account the record supports; personal and human-interest stories belong in other publications.

### H. `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 9 (D56)

Old:
> no generated justification anywhere — a generated one is a fabricated attribution; the one permitted auto-composition is assembling the member's OWN prior words;

New:
> no generated justification anywhere — a generated one is a fabricated attribution; the permitted auto-compositions are assembling the member's OWN prior words and, by Bob's ruling of 2026-10-09 (D56), a draft of a case's written account composed from the evidence and labelled as the system's, which the member rewrites or keeps as her own and which is published only after every sentence passes the check against the evidence it cites (`BIO_Investigation_v0_1.md` §11; an unsupported claim is never relabelled as bias);

### I. `BIO_Action_v0_1.md` §3, the Determination row (D55)

Old:
> a member's judgment that a named government act is compliant, noncompliant or unclear against named standards, per standard, resting on published findings

New:
> a member's determination, resting on published findings, that a named government act is compliant, noncompliant or unclear against named standards, per standard

### J. `BIO_Content_Framework_v0_10.md` §2 invariant 7 (D66)

Old:
> and a finding that cuts against a goal is surfaced at least as prominently as one that supports it.

New:
> and a finding that cuts against a goal is surfaced as prominently as one that supports it.

### K. `BIO_Capability_Ladders_v0_1.md` §9.4, Stage 0, *Design* (project accounts; K2352, K2353)

Old:
> it serves only that member's asks, runs and standing questions, and there is no project account and the subscription token is each member's own by Bob's choice (K1547, K1755);

New:
> it serves only that member's asks, runs and standing questions; a project may hold an API key, or its sole member's own subscription while it has one member (K2353), and otherwise the subscription token is each member's own by Bob's choice (K1547, K1755);

In the same section's *Cost* paragraph, old:
> Runs (CHECK, investigate, plan) spend the account that serves the starting member (their own, or the group's API key, K1755) and are not yet costed.

New:
> Runs (CHECK, investigate, plan) spend the account that serves the starting member's act (the project's if it has one, else the member's own, else the group's API key; K1755, K2352) and are not yet costed.

### L. `BIO_Capability_Ladders_v0_1.md` §9.5, L4, *Ruled* (project accounts; K2352, K2353)

Old:
> a run is carried only by the account that serves the starting member's act, their own or, while it is on, the group's API key (K1755), within that member's use ceiling (K1450); there is no project account and the subscription token is each member's own by Bob's choice (K1547, K1755) on every plan;

New:
> a run is carried only by the account that serves the starting member's act: the project's account if it has one, else the member's own, else, while it is on, the group's API key, each within the limits its owner sets (K1755, K2352); a project's account is an API key, or its sole member's own subscription while it has one member (K2353), and otherwise the subscription token is each member's own by Bob's choice (K1547, K1755);

In the same rung's *Realism and performance*, old:
> on the account that serves that member (their own, or the group's API key while it is on, K1755) and within their use ceiling (K1450, K1502)

New:
> on the account that serves that member's act (the project's, else their own, else the group's API key while it is on; K1755, K2352) and within that account's limits

### M. K1481 amended by D39 (exploring): a ruling line for BOB to record in `build/rulings.md`

> - K____ · 2026-10-09 · K1481 amended (exploring), Bob's (D39, 2026-10-08; K2350; approved with `BIO_Investigation_v0_1.md`, K2417) · K1481's "every other AI run still starts at a member's act" gains a second exception: exploring that an account owner (the group, a project or a member) has enabled, set to Ask every day or Yes, run only within that account's overall and exploring limits, never on material under a "no AI" limit, its finds labelled as the system's and offered to the members working on the question, who alone decide what becomes evidence. D13 stays lifted for nothing else. Capability Ladders §2 and §10 already state this (K2350). · D39; K1481, K2350.

### N. `BIO_Declared_Bias_v0_1.md`: regrade is to be built (D59)

In "Differential traversal and the cross-group rerun", after the anchor sentence:
> Honest limit, named now: regrade re-grades conclusions against the analysis that exists; it cannot synthesize the analysis a different group would have written under a different lens.

add:
> **RULED 2026-10-09 by Bob (D59; K2417): regrade is to be BUILT, after steps and the question explorer.** When a bias statement is applied (more scrutiny on a source, an inference blocked), the leg or conclusion it touches records that statement, and the case file carries those records. The standalone checker takes a lens (as published, bias removed, or the reader's own) and reports for each finding whether it still meets the bar and which statements made the difference, stating on every report the honest limit above. An importing group's own lens is applied in its assessment of an imported case (`BIO_Investigation_v0_1.md` §11).

In **Incomplete sections**, old:
> - §Differential traversal and the cross-group rerun and §Sequencing — regrade and rerun are prose only; "Not a build order"; no op exists.

New:
> - §Differential traversal and the cross-group rerun and §Sequencing — regrade is ruled to be built (D59, 2026-10-09) and is not built; rerun is prose only; "Not a build order"; no op exists.

---

## Part 3 · Not placed, or in conflict with canon as read

1. **Membership still gives administrators full sight elsewhere (D54).** H40 lists §4, §7.3, §7.9 and §7.14 only. These passages conflict too: §7.8, "Administrators see all of them, and every entry in the administrator's roster lists the projects that member participates in." (it would list hidden projects' participants); §7's opening, "They see everything and direct nothing"; and §4's "the custodial role can audit everything and direct nothing". Proposed for §7.8: "Administrators see them as 7.3 says, and the administrator's roster lists, for each member, the projects that member participates in that the administrator can see in full." The two doctrine sentences are Bob's words, so they are left for BOB to word or to put to Bob.
2. **Amendment F is placed by me.** No canon states D41's principle, so I placed H38 as an exception in Membership §7.14. BOB should confirm the placement.
3. **The AI's grade for a found fact (D4) conflicts with AI Roles.** §2's EXTRACT row says a proposed reading is "graded by what it names and never A", and rule 3 grades machine work as machine work. The design (§5 of Part 1) keeps the document's capture grade for a verified quote. H23 named both texts, but H40 does not list them.
4. **K1481 is restated in canon without exploring.** AI Roles §7.3 point 7 ("Every AI run but a member-authored standing question starts at a member's act (K1481)") and Capability Ladders §9.5 L5 ("Every other AI run still starts only at a member's act") need M's exception. §10 and §2 already carry it.
5. **AI reading inside documents (D2, D21) conflicts with AI Roles rule 11.** Rule 11 says the assistant reads inside a file only as text the plane's readers extracted, while D21 has the AI transcribe pictures of pages. H24's loosening of `INVESTIGATIVE-SESSION.md` §14b.1 is not in H40's list either.
6. **Cost shown to members (D12) conflicts with Capability Ladders §9.4.** Its Cost paragraph says "members no per-answer cost (K1450)", but D12 shows the estimate and the actual cost to the paying account's owners.
7. **The breach gate.** The design says "Only conclusions that meet the bar can carry … a claim that a rule was broken". Action §4 rule 2 lets a member pass that gate openly with a stated reason. Part 1 cites Action §4 rule 2 and does not restate the gate.
8. **Inconsistencies inside the design.** The §1.5 chain diagram still says questions are "Shared across projects without showing which"; Part 1 follows §1.1 (H38). §1.12 also lists the authored statements twice, differently: with "its scope" and "the bias acknowledgement" in the refusal list, and with "for a correction, what changed" in the account paragraph. Part 1 cites Publication for which statements are required and applies the check to all of them.
9. **Recreated in part.** Whole-case acceptance (D62) takes "every finding that recreated". Publication §5C also allows accepting a finding that recreated in part, with its gaps stated. Whether whole-case acceptance includes those findings is not said.
10. **Member-facing names (D23)** are not ruled and are not in the design. Part 1 lists them as incomplete.
11. **Read as no conflict.** Step costs, milestones and status reports against Action §4 rule 8 ("no budgets": the action plan only) and Capability Ladders §10 ("no drift into … case management"). System Design §1's "tell a story" against D57: Case Making §4a's story/narrative distinction covers it, and amendment G says so.

