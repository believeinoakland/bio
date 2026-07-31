# Parallel development: areas, interfaces, and the protocol between them

Draft, 2026-07-31, thread CAPTURE, at Bob's direction. **A PROPOSAL TO BE CUT
DOWN, not a decision.** It names more structure than is worth building on day
one; the last section says what to build first and what to leave alone.

## The mistake this corrects

Development has run as one serial thread. Asked why, this session first answered
that the work was inherently serial, because each of 0.49.0 through 0.55.0
depended on the release before it. That answer was wrong and Bob corrected it:
the dependency chain was an artifact of the PLAN, not of the domain. One thread
holding a single ordered list produces a single ordered list of releases.

The correct generalisation: **work parallelises where it sits on opposite sides
of a stable interface.** The layered architecture already has those interfaces —
bytes, structure, content, intent. Capture mechanics produces bytes and does not
care what is in them. Content identification consumes bytes and does not care
how they arrived. HTML content and PDF content share an interface and almost no
code. The reason it has FELT serial is that one thread did all of it, so every
interface was an internal function call it could change at will.

That also relocates the main risk. It is not merge conflicts. It is **interface
drift**: one area changing a shape three other areas are building against. The
safeguard that matters is therefore not a lock but a protocol, and this project
already has a working precedent for it — `INBOX-GRAMMAR.md` was fixed as a
contract BEFORE D-98 was built against it, and the build went cleanly because of
it.

## Areas of responsibility

An AREA is a body of work with an owner, a set of paths, and declared interfaces
to other areas. An area is not a person and not a session: it is a standing
responsibility that a session picks up by claiming it.

| Area | Owns | Produces / consumes |
| --- | --- | --- |
| `CONDUCT` | no code. `QUEUE.md`, the interface registry, this file (renamed from `ARCH` 2026-07-31) | Orchestration + integration: drains `QUEUE.md` via ephemeral workers, verifies and lands on `main`. See `ORCHESTRATION.md` |
| `BOB` | no code. Decisions and their decomposition | Requirements / UX / architecture with Bob; hands decompositions to CONDUCT to enqueue. See `ORCHESTRATION.md` |
| `RECORD` | the store core: `schema.mjs`, `promote`/gate/audit, membership, projections, `query.mjs` and the retrieval surface, the scheduler. ADDED 2026-07-31 (session BOB) | OWNS I5, produces I3 |
| `CAPTURE` | acquisition mechanics: fetch, governor, subresources, links, reachability, archive fallback | PRODUCES bytes and provenance |
| `CONTENT-HTML` | identifying content inside HTML: recognizers, client-rendered documents (D-64) | CONSUMES bytes, PRODUCES structure |
| `CONTENT-PDF` | identifying content inside PDFs, structure extraction (D-91) | CONSUMES bytes, PRODUCES structure |
| `FRAMEWORK` | `docprofile/**`, the content framework, constructs, digests (D-60) | CONSUMES structure, PRODUCES intent and bias |
| `UI` | `civicos-ui/**` | CONSUMES op contracts |
| `DIST` | `newgroup/**`, `release/**`, deploy tooling, and CUTS RELEASES | CONSUMES the plane artifact |

Eight areas is more than Bob intends to staff. They are listed so the map is
complete; two to four are live at any time and the rest are dormant, which is a
normal state and not a gap.

**Why `RECORD` was added, 2026-07-31.** It is not a new body of work — it is ground
that was already being edited with no owner. `store.mjs` is ~4,900 lines and only its
link, capture, task and reachability functions were claimed; the schema core,
`promote`, the gate, the audit sweep, membership, the projections and the entire
retrieval surface belonged to nobody. Unowned is not free: this file already says
unclaimed paths are a collision risk rather than a licence, and the practical effect
was that anything touching the store defaulted to `CAPTURE`, which is why CAPTURE now
appears in three milestones and is the constraint on the whole board
(`MILESTONES.md`). Retrieval sits inside `RECORD` rather than in an area of its own,
because it is finished at its declared scope and splitting it would be structure
bought before it is needed; the split is cheap later if search work grows.

