/* case-authoring (T51 fix round; K4165, K4168, K4194; DEC-384): R78, a draft named by `draft` supplies every authored field
   the call did not send; R79, the pre-flight and the publication judge the ceremony's disclosures alike; R80, a case
   naming no finding has its own refusal. Each runs through the module's ops map as the door calls it (`url` and `body`),
   over the real modules on one host and a real draft row of review's table. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED } from "./fixture.mjs";
import { caseAuthoringOps, AUTHORED_FIELDS, ACT_FIELDS, DRAFT_FIELDS } from "../../../src/case-authoring/index.mjs";
import { hasWord, word } from "../../../src/setup-words/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
/* what a draft keeps of op=publish's arguments (review R4): the authored fields, the roster and its roles, never the
   project (the draft's own), a stamp or the signer's confirmation */
const KEPT = Object.freeze({ targets: [Q], roles: { [Q]: "load_bearing" }, scope: AUTHORED.scope, statement: AUTHORED.statement,
  subjectPosition: AUTHORED.subjectPosition, subjectJustification: AUTHORED.subjectJustification,
  biasAcknowledgement: AUTHORED.biasAcknowledgement, excluded: [] });
const MEMBERS = ["alice", "cy", "mallory"];

function setup() {
  const w = world();
  for (const m of MEMBERS) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q]);
  const P2 = w.project("Other", "cy", [Q2]);
  return { w, P, P2 };
}
/* the op as the door runs it: the stamps in the query, the fields as the body */
const door = (w, op, who, fields) => caseAuthoringOps(w.ca,
  new URL(`http://do/x?viewer=${encodeURIComponent(V(who))}&author=${who}`), fields)[op]();
