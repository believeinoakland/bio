/* case-authoring R14 and R27 (T47; N908): the statement's acknowledgements and who wrote the statement, as `publishCase`
   prints them from `case-inputs`' one list and its writer (its R2, R3), asked once per act; and working material
   answering an outsider as something that does not exist. The acknowledgement act itself, its doors, refusals and ops,
   and the list's own arms are `case-inputs`' (its R1–R5, R13, R14) and its tests; here acknowledgements are recorded
   through it (`w.ci`) as setup. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, DEAD } from "./fixture.mjs";
import { caseAuthoringOps } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo", "cy", "di", "ed"]) w.member(m);
  w.member("root", { role: "admin" });
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  w.join(P, "bo"); w.join(P, "cy"); w.join(P, "ed", "invited");
  return { w, P };
}
/* case-inputs R1 (DEC-88): every acknowledgement carries the acknowledger's words. */
const WORDS = "I read what this case leaves out and agree it is stated.";
const ack = (w, a) => w.ci.acknowledgeStatement({ reason: WORDS, ...a });
const docText = (w, c, e) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, c, e).text;

test("R14 (T47; case-inputs R2): the acknowledgement list publishCase prints is case-inputs' one list — a reading given on the draft the publisher names is listed with that draft, one given on another draft of the same sentence is counted and never named, a case of a byte-identical statement lists none of another case's readings and states zero; nothing about an acknowledgement refuses publication", () => {
  const { w, P } = setup();
  /* two drafts of one sentence naming no case: readings of each are readings of that draft */
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "cy" });
  w.draft("DRAFT-2026-0002", P, { statement: AUTHORED.statement }, { statementBy: "cy" });
  assert.equal(ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0001" }).ok, true);
  const d2 = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0002" });
  assert.deepEqual([d2.existed, d2.bound_to_a_case], [false, false], "a second draft's reading is its own");
  assert.match(d2.listed, /names no case/);
  /* published NAMING draft 1: its reading binds; draft 2's is unbindable, counted and never named */
  const pub = w.publish(P, "alice", [Q], { draft: "DRAFT-2026-0001" });
  assert.equal(pub.ok, true, JSON.stringify(pub).slice(0, 300));
  assert.deepEqual(pub.completeness.acknowledgements, [{ kind: "participant", by: "bo", recipient: null,
    at: w.clock.ms, reason: WORDS, draft: "DRAFT-2026-0001" }]);
  assert.deepEqual([pub.completeness.draft.acknowledgements_bound, pub.completeness.acknowledgements_unbindable_to_this_case],
    [1, 1]);
  const body = docText(w, pub.caseId, 1);
  assert.ok(body.includes("given on draft DRAFT-2026-0001"));
  assert.match(body, /This record also holds 1 acknowledgement of this exact statement/);
  /* a case of a byte-identical statement lists none of another case's readings */
  const other = w.publish(P, "alice", [Q2], { newCase: true });
  assert.deepEqual([other.completeness.acknowledgements, w.fm(docText(w, other.caseId, 1)).completeness.acknowledged], [[], 0]);
  assert.ok(docText(w, other.caseId, 1).includes("**Who else read this statement.** Nobody acknowledged it FOR THIS CASE"),
    "zero is stated, and with unbindable readings held it is not 'nobody but its author'");
  /* nothing about an acknowledgement refuses publication */
  const lonely = setup();
  assert.equal(lonely.w.publish(lonely.P, "alice", [Q]).ok, true);
});

test("R14 (T47; case-inputs R3): statement_by, printed in the document, is the member whose write made the statement's current bytes — the named draft's stamp; else a draft of the project holding that sentence; else the publisher, named as both; drafts disagreeing, or a draft from before the stamp, make it null, stated undetermined", () => {
  const case1 = setup();
  case1.w.draft("DRAFT-2026-0001", case1.P, { statement: AUTHORED.statement }, { statementBy: "bo" });
  case1.w.draft("DRAFT-2026-0002", case1.P, { statement: AUTHORED.statement }, { statementBy: "cy" });
  /* the named draft decides, however the others disagree */
  const named = case1.w.publish(case1.P, "alice", [Q], { draft: "DRAFT-2026-0002" });
  assert.deepEqual([named.completeness.statement_by, /DRAFT-2026-0002, which alice named/.test(named.completeness.statement_by_stated)],
    ["cy", true]);
  /* a named draft holding another sentence says nothing about these bytes: the project's drafts are asked */
  const case2 = setup();
  case2.w.draft("DRAFT-2026-0001", case2.P, { statement: "Some other sentence." }, { statementBy: "bo" });
  case2.w.draft("DRAFT-2026-0002", case2.P, { statement: AUTHORED.statement }, { statementBy: "cy" });
  const scan = case2.w.publish(case2.P, "alice", [Q], { draft: "DRAFT-2026-0001" });
  assert.deepEqual(scan.completeness.statement_by, "cy");
  /* no draft holds it: the publisher wrote these bytes at this act */
  const case3 = setup();
  const act = case3.w.publish(case3.P, "alice", [Q]);
  assert.deepEqual(act.completeness.statement_by, "alice");
  assert.match(act.completeness.statement_by_stated, /alice wrote this exclusion statement in the act that published this case/);
  /* a named draft from before the stamp: undetermined, never filled from the publisher */
  const case4 = setup();
  case4.w.draft("DRAFT-2026-0001", case4.P, { statement: AUTHORED.statement }, { statementBy: null });
  const pre = case4.w.publish(case4.P, "alice", [Q], { draft: "DRAFT-2026-0001" });
  assert.deepEqual([pre.completeness.statement_by, /^UNDETERMINED: alice named draft DRAFT-2026-0001/.test(pre.completeness.statement_by_stated)],
    [null, true]);
  assert.equal(case4.w.fm(docText(case4.w, pre.caseId, 1)).completeness.statement_by, null);
  /* disagreeing drafts, none named */
  const case5 = setup();
  case5.w.draft("DRAFT-2026-0001", case5.P, { statement: AUTHORED.statement }, { statementBy: "bo" });
  case5.w.draft("DRAFT-2026-0002", case5.P, { statement: AUTHORED.statement }, { statementBy: "cy" });
  const dis = case5.w.publish(case5.P, "alice", [Q]);
  assert.equal(dis.completeness.statement_by, null);
  assert.match(dis.completeness.statement_by_stated, /^UNDETERMINED/);
});

