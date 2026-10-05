# Ladders work notes (checkpoint)
## Reading certificate
- READING-PROTOCOL.md, rulings-K1429-1431.txt, BOB-REVIEW.md: complete
## Constructs written to the document
(none yet)
- synthesis/constructs.md: 653 lines; read 1–653 complete
## Key notes from synthesis
- Stages: 0 runnable/correct; 1 shared ground (T1,L1,O1,A1,Q1); 2 (T2,O2,C1,C2,L2,A2,Q2); 3 (T3,T4,L3,C3,A3,A4,Q3, ORG EXTRACT); 4 network (O3,L4,COURTS L5,Q4)
- Targets B1(b): TIME L3+L4(doc dates, chronology, as-of)+L5 staged; ORG L4 one city; LAW L3 record+L4 AI prep; COURTS L3 + L4 links as data; ANALYSIS L2 then L3, L4 on trigger; QUESTIONS L3 (L4 bounded steps, L5 not proposed)
- modules.json cited at 8fa5ab4e3d in synthesis; task says facts as of tranche/T32 @ 84e7cd321d (use task's)
- studies/TIME.md: 342 lines; read 1–342 complete
## TIME notes
- 19 needs: A1 core (CPRA 19 Mar; RM §1 L241–258; FAC, NARA URLs), A2 core (commitments, audit targets; Seattle/SanDiego auditor URLs), A3 core (time standards in policy; journey 4 s4, j6 s2–3), A4 regular (contract/franchise/consent decree; WTTW Chicago 37 of 50), A5 core for meeting watchers (agenda/minutes/ACFR; Brown Act 54954.2/54956; OMC 2.20.070), B1 regular high stakes (claim windows; Gov Code 911.2; filings R9), B2 regular (group windows; DEC-13, action-plans R14–17,R29, DEC-94), B3 occasional (retention, litigation hold DEC-61, DEC-113), C1 core enabler (business days, holidays, zone, hours, cut-offs; research-oakland-calendar M-NEW-2–7; FRCP 6(a)), C2 regular (backward notice, hours; Brown Act, OMC, VF L22), D1 core meeting watchers (schedules, cancellations; DP L215–219 8 of 18 cancelled; SR §4.1; UC-031), E1 core for determinations (law in force; RM App B L1083; UC-063; conformance R3), E2 regular (office holder when; RM App A), E3 regular (page on date; dataset vintages; FA L1 Fn3; X59; acquisition R32; CF §8.3), F1 core money (fiscal years; RM §1 L234–239; CF §12; LegalClarity, CA Senate URLs), F2 regular (claim's own period; j6 s2), G1 core enabler (doc's own dates; DEC-5, DEC-11; CF §8.2), G2 regular (imprecise dates), G3 core (chronology; IS §5; DEC-77.2; DEC-14; Everlaw URL), H1 regular (pattern 38 of 41; FA L2 Fn4; CF §13.1), H2 core (non-response dated; D-181; DEC-14), I1 regular (relative questions; DEC-27, DEC-110), J1 core UX (DEC-98.2; BR §5 L138)
- Synthesis adds K1431 dependency dates (budget before FY, report before meeting) -> treat as need (K1431)
- Level mapping: L0 E3 partly; L1 B2,B3,J1; L2 A1,B1,C1,C2; L3 A2–A5,D1,E1,E2,F1,F2; L4 G1–G3,H1,H2; L5 I1
- Built: L1 complete; L2 half (calendar+business days+holidays per office; missing roll-forward, local day, hours, backward, act/known, extension, tolling); L3 fragments (progressions calendar intervals anchored capture time; standards.inForce); L4 version chain, filings R9 one action chronology; L5 none. Reachable L1 (app.html l.3380–3393) + progressions overdue.
- Design data model items 1–8 (civil date, period, fiscal_year, time rule R26 widened with unit/direction/anchor/roll/closed/extension/tolling, recurrence, dated fact, expectation->duties, validity, chronology read)
- Standards: CCP §12/12a, FRCP 6(a) courtrules URL, NARA FOIA; RRULE icalendar.org; OCD Event; Legistar webapi.legistar.com/Help; EDTF loc.gov; SQL:2011 wikipedia; OCDS Period prozorro; AKN timeInterval oasis; Intl/Temporal infoq; date-holidays, OpenHolidays research aids only
- Runtime: pure ms; RRULE bound 24mo/500; one DO alarm consumers; tzdata 3 changes 2026; no outside key
- Stages: T1 (study size 30–40; synthesis 35–45, ~12 amended), T2 (35–45 req; measure reader date accuracy on 3 bodies, minutes lag), T3 (no new module, ~6 amended; triggers: determination needing law at act date, office-holder question, contradiction over reversal), T4 (trigger FIND+plan deployed; acceptance rate DEC-95)
- Risks: false overdue; encoded law stale (D-149); profile burden; seven engines; nagging; extracted dates as fact; layer churn
- Interfaces table TIME §7
- Decisions D1..D10 -> B9(i),B4(iii),B3,B2,B3,B9(ii),B9(iii),B10,B20,B19
- studies/ORGANISATIONS.md: 193 lines; read 1–193 complete
## ORG notes
- 26 needs: A1 core (UC-018/019; CF §3; DEC-15), A2 core (RM App A; DR §6; journeys §6; X100), A3 reg (research-oakland-calendar L151–269; SR §4.4), A4 reg (CF §11; DP renamed; X162), A5 reg (CF §8.3; CON 5a; OCD-IDs; org-id US-COA), A6 reg (A&T L63–95; RM §1; MATRIX §3 unions; Census 39,555 special districts, 90,837 local govts 2022), B1 core (escalation R12; UC-123; brief), B2 core (journeys §3 L98,L110; CF §8.2; OCDS), B3 core (principles §6 L117; j5 s3 L215; DEC-5), B4 reg (CON serves_on; CF §8; Popolo), B5 reg (DR §6 L154–156; D243), B6 reg (RM §1 L235–239; consequences fund; X132), C1 core (NOTIFICATIONS src 80–109 Bob 2026-08-01 D-128; j§3 L110; DEC-107), C2 core (DEC-98.2; IC 619; principles §3 L58; MuckRock), C3 core (NOTIFICATIONS L105–109; FA L2 Fn4; NYC tracker), C4 reg (NYC 1,543 report duties; CF §8), C5 reg (CF §8.2 src 898–905; DEC-9 unless_exception), C6 core (DEC-16 INQ-2; measures L78; RM §1 L219–232), C7 reg (canon-mission §3 l.90; X77), C8 reg (RM L230–232; CM 906–908), C9 core doctrine (D234; DEC-107; view F), D1 core (actions R9), D2 core (conformance Terms; DR §6; VM L11), D3 reg (escalation R12; UC-123), D4 reg (DEC-100, DEC-111.6; X86), D5 reg (D-149 CM 221–233; X90), E1 core Bob (X145, X146; DEC-27), E2 occasional (CF §13.1; DB 82–88), E3 occasional (DR §6 L141–145; UC-101)
- Level map: L1 A1,D4; L2 A2–A6,B1–B4,B6,D1–D3,D5; L3 C1,C4,C5,C7,C8,C9; L4 B5,C2,C3,C6,E1,E2; L5 E3 + network D4
- Built: L1 complete; L2 absent except member_of; L3/L4 fragments (progressions). Reachable: Subjects screen (no correction/defect acts) + progressions screen
- Standards: W3C ORG w3.org/TR/vocab-org; Popolo popoloproject.com/specs; FtM Occupancy followthemoney.tech; OpenSanctions PEP methodology (40-year end-date rule); LittleSis; OCDS schema + buyers_suppliers; OCD-IDs open-civic-data-docs; org-id.guide/list/US-COA; LegalRuleML oasis + arxiv 1711.06128; NYC tracker searchlight.citizensunion.org (synthesis: >8,000 obligations from >2,000 local laws, NYCuriosity's); Gotham Gazette DORIS 842 reports/490 not received; obligation-level audit arxiv 2608.10329; contract-obligation extraction best 70.56% fse.studenttheses.ub.rug.nl/34210; Legistar; Census; JPA cornell; Google reps API turndown 30 Apr 2025; GIJN; DO limits
- Paid feeds Cicero, BallotReady stay outside (D201)
- Runtime: DO SQLite 10 GB; 30 s CPU (to 5 min); city: thousands entities, tens of thousands lines, few thousand obligations; overdue scan scheduler consumer
- Stages: O1 ~45 req (measure: Legistar seats; offices >32 docs; budget codes stable 2 FY; directories ~395±272; line grade distribution; bridge resolution rate); O2 ~60 req (gold set: code chapter, franchise, consent decree); O3 network (trigger 2nd group on same body / coalition K600(c)); exports Popolo/OCDS milestone; E2 patterns
- Risks table (hand-entry, surveillance, wrong machine obligations, stale structure, chain as blame, two clocks, naming, connection explosion D-224)
- Interfaces ORG §7
- Corrections via synthesis: obligations->duties/DUT-; OBLIGATION code not renamed; withinPowers->powersOf (never within/not); two-axis grade; Legistar seats only (no staff posts, contact fields dropped)
- Decisions D1->B4(ii), D2->B8, D3->B6, D4->B7, D5->B3/B2, D6->B5, D7->B20, D8->B13(i)
- studies/LAW.md: 386 lines; read 1–386 complete
## LAW notes
- 20 needs: N1 core (j4 s3 L197; FA L1 Fn1; RM §10 L650), N2 core (CM 218–226 D-149; X90), N3 core (standards R2; Municode terms (URL now 404, R-2 L-E9); UELMA wiki), N4 core (CON Step 4 L261–262; CF §8.1; DEC-95.3), N5 core (conformance R3; CF §11; GWU updating guide), N6 reg (RM App B CPRA recodified 2023; civicplus codification blog), N7 reg (CF §18.1; conformance R10 basis_changed; X73), N8 core (journeys §3 L105; DEC-23), N9 reg (DEC-60; IS §5; D273), N10 occasional (DEC-76.3; CM 791–795; X14), N11 reg (journeys L98–100; DEC-27; ACTION-PLAN l.65 two-thirds; RM §5 OP1), N12 core (FA L2 F1 L254–261; IS §8 L770–783; CONTRADICTION-IDENTIFY §1), N13 core built (AC §3,§4; conformance R1–R9; actions R8), N14 reg (DEC-9; progressions R11,R14), N15 core TIME-owned (layer 9 contract; X41), N16 reg (DEC-77.2; DEC-84.10; GAO Yellow Book; Louisiana audit guide), N17 reg (journeys §6 L529; X154), N18 core (UC-004; D274; Stanford HAI 17–34%), N19 occasional built (filings R8–R14; DR §8), N20 occasional COURTS (journeys §6)
- Ladder mapping: L1 N2,N4; L2 N1,N3,N5 whole,N8,N11,N15,N16,N18; L3 N5 portion,N6,N7,N9,N10; L4 N12,N13,N14,N17,N19; L5 N6 watched,N20
- Built: L2 (layer-9 bound) + L4 slice (determination, comparison store); L3 absent; reachable L1 (actionlaws UI 3; readingref, backlinks). standards 849 lines; conformance 1,539 lines; 6+6 ops UI 0
- Real world: codifiers ICC Code Solutions >7,000 communities; Municode/CivicPlus; current through; Omits; Legistar Matter fields; Open States free key; Georgia v PRO 2020
- Adopt: FRBR (laws.africa, parlamento.ai, AKN timeInterval); Indigo; ELI URI template (wiki); eCFR as-of; Legistar enactment events; Yellow Book CCCE. Not adopted as code: eyecite (Python), USLM schema
- Data model: STD- gains instrument, portion, requires, copy, current_through, period_basis; instrument = key (record object in stage 2 if audit needs, BOB's); law relations temporal (amends, repeals, renumbers, recodifies) vs referential (refers_to, defines, excepts, implements); law_ranks; inForceAt reasons; requirement = portion-grain standard with requires
- Layer options 1–4; conformance comparison split deferred (trigger: layer 5–8 module must read comparison in code); ~150 lines conformance/index.mjs:911–1048
- Runtime: DO SQLite (study said 1 GB; corrected 10 GB per R-2 L-E3); CPU 30 s default, 5 min configurable; 128 MB; keyless sources
- Stages: L1 ~30–40 ids, ~10–11 touched; measure (OMC pages+~1,850±314 ordinances, readingref rate; section boundaries 50 pages; codifier lag; ~30 seeded questions; code serving static/rendered/API (R-2)); L2 trigger first changed provision / "what did §X say on D" / codifier lag > monitoring interval; 4–6 modules, 20–30 ids; L3 (LAW stage 3) trigger investigate deployed + acceptance above bar; 3–5 modules 15–20 ids; L4 (stage 4) trigger 2nd jurisdiction / coalition K600(c) / load a code
- Risks 1–8 listed
- Decisions 1->B2, 2 no change (K102), 3->B11(i), 4->B12, 5->B11(ii), 6->B20, 7->B15
- In the ladder doc: LAW L5 = study L5 (imports, legislative watching, court interpretation, venue standard of proof)
- studies/COURTS.md: 295 lines; read 1–295 complete
## COURTS notes
- 23 needs: A1 core (journeys §3 L106,L111; FA L1 Fn1; §6 L531), A2 core (free.law PACER alerts 2018; CL docket alerts wiki 5 free; Alameda eportal node/388), A3 core (DEC-4 src 110–113; DEC-23), A4 reg (journeys L106; X50; TAD §8.2 l.917; layer-9 contract), A5 reg (§6 L531), A6 reg (RM App B L1099 Livermore $3.78M; KUOW FiveThirtyEight/Marshall 31 cities), A7 reg (HO §2 L18 CPUC; DEC-100; CPUC tracking URL; regulations.gov 1,000/h), B1 reg (RM §1 L279–281 23-yr OPD decree; DOJ monitor doc; Chicago 552 paras WTTW; Oakland monitor reports 2010–2025), B2 reg (RM App B L1086–1087; CM 939–941; PC 933.05; Santa Cruz instructions; Placer response report), B3 regular per R-2 C-E8 (RM §1 src L250–251; DEC-77.2; Seattle RecFollowUp2021; San Diego dashboard), B4 occasional (IS §14a; oag.ca.gov/node/6; hooperlundy), C1 core (AC §3 L20; standards R1,R6), C2 reg (RM L272–274, App B L1096–1102 Carachure; FA Fn4 L317–319; HO §4 L71), C3 reg; core once AI touches law (FA L447; free.law citation lookup 2024), D1 reg (RM §1 L256–258; App B L1081–1084 7923.005, 7923.115, $435; SR L1584–2000), D2 reg (INVENTORY §3), D3 occasional (filings R9), D4 occasional critical (RM §2 L316–318; DEC-61, DEC-113, D263), D5 occasional (DEC-116.7; CL removal policy), E1 occasional (DEC-81 D91; jurisdictions R39; filings R25), E2 reg (DEC-39; D109; Court Watch NOLA 130 volunteers 1,110 visits 7,000 cases 2016), F reg (X145)
- Level mapping: L0 D4,E2; L1 A3,C1,C3 verif,B4; L2 A1,A2,A4,A5,A7,D1,D2,F; L3 B1,B2,B3,A6; L4 C2,C3 finding,D3; L5 patterns A6/B2, backward question D1; E1 capture axis; D5 policy
- Built: L0 whole + L1 slice; reachable L0 (but watching not reachable per R-2 C-E1; monitoring: enabled false app.html:3313; NOT_MONITORED)
- Adopt: ECF 5.0 NIEM names; CourtListener split (API 5/min 50/h 125/day); eyecite forms, reporters-db (1,167/2,102 README), courts-db as profile data; reported status quoted; CPUC roles
- Runtime: daily cadence; ≤50 subjects per tick (monitoring R19); 10,000 subrequests; PACER $0.10/page $3 cap waived <$30/quarter; Alameda $1/page $50 cap; CL Citation Lookup 64,000 chars, 250 cites, 60/min, token; pdf-worker/ocr-worker
- Stages: C1 (~28 study; synthesis ~35); measure 3 registers, number forms, how many proceedings, lines landing; C2 15–20 req; C3 (≈6 req + 2 skill layers; trigger extract+investigate, LAW provision structure, members linking by hand – count); L5 triggers: D-165 backward question by hand; amounts as values; group asking for cross-proceeding patterns
- Option B proceedings module trigger: own acts/tables or entities (1,326 lines) nears 4,000
- Risks 1–10
- Decisions D-C1->B1, D-C2->B5/B3, D-C3->B8, D-C4->B15, D-C5->B12, D-C6->B18, D-C7->B20
- Corrections (synthesis/R-2): enforces -> field arising_in; row diff is new work; monitoring cannot follow rendered/cookie registers; no as-of status read; citation recogniser in id-spaces, resolver in standards; CL optional later (POST, needs own path); caption never alias; machine registration note labelled; sealed material open
- studies/ANALYSIS.md: 487 lines; read 1–487 complete
## ANALYSIS notes
- 26 needs: A1 core (J6 L154–165; journeys §3 L60–61; wizard L472–477), A2 core (J6 s2; D273), A3 core (J6 s5–6; CSD §4.4 UI-62; amstat attribute sampling), A4 core (matter-page L18 61.8%; CM 763; CF §13.1 38 of 41), A5 reg (journeys §3 L75), B1 core (journeys §3 L63; FA L2 Fn2 L271–276), B2 core (RM §1 L219–223,L234–239; SR §1.1 INFO-2026-0002; CF §12 src 1173), B3 reg (FA L2 Fn2; SR §3.1, §4.6), B4 reg (CF §8.2 909–921; progressions R32 A37), B5 reg (matter-page L27–33; DEC-84.10; consequences R2), B6 occasional (CM §2 D-148; actions R27), C1 core (u41 G5.2; journeys §3 L75), C2 reg (DEC-11 src 589–593; TAD §7.4), C3 reg (IS §14c; CF §12; intent R4), C4 occasional blocking (39.6 MB budget book; Stop-Data >20 MiB; CSV >8 MiB; MS M6 L323; D-593), D1 reg (OF L117–128), D2 reg (Bob brief; J8; MA §1.3), D3 reg (EBD §3.3 M-55 NO-GO; arxiv 2303.09957 F1 0.28–0.47), E1 core (DEC-112; Pub §5C; X119), E2 reg (UK L177–179; DEC-99; DEC-122; PR §8), E3 occasional (DR §5; audiences L1163), F1 reg (CF §12; intent R4), F2 occasional (CF §13.1; D331), F3 reg (X129)
- Level mapping: L0 A2,B6,D1; L1 B5 built, part A4; L2 A1,A4,A5,B4,C1,C3,D3 typed transcriptions,E1; L3 B1 one year,D2,C4; L4 B1 multi-year,B2,B3,C2,A3 estimate,E2,E3,F1,F2,F3; L5 plain words
- Practice URLs: ProPublica ire.org/?p=44398; Markup; GAGAS gaoinnovations 2024 audit documentation; GAO-20-283G; Reinhart–Rogoff retractionwatch; Panko arxiv 0801.3114 (94%, 1–5% cells); genomics Ziemann; floating point exceljet/libreoffice; Socrata $group; CKAN datastore; ArcGIS; route-fifty; GFOA FDTA (Phase 2 1 Oct 2028)
- Adopt: CSVW w3.org/TR/tabular-metadata; Frictionless Table Schema; Fiscal Data Package specs.frictionlessdata.io/fiscal-data-package; PROV-O w3.org/TR/prov-o; OpenFormula ISO/IEC 26300-2; IronCalc github (candidate); HyperFormula excluded GPLv3; Google Sheets excluded DEC-67; DuckDB-Wasm rejected (second query language D155); Vega-Lite spec (microsoft research ?p=449646)
- Data model table/CALC- fields; recipe grammar steps; relations; as-of pin; grade rules; division recipe/workbook; workbook path steps 1–(see rest)
- ANALYSIS cont: workbook path steps 6–10 (bind, recompute w/ engine agreement not accuracy D110, lint list, method note GAGAS + second member check, cite/publish with workbook bytes)
- Modules: calc-grammar L1 800–1,200; calculations L5 last 2,000–3,000; sheet-worker L1 fleet stage 2; extensions list; acts tabledeclare, calculationrecord, calculationpropose, calculationcheck
- AI: tabledeclarepropose, calculationpropose, workbookcheck, EXTRACT table(engine) once measured; number in conversation labelled derived not stored
- Runtime: 128 MB per isolate (shared, R-3 A-E6), 30 s CPU to 5 min, SQLite rows ≤2 MB, statements ≤100 KB, ≤100 params; tables as bytes in R2 streamed; bound 20 MiB / ~1M cells; sheet-worker service binding; Workers Paid (DEC-42)
- Stages: A1 ~55 req (14+28+13), measure 5 items; A2 trigger grammar can't express / professional workbook; measure 288 workbooks functions, IronCalc agreement, wasm size; A3 trigger multi-year fund case or reconciliation; adds budget readers, joins, portal keyed diffs, random draws, Vega-Lite, amount filters (A37), pattern statements, PDF table engine re-measured vs M-55 (TATR class); A4 trigger investigate/plan deployed + acceptance instrument DEC-77.3
- Risks: false precision; members' errors; engine divergence; runtime; person-level rows; BI drift DEC-48; licence; P6; AI arithmetic; layer order
- Decisions 1->B14(i), 2->B3, 3->B13(ii), 4->B14(iv), 5->B14(v), 6->B14(vi), 7->B8, 8 ruled DEC-67, 9->B20, 10->B20 charts, 11 BOB's order
- Corrections R-3: IronCalc candidate only (work-in-progress, no function count); checker R13 (one self-contained file) -> B14(iii) recommend keep R13; case-import added; TAD v10 §8.3/§9 conflict (§7 item 12); FDTA wording; memory shared
- studies/QUESTIONS.md: 195 lines; read 1–195 complete
## QUESTIONS notes
- Needs (17): A.1 core (DEC-27 FIND C11 src 1810), A.2 core (CF §14.3; CSD §4.4), A.3 core (DEC-82; journey 3 D1 L181), A.4 reg (OLD §6; UC-008), B.1 core (DEC-27; DEC-49; ASSISTANT-PILOT §1), B.2 core (DEC-27 CREATE; DEC-120/121; journey 9 L284–296), C core (journeys §3 problem they live with; auditor's forum 4 Oct), D.1 core (journeys §6 L529; X154), D.2 reg (j4 s3; standards R7), D.3 reg (DEC-27; D273), E.1 core (X35; DEC-98), E.2 reg (progressions; minutes_due_days), E.3 occasional (journeys §6 Meetings), F reg (journeys §6 offices; actions R9), G occasional (journeys §3, §6 court), H reg (journeys §3 overtime; j6; X130), I reg (CM 1032–1044; D-165), J reg (DEC-127; UC-093), K occasional (Membership §1.3; X149)
- Level map: L1 A.1–A.4, B.1, B.2 scripted, E.2, K; L2 B.2 on the fly, C, J, I drafting; L3 D.1–D.3, E.1, E.3, F, H; L4 G, I backward, D.1 not held; L5 none core (UC-002, DEC-95.3)
- Real world: DocumentCloud GPT add-on; citymeetings.nyc; AP "unvetted source material"; Stanford HAI 17–34%; arxiv 2401.01301 58–88%; malaymail >1,450 filings; Markup NYC MyCity 2024 + 2026 shut; BBC/EBU 45% infodocket
- Adopt: FACTS grounding arxiv 2501.03200; abstention arxiv 2407.18418; Anthropic search_result citations docs; show the query (BIRD ~82% vs 93%, beancount); OWASP LLM01 injection (coralogix); legal info vs advice (judicature duke; ABA model definition)
- Answer data model: interpretation; answer (summary+support, holdings, rules_applied, looked, bound, truncated, out_of_view, lens, could_not_establish, query_shown, next_acts, label); persistence none, device-local TTL transcript, unattributed tallies
- Rule services list; exclusions sources*, history, admin/export
- answers checks: ANSWER_CITES_UNREAD, ANSWER_FIGURE_UNSOURCED, ANSWER_RULE_NOT_PLANE, ANSWER_ABSENCE_WITHOUT_LEVEL; strings and ids cannot judge meaning -> quotes beside summary
- Runtime: 5 min CPU, no wall-clock while connected; DO alarms 15 min; 10,000 subrequests
- STUDY'S ACCOUNT CLAIM WITHDRAWN (K1429): subscription can serve; agent SDK in container. Costs corrected R-3 Q-E1: API-key option Sonnet 5.5 ~$0.07–0.18 cached, $0.14–0.35 as built; 5 members x5/day ~$55–135/month (unmeasured). 60–150k token figure has no source.
- Stages: Q0 (6–10 req changes); Q1 (~1,500–2,500 lines, ~7 extended, 30–40 req; 150-question gate bar set before measuring); Q2 (~15 req; trigger Q1 bar met in use + investigate live); Q3 (10–15 req; trigger TIME/LAW/ORG/ANALYSIS first services + sourced profile facts); Q4 (trigger tallies many "not held"/"start a run"; backward question D-165 trigger; courts Qs once COURTS objects); L5 not proposed (D13; AIR §7.3 pt 7)
- Risks 1–12 (Upsolve v. James 2d Cir 2025; FTC DoNotPay ftc.gov/node/87474; March 2026 suit)
- Decisions Q1->B12(i), Q2->B12(ii)(iii), Q3->B17(iii), Q4->B3, Q5->B16 (reframed), Q6->B20, Q7->B17(ii)
- reviews/R-1.md: 236 lines; read 1–236 complete
## R-1 notes (all taken in by synthesis; extra points to keep)
- T-E7 tzdata 2026e released 2026-09-29, Manitoba permanent -05 on 2026-10-31 (iana.org/time-zones); T-E8 cite CCP §§12, 12a (and §10); T-E9 Temporal exposure snippet (community.cloudflare.com/t/945339; workerd discussions/6716) -> civil-time takes now only from caller
- T-O3 Legistar Events fields EventDate (no zone), EventTime text, EventAgendaLastPublishedUTC, EventMinutesLastPublishedUTC; cancellations in body name; 2026: 130 events, 24 cancelled; 105 with minutes, median 15 days, 33 over 21; 29 of 106 agendas last published <72h -> not notice violations; per_meeting capture at meeting minus notice
- T-O5 dataset vintage generalises id-spaces roll_year (R10–R12); T-O6 queue snooze R21–R22 delegates
- T-Doc: extend R44 UNMEASURED not a basis to deadlines; .ics one-off vs feed separated
- T-Feasibility: UX (layers.md ruling 4 l.48) -> substrate first (K1430); chronology first writer = reading pipeline at read time or re-read job
- O-E1 two-axis grading; O-E2 Legistar officerecords: Member 884, Chair 115 on first 1,000 rows; carries OfficeRecordEmail; O-E3 query names a body only via authority; O-E5 figures; O-E6 named addressee collision
- O-O1 bridge; O-O3 occurrence date from chronology; O-O4 progressions stores DUT- id never reads; O-O5 strength R12 part_of/acts_for one source (X118); O-O6 DEC-60 counter-precedent (X91)
- O-Doc powersOf; line kinds to Bob; contractor breach routed to enforcer
- O-Feasibility source-native import needs no AI (DEC-52)
- reviews/R-2.md: 217 lines; read 1–217 complete
## R-2 notes (taken in by synthesis; extras)
- L-E1 LAW_LEVELS conflict false (K108(1)); only stale release/bio-plane.bundled.mjs:4746
- L-E2 ordinance/contract kinds from DEC-6 & ENTITY_KINDS (entities/index.mjs:28), not DEC-114
- L-E3 DO storage 10 GB; L-E4 CPU 30 s default to 5 min
- L-E5 assistant help on j4 s3 waits on VF-4 + model account
- L-E6 registration alternative (retrieval R53 registerActionFacts); move necessary when layer 5–8 calls standards in code
- L-E7 MODULE_ORDER listener order: standards promotion check (store.mjs:187–197) runs earlier; test it
- L-E8 Municode Angular shell (ng-app mcc.library_desktop, /api, reCAPTCHA) -> monitoring R5 undetermined each tick -> watch rests on Legistar enactments
- L-E9 Municode terms URL 404
- L-O inquiry R4 forbids leg on STD- -> captured passage as information leg until B13(iii); docprofile 3,170 lines split at 4,060 before (K617); interprets/holds_invalid added to LAW relations; DEC-54 split as requirement on legal_lookup; law relations traversable licence D183
- C-E1 watch not reachable; C-E2 row diff new; C-E3 rendered/cookie registers; credentials only for capture requests (capture-requests/index.mjs:778–786); Alameda cookies; C-E4 no as-of status; C-E5 citation check home; slip opinions lack reporter cite; C-E6 CL Citation Lookup POST, optional own path; C-E7 reporters-db figures from GitHub README v3.2.32; C-E8 B3 regular
- C-O line kinds lack proceeding families; duty lacks arising_in & reported status; sealed material; docprofile size; stage deps
- C-Doc label = forum+number+neutral desc; machine note labelled
- C-P17 member words proceeding/register to Bob (B20)
- C-Feasibility joint stage after ORG stage 1 and LAW move
- reviews/R-3.md: 278 lines; read 1–278 complete
## R-3 notes
- A-E1 IronCalc candidate ("work-in-progress", "very early stages", no function count; drop 300+); fallback "not recomputed here"
- A-E2 case-checker R13 one self-contained file -> B14(iii); A-E3 consequences R2 -> B14(ii); A-E4 grade rule; A-E5 FDTA Phase 2 1 Oct 2028 (2 years from Phase I effective date); A-E6 128 MB shared across concurrent requests in isolate
- A-O1 case-import; A-O2 TAD §8.3/§9; A-O3 withheld inputs; A-O4 person-level rows in carried workbook/tables (redact or aggregate, disclosed); A-O5 UX step; A-O6 sheet-worker DIST
- A-Doc1 D155 only frozen record sets; A-Doc2 compare not determination (D275); A-Doc3 random draw touches DEC-22 (D7)
- A-Feasibility store results keyed sha(recipe, inputs, method_version); measure peak memory
- Q: subscription verdict WITHDRAWN by K1429. Keep: pricing table (Sonnet 5.5 $2/$10, cache hit $0.20; Opus 5 $5/$25; Opus 5.5 $4/$20) from platform.claude.com pricing; no cache_control (model.mjs:68); usage read nowhere; transcript re-sent per turn (converse model.mjs:65–80); 12 turns up to 16,000 output tokens (model.mjs:23,29); 1,000,000,000-byte bound (model.mjs:25); runs not costed; Start tier rate limits; spend ceiling per group monthly / per member daily (D79); asking scope widening -> B17(i); Q5 reframed -> B16
- DEFAULT_MODEL claude-opus-5 (model.mjs:22); SCREENS empty plane/screens.mjs:4; clockPropose only filings/index.mjs:840; standardinforce op-declarations l.572; skills 54, agent-worker 55
## Reading complete (all required files). Product check: git diff 09837e3ddc/6645f2ea04/8fa5ab4e3d..84e7cd321d over bio-plane/src, build/requirements, modules.json, agent-worker, newgroup, civicos-ui = no change.
## Plan for targets
- TIME: whole ladder within target (L5 in stages T4) -> §4.5 = held extensions (ics B19(b); standing time Qs = QUESTIONS L5; further jurisdictions' rule sets; dated waits on inquiry G13; Temporal; retention clocks B3 device half)
- ORG: L5 above (O3). LAW: L5 above (stage 4). COURTS: L4 assistance + L5 above. ANALYSIS: L4, L5 above (on triggers, stage 3). QUESTIONS: L4 above (Q4), L5 not proposed.
## Writing progress
- front matter, §1, §2, §3 written
- §4 TIME written
- §5 ORGANISATIONS written
- §6 LAW written
- §7 COURTS written
- §8 ANALYSIS written
- examples de-specified (no invented citations/figures)
- §9 QUESTIONS written
- §10, §11 written (full draft complete)
- decisions lines added; table check done; final length 707
## STATUS: document complete (707 lines), all sections §1–§11 present; nothing written in /home/user/bio or civicos-process
## REVISION (coordinator, Bob B1 (c), K1432): every construct to L5; no rung held
Plan: Status sentence; §1 rewrite (planning each stage; extending the ladder); §2 heading "Build every rung so the next one extends it"; ladder column "within target?" -> "stage"; §x.4 -> "Rungs in today's first stages"; §x.5 -> "Rungs above today's first stages, planned" with "What must exist first" + "Realism and performance"; conflicts (Q L5 vs D13; COURTS L5 vs UPL line) as Bob decisions; §10 intro.
Backup of v1 at scratchpad/ladders-v1-before-B1c.md
- revision step 1 done: status, why, §1, §2, ladder columns, §x.4 headings, §10 intro
- revision step 2: §4.5–§9.5 replaced (Later rungs, planned; what must exist first; realism and performance; Q L5 design; COURTS L5 design; sharing by explicit act)
## STATUS: revision for B1 (c) complete; 718 lines; tables checked; nothing written in bio or civicos-process
