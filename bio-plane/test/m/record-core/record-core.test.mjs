/* record-core: requirement-named tests at the module's interface (build/requirements/record-core.md).
   Each test names the requirement ids it checks in its title. The module runs over `storage.mjs`, a
   Durable Object storage stand-in on node:sqlite; a fresh storage per test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { checkBundle } from "../../../checks/bio-checks.mjs";
import { recordOf, RecordCore } from "../../../src/record-core/index.mjs";
import { storage, bucket } from "./storage.mjs";

const fresh = (opts) => { const s = storage(); const rc = recordOf({ storage: s }, opts); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => s.sql.exec(q, ...a);
const sha = (t) => createHash("sha256").update(t).digest("hex");
const file = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
const put = (rc, id, snapKey, text = `x ${id} ${snapKey}`, more = {}) =>
  rc.commit({ bundleId: id, type: "information", title: `t ${id}`, snapKey, author: "a", base: null,
              files: [file("bundle.md", text)], ...more });

/* Drives crypto.getRandomValues through `values` (Uint16 draws), restoring it afterwards. */
function draws(values, fn) {
  const orig = crypto.getRandomValues;
  let i = 0;
  crypto.getRandomValues = (u) => { if (i >= values.length) throw new Error("draws exhausted"); u[0] = values[i++]; return u; };
  try { return fn(() => i); } finally { crypto.getRandomValues = orig; }
}

/* Every row of every table in the store, for "nothing changed" comparisons. */
const dump = (s, except = []) => Object.fromEntries(
  rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .map((r) => r.name).filter((t) => !except.includes(t))
    .map((t) => [t, JSON.stringify(rows(s, `SELECT * FROM ${t} ORDER BY rowid`))]));

test("R1: allocId returns <prefix>-<year>-NNNN, the scope's next number, never twice, purge or no purge", () => {
  const { rc } = fresh();
  assert.deepEqual(rc.allocId("INFO", "2026"), { id: "INFO-2026-0001" });
  assert.deepEqual(rc.allocId("INFO", "2026"), { id: "INFO-2026-0002" });
  assert.deepEqual(rc.allocId("INFO", "2027"), { id: "INFO-2027-0001" }, "each scope counts on its own");
  assert.deepEqual(rc.allocId("ENT", "2026"), { id: "ENT-2026-0001" });
  put(rc, "INFO-2026-0001", "K1");
  rc.purge({ bundleId: "INFO-2026-0001" });
  assert.deepEqual(rc.allocId("INFO", "2026"), { id: "INFO-2026-0003" }, "a single-bundle purge keeps the counter");
  rc.purge({});
  assert.deepEqual(rc.allocId("INFO", "2026"), { id: "INFO-2026-0004" }, "a whole-store purge keeps the counter");
  const seen = new Set();
  for (let i = 0; i < 200; i++) seen.add(rc.allocId("REL", "2026").id);
  assert.equal(seen.size, 200);
  assert.ok([...seen].every((x) => /^REL-2026-\d{4}$/.test(x)));
});

test("R2 R32: allocId takes the identical step inside a caller's transaction, and a rolled-back one spends nothing", () => {
  const { rc } = fresh();
  assert.equal(rc.allocId("INQ", "2026").id, "INQ-2026-0001");
  assert.equal(rc.transact(() => rc.allocId("INQ", "2026")).id, "INQ-2026-0002");
  assert.equal(rc.allocId("INQ", "2026").id, "INQ-2026-0003");
  assert.throws(() => rc.transact(() => { rc.allocId("INQ", "2026"); throw new Error("boom"); }), /boom/);
  const refused = rc.transact(() => { rc.allocId("INQ", "2026"); return { ok: false, reason: "NO" }; });
  assert.deepEqual(refused, { ok: false, reason: "NO" });
  assert.equal(rc.allocId("INQ", "2026").id, "INQ-2026-0004", "neither the throw nor the refusal spent a number");
});

test("R3 R5 R27: allocIdOp refuses every gated prefix with ALLOCID_PREFIX_GATED (C-59.5), echoing only what was sent, allocating nothing", () => {
  const { s, rc } = fresh();
  for (const p of ["PROJ", "CASE", "DRAFT", "RVG", "TASK"]) for (const y of ["2026", "1999", "x"]) {
    const before = dump(s);
    const r = rc.allocIdOp(p, y);
    assert.equal(r.ok, false); assert.equal(r.reason, "ALLOCID_PREFIX_GATED"); assert.equal(r.code, "ALLOCID_PREFIX_GATED");
    assert.equal(r.check, "C-59.5"); assert.equal(typeof r.translation, "string");
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
    assert.ok(!/\d{4}/.test(r.detail.replace(y, "")), "the refusal names no count or id");
    assert.deepEqual(dump(s), before, "nothing was allocated or written");
  }
  assert.deepEqual(RecordCore.GATED_ID_PREFIXES, ["PROJ", "CASE", "DRAFT", "RVG", "TASK"]);
  assert.equal(rc.allocIdOp("INFO", "2026").id, "INFO-2026-0001", "an ungated prefix allocates");
});

test("R4: gating is decided on the scope string, never the prefix alone", () => {
  const { rc } = fresh();
  assert.equal(rc.allocIdOp("PROJ-X", "2026").reason, "ALLOCID_PREFIX_GATED", "a dash moved into the prefix is still the gated scope");
  assert.equal(rc.allocIdOp("CASE", "").reason, "ALLOCID_PREFIX_GATED");
  assert.deepEqual(rc.allocIdOp("PROJECTX", "2026"), { id: "PROJECTX-2026-0001" }, "a longer prefix keys a different scope");
  assert.deepEqual(rc.allocIdOp("TASKS", "2026"), { id: "TASKS-2026-0001" });
  assert.deepEqual(rc.allocIdOp("XPROJ", "2026"), { id: "XPROJ-2026-0001" });
});

