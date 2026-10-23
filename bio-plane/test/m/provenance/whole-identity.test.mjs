/* provenance: a capture held in parts has one identity, its whole sha (R72; fix round 4b, F3, D1; K4487). The common
   fixture is the audit's: a three-part capture of about 20 MiB promoted by the real chain exactly as the capture
   screen promotes it (`screens-intake` `promoteDocument`): the parts' files as blobs, the register list of the parts
   alone, and `data/provenance.json` stating the whole's sha beside `parts`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, infoMd, provDoc, evidence } from "./fixture.mjs";

const MIB = 1024 * 1024;
const PARTS = [{ name: "p0", bytes: 8 * MIB }, { name: "p1", bytes: 8 * MIB }, { name: "p2", bytes: 4 * MIB + 17 }];
const TOTAL = PARTS.reduce((n, p) => n + p.bytes, 0);

/* The multipart document as acquisition and the capture screen write it: `file` names the whole (no file of its own),
   the parts are named beside the whole's sha. */
function multipartDoc(label, { parts = PARTS } = {}) {
  const held = parts.map((p, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: sha(`${label}:${p.name}`), bytes: p.bytes }));
  const whole = sha(`${label}:whole`);
  const doc = provDoc({ path: `snapshots/${label}`, text: "x" }, {
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary",
               bytes: held.reduce((n, p) => n + p.bytes, 0) },
    parts: held });
  return { whole, held, doc };
}

/* The promotion the screen makes: a register list of the parts, no whole. */
function promoteMultipart(w, id, m, { base = null, snapKey = `k${Math.random().toString(16).slice(2)}`, extra = {} } = {}) {
  const md = infoMd(id);
  const prov = JSON.stringify({ documents: [m.doc] }, null, 1);
  return w.promotion.promote({
    bundleId: id, base, snapKey, author: "member:alice", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: md }, { path: "data/provenance.json", text: prov },
            ...m.held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: m.held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })),
    ...extra });
}

test("R72: a multipart capture's whole sha resolves to its bundle by homeOf and by the register table (whole row), the parts' rows unchanged", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const m = multipartDoc("big");
  assert.equal(w.prov.homeOf(m.whole), null, "before the promotion nothing names the whole");
  const r = promoteMultipart(w, "INFO-2026-0001-big", m);
  assert.equal(r.ok, true, JSON.stringify(r));

  const home = w.prov.homeOf(m.whole);
  assert.deepEqual(home, { bundleId: "INFO-2026-0001-big", path: "snapshots/big", encoding: "binary", bytes: TOTAL,
                           registered: "2026-10-22T01:00:00.000Z", authored: false });
  assert.deepEqual(w.prov.homeOf(`sha256:${m.whole.toUpperCase()}`), home, "a prefix and case are ignored, as R4's are");

  const row = w.row(`SELECT * FROM register WHERE capture_sha = ?`, m.whole);
  assert.equal(row.whole, 1);
  assert.equal(row.bundle_id, "INFO-2026-0001-big");
  assert.equal(row.last_registered, "2026-10-22T01:00:00.000Z");
  assert.equal(row.authored, 0);

  /* The parts' rows are as the screen registered them, and are not marked. */
  for (const p of m.held) {
    const pr = w.row(`SELECT * FROM register WHERE capture_sha = ?`, p.sha256);
    assert.deepEqual({ bundle_id: pr.bundle_id, path: pr.path, encoding: pr.encoding, bytes: pr.bytes, whole: pr.whole },
                     { bundle_id: "INFO-2026-0001-big", path: p.file, encoding: "binary", bytes: p.bytes, whole: 0 });
  }
  assert.equal(w.count("register"), 4);
  assert.deepEqual(w.prov.registeredFor("INFO-2026-0001-big").map((x) => x.capture_sha).sort(),
                   [m.whole, ...m.held.map((p) => p.sha256)].sort());
  /* acquire's question for a multipart capture (D-476) now has an answer. */
  assert.equal(w.prov.registerHolds({ sha: m.whole }).registered, true);
  /* A later module's own SQL on the read contract (R48) finds the home by the whole sha. */
  assert.equal(w.row(`SELECT r.bundle_id FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id WHERE r.capture_sha = ?`, m.whole).bundle_id,
               "INFO-2026-0001-big");
});

