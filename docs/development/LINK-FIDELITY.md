# Link fidelity: the partitions, the cascade, and the connections between captures

DRAFT, not ratified. Written 2026-07-28 at Bob's direction during the 0.36.0
capture-fidelity session, revised the same session after reading the existing
gathering and ratification machinery. Sections marked IMPLEMENTED landed in
0.36.0. Three points Bob has settled are marked RATIFIED where they appear.

## Why this is not a small question about hyperlinks

BIO's method is making and following connections. A connection somebody else
already made and published is the kind the record most wants, because it is a
claim the source itself asserted and it did not come from us. A city page that
links to an ordinance is asserting the ordinance is relevant, and that
assertion is evidence in the same way the page's text is.

So a captured page's outbound links are material. Blanking them destroys
evidence. Leaving them live pointed at today's web silently walks a reader out
of the verified record while everything on screen still looks verified. The
answer is to characterise them.

## The partitions

1. **Inside the bundle**, in two forms that behave differently enough to name
   apart: `anchor` (a `#fragment` inside this very document) and `intra`
   (another file in this bundle whose bytes are captured alongside).
2. **A capture in another bundle**: `linked`.
3. **Not captured**: `offsite`.

Plus `refused`, which is a fourth partition and not a case of the third:
"we will not carry this address" is a different claim from "the record holds
nothing at this address", and collapsing them makes a security refusal look
like a coverage gap.

## The observation that decides the wrapper design

`linked` and `offsite` are not properties of a link. They are properties of the
store at a moment, and the store changes. Page A links to B; on Tuesday B is
uncaptured and the link is `offsite`; on Friday somebody captures B and the same
link is `linked` with not one byte of A changed.

The render companion is content-addressed and immutable. A companion that
hardcoded `offsite` would assert a fact with a shelf life inside an artifact
that can never be corrected, because correcting it means rewriting a hashed
file, which is the move the doctrine forbids everywhere else.

Therefore `anchor` and `intra` are decided at capture and are final; `linked`
and `offsite` collapse into one `deferred` wrapper carrying the address, and
resolve at read time against the store. What was true at capture is still
recorded in the manifest, dated, because "the record held nothing for this
address on this date" is a real fact about the record's coverage, and dated
facts can be superseded without rewriting anything.

## The wrappers

IMPLEMENTED in 0.36.0. Every `<a>` and `<area>` carries `data-bio-link` naming
its partition and `data-bio-href` holding the address the page wrote, as inert
data. The `href` becomes:

| Partition  | Wrapper                        | Final? |
| ---------- | ------------------------------ | ------ |
| `anchor`   | the fragment, unchanged        | yes    |
| `intra`    | `about:capture#<sha256>`       | yes    |
| `deferred` | `about:link#<percent-encoded>` | no     |
| `refused`  | `about:link#refused`           | yes    |

No live `href` survives in a companion. No address is lost.

## Cascade capture PLANTS, it does not fetch

RATIFIED that cascade may run without a member in the loop. That makes the
mechanism question more important, not less, and the mechanism is forced by
three independent constraints that all point the same way.

**A Worker cannot recurse.** Subrequests and wall clock are bounded per
request. Recursive capture inside one `op=acquire` does not degrade gracefully
at the bound; it fails somewhere unpredictable, partway, having written some
captures and not others.

**Acquire is not a writer.** The intake doctrine is explicit that no intake
path writes live state: acquire returns a provenance document and the caller
promotes. Cascade capturing inline would make acquire a writer of bundles it
was never asked about.

**The budget mechanism already exists.** `data/gathering.json` already carries
`daemon.enabled`, `daemon.tick_budget`, and `daemon.sweep_budget`, and C-18.5
already grammar-checks them. A second budget mechanism would give two answers
to "how much may this instance fetch", and the standing lesson is that a probe
which never saw a failure has found the top of its range, not a ceiling.

So: **a cascade decision produces a gathering request with status `open`, not a
fetch.** The existing daemon consumes the queue under the existing budgets.
Everything below follows from that.

### What the ratification fence already buys

