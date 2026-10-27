/* provenance: the whole digest is the register's only key; a multipart capture's parts are rows of the child table
   `register_parts` (R74–R79; fix round 9, G127a/c/d/e; K4833, K4837). The common fixture is the one a member's
   upload makes: a three-part capture promoted by the real chain with a register list of the whole carrying its
   `parts` (R75), and, for the shape a cached page still sends, the whole followed by one row per part (R77). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, infoMd, provDoc } from "./fixture.mjs";

const MIB = 1024 * 1024;
const SIZES = [8 * MIB, 8 * MIB, 4 * MIB + 17];

/* A multipart capture: `label` makes the whole and the parts unique; `shared` replaces the part at an index with a
   named digest, so two captures can hold one byte-equal part. */
function capture(label, { shared = {}, sizes = SIZES } = {}) {
  const parts = sizes.map((bytes, i) => ({
    file: `snapshots/${label}.part${String(i).padStart(3, "0")}`,
    sha256: shared[i] ?? sha(`${label}:part${i}`), bytes }));
  const whole = sha(`${label}:whole`);
  const total = parts.reduce((n, p) => n + p.bytes, 0);
  const doc = provDoc({ path: `snapshots/${label}`, text: "x" }, {
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: total },
    parts });
  return { label, whole, parts, total, doc, path: `snapshots/${label}` };
}
const wholeEntry = (m, extra = {}) => ({ sha256: m.whole, path: m.path, encoding: "binary", bytes: m.total,
  parts: m.parts.map((p) => ({ sha256: p.sha256, path: p.file, bytes: p.bytes })), ...extra });
const partRow = (p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes });
const files = (m) => [{ path: "bundle.md", text: "" }, { path: "data/provenance.json", text: JSON.stringify({ documents: [m.doc] }, null, 1) },
  ...m.parts.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))];

function promote(w, id, m, register, { base = null, snapKey = `k${Math.random().toString(16).slice(2)}`, extra = {} } = {}) {
  const fs = files(m);
  fs[0] = { path: "bundle.md", text: infoMd(id) };
  return w.promotion.promote({ bundleId: id, base, snapKey, author: "member:alice", meta: { object_type: "information" },
    files: fs, register: register ?? [wholeEntry(m)], ...extra });
}
const partsRows = (w, bundle) => w.rows(`SELECT bundle_id, whole_sha, idx, part_sha, bytes, path FROM register_parts
                                          WHERE bundle_id = ? ORDER BY whole_sha, idx`, bundle).map((r) => ({ ...r }));

test("R75: a register row of a whole carrying three parts writes one register row and three register_parts rows", () => {
  const w = world({ now: "2026-10-24T01:00:00.000Z" });
  const m = capture("big");
  const r = promote(w, "INFO-2026-0001-big", m);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.count("register"), 1, "a part is never a register row");
  const row = w.row(`SELECT capture_sha, bundle_id, path, bytes, whole FROM register`);
  assert.deepEqual({ ...row }, { capture_sha: m.whole, bundle_id: "INFO-2026-0001-big", path: m.path, bytes: m.total, whole: 1 });
  assert.deepEqual(partsRows(w, "INFO-2026-0001-big"),
    m.parts.map((p, i) => ({ bundle_id: "INFO-2026-0001-big", whole_sha: m.whole, idx: i, part_sha: p.sha256, bytes: p.bytes, path: p.file })));
  /* control: an ordinary single capture writes one register row and no part */
  const a = w.cap("plain");
  assert.equal(w.promoteInfo("INFO-2026-0002-plain", { captures: [a] }).ok, true);
  assert.equal(w.count("register"), 2);
  assert.equal(w.count("register_parts"), 3);
  assert.equal(w.row(`SELECT whole FROM register WHERE capture_sha = ?`, a.sha).whole, 0);
});

test("R75: a part states a 64-hex digest and a whole number of bytes at least 0, else the promotion is refused naming the part and writes nothing", () => {
  const w = world();
  const m = capture("bad");
  const before = w.snapshot();
  const bytes = wholeEntry(m); bytes.parts[1] = { ...bytes.parts[1], bytes: -1 };
  const r1 = promote(w, "INFO-2026-0003-bad", m, [bytes]);
  assert.equal(r1.ok, false);
  assert.equal(r1.reason, "REGISTER_BYTES_UNSTATED");
  assert.equal(r1.index, 0);
  assert.equal(r1.part, 1, "the refusal names the part");
  assert.equal(r1.sha256, m.parts[1].sha256);
  const missing = wholeEntry(m); delete missing.parts[2].bytes;
  assert.equal(promote(w, "INFO-2026-0003-bad", m, [missing]).reason, "REGISTER_BYTES_UNSTATED");
  const digest = wholeEntry(m); digest.parts[0] = { ...digest.parts[0], sha256: "NOT-A-DIGEST" };
  const r3 = promote(w, "INFO-2026-0003-bad", m, [digest]);
  assert.equal(r3.ok, false);
  assert.equal(r3.reason, "REGISTER_PART_MALFORMED");
  assert.equal(r3.index, 0);
  assert.equal(r3.part, 0);
  const upper = wholeEntry(m); upper.parts[0] = { ...upper.parts[0], sha256: m.parts[0].sha256.toUpperCase() };
  assert.equal(promote(w, "INFO-2026-0003-bad", m, [upper]).reason, "REGISTER_PART_MALFORMED", "lowercase hex only");
  assert.deepEqual(w.snapshot(), before, "nothing was written");
  /* control: the same list stated whole is accepted */
  assert.equal(promote(w, "INFO-2026-0003-bad", m).ok, true);
});