test("R72: a bundle's verification is unchanged: the whole row is held in parts, the audit stays sound, partsNamed names the same parts", async () => {
  const w = world();
  const m = multipartDoc("verify");
  assert.equal(promoteMultipart(w, "INFO-2026-0002-verify", m).ok, true);
  const named = w.prov.partsNamed("INFO-2026-0002-verify", m.whole);
  assert.deepEqual(named, { state: "named", parts: m.held.map((p) => ({ file: p.file, sha256: p.sha256, bytes: p.bytes })) });
  /* Every part is held in the evidence store, none whole: the whole's row is the held-in-parts case, as D-533 states it. */
  const store = evidence(Object.fromEntries(m.held.map((p) => [p.sha256, Buffer.alloc(0)])));
  store.head = async (k) => { const p = m.held.find((x) => x.sha256 === k); return p ? { size: p.bytes, checksums: { sha256: Buffer.from(k, "hex") } } : null; };
  const report = await w.prov.registerAudit(store);
  assert.equal(report.sound, true, JSON.stringify(report));
  assert.equal(report.unbacked, 0);
  assert.equal(report.mismatched, 0);
  assert.equal(report.held_in_parts, 1, "the whole's row; the parts' rows are the bundle's live files");
  assert.equal(report.live, 3);
  /* A part gone from the store is named missing, as before. */
  const lost = m.held[1].sha256;
  const short = { ...store, head: async (k) => (k === lost ? null : store.head(k)) };
  const bad = await w.prov.registerAudit(short);
  assert.equal(bad.sound, false);
  assert.equal(bad.unbacked, 1);
  assert.equal(bad.sample[0].missing_parts[0].sha256, lost);
});

test("R72: a document stated in one part, or with no sha of its own, gets no whole row (control)", () => {
  const w = world();
  const a = w.cap("single");
  assert.equal(w.promoteInfo("INFO-2026-0003-single", { captures: [a] }).ok, true);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM register WHERE whole = 1`).n, 0);
  assert.equal(w.count("register"), 1);
  /* a stated `parts` that is not a list is no multipart capture: nothing is registered for it */
  const m = multipartDoc("odd");
  const odd = { ...m.doc, parts: "none" };
  const r = w.promotion.promote({ bundleId: "INFO-2026-0004-odd", base: null, snapKey: "odd", author: "member:alice",
    meta: { object_type: "information" }, replay: true,
    files: [{ path: "bundle.md", text: infoMd("INFO-2026-0004-odd") },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [odd] }) }],
    register: [] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.prov.homeOf(m.whole), null);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM register WHERE whole = 1`).n, 0);
});

test("R72: a revision of the bundle keeps the whole row's first registration and moves its last, as R1 states for every row", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const m = multipartDoc("rev");
  assert.equal(promoteMultipart(w, "INFO-2026-0005-rev", m).ok, true);
  w.clock.now = "2026-10-22T05:00:00.000Z";
  const head = w.head("INFO-2026-0005-rev");
  const r = promoteMultipart(w, "INFO-2026-0005-rev", m, { base: head.bundleSha, snapKey: "rev2" });
  assert.equal(r.ok, true, JSON.stringify(r));
  const row = w.row(`SELECT registered, last_registered, whole FROM register WHERE capture_sha = ?`, m.whole);
  assert.deepEqual({ ...row }, { registered: "2026-10-22T01:00:00.000Z", last_registered: "2026-10-22T05:00:00.000Z", whole: 1 });
  assert.equal(w.count("register"), 4);
});

test("R72 (R2): one capture, one home extends to the whole: a second record registering the same whole is refused, and nothing is written", () => {
  const w = world();
  const m = multipartDoc("first");
  assert.equal(promoteMultipart(w, "INFO-2026-0006-first", m).ok, true);
  /* different parts, the same whole sha: only the whole names the clash */
  const n = multipartDoc("second");
  n.doc.capture.sha256 = m.whole;
  const before = w.snapshot();
  const r = promoteMultipart(w, "INFO-2026-0007-second", n);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
  assert.equal(r.capture_sha, m.whole);
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.prov.homeOf(m.whole).bundleId, "INFO-2026-0006-first");
});

