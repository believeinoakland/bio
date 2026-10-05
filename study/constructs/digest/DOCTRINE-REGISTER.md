# Doctrine register (de-duplicated from digest/DOCTRINE.md)

Every distinct rule, principle or ruling the phase-1 readers recorded that constrains how time, organisations, law, court cases, analysis or the assistant may be built, merged across readers. Written by the X-REGISTER worker (BOB #110 study, 2026-10-05) from a full, chunked read of `digest/DOCTRINE.md` (and `digest/CROSS.md` for the companion register).

**Notation.** `d123` = line 123 of `digest/DOCTRINE.md` (the bullet that reports the rule; open it to reach the reader's source and line). Reader ids (C1–C13, D1, D2, M1–M5) are phase-1 readers; reader D1/D2 are not register entries D1/D2. Constructs in *Binds*: TIME, ORGANISATIONS (ORG), LAW, COURTS, ANALYSIS, QUESTIONS (the assistant and AI roles). *Home* is where the rule lives as the readers cite it (canon §, requirement R id, DEC or K number); RM = Roadmap v5, DR = Design Requirements v2, FA = Functional Architecture v3, SD = System Design, AC = Action design (BIO_Action_v0_1), CF = Content Framework v0.10, IC = Interaction Constructs, AIR = Assistant and AI Roles, DB = Declared Bias, TAD = Technical Architecture Decisions, OLD = Observation-log design, PS = Practice survey, CON = CONSTRUCTS, MS = MILESTONES, UK = UI-KICKOFF.

**Progress (resume note).** DOCTRINE.md read: 1–230. A resumed worker keeps every entry and continues from the first line not listed.

## The machine's role

### D1 · Humans decide: a member takes every act that commits the group; the machine takes none of them
- **Home:** AC §4 rule 1; RM §10 ("Humans make every decision"); FA (human judgement fixed per layer, inherited by the interaction constructs and the assistant's fences)
- **Quote:** "Humans decide. A member takes every act that commits the group: declaring a standard, determining, assessing a consequence, choosing an option, approving, sending, advancing a stage, resolving, closing."
- **Binds:** all six
- **Reported by:** C1 (d29, d43); C13 (d221)
- **Notes:** none

### D2 · Every outward act is a member's, rests on the record, and names its basis
- **Home:** SD §3 row 16; layer 9 contract (build/layers.md)
- **Quote:** "every outward act is a member's, rests on the record, and names its basis"
- **Binds:** LAW, COURTS, TIME, ORG
- **Reported by:** C1 (d40)
- **Notes:** none

### D3 · The machine (AI) finds, pursues, extracts and checks, and never attests or concludes; its judgement is recorded as indeterminate with the judgement stated, never as an attested fact
- **Home:** layer 6 contract (build/layers.md); OLD §4.4; TAD R12 (AI advisory)
- **Quote:** "the machine's (model's) judgement cannot attest PRESENT; it is recorded as indeterminate with the judgement stated."
- **Binds:** all six
- **Reported by:** C10 (d67, d73, d83)
- **Notes:** none

### D4 · The machine proposes, a member adopts: nothing machine-made enters the record or a plan until a member adopts it; dismissal is reversible greying, not deletion
- **Home:** TAD §7.5; planning skill §1, R31–R33; action-plans R24
- **Quote:** "Nothing enters the plan until a member adopts it"
- **Binds:** all six
- **Reported by:** C10 (d81); C13 (d191, d220)
- **Notes:** none

### D5 · The machine/member division does not move: the machine may compose the reasoned object and write it as a SUGGESTION; enforcement sits at refusal of ACCEPTANCE, not at refusal of production
- **Home:** DEC-60 (enacted as IS-1..IS-9, INVESTIGATIVE-SESSION.md §18); DEC-62
- **Quote:** "The division between machine and member does NOT move"
- **Binds:** QUESTIONS, ANALYSIS, LAW
- **Reported by:** C12 (d157, d171, d177)
- **Notes:** DEC-62: merging PURSUE with investigation "does not move the boundary: the machine still only suggests". A proposed 'state-fence' primitive was withdrawn as unnecessary.

### D6 · The assistant may not commit anything directly: an assistant that could commit would be a back door around every safeguard
- **Home:** DEC-27
- **Quote:** "An assistant that could commit directly would be a back door around every safeguard in the system"
- **Binds:** QUESTIONS
- **Reported by:** C11 (d129)
- **Notes:** none

### D7 · The machine does not choose what to look into (no recommendation engine); pursuing a claim the member authored is directed by the member's own words
- **Home:** DEC-22 ("the less-narrative line holds")
- **Quote:** "the exploring machine-driver row stays empty (machine choosing what to look into is REFUSED, "a recommendation engine")"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C11 (d125)
- **Notes:** none

### D8 · A machine credential MAY declare relations, resolve references and thread progressions, but the record names the machine principal, the statement is visibly machine-attributed, grades stay earned and a hunch stays a member act
- **Home:** DEC-52 (closed via REC-65; carries DEC-55 det 4 / D-199.4, D-82, §8.1); sharpened by DEC-60
- **Quote:** "The earlier provisional (sidebar approval as the act of record) is SUPERSEDED as a gate"
- **Binds:** ORG, LAW, COURTS, QUESTIONS
- **Reported by:** C12 (d155, d156, d157)
- **Notes:** Moves the DEC-24 boundary for these acts; the six fields' comments that claimed "a member's constitutive statement" were corrected to match code. `strengthBarSet` still refuses MACHINE_CANNOT_DECLARE (store.mjs:5119). Any reading that relations are member-only must be checked against this ruling (see D65).

### D9 · Machine and AI credentials are least-privilege and confined by REFUSAL, not by convention; what an AI credential may reach widens only by an authored, dated, on-the-record decision, and an agent cannot request a broader token
- **Home:** DEC-37 (DAEMON_TOKEN, two verbs); DEC-55 (per-op `classes` on 120 op declarations; `scopeFor` confines probe to scratch) and det. 2–3
- **Quote:** "you do not make an AI safe by trusting it to behave — you make it safe by exposing only endpoints that are safe to call."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C12 (d141, d169, d170)
- **Notes:** DEC-37: "widen by decision, not by drift"; DEC-55: "If an agent can request a broader token, the scoping is theatre" (never-prefill applied to capability).

### D10 · A daemon can close nobody's work: closing is the act and is refused at the act (is this a person at all), not at the fence (is this this member's task)
- **Home:** DEC-7
- **Quote:** "can close NOBODY'S work, and closing is the act"
- **Binds:** QUESTIONS, TIME
- **Reported by:** C11 (d104)
- **Notes:** `taskdrain` untouched: "draining is not resolving".

### D11 · Authorship over something the member cannot see the reasoning for is not authorship but a rubber stamp: the machine's reasoning must be visible where a member signs
- **Home:** DEC-24 amendment (routine-attestation risk, DEC-4)
- **Quote:** "authorship over something the member cannot see the reasoning for is not authorship — it is a rubber stamp"
- **Binds:** QUESTIONS, ANALYSIS, LAW
- **Reported by:** C11 (d127)
- **Notes:** none

### D12 · A field whose meaning is that a member (or nobody) said something must never carry a machine stamp: mint a third, undetermined state instead; an absent identity is never called a machine one
- **Home:** DEC-65
- **Quote:** "a field that overclaims, in the direction this project ranks worst"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C12 (d172, d174)
- **Notes:** Adding `none:` to MACHINE_STAMP_PREFIXES is recorded as the wrong fail-closed shortcut. Changes to a landed check go through the item that owns the files.

### D13 · No standing, scheduled or automatic AI run: every AI run is launched by a member
- **Home:** DEC-24 rule 2; AIR §7.3 ("provisional NO on standing runs"); planning skill §3 choice 1
- **Quote:** "no standing / scheduled / automatic AI run"
- **Binds:** QUESTIONS, TIME, ANALYSIS
- **Reported by:** C13 (d190, d193)
- **Notes:** none

### D14 · The machine's words never become the member's reason; words a script or AI places are a labelled draft, the member's only once kept
- **Home:** K1364; planning skill R32
- **Quote:** "the machine's words never become the member's reason (consistent with K1364 labelled draft)."
- **Binds:** QUESTIONS, LAW, COURTS
- **Reported by:** C13 (d194)
- **Notes:** none

### D15 · A local fact (holiday, office hours, office) is confirmed only by a member, never by a machine (MACHINE_CANNOT_CONFIRM); researched values stay unconfirmed until then
- **Home:** local-facts R1, R5; filing-templates draft §2; research-oakland-calendar summary
- **Quote:** "status `researched`, each unconfirmed until a member confirms"
- **Binds:** TIME, ORG, LAW
- **Reported by:** C13 (d185, d199)
- **Notes:** none

### D16 · Inhaling an outside policy or standard means PROPOSE FOR ADOPTION, never install; adopting by default launders a standard nobody authored
- **Home:** DEC-54 det. 2
- **Quote:** "INHALE MEANS PROPOSE FOR ADOPTION, NEVER INSTALL."
- **Binds:** LAW, QUESTIONS
- **Reported by:** C12 (d164)
- **Notes:** "the never-prefill violation wearing a compliance badge" (see D99).

### D17 · Store-authoritative invocation: the runtime is "a doorbell, not a delivery", carries standing intent only and never originates intent; a general dispatch/eval/RPC endpoint is permanently prohibited
- **Home:** TAD §10.4
- **Quote:** "it never originates intent"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C10 (d77)
- **Notes:** Bears on any spreadsheet/formula or code-execution design for ANALYSIS: no general eval endpoint.

### D18 · Nothing is adopted automatically and nothing vanishes silently; a machine finding must not drown a member (no task per instance)
- **Home:** DEC-10 (discovery loop, CON Step 8b); D-79
- **Quote:** "nothing is adopted automatically and nothing vanishes silently"
- **Binds:** QUESTIONS, ANALYSIS, TIME
- **Reported by:** C11 (d111)
- **Notes:** none

### D19 · Muting is personal; dismissing is a record act; they must never be one control (the finding stands, only that member's notification stops)
- **Home:** DEC-10 determinations
- **Quote:** "MUTING IS PERSONAL; DISMISSING IS A RECORD ACT, and they must never be one control"
- **Binds:** QUESTIONS, TIME
- **Reported by:** C11 (d110)
- **Notes:** none

### D20 · Every act runs the ACT motion: choose, see what it will refuse and why BEFORE it runs, author the reason, get a receipt; acts sit on a weight ladder reversible · reasoned (never prefilled) · terminal · attested
- **Home:** MILESTONES preamble; Interaction Constructs (ACT); action-design PATH status
- **Quote:** "see what it will refuse BEFORE it runs, author the reason, get a receipt"
- **Binds:** all six
- **Reported by:** C1 (d53); C13 (d209)
- **Notes:** none

### D21 · The gate is at the outward act, not at the reasoning: a plan may rest on premises not yet established, shown as hunch debt; an act reaching outside the group may not be taken on them
- **Home:** DEC-26 (Bob 2026-08-03); AC §4 rule 2
- **Quote:** "the gate belongs at the ACT, not at the reasoning. A plan may rest on premises not yet established; an act reaching outside the group may not be taken on them."
- **Binds:** LAW, COURTS, TIME, ORG, ANALYSIS
- **Reported by:** C1 (d44); C11 (d128, d131)
- **Notes:** "THE SAFEGUARD IS LABELLING, NOT REFUSAL"; an outward act's pre-flight refuses when its step is not `established`, naming the premise and the shortfall. DEC-29 re-cites the principle. A member may pass the gate openly (AC rule 2).

### D22 · A surface may RENDER a refusal it received from the plane but may never COMPUTE one (derive nothing: codes received, never inferred); the plane is the sole authority on what states exist
- **Home:** DEC-8 (amended in wording by DEC-49); UI-KICKOFF (plane sole authority; UI SEMANTICS table)
- **Quote:** "A surface may RENDER a refusal it received from the plane; it may never COMPUTE one."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C1 (d59); C11 (d105); C12 (d159)
- **Notes:** DEC-49: a surface may render an AUTHORED translation keyed on a code the plane sent; "an untranslated code FAILS THE HARNESS". Standing test: "can the surface state this refusal without holding a rule the plane also holds?"

### D23 · No narrative drafting and no generated justification by the machine; compellingness is the wrong axis
- **Home:** PS VIOLATE 1–10 (items 2–5 built as SK-3); PS §2; Case Making §4a
- **Quote:** "familiar tools optimise compellingness, "the wrong axis""
- **Binds:** QUESTIONS, ANALYSIS, COURTS
- **Reported by:** C10 (d86, d87)
- **Notes:** Case Making §4a: "easy to build a supported case, hard to state an unsupported one."

### D24 · AI-driven discovery of public sources is authorised by the inquiry plus the session launch; an extra approval that adds paperwork without judgement is the empty gate the project refuses
- **Home:** DEC-47
- **Quote:** "accountability paperwork without adding judgement"
- **Binds:** QUESTIONS, LAW, COURTS, ORG
- **Reported by:** C12 (d161)
- **Notes:** none

## Grades and undetermined

### D25 · Undetermined is a first-class answer and must be stated (never hidden, never replaced by a guess)
- **Home:** SD §1, §7; IC UNDETERMINED (display primitive); FA outputs ("Unclear", its precursor)
- **Quote:** "undetermined is first-class and must be stated"
- **Binds:** all six
- **Reported by:** C1 (d32, d35, d39); C10 (d66)
- **Notes:** FA's "Unclear" outcome sends work back to information-gathering. OLD §6 (BOB #33): the record never chooses between two claims it cannot tell apart; it states undetermined.

### D26 · A fact not supplied or not sourced reads undetermined, never a default and never a guess; conflicting sources leave it undetermined until a ruling or a member decides
- **Home:** AC §4 rule 11; action-plans R23–R28; filing-templates draft §2; research-oakland-calendar M-NEW-8
- **Quote:** "A fact not supplied is answered undetermined, never a default"
- **Binds:** TIME, ORG, LAW, ANALYSIS
- **Reported by:** C1 (d48); C13 (d184, d200, d220)
- **Notes:** Negative findings are recorded as undetermined "so the profile does not later infer one"; "A worker never states a fact it could not source".

### D27 · A refused or silent read is UNDETERMINED, never absence
- **Home:** planning skill R51
- **Quote:** "never as absence"
- **Binds:** QUESTIONS, ANALYSIS, LAW
- **Reported by:** C13 (d192)
- **Notes:** none

### D28 · A grade tracks directness and never composes across scales
- **Home:** SD §4
- **Quote:** "grade tracks directness and never composes across scales"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C1 (d36)
- **Notes:** none

### D29 · Every layer may be sparse: absence at one level is not evidence of absence at the next (the four-level search states at which level absence was found)
- **Home:** SD §4; CF Part II §14.3
- **Quote:** "every layer may be sparse, and absence at one level is not evidence of absence at the next (Part II §14.3)."
- **Binds:** QUESTIONS, LAW, COURTS, ANALYSIS
- **Reported by:** C1 (d36)
- **Notes:** none

### D30 · A machine-proposed connection is a HUNCH until earned; a hunch is visible as a hunch everywhere and is never shown as a connection; `grade_source` is resolution (earned), testimony (member's signed grade D) or hunch (the only authored grade above D)
- **Home:** SD §3 row 6; DEC-15 determinations (D-154); PS VIOLATE
- **Quote:** "a machine-proposed connection is a HUNCH until earned"
- **Binds:** QUESTIONS, ANALYSIS, ORG, LAW
- **Reported by:** C1 (d37); C10 (d87); C11 (d117)
- **Notes:** none

### D31 · Only an uncleared HUNCH refuses publication; ordinary bias debt is disclosed and travels with every published case; a published case must hold with every hunch removed
- **Home:** DEC-15 (Bob 2026-08-01); DEC-20 (Bob 2026-08-02; D-188); DEC-46 (1); DR Addendum; TAD Declared bias
- **Quote:** "bias debt is DISCLOSED; hunch debt is DISQUALIFYING — because a hunch inflates a GRADE and ordinary bias only frames interpretation"
- **Binds:** ANALYSIS, QUESTIONS, COURTS
- **Reported by:** C1 (d24, d26); C10 (d79); C11 (d116, d124); C12 (d151)
- **Notes:** C1 records the refusal as stated but not built: SD §3 row 7 says `op=publishpreflight` is in no OPS table (REC-15) (Conflicts). D-188: say HUNCH DEBT where the rule means hunches.

### D32 · A hunch is not an undetermined leg and must not be composed as one (R1 suspends an axis when a grade is ABSENT; a hunch is PRESENT and composes normally while open)
- **Home:** DEC-15 determinations
- **Quote:** "A HUNCH IS NOT AN `undetermined` LEG AND MUST NOT BE COMPOSED AS ONE"
- **Binds:** ANALYSIS
- **Reported by:** C11 (d117)
- **Notes:** none

### D33 · An ungraded leg is inert and named, not unrating; when every leg is ungraded the result is UNRATED
- **Home:** DEC-18 (Bob 2026-08-02), refining R1
- **Quote:** "an ungraded leg is inert and named, not unrating; all-ungraded → UNRATED"
- **Binds:** ANALYSIS
- **Reported by:** C11 (d122)
- **Notes:** none

### D34 · Capture and connection grades are never combined: two measurements over two populations (documents and edges)
- **Home:** DEC-21 (Bob 2026-08-02), refining R2
- **Quote:** "capture and connection grades are never combined; they are two measurements over two populations, documents and edges"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C11 (d123)
- **Notes:** none

### D35 · No single trust or confidence score, and no case-level strength composed over findings
- **Home:** DEC-92 (citing DEC-44 and the measures map DEC-82); PS VIOLATE; DEC-44
- **Quote:** "one ladder mixing who produced a thing, whether the group accepted it, and a verdict on it reads as a single trust score"
- **Binds:** ANALYSIS, QUESTIONS, ORG
- **Reported by:** C1 (d14); C10 (d87); C12 (d147)
- **Notes:** none

### D36 · Credibility is demonstrated by the work, not by credentials, title, reputation or assertion
- **Home:** RM §5 OP5; TAD §5
- **Quote:** "Credibility is demonstrated by the work. Not by credentials, title, or assertion."
- **Binds:** ORG, COURTS, ANALYSIS
- **Reported by:** C1 (d12); C10 (d80)
- **Notes:** none

### D37 · Transitive trust is accepted so long as it is disclosed in the provenance chain; inherited trust is the fact of publication, never the credibility of the content
- **Home:** AUTHORITY-AND-TRUST.md (ruled 2026-07-30); TAD §5 (revised 2026-07-30); DEC-92
- **Quote:** "transitive trust is accepted so long as it is disclosed"
- **Binds:** ORG, COURTS, LAW
- **Reported by:** C1 (d9, d15); C10 (d80)
- **Notes:** TAD §5 originally said "no transitive trust"; revised 2026-07-30 to accepted-if-disclosed.

### D38 · Acceptance changes no grade; flags are disclosed, never blocked
- **Home:** DEC-96
- **Quote:** "acceptance "changes no grade"; flags "disclosed, never blocked""
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C1 (d16)
- **Notes:** none

### D39 · Machine-read (OCR) text is never indistinguishable from publisher text: `text_source` with engine, version and per-region confidence; an OCR citation carries its image region; OCR never raises a capture grade; a low-confidence region reads undetermined; how content was extracted is its own, never-hidden fact
- **Home:** DEC-4 determinations; DEC-23; SD §7 (CPDF-10)
- **Quote:** "OCR TEXT IS DERIVED FROM PIXELS AND MUST NEVER BE INDISTINGUISHABLE FROM TEXT THE PUBLISHER WROTE."
- **Binds:** ANALYSIS, LAW, COURTS, QUESTIONS
- **Reported by:** C1 (d38); C11 (d97, d98, d126)
- **Notes:** DEC-4 (Bob overrules "accept the limit"): image-only PDFs must be OCR'd and reach the entity axis — "A document class the record can capture and can never read is a hole an adversary can put things in". DEC-23: "Capture grade stays a property of the DOCUMENT".

### D40 · Transcription fidelity bounds the capture axis (weakest link of byte provenance and transcription) rather than minting a third grade axis; a text layer is itself an unverified transcription; the ceiling is member-attested verification against the rendered image, recorded as a chain
- **Home:** DEC-4 amendment (c) and second amendment; D-151
- **Quote:** "Verification supersedes the chain as the grade determinant and never as the record"
- **Binds:** ANALYSIS, LAW, COURTS
- **Reported by:** C11 (d99, d100)
- **Notes:** Attestation is scoped to what was checked and is refusable to a machine credential (D-151). Chain shape `pixels → ocr → ai → attested(member, date, extent)`.

### D41 · An absence or equality that cost nothing to produce is never a positive finding and is not evidence; instruments are harvested, never hand-extended by their author
- **Home:** OLD §5.1; DEC-4 second amendment; DEC-49 (L838)
- **Quote:** "an equality that costs nothing to produce is not evidence"
- **Binds:** ANALYSIS, QUESTIONS, COURTS
- **Reported by:** C10 (d64); C11 (d100); C12 (d160)
- **Notes:** DEC-49: hand-extending a measurement list "would make the instrument agree with its author at zero cost, which is the equality this project refuses."

### D42 · "The op returned nothing" and "no document carries a marker" are different facts; absent and empty are kept apart
- **Home:** OLD l.29, l.33
- **Quote:** "*absent* and *empty* are the two facts this document exists to keep apart."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C10 (d65)
- **Notes:** none

### D43 · No machine mints a grade: garbled machine output reads undetermined; a checkability anchor needs coordinates; measured self-refusal is earnable, pseudo-confidence is forbidden
- **Home:** DEC-35; DEC-52 ("Grades stay earned (§8.1)")
- **Quote:** "the record needs the FUNCTION of per-region confidence, not the number."
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C12 (d139, d156)
- **Notes:** none

### D44 · A project declares its required strength (the group's evidence bar), published prominently; a shortfall is refused at pre-flight (BELOW_PROJECT_STRENGTH) with a loud escape; no declared bar gates nothing and says so; an inquiry outside a project has no bar; an imported bar does not travel
- **Home:** DEC-17 (Bob 2026-08-01, amended 2026-08-03; D-155); DEC-45
- **Quote:** "A PROJECT WITH NO DECLARED STRENGTH GATES NOTHING, and the case says so rather than showing a blank."
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C11 (d120); C12 (d149)
- **Notes:** Per-audience relaxation is "a structural prior by role"; a threshold belongs on a RENDERING, never on RATIFICATION (AUDIENCES.md §5). "an absent bar is not a bar of zero". The word "standard" here is the evidence bar (naming clash, see D113).

### D45 · Unproven is the default for a group's claims about its own impact: impact needs cited outside documents, and impact asserted from SEQUENCE ALONE is refused; a body's non-response is a first-party fact and fully claimable
- **Home:** DEC-14 and determinations (invariant 7 turned on the group)
- **Quote:** "What is refused is impact asserted from SEQUENCE ALONE"
- **Binds:** TIME, ANALYSIS, ORG, COURTS
- **Reported by:** C11 (d114, d115)
- **Notes:** "It is our claim to have CAUSED something that is held." Bears on timelines and before/after analysis: sequence is not causation.

### D46 · A finding REPORTS and does not DECIDE: no surface may render it as impropriety; a check the record cannot yet discharge neither fires (claiming impropriety) nor stays silent (hiding an absence)
- **Home:** DEC-9 and response
- **Quote:** "a finding "REPORTS and does not DECIDE"; "no surface may render it as impropriety""
- **Binds:** LAW, COURTS, ANALYSIS, QUESTIONS
- **Reported by:** C11 (d106, d107)
- **Notes:** A "not yet checked" flag on a check that runs "would be the record misdescribing its own machinery".

### D47 · The record must never claim more than it can support: a defect that lets it overclaim is worse than a missing feature (e.g. "protected" means tamper-evident, never tamper-proof)
- **Home:** SD §1; CLAUDE.md (as cited in DEC-9); DEC-34
- **Quote:** "A defect that lets the record claim more than it can support is worse than a missing feature."
- **Binds:** all six
- **Reported by:** C1 (d34); C11 (d108); C12 (d136)
- **Notes:** none

### D48 · When the system cannot establish something it neither refuses the member's work nor goes silent: act, and say what could not be established; an unstated limit reads as completeness
- **Home:** DEC-56, DEC-57, DEC-58 (one shared ruling); REC-63; REC-54 (`EVIDENCE_INSUFFICIENT` stated as undetermined)
- **Quote:** "when the system cannot establish something, it does NOT refuse the member's work and it does NOT go silent."
- **Binds:** all six
- **Reported by:** C12 (d165, d167, d168)
- **Notes:** DEC-57 names silence "this project's primary threat model, an overclaim arriving through omission rather than through error". DEC-56: no un-saying a verification; the state and the finding disagree on purpose and must be legible. DEC-58's would-be exception ("numbers come from measurement, never from the surface") was retired in code (REC-57/UI-41), so the rule stands unamended.

### D49 · Never silently do less (the D-106 class): a case without PDF renderings says it is import-only; an installer that cannot meet a requirement refuses to complete honestly rather than install something degraded
- **Home:** DEC-41; DEC-42; D-106
- **Quote:** "it is a published case that silently does less — the D-106 class"
- **Binds:** all six
- **Reported by:** C12 (d145, d146)
- **Notes:** none

### D50 · Honest null: a writer that cannot see the substrate writes the locator as null rather than guessing; an invented value is a claim nobody can check
- **Home:** TAD §8.4
- **Quote:** "an invented one is a claim nobody can check"
- **Binds:** ANALYSIS, QUESTIONS, LAW, COURTS
- **Reported by:** C10 (d75)
- **Notes:** none

### D51 · Mechanical Verification Law: one check codebase, two call sites; two ops must not answer one fact differently and one rule must not have three spellings
- **Home:** TAD §10.2; OLD §6 (mirror-and-drift; REC-110)
- **Quote:** "One check codebase, two call sites; divergence between gate and checker is itself a defect"
- **Binds:** ANALYSIS, QUESTIONS, LAW
- **Reported by:** C10 (d69, d74)
- **Notes:** OLD: "An undocumented change of mind on a disclosure question is the thing REC-110 existed to prevent".

### D52 · A guarantee the store states must be enforced by something the store controls; a gap between what the code enforces and what the record says about itself is the failure mode the project refuses
- **Home:** TAD §10.11; DEC-52 (L751–753)
- **Quote:** "the gap between what the code enforces and what the record says about itself is the failure mode this project is built to refuse."
- **Binds:** all six
- **Reported by:** C10 (d76); C12 (d155, d158)
- **Notes:** none

### D53 · Regrade is a member capability
- **Home:** DEC-46 (c), 2026-08-04 (MILESTONES M4)
- **Quote:** "REGRADE IS A MEMBER CAPABILITY"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C1 (d54)
- **Notes:** none

## Counts and disclosure

### D54 · A COUNT is a disclosure of existence
- **Home:** OLD §6 (BOB #15)
- **Quote:** "a COUNT is a disclosure of existence"
- **Binds:** ANALYSIS, QUESTIONS, ORG
- **Reported by:** C10 (d70)
- **Notes:** none

### D55 · A member not invited to something learns one bit (that their item participates in something invisible), never its id, title, state or count
- **Home:** DEC-36 (reconciling D-15 with DEC-16)
- **Quote:** "The member learns that their item participates in something not visible to them, and nothing else"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C12 (d140)
- **Notes:** none

### D56 · One answer for absent and invisible: an outsider asking about a plan the group holds is answered as for one that does not exist
- **Home:** action-plans R22, R25 (`standards` R17 form); DEC-25
- **Quote:** "one answer for absent and invisible plans"
- **Binds:** QUESTIONS, LAW, ANALYSIS
- **Reported by:** C13 (d220, d224)
- **Notes:** none

### D57 · A refusal does not say which cause applied, to prevent role enumeration; only a salted derivation is stored
- **Home:** DEC-49 (the gate's two security sentences)
- **Quote:** "refusal won't say which cause, to prevent role enumeration"
- **Binds:** QUESTIONS
- **Reported by:** C12 (d159)
- **Notes:** none

### D58 · Surface it all: the internal metadata of PUBLIC records is evidentiary (extracted, projected, indexed, searchable); restricted material (statutory redactions, member-origin, confidential source) is not settled and is deferred
- **Home:** DEC-5 (Bob 2026-08-01); DEC-11 (closed as duplicate); D-124 (deferred with a trigger)
- **Quote:** "Scope is PUBLIC records — restricted material is D-124, deferred with a trigger."
- **Binds:** ANALYSIS, LAW, COURTS, QUESTIONS
- **Reported by:** C11 (d101, d109)
- **Notes:** DEC-11 was raised as "effects on people outside the project ... the D-77 / invariant-7 neighbourhood" (see D64).

### D59 · Observation log: row-whole withholding is fail-closed (REC-103), stated as in conflict with the `purged` annotation after a per-bundle purge; a `subject NOT NULL`/PRESENT conflict was resolved conservatively to `unstated`
- **Home:** OLD Incomplete l.56, l.66; REC-103; D-366
- **Quote:** "the conflict is stated, not resolved."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C10 (d71, d72)
- **Notes:** none

## People and privacy

### D60 · An action's addressee is an office (by role and body), never a private individual; an action asserting a breach is addressed to an office
- **Home:** Actions R9 (D1); AC §4 rule 6 ("Requirement 6"); planning skill R31–R33; action-design PATH §3
- **Quote:** "never a private individual (Requirement 6). An action asserting a breach is addressed to an office."
- **Binds:** ORG, LAW, COURTS, QUESTIONS
- **Reported by:** C1 (d47); C13 (d191, d213, d229)
- **Notes:** Brief correction: this is Actions R9 and the personal-data rules, not a Declared Bias safeguard.

### D61 · Open residual: a bare `scrutiny` bias statement naming a NATURAL PERSON with no citations is admitted; doctrine about named individuals is Bob's, triggered by the first such statement challenged as a verdict
- **Home:** DEC-6 (residual, OPEN)
- **Quote:** "Doctrine about named individuals is Bob's."
- **Binds:** ORG, QUESTIONS
- **Reported by:** C11 (d103)
- **Notes:** none

### D62 · Member search history stays out of the record (it would be reachable by legal process); conservative because reversible
- **Home:** OLD §4.6
- **Quote:** "member search history stays out of the record (reachable by legal process)."
- **Binds:** QUESTIONS
- **Reported by:** C10 (d68)
- **Notes:** none

### D63 · Public stops at a private individual's personal site: AI discovery is scoped to areas anybody can go through
- **Home:** DEC-47 (conduct, build-time)
- **Quote:** "WHAT IS AUTHORISED IS SCOPED BY "AREAS THAT ANYBODY CAN GO THROUGH.""
- **Binds:** ORG, QUESTIONS
- **Reported by:** C12 (d161)
- **Notes:** none

### D64 · Personal data of people outside the project falls under D-77 and invariant 7 (raised under DEC-11)
- **Home:** D-77; invariant 7 (as cited by DEC-11)
- **Quote:** "effects on people outside the project ... the D-77 / invariant-7 neighbourhood"
- **Binds:** ORG, QUESTIONS
- **Reported by:** C11 (d109)
- **Notes:** Brief correction: the private-individual rule lives in actions R9 and the personal-data rules (D-77, invariant 7).

## Relations and traversal

### D65 · A declared relation is constitutive, not evidentiary, and sits outside the connection grade
- **Home:** CON Step 4 (citing Declared Bias safeguard 4); entities R26 and CF §13 (brief correction)
- **Quote:** "A declared relation is constitutive rather than evidentiary and sits outside the connection grade"
- **Binds:** ORG, LAW, COURTS, QUESTIONS
- **Reported by:** C10 (d88)
- **Notes:** Brief correction: "constitutive, never traversed" is entities R26 / CF §13, while DB safeguard 4 says relations are declared, justified and citable and mechanical equivalence extends exactly as far as the registry declares. DEC-52 lets a machine be the one who constitutes a relation (D8).

### D66 · Declared bias is a DISCLOSURE construct bound by the malformedness rule (it may raise scrutiny, constrain inference and assert evidenced patterns, never issue a verdict), a citation requirement on patterns, strictest-wins with LOCKED statements, loud review of a new subject, and the group as backstop; the rule binds the machine as it binds a member
- **Home:** DEC-6; TAD Declared bias; DEC-54 (L1095–1102); DR Addendum
- **Quote:** "declared bias may raise scrutiny, constrain inference, and assert evidenced patterns, and may never issue verdicts"
- **Binds:** ORG, QUESTIONS, ANALYSIS
- **Reported by:** C10 (d78); C11 (d102); C12 (d163)
- **Notes:** DEC-6: safeguard 4's argument "is about registry-versus-free-text and about declared relations — not about a closed kind list"; corrected a subject-kind defect (anatomy "source, institution, office, or TOPIC" vs safeguard 4 "sources, institutions, offices and MOVEMENTS"). DEC-54: "the construct that fights undeclared distortion is held to a higher standard than the distortion."

### D67 · Declared bias is a CLOSED SET of three kinds (scrutiny, inference, pattern) and discloses, refusing nothing (only a hunch blocks); a standard of evidence is a BAR that gates; filing one as the other inverts its mechanics
- **Home:** DEC-54
- **Quote:** "File a bar as bias and it stops gating; file bias as a bar and it starts refusing."
- **Binds:** ANALYSIS, LAW
- **Reported by:** C12 (d162)
- **Notes:** none

### D68 · No BIO process may consult an undeclared lens
- **Home:** DR Addendum
- **Quote:** "no BIO process may consult an undeclared lens."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C1 (d23)
- **Notes:** none

### D69 · Notices go to every ancestor with one shared resolution (the event is the unit of state, one state and N homes); the walk is bounded: the basis graph is a DAG enforced at write and an exhausted walk says the ancestor set is undetermined
- **Home:** DEC-16 (Bob 2026-08-02); R3 depth bound
- **Quote:** "an exhausted walk must SAY the ancestor set is undetermined rather than silently notifying a truncated set"
- **Binds:** QUESTIONS, TIME, ANALYSIS
- **Reported by:** C11 (d118)
- **Notes:** "NOTHING VANISHES SILENTLY, so 'not presented' is not deletion"; an act that changes the record is itself an event. The only graph walk the doctrine names, and it walks basis legs, not declared relations.

### D70 · Focus, finding and case collapsed into one recursive type, the INQUIRY, whose basis legs may point at other inquiries
- **Home:** DEC-72 (Bob 2026-08-01); D-127
- **Quote:** "Focus collapsed with finding and case into the INQUIRY (Bob 2026-08-01; DEC-72)."
- **Binds:** COURTS, ANALYSIS, QUESTIONS
- **Reported by:** C1 (d8); C11 (d119)
- **Notes:** none

### D71 · No centrality or graph-density measures over the evidence graph
- **Home:** PS VIOLATE 1–10
- **Quote:** "no centrality/graph density"
- **Binds:** ANALYSIS, ORG
- **Reported by:** C10 (d87)
- **Notes:** none

## Jurisdiction-free product

### D72 · Jurisdiction lives in data: no place, law, venue or template wording in product code or a module's behaviour; local knowledge lives only in jurisdiction profiles; tests run against the test profile
- **Home:** build/layers.md "No jurisdiction in the product"; AC §4 rule 11; DR §15; filing-templates R18; action-plans R28
- **Quote:** "Jurisdiction lives in data. … a missing fact reads undetermined, never a default (build/layers.md, 'No jurisdiction in the product')."
- **Binds:** all six
- **Reported by:** C1 (d19, d48); C13 (d187, d203, d220)
- **Notes:** RM App A/B name officials and California law: the mission text is example, the doctrine keeps such content in data/profiles.

### D73 · Every profile fact is sourced to a primary page with capture sha256 and retrieval date; web search only locates primary pages; secondary or other-publisher sources are never a source
- **Home:** research-oakland-calendar header and M-NEW-3/5; filing-templates draft §2
- **Quote:** "the secondary site is not a source"
- **Binds:** TIME, ORG, LAW
- **Reported by:** C13 (d182, d183, d200)
- **Notes:** Proposed entries are `M-NEW-<n>`; BOB assigns real `M-<n>` numbers when filing.

### D74 · A member's local correction governs that instance only, marked with who corrected it and when, and is reported so the profile can be fixed
- **Home:** K921 Q6
- **Quote:** "marked with who corrected it and when, and it is reported to us so we can fix the profile."
- **Binds:** TIME, ORG, LAW
- **Reported by:** C13 (d204)
- **Notes:** none

### D75 · Holidays and office hours of a jurisdiction may be researched and supplied, with a process for confirming them
- **Home:** K903 (6) (Bob)
- **Quote:** "You can research and provide holidays and office hours of a jurisdiction (with a process for confirming them)."
- **Binds:** TIME, ORG
- **Reported by:** C13 (d198)
- **Notes:** none

### D76 · The system works identically for 1 group or 1,000 groups, unmodified; fully distributed, no single point of failure
- **Home:** RM §12; TAD R1, R2, R14
- **Quote:** "The system works identically whether there is 1 group or 1,000 groups."
- **Binds:** all six
- **Reported by:** C1 (d18); C10 (d73)
- **Notes:** none

### D77 · The product is sovereign instances: per-instance self-sufficiency has doctrine weight; anything every instance must fund or hold as a second vendor is a distribution liability
- **Home:** DEC-35; DEC-42 (Workers Paid $5/month a requirement, verified by the installer)
- **Quote:** "the product is SOVEREIGN instances"
- **Binds:** all six
- **Reported by:** C12 (d138, d146)
- **Notes:** DEC-42 corrects the premise, not the doctrine ("$0/month plus a card becomes $5/month plus a card"); "THE RULING RESTS ON A MEASURED INVENTORY, NOT ON WANTING THE FEATURE".

### D78 · The distribution model IS the product: a group's evidence never transits a server we run, and a stranger can verify without the instance's cooperation
- **Home:** DIST §1, §2
- **Quote:** "the distribution model IS the product"
- **Binds:** ANALYSIS, COURTS, QUESTIONS
- **Reported by:** C10 (d84)
- **Notes:** none

### D79 · Any well-formed doctrine pack is accepted, including one this repository never wrote; a group may author its own
- **Home:** DEC-66 (session BOB under Bob's standing delegation)
- **Quote:** "nothing stops that group authoring its own doctrine pack"
- **Binds:** LAW, ANALYSIS
- **Reported by:** C12 (d173)
- **Notes:** none

### D80 · Architecture and advice to groups are vendor-neutral: no Google Drive or Apps Script; multiple platforms
- **Home:** DEC-67; Design Requirements R9 (platforms — not Actions R9)
- **Quote:** "Neither Google Drive nor App Scripts are a part of the current architecture. Period."
- **Binds:** ANALYSIS
- **Reported by:** C12 (d176)
- **Notes:** Reinforces vendor/jurisdiction-neutral product text; relevant to "spreadsheets as a working medium" (ANALYSIS).

### D81 · No canonical source of truth: each group independently evaluates and accepts or rejects other groups' work; the protocol is the authority
- **Home:** DR §5; DR §1
- **Quote:** "No canonical source of truth. Each group independently evaluates and accepts or rejects other groups' work products."
- **Binds:** COURTS, LAW, ORG
- **Reported by:** C1 (d21, d22)
- **Notes:** none

## Layer order and module size

### D82 · The build's numbering governs: Action is layer 9 (the Functional Architecture's "Layer 3: Action" is the functional layer); System Design's one-way dependency narrative omits Action
- **Home:** AC §5 row 14; SD §4 (narrative and 14-class diagram)
- **Quote:** "the build's numbering governs: Action is layer 9"
- **Binds:** LAW, TIME, ANALYSIS, ORG
- **Reported by:** C1 (d41, d50)
- **Notes:** SD §4 order: membership → capture → record → content → meaning → bias → inquiry → retrieval → assistant → surfaces → publication → distribution/operations.

### D83 · Layer order (P4) forces inversions: an earlier module offers a registration hook that a later module fills (e.g. ai-runs cannot read plans itself)
- **Home:** ai-runs R47 (planning-skill draft)
- **Quote:** "the layer order forbids `ai-runs` reading plans itself"
- **Binds:** QUESTIONS, TIME, LAW
- **Reported by:** C13 (d195)
- **Notes:** none

### D84 · `local-facts` and `filing-templates` join layer 9 (local-facts first, before `standards`); `jurisdictions` stays layer 1 and pure data
- **Home:** K921 Q9 (Bob's yes, T21)
- **Quote:** "`filing-templates` and `local-facts` join layer 9 in T21 (architecture, Bob's yes to Q9)"
- **Binds:** TIME, LAW, ORG
- **Reported by:** C13 (d205)
- **Notes:** none

### D85 · `action-plans` sits last in layer 9 after `escalation` because it reads every layer-9 module; adding it was ruled BOB's ("a technical detail")
- **Home:** action-plans Status, Decided (Bob 2026-09-30)
- **Quote:** "placed "last in layer 9 after `escalation` since it reads every layer-9 module""
- **Binds:** LAW, TIME
- **Reported by:** C13 (d223)
- **Notes:** In tension with the brief's rule that adding a product module is Bob's, and with filing-templates' "the module split is architecture, also his" (Conflicts).

### D86 · The functional layers are concurrent, not phases (a group does layer 1, 2 and 3 work at once); build sequencing put the UI before the analysis layer, and the case-making rung (M9) depends on no substrate milestone
- **Home:** FA three layers; UI-KICKOFF history (2026-07-27); MILESTONES L513–542
- **Quote:** "A group in the Investigate phase is doing Layer 1 work …, Layer 2 work (analyzing what the data shows), and potentially Layer 3 work … simultaneously."
- **Binds:** ANALYSIS, LAW, TIME
- **Reported by:** C1 (d33, d57, d60)
- **Notes:** UK: "Layer 1 the foundation (done enough), LAYER 3 THE UI IS NEXT, and Layer 2 the analysis layer fills in afterward across all three."

### D87 · P17: a requirement's meaning, the UX and the module split (architecture) are Bob's; BOB recommends and decides lower-level matters; research surfaces rulings, it does not decide them
- **Home:** P17, P5; planning-skill and filing-templates drafts; action-design deltas status; research-oakland-calendar Rulings
- **Quote:** "the requirements and UX are his (P5, P17); the module split is architecture, also his, with BOB's recommendation."
- **Binds:** all six
- **Reported by:** C13 (d186, d189, d197, d226)
- **Notes:** Deltas: items marked **Bob** change a layer contract, module list or member vocabulary; items marked **BOB** are BOB's.

### D88 · The run vocabulary is held by `run-rules` (K617); the planning skill rests on K590, K597, K600, K608, K613 (3) and DEC-24 rules 1–2
- **Home:** K617; K590 (D2, D4; rulings 2, 3, 6, 8, 10); K597; K600; K608; K613 (3); DEC-24 rules 1–2 (planning-skill draft header, §2)
- **Quote:** "K617 (run-rules holds run vocabulary)"
- **Binds:** QUESTIONS, TIME
- **Reported by:** C13 (d190)
- **Notes:** none

## Time

### D89 · The group's own missed checkpoint is never a finding about the government
- **Home:** action-plans R23; action-design PATH §2 step 8, §3; UX-ANSWERS OQ-25
- **Quote:** "the group's own missed checkpoint is never a finding about the government."
- **Binds:** TIME, COURTS, LAW
- **Reported by:** C13 (d211, d213, d216, d220)
- **Notes:** none

### D90 · Nothing is deleted: records are append-only and declared to purge; deletion of cited material is never silent; nothing leaves the record
- **Home:** K23; filing-templates R17; action-plans R27; local-facts R5; TAD §3; DEC-29
- **Quote:** "Nothing is deleted ... append-only and declared to purge (K23)."
- **Binds:** all six
- **Reported by:** C10 (d82); C11 (d131); C13 (d199, d202, d220)
- **Notes:** TAD §3: bundles are accretive and deletion cascades — "deletion of cited material is never silent".

### D91 · A template's prior versions read `updated` (not superseded or retired); `retired` only withdraws a whole template
- **Home:** K924
- **Quote:** "prior versions read `updated` (not superseded/retired)"
- **Binds:** LAW, TIME
- **Reported by:** C13 (d206)
- **Notes:** none

### D92 · `divided` is a terminal STATE meaning the question itself was malformed; it corrects forward and is never undone; one authored reason per division, which cannot do severance's work
- **Home:** DEC-28; DEC-29
- **Quote:** "un-dividing would be the record changing its mind in silence"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C11 (d130, d131)
- **Notes:** none

## Law and venues

### D93 · Templates (legal wording) need a formalised authoring, approval and attribution process, unlike researched local facts
- **Home:** K903 (6) (Bob)
- **Quote:** "I think that templates need a more formalized authoring, approval, and attribution process."
- **Binds:** LAW, COURTS
- **Reported by:** C13 (d198)
- **Notes:** none

### D94 · A review never carries over to text it did not read; the approver is not the version's sole author
- **Home:** filing-templates draft §1
- **Quote:** "reviews never carry over to text they did not read"
- **Binds:** LAW
- **Reported by:** C13 (d201)
- **Notes:** none

### D95 · No machine-invented legal text is filed without member adoption
- **Home:** K613 (3); action-design deltas §3
- **Quote:** "no machine-invented legal text filed without member adoption."
- **Binds:** LAW, COURTS, QUESTIONS
- **Reported by:** C13 (d190, d230)
- **Notes:** none

### D96 · Layer 9 contract: an action rests on the record; one asserting a breach rests on a published finding and a standard held in the record; the AI proposes and prepares, never files or sends; every deadline names the statute, order or commitment it comes from
- **Home:** build/layers.md layer 9 (new contract, action-design deltas §1: rulings 1, 5, 10, D1)
- **Quote:** "new layer 9 contract (rulings 1, 5, 10, D1), quoted under LAW."
- **Binds:** LAW, TIME, COURTS, ORG
- **Reported by:** C13 (d227)
- **Notes:** Contract text from constructs-brief.md; the C13 bullet points to its LAW section for the quotation.

### D97 · A breach assertion on a hypothetical (unestablished) subject is refused by default; an override with a stated reason labels everything that rests on it "rests on an unestablished premise" and is disclosed
- **Home:** Bob 2026-09-30; actions R8, R24 (action-design deltas §2–3)
- **Quote:** "breach assertion on a hypothetical subject refused by default"
- **Binds:** LAW, COURTS
- **Reported by:** C13 (d212, d228)
- **Notes:** none

### D98 · Action plans are not project management: no cost, budget, assignee, hours, score or priority is held or shown; a plan is never published
- **Home:** action-plans Purpose, R23–R28; action-design PATH §3
- **Quote:** "It is not a project-management system: it holds no costs, assignees or hours. It is never published."
- **Binds:** TIME, ANALYSIS
- **Reported by:** C1 (d46); C13 (d213, d219, d220)
- **Notes:** none

### D99 · Never prefill: nothing preselected unseen, no default tier, unticked options stay undecided, an exclusion or bias statement is authored by its author, an import never authors an objective or bias statement for the member
- **Home:** IC ("nothing prefilled"); DEC-77; PS VIOLATE (invariant 7); DEC-45/46; DEC-46 (2); action-design PATH §2–3
- **Quote:** "Unticked options stay undecided, and the page never asks the member to decide them."
- **Binds:** all six
- **Reported by:** C1 (d39, d55); C10 (d87); C12 (d149, d152); C13 (d210, d213, d222)
- **Notes:** DEC-45: "The argument is not convenience, it is whose words they are." Extended to capability by DEC-55 (D9) and to standards by DEC-54 (D16).

## Publication and reproducibility

### D100 · Editions accrete: edition 2 joins edition 1; reopening does not unpublish; the inquiry's state and its publication history are two records; revising is not dividing; nothing recomputes a strength for an earlier edition
- **Home:** DEC-12
- **Quote:** "edition 2 does not overwrite edition 1, it joins it"
- **Binds:** TIME, COURTS, ANALYSIS
- **Reported by:** C11 (d112)
- **Notes:** `PUBLISHED_CANNOT_DIVIDE`; exclusion statement authored fresh per edition (C-21.1 byte-check).

### D101 · Publishing is an irreversible act, perhaps the only one; below it, attested acts cannot be undone SILENTLY; publishing is not a toggle
- **Home:** DEC-19 (corrected in name); PS VIOLATE
- **Quote:** "PUBLISHING IS AN IRREVERSIBLE ACT, and it may be the only one"
- **Binds:** COURTS, TIME
- **Reported by:** C10 (d87); C11 (d121)
- **Notes:** none

### D102 · Qualifiers travel inside the artifact on every page ("brazening"): declared bias and both threshold floors; a page separated from its document still names what it is
- **Home:** DEC-34 (H4)
- **Quote:** "A page separated from its document still names what it is."
- **Binds:** ANALYSIS, COURTS
- **Reported by:** C12 (d137)
- **Notes:** none

### D103 · The case renders whole, always; a reader's bar is the reader's and a filtered rendering states its filter; the record never names a reader's purpose (the threshold-stance construct removed)
- **Home:** DEC-40 det. 1–4; UI-27 (correcting UI-18)
- **Quote:** "THE CASE RENDERS WHOLE, ALWAYS"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C12 (d142, d143, d144)
- **Notes:** "it is the record telling a reader what they are doing, which is the inversion this project exists to refuse."

### D104 · The PDF is a rendering, never the authority: the signed container governs and a disagreeing rendering loses; a case without renderings is import-only and says so
- **Home:** DEC-41
- **Quote:** "A rendering that disagrees with the container loses."
- **Binds:** ANALYSIS, COURTS
- **Reported by:** C12 (d145)
- **Notes:** none

### D105 · A case is a container over one or more findings scoped to the project's question: the finding is the unit of truth, the case the unit of publication; no super-conclusion; each finding holds one proposition with one falsifier
- **Home:** DEC-44 (operative); DEC-32 (falsifier-count test); DEC-72; MILESTONES M10
- **Quote:** "The FINDING stays the unit of truth; the CASE becomes the unit of PUBLICATION."
- **Binds:** COURTS, ANALYSIS, LAW
- **Reported by:** C1 (d56); C12 (d147, d148)
- **Notes:** MS M10: a case is a production of a project; "at least one load-bearing member required"; "A finding serves many cases across projects". Corrected the built model (store.mjs:3539 published one inquiry).

### D106 · An imported published case arrives as findings, re-graded in the new context with no inherited standing; signature, edition and hash are checkable facts about it, not a grade; it lands in a new project per distinct source bias
- **Home:** DEC-40 det. 4 (corrected by DEC-44); DEC-45; DEC-46 (3) (overruling DEC-45 det. 2); MILESTONES M6
- **Quote:** "A published case imported elsewhere is a FINDING and gets no inherited standing"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C1 (d55); C12 (d142, d143, d149, d153)
- **Notes:** DEC-46 (3): "The manifest preserves the lens as a RECORD and does not make it USABLE"; association with an existing project is a separate authored act where regrade fires.

### D107 · A source's bias is PRESERVED by the bias manifest that travels with the case; the lens APPLIED going forward is the importing instance's plus any project layer
- **Home:** DEC-45 (L579–593)
- **Quote:** "PRESERVED and APPLIED are two different things, and only one of them needs a project."
- **Binds:** ANALYSIS
- **Reported by:** C12 (d150)
- **Notes:** none

### D108 · Bias is public and accompanies every published case: the computed manifest is stamped, the acknowledgement is authored by the publisher fresh per edition and rendered as an element of the case, and a project's own bias is visible on its surfaces
- **Home:** DEC-20; DEC-46 (2), (5); DEC-59; REC-47 (built); D-189
- **Quote:** "Bias is public and accompanies every published case produced under that bias."
- **Binds:** ANALYSIS, COURTS, QUESTIONS
- **Reported by:** C1 (d25); C11 (d124); C12 (d152, d154, d166)
- **Notes:** DEC-59: DEC-34's per-page "Declared bias" is computed from HUNCH legs, "a different fact" from the authored acknowledgement. DEC-46 (5): bias bundles are unbuilt (D-84, `object_type: bias` absent).

### D109 · Another group's case is confirmed by recreation; recreating is not endorsing
- **Home:** DEC-112
- **Quote:** "Recreating is not endorsing."
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C1 (d17)
- **Notes:** none

### D110 · A deploy verified is not a build serving: establish which build answered before believing either
- **Home:** DIST §6 (D-108)
- **Quote:** "A deploy verified is not a build serving"
- **Binds:** ANALYSIS
- **Reported by:** C10 (d85)
- **Notes:** none

### D111 · Contacting the subject before publication: the gate is the group's declared, justified position on contact carried in the artifact, never that contact happened or the answer was favourable; an ask carries specifics; what comes back is captured, not summarised, and gets no veto and no omission
- **Home:** DEC-13 (filed as declared bias, same malformedness rule)
- **Quote:** "THE GATE AT RATIFICATION IS THAT THE POSITION IS DECLARED AND JUSTIFIED — NEVER THAT THE ANSWER WAS FAVOURABLE, and never that contact happened."
- **Binds:** ORG, COURTS, QUESTIONS
- **Reported by:** C11 (d113)
- **Notes:** Cites DEC-1's hostile City as the tipping-off reason; `research/AUDIENCES.md` deliberately not edited (D-153).

### D112 · Nothing leaves by a system path; the instance transmits nothing (the media receives what a member sends)
- **Home:** AC §4 rule 7; action-design UX-ANSWERS (audiences)
- **Quote:** "Nothing leaves by a system path. The instance transmits nothing."
- **Binds:** LAW, COURTS, ORG, QUESTIONS
- **Reported by:** C1 (d46); C13 (d217)
- **Notes:** none

## Naming clashes

### D113 · "Standard" is a taken word: it can mean the group's evidence bar (DEC-17/DEC-54 `required_strength`) as well as a legal norm held in `standards`
- **Home:** DEC-54; DEC-17; constructs-brief corrections
- **Quote:** "a standard of evidence is a BAR (DEC-17 `required_strength{capture, connection}`)"
- **Binds:** LAW, ANALYSIS
- **Reported by:** C12 (d162)
- **Notes:** none

### D114 · "Obligation" is a taken word: in NOTIFICATIONS/queue-producers an OBLIGATION is a member's queue item (`template-review-requested`, `local-fact-due`), while DEC-107 reserves it for a public body's duty
- **Home:** queue-producers R20–R21; NOTIFICATIONS; DEC-107 (per brief)
- **Quote:** ""OBLIGATIONs" here are member queue items (`template-review-requested`, `local-fact-due`)"
- **Binds:** ORG, LAW, TIME
- **Reported by:** C13 (d207)
- **Notes:** none

## Other

### D115 · Canon authority order: Roadmap §§1–12 current doctrine, §§13–15 history; the Design Requirements govern on conflict; Technical Architecture on technology; State Rules on the data store
- **Home:** RM header
- **Quote:** "the Design Requirements govern it on conflict"
- **Binds:** all six
- **Reported by:** C1 (d7)
- **Notes:** none

### D116 · The system fails if any requirement is violated
- **Home:** DR preamble
- **Quote:** "The system fails if any requirement is violated."
- **Binds:** all six
- **Reported by:** C1 (d20)
- **Notes:** none

### D117 · Designed for active opposition (disrupt, co-opt, discredit, infiltrate, legally harass): hope for good faith, prepare for opposition; every plan is checked for a branch answering a hostile response; access strategy must survive a hostile government
- **Home:** DR §13; TAD R13; AC §4 rule 12 (Bob 2026-09-30); DEC-1
- **Quote:** "Hope for good faith; prepare for opposition"
- **Binds:** all six
- **Reported by:** C1 (d27, d49); C10 (d73); C11 (d96)
- **Notes:** DEC-1: allowlist CLOSED; BIO "still does not disguise its requests" (SOURCE-ACCESS.md).

### D118 · The system is subject to the same evidence-based evolution it demands of its work products
- **Home:** DR §15
- **Quote:** "The system is subject to the same evidence-based evolution it demands of its work products."
- **Binds:** all six
- **Reported by:** C1 (d28)
- **Notes:** none

### D119 · Evenhandedness (invariant 7): compliance is recorded as carefully as noncompliance; policy preference must not colour compliance or significance judgements; a finding that cuts against the goal takes exactly the same path
- **Home:** FA L2 Fn4 and outputs; AC §2, rule 4; CON Step 8b (invariant 7)
- **Quote:** "Compliance is recorded as carefully as noncompliance."
- **Binds:** LAW, ANALYSIS, COURTS, ORG
- **Reported by:** C1 (d30, d31, d45); C10 (d89)
- **Notes:** AC rule 4: "recognition and success stories are actions." FA: OP1 is "most tested at significance".

### D120 · A measure never edits the statement it measures, and its scope is registry-defined rather than hand-picked
- **Home:** CON Step 8a
- **Quote:** "The measure never edits the statement and its scope is registry-defined rather than hand-picked."
- **Binds:** ANALYSIS
- **Reported by:** C10 (d90)
- **Notes:** none

### D121 · Do the work upfront; exit discovery mode; make each new surprise cheap; no step is done until something consumes its output
- **Home:** CON Step 0 (Bob 2026-07-30); CON l.45–54
- **Quote:** "we must do the work upfront in order to end up with the results we need."
- **Binds:** all six
- **Reported by:** C10 (d91, d92)
- **Notes:** none

### D122 · Accountability is built on credible facts
- **Home:** RM §4 value 3
- **Quote:** "Accountability is built on credible facts. Nothing else holds up."
- **Binds:** all six
- **Reported by:** C1 (d10)
- **Notes:** none

### D123 · Follow the evidence wherever it goes; when the evidence changes, the findings change
- **Home:** RM §5 OP4
- **Quote:** "Follow the evidence wherever it goes. When the evidence changes, the findings change."
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C1 (d11)
- **Notes:** none

### D124 · Output must be disciplined, but humans can be human
- **Home:** RM §5
- **Quote:** "civic OS OUTPUT must be disciplined, but humans can be human."
- **Binds:** QUESTIONS
- **Reported by:** C1 (d13)
- **Notes:** none

### D125 · Inform once, never nag: no severity ladder, no unread badge, no task per instance
- **Home:** DEC-69; DEC-70; DEC-10; DEC-94; K613–K615; PS VIOLATE
- **Quote:** "inform once, never nag — DEC-69"
- **Binds:** TIME, QUESTIONS
- **Reported by:** C1 (d39); C10 (d87); C13 (d216)
- **Notes:** none

### D126 · Judgement lives in acts and reasons, never in a score
- **Home:** UX-ANSWERS OQ-8, OQ-14, OQ-25
- **Quote:** "judgment in acts and reasons, never a score"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C13 (d216)
- **Notes:** none

### D127 · A capability a member does not hold is ABSENT from their interface, not present and greyed; identity is server-stamped
- **Home:** UI-KICKOFF; IC
- **Quote:** "a capability a member does not hold is ABSENT from their interface, not present and greyed"
- **Binds:** QUESTIONS
- **Reported by:** C1 (d39, d58)
- **Notes:** none

### D128 · Seven stages everywhere; the Action design replaces Case Making's action sections as the authority
- **Home:** K14; AC §5 rows 3, 13; AC §6 canon edits
- **Quote:** "seven stages everywhere (K14)"
- **Binds:** COURTS, LAW, TIME
- **Reported by:** C1 (d51, d52)
- **Notes:** none

### D129 · Self-correction stays in the record: a wrong reassurance is worth more as a record than as a deletion; reassuring in prose about something unmeasured is a named failure
- **Home:** DEC-63; DEC-42
- **Quote:** "a wrong reassurance about a live gate is worth more as a record than as a deletion"
- **Binds:** all six
- **Reported by:** C12 (d146, d175)
- **Notes:** none

### D130 · No "mark all as done"; a technical complication is never presented as a choice or a retry spinner
- **Home:** PS VIOLATE 1–10
- **Quote:** "a technical complication is never a choice or retry spinner."
- **Binds:** QUESTIONS, TIME
- **Reported by:** C10 (d87)
- **Notes:** none

### D131 · No ballot on concluding and author-scoped division: de-escalation must never require permission from someone whose incentive may run the other way
- **Home:** DEC-30
- **Quote:** "de-escalation must never require permission from someone whose incentive may run the other way"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C11 (d132)
- **Notes:** none

### D132 · When Bob closes an open question on the substrate page, the page is updated in the same change that records the ruling
- **Home:** K438
- **Quote:** "the page is updated in the same change that records the ruling."
- **Binds:** QUESTIONS
- **Reported by:** C13 (d215)
- **Notes:** none

### D133 · System Design §3 claims to be the single authority on design status, but its state cells are a dated snapshot (construct-status.json retired; build state is build/)
- **Home:** SD status L4 vs §3 row 16; requirements/README.md
- **Quote:** "construct-status.json is retired (requirements/README.md); the build state is build/ (layer 9)"
- **Binds:** all six
- **Reported by:** C1 (d42)
- **Notes:** none

## Conflicts

Every pair of rules or sources that disagree, as the readers recorded them, with both sides cited.

1. Hunch refusal stated vs built: DR DEC-20 states `op=publishpreflight` refuses `UNCLEARED_HUNCH` (D31); SD §3 row 7 says the publication refusal for an uncleared hunch is NOT BUILT and the op is in no OPS table (REC-15). C1 d26.
2. System Design status: SD claims §3 is "THE SINGLE AUTHORITY ON DESIGN STATUS" from construct-status.json, while its own row 16 says construct-status.json is retired and build state lives in build/ (D133). C1 d42.
3. Observation log, row-whole withholding (§6) vs the `purged` annotation (§7) after a per-bundle purge: fail-closed taken (REC-103), conflict stated not resolved (D59). C10 d71. Also §3 `subject NOT NULL` vs §4.4's fold, resolved to `unstated` (D-366). C10 d72.
4. TAD (July 2026) makes soundness "machine-checkable" and has an AI "re-derive the conclusion" and an agent "record whether it holds" (TAD §5 l.532–544, §6 l.648–650) vs the layer-6 contract "the AI ... never attests or concludes" (D3); consistent only if read as an AI proposal a member decides. C10 d83.
5. Machine credentials and constitutive acts: DEC-52 lets a machine declare relations, resolve references and thread progressions (D8), moving DEC-24's boundary and reversing the field comments that called these "a member's constitutive statement"; any reading that relations are member-only (D65) must yield to DEC-52. C12 d155–157.
6. Who adds a product module: the brief (P4/P6) and filing-templates draft ("the module split is architecture, also his", d197) make it Bob's; the action-plans ruling records adding `action-plans` as BOB's, Bob calling it "a technical detail" (d223) (D85, D87).
7. Transitive trust: TAD §5 "no transitive trust" (original) vs AUTHORITY-AND-TRUST ruling 2026-07-30 "accepted so long as it is disclosed" — resolved by the revision (D37). C1 d9, C10 d80.
8. Import landing: DEC-45 det. 2 (import may join an existing project) overruled by DEC-46 (3) (a new project per distinct source bias) (D106). C12 d149, d153; C1 d55.
9. Case model: the built store published ONE inquiry as a case (store.mjs:3539) vs DEC-44's container over one or more findings; the build was corrected to DEC-44 (D105). C12 d147.
10. Declared-bias subject kinds: the anatomy said "source, institution, office, or TOPIC", safeguard 4 "sources, institutions, offices and MOVEMENTS"; DEC-6 corrected the defect and held the kind list open (D66). C11 d102.

## Coverage check

- Bullets in `digest/DOCTRINE.md`: 1055 (lines beginning `- `, top-level or nested), of which 205 lie in the ranges read so far.
- Register entries: 133.
- Every bullet in the ranges read maps to at least one entry (its line appears in that entry's *Reported by*); a bullet carrying several rules is cited under each. No bullet was dropped: exact duplicates are merged into the entry they repeat and listed there by reader id.
- Bullets per reader: C1 54, C10 29, C11 37, C12 42, C13 43.
