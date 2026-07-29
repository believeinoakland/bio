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

## Order of work

1. `site_assets` table and its maintenance on capture. Costs nothing on its own
   and is the substrate for the other two.
2. Recurrence-based chrome classification reading from it, as a recorded
   classification alongside the structural one, never replacing it.
3. Asset reuse with the freshness window, with `fetched_this_capture: false`
   recorded on every reused part.
4. `capture_limits` calibration from the `PLATFORM_LIMIT` signal already emitted.
5. Resumable sessions, once 3 has shown how much of the ceiling problem simply
   disappears. It may be much less urgent afterwards.

Step 5 last on purpose. If reuse frees 42 of 45 fetches on repeat captures of a
host, resumability stops being about the common case and becomes the answer for
first captures and unusually heavy pages only, which is a smaller and easier
thing to build.

## Open questions

- The freshness window, and whether it differs by kind. Stylesheets and images
  inside the document are not the same risk.
- Whether reuse is allowed at all for a capture that will be ratified as
  evidence, or only for working captures. A ratified document whose stylesheet
  was reused from a fetch three days earlier is still honest if it says so, but
  it is a different claim from one fetched whole.
- The recurrence threshold, which should come from measurement across fifteen
  or more captures per host rather than from a guess.