**`DIST` cutting releases is the load-bearing change.** Today the release baton
is a lock held for a whole session, because cutting a release is five
indivisible acts on global state (version, signature, tag, deploy,
RELEASE.json). No amount of process removes that. What removes it from the
critical path is that **areas stop cutting releases**: they land tested code on
`main` continuously, and `DIST` batches releases. The baton goes from held-for-a-
session to held-for-minutes, and it stops being the thing every area waits on.

## Deployment units are a SEPARATE axis from areas

Added 2026-07-31, when Bob adopted a **function-specific Worker topology** and the
first fleet member, `pdf-worker`. Recorded here because conflating the two axes is
the mistake that would follow, and it would be expensive.

- An **AREA** is a body of responsibility: who may edit which paths. It is about
  sessions colliding.
- A **WORKER** is a deployment unit: what ships together, versions together, and
  rolls out together. It is about bytes reaching an account.

They are not the same and one does not imply the other. `pdf-worker` is
`CONTENT-PDF`'s code and `DIST`'s release object, exactly as the plane is
`CAPTURE`/`RECORD` code and `DIST`'s release object.

**The topology.** The plane stays a lean control/record Worker. Heavy,
dependency-laden functions move into dedicated single-purpose Workers the plane calls
over service bindings. A fleet, not a monolith, and more members are expected as
needs emerge.

Six rules, each of which is an existing lesson applied to a second Worker rather than
a new idea:

1. **A fleet member's API is in the RECORD'S terms, never the library's.** The plane
   hands `pdf-worker` a capture sha and gets back the I2 shape. That is what keeps
   the library swappable and stops a vendor's data model leaking into the record.
2. **A fleet member ASSERTS nothing.** It returns derived output and writes nothing:
   no register row, no provenance, no capture. Provenance stays the plane's, because
   a hop a component can hand us is a hop a component can invent (D-112).
3. **Narrowest bindings that do the job, and never `PUBLISHED`.** Every Worker
   holding a `CAPTURES` binding is one more component inside the private fence. The
   two-bucket fence is structural, and it is only structural while the set of things
   that can reach the private bucket stays small and named.
4. **Each member versions and rolls out on its own, so D-108 applies per member.**
   "A deploy verified is not a build serving" now has a second face: the plane can be
   current while the sibling it calls over a service binding is still serving the
   previous build, and that window is invisible to both. A verification must
   establish which build ANSWERED, for the member as well as the plane.
5. **The version authority rule spans the fleet.** D-106's drift class — a version
   living in four places and rotting in three — returns multiplied by the number of
   members. `bio-plane/package.json` stays the single declared authority and the
   embed step must refuse on ANY disagreement, in either direction, for every member.
6. **The installer installs the FLEET.** `newgroup` installs one Worker today. A
   sovereign instance that gets the plane and not `pdf-worker` is an instance whose
   PDFs silently do less, which is precisely the D-106 failure — a group installing
   today getting something quietly different from every description of it.

## Claiming an area

**An area is claimed before work starts, in the repository, where every other
session can see it.** `docs/development/CLAIMS.md`, append only.

```
## CLAIM 2026-08-02 CONTENT-PDF
session: pdf-structure-1
opened: 2026-08-02T14:00:00Z
paths: bio-plane/src/pdfstructure.mjs, bio-plane/test/pdfstructure.test.mjs
interfaces consumed: I1 (bytes)
interfaces owned: none yet; expects to propose I2-PDF
expected: D-91 structure extraction
released:
```

Rules:

- **A claim keeps other sessions out of those paths.** Not a courtesy: a session
  that finds another area's claim on a path it needs does NOT edit it.
- **A session needing work in a claimed area DELEGATES.** It appends a
  DELEGATION entry naming what it needs and why, and continues with its own
  work. The owning area picks it up. This is the mechanism that lets an area
  proceed when its need touches somebody else's ground, and it is strictly
  better than the alternative of editing quietly and discovering the collision
  at merge.
