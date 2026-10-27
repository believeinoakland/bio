/* case-carriage — G47t (T51 fix round 6; K4677): the `files` entry of every timestamp token `holdMaterials` answers
   (kind `attestation`) carries `capture_sha`, the capture it stamps, so `publication` can register which capture a token
   belongs to (R1, "For callers"). A token two different captures of one ref name is shared: `capture_sha` null. Driven
   through `holdMaterials` over a real home (`fixture.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, caseFm, sha, NOW } from "./fixture.mjs";
import { makeZip, crc32 } from "../../make-zip.mjs";

const CASE = "CASE-2026-0001";
const REF = "INFO-2026-0001-minutes", ARCH = "INFO-2026-0010-archive", MEM = "INFO-2026-0011-member";
const hex = (b) => createHash("sha256").update(b).digest("hex");
const docRow = (ref, s) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                              included: true, rests_under: "load_bearing" });
const hold = (w, rows, edition = 1) => w.cc.holdMaterials(caseFm({ materials: rows }), { caseId: CASE, edition, at: NOW });
const tokens = (r) => r.files.filter((f) => f.kind === "attestation");

/* A capture of REF in its own home, its token inline in the home, named by its provenance. */
function capture(w, home, text, token) {
  return w.doc(home, { text, files: [{ path: "attestations/stamp.tsr", text: token }],
                       prov: { timestamp: { service: "tsa.example", token_file: "attestations/stamp.tsr" } } });
}

/* An archive of the archive.test.mjs kind (blob-backed, fetched by this copy) whose token is `token`, and a member of it. */
function localOffset(zip, name) {
  const want = Buffer.from(name);
  for (let i = 0; i + 30 <= zip.length; i++)
    if (zip.readUInt32LE(i) === 0x04034b50 && zip.subarray(i + 30, i + 30 + zip.readUInt16LE(i + 26)).equals(want)) return i;
  throw new Error(`no local header for ${name}`);
}
function containerOf(zip, index, name, data) {
  const off = localOffset(zip, name);
  return { archive_sha256: hex(zip), index, path: name, name_raw: Buffer.from(name).toString("hex"), method: 8,
           crc32: crc32(Buffer.from(data)), compressed: zip.readUInt32LE(off + 18), uncompressed: Buffer.byteLength(data),
           local_offset: off, member_sha256: hex(Buffer.from(data)), dos_time_stated: "1980-01-01T00:00:00",
           name_shared: 1, path_unsafe: false };
}
const setProvenance = (w, bundleId, documents) =>
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents }), bundleId);
function archiveWithMember(w, token, memberText, memberToken = null) {
  const zip = Buffer.from(makeZip([{ name: "m.txt", data: memberText }]));
  const s = hex(zip);
  w.doc(ARCH, { text: "the listing page" });
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                s, ARCH, "snapshots/archive.zip", zip.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                ARCH, "snapshots/archive.zip", s, zip.length, s);
  const tb = Buffer.from(token);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                ARCH, "attestations/archive.tsr", hex(tb), tb.length, hex(tb));
  setProvenance(w, ARCH, [{ file: "snapshots/archive.zip", capture: { method: "acquire", grade: "B", sha256: s, bytes: zip.length },
                            timestamp: { service: "tsa.example", token_file: "attestations/archive.tsr" } }]);
  w.listing(s, zip);
  w.receipt(s);
  const container = containerOf(zip, 0, "m.txt", memberText);
  const memberSha = w.doc(MEM, { text: memberText, files: memberToken ? [{ path: "attestations/own.tsr", text: memberToken }] : [] });
  setProvenance(w, MEM, [{ file: "snapshots/m", locator: "https://example.org/a.zip#zip:0", retrieved: NOW,
    authority_state: "undetermined", authority_basis: "a file cut out",
    capture: { method: "unpacked", grade: "B", actor_class: "daemon", sha256: memberSha, encoding: "binary", bytes: container.uncompressed },
    container, origin: { kind: "named_request" }, attestation_attempts: [],
    ...(memberToken ? { timestamp: { service: "tsa.example", token_file: "attestations/own.tsr" } } : {}) }]);
  return { memberSha, archiveSha: s, tokenSha: hex(tb) };
}

test("R1 (G47t) a token's files entry carries capture_sha, the capture it stamps: two captures of one ref, each with its own token", () => {
  const w = world();
  const a = capture(w, "INFO-2026-0001-a", "capture A", "TOKEN-A");
  const b = capture(w, "INFO-2026-0001-b", "capture B", "TOKEN-B");
  const r = hold(w, [docRow(REF, a), docRow(REF, b)]);
  assert.deepEqual(tokens(r).map((f) => [f.sha256, f.ref, f.capture_sha]), [[sha("TOKEN-A"), REF, a], [sha("TOKEN-B"), REF, b]]);
  assert.deepEqual(tokens(r)[0], { sha256: sha("TOKEN-A"), ref: REF, path: `materials/${sha("TOKEN-A")}`, kind: "attestation",
                                   bytes: Buffer.byteLength("TOKEN-A"), capture_sha: a }, "every other field is what it was");
});

