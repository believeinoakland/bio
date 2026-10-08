/* public-read — what a carried archive member brings with it (R32; N717, K2004; `case-carriage` R8 through `publication`
   R57), and the edition's criteria file (R33; K2129). A `/6` case edition rests on a document cut out of a captured
   archive (its home's `data/provenance.json` states it `unpacked` with a `container` block, as `acquisition` writes it);
   the commit registers its `container` record and archive under the material's ref, and the Worker's assembly
   (`assembleCaseContainer`) builds the case file from the published projection. It is read back as a stranger reads it:
   the manifest through `case-grammar`'s one check, each file at its hash, and the outsider's three steps (the manifest,
   `unzip -p` of the archive at the record's path against the member's SHA-256, `openssl ts -verify` of the archive's
   token) over the files the part carries, with `unzip` and `openssl` where the runner has them, else their equivalents
   in-process. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { world, stubOf, bucket, V, NOW, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { buildCaseFile, isCaseFileManifest } from "../../../src/public-read/casefile.mjs";
import { inbandQuartet } from "../../../src/inband.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";
import { serialiseContainer } from "../../../src/container.mjs";
import { crc32 } from "../../../src/ooxml.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
import { CASE_FILE_FORMAT, CASE_FILE_MANIFEST_PATH, caseFileManifestCheck, caseFilePath } from "../../../src/case-grammar/index.mjs";

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
const has = (cmd, args) => !spawnSync(cmd, args).error;
const HAVE = { unzip: has("unzip", ["-v"]), openssl: has("openssl", ["version"]) };

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const ARCH = "INFO-2026-0010-archive", MEM = "INFO-2026-0011-member", OUTER = "INFO-2026-0012-outer";
const PLAIN = "INFO-2026-0013-plain";
const MEMBER_TEXT = "The minutes of the meeting, as the archive carried them.\n";
const OTHER_TEXT = "Another file in the same archive.\n";
const docRow = (ref, s) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                              included: true, rests_under: "load_bearing" });
const coRow = (ref) => ({ ref, by_kind: "co_attestation", by: "tsa.example", level: null, at: NOW, signature: null, recorded_in: null });

/* A captured archive: a stored ZIP written by this module's own serialiser (`../container.mjs`), each entry `{name, data}`. */
const LISTINGS = new Map(); // an archive's SHA-256 -> its entries `[{name, sha256}]`, as `makeZip` built it
function makeZip(entries) {
  const bytes = entries.map((e) => (typeof e.data === "string" ? new TextEncoder().encode(e.data) : new Uint8Array(e.data)));
  const z = serialiseContainer(entries.map((e, i) => ({ name: e.name, bytes: bytes[i] })));
  assert.equal(z.ok, true);
  LISTINGS.set(hex(Buffer.from(z.bytes)), entries.map((e, i) => ({ name: e.name, sha256: hex(Buffer.from(bytes[i])) })));
  return z.bytes;
}
/* `acquisition`'s record of an archive's listing (its R38), as its unpack writes it: the opened header (`idx` -1) and one
   row per entry, filed at its digest. `case-carriage` R8 (T38; K2291 (2)) reads it to tell that an archive holds no image,
   and carries none whose listing is not recorded. */
