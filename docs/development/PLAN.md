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
**Status: done (0.13.0)** · Depends: S-4

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

**The parts path, 0.13.0.** Acquisition now STREAMS. The response body is read in
chunks, each 8MB boundary is flushed to storage as its own capture, and peak
residency is one part rather than the whole document. The 39.6MB budget book in
the real record is the case that forced it: a surface that must hold a document to
hash it cannot capture the documents a city actually publishes.

`capture.sha256` is over the reassembled whole and each part carries
`{file, sha256, bytes}`, which is what C-18.1 requires and what C-18.6 verifies by
streaming the parts through its own incremental hasher.

**The plane hashes the whole with the CATALOG'S hasher, not WebCrypto**, and that
is the decision worth keeping. If the plane hashed with one implementation and the
catalog re-hashed the parts with another, any disagreement between them would
present as tampering: a hash mismatch on honest bytes, reported as silent content
mutation. One hasher on both sides makes that false alarm impossible. The
single-part path additionally asserts that the incremental hash equals the block
hash of the same bytes, and refuses loudly if they ever differ, because that would
be worth knowing immediately.

A single part under the bound is stored as one plain capture, so the ordinary shape
is unchanged and `parts` appears only when a document actually needs it. The
ceiling moved from 20MB to 256MB, and beyond it the refusal is still honest rather
than a truncated capture.

Proven by capturing a 21MB document and letting the catalog verify the whole FROM
THE PARTS ALONE, with zero findings and nothing ever holding the reassembled
document. The browser assembly registers each part rather than a phantom whole,
since registering a whole would name bytes the store does not hold.

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
**Status: done (0.11.0)** · Depends: S-5

Source change detection, deadline and recheck sweeps, inside the
`MECHANICAL_FIELD_SETS` envelope. C-20.1 enforces the envelope by diffing history
snapshots, so the constraint is mechanical rather than remembered. A mechanical
creation lands at `collected` and never higher.

**Accepts when:** a monitor tick that touches a field outside its declared set is
refused by the gate, proven by a deliberate violation test.

**Accepted, 0.10.0**, 20 assertions in `test/mechanical.test.mjs`, written as
deliberate violations so the gate had to refuse each one.

The store now carries `writer` and `operation` on every manifest entry and emits
both in the verbatim promotion record, which is where C-20.1 reads them. A
mechanical promotion naming an operation the catalog does not know is refused at
the WRITE, so a daemon cannot leave an unaccountable mechanical revision in the
history and find out at ratification.

Refused by the gate, each with the field or section named: a monitor tick that
changed `criticality`, which is outside its declared set; a tick that rewrote the
Summary, when a mechanical writer touches only the Session Log; a sweep that
changed any frontmatter at all, its declared set being empty; and a mechanical
creation landing at `verified`, when daemon creations never elevate. A
hand-authored promotion doing all of those things is held to no envelope and
produces no finding, which is the point: the constraint is on the actor that
claims to be mechanical, not on everyone.

**One real defect this uncovered, and it had been silently disabling the audit.**
The verbatim promotion record listed the PRE-image file hashes where the catalog
expects the hashes the promotion WROTE. C-20.1 compares live against the recorded
bundle.md hash to decide whether live is still that promotion's result, so with
the wrong hashes it concluded the post state was unknowable and skipped every
mechanical entry rather than judging it. The audit was returning clean because it
was not looking. `classifyDivergence` rebuilds its chain from the same field, so
it was equally blind.

`files_json` now stores name and hash pairs, and the two consumers get the views
they each need: the manifest entry gets names, because C-20.1 asks whether a later
entry touched bundle.md, and the promotion record gets the hashes. The live record
re-audits at 30 clean with the changed projection.

**The monitor itself, 0.11.0.** `op=monitor` reads the live record, takes its
baseline from whatever the provenance register says was captured from that
locator, fetches, compares, and writes a mechanical `monitor-tick` through promote
like any other writer. Unchanged, modified and removed each resolve from evidence
rather than from a flag: `removed` only on a 404 or 410, `modified` only when the
bytes differ from the recorded capture, and with no baseline it records the check
and says it had nothing to compare against rather than inventing a status.

