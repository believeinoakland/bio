# Investigation design lane: handoff to BOB

Numbered entries; BOB answers each in rulings (K) on `tranche/T<n>`. Decision states live in `DECISIONS.md`.

## H1 · 2026-10-07 · Bob's plan construct joined with the open decisions (page 1)

**Carries:** no ruling yet. Page 1 is rendered for Bob at https://claude.ai/artifact/EZoYvGdvkX2F6jNogG9vNP (source `page-1.html`). It folds in BOB #134's mapping (`build/plan/study-K2075-mapping.md` on `tranche/T36`), with its seven questions reviewed: kept as D25–D31, reshaped where Bob's K2075 words went further than the worker's options (D25 real subgoal teams with leaders, not a label; D29 stated figures with totals, not a free list; D30 system-drafted, leader-issued reports).

**Open with Bob, in unblocking order:** D25, D26, D27, D28, D23 (revised), D1, D17, D18 (stages 1–2); then D29, D30 (no AI); D31 with D12; the AI-stage decisions D2–D4, D6–D8, D12–D14, D16, D19–D22, D24 unchanged from K2064's page.

**For requirements when ruled (not yet):** the plan construct widens stage 2 (`enquiry`: subgoals, teams, leaders, assignment with accept/decline, step dependencies, deadlines, milestones, retire/delete, resources; `investigation`: issued status reports). Doctrine fences to carry regardless: DEC-68 (no measuring members), K1892 (no open/download record), DEC-69/DEC-94 (reminders only at the member's request; overdue once; no outside channel), D15 (never published), K1484 C2 row 2 (no role changes sight), Ladders §10 (group's own dates never findings), K1463 (group money unmarked in the world model).

**Owed to the UX stream (after rulings):** the plan's screens (subgoals and teams, assignment accept/decline, milestones, resources, report drafting), and the name that tells the investigation's plan from the action plan (D23).

## H2 · 2026-10-08 · Bob narrows K2075; the relationship study

**Carries:** Bob, 2026-10-08: "It was inaccurate of me to talk about members being assigned roles and for there to be subgoals within a project. As we look at filling in the capabilities of projects I think we should study the relationships between steps, basis, claims, findings, and any other elements." D25 and D26 withdrawn; D27–D31 paused until his wording of the plan settles. The study is `S1-relationships.md`, rendered at https://claude.ai/artifact/6cHHcybJpV3SPf25wVmeLN.

**For BOB to note (no ruling asked):** K2075's assignment and subgoal parts no longer stand as Bob's direction. The study finds no investigative step anywhere in canon or the built modules (the action plan's steps are post-finding); "basis" and "finding" each carry five or six senses across canon.

## H3 · 2026-10-08 · one working document; steps on questions

**Carries:** Bob asked for one document "that we can use to carry the research, questions, and design forward". It is `investigation-design.html`, rendered at https://claude.ai/artifact/QjSSFHE78G9PtwKhpW5ZEo; pages 1–3 now point to it. It holds Bob's direction in his words (K1627, K2075 as narrowed, D32, D33), the model, the open questions, the research and the register. From now on the lane updates that one page.

**Bob's direction, for BOB to note (no ruling asked yet):** D32 (a step is the work done in pursuit of an answer to a question; dead ends kept; steps also exist without a question; chance finds may be tied to a step afterwards) and D33 (members decide what becomes evidence; the system, including AI, may proactively explore a question, gauge its finds and offer them). This moves the plan from the project (synthesis `enquiry`) to the question, and D33's "proactively explore" meets K1481; open with Bob as D34–D36.

## H4 · 2026-10-08 · AI use across groups, projects and members (D34)

**Carries:** Bob's D34, in his words in `DECISIONS.md`: support the range of AI use across groups and members; projects may have their own account, limits and enabled AI capabilities; groups and members on their own accounts choose types of use, cost limits and enabled features, and track use; future releases may support other models. Read by this lane: a project's AI settings set by its owners (D37); D31 subsumed.

**For BOB to note:** this is a requirements change across `ai-runs` (R48–R52: a project level, money limits where the account reports cost, per-use enablement), `credentials`/`agent-model` (a project account; provider-neutral wording), `instance-setup`. Not ruled in full yet: D38 (precedence of group, project and member settings) and D39 (unasked exploration where enabled, revising K1481) are open with Bob.

## H5 · 2026-10-08 · D38 ruled

**Carries:** Bob, 2026-10-08: "D38: C". When group, project and member AI settings differ: the group and each project may set limits on what the AI may see of their material, and those bind everyone whoever pays; money limits bind only the account they belong to; each payer decides what its own spend is used for (examples on the working document). **Requirements must say:** two kinds of AI setting (material limits at group and project level, binding all accounts; money limits per account); a member's own account is never bound by the group's or project's money limits, always by their material limits.

## H6 · 2026-10-08 · D39 ruled

**Carries:** Bob, 2026-10-08 (words in `DECISIONS.md`): each account owner (group, project, member) can set an overall usage limit and limits on each type of usage; a limit on proactively exploring a question may be marked inclusive or exclusive of the overall limit. Read as option A: the system may explore unasked where an account owner enabled it, within its limit (revises K1481 for exploring; the standing question stays as it is). **Requirements must say:** per account owner, an overall limit and per-use limits, each per-use limit inclusive or exclusive; exploring enabled only with a limit; runs labelled with who enabled them; told once at a limit. Period and units are BOB's detail (money where the account reports cost, tokens and calls for a subscription, per D34's reading).

