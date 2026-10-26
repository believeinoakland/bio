/* citation R22 (K5157; walk-T51-final 06 §3): a question already resting on a document is cited again only under a
   different part; the same part (or the whole document again) is alreadyCited, whatever the role. At the module's
   interface, over a passage the real `retrieval.findIn` found and a part named beside a selection. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const DOC = "INFO-2026-0001", Q = "INQ-2026-0001";

function setup() {
  const w = world();
  const cap = w.info(DOC);
  const [match] = w.find(DOC, "budget", { pages: { [cap]: ["Nothing here.", "The budget line is set."] } });
  w.inquiry(Q);
  return { w, match };
}
const legs = (w) => (w.fm(Q).basis ?? []).map((l) => [l.target, l.role, l.extent_page ?? null]);
const page = (w, n, more = {}) => w.select([DOC]).then((handle) =>
  w.cit.cite({ project: Q, handle, ...ANN, role: "supports", extent: { extent_kind: "pdf-page", extent_page: String(n) }, ...more }));

test("R22: a different part of a document the question rests on is a new leg, found beside named; the same part again is alreadyCited", async () => {
  const { w, match } = setup();
  const first = w.cit.cite({ project: Q, found: match, ...ANN, role: "supports" });
  assert.deepEqual([first.ok, first.cited], [true, [DOC]]);
  const second = await page(w, 7);
  assert.deepEqual([second.ok, second.cited, second.alreadyCited], [true, [DOC], []], JSON.stringify(second).slice(0, 300));
  assert.deepEqual(legs(w), [[DOC, "supports", 1], [DOC, "supports", 7]]);
  assert.equal(w.fm(Q).references.filter((r) => r.target === DOC).length, 1, "the document is referenced once");
  /* controls: the same page again, in either door, writes nothing */
  const before = w.md(Q);
  const again = await page(w, 7);
  assert.deepEqual([again.ok, again.cited, again.alreadyCited], [true, [], [DOC]]);
  const foundAgain = w.cit.cite({ project: Q, found: match, ...ANN, role: "supports" });
  assert.deepEqual([foundAgain.cited, foundAgain.alreadyCited], [[], [DOC]]);
  assert.equal(w.md(Q), before);
});

test("R22, controls: a differing role on the same part is alreadyCited; the whole document twice is alreadyCited", async () => {
  const { w } = setup();
  assert.equal((await page(w, 3)).ok, true);
  const role = await page(w, 3, { role: "cuts_against" });
  assert.deepEqual([role.cited, role.alreadyCited], [[], [DOC]]);
  const h = () => w.select([DOC]);
  assert.deepEqual(w.cit.cite({ project: Q, handle: await h(), ...ANN, role: "supports" }).cited, [DOC], "the whole document is a part of its own");
  const whole = w.cit.cite({ project: Q, handle: await h(), ...ANN, role: "supports" });
  assert.deepEqual([whole.cited, whole.alreadyCited], [[], [DOC]]);
  assert.equal(legs(w).length, 2);
});
