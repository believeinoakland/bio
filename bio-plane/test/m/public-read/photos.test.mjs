/* public-read — every published photo travels only as its copy without metadata (R23, R3, R5; T38: N779, K2248, K2303).
   A `/7` case edition carries two real photos: a phone JPEG with marked areas, and a screenshot PNG with nothing to obscure,
   each full of camera and editor metadata (EXIF with make and GPS, XMP, ICC, text chunks; `image-cover`'s own fixtures).
   Each row states `obscured` (`case-grammar` R12): the marked one with the label, the unmarked one with none. The copies
   are what `case-carriage` R11 derives, `image-cover.coverAreas` over the original with the marks' areas or with none; the
   commit's registration (`publication` R57) and the published bucket's copy (`ratification` R39) are stood in for as in
   `obscured.test.mjs`. The originals' bytes are put in the published bucket as well, so that only this module's own
   decisions keep them from being served. The case file is then read back as a stranger reads it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { world, stubOf, bucket, V, NOW, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { coverAreas } from "../../../src/image-cover/index.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";
import { caseFilePath, materialsOf } from "../../../src/case-grammar/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};
const bytesOf = async (r) => new Uint8Array(await r.arrayBuffer());
const dec = (b) => new TextDecoder().decode(b);
const hex = (b) => createHash("sha256").update(b).digest("hex");
const photo = (name) => new Uint8Array(readFileSync(new URL(`../image-cover/fixtures/${name}`, import.meta.url)));

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const MARKED = "INFO-2026-0030-street", PLAIN = "INFO-2026-0031-screen";
const LABEL = "Faces and plates obscured for publication; the group holds the original";
/* What the originals carry beside their pixels (`image-cover`'s fixtures, `make-fixtures.py`): none may leave. */
const METADATA = ["TestCam", "Phone One", "PhoneOS", "PersonInImage", "http://ns.adobe.com", "XML:com.adobe.xmp", "ICC_PROFILE",
                  "MPF\0", "taken by member", "face-region", "member 7"];

/* The metadata a copy holds, as a list of what it is (empty when it holds none): a JPEG's segments other than the frame,
   its tables, a bare JFIF or Adobe marker and an EXIF holding Orientation alone; a PNG's chunks other than the image's own
   and an eXIf holding Orientation alone; anything after the image's end. An orientation-only EXIF is the 26-byte TIFF
   `image-cover` R2 writes: one IFD entry (tag 0x0112), no next IFD. */
const orientationOnly = (t) => {
  if (t.length !== 26) return false;
  const le = t[0] === 0x49, u16 = (o) => (le ? t[o] | (t[o + 1] << 8) : (t[o] << 8) | t[o + 1]);
  const u32 = (o) => (le ? (t[o] | (t[o + 1] << 8) | (t[o + 2] << 16) | (t[o + 3] << 24)) >>> 0
                         : ((t[o] << 24) | (t[o + 1] << 16) | (t[o + 2] << 8) | t[o + 3]) >>> 0);
  const ifd = u32(4);
  return ifd === 8 && u16(8) === 1 && u16(10) === 0x0112 && u32(22) === 0;
};
function metadataIn(d) {
  const found = [];
  if (d[0] === 0xff && d[1] === 0xd8) {
    let i = 2;
    while (i + 4 <= d.length) {
      const m = d[i + 1], len = (d[i + 2] << 8) | d[i + 3], body = d.subarray(i + 4, i + 2 + len);
      if (m === 0xda) { const end = Buffer.from(d).lastIndexOf(Buffer.from([0xff, 0xd9])); if (end + 2 !== d.length) found.push("bytes after EOI"); break; }
      if (m === 0xe1 && !(dec(body.subarray(0, 6)) === "Exif\0\0" && orientationOnly(body.subarray(6)))) found.push(`APP1 ${dec(body.subarray(0, 28))}`);
      else if (m >= 0xe2 && m <= 0xef && m !== 0xee) found.push(`APP${m - 0xe0}`);
      else if (m === 0xfe) found.push("COM");
      i += 2 + len;
    }
    return found;
  }
  let i = 8;
  while (i + 8 <= d.length) {
    const len = Buffer.from(d).readUInt32BE(i), type = dec(d.subarray(i + 4, i + 8)), body = d.subarray(i + 8, i + 8 + len);
    if (type === "eXIf" ? !orientationOnly(body) : !["IHDR", "PLTE", "tRNS", "IDAT", "IEND"].includes(type)) found.push(type);
    i += 12 + len;
    if (type === "IEND") { if (i !== d.length) found.push("bytes after IEND"); break; }
  }
  return found;
}

