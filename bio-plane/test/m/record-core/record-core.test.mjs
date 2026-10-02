/* record-core: requirement-named tests at the module's interface (build/requirements/record-core.md).
   Each test names the requirement ids it checks in its title. The module runs over `storage.mjs`, a
   Durable Object storage stand-in on node:sqlite; a fresh storage per test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { checkBundle, EXTENSION_ARMS } from "../../../src/record-grammar/index.mjs";
import { recordOf, RecordCore, RECORD_SCHEMA, stampInstant, instantOrder, PER_ITEM_MAX, perItem, EMPTY_STRING_SHA, fileDigestOf,
         inlineBytesOf, mintExhausted, RECORD_CORE_CHECKS, PER_ITEM_CHECKS,
         recordCoreOps } from "../../../src/record-core/index.mjs";
import { storage, bucket } from "./storage.mjs";

const fresh = (opts) => { const s = storage(); const rc = recordOf({ storage: s }, opts); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
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

test("R28 R40: seedMintLedger learns the live ids its caller names and every id the counter issued to an untailed gated prefix", () => {
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
  assert.deepEqual(m.entries.map((e) => e.key), ["20200101T000000Z_aaaa", "20250101T000000Z_mmmm", "20260901T000000Z_zzzz"],
                   "the document keeps the key order the catalogue checks (C-12.1)");
  const byWrite = [...m.entries].sort((a, b) => a.seq - b.seq);
  assert.deepEqual(byWrite.map((e) => [e.seq, e.key]), [[1, "20260901T000000Z_zzzz"], [2, "20200101T000000Z_aaaa"], [3, "20250101T000000Z_mmmm"]],
                   "R16: each entry's seq is its rank in write order, not the snap keys' lexical order");
  assert.ok(m.entries.every((e) => Number.isSafeInteger(e.seq)), "R16: every entry given back carries seq");
  assert.deepEqual(m.entries.map((e) => e.seq).sort(), [1, 2, 3]);
  assert.deepEqual(["20260901T000000Z_zzzz", "20200101T000000Z_aaaa", "20250101T000000Z_mmmm"].map((k) => rc.manifestEntry(id, k).seq), [1, 2, 3],
                   "R16: manifestEntry gives the same write-order rank");
  const [e1, e2, e3] = byWrite;
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
                         files: [file("bundle.md", "one"), file("notes.md", "n")], state: "open", group: "g" });
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

test("R32: transact rolls back every row in any module's tables on a throw or a refusal, and a nested call rolls back only its own", () => {
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
  // K133: an inner refusal or throw inside an outer commit rolls back the inner's own rows and ids, and only them
  const v = rc.transact(() => {
    s.sql.exec(`INSERT INTO other_module VALUES ('out1')`);
    const inner = rc.transact(() => {
      s.sql.exec(`INSERT INTO other_module VALUES ('in2')`); rc.allocId("INQ", "2026");
      draws([77], () => rc.mintOpaqueId("CASE", "2026", "", () => false)); put(rc, "INFO-2026-0009-i", "K1");
      return { ok: false, reason: "INNER" };
    });
    assert.deepEqual(inner, { ok: false, reason: "INNER" });
    assert.throws(() => rc.transact(() => { s.sql.exec(`INSERT INTO other_module VALUES ('in3')`); rc.allocId("INQ", "2026"); throw new Error("inner"); }));
    rc.transact(() => { s.sql.exec(`INSERT INTO other_module VALUES ('in4')`); return { ok: true }; });
    s.sql.exec(`INSERT INTO other_module VALUES ('out2')`);
    return { ok: true, v: 1 };
  });
  assert.deepEqual(v, { ok: true, v: 1 });
  assert.deepEqual(rows(s, `SELECT k FROM other_module ORDER BY rowid`).map((x) => x.k), ["out1", "in4", "out2"],
                   "the refused and thrown inner calls left no row; the outer's and the committed inner's stand");
  assert.equal(rc.bundleInfo("INFO-2026-0009-i"), null, "the refused inner commit left no bundle");
  assert.equal(rc.allocId("INQ", "2026").id, "INQ-2026-0001", "no id allocated in a refused or thrown inner call was spent");
  assert.equal(draws([77], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0077", "nor any id minted in one");
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

test("R38 R39: evidenceStore answers head/get/put by digest at a key fixed by this module, or null with no bucket bound", async () => {
  assert.equal(fresh().rc.evidenceStore(), null);
  const b = bucket();
  const { rc } = fresh({ evidence: b, evidencePrefix: () => "scratch/captures/" });
  const ev = rc.evidenceStore();
  const d = sha("bytes");
  await ev.put(d, new Uint8Array([1, 2]));
  assert.deepEqual(b.calls[0], ["put", `scratch/captures/${d}`, { sha256: d }], "put hands the bucket the digest to verify");
  assert.ok(await ev.head(d)); assert.ok(await ev.get(d));
  assert.equal(await ev.head(sha("other")), null);
  assert.deepEqual(b.calls.slice(1).map((c) => c[1]), [`scratch/captures/${d}`, `scratch/captures/${d}`, `scratch/captures/${sha("other")}`]);
  const b2 = bucket();
  const { rc: rc2 } = fresh({ evidence: b2, evidencePrefix: "bio/captures/" });
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

test("R21 R46: tables are declared once; a table declared twice or by two modules is refused with TABLE_DECLARED", () => {
  const { rc } = fresh();
  for (const t of ["files", "history", "manifest", "leases", "bundles", "seq", "minted_ids", "settings"]) {
    const r = rc.declarePurge("membership", [t]);
    assert.equal(r.reason, "TABLE_DECLARED"); assert.equal(r.declaredBy, "record-core", `${t} is record-core's own`);
  }
  assert.deepEqual(rc.declarePurge("membership", ["members"]), { ok: true });
  assert.equal(rc.declarePurge("membership", ["members"]).reason, "TABLE_DECLARED");
  assert.equal(rc.declarePurge("promotion", [{ name: "members", keys: [] }]).reason, "TABLE_DECLARED");
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
  assert.deepEqual(rc.declarePurge("m1", ["derived", { name: "pairs", keys: ["a_bundle_id", "b_bundle_id"] },
                                          { name: "registry", keys: [] }, { name: "partial", whole: "ratified IS NULL" }],
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

test("R22 R24 R46: purge of one bundle clears only the rows keyed to it, and reports each declared table's count", () => {
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

test("R22 R23 R24 R46: the whole-store purge clears every declared, non-exempt table and never seq, minted_ids, settings or an exempt table", () => {
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
    resolveTarget: (t) => known.has(t), ...extra }, { grammars: rc.grammars() });
  return findings.filter((f) => f.severity === "error");
}

test("R18 R45: auditPass runs the check catalogue over a page and reports clean, with-error and tallies by check and by check-and-code", async () => {
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

test("R18 R19 R20 (N117): auditPass reads the store a page at a time, never the corpus whole, and pages past invisible bundles to a full page", async () => {
  const s = storage();
  const reads = [];
  const exec = s.sql.exec;
  s.sql.exec = (q, ...a) => { const r = exec(q, ...a).toArray(); if (/^\s*SELECT/i.test(q)) reads.push({ q, n: r.length }); return r.values(); };
  const rc = recordOf({ storage: s }); rc.migrate();
  const ids = Array.from({ length: 23 }, (_, i) => `INFO-2026-${String(i + 1).padStart(4, "0")}-x`);
  const md = (id, t) => `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\nreferences:\n  - target: ${t}\n    rel: cites\n    status: active\n---\n\n## Summary\n\nx\n`;
  // every bundle cites the first one, which no viewer below sees: it must still resolve (R19)
  for (const id of ids) rc.commit({ bundleId: id, type: "information", snapKey: "K1", files: [file("bundle.md", md(id, ids[0]))] });
  const seen = (id) => Number(id.slice(10, 14)) % 5 === 0;       // 0005, 0010, 0015, 0020
  const want = ids.filter(seen);
  const pages = []; let after = "";
  for (;;) {
    reads.length = 0;
    const p = await rc.auditPass({ after, limit: 3, visible: seen });
    assert.ok(reads.every((r) => r.n <= 3), `no read returns more than a page's rows: ${JSON.stringify(reads.filter((r) => r.n > 3))}`);
    assert.ok(p.page.length === 3 || p.cursor === null, "a short page ends the pass");
    pages.push(p.page);
    if (!p.cursor) break;
    assert.equal(p.cursor, p.page.at(-1), "R20: the cursor is the last bundle id on the full page");
    after = p.cursor;
  }
  assert.deepEqual(pages, [want.slice(0, 3), want.slice(3)], "the visible bundles, in id order, in full pages across the invisible ones");
  const all = await rc.auditPass({ visible: seen, limit: 10 });
  assert.deepEqual(all.page, want);
  assert.ok(!("C-6.2" in all.tally), "R19: the unseen cited bundle still resolves: no dangling reference is manufactured");
  // and one read never answers every bundle, however large the page asked for
  reads.length = 0;
  const one = await rc.auditPass({ limit: 1, visible: (id) => id === ids[22] });
  assert.deepEqual(one.page, [ids[22]]); assert.equal(one.cursor, ids[22]);
  assert.ok(reads.every((r) => r.n <= 1), "an unseen corpus is paged past one page's worth at a time");
  const none = await rc.auditPass({ after: ids[22], limit: 5 });
  assert.deepEqual([none.page, none.cursor], [[], null]);
});

test("R31: every service reads and writes only this module's tables and the clock, and makes no network call", async () => {
  const { s, rc } = fresh({ evidence: bucket(), evidencePrefix: "bio/captures/" });
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

test("R39: recordOf answers one instance per storage, the same to every caller, reading its options on the first call only", async () => {
  const s = storage(), s2 = storage();
  const b = bucket();
  const a = recordOf({ storage: s }, { evidence: b, evidencePrefix: "one/captures/" });
  assert.equal(recordOf({ storage: s }), a, "a second caller with another ctx object over the same storage gets the same instance");
  assert.equal(recordOf({ storage: s }, { evidence: null, evidencePrefix: "two/" }), a);
  assert.equal(recordOf(s), a, "the storage itself reaches it too");
  await a.evidenceStore().head("d");
  assert.deepEqual(b.calls[0], ["head", "one/captures/d"], "the first call's options stand");
  const c = recordOf({ storage: s2 });
  assert.notEqual(c, a); assert.equal(c.evidenceStore(), null);
  // one transaction depth: a transact through one handle joins another's
  a.migrate();
  assert.throws(() => a.transact(() => { recordOf({ storage: s }).allocId("INFO", "2026"); throw new Error("x"); }));
  assert.equal(a.allocId("INFO", "2026").id, "INFO-2026-0001");
  // one declaration list
  assert.deepEqual(recordOf({ storage: s }).declarePurge("m", ["t1"]), { ok: true });
  assert.equal(a.declarePurge("n", ["t1"]).reason, "TABLE_DECLARED");
  // the services are its methods, by their names
  for (const m of ["allocId", "allocIdOp", "mintOpaqueId", "acquireLease", "readFile", "readImage", "auditPass", "declarePurge",
                   "purge", "getSetting", "setSetting", "transact", "commit", "bundleInfo", "listBundles", "listByType",
                   "evidenceStore", "seedMintLedger", "head", "manifestEntry", "livePaths", "manifestByAuthor", "isFirstBoot",
                   "digestCensus", "snapKeyCensus", "registerAuditCheck", "textAtSha", "releaseLease", "registerCounts", "counts",
                   "afterCommit", "registerGrammar", "grammars", "registerStatsSource", "stats", "proofCounts", "ownCounts",
                   "recordOpaqueId"])
    assert.equal(typeof a[m], "function", m);
});

test("R40: seedMintLedger reads only the tables and columns its caller names, nothing else of another module's", () => {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE tasks (id TEXT, note TEXT); CREATE TABLE unnamed (id TEXT)`);
  s.sql.exec(`INSERT INTO tasks VALUES ('TASK-2026-0007-x', 'TASK-2026-0008-x')`);
  s.sql.exec(`INSERT INTO unnamed VALUES ('TASK-2026-0009-x')`);
  rc.seedMintLedger([["TASK", "tasks", "id"]]);
  assert.equal(draws([7, 8], () => rc.mintOpaqueId("TASK", "2026", "-x", () => false)), "TASK-2026-0008-x", "the named column was learned");
  assert.equal(draws([9], () => rc.mintOpaqueId("TASK", "2026", "-x", () => false)), "TASK-2026-0009-x", "an unnamed table was not read");
});

test("R41 R42 R43: head, manifestEntry and livePaths answer a held bundle's row, an entry and its live paths, or null", () => {
  const { rc } = fresh();
  assert.equal(rc.head("INFO-2026-0001-a"), null);
  assert.equal(rc.manifestEntry("INFO-2026-0001-a", "K1"), null);
  assert.equal(rc.livePaths("INFO-2026-0001-a"), null);
  rc.commit({ bundleId: "INFO-2026-0001-a", type: "information", title: "T", snapKey: "K1", kind: "promotion", base: null, author: "a",
              writer: "w", operation: "o", state: "collected", priorState: null, group: "g1",
              files: [file("z.md", "z"), file("bundle.md", "b"), file("a/b.json", "{}")] });
  assert.deepEqual(rc.head("INFO-2026-0001-a"), { bundleSha: sha("b"), rowVersion: 1, type: "information", title: "T",
                                                  currentState: "collected", priorState: null, groupId: "g1" });
  const e = rc.manifestEntry("INFO-2026-0001-a", "K1");
  assert.deepEqual({ ...e, created: null }, { kind: "promotion", base: null, author: "a", created: null, writer: "w", operation: "o", seq: 1,
    files: [{ name: "z.md", sha256: sha("z") }, { name: "bundle.md", sha256: sha("b") }, { name: "a/b.json", sha256: sha("{}") }] });
  assert.ok(!Number.isNaN(Date.parse(e.created)));
  assert.equal(rc.manifestEntry("INFO-2026-0001-a", "K2"), null);
  assert.deepEqual(rc.livePaths("INFO-2026-0001-a"), ["a/b.json", "bundle.md", "z.md"]);
  rc.commit({ bundleId: "INFO-2026-0001-a", type: "information", snapKey: "K2", files: [] });
  assert.deepEqual(rc.livePaths("INFO-2026-0001-a"), [], "a held bundle with no live file answers an empty list");
});

test("R44: commit records state, prior state, group, times and criticality as given, and the entry's time is the caller's at", () => {
  const { s, rc } = fresh();
  const id = "INFO-2026-0001-a";
  rc.commit({ bundleId: id, type: "information", snapKey: "K1", files: [file("bundle.md", "1")], state: "collected", priorState: null,
              group: "grp", created: "2026-01-01T00:00:00Z", lastUpdated: "2026-01-02T00:00:00Z", criticality: "high",
              at: "2026-01-02T00:00:00Z" });
  assert.deepEqual(rc.head(id), { bundleSha: sha("1"), rowVersion: 1, type: "information", title: null, currentState: "collected",
                                  priorState: null, groupId: "grp" });
  assert.equal(rc.manifestEntry(id, "K1").created, "2026-01-02T00:00:00Z");
  rc.commit({ bundleId: id, type: "information", snapKey: "K2", files: [file("bundle.md", "2")], state: "verified",
              priorState: "collected", group: "grp", lastUpdated: "2026-02-01T00:00:00Z", criticality: null, at: "2026-02-01T00:00:00Z" });
  assert.deepEqual(rc.head(id), { bundleSha: sha("2"), rowVersion: 2, type: "information", title: null, currentState: "verified",
                                  priorState: "collected", groupId: "grp" });
  assert.equal(rc.manifestEntry(id, "K2").created, "2026-02-01T00:00:00Z");
  const img = rc.readImage(id);
  assert.equal(JSON.parse(img["_history/promotion_K2.json"]).created, "2026-02-01T00:00:00Z");
  const row = rows(s, `SELECT created, last_updated, criticality FROM bundles WHERE bundle_id=?`, id)[0];
  assert.deepEqual([row.created, row.last_updated, row.criticality], ["2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", null],
                   "created kept from the first commit (not given again), last_updated and criticality as given");
  rc.commit({ bundleId: "INFO-2026-0002-b", type: "information", snapKey: "K1", files: [file("bundle.md", "3")], criticality: "low",
              created: "2025-05-05T00:00:00Z", lastUpdated: "2025-06-06T00:00:00Z" });
  const r2 = rows(s, `SELECT created, last_updated, criticality FROM bundles WHERE bundle_id='INFO-2026-0002-b'`)[0];
  assert.deepEqual([r2.created, r2.last_updated, r2.criticality], ["2025-05-05T00:00:00Z", "2025-06-06T00:00:00Z", "low"]);
});

/* ---- T5: R37's widened contract, R47–R59 ---- */

test("R37: the read contract's tables and columns hold their stated names, types and meaning (N64, N83)", () => {
  const { s, rc } = fresh();
  const cols = (t) => Object.fromEntries(rows(s, `PRAGMA table_info(${t})`).map((r) => [r.name, r]));
  const b = cols("bundles"), f = cols("files"), h = cols("history");
  for (const [c, notnull] of [["bundle_id", 0], ["object_type", 1], ["current_state", 1], ["title", 0], ["criticality", 0],
                              ["created", 1], ["last_updated", 1]])
    { assert.equal(b[c].type, "TEXT", c); assert.equal(b[c].notnull, notnull, c); }
  assert.equal(b.bundle_id.pk, 1);
  for (const c of ["bundle_id", "path", "sha256"]) { assert.equal(f[c].type, "TEXT", `files.${c}`); assert.equal(h[c].type, "TEXT", `history.${c}`); }
  assert.equal(h.snap_key.type, "TEXT");
  assert.deepEqual([f.bundle_id.pk, f.path.pk], [1, 2]); assert.deepEqual([h.bundle_id.pk, h.snap_key.pk, h.path.pk], [1, 2, 3]);
  const id = "INFO-2026-0001-a";
  rc.commit({ bundleId: id, type: "information", title: "The title", snapKey: "K1", files: [file("bundle.md", "one"), file("n.md", "n")],
              state: "collected", criticality: "high", created: "2026-01-01T00:00:00Z", lastUpdated: "2026-01-02T00:00:00Z" });
  rc.commit({ bundleId: id, type: "information", title: "The title", snapKey: "K2", files: [file("bundle.md", "two")],
              state: "verified", lastUpdated: "2026-01-03T00:00:00Z" });
  // meaning: what commit was given, read back by a join in a later module's own SQL
  assert.deepEqual({ ...rows(s, `SELECT bundle_id, object_type, current_state, title, criticality, created, last_updated FROM bundles`)[0] },
    { bundle_id: id, object_type: "information", current_state: "verified", title: "The title", criticality: "high",
      created: "2026-01-01T00:00:00Z", last_updated: "2026-01-03T00:00:00Z" });
  assert.deepEqual(rows(s, `SELECT bundle_id, path, sha256 FROM files`).map((r) => ({ ...r })), [{ bundle_id: id, path: "bundle.md", sha256: sha("two") }],
                   "files: the live files, each with its stored digest");
  assert.deepEqual(rows(s, `SELECT bundle_id, snap_key, path, sha256 FROM history ORDER BY path`).map((r) => ({ ...r })),
                   [{ bundle_id: id, snap_key: "K2", path: "bundle.md", sha256: sha("one") }, { bundle_id: id, snap_key: "K2", path: "n.md", sha256: sha("n") }],
                   "history: each replaced file under the snap key of the commit that replaced it");
  s.db.exec(`CREATE TABLE register (capture_sha TEXT, bundle_id TEXT)`);
  s.sql.exec(`INSERT INTO register VALUES (?, ?)`, sha("one"), id);
  assert.equal(rows(s, `SELECT h.snap_key FROM register r JOIN history h ON h.bundle_id = r.bundle_id AND h.sha256 = r.capture_sha`)[0].snap_key, "K2");
});

