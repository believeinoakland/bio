/* provenance: the register, written inside a promotion (R1–R3), and its reads (R4, R5, R11, R12); the invariants
   about who writes it (R35, R38, R41) and the read contract (R48). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, provDoc } from "./fixture.mjs";
import { PROVENANCE_TABLES } from "../../../src/provenance/index.mjs";

test("R1: one row per capture, with the module's clock, and a revision updates it without clearing what it keeps", () => {
  const w = world({ now: "2026-09-27T03:00:00.000Z" });
  const a = w.cap("a");
  const r = w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  assert.equal(r.ok, true);
  const row = w.row(`SELECT * FROM register WHERE capture_sha=?`, a.sha);
  assert.deepEqual({ ...row }, { capture_sha: a.sha, bundle_id: "INFO-2026-0001-a", path: a.path, encoding: "utf8",
    bytes: Buffer.byteLength(a.text), registered: "2026-09-27T03:00:00.000Z", authored: 0, author: null, observed_at: null });
  /* The clock is the module's, never a caller's: a caller's `registered` in the entry is not read. */
  w.clock.now = "2026-09-27T04:00:00.000Z";
  const head = w.head("INFO-2026-0001-a");
  const moved = { ...a, path: "snapshots/moved.txt" };
  const r2 = w.promotion.promote({
    bundleId: "INFO-2026-0001-a", base: head.bundleSha, snapKey: "k2", author: "member:alice",
    files: [{ path: "bundle.md", text: w.record.readFile("INFO-2026-0001-a", "bundle.md").text },
            { path: a.path, text: a.text }, { path: moved.path, text: a.text },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(a)] }) }],
    meta: { object_type: "information" },
    register: [{ sha256: a.sha, path: moved.path, bytes: Buffer.byteLength(a.text), registered: "1999-01-01T00:00:00Z",
                 authored: 1, author: "member:mallory" }] });
  assert.equal(r2.ok, true, JSON.stringify(r2));
  const row2 = w.row(`SELECT * FROM register WHERE capture_sha=?`, a.sha);
  assert.equal(row2.path, "snapshots/moved.txt");
  assert.equal(row2.encoding, "utf8", "encoding defaults to utf8");
  assert.equal(row2.registered, "2026-09-27T04:00:00.000Z");
  assert.equal(row2.authored, 0, "a caller's entry never sets authored");
  assert.equal(row2.author, null);
  assert.equal(w.count("register"), 1, "one row per capture");
});

test("R1: an authored row keeps its flag, author and observed_at through a revision that gives none", () => {
  const w = world();
  const t = w.prov.testify({ words: "The gate was locked at nine.", observedAt: "2026-09-20", author: V("ruth") });
  assert.equal(t.ok, true, JSON.stringify(t));
  const before = w.row(`SELECT * FROM register WHERE capture_sha=?`, t.capture_sha);
  assert.equal(before.authored, 1);
  const head = w.head(t.bundle_id);
  const files = w.record.livePaths(t.bundle_id).map((p) => ({ path: p, text: w.record.readFile(t.bundle_id, p).text }));
  const r = w.promotion.promote({ bundleId: t.bundle_id, base: head.bundleSha, snapKey: "rev1", author: V("ruth"),
    files, meta: { object_type: "information" },
    register: [{ sha256: t.capture_sha, path: t.file, bytes: t.bytes }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  const after = w.row(`SELECT * FROM register WHERE capture_sha=?`, t.capture_sha);
  assert.equal(after.authored, 1);
  assert.equal(after.author, V("ruth"));
  assert.equal(after.observed_at, "2026-09-20");
});

test("R2: one capture, one home; the holder named only to a caller who may see it; a gone home does not count", () => {
  const w = world();
  const a = w.cap("a");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a] }).ok, true);
  const before = w.snapshot();
  /* No caller identity: the store's own write is told the holder. */
  const r = w.promoteInfo("INFO-2026-0002-b", { captures: [a] });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
  assert.equal(r.check, "C-53.13");
  assert.equal(typeof r.translation, "string");
  assert.equal(r.holder, "INFO-2026-0001-a");
  assert.deepEqual(w.snapshot(), before, "refused before anything is written");
  /* A stamped caller whose viewer may not see the holder is told "another bundle", holder null. */
  const r2 = w.promoteInfo("INFO-2026-0003-c", { captures: [a], pkg: { actorIdentity: "nobody", actorViewer: "nobody" } });
  assert.equal(r2.reason, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
  assert.equal(r2.holder, null);
  assert.match(r2.detail, /another bundle/);
  /* A stamped caller who may see it is told. */
  const r3 = w.promoteInfo("INFO-2026-0004-d", { captures: [a], pkg: { actorIdentity: V("x"), actorViewer: V("x") } });
  assert.equal(r3.holder, "INFO-2026-0001-a");
  /* The same bundle re-registering its own bytes is not asked. */
  const head = w.head("INFO-2026-0001-a");
  const same = w.promoteInfo("INFO-2026-0001-a", { captures: [a], base: head.bundleSha });
  assert.equal(same.ok, true, JSON.stringify(same));
  /* A home whose bundle is gone does not count: the capture registers afresh. */
  w.record.purge({ bundleId: "INFO-2026-0001-a" });
  w.st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
                sha("orphaned"), "INFO-2026-0099-gone", "snapshots/x.txt", "utf8", 8, "2026-01-01T00:00:00Z");
  const o = w.cap("orphan", "orphaned");
  const r4 = w.promoteInfo("INFO-2026-0005-e", { captures: [o] });
  assert.equal(r4.ok, true, JSON.stringify(r4));
  assert.equal(w.row(`SELECT bundle_id FROM register WHERE capture_sha=?`, o.sha).bundle_id, "INFO-2026-0005-e");
});

