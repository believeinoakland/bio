/* provenance: what the old suites `provenance-chain.test.mjs` (REC-54 / D-200) and `provenance-marker.test.mjs`
   (REC-63 / DEC-56) proved that the other module tests do not, carried to the module's interface: C-18.9's three
   chain findings in their own words and repairs, and its silence below `verified` (R46); a co-archive never a hop, the
   reconstruction stamp, a register clean for C-18.9 once its chain is applied, and a witnessed chain left byte for
   byte (R19, R20); the route mark's sentences, its `recorded` outcome, a later PRESENT ending the standing mark
   (R22, R23); purge taking a bundle's marks (R41); and every C-34 refusal carrying its row (R22).
   Not carried: `op=release`'s entry requirements (the legacy store's), and `op=list`, `op=audit` and `op=stats`'s
   route reads (the legacy store's and the control plane's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, provDoc, infoMd } from "./fixture.mjs";
import { registerChecks, chainFromEvidence, routeFinding, ROUTE_MARK_NOTE } from "../../../src/provenance/index.mjs";
import { ROUTE_MARK_CHECKS } from "../../../src/provenance/checks.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";

const cap = { path: "snapshots/a.txt", text: "bytes of a" };
/* The register's C-18.9 findings over one document, at `state`. */
const c189 = (doc, state = "verified") => {
  const md = infoMd("INFO-2026-0001-x", { state });
  return registerChecks({ files: new Map([["bundle.md", md], ["data/provenance.json", JSON.stringify({ documents: [doc] })],
                                          [cap.path, cap.text]]), fm: parseFrontmatter(md).data })
    .filter((x) => x.check === "C-18.9");
};
/* A document with no route recorded at all (the old suite's NO_EVIDENCE). */
const noEvidence = { file: cap.path, locator: "", authority_state: "undetermined",
                     authority_basis: "nothing was established; recorded 2026-08-05T00:00:00Z", capture: { grade: "C" } };

test("R46: C-18.9's absent, not-an-array and empty chain findings each say which fact it is, and the empty one's repair never assumes a route", () => {
  const good = provDoc(cap);
  const absent = c189(good), notArray = c189({ ...good, provenance_chain: null }), empty = c189({ ...good, provenance_chain: [] });
  for (const f of [absent, notArray, empty]) assert.equal(f.length, 1, JSON.stringify(f));
  const [a, n, e] = [absent[0], notArray[0], empty[0]];
  assert.equal(new Set([a.message, n.message, e.message]).size, 3, "the three no longer read alike");
  assert.match(a.message, /records no provenance_chain at all/);
  assert.match(n.message, /provenance_chain is null, not an array of hops: whatever wrote this did not write a chain/);
  assert.match(c189({ ...good, provenance_chain: "x" })[0].message, /provenance_chain is string, not an array of hops/);
  assert.match(e.message, /records an EMPTY provenance_chain/);
  assert.match(e.message, /different fact from never having recorded one and must not be repaired by assuming a route/);
  /* The repairs, each finding its own. */
  assert.deepEqual(a.repairs, ["record the chain of custody for this capture, one hop per party, from us back to the source",
    "or, where the capture record already holds the route, derive it from that evidence with op=provenancechain"]);
  assert.deepEqual(n.repairs, ["record the chain of custody as an array of hops, one per party, from us back to the source"]);
  assert.deepEqual(e.repairs, ["name the parties that actually served these bytes, one hop each",
    "or state plainly that the route is undetermined rather than leaving an empty chain standing at verified"]);
  assert.equal(e.repairs.some((r) => /undetermined/.test(r)), true, "the empty case's repair states undetermined");
  /* Nothing weakened beside it: an unattributed hop is still refused, a named one passes. */
  assert.match(c189({ ...good, provenance_chain: [{ asserts: "y", bound: false }] })[0].message, /names no attestor/);
  assert.deepEqual(c189({ ...good, provenance_chain: [{ who: "instance x", asserts: "y", bound: false, via: "direct" }] }), []);
});

