# The archive fallback: what a web archive can and cannot attest

Written 2026-07-30. Design, not built. Consumes the rulings in
`AUTHORITY-AND-TRUST.md`, particularly that transitive trust is accepted with
disclosure and grade adjustment.

**Archive.org is a BACKUP source, never a primary one.** We capture from the
publisher directly. The fallback fires only when a source has been unreachable
for a sustained period, per the threshold in `AUTHORITY-AND-TRUST.md`.

## What the Wayback Machine actually establishes

Every capture is indexed in a CDX record carrying the SURT-normalised URL, a
14-digit timestamp, the original URL, MIME type, HTTP status code, a content
digest and the length. The digest is a base32-encoded SHA-1. Appending `id_` to
the replay URL returns the raw archived bytes without the Wayback overlay or link
rewriting. Underneath it is WARC (ISO 28500), which records what the crawler saw
byte by byte along with headers and context.

So an archived capture can carry the original URL, the exact datetime, the status
the source returned, and a digest.

**MEASURED 2026-07-31 through the plane's own egress (D-105 closed).** Every
field above is confirmed present and shaped as claimed, and the `id_` suffix
returns raw bytes as described. Three corrections, each recorded in full in
`MEASUREMENTS.md` and each load-bearing:

1. **`length` is the compressed WARC record size, NOT the body length.** A row
   declaring 6255 was fetched at 32,564 bytes. Never use it as a fixity or size
   check on what we received.
2. **A shared digest can mean an EMPTY body.** `3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ`
   is base32(SHA-1(empty)), and it appeared twice in a five-row sample, on two
   301s. Digest equality is therefore NOT sufficient evidence that a document was
   unchanged, which constrains the revisit reading below: it holds only for a
   real 200 with a non-empty body. Exclude the empty digest explicitly.
3. **Most rows are not 200.** Three of five sampled rows were usable; two were
   empty redirects. A fallback that takes the most recent row without filtering
   on `statuscode == 200` and a non-empty digest will record a redirect as the
   document.

`output=json` returns an array of arrays with a header row, not objects.

The Memento headers (`Memento-Datetime`, `Link` with `rel="original"` and a
timemap) are ALREADY on the replay response, and `x-archive-src` names the source
WARC. So the "build to Memento" ruling below is also the lower-effort path, not
only the principled one.

### And what it does not

**Nothing is signed.** There is no cryptographic attestation over a Wayback
capture, no timestamp token, and the WARCs behind public crawls are not generally
retrievable. What you get is a named party's dated, machine-readable, internally
consistent claim. You are trusting the Archive's operational integrity, not
verifying it. The honest term is **delegated attestation**.

**Their digest is not a fixity check on what we received.** The CDX digest is
computed on the response body AS STORED, so it will not match bytes transferred
to us under a different compression. Record it as their claim about their
holding. Our own SHA-256 over the bytes we received is what the record is keyed
on. SHA-1 is also broken for collision resistance and must never be sufficient
alone.

### The part that is better than expected

Wayback tracks duplicates by digest, and a repeat capture of unchanged content is
stored as a `warc/revisit` record referencing the earlier one.

**A revisit record is a dated, third-party, identical-bytes observation across an
interval** — subject to the measured constraint above: only where the status is a
real 200 and the digest is not the empty-body digest. That is exactly the PRIMARY
contemporaneity route in
`LINK-FIDELITY.md`, the one reordered to the top on 2026-07-30 because monitoring
works on sources where byte identity does not. The Archive has been running that
monitoring for years on documents an instance may not be able to fetch at all.

## Shape on the capture

Following the renderer rule one layer up: follow the data, not the carrier.

- `capture.authority` is the **Internet Archive**, because the Archive is who
  served us these bytes, and saying otherwise would be false about our own fetch.
- The document's attributed publisher is reached by **delegation**, recorded in
  `provenance_chain`: attestor, what they assert, the CDX evidence (urlkey,
  timestamp, digest, status, MIME), the raw locator we fetched, and a flag that
  the attestation is not cryptographic.
- **We sign our own receipt.** We cannot make their claim cryptographic; that is
  theirs to do and they do not. We can attest with the release key that on this
  date we fetched these bytes from this locator and they hashed to this value.
  That is the leg an attacker holding a write token cannot forge.

## Same document, two sources

Identity is canonical and the address is a comment, so a capture from the
publisher and a capture via an archive are versions of ONE document.

A capture needs two locators where it has one today:

- the **document address**, which for an archive capture is the CDX `original`
  field run through our own normaliser
- the **retrieval locator**, the `.../id_/...` URL we actually fetched

Key `captured_locators` on the document address and the archive capture lands on
the same row as a direct capture, so `observations` accumulates across sources.
Two captures of one address with equal bytes from two independent servers is
stronger evidence than two from one server. See the `via` column requirement in
`AUTHORITY-AND-TRUST.md`; without it this becomes a defect rather than a feature.

