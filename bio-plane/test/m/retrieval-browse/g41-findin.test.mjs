/* retrieval-browse, fix round 6 (T51; G41; Bob K4636, K4639, K4642): a sheet the reading names in `cells_held` has no cell list, so
 * find-in reads its rendered text whole: a term hit names the sheet and the unit's range with `cells: null` and why (the sheet's
 * cells are interpreted for a range when it is opened or cited), `money` and `dates` read its text and say so, and a small sheet
 * (cells listed) answers as before. Find-in stays synchronous (the cell index or async find is N1272). R8 and R12's neighbour
 * ids are named in each title.
 *
 * Two kinds of test. The first three run find-in through its op over the REAL extraction on the walker's file, a 1 MB CSV read by
 * `readHeld` (the ledger's read) into the same database; run under the platform's value limit
 * (`node --import bio-plane/test/platform-sqlite.mjs --test --test-force-exit ...`, TEST-SUPPORT's preload) so the reading must
 * fit in a row. The rest drive the reading's `cells_held` as the readers state it (reading-pipeline R28's emitted field). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { bucket, doc } from "../extraction/fixture.mjs";
import { homeOfHomed } from "../provenance/fixtures.mjs";

const find = (w, args) => w.rb.findIn({ viewer: V("vera"), ...args });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);
const AT = "2026-10-08T01:00:00Z";

/* ---- the walker's file through the real extraction ---- */

/** A CSV of at least `bytes` bytes (the last row `LASTROWMARK`, a dollar amount and a date in its note), held, read to the end by
 *  extraction's `readHeld` into `w`'s database. */
async function readCsv(w, bytes, evidence) {
  let t = "id,name,amount,note\n"; let i = 0;
  while (t.length < bytes) { t += `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"\n`; i++; }
  t += `LASTROWMARK,"last name",1.00,"paid $42 on March 5, 2026"\n`;
  /* The bundle holds the capture's small stand-in (promotion inlines at most 1 MiB); the bytes are in the evidence bucket. */
  const cap = { path: "snapshots/big.csv.txt", text: "stand-in", sha: sha(t) };
  w.doc("INFO-CSV", {}, { captures: [cap] });
  const core = w.record;
  const bytesU8 = new TextEncoder().encode(t);
  await evidence.put(`bio/captures/${cap.sha}`, bytesU8);
  const document = doc({ digest: cap.sha, bytes: bytesU8.length, ct: "text/csv", format: "csv", fromText: true });
  core.readFile = (b, p) => (b === "INFO-CSV" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  const homed = homeOfHomed({ [cap.sha]: "INFO-CSV" });
  const x = new Extraction(w.st, { record: core, membership: w.membership, calibration: { state: () => ({}) }, promotion: { registerStep: () => ({ ok: true }) },
                                    env: {}, provenance: { homeOf: (s) => homed.homeOf(s), onTestimony: () => ({ ok: true }) } });
  x.registerFigures();
  x.migrate();
  let a, guard = 0;
  do { a = await x.readHeld({ sha: cap.sha, kind: "reading", storeName: "bio", env: {} }); } while (a.more && guard++ < 200);
  return { cap, x, a };
}

test("R8 (G41, K4636) through the op over the real extraction: a term in the last row of a 1 MB CSV is found in the unit holding it, with its sheet and range, cells null and the held-sheet why — not 'not extracted'", async () => {
  const evidence = bucket(), w = world({ evidence });
  const { cap, a } = await readCsv(w, 1_048_576, evidence);
  assert.deepEqual([a.ok, a.read], [true, true], `the read of the 1 MB CSV finishes: ${JSON.stringify(a).slice(0, 400)}`);
  const ans = find(w, { scope: { capture: cap.sha }, kinds: ["term"], term: "LASTROWMARK" });
  const term = kindOf(ans, "term");
  assert.deepEqual(term.not_read, [], "the capture is read, not 'not extracted'");
  assert.equal(term.items.length, 1);
  const it = term.items[0];
  assert.equal(typeof it.sheet, "string");
  assert.equal(it.extent.kind, "sheet-range");
  assert.equal(it.extent.sheet, it.sheet);
  assert.equal(it.cells, null);
  assert.match(it.cells_why, /interpreted for a range when the sheet is opened or cited/);
  assert.ok(it.words.includes("LASTROWMARK"));
});

test("R2 (G41, K4636) through the op over the real extraction: `money` over a held 1 MB CSV answers from the sheet's text and says its cells are not listed — not 'not extracted'", async () => {
  const evidence = bucket(), w = world({ evidence });
  const { cap } = await readCsv(w, 1_048_576, evidence);
  const money = kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["money"], limit: 500 }), "money");
  assert.deepEqual(money.not_read, []);
  const hit = money.items.find((i) => i.as_read === "$42");
  assert.ok(hit, "the amount in the last row is found in the sheet's text");
  assert.equal(hit.cells, null);
  assert.match(hit.cells_why, /interpreted for a range/);
});