/* A photo held as a capture of its own bundle, its bytes binary in the evidence store, as a member's upload is. */
function holdPhoto(w, id, bytes) {
  const s = hex(bytes), path = `snapshots/${id}.bin`;
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `k-${id}`, author: V("olive"),
    files: [{ path: "bundle.md", text: w.text(DOC).replace(new RegExp(DOC, "g"), id) },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [] }) }],
    meta: { object_type: "information" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 2000));
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents: [
    { file: path, capture: { method: "upload", grade: "B", sha256: s, bytes: bytes.length } }] }), id);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                s, id, path, bytes.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                id, path, s, bytes.length, s);
  return s;
}
/* `publication` R57's registration of a copy under its row's ref, and `ratification` R39's copy to the published bucket. */
function registerCopy(w, env, ref, bytes) {
  const s = hex(bytes);
  w.st.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                 ON CONFLICT(sha256,bundle_id,path) DO NOTHING`, s, ref, `materials/${s}`, "obscured", bytes.length, NOW);
  env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
}
const row = (ref, s, extra = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                       included: true, rests_under: "load_bearing", ...extra });

async function scene() {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  const docSha = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  const originals = { [MARKED]: photo("phone-420-o6.jpg"), [PLAIN]: photo("screenshot-rgba-o6.png") };
  /* the fixtures carry the metadata this file says they do (the claim's own control) */
  for (const [ref, b] of Object.entries(originals)) assert.ok(metadataIn(b).length > 0, `${ref}'s original carries metadata`);
  const shas = { [MARKED]: holdPhoto(w, MARKED, originals[MARKED]), [PLAIN]: holdPhoto(w, PLAIN, originals[PLAIN]) };
  /* `case-carriage` R11: the marked photo's copy over its marks' areas, the unmarked one's with none */
  const marked = await coverAreas(originals[MARKED], { areas: [[60, 120, 130, 176], [0, 0, 9, 9]] });
  const plain = await coverAreas(originals[PLAIN], { areas: [] });
  assert.equal(marked.ok && plain.ok, true);
  assert.ok(marked.covered > 0 && plain.covered === 0);
  const copies = { [MARKED]: marked.bytes, [PLAIN]: plain.bytes };
  const materials = [row(DOC, docSha),
    row(MARKED, shas[MARKED], { included: false, obscured: { copy: hex(copies[MARKED]), label: LABEL } }),
    row(PLAIN, shas[PLAIN], { included: false, obscured: { copy: hex(copies[PLAIN]), label: null } })];

  if (w.p.caseCarriage && typeof w.p.caseCarriage.marksLapsed === "function") w.p.caseCarriage.marksLapsed = () => [];
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: materials.map((m) => ({ target: m.ref })) });
  const pin = w.head(F);
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials });
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  for (const ref of [MARKED, PLAIN]) {
    registerCopy(w, env, ref, copies[ref]);
    env.PUBLISHED.m.set(`bio/published/${shas[ref]}`, originals[ref]);
  }
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
                                            cs: w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  const m = JSON.parse(dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha }))));
  const zips = [];
  for (const p of m.parts) zips.push(await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: p.index })));
  const fm = parseFrontmatter(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, CASE, 1).text).data;
  return { w, env, out, m, zips, originals, shas, copies, docSha, rows: materialsOf(fm).materials };
}

