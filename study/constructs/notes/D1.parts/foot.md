## Cross-construct observations (connections between constructs these documents make or imply)
1. **Members need law and time during investigation, before anything is published.** Journey 4, which journeys L186 calls "the most common front door", has the member "find the standard the city set itself" (L197) and ask "is the city repairing reported potholes within the time its own policy sets?" (L198), all before any finding exists. §3 sends every entry point (code, contract, court case, regulatory proceeding, budget, dataset) through a standard, a deadline or a docket. The use-case file also files standard, in-force-on-a-date and compliance comparison under functional layer "2 Analysis" (UC-062 to UC-065). As built, though, a determination needs published findings: UC-065 has the trigger "Published findings and standards exist.", and journeyExperience (c) step 2 says "Published findings with frozen pairs". Journeys §6 L528 adds: "The only calculation in the product comes after a breach has been determined." This is direct evidence for the brief's structural observation: the members' work needs LAW, TIME and ANALYSIS before Publication, but the product puts them after it.
2. **TIME is bound to LAW by doctrine, and to the profile by data.** Every deadline carries "the statute, order or commitment it derives from" (audiences L1246; UC-118 "carrying its statute"; (h) "Due date with citation"). Deadlines and holidays come from the jurisdiction profile (J5 step 6; (h) step 1 "The law and its deadline (from the profile)"; (c) "Profile deadlines, holidays"). Overdue is derived and never stored ((h) L1062). Time support stops at action clocks, though. Journeys §6 "Meetings and time" says there is no model of a recurring meeting, days are counted in UTC, and the time zone and office hours are stored but unused. Members' time needs also include claim periods (J6 "over what period"), per-record reported and closed timestamps (J6 step 3), the next agenda (§3 meeting), contract deadlines (§3 contract), a court case's deadlines (§3 L106) and filing deadlines in a regulatory proceeding (§3 L111).
3. **Progressions are an existing time-and-organisation primitive the gap list does not mention.** UC-024 "Declare an expected flow" ("minutes follow a meeting"; "OBLIGATION as declared flow, D-128") and UC-080 ("missing predecessors, overdue successors and over-full stages") are covered (progressions R1-R25, layer 5) and already model how a body is supposed to act over time. UC-031 also offers monitoring "per meeting" cadence. Journeys §6 nonetheless says there is no model of a recurring meeting. An analyst should check whether progressions plus monitoring cadence are the base for meetings, notice rules and recurring obligations.
4. **Organisations live in two places that are not connected.**
   - (a) **The entity registry, layer 5, filled by members.** Offices, funds, programs and people-in-role are registered with aliases and cited relations (UC-018, UC-019, UC-160). It has only three relations (stands in for, is part of, overlaps), no "reports to" or "contracts with", and no record of who held a role when (journeys §6 L533).
   - (b) **The jurisdiction profile, as data.** Counterparties for actions come "by role and body from the profile" ((c) breach action), along with the action kinds and tiers available against an office (UC-117), "venues and legal organisations" ((k) suggestions), and each venue's evidentiary standard (UC-169).
   - Contracts and franchises (§3 L98, L110: "Is the hauler delivering what the franchise requires, and is the city enforcing it?") need organisation obligations (who owes what to whom), LAW (contract terms as standards) and TIME (deadlines) together. None of the three sources gives a construct that joins them.
5. **"Obligation" means three different things in these sources, and none of them is Bob's.**
   - The queue's OBLIGATION, a task addressed to a member (UC-040, UC-041; (d)).
   - "OBLIGATION as declared flow" (UC-024, D-128).
   - "obligation against act", a resolution kind for contradictions that routes to conformance (UC-069, UC-070).
   - Bob's sense, who owes what to whom by when under what authority, has no construct. Analysts must disambiguate.
6. **COURTS is the thinnest construct.** No use case, experience journey or audience follows a court case or administrative proceeding. Courts appear only as places the group's own action goes: Tier 1–2 filings, the Tier 3 counsel packet, venue standards from the profile, stage 7 oversight bodies, and legal theories the AI proposes (UC-116). The journeys add court cases and regulatory proceedings as front doors (§3 L106, L111), but the only support is capturing filings and watching a docket page for changes. §6 "Following a court case": "Nothing tracks a case's filings, rulings and appeals, or links a decision to the rule it interprets." That last clause also ties COURTS to LAW: interpretation of a provision.
7. **ANALYSIS is needed by a new main journey but sits under strict doctrine.** Journey 6 "Check a claim" and the overtime, bond-measure, budget and dataset entry points need computation over datasets. Today the calculation is "the assistant's or a member's, shown with its method… checked by a second member" (L236), and "A built-in, repeatable calculation step may be needed" (L230). Any analysis construct must keep the existing rules:
   - per-axis grades, never one score (audiences L443; UC-053; UC-065 "no significance or score");
   - consequences "never composed into one figure" (UC-112);
   - plans refuse budget, cost and hours keys (OPTION_KEY_REFUSED);
   - machine calculation is labelled as machine work;
   - "Forks at fact or analysis signal a reproducibility issue" (Design Requirement 5, audiences L1163), which implies reproducible calculation for the cross-group rerun (UC-076, uncovered).
