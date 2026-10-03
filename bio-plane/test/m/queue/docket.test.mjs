/* T27's kinds at queue's interface (N518, DEC-113; N520, DEC-116), over a stubbed `queue-producers.feedItems` minting
   each as its requirement keys it (queue-producers R29, R30, R31): `docket-core-due` is an OBLIGATION whose doors are
   placement and decline (R1, R11, R50) and which no mute reaches (R19, R26, R31); `edition-withdrawn` and
   `edition-contested` take R12's project-scoped disposition with a recorded re-evaluation as their act (R50, as
   `side-corrected`, R46), aged per project (R13); `litigation-hold-released` is something the record noticed, taking R12's
   FINDING disposition and quieted only personally (R1, R12, R14). queue hands `docket` to the producers and calls none
   of its reads (R8's deps). Negative controls: each kind minted under another class, or under a near-miss of its name,
   refuses the feed (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { Queue, QUEUE_ACT_CHECKS, QUEUE_MINT_CHECKS } from "../../../src/queue/index.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
const ITEMS = {
  core:      { id: "OBLIGATION::docket-core-due::CASE-1::response::DKT-1", class: "OBLIGATION", kind: "docket-core-due",
               subject: { kind: "case", id: "CASE-1" }, home: "CASE-1" },
  withdrawn: { id: "FINDING::edition-withdrawn::INQ-D::CASE-1#3", class: "FINDING", kind: "edition-withdrawn",
               subject: { kind: "bundle", id: "INQ-D" }, home: "INQ-D" },
  contested: { id: "FINDING::edition-contested::INQ-D::DKT-2", class: "FINDING", kind: "edition-contested",
               subject: { kind: "bundle", id: "INQ-D" }, home: "INQ-D" },
  released:  { id: "FINDING::litigation-hold-released::ACT-1::2::4", class: "FINDING", kind: "litigation-hold-released",
               subject: { kind: "bundle", id: "ACT-1" }, home: "ACT-1" },
  /* the same two edition kinds on a dependent filed under no project: no scope for the set-aside */
  lone:      { id: "FINDING::edition-withdrawn::INQ-L::CASE-1#3", class: "FINDING", kind: "edition-withdrawn",
               subject: { kind: "bundle", id: "INQ-L" }, home: "INQ-L" },
};

function withT27(items = Object.values(ITEMS), fakes = {}) {
  const w = world({ ...fakes, producers: { feedItems: (a) => ({ facts: FACTS, items: items.map(({ home, ...it }) => ({
    ...it, case: a.homesOf([home]), summary: it.kind, detail: null,
    basis: { source: "queue-producers", detail: "stubbed as its requirement keys it" },
    age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
    options: a.optionsOf([home]) })) }) } });
  for (const m of ["alice", "bob"]) w.member(m);
  for (const p of ["PRJ-A", "PRJ-B"]) { w.bundle(p, "project"); w.join(p, "alice"); w.join(p, "bob"); }
  w.bundle("CASE-1"); w.cite("PRJ-A", "CASE-1");
  w.bundle("INQ-D", "inquiry"); w.cite("PRJ-A", "INQ-D"); w.cite("PRJ-B", "INQ-D");
  w.bundle("ACT-1", "action"); w.cite("PRJ-A", "ACT-1");
  w.bundle("INQ-L", "inquiry");
  return w;
}

test("R1, R11, R50: docket-core-due mints as an OBLIGATION whose doors are docketprepare and docketdecline, never taskresolve", () => {
  const w = withT27();
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const it = byId(f)[ITEMS.core.id];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "docket-core-due"]);
  const d = it.disposition;
  assert.deepEqual([d.available, d.op, d.scope, d.key, d.reason, d.instead],
    [false, null, null, null, "an_obligation_is_resolved_not_disposed", ["docketprepare", "docketdecline"]]);
  assert.match(d.detail, /an item the docket of a case you manage must list, keyed by the case, the item's kind and what it refers to rather than by a task: it stays until it is done/);
  assert.match(d.detail, /op=docketprepare.*op=docketdecline/);
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-A"], "homed by R7's walk");
  // each item's doors are its own list: changing one answer's changes no other's, nor the next feed's
  d.instead.push("tampered");
  assert.deepEqual(byId(w.feed("alice"))[ITEMS.core.id].disposition.instead, ["docketprepare", "docketdecline"]);
  assert.ok(Object.isFrozen(Queue.OBLIGATION_DOORS["docket-core-due"]));
});

