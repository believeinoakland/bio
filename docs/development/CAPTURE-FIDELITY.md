# Capture fidelity for HTML sources

**Status** · The 0.36.0 subresource-capture design, written 2026-07-28, and [BUILT] in full — this document's original title said implementation was "the next plane release" and it was. Measured against `bio-plane/src` at plane 0.58.0: `subresources.mjs` (1,198 lines) parses the references, fetches each under the same public-https rule, content-addresses every one as its own capture, and emits the render companion with `about:capture#<sha256>` placeholders (`:82`) and a manifest the viewer resolves against verified bytes; grade stays B and WACZ/Grade A is still not claimed. It has been OUTGROWN rather than superseded, and two of its three sections describe a narrower machine than the one that runs: the appetite, the ceiling and the fetch policy have all moved (see the list below, and `CAPTURE-SCALING.md` for what moved them). **M0-27 corrected §Sizing's "~40" cap in place on 2026-09-14** — the appetite is `SUBRESOURCE_CAP = 400` and the section now names the command that reads it; §The shape's script claim is still as written and is the one remaining stale figure. Complete as the record of the shape that shipped. as of 2026-09-14.

**Place in the system** · A level-2 design serving construct 2, **intake, capture and provenance**, whose level-1 home is `BIO_Intake_Doctrine_v1_1.md` (`BIO_System_Design.md` §3 names the construct and its designs). It is the narrowest of CAPTURE's designs and the only one built in a single release: it answers Bob's requirement that a captured HTML page render as a credible rendition of what it was. `CAPTURE-SCALING.md` is its successor and owns everything about how much may be fetched; `LINK-FIDELITY.md` owns the wrappers that share the companion with these placeholders; `BIO_Content_Framework_v0_10.md` Part I §5 owns fidelity levels and calls the companion a RENDITION rather than content.

**Incomplete sections** ·
- §The shape — item 1's *"scripts are fetched and stored (they are part of what was served)"* is narrowed by what shipped: `fetchPolicy` (`subresources.mjs:610-623`) refuses cross-origin script, image and media as THIRD_PARTY. And a part may now not be fetched in this capture at all, because it was REUSED from the site asset record — which the manifest states per part and this section does not mention.

**Contents**
- [The doctrine's constraints, which this design keeps](#the-doctrines-constraints-which-this-design-keeps)
- [The shape](#the-shape)
- [Sizing](#sizing)

---

Bob's requirement: when an HTML page is captured, its CSS and other supporting
files must be captured with it, so rendering the capture is a credible
rendition of what the page was at its point of capture. Today `op=acquire`
fetches the locator's bytes only, so a captured page renders bare.

## The doctrine's constraints, which this design keeps

- The RAW bytes as served remain the primary evidence: hashed at receipt,
  Grade B, never rewritten. A render-ready companion is a DERIVED artifact
  and says so.
- No intake path writes live state. Acquire returns a provenance document;
  the caller promotes.
- Every fetched thing is content-addressed: each subresource is its own
  capture under `<store>/captures/<sha256>`, deduplicated across bundles for
  free.

## The shape

1. `op=acquire` (POST, unchanged contract, new optional `subresources:true`):
   after fetching the primary HTML, parse it for `<link rel=stylesheet>`,
   `<img src>`, `<source srcset>`, CSS `url()` references one level deep, and
   favicons. Fetch each over the same public-https rule, hash, and store as a
   capture. Scripts are fetched and stored (they are part of what was served)
   but never referenced by the render companion.
2. The acquire response gains `subresources: [{url, sha256, bytes,
   content_type, fetched_at, status}]`, failures included honestly (a 404
   stylesheet is part of what the source served that day).
3. A render companion `snapshots/<name>.render.html` is produced: the primary
   HTML with subresource references rewritten to `about:capture#<sha256>`
   placeholders and scripts removed, plus `data/snapshot-manifest.json`
   mapping placeholder shas to captures. Derived, labeled, separately hashed.
4. The UI's viewer resolves placeholders: fetch each mapped capture via
   `op=capture`, verify, build blob URLs, rewrite, and render the whole thing
   in the existing sandboxed no-script frame. Every byte on screen remains
   verified against the record.
5. Grade stays B and the provenance says which subresources were fetched when.
   WACZ/Grade A remains out of a Worker's reach and is not claimed.

## Sizing

Parser is regex-plus-state (no DOM in a Worker), bounded depth 1, bounded
fanout, recorded when the cap truncates. Tests:
fixture pages with stylesheets, images, srcset, css url() chains, a hostile
`javascript:` and data: reference set (refused), and the truncation cap.
Release: 0.36.0, full suite, signed, deployed, byte-verified, audit clean.

**CORRECTED 2026-09-14 (M0-27). This section said "cap ~40 subresources", and the
appetite is TEN TIMES that.** `SUBRESOURCE_CAP` is **400** — read it rather than trust
this line:

    grep -n 'SUBRESOURCE_CAP = ' bio-plane/src/subresources.mjs

And the binding ceiling is **no longer a constant at all**: it is a calibrated
observation (`capture_limits`) with resumable sessions (`capture_sessions`) for what will
not fit in one invocation — both `CAPTURE-SCALING.md`'s work, neither anticipated here,
and that document is the authority on how much may be fetched. "Release: 0.36.0" dates
this section; the plane is at 0.58.0.
