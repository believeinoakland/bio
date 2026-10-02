/* public-read — the public read path's store side (R1–R4), the evidence-package block (R8) and the invariants it holds
   as publication holds them (R10–R16). Copied from `test/m/publication/published.test.mjs`' R8–R11, R25–R28 and R36
   arms and `invariants.test.mjs`' R34 arm, renamed to this module's ids (K651), and run against `publication` as it
   stands. Driven at the module's interface: its methods and its ops (`publicReadOps`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SIG, NOW } from "./fixture.mjs";
import { rowOf, CASE_RESOLUTION_CHECKS, PUBLISHED_STORE_CHECKS, PUBLISHED_READ_CHECKS } from "../../../src/public-read/checks.mjs";
import { DELIVERER_UNDETERMINED_DETAIL } from "../../../src/deliverer.mjs";
import { PublicRead, publicReadOf, publicReadOps } from "../../../src/public-read/index.mjs";

const F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const PUBLISHED = ["published_bundles", "published_shas", "published_cases", "published_case_members", "cases",
                   "published_edges", "case_documents"];
const READS = [["publishedcase", (pin) => ({ id: F })], ["publishedcase", () => ({ id: "CASE-2026-0001" })],
               ["publishedcase", (pin) => ({ sha256: pin })], ["verify", (pin) => ({ sha256: pin })],
               ["publishedlist", () => ({})], ["publishededitions", () => ({ id: F })], ["publishedmanifest", () => ({})]];
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

test("R1 verifySha answers whether a hash is published and every place it is, the signed case document's hash included (D-734)", () => {
  const { w, pin } = published();
  const v = w.read("verify", { sha256: pin.toUpperCase() });
  assert.deepEqual([v.published, v.sha256, v.matches.map((m) => [m.bundle_id, m.path, m.kind])],
                   [true, pin, [[F, "bundle.md", "bundle"]]]);
  assert.deepEqual(Object.keys(v.matches[0]).sort(), ["bundle_id", "kind", "path", "published"]);
  const doc = w.row(`SELECT doc_sha FROM case_documents`).doc_sha;
  assert.deepEqual(w.pr.verifySha(doc).matches.map((m) => [m.bundle_id, m.path, m.kind]),
                   [["CASE-2026-0001", "case-document-edition-1.md", "case_document"]]);
  assert.deepEqual(w.pr.verifySha("0".repeat(64)), { published: false, sha256: "0".repeat(64), matches: [] });
});

test("R2 publishedList and publishedEditions name every edition with its signer, deliverer and gate version, and every case a finding serves", () => {
  const { w } = published();
  const list = w.read("publishedlist");
  assert.deepEqual(list.bundles.map((b) => [b.bundle_id, b.edition, b.attestor_member, b.gate_version, b.case_id]),
                   [[F, 1, "olive", "plane-gate/test", "CASE-2026-0001"]]);
  assert.deepEqual(list.bundles[0].delivered_by, { kind: "member", member: "olive" });
  assert.deepEqual(list.bundles[0].cases, [{ case_id: "CASE-2026-0001", edition: 1 }]);
  assert.deepEqual(list.cases.map((c) => [c.case_id, c.edition, c.findings]), [["CASE-2026-0001", 1, [F]]]);
  assert.equal(w.read("publishededitions", {}).reason, "NO_ID");
  const eds = w.read("publishededitions", { id: F });
  assert.deepEqual(eds.editions.map((e) => [e.edition, e.case_id, e.case_edition, e.scope, e.bias_acknowledgement,
                                            e.attestor_member, e.gate_version, e.delivered_by.kind]),
                   [[1, "CASE-2026-0001", 1, "The question.", "none declared", "olive", "plane-gate/test", "member"]]);
  /* a finding two cases pin: every case named, the scalar null */
  const { w: w2, proj, pin } = published();
  w2.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w2.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "supporting" }] });
  const b = w2.pr.publishedList().bundles[0];
  assert.deepEqual([b.case_id, b.case_edition, b.cases.map((c) => c.case_id)], [null, null, ["CASE-2026-0001", "CASE-2026-0002"]]);
  const e2 = w2.pr.publishedEditions(F).editions[0];
  assert.deepEqual([e2.case_id, e2.scope, e2.cases.length], [null, null, 2]);
});

