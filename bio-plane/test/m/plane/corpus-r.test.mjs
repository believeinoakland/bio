/* plane CORPUS R (fix round 9 plan section 7 item 3; K4785 (3), K4798; G123d): the corpus R set's runner. `pdfgen`, `imggen`, `sheetgen` and `docgen` through the shape runner (`shape/harness.mjs`), 16 seeded
   variations (8 fixed seeds, 8 derived from the tranche commit: `corpus-r-cases.mjs`), 64 cases, one child process each, run one at a time. Each case asserts the file is READ WHOLE within its bound or
   REFUSED with its size and its limit (`judge`). A red is a product finding (P10), recorded with the seed and the commit, never made green by changing the case.
   RUN (heavy, alone):  node --import ./test/platform-sqlite.mjs --test test/m/plane/corpus-r.test.mjs
   NARROW:  CORPUS_R_ONLY=pdf,sheet@3  (generator names and `generator@n` ids, comma separated);  BIO_TRANCHE_COMMIT=<sha> fixes the derived seeds;  BIO_FIXTURE_CACHE=<dir> keeps the generated files. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { shapeRun, capFor, report } from "./shape/harness.mjs";
import { cases, fileOf, docOf, judge, trancheCommit, variations } from "./corpus-r-cases.mjs";

const commit = trancheCommit();
const only = (process.env.CORPUS_R_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const wanted = (c) => !only.length || only.includes(c.generator) || only.includes(c.id);

test("CORPUS R: 16 seeded variations, 8 fixed and 8 derived from the tranche commit", () => {
  const v = variations(commit);
  assert.equal(v.length, 16);
  assert.equal(v.filter((x) => x.kind === "fixed").length, 8);
  assert.equal(v.filter((x) => x.kind === "derived").length, 8);
  assert.equal(new Set(v.map((x) => x.seed)).size, 16, "no two variations share a seed");
  assert.equal(cases(commit).length, 64, "four generators at 16 variations");
});

for (const c of cases(commit).filter(wanted)) {
  test(`CORPUS R ${c.id} (${c.variation.kind} seed ${c.variation.seed}, commit ${commit.slice(0, 10)}): ${c.generator} ${c.recipe.kind} is read whole within its bound or refused with its size and limit`, { timeout: 900_000 }, async () => {
    const f = await fileOf(c);
    const r = await shapeRun({ doc: docOf(f), maxTicks: 120, pageAll: false }, { capMB: capFor(f.bytes / 1048576) });
    console.log(report(`${c.id} ${JSON.stringify(c.recipe)} -> ${f.name} ${f.bytes} B`, r));
    assert.deepEqual(judge(r, f, { picture: c.generator === "image" }), [], `${c.id}: ${JSON.stringify(c.recipe)}, ${f.bytes} B`);
  });
}
