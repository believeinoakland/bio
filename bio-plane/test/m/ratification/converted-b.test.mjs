/* ratification's share of four old suites, converted into module tests at this module's interface (T18; K619: the old
   suites were not deleted by the job): `test/publish.test.mjs`, `test/testify.test.mjs`,
   `test/testimonyaxis.test.mjs` and `test/operator-attest.test.mjs`. Only ratification's share of each is converted
   (T17's legacy-tests rows, "ratification R…"); the other modules' shares (case-authoring's act refusals, publication's
   editions and projections, inquiry's C-21.2, strength's bar and axes, affordances, control-plane's bearer wiring) are
   theirs and are not asserted here.

   Every test drives ratification through the store half (`ratificationOf` / `w.op`), the Worker half (`caseRatifyOp`,
   `ratifyOp`, with `plane(w)`) or the exported pure functions (`checkCaseDocument`, `completenessFields`,
   `caseMemberFindings`); none reads source text. Where an old suite read "the /5 document op=publish really authored",
   that document is case-authoring's to write (a module this one may not import), so it is built here by hand in the
   same format — `bio-case-document/6` (K1321), the fixture's `cleanCase` with the old suite's authored values — rendered to
   bytes with `fmText` and parsed back with record-grammar's `parseFrontmatter`, as the old suites parsed the bytes they
   read. The signatures are real SSHSIGs (the fixture's signer), never a stand-in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signCase, signBundle, cleanCase, cleanInfoMd, fmText, CASE_BODY, V, NOW } from "./fixture.mjs";
import { caseRatifyOp, ratifyOp } from "../../../src/ratification/ops.mjs";
import { checkCaseDocument, completenessFields, caseMemberFindings, isCaseMemberBytes, SUBJECT_POSITIONS,
         caseConclusionRowLines, RATIFY_MACHINE_FENCE_CHECKS as FENCE, RATIFY_ATTRIBUTION_CHECKS as ATTRIBUTION,
         RATIFY_SCOPE_CHECKS as SCOPE } from "../../../src/ratification/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { caseDocumentStatesMemberBlocks } from "../../../src/publication/checks.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const DOC = "INFO-2026-0001-report", OBS = "INFO-2026-0007-observation";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const bytesOf = (fm) => parseFrontmatter(fmText(fm, { body: CASE_BODY })).data || {};

/* ================================================================= publish.test.mjs (ratification R8, R9; R2, R3; R5) */

/* The old suite's authored values (blocks 1, 5 and 6): edition 2's statement, justification, exclusions and bias
   acknowledgement, and edition 3's freshly authored ones. */
const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
const JUST2 = "We put the revised claims to the City Administrator again on 2026-07-05 and print the reply.";
const EX2 = [{ target: null, description: "any 2019 council minutes", reason: "still not requested; outside the period" }];
const BACK2 = "The same declared position on public adoption is in force, unchanged; edition 2 applies it to "
  + "the FY2023 comparison memo, which arrived after edition 1 closed.";
const FRESH_S = "This case covers the FY2024 transfer, the FY2023 comparison memo and the clerk's index.";
const FRESH_J = "We put the corrected claims to the City Administrator on 2026-07-07 and print the reply.";
const FRESH_B = "The declared position on public adoption still stands and is unchanged; for edition 3 it "
  + "bears on the clerk's index, which is the first source here the group did not itself request.";
const FRESH_X = [{ target: "INFO-2026-1400-left-out", description: "the FY2023 comparison memo",
                   reason: "it arrived after edition 2 and is named here rather than folded in unexamined" },
                 { target: null, description: "any 2019 council minutes", reason: "outside the period, restated for edition 3" }];

/** Edition 3 of a case as op=publish authors it (/5), freshly authored, with `over` applied to its completeness block
 *  and top-level fields; parsed back from its bytes. */
function edition3({ completeness = {}, ...over } = {}) {
  const d = cleanCase({ caseId: CASE, edition: 3, project: "PROJ-2026-0001-auditor", members: [{ id: Q1, pin: "a".repeat(64) }] });
  d.completeness = { ...d.completeness, statement: FRESH_S, subject_position: "sought_and_answered",
                     subject_justification: FRESH_J, ...completeness };
  d.completeness_excluded = FRESH_X;
  d.bias_acknowledgement = FRESH_B;
  return bytesOf({ ...d, ...over });
}
const CTX3 = { caseId: CASE, edition: 3, body: CASE_BODY };
const PRIOR2 = { edition: 2, statement: STMT2, bias_acknowledgement: BACK2 };
const c21 = (fm, ctx = { ...CTX3, priorCase: PRIOR2 }) => checkCaseDocument(fm, ctx).filter((e) => e.check === "C-21.1");