## Build to Memento, not to Wayback

Memento (RFC 7089) is the standard interface for time-based retrieval across web
archives. An instance that speaks it can use any compliant archive. Building to
Wayback's API specifically makes the record hostage to one organisation, which is
the opposite of the sovereignty ruling, and it concentrates load on one
institution.

## WARC as interchange, not as store

BIO does the same job as these archives with home-grown structures and speaks
none of their languages: content-addressed captures under SHA-256, a provenance
document, `captured_locators`, our own `normalizeAddress` rather than SURT, no
Memento interface.

**Adopt WARC and Memento as INTERCHANGE. The internal store stays as it is**,
because content-addressed R2 plus the Durable Object is what makes the gates, the
audit sweep and the append-only model work. WARC in, WARC out.

This cuts both ways and the second direction is the important one. A BIO instance
that exports WARC can be verified, mirrored and outlived by tooling that already
exists. A bundle format only we read cannot.

Where BIO differs from a general archive: the Archive is a general-purpose
witness capturing broadly with no thesis; BIO is a case-builder capturing
narrowly against an objective. That asymmetry is why BIO can consume their
witness function and why it should consume their protocols rather than duplicate
their mission.

## Rate limits: THIRD-PARTY FIGURES, not ours

Recorded with their source and date because they are somebody else's
infrastructure, undocumented, and moving. This is exactly the category
`MEASUREMENTS.md` exists to stop us treating as constants.

**STILL UNVERIFIED, and deliberately so.** The 2026-07-31 measurement confirmed
the record shape but did NOT test these ceilings, because establishing them means
provoking a 429 and the documented consequence of mishandling one is an hour-long
firewall block on Cloudflare's SHARED egress, falling on unrelated people. Their
capacity is discovered by ordinary polite use being refused, exactly as D-95
discovers it, never by probing for the wall.

- CDX is limited to an average of **60 requests per minute** (IA staff to a
  researcher, via the wayback-researchers channel). Over that returns 429. **If
  429s are ignored for more than a minute the IP is blocked at the firewall for
  one hour, and subsequent 429s double that each time.**
- The maintained `wayback` Python client **reduced its default to 24 per minute**
  to match the hard limits now enforced, which is more recent and stricter.
- Community consensus is roughly 1 request per second for CDX, slower for full
  page fetches.
- Limits tightened in late 2024 following the October 2024 breach. Before that
  there was effectively no cap.
- **There is no paid throughput tier.** The API-key mechanism in the cdx-server
  codebase grants access to restricted URLs and fields in a deployment; it is a
  permissions feature, not a rate class. The S3-like keys govern archive.org item
  uploads, a different service.

**Our appetite is 24 per minute, set conservatively, and it is OURS.** Their
capacity is discovered by being refused and recorded, exactly as the subrequest
ceiling is. See D-95.

### The scaling problem a per-instance governor cannot solve

A Worker's outbound fetches leave from Cloudflare's shared egress. Our governor
governs our instance. It cannot make neighbours polite and cannot stop us being
blocked for their behaviour.

Worse at scale: sovereignty means many instances, each obeying its own governor,
all invisible to each other, arriving as one undifferentiated stream from a major
provider. A hundred instances at 24 a minute is 2,400 a minute that IA cannot
attribute. A block aimed at that hits a great many unrelated people.

Three mitigations, all already in flight: the instance name in the user-agent so a
third party can throttle one operator; the member-driven capture path, which
distributes across member addresses; and telling IA before it arrives.

### Why volume is mostly not the constraint

**Cadence is the binding variable, not corpus size.** Ten thousand documents
checked daily is seven requests a minute. The same ten thousand checked hourly is
167 a minute, over any limit we know of. A global cadence also spends nearly its
whole budget re-reading things that never change: a 2010 ordinance does not move,
a Legistar calendar does.

So the answer to scale is **per-document cadence derived from observed
volatility**. A document whose stable digest has not moved across ten checks
earns a longer interval. That makes monitoring sublinear in corpus size and pays
the stable digest back a third time, after change detection and duplicate
detection.

And: **a CDX record is an immutable historical fact.** What the Archive held for
a URL at a timestamp does not change. CDX responses are recorded as dated
observations on first retrieval and never re-fetched to answer a question the
record already answers.

## Outreach: drafted, NOT sent

Two versions were drafted for `info@archive.org` on 2026-07-30 and deliberately
held. The premise of the outreach was that we need a fallback because sources
refuse us. The 2026-07-30 measurement showed the refusal was our own user-agent,
so the premise was wrong, and one draft asserted that a public body is blocking
archival crawlers when the situation is more specific than that. Revisit once the
allowlist question with the City is settled.

Note for whoever picks this up: the Apps Script captures of 2026-07-19 each carry
a `save-page-now` attestation attempt and **every one failed**, four with HTTP 302
and one with 520. Save Page Now was already part of the strategy and was already
not working.
