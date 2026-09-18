/* FW-19's OVER-STRICTNESS INSTRUMENT for REC-85's three arms (sheet-cell,
 * doc-para, slide-shape) — the arms FW-19 must NOT move. Not a suite (no
 * `.test.mjs` suffix, so the battery does not collect it);
 * `fw19-extent-arms.test.mjs` imports the sweep and asserts the digest, which is
 * what makes the pin a gate. `rec85-arm-digest.mjs` is the same instrument for
 * REC-82's two arms, and this follows its shape.
 *
 * THE PIN WAS TAKEN ON THE PRISTINE BASE: this sweep run against
 * `bio-checks.mjs` as it stood at `92f4c64e` (before any FW-19 edit), imported
 * from a copy written out of `git show 92f4c64e:bio-plane/checks/bio-checks.mjs`
 * — the file imports nothing, so the copy is the whole subject. To re-take it:
 * `node test/fw19-rec85-digest.mjs <path-to-a-bio-checks.mjs>` from `bio-plane/`.
 *
 * WHAT IT SWEEPS: canonical form, derived human form, content address and the
 * checker's verdict (code, check, detail) under five contexts — bare, a chain,
 * a chain with a container extent, the catalogue's document-only context, and a
 * container with no chain. It deliberately does NOT sweep the three FW-19
 * kinds, whose behaviour is SUPPOSED to be new. */
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const sha = (v) => createHash("sha256").update(v).digest("hex");

export function rec85Sweep(m) {
  const CHAIN = [{ step: "layer", extent: { kind: "all" } }];
  const CONTAINER = { sheets: [{ name: "S", rows: 10, cols: 5 }], paragraphs: 4,
                      slides: [{ shapes: 2 }, { shapes: null }] };
  const CTX = [{}, { chain: CHAIN }, { chain: CHAIN, container: CONTAINER },
               { known: false, chain: null, pageCount: null }, { chain: null, container: CONTAINER }];
  const EXT = [
    { kind: "sheet-cell", sheet: "S", cell: "b3" }, { kind: "sheet-cell", sheet: "S", cell: "$E$10" },
    { kind: "sheet-cell", sheet: "S", cell: "F1" }, { kind: "sheet-cell", sheet: "T", cell: "A1" },
    { kind: "sheet-cell", sheet: "S", cell: "A11" }, { kind: "sheet-cell", sheet: "", cell: "A1" },
    { kind: "doc-para", para: 0 }, { kind: "doc-para", para: 3, run: 2 }, { kind: "doc-para", para: 4 },
    { kind: "doc-para", para: -1 }, { kind: "doc-para", para: 1, run: "x" },
    { kind: "slide-shape", slide: 1 }, { kind: "slide-shape", slide: 1, shape: 1 },
    { kind: "slide-shape", slide: 1, shape: 2 }, { kind: "slide-shape", slide: 2, shape: 99 },
    { kind: "slide-shape", slide: 3 }, { kind: "slide-shape", slide: 0 },
    { kind: "sheet-cell", sheet: "S", cell: "B3", ref: "an authored ref" },
  ];
  const rows = [];
  for (const e of EXT) {
    rows.push(["canon", m.canonicalExtent(e)], ["human", m.describeExtent(e)],
              ["id", m.contentIdFor("cap", e, CHAIN)]);
    for (const c of CTX) {
      const v = m.checkContentExtent(e, c);
      rows.push(["verdict", v ? [v.code, v.check, v.detail] : null]);
    }
  }
  return { n: rows.length, digest: sha(JSON.stringify(rows)) };
}

if (process.argv[1] && process.argv[1].endsWith("fw19-rec85-digest.mjs")) {
  const target = process.argv[2] || new URL("../checks/bio-checks.mjs", import.meta.url).pathname;
  const m = await import(pathToFileURL(target).href);
  console.log(JSON.stringify(rec85Sweep(m)));
}