**It does not record the new document's hash, and that absence is the design.**
The field set does not permit it, and it should not: detecting that a source moved
is mechanical, deciding what the new version MEANS is not. So the tick raises
`reeval_pending` and a human or a session decides whether to capture the new
bytes. That is the escalation ladder expressed as one operation, and the envelope
is what makes it impossible for the daemon to quietly do more.

The load-bearing test is that the plane's own ticks are judged by the catalog:
three real ticks across unchanged, modified, and removed, then `checkBundle` over
the result, zero findings. A daemon whose own output the auditor refuses is worse
than no daemon.

**One defect this found that would have destroyed evidence.** `promote` writes a
WHOLE image, so a writer that mentions one file deletes every other. The first
version of the tick supplied only `bundle.md` and therefore removed the provenance
register from every bundle it touched, which took the monitoring baseline with it
and left an `information@2` bundle with no register at all. A mechanical writer
silently destroying evidence is the worst thing this system could do, and the
shape of `promote` made it the DEFAULT behaviour of a careless caller.

Fixed by carrying every other file forward untouched, and the image now includes a
blob's size alongside its hash so a partial writer CAN hand the rest back. The
underlying sharpness of `promote` remains and is now recorded as D-25: the next
writer to touch one file of a bundle will meet it too.

### S-8 Scale benchmark, with the real gate in the path
**Status: done (2026-07-24)** · Debt: D-12 · Depends: S-2

Conversion Plan step 6, still owed: synthesized stores at 5,000 and 20,000
bundles on the deployed plane against the plan's prediction table. Runs after
S-2 because forty-nine checks over every bundle changes whole-store cost by an
unknown factor and the number worth having includes the real gate. Conversion
Plan probe 1 (FTS5 virtual tables versus export) folds in here.

**Accepts when:** measured numbers are recorded against the prediction table,
with the gate in the path, and probe 1 is answered.

**Measured, `test/scale.mjs`.** Local Miniflare, which is workerd with the same
SQLite the deployed Durable Object uses, so the algorithmic behaviour is the real
thing and only network is absent. Deliberately not run against biosmoke7: it holds
the record of reference and twenty thousand synthetic bundles do not belong in it.

| | 5,000 | 20,000 | shape |
|---|---|---|---|
| write, per bundle | 7.62ms | 5.82ms | flat |
| `stats` | 5ms | 5ms | constant |
| `list` (every bundle) | 81ms | 434ms | linear |
| `dangling` (whole store) | 5ms | 4ms | constant |
| `image`, one bundle | 5ms | 4ms | constant |
| gate, one bundle, in memory | 0.30ms | 0.55ms | constant |
| read + gate, per bundle | 3.18ms | 3.17ms | flat |
| whole-store gated pass | 15.9s | 63.5s | linear |

**The design holds, and three of these are better than they needed to be.**
Promotion does not slow down as the store grows, which was the thing most likely
to fail. A single bundle's byte-complete image is 4ms, against the roughly 43
seconds the same operation cost on Drive. And the gate, running all forty-nine
checks, is half a millisecond: the conformance work of today cost essentially
nothing at runtime, which is the opposite of what I expected when I wrote D-20's
warning about byte-complete images.

**The bottleneck is round trips, not the store and not the checks.** On the
deployed plane a gated whole-store pass at 20,000 bundles is about 2,060 seconds
sequentially and about 103 seconds at twenty requests in flight, against 63
seconds locally. Roughly 97 percent of that is the fixed per-call latency of
fetching one image at a time. The store is not the constraint; the shape of the
API is.

**The recommendation that follows, recorded as D-26.** A whole-store conformance
pass should not pay one round trip per bundle. The catalog is a pure function over
an injected filesystem and the images already live inside the Durable Object, so
the pass belongs INSIDE the object: one call in, a findings summary out. That
turns 20,000 round trips into one and makes a full re-audit of a large record a
minute's work rather than half an hour's.

**`list` is the one thing that will bite later.** It is honestly linear, 434ms at
20,000, which is fine now and is 2 seconds at 100,000. It returns every bundle
because nothing has ever needed less. Pagination or a projection with fewer
columns is the answer when a group gets there, and this is the measurement that
says when.