test("R8 (publish): the freshly authored /6 edition draws no finding at all, against the previous edition", () => {
  assert.deepEqual(checkCaseDocument(edition3(), { ...CTX3, priorCase: PRIOR2 }), []);
});

test("R8 (publish): C-41.6 — a case document with NO bias acknowledgement is refused by the gate, once, naming C-41.6 and the field; the same document with one draws nothing", () => {
  for (const empty of ["", " "]) {
    const found = checkCaseDocument(edition3({ bias_acknowledgement: empty }), CTX3);
    assert.equal(found.filter((e) => e.check === "C-41.6" && /bias_acknowledgement/.test(e.message)).length, 1, JSON.stringify(empty));
    assert.deepEqual(found.map((e) => e.check), ["C-41.6"], "nothing else is drawn");
  }
  assert.deepEqual(checkCaseDocument(edition3(), CTX3).filter((e) => e.check === "C-41.6"), [], "the negative control");
});

test("R8 (publish): C-21.1 per field — the STATEMENT alone reprinted from the previous edition draws exactly one C-21.1, naming the completeness statement and the edition", () => {
  const f = c21(edition3({ completeness: { statement: STMT2 } }));
  assert.equal(f.length, 1);
  assert.match(f[0].message, /completeness statement is byte-identical to edition 2's/);
  assert.doesNotMatch(f[0].message, /bias acknowledgement/i);
});

test("R8 (publish): C-21.1 per field — the BIAS ACKNOWLEDGEMENT alone reprinted draws exactly one C-21.1, and the finding names the field so the member knows which sentence to rewrite", () => {
  const f = c21(edition3({ bias_acknowledgement: BACK2 }));
  assert.equal(f.length, 1);
  assert.match(f[0].message, /bias acknowledgement/i);
  assert.match(f[0].message, /edition 2's/);
  assert.doesNotMatch(f[0].message, /completeness statement/);
});

test("R8 (publish): C-21.1 — both reprinted draw two findings, one per field; the fresh edition none; and with no prior edition C-21.1 is not asked (nothing to be fresh against)", () => {
  const both = c21(edition3({ completeness: { statement: STMT2 }, bias_acknowledgement: BACK2 }));
  assert.equal(both.length, 2);
  assert.ok(both.some((e) => /completeness statement/.test(e.message)) && both.some((e) => /bias acknowledgement/i.test(e.message)));
  assert.deepEqual(c21(edition3()), [], "the freshly authored edition draws no C-21.1");
  assert.deepEqual(c21(edition3({ completeness: { statement: STMT2 }, bias_acknowledgement: BACK2 }), CTX3), [],
    "no prior edition supplied: nothing to compare");
});

test("R9 (publish): completenessFields is the one shape C-21.1 compares, a string per asserted field — statement, justification and exclusion list each compare equal only when carried forward byte-identical; the stamps and the position are not in it", () => {
  const prior = completenessFields({ completeness: { statement: STMT2, subject_justification: JUST2 }, completeness_excluded: EX2 });
  const fields = ["statement", "subject_justification", "excluded"];
  const carried = (fm) => { const now = completenessFields(fm); return fields.filter((k) => now[k] === prior[k]); };
  const fresh = { completeness: { statement: FRESH_S, subject_justification: FRESH_J, author: "alice", at: NOW,
                                  subject_position: "sought_and_answered" }, completeness_excluded: FRESH_X };
  assert.deepEqual(carried(fresh), [], "a freshly authored block carries nothing forward");
  assert.deepEqual(carried({ ...fresh, completeness: { ...fresh.completeness, statement: STMT2 } }), ["statement"]);
  assert.deepEqual(carried({ ...fresh, completeness: { ...fresh.completeness, subject_justification: JUST2 } }), ["subject_justification"]);
  assert.deepEqual(carried({ ...fresh, completeness_excluded: EX2.map((r) => ({ ...r })) }), ["excluded"],
    "the exclusion list byte-identical");
  assert.deepEqual(carried({ ...fresh, completeness_excluded: [{ ...EX2[0], reason: "outside the period" }] }), [],
    "one reason rewritten is a fresh list");
  assert.deepEqual(Object.keys(completenessFields(fresh)), fields,
    "author, at and subject_position are not compared: the same position and the same author are legal on a fresh assertion");
});

test("R8, R9 (publish, DEC-13): each of the three declared subject positions draws no finding — the position is carried, never weighed; an undeclared position, or one with no justification, is refused by the document's own arm (C-41.10) and by the case arm of C-2.8", () => {
  assert.deepEqual(SUBJECT_POSITIONS, ["sought_and_answered", "sought_no_answer", "not_sought"]);
  for (const p of SUBJECT_POSITIONS) {
    assert.deepEqual(checkCaseDocument(edition3({ completeness: { subject_position: p } }), CTX3), [], p);
    assert.deepEqual(caseMemberFindings({ edition: 1, completeness: { statement: "s", author: "alice", at: NOW,
      subject_position: p, subject_justification: "j" }, completeness_excluded: [],
      published_strength: [{ axis: "capture", state: "unrated", grade: null }, { axis: "connection", state: "unrated", grade: null }] }),
      [], `the case-member arm, ${p}`);
  }
  for (const [label, completeness] of [["undeclared", { subject_position: "" }], ["not a position", { subject_position: "contacted" }],
                                       ["no justification", { subject_justification: " " }]]) {
    const found = checkCaseDocument(edition3({ completeness }), CTX3);
    assert.deepEqual([...new Set(found.map((e) => e.check))].sort(), ["C-2.8", "C-41.10"], label);
    assert.ok(found.some((e) => e.check === "C-41.10" && /subject_(position|justification)/.test(e.message)), label);
  }
});

/* The case ceremony's world (caseratify-op.test.mjs's), with `mutate` applied to the /5 document before it is stored. */
async function caseWorld({ mutate = (d) => d } = {}) {
  const w = world();
  const key = await newKey(), other = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = mutate(cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] }));
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  const facts = { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                  attribution: { reached: [], legacy: [], stated: [], current: [] },
                  signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null };
  w.pub.facts.set(`${CASE}#1`, facts);
  const sig = await signCase(key, CASE, 1, docSha);
  const body = { caseId: CASE, edition: 1, expectedSha: docSha, sig };
  const run = async (b = body, o = {}) => { const p = plane(w, o); return { ...(await caseRatifyOp(p.request(b), p.stub, p.ctx)), p }; };
  return { w, P, key, other, docSha, sig, body, facts, run };
}