function recordListing(w, archiveSha) {
  w.st.sql.exec(`CREATE TABLE IF NOT EXISTS archive_entries (archive_sha TEXT NOT NULL, idx INTEGER NOT NULL, name TEXT, kind TEXT,
                 state TEXT NOT NULL, sha256 TEXT, PRIMARY KEY (archive_sha, idx))`);
  w.st.sql.exec(`INSERT OR IGNORE INTO archive_entries (archive_sha, idx, state) VALUES (?, -1, 'opened')`, archiveSha);
  (LISTINGS.get(archiveSha) || []).forEach((e, i) => w.st.sql.exec(`INSERT OR REPLACE INTO archive_entries
    (archive_sha, idx, name, kind, state, sha256) VALUES (?, ?, ?, 'file', 'filed', ?)`, archiveSha, i, e.name, e.sha256));
}
/* Where an entry's local header sits in the archive. */
function localOffset(zip, name) {
  const want = Buffer.from(name);
  for (let i = 0; i + 30 <= zip.length; i++)
    if (zip.readUInt32LE(i) === 0x04034b50 && zip.subarray(i + 30, i + 30 + zip.readUInt16LE(i + 26)).equals(want)) return i;
  throw new Error(`no local header for ${name}`);
}
/* The `container` block `acquisition` writes for entry `index` of `zip` (as case-carriage's own R8 tests write it). */
function containerOf(zip, index, name, data, method = 0) {
  const z = Buffer.from(zip), off = localOffset(z, name);
  return { archive_sha256: hex(z), index, path: name, name_raw: Buffer.from(name).toString("hex"), method,
           crc32: crc32(new Uint8Array(Buffer.from(data))), compressed: z.readUInt32LE(off + 18), uncompressed: Buffer.byteLength(data),
           local_offset: off, member_sha256: hex(Buffer.from(data)), dos_time_stated: "1980-01-01T00:00:00",
           name_shared: 1, path_unsafe: false };
}
/* A real RFC 3161 token over `bytes` from a throwaway TSA, or, with no openssl, a stand-in carrying the digest. */
function tokenOver(bytes) {
  if (!HAVE.openssl) return { token: Buffer.concat([Buffer.from("TOKEN:"), Buffer.from(hex(bytes), "hex")]), ca: null };
  const d = mkdtempSync(join(tmpdir(), "pr-tsa-"));
  writeFileSync(join(d, "tsa.cnf"), [
    "[req]", "distinguished_name=dn", "prompt=no", "x509_extensions=ext",
    "[dn]", "CN=throwaway test TSA",
    "[ext]", "basicConstraints=critical,CA:false", "extendedKeyUsage=critical,timeStamping",
    "keyUsage=critical,digitalSignature",
    "[t]", `serial=${join(d, "serial")}`, `signer_cert=${join(d, "tsa.crt")}`, `signer_key=${join(d, "tsa.key")}`,
    "signer_digest=sha256", "default_policy=1.2.3.4", "digests=sha256", "ess_cert_id_alg=sha256", ""].join("\n"));
  writeFileSync(join(d, "serial"), "01\n");
  writeFileSync(join(d, "data"), bytes);
  const run = (args) => execFileSync("openssl", args, { cwd: d, stdio: "ignore" });
  run(["req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:P-256", "-nodes", "-keyout", "tsa.key",
    "-out", "tsa.crt", "-days", "2", "-config", "tsa.cnf"]);
  run(["ts", "-query", "-data", "data", "-sha256", "-cert", "-out", "q.tsq"]);
  run(["ts", "-reply", "-config", "tsa.cnf", "-section", "t", "-queryfile", "q.tsq", "-token_out", "-out", "t.der"]);
  const out = { token: readFileSync(join(d, "t.der")), ca: readFileSync(join(d, "tsa.crt")) };
  rmSync(d, { recursive: true, force: true });
  return out;
}

const infoText = (w, id) => w.text("INFO-2026-0001-minutes").replace(/INFO-2026-0001-minutes/g, id);
/* A bundle through promotion; `inline` files are held as text. Its `data/provenance.json` is then set to `documents` as
   the live file (as case-carriage's own R8 tests set it), so the entries `acquisition` writes for an unpacked member
   need not pass a promotion's provenance check written for this test. */
function promote(w, id, documents, inline = []) {
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `k-${id}`, author: V("olive"),
    files: [{ path: "bundle.md", text: infoText(w, id) }, ...inline.map((f) => ({ path: f.path, text: f.text })),
            { path: "data/provenance.json", text: JSON.stringify({ documents: [] }) }],
    meta: { object_type: "information" },
    register: inline.filter((f) => f.register).map((f) => ({ sha256: sha(f.text), path: f.path, encoding: "utf8",
                                                            bytes: Buffer.byteLength(f.text) })) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 2000));
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents }), id);
}
/* A blob-backed live file (the evidence store holds its bytes). */
const blobFile = (w, bundleId, path, blob, bytes) =>
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                bundleId, path, blob, bytes, blob);
const unpacked = (container, s) => ({ file: `snapshots/zip-${container.archive_sha256}-${container.index}`,
  locator: `https://example.org/a.zip#zip:${container.index}`, retrieved: NOW, authority_state: "undetermined",
  authority_basis: "a file cut out of an archive", capture: { method: "unpacked", grade: "B", actor_class: "daemon",
  sha256: s, encoding: "binary", bytes: container.uncompressed }, container, origin: { kind: "named_request" } });
