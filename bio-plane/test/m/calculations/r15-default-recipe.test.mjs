/* calculations: R4 (K5131): a built-in kind composes its default recipe when the screen sends none. The screen's body is
   {question, period, kind, inputs: [{name, table}]} (+ column, part); the table is held by the real acts. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";

const PERIOD = { from: "2026-01-01", to: "2026-12-31" };
const FIELDS = [{ name: "dept", type: "string" }, { name: "amount", type: "number" }];
const CSV = "dept,amount\nparks,100\nparks,50\nroads,200\nparks,25\nroads,25\n";
const code = (r) => (r && r.ok === false ? r.reason : "ok");

async function world() {
  const w = seeded();
  const t = await w.table(CSV, FIELDS);
  const send = (kind, extra = {}) => w.c.create({ question: "How many?", period: PERIOD, kind, inputs: [{ name: "input", table: t.sha }], by: V("bob"), ...extra });
  return { w, t, send };
}

test("R4 with no recipe, count is the table's row count and total is the sum of the stated column, over a table made by real acts", async () => {
  const { w, send } = await world();
  const c = await send("count");
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.results.output.value, "5");
  const t = await send("total", { column: "amount" });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  assert.equal(t.results.output.value, "400");
  assert.equal(w.count("calculations"), 2);
  const ev = await w.c.evaluate({ question: "x", period: PERIOD, kind: "total", inputs: [{ name: "input", table: (await world()).t.sha }], column: "amount", viewer: V("bob") });
  assert.equal(ev.ok, true, JSON.stringify(ev).slice(0, 300));
});

test("R4 with no recipe, total without a column is refused NO_COLUMN naming it, a column the table lacks NO_SUCH_COLUMN, writing nothing", async () => {
  const { w, send } = await world();
  const r = await send("total");
  assert.equal(code(r), "NO_COLUMN");
  assert.equal(r.field, "column");
  assert.equal(code(await send("share")), "NO_COLUMN");
  assert.equal(code(await send("total", { column: "nope" })), "NO_SUCH_COLUMN");
  assert.equal(w.count("calculations"), 0);
});

test("R4 with no recipe, share, ratio and difference are over the rows whose column is the stated part and the rest; a part not stated is refused NO_PART naming it", async () => {
  const { w, send } = await world();
  const s = await send("share", { column: "dept", part: "parks" });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  assert.equal(s.results.output.numerator.value, "3");
  assert.equal(s.results.output.denominator.value, "5");
  const r = await send("ratio", { column: "dept", part: "parks" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.results.output.numerator.value, "3");
  assert.equal(r.results.output.denominator.value, "2");
  const d = await send("difference", { column: "dept", part: "parks" });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.equal(d.results.output.value, "1");
  for (const kind of ["share", "ratio", "difference"]) {
    const x = await send(kind, { column: "dept" });
    assert.equal(code(x), "NO_PART", kind);
    assert.equal(x.field, "part");
  }
  assert.equal(w.count("calculations"), 3);
});

test("R4 a recipe given is run as before, and a kind that composes none with a non-table input is refused KIND_INPUTS", async () => {
  const { w, t } = await world();
  const given = await w.c.create({ question: "q", period: PERIOD, kind: "count", inputs: [{ name: "t", table: t.sha }],
    recipe: { method: "bio-calc/1", inputs: [{ name: "t", kind: "table" }], steps: [{ op: "count", from: "t", as: "n" }], output: "n" }, by: V("bob") });
  assert.equal(given.ok, true);
  const fig = await w.c.create({ question: "q", period: PERIOD, kind: "count", inputs: [{ name: "x", value: "5" }], by: V("bob") });
  assert.equal(code(fig), "KIND_INPUTS");
});
