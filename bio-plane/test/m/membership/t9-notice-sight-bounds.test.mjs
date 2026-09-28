/* T9's share beyond R78: N123 (the revocation notice, under R8 and R20), N142 (`inSight`, R43–R44's FULL as a named
   service) and N70 (bounds on R11's history, R19's pairings, and the votes behind R39's and R40's deciders). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../checks/bio-checks.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

test("R20 R8 (N123) onRevoked: registered once per module; malformed and second registrations refused, nothing registered", async () => {
  const w = world();
  for (const [module, fn] of [[null, () => {}], ["", () => {}], [7, () => {}], ["capture-sources", null],
                              ["capture-sources", "fn"], [undefined, undefined]]) {
    const r = w.m.onRevoked(module, fn);
    assert.deepEqual([r.ok, r.reason, r.code], [false, "LISTENER_MALFORMED", "LISTENER_MALFORMED"], JSON.stringify(module));
    assert.equal(typeof r.detail, "string");
  }
  assert.deepEqual(w.m.onRevoked("capture-sources", () => {}), { ok: true, module: "capture-sources" });
  const again = w.m.onRevoked("capture-sources", () => {});
  assert.deepEqual([again.ok, again.reason, again.code, again.module], [false, "LISTENER_DECLARED", "LISTENER_DECLARED",
    "capture-sources"]);
  assert.deepEqual(w.m.onRevoked("another", () => {}).ok, true);
});

test("R20 R8 (N123) a revocation notifies every listener once, inside the act, after its writes; nothing else notifies", async () => {
  const w = await world().group("ann", "bob");
  const heard = [];
  const seen = [];
  w.m.onRevoked("capture-sources", (n) => {
    heard.push(["capture-sources", n]);
    // after the act's writes: the member is revoked, sessions ended and keys revoked when the listener runs
    seen.push([w.m.memberFacts(n.memberId).status, w.row(`SELECT COUNT(*) AS n FROM sessions WHERE role=?`, `member:${n.memberId}`).n,
               w.row(`SELECT COUNT(*) AS n FROM signers WHERE member_id=? AND status='active'`, n.memberId).n]);
  });
  w.m.onRevoked("second-module", (n) => { heard.push(["second-module", n]); });
  await w.m.login({ role: "member:ann", password: "ann-passphrase-x" });
  w.m.signerAdd({ keyB64: "AAAAannkey", memberId: "ann", by: "admin" });
  const r = w.m.memberSet({ memberId: "ann", status: "revoked", by: "second" });
  assert.equal(r.ok, true);
  assert.deepEqual(heard.map(([mod, n]) => [mod, n.memberId, n.by]), [["capture-sources", "ann", "second"], ["second-module", "ann", "second"]],
    "once per listener, in the order they registered");
  assert.match(heard[0][1].at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(Object.keys(heard[0][1]).sort(), ["at", "by", "memberId"]);
  assert.deepEqual(seen, [["revoked", 0, 0]]);
  // no notice: a revoked member revoked again, a reactivation, a refused revocation, an unrelated act
  heard.length = 0;
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  w.m.memberSet({ memberId: "second", status: "revoked", by: "admin" });            // ADMIN_REQUIRES_VOTE
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "bob" });                 // NOT_AN_ADMIN
  w.m.memberCaps({ memberId: "bob", capabilities: ["publish"], by: "admin" });
  assert.deepEqual(heard, []);
  // an unstamped revocation names no actor
  w.m.memberSet({ memberId: "bob", status: "revoked" });
  assert.deepEqual(heard.map(([, n]) => [n.memberId, n.by]), [["bob", null], ["bob", null]]);
});

test("R8 (N123) a carried administrator removal notifies with the completing voter; a vote short of it does not", async () => {
  const w = await world().group();
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  await w.m.enroll({ invite: e.invite, handle: "third", password: "third-passphrase-x" });
  const heard = [];
  w.m.onRevoked("capture-sources", (n) => heard.push(n));
  assert.equal(w.m.adminRemove({ memberId: "third", by: "admin", reason: "one" }).reason, "VOTES_SHORT");
  assert.deepEqual(heard, []);
  assert.equal(w.m.adminRemove({ memberId: "third", by: "second", reason: "two" }).ok, true);
  assert.deepEqual(heard.map((n) => [n.memberId, n.by]), [["third", "second"]]);
});

test("R20 R8 (N123) a listener that throws or rejects changes neither the revocation, its answer, nor another's notice", async () => {
  const plain = await world().group("ann");
  const want = plain.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  const w = await world().group("ann");
  const heard = [];
  w.m.onRevoked("throws", () => { throw new Error("listener failed"); });
  w.m.onRevoked("rejects", () => Promise.reject(new Error("async listener failed")));
  w.m.onRevoked("answers", () => ({ ok: false, reason: "IGNORED" }));
  w.m.onRevoked("hears", (n) => heard.push(n.memberId));
  const got = w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.deepEqual(got, want, "the answer is the one given with no listener");
  assert.deepEqual(heard, ["ann"]);
  assert.deepEqual(w.m.memberFacts("ann").status, "revoked");
  await new Promise((r) => setTimeout(r, 10));   // a rejected promise is caught, never an unhandled rejection
});

test("R43 R44 (N142) inSight: true exactly for a held bundle R43 admits the viewer to (FULL); total, and writes nothing", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.bundle("INFO-I");
  w.project("PROJ-H", "Hidden H");
  w.project("PROJ-D", "Discoverable D");
  for (const p of ["PROJ-H", "PROJ-D"]) w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  const cases = [
    ["INFO-I", V("cal"), true], ["PROJ-H", V("ann"), true], ["PROJ-H", V("bob"), true, "invited"],
    ["PROJ-H", V("cal"), false], ["PROJ-D", V("cal"), false, "EXISTENCE is not FULL"],
    ["PROJ-H", V("second"), true, "an administrator"], ["PROJ-H", "admin", true, "the founder"],
    ["PROJ-NEVER", V("ann"), false], ["PROJ-NEVER", "admin", false, "absent for everyone"],
    ["PROJ-H", "junk", false], ["INFO-I", "junk", false], ["INFO-I", null, false],
  ];
  for (const cls of ["admin", "member", "probe", "daemon", "ai"]) cases.push(["PROJ-H", `${MACHINE_CLASS_PREFIX}${cls}`, true, cls]);
  for (const [id, v, want, why] of cases) {
    assert.equal(w.m.inSight(id, v), want, `${id} ${v} ${why ?? ""}`);
    assert.equal(w.m.inSight(id, v), w.m.sight(id, v) === Membership.SIGHT_FULL, `agrees with sight: ${id} ${v}`);
  }
  const before = snapshot(w);
  for (const id of [null, undefined, "", 0, 42, {}, [], true, "x'; DROP TABLE members; --"])
    for (const v of [V("ann"), "admin", null, {}, [], 7]) {
      assert.doesNotThrow(() => w.m.inSight(id, v), `${JSON.stringify(id)} ${JSON.stringify(v)}`);
      if (typeof id !== "string" || !id) assert.equal(w.m.inSight(id, v), false);
      assert.doesNotThrow(() => w.m.sight(id, v));
    }
  assert.equal(snapshot(w), before, "writes nothing");
});

test("R11 (N70) hostingAccess is bounded and says so: limit lowered never raised, truncated measured, current the latest", async () => {
  const w = await world().group();
  const empty = w.m.hostingAccess();
  assert.deepEqual([empty.recorded, empty.current, empty.history, empty.limit, empty.truncated],
    [false, null, [], Membership.HOSTING_ACCESS_LIMIT, false]);
  assert.equal(Membership.HOSTING_ACCESS_LIMIT, 200);
  for (let i = 1; i <= 4; i++) w.m.hostingAccessSet({ holders: `answer ${i}`, by: "admin" });
  const all = w.m.hostingAccess();
  assert.deepEqual([all.history.map((h) => h.holders), all.truncated, all.current.holders],
    [["answer 1", "answer 2", "answer 3", "answer 4"], false, "answer 4"]);
  const two = w.m.hostingAccess({ limit: 2 });
  assert.deepEqual([two.history.map((h) => h.holders), two.limit, two.truncated, two.current.holders, two.recorded],
    [["answer 1", "answer 2"], 2, true, "answer 4", true], "the first records in order; current stays the latest");
  assert.equal(w.m.hostingAccess({ limit: 4 }).truncated, false, "measured by reading one past the cap");
  for (const [asked, cap] of [[10_000, 200], [0, 200], ["x", 200], [-3, 1], [null, 200]])
    assert.equal(w.m.hostingAccess({ limit: asked }).limit, cap, String(asked));
  assert.deepEqual(w.ops("limit=3").hostingaccess().history.length, 3, "the op passes limit");
});

test("R19 (N70) memberPairings is bounded and says so: the first limit by handle, truncated measured, never raised", async () => {
  const w = await world().group("ann", "bob", "cal");
  for (const id of ["ann", "bob", "cal"]) w.m.memberPairingSet({ memberId: id, published: true, by: id });
  const all = w.m.memberPairings();
  assert.deepEqual([all.pairings.map((p) => p.handle), all.limit, all.truncated], [["ann", "bob", "cal"], 200, false]);
  assert.equal(Membership.MEMBER_PAIRINGS_LIMIT, 200);
  const two = w.m.memberPairings({ limit: 2 });
  assert.deepEqual([two.pairings.map((p) => p.handle), two.limit, two.truncated], [["ann", "bob"], 2, true]);
  assert.equal(w.m.memberPairings({ limit: 3 }).truncated, false);
  assert.equal(w.m.memberPairings({ limit: 10_000 }).limit, 200);
  // the bound never widens what a viewer sees (R19): the administrator's view is cut, not the rule
  const adm = w.m.memberPairings({ administer: true, limit: 3 });
  assert.deepEqual([adm.pairings.map((p) => p.handle), adm.truncated], [["ann", "bob", "cal"], true]);
  const op = w.ops("limit=1").memberpairings();
  assert.deepEqual([op.pairings.length, op.truncated], [1, true]);
});

test("R39 R40 (N70) the votes behind the deciders are the current owners' only, read bounded by the owner count", async () => {
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  for (const h of ["bob", "cal", "dee", "eve"]) {
    w.m.projectInvite({ projectId: "PROJ-P", handle: h, by: "ann", viewer: V("ann") });
    w.m.projectJoin({ projectId: "PROJ-P", by: h, viewer: V(h) });
  }
  const add = (handle, by) => w.m.projectOwnerAdd({ projectId: "PROJ-P", handle, by, viewer: V(by) });
  add("bob", "ann");
  // a vote on record from a member who is not an owner (eve) never counts, whatever the table holds
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','add','cal','eve',NULL,'t')`);
  const c = add("cal", "ann");
  assert.deepEqual([c.reason, c.have, c.awaiting], ["CONSENSUS_REQUIRED", ["ann"], ["bob"]]);
  const d = add("cal", "bob");
  assert.deepEqual([d.ok, d.deciders], [true, ["ann", "bob"]], "eve's vote is not a decider");
  // removal at three: the target does not vote; a non-owner's vote on record never counts; reasons follow the voters
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','remove','cal','dee','from dee','t')`);
  const rm = (handle, by, reason) => w.m.projectOwnerRemove({ projectId: "PROJ-P", handle, by, reason, viewer: V(by) });
  const v1 = rm("cal", "ann", "a");
  assert.deepEqual([v1.reason, v1.have, v1.deciders], ["VOTES_SHORT", 1, ["ann"]]);
  const v2 = rm("cal", "bob", "b");
  assert.deepEqual([v2.ok, v2.deciders, v2.reasons], [true, ["ann", "bob"], ["a", "b"]]);
  const kept = w.m.projectParticipants({ projectId: "PROJ-P", by: "eve" }).ownership.at(-1);
  assert.deepEqual([kept.kind, kept.deciders, kept.reasons], ["remove", ["ann", "bob"], ["a", "b"]]);
});
