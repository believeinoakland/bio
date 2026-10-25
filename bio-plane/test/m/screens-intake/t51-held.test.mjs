/* screens-intake R51 (T51 fix round; DEC-384): a held row drawn as ineligible has a door to its document, on the real served page over the REAL store
 * (fix round 10, K5054): the documents are held by real acts (the upload and the promotion), one declaring itself crucial, which the batch examination
 * (ratification's) refuses; the rows are what `heldcaptures` answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openWorld, members, main, word, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
/* A document held by the member's real acts (`captureupload`, `allocid`, `promote`), as the recipe `hold` does it, but declaring the criticality asked. */
async function holdDoc(world, as, name, { criticality = "supporting", project = "" } = {}) {
  const bytes = new TextEncoder().encode(`${name}\n`);
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`, init: { method: "POST", headers: { "content-type": "text/plain" }, body: bytes } }, as);
  const doc = up.json && up.json.result && up.json.result.document;
  if (!doc || !doc.capture) throw new Error(`captureupload was refused: ${JSON.stringify(up.json).slice(0, 300)}`);
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cap = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: " + criticality, "source_status: unchanged", "content_hash: sha256:" + cap,
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: cap }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: sha(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: sha(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: sha(dataset) }, { path: doc.file, blobSha: cap, sha256: cap, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + sha(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register: [{ sha256: cap, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }] } });
  return { sha: cap, bundle: made.bundleId || id };
}
const open = (t) => openWorld("/app/held", { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });
const row = (p, id) => main(p).querySelector(`#pick-held-${id}`).closest("tr, .cs-r, li, div");

test("R51 an ineligible row draws its sentence by key and an Open it link to its document; the lone ineligible row draws the .alone key", async () => {
  const t = await members({ mai: [] });
  const lease = await holdDoc(t.world, t.mai, "Lease", { criticality: "crucial" });
  const p = await open(t);
  const r = row(p, lease.bundle);
  assert.ok(saysIn(r, "screen.held.ineligible", { reason: word("screen.held.ineligible.crucial") }));
  assert.ok(saysIn(r, "screen.held.ineligible.alone"));
  const doors = r.querySelectorAll(`a[href*="${lease.bundle}"]`).filter((a) => a.textContent.includes(word("screen.capture.openit")));
  assert.equal(doors.length, 1, "one Open it door to the row's document");
});

test("R51 control: an eligible row draws no Open it link", async () => {
  const t = await members({ mai: [] });
  const budget = await holdDoc(t.world, t.mai, "Budget");
  const p = await open(t);
  const r = row(p, budget.bundle);
  assert.equal((await t.mai.read("heldcaptures", { query: { bundle_ids: budget.bundle } })).held[0].eligible, true, "the owner answers it eligible");
  assert.ok(!r.textContent.includes(word("screen.capture.openit")));
});