**Probe 1, FTS5 virtual tables versus export, is now ANSWERED**, separately,
once there was a fixed conformant corpus to index. FTS5 exists in the Durable
Object's SQLite (FTS4 and `PRAGMA compile_options` are refused by workerd's
authorizer; FTS5 is not), and the FTS5-versus-export comparison was measured at
5,000 and 20,000 with three-way exact agreement against a brute-force scan.
FTS5 wins: its cost tracks result size rather than corpus size, it is the
one-call-in-answer-out shape D-26 already chose, and it keeps the index on the
protected side of the two-bucket fence, where an exported artifact cannot stay.
Full record, actuals, and the design questions that remain are in
`RETRIEVAL-PROBE.md`. The measurement was optimistically folded into S-8; it
could not run here because FTS5 did not exist yet in a form there was anything
to compare, so it ran as its own probe (`bio-plane/test/retrieval-probe.mjs`,
`npm run probe:retrieval`).

### S-9 Retire the old plane
**Status: todo** · Debt: D-11 · Depends: S-6

Revoke the R2 key pair in Cloudflare and the SPN2 pair in the Internet Archive
account, delete the Apps Script deployment (which retires the four bearer tokens
by removing what they open), and delete
`docs/development/apps-script/promotion-service.gs` per its own expiry
condition.

**Accepts when:** the deployment is gone, the four credentials are revoked in
their own systems, and the source file is removed in a commit that says why.

### S-10 Retrieval
**Status: COMPLETE. Steps 1 to 5 done, 0.15.0 through 0.17.0** · Depends: S-8 (probe answered)

**Step 1, done in 0.15.0.** The `bundles` projection now carries every field the
UX filters on: `schema_id`, `produced_mode`, `capability_tier`, `source_locator`,
`source_authority`, `source_retrieved`, `source_status`, `content_hash`,
`monitor_enabled`, `monitor_frequency`, `monitor_last_checked`,
`annotations_open`, `reeval_flag`, `reeval_since`, `reeval_source`, plus `fm_json`
holding the whole frontmatter for the per-schema tail. Seven of them are indexed
and `test/projection.test.mjs` asserts the index is USED via EXPLAIN QUERY PLAN
rather than trusting that creating it was enough.

Three properties the tests hold, each of which is a defect class if it slips:

- The projection is derived from bundle.md with the CATALOG'S OWN parser, so the
  store's view and the checker's view cannot disagree about what the document
  says. It is not taken from the caller's `meta`, which has no representation for
  these fields at all.
- It is written inside `promote`'s transaction, so it cannot be a revision behind
  the document.
- Unparseable frontmatter yields NULLs, never guesses. A wrong value in a
  filterable column is worse than an absent one, because the filter silently
  under-reports and the member cannot tell.

Rows written before the columns existed are backfilled from stored bundle.md, in
a bounded pass at construction plus an admin `op=reproject` for a store larger
than one pass. `op=projection` is member class and above, behind the same fence as
`op=index`, because the projection carries `source.locator`.

**Steps 2, 3 and 4, done in 0.16.0.** The text index, the query language, and
`op=search`.

Step 2, the index. `bundles_fts` is an FTS5 table inside the Durable Object with
five columns (`title, body, meta, locator, authority`, `unicode61`), keyed on a
new explicit `bundles.fts_id`. Explicit because the table's implicit rowid is an
implementation detail SQLite may renumber, and an index keyed on a number the
engine can change is one that can silently point at the wrong document. Written
inside `promote`'s transaction; `purge` takes the index row with it, which
matters because `fts_id` is allocated MAX+1 and an orphan would otherwise be
inherited by a later bundle. `op=searchindexcheck` re-derives the expected row for
every bundle and compares, and the suite gives it a negative control by breaking
the index and requiring it to say so.

Step 3, the language. `src/query.mjs` holds no database handle, so `src/store.mjs`
builds no query at all and every compiled statement goes through one guarded
executor that throws without the viewer gate. That is what makes D-15's single
compilation point structural rather than a convention.

Step 4, the surface. `op=search`, member class and above, returning ids plus full
provenance with bm25 relevance and snippets, facet counts for the sidebar, and
`mode=ids` for select-all. `op=searchfields` publishes the vocabulary so a UI does
not keep a drifting copy.

