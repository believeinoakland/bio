/* case-authoring (T36-28; N717; K1723, K1739, K2002, K2004, K2129): the standards a case measures against, judged before it
   is prepared. R60: each member's `subject_entity` on its `case_roles:` row, as its pinned bytes state it. R61: the act asks
   `case-checker.checkStandardsUse` (its R21) over the text it would store, the criteria `publication.criteriaFor` (its R75)
   answers with each row's captures, and the document's `materials:` and `passages:` rows, and refuses
   `STANDARDS_USE_REFUSED` (C-136.2) on `{ok: false}`, writing nothing. `standards` is a stand-in answering exactly the
   shapes of `standards.standardRead` (its R5) and `standards.bindsAt` (its R43), handed to inquiry (a leg rests on a held
   standard) and to publication (its criteria); everything else is the fixture's real module. Driven at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V } from "./fixture.mjs";
import { PUBLISH_ACT_CHECKS } from "../../../src/case-authoring/index.mjs";
import { materialsOf, passagesOf, memberSubjectOf } from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const DOC = "INFO-2026-0001-a", SDOC = "INFO-2026-0002-std";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const FREE = "STD-2026-0001-policy", PAY = "STD-2026-0002-standard";
const CID_F = sha("passage of the policy"), CID_P = sha("passage of the standard");
const VIOLATED = "It does not cover whether the turnout rule was violated after 2024.";

/* `standards`, as held: FREE a free policy, PAY a paywalled standard whose text is CID_P (a passage of SDOC's capture);
   `binding` maps `standard|body` to bindsAt's state. `table` and `binding` are the test's to change. */
