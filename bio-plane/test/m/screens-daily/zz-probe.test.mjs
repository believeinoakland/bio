import "../../sandbox.mjs";
import test from "node:test";
import { storeWorld, } from "../store-request/fixtures.mjs";
import { createHash } from "node:crypto";
const hex = (s) => createHash("sha256").update(s).digest("hex");
async function heldAt(w, as, address, title, body) {
  body ??= "<html><head><title>" + title + "</title></head><body><p>" + address + title + "</p></body></html>";
  w.script(address, async () => new Response(body, { status: 200, headers: { "content-type": "text/html" } }));
  const got = await as.act("acquire", { body: { locator: address } });
  const doc = got.document;
  const now = new Date(w.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const minted = await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator, sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now }, files, register } });
  return made.bundleId || id;
}

const raw = (w, as, op, body, query = {}) => w.door({ url: `/api/?${new URLSearchParams({ op, ...query })}`, init: body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, as);


test("probe", { timeout: 120000 }, async () => {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const founder = await w.signIn("founder");
  await founder.act("reauth", { body: { password: founder.password } });
  console.log(JSON.stringify(resultOf(await raw(w, founder, "memberadd", { memberId: "ana", cover: "ana", role: "admin" }))).slice(0, 200));
  await rosa.act("reauth", { body: { password: rosa.password } });
  console.log(JSON.stringify(resultOf(await raw(w, rosa, "adminendorse", { memberId: "ana" }))).slice(0, 300));
  console.log(JSON.stringify(resultOf(await raw(w, rosa, "adminendorse", { memberId: "ana" }))).slice(0, 400));
  console.log(JSON.stringify(resultOf(await raw(w, founder, "adminendorse", { memberId: "ana" }))).slice(0, 400));
});
const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