test("R6: mintOpaqueId draws four uniform CSPRNG digits by rejection sampling, asked of taken() and of every id it has handed out", () => {
  const { rc } = fresh();
  const re = /^CASE-2026-\d{4}$/;
  for (let i = 0; i < 50; i++) assert.match(rc.mintOpaqueId("CASE", "2026", "", () => false), re);
  assert.match(rc.mintOpaqueId("TASK", "2026", "-a-slug", () => false), /^TASK-2026-\d{4}-a-slug$/);
  // rejection sampling: draws of 60000 and above are discarded, the rest map v % 10000
  assert.equal(draws([60000, 65535, 12345], () => rc.mintOpaqueId("DRAFT", "2026", "-t1", () => false)), "DRAFT-2026-2345-t1");
  // uniformity: every accepted draw 0..59999 maps onto 0000..9999, each exactly six times
  const tally = new Map();
  const vals = Array.from({ length: 60000 }, (_, v) => v);
  draws(vals, () => { for (let v = 0; v < 60000; v++) {
    const id = rc.mintOpaqueId("RVG", "2026", `-u${v}`, () => false);
    const d = id.slice(9, 13); tally.set(d, (tally.get(d) || 0) + 1);
  } });
  assert.equal(tally.size, 10000); assert.ok([...tally.values()].every((n) => n === 6));
  // a collision with the caller's taken() draws again
  const asked = [];
  assert.equal(draws([1, 2], () => rc.mintOpaqueId("PROJ", "2026", "-p", (id) => { asked.push(id); return id === "PROJ-2026-0001-p"; })),
               "PROJ-2026-0002-p");
  assert.deepEqual(asked, ["PROJ-2026-0001-p", "PROJ-2026-0002-p"]);
  // a collision with an id this service handed out draws again, without asking taken()
  assert.equal(draws([7, 8], () => rc.mintOpaqueId("CASE", "2025", "", () => false)), "CASE-2025-0007");
  const asked2 = [];
  assert.equal(draws([7, 9], () => rc.mintOpaqueId("CASE", "2025", "", (id) => { asked2.push(id); return false; })), "CASE-2025-0009");
  assert.deepEqual(asked2, ["CASE-2025-0009"]);
});

