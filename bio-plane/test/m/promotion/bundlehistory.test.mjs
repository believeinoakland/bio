/* promotion R58 (T51; K3826): bundleHistory, the bundle's own record of how it came to be what it is, read at the
   interface over the doubles of fixtures.mjs. Facts only, sight first, bounded, a read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, infoDoc, create, revise, sha, T0 } from "./fixtures.mjs";

const ID = "INFO-2026-0001";
const who = "member:ann";

/* A bundle created and revised twice, each revision with a body of its own. */
function threeRevisions() {
  const env = makePromotion();
  const bodies = [infoDoc(ID), infoDoc(ID, { title: "A report, revised" }), infoDoc(ID, { title: "A report, revised again" })];
  const r1 = env.p.promote(create(ID, bodies[0]));
  const r2 = env.p.promote(revise(ID, r1.bundleSha, bodies[1], { snapKey: "k2" }));
  const r3 = env.p.promote(revise(ID, r2.bundleSha, bodies[2], { snapKey: "k3" }));
  for (const r of [r1, r2, r3]) assert.equal(r.ok, true, JSON.stringify(r));
  return { ...env, bodies, shas: [r1.bundleSha, r2.bundleSha, r3.bundleSha] };
}

test("R58: a bundle created and revised twice answers three revisions newest first, each file's digest equal to the SHA-256 of the bytes op=image gives", () => {
  const { p, record, bodies, shas } = threeRevisions();
  const r = p.bundleHistory({ bundle: ID, viewer: who });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.bundle, ID);
  assert.deepEqual(r.revisions.map((x) => x.snapKey), ["k3", "k2", "k1"], "newest first, in write order");
  assert.deepEqual(r.revisions.map((x) => x.seq), [3, 2, 1]);
  assert.deepEqual(r.revisions.map((x) => x.kind), ["promotion", "promotion", "promotion"]);
  assert.deepEqual(r.revisions.map((x) => x.author), [who, who, who]);
  assert.deepEqual(r.revisions.map((x) => x.sha256), [shas[2], shas[1], shas[0]], "the bundle_sha each promotion left");
  assert.equal(r.truncated, false);
  /* Each revision's bytes are the image's: the live file for the head, the copy under the next snap key for the rest. */
  const image = record.readImage(ID);
  const held = { k3: image["bundle.md"], k2: image["_history/bundle_k3.md"], k1: image["_history/bundle_k2.md"] };
  for (const rev of r.revisions) {
    assert.equal(rev.files.length, 1);
    const f = rev.files[0];
    assert.equal(f.path, "bundle.md");
    assert.equal(f.sha256, sha(held[rev.snapKey]), `${rev.snapKey}'s digest is of its bytes`);
    assert.equal(f.bytes, Buffer.byteLength(held[rev.snapKey], "utf8"));
  }
  assert.equal(held.k1, bodies[0]);
});

test("R58: a multi-file set's history names every file of every revision", () => {
  const { p } = makePromotion();
  const a = p.promote(create(ID, infoDoc(ID), { files: [{ path: "bundle.md", text: infoDoc(ID) }, { path: "data/a.json", text: "{}" }] }));
  assert.equal(a.ok, true, JSON.stringify(a));
  const b = p.promote(revise(ID, a.bundleSha, infoDoc(ID, { title: "Two" }),
    { files: [{ path: "bundle.md", text: infoDoc(ID, { title: "Two" }) }, { path: "data/a.json", text: "{\"a\":1}" }] }));
  assert.equal(b.ok, true, JSON.stringify(b));
  const r = p.bundleHistory({ bundle: ID, viewer: who });
  assert.deepEqual(r.revisions.map((x) => x.files.map((f) => f.path).sort()), [["bundle.md", "data/a.json"], ["bundle.md", "data/a.json"]]);
  assert.deepEqual(r.revisions[0].files.find((f) => f.path === "data/a.json"), { path: "data/a.json", sha256: sha("{\"a\":1}"), bytes: 7 });
  assert.deepEqual(r.revisions[1].files.find((f) => f.path === "data/a.json"), { path: "data/a.json", sha256: sha("{}"), bytes: 2 });
});

