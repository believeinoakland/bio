/* case-carriage — a document cut out of a captured archive is carried with its archive (R8; N688, K1844, K1852 (1);
   Intake Doctrine §3b): its `container` record, the archive's bytes and the archive's timestamp tokens, outward to the
   outermost archive, so an outsider checks it with stock tools. (T38) Each archive's listing is recorded as acquisition
   records it, so R8 can tell that it holds no image. The archives are built with `test-support`'s
   `make-zip.mjs`; the home's `data/provenance.json` states each member as `acquisition` R39 writes it. The outsider's
   check runs `sha256sum`, `unzip` and `openssl` where the runner has them, else their equivalents in-process. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import { world, caseFm, sha, NOW } from "./fixture.mjs";
import { makeZip, crc32 } from "../../make-zip.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";

const CASE = "CASE-2026-0001";
const ARCH = "INFO-2026-0010-archive", MEM = "INFO-2026-0011-member", OUTER = "INFO-2026-0012-outer";
const hex = (b) => createHash("sha256").update(b).digest("hex");
const docRow = (ref, s) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                              included: true, rests_under: "load_bearing" });
const has = (cmd, args) => !spawnSync(cmd, args).error;
const HAVE = { unzip: has("unzip", ["-v"]), openssl: has("openssl", ["version"]), sha256sum: has("sha256sum", ["--version"]) };

/* Where an entry's local header sits in the archive, as the listing states it (`local_offset`). */
function localOffset(zip, name) {
  const want = Buffer.from(name);
  for (let i = 0; i + 30 <= zip.length; i++)
    if (zip.readUInt32LE(i) === 0x04034b50 && zip.subarray(i + 30, i + 30 + zip.readUInt16LE(i + 26)).equals(want)) return i;
  throw new Error(`no local header for ${name}`);
}
/* The `container` block `acquisition` R39 writes for entry `index` of `zip`. */
function containerOf(zip, index, name, data, method = 8) {
  const z = Buffer.from(zip);
  const off = localOffset(z, name);
  return { archive_sha256: hex(z), index, path: name, name_raw: Buffer.from(name).toString("hex"), method,
           crc32: crc32(Buffer.from(data)), compressed: z.readUInt32LE(off + 18), uncompressed: Buffer.byteLength(data),
           local_offset: off, member_sha256: hex(Buffer.from(data)), dos_time_stated: "1980-01-01T00:00:00",
           name_shared: 1, path_unsafe: false };
}

/* A real RFC 3161 token over `bytes` from a throwaway TSA (as `signatures`' tests make one), or, with no openssl, a
   stand-in carrying the digest; `{token, ca}`. */
function tokenOver(bytes) {
  if (!HAVE.openssl) return { token: Buffer.concat([Buffer.from("TOKEN:"), Buffer.from(hex(bytes), "hex")]), ca: null };
  const d = mkdtempSync(join(tmpdir(), "cc-tsa-"));
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

/* A blob-backed live file (record-core R13 then answers its blob reference). */
const blobFile = (w, bundleId, path, blob, bytes) =>
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                bundleId, path, blob, bytes, blob);
const setProvenance = (w, bundleId, documents) =>
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents }), bundleId);
const unpackedEntry = (container, extra = {}) => ({ file: `snapshots/zip-${container.archive_sha256}-${container.index}`,
  locator: `https://example.org/a.zip#zip:${container.index}`, retrieved: NOW, authority_state: "undetermined",
  authority_basis: "a file cut out of an archive", capture: { method: "unpacked", grade: "B", actor_class: "daemon",
  sha256: container.member_sha256, encoding: "binary", bytes: container.uncompressed }, container,
  origin: { kind: "named_request" }, attestation_attempts: [], ...extra });

/* An archive held in the evidence store (blob-backed) on its own bundle, its token blob-backed beside it, its home's
   provenance naming the token; `entry` replaces the archive's own provenance entry (a nested archive's). Answers the
   evidence bytes by digest, as the published bucket would serve them. */
