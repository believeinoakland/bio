/* K921's two OBLIGATIONs at queue's interface, over a stubbed `queue-producers.feedItems` (its R8, R20, R21) minting each
   as its requirement keys it: `template-review-requested` and `local-fact-due` pass the mint (R1, R11), name the door
   each leaves by (R12) and the bridge names the same one (R28), and neither is ever muted (R19, R26, R31). queue hands
   `filingTemplates` and `localFacts` to the producers and calls neither (K921). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { Queue, QUEUE_ACT_CHECKS } from "../../../src/queue/index.mjs";

const ITEMS = {
  review: { id: "OBLIGATION::template-review-requested::TPL-1@2::alice", class: "OBLIGATION", kind: "template-review-requested",
            subject: { kind: "template_version", id: "TPL-1@2" }, home: "ACT-1", door: "templatereview",
            says: /keyed by the version and by you rather than by a task: it leaves when you review the version's present text \(op=templatereview\), or when the version is no longer in review/ },
  fact:   { id: "OBLIGATION::local-fact-due::calendar.holidays", class: "OBLIGATION", kind: "local-fact-due",
            subject: { kind: "bundle", id: "ACT-1" }, home: "ACT-1", door: "factconfirm",
            says: /keyed by the fact rather than by a task: it leaves when a member confirms or corrects the fact \(op=factconfirm\), or when no live action reads it/ },
};
const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
/* Providers queue must never call: each read they publish throws (plain methods, as the test world merges a fake over
   its defaults). */
const untouchable = (name, ...reads) =>
  Object.fromEntries(reads.map((r) => [r, () => { throw new Error(`queue called ${name}.${r}`); }]));

function withK921(fakes = {}) {
  const w = world({ ...fakes, producers: { feedItems: (a) => ({ facts: FACTS, items: Object.values(ITEMS).map(({ door, says, home, ...it }) => ({
    ...it, case: a.homesOf([home]), summary: it.kind, detail: null,
    basis: { source: "queue-producers", detail: "stubbed as its requirement keys it" },
    age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: "alice", assignee_role: null,
    options: a.optionsOf([home]) })) }) } });
  w.member("alice");
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice");
  w.bundle("ACT-1"); w.cite("PRJ-1", "ACT-1");
  return w;
}

test("R1, R11, R12: template-review-requested and local-fact-due are OBLIGATIONs that pass the mint, each disposition available: false with instead its own door, never taskresolve", () => {
  const w = withK921();
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const items = byId(f);
  for (const { id, kind, door, says } of Object.values(ITEMS)) {
    const it = items[id];
    assert.ok(it, id);
    assert.deepEqual([it.class, it.kind], ["OBLIGATION", kind], id);
    const d = it.disposition;
    assert.deepEqual([d.available, d.op, d.scope, d.key, d.reason, d.instead],
      [false, null, null, null, "an_obligation_is_resolved_not_disposed", door], id);
    assert.match(d.detail, says, id);
    assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-1"], "homed by R7's walk");
  }
  assert.equal(f.counts.obligation, 2);
});

test("R12, R28: the bridge answers each kind's key CLASS_NOT_DISPOSED with the same instead as the item's disposition; nothing written", () => {
  const w = withK921();
  const items = byId(w.feed("alice"));
  for (const { id, kind, door } of Object.values(ITEMS)) {
    const instead = items[id].disposition.instead;
    assert.equal(instead, door, id);
    for (const key of [id, id.slice("OBLIGATION::".length)]) {
      const r = w.q.proposeDispose({ key, to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
      assert.deepEqual([r.ok, r.reason, r.class, r.kind, r.instead, r.check, r.translation],
        [false, "CLASS_NOT_DISPOSED", "OBLIGATION", kind, instead, "C-33.44", QUEUE_ACT_CHECKS.CLASS_NOT_DISPOSED.translation], key);
    }
  }
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0, "nothing written");
});

test("R19, R26, R31: each is refused KIND_NOT_PERSONAL by kind and by its published id, and no row suppresses it", () => {
  const w = withK921();
  for (const { id, kind } of Object.values(ITEMS)) {
    for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: [kind] }),
                     w.q.queueMute({ member: "alice", viewer: "member:alice", item: id })])
      assert.deepEqual([r.ok, r.reason, r.kind_class, r.check], [false, "KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27"], id);
    w.run(`INSERT INTO queue_item_mutes VALUES ('alice', ?, 'OBLIGATION', ?)`, id, iso(NOW));
  }
  assert.equal(w.all(`SELECT count(*) c FROM queue_state`)[0].c, 0, "a refusal writes nothing");
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-1','local-fact-due,template-review-requested')`);
  const f = w.feed("alice");
  assert.equal(f.counts.obligation, 2, "rows naming them suppress none");
  assert.equal(f.mute.suppressed.length, 0);
  // neither is offered among the kinds a member may mute
  const refused = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: [] });
  for (const { kind } of Object.values(ITEMS)) assert.ok(!refused.available.includes(kind), kind);
});

test("R8 (K921): filingTemplates and localFacts are among the providers queue hands queue-producers, and queue calls neither", () => {
  assert.ok(Queue.PRODUCER_DEPS.includes("filingTemplates"));
  assert.ok(Queue.PRODUCER_DEPS.includes("localFacts"));
  assert.ok(Object.isFrozen(Queue.PRODUCER_DEPS));
  // given providers that throw on any call, the feed and the acts complete: queue itself reads neither
  const w = withK921({ filingTemplates: untouchable("filingTemplates", "reviewsRequested"),
                      localFacts: untouchable("localFacts", "factsDue") });
  assert.throws(() => w.fakes.filingTemplates.reviewsRequested({}), /queue called/, "the throwing fake is the one queue holds");
  assert.throws(() => w.fakes.localFacts.factsDue({}), /queue called/);
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.equal(f.counts.obligation, 2);
  assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.fact.id }).reason, "KIND_NOT_PERSONAL");
  assert.equal(w.q.proposeDispose({ key: ITEMS.review.id, to: "deferred", reason: "r", decidedBy: "alice",
                                    viewer: "member:alice", identity: "member:alice" }).reason, "CLASS_NOT_DISPOSED");
});
