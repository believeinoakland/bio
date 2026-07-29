# Capture scaling: shared site assets, resumable ticks, and the ceiling

DRAFT, not ratified. Written 2026-07-28 after 0.37.0 measured the real limits
against live pages. Nothing here is built yet; the measurements it rests on are.

## The three problems are one structure

A Worker invocation is refused more than 50 outbound requests on this account.
Measured: a Legistar calendar page discovered 309 subresources and died at
exactly 50. Of the 42 that 0.37.0 does fetch, 29 are stylesheets and 13 are
assets those stylesheets name, and essentially all of them are site-wide chrome
that will be byte-identical on the next page captured from that host.

So the budget is being spent, over and over, on files the record already holds.

The same observation answers Bob's other two questions. Whatever appears
identically across many captures of one host IS the chrome, so the structure
that lets captures share assets is the same structure that detects furniture on
sites that do not use semantic HTML. One table, three jobs.

## What is already shared, and what is not

**Bytes are already shared and always have been.** Captures are
content-addressed: the same stylesheet at the same address yields the same
sha256 and occupies one R2 object no matter how many captures reference it.
Nothing needs building for that.

**Fetches are not shared, and fetches are the scarce thing.** Every capture
re-requests every stylesheet, and each request costs one of the fifty. This is
the entire problem: the expensive resource is being spent to rediscover bytes
already in hand.

## The per-site asset record

A derived table in the Durable Object, regenerable by scan, never authoritative:

```
site_assets(
  host, address_norm, address,
  sha256, content_type, bytes,
  first_seen, last_seen,
  capture_count,        -- how many distinct captures referenced it
  distinct_documents,   -- how many distinct primary captures
  stable_since          -- last time the sha CHANGED, not last time it was seen
)
-- index on (host, address_norm)
```

### Job one: stop re-fetching

When a capture meets an address this host has served before, the stored bytes
are reused instead of fetched, subject to a freshness window.

**This is a provenance statement, not an optimisation, and it has to be recorded
as one.** The manifest entry must say the part was NOT fetched during this
capture and name the capture it came from and when. A reader must never be led
to believe a byte was verified against the source at capture time when it was
not. The honest field is something like:

```
{ "url": "...", "sha256": "...", "reused_from": "<capture sha of the earlier fetch>",
  "reused_fetched_at": "2026-07-28T09:14:02Z", "fetched_this_capture": false }
```

The freshness window is the live question. A stylesheet that has not changed in
three months is not going to change during a capture run; a page's own images
might. A defensible default: reuse only assets whose `stable_since` is older
than the window by a good margin, and only for kinds the document does not
depend on for meaning (stylesheets, fonts, icons, CSS assets), never for images
inside the document. Evidence gets fetched. Furniture gets reused.

### Checking that a reused asset is still the same

RULED by Bob: a reused asset IS allowed in a capture that will be ratified as
evidence. He asked whether a quick byte-count comparison should confirm it is
unchanged, falling back to a fetch if not.

**A HEAD request costs one subrequest, which is the entire scarce resource.**
The ceiling is 50 outbound requests per invocation; it is not bandwidth and it
is not wall clock. So byte-count checking spends exactly what reuse was meant to
save. Blind reuse costs 0. A plain re-fetch costs 1. HEAD-then-maybe-GET costs 1
when unchanged and 2 when changed. It is strictly worse than either thing it
sits between.

`Content-Length` is also a weak equality test even where it is free. A
stylesheet edited to change one hex colour is the same length, so a matching
byte count is a hint that nothing changed and never a demonstration of it.

Three options that do work, in increasing order of strength.

**Conditional GET dominates HEAD on every axis.** `If-None-Match` with the
stored ETag costs the same one subrequest, and a 304 returns almost no bytes
while a 200 returns the new bytes immediately, so the changed case costs one
request rather than two. It buys nothing against the ceiling, but it is the
right shape for the byte and time budgets, and it turns "is it the same" into an
answer from the origin instead of an inference from a length. If a request is
being spent per asset at all, this is what to spend it on.

