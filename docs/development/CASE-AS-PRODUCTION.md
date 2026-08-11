# A case is a production of a project — the publication redesign

Ruled by Bob 2026-08-10 (**DEC-72**), worked to convergence in session BOB the same day.
This document is the design the decomposition points at; the ruling's verbatim reasoning
is in the register entry. **Status: RULED AND NOT YET BUILT.** `BIO_DATAPLANE_STATE.md`
continues to describe the shipped behaviour until the build lands; where the two
disagree, the dataplane state is what exists and this is what was decided.

## The model, in six clauses

1. **A case is its own OBJECT** — a set of finding-versions plus the publishing project.
   Not a phase of a finding. Bob: *"a case is a different object, not just a different
   phase of a finding."* Findings remain the one recursive inquiry object (the collapse
   stands below publication); the case is a distinct published artifact OVER them.
2. **The bar — the standard of evidence — is a property of the PROJECT**, told to the
   publishing act at publication time. No bar ever attaches to a finding; nothing
   composes across projects. The same finding can clear a journalist project's bar and
   fall short of a lawyer project's, and both facts are honest simultaneously.
3. **Publication pins versions, like a commit.** Bob: *"Once published, the act of
   changing the findings (or any claims of any of the findings) results in the changed
   version becoming a new version."* The case freezes each member at its version-by-hash;
   published versions are never mutated; later edits mint new versions on the finding's
   own chain.
4. **Load-bearing members must meet the bar; supporting members need not.** Bob: *"All
   load-bearing findings of a case being published must meet the necessary bar. Other
   findings/claims that don't meet the bar can be a part of the published work, though
   they aren't presented as load-bearing."* The designation is AUTHORED by the publisher
   (a partition someone asserts, DEC-32's discipline at case altitude), presented
   prominently, with each claim's own derived strength displayed beside the case's
   standard — a claim may exceed the bar and the reader sees that too.
5. **Only a project OWNER publishes** ("manager" = the existing owner role, ruled with
   the defaults). Publication is the project's production, wielded at the top of its
   roster. The ceremony (completeness, scope, subject position + justification, bias
   acknowledgement, machine-cannot-publish) is unchanged.
6. **A project can span many cases; a finding can serve many cases** — across projects
   and within one. Bob: *"A finding is mined, often involving hard work. So once
   resolved, the finding should have lasting value."* An investigative series is one
   project, several published cases, overlapping members.

## The two ruled defaults

- **"Manager" is the existing project owner role** — no third role is minted; the
  publishing fence binds to the owner machinery that already has add/remove/floor rules.
- **A case requires at least one load-bearing member.** All-supporting material would
  assert nothing conclusive while the completeness ceremony claims coverage of a
  question no member conclusively answers.

## Implications, each considered and resolved

- **Revised findings vs the cases containing them.** A case is a frozen, signed edition,
  honest as of its date. When a member finding is later revised (new version minted),
  the containing cases are FLAGGED, never silently updated and never automatically
  re-published — the cascade doctrine (set-but-never-clear, re-evaluation offered) one
  level up. New editions are each owning project's deliberate act.
- **The bar gates LOAD-BEARING members' derived strength** (DEC-32 arithmetic per
  finding: weakest across AND, strongest across OR). Evidence below grade inside a
  finding's basis was always includable as non-load-bearing (Bob's draft-agenda
  clarification, recorded on DEC-71); the same principle now recurs at case altitude
  for whole findings.
- **The signed-artifact direction FLIPS.** Today each published finding's bytes name its
  case (one-case-per-finding baked into the format). Now the CASE artifact freezes its
  members — content by hash, version, per-member strength pair, role, the bar, the
  exclusions — and a finding's bytes stop naming any case. Same stranger-verifiable
  properties, opposite reference direction. This is the largest mechanical piece.
- **`published` leaves the finding's state machine.** A finding's lifecycle ends at
  `concluded`; publication is the case relation. Reopening a finding is unchanged and
  never edits published bytes (clause 3).