test("R2, R3 (publish, DEC-13): a case under each declared subject position — a deliberate not_sought with an empty exclusion list among them — ratifies exactly like any other", async () => {
  for (const p of SUBJECT_POSITIONS) {
    const { w, run } = await caseWorld({ mutate: (d) => ({ ...d, completeness: { ...d.completeness, subject_position: p },
                                                          completeness_excluded: [] }) });
    const r = await run();
    assert.deepEqual([r.status, r.body.ok, r.body.edition], [200, true, 1], `${p}: ${JSON.stringify(r.body).slice(0, 300)}`);
    assert.equal(w.pub.committed.length, 1, p);
  }
});

/* Block 6b: hand-written bytes moving a finding off the sha its ratified case pinned. */
test("R5 (publish): ratifying a finding's revised bytes, which no ratified case pins, is C-58.2 by name, before any edition is read; the edition already published is untouched", () => {
  const w = world();
  w.member("alice");
  const P = w.project("Team", "alice");
  w.inquiry(Q1);
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, CASE, P, NOW);
  const sha1 = w.sha(Q1);
  w.pub.pins.set(`${Q1}@${sha1}`, [{ case_id: CASE, edition: 1, role: "load_bearing" }]);
  const args = (s) => ({ bundleId: Q1, bundleSha: s, attestorKey: "KEY", attestorMember: "alice", gateVersion: "plane-gate/1.0",
                         sigArmored: "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n",
                         shas: [{ sha256: s, path: "bundle.md", kind: "bundle", bytes: 10 }], edges: [], deliveredBy: V("alice") });
  assert.equal(w.op("publish", {}, args(sha1)).ok, true, "the pinned bytes cross (the negative control)");
  const row = w.row(`SELECT * FROM published_bundles WHERE bundle_id=?`, Q1);
  for (const n of [2, 1]) {
    w.promote(Q1, w.record.readFile(Q1, "bundle.md").text.replace(/^---\n/, `---\nedition: ${n}\n`));
    const r = w.op("publish", {}, args(w.sha(Q1)));
    assert.deepEqual([r.ok, r.reason, r.check, r.translation, r.highest],
      [false, "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE", "C-58.2", SCOPE.RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE.translation, undefined], `edition ${n}`);
  }
  assert.equal(w.count("published_bundles"), 1);
  assert.deepEqual(w.row(`SELECT * FROM published_bundles WHERE bundle_id=?`, Q1), row, "nothing overwritten");
});

