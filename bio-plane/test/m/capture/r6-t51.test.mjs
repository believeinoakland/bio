/* capture, fix round 6 of T51 (K4570, K4571; the plan's G2, G4, G6, G12a, G12d): what a large web capture hands the act and the notice
   (`fetch_done`; `heldAt`'s look is bounded), a held row's capture is the document's whole and never one of its parts, the picker row
   names its format, the archive grouping asks the store nothing for a digest acquisition holds as no archive, and the door never
   turns a kept capture into a failed act when its reading cannot be had. At the module's interface (its exported services, its
   routes and `captureOp`) over this module's fixture. R77 (rows), R91 (the page's work), R96 (the look), R104 (fetch_done), R105 (the
   bound of the look), R73 (the act's answer). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, receipt, sha, governor, provenance, H } from "./fixture.mjs";
import * as acquisition from "../../../src/acquisition/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { captureOp } from "../../../src/capture/ops.mjs";

const MiB = 1024 * 1024;
const ADMIN = "class:admin";
const NOW = "2026-03-12T00:00:00Z";
const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();
const hex = (n, c) => String(c).repeat(64).slice(0, 64).replace(/^./, String(n));

/* ---- G6, G12d (R77): the row's capture is the document's whole ---- */

/* A document of a multipart upload: its register holds the parts and, when `wholeRow`, the whole's own row (provenance R72, `whole` 1); its
   register document states `parts`. The parts' digests sort BELOW the whole's, as the walker's 0115 did. */
function multipart({ wholeRow = true, size = 41502904, inStore = "whole", stated = true } = {}) {
  const b = bucket();
  const f = fresh({ evidence: b, env: {} });
  if (wholeRow) f.s.db.exec(`ALTER TABLE register ADD COLUMN whole INTEGER NOT NULL DEFAULT 0`);
  const whole = H("f0"), parts = ["10", "11", "12", "13", "14"].map((x) => H(x));
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES ('INFO-1', 'information', 'g', 'the 40 MB file', 'collected', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'x', 1)`);
  const at = "2026-01-01T00:00:00Z";
  parts.forEach((p, i) => f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes, registered) VALUES (?, 'INFO-1', ?, ?, ?)`,
                                       p, `snapshots/upload-${whole}.part00${i}`, i < 4 ? 8 * MiB : size - 4 * 8 * MiB, at));
  if (wholeRow) f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes, registered, whole) VALUES (?, 'INFO-1', 'x', ?, ?, 1)`, whole, size, at);
  const doc = { capture: { sha256: whole, bytes: size, method: "uploaded" }, profile: { format: { format: "pdf" } },
                ...(stated ? { parts: parts.map((p, i) => ({ file: `x.part00${i}`, sha256: p, bytes: i < 4 ? 8 * MiB : size - 4 * 8 * MiB })) } : {}) };
  f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-1', 'data/provenance.json', ?, NULL, 1, 'x')`,
               JSON.stringify({ documents: [doc] }));
  f.s.sql.exec(`INSERT INTO capture_actors (capture_sha, actor, at) VALUES (?, 'member:m1', '2026-01-01T00:00:00Z')`, whole);
  receipt(f.s, { address: `upload:${whole}`, capture: whole, via: "upload", first: "2026-01-01T00:00:00Z" });
  /* the part of the store the walker's 0115 had: each part held, the whole held or not */
  for (const p of parts) b.held.set(`bio/captures/${p}`, new Uint8Array(8));
  if (inStore === "whole") b.held.set(`bio/captures/${whole}`, new Uint8Array(8));
  return { ...f, b, whole, parts };
}

test("R77 G6 (fix round 6): a 5-part upload whose parts sort below the whole is a row whose capture is the whole and its size the whole's, 41,502,904 bytes, in the full and the picker rows", async () => {
  const w = multipart();
  const full = (await w.c.heldCaptures({ viewer: ADMIN, now: NOW })).held[0];
  assert.equal(full.capture.sha256, w.whole, "the whole, not the lowest-sorting part");
  assert.equal(full.bytes, 41502904);
  assert.equal(full.actor, "member:m1", "the actor is the whole's: an upload records it under the whole");
  assert.equal(full.format, "pdf", "the format is the document's");
  const pick = (await w.c.heldCaptures({ viewer: ADMIN, fields: "picker", now: NOW })).held[0];
  assert.equal(pick.capture.sha256, w.whole);
  assert.equal(pick.actor, "member:m1");
});

