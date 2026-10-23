/* case-disclosures: a relied-on capture held in parts is presentable (R34; fix round 4b, F3 verification, K4508; provenance
   R72, R73). The audit's fixture: a ~20 MiB three-part capture promoted by the real chain exactly as the capture screen
   promotes it (the register list holds the parts alone, R72 adds the whole's row, no file of the bundle at the whole's
   path). At this module's interface: `materialsJudged`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha, infoMd } from "./fixture.mjs";
import { materialHeld } from "../../../src/case-disclosures/index.mjs";

const BIG = "INFO-2026-0006-big", Q = "INQ-2026-0001-q";
const MIB = 1024 * 1024;
const PARTS = [{ name: "p0", bytes: 8 * MIB }, { name: "p1", bytes: 8 * MIB }, { name: "p2", bytes: 4 * MIB + 17 }];

function multipart(label) {
  const held = PARTS.map((p, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: sha(`${label}:${p.name}`), bytes: p.bytes }));
  const whole = sha(`${label}:whole`);
  const doc = { file: `snapshots/${label}`, locator: `https://example.org/snapshots/${label}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: held.reduce((n, p) => n + p.bytes, 0) },
    origin: { kind: "named_request" }, parts: held };
  return { whole, held, doc };
}
function promoteMultipart(w, id, m) {
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `mp-${m.whole.slice(0, 8)}`, author: V("alice"),
    meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(id, "The big report") },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [m.doc] }, null, 1) },
            ...m.held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: m.held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })) });
  if (!r.ok) throw new Error(`fixture multipart refused: ${JSON.stringify(r).slice(0, 400)}`);
}
function setup(label) {
  const w = world(); for (const m of ["alice", "bo"]) w.member(m);
  const m = multipart(label);
  promoteMultipart(w, BIG, m);
  w.indexText(m.whole, BIG);                                   /* the reading is keyed by the whole (extraction R81) */
  return { w, m };
}
const judged = (w, members) => w.cd.materialsJudged(w.prepared(members), w.roles(members), V("alice"));

test("R34: a load-bearing finding on a document held in parts is not refused RELIED_ON_NOT_PRESENTABLE: its bytes are held through its parts, and the whole is the one material", () => {
  for (const label of ["a", "b", "c", "d", "e", "f"]) {                 /* digests of both orders (the whole first, and not) */
    const { w, m } = setup(label);
    w.finding(Q, [{ target: BIG }]);
    const r = judged(w, [Q]);
    assert.deepEqual(r.refusals.filter((x) => x.code === "RELIED_ON_NOT_PRESENTABLE"), [], label);
    assert.deepEqual(r.materials.map((x) => [x.ref, x.sha]), [[BIG, m.whole]], `${label}: the parts are no materials of their own`);
    assert.deepEqual(r.materials[0].held, { bytes: true, text: true, text_sha: r.materials[0].held.text_sha, whole: true, missing: [] });
  }
});

test("R34: the same through a content leg on the whole", () => {
  const { w, m } = setup("leg");
  const cid = sha("content of the big report");
  w.content(cid, m.whole, BIG);
  w.finding(Q, [{ target: BIG, content_id: cid }]);
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals.filter((x) => x.code === "RELIED_ON_NOT_PRESENTABLE"), []);
  assert.deepEqual(r.materials.map((x) => [x.ref, x.sha, x.held.bytes]), [[BIG, m.whole, true]]);
});

test("R34 (control): a part gone from the bundle, or a whole whose parts are not named, is still not held (fail closed)", () => {
  const { w, m } = setup("gone");
  w.finding(Q, [{ target: BIG }]);
  w.st.sql.exec(`DELETE FROM files WHERE bundle_id = ? AND path = ?`, BIG, m.held[1].file);
  const r = judged(w, [Q]);
  const refusal = r.refusals.find((x) => x.code === "RELIED_ON_NOT_PRESENTABLE");
  assert.ok(refusal, JSON.stringify(r.refusals).slice(0, 300));
  assert.deepEqual(refusal.not_presentable[0].materials.map((x) => [x.sha, x.missing]), [[m.whole, ["bytes"]]]);
  /* a single-capture document is read as it was: its file is the bytes */
  const w2 = world(); for (const x of ["alice", "bo"]) w2.member(x);
  const a = w2.doc("INFO-2026-0001-a"); w2.finding(Q, [{ target: "INFO-2026-0001-a" }]);
  assert.deepEqual(judged(w2, [Q]).materials.map((x) => [x.sha, x.held.bytes]), [[a, true]]);
  assert.equal(materialHeld({ kind: "document", sha: a }, { one: () => null, readFile: () => null, unitsOf: () => null }).bytes, false);
});

test("R34: a leg naming the document with no content row reaches the whole alone: a part's row is a file of it, not a material", () => {
  const { w, m } = setup("nocontent");
  w.finding(Q, [{ target: BIG }]);
  w.st.sql.exec(`UPDATE inquiry_basis SET content_id = NULL WHERE bundle_id = ?`, Q);
  const r = judged(w, [Q]);
  assert.deepEqual(r.materials.map((x) => [x.ref, x.sha]), [[BIG, m.whole]]);
  assert.deepEqual(r.refusals.filter((x) => x.code === "RELIED_ON_NOT_PRESENTABLE"), []);
});