**Step 5, selections, done in 0.17.0.** Bob settled the three questions on
2026-07-25. Select-all means the QUERY, so a query selection stores the
criterion and no items; an enumerated selection freezes specific items with the
sha each carried; an enumeration above 10,000 is refused rather than downgraded,
because downgrading would change what the click meant. Keep-alive is 300s
refreshed on read, with a Durable Object alarm sweeping what the lazy sweep
cannot reach. Drift is detected exactly, classified from the manifest's `writer`
and `operation`, and never absorbed; visibility can only shrink a selection, and
that one is a requirement rather than a policy. What drift means depends on the
action's weight: citing proceeds and reports, state-changing refuses and hands
over nothing.

**The numbers, measured on the real path (D-32).** `npm run bench:retrieval`
loads a corpus through the real `promote` and drives the real `op=search`: 5ms
to 163ms at 20,000 bundles, against probe 2's ~46ms ceiling for the substrate
alone. The bench found two structural costs, both fixed, which halved the worst
shape from 305ms: the gate was a CTE intersected into every statement rather
than a WHERE predicate, and the facet pass ran one statement per field. It also
found two undocumented workerd ceilings, 100 bound variables and five compound
terms, the second of which would have broken the compiler on six metadata
filters (D-36).

**Next: the actions that refer to a selection.** The gate they call already
exists and takes a weight; nothing calls it yet.


The scope is a full search, filter, list, sort, and select surface, not free-text
search. Free text is one substrate element. The control surface is a collapsible
sidebar of data presentation and editing views, with filter and sort integrated
into presentation header controls, and selection through keystroke and mouse
modifiers and context-menu actions. Query syntax is Google-like: a bare string at
the simple end, compound nested booleans with metadata type and value selectors
at the rich end. Metadata and frontmatter are searchable, not only body text.

The mechanism is decided by measurement, in two probes:

- `RETRIEVAL-PROBE.md` (probe 1): FTS5 inside the Durable Object beats an exported
  index, because cost tracks result size rather than corpus size.
- `RETRIEVAL-SUBSTRATE.md` (probe 2): the other four verbs measured. The engine
  has every feature the query language needs (nested booleans, phrases, prefix,
  NEAR, bm25, snippets, column-scoped terms, JSON1, generated columns, expression
  indexes). Typed indexed columns beat a facet table by ~9x on write and ~5.5x on
  space, with JSON1 covering the heterogeneous per-schema tail. Nothing exceeds
  ~46ms at 20,000 bundles, facet counts for the sidebar included.

Two obligations fall out of the measurements and are not open questions. Every
sort compiles to `ORDER BY <field> <dir>, id ASC`, because without a declared
stable tiebreak paging is wrong rather than merely inconsistent, on any field
with ties. And select-all is a distinct operation from a page, returning every id
in the set, with the set stable between selection and action.

The DESIGN is now settled (Bob, July 25), recorded in `RETRIEVAL-SUBSTRATE.md`:
`source.locator` and `source.authority` are searchable; a result carries ids plus
full provenance; default order is relevance with trivially easy reordering;
a selection is a server-side construct because a client-held set neither scales
nor stays stable; and the `op=index` public-class hole is fixed in 0.14.1.

Search ships at flat member scope ahead of the membership model, with the D-15
viewer-visibility filter designed in as a single compilation point that returns
true for a member today and a real predicate when projects exist. A test asserts
no query path reaches the store without passing through it. That makes the later
change one function rather than an audit of every query.

**Status: unblocked, not started** · Build order in `RETRIEVAL-SUBSTRATE.md`:
extend the projection, maintain it transactionally in `promote`, then the parser
and compiler, then `op=search`, then server-side selection, then the real viewer
predicate when membership lands.

**Accepts when:** an `op=search` that runs FTS5 inside the object returns results
agreeing exactly with a brute-force scan over the same query semantics, across all
five verbs and not free text alone, proven by a test held to the `op=audit`
agreement standard, and is reachable only by member class or above.

---

### Out-of-band, 0.12.0: the pass moves inside (D-26)

The benchmark named one bottleneck and this closes it. `op=audit` runs the
catalog inside the Durable Object where the images already are, paginated by
cursor because a Durable Object has a CPU budget and 20,000 bundles is about four
seconds of work.

| | 5,000 | 20,000 |
|---|---|---|
| gated pass from outside, local | 15.2s | 63.9s |
| in-object pass, local | 1.1s over 11 calls | 3.9s over 41 calls |
| per bundle | 0.22ms | 0.20ms |
| deployed, from outside, sequential | ~515s | ~2,064s |
| deployed, in-object (calls x round trip + work) | ~2.2s | ~8s |

