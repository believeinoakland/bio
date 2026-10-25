/* screens-investigate R5 (T51 fix round 10; K5131, item 59; WALK-FINAL-09 R83): the "Work it out" form over `store-request`'s world: it asks the column (and the
   part) the chosen kind needs, from the held table's own columns, and sends them, so a total and a share are worked out and a count still is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled } from "./world.mjs";
import { fill, press, main, word, hasWord } from "./fixtures.mjs";

const REASON = "Counted from the register.";
const NEW_KEYS = ["screen.calculation.column", "screen.calculation.column.help", "screen.calculation.part", "screen.calculation.part.help"];
for (const key of NEW_KEYS) if (!hasWord(key)) test.todo(`K5173: ${key} is a word the table holds (hasWord)`);

/** A project, a payments register the member holds, the table she declares from it (real `tabledeclare`) and a calculation she has made to stand on. */
async function register(world, me) {
  const project = await world.recipes.project(me, "Repairs");
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\nFund,Acme,9\n", project);
  const header = ["payer", "payee", "amount"];
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header,
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const first = (await me.act("calculationcreate", { body: { question: "How many payments?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project, inputs: [{ name: "input", table }] } })).calc_id;
  return { project, csv, table, first };
}

test("R5 item 59 Calculation: the form offers the held table's own columns for a total and a share, asks the part for a share, sends them, and a CALC page opens with the answer the plane worked out", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  fill(p, { "calc-q": "What was paid in total?", "calc-from": "2025-07-01", "calc-to": "2026-06-30", "calc-kind": "total", "calc-input": R.table });
  p.fire(p.doc.getElementById("calc-kind"), "change");
  p.fire(p.doc.getElementById("calc-input"), "input");
  await settled(p);
  const col = p.doc.getElementById("calc-column");
  assert.ok(col && /select/i.test(col.tagName), "the column is chosen");
  assert.deepEqual(col.querySelectorAll("option").map((o) => o.getAttribute("value")).filter(Boolean), ["payer", "payee", "amount"], "among the held table's own columns");
  assert.equal(p.doc.getElementById("calc-part"), null, "a total asks no part");
  fill(p, { "calc-column": "amount" });
  await press(p, "calculationcreate", { reason: REASON });
  await settled(p);
  const total = p.byOp("calculationcreate");
  assert.equal(total.length, 1);
  assert.equal(total[0].body.column, "amount");
  assert.equal(total[0].body.part, undefined);
  assert.match(p.location.pathname || String(p.location), /\/calculation\/CALC-/, "the new calculation's page opens");
  const made = (await me.read("calculation", { query: { id: /CALC-[^/]+$/.exec(p.location.pathname || String(p.location))[0] } }));
  assert.equal(made.found, true);
  assert.equal(made.results.output.value, "21", "the plane worked the total out over the column the screen sent");
});

test("R5 item 59 Calculation: a share asks the part as well as the column; a count asks neither; a kind sent without its column is refused by calculations and drawn beside the act", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  fill(p, { "calc-q": "What share did the City pay?", "calc-from": "2025-07-01", "calc-to": "2026-06-30", "calc-kind": "share", "calc-input": R.table });
  p.fire(p.doc.getElementById("calc-kind"), "change");
  p.fire(p.doc.getElementById("calc-input"), "input");
  await settled(p);
  assert.ok(p.doc.getElementById("calc-part"), "a share asks the part");
  await press(p, "calculationcreate", { reason: REASON });
  await settled(p);
  assert.equal(p.byOp("calculationcreate").length, 1, "sent without its column");
  assert.ok(main(p).textContent.includes("NO_COLUMN") || main(p).textContent.includes(word("refusal.NO_COLUMN")), "and refused by calculations, drawn beside the act (its words once the design adopts them: reported)");
  fill(p, { "calc-column": "payer", "calc-part": "City" });
  await press(p, "calculationcreate", { reason: REASON });
  await settled(p);
  const sent = p.byOp("calculationcreate").slice(-1)[0];
  assert.deepEqual([sent.body.column, sent.body.part], ["payer", "City"]);
  /* control: a count asks neither */
  const c = await openAs(world, me, "/app/calculation/" + R.first);
  fill(c, { "calc-q": "How many payments in all?", "calc-from": "2025-07-01", "calc-to": "2026-06-30", "calc-kind": "count", "calc-input": R.table });
  c.fire(c.doc.getElementById("calc-input"), "input");
  await settled(c);
  assert.equal(c.doc.getElementById("calc-column"), null);
  await press(c, "calculationcreate", { reason: REASON });
  await settled(c);
  assert.equal(c.byOp("calculationcreate")[0].body.column, undefined);
  assert.match(c.location.pathname || String(c.location), /\/calculation\/CALC-/);
});

test("R5 Calculation: 'Declare a table' sends the passage chosen on the document as its source, and the plane holds the table", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const other = await world.recipes.hold(me, "Grants.csv", "grantee,amount\nAcme,10\nBeta,12\n", R.project);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  fill(p, { "calc-content": other.sha, "calc-header": "grantee, amount" });
  p.fire(p.doc.getElementById("calc-content"), "change");
  await settled(p);
  await press(p, "tabledeclare", { reason: REASON });
  await settled(p);
  const sent = p.byOp("tabledeclare");
  assert.equal(sent.length, 1);
  assert.deepEqual(Object.keys(sent[0].body.source).sort(), ["capture_sha", "extent"], "a passage, not a bare digest");
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the plane holds it");
});
