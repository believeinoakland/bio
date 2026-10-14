/* connections: a source attached to a declared step (R68, R69; T48-20; N1030, K3145, K1487 (3)) and its purge (R36 as
   amended, R67). Read with this job's QUESTION J1 (T48): an extent is judged by content's shape check and keyed by
   `canonicalExtent`; each evidence entry names its `source` (the cited capture's bundle), as connection-grammar R1
   requires; a capture whose grade is not determined is read at the lowest grade, and says so. Every act is driven at
   the module's interface (`attachStepSource`, `withdrawStepSource`, `neighbours`, the ops map, the registry), as
   explore's walk reaches it (connection-grammar's registry, with the caller's host). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { defaultRegistry, ownerConformance, BOUNDS, LOWEST_GRADE } from "../../../src/connection-grammar/index.mjs";
import { STEP_SOURCE_KIND, STEP_SOURCE_KINDS, STEP_SOURCE_DECLARES, STEP_SOURCE_BASIS_MAX, MENTIONED_KIND,
         CONNECTIONS_TABLES, connectionsOps } from "../../../src/connections/index.mjs";

const E = "ENT-2026-0101", F = "ENT-2026-0102", G = "ENT-2026-0103";
const D1 = "INFO-2026-0101-a", D2 = "INFO-2026-0102-b", H = "INFO-2026-0150-h";
const PAGE = { kind: "pdf-page", page: 3 };

/* Two entities joined by a declared member_of relation; a held document D1 (fetched directly, grade B), a held D2 with
   no receipt (grade undetermined), and H hidden from every member (a project no one joined). */
function setup() {
  const w = world();
  w.member("alice"); w.member("bob");
  w.entity(E, "The Commission"); w.entity(F, "The Department"); w.entity(G, "The Board");
  const rel = w.entities.declareRelation({ fromEntity: E, toEntity: F, relation: "member_of", justification: "charter",
                                           citation: "Charter art. 2", declaredBy: "alice" });
  assert.equal(rel.ok, true, JSON.stringify(rel));
  const [d1] = w.doc(D1, ["the commission is part of the department"]);
  const [d2] = w.doc(D2, ["an unfetched copy"]);
  const [h] = w.doc(H, ["hidden"]);
  w.receipt("https://example.org/d1", d1, "2026-09-26T00:00:00Z", "direct");
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, H);
  return { w, rel: rel.relation_id, d1, d2, h };
}
const attach = (w, o) => w.k.attachStepSource({ basis: "page 3 says the commission sits within the department",
                                                member: "alice", viewer: V("alice"), extent: PAGE, ...o });
const walk = (w, node, viewer = V("alice"), kinds = [STEP_SOURCE_KIND]) =>
  w.k.neighbours({ node, kinds, at: "2026-10-01", viewer, scope: null });

