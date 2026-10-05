# Digest: MONEY

Every phase-1 reader's MONEY section, in reader order (23 notes).

## From C1 (C1: BIO_Complete_Roadmap_v5.txt, BIO_Design_Requirements_v2.txt, BIO_Functional_Architecture_v3.txt, BIO_System_Design.txt, BIO_Action_v0_1.txt, MILESTONES.txt, UI-KICKOFF.txt)

- [EXAMPLE] Roadmap §1, l.219–232 — the founding case is money: "$52.6 million in sewer maintenance fees had been diverted from the Sewer Service Fund to the General Purpose Fund over nine fiscal years (FY 2012-2021)"; transfers labelled "sewer franchise fees" at ~10% of sewer service charge revenues; made "without City Council authorization, without a documented franchise agreement, without a legal basis in the Oakland Municipal Code, and in potential violation of Proposition 218 (California Constitution Article XIII D, Section 6(b)(2)), which restricts fee revenue to the purpose for which the fee was imposed" — sources (fees), funds, transfers, transfer authority, restricted-fund rule all in one passage.
- [EXAMPLE] Roadmap §1, l.234–239 — budget/actual series and relabelling: "OpenGov portal data shows transfers from the Sewer Service Fund continue at $1.6M to $2.8M annually, trending upward to $2.77M budgeted for FY 2026-27. The transfers may have been relabeled as cost allocations or overhead charges." (NEED: track a flow across label changes; budgeted vs actual; trend).
- [EXAMPLE] Roadmap §1 CPRA, l.244–251 — documents money work needs: "all interfund transfers from the Sewer Service Fund to any other fund, all cost allocations charged to the Sewer Service Fund, the Statement of Revenues, Expenses, and Changes in Fund Net Position ... from each year's ACFR, the city's cost allocation plan".
- [EXAMPLE] Roadmap §1 Research, l.272–274 — legal precedents on fee restriction: Howard Jarvis v. Roseville (2002), v. Fresno (2005) (Prop 218 franchise-fee cases), Zolly v. Oakland (2022).
- [EXAMPLE] Roadmap §2, l.289–291 — "treat noncompliance penalties as a cost of doing business".
- [EXAMPLE] Roadmap §9 Skill 3, l.587–589 — money sources to extract: "ACFRs, OpenGov, budget documents, court records".
- [EXAMPLE] Roadmap §14 Phase 1, l.877–879 (history) — first adapter "against the sewer-fund OpenGov data and one ACFR PDF"; §15 l.1000–1003 "JSON tidy/long core with provenance, hashes, criticality, and classification".
- [EXAMPLE] Roadmap §8, l.531–533 — Tier 3 includes "Prop 218 challenges, CCP 526a taxpayer actions" (money-rule litigation needs counsel).
- [EXAMPLE] Roadmap App. B, l.1081–1102 — "7923.115 (mandatory attorney's fees)"; "Filing fee $435"; "Penal Code 925a (examine city books)"; "Prop 218: Cal. Const. Art. XIII D, Sec. 6(b)(1)(2)(5). Fee revenue restricted to service purpose."; "Carachure v. Azusa (2025, identical 10% sewer fee)"; "Zolly v. Oakland (2022, franchise fees subject to Prop 26)"; "Livermore settlement: $3.78M (ACTA)"; "CCP 526a: Taxpayer standing ... any local tax confers standing".
- [EXAMPLE] Roadmap App. A, l.1074–1075 — "External auditor: MGO (clean ACFR opinions). Working papers proprietary." (audit opinion on financial statements; inaccessible working papers).
- [OPEN] Roadmap §15, l.981 (history) — "Financial dimension (system minimizes barriers; may evolve)" (the group's own money, not the subject's).
- [EXAMPLE] DR6 example, l.151 — "the Finance Director certified the ACFR" (a financial statement certification as a documented act).
- [EXAMPLE] DR11, l.300–302 — key public data sources: "OpenGov, ACFR archive, City Auditor reports, NextRequest portal, court records"; legal tools include "Prop 218 challenges ... CCP Section 526a taxpayer actions".
- [EXAMPLE] DR12, l.333–335 — "data extraction skills for pulling structured information from public sources (ACFRs, budget documents, OpenGov portals)".
- [DOCTRINE] DR1, l.62–63 — the network has "no treasury"; DR8 l.219–220 "The system minimizes financial barriers to escalation but does not provide or manage funding."; DR14 l.376 "No single ... funding source ... is essential". (The group's own money is out of scope as a managed thing.)
- [EXAMPLE] DR8 Tier 2, l.199–201 — dismissal without prejudice "costs time and money" (cost of the group's actions).
- [EXAMPLE] FA Layer 2 Function 1, l.254–259 — money event + money rule: "the city transferred $2.1M from the Sewer Service Fund to the General Purpose Fund in FY 2023-24"; "Municipal Code 13.04.080 restricts sewer fund revenue to sewer system purposes; Prop 218 Article XIII D Section 6(b)(2) prohibits using fee revenue for purposes other than those for which the fee was imposed" (amount, source fund, destination fund, fiscal year, restricted-fund rule).
- [NEED] FA Layer 2 Function 2, l.271–276 — cross-source money reconciliation: "The ACFR may show a transfer amount that doesn't match the OpenGov data. The budget narrative may describe a program that the actual expenditure data doesn't support." (budget vs actual; narrative vs expenditure; two sources' amounts disagree).
- [EXAMPLE] FA Layer 1 Function 1, l.133–135 — financial sources: "financial documents (ACFRs, adopted budgets, quarterly reports, OpenGov portal data), audit reports (City Auditor, grand jury, State Controller)".
- [NEED] FA Layer 1 Function 2, l.149–154 — "An ACFR is a 180-page PDF. The OpenGov portal is a JavaScript application that doesn't yield to simple downloading. Budget documents are formatted for reading, not analysis."
- [DESIGN] FA Function 2 resolution, l.156–163 — "The structured core is JSON in tidy/long form for line items, carrying provenance, source locator, content hash, criticality, and fact/analysis/judgment classification" (line items = money rows; Tech Arch §7.1, State Rules §4.1; retired-substrate design).
- [DESIGN] FA Function 3 technical note, l.180–188 — dynamic data (OpenGov) snapshot = "a three-layer logical capture keyed to a stable query definition: a raw capture (evidentiary, e.g. WACZ), a canonicalized normalized dataset (hashed and diffed), and a rendered view".
- [DESIGN] FA Change detection, l.484–487 — "For structured data (OpenGov, budget tables): field-level comparison shows what specific values changed. The system needs to define what constitutes a meaningful change versus noise (rounding differences, formatting changes)." — resolved as "keyed field-level diff with numeric tolerances".
- [EXAMPLE] FA Function 4, l.313 — scale as significance: "$52.6 million unauthorized transfer over nine years".
- [BUILT] SysDesign §3 row 8, l.111–112 — "A FEE QUOTE IS EVIDENCE (D-148, Bob 2026-09-22; BIO_Case_Making_v0_1.md §2): a received correspondence entry may carry a quote — amount and currency as quoted, the stated basis verbatim, the sent entry it answers, and optionally the quote ..." — the only money-amount structure named in this map; amount kept "as quoted" with currency and basis verbatim.
- [BUILT] SysDesign §3 row 5, l.100–101 — "the CSV format entry (FW-23 ... written from all 166 .csv keys of s3://cao-94612 measured whole — M-144)"; CSV dialect persisted (REC-218); "tables and images as content: the sheet-range, doc-table and image extent arms are landed (FW-19)" — tabular money data (budgets, ledgers) can be cited by cell/range.
- [BUILT] SysDesign §3 row 4, l.96–98 — content extent arms "document, pdf-page, sheet-cell, slide-shape, doc-para" (eight kinds total) — a single budget cell is citable.
- [GAP] SysDesign §3 — no MONEY construct row; no ledger, fund, flow or amount model beyond the fee quote on correspondence.
- [DESIGN] Action §3 Consequence, l.22 — harm may fall on "a class, fund, program, service or body" and is "computed from the record or assessed by a member" — a fund or program harmed is a money consequence (e.g. sewer fund diverted); computation from the record implies amounts.
- [DOCTRINE] Action §4 rule 8, l.39 — "No catalogue, no budgets ... the plan holds no costs, assignees or hours (Bob, 2026-09-29)" — the group's own money/time is not modelled in plans (not about the subject's money).
- [DOCTRINE] Action §4 rule 3, l.34 — "No significance, no score. ... No field holds significance, severity, priority or a score." (bears on any materiality measure for money, e.g. size of a diversion).
- none further in BIO_Action (fee quotes D-148 are named elsewhere).
- [EXAMPLE] MILESTONES M4 acceptance, l.262–264 — procurement sequence: "the need → award → contract sequence ... an award with no solicitation surfaces as a finding carrying its grade" (procurement commitments as progressions; a missing solicitation is a money-rule finding).
- [EXAMPLE] MILESTONES M2, l.136–138 — "the document classes a city actually publishes — agenda packets, budget exhibits, portal pages — become citable bundles".
- [DESIGN] MILESTONES M2 office formats, l.154–177 — spreadsheets (`.xlsx`/`.ods`) are OOXML/ODF containers read with zero dependency in workerd; "Two element references land BETTER than PDF's page+rect: `Sheet1!B14` and slide+shape are stable and human-meaningful — the first time the record can cite finer than a whole document" (a budget cell is a citable unit; D-123 per-container source).
- [DESIGN] MILESTONES M10, l.492 — "the fee quote as evidence" (D-148) on this rung.
- [EXAMPLE] MILESTONES M6, l.323–325 — "one budget book measured 39.6MB" (storage consequence of money documents; R2 growth, free-tier ceiling, retention unplanned).
- none in UI-KICKOFF specific to money beyond the general story-visual principle (l.176–179), which bears on money-flow visuals.
- [BUILT] verified in code (bio-plane/src/consequences/figures.mjs:1–30) — a parser of FIGURES "as a member or a machine read it in a passage: `1,234,567`, `$4.2 million`, `(3,400)`"; parsed exactly ("never a float"); "The passage must hold it (`passageHolds`)"; operations "sum", "difference", "count", "product", "ratio" (R2). consequences/index.mjs:5–12: a part records the affected (class, fund, program, service, body), "the measure and the period", in three never-composed states: COMPUTED ("the module's own arithmetic over figures the cited passages hold, graded by the weakest operand capture (R2, DEC-21)"), ASSESSED, UNDETERMINED ("never read as zero"); causation names an inquiry or is `unproven`. This is the only built money arithmetic: amounts read from cited passages, scoped to a breach's consequence.
- [BUILT] verified in code (bio-plane/src/actions/index.mjs:823–825, 1054, 1674, 2190) — D-148 fee quotes stored in `action_quotes` (amount as quoted, parsed value, currency, basis, answers_ord, revises_ord, counterparty, at); l.1674 "THE PLANE ENCODES NO LAW'S RULES. A citation is stored as the member wrote it and never parsed for a fee".
- [BUILT] verified in code (entities ENTITY_KINDS) — "contract" and "fund" are entity kinds today: a fund or contract can be a registered entity (identity only; no balances, flows or stages).

## From C10 (C10: OBSERVATION-LOG-DESIGN.txt, BIO_Technical_Architecture_Decisions_v10.txt, BIO_Distribution_v0_1.txt, PRACTICE-SURVEY.txt, CONSTRUCTS.txt)

- [EXAMPLE] TAD §0 L129–133; §11 L1581–1595 — the sewer fund is "an exemplar pilot". The prototype is "one Data Extraction adapter against the sewer-fund OpenGov data and one ACFR PDF", with analysis to "surface a Focus against the Prop 218 / Municipal Code standard". The project's founding exemplar is a money case: a restricted fund and a fee limit (Prop 218).
- [EXAMPLE] TAD §4 L467–468 — the credible primary sources at an argument's leaves include "an ACFR, a court record, a statute, an OpenGov dataset".
- [EXAMPLE] TAD §7.1 L701–709 — "Socrata full-file exports (the OpenGov transfer series)" are proven mechanically capturable. A fund transfer series is already a proven source class.
- [DESIGN] TAD §7.1 L693–699 — extraction core is JSON "tidy/long for line items, carrying provenance, source locator, content hash, criticality, and fact/analysis/judgment classification"; "prefer a source's published spreadsheet over re-parsing its PDF". This is the line-item shape for budgets and ledgers.
- [DESIGN] TAD §7.4 L733 — "keyed field-level diff with numeric tolerances for structured data". Changes in amounts are compared with tolerances.
- [DESIGN] CONSTRUCTS Step 5a L273–283 — measure shared identifiers: "A contract number, a project number, a resolution number, an APN, a fund code. Each one found in two systems converts a whole progression from Grade C to Grade B". It was measured once (D-74, M-119, 2026-09-23): "a project number is shared by the budget and Legistar (7 values), a fund code by the budget and Legistar (3), a C.M.S. number by the Auditor and Legistar (1); contract/PO numbers and APNs are UNDETERMINED because their issuing systems were not read". [GAP] The identifier-space construct "stays ABSENT" (L11), and M-119 "names the four measurements still owed".
- [GAP] CONSTRUCTS status L11–12 — Step 9: "the budget-or-dataset type is OWED, measured first" (`EXTRACTION-BREADTH-DESIGN.md` §2). There is no budget content type yet.
- [EXAMPLE] CONSTRUCTS Step 5 L270–271 — "need-to-signed-contract must ... be expressible as rows". A procurement process is a progression.
- [EXAMPLE] CONSTRUCTS Step 8b L315–316 — "aggregation, so one check across 58 contracts is one focus with 58 instances". Contract-level checks are the anticipated work.
- [DESIGN] TAD §6 L621–623 — "An agent run carries a budget; an interactive run carries a clock." This is AI cost, not civic money. [NAMING] "budget" is already used for run budgets (as in ratify's "the budget that stopped it", OBS §4.1 L171). A money construct's "budget" should be distinguished from run budgets.
- [DESIGN] DIST §2 L41 — Workers Paid "$5/month plus a card" (DEC-42). This is the group's own operating cost, not civic money.
- none in OBSERVATION-LOG or PRACTICE-SURVEY on civic money.

## From C11 (C11: DECISIONS-archive-part1.txt)

- [EXAMPLE] DEC-4, l.102, l.221–222 — budgets carry text layers; "a 200-page scanned budget attested wholesale is a weaker claim than one figure checked against its rect"; digits are where OCR and human skimming fail (l.231–232) — money figures need region-scoped attestation — "CPDF-9 should measure where human checking actually fails — digits, which is precisely where OCR fails and where skimming fails too."
- [EXAMPLE] DEC-5, l.259 — "a figure changed days before publication" — revision history of figures (tracked changes with superseded wording) as evidence; bears on budget figures' stages/versions.
- [EXAMPLE] DEC-9, l.497 — framework §8.2 headline example "award with no solicitation" (procurement progression, `unless_exception`): a lawful sole-source must not read as a gap — procurement process rule as a progression.
- [EXAMPLE] DEC-11, l.589–593 — cost figure moved from $4.2M to $2.8M three days before publication by a named deputy: amount revision with author and date as a finding (money × people × events).
- [EXAMPLE] DEC-10, l.741 — "three things need attention on the Sewer Fund project" — a fund as a project's subject; l.738 "a member working the sewer fund is told about parks minutes".
- [EXAMPLE] DEC-16, l.1176–1179 — nested inquiries: INQ-1 "Was the sewer fund misused?" rests on INQ-2 "Was the $2.1m transfer authorised?" which rests on INFO-88, "a controller memo"; all in the Sewer Fund project — canonical MONEY investigation shape (fund misuse ← transfer authorisation ← controller memo), i.e. transfer authority as a question.
- [EXAMPLE] DEC-27, l.1810–1811, 1821–1822 — assistant examples: "show me new content uncovered over the weekend on the Sewer Fund project"; a member's claim "the annual audit is just a controlled audit rather than the general audit that's required" (audit requirements — financial oversight rule as a claim).
- [GAP] DEC-6, l.293 — `fund` and `contract` are among the ten entity kinds in the one `entities` registry (Content Framework v0_10:248), and legal bias subjects. Apart from this, the file holds NO money-specific design or ruling: no amount stages, ledger, budget, flow or fund-rule model. MONEY appears only as examples (above) and through the general grading, transcription and progression doctrine.

## From C12 (C12: src/DECISIONS-archive-part2.txt)

- [RULING] DEC-35, src 54–122 — the group's own operating money: an external OCR service is a recurring cost carrying Bob's name; "NOTHING IS FUNDED NOW"; in-account path wins at equal fitness. (Instance cost, not the MONEY construct, but shows money decisions are Bob's: "why it is Bob's: money (a paid service), and an external relationship".)
- [RULING] DEC-42, src 356–429 — Workers Paid ($5/month) becomes a requirement for every instance: "$0/month plus a card becomes $5/month plus a card"; prerequisites: Cloudflare account, payment method, Workers Paid, R2 (free tier, billed past it). Measured: ~500 docs/month, ~14% scanned ≈ 70 OCR pages ≈ 105,000 CPU-ms vs 30,000,000 included (0.35%). Resource envelope for any MONEY/EVENTS/PEOPLE computation: CPU per invocation 30 s default, 5 min max; Worker size 10 MB; subrequests 10,000; cron triggers 250 — "CPU per invocation 10 ms → 30 s default, 5 min maximum."
- none further in 501–1000 (DEC-45/46/52/49/47 carry no money content).
- [EXAMPLE] DEC-55, src 1415–1422 — product operating cost model: AI credential may be the organisation's or a member's API key; "This project is developed open-source on a non-profit basis; instances used in a for-profit environment bring an account that fits their use." (Instance cost, not the MONEY construct.)
- [DESIGN] DEC-54, src 1066–1070, 1126–1133 — bars (`required_strength{capture, connection}`, DEC-17) gate: `BELOW_PROJECT_STRENGTH` refuses at pre-flight; "you can lower your own bar, you cannot do it quietly." Relevant to MONEY by analogy only (procurement thresholds etc. are law/standards, not this bar). No direct money content in 1001–1500.
- [EXAMPLE] DEC-60, src 1615–1619 — the contract/procurement case: an award that skipped competitive bidding plus an emergency exemption (procurement rule and its exception) — the only concrete public-money example in this file; shows money rules (competitive bidding threshold) and their exceptions must be held together, relevance set by the inquiry's question.
- [RULING] DEC-63, src 1934, 1943 — a run "spends the group's Claude budget against their account"; the question "decides who in a group can spend that group's money" — answered by project membership. Group's own spend, not the MONEY construct.

## From C13 (C13: plan/action-design_HANDOFF.txt, plan/action-design_PATH.txt, plan/action-design_UX-ANSWERS.txt, plan/action-design_action-plans.txt, plan/action-design_deltas.txt, plan/action-design_tests.txt, plan/draft-filing-templates.txt, plan/draft-planning-skill.txt, plan/research-oakland-calendar.txt)

- [RULING] HANDOFF L7 (rulings 1–10, 2026-09-29) — "no budgets" in action plans (the group's own planning carries no cost/budget) — "no catalogue of response options; no budgets"
- [DESIGN] PATH §3 L33 — plan page must never show a cost or budget — "a cost, budget, assignee, score or priority"
- [EXAMPLE] PATH L3 — worked case is a "bond measure" (from ACTION-PLAN.md) — a money matter (bond) as the plan's subject; "the certification's escalation" L19
- otherwise none in HANDOFF/PATH/UX-ANSWERS (the money of the world is not addressed)
- [DOCTRINE] action-plans R26 L88 — no field, input or answer holds "a cost, budget, amount of money to be spent, assignee, hours or significance score"; keys `budget`, `cost`, `assignee`, `hours`, `significance`, `priority`, `score` refused `OPTION_KEY_REFUSED` (rulings 3; DEC-24). NB: this bans the GROUP'S OWN spending in plans; a MONEY design must not collide with this key ban if plan options ever reference world money (e.g., an option about a misspent amount should name it in detail text or via its subject, not a `cost` key) — "a key named `budget`, `cost`, `assignee`, `hours`, `significance`, `priority` or `score` is refused `OPTION_KEY_REFUSED`"
- [DESIGN] action-plans L11 — "It is not a project-management system: it holds no costs, assignees or hours."
- [GAP] deltas — no world-money content; none beyond the above (no change to MONEY).
- [EXAMPLE] tests R26 L36 — each refused key (`budget`, `cost`, …) refuses `OPTION_KEY_REFUSED`.
- none in draft-filing-templates (no world money; templates and calendars only).
- [DOCTRINE] planning-skill R26 via R31 L37 — machine proposals also refused `OPTION_KEY_REFUSED` (§4 rule 8; R26: no budget/cost keys); none else on money in draft-planning-skill
- [EXAMPLE] research L10, L251–254 — finance offices as counterparties: City of Oakland Finance Department (Controller's Bureau, Treasury Bureau, Local Tax Customer Service, Citywide Collections, Liens, Audit, SPARE) and the California State Controller's Office; City Auditor — the organisational units a MONEY construct's flows would touch (no money content as such)
- [EXAMPLE] research M-NEW-5 L175–180 — CalHR publishes "2026-Holidays-and-Paydays.hol" (a payday calendar, a payroll-schedule source)
- [EXAMPLE] research M-NEW-4 L115–129 — City MOUs with unions (labour agreements, 2025-07-01 to 2026-06-30, expired, no successor located): commitments that govern compensation (paid holidays, vacation-day substitution, partial paid time off by department head) — a kind of money-bearing commitment document

## From C14 (C14: CONTRADICTION-PRESENT-RESOLVE-DESIGN.txt, BIO_Bundle_Skill_Composite_Design_v1_7.txt)

- [EXAMPLE] BSC §2 l.253–256 — demo store is "the sewer-fund exemplar store: the full pipeline as real, gate-passing, cross-referenced objects" (a fund as the exemplar investigation).
- [BUILT] (historically, retired runtime) BSC §11 l.780–784 — Information's recomputed-content-hash rule "proved able to catch a single silently mutated dollar figure. The first store object carries only corpus-attested values, with the raw-capture gap recorded explicitly rather than papered over." — integrity of amounts held in `data/dataset.json` (§5 l.360); not re-verified against the plane code (runtime retired).
- [DESIGN] BSC §5 l.359–361 — "the canonical data/dataset.json with the recomputed content-hash rule" — structured data (e.g. figures) held as a hashed dataset beside the Information record.
- Otherwise none in BSC.
- none in CONTRADICTION-PRESENT-RESOLVE-DESIGN.txt (no amounts, funds, flows; the `precision` DISSOLVED kind and "same fact at different precision" dismissal reason (§15 pt 17, l.291) would apply to amounts at different rounding, but the document does not say so).

## From C2 (C2: DECISIONS-design-branch.txt)

- none in DECISIONS-design-branch.txt as a construct (no ruling on amounts, funds, budgets, flows, contracts or campaign money). Only adjacent: DEC-74 (src 1158–1160, 1179–1181) and DEC-35 — spending on a vendor account is Bob's risk and money ("funding a vendor account is his risk and his money"), about the project's own costs, not civic money; DEC-115 (src 1888) filing templates (K921, K924) for the group's filings.

## From C3 (C3: BIO_Content_Framework_v0_10.txt)

- [EXAMPLE] Changelog v0.4, src 226 — Bob's progression example is a money process: "need, budget request, budget approval, RFP, responses, award, signed contract".
- [GAP] Incomplete §12, src 60–61 — satisfaction-condition vocabulary scoped to what the record holds as VALUES: "entity, progression, stage, grade, and an amount or a fund only once the budget-or-dataset type exists (`EXTRACTION-BREADTH-DESIGN.md` §2 row 5)" — amounts and funds are not yet record values.
- [BUILT/EXAMPLE] Front matter §8.3, src 14 — M-119 (2026-09-23) first sample of Oakland shared identifiers: "project number, fund code and C.M.S. number seen in two Oakland systems, contract/PO number and APN UNDETERMINED"; construct `6.identifier-spaces` stays ABSENT (then).
- [BUILT/GAP] Incomplete §8.3, src 67–68 — identifier spaces PARTIAL (REC-203, 2026-09-25, C-91; `op=idmatch`): four recognisers and rules 1–3 counting built; NOT BUILT: crosswalk capture, assessor vintage, referent read by plane, SHARED verdict raising a resolution's grade, per-instance system table; DESIGN GAPS to BOB: `apn_sort` spelled three ways (M-157), "independent system" has no home; a host serving many offices names NO system → "SYSTEM_UNDETERMINED"; M-157 read 24 CIP matches on www.oaklandca.gov. Also: Oakland table in build derivation (jurisdiction-specific data).
- [DESIGN] §3 ENTITY, src 405 — entity examples include "a contract, a fund" (money commitments and funds as entities resolved across documents, graded).
- [NEED] §1.1, src 340–343 — "the work that is most tedious for a member is exactly the work of chasing identifiers between documents" (fund codes, contract numbers etc., cf. §8.3).
- [DESIGN] §4 axes, src 505–507 — candidate format axis includes "dataset" (budget/ledger data as a format).
- [RULING] §8.2, src 836–840 — procurement progression ruled by Bob: need → budget request → budget approval → RFP → responses → contract award → signed contract with terms → "onward through amendments and payments" (change orders, payments as stages).
- [EXAMPLE] §8.1 Grade B/C, src 740, 756–758 — "A member's Grade C hunch that two documents concern the same contract becomes Grade B the moment the system finds the contract number in both, and Grade A if the source links them itself."
- [DESIGN] §8.2 table, src 846–850 — procurement chain spans months–years, department/council/contractor, three or four source systems, 8–12 stages.
- [DESIGN] §8.2 missing predecessor, src 861–864 — "an award with no solicitation is a question about how public money was committed."
- [DESIGN] §8.2 procurement table, src 876–886 — money stages: budget_request, budget_approval (council action, within 1 year), solicitation, responses, award, contract (within 90 days), amendment (change order 0..n) — the progression is the existing home for commitments.
- [NEED] §8.2 junction checks, src 914–916 — "a signed amount that differs from the awarded amount"; "amendments accumulating past a threshold of the original"; "payments past the contract term" — require amounts, thresholds and payments as record values (none of which the progression table holds: it has no amount column).
- [GAP] §8.2 table, src 876–886 vs 836–840 — Bob's ruled example runs "onward through amendments and payments" but the table stops at stage 9 amendment; no payment stage.
- [DESIGN] §8.2 threading, src 925–926 — progression instance followed by "a contract number, a project identifier, a parcel, a fund".
- [DESIGN] §8.3, src 1027–1036 — cross-system progressions (procurement portal, finance system, legislative record) collapse to grade C; "it is also where the most consequential progressions live".
- [DESIGN] §8.3 shared identifiers, src 1038–1051 — contract or PO number; project or capital improvement number; resolution or ordinance number; APN; fund or account code; each found in two systems "converts an entire progression from Grade C to Grade B"; record per institution.
- [EXAMPLE] §8.3 M-119 (D-74, 2026-09-23), src 1053–1064 — corpus: Legistar, Finance Department publications, Open Data budget, City Auditor; project number shared by budget and Legistar award resolutions (7 values, "carrying budget line → award → contractor"); fund code budget↔Legistar (3 values), stable in budget across ten years (34 values) "but the audited ACFRs carry no fund codes at all"; resolution/ordinance number Auditor↔Legistar (1); ACFRs and budget books cite C.M.S. numbers; contract/PO and APN UNDETERMINED (procurement, assessor, permits not read).
- [RULING] §8.3 BOB #32 2026-09-23 rule 1, src 1066–1079 — a match counts when the REFERENT agrees in two INDEPENDENT systems; "A fund code, for one, counts only when the fund NAME agrees too, because the bare code collides with years." BOB #35 2026-09-25: "a system is the ORIGIN that publishes the identifier, and a HOST IS NOT AN ORIGIN"; multi-office host → SYSTEM_UNDETERMINED; settled by a member's ATTRIBUTED act declaring a document's origin system (one per document, dated, append-only, latest wins), "never a per-instance table a machine applies"; "No machine reads a referent"; fund NAME the only referent the plane compares.
- [RULING] §8.3 rule 2 (BOB #32 2026-09-24, M-132, D-453), src 1080–1086 — a space may run several forms at once, told apart by SHAPE never DATE; Oakland project numbers `C######` 2000–2026 and `100xxxx` 2015–2026 concurrent (32,976 matters); cross-form match only through a CROSSWALK that is a captured document with provenance; "a document naming both forms is not a crosswalk".
- [DESIGN] §8.3 rule 3, src 1087–1100 — Oakland spaces measured, NOT BUILT (at time of text): C.M.S. number (38 of 41 citations resolve; recogniser MUST check REFERENT — "Resolution No. 87751" for OPEB funding policy is 87551; coverage floor ordinances 12274, resolutions 75950 → "OUTSIDE THE RECORD'S REACH, never NOT FOUND"); project number; fund code (name must agree); APN parsed key (BOB #35 amended).
- [EXAMPLE] §8.3 APN, src 1101–1107 — APN RETIRED only on assessor lineage (data.acgov.org) with roll year; else UNDETERMINED naming vintages searched; BOB #34 (D-504): M-132 roll a partial 2012-13 snapshot; of 33 Legistar APNs lacking, 27 retired, 1 current, 5 undetermined — "'absent ⇒ retired' would have written 6 false retirements"; "The contract/PO space is UNPUBLISHED AT SOURCE (Oakland's own systems catalogue, M-132), not undetermined."
- [BUILT] §8.3 REC-203 (2026-09-25, C-91), src 1109–1117 — `bio-plane/src/idspaces.mjs`: recognisers for C.M.S. number (with floor), project number (concurrent forms), fund code, Alameda APN; rules 1–3 as `op=idmatch`; SYSTEM read from where the record retrieved the capture; "A fund's name is compared by the plane; every other referent is a reading the caller supplies"; two forms UNJOINED; no vintage held so every APN UNDETERMINED. (Note: Oakland/Alameda-specific recognisers in plane code — see DOCTRINE.)
- [EXAMPLE] §12 goal/objective, src 1172–1174 — Aspiration "Oakland's procurement should be traceable end to end"; Goal "Account for the sewer fund transfers, FY2019 to FY2026"; Objective "Hold a Grade B or better progression instance for every contract over $250k drawn on fund 3100 since FY2019" — fund transfers and contract amounts as targets.
- [DESIGN] §12 satisfaction condition, src 1199–1209 — expressed as entity `fund 3100`, progression `procurement`, filter "award amount > 250000, award date >= 2019-07-01", required instance grade >= B, stages 3..8 present, satisfied when 100% — requires award AMOUNT and award DATE as filterable values (neither held; cf. Incomplete §12 src 61: amount/fund only once the budget-or-dataset type exists).
- [EXAMPLE] §12, src 1213–1219 — "41 of 58 contracts are at Grade B; 12 are Grade C for want of a shared identifier; 5 have no solicitation and no exception document"; gaps are the work list; missing solicitations are records requests.
- [EXAMPLE] §12 discovery loop, src 1227 — "a contract amended past its original value" (cumulative amendment vs original amount).
- [EXAMPLE] §12.2 pursuit record, src 1398–1400 — dead end kept: "We assumed the fund code would appear in the procurement portal and it does not".
- [EXAMPLE] §12.2 claim, src 1432–1437 — "the city moved $2.1m from the sewer fund without authorisation" — the archetypal claim is a money-movement-against-authority claim (transfer, fund, authorisation rule); then unmodelled ("a claim needs a standard of proof attached and that is doctrine rather than architecture"; since designed in Case_Making, Incomplete src 58).
- [EXAMPLE] §12.1, src 1377 — "'I believe the transfers were improper' is an aspiration or a hypothesis".
- [GAP] §11, src 1707–1710 — money progressions fork/merge: "One budget approval covering many contracts ... a project split between two funds" — chain not graph.
- [GAP] §11, src 1711–1714 — "Aggregate claims. 'The city moved $2.1m from the sewer fund' is a claim across documents. Nothing here models a claim as an object" (amount aggregated over documents).
- [EXAMPLE] §14.2, src 1839–1841 — Bob's case: "a hundred-year-old property title, a photocopy of a mimeograph, its terms in cursive no OCR or vision model can read" — historical property/title terms require member transcription (parcels, deeds).
- [BUILT] §15, src 2007 — "structured dataset | an information bundle's data file, hashed whole | whole file | at the file only" — budget/ledger datasets addressable only as a whole file (pre-DEC-23 sense of content).
- [BUILT] §15 tables, src 2021 — `sheet-range` and `doc-table` arms BUILT for office containers (FW-19); workbook defined tables not emitted (D-415); PDF table extraction MEASURED NO-GO (CPDF-18, M-55: "blind to a ruled table") so "no `table(engine)` step exists" — budget tables in PDF budget books can't be extracted as tables.
- [DESIGN] §15 structure shape, src 2008–2011 — evidentiary envelope includes "formulas beside values, hidden rows, columns, sheets"; sheet bound = format CAPACITY not used range; "an EMPTY cell that exists, which in this product is routinely the finding" (src 2019) — a blank budget cell as evidence.
- [DESIGN] §16, src 2055–2057 — text bound measured on a census of 43,282 city assets; legacy binary (0.32%) not built.
- [GAP] §16 D-502, src 2195–2197 — "A CELL BOUNDARY IS STILL NOT MARKED: two table columns on one baseline read as two tokens separated by a space, and nothing says they were two cells" — PDF budget tables (amount columns) lose cell structure.
- [GAP/DOCTRINE] §16 D-306 (BOB #17, 2026-09-19), src 2241–2257 — every corpus-scale fidelity figure is AGREEMENT not ACCURACY; one ground-truth page (`GT_PAGE2`); "Where both engines are wrong the same way, the agreement figure reads high and nothing notices"; CPDF-14 columns "digits DIVERGING from the floor" — amounts OCR'd from scanned money documents have unmeasured accuracy; NOT FUNDED (DEC-74); reopened when "an image-only document becoming load-bearing evidence".
- [EXAMPLE] §16, src 2157, 2226–2233 — money documents in the corpus: `0201-cafr-2002` (161 of 175 scanned pages), ACFR FY2023-24 (form XObject text 80→546 glyphs), Budget Basics (src 2223), FY23-25 budget book (Incomplete src 47).
- [EXAMPLE] §17 ADD, src 2390 — lead "there should be a contract between X and Y — look for it" (a commitment between parties sought before evidence exists; D-194).
- none in src 2451–2590 beyond the general version doctrine (a revised budget or contract document would be handled by the cross-version notice; not named).
- none in src 2591–2712 (appendix evidence; `structured dataset` checked only by `hash:` at `query.mjs:65`, C-2.7, src 2681 — datasets addressable only whole).

## From C4 (C4: BIO_Case_Making_v0_1.txt, BIO_Declared_Bias_v0_1.txt, BIO_Interaction_Constructs_v0_1.txt, BIO_Assistant_and_AI_Roles_v0_1.txt)

- [NEED] Case_Making frame, src 109 — money is one of the six flows to model supposed vs actual (see EVENTS)
- [RULING] Case_Making §2, src 206–216 (D-148, Bob 2026-09-22) — a fee quote is EVIDENCE about the body that quoted it; structured QUOTE on a `received` correspondence entry: amount and currency as quoted, stated basis verbatim (hours, rate, per page), the `sent` entry it answers; capture-or-testify (DEC-13); revisions/waivers are later entries; projected to indexed table `action_quotes` (purge clears; D-21), read side by side by counterparty and request — "Yes, a price quote is evidence"
- [DOCTRINE] same, src 214–216 — record asserts only what was quoted, by whom, when, for which request; that a quote exceeds what governing law allows is a MEMBER's claim in an inquiry (DEC-24) — "the machine may set quotes side by side and never judges one"
- [BUILT] status header src 4 — fee quote BUILT 2026-09-23: C-2.10 quote grammar, `action_quotes`, op=actionquotes
- [DOCTRINE] Case_Making §2, src 234–237 (D-149) — plane encodes no law's rules (fees, clocks, appeals); "a 2026 California bill to loosen the fee rules is pending"; member reads law; fee quote read against it by a member — bears on MONEY rules (fee limits) being member-read, not encoded
- [GAP] same, src 242–243 — quote read "by" counterparty name matched EXACTLY; no match → undetermined (D-148's gap)
- [EXAMPLE] Case_Making §Claim, src 763–764 — "the transfer happened, no resolution authorised it, the balance fell below the statutory floor": a money transfer, an authorisation event, and a fund-balance rule (restricted floor) each a separate inquiry composed by recursion
- [EXAMPLE] Case_Making §CONTRADICTION, src 845 — NEITHER case: "spending was reduced a little" vs "spending dropped a lot" is not a contradiction (different precision of one fact) — money amounts at differing precision
- [DESIGN] Case_Making §ACTION PLAN 3, src 960–961 — plan step resources: "money, member hours, expertise the group may not hold, standing" (the group's own money, not world money)
- [NEED] Case_Making §ACTION PLAN, src 908–910 — plan factors include "financial" (Bob)
- [DESIGN] Case_Making §6b Resources, src 1078–1096 — Bob: resources an ATTACHED free-form LIST, collapsed by default; no enumerated categories, no required fields, "no arithmetic over it"; "do not write a constant nobody measured" — a premature typed schema would be wrong for the first group; caution relevant to money-category schemas
- [DESIGN] Case_Making §ACTION PLAN 7, src 1131 — "we considered litigation and cannot afford it" (group's own finances, working material, never published)
- [DESIGN] Declared_Bias DEC-6, src 221–222 — `contract` and `fund` are subject registry kinds (with `parcel`, `ordinance`) — money objects already registry entities that bias statements may name
- [EXAMPLE] Interaction_Constructs DEC-10, src 144–145 — "three things need attention on the Sewer Fund project" (fund as a project subject)
- [EXAMPLE] Interaction_Constructs §P, src 396–397 — "one check across 58 contracts is ONE proposal with 58 instances" — contract-level checks aggregate
- none in BIO_Interaction_Constructs_v0_1.txt beyond the two examples above; none in BIO_Declared_Bias_v0_1.txt beyond the registry kinds above.
- none in BIO_Assistant_and_AI_Roles_v0_1.txt (no money passages; EXTRACT's "proposed table structure once an engine is measured" (src 139) is the nearest bearing on extracting budget/ledger tables — waits on the engine measurement, EXTRACTION-BREADTH-DESIGN §3.3)

## From C5 (C5: INVESTIGATIVE-SESSION.txt, ASSISTANT-PILOT.txt, RETRIEVAL-SUBSTRATE.txt, CONTRADICTION-IDENTIFY-DESIGN.txt, FINDINGS-WORKPLAN.txt, RETRIEVAL-PROBE.txt)

### INVESTIGATIVE-SESSION
- [EXAMPLE] §5, src 361 — the evidence example ties a contract signing to an emergency declaration (procurement exception logic: emergency excusing a contract). Only money-adjacent mention in 301-600 — "the emergency was declared two weeks after the contract was signed"
- [EXAMPLE] §8, src 770-775 — Bob's "X contract" award questions: conformance to the required contracting process vs. competitive bidding; money commitments (contract award) examined against procurement rules — "Though related questions, the evidence needed to answer each is very different"
- (no other money passage in INVESTIGATIVE-SESSION)

### ASSISTANT-PILOT
- [EXAMPLE] §2, src 108-109 — the context-disclosure example names a money-shaped project: "asking about: S4 · the Sewer Fund project" (a fund as the subject of a project; no money modelling).

### RETRIEVAL-SUBSTRATE
- [EXAMPLE] Finding 1, src 71, 77 — query examples are money-flavoured: phrase `"service fund"`, column-scoped `title:sewer`, prefix `audit*`. Document search only; no amount/number-typed search.

### CONTRADICTION-IDENTIFY-DESIGN
- [EXAMPLE] §1, src 36-37 — Bob's NEITHER case is a money statement: "spending was reduced a little" against "spending dropped a lot" — imprecision, not contradiction.
- [DESIGN] §7, src 129-131 — `precision` fixture pairs: "rounded against exact figures, 'approximately' against a stated number, a summary against the table it summarises" — the figures problem money comparisons must handle (rounding, approximation, summary vs detail table).
- [DESIGN] §5 table, src 100 — `precision`: "the same fact at different precision"; a detector that cannot tell imprecision from double-speak "is switched off inside a week" (src 39-41).

### FINDINGS-WORKPLAN
- none in FINDINGS-WORKPLAN.

### RETRIEVAL-PROBE
- [EXAMPLE] Actuals, src 85-87 — the eight real queries over the 30 real bundles on biosmoke7 were `sewer`, `transfer`, `sewer AND fund`, `auditor`, `daemon`, `fund AND statements` (+2 zero-hit controls): the live record's subject matter is fund transfers and fund statements, searchable only as text.

## From C6 (C6: BIO_Publication_v0_1.txt, BIO_Intake_Doctrine_v1_1.txt, SOURCE-ACCESS.txt, AUTHORITY-AND-TRUST.txt, BIO_Communications_Platforms.txt)

- none in Publication l.1–150.
- [EXAMPLE] Publication §5B l.378 — example notice matter: "City of Oakland · Coliseum lease, 2019 amendment" (a commitment/contract amendment as a matter examined; only example touching money in l.1–410).
- [EXAMPLE] Publication §7 l.739 (DEC-118) — case heading example "Lakeshore Tenants · The Coliseum lease · Edition 2" (a lease as subject matter).
- none else in Publication: the document has no treatment of amounts, funds, flows or budgets.
- [EXAMPLE] Intake §1 l.166–177 (D1, draft position) — "The unit of admission is the evidentiary series, not the source document. One Information bundle carries one line of evidence (the Sewer Service Fund transfer series), and the documents that attest it (an auditor report, fund statements, a budget) live inside that bundle as captures with per-document provenance." A document attesting two independent lines is captured in each; "the reference graph (cites edges) should carry evidentiary dependency, not file management". (The canonical money example: a fund-transfer series attested by audit, fund statements, budget — implies restricted-fund transfers as a line of evidence.)
- [EXAMPLE] Intake §5 l.670–671 — production ids slug the evidence, not the document: "sewer-transfer-series, not auditor-report-2022" (the money series is the unit named).
- [EXAMPLE] SOURCE-ACCESS l.66–70, 146–155 — the money source documents the project needs: Oakland `Annual-Comprehensive-Financial-Reports` (ACFR; `2024-city-of-oakland-acfr_final-121324.pdf`, 5,995,747 B), `Fiscal-Year-2025-2027-Budget` (adopted budget book, 32,521,404 B), `Revenue-Expenditure-Reports`; "None of the material this project needs was ever excluded by robots.txt. The finance and budget paths ... carry no `Disallow`."
- [DESIGN] SOURCE-ACCESS l.157–158 — "The budget book at 32.5 MB will capture multipart and skip subresource parsing, which is correct behaviour" (scale: budget books are tens of MB; parted captures, cf. Intake §8 D-530/D-556 — money extraction must work over parted captures).
- none further in SOURCE-ACCESS l.161–312.
- none in AUTHORITY-AND-TRUST l.1–140 (examples are GIS parcel layers, CAD drawings, hosted papers).
- [DOCTRINE] AUTHORITY-AND-TRUST l.151–152 — "An archive attests that a server sent these bytes at this instant. It attests nothing about whether the figures in them are right." (Provenance of a financial document never vouches for its amounts.)
- none on civic money in Communications l.1–180 (only platform hosting costs: ~$20/month Discourse droplet; shared folders free; the principle "Financial barriers to participation violate the scaling requirement", l.46–49).
- [EXAMPLE] Communications §Next steps l.348–351 — "Publish the sewer fund evidence (Tier 1 materials: City Auditor report, CPRA request and nonresponse record, OpenGov data, Municipal Code provisions)" — the canonical money case (cf. Intake §1 Sewer Service Fund transfer series): auditor report + transactional open-data portal (OpenGov) + the code provisions governing the fund (rules that govern movement).
- [EXAMPLE] Communications §Risk l.296–316 — money-related remedies by tier: Tier 1 "State Controller referrals, City Auditor complaints"; Tier 3 "Proposition 218 challenges, CCP Section 526a taxpayer actions" (fee-limit and illegal-expenditure actions: money rules as the law a finding is measured against). California-specific content held in a product document (predates the jurisdiction-free doctrine; would be profile data today).

## From C7 (C7: BIO_State_Rules_Consistency_v1_5.txt, BIO_Membership_Architecture_v2.txt)

- [EXAMPLE] State Rules §1.1, src 264–278 — example bundle slugs are money cases: "INFO-2026-0001-sewer-acfr-fy24", "INFO-2026-0002-opengov-transfers-fy20-25", "PROB-2026-0001-transfer-relabeling", "PROJ-2026-0001-sewer-fund-diversion"; §1.2 "PROB-2026-0007-acfr-opengov-mismatch" (ACFR vs OpenGov transfers: fund diversion / relabelled transfers as the founding use case).
- [EXAMPLE] State Rules §3.1, src 560–566 — example focus title "ACFR transfers-out disagrees with OpenGov FY23-24" (two money sources disagree on interfund transfers).
- [EXAMPLE] State Rules §4.1, src 693 — source authority "Oakland ACFR FY2023-24"; content_hash of "the canonicalized normalized dataset, not raw capture"; §4.1 snapshot rule src 761–764 three-layer capture (raw, canonicalized normalized dataset hashed and diffed, rendered view) — budget/financial datasets are captured as normalized datasets and diffed.
- [DESIGN] State Rules §4.1, src 679–681 — Information record files: "data/*.json (extraction outputs in tidy/long form)" — financial tables held as tidy/long JSON.
- [EXAMPLE] State Rules §4.3, src 850–851 — Project objective: "Establish whether post-FY21 Sewer Service Fund transfers continue the unauthorized franchise fee under new labels." (restricted fund, fee limit, transfer relabelling: the archetypal money question)
- [EXAMPLE] State Rules §4.5, src 945–956 — claim C-014 "Transfers from the Sewer Service Fund continued in FY 2023-24 under cost-allocation labels." cites INFO-2026-0002 OpenGov transfers snapshot opengov-fy24.json, as_of 2026-07-01.
- [EXAMPLE] State Rules §4.6, src 990–991 — annotation: "The FY24 number may include a one-time insurance true-up; check note 14 of the ACFR before treating this as the pattern continuing." (one-time vs recurring amounts; notes to financial statements)
- none new in 1001–1500 beyond the edge example (src 1022 cites INFO-2026-0002-opengov-transfers-fy20-25).
- none in 1501–1809.
- [EXAMPLE] Membership §1.3, src 139–140 — CPA / "who can read an ACFR" / franchise-fee question: money questions route to members with financial expertise. Otherwise none in 1–500.
- none in 501–1000.
- none in 1001–1500.
- none in 1501–1565 (whole Membership document: only the CPA/ACFR/franchise-fee routing example, §1.3).

## From C8 (C8: MEMBER-KNOWLEDGE-DESIGN.txt, EXTRACTION-BREADTH-DESIGN.txt, DOCUMENT-PROFILES.txt, OFFICE-FORMATS.txt, CONTENT-SEARCH-DESIGN.txt, SCHEDULER.txt)

- [RULING] EB §2 l.9, l.61–63 (BOB #32, 2026-09-24, D-66): "a budget is a plan; an audited financial statement reports actuals and is its own FINANCIAL REPORT type". — "a budget is a PLAN for money not yet spent, an audited statement REPORTS what a closed period did". This is the plan/actuals line, a stage distinction for MONEY made at the document-type level.
- [DESIGN/GAP] EB §2 row 6 l.63–64: the FINANCIAL REPORT recogniser is money density plus one of: the document naming itself an ACFR/CAFR or audited statements, an auditor's opinion, or "the GAAP statement spine together with A PERIOD THAT HAS ENDED". The last conjunct "keeps a budget book's fund-balance schedules out". Counted ~58 ±80 (M-143) and ~89 ±71 (M-176). No reader is written.
- [GAP] EB Incomplete l.15: two of 13 calibration documents (`2024-Single-Audit-Report-PDF.pdf`, `CAFR-2020.pdf`) carry NO TEXT LAYER and are invisible to the instrument. — "the count is a count of financial reports that can be READ and the scanned ones are not bounded".
- [DESIGN/GAP] EB §2 row 5 l.61–62: budget or dataset ~520 ±238 (M-126), recounted ~463 ±225 (M-143), ~577 ±179 (M-176). There are two arms: budgets ("money density necessary") and datasets ("a table of distinct, value-carrying records"). 6 of the 10 datasets are one series, the parcel-exemption status CSVs. — "a dataset is a FORM and the ruling is about a subject, so a workbook of audited figures is honestly both and is reported multi-class." No reader is written: "a reader is its own row".
- [EXAMPLE] EB l.62: "Two of the 8 budgets are audited financial statements (an ACFR/CAFR, the Redevelopment Agency's statements)".
- [GAP] EB l.61: "The office entries read an `.xlsx` dataset (24 of 25 sampled) and read NO `.csv` or `.xls` at all". CSV was since BUILT (OF FW-23). `.xls` (50 legacy keys) still waits (OF l.288).
- [DESIGN] OF §What these formats carry l.117–122: — "A formula is different evidence from its result… For accountability work the DERIVATION is frequently the finding — how a total was reached, which cells feed a projection, what a 'budgeted' figure is actually computed from." "The record should hold both and say which is which." Built: formulas are emitted beside cached values (l.15, l.18).
- [DESIGN] OF l.127–128: "A hidden XLSX sheet is a first-class finding, and it is invisible in every rendered form of the document." Built: hidden rows, columns and sheets are emitted.
- [GAP] OF l.305–310 and Incomplete l.11: "A published budget workbook can be tens of megabytes and hundreds of thousands of cells." The bound is 20 MiB declared uncompressed text (passes 86 of 88). Excluded: the 2019/2020 police Stop-Data workbooks, which read `text-undetermined`, and a streaming extractor to 64 MiB is DEFERRED. CS l.329–330: "18 workbooks in the census are over it".
- [GAP] OF Incomplete l.18: tables are NOT extracted as content. — "a workbook's grid is reachable as cells and as text and never as a table". Charts and embedded file contents are not read. Partly superseded by FW-19's `sheet-range`/`doc-table` arms (EB l.5). EB l.5 and D-415: "a workbook's defined tables and named ranges as units" are NOT built.
- [BUILT] EB §3.2 l.84–92 (FW-19): `sheet-range {sheet, range}` and `doc-table {table, cell?}` extent arms exist with `covers` refusal. OF l.107–110: a spreadsheet cites `Sheet1!B14`, "stable, human-meaningful, and exactly the granularity a citation wants". This is the citation grain for a money figure.
- [GAP] EB §3.3 l.103 and Incomplete l.16 (M-55): PDF table recognition is NO-GO. A geometric step recovered "the unruled table exactly and the RULED one not at all". No `table(engine)` step exists. Budget tables published as PDF are therefore citable only as page rectangles with text, with no structure.
- [GAP] CS Incomplete l.51 and §4.1 l.183: "288 workbooks in COFF-6's census hold 72,651,441 bytes of extracted text over 1,056 sheets and not one indexable unit between them". A workbook is searchable at document grain only, and the `indexed` state says `none: no unit arm for this container`. Money data in workbooks is not passage-searchable. CS l.369's worked example: "31 workbooks: no unit arm".
- [BUILT] OF §CSV l.215–234 (FW-23): CSV is one sheet. Row 1 is row 1. — "a header is a reading and is never assumed". Cells use `sheet-cell`/`sheet-range` and carry the capture's grade. Measured: 166 keys, 778,830 cells.
- [DESIGN/BUILT] OF l.247–251: an undetermined encoding nulls only the cells holding a high byte, each named by address. "byte `0x96`… an en dash in windows-1252 and the letter ñ in Mac Roman" (138 cells in one file). A money figure is never silently mangled.
- [GAP] OF Incomplete l.28–30, l.278–286 (D-593): a `text/csv` body's reading text at acquire is a lossy UTF-8 decode, not the entry's `text()`: "the sheet's cells are not the units the reader sees". OF l.20–27: the CSV size bound is unsettled (it excludes 1 of 166).
- [EXAMPLE] MK §3 l.104–106 and §6 l.273: "the vendor was favoured" is the only procurement and money example in MK.
- [DESIGN] SCH l.145–160: a cost statement for a consumer: "ONE PROBE PER REGISTERED ENGINE PER CADENCE… ON THE INSTANCE'S OWN ACCOUNT… AND ZERO ON AN INSTANCE THAT HAS REGISTERED NOTHING". This is about operating cost, not MONEY as a construct.
- none in DOCUMENT-PROFILES on money as a construct (DP's evidence base is three web stacks; no financial document handling).

## From C9 (C9: action-design/ACTION-PLAN.md.txt, action-design/INVENTORY.md.txt, action-design/MATRIX.md.txt, action-design/sources_build-state.md.txt, action-design/sources_canon-constructs.md.txt, action-design/sources_canon-mission.md.txt, action-design/sources_code.md.txt, NOTIFICATIONS.txt)

- [RULING] ACTION-PLAN ruling 3 l.9 — "No budgets. Neither money nor licensed resources are costed." (the group's own resources; A15 l.55 "no assignees, hours, costs").
- [EXAMPLE] ACTION-PLAN ruling 4 l.10 — one option may serve several rules: "public awareness of a bond measure falsely certified *and* of its proceeds moved to the general fund".
- [EXAMPLE] ACTION-PLAN Worked example l.65–68 — $100M school bond; deposit against "the requirement that bond proceeds serve the voter-approved purpose" (restricted-fund rule); option "a demand to move the proceeds to a restricted account"; dependency: proceeds of a measure that never passed "should not exist" (money's legitimacy depends on an authorising event).
- [BUILT] INVENTORY §4 l.51 — consequences: harm to "a class, fund, program, service or body", "measured, computed from the record or assessed by a member, with causation as its own finding; whether each part is addressed" — a fund can be the harmed party; measured amounts exist in consequences.
- [BUILT] INVENTORY §4 l.52 — actions hold "fee quotes" (money on the group's records requests).
- [EXAMPLE] INVENTORY §3 l.29 — money-linked action kinds: State Controller referrals, Prop 218 challenges, taxpayer actions.
- [OPEN] INVENTORY §6.8 l.93 — what "consequences addressed" means in practice.
- [BUILT] sources_build-state §1.3 l.121–128 — consequences Measure `{unit, currency?, value | range}`, unit ∈ {money, benefits, services, time, count}; part state computed (basis op ∈ sum, difference, count, product, ratio; operands = content ids; "the grade is the weakest of the operands' captures"), assessed (member, rationale; machine refused), undetermined ("never read as zero").
- [BUILT] sources_build-state §1.3 l.114 — `consequencesOf`: "totals within one state, unit and currency, and the undetermined and unproven lists" (R7) — a built money-arithmetic rule: no totals across states/units/currencies.
- [BUILT] sources_build-state §1.3 l.126 — causation ∈ {established (names an inquiry), unproven, not_applicable (zero measure)}; "Causation is a finding that needs evidence and is never assumed" (l.107).
- [BUILT] sources_build-state §1.3 l.120 — `fund` and `program` are affected kinds (money destinations as harmed parties).
- [BUILT] sources_build-state §1.4 l.143, l.154 — actions hold fee quotes and the records-request lifecycle; quote grammar (R20–R22), `actionQuotes`.
- [DESIGN] sources_build-state §2(e) l.387 — a machine may record a *computed* consequence part only, labelled, operands shown (cons R2; K102).
- [DOCTRINE] sources_build-state §2(b) l.344 — escalation: "Policy advocacy and candidate support have no purpose value (R12; K14)" (bears on campaign/political money as action, not as record).
- [RULING] sources_canon-constructs §4.2 l.89 — D-148 (Bob): "Yes, a price quote is evidence"; lives on a `received` correspondence entry; matched by counterparty name "EXACTLY; when nothing matches, it is stated as undetermined" (PUB §3 rule 15(d)).
- [DOCTRINE] sources_canon-constructs §4.2 l.90 — D-149: "**The plane encodes no law's rules**: fees, clocks, appeals" — fee rules are not product code (bears on money rules: fee limits as data/held law, not encoded).
- [EXAMPLE] sources_canon-constructs §3 l.63 — CF §12 aspiration: "Oakland's procurement should be traceable end to end."
- [EXAMPLE] sources_canon-constructs §4.6 l.122 — Tier 3 kinds: "Proposition 218 challenges, CCP Section 526a taxpayer actions, federal consent decree motions"; Tier 1 State Controller referrals; legal organisations "HJTA, ACTA, First Amendment Coalition, Prop 218 specialist attorneys" (l.196).
- [DESIGN] sources_canon-constructs §1.2 l.20 — funders declined as audience ("compellingness, which the doctrine forbids").
- [DOCTRINE] sources_canon-constructs §3 l.69 — DEC-84 (10): "Recommendation limited to a proposed action, never a policy position."
- none else on government money flows in this file.
- [DOCTRINE] sources_canon-mission §4c l.138 — Req 8: "The system minimizes financial barriers to escalation but does not provide or manage funding."
- [GAP] sources_canon-mission §6.17 l.221 — "Funding and cost of actions": "The resources list is free-form and has no arithmetic." (l.50: resources include "money, member hours…").
- [EXAMPLE] sources_canon-mission §1b l.44 — money-reading expertise named: "a franchise-fee question", "who can read an ACFR" (Annual Comprehensive Financial Report).
- [EXAMPLE] sources_canon-mission §4a l.113, l.120 — State Controller referral (Gov. Code 12422.5(e)); Prop 218 challenge; CCP §526a taxpayer action (Tier 3) — money-law venues, all Californian.
- [EXAMPLE] sources_canon-mission §1a l.18 — Bob: plan may differ by "(strategic, tactical, political, financial, temporal) factors".
- none on government budgets/flows otherwise.
- [BUILT] sources_code §1.3 l.75–83 — `figures.mjs` `compute` over OPS sum, difference, count, product, ratio; `UNITS` money, benefits, services, time, count; `AFFECTED_KINDS` class, fund, program, service, body, other; `UNDETERMINED_WHY` = not_in_record, form_not_read, not_assessed, not_computable (the "form_not_read" reason ties money figures to extraction of forms).
- [BUILT] sources_code §1.3 l.85–86 — refusals: `CONSEQUENCE_NOT_NONCOMPLIANT`; machine only computed parts.
- [BUILT] sources_code §1.4 l.107 — `actionQuotes` :1611 "reads quotes across actions by counterparty" (the only cross-record money read built in layer 9); table `action_quotes` (l.116).
- [BUILT] sources_code §1.4 l.125 — fee stages: fee_waiver_request, fee_estimate, fee_waiver_decision.
- [BUILT] sources_code §7 l.257 — Oakland tier-3 kinds assessment_challenge, taxpayer_action, consent_decree_motion, constitutional_claim (money-law challenges as profile data).
- [EXAMPLE] NOTIFICATIONS l.90 — "an award follows a solicitation" (procurement flow as a declared civic obligation).
- none else in l.1–220.
- none in l.221–441.

## From D1 (D1: design-journeys.txt, design-ux-audiences.txt, design-ux-useCases.txt, design-ux-journeyExperience.txt)

### design-journeys.txt
- [EXAMPLE] §3 l.99 — Police overtime: "Capture the adopted budget, the actual spending, and any overtime policy or audit." Question: "How do the actuals compare with what was budgeted and what policy allows? An accountant member checks (journeys 8 and 7)."
- [EXAMPLE] §3 l.100 — services moved onto bond measures: "Capture past budgets, the measure's own text, and the city's statements"; "campaigning for or against a measure is outside what a group's record prepares".
- [EXAMPLE] §3 l.98, l.110 — franchise with waste hauler: "declare its service levels, rates and fees as standards"; "Is the hauler delivering what the franchise requires".
- [EXAMPLE] §3 l.107–108 — news story on "cost overruns on a capital project"; "The annual financial report shows an unexplained fund transfer" → "A question, and a check from an accountant member (journeys 8 and 7)".
- [EXAMPLE] §3 l.111 — utility rate case before state commission.
- [GAP] J6 l.230 — "Civicsmith can capture and read a spreadsheet, but the requirements show no way to compute over one inside the product, so for now the calculation is the assistant's or a member's, shown with its method. A built-in, repeatable calculation step may be needed."
- [EXAMPLE] J5 l.219 — request outcome may be "a fee quote".
- [EXAMPLE] §1 l.137 — Cloudflare account "with a payment method" (operational, not construct).
- [GAP] §6 l.528 "Calculating over a dataset" — needed by journey 6 and "the police-overtime and bond-measure rows": "Spreadsheets are read as text and structure; their formulas are kept but not worked out. The only calculation in the product comes after a breach has been determined."
- [GAP] §6 l.529 "Explaining a charge or a rule" — sewer-utility row ("What's this sewer maintenance charge on my water bill?"): "Nothing finds and explains the ordinance or rate schedule behind a charge."
- [GAP] §6 l.534 — assistant's Claude account "pays for its work" (operational).
- [EXAMPLE] J13 l.365 — "a counsel packet for a serious matter".
### design-ux-audiences.txt
- [DESIGN] Operator l.25 — must hold "a paid cloud account with a payment method" (installer R7, R23) — operational only, not the construct.
- [EXAMPLE] Professional l.467 — "Be routed the questions they can judge (e.g. a Brown Act or franchise-fee question)." (Membership v2 §1.3).
- [EXAMPLE] Owner l.548 (not money; kept for routing context) — project kind of work "(reporting, fixing, legal, oversight, other)" shapes assistant only (action-plans R21; D4).
### design-ux-useCases.txt
- [DESIGN] UC-018 l.405 — the subject registry is already meant to hold "funds, programs" as subjects (entities) — money containers exist only as named subjects, no amounts.
- [DESIGN] UC-035 l.791 — standing collection "within budget" (operational cost budget, not the construct); UC-036 "Trouble or cost".
- [EXAMPLE] UC-067 l.1521 — "scale" as a significance consideration (human judgment only; no field).
- [DESIGN] UC-119 l.2728 — "fee quotes as evidence" (records-request fees; Case Making §2) — the only money amount the action ledger holds.
- [DESIGN] UC-112 l.2562 — consequences "computed, assessed or undetermined, with causation established or unproven"; "Parts never composed into one figure" — consequence parts (harm, possibly monetary) computed post-breach; cf. journeys §6 l.528 "The only calculation in the product comes after a breach has been determined."
- [EXAMPLE] UC-120 l.2763 — "Roadmap section 1 (CPRA 26-3028)" records request.
- [DESIGN] UC-126 l.2907 — "a plan holds no resources (Bob's ruling 3)" — the group's own plans carry no budget/money.
- [DESIGN] UC-134 l.3073–3091 — "Read the copy's health, build and cost" (instance-setup R17–R18, R33–R40) — operating cost of the copy, not the construct.
### design-ux-journeyExperience.txt
- [DESIGN] (a) l.10–14 — install needs "a paid account with a payment method"; "No payment method: refused" (installer R4, R7) — operational only.
- [DESIGN] (c) l.489–498 "Record consequences" — "What the record can compute; what must be assessed"; decision "Computed, assessed or undetermined; causation"; "Totals only within one state."; feelingRisk "Composing harm into one headline figure (refused)." — consequence amounts (incl. money harm) may be totalled only within one state (computed/assessed/undetermined).
- [DESIGN] (e) l.828 — run opened with "the run's budget and scope beside it (DEC-88 item 4)" (operational budget).
- [DESIGN] (h) l.1070–1072 — records request return: "quote" recorded; "QUOTE_NOT_ON_RECEIVED" (a fee quote only on a received entry) (actions R15–R22).
- [DOCTRINE] (k) l.1243, l.1247 — OPTION_KEY_REFUSED "budget, cost" on plan options: the group's own plans never hold money (cf. UC-126 "a plan holds no resources", Bob's ruling 3). Any MONEY construct must keep the group's own cost out of plans.

## From D2 (D2: design-ux-surfaceRules.txt, design-principles.txt, design-brand.txt, design-measures.txt, design-HANDOFF.txt, design-view-matter-page.txt, design-view-plan-page.txt, design-view-start-and-send.txt, design-view-surfaces.txt)

- [EXAMPLE] brand §3 "Neutral on policy" l.60 — the counter-example "never The city illegally diverted funds" vs "Noncompliant with the two-thirds requirement, as determined by Rosa on 3 March" — money diversion as a typical finding subject, phrased only via member determination against a requirement.
- Otherwise none in design-principles.txt, design-brand.txt.
- [EXAMPLE] measures l.78 — project question example "Were the FY22 sewer fund transfers authorized?" (fund transfer authority as canonical inquiry).
- [GAP] HANDOFF U41 "Arithmetic" l.73 — "the only calculation is consequences R2 (sum, difference, count, product, ratio over cited figures, weakest-input grade), reachable only after a noncompliant determination; spreadsheets read as text and structure, formulas kept not evaluated (office-readers R10); no budget reader, no general or reproducible calculation."
- [GAP] HANDOFF U41 "High-level questions" l.74 — "nothing explains a charge from its ordinance or rate schedule." (fees/rates)
- [GAP] HANDOFF §4 l.62 — journey 6: "Civicsmith checks claims against the city's own records plus members' spot-check samples; it does not log every pothole; gap: no in-product calculation over a dataset" (outputs/deliverables measured against claims). l.64: hand BOB "a calculation step if Bob wants it".
- [DESIGN] HANDOFF §4 l.62 — setup names accounts needed "Cloudflare with a payment method; a Claude subscription account" (group's own costs; not construct money).
- [EXAMPLE] matter-page l.29 — consequence measure "$100,000,000 of bond debt authorised" for "Property owners in the district (a class)", "computed from the resolution and the bond schedule · grade B, co-attested" — money amount computed from two documents with a grade (consequences R2 calculation).
- [EXAMPLE] matter-page l.31 — "The school facilities program (a program)" measure "undetermined · the program's budget has not been captured"; "Undetermined is never read as zero." l.33 — program as money destination; budget as needed source document.
- [EXAMPLE] plan-page l.32 — subject 2 "The deposit of bond proceeds into the general fund, against the voter-approved purpose" noncompliant — a money flow (proceeds → fund) judged against a restriction (voter-approved purpose = restricted funds rule).
- [EXAMPLE] plan-page l.58 — planned action "Demand to move the proceeds to a restricted account · to the Finance Department".
- [EXAMPLE] surfaces l.16 — standard "Bond proceeds to serve the voter-approved purpose · statute · the state legislature" — money-movement rule held as a standard.
- [EXAMPLE] start-and-send l.23 — "Subject 3: the fund's audit trail hypothetical: not yet shown" — fund audit trail as a matter.
- [EXAMPLE] plan-page l.24 / matter-page l.18 — vote percentage 61.8% vs two-thirds (numeric comparison in a determination; not money but same calculation shape).
- [EXAMPLE] surfaceRules Queue l.110–112 — "Never present a machine finding as an obligation; one check across 58 contracts is one proposal with 58 instances." (Interaction Constructs §P; D-79) — contracts as a set the assistant checks in bulk.
- [DESIGN] surfaceRules l.1614–1617 — consequence parts "by state (computed, assessed, undetermined) ... totals only within a state" (consequences R2–R7) — the existing money-amount discipline: no totals across computed/assessed/undetermined.
- [DESIGN] surfaceRules l.1619–1622 — each action has a "ledger" (actions R25) — the action's correspondence ledger, not money (taken-word caution for MONEY's "ledger").
- [DESIGN] surfaceRules primaryActs l.1824–1828 — addressedrecord / consequencerevise reasoned.
- [DOCTRINE] surfaceRules Action plan l.3076–3079 — "Never a cost, budget, assignee, hours, score or priority." (action-plans R26; PATH.md §3; Bob's ruling 3) — the group's own plans carry no cost/budget. Shows that "budget" is today explicitly excluded from the group's planning; a MONEY construct concerns the government's money, and must not reintroduce cost/priority into plans.
- none further in the last chunk (no amounts, funds or ledgers appear in the plan/tray/start-and-send rules).

## From M1 (M1: src/req/local-facts.txt, standards.txt, conformance.txt, consequences.txt, action-grammar.txt, actions.txt, action-clocks.txt, filing-templates.txt, filings.txt, escalation.txt, action-plans.txt)

- none in local-facts.
- none in standards directly; a standard's kinds (statute, regulation, ordinance, court, policy, commitment) would hold money rules (fee limits, procurement thresholds, grant conditions) only as text: no field for amounts or thresholds (R12: "the six kinds are the whole vocabulary").
- [DESIGN] standards l.15 — "public commitment" is a standard kind (`commitment`): a promise by a government can be held as a standard, the nearest hold for a money commitment/promise as a rule.
- [GAP] consequences l.5 — "Money in the record today is only a correspondence fee quote (D-148: `action_quotes`, `schema.mjs` 2012; `store.mjs` 6882–7060). The record holds no amounts or fund figures as values (`EXTRACTION-BREADTH-DESIGN.md` §2 rows 5–6: no budget or financial-report reader; `progressions`' question 3, K102)." Hence "most consequences will be assessed or undetermined".
- [DESIGN] consequences Terms l.18 — measure `{unit, currency?, value | range}`, unit `money|benefits|services|time|count`; `currency` only on `money` (`MEASURE_INVALID`); affected kinds include `fund` and `program` (the only place in these modules a fund/program is named, as free description, not a held object).
- [DESIGN] consequences R2 l.22 — computed part: `{op, operands}`, op `sum|difference|count|product|ratio`; operands are content ids whose passage holds the figure "with the figure as read"; "The value is the module's own arithmetic over the operands, never the author's"; grade = weakest operand capture grade (DEC-21), named. Machine may record computed parts, labelled (K102).
- [DESIGN] consequences R3 l.23 — assessed: member states value or range with rationale ≤2,000 chars and what it rests on; "never presented, summed or graded as computed".
- [DOCTRINE] consequences R4 l.24 — "An undetermined part is never read as zero."
- [DESIGN] consequences R7 l.29 — totals "summed only within one state, one unit and one currency"; nothing summed across states, units, currencies.
- [DESIGN] consequences Suggestions l.77 — "a spreadsheet cell or table extent (`content`'s `sheet-range` and `doc-table` arms) is the natural operand. A parser of figures is this module's; a budget or financial-report reader, when written, belongs to `extraction`/`docprofile`, not here."
- [DESIGN] consequences R8 l.30 — operand capture changed → `basis_changed`; nothing recomputed.
- [GAP] consequences — no stages of money (budgeted/spent), no flows, sources or destinations, no fund as object; `fund` is only an affected kind with a description.
- [NEED] consequences Purpose l.14 — measure of harm "a class of people, a fund, a program, a service ... money, benefits, services, time, counts and the period".
- [BUILT] action-grammar R4 l.27 / actions R3, R27 — fee quotes on received correspondence: `quote_amount`, `quote_currency`, `quote_basis?`, `quote_answers` (a sent entry), `quote_revises?`; "A waiver is a revision to zero; both stand." Refusals C-72.1–C-72.5 (`QUOTE_AMOUNT_NOT_A_NUMBER`, `QUOTE_NO_CURRENCY`...). D-148. The only money values stored in the record today (per consequences l.5).
- [DESIGN] action-grammar R2 l.21 — `QUOTE_KEYS`, `isQuoteEntry`, `quoteValue(amount)` (parses the amount; `QUOTE_NUMBER_RE`, l.4).
- [DESIGN] actions R27 l.68 — `actionQuotes` by counterparty or request: amount as quoted, parsed value, currency, basis, counterparty, revisions; at most 500; empty answer names level (`no_request`, `no_reply`, `no_quote`, `no_quote_by_name`); "No field compares one quote to another."
- [DESIGN] action-grammar R5 l.30 — `FEE_ESTIMATE_WITHOUT_QUOTE` (C-94.7): a fee-estimate lifecycle stage must carry a quote.
- [GAP] actions — money only as fees charged to the group for records; no government money flows, budgets or contracts.
- none in action-clocks.
- none in filing-templates (no fee/cost blanks named in the requirement; `FILING_BLANKS` content not listed here — would need code to check whether a blank for an amount exists).
- [DESIGN] filings R9 l.39 — the packet includes "The breach consequences (`consequences.consequencesOf`) ... as recorded, states kept apart": money harm reaches counsel only through consequences parts.
- [DESIGN] filings R15 l.51 — remedies are candidate theories (R14) with free-text `remedy?`; no amount or relief valued ("no ... prayer or form of relief", R10).
- none in escalation (no money condition; stage 7 `audit_request` is the only nod to financial oversight, as a purpose).
- [DOCTRINE] action-plans R26 l.109 — "No field, input or answer holds a cost, budget, amount of money to be spent, assignee, hours or significance score; a key named `budget`, `cost`, `assignee`, `hours`, `significance`, `priority` or `score` is refused `OPTION_KEY_REFUSED` (Bob's ruling 3 of 2026-09-29, and DEC-24 on significance)"; Purpose l.14 "It is not a project-management system: it holds no costs, assignees or hours."
- [CONFLICT/OPEN] action-plans R26 vs MONEY (K1457) — the refusal concerns the group's own spending on a plan, not government money; but a MONEY design must not let a plan option carry amounts (e.g. a remedy's restitution sum) through these keys; and a key named `budget` is refused even where a group would name a government budget line as a subject. Scope of Bob's ruling 3 (group costs only?) should be stated.
- [BUILT] consequences figures.mjs — figure parser: digits with separators, decimals, parentheses negatives, signs $€£¥, scale words (thousand/k, million/m/mm/mn, billion/bn/b, trillion/tn); "parsed exactly"; sum/difference to operand decimals, product/ratio to 15 significant digits; `passageHolds` requires the passage to contain the figure. Limit: currency sign in a figure not checked against the part's `currency`.
- [DOCTRINE] skills R28 (skills.md:71) — `action_planning` clauses include BIO_Action §4 "rule 8 (no catalogue, no budgets)".
- [GAP] T32 Left out A37 — "progressions R32 — dependency not yet built — no amounts or funds as values": the record still holds no money values beyond fee quotes.

## From M2 (M2: src/req/jurisdictions.txt, id-spaces.txt, docprofile.txt, office-readers.txt, odf-reader.txt, extraction.txt, content.txt, entities.txt, connections.txt, progressions.txt, bias.txt)

### jurisdictions
- [DESIGN] jurisdictions R3 (src 17) — `spaces` include `fund` (and `project`, `parcel`): the fund identifier's forms and normalisation are profile data; no amounts, accounts or budget structures.
- [DESIGN] jurisdictions R21 (src 86) — first profile's `systems` include "the budget data set" and "the county assessor's layer republished by the city's portal, provenance unstated", "the permit system", "the auditor".
- [DESIGN] jurisdictions R25/R36 (src 35, 91) — action kinds include `assessment_challenge`, `taxpayer_action` (Tier 3, HJTA evaluates): money-related actions exist only as the group's filings.
- [GAP] jurisdictions (whole) — no fiscal-year, fund-structure, procurement-threshold, fee-limit or chart-of-accounts section; money rules a profile could carry (thresholds, fiscal calendar) are absent.
### id-spaces
- [DESIGN] id-spaces R1, R20 (src 16, 50) — `fund` space's `referent` is `name` (others `reading`); for a fund, "Names equal after normalising (case, punctuation, the word 'fund') give `SHARED`"; an end with no name gives `FUND_NAME_ABSENT`: the only machine identity of a fund across documents.
- [DESIGN] id-spaces R17–R18 (src 47–48) — different forms are `FORMS_UNJOINED` unless a captured crosswalk joins them; leading-zero `near_miss` "is never counted" — applies to fund/project numbers.
### docprofile
- [DESIGN] docprofile Uses (src 163–165) — report-template section headings include "fiscal impact": recognised as a staff-report section, no money parsing named.
- [GAP] docprofile — no budget/ledger/financial-statement content type among the registered ones (src 240–241 lists `meeting_minutes`, `meeting_agenda`, `regulation`, `staff_report`, `staff_directory`, `meeting_calendar`).
### office-readers
- [BUILT] office-readers R10 (src 113–116) — xlsx `{kind:"formula", source, formula, value}` per formula cell — "`value` is the cell's cached `<v>` (`null` when the file carries none, never invented), held BESIDE `formula`, never substituted" — budget workbooks' arithmetic is preserved as evidence; plus hidden rows/cols/sheets (src 116–119).
- [BUILT] office-readers R11 (src 153–161) — xlsx `sheets [{sheet, name, hidden, rows, cols, usedRows, usedCols, range, text, undetermined}]`, `document` tab-joined per row; unresolved shared strings "a stated `undetermined`, never an invented string" — the substrate a spreadsheet of budget/ledger lines would be read from; no typed numeric cell output (text only).
- [BUILT] office-readers R9 (src 88–97) — xlsx defined names and tables become `rangeUnits` (one rectangle on one sheet) with `rangeUnitsSkipped` reasons — named ranges in financial workbooks addressable as units.
- [BUILT] office-readers R11/R14 (src 162–170, 193–207) — CSV: "Row 1 is always row 1: no record is consumed, skipped or reinterpreted as a header"; empty field = measured emptiness; dialect (encoding, delimiter) with confidence — open-data budget/checkbook CSVs read without header interpretation.
- [GAP] office-readers R11/R12 (src 3, 174–184) — size guard 20 MiB (`MEASURED_OOXML_TEXT_BOUND_BYTES`), CSV bound unsettled "until measured on a deployed plane (DIST-14)": a large checkbook/ledger file over the bound yields `document:null` (no silent truncation).
### odf-reader
- [BUILT] odf-reader R15 (src 100–104) — `.ods` `formula` items: `formula` verbatim (OpenFormula `of:` prefix kept), `value` displayed text; "The formula is never collapsed into, or substituted for, the cell's displayed text."
- [BUILT] odf-reader R19 (src 125–129) — sheet `text` uses displayed value, never formula; counts `cells`, `formulas` — text-only, no typed numbers/currency.
- [BUILT] odf-reader R16 (src 105–111) — hidden rows/cols as ranges with `visibility` collapse|filter, hidden sheets — hidden budget lines remain evidence.
- [BUILT] odf-reader R44 (src 222–223) — named ranges and database ranges as `rangeUnits` (`sheet-range`).
- [GAP] odf-reader R45 (src 224–225) — `ODF_REPEAT_EXPANSION_MAX` 262,144 units and 20 MiB repeated-text bound: a very large sheet answers as over the guard.
### extraction
- none in extraction.txt beyond the general reading/reference substrate (no money-specific reference kinds, amounts or ledger tables named).
### content
- [DESIGN] content R1/R7 (src 17, 26) — `sheet-cell` and `sheet-range` extents with grid-capacity checks ("never the used range: an empty cell exists") — a budget figure in a spreadsheet is citable down to its cell; `doc-table {table, cell?}` makes a table cell in a document citable.
- [DESIGN] content R46 (src 92) — `passageText(contentId)`: text at exactly the row's extent or `null` ("never as empty text"; `consequences` R2 reads null as undetermined) — the one service returning a cited cell's text; text only, no typed number (any amount parse would be downstream: calc-grammar/lines/calculations, ruled K1438–K1439, not here).
- [GAP] content — no numeric/currency value on a row; a cited figure is a passage of text.
### entities
- [BUILT] entities Terms (src 17) — kinds `fund` and `contract` (and `parcel`): money objects registrable as subjects; no amount, period, parties, or stage fields.
- [DESIGN] entities R20–R24 (src 51–55) — `idMatch` over id-spaces (`enactment`, `project`, `fund`, `parcel`); "the fund name is the only referent compared here"; systems judged from record-located addresses (≤32 per capture), member-declared origin first (R23).
- [GAP] entities — no relation for funds/contracts (pays, funds, awarded_to, party_to); `proxy_for`/`member_of`/`overlaps` only.
### connections
- [DESIGN] connections R1 — a fund or contract entity (entities kinds) connects documents that both name it (e.g. budget and staff report naming one fund number, A via id-spaces) — money objects link documents, not amounts or flows.
- [GAP] connections — no flow/transfer edges (from fund to payee, amount, date).
### progressions
- [GAP] progressions R32 (src 102) — "A junction check (Framework §8.2: one response, a signed amount differing from the award, amendments past a threshold, payments past the term) is data over an instance and yields a finding. *(not yet met: no row; deferred by K102 until the record holds amounts and funds as values, `EXTRACTION-BREADTH-DESIGN.md` §2 row 5, its stated trigger)*" — the canonical MONEY-in-process gap: award vs signed amount, amendment thresholds, payments past term.
- [EXAMPLE] progressions R32 — procurement progression (solicitation → response → award → contract signed → amendments → payments) is the stated exemplar of junction checks.
### bias
- none in bias.txt.
### verified in code (module job)
- [GAP] docprofile doctypes — no content type parses amounts; staff-report "FISCAL IMPACT" is a heading only (staff-report.mjs:34); readers return text, and no module in this set holds a number as a value. progressions R32 left out of T32 (A37) for exactly that reason.
- [BUILT] bio-plane/src/idspaces.mjs:13–14, 30, 320 — "A fund code counts only when the fund NAME agrees too; a bare code never counts."

## From M3 (M3: src/req/inquiry-grammar.txt, inquiry.txt, citation.txt, strength.txt, basis-versions.txt, run-rules.txt, ai-runs.txt, run-productions.txt, skills.txt, agent-worker.txt, capture-requests.txt)

- none in any of the eleven files: no amount, currency, fund, flow or ledger appears in a leg, a grade, a run or a capture request.
- [GAP] skills R28 (L73) — action rule 8 "no catalogue, no budgets" (the group's own action planning holds no budgets; a doctrine, not a money construct).
- [GAP] (cross-check, not my module) T32 Left out A37: "progressions R32 | dependency not yet built | no amounts or funds as values" — confirms no amount value type exists.
- [GAP] K1447 (ii) rules a `calculation` leg (capture axis the weakest input capture; recipe arithmetic not a weakening step; third-party engine value undetermined until measured; unbound inputs testimony; method disclosed, not graded) — the grading route money totals would take; not yet in inquiry R4 / strength R1–R5.
- [DOCTRINE] strength R10 (L34) — no composed single figure (`score`, `overall`, `rating`, `value` refused): any money "risk score" is barred by the same rule; skills R17 "no single confidence score".

## From M4 (M4: src/req/retrieval.txt, query-language.txt, observation-log.txt, intent.txt, reevaluation.txt, monitoring.txt, scheduler.txt, acquisition.txt, sources.txt)

- [DESIGN] retrieval R25 L72 — a workbook's text found by `passage:` at sheet grain with a `sheet-range` extent (D-672): ledgers and budgets are searchable as text, not as numbers.
- [GAP] retrieval Suggestions L163 — "A workbook's named tables and ranges are not their own search hits for now ... revisit when a member asks (K102)".
- [GAP] query-language R3 L21 — no amount, fund, account or budget field; numeric comparisons only on registered number fields (`annotations`, `legs`, `risk`; code query.mjs:74, 106, 118).
- [GAP] T32 "Left out" A37 — "progressions R32 | dependency not yet built | no amounts or funds as values" (bears on intent's conditions over progressions).
- [DESIGN] intent R4 — `satisfied: {share}` is a percentage of instances, not money; none else in intent.
- none in observation-log, reevaluation, monitoring, scheduler, acquisition, sources (an amended budget reaches findings only as a newer capture, reevaluation R14).

## From M5 (M5: affordances, op-declarations, wizard-scripts, tasks, queue, control-plane, publication, corpus-export)

*affordances*
- none in affordances.txt (no money act, vocabulary or rung; `filingsent` (R36 l.76) is the only "sending", of a filing).
*op-declarations*
- none in op-declarations.txt.
*wizard-scripts*
- none in wizard-scripts.txt.
*tasks*
- none in tasks.txt.
*queue*
- none in queue.txt (no money-related item kind; `export-performed` N-1 is a corpus export, not money).
*control-plane*
- none in control-plane.txt.
*publication*
- none in publication.txt.
*corpus-export*
- none in corpus-export.txt.
*repository verification*
- [BUILT] entities/index.mjs:29 — `fund` and `contract` exist only as entity kinds (a registry subject), published as `VOCABULARIES.entity_kinds`; no amount, currency, stage, flow or ledger anywhere in my eight modules.
- [GAP] build/plan/archive/T32.md "Left out" row A37 — "progressions R32 | dependency not yet built | no amounts or funds as values" — the only money-adjacent deferral in the build state reachable from my reading.

## From M6 (M6: src/req/contradiction.txt, case-authoring.txt, promotion.txt, docket.txt, case-grammar.txt, case-import.txt, case-disclosures.txt, queue-producers.txt)

**contradiction** (src/req/contradiction.txt)
- none explicit in contradiction.txt; label `precision` / dismissal reason `same_fact_different_precision` (R1, R31, l.26,128) would cover two amounts differing only in rounding, but no amount-aware key or comparison exists

**case-authoring** (src/req/case-authoring.txt)
- none in case-authoring.txt

**promotion** (src/req/promotion.txt)
- none in promotion.txt

**docket** (src/req/docket.txt)
- none in docket.txt (an `outcome` entry may record e.g. a refund or settlement, but nothing models amounts)

**case-grammar** (src/req/case-grammar.txt)
- none in case-grammar.txt

**case-import** (src/req/case-import.txt)
- none in case-import.txt

**case-disclosures** (src/req/case-disclosures.txt)
- none in case-disclosures.txt

**queue-producers** (src/req/queue-producers.txt)
- none in queue-producers.txt

## From M7 (M7: record-core, provenance, membership, instance-setup, text-chain, reading-pipeline, ratification, review, project-stage)

- [DESIGN] text-chain R61, R64, R72, R92–R98 (L231–238, L276–278, L348–354) — reading positions `sheet-cell`, extents `sheet-range` and `doc-table`, A1 notation (`a1ToRowCol`, `canonicalRange`), `describeExtent` "`<sheet>!<cell>`" — the geometry by which a figure in a budget, ledger or register can be cited to its cell.
- [DESIGN] reading-pipeline R2, R12, R13, R15 (L51, L61, L63, L66) — "a CSV's text is the entry's own decode, never the intake's lossy one"; sheets' rows/cols/used range; delimiter and encoding; "a sheet is a unit only when its reader names its used range"; wire ≤512 KiB, a unit that does not fit is carried as its capped prefix marked `truncated`.
- [GAP] text-chain R84 (L378–380), reading-pipeline (whole) — no numeric value, unit, currency, sign or row meaning is read or held: "every space, grade, engine and extent it reasons about is a shape a caller supplies". A large ledger or budget spreadsheet is truncated on the wire.
- [GAP] T32 "Left out" B1 DIST-14 (office-readers' "CSV bound measured on a deployed plane") — the CSV size a plane can read is not yet measured.
- none in record-core, provenance, membership, instance-setup, ratification, review, project-stage.