test("R74: a part shared by two documents is no conflict: each bundle keeps its own register_parts rows, and a part is no home", () => {
  const w = world();
  const shared = sha("filler: the byte-equal 8 MiB part of two distinct PDFs");
  const a = capture("pdf-a", { shared: { 1: shared } });
  const b = capture("pdf-b", { shared: { 1: shared } });
  assert.equal(promote(w, "INFO-2026-0001-a", a).ok, true);
  const r = promote(w, "INFO-2026-0002-b", b);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.count("register"), 2, "two wholes");
  assert.equal(partsRows(w, "INFO-2026-0001-a").length, 3);
  assert.equal(partsRows(w, "INFO-2026-0002-b").length, 3);
  assert.equal(partsRows(w, "INFO-2026-0001-a")[1].part_sha, shared, "A's row was not moved");
  assert.equal(partsRows(w, "INFO-2026-0002-b")[1].part_sha, shared);
  assert.equal(w.prov.homeOf(shared), null, "a part answers no home");
  assert.equal(w.prov.homeOf(a.parts[0].sha256), null);
  assert.equal(w.prov.registerHolds({ sha: shared }).registered, false);
  assert.equal(w.prov.homeOf(a.whole).bundleId, "INFO-2026-0001-a");
  assert.equal(w.prov.homeOf(b.whole).bundleId, "INFO-2026-0002-b");
  const census = w.prov.homeCensus({});
  assert.equal(census.shas, 0, "the census lists neither");
  assert.equal(census.register.rows, 2, "the census counts wholes only");
  /* a revision of A leaves B's rows alone, and replaces A's own */
  const head = w.head("INFO-2026-0001-a");
  const again = promote(w, "INFO-2026-0001-a", a, null, { base: head.bundleSha, snapKey: "rev" });
  assert.equal(again.ok, true, JSON.stringify(again));
  assert.equal(partsRows(w, "INFO-2026-0001-a").length, 3, "replaced, not doubled");
  assert.equal(partsRows(w, "INFO-2026-0002-b").length, 3);
  /* control: a part that is also the digest of a whole the register holds answers that whole (R74's unless) */
  const c = capture("pdf-c", { shared: { 0: a.whole } });
  assert.equal(promote(w, "INFO-2026-0003-c", c).ok, true);
  assert.equal(w.prov.homeOf(a.whole).bundleId, "INFO-2026-0001-a", "the whole it equals still has one home");
});

