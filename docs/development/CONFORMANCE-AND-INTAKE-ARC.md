# The conformance and intake arc

**Written July 24, 2026.** The work plan for making the Cloudflare plane a
conformant, complete, performant storage and transport plane, and for rebuilding
on it the acquisition tooling that the Apps Script accelerator carried.

This document exists because two things became measurable on the same day. The
check catalog is now in the repository (`bio-plane/checks/bio-checks.mjs`,
version 1.16.4, hash-verified, 49 checks), and the doctrine corpus is now
readable without an upload. Conformance therefore stops being an intention and
becomes a number.

---

## 1. What the plane is not yet

Four divergences, all in the same area, found by running the catalog against the
live record rather than by reading code.

**1.1 History paths are laid out wrongly.** `readImage` emits
`_history/<snap_key>/<path>`. The canonical layout, which Drive used and the
catalog parses, puts the key in the filename:
`_history/bundle_<snap_key>.md`, and for nested files
`_history/data/changes_<snap_key>.json`. Consequence: all 30 bundles fail
C-12.2 with 168 errors, every one of them "history file maps to no manifest
entry." No content is missing; the checker cannot find files that are present
under a different arrangement.

**1.2 Promotion records are not projected at all.** The catalog requires
`_history/promotion_<key>.json` for every manifest entry of kind `promotion`,
and reads those records in two other places: `classifyDivergence` reconstructs
the bundle.md hash chain from their per-file sha256 lists, and C-20.1 uses them
to establish what a mechanical writer actually changed. The plane stores the
same information in its `manifest` table and projects none of it as a record
file. Two checks are therefore unreachable rather than passing.

**1.3 The manifest `kind` vocabulary differs.** The plane writes `creation` and
`direct_write`. The catalog switches on `promotion`. This is why 1.2 did not
surface as an error in the audit: the check that would have caught the missing
records never fired, because no entry claims to be a promotion. A divergence
that hides a second divergence is worth more attention than either alone.

**1.4 `plane-gate/0.1` implements four checks where the catalog has 49.** The
gate checks live hashes, the base chain, capture presence, and dangling
references. It does not check frontmatter contracts, state legality, transition
edges, canonical headings, append-only surfaces, citation registers, provenance
registers, release authority, release signatures, or mechanical conformance.
This is why the intake UI's two defects (illegal first states for Problems and
Actions, four frontmatter fields where fifteen are required) shipped invisibly.

**Ordering follows from this.** 1.1 through 1.3 come first, because until the
plane emits canonical shapes the catalog cannot judge anything and no other fix
can be verified rather than asserted. `schema.mjs` line 3 settles which side
moves: the bundle format is authoritative and the projection must never bend it.

## 2. What conformance means, concretely

The catalog is a pure function over an injected filesystem. Its five seams are
the entire porting surface: `files`, `sha256`, `sha512`, `resolveTarget`, and
`releaseRegistry`. Nothing about it is Apps Script specific except the
hand-rolled SHA-256 and Ed25519, which exist only because that runtime had no
crypto; the plane has WebCrypto and should inject platform primitives at those
seams rather than carry the portable versions.

Definition of done for the gate: `plane-gate/1.0` runs the catalog itself,
unmodified, against the post-promotion image, and records the catalog's own
version string on every publication. Not a reimplementation. The
three-implementation conformance requirement means the plane, the client, and any
future promoter all call the same bytes, and a rewrite would be a fourth
implementation pretending to be conformance.

Acceptance test: every bundle in the live record passes with zero errors, and
the intake UI's output passes on creation rather than after repair.

## 3. The acquisition tooling to rebuild

This is the substance of what the accelerator did and the plane does not. The
architecture already specifies all of it, so none of this is design work; it is
implementation against a written contract.

**3.1 Gathering requests.** `data/gathering.json`, grammar fixed by C-18.5:
`GATH-YYYY-NNNN-slug` identifiers, a dual-audience target (`text` under 200
characters single-line, `description` under 2000), locators that must each pass
`isPublicHttpsLocator` (https only, public hosts only, no credentials in the
authority, no bare IPs, no localhost), an authority string, criticality,
cadence, status, and a planted instant. The grammar exists because a leaked
write token must be able to litter the queue without steering a member's
session: the exporter renders these fields as quoted data and the grammar bounds
what they can carry.

