/* provenance: what the old suite `provenance-chain.test.mjs` (REC-54 / D-200) proved of the register's arms that the
   other module tests do not, carried to the module's interface: C-18.9's three chain findings in their own words and
   repairs, and its silence below `verified` (R46). The chain's reconstruction, the route mark and C-34 are
   `provenance-routes`' since N512, with the cases that drove them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { provDoc, infoMd } from "./fixture.mjs";
import { registerChecks } from "../../../src/provenance/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const cap = { path: "snapshots/a.txt", text: "bytes of a" };
/* The register's C-18.9 findings over one document, at `state`. */
const c189 = (doc, state = "verified") => {
  const md = infoMd("INFO-2026-0001-x", { state });
  return registerChecks({ files: new Map([["bundle.md", md], ["data/provenance.json", JSON.stringify({ documents: [doc] })],
                                          [cap.path, cap.text]]), fm: parseFrontmatter(md).data })
    .filter((x) => x.check === "C-18.9");
};
/* A document with no route recorded at all (the old suite's NO_EVIDENCE). */
const noEvidence = { file: cap.path, locator: "", authority_state: "undetermined",
                     authority_basis: "nothing was established; recorded 2026-08-05T00:00:00Z", capture: { grade: "C" } };

test("R46: C-18.9's absent, not-an-array and empty chain findings each say which fact it is, and the empty one's repair never assumes a route", () => {
  const good = provDoc(cap);
  const absent = c189(good), notArray = c189({ ...good, provenance_chain: null }), empty = c189({ ...good, provenance_chain: [] });
  for (const f of [absent, notArray, empty]) assert.equal(f.length, 1, JSON.stringify(f));
  const [a, n, e] = [absent[0], notArray[0], empty[0]];
  assert.equal(new Set([a.message, n.message, e.message]).size, 3, "the three no longer read alike");
  assert.match(a.message, /records no provenance_chain at all/);
  assert.match(n.message, /provenance_chain is null, not an array of hops: whatever wrote this did not write a chain/);
  assert.match(c189({ ...good, provenance_chain: "x" })[0].message, /provenance_chain is string, not an array of hops/);
  assert.match(e.message, /records an EMPTY provenance_chain/);
  assert.match(e.message, /different fact from never having recorded one and must not be repaired by assuming a route/);
  /* The repairs, each finding its own. */
  assert.deepEqual(a.repairs, ["record the chain of custody for this capture, one hop per party, from us back to the source",
    "or, where the capture record already holds the route, derive it from that evidence with op=provenancechain"]);
  assert.deepEqual(n.repairs, ["record the chain of custody as an array of hops, one per party, from us back to the source"]);
  assert.deepEqual(e.repairs, ["name the parties that actually served these bytes, one hop each",
    "or state plainly that the route is undetermined rather than leaving an empty chain standing at verified"]);
  assert.equal(e.repairs.some((r) => /undetermined/.test(r)), true, "the empty case's repair states undetermined");
  /* Nothing weakened beside it: an unattributed hop is still refused, a named one passes. */
  assert.match(c189({ ...good, provenance_chain: [{ asserts: "y", bound: false }] })[0].message, /names no attestor/);
  assert.deepEqual(c189({ ...good, provenance_chain: [{ who: "instance x", asserts: "y", bound: false, via: "direct" }] }), []);
});

test("R46: below verified, no chain, an empty chain and no route recorded at all each draw nothing", () => {
  const good = provDoc(cap);
  for (const doc of [good, { ...good, provenance_chain: [] }, { ...good, provenance_chain: null }, noEvidence])
    assert.deepEqual(c189(doc, "collected"), [], JSON.stringify(doc));
  /* The same documents at verified are each found, so the silence is the fence's, not a check that finds nothing. */
  for (const doc of [good, { ...good, provenance_chain: [] }, { ...good, provenance_chain: null }, noEvidence])
    assert.equal(c189(doc, "verified").some((x) => /provenance_chain/.test(x.message)), true, JSON.stringify(doc));
});
