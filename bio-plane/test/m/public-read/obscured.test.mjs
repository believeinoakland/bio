/* public-read — a photo carried as its copy (R3, R23; T37; N757; DEC-180 (4); K2206). A `/7` case edition's `materials:` row
   states `obscured: {copy, label}` (`case-grammar` R12): the photo travels as a copy with its marked areas covered, the row
   `included: false`, its `sha` the original's. The commit registers the copy under the row's ref as kind `obscured`
   (`publication` R57 through `case-carriage` R1) and `ratification` R39 copies its bytes to the published bucket; this file
   stands in for both, as K2206 asks ("your tests seed the bucket"): the registration row is written as R57 writes it and
   the bytes are put where R39 puts them. The case file is then built by the Worker's assembly and read back as a stranger
   reads it. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, stubOf, bucket, V, NOW, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { ARCHIVE_HOLDS_ORIGINAL, ORIGINAL_NOT_CARRIED } from "../../../src/public-read/casefile.mjs";
import { serialiseContainer } from "../../../src/container.mjs";
import { readContainer, readPart, crc32 } from "../../../src/ooxml.mjs";
import { CASE_FILE_FORMAT, caseFileManifestCheck, caseFilePath, materialsOf } from "../../../src/case-grammar/index.mjs";
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

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const PHOTO = "INFO-2026-0020-photo", DOC = "INFO-2026-0001-minutes";
const LABEL = "Faces and plates obscured for publication; the group holds the original";
/* The copy's bytes: what `image-cover` derived (any bytes do here; public-read never reads inside them). */
const COPY = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new TextEncoder().encode("the photo, its marked areas covered"), 0xff, 0xd9]);
const COPY_SHA = hex(COPY);

const docRow = (ref, s, extra = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                          included: true, rests_under: "load_bearing", ...extra });
const copyRow = (ref, original, copy = COPY_SHA) =>
  docRow(ref, original, { included: false, obscured: { copy, label: LABEL } });
const capOf = (w, id) => w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, id).capture_sha;

/* `publication` R57's registration of an obscured copy (`case-carriage` R1's `files` row: `materials/<sha>`, kind
   `obscured`, under the row's ref), and `ratification` R39's copy of its bytes to the published bucket. */
