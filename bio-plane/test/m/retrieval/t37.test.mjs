/* retrieval, T37 (T37-13; N758, N759; K2118, K2122, K2197), at the module's interface: a `.docx` table's paragraphs
 * found by its cells' `paras` (R74), a vertically merged table included and an ordinal naming no paragraph unit passed
 * over; and a fact recorded at one cell of a found column named on that column's result (R73's `recorded`, through
 * content's `extentRelation`, its R6 as T37-10 left it).
 *
 * Each `.docx` is read from its bytes by `extraction`'s own read (office-readers R11's cells with their `paras`,
 * carried by reading-pipeline R28; the text units as the reading's), held here as extraction holds a reading. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { RECORDED_BY_MODULES } from "../../../src/retrieval/index.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";
import { fresh, hold, doc, docx, wp, wr } from "../extraction/fixture.mjs";

const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** A recording module's read as events R49 states it, over `rows` `{capture, extent, record}`. */
function recorder(module, rows = []) {
  return {
    recordedBy(a) {
      const items = rows.filter((r) => r.capture === a.captureSha)
        .map((r) => ({ module, record: r.record, kind: "money_fact", field: "source", extent: JSON.parse(canonicalExtent(r.extent)),
                       relation: null, by: V("ann"), at: "2026-10-08T00:00:00Z", withdrawn: false }));
      return { ok: true, module, capture_sha: a.captureSha, items, truncated: false };
    },
  };
}
const quiet = () => Object.fromEntries(RECORDED_BY_MODULES.map((m) => [m, recorder(m)]));

