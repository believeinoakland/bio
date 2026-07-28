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
