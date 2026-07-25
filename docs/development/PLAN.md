# PLAN

The active work plan. Steps are ordered, each carries an acceptance test that is
a command rather than a judgment, and each names what it unblocks. Sessions
update the status column and nothing else about a step; changing a step's
substance means writing why in the notes.

Status values: `todo`, `doing`, `done`, `blocked`, `dropped`.

Companion documents: `DEBT.md` is the ledger of known defects and deferred
obligations, keyed by ID and referenced from steps here.
`CONFORMANCE-AND-INTAKE-ARC.md` is the reasoning behind this ordering.

---

## Decisions taken, so they are not relitigated

**Co-attestation: RFC 3161 becomes primary, Save Page Now becomes an opt-in
secondary.** Reasoning, and it reverses the old default deliberately. A
timestamp authority receives a hash and nothing else, so it needs no account,
carries no rate limit worth planning around, leaks nothing about what the group
is reading, and produces a token that verifies offline with stock OpenSSL for as
long as the TSA's certificate chain is checkable. Save Page Now requires
credentials, and more importantly it publishes the fact of interest: archiving a
URL announces to anyone watching that someone is looking at it, which under
Design Requirement 13 is a tell rather than a neutral act. It stays because it
produces evidence of a qualitatively different kind, proof of what a page said
rather than proof of when bytes existed, and that is sometimes exactly what a
finding needs. So: timestamp everything, archive deliberately. Multiple TSAs are
configured and every attempt is recorded whether it succeeded or not, per the
`attestation_attempts` contract. OpenTimestamps was considered and rejected:
RFC 3161 already provides the property and OTS would add a Bitcoin header
dependency to verification for no gain in what can be proven.

**Retrieval waits, and this is the last time it defers without a date.**
Reasoning: a whole-store pass measures 112ms at 504 bundles, so at 30 bundles
search is not the constraint. What is the constraint is that nothing new can
enter the record (no acquisition tooling) and what is there cannot be trusted by
the checker (no conformance). Building retrieval now means indexing a corpus
whose shape is about to change in three ways. Conversion Plan probe 1 (FTS5
virtual tables versus export) folds into step S-7 rather than waiting for its own
arc, because it is a question about whole-store cost and S-7 is the whole-store
cost measurement.

---

## Steps

### S-1 Canonical history projection
**Status: done (0.5.0)** · Debt: D-2, D-3, D-4 · Blocks: everything downstream

The plane emits `_history/<snap_key>/<path>`; canonical is
`_history/bundle_<snap_key>.md` with nested files as
`_history/data/changes_<snap_key>.json`. Promotion records
(`_history/promotion_<key>.json`) are not projected at all. The manifest `kind`
vocabulary says `creation`/`direct_write` where the catalog switches on
`promotion`.

Do all three together: they are one projection and splitting them means two
migrations of the same read path.

- Change `readImage` to emit canonical paths.
- Project `_history/promotion_<key>.json` per manifest entry, carrying the
  per-file `sha256` list the catalog needs to reconstruct the bundle.md hash
  chain.
- Align `kind` to the catalog's vocabulary, keeping `creation` distinguishable
  since the catalog's own C-20.1 needs to recognise a creation.
- Update the instance page's history reader and the migrate tool, both of which
  parse the current layout.

**Accepts when:** `npm test` green in `bio-plane`, and the live audit reports
**zero** C-12 findings across all 30 bundles, down from 168.

**Outcome, 0.5.0.** Done locally and proven by a new permanent suite,
`test/conformance.test.mjs`, which imports the catalog and runs it unmodified
against the plane's own projection. Zero C-12 findings. Full battery 348
assertions across sixteen suites in 24 seconds.

Writing that suite immediately produced two findings nothing else had:

- **A creation left no manifest entry at all.** The chain therefore had no first
  link, and `classifyDivergence` anchors on entry bases while C-20.1 recognises a
  creation by its base being the empty-string SHA. The plane now records a
  creation entry with that sentinel and no snapshot, which is what the
  accelerator did. This also broke the plane's own G3 chain check, which demanded
  a snapshot per entry; G3 now skips the sentinel the same way the catalog does.
