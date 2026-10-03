/* N345 at queueFeed's interface, over a stubbed `queue-producers.feedItems` (its R8): the new kinds pass the mint (R1,
   R11), each is given R46's disposition, the duties are never muted (R19, R31), a duty reaching two projects is one item
   with two homes (R32), and the producers' facts are published (R6). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_ACT_CHECKS } from "../../../src/queue/index.mjs";

const age = { state: "undetermined", reason: "derived_on_read", detail: "d" };
const item = (cls, kind, id, subject, extra = {}) => ({ id: `${cls}::${id}`, class: cls, kind, subject, summary: kind,
  detail: null, basis: { source: "contradiction", detail: "d" }, age, assignee: null, assignee_role: null, options: [],
  _subjects: extra.subjects || [], ...extra });
const cand = (id, state, more = {}) => ({ kind: "contradiction_candidate", id, state, between_projects: false, parties: [], ...more });
const notice = (id, parties) => ({ kind: "contradiction_notice", id, parties });

/** A world whose producers answer `make(args)` items, each homed and offered through the functions queue passes in. */
function withProducers(make, facts = {}) {
  let args = null;
  const w = world({ producers: { feedItems: (a) => {
    args = a;
    const items = make(a).map(({ _subjects, ...it }) => ({ ...it, case: a.homesOf(_subjects), options: [...it.options, ...a.optionsOf(_subjects)] }));
    return { items, facts: { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                             contradiction: { bound: 50, truncated: false }, dispositions: [], ...facts } };
  } } });
  w.args = () => args;
  return w;
}

test("R1, R11, R46: every N345 kind passes the mint and carries its disposition", () => {
  const P = [{ project: "PRJ-A", opted_in: false }];
  const w = withProducers(() => [
    item("OBLIGATION", "contradiction-duty", "contradiction::C1", cand("C1", "open")),
    item("OBLIGATION", "contradiction-duty", "contradiction::C2", cand("C2", "taken_up", { inquiry: "INQ-T" })),
    item("OBLIGATION", "contradiction-duty", "contradiction::C3", cand("C3", "explained_not_shown")),
    item("FINDING", "contradiction-lead", "contradiction::C4", cand("C4", "open")),
    item("FINDING", "contradiction-plurality", "contradiction::C5", cand("C5", "open")),
    item("OBLIGATION", "contradiction-duty-unseen", "contradiction-unseen::C6", notice("C6", P)),
    item("OBLIGATION", "contradiction-duty-unseen", "contradiction-unseen::C7", notice("C7", [{ project: "PRJ-A", opted_in: true }])),
    item("FINDING", "contradiction-plurality-unseen", "contradiction-unseen::C8", notice("C8", P)),
    item("FINDING", "side-corrected", "side-corrected::INQ-D::C9", { kind: "bundle", id: "INQ-D" }, { subjects: ["INQ-D"] }),
    item("FINDING", "tension-after-publication", "tension-after-publication::PRJ-A::C10", { kind: "bundle", id: "PRJ-A" }),
  ]);
  w.bundle("INQ-D", "inquiry"); w.bundle("PRJ-A", "project"); w.cite("PRJ-A", "INQ-D");
  const f = w.feed(null, "class:admin");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const m = byId(f), d = (id) => m[id].disposition;
  assert.equal(f.items.length, 10);
  // duties: resolved, never disposed; clarify or take up, or resolve its inquiry once taken up
  for (const id of ["OBLIGATION::contradiction::C1", "OBLIGATION::contradiction::C3"])
    assert.deepEqual([d(id).available, d(id).instead], [false, ["contradictionclarify", "contradictiontakeup"]], id);
  assert.deepEqual([d("OBLIGATION::contradiction::C2").instead, d("OBLIGATION::contradiction::C2").inquiry], ["contradictionresolve", "INQ-T"]);
  // a lead: dismissed or taken up, keyed on its candidate
  assert.deepEqual(d("FINDING::contradiction::C4"), { ...d("FINDING::contradiction::C4"), available: true, scope: "candidate",
    keyed_on: ["candidate"], key: "C4", candidate: "C4", acts: ["contradictiondismiss", "contradictiontakeup"], requires: ["candidate"] });
  // a plurality: no set-aside; clarify or take up
  assert.deepEqual([d("FINDING::contradiction::C5").available, d("FINDING::contradiction::C5").acts],
    [false, ["contradictionclarify", "contradictiontakeup"]]);
  // DEC-85: opt in until the project has, then respond
  assert.deepEqual([d("OBLIGATION::contradiction-unseen::C6").available, d("OBLIGATION::contradiction-unseen::C6").instead], [false, ["contradictionoptin"]]);
  assert.deepEqual(d("OBLIGATION::contradiction-unseen::C7").instead, ["contradictionrespond"]);
  assert.deepEqual([d("FINDING::contradiction-unseen::C8").available, d("FINDING::contradiction-unseen::C8").acts], [false, ["contradictionoptin"]]);
  // side-corrected: R12's project-scoped disposition, with its act
  const sc = d("FINDING::side-corrected::INQ-D::C9");
  assert.deepEqual([sc.available, sc.scope, sc.projects, sc.requires, sc.acts], [true, "project", ["PRJ-A"], ["project", "finding"], ["reevaluationrecord"]]);
  // tension after publication: disclosed in a later edition
  assert.deepEqual([d("FINDING::tension-after-publication::PRJ-A::C10").available, d("FINDING::tension-after-publication::PRJ-A::C10").instead], [false, "publish"]);
});