test("R47: stampInstant spells an instant in UTC at second or millisecond precision, and throws on any other, naming it", () => {
  const when = Date.UTC(2026, 8, 27, 5, 6, 7, 89);
  assert.equal(stampInstant("second", when), "2026-09-27T05:06:07Z");
  assert.equal(stampInstant("millisecond", when), "2026-09-27T05:06:07.089Z");
  assert.equal(stampInstant("second", Date.UTC(2026, 0, 1)), "2026-01-01T00:00:00Z");
  assert.equal(stampInstant("millisecond", Date.UTC(2026, 0, 1)), "2026-01-01T00:00:00.000Z");
  const t0 = Date.now(), now = stampInstant("millisecond"), t1 = Date.now();
  assert.ok(Date.parse(now) >= t0 && Date.parse(now) <= t1, "defaults to now");
  assert.match(stampInstant("second"), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  for (const bad of ["minute", "Second", "", undefined, null, 1])
    assert.throws(() => stampInstant(bad, when), (e) => e.message.includes(JSON.stringify(bad) ?? "undefined"));
});

test("R48: instantOrder compares instants as instants in either spelling, NaN when either side is unreadable, never throwing", () => {
  assert.ok(instantOrder("2026-01-01T00:00:00Z", "2026-01-01T00:00:00.123Z") < 0, "…:00Z is before …:00.123Z");
  assert.ok("2026-01-01T00:00:00Z" > "2026-01-01T00:00:00.123Z", "(as strings they sort the other way)");
  assert.ok(instantOrder("2026-01-01T00:00:00.123Z", "2026-01-01T00:00:00Z") > 0);
  assert.equal(instantOrder("2026-01-01T00:00:00Z", "2026-01-01T00:00:00.000Z"), 0);
  assert.ok(instantOrder("2025-12-31T23:59:59.999Z", "2026-01-01T00:00:00Z") < 0);
  for (const [a, b] of [["", "2026-01-01T00:00:00Z"], ["2026-01-01T00:00:00Z", null], [undefined, undefined], ["not a time", "2026-01-01T00:00:00Z"],
                        [1767225600000, "2026-01-01T00:00:00Z"], [{}, []]])
    assert.ok(Number.isNaN(instantOrder(a, b)), `${a} vs ${b}`);
  const xs = ["2026-01-01T00:00:01Z", "2026-01-01T00:00:00.500Z", "2026-01-01T00:00:00Z"];
  assert.deepEqual([...xs].sort(instantOrder), ["2026-01-01T00:00:00Z", "2026-01-01T00:00:00.500Z", "2026-01-01T00:00:01Z"]);
});

/* A set act for perItem: answers ok for a subject it accepts, a refusal of its own otherwise, and records what it was given. */
function act() {
  const seen = [];
  const one = (b) => { seen.push(b); if (b.boom) throw new Error("kaput"); return b.id === "bad" ? { ok: false, reason: "NOPE", extra: 1 } : { ok: true, id: b.id }; };
  return { seen, one };
}

test("R49 R50 R55: perItem refuses a set with no items or more than PER_ITEM_MAX whole, before any item, with C-75.1 and C-75.2", () => {
  assert.equal(PER_ITEM_MAX, 100);
  for (const body of [{}, { items: [] }, { items: "x" }, { items: { 0: {} } }, null, undefined]) {
    const { seen, one } = act();
    const r = perItem("taskresolve", body, { actor: "m" }, one);
    assert.deepEqual({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, op: r.op, weight: r.weight, count: r.count },
                     { ok: false, reason: "SET_NO_ITEMS", code: "SET_NO_ITEMS", check: "C-75.1", op: "taskresolve", weight: "per-item", count: 0 });
    assert.equal(r.translation, PER_ITEM_CHECKS.SET_NO_ITEMS.translation); assert.equal(seen.length, 0);
  }
  const { seen, one } = act();
  const big = perItem("taskforward", { items: Array.from({ length: 101 }, (_, i) => ({ id: `t${i}` })) }, {}, one);
  assert.deepEqual([big.ok, big.reason, big.check, big.count, big.max, big.op, big.weight], [false, "SET_TOO_LARGE", "C-75.2", 101, 100, "taskforward", "per-item"]);
  assert.equal(big.translation, PER_ITEM_CHECKS.SET_TOO_LARGE.translation);
  assert.equal(seen.length, 0, "no item was tried");
  const full = perItem("taskforward", { items: Array.from({ length: 100 }, (_, i) => ({ id: `t${i}` })) }, {}, act().one);
  assert.deepEqual([full.ok, full.count, full.applied], [true, 100, 100], "exactly PER_ITEM_MAX is allowed");
});

test("R50 R52 R55: perItem applies one to each item on its own, with shared values, the item's fields, then the stamps, and no items", () => {
  const { seen, one } = act();
  const long = "x".repeat(500);
  const r = perItem("taskforward", { items: [{ id: "a", to: "m2", note: long, n: 3, o: { deep: 1 }, arr: [1] }, 7, { id: "bad" }, { id: "b", boom: true },
                                            { id: "c", actor: "spoof" }, null, ["id"]], to: "m1", reason: "why" },
                    { actor: "m" }, one);
  assert.equal(seen.length, 4, "one call per object item");
  assert.deepEqual(seen[0], { to: "m2", reason: "why", id: "a", note: long, n: 3, o: { deep: 1 }, arr: [1], actor: "m" },
                   "shared values, overridden by the item's own, then the stamps; no items");
  assert.ok(seen.every((b) => !("items" in b)));
  assert.equal(seen[3].actor, "m", "a stamp wins over the item's own field");
  assert.deepEqual(r.items.map((o) => [o.index, o.outcome]),
    [[0, "applied"], [1, "retained"], [2, "retained"], [3, "retained"], [4, "applied"], [5, "retained"], [6, "retained"]]);
  assert.deepEqual(r.items[0].asked, { id: "a", to: "m2", note: "x".repeat(400), n: 3 }, "asked: the scalar fields, strings cut at 400");
  for (const i of [1, 5, 6]) {
    assert.deepEqual([r.items[i].reason, r.items[i].check, r.items[i].asked], ["SET_ITEM_MALFORMED", "C-75.3", null]);
    assert.equal(r.items[i].translation, PER_ITEM_CHECKS.SET_ITEM_MALFORMED.translation);
  }
  assert.deepEqual([r.items[2].ok, r.items[2].reason, r.items[2].extra, r.items[2].asked], [false, "NOPE", 1, { id: "bad" }], "the act's own answer, verbatim");
  assert.deepEqual([r.items[3].reason, r.items[3].check, r.items[3].translation], ["SET_ITEM_FAILED", "C-75.4", PER_ITEM_CHECKS.SET_ITEM_FAILED.translation]);
  assert.match(r.items[3].detail, /kaput/);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "SET_ITEMS_RETAINED", "SET_ITEMS_RETAINED", "C-75.5", PER_ITEM_CHECKS.SET_ITEMS_RETAINED.translation]);
  assert.deepEqual([r.op, r.weight, r.count, r.applied, r.retained], ["taskforward", "per-item", 7, 2, 5]);
  assert.equal(r.applied + r.retained, r.count);
  assert.equal(typeof r.detail, "string");
  // a non-object answer is retained
  const odd = perItem("x", { items: [{ id: "a" }] }, {}, () => "yes");
  assert.deepEqual([odd.ok, odd.items[0].outcome, odd.items[0].ok], [false, "retained", false]);
  // every item applied
  const all = perItem("taskresolve", { items: [{ id: "a" }, { id: "b" }] }, { actor: "m" }, act().one);
  assert.deepEqual(Object.keys(all).sort(), ["applied", "count", "detail", "items", "ok", "op", "retained", "weight"]);
  assert.deepEqual([all.ok, all.op, all.weight, all.count, all.applied, all.retained], [true, "taskresolve", "per-item", 2, 2, 0]);
  // a one that is not a function, and a body that is not an object: perItem never throws
  assert.equal(perItem("x", { items: [{ id: "a" }] }, {}, null).items[0].reason, "SET_ITEM_FAILED");
  assert.equal(perItem("x", "body", {}, act().one).reason, "SET_NO_ITEMS");
});

test("R52: items are not one transaction — an applied item stands whatever a later one does; perItem itself writes nothing", () => {
  const { s, rc } = fresh();
  const before = dump(s);
  const r = perItem("mint", { items: [{ p: "INFO" }, { p: "INFO", fail: true }, { p: "ENT" }] }, {},
                    (b) => rc.transact(() => { const { id } = rc.allocId(b.p, "2026"); return b.fail ? { ok: false, reason: "NO", id } : { ok: true, id }; }));
  assert.deepEqual([r.ok, r.applied, r.retained], [false, 2, 1]);
  assert.equal(rc.allocId("INFO", "2026").id, "INFO-2026-0002", "the refused item's step rolled back; the applied one stood");
  assert.equal(rc.allocId("ENT", "2026").id, "ENT-2026-0002");
  const { s: s2 } = fresh();
  const b2 = dump(s2);
  perItem("noop", { items: [{ a: 1 }, 2] }, {}, () => ({ ok: true }));
  assert.deepEqual(dump(s2), b2);
  assert.notDeepEqual(dump(s), before);
});

test("R51: an item naming an identity key receives only the shared values of the groups it names; one naming none receives them whole", () => {
  const groups = { itemKeys: [["key"], ["progressionKey", "stageKey"], ["project", "finding"]], sharedKeys: ["to", "reason", "kind", "definitionVersion"] };
  const { seen, one } = act();
  perItem("proposedispose", { items: [{ finding: "F1" }, { key: "k2" }, { progressionKey: "p", stageKey: "s" }, { note: "none" }, { project: "  " }],
                              project: "PROJ-1", key: "shared-key", stageKey: "shared-stage", to: "deferred", definitionVersion: 3 }, { decidedBy: "m" }, one, groups);
  assert.deepEqual(seen[0], { project: "PROJ-1", finding: "F1", to: "deferred", definitionVersion: 3, decidedBy: "m" }, "the project group only");
  assert.deepEqual(seen[1], { key: "k2", to: "deferred", definitionVersion: 3, decidedBy: "m" }, "the key group only");
  assert.deepEqual(seen[2], { progressionKey: "p", stageKey: "s", to: "deferred", definitionVersion: 3, decidedBy: "m" });
  assert.deepEqual(seen[3], { project: "PROJ-1", key: "shared-key", stageKey: "shared-stage", to: "deferred", definitionVersion: 3, note: "none", decidedBy: "m" },
                   "an item naming no identity gets the shared values whole");
  assert.equal(seen[4].key, "shared-key", "a blank identity names nothing");
  // a key in a group and in sharedKeys is not an identity key: never narrowed away
  const r2 = act();
  perItem("resolve", { items: [{ captureSha: "c1" }, { captureSha: "c2", ref: "own" }], ref: "R" }, {}, r2.one,
          { itemKeys: [["captureSha"], ["captureSha", "ref"]], sharedKeys: ["ref"] });
  assert.deepEqual(r2.seen.map((b) => b.ref), ["R", "own"]);
  // with no itemKeys nothing is narrowed
  const r3 = act();
  perItem("proposedispose", { items: [{ finding: "F" }], project: "P", key: "K" }, {}, r3.one);
  assert.deepEqual(r3.seen[0], { project: "P", key: "K", finding: "F" });
  // an item naming keys of two groups receives both groups' shared values
  const r4 = act();
  perItem("proposedispose", { items: [{ key: "k", finding: "f" }], project: "P", stageKey: "S" }, {}, r4.one, groups);
  assert.deepEqual(r4.seen[0], { project: "P", key: "k", finding: "f" });
});

test("R53: manifestByAuthor lists held bundles with an entry by the prefix, with the latest entry and the first by another author", () => {
  const { rc } = fresh();
  const c = (id, k, author, at) => rc.commit({ bundleId: id, type: "information", snapKey: k, author, at, files: [file("bundle.md", `${id}${k}`)] });
  c("INFO-2026-0001-a", "K1", "alice", "2026-01-01T00:00:00Z");
  c("INFO-2026-0001-a", "K2", "token:capture", "2026-01-02T00:00:00Z");
  c("INFO-2026-0002-b", "K1", "token:capture", "2026-01-01T00:00:00Z");
  c("INFO-2026-0003-c", "K1", "bob", "2026-01-01T00:00:00Z");
  c("INFO-2026-0004-d", "Z9", "token:x", "2026-02-01T00:00:00Z");
  c("INFO-2026-0004-d", "A1", "carol", "2026-02-01T00:00:00Z");       // same instant, written later
  c("INFO-2026-0004-d", "M5", "", "2026-01-15T00:00:00Z");            // earliest, but no author
  c("INFO-2026-0005-e", "K1", "dave", "2026-03-01T00:00:00Z");
  c("INFO-2026-0005-e", "K2", "token:y", "2026-02-01T00:00:00Z");     // written later, created earlier
  const r = rc.manifestByAuthor({ authorPrefix: "token:" });
  assert.deepEqual(r.bundles.map((b) => b.bundleId), ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0004-d", "INFO-2026-0005-e"]);
  assert.equal(r.cursor, "INFO-2026-0005-e");
  const [a, b, d, e] = r.bundles;
  assert.deepEqual(a.latest, { snapKey: "K2", kind: "promotion", base: null, author: "token:capture", created: "2026-01-02T00:00:00Z", writer: null, operation: null });
  assert.equal(a.firstOther.author, "alice"); assert.equal(a.firstOther.snapKey, "K1");
  assert.equal(b.firstOther, null, "no entry by anyone else");
  assert.equal(d.latest.snapKey, "A1", "created ties are broken by write order, never by the snap key");
  assert.equal(d.firstOther.snapKey, "A1", "an entry with an empty author is not another author");
  assert.equal(e.latest.snapKey, "K1", "latest by created, not by write order"); assert.equal(e.firstOther.author, "dave");
  const p1 = rc.manifestByAuthor({ authorPrefix: "token:", limit: 2 });
  assert.deepEqual([p1.bundles.map((x) => x.bundleId), p1.cursor], [["INFO-2026-0001-a", "INFO-2026-0002-b"], "INFO-2026-0002-b"]);
  assert.deepEqual(rc.manifestByAuthor({ authorPrefix: "token:", after: p1.cursor }).bundles.map((x) => x.bundleId), ["INFO-2026-0004-d", "INFO-2026-0005-e"]);
  assert.deepEqual(rc.manifestByAuthor({ authorPrefix: "tok%" }), { bundles: [], cursor: null }, "the prefix is a literal, not a pattern");
  assert.deepEqual(rc.manifestByAuthor({ authorPrefix: "nobody" }), { bundles: [], cursor: null });
  // an entry of a bundle not held is never listed
  rc.purge({ bundleId: "INFO-2026-0002-b" });
  assert.ok(!rc.manifestByAuthor({ authorPrefix: "token:" }).bundles.some((x) => x.bundleId === "INFO-2026-0002-b"));
  assert.deepEqual(recordOf({ storage: storage({ schema: false }) }).manifestByAuthor({ authorPrefix: "x" }), { bundles: [], cursor: null }, "never throws");
});

test("R54: isFirstBoot is true through the boot at which the store had no bundles table, and false at every later boot", () => {
  const s = storage({ schema: false });
  const rc = recordOf({ storage: s });
  assert.equal(rc.isFirstBoot(), true);
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) s.db.exec(t);
  rc.migrate(); put(rc, "INFO-2026-0001-a", "K1");
  assert.equal(rc.isFirstBoot(), true, "decided once, before any table was created: still true through that boot");
  // a later boot: a new object over the same database
  const again = { ...s, sql: { exec: (...a) => s.sql.exec(...a) } };
  assert.equal(recordOf({ storage: again }).isFirstBoot(), false);
  assert.equal(fresh().rc.isFirstBoot(), false, "a store that already holds the schema");
  const broken = { sql: { exec() { throw new Error("no"); } }, transactionSync: (f) => f() };
  assert.equal(recordOf({ storage: broken }).isFirstBoot(), false, "never throws");
});

test("R58: fileDigestOf and inlineBytesOf are the one digest and size of a file", () => {
  for (const t of ["", "hello", "  padded \r\n", "é ü 中文 🐘", "a\nb\r\nc"]) {
    assert.equal(fileDigestOf({ text: t }), sha(t), "the UTF-8 bytes exactly as given");
    assert.equal(inlineBytesOf({ text: t }), Buffer.byteLength(t, "utf8"));
  }
  assert.notEqual(fileDigestOf({ text: "a\r\n" }), fileDigestOf({ text: "a\n" }), "no line-ending change");
  assert.notEqual(fileDigestOf({ text: " a" }), fileDigestOf({ text: "a" }), "no trimming");
  assert.equal(fileDigestOf({ blobSha: "ABCDEF" + "0".repeat(58) }), "abcdef" + "0".repeat(58));
  assert.equal(fileDigestOf({ text: "t", blobSha: "B" }), sha("t"), "an inline text is the file's content");
  for (const f of [{}, { blobSha: "" }, { text: 5 }, null, undefined, { blobSha: 7 }]) assert.equal(fileDigestOf(f), null);
  assert.equal(inlineBytesOf({ blobSha: "b".repeat(64) }), null);
  for (const f of [{}, null, undefined, { text: 5 }]) assert.equal(inlineBytesOf(f), null);
  assert.equal(EMPTY_STRING_SHA, sha(""), "the creation marker is the SHA-256 of the empty string");
  assert.equal(fileDigestOf({ text: "" }), EMPTY_STRING_SHA);
});

/* Writes rows straight into the tables, as a store written before REC-175/176/178 could hold them. */
function censusFixture() {
  const { s, rc } = fresh();
  const id = "INFO-2026-0001-a";
  rc.commit({ bundleId: id, type: "information", snapKey: "K1", base: EMPTY_STRING_SHA, files: [file("bundle.md", "one"), file("n.md", "n")] });
  rc.commit({ bundleId: id, type: "information", snapKey: "K2", base: sha("one"), files: [file("bundle.md", "two"), { path: "c.pdf", blobSha: "C".repeat(64), bytes: 9, sha256: "c".repeat(64) }] });
  return { s, rc, id };
}

test("R56: digestCensus counts every live and historical row, and lists the disagreeing ones, digest and size apart", () => {
  const { s, rc, id } = censusFixture();
  const clean = rc.digestCensus({});
  assert.deepEqual(clean.files, { rows: 2, inline: 1, blob: 1, digest_disagrees: 0, bytes_disagree: 0, listed: [] });
  assert.deepEqual(clean.history, { rows: 2, inline: 2, blob: 0, digest_disagrees: 0, bytes_disagree: 0, listed: [] });
  assert.deepEqual([clean.ok, clean.rewritten, typeof clean.note], [true, 0, "string"]);
  assert.deepEqual(Object.keys(clean).sort(), ["files", "history", "note", "ok", "rewritten"]);
  s.sql.exec(`UPDATE files SET sha256=? WHERE path='bundle.md'`, sha("TWO"));                  // digest disagrees
  s.sql.exec(`INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`, id, "sz.md", "é", null, 1, sha("é")); // size only
  s.sql.exec(`INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`, id, "up.md", "u", null, 1, sha("u").toUpperCase()); // agrees, lower-cased
  s.sql.exec(`INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`, id, "b2.pdf", null, "d".repeat(64), 3, "e".repeat(64)); // blob disagrees
  s.sql.exec(`INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`, id, "none", null, null, 0, "f".repeat(64)); // neither: not judged
  s.sql.exec(`UPDATE history SET sha256=? WHERE path='n.md'`, sha("N"));
  const before = dump(s);
  const r = rc.digestCensus({});
  assert.deepEqual(dump(s), before, "it writes nothing");
  assert.deepEqual({ ...r.files, listed: null }, { rows: 6, inline: 3, blob: 3, digest_disagrees: 2, bytes_disagree: 1, listed: null });
  assert.deepEqual(r.files.listed.sort((a, b) => a.path.localeCompare(b.path)), [
    { bundle_id: id, path: "b2.pdf", stored: "e".repeat(64), computed: "d".repeat(64), digest: "disagrees" },
    { bundle_id: id, path: "bundle.md", stored: sha("TWO"), computed: sha("two"), digest: "disagrees" },
    { bundle_id: id, path: "sz.md", stored: sha("é"), computed: sha("é"), bytes_stored: 1, digest: "agrees" },
  ]);
  assert.deepEqual(r.history.listed, [{ bundle_id: id, snap_key: "K2", path: "n.md", stored: sha("N"), computed: sha("n"), digest: "disagrees" }]);
  assert.equal(r.history.bytes_disagree, 0, "historical rows hold no size and are not judged for it");
  // limit: an integer 0..500, 50 when absent, empty or not an integer; the counts stay whole
  for (const [limit, n] of [[0, 0], [1, 1], [-5, 0], ["2", 2], [undefined, 3], ["", 3], [null, 3], [1.5, 3], ["x", 3], [9999, 3]]) {
    const q = rc.digestCensus({ limit });
    assert.equal(q.files.listed.length, n, `limit ${limit}`); assert.equal(q.files.digest_disagrees, 2);
  }
  for (let i = 0; i < 60; i++) s.sql.exec(`INSERT INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`, id, `X${i}`, "p", "p", null, "0", "t");
  assert.equal(rc.digestCensus({}).history.listed.length, 50);
  assert.equal(rc.digestCensus({ limit: 600 }).history.listed.length, 61, "a larger limit is 500");
  assert.equal(rc.digestCensus({ limit: 600 }).history.digest_disagrees, 61);
  assert.deepEqual(recordOf({ storage: storage({ schema: false }) }).digestCensus({}).files.rows, 0, "never throws");
});

test("R57: snapKeyCensus measures each bundle's promotions against its manifest entries, and lists deficits and unanchored entries", () => {
  const { s, rc, id } = censusFixture();
  const c0 = rc.snapKeyCensus({});
  assert.deepEqual({ ...c0, note: null }, { ok: true, bundles: 1, manifest_rows: 2, promotions: 2, overwritten: 0, undetermined: 0, bundles_with_deficit: 0,
                                            excess: 0, orphan_manifest_bundles: 0, listed: [], rewritten: 0, note: null });
  assert.equal(typeof c0.note, "string");
  // B: three promotions, two entries, a creation entry → one overwritten; its K3 is unanchored
  const b = "INFO-2026-0002-b";
  rc.commit({ bundleId: b, type: "information", snapKey: "K1", base: EMPTY_STRING_SHA, files: [file("bundle.md", "b1")] });
  rc.commit({ bundleId: b, type: "information", snapKey: "K2", base: sha("b1"), files: [file("bundle.md", "b2")] });
  rc.commit({ bundleId: b, type: "information", snapKey: "K3", base: sha("b2"), files: [file("bundle.md", "b3")] });
  s.sql.exec(`DELETE FROM manifest WHERE bundle_id=? AND snap_key='K2'`, b);
  // C: two promotions, one entry and no creation entry → one undetermined, none overwritten; a garbled file list
  const c = "INFO-2026-0003-c";
  rc.commit({ bundleId: c, type: "information", snapKey: "K1", base: null, files: [file("bundle.md", "c1")] });
  rc.commit({ bundleId: c, type: "information", snapKey: "K2", base: sha("c1"), files: [file("bundle.md", "c2")] });
  s.sql.exec(`DELETE FROM manifest WHERE bundle_id=? AND snap_key='K1'`, c);
  s.sql.exec(`UPDATE manifest SET files_json='not json' WHERE bundle_id=?`, c);
  // D: an excess entry, anchored (upper-case base); E: entries of a bundle not held
  const d = "INFO-2026-0004-d";
  rc.commit({ bundleId: d, type: "information", snapKey: "K1", base: EMPTY_STRING_SHA, files: [file("bundle.md", "d1")] });
  s.sql.exec(`INSERT INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json) VALUES (?,?,?,?,?,?,?)`, d, "K9", "promotion", sha("d1").toUpperCase(), "a", "t", "[]");
  s.sql.exec(`INSERT INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json) VALUES (?,?,?,?,?,?,?), (?,?,?,?,?,?,?)`,
             "GONE-1", "K1", "promotion", null, "a", "t", "[]", "GONE-1", "K2", "promotion", null, "a", "t", "[]");
  const before = dump(s);
  const r = rc.snapKeyCensus({});
  assert.deepEqual(dump(s), before, "it writes nothing");
  assert.deepEqual({ ...r, listed: null, note: null }, { ok: true, bundles: 4, manifest_rows: 2 + 2 + 1 + 2 + 2, promotions: 2 + 3 + 2 + 1, overwritten: 1,
    undetermined: 1, bundles_with_deficit: 2, excess: 1, orphan_manifest_bundles: 1, listed: null, rewritten: 0, note: null });
  assert.deepEqual([...r.listed].sort((x, y) => x.bundle_id.localeCompare(y.bundle_id)), [
    { bundle_id: b, promotions: 3, manifest_rows: 2, overwritten: 1, undetermined: 0, creation_row: true, unanchored: ["K3"] },
    { bundle_id: c, promotions: 2, manifest_rows: 1, overwritten: 0, undetermined: 1, creation_row: false, unanchored: ["K2"] },
  ]);
  assert.ok(!r.listed.some((l) => l.bundle_id === d || l.bundle_id === id), "an anchored bundle without deficit is not listed");
  assert.equal(rc.snapKeyCensus({ limit: 1 }).listed.length, 1);
  assert.equal(rc.snapKeyCensus({ limit: 1 }).overwritten, 1, "the counts are always whole");
  assert.equal(rc.snapKeyCensus({ limit: -1 }).listed.length, 0);
  assert.equal(rc.snapKeyCensus({ limit: "nope" }).listed.length, 2);
  assert.equal(recordOf({ storage: storage({ schema: false }) }).snapKeyCensus({}).ok, true, "never throws");
});

