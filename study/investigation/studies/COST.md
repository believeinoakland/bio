# Study A-COST: bounds, cost and trust of an autonomous investigation

Unit A-COST, phase 2 (`PROTOCOL.md` §A). Scope: run budgets, depth and breadth limits, the plan meter, cost per investigation estimated from the problem set, what runs unattended and what runs at a member's act, who pays, the deployment order of run modes, evaluation, and failure modes (hallucinated facts, runaway runs, bias, privacy of the people investigated).

Sources: `RESUME.md`, every `notes/*.md` and every `research/*.md`, read whole. Product claims cite a note and, through it, the product (`notes/M2.md` §3.2 → `run-rules` R19). Prices cite the Anthropic price table as held by the `claude-api` skill (cached 2026-09-25). Anything I infer is marked *(inference)*. Status words follow PROTOCOL rule 3: built, specified, planned, absent.

**In one paragraph.** The substrate already bounds each AI run tightly. It has eight bounds, a pass limit of 3, a one-hour lease, a table that decides control, and one exit. It records every look, and every model call is paid by the member whose act started it. What it does not have is any bound, meter or measure *above* the run. An investigation is many runs over weeks, often by several members, and nothing totals what it costs, shows that cost to anyone, or tests whether the engine's output is right. Run cost has never been measured; only `check` is deployed and it has not yet run live. My recommendation adds no new trust boundary. It has five parts:

1. a per-member **investigation allowance**, held on the investigation's home and drawn down by the runs that member starts;
2. a **plan meter** that shows progress and spend side by side and never merges them;
3. estimates **before** the act and actual cost **after** it;
4. **test investigations** built from the problem set, which gate each run mode before it is deployed;
5. a short list of **fences** for privacy and runaway spend.

The decisions this needs from Bob are listed in §8.

## 1 · The need

### 1.1 What the problem set demands of cost and bounds

The problem set's scale varies "by two orders of magnitude: S10 is days and a dozen documents; S2 and S11 are years and hundreds. The design must make the small case trivial and the large one sustainable" (`notes/P0.md` §2 obs. 6). Its members are volunteers: the system must be "genuinely useful to one person with a few hours a week" (DR2, `notes/C1.md` §1.2). Four properties follow *(inference)*:

| need | why | scenarios |
|---|---|---|
| **A long investigation must not cost unboundedly.** Iteration is driven by arrivals: "most of an investigation's life is waiting" (`notes/P0.md` obs. 5). Each production batch, agenda or report re-plans. | Spend accrues per arrival, for months. | S1 (6+ months to DSA certification), S2 (years, each budget cycle), S11 (monthly PMOC reports, years), S7 (rate cycles of 3–5 years) |
| **The member must know the cost before acting, and what was spent after.** | A volunteer's own subscription or key pays (§3.4). A member who runs out of usage mid-investigation loses the thread. | All; sharpest in S2, S11 |
| **The small case must be cheap enough to try.** | DR2; the first use decides whether a member comes back. | S10 (days, a dozen documents), S14 (days, deadline-driven) |
| **Work that cannot wait must still happen when nobody is looking.** | Deadlines bind the member too, e.g. S14's cure-and-correct window, measured in days. Records clocks run (CPRA 10+14 days, SB 1421 45 days). | S1, S2, S4, S12, S14 |

### 1.2 What the problem set demands of trust

| failure the member must be protected from | scenario evidence |
|---|---|
| **A fabricated fact presented as found.** Example: a completion date "from the contract" that no captured page states. | S1 turns on dates and amounts in contracts, change orders and status reports. S8 turns on contribution dates against a vote. One wrong date reverses the answer. |
| **A self-serving official account taken as true.** | "Both sides' accounts are self-serving" (S1). WCCUSD status reports "greatly understated actual spending" (`research/B5.md` §3 item 3). |
| **Anchoring on the first explanation.** | Every scenario has 3–5 live explanations, "often several true at once", and "the government's own explanation is always one of them, never the default" (`notes/P0.md` §2). |
| **Harm to people named.** | S4 (a named officer), S5 (owners behind LLCs), S8 (donors, spouses, employees), S12 (masked case records of named parties). "Heavy DR6 obligation: named people, precise claims, no insinuation" (S8). SLAPP risk (§2). |
| **Silent spending or silent stopping.** | A run that stops at a bound must say where. "Not found" must be told apart from "did not finish looking" (`notes/C6.md` §2 row 17). |

### 1.3 Bob's words

