/* case-inputs: the statement's acknowledgements (R1, R2), who wrote the statement (R3), the grant's digest from the body
   only (R5), stamps (R13), and working material answering an outsider as something that does not exist (R14). Copied
   from case-authoring's statement.test.mjs (its R19–R21, R27, R62 arms), each preparation stored as op=publish leaves it
   (the fixture's `prepare`), since case-authoring is later in the order. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, DEAD, STATEMENT, WORDS } from "./fixture.mjs";
import { STATEMENT_ACK_CHECKS, statementSha, withheldWriterStated, caseInputsOps, migrateCaseInputs }
  from "../../../src/case-inputs/index.mjs";

const S1 = "a".repeat(64), S2 = "b".repeat(64), S3 = "c".repeat(64);

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo", "cy", "di", "ed"]) w.member(m);
  w.member("root", { role: "admin" });
  const P = w.project("Team", "alice");
  w.join(P, "bo"); w.join(P, "cy"); w.join(P, "ed", "invited");
  return { w, P };
}
const ack = (w, a) => w.ci.acknowledgeStatement({ reason: WORDS, ...a });
const refuses = (r, code) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
  [false, code, code, STATEMENT_ACK_CHECKS[code].check, STATEMENT_ACK_CHECKS[code].translation], JSON.stringify(r).slice(0, 300));
const docText = (w, c, e) => w.docOf(c, e).text;

test("R1: doors — a recipient through a live grant (a named draft must be the grant's own); a member, of a draft, or of an unsigned case document it has standing in; every other caller receives the review copy's dead answer, byte-identical", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "alice" });
  w.draft("DRAFT-2026-0002", P, { statement: "Another sentence." }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "the auditor" });
  w.grant(S2, { grant_id: "RVG-2026-0002", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "gone", revoked: true });
  const pub = w.prepare(P, "alice");
  w.project("Elsewhere", "di");
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
    ack(w, { viewer: V("bo"), caseId: "CASE-2026-0404", edition: 1 }),             /* no such document */
  ];
  for (const d of dead) assert.deepEqual(d, DEAD, "the one dead answer, byte for byte");
  const byGrant = ack(w, { bySecret: true, secretSha: S1 });
  assert.deepEqual([byGrant.ok, byGrant.acknowledgement.kind, byGrant.acknowledgement.by, byGrant.acknowledgement.recipient,
                    byGrant.acknowledgement.grant_id], [true, "recipient", "RVG-2026-0001", "the auditor", "RVG-2026-0001"]);
  assert.equal(ack(w, { bySecret: true, secretSha: S1, draft: "DRAFT-2026-0001" }).ok, true, "its own draft, named");
  assert.equal(ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0001" }).ok, true, "a member of the draft");
  assert.equal(ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 }).ok, true, "a member with standing in the document");
});