- **A claim is released explicitly**, with a date. An unreleased claim older
  than its expected scope is stale and `ARCH` may reassign it; silence does not
  hold ground forever.
- **Unclaimed paths are nobody's**, which is a collision risk rather than a
  licence. Claim before editing, even briefly.

## Interfaces: stable by default, changed by protocol

Bob's framing, and it is better than the "freeze the interfaces" this session
first proposed: **the normative state is a STABLE interface, with a defined
process for changing one.** Frozen is wrong because interfaces will need to
change and a freeze just makes the change happen dishonestly.

`docs/development/INTERFACES.md` is the registry: one section per interface,
with an ID, an owner, a version, the areas that consume it, and the shape
itself. An interface that is not in the registry does not exist and nothing may
be built against it.

Candidate interfaces, in the order they matter:

- **I1, bytes → content.** What a captured document offers something that wants
  to read it: the register entry, the R2 key, content type, transport record,
  provenance chain. Owner `CAPTURE`. Consumers `CONTENT-HTML`, `CONTENT-PDF`.
  **Freeze this one first**: it is what makes the two content areas independent
  of each other and of capture, and it is the largest parallelism available.
- **I2, content → framework.** What a recognizer emits. Owner `FRAMEWORK`.
- **I3, plane → UI.** The op contracts. Owner `CAPTURE` today, and arguably
  should be its own area once more than one area adds ops.
- **I4, plane → installer.** The release artifact and the embed contract. Owner
  `DIST`. Already half-formalised by D-106's version authority rule.
- **I5, the store schema.** Table ownership, and the rule that a derived table
  must be named in `purge` (D-113).

### The change protocol

A change proposal is appended to `docs/development/INTERFACE-CHANGES.md`, append
only, with an ID. It moves through named states, and **the state is written in
the file, so any session can see it on arrival**:

1. **PROPOSED.** The proposer states the interface, the change, why, and which
   consumers it believes are affected.
2. **RESPONSES.** Every area listed as a consumer in the registry answers
   exactly one of: `AGREE`, `COUNTER` (with the counter-proposal), or
   `NOT-AFFECTED` (I do not use this part). A dormant area with no live session
   cannot answer, which is why silence is NOT consent and why step 3 exists.
3. **RESOLUTION.** If every consumer agreed, the proposal is `ACCEPTED`. If any
   countered, the proposer amends or `ARCH` adjudicates. **If a consumer area is
   dormant and cannot answer within the window, `ARCH` answers on its behalf, in
   writing, naming that it did so.** Without this, one unstaffed area deadlocks
   everyone. This is the step most likely to be got wrong by being left implicit.
4. **CHANGING.** The interface is marked unusable for NEW work in the registry,
   with the date. Existing code keeps working; nothing new is built against
   either the old or the new shape until step 5.
5. **CHANGED.** The owner lands the change and bumps the interface version.
6. **SETTLED.** Consumers confirm they have migrated, or record that they had
   nothing to migrate. Only then does the registry return to stable.

The proposal file is append-only and states are appended, never edited in place,
so the history of a contract is readable the same way the record's own history
is. That is deliberate: this project's whole thesis is that append-only history
is what makes a claim checkable later, and its own development process should
not be exempt.

### `ARCH`, and what it is for

An architectural decision is made in conversation between Bob and one session
that holds no code. Its output is not a design document nobody reads: it is
**the decomposition** — this decision becomes these changes, in these areas,
against these interfaces — plus the communication of that decomposition into
each area's kickoff. `ARCH` also adjudicates interface disputes and answers for
dormant areas.

`ARCH` writing code would defeat the point, because the areas would then be
receiving decisions from a party that is also a competitor for the same files.

**ONE SESSION PER WORKING TREE. No exceptions.** `CONDUCT` holds the main checkout,
because it integrates and pushes continuously; **every other session, including
`BOB`, works in a worktree.** An `ARCH`/`CONDUCT` turn that finds itself editing an
area's code is a turn that has stopped being `CONDUCT`; claim the area and move to
its worktree.