/* An archive held in the evidence store on its own bundle, its token beside it, its provenance naming the token; `entry`
   is the archive's own entry when it is itself a member. Its bytes and token are put in the published bucket, as
   ratification's Worker copies evidence after the commit (its R39). */
function holdArchive(w, env, id, zip, { token, entry = null }) {
  const z = Buffer.from(zip), s = hex(z);
  promote(w, id, [{ ...(entry || { file: "snapshots/archive.zip", capture: { method: "acquire", grade: "B", sha256: s, bytes: z.length } }),
                    timestamp: { service: "tsa.example", token_file: "attestations/archive.tsr" } }]);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                s, id, "snapshots/archive.zip", z.length, NOW);
  blobFile(w, id, "snapshots/archive.zip", s, z.length);
  blobFile(w, id, "attestations/archive.tsr", hex(token), token.length);
  env.PUBLISHED.m.set(`bio/published/${s}`, new Uint8Array(z));
  env.PUBLISHED.m.set(`bio/published/${hex(token)}`, new Uint8Array(token));
  recordListing(w, s);
  /* (T39) fetched by this copy (`provenance` R62): the outermost directly, an inner archive cut from its archive */
  if (entry && entry.container) cutFrom(w, s, entry.container);
  else w.receipt(s);
  return s;
}
/* (T39; `case-carriage` R13, K2377) a member cut from an archive is carried whole only as one this copy fetched
   (`provenance` R62): its `unpacked` receipt names the archive, itself fetched. */
const cutFrom = (w, s, container) => w.receipt(s, "unpacked", `zip:${container.archive_sha256}!${container.index}`);
/* A member of an archive, its text held inline on its own bundle, its provenance stating its `container`. */
function holdMember(w, id, text, container) {
  const path = `snapshots/zip-${container.archive_sha256}-${container.index}`;
  promote(w, id, [{ ...unpacked(container, sha(text)), file: path }], [{ path, text, register: true }]);
  cutFrom(w, sha(text), container);
  return sha(text);
}
/* The case edition over F, resting on `materials`, signed, F published, F's bytes in the bucket; assembled. */
async function publish(w, env, materials, attestations = []) {
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: materials.map((m) => ({ target: m.ref })) });
  const pin = w.head(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }], materials, attestations });
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
                                            cs: w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  const m = JSON.parse(dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha }))));
  const zip = await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: 1 }));
  const zc = readContainer(zip);
  assert.equal(zc.ok, true);
  const read = async (name) => (await readPart(zip, zc, name)).bytes;
  return { out, m, read, names: zc.entries.map((e) => e.name) };
}
function scene() {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc("INFO-2026-0001-minutes");
  const zip = Buffer.from(makeZip([{ name: "agenda.txt", data: OTHER_TEXT }, { name: "minutes/2026-09.txt", data: MEMBER_TEXT }]));
  const { token, ca } = tokenOver(zip);
  const container = containerOf(zip, 1, "minutes/2026-09.txt", MEMBER_TEXT);
  const archiveSha = holdArchive(w, env, ARCH, zip, { token });
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, container);
  return { w, env, zip, token, ca, container, archiveSha, memberSha };
}
const pathOf = (m, kind, ref) => m.files.filter((f) => f.kind === kind && f.path.startsWith(`materials/${ref}/`)).map((f) => f.path);