**3.2 Retrieval and capture.** Fetch, hash, store content-addressed, and record.
The plane has `op=capture` for the bytes; what is missing is everything that
makes a capture evidence rather than a file. The provenance register
(`data/provenance.json`) is specified by C-18.1: per document a `file`,
`locator`, `authority`, `retrieved` instant, and a `capture` block carrying
`method`, `grade` (A, B, or C), `actor_class` (daemon, session, or member),
`sha256`, and `encoding`. Member-origin documents additionally require a
`custody` block (holder, obtained, setting, attestation) because hand-carried
material has a chain that a URL does not.

**3.3 Co-attestation.** `attestation_attempts` records each attempt as
`{service, attempted, ok}`, and the doctrine's requirement is honesty rather
than success: a failed attempt is recorded with its reason, never omitted.
C-18.4 warns when crucial-criticality material carries neither a co-archive nor
a timestamp. The accelerator used Save Page Now plus RFC 3161; the plane needs
the same two paths, and the SPN2 credentials it used are being revoked, so this
is new credential work rather than a lift.

**3.4 Monitoring and change detection.** Source change detection, deadline and
recheck sweeps. These are mechanical writers, and `MECHANICAL_FIELD_SETS` in the
catalog is the closed contract for what each may touch:

| operation | permitted frontmatter |
|---|---|
| monitor-tick | source_status, monitoring.last_checked, reeval_pending.{flag,since,source}, last_updated |
| sweep | nothing |
| deadline-recheck | clock[].status, last_updated |
| member-attest | last_updated |

C-20.1 enforces this by diffing history snapshots, and additionally confines a
mechanical writer's body changes to the Session Log and its file writes to
bundle.md, snapshots/, and two append-only registers. A mechanical creation must
land at `collected` and never higher. Building the daemon against this contract
is the point: the checker refuses a mechanical writer that exceeds its envelope,
so the constraint is mechanical rather than remembered.

**3.5 The ratification fence.** Sweep-origin intake lands at `collected`, never
higher, and the transition to `verified` is a named member's decision that no
surface or AI identity may author (C-18.1, intake doctrine Section 4). The plane
already enforces a signature at publication, which satisfies this from a
different direction; the two need to be reconciled so one rule is enforced in
one place rather than two rules agreeing by luck.

## 4. Performance, and what has actually been measured

Measured on real infrastructure: whole-store pass 112ms at 504 bundles against a
refutation threshold of 10s; roughly 100ms fixed round trip; R2 about 32MB/s with
220 to 250ms per-object overhead; the full 30-bundle record with 87 registered
captures migrated and verified over the public internet in minutes; and in this
session, 148.4MB of captures fetched and hashed for verification.

Not measured, and still owed from Conversion Plan step 6: synthesized stores at
5,000 and 20,000 bundles on the deployed plane, against the plan's prediction
table. That benchmark should run before the retrieval arc, and it should run
after the conformance work rather than before, because running the full catalog
over every bundle changes the cost of a whole-store pass by an unknown factor
and the number worth having is the one that includes it.

## 5. Order of work

1. Canonical history projection: paths, promotion records, `kind` vocabulary.
   Verify by re-running the catalog against the live record and reaching zero
   C-12 errors.
2. `plane-gate/1.0`: run the catalog, injecting WebCrypto at the sha256 and
   sha512 seams and the store at `resolveTarget` and `releaseRegistry`. Verify
   by reaching zero errors across the record.
3. Fix the intake UI against the catalog: legal first states per type, all
   fifteen core fields, canonical headings per type. Verify by creating one
   bundle of each type through the browser and gating it.
4. Gathering requests and the provenance register.
5. Co-attestation, with new credentials.
6. Monitoring as mechanical writers inside the C-20.1 envelope.
7. The 5,000 and 20,000 bundle benchmark, with the full gate in the path.
8. Delete the Apps Script source and deployment; revoke its credentials.

Steps 1 through 3 are conformance and are not optional. Steps 4 through 6 are
the acquisition tooling. Step 7 is the number that tells us whether the design
holds at scale, and step 8 is the point at which the old plane stops existing.
