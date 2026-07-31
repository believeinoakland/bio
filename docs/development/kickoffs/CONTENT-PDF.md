# Area CONTENT-PDF: structure inside PDFs

Written 2026-07-31 by `ARCH` from the main checkout, standing this area up as the
first content area to run in parallel (`PARALLELISM.md`, `INTERFACES.md`,
`CLAIMS.md`). It is written to be SHOVEL-READY: the next session can claim, build,
and test without a design turn, because the boundary was measured this turn rather
than assumed. The session rewrites this file at its close with CONTENT-PDF's own
account of its work.

## What this area owns

Identifying content inside PDFs — structure extraction (D-91). CONTENT-PDF
**CONSUMES bytes (I1)** and **PRODUCES structure**. It does not fetch, govern,
walk subresources, or reach the archive fallback: everything it is entitled to
from a capture is in I1, and it reads bytes through `op=capture` (range requests
supported — that clause in I1 §3 was written for exactly this area, so a PDF is
read in ranges, never pulled whole into a Worker).

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

**(3) MEASURE before committing to text (phase 2).** Do not bundle `unpdf` until
you have measured its bundled size against the 3MB limit and its CPU against the
ceiling, through the plane's egress (`cpu.mjs`; a Worker cannot time itself).
Record both in `MEASUREMENTS.md`. Text extraction is a separate, measured decision,
not part of phase 1.

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

## Not this area's, however reachable

The fetch/governor/subresource/archive path and the HTML link graph (CAPTURE,
behind I1); content identity, intent, and bias (FRAMEWORK); `docprofile/**`
(FRAMEWORK); the op dispatch and schema in `index.mjs`/`schema.mjs` (CAPTURE).
Reading any of them is expected; changing them is a DELEGATION.
