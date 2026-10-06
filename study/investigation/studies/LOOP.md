# A-LOOP · Capability: the member in the loop

Unit A-LOOP, phase 2 (`PROTOCOL.md` §A). Scope: the interview at intake; how proposals reach members (plan steps, facts read from documents, explanations, next acts); acceptance, correction and rejection; several members in one investigation, including disagreement (K1618); notification doctrine (no nagging); how a member follows progress over weeks; and the answer (what the record shows, how solid, what is unknown, what action follows).

Sources are the phase-0/1/1b notes and research, cited as `notes/<id> §n` or `research/<id> §n`, and through them the product. Two rulings were read directly in `build/rulings.md`: K1618 (line 1620) and K1627 (line 1629); K1364, K1450, K1473, K1479, K1481, K1491 and K1500 were checked there by grep. Status words follow PROTOCOL rule 3. Work the notes report as merged on `tranche/T33` is called **built (T33)**. It is not yet on `main`.

**The capability in one sentence.** Bob's rule, "the machine proposes and a member accepts" (`RESUME.md`), has to hold at every step of an investigation that runs for weeks and may involve several members. It must also hold without nagging, without the machine ever concluding, and while staying usable "to one person with a few hours a week" (DR2, `notes/C1` §1.2).

## 1 · The need

The problem set (`notes/P0`) shows seven things a member needs from the loop. Each comes with the scenarios that show it.

