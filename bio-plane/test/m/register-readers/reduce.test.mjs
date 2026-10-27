/* register-readers R3, R4, R9: contact columns dropped before any other code sees a row, contact shapes in free text
 * withheld, and the reduced copy made as the original passes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { reduce, droppedColumns, contactShape, createReducer, readRows } from "../../../src/register-readers/index.mjs";
import { walkRecords } from "../../../src/csv-reader/index.mjs";
import { CONTRIB, CONTRIB_HEADER, CONTRIB_ROWS, SENTINEL, STREET_TYPES, TAB, delimited, enc, chunked, all, concat } from "./fixtures.mjs";

/* The register with a kept map coordinate beside the unlisted one. */
const DEF = { ...CONTRIB, columns: [...CONTRIB.columns, { name: "Lon", role: "other", keep: true }] };
const HEADER = [...CONTRIB_HEADER, "Lon"];
const ROWS = CONTRIB_ROWS.map((r) => [...r, "-122.2711"]);
const CSV = enc(delimited([HEADER, ...ROWS]));
const opts = { streetTypes: STREET_TYPES };
const rowsOf = async (bytes = CSV, def = DEF) => (await all(readRows(chunked(bytes), def, "y2025"))).filter((x) => x.cells);
const noSentinel = (text) => { for (const s of Object.values(SENTINEL)) assert.ok(!text.includes(s), `${s} leaked`); };
const decode = (b) => new TextDecoder().decode(b);

/* ------------------------------------------------------------------ R3 */

test("R3 reduce keeps only the kept columns, in the definition's order; no sentinel of a contact or unlisted column survives", async () => {
  const kept = DEF.columns.filter((c) => c.keep).map((c) => c.name);
  for (const row of await rowsOf()) {
    const r = reduce(row, DEF, opts);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.kept), kept);
    assert.ok(!("Street" in r.kept) && !("Phone" in r.kept) && !("Lat" in r.kept));
    noSentinel(JSON.stringify(r));
  }
});

test("R3 droppedColumns names the contact and unlisted columns, names only, never a value", () => {
  const d = droppedColumns(HEADER, DEF);
  assert.deepEqual(d, [{ name: "Street", why: "contact_role" }, { name: "Phone", why: "contact_role" }, { name: "Lat", why: "unlisted" }]);
  noSentinel(JSON.stringify(d));
  const notKept = { ...DEF, columns: DEF.columns.map((c) => (c.name === "Memo" ? { ...c, keep: false } : c)) };
  assert.deepEqual(droppedColumns(HEADER, notKept).map((x) => x.name), ["Street", "Phone", "Memo", "Lat"]);
});

test("R3 K5499: a nine-digit ZIP, the city and a map coordinate stay as the source gives them", async () => {
  const [first] = await rowsOf();
  const r = reduce(first, DEF, opts);
  assert.equal(r.kept.Zip, "946121234");
  assert.equal(r.kept.City, "Riverbend");
  assert.equal(r.kept.Lon, "-122.2711");
});

test("R3 a definition that keeps a contact role is refused and no row is returned", async () => {
  const [first] = await rowsOf();
  for (const role of ["home_address", "phone"]) {
    const bad = { ...DEF, columns: DEF.columns.map((c) => (c.role === role ? { ...c, keep: true } : c)) };
    assert.deepEqual(reduce(first, bad, opts), { ok: false, why: "definition_keeps_contact" });
    const reducer = createReducer({ definition: bad, piece: "y2025" });
    assert.equal(reducer.write(CSV).length, 0);
    assert.equal(reducer.end().why, "definition_keeps_contact");
  }
});

test("R3 control: kept values are unchanged", async () => {
  const quiet = { ...DEF, columns: DEF.columns.filter((c) => c.name !== "Memo") };
  for (const row of await rowsOf(CSV, quiet)) {
    const r = reduce(row, quiet, opts);
    for (const [k, v] of Object.entries(r.kept)) assert.equal(v, row.cells[k]);
    assert.equal(r.withheld, 0);
  }
});

/* ------------------------------------------------------------------ R4 */

