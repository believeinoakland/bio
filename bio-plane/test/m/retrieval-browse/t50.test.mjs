/* retrieval-browse, T50 (T50-10; N1123, N1177, N1183, N1191 (b) (d), N1193; K3598, K3630; JOURNEYS V4), at the module's interface:
 * a fact marks only its own passage (R1 as amended), a match names its document (R5) and its content row (R6), keeps a
 * passage's line breaks (R7), a sheet hit says its sheet, row and cells (R8, with its `row`, N1238), and `people` finds a held alias in a
 * passage's words (R9). Browse (R10, R11) is in browse.test.mjs. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { RECORDED_BY_MODULES, FIND_ROW_CELLS_MAX, FIND_WORDS_MAX, cutWords } from "../../../src/retrieval-browse/index.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";

const para = (n) => ({ kind: "doc-para", para: n });
const find = (w, args) => w.rb.findIn({ viewer: V("vera"), ...args });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);
const AT = "2026-10-08T01:00:00Z";

/** A recording module's read as events R49 states it. */
function recorder(module, rows = []) {
  return {
    recordedBy(a) {
      const items = rows.filter((r) => r.capture === a.captureSha).map((r) => ({ module, record: r.record, kind: "dated_fact",
        field: "extent", extent: JSON.parse(canonicalExtent(r.extent)), relation: null, by: V("ann"), at: AT, withdrawn: false }));
      return { ok: true, module, capture_sha: a.captureSha, items, truncated: false };
    },
  };
}
const quiet = () => Object.fromEntries(RECORDED_BY_MODULES.map((m) => [m, recorder(m)]));

