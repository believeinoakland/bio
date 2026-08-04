# Capturing client-rendered content

DRAFT, not ratified. Written 2026-07-29 after 0.42.0 found that
oaklandca.opengov.com serves a shell with zero anchors in its HTML, so a capture
of it holds almost nothing.

## The ruling this proceeds from

RULED by Bob: **the JS-supported rendered content is THE content**, not the raw
sources that are the inputs of that rendering. It must be captured, handled, and
treated as evidence. He also named the caveat himself: a rendering completed in
the context of the captured rendition may not be faithful to the content
rendered on the site at the time of capture.

That caveat is not a footnote. It is the whole design problem, and everything
below follows from taking it seriously rather than from doubting the ruling.

## What is broken today, measured

`oaklandca.opengov.com` returns 200 with a real HTML document that contains
almost no content: no article text, no anchors, no links. The content arrives by
JavaScript after load. BIO captures the shell perfectly, hashes it honestly,
grades it B, and holds a document that says nothing. Every capability built this
week operates on it correctly and produces nothing: no links to partition, no
citations to resolve, no evidentiary images to keep.

This is not a rare shape. Modern government transparency portals are routinely
built this way, and the ones that are not yet will be.

## The grade: RULED, and the argument is Bob's

RULED by Bob: **a captured rendering that ran at the time the document was
captured takes the SAME grade as the rest of the document.**

His argument, which is correct and which I had backwards: the HTML/CSS rendering
is performed LATER, in the rendition's environment, by whatever viewer a reader
happens to open it in. The JS-driven rendering was performed WHILE the document
was being captured, in the original site's own execution environment. So the
rendered content is temporally and environmentally CLOSER to the source than the
thing this system already puts in front of readers, and it has at least as much
fidelity as text that survives an HTML/CSS rendering.

I had reached for a lower grade on the strength of non-reproducibility: nobody,
including us, can re-derive the rendered bytes by hash. That property is real,
but it is a property of the METHOD and belongs in `capture.method`, not in the
grade. The grade describes the strength of the chain from source to record, and
that chain is the same: fetched first-party, executed first-party, hashed at
receipt. Downgrading it would have said the record trusts the render less than
it trusts the reading experience it already ships, which is not true.

What follows from non-reproducibility instead is narrower and already settled:
re-fetch at ratification cannot mean hash equality here, and Bob's earlier
ruling already generalises correctly, since mandatory means the attempt and its
outcome are recorded rather than that ratification requires a matching answer. A
re-render that differs is `changed`, and that is a valid ratification saying
something true.

## Why the rendered DOM still needs its own method and environment recorded

Same grade does not mean same method. A rendered DOM is bytes produced by
executing the source's code in an environment we chose, and three properties
follow that have to be recorded rather than papered over.

**It is not reproducible by hash.** Two renders of the same shell will differ:
timestamps, A/B assignments, lazy-loaded ordering, advertising, personalisation,
race conditions between scripts. The three-implementation conformance
requirement therefore cannot mean byte agreement for this path.

**It is a joint product of the source and us.** The environment is part of the
evidence: engine and version, viewport, device pixel ratio, locale and timezone,
the wait condition that decided rendering was "done", how long it took, and
which requests were allowed to complete. A rendered capture whose environment is
not recorded cannot be assessed by anyone later, and cannot be meaningfully
re-run.

**It runs adversary-chosen code.** Executing a captured page's JavaScript is a
categorically different act from fetching its bytes, and it is the largest new
attack surface this project would take on. That argues strongly for Cloudflare's
Browser Rendering rather than anything hand-rolled: the isolation is somebody
else's specialty and their bug surface, not ours.

## Therefore: a pair, not a replacement

A client-rendered capture produces TWO artifacts, and both are kept.

1. **The served shell.** Grade B, exactly as today: the bytes the source sent,
   hashed at receipt, reproducible, and the only part of this that anyone can
   independently verify against the source.
2. **The rendered document.** A new grade, and a new method string naming the
   render. It is evidence per Bob's ruling, and it is evidence of a different
   kind: what the page presented to a reader, as produced by a named renderer at
   a named moment.

The rendered document is NOT a `rendition` in the 0.36.0 sense. A rendition is
derived mechanically and losslessly from bytes we hold, and anyone can
regenerate it. A rendered document cannot be regenerated: re-running the
renderer produces a different artifact. It is a capture in its own right,
carrying the document's grade, with the render recorded as its method.

## What must be recorded on a rendered capture

- `render.engine`, `render.engine_version`
- `render.viewport`, `render.dpr`, `render.locale`, `render.timezone`
- `render.wait`: the condition that ended the render (network idle, a selector,
  a timeout) and which one actually fired
- `render.elapsed_ms`
- `render.requests`: how many subresource requests the page made, how many
  completed, how many were blocked, and by what rule
- `render.third_party_executed`: whether scripts from other origins ran, and
  from where. **This is the one most likely to be regretted if omitted.** An
  advertising or analytics script running during capture puts a third party's
  content into the record, dated and hashed, looking exactly like the source's
  own material.

### RULED: third-party output is attributed to the third party

Bob's ruling puts the question the right way round. It is not whether
third-party script output should be ALLOWED, it is whether it will ever be
evidence. If it will, then it is evidence PRODUCED BY THAT THIRD PARTY and must
be recorded as such, not as the hosting site's.

That is a harder requirement than it looks, and it is a precondition rather than
a follow-on. `capture.authority` holds exactly one value. A rendered document
carrying an advertiser's, an analytics vendor's, or a CDN-hosted widget's output
has more than one author, and the register cannot currently say so. Attribution
has to be per-origin and sub-document, which is a granularity the record has
never held: `references[]` targets a bundle and nothing finer, which is the same
wall D-53 is blocked against.

