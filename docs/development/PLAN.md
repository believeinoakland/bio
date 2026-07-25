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
**Status: done (0.6.0)** · Debt: D-5 · Depends: S-1 (done). S-3 landed first deliberately: switching on 49 checks before the intake path was conformant would have made the browser form unusable at the moment the gate started working.

Replace the four hand-written checks with the catalog itself. Inject WebCrypto at
the `sha256` and `sha512` seams, the store at `resolveTarget`, and the registry
bundle at `releaseRegistry`. Do not reimplement any check: a reimplementation is
a fourth implementation pretending to be conformance.

Record the catalog's own version string on every publication, replacing
`plane-gate/0.1`.

**Accepts when:** every bundle in the live record gates with zero errors, and
`ratify` refuses a bundle that the catalog refuses, proven by a test that
tampers one bundle per check family.

**Outcome, 0.6.0.** The gate imports `checkBundle` and reimplements nothing; the
conformance suite asserts that by grepping the gate for check identifiers and
finding none. `gateVersion` now reads `plane-gate/1.0 (bio-checks 1.16.5)`, so
every publication records which catalog judged it.

Two design choices about bytes, both deliberate:

- **Blob-backed files are declared elided, not fetched.** The catalog's
  three-tier read model exists for this. Fetching would mean pulling a 39.6MB
  capture and its history copies into a Worker to gate one bundle.
- **Capture integrity is not re-proven at the gate**, because the capture op
  hashes the body server-side on write and refuses a mismatch. Bytes are proven
  when they land, which is earlier and stronger than re-proving them on every
  ratification. The plane still checks PRESENCE, by R2 head rather than fetch.

That required one change to the catalog, recorded in `bio-plane/checks/README.md`
and bumping it to 1.16.5: C-12.2's snapshot presence check used `files.has` where
the catalog's own 1.13.0 rule says existence assertions consult files union
elided. It was an existence assertion using the wrong helper, and it was the
cause of the 71 phantom findings. The Apps Script embed is retired, so nothing
now runs 1.16.4.

**Upgrading the ratify suite to conformant fixtures found two more drifts**, both
in DEBT: the plane's `refs` table is populated from the promote payload rather
than parsed from `bundle.md`, so the two can disagree and only frontmatter is
checked (D-21); and the browser's revise path does not append a Session Log
entry, which C-13.2 requires of any bundle whose `last_updated` moves (D-22).

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
**Status: done (0.7.0)** · Depends: S-2

`data/gathering.json` per the C-18.5 grammar: GATH identifiers, dual-audience
targets, locators validated by the catalog's own `isPublicHttpsLocator`, and the
daemon budget block. The grammar exists so a leaked write token can litter the
queue without steering a session, so the validator is the catalog's function, not
a new one.

**Accepts when:** a request survives a round trip and C-18.5 passes; a request
carrying a non-public locator, a multiline target, or an oversize description is
refused at the write with the check's own message.

**Outcome, 0.7.0.** Done, 40 assertions in `test/gathering.test.mjjs`. The write
path runs the catalog's `checkGatheringGrammar`, which required exporting it
(catalog 1.16.6, no logic changed). Refused at the write rather than only at
ratification, because the queue is an instruction channel: a session reads it and
acts on it, so a malformed entry that lands has already cost a member's attention
even if the gate would later catch it.

Refused and named: non-https locators, bare IPs, credentials in the authority,
localhost, multiline targets, oversize targets and descriptions, identifiers
outside the GATH grammar, criticality and status outside their enums, requests
with no locators, and sweep sources that are not public https. Each reports
C-18.5 with the catalog's own message. A separate assertion proves nothing landed
when a write was refused.

**One real conflict, resolved explicitly rather than papered over.** Enforcing the
grammar at the write broke historical replay: the record's own history contains
gathering queues written before this grammar existed, and a migration replays them
verbatim through the same front door. Refusing them would mean the plane cannot
faithfully hold its own past.

So a replay declares itself. `promote` accepts `replay: true`, which skips THIS
check and nothing else, and the manifest entry records `kind: promotion-replay`,
so which revisions were reconstructed rather than authored stays visible in the
history permanently. The exemption cannot hide, which is the only version of it
worth having. Tested both ways: authored, the legacy queue is refused; replayed,
it lands and the history says so.

### S-5 Capture and the provenance register
**Status: done (0.8.0), except the parts path** · Depends: S-4

The plane moves bytes today; what is missing is what makes a capture evidence.
`data/provenance.json` per C-18.1: locator, authority, retrieved instant, and a
capture block with method, grade, actor_class, sha256, encoding. Custody block
for member-origin material. Parts for oversize captures, streaming through the
catalog's incremental SHA-256 so peak residency is one part.

**Accepts when:** C-18.1, C-18.3, and C-18.6 pass on a freshly captured
document, including a multi-part capture over the single-value storage limit.

