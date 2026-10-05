# Study: QUESTIONS — natural-language questions and the assistant

*A-QUESTIONS analyst, BOB #110 constructs study, 2026-10-05. Read-only; nothing in `bio` was changed. Code facts are verified on `tranche/T32` @ 09837e3 (one commit past the phase-1 pin 31f30a6, no code change between). The short answer to Bob's belief is in §3.1: no member can ask Civicsmith a question in plain words today, on any copy, and §3.1 says exactly why.*

## 1. Anticipated needs

Sources: the digest (`digest/QUESTIONS.md`, cited by reader and source line), the journeys (design branch, `src/design-journeys.txt`), and real-world practice (URLs). Centrality: **core** (most members, most weeks), **regular**, **occasional**.

| # | Need (group) | In a member's words | Central | Where it comes from |
|---|---|---|---|---|
| **A** | **Find and recall what the record holds** | | | |
| A1 | What changed in our material | "Show me new content uncovered over the weekend on the Sewer Fund project." | core | DEC-27's own FIND example (C11 src 1810) |
| A2 | Which documents say X, and which nobody has read | "Which of our documents mention the franchise fee — and which haven't been read yet?" | core | four-level search, CF §14.3 (C3 src 1899–1906); CSD §4.4 worked example (C8 L369) |
| A3 | Where a question stands | "How strong is this question against our bar, and what's the weakest link?" | core | DEC-82 measures map; journey 3 newcomer meets strength and "Undetermined" first (D1 L181) |
| A4 | Have we looked, and where | "Did anyone look for the 2023 sewer audit? Where?" | regular | frontier, OLD §6 (C10 l.270–276); UC-008 |
| **B** | **Use the system** | | | |
| B1 | Explain a screen, a word or a refusal | "Why won't it let me publish?" | core | DEC-27 wizard; DEC-49 refusal translations; ASSISTANT-PILOT §1 ("the refusal vocabulary is already training data") |
| B2 | Walk me through it | "Help me open a project to explore this tip." | core | DEC-27 CREATE; DEC-120/121 wizards; journey 9 (D1 L284–296) |
| **C** | **Turn a problem into questions** | "The potholes on my street never get fixed — what can we ask?" | core | journeys §3 "A problem they live with" (the city auditor's forum, 4 Oct); "the assistant can suggest first questions … one question per requirement in a code section" |
| **D** | **Explain a rule or a charge (law)** | | | |
| D1 | What a charge or rule rests on | "What's this sewer maintenance charge on my water bill?" | core | journeys §6 "Explaining a charge or a rule" (D1 L529; X154) |
| D2 | What a provision requires, and when it was in force | "What does this code section require, and was it in force when the contract was signed?" | regular | journey 4 step 3 (find the city's own standard); standards R7 `inForce` |
| D3 | What a term means | "What's a 'controlled audit' versus the audit that's required?" | regular | DEC-27 CREATE example; D273 ("Undetermined, because the city does not define it") |
| **E** | **Time and obligations** | | | |
| E1 | When something is due, from whom | "When is the Clerk's reply to our records request due?" | core | RM CPRA example (X35); DEC-98 "every wait says what, from whom, by when" |
| E2 | What is late | "Which council minutes are overdue?" | regular | progressions overdue-successor (C3 §8.2); docprofile `minutes_due_days` |
| E3 | What's coming | "When does this come back to council?" | occasional (no meeting model) | journeys §6 "Meetings and time" |
| **F** | **Organisations** | "Who is responsible for street repair, and who held that office in 2023?" | regular | journeys §6 "Offices and who held them"; actions R9 (an office, never a person) |
| **G** | **Courts and proceedings** | "What's been filed in the city's lawsuit since we last looked?" | occasional | journeys §3 court/regulatory rows; §6 "Following a court case" |
| **H** | **Analysis** | "How do police overtime actuals compare with the budget for FY24?"; "Does the city's 90% pothole claim hold against its own records?" | regular | journeys §3 overtime row, journey 6 (X130) |
| **I** | **What we could do** | "If this finding holds, what could we do — and what else would have to be true?" | regular | Case Making §6a forward/backward question (C4 CM 1032–1044; D-165 deferred) |
| **J** | **Language and voice** | "Read me this in Spanish"; asking by voice | regular | DEC-127; DEC-27 voice (UC-093) |
| **K** | **Find the right person** | "Who in our group knows the Brown Act?" | occasional | Membership §1.3 (C7 src 137–142): legal and financial questions go to qualified members (X149) |

**How the work is done elsewhere, and how it fails.** Newsrooms already ask document sets questions (DocumentCloud's GPT add-on, https://www.muckrock.com/news/archives/2023/apr/10/release-notes-introducing-documentcloud-ai-credits-gpt-3-add-ons-bulk-editing-add-ons-and-more/; citymeetings.nyc makes council meetings navigable with an LLM, https://civictech.guide/projects/citymeetingsnyc), and the AP treats any generative output as "unvetted source material" (https://ds.svcs.associatedpress.com/standards-around-generative-ai). The failure modes are measured and severe exactly where Bob wants the assistant to go: legal research tools built on retrieval still produced incorrect answers 17–34% of the time (Stanford RegLab/HAI, https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries); general models hallucinated 58–88% on verifiable case-law questions and failed to correct false premises, with the risk highest for people without lawyers (https://arxiv.org/abs/2401.01301v1); judges had addressed more than 1,450 filings with AI-fabricated authority by mid-2026 (https://www.malaymail.com/news/tech-gadgets/2026/06/16/do-your-job-global-courts-face-rising-tide-of-ai-generated-fake-cases-and-quotes/223865); New York City's own chatbot told landlords they could refuse Section 8 vouchers and bosses they could take tips, both illegal, and is being shut down (https://themarkup.org/news/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law, https://themarkup.org/artificial-intelligence/2026/01/30/mamdani-to-kill-the-nyc-ai-chatbot-we-caught-telling-businesses-to-break-the-law); 45% of assistant answers about news had a significant problem, sourcing the commonest (https://www.infodocket.com/2025/10/22/bbc-largest-study-of-its-kind-shows-ai-assistants-misrepresent-news-content-45-of-the-time-regardless-of-language-or-territory/). Needs D–I are therefore where a careless assistant does the most harm, and the design below is built around that.

## 2. Levels of support

| Level | What a member can do | Needs served (lowest level that serves them) |
|---|---|---|
| **L0 — typed search** | Type words or the query grammar into search; read results, the four-level statement and refusals. No plain-language entry, no AI. | — (A2 partly, by typing) |
| **L1 — ask the record** | Ask in plain words (typed or spoken) on any screen; get an answer that cites record addresses, names the levels searched and which absence is true, states its bound and what is withheld, shows the query it ran; ask what a screen, word or refusal means and be walked through a wizard script. Read-only. | A1–A4, B1, B2 (scripted), E2 (progression findings are already record), K (expertise read) |
| **L2 — ask it to set things up** | The assistant turns the member's own words into proposed objects (project, question, claims) and conducts multi-step work on the real screens, placing labelled drafts; suggests first questions from material the member brought; drafts translations and messages as proposals; the member starts a CHECK, investigate or extract run from the panel. | B2 (planned on the fly), C, J, I (drafting half) |
| **L3 — answers that apply rules** | Answers that need a rule use the plane's rule services: law held in the record (captured text, in force at a date), deadlines computed by the plane from the profile and confirmed local facts, offices from the registry and profile, arithmetic over cited figures — each relayed with its basis, grade and status, and "not held" where the plane holds no rule. Explains held text in plain words, labelled; never states law from the model. | D1–D3, E1, E3, F, H |
| **L4 — investigative questions** | A question the record cannot yet answer becomes a bounded run that looks across all four levels (requesting captures), returns suggested versions, leads and gaps; the backward question returns a work list of findings that would also need to hold. | G, I (backward), D1 when the ordinance is not yet held |
| **L5 — standing questions** | Standing questions and proactive relevance ("tell me if the Clerk misses this date"); fan-out to outside sources in one query. Gated by doctrine: no standing or automatic AI run (D13). | (none core; UC-002, DEC-95.3 suggestions) |

## 3. What exists now

### 3.1 The answer to Bob: what is and is not true today, and why

**True.** Bob ruled the assistant on 2026-08-03 (DEC-27, archive src 1784–1932): a tag on every surface opening a dialog that takes free text and voice, three request kinds (FIND, CREATE, ACT), and the rule that it *"gets its understanding of the rules from the server"* and holds no copy of them (DEC-8 applied). The member-facing flow is designed (ASSISTANT-PILOT §2–§3; Interaction Constructs §P), the panel is ruled (DEC-90), its voice (DEC-125), wizards and labelled drafts (DEC-120, DEC-121, K1364), and journey 9's front door is *"Opening the panel and asking in plain words"*. Beneath it a different AI function is built: the investigative session (IS plan 43/43) — the `ai` credential class, the bounded run, its observation log, the skill pack (rendered in production through `op=affordances`), suggestion-only writes, capture requests, and `agent-worker`, whose `model.mjs` is the one place in the repository that calls a model (Anthropic Messages API) and whose sub-sessions already translate an intent into query-language strings (`model.mjs`:215–226).

**Not true.** No member can ask a question in plain words, on any copy, through any screen:
1. **Nothing to ask into.** No tag, panel, prompt box, INTERPRET step, classifier or FIND flow exists (ASSISTANT-PILOT Status, 2026-09-14; AIR §8: "DESIGNED, not built"; design HANDOFF §4, 2026-10-02: "no member-facing panel, prompt box or wizard exists"). No op takes a natural-language question (M5); no requirement file mentions natural language (M3); UC-092 "Ask the assistant in my own words" has no requirement (D1). The wizard module is built but `SCREENS` and `CIVICSMITH_LIBRARY` are empty, so no wizard can run (M5). The legacy interface never opens, lists or reads the log of a run (`app.html`:22850–22851).
2. **What is built is not a question-answerer.** The one deployed mode, `check`, reads an existing conclusion adversarially and writes suggested basis versions; *"as built the assistant is a bounded, adversarial evidence-checker that writes suggested basis versions and answers no question in prose"* (X155).
3. **It cannot run.** Only `check` is deployed (`run-rules/deployment.mjs` `DEPLOYED_MODES` = `["check"]`; `agent-worker/src/harness.mjs` `MODES`). No plane path starts a run's first segment: the plane calls `agent-worker` only on a wake after capture requests complete, and only for a run the instance's organisation `ai` credential opened; a member's run is withheld (`MEMBER_PRINCIPAL_RUN`, `ai-runs/index.mjs`:1590). The installer never sets a model key (`INSTANCE_CLAUDE_TOKEN` appears nowhere in `newgroup/`) and never generates the `ai` credential (`newgroup/src/index.mjs`:391–405, "it NEVER GENERATES ONE"), so a new install answers `NO_ACCOUNT_RESOLVED` / `NO_INSTANCE_AI_CREDENTIAL`; the plane's `AGENT_WORKER` binding is "INERT UNTIL DIST DEPLOYS THE MEMBER" (`bio-plane/wrangler.jsonc`); no deployed copy runs model turns and releases are held (HANDOFF §4). Whether model turns run at all is itself in conflict: the code runs them when an account resolves (`agent-worker/src/index.mjs`:1457) while the file header (l.34) and the requirement's Status say they do not (M3).
4. **Even running, it could not reach the constructs.** The worker's whole plane reach is `whoami, airun, airunlog, airunspawn, meaningrows, basisversions, search, versionchain, affordances, airuntick, suggest, capturerequest, airunclose` (agent-worker R37): no standard, determination, consequence, clock, local fact, profile or organisation read. The only mode designed to read law, deadlines and consequences is `plan`, which proposes plan options, takes no question, and is `deployed: false` (M1, X140).
5. **The account the design names is the wrong one.** The journeys' setup page "now says 'Claude subscription'" (journeys §6), but the worker authenticates with `x-api-key` (`model.mjs`:43), i.e. an Anthropic API key billed per use; and Anthropic does not permit products to route requests through Free, Pro or Max subscription credentials (https://code.claude.com/docs/en/legal-and-compliance).

**Why.** (a) Sequencing, deliberately: the investigative session was built first and CHECK-first (DEC-55, D-199); DEC-27 was enacted as "nothing queued yet: S12 and its wizard are parked"; the member interface is frozen awaiting the redesign (K633), whose step 5 brings "the assistant panel early (its back end is built and waits on design)". (b) Doctrine: measure before widening (D40; ASSISTANT-PILOT §7), and `investigate` waits on CHECK's first live run verified on a deployed copy (VF-4, DS-4). (c) Deployment: sovereign instances hold their own keys (D201) and the installer never invents a credential (DS-3), but nothing yet carries a group's key in. (d) The constructs themselves: the plane "encodes no law's rules" and the assistant holds no copy of any (X74), and law, time and calculation live in layer 9 with no member surface and no AI path (X23, X191). Bob's sense of the product is right — DEC-27 *is* his plain-language assistant — but it exists as a ruling and a design over a built checker, not as something a member can use.

### 3.2 Per module

| Module (layer) | Provides for QUESTIONS | Built | Reached by a member (op · screen) | AI |
|---|---|---|---|---|
| query-language (5) | the typed grammar; dropped arms widen with a warning (R2, R5); order never a score (R11) | yes | via `search` · search screen | the worker writes `q` |
| retrieval (5) | four-level statement and `says` (R13–R16); `passage:` content grain; frontier (R35–R49); hidden reads as absent (R29) | yes | `search` 24, `meaningrows` 4 UI calls; **`frontier`, `contentaxis` 0** | `search`, `meaningrows` |
| observation-log (5) | levels, look states, missing-row causes (R1–R12); leads (R14–R21); a member's searching writes nothing (R24) | yes | lead ops 0 | run looks (ai-runs R12) |
| entities, progressions (5) | offices, aliases, three relations; overdue/missing findings | yes | partly (subjects screen; progression screen) | read only through `meaningrows` |
| run-rules, ai-runs (6) | modes and deployment (R9, R13, R14, R40); run object, bounds, lens at open, surfacing (R25–R27) | yes | `airunopen` in the member session set, **UI 0** | the run |
| run-productions, capture-requests (6) | `suggest`, EXTRACT proposals; the AI requests, the daemon fetches | yes | UI 0 | yes |
| skills (6) | the pack: `four_level`, absence by level (R19), five prohibitions, judgement boundary (R14–R16), action/filing/wizard layers | yes, rendered in production | no (served to the worker) | instructs the model |
| agent-worker (6, fleet) | deterministic table, model turns, cascade member → project → instance | built; not deployed; 3,766 lines | no | is the AI |
| intent (7) | discovery loop; `workObjective` opens a run on an objective's gaps | yes | **18 ops, UI 0** | no objective handling in the worker |
| standards, conformance, consequences, action-clocks, local-facts (9); jurisdictions (1) | law in force at a date, determinations, computed parts, deadlines, holidays, profile facts | yes | **UI 0** (jurisdictions `profiles` 0) | only `plan` mode reads some; not deployed |
| affordances, op-declarations, control-plane (11) | the published vocabularies and refusals the assistant relays (DEC-8, DEC-49); the pack; `surfaced_by: agent` | yes | `affordances` 3 sites | pack, fences |
| wizard-scripts (11) | scripts with no AI and no key; labelled drafts; `wizardcheck` serves an `ai` credential | yes | UI 0; screen registry and library empty | `wizardpropose` |
| civicos-ui (legacy) | no panel; reads one run by id | — | — | — |

**Place on the ladder.** *Built:* L0 in full, the substrate of L1 (retrieval's envelopes, the pack's four-level layer, the worker's translation of intent into queries) and a slice of L4 (the CHECK run) — no level complete above L0. *Usable by a member today:* **L0**, and on deployed copies no AI of any kind.

## 4. Gaps

| Need | Missing capability | Severity |
|---|---|---|
| all (A–K) | a member entry: the panel and tag (DEC-90), INTERPRET with its shown reading and one clarifying question, voice with correction (UC-093) | **blocks core** |
| all | a running assistant: deployed worker, a group's API key carried in by install and update, a dispatch that starts a member-requested run at once (today only wakes, only organisation runs) | **blocks core** |
| A1–A4 | a read-only `ask` mode with FIND end to end: reads → cited answer with level (ASSISTANT-PILOT §7 step 4) | **blocks core** |
| A, D–H | an answer contract the plane checks: citations that resolve under the asker's view, numbers and dates traceable to sources, the level statement, bound and withheld lines | **blocks core** (without it L1 repeats the failure modes in §1) |
| B1–B2 | the wizard screen registry and the Civicsmith script library (empty) | degrades core |
| C | licence for the panel to suggest questions or claims from the member's material (DEC-27 limit 2 stands for the pilot; DEC-60's licence is the session's) | degrades core (§8 D7) |
| D1–D3 | law reachable by the assistant (standards reads under an `ai` read scope); law structure (sections, definitions) and the ordinance itself often not held; a "not held → find it" path | **blocks core** |
| E1 | a deadline service the plane computes for any question, not only inside a sent filing (`computeDeadline` has no op; `clockPropose` runs only inside `filingsent`); zone, holidays and roll-forward right (M1: weekend hard-coded, UTC, `time_zone` unused) | **blocks core** |
| E3, F | a meeting model; holders of offices over time; "reports to", "contracts with" | degrades (regular) |
| G | any court-case object or docket read | nice to have for QUESTIONS (COURTS' gap) |
| H | arithmetic over cited figures before a determination; dataset calculation | degrades (regular) |
| I | the backward question (D-165, deferred) | degrades (regular) |
| K | routing a question to a member by declared expertise (data exists, no queue or telling) | nice to have |
| all | spend: no token or money accounting anywhere (M3 grep); a group cannot see what asking costs | degrades |
| all | the setup account fact is wrong (subscription vs API key) | **blocks core** (setup would fail) |
