# Area CONTENT-HTML: content inside HTML

Written 2026-07-31 by `ARCH` from the main checkout. This file is DELIBERATELY
NOT shovel-ready, because measuring the boundary this turn showed CONTENT-HTML is
**not yet independently carvable** — unlike CONTENT-PDF, which is. The honest state
is written down here so the first session, or Bob, decides scope from evidence
rather than walking into three delegations. **Do not start building from this file
without cutting scope with Bob first** (the same posture `kickoffs/FRAMEWORK.md`
takes, and for the same reason).

## What this area is nominally for

Identifying content inside HTML — recognizers and client-rendered documents
(D-64). It would CONSUME bytes (I1) and PRODUCE structure. That is the intent in
`PARALLELISM.md`. What follows is why the intent does not yet map onto an
uncontested body of work.

## Why it is not yet carvable — measured this turn, with the evidence

1. **The HTML link/structure graph already exists and is CAPTURE's.**
   `bio-plane/src/subresources.mjs` characterises every `<a href>` into
   `LINK_TYPES = ["anchor","intra","deferred","refused"]` (line 660), keeps
   element references, and preserves targets in `data-bio-href`. The obvious
   "extract HTML structure" work is already built and owned. CONTENT-HTML would be
   re-treading CAPTURE's ground, not opening new ground.

2. **The recognizers live in FRAMEWORK's `docprofile`.** The `client_rendered`
   handler that detects a shell (a body with no links and no prose) and carries
   the member-facing warning is in `docprofile/` — which FRAMEWORK owns. Editing
   recognizers there is a DELEGATION to FRAMEWORK, not this area's own path.

3. **D-64's actual requirement is a CAPTURE-side capture path, and it is blocked.**
   The ruling is that JS-rendered content IS the content and must be captured at
   the SAME GRADE. That needs the Browser Rendering path — which PRODUCES bytes
   and provenance, i.e. it is CAPTURE (the I1 producer side), not structure from
   bytes. And D-64 is "blocked behind D-55 (per-origin authority for a rendered
   capture) for anything carrying third-party script output." So the headline item
   is neither this area's layer nor currently unblocked.

Net: CONTENT-HTML has almost no path of its own today. Standing a session on it
now would mostly generate delegations into CAPTURE and FRAMEWORK — which is the
friction the area model exists to avoid. **Dormant is a normal state, not a gap**
(`PARALLELISM.md`: two to four areas live at a time, the rest dormant).

## What would make it carvable — for the scope conversation with Bob

Candidate independent slices, none to be started before Bob picks one:

- **The document-page honesty for a client-rendered capture.** D-64 says the
  record "should say so on the document page rather than only at capture time."
  That is a render/UI surface and may belong to `UI`, not here — a boundary call.
- **An HTML content-structure layer distinct from the existing link graph** —
  a document outline (headings/sections/element-reference tree) that FRAMEWORK
  consumes as I2, genuinely separate from CAPTURE's link partitions. Whether such
  a layer is real work or a rename of what exists needs an ARCH boundary cut.
- **Nothing yet, until D-55 unblocks the Browser Rendering path**, at which point
  D-64 becomes a real CAPTURE+CONTENT-HTML pairing.

## If a session does start here

Same ritual as every area: read `CLAUDE.md`, `PARALLELISM.md`, this file, and
`INTERFACES.md` (I1); claim CONTENT-HTML in `CLAIMS.md` naming the paths the
agreed slice touches; work in a worktree (`claude --worktree CONTENT-HTML`),
`.env` carried in by `.worktreeinclude`. The standing knowledge is the same as
CONTENT-PDF's — read that file's final two sections; they bind here identically
(consume I1, structure-not-intent, undetermined is first-class, measure don't
assume, negative control, never force-push, land green and hand releases to DIST,
close with Bob's decisions only). Do not cut plane releases; provision a
`biosmoke-html` instance only when a session actually needs to live-verify.
