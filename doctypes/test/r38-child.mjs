/* R38's measurements, each in a process of its own so its memory is its alone. Run by bounded.test.mjs as
 *   node [--expose-gc --max-old-space-size=N --max-semi-space-size=2] r38-child.mjs <mode> <kind>
 *   base <kind>    the heap with the text of <kind> held (what the caller holds): {baseMB}
 *   parse <kind>   the parse of the type <kind> names over that text, after its detect has recognised it: {ok, digest}
 * <kind> is `policy`, `regulation` or `code`: a text of 13.6 million characters made of the fixtures' own documents
 * repeated, so the types meet their own headers, outlines, tables, definitions and exceptions at that size. */
import { DOCTYPES } from "../index.mjs";
import { flattenText, makeLocator } from "../../docprofile/readtext.mjs";
import { largeText, KINDS, TYPE_OF } from "./r38-texts.mjs";
import { HELD } from "./fixtures.mjs";
import { sha } from "./r37-readings.mjs";

const [mode, kind] = process.argv.slice(2);
if (!KINDS.includes(kind)) throw new Error(`kind: ${kind}`);
const mb = () => process.memoryUsage().heapUsed / 1048576;
const settle = () => { if (global.gc) { global.gc(); global.gc(); } };

const text = largeText(kind);
settle();
if (mode === "base") {
  console.log(JSON.stringify({ baseMB: mb(), chars: text.length }));
} else if (mode === "parse") {
  const type = DOCTYPES.find((t) => t.key === TYPE_OF[kind]);
  const ctx = { view: HELD, text };
  const d = type.detect(ctx);
  if (!d.match) throw new Error(`${kind}: not recognised as ${type.key}: ${JSON.stringify(d)}`);
  const parsed = type.parse({ ...ctx, locate: (o) => ({ at: o }), alsoSatisfies: () => [] });
  console.log(JSON.stringify({ ok: true, chars: text.length, digest: sha(parsed) }));
} else if (mode === "digest") {
  /* the same parse with no memory bound, for `make-r38-answers.mjs` */
  const type = DOCTYPES.find((t) => t.key === TYPE_OF[kind]);
  const parsed = type.parse({ view: HELD, text, locate: (o) => ({ at: o }), alsoSatisfies: () => [] });
  console.log(JSON.stringify({ digest: sha(parsed) }));
}
