import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

test("R12 memberAdd: NOT_AN_ADMIN for a non-administrator member, a machine credential accepted; refusals in order", async () => {
  const w = await world().group("ann");
  assert.equal((await w.m.memberAdd({ memberId: "bad id", cover: "c", by: "ann" })).reason, "NOT_AN_ADMIN");
  const machine = await w.m.memberAdd({ memberId: "mach", cover: "c", by: "class:admin" });
  assert.equal(machine.ok, true);
  assert.equal(w.row(`SELECT invited_by FROM members WHERE member_id='mach'`).invited_by, "class:admin");
  for (const id of ["a", "-ab", "Ab", "a_b", "a".repeat(42), "", null])
    assert.equal((await w.m.memberAdd({ memberId: id, cover: "c", by: "admin" })).reason, "BAD_MEMBER_ID", String(id));
  assert.equal((await w.m.memberAdd({ memberId: "a".repeat(41), cover: "c", by: "admin" })).ok, true);
  assert.equal((await w.m.memberAdd({ memberId: "admin", cover: "c", by: "admin" })).reason, "MEMBER_ID_RESERVED");
  assert.equal((await w.m.memberAdd({ memberId: "ok1", by: "admin" })).reason, "NO_COVER");
  assert.equal((await w.m.memberAdd({ memberId: "ok1", name: "a name is not a cover", by: "admin" })).reason, "NO_COVER");
  assert.equal((await w.m.memberAdd({ memberId: "ann", cover: "c", by: "admin" })).reason, "EXISTS");
  assert.equal((await w.m.memberAdd({ memberId: "ok2", cover: "c", expertise: ["CPA"], by: "admin" })).reason,
    "EXPERTISE_IS_NOT_ASSIGNED");
  const early = world();
  await early.claim();
  assert.equal((await early.m.memberAdd({ memberId: "ee", cover: "c", by: "admin" })).reason, "ADMINS_FIRST");
});

test("R13 an ordinary member (or an admin below two) is invited once: invited_by, status_by, capabilities, hash only", async () => {
  const w = world();
  await w.claim();
  const s = await w.m.memberAdd({ memberId: "second", cover: "c", role: "admin", by: "admin" });
  assert.deepEqual([s.ok, s.role], [true, "admin"]);
  assert.equal(w.row(`SELECT status FROM members WHERE member_id='second'`).status, "invited");
  await w.m.enroll({ invite: s.invite, handle: "second", password: "second-passphrase-x" });
  const a = await w.m.memberAdd({ memberId: "ann", cover: "c", by: "second" });
  assert.deepEqual([a.ok, a.role, a.capabilities, a.invited_by], [true, "member", ["contribute"], "second"]);
  assert.match(a.invite, /^[0-9a-f]{32}$/);
  const b = await w.m.memberAdd({ memberId: "bob", cover: "c", capabilities: ["publish", "fly"], by: "second" });
  assert.deepEqual(b.capabilities, ["publish"]);
  const row = w.row(`SELECT * FROM members WHERE member_id='ann'`);
  assert.deepEqual([row.status, row.invited_by, row.status_by], ["invited", "second", "second"]);
  assert.notEqual(row.invite_hash, a.invite);
  assert.doesNotMatch(JSON.stringify(w.rows(`SELECT * FROM members`)), new RegExp(a.invite));
  assert.doesNotMatch(JSON.stringify(w.m.memberList({ administer: true })), new RegExp(a.invite), "never again");
});

test("R14 an administrator while two exist is proposed; the proposer endorses; no invitation exists yet", async () => {
  const w = await world().group();
  const p = await w.m.memberAdd({ memberId: "third", cover: "c", role: "admin", by: "second" });
  assert.deepEqual([p.ok, p.reason, p.proposed, p.have, p.awaiting], [false, "CONSENSUS_REQUIRED", true, ["second"], ["admin"]]);
  assert.equal(p.invite, undefined);
  const row = w.row(`SELECT status, invite_hash FROM members WHERE member_id='third'`);
  assert.deepEqual(row, { status: "proposed", invite_hash: null });
  const m = await w.m.memberAdd({ memberId: "fourth", cover: "c", role: "admin", by: "class:admin" });
  assert.deepEqual(m.have, [], "a machine credential records no endorsement");
});

test("R15 inviteLook gives cover, role, capabilities and expertise, never the member id; spent = never existed", async () => {
  const w = await world().group();
  const a = await w.m.memberAdd({ memberId: "ann", cover: "the CPA", capabilities: ["publish"], by: "admin" });
  const look = await w.m.inviteLook({ invite: a.invite });
  assert.deepEqual(look, { ok: true, cover: "the CPA", role: "member", capabilities: ["publish"], expertise: [] });
  assert.doesNotMatch(JSON.stringify(look), /"ann"/);
  const never = await w.m.inviteLook({ invite: "0".repeat(32) });
  const junk = await w.m.inviteLook({ invite: "not an invite" });
  await w.m.enroll({ invite: a.invite, handle: "ann", password: "ann-passphrase-x" });
  const spent = await w.m.inviteLook({ invite: a.invite });
  assert.deepEqual(spent, never);
  assert.deepEqual(junk, never);
  assert.equal(never.reason, "NO_SUCH_INVITATION");
});