**Acquisition done, 0.7.1**, 44 assertions in `test/acquire.test.mjs`. `op=acquire`
fetches a public locator, hashes at receipt, stores content-addressed, and returns
a provenance document in the shape C-18.1 requires, so a caller cannot get that
shape subtly wrong. It writes no bundle state, because the doctrine is explicit
that no intake path writes live state and the daemon and the member are writers
like any other.

**Two questions I had were answered by the corpus, not by me.**

*What grade does a Worker produce?* B, and it says so. Intake Doctrine Section 3
defines Grade B as "the document bytes as fetched by a capable surface, hashed at
receipt, with locator and instant", and Grade A as a WACZ or equivalent
chain-of-custody capture of the source as served, which this surface cannot make.
Overclaiming would defeat the entire grading scheme, whose premise is that "a
claim about evidence is only as strong as its weakest named layer". The response
also says in words why A is unavailable, so nobody has to know the doctrine to
understand what they got.

*What bounds a Worker fetching a member's URL?* The catalog's own
`isPublicHttpsLocator`, the same function guarding the gathering queue, so there
is one definition of a reachable address rather than two. Refused and tested:
plain http, localhost, bare IP addresses, credentials in the authority,
hostnames with no public dot, and non-URL schemes.

Bounded at 20MB, because a Worker holds the document in memory to hash it. Beyond
that the document is captured as registered parts, which the catalog's incremental
SHA-256 streams one part at a time; that path belongs to the client.

**Register assembly done, 0.8.0.** The intake form now takes an optional web
address and issuing authority. Given both, it acquires the document BEFORE
writing anything, so a source that cannot be reached leaves no half-made bundle
in the record, then assembles three files: the record, `data/provenance.json`
naming the document, and the document itself as a blob reference rather than
inlined bytes. The capture register entry points at the same path the provenance
register names.

The schema follows the evidence rather than a preference: a bundle carrying a
document is `information@2`, which is what makes the provenance register
mandatory; one where a member wrote down what they know stays `@1`, because a
register describes captured documents and there is none.

Proven end to end. The suite lifts the browser's own assembly out of the SERVED
script, runs it on a genuinely acquired document, supplies the bytes so the byte
checks actually execute rather than being skipped as the gate skips them, and the
catalog returns zero findings. C-18.1, C-18.3, and C-18.6 all pass on a freshly
captured document.

Every refusal a source can produce is translated: a non-public address, a missing
authority, an HTTP error with its status, an unreachable host, an empty body, and
an oversize document each get a sentence a member can act on.

**Still owed:** the parts path for documents over the 20MB in-memory bound. The
catalog supports `parts` and its incremental SHA-256 streams them one at a time;
nothing in the plane assembles them yet.

### S-6 Co-attestation
**Status: done (0.9.1)** · Depends: S-5

RFC 3161 primary, per the decision above. DER encode a TimeStampReq, parse the
TimeStampResp, store the token as a registered capture, record the attempt.
Multiple TSAs configured; failure recorded honestly rather than omitted. Save
Page Now as an opt-in second path, anonymous mode, per-capture rather than
default.

**Accepts when:** a captured document carries a verifiable RFC 3161 token that
`openssl ts -verify` accepts, and C-18.4 stops warning on crucial material.

**RFC 3161 done, 0.9.0**, 37 assertions in `test/attest.test.mjs`. `op=attest`
takes the hash of a capture already in the store, asks a timestamp authority to
attest it existed, stores the token content-addressed, and returns the attempt
record in the shape C-18.1 requires.

**The load-bearing assertion is byte-identity with OpenSSL.** Reimplemented ASN.1
is worth exactly what its conformance test is worth, so the suite builds a
TimeStampReq, has openssl parse it, then rebuilds it with the nonce openssl chose
for its own request and compares the bytes. They are identical. openssl is also
the tool the doctrine's verification path uses, so agreeing with it is the entire
guarantee rather than a nicety.

**Three design decisions worth not relitigating.**

*The endpoints are a compiled constant, never request input.* This op makes the
plane send an outbound POST, and a caller-supplied endpoint list would turn every
instance into a probe of whatever an attacker named. The evidence-locator fence
exists for member-supplied addresses; not accepting one at all is stronger than
validating it. A test greps the attest path to prove no endpoint is read from the
body. They are http rather than https deliberately: the token carries its own
signature and transport encryption adds nothing to it, which is why the RFC's own
examples are http.

*Verification is not done here and is not claimed.* Checking a token means parsing
CMS, validating a certificate chain, and deciding which roots to trust; a Worker
that got any of that subtly wrong would be worse than one that does not claim it.
The doctrine already places verification at review. What the plane does guarantee
is BINDING: the returned token must contain the digest we asked about, so an
authority cannot hand back a token for something else and have it filed as ours.
The response says in words that the signature was not verified here.