test("R1 (D54): refusals in order — STATEMENT_ACK_NO_SUBJECT (C-82.2), a signed document C-82.3, not a joined participant C-82.4, no statement C-82.5, the writer undetermined for a participant C-82.7, the writer, or on the case door the publisher, C-82.6; a recipient is never the writer", () => {
  const { w, P } = setup();
  for (const a of [{ viewer: V("bo") }, { viewer: V("bo"), caseId: "CASE-2026-0001" }, { viewer: V("bo"), caseId: "CASE-2026-0001", edition: 0 },
                   { viewer: V("bo"), caseId: "CASE-2026-0001", edition: "x" }])
    refuses(ack(w, a), "STATEMENT_ACK_NO_SUBJECT");
  const pub = w.prepare(P, "alice");
  /* not joined: an invited participant, and an administrator who sees the project. (D54) An administrator neither
     invited nor joined sees a hidden project only at existence, so its unsigned document is working material it cannot
     see, and it receives the dead answer (R14); once the project is discoverable it sees it whole, and is no participant. */
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "alice" });
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
  /* the writer undetermined on the case door: a document stating statement_by null */
  w.draft("DRAFT-2026-0004", P, { statement: "Undetermined on the case door." }, { statementBy: null });
  const undDoc = w.prepare(P, "alice", { statement: "Undetermined on the case door.", draft: "DRAFT-2026-0004" });
  assert.equal(undDoc.writer.by, null);
  refuses(ack(w, { viewer: V("bo"), caseId: undDoc.caseId, edition: 1 }), "STATEMENT_ACK_AUTHOR_UNDETERMINED");
  /* the writer, on the draft door; the writer or the publisher on the case door */
  const own = ack(w, { viewer: V("alice"), draft: "DRAFT-2026-0001" });
  refuses(own, "STATEMENT_ACK_BY_ITS_AUTHOR");
  assert.equal(own.author, "alice");
  refuses(ack(w, { viewer: V("alice"), caseId: pub.caseId, edition: 1 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  w.draft("DRAFT-2026-0005", P, { statement: "Bo wrote this one." }, { statementBy: "bo" });
  const byBo = w.prepare(P, "alice", { statement: "Bo wrote this one.", draft: "DRAFT-2026-0005" });
  const publisher = ack(w, { viewer: V("alice"), caseId: byBo.caseId, edition: 1 });
  refuses(publisher, "STATEMENT_ACK_BY_ITS_AUTHOR");
  assert.equal(publisher.author, "alice", "the publisher, though bo wrote the sentence");
  refuses(ack(w, { viewer: V("bo"), caseId: byBo.caseId, edition: 1 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  assert.equal(ack(w, { viewer: V("cy"), caseId: byBo.caseId, edition: 1 }).ok, true, "control: a third participant");
  /* signed: the list is what the signature covers */
  w.ratify(pub, P);
  const signed = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 });
  refuses(signed, "STATEMENT_ACK_ALREADY_SIGNED");
  assert.deepEqual([signed.caseId, signed.edition], [pub.caseId, 1]);
});

test("R2: keyed by the statement's SHA-256, the project, the case identity and the acknowledger, a repeat answering existed; on an unsigned document it re-authors only that document's list, so its hash moves", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  const before = w.docOf(pub.caseId, 1);
  const a1 = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 });
  assert.equal(a1.ok, true, JSON.stringify(a1).slice(0, 300));
  assert.deepEqual([a1.existed, a1.acknowledgement.kind, a1.acknowledgement.by, a1.acknowledgement.statement_sha,
                    a1.acknowledgement.case_id, a1.acknowledgement.edition, a1.bound_to_a_case],
    [false, "participant", "bo", statementSha(STATEMENT), pub.caseId, 1, true]);
  const after = w.docOf(pub.caseId, 1);
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
  /* a document whose list's prose run is not there (authored before the list was) is left as it was, and says so */
  const old = w.prepare(P, "alice", { statement: "An old document's sentence.", withAckRuns: false });
  const o = ack(w, { viewer: V("bo"), caseId: old.caseId, edition: 1 });
  assert.deepEqual([o.ok, o.case_documents[0].reauthored], [true, false]);
  assert.match(o.case_documents[0].why, /authored before acknowledgements were recorded/);
  assert.equal(w.docOf(old.caseId, 1).doc_sha, old.doc_sha);
});

