/* plane G123g (fix round 9; R105): THE SHARED WORLD of `r8-lag.test.mjs` and `r8-wave.test.mjs`. The plane's own Worker and `Store` under Miniflare with the REAL alarm, behind the counting door of
   control-plane's round-8 kit (`wrap-entry.mjs`: every call to the object by route on `x-wrap-calls`), no debug route of ours: a member made by the founder's acts, a file uploaded by her
   (`POST /api?op=captureupload`, the raw body) and filed as the capture screen files it (`allocid`, then `promote` of the document with the capture as its file), so the reading has a home and the
   object's alarm reads it tick by tick. The administrator's `owedwork&sha=` is the read of the ledger. Inputs are made by the member's own acts (the E4 lesson). */
import { makeKit } from "../control-plane/r8-kit.mjs";

const hexOf = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((b) => b.toString(16).padStart(2, "0")).join("");
const R = (a) => (a && a.result !== undefined ? a.result : a);
export const MIB = 1048576;

/** a text of `bytes` bytes: 100-byte lines (the walker's A.md:22 shape), last line ENDMARKER */
export function textBytes(bytes) {
  const n = Math.floor((bytes - 60) / 100), parts = [];
  for (let i = 0; i < n; i++) parts.push(`line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".") + "\n");
  parts.push("ENDMARKER" + " ".repeat(bytes - n * 100 - 9));
  return Buffer.from(parts.join(""));
}
/** a CSV of about `bytes` bytes, last row LASTROWMARK */
export function csvBytes(bytes) {
  const out = ["id,name,amount,note\n"]; let n = 20;
  for (let i = 0; n < bytes; i++) { const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"\n`; out.push(r); n += r.length; }
  out.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"\n`);
  return Buffer.from(out.join(""));
}

export async function startWorld({ tag, handle = "wave-ann" }) {
  const kit = makeKit({ tag, counting: true });
  const { auth } = await kit.ownerOf(handle);
  const adm = await kit.founder();
  const cs = kit.screenCall(auth);
  const upload = async (body, name, type) => {
    const r = await kit.plane(`/api?op=captureupload&statement=${encodeURIComponent("the clerk's file")}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
      { method: "POST", headers: { ...auth, "content-type": "application/octet-stream" }, body });
    const j = await r.json();
    if (r.status !== 200 || R(j).ok === false) throw new Error("the upload was refused: " + JSON.stringify(j).slice(0, 300));
    return R(j);
  };
  /* what the capture screen does next: an information document with the capture as its file, filed by `promote` */
  const file = async (up) => {
    const now = new Date().toISOString().split(".")[0] + "Z", doc = up.document, sha = up.capture.sha256, bytes = up.capture.bytes;
    const a = R(await cs.call("allocid", { query: { prefix: "INFO", year: String(new Date().getUTCFullYear()) } }));
    const id = a.id, title = doc.file;
    const md = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
      "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
      "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + await hexOf(title), "source:", "  locator: " + JSON.stringify(doc.locator), "  authority: member-entered", "  retrieved: " + now,
      "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
    const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes, locator: doc.locator, sha256: sha }] });
    const len = (t) => new TextEncoder().encode(t).length;
    /* a file over the single-put size arrives in parts (acquisition's multipart): each part is a file of the document, and the whole is registered first */
    const parts = doc.parts && doc.parts.length ? doc.parts : null;
    const wholeFirst = parts && !parts.some((x) => x.sha256 === sha) ? [{ sha256: sha, path: doc.file, encoding: "binary", bytes }] : [];
    const p = R(await cs.call("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + sha.slice(0, 8), meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now },
      files: [{ path: "bundle.md", text: md, bytes: len(md), sha256: await hexOf(md) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: await hexOf(prov) },
              { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: await hexOf(dataset) },
              ...(parts ? parts.map((x) => ({ path: x.file, blobSha: x.sha256, sha256: x.sha256, bytes: x.bytes })) : [{ path: doc.file, blobSha: sha, sha256: sha, bytes }])],
      register: [...wholeFirst, ...(parts ? parts.map((x) => ({ sha256: x.sha256, path: x.file, encoding: "binary", bytes: x.bytes })) : [{ sha256: sha, path: doc.file, encoding: "binary", bytes }])] } }));
    if (p.ok === false) throw new Error("the document was refused: " + JSON.stringify(p).slice(0, 1500));
    return { id, sha };
  };
  const owedwork = async (sha) => R(await kit.get(adm, sha ? { op: "owedwork", sha } : { op: "owedwork" }));
  /** the ledger's last runs of one digest (the administrator's `owedwork&sha=`), `[]` before the first */
  const lastRuns = async (sha) => (await owedwork(sha)).last || [];
  /** until the digest's reading has run a REAL tick (a first run can find no home yet, outcome `retried`, because the filing follows the upload) or `maxPolls` of `everyMs` pass */
  async function untilRun(sha, { everyMs = 500, maxPolls = 600 } = {}) {
    for (let i = 0; i < maxPolls; i++) { const l = await lastRuns(sha); if (l.some((x) => x.outcome !== "retried")) return l; await kit.later(everyMs); }
    return [];
  }
  /** the ledger owes nothing of this digest */
  const owes = async (sha) => ((await owedwork(sha)).owed || []).length;
  return { kit, auth, adm, cs, upload, file, owedwork, lastRuns, untilRun, owes, R };
}
