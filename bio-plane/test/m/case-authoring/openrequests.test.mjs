/* case-authoring R34's open requests (T45; N880; Actions D13; v0.2 rule 8; T47, N908): the pre-flight's sign step, which
   lists what `case-inputs`' one source of a case's open requests answers (its R8, registered once at start by a later
   module, `action-replies` R3, stood in here at its ruled interface through `w.ci`), once, and never as a blocker, each
   line `case-inputs.openRequestLine`'s (its R10, R17). The source's own registration arms are case-inputs' tests. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { OPEN_REQUEST_KEYS, openRequestLine, OPEN_REQUESTS_UNREAD_SENTENCE } from "../../../src/case-inputs/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const ROWS = [
  { whom: "the City Clerk, City of Example", asked_at: "2026-09-01", window_closes: "2026-09-30", answers: { answered: 2, claims: 3 } },
  { whom: "the Planning Director, City of Example", asked_at: "2026-09-05", window_closes: null, answers: null },
  { whom: "the Town Auditor", asked_at: "2026-09-06", window_closes: "2026-10-06", answers: null, replied: false },
];
/* case-inputs R8's rows as read: `replied` (K2964) only where the source states it. */
const READ = ROWS;

function setup() {
  const w = world();
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  return { w, P };
}
const act = (P, over = {}) => ({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                                 viewer: V("alice"), author: "alice", ...over });
const sign = (pre) => pre.steps.find((s) => s.name === "sign");
/* The answer with the sign step's open_requests left out, and the case id the rolled-back run minted (and the digest of
   the document naming it) written as placeholders: two runs of one act mint two ids. */
const without = (pre) => {
  const s1 = pre.steps.find((s) => s.name === "what becomes permanent");
  let t = JSON.stringify({ ...pre, steps: pre.steps.map((s) => {
    if (s.name !== "sign") return s; const { open_requests: _, ...rest } = s; return rest; }) });
  if (s1 && s1.case) t = t.split(s1.case).join("<case>").split(s1.document.doc_sha).join("<doc>");
  return t;
};
const same = (x, y) => assert.ok(without(x) === without(y), "byte-equal but for open_requests");

test("R34 (case-inputs R8, R10, R17): the pre-flight's sign step carries open_requests, one fact line per row in the source's order, each naming whom, when asked, when the window closes and how many claims the reply answers, or that none is recorded; listed in that step only, never in the document", () => {
  const { w, P } = setup();
  const calls = [];
  w.ci.registerOpenRequests("action-replies", { openRequestsOn: (a) => { calls.push(a); return ROWS; } });
  const pre = w.ca.publishPreflight(act(P));
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  const o = sign(pre).open_requests;
  assert.equal(o.read, true);
  assert.deepEqual(o.lines.map((l) => [l.whom, l.asked_at, l.window_closes, l.answers, l.replied]),
    READ.map((r) => [r.whom, r.asked_at, r.window_closes, r.answers, r.replied]));
  /* T47: each line is case-inputs' openRequestLine (its R10, R17), every row keyed; this module spells none */
  assert.deepEqual(o.lines.map((l) => [l.key, l.says]), READ.map((r) => [openRequestLine(r).key, openRequestLine(r).says]));
  assert.deepEqual(o.lines.map((l) => l.key), [OPEN_REQUEST_KEYS.line, OPEN_REQUEST_KEYS["nowindow.notlaidout"],
                                               OPEN_REQUEST_KEYS.noreply]);
  for (const [i, l] of o.lines.entries()) {
    const r = READ[i];
    assert.ok(l.says.includes(r.whom) && l.says.includes(r.asked_at));
    if (r.window_closes) assert.ok(l.says.includes(r.window_closes));
    assert.ok(r.answers ? l.says.includes(`${r.answers.answered} of the ${r.answers.claims} claims`)
                        : r.replied === false ? l.says.includes("no reply is recorded") : !l.says.includes("no reply is recorded"));
  }
  /* called once, with the case the act resolved and each member at the bytes it pins */
  assert.equal(calls.length, 1);
  const step1 = pre.steps.find((s) => s.name === "what becomes permanent");
  assert.deepEqual(calls[0], { case: step1.case, members: step1.pinned.map((m) => ({ bundle_id: m.target, version_sha: m.bundleSha })),
                               viewer: V("alice") });
  /* listed once: no other step carries it */
  assert.equal(pre.steps.filter((s) => JSON.stringify(s).includes(ROWS[0].whom)).length, 1);
  /* op=publish never asks it, and the document holds none of it */
  calls.length = 0;
  const pub = w.publish(P, "alice", [Q]);
  assert.equal(pub.ok, true, JSON.stringify(pub).slice(0, 300));
  assert.deepEqual(calls, []);
  const text = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, pub.caseId, pub.edition).text;
  assert.equal(text.includes(ROWS[0].whom) || text.includes("open_requests"), false);
});

test("R34 (case-inputs R8; control): with an open request the pre-flight is byte-equal, but for open_requests, to the same act with no source registered: ready and first unchanged, never a blocker; with the act refused first it is still never first; an unreadable source says so in one sentence", () => {
  const { w, P } = setup();
  const a = w.ca.publishPreflight(act(P)), ra = w.ca.publishPreflight(act(P, { statement: "" }));
  assert.deepEqual(sign(a).open_requests, { read: true, lines: [] });
  w.ci.registerOpenRequests("action-replies", { openRequestsOn: () => ROWS });
  const b = w.ca.publishPreflight(act(P));
  assert.equal(sign(b).open_requests.lines.length, 3);
  same(a, b);
  assert.deepEqual([b.ready, b.first], [a.ready, a.first]);
  assert.equal(JSON.stringify(b.blockers).includes(ROWS[0].whom), false);
  /* refused first (no statement): the same refusal either way, and open_requests never stands for it */
  const rb = w.ca.publishPreflight(act(P, { statement: "" }));
  assert.equal(rb.first.reason, "NO_STATEMENT");
  same(ra, rb);
  assert.equal(sign(rb).open_requests.read, false, "not reached before the case is known");
  /* unreadable */
  const u = setup();
  const c0 = u.w.ca.publishPreflight(act(u.P));
  u.w.ci.registerOpenRequests("action-replies", { openRequestsOn: () => { throw new Error("down"); } });
  const c = u.w.ca.publishPreflight(act(u.P));
  assert.deepEqual(sign(c).open_requests, { read: false, undetermined: true, key: OPEN_REQUEST_KEYS.unread,
                                            says: OPEN_REQUESTS_UNREAD_SENTENCE });
  same(c0, c);
  assert.deepEqual([c.ready, c.first], [c0.ready, c0.first]);
});
