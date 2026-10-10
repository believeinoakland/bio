/* case-authoring: the statement's acknowledgements (R19, R20), who wrote the statement (R21), and working material
   answering an outsider as something that does not exist (R27). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, AUTHORED, DEAD } from "./fixture.mjs";
import { STATEMENT_ACK_CHECKS, statementSha, withheldWriterStated, caseAuthoringOps } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const S1 = "a".repeat(64), S2 = "b".repeat(64), S3 = "c".repeat(64);

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
/* R19 (DEC-88): every acknowledgement carries the acknowledger's words; a test proving the refusal passes its own. */
const WORDS = "I read what this case leaves out and agree it is stated.";
const ack = (w, a) => w.ca.acknowledgeStatement({ reason: WORDS, ...a });
const refuses = (r, code) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
  [false, code, code, STATEMENT_ACK_CHECKS[code].check, STATEMENT_ACK_CHECKS[code].translation]);
const docText = (w, c, e) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, c, e).text;

test("R19: doors — a recipient through a live grant (a named draft must be the grant's own); a member of a draft, or of an unsigned case document it has standing in; every other caller receives the review copy's dead answer, byte-identical", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  w.draft("DRAFT-2026-0002", P, { statement: "Another sentence." }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "the auditor" });
  w.grant(S2, { grant_id: "RVG-2026-0002", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "gone", revoked: true });
  const pub = w.publish(P, "alice", [Q]);
  const outsider = w.project("Elsewhere", "di", []);
  const dead = [
    ack(w, { bySecret: true, secretSha: S3 }),                                     /* never issued */
    ack(w, { bySecret: true, secretSha: S2 }),                                     /* revoked */
    ack(w, { bySecret: true, secretSha: "not-hex" }),                              /* malformed */
    ack(w, { bySecret: true, secretSha: S1, draft: "DRAFT-2026-0002" }),           /* another draft */
    ack(w, { viewer: MACHINE, draft: "DRAFT-2026-0001" }),                         /* no member */
    ack(w, { viewer: null, caseId: pub.caseId, edition: 1 }),
    ack(w, { viewer: V("di"), draft: "DRAFT-2026-0001" }),                         /* not in the project */
    ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0099" }),                         /* no such draft */
    ack(w, { viewer: V("di"), caseId: pub.caseId, edition: 1 }),                   /* no standing */
    ack(w, { viewer: V("bo"), caseId: "CASE-2026-0001", edition: 1 }),             /* no such document */
  ];
  for (const d of dead) assert.deepEqual(d, DEAD, "the one dead answer, byte for byte");
  void outsider;
  const byGrant = ack(w, { bySecret: true, secretSha: S1 });
  assert.deepEqual([byGrant.ok, byGrant.acknowledgement.kind, byGrant.acknowledgement.by, byGrant.acknowledgement.recipient,
                    byGrant.acknowledgement.grant_id], [true, "recipient", "RVG-2026-0001", "the auditor", "RVG-2026-0001"]);
  assert.equal(ack(w, { bySecret: true, secretSha: S1, draft: "DRAFT-2026-0001" }).ok, true, "its own draft, named");
  assert.equal(ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0001" }).ok, true, "a member of the draft");
  assert.equal(ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 }).ok, true, "a member with standing in the document");
});

