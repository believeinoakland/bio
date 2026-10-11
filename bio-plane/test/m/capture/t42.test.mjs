/* capture, T42 (K2629) and T43 (N864, K2680) at the module's interface: R87, `declareTables()`, over record-core's real
   declaration door (its R21, R46) on the fixture's store: it declares capture's tables once per storage, and only when
   every one of them exists, as after `migrate`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, provenance, fresh } from "./fixture.mjs";
import { Capture, captureOf } from "../../../src/capture/index.mjs";
import { CAPTURE_PURGED_TABLES, CAPTURE_EXEMPT_TABLES } from "../../../src/capture/schema.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const MINE = [...CAPTURE_PURGED_TABLES, ...CAPTURE_EXEMPT_TABLES];
const capturesOf = (core) => core.declaredTables().filter((d) => d.module === "capture");
const DECLARED = { ok: true, module: "capture", declared: true };
const NOT_YET = { ok: true, module: "capture", declared: false };
const tablesOf = (s) => s.sql.exec(`SELECT name FROM sqlite_master WHERE type = 'table'`).map((r) => r.name);
/* A host with record-core migrated and a capture made through captureOf, capture's own tables not yet created. */
function host() {
  const s = storage();
  const ctx = { storage: s };
  const core = recordOf(ctx, {});
  core.migrate();
  const c = captureOf(ctx, { record: core, governor: {}, provenance: provenance(s) });
  return { s, ctx, core, c };
}

test("R87: declareTables declares every capture table to record-core once per storage, purged and exempt as listed, and answers the same on every later call, never throwing", () => {
  const { c, core } = fresh();
  const first = capturesOf(core);
  assert.deepEqual(first.map((d) => d.name).sort(), [...MINE].sort(), "each table once, as capture's");
  for (const d of first) assert.equal(d.purge, CAPTURE_EXEMPT_TABLES.includes(d.name) ? "exempt" : "clear", d.name);
  for (let i = 0; i < 3; i++) assert.deepEqual(c.declareTables(), DECLARED, `call ${i + 2}`);
  assert.deepEqual(capturesOf(core), first, "nothing declared again");
});

test("R87 (T43, N864): before capture's migrate none of its tables is declared and it answers declared: false, on every call, creating nothing; after migrate every table is declared; a second instance over the same record answers the same and throws for no table it already holds", () => {
  const { s, core, c } = host();
  const before = tablesOf(s);
  for (let i = 0; i < 2; i++) assert.deepEqual(c.declareTables(), NOT_YET, `before migrate, call ${i + 1}`);
  assert.deepEqual(capturesOf(core), [], "none declared");
  assert.deepEqual(tablesOf(s), before, "nothing created by asking");
  assert.doesNotThrow(() => c.migrate());
  assert.deepEqual(capturesOf(core).map((d) => d.name).sort(), [...MINE].sort(), "after migrate: every table");
  assert.deepEqual(c.declareTables(), DECLARED);
  const second = new Capture(s, { record: core, governor: {}, provenance: provenance(s) });
  assert.deepEqual(second.declareTables(), DECLARED, "a second instance over the same record: held, the same answer");
  assert.doesNotThrow(() => second.migrate());
  assert.deepEqual(capturesOf(core).map((d) => d.name).sort(), [...MINE].sort(), "still each table once");
});

test("R87 (T43, N864): with one of its tables missing it declares none, answering declared: false; the tables all there, it declares them", () => {
  const { s, core, c } = host();
  c.migrate();
  /* a fresh record over a storage where capture's tables exist but one: not all, so none */
  const s2 = storage();
  const core2 = recordOf({ storage: s2 }, {});
  core2.migrate();
  const c2 = new Capture(s2, { record: core2, governor: {}, provenance: provenance(s2) });
  for (const t of MINE.filter((t) => t !== "task_queue"))
    s2.db.exec(s.sql.exec(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`, t)[0].sql);
  assert.deepEqual(c2.declareTables(), NOT_YET, "task_queue absent");
  assert.deepEqual(capturesOf(core2), []);
  s2.db.exec(s.sql.exec(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'task_queue'`)[0].sql);
  assert.deepEqual(c2.declareTables(), DECLARED, "every table there: declared");
  assert.deepEqual(capturesOf(core2).map((d) => d.name).sort(), [...MINE].sort());
  assert.ok(core.declaredTables().length > 0);
});

test("R87 (negative controls): a table of capture's another module holds is a wiring fault and throws, naming the refusal; a record with no declaration seam answers NO_DECLARATION_SEAM on every call", () => {
  const { core, c } = host();
  assert.equal(core.declarePurge("other", [], { exempt: ["task_queue"] }).ok, true, "another module first, on a table still capture's");
  assert.throws(() => c.migrate(), /TABLE_DECLARED \(task_queue\)/);
  assert.equal(capturesOf(core).length, 0, "nothing of capture's declared");
  const bare = new Capture(storage(), { record: { evidenceStore: () => null }, governor: {}, provenance: null });
  const none = { ok: false, module: "capture", declared: false, reason: "NO_DECLARATION_SEAM" };
  assert.deepEqual([bare.declareTables(), bare.declareTables()], [none, none]);
});
