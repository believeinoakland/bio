# UI-KICKOFF: the Layer 3 design phase

**Status** · Bob's standing brief for the Layer 3 design phase, written 2026-07-27 and updated 2026-07-28 in its own header, carrying two blocks of Bob's words VERBATIM — the UX principles of 2026-07-28 and the refinements distilled the same day — plus the state-semantics architecture agreed with him. PARTIALLY COMPLETE, AND IT IS TWO DOCUMENTS IN ONE COAT: the PRINCIPLES are current and the shipped surface follows them; the PHASE DESCRIPTION around them is historical and describes a project state that ended on 2026-07-28. **Are the principles the ones the shipped surface follows, as of 2026-09-14? Yes, and they are enforced rather than remembered** — capability-shaped absence is asserted (UI-8's absent-not-greyed rule, driven in `civicos-ui/test/`), refusals are rendered in the plane's own words with no surface-authored fallback (UI-30, UI-39, UI-40, UI-41, UI-54), the semantics table is the single source of state presentation with `check-semantics.mjs` failing the build on a missed or invented plane state (UI-10, UI-51), identity is server-stamped, the privacy fence is spatial, and "inform once, never nag" was made a standing sweep by DEC-69 and UI-55. **Where it diverges, by item:** the mission sentence *"DESIGN THE UI LAYER. Design, not build"* is superseded — the phase moved to build on 2026-07-28 and fifty-seven UI items have landed since; the named deliverable `docs/architecture/BIO_UI_Design_v0_1.md` was NEVER WRITTEN and no file of that name exists in the repository, its six numbered parts having been answered instead by `BIO_Interaction_Constructs_v0_1.md` (constructs), `UI-PLAN.md` (the surface inventory and the build-stack choice, settled as one served page) and `research/RECONCILED.md`; "Where the project stands" names plane 0.35.0 against a live 0.58.0; the audience order and the working rules are Bob's and stand; and *"Do not invent foundation capabilities"* stands and is now structural, since `surface-registry.test.mjs` fails the build on a surface naming an op the plane does not publish. **Devices:** the first-release phone position — a viewing MVP if that is what time fits — is what shipped; the surface has a responsive shell and no parity rung. as of 2026-09-14.

**Place in the system** · A level-2 brief serving construct 12 of `BIO_System_Design.md` §3 (member surfaces and the interaction constructs), whose level-1 home is `docs/architecture/BIO_Interaction_Constructs_v0_1.md`. It is the constraint side of the pair `kickoffs/UI.md` sends a session to: `UI-PLAN.md` says what to build and in what order, this file says what every rung must be true to, and where they disagree this one governs because its content is Bob's. Its state-semantics ruling is enacted in `civicos-ui/app.html`'s SEMANTICS table and enforced by `civicos-ui/check-semantics.mjs`; its "refusals teach" constraint is what DEC-49's translation discipline generalised; its UX principles are quoted, not paraphrased, and are not a worker's to edit.

**Incomplete sections** ·
- §Where the project stands — a 2026-07-27 snapshot: plane 0.35.0, "LAYER 3 THE UI IS NEXT". The plane is 0.58.0 and Layer 3 has been building since 2026-07-28.
- §The mission — *"Design, not build. The first arc produces a design the group can react to, not screens"* is superseded by the file's own 2026-07-28 update and by everything landed since; the boundary rule under it (do not invent foundation capabilities) is not superseded and is enforced.
- §Working rules — written for a session that fetched the tree over HTTPS with no credentials and pushed a deliverable if a token was attached; sessions now work in a git worktree with `.env` carried in (`CLAUDE.md`, `kickoffs/UI.md`). Bob's own half — he edits no files, every point carries its context, never re-confirm directed work — stands.

*Four sections are deliberately NOT in that list and their absence is a finding rather than an oversight: §Who this is for, §Constraints that are law, §Bob's UX principles and §Refinements from Bob are COMPLETE, CURRENT, and quoted record. A worker rewording them is the defect.*

**Contents**
- [Where the project stands](#where-the-project-stands)
- [The mission, and its boundary](#the-mission-and-its-boundary)
- [Who this is for](#who-this-is-for)
- [Constraints that are law, not taste](#constraints-that-are-law-not-taste)
- [The first arc's deliverable](#the-first-arcs-deliverable)
- [Working rules (Bob's standing protocol, restated so this file suffices)](#working-rules-bobs-standing-protocol-restated-so-this-file-suffices)
- [Bob's UX principles (stated 2026-07-28, verbatim, standing)](#bobs-ux-principles-stated-2026-07-28-verbatim-standing)
- [Refinements from Bob, 2026-07-28 (distilled from discussion, standing)](#refinements-from-bob-2026-07-28-distilled-from-discussion-standing)
- [The state-semantics table (agreed 2026-07-28, standing architecture)](#the-state-semantics-table-agreed-2026-07-28-standing-architecture)

---

Written July 27, 2026, the day the foundation ladder (S-1 through S-12)
closed. This is the standing brief for UI design sessions. A session started
with "read UI-KICKOFF.md and begin" reads this file, follows the session-start
protocol in SESSION-KICKOFF.md (fetch the tree and docs/ from
raw.githubusercontent.com, no credentials, nothing attached), and starts work
without asking Bob to confirm anything this file already says.

**Update, 2026-07-28.** The phase has moved past design: the foundation was
adopted and a live runtime built and deployed. The current UI state, the op
contracts it uses, and the deploy steps are in
`docs/development/CIVICOS_UI_STATE.md`. Read that for where things actually
stand; this file remains the standing brief for intent.

## Where the project stands

The foundation is complete and live. The plane is 0.35.0 on
biosmoke7.believeinoakland.workers.dev: append-only store, two-bucket privacy
fence, signature-enforced publication, membership with per-member credentials
and capabilities, intake with provenance grades and co-attestation, retrieval
with search and selections, the full S-11 action ladder ending in bulk release
with recorded acknowledgment, and the Focus vocabulary end to end. Bob's
three-layer roadmap (BIO_Functional_Architecture, "The three-layer workflow")
governs sequencing: Layer 1 the foundation (done enough), LAYER 3 THE UI IS
NEXT, and Layer 2 the analysis layer fills in afterward across all three.

## The mission, and its boundary

DESIGN THE UI LAYER. Design, not build. The first arc produces a design the
group can react to, not screens. Code comes only after the design document
survives Bob's read. The foundation's own surfaces (the instance page in
setup.mjs, the sign page, the doorbell, the newgroup wizard) are honest
primitives, built to prove operations rather than to serve people; treat them
as existence proofs and API documentation, never as the design.

Do not invent foundation capabilities. Every surface designed must map to
operations that exist (the op table in src/index.mjs is the inventory) or be
explicitly flagged as demanding a new foundation arc, listed separately with
the op it would need.

## Who this is for

Design for these people, in this order of frequency:

1. **The member.** A community activist, not a technologist. Contributes
   documents, reviews and releases captures (including bulk release with its
   acknowledgment), browses and searches the record, follows Focuses, works
   in Projects. The member is the UI's center of gravity.
2. **The reviewer at the release moment.** The same member wearing the
   system's most consequential hat. The review surface must present source
   material itself (doctrine: never only an AI summary), make the release act
   feel like the judgment it is, and make the bulk-release acknowledgment an
   honest record rather than a click-through.
3. **The project manager.** Runs a Project: citations, severing, evaluations,
   work product states, eventually declared bias and its manifests.
4. **The admin.** Roster, invitations, capabilities, keys, instance bias when
   it lands. Admin arithmetic and the two-administrator floor already exist;
   the UI must make their refusals comprehensible.
5. **The public.** Reads the published projection only. Never sees the
   working corpus, never sees that a fence exists. The published surface is
   the group's face and carries its credibility.

## Constraints that are law, not taste

- **The privacy fence is architectural.** Working-corpus material and
  published material never share a surface ambiguity. A member always knows
  which side of the fence they are looking at.
- **Capabilities shape the interface** (Membership v2 section 5): a
  capability a member does not hold is ABSENT from their interface, not
  present and greyed. The op layer refuses anyway; the UI's job is to make
  the refusal never needed.
- **Identity is server-stamped.** No surface ever asks who the user is; the
  session knows. No surface lets anyone act as anyone else.
- **DR-13, the tell discipline.** Asking a public archive to fetch a URL
  publishes the group's interest. Surfaces that trigger outward-visible acts
  say so at the point of the act, as the intake checkbox already does.
- **Append-only is the ethos, visibly.** History, session logs, and release
  records are presented as the record they are. Nothing in the UI implies
  deletion where the system does correction-by-append.
- **Refusals teach.** The plane's refusals name what is wrong and why
  (offenders listed, arithmetic explained). The UI carries that voice to the
  person instead of translating it into "something went wrong."
- **Bob's UX standard** (standing instruction): clean, self-evident,
  functional, brand-consistent. Extra effort and outside-the-box thinking on
  every UX call. Minimal-effort solutions are unacceptable.

## The first arc's deliverable

One document, `docs/architecture/BIO_UI_Design_v0_1.md`, DRAFT, containing:

**CORRECTED 2026-09-14 (M0-27). THAT DOCUMENT WAS NEVER WRITTEN AND NO FILE OF THAT NAME
EXISTS IN THE REPOSITORY** — verified against the tree on 2026-09-14. The six parts below
are kept VERBATIM as the statement of what Bob asked for; what this section could not say
is where the answers went, and they went to three other documents rather than to one:
`docs/architecture/BIO_Interaction_Constructs_v0_1.md` (the constructs, and the level-1
home of the member-surface construct), `docs/development/UI-PLAN.md` (the surface
inventory and the build-stack question, part 5, ANSWERED rather than only framed — one
served page) and `docs/development/research/RECONCILED.md` (users, journeys and
audiences). So the deliverable is **[BUILT], relocated** — not absent — and the named
file is **[ABSENT] and will stay so**; a session looking for it should read those three.
Nothing in the list below is rescinded by this note.

1. **Users and journeys.** The five audiences above, each with their two or
   three load-bearing journeys written end to end (e.g. member: "a batch of
   job applications arrives, gets captured, reviewed, bulk-released with
   acknowledgment, and cited by a Project"). Journeys before screens.
2. **Surface inventory.** Every screen or surface the journeys require,
   each mapped to the existing ops it consumes, with the gaps flagged.
3. **Information architecture.** Navigation model, the fence made spatial,
   where search lives, how Focuses, Information, Projects and Actions relate
   on screen the way they relate in the object model.
4. **Visual language direction.** Brand posture for a civic accountability
   instrument: what it should feel like to a member at 10pm and to a city
   official reading the published record. Directions, not final art.
5. **Build-stack question, framed not answered.** Server-rendered from the
   worker (the setup.mjs lineage) versus a client app; what each costs and
   buys given sovereign installs and the installer path. Present the
   analysis; the choice is Bob's unless the analysis dictates it.
6. **Decision items for Bob**, in his standing format: numbered, plain
   English, self-contained, only genuine judgment calls.

## Working rules (Bob's standing protocol, restated so this file suffices)

Bob supervises at a high level and retains no session details: every point
put to him carries its own context. Never ask him to confirm work already
directed; this file is the go signal. Browser-only paths for Bob; he edits no
files; deliver complete replacement files. Lead with the finding. If a
GitHub token is attached, push the deliverable to the repo; if not, deliver
the file and Bob will have it pushed. Record decisions in the repo the same
session they are made.


## Bob's UX principles (stated 2026-07-28, verbatim, standing)

These govern every UX call from here on, alongside the constraints above.

- Minimum visible complexity
  - Simple interfaces even when the domain and implementation are complex
  - Offer layered abstractions that enable simplicity at the top with
    increasing detail as they drill down
  - Don't be myopic. Allow users to see connections at the right meta-levels
- A user experience from the user's perspective
  - Present data, layouts, journeys that reflect how users think of the
    problem/task/solution
  - Provide all users the experience they need regardless of domain
    experience/understanding
  - Explain what it says/means from the user's perspective
- Spacious, welcoming, alive, information-rich surfaces
  - Maximize information density through appropriate use of color, typography
    options, mouse-overs, context menus, collapsable dropdowns, and space
  - Include meaningful, insightful, and relevant interactive visuals that
    tell stories
  - Consistent use of design language throughout
- Know that the workflow will evolve as experience and requirements change
  - Architecture and codebase designed for evolution


## Refinements from Bob, 2026-07-28 (distilled from discussion, standing)

- Load-bearing complexity is per-level: what is load-bearing at one level may
  be irrelevant at another. The rule is that RELEVANT load-bearing state is
  always shown, and shown appropriately for the level: named explicitly so a
  newcomer can recognize it and learn its implications, signaled with color,
  and with its consequences surfaced (what it enables and forbids).
- The implications of each state should have ONE source of truth: a semantics
  table keyed to the plane's actual catalog of object types, states, and legal
  transitions. UX elements render from it, so presentation is consistent
  everywhere a state appears, and a consistency check can verify the table
  covers the catalog completely.
- Change deserves weight equal to current state: what changed, is changing, or
  is about to change. Motion in the interface is used sparingly and only when
  user action is needed. Chips give the compact scale; mouse-overs and
  click-overs give progressive disclosure.
- Information density is not less whitespace; it is signals. The palette is
  color, chips, checkboxes, typography, mouse and click overs, context menus,
  collapsibles, and space. The discipline is knowing the full palette and
  drawing from it to communicate clearly, progressively, cleanly.
- Devices: phones, tablets, laptops, desktops each offer different
  opportunities and limits; features may legitimately be absent on some. The
  first CivicOS release supports phones, acceptably as a viewing MVP if that
  is what time and resources fit.
- Alive means live: when an object's visible state changes, the display
  reflects it promptly (a list the user has open updates when an item is added
  or removed), so long as the update does not inordinately disrupt.
- Interactive story visuals DO extend to the published surface, where readers
  know the least, so progressive disclosure matters most there. The PRINTED
  version of a publication is first-class and must carry the full narrative,
  progressively explained and documented, because print readers lose the
  interactive affordances.


## The state-semantics table (agreed 2026-07-28, standing architecture)

The plane's source is the sole authority on what states exist and what
transitions are legal. The UI's SEMANTICS table (in app.html, marker-
extractable) is the sole authority on what each state MEANS on screen: chip,
reader-language meaning, enables, forbids-with-reasons, legal next states.
Every chip, teach sentence, and affordance renders from it, and every chip is
a click-over disclosing its row. `check-semantics.mjs` is the conformance
check Bob proposed: it fails the build when the table misses a plane state or
invents one. Space-level conditions (working behind the fence, published) sit
in the same table as object states.