C-18.1 refuses sweep-origin intake reaching `verified` without a
member-authored `collected -> verified` transition. Cascade-origin intake must
be subject to the same fence. This is what makes running without a member safe
in the only sense that matters: machine-decided material can ENTER the record,
and cannot become verified evidence without a named member deciding it does.

This is load-bearing and easy to lose to a later simplification. It is the
reason the answer to "may cascade run unattended" is yes.

### Cascade inverts the F5 threat model

C-18.5 bounds the queue's fields because a leaked write token could litter the
queue, and the exporter renders those fields as quoted data so a litterer
cannot steer a member's session. With cascade, the queue is populated from
attacker-influenceable content **by design and by default**: `target.text` will
routinely be link text or a title lifted from a page the group does not
control.

The existing bounds still hold and still do their job. What is missing is
provenance of the STRING. A member reading the queue must be able to tell the
group's own words from an unknown party's, and today every entry looks alike.

### Gathering request fields cascade needs

Additions to the C-18.5 grammar, all optional so existing queues stay valid:

- `origin`: `member` | `sweep` | `cascade`. Absent means `member`.
- `suggested_by`: `{bundle_id, capture_sha256, link_ref}`, the page whose link
  produced this candidate. Without it a cascade entry is unattributable and the
  reverse index cannot be rebuilt from the queue.
- `objective`: `{bundle_id, version}` of the objective object the judgement was
  made against, VERSION PINNED. A cascade decision with no recorded objective is
  not reviewable, and review is the only oversight an unattended cascade gets.
- `decided_by`: the agent and version that made the call, so a decision by a
  weak author can be found and re-run once that is known.
- `generation`: integer cascade depth from a member-planted or sweep root.
- `text_source`: `member` | `verbatim_from_source`. Verbatim text is honest and
  worth keeping, but it must be marked.
- `declined`: the negative decisions, with reasons. A page considered and NOT
  captured is the more important record, because that is what a later session
  revisits.

### The objective is an object, and the decision is a judgement

RATIFIED: a cascade objective is its own stored object with the support that
goes around one. That means a new `object_type` beside information, focus, and
project: frontmatter with a schema, a state machine, gate checks, history,
references, its own document page and list surface, and ratifiability.

The reason a capture happened is recorded at capture time and is historical
fact. A later revision of the objective does NOT modify the bundle: the reason
stays what it was, for the same reason state history is append-only. The
version is recorded because the decision was made against that version, not so
that anything can be re-derived and overwritten later.

**Capturing something and never using it is not a failure.** It is a normal
side-effect of gathering evidence, and the design should not be biased toward
declining in order to keep the store tidy. That lowers the stakes on the
declined set: declines are still worth recording, but capture is cheap and
harmless, so the bias runs toward capturing.

**The decision is a judgement, and judgement is not a mechanism.** Deciding
whether a linked page serves an objective, and whether to cascade again from
it, requires competence that varies between models and drifts between versions.
Every other part of BIO is built so mechanism catches the failures; this is the
one place where quality rests on the judgement itself. Three consequences:

- The deciding agent and its version are recorded on every decision, positive
  and negative. A decision whose author is unnamed cannot be re-evaluated when
  the author turns out to have been weak.
- What the agent SAW is recorded: the objective version, the source page, the
  link, and the surrounding context that informed the call. A decision without
  its inputs can be second-guessed but not re-run.
- Decisions are re-runnable. The declined set matters more here than the
  accepted set, because a better model or a revised objective revisits the
  declines, and if the declines were never recorded there is nothing to revisit
  and the only recovery is re-crawling the web.

The ratification fence is what makes it safe for this judgement to be
unattended: a bad call admits material at collected, attributed and reversible,
and cannot make it verified evidence.

### Re-encounter appends a reason, it is not a no-op

An earlier draft of this document called idempotence a no-op. Wrong, per Bob.
When a second objective leads to a document already in the store, the FETCH is
skipped and the REASON is appended:

```
capture_reasons: [
  { objective, version, agent, decided_at, outcome: "captured" },
  { objective, version, agent, decided_at, outcome: "already_present" }
]
```

