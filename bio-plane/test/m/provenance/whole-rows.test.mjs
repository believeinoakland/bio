/* provenance: a reader by bundle meets a capture held in parts as ONE capture (R73; fix round 4b, F3 verification, K4508;
   amends R12). The common fixture is R72's: a ~20 MiB three-part capture promoted by the real chain exactly as the
   capture screen promotes it, the register list holding the parts alone and R72 adding the whole's row. Before R73
   `capturesOf` listed the three parts and the whole at one instant, tied by digest, so the bundle's first-held
   capture was a part about three times in four. No stored data changes (the rows are R72's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, infoMd, provDoc } from "./fixture.mjs";

const MIB = 1024 * 1024;
const PARTS = [{ name: "p0", bytes: 8 * MIB }, { name: "p1", bytes: 8 * MIB }, { name: "p2", bytes: 4 * MIB + 17 }];

function multipartDoc(label) {
  const held = PARTS.map((p, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: sha(`${label}:${p.name}`), bytes: p.bytes }));
  const whole = sha(`${label}:whole`);
  const doc = provDoc({ path: `snapshots/${label}`, text: "x" }, {
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary",
               bytes: held.reduce((n, p) => n + p.bytes, 0) },
    parts: held });
  return { whole, held, doc };
}
function promoteMultipart(w, id, m, { base = null, snapKey = `k${Math.random().toString(16).slice(2)}`, extraDocs = [], extraFiles = [], extraRegister = [] } = {}) {
  return w.promotion.promote({
    bundleId: id, base, snapKey, author: "member:alice", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(id) },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [m.doc, ...extraDocs] }, null, 1) },
            ...m.held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes })), ...extraFiles],
    register: [...m.held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })), ...extraRegister] });
}

/* Labels whose whole sorts before every part, and labels whose whole sorts after the first part: both orders, so the
   test cannot pass by the luck of a digest. */
function labels() {
  const first = [], notFirst = [];
  for (let i = 0; first.length < 2 || notFirst.length < 2; i++) {
    const m = multipartDoc(`L${i}`);
    const wholeFirst = m.held.every((p) => m.whole < p.sha256);
    (wholeFirst ? first : notFirst).length < 2 && (wholeFirst ? first : notFirst).push(`L${i}`);
    if (i > 400) throw new Error("no label of each order");
  }
  return { first, notFirst };
}

test("R73: capturesOf lists a capture held in parts by its whole alone, for every order of the digests", () => {
  const { first, notFirst } = labels();
  for (const label of [...first, ...notFirst]) {
    const w = world({ now: "2026-10-22T01:00:00.000Z" });
    const m = multipartDoc(label);
    const id = "INFO-2026-0001-big";
    assert.equal(promoteMultipart(w, id, m).ok, true);
    assert.equal(w.count("register"), 4, "R72's rows: three parts and the whole");
    assert.deepEqual(w.prov.capturesOf(id), [{ capture_sha: m.whole, held_at: "2026-10-22T01:00:00.000Z" }], label);
  }
});

test("R73: the whole is listed at the earliest instant any of its rows was held, a part's receipt included", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const m = multipartDoc("early");
  assert.equal(promoteMultipart(w, "INFO-2026-0002-early", m).ok, true);
  w.prov.recordReceipt({ address: "https://example.org/big", addressNorm: "https://example.org/big", captureSha: m.held[1].sha256,
                         retrieved: "2026-10-21T08:00:00Z" });
  assert.deepEqual(w.prov.capturesOf("INFO-2026-0002-early"), [{ capture_sha: m.whole, held_at: "2026-10-21T08:00:00Z" }]);
  /* the whole's own receipt counts as it did */
  w.prov.recordReceipt({ address: "https://example.org/big", addressNorm: "https://example.org/big", captureSha: m.whole,
                         retrieved: "2026-10-20T08:00:00Z" });
  assert.deepEqual(w.prov.capturesOf("INFO-2026-0002-early"), [{ capture_sha: m.whole, held_at: "2026-10-20T08:00:00Z" }]);
});

test("R73: the bundle's first-held capture is the document's identity: a multipart beside a single file keeps R12's order", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const m = multipartDoc("pair");
  const single = w.cap("later");
  w.clock.now = "2026-10-22T01:00:00.000Z";
  const extra = provDoc(single);
  assert.equal(promoteMultipart(w, "INFO-2026-0003-pair", m, {
    extraDocs: [extra], extraFiles: [{ path: single.path, text: single.text }],
    extraRegister: [{ sha256: single.sha, path: single.path, encoding: "utf8", bytes: Buffer.byteLength(single.text) }] }).ok, true);
  const got = w.prov.capturesOf("INFO-2026-0003-pair").map((c) => c.capture_sha);
  assert.deepEqual([...got].sort(), [m.whole, single.sha].sort(), "two captures, not five");
  assert.equal(got.length, 2);
});

test("R73: registeredFor keeps every row and marks the whole's row and each part's whole", () => {
  const w = world();
  const m = multipartDoc("marks");
  const single = w.cap("plain");
  assert.equal(promoteMultipart(w, "INFO-2026-0004-marks", m, {
    extraDocs: [provDoc(single)], extraFiles: [{ path: single.path, text: single.text }],
    extraRegister: [{ sha256: single.sha, path: single.path, encoding: "utf8", bytes: Buffer.byteLength(single.text) }] }).ok, true);
  const rows = w.prov.registeredFor("INFO-2026-0004-marks");
  assert.equal(rows.length, 5, "every row is kept");
  const by = Object.fromEntries(rows.map((r) => [r.capture_sha, r]));
  assert.equal(by[m.whole].whole, 1);
  assert.equal(by[m.whole].part_of, null);
  for (const p of m.held) { assert.equal(by[p.sha256].whole, 0); assert.equal(by[p.sha256].part_of, m.whole); }
  assert.equal(by[single.sha].whole, 0);
  assert.equal(by[single.sha].part_of, null);
  assert.deepEqual(rows.map((r) => r.capture_sha), [...rows.map((r) => r.capture_sha)].sort(), "still in capture_sha order");
});

test("R73 (control): a bundle with no capture held in parts lists and marks as R11 and R12 stated", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const a = w.cap("a"), b = w.cap("b");
  assert.equal(w.promoteInfo("INFO-2026-0005-plain", { captures: [a, b] }).ok, true);
  assert.deepEqual(w.prov.capturesOf("INFO-2026-0005-plain").map((c) => c.capture_sha).sort(), [a.sha, b.sha].sort());
  for (const r of w.prov.registeredFor("INFO-2026-0005-plain")) { assert.equal(r.whole, 0); assert.equal(r.part_of, null); }
  assert.deepEqual(w.prov.capturesOf("INFO-2026-9999-none"), []);
  assert.deepEqual(w.prov.registeredFor("INFO-2026-9999-none"), []);
});

test("R73 (R-OLD): no stored data changes: the register and receipts are as R72 wrote them, and a repaired old bundle reads the same", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const m = multipartDoc("old");
  assert.equal(promoteMultipart(w, "INFO-2026-0006-old", m).ok, true);
  w.st.sql.exec(`DELETE FROM register WHERE capture_sha = ?`, m.whole);
  w.prov.migrate();
  const before = w.snapshot();
  assert.deepEqual(w.prov.capturesOf("INFO-2026-0006-old").map((c) => c.capture_sha), [m.whole]);
  w.prov.registeredFor("INFO-2026-0006-old");
  assert.deepEqual(w.snapshot(), before, "the readers write nothing");
});
