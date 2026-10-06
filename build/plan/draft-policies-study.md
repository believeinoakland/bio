# DRAFT · Policies and standards beyond law: needs, ladder, decisions (N629, K1711)

BOB #122, 2026-10-06. Evidence: `study-policies/canon.md` (what the canon says and builds, with file:line) and `study-policies/world.md` (how policies and standards exist, Oakland first, every claim with its URL). When Bob has ruled, this becomes a new construct section of `docs/architecture/BIO_Capability_Ladders_v0_1.md` (§6B), its decisions recorded as K rulings, and its first rungs entries in the next plans.

## 1. Purpose

A group holds a body to its **own** rules as well as the law: the administrative instructions, department procedures, police general orders, board policies, service targets, fiscal policies and adopted technical codes it set or accepted, and the policies of the organisations that work for it. Canon already promises this (Roadmap core value 4 and OP1, "the law and its stated policies"; Case Making :892), but models every standard as legislation: one undifferentiated kind `policy`, versions from enactments, governmental issuers only, no adoption without captured text (canon.md §2).

## 2. Needs register

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| P1 | A department's or official's policy held as an instrument of its family (AI, DGO, Special Order, Training Bulletin, BP/AR, tariff rule, contract SLA), with issuer, series and number | "Administrative Instruction 4.12, §3, Public Works." | core | L2 | world §1; layouts.html:1190; JRN journey 6 |
| P2 | How binding each provision is: must, should, may; mandatory, adopted guidance, advisory, model, benchmark | "Is 'should respond within 72 hours' a rule or a goal?" | core | L2 | ISO shall/should/may; CALEA; GASB categories; G9 |
| P3 | Where its force comes from: the ordinance or charter section that delegates it, a resolution, an oversight body's approval, a court order, a contract, incorporation by reference, voluntary adoption | "Who gave the Chief power to issue this order, and did the Commission approve it?" | regular | L3 | Charter §604; Gov. Code §11340.5 |
| P4 | A policy cited but not held, and the absence of any written policy, recorded with the search made | "The audit says 'per department policy'; we don't have it." / "No written procedure exists." | core | L2 | FA:275; illegal-dumping audit |
| P5 | Versions without enactments: effective date, revision, supersedes, from the document's own header; portion-level overrides (a Special Order replacing a section until revision); every captured copy kept, since only the current one is posted | "What did the order say on the night of the incident?" | core | L3 | PC 13650; DGO/Special Order practice; CPUC sheets |
| P6 | A messy copy's identity stated: in force, draft ("XX" dates), superseded but still posted, CPRA production, vendor model the agency adapted | "This PDF says draft; is it the one in force?" | regular | L2 | world §3 |
| P7 | Service and performance targets as measurable standards: metric, threshold, period, the body's own definition | "90% of potholes within 72 hours: was it met?" | core | L3 | TIME A3; journey 9; budget performance measures |
| P8 | Policy against practice: the written rule, the measured practice and the divergence with its denominator, short of a determination | "'Closed' means the crew said so; nobody inspected." | core | L4 | journey 9; K1504 (1); OIG task audits |
| P9 | Waivers, variances and exceptions as granted records: who, under which power, scope, conditions, expiry; counted across cases | "How often has the Council waived bidding this year?" | regular | L3 | OMC 2.04; LAD:125 |
| P10 | Review cycles and owners stated, overdue reviews noticed | "M-03 was due for revision in 2018." | regular | L3 | DGO headers |
| P11 | Standards incorporated by reference at an edition, with local amendments and how the text can be read (free, reading room, paywalled) | "Which edition of the fire code did Oakland adopt, and what did it change?" | regular | L3 | Title 24 + OMC 15.04; 1 CFR 51; ASTM v. PRO |
| P12 | Criteria from outside the body: a state standard not binding on it, a professional best practice, a peer benchmark, its own past performance, labelled as such | "Oakland answers 911 calls far slower than the state standard." | regular | L3 | Yellow Book 8.18, 8.124; 9-1-1 audit |
| P13 | Other organisations' own policies measured on their own terms (contractors, utilities, grantees, hospitals, nonprofits) | "Does the hauler follow its own complaint policy?" | regular | L3 | Case Making :892; Bob 2026-10-06 |
| P14 | A policy handed in by a source keeps that source's confidentiality | "This manual came from inside; it stays in our hidden project." | regular | L2 | DEC-78; K1489 |
| P15 | Readers for policy documents: header block, numbered sections, definitions, applicability, responsibility tables, timeframes | (the machine reads AI 4.12's sections) | core | L2 | regulation reader needs "DOES ORDAIN" |
| P16 | Court orders and settlements that require policies, linked to them (decree tasks, monitor reviews) | "Task 41 requires this policy; is it adopted?" | occasional | L3 | NSA tasks; law.mjs:32 |
| P17 | The assistant finds and proposes the governing policy with its text, never states it | "Find the policy on pursuits, with the passage." | core | L2 | K1474; Skill 4 |
| P18 | Policy sets watched for silent change, shared between groups, vendor model manuals held as a base with local deltas | "Lexipol pushed an update; what changed in our county's manual?" | occasional | L5 | world §3 |

## 3. The ladder

| rung | a member can | state on 2026-10-06 |
|---|---|---|
| L0 Policy as plain evidence | Capture a policy PDF and cite passages as legs | usable today |
| L1 Policy named | Its citation recognised by series; every document citing it found | not built for policies (no profile series; Oakland has no `policy` source) |
| L2 Policy held | Hold it in its family with issuer and force grade; hold a policy cited but unseen, or recorded absent; the copy's identity; sight kept from a source; the reader; the assistant proposes | `standards` (one kind `policy`, layer 5, not reachable) |
| L3 Policy structured and versioned | Header-based versions and portion overrides; source of force; targets measurable; waivers as records; review cycles; incorporated standards with edition and access; outside criteria labelled; other organisations' policies; decree links | not built |
| L4 Policy applied | Policy-against-practice rows with denominators prepared for a member; findings name the criterion's grade; determination after publication (K102) | `conformance` (layer 9, not reachable; actor is an office only) |
| L5 Policy shared and watched | Watch portals for silent change; packs between groups; vendor-base deltas | not built |

## 4. Design sketch (BOB's, after the decisions)

- One home stays `standards` (K1446): `kind: policy` gains a `family` from the profile or the issuer's own vocabulary, `force` per portion (cited from the text's own words), `force_source` (an instrument held or a cited event), `copy` widened (in force, draft, superseded, production, vendor model), and a `held: cited | absent` state that cannot be adopted as criterion but can drive a records request.
- Versions from the document's header (`effective`, `revision`, `supersedes`, `review_due`) as evidentiary relations; `overrides {portion, until}`; `incorporates {edition, amendments, access}`.
- Targets: `standards` holds the target; `calculations` measures it; `duties` carries the occurrence (TIME A3).
- Waivers: an event of the power that grants it (`events` + `duties` powers), with scope and expiry; counted by `analysis`.
- Issuers: entities of any `sector` (K1453), with `jurisdictions` levels widened by `standards_body` and `organisation`.
- A `policy` doctype reader beside `regulation`.
- Sight: a standard captured from a project's material keeps that project's sight.
- Size (first estimate): L2 about 6–8 touched modules and 25–35 requirements, one new reader; L3 about 8 modules and 35–45 requirements.