Bob asks for an engine that "starts digging", with "the machine proposes and a member accepts" (`RESUME.md`). The tension at the centre of this study is between *digging* (autonomous, ongoing) and *the member in the loop* (every consequential step a member's act). Cost and trust are where that tension is settled.

## 2 · Best practice that applies

| practice | what it says | source |
|---|---|---|
| **Effort scaling written into the planner** | A simple fact-finding query gets one agent and 3–10 tool calls; complex research gets 10+ subagents. Multi-agent research used ~15x the tokens of a chat; "token usage alone explains 80% of the variance" in performance. | `research/B4.md` §1.1 (Anthropic multi-agent research) |
| **Stopping conditions and checkpoints** | Use "stopping conditions (such as a maximum number of iterations)" and pause "for human feedback at checkpoints". Add agentic structure "only when simpler solutions fall short". | `research/B4.md` §1.1 (Building effective agents) |
| **Show the plan, and the budget, before spending** | Gemini returns an editable research plan before executing. Lesson 24: "the member told the budget when approving the plan". | `research/B4.md` §1.1, §4 l.1, l.24 |
| **Cheap reading before expensive reading** | Structure, then gist, then targeted lookup (PDFTriage, ReadAgent). Evaporate saves 110x tokens on repetitive collections. Below ~200k tokens, read the corpus whole with caching. | `research/B4.md` §1.3, §4 l.7, l.11, l.25 |
| **Durable, resumable long runs** | Resume from checkpoints; "minor system failures can be catastrophic for agents"; full production tracing. | `research/B4.md` §1.1, §3 |
| **Proportionality** | Weigh each action's "likelihood, size, cost" and the volume it will generate before raising it (MIM §2.3.5.2). "A fair investigation does not mean an endless investigation" (APP §9). Reasonable, not exhaustive (FRCP 26; Sedona 6). Investigative Maintenance when no viable line remains. | `research/B2.md` §1.1, §3, §4 l.11–l.12 |
| **More information is not more accuracy** | Beyond the minimum, extra information raises confidence, not accuracy. Collect what *discriminates* between hypotheses. | `research/B3.md` §1.1 (Heuer ch. 5) |
| **Phases with time-bound objectives** | "Inability to achieve the objective within the timeframe should prompt re-evaluation of whether further investment … is justified" (AFP). SBI sets a worst/minimum/maximum outcome bracket and a weekly review where "time and cost also count". | `research/B3.md` §1.7; `research/B1.md` §1.1 |
| **Evaluation from real tasks** | Start with 20–50 real tasks. Grade outcomes, not paths. Combine code, model and human graders. Calibrate model judges against people. Separate capability evals from regression evals. Measure pass^k. Read transcripts. | `research/B4.md` §1.6, §4 l.26–29 |
| **Fact-level grounding measures** | Atomic-fact precision (FActScore) and citation precision/recall (ALCE, AIS). Generative search supported only 51.5% of sentences, and 74.5% of its citations were correct. | `research/B4.md` §1.5 |
| **Errors originate early** | ">57% of source errors … arise early (in planning) and cascade". Agents show an anchor effect and silently drop user restrictions (PIES). | `research/B4.md` §1.5, §3 |
| **Automation bias** | Reviewers over-rely. Explanations help only when they lower the cost of verification. Self-reported LLM confidence is overconfident. | `research/B4.md` §1.4 |
| **Machine review needs validation** | TAR: humans set the scope, the machine ranks, validation is by sampling, exclusions are recorded, and context-dependent calls stay human. | `research/B2.md` §1.2, §4 l.13 |
| **Flags are noisy until validated** | "If 90% of processes are flagged, the indicator is probably producing false positives"; flags are leads, never findings. | `research/B5.md` §1.5, §3 |
| **Bias controls for lone investigators** | Citizen investigators are most exposed to bias; remedies are second review and active disproof. Equal verification effort for every side. | `research/B1.md` §1.2–1.3, §4 l.16 |
| **Private-person aggregation** | OpenAI names aggregation of personal information as a risk, mitigated by policy, a blocklist and evals. ICD 203: PII "only as it relates to a specific analytic purpose". Refuse dossiers on private individuals. | `research/B4.md` §1.1, §4 l.22; `research/B3.md` §1.5, l.22 |
| **Prompt injection** | Fetched documents "blur the line between data and instructions". Do not let the agent construct arbitrary URLs. | `research/B4.md` §3, §4 l.21 |

## 3 · What the substrate already provides

### 3.1 Bounds on one run (built)

| bound | value or rule | state | citation |
|---|---|---|---|
| `RUN_BOUNDS` | `fetches, subsessions, wallclock, runtime, mints, surfaces, proposals, lease`; each is declared with an allowance and counted up only; `lease`, `mints`, `surfaces` and `proposals` are counted by the plane | built | `notes/M2.md` §3.2 (`run-rules` R1, R3, R13); `notes/C6.md` §2 row 18 |
| lease | 3,600,000 ms, extended by each tick; a run nobody drives ends by lease and bounds; the reaper closes it | built | `notes/M2.md` §3.1 (`ai-runs` R15–R18); `notes/C4.md` §2 D33 |
| pass limit | 3 passes; `stopBecause` on `fetches`, `subsessions`, `wallclock`, then the pass limit | built (code); met-marks pending | `notes/M2.md` §3.6 (`agent-harness` R3) |
| fan-out | four sub-sessions per pass (meaning, content, document, internet) | built | `notes/M2.md` §3.5 (`agent-worker` R17) |
| segment and conversation | 120 turns per segment by default, plus a bytes bound; `maxTurns` 12 per conversation | built in code | `notes/M2.md` §3.7 (`agent-model` R6; `agent-worker` R7) |
| ask | `turns` 12, `bytes` 1 MiB, `wall_ms` 180 s, `reads` 40 (provisional) | built in code, undeployed | `notes/M2.md` §1.1 (`run-rules` R17) |
| report contract | a sub-session returns ≤500 characters with ≤20 citations; `meaningrows` ≤50 rows a call; every cited address is re-read by the parent | built | `notes/M2.md` §3.5, §3.6 (`agent-harness` R5; `agent-worker` R19) |
| `explore` | depth 8 (10 on request), fan-out 1,000, 5,000 nodes, a time budget; ends as `truncated`, `undetermined` | built | `notes/M1.md` §1.13 (`explore` R5) |
| table decides | no model judgement sets "the mode, the step, the pass count or limit, the budget, a bound, the run, the namespace or the target"; doing so is `JUDGEMENT_OVERREACH` | built | `notes/M2.md` §2 (`agent-worker` R39; `agent-harness` R4) |
| one exit | a terminal log entry rolls up the search state | built | `notes/M2.md` §3.1 (`ai-runs` R13, R14, R31) |
| conditions recorded at open | principals, skill version, bias lens, standard pair, bounds; "never derived later" | built | `notes/M2.md` §3.1 (`ai-runs` R10, R32) |

Most of what any run reaches is therefore bounded at least twice: by the run's own bounds and by the read it calls.

### 3.2 Cost accounting (built in code, unmeasured)

- Every outcome carries `usage`; "a figure the provider did not state is `null`, never 0" (`agent-model` R5).
- `ai_usage` holds counts per member, per day, per mode. It is admin-only and holds no content (`ai-runs` R48–R52, specified T33-50; `notes/M2.md` §3.1).
- Each member sets their own daily ceiling. An administrator may set a lower copy-wide ceiling (`ai-runs` R50; `credentials` R22–R26).
- `cache_control` is set on the system prompt, the tools and the resident pack layer (`agent-model` R4).
- Every mode uses `claude-opus-5`, "provisional … until M-Q9 measures the cheapest" (`notes/M2.md` §3.7).

**Nothing has been measured.** The Capability Ladders say: "Runs (CHECK, investigate, plan) spend the starting member's own account and are not yet costed". The one figure they give is for an ask: "API-key per answer at 60–150k input tokens ≈ $0.07–0.46". They also warn that "a conversation re-sends its whole transcript every turn … and may run 12 turns of up to 16,000 output tokens, so a run costs far more than an ask" (`notes/C5.md` §1.9, Q4). M-Q1, M-Q2, M-Q6, M-Q7 and M-Q9 run after T33's release (`notes/M2.md` §1.1).

### 3.3 Who starts work (built, doctrine)

- "An AI run or ask starts only at a member's act, with one exception: the AI half of a member-authored standing question" (`run-rules` R18; K1481). The exception is narrow: read-only, run only when a saved search finds something new, and with no "fan-out to outside sources" (`notes/C5.md` §1.9, Q5). It is built switched off until a 150-question bar is met (`notes/M1.md` §1.10, `answers` R15–R21).
- A woken resume *continues* a run; it does not start one. A run with completed capture requests is re-dispatched (`ai-runs` R16–R18), but model turns still need the starting member's account (`agent-worker` R57; D-260, `notes/C2.md` §1.3).
- Mechanical work runs unattended: monitoring, named requests, ratified sweeps, scheduler consumers. They do "nothing it composes and nothing it decides" (`notes/C4.md` §1.1 (ID §6); `notes/M3.md` §2.21–2.22).
- Extraction is targeted: "only at a member's request for a basis or claim, or by a member's act scoped to a body and period; never a sweep" (K1468, `notes/C5.md` §2).
- Opening a run on a project's objective is a **reasoned** act. "Its reason field opens in place with the run's budget and scope shown beside it" (`workobjective`, DEC-88; `intent` R18; `affordances` R31; `notes/D1.md`). This is built, but the worker does not yet read the objective (`notes/M2.md` §3.16).
- A blanket direction "within a named investigation scope" ratifies every gathering request inside that scope (`notes/C4.md` §1.1, ID §6). It is **absent** from the module requirements.

### 3.4 Who pays (ruled)

- "There is no group-wide or project-wide Claude account (K1502)". Each member's own subscription or API key "serves only that member's own asks, runs and standing questions". "A run is never continued under another member's account or a group's" (`notes/M2.md` §2; `credentials` R26; `agent-worker` R57).
- K1547 requires a version of the product without AI (`notes/C6.md` §3.2).
- The "group's key" survives only for **outside services**. The group may hold keys for services such as CourtListener, off by default, and "a fee-bearing record is reached only by a member's own act with their own credential (K1449)" (`credentials` R29; `notes/M2.md` §3.10).
- Paid people-search is allowed only by a member's own act on their own account, never bulk-imported (K1492; `sources` R16–R18).
- Spending on outside services is Bob's: external OCR is "NOT FUNDED"; "DEC-35's word still governs spending" (DEC-74, `notes/D1.md`).

Two places still describe a group key and are stale against K1502 *(inference)*:

- DEC-120 says the assistant plans flows "where a group has set a key" (`notes/D1.md`).
- The design journeys say "key set once for group, project or member", and the HANDOFF describes a "member → project → group key cascade" (`notes/D2.md` §1.2, §1.4).

### 3.5 What the member sees of spend (built: nothing)

"The budget is recorded and never SHOWN" (F11). There is "no member-facing budget at launch and no live spend" (`notes/C2.md` §1.3; `notes/C6.md` §1a). The `workobjective` act shows "budget and scope" beside the reason field (DEC-88). That is a *bound*, not spend.

### 3.6 Deployment order (built)

`DEPLOYMENT_SEQUENCE.order` = `check, investigate, extract, plan`, with `ask` deployed apart. "Each later mode only when a well-formed `verification_recorded` is held for every mode before it … the chain that enables `investigate` is the record's, never a parameter". "Enabling a mode is an edit to `MODES` under review" (`run-rules` R9, R14, R16, R19; `agent-worker` R42).

Today `verification_recorded` is `null`, so `DEPLOYED_MODES` = `["check"]` (code-checked, `notes/M2.md` §3.2). VF-4, the first live CHECK run, follows T33's close. Q4, "the question-to-run hand-off", is held until `investigate` is live and run cost is measured (T33-D5; `notes/M2.md` §1.1).

### 3.7 Instruments and gates that measure the machine (built or ruled)

| instrument | what it is | citation |
|---|---|---|
| empty runs | "a run that never comes back empty is manufacturing"; the `level-empty` suggestion makes an honest empty run countable | `notes/C6.md` §1a (IS §15) |
| ratios | accepted-to-suggested ratio; rejection pattern; minted-to-cited ratio ("if it never falls, the assistant is manufacturing citable-looking passages") | IS §15; AR `:133` (`notes/C2.md` §1.3) |
| acceptance rate per kind | "a rate near all is the signal that recommendations have become decisions"; built for contradictions, with review due at ≥95% acceptance over ≥30 | DEC-77, DEC-95 (f) (`notes/D1.md`); `contradiction` R39 (`notes/M1.md` §1.5) |
| false-alarm gate | machine signals are shown only below ≤20% false alarms | K1504 (`notes/M4.md` §1.2, §1.9) |
| `calibration` | dated fidelity measurements of a named engine version; "No machine mints a grade" | `notes/M2.md` §3.11 |
| derivation cap | an uncalibrated derivation step has "cap UNDETERMINED, stated, never a letter" | DEC-75 (`notes/D1.md`) |
| pinned prompts | contradiction proposals run under a pinned, measured prompt digest; K5 and K6 are withheld until measured | `notes/M1.md` §1.5 |
| `answers` checks | `ANSWER_CITES_UNREAD`, an unsourced figure, a rule not from the plane, or an absence without a level are each withheld | `notes/M1.md` §1.10 (`answers` R4) |
| measure-first ids | each "measure first" is an `M-<n>` | `notes/C5.md` §1.0 (CL §1) |

### 3.8 Trust fences already in force

- **Closed book.** The runner's only egress is `api.anthropic.com`. It "reads no file, page or address a tool did not relay" (`agent-runner` R10). No rule or fact may come from the model's own knowledge (K1474) (`notes/M2.md` §3.8).
- **Untrusted data.** "examining sessions treat collected material strictly as untrusted data, never as instructions" (ID §4, `notes/C4.md` D7).
- **Grades.** No machine mints a grade. A proposed reading is computed at most B (`extraction` R42). Hypotheses are never legs (`notes/M1.md` D4).
- **Bias.** "The search half of a run never receives the lens" (`ai-runs` R34). Bias debt is disclosed (`notes/M2.md` §3.13).
- **Privacy.** Personal sites and login-gated platforms are captured only by a member in their own browser (`capture-requests` R46). There is "never an unattended crawl of a person" (`monitoring` R15). No bulk import of addresses or phone numbers, and they are never published (K1485, K1493). There is no score, "knows" or "conflict" on a person (`people` R29). People are named only where their documented act bears on the finding (DR6/K1483). Hidden projects answer as absent (DEC-36; DEC-85 forbids leaking another project's work).

## 4 · Gaps

| # | gap | evidence | consequence |
|---|---|---|---|
| G1 | **No bound above the run.** Bounds are per run (`RUN_BOUNDS`) and per member per day (ceiling). Nothing totals or limits an investigation. | §3.1–3.2; `notes/M2.md` G7 | Twenty bounded runs over six months are unbounded in sum. A member's daily ceiling is the only brake, and it is blind to *which* investigation is spending. |
| G2 | **Run cost unknown.** Runs are uncosted; no live run has happened; the model is provisional. | `notes/C5.md` §4 item 9; `notes/M2.md` §1.1 | Any budget or estimate is a guess until M-Q6/M-Q9. |
| G3 | **Spend is invisible to the member.** | F11 (§3.5) | The member cannot make the proportionality judgement best practice requires (`research/B2.md` l.12). |
| G4 | **Estimates are absent.** The `workobjective` act shows bounds, not cost. Nothing estimates a plan step. | DEC-88; §3.3 | "The member told the budget when approving the plan" (`research/B4.md` l.24) is impossible. |
| G5 | **The usage unit does not match how most members pay.** `ai_usage` counts calls and tokens per member per day per mode. A subscription member pays in a weekly usage meter, not dollars. | `notes/C5.md` Q0 (subscription via the Agent SDK); `RESUME.md` ("Bob's weekly meter at start: 44%") | A dollar estimate means little to a subscription member *(inference)*. |
| G6 | **Continuity across members.** A woken run resumes only under its starter's account. A group investigation's AI work is a set of per-member episodes. | `agent-worker` R57; `notes/C2.md` G10 | If the member who started work is away or out of usage, the investigation stalls. Nothing hands the *plan* to another member's runs (that is HOME's and PLANNING's). |
| G7 | **No investigation-level evaluation.** The measures that exist are per mechanism (contradiction acceptance, false alarms, extraction fidelity). There is no test set of investigations, no gold answers, no atomic-fact or citation precision, no cost per answered objective. | §3.7; `research/B4.md` l.26–27 | Modes reach deployment on "verified live" (one member-recorded run, `run-rules` R19) rather than on measured quality across realistic cases. |
| G8 | **Test data is thin.** Oakland publishes no contract register or payment ledger, so `committedAgainstPaid` and `reconcile` ship tested on fixtures. School districts are not a covered jurisdiction. | K1506 (`notes/C6.md` §3.2); `notes/M4.md` §1.15 | Bob's own scenario cannot be tested on real data without first capturing a real district's record *(inference)*. |
| G9 | **"Unattended digging" has no ruled shape beyond the standing question.** The standing question is read-only with no fan-out. Accepting a plan does not start its runs. Blanket direction (ID §6) is unbuilt. | §3.3 | Every fetch-and-read step needs a fresh member act, so the engine cannot "start digging" through a multi-step plan. Removing the act entirely would breach K1481. |
| G10 | **Privacy is fenced per act, not per investigation.** No rule stops a run whose *subject* is a private person, as long as each fetch is of a public address. People facts are recordable whenever a cited document states them (K1455). | `notes/C4.md` D14; `notes/M4.md` §1.2 | Several runs together could assemble a dossier on a private individual: the aggregation risk named in `research/B4.md` §1.1 *(inference)*. |
| G11 | **Bias in what is sought is unmeasured.** The search half never gets the lens. But the *planner* chooses what to seek, and inv. 7 requires that a finding cutting against a goal be "surfaced at least as prominently". | `notes/C3.md` §2 inv. 7; `research/B4.md` §3 (anchor effect) | No instrument checks that a planner pursues disconfirming lines (`research/B3.md` l.2–3). |
| G12 | **Acceptance-rate measures are scoped to contradictions.** DEC-77 measures per kind; DEC-68 forbids measuring a member. | `notes/D1.md` §4 items 3–4 | Investigation proposals (plan steps, read facts) have no steering guard yet. |

## 5 · Options

### Option A: per-run bounds only (status quo, plus measurement)

- **Reuses:** everything in §3, unchanged; M-Q measurements after T33.
- **Adds:** nothing structural. Each run's bounds are tuned from measurement, and members rely on their daily ceiling.
- **Doctrine fit:** perfect.
- **Cost:** zero to build.
- **Risk:** G1, G3, G4, G7 and G10 stay open. A volunteer cannot see what an investigation is costing or plan its spend. Runaway spend is bounded only per day, which is a rate limit with no total.

### Option B: investigation allowance, plan meter, test investigations (recommended)

- **Reuses:** `run-rules` bounds and refusal rows; `ai-runs` usage and ceilings (R48–R53); `workobjective`'s budget-beside-reason (DEC-88); `calibration`; `answers` checks; the instruments in §3.7; the observation log; `explore` bounds; the existing privacy fences.
- **Adds:**
  - a per-member allowance on an investigation home;
  - estimates from measured unit costs;
  - a meter read;
  - a shared, aggregate acceptance-rate instrument;
  - a test-investigation harness and corpus (test code, not a product module);
  - three new refusal rows (person subject, exhausted allowance, dossier breadth).
- **Doctrine fit:** keeps K1502 (each member pays their own) and R18 (start at a member's act). It needs one ruling on F11 (show spend), and optionally one on batched authorisation (§8 D3).
- **Cost:** small. It extends existing modules, plus a test corpus and graders *(inference)*.
- **Risk:** estimates are wrong until measured, so they must read "undetermined" until M-Q6 and M-Q9 report. The corpus takes member time to build gold answers.

### Option C: a group or project pool

- **Adds:** a project-level Claude account or a pooled budget that any participant's runs draw on.
- **Doctrine fit:** **reverses K1502 and K1503.**
- **Benefit:** continuity across members (G6).
- **Risk:** the principal problem K1502 removed returns: whose account reasons, who sees what goes to Anthropic. It also creates a shared resource one member can exhaust. Not recommended.

### Option D: a standing autonomous investigator

- **Adds:** scheduled runs that fetch, read and propose on a cadence without a member's act.
- **Doctrine fit:** **breaches** K1481/R18, standing questions' "no fan-out", and K1468's "never a sweep".
- **Benefit:** maximum "digging".
- **Risk:** runaway cost, unattended aggregation about people (G10), and proposals that pile up and nag (DEC-69). Rejected. Best practice also warns against full autonomy for open-ended multi-week work (`research/B4.md` overall shape).

## 6 · Recommendation: Option B

### 6.1 Principles

1. **Bounds nest, and each layer is enforced in code.** A step's bounds sit inside a run's bounds, which sit inside the member's investigation allowance, which sits inside the member's own daily ceiling, which sits inside the administrator's copy-wide ceiling. Every layer is plane-checked, and the model sets none of them (agent-worker R39 extended).
2. **Cost is told twice: estimated before the act, and actual after.** The estimate is a range or "undetermined"; it is never a made-up figure (UNDETERMINED doctrine; `agent-model` R5 "`null`, never 0").
3. **Progress and spend are two measures, never merged** (DEC-82: "letters grade evidence, bars show progress"). The meter shows both side by side.
4. **Cheap before expensive.** The order is: mechanical search; then structure-first reading; then targeted reading; then a search run with fan-out. The planner's proposals carry an effort tier (`research/B4.md` l.24–25).
5. **No new trust boundary and no new payer.** K1502 holds. The allowance is a member's own limit on their own account for one investigation.
6. **Measure before widening.** No mode or production kind is deployed until its test-investigation bar is met (CL §10 D40; `run-rules` R19 extended).

### 6.2 Modules and services

All of these sit in existing modules, in layer order, so there is no layer change.

| module (layer) | change | services (one sentence each) |
|---|---|---|
| `run-rules` (6, pure) | new vocabulary | `ALLOWANCE_UNITS`: `usage` (the provider's `usage` figures) for an API key, and `meter_share` for a subscription. `estimateStep(kind, size, unitCosts)` returns `{low, high, unit}`, or `undetermined` with the reason "not measured" until `unitCosts` cites an `M-<n>`. New refusal rows `ALLOWANCE_EXHAUSTED`, `RUN_SUBJECT_IS_PERSON`, `DOSSIER_BREADTH` (§6.5). The deployment chain gains a second condition: `eval_recorded` per mode (§6.4). |
| `ai-runs` (6) | allowance store and draw-down | `allowanceSet({home, member, amount, unit, until?, reason})`: the member's reasoned act (rung: reasoned, DEC-88). `allowanceOf({home, member})` returns set, consumed by mode and by run, remaining, and `undetermined` when a provider figure is `null`. At `airunopen`, a run on a home names the allowance and refuses `ALLOWANCE_EXHAUSTED`. Each `airuntick` debits from `usage` (R48 already records it). `runCost({run})` gives the actual after close, shown to the paying member only. |
| `ai-runs` (6) | meter read | `investigationMeter({home, viewer})` composes, at the read, writing nothing: (a) progress, from `intent.progress` and plan-step dispositions; (b) spend against allowance for the viewer's own allowance only (other members' spend is shown only as "other members' runs: N runs", never their amounts, *(inference from DEC-68 and K1502's per-member principal)*); (c) the viewer's daily ceiling state; (d) pending waits (DEC-98). It never computes one combined figure. |
| `run-productions` (6) | acceptance measure, generalised | `acceptanceRates({kind, window})` per production kind (suggested version, proposed reading, plan step, capture request), **aggregate across members, never per member** (DEC-68). Review is due at ≥95% over ≥30, the threshold `contradiction` R39 already uses. Also the minted-to-cited and accepted-to-suggested ratios (IS §15; AR `:133`). |
| `calibration` (4) | register AI readers | An AI reader (purpose-guided EXTRACT, per A-READING) is a named derivation engine with a version and a probe set. Its proposals carry `cap: undetermined` until a calibration is recorded (DEC-75). The test corpus (§6.4) supplies the probes. |
| `skills` (6) | effort tiers in the pack | A disclosed layer `effort` states the effort tiers (lookup / read one document / search run) and how each maps to run bounds. The text quotes canon only (`skills` R21), so canon wording must be ruled first. The fence is still code (`skills` R24). |
| test harness (not a module; `bio-plane/test/investigations/` or similar) | test investigations | A frozen corpus per scenario, member-authored gold answers, graders, and a cost ledger (§6.4). |

**What each member sees, and where.** Three places, all inside the product and none pushed (DEC-94):

- At the act (`workobjective`, plan acceptance, opening a read or search run): the estimate beside the bounds and the scope (DEC-88).
- On the investigation home: the meter.
- When a run ends: its actual cost, told once, with the closing summary (DEC-69: inform at the act, once).

When an allowance runs out, the queue shows one item ("Allowance for <home> used; runs stopped at <step>"). It is a CONDITION, told once (DEC-70) *(inference: queue class per DEC-110)*.

### 6.3 What runs unattended and what runs at a member's act

| work | who starts it | AI? | cost borne by | basis |
|---|---|---|---|---|
| monitoring a watched document, sweeps, named requests, overdue marks on action clocks, duty occurrences | the scheduler, unattended | no | the instance's hosting | ID §6; `monitoring` R28, R33; `link-sweep` |
| a woken run resuming after its captures complete | the scheduler continues a run a member started | yes, within that run's bounds and allowance | the starting member | `ai-runs` R16–R18; `agent-worker` R57 |
| a standing question: saved search re-run; AI half only on something new; read-only; no fan-out | the member authors it; then it runs unattended | yes, read-only, when switched on | the author | K1481; `answers` R15–R21 |
| an ask (read-only Q&A, at most one clarifying question) | a member | yes | that member | `answers`; `run-rules` R17 |
| intake interview, planning proposals, purpose-guided reading, search runs with capture requests, re-planning on an arrival | a member's act: `workobjective`, opening a run, or (if ruled, §8 D3) accepting a plan batch | yes | that member, from their allowance | R18; K1468; DEC-88 |
| fee-bearing records, paid people-search, keyed outside services | a member's own act with their own credential | no | that member, or the group's key for outside services | K1449; K1492; `credentials` R29 |
| outward acts (send a records request, file, publish) | a member, always; never machine | no | — | D33 (`notes/C1.md`); ACT §4 r7 |

**Re-planning on arrival** is the one place where "digging" meets R18. A production batch arrives unattended. The scheduler may then raise **one** queue proposal: "N new documents arrived for <home>; re-plan? estimated <range>." The member's adopt is the act that starts the run (§8 D3 widens this to accepting a plan batch). This keeps "most of an investigation's life is waiting" (P0 obs. 5) free of AI spend: waiting costs nothing *(inference)*.

### 6.4 Evaluation: how we know the engine is good

**Test investigations.** Build from the problem set (`notes/P0.md` §1), following `research/B4.md` l.26 and its "20–50 tasks drawn from real usage". Three tiers:

| tier | corpus | gold | purpose |
|---|---|---|---|
| T-small (≈10 tasks) | S10-like: one frozen dataset plus a few district notices; S14-like: an agenda with posting timestamps | gold facts, expected UNDETERMINEDs, expected documents | regression on every change; cheap enough to run each time |
| T-founding (≈10 tasks) | **S2, the sewer-fund case**, already held in the record with its CPRA history (`notes/C1.md` §1.1) | the founding case's own published facts as gold | real Oakland material the product already captures |
| T-rebuild (≈10–20 tasks) | **S1-like**: a real California district's school rebuild, captured whole and frozen (board packets, bid tab, contract, change-order ratifications, CBOC reports, DSA tracker pages). B5 names the public sources (`research/B5.md` §1.1). | gold chronology (promise vs contract vs forecast), money table, change-order list, explanation-to-document map (`research/B5.md` §1.6) | Bob's scenario end to end; this needs a jurisdiction profile for the district (`notes/M4.md` §1.15) |

**Gold answers are authored by members** (Bob or a group), never by a model. They are recorded as an ordinary project of the test copy, so the gold is itself a graded record. Closed-book doctrine applies: the model's knowledge is not gold (K1474).

**Measures.** Each is defined in the harness and recorded as an `M-<n>`:

| measure | definition | why | source |
|---|---|---|---|
| atomic-fact precision | share of *proposed* facts (dates, amounts, parties, terms) that match a gold fact and quote a span that says it | the hallucination measure | FActScore, `research/B4.md` §1.5 |
| citation precision / recall | share of citations whose cited span supports the claim / share of gold facts found with a citation | grounding | ALCE, AIS |
| honest-absence accuracy | where gold says UNDETERMINED or "nobody looked", does the engine say so at the right level (not "none")? | D-129 vocabulary; `answers` R4 | `notes/C6.md` §2 row 17 |
| expected-document coverage | share of the scenario's expected document kinds found, or a records request drafted for them | planning quality; the CoST proactive/reactive checklist | `research/B5.md` L3 |
| explanation coverage | for each live explanation in gold, is it held, and is the evidence for and against it surfaced (not only for)? | bias; inv. 7 | `research/B3.md` l.2; `research/B4.md` l.5 |
| constraint survival | the member's stated constraints at intake (district, period, which promise) still hold in the plan | PIES "implicit planning" failure | `research/B4.md` §1.5 |
| cost per answered objective | allowance units consumed per objective closed in gold, with the distribution per tier | proportionality; feeds estimates | `research/B4.md` l.24 |
| pass^k | the same task run k=3 times reaches the same accepted facts | members rely on repeatability | `research/B4.md` §1.6 |
| refusal correctness | person-subject and dossier probes are refused; injection probes in documents are ignored | privacy, injection | §6.5 |

**Graders.**
- *Code graders* check spans, dates and amounts against gold.
- *A model grader* is used for explanation coverage only, calibrated against two members' judgements on a sample (`research/B4.md` l.28).
- *Humans read transcripts* of a sample. They are test-copy transcripts, so DEC-61's device-local rule does not bind test traces *(inference; confirm, §8 D5)*.

**Gate.** A mode or production kind deploys when two conditions hold:
1. `verification_recorded` holds (unchanged, R19).
2. `eval_recorded` names an `M-<n>` result over its tier at or above a bar.

BOB sets each bar, as CL §6.4 already provides ("investigate deployed, with stage-1 acceptance above a bar BOB sets"). The live instruments in §3.7 then watch deployed behaviour: acceptance rates, minted-to-cited, empty-run rate, false alarms.

### 6.5 Failure modes and their fences

| failure | fence already built | added here |
|---|---|---|
| **Hallucinated facts** | Closed book (K1474; `agent-runner` R10). Reports re-read every cited address (`agent-worker` R19). `ANSWER_CITES_UNREAD` (`answers` R4). Proposed readings are graded by rule at most B (`extraction` R42). No machine mints a grade. A capture is not evidence until a member cites it. | Atomic-fact and citation precision as deployment gates (§6.4). AI readers registered in `calibration` with `cap: undetermined` until measured (DEC-75). "Retract what cannot be quoted": a proposed fact with no span is not proposed (`research/B4.md` l.18). This belongs to A-READING's contract; it is listed here as a gate. |
| **Runaway runs and runaway spend** | Eight bounds, pass limit 3, lease and reaper, the table decides, `JUDGEMENT_OVERREACH`, one exit, daily ceilings. | Allowance per member per investigation (G1). Estimate before and actual after (G3, G4). Re-planning only by an adopted proposal (§6.3). Planner effort tiers. The `out-of-inquiry-lead` routing stays explicit, never inferred (`notes/M1.md` §4 item 13), so leads cannot fan out into new runs by themselves. |
| **Anchoring and confirmation bias** | The lens never reaches search (`ai-runs` R34). Hypotheses are never legs. The machine cannot hold a hypothesis (K1473). Aspirations never filter evidence (`intent` R21). | The explanation-coverage measure (§6.4). The aggregate acceptance-rate guard on plan steps (G12). In the plan: at least one line of enquiry per live explanation, including the official account and benign ones (`research/B3.md` l.2; `research/B5.md` L8). That design is A-PLANNING's; the measure is here. |
| **Automation bias in members** | Approval is the act; no read-surveillance (DEC-68). The review surface shows the source, not only a summary (ID §3 F4). | Per-fact acceptance with the span beside the claim, never per report (`research/B4.md` l.14, l.16). Bulk acceptance stays enabled, never forced (DEC-69), and crucial items are not batchable (DEC-97). The ≥95% acceptance-rate review covers the rest. |
| **Prompt injection from documents** | Closed book; untrusted data (ID F5/F6); the runner has no web or file tool. | Injection probes in the test corpus (§6.4). |
| **Privacy of people investigated** | DR6/K1483 (named by documented act). K1485/K1493 (no bulk addresses or phones; never published). `people` R29 (no score or "conflict"). `capture-requests` R46 (personal sites by a member's own browser). `monitoring` R15 (no unattended crawl of a person). K1492 (paid search by a member's act). DEC-78 (sources). DEC-85 and DEC-36 (no leak across projects). | (1) `RUN_SUBJECT_IS_PERSON`: no run's subject or objective is a person entity. People are reached only as participants of events, lines and money that concern an organisation, body, contract or proceeding (ICD 203 "only as it relates to a specific analytic purpose", `research/B3.md` l.22). (2) `DOSSIER_BREADTH`: a run may request captures about a person only through lines and events of the run's subject, capped at a small bound (proposed: 5 per person per run). Over the cap is refused with the reason stated. (3) Test probes for both. A private person who is not materially involved (DR6) is never the target of a capture request. |
| **Silent stopping** | One exit with search state; "not found" ≠ "did not finish". | The meter shows "stopped at <bound>" and what remains unlooked, using `retrieval.frontier`'s `never_looked` (`notes/M1.md` §1.15). |
| **Stall when the paying member is away** | None (G6). | The allowance is per member, so a co-investigator sets their own and starts their own runs from the shared plan. The plan and log live on the home (HOME), never in a run's `state`. |

### 6.6 Cost per investigation, estimated from the problem set

**This whole section is inference.** It is an order-of-magnitude model to size the allowance and to choose what to measure first. M-Q6 and M-Q9 will replace it.

**Prices** (`claude-api` skill table, cached 2026-09-25), per million tokens, input / output:

| model | input | output | cache read |
|---|---|---|---|
| Claude Opus 5 (the product's provisional model) | $5 | $25 | — |
| Claude Opus 5.5 | $4 | $20 | $0.20 |
| Claude Sonnet 5.5 | $2 | $10 | $0.20 |
| Claude Haiku 4.5 | $1 | $5 | — |

Cache reads are about a tenth of input elsewhere *(general knowledge)*. Batch processing runs at 50%, but it does not fit interactive runs.

**Unit costs.** Assumptions: a pack and system prompt of about 15k tokens, cached; tool results of about 8k tokens per turn; a conversation re-sends its transcript each turn (CL Q4).

| unit | assumption | Opus 5 | Sonnet-class worker |
|---|---|---|---|
| ask | measured range in CL | $0.07–0.46 | — |
| sub-session (one level, one pass) | ~6 turns; context growing ~8k a turn; ~3k output a turn including thinking | ~$1 (worst case: 12 turns × 16k output ≈ $5+) | ~$0.4 |
| search run (3 passes × 4 levels plus parent judgements) | 12 sub-sessions plus ~8 judgement calls | ~$10–15 typical; ≤ ~$60 at full bounds | ~$4–6 |
| structure-first read of one document | outline plus 2–3 targeted sections, ~30k input, ~4k output | ~$0.25 | ~$0.10 |
| whole read of a long document (150-page contract, ~120k tokens) | quote-first | ~$0.8 | ~$0.3 |
| re-plan on an arrival | plan record plus new facts, ~30k input, ~5k output | ~$0.30 | ~$0.12 |

**Per investigation**, at Opus 5 rates:

| scenario shape | documents | runs over life | estimate |
|---|---|---|---|
| small (S10, S14) | ~12 | 1–2 search runs, 12 reads, 3 re-plans, a few asks | **~$15–40** |
| capital project, months (S1, S3, S5, S6) | 60–150 | 6–10 search runs, ~100 reads (most structure-first), ~20 re-plans, ~30 asks, a standing question's AI half on new items for ~26 weeks | **~$100–300** |
| multi-year (S2, S7, S11) | hundreds | 20+ search runs, 300+ reads, re-plans per cycle | **~$300–1,000+** |

What the estimate shows:

1. **Search runs, not reading, dominate.** They are about 60–70% of the total. The highest-leverage levers are fewer, better-targeted search runs (hypothesis-discriminating search, `research/B3.md` l.1) and a cheaper worker model for sub-sessions (M-Q9).
2. **Structure-first reading roughly triples the number of documents a given allowance covers**, compared with whole reading *(inference from the unit table)*.
3. **For a subscription member the cost is a share of a weekly meter, not dollars.** Before measurement, the honest display is "≈ N search runs' worth" in units the meter can show. G5 is a reason to measure in the member's own unit.
4. **The figures are not affordable for most volunteers at the high end** *(inference)*. That is why §6.3 keeps waiting free, and why the allowance must be visible.

### 6.7 Deployment order of run modes

Keep R19's chain and add the eval gate. Proposed order:

| order | mode or production | needs |
|---|---|---|
| 1 | `check` | live (VF-4) |
| 2 | `ask` (apart) | Q1; the 150-question bar |
| 3 | `investigate`, objective-driven (`workobjective` consumes the objective and its gaps) | T-small and T-founding bars; M-Q6 cost measured; allowance built |
| 4 | `extract`, purpose-guided reading (A-READING) | calibration probes from T-rebuild; atomic-fact precision bar |
| 5 | `plan` (action plans, existing) | its own bar |
| 6 | investigation-planning proposals (A-PLANNING), placed by Bob | the explanation-coverage and constraint-survival bars on T-rebuild |

Rationale: each step consumes the measurements the previous one produced. Reading with purpose (4) is the step most exposed to hallucinated facts, so it waits for calibration. Planning (6) multiplies the cost of everything below it, so it comes last *(inference)*. Moving Q4 earlier than CL's stage 4 is a sequencing decision. It rests on the evidence in `notes/C5.md` §4 item 2.

### 6.8 What is deliberately left out

- **A group or project pool, or a group Claude key** (K1502).
- **Scheduled AI runs** (K1481).
- **A single "confidence" or "quality" score for an investigation** (DEC-44, DEC-82, DEC-89). Measures are reported per measure.
- **Per-member performance or attention measures** (DEC-68, DEC-69). Acceptance rates are aggregate only.
- **Dollar billing or cost allocation between members.** No assignees or costs on plans (`action-plans` R26).
- **Paid external OCR or reading services** (DEC-74). They come to Bob per document and bar.
- **Recording model transcripts as evidence of cost** (DEC-61). `usage` figures suffice.

## 7 · Staging

Smallest useful step first. Each acceptance test is in a member's terms.

| step | delivers | acceptance test (member's terms) |
|---|---|---|
| S0 measure | VF-4; M-Q6/M-Q9: usage per check run, per sub-session, per ask, by account kind; unit costs recorded as `M-<n>` | "After my first check run, BOB can say what one run used, and what a sub-session used, from records, not guesses." |
| S1 tell after | `runCost` shown to the paying member at close (needs D1) | "When my run ends, I see once what it used of my account and where it stopped." |
| S2 tell before | `estimateStep` beside budget and scope on `workobjective` and run open; "undetermined" until S0's figures exist | "Before I start a run, I see roughly what it will use, or that nobody knows yet." |
| S3 allowance and meter | `allowanceSet`, draw-down, `ALLOWANCE_EXHAUSTED`, `investigationMeter` on the home | "I set 'up to 20 runs' worth' for the Grandview investigation; the page shows progress and my spend side by side; when it's used, runs stop and I'm told once." |
| S4 test investigations, tier small and founding | harness, corpus, member-authored gold, the measures in §6.4; the gate on `investigate` | "Before the assistant may dig on my behalf, it has been shown to find the founding case's facts correctly, with sources, and to say 'not found' where the record is silent." |
| S5 privacy and injection fences | `RUN_SUBJECT_IS_PERSON`, `DOSSIER_BREADTH`, the probes | "If I ask the assistant to dig into a private person, it refuses and says why; a document telling it to ignore its rules changes nothing." |
| S6 tier rebuild and reader calibration | captured district corpus; AI-reader calibration; the gate on `extract` | "On a real school rebuild, the assistant's proposed dates and amounts match the documents it quotes, at a rate published on the page." |
| S7 batched authorisation (only if D3 ruled yes) | accepting a plan batch with its estimate starts its listed runs, inside the allowance | "I accept the plan's first five steps with their estimate; they run as documents arrive, and nothing outside them starts." |
| S8 live guards | aggregate acceptance rates per production kind; review at ≥95%/≥30 | "If members accept nearly everything the assistant proposes, someone looks at whether proposals have become decisions." |

## 8 · Decisions for Bob

Policy, requirements and UX only.

| # | decision | recommendation |
|---|---|---|
| D1 | **Show members what AI work costs them** (reverses F11, "the budget is recorded and never shown"). | **Yes.** Show the estimate before the act and the actual after, to the paying member only. A volunteer cannot judge proportion without it. |
| D2 | **Who pays for an investigation's AI work.** K1502 says each member's own account. Alternative: a project pool. | **Keep K1502.** Add a per-member, per-investigation allowance the member sets. Retire the "group key" wording for the assistant in DEC-120 and the journeys; the group's key stays for outside services only. |
| D3 | **Does accepting a plan batch (with its estimate and allowance) count as "the member's act" that starts its runs** under R18 and K1481? | **Yes, bounded.** Only the listed steps, only inside the allowance, never fan-out beyond them; anything new needs a new acceptance. Without this the engine cannot "start digging". With D3 "no", the engine still works, one act per run. |
| D4 | **Deployment order** (§6.7), including bringing investigative runs (Q4) ahead of CL's stage 4. | **Approve** the order: check → ask → investigate → purpose-guided extract → action plan → investigation planning. Each step needs both a live verification and a test-investigation bar. |
| D5 | **Test investigations as a requirement**: gold answers authored by members; test-copy transcripts may be kept for grading. | **Yes.** Bob or a group authors gold for the founding case and one real school rebuild. Test transcripts are kept for the test copy only, never a group's. |
| D6 | **No investigation of a private person.** A run's subject is never a person; people are reached only through the acts of the bodies investigated, with a per-person breadth cap. | **Yes.** It applies DR6 and the aggregation risk to investigations as a whole, not only to single acts. |
| D7 | **The unit members see**: dollars for API-key members, and a share of the weekly usage meter for subscription members, measured in each member's own unit. | **Approve.** Never a made-up dollar figure for a subscription member. |

BOB's own calls, recorded in `build/rulings.md` and not put to Bob: model per mode (M-Q9); the bound values; the eval bars; the `DOSSIER_BREADTH` value; and where the harness lives.

## 9 · Interfaces with the other capabilities

| capability | what COST gives it | what COST needs from it |
|---|---|---|
| **READING** | Effort tiers (structure-first before whole read); unit costs; calibration registration and the atomic-fact gate; "retract what cannot be quoted" as a deployment condition | Readings with spans, so precision is measurable; a declared effort tier per read; a reader engine name and version for `calibration` |
| **PLANNING** | `estimateStep` per proposed step; the allowance a plan must fit; the explanation-coverage and constraint-survival measures; batched authorisation (if D3) | Each proposed step names its kind and size so it can be estimated; at least one line per live explanation; re-planning raised as one proposal per arrival, never self-started |
| **HOME** | The allowance store keyed to the home; the meter read | One home per investigation that runs and allowances can name; the plan and log held there (not in run `state`), so another member's runs can continue (G6) |
| **PROCUREMENT** | Cost figures for a typical capital project (§6.6); the T-rebuild corpus and gold | The expected document kinds per stage (CoST checklist) for the coverage measure; procurement doctypes as calibration targets |
| **LOOP** | What the member is told about cost, and when (estimate at the act, actual at close, one notice on exhaustion, nothing pushed, DEC-94); aggregate acceptance-rate guards | The acceptance surfaces (per fact, with span) whose rates are measured; intake that records the member's constraints so constraint survival can be tested |

## Sources opened

All read whole, first line to last:

- `study/investigation/RESUME.md`, `PROTOCOL.md`, `prompts/A-COST.txt`, `STATE.md`, `units.json` (scopes)
- `study/investigation/notes/P0.md`, `C1.md`, `C2.md`, `C3.md`, `C4.md`, `C5.md`, `C6.md`, `D1.md`, `D2.md`, `M1.md`, `M2.md`, `M3.md` (in two consecutive ranges, 1–425 and 426–516), `M4.md` (in two consecutive ranges, 1–369 and 370–440)
- `study/investigation/research/B1.md`, `B2.md`, `B3.md`, `B4.md`, `B5.md`

Also consulted:

- The `claude-api` skill's model and price table (cached 2026-09-25), for Claude Opus 5, Opus 5.5, Sonnet 5.5 and Haiku 4.5 per-token prices and cache-read prices (§6.6).

Not opened: `prior/constructs-study-synthesis.md` (read for this study through `notes/C6.md`); the product tree directly (cited through the notes).