Append-only, never rewritten. This is worth more than deduplication hygiene:
two independent objectives wanting the same document is a real signal about
that document's relevance, and discarding the second encounter as a duplicate
throws that signal away. Unlike a link count it is also a signal cascade cannot
inflate by itself, because the objectives are distinct.

### Bounds cascade needs that do not exist yet

Generation increments ACROSS TICKS, never within a request: an acquire that
discovers links plants candidates and stops; a later daemon tick consumes one,
and that consumption is itself an acquire that discovers links and plants more.
That is what makes a generation cap enforceable rather than aspirational,
because each generation is a separate, budgeted, individually observable run.

- A generation cap, so a chain terminates.
- A per-domain cap within a run, so one site cannot consume the whole budget.
- A planting budget per `op=acquire`, distinct from the daemon's consumption
  budget. Planting is cheap and consumption is not; they are different taps.
- Idempotence at the store level: a candidate already queued, captured, or
  declined is not re-fetched, and its new reason is appended as above.

### The self-corroboration hazard

Cascade and link resolution are the same loop seen twice: capturing B because A
linked to it makes A's deferred link resolvable. A site that links to itself
under many addresses can therefore inflate its own apparent corroboration, and
under an unattended cascade nobody is watching it happen.

C-18.3's ring-once rule is the existing defence: identical content is
corroboration on one register entry, never two. **But C-18.3 is scoped to a
single bundle's provenance register.** It compares capture hashes within
`data/provenance.json` and has no view across bundles, which has been fine
until now because nothing in the system systematically captured the same
address into many bundles.

Cascade does exactly that by default. Thirty pages linking to B produce thirty
cascade candidates for B, and absent a store-level check, thirty bundles each
holding a register entry for the same capture hash. C-18.3 fires on none of
them. Every downstream count that treats register entries as independent then
reads thirty corroborations of a thing captured once.

So idempotence is not a tidiness measure, it is the mechanism that keeps the
ring-once rule true once cascade exists, keyed on the normalised address and on
the resulting capture hash, checked before planting and again before promotion.

RESOLVED, against the earlier framing here. The worry was that idempotence
"only holds if every writer honours it", which was pessimism about an open
world that this system does not have. The writer set is closed and known, and
the three-implementation conformance requirement already exists precisely to
keep the reference implementation, the endpoint, and the client promoter in
agreement. Idempotence therefore belongs IN THE CONFORMANCE SUITE, where a
writer that forgets it fails a test, rather than in a rule every writer must
remember. Per the standing lesson, the assertion runs both ways: a writer must
refuse a duplicate AND must not refuse a genuinely new capture, since a check
that only ever says no passes by being useless.

That also settles where the cross-bundle check goes. It is not needed at gate
time, where it would cost a store-wide scan on every run. It belongs in
`op=audit`, which already sweeps the whole store and already probes R2, and
which catches duplication however it arose, including from a writer nobody
anticipated. Conformance prevents; audit detects.

Any corroboration count a surface shows must be over distinct content hashes
and distinct authorities, never over distinct addresses or distinct bundles.

## Links and citations

RULED by Bob, 2026-07-28: source addresses are NOT exempt from the
canonical-identity rule. The address is a **comment string** on the edge, not
the edge.

The reasoning, in his terms: when those two pages were out in the wild, one of
them really did refer to the other. That is the fact. Once both are captured,
the URL was merely the MEANS of that reference, and the means is history. What
matters to the record is that a connection exists between two captured
renditions, and that connection is a citation between two canonical IDs, with
the URL carried alongside as annotation.

This settles the shape cleanly:

- An **unresolved** link is not a citation. It is a pending observation, living
  in `data/links.json` and the `links` table, keyed by address so it can be
  resolved later.
- Resolution promotes it. A **resolved** link becomes a `references[]` entry:
  `rel: links_to`, `target:` the canonical ID, and `address:` the URL as a
  comment field. C-6.1 tests only `target` for locator shape, so an address
  carried as annotation is already admissible under the existing grammar.