test("R23 a marked photo and a photo with nothing to obscure each travel only as one file of kind obscured, the copy without metadata: no file of the case file is an original, holds an original's bytes, or carries EXIF beyond the orientation, XMP or any other metadata; the included document beside them travels whole", async () => {
  const { out, m, zips, originals, shas, copies, docSha, rows } = await scene();
  assert.deepEqual(rows.filter((r) => r.obscured).map((r) => [r.ref, r.obscured.label]), [[MARKED, LABEL], [PLAIN, null]],
                   "both rows state obscured as signed, the unmarked one with no label");
  for (const ref of [MARKED, PLAIN]) {
    assert.deepEqual(m.files.filter((f) => f.path.startsWith(`materials/${ref}/`)).map((f) => [f.path, f.kind, f.sha256]),
                     [[caseFilePath("obscured", ref), "obscured", hex(copies[ref])]], `${ref}: the copy and nothing else`);
    assert.notEqual(hex(copies[ref]), shas[ref]);
  }
  assert.equal(out.unheld.some((u) => u.ref === MARKED || u.ref === PLAIN), false, "both copies are held");
  /* every file of every part, read from the zips a stranger downloads */
  let seen = 0;
  for (const zip of zips) {
    const zc = readContainer(zip);
    assert.equal(zc.ok, true);
    for (const e of zc.entries) {
      const b = Buffer.from((await readPart(zip, zc, e.name)).bytes);
      seen += 1;
      for (const [ref, o] of Object.entries(originals)) {
        assert.notEqual(hex(b), shas[ref], `${e.name} is ${ref}'s original`);
        assert.equal(b.includes(Buffer.from(o.subarray(o.length >> 1, (o.length >> 1) + 64))), false, `${e.name} holds a run of ${ref}'s original`);
      }
      for (const s of METADATA) assert.equal(b.includes(Buffer.from(s)), false, `${e.name} holds "${s}"`);
      const f = m.files.find((x) => x.path === e.name);
      if (f && f.kind === "obscured") assert.deepEqual(metadataIn(new Uint8Array(b)), [], `${e.name}: metadata in the copy`);
    }
  }
  assert.equal(seen, m.files.length + zips.length, "every listed file, and each part's manifest, was read");
  assert.equal(m.files.filter((f) => f.kind === "obscured").length, 2);
  /* negative control: the included document is carried whole at its digest */
  assert.deepEqual(m.files.filter((f) => f.path.startsWith(`materials/${DOC}/`)).map((f) => [f.kind, f.sha256]), [["document", docSha]]);
});

test("R23 R3 R5 no route of this module serves a photo's original, marked or not, though the published bucket and the evidence store hold its bytes: publishedbytes answers NO_PUBLISHED_PART, the same bytes as for a hash never published, in raw and container form; verify answers it unpublished; publishedcase and the published manifest name only the copy; the copy answers by its hash", async () => {
  const { w, env, m, shas, copies } = await scene();
  const never = await (await call(w, env, "publishedbytes", { sha256: sha("never existed anywhere") })).json();
  for (const ref of [MARKED, PLAIN]) {
    for (const q of [{}, { format: "zip" }, { format: "zip", part: 1 }]) {
      const r = await call(w, env, "publishedbytes", { sha256: shas[ref], ...q });
      assert.equal(r.status, 404, `${ref} ${JSON.stringify(q)}`);
      const b = await r.json();
      assert.equal(b.reason, "NO_PUBLISHED_PART");
      assert.equal(b.check, "C-98.1");
      if (!q.format) assert.deepEqual({ ...b, sha256: null }, { ...never, sha256: null }, "as a hash never published");
    }
    const v = w.pr.verifySha(shas[ref]);
    assert.equal(v.published, false, `${ref}: verify`);
    assert.deepEqual(v.matches, []);
    /* the copy, by its hash: served, and it is the copy */
    const got = await call(w, env, "publishedbytes", { sha256: hex(copies[ref]) });
    assert.equal(got.status, 200);
    assert.deepEqual(Buffer.from(await bytesOf(got)), Buffer.from(copies[ref]));
  }
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true);
  const listed = JSON.stringify(c.files);
  for (const ref of [MARKED, PLAIN]) {
    assert.equal(listed.includes(shas[ref]), false, `publishedcase lists no file at ${ref}'s original`);
    assert.ok(c.files.some((f) => f.sha256 === hex(copies[ref])), `publishedcase lists ${ref}'s copy`);
  }
  const pm = JSON.stringify(w.pr.publishedManifest());
  for (const ref of [MARKED, PLAIN]) assert.equal(pm.includes(shas[ref]), false, `the published manifest names ${ref}'s original`);
  assert.equal(m.files.some((f) => Object.values(shas).includes(f.sha256)), false);
});
