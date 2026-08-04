# The store as a read-through cache — research, and what it changes

Research, 2026-08-04 (session BOB), at Bob's direction. His framing:

> *"An instance's data store should be viewed (and used) as a read-through cache of
> documents and content. The full set of information that's ultimately available for
> analysis is what's ready in the data store together with any additional content that
> can be identified and added to the data store that directly or indirectly relate to
> the objective of an inquiry."*

**Nothing here is built.** Every external claim is attributed and dated; every claim
about BIO was measured against the source on 2026-08-04 and is cited to a file and line.

## The finding that should govern the whole reframing

The survey of archival and content-addressed stores produced one sentence that decides
the question:

> **Systems built as ARCHIVES record absence; systems built as CACHES treat absence as a
> transient failure to be retried.**

Software Heritage, WARC and Memento record absence as data. Git, IPFS and the Nix store
do not — for them a miss is a retry, not a fact. **So "cache" is the correct model for
how content ENTERS the store and the wrong model for what the store IS.** Adopt it
wholesale and the record silently loses the one property the product exists for: the
ability to say what was there, and what was not, at a stated moment.

The recommended framing, and everything below follows from it:

**READ-THROUGH ACQUISITION OVER A WRITE-ONCE ARCHIVE.** Cache-shaped entry; archival
exit; absence recorded rather than retried away.

## BIO already has most of a cache, under other names

Measured 2026-08-04. This is why the reframing is cheap: it is largely a RENAMING that
makes existing mechanisms legible as one system rather than eight.

| BIO mechanism | Where | The caching concept it already is |
| --- | --- | --- |
| `deferred` link partition | I2; `subresources.mjs:660` `LINK_TYPES` | **the frontier / a recorded MISS** — a URL known to exist, not fetched |
| `refused` partition | same | **policy-excluded key** |
| `intra` partition | same | **HIT**, content-addressed by `sha256` |
| `undetermined` partition | I2 | a lookup that could not be resolved, CARRIED with a stated `why` |
| `capture_sha` / register | I1 §1 | **content-addressed store**; identity is the bytes |
| subresource reuse + freshness window | `CAPTURE-SCALING.md` | **TTL-style reuse**, with a better rule than a TTL: *"Evidence gets fetched. Furniture gets reused."* |
| re-fetch at ratification (CAP-4) | `CAPTURE-SCALING.md` item 6 | **validate-on-commit**; records confirmed / changed / unavailable |
| `op=monitor`, monitoring contracts | M1, D-65 | **origin change detection**, cadence from observed volatility |
| archive fallback, two-hop chain | `ARCHIVE-FALLBACK.md` | **fallback origin** when the primary is dark |
| governor / per-host appetite | D-103 | **origin protection**, polite fetch rate |
| `rendition` vs `evidentiary` digests | I1 §4c (FW-4) | **semantic validation** — "would this look the same" vs "has the substance changed" |
| D-129 somevalue vs novalue | DEBT D-129 | **negative caching**, and its own words are the retry policy: *"One is worth retrying; the other never will be"* |

## What the research says works — three properties, and BIO has one and a half

The systems that resolve the cache/archive tension cleanly do the same three things.

### 1. Two-layer identity: intrinsic bytes id + a separate OBSERVATION record

Content-addressing proves integrity and never provenance. Git's own hash-transition
document concedes the authority claim collapses if the hash function does; Nix requires
signatures for every non-content-addressed path for exactly that reason.

**Software Heritage is the cleanest execution and is worth copying.** A mandatory core
identifier (`swh:1:cnt:<sha1>`) plus optional QUALIFIERS carrying the discovery context:
`origin=`, `visit=`, `anchor=`, `path=`, `lines=`. Their own rationale: intrinsic ids
need no register and anyone can verify them; extrinsic ids need a register and *"if it is
corrupted, or gets lost, all the system falls into pieces"* — so you need both.

**BIO HAS THIS.** `capture_sha` is the intrinsic id; the provenance chain and the acquire
frontmatter are the extrinsic record; D-112's rule (a hop a component can hand us is one
it can invent) is the same lesson learned independently.