- Nothing keyed on an address is ever an edge between objects. The doctrine
  holds as written and needs no amendment.

### Numerous and typed, not deliberate and few

An earlier draft of this document claimed citations must be deliberate and few.
That was invented and is withdrawn. Nothing in the doctrine says it, the system
should support citations being numerous, and the only real cost of a long list
is finding the one you want, which typed selection reduces to manageable. The
type distinction below is therefore the whole answer; the cardinality argument
was redundant and wrong.

### Why it still needs its own relation

Two differences survive, and neither is about count.

**Who asserted it.** Every value in REL_VOCAB today is a member's act. A
captured link is the SOURCE's assertion, which BIO observed. In a system whose
subject is who claimed what, "we say these are connected" and "the City's page
carried an anchor tag" cannot be the same edge.

**What was asserted about version.** A member citing declares which thing they
mean. An observed link declares nothing about version: the page's author did
not say which edition of the target they intended, and often did not think
about it. So an observed link carries a verdict about a claim its author never
made, which is a weaker underlying assertion held to a stricter standard of
proof.

So: `links_to`, source-asserted, alongside `cites`. Member promotion of an
observed `links_to` into a `cites` is a member act recorded as one.

### Chrome: rendering and connection are different problems

The dilemma is real only while the two jobs chrome does are treated as one.

**Rendering chrome costs nothing extra and is already solved.** The nav bar's
markup is in the captured HTML; its styling and images are captured as
subresources. An `<a>` renders identically whether its href points at a live
URL, a placeholder, or nothing at all: what the reader sees is the anchor text
and the styling, never the destination. So a page with all its chrome
targets unresolved looks exactly like the page did. 0.36.0 already does this,
because every chrome link becomes a `deferred` wrapper and the layout is
untouched. **Nothing about capturing chrome TARGETS is needed for the page to
render correctly.**

What is actually being decided is narrower: whether chrome targets become
cascade candidates, and whether they become edges. Both can be answered no
without any cost to fidelity.

**Chrome is a property of the site, not of the page.** A nav link asserts "this
host has a Public Works section". It is not this page asserting a connection
about its own subject. So it should be recorded once per host, not once per
page:

```
site_chrome(host, observed_at, fingerprint, links[])
```

Fifty captures of one site become one chrome record plus fifty references to
its fingerprint, instead of four thousand edges. And the record earns its
place: a site's navigation is itself evidence. A department vanishing from the
nav between two captures is a fact somebody may care about, and today it would
be invisible.

**Misclassification must be recoverable, because detection is heuristic.**
Containment in `<nav>`, `<footer>`, `<header>` plus recurrence across captures
of the same host is a good signal and not a proof. So chrome is a
CLASSIFICATION recorded with its basis and its date, never a deletion, and
always reclassifiable. Nothing is discarded on the strength of a heuristic.

**And chrome is not a hard filter on cascade.** RATIFIED: chrome links are
cascade-considered only when the objective judgement reaches for them. They are
not candidates by default and they are not excluded either. A footer link to
the sewer report, on a page about sewers, is chrome by position and content by
relevance, so the classification is a signal the judgement weighs rather than a
gate that runs ahead of it. A mechanical filter placed before the judgement
would hide material the judgement should have seen, which is the opposite of
what depending on the agent's skill requires.

RATIFIED: `site_chrome` is a DERIVED TABLE, not a stored object type. It is
regenerable by scan and costs nothing to maintain, consistent with the
canonical-identity decision's treatment of the per-group derived index as
regenerable and never authoritative. Navigation change over time becomes
something a query answers rather than something a document page narrates.

Estimated ranges, flagged as estimates that should be MEASURED against real
Oakland captures before the design is fixed:

| | typical | fat tail |
| --- | --- | --- |
| total `<a>` per page | 100-250 | 400+ |
| chrome, repeated site-wide | 60-180 | |
| distinct content links | 5-40 | 50-200 on agenda and index pages |

Content links, not total links, are the mainline, and 5-40 is the range to
design for. The fat tail is real and is exactly the material BIO most wants:
an agenda page linking every item PDF is a hundred content links and all of
them matter.

