# working extraction: PRACTICE-SURVEY.txt (306 lines)

WHAT: outside-in SURVEY 2026-08-01 by BOB for case-making design (D-127) and queue construct; "A survey, not a design and not a measurement" — vendor claims as of 2026-08-01, never re-checked; four of SK-3's five standing prohibitions taken verbatim from items 2–5 of its DELIBERATELY VIOLATE list (`bio-plane/src/skilldoctrine.mjs` exports path as `SURVEY_SOURCE`; `skillprohibitions.test.mjs` asserts); ADOPT list adoption not tracked anywhere. Serves construct 12 (member surfaces, interaction constructs) and construct 8 (intent and inquiry); SOURCE OF RECORD for SK-3 under construct 11 (assistant and AI roles has no level-1 document per System Design §3).

## chunk 1-110
QUESTIONS
- [BUILT] Status l.3-4 — four of SK-3's five standing prohibitions (assistant/skill doctrine) taken verbatim from DELIBERATELY VIOLATE items 2–5; asserted by test.
- [GAP] Incomplete l.10 — three cheap falsifier tests never run; l.11 ADOPT adoption status not carried anywhere; l.13 four no-precedent gaps not costed.
- [EXAMPLE] §1 l.55 — DocumentCloud: note anchored to a REGION of a page; "note visibility is a property of the note — private / organization / public"; notes searchable. NEED implied: members expect visibility legible at a glance; searchable annotations.
- [EXAMPLE] §1 l.56 — Zotero: highlight then "Add Note from Annotations" — each excerpt carries citation and jump-back link; "the round trip from claim back to the exact page is one click" — NEED: claim→exact page round trip; citation travels with excerpt. Cuts against: "whether the source *supports* the claim is entirely the user's problem. Nothing computes or displays strength".
- [DOCTRINE] §1 l.60-64 — Collision: Zotero extract-my-annotations is the one auto-composition BIO could take unchanged because "it assembles the member's OWN prior words and never generates new ones. That is the line the prefill rule actually draws." — "drafting a justification for them is [attribution]".
- [EXAMPLE] §2 l.73 — OCCRP Aleph: cross-referencing a list of names against 300+ public datasets; "machine-proposed matches are presented as *leads to check*, not as facts — the framing D-82 requires"; "a match is a name collision until a person judges it".

ORGANISATIONS
- [EXAMPLE] §2 l.72 — IBM i2 Analyst's Notebook: "who is connected to whom"; "the entity–link–property model ... the most widely learned investigative data model there is" — NEED: members arrive expecting entity/link/property. Cuts against: "a drawn link reads as an established relationship. The chart has no visual grammar for "this edge is grade D" or "undetermined"", centrality metrics = compellingness, not support.
- [EXAMPLE] §1 l.57 — Obsidian backlinks pane: "what points at this" shown on the thing pointed at is "now a near-universal expectation" (NEED); graph view "rewards connection density visually. A dense graph looks like insight and is not evidence of any"; unlinked mentions = string coincidence.
- [EXAMPLE] §2 l.73 — Aleph cross-referencing entities against public datasets (entity matching across corpora; candidate matches, not facts).

TIME
- [EXAMPLE] §2 l.74 — Everlaw Storybuilder: "fact timelines where each fact is backed by evidence", "a chronology derived from those facts, is the closest commercial analogue to `inquiry`" — NEED: fact-backed chronology/timeline. Cuts against: Drafts half is narrative composition; "no strength composes across the chain".