test("R46: below verified, no chain, an empty chain and no route recorded at all each draw nothing", () => {
  const good = provDoc(cap);
  for (const doc of [good, { ...good, provenance_chain: [] }, { ...good, provenance_chain: null }, noEvidence])
    assert.deepEqual(c189(doc, "collected"), [], JSON.stringify(doc));
  /* The same documents at verified are each found, so the silence is the fence's, not a check that finds nothing. */
  for (const doc of [good, { ...good, provenance_chain: [] }, { ...good, provenance_chain: null }, noEvidence])
    assert.equal(c189(doc, "verified").some((x) => /provenance_chain/.test(x.message)), true, JSON.stringify(doc));
});

test("R19: a co-archive is never a hop, and every derived hop is stamped reconstructed by the rebuild, naming its fields", () => {
  const archive = "https://web.archive.org/web/20260719192109/https://example.org/snapshots/a.txt";
  const doc = provDoc(cap, { co_archive: archive });
  const r = chainFromEvidence(doc, { instanceName: "civic", at: "2026-09-27T00:00:00Z" });
  assert.equal(r.ok, true);
  assert.equal(r.hops.length, 1, "a direct fetch is one hop, whatever else the entry records");
  assert.equal(JSON.stringify(r.hops).includes("web.archive.org"), false);
  assert.equal(r.hops[0].via, "direct");
  /* The same with the co-archive as `{service, locator}`. */
  const r2 = chainFromEvidence(provDoc(cap, { co_archive: { service: "archive.org", locator: archive } }));
  assert.deepEqual([r2.hops.length, JSON.stringify(r2.hops).includes("archive.org")], [1, false]);
  /* The stamp on every arm: by, basis, at, from. */
  const custody = chainFromEvidence({ locator: "in hand", capture: { sha256: sha("m") },
                                      custody: { holder: "ruth", obtained: "2026-08-01T00:00:00Z" } }, { at: "2026-09-27T00:00:00Z" });
  for (const h of [r.hops[0], custody.hops[0]]) {
    assert.equal(h.reconstructed.by, "op=provenancechain (REC-54)");
    assert.equal(h.reconstructed.basis,
      "derived from fields the capture record already held; no fact is asserted that the register did not carry");
    assert.equal(h.reconstructed.at, "2026-09-27T00:00:00Z");
    assert.ok(Array.isArray(h.reconstructed.from) && h.reconstructed.from.length);
  }
  assert.equal(custody.hops[0].asserts, "this member held these bytes and supplied them to the record at 2026-08-01T00:00:00Z");
});

