/* retrieval R98: a page of any limit up to the clamp names every hit's document within the plane's 100-variable bound
   (D-36). The fixture's database refuses a statement binding more. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

function levies(n) {
  const w = world();
  for (let i = 0; i < n; i++) w.doc(`INFO-${i}`, { source_status: "live", title: `Levy ${i}` }, { files: [{ path: "n.md", text: "levy notes" }] });
  return w;
}

for (const limit of [100, 101, 150, 500]) {
  test(`R98: search over 150 documents at limit ${limit} answers every hit of the page with its document, no statement past 100 variables`, () => {
    const w = levies(150);
    const s = w.retrieval.search({ q: "title:Levy", viewer: V("vera"), limit });
    assert.equal(s.ok === false, false, JSON.stringify(s).slice(0, 200));
    assert.equal(s.total, 150);
    assert.equal(s.hits.length, Math.min(limit, 150));
    for (const h of s.hits) assert.match(h.document.title, /^Levy \d+$/);
  });
}