/** A world with English and the reads handed in. `read` writes a capture's reading as extraction does. */
function plain(deps = {}, opts = {}) {
  const w = world({ deps: { recorders: quiet(), ...deps }, ...opts });
  w.read = (cap, bundleId, extra = {}) => w.st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type,
      reader_version, found, entity_count, reading, at) VALUES (?,?,?,1,0,0,?,?)`, cap.sha, bundleId, "generic",
    JSON.stringify({ content_type: "generic", entities: [], ...extra }), AT);
  return w;
}
const shaOf = (name, text) => world().cap(name, text).sha;

test("R1 (T50; N1191 (d)): a fact recorded from one paragraph marks only the matches in that paragraph — two matches in it both carry it (same); a fact recorded with the extent document, a whole table or the page around marks none", () => {
  const sha = shaOf("notes.txt", "notes bytes");
  const rec = quiet();
  rec.events = recorder("events", [{ capture: sha, extent: para(1), record: "EV-P1" }, { capture: sha, extent: { kind: "document" }, record: "EV-DOC" }]);
  const w = plain({ recorders: rec });
  const c = w.cap("notes.txt", "notes bytes");
  assert.equal(c.sha, sha);
  w.doc("INFO-N", {}, { captures: [c] });
  w.read(c, "INFO-N");
  w.unit(c.sha, "INFO-N", 0, "Adopted on March 5, 2026.", para(0));
  w.unit(c.sha, "INFO-N", 1, "The fee is $40 and the deposit is $7.", para(1));
  w.unit(c.sha, "INFO-N", 2, "The Clerk shall publish it.", para(2));
  const ans = find(w, { scope: { capture: c.sha }, kinds: ["dates", "money", "requirements"] });
  const ids = (m) => m.recorded.map((x) => [x.record, x.relation]);
  assert.deepEqual(kindOf(ans, "dates").items.map(ids), [[]], "the date in the first paragraph: nobody recorded from it");
  assert.deepEqual(kindOf(ans, "requirements").items.map(ids), [[]], "the requirement in the third: likewise");
  assert.deepEqual(kindOf(ans, "money").items.map(ids), [[["EV-P1", "same"]], [["EV-P1", "same"]]],
    "control: both amounts of the second paragraph carry the fact recorded from it");
  assert.ok([...ans.kinds.flatMap((k) => k.items)].every((m) => !m.recorded.some((x) => x.record === "EV-DOC")), "a whole-document fact marks no match");
});

test("R5 (T50; N1123): every match names its document by title, and the answer's scope does: a capture's, a project's own, a selection's and an enumerated set's none; a hidden bundle's title is never answered to a viewer who may not see it", () => {
  const w = plain();
  const c = w.cap("a.pdf", "a bytes"), hidden = w.cap("hidden.pdf", "hidden bytes");
  w.doc("INFO-A", { title: "Pothole report" }, { captures: [c] });
  const proj = w.project("Secret project", "ann", { captures: [hidden] });
  w.read(c, "INFO-A"); w.read(hidden, proj);
  w.unit(c.sha, "INFO-A", 0, "The budget is $4 million.");
  w.unit(hidden.sha, proj, 0, "The hidden fee is $5.");
  const byCapture = find(w, { scope: { capture: c.sha }, kinds: ["money", "term"], term: "budget" });
  assert.equal(byCapture.scope.title, "Pothole report");
  for (const k of ["money", "term"]) assert.deepEqual(kindOf(byCapture, k).items.map((m) => m.title), ["Pothole report"], k);
  const mine = w.rb.findIn({ viewer: V("ann"), scope: { project: proj }, kinds: ["money"] });
  assert.equal(mine.scope.title, "Secret project", "a project's title is its own");
  assert.deepEqual(kindOf(mine, "money").items.map((m) => m.title), ["Secret project"]);
  assert.equal(find(w, { scope: { ids: ["INFO-A"] }, kinds: ["money"] }).scope.title, null);
  const sel = { handle: w.selection("sel-a", { owner: V("vera"), ids: ["INFO-A"] }) };
  assert.equal(find(w, { scope: { selection: sel.handle }, kinds: ["money"] }).scope.title, null, "a set has no one title");
  /* Control: a hidden bundle's title reaches a viewer who may not see it through no scope. */
  const both = find(w, { scope: { ids: ["INFO-A", hidden.sha, proj] }, kinds: ["money"] });
  assert.deepEqual([both.scope.title, kindOf(both, "money").items.map((m) => m.title)], [null, ["Pothole report"]]);
  assert.ok(!JSON.stringify(both).includes("Secret project"));
  assert.equal(find(w, { scope: { project: proj }, kinds: ["money"] }).reason, "NO_SUCH_PROJECT");
  /* A bundle stating no title answers null. */
  const untitled = plain();
  const u = untitled.cap("u.pdf", "u bytes");
  untitled.doc("INFO-U", { title: "" }, { captures: [u] });
  untitled.read(u, "INFO-U");
  untitled.unit(u.sha, "INFO-U", 0, "It costs $9.");
  const none = find(untitled, { scope: { capture: u.sha }, kinds: ["money"] });
  assert.deepEqual([none.scope.title, kindOf(none, "money").items[0].title], [null, null]);
});

test("R6 (T50; N1177): a match with an extent carries content_id, the id of the content row held for that capture and extent (a table item: its table.extent), or null with content_held false; a find mints nothing; a row held in a bundle the viewer may not see is none to them", () => {
  const w = plain();
  const c = w.cap("a.pdf", "a bytes"), x = w.cap("book.xlsx", "x bytes");
  w.doc("INFO-A", {}, { captures: [c, x] });
  w.read(c, "INFO-A");
  w.unit(c.sha, "INFO-A", 0, "The fee is $10.");
  w.unit(c.sha, "INFO-A", 1, "A later fee is $20.");
  const cell = (a, value, type) => ({ source: { kind: "sheet-cell", ref: `S!${a}`, sheet: "S", cell: a }, value, type, declared: null, cached: null, formula: null });
  w.read(x, "INFO-A", { cells: { S: [cell("A1", "Cost (USD)", "text"), cell("A2", "5", "number"), cell("A3", "7", "number")] } });
  const mint = (sha, extent, bundle, id) => w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by,
      at, stale, cited_as) VALUES (?,?,?,?,?,?,?,?,0,'text')`, id, sha, bundle, extent.kind, canonicalExtent(extent), "ref", "member:ann", AT);
  const page0 = { kind: "pdf-page", page: 0 }, column = { kind: "sheet-range", sheet: "S", range: "A2:A3" };
  mint(c.sha, page0, "INFO-A", "CID-PAGE0");
  mint(x.sha, column, "INFO-A", "CID-COLUMN");
  find(w, { scope: { capture: c.sha }, kinds: ["term"], term: "x" });
  const rows = w.count("content");
  const ans = find(w, { scope: { ids: [c.sha, x.sha] }, kinds: ["money"] });
  const items = kindOf(ans, "money").items;
  const cited = items.find((m) => m.extent && m.extent.page === 0), uncited = items.find((m) => m.extent && m.extent.page === 1);
  assert.deepEqual([cited.content_id, cited.content_held], ["CID-PAGE0", true], "a passage cited earlier answers its content id");
  assert.deepEqual([uncited.content_id, uncited.content_held], [null, false], "control: an uncited passage answers null");
  const table = items.find((m) => m.table);
  assert.deepEqual([table.content_id, table.content_held], ["CID-COLUMN", true], "a table item is keyed on its table.extent");
  assert.equal(w.count("content"), rows, "a find mints nothing");
  /* A row minted in a bundle the viewer may not see is no row to them; the participant sees it. */
  const proj = w.project("Hidden", "ann", { captures: [] });
  mint(c.sha, { kind: "pdf-page", page: 1 }, proj, "CID-HIDDEN");
  assert.equal(kindOf(find(w, { scope: { capture: c.sha }, kinds: ["money"] }), "money").items.find((m) => m.extent.page === 1).content_id, null);
  assert.equal(kindOf(w.rb.findIn({ viewer: V("ann"), scope: { capture: c.sha }, kinds: ["money"] }), "money").items.find((m) => m.extent.page === 1).content_id, "CID-HIDDEN");
});