test("R32 a case resting on an archive member's document carries its container record and its archive's bytes, from the published projection, at case-grammar's paths under the material's ref; the archive's token travels as an attestation; the manifest passes case-grammar's check", async () => {
  const { w, env, zip, token, container, archiveSha, memberSha } = scene();
  const { out, m, read, names } = await publish(w, env, [docRow(MEM, memberSha)], [coRow(MEM)]);
  assert.deepEqual(caseFileManifestCheck(m), [], "case-grammar R13's one check finds no departure");
  assert.equal(m.format, CASE_FILE_FORMAT);
  const record = canonicalJson(container);
  const recPath = caseFilePath("container", [MEM, memberSha]), arcPath = caseFilePath("archive", [MEM, archiveSha]);
  assert.equal(typeof recPath, "string");
  assert.equal(typeof arcPath, "string");
  assert.deepEqual(pathOf(m, "container", MEM), [recPath]);
  assert.deepEqual(pathOf(m, "archive", MEM), [arcPath]);
  const rec = m.files.find((f) => f.path === recPath), arc = m.files.find((f) => f.path === arcPath);
  assert.deepEqual([rec.sha256, rec.bytes], [sha(record), Buffer.byteLength(record)]);
  assert.deepEqual([arc.sha256, arc.bytes], [archiveSha, zip.length]);
  assert.equal(dec(await read(recPath)), record, "the record as the commit registered it, canonical JSON");
  assert.deepEqual(Buffer.from(await read(arcPath)), zip, "the archive, whole");
  assert.ok(names.includes(recPath) && names.includes(arcPath));
  /* the archive's token, as today: in the material's co-attestation row, by its own hash */
  const att = JSON.parse(dec(await read(caseFilePath("attestation", [MEM, "1-co_attestation.json"]))));
  assert.ok(att.held.some((h) => h.sha256 === hex(token)), "the archive's token travels as an attestation");
  assert.equal(out.unheld.some((u) => u.what === "archive" || u.what === "container"), false);
  /* every carried file answers by its own hash */
  for (const p of [recPath, arcPath]) {
    const f = m.files.find((x) => x.path === p);
    assert.equal(hex(Buffer.from(await bytesOf(await call(w, env, "publishedbytes", { sha256: f.sha256 })))), f.sha256);
  }
});

test("R32 the outsider's three steps run on the built case file: the manifest, unzip -p of the carried archive at the record's path against the member's SHA-256, openssl ts -verify of the archive's token", async () => {
  const { w, env, ca, archiveSha, memberSha } = scene();
  const { m, read } = await publish(w, env, [docRow(MEM, memberSha)], [coRow(MEM)]);
  const bag = mkdtempSync(join(tmpdir(), "pr-bag-"));
  try {
    /* 1. the manifest: each file at its hash */
    for (const f of m.files) assert.equal(hex(Buffer.from(await read(f.path))), f.sha256, f.path);
    /* 2. the member, cut from the carried archive by the path its carried record states */
    const stated = JSON.parse(dec(await read(m.files.find((f) => f.kind === "container").path)));
    assert.equal(stated.archive_sha256, archiveSha);
    assert.equal(stated.member_sha256, memberSha);
    const archive = Buffer.from(await read(m.files.find((f) => f.kind === "archive" && f.sha256 === stated.archive_sha256).path));
    const archivePath = join(bag, "archive.zip");
    writeFileSync(archivePath, archive);
    let cut;
    if (HAVE.unzip) cut = execFileSync("unzip", ["-p", archivePath, stated.path]);
    else {
      const o = stated.local_offset, start = o + 30 + archive.readUInt16LE(o + 26) + archive.readUInt16LE(o + 28);
      const raw = archive.subarray(start, start + stated.compressed);
      assert.equal(stated.method, 0, "a stored entry");
      cut = raw;
    }
    assert.equal(hex(cut), memberSha, "the cut is the member, at its digest");
    assert.equal(hex(Buffer.from(await read(caseFilePath("document", MEM)))), memberSha, "and the member is carried whole");
    /* 3. the archive's token, carried in the co-attestation row */
    const att = JSON.parse(dec(await read(caseFilePath("attestation", [MEM, "1-co_attestation.json"]))));
    const tok = Buffer.from(att.held[0].bytes_b64, "base64");
    const tokenPath = join(bag, "archive.tsr");
    writeFileSync(tokenPath, tok);
    if (HAVE.openssl) {
      writeFileSync(join(bag, "tsa.crt"), ca);
      const res = execFileSync("openssl", ["ts", "-verify", "-data", archivePath, "-in", tokenPath, "-token_in",
                                           "-CAfile", join(bag, "tsa.crt")], { encoding: "utf8" });
      assert.match(res, /Verification: OK/);
    } else assert.ok(tok.includes(Buffer.from(archiveSha, "hex")), "the token binds the archive's digest");
  } finally { rmSync(bag, { recursive: true, force: true }); }
});