**What BIO does NOT have is the QUALIFIER form on a citation** — the ability for a
citation to carry *which observation* and *which region* alongside the bytes id. That is
D-164's content-extent primitive and D-123's element reference, unbuilt and PARKED.
**The research says these are the same construct SWH shipped as qualifiers, and that
building them separately is the error.** D-164 already says so; this is independent
corroboration from a system that made the choice.

### 2. A ZERO-PAYLOAD PROVENANCE RECORD — the primitive BIO is missing

**WARC's `revisit` record is the key finding of this survey.** Two profiles:
`identical-payload-digest` (the strong digest matches a prior capture) and
`server-not-modified` (the server asserted 304). The record stores an empty or truncated
block but retains `WARC-Refers-To`, `WARC-Refers-To-Target-URI` and
`WARC-Refers-To-Date`. The spec's stated goal is *"reduced storage redundancy … while
still recording that a revisit occurred."*

**This is exactly the primitive a read-through model needs, and BIO half-has it.** BIO
records `reused_from` / `reused_fetched_at` on a reused subresource, and CAP-4 records a
re-fetch outcome at ratification. What BIO lacks is the general form: **an observation
that produced no new bytes is still an OBSERVATION and belongs in the record at ~zero
cost.** Under a cache model this stops being a nicety — every cache HIT that was
validated is evidence about the source's stability, and discarding it is discarding the
volatility data M1's cadence design depends on.

The named hazard, from the same spec's practice: at the index layer a revisit shows
`statuscode: -`, so consumers must resolve back to the original capture. And if
`WARC-Refers-To-Target-URI` is omitted, dedup silently loses **which URL the bytes came
from**. BIO's two-bucket content addressing has the identical exposure.

### 3. ABSENCE AS DATA — and BIO's version has fewer states than it needs

**Software Heritage stores crawl outcomes explicitly**: `OriginVisitStatus.status` is one
of `created`, `not_found`, `ongoing`, `failed`, `partial`, `full`. *"We went to this
origin at time T and it wasn't there"* is stored data, never an inference from missing
rows.

**Memento (RFC 7089) goes further: an archived 404 is itself a citable Memento.** The RFC
MANDATES that a replayed 4XX/5XX carry the same status code, and WARC stores it as an
ordinary response record. CDX indexes it in `statuscode` beside the 200s.

**BIO's D-129 identifies the same split and stops at two values** — *we do not know*
versus *there is positively none*. The research shows the useful set is larger, and
**`partial` is the state BIO most obviously lacks**: *we got some of it*. That is
precisely the case CPDF-5 measured for PDFs (Tier 1 partial at ~88%) and the case an
over-envelope document lands in. Recorded below as a widening of D-129 rather than a new
row, since it is the same defect seen with better resolution.

## The acquisition side: what the caching literature says, and the one exact precedent

### Cloudflare already made this substitution, and documented why

**Always Online does not serve from Cloudflare's own cache when an origin is unreachable
— it serves from the Internet Archive**, and the documented reason is precisely the
distinction this file is built on: *"The Internet Archive does not consider your origin
server's cache-control header"* — **because the Internet Archive archives rather than
caches content.**

Two details make it the closest precedent available. It fires only on origin-unreachable
conditions (520–527), **not** on a 404 or 500 from a live origin — so it distinguishes
*the origin is gone* from *the origin answered negatively*. **BIO's archive fallback
already draws that exact line**, gating on a source going dark rather than on an error
response. The design was right and now has a production precedent behind it.

Scale of the problem, peer-reviewed: Klein et al., *Scholarly Context Not Found: One in
Five Articles Suffers from Reference Rot* (PLOS ONE 9(12), 2014) — over 1M references
across 3.5M articles; one in five STM articles affected, seven in ten among those citing
the web. **They separate LINK ROT (the URI stops resolving) from CONTENT DRIFT (the URI
resolves and the content changed)** — two different states, and BIO needs both.

### DNS is the only system that fully separates the four states — and its authority rule is BIO's doctrine

RFC 2308 grades negative answers by confidence and gives each a different retention rule:

| State | DNS form | Retention rule |
| --- | --- | --- |
| the name does not exist | NXDOMAIN | SOA-derived; *"one to three hours… work well"*, over a day *"problematic"* |
| exists, but not this record | NODATA | same |
| **we asked and could not tell** | SERVFAIL | **MUST NOT cache longer than 5 minutes** |
| the server was unreachable | dead server | **MUST NOT be deemed dead longer than 5 minutes** |