test("R76: CAPTURE_HELD_BY_ANOTHER_BUNDLE is raised for a whole only, naming kind whole; a shared part is never refused", () => {
  const w = world();
  const shared = sha("shared filler part");
  const a = capture("one", { shared: { 2: shared } });
  const b = capture("two", { shared: { 2: shared } });
  assert.equal(promote(w, "INFO-2026-0001-one", a).ok, true);
  assert.equal(promote(w, "INFO-2026-0002-two", b).ok, true, "red before: refused for the shared part");
  /* B registering A's whole */
  const before = w.snapshot();
  const clash = capture("three");
  const dup = wholeEntry(clash, { sha256: a.whole });
  const r = promote(w, "INFO-2026-0003-three", clash, [dup]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
  assert.equal(r.kind, "whole");
  assert.equal(r.capture_sha, a.whole);
  assert.equal(r.holder, "INFO-2026-0001-one");
  assert.deepEqual(w.snapshot(), before, "nothing was written");
  /* control: the same file promoted by a second member is refused for the whole only */
  const again = promote(w, "INFO-2026-0004-again", a);
  assert.equal(again.ok, false);
  assert.equal(again.kind, "whole");
  assert.equal(again.capture_sha, a.whole);
  /* the holder is named only to a caller who may see it (R2): a stamped identity with no sight of it gets null */
  const hidden = promote(w, "INFO-2026-0005-hidden", a, null, { extra: { actorIdentity: "member:nobody", actorViewer: { identity: "member:nobody" } } });
  assert.equal(hidden.ok, false);
  assert.equal(hidden.kind, "whole");
});

test("R77: a part sent as its own register row after its whole is read as a part: the old shape writes what R75's shape writes", () => {
  const legacy = world({ now: "2026-10-24T01:00:00.000Z" }), modern = world({ now: "2026-10-24T01:00:00.000Z" });
  const m = capture("old");
  const whole = { sha256: m.whole, path: m.path, encoding: "binary", bytes: m.total };
  assert.equal(promote(legacy, "INFO-2026-0001-old", m, [whole, ...m.parts.map(partRow)]).ok, true);
  assert.equal(promote(modern, "INFO-2026-0001-old", m).ok, true);
  assert.equal(legacy.count("register"), 1, "a part row never reaches register");
  assert.deepEqual(partsRows(legacy, "INFO-2026-0001-old"), partsRows(modern, "INFO-2026-0001-old"));
  assert.deepEqual(legacy.rows(`SELECT * FROM register`).map((r) => ({ ...r })), modern.rows(`SELECT * FROM register`).map((r) => ({ ...r })));
  /* parts are ordered by their number in the name, whatever the order of the rows */
  const w = world();
  assert.equal(promote(w, "INFO-2026-0002-old", m, [whole, ...[...m.parts].reverse().map(partRow)]).ok, true);
  assert.deepEqual(partsRows(w, "INFO-2026-0002-old").map((r) => r.part_sha), m.parts.map((p) => p.sha256));
});

test("R77: a part row whose whole is not in the list is refused before anything is written, naming the entry; an ordinary path is a whole", () => {
  const w = world();
  const m = capture("orphan");
  const before = w.snapshot();
  const r = promote(w, "INFO-2026-0001-orphan", m, m.parts.map(partRow));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "REGISTER_PART_WITHOUT_WHOLE");
  assert.equal(r.index, 0);
  assert.equal(r.sha256, m.parts[0].sha256);
  assert.equal(r.path, m.parts[0].file);
  assert.deepEqual(w.snapshot(), before);
  /* control: a row with an ordinary path and the same digest as a file's blob is a whole */
  const plain = { sha256: m.parts[0].sha256, path: "snapshots/ordinary.bin", encoding: "binary", bytes: m.parts[0].bytes };
  const fs = [{ path: "bundle.md", text: infoMd("INFO-2026-0002-plain") }, { path: plain.path, blobSha: plain.sha256, sha256: plain.sha256, bytes: plain.bytes }];
  const ok = w.promotion.promote({ bundleId: "INFO-2026-0002-plain", base: null, snapKey: "p", author: "member:alice",
    meta: { object_type: "information" }, files: fs, register: [plain] });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(w.prov.homeOf(plain.sha256).bundleId, "INFO-2026-0002-plain");
  assert.equal(w.count("register_parts"), 0);
});

test("R78: partsOf answers a whole's parts in order, the same for every reader; null for a whole held whole, a part's digest, a malformed digest", () => {
  const w = world();
  const shared = sha("a part both share");
  const a = capture("pa", { shared: { 0: shared } });
  const b = capture("pb", { shared: { 0: shared } });
  assert.equal(promote(w, "INFO-2026-0001-pa", a).ok, true);
  assert.equal(promote(w, "INFO-2026-0002-pb", b).ok, true);
  const want = (m) => m.parts.map((p) => ({ sha256: p.sha256, bytes: p.bytes }));
  assert.deepEqual(w.prov.partsOf(a.whole), want(a));
  assert.deepEqual(w.prov.partsOf(b.whole), want(b));
  assert.deepEqual(w.prov.partsOf(`sha256:${a.whole.toUpperCase()}`), want(a), "a prefix and case are ignored");
  assert.equal(w.prov.partsOf(shared), null, "a part's own digest is no whole");
  const plain = w.cap("held-whole");
  assert.equal(w.promoteInfo("INFO-2026-0003-plain", { captures: [plain] }).ok, true);
  assert.equal(w.prov.partsOf(plain.sha), null, "held whole");
  assert.equal(w.prov.partsOf(sha("never registered")), null);
  for (const bad of ["", null, undefined, "xyz", 42, "a".repeat(63)]) assert.equal(w.prov.partsOf(bad), null);
  /* reads only */
  const before = w.snapshot();
  w.prov.partsOf(a.whole);
  assert.deepEqual(w.snapshot(), before);
});

