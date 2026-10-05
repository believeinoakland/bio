# UI-KICKOFF extracts (UI-KICKOFF.txt)

## chunk 1-229
TIME
- [DESIGN] Refinements L197-200 — "Change deserves weight equal to current state: what changed, is changing, or is about to change. Motion in the interface is used sparingly and only when user action is needed." (about-to-change = upcoming deadlines/effective dates)
- [DESIGN] Refinements L209-211 — "Alive means live: when an object's visible state changes, the display reflects it promptly"
- [DESIGN] Constraints L104-106 — "Append-only is the ethos, visibly. History, session logs, and release records are presented as the record they are."
ORGANISATIONS
- [EXAMPLE] First arc deliverable L131-133 — member journey example: "a batch of job applications arrives, gets captured, reviewed, bulk-released with acknowledgment, and cited by a Project" (personnel/hiring records)
- [DESIGN] Who this is for L70-88 — five audiences: member ("community activist, not a technologist"), reviewer at release, project manager, admin, public; L140-141 visual language for "a member at 10pm and to a city official reading the published record" (officials as readers)
- [DESIGN] UX principles L168 — "Don't be myopic. Allow users to see connections at the right meta-levels" (relationship visibility at levels)
LAW
- none in UI-KICKOFF (no legal content); [DOCTRINE] L90-112 "Constraints that are law, not taste" are UI constraints, not law in the construct sense
COURTS
- none in UI-KICKOFF
ANALYSIS
- [DESIGN] UX principles L175-179 — "Include meaningful, insightful, and relevant interactive visuals that tell stories"; "Maximize information density through appropriate use of color, typography options, mouse-overs ..."
- [DESIGN] Refinements L212-216 — "Interactive story visuals DO extend to the published surface, where readers know the least ... The PRINTED version of a publication is first-class and must carry the full narrative, progressively explained and documented, because print readers lose the interactive affordances." (charts in publications must also print)
- [DESIGN] Refinements L187-191 — RELEVANT load-bearing state always shown, "named explicitly ..., signaled with color, and with its consequences surfaced"
QUESTIONS
- [DOCTRINE] Who this is for L77-78 — "The review surface must present source material itself (doctrine: never only an AI summary)"
- [DESIGN] Constraints L107-109 — "Refusals teach. The plane's refusals name what is wrong and why (offenders listed, arithmetic explained)." (explaining in user language)
- [DESIGN] UX principles L169-174 — "Provide all users the experience they need regardless of domain experience/understanding"; "Explain what it says/means from the user's perspective"
- [DESIGN] Constraints L101-103 — "DR-13, the tell discipline. Asking a public archive to fetch a URL publishes the group's interest. Surfaces that trigger outward-visible acts say so at the point of the act"
- [DESIGN] Mission L63-66 — "Do not invent foundation capabilities. Every surface designed must map to operations that exist"; status L5 enforced by surface-registry.test.mjs
DOCTRINE
- [DESIGN] Where the project stands L49-52 (history, 2026-07-27) — "Bob's three-layer roadmap ... governs sequencing: Layer 1 the foundation (done enough), LAYER 3 THE UI IS NEXT, and Layer 2 the analysis layer fills in afterward across all three." (analysis layer deliberately sequenced last — historical context for why law/time/analysis lag)
- [DOCTRINE] Constraints L95-98 — "a capability a member does not hold is ABSENT from their interface, not present and greyed" (Membership v2 §5)
- [DOCTRINE] Constraints L99-100 — "Identity is server-stamped. No surface ever asks who the user is"
- [DESIGN] state-semantics L221-229 — plane is "sole authority on what states exist and what transitions are legal"; UI SEMANTICS table "sole authority on what each state MEANS on screen"; check-semantics.mjs fails build on missed/invented state
- [DESIGN] UX principles L181-182 — "Know that the workflow will evolve ... Architecture and codebase designed for evolution"
- [GAP] status L4 — BIO_UI_Design_v0_1.md never written; answers in Interaction Constructs, UI-PLAN, research/RECONCILED.md