/* ================================================= testify.test.mjs, testimonyaxis.test.mjs (ratification R2, R4, R5) */

async function ratifyWorld() {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice");
  w.promote(OBS, cleanInfoMd(OBS), "information");
  w.promote(DOC, cleanInfoMd(DOC), "information");
  for (const id of [OBS, DOC]) w.pub.resting.set(id, [{ case_id: CASE, finding: Q1, project: P }]);
  const body = async (id) => ({ bundleId: id, expectedSha: w.sha(id), sig: await signBundle(key, id, w.sha(id)) });
  const run = async (b, o = {}) => { const p = plane(w, o); return { ...(await ratifyOp(p.request(b), p.stub, p.ctx)), p }; };
  return { w, P, key, body, run };
}

test("R4 (testify): op=ratify on an observation itself, under a registered member's real signature, with no ratified case stating its attribution, is ATTRIBUTION_UNSTATED (C-92.12) by name; nothing reaches the published store", async () => {
  const { w, body, run } = await ratifyWorld();
  w.bv.reach = { self: [OBS], via: [] };
  const r = await run(await body(OBS));
  assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.translation, r.body.bundleId],
    [409, "ATTRIBUTION_UNSTATED", "C-92.12", ATTRIBUTION.ATTRIBUTION_UNSTATED.translation, OBS]);
  assert.equal(r.p.published.size, 0, "the published bucket holds nothing");
  assert.equal(w.count("published_bundles"), 0);
  w.publication.attributionStatedFor = (id) => id === OBS;
  const stated = await run(await body(OBS));
  assert.deepEqual([stated.status, stated.body.ok], [200, true], "the negative control: once a ratified case states it, it crosses as that case's evidence");
});

test("R4 (testify, over-strictness): an ordinary document that is no observation crosses with nothing stated about attribution", async () => {
  const { w, body, run } = await ratifyWorld();
  w.bv.reach = { self: [], via: [] };
  const r = await run(await body(DOC));
  assert.deepEqual([r.status, r.body.ok, r.body.bundleId], [200, true, DOC], JSON.stringify(r.body).slice(0, 300));
  assert.equal(r.p.published.size, 1);
});

test("R5 (testify): a finding resting on the observation, directly or through another finding, in no ratified case, is C-58.2 by name and crosses only with a signed case", () => {
  const w = world();
  w.member("alice");
  const P = w.project("Team", "alice");
  const F1 = "INQ-2026-5301-rests-on-obs", F2 = "INQ-2026-5301-rests-on-f1";
  w.inquiry(F1); w.inquiry(F2);
  const args = (id) => ({ bundleId: id, bundleSha: w.sha(id), attestorKey: "KEY", attestorMember: "alice",
                          gateVersion: "plane-gate/1.0", sigArmored: "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n",
                          shas: [{ sha256: w.sha(id), path: "bundle.md", kind: "bundle", bytes: 10 }], edges: [], deliveredBy: V("alice") });
  for (const id of [F1, F2]) {
    const r = w.op("publish", {}, args(id));
    assert.deepEqual([r.ok, r.reason, r.check], [false, "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE", "C-58.2"], id);
  }
  assert.equal(w.count("published_bundles"), 0);
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, CASE, P, NOW);
  w.pub.pins.set(`${F1}@${w.sha(F1)}`, [{ case_id: CASE, edition: 1, role: "load_bearing" }]);
  assert.equal(w.op("publish", {}, args(F1)).ok, true, "the negative control: pinned by a ratified case, it crosses");
});