test("R58: a document with three state_history entries answers three states as stored, in the order stored", () => {
  const { p } = makePromotion();
  const hist = [["2026-07-01T01:00:00Z", "open", "deferred", "waiting"], ["2026-07-01T02:00:00Z", "deferred", "open", "back"],
                ["2026-07-01T03:00:00Z", "open", "dismissed", "no case"]];
  const lines = ["state_history:", ...hist.flatMap(([t, f, to, b]) => [`  - timestamp: "${t}"`, `    from_state: ${f}`,
    `    to_state: ${to}`, `    blurb: "${b}"`, "    author: member:bob"])];
  const text = doc({ id: "INQ-2026-0001", object_type: "inquiry", title: "Q", current_state: "dismissed", prior_state: "open",
    created: T0, last_updated: "2026-07-01T03:00:00Z", group: "test-group" }).replace("\n---\n", `\n${lines.join("\n")}\n---\n`);
  const made = p.promote({ ...create("INQ-2026-0001", text), replay: true });
  assert.equal(made.ok, true, JSON.stringify(made));
  const r = p.bundleHistory({ bundle: "INQ-2026-0001", viewer: who });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.states, hist.map(([at, from, to, blurb]) => ({ at, from, to, author: "member:bob", blurb })));
  assert.equal(r.truncated, false);
  /* A document with none answers none. */
  assert.deepEqual(threeRevisions().p.bundleHistory({ bundle: ID, viewer: who }).states, []);
});

test("R58: a 250-revision bundle answers the newest 200 and truncated; 250 states answer the newest 200", () => {
  const { p } = makePromotion();
  let r = p.promote(create(ID, infoDoc(ID)));
  for (let i = 2; i <= 250; i++) {
    r = p.promote(revise(ID, r.bundleSha, infoDoc(ID, { title: `Revision ${i}` }), { snapKey: `k${String(i).padStart(3, "0")}` }));
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  const h = p.bundleHistory({ bundle: ID, viewer: who });
  assert.equal(h.revisions.length, 200);
  assert.equal(h.truncated, true);
  assert.deepEqual([h.revisions[0].seq, h.revisions[199].seq], [250, 51], "the newest kept, newest first");
  /* 250 stored states. */
  const lines = ["state_history:", ...Array.from({ length: 250 }, (_, i) => [`  - timestamp: "2026-08-${String(1 + (i % 28)).padStart(2, "0")}T00:00:${String(i % 60).padStart(2, "0")}Z"`,
    `    from_state: open`, `    to_state: open`, `    blurb: "n${i}"`, "    author: member:bob"].join("\n"))];
  const text = doc({ id: "INQ-2026-0002", object_type: "inquiry", title: "Q", current_state: "open", prior_state: null, created: T0,
    last_updated: T0, group: "test-group" }).replace("\n---\n", `\n${lines.join("\n")}\n---\n`);
  assert.equal(p.promote({ ...create("INQ-2026-0002", text), replay: true }).ok, true);
  const s = p.bundleHistory({ bundle: "INQ-2026-0002", viewer: who });
  assert.equal(s.states.length, 200);
  assert.equal(s.states[199].blurb, "n249");
  assert.equal(s.states[0].blurb, "n50");
  assert.equal(s.truncated, true);
});

test("R58: the answer carries no grade, checked or acknowledgment key, and no key of any entry is English", () => {
  const { p } = threeRevisions();
  const r = p.bundleHistory({ bundle: ID, viewer: who });
  const keys = new Set();
  const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { keys.add(k); walk(x); } };
  walk(r);
  for (const k of ["grade", "checked", "acknowledgment", "detail", "translation", "message"]) assert.equal(keys.has(k), false, k);
  assert.deepEqual([...keys].sort(), ["bundle", "bytes", "files", "kind", "ok", "path", "revisions", "seq", "sha256", "snapKey", "states", "truncated", "at", "author"].sort());
});