test("R77 G6 (fix round 6): a document whose register holds only the parts (no whole row yet) and whose register document states its parts still answers the whole (controls: a one-part document is its own capture)", async () => {
  const w = multipart({ wholeRow: false });
  const full = (await w.c.heldCaptures({ viewer: ADMIN, now: NOW })).held[0];
  assert.equal(full.capture.sha256, w.whole);
  assert.equal(full.bytes, 41502904);
  const one = fresh({ evidence: bucket() });
  const d = H("a1");
  one.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES ('INFO-2', 'information', 'g', 't', 'collected', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'x', 1)`);
  one.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes) VALUES (?, 'INFO-2', 'x', 100)`, d);
  assert.equal((await one.c.heldCaptures({ viewer: ADMIN, now: NOW })).held[0].capture.sha256, d);
});

test("R77 G12d (fix round 6): a 40 MB 5-part row answers `whole` from the store under the whole's digest, never from the first part's size: true when the whole is kept, false when it is not, even though a part is held", async () => {
  for (const [inStore, want] of [["whole", true], ["parts", false]]) {
    const w = multipart({ inStore });
    const heads = [];
    const head = w.b.head.bind(w.b);
    w.b.head = async (k) => { heads.push(k); return head(k); };
    const r = (await w.c.heldCaptures({ viewer: ADMIN, now: NOW })).held[0];
    assert.equal(r.whole, want, inStore);
    assert.deepEqual(heads, [`bio/captures/${w.whole}`], "the store was asked once, about the whole");
  }
  const old = multipart({ wholeRow: false, inStore: "parts" });
  assert.equal((await old.c.heldCaptures({ viewer: ADMIN, now: NOW })).held[0].whole, false, "no whole row in the register: the stated whole is still what is asked");
});

/* ---- G12a (R77, R91): the archive grouping asks nothing for what is no archive ---- */

