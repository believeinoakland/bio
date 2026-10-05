# Digest: COURTS

Every phase-1 reader's COURTS section, in reader order (20 notes).

## From C1 (C1: BIO_Complete_Roadmap_v5.txt, BIO_Design_Requirements_v2.txt, BIO_Functional_Architecture_v3.txt, BIO_System_Design.txt, BIO_Action_v0_1.txt, MILESTONES.txt, UI-KICKOFF.txt)

- [EXAMPLE] RM §1 L256-258 — the group's own threatened proceedings in three venues — "a CPRA petition in Alameda County Superior Court, a complaint with the Alameda County Grand Jury, and a referral to the California State Controller's Office."
- [EXAMPLE] RM §1 L272-274 (and App B L1096-1102) — others' cases as precedent, each with its holding — "Carachure v. Azusa (2025, identical 10% sewer fee), Zolly v. Oakland (2022, franchise fees subject to Prop 26)"; "Weatherford v. San Rafael (2017): any local tax confers standing."
- [EXAMPLE] RM App B L1099 — a settlement with an amount and a party — "Livermore settlement: $3.78M (ACTA)."
- [EXAMPLE] RM §1 L279-281 — consent decrees and litigation as long-running proceedings — "the 23-year OPD consent decree"; "EPA consent decree, Prop 218 litigation"
- [EXAMPLE] RM §2 L287-289, L301-303 — the full range of quasi-judicial outputs that failed — "Individual lawsuits, audit findings, grand jury reports, and media investigations have all failed to produce sustained change"; "The city CAN ignore court orders, grand jury findings, CPRA deadlines"
- [DOCTRINE] RM §2 L316-318 — the group as defendant — "SLAPP suits, smear campaigns, infiltration"
- [DOCTRINE] RM §8 L513-516 (DR §8 L187-190) — precedent risk drives tiering — "a poorly filed Tier 3 case could create adverse precedent that forecloses future, properly constructed challenges."
- [DESIGN] RM §9 Skill 1 L573; Skill 3 L587-589; Skill 4 L593-594 — audit and grand jury reports surfaced; extraction from "court records"; lookup maps "case law".
- [EXAMPLE] RM §8 L531-533 — "consent decree motions"; "Contact information for legal organizations provided."
- [EXAMPLE] RM App B L1081-1087 — court procedure and grand jury powers as legal facts — "7923.005 (expedited hearing)", "7923.110 (burden on government)"; Penal Code "925a (examine city books), 919(c) (inquire into misconduct), 926 (hire experts)"
- [EXAMPLE] RM App A L1072, L1074-1075 — a recall; an external audit opinion — "Sheng Thao (2023-2024, recalled)"; "MGO (clean ACFR opinions)"
- [DESIGN] DR §8 Tier 2 L199-203 — procedural outcomes — "procedural errors could result in dismissal, typically without prejudice (meaning refiling is possible but costs time and money). Includes: CPRA court petitions."
- [DESIGN] DR §8 Tier 3 L205-208 — "a loss on the merits could create adverse precedent binding on future litigants"; "federal consent decree motions"
- [EXAMPLE] DR §11 L301-302, L312-316 — "court records" as a key data source; members must understand "what personal information becomes visible in court filings" and "how to respond to legal threats".
- [NEED] FA L1 Fn1 L132-136 — "court decisions (case law, consent decrees)"; "audit reports (City Auditor, grand jury, State Controller)"
- [NEED] FA L1 Fn2 L152 — "Court decisions are embedded in legal databases."
- [DESIGN] FA L2 Fn4 L317-319 — AI surfaces precedent for human significance judgment — "prior findings on the same issue, other groups' analyses, applicable legal precedents"
- [NEED] FA cross-cutting L447 — search must reach "legal databases (statutes, case law)"
- [BUILT] SD §3 row 8 L111 — action risk tier — "1, 2, 3 or UNDETERMINED … never defaulted to 1 (D-182)"; revised by "AUTHORED, APPEND-ONLY act with a REQUIRED reason (op=actionrisktier …)"
- [DESIGN] SD §3 row 16 L133 — "GRADE-A-CAPTURE.md for the venue's standard of evidence"
- [BUILT] SD §3 row 8 L109 — contradiction in the world is a finding — "in the WORLD it is a FINDING the system exists to find, in the RECORD it is a defect in our own holding"
- [DESIGN] AC §3 Standard L20 — "court decision or order" is a kind of standard (the only place courts enter the Action constructs).
- [RULING] AC §4 rule 13 L44 — "The venue sets the standard of evidence (Bob, 2026-09-30)."; "federal courts have accepted co-attested Grade B evidence since the 2017 amendments to Federal Rule of Evidence 902(13)–(14)"; "No action is refused for its evidence grade."
- [RULING] AC §4 rule 13 L44 — "Every filing and counsel packet shows each exhibit's grade, and where the profile states a venue's standard, shows it beside them."
- [RULING] AC §6 L74 — Intake Doctrine §3 / DEC-81(1) gains "a ceiling, not a minimum: the venue sets the standard"
- [DESIGN] AC §5 row 7 L56 — appellate-style outcomes live on a correspondence entry — "(granted, denied, partial, reversed, affirmed, none stated)"
- [DESIGN] AC §4 rule 7 L38 — "A member sends by the venue's own means and records the sending with the bytes sent"
- [DOCTRINE] AC §4 rule 12 L43 — prepared for "stonewalling, retaliation, discrediting, legal harassment"; what counsel needs (counsel packet, published case, evidence package) "survives the group's disruption."
- [DESIGN] AC §1 L10 — "a lawyer supports or changes a claim, an oversight body refers"
- [GAP] AC §3 L18-26 (reader's observation) — none of the seven Action constructs is a court case, docket, party list, filing history, order or judgment as an object; courts appear as a Standard kind, a venue, and correspondence outcomes.
- none in MS; none in UK.

## From C10 (C10: OBSERVATION-LOG-DESIGN.txt, BIO_Technical_Architecture_Decisions_v10.txt, BIO_Distribution_v0_1.txt, PRACTICE-SURVEY.txt, CONSTRUCTS.txt)

**OBSERVATION-LOG-DESIGN.txt**
- none in OBSERVATION-LOG-DESIGN.txt.

**BIO_Technical_Architecture_Decisions_v10.txt**
- [EXAMPLE] TAD §8.2 l.917: a civil suit as the multi-stage clock shape — "a multi-stage schedule with dependencies (a civil suit)". "order" is a named deadline origin (l.918).
- [DESIGN] TAD §2 l.263–272: the action suite includes "prosecutions, negotiations, settlement". §8.3 l.933 names "a negotiation tracker" as an internal surface.
- [DESIGN] TAD §4 l.435–437, l.286–300: the Work Product is "Focused, like a legal brief", "a legal-brief-style argument grounded in credible primary sources". "a court record" is a primary-source leaf (l.467).
- [OPEN] TAD §12 l.1641–1642: chain of custody, i.e. whether WACZ/SHA-256 meets an evidence package's needs (admissibility). §5 l.570: the "requires counsel" tier.

**BIO_Distribution_v0_1.txt**
- none in BIO_Distribution_v0_1.txt.

**PRACTICE-SURVEY.txt**
- [EXAMPLE] PS §2 l.74, Everlaw: "discovery → trial prep: turn reviewed documents into a case". The Evidence page holds "deposition excerpts".
- [NEED] PS §3 l.88–95: a lawyer's expectation. — "every document can answer "where did this come from and who touched it" without anyone reconstructing it afterwards". BIO's provenance chain and `op=export`/`exportlog` are the same artifact, hash-anchored.
- [EXAMPLE] PS §3 l.96–104: the privilege log resembles BIO's exclusion statement, but inverted. — "a privilege log exists to PROTECT the withholder; BIO's exclusion statement exists to EXPOSE the author". Relativity's automated log generation "is exactly the prefill BIO must refuse".
- [NEED] PS §3 l.105–109: "Production is a deliberate, formatted, irreversible act" (Bates numbering, redaction, slipsheets, endorsements, load files). This supports keeping ATTESTATION on its own rung.
- [EXAMPLE] PS §6 l.179–185: Bellingcat's open-source evidence was "upheld in a human rights court" (2023 source). Weakness: "Nothing states the STRENGTH of the conclusion or what was excluded."
- [EXAMPLE] PS §6 l.188–193: Perma.cc measured link rot in "cited U.S. Supreme Court opinions" ("about half").
- [GAP] PS NO PRECEDENT l.288–290: a precedent-like reuse of the group's own findings. — "A published conclusion that is an INPUT to the next inquiry rather than a terminus ... no tool here makes a published case citable as basis with its strength inherited."

**CONSTRUCTS.txt**
- none in CONSTRUCTS.txt.

## From C11 (C11: src/DECISIONS-archive-part1.txt)

- [EXAMPLE] DEC-4, src 110–113 — scanned-only PDFs are disproportionately the legally weighty documents: signed orders, exhibits, handwritten annotations, faxed correspondence; hence OCR must be built. — "Scanned-only is what a signed order, an exhibit, a handwritten annotation, a faxed correspondence and an item deliberately released as an image all look like"
- [EXAMPLE] DEC-13, src 863–869, 902–910 — audit practice (GAGAS/GAO: the audited body's response printed beside the finding) and journalism standards (SPJ; Columbia review of Rolling Stone's "A Rape on Campus": a comment request "WITHOUT SPECIFICS as the central failure") are the evidence base for the right of reply — audits as a quasi-adjudicative model the publication ceremony borrows.
- [EXAMPLE] DEC-14, src 978–980 — "a hearing record" named as outside evidence that can establish impact.
- [EXAMPLE] DEC-17, src 1293–1295 — "a project convened to decide whether to refer something to an auditor needs a different standard from one convened to decide whether a thing is worth looking at"; referral to an auditor (oversight body) as a use case.
- [DESIGN] DEC-17 amendment, src 1335–1339 — standards of proof borrowed from adjudication ("beyond a reasonable doubt") are mapped to the record's own grade pair (capture, connection), declared per project; no mapping from legal standard names to grade letters is given here.
- [GAP] DEC-23, src 1629–1631 — same gap applies to court and administrative documents: no sub-document citation (a paragraph of an order, a finding of an audit) until the content-extent primitive (D-164) lands.
- [EXAMPLE] DEC-27, src 1821–1823 — audit types (controlled vs general audit) as the subject of a member claim; audits are in COURTS scope (administrative/quasi-judicial).
- [DOCTRINE] DEC-30, src 2041–2042 — "Dissent that must be expressed before the act is a veto; dissent expressed on the record after it is evidence"; "contradiction is a thing to FIND (D-80)".

## From C12 (C12: DECISIONS-archive-part2.txt)

- [RULING] DEC-40 (L223–250) — provisional "stances" included "Citing this in a filing (A/A)"; Bob refused the stance construct entirely (see DOCTRINE). Bears on COURTS only in that use of a published case in a filing is NOT a product-defined purpose. — "Citing this in a filing (A/A)"
- [DESIGN] DEC-40/41/44 (L251–500) — NB for analysts: "case" in these rulings is the GROUP's published case (container over findings), NOT a court case; nothing in DEC-40–44 models court cases, dockets or parties. The only court-adjacent touch is the refused "Citing this in a filing" stance.
- [EXAMPLE] DEC-55 (L1395–1398) — one of only two court items in this file: the *Cerebras* e-discovery stipulation (prompts disclosed, changes redlined within three business days) cited as what "adversaries negotiate when they cannot trust each other". Court orders/stipulations appear as sources of procedural standards, not modelled objects. — "what adversaries negotiate when they cannot trust each other"
- [RULING] DEC-61 (L1659–1669) — the GROUP's own legal exposure is designed for: investigative-session transcripts are protected from subpoenas (device-local so "a demand must reach the member, who can contest it"; an instance-side cache "lives with a third party who can be served directly and has no incentive to resist"); routine deletion at publication; LITIGATION HOLD suspends TTL and deletion once a group is on notice. Courts appear as an adversarial process the group may be subject to, not as modelled objects. — "therefore the purge is SUSPENDABLE (a litigation hold)"
- [GAP] whole file — court cases, dockets, parties, filings, orders, judgments, appeals, settlements, administrative proceedings are not modelled in any DEC of this half. Courts appear only as (a) an adversarial process the GROUP may face (subpoena, spoliation, litigation hold — DEC-61) and (b) the source of a procedural standard (Cerebras stipulation — DEC-55).

## From C13 (C13: src/plan/ (research-oakland-calendar, draft-planning-skill, draft-filing-templates, action-design_PATH, action-design_UX-ANSWERS, action-design_action-plans, action-design_deltas, action-design_HANDOFF, action-design_tests))

### research-oakland-calendar.txt
- [BUILT] Offices table, L16 — the court appears in the profile only as venue `records_petition` (`how: court`): the only court construct is a filing venue for a records petition.
- [EXAMPLE] M-NEW-3, L71–93 — a court's own holiday calendar (14 dates in 2026) differs from county and City lists; judicial holiday calendars are per-court publications.
- [EXAMPLE] M-NEW-7, L202–231 — clerk's office hours by channel, drop box, e-filing monthly outage; writ-department assignment (Depts 24, 25, 303) decides which clerk's office receives a records petition: "that a records petition goes to this clerk's office rests on the writ-department assignment quoted".
- [GAP] M-NEW-7 / Facts not sourced 8, L311 — the e-filing "deemed filed" cut-off is unknown — a filing-time rule the court venue would need.
- [EXAMPLE] M-NEW-8, L241–242 — the Civil Grand Jury "is convened by the court"; complaints "received directly at the offices of the Grand Jury"; anonymous complaints only by paper mail or fax — a quasi-judicial body as a counterparty with its own channel rules.
### draft-planning-skill.txt
- none in draft-planning-skill.txt beyond "venues" and `filings.availableActions` being read (R51, L26); no court case, docket or order construct is read or proposed.
### draft-filing-templates.txt
- [DESIGN] §2, L71 — venue (R25) may carry hours; "received after close" rule needs time zone — a filing-time rule relevant to court venues.
- [RULING] §5 K921/K924, L182, L185, L195 — Tier 3 action kinds go through counsel: `brief` templates are "the basis of a briefing forwarded to lawyers to file"; `counselPacket` at every tier, counsel required only at Tier 3 (`NO_COUNSEL`) — the product prepares briefings for lawyers; it does not itself litigate.
- [DESIGN] §1 professional reviewer, L39 — a lawyer reviewing a template, credential (bar number) "as stated", never verified.
- [GAP] whole document — no court case, docket, order or proceeding construct; courts appear only as venues and through Tier 3 counsel briefings.
### action-design_PATH.txt
- [DESIGN] §2 step 10, L23 — "a legal option goes through the existing filing or counsel-packet surface".
- [DESIGN] §2 step 11, L26 — "each subject's escalation stage" tracked; replies "arrive as recorded correspondence on the action".
- [EXAMPLE] §2 step 7, L19 — a branch waits "when the certification's escalation reaches legal tools" — escalation to legal tools is a stage, not a tracked proceeding.
### action-design_UX-ANSWERS.txt
- [EXAMPLE] UC-129, L22 — "a litigation-hold reminder for legal threats": the only litigation-related construct here, a reminder.
- [GAP] both documents — no court case, docket, order or judgment tracking; a legal option ends at a filing or counsel packet.
### action-design_action-plans.txt
- [DESIGN] Terms, L15 — category `legal` among `mitigation`, `legal`, `awareness`, `journalistic`, `grassroots`, `other`.
- [RULING] Uses, L80 — `filings.availableActions` "shown beside legal options; never a catalogue, ruling 2".
- [DESIGN] R6, R15, L27, L42 — each determined subject's escalation stage (`escalation.escalationRead`) is read; branches may wait on another subject's escalation stage; R18, L47–48: "The plan never opens, advances or ends an escalation."
- [GAP] whole document — no court-case, docket or order construct; a regulated date's basis may be an "order" (L15) but orders are not records the plan links to.
### action-design_deltas.txt
- [DESIGN] §2 R47, L17; §4 L36–37 — legal pressure ("a threat of suit, a subpoena, a demand to preserve") marked on a received entry → OBLIGATION for an administrator to consider a litigation hold (DEC-61), open until cleared (K613 (2)): the group as potential litigant/defendant handled as correspondence and a queue item, not as a case record.
- [RULING] §2 R48, §6 R39, L18, L46 — a venue's standard of evidence and accepted capture grades (e.g. a rule of evidence's number) as profile data; flags "so counsel and members can prepare".
- [DESIGN] §5, L42 — "candidate theories (`filings` R14)": legal theories proposed by AI for filings.
- [DESIGN] §3 R22, L26 — counsel-packet exports carry the in-band stamp (`publication.inbandQuartet`).
- [GAP] whole document — no construct for a court proceeding, its docket, orders or deadlines; escalation exists "only for a determined breach" (L19).
### action-design_HANDOFF.txt
- [RULING] L26 (Bob 2026-10-01, DEC-115) — `start-and-send.html` binds content, step order and wording; in `surfaces.html` "the Tier 2 filing draft and the counsel packet (Tier 3) panels bind likewise"; every approved template version offered, latest by default, filing without one allowed (K921, K924).
- [GAP] Found on the way, L43 — "Filing drafts and counsel-packet exports carry no in-band stamp (Publication §3 rule 9), though `publication` R16 provides it."
- none otherwise (no court case, docket or order construct).
### action-design_tests.txt
- [DESIGN] actions R48, L50 — "a Tier 2 filing resting on a Grade B capture is prepared and shows the grade and the venue's stated standard"; "not applicable (nothing refuses)".
- [DESIGN] jurisdictions R39, L65 — `evidence` validates and reaches `combine`; disagreeing profiles withhold it and report the conflict; `GRADE_UNKNOWN`, `EVIDENCE_NO_STANDARD`.
- [DESIGN] R15, L23 — "a phase starting when another subject's escalation reaches stage 5" — escalation stages are numbered (stage 5 as a test fixture).
- [DESIGN] filings R22, R24, L57–58 — counsel-packet exports carry the in-band quartet and the premise disclosure.
- [GAP] whole document — no test of any court-case, docket or order construct (none designed).

