/* T50 (N1124, K3624): R152 `memberStatusSince`, the instant a member's status last changed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

test("R64 a member revoked at one instant answers it; a capability change after leaves it; a reinstatement answers its own later instant", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 9, 17, 12, 0, 0) });
  const w = await world().group("ann");
  const enrolled = w.m.memberStatusSince("ann");
  assert.equal(typeof enrolled, "string", "enrolment changed the status to active");
  t.mock.timers.tick(60_000);
  const t1 = new Date(Date.now()).toISOString();
  assert.equal(w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" }).ok, true);
  assert.equal(w.m.memberStatusSince("ann"), t1);
  t.mock.timers.tick(60_000);
  assert.equal(w.m.memberCaps({ memberId: "ann", capabilities: ["publish"], by: "admin" }).ok, true);
  w.m.memberPairingSet({ memberId: "ann", published: true, by: "admin" });
  assert.equal(w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" }).ok, true, "revoked again: no change");
  assert.equal(w.m.memberStatusSince("ann"), t1, "nothing but a status change moves it");
  t.mock.timers.tick(60_000);
  const t2 = new Date(Date.now()).toISOString();
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  assert.equal(w.m.memberStatusSince("ann"), t2);
  assert.notEqual(t2, t1);
});

test("R64 the other status writes record it: an endorsed invitation, a withdrawal, an enrolment", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 9, 17, 12, 0, 0) });
  const w = await world().group();
  const a = await w.m.memberAdd({ memberId: "bob", cover: "c", by: "admin" });
  assert.equal(w.m.memberStatusSince("bob"), null, "created invited: no change yet");
  t.mock.timers.tick(1000);
  const at = new Date(Date.now()).toISOString();
  assert.equal(w.m.inviteWithdraw({ memberId: "bob", by: "admin" }).ok, true);
  assert.equal(w.m.memberStatusSince("bob"), at, "withdrawal");
  void a;
  const third = await w.m.memberAdd({ memberId: "cat", cover: "c", role: "admin", by: "second" });
  assert.equal(third.reason, "CONSENSUS_REQUIRED");
  t.mock.timers.tick(1000);
  const e = await w.m.adminEndorse({ memberId: "cat", by: "admin" });
  assert.equal(w.m.memberStatusSince("cat"), new Date(Date.now()).toISOString(), "proposed to invited");
  assert.equal(e.ok, true);
});

test("R64 controls: a member whose status was never changed since recording answers null; an unknown, empty or non-string id answers null; the founder, who has no row, answers null; it writes nothing", async () => {
  const w = await world().group();
  w.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('old','c','member','revoked','t','t')`);
  assert.equal(w.m.memberStatusSince("old"), null, "never back-filled");
  for (const id of ["nobody", "", null, undefined, 7, {}, "admin"]) assert.equal(w.m.memberStatusSince(id), null, String(id));
  const before = JSON.stringify(w.rows(`SELECT * FROM members`));
  w.m.memberStatusSince("old");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM members`)), before);
});