test("R2: matched by the identity it was given at, or by the draft named at publication, never by the statement's bytes; every list states acknowledged (zero included), withholds and counts the publisher's and the writer's own rows, withholds and counts every participant row when the writer is undetermined, and counts, never names, readings bindable to no case; nothing about an acknowledgement refuses publication", () => {
  const { w, P } = setup();
  /* two drafts of one sentence naming no case: readings of each are readings of that draft */
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "cy" });
  w.draft("DRAFT-2026-0002", P, { statement: STATEMENT }, { statementBy: "cy" });
  assert.equal(ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0001" }).ok, true);
  const d2 = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0002" });
  assert.deepEqual([d2.existed, d2.bound_to_a_case], [false, false], "a second draft's reading is its own");
  assert.match(d2.listed, /names no case/);
  /* prepared NAMING draft 1: its reading binds; draft 2's is unbindable, counted and never named */
  const pub = w.prepare(P, "alice", { draft: "DRAFT-2026-0001" });
  assert.deepEqual(pub.acks.rows, [{ kind: "participant", by: "bo", recipient: null, at: w.clock.ms, reason: WORDS,
                                     draft: "DRAFT-2026-0001" }]);
  assert.deepEqual([pub.acks.boundByLink, pub.acks.unbound], [1, 1]);
  const body = docText(w, pub.caseId, 1);
  assert.ok(body.includes("given on draft DRAFT-2026-0001"));
  assert.match(body, /This record also holds 1 acknowledgement of this exact statement/);
  /* a reading on the named draft after publication binds to that case and re-authors its unsigned document */
  const linked = ack(w, { viewer: V("ed"), draft: "DRAFT-2026-0001" });
  refuses(linked, "STATEMENT_ACK_NOT_A_PARTICIPANT");
  const bound = ack(w, { viewer: V("alice"), draft: "DRAFT-2026-0001" });
  assert.deepEqual([bound.ok, bound.bound_to_a_case, bound.draft_link.case_id, bound.draft_link.signed],
    [true, true, pub.caseId, false]);
  assert.match(bound.listed, /now lists this reading/);
  /* a case of a byte-identical statement lists none of another case's readings */
  const other = w.prepare(P, "alice");
  assert.deepEqual([other.acks.rows, w.fm(docText(w, other.caseId, 1)).completeness.acknowledged], [[], 0]);
  assert.ok(docText(w, other.caseId, 1).includes("**Who else read this statement.** Nobody acknowledged it FOR THIS CASE"),
    "zero is stated, and with unbindable readings held it is not 'nobody but its author'");
  /* the one list: the publisher's and the writer's own withheld and counted; undetermined withholds every participant */
  const list = (writer, exceptAuthor = null) => w.ci.statementAcknowledgements(P, null, 1, STATEMENT, exceptAuthor,
                                                                                writer, "DRAFT-2026-0001", null);
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
  /* zero, with nothing held of the sentence: "nobody but its author" */
  const lonely = setup();
  const l = lonely.w.prepare(lonely.P, "alice", { statement: "A sentence nobody else read." });
  assert.equal(lonely.w.fm(docText(lonely.w, l.caseId, 1)).completeness.acknowledged, 0);
  assert.ok(docText(lonely.w, l.caseId, 1).includes("**Who else read this statement.** Nobody but its author acknowledged it."));
});

test("R2: a list names at most STATEMENT_ACK_MAX (500) rows and says so (truncated); one under the bound is not truncated", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  const sha = statementSha(STATEMENT);
  for (let i = 0; i < 501; i++)
    w.st.sql.exec(`INSERT INTO statement_acknowledgements (project_id, case_id, edition, statement_sha, acknowledger_kind,
                   acknowledger, at, reason) VALUES (?,?,1,?,'participant',?,?,?)`, P, pub.caseId, sha, `m${i}`,
                  `2026-09-28T01:00:00.${String(i).padStart(3, "0")}Z`, WORDS);
  const cut = w.ci.statementAcknowledgements(P, pub.caseId, 1, STATEMENT);
  assert.deepEqual([cut.rows.length, cut.truncated, cut.rows[0].by, cut.rows[499].by], [500, true, "m0", "m499"]);
  w.st.sql.exec(`DELETE FROM statement_acknowledgements WHERE acknowledger='m500'`);
  const whole = w.ci.statementAcknowledgements(P, pub.caseId, 1, STATEMENT);
  assert.deepEqual([whole.rows.length, whole.truncated], [500, false]);
});

