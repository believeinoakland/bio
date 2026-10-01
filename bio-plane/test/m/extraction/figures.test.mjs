/* extraction, its figures (R67): `textUnits` registered through record-core's `registerCounts` (its R63), taken through
   the caller's sight as `store.mjs`' `#counts` took it, and `textIndexOk`, the text index's agreement with its content
   table, a separate service (FTS5's integrity-check at rank 1). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, storage, bundle } from "./fixture.mjs";
import { extractionOf, Extraction } from "../../../src/extraction/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";

const units = (n, tag) => Array.from({ length: n }, (_, i) => ({ extent: { kind: "doc-para", para: i, run: null }, seq: i, text: `${tag} ${i}` }));
function seeded() {
  const f = fresh();
  bundle(f.s, "A"); bundle(f.s, "B");
  f.x.indexUnits("A", "a".repeat(64), units(3, "a"), null);
  f.x.indexUnits("B", "b".repeat(64), units(2, "b"), null);
  return f;
}
const snapshot = (f) => Object.fromEntries(f.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'capture_text_fts%'`)
  .map(({ name }) => [name, JSON.stringify(f.rows(`SELECT * FROM ${name}`))]));

test("R67: textUnits is registered with record-core under this module, answering the capture_text rows; the caller's hidden bundles are left out", () => {
  const f = seeded();
  assert.deepEqual(Extraction.COUNT_KEYS, ["textUnits"]);
  assert.equal(f.core.counts(null).textUnits, 5);
  assert.equal(f.core.counts({ sql: "(?)", args: ["B"] }).textUnits, 3);
  assert.equal(f.core.counts({ sql: "(?, ?)", args: ["A", "B"] }).textUnits, 0);
  assert.equal(f.core.counts({ sql: "(SELECT NULL WHERE 0)", args: [] }).textUnits, 5);
  assert.deepEqual(f.x.counts(null), { textUnits: 5 });
});

test("R67: synchronous and writes nothing; a second registration is refused by record-core and throws; a record with no seam is left alone", () => {
  const f = seeded();
  const before = snapshot(f);
  const n = f.x.counts({ sql: "(?)", args: ["A"] });
  assert.equal(typeof n.then, "undefined");
  assert.equal(f.x.textIndexOk(), true);
  assert.deepEqual(snapshot(f), before);
  assert.equal(f.x.registerFigures(), false);
  const other = new Extraction(f.s, { record: f.core, membership: f.membership });
  assert.throws(() => other.registerFigures(), /COUNTS_DECLARED/);
  assert.equal(new Extraction(f.s, { record: {} }).registerFigures(), false);
});

test("R67: extractionOf registers the figures once per storage, when the instance is first made", () => {
  const s = storage();
  const host = { storage: s };
  const record = recordOf(host); record.migrate();
  membershipOf(host, { record }).migrate();
  const x = extractionOf(host, { calibration: { onCalibration: () => ({ ok: true }) } });
  x.migrate();
  assert.equal(record.counts(null).textUnits, 0);
  assert.equal(extractionOf(host), x);
  assert.equal(record.registerCounts("someone", ["textUnits"], () => ({})).reason, "COUNTS_DECLARED");
});

test("R67: textIndexOk is true exactly when FTS5's integrity-check at rank 1 agrees with the content table, false when it throws; it is not one of R63's numbers", () => {
  const f = seeded();
  assert.equal(f.x.textIndexOk(), true);
  assert.equal("textIndexOk" in f.core.counts(null), false);
  /* An orphaned index entry: the base count still reads 5, the integrity check does not pass. */
  f.s.sql.exec(`INSERT INTO capture_text_fts(rowid, text) VALUES (99999, 'orphaned words')`);
  assert.equal(f.core.counts(null).textUnits, 5);
  assert.equal(f.x.textIndexOk(), false);
  /* no index at all is not an agreeing index */
  const g = fresh();
  g.s.sql.exec(`DROP TABLE capture_text_fts`);
  assert.equal(g.x.textIndexOk(), false);
});