- **Where no bar was ever declared** (project undeclared, group default absent — the
  group default's remaining role is SEEDING new projects, DEC-17), the case publishes
  stating that fact: an absent bar is not a bar of zero, and the case claims no cleared
  standard. Undetermined stays first-class.

## What this supersedes

| what | how |
| --- | --- |
| **DEC-71** (does a severed citer's bar linger?) | DISSOLVED — bars never attach to findings, so none can linger. Closed as superseded by DEC-72. |
| **DEC-17's strictest-across-citers composition** (`#requiredStrengthFor`, "WHERE TWO PROJECTS CITE ONE INQUIRY, the STRICTEST declared bar wins") | Removed — that clause was a session's conservative construction, not Bob's ruling. The group-default half of DEC-17 (seeds new projects; a group lowers its bar only by an authored, on-the-record act) STANDS. |
| **D-280's severed-citer fix** | Moot rather than wrong — the code it fixed is removed with the composition. |
| **The project-less publication path** (`publishCase` with no project; group default as a publication bar) | Removed — publishing is a production of a project. |
| **REC-44's finding-side case stamping** (case identity written into each finding's published bytes) | Reworked by the artifact flip. The property it served — a stranger holding published material can verify without contacting the instance — is preserved case-side. |
| **`published` as an inquiry lifecycle state** (State Rules per-type machine; `ILLEGAL_TRANSITION` publishing-only-from-concluded) | The precondition survives as "only a CONCLUDED finding may be a case member"; the state itself becomes the case relation. |

**DEC-44 is NOT superseded** — "a published case is one or more findings" under a single
project was this model's first half, and its one-finding degenerate case stays legal.
**DEC-34's container** rules are reworked where they assume finding-side stamping; the
container capability itself stands.

## The decomposition (handed through the BOB INBOX; CONDUCT gates and sequences)

All under **M10**, depends-on as listed. Interface changes run the `INTERFACE-CHANGES.md`
protocol against I3 (op contracts) and I5 (schema); nothing here bypasses it.

- **CASE-1 · the case object.** Schema: case identity owned by a project; membership
  rows of (finding id, version hash, role load-bearing|supporting, ordinal); editions
  per case. I5 via IC protocol. Depends on: nothing.
- **CASE-2 · publication as the project's production.** `publishCase` takes the
  publishing project; owner-only fence; the bar read from that project alone at act
  time; ≥1 load-bearing member; load-bearing members' derived strength ≥ bar;
  supporting members exempt and marked; ceremony unchanged; strictest-composition and
  the project-less path removed, suites corrected never exempted. I3 via IC protocol.
  Depends on: CASE-1.
- **CASE-3 · version pinning.** Members frozen by version hash on the finding's
  existing version chain; an edit touching a published version mints a new version;
  the pinned version is never mutated. Depends on: CASE-1.
- **CASE-4 · lifecycle and the revision flag.** `published` removed from the inquiry
  state machine (State Rules amendment); containing cases FLAGGED when a member
  finding revises; flags set-but-never-clear until each owning project acts. Depends
  on: CASE-2, CASE-3.
- **CASE-5 · the artifact flip.** Case-side freezing; finding bytes stop naming a
  case; `op=verify` / `op=publishedcase` / `op=publishedmanifest` read the case
  artifact; the stranger-verification path proven end to end; checks corrected never
  exempted. Depends on: CASE-2, CASE-3.
- **CASE-6 · the surfaces.** Publication ceremony UI (owner-gated, load-bearing
  designation authored, bar shown as the case's property); published case page
  (bar prominent, per-claim strength beside each finding, supporting members visibly
  not load-bearing); multi-case membership on the finding view. Depends on: CASE-5.

**THE ARC'S DEFINITION OF DONE — named here so it cannot be missed (Bob, 2026-08-10:
"the build plan needs to be updated properly"):** the CASE arc is not complete until,
in the same turn the last item lands, (a) **`docs/BIO_DATAPLANE_STATE.md` is amended to
describe case-as-production as the SHIPPED shape** — the state doc records what runs,
so its update rides the landing, never precedes it; (b) the RULED-AND-NOT-YET-BUILT
banner at the head of THIS document comes down and the document is archived per the
working-surface rule (`docs/archive/`, where `decided.mjs` keeps its rulings findable);
and (c) `node tools/decided.mjs` is regenerated so the index stops carrying the
pre-build framing. A landing that skips (a) leaves the record's state document
describing a plane that no longer exists — the exact defect class Bob's substrate
instruction just paid to remove.