test("R59 R18: a registered audit check runs over every page bundle beside the catalogue, and a bundle is counted once", async () => {
  const { rc, ids } = await auditFixture();
  const known = new Set(ids);
  const base = await rc.auditPass({ limit: 10 });
  const got = [];
  assert.deepEqual(rc.registerAuditCheck("later", async (input, ctx) => {
    got.push({ ...input, ctx });
    return input.bundleId === ids[1] ? [{ check: "L-1", code: "LATE", severity: "error", message: "late finding" },
                                        { check: "L-2", severity: "warning", message: "only a warning" }] : [];
  }), { ok: true, module: "later" });
  assert.equal(rc.registerAuditCheck("later", () => []).reason, "AUDIT_CHECK_DECLARED");
  for (const [m, f] of [["", () => []], [null, () => []], ["x", "not a function"]]) assert.equal(rc.registerAuditCheck(m, f).reason, "AUDIT_CHECK_MALFORMED");
  assert.equal(rc.registerAuditCheck("broken", (i) => { if (i.bundleId === ids[2]) throw new Error("bad check"); return null; }).ok, true);
  const r = await rc.auditPass({ limit: 10, context: () => ({ earnedRegistry: null, marker: "ctx" }) });
  assert.deepEqual(got.slice(-5).map((g) => g.bundleId), ids, "every page bundle, in order");
  const g = got.at(-1);
  assert.ok(g.files instanceof Map && g.elidedPaths instanceof Set && typeof g.sha256 === "function" && typeof g.sha512 === "function");
  assert.deepEqual(g.raw, rc.readImage(ids[4]));
  assert.deepEqual([...g.files.keys()].sort(), Object.keys(g.raw).filter((k) => typeof g.raw[k] === "string").sort());
  assert.deepEqual(g.ctx, { earnedRegistry: null, marker: "ctx" }, "R45's context reaches the registered check as its second argument");
  assert.equal(g.resolveTarget(ids[0]), true); assert.equal(g.resolveTarget("INFO-2099-0000-x"), false);
  const catOf = async (id) => (await expected(rc, id, known)).length;
  const bErr = await catOf(ids[1]), cErr = await catOf(ids[2]);
  assert.equal(r.tally["L-1"], 1); assert.equal(r.tallyDetail["L-1/LATE"], 1); assert.ok(!("L-2" in r.tally), "a warning is not tallied");
  assert.equal(r.tally.broken, 1); assert.equal(r.tallyDetail["broken/AUDIT_CHECK_FAILED"], 1);
  assert.equal(r.withErrors, base.withErrors + (bErr ? 0 : 1) + (cErr ? 0 : 1), "a bundle is counted once, however many checks found it");
  assert.equal(r.clean + r.withErrors, r.checked);
  const firstFive = async (id, more) => [...(await expected(rc, id, known)).map((e) => ({ check: e.check, detail: e.message })), ...more].slice(0, 5);
  assert.deepEqual(r.offenders.find((o) => o.bundleId === ids[1]).errors,
                   await firstFive(ids[1], [{ check: "L-1", detail: "late finding" }]), "its first five errors, the catalogue's first");
  const oc = r.offenders.find((o) => o.bundleId === ids[2]).errors;
  assert.deepEqual(oc.slice(0, -1), (await firstFive(ids[2], [{}])).slice(0, -1));
  if (cErr < 5) assert.match(oc.at(-1).detail, /bad check/);
  // a bundle only a registered check finds in error turns from clean to with-errors; one already in error stays one
  const { rc: r2, ids: i2 } = await auditFixture();
  const md = `---\nid: INFO-2026-0009-z\nobject_type: information\n---\n`;
  r2.commit({ bundleId: "INFO-2026-0009-z", type: "information", snapKey: "K1", files: [file("bundle.md", md)] });
  const plain = await r2.auditPass({});
  r2.registerAuditCheck("only", () => [{ check: "O-1", severity: "error", message: "m" }]);
  const all = await r2.auditPass({});
  assert.deepEqual([all.clean, all.withErrors, all.tally["O-1"]], [0, plain.checked, plain.checked]);
  for (const o of all.offenders) {
    const before = (plain.offenders.find((p) => p.bundleId === o.bundleId) || { errors: [] }).errors;
    assert.deepEqual(o.errors, [...before, { check: "O-1", detail: "m" }].slice(0, 5));
  }
  assert.equal(all.offenders.length, Math.min(20, plain.checked));
  assert.deepEqual(Object.fromEntries(Object.entries(all.tally).filter(([k]) => k !== "O-1")), plain.tally, "the catalogue's tally is unchanged");
  void i2;
  assert.equal(new Set(r.offenders.map((o) => o.bundleId)).size, r.offenders.length);
  // R19: a registered check sees only page bundles the viewer may see
  got.length = 0;
  await rc.auditPass({ visible: (id) => id === ids[3] });
  assert.deepEqual(got.map((x) => x.bundleId), [ids[3]]);
  assert.deepEqual(got[0].ctx, {}, "no context given: an empty one");
});

/* ---- T8: R37's `files.content` (N162), R60 ---- */

test("R37: files.content is in the read contract: the live file's inline text exactly as committed, NULL when blob-backed (N162)", () => {
  const { s, rc } = fresh();
  const f = Object.fromEntries(rows(s, `PRAGMA table_info(files)`).map((r) => [r.name, r]));
  assert.equal(f.content.type, "TEXT"); assert.equal(f.content.notnull, 0);
  const id = "INFO-2026-0001-a", text = "---\nid: x\n---\n\n  é 中文 \r\nend\n";
  rc.commit({ bundleId: id, type: "information", snapKey: "K1",
              files: [file("bundle.md", text), { path: "c.pdf", blobSha: "c".repeat(64), bytes: 5, sha256: "c".repeat(64) }] });
  // meaning, read by a later module's own SQL: a scan of the live texts, joined to the bundles contract
  s.db.exec(`CREATE TABLE scan_hits (bundle_id TEXT)`);
  s.sql.exec(`INSERT INTO scan_hits VALUES (?)`, id);
  const got = rows(s, `SELECT f.path, f.content, f.blob_sha, b.object_type FROM scan_hits h JOIN files f ON f.bundle_id = h.bundle_id
                         JOIN bundles b ON b.bundle_id = f.bundle_id ORDER BY f.path`).map((r) => ({ ...r }));
  assert.deepEqual(got, [{ path: "bundle.md", content: text, blob_sha: null, object_type: "information" },
                         { path: "c.pdf", content: null, blob_sha: "c".repeat(64), object_type: "information" }]);
  assert.equal(fileDigestOf({ text: got[0].content }), sha(text), "no trimming or line-ending change: content hashes to the stored digest");
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM files WHERE content LIKE ?`, "%中文%")[0].n, 1, "a scan in SQL finds the text");
  rc.commit({ bundleId: id, type: "information", snapKey: "K2", files: [file("bundle.md", "later")] });
  assert.deepEqual(rows(s, `SELECT content FROM files WHERE bundle_id=?`, id).map((r) => r.content), ["later"], "content is the LIVE file's text");
});

test("R60: textAtSha answers the bundle.md text whose SHA-256 is sha, live or historical, from this module's tables alone; null otherwise, never throwing", () => {
  const { s, rc } = fresh();
  const id = "INFO-2026-0001-a", other = "INFO-2026-0002-b";
  rc.commit({ bundleId: id, type: "information", snapKey: "K1", files: [file("bundle.md", "v1"), file("n.md", "notes")] });
  rc.commit({ bundleId: id, type: "information", snapKey: "K2", files: [file("bundle.md", "v2 é")] });
  rc.commit({ bundleId: id, type: "information", snapKey: "K3", files: [file("bundle.md", "v3")] });
  rc.commit({ bundleId: other, type: "information", snapKey: "K1", files: [file("bundle.md", "b1")] });
  // live, and every historical snapshot
  assert.equal(rc.textAtSha(id, sha("v3")), "v3", "the live file");
  assert.equal(rc.textAtSha(id, sha("v1")), "v1", "a snapshot, once the live file has moved on");
  assert.equal(rc.textAtSha(id, sha("v2 é")), "v2 é");
  assert.equal(rc.textAtSha(id, sha("v1").toUpperCase()), "v1", "a digest is compared as hex, whatever its case");
  // only bundle.md, only this bundle
  assert.equal(rc.textAtSha(id, sha("notes")), null, "another path's text is not bundle.md");
  assert.equal(rc.textAtSha(id, sha("b1")), null, "another bundle's text is not this bundle's");
  assert.equal(rc.textAtSha(other, sha("b1")), "b1");
  assert.equal(rc.textAtSha(id, sha("never held")), null);
  assert.equal(rc.textAtSha("INFO-2099-0000-z", sha("v1")), null, "a bundle not held");
  // an absent argument
  for (const [b, d] of [[null, sha("v1")], ["", sha("v1")], [undefined, sha("v1")], [id, null], [id, ""], [id, undefined], [7, sha("v1")], [id, 7], [{}, []]])
    assert.equal(rc.textAtSha(b, d), null, `${String(b)} / ${String(d)}`);
  // held only as a blob: null; a blob row never hides an inline one with the same digest
  const blobId = "INFO-2026-0003-c", d = "d".repeat(64);
  rc.commit({ bundleId: blobId, type: "information", snapKey: "K1", files: [{ path: "bundle.md", blobSha: d, bytes: 9, sha256: d }] });
  assert.equal(rc.textAtSha(blobId, d), null, "held only as a blob");
  const mixed = "INFO-2026-0004-d";
  rc.commit({ bundleId: mixed, type: "information", snapKey: "K1", files: [file("bundle.md", "inline")] });
  rc.commit({ bundleId: mixed, type: "information", snapKey: "K2", files: [{ path: "bundle.md", blobSha: sha("inline"), bytes: 6, sha256: sha("inline") }] });
  assert.equal(rc.textAtSha(mixed, sha("inline")), "inline", "the live blob row is passed over for the snapshot that holds the text");
  // a row whose stored digest disagrees with its content is never answered as the pinned bytes
  s.sql.exec(`UPDATE history SET sha256=? WHERE bundle_id=? AND snap_key='K2'`, sha("forged"), id);
  assert.equal(rc.textAtSha(id, sha("forged")), null, "its text does not hash to sha");
  assert.equal(rc.textAtSha(id, sha("v1")), null, "and its own bytes are not found by a digest it does not store");
  s.sql.exec(`INSERT INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`, id, "K9", "bundle.md", "v1", null, sha("v1"), "t");
  assert.equal(rc.textAtSha(id, sha("v1")), "v1", "any snapshot that holds the text answers");
  // it reads only this module's tables and writes nothing
  s.db.exec(`CREATE TABLE decoy (bundle_id TEXT, path TEXT, content TEXT, sha256 TEXT)`);
  s.sql.exec(`INSERT INTO decoy VALUES (?, 'bundle.md', 'decoy', ?)`, id, sha("decoy"));
  assert.equal(rc.textAtSha(id, sha("decoy")), null, "another module's table is never read");
  const before = dump(s);
  for (const x of ["v1", "v3", "b1", "none"]) rc.textAtSha(id, sha(x));
  assert.deepEqual(dump(s), before, "it writes nothing");
  assert.equal(recordOf({ storage: storage({ schema: false }) }).textAtSha(id, sha("v1")), null, "never throws: no tables");
  assert.equal(recordOf({ storage: { sql: { exec() { throw new Error("no"); } }, transactionSync: (f) => f() } }).textAtSha(id, sha("v1")), null,
               "never throws: a failing read");
});

/* ---- T9: R37's widened contract (N213), R61 (N219) ---- */

test("R37: files.bytes and blob_sha, bundles.bundle_sha and row_version, history.created and the manifest table hold their stated names, types and meaning (N213)", () => {
  const { s, rc } = fresh();
  const cols = (t) => Object.fromEntries(rows(s, `PRAGMA table_info(${t})`).map((r) => [r.name, r]));
  const f = cols("files"), b = cols("bundles"), h = cols("history"), m = cols("manifest");
  assert.deepEqual([f.bytes.type, f.bytes.notnull], ["INTEGER", 1]); assert.deepEqual([f.blob_sha.type, f.blob_sha.notnull], ["TEXT", 0]);
  assert.deepEqual([b.bundle_sha.type, b.bundle_sha.notnull], ["TEXT", 1]); assert.deepEqual([b.row_version.type, b.row_version.notnull], ["INTEGER", 1]);
  for (const c of ["created", "last_updated"]) assert.deepEqual([b[c].type, b[c].notnull], ["TEXT", 1], `bundles.${c}`);
  assert.deepEqual([h.created.type, h.created.notnull], ["TEXT", 1]);
  for (const [c, notnull] of [["bundle_id", 1], ["snap_key", 1], ["kind", 1], ["base", 0], ["author", 0], ["created", 1], ["writer", 0], ["operation", 0]])
    assert.deepEqual([m[c].type, m[c].notnull], ["TEXT", notnull], `manifest.${c}`);
  assert.deepEqual([m.bundle_id.pk, m.snap_key.pk], [1, 2]);
  assert.ok(rows(s, `SELECT rowid FROM manifest LIMIT 0`), "manifest keeps its rowid");

  // meaning: what commit was given and what it answered, read back in a later module's own SQL
  const id = "INFO-2026-0001-a", text = "é one\r\n", blob = "C".repeat(64);
  const r1 = rc.commit({ bundleId: id, type: "information", snapKey: "Z1", kind: "promotion", base: EMPTY_STRING_SHA, author: "alice",
                         files: [file("bundle.md", text), { path: "c.pdf", blobSha: blob, bytes: 2048, sha256: blob.toLowerCase() }],
                         state: "collected", created: "2026-01-01T00:00:00Z", lastUpdated: "2026-01-01T00:00:00Z", at: "2026-01-01T00:00:00Z" });
  const r2 = rc.commit({ bundleId: id, type: "information", snapKey: "A2", kind: "promotion-replay", base: sha(text), author: "token:x",
                         writer: "monitor", operation: "recheck", files: [file("bundle.md", "two")],
                         state: "verified", lastUpdated: "2026-01-02T00:00:00Z", at: "2026-01-02T00:00:00Z" });
  const r3 = rc.commit({ bundleId: id, type: "information", snapKey: "M3", base: sha("two"), author: "bob",
                         files: [file("bundle.md", "three")], lastUpdated: "2026-01-02T00:00:00Z", at: "2026-01-02T00:00:00Z" });
  assert.deepEqual({ ...rows(s, `SELECT bundle_sha, row_version, created, last_updated FROM bundles WHERE bundle_id=?`, id)[0] },
                   { bundle_sha: r3.bundleSha, row_version: r3.rowVersion, created: "2026-01-01T00:00:00Z", last_updated: "2026-01-02T00:00:00Z" },
                   "bundle_sha and row_version are R41's bundleSha and rowVersion");
  assert.deepEqual([r1.rowVersion, r2.rowVersion, r3.rowVersion], [1, 2, 3], "row_version counts the commits");
  assert.equal(r3.bundleSha, sha("three"));
  const hd = rc.head(id);
  assert.deepEqual([hd.bundleSha, hd.rowVersion], [r3.bundleSha, r3.rowVersion]);

  // files.bytes and blob_sha: the live file's size as commit recorded it, and the blob address, NULL for an inline file
  const second = "INFO-2026-0002-b";
  rc.commit({ bundleId: second, type: "information", snapKey: "K1",
              files: [file("bundle.md", text), { path: "c.pdf", blobSha: blob, bytes: 2048, sha256: blob.toLowerCase() }] });
  assert.deepEqual(rows(s, `SELECT path, content, blob_sha, bytes FROM files WHERE bundle_id=? ORDER BY path`, second).map((r) => ({ ...r })),
                   [{ path: "bundle.md", content: text, blob_sha: null, bytes: Buffer.byteLength(text) },
                    { path: "c.pdf", content: null, blob_sha: blob, bytes: 2048 }]);
  assert.deepEqual(rc.readFile(second, "c.pdf"), { blobSha: blob, bytes: 2048, sha256: blob.toLowerCase() }, "the same figures R13 answers");

  // history.created: the time of the commit that archived the snapshot
  assert.deepEqual(rows(s, `SELECT snap_key, path, created FROM history WHERE bundle_id=? ORDER BY created, snap_key, path`, id).map((r) => ({ ...r })),
                   [{ snap_key: "A2", path: "bundle.md", created: "2026-01-02T00:00:00Z" },
                    { snap_key: "A2", path: "c.pdf", created: "2026-01-02T00:00:00Z" },
                    { snap_key: "M3", path: "bundle.md", created: "2026-01-02T00:00:00Z" }]);

  // manifest: R42's entry, and rowid ranks a bundle's entries in the order they were recorded (R16), whatever the keys or times
  const man = rows(s, `SELECT rowid AS r, bundle_id, snap_key, kind, base, author, created, writer, operation FROM manifest
                        WHERE bundle_id=? ORDER BY created, rowid`, id).map(({ r, ...x }) => ({ ...x }));
  assert.deepEqual(man, [
    { bundle_id: id, snap_key: "Z1", kind: "promotion", base: EMPTY_STRING_SHA, author: "alice", created: "2026-01-01T00:00:00Z", writer: null, operation: null },
    { bundle_id: id, snap_key: "A2", kind: "promotion-replay", base: sha(text), author: "token:x", created: "2026-01-02T00:00:00Z", writer: "monitor", operation: "recheck" },
    { bundle_id: id, snap_key: "M3", kind: "promotion", base: sha("two"), author: "bob", created: "2026-01-02T00:00:00Z", writer: null, operation: null },
  ], "the tie under created is broken by rowid, in write order, never by the snap key");
  for (const e of man) {
    const got = rc.manifestEntry(id, e.snap_key);
    assert.deepEqual([got.kind, got.base, got.author, got.created, got.writer, got.operation],
                     [e.kind, e.base, e.author, e.created, e.writer, e.operation], `manifest row ${e.snap_key} is R42's entry`);
  }
  const ranked = rows(s, `SELECT snap_key FROM manifest WHERE bundle_id=? ORDER BY rowid`, id).map((r) => r.snap_key);
  assert.deepEqual(ranked, ["Z1", "A2", "M3"]);
  assert.deepEqual(ranked.map((k) => rc.manifestEntry(id, k).seq), [1, 2, 3], "rowid order is R16's seq");
  // a purge of one bundle and a later commit keep the ranking in recording order
  rc.purge({ bundleId: second });
  rc.commit({ bundleId: id, type: "information", snapKey: "B4", base: sha("three"), author: "c", files: [file("bundle.md", "four")] });
  assert.deepEqual(rows(s, `SELECT snap_key FROM manifest WHERE bundle_id=? ORDER BY rowid`, id).map((r) => r.snap_key), ["Z1", "A2", "M3", "B4"]);
});

test("R61 R30: releaseLease refuses an empty or non-string actor with ANONYMOUS_LEASE, as R10, and changes nothing", () => {
  const { s, rc } = fresh();
  const id = "INFO-2026-0001-a";
  put(rc, id, "K1");
  rc.acquireLease(id, "alice", 60000);
  const before = dump(s);
  for (const who of ["", "   ", null, undefined, 7, {}, ["alice"]]) {
    const r = rc.releaseLease(id, who);
    assert.deepEqual([r.ok, r.reason], [false, "ANONYMOUS_LEASE"]);
    assert.deepEqual(r, rc.acquireLease(id, who, 1000), "the same refusal R10 gives");
  }
  assert.deepEqual(dump(s), before);
});

test("R61 R11: releaseLease ends the actor's own lease, live or expired, so no one is refused until a lease is taken again", () => {
  const { s, rc } = fresh();
  const id = "INFO-2026-0001-a", other = "INFO-2026-0002-b";
  put(rc, id, "K1");
  rc.acquireLease(id, "alice", 60000);
  rc.acquireLease(other, "alice", 60000);
  assert.equal(rc.acquireLease(id, "bob", 60000).heldBy, "alice");
  assert.deepEqual(rc.releaseLease(id, "alice"), { ok: true, released: true });
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM leases WHERE bundle_id=?`, id)[0].n, 0);
  assert.equal(rc.acquireLease(id, "bob", 60000).ok, true, "R11 refuses no one once it is released");
  assert.equal(rc.acquireLease(other, "bob", 60000).heldBy, "alice", "a lease on another bundle is untouched");
  // an expired lease of its own is ended too
  rc.acquireLease(other, "alice", -1);
  assert.deepEqual(rc.releaseLease(other, "alice"), { ok: true, released: true });
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM leases WHERE bundle_id=?`, other)[0].n, 0);
  // released again, or on a bundle never leased: nothing to end
  assert.deepEqual(rc.releaseLease(other, "alice"), { ok: true, released: false });
  assert.deepEqual(rc.releaseLease("INFO-2099-0000-z", "alice"), { ok: true, released: false });
});

test("R61: releaseLease leaves a lease held by another actor as it is, live or expired, and never throws", () => {
  const { s, rc } = fresh();
  const id = "INFO-2026-0001-a";
  put(rc, id, "K1");
  const held = rc.acquireLease(id, "alice", 60000);
  const before = dump(s);
  assert.deepEqual(rc.releaseLease(id, "bob"), { ok: true, released: false });
  assert.deepEqual(rc.releaseLease(id, "Alice"), { ok: true, released: false }, "the actor is matched exactly");
  assert.deepEqual(dump(s), before, "the holder's lease is as it was");
  assert.deepEqual(rc.acquireLease(id, "bob", 60000), { ok: false, heldBy: "alice", until: held.expires });
  rc.acquireLease(id, "alice", -1);
  const expired = dump(s);
  assert.deepEqual(rc.releaseLease(id, "bob"), { ok: true, released: false });
  assert.deepEqual(dump(s), expired, "an expired lease of another actor is left too");
  // never throws: no tables, a failing store, a bundle id SQL cannot bind
  assert.deepEqual(recordOf({ storage: storage({ schema: false }) }).releaseLease(id, "alice"), { ok: true, released: false });
  const broken = { sql: { exec() { throw new Error("no"); } }, transactionSync: (fn) => fn() };
  assert.deepEqual(recordOf({ storage: broken }).releaseLease(id, "alice"), { ok: true, released: false });
  assert.deepEqual(rc.releaseLease({ not: "an id" }, "alice"), { ok: true, released: false });
  assert.equal(typeof rc.releaseLease, "function");
});

/* ---- T11: R37's `bundles.group_id` and `bundles.prior_state` (N287), the plane's shape (K313, K316) ---- */

test("R37 R44: bundles.group_id and bundles.prior_state hold their stated names, types and meaning, read in a later module's own SQL (N287)", () => {
  const { s, rc } = fresh();
  const b = Object.fromEntries(rows(s, `PRAGMA table_info(bundles)`).map((r) => [r.name, r]));
  assert.deepEqual([b.group_id.type, b.group_id.notnull], ["TEXT", 1]);
  assert.deepEqual([b.prior_state.type, b.prior_state.notnull], ["TEXT", 0]);
  const a = "INFO-2026-0001-a", n = "INFO-2026-0002-b", z = "INFO-2026-0003-c";
  const c = (id, k, more) => rc.commit({ bundleId: id, type: "information", snapKey: k, files: [file("bundle.md", `${id}${k}`)], ...more });
  // a later module's own SQL: a projection of its own joined to the contract's columns (retrieval, query-language, inquiry)
  s.db.exec(`CREATE TABLE later_projection (bundle_id TEXT)`);
  for (const id of [a, n, z]) s.sql.exec(`INSERT INTO later_projection VALUES (?)`, id);
  const read = (id) => ({ ...rows(s, `SELECT b.group_id, b.prior_state FROM later_projection p JOIN bundles b ON b.bundle_id = p.bundle_id
                                        WHERE p.bundle_id = ?`, id)[0] });
  const agrees = (id) => { const h = rc.head(id), r = read(id); assert.deepEqual([h.groupId, h.priorState], [r.group_id, r.prior_state], `head(${id}) reads the same columns`); };

  // at creation: the group as given, or the empty string naming none; prior_state NULL when none was given
  c(a, "K1", { state: "collected", group: "grp-1" });
  c(n, "K1", { state: "collected" });
  c(z, "K1", { state: "collected", group: null, priorState: "draft" });
  assert.deepEqual(read(a), { group_id: "grp-1", prior_state: null });
  assert.deepEqual(read(n), { group_id: "", prior_state: null }, "a bundle created naming no group: the empty string");
  assert.deepEqual(read(z), { group_id: "", prior_state: "draft" }, "a null group names none; a prior state given at creation is kept");
  assert.deepEqual(rows(s, `SELECT bundle_id FROM bundles WHERE group_id = '' ORDER BY bundle_id`).map((r) => r.bundle_id), [n, z]);

  // a later commit that gives no group keeps it, whether it leaves group out or gives null; prior_state is as last given
  c(a, "K2", { state: "verified", priorState: "collected" });
  assert.deepEqual(read(a), { group_id: "grp-1", prior_state: "collected" });
  c(a, "K3", { state: "verified", group: null });
  assert.deepEqual(read(a), { group_id: "grp-1", prior_state: "collected" }, "group null keeps it; priorState absent keeps it");
  c(a, "K4", { state: "archived", priorState: "verified", group: "grp-2" });
  assert.deepEqual(read(a), { group_id: "grp-2", prior_state: "verified" }, "a group given replaces it");
  c(a, "K5", { state: "archived", priorState: null });
  assert.deepEqual(read(a), { group_id: "grp-2", prior_state: null }, "a prior state given as null is recorded as NULL");
  c(n, "K2", { state: "verified", priorState: "collected", group: "grp-3" });
  assert.deepEqual(read(n), { group_id: "grp-3", prior_state: "collected" }, "a group first given later is recorded");
  for (const id of [a, n, z]) agrees(id);

  // the columns' meaning survives the store's other writes: a lease, a purge of another bundle, a later module's divide by group
  rc.acquireLease(a, "m", 1000); rc.purge({ bundleId: z });
  assert.deepEqual(rows(s, `SELECT b.group_id, COUNT(*) AS n FROM later_projection p JOIN bundles b ON b.bundle_id = p.bundle_id
                            GROUP BY b.group_id ORDER BY b.group_id`).map((r) => [r.group_id, r.n]), [["grp-2", 1], ["grp-3", 1]]);
  assert.equal(rc.head(a).rowVersion, 5, "every commit above was taken whole, none refused");
});