test("R46: between projects, a duty or plurality also offers opt-in while a party project of the member's has not opted in, and respond once one has", () => {
  const between = (id, kind, cls, parties) => item(cls, kind, `contradiction::${id}`, cand(id, "open", { between_projects: true, parties }));
  const w = withProducers(() => [
    between("B1", "contradiction-duty", "OBLIGATION", [{ project: "PRJ-A", opted_in: false }]),
    between("B2", "contradiction-duty", "OBLIGATION", [{ project: "PRJ-A", opted_in: true }]),
    between("B3", "contradiction-plurality", "FINDING", [{ project: "PRJ-A", opted_in: true }, { project: "PRJ-B", opted_in: false }]),
    item("OBLIGATION", "contradiction-duty", "contradiction::B4", cand("B4", "taken_up", { inquiry: "INQ-T", between_projects: true,
      parties: [{ project: "PRJ-A", opted_in: false }] })),
  ]);
  const m = byId(w.feed(null, "class:admin"));
  assert.deepEqual(m["OBLIGATION::contradiction::B1"].disposition.instead, ["contradictionclarify", "contradictiontakeup", "contradictionoptin"]);
  assert.deepEqual(m["OBLIGATION::contradiction::B2"].disposition.instead, ["contradictionclarify", "contradictiontakeup", "contradictionrespond"]);
  assert.deepEqual(m["FINDING::contradiction::B3"].disposition.acts,
    ["contradictionclarify", "contradictiontakeup", "contradictionoptin", "contradictionrespond"]);
  assert.deepEqual(m["OBLIGATION::contradiction::B4"].disposition.instead, ["contradictionresolve", "contradictionoptin"]);
});