const NOT_CONTACT = [
  "$1,250.00", "(1,000.00)", "-75", "1234567.89", "$5,000,000", "1.5%", "2026-10-27", "10/27/2026", "27-Oct-2026",
  "2026-10-27T13:45:00", "4:30 PM", "FILER0000001", "C00123456", "LIC-A123456", "BC-24-000123", "Measure 5500",
  "Prop 47", "Resolution 89-123", "Ordinance No. 13,456", "AB 1234", "SB 2", "Form 460", "Schedule A", "Q3 2025",
  "Line 12a", "Account 41000-2201", "94612-1234", "ZIP 94612", "Suite 100", "2nd Avenue Partners", "Main Street Bakery",
  "Riverbend 2026 Street Fair", "Vote 7-2", "Room 2018", "Tax ID 94-1234567", "ISBN 978-0-306-40615-7",
  "2025-2026 session", "Phone bank volunteer", "Retired", "Harbor Bakery, Inc.",
];

test("R4 contactShape finds North American phone forms and street addresses whose type the caller passes", () => {
  for (const s of ["(555) 010-7731", "555-010-7731", "555.010.7731", "+1 555 010 7731", "1-555-010-7731", "555-0107", "(555) 010-7731 ext. 22", "555-010-7731 x4"]) {
    assert.deepEqual(contactShape(`reach me ${s} anytime`, STREET_TYPES), { found: true, kinds: ["phone"] }, s);
  }
  for (const s of ["4012 Sentinel Ave, Apt 6", "77 North Ridge Road", "12 Elm St.", "1600 Grand Blvd #4", "9 Rd"]) {
    const got = contactShape(`at ${s}`, STREET_TYPES);
    assert.equal(got.found, s !== "9 Rd", s);
    if (got.found) assert.deepEqual(got.kinds, ["address"], s);
  }
  assert.equal(contactShape("12 Elm Rd", ["Road"]).found, false, "only the words the caller passes are street types");
  assert.equal(contactShape("4012 Sentinel Ave").found, false, "with no street types no address is found");
  assert.deepEqual(contactShape("4012 Sentinel Ave, call 555-0107", STREET_TYPES).kinds, ["phone", "address"]);
});

test("R4 40 non-contact strings (amounts, dates, ids, \"Measure 5500\") are not contact shapes", () => {
  assert.equal(NOT_CONTACT.length, 40);
  for (const s of NOT_CONTACT) assert.deepEqual(contactShape(s, STREET_TYPES), { found: false, kinds: [] }, s);
});

test("R4 contactShape never throws and answers found false for a non-string", () => {
  for (const x of [null, undefined, 5, {}, [], new Uint8Array(3), Symbol.for("x")]) assert.equal(contactShape(x, STREET_TYPES).found, false);
  for (const t of [null, 5, "Ave", [null, 3, {}], { a: [1] }]) assert.equal(contactShape("4012 Sentinel Ave", t).found, false);
});

test("R4 reduce withholds a free-text cell holding a contact shape, counts it, and keeps the row's other cells", async () => {
  const rows = await rowsOf();
  const r2 = reduce(rows[1], DEF, opts), r3 = reduce(rows[2], DEF, opts);
  assert.deepEqual(r2.kept.Memo, { withheld: "contact_shape" });
  assert.deepEqual(r3.kept.Memo, { withheld: "contact_shape" });
  assert.equal(r2.withheld, 1);
  assert.equal(r2.kept.Contributor, "Chen, Wei");
  assert.equal(r2.kept.Amount, "(250.00)");
  const reducer = createReducer({ definition: DEF, piece: "y2025", streetTypes: STREET_TYPES });
  const out = decode(concat([reducer.write(CSV), reducer.end().bytes]));
  const end = createReducer({ definition: DEF, piece: "y2025", streetTypes: STREET_TYPES });
  end.write(CSV);
  assert.equal(end.end().reduced.withheld_cells, 2);
  assert.ok(!out.includes("010-7731") && !out.includes("Sentinel Ave"));
});

test("R4 the shape is not looked for in amount, date, filer_id or id cells", async () => {
  const def = { ...DEF, columns: DEF.columns.map((c) => (c.name === "Filer_ID" ? { ...c } : c)) };
  const row = { cells: { ...(await rowsOf())[0].cells, Filer_ID: "555-010-7731", Amount: "555-0107", Date: "555-0107", Form: "460" } };
  const r = reduce(row, def, opts);
  assert.equal(r.kept.Filer_ID, "555-010-7731");
  assert.equal(r.kept.Amount, "555-0107");
  assert.equal(r.withheld, 0);
});

test("R4 control: a cell with no shape is unchanged", async () => {
  const r = reduce((await rowsOf())[0], DEF, opts);
  assert.equal(r.kept.Memo, "Measure 5500");
});

/* ------------------------------------------------------------------ R9 */

const sha = (b) => createHash("sha256").update(b).digest("hex");
const runReducer = (chunks, o) => {
  const r = createReducer(o);
  const parts = chunks.map((c) => r.write(c));
  const end = r.end();
  return { bytes: concat([...parts, end.bytes]), end };
};