const docOf = (w, r) => w.row(`SELECT * FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
const reasonsOf = (pre) => [pre.first, ...pre.blockers].filter(Boolean).map((r) => r.reason);

test("R78: publishpreflight {draft, project} reads the draft's authored fields: none of NO_STATEMENT, NO_SUBJECT_POSITION, NO_EXCLUSION_FIELD, NO_SCOPE, NO_BIAS_ACKNOWLEDGEMENT, and nothing is written", async () => {
  const { w, P } = setup();
  w.draft("DRAFT-1", P, KEPT);
  /* the op first: its gather creates the workbooks module's tables on first use, empty (not this act's write) */
  await door(w, "publishpreflight", "alice", { ...AUTHORED, project: P, targets: [Q], roles: KEPT.roles });
  const before = w.snapshot();
  const pre = await door(w, "publishpreflight", "alice", { project: P, draft: "DRAFT-1", tieAttested: true });
  assert.equal(pre.first, null, JSON.stringify(pre.first));
  for (const code of ["NO_STATEMENT", "NO_SUBJECT_POSITION", "NO_SUBJECT_JUSTIFICATION", "NO_EXCLUSION_FIELD", "NO_SCOPE",
                      "NO_BIAS_ACKNOWLEDGEMENT", "PUBLISH_NO_FINDING", "NO_MEMBER_ROLE"])
    assert.equal(reasonsOf(pre).includes(code), false, code);
  assert.deepEqual(w.snapshot(), before, "a pre-flight, and the draft read in it, write nothing");
  /* control: the same call without the draft is refused for the first field the act needs, which is the finding */
  const bare = await door(w, "publishpreflight", "alice", { project: P, tieAttested: true });
  assert.equal(bare.first.reason, "PUBLISH_NO_FINDING");
});

test("R78: publish {draft, project, tieAttested} writes a document whose statement, scope and targets are the draft's; the draft is not written", async () => {
  const { w, P } = setup();
  w.draft("DRAFT-1", P, KEPT);
  const draftRow = w.row(`SELECT * FROM case_drafts WHERE draft_id='DRAFT-1'`);
  const r = await door(w, "publishcase", "alice", { project: P, draft: "DRAFT-1", tieAttested: true });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const fm = w.fm(docOf(w, r).text);
  assert.equal(fm.case_scope, KEPT.scope);
  assert.equal(fm.completeness.statement, KEPT.statement);
  assert.deepEqual((fm.case_roles || []).map((m) => [m.target, m.role]), [[Q, "load_bearing"]]);
  assert.deepEqual(r.findings.map((f) => f.target), [Q]);
  assert.deepEqual(w.row(`SELECT * FROM case_drafts WHERE draft_id='DRAFT-1'`), draftRow, "nothing is written to the draft");
  /* the method, called as review's gates and the plane's callers call it, reads the draft alike */
  const again = w.ca.publishCase({ project: P, draft: "DRAFT-1", tieAttested: true, viewer: V("alice"), author: "alice" });
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
});

test("R78 control: a field the call sends is used as sent; a draft without a statement is still NO_STATEMENT", async () => {
  const { w, P } = setup();
  w.draft("DRAFT-1", P, KEPT);
  const r = await door(w, "publishcase", "alice", { project: P, draft: "DRAFT-1", tieAttested: true, scope: "Another scope entirely." });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const fm = w.fm(docOf(w, r).text);
  assert.deepEqual([fm.case_scope, fm.completeness.statement], ["Another scope entirely.", KEPT.statement]);
  /* the targets sent win over the draft's: the draft names Q, the call Q2, so Q2 is what the case would pin */
  w.draft("DRAFT-4", P, KEPT);
  const sent = await door(w, "publishpreflight", "alice", { project: P, draft: "DRAFT-4", tieAttested: true, targets: [Q2],
    roles: { [Q2]: "load_bearing" } });
  assert.equal(sent.first, null, JSON.stringify(sent.first));
  assert.deepEqual(sent.steps[0].pinned.map((f) => f.target), [Q2], "the call's own targets are judged, not the draft's");
  const { statement: _s, ...noStatement } = KEPT;
  w.draft("DRAFT-2", P, noStatement);
  const bare = await door(w, "publishcase", "alice", { project: P, draft: "DRAFT-2", tieAttested: true });
  assert.deepEqual([bare.ok, bare.reason], [false, "NO_STATEMENT"]);
});

test("R78 control: a draft of another project, or one the caller cannot read, is not merged and is PUBLISH_DRAFT_NOT_FOUND", async () => {
  const { w, P, P2 } = setup();
  w.draft("DRAFT-1", P, KEPT);
  /* cy owns P2 and cannot read P's draft: nothing of the draft is taken, so the call keeps naming no finding */
  const bare = await door(w, "publishcase", "cy", { project: P2, draft: "DRAFT-1", tieAttested: true });
  assert.deepEqual([bare.ok, bare.reason], [false, "PUBLISH_NO_FINDING"]);
  /* with everything else sent, the draft named is refused by R9 as before */
  const full = await door(w, "publishcase", "cy", { ...AUTHORED, project: P2, draft: "DRAFT-1", targets: [Q2], roles: { [Q2]: "load_bearing" } });
  assert.deepEqual([full.ok, full.reason], [false, "PUBLISH_DRAFT_NOT_FOUND"]);
  /* a draft of the caller's own project named with another project is the same */
  w.draft("DRAFT-3", P2, { ...KEPT, targets: [Q2], roles: { [Q2]: "load_bearing" } });
  const other = await door(w, "publishcase", "alice", { project: P, draft: "DRAFT-3", tieAttested: true });
  assert.deepEqual([other.ok, other.reason], [false, "PUBLISH_NO_FINDING"]);
  /* and none was written by any of it */
  assert.equal(w.count("case_documents"), 0);
});

test("R78: publishtensions {draft, project} reads the draft's targets; without the draft it reads none", async () => {
  const { w, P } = setup();
  w.draft("DRAFT-1", P, KEPT);
  const r = await door(w, "publishtensions", "alice", { project: P, draft: "DRAFT-1" });
  assert.deepEqual([r.ok, r.findings.map((f) => f.target)], [true, [Q]]);
  const bare = await door(w, "publishtensions", "alice", { project: P });
  assert.deepEqual([bare.ok, bare.findings], [true, []]);
  /* control: a draft the caller cannot read is not merged */
  const denied = await door(w, "publishtensions", "cy", { project: w.project("Third", "cy"), draft: "DRAFT-1" });
  assert.deepEqual([denied.ok, denied.findings], [true, []]);
});

test("R78: DRAFT_FIELDS is the authored and act fields without the stamps, the project, the draft and the signer's confirmation", () => {
  const dropped = ["viewer", "author", "project", "draft", "tieAttested"];
  assert.deepEqual([...DRAFT_FIELDS], [...new Set([...AUTHORED_FIELDS, ...ACT_FIELDS])].filter((f) => !dropped.includes(f)));
  for (const f of dropped) assert.equal(DRAFT_FIELDS.includes(f), false, f);
  for (const f of ["statement", "scope", "targets", "roles", "tensionsDisclosed", "selfAttested"])
    assert.equal(DRAFT_FIELDS.includes(f), true, f);
  assert.equal(Object.isFrozen(DRAFT_FIELDS), true);
});

/* a case resting on a Grade B document that is not co-attested: its self-attestation is the owner's to list with a reason */
function selfAttestedSetup() {
  const w = world();
  for (const m of ["alice", "cy"]) w.member(m);
  const sha = w.graded(DOC2);
  w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q2]);
  return { w, P, sha };
}
const act = (P, over = {}) => ({ ...AUTHORED, project: P, targets: [Q2], roles: { [Q2]: "load_bearing" }, ...over });

test("R79: a pre-flight and a publish over the same draft with the same selfAttested list answer the same refusals; an entry without a reason is refused in both, naming the capture", async () => {
  const { w, P, sha } = selfAttestedSetup();
  w.draft("DRAFT-1", P, { ...KEPT, targets: [Q2], roles: { [Q2]: "load_bearing" }, selfAttested: [{ capture: sha, reason: "" }] });
  for (const via of [{ draft: "DRAFT-1" }, { draft: "DRAFT-1", selfAttested: [{ capture: sha }] }]) {
    const body = { project: P, tieAttested: true, ...via };
    const pre = await door(w, "publishpreflight", "alice", body);
    const pub = await door(w, "publishcase", "alice", body);
    assert.equal(pub.ok, false);
    assert.equal(pub.reason, "SELF_ATTESTED_NO_REASON");
    assert.deepEqual(pub.no_reason, [{ capture: sha, ord: 0 }], "the capture is named");
    assert.deepEqual(pre.first, pub, "the pre-flight reports what the publication refuses");
    assert.equal(pre.ready, false);
  }
  /* control: with a reason both pass */
  const body = { project: P, tieAttested: true, selfAttested: [{ capture: sha, reason: "the site refuses the archive's crawler" }],
    draft: "DRAFT-1" };
  const pre = await door(w, "publishpreflight", "alice", body);
  assert.equal(pre.first, null, JSON.stringify(pre.first));
  assert.equal(reasonsOf(pre).includes("SELF_ATTESTED_NO_REASON"), false);
  const pub = await door(w, "publishcase", "alice", body);
  assert.equal(pub.ok, true, JSON.stringify(pub).slice(0, 300));
});

test("R79: a tensionsDisclosed entry that names no standing conflict is refused alike by the pre-flight and the publication; a list that is not a list is BAD_COMPLETENESS in both", async () => {
  const { w, P, sha } = selfAttestedSetup();
  const ack = [{ capture: sha, reason: "the site refuses the archive's crawler" }];
  for (const [list, code] of [[[{ candidate: "CON-2026-0000-zz", words: "ours" }], "DISCLOSURE_NOT_STANDING"],
                              ["not a list", "BAD_COMPLETENESS"]]) {
    const body = act(P, { tensionsDisclosed: list, selfAttested: ack });
    const pre = await door(w, "publishpreflight", "alice", body);
    const pub = await door(w, "publishcase", "alice", body);
    assert.equal(pub.reason, code, JSON.stringify(pub).slice(0, 300));
    assert.deepEqual(pre.first, pub);
  }
  /* control: no list, and an empty one, are both disclosures of nothing */
  for (const list of [undefined, []]) {
    const body = act(P, { tensionsDisclosed: list, selfAttested: ack });
    assert.equal((await door(w, "publishpreflight", "alice", body)).first, null);
    assert.equal((await door(w, "publishcase", "alice", body)).ok, true);
  }
});

test("R80: a case naming no finding is PUBLISH_NO_FINDING, in the publication and as the pre-flight's first, with its own word and nothing written", async () => {
  const { w, P } = setup();
  const before = w.snapshot();
  for (const body of [{ ...AUTHORED, project: P }, { ...AUTHORED, project: P, targets: [], target: null }]) {
    const pub = await door(w, "publishcase", "alice", body);
    assert.deepEqual([pub.ok, pub.reason, pub.code], [false, "PUBLISH_NO_FINDING", "PUBLISH_NO_FINDING"]);
    assert.notEqual(pub.reason, "NO_TARGET");
    assert.equal(hasWord(`refusal.${pub.code}`), true, "the refusal has its own word row (K874)");
    const pre = await door(w, "publishpreflight", "alice", body);
    assert.deepEqual([pre.first.reason, pre.first.code], ["PUBLISH_NO_FINDING", "PUBLISH_NO_FINDING"]);
    assert.equal(pre.ready, false);
  }
  assert.deepEqual(w.snapshot(), before, "nothing is written");
  /* controls: the action request's sentence is a different row, and a case naming a finding is not refused for one */
  assert.notEqual(word("refusal.NO_TARGET"), word("refusal.PUBLISH_NO_FINDING"));
  const named = await door(w, "publishcase", "alice", act(P, { targets: [Q], roles: { [Q]: "load_bearing" } }));
  assert.equal(named.ok, true, JSON.stringify(named).slice(0, 300));
});
