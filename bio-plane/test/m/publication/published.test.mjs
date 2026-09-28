/* publication — the published projection: its registries (R7), the public reads (R8–R12, R25, R26), the deliverer
   (R14, R27, R28), the commits the ceremonies make (R22, R24, R35) and the evidence-package block (R36). Driven at the
   module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG, NOW } from "./fixture.mjs";
import { rowOf } from "../../../src/publication/checks.mjs";
import { delivererOf, deliveringPrincipal, DELIVERER_UNDETERMINED_DETAIL } from "../../../src/deliverer.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes";
const PUBLISHED = ["published_bundles", "published_shas", "published_cases", "published_case_members", "cases",
                   "published_edges", "case_documents"];
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: r.role ?? "load_bearing" }));

/* CASE-2026-0001 edition 1 over F (pinned), ratified and published; DOC a document F rests on. */
function published({ strength = [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }],
                     publishFinding = true } = {}) {
  const w = world();
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, strength, excluded: [{ target: DOC, description: "the minutes" }] });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  if (publishFinding)
    assert.equal(w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }] }).ok, true);
  return { w, proj, pin, roles };
}

test("R7 publishedRegistryFor answers each published edition and its frozen pair keyed on the record's object_type; publishedCaseRegistryFor each ratified case edition; both are promotion's facts", () => {
  const { w, pin } = published();
  const reg = w.p.publishedRegistryFor(F, [DOC, "NOPE"]);
  assert.deepEqual(Object.keys(reg), [F]);
  assert.equal(reg[F].object_type, "inquiry");
  assert.equal(reg[F].latest, 1);
  const e = reg[F].editions["1"];
  assert.deepEqual([e.edition, e.bundle_sha, e.case_ids, e.case_id], [1, pin, ["CASE-2026-0001"], "CASE-2026-0001"]);
  assert.deepEqual([e.capture, e.connection], [{ state: "graded", grade: "B" }, { state: "graded", grade: "C" }]);
  assert.equal("testimony" in e, false, "the testimony axis only where the edition froze one");
  assert.deepEqual(w.p.publishedRegistryFor(null, []), {});
  /* a published row with no bundles row reads its type as undetermined (null) */
  w.st.sql.exec(`INSERT INTO published_bundles (bundle_id, edition, bundle_sha, ratified_at, attestor_key, gate_version, sig_armored)
                 VALUES ('GONE-1', 1, 'x', ?, 'k', 'g', 's')`, NOW);
  assert.equal(w.p.publishedRegistryFor("GONE-1")["GONE-1"].object_type, null);
  assert.deepEqual(w.promotion.fact("publishedRegistry", F, [DOC]).value, w.p.publishedRegistryFor(F, [DOC]));
  const creg = w.p.publishedCaseRegistryFor(["CASE-2026-0001", "CASE-NONE"]);
  assert.deepEqual(Object.keys(creg), ["CASE-2026-0001"]);
  assert.equal(creg["CASE-2026-0001"].latest, 1);
  assert.deepEqual(Object.keys(creg["CASE-2026-0001"].editions["1"]).sort(),
                   ["bias_acknowledgement", "completeness", "edition", "ratified_at", "scope"]);
  assert.deepEqual(w.promotion.fact("publishedCaseRegistry", ["CASE-2026-0001"]).value, creg);
  assert.deepEqual(w.p.publishedCaseRegistryFor([]), {});
});

test("R8 verifySha answers whether a hash is published and every place it is, the signed case document's hash included (D-734)", () => {
  const { w, pin } = published();
  const v = w.op("verify", { sha256: pin.toUpperCase() });
  assert.deepEqual([v.published, v.sha256, v.matches.map((m) => [m.bundle_id, m.path, m.kind])],
                   [true, pin, [[F, "bundle.md", "bundle"]]]);
  const doc = w.row(`SELECT doc_sha FROM case_documents`).doc_sha;
  assert.deepEqual(w.p.verifySha(doc).matches.map((m) => [m.bundle_id, m.path, m.kind]),
                   [["CASE-2026-0001", "case-document-edition-1.md", "case_document"]]);
  assert.deepEqual(w.p.verifySha("0".repeat(64)), { published: false, sha256: "0".repeat(64), matches: [] });
  assert.deepEqual(w.p.publishedCaseDocumentText(doc).found, true);
  assert.deepEqual(w.p.publishedCaseDocumentText("0".repeat(64)), { found: false });
});