test("R40 R28: seedMintLedger learns live ids under the plane's 50-byte LIKE/GLOB cap, whatever the prefix's length or characters (K313)", () => {
  const { s, rc } = fresh();
  const long = "X".repeat(60), odd = "A*[";
  s.db.exec(`CREATE TABLE live (id TEXT)`);
  s.sql.exec(`INSERT INTO live VALUES (?), (?), (?), (?)`, `${long}-2026-0003`, `${odd}-2026-0004`, "AB-2026-0005", "AZZZ-2026-0006");
  assert.doesNotThrow(() => rc.seedMintLedger([[long, "live", "id"], [odd, "live", "id"]]));
  assert.equal(draws([3, 4], () => rc.mintOpaqueId(long, "2026", "", () => false)), `${long}-2026-0004`, "a long prefix's live id was learned");
  assert.equal(draws([4, 7], () => rc.mintOpaqueId(odd, "2026", "", () => false)), `${odd}-2026-0007`, "a prefix is matched literally");
  assert.equal(draws([5], () => rc.mintOpaqueId("AB", "2026", "", () => false)), "AB-2026-0005",
               "a prefix with pattern characters matched nothing else: A*[ is not A-anything");
  // the fixture holds workerd's cap: a pattern over 50 bytes is refused, as on the plane
  assert.throws(() => s.sql.exec(`SELECT 1 FROM live WHERE id GLOB ?`, "Y".repeat(51)), /pattern too complex/);
});

/* ---- T13: R62 `mintExhausted`, its row C-59.6 (N322, N250) ---- */

const MINT_EXHAUSTED_TRANSLATION = 'The plane could not find a free identifier for this, so nothing was saved and nothing was '
  + 'issued. Identifiers are drawn at random so that none of them says how many others exist, and every '
  + 'one it tried was already taken. Trying again may succeed; if it keeps happening, tell whoever runs '
  + 'this instance.';

test("R62: mintExhausted is the one answer when mintOpaqueId answers null: MINT_EXHAUSTED under its row C-59.6, one fixed detail per opaque-minted prefix", () => {
  const row = RECORD_CORE_CHECKS.MINT_EXHAUSTED;
  assert.deepEqual({ ...row }, { check: "C-59.6", where: "src/record-core/index.mjs mintExhausted > is-mint-exhausted",
                                 translation: MINT_EXHAUSTED_TRANSLATION },
                   "its one row is this module's, its where naming this function, with review's C-87.12 translation");
  assert.ok(Object.isFrozen(RECORD_CORE_CHECKS) && Object.isFrozen(row));
  const names = { PROJ: "project", CASE: "case", DRAFT: "draft", RVG: "grant", TASK: "task", SRC: "source" };
  assert.deepEqual(Object.keys(names), [...RecordCore.GATED_ID_PREFIXES, "SRC"], "every prefix of R3's set, and a source's (N376)");
  const details = new Set();
  for (const [p, what] of Object.entries(names)) {
    const r = mintExhausted(p);
    assert.deepEqual(r, { ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check: "C-59.6", translation: MINT_EXHAUSTED_TRANSLATION,
                          prefix: p, detail: `the plane could not find a free ${what} id: every one it drew was already taken. Nothing was written.` });
    assert.deepEqual(mintExhausted(p), r, "the same answer for every caller, every time");
    assert.deepEqual(mintExhausted(p, undefined), r);
    assert.ok(!/\d/.test(r.detail), "the detail names no count and no id");
    details.add(r.detail);
  }
  assert.equal(details.size, 6, "one sentence per prefix");
  // the condition: exactly when mintOpaqueId answers null (R9), and the store is left as the refused act left it
  const { s, rc } = fresh();
  for (const p of Object.keys(names)) {
    const before = dump(s);
    const r = rc.transact(() => {
      const id = rc.mintOpaqueId(p, "2026", p === "PROJ" || p === "TASK" ? "-slug" : "", () => true);
      assert.equal(id, null);
      return id ? { ok: true, id } : mintExhausted(p);
    });
    assert.deepEqual(r, mintExhausted(p));
    assert.deepEqual(dump(s), before, "a refused act that answers through it has written nothing");
  }
});

test("R62: mintExhausted's extra adds a caller's own fields and never replaces its own; it writes nothing and never throws", () => {
  const own = mintExhausted("CASE");
  const r = mintExhausted("CASE", { draftId: "DRAFT-2026-0001", op: "publish", ok: true, reason: "X", code: "Y", check: "C-0.0",
                                     translation: "t", prefix: "PROJ", detail: "mine" });
  assert.deepEqual(r, { ...own, draftId: "DRAFT-2026-0001", op: "publish" }, "a caller's own fields beside, never over, the answer's");
  // it writes nothing: a store it could reach is unchanged, and it holds none of its own
  const { s } = fresh();
  const before = dump(s);
  for (const p of [...RecordCore.GATED_ID_PREFIXES, "INFO"]) mintExhausted(p, { a: 1 });
  assert.deepEqual(dump(s), before);
  // never throws: any prefix, any extra
  const hostile = new Proxy({}, { ownKeys() { throw new Error("keys"); } });
  const getter = Object.defineProperty({}, "boom", { enumerable: true, get() { throw new Error("get"); } });
  for (const p of ["INFO", "", "proj", "PROJ-X", undefined, null, 7, {}, ["CASE"]])
    for (const extra of [undefined, null, "str", 5, [1, 2], hostile, getter, { x: 1 }]) {
      let a;
      assert.doesNotThrow(() => { a = mintExhausted(p, extra); }, `${String(p)} / ${typeof extra}`);
      assert.deepEqual([a.ok, a.reason, a.code, a.check, a.translation], [false, "MINT_EXHAUSTED", "MINT_EXHAUSTED", "C-59.6", MINT_EXHAUSTED_TRANSLATION]);
      assert.equal(typeof a.prefix, "string");
      assert.equal(a.detail, "the plane could not find a free id: every one it drew was already taken. Nothing was written.",
                   "a prefix outside R3's set names no object");
    }
  assert.equal(mintExhausted("INFO", { x: 1 }).x, 1);
  assert.equal(mintExhausted("INFO").prefix, "INFO");
  assert.equal(mintExhausted(["CASE"]).prefix, "", "only a string names a prefix");
});

test("R62 (N376): mintExhausted(\"SRC\") names a source, as sources answers when no source id can be drawn; SRC stays outside R3's gated set", () => {
  const r = mintExhausted("SRC");
  assert.deepEqual(r, { ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check: "C-59.6", translation: MINT_EXHAUSTED_TRANSLATION,
                        prefix: "SRC", detail: "the plane could not find a free source id: every one it drew was already taken. Nothing was written." });
  assert.notEqual(r.detail, mintExhausted("INFO").detail, "no longer the unnamed sentence of a prefix outside the set");
  for (const near of ["SRCE", "src", "SRC-X", " SRC"]) assert.doesNotMatch(mintExhausted(near).detail, /source/, `${near} is not SRC`);
  assert.deepEqual(mintExhausted("SRC", { op: "sourceadd", prefix: "X" }), { ...r, op: "sourceadd" }, "extra never replaces its own");
  // as the sources act meets it: a transaction whose minter answers null leaves nothing written and answers through here
  const { s, rc } = fresh();
  const before = dump(s);
  const got = rc.transact(() => rc.mintOpaqueId("SRC", "2026", "", () => true) ?? mintExhausted("SRC"));
  assert.deepEqual(got, r);
  assert.deepEqual(dump(s), before);
  // naming a source changes no gate and no row: SRC is minted opaque, never refused by allocIdOp (R3), and the row is C-59.6's
  assert.ok(!RecordCore.GATED_ID_PREFIXES.includes("SRC"));
  assert.equal(RECORD_CORE_CHECKS.MINT_EXHAUSTED.check, "C-59.6", "the one row of the condition, whatever else the table holds");
});

/* R62's other half, every act that answers no free opaque id answering through `mintExhausted`, is met since T13 (K441):
   each caller tests it at its own interface (promotion R19, case-authoring R7, review R27, tasks R1, which took queue's
   R23; sources joins them for `SRC`, N376), so the todo that stood here for it is retired (RECORD-CORE #8). */

/* ---- T14: R63 `registerCounts`, `counts`; its rows C-102.13, C-102.14 (N342) ---- */

const COUNTS_DECLARED_TRANSLATION = 'A part of this instance tried to report a figure another part already reports, or to register its '
  + 'figures twice, so the second registration was refused and the first still stands. This is a fault in how the '
  + 'instance was built, not in the record, and nothing in the record changed.';
const COUNTS_MALFORMED_TRANSLATION = 'A part of this instance tried to register its figures without naming itself, the figures or a '
  + 'function to count them, so nothing was registered. This is a fault in how the instance was built, not in the '
  + 'record, and nothing in the record changed.';

test("R63: counts answers every registered key in registration order, each its module's number, with hid passed on unchanged", () => {
  const { s, rc } = fresh();
  assert.deepEqual(rc.counts(null), {}, "nothing registered: no figures");
  s.db.exec(`CREATE TABLE widgets (bundle_id TEXT); CREATE TABLE gadgets (k TEXT)`);
  s.sql.exec(`INSERT INTO widgets VALUES ('INFO-2026-0001-a'), ('INFO-2026-0002-b'), (NULL)`);
  s.sql.exec(`INSERT INTO gadgets VALUES ('g1'), ('g2')`);
  const asked = [];
  const c = (q, ...a) => Number([...s.sql.exec(q, ...a)][0].c);
  // a module's own counts, subtracting the hidden bundles by its own key, as bias R42 does
  const widgets = (hid) => {
    asked.push(["w", hid]);
    return hid ? { widgets: c(`SELECT count(*) AS c FROM widgets WHERE COALESCE(bundle_id, '') NOT IN ${hid.sql}`, ...hid.args), widgetKinds: 1 }
               : { widgets: c(`SELECT count(*) AS c FROM widgets`), widgetKinds: 1 };
  };
  const gadgets = (hid) => { asked.push(["g", hid]); return { gadgets: c(`SELECT count(*) AS c FROM gadgets`), ignored: 99 }; };
  assert.deepEqual(rc.registerCounts("gadgetry", ["gadgets"], gadgets), { ok: true, module: "gadgetry", keys: ["gadgets"] });
  assert.deepEqual(rc.registerCounts("widgetry", ["widgets", "widgetKinds"], widgets), { ok: true, module: "widgetry", keys: ["widgets", "widgetKinds"] });
  const whole = rc.counts(null);
  assert.deepEqual(whole, { gadgets: 2, widgets: 3, widgetKinds: 1 });
  assert.deepEqual(Object.keys(whole), ["gadgets", "widgets", "widgetKinds"], "registration order, then each list's order");
  assert.ok(!("ignored" in whole), "only the registered keys are answered");
  const hid = { sql: "(?)", args: ["INFO-2026-0001-a"] };
  asked.length = 0;
  assert.deepEqual(rc.counts(hid), { gadgets: 2, widgets: 2, widgetKinds: 1 });
  assert.equal(asked.length, 2, "each function asked once per answer, not once per key");
  assert.ok(asked.every(([, h]) => h === hid), "hid reaches each function as the caller gave it, the same object");
  asked.length = 0;
  rc.counts();
  assert.ok(asked.every(([, h]) => h === null), "no hid given: null");
  // the same instance for every caller in the object (R39): a registration through one handle is answered by another
  assert.deepEqual(recordOf({ storage: s }).counts(null), whole);
  // the figures follow the tables: counts reads at each answer, never a copy taken at registration
  s.sql.exec(`INSERT INTO gadgets VALUES ('g3')`);
  assert.equal(rc.counts(null).gadgets, 3);
});

test("R63: a figure that could not be read is null, never zero, and counts never throws", () => {
  const { rc } = fresh();
  const getter = Object.defineProperty({ ok: 4 }, "boom", { enumerable: true, get() { throw new Error("get"); } });
  const fns = [
    ["throws", ["t1", "t2"], () => { throw new Error("no table"); }],
    ["nothing", ["n1"], () => undefined],
    ["scalar", ["s1"], () => 7],
    ["partial", ["p1", "p2", "p3", "p4", "p5", "p6", "p7"], () => ({ p1: 0, p2: "5", p3: NaN, p4: Infinity, p5: null, p6: 5n })],
    ["getter", ["ok", "boom"], () => getter],
    ["zero", ["z"], () => ({ z: 0 })],
    ["negative", ["neg", "frac"], () => ({ neg: -1, frac: 2.5 })],
    ["inherited", ["toString", "__proto__"], () => ({})],
    ["async", ["a1"], async () => ({ a1: 1 })],
    ["rejects", ["r1"], async () => { throw new Error("later"); }],
  ];
  for (const [m, keys, f] of fns) assert.equal(rc.registerCounts(m, keys, f).ok, true, m);
  let got;
  assert.doesNotThrow(() => { got = rc.counts(null); });
  assert.deepEqual(Object.entries(got), [["t1", null], ["t2", null], ["n1", null], ["s1", null],
    ["p1", 0], ["p2", null], ["p3", null], ["p4", null], ["p5", null], ["p6", null], ["p7", null],
    ["ok", 4], ["boom", null], ["z", 0], ["neg", -1], ["frac", 2.5], ["toString", null], ["__proto__", null], ["a1", null], ["r1", null]]);
  assert.equal(Object.getPrototypeOf(got), Object.prototype, "a key named __proto__ is an own figure, never the answer's prototype");
  for (const hid of [undefined, null, 7, "x", { sql: 1 }]) assert.doesNotThrow(() => rc.counts(hid));
});

test("R63: a key already held, a key named twice and a module's second registration are COUNTS_DECLARED (C-102.13), naming the holder; nothing is registered", () => {
  const { rc } = fresh();
  const row = RECORD_CORE_CHECKS.COUNTS_DECLARED;
  assert.deepEqual({ ...row }, { check: "C-102.13", where: "src/record-core/index.mjs registerCounts > is-counts-registration",
                                 translation: COUNTS_DECLARED_TRANSLATION });
  assert.ok(Object.isFrozen(row));
  assert.equal(rc.registerCounts("queue", ["tasks", "queueState"], () => ({ tasks: 1, queueState: 2 })).ok, true);
  const answer = () => rc.counts(null);
  const before = answer();
  const cases = [
    ["bias", ["biasStatements", "tasks"], { module: "bias", key: "tasks", heldBy: "queue" }],
    ["bias", ["queueState"], { module: "bias", key: "queueState", heldBy: "queue" }],
    ["queue", ["other"], { module: "queue", heldBy: "queue" }],
    ["bias", ["x", "y", "x"], { module: "bias", key: "x", heldBy: "bias" }],
  ];
  for (const [m, keys, named] of cases) {
    const r = rc.registerCounts(m, keys, () => ({ biasStatements: 9, x: 1, y: 1, other: 1 }));
    assert.deepEqual({ ...r, detail: null }, { ...named, ok: false, reason: "COUNTS_DECLARED", code: "COUNTS_DECLARED", check: "C-102.13",
                                              translation: COUNTS_DECLARED_TRANSLATION, detail: null }, `${m} ${keys}`);
    assert.equal(typeof r.detail, "string"); assert.ok(r.detail.includes(named.heldBy), "the detail names the holder");
    assert.deepEqual(answer(), before, "a refused registration registered nothing, not even its other keys");
  }
  assert.deepEqual(rc.registerCounts("bias", ["biasStatements", "x", "y"], () => ({ biasStatements: 9, x: 1, y: 1 })).ok, true,
                   "the refused module may still register once, with keys no one holds");
  assert.deepEqual(answer(), { tasks: 1, queueState: 2, biasStatements: 9, x: 1, y: 1 });
  // a caller's list changed after registration changes nothing registered
  const keys = ["late"];
  rc.registerCounts("later", keys, () => ({ late: 3, tasks: 100 }));
  keys.push("tasks");
  assert.deepEqual(answer(), { tasks: 1, queueState: 2, biasStatements: 9, x: 1, y: 1, late: 3 });
});

test("R63: a registration without a module name, a non-empty list of names or a function is COUNTS_MALFORMED (C-102.14), registering nothing", () => {
  const { rc } = fresh();
  const row = RECORD_CORE_CHECKS.COUNTS_MALFORMED;
  assert.deepEqual({ ...row }, { check: "C-102.14", where: "src/record-core/index.mjs registerCounts > is-counts-registration",
                                 translation: COUNTS_MALFORMED_TRANSLATION });
  assert.ok(Object.isFrozen(row) && Object.isFrozen(RECORD_CORE_CHECKS));
  const f = () => ({ k: 1 });
  const bad = [["", ["k"], f], ["  ", ["k"], f], [null, ["k"], f], [7, ["k"], f], [undefined, ["k"], f],
               ["m", [], f], ["m", "k", f], ["m", null, f], ["m", undefined, f], ["m", ["k", ""], f], ["m", ["k", 3], f], ["m", [" "], f],
               ["m", ["k"], null], ["m", ["k"], "fn"], ["m", ["k"], { k: 1 }], ["m", ["k"], undefined]];
  for (const [m, keys, fn] of bad) {
    const r = rc.registerCounts(m, keys, fn);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "COUNTS_MALFORMED", "COUNTS_MALFORMED", "C-102.14", COUNTS_MALFORMED_TRANSLATION],
                     `${String(m)} / ${JSON.stringify(keys)} / ${typeof fn}`);
    assert.equal(typeof r.detail, "string");
    assert.deepEqual(rc.counts(null), {}, "nothing was registered");
  }
  assert.deepEqual(rc.registerCounts("m", ["k"], f), { ok: true, module: "m", keys: ["k"] }, "a malformed attempt holds nothing: m registers once");
  assert.deepEqual(rc.counts(null), { k: 1 });
});

test("R63: a refusal's own fields are never replaced by what it names, and neither service writes anything", () => {
  const { s, rc } = fresh();
  const before = dump(s);
  // a module named like a refusal's fields, and keys shaped like them, leave code, check and translation as the row gives them
  rc.registerCounts("check", ["check", "translation", "ok"], () => ({ check: 1, translation: 2, ok: 3 }));
  const r = rc.registerCounts("code", ["check"], () => ({}));
  assert.deepEqual([r.ok, r.code, r.check, r.translation, r.module, r.key, r.heldBy], [false, "COUNTS_DECLARED", "C-102.13", COUNTS_DECLARED_TRANSLATION, "code", "check", "check"]);
  rc.counts(null); rc.counts({ sql: "(?)", args: ["x"] });
  assert.deepEqual(dump(s), before, "registering and counting write nothing");
  // the registrations are this instance's, not the module's: another storage's instance holds none
  assert.deepEqual(recordOf({ storage: storage() }).counts(null), {});
});

/* ---- T18: the rows held here (C-75 moved; C-59.5, C-102.1–.3 copied), R66 `afterCommit` (N406), R67 the grammar
   seam (§1b), R64/R65 `op=stats`' disclosure (K621), and R28's caller half (the `mint-ledger` convert) ---- */

const BUILD_FAULT = "This is a fault in how the instance was built, not in the record, and nothing in the record changed.";

test("R55 R50 R52: C-75's five rows are this module's own table, PER_ITEM_CHECKS, each where naming perItem's region, and the catalogue holds them no more", () => {
  assert.deepEqual(Object.keys(PER_ITEM_CHECKS), ["SET_NO_ITEMS", "SET_TOO_LARGE", "SET_ITEM_MALFORMED", "SET_ITEM_FAILED", "SET_ITEMS_RETAINED"]);
  const want = { SET_NO_ITEMS: ["C-75.1", "is-per-item-set-shape"], SET_TOO_LARGE: ["C-75.2", "is-per-item-set-shape"],
                 SET_ITEM_MALFORMED: ["C-75.3", "is-per-item-malformed"], SET_ITEM_FAILED: ["C-75.4", "is-per-item-failed"],
                 SET_ITEMS_RETAINED: ["C-75.5", "is-per-item-retained"] };
  for (const [code, [check, region]] of Object.entries(want)) {
    const row = PER_ITEM_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, `src/record-core/index.mjs perItem > ${region}`], code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40 && !/C-75|SET_/.test(row.translation), `${code}: a member's sentence`);
    assert.ok(Object.isFrozen(row));
  }
  assert.ok(Object.isFrozen(PER_ITEM_CHECKS));
  // every refusal perItem answers carries its row's check and translation, read from this table
  const cases = [perItem("x", {}, {}, () => ({ ok: true })), perItem("x", { items: Array.from({ length: 101 }, () => ({})) }, {}, () => ({ ok: true })),
                 perItem("x", { items: [7] }, {}, () => ({ ok: true })).items[0], perItem("x", { items: [{}] }, {}, () => { throw new Error("t"); }).items[0],
                 perItem("x", { items: [{}] }, {}, () => ({ ok: false }))];
  assert.deepEqual(cases.map((r) => [r.code ?? r.reason, r.check, r.translation]),
                   ["SET_NO_ITEMS", "SET_TOO_LARGE", "SET_ITEM_MALFORMED", "SET_ITEM_FAILED", "SET_ITEMS_RETAINED"]
                     .map((c) => [c, PER_ITEM_CHECKS[c].check, PER_ITEM_CHECKS[c].translation]));
});

test("R3 R27: ALLOCID_PREFIX_GATED's row C-59.5 is held here, its where naming allocIdOp's region, and the refusal carries it", () => {
  const row = RECORD_CORE_CHECKS.ALLOCID_PREFIX_GATED;
  assert.deepEqual([row.check, row.where], ["C-59.5", "src/record-core/index.mjs allocIdOp > is-allocid-prefix-gated"]);
  assert.equal(row.translation, "Ids of this kind are given by the record when the thing itself is created, and are not handed out in "
    + "advance. Create the project, case, draft, grant or task through its own action and the record will answer with its id. "
    + "Nothing was allocated.", "copied unchanged from the catalogue's PROJECT_ID_CHECKS (T18)");
  const r = fresh().rc.allocIdOp("CASE", "2026");
  assert.deepEqual([r.code, r.check, r.translation], ["ALLOCID_PREFIX_GATED", "C-59.5", row.translation]);
});