test("R79: part-keyed rows already in a live record are moved to register_parts under their whole, counted, and a second run moves nothing", () => {
  const w = world({ now: "2026-10-24T01:00:00.000Z" });
  const shared = sha("old shared");
  const a = capture("live-a", { shared: { 1: shared } });
  const b = capture("live-b");
  assert.equal(promote(w, "INFO-2026-0001-a", a).ok, true);
  assert.equal(promote(w, "INFO-2026-0002-b", b).ok, true);
  const single = w.cap("whole-held");
  assert.equal(w.promoteInfo("INFO-2026-0003-single", { captures: [single] }).ok, true);
  /* the record as the old register code left it (fix round 4b's shape): the parts as register rows, the whole marked,
     no register_parts rows */
  for (const m of [a, b]) {
    const bundle = m === a ? "INFO-2026-0001-a" : "INFO-2026-0002-b";
    w.st.sql.exec(`DELETE FROM register_parts WHERE bundle_id = ?`, bundle);
    for (const p of m.parts) w.st.sql.exec(
      `INSERT OR IGNORE INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,last_registered,authored,whole) VALUES (?,?,?,?,?,?,?,0,0)`,
      p.sha256, bundle, p.file, "binary", p.bytes, "2026-10-23T08:00:00.000Z", "2026-10-23T08:00:00.000Z");
  }
  assert.equal(w.count("register"), 3 + 6, "three wholes and six part rows");
  assert.equal(w.prov.homeOf(shared).bundleId, "INFO-2026-0001-a", "red: the old shape answers a part its home");
  const wholeRow = w.row(`SELECT registered, whole FROM register WHERE capture_sha = ?`, a.whole);

  const first = w.prov.repairParts();
  assert.deepEqual(first, { moved: 6, left: 0 }, JSON.stringify(first));
  assert.equal(w.count("register"), 3, "wholes only");
  assert.equal(w.prov.homeOf(shared), null);
  assert.deepEqual(w.prov.partsOf(a.whole), a.parts.map((p) => ({ sha256: p.sha256, bytes: p.bytes })));
  assert.deepEqual(w.prov.partsOf(b.whole), b.parts.map((p) => ({ sha256: p.sha256, bytes: p.bytes })));
  assert.deepEqual(partsRows(w, "INFO-2026-0001-a").map((r) => r.path), a.parts.map((p) => p.file));
  assert.deepEqual({ ...w.row(`SELECT registered, whole FROM register WHERE capture_sha = ?`, a.whole) }, { ...wholeRow }, "the whole's row is untouched");
  assert.equal(w.row(`SELECT whole FROM register WHERE capture_sha = ?`, single.sha).whole, 0, "control: a whole held whole is never moved");
  assert.equal(w.prov.homeOf(single.sha).bundleId, "INFO-2026-0003-single");
  /* each bundle's link between its capture and its parts survives */
  assert.equal(w.prov.registeredFor("INFO-2026-0001-a").find((r) => r.capture_sha === a.whole).parts.length, 3);

  const after = w.snapshot();
  assert.deepEqual(w.prov.repairParts(), { moved: 0, left: 0 });
  w.prov.migrate();
  assert.deepEqual(w.snapshot(), after, "a second run changes nothing");
});

test("R79: the repair runs at the plane's wake, back-fills an old bundle that had no whole row, and leaves a row it cannot place, counted", () => {
  const w = world({ now: "2026-10-24T01:00:00.000Z" });
  const m = capture("wake");
  assert.equal(promote(w, "INFO-2026-0001-wake", m).ok, true);
  /* a bundle promoted before fix round 4b: the parts alone as register rows, no whole row, no register_parts */
  w.st.sql.exec(`DELETE FROM register_parts`);
  w.st.sql.exec(`DELETE FROM register`);
  for (const p of m.parts) w.st.sql.exec(
    `INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,last_registered,authored,whole) VALUES (?,?,?,?,?,?,?,0,0)`,
    p.sha256, "INFO-2026-0001-wake", p.file, "binary", p.bytes, "2026-10-20T08:00:00.000Z", "2026-10-20T08:00:00.000Z");
  /* and a part-named row no bundle document accounts for */
  const stray = sha("stray");
  w.st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,last_registered,authored,whole) VALUES (?,?,?,?,?,?,?,0,0)`,
    stray, "INFO-2026-0001-wake", "snapshots/nowhere.part000", "binary", 7, "2026-10-20T08:00:00.000Z", "2026-10-20T08:00:00.000Z");
  w.clock.now = "2026-10-24T09:00:00.000Z";
  assert.deepEqual(w.prov.migrate(), { ok: true });
  assert.equal(w.prov.homeOf(m.whole).bundleId, "INFO-2026-0001-wake");
  assert.equal(w.prov.homeOf(m.whole).registered, "2026-10-20T08:00:00.000Z", "the parts' first registration is the whole's instant");
  assert.equal(w.prov.partsOf(m.whole).length, 3);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM register WHERE capture_sha = ?`, m.parts[0].sha256).n, 0);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM register WHERE capture_sha = ?`, stray).n, 1, "a row it cannot place is left, never deleted");
  assert.deepEqual(w.prov.repairParts(), { moved: 0, left: 1 });
});