function nullFormat(n) {
  const b = bucket();
  const calls = { head: 0, get: 0 };
  for (const m of ["head", "get"]) { const o = b[m].bind(b); b[m] = async (k, ...a) => { calls[m]++; return o(k, ...a); }; }
  const f = fresh({ evidence: b, env: {} });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const registered = [];
  const prov = acquisitionProvenance({ sql: f.s.sql, registered });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  const docs = [];
  for (let i = 0; i < n; i++) {
    const body = new TextEncoder().encode(`plain document ${i} ${"x".repeat(50 + i)}`);
    const d = sha(body), id = `INFO-${String(i).padStart(3, "0")}`;
    b.held.set(`bio/captures/${d}`, body);
    f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES (?, 'information', 'g', 't', 'collected', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'x', 1)`, id);
    f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes) VALUES (?, ?, 'x', ?)`, d, id, body.length);
    /* the register document profiles the capture with NO format: the case the walker's slow rows were */
    f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, 1, 'x')`,
                 id, JSON.stringify({ documents: [{ capture: { sha256: d }, profile: {} }] }));
    prov.homes[d] = id; registered.push(d);
    docs.push({ id, d });
  }
  return { ...f, b, calls, docs };
}

test("R77 R91 G12a (fix round 6; acquisition's notArchivesAmong): 20 captures profiled with no format, drawn in full twice, make no store call at all the second time", async () => {
  assert.equal(typeof acquisition.notArchivesAmong, "function", "acquisition exports notArchivesAmong (G12a, merge 2): red by name until it merges");
  const w = nullFormat(20);
  await w.c.heldCaptures({ viewer: ADMIN, limit: 500, now: NOW });
  const before = w.calls.head + w.calls.get;
  let listed = 0;
  const archiveList = w.c.archiveList.bind(w.c);
  w.c.archiveList = (...a) => { listed++; return archiveList(...a); };
  await w.c.heldCaptures({ viewer: ADMIN, limit: 500, now: NOW });
  assert.equal(listed, 0, "the second draw does not even ask the archive listing about them");
  assert.equal(w.calls.head + w.calls.get, before, "the second draw asks the store for none of them");
});

test("R77 G12a (fix round 6): the picker row names the format the register document profiles the capture as (null where it names none)", async () => {
  const w = multipart();
  assert.equal((await w.c.heldCaptures({ viewer: ADMIN, fields: "picker", now: NOW })).held[0].format, "pdf");
  const n = nullFormat(1);
  assert.equal((await n.c.heldCaptures({ viewer: ADMIN, fields: "picker", now: NOW })).held[0].format, null);
});

/* ---- G2 (R104): fetch_done ---- */

test("R104 G2 (fix round 6): recordFetchDone records one row per session and fetchesDone lists them oldest first, paged by cursor, bounded; a second record for a session, a blank session, a machine opener record nothing (controls)", () => {
  const { c } = fresh();
  const rec = (o) => c.recordFetchDone(o);
  assert.deepEqual(rec({ session: "s1", document: "INFO-1", opener: "member:ann", project: "P-1", at: "2026-10-22T10:00:00Z" }), { recorded: true });
  assert.deepEqual(rec({ session: "s1", document: "INFO-9", opener: "member:bob", project: "P-2", at: "2026-10-22T11:00:00Z" }), { recorded: false }, "once for a session");
  assert.deepEqual(rec({ session: "s2", document: "INFO-2", opener: "member:ann", project: null, at: "2026-10-22T09:00:00Z" }), { recorded: true });
  for (const bad of [{ session: "", document: "D", opener: "member:ann" }, { session: "s3", document: "", opener: "member:ann" },
                     { session: "s3", document: "D", opener: "" }, { session: "s3", document: "D", opener: "class:admin" }, null, undefined])
    assert.deepEqual(rec(bad), { recorded: false }, JSON.stringify(bad));
  const all = c.fetchesDone({});
  assert.deepEqual(all.fetches.map((x) => x.session), ["s2", "s1"], "oldest first by instant");
  assert.deepEqual(all.fetches[1], { session: "s1", document: "INFO-1", opener: "member:ann", project: "P-1", at: "2026-10-22T10:00:00Z", cursor: all.fetches[1].cursor });
  const one = c.fetchesDone({ limit: 1 });
  assert.deepEqual([one.fetches.length, one.truncated, typeof one.next], [1, true, "string"]);
  assert.deepEqual(c.fetchesDone({ limit: 1, after: one.next }).fetches.map((x) => x.session), ["s1"]);
  assert.equal(c.fetchesDone({ limit: 1, after: one.fetches[0].cursor }).fetches[0].session, "s1");
});

/* ---- G2 (R96, R105): heldAt's look is bounded ---- */

const ADDR = "https://big.example/file.pdf";
function looked() {
  const f = fresh({ gov: governor() });
  f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m1', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  f.c.provenance = Object.assign(provenance(f.s), { captureGrade: () => ({ grade: "B", route: "direct", determined: true, basis: "measured" }) });
  const d = H("a1");
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES ('INFO-1', 'information', 'g', 't', 'collected', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z', 'x', 1)`);
  f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes) VALUES (?, 'INFO-1', 'x', 100)`, d);
  receipt(f.s, { address: ADDR, capture: d, first: "2026-02-01T10:00:00Z" });
  f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-1', 'data/provenance.json', ?, NULL, 1, 'x')`,
               JSON.stringify({ documents: [{ capture: { sha256: d, method: "fetched" } }] }));
  return f;
}
/* a throttled upstream: chunks of 1 MiB on demand, a count of the bytes pulled, optionally a declared length */
function stream({ length = null, total = 100 * MiB } = {}) {
  const pulled = { bytes: 0 };
  const body = new ReadableStream({ pull(ctl) { if (pulled.bytes >= total) return ctl.close(); pulled.bytes += MiB; ctl.enqueue(new Uint8Array(MiB)); } }, { highWaterMark: 0 });
  return { pulled, response: () => new Response(body, { status: 200, headers: length === null ? {} : { "content-length": String(length) } }) };
}