test("R7 R32: a minted id is recorded in the caller's transaction, so a rolled-back caller takes it back", () => {
  const { rc } = fresh();
  assert.throws(() => rc.transact(() => { draws([42], () => rc.mintOpaqueId("CASE", "2026", "", () => false)); throw new Error("rolled"); }));
  assert.equal(draws([42], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0042", "the rolled-back draw is free again");
  assert.equal(draws([42, 43], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0043", "a committed draw is spent");
  const refused = rc.transact(() => { draws([50], () => rc.mintOpaqueId("CASE", "2026", "", () => false)); return { ok: false }; });
  assert.equal(refused.ok, false);
  assert.equal(draws([50], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0050");
  // recorded before it is returned: the taken() of the same act sees the ledger already holding it
  rc.transact(() => {
    const id = draws([60], () => rc.mintOpaqueId("DRAFT", "2026", "", () => false));
    assert.equal(draws([60, 61], () => rc.mintOpaqueId("DRAFT", "2026", "", () => false)), "DRAFT-2026-0061");
    return { ok: true, id };
  });
});

test("R8 R23 R28: an id minted is never drawn again, for any caller, after either form of purge", () => {
  const { rc } = fresh();
  const id = draws([11], () => rc.mintOpaqueId("PROJ", "2026", "-x", () => false));
  put(rc, id, "K1");
  rc.purge({ bundleId: id });
  assert.equal(draws([11, 12], () => rc.mintOpaqueId("PROJ", "2026", "-x", () => false)), "PROJ-2026-0012-x");
  rc.purge({});
  assert.equal(draws([11, 12, 13], () => rc.mintOpaqueId("PROJ", "2026", "-x", () => false)), "PROJ-2026-0013-x");
  assert.equal(draws([11, 12, 13, 14], () => rc.mintOpaqueId("PROJ", "2026", "-x", () => false)), "PROJ-2026-0014-x",
               "another caller (another taken) is refused them too");
});

test("R9: mintOpaqueId returns null only when 64 draws in a row collide", () => {
  const { rc } = fresh();
  let n = 0;
  assert.equal(rc.mintOpaqueId("TASK", "2026", "-t", () => { n++; return true; }), null);
  assert.equal(n, 64);
  let m = 0;
  assert.match(rc.mintOpaqueId("TASK", "2026", "-t", () => ++m < 64), /^TASK-2026-\d{4}-t$/, "the 64th draw may still succeed");
  assert.equal(m, 64);
});

test("R28: seedMintLedger learns the live ids its caller names and every id the counter issued to an untailed gated prefix", () => {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE cases (case_id TEXT)`);
  s.db.exec(`INSERT INTO cases VALUES ('CASE-2026-0500'), ('INFO-2026-0500')`);
  s.sql.exec(`INSERT INTO seq (scope,next) VALUES ('DRAFT-2025', 4), ('INFO-2025', 9)`);
  rc.seedMintLedger([["CASE", "cases", "case_id"], ["X", "no table; dropped", "c"]]);
  rc.seedMintLedger([["CASE", "cases", "case_id"]]); // idempotent
  assert.equal(draws([500, 501], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0501");
  assert.equal(draws([1, 2, 3, 4], () => rc.mintOpaqueId("DRAFT", "2025", "", () => false)), "DRAFT-2025-0004",
               "0001–0003, which the counter issued, are never drawn");
  assert.equal(draws([5], () => rc.mintOpaqueId("DRAFT", "2025", "", () => false)), "DRAFT-2025-0005");
});

test("R10 R30: a lease is never taken under an empty or non-string actor", () => {
  const { s, rc } = fresh();
  put(rc, "INFO-2026-0001-a", "K1");
  for (const who of ["", "   ", null, undefined, 7, {}, ["m"]]) {
    const r = rc.acquireLease("INFO-2026-0001-a", who, 60000);
    assert.equal(r.ok, false); assert.equal(r.reason, "ANONYMOUS_LEASE");
  }
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM leases`)[0].n, 0, "no lease row exists under no name");
  assert.equal(rc.acquireLease("INFO-2026-0001-a", "m1", 60000).ok, true);
  assert.ok(rows(s, `SELECT actor FROM leases`).every((r) => typeof r.actor === "string" && r.actor.trim()));
});

test("R11: a live lease held by another actor refuses, naming who holds it and until when", () => {
  const { rc } = fresh();
  put(rc, "INFO-2026-0001-a", "K1");
  const a = rc.acquireLease("INFO-2026-0001-a", "alice", 60000);
  const b = rc.acquireLease("INFO-2026-0001-a", "bob", 60000);
  assert.deepEqual(b, { ok: false, heldBy: "alice", until: a.expires });
  const c = rc.acquireLease("INFO-2026-0002-b", "bob", 60000);
  assert.equal(c.ok, true, "a lease on another bundle is independent");
});

test("R12: otherwise the lease is taken until ttl from now, replacing any prior holder, with the stored digest as the edit base", () => {
  const { rc } = fresh();
  const { bundleSha } = put(rc, "INFO-2026-0001-a", "K1");
  const t0 = Date.now();
  const a = rc.acquireLease("INFO-2026-0001-a", "alice", 60000);
  assert.equal(a.ok, true); assert.equal(a.actor, "alice"); assert.equal(a.base, bundleSha);
  const exp = Date.parse(a.expires);
  assert.ok(exp >= t0 + 60000 && exp <= Date.now() + 60000);
  const again = rc.acquireLease("INFO-2026-0001-a", "alice", 120000);
  assert.equal(again.ok, true, "the holder may renew");
  assert.ok(Date.parse(again.expires) > exp);
  const expired = rc.acquireLease("INFO-2026-0003-c", "alice", -1);
  assert.equal(expired.ok, true); assert.equal(expired.base, null, "an unheld bundle has no base");
  const takeover = rc.acquireLease("INFO-2026-0003-c", "bob", 1000);
  assert.equal(takeover.ok, true); assert.equal(takeover.actor, "bob", "an expired lease is replaced");
  const second = put(rc, "INFO-2026-0001-a", "K2", "changed");
  rc.acquireLease("INFO-2026-0001-a", "alice", -1);
  assert.equal(rc.acquireLease("INFO-2026-0001-a", "carol", 1000).base, second.bundleSha, "the base is the current digest");
});

test("R13 R14: readFile gives inline text or a blob reference (never bytes), and null when not held", () => {
  const { rc } = fresh();
  rc.commit({ bundleId: "INFO-2026-0001-a", type: "information", snapKey: "K1",
              files: [file("bundle.md", "hello"), { path: "captures/x.pdf", blobSha: "b".repeat(64), bytes: 2048, sha256: "b".repeat(64) }] });
  assert.deepEqual(rc.readFile("INFO-2026-0001-a", "bundle.md"), { text: "hello", sha256: sha("hello") });
  assert.deepEqual(rc.readFile("INFO-2026-0001-a", "captures/x.pdf"), { blobSha: "b".repeat(64), bytes: 2048, sha256: "b".repeat(64) });
  assert.equal(rc.readFile("INFO-2026-0001-a", "nope.md"), null);
  assert.equal(rc.readFile("INFO-2099-0001-z", "bundle.md"), null);
});

test("R15 R16 R17: readImage assembles live files, snapshots at the fixed path, promotion records and the manifest in write order; null when not held", () => {
  const { rc } = fresh();
  const id = "INFO-2026-0001-a";
  rc.commit({ bundleId: id, type: "information", snapKey: "20260901T000000Z_zzzz", kind: "promotion", base: null, author: "a1",
              files: [file("bundle.md", "v1"), file("data/changes.json", "[1]")] });
  rc.commit({ bundleId: id, type: "information", snapKey: "20200101T000000Z_aaaa", kind: "promotion", base: sha("v1"), author: "a2",
              writer: "monitor", operation: "recheck",
              files: [file("bundle.md", "v2"), { path: "c.pdf", blobSha: "c".repeat(64), bytes: 5, sha256: "c".repeat(64) }] });
  rc.commit({ bundleId: id, type: "information", snapKey: "20250101T000000Z_mmmm", kind: "promotion-replay", base: sha("v2"), author: "a3",
              files: [file("bundle.md", "v3"), { path: "c.pdf", blobSha: "c".repeat(64), bytes: 5, sha256: "c".repeat(64) }] });
  const img = rc.readImage(id);
  assert.equal(img["bundle.md"], "v3");
  assert.deepEqual(img["c.pdf"], { blobSha: "c".repeat(64), sha256: "c".repeat(64), bytes: 5 });
  assert.equal(RecordCore.snapPath("bundle.md", "K"), "_history/bundle_K.md");
  assert.equal(RecordCore.snapPath("data/changes.json", "K"), "_history/data/changes_K.json");
  assert.equal(RecordCore.snapPath("data/README", "K"), "_history/data/README_K");
  // the second commit archived v1's files under ITS key, the third archived v2's under its own
  assert.equal(img["_history/bundle_20200101T000000Z_aaaa.md"], "v1");
  assert.equal(img["_history/data/changes_20200101T000000Z_aaaa.json"], "[1]");
  assert.equal(img["_history/bundle_20250101T000000Z_mmmm.md"], "v2");
  assert.deepEqual(img["_history/c_20250101T000000Z_mmmm.pdf"], { blobSha: "c".repeat(64), sha256: "c".repeat(64) });
  const m = JSON.parse(img["_history/manifest.json"]);
  assert.deepEqual(m.entries.map((e) => e.key), ["20260901T000000Z_zzzz", "20200101T000000Z_aaaa", "20250101T000000Z_mmmm"],
                   "R16: write order, not the snap keys' lexical order");
  const [e1, e2, e3] = m.entries;
  assert.deepEqual([e1.kind, e1.base, e1.author, e1.files], ["promotion", null, "a1", ["bundle.md", "data/changes.json"]]);
  assert.deepEqual([e2.base, e2.author, e2.writer, e2.operation, e2.files, e2.snapshotted],
                   [sha("v1"), "a2", "monitor", "recheck", ["bundle.md", "c.pdf"], ["bundle.md", "data/changes.json"]]);
  assert.equal(e3.kind, "promotion-replay");
  for (const e of m.entries) assert.ok(!Number.isNaN(Date.parse(e.created)));
  const rec = JSON.parse(img["_history/promotion_20200101T000000Z_aaaa.json"]);
  assert.deepEqual(rec, { target: id, base: sha("v1"), files: [{ name: "bundle.md", sha256: sha("v2") }, { name: "c.pdf", sha256: "c".repeat(64) }],
                          created: e2.created, author: "a2", skill_version: "bio-plane", writer: "monitor", operation: "recheck" });
  assert.equal(Object.keys(img).length, 2 + 2 + 2 + 3 + 1);
  assert.equal(rc.readImage("INFO-2099-0009-z"), null);
});

test("R33 R29: commit archives what it replaces, writes live files and the row, and appends exactly one manifest entry, never altering one", () => {
  const { s, rc } = fresh();
  const id = "PROJ-2026-1234-p";
  const r1 = rc.commit({ bundleId: id, type: "project", title: "P", project: id, snapKey: "K1", base: null, author: "a",
                         files: [file("bundle.md", "one"), file("notes.md", "n")], columns: { current_state: "open", group_id: "g" } });
  assert.deepEqual(r1, { bundleSha: sha("one"), rowVersion: 1 });
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM history`)[0].n, 0, "a first commit replaces nothing");
  const hist0 = () => JSON.stringify(rows(s, `SELECT * FROM history ORDER BY rowid`));
  const man0 = () => JSON.stringify(rows(s, `SELECT * FROM manifest ORDER BY rowid`));
  const m1 = man0();
  const r2 = rc.commit({ bundleId: id, type: "project", title: "P2", project: id, snapKey: "K2", base: sha("one"), author: "b",
                         writer: "w", operation: "op", files: [file("bundle.md", "two")] });
  assert.deepEqual(r2, { bundleSha: sha("two"), rowVersion: 2 });
  assert.ok(man0().startsWith(m1.slice(0, -1)), "the first manifest entry is untouched");
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM manifest WHERE bundle_id=?`, id)[0].n, 2);
  assert.deepEqual(rows(s, `SELECT path, content FROM history WHERE snap_key='K2' ORDER BY path`).map((r) => [r.path, r.content]),
                   [["bundle.md", "one"], ["notes.md", "n"]]);
  assert.deepEqual(rows(s, `SELECT path FROM files WHERE bundle_id=?`, id).map((r) => r.path), ["bundle.md"]);
  const row = rows(s, `SELECT * FROM bundles WHERE bundle_id=?`, id)[0];
  assert.deepEqual([row.object_type, row.title, row.project, row.current_state, row.group_id, row.row_version],
                   ["project", "P2", id, "open", "g", 2], "a later commit keeps the columns it does not set");
  const man = rows(s, `SELECT * FROM manifest WHERE snap_key='K2'`)[0];
  assert.deepEqual([man.kind, man.base, man.author, man.writer, man.operation, JSON.parse(man.files_json)],
                   ["promotion", sha("one"), "b", "w", "op", [{ name: "bundle.md", sha256: sha("two") }]]);
  // a snap key already used cannot rewrite history: the commit fails whole
  const h = hist0(), m = man0(), f = JSON.stringify(rows(s, `SELECT * FROM files`));
  assert.throws(() => rc.commit({ bundleId: id, type: "project", snapKey: "K2", files: [file("bundle.md", "three")] }));
  assert.equal(hist0(), h); assert.equal(man0(), m); assert.equal(JSON.stringify(rows(s, `SELECT * FROM files`)), f);
  // no service removes or modifies a history or manifest row except purge
  rc.readImage(id); rc.acquireLease(id, "x", 10); rc.allocId("INFO", "2026"); rc.listBundles({}); rc.bundleInfo(id);
  assert.equal(hist0(), h); assert.equal(man0(), m);
});

test("R32: transact rolls back every row in any module's tables on a throw or a refusal, and nested calls join the outer", () => {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE other_module (k TEXT)`);
  const snap = () => dump(s);
  const before = snap();
  assert.throws(() => rc.transact(() => { s.sql.exec(`INSERT INTO other_module VALUES ('a')`); put(rc, "INFO-2026-0001-a", "K1"); throw new TypeError("x"); }), TypeError);
  assert.deepEqual(snap(), before);
  const r = rc.transact(() => { s.sql.exec(`INSERT INTO other_module VALUES ('a')`); put(rc, "INFO-2026-0001-a", "K1"); return { ok: false, reason: "R" }; });
  assert.deepEqual(r, { ok: false, reason: "R" }); assert.deepEqual(snap(), before);
  // nested: the inner call joins, so the outer's throw takes the inner's rows too
  assert.throws(() => rc.transact(() => { rc.transact(() => { s.sql.exec(`INSERT INTO other_module VALUES ('in')`); return { ok: true }; }); throw new Error("outer"); }));
  assert.deepEqual(snap(), before);
  // and an inner refusal inside an outer success is the outer's to decide: the outer committed
  const v = rc.transact(() => { rc.transact(() => { s.sql.exec(`INSERT INTO other_module VALUES ('in2')`); return { ok: false }; }); return { ok: true, v: 1 }; });
  assert.deepEqual(v, { ok: true, v: 1 });
  assert.deepEqual(rows(s, `SELECT k FROM other_module`).map((x) => x.k), ["in2"]);
  assert.equal(rc.transact(() => 5), 5, "fn's result is returned");
});

test("R34 R35 R36: bundleInfo, listBundles and listByType answer from the bundles table in id order", () => {
  const { rc } = fresh();
  assert.equal(rc.bundleInfo("INFO-2026-0001-a"), null);
  const mk = (id, type, project) => rc.commit({ bundleId: id, type, title: `T ${id}`, project, snapKey: "K", files: [file("bundle.md", id)] });
  mk("PROJ-2026-0001-p", "project", "PROJ-2026-0001-p");
  mk("INFO-2026-0003-c", "information", "PROJ-2026-0001-p");
  mk("INFO-2026-0001-a", "information", null);
  mk("INQ-2026-0001-q", "inquiry", "PROJ-2026-0001-p");
  mk("PROJ-2026-0002-r", "project", null);
  assert.deepEqual(rc.bundleInfo("INFO-2026-0003-c"), { id: "INFO-2026-0003-c", type: "information", title: "T INFO-2026-0003-c", project: "PROJ-2026-0001-p" });
  assert.deepEqual(rc.bundleInfo("INFO-2026-0001-a").project, null);
  assert.deepEqual(rc.listBundles({}), { ids: ["INFO-2026-0001-a", "INFO-2026-0003-c", "INQ-2026-0001-q", "PROJ-2026-0001-p", "PROJ-2026-0002-r"], cursor: "PROJ-2026-0002-r" });
  assert.deepEqual(rc.listBundles({ project: "PROJ-2026-0001-p" }), { ids: ["INFO-2026-0003-c", "INQ-2026-0001-q", "PROJ-2026-0001-p"], cursor: "PROJ-2026-0001-p" });
  const p1 = rc.listBundles({ limit: 2 });
  assert.deepEqual(p1, { ids: ["INFO-2026-0001-a", "INFO-2026-0003-c"], cursor: "INFO-2026-0003-c" });
  assert.deepEqual(rc.listBundles({ after: p1.cursor, limit: 2 }).ids, ["INQ-2026-0001-q", "PROJ-2026-0001-p"]);
  assert.deepEqual(rc.listBundles({ after: "PROJ-2026-0002-r" }), { ids: [], cursor: null });
  assert.deepEqual(rc.listByType({ type: "project" }), { ids: ["PROJ-2026-0001-p", "PROJ-2026-0002-r"], cursor: "PROJ-2026-0002-r" });
  assert.deepEqual(rc.listByType({ type: "project", limit: 1 }), { ids: ["PROJ-2026-0001-p"], cursor: "PROJ-2026-0001-p" });
  assert.deepEqual(rc.listByType({ type: "project", after: "PROJ-2026-0001-p" }).ids, ["PROJ-2026-0002-r"]);
  assert.deepEqual(rc.listByType({ type: "none" }), { ids: [], cursor: null });
  assert.deepEqual(rc.listByType({}), { ids: [], cursor: null });
});

test("R37: bundles.bundle_id and bundles.object_type are a read contract a later module may join in its own SQL", () => {
  const { s, rc } = fresh();
  const cols = Object.fromEntries(rows(s, `PRAGMA table_info(bundles)`).map((r) => [r.name, r]));
  assert.equal(cols.bundle_id.type, "TEXT"); assert.equal(cols.bundle_id.pk, 1);
  assert.equal(cols.object_type.type, "TEXT"); assert.equal(cols.object_type.notnull, 1);
  rc.commit({ bundleId: "PROJ-2026-0001-p", type: "project", snapKey: "K", files: [file("bundle.md", "p")] });
  s.db.exec(`CREATE TABLE project_sight (project_id TEXT, setting TEXT)`);
  s.sql.exec(`INSERT INTO project_sight VALUES ('PROJ-2026-0001-p', 'hidden')`);
  assert.deepEqual(rows(s, `SELECT b.bundle_id, b.object_type, ps.setting FROM bundles b JOIN project_sight ps ON ps.project_id=b.bundle_id`)
    .map((r) => [r.bundle_id, r.object_type, r.setting]), [["PROJ-2026-0001-p", "project", "hidden"]]);
  assert.equal(rc.listByType({ type: "project" }).ids[0], "PROJ-2026-0001-p", "object_type means the type commit was given");
});

test("R38: evidenceStore answers head/get/put by digest at a key fixed by this module, or null with no bucket bound", async () => {
  assert.equal(fresh().rc.evidenceStore(), null);
  const b = bucket();
  const { rc } = fresh({ evidence: b, storeName: () => "scratch" });
  const ev = rc.evidenceStore();
  const d = sha("bytes");
  await ev.put(d, new Uint8Array([1, 2]));
  assert.deepEqual(b.calls[0], ["put", `scratch/captures/${d}`, { sha256: d }], "put hands the bucket the digest to verify");
  assert.ok(await ev.head(d)); assert.ok(await ev.get(d));
  assert.equal(await ev.head(sha("other")), null);
  assert.deepEqual(b.calls.slice(1).map((c) => c[1]), [`scratch/captures/${d}`, `scratch/captures/${d}`, `scratch/captures/${sha("other")}`]);
  const b2 = bucket();
  const { rc: rc2 } = fresh({ evidence: b2, storeName: "bio" });
  await rc2.evidenceStore().head(d);
  assert.equal(b2.calls[0][1], `bio/captures/${d}`);
});

test("R25 R23: settings hold named values with who set them and when, the last set is read, and purge never clears them", () => {
  const { s, rc } = fresh();
  assert.equal(rc.getSetting("instance_name"), null);
  assert.deepEqual(rc.setSetting("instance_name", "the group", "admin"), { ok: true });
  assert.deepEqual(rc.setSetting("instance_name", "renamed", "m2"), { ok: true });
  assert.equal(rc.getSetting("instance_name"), "renamed");
  rc.setSetting("limits", { a: 1, b: [2] }, "admin");
  assert.deepEqual(rc.getSetting("limits"), { a: 1, b: [2] });
  const rec = rows(s, `SELECT name, set_by, set_at FROM settings WHERE name='instance_name' ORDER BY rowid`);
  assert.deepEqual(rec.map((r) => r.set_by), ["admin", "m2"]);
  assert.ok(rec.every((r) => !Number.isNaN(Date.parse(r.set_at))));
  assert.equal(rc.setSetting("x", 1, "").ok, false, "who set it is always recorded");
  assert.equal(rc.setSetting("", 1, "a").ok, false);
  assert.equal(rc.getSetting("x"), null);
  rc.purge({}); rc.purge({ bundleId: "INFO-2026-0001-a" });
  assert.equal(rc.getSetting("instance_name"), "renamed");
});

test("R26: the active jurisdiction profiles are the setting jurisdiction_profiles, an ordered list of profile ids", () => {
  const { rc } = fresh();
  assert.equal(rc.getSetting("jurisdiction_profiles"), null);
  assert.deepEqual(rc.setSetting("jurisdiction_profiles", ["us-ca-oakland", "us-ca-alameda", "test-elsewhere"], "installer"), { ok: true });
  assert.deepEqual(rc.getSetting("jurisdiction_profiles"), ["us-ca-oakland", "us-ca-alameda", "test-elsewhere"], "order is kept");
  for (const bad of ["us-ca-oakland", [""], ["a", "a"], [1], null, {}])
    assert.equal(rc.setSetting("jurisdiction_profiles", bad, "installer").reason, "SETTING_INVALID");
  assert.deepEqual(rc.getSetting("jurisdiction_profiles"), ["us-ca-oakland", "us-ca-alameda", "test-elsewhere"], "a refused value records nothing");
  rc.setSetting("jurisdiction_profiles", [], "installer");
  assert.deepEqual(rc.getSetting("jurisdiction_profiles"), []);
});

test("R21: tables are declared once; a table declared twice or by two modules is refused with TABLE_DECLARED", () => {
  const { rc } = fresh();
  for (const t of ["files", "history", "manifest", "leases", "bundles", "seq", "minted_ids", "settings"]) {
    const r = rc.declarePurge("membership", [t]);
    assert.equal(r.reason, "TABLE_DECLARED"); assert.equal(r.declaredBy, "record-core", `${t} is record-core's own`);
  }
  assert.deepEqual(rc.declarePurge("membership", ["members"]), { ok: true });
  assert.equal(rc.declarePurge("membership", ["members"]).reason, "TABLE_DECLARED");
  assert.equal(rc.declarePurge("promotion", [{ name: "members", bundle: null }]).reason, "TABLE_DECLARED");
  assert.equal(rc.declarePurge("x", [], { exempt: ["members"] }).reason, "TABLE_DECLARED");
  const r = rc.declarePurge("x", ["a_ok", "members"]);
  assert.equal(r.reason, "TABLE_DECLARED");
  assert.deepEqual(rc.declarePurge("x", ["a_ok"]), { ok: true }, "a refused declaration declared nothing");
  assert.equal(rc.declarePurge("x", ["bad name"]).reason, "TABLE_NAME_INVALID");
});

function purgeFixture() {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE derived (bundle_id TEXT, v TEXT);
             CREATE TABLE pairs (a_bundle_id TEXT, b_bundle_id TEXT);
             CREATE TABLE registry (k TEXT);
             CREATE TABLE partial (bundle_id TEXT, ratified INTEGER);
             CREATE TABLE identity (k TEXT);
             CREATE TABLE undeclared (bundle_id TEXT)`);
  assert.deepEqual(rc.declarePurge("m1", ["derived", { name: "pairs", bundle: "a_bundle_id=? OR b_bundle_id=?" },
                                          { name: "registry", bundle: null }, { name: "partial", whole: "ratified IS NULL" }],
                                   { exempt: ["identity"] }), { ok: true });
  for (const id of ["INFO-2026-0001-a", "INFO-2026-0002-b"]) {
    put(rc, id, "K1"); put(rc, id, "K2", `second ${id}`);
    rc.acquireLease(id, "m", 1000);
    s.sql.exec(`INSERT INTO derived VALUES (?, 'x')`, id);
    s.sql.exec(`INSERT INTO partial VALUES (?, NULL), (?, 1)`, id, id);
    s.sql.exec(`INSERT INTO undeclared VALUES (?)`, id);
  }
  s.sql.exec(`INSERT INTO pairs VALUES ('INFO-2026-0001-a','INFO-2026-0002-b'), ('INFO-2026-0002-b','X'), ('Y','Z')`);
  s.sql.exec(`INSERT INTO registry VALUES ('r1'), ('r2')`);
  s.sql.exec(`INSERT INTO identity VALUES ('me')`);
  rc.allocId("INFO", "2026"); rc.mintOpaqueId("CASE", "2026", "", () => false); rc.setSetting("n", 1, "a");
  return { s, rc };
}
const count = (s, t, w = "1=1", ...a) => rows(s, `SELECT COUNT(*) AS n FROM ${t} WHERE ${w}`, ...a)[0].n;

test("R22 R24: purge of one bundle clears only the rows keyed to it, and reports each declared table's count", () => {
  const { s, rc } = purgeFixture();
  const r = rc.purge({ bundleId: "INFO-2026-0001-a" });
  assert.equal(r.ok, true); assert.equal(r.scope, "INFO-2026-0001-a");
  assert.deepEqual(r.removed, { derived: 1, pairs: 1, registry: 0, partial: 2, files: 1, history: 1, manifest: 2, leases: 1, bundles: 1 });
  for (const t of ["files", "history", "manifest", "leases", "bundles", "derived", "partial"])
    assert.equal(count(s, t, "bundle_id=?", "INFO-2026-0001-a"), 0, t);
  assert.equal(count(s, "bundles"), 1); assert.equal(count(s, "manifest"), 2); assert.equal(count(s, "derived"), 1);
  assert.equal(count(s, "pairs"), 2); assert.equal(count(s, "registry"), 2, "a table with no bundle key is not cleared by the bundle form");
  assert.equal(count(s, "undeclared"), 2, "an undeclared table is never touched");
  const none = rc.purge({ bundleId: "INFO-2099-0000-none" });
  assert.deepEqual(Object.values(none.removed).every((n) => n === 0), true);
  assert.deepEqual(Object.keys(none.removed).sort(), ["bundles", "derived", "files", "history", "leases", "manifest", "pairs", "partial", "registry"].sort(),
                   "every declared, non-exempt table is named even when it removed nothing");
});

test("R22 R23 R24: the whole-store purge clears every declared, non-exempt table and never seq, minted_ids, settings or an exempt table", () => {
  const { s, rc } = purgeFixture();
  const keep = dump(s, ["files", "history", "manifest", "leases", "bundles", "derived", "pairs", "registry", "partial"]);
  const r = rc.purge({});
  assert.equal(r.scope, "ALL");
  assert.deepEqual(r.removed, { derived: 2, pairs: 3, registry: 2, partial: 2, files: 2, history: 2, manifest: 4, leases: 2, bundles: 2 });
  for (const t of ["files", "history", "manifest", "leases", "bundles", "derived", "pairs", "registry"]) assert.equal(count(s, t), 0, t);
  assert.equal(count(s, "partial"), 2, "the whole form clears only what the declaration's condition names");
  assert.deepEqual(dump(s, ["files", "history", "manifest", "leases", "bundles", "derived", "pairs", "registry", "partial"]), keep,
                   "seq, minted_ids, settings, the exempt table and the undeclared one are untouched");
  assert.equal(count(s, "seq"), 1); assert.equal(count(s, "minted_ids"), 1); assert.equal(count(s, "settings"), 1); assert.equal(count(s, "identity"), 1);
  const again = rc.purge({});
  assert.ok(Object.values(again.removed).every((n) => n === 0));
});

async function auditFixture() {
  const { s, rc } = fresh();
  const md = (id, refs = "") => `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\n${refs}---\n\n## Summary\n\nx\n`;
  const ref = (t) => `references:\n  - target: ${t}\n    rel: cites\n    status: active\n`;
  const ids = ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c", "INFO-2026-0004-d", "INFO-2026-0005-e"];
  rc.commit({ bundleId: ids[0], type: "information", snapKey: "K1", files: [file("bundle.md", md(ids[0], ref(ids[1])))] });
  for (const id of ids.slice(1)) rc.commit({ bundleId: id, type: "information", snapKey: "K1", files: [file("bundle.md", md(id))] });
  return { s, rc, ids };
}
const hexOf = (b) => Buffer.from(b).toString("hex");
async function expected(rc, id, known, extra = {}) {
  const img = rc.readImage(id);
  const files = new Map(), elided = new Set();
  for (const [p, v] of Object.entries(img)) typeof v === "string" ? files.set(p, v) : elided.add(p);
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: elided,
    sha256: async (v) => hexOf(createHash("sha256").update(typeof v === "string" ? v : Buffer.from(v)).digest()),
    sha512: async (b) => new Uint8Array(createHash("sha512").update(Buffer.from(b)).digest()),
    resolveTarget: (t) => known.has(t), ...extra });
  return findings.filter((f) => f.severity === "error");
}

