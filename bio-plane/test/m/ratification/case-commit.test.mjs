/* ratification R3: the case commit (`ratifyCaseDocument`, the store half of `op=caseratify`), in its order of refusals,
   and what it commits through publication R22 — from the signed bytes only (R13), signer and deliverer apart (R12),
   no case-level strength (R11), and a retry that never re-signs (R10). Also R2's gate on the promotion instance
   (`casegate`, K233), which runs this module's registered catalogue over the document at the signed sha. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseMd, V, NOW } from "./fixture.mjs";
import { caseConclusionRowLines, checkCaseDocument, CASE_CONCLUSION_CHECKS } from "../../../src/ratification/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const Q1 = "INQ-2026-0001-first", Q2 = "INQ-2026-0002-second";
const CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "the minutes say otherwise",
              falsifier_override: null, by: "member:alice", at: "2026-09-27T10:00:00Z" };
const SIG = "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n";

/* alice owns P and signs; bo joined P and owns nothing; eve is in no project. */
function setup({ extra = [], conclusions = true } = {}) {
  const w = world();
  for (const m of ["alice", "bo", "eve"]) w.member(m);
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1); w.inquiry(Q2);
  for (const q of [Q1, Q2]) w.bv.conc.set(w.key(P, q), OWN);
  const members = [{ id: Q1, pin: w.sha(Q1), role: "load_bearing" }, { id: Q2, pin: w.sha(Q2), role: "supporting" }];
  const rows = conclusions ? members.map((m) => [m.id, w.r.caseConclusionFor(P, m.id, V("alice"), "open")]) : [];
  const text = caseMd({ caseId: CASE, edition: 1, project: P, members, conclusions: rows, extra,
                        rowLines: caseConclusionRowLines });
  const docSha = w.caseDoc(CASE, 1, text);
  const args = { caseId: CASE, edition: 1, docSha, sigArmored: SIG, attestorKey: "KEY", attestorMember: "alice",
                 gateVersion: "plane-gate/1.0", deliveredBy: V("alice") };
  const commit = (o = {}) => w.r.ratifyCaseDocument({ ...args, ...o });
  return { w, P, members, docSha, args, commit, text };
}
const commits = (w) => w.calls.filter((c) => c[0] === "commitCaseEdition").length;

test("R3: refusals in order — MALFORMED, CASE_UNSIGNED, NO_CASE_DOCUMENT, CASE_RATIFY_STALE — each committing nothing", async () => {
  const { w, commit } = setup();
  for (const o of [{ caseId: "" }, { caseId: null }, { edition: 0 }, { edition: 1.5 }, { edition: "x" }, { docSha: null }])
    assert.equal((await commit(o)).reason, "MALFORMED", JSON.stringify(o));
  for (const o of [{ sigArmored: null }, { attestorKey: "" }, { gateVersion: null }]) {
    const r = await commit(o);
    assert.deepEqual([r.reason, r.caseId, r.edition], ["CASE_UNSIGNED", CASE, 1], JSON.stringify(o));
    assert.match(r.detail, /BYTES A MEMBER SIGNED/);
  }
  assert.equal((await commit({ caseId: "CASE-2026-0404", edition: 1 })).reason, "NO_CASE_DOCUMENT");
  assert.equal((await commit({ edition: 2 })).reason, "NO_CASE_DOCUMENT");
  const stale = await commit({ docSha: "f".repeat(64) });
  assert.deepEqual([stale.reason, stale.got], ["CASE_RATIFY_STALE", "f".repeat(64)]);
  assert.equal(commits(w), 0);
  assert.equal(w.row(`SELECT ratified_at FROM case_documents WHERE case_id=?`, CASE).ratified_at, null);
});

