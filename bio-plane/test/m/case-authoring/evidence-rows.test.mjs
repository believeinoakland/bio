/* case-authoring G29 (fix round 6; B-15; K4598; R16 amended, R86): the case document's `case_citations:` rows carry every
   document the case's findings rest on, each with its full capture sha. They were only the project's own `cites` edges, and a
   case prepared from a question holds one edge, to the question (`no_bytes`), so the evidence behind the finding was never a
   row, and the ceremony (screens-publish R13: one line "per piece of evidence they rest on") had nothing to sign but that row.
   Why the tests missed it: seam4.test.mjs (screens-publish) hand-writes `citations`; nothing prepared a case from a question
   that cites a document and read the rows back. These tests prepare through the real `publish` and read the stored document. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
import { signedCitations } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";

const setup = () => { const w = world(); w.member("alice"); return w; };
const rowsOf = (w, r) => w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text).case_citations;
const bodyOf = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;

test("G29 R16 R86 (the walker's case): a case prepared from a question that cites a document passage — the real publish — signs a row for the document with its full capture sha, beside the question's own", () => {
  const w = setup();
  const a = w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const r = w.publish(w.project("Team", "alice", [Q]), "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const want = [{ target: Q, version: "no_bytes", capture: null }, { target: DOC, version: "only_capture", capture: a }];
  assert.deepEqual(rowsOf(w, r), want, "the stored document");
  assert.deepEqual(r.case_citations, want, "the answer says what the document says");
  /* what `casedocument` answers as `citations.rows` is read from these bytes */
  const signed = signedCitations(bodyOf(w, r));
  assert.equal(signed.state, "signed");
  assert.deepEqual(signed.rows.map((x) => [x.target, x.capture === "null" ? null : x.capture]), [[Q, null], [DOC, a]]);
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.ok(bodyOf(w, r).includes(`- ${DOC}: `) && bodyOf(w, r).includes(a), "the body prints the evidence line with the sha");
});

test("G29 R86: a passage names its capture: of a document holding two captures, the row is pinned to the one the finding's leg names", () => {
  const w = setup();
  const a = w.doc(DOC);
  const reg = w.row(`SELECT * FROM register WHERE capture_sha=?`, a);
  const b = sha("another capture of the document");
  const cols = Object.keys(reg);
  w.st.sql.exec(`INSERT INTO register (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
    ...cols.map((c) => (c === "capture_sha" ? b : reg[c])));
  const cid = sha("passage of DOC");
  w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
                 VALUES (?, ?, ?, 'doc-para', ?, 'paragraph 1', 'plane', '2026-01-01', 0)`, cid, a, DOC, canonicalJson({ kind: "doc-para", para: 1 }));
  w.finding(Q, [{ target: DOC, content_id: cid }]);
  const r = w.publish(w.project("Team", "alice", [Q]), "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(rowsOf(w, r).filter((x) => x.target === DOC), [{ target: DOC, version: "pinned", capture: a }]);
});

test("G29 R86: every document the findings rest on, either role and through every member, once each, in the order the members and legs give them", () => {
  const w = setup();
  const a = w.doc(DOC), b = w.doc(DOC2), c = w.doc(DOC3);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC2 }, { target: DOC3 }]);
  const r = w.publish(w.project("Team", "alice", [Q, Q2]), "alice", [Q, Q2], { roles: { [Q]: "load_bearing", [Q2]: "supporting" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(rowsOf(w, r).map((x) => [x.target, x.capture]),
    [[Q, null], [Q2, null], [DOC, a], [DOC2, b], [DOC3, c]]);
});

test("G29 R86 (control): a document the project also cites keeps its own row, not a second; a finding resting only on another finding adds none", () => {
  const w = setup();
  const a = w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const r = w.publish(w.project("Team", "alice", [Q, { target: DOC, extent_capture: a }]), "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(rowsOf(w, r), [{ target: Q, version: "no_bytes", capture: null }, { target: DOC, version: "pinned", capture: a }]);
  /* one level deep: a finding resting on another finding names that finding's evidence in neither row nor capture */
  const w2 = setup();
  w2.doc(DOC);
  w2.finding(Q2, [{ target: DOC }]);
  w2.finding(Q, [{ target: Q2 }]);
  const r2 = w2.publish(w2.project("Team", "alice", [Q]), "alice", [Q]);
  assert.equal(r2.ok, true, JSON.stringify(r2).slice(0, 300));
  assert.deepEqual(rowsOf(w2, r2), [{ target: Q, version: "no_bytes", capture: null }]);
});
