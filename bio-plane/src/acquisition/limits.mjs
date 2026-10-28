/* acquisition — R135 (T53; N1269; K5446, K5453 point 2; FILES): THE LIMITS THE ADD SCREEN SHOWS, per kind of file, the one limit the copy enforces.
 *
 * `limitsByKind()` answers each kind's figure by the same call the refusal makes (`boundOf`, `READ_BOUNDS`), so the figure shown and the figure enforced
 * cannot differ: there is no second figure here and no `standard` field. A kind that cannot be read in the request is told it will be read in the
 * background (`how_long`), as the large fetch's own ceiling decides (R105). Pure; never throws. */
import { boundOf } from "../read-bounds.mjs";
import { LARGE_FETCH_BYTES } from "./index.mjs";

/* the add screen's kinds, each with the `READ_BOUNDS` rows that state its limit: [field, row kind, row name] */
const KINDS = Object.freeze([
  Object.freeze({ kind: "document", rows: Object.freeze([["bytes", "document", "bytes"], ["pages", "document", "pages"]]) }),
  Object.freeze({ kind: "sheet", rows: Object.freeze([["bytes", "spreadsheet", "bytes"], ["rows", "spreadsheet", "rows"]]) }),
  Object.freeze({ kind: "image", rows: Object.freeze([["bytes", "image", "bytes"]]) }),
  Object.freeze({ kind: "archive", rows: Object.freeze([["bytes", "archive", "uploaded_bytes"]]) }),
]);

/** R135: `{kinds: [{kind, bytes, pages?, rows?, reads: "whole", how_long}]}`; `how_long` is `background` for a kind whose file can exceed what a request reads in
 *  the call (`LARGE_FETCH_BYTES`), else `now`. `read` (default `boundOf`) is the one reader of a figure, for a test that changes a bound. */
export function limitsByKind({ read = boundOf } = {}) {
  try {
    return { kinds: KINDS.map(({ kind, rows }) => {
      const out = { kind };
      for (const [field, k, n] of rows) out[field] = read(k, n);
      out.reads = "whole";
      out.how_long = out.bytes > LARGE_FETCH_BYTES ? "background" : "now";
      return out;
    }) };
  } catch { return { kinds: [] }; }
}