test("R32 a member of a nested archive carries each record and archive outward to the outermost", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc("INFO-2026-0001-minutes");
  const inner = Buffer.from(makeZip([{ name: "report.txt", data: MEMBER_TEXT }]));
  const outer = Buffer.from(makeZip([{ name: "readme.txt", data: OTHER_TEXT }, { name: "inner.zip", data: inner }]));
  const innerC = containerOf(outer, 1, "inner.zip", inner), memberC = containerOf(inner, 0, "report.txt", MEMBER_TEXT);
  const outerSha = holdArchive(w, env, OUTER, outer, { token: Buffer.from("OUTER-TOKEN") });
  const innerSha = holdArchive(w, env, ARCH, inner, { token: Buffer.from("INNER-TOKEN"),
                                                       entry: { ...unpacked(innerC, hex(inner)), file: "snapshots/archive.zip" } });
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, memberC);
  const { m, read, out } = await publish(w, env, [docRow(MEM, memberSha)]);
  assert.deepEqual(caseFileManifestCheck(m), []);
  const mr = canonicalJson(memberC), ir = canonicalJson(innerC);
  assert.deepEqual(pathOf(m, "container", MEM).sort(),
                   [caseFilePath("container", [MEM, memberSha]), caseFilePath("container", [MEM, innerSha])].sort());
  assert.deepEqual(pathOf(m, "archive", MEM).sort(),
                   [caseFilePath("archive", [MEM, innerSha]), caseFilePath("archive", [MEM, outerSha])].sort());
  assert.deepEqual(Buffer.from(await read(caseFilePath("archive", [MEM, outerSha]))), outer);
  assert.deepEqual(Buffer.from(await read(caseFilePath("archive", [MEM, innerSha]))), inner);
  assert.equal(dec(await read(caseFilePath("container", [MEM, innerSha]))), ir);
  assert.deepEqual(out.unheld.map((u) => u.what), ["extracted_text"], "nothing of the chain is unheld (the fixture states no extracted text)");
});

test("R32 bytes that do not hash to the digest registered are not carried and are named in unheld; a material that is not a member carries neither file", async () => {
  const { w, env, archiveSha, memberSha } = scene();
  env.PUBLISHED.m.set(`bio/published/${archiveSha}`, new TextEncoder().encode("not the archive"));
  promote(w, PLAIN, [{ file: "snapshots/plain.txt", capture: { method: "acquire", grade: "B", sha256: sha("plain words"), bytes: 11 } }],
          [{ path: "snapshots/plain.txt", text: "plain words", register: true }]);
  w.receipt(sha("plain words"));   // (T39) fetched by this copy (`provenance` R62), so carried whole
  const { m, out } = await publish(w, env, [docRow(MEM, memberSha), docRow(PLAIN, sha("plain words"))]);
  assert.deepEqual(caseFileManifestCheck(m), []);
  assert.equal(pathOf(m, "archive", MEM).length, 0, "the wrong bytes are never carried under the archive's name");
  assert.equal(pathOf(m, "container", MEM).length, 1, "the record, held at its digest, still travels");
  assert.deepEqual(out.unheld.filter((u) => u.what === "archive"), [{ ref: MEM, sha: archiveSha, what: "archive" }]);
  assert.deepEqual([pathOf(m, "archive", PLAIN), pathOf(m, "container", PLAIN)], [[], []], "no member, neither file");
  assert.ok(m.files.some((f) => f.path === caseFilePath("document", PLAIN)), "the plain material itself is carried");
  /* negative control: with the right bytes back, the archive travels */
  const w2 = scene();
  const again = await publish(w2.w, w2.env, [docRow(MEM, w2.memberSha)]);
  assert.equal(pathOf(again.m, "archive", MEM).length, 1);
});

