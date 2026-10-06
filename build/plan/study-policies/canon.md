# POLICIES AND STANDARDS: what the canon already says and builds (canon worker, BOB #122)

Read on `tranche/T33` @ 5d24577a1c, 2026-10-06. Read-only. Scope: standards that are not statutes, ordinances or court rulings.
"Designed" = canon text or requirement not yet built; "built" = code merged on the tranche; "reachable" = a member can use it on a screen.
Short refs: LAD = `docs/architecture/BIO_Capability_Ladders_v0_1.md`; FA = `BIO_Functional_Architecture_v3.md`; RM = `BIO_Complete_Roadmap_v5.md`;
STD/DUT/JUR/PRG/CONF = `build/requirements/{standards,duties,jurisdictions,progressions,conformance}.md`; JRN = `docs/development/ux-substrate/journeys.html`.

## 1. What exists

### 1a. Mission and product canon (designed, at the level of principle)
- RM:355 core value 4: "Our government must follow the law and its stated policies. No exceptions." RM:368 Operational Principle 1: "We hold government to the law and its stated policies. We take no position on what the policies should be."
- RM:593–595, FA:227, FA:564: Skill 4, "Legal/Policy Lookup": "Maps applicable laws, policies, ordinances, regulations, and case law".
- FA:115 Layer 2 is "Compare government actions against legal and policy standards". FA:131–134 names the source class "stated city policies (administrative directives, council resolutions)" beside regulations, court decisions and audits.
- FA:275: "The City Auditor's finding may reference a policy that the Municipal Code doesn't contain." This is the only canon sentence about a policy the group cannot see.
- `BIO_Action_v0_1.md`:19 defines a Standard as "a statute, regulation, ordinance, court decision or order, adopted policy or public commitment, held as captured text with its citation and period in force".
- `BIO_Case_Making_v0_1.md`:892–893 (Bob, 2026-08-03): a finding that "some government action (or action by some other person or organization) doesn't conform to the law, policies, regulations, stated intentions/promises, or other restrictions"; :906 says NONCONFORMITY is departure from "a law, a policy, a regulation, a stated intention or promise, or another restriction".
- `BIO_Design_Requirements_v2.md`:160 gives the naming example "the order was signed by Deputy Director John Roe, contrary to policy §4.2". :198 says evidence packages identify "which laws or policies appear to have been violated".

### 1b. Capability Ladders (canon since K1432, whole; designed unless marked built)
- LAD:706 LAW §6.1: law is "charters, statutes, codes, ordinances, resolutions, regulations, policies, budgets as law, contracts and commitments held as binding". Members see "standard" for "law, policy or a commitment held" (B20).
- LAD:714 N1: "Which ordinance or policy says how fast potholes must be fixed?" (core, L2).
- LAD:724 N11: "Contracts, policies, budgets and commitments as standards". The example is "Is the hauler meeting the franchise's service levels?" (regular, L2). **This is the only need in LAW that concerns policies; no rung entry designs anything specific to them.**
- LAD:171 TIME A3: "Time standards in policy or law, measured per act". The example is "Are potholes fixed within the time the city's own policy sets?" (core, L3; journey 4 step 4 and journey 6 steps 2–3).
- LAD:302–309, ORGANISATIONS needs:
  - C1: hold an obligation with its source in force.
  - C5: "Exceptions that lawfully discharge a duty", for example "Sole source is lawful if the justification is published" (DEC-9).
  - C6: powers ("was an act within the actor's authority").
  - C7: "Duties of private bodies acting for government" ("The hauler's duty under the franchise").
  - C8: "A body's own commitments".
- LAD:47 and LAD:345 make `duties` the one obligation object. Its `source` is a union: held standard at its version, court paragraph, **"labelled practice"**, labelled dependency. LAD:327's L3 example: "Obligation: the City Clerk must post minutes within a stated period (labelled practice, not law)".
- LAD:125 (C4, K1487): powers held in `duties` say "who had authority to approve, deny or waive". "Discretion is followed through the powers an office holds and the events that use them (an approval, a denial, a waiver), compared across cases."
- LAD:380 and LAD:401, PEOPLE D2 (K1465), Bob: "if somebody signed an order that was against a stated policy or law, then that's very important fact"; example "contrary to policy §4.2".
- MONEY:
  - LAD:620–623 (§5C.2 C1–C4): restrictions on funds and fees, procurement thresholds, restricted bond and grant proceeds.
  - LAD:618 B5: fund balances "in the class family of the fund's type (GASB 54's classes)", applied as a data model, not as a standard held against a body.
  - LAD:629 E2: unit cost, citing "GASB Service Efforts and Accomplishments".
  - LAD:789 LAW interface: "fee limits, restricted funds, thresholds and grant conditions as held standards".
