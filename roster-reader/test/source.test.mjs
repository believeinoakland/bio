/* roster-reader R12: `rosterSource(reads)`, the roster source `people.staffingAt` asks (people R18, R19), tested at
 * the module's interface over the real roster documents in ./fixtures and over tables built in a payroll export's
 * shape. `reads` stands in for the store's read the composition root hands in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rosterSource, LEVEL_READ, LEVEL_NOT_READ, staffRoster } from "../index.mjs";
import { ROSTER_DOCS, FIRST, ctxOf, freeze } from "./fixtures.mjs";

const D = ROSTER_DOCS.documents;
const Q = { organisation: "ENT-7", at: "2025-03-01", viewer: "MBR-1" };
const CONTACT = /@|\b\d{3}[-.]\d{4}\b|\b\d{1,6}\s+\w+\s+(?:Street|St|Avenue|Ave|Blvd)\b/;
const TABLE = {
  source: { table: "TBL-1" }, as_of: "2025-02-01", view: FIRST,
  header: ["Full Name", "Job Title", "Department", "Start Date", "End Date", "Employee ID", "Phone", "Home Address", "Notes"],
  rows: [["Jane Doe", "Director", "Public Works", "2019-04-01", "", "E100", "510-555-0101", "12 Main Street", "private note"],
         ["John Roe 510-555-0102", "Analyst II", "Finance", "2021-01-04", "2024-06-30", "E101", "510-555-0199", "4 Oak Ave", "x"],
         ["", "", "", "", "", "", "510-555-0000", "", ""]],
};
const docItem = (k, extra) => ({ source: { sha256: D[k].sha256 }, text: D[k].text, view: FIRST, ...(extra || {}) });

test("R12 a held roster document is read by R2 and answered as {source, as_of, rows}, its own date stated, at the level read by roster-reader", () => {
  const seen = [];
  const src = rosterSource((q) => { seen.push(q); return [docItem("roster_committee")]; });
  const a = src(Q);
  assert.deepEqual(seen, [{ organisation: "ENT-7", viewer: "MBR-1" }]);
  assert.equal(a.level, LEVEL_READ);
  assert.equal(a.level, "held as a table, read by roster-reader");
  assert.equal(a.organisation, "ENT-7");
  assert.equal(a.at, "2025-03-01");
  assert.equal(a.rosters.length, 1);
  const r = a.rosters[0];
  assert.deepEqual(r.source, { sha256: D.roster_committee.sha256 });
  assert.equal(r.as_of, "2025-01-10");
  /* Every row is R2's row, as the document states it, placed where its own text says. */
  const want = staffRoster.parse(ctxOf(D.roster_committee, FIRST)).rows;
  assert.deepEqual(r.rows, want);
  assert.ok(r.rows.some((x) => x.name === "Zac Unger" && x.title === "Chair" && x.unit === "Public Works"));
  for (const x of r.rows) assert.equal(x.source.kind, "pdf-page");
  /* A roster whose text states no date: as_of null, with why. */
  const w = rosterSource(() => [docItem("roster_wdb")])(Q).rosters[0];
  assert.equal(w.as_of, null);
  assert.match(w.as_of_why, /states a date/);
  assert.equal(w.rows.length, 18);
});

test("R12 a held roster table is read through R6's column roles, each row {name?, title?, unit?, start?, end?, employee_id?, source}; a contact or unnamed column is never read", () => {
  const a = rosterSource(() => [TABLE])(Q);
  assert.equal(a.level, LEVEL_READ);
  const r = a.rosters[0];
  assert.deepEqual(r.source, { table: "TBL-1" });
  assert.equal(r.as_of, "2025-02-01");
  assert.deepEqual(r.rows, [
    { name: "Jane Doe", title: "Director", unit: "Public Works", start: "2019-04-01", employee_id: "E100", source: { roster: { table: "TBL-1" }, row: 0 } },
    { name: "John Roe", title: "Analyst II", unit: "Finance", start: "2021-01-04", end: "2024-06-30", employee_id: "E101", source: { roster: { table: "TBL-1" }, row: 1 } },
  ]);
  assert.doesNotMatch(JSON.stringify(a), CONTACT);
  assert.doesNotMatch(JSON.stringify(a), /private note/);
  assert.deepEqual(r.columns.map((c) => c.role), ["name", "title", "unit", "start", "end", "employee_id", "contact", "contact", null]);
  assert.match(r.columns_why, /2 contact column\(s\) not read; 1 column\(s\) with no role not read/);
  /* Rows keyed by header text read the same way; a table stating no date says so. */
  const keyed = { source: "T2", header: ["Name", "Title", "Email"], rows: [{ Name: "Ann Lee", Title: "Chair", Email: "a@x.example" }] };
  const k = rosterSource(() => ({ items: [keyed], view: FIRST }))(Q).rosters[0];
  assert.deepEqual(k.rows, [{ name: "Ann Lee", title: "Chair", source: { roster: "T2", row: 0 } }]);
  assert.equal(k.as_of, null);
  assert.match(k.as_of_why, /states no date of its own/);
  /* A table R6 says is not a roster is not read, with R6's why. */
  const not = rosterSource(() => [{ source: "T3", header: ["Title", "Phone"], rows: [["Chair", "510-555-0101"]], view: FIRST }])(Q);
  assert.deepEqual(not.rosters, []);
  assert.deepEqual(not.unread, [{ source: "T3", why: "no column is named `name` or `employee_id`, so this table is not read as a roster" }]);
  assert.match(not.why, /none of which could be read/);
});

