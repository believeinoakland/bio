/* R58 (T34-29; N587; DEC-141 (3), (4), K1618, K1645): the wait "a document it waits on was set aside", read on a question
   and on its project's list of questions. Driven through the real capture module on the same host: its set-aside and
   restore (its R79, R81) record the questions its `captured-for` reader answers as waiting (its R83), and this module
   reads them back through its R84. The reader is a stand-in for capture-requests' (layer 6), so the test says which
   questions a document was captured for. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { DOCUMENT_WAITS_MAX, WAIT_ENDING_STATES } from "../../../src/inquiry/index.mjs";

const Q = "INQ-2026-0901-q", R = "INQ-2026-0902-r";
const D1 = "INFO-2026-0901-a", D2 = "INFO-2026-0902-b";

function setup({ waitingOn = { [D1]: [Q], [D2]: [Q, R] }, ...opts } = {}) {
  const w = world({ capture: true, ...opts });
  w.member("alice"); w.member("bob");
  w.inquiry(Q); w.inquiry(R);
  w.doc(D1); w.doc(D2);
  w.held.registerReader("captured-for", "capture-requests", ({ document }) => ({ questions: (waitingOn[document] || [])
    .map((question) => ({ question, asker: V("alice"), title: `Is ${question} answered?`, visible: true, waiting: true })) }));
  return w;
}
const aside = (w, ids, reason, by = V("bob")) => { const r = w.held.setAside({ ids, reason, author: by, viewer: by });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300)); return r; };
const restore = (w, ids, reason, by = V("alice")) => { const r = w.held.restoreHeld({ ids, reason, author: by, viewer: by });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300)); return r; };
const one = (w, q = Q, viewer = V("alice")) => w.k.documentWaits({ questions: [q], viewer }).questions[0];

test("R58 a question waits on each document set aside with it: {document, by, reason, at} of that set-aside, oldest first, with its whole history", () => {
  const w = setup();
  assert.deepEqual(one(w), { question: Q, inquiry_state: "open", state: "none", waits: [], history: [] }, "nothing set aside");
  aside(w, [D2], "Duplicate of the clerk's copy.");
  aside(w, [D1], "Out of scope for now.", V("alice"));
  /* capture stamps its acts with the wall clock's second: the two are set apart here so "oldest first" is visible */
  w.st.sql.exec(`UPDATE held_acts SET at=? WHERE bundle_id=?`, "2026-09-28T02:00:00Z", D2);
  w.st.sql.exec(`UPDATE held_acts SET at=? WHERE bundle_id=?`, "2026-09-28T03:00:00Z", D1);
  const a = one(w);
  assert.equal(a.state, "waiting");
  assert.deepEqual(a.waits.map((x) => [x.document, x.by, x.reason]),
    [[D2, V("bob"), "Duplicate of the clerk's copy."], [D1, V("alice"), "Out of scope for now."]]);
  assert.deepEqual(a.waits.map((x) => x.at), ["2026-09-28T02:00:00Z", "2026-09-28T03:00:00Z"], "each says when, oldest first");
  assert.deepEqual(a.history.map((h) => [h.document, h.act, h.by, h.reason]),
    [[D2, "set_aside", V("bob"), "Duplicate of the clerk's copy."], [D1, "set_aside", V("alice"), "Out of scope for now."]]);
  /* R: only D2 was recorded as waiting for it */
  assert.deepEqual(one(w, R).waits.map((x) => x.document), [D2]);
});

test("R58 a restore, by the asker or any other member, ends the wait; both acts stay in the history, the restore after the set-aside it undid", () => {
  const w = setup();
  aside(w, [D1, D2], "Not needed yet.");
  restore(w, [D1], "The question needs it after all.", V("bob"));
  const a = one(w);
  assert.deepEqual(a.waits.map((x) => x.document), [D2]);
  assert.deepEqual(a.history.filter((h) => h.document === D1).map((h) => [h.act, h.by, h.reason]),
    [["set_aside", V("bob"), "Not needed yet."], ["restore", V("bob"), "The question needs it after all."]]);
  restore(w, [D2], "Back in.");
  const b = one(w);
  assert.deepEqual([b.state, b.waits], ["none", []]);
  assert.equal(b.history.length, 4, "every act stays in the history");
});