test("R19, R20, R46: applying the rebuild to a verified register writes one hop per direct document, the co-archive untouched, and leaves it clean for C-18.9", () => {
  const w = world();
  const id = "INFO-2026-0001-x";
  const archive = "https://web.archive.org/web/20260719192109/https://example.org/snapshots/a.txt";
  /* Held as history (a replay), as the ten live bundles D-200 found at verified with no chain are. */
  const held = w.promoteInfo(id, { captures: [cap], state: "verified", docs: [provDoc(cap, { co_archive: archive })], pkg: { replay: true } });
  assert.equal(held.ok, true, JSON.stringify(held));
  const findingsOf = () => {
    const img = w.record.readImage(id);
    return registerChecks({ files: new Map(Object.entries(img)), fm: parseFrontmatter(img["bundle.md"]).data })
      .filter((x) => x.check === "C-18.9");
  };
  assert.deepEqual(findingsOf().map((x) => x.code), ["chain-absent"], "the held register is found before the rebuild");
  const applied = w.prov.provenanceChainRebuild({ bundleId: id, apply: true, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([applied.ok, applied.applied, applied.changed], [true, true, 1], JSON.stringify(applied));
  const doc = JSON.parse(w.record.readFile(id, "data/provenance.json").text).documents[0];
  assert.equal(doc.provenance_chain.length, 1);
  assert.equal(JSON.stringify(doc.provenance_chain).includes("web.archive.org"), false, "the co-archive did not become a hop");
  assert.equal(doc.co_archive, archive, "the co-archive is still recorded on the document, untouched");
  const h = doc.provenance_chain[0];
  assert.match(h.who, /^instance test-instance /);
  assert.equal(h.asserts, `these bytes were served for https://example.org/${cap.path} at 2026-09-27T00:00:00Z`);
  assert.equal(h.bound, false);
  assert.equal(h.reconstructed.by, "op=provenancechain (REC-54)");
  assert.equal(h.reconstructed.from.includes("locator") && h.reconstructed.from.includes("retrieved"), true);
  assert.deepEqual(findingsOf(), [], "C-18.9 is satisfied afterwards");
});

test("R20: a witnessed chain survives an applied rebuild byte for byte", () => {
  const w = world();
  const id = "INFO-2026-0002-w";
  const b = { path: "snapshots/b.txt", text: "bytes of b" };
  const witnessed = [{ who: "Internet Archive Wayback Machine", asserts: "served the replay", evidence: "CDX record",
                       bound: false, via: "archive.org" }];
  /* Beside it a document with no chain, so an apply does write: the witnessed one must be carried, not rebuilt. */
  const r0 = w.promoteInfo(id, { captures: [cap, b], docs: [provDoc(cap, { provenance_chain: witnessed }), provDoc(b)] });
  assert.equal(r0.ok, true, JSON.stringify(r0));
  const before = JSON.parse(w.record.readFile(id, "data/provenance.json").text).documents[0];
  const r = w.prov.provenanceChainRebuild({ bundleId: id, apply: true, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([r.ok, r.applied, r.documents.map((d) => d.outcome)], [true, true, ["already_recorded", "reconstructed"]], JSON.stringify(r));
  const after = JSON.parse(w.record.readFile(id, "data/provenance.json").text).documents[0];
  assert.equal(JSON.stringify(after), JSON.stringify(before), "the witnessed document is carried byte for byte");
  assert.deepEqual(after.provenance_chain, witnessed);
  /* A register whose every document is already recorded: nothing applied, not a byte moved. */
  const w2 = world();
  w2.promoteInfo(id, { captures: [cap], docs: [provDoc(cap, { provenance_chain: witnessed })] });
  const sha0 = w2.record.readFile(id, "data/provenance.json").sha256, head0 = w2.head(id);
  const r2 = w2.prov.provenanceChainRebuild({ bundleId: id, apply: true, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([r2.applied, r2.changed, r2.documents[0].outcome], [false, 0, "already_recorded"]);
  assert.equal(w2.record.readFile(id, "data/provenance.json").sha256, sha0);
  assert.deepEqual(w2.head(id), head0);
});

test("R22, R23: the route's sentences: never looked is not a finding, a mark says the state and finding disagree on purpose, PRESENT says every route shows", () => {
  const never = routeFinding("information", null);
  assert.equal(never.note, "no assessment of this document's route has ever been recorded. This is NOT a finding "
    + "that the route cannot be shown; it is the absence of the question having been asked.");
  assert.equal(routeFinding("inquiry", null).note, "a route is a fact about a captured document, and this bundle is not one");
  assert.match(ROUTE_MARK_NOTE, /this document stays where the group put it/);
  assert.match(ROUTE_MARK_NOTE, /corrects FORWARD rather than un-saying one \(DEC-19\)/);
  assert.match(ROUTE_MARK_NOTE, /The state and this finding disagree deliberately, and neither is a defect in the other/);
  /* Carried by the reads, at verified: the mark records the state it was made at; bytes and state do not move. */
  const w = world();
  const id = "INFO-2026-0001-n";
  const held = w.promoteInfo(id, { captures: [cap], state: "verified", docs: [noEvidence], pkg: { replay: true } });
  assert.equal(held.ok, true, JSON.stringify(held));
  assert.equal(w.prov.routeOf(id, "information").note, never.note);
  const head0 = w.head(id), reg0 = w.record.readFile(id, "data/provenance.json").sha256;
  const m = w.prov.provenanceRouteAssess({ bundleId: id, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([m.ok, m.route.finding, m.route.marked, m.route.stateAt, m.route.by], [true, "LOOKED_INDETERMINATE", true, "verified", V("riley")]);
  assert.equal(m.route.note, ROUTE_MARK_NOTE);
  assert.equal(w.prov.routeOf(id, "information").note, ROUTE_MARK_NOTE);
  assert.deepEqual(w.head(id), head0);
  assert.equal(w.record.readFile(id, "data/provenance.json").sha256, reg0, "no chain was invented into the register");
  /* The rebuild's refusal carries the same standing mark. */
  const chain = w.prov.provenanceChainRebuild({ bundleId: id, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([chain.reason, chain.route.marked, chain.route.note], ["EVIDENCE_INSUFFICIENT", true, ROUTE_MARK_NOTE]);
  /* PRESENT. */
  const w2 = world();
  w2.promoteInfo("INFO-2026-0002-p", { captures: [cap] });
  const p = w2.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0002-p", author: V("riley"), viewer: V("riley") });
  assert.deepEqual([p.route.finding, p.route.marked, p.route.note],
                   ["PRESENT", false, "this document's route was assessed and every document in its register can be shown"]);
});

test("R22: a document whose chain is already recorded is outcome `recorded`, and its route shows", () => {
  const w = world();
  const id = "INFO-2026-0001-r";
  const witnessed = [{ who: "Internet Archive Wayback Machine", asserts: "served the replay", evidence: "CDX record",
                       bound: false, via: "archive.org" }];
  /* No route the record could derive: only the recorded chain shows it. */
  const r0 = w.promoteInfo(id, { captures: [cap], docs: [{ ...noEvidence, provenance_chain: witnessed }], pkg: { replay: true } });
  assert.equal(r0.ok, true, JSON.stringify(r0));
  const m = w.prov.provenanceRouteAssess({ bundleId: id, author: V("riley"), viewer: V("riley") });
  assert.equal(m.route.finding, "PRESENT");
  assert.deepEqual(m.documents, [{ index: 0, file: cap.path, outcome: "recorded", hops: 1 }]);
});

test("R22, R23: a later PRESENT ends the standing mark, appended after it, the earlier mark still readable", () => {
  const w = world();
  const id = "INFO-2026-0001-x";
  const a = w.cap("a"), b = w.cap("b");
  assert.equal(w.promoteInfo(id, { captures: [a, b], docs: [provDoc(a), { ...provDoc(b), locator: "in hand" }] }).ok, true);
  const m1 = w.prov.provenanceRouteAssess({ bundleId: id, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([m1.route.finding, m1.route.seq], ["LOOKED_INDETERMINATE", 1]);
  assert.deepEqual(w.prov.provenanceRoutesMarked({ viewer: V("x") }).documents.map((d) => d.bundleId), [id]);
  /* A member records the route the register was missing. */
  const rev = w.promoteInfo(id, { captures: [a, b], docs: [provDoc(a), provDoc(b)], base: w.head(id).bundleSha });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  const m2 = w.prov.provenanceRouteAssess({ bundleId: id, author: V("sam"), viewer: V("sam") });
  assert.deepEqual([m2.appended, m2.route.finding, m2.route.marked, m2.route.seq], [true, "PRESENT", false, 2]);
  const now = w.prov.routeOf(id, "information");
  assert.deepEqual([now.finding, now.marked, now.seq], ["PRESENT", false, 2]);
  const roster = w.prov.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual([roster.documents.length, roster.cause, roster.census.marked, roster.census.standing],
                   [0, "none_standing", 0, { PRESENT: 1 }]);
  /* Correction moves forward: the mark that stood is still there, not deleted or edited. */
  assert.deepEqual(w.rows(`SELECT seq, finding, by FROM provenance_route_marks WHERE bundle_id=? ORDER BY seq`, id).map((r) => ({ ...r })),
                   [{ seq: 1, finding: "LOOKED_INDETERMINATE", by: V("riley") }, { seq: 2, finding: "PRESENT", by: V("sam") }]);
});

test("R41: purging one bundle removes its route marks and leaves another bundle's; the id later reused starts never looked", () => {
  const w = world();
  const a = w.cap("a"), b = w.cap("b");
  for (const [id, c] of [["INFO-2026-0001-a", a], ["INFO-2026-0002-b", b]]) {
    assert.equal(w.promoteInfo(id, { captures: [c], docs: [{ ...provDoc(c), locator: "in hand" }] }).ok, true);
    w.prov.provenanceRouteAssess({ bundleId: id, author: V("riley"), viewer: V("riley") });
  }
  /* Two marks on the first, so "its marks" is more than one row. */
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], docs: [provDoc(a)], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  w.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0001-a", author: V("riley"), viewer: V("riley") });
  const marks = (id) => w.rows(`SELECT COUNT(*) AS n FROM provenance_route_marks WHERE bundle_id=?`, id)[0].n;
  assert.deepEqual([marks("INFO-2026-0001-a"), marks("INFO-2026-0002-b")], [2, 1]);
  const p = w.record.purge({ bundleId: "INFO-2026-0001-a" });
  assert.deepEqual([p.ok, p.scope, p.removed.provenance_route_marks], [true, "INFO-2026-0001-a", 2]);
  assert.deepEqual([marks("INFO-2026-0001-a"), marks("INFO-2026-0002-b")], [0, 1]);
  assert.equal(w.prov.routeOf("INFO-2026-0002-b", "information").finding, "LOOKED_INDETERMINATE", "the other bundle's mark stands");
  /* A document later filed under the purged id inherits no doubt. */
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [w.cap("a2")] }).ok, true);
  const reborn = w.prov.routeOf("INFO-2026-0001-a", "information");
  assert.deepEqual([reborn.finding, reborn.assessed, reborn.marked], ["NEVER_LOOKED", false, false]);
});

test("R22: every C-34 refusal carries its row's check and translation, and every row is reached", () => {
  const w = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-x", { captures: [a] });
  w.record.transact(() => w.record.commit({ bundleId: "INQ-2026-0001-q", type: "inquiry", title: "Q", project: null,
    snapKey: "q", kind: "promotion", base: "", author: V("ruth"), writer: null, operation: null,
    files: [{ path: "bundle.md", text: "---\nid: INQ-2026-0001-q\n---\n", sha256: sha("---\nid: INQ-2026-0001-q\n---\n"), bytes: 23 }],
    state: "open", priorState: null, group: "test-group", created: "2026-09-27T00:00:00Z",
    lastUpdated: "2026-09-27T00:00:00Z", criticality: null, at: "2026-09-27T00:00:00Z" }));
  const ask = (args) => w.prov.provenanceRouteAssess({ author: V("ruth"), viewer: V("ruth"), bundleId: "INFO-2026-0001-x", ...args });
  const cases = [
    ["ROUTE_MARK_NO_AUTHOR", ask({ author: "" })],
    ["ROUTE_MARK_NO_AUTHOR", ask({ author: null })],
    ["ROUTE_MARK_NO_AUTHOR", ask({ author: "token:member" })],
    ["ROUTE_MARK_NO_BUNDLE", ask({ bundleId: "" })],
    ["ROUTE_MARK_NO_SUCH_BUNDLE", ask({ bundleId: "INFO-2026-0404-none" })],
    ["ROUTE_MARK_NO_SUCH_BUNDLE", ask({ viewer: "stranger" })],
    ["ROUTE_MARK_NOT_A_DOCUMENT", ask({ bundleId: "INQ-2026-0001-q" })],
  ];
  for (const [code, r] of cases) {
    assert.equal(r.ok, false, code);
    assert.equal(r.reason, code);
    assert.equal(r.check, ROUTE_MARK_CHECKS[code].check, code);
    assert.equal(r.translation, ROUTE_MARK_CHECKS[code].translation, code);
  }
  assert.deepEqual([...new Set(cases.map(([c]) => c))].sort(), Object.keys(ROUTE_MARK_CHECKS).sort(), "every row is reached");
  /* The rows themselves: C-34.1–C-34.4, each a translation in words, never the machine code. */
  assert.deepEqual(Object.keys(ROUTE_MARK_CHECKS).map((c) => ROUTE_MARK_CHECKS[c].check).sort(), ["C-34.1", "C-34.2", "C-34.3", "C-34.4"]);
  for (const [c, row] of Object.entries(ROUTE_MARK_CHECKS)) {
    assert.ok(typeof row.translation === "string" && row.translation.split(/\s+/).length >= 8, c);
    assert.equal(row.translation.includes(c), false, c);
  }
  /* Each refusal says which it is: no principal names nobody; a machine credential is nobody's name. */
  assert.match(cases[0][1].detail, /is a named act/);
  assert.match(cases[2][1].detail, /is a machine credential/);
  assert.equal(w.count("provenance_route_marks"), 0, "no refusal appended a mark");
});