function corpus(recorders = quiet()) {
  const w = world({ deps: { recorders } });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  w.read = (cap, bundleId, extra = {}) => w.st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type,
      reader_version, found, entity_count, reading, at) VALUES (?,?,?,1,0,0,?,?)`, cap.sha, bundleId, "generic",
    JSON.stringify({ content_type: "generic", entities: [], ...extra }), "2026-10-08T00:00:00Z");
  return w;
}

async function heldDocx(w, bundleId, body) {
  const x = fresh();
  const bytes = docx(body);
  const digest = await hold(x.evidence, bytes);
  const r = await x.x.read(doc({ digest, bytes: bytes.length, ct: DOCX_CT, format: "docx", headers: [["content-type", DOCX_CT]] }));
  const real = w.cap(`${bundleId}.docx`, `docx bytes of ${bundleId}`);
  w.doc(bundleId, {}, { captures: [real] });
  w.read(real, bundleId, { cells: r.reading.cells });
  for (const u of r.text_units) w.unit(real.sha, bundleId, u.seq, u.text, u.extent);
  return { cap: real, cells: r.reading.cells, units: r.text_units };
}

/* A cell: its paragraphs, and `vm` "restart" or "cont" for a vertically merged one. */
const tc = (paras, vm) => `<w:tc>${vm ? `<w:tcPr><w:vMerge${vm === "restart" ? ' w:val="restart"' : ""}/></w:tcPr>` : ""}`
  + `${(Array.isArray(paras) ? paras : [paras]).map((t) => (t ? wp(wr(t)) : "<w:p/>")).join("")}</w:tc>`;
const tbl = (rows) => `<w:tbl><w:tblGrid>${rows[0].map(() => "<w:gridCol/>").join("")}</w:tblGrid>`
  + rows.map((r) => `<w:tr>${r.join("")}</w:tr>`).join("") + "</w:tbl>";

const find = (w, args) => w.retrieval.findIn({ viewer: V("vera"), ...args });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);
const show = (i) => (i.table ? ["table", i.words, i.table.column, i.table.rows, i.table.extent]
                              : ["para", i.as_read, i.extent.kind, i.extent.para]);
const paraOf = (units, text) => units.find((u) => u.text === text).extent.para;

test("R74 (N758; K2118): a vertically merged .docx table — its amount and date columns are each one result, exactly the paragraphs of the cells they took are left out (found by the cells' paras), and every other paragraph is matched, one whose text equals a column's cell included", async () => {
  const w = corpus();
  const body = tbl([
    [tc("Paid on"), tc("Amount ($)"), tc("Note")],
    [tc("2026-03-01"), tc("$1,250.00"), tc("Hall rental", "restart")],
    [tc("2026-04-15"), tc("$312.50"), tc("$20 deposit", "cont")],
    [tc("March 9, 2026"), tc("$40"), tc("Refund")]])
    + wp(wr("$1,250.00")) + wp(wr("2026-04-15"));
  const { cap, cells, units } = await heldDocx(w, "INFO-VM", body);
  /* The fixture is what the old line match could not read: the merged cell's paragraphs are not one run. */
  const merged = cells["table 1"].find((c) => c.source.cell === "C2");
  assert.deepEqual(merged.paras, [paraOf(units, "Hall rental"), paraOf(units, "$20 deposit")]);
  assert.ok(merged.paras[1] - merged.paras[0] > 1, "the merged cell's paragraphs are apart in reading order");
  const ans = find(w, { scope: { capture: cap.sha }, kinds: ["money", "dates"] });
  assert.deepEqual(kindOf(ans, "money").items.map(show), [
    ["para", "$20", "doc-para", paraOf(units, "$20 deposit")],
    ["para", "$1,250.00", "doc-para", units.at(-2).extent.para],
    ["table", "Amount ($)", "B", 3, { kind: "doc-table", table: 0 }]],
    "the column once; the merged cell's amount and the body's copy of a column cell found as paragraphs");
  assert.deepEqual(kindOf(ans, "dates").items.map(show), [
    ["para", "2026-04-15", "doc-para", units.at(-1).extent.para],
    ["table", "Paid on", "A", 3, { kind: "doc-table", table: 0 }]]);
  /* A merged cell inside a taken column: the restart cell's paragraph is the cell's, left out by its paras, and the
     body's paragraph of the same text found. */
  const w2 = corpus();
  const { cap: c2, cells: k2, units: u2 } = await heldDocx(w2, "INFO-VM2", tbl([
    [tc("Fee"), tc("Note")],
    [tc("$7", "restart"), tc("first")],
    [tc("", "cont"), tc("second, $3")],
    [tc("$9"), tc("third")]]) + wp(wr("$7")));
  assert.deepEqual(k2["table 1"].find((c) => c.source.cell === "A2").paras, [u2.find((u) => u.text === "$7").extent.para]);
  assert.deepEqual(kindOf(find(w2, { scope: { capture: c2.sha }, kinds: ["money"] }), "money").items.map(show), [
    ["para", "$3", "doc-para", paraOf(u2, "second, $3")],
    ["para", "$7", "doc-para", u2.at(-1).extent.para],
    ["table", "Fee", "A", 2, { kind: "doc-table", table: 0 }]]);
});

test("R74 (N758; K2197): a cell's paras ordinal naming no doc-para unit — a whitespace-only paragraph, or one the wire bound dropped — is passed over: never an error, never matched to another paragraph", async () => {
  const w = corpus();
  const { cap, cells, units } = await heldDocx(w, "INFO-WS", tbl([
    [tc("Amount (USD)"), tc("Payee")],
    [tc(["   ", "$5"]), tc("Hall")],
    [tc("$6"), tc("Chairs")]]) + wp(wr("$6")) + wp(wr("$5")));
  const cell = cells["table 1"].find((c) => c.source.cell === "A2");
  const held = new Set(units.map((u) => u.extent.para));
  assert.equal(cell.paras.length, 2);
  assert.ok(!held.has(cell.paras[0]), "the whitespace-only paragraph has no unit");
  const expect = (u) => [["para", "$6", "doc-para", u.at(-2).extent.para], ["para", "$5", "doc-para", u.at(-1).extent.para],
                         ["table", "Amount (USD)", "A", 2, { kind: "doc-table", table: 0 }]];
  const ans = find(w, { scope: { capture: cap.sha }, kinds: ["money"] });
  assert.equal(ans.ok, true);
  assert.deepEqual(kindOf(ans, "money").items.map(show), expect(units));
  /* The wire bound dropped the unit of B3's "$6" cell: its ordinal names nothing, and the body's "$6" is still found. */
  const dropped = cells["table 1"].find((c) => c.source.cell === "A3").paras[0];
  const seq = units.find((u) => u.extent.para === dropped).seq;
  w.st.sql.exec(`DELETE FROM capture_text WHERE capture_sha = ? AND seq = ?`, cap.sha, seq);
  const again = find(w, { scope: { capture: cap.sha }, kinds: ["money"] });
  assert.equal(again.ok, true);
  assert.deepEqual(kindOf(again, "money").items.map(show), expect(units));
  /* A cell naming no paras at all (a reading made before N758) names no paragraph: its own is matched as one. */
  const old = JSON.parse(JSON.stringify(cells));
  for (const c of old["table 1"]) delete c.paras;
  w.read(cap, "INFO-WS", { cells: old });
  const legacy = kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["money"] }), "money").items.map(show);
  assert.deepEqual(legacy.filter((i) => i[0] === "table"), [["table", "Amount (USD)", "A", 2, { kind: "doc-table", table: 0 }]]);
  assert.deepEqual(legacy.filter((i) => i[0] === "para").map((i) => i[1]), ["$5", "$6", "$5"]);
});

test("R73 (N759; K2122): a fact recorded at one cell of a found column — a sheet's or a .docx table's — is named on that column's result, relation narrower (content.extentRelation); a cell of another column, sheet or table is not, and the whole table or range is same", async () => {
  const w0 = world();
  const xsha = w0.cap("book.xlsx", "x").sha, dsha = w0.cap("INFO-DT.docx", "docx bytes of INFO-DT").sha;
  const rec = quiet();
  rec.money = recorder("money", [
    { capture: xsha, extent: { kind: "sheet-cell", sheet: "S", cell: "B3" }, record: "MF-CELL" },
    { capture: xsha, extent: { kind: "sheet-range", sheet: "S", range: "B2:B4" }, record: "MF-RANGE" },
    { capture: xsha, extent: { kind: "sheet-cell", sheet: "S", cell: "A3" }, record: "MF-OTHER-COL" },
    { capture: xsha, extent: { kind: "sheet-cell", sheet: "T", cell: "B3" }, record: "MF-OTHER-SHEET" },
    { capture: dsha, extent: { kind: "doc-table", table: 0, cell: "B2" }, record: "MF-DOC-CELL" },
    { capture: dsha, extent: { kind: "doc-table", table: 0 }, record: "MF-DOC-TABLE" },
    { capture: dsha, extent: { kind: "doc-table", table: 1, cell: "A1" }, record: "MF-DOC-OTHER" }]);
  const w = corpus(rec);
  const cell = (c, value, type) => ({ source: { kind: "sheet-cell", ref: `S!${c}`, sheet: "S", cell: c }, value, type,
                                      declared: null, cached: null, formula: null });
  const x = w.cap("book.xlsx", "x");
  w.doc("INFO-X", {}, { captures: [x] });
  w.read(x, "INFO-X", { cells: { S: [cell("A1", "Item", "text"), cell("B1", "Cost (USD)", "text"),
    cell("A2", "Paving", "text"), cell("B2", "5", "number"), cell("A3", "Lights", "text"), cell("B3", "7", "number"),
    cell("A4", "Signs", "text"), cell("B4", "9", "number")] } });
  const named = (ans) => kindOf(ans, "money").items.filter((i) => i.table)
    .map((i) => [i.table.extent, i.recorded.map((r) => [r.record, r.relation])]);
  assert.deepEqual(named(find(w, { scope: { capture: x.sha }, kinds: ["money"] })), [
    [{ kind: "sheet-range", sheet: "S", range: "B2:B4" }, [["MF-CELL", "narrower"], ["MF-RANGE", "same"]]]]);
  const { cap: d } = await heldDocx(w, "INFO-DT", tbl([[tc("Item"), tc("Cost ($)")], [tc("Paving"), tc("$5")], [tc("Lights"), tc("$7")]])
    + tbl([[tc("Other")]]));
  assert.equal(d.sha, dsha);
  assert.deepEqual(named(find(w, { scope: { capture: d.sha }, kinds: ["money"] })), [
    [{ kind: "doc-table", table: 0 }, [["MF-DOC-CELL", "narrower"], ["MF-DOC-TABLE", "same"]]]]);
});