test("R58 a project's list asks its questions' ids in one call (at most 200): each named inquiry the viewer may see is answered once, in the order asked; over the bound is refused whole", () => {
  const w = setup();
  aside(w, [D2], "Not needed yet.");
  const r = w.k.documentWaits({ questions: [R, Q, R, "INQ-2026-0999-none", D1], viewer: V("alice") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.questions.map((x) => [x.question, x.waits.map((y) => y.document)]), [[R, [D2]], [Q, [D2]]],
    "a repeated id is answered once; an id naming no inquiry, or a document, is left out as absent");
  assert.equal(DOCUMENT_WAITS_MAX, 200);
  const ids = Array.from({ length: 200 }, (_, i) => `INQ-2026-${String(1000 + i)}-x`);
  const at = w.k.documentWaits({ questions: ids, viewer: V("alice") });
  assert.deepEqual([at.ok, at.questions], [true, []], "200 ids is within the bound");
  const over = w.k.documentWaits({ questions: [...ids, Q], viewer: V("alice") });
  assert.deepEqual([over.ok, over.reason, over.bound, over.asked, over.questions], [false, "TOO_MANY_QUESTIONS", 200, 201, undefined],
    "201 ids is refused whole, never narrowed");
});

test("R58 R33 an inquiry the viewer may not see answers exactly as an absent one; no viewer, or a call without one, answers nothing; a document the viewer may not see is left out uncounted", () => {
  const w = setup();
  aside(w, [D1, D2], "Not needed yet.");
  const P = w.project("Bob's own", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, R);
  assert.deepEqual(w.k.documentWaits({ questions: [R], viewer: V("alice") }),
                   w.k.documentWaits({ questions: ["INQ-2026-0998-none"], viewer: V("alice") }));
  assert.deepEqual(w.k.documentWaits({ questions: [R], viewer: V("alice") }).questions, []);
  assert.equal(w.k.documentWaits({ questions: [R], viewer: V("bob") }).questions.length, 1, "bob may see it");
  for (const viewer of [null, undefined, "", "  "])
    assert.deepEqual(w.k.documentWaits({ questions: [Q], viewer }), { ok: true, questions: [] }, String(viewer));
  assert.deepEqual(w.k.documentWaits(), { ok: true, questions: [] });
  /* D1 moved into bob's project: alice reads Q's wait on D2 alone, and no trace of D1 */
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, D1);
  const a = one(w);
  assert.deepEqual(a.waits.map((x) => x.document), [D2]);
  assert.ok(!JSON.stringify(a).includes(D1), "the hidden document is unannounced");
  assert.deepEqual(one(w, Q, V("bob")).waits.map((x) => x.document).sort(), [D1, D2].sort());
});

test("R58 a question at an ending state (concluded, divided, dismissed) answers its history and no wait", () => {
  for (const state of WAIT_ENDING_STATES) {
    const w = setup();
    aside(w, [D1], "Not needed yet.");
    w.st.sql.exec(`UPDATE bundles SET current_state=? WHERE bundle_id=?`, state, Q);
    const a = one(w);
    assert.deepEqual([a.state, a.inquiry_state, a.waits], ["ended", state, []], state);
    assert.deepEqual(a.history.map((h) => h.document), [D1], state);
  }
  const w = setup(); aside(w, [D1], "Not needed yet.");
  w.st.sql.exec(`UPDATE bundles SET current_state='deferred' WHERE bundle_id=?`, Q);
  assert.equal(one(w).state, "waiting", "deferred is no ending state");
});

test("R58 when capture's read cannot be read (it throws, answers ok: false or no list), the question's wait is undetermined with that reason, never no wait", () => {
  for (const heldActsOf of [() => { throw new Error("boom"); },
                            () => ({ ok: false, reason: "HELD_ACTS_UNREADABLE", acts: null }),
                            () => ({ ok: true, acts: "none" }), () => null]) {
    const w = world({ capture: true }); w.member("alice"); w.inquiry(Q);
    w.held.heldActsOf = heldActsOf;
    const a = one(w);
    assert.deepEqual([a.state, a.waits, a.history], ["undetermined", null, null], String(heldActsOf));
    assert.match(a.why, /could not be read/);
  }
  const w = world({ capture: true }); w.member("alice"); w.inquiry(Q);
  w.held.heldActsOf = () => ({ ok: false, reason: "HELD_ACTS_UNREADABLE", acts: null });
  assert.match(one(w).why, /HELD_ACTS_UNREADABLE/);
});

test("R58 the whole history is read past capture's page: every page asked with its cursor", () => {
  const w = world({ capture: true }); w.member("alice"); w.inquiry(Q);
  const asked = [];
  w.held.heldActsOf = ({ question, viewer, after }) => {
    asked.push([question, viewer, after]);
    return after === null
      ? { ok: true, acts: [{ document: D1, act: "set_aside", reason: "r1", author: V("bob"), at: "2026-09-28T01:00:00Z" }],
          documents: [{ document: D1, set_aside: false }], truncated: true, next: "c1" }
      : { ok: true, acts: [{ document: D1, act: "restore", reason: "r2", author: V("bob"), at: "2026-09-28T02:00:00Z" },
                           { document: D2, act: "set_aside", reason: "r3", author: V("bob"), at: "2026-09-28T03:00:00Z" }],
          documents: [{ document: D1, set_aside: false }, { document: D2, set_aside: true }], truncated: false, next: null };
  };
  const a = one(w);
  assert.deepEqual(asked, [[Q, V("alice"), null], [Q, V("alice"), "c1"]]);
  assert.deepEqual(a.history.map((h) => h.act), ["set_aside", "restore", "set_aside"]);
  assert.deepEqual(a.waits.map((x) => x.document), [D2]);
});

test("R58 K1618 DEC-94 the read writes nothing, raises nothing and never throws: no queue item, no notification, no scheduler or notice-producer is told", () => {
  const w = setup();
  const told = [];
  w.k.onWaitSet("scheduler", (n) => told.push(n));
  w.listen();
  aside(w, [D1], "Not needed yet.");
  const before = w.st.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    .map((t) => [t.name, w.count(`"${t.name}"`)]);
  for (const args of [{ questions: [Q], viewer: V("alice") }, { questions: "x", viewer: V("alice") }, { questions: [Q], viewer: MACHINE }, null])
    assert.doesNotThrow(() => w.k.documentWaits(args));
  const after = w.st.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    .map((t) => [t.name, w.count(`"${t.name}"`)]);
  assert.deepEqual(after, before, "no row written anywhere");
  assert.deepEqual([told, w.raisedCalls], [[], []]);
});