test("R2: an acknowledgement answers the edition the draft's identity states — null for a draft whose case publication derives (no case named, no new case asked), stated on both doors and never dropped; 1 for a new case's draft; the named case's next for a named one — while the row stays keyed at the identity it was given at", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "alice" });
  w.draft("DRAFT-2026-0002", P, { statement: STATEMENT, newCase: true }, { statementBy: "alice" });
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
  const pub = w.prepare(P, "alice"); w.ratify(pub, P);
  w.draft("DRAFT-2026-0003", P, { statement: STATEMENT }, { caseId: pub.caseId, statementBy: "alice" });
  const named = ack(w, { viewer: V("bo"), draft: "DRAFT-2026-0003" });
  assert.deepEqual([named.ok, named.acknowledgement.case_id, named.acknowledgement.edition], [true, pub.caseId, 2]);
});

test("R3: statement_by is the member whose write made the statement's current bytes — the named draft's stamp; else a draft of the project holding that sentence; else the publisher, named as both; drafts disagreeing, or a draft from before the stamp, make it null, stated undetermined; it answers where the name came from and writes nothing", () => {
  const writer = (setupDrafts, named = null, publisher = "alice") => {
    const { w, P } = setup();
    setupDrafts(w, P);
    const d = named ? w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, named) : null;
    const before = w.snapshot();
    const r = w.ci.statementWriter(P, "CASE-2026-0001", 1, STATEMENT, publisher, d);
    assert.deepEqual(w.snapshot(), before, "it writes nothing");
    return r;
  };
  /* the named draft decides, however the others disagree */
  const named = writer((w, P) => {
    w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "bo" });
    w.draft("DRAFT-2026-0002", P, { statement: STATEMENT }, { statementBy: "cy" });
  }, "DRAFT-2026-0002");
  assert.deepEqual([named.by, named.from], ["cy", "named_draft"]);
  assert.match(named.stated, /DRAFT-2026-0002, which alice named/);
  /* a named draft holding another sentence says nothing about these bytes: the project's drafts are asked */
  const scan = writer((w, P) => {
    w.draft("DRAFT-2026-0001", P, { statement: "Some other sentence." }, { statementBy: "bo" });
    w.draft("DRAFT-2026-0002", P, { statement: STATEMENT }, { statementBy: "cy" });
  }, "DRAFT-2026-0001");
  assert.deepEqual([scan.by, scan.from], ["cy", "draft"]);
  /* no draft holds it: the publisher wrote these bytes at this act */
  const act = writer(() => {});
  assert.deepEqual([act.by, act.from], ["alice", "this_act"]);
  assert.match(act.stated, /alice wrote this exclusion statement in the act that published this case/);
  /* a named draft from before the stamp: undetermined, never filled from the publisher */
  const pre = writer((w, P) => w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: null }), "DRAFT-2026-0001");
  assert.deepEqual([pre.by, pre.from], [null, "named_draft_unrecorded"]);
  assert.match(pre.stated, /^UNDETERMINED: alice named draft DRAFT-2026-0001/);
  /* an unnamed matching draft from before the stamp */
  const unrec = writer((w, P) => w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: null }));
  assert.deepEqual([unrec.by, unrec.from], [null, "draft_unrecorded"]);
  /* disagreeing drafts, none named */
  const dis = writer((w, P) => {
    w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "bo" });
    w.draft("DRAFT-2026-0002", P, { statement: STATEMENT }, { statementBy: "cy" });
  });
  assert.deepEqual([dis.by, dis.from], [null, "drafts_disagree"]);
  assert.match(dis.stated, /^UNDETERMINED/);
  /* a draft at this identity whose arguments do not parse, with its reason, asked before "no draft holds it" */
  const bad = writer((w, P) => w.st.sql.exec(`INSERT INTO case_drafts (draft_id, project_id, case_id, params, created_by,
    created_at, updated_by, updated_at, statement_by) VALUES ('DRAFT-2026-0009', ?, NULL, '{not json', 'bo', 't', 'bo', 't', 'bo')`, P));
  assert.deepEqual([bad.by, bad.from], [null, "draft_unreadable"]);
  assert.match(bad.stated, /DRAFT-2026-0009/);
  /* more drafts than one read of DRAFTS_READ_MAX (500) lists */
  const many = writer((w, P) => { for (let i = 0; i < 501; i++) w.draft(`DRAFT-2026-${String(i).padStart(4, "0")}`, P, { statement: "x" }); });
  assert.deepEqual([many.by, many.from], [null, "drafts_unbounded"]);
  assert.match(many.stated, /\(500\)/);
  /* control: 500 drafts are read whole */
  const five = writer((w, P) => { for (let i = 0; i < 500; i++) w.draft(`DRAFT-2026-${String(i).padStart(4, "0")}`, P, { statement: "x" }); });
  assert.equal(five.from, "this_act");
  /* the document prints the writer (it is read from the record, R13) */
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: null });
  const p = w.prepare(P, "alice", { draft: "DRAFT-2026-0001" });
  assert.equal(w.fm(docText(w, p.caseId, 1)).completeness.statement_by, null);
});