- LAD:729 N16: published Criteria. The evidence column cites the GAO Yellow Book as a practice source; it is not held as a standard.
- LAD:1077 QUESTIONS interface: "the Legal/Policy Lookup (standards R9) as labelled proposals".
- LAD:773 notes, not studied: "whether an imported standard counts as an `official` copy".

### 1c. Requirements and code (built on the tranche: `standards` via STANDARDS #7, `duties` via K1585; neither reachable)
- STD:15 Purpose: a standard is "a statute, regulation, ordinance, court decision or order, adopted policy, or public commitment … what a government act is measured against".
- STD:22 R1 and `jurisdictions/index.mjs:35` (`SOURCE_KINDS`): kind is closed to `statute, regulation, ordinance, court, policy, commitment`. STD:92 R12: "the six kinds are the whole vocabulary (Operational Principle 1)". **`policy` is one undifferentiated kind.**
- STD:23 R2: "A standard is never held without a capture of its text". STD:37 R9: a proposal without captured text cannot be adopted (`STANDARD_NO_TEXT`).
- STD:24 R3: a citation that matches no profile `standard_sources` entry gives `source: undetermined`, "the standard is still held (K102)". The declared `kind` and `issuer` are kept as declared.
- STD:46 R18: `instrument` is an ELI-shaped key composed only from the profile (JUR:105 R50 `instrument_key`, plus the source entry's `key`). With no key it is `undetermined`.
- STD:47 R19: `copy` is `official | codifier | undetermined`, with `current_through` and `period_basis` (a cited passage or an enactment `EVT-`).
- STD:50 R20: `inForceAt`. STD:54 R22: closed relations; temporal ones are `amends, repeals, renumbers, recodifies`; referential ones are `refers_to, defines, excepts, implements`. There is no `incorporates`.
- STD:62 R26 and `bio-plane/src/standards/law.mjs:32`: a court link must end at a `statute`, `regulation` or `ordinance` (`COURT_LINK_TARGET_NOT_LAW`). **A ruling cannot be linked to a policy.**
- STD:95 R14: a standard is instance-wide, `sight: "group"`.
- JUR:38 R23: `standard_sources[{source, kind, issuer, level, cite, code?, basis}]`. JUR:43 R31: level is closed to `federal, state, county, city`. JUR:105 R50: `law_ranks` by kind × level.
- **The Oakland profile** (`jurisdictions/profiles/oakland-alameda.mjs:321–336`) has five sources: two ordinance sources and three statute sources. It has **no `policy` or `commitment` source, no `instrument_key` and no `law_ranks`.** Every policy declared in Oakland therefore reads source undetermined and key undetermined. The test profile has one `commitment` source (`test-port-ellery.mjs:220`).
- `duties`:
  - DUT:18–19: the obligor is an office or body, "or an organisation acting for a public body under a public law, contract, franchise or grant (K1440)". The source union includes `practice`.
  - DUT:28 R1 refuses `NOT_ACTING_FOR_PUBLIC` and `NO_ENFORCER` for an obligor outside the government sector.
  - DUT:37 R8: a practice source answers "held as practice", never in force.
  - DUT:16 and R10: `exceptions`; an occurrence is `discharged` "when a held exception applies".
- `progressions`:
  - PRG:15: a stage's `required` includes `unless_exception` (DEC-9).
  - PRG:37 R11 and PRG:42 R14: `dischargeStage`, with an exception document, citation and reason.
  - PRG:76 R39: a declared flow's `basis` may name a held standard. **This is the nearest built model of a written procedure.**
- `conformance`: a determination judges a "government act" whose actor is an office. CONF:50 refuses a `policy` key, meaning the group's own policy position (`RECOMMENDATION_IS_AN_ACTION`).
- Readers:
  - `doctypes/regulation.mjs:1–60` reads "an ordinance or a resolution". It requires the operative voice and recitals ("DOES ORDAIN", WHEREAS), which an administrative instruction or a general order does not carry.
  - The doctypes are generic, meeting-agenda, meeting-calendar, meeting-minutes, regulation, staff-directory and staff-report. **No policy, manual, general-order or SOP reader exists.**
- Entity kinds (`entities/index.mjs:33`) include `ordinance` and `contract`. There is no `policy` or `instrument` entity.
- Profile `practice` (`oakland-alameda.mjs:300`) holds `minutes_due_days`, now sourced to OMC 2.20.160. The word "practice" means different things in the profile and in `duties`.
- A guidance document already serves as a rule's source: K1504 (3) sources the receipt rule to the "Oakland City Attorney, Public Records Act staff guide § 5" (`oakland-alameda.mjs`, the `records_request` venue).

### 1d. Journeys and UX (designed in the design stream; mock screens, nothing built)
- JRN journey 6, step 3: the member "Finds the standard the city set itself: an ordinance, a policy, a budget promise, a contract term, a published service target". Step 4: "within the time its own policy sets". It is marked "Built now: Laws and policies held section by section".
- JRN §3 front doors:
  - "A franchise the city holds" → "hold its service levels as obligations the hauler owes and the city enforces" (journeys 12, 22).
  - "Police overtime" → "any overtime policy or audit … what policy allows" (journeys 12, 16).
  - "A law, code or policy" → "each requirement can be declared as a standard".
  - "A contract, franchise or agreement" → "obligations and deadlines as duties".
- JRN journey 9, step 2: pin the claim's terms "in the city's own words … If the city never says, that is recorded as 'Undetermined, because the city does not define it'".
- JRN §6 gaps: "A code's structure — the 'law, code or policy' row — Closed". **The design stream treats policies as already covered.**
- `ux-substrate/layouts.html:1190–1197`, mock "Standard" screen: "Administrative Instruction 4.12, §3 · in force since 2023 · policy, Public Works" (seven-day pothole rule). The AI proposes "the 2026 budget's performance target, '90% … within 72 hours'" as a standard. Mock :1123 shows policy against practice: "closed" is defined by AI 4.12 passage 5 as the crew reporting the work done, and no inspection records were found.
- `views/surfaces.html:111`: "Council resolution on certification timing · policy · the City Council · undetermined: no profile source matches". `views/matter-page.html:114`: "The city's certification procedure (adopted policy, in force)" with a compliant determination.

### 1e. Plan
- `build/plan/next.md:126` N629 and K1711 (2026-10-06): this study. `draft-T34-plan.md` holds nothing on policies; T34-21 (standards) is reads by key and portion only.

## 2. Assumptions that fit legislation but strain for policies

1. **One undifferentiated kind.** A council policy resolution, a city administrative instruction, a department SOP, a police general order, a training bulletin, a vendor model manual (Lexipol), an adopted professional standard and a budget performance target are all `policy` or `commitment` (STD R1, R12).
   - There is no axis for bindingness (binding, adopted guidance, advisory, model or best practice).
   - There is no axis for who adopted it (council, administrator, department head, board) or under what authority (the ordinance or charter section that delegates it).
   - `law_ranks` is kind × level only, so two city policies always share a rank.
2. **Issuers and levels are governmental.** JUR R31's levels (`federal/state/county/city`) have no place for a standards body (GASB, GFOA, NFPA, ICC, ISO, CALEA, POST), a utility, a contractor or a nonprofit. STD's Purpose and CONF's act both measure "a government act".
3. **ELI work keys come from profile data** (STD R18, JUR R50). Policy series are many and per department (AI 4.12, DGO K-3, Lexipol §300, a board's Policy 6145). Each needs a `standard_sources` entry with a `cite` pattern and a key segment.
   - Non-government issuers have no profile at all.
   - Oakland has no `instrument_key`, so every key is `undetermined` today, statutes included.
4. **Versions rest on enactments.** `period_basis` names an enactment `EVT-`, and watching rests on Legistar `MatterEnactment*` (LAD:88, :758).
   - Administrative policies are signed, not enacted. They are revised by memo or by a revision table, sometimes unnumbered, and posted as PDFs on department pages.
   - Vendor manuals (Lexipol) are revised by pushed updates. Rescission is often silent.
5. **Official versus codifier copy** (STD R19). For policies the question is a different one:
   - Is the posted copy the one in force, a draft, a superseded copy still posted, a redacted CPRA production, or a vendor model the agency adapted?
   - `copy` has no value for "produced in response to a request" or "vendor model".
6. **No adoption without captured text** (STD R2, R9, `STANDARD_NO_TEXT`).
   - Internal policies are often unseen. A staff report or an audit says "per department policy" (FA:275), or the text is withheld or exempt.
   - The record cannot hold "a policy exists, cited by X, text not held" except as an unadoptable proposal.
   - It also cannot hold "no written policy exists", a common audit finding.
7. **Standards incorporated by reference.** There is no `incorporates` relation, and none that pins an edition (an ordinance adopting the 2022 California Building Code, or NFPA 1710 at a stated edition), with local amendments as a delta.
   - Model-code and standards-body texts are copyrighted and often paywalled or read-only (ICC, NFPA, ISO, the GASB Codification).
   - Under K1449 such text reaches the record only by a member's own act, "not reproducible by the public". That collides with "never held without captured text" and with carrying the text into a published case or counsel packet (filings R8).
8. **Imports** (LAD:770: Akoma Ntoso, USLM, eCFR) cover legislation only. No structured source exists for municipal policies.
9. **Court links end only at statute, regulation or ordinance** (`law.mjs:32`).
   - A ruling interpreting a general order cannot be linked.
   - A consent decree requiring policy revision cannot be linked either; it can only be a duty with `arising_in`.
10. **Sight.** Standards are instance-wide (`sight: "group"`, STD R14). An internal manual handed in by a source (DEC-78) or held in a hidden project (K1489) would be exposed group-wide.
11. **Obligors.** `duties` admits a non-government obligor only when it acts for a public body, and only with an enforcing office (K1440; DUT R1). A company's, utility's or nonprofit's own policy (charity-care policy, code of conduct, a utility's internal rules) cannot be a duty measured on its own terms.
12. **Exceptions and waivers.**
    - These are modelled as:
      - a duty's `exceptions` that discharge an occurrence;
      - a progression stage's exception document;
      - the portion-to-portion `excepts` relation.
    - A granted waiver or variance is not modelled as an instance: who granted it, under which power, its scope, conditions and expiry. LAD:125 designs only "compared across cases" through events.
13. **Readers.** The only law reader is `regulation`, built on the enacting formula. Policy and manual layouts (numbered sections, a revision table, "Effective", "Supersedes", "Approved by") are unread.
14. **Vocabulary collision.** "Policy" also means:
    - the group's own policy (DEC-54's pinned policy; Intake's "ratified policy");
    - the refused `policy` key (CONF R8).

    "Practice" means a profile threshold in JUR but measured conduct in DUT. Both words matter for what members see under B20.

## 3. Gaps, each tied to a member situation where the canon has one
- **G1 Policy against practice** (FA:275; JRN journey 9 "closed vs repaired"; mock :1123; K1504 (1)).
  - Built: a `practice` duty source and an observed fact "beside the rule, never as the rule".
  - Missing: one way to hold the written rule, the measured practice and the pattern of divergence together, with denominators, short of a conformance determination after publication.
- **G2 Departmental and administrative policies as first-class instruments** (JRN journey 6 steps 3–4; the AI 4.12 mock; Police overtime "what policy allows").
  - Missing: issuer office, adopting authority and delegation, series and numbering as profile data, effective and revision history without Legistar, and a reader.
- **G3 Police general orders and manuals** (DR:160 "contrary to policy §4.2"; K1465; COURTS B1, the OPD decree, LAD:810).
  - Many decree tasks are policy revisions, and the monitor reviews policies.
  - Missing: a link from a policy to the decree paragraph that requires it, and Lexipol-style vendor provenance.
- **G4 Service-level and performance standards** (TIME A3; the franchise front door; journey 9; the mock's "90% within 72 hours" budget target; LAD:629 E2).
  - Missing: a target as a measurable standard (metric, threshold, period, the city's own definition) distinct from a claim, wired to ANALYSIS A1/A2 calculations and duty occurrences.
- **G5 Fiscal, accounting and professional standards** (GASB, GFOA, the GAO Yellow Book).
  - The canon uses GASB only as a classification model (LAD:76, :618).
  - Missing: holding "the ACFR must follow GASB 34" or "the city's adopted reserve policy follows GFOA" as a standard with an outside issuer and a level.
  - The OP1 line is unaddressed: is measuring against a best practice the city never adopted policy advocacy (K14)?
- **G6 Standards incorporated by reference** (building and fire codes adopted by ordinance; NFPA response times).
  - Missing: an `incorporates {edition}` relation, local amendments, and paywalled text under K1449 (no journey yet).
- **G7 Accreditation and certification standards** (CALEA, POST). There is no object and no journey; it is reachable today only as a `commitment`.
- **G8 Other organisations' policies** (Case Making :892 "action by some other person or organization"; the franchise hauler; Bob's "governments and other organizations").
  - Covered: duties for an organisation acting for government (K1440).
  - Missing: the organisation's own policy as a standard with a non-government issuer; conformance's actor model (office only).
- **G9 Guidance and interpretive documents** (the City Attorney staff guide in K1504 (3); AG opinions as "persuasive", LAD:813, :882). There is no binding/advisory axis, so a guidance document held as `policy` reads as binding.
- **G10 Waivers, variances and exceptions as granted instances** (LAD:125, "an approval, a denial, a waiver, compared across cases"; ORG C5; DEC-9).
  - Missing: the grant as a record with its power, scope, conditions and expiry, so that patterns of discretion can be counted.
- **G11 Policy known but not held, and absence of policy** (FA:275).
  - Missing: a cited reference to an unseen policy that can drive a records request (journey 7).
  - Missing: "no written procedure exists" as a finding at a stated level.
- **G12 Hierarchy and conflict** (LAD:723 N10).
  - Missing: policy below the ordinance that delegates it (`implements` exists, but rank is kind × level only); policy against policy; policy against contract.
- **G13 Confidential or source-provided policies.** Instance-wide sight conflicts with DEC-78 and K1489 (journey 20, handed-over material).
- **G14 UX.** The design stream marks "law, code or policy" closed (JRN §6). Members' words for advisory versus binding, and for a target, are not ruled (B20 stays with the design stream, K1437).

## 4. Bob's rulings that constrain a design (one line each)
- OP1 (RM:368), with K14: hold government to its stated policies, with no position on what policy should be. Policy advocacy is out.
- K102: standards requirements approved. A determination comes after publication, one outcome per standard, never composed.
- K1432 (B1 (c)): every construct to L5. The ladder is extended in the LAD §1 form (needs register, rung, design, prerequisites, decisions).
- K1431: a due date's basis is `rule`, `commitment`, `dependency` or `window`; only `rule` is a deadline the law sets.
- K1438 (B2): `standards` is in layer 5, beside investigation.
- K1440 (B4): one obligation object. The obligor is a public body or a body acting for one, never a private individual. Profile or machine duties stay proposals until a member adopts them.
- K1442 (B6): powers are read as instruments, never as "within powers". No walking reporting lines as delegation.
- K1443 (B7): the machine proposes duties, powers and law relations; only a member's act makes them.
- K1445 (B10): profile rules are sourced (citation, status, horizon) and adopted by a member. UNMEASURED is never a basis.
- K1446 (B11): law is work, version and portion, with evidentiary relations citing the instrument.
- K1447 (B13): a leg may cite a held standard; a sourced duty's occurrence may be a leg.
- K1449 (B15): fee-bearing or account-gated sources only by a member's own act, never unattended, not reproducible by the public. No required vendor key. This governs paywalled standards.
- K1453: organisations of every kind carry a closed `sector`. A person obligor only where a law binds them by name or role.
- K1465: who signed or decided an act "against a stated policy or law" is recorded.
- K1466: occurrence transitions are recorded, and plan steps may wait on them.
- K1468: extraction is targeted, at a member's request.
- K1474 (B12): closed book. Labelled, cited readings of "statutes, ordinances and policies", "legal information, not legal advice"; never "the law is".
- K1473 and K1491: machine checks are "Noticed" signals in the hypothesis layer, never a finding or a "violation".
- K1482 (B22): held standards travel in packs only by an explicit act and are recreated, with no inherited grade.
- K1486 (C3) and B20 (K1437: UX for the design stream): members see "standard", "requirement", "obligation", "power".
- K1489 (C6): hidden-project material stays fenced. This bears on standards' instance-wide sight.
- K1504 (1): observed practice is held beside the rule, never as the rule. (3) A sourced local guide may supply a profile rule.
- K1711: this study. Its needs register and ladder go in LAD form; decisions go to Bob with recommendations.
- DEC-9: `unless_exception` stages; a missing exception document is a finding.
- DEC-54 and K1440: reading law into a duty is a member's act.
- DEC-88 and K1025: the declarer's reason is required.
- DEC-107: "obligation" is shown only for a public body's duty.
- D-149: all applicable laws apply.
- D196: no jurisdiction in product code.
- DEC-24: the machine never concludes.
