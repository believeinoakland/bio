/* capture, T42 (K2629) at the module's interface: R87, `declareTables()`, which `doorbell` R25 calls before declaring its
   own tables, over record-core's real declaration door (its R21, R46) on the fixture's store. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, provenance, fresh } from "./fixture.mjs";
import { Capture, captureOf } from "../../../src/capture/index.mjs";
import { CAPTURE_PURGED_TABLES, CAPTURE_EXEMPT_TABLES } from "../../../src/capture/schema.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const MINE = [...CAPTURE_PURGED_TABLES, ...CAPTURE_EXEMPT_TABLES];
const capturesOf = (core) => core.declaredTables().filter((d) => d.module === "capture");
const DECLARED = { ok: true, module: "capture", declared: true };

test("R87: declareTables declares every capture table to record-core once per storage, purged and exempt as listed, and answers the same on every later call, never throwing", () => {
  const { c, core } = fresh();
  const first = capturesOf(core);
  assert.deepEqual(first.map((d) => d.name).sort(), [...MINE].sort(), "each table once, as capture's");
  for (const d of first) assert.equal(d.purge, CAPTURE_EXEMPT_TABLES.includes(d.name) ? "exempt" : "clear", d.name);
  for (let i = 0; i < 3; i++) assert.deepEqual(c.declareTables(), DECLARED, `call ${i + 2}`);
  assert.deepEqual(capturesOf(core), first, "nothing declared again");
});

test("R87 (doorbell R25's order): called before capture's migrate, and by a second instance over the same record, it answers the same and throws for no table it already holds; capture's migrate then still succeeds", () => {
  const s = storage();
  const ctx = { storage: s };
  const core = recordOf(ctx, {});
  core.migrate();
  const c = captureOf(ctx, { record: core, governor: {}, provenance: provenance(s) });
  assert.deepEqual(c.declareTables(), DECLARED, "first, before migrate");
  assert.doesNotThrow(() => c.migrate());
  const second = new Capture(s, { record: core, governor: {}, provenance: provenance(s) });
  assert.deepEqual(second.declareTables(), DECLARED, "a second instance over the same record: held, the same answer");
  assert.doesNotThrow(() => second.migrate());
  assert.deepEqual(capturesOf(core).map((d) => d.name).sort(), [...MINE].sort(), "still each table once");
});

test("R87 (negative controls): a table another module holds is a wiring fault and throws, naming the refusal; a record with no declaration seam answers NO_DECLARATION_SEAM on every call", () => {
  const s = storage();
  const core = recordOf({ storage: s }, {});
  core.migrate();
  assert.equal(core.declarePurge("doorbell", [], { exempt: ["inbox"] }).ok, true, "another module first");
  const c = new Capture(s, { record: core, governor: {}, provenance: provenance(s) });
  assert.throws(() => c.declareTables(), /TABLE_DECLARED \(inbox\)/);
  assert.equal(capturesOf(core).length, 0, "nothing of capture's declared");
  const bare = new Capture(storage(), { record: { evidenceStore: () => null }, governor: {}, provenance: null });
  const none = { ok: false, module: "capture", declared: false, reason: "NO_DECLARATION_SEAM" };
  assert.deepEqual([bare.declareTables(), bare.declareTables()], [none, none]);
});
