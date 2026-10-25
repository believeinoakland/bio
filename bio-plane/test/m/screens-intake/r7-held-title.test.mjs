/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G75, a document the record holds without a stored title is named by the chain a delivery names a
 * document by (R54): its host and the day it was captured, never "Untitled capture" (two such rows could not be told apart in Held captures, nor the copy
 * "Already in the record as ..." from the one before it). `held` and the address tab's already-held row both draw the row's source (`heldcaptures`' `source`
 * with `retrieved`) when the row has no title; a row with a stored title draws it; a row with neither a host nor a day is the word, as before.
 * Fix round 10 (K5054): over the REAL store: a document fetched from an address by the real `acquire` (the address answered by the world's network) or
 * uploaded, promoted with the title asked (or none); the day a row was captured is read from what `heldcaptures` answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openWorld, members, main, fill, press, says, word, dayOf, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const GOVINFO = "https://www.govinfo.gov/content/pkg/BUDGET-2022-APP/pdf/BUDGET-2022-APP.pdf";
const site = (host, d) => ({ site: host, date: dayOf(d) });

/* A document held by the member's real acts: its bytes taken from `address` by `acquire` (the world's network answers the address), or uploaded
   (`captureupload`) when no address is given, and promoted at `collected` with the title given (none: the record stores no title). */
async function holdDoc(world, as, { address = null, title = null, name = "notice", bytes = null } = {}) {
  const body = bytes ?? `${name}\n`;
  let doc;
  if (address) {
    world.script(address, () => new Response(body, { status: 200, headers: { "content-type": "application/pdf" } }));
    doc = (await as.act("acquire", { body: { locator: address } })).document;
  } else {
    const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`, init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(body) } }, as);
    doc = up.json && up.json.result && up.json.result.document;
  }
  if (!doc || !doc.capture) throw new Error("the document was not captured");
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cap = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", ...(title ? ["title: " + JSON.stringify(title)] : []), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + cap,
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: cap }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: sha(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: sha(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: sha(dataset) }, { path: doc.file, blobSha: cap, sha256: cap, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + sha(id).slice(0, 8),
    meta: { object_type: "information", ...(title ? { title } : {}), current_state: "collected", created: now, last_updated: now }, files, register: [{ sha256: cap, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }] } });
  return { sha: cap, bundle: made.bundleId || id };
}
const rowOf = async (as, bundle) => (await as.read("heldcaptures", { query: { limit: 50, bundle_ids: bundle } })).held.find((r) => r.bundle_id === bundle);

test("R4 R54 (G75) Held captures names a row with no stored title by its host and the day it was captured; a stored title is drawn; neither host nor day is the word", async () => {
  const t = await members({ mai: [] });
  const bare = await holdDoc(t.world, t.mai, { address: GOVINFO, name: "Budget appendix" });
  const titled = await holdDoc(t.world, t.mai, { address: "https://www.govinfo.gov/content/pkg/BUDGET-2022-ADOPTED/pdf/adopted.pdf", title: "Adopted budget 2022", name: "Adopted" });
  const upload = await holdDoc(t.world, t.mai, { name: "Handed in" });
  const p = await openWorld("/app/held", { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });
  const link = (id) => main(p).querySelector(`a[href*="${id}"]`);
  const r = await rowOf(t.mai, bare.bundle);
  assert.equal(r.title, null, "the record stores no title for it");
  assert.equal(new URL(r.source.address).hostname, "www.govinfo.gov");
  const chain = word("document.untitled.web", site("www.govinfo.gov", r.source.retrieved));
  assert.equal(link(bare.bundle).textContent, chain, "the row is named by its host and the day it was captured");
  assert.equal(link(titled.bundle).textContent, "Adopted budget 2022", "a stored title is drawn");
  const u = await rowOf(t.mai, upload.bundle);
  assert.equal(u.title, null);
  assert.ok(!/^https?:/.test(u.source.address), "an upload names no host");
  assert.equal(link(upload.bundle).textContent, word("screen.held.untitled"), "neither a host nor a day to name it by: the word");
  assert.notEqual(link(bare.bundle).textContent, word("screen.held.untitled"));
});

test("R38 R54 (G75) the address tab's 'Already in the record as' names a copy with no stored title by its host and the day, not by Untitled capture", async () => {
  const t = await members({ mai: [] });
  const bare = await holdDoc(t.world, t.mai, { address: GOVINFO, name: "Budget appendix" });
  const p = await openWorld("/app/capture/address", { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });
  fill(p, { "ci-address": GOVINFO });
  await press(p, "acquire");
  const r = await rowOf(t.mai, bare.bundle);
  assert.ok(says(p, "document.untitled.web", site("www.govinfo.gov", r.source.retrieved)), "named by the chain a delivery uses");
  assert.equal(says(p, "screen.held.untitled"), false);
});