test("R13: every authorship field this module records is a stamp — an acknowledger is the viewer the control plane stamped, a body names nobody — and statement_by is read from the record, never a body's", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT, statement_by: "mallory", statementBy: "mallory" }, { statementBy: "bo" });
  const pub = w.prepare(P, "alice", { draft: "DRAFT-2026-0001" });
  assert.equal(pub.writer.by, "bo", "the draft's stamp, never its arguments' copy");
  const au = new URL(`http://do/statementack?case=${pub.caseId}&edition=1&viewer=${encodeURIComponent(V("cy"))}&reason=read`);
  const a = caseInputsOps(w.ci, au, { viewer: V("mallory"), by: "mallory", acknowledger: "mallory" }).statementack();
  assert.deepEqual([a.ok, a.acknowledgement.by], [true, "cy"]);
  assert.deepEqual(w.rows(`SELECT acknowledger FROM statement_acknowledgements`).map((r) => r.acknowledger), ["cy"]);
});

test("R14: working material answers an outsider exactly as something that does not exist — an unsigned document, a draft, a hidden project — and R1's dead answer is byte-identical for every door refused", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "alice" });
  assert.deepEqual(ack(w, { viewer: V("di"), caseId: pub.caseId, edition: 1 }),
                   ack(w, { viewer: V("di"), caseId: "CASE-2026-0404", edition: 1 }), "an unsigned document");
  assert.deepEqual(ack(w, { viewer: V("di"), draft: "DRAFT-2026-0001" }),
                   ack(w, { viewer: V("di"), draft: "DRAFT-2026-0077" }), "a draft");
  /* a hidden project's case: the drafts of what changed and the outcomes list answer as for a case that does not exist */
  w.ratify(pub, P);
  assert.deepEqual(w.ci.whatChangedDrafts({ case: pub.caseId, viewer: V("di") }),
                   w.ci.whatChangedDrafts({ case: "CASE-2026-0404", viewer: V("di") }), "a hidden project's case");
  assert.deepEqual(w.ci.carriedOutcomesOf({ case: pub.caseId, viewer: V("di") }), DEAD);
  /* with no review provider registered the doors are still one answer: C-87.1's bare dead answer */
  const bare = setup({ provider: false });
  const p2 = bare.w.prepare(bare.P, "alice");
  const none = [ack(bare.w, { viewer: V("di"), caseId: p2.caseId, edition: 1 }), ack(bare.w, { bySecret: true, secretSha: S1 }),
                ack(bare.w, { viewer: V("bo"), draft: "DRAFT-2026-0001" })];
  assert.equal(new Set(none.map((r) => JSON.stringify(r))).size, 1, "one answer");
  assert.equal(none[0].ok, false);
});

