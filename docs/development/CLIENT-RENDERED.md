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

## Why the rendered DOM cannot simply be graded B

Grade B currently means: the bytes as the source served them, hashed at receipt.
A rendered DOM is not that. It is bytes our renderer produced by executing the
source's code in an environment we chose. Three properties follow, and each has
to be recorded rather than papered over.

**It is not reproducible by hash.** Two renders of the same shell will differ:
timestamps, A/B assignments, lazy-loaded ordering, advertising, personalisation,
race conditions between scripts. This breaks two things already built. The
three-implementation conformance requirement cannot mean byte agreement for this
path. And re-fetch at ratification cannot mean hash equality, though Bob's
ruling already generalises correctly here: mandatory means the attempt and its
outcome are recorded, not that ratification requires a matching answer. A
re-render that differs is `changed`, and that is a valid ratification saying
something true.

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
renderer produces a different artifact. That is why it needs a grade rather
than a transform note.

Naming matters here and should be settled before it is built. `grade: B` is
taken and means something stronger. A rendered capture is closer to a
photograph of a screen than to a copy of a file, and the honest reading is that
it is first-party observation of a third-party presentation.

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
- `render.of`: the sha256 of the served shell, so the pair is inseparable

## The blocking tension: this needs Workers Paid

Cloudflare Browser Rendering is not on the free tier. Bob has already ruled that
**Workers Paid is an optimisation, never a requirement**, because BIO installs
into other groups' Cloudflare accounts and sovereign must not mean sovereign if
you can expense it.

Those two rulings collide, and the collision is real rather than resolvable by
cleverness. Client-rendered sources are increasingly common; capturing them
needs a browser; a browser needs the paid tier. So one of these has to give, and
the honest options are:

- **Rendered capture is a paid-tier capability, declared as such.** A free-tier
  instance captures the shell, records honestly that the content is
  client-rendered and was not captured, and says so on the document page. The
  record remains truthful; it is just thinner. This keeps the free tier
  supported and admits it is not equal.
- **A member-driven render path.** The member's own browser has already rendered
  the page. A browser-side capture that serialises the live DOM and uploads it
  needs no paid tier at all, and the grade honestly reflects that the capture
  chain ran through a member's machine. This is the same shape as the
  human-driven path for sources that refuse the plane, which oaklandca.gov
  already forces, so it may be one mechanism rather than two.
- **Render off-platform.** A separate service. New vendor, new secret, new
  failure mode, and the isolation argument above gets weaker.

The second option is the interesting one, because it costs nothing, works
everywhere, and solves a problem the project already has for a different reason.
Its weakness is that it depends on a member being present, which rules out
unattended sweeps of client-rendered sources.

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
