/* provenance-routes: a member's route assessment (R4), and undetermined stated, never rounded (R11). Moved from
   `test/m/provenance/chain-route.test.mjs` and `convert-chain-marker.test.mjs` by N512 (provenance R22, R37's route
   clause), their assertions unchanged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc, infoMd } from "./fixture.mjs";
import { ROUTE_MARK_NOTE, ROUTE_MARK_CHECKS } from "../../../src/provenance-routes/index.mjs";

function twoDocs(w, id, { secondRouted = false } = {}) {
  const a = w.cap(`${id}-a`), b = w.cap(`${id}-b`);
  const docs = [provDoc(a), { ...provDoc(b), ...(secondRouted ? {} : { locator: "in hand" }) }];
  assert.equal(w.promoteInfo(id, { captures: [a, b], docs }).ok, true);
  return { a, b };
}

test("R4: a member's route assessment, marked only when it changes, never moving the bundle", () => {
  const w = world({ now: "2026-09-27T03:00:00.123Z" });
  twoDocs(w, "INFO-2026-0001-x");
  const head0 = w.head("INFO-2026-0001-x");
  const files0 = w.record.readImage("INFO-2026-0001-x");
  const r = (args) => w.routes.provenanceRouteAssess({ author: V("ruth"), viewer: V("ruth"), ...args });
  const m1 = r({ bundleId: "INFO-2026-0001-x" });
  assert.deepEqual([m1.ok, m1.bundleId, m1.appended], [true, "INFO-2026-0001-x", true]);
  assert.equal(m1.route.finding, "LOOKED_INDETERMINATE");
  assert.equal(m1.route.note, ROUTE_MARK_NOTE);
  assert.deepEqual(m1.documents.map((d) => d.outcome), ["derivable", "undetermined"]);
  assert.ok(m1.documents[1].missing.length, "the undetermined document says what is missing");
  assert.deepEqual([m1.route.stateAt, m1.route.by, m1.route.seq, m1.route.at], ["collected", V("ruth"), 1, "2026-09-27T03:00:00Z"]);
  assert.match(m1.detail, /Its state has NOT moved/);
  assert.deepEqual(w.head("INFO-2026-0001-x"), head0, "state and bytes never move");
  assert.deepEqual(w.record.readImage("INFO-2026-0001-x"), files0);
  const m2 = r({ bundleId: "INFO-2026-0001-x" });
  assert.equal(m2.appended, false, "the same finding appends nothing");
  assert.match(m2.detail, /nothing was appended/);
  assert.equal(w.count("provenance_route_marks"), 1);
  /* A different member finding the same thing appends nothing either: the mark records what was found. */
  assert.equal(r({ bundleId: "INFO-2026-0001-x", author: V("sam") }).appended, false);
  /* Refusals, each with its row. */
  const no = r({ author: "", bundleId: "INFO-2026-0001-x" });
  assert.deepEqual([no.reason, no.check], ["ROUTE_MARK_NO_AUTHOR", "C-34.1"]);
  const machine = r({ author: "token:member", bundleId: "INFO-2026-0001-x" });
  assert.deepEqual([machine.reason, machine.check], ["ROUTE_MARK_NO_AUTHOR", "C-34.1"], "REC-158: a machine is nobody's name");
  assert.deepEqual([r({ bundleId: "" }).reason, r({ bundleId: "" }).check], ["ROUTE_MARK_NO_BUNDLE", "C-34.2"]);
  assert.deepEqual([r({ bundleId: "INFO-2026-0404-x" }).reason, r({ bundleId: "INFO-2026-0404-x" }).check], ["ROUTE_MARK_NO_SUCH_BUNDLE", "C-34.3"]);
  const unseen = r({ bundleId: "INFO-2026-0001-x", viewer: "stranger" });
  const absent = r({ bundleId: "INFO-2026-0404-x" });
  assert.deepEqual({ ...unseen, bundleId: null }, { ...absent, bundleId: null }, "absent and unseen alike");
  w.inquiry("INQ-2026-0001-q");
  const q = r({ bundleId: "INQ-2026-0001-q" });
  assert.deepEqual([q.reason, q.check, q.objectType], ["ROUTE_MARK_NOT_A_DOCUMENT", "C-34.4", "inquiry"]);
  assert.equal(w.count("provenance_route_marks"), 1, "no refusal appended a mark");
  /* A later assessment that finds the route shown appends PRESENT. */
  const w3 = world();
  twoDocs(w3, "INFO-2026-0003-y", { secondRouted: true });
  const p = w3.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0003-y", author: V("r"), viewer: V("r") });
  assert.deepEqual([p.route.finding, p.route.marked, p.route.note],
                   ["PRESENT", false, "this document's route was assessed and every document in its register can be shown"]);
  assert.match(p.detail, /every document in this register can show its route/);
});