test("R19 (D54): refusals in order — STATEMENT_ACK_NO_SUBJECT (C-82.2), a signed document C-82.3, not a joined participant C-82.4, no statement C-82.5, the writer undetermined for a participant C-82.7, the writer, or on the case door the publisher, C-82.6; a recipient is never the writer", () => {
  const { w, P } = setup();
  for (const a of [{ viewer: V("bo") }, { viewer: V("bo"), caseId: "CASE-2026-0001" }, { viewer: V("bo"), caseId: "CASE-2026-0001", edition: 0 },
                   { viewer: V("bo"), caseId: "CASE-2026-0001", edition: "x" }])
    refuses(ack(w, a), "STATEMENT_ACK_NO_SUBJECT");
  const pub = w.publish(P, "alice", [Q]);
  /* not joined: an invited participant, and an administrator who sees the project. (D54) An administrator neither
     invited nor joined sees a hidden project only at existence, so its unsigned document is working material it cannot
     see, and it receives the dead answer (R27); once the project is discoverable it sees it whole, and is no participant. */
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  refuses(ack(w, { viewer: V("ed"), draft: "DRAFT-2026-0001" }), "STATEMENT_ACK_NOT_A_PARTICIPANT");
  assert.deepEqual(ack(w, { viewer: V("root"), caseId: pub.caseId, edition: 1 }), DEAD,
    "D54: a hidden project's document is not the administrator's to see");
  assert.equal(w.membership.projectVisibilitySet({ projectId: P, setting: "discoverable", reason: "open work", by: "alice",
                                                    viewer: V("alice") }).ok, true);
  refuses(ack(w, { viewer: V("root"), caseId: pub.caseId, edition: 1 }), "STATEMENT_ACK_NOT_A_PARTICIPANT");
  assert.equal(w.membership.projectVisibilitySet({ projectId: P, setting: "hidden", reason: "closed again", by: "alice",
                                                    viewer: V("alice") }).ok, true);
  /* no statement */
  w.draft("DRAFT-2026-0002", P, { statement: "" }, { statementBy: "alice" });
  refuses(ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0002" }), "STATEMENT_ACK_NO_STATEMENT");
  /* the writer undetermined: a draft written before the stamp */
  w.draft("DRAFT-2026-0003", P, { statement: "A sentence nobody signed for." }, { statementBy: null });
  const und = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0003" });
  refuses(und, "STATEMENT_ACK_AUTHOR_UNDETERMINED");
  assert.deepEqual([und.draft, und.author], ["DRAFT-2026-0003", null]);
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0003", case_id: null, edition: 1, recipient: "r" });
  assert.equal(ack(w, { bySecret: true, secretSha: S1 }).ok, true, "a recipient is never the writer");
  /* the writer, on the draft door; the writer or the publisher on the case door */
  const own = ack(w, { viewer: V("alice"), draft: "DRAFT-2026-0001" });
  refuses(own, "STATEMENT_ACK_BY_ITS_AUTHOR");
  assert.equal(own.author, "alice");
  refuses(ack(w, { viewer: V("alice"), caseId: pub.caseId, edition: 1 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  /* signed: the list is what the signature covers */
  w.ratify(pub);
  const signed = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 });
  refuses(signed, "STATEMENT_ACK_ALREADY_SIGNED");
  assert.deepEqual([signed.caseId, signed.edition], [pub.caseId, 1]);
});

test("R20: keyed by the statement's SHA-256, the project, the case identity and the acknowledger, a repeat answering existed; on an unsigned document it re-authors only that document's list, so its hash moves; nothing about an acknowledgement refuses publication", () => {
  const { w, P } = setup();
  const pub = w.publish(P, "alice", [Q]);
  const before = w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=?`, pub.caseId);
  const a1 = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 });
  assert.equal(a1.ok, true, JSON.stringify(a1).slice(0, 300));
  assert.deepEqual([a1.existed, a1.acknowledgement.kind, a1.acknowledgement.by, a1.acknowledgement.statement_sha,
                    a1.acknowledgement.case_id, a1.acknowledgement.edition, a1.bound_to_a_case],
    [false, "participant", "bo", statementSha(AUTHORED.statement), pub.caseId, 1, true]);
  const after = w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=?`, pub.caseId);
  assert.notEqual(after.doc_sha, before.doc_sha, "the document's hash moved");
  assert.deepEqual(a1.case_documents, [{ case_id: pub.caseId, edition: 1, reauthored: true, doc_sha: after.doc_sha,
                                         acknowledged: 1, read: `op=casedocument&case=${pub.caseId}&edition=1` }]);
  const fm = w.fm(after.text);
  assert.deepEqual([fm.completeness.acknowledged, fm.completeness_acknowledgements.map((a) => [a.kind, a.by])],
    [1, [["participant", "bo"]]]);
  /* only the list's two runs changed */
  const strip = (t) => t.replace(/  statement_sha:[\s\S]*?completeness_excluded:/, "").replace(/\*\*Who else read this statement\.\*\*[\s\S]*?\n\n## What Was Searched/, "");
  assert.equal(strip(after.text), strip(before.text));
  const again = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 });
  assert.deepEqual([again.existed, again.acknowledgement.at], [true, a1.acknowledgement.at]);
  assert.equal(w.count("statement_acknowledgements"), 1);
  assert.deepEqual(again.case_documents[0].reauthored, false, "nothing new to list");
});