test("R59: registerAuditCheck's refusals carry their code and rows C-102.1 and C-102.2, and a check that threw leaves C-102.3's AUDIT_CHECK_FAILED", async () => {
  /* copied unchanged from the catalogue's REGISTRATION_CHECKS (T18) */
  assert.deepEqual(["AUDIT_CHECK_DECLARED", "AUDIT_CHECK_MALFORMED", "AUDIT_CHECK_FAILED"].map((c) => RECORD_CORE_CHECKS[c].translation), [
    "A part of this instance tried to register its audit check a second time. Each part registers once, when it starts, so the "
      + "second was refused and the first still runs. " + BUILD_FAULT,
    "A part of this instance tried to register an audit check without naming itself or without a check to run, so nothing "
      + "was registered. " + BUILD_FAULT,
    "One of the checks the audit runs over this document stopped with an error instead of answering, so the document is "
      + "counted as having an error rather than as clean. The error is in the check and says nothing yet about the document. "
      + "The audit changes nothing in the record."]);
  assert.deepEqual(["AUDIT_CHECK_DECLARED", "AUDIT_CHECK_MALFORMED", "AUDIT_CHECK_FAILED"].map((c) => [RECORD_CORE_CHECKS[c].check, RECORD_CORE_CHECKS[c].where]),
    [["C-102.1", "src/record-core/index.mjs registerAuditCheck > is-audit-check-registration"],
     ["C-102.2", "src/record-core/index.mjs registerAuditCheck > is-audit-check-registration"],
     ["C-102.3", "src/record-core/index.mjs auditPass > is-audit-check-failed"]]);
  const { rc } = fresh();
  const bad = rc.registerAuditCheck("", () => []);
  assert.deepEqual([bad.ok, bad.reason, bad.code, bad.check, bad.translation], [false, "AUDIT_CHECK_MALFORMED", "AUDIT_CHECK_MALFORMED", "C-102.2", RECORD_CORE_CHECKS.AUDIT_CHECK_MALFORMED.translation]);
  assert.equal(rc.registerAuditCheck("m", () => []).ok, true);
  const twice = rc.registerAuditCheck("m", () => []);
  assert.deepEqual([twice.ok, twice.reason, twice.code, twice.check, twice.module], [false, "AUDIT_CHECK_DECLARED", "AUDIT_CHECK_DECLARED", "C-102.1", "m"]);
  assert.equal(typeof twice.detail, "string");
});

/* ---- R66: afterCommit ---- */

test("R66: outside any transact, afterCommit runs fn at once; inside one it runs just after the outermost commit, before transact returns, in call order", () => {
  const { s, rc } = fresh();
  const log = [];
  rc.afterCommit(() => log.push("now"));
  assert.deepEqual(log, ["now"], "no transaction open: run at once");
  const seen = [];
  const out = rc.transact(() => {
    rc.allocId("INQ", "2026");
    rc.afterCommit(() => { log.push("a"); seen.push(rows(s, `SELECT next FROM seq WHERE scope='INQ-2026'`)[0].next); });
    rc.transact(() => { rc.afterCommit(() => log.push("b")); return { ok: true }; });
    rc.afterCommit(() => log.push("c"));
    assert.deepEqual(log, ["now"], "nothing held runs inside the transaction");
    return { ok: true, v: 1 };
  });
  assert.deepEqual(log, ["now", "a", "b", "c"], "held calls ran, in the order they were made, the committed savepoint's with them");
  assert.deepEqual(out, { ok: true, v: 1 }, "transact's answer is fn's");
  assert.deepEqual(seen, [2], "a held call sees what the transaction committed");
  // before transact returns: the caller's next line sees it done
  const order = [];
  rc.transact(() => { rc.afterCommit(() => order.push("held")); return 1; });
  order.push("returned");
  assert.deepEqual(order, ["held", "returned"]);
  // a held call that opens its own transaction and holds again: that one is its own outermost
  const nested = [];
  rc.transact(() => { rc.afterCommit(() => { rc.transact(() => { rc.afterCommit(() => nested.push("inner")); return 1; }); nested.push("outer"); }); return 1; });
  assert.deepEqual(nested, ["inner", "outer"]);
});

test("R66 R32: a held call is dropped when the transaction, or the savepoint holding it, rolls back by a throw or a refusal", () => {
  const { rc } = fresh();
  const log = [];
  assert.throws(() => rc.transact(() => { rc.afterCommit(() => log.push("thrown")); throw new Error("x"); }), /x/);
  assert.deepEqual(rc.transact(() => { rc.afterCommit(() => log.push("refused")); return { ok: false, reason: "NO" }; }), { ok: false, reason: "NO" });
  assert.deepEqual(log, [], "neither a throw nor a refusal runs what it held");
  // a savepoint rolled back under a committing outer: only the savepoint's held calls are dropped
  rc.transact(() => {
    rc.afterCommit(() => log.push("outer-1"));
    rc.transact(() => { rc.afterCommit(() => log.push("refused-inner")); return { ok: false }; });
    try { rc.transact(() => { rc.afterCommit(() => log.push("thrown-inner")); throw new Error("inner"); }); } catch { /* the outer decides the rest */ }
    rc.transact(() => { rc.afterCommit(() => log.push("kept-inner")); return { ok: true }; });
    rc.afterCommit(() => log.push("outer-2"));
    return { ok: true };
  });
  assert.deepEqual(log, ["outer-1", "kept-inner", "outer-2"]);
  // a savepoint that committed hands its calls up, and the outer's rollback drops them after all
  log.length = 0;
  assert.throws(() => rc.transact(() => { rc.transact(() => { rc.afterCommit(() => log.push("handed-up")); return { ok: true }; }); throw new Error("outer"); }));
  assert.deepEqual(rc.transact(() => { rc.transact(() => { rc.afterCommit(() => log.push("handed-up-2")); return 1; }); return { ok: false }; }), { ok: false });
  assert.deepEqual(log, [], "the outer rollback took the committed savepoint's held calls with its rows");
  // nothing held leaks into a later transaction
  rc.transact(() => 1);
  assert.deepEqual(log, []);
});

test("R66: a held call that throws neither undoes the commit, stops the others, nor changes what transact answers; a non-function is a TypeError", () => {
  const { rc } = fresh();
  const log = [];
  const out = rc.transact(() => {
    rc.allocId("REL", "2026");
    rc.afterCommit(() => { log.push(1); throw new Error("listener failed"); });
    rc.afterCommit(() => log.push(2));
    return { ok: true, id: "x" };
  });
  assert.deepEqual(out, { ok: true, id: "x" });
  assert.deepEqual(log, [1, 2]);
  assert.equal(rc.allocId("REL", "2026").id, "REL-2026-0002", "the commit stood");
  assert.doesNotThrow(() => rc.afterCommit(() => { throw new Error("now"); }), "run at once, a throw stays inside");
  for (const bad of [null, undefined, 1, "fn", {}]) assert.throws(() => rc.afterCommit(bad), TypeError);
  assert.throws(() => rc.transact(() => { rc.afterCommit(7); return 1; }), TypeError, "inside a transaction too, and the caller's transaction rolls back with it");
  // the one instance per storage (R39): a call held through one handle runs at the commit of a transaction opened through another
  const { s, rc: a } = fresh();
  const b = recordOf({ storage: s });
  const got = [];
  a.transact(() => { b.afterCommit(() => got.push("b")); return 1; });
  assert.deepEqual(got, ["b"]);
});

/* ---- R67: the grammar seam ---- */

test("R67: registerGrammar holds a grammar per module in registration order, and grammars() answers them as {module, ids, arm}", () => {
  const { rc } = fresh();
  assert.deepEqual(rc.grammars(), []);
  const info = (ctx, f) => f.push({ check: "C-2.7", severity: "error", message: "info" });
  const extra = () => {};
  assert.deepEqual(rc.registerGrammar("capture", { ids: ["C-2.7"], arm: info }), { ok: true, module: "capture", ids: ["C-2.7"] });
  assert.deepEqual(rc.registerGrammar("promotion", { ids: ["C-18.7", "C-18.6"], arm: extra }).ok, true, "an arm is claimed by all its ids, in any order");
  assert.deepEqual(rc.registerGrammar("later", { ids: ["C-500.1"], arm: extra }).ok, true, "a grammar that claims no built-in arm");
  const g = rc.grammars();
  assert.deepEqual(g.map((x) => [x.module, [...x.ids]]), [["capture", ["C-2.7"]], ["promotion", ["C-18.7", "C-18.6"]], ["later", ["C-500.1"]]]);
  assert.equal(g[0].arm, info);
  assert.ok(g.every((x) => Object.isFrozen(x) && Object.isFrozen(x.ids)));
  g.pop();
  assert.equal(rc.grammars().length, 3, "a fresh list each call");
  assert.equal(recordOf({ storage: storage() }).grammars().length, 0, "the registrations are this instance's");
  // the list is one checkBundle accepts
  assert.doesNotReject(checkBundle({ folderName: "x", files: new Map(), sha256: async () => "", sha512: async () => new Uint8Array() }, { grammars: rc.grammars() }));
});

test("R67: a malformed grammar, or one claiming part of a slot, is GRAMMAR_MALFORMED (C-102.16); a second registration or a held id GRAMMAR_DECLARED (C-102.15); nothing is registered", async () => {
  assert.deepEqual([RECORD_CORE_CHECKS.GRAMMAR_DECLARED.check, RECORD_CORE_CHECKS.GRAMMAR_MALFORMED.check], ["C-102.15", "C-102.16"]);
  for (const c of ["GRAMMAR_DECLARED", "GRAMMAR_MALFORMED"]) {
    assert.equal(RECORD_CORE_CHECKS[c].where, "src/record-core/index.mjs registerGrammar > is-grammar-registration");
    assert.ok(RECORD_CORE_CHECKS[c].translation.endsWith(BUILD_FAULT));
  }
  const { rc } = fresh();
  const f = () => {};
  const malformed = [["", { ids: ["C-2.7"], arm: f }], ["  ", { ids: ["C-2.7"], arm: f }], [null, { ids: ["C-2.7"], arm: f }], [7, { ids: ["C-2.7"], arm: f }],
    ["m", { ids: [], arm: f }], ["m", { ids: "C-2.7", arm: f }], ["m", { ids: ["C-2.7", "2.8"], arm: f }], ["m", { ids: ["c-2.7"], arm: f }],
    ["m", { ids: [7], arm: f }], ["m", { ids: ["C-2.7"], arm: "f" }], ["m", { ids: ["C-2.7"] }], ["m", undefined], ["m", {}],
    ["m", { ids: ["C-18.6"], arm: f }], ["m", { ids: ["C-2.7", "C-2.8", "C-18.7"], arm: f }]];
  for (const [m, g] of malformed) {
    const r = rc.registerGrammar(m, g);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "GRAMMAR_MALFORMED", "GRAMMAR_MALFORMED", "C-102.16", RECORD_CORE_CHECKS.GRAMMAR_MALFORMED.translation],
                     `${String(m)} ${JSON.stringify(g && g.ids)}`);
    assert.equal(typeof r.detail, "string");
    assert.deepEqual(rc.grammars(), [], "nothing registered");
  }
  // each refusal names what checkBundle would reject: every arm is claimed whole, never in part
  for (const arm of EXTENSION_ARMS) if (arm.ids.length > 1)
    assert.equal(rc.registerGrammar("m", { ids: [arm.ids[0]], arm: f }).reason, "GRAMMAR_MALFORMED", arm.name);
  /* K939: C-9.1 left record-grammar's project slot (its R28), so it is an id outside every slot, which a registration may
     claim beside a whole slot (K766), and a second claim of it is a held id */
  assert.equal(rc.registerGrammar("project", { ids: ["C-9.1", "C-2.9", "C-800.1"], arm: f }).ok, true);
  const declared = [["project", { ids: ["C-2.7"], arm: f }, { module: "project", heldBy: "project" }],
                    ["other", { ids: ["C-2.9", "C-9.1"], arm: f }, { module: "other", id: "C-9.1", heldBy: "project" }],
                    ["other", { ids: ["C-2.9", "C-800.1"], arm: f }, { module: "other", id: "C-800.1", heldBy: "project" }],
                    ["other", { ids: ["C-800.1"], arm: f }, { module: "other", id: "C-800.1", heldBy: "project" }],
                    ["other", { ids: ["C-700.1", "C-700.1"], arm: f }, { module: "other", id: "C-700.1", heldBy: "other" }]];
  for (const [m, g, named] of declared) {
    const r = rc.registerGrammar(m, g);
    assert.deepEqual({ ...r, detail: null }, { ...named, ok: false, reason: "GRAMMAR_DECLARED", code: "GRAMMAR_DECLARED", check: "C-102.15",
                                              translation: RECORD_CORE_CHECKS.GRAMMAR_DECLARED.translation, detail: null });
    assert.ok(r.detail.includes(named.heldBy));
    assert.deepEqual(rc.grammars().map((x) => x.module), ["project"], "a refused registration registers nothing");
  }
  assert.equal(rc.registerGrammar("other", { ids: ["C-700.1"], arm: f }).ok, true, "a refused module may still register once");
  // whatever was refused, checkBundle never meets a list it rejects
  await checkBundle({ folderName: "x", files: new Map(), sha256: async () => "", sha512: async () => new Uint8Array() }, { grammars: rc.grammars() });
});

test("R18 R67: auditPass passes grammars() to the catalogue: a grammar runs in its arm's place with the findings checkBundle gives it, and one that throws is one AUDIT_CHECK_FAILED error", async () => {
  const { rc, ids } = await auditFixture();
  const known = new Set(ids);
  const base = await rc.auditPass({ limit: 10 });
  const calls = [];
  const arm = (ctx, findings) => {
    calls.push(ctx.folderName);
    if (ctx.folderName === ids[1]) findings.push({ check: "C-2.7", code: "INFO_BY_GRAMMAR", severity: "error", message: "the registered arm" });
  };
  assert.equal(rc.registerGrammar("capture", { ids: ["C-2.7"], arm }).ok, true);
  const r = await rc.auditPass({ limit: 10 });
  assert.deepEqual(calls, ids, "the registered arm ran for every page bundle, in the built-in arm's place");
  // the same as checkBundle over the same image with the same grammars
  const tally = {}; let withErrors = 0;
  for (const id of ids) {
    const errs = await expected(rc, id, known, {});
    const img = rc.readImage(id), files = new Map(), elided = new Set();
    for (const [p, v] of Object.entries(img)) typeof v === "string" ? files.set(p, v) : elided.add(p);
    const { findings } = await checkBundle({ folderName: id, files, elidedPaths: elided,
      sha256: async (v) => hexOf(createHash("sha256").update(typeof v === "string" ? v : Buffer.from(v)).digest()),
      sha512: async (b) => new Uint8Array(createHash("sha512").update(Buffer.from(b)).digest()),
      resolveTarget: (t) => known.has(t) }, { grammars: [{ module: "capture", ids: ["C-2.7"], arm: (c, f) => { if (c.folderName === ids[1]) f.push({ check: "C-2.7", code: "INFO_BY_GRAMMAR", severity: "error", message: "the registered arm" }); } }] });
    const e = findings.filter((x) => x.severity === "error");
    if (e.length) withErrors++;
    for (const x of e) tally[x.check] = (tally[x.check] || 0) + 1;
    void errs;
  }
  assert.deepEqual(r.tally, tally); assert.equal(r.withErrors, withErrors);
  assert.equal(r.tallyDetail["C-2.7/INFO_BY_GRAMMAR"], 1);
  assert.equal(r.clean + r.withErrors, r.checked);
  assert.ok(!(await rc.auditPass({ limit: 10, visible: (id) => id !== ids[1] })).tallyDetail?.["C-2.7/INFO_BY_GRAMMAR"], "R19 still holds");
  // a grammar that throws: one error under its module, the bundle not clean, the pass not thrown
  const { rc: r2 } = await auditFixture();
  const plain = await r2.auditPass({});
  r2.registerGrammar("broken", { ids: ["C-2.9", "C-9.1"], arm: () => { throw new Error("grammar bug"); } });
  const got = await r2.auditPass({});
  assert.equal(got.tally.broken, plain.checked, "one error per bundle");
  assert.equal(got.tallyDetail["broken/AUDIT_CHECK_FAILED"], plain.checked);
  assert.deepEqual([got.clean, got.withErrors], [0, plain.checked]);
  assert.ok(got.offenders.every((o) => o.errors.length === 5 || o.errors.some((e) => /grammar bug/.test(e.detail))), "its message, where the first five errors reach it");
  void base;
});

/* ---- R64, R65: op=stats' disclosure ---- */

/* A source standing for the instance's one figures source (plane's since T20): its wire form carries the log as `observationsNonLead`, its proof
   form the whole log, `leads` and the themes. It records what it was asked. A hostile source may also answer every key
   in both forms; the disclosure is this module's either way. */
function statsSource({ hostile = false } = {}) {
  const asked = [];
  const figures = ({ viewer, proof }) => {
    asked.push({ viewer, proof });
    const hidden = viewer === undefined ? 0 : viewer === "admin" ? 0 : 2;
    const base = { bundles: 10 - hidden, files: 20 - hidden, textIndexOk: true, tasks: 3 };
    const wire = { observationsNonLead: 7 - hidden };
    const proofOnly = { observations: 9, leads: 2, themes: 1, themePlacements: 4 };
    return hostile ? { ...base, ...wire, ...proofOnly, dbBytes: 123456 }
      : proof ? { ...base, ...proofOnly } : { ...base, ...wire };
  };
  return { asked, figures };
}
const sized = (bytes) => { const s = storage(); Object.defineProperty(s.sql, "databaseSize", { get: () => bytes }); return s; };

test("R64 R65: stats answers the source's figures with the same keys for every class, never leads nor observations, the log as observationsNonLead, and dbBytes only when capacity is exactly true", () => {
  for (const hostile of [false, true]) {
    const s = sized(4096);
    const rc = recordOf({ storage: s });
    const src = statsSource({ hostile });
    assert.deepEqual(rc.registerStatsSource("plane", src.figures), { ok: true, module: "plane" });
    const keysOf = (o) => Object.keys(o).sort();
    const member = rc.stats({ viewer: "member:iris" }), admin = rc.stats({ viewer: "admin", capacity: true });
    assert.deepEqual(member, { bundles: 8, files: 18, textIndexOk: true, tasks: 3, observationsNonLead: 5 }, `hostile=${hostile}`);
    assert.deepEqual(admin, { bundles: 10, files: 20, textIndexOk: true, tasks: 3, observationsNonLead: 7, dbBytes: 4096 });
    assert.deepEqual(keysOf(rc.stats({ viewer: "probe" })), keysOf(member), "the same keys for every class but capacity's one");
    for (const k of ["leads", "observations", "themes", "themePlacements"])
      for (const o of [member, admin, rc.stats({}), rc.stats({ capacity: true })]) assert.ok(!(k in o), `${k} is on the wire for no class`);
    // capacity: only `true` itself
    for (const c of [undefined, false, "1", 1, "true", {}, [true], null]) assert.ok(!("dbBytes" in rc.stats({ capacity: c, viewer: "admin" })), `capacity ${String(c)}`);
    assert.equal(rc.stats({ capacity: true }).dbBytes, 4096);
    assert.ok(!("dbBytes" in rc.stats()), "no argument at all: no capacity");
    // the viewer reaches the source as sent; never sent stays undefined (a direct internal call, counted whole)
    src.asked.length = 0;
    rc.stats({ viewer: "member:iris" }); rc.stats({}); rc.stats({ viewer: "" }); rc.stats();
    assert.deepEqual(src.asked.map((a) => [a.viewer, a.proof]), [["member:iris", false], [undefined, false], ["", false], [undefined, false]]);
    assert.equal(rc.stats({}).bundles, 10, "a viewer never sent counts whole");
  }
});

test("R64: purge's proof is the private form of the same figures: whole, the log as observations, with leads, the themes and dbBytes, and no observationsNonLead", () => {
  for (const hostile of [false, true]) {
    const rc = recordOf({ storage: sized(8192) });
    const src = statsSource({ hostile });
    rc.registerStatsSource("plane", src.figures);
    assert.deepEqual(rc.proofCounts(), { bundles: 10, files: 20, textIndexOk: true, tasks: 3, observations: 9, leads: 2, themes: 1, themePlacements: 4, dbBytes: 8192 });
    assert.deepEqual(src.asked.at(-1), { viewer: undefined, proof: true }, "asked whole: no viewer");
    assert.equal(rc.proofCounts.length, 0, "it takes no argument: no caller's sight or class reaches it");
  }
  // no route answers it: this module's route map (`recordCoreOps`, R72) reaches `stats`, never `proofCounts`
  const rc = recordOf({ storage: sized(1) });
  assert.deepEqual(rc.proofCounts(), { dbBytes: 1 }, "no source: only what this module holds");
});

test("R64 R65: with no source, or a source that throws or answers no object, stats answers only what this module holds; stats and proofCounts write nothing and never throw", () => {
  const plain = fresh().rc;
  assert.deepEqual(plain.stats({ capacity: true }), { dbBytes: null }, "a storage stating no size: null, never zero");
  assert.deepEqual(plain.stats({ viewer: "x" }), {});
  const cases = [() => { throw new Error("no table"); }, () => null, () => 7, () => "x", async () => ({ bundles: 1 }),
                 () => Object.defineProperty({ ok: 1 }, "boom", { enumerable: true, get() { throw new Error("get"); } }),
                 () => new Proxy({}, { ownKeys() { throw new Error("keys"); } })];
  for (const [i, f] of cases.entries()) {
    const { s, rc } = fresh();
    rc.registerStatsSource("m", f);
    const before = dump(s);
    let a, b;
    assert.doesNotThrow(() => { a = rc.stats({ capacity: true, viewer: "v" }); b = rc.proofCounts(); }, `case ${i}`);
    assert.ok(a && typeof a === "object" && b && typeof b === "object");
    if (i === 5) assert.deepEqual([a.ok, "boom" in a], [1, false], "a field that cannot be read is left out");
    assert.deepEqual(dump(s), before);
  }
  const { s, rc } = fresh();
  rc.registerStatsSource("m", statsSource().figures);
  const before = dump(s);
  rc.stats({ capacity: true, viewer: "v" }); rc.proofCounts();
  assert.deepEqual(dump(s), before, "writes nothing");
  // a figure the source answers is never rewritten: its own value, whatever its type (textIndexOk is a boolean)
  assert.equal(rc.stats({}).textIndexOk, true);
  const proto = rc.stats({});
  assert.equal(Object.getPrototypeOf(proto), Object.prototype);
});

test("R65: a second source is STATS_SOURCE_DECLARED (C-102.17), naming the holder; one without a module name or a function STATS_SOURCE_MALFORMED (C-102.18); nothing is registered", () => {
  for (const [c, n] of [["STATS_SOURCE_DECLARED", "C-102.17"], ["STATS_SOURCE_MALFORMED", "C-102.18"]]) {
    const row = RECORD_CORE_CHECKS[c];
    assert.deepEqual([row.check, row.where], [n, "src/record-core/index.mjs registerStatsSource > is-stats-source-registration"]);
    assert.ok(row.translation.endsWith(BUILD_FAULT) && Object.isFrozen(row));
  }
  const { rc } = fresh();
  for (const [m, f] of [["", () => ({})], ["  ", () => ({})], [null, () => ({})], [3, () => ({})], ["m", null], ["m", {}], ["m", "f"], [undefined, undefined]]) {
    const r = rc.registerStatsSource(m, f);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "STATS_SOURCE_MALFORMED", "STATS_SOURCE_MALFORMED", "C-102.18", RECORD_CORE_CHECKS.STATS_SOURCE_MALFORMED.translation]);
    assert.deepEqual(rc.stats({}), {}, "nothing registered");
  }
  const first = statsSource();
  assert.equal(rc.registerStatsSource("plane", first.figures).ok, true);
  const r = rc.registerStatsSource("control-plane", () => ({ bundles: 999 }));
  assert.deepEqual({ ...r, detail: null }, { ok: false, reason: "STATS_SOURCE_DECLARED", code: "STATS_SOURCE_DECLARED", check: "C-102.17",
    translation: RECORD_CORE_CHECKS.STATS_SOURCE_DECLARED.translation, module: "control-plane", heldBy: "plane", detail: null });
  assert.ok(r.detail.includes("plane") && !r.detail.includes("control-plane"), "the detail names the holder, not the refused module");
  assert.equal(rc.registerStatsSource("plane", () => ({})).reason, "STATS_SOURCE_DECLARED", "its own second registration too");
  assert.equal(rc.stats({}).bundles, 10, "the first still stands");
  // the source is the instance's (R39): one per storage, reached through every handle
  const { s, rc: a } = fresh();
  a.registerStatsSource("plane", first.figures);
  assert.equal(recordOf({ storage: s }).stats({}).bundles, 10);
  assert.deepEqual(recordOf({ storage: storage() }).stats({}), {});
});