test("R18: auditPass runs the check catalogue over a page and reports clean, with-error and tallies by check and by check-and-code", async () => {
  const { rc, ids } = await auditFixture();
  const known = new Set(ids);
  const r = await rc.auditPass({ limit: 10 });
  assert.equal(r.ok, true); assert.equal(r.checked, 5); assert.deepEqual(r.page, ids);
  const tally = {}, detail = {}; let clean = 0, withErrors = 0;
  for (const id of ids) {
    const errs = await expected(rc, id, known);
    if (!errs.length) { clean++; continue; }
    withErrors++;
    for (const e of errs) { tally[e.check] = (tally[e.check] || 0) + 1; if (e.code) detail[`${e.check}/${e.code}`] = (detail[`${e.check}/${e.code}`] || 0) + 1; }
  }
  assert.equal(r.clean, clean); assert.equal(r.withErrors, withErrors); assert.equal(r.clean + r.withErrors, r.checked);
  assert.deepEqual(r.tally, tally);
  assert.deepEqual(r.tallyDetail ?? {}, detail);
  assert.ok(r.offenders.length <= 20 && r.offenders.every((o) => ids.includes(o.bundleId) && o.errors.length <= 5));
  // the caller's context reaches the catalogue
  let asked = [];
  await rc.auditPass({ limit: 1, context: (id) => { asked.push(id); return { earnedRegistry: null }; } });
  assert.deepEqual(asked, [ids[0]]);
});