test("R1 (G47t) a single capture of a ref: its token carries its sha, lowercase", () => {
  const w = world();
  const a = capture(w, "INFO-2026-0001-a", "capture A", "TOKEN-A");
  const r = hold(w, [docRow(REF, a.toUpperCase())]);
  assert.deepEqual(tokens(r).map((f) => f.capture_sha), [a]);
  assert.equal(a, a.toLowerCase());
});

test("R1 (G47t) a token two different captures of the ref name is listed once with capture_sha null, whatever the order they name it in", () => {
  const w = world();
  const a = capture(w, "INFO-2026-0001-a", "capture A", "SHARED");
  const b = capture(w, "INFO-2026-0001-b", "capture B", "SHARED");
  for (const rows of [[a, b], [b, a]]) {
    const r = hold(w, rows.map((s) => docRow(REF, s)));
    assert.deepEqual(tokens(r).map((f) => [f.sha256, f.capture_sha]), [[sha("SHARED"), null]]);
  }
  /* the same token under another ref is its own entry, with its own capture */
  const r = hold(w, [docRow(REF, a), docRow("INFO-2026-0002-other", b)]);
  assert.deepEqual(tokens(r).map((f) => [f.ref, f.capture_sha]), [[REF, a], ["INFO-2026-0002-other", b]]);
});

test("R1 (G47t) the same capture naming a token twice keeps its sha, and A, B, A ends shared (null), never back to A", () => {
  const w = world();
  const a = capture(w, "INFO-2026-0001-a", "capture A", "TOKEN-A");
  /* a duplicated row of one capture */
  assert.deepEqual(tokens(hold(w, [docRow(REF, a), docRow(REF, a)])).map((f) => f.capture_sha), [a]);
  /* provenance and archive entry of one capture: the member's own token is also its archive's */
  const w2 = world();
  const { memberSha } = archiveWithMember(w2, "BOTH", "the member's text", "BOTH");
  const r2 = hold(w2, [docRow(MEM, memberSha)]);
  assert.deepEqual(tokens(r2).map((f) => [f.sha256, f.ref, f.capture_sha]), [[sha("BOTH"), MEM, memberSha]], "listed once, the member's sha");
  /* A, B, A over a token A and B share */
  const w3 = world();
  const a3 = capture(w3, "INFO-2026-0001-a", "capture A", "SHARED");
  const b3 = capture(w3, "INFO-2026-0001-b", "capture B", "SHARED");
  assert.deepEqual(tokens(hold(w3, [docRow(REF, a3), docRow(REF, b3), docRow(REF, a3)])).map((f) => f.capture_sha), [null]);
});

test("R1 (G47t) an archive's token carries the member material's sha, the capture it is shown under", () => {
  const w = world();
  const { memberSha, archiveSha, tokenSha } = archiveWithMember(w, "ARCHIVE-TOKEN", "the member's text");
  const r = hold(w, [docRow(MEM, memberSha)]);
  const att = tokens(r);
  assert.deepEqual(att.map((f) => [f.sha256, f.ref, f.capture_sha]), [[tokenSha, MEM, memberSha]]);
  /* controls: no other kind carries the key, and every other field is what it was */
  assert.deepEqual(r.files.filter((f) => f.kind !== "attestation").map((f) => [f.kind, "capture_sha" in f]),
                   [["document", false], ["container", false], ["archive", false]]);
  assert.ok(r.files.every((f) => f.path === `materials/${f.sha256}`));
  assert.equal(r.files.find((f) => f.kind === "archive").sha256, archiveSha);
});

test("R1 (G47t) controls: a document with no token, and an observation, carry no capture_sha key; the answers other than files are as before", () => {
  const w = world();
  const d = w.doc("INFO-2026-0003-plain", { text: "no token here" });
  const obs = w.observe("ann");
  const r = hold(w, [docRow("INFO-2026-0003-plain", d),
                     { ref: obs.id, kind: "observation", sha: obs.sha, text_sha: null, origin: null, archived_copy: null,
                       included: true, rests_under: "load_bearing" }]);
  assert.ok(r.files.length >= 2);
  assert.ok(r.files.every((f) => !("capture_sha" in f)));
  assert.deepEqual(r.materials, [{ sha: d, held: "inline" }, { sha: obs.sha, held: "inline" }]);
});