test("R3 publishedCase resolves by case, by finding and by hash, and answers the case edition whole, with no case-level strength", () => {
  const { w, pin } = published();
  const byCase = w.read("publishedcase", { id: "CASE-2026-0001" });
  const byFinding = w.read("publishedcase", { id: F });
  const byHash = w.read("publishedcase", { sha256: pin });
  for (const c of [byCase, byFinding, byHash]) {
    assert.equal(c.ok, true);
    assert.deepEqual([c.caseId, c.edition, c.scope, c.bias_acknowledgement, c.complete, c.awaiting],
                     ["CASE-2026-0001", 1, "The question.", "none declared", true, []]);
    assert.equal("strength" in c, false, "no case-level strength (R11)");
    assert.deepEqual(c.findings.map((f) => [f.bundle_id, f.version_sha, f.role, f.frozen_from]),
                     [[F, pin, "load_bearing", "case_document"]]);
    assert.deepEqual(c.findings[0].strength.map((s) => [s.axis, s.grade]), [["capture", "B"], ["connection", "C"]]);
    assert.match(c.findings[0].case_excludes, /Nothing else\./);
    assert.deepEqual(c.findings[0].serves.map((s) => s.to), [], "DOC is not published: not served");
    assert.deepEqual(c.findings[0].unresolved, [], "a serve edge to an unpublished target was dropped at the write");
    assert.deepEqual(c.editions, [1]);
    assert.equal(c.document.attestor.member, "olive", "D-712: the signed case document is served");
    assert.deepEqual(Object.keys(c.completeness).sort(), ["author", "statement"]);
    assert.ok("manifest" in c && "files" in c && "evidence_package" in c);
    assert.equal(c.tensions, null, "a /4 document predates the disclosure (R13)");
    assert.equal(c.captures, null);
  }
  assert.equal(byFinding.asked, F);
  assert.equal(byCase.asked, undefined);
  const none = w.read("publishedcase", { id: "NOPE" });
  assert.deepEqual([none.ok, none.reason, none.code, none.check, none.translation],
                   [false, "NOT_PUBLISHED", "NOT_PUBLISHED", "C-98.8", rowOf("NOT_PUBLISHED").translation]);
  /* a finding several cases pin is refused, naming them (C-44.2), unless the reader names the case */
  const { w: w2, proj, pin: pin2 } = published();
  w2.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin2 }] });
  w2.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin2 }] });
  const amb = w2.read("publishedcase", { id: F });
  assert.deepEqual([amb.reason, amb.code, amb.check, amb.translation, amb.cases],
                   ["FINDING_IN_SEVERAL_CASES", "FINDING_IN_SEVERAL_CASES", "C-44.2", rowOf("FINDING_IN_SEVERAL_CASES").translation,
                    ["CASE-2026-0001", "CASE-2026-0002"]]);
  assert.equal(w2.read("publishedcase", { sha256: pin2 }).reason, "FINDING_IN_SEVERAL_CASES");
  assert.equal(w2.read("publishedcase", { id: F, caseId: "CASE-2026-0002" }).caseId, "CASE-2026-0002");
  /* a ratified bundle in no case answers as what it is: no case identity, no scope, no case document */
  const { w: w3 } = published();
  w3.signFinding(DOC, { sig: SIG(7) });
  const loose = w3.read("publishedcase", { id: DOC });
  assert.deepEqual([loose.ok, loose.caseId, loose.scope, loose.completeness, loose.document, loose.project, loose.bar],
                   [true, null, null, null, null, null, null]);
  /* and once DOC is published, F's serve edge is served, naming the edition and the case it sits in (none) */
  const served = w3.pr.publishedCase({ id: "CASE-2026-0001" }).findings[0].serves;
  assert.deepEqual(served.map((s) => [s.to, s.kind, s.edition, s.case_id, s.cases]), [[DOC, "cites", 1, null, []]]);
});