/* ---- R28's caller half (the `mint-ledger` convert, K619 (2)): the ids a store held before the ledger existed ---- */

/* A store written before the ledger (REC-151's minter, no ledger write, no seed; the pre-REC-151 op=allocid that served
   CASE off the counter): live rows of each gated kind in the tables the boot's seed reads (plane's `MINT_LEDGER_LIVE`,
   and ratification's and publication's R70 seeds), and a CASE-<year> counter. */
const MINT_LEDGER_LIVE = [["PROJ", "bundles", "bundle_id"], ["CASE", "cases", "case_id"], ["CASE", "published_cases", "case_id"],
                          ["CASE", "case_documents", "case_id"], ["CASE", "published_case_members", "case_id"]];
function preLedgerStore() {
  const { s, rc } = fresh();
  for (const t of ["cases", "published_cases", "case_documents", "published_case_members"]) s.db.exec(`CREATE TABLE ${t} (case_id TEXT)`);
  rc.commit({ bundleId: "PROJ-2026-7316-project-legacy-one", type: "project", snapKey: "K1", files: [file("bundle.md", "p")] });
  s.sql.exec(`INSERT INTO cases VALUES ('CASE-2026-4001')`);
  s.sql.exec(`INSERT INTO published_cases VALUES ('CASE-2026-4002')`);
  s.sql.exec(`INSERT INTO case_documents VALUES ('CASE-2026-4003')`);
  s.sql.exec(`INSERT INTO published_case_members VALUES ('CASE-2026-4004')`);
  for (let k = 0; k < 3; k++) rc.allocId("CASE", "2026");        // CASE-2026-0001..0003, off the counter
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM minted_ids`)[0].n, 0, "the ledger knows none of them yet");
  // publication, which holds the case tables, declares them to purge; here all four are cleared whole, so a purge takes
  // every live row the legacy ids stood in
  rc.declarePurge("publication", ["cases", "published_cases", "case_documents", "published_case_members"].map((name) => ({ name, keys: [] })));
  return { s, rc };
}

test("R28 R40 R8 (mint-ledger): the pre-ledger PROJ and CASE ids the boot seed learns from their live rows are refused after a whole-store purge, and after a single-bundle one", () => {
  const { s, rc } = preLedgerStore();
  rc.seedMintLedger(MINT_LEDGER_LIVE);                            // the boot of the build that has the ledger
  const pg = rc.purge({});
  assert.deepEqual([pg.ok, pg.scope, count(s, "bundles"), count(s, "cases"), count(s, "published_cases")], [true, "ALL", 0, 0, 0],
                   "the purge took every live row the legacy ids stood in");
  // a draw forced at each legacy id is refused by the ledger and the act still mints a fresh id
  assert.equal(draws([7316, 7317], () => rc.mintOpaqueId("PROJ", "2026", "-project-legacy-one", () => false)), "PROJ-2026-7317-project-legacy-one");
  for (const [i, n] of [4001, 4002, 4003, 4004].entries())
    assert.equal(draws([n, 5000 + i], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), `CASE-2026-${5000 + i}`, `CASE-2026-${n}`);
  // a seed at a later boot, and after the purge, changes nothing: the ledger is exempt and the seed idempotent
  rc.seedMintLedger(MINT_LEDGER_LIVE);
  assert.equal(draws([4001, 6001], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-6001");
  // single-bundle: a pre-ledger project purged by itself stays spent
  const { rc: r2 } = preLedgerStore();
  r2.seedMintLedger(MINT_LEDGER_LIVE);
  r2.purge({ bundleId: "PROJ-2026-7316-project-legacy-one" });
  assert.equal(r2.bundleInfo("PROJ-2026-7316-project-legacy-one"), null);
  assert.equal(draws([7316, 1], () => r2.mintOpaqueId("PROJ", "2026", "-project-legacy-one", () => false)), "PROJ-2026-0001-project-legacy-one");
  // the control: with no seed, the same purge leaves the legacy id drawable again, which is the defect the seed closes
  const { rc: bare } = preLedgerStore();
  bare.purge({});
  assert.equal(draws([7316], () => bare.mintOpaqueId("PROJ", "2026", "-project-legacy-one", () => false)), "PROJ-2026-7316-project-legacy-one");
});

test("R28 R40 R23 (mint-ledger): CASE-<year> ids the counter issued before CASE moved to the minter are refused, used or not, after a purge", () => {
  const { s, rc } = preLedgerStore();
  rc.seedMintLedger(MINT_LEDGER_LIVE);
  rc.purge({});
  assert.equal(rows(s, `SELECT next FROM seq WHERE scope='CASE-2026'`)[0].next, 4, "the purge kept the counter (R23)");
  for (const n of [1, 2, 3])
    assert.equal(draws([n, 9000 + n], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), `CASE-2026-${9000 + n}`,
                 `CASE-2026-000${n}, an allocation handed out, is an identifier that has existed`);
  assert.equal(draws([4], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0004", "one the counter never issued is free");
  // PROJ and TASK carry a slug the counter never recorded: their counters teach the ledger nothing
  s.sql.exec(`INSERT INTO seq (scope,next) VALUES ('PROJ-2026', 3), ('TASK-2026', 3)`);
  rc.seedMintLedger([]);
  assert.equal(draws([1], () => rc.mintOpaqueId("PROJ", "2026", "", () => false)), "PROJ-2026-0001");
  // the ledger itself is named by no figure: neither op=stats' form nor purge's proof carries a key for it
  rc.registerStatsSource("plane", statsSource().figures);
  for (const o of [rc.stats({ capacity: true }), rc.proofCounts(), rc.counts(null), pgKeys(rc.purge({}))])
    assert.deepEqual(Object.keys(o).filter((k) => /mint|ledger/i.test(k)), []);
});
const pgKeys = (p) => ({ ...p.removed });

/* ---- T19 layer 2: R67 as K766 words it, R68–R73, R34/R37/R44's project (N426) ---- */

const doc = (id, type, extra = "") => `---\nid: ${id}\nobject_type: ${type}\ncurrent_state: open\n${extra}---\n\n## Summary\n\nx\n`;

test("R67 (K766, N422): a registration may claim several whole slots and a slot several registrations, run in its place in registration order; the acceptance is {ok: true, module, ids}", async () => {
  const { rc } = fresh();
  const calls = [];
  const slotted = (who) => async (ctx, findings, where) => {
    calls.push(`${who}:${where && where.slot}`);
    if (who === "ig" && where.slot === "checkInquiryExtension") {
      findings.push({ check: "C-2.8", severity: "warning", message: "entry" });
      await where.rest();                                              /* the sub-slot: later claimants run here */
      findings.push({ check: "C-2.8", severity: "warning", message: "legs" });
    }
    if (who === "bv") findings.push({ check: "C-25.1", severity: "warning", message: "versions" });
  };
  const ig = rc.registerGrammar("inquiry-grammar", { ids: ["C-6.1", "C-15.1", "C-2.8"], arm: slotted("ig") });
  assert.deepEqual(ig, { ok: true, module: "inquiry-grammar", ids: ["C-6.1", "C-15.1", "C-2.8"] });
  assert.equal(Object.keys(ig)[0], "ok", "N422: the verdict the DEC-49 guard reads first is `ok: true`, an acceptance");
  const bv = rc.registerGrammar("basis-versions", { ids: ["C-2.8"], arm: slotted("bv") });
  assert.deepEqual(bv, { ok: true, module: "basis-versions", ids: ["C-2.8"] }, "a slot another registration claims is not a clash");
  const info = (ctx, f) => f.push({ check: "C-2.7", severity: "warning", message: "info" });
  assert.equal(rc.registerGrammar("capture", { ids: ["C-2.7"], arm: info }).ok, true);
  const g = rc.grammars();
  assert.deepEqual(g.map((x) => [x.module, [...x.ids]]),
    [["inquiry-grammar", ["C-6.1"]], ["inquiry-grammar", ["C-15.1"]], ["inquiry-grammar", ["C-2.8"]], ["capture", ["C-2.7"]]],
    "one entry per claimed slot at its first claimant's place; a lone claimant of one slot as it was registered");
  assert.equal(g[3].arm, info, "a lone claimant's own arm");
  assert.ok(g.every((x) => Object.isFrozen(x)));
  /* the list is one record-grammar's checkBundle accepts, and the slots run in its order, the shared one's claimants in registration order */
  const { findings } = await checkBundle({ folderName: "INQ-2026-0001-a", files: new Map([["bundle.md", doc("INQ-2026-0001-a", "inquiry")]]),
    sha256: async () => "", sha512: async () => new Uint8Array() }, { grammars: g });
  assert.deepEqual(calls, ["ig:checkSupersession", "ig:checkRecheckCoverage", "ig:checkInquiryExtension", "bv:checkInquiryExtension"]);
  assert.deepEqual(findings.filter((f) => ["entry", "versions", "legs", "info"].includes(f.message)).map((f) => f.message),
                   ["info", "entry", "versions", "legs"], "rest() ran the later claimant at the sub-slot, once");
  /* a later claimant not run by rest() runs after the first one returns */
  const { rc: r2 } = fresh();
  const order = [];
  assert.equal(r2.registerGrammar("a", { ids: ["C-2.9", "C-9.1"], arm: () => order.push("a") }).ok, true);
  assert.equal(r2.registerGrammar("b", { ids: ["C-2.9"], arm: () => order.push("b") }).ok, true, "the slot both claim (K939: C-2.9 alone)");
  assert.equal(r2.registerGrammar("c", { ids: ["C-9.1"], arm: () => order.push("c") }).reason, "GRAMMAR_DECLARED",
               "C-9.1 is outside every slot (K939): a second claim of it is a held id");
  await checkBundle({ folderName: "x", files: new Map([["bundle.md", doc("x", "project")]]), sha256: async () => "", sha512: async () => new Uint8Array() },
                    { grammars: r2.grammars() });
  assert.deepEqual(order, ["a", "b"]);
  /* a registration claiming no slot runs after the last slot, as registered */
  assert.equal(r2.registerGrammar("later", { ids: ["C-900.1"], arm: () => order.push("later") }).ok, true);
  assert.deepEqual(r2.grammars().map((x) => x.module), ["a", "later"]);
});

test("R67 R59 R18: in the audit each claimant of a shared slot is wrapped on its own: one that throws is one AUDIT_CHECK_FAILED on that bundle, and the others still run", async () => {
  const { rc, ids } = await auditFixture();
  const ran = [];
  rc.registerGrammar("first", { ids: ["C-2.7"], arm: (ctx) => { ran.push(["first", ctx.folderName]); throw new Error("first broke"); } });
  rc.registerGrammar("second", { ids: ["C-2.7"], arm: (ctx, f) => { ran.push(["second", ctx.folderName]); f.push({ check: "C-2.7", code: "SECOND", severity: "error", message: "s" }); } });
  const r = await rc.auditPass({ limit: 10 });
  assert.deepEqual(ran.filter(([w]) => w === "second").map(([, id]) => id), ids, "the second claimant ran on every bundle");
  assert.equal(r.tally.first, ids.length); assert.equal(r.tallyDetail["first/AUDIT_CHECK_FAILED"], ids.length);
  assert.equal(r.tallyDetail["C-2.7/SECOND"], ids.length);
  assert.deepEqual([r.clean, r.withErrors], [0, ids.length]);
});

test("R68: a registered finding answers once per page under its key, beside the page's figures, which it never moves; one that throws is AUDIT_CHECK_FAILED under its key", async () => {
  const { rc, ids } = await auditFixture();
  const base = await rc.auditPass({ limit: 10 });
  const seen = [];
  assert.deepEqual(rc.registerAuditFinding("provenance", "route", (page) => { seen.push(page); return { tally: page.bundles.length }; }),
                   { ok: true, module: "provenance", key: "route" });
  assert.equal(rc.registerAuditFinding("membership", "membership", async () => ({ held: false })).ok, true);
  assert.equal(rc.registerAuditFinding("broken", "broke", () => { throw new Error("finding bug"); }).ok, true);
  const r = await rc.auditPass({ limit: 3, after: "" });
  assert.equal(seen.length, 1, "once per page");
  assert.deepEqual(seen[0], { bundles: ids.slice(0, 3).map((id) => ({ bundleId: id, type: "information", state: "" })), after: "", last: ids[2] });
  assert.deepEqual(r.route, { tally: 3 }); assert.deepEqual(r.membership, { held: false });
  assert.deepEqual([r.broke.ok, r.broke.reason, r.broke.code, r.broke.check, r.broke.translation],
                   [false, "AUDIT_CHECK_FAILED", "AUDIT_CHECK_FAILED", "C-102.3", RECORD_CORE_CHECKS.AUDIT_CHECK_FAILED.translation]);
  assert.match(r.broke.detail, /finding bug/);
  assert.deepEqual(Object.keys(r).slice(0, 3), ["route", "membership", "broke"], "in registration order");
  const all = await rc.auditPass({ limit: 10 });
  for (const k of ["ok", "checked", "clean", "withErrors", "tally", "offenders", "limit", "cursor", "page"])
    assert.deepEqual(all[k], base[k], `${k} is not moved by a finding`);
  /* an empty page is still a page */
  const none = await rc.auditPass({ visible: () => false });
  assert.deepEqual(seen.at(-1), { bundles: [], after: "", last: "" }); assert.deepEqual(none.route, { tally: 0 });
  /* refusals: R59's rows; a refused registration registers nothing */
  const f = () => ({});
  for (const [m, k, fn] of [["", "k", f], [null, "k", f], ["m", "", f], ["m", 7, f], ["m", undefined, f], ["m", "k", "fn"]]) {
    const x = rc.registerAuditFinding(m, k, fn);
    assert.deepEqual([x.ok, x.reason, x.code, x.check], [false, "AUDIT_CHECK_MALFORMED", "AUDIT_CHECK_MALFORMED", "C-102.2"]);
  }
  for (const [m, k, holder] of [["provenance", "other", "provenance"], ["m2", "route", "provenance"], ["m3", "tally", "auditPass"],
                                ["m4", "ok", "auditPass"], ["m5", "total", "auditPass"], ["m6", "page", "auditPass"]]) {
    const x = rc.registerAuditFinding(m, k, f);
    assert.deepEqual([x.ok, x.reason, x.code, x.check], [false, "AUDIT_CHECK_DECLARED", "AUDIT_CHECK_DECLARED", "C-102.1"], `${m} ${k}`);
    assert.ok(x.detail.includes(holder));
  }
  assert.deepEqual(Object.keys(await rc.auditPass({ limit: 1 })).slice(0, 3), ["route", "membership", "broke"], "nothing more registered");
  assert.equal(rc.registerAuditCheck("provenance", () => []).ok, true, "the seams are separate: a module registers once in each");
});

test("R69 R45: registered contexts are merged in registration order, then the caller's, and reach the catalogue and every check; one that throws is AUDIT_CHECK_FAILED on that bundle", async () => {
  const { rc, ids } = await auditFixture();
  const got = [];
  rc.registerAuditCheck("watch", (img, ctx) => { got.push([img.bundleId, ctx]); return []; });
  assert.deepEqual(rc.registerAuditContext("inquiry", (id) => ({ earnedRegistry: { id }, shared: "inquiry" })), { ok: true, module: "inquiry" });
  assert.equal(rc.registerAuditContext("publication", (id) => (id === ids[2] ? (() => { throw new Error("ctx bug"); })() : { publishedRegistry: {}, shared: "publication" })).ok, true);
  const r = await rc.auditPass({ limit: 10, context: () => ({ releaseRegistry: null }) });
  assert.deepEqual(got.find(([id]) => id === ids[0])[1], { earnedRegistry: { id: ids[0] }, shared: "publication", publishedRegistry: {}, releaseRegistry: null },
                   "registration order, a later one over an earlier, then the caller's");
  assert.deepEqual(got.find(([id]) => id === ids[2])[1], { earnedRegistry: { id: ids[2] }, shared: "inquiry", releaseRegistry: null },
                   "a context that threw gives that bundle nothing from it");
  assert.equal(r.tally.publication, 1); assert.equal(r.tallyDetail["publication/AUDIT_CHECK_FAILED"], 1);
  const quiet = await rc.auditPass({ limit: 10, visible: (id) => id === ids[2] });
  assert.equal(quiet.withErrors, 1, "the bundle is not clean");
  /* the catalogue sees it too: a grammar reads the merged context */
  const { rc: r2, ids: i2 } = await auditFixture();
  const seenByGrammar = [];
  r2.registerAuditContext("inquiry", () => ({ earnedRegistry: { marker: 1 } }));
  r2.registerGrammar("probe", { ids: ["C-2.7"], arm: (ctx) => seenByGrammar.push(ctx.earnedRegistry) });
  await r2.auditPass({ limit: 1 });
  assert.deepEqual(seenByGrammar, [{ marker: 1 }]); void i2;
  /* refusals, R59's rows */
  for (const [m, fn] of [["", () => ({})], [null, () => ({})], ["m", null]])
    assert.equal(rc.registerAuditContext(m, fn).reason, "AUDIT_CHECK_MALFORMED");
  const twice = rc.registerAuditContext("inquiry", () => ({}));
  assert.deepEqual([twice.ok, twice.reason, twice.check, twice.module], [false, "AUDIT_CHECK_DECLARED", "C-102.1", "inquiry"]);
});

test("R70 R40: registerMintSeed adds a module's own sources to the ledger's seed; MINT_SEED_DECLARED (C-102.19) and MINT_SEED_MALFORMED (C-102.20) register nothing", () => {
  for (const [c, n] of [["MINT_SEED_DECLARED", "C-102.19"], ["MINT_SEED_MALFORMED", "C-102.20"]]) {
    const row = RECORD_CORE_CHECKS[c];
    assert.deepEqual([row.check, row.where], [n, "src/record-core/index.mjs registerMintSeed > is-mint-seed-registration"]);
    assert.ok(row.translation.endsWith(BUILD_FAULT) && Object.isFrozen(row));
  }
  const { s, rc } = fresh();
  for (const t of ["cases", "case_documents", "published_cases", "elsewhere"]) s.db.exec(`CREATE TABLE ${t} (case_id TEXT)`);
  s.sql.exec(`INSERT INTO cases VALUES ('CASE-2026-0101')`); s.sql.exec(`INSERT INTO case_documents VALUES ('CASE-2026-0102')`);
  s.sql.exec(`INSERT INTO published_cases VALUES ('CASE-2026-0103')`); s.sql.exec(`INSERT INTO elsewhere VALUES ('CASE-2026-0104')`);
  const before = dump(s);
  assert.deepEqual(rc.registerMintSeed("ratification", [["CASE", "cases", "case_id"], ["CASE", "case_documents", "case_id"]]),
                   { ok: true, module: "ratification", sources: [["CASE", "cases", "case_id"], ["CASE", "case_documents", "case_id"]] });
  assert.equal(rc.registerMintSeed("publication", [["CASE", "published_cases", "case_id"]]).ok, true);
  assert.deepEqual(dump(s), before, "registering writes nothing");
  const bad = [["", []], [null, []], ["m", null], ["m", "x"], ["m", [["CASE", "t"]]], ["m", [["CASE", "t", ""]]], ["m", [["CASE", "t", 7]]], ["m", [null]]];
  for (const [m, src] of bad) {
    const r = rc.registerMintSeed(m, src);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MINT_SEED_MALFORMED", "MINT_SEED_MALFORMED", "C-102.20",
                     RECORD_CORE_CHECKS.MINT_SEED_MALFORMED.translation], `${String(m)} ${JSON.stringify(src)}`);
  }
  const twice = rc.registerMintSeed("ratification", [["CASE", "elsewhere", "case_id"]]);
  assert.deepEqual({ ...twice, detail: null }, { ok: false, reason: "MINT_SEED_DECLARED", code: "MINT_SEED_DECLARED", check: "C-102.19",
    translation: RECORD_CORE_CHECKS.MINT_SEED_DECLARED.translation, module: "ratification", heldBy: "ratification", detail: null });
  rc.seedMintLedger([]);
  for (const n of [101, 102, 103])
    assert.equal(draws([n, n + 800], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), `CASE-2026-0${n + 800}`, `CASE-2026-0${n}: learned from a registered source`);
  assert.equal(draws([104], () => rc.mintOpaqueId("CASE", "2026", "", () => false)), "CASE-2026-0104",
               "a refused registration's table is never read, nor any table no one names");
});

test("R71: migrate runs RECORD_SCHEMA itself and this module's own migrations, so a bare storage holds its tables; a store written earlier is brought forward; twice changes nothing", async () => {
  const s = storage({ schema: false });
  const rc = recordOf({ storage: s });
  rc.migrate();
  const tables = () => rows(s, `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name);
  assert.deepEqual(tables(), ["bundles", "files", "history", "leases", "manifest", "minted_ids", "seq", "settings"]);
  const once = dump(s), schemaOnce = JSON.stringify(rows(s, `SELECT * FROM sqlite_master ORDER BY name`));
  rc.migrate();
  assert.deepEqual(dump(s), once); assert.equal(JSON.stringify(rows(s, `SELECT * FROM sqlite_master ORDER BY name`)), schemaOnce, "running it twice changes nothing");
  /* a store written before the manifest's writer and operation, before R34's project, still holding `classification`,
     and with legacy type spellings in the derived `bundles` */
  const { LEGACY_TYPE_ALIASES } = await import("../../../src/record-grammar/index.mjs");
  const old = storage({ schema: false });
  old.db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, group_id TEXT NOT NULL, title TEXT,
                 current_state TEXT NOT NULL, prior_state TEXT, created TEXT NOT NULL, last_updated TEXT NOT NULL, criticality TEXT,
                 bundle_sha TEXT NOT NULL, row_version INTEGER NOT NULL DEFAULT 1, classification TEXT);
               CREATE TABLE manifest (bundle_id TEXT NOT NULL, snap_key TEXT NOT NULL, kind TEXT NOT NULL, base TEXT, author TEXT,
                 created TEXT NOT NULL, files_json TEXT NOT NULL, PRIMARY KEY (bundle_id, snap_key))`);
  const aliases = Object.entries(LEGACY_TYPE_ALIASES);
  assert.ok(aliases.length >= 1);
  aliases.forEach(([legacy], i) => old.sql.exec(`INSERT INTO bundles VALUES (?,?,'',NULL,'open',NULL,'t','t',NULL,'s',1,'fact')`, `B-${i}`, legacy));
  old.sql.exec(`INSERT INTO manifest VALUES ('B-0','K1','promotion',NULL,'a','t','[]')`);
  const r2 = recordOf({ storage: old });
  r2.migrate();
  const cols = (t) => rows(old, `PRAGMA table_info(${t})`).map((r) => r.name);
  assert.ok(["writer", "operation"].every((c) => cols("manifest").includes(c)), "the manifest's columns are added");
  assert.ok(cols("bundles").includes("project") && !cols("bundles").includes("classification"), "project added, classification dropped");
  assert.deepEqual(rows(old, `SELECT object_type FROM bundles ORDER BY bundle_id`).map((r) => r.object_type), aliases.map(([, c]) => c),
                   "legacy type spellings normalised from record-grammar's LEGACY_TYPE_ALIASES");
  assert.deepEqual(r2.manifestEntry("B-0", "K1").writer, null, "an older entry names no writer");
  assert.deepEqual(r2.bundleInfo("B-0").project, null);
  assert.ok(rows(old, `PRAGMA index_list(bundles)`).some((r) => r.name === "bundles_project"));
  const twice = dump(old); r2.migrate(); assert.deepEqual(dump(old), twice);
});

const opsUrl = (op, params = {}) => { const u = new URL(`https://plane.invalid/?op=${op}`); for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v); return u; };

