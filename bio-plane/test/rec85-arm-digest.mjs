/* REC-85's OVER-STRICTNESS INSTRUMENT, and it exists because the arm it serves
 * cannot be run any other way.
 *
 * The item's declared over-strictness control is "`pdf-page` and `document`
 * behaviour BYTE-IDENTICAL to REC-82's landing". A hand-written list of
 * expected strings would agree with its author for free — this repository has
 * measured that five times — so the pin is a DIGEST taken over a SWEEP of the
 * two untouched arms, computed on a PRISTINE `origin/main` worktree and then
 * recomputed on the item's tree. REC-83's §7 took the same shape.
 *
 * WHAT IT SWEEPS, stated so a reader can tell what it can and cannot see: every
 * `document` and `pdf-page` input this grammar distinguishes — the canonical
 * form, the derived human form, the content address, and the checker's verdict
 * (code and detail) under six contexts (no context, a chain, a chain with a
 * page set, an authored ref, an inverted rect, a malformed rect). It CANNOT see
 * the store's own resolution of a capture, which is measured through the op in
 * the suite instead; and it deliberately does NOT sweep the three new arms,
 * whose behaviour is SUPPOSED to change.
 *
 * Run: `node test/rec85-arm-digest.mjs` from `bio-plane/`. Prints the sweep size
 * and one sha256. It is not a suite and the battery does not collect it (it
 * carries no `.test.mjs` suffix); `content-extent-arms.test.mjs` imports the
 * sweep builder and asserts the digest, which is what makes the pin a gate. */
import { createHash } from "node:crypto";
import { canonicalExtent, describeExtent, checkContentExtent,
         contentIdFor } from "../checks/bio-checks.mjs";

const CHAIN = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
               { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
                 confidence: { basis: "none" },
                 extent: { kind: "pages", pages: [0, 1, 2] } }];

/* SIX CONTEXTS, and they are the ones that make the two arms answer DIFFERENTLY
   rather than six spellings of one. `container` is present in two of them on
   purpose: REC-85 added that key, and the pin has to show that adding it moved
   NOTHING on these two arms. */
const CONTEXTS = [
  ["bare", {}],
  ["chain", { chain: CHAIN, pageCount: null }],
  ["chain+pages", { chain: CHAIN, pageCount: 3 }],
  ["nochain+pages", { chain: null, pageCount: 3 }],
  ["chain+pages+container", { chain: CHAIN, pageCount: 3,
                              container: { sheets: [{ name: "S", rows: 2, cols: 2 }],
                                           paragraphs: 2, slides: [{ shapes: 1 }] } }],
  ["chain+container-only", { chain: CHAIN, pageCount: null,
                             container: { sheets: null, paragraphs: 4, slides: null } }],
];

const EXTENTS = [
  ["document", { kind: "document" }],
  ["document+ref", { kind: "document", ref: "the whole thing" }],
  ["page0", { kind: "pdf-page", page: 0 }],
  ["page2", { kind: "pdf-page", page: 2 }],
  ["page3-oob", { kind: "pdf-page", page: 3 }],
  ["page0+rect", { kind: "pdf-page", page: 0, rect: [10, 20, 100, 200] }],
  ["page0+inverted-rect", { kind: "pdf-page", page: 0, rect: [100, 200, 10, 20] }],
  ["page0+badrect", { kind: "pdf-page", page: 0, rect: [1, 2, 3] }],
  ["page0+nanrect", { kind: "pdf-page", page: 0, rect: [1, 2, 3, NaN] }],
  ["page0+ref", { kind: "pdf-page", page: 0, ref: "page 1, top half" }],
  ["page-string", { kind: "pdf-page", page: "two" }],
  ["page-negative", { kind: "pdf-page", page: -1 }],
  ["page-missing", { kind: "pdf-page" }],
];

/** The sweep as ONE array of strings, ordered, so the digest is a function of
 *  the behaviour and not of an object's key order. */
export function pdfPageAndDocumentSweep() {
  const rows = [];
  for (const [ename, extent] of EXTENTS) {
    rows.push(`${ename}\tcanon\t${canonicalExtent(extent)}`);
    rows.push(`${ename}\tsays\t${describeExtent(extent)}`);
    /* The ADDRESS over two chains and no chain: the id is hash(capture, canonical
       extent, chain), so a change in any of the three shows here. */
    rows.push(`${ename}\tid-nochain\t${contentIdFor("cap-sha", extent, null)}`);
    rows.push(`${ename}\tid-chain\t${contentIdFor("cap-sha", extent, CHAIN)}`);
    for (const [cname, ctx] of CONTEXTS) {
      const bad = checkContentExtent(extent, ctx);
      rows.push(`${ename}\t${cname}\t${bad ? `${bad.code}|${bad.check}|${bad.detail}` : "OK"}`);
    }
  }
  return rows;
}

export function sweepDigest() {
  const rows = pdfPageAndDocumentSweep();
  return { rows: rows.length,
           digest: createHash("sha256").update(rows.join("\n")).digest("hex") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { rows, digest } = sweepDigest();
  console.log(`rows ${rows}`);
  console.log(`sha256 ${digest}`);
}
