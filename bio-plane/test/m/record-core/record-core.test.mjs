/* record-core: requirement-named tests at the module's interface (build/requirements/record-core.md).
   Each test names the requirement ids it checks in its title. The module runs over `storage.mjs`, a
   Durable Object storage stand-in on node:sqlite; a fresh storage per test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { checkBundle, PER_ITEM_CHECKS } from "../../../checks/bio-checks.mjs";
import { recordOf, RecordCore, RECORD_SCHEMA, stampInstant, instantOrder, PER_ITEM_MAX, perItem, EMPTY_STRING_SHA, fileDigestOf,
         inlineBytesOf } from "../../../src/record-core/index.mjs";
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
    resolveTarget: (t) => known.has(t), ...extra });
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
  s.sql.exec = (q, ...a) => { const r = exec(q, ...a); if (/^\s*SELECT/i.test(q)) reads.push({ q, n: r.length }); return r; };
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
                   "digestCensus", "snapKeyCensus", "registerAuditCheck", "textAtSha"])
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