test("R96 R105 G2 (fix round 6): a look at a source that declares more than 8 MiB reads no body at all, and one that declares nothing is read no further than 8 MiB; both answer undetermined with `large: true` at once, and the outcome is still R8's (control: a small body is compared as before)", async () => {
  for (const declared of [100 * MiB, null]) {
    const f = looked();
    const up = stream({ length: declared });
    const net = network({ [ADDR]: () => up.response() });
    try {
      const r = await f.c.heldAt({ address: ADDR, check: true, viewer: ADMIN, member: "member:m1" });
      assert.deepEqual([r.held, r.changed.state, r.changed.large], [true, "undetermined", true], String(declared));
      assert.equal(typeof r.changed.basis, "string");
      if (declared !== null) assert.equal(up.pulled.bytes, 0, "a declared length over the bound: not a byte pulled");
      else assert.ok(up.pulled.bytes <= 9 * MiB, `no more than the bound and a chunk (${up.pulled.bytes})`);
      assert.equal(f.c.sourceReachability({ addressNorm: ADDR }).last_outcome, "success");
    } finally { net.restore(); }
  }
  const f = looked();
  const small = new TextEncoder().encode("small");
  f.s.sql.exec(`UPDATE register SET capture_sha = ? WHERE bundle_id = 'INFO-1'`, sha(small));
  f.s.sql.exec(`UPDATE captured_locators SET capture_sha = ?`, sha(small));
  f.s.sql.exec(`UPDATE files SET content = ? WHERE bundle_id = 'INFO-1'`, JSON.stringify({ documents: [{ capture: { sha256: sha(small), method: "fetched" } }] }));
  const net = network({ [ADDR]: () => new Response(small) });
  try {
    const r = await f.c.heldAt({ address: ADDR, check: true, viewer: ADMIN, member: "member:m1" });
    assert.deepEqual([r.changed.state, "large" in r.changed], ["unchanged", false]);
  } finally { net.restore(); }
});

/* ---- G4 (R73): the door never turns a kept capture into a failed act ---- */

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const doAnswer = async (res) => { const r = await res; const out = await r.json(); return out.ok === true ? { answered: true, result: out.result, reply: { status: r.status, body: out } } : { answered: false }; };
// fixtures-contract: answer-envelope door-helpers
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const kept = { ok: true, existed: false, document: { file: "f", locator: "https://t.example/d", capture: { sha256: H("ab") } } };
const acquireStore = () => ({ fetch: async () => json({ ok: true, result: { status: 200, body: kept } }) });
const parts = (readAcquired) => ({ json, storeSilent, doAnswer, storageAbsent: () => json({}, 503), cls: "member", member: true, sessMember: "member:ann", storeName: "bio", readAcquired });
const post = () => new Request("https://p/?op=acquire", { method: "POST", body: JSON.stringify({ locator: "https://t.example/d" }) });
const env = { CAPTURES: { put() {}, get() {} } };

test("R73 G4 (fix round 6): an extraction deferral {reading_pending, sha, diag} is relayed unchanged beside the document, 200; a read that throws or answers nothing is a 200 with the kept capture, reading_pending, its digest and a diag naming the failure, never a 502 (control: a read that answers is relayed as before)", async () => {
  const deferral = { ...kept, reading_pending: true, sha: H("ab"), diag: { name: "Error", message: "stub went away" } };
  const relayed = await captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, acquireStore, parts(async () => ({ body: deferral })));
  assert.equal(relayed.status, 200);
  const rb = await relayed.json();
  assert.deepEqual([rb.reading_pending, rb.sha, rb.diag, rb.document.capture.sha256], [true, H("ab"), deferral.diag, H("ab")]);
  const quiet = console.error; const logged = [];
  console.error = (...a) => logged.push(a.join(" "));
  try {
    for (const readAcquired of [async () => { throw new Error("the stub went away"); }, async () => undefined, async () => ({})]) {
      const res = await captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, acquireStore, parts(readAcquired));
      assert.equal(res.status, 200, "a kept capture is never a failed act");
      const b = await res.json();
      assert.deepEqual([b.ok, b.reading_pending, b.sha, b.document.capture.sha256], [true, true, H("ab"), H("ab")]);
      assert.equal(typeof b.diag.message, "string");
    }
  } finally { console.error = quiet; }
  assert.ok(logged.length >= 1, "the failure is logged once for the deploy to name");
  const ok = await captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, acquireStore, parts(async () => ({ body: { ...kept, reading: { read: true } } })));
  const ob = await ok.json();
  assert.deepEqual([ob.reading_pending, ob.diag, ob.reading], [undefined, undefined, { read: true }]);
});