test("R3 a serve edge with no published edition behind it is reported in `unresolved`, never dropped and never served", () => {
  const { w } = published();
  w.signFinding(DOC, { sig: SIG(7) });
  assert.deepEqual(w.pr.publishedCase({ id: "CASE-2026-0001" }).findings[0].serves.map((s) => s.to), [DOC]);
  /* the target published and later purged: the edge stays, nothing stands behind it */
  w.st.sql.exec(`DELETE FROM published_bundles WHERE bundle_id=?`, DOC);
  const f = w.pr.publishedCase({ id: "CASE-2026-0001" }).findings[0];
  assert.deepEqual([f.serves, f.unresolved], [[], [{ to: DOC, kind: "cites" }]]);
  assert.match(w.pr.publishedCase({ id: "CASE-2026-0001" }).graph_detail, /unresolved\[\] is an edge/);
});

test("R4 publishedManifest serves the whole projection; where ratified documents pinning one sha freeze different pairs the row says CASES_DISAGREE", () => {
  const { w, proj, pin } = published();
  const agreeing = w.read("publishedmanifest");
  assert.equal(agreeing.ok, true);
  assert.equal(agreeing.scope, "published");
  assert.equal(agreeing.published.length, 1);
  assert.equal("strengthByCase" in agreeing.published[0], false, "an agreeing row is unchanged");
  assert.deepEqual(agreeing.published[0].strength.map((s) => s.grade), ["B", "C"]);
  for (const c of agreeing.cases) assert.equal("strength" in c, false, "no case row carries a strength");
  assert.deepEqual(agreeing.caseMembers.map((m) => [m.case_id, m.edition, m.bundle_id, m.version_sha, m.role]),
                   [["CASE-2026-0001", 1, F, pin, "load_bearing"]]);
  assert.deepEqual(agreeing.shas.map((s) => s.bundle_id).sort(), ["CASE-2026-0001", F]);
  /* a second case reads the same bytes at another pair */
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }],
                                   strength: [{ target: F, axis: "capture", grade: "D" }] });
  w.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const row = w.pr.publishedManifest().published[0];
  assert.deepEqual([row.strength, row.strengthUndetermined], [null, "CASES_DISAGREE"]);
  assert.deepEqual(row.strengthByCase.map((c) => [c.case_id, c.edition, c.strength.map((s) => s.grade)]),
                   [["CASE-2026-0001", 1, ["B", "C"]], ["CASE-2026-0002", 1, ["D"]]]);
});

test("R8 one evidence-package block, filled once, computed at the read beside the case; with none, the package says it carries none", () => {
  const { w } = published();
  const none = w.pr.publishedCase({ id: "CASE-2026-0001" }).evidence_package;
  assert.deepEqual(none.blocks, {});
  assert.match(none.detail, /carries none/);
  assert.equal(w.pr.registerEvidenceBlock("filings", "Bad Name", () => 1).reason, "PROVIDER_MALFORMED");
  assert.equal(w.pr.registerEvidenceBlock("", "x", () => 1).reason, "PROVIDER_MALFORMED");
  assert.equal(w.pr.registerEvidenceBlock("filings", "x", null).reason, "PROVIDER_MALFORMED");
  let calls = 0;
  assert.deepEqual(w.pr.registerEvidenceBlock("filings", "available_actions",
    ({ caseId, edition, findings }) => { calls++; return { caseId, edition, findings }; }), { ok: true, module: "filings", name: "available_actions" });
  assert.equal(w.pr.registerEvidenceBlock("other", "x", () => 1).reason, "PROVIDER_DECLARED");
  const pkg = w.pr.publishedCase({ id: "CASE-2026-0001" }).evidence_package;
  assert.deepEqual(pkg.blocks, { available_actions: { caseId: "CASE-2026-0001", edition: 1, findings: [F] } });
  w.pr.publishedCase({ id: "CASE-2026-0001" });
  assert.equal(calls, 2, "computed at each read, never stored");
  assert.equal(JSON.stringify(w.snapshot(PUBLISHED)).includes("available_actions"), false, "nothing enters the case's bytes");
  /* a block that throws is stated as unavailable, never as absent */
  const { w: w2 } = published();
  w2.pr.registerEvidenceBlock("filings", "available_actions", () => { throw new Error("down"); });
  const bad = w2.pr.publishedCase({ id: "CASE-2026-0001" }).evidence_package.blocks.available_actions;
  assert.deepEqual([bad.unavailable, /down/.test(bad.detail)], [true, true]);
});