*Every attempt is recorded, and failures are not dropped.* A register showing an
attempt that failed and one showing no attempt are different claims about what the
group tried, and collapsing them lets an absence read as a success. Tested: all
authorities failing yields `ok: false` with a reason per authority, and one
authority being down falls through to the next with the failure still in the
record beside the success.

**One defect the suite caught immediately.** The token was sliced out of the whole
response using indices relative to the inner sequence, so every token came out
shifted by the length of the outer header and the binding check refused them all.
Found on the first run.

**The archive path and the wiring, 0.9.1.** 48 assertions total.

The public archive is opt-in and off by default, and the reason is not
politeness: asking an archive to fetch a URL publishes the fact of interest, so
anyone watching it can see the group looked. Under Design Requirement 13 that is
a tell, and whether to leave one is a tactical judgement no default should make.
The checkbox says exactly that in the interface: stronger evidence, and public.

Anonymous mode, so there is no credential to hold, rotate, or leak, and nothing
ties the request to an account. This also means the SPN2 keys being revoked with
the Apps Script decommissioning do not need replacing. The host is a compiled
constant and the only variable part is a locator that has already passed
`isPublicHttpsLocator`; a test throws `archiveBase` and `service` overrides at the
op and asserts no host outside the compiled set is ever contacted.

Wired into intake. Capture, then attest immediately while the capture is fresh,
because a timestamp is a claim about WHEN and one obtained later says less. The
attempts land in the document's `attestation_attempts` whichever way they went,
and the timestamp token joins the bundle as a registered capture rather than
sitting only in the store: a token nobody can find is a token nobody will check.
An archive failure does not stop the bundle, and the failed attempt stays in the
register, because that is a different and more honest claim than no attempt.

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

## Out-of-band fixes

Small, self-contained corrections that do not belong to a numbered step.

- **D-10, the no-op update.** Fixed in the wizard, 0.5.1. The installer now asks
  what the instance is running BEFORE uploading. A re-upload of the same version
  says "Nothing changed: your copy was already running X" and tells the operator
  to check whether a newer release was actually published, instead of reporting
  "Updated to X" and letting them believe work happened. A real update now names
  both versions: "Updated from 0.1.0 to 0.5.1".

  Writing the test for it exposed that three existing update fixtures had the
  instance already answering with the target version, so those blocks had been
  describing no-ops while claiming to test updates. Nothing had looked at the
  before-version until now, so nothing had noticed. They now answer with the old
  version before the upload and the new one after, which is what an update
  actually looks like.

### Out-of-band, 0.6.1: the revise path

D-22 said the revise path wrote no Session Log entry. Fixing it found that the
path had never worked at all (D-23). Four things were wrong in the same twenty
lines:

- It read `lease.result.baseSha`; the lease returns `base`. Every revision sent
  `base: undefined`, the store correctly refused it as a stale write, and the
  page printed the raw code because its friendly message matched on `STALE`
  rather than `CAS_STALE`.
- It overwrote `created` with the save time, destroying when the bundle was
  actually created, which no history holds elsewhere.
- It never moved `last_updated` in the DOCUMENT, only in the promote metadata,
  and the catalog reads the document.
- It appended no Session Log entry, which C-13.2 requires of any bundle whose
  `last_updated` moves and C-5.1 requires be preserved across revisions.

All four fixed, and the transform is a pure function tested through the SERVED
script against the catalog: created preserved, last_updated moved, an entry
appended naming the member, prior entries surviving a second revision, and
Review Notes still following the Session Log.

Writing it, I broke the served page with a comment containing backticks, which is
the 0.3.8 defect class (D-24). `hygiene.test.mjs` now scans the template for
unescaped backticks, counts interpolations, loads the module, and parses the
script it serves. Twice by accident is enough.

### Out-of-band, 0.6.2: references have one home

D-21 closed. References lived in the promote payload and in the document, only
the document was ever checked, and nothing compared them. Promote now reads them
out of `bundle.md` using the CATALOG'S OWN `parseFrontmatter`, so the store's
`refs` table is a projection of the document rather than a second place to state
the same thing, and the store's dangling-reference view and the catalog's C-6.2
read the same edges by construction rather than by agreement.

The payload field is gone. A caller still sending it is refused as
`REFS_IN_PAYLOAD` rather than quietly overridden, because a silent override is
exactly how the two drifted apart. That refusal caught four test suites and the
scaling harness still passing the dead field, which is the point of making it
loud.

The migrate tool no longer derives references at all: the migrated document
carries them as Drive wrote them, and the store projects that.

Proven by a test that repoints a live reference at nothing and asserts that the
store's own view and the catalog name the same single finding, C-6.2.

## Notes

- Steps S-1 through S-3 are conformance and are not optional. S-4 through S-7 are
  the acquisition tooling the Apps Script accelerator carried. S-8 is the number
  that says whether the design holds. S-9 is the point at which one plane of
  record exists rather than two.
- Every acceptance test above is runnable. If a step cannot be verified by
  running something, the step is wrong, not the test.