Recorded as D-55. **SUPERSEDED 2026-07-30 by Bob's authority rulings; see
`AUTHORITY-AND-TRUST.md`.** Two things changed. The renderer is immaterial and
authority follows the DATA rather than the code, which means a viewer origin
rendering the host's payload is a tool and not an author, and an earlier proposal
here to block third-party origins is withdrawn: it would have destroyed exactly
the GIS, CAD and hosted-document captures this project needs. And authority is
now three-valued, so a rendered capture whose authorship cannot be determined
mechanically is recorded as `authority_state: undetermined` with a followup task,
which is a TRUTHFUL record at document granularity and needs no per-origin
attribution to be honest. That decouples D-55 from D-53's granularity wall.
Rendered capture is unblocked. What survives of D-55 is the narrower case where a
third party's script output is itself the evidence, which still needs per-origin
sub-document attribution. An authority-undetermined capture may be held and may
not be PUBLISHED.
- `render.of`: the sha256 of the served shell, so the pair is inseparable

> **SUPERSEDED IN ITS PREMISE 2026-08-04 (DEC-42): Workers Paid IS now a
> requirement**, so the collision this section resolves no longer exists in either
> direction. The section is kept because its MEASUREMENTS are still correct and its
> Free-vs-Paid table below is the evidence DEC-42 rests on — in particular the CPU
> line (10 ms → 30 s), which is what unblocks a tesseract OCR fleet member. Read the
> free-tier figures as history: they describe a configuration no supported instance
> runs under, and the installer now refuses it (D-54, D-185).

## There is no collision: rendering is available on the free tier

An earlier version of this document said Browser Rendering is paid-only and that
this collided with the ruling that **Workers Paid is an optimisation, never a
requirement**. That was wrong, and the correction matters because a requirement
was nearly written into the installer on the strength of it.

Checked against Cloudflare's own limits and pricing documentation on 2026-07-29:
Workers Free accounts get **10 minutes of Browser Run usage per day**, returning
429 until the next UTC day beyond that. Workers Paid includes **10 hours of
browser usage per month with 10 concurrent browsers** at no additional charge,
then $0.09 per browser hour and $2.00 per concurrent browser.

So a free-tier instance CAN capture client-rendered sources. It can do perhaps a
few dozen renders a day rather than hundreds, which is a real difference in
throughput and no difference at all in capability. The sovereignty ruling
survives untouched: Paid remains an optimisation.

The member-driven render path is still worth building, but for a different
reason than the one first given here. It costs no browser time at all, and it is
the same mechanism a source refusing the plane already forces, which
oaklandca.gov is currently demonstrating. One path, two problems.

## What Workers Paid actually buys, for this project

Recorded because the decision was nearly made on a wrong premise, and because
the installer has to be able to explain it (D-54).

| | Free | Paid |
| --- | --- | --- |
| External subrequests per invocation | 50 | 10,000, settable to 10,000,000 |
| Cloudflare-service subrequests (R2, DO) | 1,000 | not separately capped |
| CPU time per invocation | 10 ms | 30 s default, 5 min maximum |
| Requests | 100,000/day | no daily cap |
| Browser Run | 10 min/day | 10 hr/month, 10 concurrent |
| Cron Triggers per account | 5 | 250 |
| Worker size | 3 MB | 10 MB |

The subrequest line is the one that matters most and it resolves an accounting
puzzle from 0.38.0. The free ceiling is FIFTY EXTERNAL subrequests plus a
separate thousand for Cloudflare services, which is why the calibration measured
51 while the code had only counted 42 fetches: R2 and Durable Object calls were
never competing with the page's own subresources. The calibration is measuring
the external limit precisely, which is the right thing to measure.

The CPU line is the underexamined one, recorded as D-56. Capture hashes every
subresource with SHA-256 in the Worker and serialises manifests of hundreds of
entries. Cloudflare reports the average Worker uses about 2.2 ms; ours does real
work and nobody has looked. Unlike the subrequest limit, a CPU overrun has no
distinguishable error to calibrate against.

Costs beyond the $5 monthly minimum: 10 million requests and 30 million CPU-ms
are included, then $0.30 per additional million requests and $0.02 per additional
million CPU-ms. R2 is billed separately from the Workers plan and has its own
free allowance, which matters here because captures live in R2 and a growing
record is a growing R2 bill rather than a growing Workers bill. Workers Paid is
also independent of the zone plan: it is not unlocked by Cloudflare Pro and does
not require it.

## What this changes in what is already built

- **The document boundary works BETTER on rendered output.** Region detection
  found almost nothing on legacy municipal sites because they use
  `<div class="nav">`. Client-rendered applications emit semantic HTML far more
  often, so `<nav>`, `<main>`, and ARIA landmarks are likelier to be present.
- **Link partitioning finally has links to partition.** The shell has none.
- **Subresource capture applies to the rendered document's references**, not the
  shell's, which changes what the fetch policy sees entirely.
- **Reuse and the site asset record are unaffected**, since they key on address.

## Open questions for ratification

- The grade and method vocabulary for a rendered capture, which should be
  settled before any code writes it into a record.
- Whether third-party script execution during capture is permitted at all,
  blocked by default, or recorded and allowed. Blocking changes what renders;
  allowing puts an unknown party's content in the record.
- Whether the rendered document or the served shell is the primary of the
  bundle, and therefore which one `snapshots/` holds and which the manifest
  describes.
- Whether an unattended sweep may capture a client-rendered source at all, given
  that the cheap render path needs a member present.