test("R9 publishedList and publishedEditions name every edition with its signer, deliverer and gate version, and every case a finding serves", () => {
  const { w } = published();
  const list = w.op("publishedlist");
  assert.deepEqual(list.bundles.map((b) => [b.bundle_id, b.edition, b.attestor_member, b.gate_version, b.case_id]),
                   [[F, 1, "olive", "plane-gate/test", "CASE-2026-0001"]]);
  assert.deepEqual(list.bundles[0].delivered_by, { kind: "member", member: "olive" });
  assert.deepEqual(list.bundles[0].cases, [{ case_id: "CASE-2026-0001", edition: 1 }]);
  assert.deepEqual(list.cases.map((c) => [c.case_id, c.edition, c.findings]), [["CASE-2026-0001", 1, [F]]]);
  assert.equal(w.op("publishededitions", {}).reason, "NO_ID");
  const eds = w.op("publishededitions", { id: F });
  assert.deepEqual(eds.editions.map((e) => [e.edition, e.case_id, e.scope, e.bias_acknowledgement]),
                   [[1, "CASE-2026-0001", "The question.", "none declared"]]);
  /* a finding two cases pin: every case named, the scalar null */
  const { w: w2, proj, pin } = published();
  w2.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w2.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "supporting" }] });
  const b = w2.p.publishedList().bundles[0];
  assert.deepEqual([b.case_id, b.case_edition, b.cases.map((c) => c.case_id)], [null, null, ["CASE-2026-0001", "CASE-2026-0002"]]);
  const e2 = w2.p.publishedEditions(F).editions[0];
  assert.deepEqual([e2.case_id, e2.scope, e2.cases.length], [null, null, 2]);
});

test("R10 publishedCase resolves by case, by finding and by hash, and answers the case edition whole, with no case-level strength", () => {
  const { w, pin } = published();
  const byCase = w.op("publishedcase", { id: "CASE-2026-0001" });
  const byFinding = w.op("publishedcase", { id: F });
  const byHash = w.op("publishedcase", { sha256: pin });
  for (const c of [byCase, byFinding, byHash]) {
    assert.equal(c.ok, true);
    assert.deepEqual([c.caseId, c.edition, c.scope, c.bias_acknowledgement, c.complete, c.awaiting],
                     ["CASE-2026-0001", 1, "The question.", "none declared", true, []]);
    assert.equal("strength" in c, false, "no case-level strength (R26)");
    assert.deepEqual(c.findings.map((f) => [f.bundle_id, f.version_sha, f.role, f.frozen_from]),
                     [[F, pin, "load_bearing", "case_document"]]);
    assert.deepEqual(c.findings[0].strength.map((s) => [s.axis, s.grade]), [["capture", "B"], ["connection", "C"]]);
    assert.match(c.findings[0].case_excludes, /Nothing else\./);
    assert.deepEqual(c.findings[0].serves.map((s) => s.to), [DOC].filter(() => false), "DOC is not published: not served");
    assert.deepEqual(c.findings[0].unresolved, [], "a serve edge to an unpublished target was dropped at the write");
    assert.deepEqual(c.editions, [1]);
    assert.equal(c.document.attestor.member, "olive", "D-712: the signed case document is served");
    assert.deepEqual(Object.keys(c.completeness).sort(), ["author", "statement"]);
    assert.ok("manifest" in c && "files" in c && "evidence_package" in c);
  }
  assert.equal(byFinding.asked, F);
  assert.equal(byCase.asked, undefined);
  const none = w.op("publishedcase", { id: "NOPE" });
  assert.deepEqual([none.ok, none.reason, none.code, none.check, none.translation],
                   [false, "NOT_PUBLISHED", "NOT_PUBLISHED", "C-98.8", rowOf("NOT_PUBLISHED").translation]);
  /* a finding several cases pin is refused, naming them (C-44.2), unless the reader names the case */
  const { w: w2, proj, pin: pin2 } = published();
  w2.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin2 }] });
  w2.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin2 }] });
  const amb = w2.op("publishedcase", { id: F });
  assert.deepEqual([amb.reason, amb.code, amb.check, amb.translation, amb.cases],
                   ["FINDING_IN_SEVERAL_CASES", "FINDING_IN_SEVERAL_CASES", "C-44.2", rowOf("FINDING_IN_SEVERAL_CASES").translation,
                    ["CASE-2026-0001", "CASE-2026-0002"]]);
  assert.equal(w2.op("publishedcase", { sha256: pin2 }).reason, "FINDING_IN_SEVERAL_CASES");
  assert.equal(w2.op("publishedcase", { id: F, caseId: "CASE-2026-0002" }).caseId, "CASE-2026-0002");
  /* a ratified bundle in no case answers as what it is: no case identity, no scope, no case document */
  const { w: w3 } = published();
  w3.signFinding(DOC, { sig: SIG(7) });
  const loose = w3.op("publishedcase", { id: DOC });
  assert.deepEqual([loose.ok, loose.caseId, loose.scope, loose.completeness, loose.document],
                   [true, null, null, null, null]);
});

