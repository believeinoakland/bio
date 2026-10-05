# System Design extracts (BIO_System_Design.txt)

## chunk 1-160
TIME
- [BUILT] §3 row 2 L90 — "a composite capture states the TEMPORAL SPREAD of its parts (D-191): the manifest's part_fetch_spread ... gives the earliest and latest instant its held parts were fetched PER CLOCK"
- [BUILT] §3 row 2 L89-90 — "a hop attests 'these bytes, this URL, this time' and no more"; TSA co-attestation (independent timestamp)
- [BUILT] §3 row 4 L97-98 — CROSS-VERSION NOTICE (D-394, framework §18.1, IC-239): op=versionnotice answers "whether the document's address holds a NEWER capture" for a question's cited passages; member surface UI-96 on question page (version over time)
- [BUILT] §3 row 6 L103 — "progressions as the many shapes a happening takes, with the missing predecessor as a finding"; BUILT "progressions, with missing-predecessor and overdue-successor findings" (lateness/pattern from document sequence); "referential and temporal connections as DATA with their own grade"
- [BUILT] §3 row 6 L104-105 — "a finding a member dismissed or deferred STAYS LISTED on op=instance ... and op=captureprogressions and carries the decision about its (progression, stage) with the version it judged"
- [BUILT] §3 row 5 L100 — doctype readers include "meeting calendar, agenda, minutes, staff report, regulation, staff directory (FW-20 ...)" (meeting calendar = recurring meetings source)
- [BUILT] §3 row 8 L111-112 — "A RECORDS REQUEST IS ONE ROUND TRIP (D-147 ...)": correspondence entry may state its `stage`; "a FEE QUOTE IS EVIDENCE (D-148)"
- [BUILT] §3 row 8 L112 — "each project keeps its own dated, authored, APPEND-ONLY history of conclusions and withdrawals" (PARTIAL)
- [BUILT] §3 row 10 L117-118 — monitoring on alarm scheduler; op=monitor "says which cadence governs (D-65); the monitor cadence schedules an ADDRESS, not a bundle, and a document authoring no frequency by its content type's contract (REC-191; D-220)"
- [BUILT] §3 row 14 L129 — "one reconciling Durable Object alarm ... interruption recovered by re-deriving outstanding conditions from durable state"
- [BUILT] §3 row 3 L93 — "history is append-only at the write (State Rules §2.4, REC-176)"
- [BUILT] §3 row 13 L126 — "editions (DEC-12)"
- [DESIGN] §3 row 16 L133 — Action "from the first suspicion through planning, preparing, deciding and sending to tracking the response and recording how it ended"; NOTIFICATIONS.md "for its reminders"
ORGANISATIONS
- [BUILT] §3 row 6 L103 — "the entity axis (registry, aliases, constitutive relations, graded resolutions)"; BUILT "the entity registry, aliases, constitutive relations, and graded resolutions (at document grain)"
- [BUILT] §3 row 5 L100 — "staff directory" doctype reader (FW-20, M0-32's fourth class, read at tier 2 — M-121) (source for positions/holders)
- [BUILT] §3 row 7 L106 — "the subject registry (the same construct as the entity axis)"
- [BUILT] §3 row 3 L94 — a bundle's `group` "the producing group's slug in its signed bytes ... is ONE recorded value per instance (D-436, IC-172)"
- [BUILT] §3 row 1 L84 — membership: "who may perform which act, and what an act is worth when a machine performs it" (group's own organisation, not government)
- [BUILT] §3 row 13 L128 — "the publishing group's public identity (BIO_Publication_v0_1.md §7, BOB #24)"
- [BUILT] §3 row 13 L127-128 — "attribution levels for a member's observation ... op=attribute ... choosing group, project, cover or name"
LAW
- [BUILT] §3 row 5 L100 — "regulation" doctype reader (law as a document type)
- [BUILT] §3 row 8 L112 — "a records request names every law that governs it (D-149, BIO_Case_Making_v0_1.md §2), plane half: op=actionlaws sets an action's governing_laws[] — each law by citation at its level (federal, state, local; law_levels published)" (law hierarchy by level)
- [DESIGN] §3 row 6 L103 — "'every document that concerns this ordinance' is one query" (ordinance as entity; meaning axis)
- [DESIGN] §3 row 16 L133 — Action construct: "standards, conformance determinations, consequences, action plans, actions, filings and communications, and the escalation protocol"; home BIO_Action_v0_1.md (canon 2026-09-30); "GRADE-A-CAPTURE.md for the venue's standard of evidence"; state "not rendered: ... the build state is build/ (layer 9)"
- [ABSENT] §3 row 8 L113 — "a standard of proof per production or audience (only the project's strength bar exists)"; "what remains owed is RESEARCH, not design — the catalogue of standards by audience and output act"
COURTS
- [BUILT] §3 row 8 L111 — "an action's risk tier is 1, 2, 3 or UNDETERMINED, read in the plane's published words and never defaulted to 1 (D-182)"; risk tier revised by "AUTHORED, APPEND-ONLY act with a REQUIRED reason (op=actionrisktier ... REC-214)"
- [DESIGN] §3 row 16 L133 — "GRADE-A-CAPTURE.md for the venue's standard of evidence" (venue = court/forum)
- [BUILT] §3 row 8 L109 — CONTRADICTION "in the WORLD it is a FINDING the system exists to find, in the RECORD it is a defect in our own holding carrying a DUTY to identify, present and resolve, and imprecision is NEITHER (Q14, ruled 2026-09-17)"
ANALYSIS
- [BUILT] §3 row 5 L100-101 — CSV format entry (FW-23 ... "written from all 166 .csv keys of s3://cao-94612 measured whole — M-144"); CSV reading's DIALECT persisted (REC-218) — datasets as captured material
- [BUILT] §3 row 4 L96-97 — content extents: "document, pdf-page, sheet-cell, slide-shape, doc-para"; L98 "the content extent kinds are exactly these eight"; L100 "tables and images as content: the sheet-range, doc-table and image extent arms are landed (FW-19)" — table/sheet cell addressable (input to calculation)
- [BUILT] §3 row 8 L109 — "its strength composed by DEC-32's arithmetic" (computed strength)
- [BUILT] §3 row 9 L115 — "relevance computed over the rows the VIEWER can see and published as an ORDER, never a score (D-447, IC-238)"
- [DOCTRINE] §1 L42-44 — "an equality or outcome that costs nothing to produce is not evidence"
- [DESIGN] §3 row 16 L133 — Action includes "consequences" (calculation per brief)
QUESTIONS
- [DOCTRINE] §1 L28-29 — "Civicsmith exists to answer questions, make a case, tell a story, and take action to affect a living civic system (Bob, 2026-08-01)"; path "questioning, exploring, discovering, documenting, and impacting"
- [DOCTRINE] §1 L44-45 — "derived things inform, authored acts bind — the machine may do the LOOKING, the member does the CONCLUDING (DEC-24)"
- [DESIGN] §2 L53-54 — members reach the instance through member surfaces "and, where they choose, through an assistant that works under the same fences"
- [DESIGN] §3 row 11 L119 — assistant: "the machine may FIND / PURSUE / EXTRACT / CHECK and request capture; it never touches the provenance chain, never attests, never concludes; its work is labelled and graded as machine work; the investigative session and its run log; the skill and doctrine pack; the credential cascade through agent-worker"; importance "one way in, on every surface; central to what BIO offers"
- [BUILT] §3 row 11 L119-121 — investigative session: runs, bounds, ticks, close, spawn, suggest; CHECK runner deployed; "an ai credential is refused at every attesting or ratifying op but op=attest"
- [GAP] §3 row 11 L121 — "ABSENT: the EXTRACT role is NOT deployed in the fleet ...; the assistant pilot's flow: a prompt entry, INTERPRET, the classifier and the wizard; a member surface for AI-proposed readings" (natural-language entry ABSENT)
- [BUILT] §3 row 9 L115-116 — four-level search "(meaning, content, documents, the open internet) — a search that returns documents has not finished; the query compiler with one compilation point; FTS5"; BUILT document-grain FTS5, content-grain `content:`/`passage:` arms, meaning arms (resolves:, concerns:, leg:), observation log, frontier; PARTIAL internet-level read; ABSENT member surface for frontier and content axis
- [DESIGN] §3 row 9 L115 — "saying WHICH absence is true is a first-class obligation"
- [BUILT] §3 row 4 L97 — "REC-86's on-point narrowing of a LEG: the machine's candidates (op=narrowcandidates, labelled machine work)"
- [BUILT] §3 row 12 L124 — "an agent-surfaced question is marked wherever a question is listed or shown (D-82; §P accountability rule)"
- [BUILT] §3 row 5 L100 — "AI-proposed readings, kept out of coverage (the EXTRACT role's plane half)"
- [GAP] §3 row 12 L124-125 — "a member cannot publish or ratify from the UI ...; a member cannot start a CHECK run from the UI"
DOCTRINE
- [DOCTRINE] §1 L34-40 — stance: "bad actors are identified by EVIDENCE, never assumed by role"; "the trustworthiness of the record"; "A defect that lets the record claim more than it can support is worse than a missing feature."
- [DOCTRINE] §1 L42-43 — "undetermined is first-class and must be stated"
- [DOCTRINE] §4 L150-154 — "grade tracks directness and never composes across scales (capture grade is the document's; a content's derivation cap is its own; a connection's grade is a third; DEC-21 shows both on one leg and CPDF-10 forbids a third scale); and every layer may be sparse, and absence at one level is not evidence of absence at the next (Part II §14.3)"
- [DOCTRINE] §3 row 6 L103 — "a machine-proposed connection is a HUNCH until earned"
- [DOCTRINE] §3 row 12 L122 — UNDETERMINED as display primitive; "guiding voice (inform once, never nag — DEC-69; nothing prefilled; capability absent, never greyed)"
- [DOCTRINE] §3 row 7 L107 — ABSENT: "PUBLICATION REFUSAL for an uncleared HUNCH is NOT BUILT ... UNCLEARED_HUNCH is a refusal code this plane does not carry"
- [DOCTRINE] §3 row 16 L133 — "every outward act is a member's, rests on the record, and names its basis"
- [DOCTRINE] §4 L139-148 — dependency runs one way: membership → capture → record → content → meaning → bias → inquiry → retrieval → assistant → surfaces → publication → distribution/operations (Action, row 16, not placed in this narrative)
- [DOCTRINE] status L4 — §3 ruled "THE SINGLE AUTHORITY ON DESIGN STATUS" 2026-09-17; but row 16 notes construct-status.json "is retired (requirements/README.md); the build state is build/" — CONFLICT/staleness: §3 state column is from a retired mechanism

## chunk 161-315
TIME
- [DESIGN] §5 M1 L256 — "the instance keeps its own record current, unattended" (constructs 10, 14)
- [RULING] §7 L304-305 — "A case is a production of a project; publication is one-way; return is a new edition — DEC-72, DEC-19, DEC-12."
ORGANISATIONS
- [DESIGN] §4 class diagram L187-191 — Meaning class: "entities, resolutions; connections, grade; progressions"; L230 "DeclaredBias --> Meaning : shares the subject registry"
- [DOCTRINE] §7 L307-308 — "No structural prior against any class of actor; bad actors are identified by evidence — CLAUDE.md, 'The stance'."
- [DESIGN] §5 M2 L257 — "every document class Oakland publishes can become evidence" (rung text names a jurisdiction)
LAW
- none further in 161-315 (doctrine spine only)
COURTS
- none in 161-315
ANALYSIS
- [RULING] §7 L302-303 — "Legs compose by AND/OR; weakest governs across AND, strongest across OR; sufficiency only by an attributed act — DEC-32." (the only computation over grades)
QUESTIONS
- [DESIGN] §4 L205-208, L237-238 — Assistant class "FIND PURSUE EXTRACT CHECK; never attests"; "Assistant --> Retrieval : looks through"; "Assistant --> Capture : requests capture" (no edge from Assistant to Action/standards)
- [RULING] §7 L297 — "The machine may EXTRACT; the member concludes — DEC-24; Part II §14.5."
- [DESIGN] §5 M8 L263 — "a member can reach what the record holds" (12); M9 "a member can state what they found, and what it rests on" (8)
DOCTRINE
- [RULING] §7 L296 — "Content is the unit; a document is not the answer — DEC-23"
- [RULING] §7 L298-299 — "Machine-read text is never indistinguishable from publisher text; OCR never raises a capture grade; fidelity bounds the capture axis, no third scale — DEC-4, CPDF-10."
- [RULING] §7 L300-301 — "Undetermined is first-class and stated; an outcome that costs nothing is not evidence; the publication fence sits on the provenance chain"
- [RULING] §7 L306 — "inform once at the act, never nag — DEC-69"
- [DESIGN] §4 class diagram L160-245 — 14 classes; Action (row 16) absent from the diagram; no edge into Action from Inquiry/Meaning; diagram predates row 16
- [DESIGN] §5 L248-265 — M0-M10 ladder; M10 "the group can stand behind what it found, and act on it" (8, 13) — Action (16) not mapped to a rung