test("R27: working material answers an outsider exactly as something that does not exist — a hidden project, and the draft door refusing an outsider whose publication names a draft, before anything reveals it", () => {
  const { w, P } = setup();
  const pub = w.publish(P, "alice", [Q]);
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  const hidden = w.publish(P, "di", [Q]);
  const absent = w.publish("PROJ-2026-0000-none", "di", [Q]);
  assert.deepEqual([hidden.reason, absent.reason], ["NO_SUCH_PROJECT", "NO_SUCH_PROJECT"], "a hidden project");
  assert.equal(hidden.detail.replace(P, "X"), absent.detail.replace("PROJ-2026-0000-none", "X"));
  /* the draft door refuses the outsider whose publication names it, before anything reveals the draft */
  const d = w.ca.publishCase({ ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                               draft: "DRAFT-2026-0001", viewer: V("di"), author: "di" });
  assert.equal(d.reason, "NO_SUCH_PROJECT");
});

test("R14 (T47; N908): publishCase asks case-inputs' statementWriter and statementAcknowledgements each once per act, the list with the writer it answered, and prints what they answer; the document's acknowledgement runs are case-inputs' renderers' bytes", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "cy" });
  assert.equal(ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0001" }).ok, true);
  const calls = { writer: [], list: [] };
  const writer = w.ci.statementWriter.bind(w.ci), list = w.ci.statementAcknowledgements.bind(w.ci);
  w.ci.statementWriter = (...a) => { const r = writer(...a); calls.writer.push({ a, r }); return r; };
  w.ci.statementAcknowledgements = (...a) => { const r = list(...a); calls.list.push({ a, r }); return r; };
  const pub = w.publish(P, "alice", [Q], { draft: "DRAFT-2026-0001" });
  assert.equal(pub.ok, true, JSON.stringify(pub).slice(0, 300));
  assert.deepEqual([calls.writer.length, calls.list.length], [1, 1], "each asked once");
  assert.deepEqual(calls.writer[0].a.slice(0, 5), [P, pub.caseId, 1, AUTHORED.statement, "alice"]);
  assert.equal(calls.list[0].a[5], calls.writer[0].r, "the list is asked with the writer it answered");
  assert.deepEqual([pub.completeness.statement_by, pub.completeness.statement_by_stated],
    [calls.writer[0].r.by, calls.writer[0].r.stated]);
  assert.deepEqual(pub.completeness.acknowledgements, calls.list[0].r.rows);
  const fm = w.fm(docText(w, pub.caseId, 1));
  assert.deepEqual([fm.completeness.statement_sha, fm.completeness.acknowledged, fm.completeness.statement_by],
    [calls.list[0].r.statementSha, calls.list[0].r.rows.length, "cy"]);
  w.ci.statementWriter = writer; w.ci.statementAcknowledgements = list;
});

test("R27 (T47; case-inputs R1, R14): case-authoring answers no statement acknowledgement — its ops map holds no statementack — and the dead answer every refused door receives is case-inputs', byte-identical: an unsigned document, a draft, a member who is not one", () => {
  const { w, P } = setup();
  const ops = caseAuthoringOps(w.ca, new URL(`http://do/x?viewer=${encodeURIComponent(V("di"))}`), {});
  for (const op of ["statementack", "whatchangedpropose", "whatchangeddrafts"]) assert.equal(op in ops, false, op);
  for (const name of ["acknowledgeStatement", "statementAcknowledgements", "proposeWhatChanged", "whatChangedDrafts",
                      "registerOpenRequests", "openRequestsOn", "carryOutcome", "withdrawCarriedOutcome", "carriedOutcomesOf"])
    assert.equal(name in w.ca, false, name);
  const pub = w.publish(P, "alice", [Q]);
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  for (const a of [{ viewer: V("di"), caseId: pub.caseId, edition: 1 }, { viewer: V("di"), caseId: "CASE-2026-0001", edition: 1 },
                   { viewer: V("di"), draft: "DRAFT-2026-0001" }, { viewer: V("di"), draft: "DRAFT-2026-0077" }, { viewer: "nobody" }])
    assert.deepEqual(ack(w, a), DEAD, JSON.stringify(a));
});