test("R11 publishedManifest serves the whole projection; where ratified documents pinning one sha freeze different pairs the row says CASES_DISAGREE", () => {
  const { w, proj, pin } = published();
  const agreeing = w.op("publishedmanifest");
  assert.equal(agreeing.ok, true);
  assert.equal(agreeing.published.length, 1);
  assert.equal("strengthByCase" in agreeing.published[0], false, "an agreeing row is unchanged");
  assert.deepEqual(agreeing.published[0].strength.map((s) => s.grade), ["B", "C"]);
  for (const c of agreeing.cases) assert.equal("strength" in c, false, "no case row carries a strength");
  /* a second case reads the same bytes at another pair */
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }],
                                   strength: [{ target: F, axis: "capture", grade: "D" }] });
  w.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const row = w.p.publishedManifest().published[0];
  assert.deepEqual([row.strength, row.strengthUndetermined], [null, "CASES_DISAGREE"]);
  assert.deepEqual(row.strengthByCase.map((c) => [c.case_id, c.edition, c.strength.map((s) => s.grade)]),
                   [["CASE-2026-0001", 1, ["B", "C"]], ["CASE-2026-0002", 1, ["D"]]]);
});

test("R12 publishedTargets answers R7's registry for those ids; excludedBy answers every case naming a document in its exclusions", () => {
  const { w } = published();
  assert.deepEqual(w.op("publishedtargets", { ids: `${F},${DOC}, ,NOPE` }).registry, w.p.publishedRegistryFor(null, [F, DOC, "NOPE"]));
  assert.equal(Object.keys(w.p.publishedTargets(Array.from({ length: 300 }, (_, i) => `X-${i}`)).registry).length, 0);
  /* a ratified case document's exclusion answers anybody a member of its roster is visible to */
  const by = w.op("excludedby", { id: DOC, viewer: V("bo") });
  assert.deepEqual(by.cases.map((c) => [c.case_id, c.bundle_id, c.description, c.from]),
                   [["CASE-2026-0001", F, "the minutes", "case_document"]]);
  /* an inquiry's live exclusions answer too, through inquiry's read */
  w.inquiry(G, { extra: ["completeness_excluded:", `  - target: ${DOC}`, '    description: "live row"', '    reason: "scope"'] });
  const both = w.p.excludedBy(DOC, V("bo")).cases;
  assert.ok(both.some((c) => c.bundle_id === G && c.description === "live row" && !c.from));
  assert.deepEqual(w.p.excludedBy(DOC, "nobody").cases, [], "a viewer the gate does not recognise sees none");
  assert.equal(w.op("excludedby", {}).reason, "NO_ID");
});

test("R14 delivererOf answers founder, member or undetermined from the stored value alone; deliveringPrincipal from the session alone", () => {
  assert.deepEqual(delivererOf("founder"), { kind: "founder", member: null });
  assert.deepEqual(delivererOf("member:olive"), { kind: "member", member: "olive" });
  for (const v of [null, undefined, "", "member:", "admin", "olive", 7])
    assert.deepEqual(delivererOf(v), { kind: "undetermined", member: null, detail: DELIVERER_UNDETERMINED_DETAIL });
  assert.equal(deliveringPrincipal({ role: "admin" }), "founder");
  assert.equal(deliveringPrincipal({ role: "member:bo" }), "member:bo");
  for (const s of [null, {}, { role: "member:" }, { role: "class:ai" }, { role: 3 }]) assert.equal(deliveringPrincipal(s), null);
});