function registerCopy(w, env, ref, bytes = COPY) {
  const s = hex(bytes);
  w.st.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                 ON CONFLICT(sha256,bundle_id,path) DO NOTHING`, s, ref, `materials/${s}`, "obscured", bytes.length, NOW);
  env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
}

/* The case edition over F, resting on `materials`, signed and published, F's bytes in the bucket; `before` runs after the
   commit and before the assembly (where R57's registration and R39's copy land). A commit refusal from `case-carriage`'s
   lapsed marks (`publication` R57, T37) is not this module's: the world's photos carry no marks, so it is answered none. */
async function publish(w, env, materials, { edition = 1, before = () => {} } = {}) {
  if (w.p.caseCarriage && typeof w.p.caseCarriage.marksLapsed === "function") w.p.caseCarriage.marksLapsed = () => [];
  if (edition === 1) w.member("olive");
  const proj = edition === 1 ? w.project("Parks", "olive") : w.p.caseEditionState(CASE, 1).project;
  if (edition === 1) w.inquiry(F, { legs: materials.map((m) => ({ target: m.ref })) });
  const pin = w.head(F);
  w.prepare(CASE, edition, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials });
  const signed = w.signCase(CASE, edition, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  if (edition === 1) assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  before();
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
                                            cs: w.p.caseEditionState(CASE, edition, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  const m = JSON.parse(dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha }))));
  const zip = await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: 1 }));
  const zc = readContainer(zip);
  assert.equal(zc.ok, true);
  const read = async (name) => (await readPart(zip, zc, name)).bytes;
  const fm = parseFrontmatter(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, CASE, edition).text).data;
  return { out, m, read, names: zc.entries.map((e) => e.name), rows: materialsOf(fm).materials };
}
function scene() {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  w.doc(PHOTO);
  return { w, env, original: capOf(w, PHOTO), docSha: capOf(w, DOC) };
}
const under = (m, ref) => m.files.filter((f) => f.path.startsWith(`materials/${ref}/`));

test("R23 a row carried as its copy carries the copy as one file of kind obscured under the row's ref, at the SHA-256 obscured.copy names, read by that hash from the published projection, and never the original's bytes, its extracted text, or an archive or container record of it; the case file states bio-case-file/3", async () => {
  const { w, env, original, docSha } = scene();
  const { out, m, read, names, rows } = await publish(w, env, [docRow(DOC, docSha), copyRow(PHOTO, original)],
                                                      { before: () => registerCopy(w, env, PHOTO) });
  assert.equal(CASE_FILE_FORMAT, "bio-case-file/3");
  assert.equal(m.format, "bio-case-file/3", "the case file states bio-case-file/3");
  assert.deepEqual(caseFileManifestCheck(m, { materials: rows }), [], "case-grammar R13's one check finds no departure");
  const path = caseFilePath("obscured", PHOTO);
  assert.equal(typeof path, "string");
  assert.deepEqual(under(m, PHOTO).map((f) => [f.path, f.kind, f.sha256, f.bytes]), [[path, "obscured", COPY_SHA, COPY.length]],
                   "the copy, one file of kind obscured, and nothing else under the row's ref");
  assert.deepEqual(Buffer.from(await read(path)), Buffer.from(COPY), "the copy's bytes, whole, from the published bucket");
  assert.ok(names.includes(path));
  /* never the original: no file at its digest anywhere, no document, extracted text, archive or container under its ref */
  assert.equal(m.files.some((f) => f.sha256 === original), false, "no file of the case file is the original");
  for (const kind of ["document", "extracted_text", "archive", "container"])
    assert.equal(m.files.some((f) => f.kind === kind && f.path.startsWith(`materials/${PHOTO}/`)), false, kind);
  for (const f of m.files) assert.notEqual(hex(Buffer.from(await read(f.path))), original, f.path);
  assert.equal(out.unheld.some((u) => u.ref === PHOTO), false, "the copy is held");
  /* negative control: the included material beside it is carried whole */
  assert.deepEqual(under(m, DOC).map((f) => f.kind), ["document"]);
});

test("R23 a copy whose bytes do not hash to obscured.copy, or that the commit did not register, is not carried and is named in unheld; the original is never carried in its place", async () => {
  const s1 = scene();
  const wrong = await publish(s1.w, s1.env, [copyRow(PHOTO, s1.original)], { before: () => {
    registerCopy(s1.w, s1.env, PHOTO);
    s1.env.PUBLISHED.m.set(`bio/published/${COPY_SHA}`, new TextEncoder().encode("not the copy"));
  } });
  assert.deepEqual(under(wrong.m, PHOTO), [], "the wrong bytes are never carried under the copy's name");
  assert.deepEqual(wrong.out.unheld.filter((u) => u.ref === PHOTO), [{ ref: PHOTO, sha: COPY_SHA, what: "obscured" }]);
  assert.equal(wrong.m.files.some((f) => f.sha256 === s1.original), false);
  /* bytes in the bucket at the copy's digest, but no registration under the row's ref: the projection does not carry it */
  const s2 = scene();
  const unregistered = await publish(s2.w, s2.env, [copyRow(PHOTO, s2.original)], { before: () => {
    s2.env.PUBLISHED.m.set(`bio/published/${COPY_SHA}`, COPY);
  } });
  assert.deepEqual(under(unregistered.m, PHOTO), []);
  assert.deepEqual(unregistered.out.unheld.filter((u) => u.ref === PHOTO), [{ ref: PHOTO, sha: COPY_SHA, what: "obscured" }]);
  /* negative control: registered, right bytes, carried */
  const s3 = scene();
  const right = await publish(s3.w, s3.env, [copyRow(PHOTO, s3.original)], { before: () => registerCopy(s3.w, s3.env, PHOTO) });
  assert.deepEqual(under(right.m, PHOTO).map((f) => f.kind), ["obscured"]);
});

test("R23 an included row at the original's digest carries nothing of those bytes: the original never travels under another ref, and no route serves it (T38)", async () => {
  const { w, env, original } = scene();
  const TWIN = "INFO-2026-0021-twin";
  const { m, out } = await publish(w, env, [copyRow(PHOTO, original), docRow(TWIN, original)],
                                   { before: () => registerCopy(w, env, PHOTO) });
  assert.equal(m.files.some((f) => f.sha256 === original), false);
  assert.deepEqual(under(m, TWIN), []);
  assert.deepEqual(out.unheld.filter((u) => u.ref === TWIN), [{ ref: TWIN, sha: original, what: "bytes", why: ORIGINAL_NOT_CARRIED }]);
  assert.deepEqual(under(m, PHOTO).map((f) => f.kind), ["obscured"], "the copy still travels");
  /* T38: whatever registered the original's bytes under the twin's ref, no route serves them */
  const never = await (await call(w, env, "publishedbytes", { sha256: sha("never existed anywhere") })).json();
  const r = await call(w, env, "publishedbytes", { sha256: original });
  assert.equal(r.status, 404);
  assert.deepEqual({ ...(await r.json()), sha256: null }, { ...never, sha256: null });
  assert.deepEqual(w.pr.verifySha(original), { published: false, sha256: original, matches: [] });
  assert.equal(w.pr.publishedManifest().shas.some((x) => x.sha256 === original), false);
});

test("R3 a row carried as its copy answers obscured: {copy, label} exactly as signed, the copy reached by its hash (R5); publishedbytes at the original's SHA-256 answers NO_PUBLISHED_PART, the same bytes as for material never published", async () => {
  const { w, env, original, docSha } = scene();
  const { m } = await publish(w, env, [docRow(DOC, docSha), copyRow(PHOTO, original)], { before: () => registerCopy(w, env, PHOTO) });
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true);
  const row = c.materials.materials.find((r) => r.ref === PHOTO);
  assert.deepEqual(row.obscured, { copy: COPY_SHA, label: LABEL }, "as signed, the label word for word");
  assert.equal(row.sha, original, "the row keeps the original's fingerprint");
  assert.equal(row.included, false);
  assert.equal(c.materials.materials.find((r) => r.ref === DOC).obscured, null, "a row without it answers obscured: null");
  /* the copy, by its hash */
  const got = await call(w, env, "publishedbytes", { sha256: COPY_SHA });
  assert.equal(got.status, 200);
  assert.deepEqual(Buffer.from(await bytesOf(got)), Buffer.from(COPY));
  assert.ok(m.files.some((f) => f.sha256 === COPY_SHA));
  /* nothing answers the original's bytes, though the evidence store holds them: as never published */
  const orig = await call(w, env, "publishedbytes", { sha256: original });
  const never = await call(w, env, "publishedbytes", { sha256: sha("never existed anywhere") });
  assert.equal(orig.status, 404);
  const [ob, nb] = [await orig.json(), await never.json()];
  assert.equal(ob.reason, "NO_PUBLISHED_PART");
  assert.equal(ob.check, "C-98.1");
  assert.deepEqual({ ...ob, sha256: null }, { ...nb, sha256: null }, "the same answer as for a hash never published");
  assert.equal(w.pr.verifySha(original).published, false);
  /* negative control: the included document beside it answers by its hash */
  assert.equal((await call(w, env, "publishedbytes", { sha256: docSha })).status, 200);
});

test("R28 R23 an order sealing the photo (its document path under the row's ref) withholds its copy from publishedbytes and marks it in the case file's listing; an unseal serves it again", async () => {
  const { w, env, original, docSha } = scene();
  await publish(w, env, [docRow(DOC, docSha), copyRow(PHOTO, original)], { before: () => registerCopy(w, env, PHOTO) });
  assert.equal((await call(w, env, "publishedbytes", { sha256: COPY_SHA })).status, 200);
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: [caseFilePath("document", PHOTO)] });
  const r = await call(w, env, "publishedbytes", { sha256: COPY_SHA });
  assert.equal(r.status, 451);
  assert.equal((await r.json()).reason, "WITHHELD_BY_COURT_ORDER");
  const c = w.read("publishedcase", { id: CASE });
  assert.deepEqual(c.files.filter((f) => f.withheld).map((f) => f.path), [caseFilePath("obscured", PHOTO)]);
  /* negative control: the other material is still served */
  assert.equal((await call(w, env, "publishedbytes", { sha256: docSha })).status, 200);
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 8 }, effect: "unseal", parts: [caseFilePath("document", PHOTO)] });
  assert.equal((await call(w, env, "publishedbytes", { sha256: COPY_SHA })).status, 200);
});

/* ---- an archive that holds the original (R23's "an archive … of it", as `case-carriage` R8 holds it at the commit) */

const MEMBER_TEXT = "The minutes of the meeting, as the archive carried them.\n";
const PHOTO_TEXT = "the photo's own bytes, faces and plates as taken\n";
const ARCH = "INFO-2026-0010-archive", MEM = "INFO-2026-0011-member", PIC = "INFO-2026-0012-pic";
function localOffset(zip, name) {
  const want = Buffer.from(name);
  for (let i = 0; i + 30 <= zip.length; i++)
    if (zip.readUInt32LE(i) === 0x04034b50 && zip.subarray(i + 30, i + 30 + zip.readUInt16LE(i + 26)).equals(want)) return i;
  throw new Error(`no local header for ${name}`);
}
function containerOf(zip, index, name, data) {
  const z = Buffer.from(zip), off = localOffset(z, name);
  return { archive_sha256: hex(z), index, path: name, name_raw: Buffer.from(name).toString("hex"), method: 0,
           crc32: crc32(new Uint8Array(Buffer.from(data))), compressed: z.readUInt32LE(off + 18), uncompressed: Buffer.byteLength(data),
           local_offset: off, member_sha256: hex(Buffer.from(data)), dos_time_stated: "1980-01-01T00:00:00",
           name_shared: 1, path_unsafe: false };
}
const infoText = (w, id) => w.text(DOC).replace(new RegExp(DOC, "g"), id);
function promote(w, id, documents, inline = []) {
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `k-${id}`, author: V("olive"),
    files: [{ path: "bundle.md", text: infoText(w, id) }, ...inline.map((f) => ({ path: f.path, text: f.text })),
            { path: "data/provenance.json", text: JSON.stringify({ documents: [] }) }],
    meta: { object_type: "information" },
    register: inline.map((f) => ({ sha256: sha(f.text), path: f.path, encoding: "utf8", bytes: Buffer.byteLength(f.text) })) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 2000));
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents }), id);
}
/* `acquisition`'s record of an archive's listing (its R38), as its unpack writes it: `case-carriage` R8 (T38; K2291 (2))
   reads it, and an archive whose listing names an image (here `photo.jpg`) is carried by no commit from T38 on. */
function recordListing(w, archiveSha, entries) {
  w.st.sql.exec(`CREATE TABLE IF NOT EXISTS archive_entries (archive_sha TEXT NOT NULL, idx INTEGER NOT NULL, name TEXT, kind TEXT,
                 state TEXT NOT NULL, sha256 TEXT, PRIMARY KEY (archive_sha, idx))`);
  w.st.sql.exec(`INSERT OR IGNORE INTO archive_entries (archive_sha, idx, state) VALUES (?, -1, 'opened')`, archiveSha);
  entries.forEach(([name, text], i) => w.st.sql.exec(`INSERT OR REPLACE INTO archive_entries
    (archive_sha, idx, name, kind, state, sha256) VALUES (?, ?, ?, 'file', 'filed', ?)`, archiveSha, i, name, sha(text)));
}
/* The archive's registration under `ref` as an edition committed before T38 made it (`publication` R57 through
   `case-carriage` R8 as it then stood), its bytes already in the published bucket: the projection an older edition left. */
function registeredBeforeT38(w, ref, archiveSha, bytes) {
  w.st.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                 ON CONFLICT(sha256,bundle_id,path) DO NOTHING`, archiveSha, ref, `materials/${archiveSha}`, "archive", bytes, NOW);
}
const unpacked = (container, s, file) => ({ file, locator: `https://example.org/a.zip#zip:${container.index}`, retrieved: NOW,
  authority_state: "undetermined", authority_basis: "a file cut out of an archive",
  capture: { method: "unpacked", grade: "B", actor_class: "daemon", sha256: s, encoding: "binary", bytes: container.uncompressed },
  container, origin: { kind: "named_request" } });