test("R19, R26, R28, R31, R50: docket-core-due is refused KIND_NOT_PERSONAL by kind and by id, no row suppresses it, and the bridge names its doors", () => {
  const w = withT27();
  for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-A", kinds: ["docket-core-due"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.core.id })])
    assert.deepEqual([r.ok, r.reason, r.kind_class, r.check, r.translation],
      [false, "KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27", QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.translation]);
  assert.equal(w.all(`SELECT count(*) c FROM queue_state`)[0].c + w.all(`SELECT count(*) c FROM queue_item_mutes`)[0].c, 0);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice', ?, 'OBLIGATION', ?)`, ITEMS.core.id, iso(NOW));
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-A','docket-core-due')`);
  const f = w.feed("alice");
  assert.ok(byId(f)[ITEMS.core.id], "rows naming it suppress none");
  assert.ok(f.mute.suppressed.every((s) => s.id !== ITEMS.core.id));
  const refused = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-A", kinds: [] });
  assert.ok(!refused.available.includes("docket-core-due"), "not among the kinds a member may quiet");
  const instead = byId(f)[ITEMS.core.id].disposition.instead;
  for (const key of [ITEMS.core.id, ITEMS.core.id.slice("OBLIGATION::".length)]) {
    const r = w.q.proposeDispose({ key, to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
    assert.deepEqual([r.ok, r.reason, r.class, r.kind, r.instead, r.check], [false, "CLASS_NOT_DISPOSED", "OBLIGATION", "docket-core-due", instead, "C-33.44"], key);
  }
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0, "nothing written");
});

test("R1, R11, R12, R50: edition-withdrawn and edition-contested take R12's project-scoped disposition with reevaluationrecord; with no project home, no scope", () => {
  const w = withT27();
  const items = byId(w.feed("alice"));
  for (const k of ["withdrawn", "contested"]) {
    const it = items[ITEMS[k].id];
    assert.equal(it.class, "FINDING", k);
    const d = it.disposition;
    assert.deepEqual([d.available, d.op, d.scope, d.key, d.finding, d.projects, d.requires, d.acts, d.keyed_on],
      [true, "proposedispose", "project", null, ITEMS[k].id, ["PRJ-A", "PRJ-B"], ["project", "finding"], ["reevaluationrecord"],
       ["project", "finding"]], k);
  }
  const lone = items[ITEMS.lone.id].disposition;
  assert.deepEqual([lone.available, lone.reason, lone.projects, lone.acts], [false, "no_project_scope", [], ["reevaluationrecord"]]);
  // the same act side-corrected names (R46): one list, five kinds (the two cited-edition kinds since N547)
  assert.deepEqual(Object.keys(Queue.FINDING_ACTS).sort(),
    ["cited-edition-withdrawn", "cited-newer-edition", "edition-contested", "edition-withdrawn", "side-corrected"]);
  // negative control: a FINDING of another kind with no progression stage names no act
  assert.equal(items[ITEMS.released.id].disposition.acts, undefined);
});

test("R13, R27, R50: one project's set-aside of edition-withdrawn ages it for that project alone; both deciding, it leaves the items", () => {
  const w = withT27();
  const pd = (project) => w.q.proposeDispose({ project, finding: ITEMS.withdrawn.id, kind: "edition-withdrawn", to: "deferred",
    reason: "after re-reading", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
  assert.equal(pd("PRJ-A").ok, true);
  let f = w.feed("alice"), it = byId(f)[ITEMS.withdrawn.id];
  assert.deepEqual([it.case.ancestors.map((a) => a.id), it.disposition.projects, it.disposition.disposed_by],
    [["PRJ-B"], ["PRJ-B"], ["PRJ-A"]]);
  assert.deepEqual(it.disposition.acts, ["reevaluationrecord"], "the act is kept beside the narrowed homes");
  assert.equal(pd("PRJ-B").ok, true);
  f = w.feed("alice");
  assert.equal(byId(f)[ITEMS.withdrawn.id], undefined);
  assert.equal(f.disposed.findings.filter((d) => d.finding === ITEMS.withdrawn.id).length, 2);
  assert.ok(byId(f)[ITEMS.contested.id], "the contested item is another finding, untouched");
});

test("R1, R11, R12, R14: litigation-hold-released mints as a FINDING with R12's project-scoped disposition, and a member quiets it for themselves alone", () => {
  const w = withT27();
  const it = byId(w.feed("alice"))[ITEMS.released.id];
  assert.deepEqual([it.class, it.kind], ["FINDING", "litigation-hold-released"]);
  const d = it.disposition;
  assert.deepEqual([d.available, d.scope, d.projects, d.requires], [true, "project", ["PRJ-A"], ["project", "finding"]]);
  const m = w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.released.id });
  assert.deepEqual([m.ok, m.form, m.item_class], [true, "item", "FINDING"]);
  const f = w.feed("alice");
  assert.equal(byId(f)[ITEMS.released.id], undefined);
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope]), [[ITEMS.released.id, "item"]]);
  assert.ok(byId(w.feed("bob"))[ITEMS.released.id], "a mute is personal");
  const byKind = w.q.queueMute({ member: "bob", viewer: "member:bob", case: "PRJ-A", kinds: ["litigation-hold-released", "edition-contested"] });
  assert.deepEqual([byKind.ok, byKind.muted_kinds], [true, ["edition-contested", "litigation-hold-released"]]);
});