test("R33 the case file carries the edition's criteria as one file of kind criteria, exactly the rows R31 answers, in canonical JSON; an edition whose criteria is null (committed before T35) carries none", async () => {
  const { w, env, memberSha } = scene();
  const { m, read } = await publish(w, env, [docRow(MEM, memberSha)]);
  const crit = m.files.filter((f) => f.kind === "criteria");
  assert.deepEqual(crit.map((f) => f.path), [caseFilePath("criteria")]);
  const answered = w.pr.publishedCase({ caseId: CASE }).criteria;
  assert.ok(Array.isArray(answered));
  assert.equal(dec(await read(caseFilePath("criteria"))), canonicalJson(answered), "exactly R31's rows");
  assert.equal(crit[0].sha256, sha(canonicalJson(answered)));
  /* committed before T35: criteria not recorded, so no file (a fresh world; the same edition with its column null) */
  const s2 = scene();
  const orig = s2.w.signCase.bind(s2.w);
  s2.w.signCase = (...a) => { const r = orig(...a); s2.w.st.sql.exec(`UPDATE published_cases SET criteria=NULL WHERE case_id=?`, CASE); return r; };
  const old = await publish(s2.w, s2.env, [docRow(MEM, s2.memberSha)]);
  assert.equal(s2.w.pr.publishedCase({ caseId: CASE }).criteria, null);
  assert.deepEqual(old.m.files.filter((f) => f.kind === "criteria"), [], "never filled as []");
  assert.deepEqual(caseFileManifestCheck(old.m), []);
});

test("R33 an edition carrying criteria rows carries them whole in the criteria file", async () => {
  const { w, env, memberSha } = scene();
  const rows = [{ standard: "STD-2026-0001-policy", portion: "s.3", body: "ENT-2026-0001", binds: true,
                  label: "Standard · binds City Clerk", access: "free", access_words: "Free to read", passages: [] }];
  const orig = w.signCase.bind(w);
  w.signCase = (...a) => { const r = orig(...a); w.st.sql.exec(`UPDATE published_cases SET criteria=? WHERE case_id=?`, JSON.stringify(rows), CASE); return r; };
  const { m, read } = await publish(w, env, [docRow(MEM, memberSha)]);
  const answered = w.pr.publishedCase({ caseId: CASE }).criteria;
  assert.deepEqual(answered, rows, "R31 answers the frozen rows");
  assert.equal(dec(await read(caseFilePath("criteria"))), canonicalJson(rows));
  assert.equal(m.files.filter((f) => f.kind === "criteria").length, 1, "at most once");
});

