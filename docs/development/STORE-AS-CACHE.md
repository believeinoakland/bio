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

**The doctrinal hazard to design against from the start:** an objective-driven fetcher
selects what enters the record, and a selection rule is a bias whether or not it is
declared. If an inquiry's objective decides what gets captured, the capture set carries
that objective's shape — which is exactly the declared-bias neighbourhood, and it must be
recorded as such rather than presented as a neutral corpus. This is the strongest reason
to design the capability with the bias construct (DEC-46) rather than after it.

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
5. **Never populate from another instance without a hold-off and a stated residual.**
   Facebook measured *"indefinitely inconsistent"* items from warm-peer population. Any
   BIO import or mirror path inherits this.
6. The element-reference / content-extent work (D-164, D-123, D-161, D-163) is the SWH
   qualifier construct, and the research is independent evidence for solving it once.
   It stays PARKED until Bob reopens it; this document only records the corroboration.

## The one-line version, for a reader who reads nothing else

**Cloudflare's Always Online already made this exact substitution and documented the
reason: when the origin is gone it serves from the Internet Archive rather than from its
own cache, *because the Internet Archive archives rather than caches*.** That is the whole
finding. Bob's framing is right about the read path and must not be allowed to reach the
retention policy.