test("R7 (T50; N1183): a match's words keep a passage's line breaks — a run of whitespace holding a line break is one line break, any other run one space; the 500-character cut at a word is unchanged; a passage with no line break answers the words it did", () => {
  const w = plain();
  const c = w.cap("report.txt", "report bytes");
  w.doc("INFO-T", {}, { captures: [c] });
  w.read(c, "INFO-T");
  w.unit(c.sha, "INFO-T", 0, "Pothole report closure\nThe city received 1,200 reports.", para(0));
  w.unit(c.sha, "INFO-T", 1, "Potholes were  closed\r\n\r\n  quickly   by crews.", para(1));
  w.unit(c.sha, "INFO-T", 2, "Pothole crews work on  weekdays only.", para(2));
  const items = kindOf(find(w, { scope: { capture: c.sha }, kinds: ["term"], term: "pothole" }), "term").items;
  assert.equal(items.length, 2, "the whole word, never potholes");
  assert.equal(items[0].words, "Pothole report closure\nThe city received 1,200 reports.");
  assert.equal(items[1].words, "Pothole crews work on weekdays only.", "control: no line break, one space for a run of spaces");
  assert.equal(cutWords("a  b\r\n\r\n c d"), "a b\nc\nd");
  const long = `${"word ".repeat(80)}\n${"more ".repeat(80)}end`;
  const cut = cutWords(long);
  assert.ok(cut.length <= FIND_WORDS_MAX && cut.endsWith("…") && !/\s…$/.test(cut));
  assert.ok(cut.includes("\n"), "the cut keeps the break it passed");
});

/* A sheet's reading as office-readers R30 states it: cells with their source, value, type, declared, cached and formula. */
const cellOf = (sheet) => (a, value, type = "text", { formula = null, cached = null } = {}) =>
  ({ source: { kind: "sheet-cell", ref: `${sheet}!${a}`, sheet, cell: a }, value, type, declared: null, cached, formula });