**And §5 is the sentence that matters most for this project: *"Negative responses without
SOA records SHOULD NOT be cached."*** The SOA is the proof of AUTHORITY that turns a
negative answer into a FINDING rather than an absence of finding. An absence with no
authority attached **is not recordable at all**.

That is BIO's own doctrine arrived at independently by a standards body in 1998: *an
equality that costs nothing to produce is not evidence*, and *undetermined must be
STATED*. A "we looked and found nothing" that cannot say WHO said so is exactly the
costs-nothing outcome the record already refuses.

HTTP encodes the same confidence split more weakly: **410 is *we looked, it is
deliberately gone*; 404 is *we looked, it is not here, and we do not know why*; 5xx is
*we could not tell*; and no cache entry at all is *we have not looked*** — for which HTTP
has no wire representation, which is exactly the conflation BIO must avoid.

**So the state model is FOUR, not two:** `NEVER_LOOKED` · `LOOKED_ABSENT` ·
`LOOKED_INDETERMINATE` · `PRESENT`. D-129 has two; SWH's crawl statuses add `partial`;
this adds the retention grading and the authority rule.

**Graded retention, following RFC 2308 and CloudFront:** definitive absence may be held
for hours; ambiguous absence for minutes; **an indeterminate result must never inherit a
definitive lifetime.** CloudFront's error-caching floor is 10 s; Google Cloud CDN
publishes 120 s for 404/410/451 and 60 s for 405/501.

### HTTP deliberately gave up the field BIO needs, so BIO must invent it

RFC 9111 §5.5 **obsoleted the `Warning` header**, including `110 Response is stale`, *"as
it is not widely generated or surfaced to users."* And §5.1: *"lack of an Age header
field does not imply the origin was contacted."*

**So there is no standard way to say "this is what I hold, I last verified it on this
date, and I have not been able to reach the source since."** That is precisely what an
evidence record must say. Memento's `Memento-Datetime` is the closest published
semantic — *"constitutes a promise that the resource state reflected in the response will
no longer change"* — and it is an assertion about a past observation rather than a
permission to assume currency. BIO's `capture_sha` plus its provenance chain already make
that promise; what is missing is the LAST-VERIFIED half.

### Content addressing removes the invalidation obligation, NOT the capacity obligation

A tempting inference to avoid, and the research names the counter-example. Bazel's Remote
Execution API addresses every blob by digest **and still says *"The lifetime of entries in
the CAS is implementation specific"***, with `FindMissingBlobs` existing so clients can
detect evicted blobs and re-upload; the common server does plain LRU. Permanently valid
key, still-evictable storage.

**No source anywhere states that content addressing makes eviction optional.** Systems
that refuse to evict replace eviction with **reachability** (Nix GC roots, git refs) or
**explicit intent** (IPFS pins, S3 Object Lock legal holds) — never with infinite storage.
And the anti-pattern to refuse by name: nginx's `inactive` evicts cached data *"regardless
of their freshness"* after ten minutes without access. An archive must never inherit that
from a caching proxy.

