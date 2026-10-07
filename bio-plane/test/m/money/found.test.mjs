/* R2 (T35-32; N698, DEC-164 (4), (5), K1865, K1941) at money's interface: "Read into a money fact" from a found
   passage, retrieval R73's match taken as the fact's one source, and the optional question kept beside the fact. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, ANN, BOB, OUTSIDER } from "./fixture.mjs";

/* A match as retrieval R73 answers it, kind `money` with its fields (R74). */
const match = (capture_sha, extent = { kind: "pdf-page", page: 3 }) => ({ kind: "money", words: "the Harbour Fund paid $1,250,000.00",
  capture_sha, extent, origin: "search", as_read: "$1,250,000.00", figure: { value: "1250000.00", sign: "+", precision: "exact" } });
const count = (s) => s.one(`SELECT count(*) AS n FROM money_facts`).n;

test("R2 a found extent is the fact's one source exactly as any other extent of a held capture: the same source, citation and grade, nothing of the match kept", () => {
  const s = seeded();
  const found = s.rec({ source: match(s.cap) });
  const plain = s.rec({ source: { capture_sha: s.cap, extent: { kind: "pdf-page", page: 3 } } });
  const a = s.m.readFact({ factId: found, viewer: ANN }).fact, b = s.m.readFact({ factId: plain, viewer: ANN }).fact;
  for (const k of ["source", "citation", "grade", "method", "amount", "as_read"]) assert.deepEqual(a[k], b[k], k);
  assert.equal(a.grade.reading, "B", "the capture's grade, never raised by being found");
  assert.equal(/Harbour Fund paid|"origin"|"words"|"figure"/.test(JSON.stringify(a)), false, "the match's words and fields are not kept");
  // the member's own fields stand: the match's as_read never fills the fact's
  const own = s.rec({ source: match(s.cap), amount: "1.25", as_read: "$1.25 million", precision: "rounded" });
  assert.equal(s.m.readFact({ factId: own, viewer: ANN }).fact.as_read, "$1.25 million");
});

test("R2 being found changes no refusal: a match of a capture not held or hidden is SOURCE_NOT_HELD, a bad extent SOURCE_EXTENT_UNREADABLE, a found table NO_SOURCE, a match beside another source TWO_SOURCES", () => {
  const s = seeded();
  const r = (source, by = ANN) => s.m.recordFact(s.fact({ source, by }));
  assert.equal(r(match(sha("never held"))).reason, "SOURCE_NOT_HELD");
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  assert.equal(r(match(hidden), OUTSIDER).reason, "SOURCE_NOT_HELD");
  assert.equal(r(match(hidden), BOB).ok, true);
  assert.equal(r(match(s.cap, { kind: "bogus" })).reason, "SOURCE_EXTENT_UNREADABLE");
  const table = { kind: "money", table: { capture_sha: s.cap, extent: { kind: "document" }, column: "Amount", rows: 40 }, words: "Amount", origin: "search" };
  const t = r(table);
  assert.equal(t.reason, "NO_SOURCE");
  assert.match(t.detail, /counted through calculations/);
  assert.equal(r([match(s.cap), { capture_sha: s.cap }]).reason, "TWO_SOURCES");
  assert.equal(r({ ...match(s.cap), extent: undefined, capture_sha: "CALC-2026-0001" }).reason, "SOURCE_IS_CALCULATION");
  assert.equal(count(s), 1);
});

test("R2 QUESTION_NOT_HELD, after the source refusals: an absent bundle, one that is not an inquiry, and one the writer may not see answered alike; nothing written", () => {
  const s = seeded();
  s.bundle("INFO-2");
  s.project("PROJ-1", "bob");
  s.bundle("INQ-H", { type: "inquiry", project: "PROJ-1" });
  for (const q of ["INQ-NONE", "INFO-2", "INQ-H", ""]) {
    const r = s.m.recordFact(s.fact({ question: q, source: match(s.cap) }));
    assert.equal(r.reason, "QUESTION_NOT_HELD", q);
  }
  const absent = s.m.recordFact(s.fact({ question: "INQ-NONE" })), hiddenQ = s.m.recordFact(s.fact({ question: "INQ-H" }));
  assert.equal(absent.detail.replace("INQ-NONE", "X"), hiddenQ.detail.replace("INQ-H", "X"), "absent and unseen answered alike");
  assert.equal(count(s), 0);
  assert.equal(s.m.recordFact(s.fact({ question: "INQ-NONE", source: match(sha("never held")) })).reason, "SOURCE_NOT_HELD");
  assert.equal(s.m.recordFact(s.fact({ question: "INQ-NONE", adjusts: "MNY-2026-aaaaaaaaaaaaaaaa" })).reason, "ADJUSTS_NOT_HELD");
  assert.equal(s.m.recordFact(s.fact({ question: "INQ-H", by: BOB })).ok, true, "the writer who may see it");
});

test("R2 the question is kept beside the fact, unchanged by an adjustment or a withdrawal, answered by readFact and moneyOf to a viewer who may see the inquiry and withheld as absent from any other; none answers null", () => {
  const s = seeded();
  s.project("PROJ-1", "bob");
  s.bundle("INQ-1", { type: "inquiry", project: "PROJ-1" });
  s.bundle("INQ-OPEN", { type: "inquiry" });
  const id = s.rec({ source: match(s.cap), question: "INQ-1", by: BOB });
  const open = s.rec({ question: "INQ-OPEN" });
  const none = s.rec();
  const q = (factId, viewer) => s.m.readFact({ factId, viewer }).fact.question;
  assert.equal(q(id, BOB), "INQ-1");
  assert.equal(q(id, OUTSIDER), null, "the fact is seen, its question withheld");
  assert.equal(q(open, OUTSIDER), "INQ-OPEN");
  assert.equal(q(none, BOB), null);
  const of = (viewer) => Object.fromEntries(s.m.moneyOf({ entity: s.vendor, viewer }).facts.map((f) => [f.fact_id, f.question]));
  assert.deepEqual(of(BOB), { [id]: "INQ-1", [open]: "INQ-OPEN", [none]: null });
  assert.deepEqual(of(OUTSIDER), { [id]: null, [open]: "INQ-OPEN", [none]: null });
  s.rec({ phase: "adjusted", stage: null, adjusts: id, by: BOB });
  s.m.withdrawFact({ factId: id, reason: "misread", by: BOB });
  assert.equal(q(id, BOB), "INQ-1");
  assert.equal(s.one(`SELECT question FROM money_facts WHERE fact_id=?`, id).question, "INQ-1");
});

test("R2 a store made before T35 gains the question column at migrate, keeps its facts, and records a question after", () => {
  const s = seeded();
  const old = s.rec();
  s.st.db.exec(`ALTER TABLE money_facts DROP COLUMN question`);
  s.bundle("INQ-1", { type: "inquiry" });
  const { m } = s;
  m.migrate();
  m.migrate();
  assert.equal(m.readFact({ factId: old, viewer: ANN }).fact.question, null);
  const r = m.recordFact(s.fact({ question: "INQ-1" }));
  assert.equal(r.ok, true, r.detail);
  assert.equal(m.readFact({ factId: r.fact_id, viewer: ANN }).fact.question, "INQ-1");
});
