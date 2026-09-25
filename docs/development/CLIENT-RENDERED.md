# Capturing client-rendered content

**Status** · DRAFT, not ratified (its own words), written 2026-07-29 after 0.42.0 found that `oaklandca.opengov.com` serves a shell holding almost nothing. **PARTIAL since 2026-09-24 (D-64, IC-252; `node tools/status.mjs 2.rendered`): the RECORD is built and the RENDERER is not.** op=acquire's `render: true` files one capture holding the pair — the rendered document primary (method `rendered`, the ordinary grade), the shell beside it under its own digest, `render.of`, the `render.*` fields of §What must be recorded, `render.data` and item 3's authority rule, WHICH WAIT FIRED and the completeness that follows (D-499, IC-275: `render.wait.fired` keeps the renderer's own word and `render.wait.fired_class` is the plane's three-valued reading of it, and a render whose wait did not meet the condition asked records `completeness: undetermined` and reads *render may be incomplete (wait timed out)* in the record and in the provenance assertion, with its GRADE and its method intact and never refused), seven named refusals (C-83) and a daily render allowance that defers by name and RESERVES each render's maximum cost at admission (D-492: `render_allowance.reserved_ms`, the asked navigation timeout plus the asked wait timeout, so `spent_ms + reserved_ms <= allowance` holds however many renders are in flight; an unreported render stays charged for the day) — driven in `bio-plane/test/rendered-capture.test.mjs` through an injected `RENDERER` seam. **The unattended ASK landed 2026-09-24 (D-491, IC-276): `capture_requests.render` carries it, the drain asks op=acquire through the row, and a render that cannot happen is held as a named C-83 deferral with nothing fetched and nothing filed. Its SUCCESS through the drain is driven since D-522 (2026-09-24), against a stub renderer.** **D-490 (2026-09-24, IC-277) BUILT THE IN-PLANE DRIVER**: `rendererFor` answers a working renderer for a `BROWSER` binding through `bio-plane/src/browserrender.mjs`, a CDP client over the binding's own two endpoints (`POST /v1/devtools/browser`, then a websocket upgrade on `/v1/devtools/browser/<session>`), read out of `@cloudflare/puppeteer@1.4.0`'s own source and driven in `bio-plane/test/browser-render.test.mjs` against a fake that speaks it. The package itself is NOT vendored and cannot be: the battery runs `src/` RAW under miniflare, which refuses a bare npm specifier at worker construction (`ERR_MODULE_RULE`, measured). **DIST-11 (2026-09-24) DECLARED the binding** in `bio-plane/wrangler.jsonc` and taught the deploy derivation and newgroup the class, so a plane holds it from its NEXT release. **WHAT IS STILL NOT BUILT IS A LIVE RENDER**: no deployed instance holds the binding yet, **NO LIVE RENDER HAS EVER RUN**, and nothing here is evidence that Cloudflare's service behaves as its client says (CONDUCT #20 joined D-490 and DIST-11 at c20-batch25). The paragraph below is the Status as it stood before D-64, kept: it was [DESIGNED-not-built], and not buildable until its four open questions for ratification are settled. Measured against `bio-plane/src` at plane 0.58.0 (grepped 2026-09-14): nothing renders anything — no Browser Rendering binding, no `render.*` fields, no rendered capture, no grade or method vocabulary for one. The only built part is DETECTION: `docprofile`'s `client_rendered` recogniser, which goes first in the registry and carries a member-facing warning that what was collected is the frame and not the figures. D-64 is open and no longer blocked on D-55: D-55 CLOSED on 2026-09-21 when its surviving case, a third party's output as evidence in its own right, was DESIGNED at document grain (§What must be recorded, "DESIGNED 2026-09-21"). That design is [DESIGNED-not-built], and its one fence is D-440 — BUILT 2026-09-23 (C-45.11: an image `{part}` on a capture that is not an office container is refused by name; `EXTRACTION-BREADTH-DESIGN.md` §3.2 states it). Two of its sections are superseded in place and say so in the body: D-55 by `AUTHORITY-AND-TRUST.md`'s three-valued ruling, and the free-tier premise by DEC-42. **A third RULED section, 2026-09-24 (BOB #32, folded by BOB #33): a render whose wait timed out keeps its grade, and its completeness reads UNDETERMINED (D-64, D-499).** **A fourth, 2026-09-24 (BOB #33, 21:05Z, folded by D-529): every subresource a render loaded carries a SHA-256 over bytes the plane kept, or reads undetermined with its reason — BUILT by D-529 against the injected renderer and the fake binding, and like the rest NOT YET SEEN AGAINST A LIVE BROWSER.** **A fifth, 2026-09-25 (BOB #34, D-567, BUILT): a monitoring tick on a rendered capture compares the served shell with the pair's `shell.sha256` and states the content UNDETERMINED on every tick.** as of 2026-09-25.

**Place in the system** · A level-2 design serving construct 2, **intake, capture and provenance**, whose level-1 home is `BIO_Intake_Doctrine_v1_1.md` (`BIO_System_Design.md` §3 names it there). It is the one capture design whose subject the plane cannot do at all, and the gap it names is a coverage gap rather than a refinement: modern government transparency portals are routinely shells. It is downstream of `AUTHORITY-AND-TRUST.md`, which unblocked it in doctrine, and of DEC-42, which removed its free-tier premise; D-191 bears on it directly, because a rendered capture offered as evidence of what a page LOOKED like is the composite whose temporal spread the record does not state.

**Incomplete sections** ·
- §Therefore: a pair, not a replacement / §What must be recorded on a rendered capture — **BUILT at the record, 2026-09-24 (D-64)**: the pair, every listed `render.*` field, `render.data`, `third_party_executed` (and `scripts_executed`, BOB #31), `render.of` and item 3's authority rule exist in op=acquire's document (IC-252). **THE DRIVER BUILT 2026-09-24 (D-490, IC-277):** an in-plane CDP client over a `BROWSER` binding (`src/browserrender.mjs`) produces the `render.*` facts this section lists — engine and version from the browser, the emulated environment as accepted, which wait condition fired, the request ledger by outcome with the browser's own `blockedReason`, and the executed script set from `Debugger.scriptParsed` or `undetermined` when the domain will not enable; the binding is DECLARED since DIST-11 and live only from the next release, so NO LIVE RENDER EXISTS. **NOT BUILT:** the per-origin attribution of regions (item 1's deferral, unchanged). **DESIGN GAP (D-490) CLOSED 2026-09-24 — RULED by BOB #33 (21:05Z) and BUILT by D-529.** It read: *this section does not say whether a per-subresource DIGEST is owed on a rendered capture — the driver reports none, because hashing a subresource body means asking the browser for it and would put the renderer's copy of the bytes in the record beside the plane's.* The ruling is now this document's own section, [RULED 2026-09-24 by BOB #33](#ruled-2026-09-24-by-bob-33-a-digest-for-every-subresource-a-render-loaded-d-490s-gap-d-529): a digest IS owed, and reads undetermined where the bytes were not kept. BUILT: `render.subresources[]`, one entry per load, its `sha256` the PLANE'S hash of bytes it kept beside the capture or `undetermined` with a `digest_reason`; the driver asks the browser for each body (`Network.getResponseBody`) and hashes none itself; a digest a renderer only reported is `renderer_sha256`, its claim. **THE UNATTENDED CALLER IS BUILT AS FAR AS THE ASK, 2026-09-24 (D-491, IC-276):** `capture_requests` carries a `render` column, the door reads `render: true` (and refuses any other non-absent value by name, C-28.16), the flag rides the ROW so op=acquire reads it through `capturerequestdraining` rather than from the drain's body, and a render this instance cannot do is HELD under the C-83 code the plane gave with nothing fetched and nothing filed — item 3's *"the tick records the render as DEFERRED (undetermined). It never records the shell as though it were the content."* An unattended render that SUCCEEDS is DRIVEN since 2026-09-24 (D-522, `bio-plane/test/d522-unattended-render.test.mjs`): the daemon's drain completes a run's `render: true` request as the rendered pair within the daily allowance, the row and the run's log carry the RENDERED digest, and the next render the day cannot pay for is deferred by name — through a stub renderer, so no unattended render has run LIVE. **NOT BUILT, and item 3 permits it without designing it:** a MONITORING tick that renders. CAP-3's two consumers write no capture request (only a run's `op=capturerequest` does), and op=monitor re-fetches the served document, so no sweep sets the flag on its own account and a monitored bundle whose baseline is rendered is compared against a fresh SHELL (read at the code, not driven; D-567, routed to BOB). What `render.requests`/`render.data`/the script set say is the RENDERER'S claim; the plane hashes the rendered document and, since D-529, each subresource body the renderer handed over and the plane kept — WHETHER THE BROWSER'S BYTES ARE WHAT THE ORIGIN SERVED is still the renderer's claim, stated per entry by `body_as` (`bytes` exact, `decoded_text` the browser's decoding re-encoded as UTF-8). **DESIGN GAP (D-64) CLOSED 2026-09-24 — RULED by BOB #32 and BUILT by D-499 (IC-275).** It read: *`render.wait` is recorded as `{asked, fired}`, and the design does not say whether a wait that fired on its TIMEOUT should make the capture undetermined.* BOB #32 ruled on 2026-09-24 that such a render keeps the capture's GRADE, that the rendered document's COMPLETENESS is UNDETERMINED, and that it is never presented as the whole page and never refused. **The ruling is carried on QUEUE.md's D-64 row as `owed-at-integration:` (coord `a04264b8`) and is cited from there by `src/render.mjs`, by construct claim `2.rendered` and by IC-275; FOLDING IT INTO THIS DOCUMENT AS A RULED SECTION IS BOB'S OWED ACT**, assigned by that line, and until it is paid the ruling's home is the queue row rather than this design. What is BUILT for it: `render.wait.fired_class` (three-valued — `condition`, `timeout`, `undetermined` for a word the plane does not recognise), `render.completeness`, the sentence in `render.undetermined[]`, and a provenance assertion that does not present such bytes as the whole page. NOT BUILT, and not this item's: whether the renderer's word is TRUE — `fired` is the renderer's claim, as its request and script lists are. Was: [DESIGNED-not-built] in full. Nothing produces the second artifact, and none of the `render.*` fields listed — engine, viewport, wait condition, elapsed, requests, `third_party_executed`, `render.of`, and the `render.data` that the 2026-09-21 authority rule added — exists in any schema or any provenance document. The authority rule itself is [DESIGNED-not-built]; its fence on the `image` arm is D-440, and the per-origin attribution of a rendered page's regions is DEFERRED with its trigger named.
- §The grade: RULED — the grade is RULED and, since 2026-09-24 (D-64), IMPLEMENTED at acquire: a rendered capture takes the ordinary direct-capture grade and its method is `rendered` (BOB #32). The catalog still carries no check specific to a rendered capture (C-18.1 reads it as any capture). Was: the grade is RULED and nothing implements it. There is no grade or method vocabulary for a rendered capture in the check catalog, which this document's own open questions say must be settled before any code writes one into a record.
- §There is no collision — the DAILY ALLOWANCE this section's budget stands behind is BUILT and, since 2026-09-24 (D-492), holds a bound rather than claiming one: a render reserves its maximum cost at admission, so the renders in flight are counted and `spent_ms + reserved_ms <= allowance` at every moment. **TWO RESIDUES, NOT CLOSED and stated at `store.mjs` `renderAdmit`:** the reservation binds only a renderer that HONOURS the navigation and wait timeouts it was asked for — one that overruns reports the longer time and the allowance is passed by exactly that excess, which the plane cannot check because the elapsed time is the RENDERER'S CLAIM; and the allowance is an ACCOUNT, not a throttle, so nothing here caps how many renders run at once. The navigation bound (30,000 ms) is CHOSEN, not measured, exactly as the daily figure is.
- §There is no collision — superseded in its premise by DEC-42 and marked as such in the body: Workers Paid IS a requirement, the installer refuses a Free account (D-185), and the free-tier figures here are history rather than a configuration anything runs under.
- §What this changes in what is already built — written against 0.42.0 and not re-checked since. Subresource capture, link partitioning and the site asset record have all moved (`CAPTURE-FIDELITY.md`, `LINK-FIDELITY.md`, `CAPTURE-SCALING.md`), and none of the four claims here can be checked against a rendered document because none exists.
- §Open questions for ratification — all four RULED 2026-09-23 (BOB #31, BOB #32; see the two RULED sections before it). Was: all four are still open. The fourth has a counterpart it did not have when it was written: CAP-3's monitoring consumer is now the first actor that fires captures unattended, so "whether an unattended sweep may capture a client-rendered source at all" is a live question rather than a hypothetical one.

**Contents**
- [The ruling this proceeds from](#the-ruling-this-proceeds-from)
- [What is broken today, measured](#what-is-broken-today-measured)
- [The grade: RULED, and the argument is Bob's](#the-grade-ruled-and-the-argument-is-bobs)
- [Why the rendered DOM still needs its own method and environment recorded](#why-the-rendered-dom-still-needs-its-own-method-and-environment-recorded)
- [Therefore: a pair, not a replacement](#therefore-a-pair-not-a-replacement)
- [What must be recorded on a rendered capture](#what-must-be-recorded-on-a-rendered-capture)
  - [RULED: third-party output is attributed to the third party](#ruled-third-party-output-is-attributed-to-the-third-party)
  - [DESIGNED 2026-09-21: whose authority a rendered capture carries, and why D-55 closed](#designed-2026-09-21-whose-authority-a-rendered-capture-carries-and-why-d-55-closed)
- [There is no collision: rendering is available on the free tier](#there-is-no-collision-rendering-is-available-on-the-free-tier)
- [What Workers Paid actually buys, for this project](#what-workers-paid-actually-buys-for-this-project)
- [What this changes in what is already built](#what-this-changes-in-what-is-already-built)
  - [RULED 2026-09-23 by BOB #31: third-party scripts run, and every one is recorded (D-64; SCHEDULER #17's S17-1 Q2)](#ruled-2026-09-23-by-bob-31-third-party-scripts-run-and-every-one-is-recorded-d-64-scheduler-17s-s17-1-q2)
  - [RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep (D-64; SCHEDULER #17's 22:56Z questions)](#ruled-2026-09-23-by-bob-32-the-method-the-primary-and-the-unattended-sweep-d-64-scheduler-17s-2256z-questions)
  - [RULED 2026-09-25 by BOB #34: a monitoring tick on a rendered capture watches the FRAME (D-567; folded by D-567's worker from BOB-INBOX-drained.md)](#ruled-2026-09-25-by-bob-34-a-monitoring-tick-on-a-rendered-capture-watches-the-frame-d-567-folded-by-d-567s-worker-from-bob-inbox-drainedmd)
  - [RULED 2026-09-24 by BOB #32: a render whose wait TIMED OUT (D-64; folded by BOB #33 from the D-64 row's owed-at-integration line)](#ruled-2026-09-24-by-bob-32-a-render-whose-wait-timed-out-d-64-folded-by-bob-33-from-the-d-64-rows-owed-at-integration-line)
  - [RULED 2026-09-24 by BOB #33: a digest for every subresource a render loaded (D-490's gap; D-529)](#ruled-2026-09-24-by-bob-33-a-digest-for-every-subresource-a-render-loaded-d-490s-gap-d-529)
- [Open questions for ratification](#open-questions-for-ratification)

---

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
- `render.subresources`: every subresource the render LOADED, each with its sha256 —
  RULED by BOB #33 on 2026-09-24, see the RULED section of that date below

### DESIGNED 2026-09-21: whose authority a rendered capture carries, and why D-55 closed

Mechanism, designed by BOB #24 under Bob's standing delegation (mechanism is the architect's), from his three
rulings: third-party output that is evidence is recorded as that third party's (2026-07-29, above); authority follows
the DATA and is three-valued (2026-07-30, `AUTHORITY-AND-TRUST.md`); and the publication fence sits on PROVENANCE
authority, so content-undetermined material with a dated basis may be published (2026-07-31, the same document).

**Traced first, at the code (`origin/main` `c05d71c8`): the link D-55's 2026-09-19 narrowing left open.**

- **No third party's script output is in any capture today, and a page's own bytes are what its host served.**
  `subresources.mjs` `fetchPolicy` refuses every script, image and media reference whose `originOf` origin is
  `third_party` (`THIRD_PARTY`, recorded per reference). `originOf` compares host names, and its same-site test is an
  approximation it states: on a shared vendor platform another organisation's asset can pass as `same_site` and be
  fetched, but only as support for the rendition, never as the document's bytes. Scripts, frames, objects and embeds
  are stripped from the rendition (`STRIPPED_ELEMENTS`), and nothing renders (D-64). Stylesheets, fonts and icons are
  fetched from any origin, for layout only.
- **A content row's document is always a registered capture** (`content.capture_sha`, the register's trust root), so
  no row can have a subresource as its document.
- **The `image` arm's `{part}` form CAN name a subresource's bytes, or any other 64-hex hash, on a capture that is not
  an office container, and it mints.** `coversImage` admits a part whenever the container holds no image list, which is
  true of every HTML capture, and `mintContent` states nothing. The part does NOT join: nothing resolves it against
  `site_asset_refs`. That is a defect in its own right, D-440: the row claims an image in a document whose bytes do
  not contain it.

**The design.**

1. **Authority stays at DOCUMENT grain. No authority value is added at asset or content grain.** An asset row is
   rendition support, which `fetchPolicy` limits to what a faithful rendition needs. Nothing cites it as evidence, so
   an authority on it would attribute bytes nothing may rest on. A content row inherits its capture's authority
   through `capture_sha`. A second authority column there would be a second answer to one question. It could be set
   honestly only by attributing a region of a rendered page to the origin that produced it, which needs a `dom` extent
   producer (refused by name today, C-45.4) and a renderer that attributes DOM nodes to requests; neither exists. That
   attribution is DEFERRED as a refinement: it would turn undetermined regions into determined ones, and it would
   correct no record.
2. **Anything served beside a page that is to be evidence is its OWN document.** That covers an image, a data payload
   a script fetched, or a widget's output. It is acquired at its own address as its own capture, with its own
   provenance chain whose hop names the origin that served it, its own grade, and its own content authority under the
   three-valued rule: the issuing party when asserted, otherwise `undetermined` with a dated basis. This meets Bob's
   2026-07-29 ruling at the grain the record already holds: a third party's output that is evidence is recorded as
   that third party's document, never as the hosting site's. What the host served in its OWN bytes, including anything
   it embedded server-side, is the host's publication; a claim about what the third party itself said rests on the
   third party's document. The `image` arm's `{part}` form stays what `EXTRACTION-BREADTH-DESIGN.md` §3.2 designed: a
   member of a container's own bytes, refused by name on any other capture (D-440). When a member needs the exact bytes
   a page used rather than a fresh fetch, the path is to register the held subresource as its own document. Its
   provenance hop's evidence is its `site_asset_refs` row, and the hop states whether the bytes were fetched at that
   capture or REUSED from an earlier one (CAP-4). That is where the join belongs: evidence for a part's own hop, not
   an address inside the page. It is not built, and it is not owed until a member needs it.
3. **A rendered capture's content authority is set by the data rule, at document grain.** The rendered artifact of
   the pair records:
   - **`render.data`**, added to the list above: each DATA-bearing response the render consumed, with its address, its
     `originOf` origin and its sha256. Data means documents, frames, fetch and XHR bodies, images, map tiles and data
     files; it excludes code (scripts) and layout (stylesheets, fonts). It is the rule's input, and the join from the
     composite to any payload later acquired as its own document.
   - **`authority_state: determined`, as the served shell's authority, ONLY** when the shell's own authority is
     determined, every `render.data` entry is `same_host`, and no script from another origin executed
     (`render.third_party_executed` is empty).
   - **Otherwise `undetermined`**, with a dated `authority_basis` naming each other origin and the axis it touched
     (it supplied data, or it ran code), and the D-98 task every undetermined capture raises. A person resolves it by
     an assertion carrying its basis. *"This viewer only drew the City's layer"* is Bob's tool case, and it is a
     person's finding: nothing mechanical can tell a tool that drew the host's data from an origin that injected its
     own.
   - **Never `determined` as the host when another origin supplied data or ran code.** That is the one false
     statement all three rulings forbid: crediting a city with a vendor's copy. `same_site` does not qualify silently,
     because `originOf` states that it approximates, and the approximation is wrong on shared vendor platforms.

   Publication follows the 2026-07-31 fence unchanged: undetermined with a dated basis may be published; undetermined
   and silent may not.

**It settles the provisional shape recorded on 2026-07-31** (`MILESTONES.md`, M2, *"D-55, unblocked as far as it can
honestly be"*), keeping its core: attribute by ORIGIN, never by region; each origin `undetermined` unless something
asserted it; the shell's own authority unchanged. It refines two points. First, that shape's `rendered_origins[]`
listed each origin *that executed*, and Bob's two axes (2026-07-30) separate an origin that ran code from one that
supplied data, so the list is kept by AXIS: `render.data` is its data half and `render.third_party_executed` its code
half. Second, the RENDERED artifact carries its own content authority by item 3's rule, so the shell's authority can
never be read as covering what another origin contributed.

**What this closes and what it leaves.** D-55 closes, because nothing in the record waits on per-origin sub-document
attribution. D-64 is no longer blocked on D-55. It waits on its own build and on the four open questions at the end of
this document, and its build carries item 3's rule: a suite renders a page that draws data from a second origin and
reads `undetermined` naming that origin, with a negative control that marks it `determined` and fails by name.
D-440 is the fence item 2 names. Item 1's deferral is stated with its trigger; it is not an obligation.

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
work, and it was MEASURED on 2026-07-29 (biosmoke7, Workers Free, 0.44.0): `op=cpuprobe` ran
20 steps of 2,000,000 reference iterations, 40,000,000 in all, and the isolate was killed during
step 21 with HTTP 503 `error code: 1102`, so the ceiling enforced there was not the documented
10 ms. The heaviest real capture measured, a news front page, did 49 compute calls over 16.97 MB.
A Worker CANNOT TIME ITSELF, because Cloudflare freezes `Date.now()` during synchronous execution,
so work is counted in calls and bytes and the ceiling in reference iterations (`src/cpu.mjs`).
**STATED AS A WATCH (D-56; BOB #24, 2026-09-21):** unlike the subrequest limit, a CPU overrun kills
the isolate with no catchable error and nothing recorded, so an unexplained 1102, or a capture that
fails only on large inputs, is read as a CPU overrun first. Workers Paid, which DEC-42 made a
requirement, raises the ceiling and leaves the failure's shape unchanged.

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

### RULED 2026-09-23 by BOB #31: third-party scripts run, and every one is recorded (D-64; SCHEDULER #17's S17-1 Q2)

Scripts from third parties are ALLOWED during capture, inside the capture sandbox, and each one that runs is RECORDED. A
capture must show what a visitor saw, and blocking scripts changes the page. The provenance names the origin of every
script executed. A capture whose script set cannot be recorded says so: the set is `undetermined`. This settles the
second open question below, and the attribution ruling above still governs what their output is credited to.

### RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep (D-64; SCHEDULER #17's 22:56Z questions)

1. **The method is `rendered`.** The renderer and its environment are the `render.*` fields listed above. The served
   shell keeps its existing method.
2. **One capture holds both artifacts, and the RENDERED document is the bundle's PRIMARY.** It is what a visitor saw,
   and Bob's grade ruling makes it the content. The served shell is kept beside it under its own digest, as the one part
   anyone can re-verify against the source. The manifest describes both and names the primary.
3. **An unattended sweep MAY render**, within the instance's daily render allowance and through the host governor. When
   the allowance is spent, the tick records the render as DEFERRED (undetermined). It never records the shell as though
   it were the content. The member-driven render path stays.

With the first ruling of 2026-09-23 above, all four open questions below are ruled.

### RULED 2026-09-25 by BOB #34: a monitoring tick on a rendered capture watches the FRAME (D-567; folded by D-567's worker from BOB-INBOX-drained.md)

Option (b). `op=monitor` re-fetches the SERVED document and cannot render, so what a tick holds on a rendered capture is a
fresh SHELL, and item 2 above makes `capture.sha256` the RENDERED primary's digest. **The tick compares the freshly served
shell with the pair's own `shell.sha256`, never with the rendered primary.** A match says *the frame is unchanged*. A
difference says *the frame changed*, which is a D-472 `modified` about the frame only. **Every tick states the CONTENT as
UNDETERMINED, "not watched: this source renders its content in the browser"**, so a match is never read as the document
being stable. Comparing a fresh shell against the RENDERED baseline is the defect this closes: it would report a change
nobody made on every tick (found by D-522's worker by reading the code). **Rendering on each tick, option (a), is NOT
designed and NOT rowed**: it needs a comparison basis for bytes that are rebuilt per render, and it spends render allowance
on every cadence; it waits until a measured need exists.

BUILT by D-567 (2026-09-25) and driven in `bio-plane/test/monitor-rendered.test.mjs` through a real `render: true` acquire:
a register row whose pair names `primary: "rendered"` (or whose capture method is `rendered`) ticks against
`pair.shell.sha256`; the answer carries `frame`, `content: "undetermined"` and the sentence (`RENDER_TICK_UNDETERMINED`,
`src/render.mjs`); the observation log's detail says `frame` and `content undetermined`. Two readings the ruling left to the
builder, decided there: **a frame match moves no `source_status`** (the field's only other word is `unchanged`, which
would read as the document being stable), and **a rendered row naming no shell digest compares nothing and says so**,
never falling back to the rendered digest.

### RULED 2026-09-24 by BOB #32: a render whose wait TIMED OUT (D-64; folded by BOB #33 from the D-64 row's owed-at-integration line)

A render waits for its condition (the page settled) or for its timeout, whichever comes first. **When the timeout fires, the capture keeps
its GRADE**: the grade is the chain of custody, and the method is recorded beside it. **The rendered document's COMPLETENESS is
UNDETERMINED.** `render.wait` records that the timeout fired, and the reading states *"render may be incomplete (wait timed out)"*. It is
never presented as the whole page, and it is never refused: a partial rendering is still evidence of what the page showed at that moment,
and refusing it would lose that evidence. D-499 builds the recording: a render records which wait fired (condition, timeout or
undetermined) and the completeness that follows from it, and its provenance asserts less when the wait timed out (IC-275).

### RULED 2026-09-24 by BOB #33: a digest for every subresource a render loaded (D-490's gap; D-529)

BOB #33 ruled at 21:05Z on the gap D-490 recorded: **a per-subresource SHA-256 IS OWED on a rendered capture, and it reads
UNDETERMINED where the bytes were not kept. The `@cloudflare/puppeteer` package is not taken on to get it.** A hop attests
these bytes, at this URL, at this time (construct 2), and BOB #31 ruled that every script a render runs is recorded. A
script recorded by its address alone says WHICH code ran and not WHAT code ran, so the record could not be verified
without trusting the renderer.

D-529 builds the mechanism under the architect's standing delegation:

1. **Which loads owe a digest:** every request whose outcome is `completed`. A failed or blocked request supplied no bytes
   to the page and owes none; `render.requests` still counts it.
2. **The digest is the plane's.** The renderer hands over each body (`body_base64`, or `body_text` as CDP gives a text
   body). The plane hashes it, KEEPS it content-addressed where subresource capture keeps its bytes, and only then records
   the digest, with `digest_by: "plane"`, the length, and `body_as` saying what was hashed. So every hex digest names bytes
   anyone holding the store can re-hash.
3. **Undetermined carries its reason.** A load whose bytes were not kept reads `sha256: "undetermined"` with a
   `digest_reason`. The reasons are: the browser would not give the body (in its own words), a redirect hop, a body over
   subresource capture's ceilings (`SUBRESOURCE_MAX`, `SUBRESOURCE_BUDGET`, `SUBRESOURCE_CAP`), and bytes that did not
   decode. The count is stated once in `render.undetermined[]`. A digest over bytes held only in memory is not recorded,
   because nobody could re-read those bytes.
4. **A digest the renderer only reported is its claim.** It is kept as `renderer_sha256` and never as the digest.
5. **`render.data` carries the same digest** as the load it is a subset of.

What this does NOT establish: that the browser's bytes are the bytes the origin served, which remains the renderer's
claim (`body_as: "decoded_text"` equals the wire bytes only when they were UTF-8), and anything about a live browser.

## Open questions for ratification

- The grade and method vocabulary for a rendered capture, which should be
  settled before any code writes it into a record.
- ~~Whether third-party script execution during capture is permitted at all,
  blocked by default, or recorded and allowed.~~ RULED 2026-09-23: recorded and allowed (above). Blocking changes what renders;
  allowing puts an unknown party's content in the record.
- Whether the rendered document or the served shell is the primary of the
  bundle, and therefore which one `snapshots/` holds and which the manifest
  describes.
- Whether an unattended sweep may capture a client-rendered source at all, given
  that the cheap render path needs a member present.
