# Area CONTENT-PDF: structure inside PDFs

**CORRECTED 2026-07-31 by session BOB: item (3) of the plan below is SUPERSEDED by
the function-specific Worker topology decision. Read it before starting — the old
item told you to bundle `unpdf` into the plane, and that is now wrong.**

**CORRECTED 2026-08-03 by session BOB: the DISPATCH this file describes is moving
onto the FORMAT registry** (COFF-1 — QUEUE.md BOB INBOX 2026-08-03, `OFFICE-FORMATS.md`,
`INTERFACES.md` I7). `op=pdfstructure` survives with byte-identical output, but its
read-time dispatch and the acquire-time `HTML_CT` guard become registry consultations,
and `pdfstructure.mjs` becomes the PDF registry entry behind I7. "The op question"
section below is superseded the same way: once COFF-1 lands, op wiring for a content
area is a registry entry, not an `index.mjs` delegation. Nothing else in this area's
scope changes — it still owns `pdfstructure.mjs` and `pdf-worker/**`.

Written 2026-07-31 by `ARCH` from the main checkout, standing this area up as the
first content area to run in parallel (`PARALLELISM.md`, `INTERFACES.md`,
`CLAIMS.md`). It is written to be SHOVEL-READY: the next session can claim, build,
and test without a design turn, because the boundary was measured this turn rather
than assumed. The session rewrites this file at its close with CONTENT-PDF's own
account of its work.

**Coordination:** before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the channels, which
carries what, and the receipts for every way a correct change reached nobody. Claim
in `CLAIMS.md` before editing; publish before you call anything done.

## What this area owns

Identifying content inside PDFs — structure extraction (D-91). CONTENT-PDF
**CONSUMES bytes (I1)** and **PRODUCES structure**. It does not fetch, govern,
walk subresources, or reach the archive fallback: everything it is entitled to
from a capture is in I1, and it reads bytes through `op=capture` (range requests
supported — that clause in I1 §3 was written for exactly this area, so a PDF is
read in ranges, never pulled whole into a Worker).

**As of 2026-07-31 this area also owns `pdf-worker/**`**, the first member of the
Worker fleet (I6). Note the two axes do not coincide: `pdf-worker` is CONTENT-PDF's
CODE and DIST's RELEASE OBJECT, exactly as the plane is. Do not deploy it; land it
green and hand it to DIST.

