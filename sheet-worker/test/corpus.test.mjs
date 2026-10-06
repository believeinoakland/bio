/* R15: the engine on corpus workbooks (build/plan/measures-T33/courts-workbooks.md §3), the City of Oakland's public
 * workbooks from its `cao-94612` bucket, held against each file's own cached values: numbers to a relative 1e-9,
 * everything else exactly. Each fixture states every disagreement it has and why; nothing else may disagree. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { agrees, cachedFormulaValues } from "./cached.mjs";
import { fixture, makeMember, realEngine, recomputeVia } from "./helpers.mjs";
import { NOT_RECOMPUTED } from "../src/contract.mjs";

const member = () => makeMember(realEngine());

async function compare(name) {
  const bytes = fixture(name);
  const { body } = await recomputeVia(member(), bytes);
  assert.equal(body.ok, true, `${name}: ${body.reason} ${body.why}`);
  const cached = cachedFormulaValues(bytes);
  const disagree = [];
  let compared = 0;
  for (const c of body.cells) {
    const want = cached.get(c.source.ref);
    if (!want) continue;
    compared++;
    if (!agrees(c, want)) disagree.push({ c, want });
  }
  return { body, compared, disagree };
}

for (const [name, cells] of [["corpus-program-budget.xlsx", 62], ["corpus-redistricting-evaluation.xlsx", 329],
  ["corpus-city-workbook.xlsx", 138], ["corpus-site-list.xlsx", 156]]) {
  test(`R15: ${name} (no external links) agrees whole: every recomputed value equals the cached one`, async () => {
    const { compared, disagree, body } = await compare(name);
    assert.equal(compared, cells);
    assert.equal(body.counts.formula_cells >= cells, true);
    assert.deepEqual(disagree.map((d) => d.c.source.ref), []);
  });
}

test("R15: an @ range (2024 NOFA workbook): every disagreement is an error marked implicit_intersection, never a different number", async () => {
  const { disagree } = await compare("corpus-nofa-implicit-intersection.xlsx");
  assert.ok(disagree.length > 300);
  for (const { c } of disagree) {
    assert.equal(c.type, "error", c.source.ref);
    assert.equal(c.cause, "implicit_intersection", c.source.ref);
    assert.equal(c.not_recomputed, NOT_RECOMPUTED);
  }
});

test("R15: a circular workbook built to iterate (Zoning Fees): every disagreement is #CIRC! marked circular", async () => {
  const { disagree } = await compare("corpus-zoning-fees-iterating.xlsx");
  assert.equal(disagree.length, 312);
  for (const { c } of disagree) assert.deepEqual([c.error, c.cause], ["#CIRC!", "circular"], c.source.ref);
});

test("R15: HYPERLINK (Efficacy and Equity assessment): the engine at this commit holds it; the one disagreement is a link over 255 characters, which the file cached as #VALUE!", async () => {
  const { body, disagree } = await compare("corpus-hyperlink.xlsx");
  const links = body.cells.filter((c) => /^=HYPERLINK\(/i.test(c.formula));
  assert.ok(links.length > 50);
  for (const c of links) { assert.equal(c.type, "text", c.source.ref); assert.equal(c.cause, undefined); }
  assert.equal(disagree.length, 1);
  const [{ c, want }] = disagree;
  assert.deepEqual(want, { type: "error", value: "#VALUE!" });
  /* its link location is two string pieces joined with &, together over 255 characters */
  const location = /^=HYPERLINK\((".*?"(?:&".*?")*),"/.exec(c.formula)[1].split("\"&\"").join("").slice(1, -1);
  assert.ok(location.length > 255, `the link location is ${location.length} characters`);
});

test("R15: a workbook with an external link (2018 APR addendum) is refused EXTERNAL_LINKS before the engine loads it", async () => {
  const { body } = await recomputeVia(member(), fixture("corpus-external-link.xlsx"));
  assert.deepEqual([body.ok, body.reason, body.not_recomputed], [false, "EXTERNAL_LINKS", NOT_RECOMPUTED]);
  assert.ok(body.links > 0);
});
