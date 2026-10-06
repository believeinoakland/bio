/* `check-requested` (tasks R14; DEC-135 (2), T34-53) at queue's interface: an addressee's To do for a check request is a
   task of that kind in `tasks`, which the feed reads as any task (R8). Its kind is catalogued as an OBLIGATION (R1), so a
   feed holding one is minted rather than refused NO_SUCH_KIND (R11); its door is taskresolve, as for any task, with its
   detail naming the take and the record (R12), the bridge naming the same door (R28); and it is never muted (R19, R31).
   Negative control: the same task under a near-miss of the kind refuses the feed whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_ACT_CHECKS, QUEUE_MINT_CHECKS } from "../../../src/queue/index.mjs";
import { classOfKind } from "../../../src/queuestate.mjs";

const ID = "TASK-2026-0001-chk";

function withCheck(kind = "check-requested") {
  const w = world();
  w.member("alice"); w.member("bob");
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.bundle("DOC-1"); w.cite("PRJ-1", "DOC-1");
  w.task(ID, "DOC-1", { kind, assignee: "alice", role: "member" });
  return w;
}

test("R1, R8, R11, R12: an addressee's check request is a To do in their feed, minted, homed, its door taskresolve with the take named", () => {
  assert.equal(classOfKind("check-requested"), "OBLIGATION");
  const w = withCheck();
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const it = byId(f)[ID];
  assert.deepEqual([it.class, it.kind, it.assignee], ["OBLIGATION", "check-requested", "alice"]);
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-1"], "homed by R7's walk");
  const d = it.disposition;
  assert.deepEqual([d.available, d.reason, d.instead], [false, "an_obligation_is_resolved_not_disposed", "taskresolve"]);
  assert.match(d.detail, /take it \(op=checktake\) and record your check or a reasoned concern \(op=checkrecord\)/);
  assert.match(d.detail, /leaving it \(op=taskresolve\) closes only yours/);
  // addressed to alice alone: bob, a member of no project it reaches, is not told
  assert.equal(byId(w.feed("bob"))[ID], undefined);
});

test("R19, R26, R28, R31: a check request is refused KIND_NOT_PERSONAL by kind and by id, no row suppresses it, and the bridge names taskresolve", () => {
  const w = withCheck();
  for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["check-requested"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", item: ID })])
    assert.deepEqual([r.ok, r.reason, r.kind_class, r.check, r.translation],
      [false, "KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27", QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.translation]);
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-1','check-requested')`);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice', ?, 'OBLIGATION', ?)`, ID, iso(NOW));
  const f = w.feed("alice");
  assert.ok(byId(f)[ID], "rows naming it suppress none");
  assert.equal(f.mute.suppressed.length, 0);
  const r = w.q.proposeDispose({ key: `check-requested::${ID}`, to: "deferred", reason: "r", decidedBy: "alice",
                                 viewer: "member:alice", identity: "member:alice" });
  assert.deepEqual([r.reason, r.class, r.kind, r.instead], ["CLASS_NOT_DISPOSED", "OBLIGATION", "check-requested", "taskresolve"]);
});

test("R11 (negative control): the same task under a near-miss of the kind refuses the feed whole NO_SUCH_KIND", () => {
  const r = withCheck("check-request").feed("alice");
  assert.deepEqual([r.ok, r.reason, r.check, r.translation, r.id],
    [false, "NO_SUCH_KIND", "C-31.2", QUEUE_MINT_CHECKS.NO_SUCH_KIND.translation, ID]);
});