test("R72: recordCoreOps holds seven ops, each answering what its service answers from the query's parameters", async () => {
  const { s, rc } = fresh();
  const ops = (op, p, body = null) => recordCoreOps(rc, opsUrl(op, p), body, {})[op]();
  assert.deepEqual(Object.keys(recordCoreOps(rc, opsUrl("x"), null)).sort(), ["allocid", "audit", "digestcensus", "lease", "purge", "snapkeycensus", "stats"]);
  assert.ok(Object.values(recordCoreOps(rc, opsUrl("x"), null)).every((f) => typeof f === "function" && f.length === 0), "each a function of no arguments");
  assert.deepEqual(ops("allocid", { prefix: "INFO", year: "2026" }), { id: "INFO-2026-0001" });
  assert.equal(ops("allocid", { prefix: "PROJ", year: "2026" }).reason, "ALLOCID_PREFIX_GATED");
  assert.equal(ops("allocid", { prefix: "INFO", year: "2026" }, { prefix: "PROJ" }).id, "INFO-2026-0002", "never the body's");
  put(rc, "INFO-2026-0001-a", "K1");
  const t0 = Date.now(), lease = ops("lease", { id: "INFO-2026-0001-a", actor: "alice" });
  assert.equal(lease.ok, true); assert.equal(lease.actor, "alice");
  const exp = Date.parse(lease.expires);
  assert.ok(exp >= t0 + 300000 && exp <= Date.now() + 300000, "a lease of five minutes");
  assert.equal(ops("lease", { id: "INFO-2026-0001-a" }).reason, "ANONYMOUS_LEASE");
  assert.deepEqual(ops("snapkeycensus", { limit: "1" }), rc.snapKeyCensus({ limit: "1" }));
  assert.deepEqual(ops("digestcensus", { limit: "0" }), rc.digestCensus({ limit: "0" }));
  /* stats: capacity exactly when the stamp is 1; a viewer never stamped reaches the source as undefined */
  const asked = [];
  Object.defineProperty(s.sql, "databaseSize", { get: () => 512 });
  rc.registerStatsSource("source", ({ viewer, proof }) => { asked.push([viewer, proof]); return { bundles: 1 }; });
  assert.deepEqual(ops("stats", { capacity: "1", viewer: "admin" }), { bundles: 1, dbBytes: 512 });
  for (const c of ["0", "true", ""]) assert.ok(!("dbBytes" in ops("stats", { capacity: c })), `capacity=${c}`);
  ops("stats", {}); ops("stats", { viewer: "" });
  assert.deepEqual(asked.slice(-2), [[undefined, false], ["", false]]);
});

test("R72 R22 R24 R64: op=purge purges in one transaction and answers scope, the private proof before and after, and removed for its named keys", () => {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE refs (bundle_id TEXT)`);
  rc.declarePurge("connections", ["refs"]);
  const count = (t) => rows(s, `SELECT COUNT(*) AS n FROM ${t}`)[0].n;
  rc.registerStatsSource("source", ({ proof }) => (proof ? { bundles: count("bundles"), files: count("files"), history: count("history"), refs: count("refs"),
    leads: 0, observations: 3 } : { bundles: -1 }));
  put(rc, "INFO-2026-0001-a", "K1"); put(rc, "INFO-2026-0001-a", "K2", "two"); put(rc, "INFO-2026-0002-b", "K1");
  s.sql.exec(`INSERT INTO refs VALUES ('INFO-2026-0001-a'), ('INFO-2026-0002-b')`);
  const one = recordCoreOps(rc, opsUrl("purge", { bundleId: "INFO-2026-0001-a" }), null).purge();
  assert.deepEqual([one.ok, one.scope], [true, "INFO-2026-0001-a"]);
  assert.deepEqual(one.before, { bundles: 2, files: 2, history: 1, refs: 2, leads: 0, observations: 3, dbBytes: null }, "the proof, whole");
  assert.deepEqual(one.after, { bundles: 1, files: 1, history: 0, refs: 1, leads: 0, observations: 3, dbBytes: null });
  const KEYS = ["bundles", "files", "history", "refs", "register", "tasks", "taskQueue", "sourceReachability", "entities", "entityAliases",
    "entityRelations", "resolutions", "connections", "progressionDefs", "connectionPairChoices", "progressionStages", "progressionDefVersions",
    "progressionStageVersions", "progressionInstances", "progressionExceptions", "connectionDirty", "proposalDispositions", "queueState",
    "projectParticipants", "projectOwnerVotes", "aiRuns", "aiRunBounds", "aiRunLog", "leads", "themes", "themePlacements",
    "suggestRefusals", "captureRequests"];
  assert.deepEqual(Object.keys(one.removed), KEYS, "exactly R72's keys, in its order");
  assert.deepEqual([one.removed.bundles, one.removed.files, one.removed.history, one.removed.refs, one.removed.leads], [1, 1, 1, 1, 0]);
  assert.ok(Number.isNaN(one.removed.register), "a key no figure reports is before less after, as the store answers it");
  for (const empty of [{}, { bundleId: "" }]) {
    put(rc, "INFO-2026-0003-c", "K1");
    const all = recordCoreOps(rc, opsUrl("purge", empty), null).purge();
    assert.deepEqual([all.scope, count("bundles"), count("refs")], ["ALL", 0, 0], "absent or empty is the whole store");
  }
});

test("R73 R19: op=audit is gated by sight(viewer): the page and total are what the viewer may see, references resolve whole, the ids are not answered, and a viewer never seen sees nothing", async () => {
  const { s, rc, ids } = await auditFixture();
  /* a sight in membership's shape: {sql, args} over the alias b */
  const sight = (viewer) => viewer === "all" ? { sql: "1=1", args: [] }
    : viewer === "some" ? { sql: "b.bundle_id IN (?, ?)", args: [ids[0], ids[3]] } : { sql: "0=1", args: [] };
  rc.registerAuditFinding("provenance", "route", (page) => ({ n: page.bundles.length }));
  rc.registerAuditFinding("membership", "membership", () => ({ held: false }));
  const asked = [];
  rc.registerAuditContext("inquiry", (id) => { asked.push(id); return {}; });
  const audit = (p) => recordCoreOps(rc, opsUrl("audit", p), null, { sight }).audit();
  const all = await audit({ viewer: "all", limit: "10" });
  const direct = await rc.auditPass({ limit: 10 });
  const { page, ...same } = direct;
  assert.deepEqual(all, { ...same, total: 5 }, "today's sweep, with total, without the page's ids");
  assert.ok(!("page" in all));
  assert.deepEqual(Object.keys(all).sort(), ["checked", "clean", "cursor", "limit", "membership", "offenders", "ok", "route", "tally", "total", "withErrors",
    ...(all.tallyDetail ? ["tallyDetail"] : [])].sort());
  const some = await audit({ viewer: "some" });
  assert.deepEqual([some.checked, some.total, some.route], [2, 2, { n: 2 }]);
  assert.ok(some.offenders.every((o) => [ids[0], ids[3]].includes(o.bundleId)));
  assert.ok(!("C-6.2" in some.tally), "A cites B, out of sight, and B still resolves");
  /* each id the page names is asked once */
  const seen = [];
  const counted = (v) => { const g = sight(v); seen.push(v); return g; };
  const exec = s.sql.exec; const gated = [];
  s.sql.exec = (q, ...a) => { if (/b\.bundle_id=\? AND/.test(q)) gated.push(a[0]); return exec(q, ...a); };
  await recordCoreOps(rc, opsUrl("audit", { viewer: "all", limit: "2" }), null, { sight: counted }).audit();
  s.sql.exec = exec;
  assert.deepEqual(gated, ids.slice(0, 2)); assert.deepEqual(seen, ["all"]);
  /* after and limit, as the page cursor */
  const p2 = await audit({ viewer: "all", after: ids[1], limit: "2" });
  assert.deepEqual([p2.checked, p2.cursor], [2, ids[3]]);
  /* fail closed: no viewer, an unknown one, no sight, a sight that throws */
  for (const [p, sg] of [[{}, sight], [{ viewer: "nobody" }, sight], [{ viewer: "all" }, null], [{ viewer: "all" }, () => { throw new Error("x"); }],
                         [{ viewer: "all" }, () => null]]) {
    const r = await recordCoreOps(rc, opsUrl("audit", p), null, { sight: sg }).audit();
    assert.deepEqual([r.ok, r.checked, r.total, r.offenders, r.tally], [true, 0, 0, [], {}], JSON.stringify(p));
  }
  void asked;
});

test("R34 R37 R44 (N426): bundles.project records the project the last commit named, bundleInfo answers it, and a later module fences by it in its own SQL", () => {
  const { s, rc } = fresh();
  const col = rows(s, `PRAGMA table_info(bundles)`).find((r) => r.name === "project");
  assert.deepEqual([col.type, col.notnull], ["TEXT", 0]);
  const c = (id, k, project) => rc.commit({ bundleId: id, type: "plan", snapKey: k, project, files: [file("bundle.md", `${id}${k}`)] });
  c("PLN-2026-0001-a", "K1", "PROJ-2026-0001-p");
  c("ESC-2026-0001-b", "K1", "PROJ-2026-0002-q");
  c("INFO-2026-0001-c", "K1", null);
  assert.equal(rc.bundleInfo("PLN-2026-0001-a").project, "PROJ-2026-0001-p");
  assert.equal(rc.bundleInfo("INFO-2026-0001-c").project, null, "a bundle that belongs to no project");
  c("PLN-2026-0001-a", "K2", "PROJ-2026-0002-q");
  assert.equal(rc.bundleInfo("PLN-2026-0001-a").project, "PROJ-2026-0002-q", "the last commit's project");
  c("ESC-2026-0001-b", "K2", null);
  assert.equal(rc.bundleInfo("ESC-2026-0001-b").project, null, "a commit naming none records none");
  /* a later module's fence, by project sight, in its own SQL over the read contract */
  s.db.exec(`CREATE TABLE sees (member TEXT, project_id TEXT)`);
  s.sql.exec(`INSERT INTO sees VALUES ('iris', 'PROJ-2026-0002-q')`);
  const visibleTo = (m) => rows(s, `SELECT b.bundle_id FROM bundles b WHERE b.project IS NULL
                                     OR EXISTS (SELECT 1 FROM sees x WHERE x.member = ? AND x.project_id = b.project) ORDER BY b.bundle_id`, m).map((r) => r.bundle_id);
  assert.deepEqual(visibleTo("iris"), ["ESC-2026-0001-b", "INFO-2026-0001-c", "PLN-2026-0001-a"]);
  assert.deepEqual(visibleTo("olaf"), ["ESC-2026-0001-b", "INFO-2026-0001-c"]);
  assert.deepEqual(rc.listBundles({ project: "PROJ-2026-0002-q" }).ids, ["PLN-2026-0001-a"]);
});

test("R46 R22 R72 (K775): a clears column is set to NULL where it names the purged bundle, on rows that stay, in the purge's transaction; the whole-store form is unchanged", () => {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE capture_requests (id TEXT, target TEXT, lead_inquiry TEXT)`);
  assert.deepEqual(rc.declarePurge("capture-requests", [{ name: "capture_requests", keys: ["target"], clears: ["lead_inquiry"] }]), { ok: true });
  assert.equal(rc.declarePurge("x", [{ name: "t2", clears: ["bad col"] }]).reason, "TABLE_NAME_INVALID");
  assert.equal(rc.declarePurge("x", [{ name: "t3", clears: "lead" }]).reason, "TABLE_NAME_INVALID");
  put(rc, "INQ-2026-0001-a", "K1"); put(rc, "INFO-2026-0001-t", "K1");
  s.sql.exec(`INSERT INTO capture_requests VALUES ('r1', 'INFO-2026-0001-t', 'INQ-2026-0001-a'), ('r2', 'INFO-2099-0001-x', 'INQ-2026-0001-a'),
              ('r3', 'INFO-2099-0002-y', 'INQ-2026-0002-b')`);
  const r = recordCoreOps(rc, opsUrl("purge", { bundleId: "INQ-2026-0001-a" }), null).purge();
  assert.equal(r.scope, "INQ-2026-0001-a");
  assert.deepEqual(rows(s, `SELECT id, target, lead_inquiry FROM capture_requests ORDER BY id`).map((x) => ({ ...x })), [
    { id: "r1", target: "INFO-2026-0001-t", lead_inquiry: null }, { id: "r2", target: "INFO-2099-0001-x", lead_inquiry: null },
    { id: "r3", target: "INFO-2099-0002-y", lead_inquiry: "INQ-2026-0002-b" }], "the lead cleared where it named the bundle; the rows stay");
  rc.purge({ bundleId: "INFO-2026-0001-t" });
  assert.deepEqual(rows(s, `SELECT id FROM capture_requests ORDER BY id`).map((x) => x.id), ["r2", "r3"], "the keyed form still deletes by target");
  /* in the purge's transaction: a purge that rolls back takes its clearing back with it */
  s.sql.exec(`UPDATE capture_requests SET lead_inquiry='INQ-2026-0002-b'`);
  assert.throws(() => rc.transact(() => { rc.purge({ bundleId: "INQ-2026-0002-b" }); throw new Error("rolled"); }));
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM capture_requests WHERE lead_inquiry='INQ-2026-0002-b'`)[0].n, 2);
  rc.purge({});
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM capture_requests`)[0].n, 0, "the whole-store form clears the table, as declared");
});

/* ---- T20 layer 2: R74, this module's share of the instance's figures (K861, K877, plane R10) ---- */

/* A viewer's sight as plane hands it to R74: membership's `hiddenBundles` shape over a gate that hides one project and its bundles. */
const HIDDEN_PROJECT = "PROJ-2026-0001-p";
const hiddenOf = (gate) => ({ sql: `(SELECT bundle_id FROM bundles EXCEPT SELECT b.bundle_id FROM bundles b WHERE (${gate.sql}))`, args: [...gate.args] });
const HID = hiddenOf({ sql: "COALESCE(b.project, '') <> ?", args: [HIDDEN_PROJECT] });

/* Bundles in and out of the hidden project, with live files and history, and connections' `refs` (a stand-in of its
   shape), which is not this module's figure (K877). */
function figuresFixture() {
  const { s, rc } = fresh();
  const c = (id, k, project, n = 1) => rc.commit({ bundleId: id, type: "information", snapKey: k, project,
    files: Array.from({ length: n }, (_, i) => file(i ? `n${i}.md` : "bundle.md", `${id}${k}${i}`)) });
  c(HIDDEN_PROJECT, "K1", HIDDEN_PROJECT); c(HIDDEN_PROJECT, "K2", HIDDEN_PROJECT, 2);
  c("INFO-2026-0001-a", "K1", HIDDEN_PROJECT, 3); c("INFO-2026-0001-a", "K2", HIDDEN_PROJECT, 2);
  c("INFO-2026-0002-b", "K1", null, 2); c("INFO-2026-0002-b", "K2", null);
  c("INFO-2026-0003-c", "K1", "PROJ-2026-0002-q");
  s.db.exec(`CREATE TABLE refs (bundle_id TEXT, target_id TEXT)`);
  s.sql.exec(`INSERT INTO refs VALUES ('INFO-2026-0001-a', 'INFO-2026-0002-b'), ('INFO-2026-0002-b', NULL)`);
  return { s, rc };
}

/* The three figures as R74 defines them, computed from the rows in JS: a row is dropped when its bundle_id
   names a hidden bundle. */
function expectedFigures(s, hidden) {
  const out = {};
  for (const t of ["bundles", "files", "history"])
    out[t] = rows(s, `SELECT bundle_id FROM ${t}`).filter((r) => !(r.bundle_id !== null && hidden.has(r.bundle_id))).length;
  return out;
}
const hiddenIds = (s) => new Set(rows(s, `SELECT bundle_id FROM bundles WHERE COALESCE(project, '') = ?`, HIDDEN_PROJECT).map((r) => r.bundle_id));

test("R74: the exported figure source answers bundles, files and history as R74 counts them, whole for a null hid and less a hidden project's rows through hid; refs is not its figure", () => {
  const { s, rc } = figuresFixture();
  assert.deepEqual(RecordCore.COUNT_KEYS, ["bundles", "files", "history"], "its key list, in order; no refs (K877)");
  assert.ok(Object.isFrozen(RecordCore.COUNT_KEYS));
  const hidden = hiddenIds(s);
  assert.deepEqual([...hidden].sort(), ["INFO-2026-0001-a", HIDDEN_PROJECT], "the fixture hides a project and its bundle");
  const whole = expectedFigures(s, new Set()), sighted = expectedFigures(s, hidden);
  assert.deepEqual(whole, { bundles: 4, files: 6, history: 6 });
  assert.deepEqual(sighted, { bundles: 2, files: 2, history: 2 });
  assert.deepEqual(rc.ownCounts(null), whole, "a null hid counts whole");
  assert.deepEqual(rc.ownCounts(), whole);
  assert.deepEqual(rc.ownCounts(HID), sighted, "less the hidden project's rows, by bundle_id");
  assert.deepEqual(Object.keys(rc.ownCounts(HID)), RecordCore.COUNT_KEYS, "exactly its keys: refs is connections' table");
  /* a row naming a bundle not held is in no sight's hid, so it is never dropped (bundle_id is NOT NULL in all three tables,
     so R74's NULL reading has nothing to read here) */
  s.sql.exec(`INSERT INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES ('INFO-2099-0000-gone','KX','p','x',NULL,'0','t')`);
  assert.deepEqual(rc.ownCounts(HID), { ...sighted, history: 3 });
  assert.deepEqual(rc.ownCounts(HID), expectedFigures(s, hidden));
  /* a sight that hides nothing, and one that hides everything (a viewer the gate refuses) */
  assert.deepEqual(rc.ownCounts(hiddenOf({ sql: "1=1", args: [] })), expectedFigures(s, new Set()));
  assert.deepEqual(rc.ownCounts(hiddenOf({ sql: "0=1", args: [] })), { bundles: 0, files: 0, history: 1 }, "only the row naming no held bundle stays");
  /* it follows the tables, and writes nothing */
  const before = dump(s);
  rc.ownCounts(HID); rc.ownCounts(null);
  assert.deepEqual(dump(s), before);
  rc.commit({ bundleId: "INFO-2026-0004-d", type: "information", snapKey: "K1", project: HIDDEN_PROJECT, files: [file("bundle.md", "d")] });
  assert.deepEqual(rc.ownCounts(HID), expectedFigures(s, hiddenIds(s)));
  assert.equal(rc.ownCounts(null).bundles, 5);
});

test("R74 R63: registered through R63 under this module's name the export answers the three figures, and the module registers nothing itself", () => {
  const { s, rc } = figuresFixture();
  assert.deepEqual(rc.counts(null), {}, "nothing registered: record-core registers no figure of its own");
  assert.deepEqual(rc.registerCounts("record-core", [...RecordCore.COUNT_KEYS], (hid) => rc.ownCounts(hid)),
                   { ok: true, module: "record-core", keys: ["bundles", "files", "history"] }, "the name and keys are free for plane to register");
  assert.deepEqual(rc.counts(null), expectedFigures(s, new Set()));
  assert.deepEqual(rc.counts(HID), expectedFigures(s, hiddenIds(s)));
  /* beside another module's figures, as plane spreads them, each in its registration order */
  rc.registerCounts("connections", ["refs"], () => ({ refs: 2 }));
  assert.deepEqual(Object.keys(rc.counts(HID)), ["bundles", "files", "history", "refs"], "refs is another registration's key, never this one's");
  /* a table that cannot be read is a null figure, never zero */
  const bare = recordOf({ storage: storage({ schema: false }) });
  assert.deepEqual(bare.ownCounts(null), {});
  bare.registerCounts("record-core", [...RecordCore.COUNT_KEYS], (hid) => bare.ownCounts(hid));
  assert.deepEqual(bare.counts(HID), { bundles: null, files: null, history: null });
  assert.deepEqual(rc.ownCounts({ sql: "(no sql", args: [] }), {}, "a hid SQLite cannot read: no figure, never a throw");
});

test("R74 R64 R72: in purge's proof, through a stats source spreading R63's figures as plane's does, the three are whole before and after, and removed is their difference", () => {
  const { s, rc } = figuresFixture();
  rc.registerCounts("record-core", [...RecordCore.COUNT_KEYS], (hid) => rc.ownCounts(hid));
  /* the plane's source: the viewer's hid, null for a viewer never sent (purge's proof is asked with none) */
  const asked = [];
  rc.registerStatsSource("plane", ({ viewer, proof }) => { asked.push([viewer, proof]); return { ...rc.counts(viewer === undefined ? null : HID) }; });
  assert.deepEqual(rc.stats({ viewer: "member:iris" }), expectedFigures(s, hiddenIds(s)), "op=stats through the viewer's sight");
  assert.deepEqual(rc.stats({}), expectedFigures(s, new Set()), "a viewer never sent counts whole");
  const whole = expectedFigures(s, new Set());
  const r = recordCoreOps(rc, opsUrl("purge", { bundleId: "INFO-2026-0001-a" }), null).purge();
  assert.deepEqual(asked.slice(-2), [[undefined, true], [undefined, true]], "the proof is asked whole, before and after");
  const pick = (o) => Object.fromEntries(RecordCore.COUNT_KEYS.map((k) => [k, o[k]]));
  assert.deepEqual(pick(r.before), whole, "before: whole, the hidden project's rows included");
  assert.deepEqual(pick(r.after), expectedFigures(s, new Set()));
  assert.deepEqual(pick(r.after), { bundles: 3, files: 4, history: 3 });
  assert.deepEqual(pick(r.removed), { bundles: 1, files: 2, history: 3 }, "removed: before less after, for each of the three");
  const all = recordCoreOps(rc, opsUrl("purge", {}), null).purge();
  assert.deepEqual(pick(all.after), { bundles: 0, files: 0, history: 0 });
  assert.deepEqual(pick(all.removed), pick(r.after));
});

/* ---- T23 layer 2: R37's reads `corpus-export` makes (N484, K1024, K1114) ---- */

/* corpus-export's working-corpus export (its R1; `corpus-export/index.mjs` exportManifest), each read as it states it:
   `bundles` first, then for each bundle its live `files`, its `manifest` entries ranked by `created` then `rowid`, and
   its `history` snapshots. `connections`' `refs`, which the export also reads, is not this module's (R31). */
const EXPORT_READS = Object.freeze({
  bundles: `SELECT bundle_id, object_type, title, current_state, bundle_sha, row_version, created, last_updated
              FROM bundles ORDER BY bundle_id`,
  files: `SELECT path, sha256, bytes, blob_sha, (content IS NOT NULL) AS inline FROM files WHERE bundle_id=? ORDER BY path`,
  manifest: `SELECT snap_key, kind, base, author, created, writer, operation FROM manifest WHERE bundle_id=? ORDER BY created, rowid`,
  history: `SELECT snap_key, path, sha256, created FROM history WHERE bundle_id=? ORDER BY snap_key, path`,
});
const exportRead = (s) => rows(s, EXPORT_READS.bundles).map((b) => ({ ...b,
  files: rows(s, EXPORT_READS.files, b.bundle_id).map((r) => ({ ...r })),
  promotions: rows(s, EXPORT_READS.manifest, b.bundle_id).map((r) => ({ ...r })),
  snapshots: rows(s, EXPORT_READS.history, b.bundle_id).map((r) => ({ ...r })) }));

/* What R37 says each read column holds, derived from the calls given to `commit` and its answers alone, never from the
   tables: the bundle's row as its commits set it (R33, R41, R44), the last commit's live files, one manifest entry per
   commit (R42), and each replaced file under the snap key and time of the commit that replaced it. */