test("R58 control: a viewer who may not see the bundle, an id naming nothing and a missing viewer get one NO_SUCH_BUNDLE, byte-identical", () => {
  const { p, membership } = threeRevisions();
  membership.hidden.add(ID);
  const unseen = p.bundleHistory({ bundle: ID, viewer: "member:zed" });
  const absent = p.bundleHistory({ bundle: "INFO-2026-9999", viewer: who });
  const noViewer = p.bundleHistory({ bundle: ID });
  const seenButNone = p.bundleHistory({ bundle: ID, viewer: null });
  assert.deepEqual(unseen, { ok: false, reason: "NO_SUCH_BUNDLE" });
  for (const r of [absent, noViewer, seenButNone]) assert.equal(JSON.stringify(r), JSON.stringify(unseen));
  assert.equal(p.bundleHistory({ viewer: who }).reason, "NO_BUNDLE");
  assert.equal(p.bundleHistory({ bundle: "", viewer: who }).reason, "NO_BUNDLE");
  assert.equal(p.bundleHistory().reason, "NO_BUNDLE");
  assert.doesNotThrow(() => p.bundleHistory(null));
});

test("R58 control: a call changes no row of manifest, history or files", () => {
  const { p, record } = threeRevisions();
  const before = record.dump();
  p.bundleHistory({ bundle: ID, viewer: who });
  p.bundleHistory({ bundle: ID, viewer: "member:zed" });
  p.bundleHistory({ bundle: "INFO-2026-9999", viewer: who });
  assert.equal(record.dump(), before);
});

/* R59: each revision states the capture its own data/provenance.json names for the document. */
const prov = (capture) => JSON.stringify({ documents: [{ capture: capture ? { sha256: capture } : {} }] });
const withProv = (title, text) => ({ files: [{ path: "bundle.md", text: infoDoc(ID, { title }) }, { path: "data/provenance.json", text }] });

test("R59: a document captured, then re-captured, answers two revisions whose capture_sha are the two captures' digests, newest first", () => {
  const { p } = makePromotion();
  const first = sha("first capture"), second = sha("second capture");
  const a = p.promote(create(ID, infoDoc(ID, { title: "One" }), withProv("One", prov(first))));
  assert.equal(a.ok, true, JSON.stringify(a));
  const b = p.promote(revise(ID, a.bundleSha, infoDoc(ID, { title: "Two" }), withProv("Two", prov(second))));
  assert.equal(b.ok, true, JSON.stringify(b));
  const r = p.bundleHistory({ bundle: ID, viewer: who });
  assert.deepEqual(r.revisions.map((x) => x.capture_sha), [second, first]);
});

test("R59 control: a revision with no capture in its snapshot answers no capture_sha, and R58's other fields are unchanged", () => {
  const { p } = makePromotion();
  const a = p.promote(create(ID, infoDoc(ID, { title: "One" }), withProv("One", prov(null))));
  const b = p.promote(revise(ID, a.bundleSha, infoDoc(ID, { title: "Two" }), withProv("Two", "not json")));
  const c = p.promote(revise(ID, b.bundleSha, infoDoc(ID, { title: "Three" }), { files: [{ path: "bundle.md", text: infoDoc(ID, { title: "Three" }) }], drop: ["data/provenance.json"], snapKey: "k3" }));
  for (const x of [a, b, c]) assert.equal(x.ok, true, JSON.stringify(x));
  const r = p.bundleHistory({ bundle: ID, viewer: who });
  assert.equal(r.revisions.length, 3);
  for (const rev of r.revisions) {
    assert.equal(Object.hasOwn(rev, "capture_sha"), false);
    assert.deepEqual(Object.keys(rev).sort(), ["at", "author", "files", "kind", "seq", "sha256", "snapKey"]);
  }
});