test("R10 R14 the public read path needs no credential and reads the published projection only: working material answers byte-identically to nothing", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  const fresh = world();
  for (const [op, q] of READS) {
    const a = w.read(op, q(pin)), b = fresh.read(op, q(pin));
    assert.deepEqual(a, b, `${op} ${JSON.stringify(q(pin))} answers as if nothing were there`);
    assert.equal(JSON.stringify(a), JSON.stringify(b), `${op}: the same bytes`);
  }
  /* an unpublished hash answers as a never-existed one, byte for byte */
  assert.equal(JSON.stringify(w.pr.verifySha(pin).matches), JSON.stringify(w.pr.verifySha("f".repeat(64)).matches));
  const unpublished = w.pr.publishedCase({ sha256: pin }), never = w.pr.publishedCase({ sha256: "f".repeat(64) });
  assert.equal(JSON.stringify(unpublished), JSON.stringify(never));
  /* no op takes a credential or a stamp: the op map reads only its keys */
  const url = new URL("http://do/verify?sha256=" + pin + "&viewer=member:olive&token=x");
  assert.deepEqual(publicReadOps(w.pr, url).verify(), fresh.pr.verifySha(pin));
});

test("R11 no answer, document or row this module serves composes a case-level strength: every pair is per member and per axis", () => {
  const { w } = published();
  const c = w.pr.publishedCase({ id: "CASE-2026-0001" });
  assert.equal("strength" in c, false);
  assert.equal("strength" in c.document, false);
  for (const f of c.findings) assert.ok(Array.isArray(f.strength) && f.strength.every((s) => s.axis));
  for (const row of w.pr.publishedManifest().cases) assert.equal("strength" in row, false);
  for (const row of w.pr.publishedList().cases) assert.equal("strength" in row, false);
  for (const row of w.pr.publishedManifest().published) assert.ok(row.strength === null || row.strength.every((s) => s.axis));
  assert.match(w.pr.publishedManifest().altitudes, /no strength/);
});

test("R12 signer and deliverer are two facts, and neither is copied from the other", () => {
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
  const row = w.pr.publishedList().bundles[0];
  assert.equal(row.attestor_member, "olive");
  assert.equal(row.delivered_by.kind, "undetermined", "a deliverer never recorded is not read off the signer");
  const ed = w.pr.publishedEditions(F).editions[0];
  assert.deepEqual([ed.attestor_member, ed.delivered_by.kind], ["olive", "undetermined"]);
  const f = w.pr.publishedCase({ id: "CASE-2026-0001" }).findings[0];
  assert.deepEqual([f.attestor.member, f.delivered_by.kind], ["olive", "undetermined"]);
});