test("R19, R31: a contradiction duty cannot be muted, by kind or by id, and no row suppresses it; a lead can, for the member alone", () => {
  const w = withProducers(() => [
    item("OBLIGATION", "contradiction-duty", "contradiction::C1", cand("C1", "open"), { subjects: ["INF-1"] }),
    item("OBLIGATION", "contradiction-duty-unseen", "contradiction-unseen::C2", notice("C2", []), { subjects: ["INF-1"] }),
    item("FINDING", "contradiction-lead", "contradiction::C3", cand("C3", "open"), { subjects: ["INF-1"] })]);
  w.member("alice"); w.member("bob"); w.bundle("INQ-1", "inquiry"); w.bundle("INF-1"); w.leg("INQ-1", "INF-1");
  for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: ["contradiction-duty"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: ["contradiction-duty-unseen"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", item: "OBLIGATION::contradiction::C1" })])
    assert.deepEqual([r.reason, r.kind_class, r.check], ["KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27"]);
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','INQ-1','contradiction-duty,contradiction-duty-unseen')`);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice','OBLIGATION::contradiction::C1','OBLIGATION',?)`, iso(NOW));
  assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", item: "FINDING::contradiction::C3" }).ok, true);
  const ids = w.feed("alice").items.map((i) => i.id);
  assert.deepEqual(ids, ["OBLIGATION::contradiction-unseen::C2", "OBLIGATION::contradiction::C1"]);
  assert.ok(w.feed("bob").items.some((i) => i.id === "FINDING::contradiction::C3"), "bob's feed still carries the lead");
});

test("R32: a duty reaching two projects is one item with both homes; R6: the producers' facts are published", () => {
  const w = withProducers(() => [item("OBLIGATION", "contradiction-duty", "contradiction::C1", cand("C1", "open"), { subjects: ["INF-1", "INF-2"] })],
    { contradiction: { bound: 50, truncated: true }, objective_gap: { bound: 50, truncated: true }, unattributed: { count: 2, inquiries: ["INQ-S"] } });
  w.bundle("INF-1"); w.bundle("INF-2"); w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.cite("PRJ-A", "INF-1"); w.cite("PRJ-B", "INF-2");
  const f = w.feed(null, "class:admin");
  const one = f.items.filter((i) => i.id === "OBLIGATION::contradiction::C1");
  assert.equal(one.length, 1);
  assert.deepEqual(one[0].case.ancestors.map((a) => a.id), ["PRJ-A", "PRJ-B"]);
  assert.deepEqual([f.contradiction_projects_bound, f.contradiction_projects_truncated], [50, true]);
  assert.deepEqual([f.objective_gap_projects_bound, f.objective_gap_projects_truncated], [50, true]);
  assert.deepEqual([f.unattributed_readings.count, f.unattributed_readings.inquiries], [2, ["INQ-S"]]);
  // the producers were handed the member, viewer, instant and identity, with R7's walk and R12's options
  const a = w.args();
  assert.deepEqual([a.member, a.viewer, a.now, typeof a.homesOf, typeof a.optionsOf], [null, "class:admin", NOW, "function", "function"]);
});

test("R2, R11: the mint stamps catalogue_id beside kind; an uncatalogued producer kind refuses the whole feed", () => {
  const w = withProducers(() => [item("FINDING", "export-performed", "export-performed::1", { kind: "export", id: "export_log:1" })]);
  const e = w.feed(null, "class:admin").items[0];
  assert.deepEqual(Object.keys(e).slice(0, 4), ["id", "class", "kind", "catalogue_id"]);
  assert.equal(e.catalogue_id, "N-1");
  const bad = withProducers(() => [item("FINDING", "contradiction-dispute", "contradiction::X", cand("X", "open"))]).feed(null, "class:admin");
  assert.deepEqual([bad.ok, bad.reason, bad.check, bad.id], [false, "NO_SUCH_KIND", "C-31.2", "FINDING::contradiction::X"]);
});

test("R28 (N527): a contradiction duty's published id, OBLIGATION::contradiction::<c> or OBLIGATION::contradiction-unseen::<c>, is bridged as contradiction-duty or contradiction-duty-unseen: CLASS_NOT_DISPOSED with the door R12 names; nothing written", () => {
  const w = withProducers(() => [
    item("OBLIGATION", "contradiction-duty", "contradiction::C1", cand("C1", "open")),
    item("OBLIGATION", "contradiction-duty-unseen", "contradiction-unseen::C2", notice("C2", [])),
    item("FINDING", "contradiction-lead", "contradiction::C3", cand("C3", "open"))]);
  w.member("alice");
  const m = byId(w.feed(null, "class:admin"));
  const pd = (a) => w.q.proposeDispose({ to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice",
                                          identity: "member:alice", ...a });
  const refused = (key, kind) => {
    const r = pd({ key });
    assert.deepEqual([r.ok, r.reason, r.code, r.class, r.kind, r.check, r.translation],
      [false, "CLASS_NOT_DISPOSED", "CLASS_NOT_DISPOSED", "OBLIGATION", kind, "C-33.44",
       QUEUE_ACT_CHECKS.CLASS_NOT_DISPOSED.translation], key);
    assert.equal(r.progression_arm, undefined, `${key}: the progression arm is not reached`);
    return r;
  };
  // the ids exactly as the feed publishes them, with the item's own door (a duty not taken up, no party: the bridge
  // holds no subject, so it names the doors of a duty not taken up, R12's `doorOf`)
  for (const [id, kind] of [["OBLIGATION::contradiction::C1", "contradiction-duty"],
                            ["OBLIGATION::contradiction-unseen::C2", "contradiction-duty-unseen"]]) {
    assert.equal(m[id].kind, kind);
    assert.deepEqual(refused(id, kind).instead, m[id].disposition.instead, id);
  }
  // a candidate id holding the separator, and surrounding blanks, are still the duty's
  assert.deepEqual(refused(" OBLIGATION::contradiction::C1::x ", "contradiction-duty").instead,
    ["contradictionclarify", "contradictiontakeup"]);
  assert.deepEqual(refused("OBLIGATION::contradiction-unseen::C9", "contradiction-duty-unseen").instead, ["contradictionoptin"]);
  // under the per-item weight each duty is retained with that reason, beside an item that is applied
  const set = pd({ items: [{ key: "OBLIGATION::contradiction::C1" }, { key: "OBLIGATION::contradiction-unseen::C2" },
                           { key: "proc::award" }] });
  assert.deepEqual(set.items.map((i) => i.outcome), ["retained", "retained", "applied"]);
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0, "nothing written");
  // with no candidate it names no duty, and the finding of the same family is not an obligation: neither is bridged as one
  for (const key of ["OBLIGATION::contradiction::", "OBLIGATION::contradiction-unseen:: ", "OBLIGATION::contradiction"])
    assert.notEqual(pd({ key }).reason, "CLASS_NOT_DISPOSED", key);
  const lead = pd({ key: "FINDING::contradiction::C3" });
  assert.deepEqual([lead.reason, lead.finding], ["NO_PROJECT_SCOPE", "FINDING::contradiction::C3"]);
});