**Verification at ratification, which is where the claim changes.** Reuse freely
during working capture at zero cost, and when a bundle is promoted to evidence,
re-fetch its reused parts and compare. Ratification is rare and deliberate, so
the budget is available exactly when the stakes rise. This is the natural shape
of Bob's ruling: reuse is permitted in evidence, and the check happens at the
moment it becomes evidence rather than on every working capture that will never
be published.

**Post-hoc detection, which is free.** When a later capture of the same host
does fetch an asset and its sha256 differs from the stored one, every earlier
capture that reused the old bytes is identifiable from `site_assets` and can be
flagged. No extra request is made at any point. This is detection rather than
prevention, and it fits the pattern already chosen for link soundness: a reused
part is unverified-at-reuse until some later fetch confirms or contradicts it,
and that verdict is appended and dated rather than overwritten.

The three compose. Post-hoc detection should exist regardless, because it is
free. Verification at ratification is what makes reuse safe in evidence.
Conditional GET is worth having wherever a request is being spent anyway.

The payoff is large and specific. On the Legistar page, 42 of the 45 fetches are
site-wide chrome. If those come from the site record on the second and later
captures of that host, the whole budget is free for the document's own content,
and the platform ceiling stops binding for every capture after the first.

### Job two: detect chrome without semantic HTML

0.37.0 classifies furniture by `<nav>`/`<footer>`/`<header>`/`<aside>` and ARIA
landmarks. Measured coverage on the sites that matter: 0 on Legistar, 2 on
acgov.org, 8 on Oaklandside. Municipal sites use `<div class="nav">`, so the
mechanism is correct and finds almost nothing.

Recurrence is the signal that works. An address referenced by fifteen of fifteen
captured documents on a host is chrome, whatever markup surrounds it. An address
referenced by one is that document's own.

This turns chrome classification from a per-capture judgement into something the
store derives over time, with two consequences worth stating plainly. It needs
several captures per host before it says anything, so early captures are
classified structurally and RECLASSIFIED later, which is fine because
classification never deletes. And the ratio is a continuous signal, not a
boolean: `distinct_documents / total_documents_for_host` is the number, and a
threshold on it is a tuning decision that should be set from measurement rather
than picked.

### Job three: nav change as evidence

`stable_since` gives this for free. A stylesheet or a navigation asset whose
sha256 changes is a dated fact about the site, and a department vanishing from a
navigation between two captures is the kind of thing an accountability project
exists to notice. Today it is invisible.

## Resumable capture across ticks

A document needing 300 fetches cannot be captured in one invocation on the free
tier and may not be worth one invocation even on the paid tier. So a capture
becomes resumable.

**The primary is always complete in tick one.** The evidence is the primary's
bytes; subresources are support. A capture that got the primary and half the
stylesheets is a real capture with a known gap, not a failure.

**The outstanding work lives in scratch, not in the record.** The intake
doctrine says no intake path writes live state, and that must keep holding: a
capture session is a work list with a TTL in its own table, never bundle state.
Acquire still returns a provenance document and still promotes nothing.

```
op=acquire {locator, subresources:true}
  -> { document, snapshot: {...}, complete: false,
       continuation: {session, outstanding: 264, fetched: 42} }
op=acquire {continue: "<session>"}
  -> ... repeated until complete: true
```

**A partial capture must say it is partial, everywhere.** The manifest carries
`complete: false` and the outstanding count; the viewer says so rather than
rendering a page missing its stylesheets as though that were how it looked. This
is the same rule as U7's refusal: a page missing parts renders as a different
page.

**Who drives the ticks** is the open question. The caller looping is simplest
and keeps the plane stateless-ish. The daemon's existing `tick_budget` already
exists for exactly this shape of work and would let a capture finish unattended.
Both, probably, with the daemon as the backstop for sessions a caller abandoned.

## Sensing the ceiling

Bob asked the plane to sense whether the account has Workers Paid and configure
itself. It cannot ask, and it should not be able to.

