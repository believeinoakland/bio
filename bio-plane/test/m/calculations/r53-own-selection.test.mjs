/* calculations R53: a selection a member made is usable by her. The door stamps a selection's owner with the session's
   identity and the calculation's actor with the session's viewer; the calculation asks `retrieval` as the owner stamped. */
import test from "node:test";
import assert from "node:assert/strict";
import { calculationsOps } from "../../../src/calculations/index.mjs";
import { seeded, V, R } from "./fixture.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2025-04-01", to: "2027-03-31" };
const COUNT = R([{ op: "count", from: "held", as: "n" }], "n", [{ name: "held", kind: "table" }]);
const IDENTITY = (id) => `identity:${id}`;
const url = (stamps) => new URL("http://do/x?" + new URLSearchParams(stamps));
const body = (set) => ({ question: "How many are held?", period: PERIOD, kind: "count", inputs: [{ name: "held", set }], recipe: COUNT });

async function held() {
  const w = seeded();
  const docs = ["one", "two"].map((x) => w.document(x, { title: `Wombat ${x}` }).bundleId);
  /* the door's `select` stamps the owner as the session's identity, not its viewer */
  const s = await w.retrieval.selectionCreate({ owner: IDENTITY("bob"), viewer: V("bob"), ids: docs });
  assert.equal(s.ok, true);
  return { w, handle: s.handle };
}

test("R53 a count over the selection the member made: the door's owner stamp lets create resolve it, and read opens the calculation", async () => {
  const { w, handle } = await held();
  const made = await calculationsOps(w.c, url({ viewer: V("bob"), owner: IDENTITY("bob") }), body(handle)).calculationcreate();
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
  assert.equal(made.results.output.value, "2");
  const read = await calculationsOps(w.c, url({ viewer: V("bob"), id: made.calc_id }), {}).calculation();
  assert.equal(read.ok, true);
  const ev = await calculationsOps(w.c, url({ viewer: V("bob"), owner: IDENTITY("bob") }), body(handle)).calculationevaluate();
  assert.equal(ev.results.output.value, "2");
});

test("R53 another member asking with the maker's handle is still SELECTION_NOT_YOURS (retrieval R19)", async () => {
  const { w, handle } = await held();
  const r = await calculationsOps(w.c, url({ viewer: V("carol"), owner: IDENTITY("carol") }), body(handle)).calculationcreate();
  assert.equal(code(r), "SELECTION_NOT_YOURS");
  assert.equal(r.input, "held");
});

test("R53 an owner the caller names in the body is not taken: the door's stamp is the only owner", async () => {
  const { w, handle } = await held();
  const r = await calculationsOps(w.c, url({ viewer: V("carol"), owner: IDENTITY("carol") }), { ...body(handle), owner: IDENTITY("bob") }).calculationcreate();
  assert.equal(code(r), "SELECTION_NOT_YOURS");
});