Chrome detection is mechanical: containment in `<nav>`, `<footer>`, `<header>`,
plus recurrence of the same address across multiple captures of the same host.
It is a classification recorded on the link, never a deletion, because a chrome
link is still something the page carried.

### Where each lives

Observed links live in `data/links.json`, a bundle data file, not in
frontmatter. Frontmatter is human-legible by design and two hundred reference
entries at four lines each is eight hundred lines of YAML ahead of the prose.
A data file travels with the bundle across substrates exactly as frontmatter
does, so portability is preserved and the link graph is not lost on a mirror.

Frontmatter `references[]` carries member-promoted `cites` edges, and resolved
`links_to` edges if Bob's ruling above permits them.

```
links(
  source_bundle, source_capture_sha, link_ref,
  address, address_norm, partition, chrome,
  first_seen,
  resolved_bundle, resolved_capture_sha,
  verdict, verdict_basis, verdict_at
)
-- index on address_norm
```

**Normalisation is where this goes wrong.** Host case, default ports, trailing
slashes, fragments, and query parameter order all decide whether the index
matches or misses, and a miss looks exactly like "not captured". The normalised
form is stored ALONGSIDE the raw address, never instead of it.

### Version rigor is available, not mandatory

OPEN, deliberately. Bob's grounding: journalists check which version they cited
only when it matters, and so do scientists. Where a project reaches legal
action there are discovery, forensics, and supporting-evidence processes for
making time-based determinations, and those are heavyweight enough that
investigations and actions routinely proceed without them.

So the answer is not to make every `references[]` entry version-aware, which
would change the core frontmatter contract, touch every object type and every
existing bundle, and impose a cost on the common case to serve the rare one.

The answer is that the three-valued verdict machinery is INVOCABLE on a
citation when a project needs it, and dormant otherwise. `undetermined` is the
resting state of every connection in the system, member-asserted and
machine-observed alike; establishing contemporaneity is work somebody chooses
to do about a specific connection when the stakes call for it. That makes
rigour available on demand rather than mandatory by default, which is what the
real-world practice Bob describes actually looks like.

The asymmetry noted earlier still stands as a caution rather than a defect: a
machine-observed link gets a verdict because the machinery is already running
over it, while a member citation gets one only when asked. Worth revisiting if
member citations ever start carrying weight the verdict would have caught.

## The three-valued verdict

RATIFIED: `undetermined` is a first-class outcome.

- **contemporaneous**: positively established that the captured B is the version
  A pointed at.
- **superseded**: positively established that it is not. The link is still real
  and still held; it points at a version the record does not have. RATIFIED
  that a superseded link offers the capture the record DOES hold, labelled as a
  different version than the page pointed at.
- **undetermined**: cannot be established either way. The initial state, the
  default, and the expected common case.

Verdicts are dated and appended, never overwritten, for the same reason state
history is append-only: a verdict that changed is itself a fact about the
record.

`Last-Modified` is absent from most dynamic pages, wrong on many others, and
reset by deployments that changed nothing, so the binary comparison the obvious
design reaches for is usually unavailable. A design that treats this as binary
silently sorts every undetermined link into one bucket or the other, and both
errors are bad: calling them sound puts assertions in the record nobody
established, calling them broken discards real connections in bulk.

### What can establish contemporaneity, strongest first

RULED by Bob, 2026-07-30, REORDERED against the earlier draft. Monitoring across
the interval is the PRIMARY route and identical-byte bracketing is an
opportunistic bonus. The earlier order had it the other way round, on the
reasoning that identical bytes settle the question outright and depend on no
timestamp anyone has to trust. Both halves of that are still true. What was wrong
was the assumption that identical bytes are OBTAINABLE for the sources BIO
captures.

