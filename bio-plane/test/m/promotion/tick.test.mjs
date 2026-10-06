/* R30 (N631, K1718), composed: a monitoring tick as `monitoring` R8 writes one (mechanical, `monitor-tick`, every other
 * file carried unchanged) promoted through this module into record-core itself, and the gate run over the image
 * record-core serves for it (its `readImage`, R15–R17). C-20.1 counts a carried file as written only when it is new to
 * the tick's own pre-image snapshot or differs from its copy there; whether it changed is judged against that copy
 * alone, and a copy that cannot be compared is stated undetermined (R37), neither a pass nor an error. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { promotionOf, runGate } from "../../../src/promotion/index.mjs";
import { makeMembership, doc, sha, T0, T1 } from "./fixtures.mjs";

/* A Durable Object storage at the plane's shape (`sql.exec` answers an iterable cursor; `transactionSync` nests as
   savepoints), over node:sqlite, with record-core's own schema. */
function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const cursor = (rows) => { const it = rows[Symbol.iterator](); return Object.assign(it, { toArray: () => [...it],
    one: () => { const r = [...it]; if (r.length !== 1) throw new Error(`expected one row, got ${r.length}`); return r[0]; } }); };
  const bind = (v) => (v === undefined ? null : v);
  const sql = { exec(q, ...a) { const st = db.prepare(q);
    return cursor(st.columns().length ? st.all(...a.map(bind)).map((r) => ({ ...r })) : (st.run(...a.map(bind)), [])); } };
  for (const t of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";"))
    if (t.trim()) db.exec(t);
  return { sql, db, transactionSync(fn) { const sp = `sp${n++}`; db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; } catch (e) { db.exec(`ROLLBACK TO ${sp}; RELEASE ${sp}`); throw e; } } };
}

const ID = "INFO-2026-0001";
const md = (over = {}, log = "") => doc({ id: ID, object_type: "information", title: "A report", current_state: "collected",
  prior_state: null, created: T0, last_updated: T0, group: "test-group", source_status: "live", ...over }, `\n## Session Log\n${log}`);
const DATASET = JSON.stringify({ rows: [[1, "a"], [2, "b"]] });

function world() {
  const record = recordOf({ storage: storage() });
  record.migrate();
  const p = promotionOf({}, { record, membership: makeMembership(), now: () => "2026-09-26T12:00:00.000Z" });
  p.registerFact("producingGroup", "legacy-store", () => "test-group");
  p.registerFact("citedBy", "legacy-store", () => []);
  p.registerFact("caseMember", "legacy-store", () => false);
  return { p, record };
}
/* A member's creation holding `data/dataset.json` (inline, or as a blob), then a tick over it. */
function created(p, blob) {
  const data = blob ? { path: "data/dataset.json", blobSha: sha(DATASET), bytes: Buffer.byteLength(DATASET) }
                    : { path: "data/dataset.json", text: DATASET };
  const r = p.promote({ bundleId: ID, base: null, snapKey: "k1", author: "member:ann", meta: {},
                        files: [{ path: "bundle.md", text: md() }, data] });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { r, data };
}
const tick = (p, base, dataset) => p.promote({ bundleId: ID, base, snapKey: "k2", author: "bio-monitor", meta: {},
  writer: "mechanical", operation: "monitor-tick",
  files: [{ path: "bundle.md", text: md({ last_updated: T1, monitoring: undefined }, "\n- tick: compared raw, unchanged\n") }, dataset] });
const gate = (image) => runGate({ bundleId: ID, image, knownIds: new Set([ID]), hasCapture: async () => ({ present: true }), registers: [] });
const c201 = (g) => g.findings.filter((f) => f.check === "C-20.1").map((f) => f.detail);

test("R30 (N631): a monitoring tick that carries data/dataset.json unchanged adds no C-20.1 finding at the gate", async () => {
  const { p, record } = world();
  const { r } = created(p, false);
  const t = tick(p, r.bundleSha, { path: "data/dataset.json", text: DATASET });
  assert.equal(t.ok, true, JSON.stringify(t));
  const image = record.readImage(ID);
  assert.equal(image["_history/data/dataset_k2.json"], DATASET, "the tick's pre-image snapshot holds the carried file");
  const g = await gate(image);
  assert.deepEqual(c201(g), []);
});

test("R30 (N631): a tick that changes the carried data/dataset.json wrote it, outside the envelope: C-20.1's error", async () => {
  const { p, record } = world();
  const { r } = created(p, false);
  assert.equal(tick(p, r.bundleSha, { path: "data/dataset.json", text: JSON.stringify({ rows: [] }) }).ok, true);
  const g = await gate(record.readImage(ID));
  assert.deepEqual(c201(g), ["mechanical 'monitor-tick' promotion 'k2' wrote 'data/dataset.json', outside the mechanical envelope (bundle.md, snapshots/, data/changes.json, data/provenance.json, data/snapshot-manifest.json)"]);
  assert.equal(g.ok, false);
});

test("R30 (N631): a carried file held as a blob is compared by its stated digest, never fetched", async () => {
  const { p, record } = world();
  const { r, data } = created(p, true);
  assert.equal(tick(p, r.bundleSha, data).ok, true);
  const image = record.readImage(ID);
  assert.equal(typeof image["_history/data/dataset_k2.json"], "object", "the copy is a blob reference");
  assert.deepEqual(c201(await gate(image)), []);
});

test("R30 (N631), R37: a copy the image does not hold is undetermined, said as a warning, never an error or a silent pass", async () => {
  const { p, record } = world();
  const { r } = created(p, false);
  assert.equal(tick(p, r.bundleSha, { path: "data/dataset.json", text: DATASET }).ok, true);
  const image = record.readImage(ID);
  delete image["_history/data/dataset_k2.json"];
  const g = await gate(image);
  assert.deepEqual(c201(g), [], "no error-severity C-20.1 finding");
  const { recordChecks } = await import("../../../src/promotion/index.mjs");
  const files = new Map(Object.entries(image).filter(([, v]) => typeof v === "string"));
  const warned = (await recordChecks({ folderName: ID, files, raw: image, sha256: async (v) => sha(v) }))
    .filter((f) => f.check === "C-20.1");
  assert.deepEqual(warned.map((f) => f.severity), ["warn"]);
  assert.match(warned[0].message, /named 'data\/dataset\.json', outside the mechanical envelope, and whether it wrote it is undetermined: the pre-image snapshot lists it, but the image holds no copy/);
});