test("R20: matched by the identity it was given at, or by the draft named at publication, never by the statement's bytes; every list states acknowledged (zero included), withholds and counts the publisher's and the writer's own rows, withholds and counts every participant row when the writer is undetermined, and counts, never names, readings bindable to no case", () => {
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
  /* the one list: the publisher's and the writer's own withheld and counted; undetermined withholds every participant */
  const list = (writer, exceptAuthor = null) => w.ca.statementAcknowledgements(P, null, 1, AUTHORED.statement, exceptAuthor,
                                                                                writer, "DRAFT-2026-0001", null);
  assert.equal(ack(w, { viewer: V("alice"), draft: "DRAFT-2026-0001" }).ok, true, "the publisher reads the draft");
  const all = list(null);
  assert.deepEqual(all.rows.map((r) => r.by).sort(), ["alice", "bo"]);
  assert.equal(all.withheld_stated, null, "the writer not asked: no sentence about it");
  const byWriter = list({ by: "bo" }, "alice");
  assert.deepEqual([byWriter.rows, byWriter.byAuthor, byWriter.byWriter, byWriter.withheld, byWriter.withheld_stated],
    [[], 1, 1, 1, withheldWriterStated(1, "bo")]);
  const undetermined = list({ by: null });
  assert.deepEqual([undetermined.rows, undetermined.withheldWriterUndetermined, undetermined.withheld_stated],
    [[], 2, withheldWriterStated(2, null)]);
  assert.match(undetermined.withheld_stated, /UNDETERMINED rather than the writer's own/);
  /* nothing about an acknowledgement refuses publication */
  const lonely = setup();
  assert.equal(lonely.w.publish(lonely.P, "alice", [Q]).ok, true);
});

test("R21: statement_by is the member whose write made the statement's current bytes — the named draft's stamp; else a draft of the project holding that sentence; else the publisher, named as both; drafts disagreeing, or a draft from before the stamp, make it null, stated undetermined", () => {
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

test("R27: working material answers an outsider exactly as something that does not exist — an unsigned document, a draft, a hidden project — and R19's dead answer is byte-identical for every door refused", () => {
  const { w, P } = setup();
  const pub = w.publish(P, "alice", [Q]);
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  assert.deepEqual(ack(w, { viewer: V("di"), caseId: pub.caseId, edition: 1 }),
                   ack(w, { viewer: V("di"), caseId: "CASE-2026-0001", edition: 1 }), "an unsigned document");
  assert.deepEqual(ack(w, { viewer: V("di"), draft: "DRAFT-2026-0001" }),
                   ack(w, { viewer: V("di"), draft: "DRAFT-2026-0077" }), "a draft");
  const hidden = w.publish(P, "di", [Q]);
  const absent = w.publish("PROJ-2026-0000-none", "di", [Q]);
  assert.deepEqual([hidden.reason, absent.reason], ["NO_SUCH_PROJECT", "NO_SUCH_PROJECT"], "a hidden project");
  assert.equal(hidden.detail.replace(P, "X"), absent.detail.replace("PROJ-2026-0000-none", "X"));
  /* the draft door refuses the outsider whose publication names it, before anything reveals the draft */
  const d = w.ca.publishCase({ ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                               draft: "DRAFT-2026-0001", viewer: V("di"), author: "di" });
  assert.equal(d.reason, "NO_SUCH_PROJECT");
});

test("R20: an acknowledgement answers the edition the draft's identity states — null for a draft whose case publication derives (no case named, no new case asked), stated on both doors and never dropped; 1 for a new case's draft; the named case's next for a named one — while the row stays keyed at the identity it was given at", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  w.draft("DRAFT-2026-0002", P, { statement: AUTHORED.statement, newCase: true }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "a reader" });
  const byMember = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0001" });
  const byGrant = ack(w, { bySecret: true, secretSha: S1, draft: "DRAFT-2026-0001" });
  for (const r of [byMember, byGrant]) {
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.ok(Object.hasOwn(r.acknowledgement, "edition"), "stated, not absent");
    assert.deepEqual([r.acknowledgement.case_id, r.acknowledgement.edition], [null, null]);
  }
  assert.deepEqual(w.rows(`SELECT case_id, edition, acknowledger_kind FROM statement_acknowledgements
                            WHERE draft_id='DRAFT-2026-0001' ORDER BY ack_id`),
    [{ case_id: null, edition: 1, acknowledger_kind: "participant" }, { case_id: null, edition: 1, acknowledger_kind: "recipient" }],
    "the key still binds at the identity it was given at");
  const fresh = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0002" });
  assert.deepEqual([fresh.ok, fresh.acknowledgement.edition], [true, 1], "a new case's draft states edition 1");
  const pub = w.publish(P, "alice", [Q]); w.ratify(pub);
  w.draft("DRAFT-2026-0003", P, { statement: AUTHORED.statement }, { caseId: pub.caseId, statementBy: "alice" });
  const named = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0003" });
  assert.deepEqual([named.ok, named.acknowledgement.case_id, named.acknowledgement.edition], [true, pub.caseId, 2]);
});

test("R19, R29: STATEMENT_ACK_NO_REASON (C-82.8) — a reason absent, not a string, blank, only whitespace or over 2,000 characters (in code points) is refused after C-82.6, with nothing written; a reasoned acknowledgement is recorded and its reason read back in R20's list; a repeat keeps the first reason", () => {
  const { w, P } = setup();
  const pub = w.publish(P, "alice", [Q]);
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "the auditor" });
  const doc = () => w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, pub.caseId).doc_sha;
  const sha0 = doc(), n0 = w.count("statement_acknowledgements"), before = w.snapshot();
  /* 2,001 code points, each two UTF-16 units: over by code points; 2,000 of them is not */
  const astral = "\u{1F4DC}";
  const bad = [undefined, null, 7, ["a"], { t: "a" }, "", "   ", "\n\t ", "x".repeat(2001), astral.repeat(2001)];
  for (const reason of bad)
    for (const door of [{ viewer: V("bo"), caseId: pub.caseId, edition: 1 }, { viewer: V("bo"), draft: "DRAFT-2026-0001" },
                        { bySecret: true, secretSha: S1 }]) {
      const r = w.ca.acknowledgeStatement({ ...door, reason });
      refuses(r, "STATEMENT_ACK_NO_REASON");
    }
  assert.deepEqual([w.count("statement_acknowledgements"), doc()], [n0, sha0], "nothing written, the doc_sha unchanged");
  assert.deepEqual(w.snapshot(), before, "no table moved");
  /* after C-82.6: the publisher's and the writer's own acknowledgement is refused as theirs, reason or none */
  refuses(w.ca.acknowledgeStatement({ viewer: V("alice"), caseId: pub.caseId, edition: 1 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  refuses(w.ca.acknowledgeStatement({ viewer: V("alice"), draft: "DRAFT-2026-0001", reason: 7 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  /* and after every earlier refusal: C-82.2 is asked first */
  refuses(w.ca.acknowledgeStatement({ viewer: V("bo") }), "STATEMENT_ACK_NO_SUBJECT");
  /* negative controls: exactly 2,000 code points, astral or not, and a reason with spaces around it */
  const long = w.ca.acknowledgeStatement({ viewer: V("cy"), caseId: pub.caseId, edition: 1, reason: astral.repeat(2000) });
  assert.equal(long.ok, true, JSON.stringify(long).slice(0, 200));
  const r = w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: "  I read it.  " });
  assert.deepEqual([r.ok, r.existed, r.acknowledgement.reason], [true, false, "  I read it.  "]);
  const g = w.ca.acknowledgeStatement({ bySecret: true, secretSha: S1, reason: "Read as the auditor." });
  assert.deepEqual([g.ok, g.acknowledgement.reason], [true, "Read as the auditor."]);
  /* the list carries each reason */
  const list = w.ca.statementAcknowledgements(P, pub.caseId, 1, AUTHORED.statement);
  assert.deepEqual(list.rows.map((x) => [x.by, x.reason]), [["cy", astral.repeat(2000)], ["bo", "  I read it.  "]]);
  /* a repeat answers existed and keeps the first reason */
  const again = w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: "Other words." });
  assert.deepEqual([again.existed, again.acknowledgement.reason], [true, "  I read it.  "]);
  assert.deepEqual(w.ca.statementAcknowledgements(P, pub.caseId, 1, AUTHORED.statement).rows.map((x) => x.reason),
    [astral.repeat(2000), "  I read it.  "]);
  /* the signed document's acknowledgement lines are unchanged: the reason is in the list, not in the bytes */
  const text = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=1`, pub.caseId).text;
  assert.equal(text.includes("I read it."), false);
  assert.deepEqual(Object.keys(w.fm(text).completeness_acknowledgements[0]).sort(), ["at", "by", "kind", "recipient"]);
});

test("R19: an acknowledgement recorded before DEC-88 has a null reason — the column is added to a table created without it, never filled, and the list reads it as null", async () => {
  const { w, P } = setup();
  const pub = w.publish(P, "alice", [Q]);
  const { migrateCaseAuthoring } = await import("../../../src/case-authoring/schema.mjs");
  /* the table as it stood before T22: no reason column */
  w.st.db.exec(`DROP TABLE statement_acknowledgements`);
  w.st.db.exec(`CREATE TABLE statement_acknowledgements (ack_id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL,
    case_id TEXT, edition INTEGER NOT NULL, statement_sha TEXT NOT NULL, draft_id TEXT, acknowledger_kind TEXT NOT NULL,
    acknowledger TEXT NOT NULL, recipient TEXT, at TEXT NOT NULL)`);
  w.st.sql.exec(`INSERT INTO statement_acknowledgements (project_id, case_id, edition, statement_sha, acknowledger_kind,
    acknowledger, at) VALUES (?,?,1,?,'participant','cy','2026-09-01T00:00:00Z')`, P, pub.caseId, statementSha(AUTHORED.statement));
  migrateCaseAuthoring(w.st.sql);
  migrateCaseAuthoring(w.st.sql);
  assert.ok(w.rows(`PRAGMA table_info(statement_acknowledgements)`).some((c) => c.name === "reason"), "added, idempotently");
  assert.deepEqual(w.ca.statementAcknowledgements(P, pub.caseId, 1, AUTHORED.statement).rows.map((x) => [x.by, x.reason]),
    [["cy", null]]);
  const r = w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: WORDS });
  assert.equal(r.ok, true);
  assert.deepEqual(w.ca.statementAcknowledgements(P, pub.caseId, 1, AUTHORED.statement).rows.map((x) => x.reason), [null, WORDS]);
});

test("R62: op=statementack takes the grant's secretSha only from the internal request's body — a grant named in the body opens R19's grant door, and the same digest in the query opens no door: R19's dead answer, byte-identical, nothing written", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "the auditor" });
  const url = (s) => new URL(`http://do/statementack?bySecret=1&reason=${encodeURIComponent(WORDS)}${s}`);
  const before = w.snapshot();
  /* the digest in the query, with no body, a body without it, or a body whose own is not a string: no door */
  for (const [u, body] of [[url(`&secretSha=${S1}`), null], [url(`&secretSha=${S1}`), {}], [url(`&secretSha=${S1}`), { secretSha: 7 }],
                           [url(`&secretSha=${S1}&draft=DRAFT-2026-0001`), { reason: WORDS }], [url(""), null], [url(""), []]])
    assert.deepEqual(caseAuthoringOps(w.ca, u, body).statementack(), DEAD, `${u.search} ${JSON.stringify(body)}`);
  /* a query's digest never overrides or joins the body's: a body naming a dead grant stays dead whatever the query says */
  assert.deepEqual(caseAuthoringOps(w.ca, url(`&secretSha=${S1}`), { secretSha: S3 }).statementack(), DEAD);
  assert.deepEqual(w.snapshot(), before, "nothing written by any refused door");
  /* the body's digest opens the grant door; bySecret, the subject and reason are read from the query as before */
  const ok = caseAuthoringOps(w.ca, url("&draft=DRAFT-2026-0001"), { secretSha: S1, reason: "a body's words" }).statementack();
  assert.deepEqual([ok.ok, ok.acknowledgement.kind, ok.acknowledgement.grant_id, ok.acknowledgement.reason],
    [true, "recipient", "RVG-2026-0001", WORDS]);
  /* bySecret still comes from the query: a body's digest without it is the member door, asked of the viewer stamp */
  const noFlag = caseAuthoringOps(w.ca, new URL(`http://do/statementack?draft=DRAFT-2026-0001&reason=x`), { secretSha: S1, bySecret: true })
    .statementack();
  assert.deepEqual(noFlag, DEAD, "no viewer stamp and no bySecret in the query: no door");
});
