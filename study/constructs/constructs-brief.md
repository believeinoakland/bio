# Brief for the construct studies (BOB #110, 2026-10-05)

## Why
Bob (the product owner) asked U41 "what can Civicsmith do with six kinds of material". A first check (files u41-area1-2.md, u41-area3-4.md, u41-area5-6.md in this scratchpad) confirmed narrow gaps. Bob then said, in his words:

> "the level of support for constructs like time need to be richer than just being able to track a court deadline. ... the level of understanding of relationships, responsibilities, obligations, reporting lines of all types, of organizations - city and otherwise - needs to be rich enough to support the types of work the system will be called upon to do. Law and regulations are at the very heart of much of this work, as are court cases. Of course the system is inevitably going to need to do some level of analysis - some simple enough to do in code, other in spreadsheets for more comprehensive challenges. And of course the system must be able to understand and respond to natural language questions - which I thought it could do through the assistant."

He wants a thorough study, per construct, of: the levels of support the system may need; what it can do now; which modules and AIs provide it; what support is needed for the anticipated work; and the architecture for that support.

## The product
Civicsmith (formerly CivicOS; repository `bio`, /home/user/bio) is an evidence engine for civic watchdog groups: members capture public documents with provenance, extract content, investigate through inquiries with graded findings, publish cases, and act (filings, escalation) to bring a government back into conformance. One instance per group; any jurisdiction (local knowledge lives only in jurisdiction profiles as data).

## Where things are
- Requirements canon: `requirements/README.md` lists it (docs/architecture/*.md, docs/development/*.md). Key: BIO_Complete_Roadmap_v5.md (mission, use cases), BIO_Functional_Architecture_v3.md (functions a group needs), BIO_System_Design.md (constructs), BIO_Content_Framework_v0_10.md, BIO_Case_Making_v0_1.md, BIO_Action_v0_1.md, BIO_Assistant_and_AI_Roles_v0_1.md, BIO_Declared_Bias_v0_1.md, BIO_Interaction_Constructs_v0_1.md, MEMBER-KNOWLEDGE-DESIGN.md, EXTRACTION-BREADTH-DESIGN.md, DOCUMENT-PROFILES.md, ASSISTANT-PILOT.md, INVESTIGATIVE-SESSION.md, RETRIEVAL-SUBSTRATE.md, docs/development/DECISIONS.md (Bob's DEC rulings).
- The design session's newest work (journeys, the member's experience) is on branch `origin/claude/gallant-brown-zg0wc1`, read with `git show origin/claude/gallant-brown-zg0wc1:docs/development/ux-substrate/journeys.html` (also ux-substrate.html, views/*.html, HANDOFF.md). Journeys show the work members will actually do; use them as evidence of need.
- Build state: `build/layers.md` (layers and contracts), `build/modules.json` (modules in total order: id, layer, paths, tests, uses), `build/requirements/<module>.md` (Purpose, Provides with R ids; Uses, Invariants, Satisfies, Suggestions; `*(not yet met: T<n>)*` marks unbuilt), `build/rulings.md` (K rulings, one line each; grep it), `build/plan/archive/T32.md` (left-out table: what is deferred and why).
- Code: `bio-plane/src/<module>/`, `agent-worker/`, `pdf-worker/`, etc. (paths in modules.json).

## Layers (total order; a module may use only earlier modules)
1 Foundations (pure libraries, readers): record-grammar jurisdictions test-support runtime-limits signatures bundler id-spaces subresources ooxml office-readers odf-reader pdf-reader format-registry text-chain site-profiles docprofile image-codecs pdf-pixels pdf-worker ocr-worker
2 Record and authority: record-core membership credentials promotion
3 Intake and provenance: host-governor provenance attestation provenance-routes capture-sources acquisition capture sources
4 Content: calibration reading-pipeline extraction content
5 Meaning, bias and retrieval: entities connections progressions bias observation-log query-language retrieval
6 Inquiry and the assistant ("the AI finds, pursues, extracts and checks, and never attests or concludes"): inquiry-grammar accepted-work inquiry citation basis-versions strength contradiction run-rules ai-runs run-productions capture-requests skills agent-worker
7 Understanding: intent reevaluation
8 Publication: case-grammar corpus-export case-carriage publication docket public-read project-stage network-notices ratification case-checker case-import case-disclosures case-authoring review
9 Action ("an action rests on the record; one asserting a breach rests on a published finding and a standard held in the record; the AI proposes and prepares, never files or sends; every deadline names the statute, order or commitment it comes from"): local-facts standards conformance consequences action-grammar actions action-clocks filing-templates filings escalation action-plans
10 Operations: monitoring link-sweep scheduler
11 Interface and distribution: wizard-scripts affordances tasks queue-producers queue instance-setup op-declarations admission control-plane plane legacy-ui(legacy) installer

**Structural observation to test, not assume:** law (`standards`), calculation (`consequences`), local facts and most time handling (`action-clocks`) sit in layer 9, after Publication. So, as built, an inquiry (layer 6), the assistant (layer 6), entities (layer 5) or understanding (layer 7) cannot use them: they serve only a group that has already published a finding. If investigation itself needs law, time, organisations and calculation (Bob's sense), some of this may belong lower in the order. Judge it from the evidence.

## Doctrine any proposal must keep (cite where you rely on it)
- The machine never concludes or attests; it proposes and prepares; a member decides (layer 6 and 9 contracts; Assistant and AI Roles).
- Words a script or AI places are a labelled draft, the member's only once kept (K1364). AI output labelled as the assistant's.
- Every derived thing carries a basis and a grade; "undetermined" is a first-class answer (Interaction Constructs UNDETERMINED).
- Search states at which level absence was found (four-level search).
- No jurisdiction in product code; local knowledge is profile data (layers.md "No jurisdiction in the product").
- Declared Bias: relations are constitutive, never traversed (safeguard 4) — check its exact text.
- Actions R9: no private individuals named as addressees (check exact text).
- P4: modules in one total order, uses only earlier modules. P6: a module fits in one reading (BOB reports modules near ~4,000 lines). Adding/removing a product module or changing layers is Bob's decision; recommend, don't assume.

## Rules for you
Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Read requirements and canon whole where they matter; verify "built" against code. Cite file:line or doc §. Write your study to the scratchpad file named in your task; keep it dense (aim 200–300 lines) and structured exactly as the task's outline. Return a 15-line summary.
