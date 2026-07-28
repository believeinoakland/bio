# Capture fidelity for HTML sources (design, 2026-07-28; implementation is the
# next plane release)

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
fanout (cap ~40 subresources, recorded when the cap truncates). Tests:
fixture pages with stylesheets, images, srcset, css url() chains, a hostile
`javascript:` and data: reference set (refused), and the truncation cap.
Release: 0.36.0, full suite, signed, deployed, byte-verified, audit clean.