| # | need | what the scenarios show | shown by |
|---|---|---|---|
| N1 | **A short interview that changes the plan** | Before any digging, an investigator asks a few questions, and every answer changes what is sought. For Grandview: which district, and is it a rebuild or a modernisation? Who made the "one school year" promise, and in what form? Where are the children now? How is the work paid for? What can be seen on site? What has the district already said? (`notes/P0` §S1, six questions). Across scenarios the decisive questions are "where does the promise or rule come from?" and "which agency?" (`notes/P0` §2, intake row). The S7 utility question decides the venue (CPUC or a city), and S12 decides the access regime. | all; sharpest S1, S7, S8, S12 |
| N2 | **Proposals the member can judge quickly** | The machine will propose many kinds of thing: objectives and sub-questions, documents to seek, records requests to send, facts read from a contract or a change-order log, explanations of a slip, red flags, and next acts. A parent cannot vet a 180-page document. Each proposal must be checkable in seconds against its source (`notes/P0` §2 "member involvement"; obs. 7). | S1, S2, S3, S11 |
| N3 | **Accept, correct, reject, and be remembered** | Some proposals are wrong in part (the right clause, the wrong date). Some are wrong in kind (an explanation the member knows to be false). Some are premature. The member's choice and reason must stick, so the machine does not re-propose what was declined unless something new arrives (`notes/P0` §1 S1 "how it iterates"). | S1, S5, S10 |
| N4 | **Several members, one file** | A group works one file. Parents, PTA members and tenants split the work, and they disagree about what matters (`notes/P0` §2 "several members in one group work the same file"; §0 DR2/DR3). K1618's case is typical: one member sets aside a document that another member's question needs. | S1, S5, S9, S12 |
| N5 | **No nagging over a long wait** | "Most of an investigation's life is waiting" (`notes/P0` §2 obs. 5): records-request clocks (CPRA's 10 days plus 14), rolling production, monthly reports, board agendas. Some deadlines bind the member, such as the Brown Act cure window in S14. The member must learn of real changes once, and never be chased. | S2, S4, S11, S14 |
| N6 | **Picking it up again weeks later** | A parent returns after three weeks. What arrived? What moved? What is waiting, and on whom? What is the machine proposing? "Iteration is driven by arrivals" (`notes/P0` §2 obs. 5). Spans run from days (S10) to years (S2, S11) (obs. 6). | all |
| N7 | **An answer that is honest about its limits** | "The answer is never one sentence." It is a chronology, a promised-against-actual comparison, causes with grades, what is unknown and which record would settle it, and then an action ladder and monitors (`notes/P0` §2 "answer and action"; §S1 "what an answer looks like"). It must show the district's own explanation as one hypothesis among several, never as the default (`notes/P0` §2 "competing explanations"). | all |

Two more facts shape all seven needs. First, **the member is a co-investigator, not only an approver**. A member's site visits, complaint logs, court-watching and meeting attendance are evidence (`notes/P0` obs. 7; S1, S5, S9, S12), so the loop carries what members bring in as well as what the machine proposes. Second, **the typical member is a parent with a grievance and no method** (`notes/P0` §0). The loop must teach by doing, without assuming a vocabulary of legs, grades or hypotheses.

## 2 · Best practice that applies

**Intake.**
- Practitioners ask clarifying questions before acting. Gemini Deep Research returns a research plan the user edits and approves before it runs, because "when asking an intern to do research, they would naturally ask clarifying questions first" (`research/B4` §1.1, §4 L1).
- Story-Based Inquiry turns a subject into a testable story of at most three sentences. It breaks the story into terms and the terms into questions, and it treats "the official promise" as the first hypothesis (`research/B1` §1.1).
- An intake ends in a recorded decision: investigate, refer, or take no further action. "Regardless of the result … decisions should be recorded" (AFP and CIGIE QSI, `research/B2` §1.1, §1.4, §4 L11).
- The IACRC investigator's first step is to "debrief the complainant fully" (`research/B5` §1.5c).
- B5's compressed version of Bob's case begins with three intake questions: which district and school, where "one school year" came from, and which delivery method (`research/B5` §4, "Bob's case").

**Proposals and acceptance.**
- Acceptance works only if checking is cheap. Explanations reduce over-reliance only when they lower the reviewer's cost of verifying (Vasconcelos et al., `research/B4` §1.4). Every proposed fact should therefore carry its exact quote and location, and acceptance should be per fact, not per report (`research/B4` §4 L14, L16).
- Automation bias is the named risk (NIST AI 600-1, `research/B4` §1.4).
- Model self-confidence is not calibrated. Practice routes weak items to people and samples some strong ones too (Amazon A2I, Azure; `research/B4` §1.4, L15).
- In technology-assisted review, humans set the scope, the machine ranks and proposes, humans code, and the exclusions are recorded. Context-dependent calls stay with humans (`research/B2` §1.2, L13).

**Decisions as a log.**
- The police Policy File and the Canadian Decision Log record "what was known? when was it known?", the decision, who made it, and why, "including why a line was *not* followed". B2 states the mapping directly: "the member's accept or reject of a machine proposal is such a decision" (`research/B2` §1.1, L9; `research/B3` L11).

**Guarding the tipping points.**
- Investigators close their minds at two moments: when they choose the main lines of enquiry and when they name a responsible party. At both, a contrarian pass (a Key Assumptions Check or devil's advocacy) should come before acceptance (College of Policing REA; CIA Primer; `research/B3` §1.7, L13).
- "You, not the matrix, must make the decision" (Heuer). ACH alone does not improve accuracy. Combining independent judgments does (Mandel et al., `research/B3` L5).

**Several investigators.**
- CaseMap keeps a separate evaluation per author, and an "Evaluation Comparison" shows where team members' judgments diverge (`research/B2` §1.3).
- In Canadian major-case management, one person may hold several roles in a small case, "but the principles are still maintained" (`research/B2` L17).
- Citizen investigators are the most exposed to bias, because they work alone, are invested in the outcome and have no review. Second opinions and a return to the evidence after time has passed are the remedies (`research/B1` §1.3).

**Keeping the complainant informed.**
- Police practice gives victims an expected finish date and progress updates every 28 days (College APP §8.4, `research/B2` L16).
- Bellingcat's "logging off" step means the next session "can pick back up where you left off" (`research/B1` §1.2).
- Anthropic's long-running harness keeps a progress file and a list of objectives, each "failing until verified" and never deleted (`research/B4` §1.2, L2).
- Investigations without a live line enter **Investigative Maintenance** and reopen when new material arrives (`research/B2` §1.1).

**The answer.**
- **Criteria, condition, cause, effect** is the standard shape of a finding. Only the elements the question needs are developed (Yellow Book, `research/B2` §1.4, L8).
- Practitioners use calibrated words, not numeric confidence (Bellingcat). Likelihood and confidence are kept apart (ICD 203). "Acknowledge what you do not know" (SBI) (`research/B1` L9; `research/B3` §1.5, L15).
- A finished answer reports all the hypotheses, not just the leading one (Heuer step 7).
- Reports carry the responsible officials' views and the exculpatory material (Yellow Book §9.50; QSI; `research/B2` L15). SBI treats the right of reply as part of the method (`research/B1` L15).
- Promise trackers use "In the Works" and "Stalled" as interim states (PolitiFact, `research/B1` §1.6).
- CoST's form is "observation plus factual comment … facts, not opinions" (`research/B5` L13).
- A good answer ends with a "closer" and "Further Action" that say who must act (`research/B1` L19).
- For public works, fix the baselines before measuring the slip: the public promise, the approved schedule, the contract time and the baseline schedule. Then name which promise is at issue (`research/B5` L6).

**Members as contributors.**
- City Bureau's Documenters record decisions and "the questions they had" on a structured form. Crowd contributors need structure, a verification threshold set in advance, and a closed feedback loop (`research/B1` §1.6, L18).

## 3 · What the substrate already provides

The loop is the most built part of the product's doctrine. Almost every "propose → member act" seam already exists somewhere, but scattered across modules. The tables below go element by element: what exists, its status, and how an engine would use it as it is.

### 3.1 The interview at intake

| element | what exists | status | use as is |
|---|---|---|---|
| A front door | The group's home asks "What brought you here?", and every empty project offers "Start from…". The "Your first question" wizard runs: what drew you in → say it as a question (the assistant may suggest some) → find a document → point at the passage → supports or cuts against → strength against the bar (`notes/D2` §1.4, §2) | **specified** (UX journeys, draft and paused) | The natural home of the interview |
| Wizard scripts | Authored step lists walked on the real screens. A script "never says or submits anything for a member". A labelled draft in a field becomes the member's only when the member keeps it (DEC-120, K1364). Scripts run with no AI and no key. With a key, "the assistant may also plan a flow on the fly" (`notes/M2` §3.14; `notes/D1` DEC-120, DEC-121) | server half **built** (T31); Civicsmith library empty; screens absent | An interview script that works without AI; an AI-planned interview as a flow made on the fly |
| One clarifying question | The answer contract holds `question_as_read` and `clarifying`, which is null or exactly one question (`answers` R3; `skills` R34; ASSISTANT-PILOT §2 "at most one clarifying question") (`notes/M1` §1.10; `notes/D2` §1.6 Q10) | **built (T33)**; `ask` mode undeployed | One question per ask, which is too few for intake (§4 G1) |
| Asks keep nothing | An ask writes only counts. The transcript stays on the device (K1450; `answers` R14) (`notes/M1` §1.10) | built (T33) | The interview cannot live in an ask |
| Ask, don't assert | The assistant "structures only what was SAID, and asks rather than asserts when it thinks something further is implied". It "may propose project defaults from a self-identification but never set them silently" (DEC-27, `notes/C2` §1.2) | doctrine | The rule for what an interview may infer |
| Where the answers land | `intent` R1: every project states an objective. `inquiry` opens a question at `open` or `surfaced`. `provenance.testify` holds a member's firsthand observation as evidence at grade D (`notes/M3` §2.16). `observation-log` `lead` holds "something a member was told … somewhere to look and never evidence" (`notes/M2` §3.12). `hypotheses.hold` holds the member's own hunch, member only (`notes/M1` §1.4). `standards` kind `commitment` holds the promise once its text is captured (`notes/M4` §1.13) | **built** | Each answer becomes an authored object. Nothing depends on a transcript (DEC-61, DEC-113; `notes/C6` §2 row 21) |
| Who creates the home | A machine-created project is ownerless and hidden. Only an owner can invite, set visibility or adopt a lens (`notes/C4` §4 item 3) | **built** | The member creates the project. The interview proposes into it |
| Elicitation style | "ASK ONE CONSEQUENCE QUESTION PER LEG … never show AND / OR" (DEC-32, `notes/D1`) | doctrine | Interview questions are plain consequences, never structure |

### 3.2 How proposals reach the member

| proposal kind | where it is stored and how the member acts | status |
|---|---|---|
| Questions surfaced by the machine | `intent` discovery loop: the machine may only `question`, which opens an inquiry at `surfaced`. A member adopts, opens a question, defers or dismisses, each with a reason. Unacted machine questions are deferred after 30 days (`ageSurfaced`) (`notes/M1` §1.11) | built |
| Objective gaps | `intent.gaps` → `objective-gap` queue FINDINGs (`notes/M1` §1.11, §1.18) | built (conditions only over progressions) |
| Alternative accounts of a claim's support | A run's `op=suggest` appends a `suggested` basis version. Six member-only acts move it: accept, reject, consider, revert, make current, hide (`MACHINE_CANNOT_MOVE_VERSION`) (`notes/M1` §1.8; `notes/M2` §3.3) | built; only `check` deployed |
| Readings of a document | `extractPropose`: proposed readings, labelled machine work, graded at most B, "never offered". A passage becomes part of a finding only when a member cites it (`content` R16) (`notes/M3` §2.12, §2.14) | built; `extract` mode undeployed |
| Duties, standards, money-set inclusions, themes | `duties.propose` → member `adopt` naming the clause. `standardPropose` → `standardAdopt`. `money.proposeInclusion` → `include`. Theme hunch → `themeplace` (`notes/M4` §1.3, §1.6, §1.8, §1.13) | built (T33) |
| Events, lines, money facts | No proposal path. A machine may write them only with source identifiers at both ends. Otherwise only a member's direct act counts (`notes/M4` §5 item 1) | **absent** |
| Action-plan options | `optionPropose` from a `plan`-mode run. Shown in a tray five at a time, in "the assistant's order of strength", with a fixed disclosure sentence. `optionAdopt` is a member act. No score (`notes/M4` §1.18) | specified; mode undeployed |
| Contradictions | Deterministic pairs and a run's labels go into append-only candidates. `recommend` names only which respects may differ. Member acts: dismiss, clarify, take up, resolve. The record keeps "accepted a recommendation vs unaided", and **`acceptanceRates`** trigger a review at ≥95% acceptance over ≥30 (`notes/M1` §1.5) | built |
| Machine signals | Interest checks and money detectors go to the queue as "Noticed", in the hypothesis layer, shown only after a false-alarm test (≤20%) (K1473, K1491; `notes/M4` §1.2, §1.9) | built (T33); none yet shown |
| Captures requested by the assistant | They land at `collected`. The grade note goes on the completed capture and its queue item (DEC-95 (1)). The held-captures list allows batch release, set-aside with a reason, or linking to a question, and nothing is notified (DEC-97; `capture` R77–R82) (`notes/M3` §2.2; `notes/D1`) | built |
| Leads for another question | `out-of-inquiry-lead`, homed under that question, from an explicit `lead_inquiry` and "never inferred" (`notes/M1` §1.18) | built |

**The common shape** is the PROPOSAL construct: "adopt / defer with a recorded reason / dismiss with a recorded reason. Nothing is adopted automatically and nothing disappears silently". A proposal must "LOOK derived" (D-82, D-90), ages rather than vanishes (D-79), and aggregates: "one check across 58 contracts is ONE proposal with 58 instances" (`notes/C2` §1.2, §2 D12–D13, D35). DEC-95's six guards make up the template for every engine suggestion: it appears where the member works, never as a notification; it is labelled with its reason; a dismissal is remembered; it never interrupts a heavy act; a member may switch it off; and its acceptance rate is measured (`notes/D1` DEC-95). DEC-77 adds the act **ACCEPTING A PROPOSAL**. A judgement is "RECOMMENDED with its reason … accepted in one act; the record keeps whether the member chose unaided or accepted a recommendation". This act is "introduced for contradictions first" (`notes/D1` DEC-77).

**Where the member meets them.** The one queue has three classes: To do (obligations), Noticed (findings nobody has judged) and Signal (conditions). It is grouped by case and re-sortable, and it holds "one live item per (member, case)" (DEC-10, DEC-110; `queue` R1–R16, R48) (`notes/M1` §1.17). There is also the assistant panel, docked beside the work, with one "machine work" treatment and the attribution "the assistant did this, at <member>'s request" (DEC-90, DEC-125; `notes/D1`). Rungs and friction come from `affordances`: proposal acts are reversible, and `workobjective` is reasoned, "with the run's budget and scope shown beside it" (DEC-87, DEC-88; `notes/M2` §3.15).

### 3.3 Acceptance, correction, rejection

| act | substrate | status |
|---|---|---|
| Accept | The owner module's adopt act (`versionaccept`, `standardAdopt`, `duties.adopt`, `optionAdopt`, `include`, `connectionchoose`, cite a minted passage). "If the user approves it, then it's approved" (DEC-68). The approval is the act, and nothing logs what the member read beforehand | built per owner |
| Accept in bulk | "ENABLED to act singly or in bulk and is FORCED into neither"; "nothing pre-ticked" (DEC-69, DEC-97). Crucial or contested documents are not batchable. Selections are server-side sets, and a moved set is refused (`retrieval` R18–R22) | built |
| Correct | A labelled draft in a field is edited, then adopted. "The record keeps that it began as a machine draft" (DEC-101, DEC-120). A member transcribes a passage and a second member attests (`content` R23–R26). `narrow` writes a new suggested version (`basis-versions` R27). `reportResolutionDefect` (`entities` R38). `hypotheses.revise`/`withdraw`. `reevaluation.adoptVersion`/`keepVersion` with a reason | built |
| Reject | Dismiss or defer with a recorded reason. The disposition is kept, ages, and is never hidden (`queue` R16, R27; `progressions` R20–R22). The rejected version state is kept (`basis-versions`). DEC-84 (14): "the machine's reason stays the machine's, the member's own words optional and never filled from it" | built |
| The reason field | Never prefilled: "No templates, no 'suggested reason', no LLM-drafted default" (IC §J). Fixed dismissal reasons are allowed (DEC-84 (17)) | doctrine |
| What the machine may never do | Divide, ground, author a leg's role, move or accept a version, conclude, hold a hypothesis, dismiss, clarify or resolve a contradiction, adopt or keep a version notice, set a condition, or triage beyond `question` (`notes/M1` §2 D1). A run "holds no op that ACCEPTS anything" (`notes/C6` §2 row 1) | built (fences in code) |

### 3.4 Several members

- **Positions.** A joined participant may revise, cite, sever, take a stance and conclude. Owners invite, set visibility, adopt the lens and close. Administrators "can audit everything and direct nothing" (`notes/C4` §1.3; `membership` R55, R60, `notes/M4` §1.20). Expertise "gates nothing" (`notes/C4` D36).
- **One state, many homes.** "An event reaches EVERY ancestor, and one member's resolution settles it for all of them" (DEC-16). A FINDING leaves only by a project-scoped disposition, "one decision per (project, finding)" (`queue` R27) (`notes/C2` §1.2; `notes/M1` §1.17).
- **Disagreement inside a project.** A question has one CURRENT version per project, and "one team's decision never silently moves another's" (`notes/C6` §2 row 20; `notes/M1` §1.8). Restructuring after seeing strength is "LEGAL, RECORDED AND ATTRIBUTED — never blocked" (DEC-32). Fork is "the remedy available to participants when they disagree with where a project is going" (MEM §7.12; `notes/C4` §1.3).
- **Disagreement across projects.** Contradiction key K5 pairs two projects' conclusions. It is built but withheld until its gate is measured. DEC-85 tells each side "without being shown the other project" (`notes/M1` §1.5; `notes/D1` DEC-85).
- **Privacy inside the group.** Leads are readable only by their author and the people they were shared with, "never by administrators". `leadShare` is a heavy act ("a disclosure that cannot be un-read") (`notes/C4` §1.3; `notes/D1` DEC-88). Dated waits answer only the member who set them (`inquiry` R55, `notes/M1` §1.1).
- **K1618 (Bob, 2026-10-06)**, read in `build/rulings.md`. "A document captured for one member's question and set aside by another is never silent; the reviewer sees the question and asker, a set-aside a question waits on takes a reason, the asker sees it as a wait on the question (no notification, DEC-94), and either may restore with a reason; no veto or quorum for documents." The ruling records the canon gap: `capture` R77/R79 has the set-aside act, and "inquiry has no such wait". Status: **specified (approved)**. The screen DEC is pending in the UX stream (B49).
- **AI across members.** A run spends only the starting member's own account (K1502, K1503). A woken run resumes only under that member's credential. "A run's acts are its principal's" (`notes/C6` §3.2; `notes/C4` D33; `notes/M2` §3.10).
- **Activity counts members' own work only.** The activity level counts "weeks … with real work by members (never the assistant's)" (DEC-111, `notes/D1`).

### 3.5 Notification doctrine

| rule | text | source |
|---|---|---|
| No nagging | "THE WORKFLOW MUST NOT NAG OR SECOND-GUESS MEMBERS"; "INFORMING AT THE ACT, ONCE, IS RESPECT"; reminders "detached from any act" and counting a member's attention are the flaw | DEC-69 |
| Told once | A re-evaluation feed "tells ONCE, is dispositionable, and ages … never a recurring nag" | DEC-70 |
| Reminders are the member's | "A DEADLINE REMINDER IS THE MEMBER'S OWN REQUEST". A nearing deadline changes the display only. "OVERDUE is new, and re-notifies once" | DEC-94 |
| No outside channel | "NO WAY to reach a member who has not opened the product: no email, push" | DEC-94, DEC-116 |
| Waits | "EVERY WAIT SAYS WHAT, FROM WHOM AND BY WHEN" | DEC-98 |
| Held captures | "nothing about held captures is notified" | DEC-97 |
| No surveillance of reading | Read-event logging refused | DEC-68 |
| Unsubmitted drafts | A reminder screen offers submit, keep as draft, or cancel. Stopping is a non-event | K1364 |
| Personal mute and snooze | Never a record act. An obligation is never muted | `queue` R19–R31 |

(`notes/D1` §2; `notes/M1` §1.17; `notes/D2` §1.3 family 1, 7)

### 3.6 Following progress over weeks

| what the member needs to see | substrate | status |
|---|---|---|
| Where the project stands | `project-stage`: forming → investigating → matured → closed, derived, with what the next stage needs (DEC-79) | built, coarse (`notes/M1` §1.12) |
| Progress on the objective | `intent.progress` and `gaps`, derived and never reported; `pursuitOf` with dead ends kept | built, but conditions only over progressions (`notes/M1` §1.11) |
| What nobody has looked at | `retrieval.frontier`: `never_looked` per level | built (`notes/M1` §1.15) |
| What changed under a finding | `reevaluation`: obligations derived on read; newer-capture notices; adopt or keep. Event-date-moved cause (R34) | built; R34 **specified** (`notes/M1` §1.16) |
| Waits | Records-request lifecycle with `due_cite` and `passed_unanswered` (`actions` R22, R25); action clocks overdue (`monitoring` R34); dated waits on a question (`inquiry` R54–R57) | built; dated-wait queue items **specified** (T33-83, no `notice-producers` at the pin) (`notes/M1` §1.1, §4 item 7; `notes/M4` §1.19) |
| Watches | `monitoring` checks documents at their own cadence and proposes watching the sources an objective rests on (R33). `link-sweep` covers a district's listing pages. Standing questions are a member's saved search on a cadence, with an AI half that is read-only and switched off by default (K1481) | built; AI half off (`notes/M3` §2.21–2.22; `notes/M1` §1.10) |
| The promise and its slip | A `duties` occurrence with a `commitment` basis. Transitions are recorded "as known on that day". "Overdue raises a question, never a violation" (`notes/M4` §1.6) | built (T33) |
| Timeline | `events.timeline` / `explore.timelineOver`, with "what they did" and "what we did" in separate lanes | built (T33) (`notes/M4` §1.5; `notes/M1` §1.13) |
| Pick up where you left off | Journeys' wide-path rule 6: "come back at any time to find it exactly as they left it, with their unfinished work listed" | specified (`notes/D2` §1.4) |

### 3.7 The answer

- **Contract.** The answer contract from `answers` R3: question as read, summary bound to its support, sentences each typed and supported, holdings with quotes, looks per level, query shown, `next_acts`, label "machine work". `checkAnswer` withholds any sentence that quotes something unread, any unsourced figure, any rule not from the plane, and any absence stated without its level (`notes/M1` §1.10). Status: built (T33), read-only, undeployed.
- **How solid.** Strength is a pair (capture, connection) with testimony beside it, set against the project's bar and never a single value. The weakest link is named. Hunches left out are counted (`notes/M1` §1.6; DEC-82). There are five named gaps: Undetermined (with "because…"), Withheld, Unrated, Nobody looked, Refused (DEC-86).
- **Cause.** "Cause is member-authored and published only when evidenced". A hypothesised cause "stays in the working inquiry … published as 'cause not established'" (DEC-84 (10)). The DEC-77 presentation forms include "Criteria / Condition / Cause / Effect / Recommendation" and a competing-hypotheses matrix (`notes/D1`).
- **What follows.** `action-plans` handles matters that are suspected or determined, options, scenarios and checkpoints (`notes/M4` §1.18). `actions` covers records requests and requests for comment, which are "never gated" (ACT §4 r2). Further pieces are the counsel packet, review copies that "state [their] own gaps" (DEC-31), and the publication ceremony (DEC-80) (`notes/C4` §1.2; `notes/D1`).

**How an engine would use all this as it is.** Even today, an engine could:
1. open a run on the project's objective by a member's reasoned act (`workobjective`);
2. file capture requests;
3. write suggested versions;
4. have the member triage captures (DEC-97), versions and surfaced questions in the queue;
5. track the records request's clock;
6. answer through the closed-book contract.

Three limits block this today. Only `check` is deployed. The worker ignores the objective and its gaps (`notes/M2` §3.16). And nothing joins these pieces into one loop a parent can follow.

## 4 · Gaps

### 4.1 What is missing

| # | gap | evidence | need |
|---|---|---|---|
| G1 | **No interview.** The product allows one clarifying question per ask, and the ask keeps nothing. The INTERPRET flow and the prompt entry are absent. No script or skill says which questions change an investigation's plan. Practice asks several (S1 lists six). | `answers` R3, R14 (`notes/M1` §4 items 5–6); ASSISTANT-PILOT flow absent (`notes/C1` §1.4 row 11; `notes/D2` §1.2); `notes/P0` §S1 | N1 |
| G2 | **No uniform way to accept "a proposal" across kinds.** At least three patterns coexist. (a) No adopt control: the member re-authors (governing laws, UI-102). (b) Adopt as an attributed act the record remembers *as acceptance* (DEC-77, contradictions only). (c) A labelled draft, edited then kept (DEC-120). DEC-77's act is "introduced for contradictions first", and its extension is unruled. Acceptance rates are measured only for contradictions, although DEC-95 (f) requires them for suggestions. | `notes/C2` §4.2 item 2; `notes/D1` §4 items 3–4; `contradiction` R39 | N2, N3 |
| G3 | **Facts read from documents have no tray.** Events, lines and money facts have no machine-proposal path. An AI reading of an award resolution or a status report (names, not identifiers) can write none of them and has nowhere to put them. | `notes/M4` §5 item 1; `lines` Suggestions open (4) | N2 |
| G4 | **Explanations proposed by the machine have no home.** `MACHINE_CANNOT_HYPOTHESISE`: only a member holds a hypothesis. The machine may raise a "Noticed" signal, but there is no proposal kind "here are five explanations of the slip, with what each predicts". | `hypotheses` R1, K1473 (`notes/M1` §4 item 3) | N2, N7 |
| G5 | **Plan steps have no tray.** There is no investigation plan object (A-PLANNING's subject). `workObjective` opens a run, but the worker reads neither the objective nor its gaps. Nothing lets the member see and edit the plan *before* a costly run, as the Gemini pattern does. | `notes/M2` §3.16, G2; `notes/C6` G3; `research/B4` L1 | N2 |
| G6 | **K1618 is not built.** Set-aside (`capture` R79) has no link to the questions that depend on the document. `inquiry` has no "document set aside" wait. There is no restore act for the asker. | K1618 text; `notes/M3` §2.2 | N4 |
| G7 | **Waits are personal and their queue items are unbuilt.** Dated waits answer only their setter (R55). The queue items `inquiry-recheck-due` and `standing-answer` are specified (T33-83). Event-date-moved re-evaluation is specified (R34). For a slipping completion date these are exactly the missing links. | `notes/M1` §1.1, §4 items 7, 11 | N5, N6 |
| G8 | **No "where it stands" read for an investigation.** State is spread over `project-stage`, `intent`, `retrieval.frontier`, `contradiction`, `reevaluation`, `queue` and the waits. Nothing composes it, and nothing answers "what changed since <date>". | `notes/M1` §4 item 12 | N6 |
| G9 | **No persistent answer.** An ask is read-only and keeps nothing. A review copy and a case edition exist only at publication. There is no answer to "what's going on?" composed for the project as working material, refreshed as the record moves. | `notes/M1` §1.10; `notes/D1` DEC-31 | N7 |
| G10 | **The member's own material.** Firsthand observation is held by `testify` (grade D, `notes/M3` §2.16). There are no private notes (J11, open), no structured site-visit or complaint-log form (Documenters, `research/B1` L18), and a member's own searching writes nothing (`observation-log` R24). | `notes/D2` §5 item 6; `notes/M2` G9 | N1, co-investigator |
| G11 | **No AI floor stated for the loop.** AI is optional per group (DEC-120) and per member (K1547). A loop that only works with a key fails a member with none. | `notes/D1` §4 item 12; `notes/C6` G11 | DR2, DR14 |

### 4.2 What exists but does not fit

1. **The queue is a list of individual items, not an investigation's agenda.** Grouping by case helps (DEC-110). But a weekly batch of 30 proposed facts, 5 explanations and 3 next acts from one run would arrive as 38 FINDINGs unless the producers aggregate per run and kind, as the "one proposal with N instances" rule asks (`notes/C2` D35).
2. **"Order of strength" in the action-plan tray** (`action-plans` R34) is the only built ordering of proposals. It is the model's judgement, shown only as order. That is acceptable under DEC-89 because it is transient display, not a stored rank (`notes/D1` §4 item 10). An investigation tray needs a stated order, such as by objective, then by what each proposal would settle. It must not rely on the model's taste.
3. **Budget is "recorded and never SHOWN"** (F11, `notes/C2` §1.3; `notes/C6` G10), while `workobjective` must show "the run's budget and scope beside it" (DEC-88). Practice says to show the budget when the plan is approved (`research/B4` L24). A-COST owns the figure. LOOP needs it at the approval act.
4. **The 28-day update practice versus DEC-94.** Police practice pushes progress to the complainant on a cadence (`research/B2` L16). The product has no outside channel, and anything unrequested is a nag. Only the member's own request can make a cadence (DEC-94).
5. **Rule 7's "structure only what the member said" against an interview that infers.** DEC-27 stands unless the member switches suggestions on (K1479). DEC-60 lets the investigative session formulate proactively, for the session only (K1602). So an interview may *ask* about something implied, but may not fill it in (`notes/C2` §1.2; `notes/C6` §2 rows 24–25).
6. **Ageing a surfaced question after 30 days** (`intent` R17) suits unattended discovery. In a long investigation that is waiting on records, a proposal can be stale-but-valid. The age should read as a status, never as a nudge.

## 5 · Options

All four options keep the fences already in code: the machine never accepts, concludes, or holds a hypothesis, and every act runs its four beats. They differ in how much they unify and where the loop's state lives.

### Option A · Reuse only (stitch the existing seams)
- **Reuses.** Wizard scripts for intake without AI ("Your first question"). The queue as it is, with the producers already built. Owner adopt acts. Asks for the answer. The held-captures list.
- **Adds.** Two wizard scripts and nothing else.
- **Doctrine fit.** Perfect.
- **Cost.** Very low.
- **Risk.**
  - Intake is one question per ask.
  - Facts read from documents (G3) and explanations (G4) still have nowhere to go.
  - The answer is ephemeral.
  - 38-item queue floods.
  - Fails N2, N6 and N7 for the Grandview case. A parent would face a dozen screens and no single place to see where things stand.

### Option B · A thin loop over the existing owners (recommended)
- **Reuses.** Everything in Option A.
- **Adds.**
  1. An interview delivered as a wizard: scripted without AI, planned on the fly with AI. It holds a few clarifying questions, and its answers land as authored objects.
  2. One cross-kind acceptance rule: DEC-77's act extended to every investigation proposal, routed to the owner's adopt act, with the acceptance rate measured per kind.
  3. Proposal kinds for facts from documents, explanations and plan steps, each stored apart by its owner.
  4. Aggregated queue producers.
  5. K1618 built and generalised.
  6. Shared waits, and the specified queue items.
  7. A derived "where it stands / what changed" read for HOME's view.
  8. A project-scoped answer composed under the closed-book contract.
- **Doctrine fit.** Good. Each addition is a proposal, a read or a member act. Three items need Bob's ruling (§8).
- **Cost.** Moderate. Most of the work is producer kinds, propose acts in three layer-5 owners, and two reads.
- **Risk.** Scope creep into "case management" (DEC-48; CL §10 "no drift into BI, case management or dashboards"). This is contained by holding no tasks, assignees, scores or notifications.

### Option C · An investigation console module (case management)
- **Adds.** A layer-11 module owning the investigation's tasks, assignments to members, a progress dashboard, reminders on a cadence, per-member evaluation comparison (CaseMap) and member roles (lead, reviewer, researcher).
- **Doctrine fit.** Poor.
  - Assignees and costs are excluded (`action-plans` R26; `notes/C4` D23).
  - Reminders on a cadence are nags (DEC-69, DEC-94).
  - Roles beyond the capabilities and positions conflict with "the work varies, not the person" (ACT §4 r10).
  - "No drift into … case management" (`notes/C5` §2).
- **Cost.** High.
- **Risk.** High. It duplicates the queue, `intent` and `action-plans`.

### Option D · Conversation-centred loop (the assistant transcript as the case memory)
- **Adds.** A long-lived assistant conversation that interviews, proposes, takes acceptances in chat and summarises progress.
- **Doctrine fit.** Fails.
  - Transcripts are device-local and deleted at a time limit and at publication (DEC-61, DEC-113). "The conversation is not the record" (`notes/C6` §2 row 21).
  - Acceptance in chat would skip the act's checks, reason and receipt (DEC-27, `notes/C2` D16).
  - Several members cannot share one transcript.
- **Cost.** Low at first, then high.
- **Risk.** Decisions evaporate. Practice also warns that a plan lost to truncation or compaction loses "subtle but critical context" (`research/B4` §1.2).

## 6 · Recommendation: Option B, a thin loop over the existing owners

**Principle.** The loop owns no new state of its own. The member's answers, choices and reasons land in the existing owners, as authored objects or recorded dispositions. The loop adds proposal kinds, one acceptance rule, two reads and a few member acts. It adds no tasks, no assignees, no scores and no outside notifications.

### 6.1 The pieces

| # | piece | where (layer) | responsibility | interface (one sentence) | uses |
|---|---|---|---|---|---|
| L1 | **Interview scripts** | `wizard-scripts` (11), Civicsmith library | Fixed intake flows that need no AI: "Start an investigation" (generic) and "A public project is late" (the public-works pattern, from `notes/P0` §S1 and `research/B5` §4). Each step asks one question, says why it matters, accepts "I don't know", and points at the real control: create project, state objective, open question, record what I saw, note a lead, state a hunch. | `wizardsAt(screen)` offers the script on an empty project's "Start from…". Steps place labelled drafts that the member keeps or edits (DEC-120, K1364). | `wizard-scripts`, `intent`, `inquiry`, `provenance.testify`, `observation-log.lead`, `hypotheses` |
| L2 | **Interview layer of the doctrine pack** | `skills` (6), new disclosed layer `interview` | Doctrine for an AI-planned interview: ask only what changes the plan; at most a few questions, all shown together; each with its reason; never suggest the answer; offer to ask the source instead of guessing; unanswered reads as UNDETERMINED; structure only what was said (DEC-27). | The assistant plans a flow on the fly (DEC-120) from the member's opening words. It passes the same `checkScript` checks, including `WIZARD_STEP_CONCLUDES`. | `skills`, `wizard-scripts`, `agent-worker` (an existing flow-planning path, no new run mode) |
| L3 | **Accepting a proposal, everywhere** | each owner (5, 6, 9) | Every adopt act that takes a machine proposal records `{proposal, accepted: as_proposed | edited | unaided}` (DEC-77 (b)). Edits keep the draft's origin (DEC-101). Declines and defers take a member's reason (never prefilled) and are remembered. A declined proposal is not re-proposed unless its basis changes: a new capture, a new reading, or a moved event. | Owners already store proposals apart. They gain the `accepted` field, and propose acts where missing (L4). | `duties`, `standards`, `money`, `basis-versions`, `content`, `action-plans`, `intent` |
| L4 | **New proposal paths** | `events`, `lines`, `money` (5); `hypotheses` (6) | Close G3: `propose` (machine, stored apart, labelled, with run id and the cited extent) → member `adopt`. Close G4 without breaking K1473: an **explanation proposal** is stored apart beside `hypotheses`, carrying what it would predict and which documents would test it. Only a member's act turns it into a `HYP-` (it is never one before). | Same shape as `duties.propose/adopt` (`notes/M4` §1.6). | `events`, `lines`, `money`, `hypotheses`, `run-productions` |
| L5 | **Aggregated producers** | `queue-producers` (11) | One FINDING per (run, kind, project) with N instances: "12 facts read from the Notice of Award", "5 explanations to consider", "3 next steps proposed". Each carries a stated order: by the objective each serves, then by what it would settle. No model-ranked order is stored. | New kinds `facts-proposed`, `explanations-proposed`, `plan-steps-proposed`, `next-acts-proposed`. Each instance opens beside its source span (quote and location) for checking. | `queue`, owners' proposal reads |
| L6 | **The acceptance measure** | `queue` (11), generalising `contradiction` R39 | Acceptance rate per proposal kind, aggregate only, never per member (reconciling DEC-77/DEC-95 (f) with DEC-68/DEC-69). It triggers a recorded review of the recommender at a high rate (≥95% over ≥30, as R39). | `acceptanceRates({kind})` gives counts, rate and review due. It is admin- and BOB-visible, never on a member's screen. | `queue`, owners |
| L7 | **Dependent set-asides (K1618, generalised)** | `capture` (3), `inquiry` (6) | A document set aside (R79), or a proposal dismissed for the project, that a question depends on (because it was captured for that question or cited by it) becomes a **wait on that question**. The wait names the reason and the member who set it aside, and is shown to the question's asker and participants. Either member may restore it with a reason. There is no veto, no quorum and no notification. | `inquiry.waitsOn({question})` gains kind `set_aside`, and `capture.restoreHeld` accepts the asker. | `capture`, `inquiry`, `queue` |
| L8 | **Shared waits and their items** | `inquiry` (6), `notice-producers`/`queue` (11) | Build T33-83 (`inquiry-recheck-due`, `standing-answer`). Let a member *share* a dated wait to the project (an act, off by default). A review date the member sets ("look at this again on 1 November") is the doctrine-safe form of the 28-day update. | `waitShare({wait, project, reason})`. A due wait raises one item, once. | `inquiry`, `queue`, `civil-time` |
| L9 | **Where it stands, and what changed** | read in `intent` (7) or HOME's module | A derived read for one project, writing nothing and composing nothing into a score: open proposals by kind; waits (what, from whom, by when); objective progress and gaps; questions with their strength pair against the bar; hunches to clear; open contradictions; `never_looked` by level; overdue occurrences (as questions). Plus `changesSince({project, since})`: captures arrived, readings made, events moved, occurrences changed state, proposals added. `since` is a date the member picks, defaulting to their own last act in the project, **never** a logged view (DEC-68). | Consumed by HOME's single view (K1627). | `project-stage`, `intent`, `retrieval`, `reevaluation`, `queue`, `duties`, `strength`, `contradiction` |
| L10 | **The project answer** | `answers` (6) | `projectAnswer({project, objective?})`: the answer contract (R3), composed closed-book from the record and passed through `checkAnswer` (§6.4). Read-only. It keeps nothing beyond what an ask keeps. Labelled machine work. | The member may adopt its text as a labelled draft into a review copy (DEC-31) or an edition statement. | `answers`, `strength`, `duties`, `events`, `standards`, `hypotheses`, `retrieval` |

**Layer order.** L1 and L5–L6 sit in layer 11, L2 and L10 in layer 6, L7 across layers 3 and 6, L9 in layer 7. Every piece uses only modules earlier in the order. The "what follows" half of the answer comes from `action-plans` (layer 9). The project view (layer 11) shows it beside L10's output, so `answers` never reads upward (P4; `notes/C1` D32).

### 6.2 The interview, concretely

For Bob's opening words, the AI-planned flow (L2) or the "A public project is late" script (L1) asks about six questions, shown on one page, each with its reason:

| question | why the page says it is asked | what the answer becomes |
|---|---|---|
| Which district, and which school? | So documents can be found where they are published | Entities proposed (`entities`); jurisdiction profile check: a school district is not yet covered, so UNDETERMINED, stated (`notes/M4` §1.15) |
| Where did "one school year" come from, and do you have it? | A promise can be tested only once its source is found | A lead "find the promise's source"; if the member holds a document, a capture; later a `commitment` standard (`notes/M4` §1.13) |
| When did construction start, as far as you know? | The promise runs from a start date | A dated statement in the member's own words (testimony, grade D), held as a lead to an event |
| Where are the children now? | Interim housing has its own costs and deadlines | Part of the objective's text; possibly a second question |
| How is it paid for? | It decides which oversight body and audits exist | A lead to the bond measure and the oversight committee |
| What have you seen on site, and what has the district told you? | What you saw is evidence; the district's account is the first explanation to test | `testify` (grade D); an explanation proposal "the district's stated reason", sourced to what the member reports |

At the end, the member sees the proposed objects: an objective, two or three questions, leads, the testimony, and their own hunch held as a hypothesis if they stated one. Each is kept, edited or dropped with one act. Nothing is created unaccepted. The member, not the machine, creates the project (`notes/C4` §4 item 3). The intake decision from practice (investigate / refer / no further action, `research/B2` L11) is the member's choice on the last page. "Not now" is a non-event (K1364).

### 6.3 Reviewing proposals

Each proposal instance shows four things:
- the claim in plain words;
- **the quote and its location**, side by side with the source page (Citations, `research/B4` L14; ID §3 "never only an AI summary", `notes/C4` D8);
- why the machine proposed it ("read for objective 1: the contract's completion term");
- what accepting would do: the rung and what it binds (`affordances`).

The member can accept, edit then accept, decline with a reason, or leave it. Leaving it is not a decline: the item ages and stays visible. Bulk acceptance works over homogeneous instances. Items that would become load-bearing must be accepted one at a time, the analogue of DEC-97's crucial-document rule.

At the two tipping points, before a member accepts a *main line of enquiry* or an explanation that names a responsible party, the panel shows the competing explanations still open and what each predicts. It does not ask "are you sure?" (DEC-69). It informs once, at the act (`research/B3` L13).

### 6.4 The answer, concretely

`projectAnswer` returns, per objective:
- **Criteria.** Each baseline found: the public promise, the approved schedule, the contract time, the baseline schedule. Each comes with its source, or "Undetermined, because the source of 'one school year' has not been found" (`research/B5` L6).
- **Condition.** The chronology from `events.timeline`. The promise's `duties` occurrence state ("overdue as of 6 Oct — a question, not a finding").
- **Cause.** Member-authored causes with their findings' strength pairs against the bar. Every other explanation is listed with its state ("proposed, not taken up"; "held as a hypothesis, not established"; "set aside: reason …"). Following DEC-84 (10), a cause no member has authored reads "cause not established".
- **Effect.** Only where a finding supports it.
- **Unknowns.** What is unknown, and which record would settle each, with its wait ("Waiting on the District's records officer, due 14 October").
- **The other side.** The district's stated explanation, quoted (right of reply, `research/B2` L15).
- **Next acts.** Drawn from `action-plans` options and evidence-seeking actions: a records request, a question to the oversight committee, a public comment.

There is no likelihood word, rating or single confidence anywhere in Civicsmith's voice (DEC-82, DEC-89, K1473).

### 6.5 Deliberately left out, and why

- **Email, push or digests sent outside the product.** DEC-94 forbids them. Waits and review dates are pull-only.
- **Tasks and assignment to members.** `action-plans` R26 forbids assignees. Membership holds participation, not tasks. Members coordinate through attributed acts and shared waits.
- **"Since you last looked" based on what a member viewed.** DEC-68 forbids it. `changesSince` uses a chosen date or the member's own last act.
- **Votes, quorums and vetoes on documents or proposals.** K1618 says "no veto or quorum". Disagreement goes to attributed acts, restore-with-reason, separate questions, or a fork (MEM §7.12).
- **Per-member evaluation comparison (CaseMap).** Useful but not needed by the problem set. It risks scoring members.
- **Machine-held hypotheses.** K1473 and `hypotheses` R1 keep them member-only. Explanation proposals stay apart until a member adopts one.
- **A transcript-based memory.** DEC-61 and DEC-113 rule it out.
- **Any score on proposals or members.** DEC-89 and `agent-worker` R52 rule it out. The acceptance rate is a measure of the recommender, aggregate only.

## 7 · Staging (smallest useful step first)

| step | delivers | acceptance test, in a member's terms |
|---|---|---|
| 1 | L1 interview scripts (no AI); L9 "where it stands" read with the waits that already exist | A parent with no AI key opens an empty project, chooses "A public project is late", and in one sitting ends with a project, an objective, a question, their account of the site recorded, and a lead "find where 'one school year' came from". Nothing was created that they did not keep. A week later, opening the project, they see what is waiting and on whom, with no message having been sent to them. |
| 2 | L8 shared waits and the T33-83 queue items; `reevaluation` R34 (an event's date moved); `changesSince` | Three weeks on, the records production has arrived and a board item has moved the completion date. On opening the project the parent sees, once: new documents held (with their grade notes), the promise still overdue (as a question), the forecast date that changed, and the review date they had set. A co-participant sees the shared wait too. |
| 3 | L7 dependent set-asides (K1618) | A second parent sets aside the bid tabulation that the first parent's question needs, giving a reason. The first parent sees it as a wait on their question, naming the reason, and restores it with a reason of their own. Nobody is notified and nobody is blocked. |
| 4 | L3 acceptance everywhere; L5 aggregated producers; L6 measure (with the proposals the existing `check` run already makes) | After a run, the parent sees one item: "7 suggestions on question 2". Each opens beside its quote. They accept 4, edit 1, and decline 2 with reasons. The declined two do not come back next week unless a new document bears on them. |
| 5 | L4 proposal paths (facts from documents, explanations, plan steps); L2 interview with AI | Given Bob's opening words, the assistant asks at most six questions, each with its reason. After a reading run on the Notice of Award, the parent sees the award date, amount and contractor proposed as facts with quotes, and five explanations of the slip, each saying which document would test it. None is recorded as fact or hypothesis until they accept it. |
| 6 | L10 the project answer, beside the plan's next acts | The parent asks "What's going on?" and reads: the promise and whether its source was found; the contract time against the promise; a dated chronology; what the accepted findings show, and how strongly against the project's bar; which explanations are open and which have support; what is unknown and which record would settle it, with its due date; the district's own explanation, quoted; and two or three next acts to choose from. Nothing names a cause the parent has not authored. |

Steps 1–3 need no deployed AI mode and work for a member without an account (K1547; DEC-120), which is the loop's no-AI floor (G11). Steps 4–5 wait on `check` being verified live and then `investigate` (`run-rules` R19; `notes/M2` G4). Step 6's composition can be built against fixtures before then.

## 8 · Decisions for Bob

Policy, requirements, architecture and UX only. Each has a recommendation.

1. **How many clarifying questions at intake** (requirements, UX). Your words were "maybe asks a few follow on questions"; the ask allows one per turn (`answers` R3).
   - *Recommend:* the intake interview (a wizard, not an ask) may show up to about six questions on one page, each with its reason, all skippable, with skipped ones read as "Undetermined". The ask keeps its one-question rule.
2. **Extend "accepting a proposal" (DEC-77) to every investigation proposal** (doctrine). This covers plan steps, facts read from documents, explanations and next acts. The record keeps whether the member accepted as proposed, edited, or chose unaided, and the acceptance rate per kind is measured as a guard against steering.
   - *Recommend:* yes, with one stated line. Where accepting would make the member vouch for a legal or authored claim (a governing law, a risk tier, a conclusion, a reason, a completeness statement), the member re-authors, as UI-102 already does.
3. **Explanations the machine proposes** (doctrine; K1473 boundary).
   - *Recommend:* allow an "explanation proposal", stored apart, saying what it would predict and which documents would test it. It becomes a hypothesis only by a member's act. The machine still never holds a hypothesis.
4. **Who may accept proposals from a run another member started** (requirements).
   - *Recommend:* any joined participant of the project. The record shows who asked and who accepted. Runs still spend only the starter's account (K1502).
5. **Generalise K1618** (doctrine).
   - *Recommend:* any project-scoped set-aside or dismissal that another member's question depends on is never silent. It becomes a wait on that question, with its reason, restorable by either member with a reason. No veto, no quorum, no notification.
6. **Progress over weeks without nagging** (UX, policy).
   - *Recommend:* no pushed progress updates. Instead: the "where it stands" view on opening; review dates the member sets (their own reminder, DEC-94); and a member's choice to share a wait with co-participants (off by default, given `inquiry` R55).
7. **The answer's vocabulary** (UX, doctrine).
   - *Recommend:* no ratings ("kept / broken") and no likelihood words in Civicsmith's voice. The promise reads by its occurrence state ("overdue — a question"). Each explanation reads by its record state (proposed / held as hypothesis / supported by a finding / set aside, with the reason). "Cause not established" applies wherever no member has authored a cause (DEC-84 (10)).
8. **An interim answer leaving the group** (policy).
   - *Recommend:* only as a review copy (DEC-31), carrying its own gaps. The project answer itself is working material and is never published (DEC-25 by analogy).
9. **The tipping-point display** (UX).
   - *Recommend:* when a member accepts a main line of enquiry, or an explanation naming a responsible party, the panel shows the other open explanations once, at the act. It never asks "are you sure?" (DEC-69).

The screens these imply go to the design stream as B-items. BOB does not edit the UX folder (`notes/D2` §1.1).

## 9 · Interfaces with the other capabilities

| capability | what LOOP needs from it | what LOOP gives it |
|---|---|---|
| **READING** | Each proposed fact with its exact quote, its location (extent), and *why the document is held*, so review is a cheap check. Proposed facts arrive through the L4 propose paths, never as direct writes. Reading profiles a member approves are member acts. | The acceptance record per proposed fact (accepted / edited / declined with reason), the measure behind reading profiles and their evaluation (`research/B4` L17) |
| **PLANNING** | The plan as a record the member can see and edit *before* a run starts, its steps arriving as `plan-steps-proposed`, and re-planning triggered by arrivals, never by a timer | The interview's outputs (objective, questions, leads, the member's hunch, constraints), the member's acceptance or rejection of each step with its reason, and the tipping-point guard |
| **HOME** | The single view and timeline (K1627) that hosts the L9 read, the waits list, `changesSince`, and the answer beside the next acts | L7 waits (set-asides), L8 shared waits, the composition rules for the view (no score; hidden reads as absent) |
| **PROCUREMENT** | The public-works interview script's questions (district, source of the promise, delivery method, funding, site); typed document slots whose emptiness becomes a proposal ("find the bid tabulation"); red flags as "Noticed" signals | Members' accepted baselines and facts as the inputs to its checks |
| **COST** | The run's budget and scope shown *at the acceptance act* that starts a run (`workobjective`, DEC-88), resolving F11's "never shown" for that moment; the per-member account and ceiling refusal in plain words | The point in the loop where the member approves spending, and the per-kind acceptance measure to judge whether runs earn their cost |

## Sources opened

All read whole, first to last line:
- `study/investigation/RESUME.md`
- `study/investigation/PROTOCOL.md`
- `study/investigation/prompts/A-LOOP.txt`
- `notes/P0.md`, `notes/C1.md`, `notes/C2.md`, `notes/C3.md`, `notes/C4.md`, `notes/C5.md`, `notes/C6.md`
- `notes/D1.md`, `notes/D2.md`
- `notes/M1.md`, `notes/M2.md`, `notes/M3.md` (1–516), `notes/M4.md` (1–440)
- `research/B1.md`, `research/B2.md`, `research/B3.md`, `research/B4.md`, `research/B5.md`

Read in part:
- `build/rulings.md` (product tree): line 1620 (K1618) and line 1629 (K1627) read whole; lines 1366 (K1364), 1452 (K1450), 1475 (K1473), 1481 (K1479), 1483 (K1481), 1493 (K1491) and 1502 (K1500) located by grep and read in the first ~700 characters (K1364 to its end). The rest of the file was not read.
- `study/investigation/STATE.md`: the table only.