test("R8 (T50; N1191 (b)): a match found in a sheet names its sheet, the row's sheet-range and the row's cells in column order; a formula cell with no cached value is listed with value null, its formula and cached null, and its address in not_calculated; a formula with a cached value answers that value and is not", () => {
  const w = plain();
  const x = w.cap("budget.xlsx", "workbook bytes");
  w.doc("INFO-X", { title: "The budget" }, { captures: [x] });
  const C = cellOf("Budget");
  w.read(x, "INFO-X", { cells: { Budget: [C("A1", "Item"), C("B1", "Amount"), C("A2", "Paving"), C("B2", "1200", "number"),
    C("A10", "Total"), C("B10", null, "number", { formula: "SUM(B2:B9)" }),
    C("A11", "Grand sum"), C("B11", "45", "number", { formula: "SUM(B2:B10)", cached: "45" })] } });
  w.unit(x.sha, "INFO-X", 0, "Item Amount Paving 1200 Total Grand sum 45", { kind: "sheet-range", sheet: "Budget", range: "A1:B11" });
  const hit = kindOf(find(w, { scope: { capture: x.sha }, kinds: ["term"], term: "Total" }), "term").items;
  assert.equal(hit.length, 1);
  assert.deepEqual([hit[0].sheet, hit[0].extent, hit[0].words, hit[0].not_calculated, hit[0].cells_truncated],
    ["Budget", { kind: "sheet-range", sheet: "Budget", range: "A10:B10" }, "Total", ["B10"], false]);
  assert.deepEqual(hit[0].cells, [{ cell: "A10", value: "Total", type: "text" },
    { cell: "B10", value: null, type: "number", formula: "SUM(B2:B9)", cached: null }]);
  assert.deepEqual([hit[0].title, hit[0].content_held], ["The budget", false]);
  /* Control: a formula with a cached value answers that value and is not in not_calculated. */
  const ctl = kindOf(find(w, { scope: { capture: x.sha }, kinds: ["term"], term: "Grand sum" }), "term").items[0];
  assert.deepEqual(ctl.cells, [{ cell: "A11", value: "Grand sum", type: "text" }, { cell: "B11", value: "45", type: "number" }]);
  assert.deepEqual([ctl.not_calculated, ctl.extent.range], [[], "A11:B11"]);
  /* A cell found by its amount (money) names its row's cells too, a sheet-cell extent kept. */
  const y = w.cap("fees.xlsx", "fees bytes");
  w.doc("INFO-Y", {}, { captures: [y] });
  const F = cellOf("Fees");
  w.read(y, "INFO-Y", { cells: { Fees: [F("A1", "Item"), F("B1", "Note"), F("A2", "Paving"), F("B2", "about $30 extra")] } });
  const money = kindOf(find(w, { scope: { capture: y.sha }, kinds: ["money"] }), "money").items;
  assert.deepEqual([money[0].sheet, money[0].extent, money[0].cells.map((c) => c.cell)], ["Fees", { kind: "sheet-cell", sheet: "Fees", cell: "B2" }, ["A2", "B2"]]);
  /* A formula whose cached value the file does not carry is never read as an amount or counted as an empty string. */
  const z = w.cap("calc.xlsx", "calc bytes");
  w.doc("INFO-Z", {}, { captures: [z] });
  const Z = cellOf("Calc");
  w.read(z, "INFO-Z", { cells: { Calc: [Z("A1", "Pay"), Z("B1", "Note"), Z("A2", null, "number", { formula: "B1*2" }), Z("B2", "about $12")] } });
  assert.deepEqual(kindOf(find(w, { scope: { capture: z.sha }, kinds: ["money"] }), "money").items.map((m) => m.as_read), ["$12"]);
});