function holdArchive(w, bundleId, zip, { token = null, tokenFile = "attestations/archive.tsr", entry = null } = {}) {
  const z = Buffer.from(zip), s = hex(z);
  w.doc(bundleId, { text: `the listing page of ${bundleId}` });
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                s, bundleId, "snapshots/archive.zip", z.length, NOW);
  blobFile(w, bundleId, "snapshots/archive.zip", s, z.length);
  if (token) blobFile(w, bundleId, tokenFile, hex(token), token.length);
  setProvenance(w, bundleId, [entry ? { ...entry, timestamp: { service: "tsa.example", token_file: tokenFile } }
    : { file: "snapshots/archive.zip", capture: { method: "acquire", grade: "B", sha256: s, bytes: z.length },
        timestamp: { service: "tsa.example", token_file: tokenFile } }]);
  w.listing(s, z);   // acquisition's record of its listing (T38; R8)
  return s;
}
/* A member of an archive, its text held inline on its own bundle, its home's provenance stating its `container`. */
function holdMember(w, bundleId, text, container, extra = {}) {
  const s = w.doc(bundleId, { text });
  const entry = unpackedEntry(container, extra);
  setProvenance(w, bundleId, [{ ...entry, capture: { ...entry.capture, sha256: s } }]);
  return s;
}

const MEMBER_TEXT = "The minutes of the meeting, as the archive carried them.\n";
const OTHER_TEXT = "Another file in the same archive.\n";
function scene() {
  const w = world();
  const zip = Buffer.from(makeZip([{ name: "agenda.txt", data: OTHER_TEXT }, { name: "minutes/2026-09.txt", data: MEMBER_TEXT }]));
  const { token, ca } = tokenOver(zip);
  const container = containerOf(zip, 1, "minutes/2026-09.txt", MEMBER_TEXT);
  const archiveSha = holdArchive(w, ARCH, zip, { token });
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, container);
  return { w, zip, token, ca, container, archiveSha, memberSha };
}

test("R8 an included member is carried with its container record, its archive and the archive's token, each under materials/<sha>, in the order held", () => {
  const { w, zip, token, container, archiveSha, memberSha } = scene();
  assert.equal(memberSha, container.member_sha256);
  const record = canonicalJson(container);
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: memberSha, held: "inline" }, { sha: sha(record), held: "inline" },
                                 { sha: archiveSha, held: "evidence" }, { sha: hex(token), held: "evidence" }]);
  assert.deepEqual(r.files, [
    { sha256: memberSha, ref: MEM, path: `materials/${memberSha}`, kind: "document", bytes: Buffer.byteLength(MEMBER_TEXT) },
    { sha256: sha(record), ref: MEM, path: `materials/${sha(record)}`, kind: "container", bytes: Buffer.byteLength(record) },
    { sha256: archiveSha, ref: MEM, path: `materials/${archiveSha}`, kind: "archive", bytes: zip.length },
    { sha256: hex(token), ref: MEM, path: `materials/${hex(token)}`, kind: "attestation", bytes: token.length }]);
  /* only the extracted text is unheld (no index was set): nothing of R8 is */
  assert.deepEqual(r.unheld.map((u) => u.kind), ["extracted_text"]);
  /* the container record is the block as stated, in canonical JSON, readable by R3 under its kind */
  assert.deepEqual(w.cc.publishedMaterialText(sha(record)), { found: true, sha256: sha(record), kind: "container", text: record });
  assert.deepEqual(JSON.parse(record), container);
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), r.materials, "R2 lists them for ratification R39 to copy");
});