**LOCKSS is the model to point at** (Maniatis et al., SOSP '03, best paper): *"a large
number of independent, low-cost, persistent web caches that cooperate to detect and repair
damage to their content by voting in opinion polls"* — **a cache in mechanism, an archive
in policy**, with an explicitly multi-decade adversary model. That phrase is the whole
recommendation of this document in five words.

### Bounding the objective-driven fetcher — and the gate it must pass

The focused-crawling literature gives BIO a measurable go/no-go rather than an opinion.
Chakrabarti et al. (WWW8, 1999) report **harvest rates of 30–40%** and state the test
plainly: *"This harvest ratio must be high, otherwise the focused crawler would spend a
lot of time merely eliminating irrelevant pages, and it may be better to use an ordinary
crawler instead."* Cho, Garcia-Molina & Page (WWW7, 1998) define the driving query
directly: *"A query Q drives the crawling process."*

**Diminishing returns are steep and measured.** Chrome caps speculative prefetch at
50 (eager) / 2 (conservative, FIFO) and says outright that *"over-speculation has a clear
cost to users."* Google Search's own deployment: prefetching the top two results improved
LCP by 67 ms; extending past the top two returned **7–9× less** and was not enabled on
mobile at all.

**Noria (OSDI '18) is the closest architectural analogue** — a declared query creates and
incrementally maintains its own materialisation, and operators lacking state issue an
**upquery** upstream to derive exactly the missing records. That is read-through driven by
a declaration rather than by traffic, which is what Bob is describing.

**And the warming hazard, measured at Facebook:** warming a cold cache from a *warm peer*
rather than the origin produced items that could stay *"indefinitely inconsistent"*, fixed
only by a two-second hold-off that the authors describe candidly as probabilistic. Any
BIO path that populates from another instance rather than the source inherits this, and
must state the residual rather than claim it away.

### Two rules from the security literature that apply to addressing

- **"Avoid ever rewriting the cache key. Instead, rewrite the actual request"** (Kettle,
  *Web Cache Entanglement*, 2020) — key-derivation is where cache bugs live. Web Cache
  Deception (USENIX Security 2020, 340 vulnerable sites in the Alexa top 5K) is a
  key-derivation bug, not a content bug: the cache and the origin disagree about what a
  URL means.
- **A poisoned negative answer propagates further than a poisoned positive one.** RFC 8020
  lets one NXDOMAIN prove an entire subtree absent, and gates that inference on DNSSEC
  validation for exactly this reason. If BIO ever generalises an absence ("nothing exists
  under this path"), the generalisation needs the same authority gate.

## Four findings that bear on things BIO has already built

These came out of the survey and are not part of the cache question, but they are about
mechanisms that ship today and each one is cheap to act on now.

1. **REPLAY IS NOT PRESERVATION — a composite capture may depict a moment that never
   existed.** Ainsworth, Nelson & Van de Sompel measured that embedded resources in an
   archived page can carry datetimes *"up to several years in the future or past"*
   relative to the page, and the follow-up is titled *"Only One Out of Five Archived Web
   Pages Existed as Presented."* **BIO's subresource reuse creates this exact hazard**:
   a capture whose stylesheets and images were reused from earlier fetches is a composite
   with a temporal SPREAD, and nothing in the record states that spread. CAP-4's
   re-fetch at ratification narrows it and does not measure it. **New debt row.**
2. **Integrity of stored bytes is not integrity of what the reader sees.** Lerner, Kohno
   & Roesner (ACM CCS 2017) demonstrated four attacks that alter a reader's view of an
   archived page from the present, without compromising the archive — *"attackers do not
   need to compromise the archives in order to compromise users' views."* BIO renders
   captured HTML. **New debt row.**
3. **Memento fidelity is explicitly NOT byte-exact.** RFC 7089 states plainly that a
   Memento's entity-body *"may very well not be byte-to-byte the same"* as what the
   original served, because of format migration, URI rewriting and archive branding.
   **BIO's archive fallback fetches from Wayback and grades it C.** The grade is
   defensible; what is missing is that the record should say the archived body is a
   REPLAY and not a byte-exact copy of what the source served. **Folds into the
   fallback's provenance wording.**
4. **Retroactive access control can un-archive the past.** The Internet Archive stopped
   honouring `robots.txt` for archived material after observing that a parked domain's
   new owner could erase a site's history. Relevant to any dependence on a third-party
   archive as a fallback origin.

## What the platform permits — Cloudflare, all VENDOR CLAIMS, retrieved 2026-08-04

- **A Durable Object's SQLite is capped at 10 GB per object** (Paid; 1 GB Free). **This
  ceiling is recorded nowhere in this repository** — D-36 covers workerd's SQL statement
  limits and M6 names R2 growth, but not this. Under a cache model the store grows by
  design, so this becomes a first-class planning number and a sharding decision. **New
  debt row.**
- **R2 has no object versioning** (`PutBucketVersioning` unimplemented); version must be
  encoded into the key. **BIO already does this** via content addressing — the archival
  discipline turns out to also be the only workable shape on this platform.
- **The binding constraint on fan-out fetching is 6 simultaneous open connections**,
  identical on Free and Paid and not configurable — NOT the subrequest cap, which Paid
  raises to 1,000 and beyond. Objective-driven acquisition is therefore throughput-bound
  at ~6 concurrent origin round-trips per invocation and must fan out across invocations
  (Queues, Workflows).
- **R2 egress is $0, so the cost driver is CLASS A operations (writes).** A read-through
  that writes on every miss is the thing to model, not bytes.
- **Cloudflare's own Cache Reserve is read-through-into-R2, productized**, and R2's
  internals are a Worker gateway + a **Durable Object metadata service** + an object
  store — BIO's exact topology. Existence proof; Cache Reserve's parameters (10 h minimum
  TTL, 30-day sliding retention, 1 Class A + 1 Class B per miss) are a sanity benchmark.
- **There is no vendor guidance for a DO as a read-through cache.** Unpaved road.
- Two different Workers caches now exist with OPPOSITE `stale-while-revalidate`
  behaviour; neither is durable. R2 is the durable tier and the caches are optimisation
  only.
- **Queues are at-least-once**, so the fetch-and-store step must be idempotent. Content
  addressing makes it naturally so.

## Where the metaphor must NOT be imported, stated as rules

1. **NOTHING IS EVICTED.** A cache evicts because the origin is authoritative. BIO's
   premise is that the source may change or vanish. Eviction would break every basis leg
   resting on a capture, and a citation must resolve to the exact bytes cited. The
   research's own version of this: *"pinning is not persistence"*, and the archives that
   survive treat retention as policy rather than as a cache property.
2. **A HIT IS NOT A REVALIDATION.** Serving from the store proves nothing about the
   source now. Re-fetching and getting identical bytes is *an equality that costs nothing
   to produce* and is not evidence — the standing rule, and the same conclusion git and
   Nix reached about hashes not being trust anchors.
3. **FRESHNESS IS NOT THE PROPERTY BEING MAINTAINED.** PROVENANCE is. `Memento-Datetime`
   is the archival OBSERVATION time, not the content's modification time, and the RFC
   makes the promise that a Memento's state *"will no longer change"*. That is the
   contract BIO already makes with `capture_sha`.
4. **A MISS IS A FACT, NOT A FAILURE.** Recording it is the difference between an archive
   and a cache (the governing finding above).

## The genuinely new capability: acquisition driven by an OBJECTIVE

The second half of Bob's framing has no analogue in BIO today and is the real work:
content *"identified and added … that directly or indirectly relate to the objective of
an inquiry."*

What exists: `objective` is already required data (C-2.9 on a project bundle); the
frontier already exists as `deferred` links; "indirectly relates" is the entity axis
(M4); the governor already paces fetching; the DO alarm already runs periodic work with
a consumer registry.

What does not exist: anything that turns an objective into a FETCH PLAN, and any record
of *"we sought X across the corpus and did not find it"* at corpus scope — D-129 is only
the per-document analogue. The research's nearest pattern is a crawler frontier with
priority, and the constraint is the 6-connection ceiling above.

**The doctrinal hazard to design against from the start — CORRECTED 2026-08-04, and the
correction matters because the first version of this paragraph named the wrong construct.**

This document first said an objective-shaped capture set *"is a bias whether or not it is
declared"* and belonged with the declared-bias construct. **Bob challenged it and he is
right; it is withdrawn.** Two measurements settle it:

- **The search is symmetric BY CONSTRUCTION, not by good intention.** `role` is
  `'supports' | 'cuts_against'` in the schema (`schema.mjs:1186`), a disconfirming leg is
  an ordinary ROW, and the reachability rule in `store.mjs:4038` explicitly includes
  *"every `cuts_against` leg"*. So an objective does not bias the search toward
  confirmation — the model has a first-class place for evidence against, and refuses to
  let it be orphaned.
- **BIO's declared bias is a CLOSED SET OF THREE statement kinds** —
  **scrutiny** (how much checking a source's claims need before they bear load),
  **inference** (which inference patterns are licensed or blocked), and **pattern** (an
  evidenced empirical claim about an institution's behaviour). **Every one of them is
  about how you REASON over what you hold. None is about what you LOOKED AT.** An
  objective-shaped corpus is therefore not a bias statement in this system's vocabulary,
  and filing it there would have stretched a precise construct into a vague one.

**THE REAL HAZARD IS COMPLETENESS, AND IT IS SHARPER THAN THE ONE I NAMED.** An
objective-driven fetcher looks *about* its objective. Everything outside that frame is
never fetched — so it sits permanently in `NEVER_LOOKED`, and the danger is that CORPUS
SILENCE GETS READ AS EVIDENCE OF ABSENCE. *"The record holds nothing on Y"* is a fact
about our frame, not a fact about Y, and a member deciding whether Y matters cannot tell
the two apart unless the record does.

That is this project's own rule one layer out: **an outcome that costs nothing to produce
is not evidence.** A corpus assembled in pursuit of X produces silence about Y for free.

And it lands in a construct that ALREADY EXISTS and already has the right properties: the
**completeness statement** — authored per edition, never prefilled, byte-checked across
editions by C-21.1, and travelling with the published case. What it gains under
objective-driven acquisition is one thing: the completeness statement must be able to say
**what the corpus was ASSEMBLED FOR**, so a reader can tell the frame's edge from the
world's edge. The four-state model (above) is the machine-readable half of the same fact.

**One narrow residual that IS a bias question**, recorded so it is not lost in the
correction: if "indirectly relates" is computed from graded connections, and a grade may
be a HUNCH (DEC-15's temporary declared bias), then a fetch plan can inherit a hunch —
the corpus would then be shaped by an ungrounded grade. That is a real link to the bias
construct, it is narrow, and it is a reason to keep hunch-derived relatedness visible in
whatever builds the plan. It is not a reason to file the whole capability under bias.

### THE FRONTIER HAS TWO SOURCES, AND THE SECOND IS THE VALUABLE ONE

Bob, 2026-08-04, and it corrects an assumption running through everything above:

> *"A reporter faces the same hazard — that corpus silence gets read as evidence of
> absence. That's why tips and shoe leather are so valuable. The humans who use BIO are
> doing the same thing — at the same time they're using AI, search engines, and other
> digital tools to fill in missing evidence, whether supporting or cutting against."*

Every frontier this document has described is DERIVED — `deferred` links found inside
documents, entity connections, adjacency computed from what is already held. **A derived
frontier can only ever reach what the corpus already points at, so it inherits the
corpus's blind spots exactly.** That is the machine analogue of a reporter who only reads
clippings.

**So the frontier has two sources and they are not equivalent:**

- **DERIVED** — links, entities, computed adjacency. Cheap, unbounded, and blind in the
  same directions the corpus is.
- **AUTHORED** — a member's lead. A tip, a thing they know exists, a document they saw in
  a courtroom, a contract they have reason to think was signed. **This is the only channel
  that can reach outside the corpus's existing shape**, and it is the one a reporter would
  say does the real work.

**AND AN AUTHORED LEAD IS WHAT MAKES AN ABSENCE EVIDENTIARY — this is the sharpest
consequence and it closes a loop opened earlier in this document.** RFC 2308's rule is
that a negative answer with no proof of authority attached is not recordable at all: the
SOA is what makes *"it does not exist"* a finding rather than a shrug. **A member's
authored lead is exactly that authority.** *"We went looking for the contract this tip
described, across these sources, on this date, and there is none"* is a `LOOKED_ABSENT`
with a named author standing behind why we looked — which is a finding. The same query
with no lead behind it is silence that cost nothing to produce.

So the four-state model and the member-lead channel are the same mechanism seen from two
ends, and neither is worth much without the other.

**Two gaps this names, neither of which the record can express today:**

1. **A member's LEAD has no home.** The frontier is `deferred` links — URLs discovered
   inside documents. A tip is not a URL: it is *a thing that should exist, sought*. Sibling
   to D-184 (a member's firsthand OBSERVATION has no home as a basis leg); the same member
   knowledge is unrepresentable both before the search and after it.
2. **A search that came back empty is not recorded at all.** Only fetches that succeeded
   leave a trace. The most evidentiary outcome of shoe leather — *we looked hard, here, and
   it is not there* — is the one the record currently drops.

### "INDIRECT" MEANS CONTEXT SUGGESTING WHERE ELSE TO LOOK — so the fetch plan is a PROPOSAL

Bob, clarifying: *"When I refer to indirect content I'm mainly thinking about how context
around an objective can indicate other related areas to explore."*

This is NOT primarily a graph walk over existing edges. It is an inference from an
objective's context to ADJACENT AREAS worth examining — the kind of reasoning that is
AI-assisted by nature, and which Bob names AI, search engines and other digital tools as
serving alongside the human.

**Which settles the shape: a fetch plan is a PROPOSAL, not an acquisition.** It lands on
constructs that already exist and already carry the right rules:

- **P · PROPOSAL** — *a derived finding awaiting an authored act*, whose charter is D-90:
  **derived things inform and authored acts bind.**
- **D-82** — an assistant-surfaced item must LOOK derived. A suggested area to explore is
  exactly that, and must never be indistinguishable from a member's own lead.
- **`surfaced_by`** already distinguishes `agent` from `human` at the surfacing act, so the
  record can already say which channel produced a frontier entry — the field exists and
  the frontier does not yet use it.

So the capability is: context proposes, the member disposes, and the record keeps which
was which. A machine that fetches on its own inference is the version to refuse, and not
because it would be wasteful — because the corpus would then be shaped by an unauthored
judgment, and nobody could later say whose.

## What to do, in order

1. **Adopt the framing as READ-THROUGH ACQUISITION OVER A WRITE-ONCE ARCHIVE**, with the
   four non-import rules above written as doctrine. Costs nothing; prevents the expensive
   misreading. LOCKSS's shape is the one-line statement of it: **a cache in mechanism, an
   archive in policy.**
2. **Widen D-129 to FOUR STATES with GRADED RETENTION, and adopt the authority rule.**
   `NEVER_LOOKED` · `LOOKED_ABSENT` · `LOOKED_INDETERMINATE` · `PRESENT`, plus SWH's
   `partial`. Definitive absence may be held for hours, ambiguous for minutes, and **an
   indeterminate result must never inherit a definitive lifetime**. And RFC 2308 §5's
   rule, which is BIO's own doctrine in another vocabulary: **an absence with no authority
   attached is not recordable** — it is the costs-nothing outcome the record already
   refuses.
3. **Add the zero-payload OBSERVATION record** (WARC `revisit` shape), generalising the
   `reused_from` and CAP-4 outcomes into one construct that always keeps the
   back-reference to the original capture and its date. **And add the LAST-VERIFIED
   half**, because HTTP obsoleted the header that would have carried it: the record must
   be able to say *held since T1, last verified T2, source unreachable since T3*.
4. **Measure before designing the objective-driven fetcher**, and the literature supplies
   the gate rather than an opinion: **the harvest rate**. Below roughly 30–40% relevant
   fetches, a focused crawler is worse than an ordinary one, by its authors' own test.
   Measure alongside it: corpus size, the DO storage curve against the 10 GB ceiling, and
   cost per miss in Class A writes. **Cap the speculative queue from the first version** —
   every system that ships goal-driven warming caps it, and Google Search's own numbers
   show a 7–9× drop-off past the highest-confidence candidates.
5. **The objective-driven corpus is a COMPLETENESS obligation, not a bias one** (see the
   correction above). The completeness statement must be able to say what the corpus was
   ASSEMBLED FOR, so a reader can tell the frame's edge from the world's edge; the
   four-state model is the machine-readable half of the same fact.
6. **Never populate from another instance without a hold-off and a stated residual.**
   Facebook measured *"indefinitely inconsistent"* items from warm-peer population. Any
   BIO import or mirror path inherits this.
7. The element-reference / content-extent work (D-164, D-123, D-161, D-163) is the SWH
   qualifier construct, and the research is independent evidence for solving it once.
   It stays PARKED until Bob reopens it; this document only records the corroboration.

## THE MODEL, consolidated — six layers, and which of them exist

Asked directly by Bob 2026-08-04: *"Do we have a model and architecture that we can build
upon?"* **The model is settled and coherent. The architecture is one decomposition away,
and this section is the part that was missing.**

| Layer | What it is | State today |
| --- | --- | --- |
| **L0 · SOURCES** | the civic web, and the member's own knowledge (tips, shoe leather) | outside the system, by definition |
| **L1 · ACQUISITION** | read-through entry: fetch, governor, archive fallback | **EXISTS** — `op=acquire`, the per-host governor, the two-hop archive chain |
| **L2 · THE RECORD** | write-once, content-addressed bytes + provenance | **EXISTS** — register, `capture_sha`, R2, the provenance chain |
| **L3 · OBSERVATIONS** | every LOOK, including the ones that returned nothing new | **MISSING** — the zero-payload record (WARC `revisit` shape) and the empty-search record |
| **L4 · THE FRONTIER** | what is known-or-believed-to-exist and not held, with its state | **HALF EXISTS** — `deferred` links are the derived half; the AUTHORED half (leads) is absent (D-194) |
| **L5 · PLANNING** | objective + context → proposed areas to explore | **MISSING** — and it is a PROPOSAL surface, never an actor |
| **L6 · ANALYSIS** | inquiries, findings, basis, publication | **EXISTS ENTIRE** — this is what the rest serves |

### The one architectural decision the whole thing rests on

**THE RECORD AND THE OBSERVATION LOG ARE SEPARATE, WITH DIFFERENT LIFECYCLES.**

- **L2, the record**, is write-once and content-addressed. A capture is bytes plus the
  provenance of how they arrived. It never evicts, never updates, and a citation resolves
  to it forever.
- **L3, the observation log**, is append-only EVENTS ABOUT LOOKING: we fetched and it was
  unchanged; we fetched and it had changed; we looked and it was gone; we looked and could
  not tell; we searched for a thing a member named and found nothing.

**Keeping them separate is what makes absence recordable without polluting the record.**
Fold L3 into L2 and every failed look becomes either a phantom capture or nothing at all —
which is exactly the dead end this document opened with (*archives record absence; caches
retry it away*). It is also what lets a HIT be cheap: an observation that produced no new
bytes costs one L3 row and zero L2 bytes, which is the WARC `revisit` economy.

**And L3 plus L4 are the same table seen from two angles.** A frontier entry IS a thing
sought together with its current state (`NEVER_LOOKED` · `LOOKED_ABSENT` ·
`LOOKED_INDETERMINATE` · `PRESENT`) and the observation that last set it. The four-state
model is not a separate feature; it is the frontier's state column.

### What each new piece must carry, so a build session is not inventing shapes

- **An OBSERVATION** — what was sought, when, by which actor class, the outcome state, the
  authority behind the look (the lead, or the document the link came from), and a
  back-reference to the capture if one resulted. The back-reference is load-bearing: WARC's
  practice shows that omitting it silently loses which URL the bytes came from.
- **A FRONTIER ENTRY** — the thing sought (a URL, or a DESCRIPTION when a member's lead
  names something with no address yet), its source (derived-from-document, or
  authored-by-member), `surfaced_by` (`agent` / `human`, the field already exists), and its
  state.
- **A PLAN PROPOSAL** — derived, LOOKING derived (D-82), awaiting an authored act (D-90),
  and never itself an acquisition.
- **THE LAST-VERIFIED FIELD** on a capture — held since T1, last verified T2, source
  unreachable since T3. HTTP obsoleted the header that would have carried this; it must be
  ours.

### What must be MEASURED before any of it is built

1. **The harvest rate**, on a real objective against Oakland's corpus. The
   focused-crawling authors' own gate: below roughly 30–40% relevant, a focused crawler is
   worse than an ordinary one. This decides whether L5 is worth building at all.
2. **The DO storage curve per captured document**, against the 10 GB per-object ceiling
   (D-190). Decides when the record must shard, and that is cheaper to know before L1 grows
   by design.
3. **Cost per miss in R2 Class A writes**, since egress is free and writes are the driver.

### The order to build in

L3 first (it is small, it makes absence recordable, and every other layer writes to it),
then L4's authored half (D-194, designed WITH D-184 since both are member knowledge the
record cannot hold), then measure, then L5 only if the harvest rate clears its gate.
**L2 changes not at all**, which is the strongest evidence the framing is right: a
reframing that required rewriting the record would have been the wrong reframing.

## The one-line version, for a reader who reads nothing else

**Cloudflare's Always Online already made this exact substitution and documented the
reason: when the origin is gone it serves from the Internet Archive rather than from its
own cache, *because the Internet Archive archives rather than caches*.** That is the whole
finding. Bob's framing is right about the read path and must not be allowed to reach the
retention policy.