test("R3: authored is the testimony path's alone; every refusal named, asked before R2's", () => {
  const w = world();
  const t = w.prov.testify({ words: "I counted eleven chairs.", observedAt: "2026-09-21", author: V("sam") });
  assert.equal(t.ok, true);
  const snap = () => w.snapshot();
  /* C-53.8: registering another bundle's authored capture (asked before C-53.13, which would also fire). */
  const s0 = snap();
  const steal = w.promotion.promote({ bundleId: "INFO-2026-0100-steal", base: null, snapKey: "s", author: V("mallory"),
    files: [{ path: "bundle.md", text: w.record.readFile(t.bundle_id, "bundle.md").text.replace(t.bundle_id, "INFO-2026-0100-steal") },
            { path: t.file, text: w.record.readFile(t.bundle_id, t.file).text }],
    meta: { object_type: "information" }, register: [{ sha256: t.capture_sha, path: t.file, bytes: t.bytes }] });
  assert.equal(steal.reason, "TESTIMONY_AUTHORED_UNEARNED");
  assert.equal(steal.check, "C-53.8");
  assert.deepEqual(snap(), s0);
  /* C-53.8: a document claiming authored for a capture that is not this bundle's authored observation. */
  const a = w.cap("a");
  const claim = w.promoteInfo("INFO-2026-0101-claim", { captures: [a], docs: [provDoc(a, { authored: true })] });
  assert.equal(claim.reason, "TESTIMONY_AUTHORED_UNEARNED");
  /* C-53.9: dropping `authored: true`, and an unparsable register, on the authored bundle. */
  const head = w.head(t.bundle_id);
  const live = (p) => w.record.readFile(t.bundle_id, p).text;
  const prov = JSON.parse(live("data/provenance.json"));
  const revise = (provText) => w.promotion.promote({ bundleId: t.bundle_id, base: head.bundleSha, snapKey: `r${Math.random()}`,
    author: V("sam"), meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: live("bundle.md") }, { path: t.file, text: live(t.file) },
            { path: "data/provenance.json", text: provText }] });
  const dropped = revise(JSON.stringify({ documents: [{ ...prov.documents[0], authored: false }] }));
  assert.equal(dropped.reason, "TESTIMONY_AUTHORED_DROPPED");
  assert.equal(dropped.check, "C-53.9");
  assert.equal(revise("{not json").reason, "TESTIMONY_AUTHORED_DROPPED");
  /* C-53.7: an authored document whose origin or actor class is not member. */
  const notMember = revise(JSON.stringify({ documents: [{ ...prov.documents[0], origin: { kind: "sweep" } }] }));
  assert.equal(notMember.reason, "TESTIMONY_ORIGIN_NOT_MEMBER");
  assert.equal(notMember.check, "C-53.7");
  const actor = revise(JSON.stringify({ documents: [{ ...prov.documents[0], capture: { ...prov.documents[0].capture, actor_class: "session" } }] }));
  assert.equal(actor.reason, "TESTIMONY_ORIGIN_NOT_MEMBER");
});