test("R8 (G41) control, through the op over the real extraction: a small CSV's cells are listed, so a term hit names its row and cells as before", async () => {
  const evidence = bucket(), w = world({ evidence });
  const { cap } = await readCsv(w, 400, evidence);
  const it = kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["term"], term: "LASTROWMARK" }), "term").items[0];
  assert.ok(Array.isArray(it.cells) && it.cells.length === 4, "the row's four cells");
  assert.equal(it.cells.find((c) => c.cell.startsWith("A")).value, "LASTROWMARK");
  assert.equal(typeof it.row, "number");
  assert.equal(it.cells_why, undefined);
});

/* ---- the reading's `cells_held`, as the readers state it ---- */

function held(sheets, units, { cells = undefined } = {}) {
  const w = world();
  const cap = w.cap("sheet.csv", "bytes of the sheet");
  w.doc("INFO-H", {}, { captures: [cap] });
  w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at) VALUES (?,?,?,1,0,0,?,?)`,
    cap.sha, "INFO-H", "generic", JSON.stringify({ content_type: "generic", entities: [], cells_held: sheets, ...(cells ? { cells } : {}) }), AT);
  units.forEach((u, i) => w.unit(cap.sha, "INFO-H", i, u.text, u.extent));
  return { w, cap };
}
const range = (sheet, r) => ({ kind: "sheet-range", sheet, range: r });

test("R8 (G41): a term hit in a held sheet's block of many rows names the block, row null; in a one-row block it names that row; both with cells null and the held why, never the 'holds no typed cells' wording", () => {
  const { w, cap } = held(["data"], [
    { text: "id name amount note 0 name0 1.00 first block rows alpha", extent: range("data", "A1:D500") },
    { text: "501 name501 2.00 lone row omega", extent: range("data", "A501:D501") },
  ]);
  const items = (term) => kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["term"], term }), "term").items;
  const [block] = items("alpha");
  assert.deepEqual([block.sheet, block.extent, block.cells, block.row], ["data", range("data", "A1:D500"), null, null]);
  assert.match(block.cells_why, /interpreted for a range when the sheet is opened or cited/);
  assert.doesNotMatch(block.cells_why, /holds no typed cells/);
  const [one] = items("omega");
  assert.deepEqual([one.extent, one.cells, one.row], [range("data", "A501:D501"), null, 501]);
  assert.match(one.cells_why, /opened or cited/);
});

test("R8 R2 (G41): a held sheet is read whole by `money` and `dates` from its rendered text, each hit saying its cells are not listed; a sheet the reading lists cells for is still read by its cells", () => {
  const { w, cap } = held(["held"], [
    { text: "paid $42 to Acme on March 5, 2026", extent: range("held", "A1:B40") },
  ]);
  const money = kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["money"] }), "money");
  const dates = kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["dates"] }), "dates");
  assert.deepEqual([money.not_read, money.items.map((i) => i.as_read)], [[], ["$42"]]);
  assert.deepEqual(dates.items.map((i) => [i.date, i.cells, i.row]), [["2026-03-05", null, null]]);
  assert.ok([...money.items, ...dates.items].every((i) => /opened or cited/.test(i.cells_why)));
  /* Control: a listed sheet beside a held one in one workbook keeps its columns and cells. */
  const w2 = world();
  const x = w2.cap("book.xlsx", "book bytes");
  w2.doc("INFO-X", {}, { captures: [x] });
  const cell = (c, value, type) => ({ source: { kind: "sheet-cell", ref: `Small!${c}`, sheet: "Small", cell: c }, value, type, declared: null, cached: null, formula: null });
  w2.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at) VALUES (?,?,?,1,0,0,?,?)`,
    x.sha, "INFO-X", "generic", JSON.stringify({ content_type: "generic", entities: [], cells_held: ["Big"],
      cells: { Small: [cell("A1", "Item", "text"), cell("B1", "Amount (USD)", "text"), cell("A2", "Paving", "text"), cell("B2", "800", "number")] } }), AT);
  w2.unit(x.sha, "INFO-X", 0, "Item Amount (USD) Paving 800", range("Small", "A1:B2"));
  w2.unit(x.sha, "INFO-X", 1, "paid $7 on the Big sheet", range("Big", "A1:B90"));
  const m = kindOf(find(w2, { scope: { capture: x.sha }, kinds: ["money"] }), "money").items;
  assert.ok(m.some((i) => i.table && i.table.column === "B"), "the listed sheet's amount column is one table result");
  assert.ok(m.some((i) => !i.table && i.as_read === "$7" && i.cells === null && i.sheet === "Big"), "the held sheet's text hit says so");
});

test("R8 (G41) control: a sheet the reading does not name in `cells_held` and lists no cells for keeps its earlier why; a malformed `cells_held` names no sheet", () => {
  const { w, cap } = held([], [{ text: "Item Amount Paving 1200 Total", extent: range("Big", "A1:B9") }]);
  const it = kindOf(find(w, { scope: { capture: cap.sha }, kinds: ["term"], term: "total" }), "term").items[0];
  assert.deepEqual([it.cells, it.row, /holds no typed cells/.test(it.cells_why)], [null, null, true]);
  const bad = held("Big", [{ text: "Item Total", extent: range("Big", "A1:B9") }]);
  const b = kindOf(find(bad.w, { scope: { capture: bad.cap.sha }, kinds: ["term"], term: "total" }), "term").items[0];
  assert.match(b.cells_why, /holds no typed cells/);
});