test("R9 the reduced copy's digest is one whatever the chunking: the fixture split at every position", () => {
  const o = { definition: DEF, piece: "y2025", streetTypes: STREET_TYPES, filter: { names: ["Rosa Martinez", "Wei Chen"] } };
  const whole = runReducer([CSV], o);
  assert.equal(whole.end.ok, true);
  for (let cut = 0; cut <= CSV.length; cut++) {
    const got = runReducer([CSV.subarray(0, cut), CSV.subarray(cut)], o);
    assert.equal(got.end.reduced.sha256, whole.end.reduced.sha256, `cut at ${cut}`);
    assert.deepEqual(got.bytes, whole.bytes);
  }
  assert.equal(whole.end.reduced.sha256, sha(whole.bytes), "the digest is of the bytes answered");
});

test("R9 original.sha256 equals an independent hash of every byte passed in, with its count and what it covers", () => {
  const { end } = runReducer([CSV.subarray(0, 100), CSV.subarray(100)], { definition: DEF, piece: "y2025" });
  assert.equal(end.original.sha256, sha(CSV));
  assert.equal(end.original.bytes, CSV.length);
  assert.equal(end.original.covers, "whole_file");
  const member = runReducer([enc(delimited([CONTRIB_HEADER, ...CONTRIB_ROWS], "\t"))], { definition: TAB, piece: "t" });
  assert.equal(member.end.original.covers, "member:RCPT_CD.TSV");
});

test("R9 a filter matching 2 of 10 rows gives 2 rows, each with its src_row; rows_in 10, rows_out 2; no contact sentinel in the bytes", () => {
  const ten = [...ROWS, ...ROWS.map((r) => [`${r[0]}b`, ...r.slice(1)])];
  const bytes = enc(delimited([HEADER, ...ten]));
  const { bytes: out, end } = runReducer([bytes], { definition: DEF, piece: "y2025", streetTypes: STREET_TYPES, filter: { names: ["Okafor Ada"] } });
  const records = walkRecords(decode(out), ",");
  assert.deepEqual(records[0], ["src_row", ...DEF.columns.filter((c) => c.keep).map((c) => c.name)]);
  assert.deepEqual(records.slice(1).map((r) => r[0]), ["3", "8"]);
  assert.equal(records[1][records[0].indexOf("Tran_ID")], "T3");
  assert.equal(end.reduced.rows_in, 10);
  assert.equal(end.reduced.rows_out, 2);
  assert.match(end.filter_fingerprint, /^[0-9a-f]{64}$/);
  noSentinel(decode(out));
  noSentinel(JSON.stringify(end));
  assert.deepEqual(end.reduced.dropped_columns.map((d) => d.name), ["Street", "Phone", "Lat"]);
});

test("R9 the reduced copy is one canonical form: UTF-8, comma, LF, quotes only where needed, from any source dialect", () => {
  const tsv = enc(delimited([CONTRIB_HEADER, ...CONTRIB_ROWS], "\t", "\r\n"));
  const fromTab = runReducer([tsv], { definition: TAB, piece: "t" });
  const fromComma = runReducer([enc(delimited([CONTRIB_HEADER, ...CONTRIB_ROWS]))], { definition: CONTRIB, piece: "y2025" });
  assert.deepEqual(fromTab.bytes, fromComma.bytes);
  const text = decode(fromTab.bytes);
  assert.ok(!text.includes("\r"));
  assert.ok(text.includes('"line one\nline ""two"""'));
  assert.ok(text.includes(',"Ridge Co, Inc.",'));
  assert.ok(text.includes(",Harbor Bakery,"), "no quotes where none are needed");
});

test("R9 undetermined rows are counted and not written", () => {
  const rows = [...ROWS.slice(0, 2), ROWS[2].slice(0, 4), ...ROWS.slice(3)];
  const { end } = runReducer([enc(delimited([HEADER, ...rows]))], { definition: DEF, piece: "y2025", filter: { date: { from: "2025-01-01" } } });
  assert.equal(end.reduced.rows_in, 5);
  assert.equal(end.reduced.rows_undetermined, 1);
  assert.equal(end.reduced.rows_out, 4);
});

test("R9 control: the empty filter gives every row", () => {
  const { bytes, end } = runReducer([CSV], { definition: DEF, piece: "y2025" });
  assert.equal(end.reduced.rows_out, 5);
  assert.equal(walkRecords(decode(bytes), ",").length, 6);
});