function holdMember(w, id, text, container) {
  const path = `snapshots/zip-${container.archive_sha256}-${container.index}`;
  promote(w, id, [unpacked(container, sha(text), path)], [{ path, text }]);
  return sha(text);
}

test("R23 R32 an archive that holds a photo this edition carries as its copy is carried for no material and named in unheld, though an earlier edition carried it; the record naming the carried member still travels; no route serves the original or that archive (T38)", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  const zip = Buffer.from(serialiseContainer([{ name: "minutes.txt", bytes: new TextEncoder().encode(MEMBER_TEXT) },
                                              { name: "photo.jpg", bytes: new TextEncoder().encode(PHOTO_TEXT) }]).bytes);
  const archiveSha = hex(zip);
  promote(w, ARCH, [{ file: "snapshots/archive.zip", capture: { method: "acquire", grade: "B", sha256: archiveSha, bytes: zip.length } }]);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                archiveSha, ARCH, "snapshots/archive.zip", zip.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                ARCH, "snapshots/archive.zip", archiveSha, zip.length, archiveSha);
  env.PUBLISHED.m.set(`bio/published/${archiveSha}`, new Uint8Array(zip));
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, containerOf(zip, 0, "minutes.txt", MEMBER_TEXT));
  const picSha = holdMember(w, PIC, PHOTO_TEXT, containerOf(zip, 1, "photo.jpg", PHOTO_TEXT));
  recordListing(w, archiveSha, [["minutes.txt", MEMBER_TEXT], ["photo.jpg", PHOTO_TEXT]]);
  /* edition 1 carries both whole, the records registered under their refs; the archive as a commit before T38 registered
     it under MEM's ref (from T38 no commit carries an archive holding an image, `case-carriage` R8) */
  const one = await publish(w, env, [docRow(MEM, memberSha), docRow(PIC, picSha)]);
  assert.equal(one.m.files.some((f) => f.sha256 === archiveSha), false, "T38: the archive holding an image travels in no new edition");
  registeredBeforeT38(w, MEM, archiveSha, zip.length);
  assert.equal((await call(w, env, "publishedbytes", { sha256: archiveSha })).status, 200, "negative control: served while no edition obscures the photo");
  /* edition 2 carries the photo as its copy */
  const two = await publish(w, env, [docRow(MEM, memberSha), copyRow(PIC, picSha)],
                            { edition: 2, before: () => registerCopy(w, env, PIC) });
  assert.equal(two.m.files.some((f) => f.sha256 === archiveSha), false, "the archive holding the original is not carried");
  assert.equal(two.m.files.some((f) => f.sha256 === picSha), false, "nor the original");
  assert.deepEqual(two.out.unheld.filter((u) => u.what === "archive"),
                   [{ ref: MEM, sha: archiveSha, what: "archive", why: ARCHIVE_HOLDS_ORIGINAL }]);
  assert.deepEqual(under(two.m, MEM).map((f) => f.kind).sort(), ["container", "document"], "the member and its record still travel");
  assert.deepEqual(under(two.m, PIC).map((f) => f.kind), ["obscured"]);
  /* T38 (N779, K2248): once a published edition states the photo as its copy, no route serves its original or an archive
     holding it, though edition 1 registered both: each answers as a hash never published */
  const never = await (await call(w, env, "publishedbytes", { sha256: sha("never existed anywhere") })).json();
  for (const s of [picSha, archiveSha]) {
    const r = await call(w, env, "publishedbytes", { sha256: s });
    assert.equal(r.status, 404);
    assert.deepEqual({ ...(await r.json()), sha256: null }, { ...never, sha256: null });
    assert.deepEqual(w.pr.verifySha(s), { published: false, sha256: s, matches: [] });
    assert.equal(w.pr.publishedManifest().shas.some((x) => x.sha256 === s), false);
  }
  /* negative control: the member edition 1 also carried is still served */
  assert.equal((await call(w, env, "publishedbytes", { sha256: memberSha })).status, 200);
  assert.equal(w.pr.publishedManifest().shas.some((x) => x.sha256 === memberSha), true);
});