test("R12 a held organisation chart gives as rows only the posts that name their holder on their own line", () => {
  const text = "Records Division\nDirector Jane Doe\nManager\nJohn Roe\nFiscal Section\nPayroll Unit\nAnalyst Ann Lee\nGrants Unit";
  const a = rosterSource(() => [{ source: "C1", text, type: "org_chart", view: FIRST }])(Q);
  const r = a.rosters[0];
  assert.deepEqual(r.rows.map((x) => [x.name, x.title]), [["Jane Doe", "Director"], ["Ann Lee", "Analyst"]]);
  assert.match(r.rows_why, /a box with no name.*not rows/);
});

test("R12 it never states that a row's person held the post at `at`: rows carry only what the roster states, and `at` is the date asked", () => {
  const a = rosterSource(() => [docItem("roster_committee"), TABLE])({ ...Q, at: "1999-01-01" });
  assert.equal(a.at, "1999-01-01");
  for (const r of a.rosters) {
    assert.ok(!("at" in r));
    for (const row of r.rows) {
      for (const k of Object.keys(row)) assert.ok(["name", "title", "unit", "start", "end", "employee_id", "as_of", "line", "why", "source"].includes(k), k);
      for (const bad of ["holds", "held", "holder", "valid", "current", "identity", "person"]) assert.ok(!(bad in row), bad);
    }
  }
  /* The same reading whatever date is asked: the date is not applied to the rows. */
  const b = rosterSource(() => [docItem("roster_committee"), TABLE])({ ...Q, at: "2030-01-01" });
  assert.deepEqual(a.rosters, b.rosters);
});

test("R12 with no held roster it answers rosters: [] with why; with reads absent, failing, refusing, late or shapeless, the level not read with why; it never throws", () => {
  const none = rosterSource(() => [])(Q);
  assert.equal(none.level, LEVEL_READ);
  assert.deepEqual(none.rosters, []);
  assert.match(none.why, /no roster document or roster table of this organisation is held that the viewer may see/);
  const cases = [
    [undefined, /no read of the store was handed/],
    [() => { throw new Error("db closed"); }, /failed \(db closed\)/],
    [() => ({ ok: false, why: "not a member" }), /refused \(not a member\)/],
    [() => Promise.resolve([]), /answered later/],
    [() => Promise.reject(new Error("x")), /answered later/],
    [() => 42, /no list of held rosters/],
    [() => null, /no list of held rosters/],
  ];
  for (const [reads, why] of cases) {
    const a = rosterSource(reads)(Q);
    assert.equal(a.level, LEVEL_NOT_READ);
    assert.equal(a.level, "held as a table, not read");
    assert.deepEqual(a.rosters, []);
    assert.equal(a.organisation, "ENT-7");
    assert.match(a.why, why);
  }
  /* Malformed questions and items are answered, never thrown: each item it cannot read is named with why. */
  for (const q of [undefined, null, 7, {}]) assert.equal(rosterSource(() => [])(q).level, LEVEL_READ);
  const bad = rosterSource(() => [null, { source: "X" }, { source: "Y", text: "" }, { source: "Z", header: ["Name"] },
                                  { source: "V", get text() { throw new Error("boom"); } }])(Q);
  assert.deepEqual(bad.rosters, []);
  assert.deepEqual(bad.unread.map((u) => u.source), [null, "X", "Y", "Z", "V"]);
  for (const u of bad.unread) assert.ok(typeof u.why === "string" && u.why.length > 10, u.source);
});

test("R12 it writes nothing: the store's answer and the question are read, not changed, and two asks answer the same", () => {
  const items = freeze(structuredClone([docItem("roster_rps"), TABLE]));
  const q = freeze({ ...Q });
  const src = rosterSource(() => items);
  assert.deepEqual(src(q), src(q));
  assert.ok(src(q).rosters[0].rows.length > 0);
});
