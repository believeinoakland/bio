/* provenance: a chain reconstructed from evidence the record holds (R19–R21), the route mark and its reads (R22, R23);
   no hop a caller hands in (R36). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, provDoc, infoMd } from "./fixture.mjs";
import { chainFromEvidence, routeFinding, ROUTE_MARK_NOTE, ROUTE_MARKED_LIMIT_DEFAULT, ROUTE_MARKED_LIMIT_MAX }
  from "../../../src/provenance/index.mjs";

const fetched = { locator: "https://e.org/d", retrieved: "2026-09-01T00:00:00Z",
                  capture: { method: "acquire", actor_class: "session", sha256: sha("d") } };

test("R19: a fetched route gives one hop by this instance, a custodian one by the member, else what is missing", () => {
  const a = chainFromEvidence(fetched, { instanceName: "civic", at: "2026-09-27T00:00:00Z" });
  assert.equal(a.ok, true);
  assert.equal(a.hops.length, 1);
  const h = a.hops[0];
  assert.match(h.who, /^instance civic /);
  assert.equal(h.asserts, "these bytes were served for https://e.org/d at 2026-09-01T00:00:00Z");
  assert.equal(h.via, "direct");
  assert.equal(h.bound, false);
  assert.deepEqual(h.reconstructed.from, ["locator", "retrieved", "capture.method", "capture.actor_class", "capture.sha256"]);
  assert.equal(h.reconstructed.at, "2026-09-27T00:00:00Z");
  /* A timestamp is evidence for the bytes and the instant, never the address. */
  const ts = chainFromEvidence({ ...fetched, timestamp: { authority: "tsa.example", token_file: "snapshots/t.tsr" } });
  assert.match(ts.hops[0].evidence, /binds these bytes to their capture instant, not to the address/);
  assert.equal(ts.hops[0].bound, false);
  /* A custodian. */
  const m = chainFromEvidence({ locator: "in hand", capture: { sha256: sha("m") },
                                custody: { holder: "ruth", obtained: "2026-08-01T00:00:00Z", setting: "a meeting" } });
  assert.equal(m.ok, true);
  assert.equal(m.hops[0].via, "member");
  assert.equal(m.hops[0].who, "member ruth");
  assert.deepEqual(m.hops[0].reconstructed.from.slice(0, 2), ["custody.holder", "custody.obtained"]);
  /* Neither: each absent field listed. */
  const none = chainFromEvidence({ locator: "in hand" });
  assert.equal(none.ok, false);
  assert.equal(none.missing.length, 5);
  assert.deepEqual(chainFromEvidence(null), { ok: false, missing: ["the document entry is not an object"] });
});

/* An information bundle with two documents: one with a fetched route, and one whose route the record lacks. */
function twoDocs(w, id, { secondRouted = false, state = "collected" } = {}) {
  const a = w.cap(`${id}-a`), b = w.cap(`${id}-b`);
  const docs = [provDoc(a), { ...provDoc(b), ...(secondRouted ? {} : { locator: "in hand", custody: undefined }) }];
  const r = w.promoteInfo(id, { captures: [a, b], docs, state });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { a, b };
}