Roughly 250x on the deployed plane, and the reason is not cleverness: it is that
97% of the old figure was network, and the work was never the expensive part.

The assertion that matters is agreement, not speed. A faster answer that differs
is worthless, so the suite gates every bundle from outside and from inside and
compares the clean count, the error count, and the tally check for check. It also
proves the pagination is honest: every bundle seen exactly once across many pages,
the same verdict as one large page, and a final page that says there is no more.

Offenders are reported but bounded at twenty, because a pass over a broken store
must not answer with a megabyte of repetition; the tally counts all of them and
the sample shows what they look like.

**One defect in my own benchmark, found by writing this suite.** The synthetic ids
used a six-digit sequence where `BUNDLE_ID_RE` is four, so every "clean" bundle in
the first benchmark run was quietly failing C-1.2 and the numbers were measured
over non-conformant input. Re-measured with valid ids; the figures held, but they
were not the figures I thought I was reporting.

### Out-of-band, 0.13.1: silent deletion is refused (D-25, D-29)

`promote` writes a whole image, so a caller that mentions one file removes every
other. Efficient, and a trap, and it had already cost twice: the monitor's first
tick destroyed the provenance register of every bundle it touched, and closing
this found the browser's revise path doing exactly the same thing to anyone who
edited a bundle with a captured document (D-29). Both were the DEFAULT behaviour
of a caller doing the obvious thing, which is the definition of a bad interface
rather than two careless callers.

A promotion that drops a path the previous revision had must now name it in
`drop[]`. Deliberate deletion is still possible and is on the record; accidental
deletion is refused with the paths listed. Replay is exempt, because the history
it reconstructs may legitimately contain deletions and a replayed revision is
already marked as such.

I fixed the trap rather than a third call site. The first two times I patched the
caller; the third time the caller was going to be a group's own member losing
their evidence, and the interface is what was wrong.

### Out-of-band, 0.14.0: three truthfulness fixes (D-8, D-16, D-27)

**D-8, the vocabulary.** State Rules 5.1 declared a closed set of six relationship
values while `bio-checks` had carried a seventh, `corroborates`, since before that
document was published. A bundle using it passed the checker while contradicting
the spec that claims to be the closed authority. The document is amended, in the
direction of what already works: `corroborates` asserts that the citing object is
independently supported by the target, as distinct from `cites`, which asserts
dependency on it. Two documents that agree without either deriving from the other
are corroborating, and recording that as `cites` overstated the dependency and
understated the independence in exactly the situation where independence is the
point.

**D-16, the cover.** `members.name` is now `members.cover`, renamed rather than
aliased, because two words for one thing is how the drift this repo keeps finding
gets started. The word is the mitigation: a field called "name" invites an
administrator to type a legal name, which is the entire exposure the
cover-and-handle split exists to prevent. The interface now says so where the
field is, in the plainest terms available: it is a label for your own use, not a
legal name and not a form to fill in truthfully, "the CPA from Tuesday" is as
valid as anything else, and if your group is under real pressure choose covers
that would tell an outsider nothing. The refusal for a missing cover says the same.

**D-27, list paging.** Measured at 81ms for 5,000 rows and 434ms for 20,000, which
is honestly linear and about two seconds at 100,000. Paging is OPT-IN and shaped
like the audit's, a cursor that is the last identifier seen. A caller passing no
limit gets exactly what it always got, because the browser, the audit and the
migration verifier all want everything, and changing the answer they receive to
prepare for a store nobody has yet would break three callers today.

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

### S-11 Selection-backed actions
**Status: STARTED. Citing 0.18.0, severing and reinstating 0.19.0** · Depends: S-10 step 5

`selectionResolve` shipped in 0.17.0 with a weight parameter and no caller. This
step is the set of actions that call it, built one at a time, lightest first.

**Step 1, done in 0.18.0: CITING INFORMATION IN A PROJECT, `op=cite`, weight
`report`.** Chosen first because it ADDS references rather than moving state, so
drift is survivable and the reporting arm of the gate is exercised before
anything can be broken by it.

It writes the DOCUMENT, not the projection. `refs` is re-derived from `bundle.md`
frontmatter inside `promote`'s transaction and `promote` refuses a `refs` payload
outright (D-21), so citing splices `rel: cites` entries into the Project's
frontmatter and promotes a whole image. Edges land `confirmed` per State Rules
5.1. Every other file is carried forward, which is the property the suite asserts
directly: `promote` writes a whole image, so a writer that mentions one file
deletes the rest, and that default has destroyed provenance twice in this repo.

