# Cross-construct register (second constructs study, BOB #112)

Built from `digest/CROSS.md` (every phase-1 reader's "Cross-construct observations", 23 notes), read whole in four consecutive chunks (1–100, 101–189, 190–259, 260–324, 325–384). Six analysts read this register instead of the raw digest, so every distinct observation is kept; duplicates are merged. Each entry keeps every reporter and the digest line where it was recorded (`l.N` = line in `digest/CROSS.md`; `l.24(3)` = item 3 inside that line).

Entries are grouped by the constructs they join; an entry joining several sits under the pair it bears on most and lists all it joins. Nine constructs: TIME, ORGANISATIONS (and obligations), PEOPLE, EVENTS, MONEY, LAW, COURTS, ANALYSIS, QUESTIONS (and the assistant). Also used: PUBLICATION, ACTION (the group's own acts: a taken word), LAYERS (total order, modules, integration).

**Checkpoint:** CROSS.md has 384 lines. Read 1–384 (complete). Register complete.

**Group index:** 1 Identity (people–organisations–money, one registry) · 2 People–organisations · 3 People in the record and the group's own people · 4 People–analysis · 5 People–privacy, publication, safety · 6 People–events · 7 Events–time · 8 Events–processes–organisations (progressions, fragments) · 9 Events–law–analysis (acts, relations, cause) · 10 The three–analysis (grades, provenance, proposals) · 11 Time shared: one versioned history and change propagation · 12 Money–law, organisations, events, action · 13 The three with questions and the assistant · 14 Courts; one event, many records · 15 World events, publication and the group's own acts · 16 Naming clashes · 17 Requirements across all nine · 18 Layer order, modules, integration and reach · Conflicts and tensions · Coverage check.

## 1 Identity: one registry for people, organisations and money's objects

### X1 · One identity registry: `entities` (already holding person, office, institution, body, movement, ordinance, contract, fund and parcel kinds; "Subject" is the member-facing word) is also the bias subject registry; people, organisations, funds, contracts, payees and payers resolve there, widening it, never in a parallel registry; resolution grades (A–D, established = A|B) and defect/withdrawal are shared; missing are `event`/`meeting`/`proceeding`/`program`/`place` kinds (K1441 rules three, unbuilt) and attributes and as-of on entities; widening person entities widens what a bias statement can be about
Evidence: DEC-6 (person, contract, fund already in one registry); D-83 (entity axis = subject registry); SysDesign row 7 ("the same construct as the entity axis"); CONSTRUCTS Step 4; Content Framework §3, §13 ("Building it twice would be precisely the failure CONSTRUCTS.md was written to stop"); bias R3, R25; DEC-114 (Subject: "a person in a public role, office, place, law or thing"); DEC-88 (`entitycreate` "a person named in the registry"); `entityalias` (reversible); DEC-23 `resolutions (capture_sha, ref, entity_id)`; DEC-52 (one resolution cascade, not one per construct); CI src 6, K2 (`bundles.inquiry_subject_entity`); UC-018 ("people-in-role" with aliases and cited relations; entities R1–R8, R26); K1441; affordances R19 and entities R9–R11 (resolution is a reasoned act backed by `basis` and `method`). Three partial homes for person identity exist: the subject registry, `connections.a_grade/b_grade` end-resolution grades (Case_Making R2), and the measures map's "subject match" A–D scale (DEC-82); "mechanical equivalence extends exactly as far as the registry declares".
Reported by: C1 (l.15, l.20, l.24(1)), C10 (l.32, l.41), C11 (l.54, l.65), C12 (l.83(1)), C14 (l.112), C2 (l.121), C3 (l.136), C4 (l.153), C5 (l.171), D1 (l.258), M2 (l.312, l.316, l.318), M5 (l.353).
Constructs joined: PEOPLE, ORGANISATIONS, MONEY, LAW, EVENTS, ANALYSIS (bias).

### X2 · Identity is graded by resolution method and logged: aliases are first-class; a name-only match (including an AI-extracted person) grades no better than C (query-language `resolves:` grade C = flagged for a member); an ambiguous alias is "kept, never resolved silently"; a same-name collision stays a collision until a person judges it; every resolution attempt is logged (observation-log R8) and a failed one is a `reference` look; persons have no source identifiers, so person resolution sits at C or D unless a document links (same-name ambiguity is Connection C → B by "a shared identifier"); `isEstablished = A|B` (captured identifier at both ends, R34) suits funds, parcels and enactments but not persons, so a PEOPLE design must say how a person identity is established (e.g. testimony D plus corroboration) without changing R27; testimony's weight depends on the member's identity level; whether person-identity confidence is a connection-grade question or a new axis is open (DEC-21's axis separation argues against folding it into an existing one)
Evidence: two scales exist: the evidence/connection scale (A source identifier, B identifier matched in content, C correspondence / "the same name appears in both", D testimony: IS src 386–391; Content Framework §8.1; measures l.39–42) and the Subject match scale (A known name, B normalised form, C label only, D member says so: entities R9; measures l.49–52); source identity has its own ladder (Unknown → Same knocker → Partly known → Known to the group → Public: DEC-78 item 5; measures l.90–97); CONSTRUCTS Step 4; DEC-53 (identifier-tier resolution, `grade_if_resolved`); AI Roles rule 3; EXTRACTION-BREADTH l.117; DEC-102; Aleph via PRACTICE-SURVEY; observation-log R8; query-language (`resolves:`, `concerns:` by entity_id; frontier `reference` and `entity` kinds); TAD §10.8, §3; Content Framework §8.3; D-220 (identity by `address_norm`, IS src 237–245); UC-019, UC-160; journeyExperience (b) l.219–231; entities R6, R9–R12, R27, R34, R38; DEC-21.
Reported by: C10 (l.32, l.41), C2 (l.121), C3 (l.140), C4 (l.153), C5 (l.171, l.183), C8 (l.220), D1 (l.259), D2 (l.274), M2 (l.313), M4 (l.340).
Constructs joined: PEOPLE, ORGANISATIONS, MONEY, LAW, QUESTIONS (absence), ANALYSIS.
Notes: the letters A–D mean different things on the Subject match scale and the evidence scale; D2 asks that PEOPLE unify with both, not replace them.

### X3 · No fuzzy identity: an exact counterparty-name match or else "by" undetermined ("a fuzzy match would invent an attribution"; never "credit a city with a vendor's copy"); a resolver may PROPOSE matches (labelled draft), a recorded identity link is a member act, and unmatched stays undetermined; a pseudonym proving possession of a secret ("never identity") is the model for a continuity assertion weaker than identity
Evidence: Publication §3 rule 15(d); AUTHORITY-AND-TRUST; knocker-secret pseudonym (Intake).
Reported by: C6 (l.191).
Constructs joined: PEOPLE, ORGANISATIONS, ANALYSIS, QUESTIONS.
Notes: in tension with the DEC-52 entry below (see Conflicts T1).

### X4 · A connection's grade is the composition of how each end resolved to the shared entity, so identity-resolution quality sets the grade of person–organisation links, who-knows-who links, fund and contract links and every document leg, and thus case strength (inquiry R13 via `entities.strongestByCapture`)
Evidence: DEC-21; DEC-15 (earned connection grade depends on resolving captures to a registry entity); Case_Making R2; inquiry R13.
Reported by: C11 (l.60, l.63, l.65), C4 (l.153), M3 (l.328).
Constructs joined: PEOPLE, ORGANISATIONS, MONEY, ANALYSIS.

### X5 · Alias registration, resolution (`resolve` derived, `resolvetestify` testimony), relation declaration and progression threading may be machine-performed and machine-attributed ("the machine may rule … machine-attributed, the sidebar review, not a gate"); claim acceptance and sufficiency stay member-only: a design must say on which side each new act falls; the stale BOB-4 text (F9) must be read against the DEC-52 register
Evidence: DEC-52; IS src 1356–1360, 1821; FW src 128–130; DEC-60, DEC-65 (machine may suggest claims, may compose but not assert sufficiency).
Reported by: C12 (l.74, l.81, l.83(1)), C5 (l.171).
Constructs joined: PEOPLE, EVENTS, ORGANISATIONS, MONEY, ANALYSIS, QUESTIONS.
Notes: in tension with "No fuzzy identity" above and with M5 l.359 (identity resolution proposed by AI must be adopted by a member's reasoned act) (see Conflicts T1).

### X6 · A wrong resolution (two persons merged, a wrong organisation or fund) surfaces as a contradiction and is reported to `entities`: a member's `differs` on coordinate `subject` over a K4 pair reports a resolution defect (`reportResolutionDefect`; "a wrong subject match also reports a defect in `entities`"; "nothing moves"); this is the only place a member's judgement corrects identity; K4 joins a person's or body's two statements only through a prior `resolutions` row; PEOPLE, ORGANISATIONS and MONEY need one resolution model with a defect report that keeps or widens this door, not a second one; `entities` (layer 5) is earlier than `contradiction`
Evidence: CPR §9; DEC-76; CI src 82; CONTRADICTION-PRESENT-RESOLVE-DESIGN (K4); contradiction R32, R38; UC-019, UC-160.
Reported by: C14 (l.103, l.112), C2 (l.121), C5 (l.171), D1 (l.259), M6 (l.364).
Constructs joined: PEOPLE, ORGANISATIONS, MONEY, ANALYSIS (contradiction), LAYERS.

### X7 · One home per fact: one capture, one home; duplicates are corroboration, never a second item; repair only on record proof, never by guess; extend an existing structure rather than build a primitive twice ("D-164's failure, the primitive built twice and drifting"); so one person record, one event, one transaction, merges proven not guessed, and a person, event or money item extracted from a document is a reading or entity over content with an extent, so search, grading, cite and verify work on it unchanged
Evidence: Intake §8 D-179; MEMBER-KNOWLEDGE-DESIGN (correspondence capture-or-testify shape; `content` row with `capture_sha` as trust root); D-164.
Reported by: C6 (l.196), C8 (l.225(1)).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, QUESTIONS.

### X8 · When a person, post, event or payment needs its own id: the citability test ("does anything need to cite this part ALONE?")
Evidence: DEC-32.
Reported by: C2 (l.121).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, MONEY, ANALYSIS.

### X9 · Shared identifiers (fund code with fund name, project/CIP number, contract/PO, C.M.S. enactment number, APN) are the join keys of money across source systems and of law; they join money to the votes that authorise it and to organisations; a shared identifier lifts a cross-system procurement progression from grade C to grade B; "system = ORIGIN, host is not an origin" ties records to the office that publishes them, settled by a member's attributed declaration (provenance's `declareOrigin`, built but unreachable); the identifier-space construct is absent, and contract/PO is undetermined (unpublished at source in Oakland)
Evidence: M-119 (via CONSTRUCTS); Content Framework §8.3; TAD §10.8; provenance `declareOrigin`.
Reported by: C10 (l.31, l.41), C3 (l.134, l.140), M7 (l.383).
Constructs joined: MONEY, LAW, EVENTS, ORGANISATIONS, ANALYSIS.

## 2 People and organisations

### X10 · Person → post → office must resolve: publication names a role doing a documented act, and "predecessor occupants of a role" means the record must know which person held which post when an event occurred; every built Action-layer module models outside people only as an office `{role, body}` (conformance actor, actions counterparty, consequences affected, filings blanks), matched as exact strings (actions R27) with no resolution to entities or persons, and addresses its acts to an office; the addressee/counterparty already carries an optional `entity_id` (a person entity is refused as addressee), the join point where a person holding a post can attach without changing the outward-act rule; offices carry `elected`/`oversight` in profile data but no office → holder → person link exists, so escalation (stage 7) and filings cannot name who held the office at the act's date; posts held over time would let them, while the addressee and the published product stay the office (DR6)
Evidence: DR6 (Req 6); Action §4 rule 6; actions R9 (amended), R27; D1, D4; action-plans R10; action tests negative control ("a named person with no role and organisation refuses"); action-design deltas L13; escalation; filings.
Reported by: C1 (l.10, l.19, l.24(5)), C13 (l.88), C9 (l.231, l.245), M1 (l.288, l.294, l.299).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, TIME, PUBLICATION, ACTION, COURTS.

### X11 · Person–person and person–organisation ties (family, who-knows-who, employment, careers, "reports to", "contracts with", posts with a validity interval) have no home: subjects have three relations (stands in for / `proxy_for`, is part of / `member_of`, `overlaps`: constitutive, member-authored, justified, outside A–D, never traversed, R26) and connections are evidentiary co-mention (graded A–D, document to document THROUGH one entity, quadratic, never entity to entity); ties are dated evidentiary claims about the world, so per K1439/K1442 they belong to `lines` (walkable, bounded, as of a date), not to entity relations; `person–body serves_on` (§8 table) is the only stated person relation and is not in code; there is "no record of who held a role when"; Bob's deputy-director and career question (K1452) needs a dated person–post tenure joining a person, an office and an interval, in one home, not a second registry; a design fork is registered: widen `entities` (attributes, as-of) or add a people module over it; the office (structural prior by role) and the person ("specific, citable, evidence-bearing") must be distinguished in posts held over time
Evidence: Content Framework §8, §14.2; Bias DEC-6; journeys §6 l.533; UC-018; entities R1–R8, R26; connections R1; K1439, K1442, K1452.
Reported by: C3 (l.137), C4 (l.154), D1 (l.258), M2 (l.312, l.314, l.319).
Constructs joined: PEOPLE, ORGANISATIONS, TIME, ANALYSIS, LAYERS.

### X12 · Staffing over time: the `staff_directory` reader already yields staff entries keyed by e-mail address from a body's directory (staffing of an organisation as of a document's date; type recognised by email domain); unrecognised rosters and org charts are further staffing sources (directory census ~400–600 documents); staffing over time needs dated directory captures, and monitoring's membership contract (added / removed / altered entries of an index; directory contacts with change events) is a natural "who joined or left" signal, designed but not reached; official titles and directories are jurisdiction data
Evidence: DOCUMENT-PROFILES; reading-pipeline `staff_directory`; monitoring membership contract; jurisdictions.
Reported by: C8 (l.221), M2 (l.307, l.320), M7 (l.383).
Constructs joined: PEOPLE, ORGANISATIONS, TIME, EVENTS.

### X13 · Who held office while the money moved is the people question of the founding case: posts across City Administration, Finance, Auditor, Attorney, Public Works and Mayor with approximate and open tenures, tied to the transfer period FY2012–2021
Evidence: Roadmap App. A ("~2014-2022+"); Roadmap §1.
Reported by: C1 (l.8, l.24(2), l.24(9)).
Constructs joined: PEOPLE, ORGANISATIONS, TIME, EVENTS, MONEY.

### X14 · Which calendar governs an office depends on its organisational affiliation (the Grand Jury convened by the court and housed by the county; City offices under employee MOUs), itself uncertain: events dated against offices need the organisation construct's as-of affiliation
Evidence: plan/research-oakland-calendar; local-facts; action-clocks.
Reported by: C13 (l.94).
Constructs joined: ORGANISATIONS, EVENTS, TIME, COURTS.

## 3 People in the record and the group's own people

### X15 · Three identity regimes must coexist, and their join is unresolved: (a) members, the system's only person model today, get handle + cover, never a legal name ("Never let the cover field invite a legal name"), only administrators see both, opaque per-observation references, unlinkable across observations (the cover-to-handle table is a legal-process exposure), expertise declared vs confirmed with history, never deleted, rows with recorded actors, publication of the pairing by the member's choice; (b) sources/knockers get a dated disclosure history, pseudonymity by secret, contact never in the record, anonymity for off-record sources, structural non-recording, naming only by consent or if already public; (c) people the group examines are today only offices by role in outward acts ("never a private person"; "counted as a class") but are tracked fully in the record (DEC-5, K1452, K1455), which needs a second, distinct person kind; a member is never automatically a person record and vice versa, or §3 pseudonymity is defeated; yet DR6/Req 6 requires disclosure of the group's and members' relationships to "government entities, officials, contractors, or other stakeholders" (a canon NEED; relationship disclosure is in no requirement, UC-101; declared bias may seed from the group's stake, J2 l.162; an inside auditor may run a copy, journeys §1 l.74), and a member who is also a subject (DEC-102 "vested interest"; conflicts of interest), a subject who is also a source (a whistleblower official) or a member's relative must be either one identity or deliberately kept apart; no module holds that link; it belongs nearer bias/membership disclosure than the evidentiary record and needs at least the cover-pairing protection (admin-only sight, per-member publication decision), probably narrower (LEAD-style author/shared-to sight); members' credentials, roles and contact are already partly designed, so PEOPLE must not create a second identity system for members; no attribute of a person gates, filters or orders anything, and identity disclosure is never a strength component; three identity kinds exist in Action (members, non-member professionals named by grant, outside parties named by role)
Evidence: Membership v2 §1.3, §3, §10, src 809–813; membership R24, R57; MEMBER-KNOWLEDGE-DESIGN; SysDesign row 1; DEC-27, DEC-30 (attribution `member:<id>` / `token:<class>` / named non-member assistant); DEC-78 items 4, 5, 5(c); publication R51–R52; DEC-102; DR6 disclosure clause; sources_canon-mission l.38; Action D5, D6; filing-templates R8–R9; contact R44; Content Framework (member attribution at four levels, off-record anonymity); UC-101, UC-150; sources R1–R15; audiences l.512, l.517; brand §5; matter-page; bias, membership modules.
Reported by: C1 (l.10, l.16), C11 (l.67), C13 (l.90), C3 (l.142), C7 (l.204), C8 (l.219), C9 (l.238, l.246), D1 (l.259, l.260), D2 (l.275), M2 (l.316), M4 (l.339), M7 (l.377).
Constructs joined: PEOPLE, PUBLICATION, ORGANISATIONS, ANALYSIS (bias).
Notes: CONFLICT, see Conflicts C1.

### X16 · Every person fact (names, aliases, posts, credentials, memberships) is a dated, attributed claim: identity as a HISTORY of dated, attributed disclosures, never one overwritten field; each capture keeps the person "as it stood when the material was received"; one row per claim with its asserting source (the document that states it) and `how` the fact became known, separate from any member's confirmation (declared vs confirmed), a later entry superseding, identity claims that never merge (linking without merging), rungs of knownness and as-of publishability, append-only ("a standing statement with nobody's name on it is not a statement"); a credential stated and never verified (a bar number) carries basis and grade; identity by stated name + organisation; a name "held by value at the time of the act plus stable id" (dated snapshot names); firmer identity reaches dependent findings by re-evaluation notice; TIME supplies validity and recording instants: the bitemporal identity-assertion pattern PEOPLE needs for every person; `sources` is its built seed but covers only the knocker, has a closed three-word attribute list, no validity period ("employer from–to") and no link to `entities`
Evidence: Intake §2a, DEC-78 item 5; Membership §1.3, §4.10, §10; State Rules (accretive law); filing-templates R8–R9, R16 (professional grant); reevaluation R28; sources (req).
Reported by: C2 (l.122), C6 (l.190), C7 (l.205), C13 (l.90), M1 (l.290), M4 (l.339).
Constructs joined: PEOPLE, TIME, ORGANISATIONS, ANALYSIS.

### X17 · The record of the group's own acts already models people-acts-with-time (writer vs publisher, acknowledgements by/at, tie order stated undetermined): act attributed to an identity, instant precision, stated undetermined order, reusable for persons and events in the world
Evidence: BIO_Publication_v0_1.
Reported by: C6 (l.189).
Constructs joined: PEOPLE, EVENTS, TIME, PUBLICATION.

## 4 People and analysis: sources, witnesses, independence, no scores

### X18 · People as sources and witnesses: scrutiny statements ("in a position to have direct knowledge", "track record, position and motive") consume person-facts (posts held, relationships) a PEOPLE construct would supply to bias kind 1, though DEC-54 warns such properties are uncountable and not mechanisable; sources (knockers, hand-carriers, off-the-record), member testimony (D) and credit levels change evidence weight; a person's credibility already rides re-evaluation without regrading
Evidence: DEC-54; DEC-78, DEC-102, DEC-119, DEC-82 (testimony badge); IS src 386–391; reevaluation R28, R29, R32.
Reported by: C12 (l.76), C2 (l.122), C5 (l.183), M4 (l.343).
Constructs joined: PEOPLE, ANALYSIS (bias, strength), ORGANISATIONS.

### X19 · Independence must see people, events and ledgers: the shared-upstream-origin check (strength R12) is purely documentary, derived over content-addressed provenance, and does not see that two documents or corroborating witnesses trace to ONE PERSON (same speaker; circular reporting, the "Judith Miller error"), the same underlying occurrence (EVENTS) or the same ledger (MONEY); one shared origin model across the nine would let independence be honest and would change the strength pair
Evidence: D-195 (DEC-32); IS src 1086–1092, 1560–1564; strength R12.
Reported by: C2 (l.122), C5 (l.183), M3 (l.330).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS (strength).

### X20 · No scores and no composed figures on people, events or money: no reputation, credence, credibility or suspicion score, no connection-density ranking, no adversarial attribute on subjects, no significance field anywhere (none on a payment or person), suggestions "strongest first, with no score", consequences never composed into one figure ("bad actors being the exception identified by evidence rather than the default assumed by role"); this rules out who-knows-who centrality, event-anomaly scoring and composed money headlines: ties and anomalies are facts and evidenced, graded connections and findings, never ranked; any AI help for the three keeps the same prohibitions (no ranking, no density, no composed score)
Evidence: D-53; AI Roles rule 9; Case_Making §4; DEC-89; AUTHORITY-AND-TRUST l.150–154; DR §4; SOURCE-ACCESS; D-83 ("no adversarial attribute"); conformance R8; query-language R11; design journeys.
Reported by: C4 (l.156), C2 (l.128), C6 (l.198), C9 (l.236), D1 (l.265), D2 (l.278), M3 (l.333).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, QUESTIONS.

### X21 · The document-fact versus person-pattern tension (DEC-11's two scenarios) was resolved by Bob toward indexing people in public records, consistent with K1452 and K1455
Evidence: DEC-11; DEC-5.
Reported by: C11 (l.56).
Constructs joined: PEOPLE, QUESTIONS, PUBLICATION.

## 5 People, privacy, publication and safety

### X22 · Visibility of person records: the visibility machinery (`viewerPredicate`) gates only PROJECT bundles; evidence, and therefore every person, event or money fact a document states and entities' ENT/REL with counted ids, is shared corpus; a project's hypotheses (who knows who, suspected flows, event chains) are project thinking, hidden from the uninvited; machine class tokens see `1=1`; the entity frontier is unfenced and `op=concerns` serves any reader; reverse indexes ("which projects look at this person/fund") must be viewer-filtered; a nameless candidate already discloses a hidden project, so a people-name search across the fence must withhold whole rows (REC-36); bm25 over hidden rows disclosed hidden projects; a public title names what the group is looking into; privacy is enforced as "absent = invisible" and "counts never reveal", so any people graph, event timeline or money flow read (bounded walks of `lines`, totals across funds) must answer an invisible node as absent and never count it; counts and sequential ids disclose existence, so any per-viewer-withheld PEOPLE/EVENTS/MONEY object takes an opaque id; every new table subtracts membership's `hiddenBundles` (R88), never widens at EXISTENCE (R44) and registers its counts (R63); the store has no restricted tier ("a restricted copy in a replicating substrate is a fiction"); a PEOPLE design must decide whether person facts are evidence corpus or project-scoped and pass the one gate; purges must drop search rows in the same transaction; D-486 (project's thinking: attribution withheld, bytes shared) is the nearest precedent
Evidence: OBSERVATION-LOG-DESIGN L47; D-486; RS src 15, 298–303, 334–346; IS src 1635; D-447; RP src 181–184; Membership §7.9, §11 item 1; BOB #32; BOB #16; REC-36; Intake §4a; affordances R16; tasks R9; queue R33; publication R29; wizard-scripts R20; membership R88; record-core R44, R63; K1455.
Reported by: C10 (l.34), C5 (l.179), C7 (l.206), C8 (l.223), C6 (l.197), M5 (l.358), M7 (l.384).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, ORGANISATIONS (projects), LAYERS.

### X23 · Subpoena and legal exposure: member searches are never logged on legal-process grounds, the same concern applies to members' ties to those examined and to material about people; TAD's "mirror, fork and distribute" premise has not been reconciled with holding full personal facts; Distribution keeps everything in the group's account
Evidence: OBS §4.6; TAD; BIO_Distribution; DEC-61, DEC-113.
Reported by: C10 (l.35), C5 (l.179).
Constructs joined: PEOPLE, QUESTIONS, PUBLICATION.

### X24 · Removing personal data from append-only history has only one path, Expunge (I-19: drafted, unbuilt; may-not-hold rail; reason_class unlawful | confidential | recorded-decision); holding people fully (B8a, K1455: any stated personal fact may be held) raises the stakes of that gap for privacy and legal exposure
Evidence: State Rules I-19; K1455.
Reported by: C7 (l.211), M7 (l.384).
Constructs joined: PEOPLE, TIME, PUBLICATION.

### X25 · What the group's AI sessions say about individuals is not record: transcripts never enter the record and are purged at publication (litigation hold); one-bit existence signal
Evidence: DEC-61; DEC-36.
Reported by: C12 (l.82, l.83(6)).
Constructs joined: PEOPLE, QUESTIONS, PUBLICATION.

### X26 · The record may hold any personal fact while the public face is fenced, by special rules beside B8a's "no special rule for … sensitive personal facts": private persons named in a subject's reply are listed without text (docket R8: receipt only) and kept out of the public docket; third parties' names leave only by their own act; member attribution levels and source identity "Withheld"; notices never name members and name matters by public body; a source's identity needs consent to go more public and the group is never first to make a person more public or to disclose a source; a hostile exposure is recorded as the exposer's claim; "known to the group, not recorded" and read-logged restricted names; a person-index of cases "may read as adversarial" (subject right of reply), to be reconciled at publication (DR6), not at the record; DR6 (official capacity) is consistent with these; analysts must reconcile these (sources and third parties) with B8a (subjects)
Evidence: DEC-116 (4); DEC-78 (5a–e); Publication §3 rule 7, §5B, §5C, §5D, §6A.3(a); docket R8; Intake §1a (provenance, not relevance); OQ-17; K1452, K1455 (B8a); DR6.
Reported by: C2 (l.123), C6 (l.197), C9 (l.236), D1 (l.266).
Constructs joined: PEOPLE, PUBLICATION, ANALYSIS.
Notes: see Conflicts C2.

### X27 · DR6 has no enforcing home, and one publication filter for people is needed, inherited by events and money: DR6 (individuals only in official capacity for documented acts), consequences R10 (never name an individual; harmed party "never a person"), actions R9 (addressee an office by role and body, or a described audience, never a list of private individuals), conformance actor = office, actor kinds (D1, D4, DEC-54) and DEC-78 5(a) bound outward acts and published products, not the record (K1452, K1455); these layer-9 rules embody the set-aside "offices, never private individuals" rule and need re-reading under K1452/K1455 + DR6; person-exposure rules live in separate modules with no shared model (docket R8; case-disclosures R4 sources "Withheld"; case-grammar R2/R12 and case-disclosures R10 member attribution levels; contradiction R53/R55 and docket R20 members never named across projects; ratification's attribution ladder name / cover / project / group, an anonymous tip needing a corroborating leg, SUBJECT_POSITIONS sought for response; publication R17, R60, R51/R52), while DR6 is applied by none of the publication, case or ratification modules read (case-authoring R22 and case-disclosures R6 publish findings and every relied-on material whole; R34 leaves republishing judgement to the group); the PEOPLE design needs one publication rule for persons named in findings and materials, homed once, that every published case, filing, counsel packet and action draft passes and that EVENTS (participants) and MONEY (donors, payees) inherit; consequences stay person-free, though K1452 may reopen a person kind for harm to named individuals
Evidence: DR6 (Req 6); consequences R10; actions R9; conformance; D1, D4; DEC-54; DEC-78 5(a); Action §3 Consequence; publication, case-authoring, case-disclosures, case-grammar, docket, contradiction, ratification (req); K1452, K1455.
Reported by: C1 (l.19, l.25), C9 (l.231, l.233), D1 (l.266), M1 (l.285), M5 (l.355), M6 (l.365), M7 (l.378).
Constructs joined: PEOPLE, EVENTS, MONEY, ACTION, ANALYSIS, PUBLICATION, LAYERS.

### X28 · A person as a bias subject reaches publication: DEC-103 prints every bias statement's subject into the signed case, so a person-subject scrutiny statement would publish a named private individual, to be checked against DR6; the Bias DEC-6 residual (bare scrutiny on a natural person) is Bob's and live; naming "a person in the registry" is already a consequence-in-the-world act needing the full dialog
Evidence: DEC-103; Bias DEC-6; DEC-88; DR6.
Reported by: C4 (l.155).
Constructs joined: PEOPLE, ANALYSIS (bias), PUBLICATION.

### X29 · Which AI runs may read a person's attributes: the planning run "reads no person's attributes"; skills has no people/privacy layer; a PEOPLE design holding careers, credentials and family ties must say which runs may read them and add doctrine layers for private individuals and DR6's publication limits
Evidence: planning-skill R51; §3 Q4; BIO_Action_v0_1 §4 rules 8, 10; skills (req).
Reported by: C13 (l.89), M3 (l.333).
Constructs joined: PEOPLE, QUESTIONS, ACTION, PUBLICATION.

### X30 · The surface fence binds the three: a person's record (careers, ties) stays behind the fence, looking a person up outward is a tell, and a machine-built timeline or money-flow summary never replaces the source; timelines (EVENTS+TIME), flows (MONEY+ORGANISATIONS) and networks (PEOPLE+ORGANISATIONS) are expected surfaces rendered from one semantics table
Evidence: UI-KICKOFF (fence, tell discipline, "never only an AI summary", "interactive visuals that tell stories").
Reported by: C1 (l.23).
Constructs joined: PEOPLE, EVENTS, MONEY, TIME, ORGANISATIONS, QUESTIONS.

### X31 · Pressure entries (threats, retaliation, discrediting, legal harassment against the group or its supporters) are events done by people to people; they may start an inquiry and trigger the litigation-hold obligation
Evidence: actions R47; DEC-61.
Reported by: C13 (l.91).
Constructs joined: PEOPLE, EVENTS, ACTION, QUESTIONS.

## 6 People and events: acts, statements, issuers, raw material

### X32 · Document metadata is "the actions of people and departments": who edited what, when (`lastModifiedBy`, authors, initials, tracked-change authors, comments, created/modified) is a reading resolved across documents on the entity axis and is evidence; the office-readers' envelope joins PEOPLE, EVENTS and MONEY (formulas with cached values) at one evidentiary layer, but it is extracted and not projected or indexed (`envelope` extent kind designed, NOT BUILT), so none of it reaches entities or connections; a ready source of person-act-date triples once `envelope` lands; cross-document resolution is the largest piece of manual work in case development
Evidence: DEC-5 (archive l.268–274); M4; D-71; D-83; OFFICE-FORMATS; office-readers; EXTRACTION-BREADTH.
Reported by: C1 (l.20, l.24(9)), C11 (l.52), C8 (l.219, l.222), M2 (l.309).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, MONEY, TIME.

### X33 · The readers already extract the event and people facts (minutes' motions, movers, seconders, tallies, attendance, dates; calendar meetings; directory contacts with change events) but leave them as reading facts and strings; the missing step is promoting reading facts to graded references, entities or lines with positions (docprofile R34 position discipline, extraction R58 tables), and the machine may write only what has identifiers at both ends
Evidence: docprofile R34; extraction R58; K1443.
Reported by: M2 (l.320).
Constructs joined: PEOPLE, EVENTS, ORGANISATIONS, ANALYSIS, LAYERS.

### X34 · Statements are events with an actor and a date, and a "statement" event has no home: "the department said X in March and Y in October" is a person's or body's statements as a sequence; testimony (`observedAt`) is the only person-authored dated statement, while officials' statements and acts live only inside captured documents with no speaker or event object; resolved genuine double-speak or reversal by a subject (UC-070 `double_speak_or_reversal`) promotes to a finding presented as a timeline, and stays a civic verdict, never machine-proposed; PEOPLE+EVENTS feed contradiction IDENTIFY
Evidence: CI src 33–35; DEC-76; DEC-77; CPR §5; UC-070; testimony (`observedAt`).
Reported by: C14 (l.106), C2 (l.124), C4 (l.151, l.158), C5 (l.173), D1 (l.261), M7 (l.379).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, TIME, ANALYSIS (contradiction).

### X35 · Who asserts what: every statement-event has an issuer (execution vs authorship: "who is asserting what on it"; provenance vs content authority: who ISSUED the document) that today is a free-text string (`capture.authority`, "controlled vocabulary revisited when the corpus justifies one"); likewise the docket's standing holder is a free name and `from: other` a free 200-character name with no resolution, so the docket is a source of person and organisation statements that never meets `entities`; PEOPLE/ORGANISATIONS resolution is the natural home, turning these strings into references, three-valued (`determined` / `undetermined` + dated basis), never forced (a gate must not pressure an invented attribution)
Evidence: AUTHORITY-AND-TRUST; Intake §2; C-18.9; docket (req).
Reported by: C6 (l.192), M6 (l.366).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, LAW, ANALYSIS, PUBLICATION.

### X36 · The assistant already identifies "the people and bodies named" in a member's prose and proposes them (propose-show-confirm): a resolution step for people and organisations at intake of member text
Evidence: DEC-27 (CREATE kind).
Reported by: C11 (l.66).
Constructs joined: PEOPLE, ORGANISATIONS, QUESTIONS.

### X37 · "Known" starts deadlines: profile deadlines start on events (received, filed, act, known), so "known" implies a who-knew-when fact
Evidence: action-design profile deadlines.
Reported by: C9 (l.234).
Constructs joined: PEOPLE, EVENTS, TIME, LAW.

## 7 Events and time

### X38 · Every event or money fact needs an instant or interval at stated precision, with order within the precision stated undetermined; approximate dates can reuse the ruled interval reading of a coarse timestamp (AFTER / BEFORE / WITHIN BAND, undetermined inside the band) and bracketing (between 2026-02-04 and 2026-02-14 from a third-party archive) instead of a new uncertainty model; outside dating (RFC 3161, co-archive) gives provable "existed by" bounds; "first_holder: UNDETERMINED" and "a home is fixed by the first registration"; review's `undetermined_within` states ties as undetermined; approximate and open tenures and fiscal-year periods demand the shared as-of with approximate bounds (exact / approximate / undetermined)
Evidence: BOB #33's three answers; Publication D-543, D-573, D-516 (and the two ratification instants of one edition); Intake; SOURCE-ACCESS; review (`undetermined_within`); Roadmap App. A; Roadmap §1 (fiscal years, approximate label-change window).
Reported by: C1 (l.7, l.24(2)), C10 (l.36, l.42), C6 (l.194), D1 (l.261), M7 (l.380).
Constructs joined: EVENTS, MONEY, PEOPLE, TIME.

### X39 · The record holds document dates and record times, not the world's valid time: every derived date today is a capture or reading instant; the projection holds `created` / `last_updated` / `source.retrieved`; every event-like date is a single string (a document's reader-stated `date`, contradiction R9; a docket entry's UTC posting day; a clock's `YYYY-MM-DD`, queue-producers R25), none approximate, ranged or uncertain, and contradiction compares dates as raw strings; State Rules holds record time (state_history timestamps, write order by rowid) and some world time (Action clock dates with basis, recheck dates, `as_of` on claims, source_status changes) but no valid time for world facts (a post held from/to, an amount as of a fiscal period); the write instant (real UTC, record-core R47) is distinct from the world date; "a stored string is a fact about when it was written" is the record-time half of a bitemporal model; never compare two clocks in one column (provenance's two-clock rule: document dates never order captures); progressions lack the event's own date (needed for out-of-order, deferred at D-128); `resolveLinks`' order mixes registration instant with a reading's own date (D-580); event time, observation time (`observed_at`) and record time must be kept apart, and re-extraction makes content rows stale, never rewritten; EVENTS, MONEY and PEOPLE need the as-of model of the first study's `civil-time`/`chronology` (the home contradiction K4, R25's entity ordering and the docket's `date` should read), and an event's own date with its method ("reader-stated dates with their method") distinct from the document date, with its own undetermined state
Evidence: RS src 89–98; contradiction R9, R25; queue-producers R25; State Rules; TAD §10.10; record-core R47; provenance (two-clock rule); D-256; Content Framework §8.2; D-128; D-580; MEMBER-KNOWLEDGE (`observed_at`); DOCUMENT-PROFILES (relative window); CONTENT-SEARCH §4.1; CI src 84–86; K1438–K1439; K1443, K1444.
Reported by: C10 (l.42), C3 (l.138, l.139), C5 (l.173), C7 (l.208), C8 (l.225(4)), M2 (l.321), M6 (l.367), M7 (l.380).
Constructs joined: EVENTS, TIME, MONEY, PEOPLE, ANALYSIS (contradiction).

### X40 · The day boundary and recurrence are unresolved: modules count in UTC instants to the second (observation-log, acquisition, reevaluation C-10.1) or UTC days (actions R12, action-clocks Terms, monitoring R50; the UTC-day tally limit) while local-facts carries a profile `time_zone`; there are no approximate dates anywhere in layer 9; as-of mechanisms are separate (standards' `inForce(date)`, action legs pinned to captures R11, names held by value at the act, local-facts horizons, UTC-day deadlines, `publishableAt({at})`, Memento `Accept-Datetime`, `as_of` on cached columns), so the shared as-of model (ruled `civil-time`) must fix the day boundary and date precision, and events with civil dates and money by fiscal period need it; meetings recur but "there is no model of a recurring meeting, days are counted in universal time", while monitoring already offers a "per meeting" cadence that waits on a meeting schedule the plane does not hold: an EVENTS construct with scheduled meetings would let monitoring compute it
Evidence: actions R11, R12; action-clocks Terms; monitoring R50; reevaluation C-10.1; local-facts; standards; filing-templates R16; journeys §6 l.532; UC-031; publication `publishableAt`; Memento.
Reported by: M1 (l.291, l.300), D1 (l.262), M4 (l.342, l.344), M5 (l.354).
Constructs joined: TIME, EVENTS, MONEY, LAW, ORGANISATIONS.

### X41 · Sequence and timeline appear in disconnected places, each assembling its own: the contradiction inquiry's timeline for a reversal (an EVENTS read over contradiction sides only, one of six presentation forms), the counsel packet's chronology (filings R9: "chronology only in the counsel packet", merging the world's determined act with the group's events, publication, action states, correspondence and clock, by date), and the determination's day count ("certified on day 21" vs "within 30 days of the canvass"); a shared chronology read (ruled `chronology`, L5) with date precision and relations would be the one home all draw from, keeping "action" distinct while interleaving it, and carrying the rule "unstated date placed nowhere and counted, never guessed"
Evidence: CPR §5 (timeline form); DEC-77 (item 2); surfaceRules l.666–669; surfaces l.50; HANDOFF U41; matter-page l.20; filings R9; DR8.
Reported by: C14 (l.104), C2 (l.124), C4 (l.158), D2 (l.272), M1 (l.292).
Constructs joined: EVENTS, TIME, ANALYSIS, COURTS, ACTION, PUBLICATION.

### X42 · Dates carry a basis, and business days depend on per-office calendars that are researched, confirmed, lapsing facts: world event dates (a meeting, a filing received after close, an e-filing outage) need the same per-office calendar, time zone and hours and the same three-way status (confirmed / unconfirmed → computed with a statement / disputed or absent → undetermined)
Evidence: Action regulated dates `{date, basis}`; layer-9 contract; local-facts R1–R5; action-clocks R10; jurisdictions R41–R43.
Reported by: C13 (l.92, l.98).
Constructs joined: EVENTS, TIME, ORGANISATIONS, LAW.

### X43 · Deadlines derive from law, courts or commitments and are measured against a dated act: a clock carries "the statute, order, or commitment it derives from"; action-clocks R2 "start from the event the rule names in the ledger" + duration + calendar is the generic rule relating an event to a later due date; clock entries carry a basis, overdue is derived, never stored, and silently past-due is prohibited (CPRA clock "honestly overdue"); waits name "what, from whom, by when" and the legal date; a civil suit's multi-stage schedule is an Action clock; six clock designs plus profile deadlines starting on events, holidays and business-day counting exist; due dates come from rules ("within N days"); any event date model must feed these and the ruled `civil-time`/`chronology`; these are the group's own clocks (the clock is the only "should have happened by" register, and only proposals), so a world-event deadline (an agency's duty to respond; statutory deadlines on government acts) needs the same shape outside the taken word "action"; "obligation" is reserved for a public body's duty
Evidence: FA Function 5; TAD §8.2; CONSTRUCTS (`expected_by`); BSC Action clock; DEC-94, DEC-98, DEC-107; action-design profiles; action-clocks R2; journeyExperience (h).
Reported by: C1 (l.13), C10 (l.42, l.44, l.46), C14 (l.107), C2 (l.127), C4 (l.163), C9 (l.234, l.248), C7 (l.210), D1 (l.262), M1 (l.289).
Constructs joined: TIME, LAW, COURTS, ORGANISATIONS (obligations), MONEY (commitments), EVENTS, ACTION.

### X44 · Expected events age and notify through the one scheduler: progression stages with a due-by are aged (REC-8, "ageing of temporal expectations") and notify the member who connected them to a case, aggregated per case through Focus/Project; an expectation such as "minutes three weeks after a meeting" has a local threshold (profile data), raises questions only, runs as a scheduler consumer and would be hosted by the ruled `duties`/`chronology`; any periodic work of the three (due-date ageing, re-derivation of person or money links, disclosure-deadline clocks) joins the one alarm registry with zero idle cost, and a clock only marks something owed or raises a question
Evidence: REC-8; DEC-10; SCHEDULER; DOCUMENT-PROFILES.
Reported by: C1 (l.21), C10 (l.42), C11 (l.55), C8 (l.217, l.224, l.225(6)).
Constructs joined: EVENTS, TIME, QUESTIONS, ORGANISATIONS, LAYERS.

## 8 Events, processes and organisations: progressions and the fragments of EVENTS

### X45 · Progressions are the existing seed of an EVENTS process model and a MONEY commitment chain: what SOMEBODY ELSE is supposed to do (stages, `after` order, cardinality, `within` intervals, required/exception, junction checks, declared vs observed flow, versioned, findings that never decide; "minutes follow a meeting", "an award follows a solicitation"), Bob's founding example being a money process (need → budget request → approval → RFP → responses → award → signed contract; also meeting → agenda → minutes); with the records-request lifecycle's declared-versus-observed derivation ("follows/answers" links, elapsed time) they already bridge EVENTS, TIME, ORGANISATIONS (`held_by`; DEC-107 obligations), LAW (`proposes_amendment_to`; basis/citation of a flow), QUESTIONS (proposals, dispositions), PEOPLE (`serves_on`, attendees; threading by a person entity) and MONEY (through junction checks); an EVENTS design must extend the one progression table, not become "the eighth vocabulary"
Evidence: M4; DEC-9; CONSTRUCTS connection table and progression rows, L182–184, overlap 5 (a shared catalogue, not per-type strings); Content Framework §8.2; Case_Making §ACTION PLAN 3 (src 950–969); D-128; D-147; NOTIFICATIONS (OBLIGATION-as-flows); progressions R32; intent R4.
Reported by: C1 (l.20, l.24(8)), C10 (l.29, l.44), C11 (l.53, l.65), C3 (l.133, l.138), C4 (l.149, l.157), C9 (l.235, l.242, l.249), M2 (l.315, l.323), M4 (l.342).
Constructs joined: EVENTS, TIME, ORGANISATIONS, LAW, PEOPLE, MONEY, QUESTIONS.

### X46 · Stated gaps a progression-based EVENTS/MONEY design must fill: progressions thread by one entity and place DOCUMENTS, so a stage cannot be satisfied by an event with its own date and participants (out-of-order needs the event's own date, D-128); institution scoping of a declared flow; chain, not graph (no fork/merge: one approval → many contracts, one project → two funds); no payment stage; no amount on any stage, though three junction checks compare amounts (signed vs awarded, amendments past threshold, payments past term; R32, deferred until amounts and funds are values: T32 "Left out" A37) and the satisfaction condition filters on award amount and date; `within` does not use jurisdictions' business-day calendar (R33)
Evidence: Content Framework §8.2; D-128; progressions R32, R33; T32 Left out A37.
Reported by: C3 (l.138), M2 (l.315), M6 (l.370).
Constructs joined: EVENTS, MONEY, ORGANISATIONS, TIME, PEOPLE.

### X47 · EVENTS already exist in fragments, each in another construct's module: declared vs observed flow (progressions: missing predecessors, overdue successors, lawfully skipped stages), standards as of the act's date, contradictions' statement reversals over time, the action ledger's sent / received / no-response with a `responds_to` edge (group's own correspondence only), document versions and removals as dated events of evidentiary weight, the calendar type's meeting events, docprofile's `events[]` and temporal `connections[]` (`expected_by`), and the record's own two event logs that are not world events (the group's looking in observation-log; the record's own changes as reevaluation causes, derived on read with `since`); an EVENTS construct must either give the world-event fragments one shared event/act record with dates (exact / approximate / undetermined) and typed relations, or explicitly federate them
Evidence: UC-024, UC-080, UC-081, UC-063, UC-070, UC-119, UC-029, UC-033; docprofile; site-profiles R13; observation-log; reevaluation.
Reported by: D1 (l.261), M2 (l.308), M4 (l.342).
Constructs joined: EVENTS, TIME, LAW, ANALYSIS, ACTION, ORGANISATIONS.

### X48 · The calendar document type is a working prototype of EVENTS for one domain (meetings and documents): typed events with significance (event / notice / routine), stable keys (`MeetingDetail.aspx?ID=`), time-window-aware absence, the referential/temporal split, "absence with a due date"; none of it reaches the plane (`compare()` has no caller; the per-kind contract is not reached); its "event" (monitoring significance) is a taken word
Evidence: DOCUMENT-PROFILES (DP l.197); docprofile `events[]`.
Reported by: C8 (l.215), M2 (l.308).
Constructs joined: EVENTS, TIME, ORGANISATIONS, QUESTIONS.

### X49 · Expected-but-absent is one shape with one detector: "non-response is itself a finding" and "an award with no solicitation surfaces as a finding" are an expected event absent against a rule or process, aged by time, surfacing as a graded finding; the divergence shapes are missing predecessor, overdue successor, out-of-order and cardinality exceeded (an absence with a due date is "a fact about the body"); progressions (via queue-producers R2) is the only existing sequence detector, served as queue findings (`missing_predecessor`, `overdue_successor`, `cardinality_exceeded`), and the generic `temporal-expectation-due` is catalogued but unproduced; an EVENTS construct should treat these as its first consumers and avoid a second sequence-anomaly mechanism; non-response is an OUTCOME, dated, with no causal claim; four-level absence and "nobody looked" vs looked-and-absent govern it; whether a looked-absent observation may be a basis leg is open (D-129); MONEY's procurement chain is one instance
Evidence: M10; M4; DEC-9 (sole-source example; exception discharge as lawful skip); Content Framework §8.2; NOTIFICATIONS (D-128); queue-producers R2; queue catalogue; D-181; DEC-14; AI Roles §7.1; DEC-86; D-129.
Reported by: C1 (l.21), C11 (l.53, l.65), C3 (l.139), C4 (l.159), C9 (l.242), M5 (l.354), M6 (l.368).
Constructs joined: EVENTS, LAW, TIME, ORGANISATIONS, ANALYSIS, QUESTIONS, MONEY.

### X50 · A progression instance takes the weakest grade along its chain
Evidence: CONSTRUCTS Step 5; Content Framework.
Reported by: C10 (l.43), C3 (l.141).
Constructs joined: EVENTS, ANALYSIS.

## 9 Events, law and analysis: the act, relations, cause

### X51 · The "government action" is at once an EVENT (the city transferred), a MONEY flow ($2.1M, fund to fund, FY) and the subject of a LAW comparison ("what the standard requires, what the city did"); its outcomes compliant / noncompliant / unclear map onto graded findings with undetermined; the first study's ANALYSIS already assumes an event-with-amount as its object without modelling either
Evidence: FA Layer 2; Roadmap §9 Skill 6; Roadmap App. B (Prop 218, Prop 26 as law).
Reported by: C1 (l.9, l.11, l.24(3), l.24(6)).
Constructs joined: EVENTS, MONEY, LAW, ANALYSIS.

### X52 · The government act is the built seed of an EVENTS object and a de facto cross-module event identity without an owning module: the Action layer's unit is a government act measured against a standard (conformance's comparison row `{standard, requires, did}`; a Determination judges "a named government act" against Standards with a "period in force"; "A standard not in force at the act's date: refused"); conformance's `ACT-` id is an act with description, actor office, date/period, evidence and identity across determinations, but an id with no bundle; it is referenced across inquiry (an inquiry may name an `act?` as suspected subject), conformance, escalation (whose exit requires "the same act", so act identity is load-bearing) and action-plans (R5 `determined_since`); the matter page's act is an EVENTS object in miniature ("certification resolution, 18 July · by the City Council (office)", measured per standard in force on a date, consequences "$100,000,000 of bond debt authorised" computed from two documents and graded, causation "established · by the inquiry", escalation to court tools), with no participants beyond the office and no sequence relations except the plan-level "depends on subject 1: if the certification is voided"; an EVENTS construct must absorb or feed it (acts as events with determinations pointing at them, or a shared "same act = same id" rule at a lower layer), give it a home below layer 9 where inquiry can reach it (P4), with date/period, actor, place, participants and relations, so conformance, consequences, filings' `act`/`act_date` blanks and escalation's exit share one event record; if EVENTS owns acts, conformance and escalation identity move with it
Evidence: BIO_Action_v0_1 §3 (Determination, Standards); sources_build-state l.81–82; sources_code l.57; conformance; standards `inForce`; escalation; action-plans R5; journeyExperience (c) l.476; design-view-matter-page l.11, l.20; surfaceRules l.1587–1600; plan-page l.36; P4.
Reported by: C1 (l.17, l.24(2)), C9 (l.230, l.232, l.240, l.247), D1 (l.262), D2 (l.271), M1 (l.283, l.293, l.296, l.299).
Constructs joined: EVENTS, LAW, TIME, ANALYSIS, ACTION, ORGANISATIONS, MONEY, COURTS, QUESTIONS, LAYERS.

### X53 · What EVENTS feeds: TIME (deadline start events; filings' chronology), LAW (in force at the event date), ANALYSIS (conformance's act and cause), QUESTIONS (unclear → inquiry), COURTS (packet chronology, limitation deadlines)
Evidence: action-clocks R2; filings R9; standards; conformance; DEC-77.
Reported by: M1 (l.303).
Constructs joined: EVENTS, TIME, LAW, ANALYSIS, QUESTIONS, COURTS.

### X54 · Obligation against act (5Cs / CCCER: Criteria, Condition, Cause, Effect, Recommendation) maps across constructs: criteria = LAW (standards), condition = EVENTS (what happened), cause = ANALYSIS (member-authored), effect = consequences / MONEY; `obligation_against_act` routes into `conformance` (R21); the flow is contradiction → inquiry → `conformance` → `consequences` → publication; MONEY's rules (restricted funds, fee limits, procurement thresholds) would enter as `standards` and conflict-of-norms ("later over earlier" through standards' periods), MONEY's figures as precision, scope and time coordinates
Evidence: CPR §5; DEC-76; DEC-77; IDENTIFY; conformance R21.
Reported by: C14 (l.105, l.113, l.115), C2 (l.124), C9 (l.239, l.247), M6 (l.368).
Constructs joined: LAW, EVENTS, ORGANISATIONS (duties), MONEY, ANALYSIS, ACTION, PUBLICATION.

### X55 · The contradiction coordinates and resolution kinds already encode EVENTS and PEOPLE ideas as member labels: subject, time or occasion, scope, meaning, observer/method, precision; `double_speak_or_reversal`, `superseded_version`, `obligation_against_act`, `later_over_earlier` (inquiry R46); the clarifier's first choice "different time or occasion" is where EVENTS meets QUESTIONS/ANALYSIS (two conflicting statements describe different events; dated events are the main dissolver); "not the same subject" is where PEOPLE/ORGANISATIONS identity meets contradiction (→ entities defect); precision and scope serve MONEY (two amounts at different stages, rounding); EVENTS would be the natural home of the dated occasions contradiction sides refer to, and a chronology could ground these labels in held events without changing their member-authored nature; new pairing keys (same event in two sources, same payment in two records) "are added, not tuned"
Evidence: DEC-76; DEC-77 item 1; CPR coordinates (`time_or_occasion`, `superseded_version`); CI src 88–89; surfaceRules l.540, l.657; inquiry R46; contradiction (req).
Reported by: C14 (l.102, l.113), C2 (l.124), C4 (l.151, l.158), C5 (l.173), D2 (l.273), M3 (l.331), M6 (l.368).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, MONEY, TIME, ANALYSIS (contradiction), QUESTIONS.

### X56 · Relations among events and rules are interpretive, formed in legs by the AI and the member, not record-computed types ("taken together tell the story"): a direct constraint on any EVENTS relation vocabulary (authorises, answers, amends, reverses) and on any MONEY "violation" detector; analysis stays the place relations are interpreted
Evidence: DEC-60 (contract awarded skipping competitive bidding under an emergency exemption).
Reported by: C12 (l.79, l.83(4)).
Constructs joined: EVENTS, MONEY, LAW, ANALYSIS.
Notes: see Conflicts T2.

### X57 · Typed relations among world events (authorises, amends, follows from) would be record facts about the world, not the evidence-role types Bob refuted ("Roles are not types": SUPPORT/UNDERCUT/REBUTTAL withdrawn, "the record should not try"); a design must say so explicitly or it will read as reintroducing them; reuse closed vocabulary (`derived_from`, State Rules v1.5) before minting; relation names without producers and consumers are fiction (REL_VOCAB)
Evidence: IS src 361, 367–381, 433–436, 1704; Case_Making src 647 (REL_VOCAB).
Reported by: C5 (l.175), C4 (l.152).
Constructs joined: EVENTS, ANALYSIS, LAW.
Notes: see Conflicts T2.

### X58 · World relations among people, events and money have no home in any existing relation family, and belong to `lines`: three families exist and must stay distinct, constitutive entity relations (never walked, entities R26), derived co-mention connections (connections R1, quadratic, weaker-end grade) and bundle edges (State Rules §5.1's closed vocabulary: cites, corroborates, supersedes, derived_from, elevated_into, initiates, action_basis, responds_to, references, links_to; already stretched by `responds_to`, `references[]`, `action_basis`); adding employed_by, paid, authorises, amends, part of, follows to the edges would need a spec revision and would collide with the 1 MB `bundle.md` edge ceiling (~12,000 edges); per K1442 posts, careers, ties, event relations and money flows are dated evidentiary relations for the ruled `lines` (walkable, bounded, as of a date), keeping State Rules' proposed / confirmed / severed edge status and DEC-70 ("connection informs, never binds") as the pattern for machine-proposed person, event and money links
Evidence: State Rules §5.1; DEC-70; entities R26; connections R1; K1439, K1442 (`lines`).
Reported by: C7 (l.203, l.207), C9 (l.237), M2 (l.314, l.319).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, LAYERS.

### X59 · The one built machine relation between an event and documents is extraction's R52 "part of" (agenda item ↔ file; containment by profile link patterns), already carrying the grade/standing/established vocabulary (grade C, inferred, not established) and judged by members: the precedent for a machine-proposed, member-judged relation that any EVENTS relation would follow
Evidence: extraction R52.
Reported by: M2 (l.310, l.314).
Constructs joined: EVENTS, ANALYSIS, QUESTIONS.

### X60 · Cause: events (outcomes) are carried at full strength as dated facts; causal links between events are unproven unless an outside source states them; sequence alone never establishes cause; causation is its own finding; cause is member-authored and published only when evidenced (IDENTIFY assigns no cause; conformance R22); an EVENTS "causes" relation must not be a machine proposal; the cause ruling is DEC-84 (10), not DEC-77 (10) as the brief says
Evidence: DEC-14 (IMPACT vs OUTCOMES); DEC-84 (10); Action §3 Consequence ("causation as its own finding"); IDENTIFY §5; CI src 104–106; conformance R22; consequences R5, R12.
Reported by: C1 (l.17), C11 (l.57), C14 (l.116), C2 (l.124), C5 (l.175), M1 (l.303), C9 (l.239, citing it as DEC-77 (10)), D2 (l.271, citing both).
Constructs joined: EVENTS, ANALYSIS, ACTION, PUBLICATION.
Notes: see Conflicts C3 (citation of the cause ruling).

## 10 The three and analysis: grades, provenance, proposed versus decided

### X61 · Grades are per axis and never composed: a person-identity grade, an event-date grade and an amount's reading grade each need a grade or basis and a first-class undetermined ("Undetermined, because the city does not define it" for a money claim's terms) and surface by name, "each as its own weakest leg"; every derived item is graded on the shared A–D evidence family; new evidence kinds join DEC-21's separate axes and DEC-32's arithmetic and are never folded into capture or connection; one combined score or composed case strength is never shown
Evidence: SysDesign §4 ("grade ... never composes across scales"); M9 ("never a score"); DEC-82; DEC-21; DEC-32; DEC-44; DEC-92; MEMBER-KNOWLEDGE §3; design journeys J6.
Reported by: C1 (l.14, l.22, l.24(6)), C4 (l.161), C2 (l.128), C8 (l.225(2)), D1 (l.265, l.267).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS.
Notes: see Conflicts T3 (own scale vs shared strength pair).

### X62 · The leg's target set (information | inquiry | imported) is the gate every new construct must pass to become evidence; K1447 starts widening it (duty occurrence, calculation, standard); EVENTS (an occurrence) and MONEY (a calculation over sums) fit that same seam, each needing its own capture/connection meaning and its own entry in the grading method version (strength R31) to stay recomputable
Evidence: inquiry (legs); strength R31; K1447.
Reported by: M3 (l.329).
Constructs joined: EVENTS, MONEY, ANALYSIS, QUESTIONS, LAW.

### X63 · Proposed versus decided is kept apart in every source (Focus graph connections, Aleph matches, assistant-surfaced findings, model-judged PRESENT); "machine never concludes" is enforced per act (affordances R7 `MACHINE_REFUSALS`; the catalog never in `machine` mode; wizard-scripts R19; tasks C-32.10/11); the machine may propose, never adopt; identity resolutions, event relations (e.g. "causes") and money classifications proposed by AI enter as labelled proposals adopted by a member's reasoned act; the grade travels with every edge; machine proposals look proposed; machine work is marked with who asked
Evidence: TAD §7.5; PRACTICE-SURVEY (VIOLATE 4); CONSTRUCTS 8b; OBS §4.4; D-82; DEC-24; DEC-77 (3); DEC-90, DEC-125; A14; CF §12; affordances R7, R17; wizard-scripts R19; tasks C-32.10, C-32.11.
Reported by: C10 (l.38, l.43), C2 (l.128, l.129), C9 (l.250), M5 (l.359).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, QUESTIONS.
Notes: see Conflicts T1 (DEC-52's machine-attributed resolution).

### X64 · `asserted_by` is three-valued (source / system / member) and applies equally to a person's tie, an event relation and a money flow; who asserts a relation sets its weight
Evidence: CONSTRUCTS L191–195.
Reported by: C10 (l.30, l.43).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS.

### X65 · Grading and publication rules apply to every people, event or money finding: the per-axis pair, inert and named undetermined legs, a DAG with a depth bound, hunch-only blocking; a hunch ("who-knows-who", "this payment caused that vote") can link material for traversal but never lifts strength, and a hunch-only link blocks publication until earned or removed
Evidence: DEC-15, DEC-17, DEC-18, DEC-20, DEC-104; R3.
Reported by: C11 (l.62, l.65), C4 (l.161).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, PUBLICATION.

### X66 · Chain of derivation (each step attributed, dated, can only weaken) is a reusable pattern for any derived fact about a person, event or amount; AI-proposed people, events or money ride the `ai(function, version)` step, weaken and are labelled
Evidence: DEC-4; EXTRACTION-BREADTH §4.
Reported by: C11 (l.51), C8 (l.225(3)).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, QUESTIONS.

### X67 · `content` is the citation substrate all nine share: a person fact (a name in a roster), an event fact (a vote in minutes) and a money fact (a cell in a budget) are each a content row with two grades; the passage notice ("the source changed after we relied on it") is the built mechanism that amendments (EVENTS) and revised budgets (MONEY) both need
Evidence: content (req).
Reported by: M2 (l.311).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, TIME.

### X68 · Every person fact, event or amount used as a context fact or contradiction side carries its source and capture and the undetermined discipline: contextFacts are "the record's" facts, labelled and never guessed
Evidence: CPR (contextFacts; sides carry source and capture).
Reported by: C14 (l.114).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS.

### X69 · OCR digit fidelity is the floor under amounts and dates: a minted digit is a minted fact; `confidence: none` and the fidelity cap feed the grade of every extracted name, date and amount
Evidence: DEC-35, DEC-42; DEC-65.
Reported by: C12 (l.72, l.83(3)).
Constructs joined: MONEY, EVENTS, PEOPLE, ANALYSIS.

### X70 · Citing a specific amount, date, name or event passage needs sub-document addressing: the content-extent primitive, still parked, is its prerequisite
Evidence: DEC-23 (inference by C11).
Reported by: C11 (l.64).
Constructs joined: MONEY, EVENTS, PEOPLE, ANALYSIS.

### X71 · A case is a container over findings with no case-level strength composition: the publication shape for multi-finding money or people investigations
Evidence: DEC-44.
Reported by: C12 (l.73).
Constructs joined: ANALYSIS, PUBLICATION, MONEY, PEOPLE.

## 11 Time shared across the nine: one versioned history and one change spine

### X72 · One append-only versioned pattern can serve TIME, LAW, MONEY, EVENTS and PEOPLE (careers, event dating, money stages): the record's transaction-time history is already uniform (append-only, forward correction everywhere: affordances `IRREVERSIBLE_CORRECTION_PATH`, publication R24, wizard-scripts R18, `entitycreate` "never erased"), so bitemporal designs need no new correction machinery; editions (separate documents, history immutable, citations pinned, supersession surfaced) for amends/supersedes and adopted-vs-amended budgets; frozen named versions (one CURRENT per project) and frozen compositions with moving earned grades for alternative accounts of an identity, an event sequence or a money flow; append-only dated history ("about two things as they were"); pinned versioned external policy (source, retrieval date, hash) for moving rules such as fee schedules and thresholds; the version doctrine (pin, notify when affected, member chooses) for any reference a fact rests on; markers that add, never un-say
Evidence: DEC-12; DEC-60; DEC-54; DEC-56; IS src 1116–1122; CI src 159–163; Content Framework (version doctrine); affordances; publication R24; wizard-scripts R18; entities.
Reported by: C11 (l.58), C12 (l.77, l.80, l.83(2)), C5 (l.183), C3 (l.139), M5 (l.357).
Constructs joined: TIME, LAW, MONEY, EVENTS, PEOPLE.

### X73 · Corrections propagate through one spine: a correction to identity (merging or splitting two same-name people), an event date, a rescinded vote or a restated budget amount follows "the record adds, never un-says" (a marker stating doubt, not a retraction) and reaches findings through reevaluation (`onBasisChanged` and cause arms, derived on read, never stored, R18) or only as a newer capture (R14); the regrade-with-causal-chain diff shows which conclusions moved; each new construct's correction needs its own cause arm
Evidence: DEC-56; DEC-45, DEC-46; reevaluation R14, R18.
Reported by: C12 (l.75, l.78), M4 (l.343).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, TIME.

## 12 Money with law, organisations, events and action

### X74 · The founding case and frame entangle them all: Bob's original frame names money, relationships, decisions, power, responsibility and information as the flows to model as supposed vs actual (MONEY, PEOPLE and EVENTS before they were named constructs; the D-128 flow model their common home); the originating case is fund transfers (MONEY) relabelled as cost allocation, judged against Prop 218, the OMC and a missing franchise agreement (LAW), between the Sewer Service Fund and the General Purpose Fund under Council and Controller (ORGANISATIONS), through an audit, deadlines and non-response (EVENTS) across fiscal years (TIME); remedies (State Controller referral, City Auditor complaint, Prop 218, CCP 526a) sit in LAW/COURTS and the action tiers; recursive inquiries nest the fund misuse, the $2.1m transfer authorisation, the controller and a replaced source page
Evidence: Case_Making src 106–113; D-128; Roadmap §1; DEC-16; Intake §1, §5; Communications next step 6; State Rules examples.
Reported by: C1 (l.7, l.24(8)), C11 (l.61), C4 (l.147, l.160), C6 (l.195), C7 (l.209).
Constructs joined: MONEY, LAW, ORGANISATIONS, EVENTS, TIME, PEOPLE, COURTS, QUESTIONS.

### X75 · MONEY has no home today and must be placed in the meaning layer, read by layer 9: funds and programs are only named subjects; no module outside layer 9 holds amounts, funds or flows; money has two representations, both in layer 9 (fee quotes with currency, parsed value, revisions and waiver-as-zero in `actions`; figures read from passages in `consequences`), and `action-plans` refuses money keys; "The only calculation in the product comes after a breach has been determined" (consequences R2, only after noncompliance); spreadsheets "read as text and structure; their formulas are kept but not worked out"; the citation grammar reaches the cell (sheet-cell, sheet-range, doc-table; formulas beside cached values; CSV read faithfully) but holds no number, unit or currency, so value parsing must be added within the 512 KiB wire and CSV bounds; there is no budget reader (consequences defers it to extraction/docprofile) and no audit or finance-specific stage logic in filings or escalation; layer 9 deliberately keeps money narrow, so a MONEY construct in the meaning layer (L5) with amounts, currency, stage and period would be read by consequences (operands), filings (packet), escalation (audit_request purpose) and progressions' junction checks (R32, gated on calc-grammar, calculations and sheet-worker, K1439), without layer 9 holding money itself; the design already demands the weakest-input grade and a source per figure ("each filled blank names its source")
Evidence: UC-018; UC-119 (QUOTE_NOT_ON_RECEIVED); D-148; consequences R1–R12; journeys §6 l.528; HANDOFF U41; start-and-send l.52; action-plans R26; progressions R32; text-chain; reading-pipeline; K1439; P4.
Reported by: D1 (l.263), D2 (l.276), M1 (l.284, l.287, l.295, l.297, l.302), M2 (l.322), M6 (l.370), M7 (l.382).
Constructs joined: MONEY, ACTION, ANALYSIS, LAYERS, EVENTS, COURTS.

### X76 · The journeys' money cases all need MONEY × ANALYSIS (a repeatable, method-shown calculation step: the first study's `calc-grammar`/`calculations`) and MONEY × LAW (rate schedules, fee limits, franchise terms declared as standards): police overtime actuals vs budget vs policy; bond-measure shifts from the general fund; an unexplained fund transfer; franchise rates and fees; a sewer charge on a water bill; capital cost overruns; the 90% pothole claim
Evidence: design journeys; K1438–K1439.
Reported by: D1 (l.263).
Constructs joined: MONEY, ANALYSIS, LAW, ORGANISATIONS.

### X77 · Money rules (Prop 218, Prop 26, MC 13.04.080, fee limits, thresholds, purpose restrictions such as "Bond proceeds to serve the voter-approved purpose") are law held in `standards` as record, never encoded (D-149 "The plane encodes no law's rules: fees…"); a money rule as a standard today has only text and a period, no structured value; every money movement is judged against a standard; the archetypal claim is MONEY × LAW ("moved $2.1m from the sewer fund without authorisation")
Evidence: Roadmap App. B; Roadmap §9 Skill 6; FA; Content Framework; Case_Making; D-149; standards (period-in-force, supersession).
Reported by: C1 (l.9, l.24(3)), C3 (l.141), C14 (l.115), C9 (l.252), D2 (l.276), M1 (l.282).
Constructs joined: MONEY, LAW, ANALYSIS.

### X78 · Money's legality can depend on an authorising event and a restriction: the bond worked example ties EVENTS (certification act, deposit act), MONEY (restricted proceeds, general fund), LAW (two-thirds requirement, purpose restriction), COURTS (election contest, grand jury), ORGANISATIONS (funds/accounts as organisational objects?) and TIME (a short regulated end date); the deposit of bond proceeds into the general fund against the voter-approved purpose is a money flow (a transfer event, source fund → destination fund) judged against a standard and pursued through actions: the canonical flow the three constructs must make first-class; one event's reversal (voiding) removes the money's legal basis (proceeds of a measure that never passed "should not exist"): an event relation that changes a money question
Evidence: ACTION-PLAN l.65–68; design-view-plan-page.
Reported by: C9 (l.229, l.252), D2 (l.276).
Constructs joined: MONEY, EVENTS, LAW, COURTS, ORGANISATIONS, TIME, ACTION.

### X79 · The one built money object is the fee quote: amount and currency as quoted, basis verbatim, the entry it answers, revisions as later entries, a projected table read side by side; the machine never judges a quote against law; the pattern generalises: record stated amounts verbatim with their stage and source document, and comparisons against rules (fee limits, statutory floors) are member claims in inquiries; correspondence stages (fee_estimate, production, denial, appeal_decision…) are a typed event log of the group's records requests with money attached, and a MONEY design must decide whether fee quotes stay a correspondence attribute or become money records; registry kinds `contract` and `fund` exist
Evidence: D-148; D-149; D-147; DEC-6; correspondence stages.
Reported by: C4 (l.148, l.160), C9 (l.241), M1 (l.287).
Constructs joined: MONEY, LAW, EVENTS, ANALYSIS, ACTION.

### X80 · Consequences already implement a narrow money calculus from passages (`figures.mjs`: unit, currency, value|range; computed ops on content ids; weakest-operand grade over operand captures, DEC-21; totals only within one state/unit/currency; undetermined never zero; `form_not_read`; "computed, assessed or undetermined", never one headline figure): a built precedent for money arithmetic and its grading, and the place MONEY feeds ACTION; it relates to the ruled `calc-grammar`/`calculations`; a MONEY figure held as a value would need the same capture-grade basis; the MONEY design must decide whether figures and amounts move to a shared money module that consequences consume
Evidence: Action §3 Consequence ("computed from the record" for a fund or program); consequences `figures.mjs`, R1–R12; DEC-21; K1438–K1439 (calc-grammar, calculations).
Reported by: C1 (l.17, l.25), C9 (l.233, l.251), D1 (l.263), D2 (l.276), M1 (l.284, l.301).
Constructs joined: MONEY, ACTION, ANALYSIS, LAYERS.

### X81 · Money figures are held today only as attested values, not a money model: financial tables as Information `data/*.json` in tidy/long form with a hashed normalised dataset and gaps recorded (the sewer-fund exemplar and its dollar-figure hash catch); no fund, account, stage, flow or rule
Evidence: BSC (Bundle Skill Composite Design v1.7); State Rules.
Reported by: C14 (l.108), C7 (l.209).
Constructs joined: MONEY, ANALYSIS.

### X82 · Money's sources and stages as documents: the money source documents are the ACFR, the adopted budget book (32.5 MB, multipart) and revenue-expenditure reports, so money support must work on parted captures, and provenance "attests nothing about whether the figures in them are right"; the plan/actuals type split (budget = plan: budgeted/appropriated; financial report = actuals for a closed period) is the first money stage distinction in the canon, and neither has a reader; formula-beside-value and the `sheet-range` citation grain are the built substrate for derivations ("how a total was reached"); workbook search has no unit arm and PDF tables are NO-GO, so figures are reachable mainly as cell citations in xlsx/ods/csv; fiscal year, thresholds and fund forms are jurisdiction data
Evidence: SOURCE-ACCESS; Intake §8; BOB #32; OFFICE-FORMATS; CONTENT-SEARCH; EXTRACTION-BREADTH; jurisdictions.
Reported by: C6 (l.195), C8 (l.218), M2 (l.307).
Constructs joined: MONEY, LAW, TIME, QUESTIONS, ANALYSIS.

### X83 · Money amounts need precision as a first-class property with their source table: rounded vs exact, "approximately" vs a stated number, a summary vs the table it summarises, "reduced a little" vs "dropped a lot"; without it contradiction detection over budgets and actuals floods members with false conflicts ("switched off inside a week"); today contradiction's `precision` label and `same_fact_different_precision` dismissal would dismiss two figures differing in rounding as a lead, not compare them; a MONEY construct needs its own contradiction key (two amounts for one commitment), a disclosure row in case-disclosures/case-grammar (flat rows, K549) and queue producers for money anomalies; the live corpus is money-heavy, yet search is text-only with no typed amount field
Evidence: CI src 36–37, 129–131; RP src 85–87; AP src 109; RS; contradiction (`precision`); case-disclosures, case-grammar; K549; queue-producers.
Reported by: C5 (l.177), M6 (l.370).
Constructs joined: MONEY, ANALYSIS (contradiction), QUESTIONS, PUBLICATION.

### X84 · Disagreeing amounts across sources (ACFR vs OpenGov transfers-out; budget narrative vs actual expenditure) are contradictions to surface for a human
Evidence: FA cross-referencing; State Rules examples.
Reported by: C1 (l.12), C7 (l.209).
Constructs joined: MONEY, ANALYSIS (contradiction).

### X85 · Bob's contract-award example ties a commitment (MONEY) to the award process (EVENTS) and the required contracting process (LAW); the sentence used to refute evidence-role types is itself an event sequence with money in it ("the emergency was declared two weeks after the contract was signed")
Evidence: IS src 361, 770–775; DEC-60.
Reported by: C5 (l.175, l.177), C12 (l.79).
Constructs joined: MONEY, EVENTS, LAW.

### X86 · The group's own resources are not the government's money: the Action layer bans cost, budget, amount-to-spend, assignee, hours, significance, priority and score keys (OPTION_KEY_REFUSED; ruling 3 "No budgets", "a plan holds no resources"; Req 8 "does not provide or manage funding"); plan options touching world money reference it through subjects (inquiries, determinations); finance offices are only profile counterparties and nothing models money; a MONEY construct must be named and placed so it cannot be read as the group's budgeting
Evidence: action-plans R26; Action ruling 3; Req 8; OPTION_KEY_REFUSED; draft planning skill (bond-measure worked case).
Reported by: C13 (l.96), C9 (l.253), D1 (l.264), M1 (l.297).
Constructs joined: MONEY, ACTION, ORGANISATIONS.

## 13 The three with questions and the assistant

### X87 · An inquiry has one subject entity, the only point where PEOPLE/ORGANISATIONS touch QUESTIONS and ANALYSIS (it earns the connection axis); a docket's named subject is likewise one entity (`inquiry_subject_entity`, one column); widening to several subjects (people, events, sums) would touch inquiry R12/R40, strength R11 (two-subjects refusal), C-71 and the ratification and case modules that read them
Evidence: inquiry R12, R13, R40; strength R11; C-71; docket.
Reported by: M3 (l.328), M6 (l.366).
Constructs joined: PEOPLE, ORGANISATIONS, EVENTS, MONEY, QUESTIONS, ANALYSIS, PUBLICATION.

### X88 · The three meet in QUESTIONS through recursion, not a new object: one finding needing EVENTS (the transfer happened), LAW (no resolution authorised it) and MONEY rules (balance below the statutory floor) is composed of separate inquiries; a claim is a field of an inquiry
Evidence: Case_Making src 763–764; DEC-16.
Reported by: C4 (l.150), C3 (l.141).
Constructs joined: QUESTIONS, EVENTS, LAW, MONEY, ANALYSIS.

### X89 · Intent can carry the three's objectives, but waits on them: satisfaction conditions and bias measurable forms are one (deferred) construct needing MONEY values (amount, fund; budget-or-dataset type) and EVENTS denominators ("over meetings of this body since 2024-01") defined by registry, never hand-picked; objectives over entities (intent R4) could target people (every official in a post filed a disclosure) or money (spending per program), but conditions measure progression instances and filter only `entity_kind`, and money-valued conditions wait on progressions R32 (T32 "Left out" A37); anomaly detectors over people, events and money would enter as proposal sources (intent R15), ordered by scheduler R10
Evidence: Content Framework (satisfaction conditions); intent R4, R15; progressions R32; T32 A37; scheduler R10.
Reported by: C3 (l.135, l.141), M4 (l.345).
Constructs joined: QUESTIONS (intent), MONEY, EVENTS, PEOPLE, ORGANISATIONS, ANALYSIS (bias), TIME.

### X90 · One query reaches everything that concerns a subject ("every document that concerns this ordinance"), and every people, event or money search ("who / what happened / where did the money go") returns the four-level, five-bucket absence envelope (four levels plus `viewer`, `not_run`; NEVER_LOOKED / LOOKED_ABSENT / LOOKED_INDETERMINATE / PRESENT; "nobody looked, looked and absent, could not tell, partial, present") with the three causes of absence, at the new grain ("no payment of this kind in any ledger read" vs "ledger not read"), and obeys whole-row withholding
Evidence: M4; OBS §5.1; D-129; AI Roles §7.1; REC-36; retrieval R13; design surfaces.
Reported by: C1 (l.24(7)), C10 (l.45), C5 (l.183), C4 (l.159), C8 (l.223, l.225(5)), D2 (l.278), M4 (l.341).
Constructs joined: QUESTIONS, PEOPLE, EVENTS, MONEY, LAW.

### X91 · Search is the bottleneck for all three: `FIELDS` is closed and registration only re-homes existing fields; the projection has no person, event-date or amount columns; range queries exist only for registered time/number fields; people (post, period), events (event date, kind) and money (amount, fund, stage) each need fields and probably meaning arms in `query-language` (layer 5), with `as_of` marks (R17)
Evidence: query-language (`FIELDS`, R17); retrieval; RS.
Reported by: M4 (l.341), C5 (l.177).
Constructs joined: QUESTIONS, PEOPLE, EVENTS, MONEY, TIME, LAYERS.

### X92 · Absence about people has a structural hole: meaning-level observation evidence is one-sided for references and entities (observation-log R11), so "nobody looked for this person" over pre-log data degrades to undetermined, and a case's signed `searched` section cannot enumerate entity subjects
Evidence: OBS §5.1; OBS Incomplete §6 L33; observation-log R11.
Reported by: C10 (l.33, l.45), M4 (l.340).
Constructs joined: PEOPLE, QUESTIONS, ANALYSIS, PUBLICATION.

### X93 · Monitoring watches addresses, not subjects: watching a person, a program or a fund would need a subject kind beyond the address (R15) and a fetch authorisation from store state (R36), e.g. a named request (R28) generated from a person or fund of interest, ratified by a member
Evidence: monitoring R15, R28, R36.
Reported by: M4 (l.347).
Constructs joined: PEOPLE, MONEY, QUESTIONS, ORGANISATIONS.

### X94 · The assistant's claims need referents; unattended discovery beyond store-named sources is out of scope; people-, event- and money-finding by AI happens inside the one investigative session, writing suggestions only, bounded by its task scope and egress conduct
Evidence: OBS §4.4; TAD §10.4; DEC-47; DEC-55, DEC-60, DEC-62.
Reported by: C10 (l.45), C12 (l.83(5)).
Constructs joined: QUESTIONS, PEOPLE, EVENTS, MONEY.

### X95 · The AI stack is confined to inquiries, documents and four-level search, and the extract path is not deployed: EXTRACT is the named machine role for resolving names to the registry and proposing name, date and amount mentions, readings and table structures (labelled proposals bounded by `mints`, graded by what grounds them, measured by the minted-to-cited ratio), but standing unattended extraction is provisionally NO and the extract path is undeployed (only `check` is deployed); skills has no people/privacy, timeline or money layer; any rung needing AI help for the three needs §7.3 point 7 revisited, new run contexts or answers (K1439 `answers`, K1450 reach) and new doctrine layers
Evidence: AI Roles §7.3 point 7; ai-runs, run-productions, agent-worker, skills, capture-requests (req); K1439, K1450.
Reported by: C4 (l.162), M3 (l.333).
Constructs joined: QUESTIONS, PEOPLE, EVENTS, MONEY, ANALYSIS, LAYERS.

### X96 · Machine detectors over the three (same-person proposals, anomalies in sequences or money) follow IDENTIFY's pattern: deterministic auditable pairing in the plane, labelled machine judgement, a fixture with a false-conflict gate and recall reported, and a prompt pinned by digest
Evidence: CONTRADICTION-IDENTIFY-DESIGN; RS.
Reported by: C5 (l.185).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, QUESTIONS.

### X97 · Signals about the three reach members through the one queue with the notification item contract (summary in the record's voice, basis or "undetermined", producer-declared options, class by meaning not severity), e.g. an expected payment not made, an appointment not filed, a meeting's minutes overdue; producers derive on read, recipients are the group's own members, nothing repeated unless asked; new generators are catalogue entries (N-ids), not ad-hoc event strings; new capabilities land in existing interaction constructs (queue item types, acts with rungs), not new screens, with friction by rung
Evidence: NOTIFICATIONS; D-68; queue-producers; Interaction_Constructs (QUEUE/ACT test, final para); DEC-87.
Reported by: C4 (l.163), C9 (l.243, l.250), M6 (l.371).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, ORGANISATIONS.

### X98 · Patterns over people and events can be grouped by idea without a claim, as themes are (never a basis)
Evidence: Content Framework §8.4.
Reported by: C3 (l.142).
Constructs joined: PEOPLE, EVENTS, ANALYSIS, QUESTIONS.

## 14 Courts, and one event attested by many records

### X99 · Courts meet the three through: venue setting the evidence standard (profile data; filings' exhibit grades vs the venue standard); the counsel packet chronology; a court record as a primary source; court proceedings as event sequences ("filings, rulings and appeals"); a civil suit's multi-stage schedule as a clock; limitation deadlines; e-discovery chain of custody and privilege logs; venue hours and holidays; counsel at Tier 3 (named by name + organisation)
Evidence: Action rule 13; DR8; TAD §4, §8.2; PRACTICE-SURVEY §3; jurisdictions R39; M-NEW-3, M-NEW-7; journeys §6 l.531; filings.
Reported by: C1 (l.24(4)), C10 (l.46), C13 (l.98), C9 (l.248), D1 (l.262), M1 (l.294, l.301, l.303).
Constructs joined: COURTS, EVENTS, TIME, LAW, PEOPLE, ANALYSIS.

### X100 · One world event is attested by several records of differing directness and is kept apart from its documents: an event can itself be a source ("the source is the event itself"); corroboration is a first-class edge between independent records of the same fact (recording ↔ minutes); change detection needs same-source comparison (`via`); Bob's coroner example (a hearing known by newspaper, a member present, a transcript to come); firsthand member observation has no home (D-184), a gap any EVENTS or PEOPLE design meets; an EVENTS construct would hang the records of one happening on corroboration edges, apart from the group's own acts
Evidence: Intake §3a; AUTHORITY-AND-TRUST; DEC-39; D-184.
Reported by: C2 (l.126), C6 (l.193).
Constructs joined: EVENTS, COURTS, PEOPLE, QUESTIONS, ANALYSIS.

## 15 World events, publication and the group's own acts (taken word "action")

### X101 · World events and the group's actions overlap at responses: correspondence outcomes (granted, denied, partial, none stated), a non-response finding and request-for-comment replies are the public body's acts recorded inside ACTION; today world events (a reply, a non-response) enter only as `responds_to` / `references` edges onto the group's action; one home per fact needs a ruling, and EVENTS must let the group's action reference world events without becoming one
Evidence: Action §5 #7–8; M10; DEC-13 (request_for_comment, correspondence ledger); State Rules §5.1; UC-119.
Reported by: C1 (l.18, l.25), C11 (l.59), C7 (l.210), D1 (l.261).
Constructs joined: EVENTS, ACTION, ORGANISATIONS, PEOPLE.

### X102 · The house event pattern is the group's own dated, append-only ledgers: dated, attributed, never-deleted, forward-corrected entries (docket entries, withdrawal, decline-to-escalate, hold in place/released, acceptance/withdrawal, "working on" notices with weekly sealed timestamps; state history, Session Log, conclusion rows, run log, observation log) and the records-request lifecycle and correspondence ledger (stage, `follows`, `due_by`, outcome; closed outcome vocabulary, member-stated due date with law citation, derived elapsed time, should-vs-did statuses, capture or testimony): a working, built event-sequence grammar scoped to the group's own acts that a world EVENTS construct should mirror and generalise, kept separate and without colliding with "action"
Evidence: DECISIONS design branch ledger; D-147; actions (correspondence ledger + lifecycle); inquiry, run-rules, observation-log (req).
Reported by: C2 (l.125), C4 (l.148, l.157), M1 (l.286), M3 (l.332).
Constructs joined: EVENTS, ACTION, TIME, LAW.

### X103 · Events after publication: a case's docket (responses, public statements by the subject, a body's later vote as `outcome`, withdrawal) and the watching of other groups' editions are event streams about cases; outside responses "responding to a named edition" are typed relations of the kind EVENTS would generalise (responds to, supersedes, withdraws), and they drive re-evaluation; but docket `statement`, `response` and `outcome` entries are "never evidence" (R17) and cannot be cited, and the docket offers but never performs the group's actions (R3): an EVENTS construct must decide whether a docket outcome becomes an event in the record
Evidence: Publication §5A, §5D; reevaluation R16; docket R3, R17.
Reported by: C6 (l.199), M6 (l.369).
Constructs joined: EVENTS, PUBLICATION, PEOPLE, ORGANISATIONS, ANALYSIS, ACTION.

### X104 · The group's own process is not world events and stays in separate objects: intentions (checkpoints; "A missed checkpoint read as a finding about the city; it is always the group's own"), its sent acts (append-only), template lifecycles, plan scenarios, support-status labels and outcome/impact claims are the group's records; progressions (what somebody else should do) were deliberately kept apart from the plan (ours); our own deadlines never become findings about the world; an EVENTS construct must not mint findings or conditions from the group's own timeline, and an impact claim needs "a leg outside the group's own actions"; "an Action is an act in the world and begins as a member decision"; the group's processes may still inform a process model
Evidence: actions R23, R7 (amended); action-plans R23; journeyExperience (k) l.1312; filing-templates lifecycle; action-plans scenarios; DEC-26; DEC-14; Case_Making §ACTION PLAN 3; A10, OQ-25; Intake §9; Publication §8.
Reported by: C11 (l.68), C13 (l.93, l.95), C4 (l.149, l.157), C9 (l.235), C6 (l.193), D1 (l.261).
Constructs joined: EVENTS, ACTION, ANALYSIS.

## 16 Naming clashes

### X105 · Words already taken that a new construct must avoid or distinguish: "action" (the group's act); "act" (record-changing act; the member's ACT motion; conformance's `ACT-` and the government act on the matter page), so EVENTS should not be called "actions" or "acts" without qualification; "observation" (the look log); "event" (document-change and monitoring events: SIGNIFICANCE event/notice/routine, "Any change is an event; furniture moving is a notice", docprofile `events[]`, site-profiles R13, `delisted`, `minutes_replaced`, "graded events" from `assess`; the record/queue EVENT of DEC-16, "the unit of state is the EVENT, not the notification"; capture queue events, wizard tallies, queue items; system notifications); "obligation" (a public body's duty, DEC-107; also the member to-do code and bias-debt queue item class, queue R48); "ledger" (an action's correspondence ledger, so MONEY's ledgers need another name or a qualifier); "consequence"; "finding"; "Condition" (audit "what happened"); "standard" (legal vs evidence strength in agent-worker); "budget" (an AI run's budget); "clock" (an Action's clock); "Focus"; "membership"/"members"; "matter" (what a plan addresses); "subject" (an entities subject and a plan subject); "version"; "report"; "case"; "docket"
Evidence: OBS; CONSTRUCTS; TAD; BIO_Action; DEC-10; DEC-16; DEC-107; IS §0; FW B1; DOCUMENT-PROFILES l.197; SCHEDULER l.175; Interaction_Constructs; surfaceRules l.13, l.1620; actions R25; queue R48.
Reported by: C10 (l.37), C11 (l.65), C4 (l.157), C2 (l.125), C5 (l.181), C8 (l.215, l.216), C9 (l.254), D2 (l.277), M2 (l.308), M5 (l.360).
Constructs joined: EVENTS, MONEY, PEOPLE, ACTION, QUESTIONS, LAW.

## 17 Requirements across all nine

### X106 · Non-functional requirements bind the three as much as the six: edge-triggered growth and bounded, non-amplifying reads; the subrequest ceiling and one alarm; row-whole fencing and counts treated as disclosures; everything inside the sovereign instance; the Mechanical Verification Law; every object a conclusion rests on travels whole and is recreatable without Civicsmith; nothing shipped from outside the group's copy; nothing pushed between groups; the two-bucket fence
Evidence: OBS; BIO_Distribution; TAD; DEC-112; DEC-122; DEC-101, DEC-116; DEC-31.
Reported by: C10 (l.47), C2 (l.128, l.129), D2 (l.278).
Constructs joined: all nine.

### X107 · Exit and recreatability fail for facts kept in module tables: corpus-export's "verified" export covers bundles only; facts in module SQL tables (entities, relations, resolutions, connections, progressions, and any future `lines`, ledgers or chronology tables) are not exported; a load-bearing design for PEOPLE, EVENTS and MONEY must either keep its facts as bundles or widen corpus-export R1/R3 to module tables (each with its re-derivation rule), or DEC-112's recreatability and Membership v2 §8.1 fail for those constructs; single-answer export (no paging) also bears on scale
Evidence: corpus-export R1, R3; DEC-112; Membership v2 §8.1.
Reported by: M5 (l.356).
Constructs joined: PEOPLE, EVENTS, MONEY, PUBLICATION, LAYERS.

### X108 · The everyday path: queue-producers re-derives every item on each queue read from ~30 providers with bounds (200, 50, 8, 16), so adding producers for people, events and money adds to every queue read (K1432's "without slowing everyday use"); project-stage's "computed at the read, never stored, a move is a move of its inputs" with a bounded read (pages of 500, ≤2,000, else undetermined with `at_least`) is the pattern a derived timeline or "what should have happened" status could reuse to stay on the everyday path
Evidence: queue-producers; project-stage; K1432.
Reported by: M6 (l.373), M7 (l.381).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, LAYERS.

### X109 · Every new construct's views inherit the shared UI requirements: WCAG 2.2 AA with text equivalents for every chart (timelines, flows, networks); nothing loaded from outside (no external maps, people-search or finance APIs from the UI); bounded lists that say they were truncated; never counting what the viewer cannot see in totals (money totals, people counts); never a score, rank or significance; four-level look states for any people, event or money search; recreatability of a published case without Civicsmith
Evidence: DEC-99; DEC-122 G3; retrieval R29; conformance R8; query-language R11; DEC-112.
Reported by: D2 (l.278).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, PUBLICATION.

### X110 · Scale and runtime shape every person, event and money table: pairwise connections are quadratic (the model reopens when one entity is concerned by >32 documents) and meaning reads are capped at 5,000, which a prominent official or a large fund will exceed; ~100 bound variables per statement, MAX_COMPOUND = 4 (the four-arm compound ceiling), FTS5 only, wide typed indexed columns over EAV (EAV ~9x build, ~5.5x space: a generic facet store is ruled out by measurement), a declared stable tiebreak, one DO alarm, capped reads (500/5,000), and the visibility predicate's cost (283 ms vs 5 ms); typed columns or tables plus a JSON tail; the per-DO storage curve (~60,800 bundles per 10 GB) and promote's unit-count CPU are common pools the three draw on alongside the six
Evidence: D-224; RS Finding 3; RS; CONTENT-SEARCH; MEMBER-KNOWLEDGE.
Reported by: C3 (l.143), C5 (l.185), C8 (l.225(7)).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, LAYERS.

### X111 · Jurisdiction-specific rules for the three live only as profile data in `jurisdictions`: official titles and directories (PEOPLE), meeting/minutes practice and deadlines' start events (EVENTS), fiscal year, thresholds and fund forms (MONEY); today only titles, fund forms, minutes-due and deadlines exist
Evidence: jurisdictions (req).
Reported by: M2 (l.307).
Constructs joined: PEOPLE, EVENTS, MONEY, LAW, ORGANISATIONS, TIME.

## 18 Layer order, modules, integration and reach

### X112 · The dependency order (membership → capture → record → content → meaning → bias → inquiry → retrieval → assistant → surfaces → publication) puts PEOPLE, EVENTS and MONEY as meaning-level derivations over content, like entities, connections and progressions, graded on their own scales and feeding inquiry legs; the government act and money must sit below layer 9 (where inquiry can reach them, P4), read by layer 9, not grown inside it
Evidence: SysDesign §4; P4; M1 module reading.
Reported by: C1 (l.14), M1 (l.296, l.297, l.302).
Constructs joined: PEOPLE, EVENTS, MONEY, LAYERS, ANALYSIS, ACTION.

### X113 · How new types enter: the schema is additive ("a new type is a file drop plus a matrix row"); a new object grammar goes first in the earliest module that holds the vocabulary, later modules read earlier ones; checks are added, never rewritten, and fired both ways; writes are append-only and derived state is read, not stored
Evidence: BSC; CPR §5, §12, §13.
Reported by: C14 (l.109, l.117).
Constructs joined: PEOPLE, EVENTS, MONEY, LAYERS.

### X114 · One vocabulary home: affordances publishes every vocabulary "exactly" and by reference to its owner (R4; R21: no surface composes text), so any PEOPLE (roles, posts, credential kinds, tie kinds), EVENTS (event kinds, event relations) or MONEY (stages, flow kinds) vocabulary must be owned by its construct module, re-exported there, and reach the assistant only through the plane's published vocabulary, the op registry and the pack (control-plane R41, skills, agent-worker R48); today the only people/money vocabulary is `entities`' flat `ENTITY_KINDS` and three declared relations, and "introducing a kind is a doctrine change, not a write" (entities/index.mjs:25–27); `OBJECT_TYPES` is closed at {information, inquiry, project, action}
Evidence: affordances R4, R21; control-plane R41; agent-worker R48; entities/index.mjs:25–27; AP §1; IS src 281.
Reported by: M5 (l.351), C5 (l.181).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, LAYERS.

### X115 · The integration cost and hooks of each new construct: every new op passes four tables (an `op-declarations` spec, R6 totality; a `control-plane` route via the owner's map, R26, with stamps never from the body, R29; an affordances rung or `RUNG_ABSENT` ground plus a `NON_ACTS` sentence, R3, R12; and, if it raises member work, a catalogued queue kind, queue R1, R11 mint refuses `NO_SUCH_KIND`); writes join through promotion R39–R40 (registerStep/registerFact, FACT_UNAVAILABLE never false); every table declares itself to record-core purge (R21); tensions show through contradiction R27's marks ("Every surface that shows a side reads this"); members are reached through queue-producers
Evidence: op-declarations R6; control-plane R26, R29; affordances R3, R12; queue R1, R11; promotion R39–R40; record-core R21; contradiction R27; queue-producers.
Reported by: M5 (l.352), M6 (l.371), M7 (l.384).
Constructs joined: PEOPLE, EVENTS, MONEY, QUESTIONS, LAYERS.

### X116 · Seams to reuse rather than duplicate: derived-on-read liveness and checks; append-only plus purge declaration; registration hooks for upward reads under the total order; proposals stored apart with run, skill and sources; one-answer refusals for absent or invisible; profile facts as data with basis and conflict withholding; a generic member-confirmation store keyed by fact path (could confirm facts about offices, posts or money rules); the addressee shape; date + basis; attribution by value
Evidence: action R8, R15, R19, R27, R11, R31, R22; ai-runs R47; jurisdictions R39; local-facts; filing-templates R16.
Reported by: C13 (l.97, l.98).
Constructs joined: all nine, LAYERS.

### X117 · Built is not reachable: many services PEOPLE, EVENTS and MONEY would lean on are built and declared as ops but called by no screen of `civicos-ui/app.html` (UX deferred to Bob, K633, K899 (2)): entity defect and withdrawal, member-asserted connections, agenda–file containment judging, bias, the strength bar (strengthbar/strengthbarof), capture-request listing and retry, narrowcandidates, intent, sources, leads, the frontier, monitoring's member reads, provenance's `declareOrigin`, contradiction's 14 ops (members meet them only as queue items), the docket's 9 and case-import's 12; "can now" in the ladders must distinguish built from reachable, and any people, events or money capability will be built but not reached until the new interface lands
Evidence: entities, connections, extraction, bias, strength, capture-requests, intent, sources, monitoring, provenance, contradiction, docket, case-import (req); K633; K899 (2).
Reported by: M2 (l.324), M3 (l.334), M4 (l.346), M6 (l.372), M7 (l.383).
Constructs joined: PEOPLE, EVENTS, MONEY, ANALYSIS, QUESTIONS, LAYERS.

### X118 · A build-state conflict in the assistant stack: agent-worker R53 says plan is deployed "as soon as this member runs model turns (R40 and R48 met)"; the T18 job record says R40, R41, R48 are met, yet `MODES.plan.deployed: false` (harness.mjs) and T32 Left out C2 holds "`MODES.plan` deployed | deployment | K660 (5)": the requirement's trigger and the build state disagree on whether model turns "run"
Evidence: agent-worker R53; T18 job record; harness.mjs; T32 Left out C2; K660 (5).
Reported by: M3 (l.335).
Constructs joined: QUESTIONS, LAYERS.

## Non-observations recorded
- C14 (l.110): neither CPR nor BSC mentions people as subjects with privacy concerns, events as world objects, or money flows; their relevance is through identity defects, timelines and 5Cs, clocks and record integrity (covered by the entries above).

## Conflicts and tensions

Disagreements between sources or between readers' readings, each with both sides; the entries above carry pointers here.

- **C1 · Linking people across regimes.** Full holding of subjects (K1452, K1455; DEC-5) and DR6/Req 6's disclosure of members' ties to those examined (sources_canon-mission l.38) need a link between a member, a source and a subject who are the same individual; deliberate non-linkage for sources and members (DEC-78 5(c); Membership v2 §3 cover rule; member identities unlinkable across observations, MEMBER-KNOWLEDGE) forbids it. Reported as CONFLICT by D1 (l.259); also C7 (l.204), C8 (l.219), D2 (l.275), M4 (l.339), M7 (l.377). Entry: "Three identity regimes".
- **C2 · B8a vs special person rules.** B8a (K1455): "no special rule for family members, minors or sensitive personal facts". Against it: DEC-116 (4) (private persons in a reply kept out of the docket), DEC-78 (5a–e) (source consent, hostile exposure as the exposer's claim, "known to the group, not recorded", read-logged restricted names), Publication §6A.3(a). C2 (l.123) asks analysts to reconcile (likely: the special rules govern sources, third parties and publication; B8a governs what the record may hold about subjects). Entry: "The record may hold any personal fact while the public face is fenced".
- **C3 · Which DEC rules cause.** The brief cites DEC-77 (10); C2 (l.124) says the cause ruling is DEC-84 (10), not DEC-77 (10); C9 (l.239) cites DEC-77 (10); D2 (l.271) cites both; C1, C11, C14 cite DEC-77 (10) via the brief. Entry: "Cause".
- **C4 · Plan mode deployment.** agent-worker R53 vs `MODES.plan.deployed: false` and T32 Left out C2 (M3 l.335). Entry: "A build-state conflict in the assistant stack".
- **C5 · Monitoring "per meeting" vs no meeting model.** Monitoring offers a "per meeting" cadence (UC-031) while "there is no model of a recurring meeting, days are counted in universal time" (journeys §6 l.532) and the plane holds no meeting schedule (D1 l.262; M4 l.342). Entry: "The day boundary and recurrence are unresolved".
- **C6 · UTC day vs profile time zone.** actions R12 and action-clocks Terms count UTC days; local-facts carries a profile `time_zone` (M1 l.291, l.300: "unresolved in layer 9"). Same entry.
- **C7 · DR6 stated but unenforced.** DR6 governs publication of individuals (brief; K1452), yet M5 (l.355), M6 (l.365) and M7 (l.378) find it applied by none of the publication, case, ratification and related modules read, which publish relied-on material whole. Entry: "DR6 has no enforcing home".
- **T1 · Who may record an identity link.** DEC-52 (C12 l.74, l.81; C5 l.171): resolution and alias registration are machine-performable and machine-attributed, "sidebar review, not a gate". Against: Publication §3 rule 15(d) / AUTHORITY-AND-TRUST (C6 l.191): a recorded identity link is a member act, a resolver only proposes; M5 (l.359): AI identity resolution enters as a labelled proposal adopted by a member's reasoned act; K1443 (M2 l.320): the machine may write only what has identifiers at both ends.
- **T2 · Typed event relations as record facts.** DEC-60 (C12 l.79): relations among events and rules are interpretive, formed in legs, not record-computed types. Against: C5 (l.175) reads typed world-event relations (authorises, amends) as admissible record facts distinct from the refuted evidence-role types; C7 (l.207), C9 (l.237), M2 (l.319) home them in `lines` (K1442).
- **T3 · Own grading axis or shared strength pair.** C1 (l.14, l.22): person-identity, event-date and amount grades are each their own scale. D1 (l.267): share the strength pair "rather than a new axis unless justified". C8 (l.220): whether person identity is a connection-grade question or a new axis is open; DEC-21 argues against folding.
- **T4 · Two A–D scales.** The Subject match scale (A known name … D member says so) and the evidence/connection scale (A source identifier … D testimony) use the same letters with different meanings (D2 l.274); D2 asks PEOPLE to unify with both.
- **T5 · Edge vocabulary closed yet breached.** State Rules §5.1 declares a closed edge vocabulary; C9 (l.237) notes it is already breached by `responds_to`, `references[]`, `action_basis`, and EVENTS relations would need the spec revision State Rules demands.
- **T6 · Ordering anomaly proposals.** M4 (l.345): anomaly detectors would be proposal sources ordered by scheduler R10; the no-ranking doctrine (D-53; AI Roles rule 9; conformance R8; query-language R11) forbids ranking people, events or money by score. Recorded as found; not stated as a conflict by any reader.

## Coverage check

- Bullets in `digest/CROSS.md`: 299 items in 23 reader sections = 256 top-level `- ` bullets + 28 indented `  - ` sub-bullets + 7 indented `  (n)` items (C10 l.41–47) + 8 numbered items (C5 l.171–185). C1 l.24 holds nine inline items (1)–(9), each mapped by `l.24(n)`; C12 l.83 holds six inline items, mapped by `l.83(n)`.
- Per reader (top + sub): C1 19+0, C10 11+7, C11 18+0, C12 12+0, C13 11+0, C14 10+6, C2 9+0, C3 11+0, C4 17+0, C5 0+8, C6 11+0, C7 9+0, C8 11+0, C9 16+10, D1 10+0, D2 8+0, M1 17+5, M2 11+7, M3 8+0, M4 9+0, M5 10+0, M6 10+0, M7 8+0.
- Register entries: 118 (X1–X118), plus 13 conflict and tension items (C1–C7, T1–T6).
- Every bullet maps to at least one entry (most to several), cited by reader and digest line in each entry's "Reported by". Five top-level bullets are only headings for the sub-items under them and carry no observation of their own: C10 l.40, C14 l.111, C9 l.244, M1 l.298, M2 l.317; their sub-items are mapped individually. One bullet records an absence and is listed under "Non-observations recorded": C14 l.110. No bullet was dropped; exact duplicates were merged into one entry and keep every reporter (e.g. "one identity registry", reported by 12 readers; "deadlines derive from law", by 10).


**Note by BOB #112:** conflict C3 is settled: the cause rule is DEC-84 item (10) (K1461); readers citing DEC-77 (10) followed the brief before it was corrected.