- **Manifest `created` was the server's wall clock.** C-12.1 compares live
  `last_updated` against earlier entries' `created`, and a signed ratification
  legitimately backdates `last_updated` to the transition instant, so server
  stamping made honest content read as history moving backwards. The catalog's own
  comments record this deadlock freezing a bundle in production on 2026-07-22.
  The entry now takes the revision's own time. See D-17.

**Live-record result, 0.5.0 deployed.** 168 findings became 89, and the residue
splits into two things of different kinds.

**71 were my harness, not the plane.** C-12.2 uses `files.has` directly rather
than the elided-aware helper, so a tier-scoped image that carries blob
references instead of blob bytes fails it even though the bytes are in R2.
Proven by making one bundle's image byte-complete: every C-12.2 error vanished
and only the item below remained. The audit harness now fetches capture bytes.

This carries a real consequence for S-2. The gate needs BYTE-COMPLETE images
including history snapshots, so gating a bundle whose history holds large
captures means pulling those bytes. For the auditor report that was 4 blobs; for
the record as a whole it was 148MB. Measure it in S-8 rather than assuming it is
free, and consider whether history-snapshot presence can be satisfied from R2
`head` rather than a full fetch.

**18 are real, and they are stale data rather than stale code.** C-12.1 compares
live `last_updated` against earlier entries' `created`, and the migrated entries
carry the MIGRATION's wall clock (2026-07-24T16:20) instead of the original
promotion times. D-17 fixed the code that stamps this, but only for promotions
made after 0.5.0; rows written by the old code keep the wrong value.

The cure is a re-migration on 0.5.1, because the migrate tool replays promotes
carrying each revision's own `last_updated`, so the entries come out with honest
times. Nothing needs repairing in place, and the corpus is development reference
that production will refetch, so a reload costs only the run.

### S-2 plane-gate/1.0 runs the catalog
**Status: todo, next** · Debt: D-5 · Depends: S-1 (done). S-3 landed first deliberately: switching on 49 checks before the intake path was conformant would have made the browser form unusable at the moment the gate started working.

Replace the four hand-written checks with the catalog itself. Inject WebCrypto at
the `sha256` and `sha512` seams, the store at `resolveTarget`, and the registry
bundle at `releaseRegistry`. Do not reimplement any check: a reimplementation is
a fourth implementation pretending to be conformance.

Record the catalog's own version string on every publication, replacing
`plane-gate/0.1`.

**Accepts when:** every bundle in the live record gates with zero errors, and
`ratify` refuses a bundle that the catalog refuses, proven by a test that
tampers one bundle per check family.

### S-3 Intake UI conformance
**Status: done (0.5.1)** · Debt: D-6, D-7, D-14 · Depends: none, as it turned out

The browser form stamps illegal first states for Problems and Actions, writes
four of fifteen required core fields, and uses `## Summary` for every type where
only Information takes it. Fix against the catalog's own `STATES`, `CORE_FIELDS`,
and `HEADINGS` tables, imported rather than copied, so the UI cannot drift from
the checker again. Also repair the unreachable enrolment screen (D-14).

**Accepts when:** one bundle of each of the four types, created through the
browser, gates clean with no repair step.

**Outcome, 0.5.1.** Done, and it did not need S-2 first: the conformance suite
lifts the bundle writer out of the SERVED page and runs the catalog on the exact
bytes a member's browser produces, so the acceptance test does not require the
gate to be switched on. All four types now report zero errors.

The form takes its tables from the catalog by import rather than by copy, so a
catalog change moves the UI with it. It writes all fifteen core fields, the
canonical heading set for the type, and the per-type extension fields each
type's own check requires: source and monitoring blocks for Information,
`surfaced_by` and a recheck trigger for a Problem, an `objective` for a Project,
`action_kind`, `risk_tier`, and `counterparty` for an Action.