test("R8 (T50): a CSV hit answers its row as separate cells; a row of more than 50 cells lists 50 with cells_truncated; a sheet the reading holds no typed cells for names the sheet and the unit's range with cells null and why", () => {
  const w = plain();
  const f = w.cap("reports.csv", "csv bytes");
  w.doc("INFO-C", {}, { captures: [f] });
  const C = cellOf("reports");
  w.read(f, "INFO-C", { cells: { reports: [C("A1", "Kind"), C("B1", "Count"), C("C1", "State"), C("A3", "Pothole"), C("B3", "1200"), C("C3", "closed")] } });
  w.unit(f.sha, "INFO-C", 0, "Kind Count State Pothole 1200 closed", { kind: "sheet-range", sheet: "reports", range: "A1:C3" });
  const row = kindOf(find(w, { scope: { capture: f.sha }, kinds: ["term"], term: "pothole" }), "term").items[0];
  assert.deepEqual([row.sheet, row.extent.range, row.cells.map((c) => [c.cell, c.value])], ["reports", "A3:C3", [["A3", "Pothole"], ["B3", "1200"], ["C3", "closed"]]]);
  /* More than 50 cells in one row. */
  const g = w.cap("wide.xlsx", "wide bytes");
  w.doc("INFO-W", {}, { captures: [g] });
  const W = cellOf("Wide");
  const colName = (i) => (i < 26 ? String.fromCharCode(65 + i) : `${String.fromCharCode(64 + Math.floor(i / 26))}${String.fromCharCode(65 + (i % 26))}`);
  const cells = Array.from({ length: FIND_ROW_CELLS_MAX + 4 }, (_, i) => W(`${colName(i)}1`, i === 0 ? "Wideword" : `v${i}`));
  w.read(g, "INFO-W", { cells: { Wide: cells } });
  w.unit(g.sha, "INFO-W", 0, "Wideword v1 v2", { kind: "sheet-range", sheet: "Wide", range: "A1:BB1" });
  const wideHit = kindOf(find(w, { scope: { capture: g.sha }, kinds: ["term"], term: "wideword" }), "term").items[0];
  assert.deepEqual([wideHit.cells.length, wideHit.cells_truncated], [FIND_ROW_CELLS_MAX, true]);
  assert.equal(wideHit.extent.range, `A1:${colName(FIND_ROW_CELLS_MAX + 3)}1`, "the row's range names every column, the list is cut");
  /* No typed cells held: the unit's own range, with why. */
  const n = w.cap("big.xlsx", "big bytes");
  w.doc("INFO-B", {}, { captures: [n] });
  w.read(n, "INFO-B");
  w.unit(n.sha, "INFO-B", 0, "Item Amount Paving 1200 Total", { kind: "sheet-range", sheet: "Big", range: "A1:B9" });
  const bare = kindOf(find(w, { scope: { capture: n.sha }, kinds: ["term"], term: "total" }), "term").items[0];
  assert.deepEqual([bare.sheet, bare.extent, bare.cells, typeof bare.cells_why], ["Big", { kind: "sheet-range", sheet: "Big", range: "A1:B9" }, null, "string"]);
});

test("R8 (T51; N1238; K3775; SCREENS-DAILY #7 J2): every match found in a sheet also carries row, the number of the sheet row it lies in — a term hit the row of its range, a cell found as a sheet-cell the row of its address, a CSV hit alike; a column result (a table item) and a match of a unit's own text, where no row can be named, carry row null; a text file's match carries no row key", () => {
  const w = plain();
  const x = w.cap("budget.xlsx", "workbook bytes"), f = w.cap("reports.csv", "csv bytes"), n = w.cap("big.xlsx", "big bytes"), t = w.cap("notes.txt", "notes bytes");
  w.doc("INFO-X", {}, { captures: [x, f, n, t] });
  const C = cellOf("Budget");
  w.read(x, "INFO-X", { cells: { Budget: [C("A1", "Item"), C("B1", "Amount (USD)"), C("C1", "Due"), C("A7", "Paving"), C("B7", "about $30 extra"),
    C("A10", "Total"), C("B10", null, "number", { formula: "SUM(B2:B9)" }),
    C("A11", "Late"), C("C11", "2026-03-05", "date")] } });
  w.unit(x.sha, "INFO-X", 0, "Item Amount Paving Total Late", { kind: "sheet-range", sheet: "Budget", range: "A1:C11" });
  const total = kindOf(find(w, { scope: { capture: x.sha }, kinds: ["term"], term: "Total" }), "term").items;
  assert.deepEqual([total.length, total[0].row, total[0].extent.range], [1, 10, "A10:B10"], "the workbook row Total | =SUM(B2:B9) answers row 10");
  const cell = kindOf(find(w, { scope: { capture: x.sha }, kinds: ["money"] }), "money").items.find((m) => m.extent.kind === "sheet-cell");
  assert.deepEqual([cell.extent.cell, cell.row, cell.sheet], ["B7", 7, "Budget"], "a cell B7 found as a sheet-cell answers row 7");
  const column = kindOf(find(w, { scope: { capture: x.sha }, kinds: ["dates"] }), "dates").items.find((m) => m.table);
  assert.deepEqual([column.table.column, column.row, Object.hasOwn(column, "row")], ["C", null, true], "a date column result answers row null");
  /* A CSV hit alike. */
  const R = cellOf("reports");
  w.read(f, "INFO-X", { cells: { reports: [R("A1", "Kind"), R("A3", "Pothole"), R("B3", "1200")] } });
  w.unit(f.sha, "INFO-X", 0, "Kind Pothole 1200", { kind: "sheet-range", sheet: "reports", range: "A1:B3" });
  assert.equal(kindOf(find(w, { scope: { capture: f.sha }, kinds: ["term"], term: "pothole" }), "term").items[0].row, 3);
  /* No typed cells held: the unit's own range, no row to name. */
  w.read(n, "INFO-X");
  w.unit(n.sha, "INFO-X", 0, "Item Amount Paving 1200 Total", { kind: "sheet-range", sheet: "Big", range: "A1:B9" });
  const bare = kindOf(find(w, { scope: { capture: n.sha }, kinds: ["term"], term: "total" }), "term").items[0];
  assert.deepEqual([bare.cells, bare.row, Object.hasOwn(bare, "row")], [null, null, true]);
  /* Control: a text file's match carries no row key, in any kind. */
  w.read(t, "INFO-X");
  w.unit(t.sha, "INFO-X", 0, "The total fee is $40 on 2026-03-05.", para(0));
  const text = find(w, { scope: { capture: t.sha }, kinds: ["term", "money", "dates"], term: "fee" });
  const all = text.kinds.flatMap((k) => k.items);
  assert.ok(all.length >= 3 && all.every((m) => !Object.hasOwn(m, "row") && !Object.hasOwn(m, "sheet")));
});