test("R3: the authority is membership's caseAuthority — an owner signs; the founder or a joined member delivers", async () => {
  const { w, commit } = setup();
  const notOwner = await commit({ attestorMember: "bo", deliveredBy: V("bo") });
  assert.deepEqual([notOwner.reason, notOwner.caseId, notOwner.edition], ["CASE_SIGNER_NOT_AN_OWNER", CASE, 1]);
  assert.equal((await commit({ attestorMember: null })).reason, "CASE_SIGNER_NOT_AN_OWNER");
  assert.equal((await commit({ deliveredBy: V("eve") })).reason, "PROJECT_ACT_NOT_A_PARTICIPANT", "a member with no role delivers nothing");
  assert.equal(commits(w), 0);
  assert.equal((await commit({ deliveredBy: V("bo") })).ok, true, "a joined member delivers an owner's signature");
  const { commit: c2 } = setup();
  assert.equal((await c2({ deliveredBy: "founder" })).ok, true, "the founder delivers");
  const { commit: c3 } = setup();
  assert.equal((await c3({ deliveredBy: null })).ok, true, "an internal caller is not asked who delivered");
});

test("R3: a document naming no project has no owner to sign it", async () => {
  const w = world(); w.member("alice"); w.inquiry(Q1);
  const text = caseMd({ caseId: CASE, edition: 1, project: "null", members: [{ id: Q1, pin: w.sha(Q1) }],
                        rowLines: caseConclusionRowLines });
  const docSha = w.caseDoc(CASE, 1, text);
  const r = await w.r.ratifyCaseDocument({ caseId: CASE, edition: 1, docSha, sigArmored: SIG, attestorKey: "K",
                                     attestorMember: "alice", gateVersion: "g", deliveredBy: V("alice") });
  assert.deepEqual([r.reason, r.project], ["CASE_SIGNER_NOT_AN_OWNER", null]);
});

test("R3, R10: a retry with the same signature answers existed and writes nothing; another signature is CASE_EDITION_ALREADY_RATIFIED; the authority is asked first", async () => {
  const { w, commit } = setup();
  assert.equal((await commit()).ok, true);
  assert.equal(commits(w), 1);
  const before = w.row(`SELECT * FROM case_documents WHERE case_id=?`, CASE);
  assert.deepEqual((await commit()), { ok: true, existed: true, caseId: CASE, edition: 1 });
  const other = await commit({ sigArmored: SIG.replace("AAAA", "BBBB") });
  assert.equal(other.reason, "CASE_EDITION_ALREADY_RATIFIED");
  assert.equal((await commit({ attestorMember: "bo" })).reason, "CASE_SIGNER_NOT_AN_OWNER", "never an authority answer to somebody with none");
  assert.equal(commits(w), 1, "the retry committed nothing and re-signed nothing");
  assert.deepEqual(w.row(`SELECT * FROM case_documents WHERE case_id=?`, CASE), before);
});

test("R3: CASE_CONCLUSION_MOVED (C-65.1) when a member's project conclusion is not the one the document records; nothing is committed", async () => {
  const { w, P, commit } = setup();
  w.bv.conc.set(w.key(P, Q2), { ...OWN, version: "second", at: "2026-09-28T00:00:00Z" });
  const moved = await commit();
  assert.deepEqual([moved.reason, moved.code, moved.check, moved.translation, moved.project],
    ["CASE_CONCLUSION_MOVED", "CASE_CONCLUSION_MOVED", "C-65.1", CASE_CONCLUSION_CHECKS.CASE_CONCLUSION_MOVED.translation, P]);
  assert.deepEqual(moved.moved.map((m) => [m.target, m.now.state, m.now.version]), [[Q2, "concluded", "second"]]);
  assert.equal(moved.moved[0].recorded.version, "first");
  w.bv.conc.delete(w.key(P, Q2));
  w.bv.rec.set(w.key(P, Q2), { history: [{}, {}], stance: { act: "withdrawn", version: "first", at: "t" } });
  const withdrew = await commit();
  assert.deepEqual(withdrew.moved.map((m) => [m.target, m.now.state, m.now.why]),
    [[Q2, "not_concluded", "project_withdrew_its_conclusion"]]);
  assert.match(withdrew.detail, /stands on no conclusion \(project_withdrew_its_conclusion\)/);
  assert.equal(commits(w), 0);
  const { w: w2, commit: c2 } = setup({ conclusions: false });
  const none = await c2();
  assert.equal(none.reason, "CASE_CONCLUSION_MOVED", "a document recording no project conclusion for a project that concluded");
  assert.equal(commits(w2), 0);
});