One judgment inside it. Typed intake stamps `information@1`, not `@2`. The @2
contract makes the intake provenance register mandatory, and a register
describes captured DOCUMENTS with a locator, an authority, a capture method, a
grade, and a hash. A member typing what they know has no document, so @2 would
demand a register with nothing honest in it. Material arriving WITH a document
is @2 and carries custody, which is S-5's path rather than this one.

D-14 closed alongside: an invitation is now a link carrying the code in the URL
fragment, which never reaches a server, and it opens the enrolment screen that
had existed since 0.4.0 with no reachable path to it.

### S-4 Gathering requests
**Status: todo** · Depends: S-2

`data/gathering.json` per the C-18.5 grammar: GATH identifiers, dual-audience
targets, locators validated by the catalog's own `isPublicHttpsLocator`, and the
daemon budget block. The grammar exists so a leaked write token can litter the
queue without steering a session, so the validator is the catalog's function, not
a new one.

**Accepts when:** a request survives a round trip and C-18.5 passes; a request
carrying a non-public locator, a multiline target, or an oversize description is
refused at the write with the check's own message.

### S-5 Capture and the provenance register
**Status: todo** · Depends: S-4

The plane moves bytes today; what is missing is what makes a capture evidence.
`data/provenance.json` per C-18.1: locator, authority, retrieved instant, and a
capture block with method, grade, actor_class, sha256, encoding. Custody block
for member-origin material. Parts for oversize captures, streaming through the
catalog's incremental SHA-256 so peak residency is one part.

**Accepts when:** C-18.1, C-18.3, and C-18.6 pass on a freshly captured
document, including a multi-part capture over the single-value storage limit.

### S-6 Co-attestation
**Status: todo** · Depends: S-5

RFC 3161 primary, per the decision above. DER encode a TimeStampReq, parse the
TimeStampResp, store the token as a registered capture, record the attempt.
Multiple TSAs configured; failure recorded honestly rather than omitted. Save
Page Now as an opt-in second path, anonymous mode, per-capture rather than
default.

**Accepts when:** a captured document carries a verifiable RFC 3161 token that
`openssl ts -verify` accepts, and C-18.4 stops warning on crucial material.

### S-7 Monitoring as mechanical writers
**Status: todo** · Depends: S-5

Source change detection, deadline and recheck sweeps, inside the
`MECHANICAL_FIELD_SETS` envelope. C-20.1 enforces the envelope by diffing history
snapshots, so the constraint is mechanical rather than remembered. A mechanical
creation lands at `collected` and never higher.

**Accepts when:** a monitor tick that touches a field outside its declared set is
refused by the gate, proven by a deliberate violation test.

### S-8 Scale benchmark, with the real gate in the path
**Status: todo** · Debt: D-12 · Depends: S-2

Conversion Plan step 6, still owed: synthesized stores at 5,000 and 20,000
bundles on the deployed plane against the plan's prediction table. Runs after
S-2 because forty-nine checks over every bundle changes whole-store cost by an
unknown factor and the number worth having includes the real gate. Conversion
Plan probe 1 (FTS5 virtual tables versus export) folds in here.

**Accepts when:** measured numbers are recorded against the prediction table,
with the gate in the path, and probe 1 is answered.

### S-9 Retire the old plane
**Status: todo** · Debt: D-11 · Depends: S-6

Revoke the R2 key pair in Cloudflare and the SPN2 pair in the Internet Archive
account, delete the Apps Script deployment (which retires the four bearer tokens
by removing what they open), and delete
`docs/development/apps-script/promotion-service.gs` per its own expiry
condition.

**Accepts when:** the deployment is gone, the four credentials are revoked in
their own systems, and the source file is removed in a commit that says why.

---

## Notes

- Steps S-1 through S-3 are conformance and are not optional. S-4 through S-7 are
  the acquisition tooling the Apps Script accelerator carried. S-8 is the number
  that says whether the design holds. S-9 is the point at which one plane of
  record exists rather than two.
- Every acceptance test above is runnable. If a step cannot be verified by
  running something, the step is wrong, not the test.