8. **Natural-language questions are promised and uncovered.** Journeys 9 and 4, and the wizard "Your first question", promise asking in plain words. But:
   - UC-092 "Ask the assistant in my own words" has no requirement.
   - §6 says "the assistant's flow from a question to a search is designed but not built".
   - Standalone FIND (UC-002), the Context skill (UC-003), Legal/Policy Lookup (UC-004) and the compliance-comparison skill (UC-064) are not modules.
   - Only CHECK is deployed; investigate, extract and plan modes are not (UC-085, UC-087, UC-088, UC-163).

   The canonical combined need is §6 "Explaining a charge or a rule": "What's this sewer maintenance charge on my water bill?". It needs QUESTIONS, LAW (ordinance or rate schedule), ORG (which office) and ANALYSIS (the charge). Doctrine limits how the assistant can answer it. It "Cannot… state a law, determine, file" (audiences L1554), and the refusals include MACHINE_CANNOT_DECLARE_STANDARD and MACHINE_CANNOT_STATE_RECORDS_LAW. So an explaining assistant must offer labelled readings and proposals, never a statement of the law.
9. **Doctrine shapes the organisation model.** Accountability "belongs to the role and institution"; individuals are named "only in official capacity in connection with specific documented acts" (Design Requirement 6, audiences L1259). No private individual may be an addressee (actions R9; ADDRESSEE_REFUSED). Consequences never name an individual (consequences R10). No subject carries an adversarial attribute (UC-018). Any office-holder-over-time model must stay role-centred under these rules. Non-advocacy also limits LAW and ORG work: stage 7 and lobbying only "enforce or restore an existing requirement" (UC-123; Bob's ruling 6), and on ballot measures the group checks claims without campaigning (journeys L100, L118).
10. **Much LAW, TIME and COURTS support is a profile-data problem as well as a code problem.** Governing records law, deadlines and holidays, action kinds and tiers, venues and their standards, legal organisations and filing templates all come from the jurisdiction profile. UC-114 notes "the real profile has no Tier 1-2 templates yet (N-A14: legal text Bob supplies or approves, and a source)".
11. **Staleness and conflicts within the sources:**
    - journeyExperience (c) L586 says overdue marks are "Not yet built", but UC-127 says they were built at the plane in T18.
    - UC-031 offers a "per meeting" cadence, but journeys §6 says there is no meeting model.
    - journeyExperience (c) cites actions R32 and R35 for clocks, which K617 moved to action-clocks (UC-118).
    - The task brief says "fourteen journeys"; the source has seventeen.

### The sources' own lists of needs without coverage
- **design-ux-useCases.txt** has no separate list. Its per-use-case field coveredByRequirements is the source's own coverage verdict.
  - **"no" (12):** UC-003 Context skill; UC-005 Discover other groups' work; UC-027 Classify fact, analysis or judgment; UC-076 Regrade under another lens or rerun another group's work; UC-083 Accept another group's work; UC-092 Ask the assistant in my own words; UC-093 Speak to the assistant; UC-100 Compliance Evaluation (skill.md); UC-110 Public directory; UC-125 Discuss across groups; UC-148 Starter kit (legal-tool and data-source guides; DEC-91 deferred); UC-154 Decline to escalate (DEC-89 decided, requirements owed).
  - **"partial" (10):** UC-002 Search outside sources (city data, legal databases); UC-004 Legal/Policy Lookup; UC-034 All watched addresses; UC-035 Standing requests and sweeps; UC-037 Watch a finding's sources; UC-064 Government Compliance Analysis; UC-082 Weigh another group's case; UC-087 Suggested accounts of support (investigate not deployed); UC-088 Proposed readings (extract not deployed); UC-101 Standard metadata (area of government, relationship disclosure).
  - **Covered but "no member surface yet" (27):** UC-040, 069, 113, 115, 119, 122, 124, 126, 129, 149, 150, 153, 155, 158, 159, 160, 161, 162, 164, 165, 166, 167, 168, 169, 170, 171, 172. Almost every construct-bearing Action use case (breach action, counsel packet, correspondence, escalation, plan, reminders, scenarios, venue standard) is in this group.
- **design-journeys.txt §6 "Gaps to close"** (L518–536, proposed 5 October, nothing decided) is the source's own list of what the journeys need that Civicsmith does not do. Construct-bearing rows:
  - Calculating over a dataset (ANALYSIS)
  - Explaining a charge or a rule (LAW, QUESTIONS)
  - A code's structure (LAW)
  - Following a court case (COURTS)
  - Meetings and time (TIME)
  - Offices and who held them (ORG, TIME)
  - Asking an expert for a check (members' expertise routing)

  All but the last wait on "the development process's answer to the capability question you sent it on 5 October". The other rows are: invitation links, one administrator, kind of group, private note, and the assistant's account.
- **design-ux-journeyExperience.txt** marks open points per step ("openInThisStep") and "Decided, not built" (decline to escalate). It has no consolidated list.
- **design-ux-audiences.txt** marks lines "open" but has no coverage list.

### Index: every construct-bearing use case and journey step (id, name, construct need, coverage as the source states it)
**Use cases (design-ux-useCases.txt)**
| id | name | construct need | covered |
|---|---|---|---|
| UC-001 | Search the record | QUESTIONS: one query language; note of what could not be seen | yes |
| UC-002 | Search outside sources (city data, legal databases, other groups, news) | QUESTIONS, LAW, ANALYSIS, TIME (recency) | partial: FIND only inside a run |
| UC-003 | Context skill (laws, reports for an area) | LAW, QUESTIONS | no |
| UC-004 | Legal/Policy Lookup | LAW, QUESTIONS: candidate standards proposed | partial: lookup skill not a module |
| UC-005 | Discover other groups' work | ORG (partner groups) | no |
| UC-008 | Read the frontier | QUESTIONS: four-level absence | yes |
| UC-018 | Register subjects and relations | ORG: offices, funds, programs, people-in-role | yes |
| UC-019 | Resolve references to subjects | ORG: graded matches | yes |
| UC-020 | Declare originating office or system | ORG | yes |
| UC-023 | Trusted timestamp | TIME: when bytes existed | yes |
| UC-024 | Declare an expected flow | TIME, ORG, LAW: how a body is supposed to act | yes |
| UC-027 | Classify fact, analysis or judgment | ANALYSIS | no |
| UC-028 | Prove what a public body published and when | TIME | yes |
| UC-029 | Versions of one address | TIME | yes |
| UC-031 to UC-033 | Monitor at cadence (hourly to monthly, per meeting); check now; told of change | TIME | yes |
| UC-034, UC-035, UC-037 | All watched addresses; standing sweeps; watch a finding's sources | TIME | partial (R32, R28-R29, R33 unmet) |
| UC-038, UC-039 | Newer version of a cited passage; re-evaluate on supersession | TIME | yes (R17 "weakened" unmet) |
| UC-046 | Decide routed obligation (authority on an undetermined capture) | ORG (authority) | yes |
| UC-047 | Open a question (assistant may surface one) | QUESTIONS | yes |
| UC-052, UC-053 | Independence check; read strength | ANALYSIS (grades) | yes |
| UC-054 | Compare alternative accounts (machine-suggested) | QUESTIONS | yes |
| UC-056 to UC-058 | Conclude (dated), withdraw, reopen | TIME (history) | yes |
| UC-062 | Declare a standard from captured text | LAW | yes |
| UC-063 | Standard in force on a date | LAW, TIME | yes |
| UC-064 | Government Compliance Analysis | LAW, ORG, QUESTIONS, ANALYSIS | partial: skill not a module |
| UC-065 | Determination per standard | LAW, ORG: rests on published findings | yes |
| UC-066 | Unclear determination becomes questions | LAW | yes |
| UC-067 | Judge significance (context, scale, pattern) | ANALYSIS, LAW | yes; DEC-89 parts uncovered |
| UC-068 | Detect candidate contradictions | QUESTIONS, ANALYSIS | yes; no member surface |
| UC-069 | Resolve own-record contradiction (conflict of norms) | LAW | yes; no member surface |
| UC-070 | World contradiction ("said X in March, Y in October") | TIME, LAW, ORG | yes |
| UC-076 | Regrade or rerun under another lens | ANALYSIS (reproducibility) | no |
| UC-077 | Objective progress and gaps | ANALYSIS | yes |
| UC-080 | Declared flow not followed (overdue successors) | TIME, ORG, LAW | yes |
| UC-081 | Lawfully skipped stage | LAW | yes |
| UC-082 | Weigh another group's case (edition) | TIME, ORG | partial |
| UC-083 | Accept another group's work | ORG | no |
| UC-084 to UC-086 | AI credential; CHECK run; read a run | QUESTIONS | yes |
| UC-087 | Suggested accounts of support | QUESTIONS | partial: investigate not deployed |
| UC-088 | Proposed readings | QUESTIONS | partial: extract not deployed |
| UC-089 to UC-091 | Assistant requests captures; works objective; surfaced question ages | QUESTIONS, TIME | yes |
| UC-092 | Ask the assistant in my own words | QUESTIONS | **no** |
| UC-093 | Speak to the assistant | QUESTIONS | no |
| UC-099 | Prepare a case (computed searched section) | ANALYSIS | yes |
| UC-100 | Compliance Evaluation (skill.md) | QUESTIONS, ANALYSIS (methodology) | no |
| UC-101 | Standard metadata (area of government, relationships) | ORG | partial |
| UC-105 | New edition | TIME | yes |
| UC-112 | Record consequences (computed, assessed, undetermined) | ANALYSIS | yes |
| UC-113 | Breach action to an office with laws and tier | ORG, LAW | yes; no member surface |
| UC-114 | Tier 1-2 filing from profile template | LAW, COURTS, QUESTIONS | yes; profile has no templates (N-A14) |
| UC-115 | Counsel packet, Tier 3 | COURTS, LAW, TIME (chronology) | yes; no member surface |
| UC-116 | Propose legal theories and remedies (AI) | LAW, COURTS, QUESTIONS | yes |
| UC-117 | Actions available against an office (profile) | ORG, LAW | yes |
| UC-118 | Deadline with legal basis | TIME, LAW | yes |
| UC-119 | Correspondence ledger | TIME, ORG | yes; no member surface |
| UC-120 | Records request under law | LAW, TIME | yes |
| UC-121, UC-122 | Evaluate response; escalation stages | TIME | yes (UC-122 no member surface) |
| UC-123 | Political accountability: officials, oversight | ORG, LAW, COURTS | yes |
| UC-125 | Discuss across groups | ORG | no |
| UC-126 | Action plan with deadlines | TIME | yes; no member surface |
| UC-127 | Overdue clocks marked | TIME | yes (built T18) |
| UC-128 | Consequences addressed | ANALYSIS | yes |
| UC-129 | Pressure as evidence; litigation hold | COURTS, TIME | yes; hold deferred (N-A19) |
| UC-133 | Choose jurisdiction profiles | LAW (local facts as data) | yes |
| UC-139 | Declare and confirm expertise for routing | ORG (internal), QUESTIONS | yes (routing itself not built, journeys §6) |
| UC-148 | Starter kit (legal-tool and data-source guides) | LAW, ANALYSIS | no (DEC-91) |
| UC-150 | Source identity history | TIME, DOCTRINE | yes; no member surface |
| UC-151 | Project stage computed | ANALYSIS | yes; bars not built |
| UC-154 | Decline to escalate (dated) | TIME, LAW | **no** (DEC-89 owed) |
| UC-156 | Accept machine recommendation | QUESTIONS | yes; none produced live until measured |
| UC-160 | Wrong subject match (person, office) | ORG | yes; no member surface |
| UC-163 | Assistant's suggested options | QUESTIONS | yes; plan mode not deployed |
| UC-164, UC-165 | Deadline reminders; scenarios and checkpoints | TIME | yes; no member surface |
| UC-167 | Commend compliance | ORG, LAW | yes; no member surface |
| UC-169 | Exhibit grade against the venue's standard | COURTS, LAW | yes; no member surface |
| UC-170 | Kind of work (legal, oversight) | QUESTIONS | yes |
| UC-172 | Group's contact for an action | ORG | yes |

**Journey steps (design-journeys.txt).** Coverage is as stated in §6, or by the matching use case.
| journey and step | construct need | covered |
|---|---|---|
| §3 Potholes and dumping (to J6) | ANALYSIS, TIME | gap: calculating over a dataset |
| §3 Franchise (J13, J8) | LAW (terms as standards), ORG (hauler and city duties) | standards declarable; no "contracts with" (gap) |
| §3 Police overtime; bond measure; budget or audit | ANALYSIS, LAW (budget, policy) | gap: calculating over a dataset |
| §3 Law, code or policy (sewer) | LAW | gaps: a code's structure; explaining a charge or a rule |
| §3 Court case | COURTS, ORG, TIME | gaps: following a court case; offices and who held them |
| §3 Public meeting | TIME | gap: meetings and time |
| §3 Contract | LAW, ORG, TIME | deadlines only as action clocks; not stated otherwise |
| §3 Regulatory proceeding | COURTS, TIME | gap: following a court case |
| §3 Dataset | ANALYSIS | gap: calculating over a dataset |
| J1 step 5: places whose rules apply | LAW | built (UC-133) |
| J2 step 2: offices and agencies watched | ORG | gap: what kind of group (J7) |
| J4 step 3: find the city's standard (assistant may help) | LAW, QUESTIONS | partial (UC-004, UC-062); gap: explaining a rule |
| J4 step 4: time-bound question | TIME, LAW | question yes (UC-047); evaluation needs calculation |
| J5 steps 3, 4, 6, 8: office; governing law; due date; overdue | ORG, LAW, TIME | yes (UC-120, UC-118, UC-127) |
| J6 steps 2 to 6: period; timestamps; calculation with method; sample; counts | TIME, ANALYSIS, QUESTIONS | gap (L230, §6) |
| J8 step 3: ask an expert | ORG (internal) | gap |
| J9: ask in plain words | QUESTIONS | no (UC-092); only CHECK deployed |
| J10 step 2: sort by time due | TIME | yes (UC-040) |
| J13 steps 3, 4, 5, 7, 8: reminders; standard and determination; filing or escalation; clocks; legal tools and counsel packet | TIME, LAW, ORG, COURTS | built at the plane, no member surface (UC-113 to UC-115, UC-126, UC-164 to UC-166) |
| J14: source changes | TIME | yes (UC-033, UC-039) |
| J15: watch the publisher's docket | TIME, ORG | partial or no (UC-082, UC-083) |

**Experience steps (design-ux-journeyExperience.txt)**
| journey and step | construct need | covered |
|---|---|---|
| (a) steps 1 and 3: jurisdiction profiles | LAW | fixed and built |
| (b) step 3: resolve subjects | ORG | fixed |
| (b) steps 4 and 6: assistant surfaces a question; run | QUESTIONS, TIME (ageing) | CHECK only |
| (c) step 1: declare standard (profile source match) | LAW | fixed |
| (c) step 2: determination in force at the act's date | LAW, TIME | fixed |
| (c) step 3: consequences | ANALYSIS | fixed |
| (c) decline to escalate | LAW, TIME | decided, not built |
| (c) breach action; counterparty from profile | ORG, LAW | fixed |
| (c) filing; counsel packet | LAW, COURTS | fixed; no Tier 3 template by design |
| (c) deadline with legal basis | TIME, LAW | fixed |
| (c) plane marks overdue | TIME | "Not yet built" (stale vs UC-127) |
| (e) delegating to the assistant | QUESTIONS | CHECK only; panel not built |
| (f) source identity over time | TIME | built at the plane, no member surface |
| (h) steps 1 to 3: records request | LAW, TIME | fixed; RECORDS_LAW_REFUSED not yet enforced |
| (i) source change | TIME | fixed; "weakened" unmet |
| (k) step 2: determined_since | TIME | fixed |
| (k) step 3: assistant suggestions from standards, deadlines, venues, legal organisations | QUESTIONS, LAW, ORG, COURTS | plan mode not deployed |
| (k) step 4: dates with basis; addressee by role and organisation | TIME, ORG | fixed |
| (k) steps 6 to 8: reminders; scenarios; checkpoints (1 to 3,650 days) | TIME | fixed |
| (k) step 10: legal option via filing or counsel packet | LAW, COURTS | fixed; KIND_NO_TEMPLATE |
| (k) step 11: counterparty's window (statutory or the group's) | TIME | fixed |

**Audiences (design-ux-audiences.txt)**
| audience | construct need | coverage |
|---|---|---|
| Government office or official | addressed by role and body; statutory clocks; compliance commended | fixed |
| Oversight body | referrals at stage 7 | fixed; needs "open" |
| Named counsel | packet with chronology, standards' text, theories, binding deadlines, venue standard | fixed |
| AI run | find, pursue, extract, check; propose laws and standards; never state a law | fixed; only CHECK deployed |
| Professional member | routed questions such as "a Brown Act or franchise-fee question" | fixed (routing not built per journeys §6) |
| Participant | own deadline reminders | fixed |
| Newcomer and investigator | "Statutory clocks run whether or not the member is ready"; "Deadlines are deadlines" | fixed |
| Partner group | reproducible analysis; strength across instances | open |
| Operator | chooses jurisdiction profiles | fixed |