**Paths this area owns (all NEW — no collision with CAPTURE's claim):**

- `bio-plane/src/pdfstructure.mjs` — the extractor
- `bio-plane/test/pdfstructure.test.mjs` — its battery

Claim exactly those in `CLAIMS.md` before editing. Two paths it will NEED but does
NOT own, so they are DELEGATIONS to CAPTURE, not quiet edits:

- The op that triggers extraction, wired into `index.mjs`'s `if (op === …)`
  dispatch (CAPTURE owns the capture ops there). See "The op question" below —
  ARCH has set a provisional answer so this does not block the first turn.
- The `NOT_HTML` guard at `index.mjs:1510` that skips structure work for
  non-HTML bytes. You do not need to remove it; extraction is a separate op, not
  a change to the acquire path.

## What was measured this turn, so you do not rediscover it

**The HTML link graph already exists and is CAPTURE's, not yours.**
`subresources.mjs` characterises every `<a href>` into `LINK_TYPES =
["anchor","intra","deferred","refused"]`, keeps element references, and preserves
the target in `data-bio-href`. Your job is the PDF ANALOG of that same partition
model, not a second link system. Map onto the SAME partitions so structure is
container-agnostic — that is the whole thesis of the layered split (`PARALLELISM.md`).

**D-91 already did the mapping from PDF onto that model.** From the debt entry,
measured/ruled, not guessed:

| HTML today | PDF equivalent | Cost |
| --- | --- | --- |
| `<a href>` | `/Annots` with `/Subtype /Link` and a `/URI` action | cheap; no font handling |
| in-page `anchor` (`#frag`) | named destinations and `/Dest` | cheap |
| `intra` (embedded) | embedded files (`/EmbeddedFile`) | cheap |
| element reference | page index + annotation `/Rect` | cheap |
| the prose/content | glyph→Unicode text via embedded CMaps | EXPENSIVE — phase 2 |

**FlateDecode costs no bundled code.** Workers has `DecompressionStream("deflate")`
natively, so decompressing object streams needs no dependency.

**Text extraction is the only hard half, and it is MEASURABLE, not arguable.**
`unpdf` (a serverless pdf.js build for Workers) solves glyph→Unicode. The earlier
"expensive and failure-prone" claim was a guess and was withdrawn in D-91. The
real constraints are bundle size against the 3MB Free-worker limit and CPU against
the measured ceiling — both numbers, both to be established before adoption, both
into `MEASUREMENTS.md` with date and instrument.

## How a session starts

1. **Read `CLAUDE.md`**, then `PARALLELISM.md`, then this file.
2. **Read `INTERFACES.md` I1 end to end** — it is your contract with CAPTURE.
   §2 (R2 key shape) and §3 (`op=capture`, range/206) are how you get bytes; §4
   (the acquire frontmatter) is where `content_type` actually lives (it is NOT a
   register column and NOT served by `op=capture`, which is always
   `application/octet-stream`); §1 is the register you join against.
3. **Claim CONTENT-PDF in `CLAIMS.md`**, naming `bio-plane/src/pdfstructure.mjs`
   and `bio-plane/test/pdfstructure.test.mjs`. A claim keeps other sessions out.
4. **Work in a worktree**: `claude --worktree CONTENT-PDF`. One session per
   worktree; `.env` is carried in by `.worktreeinclude`.
5. **Credentials come from `.env`**, never a chat message, never committed
   (`tokens.mjs` denylists any token published in the repo and treats it as NOT
   SET, so committing one revokes it).

Then read: `DEBT.md` D-91 (the ruling and the mapping), D-60 (docprofile's
`digests`/`compare` — reference only; do not grow a second copy), and the "Bob's
rulings, already made" block in `kickoffs/CAPTURE.md` (several bind you).

## The plan — phase 1 is fully independent of every other area

Build the link layer first: it is the cheap, no-font half, it is the largest slice
of the citation graph, and it needs nothing from CAPTURE to build and test.

**(1) `pdfstructure.mjs` as a PURE module.** Input: PDF bytes and a byte-range
reader (so the same function drives off a fixture in a test and off `op=capture`
range reads in the plane). Output: a structure object in the container-agnostic
partition shape above. Parse the xref/trailer enough to walk page objects and
their `/Annots`; pull `/Subtype /Link` annotations with `/URI` actions into the
href graph; `/Dest` and named destinations into `anchor`; `/EmbeddedFile` into
`intra`; page index + `/Rect` into the element reference. FlateDecode via
`DecompressionStream("deflate")`. No dependency in phase 1.

**(2) Fixtures and NEGATIVE CONTROLS.** A real Oakland agenda PDF with link
annotations; one with named destinations; one with a Flate-compressed object
stream; and — the control that matters — **a PDF with no annotations at all, on
which the extractor must find nothing and invent nothing.** Then break the
extractor and confirm the battery FAILS. A suite that still passes when you neuter
the parser is testing something else (this has bitten this project — read the
negative-control rule in `CLAUDE.md`).

**(3) SUPERSEDED 2026-07-31 — text extraction is TIERED and `unpdf` never enters
the plane.** This item said "measure before bundling `unpdf`". The measurement ran
(CPDF-1: it fits, 2.29MB gzip headroom) and then a second measurement overturned the
approach: **putting `unpdf` in the plane's module graph broke 21 miniflare suites**,
because a bare npm specifier cannot resolve in un-bundled source and this battery
drives source rather than the built artifact.

Bob's decision, 2026-07-31: a **function-specific Worker topology**. The plane stays
lean; heavy dependency-laden functions move into dedicated single-purpose Workers
called over service bindings. First member is `pdf-worker`, registered as **I6** in
`INTERFACES.md`, and `PARALLELISM.md` carries the six standing rules for a fleet
member (the two that bite: it ASSERTS nothing and writes nothing, and it holds a
`CAPTURES` read binding and never `PUBLISHED`).

Extraction is tiered, and the SEQUENCE is the point:

- **Tier 1, in the plane, pure JS, no dependency** (QUEUE `CPDF-4`) — content-stream
  text operators plus the font `ToUnicode` CMap, reusing the object parser
  `pdfstructure.mjs` already has. Most municipal PDFs come from Word or InDesign and
  carry `ToUnicode`.
- **Measure Tier 1's coverage on real Oakland PDFs** (`CPDF-5`). That measurement
  SIZES Tier 2 — it says how much `unpdf` is actually needed.
- **Tier 2, `pdf-worker`/`unpdf`** (`CPDF-6`) — only the residue: CID fonts, missing
  `ToUnicode`, complex layout.
- Tables, visuals and OCR are later tiers, deferred by name rather than forgotten.

**`CPDF-2`'s work is superseded, NOT discarded**: the extraction logic and size guard
already written on branch `content-pdf/phase2-text` become the pdf-worker's Tier 2
core. And run `CPDF-7` first if it has not run — whether Workers Free permits a
second script and a service binding at all is UNMEASURED (D-118), and if it does not,
Tier 1 is not an optimisation but the only PDF text a free instance will ever have.

**(4) The output shape IS the I2 producer side — write it from the code.** I2
(structure → framework) is not registered yet and its nominal owner FRAMEWORK is
dormant. Do NOT invent I2 up front; build the extractor, then propose I2 from what
it actually emits, exactly as I1 was written from the code as it stands. Settle
registration with ARCH (ARCH answers for the dormant consumer, in writing).

**(5) Live-verify only once the op is wired**, in a `biosmoke-pdf` scratch
namespace — never the real record — and sweep after. A deploy verified is not a
build serving: confirm which build answered before believing a probe (D-108).

**(6) Close out.** Land tested code green on `main`; hand any plane release to
DIST (do not bump a version, sign, tag, or run `deploy.mjs`). Append to `DEBT.md`
(next free D-number at the moment you write; per-area IDs like `D-PDF-1` are not
adopted until three areas are live) and `MEASUREMENTS.md`, prepend a state-doc
entry naming this area, rewrite ONLY this file, and end with decision items that
are Bob's alone.

## The op question — provisional, so it does not block you

Adding an op edits `index.mjs`, which is CAPTURE's. To keep phase 1 independent:
**build and unit-test the pure module with fixtures — that needs no op at all.**
When you reach live-verify, the op wiring (a few additive lines registering
`op=pdfstructure` and dispatching into your module) is a **DELEGATION to CAPTURE**,
which is live. This is the interim ARCH has set; it is cheap and reversible. If
op-wiring delegation becomes a repeated bottleneck across content areas, that is
the trigger to promote op-contract ownership out of CAPTURE (the I3 move
`PARALLELISM.md` anticipates) — not something to build pre-emptively.

## What this area should know without being told

- **Consume I1; do not reach past it** into fetch, governor, subresources, or the
  archive fallback. If you find you need one of those, that is an interface-change
  proposal, not a reach into the schema.
- **Content is identified in PDFs as in HTML**: you extract STRUCTURE; FRAMEWORK
  decides what the content IS. Do not classify intent here.
- **`undetermined` is first-class and must be stated**, never invented to fill a
  field. A PDF whose structure is ambiguous says so.
- **Measure, do not assume**; numbers live in `MEASUREMENTS.md` with date and
  instrument, and a vendor's figure is labelled as theirs.
- **Run the negative control; correct superseded tests, never exempt them.**
- **Fetch and rebase before pushing; never force-push `main`.** A rejected push
  means another area landed work: reset onto the remote, re-apply, confirm theirs
  survived.
- **If you ever touch `schema.mjs`** (you should not need to in phase 1): new
  tables go BEFORE the `host_governor` block, and no backticks inside the schema
  literal — `node --check` will not save you.
- **Close with the decisions that are Bob's, and nothing else**, in the shape
  `kickoffs/README.md` defines. Read its three tests first. An empty list is a
  real answer.

## What CPDF-9 landed, and the one decision running provisionally (2026-08-08)

**D-232's open half is closed: `pdf-worker/test/pdf-worker.test.mjs` RUNS on a fresh
checkout.** It resolves `miniflare` from its own install if there is one and otherwise
through `createRequire(bio-plane/package.json)` — `agent-worker`'s mechanism COPIED
rather than a second one invented, because two mechanisms for one job is how the next
member goes dark differently. It also imports `bio-plane/test/sandbox.mjs` (D-186): the
battery now RUNS this suite, and it mints four miniflare sandboxes per run.

Two riders from the same sweep landed with it: the line-comment stripper is anchored on
a non-`:` and is asserted in BOTH directions over a fixture that carries a URL (the naive
idiom deletes `"http://…"` and the rest of its line), with the corpus size PRINTED and a
floor asserted so a walk over a truncated corpus FAILS instead of reporting clean; and
the member gained **`GET /version`** (IC-33, PROPOSED — the I6 version bump is CONDUCT's),
because fleet rule 4 was unverifiable for it.

### DECISION — running provisionally: **A FLEET MEMBER WHOSE SUITE CANNOT RESOLVE ITS DEPENDENCIES IS SKIPPED AND NAMED, NOT FAILED**

- **What runs provisionally.** `scripts/battery.mjs`'s `fleetDepSkip` converts exactly
  one cause — `Cannot find package '<x>'` from a fleet suite — into a NAMED skip. The
  battery then exits 0 while the `fleet:` line prints `DARK: <member>`. It is FL-2/VF-3's
  decision; CPDF-9 confirms it rather than re-taking it, and **the path is now UNREACHABLE
  for every member that exists**, since both members resolve through the plane's install.
  It is kept, and `battery.mjs`'s header now says what it was for and why it no longer
  fires, rather than the path being deleted silently.
- **Why it is ambiguous.** A named skip still leaves the battery GREEN while a component
  is dark. Only the `fleet:` line says so, and `coverage.mjs --strict` cannot see it at
  all — reach there is read from the suite's SOURCE, not from whether it was EXECUTED.
  That is the generous direction, which this project treats as the worse one, and it is
  the exact shape D-232 was raised about.
- **The alternative.** FAIL the battery on a fleet suite that cannot resolve its imports.
  That reds `main` on every fresh checkout the moment a new member arrives before it has
  adopted the plane-resolution idiom — over a dependency the plane does not own.
- **Recommendation: keep the skip, and let the next member's own item close the gap.**
  The idiom now exists and is proven on both members; the landing pad is what tells the
  author of member three what to do. **The residual is named rather than hidden:**
  whoever owns the fleet may want a dark member to FAIL rather than to be printed, and
  that is a FLEET call, not `pdf-worker`'s.
- **What reversing it costs: LOW, and it stays low.** One line in `battery.mjs`
  (`fleetDepSkip` returns `null`), plus a `npm ci` in the new member's directory or the
  four-line resolver in its suite. Nothing is built on top of the skip.

## What CPDF-12 landed (2026-08-08): a page of pixels, and the rasteriser nobody had to build

**`pdf-worker/src/pagepixels.mjs` renders a PDF page to pixels inside workerd, with no
canvas and no dependency — and it is NOT a rasteriser.** DEC-42 carried one observation
to be verified rather than assumed: for the image-only class a page is typically ONE
embedded image, so image EXTRACTION may serve where rasterising was assumed.
**It was verified first, over 59 real Oakland PDFs and 622 pages, and it held at 24 of
24 image-only pages.** Numbers, instrument and controls are in `MEASUREMENTS.md`
2026-08-08; do not quote them from here.

Four things worth knowing before touching it:

- **It REFUSES more than it renders, by design.** A page with a text layer, a page of
  vector marks, a page composed of several images, a filter with no decoder (`JBIG2Decode`,
  `JPXDecode` — zero of either in the measured corpus), data short of its declared
  height: each is a NAMED refusal carrying its evidence. There is no code path that
  allocates a frame and returns it without having decoded real samples into it, because
  a blank page and a page with no text on it are indistinguishable downstream.
- **`upright` is a first-class field, and it cost a measurement to learn why.** The page's
  own `/Rotate` is applied exactly on the bilevel routes. Un-rotated, the ground-truthed
  exhibit scored 8.67% characters and 355 MINTED digits through an OCR engine that
  announced nothing. **A page is not its image.** The pass-through JPEG route cannot
  rotate without destroying what it is for, and says so — D-244.
- **Nothing can reach it.** `pdf-worker/src/index.mjs`'s `SURFACE` is untouched; wiring a
  `render` op is an I6 change and belongs with CPDF-10, the consumer. "It runs in workerd"
  and "it is wired" are the two halves D-108 exists to keep apart.
- **`bio-plane/src/pdfstructure.mjs` gained ONE WORD** — `export class PdfDoc` — so the
  member reuses this area's object/stream reader instead of growing a second one. That is
  the D-164 lesson applied, and it is the only line of the plane this item touched.

### DECISION — running provisionally, and it is Bob's: **WHICH HASH DOES A PUBLISHED RENDERING CARRY?**

- **What is running provisionally.** The renderer emits BOTH a file it produced and a
  `pixels_sha256` taken over the normalised samples before any container is built.
  Nothing consumes either yet.
- **Why it is ambiguous, and it is a measurement rather than a preference.** The same code
  over the same page produced a 129,366 B PNG on workerd and a 132,691 B PNG on node —
  both valid, both holding IDENTICAL pixels. `CompressionStream("deflate")` is a platform
  service and the two runtimes emit different legal deflate streams. **DEC-41 rules that
  each published rendering's hash joins `published_shas` so any copy is checkable against
  the instance.** A FILE hash is checkable byte-for-byte against a served copy but is not
  reproducible by a verifier on another runtime, or by the same instance after a workerd
  upgrade. A PIXEL hash is reproducible anywhere but needs a decoder to check.
- **The alternative.** Carry the file hash alone and accept that re-rendering will not
  reproduce it — which turns "checkable against the instance" into "checkable against the
  copy the instance happened to serve", a weaker claim than DEC-41's words.
- **Recommendation: carry BOTH, each LABELLED.** The file hash answers *is this the copy
  the instance published*; the pixel hash answers *is this the same picture*. They are
  different questions and collapsing them is the single-label failure CPDF-10's chain rule
  already forbids one level up.
- **Reversal cost: LOW while nothing is built on it, and it rises the day a case is
  published.** A manifest field is additive; a manifest field that was WRONG about what it
  hashes is a published claim, and published claims are what this project treats as
  expensive. This is why it is raised now rather than when DEC-41 is enacted. D-246.

## Not this area's, however reachable

The fetch/governor/subresource/archive path and the HTML link graph (CAPTURE,
behind I1); content identity, intent, and bias (FRAMEWORK); `docprofile/**`
(FRAMEWORK); the op dispatch and schema in `index.mjs`/`schema.mjs` (CAPTURE).
Reading any of them is expected; changing them is a DELEGATION.
