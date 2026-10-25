import { test } from "node:test";
import { createHash } from "node:crypto";
import { inWorld, readHeld } from "./world.mjs";
const hex = (s) => createHash("sha256").update(s).digest("hex");
const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
async function holdRead(world, as, name, text, project, entities) {
  const bytes = new TextEncoder().encode(text);
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`,
    init: { method: "POST", headers: { "content-type": "text/plain" }, body: bytes } }, as);
  const doc = resultOf(up).document;
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const minted = await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const withReading = { ...doc, reading: { content_type: "text/plain", found: true, entities, at: now } };
  const prov = JSON.stringify({ documents: [withReading] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id };
}
test("explore", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const ent = await me.act("entitycreate", { body: { kind: "body", label: "Public Works Department", note: "The city department." } });
  const held = await holdRead(world, me, "Lease.txt", "Public Works Department adopted the budget on March 3, 2026.", project, [{ kind: "body", key: "public-works", label: "Public Works Department" }]);
  const units = await readHeld(world, me, held.sha);
  console.log("UNITS", JSON.stringify(units).slice(0,200));
  const r = await me.act("resolve", { body: { captureSha: held.sha } });
  console.log("RESOLVE", JSON.stringify(r));
  const def = await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "the code", citation: "Code 1", stages: [{ key: "sent", label: "Request sent", after: null, within: null, required: "always", cardinality: "1" }, { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "unless_exception", cardinality: "0..1" }] } });
  console.log("DEF", JSON.stringify(def));
  const th = await me.act("thread", { body: { progressionKey: "pra", entityId: ent.entity_id, placements: [{ stage: "sent", captureSha: held.sha }] } });
  console.log("THREAD", JSON.stringify(th).slice(0,1500));
  console.log("INSTS", JSON.stringify(await me.read("instances", { query: { set: ent.entity_id } })));
});
