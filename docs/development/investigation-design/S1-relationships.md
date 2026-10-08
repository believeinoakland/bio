# S1 · How the elements of an investigation relate

Asked by Bob, 2026-10-08: "study the relationships between steps, basis, claims, findings, and any other elements." Seven readers read whole, 2026-10-08: Case Making v0.1; Content Framework v0.10; CONSTRUCTS.md, Interaction Constructs v0.1, State Rules v1.5; requirements `inquiry`, `inquiry-grammar`, `basis-versions`, `strength`, `leg-earning`, `hypotheses`, `intent`, `observation-log`, `project-stage`; `record-core`, `record-grammar`, `ratification`, `promotion`, `citation`; `contradiction`, `case-authoring`, `answers`, `tasks`, `review`, `conformance`; the study's PLANNING and HOME. Rendered for Bob as page 2 (`page-2.html`).

## 1. The model as built (requirements met unless marked)

| element | what it is | holds / states | who | source |
|---|---|---|---|---|
| project | the investigation (K1627); a container with membership | objective; bar (`required_strength`, per axis, a declaration not a gate); cites questions (n:m); CURRENT version per question; append-only conclusions per question; stage computed (forming, investigating, matured) or closed by owner | owners | basis-versions R13–R18; strength R14; project-stage R2–R5 |
| objective | what the project is trying to establish | text; optional satisfaction condition; progress computed; gaps → `objective-gap` proposals ("the gaps are the work list") | member | intent R1–R6; CF L1173 |
| question (inquiry) | "a question … may gather evidence and other inquiries, may reach a conclusion" | states open/surfaced, deferred, dismissed, concluded, divided; live basis; basis versions; recheck triggers (required) and dated waits; falsifier at conclusion; division; shared across projects | member, or machine surfaces | inquiry R1–R58; CM L523 |
| leg | one edge from a question (or version) to what supports or cuts against it | target: document content, another question, standard, calculation, duty occurrence, connection; role supports/cuts_against (member's); grade A–D, axis, source; ungraded = inert | member only | inquiry R4–R12; inquiry-grammar R11–R17 |
| basis | (a) the live basis: the question's legs; (b) a basis version: a named, frozen alternative account with its own legs and a claim; suggested/considering/accepted/rejected | — | machine appends `suggested` only | basis-versions Purpose, R4, R28 |
| claim | a statement on a basis version; **not an object** | — | — | basis-versions R16–R17; CM L683 |
| conclusion | a project adopting the claim of its CURRENT accepted version, with a falsifier; append-only stance | — | member | basis-versions R16–R20 |
| finding | a concluded question at a version | — | — | CM L593; SR L1705 |
| case | a production of a project: pinned finding-versions published against the project's bar | — | owner signs | DEC-72; case-authoring R4–R14 |
| strength | computed pair (capture, connection) beside the bar | never stored | computed | strength R1–R21 |
| document | captured bytes (grade) and content extents; collected → verified → retired | — | member, session, daemon | SR L673–778; CF Part II |
| hypothesis | a member's conjecture on a question; never a leg | — | member | hypotheses R1–R8 |
| lead / note | a tip; private working words; never evidence | looks logged | member | observation-log R14–R25; hypotheses R11–R15 |
| look | observation-log row: PRESENT, LOOKED_ABSENT, indeterminate, partial; none = never looked | — | machine or member | observation-log R1–R29 |
| contradiction | computed pair of claims/legs that cannot both hold; a candidate taken up becomes a question | — | machine proposes, member acts | contradiction R12–R36 |
| determination | a member's judgment of a government act against standards, resting on published findings | — | member | conformance R1–R22 |
| action plan → action | what to do about findings; an action is "an outward engagement": planned → active → awaiting_response → resolved/abandoned; `action_basis` → question/determination/document | — | member | Action §3–4; SR L888–922, 1803–1807 |
| to-do (task) | a system-routed obligation `refers_to` a bundle; no member can create one | open, forwarded, resolved | system | tasks R1–R17 |

The chain: objective → questions → (hypotheses) → *work* → documents and looks → legs → basis version (claim) → conclusion = finding → case → determination → action plan → actions, whose replies and outcomes come back as documents.

## 2. Where a step would attach

No module has an investigative step (find a document, ask someone, file a request, visit a site). The nearest: the action (outward only; "a leg never points at an action", D-181), the action plan's steps (what to do about a finding, CM L923–948), the to-do (system-routed), recheck triggers and dated waits (on a question), objective gaps (computed), and Bob's deferred **backward question** (D-165: "what additional findings … would also need to be true", whose output is a work list).

A step, as studied: **serves** a question (or an objective gap, a hypothesis, a contradiction); **seeks** a document, an account or an observation; is **satisfied by** a document held, a look recorded (absence included) or a reply; never writes a leg (a leg is what a member stood behind). An outward step (a records request) starts an action.

## 3. Words used in several senses

- **basis**: a question's legs; a basis version; a date's basis (rule, commitment, dependency, window); `action_basis`; a proposal's basis; a member's stated basis for testimony or a progression revision.
- **claim**: a version's statement; a case's assertion; a completeness claim; a citation-register claim; the legal sense.
- **finding**: a concluded question; a machine output awaiting triage (queue FINDING); a check result; a recorded absence ("the negative result is a finding"); a missing-predecessor finding.
- **plan**: the action plan; an action's `## Plan`; the build plan.
- **step**: an action-plan step; "an action: a step someone takes"; wizard, build and progress-bar steps.
- **task**: the routed to-do; a machine job.

## 4. Points for Bob (this lane's reading; offered on page 2, not yet asked as D-numbers)

1. A step is the investigation's own work; an outward step starts an action (action keeps its meaning).
2. A step serves a question first; also an objective gap, a hypothesis or a contradiction.
3. A step's result is a document, a look or a reply; turning it into a leg stays the member's act.
4. One member-facing meaning each for "finding" and "basis" (owed to the UX stream's vocabulary).
5. Bob's deferred backward question is the natural planner of steps; whether to revive it is his.
