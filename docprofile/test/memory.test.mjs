/* docprofile — a very large text stays bounded (R38; fix round 4, C5a/C5b/P8; K4467), at the module's interface.
 *
 * A text of BUDGET-2024-APP's size and shape (1,354 pages, 13.6 M characters, two-byte, `document` and `pages[]` both
 * supplied as the PDF reader gives them) is read in a process of its own (memory-child.mjs, `--expose-gc`); the measure
 * is heap + array buffers polled as fast as the worker thread that reads it answers, above what the caller holds. The types are stand-ins (this module holds
 * none, R36), one of which scans `ctx.pages`: what is measured is `readText`'s and `doctypeFor`'s own work. The real
 * types' share, with the real govinfo files, is `doctypes` R37's and measured there. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { registerStubs, stubItems, stubFallback } from "./stubs.mjs";
import * as dp from "../registry.mjs";

const CHILD = fileURLToPath(new URL("./memory-child.mjs", import.meta.url));
function child(args) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["--expose-gc", CHILD, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ code, out, err }));
  });
}

test("R38 readText over a 13.6 M character text adds under 16 MB, hands the type its pages, and answers as it did", { timeout: 300_000 }, async () => {
  const m = await child(["measure", "1354", "10042"]);
  assert.equal(m.code, 0, m.err.slice(0, 300));
  const r = JSON.parse(m.out);
  console.log(`R38: ${r.chars} characters, ${Math.round(r.ms)} ms, peak heap + array buffers above what the caller holds ${r.peakMB.toFixed(1)} MB`);
  assert.ok(r.chars > 13_000_000, `${r.chars} characters`);
  assert.ok(r.peakMB < 16, `peak ${r.peakMB.toFixed(1)} MB above what the caller holds`);
  const a = r.answers;
  assert.equal(a.determined, true);
  assert.equal(a.typeSawPages, true, "the type's detect was handed the supplied pages array itself");
  assert.equal(a.scanned, 1354);
  assert.equal(a.sawText, 1354 * 10042 + 1353, "and the text, beside them");
  assert.deepEqual([a.type, a.confidence, a.also, a.parsed, a.positionParts, a.textFrom],
                   ["scans_pages", "certain", [], { entities: [], facts: { pages: 1354 } }, 1354, "document"]);
});

/* The map `segmentsOver` earns over `document` is the one the joined comparison earned: the oracle below is the
 * specification of R22 and R23 stated as the join, and every shape here must agree with it. */
const oracle = (document, pages) => {
  const segs = []; let text = "";
  for (const p of pages) {
    const t = p && typeof p.text === "string" ? p.text : "";
    if (!t) continue;
    if (text.length) text += "\n";
    const start = text.length; text += t;
    if (p && Number.isInteger(p.page)) segs.push({ start, end: text.length, page: p.page });
  }
  return text === document ? segs : null;
};

test("R22 the segment map over document is exactly the join's: blank pages, pages without an index, near misses", () => {
  const P = (page, text) => ({ page, text });
  const shapes = [
    [P(0, "a"), P(1, ""), P(2, "bc"), P(3, "d")],
    [P(0, ""), P(1, "x"), P(2, "")],
    [P(0, "a"), { text: "b" }, P(2, "c")],
    [P(0, "a"), null, P(2, "c"), { page: 3 }],
    [P(0, "\n"), P(1, "a\n"), P(2, "\nb")],
    [P(0, "ab"), P(1, "ab")],
  ];
  for (const pages of shapes) {
    const full = pages.map((p) => (p && typeof p.text === "string" ? p.text : "")).filter(Boolean).join("\n");
    const docs = [full, full + "\n", full + "x", "\n" + full, full.slice(1), full.slice(0, -1), full.replace(/\n/, " "), "", "zz"];
    for (const d of docs) {
      if (!d.length) continue;
      const got = dp.flattenText({ document: d, pages });
      const want = oracle(d, pages);
      assert.deepEqual(got.segments, want ? want.map((s) => ({ start: s.start, end: s.end, source: { kind: "pdf-page", ref: `p.${s.page + 1}`, page: s.page, rect: null } })) : [], JSON.stringify([d, pages]));
      assert.equal(got.text, d);
      assert.equal(got.position_why === null, !!(want && want.length), JSON.stringify([d, pages]));
    }
  }
});

test("R38 the type is handed ctx.pages: the supplied pages, and none for a bare string or paragraphs", () => {
  const seen = [];
  const key = "r38_seen";
  dp.registerDoctype({ key, label: "r38", version: 1, contract: dp.CONTRACT.SUBSTANCE,
    detect(ctx) { seen.push(ctx.pages); return { match: false }; } });
  const pages = [{ page: 0, text: "one" }, { page: 1, text: "two" }];
  const given = (supplied) => { seen.length = 0; dp.readText(supplied, {}); assert.ok(seen.length >= 1); return seen[0]; };
  assert.equal(given({ pages }), pages);
  assert.equal(given({ document: "one\ntwo", pages }), pages);
  assert.deepEqual(given("one two"), []);
  assert.deepEqual(given({ paragraphs: [{ para: 0, text: "one" }] }), []);
  dp.registerDoctype({ key, label: "gone", version: 1, contract: dp.CONTRACT.SUBSTANCE, detect: () => ({ match: false }) });
});