test("R3: the signer is the viewer the conclusion is read for", async () => {
  const { w, P, commit } = setup();
  const seen = [];
  const conc = w.bv.conc;
  w.r.basisVersions.conclusionOf = (p, q, viewer) => { seen.push(viewer); return conc.get(w.key(p, q)) ?? null; };
  assert.equal((await commit({ deliveredBy: V("bo") })).ok, true);
  assert.deepEqual([...new Set(seen)], [V("alice")]);
  assert.ok(P);
});

test("R3: CASE_PRODUCTION_DIVERGED when the case is another project's production", async () => {
  const { w, commit } = setup();
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, 'PROJ-2026-0009-else', ?)`, CASE, NOW);
  const r = await commit();
  assert.deepEqual([r.reason, r.declared], ["CASE_PRODUCTION_DIVERGED", "PROJ-2026-0009-else"]);
  assert.equal(commits(w), 0);
});

test("R3, R11, R12, R13: the commit hands publication the case from the signed bytes — owner, scope, completeness, bar, roster with roles and pins — signer and deliverer apart, and no case-level strength", async () => {
  const { w, P, commit, docSha } = setup({ extra: [
    "required_strength:", "  declared: true", "  capture: B", "  connection: null",
    "completeness:", `  statement: "the 2019 permits are not covered"`, "  author: alice", `  at: "2026-09-27T00:00:00Z"`,
    "  subject_position: not_sought", `  subject_justification: "closed until October"`, "  statement_by: bo",
    "completeness_excluded: []"] });
  const r = await commit({ deliveredBy: V("bo") });
  assert.equal(r.ok, true);
  const [a] = w.pub.committed;
  assert.deepEqual([a.case, a.edition, a.project, a.scope, a.biasAcknowledgement],
    [CASE, 1, P, "whether the permits were issued as the minutes say", "we expected the permits were late"]);
  assert.deepEqual(a.roster, [{ bundle_id: Q1, role: "load_bearing", version_sha: w.sha(Q1) },
                              { bundle_id: Q2, role: "supporting", version_sha: w.sha(Q2) }]);
  assert.deepEqual(a.bar, { declared: true, capture: "B", connection: null });
  const c = a.completeness;
  assert.deepEqual([c.statement, c.author, c.statement_by, c.subject_position, c.acknowledgements, c.acknowledgements_truncated],
    ["the 2019 permits are not covered", "alice", "bo", "not_sought", null, null], "a list the bytes are silent about is null");
  assert.match(c.statement_by_stated, /bo wrote this case's exclusion statement; alice prepared and published/);
  assert.deepEqual([a.sigArmored, a.attestorKey, a.attestorMember, a.gateVersion, a.deliveredBy],
    [SIG, "KEY", "alice", "plane-gate/1.0", V("bo")], "the signer is the signature's and the deliverer the stamp's");
  assert.equal(Object.keys(a).some((k) => /strength/i.test(k)), false, "no case-level strength is composed");
  /* what publication committed from those arguments */
  assert.deepEqual(w.row(`SELECT project_id FROM cases WHERE case_id=?`, CASE), { project_id: P });
  const pc = w.row(`SELECT scope, completeness, bar FROM published_cases WHERE case_id=? AND edition=1`, CASE);
  assert.deepEqual([pc.scope, JSON.parse(pc.completeness).statement_by, JSON.parse(pc.bar).capture],
    ["whether the permits were issued as the minutes say", "bo", "B"]);
  assert.deepEqual(w.st.sql.exec(`SELECT bundle_id, role, version_sha FROM published_case_members WHERE case_id=? ORDER BY ord`, CASE),
    [{ bundle_id: Q1, role: "load_bearing", version_sha: w.sha(Q1) }, { bundle_id: Q2, role: "supporting", version_sha: w.sha(Q2) }]);
  assert.deepEqual(w.row(`SELECT doc_sha, sig_armored, attestor_member, delivered_by FROM case_documents WHERE case_id=?`, CASE),
    { doc_sha: docSha, sig_armored: SIG, attestor_member: "alice", delivered_by: V("bo") });
  assert.deepEqual(w.calls.filter((x) => x[0] === "dischargeCaseFlags").map((x) => x.slice(1, 4)), [[CASE, 1, "alice"]]);
  assert.deepEqual([r.caseId, r.edition, r.project, r.roster, r.awaiting], [CASE, 1, P, [Q1, Q2], [Q1, Q2]]);
  assert.deepEqual(r.statement, { author: "alice", by: "bo", stated: c.statement_by_stated });
  assert.equal(r.completedCase, undefined, "no member is published at its pin yet");
});

test("R12, R13: a deliverer not stamped is committed null, never the signer; a document silent about completeness commits null; one silent about its writer says so", async () => {
  const { w, commit } = setup();
  assert.equal((await commit({ deliveredBy: null })).ok, true);
  assert.deepEqual([w.pub.committed[0].deliveredBy, w.pub.committed[0].completeness, w.pub.committed[0].bar], [null, null, null]);
  assert.deepEqual(w.row(`SELECT completeness, bar FROM published_cases WHERE case_id=?`, CASE), { completeness: null, bar: null });
  assert.equal(w.row(`SELECT delivered_by FROM case_documents WHERE case_id=?`, CASE).delivered_by, null);
  const { w: w2, commit: c2 } = setup({ extra: ["completeness:", `  statement: "s"`, "  author: alice",
    "completeness_acknowledgements:", "  - kind: participant", "    by: carol", `    at: "2026-09-27T00:00:00Z"`] });
  assert.equal((await c2()).ok, true);
  const c = w2.pub.committed[0].completeness;
  assert.equal(c.statement_by, null);
  assert.match(c.statement_by_stated, /says nothing about who wrote its exclusion statement/);
  assert.deepEqual(c.acknowledgements, [{ kind: "participant", by: "carol", recipient: null, at: "2026-09-27T00:00:00Z" }]);
  assert.equal(c.acknowledgements_truncated, false);
  const { w: w3, commit: c3 } = setup({ extra: ["completeness:", `  statement: "s"`, "  author: alice", "  statement_by: null"] });
  assert.equal((await c3()).ok, true);
  assert.match(w3.pub.committed[0].completeness.statement_by_stated, /^UNDETERMINED/);
});

test("R3: a case complete at its document's ratification hands the control plane its state for the container", async () => {
  const { w, commit } = setup();
  const state = { complete: true, manifest_sha: null, edition: 1, findings: [] };
  w.publication.commitCaseEdition = () => ({ ok: true, existed: false, awaiting: [], state });
  assert.deepEqual((await commit()).completedCase, state);
  const { w: w2, commit: c2 } = setup();
  w2.publication.commitCaseEdition = () => ({ ok: true, existed: false, awaiting: [], state: { ...state, manifest_sha: "m".repeat(64) } });
  assert.equal((await c2()).completedCase, undefined, "an assembled container is not assembled again");
});

test("R3: publication's refusal, or a throw, inside the transaction rolls back what was written in it", async () => {
  const { w, commit } = setup();
  w.publication.commitCaseEdition = (a) => {
    w.st.sql.exec(`UPDATE case_documents SET sig_armored=? WHERE case_id=?`, a.sigArmored, a.case);
    return { ok: false, reason: "CASE_EDITION_ALREADY_RATIFIED" };
  };
  assert.equal((await commit()).reason, "CASE_EDITION_ALREADY_RATIFIED");
  assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, CASE).sig_armored, null);
  assert.equal(w.calls.filter((c) => c[0] === "dischargeCaseFlags").length, 0);
  const { w: w2, commit: c2 } = setup();
  w2.publication.commitCaseEdition = (a) => {
    w2.st.sql.exec(`UPDATE case_documents SET sig_armored=? WHERE case_id=?`, a.sigArmored, a.case);
    throw new Error("disk");
  };
  await assert.rejects(c2(), /disk/);
  assert.equal(w2.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, CASE).sig_armored, null);
});

/* ---- R2's gate, on the promotion instance (K233) ---- */

test("R2: casegate runs this module's catalogue over the document at the signed sha, with the prior edition's statement and acknowledgement", async () => {
  const { w, docSha, text } = setup({ extra: ["completeness:", `  statement: "old"`, "  author: alice"] });
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                  memberBasis: null,
                                  priorCase: { edition: 0, completeness: JSON.stringify({ statement: "old" }),
                                               bias_acknowledgement: "we expected the permits were late" } });
  const g = w.op("casegate", { viewer: V("alice") }, { caseId: CASE, edition: 1, docSha });
  const parsed = parseFrontmatter(text);
  const want = checkCaseDocument(parsed.data, { caseId: CASE, edition: 1, body: parsed.body, memberBasis: null,
    priorCase: { edition: 0, statement: "old", bias_acknowledgement: "we expected the permits were late" } });
  assert.equal(g.ok, false);
  assert.deepEqual(g.findings.map((x) => x.check), want.filter((x) => x.severity === "error").map((x) => x.check));
  assert.equal(g.findings.filter((x) => x.check === "C-21.1").length, 2, "the prior edition's statement and acknowledgement are compared");
  assert.equal(typeof g.gateVersion, "string");
  const stale = w.op("casegate", {}, { caseId: CASE, edition: 1, docSha: "e".repeat(64) });
  assert.deepEqual([stale.reason, stale.expected], ["CASE_RATIFY_STALE", docSha]);
  assert.equal(w.op("casegate", {}, { caseId: CASE, edition: 2, docSha }).reason, "NO_CASE_DOCUMENT");
  assert.deepEqual(w.calls.filter((c) => c[0] === "caseDocumentFacts").map((c) => c.slice(1, 4)),
    [[CASE, 1, V("alice")], [CASE, 1, null], [CASE, 2, null]], "the facts are read for the stamped viewer");
});

/* ---- R36 (DEC-102 item 2) ---- */

const attributions = (rows) => ["observation_attributions:",
  ...rows.flatMap(([observation, level]) => [`  - observation: ${observation}`, `    level: ${level}`, `    shown: "x"`])];

test("R36: a level that moved between two ratified editions is told to reevaluation once per observation, with both levels, the case, the edition and the commit's instant; a first edition, an observation the previous edition did not reach, an unchanged level, a retry and a refused commit tell nothing", async () => {
  const OA = "INFO-2026-0091-observation", OB = "INFO-2026-0092-observation", OC = "INFO-2026-0093-observation";
  const s = setup({ extra: attributions([[OA, "group"], [OB, "cover"]]) });
  const first = await s.commit();
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300));
  assert.deepEqual(s.w.levelMoves, [], "a first edition tells nothing");
  assert.equal((await s.commit()).existed, true);
  assert.deepEqual(s.w.levelMoves, [], "a retry answering existed tells nothing");
  /* edition 2: OA moved group -> name, OB unchanged, OC newly reached */
  const rows = s.members.map((m) => [m.id, s.w.r.caseConclusionFor(s.P, m.id, V("alice"), "open")]);
  const text2 = caseMd({ caseId: CASE, edition: 2, project: s.P, members: s.members, conclusions: rows,
                         extra: attributions([[OA, "name"], [OB, "cover"], [OC, "project"]]), rowLines: caseConclusionRowLines });
  const sha2 = s.w.caseDoc(CASE, 2, text2);
  /* a refused commit tells nothing: the conclusion moved */
  s.w.bv.conc.set(s.w.key(s.P, Q1), { ...OWN, version: "second" });
  assert.equal((await s.commit({ edition: 2, docSha: sha2 })).reason, "CASE_CONCLUSION_MOVED");
  assert.deepEqual(s.w.levelMoves, []);
  s.w.bv.conc.set(s.w.key(s.P, Q1), OWN);
  const second = await s.commit({ edition: 2, docSha: sha2 });
  assert.equal(second.ok, true, JSON.stringify(second).slice(0, 300));
  assert.deepEqual(s.w.levelMoves, [{ observation: OA, from: "group", to: "name", case: CASE, edition: 2,
                                      at: second.ratified_at }], "exactly once, for the observation that moved");
  assert.equal((await s.commit({ edition: 2, docSha: sha2 })).existed, true);
  assert.equal(s.w.levelMoves.length, 1, "its retry tells nothing again");
});