/* R9: entities' name lookup as the host hands it: the real module's `namingIn`, and `aliasesOf` (its R55) over its alias
   table (standing aliases of the kinds asked, in entity id then alias order), until the provider's own is merged. */
function followed({ extra = [], ...opts } = {}) {
  let ents = null, w = null;
  const facade = {
    namingIn: (a) => ents.namingIn(a),
    aliasesOf: ({ kinds }) => {
      const aliases = w.rows(`SELECT e.entity_id, e.kind, e.label, a.alias FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
                               WHERE a.withdrawn_at IS NULL AND e.kind IN (${kinds.map(() => "?").join(",")})
                               ORDER BY e.entity_id, a.alias_norm`, ...kinds);
      return { ok: true, aliases: [...aliases, ...extra.map((a) => ({ ...(aliases[0] || { entity_id: "ENT-X", kind: "person", label: "x" }), alias: a }))],
               limit: 1000, truncated: false, next: null };
    },
  };
  w = world({ before: (x) => { ents = entitiesOf(x.host, { record: x.record, membership: x.membership }); },
              deps: { get entities() { return facade; }, recorders: quiet() }, ...opts });
  w.entities = ents;
  if (typeof ents.migrate === "function") ents.migrate();
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  w.read = (cap, bundleId) => w.st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type, reader_version, found,
      entity_count, reading, at) VALUES (?,?,?,1,0,0,?,?)`, cap.sha, bundleId, "generic", JSON.stringify({ content_type: "generic", entities: [] }), AT);
  return w;
}

test("R9 (T50; N1193): people also finds a held alias of a registered person or office in the words of the scope's text units — once per (unit, entity), correspondence name_in_passage; the first name alone is not found, a withdrawn alias is not, a name two entities hold lists each, an alias that folds to nothing is skipped", () => {
  const w = followed({ extra: ["...", "  "] });
  const c = w.cap("minutes.txt", "minutes bytes");
  w.doc("INFO-M", {}, { captures: [c] });
  w.read(c, "INFO-M");
  w.unit(c.sha, "INFO-M", 0, "Present: Jane Roe and the clerk. Jane Roe spoke twice; Roe, Jane moved.", para(0));
  w.unit(c.sha, "INFO-M", 1, "Councilmember JANE ROE seconded.", para(1));
  w.unit(c.sha, "INFO-M", 2, "Jane alone voted, and Roe alone abstained.", para(2));
  w.unit(c.sha, "INFO-M", 3, "A. Pseudonym was thanked, as was Pat Lee.", para(3));
  const jane = w.entities.createEntity({ kind: "person", label: "Jane Roe", note: "a council member", declaredBy: "member:ann" });
  assert.equal(w.entities.addAlias({ entityId: jane.entity_id, alias: "Roe, Jane", declaredBy: "member:ann" }).ok, true);
  assert.equal(w.entities.addAlias({ entityId: jane.entity_id, alias: "A. Pseudonym", declaredBy: "member:ann" }).ok, true);
  assert.equal(w.entities.withdrawAlias({ entityId: jane.entity_id, alias: "A. Pseudonym", reason: "wrong person", withdrawnBy: "member:ann" }).ok, true);
  const lee1 = w.entities.createEntity({ kind: "person", label: "Pat Lee", note: "a", declaredBy: "member:ann" });
  const lee2 = w.entities.createEntity({ kind: "office", label: "Pat Lee", note: "b", declaredBy: "member:ann" });
  const org = w.entities.createEntity({ kind: "institution", label: "The Clerk", note: "not a person or office", declaredBy: "member:ann" });
  assert.equal(lee1.ok && lee2.ok && org.ok, true);
  const resolutions = w.count("resolutions");
  const ans = find(w, { scope: { capture: c.sha }, kinds: ["people"] });
  const people = kindOf(ans, "people").items;
  const seen = people.map((p) => [p.extent.para, p.entity.entity_id, p.correspondence, p.matched_alias]);
  assert.deepEqual(seen.filter((s) => s[1] === jane.entity_id), [[0, jane.entity_id, "name_in_passage", "Jane Roe"], [1, jane.entity_id, "name_in_passage", "Jane Roe"]],
    "Jane Roe is found in the two passages that name her, once each however many times; not in the third (the first name alone)");
  assert.deepEqual(seen.filter((s) => s[0] === 3).map((s) => s[1]).sort(), [lee1.entity_id, lee2.entity_id].sort(), "a name two entities hold lists each");
  assert.ok(people.every((p) => p.kind === "people" && p.capture_sha === c.sha && p.origin === "search" && typeof p.words === "string"));
  assert.ok(!people.some((p) => p.entity.entity_id === org.entity_id), "an institution is not a person or office");
  assert.ok(!people.some((p) => p.matched_alias === "A. Pseudonym"), "a withdrawn alias is not found");
  assert.equal(w.count("resolutions"), resolutions, "nothing is resolved");
  assert.equal(kindOf(ans, "people").nothing, false);
});

test("R9 (T50): a reference already found for the same entity in the same unit is not listed twice, and a capture with no text unit is in not_read with why, never Nothing here", () => {
  const w = followed();
  const c = w.cap("m.pdf", "m bytes"), d = w.cap("empty.pdf", "empty bytes");
  w.doc("INFO-M", {}, { captures: [c, d] });
  w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                 VALUES (?,?,?,1,1,1,?,?)`, c.sha, "INFO-M", "generic",
    JSON.stringify({ content_type: "generic", entities: [{ kind: "person", key: "p1", label: "Jane Roe", source: { kind: "pdf-page", ref: "page 1", page: 0, rect: null } }] }), AT);
  w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref, ref_kind, ref_key, label, pos_kind, pos, pos_ref, occurrence, seq)
                 VALUES (?,?,?,?,?,?,?,?,?,?,0)`, c.sha, "INFO-M", "person:p1", "person", "p1", "Jane Roe", "pdf-page", JSON.stringify({ page: 0, rect: null }), "page 1", "pdf-page:{}");
  for (const term of ["jane", "roe"]) w.st.sql.exec(`INSERT OR IGNORE INTO reading_ref_terms VALUES (?,?,?,?,?)`, c.sha, "INFO-M", "person:p1", "label", term);
  w.read(d, "INFO-M");
  w.unit(c.sha, "INFO-M", 0, "Present: Jane Roe.");
  w.unit(c.sha, "INFO-M", 1, "Jane Roe moved the item.");
  const jane = w.entities.createEntity({ kind: "person", label: "Jane Roe", note: "n", declaredBy: "member:ann" });
  const people = kindOf(find(w, { scope: { ids: ["INFO-M"] }, kinds: ["people"] }), "people");
  assert.deepEqual(people.items.map((p) => [p.capture_sha, p.extent.kind, p.extent.page ?? null, p.correspondence]),
    [[c.sha, "pdf-page", 0, "name"], [c.sha, "pdf-page", 1, "name_in_passage"]],
    "page 0's reference stays (the stronger correspondence) and page 1's passage adds the name");
  assert.ok(people.items.every((p) => p.entity.entity_id === jane.entity_id));
  assert.deepEqual(people.not_read.map((n) => n.capture_sha), [d.sha]);
  assert.match(people.not_read[0].why, /no text/);
  assert.equal(people.nothing, false);
});
