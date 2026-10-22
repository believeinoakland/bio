/* case-authoring: a document held in parts counts as one capture, and the case that cites it then publishes (R84, with
   case-disclosures R34 through the door; fix round 4b, F3 verification, K4508; provenance R72, R73). The audit's fixture:
   a ~20 MiB three-part capture promoted by the real chain as the capture screen promotes it. The through-the-door case:
   the project cites the multipart document with no pin and a load-bearing finding rests on it, then the case is
   prepared (`publishCase`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha, infoMd } from "./fixture.mjs";

const BIG = "INFO-2026-0006-big", DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
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
function setup(label) {
  const w = world(); for (const x of ["alice", "bo"]) w.member(x);
  const m = multipart(label);
  const r = w.promotion.promote({ bundleId: BIG, base: null, snapKey: `mp-${label}`, author: V("alice"), meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(BIG) }, { path: "data/provenance.json", text: JSON.stringify({ documents: [m.doc] }, null, 1) },
            ...m.held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: m.held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })) });
  if (!r.ok) throw new Error(`fixture multipart refused: ${JSON.stringify(r).slice(0, 400)}`);
  w.documentCopy(m.whole, "clean"); w.indexText(m.whole, BIG);
  return { w, m };
}

test("R84: a document held in parts cited without a pin is only_capture, naming the whole, for every order of the digests; and the case that cites it, resting on it, is prepared (the seam, with case-disclosures R34)", () => {
  for (const label of ["a", "b", "c", "d", "e", "f"]) {
    const { w, m } = setup(label);
    w.finding(Q, [{ target: BIG }]);
    const P = w.project("Team", "alice", [Q, BIG]);
    const r = w.publish(P, "alice", [Q]);
    assert.equal(r.ok, true, `${label}: ${JSON.stringify(r).slice(0, 400)}`);
    assert.deepEqual(r.case_citations.filter((c) => c.target === BIG), [{ target: BIG, version: "only_capture", capture: m.whole }], label);
    const doc = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
    const fm = w.fm(doc.text);
    const mat = (fm.materials || []).filter((x) => x.ref === BIG);
    assert.deepEqual(mat.map((x) => [x.sha, x.included]), [[m.whole, true]], `${label}: the whole is the one material, carried whole`);
  }
});

test("R84 (control): a document holding a second, different capture is still undetermined, never back-filled; a single-capture document is only_capture as before", () => {
  const { w, m } = setup("ctl");
  w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, found, entity_count, reading, at)
                 VALUES (?, ?, 'doc', 0, 0, '{}', ?)`, "e".repeat(64), BIG, w.clock.now);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, BIG, DOC]);
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.case_citations.filter((c) => c.target === BIG), [{ target: BIG, version: "undetermined", capture: null }]);
  const only = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  assert.deepEqual(r.case_citations.filter((c) => c.target === DOC), [{ target: DOC, version: "only_capture", capture: only }]);
  assert.ok(m.whole);
});