test("R2 (testify, testimonyaxis): op=caseratify on a case whose finding rests on an observation whose author chose no level is ATTRIBUTION_UNCHOSEN (C-92.10), naming the observation, before the signature is weighed; nothing is committed or published", async () => {
  const { w, facts, body, other, run } = await caseWorld();
  facts.attribution = { reached: [OBS], legacy: [], stated: [], current: [{ observation: OBS, level: null, why: "no choice made" }] };
  for (const sig of [body.sig, await signCase(other, CASE, 1, body.expectedSha)]) {
    const r = await run({ ...body, sig });
    assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.translation],
      [409, "ATTRIBUTION_UNCHOSEN", "C-92.10", ATTRIBUTION.ATTRIBUTION_UNCHOSEN.translation]);
    assert.deepEqual(r.body.unchosen, [{ observation: OBS, why: "no choice made" }]);
    assert.match(r.body.detail, new RegExp(OBS));
    assert.deepEqual([r.p.published.size, r.p.assembled.length], [0, 0]);
  }
  assert.equal(w.pub.committed.length, 0);
  facts.attribution = { reached: [OBS], legacy: [], stated: [{ observation: OBS, level: "group", shown: null }],
                        current: [{ observation: OBS, level: "group", shown: null }] };
  const ok = await run();
  assert.deepEqual([ok.status, ok.body.ok], [200, true], "the negative control: chosen and stated, the case commits");
  assert.equal(w.pub.committed.length, 1);
});

/* testimonyaxis §6: C-2.8's case arm over a /5 document whose member rests on a member's testimony (three frozen rows).
   The member's basis at its pinned bytes is `memberBasis`, as the store hands it. */
test("R8, R9 (testimonyaxis): C-2.8's case arm over a /6 document with a three-row (testimony) member — clean as frozen; the testimony row removed is testimony-axis-unfrozen; the historic two rows with no testimony leg are clean; an unmeasured axis, a second testimony row or a missing connection row is refused", () => {
  const M = "INQ-2026-5302-case-testimony";
  const basis = [{ target: "INFO-2026-5302-upload", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture" },
                 { target: OBS, role: "supports", grade: "D", grade_axis: "testimony", grade_source: "testimony" }];
  const three = [["capture", "graded", "B"], ["connection", "unrated", null], ["testimony", "graded", "D"]];
  const docWith = (rows) => {
    const d = cleanCase({ caseId: CASE, edition: 1, project: "PROJ-2026-5302-publisher", members: [{ id: M, pin: "a".repeat(64) }] });
    d.case_strength = rows.map(([axis, state, grade]) => ({ target: M, axis, state, grade, weakest: null, load_bearing: 0,
                                                           population: 2, detail: "x" }));
    return bytesOf(d);
  };
  const c28 = (fm, b = basis) => checkCaseDocument(fm, { caseId: CASE, edition: 1, memberBasis: { [M]: b } })
    .filter((x) => x.check === "C-2.8" && /published_strength/.test(x.message))
    .map((x) => { assert.match(x.message, new RegExp(`^case document, member ${M}: `)); return x.code ?? "uncoded"; });
  const frozen = docWith(three);
  assert.equal(caseDocumentStatesMemberBlocks(frozen), true, "the ceremony runs over this document's members");
  assert.equal(isCaseMemberBytes({ published_strength: three.map(([axis]) => ({ axis })) }), true, "a testimony row keeps it a member");
  assert.deepEqual(checkCaseDocument(frozen, { caseId: CASE, edition: 1, body: CASE_BODY, memberBasis: { [M]: basis } }), [],
    "three frozen rows are clean, and nothing else is drawn");
  assert.deepEqual(c28(docWith(three.slice(0, 2))), ["testimony-axis-unfrozen"]);
  assert.deepEqual(c28(docWith(three.slice(0, 2)), basis.filter((l) => l.grade_axis !== "testimony")), [], "the historic shape");
  assert.deepEqual(c28(docWith([...three, ["score", "graded", "A"]])), ["uncoded"]);
  assert.deepEqual(c28(docWith([...three, ["testimony", "graded", "D"]])), ["uncoded"]);
  assert.deepEqual(c28(docWith([three[0], three[2]])), ["uncoded"]);
  assert.deepEqual(checkCaseDocument(docWith(three.slice(0, 2)), { caseId: CASE, edition: 1, memberBasis: null })
    .filter((x) => x.code === "testimony-axis-unfrozen"), [], "an absent member basis leaves the testimony arm unasked");
});

/* ============================================ operator-attest.test.mjs (ratification R2, R4: C-32.14, C-32.15)
   The real bearer wiring (a real ADMIN/MEMBER/PROBE_TOKEN resolved by `classify()` reaching the handler as
   viaSession=false) is control-plane's; at this interface the flag and the class are what the control plane hands the
   handler. The classes are the three the ruling names and one this module has never heard of: the fence keys on how the
   caller arrived, never on a list of classes. The payload is COMPLETE — a registered member's real signature over bytes
   that exist — and the member's own session crosses with the same bytes afterwards. */
const BEARERS = ["admin", "member", "probe", "a-binding-added-later"];

test("R4 (operator-attest): C-32.14 — every bearer class, carrying a registered member's valid signature over existing bytes, is refused OPERATOR_TOKEN_CANNOT_RATIFY naming its class, with the row's translation; nothing is read or published; the member's own session then crosses with the same bytes", async () => {
  const { w, body, run } = await ratifyWorld();
  const b = await body(DOC);
  for (const cls of BEARERS) {
    const r = await run(b, { viaSession: false, cls });
    assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.tokenClass, r.body.translation],
      [403, "OPERATOR_TOKEN_CANNOT_RATIFY", "C-32.14", cls, FENCE.OPERATOR_TOKEN_CANNOT_RATIFY.translation], cls);
    assert.ok(r.body.detail.includes(`\`${cls}\`-class`), cls);
    assert.deepEqual([r.p.fetched, r.p.published.size], [[], 0], cls);
  }
  assert.equal(w.count("published_bundles"), 0, "no bearer class published the finding");
  const own = await run(b);
  assert.deepEqual([own.status, own.body.ok, own.body.attestor], [200, true, "alice"], "over-strictness");
  assert.equal(w.count("published_bundles"), 1);
});