`GET /accounts/{id}/workers/account-settings` returns only
`default_usage_model: "standard"`, which reads the same on both plans.
`/subscriptions` requires a token scope the deploy token does not carry. And the
plane at runtime holds no Cloudflare API token at all: it has the instance
tokens, the R2 bindings, and the Durable Object. Giving a Worker an
account-scoped API token so it can look up its own billing plan would hand a
much larger blast radius to the most exposed component in the system, to answer
a question it can determine for itself.

**So the plane calibrates empirically, by probing to failure.** It already has
the signal: a refused subrequest raises a distinguishable error, which 0.37.0
records as `PLATFORM_LIMIT`. Calibration is therefore not new machinery, it is
remembering what already happens:

```
capture_limits(observed_ceiling, observed_at, invocations_sampled, confidence)
```

- On any capture that hits `PLATFORM_LIMIT`, record the count reached. That is
  a hard observation of the ceiling and it is worth more than any API answer.
- Set the working cap a margin below the observed ceiling.
- Re-probe occasionally upward, because a plan can be upgraded and a ceiling
  that only ever ratchets down would leave a paid account running at free-tier
  caps forever.

The standing lesson applies and points the right way here: a probe that never
saw a failure has found the top of its range, not a ceiling. Calibration is the
legitimate form of that, because it probes deliberately TO failure and records
the failure rather than inferring a limit from its absence. A run that completes
without hitting the limit tells us only that the ceiling is at least this high.

## Workers Paid is an optimisation, never a requirement

RULED by Bob: he is willing to put his own account on Workers Paid, and is
cautious about making it a requirement for production instances.

That caution is correct and it is load-bearing for the whole project. BIO
installs into other groups' Cloudflare accounts, and the point of the sovereign
installer is that a community organisation can run its own instance. If capture
requires a paid plan, every group that wants a record has to pay for one, and
"sovereign" quietly means "sovereign if you can expense it". **The free tier is
a supported configuration, not a degraded one.**

Two consequences that change the plan above.

**Resumable sessions move back up the order.** They were placed last on the
reasoning that reuse dissolves the common case, and that holds for repeat
captures of a host. It does not hold for the FIRST capture of any host, or for
an unusually heavy page, and every instance begins with nothing but first
captures. On the free tier, sessions are the only way a heavy first capture ever
completes. They are required for free-tier viability rather than an optimisation
of it.

**Developing on Paid will rot the free-tier path.** If biosmoke7 moves to Paid,
the 50-request ceiling stops being exercised, and the path that every unfunded
community instance depends on becomes the least-tested code in the system. The
mitigation is not discipline, it is a test: the suite must force a low ceiling
regardless of what the account actually allows, so the truncation, session, and
reuse paths are exercised on every run. A capability that only the developer's
account has is a capability the tests must pretend not to have.

The installer should also report the ceiling it detected and say plainly what it
means for capture, so a group setting up an instance knows what they have rather
than discovering it when a page comes back half-captured.

## Order of work

1. `site_assets` table and its maintenance on capture. Costs nothing on its own
   and is the substrate for the other two.
2. Recurrence-based chrome classification reading from it, as a recorded
   classification alongside the structural one, never replacing it.
3. Asset reuse with the freshness window, with `fetched_this_capture: false`
   recorded on every reused part.
4. `capture_limits` calibration from the `PLATFORM_LIMIT` signal already emitted.
5. Resumable sessions. NOT optional: they are what makes the free tier a
   supported configuration, since first captures and heavy pages exceed the
   ceiling no matter how good reuse gets.
6. Post-hoc reuse verification from `site_assets`, which is free, and re-fetch
   of reused parts at ratification, which is where the claim changes.

Reuse still comes before sessions, because it determines how much work sessions
have to do and shrinks them considerably. But it does not remove the need.

## Open questions

- The freshness window, and whether it differs by kind. Stylesheets and images
  inside the document are not the same risk.
- Whether re-fetch at ratification is mandatory or advisory. Mandatory is
  cleaner to reason about; advisory matters if a source has gone dark between
  capture and ratification, which is exactly the case oaklandca.gov is currently
  demonstrating, and where refusing to ratify would destroy the record's value
  at the moment it was most needed.
- The recurrence threshold, which should come from measurement across fifteen
  or more captures per host rather than from a guess.