test("R19: references resolve against the whole corpus, and the page and anything it names are limited to what visible() admits", async () => {
  const { rc, ids } = await auditFixture();
  const onlyA = await rc.auditPass({ visible: (id) => id === ids[0] });
  assert.deepEqual(onlyA.page, [ids[0]]); assert.equal(onlyA.checked, 1);
  assert.ok(!("C-6.2" in onlyA.tally), "B is out of the viewer's slice but still resolves: no dangling-reference finding is manufactured");
  const want = await expected(rc, ids[0], new Set(ids));
  assert.equal(Object.values(onlyA.tally).reduce((a, b) => a + b, 0), want.length);
  assert.ok(onlyA.offenders.every((o) => o.bundleId === ids[0]));
  // the check is live: with B gone from the corpus, A's reference does dangle
  rc.purge({ bundleId: ids[1] });
  const gone = await rc.auditPass({ visible: (id) => id === ids[0] });
  assert.ok(gone.tally["C-6.2"] >= 1);
  const none = await rc.auditPass({ visible: () => false });
  assert.deepEqual([none.checked, none.page, none.offenders, none.tally], [0, [], [], {}]);
});

test("R20: the cursor is the last bundle id on a full page, and a pass resumes from it whatever the store did meanwhile", async () => {
  const { rc, ids } = await auditFixture();
  const p1 = await rc.auditPass({ limit: 2 });
  assert.deepEqual(p1.page, ids.slice(0, 2)); assert.equal(p1.cursor, ids[1]);
  rc.commit({ bundleId: "INFO-2026-0002-bb", type: "information", snapKey: "K", files: [file("bundle.md", "x")] });
  rc.purge({ bundleId: ids[2] });
  const p2 = await rc.auditPass({ after: p1.cursor, limit: 2 });
  assert.deepEqual(p2.page, ["INFO-2026-0002-bb", ids[3]]); assert.equal(p2.cursor, ids[3]);
  const p3 = await rc.auditPass({ after: p2.cursor, limit: 2 });
  assert.deepEqual(p3.page, [ids[4]]); assert.equal(p3.cursor, null, "a short page ends the pass");
  const vis = await rc.auditPass({ limit: 2, visible: (id) => id !== ids[0] });
  assert.deepEqual(vis.page, ["INFO-2026-0002-b", "INFO-2026-0002-bb"]); assert.equal(vis.cursor, "INFO-2026-0002-bb");
});