test("R1, R12: STATEMENT_ACK_NO_REASON (C-82.8) — a reason absent, not a string, blank, only whitespace or over 2,000 characters (in code points) is refused after C-82.6, with nothing written; a reasoned acknowledgement is recorded and its reason read back in R2's list; a repeat keeps the first reason", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "the auditor" });
  const doc = () => w.docOf(pub.caseId, 1).doc_sha;
  const sha0 = doc(), n0 = w.count("statement_acknowledgements"), before = w.snapshot();
  /* 2,001 code points, each two UTF-16 units: over by code points; 2,000 of them is not */
  const astral = "\u{1F4DC}";
  const bad = [undefined, null, 7, ["a"], { t: "a" }, "", "   ", "\n\t ", "x".repeat(2001), astral.repeat(2001)];
  for (const reason of bad)
    for (const door of [{ viewer: V("bo"), caseId: pub.caseId, edition: 1 }, { viewer: V("bo"), draft: "DRAFT-2026-0001" },
                        { bySecret: true, secretSha: S1 }])
      refuses(w.ci.acknowledgeStatement({ ...door, reason }), "STATEMENT_ACK_NO_REASON");
  assert.deepEqual([w.count("statement_acknowledgements"), doc()], [n0, sha0], "nothing written, the doc_sha unchanged");
  assert.deepEqual(w.snapshot(), before, "no table moved");
  /* after C-82.6: the publisher's and the writer's own acknowledgement is refused as theirs, reason or none */
  refuses(w.ci.acknowledgeStatement({ viewer: V("alice"), caseId: pub.caseId, edition: 1 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  refuses(w.ci.acknowledgeStatement({ viewer: V("alice"), draft: "DRAFT-2026-0001", reason: 7 }), "STATEMENT_ACK_BY_ITS_AUTHOR");
  /* and after every earlier refusal: C-82.2 is asked first */
  refuses(w.ci.acknowledgeStatement({ viewer: V("bo") }), "STATEMENT_ACK_NO_SUBJECT");
  /* negative controls: exactly 2,000 code points, astral or not, and a reason with spaces around it */
  const long = w.ci.acknowledgeStatement({ viewer: V("cy"), caseId: pub.caseId, edition: 1, reason: astral.repeat(2000) });
  assert.equal(long.ok, true, JSON.stringify(long).slice(0, 200));
  w.clock.ms = "2026-09-28T01:00:00.001Z";
  const r = w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: "  I read it.  " });
  assert.deepEqual([r.ok, r.existed, r.acknowledgement.reason], [true, false, "  I read it.  "]);
  const g = w.ci.acknowledgeStatement({ bySecret: true, secretSha: S1, reason: "Read as the auditor." });
  assert.deepEqual([g.ok, g.acknowledgement.reason], [true, "Read as the auditor."]);
  /* the list carries each reason */
  const list = w.ci.statementAcknowledgements(P, pub.caseId, 1, STATEMENT);
  assert.deepEqual(list.rows.map((x) => [x.by, x.reason]), [["cy", astral.repeat(2000)], ["bo", "  I read it.  "]]);
  /* a repeat answers existed and keeps the first reason */
  const again = w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: "Other words." });
  assert.deepEqual([again.existed, again.acknowledgement.reason], [true, "  I read it.  "]);
  assert.deepEqual(w.ci.statementAcknowledgements(P, pub.caseId, 1, STATEMENT).rows.map((x) => x.reason),
    [astral.repeat(2000), "  I read it.  "]);
  /* the document's acknowledgement lines are unchanged: the reason is in the list, not in the bytes */
  const text = w.docOf(pub.caseId, 1).text;
  assert.equal(text.includes("I read it."), false);
  assert.deepEqual(Object.keys(w.fm(text).completeness_acknowledgements[0]).sort(), ["at", "by", "kind", "recipient"]);
});