test("R8 the outsider's check over the bag's files: manifest-sha256.txt, then unzip -p the archive's path against the member's digest, then openssl ts -verify on the archive's token", () => {
  const { w, zip, token, ca, archiveSha, memberSha } = scene();
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
  /* the bag's payload: each file R8 answers, its bytes from R3 when held inline, else from the evidence store */
  const evidence = new Map([[archiveSha, zip], [hex(token), token]]);
  const bag = mkdtempSync(join(tmpdir(), "cc-bag-"));
  try {
    mkdirSync(join(bag, "materials"));
    const lines = [];
    for (const f of r.files) {
      const t = w.cc.publishedMaterialText(f.sha256);
      const bytes = t.found ? Buffer.from(t.text) : evidence.get(f.sha256);
      assert.ok(bytes, `${f.kind} ${f.sha256} has bytes`);
      assert.equal(bytes.length, f.bytes);
      writeFileSync(join(bag, f.path), bytes);
      lines.push(`${f.sha256}  ${f.path}`);
    }
    writeFileSync(join(bag, "manifest-sha256.txt"), lines.join("\n") + "\n");
    /* 1. the manifest */
    if (HAVE.sha256sum) execFileSync("sha256sum", ["-c", "--quiet", "manifest-sha256.txt"], { cwd: bag });
    else for (const l of lines) { const [s, p] = l.split("  "); assert.equal(hex(readFileSync(join(bag, p))), s); }
    /* 2. the member, cut from the archive the bag carries by the path its container record states */
    const recordFile = r.files.find((f) => f.kind === "container").path;
    const stated = JSON.parse(readFileSync(join(bag, recordFile), "utf8"));
    assert.equal(stated.archive_sha256, archiveSha);
    const archivePath = join(bag, `materials/${stated.archive_sha256}`);
    let cut;
    if (HAVE.unzip) cut = execFileSync("unzip", ["-p", archivePath, stated.path]);
    else {
      const z = readFileSync(archivePath), o = stated.local_offset;
      const start = o + 30 + z.readUInt16LE(o + 26) + z.readUInt16LE(o + 28);
      const raw = z.subarray(start, start + stated.compressed);
      cut = stated.method === 8 ? inflateRawSync(raw) : raw;
    }
    assert.equal(hex(cut), memberSha, "the cut is the member, at its digest");
    assert.equal(hex(readFileSync(join(bag, `materials/${memberSha}`))), memberSha);
    /* 3. the archive's token */
    const tokenPath = join(bag, r.files.find((f) => f.kind === "attestation").path);
    if (HAVE.openssl) {
      writeFileSync(join(bag, "tsa.crt"), ca);
      const out = execFileSync("openssl", ["ts", "-verify", "-data", archivePath, "-in", tokenPath, "-token_in",
                                           "-CAfile", join(bag, "tsa.crt")], { encoding: "utf8" });
      assert.match(out, /Verification: OK/);
    } else assert.ok(readFileSync(tokenPath).includes(Buffer.from(archiveSha, "hex")), "the token binds the archive's digest");
  } finally { rmSync(bag, { recursive: true, force: true }); }
});

test("R8 a member of a nested archive is carried outward to the outermost: each archive's container record, bytes and token", () => {
  const w = world();
  const inner = Buffer.from(makeZip([{ name: "report.txt", data: MEMBER_TEXT }]));
  const outer = Buffer.from(makeZip([{ name: "readme.txt", data: OTHER_TEXT }, { name: "inner.zip", data: inner, method: 0 }]));
  const innerC = containerOf(outer, 1, "inner.zip", inner, 0);
  const memberC = containerOf(inner, 0, "report.txt", MEMBER_TEXT);
  const outerToken = Buffer.from("OUTER-TOKEN-DER"), innerToken = Buffer.from("INNER-TOKEN-DER");
  const outerSha = holdArchive(w, OUTER, outer, { token: outerToken });
  const innerSha = holdArchive(w, ARCH, inner, { token: innerToken, entry: unpackedEntry(innerC) });
  assert.equal(innerSha, innerC.member_sha256);
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, memberC);
  w.listing(outerSha, [{ name: "readme.txt" }, { name: "inner.zip", sha256: innerSha }]);   // the inner archive, filed and opened
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
  const mr = canonicalJson(memberC), ir = canonicalJson(innerC);
  assert.deepEqual(r.files.map((f) => [f.kind, f.sha256]), [
    ["document", memberSha], ["container", sha(mr)], ["archive", innerSha], ["attestation", hex(innerToken)],
    ["container", sha(ir)], ["archive", outerSha], ["attestation", hex(outerToken)]]);
  assert.ok(r.files.every((f) => f.ref === MEM && f.path === `materials/${f.sha256}`));
  assert.deepEqual(r.unheld.map((u) => u.kind), ["extracted_text"]);
  /* the outer archive yields the inner, which yields the member: each step a stock cut */
  const cutOf = (z, c) => { const o = c.local_offset, s = o + 30 + z.readUInt16LE(o + 26) + z.readUInt16LE(o + 28);
                            const raw = z.subarray(s, s + c.compressed); return c.method === 8 ? inflateRawSync(raw) : raw; };
  assert.equal(hex(cutOf(cutOf(outer, innerC), memberC)), memberSha);
});