COURTS
- [EXAMPLE] §2 l.74 — Everlaw Storybuilder: "discovery → trial prep: turn reviewed documents into a case"; Evidence page with "deposition excerpts".
- [NEED] §3 l.88-95 — e-discovery chain of custody: "every document can answer "where did this come from and who touched it" without anyone reconstructing it afterwards" (lawyer's expectation); BIO's provenance chain and `op=export`/`exportlog` = same artifact, hash-anchored.
- [EXAMPLE] §3 l.96-104 — privilege log ("withhold-and-log") resembles BIO's exclusion statement on a case; "a privilege log exists to PROTECT the withholder; BIO's exclusion statement exists to EXPOSE the author"; Relativity's automated log generation "is exactly the prefill BIO must refuse".
- [NEED] §3 l.105-109 — "Production is a deliberate, formatted, irreversible act" (Bates numbering, redaction, slipsheets, endorsements, load files); lawyer expects producing is "a distinct heavy step with its own settings" → supports keeping ATTESTATION on its own rung of the weight ladder.

LAW
- (§3 legal-claim support framing; no statute content in this chunk.)

ANALYSIS
- [EXAMPLE] §1 l.58 — NVivo codebook: every code has definition and inclusion/exclusion criteria; inter-coder agreement computed (percentage agreement, Cohen's kappa); coding changes audited — same discipline as `C-` catalogue. Cuts against: "agreement statistics are easy to read as validity" — CLAUDE.md "an equality that costs nothing to produce is not evidence".
- [EXAMPLE] §2 l.72 — social-network centrality metrics rank importance by graph shape = compellingness, not support (computed metrics that mislead).

DOCTRINE
- [DOCTRINE] l.42-47 — audience non-technical; familiar shapes "optimised for *compellingness*, which `BIO_Case_Making_v0_1.md` §4a names as the wrong axis".
- [DOCTRINE] §2 l.77-80 — Case Making §4a: "easy to build a supported case, hard to state an unsupported one."

## chunk 110-209
ANALYSIS
- [DOCTRINE] §3 l.110-113 — "Scored relevance": Relativity "AI-powered privilege decisions"; "A confidence score smooths an undetermined leg into a number. BIO's strength is weakest-link over graded connections (D-72), and `undetermined` must survive the composition rather than be averaged away." (composition rule for derived grades)
- [EXAMPLE] §5 l.137-138 — GitHub: "the unread count is the primary signal — a volume proxy standing in for meaning" (counts misread as meaning).

TIME
- [NEED/EXAMPLE] §4 l.121 — MuckRock records requests: "status names whose move it is: Awaiting Acknowledgement / Awaiting Response / Awaiting Appeal / Completed; follow-up is driven by the agency's own estimated date"; "The clock belongs to the COUNTERPARTY, not to us"; closest analogue to BIO `action` states (`awaiting_response`). Cuts against: "tracks the request, not the finding it produces; nothing links a response back to what it was asked for". (NEED: deadlines from counterparty estimates; appeal stage; link response to request.)
- [NEED/EXAMPLE] §4 l.122 — Linear: "snooze that returns on a date OR on new activity, whichever comes first"; rules route by priority/creator/due date/SLA; snooze semantics = Interaction Constructs v0.2 standing queue entry; silently reassigning rule = "silently dropped" failure D-79 forbids "unless it ages with a recorded reason".
- [EXAMPLE] §4 l.123 — Jira-class: assign, prioritise, "meet a date"; "severity ladders rot upward" — NOTIFICATIONS.md sorts by class instead.
- [NEED] §5 l.129-136 — GitHub notifications: group by repository OR by date; reason label per item — "Grouping by the user's unit of work, and telling them WHY an item is in front of them, are both already learned" = DEC-10 grouping-by-case and item contract's `basis`.
- [NEED] §5 l.146-149 — Linear Inbox snooze until a chosen time or new activity — "the aggregation behaviour BIO needs and the one place a commercial tool matches the doctrine without adjustment".

ORGANISATIONS
- [EXAMPLE] §4 l.121 — MuckRock: the counterparty AGENCY owns the clock (agency's estimated date) — org as obligor of a response.
- [DESIGN] §5 l.151-155 — NOTIFICATIONS.md classes: "an OBLIGATION resolved leaves everyone's list, a FINDING dismissed is an authored record act with an author and a reason, a CONDITION acknowledged is personal only" — (OBLIGATION here = the group's own obligation item class).

LAW
- [EXAMPLE] §4 l.121 — records requests (public records law) with acknowledgement/response/appeal stages.
- [EXAMPLE] §6 l.188-197 — Perma.cc: "roughly 70% of links in law-journal citations and about half in cited U.S. Supreme Court opinions no longer reached the cited material"; "the act of citing captures the source"; "A citation resolving to a snapshot first and the live URL second is an established scholarly and judicial convention" — precisely BIO's captured bytes plus hash; archive-fallback surface explains something "a lawyer or editor already accepts".

COURTS
- [EXAMPLE] §6 l.188-193 — Perma.cc measured link rot in "cited U.S. Supreme Court opinions"; 150+ law journals and Law Library of Congress users (judicial citation convention).
- [EXAMPLE] §6 l.179-185 — Bellingcat: show-your-work; archives source material; "open-source evidence ... upheld in a human rights court" (2023 source) — U12's target reading experience; does badly: reader composes, "Nothing states the STRENGTH of the conclusion or what was excluded."

QUESTIONS
- [NEED] §6 l.161-170 — Wikipedia verifiability: burden on editor; inline citation that DIRECTLY supports contentious claims, esp. "about living persons"; `{{Citation needed}}` marks gap in place; "a superscript marker means "this rests on something you can check"", "a visible gap marker is normal rather than shameful" — best-known precedent for rendering `undetermined` first-class.
- [NEED/GAP] §6 l.171-178 — Wikidata `somevalue` / `novalue`: known value, unknown value ("some value exists, we do not know it"), no value ("there is positively none") — both asserted statements, not absences; "names a distinction BIO's own `undetermined` currently blurs: "we could not determine" and "there is none" are different claims."
- [DESIGN] §5 l.139-145 — GitHub Checks API: producer declares up to three action buttons `{label, description, identifier}` — precedent for NOTIFICATIONS.md rule 1 "options come from the producer, the surface only renders them".
- [ADOPT 1] l.203-205 — backlinks on the cited thing; "U3 already ships `load-bearing-for` from reverse citations; keep it and extend it to inquiries." (BUILT claim: U3 ships load-bearing-for.)
- [ADOPT 2] l.206-208 — annotation visibility colour-coded property → D-15's three visibility positions and two-bucket fence.

DOCTRINE
- [DOCTRINE] §5 l.151-155 — clearing is not personal hygiene: "A single "mark all as done" button would erase the distinction".
- [DOCTRINE] §6 l.163 — contentious claims about living persons need inline direct citation (bears on private-individual doctrine).

## chunk 209-306
ADOPT list (each a NEED members arrive with)
- [NEED] ADOPT 3 l.209-211 — inbox grouped by member's unit of work, each item with its reason (DEC-10 group-by-case; item `basis`).
- [NEED] ADOPT 4 l.212-213 — "Snooze that returns on a date OR on new activity, whichever is first" (TIME).
- [NEED] ADOPT 5 l.214-216 — producer-declared options rendered by surface; drift UI-PLAN measured against `op=searchfields`.
- [NEED] ADOPT 6 l.217-219 — "Status names that say whose move it is" (MuckRock); `action.awaiting_response` matches; "extend the naming discipline to the rest of the lifecycle" (TIME/ORGANISATIONS: whose move = which party owes the next act).
- [NEED] ADOPT 7 l.220-222 — "A citation resolves to the capture first" (Perma.cc); makes archive fallback and grade C legible (LAW/COURTS citation convention).
- [NEED] ADOPT 8 l.223-225 — defined catalogue entry before a category applied, recorded change to definition (NVivo) = `C-`/`N-` discipline (ANALYSIS: coding/categorisation with definitions).
- [NEED] ADOPT 9 l.226-227 — visible gap marker in published text (`{{Citation needed}}`; Wikidata somevalue/novalue) (QUESTIONS/DOCTRINE undetermined).
- [NEED] ADOPT 10 l.228-229 — assembling member's OWN prior annotations into a note; "Permitted precisely because it generates no new words."

DELIBERATELY VIOLATE (DOCTRINE; items 2–5 are SK-3 prohibitions BUILT in skilldoctrine.mjs)
- [DOCTRINE] V1 l.236-239 — "No narrative drafting surface" — "The tool may hold facts, order them and show what backs them; it may not help compose the argument." (Case Making §4a; prefill rule extended to whole argument) — note: "order them" permits chronology.
- [DOCTRINE/BUILT] V2 l.240-243 — "No generated justification, reason, template or suggested wording anywhere"; "a generated one is a fabricated attribution." (SK-3)
- [DOCTRINE/BUILT] V3 l.244-246 — "No single confidence score"; "Strength is weakest-link over graded legs, and an `undetermined` leg must remain visible as undetermined rather than being smoothed into a number." (SK-3) (ANALYSIS)
- [DOCTRINE/BUILT] V4 l.247-251 — "No connection-density or centrality ranking, and no graph view that rewards it"; "the grade travels with the edge and an ungraded edge renders as `undetermined`, not as a thinner line" (SK-3) (ORGANISATIONS: relation graphs; ANALYSIS: no network metrics).
- [DOCTRINE/BUILT] V5 l.252-255 — "Machine-proposed connections are never presented as connections"; "D-82: a derived thing must LOOK derived, because what the member needs to know is that nobody has judged it yet." (SK-3) (ORGANISATIONS/QUESTIONS)
- [DOCTRINE] V6 l.256-258 — no severity ladder, no unread badge as primary signal; "a count is a volume proxy and volume is not meaning."
- [DOCTRINE] V7 l.259-261 — no "mark all as done"; dismissed FINDING is authored record act with reason; only a CONDITION cleared personally.
- [DOCTRINE] V8 l.262-265 — exclusion statement points at its author; "authored, never-prefilled admission of what was left out — the enforcement point for invariant 7."
- [DOCTRINE] V9 l.266-269 — "Publishing is not a toggle"; D-127 rejected `finding.published = true`; ratification attested, irreversible, ceremonial — top rung of weight ladder.
- [DOCTRINE] V10 l.270-273 — "A technical complication is never a choice, and never a retry spinner": "A paced governor, a subrequest ceiling, a CID-font PDF: the system classifies it and shows status where the thing lives." (compute limits surfaced as status; NOTIFICATIONS.md rule 4).

NO PRECEDENT (GAPs)
- [GAP] l.282-284 — "A completeness claim as an authored, published field" — no tool asks author to state what they left out.
- [GAP] l.285-287 — "Strength composing along a basis chain, where a case built on a case cannot be stronger than the case beneath it. Everlaw links facts to evidence; nothing computes over the link." (ANALYSIS)
- [GAP] l.288-290 — "A published conclusion that is an INPUT to the next inquiry rather than a terminus" — published case citable as basis with strength inherited (precedent-like reuse of own findings; COURTS analogy).
- [GAP] l.291-292 — "One object that renames through its lifecycle (inquiry → finding → case)".

FALSIFIERS (OPEN; none run)
- [OPEN] l.298-300 — U9 triage with producer-declared options still needing local kind→actions map → adopt-item 5 wrong.
- [OPEN] l.301-303 — if members ask "which of these is most urgent" of a class-sorted queue often, "the queue needs an ordering rule that is not volume" (TIME: urgency/deadline ordering need).
- [OPEN] l.304-306 — empty/boilerplate exclusion statements → violate-item 8 satisfied formally not substantively.