test("R72: a bundle promoted before the change is repaired at the next wake: the whole's row is back-filled once, from the bundle's own data/provenance.json", () => {
  const w = world({ now: "2026-10-22T01:00:00.000Z" });
  const m = multipartDoc("old");
  assert.equal(promoteMultipart(w, "INFO-2026-0008-old", m).ok, true);
  const single = w.cap("plain");
  assert.equal(w.promoteInfo("INFO-2026-0009-plain", { captures: [single] }).ok, true);
  /* a bundle promoted by the code before this change registered the parts alone, and its rows carry no mark */
  w.st.sql.exec(`DELETE FROM register WHERE capture_sha = ?`, m.whole);
  assert.equal(w.prov.homeOf(m.whole), null, "red: the old bundle's whole resolves to nothing");

  w.clock.now = "2026-10-22T09:00:00.000Z";
  w.prov.migrate();                                                      /* the plane's wake */
  const home = w.prov.homeOf(m.whole);
  assert.equal(home.bundleId, "INFO-2026-0008-old");
  assert.equal(home.path, "snapshots/old");
  assert.equal(home.bytes, TOTAL);
  assert.equal(home.encoding, "binary");
  /* the instant the capture was first held: the parts' registration, not the repair's clock */
  assert.equal(home.registered, "2026-10-22T01:00:00.000Z");
  assert.equal(w.row(`SELECT whole, last_registered FROM register WHERE capture_sha = ?`, m.whole).whole, 1);
  assert.equal(w.row(`SELECT last_registered FROM register WHERE capture_sha = ?`, m.whole).last_registered, "2026-10-22T01:00:00.000Z");

  /* once: a second wake changes nothing, and the single-part bundle was never touched */
  const after = w.snapshot();
  w.clock.now = "2026-10-22T10:00:00.000Z";
  w.prov.migrate();
  assert.deepEqual(w.snapshot(), after);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM register WHERE whole = 1`).n, 1);
});

test("R72: the repair never moves a capture another record holds, and writes nothing for a bundle that states no parts (control)", () => {
  const w = world();
  const m = multipartDoc("held");
  assert.equal(promoteMultipart(w, "INFO-2026-0010-held", m).ok, true);
  w.st.sql.exec(`DELETE FROM register WHERE capture_sha = ?`, m.whole);
  /* another record came to hold those bytes in the meantime, as an ordinary single capture */
  const other = { path: "snapshots/other.bin", text: "other", sha: m.whole };
  const r = w.promotion.promote({ bundleId: "INFO-2026-0011-other", base: null, snapKey: "o", author: "member:alice",
    meta: { object_type: "information" }, replay: true,
    files: [{ path: "bundle.md", text: infoMd("INFO-2026-0011-other") }, { path: other.path, text: other.text }],
    register: [{ sha256: m.whole, path: other.path, bytes: 5 }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  w.prov.migrate();
  assert.equal(w.prov.homeOf(m.whole).bundleId, "INFO-2026-0011-other", "one capture, one home: the holder stays");
  assert.equal(w.row(`SELECT whole FROM register WHERE capture_sha = ?`, m.whole).whole, 0);
});

test("R72: a register row of a home that is gone does not hold the whole: the repair registers it afresh", () => {
  const w = world();
  const m = multipartDoc("orphan");
  assert.equal(promoteMultipart(w, "INFO-2026-0012-orphan", m).ok, true);
  /* a stale row for the whole under a bundle that no longer exists */
  w.st.sql.exec(`UPDATE register SET bundle_id = 'INFO-2026-0099-gone', whole = 0 WHERE capture_sha = ?`, m.whole);
  assert.equal(w.prov.homeOf(m.whole), null);
  w.prov.migrate();
  assert.equal(w.prov.homeOf(m.whole).bundleId, "INFO-2026-0012-orphan");
});
