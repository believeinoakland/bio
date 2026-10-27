/* R76 (T51; C80; K4165, K4168; DEC-376): once the instance is claimed the founder is a member for memberFacts,
   expertiseDeclare, expertiseConfirm and expertiseHolders; unclaimed she is none of them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

test("R76 claimed: memberFacts('admin') answers the founder, with and without a held handle; unclaimed it is null", async () => {
  const w = world();
  assert.equal(w.m.memberFacts("admin"), null, "control: unclaimed she is no member");
  await w.claim();
  assert.deepEqual(w.m.memberFacts("admin"), { cover: null, handle: null, role: "admin", status: "active" });
  assert.equal(w.m.founderHandleSet({ handle: "steward", by: "admin" }).ok, true);
  assert.deepEqual(w.m.memberFacts("admin"), { cover: null, handle: "steward", role: "admin", status: "active" });
  assert.equal(w.m.memberFacts("nobody"), null, "control: another id with no row is still null");
  w.creds.claimed = false;
  assert.equal(w.m.memberFacts("admin"), null, "control: the answer follows the claim, not a stored row");
});

test("R76 the founder declares her own expertise, an administrator confirms it, and expertiseList reads it back", async () => {
  const w = await world().group();
  const d = w.m.expertiseDeclare({ memberId: "admin", label: "  Civil   Engineer " });
  assert.deepEqual([d.ok, d.memberId, d.label, d.state], [true, "admin", "Civil Engineer", "declared"]);
  assert.equal(w.m.expertiseDeclare({ memberId: "admin", label: "Civil Engineer" }).reason, "ALREADY_DECLARED", "R17's rule holds for her");
  assert.equal(w.m.expertiseDeclare({ memberId: "admin", label: "" }).reason, "EXPERTISE_NO_LABEL");
  assert.equal(w.m.expertiseConfirm({ memberId: "admin", label: "Lawyer", by: "second" }).reason, "NOT_DECLARED", "R18's rule holds for her");
  assert.equal(w.m.expertiseConfirm({ memberId: "admin", label: "Civil Engineer", by: "admin" }).ok, true, "an administrator may confirm for the founder, herself included");
  const l = w.m.expertiseList({ memberId: "admin" }).expertise;
  assert.deepEqual(l.map((e) => [e.label, e.state, e.confirmed, e.by, e.history.map((h) => h.event)]),
    [["Civil Engineer", "confirmed", true, "admin", ["declared", "confirmed"]]]);
  assert.equal(w.row(`SELECT actor FROM member_expertise WHERE member_id='admin' ORDER BY seq LIMIT 1`).actor, "admin");
  assert.equal(w.row(`SELECT count(*) AS n FROM members WHERE member_id='admin'`).n, 0, "she still has no members row");
});

test("R76 expertiseHolders lists the founder among the holders, in member-id order; a withdrawn one is not held", async () => {
  const w = await world().group("ann", "bob");
  w.m.founderHandleSet({ handle: "steward", by: "admin" });
  for (const id of ["bob", "admin", "ann"]) w.m.expertiseDeclare({ memberId: id, label: "CPA" });
  w.m.expertiseConfirm({ memberId: "admin", label: "CPA", by: "second" });
  assert.deepEqual(w.m.expertiseHolders("CPA").map((h) => [h.memberId, h.handle, h.state]),
    [["admin", "steward", "confirmed"], ["ann", "ann", "declared"], ["bob", "bob", "declared"]]);
  w.m.expertiseConfirm({ memberId: "admin", label: "CPA", by: "second", withdraw: true });
  assert.deepEqual(w.m.expertiseHolders("CPA").map((h) => h.memberId), ["ann", "bob"], "control: her withdrawn entry is not held");
  w.creds.claimed = false;
  w.m.expertiseDeclare({ memberId: "ann", label: "Architect" });
  assert.deepEqual(w.m.expertiseHolders("CPA").map((h) => h.memberId), ["ann", "bob"], "control: unclaimed she is never listed");
});

test("R76 unclaimed: expertiseDeclare and expertiseConfirm for 'admin' are refused NO_SUCH_MEMBER; a revoked member and an unknown id are as before", async () => {
  const w = world();
  await w.enrol("a1", "admin", null);                      // an administrator while unclaimed
  await w.enrol("ann", "member", "a1");
  assert.equal(w.m.expertiseDeclare({ memberId: "admin", label: "CPA" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.expertiseConfirm({ memberId: "admin", label: "CPA", by: "a1" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.row(`SELECT count(*) AS n FROM member_expertise`).n, 0, "nothing was written");
  assert.equal(w.m.expertiseDeclare({ memberId: "nobody", label: "CPA" }).reason, "NO_SUCH_MEMBER");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "a1" });
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "CPA" }).reason, "NOT_ACTIVE");
});

test("R76 a members row that holds the id admin (R9's audit finding) is read as it is, never replaced by the founder's answer", async () => {
  const w = await world().group();
  w.sql.exec(`INSERT INTO members (member_id, cover, role, status, handle, created, updated) VALUES ('admin','legacy cover','member','revoked','legacy','2026-01-01','2026-01-01')`);
  assert.deepEqual(w.m.memberFacts("admin"), { cover: "legacy cover", handle: "legacy", role: "member", status: "revoked" });
  assert.equal(w.m.expertiseDeclare({ memberId: "admin", label: "CPA" }).reason, "NOT_ACTIVE");
});