test("R13 undetermined is stated and never filled: a deliverer, an acknowledgement list a document is silent about, the tensions of a document before /5", () => {
  const { w } = published();
  w.st.sql.exec(`UPDATE published_bundles SET delivered_by=NULL`);
  const c = w.pr.publishedCase({ id: "CASE-2026-0001" });
  assert.deepEqual(c.findings[0].delivered_by, { kind: "undetermined", member: null, detail: DELIVERER_UNDETERMINED_DETAIL });
  assert.equal(c.tensions, null);
  assert.equal(typeof c.tensions_detail, "string");
  const w2 = world();
  w2.member("olive");
  const proj = w2.project("Parks", "olive");
  w2.inquiry(F);
  const pin = w2.head(F);
  w2.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }], format: "bio-case-document/2" });
  w2.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }],
                                     completeness: { statement: "s", acknowledgements: null } });
  w2.signFinding(F);
  assert.equal(w2.pr.publishedCase({ id: "CASE-2026-0001" }).completeness.acknowledgements, null, "silent stays null, never []");
  assert.equal(w2.pr.publishedEditions(F).editions[0].completeness.acknowledgements, null);
});

test("R15 no place is named in this module's behaviour or outward text", () => {
  const { w } = published();
  const outward = JSON.stringify([w.read("publishedcase", { id: "CASE-2026-0001" }), w.read("publishedmanifest"),
    w.read("publishedlist"), w.read("publishededitions", { id: F }), w.read("publishedcase", { id: "X" }),
    w.read("verify", { sha256: "0".repeat(64) }), w.read("publishededitions", {}),
    w.pr.publishedCase({ id: "CASE-2026-0001" }).evidence_package,
    { ...CASE_RESOLUTION_CHECKS, ...PUBLISHED_STORE_CHECKS, ...PUBLISHED_READ_CHECKS }]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});

test("R16 it owns no table and writes nothing: every read leaves the database byte-identical, and it is one instance per host", async () => {
  const { w, pin } = published();
  const before = JSON.stringify(w.snapshot());
  const tables = w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name);
  for (const [op, q] of READS) w.read(op, q(pin));
  w.pr.publishedCase({ sha256: pin });
  w.pr.publishedCase({ id: "NOPE" });
  assert.equal(JSON.stringify(w.snapshot()), before, "no read writes");
  const pr2 = publicReadOf(w.host);
  assert.equal(pr2, w.pr, "one instance per host (K61)");
  assert.ok(pr2 instanceof PublicRead);
  assert.deepEqual(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name), tables,
                   "creating it created no table");
  /* the one write on its path is publication's: caseEditionState's ratified_at stamp (publication R53) */
  const w2 = world();
  w2.member("olive");
  const proj = w2.project("Parks", "olive");
  w2.inquiry(F);
  const pin2 = w2.head(F);
  w2.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin2 }] });
  w2.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin2 }] });
  w2.signFinding(F);
  const seen = [];
  const spy = new Proxy(w2.p, { get(t, k) { const v = t[k]; if (typeof v !== "function") return v;
    return (...a) => { seen.push(String(k)); return v.apply(t, a); }; } });
  const askedDocket = [];
  const docketSpy = new Proxy(w2.docket, { get(t, k) { const v = t[k]; if (typeof v !== "function") return v;
    return (...a) => { askedDocket.push(String(k)); return v.apply(t, a); }; } });
  const r = new PublicRead({ storage: w2.st, publication: spy, docket: docketSpy });
  r.publishedCase({ id: "CASE-2026-0001" }); r.publishedList(); r.publishedEditions(F); r.publishedManifest();
  await r.docketPublic("CASE-2026-0001"); await r.docketFeed("CASE-2026-0001");
  assert.deepEqual([...new Set(seen)].sort().filter((m) => !["caseDocMemberFrozen", "caseEditionState", "soleCase"].includes(m)), [],
                   "it reaches publication only through R53–R55");
  /* N520: and `docket` only through the services named in Uses (its R12, R14, R15) */
  assert.deepEqual([...new Set(askedDocket)].sort(), ["docketFeed", "docketPublic", "lastEntryOf", "withdrawalOf"],
                   "it reaches docket only through withdrawalOf, lastEntryOf, docketPublic and docketFeed");
});