test("R4: a document whose chain is already recorded is outcome `recorded`, and its route shows", () => {
  const w = world();
  const cap = w.cap("a");
  const witnessed = [{ who: "Internet Archive Wayback Machine", asserts: "served the replay", evidence: "CDX record",
                       bound: false, via: "archive.org" }];
  const doc = { file: cap.path, locator: "", authority_state: "undetermined", authority_basis: "nothing was established",
                capture: { grade: "C" }, provenance_chain: witnessed };
  assert.equal(w.promoteInfo("INFO-2026-0001-r", { captures: [cap], docs: [doc], pkg: { replay: true } }).ok, true);
  const m = w.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0001-r", author: V("riley"), viewer: V("riley") });
  assert.equal(m.route.finding, "PRESENT");
  assert.deepEqual(m.documents, [{ index: 0, file: cap.path, outcome: "recorded", hops: 1 }]);
});

test("R4, R11: every register state is recorded, never refused, and anything undetermined is LOOKED_INDETERMINATE, never rounded", () => {
  const w = world();
  const c = w.cap("c");
  const mk = (id, prov) => w.promotion.promote({ bundleId: id, base: null, snapKey: id, author: "member:alice", replay: true,
    meta: { object_type: "information" }, files: [{ path: "bundle.md", text: infoMd(id) }, { path: c.path, text: c.text },
      ...(prov === null ? [] : [{ path: "data/provenance.json", text: prov }])] });
  const cases = [["INFO-2026-0001-absent", null, "absent"], ["INFO-2026-0002-unparsable", "{x", "unparsable"],
                 ["INFO-2026-0003-nodocs", JSON.stringify({ nope: 1 }), "no_documents"],
                 ["INFO-2026-0004-empty", JSON.stringify({ documents: [] }), "empty"]];
  for (const [id, prov, state] of cases) {
    assert.equal(mk(id, prov).ok, true, id);
    const m = w.routes.provenanceRouteAssess({ bundleId: id, author: V("r"), viewer: V("r") });
    assert.deepEqual([m.ok, m.route.finding, m.route.register, m.route.marked, m.route.documents], [true, "LOOKED_INDETERMINATE", state, true, 0], id);
  }
  /* One document of three undetermined: the bundle's route is undetermined, the count says how many, the per-document
     list says which. Negative control: all three derivable is PRESENT. */
  const w2 = world();
  const [a, b, d] = [w2.cap("a"), w2.cap("b"), w2.cap("d")];
  assert.equal(w2.promoteInfo("INFO-2026-0001-x", { captures: [a, b, d], docs: [provDoc(a), { ...provDoc(b), locator: "in hand" }, provDoc(d)] }).ok, true);
  const m = w2.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0001-x", author: V("r"), viewer: V("r") });
  assert.deepEqual([m.route.finding, m.route.undetermined, m.route.documents, m.documents.map((x) => x.outcome)],
                   ["LOOKED_INDETERMINATE", 1, 3, ["derivable", "undetermined", "derivable"]]);
  assert.notEqual(m.route.finding, "PRESENT");
  assert.notEqual(m.route.finding, "LOOKED_ABSENT", "a route that cannot be shown is never counted absent");
  assert.equal(w2.promoteInfo("INFO-2026-0002-y", { captures: [w2.cap("e")] }).ok, true);
  assert.equal(w2.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0002-y", author: V("r"), viewer: V("r") }).route.finding, "PRESENT");
  /* The rebuild states the same document undetermined, with its reason, rather than inventing a hop for it. */
  const rb = w2.routes.provenanceChainRebuild({ bundleId: "INFO-2026-0001-x", author: V("r"), viewer: V("r") });
  assert.deepEqual([rb.reason, rb.documents[1].outcome], ["EVIDENCE_INSUFFICIENT", "undetermined"]);
  assert.ok(rb.documents[1].missing.length);
});

test("R4, R5: a later PRESENT ends the standing mark, appended after it, the earlier mark still readable", () => {
  const w = world();
  const id = "INFO-2026-0001-x";
  const a = w.cap("a"), b = w.cap("b");
  assert.equal(w.promoteInfo(id, { captures: [a, b], docs: [provDoc(a), { ...provDoc(b), locator: "in hand" }] }).ok, true);
  const m1 = w.routes.provenanceRouteAssess({ bundleId: id, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([m1.route.finding, m1.route.seq], ["LOOKED_INDETERMINATE", 1]);
  assert.deepEqual(w.routes.provenanceRoutesMarked({ viewer: V("x") }).documents.map((d) => d.bundleId), [id]);
  const rev = w.promoteInfo(id, { captures: [a, b], docs: [provDoc(a), provDoc(b)], base: w.head(id).bundleSha });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  const m2 = w.routes.provenanceRouteAssess({ bundleId: id, author: V("sam"), viewer: V("sam") });
  assert.deepEqual([m2.appended, m2.route.finding, m2.route.marked, m2.route.seq], [true, "PRESENT", false, 2]);
  const now = w.routes.routeOf(id, "information");
  assert.deepEqual([now.finding, now.marked, now.seq], ["PRESENT", false, 2]);
  const roster = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual([roster.documents.length, roster.cause, roster.census.marked, roster.census.standing],
                   [0, "none_standing", 0, { PRESENT: 1 }]);
  assert.deepEqual(w.rows(`SELECT seq, finding, by FROM provenance_route_marks WHERE bundle_id=? ORDER BY seq`, id).map((r) => ({ ...r })),
                   [{ seq: 1, finding: "LOOKED_INDETERMINATE", by: V("riley") }, { seq: 2, finding: "PRESENT", by: V("sam") }]);
});

test("R4: every C-34 refusal carries its row's check and translation, and every row is reached", () => {
  const w = world();
  w.promoteInfo("INFO-2026-0001-x", { captures: [w.cap("a")] });
  w.inquiry("INQ-2026-0001-q");
  const ask = (args) => w.routes.provenanceRouteAssess({ author: V("ruth"), viewer: V("ruth"), bundleId: "INFO-2026-0001-x", ...args });
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
    assert.equal(r.code, code);
    assert.equal(r.check, ROUTE_MARK_CHECKS[code].check, code);
    assert.equal(r.translation, ROUTE_MARK_CHECKS[code].translation, code);
  }
  assert.deepEqual([...new Set(cases.map(([c]) => c))].sort(), Object.keys(ROUTE_MARK_CHECKS).sort(), "every row is reached");
  assert.deepEqual(Object.keys(ROUTE_MARK_CHECKS).map((c) => ROUTE_MARK_CHECKS[c].check).sort(), ["C-34.1", "C-34.2", "C-34.3", "C-34.4"]);
  for (const [c, row] of Object.entries(ROUTE_MARK_CHECKS)) {
    assert.ok(typeof row.translation === "string" && row.translation.split(/\s+/).length >= 8, c);
    assert.equal(row.translation.includes(c), false, c);
    assert.equal(row.where, "src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark", `${c}'s where names this module's site`);
  }
  assert.match(cases[0][1].detail, /is a named act/);
  assert.match(cases[2][1].detail, /is a machine credential/);
  assert.equal(w.count("provenance_route_marks"), 0, "no refusal appended a mark");
});