function standardsOf() {
  const table = {
    [FREE]: { access: "free", texts: [CID_F], requires: [CID_F] },
    [PAY]: { access: "paywalled", texts: [CID_P], requires: [CID_P] },
  };
  const binding = {};
  return {
    table, binding,
    standardRead({ id }) {
      const s = table[id];
      if (!s) return { ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", standard: id };
      return { ok: true, id, cite: `${id} §1`, kind: "policy", issuer: "ENT-2026-0099", designation: id, edition: "2024",
               access: s.access, owner: { issuer: "ENT-2026-0099", label: "Issuer" }, requires: s.requires,
               texts: s.texts.map((t) => ({ content_id: t, standing: null, newer: null })),
               requires_quoted: s.requires.map((t) => ({ content_id: t, text: null })), says: {} };
    },
    bindsAt({ standard, body, date }) {
      return { ok: true, standard, body, date, state: binding[`${standard}|${body}`] || "benchmark", why: "", rests_on: [] };
    },
  };
}

function setup() {
  const standards = standardsOf();
  const w = world({ standards });
  for (const m of ["alice", "bo"]) w.member(m);
  const ent = (label) => {
    const r = w.entities.createEntity({ kind: "institution", label, sector: "government", note: `${label}, as named.`,
                                        declaredBy: V("alice") });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    return r.entity_id ?? r.entity.entity_id;
  };
  w.doc(DOC);
  const capP = w.doc(SDOC);
  w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
                 VALUES (?, ?, ?, 'doc-para', ?, 'paragraph 1', 'plane', '2026-01-01', 0)`,
                CID_P, capP, SDOC, canonicalJson({ kind: "doc-para", para: 1 }));
  return { w, standards, capP, A: ent("Fire Department"), B: ent("Water Board") };
}
const subject = (id) => [`subject_entity: ${id}`];
function refusedStandards(r) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  const row = PUBLISH_ACT_CHECKS.STANDARDS_USE_REFUSED;
  assert.deepEqual([r.reason, r.code, r.check, r.translation], ["STANDARDS_USE_REFUSED", "STANDARDS_USE_REFUSED", row.check,
                                                                 row.translation]);
}

/* ---------------------------------------------------------------- R60 */

test("R60: each case_roles row states the subject_entity its member's pinned bytes state, or null when they state none; never the inquiry's current subject, another member's, or a value the act's caller sends (refused by name, R65)", () => {
  const { w, A, B } = setup();
  w.finding(Q, [{ target: DOC }], { lines: subject(A) });
  w.finding(Q2, [{ target: DOC }]);
  /* the inquiry's current subject, as inquiry's column holds it, says otherwise: the pinned bytes govern */
  w.st.sql.exec(`UPDATE bundles SET inquiry_subject_entity=? WHERE bundle_id IN (?, ?)`, B, Q, Q2);
  const P = w.project("Team", "alice", [Q, Q2]);
  /* R65 (T41): a value the caller sends is refused by name, never read; the same act without it publishes */
  const sent = w.publish(P, "alice", [Q, Q2], { subject_entity: B, subjects: { [Q]: B, [Q2]: B }, subjectEntity: B });
  assert.deepEqual([sent.ok, sent.reason, sent.fields], [false, "CASE_FIELD_NOT_ALLOWED", ["subjectEntity", "subject_entity", "subjects"]]);
  const r = w.publish(P, "alice", [Q, Q2]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const text = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;
  assert.deepEqual(w.fm(text).case_roles.map((x) => [x.target, x.subject_entity]), [[Q, A], [Q2, null]]);
  /* read back as case-grammar R22 reads it, the one reader case-checker R21 shares */
  assert.deepEqual([Q, Q2].map((m) => memberSubjectOf(w.fm(text), m)), [A, null]);
  /* the lines, one spelling: after each row's edition, the id bare or the literal null */
  assert.match(text, new RegExp(`  - target: ${Q}\\n    role: load_bearing\\n    version_sha: ${w.head(Q)}\\n    edition: 1\\n`
    + `    subject_entity: ${A}\\n`));
  assert.match(text, new RegExp(`  - target: ${Q2}\\n[^-]*    subject_entity: null\\n`));
});

/* ---------------------------------------------------------------- R61 */

test("R61: a finding resting only on a benchmark, beside another body's binding row of the same standard, called \"violated\" by the case is refused STANDARDS_USE_REFUSED (C-136.2) naming the finding, the standard and the word; nothing is written; the pre-flight answers it first (CASE-CHECKER #6 J2)", () => {
  const { w, standards, A, B } = setup();
  standards.binding[`${FREE}|${B}`] = "binds";
  w.finding(Q, [{ target: DOC }, { target: FREE }], { lines: subject(A) });
  w.finding(Q2, [{ target: DOC }, { target: FREE }], { lines: subject(B) });
  const P = w.project("Team", "alice", [Q, Q2]);
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q, Q2], { statement: VIOLATED });
  refusedStandards(r);
  assert.deepEqual(r.refusals, [{ code: "BENCHMARK_CALLED_NONCONFORMING", finding: Q, standard: FREE, word: "violated" }]);
  assert.deepEqual(r.unjudged, []);
  assert.match(r.detail, new RegExp(`${Q} rests only on benchmarks of ${FREE}.*"violated"`));
  assert.match(r.detail, /Nothing was prepared\.$/);
  assert.deepEqual(w.snapshot(), before, "no id drawn, nothing written");
  /* DEC-8: the pre-flight's first is exactly the act's refusal, and it writes nothing either */
  const pre = w.ca.publishPreflight({ ...publishArgs(P, [Q, Q2]), statement: VIOLATED });
  assert.deepEqual(pre.first, r);
  assert.equal(pre.ready, false);
  assert.equal(pre.blockers.some((b) => b.reason === "STANDARDS_USE_REFUSED"), false, "named once, as first");
  assert.deepEqual(w.snapshot(), before);
  /* negative controls: the same words with no benchmark-only finding, and the same finding in other words */
  assert.equal(w.publish(P, "alice", [Q2], { statement: VIOLATED }).ok, true, "binding row: may say violated");
});

test("R61 (R60's defect): with the member's subject absent from its bytes, the case-checker reads every body's row of the standard, one binds, and the same words publish", () => {
  const { w, standards, B } = setup();
  standards.binding[`${FREE}|${B}`] = "binds";
  w.finding(Q, [{ target: DOC }, { target: FREE }]);
  w.finding(Q2, [{ target: DOC }, { target: FREE }], { lines: subject(B) });
  const P = w.project("Team", "alice", [Q, Q2]);
  const r = w.publish(P, "alice", [Q, Q2], { statement: VIOLATED });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.equal("unjudged" in r, false, "every row judged");
});

test("R61: a benchmark-only finding in plain words publishes, and every judged case answers no unjudged key", () => {
  const { w, A } = setup();
  w.finding(Q, [{ target: DOC }, { target: FREE }], { lines: subject(A) });
  const P = w.project("Team", "alice", [Q]);
  const r = w.publish(P, "alice", [Q], { statement: "It does not cover turnout slower than the benchmark after 2024." });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.equal("unjudged" in r, false);
});

test("R61: a standard not free to read whose capture the case would carry whole is COPYRIGHTED_TEXT_CARRIED, a passage of it no finding relies on COPYRIGHTED_PASSAGE_UNRELIED, every departure named (the row's captures read through content's read contract); relying on the passage leaves only the first; the same standard free to read publishes", () => {
  const { w, standards, capP, A } = setup();
  w.finding(Q, [{ target: SDOC }, { target: PAY }], { lines: subject(A) });
  const P = w.project("Team", "alice", [Q]);
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q]);
  refusedStandards(r);
  assert.deepEqual(r.refusals, [{ code: "COPYRIGHTED_TEXT_CARRIED", standard: PAY, sha: capP },
                                { code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: PAY, content: CID_P }]);
  assert.deepEqual(w.snapshot(), before);
  assert.deepEqual(w.ca.publishPreflight(publishArgs(P, [Q])).first, r);
  /* a finding relies on the passage (the document's passages: row): only the whole text carried is left */
  w.finding(Q, [{ target: SDOC, content_id: CID_P }, { target: PAY }], { lines: subject(A) });
  const r2 = w.publish(P, "alice", [Q]);
  refusedStandards(r2);
  assert.deepEqual(r2.refusals, [{ code: "COPYRIGHTED_TEXT_CARRIED", standard: PAY, sha: capP }]);
  /* negative control: free to read, the whole text travels */
  standards.table[PAY].access = "free";
  const r3 = w.publish(P, "alice", [Q]);
  assert.equal(r3.ok, true, JSON.stringify(r3).slice(0, 400));
  const fm = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r3.caseId, r3.edition).text);
  assert.ok(materialsOf(fm).materials.some((m) => m.sha === capP && m.included === true), "carried whole, as judged");
  assert.deepEqual(passagesOf(fm)[Q].map((p) => [p.content_id, p.capture_sha]), [[CID_P, capP]]);
});

test("R61: a standard the record no longer answers is a row stated not held: never refused, answered in unjudged beside an act that succeeds", () => {
  const { w, standards, A } = setup();
  w.finding(Q, [{ target: DOC }, { target: PAY }], { lines: subject(A) });
  delete standards.table[PAY];
  const P = w.project("Team", "alice", [Q]);
  const r = w.publish(P, "alice", [Q], { statement: VIOLATED });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.unjudged, [{ standard: PAY, portion: null, body: null }]);
  assert.ok(w.row(`SELECT 1 x FROM case_documents WHERE case_id=?`, r.caseId), "stored");
});

test("R61, R15: a new member edition refused STANDARDS_USE_REFUSED tells no reevaluation listener; once nothing refuses, the act raises it", () => {
  const { w, standards, A } = setup();
  w.finding(Q, [{ target: DOC }], { lines: subject(A) });
  const P = w.project("Team", "alice", [Q]);
  const a1 = w.publish(P, "alice", [Q]);
  assert.equal(a1.ok, true, JSON.stringify(a1).slice(0, 300));
  w.ratify(a1);
  assert.equal(w.publication.commitEdition({ bundleId: Q, edition: 1, bundleSha: w.head(Q), title: "q", attestorKey: "k",
    gateVersion: "1.37.0", sigArmored: "s-q-1", shas: [], edges: [], at: "2026-09-28T02:00:00Z" }).ok, true);
  const told = [];
  assert.equal(w.reevaluation.onBasisChanged("monitoring", (e) => { told.push(e); }).ok, true);
  w.finding(Q, [{ target: DOC }, { target: FREE }], { lines: subject(A) });
  const second = { caseId: a1.caseId, statement: VIOLATED,
    subjectJustification: "A public record, so the question is whether it was followed.",
    biasAcknowledgement: "We read the minutes as the account of the meeting, as of this edition.",
    excluded: [{ description: "the amendments", reason: "requested and not yet held" }] };
  refusedStandards(w.publish(P, "alice", [Q], second));
  assert.deepEqual(told, [], "an edition never made is heard of by nobody");
  standards.binding[`${FREE}|${A}`] = "binds";
  const a2 = w.publish(P, "alice", [Q], second);
  assert.equal(a2.ok, true, JSON.stringify(a2).slice(0, 300));
  assert.deepEqual([a2.findings[0].reevaluation.source, a2.findings[0].reevaluation.edition], ["edition", 2]);
  assert.deepEqual(told.map((e) => [e.subject, e.edition]), [[Q, 2]]);
});

function publishArgs(P, targets) {
  return { scope: "Whether the contract was awarded as the minutes say.",
           statement: "It does not cover the award's later amendments.", subjectPosition: "not_sought",
           subjectJustification: "The award is a public record and the question is whether it was followed.",
           biasAcknowledgement: "We read the minutes as the authoritative account of the meeting.", excluded: [],
           tieAttested: true, project: P, targets, roles: Object.fromEntries(targets.map((t) => [t, "load_bearing"])),
           viewer: V("alice"), author: "alice" };
}
