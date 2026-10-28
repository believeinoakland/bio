/* proto-mem/1f (THROWAWAY): proto-mem/lib.mjs promoteDoc with the one change a large upload needs: a capture stored in parts (doc.parts) lists each part file in `files` and the whole as ONE register row
   carrying `parts`, as bio-plane/src/screens-intake/capture.mjs lines 185-201 compose it. Without it op=promote refuses with C-18.1 "parts[0] names 'snapshots/...part000' which does not exist in the record". */
import { createHash, randomBytes } from "node:crypto";
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const ulen = (s) => Buffer.byteLength(s, "utf8");
const canon = (v) => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : v !== null && typeof v === "object" ? "{" + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
export async function promoteDocParts(w, doc, title) {
  const now = new Date().toISOString().split(".")[0] + "Z";
  const a = await w.call(`/?${new URLSearchParams({ op: "allocid", prefix: "INFO", year: now.slice(0, 4) })}`);
  const mid = a.json && (a.json.result || a.json);
  if (!mid || typeof mid.id !== "string") throw new Error("allocid failed " + JSON.stringify(a.json).slice(0, 300));
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
  const id = slug ? `${mid.id}-${slug}` : mid.id;
  const sha = doc.capture.sha256, bytes = doc.capture.bytes, locator = doc.locator;
  const dataset = canon({ documents: [{ bytes, locator, sha256: sha }] });
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + sha256(dataset), "source:", "  locator: " + JSON.stringify(locator), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const PROV_EMBED_MAX = 1048576 - 65536;
  let prov = JSON.stringify({ documents: [doc] }, null, 1), dropped = false;
  if (prov.length > PROV_EMBED_MAX || ulen(prov) > PROV_EMBED_MAX) { const { reading: _r, text_units: _u, text_units_over_bound: _o, text_units_skipped: _k, ...unread } = doc; prov = JSON.stringify({ documents: [unread] }, null, 1); dropped = true; }
  const parts = Array.isArray(doc.parts) && doc.parts.length ? doc.parts : null;
  const files = [{ path: "bundle.md", text, bytes: ulen(text), sha256: sha256(text) }, { path: "data/provenance.json", text: prov, bytes: ulen(prov), sha256: sha256(prov) }, { path: "data/dataset.json", text: dataset, bytes: ulen(dataset), sha256: sha256(dataset) },
    ...(parts ? parts.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes })) : [{ path: doc.file, blobSha: sha, sha256: sha, bytes }])];
  const split = parts && parts.length > 1 ? parts : parts && parts.length === 1 && parts[0].sha256 !== sha ? parts : null;
  const register = [split ? { sha256: sha, path: doc.file, encoding: "binary", bytes, parts: split.map((p) => ({ sha256: p.sha256, path: p.file, bytes: p.bytes })) } : { sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes }];
  const p = await w.call("/?op=promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + randomBytes(4).toString("hex"),
    meta: { object_type: "information", group: "Proto-mem Team", title, current_state: "collected", created: now, last_updated: now }, files, register }) });
  return { status: p.status, result: p.json && (p.json.result || p.json), dropped, id, parts: parts ? parts.length : 0 };
}