Measured 2026-07-30 on `oakland.legistar.com/Calendar.aspx`, two fetches three
seconds apart: same length, 114,177 differing bytes, 31% of the document. Every
one of those bytes lay inside two hidden fields, `__VIEWSTATE` (115,096 bytes) and
`__EVENTVALIDATION` (876 bytes). With those two normalised, the remaining 252,948
bytes, 68.6% of the document, were BYTE-IDENTICAL. Nothing about the calendar had
changed. ASP.NET reserialises its control tree and reissues its anti-forgery list
on every response, so a page like this can never produce two captures with equal
hashes, and the bracket arm can never fire for it however static its content is.
Municipal publishing runs on exactly this class of software.

So the order:

- **Monitoring across the interval with no change detected.** A first-party,
  dated claim the system generated itself, which does not depend on byte identity
  and therefore works on the sources that actually matter here. This makes link
  soundness and source-change monitoring one problem seen from two directions, and
  they share machinery rather than each growing their own. PRIMARY.
- A timestamp token over B's capture hash predating A's retrieval. The existing
  co-attestation machinery, and the only leg an attacker holding a write token
  cannot forge.
- A third-party archive holding B at the relevant date.
- **Two captures of B bracketing A's retrieval whose bytes hash equal.** Settles
  it outright when it happens, and on measured evidence it will happen for static
  assets and almost never for a dynamic municipal page. Opportunistic: take it
  when offered, never build on the expectation of it.
- `Last-Modified` or a stable `ETag`. Recorded, never sufficient alone.

### Volatile regions: classified, and never put to a member

RULED by Bob, 2026-07-30, and it is a ruling about who the system is FOR. The
primary audience is non-technical, and the purpose of the workflow is to remove
members from logistics and nuance so they work at a higher level. Everything in
this section is a technical complication. None of it is a question for a member,
and a surface that asks one has failed rather than been honest.

A capture's identity is the hash of its raw bytes and that never changes; raw
bytes are never rewritten, which is doctrine everywhere else here. But COMPARISON
cannot run on that hash, because it reports change on every fetch of any ASP.NET
page and therefore reports nothing.

So a capture carries a second, DERIVED digest beside its identity: the hash of the
document with known-volatile regions normalised to a placeholder. Identity stays
raw; comparison uses the digest. The families are mechanisms that vary on every
render, and the list is discovered by measurement rather than declared:

- **Server page state.** `__VIEWSTATE`, `__VIEWSTATEGENERATOR`,
  `__EVENTVALIDATION`, `__PREVIOUSPAGE`, scroll position. MEASURED: 100% of the
  difference between two Legistar fetches three seconds apart, 115,980 bytes,
  31.4% of the document, with the other 68.6% byte-identical.
- **Security tokens.** Anti-forgery fields and CSP nonces are per-response BY
  DESIGN; a token that repeated would not be doing its job.
- **Visit identifiers.** A session id names this visit and says nothing about the
  document.
- **Version stamps on design files.** A query string whose only job is defeating
  a cache. Deliberately narrow, because a query parameter is content often enough
  that a broad rule here would hide a real change.
- **Advertising and analytics slots.** Regenerated per impression and belonging
  to a third party, which the standing ruling already says is never the
  publisher's content.

The rules the classifier obeys, and they are what make it safe:

- Normalisation happens on a COPY. A misclassification can never destroy
  evidence and is always reversible, because the record still holds every byte
  the source served.
- What was normalised is RECORDED, with the family, the count and the byte
  volume. A difference that is not a change is still an observation, and a page
  whose page-state suddenly stopped moving would be worth knowing about.
- A volatile region is never treated as evidence and is excluded from comparison
  rather than from the record.
- A family is only added on measurement. A family added carelessly hides a real
  change, which is the one failure mode here that matters, so the test asserts
  both directions: the classifier must call two ASP.NET fetches the same document
  AND must still see a single altered word.

Implemented as `civicos-ui/volatile.mjs`, which the plane should import directly
when monitoring adopts this rather than growing a second copy. The UI carries an
inlined copy because its runtime is one self-contained file, and the build refuses
any difference between the two.

### A re-capture of a document the record already holds is the NORMAL case

RULED by Bob, 2026-07-30. Once monitoring is enabled, the system looks at a
document again on a schedule, and the ordinary outcome of looking is "unchanged",
which means identical bytes and therefore the same content-addressed capture. This
is a regular occurrence and not an exception, and the correct handling follows from
C-18.3's ring-once rule: identical content is corroboration on ONE register entry
and never two.

