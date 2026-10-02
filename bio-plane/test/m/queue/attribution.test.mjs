/* `attribution-unchosen` (queue-producers R23; DEC-102 item 3, K1019) at queue's interface, over a stubbed
   `queue-producers.feedItems` minting it as its requirement keys it: the kind is catalogued as an OBLIGATION (R1), so a
   feed holding one is minted rather than refused NO_SUCH_KIND (R11), its disposition names `attribute` as its door
   (R12; publication R17) and the bridge names the same one (R28), and it is never muted (R19, R26, R31). Negative
   controls: the same item under a kind the catalogue does not name is the feed refused whole, as every such feed was
   before R1 named this one, and minted as another class it is refused KIND_MISCLASSED. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_ACT_CHECKS, QUEUE_MINT_CHECKS } from "../../../src/queue/index.mjs";
import { classOfKind, QUEUE_OBLIGATION_KINDS } from "../../../src/queuestate.mjs";

const ID = "OBLIGATION::attribution-unchosen::CASE-1@2::OBS-7";
const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
const credit = (over = {}) => ({ id: ID, class: "OBLIGATION", kind: "attribution-unchosen",
  subject: { kind: "case_edition", id: "CASE-1@2", observation: "OBS-7" }, summary: "choose a credit level",
  detail: null, basis: { source: "publication", detail: "the edition's attribution facts" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: "alice", assignee_role: null, ...over });

function withCredit(over = {}) {
  const w = world({ producers: { feedItems: (a) => ({ facts: FACTS,
    items: [{ ...credit(over), options: a.optionsOf(["CASE-1"]), case: a.homesOf(["CASE-1"]) }] }) } });
  w.member("alice");
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.bundle("CASE-1"); w.cite("PRJ-1", "CASE-1");
  return w;
}

test("R1, R11, R12: a feed holding attribution-unchosen is minted, its disposition offering attribute as its door, never taskresolve", () => {
  assert.equal(classOfKind("attribution-unchosen"), "OBLIGATION");
  assert.match(QUEUE_OBLIGATION_KINDS["attribution-unchosen"], /you have chosen no credit level for it; choose one/);
  const f = withCredit().feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const it = byId(f)[ID];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "attribution-unchosen"]);
  const d = it.disposition;
  assert.deepEqual([d.available, d.op, d.scope, d.key, d.reason, d.instead],
    [false, null, null, null, "an_obligation_is_resolved_not_disposed", "attribute"]);
  assert.match(d.detail, /keyed by the edition and the observation rather than by a task: it leaves when you choose a credit level for it \(op=attribute\)/);
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-1"], "homed by R7's walk");
  assert.equal(f.counts.obligation, 1);
});

test("R11 (negative controls): under a kind the catalogue does not name the feed is refused whole NO_SUCH_KIND; minted as a FINDING it is KIND_MISCLASSED", () => {
  const unknown = withCredit({ kind: "attribution-unchosen-x" }).feed("alice");
  assert.deepEqual([unknown.ok, unknown.reason, unknown.check, unknown.translation, unknown.id],
    [false, "NO_SUCH_KIND", "C-31.2", QUEUE_MINT_CHECKS.NO_SUCH_KIND.translation, ID]);
  const misclassed = withCredit({ class: "FINDING", id: "FINDING::attribution-unchosen::CASE-1@2::OBS-7" }).feed("alice");
  assert.deepEqual([misclassed.ok, misclassed.reason, misclassed.catalogued_as, misclassed.minted_as],
    [false, "KIND_MISCLASSED", "OBLIGATION", "FINDING"]);
});

test("R12, R28: the bridge answers its key CLASS_NOT_DISPOSED with instead attribute, the item's own door; nothing written", () => {
  const w = withCredit();
  const instead = byId(w.feed("alice"))[ID].disposition.instead;
  for (const key of [ID, ID.slice("OBLIGATION::".length)]) {
    const r = w.q.proposeDispose({ key, to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
    assert.deepEqual([r.ok, r.reason, r.class, r.kind, r.instead, r.check, r.translation],
      [false, "CLASS_NOT_DISPOSED", "OBLIGATION", "attribution-unchosen", instead, "C-33.44", QUEUE_ACT_CHECKS.CLASS_NOT_DISPOSED.translation], key);
  }
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0);
});

test("R19, R26, R31: it is refused KIND_NOT_PERSONAL by kind and by its published id, and no row suppresses it", () => {
  const w = withCredit();
  for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["attribution-unchosen"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", item: ID })])
    assert.deepEqual([r.ok, r.reason, r.kind_class, r.check], [false, "KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27"]);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice', ?, 'OBLIGATION', ?)`, ID, iso(NOW));
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-1','attribution-unchosen')`);
  const f = w.feed("alice");
  assert.deepEqual(f.items.map((i) => i.id), [ID]);
  assert.equal(f.mute.suppressed.length, 0);
});
