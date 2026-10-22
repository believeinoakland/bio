/* Common fixture (R72 audit): a ~20 MiB three-part capture, as screens-intake promoteDocument promotes it. */
import { createHash } from "node:crypto";
export const MIB = 1024 * 1024;
export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
export const PARTS = [{ name: "p0", bytes: 8 * MIB }, { name: "p1", bytes: 8 * MIB }, { name: "p2", bytes: 4 * MIB + 17 }];
export const TOTAL = PARTS.reduce((n, p) => n + p.bytes, 0);
export function multipart(label, { when = "2026-09-27T00:00:00Z", extra = {} } = {}) {
  const held = PARTS.map((p, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: sha(`${label}:${p.name}`), bytes: p.bytes }));
  const whole = sha(`${label}:whole`);
  const doc = {
    file: `snapshots/${label}`, locator: `https://example.org/snapshots/${label}`, retrieved: when,
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: TOTAL },
    origin: { kind: "named_request" }, parts: held, ...extra };
  return { label, whole, held, doc };
}
/* promotion files + register for the multipart (parts alone in register, as the screen registers them) */
export function mpFiles(m, { md, otherDocs = [] }) {
  return {
    files: [{ path: "bundle.md", text: md },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [m.doc, ...otherDocs] }, null, 1) },
            ...m.held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: m.held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })) };
}

/* The real chain in provenance's own world (real record-core, membership, promotion, provenance), for modules whose
   test world stubs promotion: promote the multipart bundle there, then install the resulting `bundles` and `register`
   rows (all of them, as the chain wrote them) into the module world's storage. */
const PF = "/home/user/bio/bio-plane/test/m/provenance/fixture.mjs";
export async function realChain(label, { id = "INFO-2026-0001-big", mdFn = null, now, patch = null } = {}) {
  const { world, infoMd } = await import(PF);
  const w = world(now ? { now } : {});
  const m = multipart(label);
  if (patch) patch(m);
  const { files, register } = mpFiles(m, { md: mdFn ? mdFn(id) : infoMd(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp" + label, author: "member:alice", meta: { object_type: "information" }, files, register });
  if (!r.ok) throw new Error("real chain refused " + JSON.stringify(r).slice(0, 300));
  return { m, id, w, bundles: w.rows(`SELECT * FROM bundles`), register: w.rows(`SELECT * FROM register`) };
}
export function install(st, chain, { tables = ["bundles", "register"] } = {}) {
  for (const t of tables) {
    const rows = chain[t] ?? chain.w.rows(`SELECT * FROM ${t}`);
    const have = new Set([...st.sql.exec(`PRAGMA table_info(${t})`)].map((c) => c.name));
    for (const row of rows) {
      const cols = Object.keys(row).filter((c) => have.has(c));
      st.sql.exec(`INSERT OR REPLACE INTO ${t} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => row[c]));
    }
  }
}

/* A multipart whose bytes are real: `buf` split at 8 MiB, every part's and the whole's sha its bytes' own. */
export function multipartOfBytes(label, buf, { when = "2026-09-27T00:00:00Z", extra = {}, contentType = null } = {}) {
  const cuts = [];
  for (let o = 0; o < buf.length; o += 8 * MIB) cuts.push(buf.subarray(o, Math.min(buf.length, o + 8 * MIB)));
  const held = cuts.map((b, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: sha(b), bytes: b.length, bytesBuf: b }));
  const whole = sha(buf);
  const doc = {
    file: `snapshots/${label}`, locator: `https://example.org/snapshots/${label}`, retrieved: when,
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: buf.length, ...(contentType ? { content_type: contentType } : {}) },
    origin: { kind: "named_request" }, parts: held.map(({ bytesBuf, ...p }) => p), ...extra };
  return { label, whole, held, doc, buf };
}
/* pad a stored-entry zip (as test zipStored writes) with one more stored entry of `padBytes` bytes */
export async function padZip(zipBuf, padBytes) {
  const { zipStored } = await import("/home/user/bio/bio-plane/src/workbooks/xlsxwrite.mjs");
  const dv = new DataView(zipBuf.buffer, zipBuf.byteOffset, zipBuf.byteLength);
  const entries = []; let o = 0;
  while (dv.getUint32(o, true) === 0x04034b50) {
    const csize = dv.getUint32(o + 18, true), nlen = dv.getUint16(o + 26, true), xlen = dv.getUint16(o + 28, true);
    const name = new TextDecoder().decode(zipBuf.subarray(o + 30, o + 30 + nlen));
    entries.push([name, zipBuf.subarray(o + 30 + nlen + xlen, o + 30 + nlen + xlen + csize)]);
    o += 30 + nlen + xlen + csize;
  }
  entries.push(["docProps/pad.bin", Buffer.alloc(padBytes, 7)]);
  return Buffer.from(zipStored(entries));
}

/* the real chain for a given multipart (e.g. one of real bytes) */
export async function realChainOf(m, { id = "INFO-2026-0001-big", now } = {}) {
  const { world, infoMd } = await import(PF);
  const w = world(now ? { now } : {});
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp" + m.label, author: "member:alice", meta: { object_type: "information" }, files, register });
  if (!r.ok) throw new Error("real chain refused " + JSON.stringify(r).slice(0, 300));
  return { m, id, w, bundles: w.rows(`SELECT * FROM bundles`), register: w.rows(`SELECT * FROM register`) };
}