test("R1, R16: an acknowledgement recorded before DEC-88 has a null reason — the column is added to a table created without it, never filled, and the list reads it as null", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  /* the table as it stood before T22: no reason column */
  w.st.db.exec(`DROP TABLE statement_acknowledgements`);
  w.st.db.exec(`CREATE TABLE statement_acknowledgements (ack_id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL,
    case_id TEXT, edition INTEGER NOT NULL, statement_sha TEXT NOT NULL, draft_id TEXT, acknowledger_kind TEXT NOT NULL,
    acknowledger TEXT NOT NULL, recipient TEXT, at TEXT NOT NULL)`);
  w.st.sql.exec(`INSERT INTO statement_acknowledgements (project_id, case_id, edition, statement_sha, acknowledger_kind,
    acknowledger, at) VALUES (?,?,1,?,'participant','cy','2026-09-01T00:00:00Z')`, P, pub.caseId, statementSha(STATEMENT));
  migrateCaseInputs(w.st.sql);
  migrateCaseInputs(w.st.sql);
  assert.ok(w.rows(`PRAGMA table_info(statement_acknowledgements)`).some((c) => c.name === "reason"), "added, idempotently");
  assert.deepEqual(w.ci.statementAcknowledgements(P, pub.caseId, 1, STATEMENT).rows.map((x) => [x.by, x.reason]),
    [["cy", null]]);
  const r = w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: WORDS });
  assert.equal(r.ok, true);
  assert.deepEqual(w.ci.statementAcknowledgements(P, pub.caseId, 1, STATEMENT).rows.map((x) => x.reason), [null, WORDS]);
});

test("R5: op=statementack takes the grant's secretSha only from the internal request's body — a grant named in the body opens R1's grant door, and the same digest in the query opens no door: R1's dead answer, byte-identical, nothing written", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "alice" });
  w.grant(S1, { grant_id: "RVG-2026-0001", draft_id: "DRAFT-2026-0001", case_id: null, edition: 1, recipient: "the auditor" });
  const url = (s) => new URL(`http://do/statementack?bySecret=1&reason=${encodeURIComponent(WORDS)}${s}`);
  const before = w.snapshot();
  /* the digest in the query, with no body, a body without it, or a body whose own is not a string: no door */
  for (const [u, body] of [[url(`&secretSha=${S1}`), null], [url(`&secretSha=${S1}`), {}], [url(`&secretSha=${S1}`), { secretSha: 7 }],
                           [url(`&secretSha=${S1}&draft=DRAFT-2026-0001`), { reason: WORDS }], [url(""), null], [url(""), []]])
    assert.deepEqual(caseInputsOps(w.ci, u, body).statementack(), DEAD, `${u.search} ${JSON.stringify(body)}`);
  /* a query's digest never overrides or joins the body's: a body naming a dead grant stays dead whatever the query says */
  assert.deepEqual(caseInputsOps(w.ci, url(`&secretSha=${S1}`), { secretSha: S3 }).statementack(), DEAD);
  assert.deepEqual(w.snapshot(), before, "nothing written by any refused door");
  /* the body's digest opens the grant door; bySecret, the subject and reason are read from the query as before */
  const ok = caseInputsOps(w.ci, url("&draft=DRAFT-2026-0001"), { secretSha: S1, reason: "a body's words" }).statementack();
  assert.deepEqual([ok.ok, ok.acknowledgement.kind, ok.acknowledgement.grant_id, ok.acknowledgement.reason],
    [true, "recipient", "RVG-2026-0001", WORDS]);
  /* bySecret still comes from the query: a body's digest without it is the member door, asked of the viewer stamp */
  const noFlag = caseInputsOps(w.ci, new URL(`http://do/statementack?draft=DRAFT-2026-0001&reason=x`), { secretSha: S1, bySecret: true })
    .statementack();
  assert.deepEqual(noFlag, DEAD, "no viewer stamp and no bySecret in the query: no door");
});

test("R2: an acknowledgement and the re-authoring of its unsigned document's list are one act: when the splice fails, no acknowledgement is recorded and the document is unchanged; control: the same act with the splice working records both", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  const before = w.snapshot();
  const splice = w.publication.reauthorSection;
  w.publication.reauthorSection = () => { throw new Error("the splice failed"); };
  assert.throws(() => ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 }), /the splice failed/);
  w.publication.reauthorSection = splice;
  assert.deepEqual(w.snapshot(), before, "nothing written: no row, the document as it was");
  const ok = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 });
  assert.deepEqual([ok.ok, w.count("statement_acknowledgements"), ok.case_documents[0].reauthored], [true, 1, true]);
});
