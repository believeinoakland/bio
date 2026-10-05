# Doctrine register (de-duplicated from digest/DOCTRINE.md)

Every distinct rule, principle or ruling the phase-1 readers recorded that constrains how time, organisations, law, court cases, analysis or the assistant may be built, merged across readers. Written by the X-REGISTER worker (BOB #110 study, 2026-10-05) from a full, chunked read of `digest/DOCTRINE.md` (and `digest/CROSS.md` for the companion register).

**Notation.** `d123` = line 123 of `digest/DOCTRINE.md` (the bullet that reports the rule; open it to reach the reader's source and line). Reader ids (C1–C13, D1, D2, M1–M5) are phase-1 readers; reader D1/D2 are not register entries D1/D2. Constructs in *Binds*: TIME, ORGANISATIONS (ORG), LAW, COURTS, ANALYSIS, QUESTIONS (the assistant and AI roles). *Home* is where the rule lives as the readers cite it (canon §, requirement R id, DEC or K number); RM = Roadmap v5, DR = Design Requirements v2, FA = Functional Architecture v3, SD = System Design, AC = Action design (BIO_Action_v0_1), CF = Content Framework v0.10, IC = Interaction Constructs, AIR = Assistant and AI Roles, DB = Declared Bias, TAD = Technical Architecture Decisions, OLD = Observation-log design, PS = Practice survey, CON = CONSTRUCTS, MS = MILESTONES, UK = UI-KICKOFF.

**Progress (resume note).** DOCTRINE.md read: 1–230, 231–450. A resumed worker keeps every entry and continues from the first line not listed.

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
- **Home:** layer 6 contract (build/layers.md); OLD §4.4; TAD R12 (AI advisory); DEC-24 (CF App. A.1); CF C-35.10 ("the minter may never attest")
- **Quote:** "the machine may EXTRACT; the member concludes; machine work is labelled; no machine credential performs an attested act"
- **Binds:** all six
- **Reported by:** C10 (d67, d73, d83); C3 (d335, d392)
- **Notes:** none

### D4 · The machine proposes, a member adopts: nothing machine-made enters the record or a plan until a member adopts it; dismissal is reversible greying, not deletion
- **Home:** TAD §7.5; planning skill §1, R31–R33; action-plans R24
- **Quote:** "Nothing enters the plan until a member adopts it"
- **Binds:** all six
- **Reported by:** C10 (d81); C13 (d191, d220, d244); C4 (d432)
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
- **Home:** DEC-52 (closed via REC-65; carries DEC-55 det 4 / D-199.4, D-82, §8.1); sharpened by DEC-60; DEC-53 (answered 2026-08-10 resting on DEC-52)
- **Quote:** "The earlier provisional (sidebar approval as the act of record) is SUPERSEDED as a gate"
- **Binds:** ORG, LAW, COURTS, QUESTIONS
- **Reported by:** C12 (d155, d156, d157); C2 (d267, d268)
- **Notes:** Moves the DEC-24 boundary for these acts; the six fields' comments that claimed "a member's constitutive statement" were corrected to match code. `strengthBarSet` still refuses MACHINE_CANNOT_DECLARE (store.mjs:5119). Any reading that relations are member-only must be checked against this ruling (see D118). DEC-53: the machine may propose Grade A/B candidates a member accepts as ESTABLISHED in one act; `op=resolve` is the only grader. C2 flags the brief's "machine never concludes or attests" as needing DEC-52's exact scope (Conflicts).

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

### D12 · Attribution is never invented: a field whose meaning is that a member (or nobody) said something never carries a machine stamp (mint a third, undetermined state instead), an absent identity is never called a machine one, and a sweep is never attributed to a person
- **Home:** DEC-65; DB REC-207 (a sweep settles with no actor and no reason; machine credential refused by SHAPE, C-26.15)
- **Quote:** "a field that overclaims, in the direction this project ranks worst"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C12 (d172, d174); C4 (d449)
- **Notes:** Adding `none:` to MACHINE_STAMP_PREFIXES is recorded as the wrong fail-closed shortcut. Changes to a landed check go through the item that owns the files.

### D13 · No standing, scheduled or automatic AI run: every AI run is launched by a member
- **Home:** DEC-24 rule 2; AIR §7.3 ("provisional NO on standing runs"); planning skill §3 choice 1
- **Quote:** "no standing / scheduled / automatic AI run"
- **Binds:** QUESTIONS, TIME, ANALYSIS
- **Reported by:** C13 (d190, d193)
- **Notes:** none

### D14 · The machine's words never become the member's reason; words a script or AI places are a labelled draft, the member's only once kept
- **Home:** K1364; planning skill R32; DEC-120 (Bob 2026-10-02, amended 2026-10-03: a wizard step may place a LABELLED DRAFT in a field, replacing ASSISTANT-PILOT §3's no-prefill rule; the member alone presses the act's button)
- **Quote:** "the machine's words never become the member's reason (consistent with K1364 labelled draft)."
- **Binds:** QUESTIONS, LAW, COURTS
- **Reported by:** C13 (d194); C2 (d321, d322)
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
- **Notes:** "the never-prefill violation wearing a compliance badge" (see D165).

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
- **Reported by:** C11 (d111); C3 (d360)
- **Notes:** CF §12 loop rules: "A finding is a PROPOSAL, never an assertion ... Adoption is an authored, dated act"; "A deferral is recorded with its reason".

### D19 · Muting is personal; dismissing is a record act; they must never be one control (the finding stands, only that member's notification stops)
- **Home:** DEC-10 determinations
- **Quote:** "MUTING IS PERSONAL; DISMISSING IS A RECORD ACT, and they must never be one control"
- **Binds:** QUESTIONS, TIME
- **Reported by:** C11 (d110)
- **Notes:** none

### D20 · Every act runs the ACT motion: choose, see what it will refuse and why BEFORE it runs, author the reason, get a receipt; acts sit on a weight ladder reversible · reasoned (never prefilled) · terminal · attested
- **Home:** MILESTONES preamble; Interaction Constructs (ACT); action-design PATH status; DEC-87 (rung ladder); DEC-88 (banding)
- **Quote:** "see what it will refuse BEFORE it runs, author the reason, get a receipt"
- **Binds:** all six
- **Reported by:** C1 (d53); C13 (d209); C2 (d289, d290)
- **Notes:** DEC-87: reversible acts inline; reasoned acts a reason field in place; terminal and attested acts a full dialog; irreversible acts only through the ceremony (DEC-80); "Friction is kept as low as possible so the tool fades and the work stays in focus".

### D21 · The gate is at the outward act, not at the reasoning: a plan may rest on premises not yet established, shown as hunch debt; an act reaching outside the group may not be taken on them
- **Home:** DEC-26 (Bob 2026-08-03); AC §4 rule 2
- **Quote:** "the gate belongs at the ACT, not at the reasoning. A plan may rest on premises not yet established; an act reaching outside the group may not be taken on them."
- **Binds:** LAW, COURTS, TIME, ORG, ANALYSIS
- **Reported by:** C1 (d44); C11 (d128, d131); C4 (d433, d434)
- **Notes:** "THE SAFEGUARD IS LABELLING, NOT REFUSAL"; an outward act's pre-flight refuses when its step is not `established`, naming the premise and the shortfall. DEC-29 re-cites the principle. A member may pass the gate openly (AC rule 2).

### D22 · A surface may RENDER a refusal it received from the plane but may never COMPUTE one (derive nothing: codes received, never inferred); the plane is the sole authority on what states exist
- **Home:** DEC-8 (amended in wording by DEC-49); UI-KICKOFF (plane sole authority; UI SEMANTICS table); DEC-39 (the plane owns member-facing wording that claims what the record asserts); DEC-51
- **Quote:** "A surface may RENDER a refusal it received from the plane; it may never COMPUTE one."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C1 (d59); C11 (d105); C12 (d159); C2 (d265, d270)
- **Notes:** DEC-49: a surface may render an AUTHORED translation keyed on a code the plane sent; "an untranslated code FAILS THE HARNESS". Standing test: "can the surface state this refusal without holding a rule the plane also holds?"

### D23 · No narrative drafting and no generated justification by the machine; compellingness is the wrong axis
- **Home:** PS VIOLATE 1–10 (items 2–5 built as SK-3); PS §2; Case Making §4a
- **Quote:** "familiar tools optimise compellingness, "the wrong axis""
- **Binds:** QUESTIONS, ANALYSIS, COURTS
- **Reported by:** C10 (d86, d87); C4 (d414)
- **Notes:** Case Making §4a: "easy to build a supported case, hard to state an unsupported one." CM §4a: "nothing that drafts framing FOR a member — the same rule as never prefilling a justification, extended from a field to a whole argument".

### D24 · AI-driven discovery of public sources is authorised by the inquiry plus the session launch; an extra approval that adds paperwork without judgement is the empty gate the project refuses
- **Home:** DEC-47
- **Quote:** "accountability paperwork without adding judgement"
- **Binds:** QUESTIONS, LAW, COURTS, ORG
- **Reported by:** C12 (d161)
- **Notes:** none

### D25 · Context supports, never silently decides: a FACT the record holds is filled in with its source; a JUDGEMENT is recommended with its reason, labelled machine work, and accepted in one new, attributed act; nothing is silently preselected; steering is measured by acceptance rate
- **Home:** DEC-77 (Bob 2026-09-29)
- **Quote:** "a value a member never saw does not enter the record under their name."
- **Binds:** QUESTIONS, LAW, ANALYSIS, ORG
- **Reported by:** C2 (d277); C4 (d410)
- **Notes:** Narrows the member screens' reading of DEC-24. The record keeps whether the member chose unaided or accepted which recommendation (see Conflicts on UI-102). "governing laws and risk tiers are reconsidered under it separately, not changed by this ruling".

### D26 · Machine proposals are REVERSIBLE and bind nothing (`suggest`, `extractpropose`, `contradictionpropose`, `standardpropose`, `comparisonpropose`, `theorypropose`, `actionriskpropose`, `actionlawspropose`, `filingprepare`); member claims others rely on are REASONED and corrected only forward (`entitycreate`, `standarddeclare`, `standardadopt`, `consequencerecord`, `progressiondefine`, `filingsent`, `escalationopen`, `counselpacket`, `attribute`); `escalationend` and `filingapprove` are TERMINAL
- **Home:** DEC-88 (Bob 2026-09-29: 57 undetermined acts banded)
- **Quote:** "REVERSIBLE 26 (machine proposals bind nothing:"
- **Binds:** LAW, ORG, ANALYSIS, COURTS, QUESTIONS
- **Reported by:** C2 (d290)
- **Notes:** Six judgement calls carry high friction: `attribute`, `leadshare`, `entitycreate` ("a person named in the registry"), `strengthbar`, `filingapprove`, `workobjective` (lightest).

### D27 · AI output carries one shared "machine work" label, attributed to the requesting member, and keeps its origin until adopted; the member performs every act on the real surface
- **Home:** DEC-90; DEC-95; DEC-101; DEC-127; DEC-24 ("machine work is labelled")
- **Quote:** "every act is performed by the member on the real surface."
- **Binds:** QUESTIONS, ANALYSIS, LAW
- **Reported by:** C2 (d292, d296, d302, d329); C3 (d392)
- **Notes:** DEC-90 said the wizard never fills or presses a control; DEC-120 later lets a wizard step place a labelled draft (see D14).

### D28 · Relevance suggestions are labelled machine work under six guards: no notification, reason stated, dismissal memory, never during heavy acts, per-member off, acceptance rate measured
- **Home:** DEC-95 (Bob 2026-09-29)
- **Quote:** "relevance suggestions as labelled machine work under six guards"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C2 (d296)
- **Notes:** none

### D29 · Guided flows run from authored wizard scripts, with no AI and no key needed; where a key is set the assistant may plan a flow on the fly; script libraries are governed like filing templates (versioned, owner-approved, "a machine never approves", retired never deleted) and a script is refused if it tells a member what to conclude
- **Home:** DEC-120; DEC-121
- **Quote:** "scripts refused if they tell a member what to conclude"
- **Binds:** QUESTIONS, LAW
- **Reported by:** C2 (d321, d323)
- **Notes:** none

### D30 · Two voices never mixed; the voice is plain, exact, calm, honest about limits, respectful, neutral on policy and disciplined; the assistant says "I" in conversation and is "the assistant" in labels and records, never "we"
- **Home:** DEC-125 (Bob 2026-10-04; brand-and-voice §1–5, V2, V3)
- **Quote:** "assistant "I" in conversation, "the assistant" in labels and records, never "we""
- **Binds:** QUESTIONS
- **Reported by:** C2 (d327)
- **Notes:** none

### D31 · Once a member has set a tier, no machine may change it, not even back to undetermined; the machine may only propose, labelled
- **Home:** CM §2 (D-182, BOB #32)
- **Quote:** "once a member has set a tier, no machine credential may change it, not even back to `undetermined`"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C4 (d401)
- **Notes:** none

### D32 · Open: may a caller-asserted flag (the `replay` exemption) exempt a machine fence? Routed to BOB
- **Home:** CM status (D-505, D-511)
- **Quote:** "may a caller-asserted flag exempt a machine fence?"
- **Binds:** QUESTIONS
- **Reported by:** C4 (d407)
- **Notes:** none

### D33 · A checker raises into a queue and never edits; machine suggestions are candidates
- **Home:** DEC-24 rules 1 and 4 (CM §THE ACTION PLAN 5)
- **Quote:** "rule 4 a checker raises into a queue, never edits"
- **Binds:** LAW, TIME, ANALYSIS, QUESTIONS
- **Reported by:** C4 (d432)
- **Notes:** none

## Grades and undetermined

### D34 · Undetermined is a first-class answer and must be stated (never hidden, never replaced by a guess)
- **Home:** SD §1, §7; IC UNDETERMINED (display primitive); FA outputs ("Unclear", its precursor); CF §15 (BOB #31, CPDF-22: one field `undetermined: {level, why}`, D-440's shape)
- **Quote:** "undetermined is first-class and must be stated"
- **Binds:** all six
- **Reported by:** C1 (d32, d35, d39); C10 (d66); C2 (d269); C3 (d378); C4 (d412)
- **Notes:** FA's "Unclear" outcome sends work back to information-gathering. OLD §6 (BOB #33): the record never chooses between two claims it cannot tell apart; it states undetermined.

### D35 · A fact not supplied or not sourced reads undetermined, never a default and never a guess; conflicting sources leave it undetermined until a ruling or a member decides
- **Home:** AC §4 rule 11; action-plans R23–R28; filing-templates draft §2; research-oakland-calendar M-NEW-8
- **Quote:** "A fact not supplied is answered undetermined, never a default"
- **Binds:** TIME, ORG, LAW, ANALYSIS
- **Reported by:** C1 (d48); C13 (d184, d200, d220); C2 (d306)
- **Notes:** Negative findings are recorded as undetermined "so the profile does not later infer one"; "A worker never states a fact it could not source".

### D36 · A refused or silent read is UNDETERMINED, never absence
- **Home:** planning skill R51
- **Quote:** "never as absence"
- **Binds:** QUESTIONS, ANALYSIS, LAW
- **Reported by:** C13 (d192)
- **Notes:** none

### D37 · A grade tracks directness and never composes across scales
- **Home:** SD §4
- **Quote:** "grade tracks directness and never composes across scales"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C1 (d36); C4 (d412)
- **Notes:** none

### D38 · Every layer may be sparse: absence at one level is not evidence of absence at the next (the four-level search states at which level absence was found)
- **Home:** SD §4; CF Part II §14.3; CF §8.3 rule 3 (OUTSIDE THE RECORD'S REACH, never NOT FOUND)
- **Quote:** "every layer may be sparse, and absence at one level is not evidence of absence at the next (Part II §14.3)."
- **Binds:** QUESTIONS, LAW, COURTS, ANALYSIS
- **Reported by:** C1 (d36); C3 (d354)
- **Notes:** CF §8.3: "A parcel absent from a roll is NEVER "no such parcel"".

### D39 · A machine-proposed connection is a HUNCH until earned; a hunch is visible as a hunch everywhere and is never shown as a connection; `grade_source` is resolution (earned), testimony (member's signed grade D) or hunch (the only authored grade above D)
- **Home:** SD §3 row 6; DEC-15 determinations (D-154); PS VIOLATE
- **Quote:** "a machine-proposed connection is a HUNCH until earned"
- **Binds:** QUESTIONS, ANALYSIS, ORG, LAW
- **Reported by:** C1 (d37); C10 (d87); C11 (d117); C3 (d374)
- **Notes:** none

### D40 · Only an uncleared HUNCH refuses publication; ordinary bias debt is disclosed and travels with every published case; a published case must hold with every hunch removed
- **Home:** DEC-15 (Bob 2026-08-01); DEC-20 (Bob 2026-08-02; D-188); DEC-46 (1); DR Addendum; TAD Declared bias
- **Quote:** "bias debt is DISCLOSED; hunch debt is DISQUALIFYING — because a hunch inflates a GRADE and ordinary bias only frames interpretation"
- **Binds:** ANALYSIS, QUESTIONS, COURTS
- **Reported by:** C1 (d24, d26); C10 (d79); C11 (d116, d124); C12 (d151); C2 (d281, d305); C3 (d366); C4 (d434, d447)
- **Notes:** C1 records the refusal as stated but not built: SD §3 row 7 says `op=publishpreflight` is in no OPS table (REC-15) (Conflicts). D-188: say HUNCH DEBT where the rule means hunches. DEC-80 (2026-09-29) puts the uncleared-hunch refusal (case-authoring R12) into the built pre-flight in the redesign. CF §13.1: "The discriminator ... is whether the thing left unsettled makes the record CLAIM MORE THAN IT CAN SUPPORT"; measure decay does not block.

### D41 · A hunch is not an undetermined leg and must not be composed as one (R1 suspends an axis when a grade is ABSENT; a hunch is PRESENT and composes normally while open)
- **Home:** DEC-15 determinations
- **Quote:** "A HUNCH IS NOT AN `undetermined` LEG AND MUST NOT BE COMPOSED AS ONE"
- **Binds:** ANALYSIS
- **Reported by:** C11 (d117); C2 (d305)
- **Notes:** DEC-104 corrects Declared Bias's "composes normally": a hunch never lifts strength; "Hunches to clear" is a status list, never a notification (Conflicts).

### D42 · An ungraded leg is inert and named, not unrating; when every leg is ungraded the result is UNRATED
- **Home:** DEC-18 (Bob 2026-08-02), refining R1
- **Quote:** "an ungraded leg is inert and named, not unrating; all-ungraded → UNRATED"
- **Binds:** ANALYSIS
- **Reported by:** C11 (d122); C2 (d263); C4 (d411)
- **Notes:** R1 residual laundering hazard (D-159) deferred until M10 runs with a real group (`op=versionstrength`'s `ungraded[]` ratio).

### D43 · Capture and connection grades are never combined: two measurements over two populations (documents and edges)
- **Home:** DEC-21 (Bob 2026-08-02), refining R2
- **Quote:** "capture and connection grades are never combined; they are two measurements over two populations, documents and edges"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C11 (d123)
- **Notes:** none

### D44 · No single trust or confidence score, and no case-level strength composed over findings
- **Home:** DEC-92 (citing DEC-44 and the measures map DEC-82); PS VIOLATE; DEC-44
- **Quote:** "one ladder mixing who produced a thing, whether the group accepted it, and a verdict on it reads as a single trust score"
- **Binds:** ANALYSIS, QUESTIONS, ORG
- **Reported by:** C1 (d14); C10 (d87); C12 (d147); C2 (d283, d294); C4 (d446)
- **Notes:** none

### D45 · Credibility is demonstrated by the work, not by credentials, title, reputation or assertion
- **Home:** RM §5 OP5; TAD §5
- **Quote:** "Credibility is demonstrated by the work. Not by credentials, title, or assertion."
- **Binds:** ORG, COURTS, ANALYSIS
- **Reported by:** C1 (d12); C10 (d80)
- **Notes:** none

### D46 · Transitive trust is accepted so long as it is disclosed in the provenance chain; inherited trust is the fact of publication, never the credibility of the content
- **Home:** AUTHORITY-AND-TRUST.md (ruled 2026-07-30); TAD §5 (revised 2026-07-30); DEC-92
- **Quote:** "transitive trust is accepted so long as it is disclosed"
- **Binds:** ORG, COURTS, LAW
- **Reported by:** C1 (d9, d15); C10 (d80); C2 (d294, d297)
- **Notes:** TAD §5 originally said "no transitive trust"; revised 2026-07-30 to accepted-if-disclosed.

### D47 · Acceptance changes no grade; flags are disclosed, never blocked
- **Home:** DEC-96; DEC-92 ("Flagged" only from a member's recorded evaluation); DEC-96
- **Quote:** "acceptance "changes no grade"; flags "disclosed, never blocked""
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C1 (d16); C2 (d294, d297)
- **Notes:** DEC-96: a "Meets standards" mark, if it returns, "is labelled machine work and never acts as a trust level."

### D48 · Machine-read (OCR) text is never indistinguishable from publisher text: `text_source` with engine, version and per-region confidence; an OCR citation carries its image region; OCR never raises a capture grade; a low-confidence region reads undetermined; how content was extracted is its own, never-hidden fact
- **Home:** DEC-4 determinations; DEC-23; SD §7 (CPDF-10)
- **Quote:** "OCR TEXT IS DERIVED FROM PIXELS AND MUST NEVER BE INDISTINGUISHABLE FROM TEXT THE PUBLISHER WROTE."
- **Binds:** ANALYSIS, LAW, COURTS, QUESTIONS
- **Reported by:** C1 (d38); C11 (d97, d98, d126); C2 (d273); C3 (d383, d392)
- **Notes:** DEC-4 (Bob overrules "accept the limit"): image-only PDFs must be OCR'd and reach the entity axis — "A document class the record can capture and can never read is a hole an adversary can put things in". DEC-23: "Capture grade stays a property of the DOCUMENT".

### D49 · Transcription fidelity bounds the capture axis (weakest link of byte provenance and transcription) rather than minting a third grade axis; a text layer is itself an unverified transcription; the ceiling is member-attested verification against the rendered image, recorded as a chain
- **Home:** DEC-4 amendment (c) and second amendment; D-151; D-164 doctrine 5.2 (CF §14.2: attestation raises a leg to at most B; A is the record's own byte proof)
- **Quote:** "Verification supersedes the chain as the grade determinant and never as the record"
- **Binds:** ANALYSIS, LAW, COURTS
- **Reported by:** C11 (d99, d100); C2 (d274); C3 (d337, d373, d383)
- **Notes:** Attestation is scoped to what was checked and is refusable to a machine credential (D-151). Chain shape `pixels → ocr → ai → attested(member, date, extent)`.

### D50 · An absence or equality that cost nothing to produce is never a positive finding and is not evidence; instruments are harvested, never hand-extended by their author
- **Home:** OLD §5.1; DEC-4 second amendment; DEC-49 (L838)
- **Quote:** "an equality that costs nothing to produce is not evidence"
- **Binds:** ANALYSIS, QUESTIONS, COURTS
- **Reported by:** C10 (d64); C11 (d100); C12 (d160); C4 (d412, d436)
- **Notes:** DEC-49: hand-extending a measurement list "would make the instrument agree with its author at zero cost, which is the equality this project refuses."

### D51 · "The op returned nothing" and "no document carries a marker" are different facts; absent and empty are kept apart
- **Home:** OLD l.29, l.33
- **Quote:** "*absent* and *empty* are the two facts this document exists to keep apart."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C10 (d65); C3 (d384)
- **Notes:** none

### D52 · No machine mints a grade: garbled machine output reads undetermined; a checkability anchor needs coordinates; measured self-refusal is earnable, pseudo-confidence is forbidden
- **Home:** DEC-35; DEC-52 ("Grades stay earned (§8.1)")
- **Quote:** "the record needs the FUNCTION of per-region confidence, not the number."
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C12 (d139, d156); C3 (d373, d383)
- **Notes:** none

### D53 · A project declares its required strength (the group's evidence bar), published prominently; a shortfall is refused at pre-flight (BELOW_PROJECT_STRENGTH) with a loud escape; no declared bar gates nothing and says so; an inquiry outside a project has no bar; an imported bar does not travel
- **Home:** DEC-17 (Bob 2026-08-01, amended 2026-08-03; D-155); DEC-45; DEC-72 (the bar is a property of the PROJECT, told to the publishing act); DEC-71 (superseded)
- **Quote:** "A PROJECT WITH NO DECLARED STRENGTH GATES NOTHING, and the case says so rather than showing a blank."
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C11 (d120); C12 (d149); C2 (d252, d254); C3 (d390)
- **Notes:** Per-audience relaxation is "a structural prior by role"; a threshold belongs on a RENDERING, never on RATIFICATION (AUDIENCES.md §5). "an absent bar is not a bar of zero". The word "standard" here is the evidence bar (naming clash, see D197). DEC-72 supersedes DEC-71, DEC-17's strictest-across-citers composition and project-less publication: all load-bearing findings must meet the bar, others appear labelled non-load-bearing, and each claim's strength shows beside the case's standard. DEC-71: the bar governs the overall findings, not every piece of evidence (weak evidence may be cited without severance).

### D54 · Unproven is the default for a group's claims about its own impact: impact needs cited outside documents, and impact asserted from SEQUENCE ALONE is refused; a body's non-response is a first-party fact and fully claimable
- **Home:** DEC-14 and determinations (invariant 7 turned on the group)
- **Quote:** "What is refused is impact asserted from SEQUENCE ALONE"
- **Binds:** TIME, ANALYSIS, ORG, COURTS
- **Reported by:** C11 (d114, d115); C4 (d435)
- **Notes:** "It is our claim to have CAUSED something that is held." Bears on timelines and before/after analysis: sequence is not causation.

### D55 · A finding REPORTS and does not DECIDE: no surface may render it as impropriety; a check the record cannot yet discharge neither fires (claiming impropriety) nor stays silent (hiding an absence)
- **Home:** DEC-9 and response
- **Quote:** "a finding "REPORTS and does not DECIDE"; "no surface may render it as impropriety""
- **Binds:** LAW, COURTS, ANALYSIS, QUESTIONS
- **Reported by:** C11 (d106, d107)
- **Notes:** A "not yet checked" flag on a check that runs "would be the record misdescribing its own machinery".

### D56 · The record must never claim more than it can support: a defect that lets it overclaim is worse than a missing feature (e.g. "protected" means tamper-evident, never tamper-proof)
- **Home:** SD §1; CLAUDE.md (as cited in DEC-9); DEC-34
- **Quote:** "A defect that lets the record claim more than it can support is worse than a missing feature."
- **Binds:** all six
- **Reported by:** C1 (d34); C11 (d108); C12 (d136); C3 (d366, d386)
- **Notes:** none

### D57 · When the system cannot establish something it neither refuses the member's work nor goes silent: act, and say what could not be established; an unstated limit reads as completeness
- **Home:** DEC-56, DEC-57, DEC-58 (one shared ruling); REC-63; REC-54 (`EVIDENCE_INSUFFICIENT` stated as undetermined)
- **Quote:** "when the system cannot establish something, it does NOT refuse the member's work and it does NOT go silent."
- **Binds:** all six
- **Reported by:** C12 (d165, d167, d168); C2 (d259, d264)
- **Notes:** DEC-57 names silence "this project's primary threat model, an overclaim arriving through omission rather than through error". DEC-56: no un-saying a verification; the state and the finding disagree on purpose and must be legible. DEC-58's would-be exception ("numbers come from measurement, never from the surface") was retired in code (REC-57/UI-41), so the rule stands unamended.

### D58 · Never silently do less (the D-106 class): a case without PDF renderings says it is import-only; an installer that cannot meet a requirement refuses to complete honestly rather than install something degraded
- **Home:** DEC-41; DEC-42; D-106
- **Quote:** "it is a published case that silently does less — the D-106 class"
- **Binds:** all six
- **Reported by:** C12 (d145, d146)
- **Notes:** none

### D59 · Honest null: a writer that cannot see the substrate writes the locator as null rather than guessing; an invented value is a claim nobody can check
- **Home:** TAD §8.4
- **Quote:** "an invented one is a claim nobody can check"
- **Binds:** ANALYSIS, QUESTIONS, LAW, COURTS
- **Reported by:** C10 (d75); C3 (d382)
- **Notes:** CF §16: "a break placed on an invented width is an invented break" (the reader declines to invent; the pen goes UNKNOWN).

### D60 · Mechanical Verification Law: one check codebase, two call sites; two ops must not answer one fact differently and one rule must not have three spellings
- **Home:** TAD §10.2; OLD §6 (mirror-and-drift; REC-110)
- **Quote:** "One check codebase, two call sites; divergence between gate and checker is itself a defect"
- **Binds:** ANALYSIS, QUESTIONS, LAW
- **Reported by:** C10 (d69, d74)
- **Notes:** OLD: "An undocumented change of mind on a disclosure question is the thing REC-110 existed to prevent".

### D61 · A guarantee the store states must be enforced by something the store controls; a gap between what the code enforces and what the record says about itself is the failure mode the project refuses
- **Home:** TAD §10.11; DEC-52 (L751–753)
- **Quote:** "the gap between what the code enforces and what the record says about itself is the failure mode this project is built to refuse."
- **Binds:** all six
- **Reported by:** C10 (d76); C12 (d155, d158)
- **Notes:** none

### D62 · Regrade is a member capability
- **Home:** DEC-46 (c), 2026-08-04 (MILESTONES M4)
- **Quote:** "REGRADE IS A MEMBER CAPABILITY"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C1 (d54)
- **Notes:** none

### D63 · Declared bias is a DISCLOSURE construct bound by the malformedness rule (it may raise scrutiny, constrain inference and assert evidenced patterns, never issue a verdict), a citation requirement on patterns, strictest-wins with LOCKED statements, loud review of a new subject, and the group as backstop; the rule binds the machine as it binds a member
- **Home:** DEC-6; TAD Declared bias; DEC-54 (L1095–1102); DR Addendum
- **Quote:** "declared bias may raise scrutiny, constrain inference, and assert evidenced patterns, and may never issue verdicts"
- **Binds:** ORG, QUESTIONS, ANALYSIS
- **Reported by:** C10 (d78); C11 (d102); C12 (d163); C3 (d363, d368); C4 (d441, d443, d444, d445)
- **Notes:** DEC-6: safeguard 4's argument "is about registry-versus-free-text and about declared relations — not about a closed kind list"; corrected a subject-kind defect (anatomy "source, institution, office, or TOPIC" vs safeguard 4 "sources, institutions, offices and MOVEMENTS"). DEC-54: "the construct that fights undeclared distortion is held to a higher standard than the distortion." CF §13: every work product cites a bias manifest; a changed manifest leaves bias debt (regrade and rerun). CF §13.1: "The malformedness rule refuses "this office lies"" — a measured pattern statement is its accountable form. DB safeguards: 1 override defined by EFFECT not form (locks protect effect, not text); 2 strictest wins; 3 subject collisions are loud; 5 the group is the backstop — "What the machine guarantees is that nothing on a shared subject is QUIET". DB: "the most dangerous bias is the denied one".

### D64 · Declared bias is a CLOSED SET of three kinds (scrutiny, inference, pattern) and discloses, refusing nothing (only a hunch blocks); a standard of evidence is a BAR that gates; filing one as the other inverts its mechanics
- **Home:** DEC-54
- **Quote:** "File a bar as bias and it stops gating; file bias as a bar and it starts refusing."
- **Binds:** ANALYSIS, LAW
- **Reported by:** C12 (d162); C3 (d363); C4 (d442)
- **Notes:** DB: a `pattern` statement IS analysis and needs at least one citation to leave draft.

### D65 · No BIO process may consult an undeclared lens
- **Home:** DR Addendum
- **Quote:** "no BIO process may consult an undeclared lens."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C1 (d23)
- **Notes:** none

### D66 · Failure asymmetry ("when uncertain, be noisy") governs the record's own claims: the record's account is shown whole where a belief forms; it licenses no noise directed at members
- **Home:** CF §2 invariant 3; DEC-69 (src 140–141); DEC-51; DEC-95
- **Quote:** "is a rule about the RECORD'S OWN CLAIMS, and licenses no noise directed at members."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C2 (d250, d270, d296); C3 (d343)
- **Notes:** DEC-51: "a surface that receives the record's own account and discards it is withholding at exactly the moment the member forms the belief"; DEC-95: the grade note is shown whole, once, at completion.

### D67 · Derived things inform; authored acts bind: a machine or measure may inform and may not refuse or hide a member's act; the approval IS the act
- **Home:** CF §2 invariant 8 (changelog calls it 9); D-90; DEC-24; DEC-32; DEC-50; DEC-68; DEC-71; DB D-86
- **Quote:** "Derived informs, authored binds (D-90) — a machine may not refuse the act and must not hide it."
- **Binds:** all six
- **Reported by:** C2 (d251, d254, d261, d271); C3 (d333, d343, d344); C4 (d448)
- **Notes:** DEC-68: "Authored acts bind; the approval IS the act." DEC-50: friction lands on the person changing a structured case's shape. DB D-86: a member is never forced (DEC-69).

### D68 · Severance discharges support, never connection: a severed leg contributes nothing to strength, gates nothing and counts toward no bar, but the re-evaluation duty still attaches to whatever a finding ever rested on; re-evaluations are pull-read and, if pushed, tell once and age
- **Home:** DEC-70 (Bob 2026-09-10; D-79, D-266)
- **Quote:** "SEVERANCE DISCHARGES SUPPORT, NEVER CONNECTION"
- **Binds:** ANALYSIS, TIME, QUESTIONS
- **Reported by:** C2 (d255)
- **Notes:** Bob: "So keeping evidence connected has value over the lifetime." The ruling calls the re-evaluation duty an "obligation" (D198).

### D69 · Strength arithmetic: MINIMUM over AND-related legs, MAXIMUM over OR-related branches; the basis carries the relationship; DEFAULT IS AND; structure is authored before strength is shown; restructuring after seeing strength is legal, recorded and attributed; an unfinished branch reads undetermined, a branch with nothing established reads UNRATED
- **Home:** DEC-32 (ruled in part 2026-08-03, adopted in full 2026-08-04) and amendments
- **Quote:** "The difference is really whether the relationship between legs is AND or OR."
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C2 (d260, d261, d263, d271)
- **Notes:** Plurality lives inside one finding (one conclusion, one compound falsifier); refutation composes as the De Morgan dual; separate object identity only for distinct propositions, tested by citability. Surface test: "Would refuting this alone change your conclusion?" DEC-50: the shipped refusal of a new leg on a grouped question stands.

### D70 · A co-attested Grade B capture (RFC 3161 timestamp plus a third-party co-archive) suffices to publish, disclosed per document; Grade A (chain-of-custody web archive) stays the ceiling for adversarial or legal use; a failed co-attestation is published deliberately, visibly and repairably, never refused
- **Home:** DEC-39; DEC-81 (Bob 2026-09-29; Intake Doctrine §3 corrected; Grade A deferred to GRADE-A-CAPTURE.md)
- **Quote:** "a refusal would push groups to drop evidence rather than disclose its limits."
- **Binds:** COURTS, LAW, ANALYSIS
- **Reported by:** C2 (d265, d282)
- **Notes:** DEC-39: "A secondhand report that is co-attested is still a secondhand report." Any surface claiming Grade A fails the negative control.

### D71 · Every derivation step (conversion, transcription, OCR) weakens and never strengthens; an unmeasured step's cap is UNDETERMINED, stated, never a letter; the cap is computed by the module, never declared by a caller; claim less now and raise later by calibration
- **Home:** DEC-75 (BOB #11 2026-09-14; CAP-10, CAP-11); CF §16 chain rules; CF §14.5 (REC-88)
- **Quote:** "every derivation step weakens, and a step whose fidelity was never measured has cap UNDETERMINED, stated, never a letter"
- **Binds:** ANALYSIS, LAW, COURTS
- **Reported by:** C2 (d274); C3 (d337, d381, d383)
- **Notes:** "A chain, never a token". Capture grade is about the fetch path; a conversion is a derivation step. DEC-75: "a letter now, lowered later under authored legs ... is the move Bob's 5.8 forbids."

### D72 · A contradiction is CONDITIONAL: two assertions conflict only if they cannot both hold in the same respect (subject, time or occasion, scope, meaning of terms, observer or method, accurate capture, and for rules the same applicability); a coordinate offered to dissolve it is itself a claim needing evidence; the machine may propose which respects differ, labelled, and never picks a side
- **Home:** DEC-76 (Bob 2026-09-29); DEC-84; CM §DEC-76
- **Quote:** "A contradiction is CONDITIONAL: two assertions that cannot both hold IN THE SAME RESPECT"
- **Binds:** LAW, TIME, COURTS, ANALYSIS, QUESTIONS
- **Reported by:** C2 (d275, d285); C4 (d410, d427)
- **Notes:** Until evidenced, a dissolving coordinate leaves the conflict "hypothetically dissolved, not resolved". DEC-84: the machine recommends only which respects may differ, "never which side is wrong nor a GENUINE kind". CM: IDENTIFY/PRESENT/RESOLVE none built.

### D73 · Measures map: letters grade evidence, bars show progress, weights mark acts; one shared A–D scale; colour marks the scale, never the value; two strength badges (capture, connection) plus testimony and a phrase against the bar, never one combined badge
- **Home:** DEC-82 (Bob 2026-09-29)
- **Quote:** "letters grade evidence, bars show progress, weights mark acts"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C2 (d283, d284)
- **Notes:** DEC-82's unifying idea "an answer is only as strong as the weakest thing it depends on" must be read as the necessary (AND) legs; it does not overrule DEC-32's OR-max (Conflicts).

### D74 · A grade states how a connection was established and how easily someone else could check it, never whether it is true; grade is not credibility and not `asserted_by` (a case file shows both)
- **Home:** CF §8.1 (A: source identifier both ends captured; B: identifier matched exactly; C: correspondence; D: member testimony with stated basis); DEC-82
- **Quote:** "a grade tells you how easily someone else could check it, never whether it is true"
- **Binds:** ANALYSIS, QUESTIONS, COURTS
- **Reported by:** C2 (d283); C3 (d349, d350)
- **Notes:** none

### D75 · One state vocabulary, none dressed as an error: "Undetermined" is one component with a fixed mark and a mandatory "because…" line; "Withheld", "Unrated", "Nobody looked" and "Refused" are each visibly distinct with one fixed sentence pattern
- **Home:** DEC-86 (Bob 2026-09-29, folded into IC §U); DEC-82; DEC-98
- **Quote:** ""Undetermined" is one component with a fixed mark and a mandatory "because…" line"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C2 (d283, d288, d299)
- **Notes:** none

### D76 · Where an answer would rest on a machine's selection among several mentions, the portion reads UNDETERMINED rather than a definite answer; a member may choose the on-point mention (member-only act)
- **Home:** CF Incomplete §14.4/§14.5 (REC-120, C-49.4; REC-122 `op=connectionchoose`)
- **Quote:** "the portion is told UNDETERMINED rather than a definite `outside`"
- **Binds:** QUESTIONS, LAW, ORG
- **Reported by:** C3 (d336)
- **Notes:** none

### D77 · Contradiction is an OUTPUT the system exists to find, never prevented, with no arbiter and no precedence by design: in the world it is a finding, in the record a defect with a duty to identify, present and resolve; RESOLVE is a member's attributed act that deletes neither side
- **Home:** CF §12.1 (D-80, BOB #19/#22; Bob 2026-07-30); CM §CONTRADICTION (Bob 2026-09-17); CM open question 5
- **Quote:** "contradiction is not an edge case the model must tolerate, it is an OUTPUT the system exists to find"
- **Binds:** LAW, COURTS, ANALYSIS, TIME
- **Reported by:** C3 (d338, d361); C4 (d425, d426, d440)
- **Notes:** Contradicting aspirations are welcomed (CF changelog v0.7); content rows go `stale`, never away.

### D78 · Uncertainty is carried, not resolved: confidence below the bar changes the ANSWER; one confidence ladder (`certain`, `likely`, `possible`, `none`) for all axes; a merely likely stack declines to claim (UNDETERMINED); the registry's fallback never matches and is always the conservative one
- **Home:** CF §2 invariant 5; CF §4; CF §6
- **Quote:** "Confidence below `certain` changes the answer"
- **Binds:** ANALYSIS, QUESTIONS, TIME, LAW
- **Reported by:** C3 (d343, d345, d347)
- **Notes:** none

### D79 · The negative result is a finding
- **Home:** CF §2 invariant 9
- **Quote:** ""The negative result is a finding""
- **Binds:** ANALYSIS, LAW, COURTS
- **Reported by:** C3 (d343)
- **Notes:** none

### D80 · A reading that finds nothing is a failed reader, never an emptied document: recorded with its reason, never backfilled with invented entities; references are carried as they appear, not resolved at reading
- **Home:** CF §7; CF §16 Read
- **Quote:** "A reading that finds nothing is a failed reader, never an emptied document."
- **Binds:** ANALYSIS, LAW, ORG
- **Reported by:** C3 (d346, d379)
- **Notes:** none

### D81 · Two publications of one source are ONE system: several documents agreeing is usually one source copied
- **Home:** CF §8.3 rule 1; CLAUDE.md §5
- **Quote:** "Two publications of one source are ONE system"
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C3 (d355)
- **Notes:** none

### D82 · A theme is never the basis of a claim: no basis, version or action-basis leg may rest on a theme (refused by name, `THEME_NOT_EVIDENCE`)
- **Home:** CF §8.4 fence 4 (D-162; C-81.1)
- **Quote:** "A theme is never the basis of a claim"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C3 (d357)
- **Notes:** none

### D83 · Bias never shapes what is captured or monitored, only how conclusions are weighed
- **Home:** CF §13.1
- **Quote:** "**bias never shapes what is captured or monitored, only how conclusions are weighed.**"
- **Binds:** ANALYSIS, QUESTIONS, ORG
- **Reported by:** C3 (d367)
- **Notes:** none

### D84 · Recogniser judgements (how a document was made) are not bias-bearing: they carry recogniser, version, confidence, signals and time on the capture, are revised by improving the recogniser, and the version is bumped whenever the judgement could change
- **Home:** CF §13.1; CF §10
- **Quote:** "A recogniser's version is bumped whenever its judgment could change."
- **Binds:** ANALYSIS, LAW
- **Reported by:** C3 (d369, d370)
- **Notes:** none

### D85 · Content is the unit the record points at; a whole document is its widest extent and a document is not the answer
- **Home:** DEC-23 (2026-08-03); CF §14.1; SD §7
- **Quote:** "*pointing at a 300-page PDF is not pointing*"
- **Binds:** QUESTIONS, LAW, COURTS, ANALYSIS
- **Reported by:** C1 (d38); C3 (d372, d392)
- **Notes:** "documents are what is HARVESTED; content is what is EXTRACTED; meaning derives from both, and neither one alone."

### D86 · No gate may press a member into inventing something (a referent, a falsifier, a determination): such conditions are met by a cap or a stated, attributed override instead
- **Home:** CF §14.4 (BOB #26, D-152); REC-117; D-97; D-114
- **Quote:** "a gate that demanded one would press a member to invent a referent to get past it"
- **Binds:** ANALYSIS, LAW, COURTS, QUESTIONS
- **Reported by:** C3 (d375); C4 (d408, d424, d439)
- **Notes:** none

### D87 · A citation that points at a portion refers only to that portion and its grade is undetermined and stated, never borrowed from the whole document; a citation naming no portion means the whole document
- **Home:** CF §14.4
- **Quote:** "A citation that points at a portion refers only to that portion"
- **Binds:** LAW, COURTS, QUESTIONS, ANALYSIS
- **Reported by:** C3 (d376)
- **Notes:** none

### D88 · A member's firsthand observation is evidence, graded as testimony (grade D); capture-or-testify: a document captured, or a member's account at D
- **Home:** CF §14.4; CM §2 (D-148, DEC-13)
- **Quote:** "a member's firsthand observation is evidence — authored content standing on that member's trust, graded as testimony"
- **Binds:** COURTS, ORG, QUESTIONS
- **Reported by:** C3 (d377); C4 (d404)
- **Notes:** none

### D89 · A corpus-scale fidelity number is read as agreement unless its own column says accuracy
- **Home:** CF §16 (BOB #17, D-306)
- **Quote:** "A reader meeting any corpus-scale fidelity number must read it as agreement unless its own column says accuracy."
- **Binds:** ANALYSIS
- **Reported by:** C3 (d380)
- **Notes:** none

### D90 · "Undetermined is first-class" is for a fact NOT KNOWN; a known fact is summarised conservatively (the weakest governs)
- **Home:** CF §16 (D-284)
- **Quote:** ""undetermined is first-class" is "for a fact that is NOT KNOWN""
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C3 (d385)
- **Notes:** none

### D91 · A finding holds one proposition with one falsifier; `NO_FALSIFIER` is a condition a member may override, stated and attributed in the published record, never a hard requirement and never a silent override
- **Home:** REC-117 (Bob overruled "falsifier is REQUIRED"); C-2.8; DEC-32; DEC-69
- **Quote:** "`NO_FALSIFIER` is a condition a member may override, stated and attributed, including in the published record"
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C4 (d408, d424)
- **Notes:** none

### D92 · An action is never a basis leg (a leg rests on information or another inquiry, nothing else); grading a claim by the group's own act is the costs-nothing outcome turned on ourselves; an observed absence of reply as a leg is deferred
- **Home:** D-181 (BOB #29, 2026-09-23; C-2.8 `checkInquiryBasis`); CM §8
- **Quote:** "an observed absence of a reply as a leg is deferred, trigger: a real non-response case needs the absence graded"
- **Binds:** COURTS, TIME, LAW, ANALYSIS
- **Reported by:** C4 (d409, d436)
- **Notes:** Compare DEC-14: a body's non-response is a first-party fact, fully claimable (D54).

### D93 · The primary threat model is self-directed: the more dangerous half is the group's own overclaiming, including overclaim through omission
- **Home:** CM §4; DEC-57
- **Quote:** "**The primary threat model has always been self-directed; the doctrine just made it explicit.**"
- **Binds:** all six
- **Reported by:** C12 (d165); C4 (d412)
- **Notes:** none

### D94 · A finding is a claim derived from documents, not a document: a claim must not inherit a document's provenance without a basis of its own, and information never merges with a claim
- **Home:** CM §What is missing 1; CM §What does NOT collapse
- **Quote:** "Merging them lets a claim inherit a document's provenance without having a basis of its own"
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C4 (d416, d419)
- **Notes:** none

### D95 · There is no evidential-sufficiency threshold in the record: "enough" is a property of what you intend to do with the evidence, not of the evidence
- **Home:** CM §What a CLAIM is (AUDIENCES.md §5)
- **Quote:** "**"enough" is not a property of the evidence but of what you intend to do with it**"
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C4 (d423)
- **Notes:** none

### D96 · A quotation is evidence and is not edited
- **Home:** DB §Hunch heading
- **Quote:** ""a quotation is evidence and is not edited""
- **Binds:** COURTS, LAW, QUESTIONS
- **Reported by:** C4 (d450)
- **Notes:** none

## Counts and disclosure

### D97 · A COUNT is a disclosure of existence
- **Home:** OLD §6 (BOB #15)
- **Quote:** "a COUNT is a disclosure of existence"
- **Binds:** ANALYSIS, QUESTIONS, ORG
- **Reported by:** C10 (d70)
- **Notes:** none

### D98 · A member not invited to something learns one bit (that their item participates in something invisible), never its id, title, state or count
- **Home:** DEC-36 (reconciling D-15 with DEC-16)
- **Quote:** "The member learns that their item participates in something not visible to them, and nothing else"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C12 (d140)
- **Notes:** none

### D99 · One answer for absent and invisible: an outsider asking about a plan the group holds is answered as for one that does not exist
- **Home:** action-plans R22, R25 (`standards` R17 form); DEC-25; action-plans R6 (`NO_SUCH_PLAN`)
- **Quote:** "one answer for absent and invisible plans"
- **Binds:** QUESTIONS, LAW, ANALYSIS
- **Reported by:** C13 (d220, d224, d242)
- **Notes:** none

### D100 · A refusal does not say which cause applied, to prevent role enumeration; only a salted derivation is stored
- **Home:** DEC-49 (the gate's two security sentences)
- **Quote:** "refusal won't say which cause, to prevent role enumeration"
- **Binds:** QUESTIONS
- **Reported by:** C12 (d159)
- **Notes:** none

### D101 · Surface it all: the internal metadata of PUBLIC records is evidentiary (extracted, projected, indexed, searchable); restricted material (statutory redactions, member-origin, confidential source) is not settled and is deferred
- **Home:** DEC-5 (Bob 2026-08-01); DEC-11 (closed as duplicate); D-124 (deferred with a trigger)
- **Quote:** "Scope is PUBLIC records — restricted material is D-124, deferred with a trigger."
- **Binds:** ANALYSIS, LAW, COURTS, QUESTIONS
- **Reported by:** C11 (d101, d109)
- **Notes:** DEC-11 was raised as "effects on people outside the project ... the D-77 / invariant-7 neighbourhood" (see D110).

### D102 · Observation log: row-whole withholding is fail-closed (REC-103), stated as in conflict with the `purged` annotation after a per-bundle purge; a `subject NOT NULL`/PRESENT conflict was resolved conservatively to `unstated`
- **Home:** OLD Incomplete l.56, l.66; REC-103; D-366
- **Quote:** "the conflict is stated, not resolved."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C10 (d71, d72)
- **Notes:** none

### D103 · Doctrine of SIGHT across projects: when a conflict's other side lies in a project a member cannot see, each side is told only of its own side, both projects opt in before revealing to each other, no messaging is opened, and no highlight names the hidden project
- **Home:** DEC-85 (Bob 2026-09-29); DEC-36; DEC-113
- **Quote:** "doctrine of SIGHT constrains any cross-project derived signal."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C2 (d286, d314)
- **Notes:** none

### D104 · The doorbell inbox keeps only a count-only tally (no addresses, fingerprints, individual times or content), shown as status never notification; rate limits are told truthfully to the knocker; discards clear after a week
- **Home:** DEC-108 (Bob 2026-10-01)
- **Quote:** "count-only tally (no addresses, fingerprints, individual times or content) as status, never notification"
- **Binds:** QUESTIONS
- **Reported by:** C2 (d309)
- **Notes:** none

### D105 · No absence may stand in for another (never-recorded is not not-transcribed), and a count that is unknown is never shown as zero
- **Home:** CF §16 promote-time projection
- **Quote:** ""no absence may stand in for another""
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C3 (d384)
- **Notes:** none

## People and privacy

### D106 · An action's addressee is an office (by role and body), never a private individual; an action asserting a breach is addressed to an office
- **Home:** Actions R9 (D1); AC §4 rule 6 ("Requirement 6"); planning skill R31–R33; action-design PATH §3
- **Quote:** "never a private individual (Requirement 6). An action asserting a breach is addressed to an office."
- **Binds:** ORG, LAW, COURTS, QUESTIONS
- **Reported by:** C1 (d47); C13 (d191, d213, d229); C4 (d399)
- **Notes:** Brief correction: this is Actions R9 and the personal-data rules, not a Declared Bias safeguard.

### D107 · Open residual: a bare `scrutiny` bias statement naming a NATURAL PERSON with no citations is admitted; doctrine about named individuals is Bob's, triggered by the first such statement challenged as a verdict
- **Home:** DEC-6 (residual, OPEN); DB §The residual (DB 256–263)
- **Quote:** "Doctrine about named individuals is Bob's."
- **Binds:** ORG, QUESTIONS
- **Reported by:** C11 (d103); C4 (d397, d399)
- **Notes:** none

### D108 · Member search history stays out of the record (it would be reachable by legal process); conservative because reversible
- **Home:** OLD §4.6
- **Quote:** "member search history stays out of the record (reachable by legal process)."
- **Binds:** QUESTIONS
- **Reported by:** C10 (d68)
- **Notes:** none

### D109 · Public stops at a private individual's personal site: AI discovery is scoped to areas anybody can go through
- **Home:** DEC-47 (conduct, build-time)
- **Quote:** "WHAT IS AUTHORISED IS SCOPED BY "AREAS THAT ANYBODY CAN GO THROUGH.""
- **Binds:** ORG, QUESTIONS
- **Reported by:** C12 (d161)
- **Notes:** none

### D110 · Personal data of people outside the project falls under D-77 and invariant 7 (raised under DEC-11)
- **Home:** D-77; invariant 7 (as cited by DEC-11)
- **Quote:** "effects on people outside the project ... the D-77 / invariant-7 neighbourhood"
- **Binds:** ORG, QUESTIONS
- **Reported by:** C11 (d109)
- **Notes:** Brief correction: the private-individual rule lives in actions R9 and the personal-data rules (D-77, invariant 7).

### D111 · No surveillance of members: no read event is retained for what a member looked at, and member search history stays out of the record
- **Home:** DEC-68 (Bob 2026-08-10); OLD §4.6
- **Quote:** "logging what a member looked at is a doctrine question about surveilling members"
- **Binds:** QUESTIONS
- **Reported by:** C10 (d68); C2 (d251)
- **Notes:** none

### D112 · A doorbell knock has a source (a whistleblower is still a source, though unnamed): the pulling member is the capturing actor, never the source; continuity by a secret shown as a pseudonym; the note is the source's words, never evidence of its truth; contact details never enter the record
- **Home:** DEC-78 (Bob 2026-09-29); Membership v2 §1.2
- **Quote:** "A whistleblower is still a source, though unnamed."
- **Binds:** ORG, COURTS, QUESTIONS
- **Reported by:** C2 (d278)
- **Notes:** none

### D113 · Private-person protection: the group is never the first to make a source more public; a hostile exposure is the exposer's claim; "known to the group, not recorded" is first-class; consent to go public is asked at publishing; identity firming reaches findings as a re-evaluation notice, never a silent regrade
- **Home:** DEC-78.5 (a)–(e); DEC-80 (ceremony asks consent); DEC-119
- **Quote:** "The group is never the first to make a source more public"
- **Binds:** ORG, COURTS, QUESTIONS
- **Reported by:** C2 (d279, d281, d320)
- **Notes:** none

### D114 · Members are credited by handle, never legal name; an edition is not signed until each member whose observation it uses has chosen a credit level; anonymous testimony is weaker and needs corroboration; weight shows through the grade, never a stigmatising look
- **Home:** DEC-102 (Bob 2026-10-01); DEC-119 guard (K1031 (1); ratification R35)
- **Quote:** "identity buys strength; weight shows through the grade, "never through a stigmatizing look.""
- **Binds:** COURTS, QUESTIONS
- **Reported by:** C2 (d303, d320)
- **Notes:** none

### D115 · Private persons named in a subject's reply are not published
- **Home:** DEC-116
- **Quote:** "private persons named in a subject's reply are not published"
- **Binds:** ORG, COURTS
- **Reported by:** C2 (d317)
- **Notes:** none

### D116 · Bad actors are identified by evidence, never by role: no adversarial attribute in the subject registry, no credence ledger or prior against a class of actor, and caution against an office as a prior by role
- **Home:** CM §4 (D-83); DB §BOB #31 (D-53); DB 232–235; AUDIENCES.md §5
- **Quote:** "None of that licenses a structural prior."
- **Binds:** ORG, COURTS, QUESTIONS, ANALYSIS
- **Reported by:** C4 (d399, d413, d446)
- **Notes:** D-53: "A score like that is a prior against a class of actor, and the stance refuses one"; "Bob may overrule this; it was put to him on 2026-09-23."

### D117 · The record never infers a person's reasons or authorship: it never relates a machine proposal to a member's later act, and what it cannot say (e.g. who authored an intake tier) is stated undetermined
- **Home:** CM §2 UI-102; CM §2 REC-214
- **Quote:** "that a member acted BECAUSE of a proposal is a claim about a person that the record cannot support"
- **Binds:** QUESTIONS, ORG
- **Reported by:** C4 (d402, d403)
- **Notes:** none

## Relations and traversal

### D118 · A declared relation is constitutive, not evidentiary, and sits outside the connection grade
- **Home:** CON Step 4 (citing Declared Bias safeguard 4); entities R26 and CF §13 (brief correction); entities R26 (exact text); CF §13 (FW 1439–1442, 1483–1486)
- **Quote:** "A declared relation is constitutive: it carries no grade, is never traversed to resolve a reference or to answer R15, and never forms a connection."
- **Binds:** ORG, LAW, COURTS, QUESTIONS
- **Reported by:** C10 (d88); C3 (d364); C4 (d398)
- **Notes:** Brief correction: "constitutive, never traversed" is entities R26 / CF §13, while DB safeguard 4 says relations are declared, justified and citable and mechanical equivalence extends exactly as far as the registry declares. DEC-52 lets a machine be the one who constitutes a relation (D8). CF §14.4 defines a HUNCH as "temporary declared bias that lets the graph be traversed before the evidence exists": traversal before evidence is licensed only as hunch debt (D39).

### D119 · Notices go to every ancestor with one shared resolution (the event is the unit of state, one state and N homes); the walk is bounded: the basis graph is a DAG enforced at write and an exhausted walk says the ancestor set is undetermined
- **Home:** DEC-16 (Bob 2026-08-02); R3 depth bound
- **Quote:** "an exhausted walk must SAY the ancestor set is undetermined rather than silently notifying a truncated set"
- **Binds:** QUESTIONS, TIME, ANALYSIS
- **Reported by:** C11 (d118)
- **Notes:** "NOTHING VANISHES SILENTLY, so 'not presented' is not deletion"; an act that changes the record is itself an event. The only graph walk the doctrine names, and it walks basis legs, not declared relations.

### D120 · Focus, finding and case collapsed into one recursive type, the INQUIRY, whose basis legs may point at other inquiries
- **Home:** DEC-72 (Bob 2026-08-01); D-127
- **Quote:** "Focus collapsed with finding and case into the INQUIRY (Bob 2026-08-01; DEC-72)."
- **Binds:** COURTS, ANALYSIS, QUESTIONS
- **Reported by:** C1 (d8); C11 (d119)
- **Notes:** none

### D121 · No centrality or graph-density measures over the evidence graph
- **Home:** PS VIOLATE 1–10
- **Quote:** "no centrality/graph density"
- **Binds:** ANALYSIS, ORG
- **Reported by:** C10 (d87)
- **Notes:** none

### D122 · An authored edge is never re-pointed to a newer capture without a member's act; the strongest guarantee is that a proposal cannot be persisted as a re-pointing
- **Home:** CF changelog v0.13 (RULED); CF §18.1
- **Quote:** "an authored edge is never re-pointed to a newer capture without a member's act"
- **Binds:** LAW, TIME, ORG
- **Reported by:** C3 (d334, d387)
- **Notes:** none

### D123 · An explicit link or textual reference is an earned connection, not a hunch
- **Home:** CF changelog v0.13 (RULED)
- **Quote:** "an explicit link or textual reference is an earned connection, not a hunch"
- **Binds:** LAW, COURTS, ORG
- **Reported by:** C3 (d334)
- **Notes:** none

### D124 · An identifier matches across forms only through a CROSSWALK that is itself a captured document with provenance, never through an inferred pattern
- **Home:** CF §8.3 rule 2
- **Quote:** "An identifier matches ACROSS forms only through a CROSSWALK that is itself a captured document with provenance, never through a pattern we infer"
- **Binds:** ORG, LAW, COURTS, ANALYSIS
- **Reported by:** C3 (d356)
- **Notes:** none

### D125 · A matching signal (e.g. extent-match) admits a candidate and is never evidence of identity; where it fails the answer is UNDETERMINED rather than a guess
- **Home:** CF §18.1
- **Quote:** "extent-match is admitted as a SUFFICIENT signal for a candidate and never as evidence of identity"
- **Binds:** ORG, LAW, COURTS
- **Reported by:** C3 (d388)
- **Notes:** "undetermined is not a degraded answer here, it is nearly the whole value".

### D126 · Bias subjects are registry entries, not free text, with declared relations (proxy_for, member_of, overlaps) each justified and citable; mechanical equivalence extends exactly as far as the registry declares; a new subject is a loud, reviewed act; semantic equivalence is judged at evaluation (AI-assisted, member-owned)
- **Home:** DB safeguard 4 (DB 152–169); DEC-6
- **Quote:** "Mechanical equivalence extends exactly as far as the registry declares"
- **Binds:** ORG, QUESTIONS, ANALYSIS
- **Reported by:** C11 (d102); C4 (d396, d398)
- **Notes:** Bias collision DOES follow declared relations (MAGA↔Trump collides). Safeguard 4 contains neither "constitutive" nor "never traversed" (D118).

## Jurisdiction-free product

### D127 · Jurisdiction lives in data: no place, law, venue or template wording in product code or a module's behaviour; local knowledge lives only in jurisdiction profiles; tests run against the test profile
- **Home:** build/layers.md "No jurisdiction in the product"; AC §4 rule 11; DR §15; filing-templates R18; action-plans R28; DEC-91 (deferred: local guides in jurisdiction profiles); DEC-99 and DEC-118 ("K1: no jurisdiction in the product")
- **Quote:** "Jurisdiction lives in data. … a missing fact reads undetermined, never a default (build/layers.md, 'No jurisdiction in the product')."
- **Binds:** all six
- **Reported by:** C1 (d19, d48); C13 (d187, d203, d220, d241); C2 (d293, d300, d319)
- **Notes:** RM App A/B name officials and California law: the mission text is example, the doctrine keeps such content in data/profiles.

### D128 · Every profile fact is sourced to a primary page with capture sha256 and retrieval date; web search only locates primary pages; secondary or other-publisher sources are never a source
- **Home:** research-oakland-calendar header and M-NEW-3/5; filing-templates draft §2
- **Quote:** "the secondary site is not a source"
- **Binds:** TIME, ORG, LAW
- **Reported by:** C13 (d182, d183, d200)
- **Notes:** Proposed entries are `M-NEW-<n>`; BOB assigns real `M-<n>` numbers when filing.

### D129 · A member's local correction governs that instance only, marked with who corrected it and when, and is reported so the profile can be fixed
- **Home:** K921 Q6
- **Quote:** "marked with who corrected it and when, and it is reported to us so we can fix the profile."
- **Binds:** TIME, ORG, LAW
- **Reported by:** C13 (d204)
- **Notes:** none

### D130 · Holidays and office hours of a jurisdiction may be researched and supplied, with a process for confirming them
- **Home:** K903 (6) (Bob)
- **Quote:** "You can research and provide holidays and office hours of a jurisdiction (with a process for confirming them)."
- **Binds:** TIME, ORG
- **Reported by:** C13 (d198)
- **Notes:** none

### D131 · The system works identically for 1 group or 1,000 groups, unmodified; fully distributed, no single point of failure
- **Home:** RM §12; TAD R1, R2, R14
- **Quote:** "The system works identically whether there is 1 group or 1,000 groups."
- **Binds:** all six
- **Reported by:** C1 (d18); C10 (d73)
- **Notes:** none

### D132 · The product is sovereign instances: per-instance self-sufficiency has doctrine weight; anything every instance must fund or hold as a second vendor is a distribution liability
- **Home:** DEC-35; DEC-42 (Workers Paid $5/month a requirement, verified by the installer)
- **Quote:** "the product is SOVEREIGN instances"
- **Binds:** all six
- **Reported by:** C12 (d138, d146)
- **Notes:** DEC-42 corrects the premise, not the doctrine ("$0/month plus a card becomes $5/month plus a card"); "THE RULING RESTS ON A MEASURED INVENTORY, NOT ON WANTING THE FEATURE".

### D133 · The distribution model IS the product: a group's evidence never transits a server we run, and a stranger can verify without the instance's cooperation
- **Home:** DIST §1, §2
- **Quote:** "the distribution model IS the product"
- **Binds:** ANALYSIS, COURTS, QUESTIONS
- **Reported by:** C10 (d84); C2 (d281)
- **Notes:** none

### D134 · Any well-formed doctrine pack is accepted, including one this repository never wrote; a group may author its own
- **Home:** DEC-66 (session BOB under Bob's standing delegation)
- **Quote:** "nothing stops that group authoring its own doctrine pack"
- **Binds:** LAW, ANALYSIS
- **Reported by:** C12 (d173)
- **Notes:** none

### D135 · Architecture and advice to groups are vendor-neutral: no Google Drive or Apps Script; multiple platforms
- **Home:** DEC-67; Design Requirements R9 (platforms — not Actions R9)
- **Quote:** "Neither Google Drive nor App Scripts are a part of the current architecture. Period."
- **Binds:** ANALYSIS
- **Reported by:** C12 (d176)
- **Notes:** Reinforces vendor/jurisdiction-neutral product text; relevant to "spreadsheets as a working medium" (ANALYSIS).

### D136 · No canonical source of truth: each group independently evaluates and accepts or rejects other groups' work; the protocol is the authority
- **Home:** DR §5; DR §1
- **Quote:** "No canonical source of truth. Each group independently evaluates and accepts or rejects other groups' work products."
- **Binds:** COURTS, LAW, ORG
- **Reported by:** C1 (d21, d22)
- **Notes:** none

### D137 · Paid outside services (e.g. an external OCR tier) are funded only on a real trigger: a load-bearing document in a real case whose grade falls below that project's bar, brought to Bob as a funding request
- **Home:** DEC-74 (BOB #11 2026-09-14); DEC-35
- **Quote:** "that is a funding request with a document and a bar attached, brought to Bob then"
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C2 (d273)
- **Notes:** Built OCR: tesseract-wasm `ocr-worker`, chain `pixels → ocr(tesseract-wasm 0.11.0)`, cap C; 13 of 1,458 censused Oakland pages image-only.

### D138 · Identifier-space recognisers in product code that hold jurisdiction-specific data (a "measured Oakland table", Legistar C.M.S. numbers, the Alameda APN) are flagged against the no-jurisdiction rule
- **Home:** CF Incomplete §8.3; CF §8.3 (`bio-plane/src/idspaces.mjs`); BOB #35
- **Quote:** "the build derives an office's "independent system" "through a measured Oakland table""
- **Binds:** ORG, LAW
- **Reported by:** C3 (d341, d358)
- **Notes:** BOB #35 also says "never a per-instance table a machine applies" while the build derives system from "a measured host" list (Conflicts).

### D139 · Design for the observable case (this group, Oakland) so that a second audience costs a RENDERING rather than a rewrite
- **Home:** CM §5
- **Quote:** "design so that a second audience costs a RENDERING rather than a rewrite"
- **Binds:** LAW, ORG, COURTS
- **Reported by:** C4 (d415)
- **Notes:** none

## Layer order and module size

### D140 · The build's numbering governs: Action is layer 9 (the Functional Architecture's "Layer 3: Action" is the functional layer); System Design's one-way dependency narrative omits Action
- **Home:** AC §5 row 14; SD §4 (narrative and 14-class diagram)
- **Quote:** "the build's numbering governs: Action is layer 9"
- **Binds:** LAW, TIME, ANALYSIS, ORG
- **Reported by:** C1 (d41, d50)
- **Notes:** SD §4 order: membership → capture → record → content → meaning → bias → inquiry → retrieval → assistant → surfaces → publication → distribution/operations.

### D141 · Layer order (P4) forces inversions: an earlier module offers a registration hook that a later module fills (e.g. ai-runs cannot read plans itself)
- **Home:** ai-runs R47 (planning-skill draft)
- **Quote:** "the layer order forbids `ai-runs` reading plans itself"
- **Binds:** QUESTIONS, TIME, LAW
- **Reported by:** C13 (d195)
- **Notes:** none

### D142 · `local-facts` and `filing-templates` join layer 9 (local-facts first, before `standards`); `jurisdictions` stays layer 1 and pure data
- **Home:** K921 Q9 (Bob's yes, T21)
- **Quote:** "`filing-templates` and `local-facts` join layer 9 in T21 (architecture, Bob's yes to Q9)"
- **Binds:** TIME, LAW, ORG
- **Reported by:** C13 (d205)
- **Notes:** none

### D143 · `action-plans` sits last in layer 9 after `escalation` because it reads every layer-9 module; adding it was ruled BOB's ("a technical detail")
- **Home:** action-plans Status, Decided (Bob 2026-09-30)
- **Quote:** "placed "last in layer 9 after `escalation` since it reads every layer-9 module""
- **Binds:** LAW, TIME
- **Reported by:** C13 (d223, d235)
- **Notes:** In tension with the brief's rule that adding a product module is Bob's, and with filing-templates' "the module split is architecture, also his" (Conflicts).

### D144 · The functional layers are concurrent, not phases (a group does layer 1, 2 and 3 work at once); build sequencing put the UI before the analysis layer, and the case-making rung (M9) depends on no substrate milestone
- **Home:** FA three layers; UI-KICKOFF history (2026-07-27); MILESTONES L513–542
- **Quote:** "A group in the Investigate phase is doing Layer 1 work …, Layer 2 work (analyzing what the data shows), and potentially Layer 3 work … simultaneously."
- **Binds:** ANALYSIS, LAW, TIME
- **Reported by:** C1 (d33, d57, d60)
- **Notes:** UK: "Layer 1 the foundation (done enough), LAYER 3 THE UI IS NEXT, and Layer 2 the analysis layer fills in afterward across all three."

### D145 · P17: a requirement's meaning, the UX and the module split (architecture) are Bob's; BOB recommends and decides lower-level matters; research surfaces rulings, it does not decide them
- **Home:** P17, P5; planning-skill and filing-templates drafts; action-design deltas status; research-oakland-calendar Rulings
- **Quote:** "the requirements and UX are his (P5, P17); the module split is architecture, also his, with BOB's recommendation."
- **Binds:** all six
- **Reported by:** C13 (d186, d189, d197, d226); C2 (d248)
- **Notes:** Deltas: items marked **Bob** change a layer contract, module list or member vocabulary; items marked **BOB** are BOB's. C2 register rules: Bob's are "**doctrine** (what the record means and may claim), **risk carrying his name** (legal, the City), **effects on people outside the project**" and gated acts; sequencing and mechanism are not his.

### D146 · The run vocabulary is held by `run-rules` (K617); the planning skill rests on K590, K597, K600, K608, K613 (3) and DEC-24 rules 1–2
- **Home:** K617; K590 (D2, D4; rulings 2, 3, 6, 8, 10); K597; K600; K608; K613 (3); DEC-24 rules 1–2 (planning-skill draft header, §2)
- **Quote:** "K617 (run-rules holds run vocabulary)"
- **Binds:** QUESTIONS, TIME
- **Reported by:** C13 (d190)
- **Notes:** none

### D147 · Action development has priority high enough to catch up with the rest of the product and keep up with it
- **Home:** action-design HANDOFF (Bob)
- **Quote:** "that Action-related development catches up with the rest of CivicOS and keeps up with it"
- **Binds:** LAW, TIME, ORG
- **Reported by:** C13 (d236)
- **Notes:** none

### D148 · P18: a fold is preparation for the next tranche and touches no running job
- **Home:** P18 (action-design HANDOFF)
- **Quote:** "fold is "preparation for the next tranche; touches no running job"."
- **Binds:** all six
- **Reported by:** C13 (d239)
- **Notes:** none

### D149 · P7: every requirement is tested at the module's interface, never its source text; each test has a negative control; fixtures use the test profile only
- **Home:** P7 (action-design tests status)
- **Quote:** "every requirement tested at the module's interface, never its source text"
- **Binds:** all six
- **Reported by:** C13 (d241)
- **Notes:** none

### D150 · A solid substrate before building on top of it; an absent capability is narrated honestly in its placeholder
- **Home:** DEC-33 (Bob 2026-08-03, confirmed 2026-09-18; the Q12 rule)
- **Quote:** "DEC-33 is another case of my saying 'we need a solid substrate before building on top of it.'"
- **Binds:** all six
- **Reported by:** C2 (d264)
- **Notes:** DEC-33's trigger fired in DEC-80 (2026-09-29): the publication ceremony and pre-flight are built in the redesign (D189).

### D151 · A capability that does not serve the path is not obviously worth building; no new container until a group asks
- **Home:** DEC-48 (Bob's capability doctrine, CLAUDE.md 2026-08-01)
- **Quote:** "a capability that does not serve the path is not obviously worth building"
- **Binds:** all six
- **Reported by:** C2 (d272)
- **Notes:** none

### D152 · The framework's cost table is its specification: a new connection kind is one row of data with no code; a new axis is one registry of the recogniser shape; an invariant is a framework revision
- **Home:** CF §9
- **Quote:** "a new connection kind = "**one row of data**, no code""
- **Binds:** LAW, ORG, TIME, ANALYSIS
- **Reported by:** C3 (d351)
- **Notes:** none

## Time

### D153 · The group's own missed checkpoint is never a finding about the government
- **Home:** action-plans R23; action-design PATH §2 step 8, §3; UX-ANSWERS OQ-25; CM §THE ACTION PLAN 3
- **Quote:** "the group's own missed checkpoint is never a finding about the government."
- **Binds:** TIME, COURTS, LAW
- **Reported by:** C13 (d211, d213, d216, d220, d244); C4 (d430)
- **Notes:** none

### D154 · Nothing is deleted: records are append-only and declared to purge; deletion of cited material is never silent; nothing leaves the record
- **Home:** K23; filing-templates R17; action-plans R27; local-facts R5; TAD §3; DEC-29
- **Quote:** "Nothing is deleted ... append-only and declared to purge (K23)."
- **Binds:** all six
- **Reported by:** C10 (d82); C11 (d131); C13 (d199, d202, d220, d243); C4 (d426)
- **Notes:** TAD §3: bundles are accretive and deletion cascades — "deletion of cited material is never silent".

### D155 · A template's prior versions read `updated` (not superseded or retired); `retired` only withdraws a whole template
- **Home:** K924
- **Quote:** "prior versions read `updated` (not superseded/retired)"
- **Binds:** LAW, TIME
- **Reported by:** C13 (d206)
- **Notes:** none

### D156 · `divided` is a terminal STATE meaning the question itself was malformed; it corrects forward and is never undone; one authored reason per division, which cannot do severance's work
- **Home:** DEC-28; DEC-29; CM §Division 2, 4; CM §R4
- **Quote:** "un-dividing would be the record changing its mind in silence"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C11 (d130, d131); C4 (d421, d422, d437)
- **Notes:** Apportioning basis on division is an AUTHORED act: "A machine cannot decide that, and evidence must never be silently reassigned". R4: the parent records where every leg went; "a published child names its parent and its siblings."

### D157 · Where respect ends and a deadline duty begins: reminders are member-requested, sent by no outside channel, and an overdue item re-notifies once
- **Home:** DEC-94 (2)(3)(4); action-design deltas §4 (with DEC-10, DEC-61, DEC-69, DEC-70, K611 CONDITION, K613 (2))
- **Quote:** "reminders are member-requested; no outside channel; overdue re-notifies once."
- **Binds:** TIME, QUESTIONS
- **Reported by:** C13 (d231); C2 (d295)
- **Notes:** none

### D158 · Every wait says what it waits for, from whom and by when; a next step is offered only on something just created
- **Home:** DEC-98 (Bob 2026-10-01)
- **Quote:** "every wait says what/from whom/by when"
- **Binds:** TIME, ORG, QUESTIONS
- **Reported by:** C2 (d299)
- **Notes:** none

## Law and venues

### D159 · Templates (legal wording) need a formalised authoring, approval and attribution process, unlike researched local facts
- **Home:** K903 (6) (Bob)
- **Quote:** "I think that templates need a more formalized authoring, approval, and attribution process."
- **Binds:** LAW, COURTS
- **Reported by:** C13 (d198); C2 (d323)
- **Notes:** none

### D160 · A review never carries over to text it did not read; the approver is not the version's sole author
- **Home:** filing-templates draft §1
- **Quote:** "reviews never carry over to text they did not read"
- **Binds:** LAW
- **Reported by:** C13 (d201)
- **Notes:** none

### D161 · No machine-invented legal text is filed without member adoption
- **Home:** K613 (3); action-design deltas §3
- **Quote:** "no machine-invented legal text filed without member adoption."
- **Binds:** LAW, COURTS, QUESTIONS
- **Reported by:** C13 (d190, d230)
- **Notes:** none

### D162 · Layer 9 contract: an action rests on the record; one asserting a breach rests on a published finding and a standard held in the record; the AI proposes and prepares, never files or sends; every deadline names the statute, order or commitment it comes from
- **Home:** build/layers.md layer 9 (new contract, action-design deltas §1: rulings 1, 5, 10, D1)
- **Quote:** "new layer 9 contract (rulings 1, 5, 10, D1), quoted under LAW."
- **Binds:** LAW, TIME, COURTS, ORG
- **Reported by:** C13 (d227, d235)
- **Notes:** Contract text from constructs-brief.md; the C13 bullet points to its LAW section for the quotation.

### D163 · A breach assertion on a hypothetical (unestablished) subject is refused by default; an override with a stated reason labels everything that rests on it "rests on an unestablished premise" and is disclosed
- **Home:** Bob 2026-09-30; actions R8, R24 (action-design deltas §2–3)
- **Quote:** "breach assertion on a hypothetical subject refused by default"
- **Binds:** LAW, COURTS
- **Reported by:** C13 (d212, d228)
- **Notes:** none

### D164 · Action plans are not project management: no cost, budget, assignee, hours, score or priority is held or shown; a plan is never published
- **Home:** action-plans Purpose, R23–R28; action-design PATH §3
- **Quote:** "It is not a project-management system: it holds no costs, assignees or hours. It is never published."
- **Binds:** TIME, ANALYSIS
- **Reported by:** C1 (d46); C13 (d213, d219, d220, d244)
- **Notes:** none

### D165 · Never prefill: nothing preselected unseen, no default tier, unticked options stay undecided, an exclusion or bias statement is authored by its author, an import never authors an objective or bias statement for the member
- **Home:** IC ("nothing prefilled"); DEC-77; PS VIOLATE (invariant 7); DEC-45/46; DEC-46 (2); action-design PATH §2–3
- **Quote:** "Unticked options stay undecided, and the page never asks the member to decide them."
- **Binds:** all six
- **Reported by:** C1 (d39, d55); C10 (d87); C12 (d149, d152); C13 (d210, d213, d222); C2 (d277, d298, d306, d322); C4 (d414)
- **Notes:** DEC-45: "The argument is not convenience, it is whose words they are." Extended to capability by DEC-55 (D9) and to standards by DEC-54 (D16).

### D166 · Any group may use the product with its stake disclosed; lobbying is limited (no lobbying without an existing requirement)
- **Home:** action-design deltas §8 (D6); Design Requirement 6; ruling 6; planning skill R31–R33
- **Quote:** "any group may use CivicOS; stake disclosed (Design Requirement 6); lobbying limited by ruling 6."
- **Binds:** LAW, ORG
- **Reported by:** C13 (d191, d232)
- **Notes:** none

### D167 · An action plan is working material and never published; if that is ever changed it applies prospectively only, because plans were written under a privacy promise
- **Home:** DEC-25 (deferred 2026-08-03); CM §7; action-plans R25
- **Quote:** "Retroactively publishing deliberation that was recorded under a privacy assumption would be a betrayal of the members who wrote it"
- **Binds:** LAW, TIME, ORG
- **Reported by:** C1 (d46); C13 (d219, d220); C2 (d257); C4 (d435)
- **Notes:** none

### D168 · A claim needs a standard of proof attached, and that is doctrine; no standard of proof is preselected or defaulted; audience standards of proof are sourced jurisdiction-profile data, "Undetermined" where unresearched; the burden of proof attaches to the production
- **Home:** DEC-105; CF §12.2; CF §18 piece 6 (Bob 2026-09-14)
- **Quote:** "no preselected or defaulted standards of proof; audience standards are sourced jurisdiction-profile data, "Undetermined" where unresearched."
- **Binds:** LAW, COURTS, ANALYSIS
- **Reported by:** C2 (d306); C3 (d365, d390)
- **Notes:** none

### D169 · Preservation (anti-spoliation): the purge must be suspendable, a hold fails closed, a wipe is refused during a hold, and sight is preserved
- **Home:** DEC-113 (DEC-61)
- **Quote:** "preservation/spoliation doctrine (DEC-61): the purge must be suspendable; hold fails closed; wipe refused during a hold; sight preserved (DEC-36)."
- **Binds:** COURTS, LAW, TIME
- **Reported by:** C2 (d314)
- **Notes:** none

### D170 · A definition is append-only; every instance and finding names the definition version it was read against; an authored act binds the version the member saw
- **Home:** CF §8.2 declared flow (D-128, BOB #27, DEC-19); REC-211 (BOB #32, 2026-09-24; `DEFINITION_MOVED` C-33.43, `NO_DEFINITION_VERSION` C-33.42)
- **Quote:** "*authored acts bind what was authored*"
- **Binds:** LAW, TIME, ANALYSIS, ORG
- **Reported by:** C3 (d339, d352, d353)
- **Notes:** An upsert that lost the group's earlier understanding was "the record keeping less than it held".

### D171 · A plan must be able to hold what it decided against: declined options are authored with reasons
- **Home:** CM §THE ACTION PLAN 2
- **Quote:** "**A plan must be able to hold what it decided against.**"
- **Binds:** LAW, TIME
- **Reported by:** C4 (d429)
- **Notes:** none

### D172 · A plan belongs to a PROJECT and a FINDING, never to a person; a step may be blocked because the finding has not reached the project's declared strength
- **Home:** CM §THE ACTION PLAN 4 (DEC-17)
- **Quote:** "The plan therefore belongs to a PROJECT + FINDING, never to a person"
- **Binds:** LAW, ORG, TIME
- **Reported by:** C4 (d431)
- **Notes:** none

## Publication and reproducibility

### D173 · Editions accrete: edition 2 joins edition 1; reopening does not unpublish; the inquiry's state and its publication history are two records; revising is not dividing; nothing recomputes a strength for an earlier edition
- **Home:** DEC-12; DEC-101 (forward-only correction; a what-changed statement on every new edition; no computed diff list adopted)
- **Quote:** "edition 2 does not overwrite edition 1, it joins it"
- **Binds:** TIME, COURTS, ANALYSIS
- **Reported by:** C11 (d112); C2 (d302); C3 (d389)
- **Notes:** `PUBLISHED_CANNOT_DIVIDE`; exclusion statement authored fresh per edition (C-21.1 byte-check).

### D174 · Publishing is an irreversible act, perhaps the only one; below it, attested acts cannot be undone SILENTLY; publishing is not a toggle
- **Home:** DEC-19 (corrected in name); PS VIOLATE; DEC-106; DEC-80
- **Quote:** "PUBLISHING IS AN IRREVERSIBLE ACT, and it may be the only one"
- **Binds:** COURTS, TIME
- **Reported by:** C10 (d87); C11 (d121); C2 (d307, d317)
- **Notes:** none

### D175 · Qualifiers travel inside the artifact on every page ("brazening"): declared bias and both threshold floors; a page separated from its document still names what it is
- **Home:** DEC-34 (H4); DEC-31 (H4 extension)
- **Quote:** "A page separated from its document still names what it is."
- **Binds:** ANALYSIS, COURTS
- **Reported by:** C12 (d137); C2 (d258)
- **Notes:** none

### D176 · The case renders whole, always; a reader's bar is the reader's and a filtered rendering states its filter; the record never names a reader's purpose (the threshold-stance construct removed)
- **Home:** DEC-40 det. 1–4; UI-27 (correcting UI-18)
- **Quote:** "THE CASE RENDERS WHOLE, ALWAYS"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C12 (d142, d143, d144)
- **Notes:** "it is the record telling a reader what they are doing, which is the inversion this project exists to refuse."

### D177 · The PDF is a rendering, never the authority: the signed container governs and a disagreeing rendering loses; a case without renderings is import-only and says so
- **Home:** DEC-41
- **Quote:** "A rendering that disagrees with the container loses."
- **Binds:** ANALYSIS, COURTS
- **Reported by:** C12 (d145)
- **Notes:** none

### D178 · A case is a container over one or more findings scoped to the project's question: the finding is the unit of truth, the case the unit of publication; no super-conclusion; each finding holds one proposition with one falsifier
- **Home:** DEC-44 (operative); DEC-32 (falsifier-count test); DEC-72; MILESTONES M10; DEC-72 (Bob 2026-08-10: a case is its own object, a set of finding-versions plus the publishing project; publisher must be a project manager)
- **Quote:** "The FINDING stays the unit of truth; the CASE becomes the unit of PUBLICATION."
- **Binds:** COURTS, ANALYSIS, LAW
- **Reported by:** C1 (d56); C12 (d147, d148); C2 (d252, d253, d261)
- **Notes:** MS M10: a case is a production of a project; "at least one load-bearing member required"; "A finding serves many cases across projects". Corrected the built model (store.mjs:3539 published one inquiry). DEC-72: "A finding is mined, often involving hard work. So once resolved, the finding should have lasting value."

### D179 · An imported published case arrives as findings, re-graded in the new context with no inherited standing; signature, edition and hash are checkable facts about it, not a grade; it lands in a new project per distinct source bias
- **Home:** DEC-40 det. 4 (corrected by DEC-44); DEC-45; DEC-46 (3) (overruling DEC-45 det. 2); MILESTONES M6
- **Quote:** "A published case imported elsewhere is a FINDING and gets no inherited standing"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C1 (d55); C12 (d142, d143, d149, d153)
- **Notes:** DEC-46 (3): "The manifest preserves the lens as a RECORD and does not make it USABLE"; association with an existing project is a separate authored act where regrade fires.

### D180 · A source's bias is PRESERVED by the bias manifest that travels with the case; the lens APPLIED going forward is the importing instance's plus any project layer
- **Home:** DEC-45 (L579–593)
- **Quote:** "PRESERVED and APPLIED are two different things, and only one of them needs a project."
- **Binds:** ANALYSIS
- **Reported by:** C12 (d150)
- **Notes:** none

### D181 · Bias is public and accompanies every published case: the computed manifest is stamped, the acknowledgement is authored by the publisher fresh per edition and rendered as an element of the case, and a project's own bias is visible on its surfaces
- **Home:** DEC-20; DEC-46 (2), (5); DEC-59; REC-47 (built); D-189; DEC-103 (full lens printed into the signed case); DEC-117 (lens sentences)
- **Quote:** "Bias is public and accompanies every published case produced under that bias."
- **Binds:** ANALYSIS, COURTS, QUESTIONS
- **Reported by:** C1 (d25); C11 (d124); C12 (d152, d154, d166); C2 (d304, d318)
- **Notes:** DEC-59: DEC-34's per-page "Declared bias" is computed from HUNCH legs, "a different fact" from the authored acknowledgement. DEC-46 (5): bias bundles are unbuilt (D-84, `object_type: bias` absent). DEC-103: the lens cites only public material and counts what is withheld; "a lens that is weighable, not a weapon". DEC-117: "An undeclared lens is the most dangerous kind."

### D182 · Another group's case is confirmed by recreation; recreating is not endorsing
- **Home:** DEC-112
- **Quote:** "Recreating is not endorsing."
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C1 (d17)
- **Notes:** none

### D183 · A deploy verified is not a build serving: establish which build answered before believing either
- **Home:** DIST §6 (D-108)
- **Quote:** "A deploy verified is not a build serving"
- **Binds:** ANALYSIS
- **Reported by:** C10 (d85)
- **Notes:** none

### D184 · Contacting the subject before publication: the gate is the group's declared, justified position on contact carried in the artifact, never that contact happened or the answer was favourable; an ask carries specifics; what comes back is captured, not summarised, and gets no veto and no omission
- **Home:** DEC-13 (filed as declared bias, same malformedness rule); DEC-100 (the subject's right of reply is a declaration, not a gate)
- **Quote:** "THE GATE AT RATIFICATION IS THAT THE POSITION IS DECLARED AND JUSTIFIED — NEVER THAT THE ANSWER WAS FAVOURABLE, and never that contact happened."
- **Binds:** ORG, COURTS, QUESTIONS
- **Reported by:** C11 (d113); C2 (d301); C4 (d435)
- **Notes:** Cites DEC-1's hostile City as the tipping-off reason; `research/AUDIENCES.md` deliberately not edited (D-153).

### D185 · Nothing leaves by a system path; the instance transmits nothing (the media receives what a member sends)
- **Home:** AC §4 rule 7; action-design UX-ANSWERS (audiences)
- **Quote:** "Nothing leaves by a system path. The instance transmits nothing."
- **Binds:** LAW, COURTS, ORG, QUESTIONS
- **Reported by:** C1 (d46); C13 (d217); C2 (d317, d324)
- **Notes:** none

### D186 · Publication pins finding versions like a commit; nothing composes across projects
- **Home:** DEC-72
- **Quote:** "publication pins versions like a commit"
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C2 (d252)
- **Notes:** none

### D187 · An advance or review copy stands beside publish: mutable, never leaves the instance, reached by a scoped, revocable read-and-comment grant, and states its own gaps in the record's vocabulary; only a real publish is immutable; any rendering that leaves addressed to someone carries hash, date, author and both threshold floors
- **Home:** DEC-31 (bound rule 2026-08-03; Bob 2026-09-17); DEC-106
- **Quote:** "An 'advance copy' or 'review copy' (both valid names) is mutable. Only a real publish is not."
- **Binds:** COURTS, ANALYSIS, QUESTIONS
- **Reported by:** C2 (d258, d259)
- **Notes:** "A review copy states its own gaps in the same words a published case does"; a gate pressuring the member to fill them is a bug (DEC-69). Naming put back to Bob (DEC-8).

### D188 · A finding resting on an unresolved RECORD contradiction may be published with the contradiction disclosed, stated and attributed; the gate discloses rather than blocks, but an undisclosed open RECORD tension refuses the case
- **Home:** DEC-76.4; DEC-84; DEC-80 (ceremony step three)
- **Quote:** "publication DISCLOSES, never blocks — an undisclosed open RECORD tension refuses the case"
- **Binds:** COURTS, LAW, ANALYSIS
- **Reported by:** C2 (d276, d281, d285); C4 (d427)
- **Notes:** DEC-84: an undetermined candidate is a lead, never a duty; a RECORD duty binds joined members of every project drawing on either side until resolved; a stale mark moves nothing by itself.

### D189 · Publication runs a five-step ceremony (what becomes permanent; what this rests on; what is left out; the edition this creates; sign) with a pre-flight that runs real refusals without writing; the owner signs with a browser-held key verifiable by strangers
- **Home:** DEC-80 (Bob 2026-09-29; UI-17, REC-15, case-authoring R12)
- **Quote:** "pre-flight runs real refusals without writing"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C2 (d281)
- **Notes:** Signature is `sshsig`, checkable with `ssh-keygen`. Step three discloses unresolved RECORD contradictions (DEC-76) and asks consent for any revealed source identity (DEC-78.5).

### D190 · Members choose their language; groups translate, not rename, interface words; machine translations are labelled and never replace the original; signed records stay in their signing language and a translation is unofficial and links the signed original
- **Home:** DEC-99; DEC-127 (Bob 2026-10-04; principle 8.5)
- **Quote:** "translation never presented as the signed case."
- **Binds:** QUESTIONS, LAW, COURTS
- **Reported by:** C2 (d300, d329)
- **Notes:** none

### D191 · The docket (a case's public response log) never makes anything evidence: no confidential or redacted entries, the group never redacts what others submit, private persons named in a subject's reply are not published, withdrawal is signed and final and never erases, and it travels by pull only (no email)
- **Home:** DEC-100; DEC-116
- **Quote:** "Nothing is pushed; CivicOS sends no email."
- **Binds:** COURTS, ORG, QUESTIONS
- **Reported by:** C2 (d301, d317)
- **Notes:** "Docket" is a taken word here, not a court docket (D205).

### D192 · Two spaces with distinct frames, the working record and the published record; review copies and outgoing drafts sit banded inside the working frame; every document and case carries a path-to-publication marker
- **Home:** DEC-106 (Bob 2026-10-01)
- **Quote:** "two spaces (working record, published record) with distinct frames"
- **Binds:** COURTS, QUESTIONS
- **Reported by:** C2 (d307)
- **Notes:** none

### D193 · "Working on" notices come only from a project defined as working on the issue, by its owner, after an outward-act warning; they name the group slug, never members; never anonymous; facts graded Stated / Reported / Proven, never a score; a group with no published work holds at most two
- **Home:** DEC-111 (Bob 2026-10-01)
- **Quote:** "Stated / Reported / Proven; facts never a score"
- **Binds:** ORG, COURTS, LAW
- **Reported by:** C2 (d312)
- **Notes:** none

### D194 · Everything a case's conclusions rest on must be presentable: publication is refused while a relied-on finding rests on material that cannot travel whole; the complete edition is self-contained, with the grading method and "How to check this case yourself"; off-the-record sources travel whole with attestations and identity "Withheld"
- **Home:** DEC-112 (item 5 amended 2026-10-02 by K1254/K1263, restored by DEC-119)
- **Quote:** "Everything on which the case's conclusions are based must be presentable"
- **Binds:** COURTS, ANALYSIS, LAW
- **Reported by:** C2 (d313, d320)
- **Notes:** DEC-119: "Not all anonymity is the same." A relied-on finding resting on a member credited only at group or project level needs an independent corroborating leg.

### D195 · The group leads everywhere it acts; the product is software, never a publisher, a person or a firm, credited quietly; outward text names the product and the group
- **Home:** DEC-118 (Bob 2026-10-02; DR v2 §1, §9, §14; K1); DEC-124
- **Quote:** "It is software, never a publisher, a person or a firm."
- **Binds:** QUESTIONS, COURTS
- **Reported by:** C2 (d319, d326)
- **Notes:** none

### D196 · A case makes a completeness claim the system cannot verify, so its gate is that the author has stated what was excluded and why, as an explicit authored act at publication, never prefilled or a checkbox
- **Home:** CM §Is a case…; CM §What must NOT be lost; U5; invariant 7
- **Quote:** "It is **"has the author stated what was excluded, and why."**"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C4 (d417, d418)
- **Notes:** none

## Naming clashes

### D197 · "Standard" is a taken word: it can mean the group's evidence bar (DEC-17/DEC-54 `required_strength`) as well as a legal norm held in `standards`
- **Home:** DEC-54; DEC-17; constructs-brief corrections
- **Quote:** "a standard of evidence is a BAR (DEC-17 `required_strength{capture, connection}`)"
- **Binds:** LAW, ANALYSIS
- **Reported by:** C12 (d162)
- **Notes:** none

### D198 · "Obligation" is a taken word: in NOTIFICATIONS/queue-producers an OBLIGATION is a member's queue item (`template-review-requested`, `local-fact-due`), while DEC-107 reserves it for a public body's duty
- **Home:** queue-producers R20–R21; NOTIFICATIONS; DEC-107 (per brief); DEC-107 (Bob 2026-10-01: "Obligation" reserved on member and reader screens for a public body's duty; the queue's to-do class shown as "To do")
- **Quote:** ""OBLIGATIONs" here are member queue items (`template-review-requested`, `local-fact-due`)"
- **Binds:** ORG, LAW, TIME
- **Reported by:** C13 (d207); C2 (d308, d311)
- **Notes:** none

### D199 · "Matter" names what a plan addresses; "Subject" is used only for an entity
- **Home:** DEC-114
- **Quote:** ""Matters" for what a plan addresses; "Subject" only for an entity."
- **Binds:** LAW, COURTS, ORG
- **Reported by:** C13 (d237); C2 (d315)
- **Notes:** none

### D200 · Queue item kinds are "To do", "Noticed" and "Signal" in one list, re-sortable by time added, time due, case and type
- **Home:** DEC-110 (Bob 2026-10-01)
- **Quote:** "queue item kinds "To do", "Noticed", "Signal", one list, re-sortable by time added, time due, case, type"
- **Binds:** TIME, QUESTIONS
- **Reported by:** C2 (d311)
- **Notes:** none

### D201 · Never the word "claim" on public pages
- **Home:** DEC-111
- **Quote:** "never the word "claim" on public pages"
- **Binds:** QUESTIONS, COURTS
- **Reported by:** C2 (d312)
- **Notes:** none

### D202 · The product is named Civicsmith; records already signed keep their old labels and still verify; BIO and Believe in Oakland are unchanged
- **Home:** DEC-124 (Bob 2026-10-03); DEC-126 (wordmark with a plumb bob, brand only)
- **Quote:** "records already signed keep their old labels and still verify"
- **Binds:** all six
- **Reported by:** C2 (d326, d328)
- **Notes:** none

### D203 · Two constructs share the word "contradiction": contradicting aspirations are welcomed (the system looks for CONTACT on the goal axis) and must not be merged with conflicting claims
- **Home:** CM §Two constructs share the word; CF 2026-07-30
- **Quote:** "judging whether two aspirations truly conflict is semantic work the system cannot do"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C4 (d428)
- **Notes:** none

### D204 · A word two designs use differently is worse than none, because the disagreement is invisible until it ships
- **Home:** CM §R1 (UNRATED vs SUSPEND)
- **Quote:** "A word two designs use differently is worse than a word neither has, because the disagreement is invisible until it ships."
- **Binds:** all six
- **Reported by:** C4 (d438)
- **Notes:** none

### D205 · "Docket" is a taken word: a case's public response log, not a court docket
- **Home:** DEC-100; DEC-116; constructs-brief corrections
- **Quote:** "the docket never makes anything evidence"
- **Binds:** COURTS
- **Reported by:** C2 (d317)
- **Notes:** none

## Other

### D206 · Canon authority order: Roadmap §§1–12 current doctrine, §§13–15 history; the Design Requirements govern on conflict; Technical Architecture on technology; State Rules on the data store
- **Home:** RM header; CF §19 (single authoritative content design; Part II rules nothing new); CM status (non-authoritative; the plane and DEC-15..DEC-32 + R1–R4 govern)
- **Quote:** "the Design Requirements govern it on conflict"
- **Binds:** all six
- **Reported by:** C1 (d7); C3 (d391); C4 (d400)
- **Notes:** none

### D207 · The system fails if any requirement is violated
- **Home:** DR preamble
- **Quote:** "The system fails if any requirement is violated."
- **Binds:** all six
- **Reported by:** C1 (d20)
- **Notes:** none

### D208 · Designed for active opposition (disrupt, co-opt, discredit, infiltrate, legally harass): hope for good faith, prepare for opposition; every plan is checked for a branch answering a hostile response; access strategy must survive a hostile government
- **Home:** DR §13; TAD R13; AC §4 rule 12 (Bob 2026-09-30); DEC-1
- **Quote:** "Hope for good faith; prepare for opposition"
- **Binds:** all six
- **Reported by:** C1 (d27, d49); C10 (d73); C11 (d96)
- **Notes:** DEC-1: allowlist CLOSED; BIO "still does not disguise its requests" (SOURCE-ACCESS.md).

### D209 · The system is subject to the same evidence-based evolution it demands of its work products
- **Home:** DR §15
- **Quote:** "The system is subject to the same evidence-based evolution it demands of its work products."
- **Binds:** all six
- **Reported by:** C1 (d28)
- **Notes:** none

### D210 · Evenhandedness (invariant 7): compliance is recorded as carefully as noncompliance; policy preference must not colour compliance or significance judgements; a finding that cuts against the goal takes exactly the same path
- **Home:** FA L2 Fn4 and outputs; AC §2, rule 4; CON Step 8b (invariant 7)
- **Quote:** "Compliance is recorded as carefully as noncompliance."
- **Binds:** LAW, ANALYSIS, COURTS, ORG
- **Reported by:** C1 (d30, d31, d45); C10 (d89); C3 (d343, d344, d360)
- **Notes:** AC rule 4: "recognition and success stories are actions." FA: OP1 is "most tested at significance".

### D211 · A measure never edits the statement it measures, and its scope is registry-defined rather than hand-picked
- **Home:** CON Step 8a
- **Quote:** "The measure never edits the statement and its scope is registry-defined rather than hand-picked."
- **Binds:** ANALYSIS
- **Reported by:** C10 (d90); C3 (d333)
- **Notes:** CF changelog v0.10: "decay is loud and never blocking" (a measure may not edit or BLOCK a statement).

### D212 · Do the work upfront; exit discovery mode; make each new surprise cheap; no step is done until something consumes its output
- **Home:** CON Step 0 (Bob 2026-07-30); CON l.45–54
- **Quote:** "we must do the work upfront in order to end up with the results we need."
- **Binds:** all six
- **Reported by:** C10 (d91, d92)
- **Notes:** none

### D213 · Accountability is built on credible facts
- **Home:** RM §4 value 3
- **Quote:** "Accountability is built on credible facts. Nothing else holds up."
- **Binds:** all six
- **Reported by:** C1 (d10)
- **Notes:** none

### D214 · Follow the evidence wherever it goes; when the evidence changes, the findings change
- **Home:** RM §5 OP4
- **Quote:** "Follow the evidence wherever it goes. When the evidence changes, the findings change."
- **Binds:** ANALYSIS, COURTS, LAW
- **Reported by:** C1 (d11)
- **Notes:** none

### D215 · Output must be disciplined, but humans can be human
- **Home:** RM §5
- **Quote:** "civic OS OUTPUT must be disciplined, but humans can be human."
- **Binds:** QUESTIONS
- **Reported by:** C1 (d13)
- **Notes:** none

### D216 · Inform once, never nag: no severity ladder, no unread badge, no task per instance
- **Home:** DEC-69; DEC-70; DEC-10; DEC-94; K613–K615; PS VIOLATE; DEC-69 (Bob 2026-08-10; amended: members enabled to act singly or in bulk, forced into neither)
- **Quote:** "THE WORKFLOW MUST NOT NAG OR SECOND-GUESS MEMBERS. RESPECT FOR MEMBERS AND THEIR JUDGMENT IS A REQUIREMENT, AND ANYTHING SHORT OF IT IS A FLAW."
- **Binds:** TIME, QUESTIONS
- **Reported by:** C1 (d39); C10 (d87); C13 (d216, d231); C2 (d249); C4 (d424, d448)
- **Notes:** Informing at the act, once, is respect (fence sentence DEC-39, grade note at capture DEC-51, refusal reason DEC-49); rung-ladder ceremonies for terminal, attested and irreversible acts stay.

### D217 · Judgement lives in acts and reasons, never in a score
- **Home:** UX-ANSWERS OQ-8, OQ-14, OQ-25
- **Quote:** "judgment in acts and reasons, never a score"
- **Binds:** ANALYSIS, QUESTIONS
- **Reported by:** C13 (d216)
- **Notes:** none

### D218 · A capability a member does not hold is ABSENT from their interface, not present and greyed; identity is server-stamped
- **Home:** UI-KICKOFF; IC
- **Quote:** "a capability a member does not hold is ABSENT from their interface, not present and greyed"
- **Binds:** QUESTIONS
- **Reported by:** C1 (d39, d58)
- **Notes:** none

### D219 · Seven stages everywhere; the Action design replaces Case Making's action sections as the authority
- **Home:** K14; AC §5 rows 3, 13; AC §6 canon edits
- **Quote:** "seven stages everywhere (K14)"
- **Binds:** COURTS, LAW, TIME
- **Reported by:** C1 (d51, d52)
- **Notes:** none

### D220 · Self-correction stays in the record: a wrong reassurance is worth more as a record than as a deletion; reassuring in prose about something unmeasured is a named failure
- **Home:** DEC-63; DEC-42
- **Quote:** "a wrong reassurance about a live gate is worth more as a record than as a deletion"
- **Binds:** all six
- **Reported by:** C12 (d146, d175)
- **Notes:** none

### D221 · No "mark all as done"; a technical complication is never presented as a choice or a retry spinner
- **Home:** PS VIOLATE 1–10
- **Quote:** "a technical complication is never a choice or retry spinner."
- **Binds:** QUESTIONS, TIME
- **Reported by:** C10 (d87); C3 (d343)
- **Notes:** none

### D222 · No ballot on concluding and author-scoped division: de-escalation must never require permission from someone whose incentive may run the other way
- **Home:** DEC-30
- **Quote:** "de-escalation must never require permission from someone whose incentive may run the other way"
- **Binds:** COURTS, ANALYSIS
- **Reported by:** C11 (d132)
- **Notes:** none

### D223 · When Bob closes an open question on the substrate page, the page is updated in the same change that records the ruling
- **Home:** K438
- **Quote:** "the page is updated in the same change that records the ruling."
- **Binds:** QUESTIONS
- **Reported by:** C13 (d215)
- **Notes:** none

### D224 · System Design §3 claims to be the single authority on design status, but its state cells are a dated snapshot (construct-status.json retired; build state is build/)
- **Home:** SD status L4 vs §3 row 16; requirements/README.md
- **Quote:** "construct-status.json is retired (requirements/README.md); the build state is build/ (layer 9)"
- **Binds:** all six
- **Reported by:** C1 (d42)
- **Notes:** none

### D225 · Bob's rulings DEC-1 to DEC-67 (archived ledger on `coord`) are to be brought back onto `main` because the canon cites them
- **Home:** action-design deltas §9
- **Quote:** "DEC-1 to DEC-67 to be brought back onto `main` from `coord` "since the canon cites them"."
- **Binds:** all six
- **Reported by:** C13 (d233)
- **Notes:** Brief correction: DEC-1–67 were read by C11 and C12 from the archive; DEC-68 onward by C2.

### D226 · Where a bound sketch predates a later ruling, the ruling wins
- **Home:** DEC-115; action-design HANDOFF
- **Quote:** "Where a bound sketch predates a later ruling, the ruling wins"
- **Binds:** all six
- **Reported by:** C13 (d237); C2 (d316)
- **Notes:** none

### D227 · Provenance of Bob's words: points he did not state in the current session are cited from where they were recorded, never quoted as that session's
- **Home:** action-design HANDOFF
- **Quote:** "Nothing here should be read as a second, possibly conflicting, statement of them."
- **Binds:** all six
- **Reported by:** C13 (d238)
- **Notes:** none

### D228 · Custody: the group's root of trust is deferred until a running multi-member instance; the founder is told the whole truth about the hosting account's power at claim, with a standing "Who controls this copy" card
- **Home:** DEC-2 (deferred 2026-07-31); DEC-109 (Bob 2026-10-01)
- **Quote:** "deferred until we have a greater understanding from a running BIO instance with multiple members."
- **Binds:** QUESTIONS
- **Reported by:** C2 (d256, d310)
- **Notes:** C2: group-internal doctrine, bears on no construct directly.

### D229 · The system must carry members to a correct structure without philosophy, and must not be gameable
- **Home:** DEC-32 (Bob's constraint)
- **Quote:** "the average CivicOS [member] doesn't have a philosophy degree."
- **Binds:** ANALYSIS, QUESTIONS, LAW
- **Reported by:** C2 (d262)
- **Notes:** none

### D230 · Measure, do not assume: a rule requires a measurement; an answer derives from what each instance reports, not what was intended; a proxy states what it measures and misses, and a stated undetermined is a legitimate pinned result
- **Home:** DEC-43; CF §2 invariant 4; DEC-53 enactment; DEC-42
- **Quote:** "an intent is not a measurement"
- **Binds:** all six
- **Reported by:** C12 (d146); C2 (d266, d269); C3 (d343)
- **Notes:** none

### D231 · A project's stage display states what is still needed from the same rule that computes the stage (it can never promise a stage the computation would not give); `closed` shows its reason; colour is never the only signal; unearned rungs are stated, not hidden
- **Home:** DEC-79 (Bob 2026-09-29; K362, K364)
- **Quote:** "the display can never promise a stage the computation would not give"
- **Binds:** QUESTIONS, TIME
- **Reported by:** C2 (d280)
- **Notes:** none

### D232 · Converged refusals: the standard message first, then the act's own fixed remedy sentence, never a hidden field
- **Home:** DEC-83 (Bob 2026-09-29; K275)
- **Quote:** "standard message first, then the act's own fixed remedy sentence, never a hidden field"
- **Binds:** QUESTIONS
- **Reported by:** C2 (d287)
- **Notes:** none

### D233 · Significance is the members' judgement, kept in prose only: no field, value or vocabulary for significance, severity, priority, urgency or rank exists anywhere; opening an escalation needs a written reason and declining to escalate is its own reasoned act
- **Home:** DEC-89 (Bob 2026-09-29; OP1, K12; conformance R8, escalation R19)
- **Quote:** "PROSE ONLY: no field, value or vocabulary for significance, severity, priority, urgency or rank exists anywhere"
- **Binds:** LAW, ANALYSIS, COURTS, QUESTIONS
- **Reported by:** C1 (d30); C2 (d291)
- **Notes:** none

### D234 · Members are enabled to act singly or in bulk and forced into neither; a batch release records each document as its own entry; nothing is pre-ticked; contested and crucial documents show as not eligible before acting
- **Home:** DEC-69 (amended); DEC-97 (Bob 2026-10-01; Intake Doctrine §4)
- **Quote:** "members ENABLED to act singly or in bulk, FORCED into neither"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C2 (d249, d298)
- **Notes:** none

### D235 · WCAG 2.2 AA for every member screen and the published case
- **Home:** DEC-99
- **Quote:** "WCAG 2.2 AA for every member screen and the published case"
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C2 (d300)
- **Notes:** none

### D236 · On a phone a member reads everything and takes everyday (reversible and reasoned) acts; terminal, attested and irreversible acts need a larger screen; everything the interface needs ships inside the group's copy (no outside fonts, analytics or trackers)
- **Home:** DEC-122 (Bob 2026-10-03; DEC-31, K597 (5))
- **Quote:** "no outside fonts, analytics or trackers"
- **Binds:** QUESTIONS
- **Reported by:** C2 (d324)
- **Notes:** none

### D237 · `design-principles.html` (57 principles in nine families) is the yardstick every screen and wizard script is checked against
- **Home:** DEC-123 (Bob 2026-10-03)
- **Quote:** "is the yardstick every screen and wizard script is checked against."
- **Binds:** QUESTIONS
- **Reported by:** C2 (d325)
- **Notes:** none

### D238 · Aspirations and the intent layer set PRIORITY (which questions are asked first) and never filter evidence or order anything a member cannot finish
- **Home:** CF §12, §12.2; invariant 7 (D-77)
- **Quote:** "Aspirations set PRIORITY and never filter evidence ... it may not shape which answers get recorded or shown."
- **Binds:** QUESTIONS, ANALYSIS
- **Reported by:** C3 (d340, d362)
- **Notes:** none

### D239 · Every construct is instrumental to supporting members in all aspects of case development, and none is an end in itself
- **Home:** CF §1.1 (Bob 2026-07-30)
- **Quote:** "Every construct in this document is instrumental to that and none is an end in itself."
- **Binds:** all six
- **Reported by:** C3 (d342)
- **Notes:** none

### D240 · Raw bytes are never rewritten; classification is reversible and carries a basis and a date
- **Home:** CF §2 invariants 1–2
- **Quote:** "A proposal that violates one of these is wrong, not novel"
- **Binds:** all six
- **Reported by:** C3 (d343)
- **Notes:** none

### D241 · Event types come from a shared catalogue, never strings invented per content type
- **Home:** CF §6
- **Quote:** "event types come from a SHARED catalogue, never strings invented per content type."
- **Binds:** TIME, ANALYSIS
- **Reported by:** C3 (d348)
- **Notes:** none

### D242 · Aspirations and objectives must not be conflated: an aspiration written as an objective is never finished, an objective written as an aspiration is never checked
- **Home:** CF §12
- **Quote:** "Conflating these is the ordinary failure."
- **Binds:** ANALYSIS, TIME
- **Reported by:** C3 (d359)
- **Notes:** none

### D243 · Status marks: BUILT (in `main`, driven by the battery), DESIGNED, GESTURED, ABSENT; the ownership ladder runs bytes, structure, content, intent, record, retrieval, claim
- **Home:** CF Part II intro
- **Quote:** "(bytes, structure, content, intent, record, retrieval, claim)"
- **Binds:** all six
- **Reported by:** C3 (d371)
- **Notes:** none

### D244 · What the record says about bytes is the bytes' own word: type, title and state derive from the document, an envelope disagreement is refused, and a fact is stated once, in the document, with projections cleared by purge
- **Home:** CM status (D-510, D-526, D-547, D-563; C-86.1–C-86.4); CM §2 (D-148, D-21)
- **Quote:** "what the record says about those bytes is the bytes' own word"
- **Binds:** ANALYSIS, LAW
- **Reported by:** C4 (d405, d406)
- **Notes:** none

### D245 · Every stage requirement must name the doctrine it enforces
- **Home:** CM §god-object
- **Quote:** "**every stage requirement must name the doctrine it enforces.**"
- **Binds:** all six
- **Reported by:** C4 (d420)
- **Notes:** none

## Conflicts

Every pair of rules or sources that disagree, as the readers recorded them, with both sides cited.

1. Hunch refusal stated vs built: DR DEC-20 states `op=publishpreflight` refuses `UNCLEARED_HUNCH` (D40); SD §3 row 7 says the publication refusal for an uncleared hunch is NOT BUILT and the op is in no OPS table (REC-15). C1 d26.
2. System Design status: SD claims §3 is "THE SINGLE AUTHORITY ON DESIGN STATUS" from construct-status.json, while its own row 16 says construct-status.json is retired and build state lives in build/ (D224). C1 d42.
3. Observation log, row-whole withholding (§6) vs the `purged` annotation (§7) after a per-bundle purge: fail-closed taken (REC-103), conflict stated not resolved (D102). C10 d71. Also §3 `subject NOT NULL` vs §4.4's fold, resolved to `unstated` (D-366). C10 d72.
4. TAD (July 2026) makes soundness "machine-checkable" and has an AI "re-derive the conclusion" and an agent "record whether it holds" (TAD §5 l.532–544, §6 l.648–650) vs the layer-6 contract "the AI ... never attests or concludes" (D3); consistent only if read as an AI proposal a member decides. C10 d83.
5. Machine credentials and constitutive acts: DEC-52 lets a machine declare relations, resolve references and thread progressions (D8), moving DEC-24's boundary and reversing the field comments that called these "a member's constitutive statement"; any reading that relations are member-only (D118) must yield to DEC-52. C12 d155–157.
6. Who adds a product module: the brief (P4/P6) and filing-templates draft ("the module split is architecture, also his", d197) make it Bob's; the action-plans ruling records adding `action-plans` as BOB's, Bob calling it "a technical detail" (d223) (D143, D145).
7. Transitive trust: TAD §5 "no transitive trust" (original) vs AUTHORITY-AND-TRUST ruling 2026-07-30 "accepted so long as it is disclosed" — resolved by the revision (D46). C1 d9, C10 d80.
8. Import landing: DEC-45 det. 2 (import may join an existing project) overruled by DEC-46 (3) (a new project per distinct source bias) (D179). C12 d149, d153; C1 d55.
9. Case model: the built store published ONE inquiry as a case (store.mjs:3539) vs DEC-44's container over one or more findings; the build was corrected to DEC-44 (D178). C12 d147.
10. Declared-bias subject kinds: the anatomy said "source, institution, office, or TOPIC", safeguard 4 "sources, institutions, offices and MOVEMENTS"; DEC-6 corrected the defect and held the kind list open (D63). C11 d102.
11. DEC-82's "an answer is only as strong as the weakest thing it depends on" (C2 d283) vs DEC-32's MAXIMUM over OR-related branches (d260): reconcilable only if "depends on" means the necessary (AND) legs; DEC-82 does not overrule the OR-max arithmetic (D73, D69). C2 d284.
12. DEC-52/DEC-53 (a machine credential may DECLARE, RESOLVE and THREAD into the record directly, machine-attributed) vs the brief's "the machine never concludes or attests": the doctrine is attribution (a machine act stands AS machine), not a ban on all machine record-writes; check DEC-52's exact scope (D8, D3). C2 d268; C12 d156.
13. DEC-120 (a wizard step may place a LABELLED DRAFT in a field; DEC-101 and K1019 already allow it for "what changed" and the escalation reason) vs DEC-32's citation of "the J-construct's never-prefill rule" (a prefilled justification invites rationalisation) and CM §4a: whether a labelled draft may fill a JUSTIFICATION or reason field is not settled; check Interaction Constructs §P and §J (D14, D165). C2 d322; C4 d414.
14. DEC-120 replaces ASSISTANT-PILOT §3's no-prefill rule and DEC-90's "the wizard never fills or presses a control" (fill only) (D14, D27). C2 d292, d321.
15. Content Framework invariant numbering: the changelog calls "derived things inform, authored acts bind" invariant 9 and the goal-directed-collection guard invariant 8; §2's list numbers them 8 and 7 (Incomplete §12 cites invariant 7 for D-77, matching §2). Cite by text, not number (D67, D210). C3 d344.
16. Jurisdiction in product code: `bio-plane/src/idspaces.mjs` holds jurisdiction-specific recognisers (Legistar C.M.S. floor, the Alameda APN on M-157's key) and the build derives an office's "independent system" through a "measured Oakland table"/"measured host" list, vs build/layers.md "No jurisdiction in the product" and BOB #35's "never a per-instance table a machine applies" (D138, D127). C3 d341, d358.
17. The brief's "Declared Bias: relations are constitutive, never traversed (safeguard 4)" vs Declared Bias's text: safeguard 4 says relations are declared, justified and citable and that mechanical equivalence extends exactly as far as the registry declares (bias collision follows them); the "constitutive … never traversed" wording is entities R26 and CF §13 (D118, D126). C4 d398; brief corrections.
18. The brief's private-individuals safeguard in Declared Bias vs Declared Bias's text: it has only the NATURAL PERSON residual (a bare person-subject scrutiny statement is admitted) and an office-as-prior-by-role caution; the private-individual rule is Actions R9 (D106, D107). C4 d399.
19. Hunch composition: DEC-15 determinations and Declared Bias say a hunch is PRESENT and "composes normally while open" (C11 d117) vs DEC-104 (Bob 2026-10-01): "a hunch never lifts strength", correcting Declared Bias's "composes normally" (D41). C2 d305. The later ruling governs.
20. Project bar scope: DEC-17 "AN INQUIRY OUTSIDE ANY PROJECT HAS NO BAR" and strictest-across-citers composition (C11 d120; C12 d149) vs DEC-72 (Bob 2026-08-10), which supersedes DEC-71, DEC-17's strictest-across-citers composition and project-less publication (D53). C2 d252.
21. Off-the-record sources: DEC-112 (5) (off-the-record sources travel whole, identity "Withheld") amended 2026-10-02 by K1254/K1263, then K1254/K1263 withdrawn and DEC-112 (5) restored by DEC-119 with a corroboration guard (D194, D114). C2 d313, d320.
22. Publication ceremony: DEC-33 (2026-08-03, confirmed 2026-09-18) deferred the member-facing ceremony and pre-flight vs DEC-80 (2026-09-29): DEC-33's trigger fired and both are built in the redesign, including the uncleared-hunch refusal; this also bears on C1's stated-not-built hunch refusal (D150, D189, D40). C2 d264, d281.
23. Register observation (not flagged by a reader): CM §2 UI-102 says the record never relates a machine proposal to a member's later act ("that a member acted BECAUSE of a proposal is a claim about a person that the record cannot support", C4 d402) while DEC-77 has the record keep "whether member chose unaided or accepted which recommendation" (C2 d277). Reconcilable if DEC-77 records the acceptance ACT, not a cause (D117, D25).
24. Register observation: CM §What a CLAIM is says there is no evidential-sufficiency threshold in the record ("enough" is a property of intended use, C4 d423) while DEC-17/DEC-72 give every project a declared bar that gates publication (d120, d252). Reconcilable because the bar is the project's declared intended use, but an analyst citing either should cite both (D95, D53).

## Coverage check

- Bullets in `digest/DOCTRINE.md`: 1055 (lines beginning `- `, top-level or nested), of which 414 lie in the ranges read so far.
- Register entries: 245.
- Every bullet in the ranges read maps to at least one entry (its line appears in that entry's *Reported by*); a bullet carrying several rules is cited under each. No bullet was dropped: exact duplicates are merged into the entry they repeat and listed there by reader id.
- Bullets per reader: C1 54, C10 29, C11 37, C12 42, C13 55, C2 82, C3 60, C4 55.
