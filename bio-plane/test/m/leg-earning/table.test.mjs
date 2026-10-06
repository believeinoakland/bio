/* R12: the table this module holds, `inquiry_basis`, its shape unchanged from inquiry's (K1505 (2)), declared to
   record-core, and its one write: an inquiry's legs replaced whole. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, storage } from "./fixture.mjs";
import { LEG_EARNING_TABLES, migrateLegEarning, legEarningOwns } from "../../../src/leg-earning/index.mjs";

const A = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", R = "INQ-2026-0002-r";
const COLUMNS = ["bundle_id", "ord", "target_id", "target_type", "role", "grade", "grade_axis", "grade_source", "note", "at",
                 "ground", "content_id"];

test("R12 the table's columns, keys and indexes are inquiry's, names and types unchanged", () => {
  const w = world();
  const cols = w.rows(`PRAGMA table_info(inquiry_basis)`);
  assert.deepEqual(cols.map((c) => c.name), COLUMNS);
  assert.deepEqual(cols.filter((c) => c.pk).map((c) => c.name), ["bundle_id", "ord"]);
  assert.deepEqual(cols.filter((c) => c.notnull).map((c) => c.name), ["bundle_id", "ord", "target_id", "target_type", "role"]);
  assert.ok(cols.every((c) => c.type === (c.name === "ord" ? "INTEGER" : "TEXT")));
  assert.deepEqual(w.rows(`PRAGMA index_list(inquiry_basis)`).map((i) => i.name).filter((n) => !n.startsWith("sqlite_")).sort(),
    ["inquiry_basis_bundle", "inquiry_basis_content", "inquiry_basis_grade_source", "inquiry_basis_target"]);
});

test("R12 an earlier shape (no ground, no content_id) is brought to this one, idempotently, its rows kept", () => {
  const st = storage();
  st.db.exec(`CREATE TABLE inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL,
              target_type TEXT NOT NULL, role TEXT NOT NULL, grade TEXT, grade_axis TEXT, grade_source TEXT, note TEXT, at TEXT,
              PRIMARY KEY (bundle_id, ord))`);
  st.db.exec(`INSERT INTO inquiry_basis VALUES ('${Q}', 0, '${A}', 'information', 'supports', NULL, NULL, NULL, NULL, NULL)`);
  migrateLegEarning(st.sql); migrateLegEarning(st.sql);
  assert.deepEqual(st.sql.exec(`PRAGMA table_info(inquiry_basis)`).map((c) => c.name), COLUMNS);
  assert.deepEqual(st.sql.exec(`SELECT bundle_id, ground, content_id FROM inquiry_basis`), [{ bundle_id: Q, ground: null, content_id: null }]);
});

test("R12 declared to record-core once, by this module, in the classes it held under inquiry: cleared with its bundle, keyed by bundle_id", () => {
  const w = world(); w.doc(A);
  const d = w.record.declaredTables().filter((t) => t.name === "inquiry_basis");
  assert.equal(d.length, 1);
  assert.deepEqual(d[0], { module: "leg-earning", name: "inquiry_basis", keys: ["bundle_id"], purge: "clear", expunge: "none",
                           export: "admin-only", sight: "bundle", derive: "stored", version_chain: false });
  assert.ok(legEarningOwns("inquiry_basis") && legEarningOwns({ name: "inquiry_basis" }) && !legEarningOwns("inquiry_exclusions"));
  assert.equal(LEG_EARNING_TABLES.length, 1);
  w.inquiry(Q, { legs: [{ target: A }] }); w.inquiry(R, { legs: [{ target: A }] });
  w.record.purge({ bundleId: Q });
  assert.deepEqual(w.rows(`SELECT bundle_id FROM inquiry_basis`).map((r) => r.bundle_id), [R], "a purged inquiry's legs go with it");
});

test("R12 writeBasis replaces an inquiry's legs whole: in order, target_type from the target's prefix, absent fields null, an unprojectable row skipped keeping the others' ords", () => {
  const w = world(); w.doc(A);
  assert.equal(w.k.writeBasis(null, []).reason, "NO_ID");
  const first = w.k.writeBasis(Q, [{ target: A, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture",
                                      ground: "  g1  ", note: "n", at: "2026-09-27", content_id: "c".repeat(64), target_type: "inquiry" },
                                    { target: 42 }, { target: R, role: "cuts_against", ground: "  " }]);
  assert.deepEqual([first.ok, first.written], [true, 2]);
  assert.deepEqual(w.rows(`SELECT * FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, Q), [
    { bundle_id: Q, ord: 0, target_id: A, target_type: "information", role: "supports", grade: "B", grade_axis: "capture",
      grade_source: "capture", note: "n", at: "2026-09-27", ground: "g1", content_id: "c".repeat(64) },
    { bundle_id: Q, ord: 2, target_id: R, target_type: "inquiry", role: "cuts_against", grade: null, grade_axis: null,
      grade_source: null, note: null, at: null, ground: null, content_id: null }]);
  /* a second write replaces the first whole; another inquiry's legs are untouched */
  w.k.writeBasis(R, [{ target: A, role: "supports" }]);
  assert.equal(w.k.writeBasis(Q, [{ ord: 5, target: `imported:${"c".repeat(64)}/INFO-2026-0007-x`, role: "supports" }]).written, 1);
  assert.deepEqual(w.rows(`SELECT bundle_id, ord, target_type FROM inquiry_basis ORDER BY bundle_id`),
    [{ bundle_id: Q, ord: 5, target_type: "" }, { bundle_id: R, ord: 0, target_type: "information" }]);
  assert.equal(w.k.writeBasis(Q, []).written, 0);
  assert.equal(w.rows(`SELECT count(*) AS n FROM inquiry_basis WHERE bundle_id=?`, Q)[0].n, 0);
});

test("R12 R3 the backfill is the table's other write: a leg's content row set once, then read back, never minted twice", () => {
  const w = world(); w.doc(A);
  w.inquiry(Q, { legs: [{ target: A }] });
  w.st.sql.exec(`UPDATE inquiry_basis SET content_id=NULL`);
  const first = w.k.ensureLegContent(Q, 0);
  assert.deepEqual([first.ok, first.backfilled, /^[0-9a-f]{64}$/.test(first.content_id)], [true, true, true]);
  assert.equal(w.rows(`SELECT content_id FROM inquiry_basis`)[0].content_id, first.content_id);
  assert.deepEqual(w.k.ensureLegContent(Q, 0), { ok: true, content_id: first.content_id, minted: false, backfilled: false });
  assert.equal(w.k.ensureLegContent(Q, 9).reason, "NO_LEG");
});