test("R68: a member attaches a passage of a held capture to a declared member_of relation, and the row is held; the relation is never changed", () => {
  const { w, rel, d1 } = setup();
  const before = w.entities.readRelation({ relationId: rel });
  const r = attach(w, { relation: rel, captureSha: d1 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.wrote, true);
  const s = r.step_source;
  assert.match(s.id, /^STEPSOURCE-\d+$/);
  assert.deepEqual({ ...s, id: null, at: null }, {
    id: null, relation: rel, from: E, to: F, capture_sha: d1, extent: { kind: "pdf-page", page: 3, rect: null },
    basis: "page 3 says the commission sits within the department", member: "alice", at: null, standing: true, withdrawn: null });
  assert.equal(s.at, w.clock.now);
  assert.equal(w.count("step_sources"), 1);
  assert.deepEqual(w.entities.readRelation({ relationId: rel }), before, "the relation stays declared, unchanged, with no grade");
  assert.equal("grade" in w.entities.readRelation({ relationId: rel }).relation, false);
  /* The same (relation, capture, extent) again, the extent spelled another way that reads the same: nothing written. */
  const again = attach(w, { relation: rel, captureSha: d1.toUpperCase(), extent: JSON.stringify({ kind: "pdf-page", page: 3, rect: null }),
                            basis: "said twice" });
  assert.equal(again.ok, true);
  assert.equal(again.wrote, false);
  assert.equal(again.step_source.id, s.id);
  assert.equal(w.count("step_sources"), 1);
  /* Another passage of the same capture is another source. */
  assert.equal(attach(w, { relation: rel, captureSha: d1, extent: { kind: "document" } }).wrote, true);
  assert.equal(w.count("step_sources"), 2);
});

test("R68: refusals in order, each writing nothing — a machine stamp or none, an unknown or withdrawn relation, a capture not held or hidden (alike), a malformed extent, no basis, a basis over 4,000 characters", () => {
  const { w, rel, d1, h } = setup();
  const snap = () => w.snapshot();
  const before = snap();
  const reason = (o) => attach(w, { relation: rel, captureSha: d1, ...o }).reason;
  /* Order: each arm also carries every later fault, so only the first is answered. */
  const allBad = { member: MACHINE, relation: "REL-2026-9999", captureSha: h, extent: { kind: "nonsense" }, basis: " " };
  assert.equal(reason(allBad), "STEP_SOURCE_NOT_A_MEMBER");
  assert.equal(reason({ ...allBad, member: "" }), "STEP_SOURCE_NOT_A_MEMBER");
  assert.equal(reason({ ...allBad, member: null }), "STEP_SOURCE_NOT_A_MEMBER");
  assert.equal(reason({ ...allBad, member: "alice" }), "NO_SUCH_RELATION");
  assert.equal(reason({ ...allBad, member: "alice", relation: "" }), "NO_SUCH_RELATION");
  assert.equal(reason({ ...allBad, member: "alice", relation: rel }), "CAPTURE_NOT_HELD", "a hidden capture");
  assert.equal(reason({ ...allBad, member: "alice", relation: rel, captureSha: "0".repeat(64) }), "CAPTURE_NOT_HELD", "an absent capture, alike");
  const hidden = attach(w, { relation: rel, captureSha: h }), absent = attach(w, { relation: rel, captureSha: "0".repeat(64) });
  assert.deepEqual({ ...hidden, capture_sha: null }, { ...absent, capture_sha: null }, "hidden answers exactly as absent");
  assert.equal(reason({ ...allBad, member: "alice", relation: rel, captureSha: d1 }), "EXTENT_MALFORMED");
  assert.equal(reason({ extent: null }), "EXTENT_MALFORMED");
  assert.equal(reason({ extent: "not json" }), "EXTENT_MALFORMED");
  assert.equal(attach(w, { relation: rel, captureSha: d1, extent: { kind: "nonsense" } }).extent_refusal, "CONTENT_EXTENT_UNREADABLE");
  assert.equal(reason({ basis: " " }), "STEP_SOURCE_NO_BASIS");
  assert.equal(reason({ basis: null }), "STEP_SOURCE_NO_BASIS");
  const long = attach(w, { relation: rel, captureSha: d1, basis: "x".repeat(STEP_SOURCE_BASIS_MAX + 1) });
  assert.equal(long.reason, "STEP_SOURCE_BASIS_TOO_LONG");
  assert.equal(long.limit, 4000);
  /* A withdrawn relation is no step to back. */
  assert.equal(w.entities.withdrawRelation({ relationId: rel, reason: "wrong", withdrawnBy: "alice" }).ok, true);
  const afterWithdraw = snap();
  assert.equal(reason({}), "NO_SUCH_RELATION");
  assert.deepEqual(snap(), afterWithdraw);
  assert.equal(w.count("step_sources"), 0);
  assert.deepEqual(before.step_sources, afterWithdraw.step_sources);
  /* Control: at the bound exactly, it is recorded. */
  const { w: w2, rel: rel2, d1: c2 } = setup();
  assert.equal(attach(w2, { relation: rel2, captureSha: c2, basis: "y".repeat(STEP_SOURCE_BASIS_MAX) }).wrote, true);
});

test("R68: withdrawStepSource — refusals (a machine or absent member, NO_REASON, NO_SUCH_STEP_SOURCE, STEP_SOURCE_NOT_THE_ATTACHER), each writing nothing; a withdrawn source stays recorded with who, when and why", () => {
  const { w, rel, d1 } = setup();
  const id = attach(w, { relation: rel, captureSha: d1 }).step_source.id;
  const before = w.snapshot();
  const why = (o) => w.k.withdrawStepSource({ id, reason: "the page says otherwise", member: "alice", viewer: V("alice"), ...o }).reason;
  assert.equal(why({ member: MACHINE, reason: "", id: "STEPSOURCE-999" }), "STEP_SOURCE_NOT_A_MEMBER");
  assert.equal(why({ member: null }), "STEP_SOURCE_NOT_A_MEMBER");
  assert.equal(why({ reason: " ", id: "STEPSOURCE-999" }), "NO_REASON");
  assert.equal(why({ id: "STEPSOURCE-999", member: "bob" }), "NO_SUCH_STEP_SOURCE");
  assert.equal(why({ id: "nonsense" }), "NO_SUCH_STEP_SOURCE");
  assert.equal(why({ viewer: "garbage" }), "NO_SUCH_STEP_SOURCE", "a viewer the gate does not recognise cannot see the capture");
  assert.equal(why({ member: "bob", viewer: V("bob") }), "STEP_SOURCE_NOT_THE_ATTACHER");
  assert.deepEqual(w.snapshot(), before, "each refusal wrote nothing");
  w.clock.now = "2026-09-28T00:00:00.000Z";
  const r = w.k.withdrawStepSource({ id, reason: "the page says otherwise", member: "alice", viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.step_source.standing, false);
  assert.deepEqual(r.step_source.withdrawn, { by: "alice", at: "2026-09-28T00:00:00.000Z", reason: "the page says otherwise" });
  assert.equal(r.step_source.basis, "page 3 says the commission sits within the department", "the act before it kept");
  assert.equal(w.count("step_sources"), 1, "never deleted");
  assert.equal(why({}), "NO_SUCH_STEP_SOURCE", "a withdrawn source is not standing");
  /* Attached afresh after the withdrawal: a new row beside the withdrawn one. */
  const again = attach(w, { relation: rel, captureSha: d1 });
  assert.equal(again.wrote, true);
  assert.notEqual(again.step_source.id, id);
  assert.equal(w.count("step_sources"), 2);
});

test("R68, R69: the ops map — stepsource and stepsourcewithdraw take member and viewer from the stamps, never the body", () => {
  const { w, rel, d1 } = setup();
  const url = (q) => new URL(`http://x/?${new URLSearchParams(q)}`);
  const body = { relation: rel, captureSha: d1, extent: PAGE, basis: "stated", member: "bob", viewer: V("bob") };
  const forged = connectionsOps(w.k, url({}), body, {}).stepsource();
  assert.equal(forged.reason, "STEP_SOURCE_NOT_A_MEMBER", "a member named in the body is not a stamp");
  const r = connectionsOps(w.k, url({ member: "alice", viewer: V("alice") }), body, {}).stepsource();
  assert.equal(r.wrote, true);
  assert.equal(r.step_source.member, "alice");
  const bad = connectionsOps(w.k, url({ member: "bob", viewer: V("bob") }), { id: r.step_source.id, reason: "no", member: "alice" }, {})
    .stepsourcewithdraw();
  assert.equal(bad.reason, "STEP_SOURCE_NOT_THE_ATTACHER");
  const ok = connectionsOps(w.k, url({ member: "alice", viewer: V("alice") }), { id: r.step_source.id, reason: "no" }, {})
    .stepsourcewithdraw();
  assert.equal(ok.ok, true);
  assert.equal(ok.step_source.withdrawn.by, "alice");
});

test("R69: neighbours answers, for an entity at either end, each standing source as one step_source connection in connection-grammar's shape, graded no higher than the cited capture", () => {
  const { w, rel, d1, d2 } = setup();
  const s1 = attach(w, { relation: rel, captureSha: d1 }).step_source;
  const s2 = attach(w, { relation: rel, captureSha: d2, extent: { kind: "document" }, basis: "the whole copy states it" }).step_source;
  for (const node of [E, F]) {
    const r = walk(w, node);
    assert.equal(r.refused, undefined, JSON.stringify(r).slice(0, 300));
    assert.deepEqual(r.items.map((i) => i.id), [s1.id, s2.id].sort());
    for (const i of r.items) {
      assert.deepEqual(defaultRegistry.checkConnection(i).errors ?? [], [], JSON.stringify(defaultRegistry.checkConnection(i)));
      assert.equal(i.from, E); assert.equal(i.to, F);
      assert.equal(i.kind, "step_source"); assert.equal(i.owner, "connections");
      assert.equal(i.evidence[0].relation, rel);
      assert.deepEqual(i.grade.ends, [LOWEST_GRADE, LOWEST_GRADE], "each entity end at the lowest grade, as entities R47 answers them");
      assert.equal(i.derived, null);
      assert.equal(typeof i.undetermined.why, "string");
      assert.deepEqual({ from: i.valid.from, to: i.valid.to }, { from: null, to: null }, "valid unstated");
    }
    const one = r.items.find((i) => i.id === s1.id), two = r.items.find((i) => i.id === s2.id);
    assert.deepEqual(one.evidence, [{ source: D1, capture_sha: d1, extent: { kind: "pdf-page", page: 3, rect: null },
                                      basis: "page 3 says the commission sits within the department", relation: rel }]);
    assert.equal(w.prov.captureGrade(d1).grade, "B");
    assert.equal(one.grade.assertion, "B", "the cited capture's grade, never above it");
    assert.equal(w.prov.captureGrade(d2).grade, null);
    assert.equal(two.grade.assertion, "D", "a capture whose grade is not determined is read at the lowest grade");
    assert.match(two.grade_says, /not determined/);
    assert.equal(one.attached_by, "alice");
  }
  /* An entity that is no end of the relation, and a kind not asked, answer nothing. */
  assert.deepEqual(walk(w, G).items, []);
  assert.deepEqual(walk(w, E, V("alice"), [MENTIONED_KIND]).items, []);
  /* A missing viewer is refused. */
  assert.equal(w.k.neighbours({ node: E, kinds: [STEP_SOURCE_KIND], viewer: null }).refused, "VIEWER_MISSING");
});

test("R69 (R33): a source whose capture the viewer may not see is neither an item nor counted; a withdrawn relation's sources are not answered", () => {
  const { w, rel, d1, h } = setup();
  attach(w, { relation: rel, captureSha: d1 });
  /* Attached while the bundle was visible, then hidden: the row stays, the item does not reach a member. */
  w.st.sql.exec(`UPDATE bundles SET object_type='information' WHERE bundle_id=?`, H);
  const hid = attach(w, { relation: rel, captureSha: h });
  assert.equal(hid.wrote, true);
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, H);
  assert.equal(walk(w, E, MACHINE).items.length, 2);
  const seen = walk(w, E, V("bob"));
  assert.equal(seen.items.length, 1);
  assert.equal(JSON.stringify(seen).includes(h), false, "nothing of the hidden source reaches the answer");
  assert.equal(JSON.stringify(seen).includes(H), false);
  assert.deepEqual(walk(w, E, "garbage").items, [], "an unrecognised viewer sees nothing");
  w.entities.withdrawRelation({ relationId: rel, reason: "wrong", withdrawnBy: "alice" });
  assert.deepEqual(walk(w, E, MACHINE).items, []);
});

test("R69: through connection-grammar's registry with the caller's host (explore's path), a walk from one end reaches the other through a step_source hop citing the relation at the capture's grade; control: after withdrawStepSource the hop is not answered", () => {
  const { w, rel, d1 } = setup();
  const id = attach(w, { relation: rel, captureSha: d1 }).step_source.id;
  const ask = (node) => defaultRegistry.neighbours({ owner: "connections", node, kinds: [STEP_SOURCE_KIND], at: "2026-10-01",
                                                    viewer: V("alice"), scope: null, host: w.host });
  const fromE = ask(E);
  assert.equal(fromE.refused, undefined, JSON.stringify(fromE).slice(0, 300));
  assert.equal(fromE.items.length, 1);
  const hop = fromE.items[0];
  assert.equal(hop.to, F, "the walk from E reaches F");
  assert.equal(hop.evidence[0].relation, rel);
  assert.equal(hop.grade.assertion, w.prov.captureGrade(d1).grade);
  assert.equal(ask(F).items[0].from, E, "and from F reaches E");
  /* All kinds asked (a walk naming none): the step_source hop is among them. */
  const all = defaultRegistry.neighbours({ owner: "connections", node: E, at: "2026-10-01", viewer: V("alice"), scope: null, host: w.host });
  assert.deepEqual(all.items.map((i) => i.kind), ["step_source"]);
  w.k.withdrawStepSource({ id, reason: "misread", member: "alice", viewer: V("alice") });
  assert.deepEqual(ask(E).items, []);
  assert.deepEqual(ask(F).items, []);
});

test("R69: the owner-conformance battery passes over this module's fixture for step_source (undated, fenced by the capture's sight)", () => {
  const { w, rel, d1, d2, h } = setup();
  attach(w, { relation: rel, captureSha: d1 });
  attach(w, { relation: rel, captureSha: d2, extent: { kind: "document" } });
  w.st.sql.exec(`UPDATE bundles SET object_type='information' WHERE bundle_id=?`, H);
  const fenced = attach(w, { relation: rel, captureSha: h }).step_source.id;
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, H);
  const expected = walk(w, E, MACHINE).items.map((i) => i.id).sort();
  assert.equal(expected.length, 3);
  const fixture = { node: E, at: "2026-10-01", kinds: [STEP_SOURCE_KIND], viewers: { sees: MACHINE, blind: V("bob") },
                    fenced, expected };
  const r = ownerConformance({ owner: "connections", kinds: STEP_SOURCE_KINDS.map((x) => ({ ...x })),
                               neighbours: (a) => w.k.neighbours(a), fixture, declares: STEP_SOURCE_DECLARES });
  assert.deepEqual(r.failures, [], JSON.stringify(r.failures));
  assert.equal(r.ok, true);
  assert.deepEqual(r.inapplicable.map((x) => x.check), ["at"]);
  /* Control: undeclared, the date rule cannot be shown and fails by name. */
  const bare = ownerConformance({ owner: "connections", kinds: STEP_SOURCE_KINDS.map((x) => ({ ...x })),
                                  neighbours: (a) => w.k.neighbours(a), fixture });
  assert.equal(bare.ok, false);
  assert.deepEqual([...new Set(bare.failures.map((x) => x.check))], ["at"]);
});