## 5. Decisions for Bob

- **D1 · Construct.** Recommend: a construct of its own in the ladders (POLICIES AND STANDARDS), built on the same `standards` home as law, so policy gets its own needs and rungs without a second register.
- **D2 · Binding force.** Recommend: every held provision carries its grade, read from its own words and cited (must, should, may; mandatory, advisory, model, benchmark); a finding names the grade it rests on, and the machine never raises a grade the text does not state.
- **D3 · Outside criteria (OP1).** Recommend: a group may compare a body with a standard the body never adopted (a state standard not binding on it, a best practice, a peer, its own past), shown as a benchmark; nonconformity is found only against a standard binding on that body. Comparison is evidence, not advocacy.
- **D4 · Cited but unseen, and absent.** Recommend: hold a policy known only by citation, and "no written policy found" with the search made (portal checked, records-request answer); neither serves as a criterion until its text is held, and an absence is itself a finding.
- **D5 · Other organisations.** Recommend: any organisation's own policy may be held and measured on its own terms; members see "its own policy", and "obligation" stays for a public body's duty (DEC-107, K1440).
- **D6 · Copyrighted and paywalled standards.** Recommend: hold the edition, citation and access status always; the text only by a member's own act (K1449); publications quote only the passages a finding needs, never the whole text.
- **D7 · Confidential policies.** Recommend: a policy obtained from a source keeps the source's sight (hidden project, K1489), not the instance-wide sight standards have today.
- **D8 · Watching.** Recommend: for policies a group holds, the product watches their published copies and keeps every version it sees, since bodies post only the current one.

Not Bob's, decided by BOB: the staging (L2 beside LAW's stage 1 in the next plan that carries `standards`; L3 with LAW's stage 2), the module shape above, and the members' words, which go to the design stream as a HANDOFF once Bob rules (B20, K1437).
