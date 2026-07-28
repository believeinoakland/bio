# UI-KICKOFF: the Layer 3 design phase

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