test("R5 R6 a case file stored before T36 (bio-case-file/1) is still recognised and served part by part as written; an unknown format is not a case file", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc("INFO-2026-0001-minutes");
  const orig = w.signCase.bind(w);
  w.signCase = (...a) => { const r = orig(...a); w.st.sql.exec(`UPDATE published_cases SET criteria=NULL WHERE case_id=?`, CASE); return r; };
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const pin = w.head(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  /* the case file as T35 built it: no file of a kind `/2` adds, its manifest stating /1 */
  const facts = await w.read("casefilefacts", { caseId: CASE, edition: 1 });
  const read = async (x) => { const o = await env.PUBLISHED.get(`bio/published/${x}`); return o ? new Uint8Array(await o.arrayBuffer()) : null; };
  const built = await buildCaseFile({ facts, group: "parks-group", read });
  assert.equal(built.ok, true);
  assert.equal(built.files.some((f) => ["archive", "container", "criteria"].includes(f.kind)), false);
  const manifest = { ...built.manifest, format: "bio-case-file/1" };
  for (const f of built.files) env.PUBLISHED.m.set(`bio/published/${f.sha256}`, f.content);
  const { bytes, quartet } = await inbandQuartet({ subject: manifest, over: "a case file manifest", date: NOW, author: "olive", bar: null });
  const mSha = quartet.hash.sha256;
  assert.equal(w.p.recordCaseManifest({ caseId: CASE, edition: 1, manifest, manifestSha: mSha, bytes: bytes.length }).ok, true);
  env.PUBLISHED.m.set(`bio/published/${mSha}`, bytes);
  const r = await call(w, env, "publishedbytes", { sha256: mSha, format: "zip", part: 1 });
  assert.equal(r.status, 200);
  const zip = await bytesOf(r), zc = readContainer(zip);
  assert.equal(zc.ok, true);
  assert.deepEqual(zc.entries.map((e) => e.name), [CASE_FILE_MANIFEST_PATH, ...manifest.files.map((f) => f.path)],
                   "served as a case file: the manifest at the root, then each file at its path");
  assert.equal(JSON.parse(dec((await readPart(zip, zc, CASE_FILE_MANIFEST_PATH)).bytes)).format, "bio-case-file/1", "as written");
  assert.equal(isCaseFileManifest(manifest), true);
  assert.equal(isCaseFileManifest({ ...manifest, format: CASE_FILE_FORMAT }), true);
  /* negative control: a format no case file states is not one */
  assert.equal(isCaseFileManifest({ ...manifest, format: "bio-case-file/9" }), false);
  assert.equal(isCaseFileManifest({ ...manifest, format: "bio-case-container/6" }), false);
});

test("R28 R32 an order over a carried archive member withholds its archive and container record too, from publishedbytes and from the case file's part and listing; an unseal serves them again; a material that is no member is unaffected", async () => {
  const { w, env, zip, archiveSha, memberSha } = scene();
  promote(w, PLAIN, [{ file: "snapshots/plain.txt", capture: { method: "acquire", grade: "B", sha256: sha("plain words"), bytes: 11 } }],
          [{ path: "snapshots/plain.txt", text: "plain words", register: true }]);
  w.receipt(sha("plain words"));   // (T39) fetched by this copy (`provenance` R62), so carried whole
  const { out, m } = await publish(w, env, [docRow(MEM, memberSha), docRow(PLAIN, sha("plain words"))]);
  const rec = m.files.find((f) => f.kind === "container"), arc = m.files.find((f) => f.kind === "archive");
  assert.ok(rec && arc && arc.sha256 === archiveSha && zip.length === arc.bytes);
  const status = async (sha256, extra = {}) => (await call(w, env, "publishedbytes", { sha256, ...extra })).status;
  for (const s of [memberSha, rec.sha256, archiveSha]) assert.equal(await status(s), 200, "served before the order");
  /* the order seals the member document only, by its path in the case file */
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: [caseFilePath("document", MEM)] });
  for (const s of [memberSha, rec.sha256, archiveSha]) {
    const r = await call(w, env, "publishedbytes", { sha256: s });
    assert.equal(r.status, 451, s);
    const b = await r.json();
    assert.equal(b.reason, "WITHHELD_BY_COURT_ORDER");
    assert.deepEqual(b.withheld[s].map((o) => [o.case, o.edition, o.effect]), [[CASE, 1, "seal"]]);
  }
  const part = await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: rec.part });
  assert.equal(part.status, 451);
  const named = Object.keys((await part.json()).withheld);
  for (const s of [rec.sha256, archiveSha]) if (m.files.find((f) => f.sha256 === s).part === rec.part) assert.ok(named.includes(s));
  const c = w.read("publishedcase", { id: CASE });
  const marked = c.files.filter((f) => f.withheld === true).map((f) => f.path).sort();
  assert.deepEqual(marked, [caseFilePath("document", MEM), rec.path, arc.path].sort(), "the case file's listing states each withheld");
  /* negative control: the plain material is still served */
  assert.equal(await status(sha("plain words")), 200);
  /* unsealed: the member and its chain are served again */
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 8 }, effect: "unseal", parts: [caseFilePath("document", MEM)] });
  for (const s of [memberSha, rec.sha256, archiveSha]) assert.equal(await status(s), 200, "served after the unseal");
});
