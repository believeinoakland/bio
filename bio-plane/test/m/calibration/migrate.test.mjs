/* calibration: `migrate()` (R20), requirement-named tests at the module's interface (build/requirements/calibration.md).
   Each test names the requirement ids it checks in its title. The module runs over `storage.mjs`, here started
   without this module's tables, with record-core's real instance on it; a fresh storage per test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calibrationOf, CALIBRATION_TABLES } from "../../../src/calibration/index.mjs";
import { storage, dump } from "./storage.mjs";

const T0 = Date.UTC(2026, 8, 1);
const WHO = { principal: "member:m1" };
const probe = (over = {}) => ({ engine: "pdfjs", version: "4.0", at: "2026-09-01T00:00:00Z", cap: "B",
  probe_id: "P-1", probe_inputs: { corpus: "c1" }, scores: { cer: 0.02 }, ...over });
const INDEXES = ["calibrations_engine", "calibrations_drift", "calibration_signals_engine"];

/* Every table and index the storage holds, with the statement that made it. */
const schemaOf = (s) => Object.fromEntries(
  s.db.prepare(`SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name`).all()
    .map((r) => [r.name, `${r.type}: ${r.sql}`]));
const fresh = (opts) => { const s = storage(opts); return { s, c: calibrationOf({ storage: s }, { now: () => T0 }) }; };

test("R20: migrate() creates the three tables and their indexes where absent, the same statements as the schema text, and nothing else", () => {
  const { s, c } = fresh({ calibration: false });
  const before = schemaOf(s);
  for (const n of [...CALIBRATION_TABLES, ...INDEXES]) assert.ok(!(n in before), `${n} absent before`);
  const r = c.migrate();
  assert.deepEqual(r, { ok: true, created: ["calibrations", "calibration_subjects", "calibration_signals"] });
  const after = schemaOf(s);
  const ran = schemaOf(storage());   // the stand-in that ran `CALIBRATION_SCHEMA` as the legacy schema pass did
  assert.deepEqual(after, ran, "exactly the tables and indexes the schema text makes, statement for statement");
  for (const [n, v] of Object.entries(before)) assert.equal(after[n], v, `${n} unchanged`);
  assert.deepEqual(Object.keys(after).filter((n) => !(n in before)).sort(), [...CALIBRATION_TABLES, ...INDEXES].sort(),
                   "it adds these and nothing else");
  assert.equal(c.calibrationRecord(probe(), WHO).ok, true, "the services work on the tables it made");
});

test("R20: migrate() run twice, or over tables already held with rows in them, changes nothing", async () => {
  const { s, c } = fresh({ calibration: false });
  c.migrate();
  await c.calibrationSubjectRegister({ engine: "ocr", probe_id: "P-2" });
  c.calibrationRecord(probe(), WHO);
  await c.calibrationSignalRecord({ engine: "pdfjs", source: "notes" });
  const [rows, shape] = [dump(s), schemaOf(s)];
  assert.deepEqual(c.migrate(), { ok: true, created: [] });
  assert.deepEqual(c.migrate(), { ok: true, created: [] });
  assert.deepEqual(dump(s), rows); assert.deepEqual(schemaOf(s), shape);
  const held = fresh();   // a store whose schema pass already made the tables
  const heldShape = schemaOf(held.s);
  assert.deepEqual(held.c.migrate(), { ok: true, created: [] });
  assert.deepEqual(schemaOf(held.s), heldShape);
});

test("R20: migrate() creates only the tables absent, leaving a held one and its rows as they are", () => {
  const { s, c } = fresh();
  c.calibrationRecord(probe(), WHO);
  s.db.exec(`DROP TABLE calibration_signals`);   // its index goes with it
  const cals = dump(s, ["calibrations", "calibration_subjects"]);
  assert.deepEqual(c.migrate(), { ok: true, created: ["calibration_signals"] });
  assert.deepEqual(dump(s, ["calibrations", "calibration_subjects"]), cals);
  assert.deepEqual(schemaOf(s), schemaOf(storage()));
});