## H7 · 2026-10-08 · D39 settled: the exploring setting

**Carries:** Bob's words in `DECISIONS.md` (D39 entries of 2026-10-08). **Requirements must say:** per account owner (group, project, member), an exploring setting No / Ask every day / Yes; "No" means not paid from this account and does not inherit; "Ask every day" raises at most one queue item a day to the account's owner(s), only when something is worth exploring, silence meaning no; "Yes" runs within the overall limit and the exploring limit (inclusive or exclusive of the overall); a group administrator's "no AI at all" binds project and member levels, a group money setting binds only the group key (D38). **Owed to the UX stream:** one setting per account; an override only on an open project or question.

## H8 · 2026-10-08 · D36 ruled; D40 withdrawn

**Carries:** Bob, "D36: C": the system's finds on a question reach, once in the queue, the joined members of every project drawing on it; each member may unfollow or follow a question; nobody receives what she may not already see. D40 withdrawn: Bob confirmed project contents are seen only by participants, hidden or not (his ruling of 2026-09-18 stands). Still open: D35's reading (steps live with a question, the group's general understanding, or one project; a hidden project's steps stay inside it unless shared).

## H9 · 2026-10-08 · D41 ruled A; D27–D30 restated

**Carries:** Bob, "D41: A": a step on a shared question taken from inside a hidden project is on the question, seen wherever the question is, attributed by handle, naming no project; the member is told once at the act (this lane's detail, DEC-69; owed to the UX stream). The model of steps (D32–D36, D41) is complete; D27–D30 are now restated for Bob around it.

## H10 · 2026-10-08 · D41's principle against the built product (BOB's detail)

**Carries:** Bob's principle under D41: a shared question never shows which projects draw on it. Checked against the built requirements: (1) `inquiry` R39 refuses a shared set-aside when more than one project draws on the question (counted over every project, hidden ones included), so the refusal itself tells a member another project uses the question. This lane's proposal for BOB (detail, not Bob's): always take a set-aside per project (`queue` op=proposedispose project arm), so no refusal hints. (2) `contradiction` K5 (R8, R10, R50–R52): already within Bob's 2026-09-29 contradiction rulings; a notice says only that something conflicts with a record the member cannot see, and projects are named only by mutual opt-in. Explained to Bob; no question for him.
**Bob, 2026-10-08:** "When a question is deferred, it's deferred for that project. But that won't result in it being deferred in another project. Same with dismissed." So deferral and dismissal are always a project's own act on its own relationship to the question; the requirement should say so directly, with no shared set-aside and no refusal that depends on other projects.

## H11 · 2026-10-08 · the working document restructured

**Carries:** at Bob's request, `investigation-design.html` now leads with the design as one whole (rulings D32–D41 folded in), a Grandview walk-through, then only the open questions (D27–D30), the AI-stage decisions to come, research, Bob's words and the register. This lane's own details, marked in the document and changeable: step dependencies and "by when" (notification rules); a find shows which account paid only to that account's owners, so it never reveals which project asked; a project's "no AI" covers what is its own (project steps, notes, interview, and any question or document only it draws on), shared material following the group's setting. D7 is read as mostly answered and D12 as partly answered by D34/D39.

## H12 · 2026-10-08 · D42 and D43: two audiences; actions later

**Carries:** D42 (Bob: the investigation design must serve both the assistant-enabled member with any complaint and a highly efficient non-assistant workflow, "Both audiences must be optimally served"); D43 (Bob: Civicsmith should support members throughout the action plan; "Not today, but ... we need to research explore, and design the requirements, capabilities, use cases, and UX of actions"). For BOB: D43 is a future design effort like this lane, BOB's to schedule; it builds on `BIO_Action_v0_1.md` and the earlier Actions session's rulings.

## H13 · 2026-10-09 · the step model complete: D27–D30, D44, D45

**Carries (Bob's words in `DECISIONS.md`):** D27 A (milestones belong to a project); D28 A (an untouched step can be deleted; a worked step keeps its record); D29 (a step may carry a money cost; a costed step shared by projects none of which is hidden: owners told the total and the count, messages relayed, they settle payment themselves, Civicsmith splits nothing); D30 B (member-written reports, system-drafted, kept with the project, never published); D44 no (no nested steps); D45 (steps searchable so work is shared, not duplicated; a step is a record associated with the questions that refer to it, keeping no purpose or method of its own). With D32–D41 the model of steps, questions and AI use is complete for requirements; the working document §2 states it whole.

## H14 · 2026-10-09 · INVESTIGATION-DESIGN #2 takes over; BOB's six questions put to Bob

**Carries:** #2 took over from #1 (RESUME.md). Bob approved the D42 study (both audiences; messy first messages traced through by-hand and assistant paths): "A". BOB #145's K2401 questions are in the working document §5 as **D46** (Q1 system hunches), **D47** (Q2 shared step outcome), **D48** (Q3 milestone met), **D49** (Q4 cost message names), **D50** (Q5 why a document is held), **D51** (§2.1 the three modules), each with background, example, options and BOB's recommendation, which this lane concurs with. The explorer's gating on D13/D14 is stated to Bob as fact; this lane will put D13 and D14 to him with the study, whose neighbour-dispute message is their natural context. Answers come back here as they arrive.

**On canon:** this lane would rather BOB draft the step construct as canon (from `investigation-design.html` §2 and the answers), with this lane reviewing it against Bob's words before it goes to him.

## H15 · 2026-10-09 · D46–D51 ruled (answers to BOB's K2401)

**Carries:** Bob, 2026-10-09: "D46: A, D47: B, D48: as recommended, D49: A, D50: as recommended, D51: A". So, as your draft recommends: Q1 A (`hypotheses` R16–R18: the system's apart, shown on the question to all who see it and with finds; taking up makes it the member's, noting its origin); Q2 B (`steps` R5: the step ends once, each referring question records helped or dead end, the machine never records either); Q3 as recommended (`investigation` R2: this project's conclusion, step ended with any outcome; deferred, dismissed or set aside not done, item removable with record); Q4 A (`steps` R15: writer's handle, no project unless written); Q5 as recommended (provenance only; `holdings` leaves D1); §2.1 A (the three modules approved as placed). Exploring stays unoffered until D13/D14; this lane brings them to Bob with the D42 study.

## H16 · 2026-10-09 · the D42 study; D52, D53, D13, D14 put to Bob

**Carries:** the study is in the working document §5 (sections renumbered: open questions now §6). Findings for BOB, needs not rulings: the by-hand path's front doors are empty (`wizard-scripts` FRONT_DOORS []) and no runner exists; no question-similarity search at the door; no member upload of a file she holds, no email capture; most built ops have no screen; no keyboard shortcuts or command bar; the assistant creates nothing itself (correct) and is nearly all switched off. Put to Bob: D52 (where a first message leads; rec B, six places), D53 (a member's own matter; rec A, her hidden project), D13 restated after B8 (rec B), D14 restated (rec C). Answers follow in H17.

## H17 · 2026-10-09 · review of `build/plan/draft-canon-investigation.md` (tranche/T40 @ 4e1dba97e6)

**Verdict:** faithful to Bob's words throughout; quotations checked against DECISIONS.md. Corrections, as exact replacements:
1. Incomplete sections, §7 line. Replace "§7 — the study of both audiences (D42) is under way in the lane; its findings, and the intake interview (D19), are not yet here." with "§7 — the study of both audiences (D42) is done (the lane's working document §5); its questions D52 and D53 are with Bob, and the intake interview (D19) is not yet here."
2. §3, after "a records request a step needs is started as an action." add: "and what comes back to it (a production, a refusal, silence) is the step's product."
3. §8, D13 line. Replace with "**D13** — the private-person fence, restated after Bob's B8 (tracking people essential): put to Bob 2026-10-09, the lane recommending people through their part in a public matter, never a private life as subject, warned at the act, the system never exploring a person on its own. The explorer's fence; exploring waits on it." D14 line: append "put to Bob 2026-10-09: Civicsmith's set gates release, a group may add its own (recommended)."
4. §8, add: "**D52** — where a first message leads (six places, recommended). **D53** — a member's own matter with a public body (helped in her hidden project, recommended). **D54** — administrators' sight of hidden projects."
5. §8, the Membership §7.3/§7.9 bullet: replace with "Administrators' sight of hidden projects: Membership §7.3/§7.9 and the built FULL sight give administrators contents; Bob's words of 2026-10-08 read otherwise; put to him as D54. §2 follows the answer."
6. §8, the Ladders §10 bullet: replace "who has not confirmed it in words (D27 and D30 were ruled without it)" with "and whose rulings D27 and D30, made on the page that offered it, settle it for this construct".

**Your five points:** (1) agree, stale; fold it. (2) a real question of policy, not detail: put to Bob as D54 (rec B, existence, name and owners, contents only if added). (3) agree, see correction 6. (4) agree: no payment tied to a step in T41; no question for Bob now. (5) agree, D23's.
**Details you listed:** all stand as written, with correction 2 to the outward-step line.
**Who puts it to Bob:** this lane, in his working document, once D52, D53, D13, D14 and D54 are answered and folded into the draft (§2, §7, §8), so he approves one complete text. Please fold the corrections above and the answers as they arrive; I will render the text as a section of his document and ask for approval.

## H18 · 2026-10-09 · D52, D53, D13, D14 ruled

**Carries:** Bob: "D52: B, D53: A, D13: B, D14: C". So: (D52) the door leads to one of six places: a new project; an existing question or project; a lead, optionally watched; a step for understanding; an action; "not Civicsmith's", with a pointer. The member decides; a lead may become a project later. (D53) a member's own matter with a public body is helped, in a hidden project of hers; nothing about the private person concerned is published; a public pattern may become a group question carrying none of her private material unless she chooses. (D13) people through their part in a public matter; no investigation has a private person's private life as its subject; a warning at the act when an objective or question names a person in no public role, the member deciding; the system never explores a person on its own and gathers about a person only when a member tied them to the question, up to a per-run cap (the cap is BOB's detail); publication rules unchanged. (D14) Civicsmith's test investigations (frozen real matters, answers written by people) gate every AI part's release; a group may add its own, measured and shown to that group; transcripts for grading only, never published. With D13 and D14 ruled, exploring is offered once the explorer passes its test bar (D11). **Requirements:** a front-door module or screen work (the UX stream's for screens) with D52's six routes; D53 needs no new construct (a hidden project); D13's warning at objective/question creation and `question-explorer`'s person rule; D14's harness and gate. **For the canon draft:** fold these into §2, §4, §7, §8; D54 remains open.

## H19 · 2026-10-09 · D54 ruled: administrators' sight of hidden projects

**Carries:** Bob, "D54: B". Administrators see that a hidden project exists, its name and its owners (so they can place a legal hold or act on a complaint); they see its contents only if its owners add them. **This changes built behaviour and canon:** Membership §7.3/§7.9 (administrators at FULL sight of every project) and `membership`'s sight levels (`Store#sight`, `viewerPredicate`, the `project_sight` index): an administrator not invited or joined is at EXISTENCE for a hidden project (existence, name, owners), not FULL; administrator acts that must reach a hidden project without its contents (a legal hold, DEC-113) stay reachable at that level. Membership canon needs the amendment with Bob's words. **For the canon draft:** fold into §2 "Who sees a project" and drop the §8 bullet. All questions are now answered; send me the folded draft and I will put it to Bob for approval in his working document.

## H20 · 2026-10-09 · canon draft @ 65a02aecd4 checked; put to Bob

**Carries:** §9 checked against D54: faithful (existence, name and owners; contents only if added; discoverable unchanged; hold-type acts reach at existence). One wording fix taken in the rendering: §8, "and offered the reading to Bob, and whose rulings" → "and offered the reading to Bob, whose rulings". The whole text is rendered in Bob's working document §6 for approval; his answer will be H21.

## H21 · 2026-10-09 · the remaining study decisions taken up now (Bob's direction)

**Carries:** Bob: "Why are we waiting on these issues rather than taking them on now???" This lane is taking up D2–D24's remainder now, in three batches. Batch 1 is with Bob: D3, D4, D12, D2, chosen because `question-explorer` (T41) needs them: finds accepted, a find's grade when drawn as a leg, the Ask item's rough cost, reading inside held documents. The canon approval is with him too. Batch 2: D19, D20, D24, D7(c). Batch 3: D8, D21, D22, D17, D18, D16.

## H22 · 2026-10-09 · canon approval withdrawn from Bob's document (K2410)

**Carries:** per K2410 (Bob: "I'm also hesitant to start building what might change significantly"), the canon approval is removed from the working document; the lane works through the remaining open decisions (batch 1 D3, D4, D12, D2 with Bob now; batches 2 and 3 to follow; D1 restated last), then presents the whole design for Bob's review. Rulings keep arriving here for BOB's drafts.

## H23 · 2026-10-09 · D3 and D4 ruled

**Carries:** D3 A: one accepting act for every investigation proposal (as proposed / edited / my own instead, recorded), any joined member of a drawing project may act, vouching statements re-authored, acceptance measured group-wide only. D4 A in Bob's words ("why would there be any reason for the evidence grade to fall?"): a verified-quote fact keeps the document's grade; numbers and dates read by code and checked by the member; meaning by the member's acceptance; AI-read image text stays undetermined until measured (D21). **Requirements must change:** `extraction` R43 (no B cap on verified-quote proposals); canon `BIO_Assistant_and_AI_Roles_v0_1.md` §2 EXTRACT "never A" and rule 3's machine-work grade wording, for verified quotes. D12 and D2 still with Bob.

## H24 · 2026-10-09 · D12 and D2 ruled; batch 2 put to Bob

**Carries:** D12 A: estimate before (a range or "not known yet") and actual after, to the paying account's owners only; runs and tokens on a subscription; F11's "never shown" retired. D2 A, widened by Bob: bounded reading of held documents, never under a D38 "no AI" (the bound is BOB's), and while reading the AI proposes citable content (figures, policies, decisions, statements bearing on the investigation) and connections, each quote-bound, labelled, accepted by D3's act and graded per D4. That is EXTRACT's productions inside a reading: `extraction`, `run-productions` R10–R12 and the `extract` mode's deployment are in scope of the requirements, and IS §14b.1 is loosened for spans. With Bob now, batch 2: D19 (rec B), D20 (rec A), D24 (rec B), D7 restated (rec A; (a)/(b) superseded by D50 and D2).

## H25 · 2026-10-09 · D19 and D20 ruled; narrative and evidence

**Carries:** D19 B: the same intake questions on both paths, a one-page form by hand, a conversation with the assistant (skips what was said, follows up), the member checks the answers before they are kept. D20 A, with Bob's direction on narrative and evidence (words in DECISIONS.md): answers show baselines side by side, each naming what it rests on and the measured difference, with no verdict, likelihood or rating words in Civicsmith's voice and "cause not established" unless member-authored. Members' interview answers and stories are narrative, never evidence. A claim in them about a public body's words or acts becomes a step to find the record, and is shown "as recalled" until it is found. A member who was present may record a firsthand account (built `testify`, weaker grade, labelled). **Requirements must say:** the interview's answers are stored as the member's narrative, not as evidence or as a body's statement; the assistant proposes "find the record" steps from narrative claims; an answer's baseline carries its basis kind. D24 and D7 still with Bob.

## H26 · 2026-10-09 · D24, D7 ruled; batch 3 put to Bob

**Carries:** D24 B: Bob approves plain-language AI rules in the design; skill instructions may only quote them (`skills` R21 holds it); the lane will list those rules in the whole-design review. D7 A: one act may start several AI steps under one D12 estimate, each a bounded run within limits, one stopping at a limit without stopping the others. With Bob: batch 3, D8, D21, D22, D17, D18, D16 (each rec A; DECISIONS.md has the restatements). Then D1 restated, then the whole design for Bob's review.

## H27 · 2026-10-09 · batch 3 ruled; the objective as the measure; D1 restated to Bob

**Carries:** D8 A plus cross-group sharing; D21, D22, D17, D18 A; D16 A with Bob's direction that whether the objective is met is the measure throughout (words and reading in DECISIONS.md). **Requirements must say:** an objective-met judgement by members with a reason (on `intent`'s objective, append-only like a conclusion), shown on the project page with the questions it rests on and the gaps; the quiet-project prompt asks once whether the objective is met (met / watch / close / revise); question-level waits seen wherever the question is (no project named); a note shared to a project and withdrawable, with the D13 warning; AI transcription of image pages labelled undetermined, a member's check lifting it to the document's grade; the quote-bound note (never content, never cited); the reading-guide library with group review and cross-group offer and adoption. With Bob: D1 restated (rec A: one new module, the reading-guide library; planning as a new AI job within existing AI modules). Then the whole design goes to Bob for review.

## H28 · 2026-10-09 · correction to H27: the objective is met by the evidence, never by say-so

**Carries:** Bob: "The determination of whether the objective is met is based on the rigorous assessment of the evidence. That's canon." H27's "an objective-met judgement by members with a reason" is withdrawn. **Requirements must say instead:** objective met = the condition satisfied as `intent` R3–R6 compute it, already built; no member act declares it; the quiet-project prompt shows `progress` and `gaps` once and offers watch, close (gaps recorded as what remains unknown) or revise the objective/condition with a reason; an objective with no condition reads "cannot be computed". Nothing new to build for "met" itself.

## H29 · 2026-10-09 · D1 approved; every open decision answered

**Carries:** Bob, "D1: approved": the modules are `steps`, `question-explorer`, `investigation` (D51) and one more, the reading-guide library (D8, with group review and cross-group sharing; placement and name BOB's). Planning (the assistant interview D19, words → proposed questions and steps, narrative claims → "find the record" steps) is a new AI job, the study's `enquire`, inside existing AI modules with its own D14 bar. Everything else extends existing modules. No decision is open. Before the whole-design review, the lane is auditing the working document against canon on purpose and evidence (Bob asked after the H28 correction); findings go to Bob first, then the review.

## H30 · 2026-10-09 · canon audit of the design; sixteen corrections; D55

**Carries:** the corrections listed in DECISIONS.md (canon audit). **For BOB's requirements and canon drafts, the ones that change substance:** (1) `investigation`/`intent`: an objective's condition names what the record must hold for a determination (including "a records request answered that none exists"), not the hoped-for outcome; nothing new to build if `intent` conditions already express it, else note it. (2) Nowhere may the bar gate drawing a leg or concluding; it gates publication (`case-authoring`) and breach actions (Action §4 rule 2), as built. (3) The craft/write-up: no system-drafted case account; the system lays out the record (D30 reports are unaffected, being unpublished factual digests). (4) D20's "cause not established" lifts only on a concluded finding establishing the cause, not on a member writing one. (5) `question-explorer`: capture only through addresses the record holds (AI Roles rule 12); pages found elsewhere are named to members. (6) System hunches (D46) are K1473 signals with method and false-alarm rate. (7) D39 recorded as amending K1481 for exploring. With Bob: D55 (Action §3 wording, rec A). Then the whole-design review.

## H31 · 2026-10-09 · D55 ruled; three elements and the drafted account in preparation

**Carries:** D55 A: Action §3 canon wording "a member's determination, resting on published findings, that…" (a canon edit for BOB with the next canon fold). Bob named three elements the design lacks (bias as the only narrative in a case, documented, re-checkable by readers; approval for publication and publishing; another group assessing and importing a case as read-only evidence) and directed that the system may draft the case's written account from the evidence and must check the member's account for unsupported narrative (his words in DECISIONS.md). That reverses the audit's correction 5 and meets Case Making §4a and AI Roles rule 9. The lane is researching canon on all four and will put them to Bob together.