test("R32 R23 the archive pool keeps only what this edition's commit held (K2223): a photo never carried whole, in an archive an earlier edition registered under another material's ref, lends this edition neither the archive nor the original", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  const zip = Buffer.from(serialiseContainer([{ name: "minutes.txt", bytes: new TextEncoder().encode(MEMBER_TEXT) },
                                              { name: "photo.jpg", bytes: new TextEncoder().encode(PHOTO_TEXT) }]).bytes);
  const archiveSha = hex(zip);
  promote(w, ARCH, [{ file: "snapshots/archive.zip", capture: { method: "acquire", grade: "B", sha256: archiveSha, bytes: zip.length } }]);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                archiveSha, ARCH, "snapshots/archive.zip", zip.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                ARCH, "snapshots/archive.zip", archiveSha, zip.length, archiveSha);
  env.PUBLISHED.m.set(`bio/published/${archiveSha}`, new Uint8Array(zip));
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, containerOf(zip, 0, "minutes.txt", MEMBER_TEXT));
  const picSha = holdMember(w, PIC, PHOTO_TEXT, containerOf(zip, 1, "photo.jpg", PHOTO_TEXT));
  recordListing(w, archiveSha, [["minutes.txt", MEMBER_TEXT], ["photo.jpg", PHOTO_TEXT]]);
  /* edition 1 carries the member whole and lists the photo not included: the archive is registered under MEM only (as a
     commit before T38 registered it), and nothing of the photo (its own record included) is registered anywhere */
  const one = await publish(w, env, [docRow(MEM, memberSha), docRow(PIC, picSha, { included: false })]);
  assert.equal(one.m.files.some((f) => f.sha256 === archiveSha), false, "T38: the archive holding an image travels in no new edition");
  registeredBeforeT38(w, MEM, archiveSha, zip.length);
  assert.ok(w.pr.verifySha(archiveSha).published, "negative control: the projection holds the archive under MEM's ref");
  /* edition 2 carries the photo as its copy: its commit holds no archive holding the original (`case-carriage` R8) */
  const two = await publish(w, env, [docRow(MEM, memberSha), copyRow(PIC, picSha)],
                            { edition: 2, before: () => registerCopy(w, env, PIC) });
  assert.equal(w.p.heldMaterialsOf(CASE, 2).some((x) => x.sha === archiveSha), false, "edition 2's commit held no such archive");
  assert.equal(two.m.files.some((f) => f.sha256 === archiveSha || f.sha256 === picSha), false,
               "neither the archive nor the original, though edition 1 registered the archive under MEM's ref");
  assert.deepEqual(two.out.unheld.filter((u) => u.what === "archive").map((u) => [u.ref, u.sha]), [[MEM, archiveSha]]);
  assert.deepEqual(under(two.m, PIC).map((f) => f.kind), ["obscured"]);
});
