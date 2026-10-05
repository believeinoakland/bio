# Study: COURTS (BOB #110 constructs study, phase 2)

*Analyst for COURTS, 2026-10-05. Scope (READING-PROTOCOL): court cases (the group's own and others'), dockets, parties, filings, orders, judgments, appeals, settlements and consent decrees, precedent and interpretation; administrative and quasi-judicial proceedings (hearings, commissions, inspectors general, audits, grand jury reports, AG opinions). Words: "case" (the group's publication, DEC-72), "docket" (a case's public response log, DEC-116), "standard" and "obligation" are taken (D313, D314, D321); this study uses **proceeding** for a matter before a court or tribunal and **register** for its list of entries (all free in `build/requirements`, checked). Citations: `C1: RM §1 L256` = phase-1 note C1 citing Roadmap §1 line 256; `D<n>`/`X<n>` = DOCTRINE-/CROSS-REGISTER entries.*

## 1. Anticipated needs

None of the design session's 172 use cases follows a proceeding (D1: useCases, "whole file"); courts appear only as where the group's own action goes. The needs below come from Bob's direction ("Law and regulations are at the very heart of much of this work, as are court cases", constructs-brief), the canon's examples, the journeys' "way in" rows (`design-journeys` §3 L106, L111) and how watchdogs work. Centrality: **core** (most groups, main path), **regular** (frequent for many groups), **occasional**.