test("R69: paging over many sources is complete and duplicate-free; over the hub bound the entity is named by its set size, with no items", () => {
  const { w, rel, d1 } = setup();
  const n = BOUNDS.hub + 1;
  for (let p = 0; p < n; p++) assert.equal(attach(w, { relation: rel, captureSha: d1, extent: { kind: "pdf-page", page: p } }).wrote, true);
  const hub = walk(w, E, MACHINE);
  assert.deepEqual(hub.items, []);
  assert.equal(hub.hub.set_size, n);
  /* One withdrawn brings it to the bound: answered as items, paged at the fan-out. */
  const first = w.rows(`SELECT source_id FROM step_sources ORDER BY source_id LIMIT 1`)[0].source_id;
  w.k.withdrawStepSource({ id: `STEPSOURCE-${first}`, reason: "dup", member: "alice", viewer: V("alice") });
  const seen = [];
  let page = null;
  for (;;) {
    const r = w.k.neighbours({ node: E, kinds: [STEP_SOURCE_KIND], viewer: MACHINE, page });
    assert.equal(r.hub, undefined);
    seen.push(...r.items.map((i) => i.id));
    if (!r.next) break;
    page = r.next;
  }
  assert.equal(seen.length, BOUNDS.hub);
  assert.equal(new Set(seen).size, seen.length);
});

test("R36, R67: step_sources is declared with the cited capture's bundle's sight, keyed by it; a per-bundle purge takes that bundle's sources and leaves the others; the whole-store purge clears them", () => {
  const decl = CONNECTIONS_TABLES.find((t) => t.name === "step_sources");
  assert.equal(decl.sight, "bundle");
  assert.equal(decl.keys, undefined, "keyed by its bundle_id");
  assert.deepEqual([decl.purge, decl.expunge, decl.export, decl.derive, decl.version_chain],
                   ["clear", "none", "admin-only", "stored", false]);
  const { w, rel, d1, d2 } = setup();
  attach(w, { relation: rel, captureSha: d1 });
  attach(w, { relation: rel, captureSha: d2, extent: { kind: "document" } });
  assert.equal(w.count("step_sources"), 2);
  const one = w.record.purge({ bundleId: D1 });
  assert.notEqual(one && one.ok, false, JSON.stringify(one).slice(0, 300));
  assert.deepEqual(w.rows(`SELECT bundle_id FROM step_sources`).map((r) => r.bundle_id), [D2]);
  const all = w.record.purge({});
  assert.notEqual(all && all.ok, false, JSON.stringify(all).slice(0, 300));
  assert.equal(w.count("step_sources"), 0);
});