test("R22 commitEdition appends one published edition inside the caller's transaction, answers existed for a retry, and refuses anything else there with nothing written", () => {
  const { w, pin } = published();
  const retry = w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }] });
  assert.deepEqual([retry.ok, retry.existed, retry.edition], [true, true, 1]);
  assert.equal(w.count("published_bundles"), 1);
  const before = w.snapshot(PUBLISHED);
  /* other bytes claiming the same edition */
  const exists = w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: "f".repeat(64), edition: 1, title: "t",
    shas: [], attestorKey: "k", gateVersion: "g", sigArmored: SIG(3), edges: [], at: NOW }));
  assert.deepEqual([exists.ok, exists.reason, exists.published], [false, "EDITION_EXISTS", pin]);
  const stale = w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: "e".repeat(64), edition: 1,
    shas: [], attestorKey: "k", gateVersion: "g", sigArmored: SIG(3), edges: [] }));
  assert.equal(stale.reason, "EDITION_EXISTS");
  const low = w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: "d".repeat(64), edition: 0,
    shas: [], attestorKey: "k", gateVersion: "g", sigArmored: SIG(3), edges: [] }));
  assert.deepEqual([low.reason, low.highest], ["EDITION_NOT_INCREMENTED", 1]);
  assert.deepEqual(w.snapshot(PUBLISHED), before, "a refusal writes nothing");
  assert.equal(w.p.commitEdition({ bundleId: F }).reason, "MALFORMED");
  /* the next edition of other bytes is appended, and edition 1 keeps answering */
  const next = w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: "c".repeat(64), title: "t",
    shas: [{ sha256: "c".repeat(64), path: "bundle.md", kind: "bundle" }], attestorKey: "k", attestorMember: "bo",
    gateVersion: "g", sigArmored: SIG(4), edges: [], at: "2026-09-29T00:00:00Z" }));
  assert.deepEqual([next.ok, next.edition, next.existed], [true, 2, false]);
  assert.deepEqual(w.rows(`SELECT edition, bundle_sha FROM published_bundles ORDER BY edition`).map((r) => r.edition), [1, 2]);
  /* a refusing caller rolls it back */
  const rolled = w.record.transact(() => {
    w.p.commitEdition({ bundleId: G, bundleSha: "b".repeat(64), shas: [], attestorKey: "k", gateVersion: "g",
                        sigArmored: SIG(5), edges: [] });
    return { ok: false, reason: "CALLER_REFUSED" };
  });
  assert.equal(rolled.reason, "CALLER_REFUSED");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_bundles WHERE bundle_id=?`, G).n, 0);
});

test("R22 commitCaseEdition records the owner, the edition's assertions, the roster with its pins and the signature, answers existed, awaiting and state, and refuses a signed or foreign case", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F); w.inquiry(G);
  const roles = [{ target: F, version_sha: w.head(F) }, { target: G, version_sha: w.head(G), role: "supporting" }];
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).reason, "NO_CASE_DOCUMENT");
  w.prepare("CASE-2026-0001", 1, { project: proj, roles });
  const bar = { declared: true, capture: "B", connection: "C" };
  const c = w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles), bar });
  assert.deepEqual([c.ok, c.existed, c.awaiting, c.state.complete, c.state.project], [true, false, [F, G], false, proj]);
  assert.equal(w.row(`SELECT project_id FROM cases`).project_id, proj);
  const pc = w.row(`SELECT * FROM published_cases`);
  assert.deepEqual([pc.scope, pc.bias_acknowledgement, JSON.parse(pc.bar).capture], ["The question.", "none declared", "B"]);
  assert.deepEqual(w.rows(`SELECT ord, bundle_id, role FROM published_case_members ORDER BY ord`),
                   [{ ord: 0, bundle_id: F, role: "load_bearing" }, { ord: 1, bundle_id: G, role: "supporting" }]);
  const d = w.row(`SELECT sig_armored, attestor_member, delivered_by, ratified_at FROM case_documents`);
  assert.deepEqual([d.sig_armored, d.attestor_member, d.delivered_by, d.ratified_at], [SIG(1), "olive", V("olive"), NOW]);
  const before = w.snapshot(PUBLISHED);
  const again = w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  assert.deepEqual([again.ok, again.existed], [true, true]);
  const other = w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles), sig: SIG(8) });
  assert.equal(other.reason, "CASE_EDITION_ALREADY_RATIFIED");
  w.prepare("CASE-2026-0001", 2, { project: "PROJ-OTHER", roles });
  const foreign = w.signCase("CASE-2026-0001", 2, { project: "PROJ-OTHER", roster: roster(roles) });
  assert.deepEqual([foreign.reason, foreign.declared, foreign.signed], ["CASE_PRODUCTION_DIVERGED", proj, "PROJ-OTHER"]);
  const after = w.snapshot(PUBLISHED);
  delete before.case_documents; delete after.case_documents;
  assert.deepEqual(after, before, "a retry and a refusal write nothing published");
  assert.equal(w.p.commitCaseEdition({ case: "", edition: 1 }).reason, "MALFORMED");
});

test("R24 nothing updates or deletes a published row, a signed document or a published hash: a correction is a new edition, and an edition answers forever", () => {
  const { w, proj, pin, roles } = published();
  const frozen = w.snapshot(["published_bundles", "published_shas", "published_cases", "published_case_members", "cases"]);
  const signedDoc = w.row(`SELECT * FROM case_documents`);
  /* every write this module offers, aimed at what is already published */
  w.p.storeCaseDocument({ case: "CASE-2026-0001", edition: 1, text: "---\nx: 1\n---\n", author: V("bo") });
  w.p.reauthorSection({ case: "CASE-2026-0001", edition: 1, docSha: signedDoc.doc_sha, section: "attribution",
                        lines: { frontmatter: [], body: [] } });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles), sig: SIG(8) });
  w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: "a".repeat(64), edition: 1, shas: [],
    attestorKey: "k", gateVersion: "g", sigArmored: SIG(9), edges: [] }));
  w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 1, manifest: { m: 1 }, manifestSha: "1".repeat(64) });
  const moved = w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 1, manifest: { m: 2 }, manifestSha: "2".repeat(64) });
  assert.equal(moved.reason, "MANIFEST_EXISTS");
  assert.deepEqual(w.row(`SELECT * FROM case_documents`), signedDoc);
  const now = w.snapshot(["published_bundles", "published_shas", "published_cases", "published_case_members", "cases"]);
  /* the only changes: the manifest recorded once (its hash appended, its case row naming it) */
  assert.deepEqual(now.published_bundles, frozen.published_bundles);
  assert.deepEqual(now.published_case_members, frozen.published_case_members);
  assert.deepEqual(now.cases, frozen.cases);
  const shas = JSON.parse(now.published_shas);
  assert.deepEqual(shas.slice(0, JSON.parse(frozen.published_shas).length), JSON.parse(frozen.published_shas), "append-only");
  assert.equal(w.p.verifySha(pin).published, true);
});

test("R25 the public read path needs no credential and reads the published projection only: working material is never answered", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  const fresh = world();
  for (const [op, q] of [["publishedcase", { id: F }], ["publishedcase", { id: "CASE-2026-0001" }], ["publishedcase", { sha256: pin }],
                         ["verify", { sha256: pin }], ["publishedlist", {}], ["publishededitions", { id: F }], ["publishedmanifest", {}]]) {
    const a = w.op(op, q), b = fresh.op(op, q);
    if (op === "publishedmanifest") { delete a.detail; delete b.detail; }
    assert.deepEqual(a, b, `${op} ${JSON.stringify(q)} answers as if nothing were there`);
  }
  const doc = w.row(`SELECT doc_sha FROM case_documents`).doc_sha;
  assert.deepEqual(w.p.publishedCaseDocumentText(doc), { found: false }, "an unsigned document's text is unreachable");
});

test("R26 no answer, document or row this module serves composes a case-level strength: every pair is per member and per axis", () => {
  const { w } = published();
  const c = w.p.publishedCase({ id: "CASE-2026-0001" });
  assert.equal("strength" in c, false);
  assert.equal("strength" in c.document, false);
  for (const f of c.findings) assert.ok(Array.isArray(f.strength) && f.strength.every((s) => s.axis));
  for (const row of w.p.publishedManifest().cases) assert.equal("strength" in row, false);
  for (const row of w.p.publishedList().cases) assert.equal("strength" in row, false);
  const st = w.p.caseEditionState("CASE-2026-0001", 1);
  assert.equal("strength" in st, false);
  assert.match(w.p.publishedManifest().altitudes, /no strength/);
});

test("R27 signer and deliverer are two facts, and neither is copied from the other", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.record.transact(() => w.p.commitCaseEdition({ case: "CASE-2026-0001", edition: 1, project: proj,
    roster: [{ bundle_id: F, version_sha: pin }], sigArmored: SIG(1), attestorKey: "k", attestorMember: "olive",
    gateVersion: "g", deliveredBy: "founder", at: NOW }));
  w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: pin, shas: [], attestorKey: "k",
    attestorMember: "olive", gateVersion: "g", sigArmored: SIG(2), deliveredBy: null, edges: [] }));
  const doc = w.p.caseDocument("CASE-2026-0001", 1, null);
  assert.deepEqual([doc.attestor_member, doc.delivered_by], ["olive", { kind: "founder", member: null }]);
  const row = w.p.publishedList().bundles[0];
  assert.equal(row.attestor_member, "olive");
  assert.equal(row.delivered_by.kind, "undetermined", "a deliverer never recorded is not read off the signer");
});

test("R28 undetermined is stated and never filled: a deliverer, an acknowledgement list a document is silent about, a citation's version before /4", () => {
  const { w } = published();
  w.st.sql.exec(`UPDATE published_bundles SET delivered_by=NULL`);
  const f = w.p.publishedCase({ id: "CASE-2026-0001" }).findings[0];
  assert.deepEqual(f.delivered_by, { kind: "undetermined", member: null, detail: DELIVERER_UNDETERMINED_DETAIL });
  assert.equal(w.p.caseDocument("CASE-2026-0001", 1, null).citations.state, "signed");
  /* the completeness a caller commits is stored as given: a list the document was silent about stays null */
  const w2 = world();
  w2.member("olive");
  const proj = w2.project("Parks", "olive");
  w2.inquiry(F);
  const pin = w2.head(F);
  w2.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }], format: "bio-case-document/2" });
  w2.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }],
                                     completeness: { statement: "s", acknowledgements: null } });
  assert.equal(JSON.parse(w2.row(`SELECT completeness FROM published_cases`).completeness).acknowledgements, null);
  assert.equal(w2.p.caseDocument("CASE-2026-0001", 1, null).citations.state, "undetermined");
});

test("R35 publishing a target turns every name edge a published finding holds to it into a serve edge, in the same transaction", () => {
  const { w } = published();
  /* F named G (not yet published) and holds a division disclosure to DOC by kind */
  w.st.sql.exec(`INSERT INTO published_edges (from_bundle, to_bundle, kind, disclosure, published) VALUES (?,?,?,?,?)`,
                F, G, "cites", "name", NOW);
  w.st.sql.exec(`INSERT INTO published_edges (from_bundle, to_bundle, kind, disclosure, published) VALUES (?,?,?,?,?)`,
                F, G, "division_sibling", "name", NOW);
  w.st.sql.exec(`INSERT INTO published_edges (from_bundle, to_bundle, kind, disclosure, published) VALUES (?,?,?,?,?)`,
                "UNPUBLISHED-1", G, "cites", "name", NOW);
  w.inquiry(G);
  const r = w.record.transact(() => w.p.commitEdition({ bundleId: G, bundleSha: w.head(G), shas: [], attestorKey: "k",
    gateVersion: "g", sigArmored: SIG(6), edges: [] }));
  assert.equal(r.namesServed, 1);
  assert.deepEqual(w.rows(`SELECT from_bundle, kind, disclosure FROM published_edges WHERE to_bundle=? ORDER BY from_bundle, kind`, G),
                   [{ from_bundle: F, kind: "cites", disclosure: "serve" },
                    { from_bundle: F, kind: "division_sibling", disclosure: "name" },
                    { from_bundle: "UNPUBLISHED-1", kind: "cites", disclosure: "name" }]);
  assert.deepEqual(w.p.publishedCase({ id: "CASE-2026-0001" }).findings[0].serves.map((s) => s.to), [G]);
});

test("R36 one evidence-package block, filled once, computed at the read beside the case; with none, the package says it carries none", () => {
  const { w } = published();
  const none = w.p.publishedCase({ id: "CASE-2026-0001" }).evidence_package;
  assert.deepEqual(none.blocks, {});
  assert.match(none.detail, /carries none/);
  assert.equal(w.p.registerEvidenceBlock("filings", "Bad Name", () => 1).reason, "PROVIDER_MALFORMED");
  let calls = 0;
  assert.deepEqual(w.p.registerEvidenceBlock("filings", "available_actions",
    ({ caseId, edition, findings }) => { calls++; return { caseId, edition, findings }; }), { ok: true, module: "filings", name: "available_actions" });
  assert.equal(w.p.registerEvidenceBlock("other", "x", () => 1).reason, "PROVIDER_DECLARED");
  const pkg = w.p.publishedCase({ id: "CASE-2026-0001" }).evidence_package;
  assert.deepEqual(pkg.blocks, { available_actions: { caseId: "CASE-2026-0001", edition: 1, findings: [F] } });
  w.p.publishedCase({ id: "CASE-2026-0001" });
  assert.equal(calls, 2, "computed at each read, never stored");
  assert.equal(JSON.stringify(w.snapshot(PUBLISHED)).includes("available_actions"), false, "nothing enters the case's bytes");
});