test("R20: the rebuild reports, refuses whole when any document is undetermined, and applies through promote", () => {
  const w = world();
  twoDocs(w, "INFO-2026-0001-x");
  const before = w.snapshot();
  const refused = w.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0001-x", apply: true, author: V("ruth"), viewer: V("ruth") });
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "EVIDENCE_INSUFFICIENT");
  assert.deepEqual(refused.documents.map((d) => d.outcome), ["reconstructed", "undetermined"]);
  assert.equal(refused.route.finding, "NEVER_LOOKED");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* Every document derivable: a report first, then an apply that changes only data/provenance.json. */
  const w2 = world();
  twoDocs(w2, "INFO-2026-0002-y", { secondRouted: true });
  const head0 = w2.head("INFO-2026-0002-y");
  const crit0 = w2.row(`SELECT criticality, created, last_updated FROM bundles WHERE bundle_id=?`, "INFO-2026-0002-y");
  const report = w2.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0002-y", author: V("ruth"), viewer: V("ruth") });
  assert.deepEqual([report.ok, report.applied, report.changed], [true, false, 2]);
  assert.deepEqual(w2.head("INFO-2026-0002-y"), head0, "a report writes nothing");
  const files0 = Object.fromEntries(w2.record.livePaths("INFO-2026-0002-y").map((p) => [p, w2.record.readFile("INFO-2026-0002-y", p).sha256]));
  const applied = w2.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0002-y", apply: true, author: V("ruth"), viewer: V("ruth") });
  assert.deepEqual([applied.ok, applied.applied, applied.changed], [true, true, 2], JSON.stringify(applied));
  const files1 = Object.fromEntries(w2.record.livePaths("INFO-2026-0002-y").map((p) => [p, w2.record.readFile("INFO-2026-0002-y", p).sha256]));
  for (const p of Object.keys(files0)) if (p !== "data/provenance.json") assert.equal(files1[p], files0[p], `${p} carried byte for byte`);
  assert.notEqual(files1["data/provenance.json"], files0["data/provenance.json"]);
  const h1 = w2.head("INFO-2026-0002-y");
  assert.deepEqual([h1.type, h1.groupId, h1.currentState, h1.priorState, h1.title],
                   [head0.type, head0.groupId, head0.currentState, head0.priorState, head0.title]);
  assert.deepEqual({ ...w2.row(`SELECT criticality, created, last_updated FROM bundles WHERE bundle_id=?`, "INFO-2026-0002-y") }, { ...crit0 });
  const chains = JSON.parse(w2.record.readFile("INFO-2026-0002-y", "data/provenance.json").text).documents.map((d) => d.provenance_chain.length);
  assert.deepEqual(chains, [1, 1]);
  /* Already recorded: nothing to apply. */
  const again = w2.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0002-y", apply: true, author: V("ruth"), viewer: V("ruth") });
  assert.deepEqual([again.applied, again.changed, again.documents[0].outcome], [false, 0, "already_recorded"]);
  /* Refusals. */
  const r = (args) => w2.prov.provenanceChainRebuild({ author: V("ruth"), viewer: V("ruth"), ...args }).reason;
  assert.equal(r({ author: "", bundleId: "INFO-2026-0002-y" }), "NO_AUTHOR");
  assert.equal(r({ bundleId: "" }), "NO_BUNDLE");
  assert.equal(w2.prov.provenanceChainRebuild({ bundleId: "", author: V("r"), viewer: V("r") }).check, "C-103.3",
               "NO_BUNDLE carries its row here too: its sentence is true at both sites");
  assert.equal(r({ bundleId: "INFO-2026-0404-none" }), "NO_SUCH_BUNDLE");
  assert.equal(r({ bundleId: "INFO-2026-0002-y", viewer: "stranger" }), "NO_SUCH_BUNDLE", "unseen answers as absent");
  const w3 = world();
  const c = w3.cap("c");
  const mk = (id, prov) => w3.promotion.promote({ bundleId: id, base: null, snapKey: id, author: "member:alice", replay: true,
    meta: { object_type: "information" }, files: [{ path: "bundle.md", text: infoMd(id) }, { path: c.path, text: c.text },
      ...(prov === null ? [] : [{ path: "data/provenance.json", text: prov }])] });
  mk("INFO-2026-0003-n", null); mk("INFO-2026-0004-u", "{x"); mk("INFO-2026-0005-d", JSON.stringify({ nope: 1 }));
  const r3 = (id) => w3.prov.provenanceChainRebuild({ bundleId: id, author: V("r"), viewer: V("r") }).reason;
  assert.equal(r3("INFO-2026-0003-n"), "NO_REGISTER");
  assert.equal(r3("INFO-2026-0004-u"), "UNPARSABLE_REGISTER");
  assert.equal(r3("INFO-2026-0005-d"), "NO_DOCUMENTS");
});