## From C2 (C2: DECISIONS-design-branch.txt)

- [RULING] DEC-72 (src 214–216) — the standard of evidence varies by project audience; a finding may clear a journalist project's bar and fall short of a lawyer project's — "the same finding may clear a journalist project's bar and fall short of a lawyer project's, and both facts stand."
- [RULING] DEC-31 (src 457–534) — addressed non-public delivery (e.g. "a confidential referral, a pre-publication briefing") — AUDIENCES line "settled by the first lawyer, not by argument"; answered 2026-09-17 as an advance/review copy kept inside the instance; true confidential delivery "is a different and much larger act and is NOT what this entry answers" (src 503).
- [EXAMPLE] DEC-39 (src 810–818) — Bob's trial example: a coroner's courtroom testimony held in the record only as a NEWSPAPER ACCOUNT, with a member who was present and a court transcript not yet published; it is a DIRECTNESS problem, not a co-attestation case — "a coroner's courtroom testimony — held in the record only as a NEWSPAPER ACCOUNT, with a member who was present and a court transcript not yet published"
- [GAP] DEC-39 / D-184 (src 843–846) — a member's FIRSTHAND observation (e.g. of a hearing) has no home as a basis leg; likely failure is citing the newspaper for a fact personally witnessed; not fixed by the wording — "a member's FIRSTHAND observation has no home as a basis leg, so the likely failure is a member citing the newspaper for a fact they personally witnessed."
- [RULING] DEC-77.2 (src 1270) — CCCER, "the government auditing standard's elements of a finding", is the published form of an obligation-against-act finding — audit-finding form adopted for the product (administrative/audit construct); CAUSE held by no requirement today.
- [RULING] DEC-78.5 (src 1293–1299) — "a whistleblower filing" may reveal parts of a source's identity; "a filing confirms their role" firms identity, reaching findings as a re-evaluation notice; how a disclosure became known includes "an official filing".
- [RULING] DEC-81.1 (src 1345) — capture grade needed for legal use: co-attested B suffices for publication, but "Grade A stays the ceiling for adversarial or legal use"; Grade A deferred (src 1351) with triggers including "a group's published case is challenged on a document's authenticity; a group needs evidence for legal or adversarial use".
- [GAP] DEC-81.4 / GRADE-A-CAPTURE.md (src 1351–1353) — no route builds Grade A; research done (Browser Rendering + CDP driver `browserrender.mjs` + hand-written WARC/WACZ writer + ECDSA P-384 + RFC 3161), three decisions with Bob (Grade A rule text, member-recorded WACZ grade, robots.txt); nothing built — so evidence for court use is not yet producible.
- [RULING] DEC-88 (src 1441–1444) — action/legal-process acts banded: `filingprepare` REVERSIBLE (machine work); `filingsent`, `escalationopen`, `escalationattach`, `counselpacket`, `actioncorrespond` REASONED; `filingapprove` and `escalationend` TERMINAL; `filingapprove` among the six heavy judgement calls — "`escalationend`, `filingapprove`"
- [RULING] DEC-89 (src 1458) — escalation (the path toward external forums) requires a reason to open; DECLINE TO ESCALATE is reasoned, attributed, dated, corrected forward only; a later escalation supersedes, both stay readable.
- [RULING] DEC-93 (src 1509–1521) — action-plan questions (deadlines, dependencies, outcome branches) moved to a separate Actions session; court/filing deadlines planning therefore lives there, not in this register.
- [RULING] DEC-100 (src 1629–1647, Bob 2026-10-01, answered in part) — the published case's DOCKET modelled on how the CPUC curates a docket (party-like standing, filing under seal with redacted public version, ex parte disclosure offered as imports): (1) the named subject has party-like standing; (2) "I don't believe it's appropriate to support confidential filings or redacted versions" — no sealed or redacted entries; (3) no ex parte-style disclosure of off-the-record contacts; (4) standing may be granted to others (as CPUC grants party status); (5) redaction is the submitter's alone; the group may decline to post a submission containing redactions; the rest of question 36 (docket design, required core, signing, withdrawal) open.
- [EXAMPLE] DEC-100 (src 1630) — "Bob's discussion of how the CPUC curates a docket" — an administrative/quasi-judicial proceeding used as the model for the product's own docket; evidence that Bob reasons from regulatory-commission procedure.
- [RULING] DEC-102.1 (src 1677, Bob 2026-10-01) — anonymous member testimony is like an anonymous tip, potentially weaker; "Anonymous testimony and evidence must be corroborated based on journalistic and legal standards." — owed (src 1682): "what counts as corroboration to journalistic and legal standards" (a legal-standard construct the record must hold).
- [RULING] DEC-105 (src 1712–1724, Bob 2026-10-01) — standards of proof by audience: the owner sets a bar letter per axis under the honest line "CivicOS has no guidance yet on what particular audiences expect."; guidance when it comes takes the VENUE form: "sourced audience standards in the jurisdiction profile beside the choice, \"Undetermined\" where unresearched, never preselected or defaulted"; for actions "each venue's standard is a sourced profile fact, never refusing (K597 (3), K600 (b))"; research on trigger: a group asks, or "a case is challenged as below its audience's standard".
- [OPEN] DEC-108 owed (src 1772) — "how a litigation hold (question 31) affects the archive's clearing" — litigation holds on the group's own material are an open UX question (31) the product must address.
- [RULING] DEC-113 (src 1850–1863, Bob 2026-10-01 "Q#31: as recommended") — LITIGATION HOLD, doctrine on preservation and spoliation (DEC-61: "THEREFORE THE PURGE MUST BE SUSPENDABLE … once a group is on notice, both the TTL and the publication-deletion must stop for relevant material"): "hold in place" stops both scheduled deletions of assistant transcripts on every member's device for the threatened action's project (filled in automatically) and other named projects; device checks before deleting, fails closed; placing light (any member who can see the action), "Hold released" heavier with its consequence stated, administrators and placer told once; held-project strip shown only to those who can see the project (DEC-36); operator's wipe of the real record refused while any hold is in place (supersedes actions R52 "Nothing here suspends a purge"); "Counsel's review of these defaults before a group relies on them is advised."
- [RULING] DEC-113 provisional (src 1855) — K899 (7) the hold as a member's named, reasoned statement ("in place"/"released", latest standing); K901; K918 (reasoned); K1019 (doorbell archive clearing pauses while any hold is in place).
- [RULING] DEC-115 (src 1879–1891, Bob 2026-10-01 "Q#35: as recommended") — `start-and-send.html` binds (refusal visible before anything runs, reason asked in place, approving kept separate from recording the sending); in `surfaces.html` "the tier 2 filing draft and tier 3 counsel packet panels bind"; filing-template rules K921, K924: "a template is the basis of a group's own filing or a briefing to counsel; every approved version offered, the latest by default; a filing may be written without one".
- [RULING] DEC-116 (src 1893–1913, Bob 2026-10-01 "Q#36: as recommended") — the published case's DOCKET (a signed public object beside each case): dated entries naming the edition they concern; three shelves (stood-behind as accurately listed; "Reactions elsewhere" labelled "Listed by the group. Not evidence. Not endorsed."; "In our record only"); checks on form, never merit; "A docket entry never makes anything evidence"; required core as manager To-dos (every response the subject sends; any captured public statement by the subject — "a press release counts"; a newer edition with its "What changed"; a withdrawal; required disclosures); standing a signed entry with a reason, withdrawal of standing prospective only; entries taken back by later entries, never deleted.
- [RULING] DEC-116.7 (src 1909) — withdrawal of a published case (N470): the manager's signed docket entry naming one edition or all with a published reason; edition stays readable under a stamp; never lifted; sends re-evaluation notices (reevaluation R16's missing trigger since K943) — "It never erases: a legally compelled removal has no path here and would be a separate question."
- [GAP] DEC-116.7 (src 1909) — no path for a legally compelled removal (court order / takedown) of a published case; named as "a separate question".
- [RULING] DEC-116.3 (src 1905) — outside responses to a case: found by member link, standing watches, or the assistant's labelled suggestion (DEC-95 (3)); captured with grade and co-archive; linked to a named edition; record/public/both by reasoned choice; "a contesting response prompts a re-evaluation notice, may become a plan checkpoint, and a threat takes a pressure mark" (legal threats as a recorded pressure).
- [RULING] DEC-119 (src 1952–1953) — corroboration guard for anonymous member testimony (independent corroborating leg; DEC-102's "journalistic and legal standards") applies to off-the-record sources attested by such a member.
- [RULING] DEC-121 (src 1979, 1985) — the filing-template library's governance (K921, K924; filing-templates R1–R14: versioned, never edited, owner-approved, retired never deleted) is the model reused for wizard scripts — evidence the filing-templates module's governance is built/defined.

## From C3 (C3: BIO_Content_Framework_v0_10.txt)

- [EXAMPLE] §8.3 M-119, src 1055 — "the City Auditor" is one of four source systems measured for shared identifiers (an audit office as a publisher of identifiers; nothing about audits as proceedings).
- none in BIO_Content_Framework_v0_10.txt for court cases, dockets, parties, filings, orders, judgments, appeals, settlements, consent decrees, hearings, commissions, inspectors general, grand juries or AG opinions: grep after the full read finds no "court", "docket", "lawsuit", "litigat", "hearing"; no court/docket content type among the registered doctypes (meeting_calendar, meeting_agenda, meeting minutes, staff report, ordinance or resolution; staff directory unwritten — §16 FW-18, src 2062–2071).
- [EXAMPLE] §13.1, src 1555–1556 — "The Oakland Auditor uses its discretion to control the narrative" is given as a pattern statement that "is analysis and stays analysis" (an audit office as a subject of bias statements, not audits as proceedings).
- [DESIGN] §13.1, src 1633–1634 — a measured pattern statement "survives being read aloud by an adversary" (adversarial setting acknowledged; no model of proceedings).
- [GAP] §8.2 progressions, src 834–840, 955–957 — the progression/declared-flow construct is generic over "many types of happenings and progressions"; a court case's docket (filing → order → judgment → appeal) or an audit (finding → response → follow-up) would be a progression definition authored as DATA (§9: a new connection kind = "one row of data, no code"), but no such progression is named in this document.

## From C4 (C4: BIO_Case_Making_v0_1.txt, BIO_Declared_Bias_v0_1.txt, BIO_Interaction_Constructs_v0_1.txt, BIO_Assistant_and_AI_Roles_v0_1.txt)

- [NEED] CM §The frame audiences (CM 129) — lawyers are an audience: "supporting a claim, or changing a claim" — "lawyers | **supporting a claim, or changing a claim**"
- [DESIGN] CM §2 D-147 lifecycle (CM 248–249) — a `sent` correspondence entry may be a request, fee-waiver request, an appeal (naming the decision it appeals) or a COURT FILING — "a `sent` entry may be the request, a fee-waiver request, an appeal (naming the decision it appeals) or a court filing"
- [RULING] CM §2 D-182 (CM 168–169) — risk tier 3 = "do not file without counsel"; filing templates not included in the mission of record — "(evidence published, filing templates not included)"
- [BUILT] CM §2 D-147 (CM 251–253) — `received` entries may be an appeal or COURT DECISION; outcome closed vocabulary includes reversed · affirmed — "or an appeal or court decision. A decision carries its OUTCOME in a closed vocabulary (granted · denied · partial · reversed · affirmed · none stated), as the body gave it"
- [DESIGN] CM §3 (CM 287–290) — claim strength per audience: "a lawyer needs "the record establishes""; journalist "records suggest"; administrator "worth checking" — "A journalist can publish "records suggest"; a lawyer needs "the record establishes"; an administrator may act on "worth checking.""
- [DESIGN] CM §The remaining distinction (CM 503–505) — a case may be "a claim to a court"; the ask is an action and the case justifies it
- [DOCTRINE] CM §What a CLAIM is (CM 705–707) — "enough" depends on purpose: "enough to publish a question is not enough to refer to a prosecutor"; no sufficiency threshold in the object; DEC-15 project-declared required strength is a declaration not a gate — ""enough" is not a property of the evidence but of what you intend to do with it"
- [EXAMPLE] CM §utility example (CM 794–795) — court decisions that clarify constitutional rights cited as legs of a claim (precedent/interpretation as evidence)
- [EXAMPLE] CM §THE ACTION PLAN 2 (CM 939–941) — grand-jury referral considered and declined because the filing window closes first
- [BUILT] CM §THE ACTION PLAN 4 (CM 976–978) — `action_kind` includes `grand_jury`, `controller_referral`, `litigation_support`
- [DESIGN] CM §THE ACTION PLAN 3 (CM 960–961) — step resources include expertise and "standing to bring it"
- [EXAMPLE] CM §7 (CM 1130–1133) — plan deliberation ("we considered litigation and cannot afford it") is sensitive and "most likely to be sought under legal process" → plan is WORKING material, never published (DEC-25 provisional) — "It is also the material most likely to be sought under legal process."
- [GAP] CM §6b (CM 1109–1111) — mechanical precondition checks (filing window, standing, exhaustion of remedies) deferred (D-165)
- [DESIGN] DB §Why this exists (DB 54–55) — judicial adverse-inference rules cited as pedigree for declared inference bias — "adverse-inference rules are declared inference bias in judicial dress"
- [RULING] AR §3 rule 6 DEC-61/DEC-113 (AR 81) — transcript purge suspendable for a LITIGATION HOLD; "hold in place" stops scheduled deletions for the threatened project and named projects; releasing is the heavier act; operator wipe refused while any hold stands — ""hold in place" stops both scheduled deletions on every device for the threatened project and any projects the member names"
- none in BIO_Interaction_Constructs_v0_1.txt

## From C5 (C5: INVESTIGATIVE-SESSION.txt, ASSISTANT-PILOT.txt, RETRIEVAL-SUBSTRATE.txt, CONTRADICTION-IDENTIFY-DESIGN.txt, FINDINGS-WORKPLAN.txt, RETRIEVAL-PROBE.txt)

- [RULING] INVESTIGATIVE-SESSION header, src 12 — DEC-113: a litigation hold (the group's own litigation exposure) stops device deletion of AI-session transcripts for held projects and refuses the operator's wipe — the only court-adjacent item in lines 1–250.
- [DESIGN] INVESTIGATIVE-SESSION §7.1, src 605–630, 648–658 — "case" in this product means the group's PUBLISHED case (DEC-72: a production of a project over finding-versions; ratified, signed editions), not a court case; no court-case material appears in lines 501–750.
- [RULING] INVESTIGATIVE-SESSION §14a DEC-113, src 1299–1311 — the litigation hold is "the member's recorded statement on a reply marked as a legal threat ("hold in place" or "hold released", with a reason; K899 (7))"; placing is light (any member who can see the action), releasing is heavier (states what will be deleted; admins and placer told); while any hold is in place "the operator's wipe of the real record is refused"; counsel review advised — the group's OWN legal exposure as built doctrine.
- [EXAMPLE] INVESTIGATIVE-SESSION §14a BOB-3, src 1392–1395 — Public Ethics Commission publications (an administrative/quasi-judicial body) including sixteen years of annual reports are disallowed by robots.txt; capture permitted by BOB-3.
- none in ASSISTANT-PILOT.
- none in RETRIEVAL-SUBSTRATE.
- none in CONTRADICTION-IDENTIFY-DESIGN.
- [DESIGN] FINDINGS-WORKPLAN Family A1, src 29–31 — register entry owed for transcript retention "(device-local/TTL/purge-at-publication/litigation hold)" — the litigation hold entered the register as DEC-61 (the only court-adjacent item).
- none in RETRIEVAL-PROBE (the `auditor` query term is the only audit-related item, src 86).

## From C6 (C6: BIO_Publication_v0_1.txt, BIO_Intake_Doctrine_v1_1.txt, SOURCE-ACCESS.txt, AUTHORITY-AND-TRUST.txt, BIO_Communications_Platforms.txt)

- [GAP] Pub §7 incomplete L40, §6 L433 — catalogue of standards "by audience and output act" owed; Pub never lists the eight audiences (it points to archived `AUDIENCES.md` §10), so a court as an audience is never named in Pub; the only court-shaped words are "legal venues" (DEC-105, L733) and the risk tiers (§8)
- [DESIGN] Pub §5D L413-427 (DEC-100, DEC-116) — the case DOCKET borrows court vocabulary: dated entries, "party-like standing" for the named subject, grants of standing "by a signed docket entry with a reason", submissions, redaction only by the submitter, withdrawal as "a signed, final notice" — a quasi-adjudicative record of the group's own case, not a court docket
- [GAP] Pub §5D L427 — "a legally compelled removal has no path here" (court order against a publication not modelled)
- [GAP] Pub §6 L439 — an output act that "needs" a licensed professional's certification (e.g. a court filing) is a named, unmade divergence; the eight audiences are professional roles (catalogued in archived AUDIENCES.md §10, not in this doc)
- [GAP] Pub §7 L636 — no catalogue of what an audience (e.g. a court or tribunal) requires as standard of evidence; whistleblower and off-the-record sources treated as instances of attribution choice
- [RULING] Pub §7 L733-734 (K597 (3), K600 (b)) — a form "already ruled for legal venues": each venue's researched standard is a sourced fact in the jurisdiction profile, undetermined where unresearched, never a default (courts/venues as jurisdiction-profile data)
- [DESIGN] Pub §8 L753 — Tier 3 because "a poorly filed Tier 3 case could create adverse precedent that forecloses future, properly constructed challenges" (precedent risk drives withholding filing templates)
- [GAP] Pub §8 L753 (D-182, 2026-09-23) — risk tiers half-built: UNDETERMINED written where no member stated a tier; "NOT BUILT: a member-facing tier chooser, and actions written at the old default still read 1 because their bytes say so"; §9 L767 "half-built and dishonest"
- [EXAMPLE] Int §1 L175-177 — "Revisit if a document class emerges whose whole content is the evidence (a leaked memo, a court order); the draft position is that such a document is itself a series of one" (a court order as an admission unit)
- [RULING] Int front matter L6 (DEC-81) — Grade A is "a ceiling, not a minimum: the venue sets the standard" (venue = e.g. court; Action §4 rule 13)
- [DESIGN] Int §3 L344-348, L395-397 — Grade A (WACZ chain-of-custody capture) is "the ceiling for adversarial or legal use"/"adversarially distributed work products"; the venue sets the standard of evidence (court admissibility left to the venue)
- [EXAMPLE] Int §2a L296 — a source's identity may appear "in a whistleblower filing" (a filing in another proceeding as a disclosure event)
- [EXAMPLE] SA L47-50 — legal characterisation of a capture technique: "how a court or a newsroom would characterise UA delegation" governs its availability (courts as the arbiter of acquisition legitimacy)
- [DESIGN] CP §Function 2 L155-158 — "Groups hosting sensitive work products (particularly evidence packages related to active legal matters) should maintain copies on at least one additional platform"
- [DESIGN] CP §Design Principles L52 — "SLAPP-related takedown requests" (litigation against the group as a design threat)
- [DESIGN] CP §Risk L288-291 — "A poorly filed legal action could create adverse precedent that makes future, properly constructed cases more difficult or impossible"
- [EXAMPLE] CP §Risk L302-316 — court actions: Tier 2 "CPRA court petitions" (dismissal "without prejudice"); Tier 3 "loss on the merits could create adverse precedent binding on future litigants": Prop 218 challenges, CCP 526a taxpayer actions, "federal consent decree motions", constitutional claims
- [DESIGN] CP §Risk L318-324 — risk classification in package metadata: "if a court later considers whether a prior poorly litigated case should preclude a subsequent, well-constructed case, the published risk classification is evidence that the prior filing was undertaken contrary to the evidence source's recommendation" (preclusion doctrine anticipated)
- [EXAMPLE] CP §Risk L297-299 — "grand jury complaints" (civil grand jury as quasi-judicial body) in Tier 1
- none in A&T

## From C7 (C7: BIO_State_Rules_Consistency_v1_5.txt, BIO_Membership_Architecture_v2.txt)

- [DESIGN] SR §4.4, src 900–902 — `action_kind` includes `grand_jury` (a referral to a civil grand jury) and `litigation_support`; courts appear only as an action kind.
- [DESIGN] SR §4.1, src 691 — a "docket" is an admissible `source.locator`; §4.4 src 925 — a clock's basis may be an "order".
- [DESIGN] SR amendment Action layer, src 1806 — `grand_jury`, `controller_referral`, `litigation_support` are now state-specific kinds read only as written; the product's own kinds are records_request, request_for_comment, other; resolutions include `escalated`; `ESC-` (escalation) is a layer-9 record type (K171). Courts and quasi-judicial bodies have no record type of their own in this document.
- [RULING] SR amendment `published` (DEC-72), src 1703–1708 — "a case is a production of a project: its own object, a set of finding-versions plus the publishing project" (the group's CASE is a publication, not a court case; naming hazard for COURTS).
- [DESIGN] MA §3, src 222–223 — the group itself may be the subject of legal process (the cover-to-handle table is subpoenable infrastructure). No court cases, dockets or proceedings otherwise in MA lines 201–700.
- [GAP] SR and MA whole (reader's observation) — neither document has a record type, field or relation for a court case, docket, party, filing, order, judgment, hearing or audit; courts enter only as an action kind, a locator string or a clock `basis` ("order").

## From C8 (C8: MEMBER-KNOWLEDGE-DESIGN.txt, EXTRACTION-BREADTH-DESIGN.txt, DOCUMENT-PROFILES.txt, OFFICE-FORMATS.txt, CONTENT-SEARCH-DESIGN.txt, SCHEDULER.txt)

- none in MKD. The nearest point is DEC-102 (L119): testimony credited at group or project level must be corroborated "to journalistic and legal standards before a finding may rest on it". Mapping identity levels to grades, and what counts as corroboration, are "BOB's to draft for Bob's approval".
- none in EBD.
- none in DP.
- none in OF, beyond D-124's "statutory redactions in a records-request response" (L16), listed under LAW.
- none in CSD.
- none in SCH.

## From C9 (C9: src/action-design/{ACTION-PLAN,INVENTORY,MATRIX,sources_build-state,sources_canon-constructs,sources_canon-mission,sources_code}.md.txt; src/NOTIFICATIONS.txt)

- [EXAMPLE] ACTION-PLAN worked example, line 67 — legal options: "an election contest or court petition (legal, subject 1 ...)"; "a referral to the county grand jury (legal, Tier 1, both)".
- [DESIGN] ACTION-PLAN A12, line 48 — "A legal option on a noncompliant subject is attached to that determination's escalation as today; the plan never opens, advances or ends an escalation."
- [DESIGN] ACTION-PLAN A13, line 49 — the plan reads for each subject "its escalation's stage, so the member sees where each track stands".
- [DESIGN] ACTION-PLAN worked example, line 65 — each determination's escalation has "its own venue and deadlines".
- [DESIGN] ACTION-PLAN ruling 9, line 15 — categories include "legal".
- [DESIGN] INVENTORY §3 Kinds of action named, line 29 — court-adjacent actions: grand jury complaints, records court petitions (Tier 2), Prop 218 challenges, taxpayer actions, consent-decree motions, constitutional claims (Tier 3), litigation support.
- [BUILT] INVENTORY §4 standards row, line 49 — standards include kind "court" (a court order/ruling as a standard).
- [BUILT] INVENTORY §4 filings row, line 53 — "Tier 1–2 drafts filled from the profile's template ... Tier 3: the counsel packet." Gap: "The real profile has no templates, so every Tier 1–2 draft is refused there."
- [DESIGN] INVENTORY §3 Risk tiers, line 33 — Tier 3 "do not file without counsel (a counsel packet is prepared for counsel the group names; it is never published and never fileable)".
- [BUILT] INVENTORY §4 escalation row, line 54 — seven stages from a live noncompliant determination; member advances or declines; ends only when compliance restored and consequences addressed. 29 pass.
- [CONFLICT] INVENTORY §5 items 2-3, lines 66-67 — mechanical vs human escalation (Requirement 7 vs Roadmap; requirements chose proposal + member's act, K102); seven stages vs six.
- [CONFLICT] INVENTORY §5 item 7, line 71 — three outcome vocabularies: action resolution (complied, denied, escalated, withdrawn), correspondence outcome (granted, denied, partial, reversed, affirmed, none stated), escalation evaluation (complied, partial, denied, none).
- [GAP] INVENTORY §6 item 10, line 95 — "may a Tier 2 or 3 action, or a counsel packet, rest on Grade B evidence?"
- [BUILT] MATRIX §2 Legal T1-2 row, line 23 — "(complaint, referral, court petition)": drafts fill profile template, each blank naming its source (`filings` R1–R5); "the real profile has no templates, so every draft is refused there"; "the stricter tier governs (`filings` R6)"; filed by venue's own means and recorded (`filings` R7); "the draft carries no in-band stamp (**Gap**, Publication §3 rule 9)".
- [BUILT] MATRIX §2 Legal T3 row, line 24 — "the counsel packet and candidate theories (`filings` R8–R12, R14); needs a determination"; member names counsel and exports (R11); never published; Track "counsel files; only a member's recorded correspondence brings it back".
- [GAP] MATRIX §1 item 5, line 13 — filing drafts and counsel-packet exports leave without the in-band stamp though `publication` provides it (`inbandQuartet`, its R16).
- [DESIGN] MATRIX §7 Legal T1-2 row, line 91 — "grades beside the venue's standard (`actions` R48, `jurisdictions` R39)"; T3 line 92 "override disclosure (`filings` R24)"; "Resolved: counsel files; a member records what returns".
- [DESIGN] MATRIX §7, line 108 — "Opposition: pressure against the group" Drafted (`actions` R47); "a legal threat prompts a litigation-hold reminder (§4, DEC-61)".
- [DESIGN] MATRIX §3 lawyers row, line 40 — a project's bar "beyond a reasonable doubt".
- [BUILT] build-state §1.1, lines 35, 49 — standard kind `court` ("court decision or order") — a court's order/decision can be held as a standard an act is measured against.
- [BUILT] build-state §1.5 filings Purpose, lines 203-207 — Tier 1/2 filing pre-filled from profile template, every blank names its source, Tier 2 carries profile's advisory note; Tier 3 counsel packet: "facts with citations, a chronology, exhibits with provenance, the standards' text, candidate theories and remedies, and the claim deadlines. It is marked for counsel's review, is never published and is never fileable." "Counsel drafts and files." "The instance transmits nothing (fil.md Purpose; R7; K13, K102)."
- [BUILT] build-state §1.4 actions, lines 166, 172 — `risk_tier` ∈ {1, 2, 3, undetermined}; `resolution` ∈ {complied, denied, escalated, withdrawn} (R7).
- [BUILT] build-state §1.4, line 170 — correspondence direction ∈ sent, received, no_response; "capture **xor** a member's account".
- [BUILT] build-state §2(b), line 325 — "**Venue means:** portal, mail, email, in_person, court (jur R25)."
- [BUILT] build-state §1.5 Record, lines 221-228 — `FIL-` draft → approval (SHA-256) → one sending; `CPK-` packet versioned with exports; theory proposals; filled blank `{name, value, source}` or `[UNFILLED: name]` (R3); packet marking "Prepared for review by … Not legal advice. Not for filing." "It has no caption, venue, signature or prayer (R10)."
- [BUILT] build-state §1.5 Services, lines 213-217 — `counselPacket` (R8–R10, R12), `counselPacketRead`, `counselPacketExport` (R11), `filingsFor` (R13), `theoryPropose` (R14), evidence-package available-actions block (R15; pub R36), `availableActions({determination})` (R21).
- [GAP] build-state §1.5, lines 230, 233 — not yet met: R3's producing-group blank (N331), in T14.
- [RULING] build-state §1.5, lines 237-242 — K13 (Bob; amends DR 8); K102 stricter tier, no transmission, advisory is profile data; K316/K319 packet reads need sight of every drawn-on determination's project.
- [BUILT] build-state §2(b) Risk tiers, lines 314-318 — Tier 1 template no advisory; Tier 2 template plus advisory; "Tier 3: no template ever; counsel packet only (fil R2, R4, R17; jur R25, R28 `TEMPLATE_TIER3`)".
- [BUILT] build-state §2(b) escalation stages table, lines 332-343 — seven stages and edges (1→2, 2→3, 3→4, 4→5, 4→7, 5→6, 5→7, 6→4, 7→4); stage 5 legal_tools: "breach actions attached with filings or counsel packets; available kinds by tier via `availableActions` (R8)".
- [BUILT] build-state §1.6, lines 264-267 — `ESC-` states/edges; evaluation reading ∈ {complied, partial, denied, none} (R10); one open/suspended escalation per determination (R1); action attaches to one escalation at one stage (R9).
- [RULING] build-state §1.6, line 273 — K14 (Bob, stage 7; amends DR 7); K172 (Bob).
- [BUILT] build-state §2(a), line 293 — first profile kinds include `grand_jury`, `controller_referral`, `litigation_support`, Tier 2 `records_petition`, Tier 3 kinds (`jurisdictions/profiles/oakland-alameda.mjs` 208–229).
- [GAP] build-state — no record of a court case, docket, parties, filings by others, orders or judgments as objects to read/track; courts appear only as a standard kind (`court`), a venue means (`court`), a deadline basis (`applies_to: claim`) and outbound filings/counsel packets.
- [DESIGN] canon-constructs §4.2, line 91 — records-request lifecycle includes `sent` "appeal | court filing" and `received` "appeal/court decision"; outcome vocabulary "granted · denied · partial · reversed · affirmed · none stated" (court-like outcomes on our own records request).
- [DESIGN] canon-constructs §3, line 62 — CM: "A case is made TO someone FOR something: reporting to the public, a claim to a court, a fix asked of a body. That is where `action` connects: the ask is an action".
- [DESIGN] canon-constructs §4.2, line 88 — CM D-182 risk tier: "1, file freely; 2, file with caution; 3, do not file without counsel"; "once a member has set a tier, no machine credential may change it, not even back to `undetermined`"; revision `op=actionrisktier` append-only with required reason (BOB #33, REC-214).
- [EXAMPLE] canon-constructs §1.2, line 20 — oversight bodies "auditors, controllers, grand juries" as audiences.
- [EXAMPLE] canon-constructs §4.6, line 122 — Tier 2 "CPRA court petitions"; Tier 3 "Proposition 218 challenges, CCP Section 526a taxpayer actions, federal consent decree motions" (Comms Platforms, reference, California-specific).
- [DESIGN] canon-constructs §4.7, lines 125-129 — outcomes: SR resolution complied/denied/escalated/withdrawn; D-147 correspondence granted/denied/partial/reversed/affirmed/none stated; DEC-14 own outcome vs impact claim: "*promoting an outcome to an impact claim requires a basis leg pointing at evidence that is not our own action*"; DEC-25 "an action's OUTCOME can become evidence"; CM journey "consequence → back in as evidence".
- [CONFLICT] canon-constructs §5 item 4, line 159 — three outcome vocabularies; ""partial" has no action resolution, and how `resolved: escalated` relates to the escalation construct is unstated."
- [CONFLICT] canon-constructs §5 item 8, line 163 — plan vs escalation: UXE OQ-9 option 3 folding plan into escalation "conflicts with Case Making §2, since an escalation is one pursued breach, not a set of options."
- [OPEN] canon-constructs §6, line 187 — OQ-22: no catalogue of what grade "a court" expects.
- [GAP] canon-constructs §6, line 190 — UC-129 (document pressure against supporters: no).
- [EXAMPLE] canon-mission §2, line 60 — founding example: "three parallel enforcement actions threatened at once (CPRA petition, grand jury complaint, State Controller referral)"; "legal-pathways report is an "analysis of three parallel legal mechanisms"".
- [EXAMPLE] canon-mission §2, line 61 — "Individual lawsuits, audit findings, grand jury reports, and media investigations have all failed to produce sustained change" (courts, audits, grand juries as mechanisms).
- [RULING] canon-mission §1a, line 22 — DEC-17 Bob: "a lawyer's project may require 'beyond a reasonable doubt' where a reporter's requires 'convincing' — and a lawyer building on a reporter's published case sees the standard it was held to … and may need to BOLSTER it."
- [DESIGN] canon-mission §1a, line 20 — CM §3: "A journalist can publish 'records suggest'; a lawyer needs 'the record establishes'; an administrator may act on 'worth checking.'"
- [RULING] canon-mission §1a, line 26 — DEC-72 (1): "the same finding may clear a journalist project's bar and fall short of a lawyer project's, and both facts stand."
- [DESIGN] canon-mission §4c, lines 138-139 — Req 8 Tier 3 "Do Not File Without Competent Legal Counsel ... ("adverse precedent binding on future litigants"; theory and facts published; **templates NOT included**; contact information for legal organisations)"; 2026-09-26 amendment counsel packet: "the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim"; "never published, and never in a form that can be filed as it stands. Counsel drafts and files."
- [DESIGN] canon-mission §4c, line 140 — Roadmap §8 rationale: "a poorly filed Tier 3 case could create adverse precedent" (precedent as a risk).
- [EXAMPLE] canon-mission §4e, line 157 — "courts (Alameda County Superior Court, Roadmap §1)" as a venue.
- [DESIGN] canon-mission §4g, line 176 — FuncArch Function 3: "For Tier 3 actions, the skill identifies the legal theory and directs the group to appropriate legal counsel."
- [CONFLICT] canon-mission §5 item 10, line 198 — DEC-81: co-attested Grade B enough to publish, "Grade A stays the ceiling for adversarial or legal use" and Grade A is deferred; canon silent whether Tier 2/3 or counsel packet may rest on Grade B.
- [CONFLICT] canon-mission §5 items 2, 6, lines 190, 194 — Req 7 mechanical vs human; seven vs six stages.
- [GAP] canon-mission §6 item 11, 16, lines 215, 220 — standing, exhaustion and filing-window checks; evidence-grade requirements per action tier.
- [RULING] canon-mission §4d, line 151 — DEC-61 litigation hold.
- [BUILT] code §1.4, line 125 — "`CORRESPONDENCE_STAGES`: sent = request, fee_waiver_request, appeal, court_filing; received = acknowledgement, fee_estimate, fee_waiver_decision, extension_notice, production, denial, appeal_decision, court_decision (:4118)."; `CORRESPONDENCE_OUTCOMES` (:4123).
- [BUILT] code §1.4, line 121 — `RISK_TIERS`: 1 "file freely", 2 "file with caution", 3 "do not file without counsel", undetermined.
- [BUILT] code §1.4, line 122 — `RESOLUTIONS` = complied, denied, escalated, withdrawn.
- [BUILT] code §1.5, lines 133-147 — filings 1,381 lines source; `governingTier` :280 ("undetermined is never read as 1"); `filingPrepare` :359 (refusals `FILING_TIER_UNDETERMINED`, `TIER3_COUNSEL_PACKET`, `KIND_NO_TEMPLATE`; blanks name source or `[UNFILLED: x]`; Tier 2 advisory); `filingApprove` :459 (`FILING_STALE`, `STILL_UNFILLED`); `counselPacket` :745/`counselPacketRead` :811/`counselPacketExport` :840, marked "Prepared for review by … Not legal advice. Not for filing." (:86); `filingsFor`; `theoryPropose` :910 "a candidate theory and remedy; a proposal only"; `availableActions` :1002; `evidenceBlock` :1018.
- [BUILT] code §0, line 20 — wire-level chain test `test/gate-reads.test.mjs:944-1110` (standarddeclare → determine → comparisonpropose → consequencerecord → escalationopen → action promote → counselpacket); "It had to plant the ratified case edition directly into tables (`/t9plant`, :963-973)."
- [BUILT] code §1.6, lines 158-179 — escalation 1,421 lines source; `escalationOpen` :537 (`NOT_NONCOMPLIANT`), `escalationAttach` :595 (stages 2, 5, 7; `NOT_A_BREACH_ACTION`), `escalationEvaluate` :662, `escalationAdvance` :737/`escalationDecline` :758, `escalationEnd` :777; `STAGES` 1–7, `STAGE_TABLE`, `READINGS` complied/partial/denied/none, `JUDGMENT_KEYS` refused; ten ops routed in `store.mjs:3046-3068`.
- [BUILT] code §1.5, line 153 — filings ops: `filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketread`, `counselpacketexport`, `filingsfor`, `theorypropose`, `availableactions`.
- [BUILT] code §1.5, line 155 — "`filingPrepare` does **not** need a determination... So it works for any action with a template."
- [GAP] code §1.5, line 156 — test profile templates use `{{records}}` and `{{bylaw}}`, not in `FILING_BLANKS`, "so they always stay unfilled".
- [BUILT] code §7, line 256 — Oakland `records_petition` tier 2 "with a court venue and an advisory".
- [GAP] code §8, line 270 — prepare filing: "**Oakland has no templates**, so `KIND_NO_TEMPLATE`. Tier 3 packets work."
- [GAP] code §8, line 273 — breach action via promote "probably fixed, but it is unverified" (`gate-reads.test.mjs:998-1000` "reported, not pinned").
- [GAP] code §9, line 297 — stages 6 and 7 "generate no outputs".
- none in NOTIFICATIONS.txt (no court, docket, filing, judgment or quasi-judicial proceeding anywhere in its 441 lines; `op=audit` at line 275 is the record's own integrity audit, not an external audit).

## From D1 (D1: design-journeys.txt, design-ux-audiences.txt, design-ux-useCases.txt, design-ux-journeyExperience.txt)

*design-journeys.txt*
- [EXAMPLE] §3 court case, L106 — "Reading about a lawsuit the city is a party to." / "Capture the filings, name the parties and offices involved, and watch the court's docket page for new filings."
- [EXAMPLE] §3 regulatory proceeding, L111 — administrative proceeding: "A utility's rate case before a state commission." / "Capture the filings and follow the proceeding's docket."
- [NEED] audiences L57 — grand jury, controller, auditor as referral recipients (Design Requirement 8).
- [NEED] audiences L42 — group's lawyer receives counsel packet for a serious matter.
- [NEED] journey 13 steps 5, 8, L362, L365 — "a filing", "legal tools", "a counsel packet".
- [EXAMPLE] §3, L122 — lawyers start from filings.
- [EXAMPLE] §3 budget/audit, L108 and police overtime L99 — audits as sources ("any overtime policy or audit").
- [GAP] §6 row "Following a court case", L531 — needed by "court case" and "regulatory proceeding" rows; exists: "A court filing can be captured and a docket page watched for changes. Nothing tracks a case's filings, rulings and appeals, or links a decision to the rule it interprets." → waiting.
*design-ux-audiences.txt*
- [DESIGN] audiences "Named counsel", L1386–1398 — "Counsel the group names for a Tier 3 matter." (Design Requirement 8 as amended 2026-09-26; filings R8); packet contents incl. "candidate legal theories and remedies"; L1434 "A poorly filed Tier 3 case can create adverse precedent." (Roadmap §8)
- [DESIGN] audiences "Oversight body (grand jury, controller, auditor)", L1317–1327 — referral recipients; stage 7 escalation.
- [DESIGN] audiences "Named counsel" L1401 — "the venue's standard where the profile states it" (court/venue evidentiary standard as profile data).
- [GAP] whole file — none of the 20 audiences is a court, judge, hearing officer, opposing party or litigant; courts appear only as venues behind counsel and oversight bodies.
*design-ux-useCases.txt*
- [EXAMPLE] UC-002, L28 — "legal databases" among outside sources (would include case law); covered partial, no standalone FIND.
- [EXAMPLE] UC-115 "Assemble a counsel packet for Tier 3", L2629–2651 — "Prepare the six-section packet for counsel the group names; never fileable, never published."; trigger "A Tier 3 theory is available."; covered yes (filings R8-R13, R17, R22, R24, R25); "no member surface yet".
- [EXAMPLE] UC-116 — legal theories and remedies (stage 5 = legal tools).
- [EXAMPLE] UC-114 — filings at Tier 1–2 carry "the venue's standard" (filings R25).
- [EXAMPLE] UC-123 — oversight/audit requests and testimony (quasi-judicial/oversight venues).
- [GAP] UC-129, L2979 — legal threats recorded as pressure; "The litigation-hold reminder for a legal threat is deferred until Bob designs the hold's act (N-A19; DEC-61)."
- [GAP] UC-148 — "legal-tool guides" in the starter kit, uncovered/deferred.
- [EXAMPLE] UC-169 — audience "named counsel"; "Prepare for a challenge to evidence without being refused for it." (the venue's evidentiary standard comes from the jurisdiction profile, jurisdictions R39).
- [GAP] whole file — none of the 172 use cases follows a court case or administrative proceeding (docket, parties, filings by others, orders, rulings, appeals, settlements, consent decrees), or uses precedent or an AG opinion. Courts appear only as the destination of the group's own action (Tier 1–3 filings, the counsel packet, stage 7 oversight).
*design-ux-journeyExperience.txt*
- [DESIGN] (c) spans L452 — "outside offices and counsel".
- [DESIGN] (c) breach action, L546 — feelingRisk "Legally unsophisticated filing creating adverse precedent (Tier 3)."
- [DESIGN] (c) step "Assemble a counsel packet (Tier 3)", L625–638 — "Six sections from the record."; decision "Name counsel."; "MACHINE_CANNOT_NAME_COUNSEL." / "basis_changed when a finding moves."; feelingRisk "A packet read as legal advice or as fileable."; src filings R8-R13, R17.
- [DESIGN] (c) advance, L610–621 — "Advance to legal tools or political accountability"; handoff "counsel or officials".
- [DESIGN] (k) L1217, L1261 — "venues and legal organisations" from the profile shown beside legal options, "labelled as facts".
- [DESIGN] (k) L1336 — legal options go through "the filing or counsel-packet surface".
- [GAP] whole file — no experience journey follows a court case or regulatory proceeding; journeys (c) and (k) end at counsel or a filing "sent by the venue's own means".

## From D2 (D2: design-ux-surfaceRules.txt, design-principles.txt, design-brand.txt, design-measures.txt, design-HANDOFF.txt, design-view-matter-page.txt, design-view-plan-page.txt, design-view-start-and-send.txt, design-view-surfaces.txt)

- [EXAMPLE] BR §3 "Calm", L54 — "This reply is marked as a legal threat. Record whether a litigation hold is in place."; BR §4 L80 "Pressure recorded. It's part of the record and can be cited."
- [EXAMPLE] MS, L104 — administrative appeal of a records denial not taken ("chose not to appeal").
- [BUILT] HO §4 U41 "Courts", L71 (second-hand) — ""court" is a standard and source kind; counsel packet only (filings)".
- [GAP] HO §4 U41 "Courts", L71 — "the product's "docket" is post-publication responses, not court dockets; no case tracking, no precedent or "interprets" link."
- [EXAMPLE] HO §2, L18 — Bob's domain is regulatory proceedings: "He knows regulatory proceedings (the CPUC especially), evidence and public records" (quasi-judicial proceedings are his reference point).
- [DESIGN] PR §3 L66 and BR §1 L28 "docket entries" refer to the group's publication docket (post-publication), not court dockets (consistent with HO L71).
- [DESIGN] VM legal tools, L56 — tiers from the profile, "as facts": "Tier 1 complaint to the civil grand jury; Tier 3 court petition (counsel packet for named counsel; legal organisations listed). Nothing here is a recommendation."
- [DESIGN] VP checks, L15 — plan check on a court petition's filing window: "the court petition's filing window ends 20 Nov, before its phase can start (week 12)."
- [DESIGN] VS, L11–L19, L58 — grand jury complaint (tier 1) addressed to "Civil Grand Jury (an office, marked oversight)"; exhibits graded against the venue's evidentiary standard from the profile: "The venue's standard: accepts B co-attested (profile). Nothing is contestable at this venue."
- [DESIGN] VS, L60–L62 — the instance never files: "Approving fixes the bytes and adds the stamp. The instance sends nothing."; "I have sent it · record the sending … By the venue's own means: its web form, mail, or in person."
- [DESIGN] VF Tier 2 filing draft, L26–L43 — "tier 2 · file with caution"; governing tier = stricter of kind's (profile) and action's (member); petitioner/respondent derived with sources; "[UNFILLED: records] the template names a blank the record cannot fill; a member writes it before approval"; venue standard "B without co-attestation is contestable (profile)"; "Approval is refused while any blank reads UNFILLED, or if the draft went stale."
- [DESIGN] VF, L31 — procedural advice from profile: "a petition dismissed on procedure is usually dismissed without prejudice; check the filing window and the court's format rules before filing."
- [DESIGN] VF counsel packet Tier 3, L45–L52 — "do not file without counsel"; "Not legal advice. Not for filing."; sections listed incl. chronology and claim deadlines; "No caption, court heading, signature block or prayer. Never published; exported only by a member, each export carrying the in-band stamp."
- [DESIGN] VF queue, L69 — "Consider a litigation hold … for an administrator · deciding nothing by itself".
- [DESIGN] SR "Standards…" mustShow, L1620–L1622 (actions R25, R35) — "Each action's tier (1, 2, 3 or undetermined)".
- [DOCTRINE] SR "Standards…" mustNever, L1721–L1724 (filings R2, D-182) — "Never default a tier to 1."
- [DESIGN] SR "Standards…" mustShow, L1699–L1702 (matter-page design view; filings R21) — "available actions at legal tools from the profile, as facts: 'Nothing here is a recommendation.'"
- [DESIGN] SR "Filing and counsel packet" purpose, L1883–L1886 (filings Purpose; Design Requirement 8 as amended) — "What the group sends, prepared from the record: Tier 1-2 filings, and for Tier 3 a packet for named counsel."
- [DESIGN] SR "Filing…" mustShow, L1890–L1908 (filings R3, R4, R10, R5) — "[UNFILLED: name] markers and the list of what the record could not fill, with why."; "Tier 2 advisory note first."; "The counsel marking on every section and export."; "Who prepared the draft and whether it is machine work."
- [DOCTRINE] SR "Filing…" mustNever, L1917–L1930 (filings R17, R11, R18) — "Never a template, pre-filled filing or fileable document for Tier 3."; "Never publish a packet."; "Never invent or default a value."
- [DESIGN] SR "Filing…" conflict, L1967–L1970 (filings R7) — "ALREADY_SENT; NOT_APPROVED."
- [DESIGN] SR "Filing…" primaryActs, L1974–L1979 (filings R6–R8) — "approve: terminal; record sent and counsel packet: reasoned (DEC-88; the code still lists them as undetermined); approving carries the full dialog".
- [GAP] none of the "Standards…" or "Filing…" rules provide for tracking a court case after filing (docket, orders, judgments, appeals); the surface ends at "record sent" (observation from L1584–L2000; consistent with HO L71).
- [DESIGN] SR "Published case" mustShow, L2615–L2618 (Design Requirement 8) — "Evidence package risk classification." (the tier/risk class of what is exported toward a venue).
- [DESIGN] SR "Action plan" mustShow, L3044–L3047 (PATH.md §2 step 5; filings R21; Bob's ruling 2) — "Legal options show the profile's venues and legal organisations beside them, labelled as facts, never recommendations."
- [DESIGN] SR "Action plan" mustShow, L3049–L3052 (action-plans R9; PATH.md §3) — "A legal option's tier written out; 'undetermined' when unstated."
- [DESIGN] SR "Start and send" mustShow, L3357–L3360 (filings R25; jurisdictions R39) — "Each exhibit's grade and whether co-attested; the venue's standard beside them where the profile states it, flagging a contestable grade; 'undetermined' where it states none."
- [DESIGN] SR "Start and send" mustShow, L3362–L3370 (filings R22, R7; Action §4 rule 7) — "On approval, the in-band stamp line."; "That the instance sends nothing: the member sends by the venue's own means and records the sending."
- [DOCTRINE] SR "Start and send" mustNever, L3374–L3387 (filings R7, R23; DEC-31; actions R49; filings R25; K597 (3); filings R24) — "Never send by a system path."; "Never refuse for evidence grade."; "Never let a member's override disappear from what is prepared."
- [DESIGN] SR "Start and send" primaryActs, L3450–L3463 — "filingapprove": terminal (DEC-88); "filingsent": reasoned (DEC-88).
- none in design-principles.txt (its "docket" L66 is the publication docket).
- (SR coverage) SR has no court or proceeding items before the "Standards…" surface (L1–L1583) or on Monitoring, Setup, Members, Assistant, Doorbell, Search (L2003–L2574, L2744–L3003); its items are on Standards…, Filing and counsel packet, Published case, Action plan and Start and send.

## From M1 (M1: src/req/local-facts.txt, standards.txt, conformance.txt, consequences.txt, action-grammar.txt, actions.txt, action-clocks.txt, filing-templates.txt, filings.txt, escalation.txt, action-plans.txt (layer 9, Action))

- [DESIGN] standards kinds (standards.txt:15, :22) — `court` ("court decision or order") is one of the six standard kinds, and R6 lets "a later decision" supersede it.
- [GAP] standards kinds; R6 — there is no structure for precedent or interpretation; a decision is held only as a standard's text.
- [DESIGN] filings Purpose (filings.txt:14) — a packet marked for counsel's review — "a **counsel packet** … the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim" — "never published, never in a form that can be filed as it stands. At Tier 3 counsel drafts and files."
- [DESIGN] filings R9 (filings.txt:38–39) — the packet's six sections:
  - facts;
  - chronology;
  - exhibits: SHA-256, locator, capture time and attestations (`attestation.attestationsOf`);
  - standards: citation, kind, issuer, text, and whether each was in force at the act's date;
  - candidate theories and remedies, "never stated as a conclusion";
  - deadlines: the profile's `claim` deadlines.
- [DESIGN] filings R10 (filings.txt:40) — the marking reads "Prepared for review by <counsel's name, organisation>. Not legal advice. Not for filing." — the packet carries "no caption, court or venue heading, signature block, prayer or form of relief".
- [DESIGN] filings R11–R12 (filings.txt:41–42) — a packet is never published. Only a member exports it (MACHINE_CANNOT_EXPORT). New versions are flagged basis_changed (K316).
- [DESIGN] filings R14 (filings.txt:48) — theoryPropose names a candidate theory and remedy against named standards, labelled — "included in the next packet version (R9) as a candidate, never as the group's position"
- [DESIGN] filings R15 (filings.txt:51) — for Tier 3 kinds, the evidence package lists the standards, the factual basis, "the sentence that such an action requires competent counsel", and the profile's legal organisations (jurisdictions R32).
- [DESIGN] filings R25 (filings.txt:61) — nothing is refused for its capture grade. Each exhibit shows its grade and co-attestation beside the venue's evidence standard (jurisdictions R39 `evidence`, `accepts`, `contestable`; K597(3), K600(b)).
- [DESIGN] actions R49 (actions.txt:91) — "the venue sets the standard".
- [DESIGN] filing-templates R1, R10; Satisfies (filing-templates.txt:20, :46, :93) — a `brief` template serves Tier 3 for counsel — "a counsel briefing is never fileable as it stands" (Action §4 rule 7)
- [DESIGN] actions R48 (actions.txt:89) — pressure marks on received correspondence, `{kind: legal | retaliation | discrediting | other, note}` (K597(1); OP 8; Design Req 13) — "It is evidence like any capture and may be cited by an inquiry. A `legal` mark may carry a litigation hold (R52)."
- [DESIGN] actions R52, R56–R60 (actions.txt:94–113) — a litigation hold covers projects (DEC-61, DEC-108, DEC-113; K899(7), K1252). It has a release, a preview, `projectHolds`, `holdsReleased` and `purgeHeld` (control-plane R46); R55 is the capture-side reader (capture R32) — "no material of a project it covers, and not the action that carries it, is purged from the real record"
- [GAP] actions Status (actions.txt:7) — "The device half (the transcript store's check for a hold) waits for a device-storage module (K1251)". T32 lists it as N521, a dependency not yet built.
- [DESIGN] escalation R8 (escalation.txt:32) — stage 5 (legal tools) attaches breach actions with their filings or counsel packets, by tier, through `filings.availableActions`.
- [DESIGN] escalation R12 (escalation.txt:36) — `testimony`, `audit_request` and `oversight_request` are stage-7 purposes. Administrative and quasi-judicial channels appear only as purposes.
- [DESIGN] action-plans categories (action-plans.txt:18); Uses (action-plans.txt:100) — `legal` options carry a tier, and `filings.availableActions` is shown beside them, "never a catalogue, Bob's ruling 2 of 2026-09-29".
- [GAP] (all 11 modules) — there are no court cases as such, the group's own or others': no case, docket, parties, court filings, orders, judgments, appeals, settlements or consent decrees.
  - The group's litigation belongs to counsel, outside the system.
  - In the record it appears only as a `legal` pressure mark with a hold, plus the profile's `claim` deadlines in a packet.
  - Venues are profile data (`venue.name`, `venue.how`; filings R3).
- [GAP] (verified) — counselpacket, theorypropose, actionpressure, actionhold and every other court-adjacent op has 0 UI calls.

## From M2 (M2: src/req/jurisdictions.txt, id-spaces.txt, docprofile.txt, office-readers.txt, odf-reader.txt (layer 1); extraction.txt, content.txt (layer 4); entities.txt, connections.txt, progressions.txt, bias.txt (layer 5))

### from jurisdictions.txt
- [DESIGN] jurisdictions R23, l.33 — `court` is a `standard_sources` kind (court decisions as standards a government act is measured against)
- [DESIGN] jurisdictions R25, l.35 — a venue's `how` may be `court`; Tier 3 kinds (court actions) have no `use: file` template
- [DESIGN] jurisdictions R26, l.37 — `applies_to: claim` — "for a period that binds a legal claim" (limitation windows as profile data)
- [DESIGN] jurisdictions R39, l.41 — per-kind venue evidence standard (rule of evidence), grades it admits, grades the opposition may contest
- [EXAMPLE] jurisdictions R36, l.91 — Tier 3 kinds `assessment_challenge`, `taxpayer_action`, `constitutional_claim`, evaluated by named legal organisations
- [GAP] (observation) — no docket, party, filing or judgment vocabulary in the profile; courts appear only as standard source kind, venue and limitation period
- none in id-spaces.txt
- none in docprofile.txt (no court-document content type is registered: l.240–241 list meeting_minutes, meeting_agenda, regulation, staff_report, staff_directory, meeting_calendar)
- none in office-readers.txt
- none in odf-reader.txt
- none in extraction.txt
- none in content.txt ("cases" at l.61 are the group's published cases, not court cases)
- none in entities.txt (no court, case, party or docket kind among the ten closed kinds; a court could only be registered as an `institution` or `body`)
- none in connections.txt
- none in progressions.txt (a court proceeding's stages could be a declared flow, but nothing in the file says so)
- none in bias.txt
### from the repository check (Modules)
- [BUILT] oakland-alameda.mjs:231–244 — `records_petition` "court petition to enforce a public records request", Tier 2, venue "Alameda County Superior Court" (`how: court`), civil clerk's hours (M-193), advisory text; Tier 3 kinds include `consent_decree_motion` ("motion under a federal consent decree"), `taxpayer_action` ("Code of Civil Procedure § 526a"), `assessment_challenge`, `constitutional_claim`; no `claim` limitation deadline held
- [GAP] (observation across all eleven modules) none models a court case, docket, party, filing, order or judgment; courts appear only as a profile venue, a standard-source kind and Tier 2/3 action kinds; a court order would enter only as a captured document (content extents, entity kind `institution`/`body`)

## From M3 (M3: src/req/inquiry-grammar.txt, inquiry.txt, citation.txt, strength.txt, basis-versions.txt, run-rules.txt, ai-runs.txt, run-productions.txt, skills.txt, agent-worker.txt, capture-requests.txt)

- [DESIGN] skills R30 l.77 — filing_drafting layer: the run proposes or critiques a filing template's wording (`templatepropose`); member-only `templatedraft`, `templaterevise`, `templatesubmit`, `templatereview`, `templateapprove`; "rule 7 (nothing leaves by a system path; a counsel packet is never fileable as it stands)"; rule 13 the venue sets the standard of evidence
- [DESIGN] agent-worker R51 l.56 — plan mode reads venues (profile) and `filings.availableActions` (not deployed)
- [GAP] (inferred) no agent-worker table calls `templatepropose`, so the filing_drafting layer instructs a write no AI path performs
- none in inquiry-grammar, inquiry, citation, strength, basis-versions, run-rules, ai-runs, run-productions, capture-requests. "Published case", "inherited" and "imported finding" are the group's own or another group's published cases, not court cases. Courts, dockets of proceedings and judgments have no representation in layer 6

## From M4 (M4: src/req/retrieval.txt, query-language.txt, observation-log.txt (layer 5); intent.txt, reevaluation.txt (layer 7); monitoring.txt, scheduler.txt (layer 10); acquisition.txt, sources.txt (layer 3))

- none in retrieval.txt, query-language.txt, observation-log.txt, intent.txt or scheduler.txt.
- [DESIGN] reevaluation R30, reevaluation.txt:81–88 — the publication docket (layer 8, the group's own case docket, DEC-116), not a court — "`contested`: each member finding of an edition a contesting record entry names carries it, `since` the filing instant".
- [DESIGN] reevaluation R33, reevaluation.txt:102 — "Only a verified `edition` or `withdrawal` entry on the publisher's docket is a move" (K1339, K1366 F1).
- [DESIGN] monitoring R67, monitoring.txt:105–116 — the "docket watch" reads another group's published-case docket daily — "a docket entry is never evidence (DEC-116 item 1)". This is not a court docket.
- [DESIGN] sources R2, sources.txt:22 — `how` includes `filing` (a detail made known through a filing) and `hostile`.
- [GAP] (inferred) — none of the nine modules models a court case, a court docket, parties, filings, orders or deadlines a court sets. The time-stamped "move" stream of R33 and R67 (seq, date, kind, verified) is the nearest shape.
- none in acquisition.txt (court documents are captured like any public document).

## From M5 (M5: src/req/affordances.txt, op-declarations.txt, wizard-scripts.txt, tasks.txt, queue.txt, control-plane.txt, publication.txt, corpus-export.txt)

- [DESIGN] publication Terms l23 — "A **case** is a production of one project over one or more findings (inquiries)": a "case" in this codebase is the group's own publication, never a court case.
- [DESIGN] affordances R34 l61–66 / control-plane R48 — the `docket` ops are "case-directed: keyed by a published case … never evidence": the group's own published-case docket (DEC-116), not a court docket.
- [DESIGN] affordances R35 l67–71 — case-import = another group's published case.
- [BUILT] affordances VOCABULARIES (code) — `correspondence_stages` sent includes `appeal`, `court_filing`; received includes `appeal_decision`, `court_decision`: courts appear only as stages of an action's correspondence.
- [DESIGN] queue R1 l23–24, R12 l44 — litigation-hold To-do: "a reply the group marked as legal pressure: consider whether to place a litigation hold" (actions R52, DEC-61); litigation-hold-released FINDING (DEC-113).
- [DESIGN] affordances R33 l57–60 — actionholdrelease `terminal` (DEC-113, named exception to R27).
- [DESIGN] control-plane R46 l88 — `PURGE_HOLD_IN_PLACE` (C-69.5): no purge of held material.
- [DESIGN] affordances R2 l28 — counselpacket `reasoned` (assembling material for counsel).
- [GAP] all eight modules / 446 ops — no object or op for a court case, party, filing, order, judgment, appeal, settlement, consent decree or precedent; no administrative-proceeding object.
- none in op-declarations beyond op names, wizard-scripts, tasks, corpus-export.