function exportExpected(calls) {
  const by = new Map();
  for (const { c, answer } of calls) {
    const prev = by.get(c.bundleId);
    const given = (k, dflt) => (c[k] !== undefined ? c[k] : prev ? prev.row[k] : dflt);
    const row = { type: c.type, title: c.title ?? null, state: given("state", ""), created: prev ? prev.row.created : (c.created ?? c.at),
                  lastUpdated: given("lastUpdated", c.at), bundleSha: answer.bundleSha, rowVersion: answer.rowVersion };
    const live = c.files.map((f) => ({ path: f.path, sha256: f.sha256, bytes: f.bytes ?? Buffer.byteLength(f.text),
                                       blob_sha: f.blobSha ?? null, inline: typeof f.text === "string" ? 1 : 0 }));
    const snapshots = [...(prev ? prev.snapshots : []),
                       ...(prev ? prev.live.map((f) => ({ snap_key: c.snapKey, path: f.path, sha256: f.sha256, created: c.at })) : [])];
    const promotions = [...(prev ? prev.promotions : []), { snap_key: c.snapKey, kind: c.kind ?? "promotion", base: c.base ?? null,
                        author: c.author ?? null, created: c.at, writer: c.writer ?? null, operation: c.operation ?? null }];
    by.set(c.bundleId, { row, live, snapshots, promotions });
  }
  const byCreated = (a, b) => (a.created < b.created ? -1 : a.created > b.created ? 1 : 0);   /* stable: a tie keeps write order */
  const byKeyPath = (a, b) => (a.snap_key + "\0" + a.path < b.snap_key + "\0" + b.path ? -1 : 1);
  return [...by.keys()].sort().map((id) => {
    const { row, live, snapshots, promotions } = by.get(id);
    return { bundle_id: id, object_type: row.type, title: row.title, current_state: row.state, bundle_sha: row.bundleSha,
             row_version: row.rowVersion, created: row.created, last_updated: row.lastUpdated,
             files: [...live].sort((a, b) => (a.path < b.path ? -1 : 1)),
             promotions: [...promotions].sort(byCreated), snapshots: [...snapshots].sort(byKeyPath) };
  });
}

function exportFixture() {
  const { s, rc } = fresh();
  const calls = [];
  const c = (call) => { calls.push({ c: call, answer: rc.commit(call) }); };
  const a = "INFO-2026-0001-a", b = "INQ-2026-0002-b", blob = "e".repeat(64);
  /* a: three commits, its title changed and then given none, a blob, and two entries tied on `created` whose snap keys
     sort against write order (M3 is written after Z2), so only `rowid` ranks them */
  c({ bundleId: a, type: "information", title: "First title", snapKey: "A1", kind: "promotion", base: EMPTY_STRING_SHA, author: "alice",
      files: [file("bundle.md", "a one é\r\n"), file("notes/n.md", "n"), { path: "c.pdf", blobSha: blob, bytes: 4096, sha256: blob }],
      state: "collected", group: "g", created: "2026-03-01T00:00:00Z", lastUpdated: "2026-03-01T00:00:00Z", at: "2026-03-01T00:00:00Z" });
  c({ bundleId: a, type: "information", title: "Second title", snapKey: "Z2", kind: "promotion-replay", base: sha("a one é\r\n"),
      author: "token:capture", writer: "monitor", operation: "recheck",
      files: [file("bundle.md", "a two"), { path: "c.pdf", blobSha: blob, bytes: 4096, sha256: blob }],
      state: "verified", lastUpdated: "2026-03-02T00:00:00Z", at: "2026-03-02T00:00:00Z" });
  c({ bundleId: a, type: "information", snapKey: "M3", base: sha("a two"), author: "bob", files: [file("bundle.md", "a three")],
      at: "2026-03-02T00:00:00Z" });
  /* b: one commit naming no state, no title and no times: the defaults R37's columns then hold */
  c({ bundleId: b, type: "inquiry", snapKey: "K1", author: "carol", files: [file("bundle.md", "b one")], at: "2026-03-05T00:00:00Z" });
  return { s, rc, calls, a, b };
}

test("R37 (N484): the columns corpus-export reads hold what R37 states, bundles' title and bundle_sha first, then every other column of its read, written through commit and read in its own SQL", () => {
  const { s, rc, calls, a, b } = exportFixture();
  /* bundles' title and bundle_sha first: the title the last commit gave (NULL when it gave none), and R41's bundleSha,
     the digest of the bundle's bundle.md as the last commit answered it */
  const bundles = rows(s, EXPORT_READS.bundles).map((r) => ({ ...r }));
  assert.deepEqual(bundles.map((r) => [r.bundle_id, r.title, r.bundle_sha]), [[a, null, sha("a three")], [b, null, sha("b one")]]);
  assert.deepEqual(bundles.map((r) => r.title), [rc.bundleInfo(a).title, rc.bundleInfo(b).title], "R34's title");
  assert.deepEqual(bundles.map((r) => r.bundle_sha), [rc.head(a).bundleSha, rc.head(b).bundleSha], "R41's bundleSha");
  assert.deepEqual(calls.filter((x) => x.c.bundleId === a).map((x) => x.answer.bundleSha), [sha("a one é\r\n"), sha("a two"), sha("a three")],
                   "bundle_sha moves with each commit's bundle.md");
  /* the whole read, every column, against what the commits were given and answered */
  const got = exportRead(s);
  assert.deepEqual(got, exportExpected(calls));
  /* the points the derivation turns on, stated outright */
  const [ga, gb] = got;
  assert.deepEqual([ga.object_type, ga.current_state, ga.row_version, ga.created, ga.last_updated],
                   ["information", "verified", 3, "2026-03-01T00:00:00Z", "2026-03-02T00:00:00Z"], "state and last_updated kept when a commit gives none");
  assert.deepEqual([gb.current_state, gb.created, gb.last_updated, gb.row_version], ["", "2026-03-05T00:00:00Z", "2026-03-05T00:00:00Z", 1],
                   "a creation naming no state or times: the empty state, and the commit's time");
  assert.deepEqual(ga.files, [{ path: "bundle.md", sha256: sha("a three"), bytes: Buffer.byteLength("a three"), blob_sha: null, inline: 1 }],
                   "files: the last commit's live files only");
  assert.deepEqual(rows(s, EXPORT_READS.files, "INFO-2099-0000-z"), [], "a bundle not held has no files");
  assert.deepEqual(ga.promotions.map((p) => p.snap_key), ["A1", "Z2", "M3"], "the tie under created is ranked by rowid, in write order, never by the key");
  assert.deepEqual(ga.snapshots.map((h) => [h.snap_key, h.path, h.created]), [["M3", "bundle.md", "2026-03-02T00:00:00Z"],
    ["M3", "c.pdf", "2026-03-02T00:00:00Z"], ["Z2", "bundle.md", "2026-03-02T00:00:00Z"], ["Z2", "c.pdf", "2026-03-02T00:00:00Z"],
    ["Z2", "notes/n.md", "2026-03-02T00:00:00Z"]], "history: each replaced file under the replacing commit's key and time");
  assert.deepEqual(ga.snapshots.find((h) => h.snap_key === "Z2" && h.path === "c.pdf").sha256, "e".repeat(64), "a blob's snapshot keeps its digest");
  assert.deepEqual(rows(s, `SELECT path, sha256, bytes, blob_sha, (content IS NOT NULL) AS inline FROM files WHERE bundle_id=? ORDER BY path`, a)
    .map((r) => ({ ...r })), ga.files, "the read is the export's text");
  /* the types the reads rely on */
  const cols = (t) => Object.fromEntries(rows(s, `PRAGMA table_info(${t})`).map((r) => [r.name, r]));
  assert.deepEqual([cols("bundles").title.type, cols("bundles").title.notnull, cols("bundles").bundle_sha.type, cols("bundles").bundle_sha.notnull],
                   ["TEXT", 0, "TEXT", 1]);
});

test("R37 (N484): negative control: a read column that held anything but what R37 states is caught, column by column, so the read above is checked whole", () => {
  const { s, calls, a, b } = exportFixture();
  const want = exportExpected(calls);
  assert.deepEqual(exportRead(s), want, "the control starts from a compliant store");
  /* one wrong value at a time, in every column the export reads and in the manifest's write order, each undone after */
  const wrong = [
    ["bundles", "title", "'Some title'", `bundle_id='${a}'`], ["bundles", "bundle_sha", `'${sha("a two")}'`, `bundle_id='${a}'`],
    ["bundles", "bundle_id", `'INFO-2026-0001-z'`, `bundle_id='${a}'`], ["bundles", "object_type", "'inquiry'", `bundle_id='${a}'`],
    ["bundles", "current_state", "'collected'", `bundle_id='${a}'`], ["bundles", "row_version", "2", `bundle_id='${a}'`],
    ["bundles", "created", "'2026-03-02T00:00:00Z'", `bundle_id='${a}'`], ["bundles", "last_updated", "'2026-03-09T00:00:00Z'", `bundle_id='${b}'`],
    ["files", "path", "'bundle2.md'", `bundle_id='${b}'`], ["files", "sha256", `'${sha("x")}'`, `bundle_id='${b}'`],
    ["files", "bytes", "99", `bundle_id='${b}'`], ["files", "blob_sha", `'${"f".repeat(64)}'`, `bundle_id='${b}'`],
    ["files", "content", "NULL", `bundle_id='${b}'`],
    ["manifest", "snap_key", "'Q9'", `bundle_id='${b}'`], ["manifest", "kind", "'promotion-replay'", `bundle_id='${b}'`],
    ["manifest", "base", `'${EMPTY_STRING_SHA}'`, `bundle_id='${b}'`], ["manifest", "author", "'mallory'", `bundle_id='${b}'`],
    ["manifest", "created", "'2026-03-06T00:00:00Z'", `bundle_id='${b}'`], ["manifest", "writer", "'monitor'", `bundle_id='${b}'`],
    ["manifest", "operation", "'recheck'", `bundle_id='${b}'`],
    ["history", "snap_key", "'Y2'", `bundle_id='${a}' AND snap_key='Z2' AND path='notes/n.md'`],
    ["history", "path", "'notes/m.md'", `bundle_id='${a}' AND snap_key='Z2' AND path='notes/n.md'`],
    ["history", "sha256", `'${sha("x")}'`, `bundle_id='${a}' AND snap_key='Z2' AND path='notes/n.md'`],
    ["history", "created", "'2026-03-09T00:00:00Z'", `bundle_id='${a}' AND snap_key='Z2' AND path='notes/n.md'`],
  ];
  for (const [table, column, value, where] of wrong) {
    s.db.exec("SAVEPOINT wrong");
    s.db.exec(`UPDATE ${table} SET ${column}=${value} WHERE ${where}`);
    assert.notDeepEqual(exportRead(s), want, `${table}.${column} holding ${value} is caught`);
    s.db.exec("ROLLBACK TO wrong"); s.db.exec("RELEASE wrong");
    assert.deepEqual(exportRead(s), want, `${table}.${column} restored`);
  }
  /* the manifest's rank: M3 recorded before Z2, their created tied, is caught (rowid is the tie-break, R16) */
  s.db.exec("SAVEPOINT reorder");
  const entries = rows(s, `SELECT * FROM manifest WHERE bundle_id=? ORDER BY rowid`, a).map((r) => ({ ...r }));
  s.sql.exec(`DELETE FROM manifest WHERE bundle_id=?`, a);
  for (const e of [entries[0], entries[2], entries[1]])
    s.sql.exec(`INSERT INTO manifest (${Object.keys(e).join(",")}) VALUES (${Object.keys(e).map(() => "?").join(",")})`, ...Object.values(e));
  assert.notDeepEqual(exportRead(s), want, "entries recorded out of write order are caught");
  s.db.exec("ROLLBACK TO reorder"); s.db.exec("RELEASE reorder");
  assert.deepEqual(exportRead(s), want);
});

/* ---- T24 layer 2: R75 `recordOpaqueId`, its rows C-59.7–C-59.9 (N503, K1151) ---- */

const ledger = (s) => rows(s, `SELECT id, source FROM minted_ids ORDER BY rowid`).map((r) => [r.id, r.source]);
const OPAQUE_ROWS = { OPAQUE_ID_MALFORMED: "C-59.7", OPAQUE_ID_SPENT: "C-59.8", OPAQUE_ID_NO_TRANSACTION: "C-59.9" };
/* A refusal of R75 as its row words it: the code, the row's check and translation, a detail, and the id when it names one. */
function opaqueRefusal(r, code, id) {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, OPAQUE_ROWS[code], RECORD_CORE_CHECKS[code].translation], code);
  assert.equal(typeof r.detail, "string");
  if (id !== undefined) { assert.equal(r.id, id, `${code} names the id`); assert.ok(r.detail.includes(id)); }
  else assert.ok(!("id" in r), `${code} names no id`);
}

test("R75: OPAQUE_ID_MALFORMED (C-59.7), OPAQUE_ID_SPENT (C-59.8) and OPAQUE_ID_NO_TRANSACTION (C-59.9) are this module's rows, each where naming recordOpaqueId's region", () => {
  for (const [code, check] of Object.entries(OPAQUE_ROWS)) {
    const row = RECORD_CORE_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, "src/record-core/index.mjs recordOpaqueId > is-opaque-id-refused"], code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40 && !/C-59|OPAQUE_ID/.test(row.translation), `${code}: a member's sentence`);
    assert.ok(Object.isFrozen(row));
  }
  for (const code of ["OPAQUE_ID_MALFORMED", "OPAQUE_ID_NO_TRANSACTION"]) assert.ok(RECORD_CORE_CHECKS[code].translation.endsWith(BUILD_FAULT), `${code} is a build fault`);
  assert.ok(!RECORD_CORE_CHECKS.OPAQUE_ID_SPENT.translation.includes(BUILD_FAULT), "a spent id is not a build fault: a retry gives a new one");
  const checks = Object.values(RECORD_CORE_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "no number is held twice");
});

test("R75 R6 R8: recordOpaqueId records a chosen id inside the caller's transaction; once committed, mintOpaqueId never draws it and neither purge forgets it", () => {
  const { s, rc } = fresh();
  const chosen = ["NOTE-2026-0042", "NOTE-2026-0043-a-slug", "urn:notice:7f3a", " "];
  const got = rc.transact(() => {
    const answers = chosen.map((id) => rc.recordOpaqueId(id));
    assert.deepEqual(ledger(s).map(([id]) => id), chosen, "recorded before it answers, inside the open transaction");
    return { ok: true, answers };
  });
  assert.deepEqual(got.answers, chosen.map((id) => ({ ok: true, id })));
  assert.deepEqual(ledger(s), chosen.map((id) => [id, "chosen"]), "in the opaque-id ledger, as chosen");
  /* R6: a draw that lands on a recorded id draws again, without asking the caller's taken() for it */
  const asked = [];
  assert.equal(draws([42, 44], () => rc.mintOpaqueId("NOTE", "2026", "", (id) => { asked.push(id); return false; })), "NOTE-2026-0044");
  assert.deepEqual(asked, ["NOTE-2026-0044"]);
  assert.equal(draws([43, 45], () => rc.mintOpaqueId("NOTE", "2026", "-a-slug", () => false)), "NOTE-2026-0045-a-slug");
  /* R8: either form of purge, and the id stays spent, for any caller */
  put(rc, "INFO-2026-0001-a", "K1");
  rc.purge({ bundleId: "INFO-2026-0001-a" });
  rc.purge({});
  assert.equal(draws([42, 46], () => rc.mintOpaqueId("NOTE", "2026", "", () => false)), "NOTE-2026-0046");
  assert.ok(chosen.every((id) => ledger(s).some(([x]) => x === id)), "the ledger kept every recorded id through both purges");
  /* a second recording of it, after the purge, is refused */
  rc.transact(() => { opaqueRefusal(rc.recordOpaqueId("NOTE-2026-0042"), "OPAQUE_ID_SPENT", "NOTE-2026-0042"); return { ok: true }; });
  /* the same act may record and mint in one transaction, each seeing the other */
  rc.transact(() => {
    assert.deepEqual(rc.recordOpaqueId("NOTE-2026-0050"), { ok: true, id: "NOTE-2026-0050" });
    assert.equal(draws([50, 51], () => rc.mintOpaqueId("NOTE", "2026", "", () => false)), "NOTE-2026-0051");
    opaqueRefusal(rc.recordOpaqueId("NOTE-2026-0051"), "OPAQUE_ID_SPENT", "NOTE-2026-0051");
    return { ok: true };
  });
});

test("R75 R7 R32: a rollback takes a recorded id back: a throw, a refusal, and a savepoint refused under a committing outer call", () => {
  const { s, rc } = fresh();
  const before = dump(s);
  assert.throws(() => rc.transact(() => { assert.equal(rc.recordOpaqueId("NOTE-2026-0001").ok, true); throw new Error("rolled"); }), /rolled/);
  assert.deepEqual(dump(s), before, "a throw took it back");
  assert.deepEqual(rc.transact(() => { rc.recordOpaqueId("NOTE-2026-0001"); return { ok: false, reason: "LATER_STEP" }; }), { ok: false, reason: "LATER_STEP" });
  assert.deepEqual(dump(s), before, "a refusal took it back");
  rc.transact(() => {
    rc.recordOpaqueId("NOTE-2026-0002");
    rc.transact(() => { assert.equal(rc.recordOpaqueId("NOTE-2026-0003").ok, true); return { ok: false }; });
    try { rc.transact(() => { rc.recordOpaqueId("NOTE-2026-0004"); throw new Error("inner"); }); } catch { /* the outer decides the rest */ }
    rc.transact(() => rc.recordOpaqueId("NOTE-2026-0005"));
    return { ok: true };
  });
  assert.deepEqual(ledger(s).map(([id]) => id), ["NOTE-2026-0002", "NOTE-2026-0005"], "only the committed ones stand");
  /* a rolled-back id is free again: to record, and to draw */
  assert.equal(draws([1], () => rc.mintOpaqueId("NOTE", "2026", "", () => false)), "NOTE-2026-0001");
  rc.transact(() => { assert.deepEqual(rc.recordOpaqueId("NOTE-2026-0003"), { ok: true, id: "NOTE-2026-0003" }); return { ok: true }; });
  assert.equal(draws([3, 4], () => rc.mintOpaqueId("NOTE", "2026", "", () => false)), "NOTE-2026-0004");
  /* the one instance per storage (R39): a transaction opened through one handle is the one recorded in through another */
  const other = recordOf({ storage: s });
  assert.throws(() => rc.transact(() => { assert.equal(other.recordOpaqueId("NOTE-2026-0099").ok, true); throw new Error("x"); }));
  assert.ok(!ledger(s).some(([id]) => id === "NOTE-2026-0099"));
});

test("R75: each refusal records nothing: OPAQUE_ID_MALFORMED, OPAQUE_ID_SPENT for a drawn, recorded or seeded id, OPAQUE_ID_NO_TRANSACTION outside any transact", () => {
  const { s, rc } = fresh();
  s.db.exec(`CREATE TABLE notices (id TEXT)`);
  s.sql.exec(`INSERT INTO notices VALUES ('NOTE-2026-0700')`);
  s.sql.exec(`INSERT INTO seq (scope,next) VALUES ('CASE-2025', 3)`);
  rc.seedMintLedger([["NOTE", "notices", "id"]]);                        /* seeded: a live row, and the counter's range */
  const drawn = draws([7], () => rc.mintOpaqueId("CASE", "2026", "", () => false));
  rc.transact(() => rc.recordOpaqueId("NOTE-2026-0800"));
  const held = ledger(s);
  assert.deepEqual(held.map(([, src]) => src).sort(), ["chosen", "counter", "counter", "live", "mint"]);
  const before = dump(s);
  /* refused inside a transaction that then COMMITS: the refusal itself wrote nothing */
  rc.transact(() => {
    for (const bad of [undefined, null, "", 7, 0, true, {}, ["NOTE-2026-0001"], new String("NOTE-2026-0001"), Symbol("x")])
      opaqueRefusal(rc.recordOpaqueId(bad), "OPAQUE_ID_MALFORMED");
    opaqueRefusal(rc.recordOpaqueId(), "OPAQUE_ID_MALFORMED");
    for (const id of [drawn, "NOTE-2026-0800", "NOTE-2026-0700", "CASE-2025-0001", "CASE-2025-0002"])
      opaqueRefusal(rc.recordOpaqueId(id), "OPAQUE_ID_SPENT", id);
    return { ok: true };
  });
  assert.deepEqual(dump(s), before, "every refusal recorded nothing, though its transaction committed");
  assert.deepEqual(rc.transact(() => rc.recordOpaqueId("NOTE-2026-0700")).code, "OPAQUE_ID_SPENT", "answered from a transact, it rolls the caller back");
  /* the control: the same ids not yet spent are recorded, so the refusals above were the ledger's, not the call's */
  rc.transact(() => { for (const id of ["NOTE-2026-0701", "CASE-2025-0003"]) assert.equal(rc.recordOpaqueId(id).ok, true, id); return { ok: true }; });
  /* outside any transaction, whatever the id: refused, nothing recorded */
  const outside = dump(s);
  for (const id of ["NOTE-2026-0900", "NOTE-2026-0800"]) opaqueRefusal(rc.recordOpaqueId(id), "OPAQUE_ID_NO_TRANSACTION", id);
  opaqueRefusal(rc.recordOpaqueId(""), "OPAQUE_ID_MALFORMED");
  /* a held afterCommit call runs after its transaction committed: outside it, so refused too (R66) */
  let late;
  rc.transact(() => { rc.afterCommit(() => { late = rc.recordOpaqueId("NOTE-2026-0901"); }); return { ok: true }; });
  opaqueRefusal(late, "OPAQUE_ID_NO_TRANSACTION", "NOTE-2026-0901");
  assert.deepEqual(dump(s), outside, "nothing recorded outside a transaction");
  assert.equal(draws([900], () => rc.mintOpaqueId("NOTE", "2026", "", () => false)), "NOTE-2026-0900", "a refused id is still free to draw");
});

test("R75: recordOpaqueId never throws; a ledger it cannot read or write answers OPAQUE_ID_SPENT and records nothing (fail closed)", () => {
  /* a store with no ledger table */
  const bare = recordOf({ storage: storage({ schema: false }) });
  let r;
  assert.doesNotThrow(() => { r = bare.transact(() => bare.recordOpaqueId("NOTE-2026-0001")); });
  opaqueRefusal(r, "OPAQUE_ID_SPENT", "NOTE-2026-0001");
  /* a store whose every read fails */
  const broken = recordOf({ storage: { sql: { exec() { throw new Error("no"); } }, transactionSync: (f) => f() } });
  assert.doesNotThrow(() => { r = broken.transact(() => broken.recordOpaqueId("NOTE-2026-0002")); });
  opaqueRefusal(r, "OPAQUE_ID_SPENT", "NOTE-2026-0002");
  /* a ledger that reads but cannot be written: spent, never a throw, nothing recorded */
  const { s, rc } = fresh();
  rc.transact(() => rc.recordOpaqueId("NOTE-2026-0003"));
  const exec = s.sql.exec;
  s.sql.exec = (q, ...a) => (/^INSERT/.test(q) ? (() => { throw new Error("SQLITE_FULL"); })() : exec(q, ...a));
  const before = dump(s);
  assert.doesNotThrow(() => { r = rc.transact(() => rc.recordOpaqueId("NOTE-2026-0004")); });
  s.sql.exec = exec;
  opaqueRefusal(r, "OPAQUE_ID_SPENT", "NOTE-2026-0004");
  assert.deepEqual(dump(s), before);
  /* hostile input */
  const hostile = new Proxy({}, { get() { throw new Error("get"); } });
  assert.doesNotThrow(() => { r = rc.transact(() => rc.recordOpaqueId(hostile)); });
  opaqueRefusal(r, "OPAQUE_ID_MALFORMED");
});