Three refusals, each writing nothing, and each a doctrine position rather than
validation: `SEVERED_EDGE` (a severed edge is a recorded human judgment, so
citing neither reverses it silently nor skips past it), `NOT_INFORMATION` (a
selection carrying anything else is refused whole, offenders named, never
narrowed to the citable subset), and `CITATION_TOO_LARGE` (D-38).

Held to the catalog, not to itself: the suite runs `checkBundle` over the Project
BEFORE and after citing, and the before-check is what makes the after-check mean
anything.

**Step 2, done in 0.19.0: SEVERING and REINSTATING a citation, `op=sever` and
`op=reinstate`, both at weight `refuse`.** These are the first state-changing
actions to refer to a selection and therefore the first callers of
`selectionResolve`'s refusing arm.

They also close a hole step 1 opened. Citing created edges and nothing could
withdraw one, so a citation list was an accumulation rather than a record of what
a group currently relies on, and the step-1 suite had to hand-edit frontmatter to
produce a severed edge at all.

Severing is not deletion: the edge keeps its target and its rel and only its
status moves. The reason is appended to the note rather than substituted, both
actions require one, and the whole set moves or none of it does, because a
half-run state change is what weight `refuse` exists to prevent.

**Step 3, next: an action that moves an OBJECT's state rather than an edge's.**
The candidates in ascending doctrinal weight are bulk disposition of Problems
(`surfaced` to `deferred` or `dismissed`, which C-2.8 requires a non-empty
`disposition_reason` for), bulk retirement of Information (`verified` to
`retired`), and bulk release (`collected` to `verified`). Release is LAST and
should probably never be a bulk action at all: C-18.1 makes it a named member's
per-document decision and C-18.7 wants a signed release record, so a bulk
release is the one shape in this family the intake doctrine argues against.

**Accepts when:** each action names its own weight and does not read one from the
caller; a report-weight action proceeds on drift and says what moved; a
refuse-weight action stops and hands over nothing so it cannot half-run; and the
bundle is conformant to the catalog after every one of them.

### S-12 Membership, the member half
**Status: STARTED. Sections 3, 4, 5, and 7 except lifecycle authority and fork, done, 0.25.0** · Depends: nothing

`architecture/BIO_Membership_Architecture_v2.md` is the design and nothing in it
is undecided. Do not re-derive it. **v1 is superseded and must not be worked
from**: its Section 7.7 says the OPPOSITE of v2's on who removes a project
participant, and code was written against the old rule.

**Done in 0.20.0.** Cover and handle as two names assigned by two parties
(section 3), with the handle unique across the instance and shown in the record.
Capabilities recorded (section 5), with `administer` deliberately excluded
because it moves only by the Section 4 process. And the Section 4 arithmetic:
the two-administrator floor, consensus on every addition past the second, and
removal by a majority of all administrators counting the target in the
denominator without letting them vote. The table is computed rather than
transcribed and exposed as `op=adminarith`.

The founding administrator has no roster row and is the root of trust (4.6).
They count in the census and cannot be removed from inside the application. This
was found by an EXISTING suite failing, not by the new one.

**Done in 0.22.0.** Burner-URL invitations (section 6), D-42. The URL is the
credential, it is spent on use, and afterwards it resolves to nothing and
reveals neither the group nor the invitee.

**Done in 0.23.0.** Project participation and the three visibility positions
(section 7): uninvited, invited-not-joined (skeleton only), joined. The single
compilation point in `query.mjs` filters by position and D-15 is closed.
**Reachable at the Durable Object only**, which step 4 below fixes.

**Next, in order.**