test("R11 (negative controls): each T27 kind minted under another class is KIND_MISCLASSED, and a near-miss of its name NO_SUCH_KIND", () => {
  for (const [it, wrong] of [[ITEMS.core, "FINDING"], [ITEMS.withdrawn, "OBLIGATION"], [ITEMS.contested, "CONDITION"],
                             [ITEMS.released, "OBLIGATION"]]) {
    const r = withT27([{ ...it, class: wrong }]).feed(null, "class:admin");
    assert.deepEqual([r.ok, r.reason, r.check, r.catalogued_as, r.minted_as], [false, "KIND_MISCLASSED", "C-31.3", it.class, wrong], it.kind);
  }
  for (const kind of ["docket-core", "edition-withdrawal", "edition-contest", "litigation-hold-release"]) {
    const r = withT27([{ ...ITEMS.core, kind }]).feed(null, "class:admin");
    assert.deepEqual([r.ok, r.reason, r.check, r.translation], [false, "NO_SUCH_KIND", "C-31.2", QUEUE_MINT_CHECKS.NO_SUCH_KIND.translation], kind);
  }
});

test("R8 (N520): docket is among the providers queue hands queue-producers, and queue calls none of its reads", () => {
  assert.ok(Queue.PRODUCER_DEPS.includes("docket"));
  assert.ok(Object.isFrozen(Queue.PRODUCER_DEPS));
  const w = withT27(Object.values(ITEMS), { docket: { coreDue: () => { throw new Error("queue called docket.coreDue"); } } });
  assert.throws(() => w.fakes.docket.coreDue({}), /queue called/, "the throwing fake is the one queue holds");
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.core.id }).reason, "KIND_NOT_PERSONAL");
  assert.equal(w.q.proposeDispose({ key: ITEMS.core.id, to: "deferred", reason: "r", decidedBy: "alice",
                                    viewer: "member:alice", identity: "member:alice" }).reason, "CLASS_NOT_DISPOSED");
});

test("R1, R8, R11, R12 (N518): a fake actions.holdsReleased reaches the real queue-producers R29, whose litigation-hold-released item passes the mint as a FINDING; answering none, no item", () => {
  const asked = [];
  const releases = (items) => ({ holdsReleased: (a) => { asked.push(a.viewer); return { ok: true, items, limit: 500, truncated: false, cursor: null }; } });
  const release = { action: "ACT-1", ord: 2, seq: 4, released_by: "bob", released_at: iso(NOW - 5000), reason: "the matter settled",
                    placers: ["carol"], restarted: [] };
  const w = world({ actions: releases([release]) });
  w.member("alice", { role: "admin" }); w.member("bob"); w.member("carol"); w.bundle("ACT-1", "action");
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const it = byId(f)["FINDING::litigation-hold-released::ACT-1::2::4"];
  assert.ok(it, "the fake's release reached R29's item and the mint accepted it");
  assert.deepEqual([it.class, it.kind, it.disposition.scope], ["FINDING", "litigation-hold-released", "project"]);
  assert.ok(byId(w.feed("carol"))["FINDING::litigation-hold-released::ACT-1::2::4"], "the placer is told too");
  assert.ok(asked.includes("member:alice"));
  // negative control: answering no release, the same feed carries none
  const none = world({ actions: releases([]) });
  none.member("alice", { role: "admin" }); none.bundle("ACT-1", "action");
  assert.equal(none.feed("alice").items.filter((i) => i.kind === "litigation-hold-released").length, 0);
});
