/* T3 (legacy-tests; promotion R12): `created` and `last_updated` are read from the document, and an envelope that
   contradicts the document is refused `ENVELOPE_DATES_DISAGREE`. The old battery's harnesses sent fixed envelope
   dates over documents stating others; they now send the document's own where it states them. */

/** The value of `key` in `md`'s frontmatter (quotes stripped), or `undefined` when the frontmatter does not state it. */
export const docDate = (md, key) =>
  (new RegExp(`^${key}:[ \\t]*"?([^"\\n]+?)"?[ \\t]*$`, "m").exec(String(md ?? "").split(/\n---\n/)[0]) || [])[1];