test("R4: homeOf answers the home from the register, null when absent or gone, never the author", () => {
  const w = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  assert.deepEqual(w.prov.homeOf(a.sha), { bundleId: "INFO-2026-0001-a", path: a.path, encoding: "utf8",
    bytes: Buffer.byteLength(a.text), registered: w.clock.now, authored: false });
  assert.equal(w.prov.homeOf(sha("never")), null);
  const t = w.prov.testify({ words: "Mine.", observedAt: "2026-09-21", author: V("ruth") });
  const h = w.prov.homeOf(t.capture_sha);
  assert.equal(h.authored, true);
  assert.equal("author" in h, false);
  assert.equal(JSON.stringify(h).includes("ruth"), false);
  w.record.purge({ bundleId: "INFO-2026-0001-a" });
  w.st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
                a.sha, "INFO-2026-0001-a", a.path, "utf8", 1, "x");
  assert.equal(w.prov.homeOf(a.sha), null, "a home whose bundle is gone is no home");
  assert.equal(w.prov.homeOf(null), null);
});

test("R5: registerHolds answers registered and acquired from the record, and parts for a named bundle", () => {
  const w = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  assert.deepEqual(w.prov.registerHolds({}), { ok: true, sha: null, asked: false, registered: null, acquired: null });
  const h = w.prov.registerHolds({ sha: `sha256:${a.sha.toUpperCase()}` });
  assert.deepEqual(h, { ok: true, sha: a.sha, asked: true, registered: true, acquired: false });
  w.prov.recordReceipt({ address: "https://e.org/a", addressNorm: "e.org/a", captureSha: sha("parted"), retrieved: "2026-09-27T00:00:00Z" });
  assert.deepEqual(w.prov.registerHolds({ sha: sha("parted") }),
    { ok: true, sha: sha("parted"), asked: true, registered: false, acquired: true });
  const withParts = w.prov.registerHolds({ sha: a.sha, bundle: "INFO-2026-0001-a" });
  assert.deepEqual(withParts.parts, { state: "none" });
  /* A row whose home is gone is not registered. */
  w.record.purge({ bundleId: "INFO-2026-0001-a" });
  w.st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
                a.sha, "INFO-2026-0001-a", a.path, "utf8", 1, "x");
  assert.equal(w.prov.registerHolds({ sha: a.sha }).registered, false);
});

test("R11: registeredFor lists the bundle's register rows in capture_sha order", () => {
  const w = world();
  const caps = ["c", "a", "b"].map((n) => w.cap(n));
  w.promoteInfo("INFO-2026-0001-x", { captures: caps });
  const got = w.prov.registeredFor("INFO-2026-0001-x");
  assert.deepEqual(got.map((r) => r.capture_sha), caps.map((c) => c.sha).sort());
  assert.deepEqual(Object.keys(got[0]).sort(), ["authored", "bytes", "capture_sha", "encoding", "path", "registered"]);
  assert.deepEqual(w.prov.registeredFor("INFO-2026-0404-none"), []);
});

test("R12: capturesOf orders by when the record first held each capture, on this instance's clock alone", () => {
  const w = world();
  const [a, b, c] = ["a", "b", "c"].map((n) => w.cap(n));
  w.clock.now = "2026-09-27T05:00:00.000Z";
  w.promoteInfo("INFO-2026-0001-x", { captures: [a, b, c] });
  /* b was received (a receipt) before it was registered; a's receipt came after its registration. The earlier of
     the two instants is when the record first held it, compared as instants: `…:00Z` is before `…:00.5Z`. */
  w.prov.recordReceipt({ addressNorm: "e.org/b", captureSha: b.sha, retrieved: "2026-09-27T04:00:00Z" });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: a.sha, retrieved: "2026-09-27T06:00:00Z" });
  w.prov.recordReceipt({ addressNorm: "e.org/c", captureSha: c.sha, retrieved: "2026-09-27T04:00:00.500Z" });
  const got = w.prov.capturesOf("INFO-2026-0001-x");
  assert.deepEqual(got, [
    { capture_sha: b.sha, held_at: "2026-09-27T04:00:00Z" },
    { capture_sha: c.sha, held_at: "2026-09-27T04:00:00.500Z" },
    { capture_sha: a.sha, held_at: "2026-09-27T05:00:00.000Z" },
  ]);
  /* A document's own stated date never orders them: the register document's `retrieved` is not read. */
  assert.deepEqual(w.prov.capturesOf("INFO-2026-0404-none"), []);
});