- A confirmation does not create a bundle, a register entry, or a second
  provenance document. What it creates is an OBSERVATION: `captured_locators`
  advances `last_retrieved` and increments `observations` on the existing row,
  which is precisely the evidence the contemporaneity machinery consumes.
- That is not a small thing. A confirmation is a first-party dated statement that
  the source was still serving these exact bytes at this instant, and a run of
  them across an interval is the primary route above.
- C-18.3 compares hashes WITHIN one bundle's register and cannot see a second
  bundle holding the same capture hash, so nothing prevents the duplicate at write
  time except the writer declining to make it. Conformance prevents, audit
  detects, and the surfaces must not manufacture the thing by default.
- **Duplicate detection must use the stable digest, not the raw hash.** A raw-hash
  check does not fire on re-captures of exactly the pages that get re-captured
  most: proven live, two captures of one Legistar calendar share no hash, so the
  record would grow a second bundle for one document while C-18.3 and `op=audit`
  both stayed silent because the hashes genuinely differ.
- The member is TOLD, in one sentence, that the document is already in the record
  and the source is still publishing the same thing. They are not asked to
  adjudicate it, shown the two hashes, or told which fields differed.

## The work, in order

1. The `links` table and address normalisation, with the raw address preserved.
2. Read-time resolution: a plane op answering, for a deferred address, whether
   the store holds a capture, in which bundle, with the verdict and its basis.
3. `links_to` added to REL_VOCAB; resolved links project into `refs`; verdicts
   appended and dated, never overwritten.
4. Viewer: the partitions rendered distinguishably, the verdict shown, and a
   reader following an undetermined link told they are leaving audited content.
5. Idempotence in the conformance suite, both directions, plus the cross-bundle
   duplicate check in `op=audit`.
6. The objective object type: schema, states, gate checks, surfaces.
7. Cascade planting into the gathering queue, with the new fields, the new
   bounds, version-pinned objectives, and declined decisions recorded.
8. Re-resolution: when B lands, the `links` index drives a re-verdict of every
   link pointing at it, and a member promotion path from observed `links_to` to
   member-asserted `cites`.

Steps 1 through 4 are self-contained and do not depend on cascade. Steps 5 and
6 are cascade's preconditions and are worth having regardless. Step 7 is the
one that changes the threat model, and it must not land before 1 through 6 give
somebody a way to see what it did and undo it.

## Settled in the 2026-07-28 session

RATIFIED: `undetermined` links DO appear as connections in the case-file view,
and a reader who follows one is told they are leaving audited content. Showing
them is what keeps the case file honest about how much of its connective tissue
is unestablished; the warning is what keeps a reader from mistaking an
unestablished connection for a verified one. Hiding them would have been
cleaner and would have quietly overstated what is settled.

This is the same requirement the `deferred` wrapper already enforces
mechanically: no live href in a companion, so no reader leaves the record
without passing through a surface that can say so.

## Later rulings that bear on this document

2026-07-30. Transitive trust is ACCEPTED where disclosed in the provenance chain
with grade and confidence adjusted, which revises the no-transitive-trust rule
and makes the third establishing route below (a third-party archive holding B at
the relevant date) buildable rather than aspirational. A web archive's
`warc/revisit` record is a dated third-party identical-bytes observation across
an interval, which is the PRIMARY route above, produced by somebody else, on
sources where our own bracket arm can never fire. See `ARCHIVE-FALLBACK.md` and
`AUTHORITY-AND-TRUST.md`. Note the `via` requirement in D-96: once observations
arrive from more than one source, the bracket arm must know which is which or it
will report a provenance difference as a change.

## Open questions
- Whether C-18.3 should be widened to a cross-bundle check, or whether
  store-level idempotence at plant and promote time is the whole answer. A
  cross-bundle check is expensive on every gate run; idempotence is cheap but
  only holds if every writer honours it.
- Whether a cascade objective is a first-class stored object or a string on the
  request.
