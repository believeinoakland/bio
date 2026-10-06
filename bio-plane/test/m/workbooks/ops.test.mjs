/* workbooks: the ops map (R15). Each arm drives its service; a read takes the viewer from the URL, an act its fields
   (with the control plane's `by`) from the body, never a viewer from the body. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, BASIC, V } from "./fixture.mjs";
import { workbooksOps, WORKBOOKS_OPS } from "../../../src/workbooks/index.mjs";
import { evaluate, METHOD } from "../../../src/calc-grammar/index.mjs";

const url = (q) => new URL(`https://plane/x?${new URLSearchParams(q)}`);

test("R15 workbooksOps publishes one route arm per act and read, each answering what its service answers, stamped by the control plane", async () => {
  const w = await seeded();
  const q = { capture: w.cap, project: w.P, viewer: V("carol") };
  const arms = workbooksOps(w.wb, url(q), {});
  assert.deepEqual(Object.keys(arms), [...WORKBOOKS_OPS]);
  assert.deepEqual(WORKBOOKS_OPS, ["workbookadd", "workbook", "workbookbind", "workbookunbind", "workbookinputs", "workbookrecompute",
    "workbooklint", "workbooklintexplain", "workbookmethodnote", "workbooksecondcheck", "workbookexport"]);
  /* reads: the viewer is the URL's stamp */
  assert.deepEqual(arms.workbook(), w.wb.readWorkbook({ ...w.at, viewer: V("carol") }));
  assert.deepEqual(arms.workbookinputs(), w.wb.inputsOf({ ...w.at, viewer: V("carol") }));
  assert.deepEqual(arms.workbooklint(), w.wb.lint({ ...w.at, viewer: V("carol") }));
  assert.equal(workbooksOps(w.wb, url({ ...q, viewer: V("dave") }), { viewer: V("bob") }).workbook().reason, "NO_SUCH_WORKBOOK",
               "a viewer in the body is never read");
  /* acts: the body, with `by` */
  const act = (op, body) => workbooksOps(w.wb, url({}), body)[op]();
  const cap2 = w.capture(BASIC()).capSha;
  assert.equal((await act("workbookadd", { captureSha: cap2, question: "q", period: "p", project: w.P, by: V("bob") })).ok, true);
  const t = w.table([["amount", "number"]], [["300"]]);
  const b = act("workbookbind", { ...w.at, range: "Model!B3", input: { table: t, range: "A1" }, by: V("bob") });
  assert.equal(b.binding.agrees, true);
  assert.equal(act("workbookunbind", { bindingId: b.binding.binding_id, reason: "test", by: V("bob") }).binding.state, "unbound");
  assert.equal((await act("workbookrecompute", { ...w.at, by: V("bob") })).recompute.reason, "NO_ENGINE");
  assert.equal(act("workbooklintexplain", { ...w.at, finding: { kind: "constant_in_formula", cell: "Model!B6" }, note: "n", by: V("bob") }).ok, true);
  assert.equal(act("workbookmethodnote", { ...w.at, purpose: "p", sources: ["s"], steps: "s", limitations: "l", by: V("bob") }).ok, true);
  assert.equal(act("workbooksecondcheck", { ...w.at, outcome: "agrees", by: V("bob") }).reason, "SELF_CHECK");
  assert.equal(act("workbooksecondcheck", { ...w.at, outcome: "agrees", by: V("carol") }).ok, true);
  const read = w.wb.readWorkbook({ ...w.at, viewer: V("bob") });
  assert.deepEqual([read.bindings.length, read.method_notes.length, read.checks.length, read.recompute.status], [1, 1, 1, "not recomputed here"]);
  assert.equal(read.lint[0].notes[0].by, V("bob"));
  /* the export: bytes as base64 */
  const table = w.calculations.tables.get(t);
  const recipe = { method: METHOD, inputs: [{ name: "x", kind: "table" }], steps: [{ op: "sum", as: "s", from: "x", field: "amount" }], output: "s" };
  const run = evaluate(recipe, { x: { fields: table.fields, rows: table.rows } });
  w.calculations.calcs.set("CALC-2026-0001", { calc_id: "CALC-2026-0001", question: "q", period: "p", recipe, method_version: METHOD,
    result_key: "k", inputs: [{ name: "x", kind: "table", sha: t }], results: { s: run.result } });
  const ex = workbooksOps(w.wb, url({ calc: "CALC-2026-0001", viewer: V("bob") }), {}).workbookexport();
  assert.equal(ex.found, true);
  assert.equal(ex.bytes, undefined);
  const direct = w.wb.exportRecipe({ calcId: "CALC-2026-0001", viewer: V("bob") }).bytes;
  assert.deepEqual(new Uint8Array(Buffer.from(ex.bytes_base64, "base64")), direct);
  assert.deepEqual(workbooksOps(w.wb, url({ calc: "CALC-2026-0001" }), {}).workbookexport(), { ok: true, found: false }, "no viewer stamped");
});