test("R31: every service reads and writes only this module's tables and the clock, and makes no network call", async () => {
  const { s, rc } = fresh({ evidence: bucket(), storeName: "bio" });
  s.db.exec(`CREATE TABLE other_a (bundle_id TEXT, v TEXT); CREATE TABLE other_b (k TEXT)`);
  s.sql.exec(`INSERT INTO other_a VALUES ('INFO-2026-0001-a', 'keep')`); s.sql.exec(`INSERT INTO other_b VALUES ('keep')`);
  const others = () => JSON.stringify([rows(s, `SELECT * FROM other_a`), rows(s, `SELECT * FROM other_b`)]);
  const before = others();
  const fetchWas = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("record-core made a network call"); };
  try {
    put(rc, "INFO-2026-0001-a", "K1"); put(rc, "INFO-2026-0001-a", "K2", "y");
    rc.allocId("INFO", "2026"); rc.allocIdOp("PROJ", "2026"); rc.mintOpaqueId("CASE", "2026", "", () => false);
    rc.seedMintLedger([]); rc.acquireLease("INFO-2026-0001-a", "m", 10); rc.readFile("INFO-2026-0001-a", "bundle.md");
    rc.readImage("INFO-2026-0001-a"); rc.bundleInfo("INFO-2026-0001-a"); rc.listBundles({}); rc.listByType({ type: "x" });
    rc.setSetting("a", 1, "m"); rc.getSetting("a"); await rc.auditPass({});
    rc.purge({ bundleId: "INFO-2026-0001-a" }); rc.purge({});
  } finally { globalThis.fetch = fetchWas; }
  assert.equal(others(), before, "no other module's table was read into a write or changed (none was declared to purge)");
  // and what it holds: no member, capability or fence table among its own
  const own = rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'other_%' AND name NOT LIKE 'sqlite_%'`).map((r) => r.name).sort();
  assert.deepEqual(own, ["bundles", "files", "history", "leases", "manifest", "minted_ids", "seq", "settings"]);
});

test("R29: history and manifest are append-only under every service but purge", () => {
  const { s, rc } = fresh();
  put(rc, "INFO-2026-0001-a", "K1"); put(rc, "INFO-2026-0001-a", "K2", "b"); put(rc, "INFO-2026-0001-a", "K3", "c");
  const hm = () => JSON.stringify([rows(s, `SELECT rowid, * FROM history ORDER BY rowid`), rows(s, `SELECT rowid, * FROM manifest ORDER BY rowid`)]);
  const h0 = hm();
  put(rc, "INFO-2026-0001-a", "K4", "d");
  const h1 = hm();
  const [H0, M0] = JSON.parse(h0), [H1, M1] = JSON.parse(h1);
  assert.deepEqual(H1.slice(0, H0.length), H0); assert.deepEqual(M1.slice(0, M0.length), M0);
  assert.equal(M1.length, M0.length + 1);
});