test("R35: whether the record holds a capture is read from the register or a receipt, never a caller's claim", () => {
  const w = world();
  const claimed = sha("claimed only");
  /* A register document naming a capture, with no register row for it: the record does not hold it. */
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a], extraDocs: [provDoc({ path: "snapshots/ghost", text: "claimed only" })] });
  assert.equal(w.prov.registerHolds({ sha: claimed }).registered, false);
  assert.equal(w.prov.homeOf(claimed), null);
  /* A register row is written only inside a promotion: no read service writes one. */
  const before = w.count("register");
  w.prov.registerHolds({ sha: claimed }); w.prov.homeOf(claimed); w.prov.registeredFor("INFO-2026-0001-a");
  w.prov.capturesOf("INFO-2026-0001-a"); w.prov.homeCensus({}); w.prov.registerRows();
  assert.equal(w.count("register"), before);
  /* A refused promotion writes no row (promotion R2). */
  const b = w.cap("b");
  const bad = w.promotion.promote({ bundleId: "INFO-2026-0002-b", base: null, snapKey: "x", author: "member:alice",
    files: [{ path: "bundle.md", text: "not a document" }], meta: { object_type: "information" },
    register: [{ sha256: b.sha, path: b.path, bytes: 1 }] });
  assert.equal(bad.ok, false);
  assert.equal(w.row(`SELECT 1 AS x FROM register WHERE capture_sha=?`, b.sha), null);
});

test("R38: an authored observation stays one: its flag is never cleared and its words never rewritten", () => {
  const w = world();
  const t = w.prov.testify({ words: "Exactly these words.", observedAt: "2026-09-21", author: V("ruth") });
  const head = w.head(t.bundle_id);
  const live = (p) => w.record.readFile(t.bundle_id, p).text;
  /* Rewriting the words is a new capture under the old document, and the authored document still names the old one:
     the revision that registers new bytes in its place and drops the claim is refused. */
  const prov = JSON.parse(live("data/provenance.json"));
  const rewritten = w.promotion.promote({ bundleId: t.bundle_id, base: head.bundleSha, snapKey: "rw", author: V("ruth"),
    meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: live("bundle.md") }, { path: t.file, text: "Other words." },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [{ ...prov.documents[0], authored: false }] }) }] });
  assert.equal(rewritten.ok, false);
  assert.equal(w.row(`SELECT authored FROM register WHERE capture_sha=?`, t.capture_sha).authored, 1);
  assert.equal(live(t.file).endsWith("Exactly these words."), true);
  const doc = JSON.parse(live("data/provenance.json")).documents[0];
  assert.equal(doc.authored, true);
  assert.equal(doc.origin.kind, "member");
  assert.equal(doc.capture.actor_class, "member");
});

test("R41: the module owns its tables, declared to purge once; another declaration of one is refused", () => {
  const w = world();
  for (const t of ["register", "captured_locators", "provenance_route_marks"])
    assert.equal(PROVENANCE_TABLES.includes(t), true);
  const again = w.record.declarePurge("someone-else", ["register"]);
  assert.equal(again.ok, false);
  assert.equal(again.reason, "TABLE_DECLARED");
  assert.equal(again.declaredBy, "provenance");
  /* A whole-store purge clears them; a bundle purge clears the bundle's register rows and marks only. */
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: a.sha, retrieved: "2026-09-27T00:00:00Z" });
  const one = w.record.purge({ bundleId: "INFO-2026-0001-a" });
  assert.equal(w.count("register"), 0);
  assert.equal(w.count("captured_locators"), 1, "receipts are keyed to no bundle");
  assert.equal(one.ok !== false, true);
  w.record.purge({});
  assert.equal(w.count("captured_locators"), 0);
});

test("R48: register and captured_locators keep their read-contract columns, joinable in a later module's SQL", () => {
  const w = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  w.prov.recordReceipt({ address: "https://e.org/a", addressNorm: "e.org/a", captureSha: a.sha,
                         retrieved: "2026-09-27T00:00:00Z", retrievalLocator: "https://e.org/a?x" });
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((r) => r.name);
  for (const c of ["capture_sha", "bundle_id", "path"]) assert.equal(cols("register").includes(c), true, c);
  for (const c of ["address_norm", "address", "retrieval_locator", "capture_sha"]) assert.equal(cols("captured_locators").includes(c), true, c);
  const joined = w.row(`SELECT r.bundle_id, r.path, cl.address, cl.retrieval_locator FROM captured_locators cl
                          JOIN register r ON r.capture_sha = cl.capture_sha WHERE cl.address_norm = ?`, "e.org/a");
  assert.deepEqual({ ...joined }, { bundle_id: "INFO-2026-0001-a", path: a.path, address: "https://e.org/a",
                                    retrieval_locator: "https://e.org/a?x" });
});