3. **DONE in 0.24.0. Capability enforcement at the op layer (section 5).** Capabilities are
   recorded and nothing consults them: a member with no `publish` capability
   reaches `op=ratify` and is stopped only by the absence of a signing key,
   which is the key doing the capability's job. Section 5 says a capability a
   member does not hold is ABSENT from their interface rather than present and
   refused, so this is a UI obligation as much as an ACL one, and BOTH halves
   ship, because an interface is not a boundary.

   Gates a SESSION and never a machine credential: a token class has no member
   behind it and therefore holds no capabilities, and inventing some would put a
   name on the record that nobody holds.

   Structural rather than a hand list. Every mutating op a session can reach
   names a capability or names `null` with its reason, and a suite reads the op
   table and the capability table out of the module so an op added later cannot
   pass by not being mentioned. Standing lesson 2.

   `create_projects` has no op of its own, because a project is created by
   promoting a bundle with no base whose `object_type` is `project`. It gates
   that SHAPE, in one place, in the promote path.

   **An administrator holds every working capability** (v2 section 5), so
   `memberCaps` keeps refusing to edit an administrator's row and that refusal
   is now coherent rather than a trap: there is nothing to edit.

4. **The v2 project rules.** Four things, and the first is a prerequisite for
   the rest having any effect.

   a. **DONE in 0.24.0. The participation ops reach the control plane.** `projectinvite`,
      `projectjoin`, `projectleave`, `projectremove` and `projectparticipants`
      exist in the store's route map and are absent from `OPS` in `index.mjs`,
      so every real caller gets `unknown op`. Sections 7.2, 7.4, 7.6, 7.7 and
      7.8 are shipped and unreachable. `by` is stamped server-side from the
      session, exactly as `author` is.
   b. **7.7 REVERSED.** Only an OWNER removes a project participant.
      Administrators do not. `projectRemove` enforces administrator-only today
      and `projects.test.mjs` asserts it. Correct both; do not exempt them.
      Standing lesson 3.
   c. **DONE in 0.25.0. Owner governance (7.10).** Ownership is a set. Addition follows 4.7
      unchanged. Removal follows 4.7 EXCEPT at exactly two owners, where both
      must agree and the target is one of them. Do not reuse `adminMath`
      unmodified: it diverges at exactly that row, and that row is the one a
      shared implementation gets wrong by reuse.
   d. **NEXT. Lifecycle authority and fork (7.11, 7.12).** Deactivation is `closed`
      with `closed_reason: abandoned` and reactivation is the `closed` to
      `investigating` transition, both already legal in the check catalog, so
      nothing is added to the state vocabulary. What is missing is the
      authority check: `promote` does not care who moves a project's
      `current_state`, and only owners may. Fork requires `create_projects`,
      requires JOINED participation, copies no participants, and records its
      origin as `derived_from`, which is already in the closed relationship
      vocabulary.

5. **Licenses (1.3, 4.9).** Expertise is declared by the member and confirmed by
   an administrator, and the two are different claims by different people.
   Confirmation GATES NOTHING and must not enter the enforcement path. Moves
   `expertise` off the member row into its own table, because a list column
   cannot carry a confirmation state, a confirmer and a withdrawal per entry.
   Withdrawal supersedes rather than overwrites.

6. **Project name uniqueness (7.1).** The `title` field, unique across the
   instance, case-insensitive and whitespace-collapsed, holding across
   deactivated projects. Enforced in the check catalog and at the write path
   rather than in the interface. Checked against the working instance on
   2026-07-26: 30 bundles, one project, no collisions, so it costs no migration
   there. Recheck before enabling it anywhere else, because a uniqueness
   constraint applied to a record that already violates it fails at the wrong
   moment.

7. **Secure verified export (section 8)**, which is what makes every governance
   rule enforceable, since a group that cannot leave can be held. Note that it
   requires the ROOT OF TRUST credential and not in-app administrator status: an
   export any administrator can run is the most efficient attack in the system.

**Accepts when:** the arithmetic in 4.7 is computed in one place and asserted row
by row; the 7.10 arithmetic is asserted at two owners specifically; no interface
implies the membership model bounds whoever holds ADMIN_TOKEN; a leaked
invitation URL reveals nothing; a capability a member does not hold is absent
from their interface AND refused by the op layer; and no participation op is
reachable only at the Durable Object.

## Notes

- S-10 is the retrieval substrate and S-11 is what USES it: the actions that
  refer to a selection, built one at a time, lightest first.
- Steps S-1 through S-3 are conformance and are not optional. S-4 through S-7 are
  the acquisition tooling the Apps Script accelerator carried. S-8 is the number
  that says whether the design holds. S-9 is the point at which one plane of
  record exists rather than two.
- Every acceptance test above is runnable. If a step cannot be verified by
  running something, the step is wrong, not the test.