test("R21: a machine identity is refused by name before anything is read", () => {
  const w = world();
  twoDocs(w, "INFO-2026-0001-x", { secondRouted: true });
  for (const who of ["token:member", "class:admin", "ai", "daemon"]) {
    const r = w.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0404-absent", author: who, viewer: V("x") });
    assert.equal(r.reason, "NO_AUTHOR", who);
    assert.match(r.detail, /machine credential/);
  }
  assert.equal(w.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0001-x", author: V("ruth"), viewer: V("ruth") }).ok, true);
});

test("R22: a member's route assessment, marked only when it changes, never moving the bundle", () => {
  const w = world();
  twoDocs(w, "INFO-2026-0001-x");
  const head0 = w.head("INFO-2026-0001-x");
  const r = (args) => w.prov.provenanceRouteAssess({ author: V("ruth"), viewer: V("ruth"), ...args });
  const m1 = r({ bundleId: "INFO-2026-0001-x" });
  assert.equal(m1.ok, true);
  assert.equal(m1.appended, true);
  assert.equal(m1.route.finding, "LOOKED_INDETERMINATE");
  assert.equal(m1.route.note, ROUTE_MARK_NOTE);
  assert.deepEqual(m1.documents.map((d) => d.outcome), ["derivable", "undetermined"]);
  assert.equal(m1.route.stateAt, "collected");
  assert.deepEqual(w.head("INFO-2026-0001-x"), head0, "state and bytes never move");
  const m2 = r({ bundleId: "INFO-2026-0001-x" });
  assert.equal(m2.appended, false, "the same finding appends nothing");
  assert.equal(w.count("provenance_route_marks"), 1);
  /* Refusals, each with its row. */
  const no = r({ author: "", bundleId: "INFO-2026-0001-x" });
  assert.deepEqual([no.reason, no.check], ["ROUTE_MARK_NO_AUTHOR", "C-34.1"]);
  const machine = r({ author: "token:member", bundleId: "INFO-2026-0001-x" });
  assert.deepEqual([machine.reason, machine.check], ["ROUTE_MARK_NO_AUTHOR", "C-34.1"], "REC-158: a machine is nobody's name");
  assert.deepEqual([r({ bundleId: "" }).reason, r({ bundleId: "" }).check], ["ROUTE_MARK_NO_BUNDLE", "C-34.2"]);
  assert.deepEqual([r({ bundleId: "INFO-2026-0404-x" }).reason, r({ bundleId: "INFO-2026-0404-x" }).check], ["ROUTE_MARK_NO_SUCH_BUNDLE", "C-34.3"]);
  assert.equal(r({ bundleId: "INFO-2026-0001-x", viewer: "stranger" }).reason, "ROUTE_MARK_NO_SUCH_BUNDLE");
  /* A bundle that is not information, held through record-core's one write path. */
  w.record.transact(() => w.record.commit({ bundleId: "INQ-2026-0001-q", type: "inquiry", title: "Q", project: null,
    snapKey: "q", kind: "promotion", base: "", author: V("ruth"), writer: null, operation: null,
    files: [{ path: "bundle.md", text: "---\nid: INQ-2026-0001-q\n---\n", sha256: sha("---\nid: INQ-2026-0001-q\n---\n"), bytes: 23 }],
    state: "open", priorState: null,
    group: "test-group", created: "2026-09-27T00:00:00Z", lastUpdated: "2026-09-27T00:00:00Z", criticality: null,
    at: "2026-09-27T00:00:00Z" }));
  assert.ok(w.head("INQ-2026-0001-q"));
  const q = r({ bundleId: "INQ-2026-0001-q" });
  assert.deepEqual([q.reason, q.check], ["ROUTE_MARK_NOT_A_DOCUMENT", "C-34.4"]);
  /* The register's state is recorded, never refused. */
  const w2 = world();
  const c = w2.cap("c");
  w2.promotion.promote({ bundleId: "INFO-2026-0002-n", base: null, snapKey: "n", author: "member:alice", replay: true,
    meta: { object_type: "information" }, files: [{ path: "bundle.md", text: infoMd("INFO-2026-0002-n") }, { path: c.path, text: c.text }] });
  const absent = w2.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0002-n", author: V("r"), viewer: V("r") });
  assert.deepEqual([absent.ok, absent.route.finding, absent.route.register], [true, "LOOKED_INDETERMINATE", "absent"]);
  /* A later assessment that finds the route shown appends PRESENT. */
  const w3 = world();
  twoDocs(w3, "INFO-2026-0003-y", { secondRouted: true });
  const p = w3.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0003-y", author: V("r"), viewer: V("r") });
  assert.equal(p.route.finding, "PRESENT");
});

test("R23: routeFinding states never-looked apart from a finding; the marked roster pages visible bundles with a census", () => {
  assert.deepEqual(routeFinding("inquiry", null).applies, false);
  const never = routeFinding("information", null);
  assert.deepEqual([never.applies, never.assessed, never.finding], [true, false, "NEVER_LOOKED"]);
  assert.match(never.note, /NOT a finding/);
  const w = world();
  const empty = w.prov.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual([empty.documents.length, empty.cause], [0, "no_documents_visible"]);
  twoDocs(w, "INFO-2026-0001-x");
  assert.equal(w.prov.provenanceRoutesMarked({ viewer: V("x") }).cause, "never_assessed");
  w.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0001-x", author: V("r"), viewer: V("r") });
  const w2 = world();
  twoDocs(w2, "INFO-2026-0002-y", { secondRouted: true });
  w2.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0002-y", author: V("r"), viewer: V("r") });
  assert.equal(w2.prov.provenanceRoutesMarked({ viewer: V("x") }).cause, "none_standing");
  const page = w.prov.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual(page.documents.map((d) => d.bundleId), ["INFO-2026-0001-x"]);
  assert.deepEqual(page.census, { documents_visible: 1, assessed: 1, never_assessed: 0,
                                  standing: { LOOKED_INDETERMINATE: 1 }, marked: 1 });
  assert.equal(page.complete, true);
  assert.equal(page.limit, ROUTE_MARKED_LIMIT_DEFAULT);
  assert.equal(w.prov.provenanceRoutesMarked({ viewer: V("x"), limit: 10000 }).limit, ROUTE_MARKED_LIMIT_MAX);
  assert.equal(w.prov.provenanceRoutesMarked({ viewer: V("x"), after: "INFO-2026-0001-x" }).cause, "page_exhausted");
  /* Withheld whole and counted nowhere for a viewer who may see nothing. */
  const denied = w.prov.provenanceRoutesMarked({ viewer: "stranger" });
  assert.deepEqual([denied.documents.length, denied.census.marked, denied.cause], [0, 0, "no_documents_visible"]);
  /* A later PRESENT mark ends the standing one. */
  assert.equal(w.prov.routeOf("INFO-2026-0001-x", "information").finding, "LOOKED_INDETERMINATE");
  /* Truncation is read from one past the page. */
  const w3 = world();
  for (const n of [1, 2, 3]) { twoDocs(w3, `INFO-2026-000${n}-z`); w3.prov.provenanceRouteAssess({ bundleId: `INFO-2026-000${n}-z`, author: V("r"), viewer: V("r") }); }
  const p1 = w3.prov.provenanceRoutesMarked({ viewer: V("x"), limit: 2 });
  assert.deepEqual([p1.documents.length, p1.truncated, p1.cursor], [2, true, "INFO-2026-0002-z"]);
  const p2 = w3.prov.provenanceRoutesMarked({ viewer: V("x"), limit: 2, after: p1.cursor });
  assert.deepEqual([p2.documents.length, p2.truncated], [1, false]);
});

test("R36: no hop is read from a request: every hop written is derived from fields the record held", () => {
  const w = world();
  twoDocs(w, "INFO-2026-0001-y", { secondRouted: true });
  const r = w.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0001-y", apply: true, author: V("ruth"), viewer: V("ruth"),
    hops: [{ who: "invented", asserts: "whatever the caller says" }], provenance_chain: [{ who: "invented" }] });
  assert.equal(r.ok, true);
  const text = w.record.readFile("INFO-2026-0001-y", "data/provenance.json").text;
  assert.equal(text.includes("invented"), false);
  for (const d of JSON.parse(text).documents)
    for (const h of d.provenance_chain) assert.ok(h.reconstructed && Array.isArray(h.reconstructed.from) && h.reconstructed.from.length);
  /* A caller-supplied hop in the register document is kept as the caller's (already recorded), never rewritten. */
  const w2 = world();
  const a = w2.cap("a");
  w2.promoteInfo("INFO-2026-0002-z", { captures: [a], docs: [provDoc(a, { provenance_chain: [{ who: "a named party" }] })] });
  const rep = w2.prov.provenanceChainRebuild({ bundleId: "INFO-2026-0002-z", author: V("r"), viewer: V("r") });
  assert.equal(rep.documents[0].outcome, "already_recorded");
});
