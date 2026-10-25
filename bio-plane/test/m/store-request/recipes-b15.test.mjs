/* store-request R19 (STORE-REQUEST #6, B15 (3); SCREENS-INTAKE #27 J57 (5)): the recipes `parted`, `largeSheet` and `credential`, each over the real store, never a hand-built answer. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects"] };
const KEY = "world-capture-credentials-key-7e2b4f90a1c6d385";

test("R19 recipes.parted: a file past one part is held by the real upload in parts, filed by the real promotion, and the whole reads back by its digest; a smaller file is refused as not in parts", async () => {
  const w = await storeWorld();
  const mai = await w.signIn("mai", caps);
  const projectId = await w.recipes.project(mai, "A packet");
  const held = await w.recipes.parted(mai, "Board packet", { project: projectId });
  assert.ok(held.parts.length >= 2, "the store cut it into parts");
  assert.equal(held.parts.reduce((n, p) => n + p.bytes, 0), held.bytes, "the parts are the whole, in order");
  assert.ok(held.parts.every((p) => /^[0-9a-f]{64}$/.test(p.sha256) && p.sha256 !== held.sha), "a part's digest is never the whole's");
  const at = await mai.read("heldat", { query: { sha256: held.sha } });
  assert.equal(at.held, true, JSON.stringify(at).slice(0, 300));
  assert.equal(at.copy.document, held.bundle, "filed in the document the promotion made");
  const other = await w.recipes.parted(mai, "Another packet");
  assert.notEqual(other.sha, held.sha, "the bytes are distinct per name");
  await assert.rejects(() => w.recipes.parted(mai, "Too small", { bytes: 1024 }), /held whole, not in parts/);
});

test("R19 recipes.largeSheet: the store's own acquire reads the served sheet into a document whose provenance file is over what a promotion takes inline, and the whole promotion is refused OVERSIZE_INLINE", async () => {
  const w = await storeWorld();
  const mai = await w.signIn("mai", caps);
  const served = await w.recipes.largeSheet(mai, { acquire: true });
  assert.equal(served.answer.ok, true, JSON.stringify(served.answer).slice(0, 300));
  const doc = served.answer.document;
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  assert.ok(prov.length > 1048576, `the provenance file is ${prov.length} bytes`);
  assert.ok(doc.reading, "the reading is in the document the owner answers");
  const now = new Date(w.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const minted = await mai.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const text = (t) => ({ text: t, bytes: new TextEncoder().encode(t).length });
  const refused = await w.door({ url: "/api/?op=promote", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bundleId: minted.id + "-large", base: null,
    snapKey: now.replace(/[-:]/g, "") + "_large", meta: { object_type: "information", title: "Large", current_state: "collected", created: now, last_updated: now },
    files: [{ path: "bundle.md", ...text("---\nid: " + minted.id + "-large\n---\n") }, { path: "data/provenance.json", ...text(prov) }], register: [] }) } }, mai);
  const result = refused.json.result ?? refused.json;
  assert.equal(result.ok === false ? result.reason : null, "OVERSIZE_INLINE", JSON.stringify(result).slice(0, 300));
  const untouched = await w.recipes.largeSheet(mai, { address: "https://city.example/data/other.csv", rows: 10 });
  assert.equal(untouched.answer, undefined, "without `acquire` the recipe acts for nobody");
});

test("R19 recipes.credential: a member stores a credential by the real act; the entry lists for her and never carries the secret; a world without the instance's key is refused naming how to make it", async () => {
  const w = await storeWorld({ env: { CAPTURE_CREDENTIALS_KEY: KEY } });
  const mai = await w.signIn("mai", caps), bo = await w.signIn("bo", caps);
  const made = await w.recipes.credential(mai, { host: "records.example.gov", secret: "mai-login-secret-1" });
  assert.equal(made.ok, true, JSON.stringify(made));
  const list = (await mai.read("capturecredentiallist")).entries;
  assert.deepEqual(list.map((e) => e.host), ["records.example.gov"]);
  assert.ok(list[0].supplied_by.endsWith("mai"));
  assert.ok(!JSON.stringify([made, list]).includes("mai-login-secret-1"));
  assert.deepEqual((await bo.read("capturecredentiallist")).entries, [], "another member sees none");
  const bare = await storeWorld();
  const ann = await bare.signIn("ann", caps);
  await assert.rejects(() => bare.recipes.credential(ann), /storeWorld\(\{ env: \{ CAPTURE_CREDENTIALS_KEY \} \}\)/);
});