**A. Following proceedings others bring (the city, a utility, the state)**
- **A1 Identify and follow a proceeding** (forum, number, title, kind, parties by role, where it stands). *"The city is a defendant in the sewer-fee suit: which court, what number, who are the parties, where does it stand?"* **Core.** Journeys §3 L106 ("Capture the filings, name the parties and offices involved, and watch the court's docket page for new filings"), L111 (rate case); FA L1 Fn1 (C1: L132–136 "court decisions (case law, consent decrees)"); gap row `design-journeys` §6 L531.
- **A2 Know when something new is filed or ordered.** *"Tell me when the judge rules on the demurrer."* **Core.** Journalists rely on docket alerts (https://free.law/2018/08/21/announcing-pacer-docket-alerts-for-journalists-lawyers-researchers-and-the-public/); CourtListener's cover PACER (federal) cases only, 5 free (https://wiki.free.law/c/courtlistener/help/alerts/docket-alerts-for-pacer); a state court's register of actions is readable by case number (Alameda eCourt: "read about the parties to a case, read the Register of Actions and the minutes, view dates for future hearings", https://eportal.alameda.courts.ca.gov/?q=node/388).
- **A3 Hold filings, orders and rulings as cited evidence, to the paragraph.** *"Paragraph 12 of the order says the City must produce within 30 days."* **Core.** Signed orders are often scanned (C11: DEC-4 src 110–113); sub-document citation was the gap (C11: DEC-23 src 1629–1631).
- **A4 Keep the proceeding's dates in view** (hearings, briefing, compliance dates an order sets, appeal windows). *"When is the hearing, and when must the city comply?"* **Regular.** Journeys L106 "the case's deadlines kept in view"; X50; TAD §8.2 l.917 (C10: "a multi-stage schedule with dependencies (a civil suit)"); layer-9 contract "every deadline names the statute, order or commitment".
- **A5 Outcome and appeal chain:** ruling, judgment, appeal, affirmed or reversed; which ruling stands now. *"Was the trial court reversed?"* **Regular.** §6 L531 ("Nothing tracks a case's filings, rulings and appeals").
- **A6 Settlements and judgments paid** (amount, date, authorising act, class of claimant). *"What has the city paid in police-misconduct settlements since 2019?"* **Regular.** C1: RM App B L1099 ("Livermore settlement: $3.78M"); FiveThirtyEight and The Marshall Project built such datasets for 31 cities (incident date, filing date, amount, outcome) (https://www.kuow.org/stories/tracking-police-misconduct-settlements-that-cost-cities-millions). Shared with ANALYSIS.
- **A7 Regulatory proceedings.** *"In the utility's rate case, when are comments on the proposed decision due, and who are the parties?"* **Regular** for utility- and land-use-focused groups; Bob's own reference point (D2: HO §2 L18 "the CPUC especially"; C2: DEC-100). A CPUC docket card holds "formal filings by parties, rulings and decisions"; service lists separate Parties from Information Only (https://webproda.cpuc.ca.gov/about-cpuc/divisions/news-and-public-information-office/public-advisors-office/tracking-issues-of-interest). Federal rulemaking dockets are open by API (regulations.gov v4, 1,000 requests/hour per free key, https://open.gsa.gov/api/regulationsgov/).

**B. Orders and reports that impose duties**
- **B1 Consent decrees and settlements as long-running duties.** *"Which NSA tasks did the monitor find OPD out of compliance with, and does our record agree?"* **Regular** (police, environment). C1: RM §1 L279–281 ("the 23-year OPD consent decree"; "EPA consent decree, Prop 218 litigation"). Practice: monitors report per paragraph at three levels, Preliminary, Secondary, Full (https://www.justice.gov/crt/case-document/file/1365081/download; Chicago's decree has 552 paragraphs, https://news.wttw.com/2022/12/16/chicago-police-must-significantly-improve-community-partnership-efforts-independent); Oakland publishes the monitor's reports 2010–2025 (https://www.oaklandca.gov/Public-Safety-Streets/Police/OPD-Policies-and-Resources/OPD-Independent-Monitor-Report-2010-2025).
- **B2 Grand jury reports and mandated responses.** *"Did the Council answer the grand jury's report within 90 days, and did it do what it said?"* **Regular.** C1: RM App B L1086–1087; C4: CM 939–941. California requires, per finding, agree or disagree (wholly or partly, with reasons) and, per recommendation, one of four answers (implemented; will be, with timeframe; needs analysis, at most six months; will not be, with reasons), within 60 days (elected officers) or 90 (governing bodies) (https://california.public.law/codes/penal_code_section_933.05; https://www.santacruzcountyca.gov/Portals/0/County/GrandJury/GJ2009_responses/Instructions.htm); some courts publish response-compliance reports (https://www.placer.courts.ca.gov/sites/default/files/Response%20Report%20for%202022-2023.pdf).
- **B3 Audit findings and recommendation follow-up.** *"Which of the Auditor's February 2022 recommendations are still open?"* **Core** for the founding case (C1: RM §1, the request sought "all City Auditor follow-up records on the February 2022 recommendations", src L250–251); CCCER is adopted as the finding form (C2: DEC-77.2). Auditors keep recommendation databases with statuses (Implemented, In process, …) reported semi-annually (https://seattle.gov/documents/Departments/CityAuditor/auditreports/RecFollowUp2021_FINAL.pdf; https://www.sandiego.gov/auditor/reports/recommendation-follow-dashboard).
- **B4 Administrative and quasi-judicial decisions** (ethics-commission enforcement, hearing officers, inspectors general, AG opinions). *"What did the Ethics Commission decide, and does the AG's opinion support our reading?"* **Occasional.** C5: IS §14a (Public Ethics Commission publications); California AG opinions are advisory, "entitled to great weight" but not binding (https://oag.ca.gov/node/6; https://hooperlundy.com/news-pdf/?pdf=929).

**C. Court decisions as law**
- **C1 Hold a decision or order as a standard** the city is measured against, with its text, period, and the later decision that supersedes it. **Core.** C1: AC §3 L20; standards R1, R6 ("a later decision").
- **C2 Precedent tied to what it interprets, and whether it still stands** (reversed, vacated, depublished). *"Carachure says a 10% sewer transfer violates Prop 218: is it still good law, and which provision did it read?"* **Regular.** C1: RM L272–274, App B L1096–1102; FA Fn4 L317–319 (AI surfaces precedent, humans judge); D2: HO §4 L71 ("no precedent or 'interprets' link").
- **C3 Find precedent and verify every citation.** *"Find California cases on franchise fees under Prop 26, and check each citation is real."* **Regular; core once an AI touches law.** FA cross-cutting L447 ("legal databases (statutes, case law)"); Free Law Project's Citation Lookup API exists as "a guardrail to help prevent hallucinated citations" (https://free.law/2024/04/16/citation-lookup-api/).

**D. The group's own proceedings**
- **D1 Follow the group's own petition after filing** (case number, expedited hearing, opposition, ruling, fee award, appeal). *"Our records petition: when is the hearing, and were fees awarded?"* **Regular.** C1: RM §1 L256–258; App B L1081–1084 (7923.005 expedited hearing, 7923.115 fees, filing fee $435). Today the path ends at "record sent" (D2: SR L1584–2000).
- **D2 Referrals to oversight bodies and what came back** (grand jury complaint, Controller referral). **Regular.** Built as actions (C9: INVENTORY §3); the body's response has no structure beyond correspondence.
- **D3 Counsel briefing that includes related proceedings and precedent.** **Occasional.** filings R9 (six sections).
- **D4 The group as defendant or subpoenaed** (SLAPP, preservation). **Occasional, critical.** C1: RM §2 L316–318; DEC-61, DEC-113 (D263).
- **D5 A court order to remove or redact a published case.** **Occasional.** No path (C2: DEC-116.7, "a legally compelled removal has no path here"). CourtListener's practice: nothing public removed without a court order; ordered redactions carry a note (https://wiki.free.law/c/terms/courtlistener/courtlistenercom-content-removal-policy).

**E. Evidence and presence**
- **E1 Exhibits at the venue's evidence standard; chain of custody for legal use.** **Occasional.** DEC-81 (D91), jurisdictions R39, filings R25.
- **E2 A member's account of a hearing they attended.** *"I was in Dept. 24 when the judge set the date."* **Regular.** C2: DEC-39 (coroner testimony known only through a newspaper); D109 (firsthand observation is testimony, grade D). Court-watch programs train volunteers and collect structured observation data (Court Watch NOLA: 130 volunteers, 1,110 visits, 7,000 cases in 2016, https://www.openphilanthropy.org/wp-content/uploads/Court_Watch_NOLA_CDC_Annual_Report_2016.pdf).

**F. Questions.** *"What's happening in the sewer-fee lawsuit, and what did the last order require?"* answered from the record with citations and the level where absence was found. **Regular.** X145.

## 2. Levels of support

| level | what a member can do |
| --- | --- |
| **L0 Documents** | Capture any court or tribunal document, cite a passage, watch a page for change, and record the group's own court filing or a court decision as correspondence on its action. |
| **L1 Court-aware reading and citation** | Court documents are read by type (register of actions, order or opinion, oversight report with findings and recommendations); case numbers and reporter citations are recognised from profile data; a citation is verified against a captured opinion or stated "not verified"; a decision is held as a standard with pin-cited extents. |
| **L2 A proceeding followed** | A proceeding is a registered subject (forum, number, kind, parties by role, related proceedings); its documents resolve to it; each capture of its register yields its entries with the new ones flagged; its stages are a declared flow with missing and overdue derived; its dates carry the order or rule as basis; the group's own action links to its proceeding. |
| **L3 Duties from proceedings tracked** | Paragraphs of orders, decrees and settlements, and grand jury and audit recommendations, are held as duties owed by an office, by a date, under a held authority; mandated responses run on a clock; a monitor's, auditor's or respondent's reported status is quoted beside the group's own determination; a breach of an order feeds conformance and escalation. |
| **L4 Interpretation and precedent** | A decision is linked to the provision it interprets, applies or holds invalid, with its later treatment as of a date; the assistant proposes candidate precedent and related proceedings from open databases, labelled; counsel packets carry them. |
| **L5 Procedural reasoning and patterns** | The assistant helps answer the backward question (filing window, standing, exhaustion; D-165); patterns across proceedings (settlement totals, response-compliance rates); push alerts from outside docket services. |

Needs at the lowest level that serves them: **L0** D4, E2 · **L1** A3, C1, C3 (verification half), B4 (AG opinion held and cited) · **L2** A1, A2, A4, A5, A7, D1, D2, F · **L3** B1, B2, B3, A6 (amount as a value comes from ANALYSIS) · **L4** C2, C3 (finding half), D3 · **L5** pattern half of A6 and B2; the backward question for D1. E1 sits on the capture axis (Grade A), D5 is policy (§8), not a level.

## 3. What exists now

COURTS has no object of its own: "No op in the 446 names a court case, docket of a court, party, filing in a court, order or judgment as an object" (M5, member reach). Courts enter as a standard kind, a venue, Tier 2/3 action kinds, correspondence words, the counsel packet and the litigation hold (X104). Verified on `tranche/T32` @ `09837e3ddc`; "UI" = calls in `civicos-ui/app.html`.

| module (layer) | what it provides for courts (R ids) | built | reached by a member | AI |
| --- | --- | --- | --- | --- |
| jurisdictions (1) | R23 `standard_sources` kind `court`; R25 venue `how: court`; R26 `deadlines` `applies_to: claim`, `starts` ∈ received, filed, act, known; R33/R43 holidays per office or venue (the court's 2026 entry, K934); R39 venue evidence standard; R32 legal organisations | yes; Oakland holds `records_petition` (Tier 2, Superior Court), `consent_decree_motion`, `taxpayer_action`, `assessment_challenge`, `constitutional_claim` (Tier 3), HJTA and FAC, **no `claim` deadline**, no case-number forms (M2) | only inside other modules; `profiles` UI 0 | plan mode reads venues (not deployed) |
| docprofile (1) | doctypes meeting-minutes, agenda, calendar, regulation, staff-report, staff-directory, generic; references `instrument`, `code_section`, `legislation` | yes; **no court or oversight-report doctype**; dates read only as "Month D, YYYY" (M2) | inside `acquire` (UI 7) | none |
| acquisition, capture, capture-sources (3) | capture of any public page or PDF, rendered capture; member-supplied per-host credentials, encrypted, capture "marked not reproducible by the public" (capture-sources R55–R63) | yes (credentials in `capture-sources/credentials.mjs`, read by the request drain `capture-requests/index.mjs`:782) | `acquire` UI 9; credentials only on a refused capture request's retry | AI files capture requests (only `check` runs) |
| content (4) | extents: a page, region or passage of an order is citable (DEC-23 met; content R5) | yes | inside `cite` (UI 6) | mint labels |
| entities (5) | a court registers only as `institution` or `body`; kinds closed (no proceeding); relations `proxy_for`, `member_of`, `overlaps`, constitutive (R26) | yes | `entitycreate`, `relationdeclare` UI 1 each | DEC-52 permits machine declaring; no AI caller |
| progressions (5) | declared flows, instances (flow, entity), missing/overdue derived (R10–R17), discharge with exception document (R14) | yes; intervals in fixed days from the **capture** instant, never the document's own date; no zone, business days or holidays (M2) | `progressiondefine`, `thread`, `discharge` reachable | none |
| monitoring (10) | watches any public https address at its authored cadence (R14–R15; the add flow writes `monitoring:` front matter, app.html:3313); reason `legal_deadline_approaching` (R52) is a typed word linked to nothing | yes | queue items only (`source-modified`); ops UI 0 | none |
| standards (9) | R1 kind `court` ("court decision or order"), R2 captured text, R6 `supersedes` ("a later decision"), R7 `inForce` | yes; no internal structure, whole-standard supersession only (M1) | **UI 0** | no caller (`standardpropose` not in `PLANE_OPS`) |
| conformance, consequences (9) | determination of an act against standards, `court` included; rests on published findings | yes | UI 0 | none |
| actions, action-grammar (9) | correspondence `sent: court_filing, appeal`; `received: court_decision, appeal_decision`; outcomes granted…affirmed (D-147); R48 pressure mark `legal`; R52–R60 litigation hold | yes; hold's device half unbuilt (N521) | **`actioncorrespond`, `actionrisktier` reachable**; hold ops UI 0 | none |
| action-clocks (9) | an "order" deadline only as a `basis` string (X41); starts `filed`/`received` only | yes | UI 0 | none |
| filings, filing-templates (9) | Tier 1–2 filing drafts; counsel packet: facts, chronology, exhibits, standards, candidate theories, `claim` deadlines (R8–R12); `theoryPropose` (R14); available actions with legal organisations (R15, R21) | yes; Oakland has no template (`TEMPLATE_NOT_NAMED`) | UI 0 | pack layers `action_planning`, `filing_drafting`; no caller |
| escalation (9) | stage 5 legal tools (R8); stage 7 `testimony`, `audit_request`, `oversight_request` (R12) | yes | UI 0 | reason draft labelled machine |
| skills, agent-worker (6) | `investigative-session` pack; only `check` deployed; installer sets no model key (`NO_ACCOUNT_RESOLVED`) | partly | no member path opens a run | — |
| queue (11) | `litigation-hold` To-do (R1, R12) | yes | shown; its door (`actionhold`) not callable | none |

*Not court support, though the words suggest it:* `docket` (8), `case-import` (8), monitoring R67 and reevaluation R30, R33 serve the publication docket (DEC-116); X111 notes its move stream (seq, date, kind, verified, never evidence) is the nearest existing shape for a court register.

**On the ladder.** *Built:* **L0** whole, and a slice of **L1** (a decision held as a `court` standard with text, period and supersession; pin-cite extents; venue facts and court holidays; the counsel packet). Nothing of L1's reading and citation half (no court doctype, no case-number or reporter recognition, no verification) and nothing of L2–L5. *Usable by a member today:* **L0** only: capture, cite, watch a page, and record `court_filing`/`court_decision` correspondence and a Tier 3 tier on the group's own action; every L1 piece above has zero UI calls, and no AI path touches courts.

## 4. Gaps

| need | missing capability | severity |
| --- | --- | --- |
| A1, A2, A5, D1 | no proceeding (forum, number, kind, parties, status, related proceedings); no register reading with new entries flagged; the group's action cannot name the proceeding its filing opened | **blocks core work** |
| B3, B2, B1 | no duty held from a report or order (who owes what, by when, under which paragraph); no response clock for a mandated reply; no place for an auditor's, monitor's or respondent's reported status | **blocks core work** (B3 is the founding case) |
| C1 | `standards` unreachable by a member and invisible below layer 9, so an inquiry cannot hold a decision as law (X6, X23) | **blocks core work** (shared with LAW) |
| C3, A3 | no recognition of case numbers or reporter citations; no check that a cited case exists in the record; no court doctype, so orders and registers read as generic text | **degrades**; **blocks** the day an AI proposes law |
| A4 | a court-set date has no home except a free-text clock basis on the group's own action; no `entered`/`served`/hearing start events; no document-own date in progressions | **degrades** |
| C2, B4 | no link from a decision (or AG opinion) to the provision it reads; no later treatment (reversed, vacated, depublished) beyond one `supersedes` | **degrades** |
| A7 | no forum or party roles beyond counterparty offices; nothing like a service list's party/information-only roles | **degrades** |
| A6 | settlement amounts are text, not values (T32 A37) | **degrades** (ANALYSIS) |
| A2 (sources) | no cost-aware path for fee-bearing records (PACER $0.10/page capped $3/document, waived under $30/quarter, https://pacer.uscourts.gov/help/faqs/how-much-does-it-cost-access-documents-using-pacer; Alameda documents $1/page, cap $50); portals need cookies and accounts | **degrades** |
| D3, C2–C3 (AI) | no skill reads court documents, finds precedent or related proceedings; `extract`, `investigate`, `plan` undeployed | **degrades** |
| D4 | litigation hold built at the plane, device half (N521) and every member door missing | **degrades** |
| E1 | Grade A deferred (DEC-81 (4)) | **nice to have** until its trigger |
| D5 | no path for a court-ordered removal or redaction of a published case | **nice to have** now; policy (§8) |

## 5. Proposed architecture

**Target: L3**, with L1's citation discipline and L4's links held as data; L4's assistance and L5 later. Why: the founding case's own material is L3 work (the Auditor's February 2022 recommendations, a grand jury complaint, a records petition; C1: RM §1 L250–258), the journeys' court and regulatory rows need L2 (§3 L106, L111), and Bob put court cases at the heart of the work. L5 waits on Bob's own deferral of the backward question (CM §6b L1098–1118, D-165: "a capability added later to a structure that already exists").

**Adopted from practice, and why.**
- *OASIS ECF 5.0 (NIEM 4.0)* for names, not for exchange: case type, the docket entry ("an entry in the docket or register of actions for a case"), party roles (https://docs.oasis-open.org/legalxml-courtfiling/ecf/v5.0/cs01/model/niem-mapping.html). The group never files electronically (D295), so the XML is not needed; the vocabulary avoids inventing.
- *CourtListener's split* (docket → entries → documents; opinion → citations) as the shape, and as an optional source: public pages and RECAP PDFs need no key; its API's default 5/min, 50/hour, 125/day (https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview) suits a member's lookups, not instance-wide polling.
- *eyecite's citation forms* (full, short, supra, id.) and *reporters-db* (1,167 reporters, 2,102 variants, JSON; https://free.law/projects/reporters-db) and *courts-db*, held as **profile data** read by a pattern recogniser, the way `vocabulary.codes` is (jurisdictions R6): they are U.S. facts, so they live in a profile, not in code (layers.md rule 1).
- *Reported status, quoted*: a monitor's Preliminary/Secondary/Full, an auditor's Implemented/In process, a respondent's 933.05 answer are someone's statements, held as written with their source (D67, D95); a fixed legal response vocabulary (933.05's four answers) is profile data.
- *CPUC service-list roles* (party, information only) among party roles, so the group's own standing in another's proceeding is expressible.

**Data model.** No new record object type; every object is append-only, dated and attributed.

| object | shape | where it lives |
| --- | --- | --- |
| **proceeding** | an entity of a new kind `proceeding` (entities R1's closed list revised) with a facet: `forum` (entity id: a court, commission, grand jury or auditor, kinds `institution`/`body`/`office`), `forum_kind` (court, tribunal, commission, grand_jury, audit, inspector_general, other), `number` (an alias; recognised by a profile space `proceeding` with forms per forum, so a capture whose reading carries the number resolves at A, entities R9), `kind` (profile vocabulary `proceeding_kinds`), `title` (the caption's extent, never retyped) | `entities` (5) |
| **parties and links** | ORGANISATIONS' evidentiary relation (X102: graded, cited, dated, never constitutive): `party_to {role}` from an office, body or institution (roles petitioner, respondent, plaintiff, defendant, intervenor, amicus, monitor, party, information_only); a private party only as the class "a private party" (§8 D-C3); `appeal_of`, `consolidated_with`, `remanded_to`, `arises_from` between proceedings; `enforces` from a proceeding to the decree held as a `court` standard | ORGANISATIONS' relation home (layer 5) |
| **register entries** | not a store: a `court_register` reader turns each capture of a register page (state register of actions, CourtListener docket page, CPUC docket card) into rows `{date as written, text as written, filer as written, document link?}` as content extents; rows absent from the previous capture are the new entries (monitoring's existing assess); a row says what the register showed at retrieval and is never a finding (D76) | `docprofile` (1), `content` (4), `monitoring` (10) |
| **stages** | a progression per proceeding kind (CF §8.2: a new flow is data, D225), offered from profile `proceeding_flows` and adopted by a member (DEC-54, D16); instance = (flow, proceeding); orders, judgments and notices threaded into it; status (pending, decided, on appeal, closed, undetermined) derived on read as of a date (progressions R24) | `progressions` (5), `jurisdictions` (1) |
| **dates** | `{date, what, basis}` where basis is the extent of the order, notice or register row, or a profile rule; rule-computed dates from profile `deadlines` whose `starts` gains `entered`, `served`, `hearing` (jurisdictions R26), on the venue's calendar (R43); never invented (D250) | TIME's construct; `progressions` gains a document's own date (its CF §8.2 trigger) and a stage due on an absolute date |
| **the group's own proceeding** | `actions` gains `proceeding` (entity id) on the action and on its `court_filing`/`court_decision` correspondence entries | `actions` (9) |
| **duties (L3)** | ORGANISATIONS/LAW's obligation record `{owed_by office, owed_to, act, by (date or rule), authority (a `court` standard for an order or decree paragraph; a `statute` standard for a mandated response) + extent, arising_in (proceeding)}`; **reported status** `{reported_by office, status as written, as_of, extent}`; the group's own reading remains a conformance determination (layer-9 contract) | ORGANISATIONS/LAW's home; `conformance` (9) |
| **decision → provision (L4)** | relation `interprets`, `applies` or `holds_invalid` from an extent of a `court` standard to an extent of a statute or ordinance standard; **treatment** rows (`reversed`, `vacated`, `depublished`, `overruled`, `affirmed`) each citing the later decision's extent; "still standing on date D" derived, undetermined where unread (D134) | LAW's provision structure; `standards` |

**Module changes (recommended, Option A: no new module).** `entities` +kind `proceeding` and its facet (≈6 requirements); `jurisdictions` +`spaces.proceeding`, `vocabulary.proceeding_kinds`, `reporters` and `courts` data, `proceeding_flows`, the new `starts` (≈6); `docprofile` +doctypes `court_register`, `court_order` (orders, opinions, judgments: caption, number, date entered, numbered paragraphs, citations) and `oversight_report` (numbered findings and recommendations, required responses) (≈8); `progressions` +document-own date anchor and absolute due date with basis (≈3); `actions` +`proceeding` link (≈2); a **citation check** (≈3): a citation resolves to a held opinion capture or is answered "not verified", judged as identifiers are (`id-spaces` pattern, layer 1) and read in layer 5 so `run-productions` (6) and `filings` (9) can use it. About 28 requirements, six modules, nothing moves.
- **Option B**: a new product module `proceedings` in layer 5 directly after `progressions` (before `bias`): the proceeding facet, register rows joined across captures, derived status, the action link's read. Uses record-grammar, record-core, membership, promotion, provenance, extraction, content, entities, connections, progressions; used by retrieval (registered facts), actions, filings (related proceedings in a packet), monitoring, affordances, control-plane, plane. No module moves and no edge is lost (`modules.json` checked); membership's `MODULE_ORDER` is re-pinned as for `docket` (layers.md L177). Choose B when the facet needs its own acts and tables beyond registration (members annotating entries, for example) or `entities` (1,326 lines) nears 4,000 (P6).
- **Layer order.** COURTS needs no move of its own. It depends on LAW's answer to the structural observation: while `standards` stays in layer 9, a decision is law only after publication, and inside an inquiry it is a document and a leg (X16, X23). COURTS supports making `standards` readable at or below layer 6.

**The AI's role.**
- *May do, machine-attributed* (DEC-52, D8): register a proceeding from a captured register or caption, add its number as alias, resolve captures to it, thread an instance.
- *Proposes, stored apart and labelled* (REC-195/D53; reversible, DEC-88): parties and links, a flow to adopt, dates with their basis, duties from an order's paragraphs, interprets links and treatment, related proceedings and precedent (as capture requests, D45), candidate theories (filings R14, exists).
- *Never*: states what a ruling holds, what the law is, or whether the city complied, as its own sentence; it points at and quotes extents (D274, D117, D47, D275); enters a deadline nobody adopted (an authored deadline is the licence for tracking, X37); spends a member's fee-bearing credential or runs unattended (D13, D206); registers a private party (actions R9, D176); recommends a legal step (D279, D255).
- *Fence in code* (D44): any citation in machine output, a proposal or a packet section that does not resolve to a held opinion is labelled "not verified" (refusing nothing, D88), the guardrail practice uses (https://free.law/2024/04/16/citation-lookup-api/).
- *Skills and run modes*: pack layers `court_reading` (run mode `extract`) and `legal_lookup` (run mode `investigate`, the Legal/Policy Lookup skill standards R9 names); member-launched only (D13). Watching registers is `monitoring`'s daemon work, never an AI run.

**Doctrine kept.** Members decide; the machine finds, proposes and prepares and never attests or concludes (layer 6 and 9 contracts; D1, D3). Labelled drafts (K1364, D14). Undetermined first-class and never defaulted (D55, D56); absence stated by level (D59); silence earned (D134). A grade states checkability, not truth (D95); two publications of one opinion are one source (D102); a court's number matches another system's id only through a captured crosswalk (D184). Declared relations constitutive and never traversed (entities R26, D178), so party and appeal links are evidentiary, not entity relations; Declared Bias safeguard 4 untouched (D186). Addressees are offices, never private individuals (actions R9, D156), personal data under D-77 and invariant 7 (D160), individuals named only in official capacity (D176). Every deadline names its basis and none is invented (layer-9 contract, D250, D256); the group's own checkpoint is never a finding about the government (D234). The venue sets the evidence standard (Action §4 rule 13, D282). Nothing leaves by a system path (D295); requests are not disguised (D375). No jurisdiction in product code (layers.md rule 1, D196); profile facts sourced to primary pages (D197). Sovereign instance, never a required vendor key (D201; SCHEDULER L150–154); paid outside services only on a real trigger (DEC-74, D206). A capability serves the path and takes a place in an existing construct (DEC-48 D224, D231).

**Runtime and deployment.**
- Polling: one register read per followed proceeding per authored cadence (daily by default) inside monitoring's tick (at most 50 subjects per tick, monitoring R19); each read is one subrequest (Workers Paid: 10,000 per invocation by default, CPU 30 s default and up to 5 min, waiting on fetch not counted; https://developers.cloudflare.com/workers/platform/limits). Thirty proceedings is under one tick.
- Portals needing cookies or script go through the renderer (capture-sources R19–R25); a register that refuses is "unreachable from this vantage" (D376), never "no new filings"; a member's upload stays the fallback.
- Fee-bearing records (PACER $0.10/page, $3 cap, waived at $30/quarter; Alameda $1/page, $50 cap) only by a member's act, price shown first (D20), with the member's own credential (capture-sources R55–R63, K103), the capture marked not reproducible by the public. Never in an unattended run.
- Optional CourtListener token as an `other` credential for its host; Citation Lookup takes 64,000 characters, 250 citations a request, 60 a minute, token required (https://wiki.free.law/c/courtlistener/help/api/rest/v4/citation-lookup).
- Orders and opinions are PDFs, often scanned: existing `pdf-worker` and `ocr-worker`, OCR labelled (D69).
- Deployment: per jurisdiction, researched profile facts (case-number forms per court, register addresses, court holidays per year (Oakland holds 2026 only), rule start events), each with its measurement (D197); a fictional court in the test profile (layers.md rule 3).

## 6. How to proceed

**Stage 1 · Follow a proceeding (L1 and L2).**
- *Unlocks:* the journeys' "court case" and "regulatory proceeding" ways in (§3 L106, L111, leading into journeys 7, 13, 14), removing the §6 L531 gap; needs A1–A5, A7, C1 (with LAW's surface), C3's verification half, D1, D2; F once QUESTIONS' cited read lands.
- *Size:* no new module (Option A); six modules touched (entities, jurisdictions, docprofile, progressions, actions, the citation check's two homes); about 28 requirements; profile research for the first profile.
- *Measure first* (D350):
  1. Capture three real registers whole and read them: the Alameda eCourt register of actions by case number, a CourtListener federal docket page, a CPUC docket card. Does each capture without a login or script, and does a reader recover the rows?
  2. The number forms of those three forums, as `M-NEW` measurements.
  3. Ask the group how many proceedings it would follow, and how often, to size the cadence.
  4. Whether ORGANISATIONS' evidentiary relation lands in the same tranche. If not, parties stay the captured caption, stated.

**Stage 2 · Duties from proceedings (L3).**
- *Trigger:* Stage 1 in use; ORGANISATIONS' and LAW's obligation construct decided; `standards` readable from investigation; a group starts on a decree, a grand jury report or an audit follow-up. The founding case's February 2022 recommendations already qualify.
- *Unlocks:* B1–B3; A6 once ANALYSIS holds amounts as values (A37).
- *Size:* about 15–20 requirements across the obligation home, progressions' response clock and docprofile's `oversight_report` paragraphs. Conformance per standard already exists (conformance R4).

**Stage 3 · Precedent and assistance (L4).**
- *Trigger:* `extract` and `investigate` deployed (VF-4's chain); LAW's provision structure built; members linking decisions to provisions by hand (count them).
- *Unlocks:* C2, C3's finding half, D3, B4.
- *Size:* treatment rows and the `interprets` relation (≈6 requirements), two skill layers.

**L5.** *Triggers:* D-165's own trigger (members answering the backward question by hand; CM status L25); amounts as values; a group asking for cross-proceeding patterns.

**Risks and how each is contained.**
1. *Private persons in filings.* Only offices, bodies and institutions are registered as parties; names stay in the captured bytes (D360), never extracted as subjects or published by the group's act (D165, D168).
2. *Fees and accounts.* Only by a member's act, the price shown first; no unattended spend; no required vendor key.
3. *Fragile or blocking portals.* Unreachable is stated per vantage (D376); a member's upload stays; CourtListener/RECAP is the federal alternative; the user agent is never disguised (D375).
4. *Hallucinated or misread law.* The machine quotes, never paraphrases a holding; the citation check is code; proposals are labelled.
5. *Read as legal advice.* Applying law to someone's own facts is advice (https://judicature.duke.edu/articles/legal-information-vs-legal-advice-a-25-year-retrospective/). The packet's "Not legal advice" marking (filings R10) stays, and legal tools are shown as facts (D279).
6. *Drift into case management.* No assignees, budgets or billing (D258's pattern).
7. *California facts leaking into code.* Every form, kind, flow and response vocabulary is profile data; the test profile has a fictional court.
8. *Word clashes.* "Proceeding" and "register", never "case" or "docket", on member surfaces (D320).
9. *Sealed material and compelled removal.* §8 D-C6.
10. *Adverse precedent from the group's own suit.* The tiers are unchanged (D-182).

## 7. Interfaces with the other constructs

| construct | COURTS needs from it | COURTS supplies to it |
| --- | --- | --- |
| TIME | absolute dates with a basis extent; a document's own date; court calendars per venue (exists, jurisdictions R43); rule computation with `entered`, `served`, `hearing` starts; response clocks (60/90 days) | court-set deadlines and hearings, register dates, stage timelines for chronologies (filings R9) |
| ORGANISATIONS | an evidentiary relation type (graded, cited, dated) for `party_to {role}`, `appeal_of`, `enforces`; the obligation record (owed by, owed to, act, by when, authority); a forum as institution or body; offices over time where a party is an office | proceedings as sources of duties and of relations (who is party, who monitors whom), reported-status rows |
| LAW | `standards` readable during investigation; provision structure with extents (for `interprets`); treatment history beyond one `supersedes` | decisions and orders as `court` standards; decree paragraphs as standards; AG opinions as persuasive readings; `interprets` links |
| ANALYSIS | amounts as values (A37) for settlements and judgments; viewer-gated counts across proceedings (X114) | settlement and judgment figures with their basis; response and compliance data for patterns |
| QUESTIONS | the cited read with its level (FIND); `extract` and `investigate` modes; a pack layer per stage | the proceeding as a subject to ask about; the citation check, reusable for any legal citation in an answer |

## 8. Decisions for Bob

Each is policy, doctrine, a requirement's meaning, architecture at the module level, or UX. Lower-level choices are BOB's and stated as decided after the list.

- **D-C1 · Scope and target level.** Should Civicsmith follow proceedings others bring (the city as a party, regulatory proceedings, decrees, grand jury and audit follow-up) as first-class work?
  - (a) Stay at L0: court material is documents.
  - (b) L2: follow proceedings, no duties.
  - (c) **L3, recommended:** follow proceedings and track the duties they impose. L4's links are held as data, the assistance comes later, and L5 waits.
  - *Why (c):* the founding case's own material is L3 work (B3, B2), and Bob placed court cases "at the very heart". Doctrine permits it unchanged.
- **D-C2 · Architecture: where a proceeding lives** (a product module or layer change is Bob's, layers.md ruling 5).
  - (A) **Recommended:** no new module. `proceeding` becomes an entity kind, and `jurisdictions`, `docprofile`, `progressions` and `actions` are extended.
  - (B) A new layer-5 module `proceedings`, directly after `progressions`.
  - (C) A home in layer 9 beside `actions`. Rejected: investigation could not read it (X8).
  - *Why (A):* it uses the Content Framework's own extension path (a flow is data, a new kind is a registry revision; D225, D231) and adds no module. Move to (B) when the facet needs its own acts or tables, or `entities` nears P6's mark.
- **D-C3 · Doctrine: private persons in court records.** Parties to suits against the city are often private individuals.
  - (a) **Recommended:** parties are registered only as offices, bodies or institutions; a private party is the class "a private party". Names stay in the captured bytes and are never extracted as a subject, indexed by name or published by the group's act.
  - (b) As (a), but a person named in an official capacity is registered as that office (D176). **Recommended together with (a).**
  - (c) Leave it to each group's editorial policy (D169).
  - *Why (a)+(b):* it carries actions R9 and D-77 into a domain full of private names without losing what watchdogs need: which office, which proceeding.
- **D-C4 · Policy: fee-bearing and account-gated court sources** (PACER, state portals).
  - (a) **Recommended:** a member may use their own credential (the K103 path) and fetch a fee-bearing record only by their own act, the price shown first. Never in an unattended run, and no vendor key is ever required.
  - (b) Refuse fee-bearing sources; members upload by hand.
  - (c) A group-level paid account used by the daemon. Rejected: DEC-74's trigger and D13.
- **D-C5 · Doctrine: what the machine may say about a ruling or an order.**
  - (a) **Recommended:** it points at and quotes extents, and proposes labelled links (interprets, duty, date). It never writes a holding, the law or compliance as its own sentence.
  - (b) Labelled summaries as K1364 drafts a member may keep.
  - *Why (a):* "the assistant cannot … state a law" (D274), and the pilot's no-own-propositions rule (D47). Revisit (b) only after acceptance is measured (D40).
- **D-C6 · Policy: a court order to remove or redact a published case** (DEC-116.7 left it "a separate question").
  - (a) **Recommended:** defer, with the trigger "the first such order served on a group", and record the principle now. An order addressed to the group is complied with, never silently: the order is captured, a signed docket entry names it, and the edition is stamped. CourtListener's practice is the model.
  - (b) Design the path now.
- **D-C7 · UX: where a member meets a proceeding.**
  - **Recommended:** a subject page for the proceeding, reached from the subject list and from the matter page. Its register is shown as rows with new ones marked, and its dates are marked "the court's date, not ours" (D234). It is a place in existing constructs, not a new screen family (D231).

*Decided by BOB (reported, not asked):*
- The names `proceeding` and `register`.
- Party roles taken from ECF and the CPUC service list.
- reporters-db and courts-db held as profile data.
- The citation check is plane-side, labelling and never refusing.
- A followed register's default cadence is daily.
- Reported statuses are quoted claims, never grades (D67, D95).
- Option A's file split, and Stage 1's measurements before any requirement is drafted.

## 9. Sources opened

**Study files, whole:** `ANALYSIS-PROTOCOL.md`, `constructs-brief.md`, `READING-PROTOCOL.md`, `prompts/A-COURTS.txt`, `digest/COURTS.md` (1–462), `digest/DOCTRINE-REGISTER.md` (1–2815), `digest/CROSS-REGISTER.md` (1–1049), and the `## Modules` sections of `notes/M1.md` (76–269), `M2.md` (28–136), `M3.md` (30–167), `M4.md` (28–110) and `M5.md` (24–107).

**Primary sources (bio @ `09837e3ddc`, read-only):**
- Whole: `build/requirements/standards.md`, `progressions.md`, `filings.md`, `jurisdictions.md`, `entities.md`; `build/layers.md`.
- In part:
  - `build/modules.json`: order and uses, layers 3–10.
  - `build/requirements/monitoring.md`: Status, R14, R15, R30, R52, R67, R68.
  - `build/requirements/capture-sources.md`: R55–R63.
  - `build/rulings.md`: searched for court-related rulings.
  - Code: `bio-plane/src/capture-sources/credentials.mjs`, `capture-requests/index.mjs`:782 and `civicos-ui/app.html`:3313.
- Canon text copies (`src/`):
  - `design-journeys.txt` §3 L88–127 and §6 L512–541.
  - `BIO_Complete_Roadmap_v5.txt` L248–307 and L1068–1106.
  - `BIO_Case_Making_v0_1.txt` §6b L1073–1127.
  - `SCHEDULER.txt` L140–164.

**External:**
- Free Law Project:
  - https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview
  - https://wiki.free.law/c/courtlistener/help/api/rest/v4/recap
  - https://wiki.free.law/c/courtlistener/help/api/rest/v4/citation-lookup
  - https://wiki.free.law/c/courtlistener/help/alerts/docket-alerts-for-pacer
  - https://www.lawnext.com/2025/06/courtlistener-launches-recap-search-alerts-for-pacer-filings-google-alerts-for-federal-courts.html
  - https://free.law/2024/04/16/citation-lookup-api/
  - https://free.law/2018/08/21/announcing-pacer-docket-alerts-for-journalists-lawyers-researchers-and-the-public/
  - https://free.law/projects/reporters-db
  - https://pypi.org/project/courts-db/0.10.24
  - https://pypi.org/project/eyecite/2.0.0
  - https://free.law/projects/juriscraper
  - https://wiki.free.law/c/terms/courtlistener/courtlistenercom-content-removal-policy
- PACER and court access:
  - https://pacer.uscourts.gov/help/faqs/how-much-does-it-cost-access-documents-using-pacer
  - https://courts.ca.gov/cms/rules/index/two/rule2_503
  - https://eportal.alameda.courts.ca.gov/?q=node/388
- Case law: https://www.lawnext.com/2024/03/event-tomorrow-marks-the-end-of-commercial-restrictions-on-the-caselaw-access-project-that-digitized-all-u-s-case-law.html
- Court filing standard:
  - https://docs.oasis-open.org/legalxml-courtfiling/ecf/v5.0/cs01/model/niem-mapping.html
  - https://niem.gov/node/708
- Grand juries:
  - https://california.public.law/codes/penal_code_section_933.05
  - https://www.santacruzcountyca.gov/Portals/0/County/GrandJury/GJ2009_responses/Instructions.htm
  - https://www.placer.courts.ca.gov/sites/default/files/Response%20Report%20for%202022-2023.pdf
- Consent decrees:
  - https://www.oaklandca.gov/Public-Safety-Streets/Police/OPD-Policies-and-Resources/OPD-Independent-Monitor-Report-2010-2025
  - https://www.kqed.org/news/12101833/a-new-beginning-oakland-police-to-exit-federal-oversight-after-23-years
  - https://www.justice.gov/crt/case-document/file/1365081/download
  - https://news.wttw.com/2022/12/16/chicago-police-must-significantly-improve-community-partnership-efforts-independent (search summary; the page refused a direct fetch)
- Regulatory proceedings:
  - https://webproda.cpuc.ca.gov/about-cpuc/divisions/news-and-public-information-office/public-advisors-office/tracking-issues-of-interest
  - https://www.cpuc.ca.gov/-/media/cpuc-website/files/legacyfiles/h/11314-how-to-become-a-party-in-a-cpuc-proceeding.pdf
  - https://open.gsa.gov/api/regulationsgov/
- Audit follow-up:
  - https://seattle.gov/documents/Departments/CityAuditor/auditreports/RecFollowUp2021_FINAL.pdf
  - https://www.sandiego.gov/auditor/reports/recommendation-follow-dashboard
- AG opinions:
  - https://oag.ca.gov/node/6
  - https://hooperlundy.com/news-pdf/?pdf=929
- Watchdog practice:
  - https://www.kuow.org/stories/tracking-police-misconduct-settlements-that-cost-cities-millions
  - https://www.openphilanthropy.org/wp-content/uploads/Court_Watch_NOLA_CDC_Annual_Report_2016.pdf
  - https://journalistsresource.org/?p=75500
- Legal information and advice: https://judicature.duke.edu/articles/legal-information-vs-legal-advice-a-25-year-retrospective/
- Runtime: https://developers.cloudflare.com/workers/platform/limits