test("R2 (operator-attest): C-32.15 — every bearer class, carrying a registered member's valid signature over the case document, is refused OPERATOR_TOKEN_CANNOT_RATIFY_CASE naming its class, with the row's translation; the case is not committed; the member's own session then commits the same signed bytes", async () => {
  const { w, body, run } = await caseWorld();
  for (const cls of BEARERS) {
    const r = await run(body, { viaSession: false, cls });
    assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.tokenClass, r.body.translation],
      [403, "OPERATOR_TOKEN_CANNOT_RATIFY_CASE", "C-32.15", cls, FENCE.OPERATOR_TOKEN_CANNOT_RATIFY_CASE.translation], cls);
    assert.ok(r.body.detail.includes(`\`${cls}\`-class`), cls);
    assert.deepEqual(r.p.fetched, [], cls);
  }
  assert.equal(w.pub.committed.length, 0, "no bearer class committed the case");
  const own = await run(body);
  assert.deepEqual([own.status, own.body.ok, own.body.attestor.member], [200, true, "alice"], "over-strictness");
  assert.equal(w.pub.committed.length, 1);
});

test("R4, R2 (operator-attest): C-32.14's and C-32.15's translations are the rows' own and are what each refusal carries, distinct from the machine fence's", () => {
  for (const code of ["OPERATOR_TOKEN_CANNOT_RATIFY", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE"]) {
    assert.ok(typeof FENCE[code].translation === "string" && FENCE[code].translation.length > 60, code);
  }
  assert.notEqual(FENCE.OPERATOR_TOKEN_CANNOT_RATIFY.translation, FENCE.MACHINE_CANNOT_RATIFY.translation);
  assert.notEqual(FENCE.OPERATOR_TOKEN_CANNOT_RATIFY_CASE.translation, FENCE.MACHINE_CANNOT_RATIFY_CASE.translation);
  assert.deepEqual([FENCE.OPERATOR_TOKEN_CANNOT_RATIFY.check, FENCE.OPERATOR_TOKEN_CANNOT_RATIFY_CASE.check], ["C-32.14", "C-32.15"]);
});