test("R8 each it cannot carry is answered in unheld, never refused: a container naming another document or no archive digest, an archive not held, an archive token not held", () => {
  const cases = [
    ["member_sha256 names another document", (c) => ({ ...c, member_sha256: sha("another") }),
     [["container", "member", "the container record does not name this document"]]],
    ["archive_sha256 not 64 hex digits", (c) => ({ ...c, archive_sha256: "zip-1" }),
     [["container", "member", "the container record does not name this document"]]],
    ["archive_sha256 absent", (c) => { const { archive_sha256, ...rest } = c; void archive_sha256; return rest; },
     [["container", "member", "the container record does not name this document"]]],
    ["an archive the record does not hold", (c) => ({ ...c, archive_sha256: sha("an archive never captured") }),
     [["archive", sha("an archive never captured"), "the archive is not held"]]],
  ];
  for (const [label, change, want] of cases) {
    const w = world();
    const zip = Buffer.from(makeZip([{ name: "m.txt", data: MEMBER_TEXT }]));
    holdArchive(w, ARCH, zip, { token: Buffer.from("T") });
    const memberSha = holdMember(w, MEM, MEMBER_TEXT, change(containerOf(zip, 0, "m.txt", MEMBER_TEXT)));
    const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
    assert.deepEqual(r.unheld.filter((u) => u.kind !== "extracted_text").map((u) => [u.kind, u.sha256 === memberSha ? "member" : u.sha256, u.why]),
                     want, label);
    assert.ok(r.unheld.every((u) => u.ref === MEM), label);
    assert.equal(r.materials[0].sha, memberSha, `${label}: the member itself is still held`);
    assert.equal(r.files.some((f) => f.kind === "archive"), false, `${label}: no archive carried`);
    const containers = r.files.filter((f) => f.kind === "container").length;
    assert.equal(containers, want[0][0] === "archive" ? 1 : 0, `${label}: a record naming the document is held`);
  }
  /* the archive held, its token not */
  const w = world();
  const zip = Buffer.from(makeZip([{ name: "m.txt", data: MEMBER_TEXT }]));
  const archiveSha = holdArchive(w, ARCH, zip, { token: null, tokenFile: "attestations/gone.tsr" });
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, containerOf(zip, 0, "m.txt", MEMBER_TEXT));
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.files.map((f) => f.kind), ["document", "container", "archive"]);
  assert.deepEqual(r.unheld.filter((u) => u.kind === "attestation"),
                   [{ ref: MEM, kind: "attestation", sha256: archiveSha, why: "the timestamp token attestations/gone.tsr is not held" }]);
  /* the archive's home holds its bytes inline at another digest: not held */
  const w2 = world();
  w2.doc(ARCH, { text: "not the archive" });
  const fake = sha("the stated archive");
  w2.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'utf8', 5, ?)`,
                 fake, ARCH, `snapshots/${ARCH}.txt`, NOW);
  const m2 = holdMember(w2, MEM, MEMBER_TEXT, { ...containerOf(zip, 0, "m.txt", MEMBER_TEXT), archive_sha256: fake });
  const r2 = w2.cc.holdMaterials(caseFm({ materials: [docRow(MEM, m2)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r2.unheld.filter((u) => u.kind === "archive").map((u) => [u.sha256, u.why]), [[fake, "the archive is not held"]]);
});

test("R8 an archive held inline as text at its digest is held inline under kind archive; read back by R3", () => {
  const w = world();
  const archiveText = "an archive whose bytes are text";
  const archiveSha = w.doc(ARCH, { text: archiveText });
  w.listing(archiveSha, [{ name: "m.txt" }]);
  const c = { ...containerOf(Buffer.from(makeZip([{ name: "m.txt", data: MEMBER_TEXT }])), 0, "m.txt", MEMBER_TEXT), archive_sha256: archiveSha };
  const memberSha = holdMember(w, MEM, MEMBER_TEXT, c);
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials.map((m) => m.held), ["inline", "inline", "inline"]);
  assert.deepEqual(w.cc.publishedMaterialText(archiveSha), { found: true, sha256: archiveSha, kind: "archive", text: archiveText });
});

test("R8 a document that is not a member is held exactly as R1 states: another method with a container block, unpacked with no block", () => {
  for (const [label, extra] of [["acquired, with a container block", { capture: { method: "acquire" } }],
                                ["unpacked, no container block", { container: undefined }],
                                ["unpacked, container not an object", { container: "zip:1" }]]) {
    const w = world();
    const zip = Buffer.from(makeZip([{ name: "m.txt", data: MEMBER_TEXT }]));
    holdArchive(w, ARCH, zip, { token: Buffer.from("T") });
    const c = containerOf(zip, 0, "m.txt", MEMBER_TEXT);
    const entry = unpackedEntry(c, extra);
    if (extra.capture) entry.capture = { ...unpackedEntry(c).capture, method: "acquire" };
    const memberSha = w.doc(MEM, { text: MEMBER_TEXT });
    setProvenance(w, MEM, [entry]);
    const r = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, memberSha)] }), { caseId: CASE, edition: 1, at: NOW });
    assert.deepEqual(r.files.map((f) => f.kind), ["document"], label);
    assert.deepEqual(r.unheld.map((u) => u.kind), ["extracted_text"], label);
  }
});

test("R8 (N768; K2145) two members of one archive: the archive and its token are written and listed once, and answered in files once under each member's ref; an archive whose record names an archive already walked ends the walk", () => {
  const w = world();
  const zip = Buffer.from(makeZip([{ name: "a.txt", data: OTHER_TEXT }, { name: "b.txt", data: MEMBER_TEXT }]));
  const token = Buffer.from("THE-TOKEN");
  const archiveSha = holdArchive(w, ARCH, zip, { token });
  const a = holdMember(w, "INFO-2026-0013-a", OTHER_TEXT, containerOf(zip, 0, "a.txt", OTHER_TEXT));
  const b = holdMember(w, MEM, MEMBER_TEXT, containerOf(zip, 1, "b.txt", MEMBER_TEXT));
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0013-a", a), docRow(MEM, b)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.files.map((f) => [f.kind, f.ref]), [["document", "INFO-2026-0013-a"], ["container", "INFO-2026-0013-a"],
    ["archive", "INFO-2026-0013-a"], ["attestation", "INFO-2026-0013-a"], ["document", MEM], ["container", MEM], ["archive", MEM],
    ["attestation", MEM]]);
  /* each shared item once under each ref, so publication registers it under both (public-read carries it for both) */
  for (const s of [archiveSha, hex(token)])
    assert.deepEqual(r.files.filter((f) => f.sha256 === s).map((f) => f.ref), ["INFO-2026-0013-a", MEM]);
  assert.ok(r.files.every((f) => f.path === `materials/${f.sha256}`));
  /* held once: one entry in the edition's list, and nothing twice */
  assert.equal(r.materials.filter((m) => m.sha === archiveSha).length, 1);
  assert.equal(r.materials.filter((m) => m.sha === hex(token)).length, 1);
  assert.equal(new Set(r.materials.map((m) => m.sha)).size, r.materials.length);
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), r.materials);
  /* a shared container record (the same block stated for two refs) is answered once under each too */
  const w3 = world();
  const z3 = Buffer.from(makeZip([{ name: "m.txt", data: MEMBER_TEXT }]));
  holdArchive(w3, ARCH, z3, { token: null, tokenFile: "attestations/none.tsr" });
  const m3 = holdMember(w3, MEM, MEMBER_TEXT, containerOf(z3, 0, "m.txt", MEMBER_TEXT));
  const r3 = w3.cc.holdMaterials(caseFm({ materials: [docRow(MEM, m3), docRow("INFO-2026-0014-again", m3)] }), { caseId: CASE, edition: 1, at: NOW });
  const record = canonicalJson(containerOf(z3, 0, "m.txt", MEMBER_TEXT));
  assert.deepEqual(r3.files.filter((f) => f.kind === "container").map((f) => [f.sha256, f.ref]),
                   [[sha(record), MEM], [sha(record), "INFO-2026-0014-again"]]);
  assert.equal(w3.row(`SELECT COUNT(*) AS n FROM published_material_texts WHERE sha256=?`, sha(record)).n, 1);
  /* negative control: one member alone answers each item once */
  const one = w.cc.holdMaterials(caseFm({ materials: [docRow(MEM, b)] }), { caseId: CASE, edition: 2, at: NOW });
  assert.equal(one.files.filter((f) => f.sha256 === archiveSha).length, 1);
  /* a cycle: the archive's own entry states it was cut from the member */
  const w2 = world();
  const z2 = Buffer.from(makeZip([{ name: "m.txt", data: MEMBER_TEXT }]));
  const c = containerOf(z2, 0, "m.txt", MEMBER_TEXT);
  const loop = { ...c, archive_sha256: c.member_sha256, member_sha256: hex(z2) };
  holdArchive(w2, ARCH, z2, { token: null, entry: unpackedEntry(loop) });
  const m = holdMember(w2, MEM, MEMBER_TEXT, c);
  const r2 = w2.cc.holdMaterials(caseFm({ materials: [docRow(MEM, m)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r2.files.map((f) => f.kind), ["document", "container", "archive", "container"], "ends, never loops");
});