**CORRECTED 2026-07-31, and the correction is worth reading because the original
was right for a premise that stopped holding.** The rule said "`ARCH` works in the
MAIN checkout; area sessions work in worktrees", and its reason was that `ARCH`
edits the cross-cutting registry — `CLAIMS.md`, `INTERFACES.md`, this file, the
kickoffs — "which every worktree must see, so it belongs in the main checkout where
those files are the canonical copy, **not in a worktree that would have to push them
back**".

That was written when `ARCH` was ONE session. On 2026-07-31 `ARCH` split into
`CONDUCT` and `BOB` (`ORCHESTRATION.md`) and **both inherited "the main checkout"**,
which put two long-running sessions in one tree — precisely the collision the claims
system exists to prevent, and with none of its protection, because a claim reserves
PATHS between checkouts and does nothing about two sessions writing one tree. It
produced exactly what you would predict: CONDUCT's integrations kept meeting a BOB
session's half-finished work, and a gate designed to refuse an unpublished planning
surface fired on a mess CONDUCT had not made and could not fix.

**The stated reason has also inverted.** "A worktree that would have to push them
back" was written as the cost. It is the POINT: sessions do not share a working tree,
so a change reaches another session only when it is committed and pushed
(`CLAUDE.md`). Pushing is not the overhead of putting BOB in a worktree — it is the
act that makes BOB's output exist for anybody else. The same misunderstanding
produced both of this day's coordination failures: an untracked kickoff that reached
no worker, and two sessions in one tree. Both came from treating the main checkout as
a shared surface instead of treating the REPOSITORY as the channel.

Consequence for `BOB`: it works in `--worktree BOB`, and its handoff is a push, which
`plancheck` already refuses to let it skip. Consequence for `CONDUCT`: it integrates
only from a clean main, and a dirty tree is now its OWN work and nobody else's.

## Concurrency safeguards

Existing, and they keep working: never force-push; fetch and rebase before every
push; `DEBT.md` append-only; `MEASUREMENTS.md` append; `CIVICOS_UI_STATE.md`
prepend.

New, and each addresses a specific way parallel sessions break:

- **One instance per area.** `biosmoke-capture`, `biosmoke-pdf`, and so on. Two
  sessions sharing `scratch` destroy each other's probes: this session purged
  `scratch` three times on 2026-07-31 and a concurrent session would have lost
  its verification mid-flight. The installer already makes sovereign instances
  trivially, so this costs almost nothing and dogfoods the distribution model.
- **Per-area debt IDs.** `D-CAP-14`, `D-PDF-3`. Numeric ranges run out and get
  confusing; a shared counter collides constantly at four sessions. Existing
  `D-nnn` numbers stay as they are and are not renumbered.
- **A push check.** A script that refuses a push touching paths outside the
  session's claim. Convention is not enough at four sessions, and turning a
  collision into an immediate refusal is exactly the discipline `deploy.mjs`
  already applies to the baton.
- **Releases from a green `main` only, by `DIST` only.**
- **The D-108 rollout gate matters more, not less.** Per-area instances deploy
  independently and do not contend, but every session must still confirm which
  build is answering before believing a probe.

## What to build first

Everything above is worth having eventually. Almost none of it is worth building
before the first parallel session runs. In order:

1. **`INTERFACES.md` with I1 only**, and I1 written from the code as it stands
   rather than as anyone would like it to be. This is what makes `CONTENT-HTML`
   and `CONTENT-PDF` independent, and those two are the clearest parallel work
   in the current debt.
2. **`CLAIMS.md`, and the claiming habit.** A text file and a rule. No tooling.
3. **Split the kickoffs**, one per live area, each carrying the same standing
   knowledge but its own plan.
4. **Per-area instances**, when a second session actually starts, not before.
5. **The change protocol**, when the first interface change is proposed. Writing
   it before it is needed will get it wrong.
6. **The push check and per-area debt IDs**, when three or more areas are live.

Steps 5 and 6 are deliberately last. The failure mode of a process document is
that it is written in full at the start, before anyone has felt which parts
matter, and then not followed.
