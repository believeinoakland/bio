/* record-core's published fixtures (`fixtures.mjs`), each called here and its real answer checked. A user's test takes
   these answers from the fixture; this file is what keeps them record-core's own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { RECORD_CORE_CHECKS, PER_ITEM_CHECKS } from "../../../src/record-core/index.mjs";
import { coreOver, evidencePartsRefusal, perItemRetained, tableDeclarationRefusals } from "./fixtures.mjs";

test("R21 R34: coreOver answers bundleInfo, declarePurge and declareTable as record-core does, over the test's own database", () => {
  const db = new DatabaseSync(":memory:");
  const core = coreOver(db);
  assert.equal(core.bundleInfo("PROJ-2026-0001"), null);
  core.addBundle("PROJ-2026-0001", "project", "A project");
  assert.deepEqual(core.bundleInfo("PROJ-2026-0001"), { id: "PROJ-2026-0001", type: "project", title: "A project", project: null });
  assert.deepEqual(core.declarePurge("m", ["m_t"]), { ok: true });
  const twice = core.declarePurge("n", ["m_t"]);
  assert.deepEqual([twice.reason, twice.table, twice.declaredBy], ["TABLE_DECLARED", "m_t", "m"]);
  const e = { name: "m_u", purge: "clear", expunge: "none", export: "admin-only", sight: "bundle", derive: "stored", version_chain: false };
  const { sight, ...noSight } = e;
  assert.deepEqual([core.declareTable("m", [noSight]).reason, core.declareTable("m", [noSight]).class], ["TABLE_CLASS_MISSING", "sight"]);
  assert.equal(core.declareTable("m", [{ ...e, sight: "nobody" }]).reason, "TABLE_CLASS_UNKNOWN");
  assert.deepEqual(core.declareTable("m", [e]), { ok: true });
  assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM bundles`).get().n, 1, "the rows are in the test's database");
});

test("R38 R87: evidencePartsRefusal answers EVIDENCE_STORE_REFUSED (C-102.39) whether the store's completion fails or its upload throws", async () => {
  const { refused, threw } = await evidencePartsRefusal();
  for (const r of [refused, threw]) {
    assert.deepEqual([r.ok, r.code, r.check], [false, "EVIDENCE_STORE_REFUSED", "C-102.39"]);
    assert.equal(r.translation, RECORD_CORE_CHECKS.EVIDENCE_STORE_REFUSED.translation);
    assert.equal(typeof r.detail, "string");
  }
  assert.match(refused.detail, /R2 is down/);
  assert.match(threw.detail, /would not begin/);
});

test("R49 R50 R55: perItemRetained answers SET_ITEMS_RETAINED (C-75.5) with one applied item and one retained", () => {
  const { answer: r, seen } = perItemRetained();
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, "SET_ITEMS_RETAINED", "SET_ITEMS_RETAINED", "C-75.5", PER_ITEM_CHECKS.SET_ITEMS_RETAINED.translation]);
  assert.deepEqual([r.op, r.weight, r.count, r.applied, r.retained], ["taskresolve", "per-item", 2, 1, 1]);
  assert.deepEqual(r.items.map((i) => [i.index, i.outcome]), [[0, "applied"], [1, "retained"]]);
  assert.equal(r.items[1].reason, "SET_ITEM_MALFORMED");
  assert.deepEqual(seen, [{ id: "a", actor: "m" }], "the act ran for the item that applies alone");
});

test("R21 R80: tableDeclarationRefusals answers TABLE_DECLARED naming its holder, TABLE_NAME_INVALID and TABLE_CLASS_UNKNOWN", () => {
  const r = tableDeclarationRefusals("tx", { by: "holder" });
  assert.deepEqual(r.first, { ok: true });
  for (const x of [r.declaredAgainByPurge, r.declaredAgainByTable]) {
    assert.deepEqual([x.ok, x.code, x.check, x.table, x.declaredBy], [false, "TABLE_DECLARED", "C-102.27", "tx", "holder"]);
    assert.equal(x.module, "holder-again");
  }
  assert.deepEqual([r.invalidName.code, r.invalidName.check], ["TABLE_NAME_INVALID", "C-102.26"]);
  assert.deepEqual([r.unknownClass.code, r.unknownClass.check, r.unknownClass.class], ["TABLE_CLASS_UNKNOWN", "C-102.22", "purge"]);
});
