/* calculations R52: a held selection (retrieval's handle) is a `set` input, frozen as R21 freezes a query's ids. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, R, saved } from "./fixture.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2025-04-01", to: "2027-03-31" };
const COUNT = R([{ op: "count", from: "held", as: "n" }], "n", [{ name: "held", kind: "table" }]);
const ask = (w, set, by = V("bob")) => w.c.create({ question: "How many are held?", period: PERIOD, kind: "count", inputs: [{ name: "held", set }], recipe: COUNT, by });

async function held() {
  const w = seeded();
  const docs = ["one", "two"].map((x) => w.document(x, { title: `Wombat ${x}` }).bundleId);
  w.document("three", { title: "Numbat three" });
  const s = await w.retrieval.selectionCreate({ owner: V("bob"), viewer: V("bob"), ids: docs });
  assert.equal(s.ok, true, "retrieval's real selection is made");
  return { w, docs, handle: s.handle };
}

test("R52 a held selection is a set input: create with {name: 'held', set: <handle>} counts the two held documents and read names the frozen set's sha, the one freezeSet gives the same ids", async () => {
  const { w, docs, handle } = await held();
  const c = await ask(w, handle);
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.results.output.value, "2");
  const frozen = await w.c.freezeSet({ query: saved("wombat"), by: V("bob") });
  assert.deepEqual(frozen.ids, [...docs].sort(), "the same two ids");
  assert.equal(frozen.already, true, "create froze the selection's ids as a record set with the query's sha");
  const r = await w.c.read({ calcId: c.calc_id, viewer: V("bob") });
  assert.equal(r.calculation.inputs[0].sha, frozen.set, "read names the frozen set's sha");
  assert.equal(r.calculation.inputs[0].set, frozen.set, "the stored input names the frozen set, not a handle that expires");
  /* reproducible from the frozen set: the selection released, the calculation still recomputes */
  assert.equal((await w.retrieval.selectionRelease({ handle, owner: V("bob") })).ok, true);
  assert.equal((await w.c.recompute({ calcId: c.calc_id })).agrees, true);
  /* control: a frozen set's sha binds as before */
  assert.equal((await ask(w, frozen.set)).results.output.value, "2");
});

test("R52 evaluate resolves a held selection and writes nothing: no record set is frozen", async () => {
  const { w, handle } = await held();
  const e = await w.c.evaluate({ inputs: [{ name: "held", set: handle }], recipe: COUNT, viewer: V("bob") });
  assert.equal(e.ok, true);
  assert.equal(e.results.output.value, "2");
  assert.equal((await w.c.freezeSet({ query: saved("wombat"), by: V("bob") })).already, undefined, "nothing was frozen by evaluate");
});

test("R52 a handle that does not resolve is refused as retrieval R19 answers it, naming the input: another member's SELECTION_NOT_YOURS, a released or unknown one NO_SUCH_SELECTION; nothing is written", async () => {
  const { w, handle } = await held();
  const notYours = await ask(w, handle, V("carol"));
  assert.equal(code(notYours), "SELECTION_NOT_YOURS");
  assert.equal(notYours.input, "held");
  assert.match(notYours.detail, /held/);
  assert.equal(code(await ask(w, "sel-unknown-handle")), "NO_SUCH_SELECTION");
  assert.equal((await w.retrieval.selectionRelease({ handle, owner: V("bob") })).ok, true);
  const released = await ask(w, handle);
  assert.equal(code(released), "NO_SUCH_SELECTION");
  assert.equal(released.input, "held");
  assert.equal((await w.c.freezeSet({ query: saved("wombat"), by: V("bob") })).already, undefined, "nothing was frozen by a refused create");
  /* control: a set sha that is not held is still NO_SUCH_INPUT */
  assert.equal(code(await ask(w, "0".repeat(64))), "NO_SUCH_INPUT");
});