test("R16 enroll: refusals in order; success activates, stamps the member, spends the invitation", async () => {
  const w = await world().group("taken");
  const a = await w.m.memberAdd({ memberId: "ann", cover: "c", capabilities: ["publish"], by: "admin" });
  assert.equal((await w.m.enroll({ invite: "f".repeat(32), handle: "ann", password: "x".repeat(12) })).reason, "NO_SUCH_INVITATION");
  assert.equal((await w.m.enroll({ invite: a.invite, handle: " ", password: "x".repeat(12) })).reason, "NO_HANDLE");
  assert.equal((await w.m.enroll({ invite: a.invite, handle: "Ann!", password: "x".repeat(12) })).reason, "BAD_HANDLE");
  assert.equal((await w.m.enroll({ invite: a.invite, handle: "taken", password: "x".repeat(12) })).reason, "HANDLE_TAKEN");
  assert.equal((await w.m.enroll({ invite: a.invite, handle: "ann-h", password: "x".repeat(11) })).reason, "PASSWORD_TOO_SHORT");
  const ok = await w.m.enroll({ invite: a.invite, handle: "ann-h", password: "x".repeat(12), cover: "mine", role: "admin",
    capabilities: ["create_projects"] });
  assert.deepEqual(ok, { ok: true, memberId: "ann", handle: "ann-h" });
  const row = w.row(`SELECT * FROM members WHERE member_id='ann'`);
  assert.deepEqual([row.status, row.status_by, row.handle, row.cover, row.role, row.invite_hash, row.capabilities],
    ["active", "ann", "ann-h", "c", "member", null, JSON.stringify(["publish"])]);
  assert.equal((await w.m.enroll({ invite: a.invite, handle: "again", password: "x".repeat(12) })).reason, "NO_SUCH_INVITATION");
  assert.equal((await w.m.login({ role: "member:ann", password: "x".repeat(12) })).ok, true);
});

test("R17 memberList: every stamp, expertise as R24; cover only under the administer stamp", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('old','c','member','invited','t','t')`);
  for (const administer of [undefined, false, "0", "yes"]) {
    const rows = w.m.memberList({ administer }).members;
    for (const r of rows) assert.ok(!("cover" in r), `cover present with administer=${administer}`);
  }
  for (const administer of [true, "1"]) {
    const rows = w.m.memberList({ administer }).members;
    assert.deepEqual(rows.map((r) => r.cover), ["cover of ann", "c", "cover of second"]);
  }
  const ann = w.m.memberList({}).members.find((r) => r.member_id === "ann");
  assert.deepEqual([ann.handle, ann.role, ann.status, ann.status_by, ann.invited_by, ann.capabilities],
    ["ann", "member", "active", "ann", "admin", ["contribute"]]);
  assert.deepEqual(ann.expertise, w.m.expertiseList({ memberId: "ann" }).expertise);
  const old = w.m.memberList({}).members.find((r) => r.member_id === "old");
  assert.deepEqual([old.status_by, old.invited_by, old.handle], ["not recorded", "not recorded", null]);
  assert.equal(w.ops("administer=1").memberlist().members[0].cover, "cover of ann");
  assert.ok(!("cover" in w.ops("").memberlist().members[0]));
});

test("R18 each row of an administrator's roster lists that member's projects", async () => {
  const w = await world().group("ann", "bob");
  w.project("PROJ-1");
  w.project("PROJ-2");
  w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-1", handle: "bob", by: "ann" });
  w.m.projectClaimOwner({ projectId: "PROJ-2", memberId: "bob" });
  const rows = w.m.memberList({ administer: true }).members;
  const of = (id) => rows.find((r) => r.member_id === id).projects;
  assert.deepEqual(of("ann"), [{ project: "PROJ-1", state: "joined", owner: true }]);
  assert.deepEqual(of("bob"), [{ project: "PROJ-1", state: "invited", owner: false },
                               { project: "PROJ-2", state: "joined", owner: true }]);
  assert.deepEqual(of("second"), []);
  for (const r of w.m.memberList({}).members) assert.ok(!("projects" in r), "an ordinary roster lists none");
});

test("R19 publishing a pairing is the member's or an administrator's per-member setting", async () => {
  const w = await world().group("ann", "bob");
  assert.deepEqual(w.m.memberPairings().pairings, []);
  assert.equal(w.m.memberPairingSet({ memberId: "nobody", published: true, by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.memberPairingSet({ memberId: "ann", published: true, by: "bob" }).reason, "PAIRING_NOT_YOURS");
  assert.equal(w.m.memberPairingSet({ memberId: "ann", published: true, by: "ann" }).ok, true);
  assert.equal(w.ops("by=second", { memberId: "bob", published: true }).memberpairingset().ok, true);
  assert.deepEqual(w.ops().memberpairings().pairings, [{ handle: "ann", cover: "cover of ann" }, { handle: "bob", cover: "cover of bob" }]);
  assert.equal(w.m.memberList({}).members.find((r) => r.member_id === "ann").pairing_published, true);
  w.m.memberPairingSet({ memberId: "bob", published: false, by: "bob" });
  assert.deepEqual(w.m.memberPairings().pairings.map((p) => p.handle), ["ann"]);
  for (const r of w.m.memberList({}).members) assert.ok(!("cover" in r), "R17 still holds for the roster");
});
